import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr || !Array.isArray(users)) {
      return NextResponse.json({ error: 'Failed to look up user.' }, { status: 500 });
    }

    const user = users.find((u) => u.email?.toLowerCase() === email);
    if (!user) {
      return NextResponse.json({ error: 'No account found with this email.' }, { status: 404 });
    }

    const newCode = generateVerificationCode();
    const newExpiry = Date.now() + 15 * 60 * 1000;

    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        verification_code: newCode,
        code_expires_at: newExpiry,
      },
    });

    try {
      await supabase.auth.resend({ type: 'signup', email });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `A new verification code has been sent to ${email}.`,
    });
  } catch (err: any) {
    console.error('Resend verification error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
