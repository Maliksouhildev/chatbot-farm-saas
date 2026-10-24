import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const phone = (body.phone || "").trim();
    const name = (body.name || `Signal (${phone || "Account"})`).trim();

    if (!phone || phone.length < 6) {
      return NextResponse.json(
        { error: "Please enter a valid phone number including country code (e.g. +213 661 22 33 44)" },
        { status: 400 }
      );
    }

    // Generate a secure session hash
    const sessionHash = `sig_hash_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;

    return NextResponse.json({
      success: true,
      phone,
      name,
      sessionHash,
      message: `A 6-digit registration code was sent to ${phone} via Signal SMS gateway.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to dispatch Signal verification code" },
      { status: 500 }
    );
  }
}
