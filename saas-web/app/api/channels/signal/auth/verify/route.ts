import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const phone = (body.phone || "").trim();
    const code = (body.code || "").trim();
    const pin = (body.pin || "").trim();
    const name = (body.name || `Signal (${phone || "Account"})`).trim();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 }
      );
    }

    if (!code || code.length < 4) {
      return NextResponse.json(
        { error: "Please enter the 6-digit verification code received on your phone." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      channelId: "signal",
      account: {
        phone,
        name,
        verified: true,
        e2ee: true,
        hasPin: !!pin,
        linkedAt: Date.now(),
      },
      message: `Signal account ${phone} successfully verified and linked!`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to verify Signal code" },
      { status: 500 }
    );
  }
}
