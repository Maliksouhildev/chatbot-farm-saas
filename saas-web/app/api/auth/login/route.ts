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

    // 1. Authenticate strictly with Supabase Auth (verifies hashed password)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData?.user) {
      // Check if the reason was unconfirmed email
      if (authError?.message?.toLowerCase().includes('email not confirmed')) {
        return NextResponse.json(
          {
            error: 'Please verify your email before logging in. Check your inbox or request a new verification code.',
            requiresVerification: true,
            email,
          },
          { status: 403 }
        );
      }

      // Strictly reject invalid passwords / nonexistent accounts
      return NextResponse.json(
        { error: 'Invalid email or password. Please check your credentials or create an account.' },
        { status: 401 }
      );
    }

    const user = authData.user;
    const userId = user.id;
    const userName = user.user_metadata?.full_name;

    // 2. Fetch profile from public.profiles
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

    const resolvedName = profile?.full_name || userName || email.split('@')[0] || 'Merchant';
    const avatarInitial = (resolvedName[0] || 'M').toUpperCase();

    // 3. Load connected apps from user metadata or profile
    const savedConnectedApps: string[] = user.user_metadata?.connected_apps || user.user_metadata?.preferences?.connectedApps || [];

    const userSession = {
      id: userId,
      name: resolvedName,
      email: email,
      company: profile?.company_name || user.user_metadata?.company_name || 'Algerian Store',
      phone: profile?.phone_number || user.user_metadata?.phone_number || '',
      provider: 'email',
      plan: 'Enterprise DZ Pro',
      verified: true,
      avatar: avatarInitial,
      connectedApps: savedConnectedApps,
    };

    return NextResponse.json({
      success: true,
      user: userSession,
      session: authData.session || null,
      message: `Welcome back, ${resolvedName}!`,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
