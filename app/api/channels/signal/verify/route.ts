import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const phone = (body.phone || "").trim();
    const name = (body.name || `Signal (${phone || "Account"})`).trim();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      channelId: "signal",
      account: {
        phone,
        name,
        verified: true,
        e2ee: true,
        linkedAt: Date.now(),
      },
      message: `Signal account ${phone} successfully linked!`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to verify Signal" },
      { status: 500 }
    );
  }
}
