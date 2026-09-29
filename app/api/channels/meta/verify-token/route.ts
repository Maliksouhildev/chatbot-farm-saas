import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const cleanToken = token.trim();

    // 1. Inspect Token / fetch user profile
    const meRes = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,picture&access_token=${cleanToken}`
    );
    const meData = await meRes.json();

    if (meData.error) {
      return NextResponse.json({ error: meData.error.message }, { status: 400 });
    }

    // 2. Fetch linked Pages & Instagram Business Accounts
    const accountsRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,category,instagram_business_account{id,username,name,profile_picture_url,followers_count}&access_token=${cleanToken}`
    );
    const accountsData = await accountsRes.json();
    const pages = accountsData.data || [];

    const igAccounts = pages
      .filter((p: any) => p.instagram_business_account)
      .map((p: any) => ({
        pageId: p.id,
        pageName: p.name,
        pageAccessToken: p.access_token,
        igId: p.instagram_business_account.id,
        username: p.instagram_business_account.username,
        name: p.instagram_business_account.name || p.instagram_business_account.username,
        profilePic: p.instagram_business_account.profile_picture_url || null,
        followersCount: p.instagram_business_account.followers_count || 0,
      }));

    return NextResponse.json({
      success: true,
      user: {
        id: meData.id,
        name: meData.name,
        avatar: meData.picture?.data?.url || null,
      },
      pages: pages.map((p: any) => ({
        id: p.id,
        name: p.name,
        accessToken: p.access_token,
      })),
      instagramAccounts: igAccounts,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
