import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    const fullName = (body.fullName || body.name || '').trim() || email.split('@')[0];
    const companyName = (body.companyName || body.storeName || '').trim() || 'El Bahdja Store';
    const phoneNumber = (body.phoneNumber || body.phone || '').trim() || '0550000000';

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

    // 1. Create or retrieve user via Supabase Auth Admin (auto-confirm email)
    let userId: string | null = null;
    let authUser: any = null;

    try {
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          company_name: companyName,
          phone_number: phoneNumber,
        },
      });

      if (createErr) {
        // If user already exists, find existing user and update
        if (createErr.message?.toLowerCase().includes('already') || createErr.status === 422) {
          const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
          if (!listErr && Array.isArray(users)) {
            const existing = users.find((u) => u.email?.toLowerCase() === email);
            if (existing) {
              userId = existing.id;
              authUser = existing;
              // Update password & metadata
              await supabaseAdmin.auth.admin.updateUserById(existing.id, {
                password,
                user_metadata: {
                  full_name: fullName,
                  company_name: companyName,
                  phone_number: phoneNumber,
                },
              });
            }
          }
        } else {
          console.warn('[Signup Create Auth Error]:', createErr);
        }
      } else if (newUser?.user) {
        userId = newUser.user.id;
        authUser = newUser.user;
      }
    } catch (authEx) {
      console.warn('[Signup Auth Exception]:', authEx);
    }

    if (!userId) {
      // Fallback: attempt client-side signup
      const { data: clientSignup, error: clientErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
          },
        },
      });
      if (clientSignup?.user) {
        userId = clientSignup.user.id;
        authUser = clientSignup.user;
      } else if (clientErr) {
        return NextResponse.json({ error: clientErr.message }, { status: 400 });
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Failed to create user account. Please try again.' },
        { status: 500 }
      );
    }

    // 2. Ensure profile exists in public.profiles
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
      console.warn('[Profile Upsert Notice]:', profErr);
    }

    // 3. Ensure bot exists in public.bots
    try {
      const { data: existingBots } = await supabaseAdmin
        .from('bots')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (!existingBots || existingBots.length === 0) {
        await supabaseAdmin.from('bots').insert({
          user_id: userId,
          name: `${companyName} AI Assistant`,
          system_prompt:
            'You are a friendly and polite e-commerce sales assistant for an Algerian online store. You assist customers in Algerian Darja, French, and Arabic with pricing in DZD, delivery across 58 wilayas, and order confirmation.',
        });
      }
    } catch (botErr) {
      console.warn('[Bot Creation Notice]:', botErr);
    }

    // 4. Return authenticated session payload
    const avatarInitial = (fullName[0] || 'M').toUpperCase();
    const userPayload = {
      id: userId,
      name: fullName,
      email: email,
      company: companyName,
      phone: phoneNumber,
      provider: 'email',
      plan: 'Enterprise DZ Pro',
      verified: true,
      avatar: avatarInitial,
    };

    return NextResponse.json({
      success: true,
      user: userPayload,
      message: `Account created successfully for ${fullName}!`,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
