import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // 1. Strict direct authentication via Supabase Auth
    let authData: any = null;
    let authError: any = null;

    try {
      const res = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      authData = res.data;
      authError = res.error;
    } catch (e: any) {
      authError = e;
    }

    let userId = authData?.user?.id;
    let targetUser = authData?.user;

    // 2. If authentication failed, diagnose the exact reason WITHOUT modifying any passwords
    if (authError || !userId) {
      try {
        const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
        if (!listErr && Array.isArray(users)) {
          const matched = users.find((u) => u.email?.toLowerCase() === email);
          if (matched) {
            targetUser = matched;
            userId = matched.id;

            const hasManualPassword = Boolean(matched.user_metadata?.has_manual_password);
            const isGoogleUser = Boolean(
              matched.app_metadata?.provider === 'google' ||
              matched.identities?.some((i: any) => i.provider === 'google')
            );

            // Case A: Google account that has never created a manual password
            if (isGoogleUser && !hasManualPassword) {
              return NextResponse.json(
                {
                  error: 'This account was registered using Google and has no manual password set yet. Please sign in with Google or use "Forgot password?" to set one.',
                  isGoogleAccount: true,
                  needsPasswordSetup: true,
                },
                { status: 401 }
              );
            }

            // Case B: Account has a manual password, but the entered password was incorrect
            return NextResponse.json(
              {
                error: 'Invalid email or password. Please check your credentials or click "Forgot password?" to reset.',
                isGoogleAccount: isGoogleUser,
              },
              { status: 401 }
            );
          }
        }
      } catch (adminErr) {
        console.warn('[Login Admin Diagnosis Warning]:', adminErr);
      }

      // Case C: User does not exist at all in Supabase
      return NextResponse.json(
        { error: 'No account found with this email. Please check your spelling or sign up.' },
        { status: 404 }
      );
    }

    // 3. User authenticated successfully! Fetch or create profile in public.profiles
    let profile: any = null;
    try {
      const { data: profData } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (profData) {
        profile = profData;
      } else {
        const fullName = targetUser?.user_metadata?.full_name || email.split('@')[0];
        const { data: createdProf } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: userId,
            full_name: fullName,
            company_name: `${fullName}'s Store`,
            role: 'admin',
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (createdProf) profile = createdProf;
      }
    } catch {}

    const resolvedName = profile?.full_name || targetUser?.user_metadata?.full_name || email.split('@')[0] || 'User';
    const avatarInitial = (resolvedName[0] || 'U').toUpperCase();

    const userSession = {
      id: userId,
      name: resolvedName,
      email: email,
      company: profile?.company_name || `${resolvedName}'s Store`,
      phone: profile?.phone_number || '',
      provider: 'email',
      plan: 'Enterprise DZ Pro',
      verified: true,
      avatar: avatarInitial,
      hasManualPassword: true,
    };

    return NextResponse.json({
      success: true,
      user: userSession,
      session: authData?.session || null,
      message: `Welcome back, ${resolvedName}!`,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
