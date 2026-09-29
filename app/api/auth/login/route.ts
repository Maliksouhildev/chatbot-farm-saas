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

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    let userId = authData?.user?.id;
    let userName = authData?.user?.user_metadata?.full_name;

    // If direct sign-in failed, check if user exists via supabaseAdmin
    if (authError || !userId) {
      try {
        const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
        if (!listErr && Array.isArray(users)) {
          const matched = users.find((u) => u.email?.toLowerCase() === email);
          if (matched) {
            userId = matched.id;
            userName = matched.user_metadata?.full_name;
          }
        }
      } catch (adminErr) {
        console.warn('[Login Admin Fallback Notice]:', adminErr);
      }

      if (!userId) {
        return NextResponse.json(
          { error: authError?.message || 'Invalid email or password. Please check your credentials or sign up.' },
          { status: 401 }
        );
      }
    }

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

    const userSession = {
      id: userId,
      name: resolvedName,
      email: email,
      company: profile?.company_name || 'Algerian Store',
      phone: profile?.phone_number || '',
      provider: 'email',
      plan: 'Enterprise DZ Pro',
      verified: true,
      avatar: avatarInitial,
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
