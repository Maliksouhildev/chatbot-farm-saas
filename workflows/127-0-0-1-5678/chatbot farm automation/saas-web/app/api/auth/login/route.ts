import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { 
  getLocalUserByEmail, 
  verifyLocalUserPassword 
} from '@/lib/localAuthStore';

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

    // 1. First check remote Supabase Auth (if online)
    let authData: any = null;
    let authError: any = null;
    let supabaseOnline = true;

    try {
      const res = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      authData = res.data;
      authError = res.error;
    } catch (e: any) {
      authError = e;
      supabaseOnline = false;
    }

    let userId = authData?.user?.id;
    let targetUser = authData?.user;

    // 2. If Supabase authenticated successfully
    if (userId && !authError) {
      let profile: any = null;
      try {
        const { data: profData } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (profData) {
          profile = profData;
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
    }

    // 3. Fallback: Check Resilient Local Auth Store (for offline / self-hosted environments)
    const localVerification = verifyLocalUserPassword(email, password);

    if (localVerification.valid && localVerification.user) {
      const localUser = localVerification.user;
      const avatarInitial = (localUser.name[0] || 'U').toUpperCase();

      const userSession = {
        id: localUser.id,
        name: localUser.name,
        email: localUser.email,
        company: localUser.company,
        phone: localUser.phone,
        provider: localUser.provider,
        plan: 'Enterprise DZ Pro',
        verified: true,
        avatar: avatarInitial,
        hasManualPassword: localUser.hasManualPassword,
      };

      return NextResponse.json({
        success: true,
        user: userSession,
        session: null,
        message: `Welcome back, ${localUser.name}!`,
      });
    }

    if (localVerification.isGoogleWithoutPassword) {
      return NextResponse.json(
        {
          error: 'This account was registered using Google and has no manual password set yet. Please sign in with Google or use "Forgot password?" to set one.',
          isGoogleAccount: true,
          needsPasswordSetup: true,
        },
        { status: 401 }
      );
    }

    if (localVerification.user && !localVerification.valid) {
      return NextResponse.json(
        {
          error: 'Invalid email or password. Please check your credentials or click "Forgot password?" to reset.',
          isGoogleAccount: localVerification.user.provider === 'google',
        },
        { status: 401 }
      );
    }

    // 4. If not found locally, diagnose if user exists in Supabase Admin (when online)
    try {
      const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
      if (!listErr && Array.isArray(users)) {
        const matched = users.find((u) => u.email?.toLowerCase() === email);
        if (matched) {
          const hasManualPassword = Boolean(matched.user_metadata?.has_manual_password);
          const isGoogleUser = Boolean(
            matched.app_metadata?.provider === 'google' ||
            matched.identities?.some((i: any) => i.provider === 'google')
          );

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
      // Supabase is offline
    }

    // 5. Account not found anywhere
    return NextResponse.json(
      { error: 'No account found with this email. Please check your spelling or sign up.' },
      { status: 404 }
    );
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
