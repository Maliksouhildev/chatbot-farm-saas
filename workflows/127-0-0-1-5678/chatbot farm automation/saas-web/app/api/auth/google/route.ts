import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

/**
 * Universal Google Authentication & Account Sync Endpoint
 * Ensures a matching Supabase Auth user and profile exist for Google OAuth logins,
 * and indicates whether the user needs to create a password for manual login.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }
    const email = body.email.trim().toLowerCase();
    const fullName = (body.name || body.fullName || '').trim() || email.split('@')[0];

    // 1. Check if user already exists in Supabase Auth
    let targetUser: any = null;
    try {
      const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
      if (!listErr && Array.isArray(users)) {
        targetUser = users.find(u => u.email?.toLowerCase() === email);
      }
    } catch (err) {
      console.warn('[Google Auth List Notice]:', err);
    }

    // 2. If user doesn't exist, create them in Supabase Auth (auto-confirmed)
    let userId = targetUser?.id;
    if (!targetUser) {
      try {
        const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            provider: 'google',
            has_manual_password: false,
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`
          }
        });

        if (!createErr && newUser?.user) {
          userId = newUser.user.id;
          targetUser = newUser.user;
        }
      } catch (createEx) {
        console.warn('[Google Auth Create Notice]:', createEx);
      }
    }

    // 3. Ensure merchant profile exists in public.profiles
    let profile: any = null;
    if (userId) {
      try {
        const { data: profData } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profData) {
          profile = profData;
        } else {
          const { data: insertedProf } = await supabaseAdmin
            .from('profiles')
            .upsert({
              id: userId,
              full_name: fullName,
              phone_number: body.phone || '',
              company_name: body.companyName || `${fullName}'s Store`,
              role: 'admin',
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          if (insertedProf) profile = insertedProf;
        }
      } catch (profileErr) {
        console.warn('[Profile Upsert Notice]:', profileErr);
      }
    }

    const hasManualPassword = Boolean(
      targetUser?.user_metadata?.has_manual_password === true
    );

    const resolvedName = profile?.full_name || targetUser?.user_metadata?.full_name || fullName;
    const avatarInitial = (resolvedName[0] || 'M').toUpperCase();

    // 4. Return authenticated session payload with needsPassword flag
    const userPayload = {
      id: userId || email,
      name: resolvedName,
      email: email,
      company: profile?.company_name || `${resolvedName}'s Store`,
      phone: profile?.phone_number || '',
      provider: 'google',
      plan: 'Enterprise DZ Pro',
      verified: true,
      avatar: avatarInitial,
      hasManualPassword,
    };

    return NextResponse.json({
      success: true,
      user: userPayload,
      needsPassword: !hasManualPassword,
      message: `Signed in as ${resolvedName} (${email}) via Google`
    });
  } catch (err: any) {
    console.error('[Google Auth Route Error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
