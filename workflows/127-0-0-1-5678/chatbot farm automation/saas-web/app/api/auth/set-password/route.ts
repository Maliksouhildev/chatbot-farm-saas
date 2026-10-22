import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

/**
 * Dedicated endpoint to set or update account password
 * Enables Google OAuth users to set their own manual credentials so they can
 * log in directly with email & password without needing Google.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();
    const userId = (body.userId || '').trim();
    const password = body.password || '';

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (!email && !userId) {
      return NextResponse.json(
        { error: 'Either email or userId must be provided.' },
        { status: 400 }
      );
    }

    // 1. Locate target user in Supabase Auth
    let targetUserId = userId;
    let targetUser: any = null;

    if (targetUserId) {
      try {
        const { data: userRes, error } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
        if (!error && userRes?.user) {
          targetUser = userRes.user;
        }
      } catch (err) {
        console.warn('[Set-Password getUserById Notice]:', err);
      }
    }

    if (!targetUser && email) {
      try {
        const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
        if (!listErr && Array.isArray(users)) {
          targetUser = users.find((u) => u.email?.toLowerCase() === email);
          if (targetUser) {
            targetUserId = targetUser.id;
          }
        }
      } catch (err) {
        console.warn('[Set-Password listUsers Notice]:', err);
      }
    }

    if (!targetUser || !targetUserId) {
      return NextResponse.json(
        { error: 'Account not found. Please ensure you are logged in or registered.' },
        { status: 404 }
      );
    }

    // 2. Update user's password and flag has_manual_password in user_metadata
    const currentMeta = targetUser.user_metadata || {};
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      password: password,
      user_metadata: {
        ...currentMeta,
        has_manual_password: true,
        password_updated_at: new Date().toISOString(),
      },
    });

    if (updateErr) {
      console.error('[Set-Password Error]:', updateErr);
      return NextResponse.json(
        { error: updateErr.message || 'Failed to update account password.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password successfully created! You can now log in manually with your email and password anytime.',
      hasManualPassword: true,
    });
  } catch (err: any) {
    console.error('[Set-Password Exception]:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error while setting password.' },
      { status: 500 }
    );
  }
}
