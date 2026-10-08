import { NextRequest, NextResponse } from "next/server";
import WebSocket from "ws";
import crypto from "crypto";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

interface DiscordSession {
  sessionId: string;
  status: "initializing" | "pending" | "scanned" | "success" | "cancelled" | "expired" | "error";
  ws?: WebSocket;
  privateKey?: string;
  qrPayload?: string;
  qrCodeBase64?: string;
  createdAt: number;
  expiresAt: number;
  heartbeatTimer?: NodeJS.Timeout;
  account?: any;
  token?: string | null;
  scannedUser?: any;
  error?: string | null;
}

// Persist sessions in global memory across Next.js dev rebuilds and reloads
const sessionsMap: Map<string, DiscordSession> =
  (globalThis as any).__discordRemoteAuthSessions ||
  ((globalThis as any).__discordRemoteAuthSessions = new Map());

function cleanupSession(session: DiscordSession) {
  if (session.heartbeatTimer) {
    clearInterval(session.heartbeatTimer);
    session.heartbeatTimer = undefined;
  }
  if (session.ws) {
    try {
      if (session.ws.readyState === WebSocket.OPEN) {
        session.ws.close();
      }
    } catch {}
    session.ws = undefined;
  }
}

function startDiscordRemoteAuth(sessionId: string): Promise<DiscordSession> {
  return new Promise((resolve, reject) => {
    let resolved = false;

    // If existing active session, clean it up first
    const existing = sessionsMap.get(sessionId);
    if (existing) {
      cleanupSession(existing);
    }

    try {
      const ws = new WebSocket("wss://remote-auth-gateway.discord.gg/?v=2", {
        headers: {
          Origin: "https://discord.com",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      });

      const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "der" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
      });

      const encodedPublicKey = publicKey.toString("base64");
      const sessionData: DiscordSession = {
        sessionId,
        status: "initializing",
        ws,
        privateKey,
        createdAt: Date.now(),
        expiresAt: Date.now() + 120000, // 2 minutes expiry
      };

      sessionsMap.set(sessionId, sessionData);

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          sessionData.status = "error";
          sessionData.error = "Timeout waiting for Discord Gateway response";
          reject(new Error("Timeout initializing Discord Remote Auth"));
        }
      }, 15000);

      ws.on("open", () => {
        console.log(`[Discord Remote Auth] Session ${sessionId} connected to Discord Gateway`);
      });

      ws.on("message", async (data: Buffer | string) => {
        try {
          const msg = JSON.parse(data.toString());

          // 1. Initial Handshake & Heartbeat
          if (msg.op === "hello") {
            const interval = msg.heartbeat_interval || 41250;
            sessionData.heartbeatTimer = setInterval(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ op: "heartbeat" }));
              }
            }, interval);

            ws.send(
              JSON.stringify({
                op: "init",
                encoded_public_key: encodedPublicKey,
              })
            );
          }

          // 2. Proof of Possession (decrypt nonce with privateKey)
          else if (msg.op === "nonce_proof") {
            const encryptedNonce = Buffer.from(msg.encrypted_nonce, "base64");
            const decryptedNonce = crypto.privateDecrypt(
              { key: privateKey, oaepHash: "sha256" },
              encryptedNonce
            );
            const proof = crypto.createHash("sha256").update(decryptedNonce).digest("base64url");
            ws.send(JSON.stringify({ op: "nonce_proof", proof }));
          }

          // 3. Official Fingerprint received -> Render Official QR Code
          else if (msg.op === "pending_remote_init") {
            const qrPayload = `https://discord.com/ra/${msg.fingerprint}`;
            const qrCodeBase64 = await QRCode.toDataURL(qrPayload, {
              width: 320,
              margin: 2,
              color: { dark: "#5865F2", light: "#FFFFFF" },
            });

            sessionData.status = "pending";
            sessionData.qrPayload = qrPayload;
            sessionData.qrCodeBase64 = qrCodeBase64;
            sessionsMap.set(sessionId, sessionData);

            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              resolve(sessionData);
            }
          }

          // 4. Mobile User scanned QR Code with Discord app
          else if (msg.op === "pending_ticket") {
            try {
              const encryptedUser = Buffer.from(msg.encrypted_user_payload, "base64");
              const decryptedUser = crypto.privateDecrypt(
                { key: privateKey, oaepHash: "sha256" },
                encryptedUser
              );
              // Format is userId:discriminator:avatar:username
              const [userId, discriminator, avatar, username] = decryptedUser.toString().split(":");
              sessionData.status = "scanned";
              sessionData.scannedUser = {
                userId,
                discriminator,
                avatar: avatar ? `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png` : null,
                username,
              };
              sessionsMap.set(sessionId, sessionData);
              console.log(`[Discord Remote Auth] Scanned by ${username} (${userId})`);
            } catch (decErr) {
              console.warn("[Discord Remote Auth] Error decrypting user payload:", decErr);
            }
          }

          // 5. User tapped "Log in on Desktop" on phone! Exchange ticket for real token
          else if (msg.op === "pending_login") {
            const ticket = msg.ticket;
            console.log(`[Discord Remote Auth] User confirmed! Exchanging ticket...`);

            try {
              const loginRes = await fetch("https://discord.com/api/v10/users/@me/remote-auth/login", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                  Origin: "https://discord.com",
                },
                body: JSON.stringify({ ticket }),
              });

              if (loginRes.ok) {
                const loginData = await loginRes.json();
                const encryptedToken = Buffer.from(loginData.encrypted_token, "base64");
                const decryptedToken = crypto.privateDecrypt(
                  { key: privateKey, oaepHash: "sha256" },
                  encryptedToken
                ).toString();

                console.log(`[Discord Remote Auth] Real user token decrypted successfully!`);

                // Fetch real Discord user profile
                let account: any = sessionData.scannedUser || { username: "Discord User" };
                try {
                  const meRes = await fetch("https://discord.com/api/v10/users/@me", {
                    headers: { Authorization: decryptedToken },
                  });
                  if (meRes.ok) {
                    const meData = await meRes.json();
                    account = {
                      id: meData.id,
                      username: meData.username,
                      displayName: meData.global_name || meData.username,
                      avatar: meData.avatar
                        ? `https://cdn.discordapp.com/avatars/${meData.id}/${meData.avatar}.png`
                        : null,
                      email: meData.email,
                      phone: meData.phone,
                      verified: true,
                    };
                  }
                } catch (meErr) {
                  console.warn("[Discord Remote Auth] Failed to fetch /users/@me:", meErr);
                }

                sessionData.status = "success";
                sessionData.token = decryptedToken;
                sessionData.account = account;
                sessionsMap.set(sessionId, sessionData);

                cleanupSession(sessionData);
              } else {
                const errText = await loginRes.text();
                console.error("[Discord Remote Auth] Ticket exchange failed:", errText);
                sessionData.status = "error";
                sessionData.error = "Failed to exchange login ticket";
                cleanupSession(sessionData);
              }
            } catch (loginErr: any) {
              console.error("[Discord Remote Auth] Login error:", loginErr);
              sessionData.status = "error";
              sessionData.error = loginErr.message;
              cleanupSession(sessionData);
            }
          }

          // 6. User cancelled login on mobile
          else if (msg.op === "cancel") {
            sessionData.status = "cancelled";
            cleanupSession(sessionData);
          }
        } catch (err: any) {
          console.error("[Discord Remote Auth] Error handling gateway message:", err);
        }
      });

      ws.on("error", (err: Error) => {
        console.error(`[Discord Remote Auth] WS error for session ${sessionId}:`, err);
        sessionData.status = "error";
        sessionData.error = err.message;
        cleanupSession(sessionData);
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          reject(err);
        }
      });

      ws.on("close", () => {
        if (sessionData.status !== "success") {
          sessionData.status = "expired";
        }
        cleanupSession(sessionData);
      });
    } catch (e: any) {
      if (!resolved) {
        resolved = true;
        reject(e);
      }
    }
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const action = searchParams.get("action");

  // 1. Start new Remote Auth Session
  if (action === "start" || !sessionId) {
    const newSessionId = sessionId || `disc_ra_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    try {
      const session = await startDiscordRemoteAuth(newSessionId);
      return NextResponse.json({
        success: true,
        sessionId: session.sessionId,
        status: session.status,
        qrPayload: session.qrPayload,
        qrCodeBase64: session.qrCodeBase64,
        expiresAt: session.expiresAt,
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || "Failed to start Discord Remote Auth" },
        { status: 500 }
      );
    }
  }

  // 2. Poll existing session status
  const session = sessionsMap.get(sessionId);
  if (!session) {
    return NextResponse.json(
      { success: false, status: "expired", error: "Session not found or expired" },
      { status: 404 }
    );
  }

  // Check if expired
  if (Date.now() > session.expiresAt && session.status !== "success") {
    session.status = "expired";
    cleanupSession(session);
    return NextResponse.json({
      success: true,
      sessionId,
      status: "expired",
      message: "Discord QR code has expired. Please refresh.",
    });
  }

  return NextResponse.json({
    success: true,
    sessionId,
    status: session.status,
    qrPayload: session.qrPayload,
    qrCodeBase64: session.qrCodeBase64,
    scannedUser: session.scannedUser,
    account: session.account,
    token: session.token,
    error: session.error,
  });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  if (sessionId) {
    const session = sessionsMap.get(sessionId);
    if (session) {
      cleanupSession(session);
      sessionsMap.delete(sessionId);
    }
  }
  return NextResponse.json({ success: true, message: "Session closed" });
}
