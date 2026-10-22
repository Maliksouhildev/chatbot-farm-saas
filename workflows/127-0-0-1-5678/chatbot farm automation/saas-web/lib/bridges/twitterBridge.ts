import path from "path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const TWITTER_WEB_BEARER =
  "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

export interface TwitterSession {
  authToken: string;
  ct0: string;
  twid?: string;
  handle: string;
  userId?: string;
  name?: string;
  avatar?: string;
  lastSync?: number;
}

export interface TwitterDMConversation {
  id: string;
  appId: "x_twitter";
  name: string;
  handleOrPhone: string;
  avatarText: string;
  avatarBg: string;
  statusText: string;
  spend: string;
  lastMessage: string;
  time: string;
  lastMessageTime: string;
  timestamp: number;
  unreadCount: number;
  messages: Array<{
    id: string;
    sender: "customer" | "operator";
    text: string;
    time: string;
    seen: boolean;
    imageUrl?: string;
  }>;
}

/**
 * Headless Puppeteer session authenticator (Beeper-style bridge)
 * Logs into x.com using credentials, solves/handles checkpoints, and extracts auth_token + ct0 cookies
 */
export async function authenticateTwitterSession(params: {
  handleOrEmail: string;
  password: string;
  phoneOrHandleConfirmation?: string;
}): Promise<{
  success: boolean;
  session?: TwitterSession;
  error?: string;
}> {
  let browser: any = null;
  try {
    const cleanUser = params.handleOrEmail.trim().replace(/^@/, "");
    const pass = params.password.trim();

    if (!cleanUser || !pass) {
      return { success: false, error: "Username/Email and Password are required." };
    }

    const puppeteerModule = await import("puppeteer-core");
    const puppeteer = puppeteerModule.default || puppeteerModule;

    browser = await puppeteer.launch({
      executablePath: EDGE_PATH,
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-infobars",
        "--window-size=1280,800",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    );

    console.log(`[TwitterBridge] Navigating to X login flow for @${cleanUser}...`);
    await page.goto("https://x.com/i/flow/login", { waitUntil: "networkidle2", timeout: 35000 });

    // Step 1: Username / Email field
    const userInputSelector = 'input[autocomplete="username"], input[name="text"]';
    await page.waitForSelector(userInputSelector, { timeout: 15000 });
    await page.type(userInputSelector, cleanUser, { delay: 40 });

    // Click Next
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button[role="button"], div[role="button"]'));
      const nextBtn = buttons.find((b) => b.textContent && b.textContent.trim() === "Next");
      if (nextBtn) (nextBtn as HTMLElement).click();
    });
    await new Promise((r) => setTimeout(r, 2000));

    // Step 1B: Sometimes Twitter prompts for phone number or username confirmation if logging from new IP
    const confirmationInput = await page.$('input[data-testid="ocfEnterTextTextInput"]');
    if (confirmationInput) {
      const confirmVal = params.phoneOrHandleConfirmation || cleanUser;
      console.log(`[TwitterBridge] Secondary confirmation prompt detected, entering: ${confirmVal}`);
      await confirmationInput.type(confirmVal, { delay: 40 });
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button[role="button"], div[role="button"]'));
        const nextBtn = buttons.find((b) => b.textContent && b.textContent.trim() === "Next");
        if (nextBtn) (nextBtn as HTMLElement).click();
      });
      await new Promise((r) => setTimeout(r, 2000));
    }

    // Step 2: Password field
    const passInputSelector = 'input[name="password"], input[type="password"]';
    await page.waitForSelector(passInputSelector, { timeout: 15000 });
    await page.type(passInputSelector, pass, { delay: 40 });

    // Click Log in
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button[role="button"], div[role="button"]'));
      const loginBtn = buttons.find((b) => b.textContent && b.textContent.trim() === "Log in");
      if (loginBtn) (loginBtn as HTMLElement).click();
    });

    // Wait for login outcome
    await new Promise((r) => setTimeout(r, 4000));

    // Check for error text in the page
    const pageError = await page.evaluate(() => {
      const errEl = document.querySelector('[data-testid="toast"], [role="alert"]');
      return errEl ? errEl.textContent : null;
    });

    if (pageError && (pageError.includes("Wrong password") || pageError.includes("Could not authenticate"))) {
      await browser.close();
      return { success: false, error: `X Authentication Error: ${pageError}` };
    }

    // Extract session cookies
    const cookies: any[] = await page.cookies();
    const authTokenCookie = cookies.find((c: any) => c.name === "auth_token");
    const ct0Cookie = cookies.find((c: any) => c.name === "ct0");
    const twidCookie = cookies.find((c: any) => c.name === "twid");

    if (!authTokenCookie || !ct0Cookie) {
      await browser.close();
      return {
        success: false,
        error:
          "Could not retrieve active X session cookies. Twitter may require 2-Factor Authentication or browser verification.",
      };
    }

    const session: TwitterSession = {
      authToken: authTokenCookie.value,
      ct0: ct0Cookie.value,
      twid: twidCookie ? twidCookie.value : undefined,
      handle: `@${cleanUser}`,
      lastSync: Date.now(),
    };

    await browser.close();
    console.log(`[TwitterBridge] Successfully authenticated real session for @${cleanUser}`);
    return { success: true, session };
  } catch (err: any) {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
    console.error("[TwitterBridge] Authentication error:", err);
    return { success: false, error: err.message || "Failed to authenticate X bridge session." };
  }
}

/**
 * Fetches the user's REAL Twitter Direct Messages using their authenticated session cookies
 */
export async function fetchRealTwitterDMs(session: TwitterSession): Promise<{
  success: boolean;
  chats: TwitterDMConversation[];
  error?: string;
}> {
  try {
    if (!session.authToken || !session.ct0) {
      return { success: false, chats: [], error: "Missing active Twitter session cookies." };
    }

    const cookieHeader = `auth_token=${session.authToken}; ct0=${session.ct0}; ${session.twid ? `twid=${session.twid}` : ""}`;

    // Query Twitter's internal DM inbox initial state endpoint (used by x.com web frontend)
    const res = await fetch("https://x.com/i/api/1.1/dm/inbox_initial_state.json?nsfw_filtering_enabled=false", {
      headers: {
        authorization: TWITTER_WEB_BEARER,
        "x-csrf-token": session.ct0,
        "x-twitter-auth-type": "OAuth2Session",
        "x-twitter-active-user": "yes",
        cookie: cookieHeader,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`[TwitterBridge] Inbox query HTTP ${res.status}:`, errText);
      return { success: false, chats: [], error: `Twitter DM API returned status ${res.status}` };
    }

    const data = await res.json();
    const inbox = data.inbox_initial_state || {};
    const conversations = inbox.conversations || {};
    const users = inbox.users || {};
    const entries = inbox.entries || [];

    const realChats: TwitterDMConversation[] = [];

    // Map conversations
    for (const [convId, conv] of Object.entries<any>(conversations)) {
      // Find recipient user
      const participantIds = conv.participants?.map((p: any) => p.user_id) || [];
      const recipientId = participantIds.find((id: string) => id !== session.userId) || participantIds[0];
      const userProfile = users[recipientId] || {};

      const contactName = userProfile.name || `@${userProfile.screen_name || "twitter_user"}`;
      const contactHandle = userProfile.screen_name ? `@${userProfile.screen_name}` : `@user_${recipientId}`;

      // Extract messages for this conversation
      const convEntries = entries.filter((e: any) => e.message?.conversation_id === convId);
      const messages = convEntries.map((e: any) => {
        const msg = e.message;
        const isOperator = msg.sender_id === session.userId;
        const msgDate = new Date(parseInt(msg.time || Date.now()));
        const timeStr = msgDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        return {
          id: msg.id || `x_msg_${Date.now()}_${Math.random()}`,
          sender: isOperator ? ("operator" as const) : ("customer" as const),
          text: msg.message_data?.text || "",
          time: timeStr,
          seen: true,
          imageUrl: msg.message_data?.attachment?.photo?.url || undefined,
        };
      });

      const lastEntry = convEntries[0]?.message;
      const lastMsgText = lastEntry?.message_data?.text || "Direct Message";
      const lastTime = lastEntry?.time ? new Date(parseInt(lastEntry.time)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recent";

      realChats.push({
        id: `x_conv_${convId}`,
        appId: "x_twitter",
        name: contactName,
        handleOrPhone: contactHandle,
        avatarText: (contactName || "X")[0].toUpperCase(),
        avatarBg: "#1D9BF0",
        statusText: `X Direct Message • @${userProfile.screen_name || "user"}`,
        spend: "0 DA",
        lastMessage: lastMsgText,
        time: lastTime,
        lastMessageTime: lastTime,
        timestamp: lastEntry?.time ? parseInt(lastEntry.time) : Date.now(),
        unreadCount: conv.unread_count || 0,
        messages,
      });
    }

    return {
      success: true,
      chats: realChats,
    };
  } catch (err: any) {
    console.error("[TwitterBridge] Failed to fetch real Twitter DMs:", err);
    return { success: false, chats: [], error: err.message };
  }
}

/**
 * Sends a real Direct Message to a recipient on Twitter (X)
 */
export async function sendRealTwitterDM(params: {
  session: TwitterSession;
  recipientIdOrHandle: string;
  text: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { session, recipientIdOrHandle, text } = params;
    if (!session.authToken || !session.ct0) {
      return { success: false, error: "Missing active Twitter session." };
    }

    const cookieHeader = `auth_token=${session.authToken}; ct0=${session.ct0}; ${session.twid ? `twid=${session.twid}` : ""}`;

    const payload = {
      event: {
        type: "message_create",
        message_create: {
          target: { recipient_id: recipientIdOrHandle.replace(/^@/, "") },
          message_data: { text: text.trim() },
        },
      },
    };

    const res = await fetch("https://x.com/i/api/1.1/dm/new2.json", {
      method: "POST",
      headers: {
        authorization: TWITTER_WEB_BEARER,
        "x-csrf-token": session.ct0,
        "x-twitter-auth-type": "OAuth2Session",
        "x-twitter-active-user": "yes",
        "Content-Type": "application/json",
        cookie: cookieHeader,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: true, messageId: data.event?.id || `x_sent_${Date.now()}` };
    }

    const err = await res.text().catch(() => "Unknown error");
    return { success: false, error: `Failed to send DM: ${err}` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
