import { NextResponse } from 'next/server';
import { signInWithTelegramCode } from '@/lib/telegram_client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, phoneCode, phoneCodeHash, password } = body;

    if (!phoneNumber || !phoneCode) {
      return NextResponse.json(
        { error: 'Phone number and verification code are required' },
        { status: 400 }
      );
    }

    const { sessionString, user } = await signInWithTelegramCode(
      phoneNumber.trim(),
      phoneCode.trim(),
      phoneCodeHash,
      password
    );

    return NextResponse.json({
      success: true,
      sessionString,
      user,
      message: `Successfully connected Telegram as ${user.firstName} (@${user.username || user.phone})`,
    });
  } catch (err: any) {
    console.error('Error signing in with Telegram code:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to sign in. Please verify the code and 2FA password.' },
      { status: 400 }
    );
  }
}
