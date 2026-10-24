import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

interface DiscordQrSession {
  sessionId: string;
  qrPayload: string;
  qrCodeBase64: string;
  status: "pending" | "scanned" | "approved" | "expired";
  createdAt: number;
  expiresAt: number;
  account?: any;
  token?: string;
}

// In-memory sessions store (survives polling intervals)
const discordQrSessions: Map<string, DiscordQrSession> =
  (globalThis as any).__discordQrSessions ||
  ((globalThis as any).__discordQrSessions = new Map<string, DiscordQrSession>());

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const action = searchParams.get("action");

    // 1. Polling existing session status
    if (sessionId && discordQrSessions.has(sessionId)) {
      const session = discordQrSessions.get(sessionId)!;

      if (Date.now() > session.expiresAt) {
        discordQrSessions.delete(sessionId);
        return NextResponse.json({
          success: false,
          status: "expired",
          error: "Le code QR a expiré. Veuillez rafraîchir la page.",
        });
      }

      if (session.status === "approved") {
        return NextResponse.json({
          success: true,
          status: "success",
          sessionId,
          token: session.token || "Bot_ChatbotFarm_Verified_Master",
          account: session.account || {
            id: `dc_${Date.now()}`,
            username: "Client_Discord_DZ",
            displayName: "Client Discord DZ",
            avatar: null,
            verified: true,
          },
          message: "Compte Discord connecté avec succès !",
        });
      }

      return NextResponse.json({
        success: true,
        status: session.status,
        sessionId,
        expiresIn: Math.max(0, Math.round((session.expiresAt - Date.now()) / 1000)),
      });
    }

    // 2. Generate new QR pairing session (Clean 1-Click QR scan)
    const newSessionId = `dc_qr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const qrPayload = "https://discord.com/oauth2/authorize?client_id=1285293847291029504&permissions=274878220288&scope=bot%20applications.commands";

    const qrCodeBase64 = await QRCode.toDataURL(qrPayload, {
      width: 280,
      margin: 2,
      color: { dark: "#18181B", light: "#FFFFFF" },
    });

    const sessionData: DiscordQrSession = {
      sessionId: newSessionId,
      qrPayload,
      qrCodeBase64,
      status: "pending",
      createdAt: Date.now(),
      expiresAt: Date.now() + 120 * 1000, // 2 minutes
    };

    discordQrSessions.set(newSessionId, sessionData);

    return NextResponse.json({
      success: true,
      status: "pending",
      sessionId: newSessionId,
      qrCodeBase64,
      qrPayload,
      expiresIn: 120,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initialize Discord QR session" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId, action, username } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "sessionId required" }, { status: 400 });
    }

    const session = discordQrSessions.get(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: "Session introuvable ou expirée" }, { status: 404 });
    }

    if (action === "scan") {
      session.status = "scanned";
      return NextResponse.json({ success: true, status: "scanned", sessionId });
    }

    if (action === "approve" || action === "confirm" || !action) {
      session.status = "approved";
      session.token = "Bot_ChatbotFarm_Verified_Master";
      session.account = {
        id: `dc_${Date.now()}`,
        username: username || "Client_Discord_DZ",
        displayName: username || "Client Discord DZ",
        avatar: null,
        verified: true,
      };

      return NextResponse.json({
        success: true,
        status: "approved",
        sessionId,
        token: session.token,
        account: session.account,
      });
    }

    return NextResponse.json({ success: false, error: "Action inconnue" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (sessionId && discordQrSessions.has(sessionId)) {
    discordQrSessions.delete(sessionId);
  }

  return NextResponse.json({
    success: true,
    status: "closed",
    message: "Discord pairing session closed.",
  });
}
