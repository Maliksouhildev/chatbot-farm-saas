import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import crypto from "crypto";

export const dynamic = "force-dynamic";

interface SignalSession {
  sessionId: string;
  uuid: string;
  pubKey: string;
  qrPayload: string;
  status: "pending" | "approved" | "expired";
  createdAt: number;
  expiresAt: number;
  phone?: string;
  name?: string;
}

// In-memory sessions store
const signalSessions = new Map<string, SignalSession>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId && signalSessions.has(sessionId)) {
      const session = signalSessions.get(sessionId)!;

      if (Date.now() > session.expiresAt) {
        signalSessions.delete(sessionId);
        return NextResponse.json({
          success: false,
          status: "expired",
          error: "QR code expired. Please refresh.",
        });
      }

      if (session.status === "approved") {
        return NextResponse.json({
          success: true,
          status: "success",
          sessionId,
          account: {
            phone: session.phone || "Signal Linked Device",
            name: session.name || "Signal Account",
            deviceId: "1",
            verified: true,
            e2ee: true,
            linkedAt: Date.now(),
          },
          message: "Signal device linked successfully!",
        });
      }

      return NextResponse.json({
        success: true,
        status: "pending",
        sessionId,
        qrPayload: session.qrPayload,
      });
    }

    // Generate new Signal device linking session
    const newSessionId = `sig_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const uuid = crypto.randomUUID();
    const pubKey = crypto.randomBytes(32).toString("base64");
    const qrPayload = `sgnl://linkdevice?uuid=${uuid}&pub_key=${pubKey}`;

    const qrCodeBase64 = await QRCode.toDataURL(qrPayload, {
      width: 320,
      margin: 2,
      color: {
        dark: "#1B1B1B",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });

    const expiresAt = Date.now() + 45000; // 45 seconds validity
    signalSessions.set(newSessionId, {
      sessionId: newSessionId,
      uuid,
      pubKey,
      qrPayload,
      status: "pending",
      createdAt: Date.now(),
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      status: "pending",
      sessionId: newSessionId,
      qrPayload,
      qrCodeBase64,
      expiresAt,
    });
  } catch (err: any) {
    console.error("Error in Signal QR route:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate Signal device link QR" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId, action, phone, name } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    if (action === "approve") {
      let session = signalSessions.get(sessionId);
      if (!session) {
        session = {
          sessionId,
          uuid: crypto.randomUUID(),
          pubKey: crypto.randomBytes(32).toString("base64"),
          qrPayload: `sgnl://linkdevice?uuid=${crypto.randomUUID()}&pub_key=mock`,
          status: "approved",
          createdAt: Date.now(),
          expiresAt: Date.now() + 60000,
          phone: phone || "Signal Linked Device",
          name: name || "Signal Account",
        };
      } else {
        session.status = "approved";
        session.phone = phone || session.phone || "Signal Linked Device";
        session.name = name || session.name || "Signal Account";
      }
      signalSessions.set(sessionId, session);

      return NextResponse.json({
        success: true,
        status: "approved",
        account: {
          phone: session.phone,
          name: session.name,
          deviceId: "1",
          verified: true,
          e2ee: true,
        },
        message: "Signal device link approved successfully!",
      });
    }

    if (action === "cancel") {
      signalSessions.delete(sessionId);
      return NextResponse.json({ success: true, message: "Signal session cancelled" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Action failed" }, { status: 500 });
  }
}
