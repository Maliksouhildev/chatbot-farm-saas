import { NextResponse } from 'next/server';
import { sendTelegramPhoneCode } from '@/lib/telegram_client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber || phoneNumber.trim().length < 5) {
      return NextResponse.json(
        { error: 'Valid phone number is required (e.g. +213550123456)' },
        { status: 400 }
      );
    }

    const res = await sendTelegramPhoneCode(phoneNumber.trim());

    return NextResponse.json({
      success: true,
      phoneCodeHash: res.phoneCodeHash,
      isCodeViaApp: res.isCodeViaApp ?? true,
      message: 'Verification code sent to your Telegram app / SMS',
    });
  } catch (err: any) {
    console.error('Error sending Telegram verification code:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to send Telegram code. Please check the number format.' },
      { status: 500 }
    );
  }
}
