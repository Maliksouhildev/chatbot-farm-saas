import { TelegramClient, Api, utils } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

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

  await Promise.race([
    client.connect(),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Telegram client connection timeout")), 6000))
  ]);
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

// In-memory cache for forum topics: chatId -> { topics, timestamp }
const forumTopicsCache = new Map<string, { topics: any[]; timestamp: number }>();

export async function getTelegramForumTopics(client: TelegramClient, entity: any, chatId: string): Promise<any[] | undefined> {
  const cached = forumTopicsCache.get(chatId);
  if (cached && Date.now() - cached.timestamp < 30 * 1000) {
    return cached.topics;
  }

  try {
    let inputChannel: any;
    try {
      inputChannel = utils.getInputChannel(entity);
    } catch {
      try {
        const peer = await client.getInputEntity(entity);
        inputChannel = utils.getInputChannel(peer);
      } catch {
        try {
          const numId = Number(chatId);
          if (!isNaN(numId)) {
            const peer = await client.getInputEntity(numId);
            inputChannel = utils.getInputChannel(peer);
          }
        } catch {}
      }
    }

    if (!inputChannel) {
      console.warn(`[Telegram MTProto] Could not resolve input channel for ${chatId}`);
      return undefined;
    }

    const res = await client.invoke(
      new Api.channels.GetForumTopics({
        channel: inputChannel,
        offsetDate: 0,
        offsetId: 0,
        offsetTopic: 0,
        limit: 100,
      })
    );

    if (res && Array.isArray((res as any).topics)) {
      const topics = (res as any).topics
        .filter((t: any) => t.className === "ForumTopic" || t.title)
        .map((t: any) => ({
          id: String(t.id),
          name: t.title || `Topic ${t.id}`,
          unreadCount: t.unreadCount || 0,
          pinned: Boolean(t.pinned),
          closed: Boolean(t.closed && !t.my && Number(t.id) !== 1 && t.title?.toLowerCase() !== 'general'),
          iconColor: t.iconColor ? `#${(t.iconColor & 0x00FFFFFF).toString(16).padStart(6, "0")}` : undefined,
          iconEmojiId: t.iconEmojiId ? String(t.iconEmojiId) : undefined,
          topMessage: t.topMessage,
          date: t.date,
          avatarText: (t.title && t.title.trim()[0]) ? t.title.trim()[0].toUpperCase() : "#",
        }));

      forumTopicsCache.set(chatId, { topics, timestamp: Date.now() });
      return topics;
    }
  } catch (err: any) {
    console.warn(`[Telegram MTProto] Could not fetch forum topics for ${chatId}:`, err?.message);
  }
  return undefined;
}

/**
 * Format telegram entity into a standard chat contact object
 */
export function formatTelegramChat(dialog: any, session?: string, realTopics?: any[]): any {
  const entity = dialog.entity || {};
  const isUser = entity.className === "User";
  const isChannel = entity.className === "Channel";
  const isChat = entity.className === "Chat";
  const isMegagroup = isChannel && (entity.megagroup || entity.gigagroup);
  const isGroup = isChat || isMegagroup || Boolean(entity.forum);
  const isBroadcastChannel = isChannel && !entity.megagroup && !entity.gigagroup;

  // Determine if sending is restricted (read-only Telegram broadcast channel or banned)
  const isAdminOrCreator = Boolean(
    entity.creator ||
    (entity.adminRights && (entity.adminRights.postMessages || entity.adminRights.sendMessages))
  );
  const isBannedFromSending = Boolean(
    entity.bannedRights?.sendMessages || 
    entity.kicked
  );
  const isReadOnly = (isBroadcastChannel && !isAdminOrCreator) || isBannedFromSending;

  const id = String(dialog.id || entity.id);
  const firstName = entity.firstName || "";
  const lastName = entity.lastName || "";
  const title = entity.title || [firstName, lastName].filter(Boolean).join(" ") || "Telegram Chat";
  const username = entity.username ? `@${entity.username}` : '';

  let lastMessage = "";
  if (dialog.message) {
    if (dialog.message.message) {
      lastMessage = dialog.message.message;
    } else if (dialog.message.media) {
      const mClass = dialog.message.media.className;
      if (mClass === "MessageMediaPhoto") lastMessage = "📷 Photo";
      else if (mClass === "MessageMediaDocument") lastMessage = "📄 Document";
      else lastMessage = "📷 Media";
    } else if (dialog.message.action) {
      lastMessage = "";
    }
  }

  const msgDate = dialog.message?.date || dialog.date;
  const timestamp = msgDate ? msgDate * 1000 : 0;
  const date = msgDate ? new Date(msgDate * 1000) : null;
  const timeStr = date ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  const hasPhoto = Boolean(entity.photo && entity.photo.className !== "UserProfilePhotoEmpty" && entity.photo.className !== "ChatPhotoEmpty");
  const profilePicUrl = hasPhoto && session
    ? `/api/channels/telegram/avatar?id=${encodeURIComponent(id)}&session=${encodeURIComponent(session)}`
    : null;

  const initialMessages: any[] = [];
  if (dialog.message && (dialog.message.message || dialog.message.media || dialog.message.action)) {
    const isOut = Boolean(dialog.message.out);
    const mText = dialog.message.message || (dialog.message.media ? lastMessage : '');
    if (mText) {
      initialMessages.push({
        id: String(dialog.message.id || Date.now()),
        sender: isOut ? 'operator' : 'customer',
        senderName: isOut ? 'You' : title,
        text: mText,
        time: timeStr,
        timestamp,
        delivered: true,
        seen: true,
        topicId: dialog.message.replyTo?.forumTopic ? String(dialog.message.replyTo.replyToTopId || 1) : undefined,
      });
    }
  }

  return {
    id,
    appId: "telegram",
    name: title,
    handleOrPhone: username,
    lastMessage,
    time: timeStr,
    lastMessageTime: timeStr,
    timestamp,
    unreadCount: dialog.unreadCount || 0,
    statusText: isGroup ? "Group" : isChannel ? "Channel" : isUser ? (entity.bot ? "Telegram Bot" : "Online on Telegram") : "Group",
    avatarText: (title[0] || "T").toUpperCase(),
    profilePicUrl,
    isGroup,
    isChannel: isChannel || isBroadcastChannel,
    isBroadcast: isBroadcastChannel,
    isReadOnly,
    canSend: !isReadOnly,
    topics: realTopics && realTopics.length > 0 ? realTopics : undefined,
    messages: initialMessages,
  };
}

/**
 * Real Telegram chats store (no synthetic or fake chats)
 */
export const TELEGRAM_DEMO_CHATS: any[] = [];
