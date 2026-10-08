import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * Automatically refresh an expired Google access token using the stored refresh_token
 */
async function refreshGoogleAccessToken(token: any) {
  try {
    const url = "https://oauth2.googleapis.com/token";
    const body = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    });

    const response = await fetch(url, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
      body: body.toString(),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      // Default to 1 hour (3600s) if expires_in is not provided
      accessTokenExpires: Date.now() + (refreshedTokens.expires_in ?? 3600) * 1000,
      // Retain the existing refresh_token if Google did not return a new one
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (error) {
    console.error("Error refreshing Google OAuth access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/chat.messages.readonly"
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    // 30 days persistent session maxAge to prevent recurring daily logouts
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // 1. Initial sign-in: capture both access token, refresh token, and expiration timestamp
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000,
          refreshToken: account.refresh_token,
          user,
        };
      }

      // 2. Return previous token if the access token has not yet expired (with 5-minute safety buffer)
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number) - 5 * 60 * 1000) {
        return token;
      }

      // 3. Access token has expired: seamlessly refresh it in the background
      if (token.refreshToken) {
        return refreshGoogleAccessToken(token);
      }

      return token;
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "1234567890abcdefghijklmnopqrstuvwxyz",
};
