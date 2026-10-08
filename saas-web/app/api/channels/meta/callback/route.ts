import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');
  const state = url.searchParams.get('state') || 'instagram';

  if (error || !code) {
    const errorMsg = errorDescription || error || 'Authorization was canceled or failed.';
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Meta Authentication Error</title></head>
        <body style="font-family:sans-serif;text-align:center;padding:40px;">
          <h2 style="color:#DC2626;">Meta Authentication Failed</h2>
          <p>${errorMsg}</p>
          <button onclick="window.close()" style="padding:8px 16px;background:#333;color:#fff;border:none;border-radius:8px;cursor:pointer;">Close Window</button>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'META_AUTH_ERROR', error: ${JSON.stringify(errorMsg)} }, '*');
            }
          </script>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  const clientId = process.env.NEXT_PUBLIC_META_APP_ID;
  const clientSecret = process.env.META_APP_SECRET;
  const redirectUri = `${url.origin}/api/channels/meta/callback`;

  try {
    // 1. Exchange code for user access token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&code=${code}`
    );

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      throw new Error(tokenData.error.message || 'Failed to exchange token with Meta.');
    }

    const userAccessToken = tokenData.access_token;

    // 2. Fetch User Profile
    const meRes = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,picture&access_token=${userAccessToken}`
    );
    const meData = await meRes.json();

    // 3. Fetch Linked Pages & Instagram Business Accounts
    const accountsRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,category,instagram_business_account{id,username,name,profile_picture_url,followers_count}&access_token=${userAccessToken}`
    );
    const accountsData = await accountsRes.json();
    const pages = accountsData.data || [];

    // Extract real Instagram business accounts
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

    const payload = {
      type: 'META_AUTH_SUCCESS',
      state,
      user: {
        id: meData.id,
        name: meData.name,
        avatar: meData.picture?.data?.url || null,
      },
      userAccessToken,
      pages: pages.map((p: any) => ({
        id: p.id,
        name: p.name,
        accessToken: p.access_token,
      })),
      instagramAccounts: igAccounts,
    };

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Meta Authentication Success</title></head>
        <body style="font-family:sans-serif;text-align:center;padding:40px;background:#f8fafc;">
          <h2 style="color:#16A34A;">Meta Account Connected!</h2>
          <p>Redirecting to Chatbot Farm dashboard...</p>
          <script>
            const data = ${JSON.stringify(payload)};
            try {
              localStorage.setItem('cf_meta_auth', JSON.stringify(data));
              if (data.instagramAccounts && data.instagramAccounts.length > 0) {
                localStorage.setItem('cf_ig_account', JSON.stringify(data.instagramAccounts[0]));
              }
            } catch (e) {}

            if (window.opener) {
              window.opener.postMessage(data, '*');
              setTimeout(() => window.close(), 1200);
            } else {
              window.location.href = '/?connected=' + encodeURIComponent(data.state);
            }
          </script>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (err: any) {
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Meta Authentication Error</title></head>
        <body style="font-family:sans-serif;text-align:center;padding:40px;">
          <h2 style="color:#DC2626;">OAuth Error</h2>
          <p>${err.message}</p>
          <button onclick="window.close()" style="padding:8px 16px;background:#333;color:#fff;border:none;border-radius:8px;cursor:pointer;">Close Window</button>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'META_AUTH_ERROR', error: ${JSON.stringify(err.message)} }, '*');
            }
          </script>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
