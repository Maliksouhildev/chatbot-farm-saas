import { TelegramClient, Api, utils } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

// Silent Logger to prevent GramJS internal ping TIMEOUT and reconnect logs from spamming terminal
class SilentTelegramLogger {
  canSend() {
    return false;
  }
  error() {}
  warn() {}
  info() {}
  debug() {}
  _log() {}
}

export const silentTelegramLogger = new SilentTelegramLogger();

if (typeof process !== 'undefined' && typeof process.on === 'function') {
  // Prevent GramJS background ping timeout spam from printing or terminating the node process
  process.on('unhandledRejection', (reason: any) => {
    if (
      reason &&
      (reason.message === 'TIMEOUT' ||
        reason.message?.includes?.('TIMEOUT') ||
        (typeof reason.stack === 'string' && reason.stack.includes('telegram/client/updates.js')))
    ) {
      // Silently swallow GramJS background update/ping timeouts
      return;
    }
  });
}

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
    baseLogger: silentTelegramLogger as any,
  });
  (client as any)._errorHandler = async () => {};

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
      (existing as any)._loopStarted = true;
      (existing as any)._errorHandler = async () => {};
      await existing.connect();
      return existing;
    } catch {
      clientPool.delete(sessionString);
    }
  }

  const stringSession = new StringSession(sessionString);
  const client = new TelegramClient(stringSession, API_ID, API_HASH, {
    connectionRetries: 3,
    autoReconnect: true,
    useWSS: false,
    baseLogger: silentTelegramLogger as any,
  });

  // Mark _loopStarted = true to prevent GramJS from spawning the runaway 9-second ping loop
  (client as any)._loopStarted = true;
  (client as any)._errorHandler = async () => {};

  try {
    if (typeof (client as any).on === 'function') {
      (client as any).on('error', () => {
        // Silently swallow transient background ping/connection timeout events
      });
    }
  } catch {}

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
    baseLogger: silentTelegramLogger as any,
  });
  (client as any)._loopStarted = true;
  (client as any)._errorHandler = async () => {};

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
      baseLogger: silentTelegramLogger as any,
    });
    (client as any)._loopStarted = true;
    (client as any)._errorHandler = async () => {};
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

// In-memory cache for Telegram chats per session: sessionKey -> { chats: any[], timestamp: number }
const telegramChatsCache = new Map<string, { chats: any[]; timestamp: number }>();

export function getCachedTelegramChats(sessionKey: string): any[] | null {
  const entry = telegramChatsCache.get(sessionKey);
  if (entry && Date.now() - entry.timestamp < 30 * 1000) {
    return entry.chats;
  }
  return null;
}

export function setCachedTelegramChats(sessionKey: string, chats: any[]) {
  telegramChatsCache.set(sessionKey, { chats, timestamp: Date.now() });
}

export async function markTelegramChatRead(session: string, chatId: string, topicId?: string) {
  try {
    const entry = telegramChatsCache.get(session);
    if (entry && Array.isArray(entry.chats)) {
      entry.chats = entry.chats.map((c: any) => {
        if (String(c.id) === String(chatId)) {
          let updatedTopics = c.topics;
          if (topicId && Array.isArray(c.topics)) {
            updatedTopics = c.topics.map((t: any) =>
              String(t.id) === String(topicId) ? { ...t, unreadCount: 0 } : t
            );
          } else if (Array.isArray(c.topics)) {
            updatedTopics = c.topics.map((t: any) => ({ ...t, unreadCount: 0 }));
          }
          return {
            ...c,
            unreadCount: 0,
            topics: updatedTopics,
          };
        }
        return c;
      });
    }

    const topicsEntry = forumTopicsCache.get(chatId);
    if (topicsEntry && Array.isArray(topicsEntry.topics)) {
      if (topicId) {
        topicsEntry.topics = topicsEntry.topics.map((t: any) =>
          String(t.id) === String(topicId) ? { ...t, unreadCount: 0 } : t
        );
      } else {
        topicsEntry.topics = topicsEntry.topics.map((t: any) => ({ ...t, unreadCount: 0 }));
      }
    }
  } catch {}

  if (session && !session.startsWith('demo_') && !session.startsWith('test_')) {
    try {
      const client = await getClientFromSession(session);
      await Promise.race([
        client.markAsRead(chatId),
        new Promise<void>((_, reject) => setTimeout(() => reject(new Error('markAsRead timeout')), 3500))
      ]);
    } catch (err: any) {
      console.warn('[Telegram MTProto] markAsRead notice:', err.message);
    }
  }
}

// In-memory cache for recent Telegram messages: `${chatId}:${topicId || 'root'}:${sessionKey}` -> { messages: any[], timestamp: number }
const telegramMessagesCache = new Map<string, { messages: any[]; timestamp: number }>();

export function getCachedTelegramMessages(key: string): any[] | null {
  const entry = telegramMessagesCache.get(key);
  if (entry && Date.now() - entry.timestamp < 20 * 1000) {
    return entry.messages;
  }
  return null;
}

export function setCachedTelegramMessages(key: string, messages: any[]) {
  telegramMessagesCache.set(key, { messages, timestamp: Date.now() });
}

export function clearCachedTelegramMessages(chatId?: string) {
  if (chatId) {
    Array.from(telegramMessagesCache.keys()).forEach((key) => {
      if (key.startsWith(`${chatId}:`)) {
        telegramMessagesCache.delete(key);
      }
    });
  } else {
    telegramMessagesCache.clear();
  }
}

// In-memory cache for getMe user profile per session
export const clientMeCache = new Map<string, any>();

// In-memory cache for Telegram Entities (InputPeer / Channel / User) with valid access_hash per session
export const telegramEntitiesMap = new Map<string, any>();

// In-memory cache for raw Telegram Entities per session
export const telegramRawEntitiesMap = new Map<string, any>();

export function recordTelegramEntity(session: string, dialogOrEntity: any) {
  if (!session || !dialogOrEntity) return;
  try {
    const entity = dialogOrEntity.entity || dialogOrEntity;
    let inputEntity = dialogOrEntity.inputEntity || null;
    if (!inputEntity && entity) {
      try {
        inputEntity = utils.getInputPeer(entity);
      } catch {
        try {
          if (entity.className === 'Channel' && entity.accessHash) {
            inputEntity = new Api.InputPeerChannel({ channelId: entity.id, accessHash: entity.accessHash });
          } else if (entity.className === 'User' && entity.accessHash) {
            inputEntity = new Api.InputPeerUser({ userId: entity.id, accessHash: entity.accessHash });
          } else if (entity.className === 'Chat') {
            inputEntity = new Api.InputPeerChat({ chatId: entity.id });
          }
        } catch {}
      }
    }

    const idStr = String(dialogOrEntity.id || entity?.id || '').trim();
    const entityIdStr = entity?.id ? String(entity.id).trim() : '';
    const cleanDigits = idStr.replace(/\D/g, '') || entityIdStr.replace(/\D/g, '');

    const keysToStore = new Set<string>();
    if (idStr) keysToStore.add(idStr);
    if (entityIdStr) keysToStore.add(entityIdStr);
    if (cleanDigits) {
      keysToStore.add(cleanDigits);
      keysToStore.add(`-100${cleanDigits}`);
      keysToStore.add(`-${cleanDigits}`);
      keysToStore.add(`tg_${cleanDigits}`);
    }
    if (idStr.startsWith('-100')) {
      keysToStore.add(idStr.replace('-100', ''));
    }
    if (idStr.startsWith('-')) {
      keysToStore.add(idStr.substring(1));
    }
    const username = entity?.username ? String(entity.username).toLowerCase() : '';
    if (username) {
      keysToStore.add(username);
      keysToStore.add(`@${username}`);
    }

    keysToStore.forEach((k) => {
      if (inputEntity) {
        telegramEntitiesMap.set(`${session}:${k}`, inputEntity);
      }
      if (entity) {
        telegramEntitiesMap.set(`${session}:${k}:entity`, entity);
        telegramRawEntitiesMap.set(`${session}:${k}`, entity);
      }
    });
  } catch {}
}

export function getTelegramEntity(session: string, id: string): any {
  if (!session || !id) return null;
  const target = String(id).trim();

  // 1. Direct key match
  let ent = telegramEntitiesMap.get(`${session}:${target}`);
  if (ent) return ent;

  // 2. Normalized -100 prefix
  if (target.startsWith('-100')) {
    ent = telegramEntitiesMap.get(`${session}:${target.replace('-100', '')}`);
    if (ent) return ent;
  } else if (/^\d+$/.test(target)) {
    ent = telegramEntitiesMap.get(`${session}:-100${target}`) ||
          telegramEntitiesMap.get(`${session}:-${target}`);
    if (ent) return ent;
  } else if (target.startsWith('-')) {
    ent = telegramEntitiesMap.get(`${session}:${target.substring(1)}`);
    if (ent) return ent;
  }

  // 3. Digits-only match
  const digits = target.replace(/\D/g, '');
  if (digits) {
    ent = telegramEntitiesMap.get(`${session}:${digits}`) ||
          telegramEntitiesMap.get(`${session}:-100${digits}`) ||
          telegramEntitiesMap.get(`${session}:-${digits}`);
    if (ent) return ent;
  }

  // 4. Case-insensitive username match
  if (target.startsWith('@') || /^[a-zA-Z0-9_]+$/.test(target)) {
    const u = target.toLowerCase();
    ent = telegramEntitiesMap.get(`${session}:${u}`) || telegramEntitiesMap.get(`${session}:@${u}`);
    if (ent) return ent;
  }

  return null;
}

export function getTelegramRawEntity(session: string, id: string): any {
  if (!session || !id) return null;
  const target = String(id).trim();

  let ent = telegramRawEntitiesMap.get(`${session}:${target}`);
  if (ent) return ent;

  if (target.startsWith('-100')) {
    ent = telegramRawEntitiesMap.get(`${session}:${target.replace('-100', '')}`);
    if (ent) return ent;
  } else if (/^\d+$/.test(target)) {
    ent = telegramRawEntitiesMap.get(`${session}:-100${target}`) ||
          telegramRawEntitiesMap.get(`${session}:-${target}`);
    if (ent) return ent;
  } else if (target.startsWith('-')) {
    ent = telegramRawEntitiesMap.get(`${session}:${target.substring(1)}`);
    if (ent) return ent;
  }

  const digits = target.replace(/\D/g, '');
  if (digits) {
    ent = telegramRawEntitiesMap.get(`${session}:${digits}`) ||
          telegramRawEntitiesMap.get(`${session}:-100${digits}`) ||
          telegramRawEntitiesMap.get(`${session}:-${digits}`);
    if (ent) return ent;
  }

  if (target.startsWith('@') || /^[a-zA-Z0-9_]+$/.test(target)) {
    const u = target.toLowerCase();
    ent = telegramRawEntitiesMap.get(`${session}:${u}`) || telegramRawEntitiesMap.get(`${session}:@${u}`);
    if (ent) return ent;
  }

  return null;
}

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
      const messagesMap = new Map<number, any>();
      if (Array.isArray((res as any).messages)) {
        for (const msg of (res as any).messages) {
          if (msg && msg.id) messagesMap.set(msg.id, msg);
        }
      }

      const usersMap = new Map<string, string>();
      if (Array.isArray((res as any).users)) {
        for (const u of (res as any).users) {
          const uName = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || "User";
          usersMap.set(String(u.id), uName);
        }
      }

      const topics = (res as any).topics
        .filter((t: any) => t.className === "ForumTopic" || t.title)
        .map((t: any) => {
          const topMsg = t.topMessage ? messagesMap.get(t.topMessage) : null;
          let lastMsgText = topMsg?.message || "";
          if (!lastMsgText && topMsg?.media) {
            lastMsgText = "Attachment";
          }
          let senderName = "";
          if (topMsg?.fromId) {
            const senderIdStr = String(topMsg.fromId.userId || topMsg.fromId.channelId || "");
            senderName = usersMap.get(senderIdStr) || "";
          }
          const isGeneral = Number(t.id) === 1 || t.title?.toLowerCase() === "general";
          // Reflect reality: Topic is only closed if Telegram API explicitly flags it as closed
          const isClosed = Boolean(t.closed);

          const rawUnread = t.unreadCount !== undefined ? t.unreadCount : (t.unread_count !== undefined ? t.unread_count : 0);
          const hasUnreadFromMaxId = Boolean(t.topMessage && t.readInboxMaxId && t.topMessage > t.readInboxMaxId);
          const effectiveTopicUnread = rawUnread > 0 ? rawUnread : (hasUnreadFromMaxId ? Math.max(1, t.topMessage - t.readInboxMaxId) : 0);

          return {
            id: String(t.id),
            name: t.title || (isGeneral ? "General" : `Topic ${t.id}`),
            unreadCount: effectiveTopicUnread,
            pinned: Boolean(t.pinned),
            closed: isClosed,
            iconColor: t.iconColor ? `#${(t.iconColor & 0x00FFFFFF).toString(16).padStart(6, "0")}` : undefined,
            iconEmojiId: t.iconEmojiId ? String(t.iconEmojiId) : undefined,
            topMessage: t.topMessage,
            lastMessage: lastMsgText,
            lastMessageSender: senderName,
            date: topMsg?.date || t.date,
            avatarText: (t.title && t.title.trim()[0]) ? t.title.trim()[0].toUpperCase() : "#",
          };
        });

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
  if (session && dialog) {
    recordTelegramEntity(session, dialog);
  }

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
      if (mClass === "MessageMediaPhoto") lastMessage = "Photo";
      else if (mClass === "MessageMediaDocument") lastMessage = "Document";
      else if (mClass === "MessageMediaPoll") lastMessage = "Poll";
      else lastMessage = "Media";
    } else if (dialog.message.action) {
      const aClass = dialog.message.action.className || dialog.message.action._ || "";
      if (aClass.includes("PhoneCall") || aClass.includes("phoneCall") || aClass.includes("Call")) {
        const isVideo = Boolean(dialog.message.action.video);
        const isOut = Boolean(dialog.message.out);
        const reasonClass = String(dialog.message.action.reason?.className || dialog.message.action.reason?._ || "").toLowerCase();
        const dur = Number(dialog.message.action.duration || 0);
        const isMissed = reasonClass.includes("missed") || reasonClass.includes("busy") || (!isOut && dur === 0);
        const durStr = dur > 0 ? (dur >= 60 ? `${Math.floor(dur / 60)}m ${dur % 60}s` : `${dur}s`) : undefined;
        if (isMissed) {
          lastMessage = isVideo ? "Appel vidéo manqué" : "Appel vocal manqué";
        } else if (isOut) {
          lastMessage = isVideo ? (durStr ? `Appel vidéo sortant (${durStr})` : "Appel vidéo sortant") : (durStr ? `Appel vocal sortant (${durStr})` : "Appel vocal sortant");
        } else {
          lastMessage = isVideo ? (durStr ? `Appel vidéo entrant (${durStr})` : "Appel vidéo entrant") : (durStr ? `Appel vocal entrant (${durStr})` : "Appel vocal entrant");
        }
      } else if (aClass.includes("ChatAddUser")) lastMessage = "Joined group";
      else if (aClass.includes("PinMessage")) lastMessage = "Pinned message";
      else if (aClass.includes("ChatEditTitle")) lastMessage = `Changed group title to ${dialog.message.action.title || ''}`;
      else if (aClass.includes("ChatEditPhoto")) lastMessage = "Changed group photo";
      else lastMessage = "Notification";
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
  if (dialog.message) {
    const isOut = Boolean(dialog.message.out);
    const aClass = dialog.message.action?.className || dialog.message.action?._ || "";
    const isPhoneCall = aClass.includes("PhoneCall") || aClass.includes("phoneCall") || aClass.includes("Call");
    const isServiceAction = !isPhoneCall && Boolean(dialog.message.action || dialog.message.className === 'MessageService' || dialog.message._ === 'messageService');
    const isVideo = Boolean(dialog.message.action?.video);
    const durNum = Number(dialog.message.action?.duration || 0);
    const reasonClass = String(dialog.message.action?.reason?.className || dialog.message.action?.reason?._ || '').toLowerCase();
    const isMissed = reasonClass.includes('missed') || reasonClass.includes('busy') || (!isOut && durNum === 0);
    const durStr = durNum > 0 ? (durNum >= 60 ? `${Math.floor(durNum / 60)}m ${durNum % 60}s` : `${durNum}s`) : undefined;
    const callType = isPhoneCall ? (isVideo ? (isOut ? 'outgoing_video' : isMissed ? 'missed_video' : 'incoming_video') : (isOut ? 'outgoing_voice' : isMissed ? 'missed_voice' : 'incoming_voice')) : undefined;
    const callOutcome = isPhoneCall ? (isMissed ? 'Missed' : isOut ? (durNum > 0 ? 'Outgoing' : 'Cancelled') : 'Incoming') : undefined;

    const mText = dialog.message.message || lastMessage || 'Message';
    const r = dialog.message.replyTo || dialog.message.reply_to;
    const replyTop = r?.replyToTopId || r?.reply_to_top_id;
    const replyMsg = r?.replyToMsgId || r?.reply_to_msg_id;
    const isForum = Boolean(r?.forumTopic || r?.forum_topic);
    const msgTopicId = replyTop ? String(replyTop) : (isForum && replyMsg ? String(replyMsg) : (isForum ? '1' : undefined));

    initialMessages.push({
      id: String(dialog.message.id || Date.now()),
      sender: isOut ? 'operator' : 'customer',
      senderName: isOut ? 'You' : title,
      text: mText,
      time: timeStr,
      timestamp,
      delivered: true,
      seen: true,
      isEvent: isServiceAction,
      isSystem: isServiceAction,
      type: isServiceAction ? 'service' : undefined,
      isCall: isPhoneCall,
      callType,
      callDuration: durStr,
      callOutcome,
      topicId: msgTopicId,
    });
  }

  // Rich member / subscriber counts for handleOrPhone and statusText
  let handleOrPhone = username;
  if (!handleOrPhone) {
    if (isBroadcastChannel) {
      handleOrPhone = entity.participantsCount ? `${entity.participantsCount.toLocaleString()} subscribers` : 'Channel';
    } else if (isGroup) {
      handleOrPhone = entity.participantsCount ? `${entity.participantsCount.toLocaleString()} members` : 'Group';
    } else if (entity.phone) {
      handleOrPhone = `+${entity.phone}`;
    } else {
      handleOrPhone = entity.bot ? 'Telegram Bot' : 'Telegram Contact';
    }
  }

  let statusText = isGroup ? "Group" : isChannel ? "Channel" : isUser ? (entity.bot ? "Telegram Bot" : "Online on Telegram") : "Group";
  if (entity.participantsCount) {
    statusText = isBroadcastChannel ? `${entity.participantsCount.toLocaleString()} subscribers` : `${entity.participantsCount.toLocaleString()} members`;
  }

  let effectiveTopics = realTopics;
  if (realTopics && realTopics.length > 0) {
    const totalTopicsUnread = realTopics.reduce((sum: number, t: any) => sum + (t.unreadCount || 0), 0);
    if ((dialog.unreadCount || 0) > 0 && totalTopicsUnread === 0) {
      const targetTopicId = initialMessages[0]?.topicId || realTopics[0]?.id;
      effectiveTopics = realTopics.map((t: any) => {
        if (String(t.id) === String(targetTopicId)) {
          return { ...t, unreadCount: dialog.unreadCount || 1 };
        }
        return t;
      });
    }
  }

  return {
    id,
    appId: "telegram",
    name: title,
    handleOrPhone,
    lastMessage: lastMessage || 'No messages yet',
    time: timeStr,
    lastMessageTime: timeStr,
    timestamp,
    unreadCount: dialog.unreadCount || 0,
    statusText,
    avatarText: (title[0] || "T").toUpperCase(),
    profilePicUrl,
    isGroup,
    isChannel: isChannel || isBroadcastChannel,
    isBroadcast: isBroadcastChannel,
    isReadOnly,
    canSend: !isReadOnly,
    topics: effectiveTopics && effectiveTopics.length > 0 ? effectiveTopics : undefined,
    messages: initialMessages,
  };
}

/**
 * Real Telegram chats store (no synthetic or fake chats)
 */
export const TELEGRAM_DEMO_CHATS: any[] = [];
