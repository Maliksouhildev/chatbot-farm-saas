import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { getTelegramQrSession, cancelTelegramQrSession } from "@/lib/telegram_client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId") || undefined;

    const sessionRes = await getTelegramQrSession(sessionId);

    if (sessionRes.status === "success") {
      return NextResponse.json({
        success: true,
        status: "success",
        sessionId: sessionRes.sessionId,
        user: sessionRes.user,
        sessionString: sessionRes.sessionString,
        message: `Successfully connected Telegram as ${sessionRes.user.firstName} (@${sessionRes.user.username || sessionRes.user.phone})`,
      });
    }

    if (sessionRes.status === "pending" && sessionRes.qrPayload) {
      // Generate genuine scannable QR Code base64 Data URL for Telegram's native desktop scanner
      const qrCodeBase64 = await QRCode.toDataURL(sessionRes.qrPayload, {
        width: 320,
        margin: 2,
        color: {
          dark: "#0E1621",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });

      return NextResponse.json({
        success: true,
        status: "pending",
        sessionId: sessionRes.sessionId,
        qrPayload: sessionRes.qrPayload,
        qrCodeBase64,
        expiresAt: sessionRes.expiresAt,
      });
    }

    return NextResponse.json({
      success: false,
      status: sessionRes.status,
      sessionId: sessionRes.sessionId,
      error: sessionRes.error || "Waiting for Telegram QR scan",
    });
  } catch (err: any) {
    console.error("Error in Telegram QR route:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate Telegram QR login" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId, action } = body;

    if (action === "cancel" && sessionId) {
      cancelTelegramQrSession(sessionId);
      return NextResponse.json({ success: true, message: "Telegram QR session cancelled" });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
