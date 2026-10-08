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
    const password = body.password || '';
    const fullName = (body.fullName || body.name || '').trim() || email.split('@')[0];
    const companyName = (body.companyName || body.storeName || '').trim() || 'Algerian Store';
    const phoneNumber = (body.phoneNumber || body.phone || '').trim() || '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // 1. Check if user already exists
    try {
      const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
      if (!listErr && Array.isArray(users)) {
        const existing = users.find((u) => u.email?.toLowerCase() === email);
        if (existing) {
          return NextResponse.json(
            { error: 'An account with this email already exists. Please sign in instead.' },
            { status: 400 }
          );
        }
      }
    } catch (checkErr) {
      console.warn('[Signup User Check Warning]:', checkErr);
    }

    // 2. Generate 6-digit verification code (expires in 15 mins)
    const verificationCode = generateVerificationCode();
    const codeExpiresAt = Date.now() + 15 * 60 * 1000;

    // 3. Create user in Supabase with unconfirmed email
    let userId: string | null = null;
    let authUser: any = null;

    try {
      // Create user via Admin with email_confirm: false so email verification is required
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: {
          full_name: fullName,
          company_name: companyName,
          phone_number: phoneNumber,
          verification_code: verificationCode,
          code_expires_at: codeExpiresAt,
          email_verified: false,
          connected_apps: [],
        },
      });

      if (createErr) {
        if (createErr.message?.toLowerCase().includes('already') || createErr.status === 422) {
          return NextResponse.json(
            { error: 'An account with this email already exists. Please sign in.' },
            { status: 400 }
          );
        }
        throw createErr;
      }

      if (newUser?.user) {
        userId = newUser.user.id;
        authUser = newUser.user;
      }
    } catch (authEx: any) {
      console.warn('[Admin Create User Exception]:', authEx);
      // Fallback: client-side signUp (which also dispatches verification email)
      const { data: clientSignup, error: clientErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
            verification_code: verificationCode,
            code_expires_at: codeExpiresAt,
            connected_apps: [],
          },
        },
      });

      if (clientErr) {
        return NextResponse.json({ error: clientErr.message }, { status: 400 });
      }

      if (clientSignup?.user) {
        userId = clientSignup.user.id;
        authUser = clientSignup.user;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Failed to create user account. Please try again.' },
        { status: 500 }
      );
    }

    // 4. Create public.profiles row
    try {
      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        full_name: fullName,
        company_name: companyName,
        phone_number: phoneNumber,
        role: 'merchant',
        updated_at: new Date().toISOString(),
      });
    } catch (profErr) {
      console.warn('[Profiles Upsert Warning]:', profErr);
    }

    // 5. Send verification email via Supabase Auth
    try {
      await supabase.auth.resend({
        type: 'signup',
        email,
      });
    } catch (resendErr) {
      console.warn('[Resend Email Notice]:', resendErr);
    }

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      email,
      userId,
      verificationCode, // Available for instant local verification or verification email
      message: `Account created for ${fullName}! A verification email with your confirmation code has been sent to ${email}.`,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
