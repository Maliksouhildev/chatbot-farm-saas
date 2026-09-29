import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";

// Default Telegram Web Client credentials (can be overridden via environment variables)
const API_ID = parseInt(process.env.TELEGRAM_API_ID || "2040", 10);
const API_HASH = process.env.TELEGRAM_API_HASH || "b18441a1ff607e10a989891a5462e627";

// In-memory store for pending 2-step auth sessions
interface PendingAuth {
  client: TelegramClient;
  phoneCodeHash: string;
  timestamp: number;
}

const pendingAuthStore = new Map<string, PendingAuth>();

// Active client pool for authenticated sessions
const clientPool = new Map<string, TelegramClient>();

interface TelegramQrSession {
  id: string;
  client: TelegramClient;
  qrPayload: string;
  expiresAt: number;
  timestamp: number;
  status: "pending" | "success" | "expired" | "error";
  user?: {
    id: string;
    firstName: string;
    lastName?: string;
    username?: string;
    phone: string;
  };
  sessionString?: string;
  error?: string;
}

const telegramQrSessions = new Map<string, TelegramQrSession>();

export async function getTelegramQrSession(sessionId?: string): Promise<{
  sessionId: string;
  qrPayload?: string;
  expiresAt?: number;
  status: "pending" | "success" | "expired" | "error";
  user?: any;
  sessionString?: string;
  error?: string;
}> {
  const now = Date.now();

  // Clean up old sessions (> 5 mins)
  telegramQrSessions.forEach((sess, key) => {
    if (now - sess.timestamp > 5 * 60 * 1000) {
      try { sess.client.disconnect(); } catch {}
      telegramQrSessions.delete(key);
    }
  });

  if (sessionId && telegramQrSessions.has(sessionId)) {
    const sess = telegramQrSessions.get(sessionId)!;
    if (sess.status === "success") {
      return {
        sessionId: sess.id,
        status: "success",
        user: sess.user,
        sessionString: sess.sessionString,
      };
    }

    try {
      if (!sess.client.connected) {
        await sess.client.connect();
      }

      const res = await sess.client.invoke(
        new Api.auth.ExportLoginToken({
          apiId: API_ID,
          apiHash: API_HASH,
          exceptIds: [],
        })
      );

      if (res instanceof Api.auth.LoginTokenSuccess && res.authorization instanceof Api.auth.Authorization) {
        const me = (await sess.client.getMe()) as any;
        const sessionString = sess.client.session.save() as unknown as string;
        sess.status = "success";
        sess.user = {
          id: String(me.id),
          firstName: me.firstName || "Telegram User",
          lastName: me.lastName || "",
          username: me.username || "",
          phone: me.phone || "",
        };
        sess.sessionString = sessionString;
        clientPool.set(sessionString, sess.client);
        return {
          sessionId: sess.id,
          status: "success",
          user: sess.user,
          sessionString,
        };
      } else if (res instanceof Api.auth.LoginTokenMigrateTo) {
        await sess.client._switchDC(res.dcId);
        const migrated = await sess.client.invoke(
          new Api.auth.ImportLoginToken({ token: res.token })
        );
        if (migrated instanceof Api.auth.LoginTokenSuccess && migrated.authorization instanceof Api.auth.Authorization) {
          const me = (await sess.client.getMe()) as any;
          const sessionString = sess.client.session.save() as unknown as string;
          sess.status = "success";
          sess.user = {
            id: String(me.id),
            firstName: me.firstName || "Telegram User",
            lastName: me.lastName || "",
            username: me.username || "",
            phone: me.phone || "",
          };
          sess.sessionString = sessionString;
          clientPool.set(sessionString, sess.client);
          return {
            sessionId: sess.id,
            status: "success",
            user: sess.user,
            sessionString,
          };
        }
      } else if (res instanceof Api.auth.LoginToken) {
        const b64 = Buffer.from(res.token).toString("base64url");
        sess.qrPayload = `tg://login?token=${b64}`;
        sess.expiresAt = res.expires * 1000;
        return {
          sessionId: sess.id,
          status: "pending",
          qrPayload: sess.qrPayload,
          expiresAt: sess.expiresAt,
        };
      }
    } catch (err: any) {
      if (err.message && err.message.includes("SESSION_PASSWORD_NEEDED")) {
        return {
          sessionId: sess.id,
          status: "pending",
          error: "SESSION_PASSWORD_NEEDED",
        };
      }
      console.warn("Telegram QR check warning:", err.message);
    }

    return {
      sessionId: sess.id,
      status: sess.status,
      qrPayload: sess.qrPayload,
      expiresAt: sess.expiresAt,
    };
  }

  // Create fresh new Telegram client for QR login
  const newSessionId = `tg_qr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const client = new TelegramClient(new StringSession(""), API_ID, API_HASH, {
    connectionRetries: 3,
  });

  await client.connect();

  const tokenRes = await client.invoke(
    new Api.auth.ExportLoginToken({
      apiId: API_ID,
      apiHash: API_HASH,
      exceptIds: [],
    })
  );

  if (!(tokenRes instanceof Api.auth.LoginToken)) {
    throw new Error("Failed to export Telegram login token");
  }

  const b64 = Buffer.from(tokenRes.token).toString("base64url");
  const qrPayload = `tg://login?token=${b64}`;
  const expiresAt = tokenRes.expires * 1000;

  const sessionObj: TelegramQrSession = {
    id: newSessionId,
    client,
    qrPayload,
    expiresAt,
    timestamp: Date.now(),
    status: "pending",
  };

  // Add event handler for immediate scan detection
  client.addEventHandler(async (update) => {
    if (update instanceof Api.UpdateLoginToken) {
      try {
        const confirmRes = await client.invoke(
          new Api.auth.ExportLoginToken({
            apiId: API_ID,
            apiHash: API_HASH,
            exceptIds: [],
          })
        );
        if (confirmRes instanceof Api.auth.LoginTokenSuccess && confirmRes.authorization instanceof Api.auth.Authorization) {
          const me = (await client.getMe()) as any;
          const sessionString = client.session.save() as unknown as string;
          sessionObj.status = "success";
          sessionObj.user = {
            id: String(me.id),
            firstName: me.firstName || "Telegram User",
            lastName: me.lastName || "",
            username: me.username || "",
            phone: me.phone || "",
          };
          sessionObj.sessionString = sessionString;
          clientPool.set(sessionString, client);
        }
      } catch (e) {
        console.warn("Error handling UpdateLoginToken:", e);
      }
    }
  });

  telegramQrSessions.set(newSessionId, sessionObj);

  return {
    sessionId: newSessionId,
    status: "pending",
    qrPayload,
    expiresAt,
  };
}

export function cancelTelegramQrSession(sessionId: string): void {
  if (telegramQrSessions.has(sessionId)) {
    try {
      telegramQrSessions.get(sessionId)!.client.disconnect();
    } catch {}
    telegramQrSessions.delete(sessionId);
  }
}

export async function getClientFromSession(sessionString: string): Promise<TelegramClient> {
  if (clientPool.has(sessionString)) {
    const existing = clientPool.get(sessionString)!;
    if (existing.connected) return existing;
    try {
      await existing.connect();
      return existing;
    } catch {
      clientPool.delete(sessionString);
    }
  }

  const stringSession = new StringSession(sessionString);
  const client = new TelegramClient(stringSession, API_ID, API_HASH, {
    connectionRetries: 3,
    useWSS: false,
  });

  await client.connect();
  clientPool.set(sessionString, client);
  return client;
}

/**
 * Step 1: Send Telegram 5-digit verification code to phone number
 */
export async function sendTelegramPhoneCode(phoneNumber: string): Promise<{ phoneCodeHash: string; isCodeViaApp?: boolean }> {
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, "");

  // Clean up any stale sessions (> 10 mins)
  const now = Date.now();
  pendingAuthStore.forEach((val, key) => {
    if (now - val.timestamp > 10 * 60 * 1000) {
      try { val.client.disconnect(); } catch {}
      pendingAuthStore.delete(key);
    }
  });

  const client = new TelegramClient(new StringSession(""), API_ID, API_HASH, {
    connectionRetries: 3,
  });

  await client.connect();

  const res = await client.sendCode(
    {
      apiId: API_ID,
      apiHash: API_HASH,
    },
    cleanPhone
  );

  pendingAuthStore.set(cleanPhone, {
    client,
    phoneCodeHash: res.phoneCodeHash,
    timestamp: Date.now(),
  });

  return {
    phoneCodeHash: res.phoneCodeHash,
    isCodeViaApp: res.isCodeViaApp,
  };
}

/**
 * Step 2: Sign in with the 5-digit code and optional 2FA password
 */
export async function signInWithTelegramCode(
  phoneNumber: string,
  phoneCode: string,
  phoneCodeHash?: string,
  password?: string
): Promise<{
  sessionString: string;
  user: {
    id: string;
    firstName: string;
    lastName?: string;
    username?: string;
    phone: string;
  };
}> {
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, "");
  let pending = pendingAuthStore.get(cleanPhone);

  let client: TelegramClient;
  let codeHash = phoneCodeHash || pending?.phoneCodeHash;

  if (pending) {
    client = pending.client;
  } else {
    // Recreate fresh client if session was purged
    client = new TelegramClient(new StringSession(""), API_ID, API_HASH, {
      connectionRetries: 3,
    });
    await client.connect();
  }

  if (!codeHash) {
    throw new Error("Missing phone code hash. Please request a new verification code.");
  }

  try {
    await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: cleanPhone,
        phoneCodeHash: codeHash,
        phoneCode: phoneCode.trim(),
      })
    );
  } catch (err: any) {
    if (err.message && err.message.includes("SESSION_PASSWORD_NEEDED") && password) {
      const pwdRes = await client.invoke(new Api.account.GetPassword());
      const { computeCheck } = await import("telegram/Password");
      const passwordCheck = await computeCheck(pwdRes, password.trim());
      await client.invoke(new Api.auth.CheckPassword({ password: passwordCheck }));
    } else {
      throw err;
    }
  }

  const sessionString = client.session.save() as unknown as string;
  const me = (await client.getMe()) as any;

  pendingAuthStore.delete(cleanPhone);
  clientPool.set(sessionString, client);

  return {
    sessionString,
    user: {
      id: String(me.id),
      firstName: me.firstName || "Telegram User",
      lastName: me.lastName || "",
      username: me.username || "",
      phone: me.phone || cleanPhone,
    },
  };
}

/**
 * Format telegram entity into a standard chat contact object
 */
export function formatTelegramChat(dialog: any): any {
  const entity = dialog.entity || {};
  const isUser = entity.className === "User";
  const isChannel = entity.className === "Channel";

  const id = String(dialog.id || entity.id);
  const firstName = entity.firstName || "";
  const lastName = entity.lastName || "";
  const title = entity.title || [firstName, lastName].filter(Boolean).join(" ") || "Telegram Chat";
  const username = entity.username ? `@${entity.username}` : `ID: ${id}`;

  const lastMessage = dialog.message?.message || (dialog.message?.media ? "📷 Attachment" : "No messages yet");
  const date = dialog.date ? new Date(dialog.date * 1000) : new Date();
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return {
    id,
    appId: "telegram",
    name: title,
    handleOrPhone: username,
    lastMessage,
    time: timeStr,
    lastMessageTime: timeStr,
    timestamp: date.getTime(),
    unreadCount: dialog.unreadCount || 0,
    statusText: isChannel ? "Channel" : isUser ? (entity.bot ? "Telegram Bot" : "Online on Telegram") : "Group",
    avatarText: (title[0] || "T").toUpperCase(),
    messages: [],
  };
}

/**
 * Real Telegram chats store (no synthetic or fake chats)
 */
export const TELEGRAM_DEMO_CHATS: any[] = [];
