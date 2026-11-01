import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { 
  createLocalUser, 
  getLocalUserByEmail 
} from '@/lib/localAuthStore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    const fullName = (body.fullName || body.name || '').trim() || email.split('@')[0];
    const companyName = (body.companyName || body.storeName || '').trim() || `${fullName}'s Store`;
    const phoneNumber = (body.phoneNumber || body.phone || '').trim();

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

    // 1. Check if user already exists locally
    const localExisting = getLocalUserByEmail(email);
    if (localExisting) {
      const isGoogle = localExisting.provider === 'google';
      return NextResponse.json(
        {
          error: isGoogle
            ? 'An account with this email already exists via Google. Please sign in with Google or log in with your credentials.'
            : 'An account with this email already exists. Please sign in instead.',
          accountExists: true,
          isGoogleAccount: isGoogle,
        },
        { status: 409 }
      );
    }

    // 1b. Check remote Supabase if accessible
    try {
      const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
      if (!listErr && Array.isArray(users)) {
        const existing = users.find((u) => u.email?.toLowerCase() === email);
        if (existing) {
          const isGoogle = Boolean(
            existing.app_metadata?.provider === 'google' ||
            existing.identities?.some((i: any) => i.provider === 'google')
          );
          return NextResponse.json(
            {
              error: isGoogle
                ? 'An account with this email already exists via Google. Please sign in with Google or log in with your credentials.'
                : 'An account with this email already exists. Please sign in instead.',
              accountExists: true,
              isGoogleAccount: isGoogle,
            },
            { status: 409 }
          );
        }
      }
    } catch (checkErr) {
      console.warn('[Signup Duplicate Check Notice]: Supabase offline or unreachable, proceeding with local check.');
    }

    // 2. Attempt remote user creation in Supabase Auth Admin
    let userId: string | null = null;
    let authUser: any = null;
    let supabaseFailed = false;

    try {
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          company_name: companyName,
          phone_number: phoneNumber,
          has_manual_password: true,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`
        },
      });

      if (createErr) {
        if (createErr.message?.toLowerCase().includes('already') || createErr.status === 422) {
          return NextResponse.json(
            {
              error: 'An account with this email already exists. Please sign in instead.',
              accountExists: true,
            },
            { status: 409 }
          );
        }
        console.warn('[Signup Supabase Notice]:', createErr.message);
        supabaseFailed = true;
      } else if (newUser?.user) {
        userId = newUser.user.id;
        authUser = newUser.user;
      }
    } catch (authEx: any) {
      console.warn('[Signup Supabase Network Notice]:', authEx.message);
      supabaseFailed = true;
    }

    // 2b. Resilient Local Auth Fallback if Supabase is offline/unreachable
    if (!userId || supabaseFailed) {
      try {
        const localUser = createLocalUser({
          email,
          password,
          fullName,
          companyName,
          phoneNumber,
          provider: 'email',
          hasManualPassword: true,
        });
        userId = localUser.id;
      } catch (localEx: any) {
        return NextResponse.json(
          { error: localEx.message || 'Failed to create user account locally.' },
          { status: 400 }
        );
      }
    }

    // 3. Ensure profile exists in public.profiles (if Supabase is available)
    if (userId && !supabaseFailed) {
      try {
        await supabaseAdmin.from('profiles').upsert({
          id: userId,
          full_name: fullName,
          company_name: companyName,
          phone_number: phoneNumber,
          role: 'admin',
          updated_at: new Date().toISOString(),
        });
      } catch (profErr) {
        console.warn('[Signup Profile Upsert Notice]:', profErr);
      }
    }

    // 4. Perform direct sign-in if Supabase is alive
    let sessionData: any = null;
    if (!supabaseFailed) {
      try {
        const loginRes = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        sessionData = loginRes.data?.session || null;
      } catch {}
    }

    const avatarInitial = (fullName[0] || 'U').toUpperCase();
    const userSession = {
      id: userId,
      name: fullName,
      email: email,
      company: companyName,
      phone: phoneNumber,
      provider: 'email',
      plan: 'Enterprise DZ Pro',
      verified: true,
      avatar: avatarInitial,
      hasManualPassword: true,
    };

    return NextResponse.json({
      success: true,
      user: userSession,
      session: sessionData,
      message: `Welcome to Chatbot Farm, ${fullName}! Your account has been created.`,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
