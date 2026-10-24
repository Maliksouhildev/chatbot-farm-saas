/**
 * Debounced Sliding Window Message Aggregator
 * 
 * Collects rapid consecutive messages from the same sender (texts, voice notes, images)
 * within a configurable sliding window (default 17 seconds).
 * Concatenates all text fragments with single spaces, preserves media in order,
 * and tracks the latestMessageId for native quoted replies.
 */

export interface BufferedMediaItem {
  type: 'text' | 'audio' | 'image';
  id: string;
  text?: string;
  url?: string;
  duration?: number;
  mimeType?: string;
  timestamp: number;
}

export interface BurstBuffer {
  key: string;
  appId: string;
  senderId: string;
  senderName: string;
  senderPhone: string;
  channelType: string;
  topicId?: string;
  guildId?: string;
  botId?: string;
  items: BufferedMediaItem[];
  timer?: NodeJS.Timeout;
  windowMs: number;
  lastActivity: number;
  onExpire?: (buffer: BurstBuffer) => Promise<void>;
}

// In-memory debounce registry by `${appId}:${senderId}`
const activeBuffers = new Map<string, BurstBuffer>();

export const DEFAULT_DEBOUNCE_SECONDS = 3;
export const DEFAULT_DEBOUNCE_MS = DEFAULT_DEBOUNCE_SECONDS * 1000;

/**
 * Generate unique cache key for a sender within an application
 */
export function getBufferKey(appId: string, senderId: string): string {
  const cleanApp = (appId || 'omnichannel').toLowerCase().trim();
  const cleanSender = String(senderId || 'anonymous').toLowerCase().trim();
  return `${cleanApp}:${cleanSender}`;
}

/**
 * Ingest a new inbound message into the debounced sliding window buffer
 */
export function ingestMessageToBuffer(params: {
  appId: string;
  senderId: string;
  senderName?: string;
  senderPhone?: string;
  channelType?: string;
  topicId?: string;
  guildId?: string;
  botId?: string;
  messageId?: string;
  text?: string;
  isAudio?: boolean;
  audioUrl?: string;
  audioDuration?: number;
  isImage?: boolean;
  imageUrl?: string;
  windowSeconds?: number;
  onExpire?: (buffer: BurstBuffer) => Promise<void>;
}): { bufferKey: string; itemCount: number; isNewSession: boolean } {
  const key = getBufferKey(params.appId, params.senderId);
  const now = Date.now();
  const windowMs = (params.windowSeconds || DEFAULT_DEBOUNCE_SECONDS) * 1000;
  const msgId = params.messageId || `msg_${now}_${Math.random().toString(36).substring(2, 7)}`;

  let buffer = activeBuffers.get(key);
  let isNewSession = false;

  if (!buffer) {
    isNewSession = true;
    buffer = {
      key,
      appId: params.appId,
      senderId: params.senderId,
      senderName: params.senderName || params.senderId,
      senderPhone: params.senderPhone || params.senderId,
      channelType: params.channelType || params.appId,
      topicId: params.topicId,
      guildId: params.guildId,
      botId: params.botId,
      items: [],
      windowMs,
      lastActivity: now,
      onExpire: params.onExpire,
    };
    activeBuffers.set(key, buffer);
  } else {
    // Reset existing timer for the sliding window
    if (buffer.timer) {
      clearTimeout(buffer.timer);
      buffer.timer = undefined;
    }
    buffer.lastActivity = now;
    if (params.onExpire) buffer.onExpire = params.onExpire;
    if (params.senderName) buffer.senderName = params.senderName;
    if (params.senderPhone) buffer.senderPhone = params.senderPhone;
  }

  // Append items
  if (params.isAudio && params.audioUrl) {
    buffer.items.push({
      type: 'audio',
      id: msgId,
      url: params.audioUrl,
      duration: params.audioDuration,
      timestamp: now,
    });
  } else if (params.isImage && params.imageUrl) {
    buffer.items.push({
      type: 'image',
      id: msgId,
      url: params.imageUrl,
      timestamp: now,
    });
  } else if (params.text && params.text.trim()) {
    buffer.items.push({
      type: 'text',
      id: msgId,
      text: params.text.trim(),
      timestamp: now,
    });
  }

  // Schedule expiration callback
  const onExpireHandler = buffer.onExpire;
  buffer.timer = setTimeout(async () => {
    const current = activeBuffers.get(key);
    if (!current) return;
    activeBuffers.delete(key);
    if (onExpireHandler) {
      try {
        await onExpireHandler(current);
      } catch (err) {
        console.error(`[DebounceBuffer] Error executing expiration callback for ${key}:`, err);
      }
    }
  }, windowMs);

  return {
    bufferKey: key,
    itemCount: buffer.items.length,
    isNewSession,
  };
}

/**
 * Flush and extract aggregated payload from a buffer immediately
 */
export function flushBuffer(key: string): {
  key: string;
  appId: string;
  senderId: string;
  senderName: string;
  senderPhone: string;
  channelType: string;
  topicId?: string;
  guildId?: string;
  botId?: string;
  aggregatedText: string;
  textFragments: string[];
  audios: Array<{ id: string; url: string; duration?: number }>;
  images: Array<{ id: string; url: string }>;
  latestMessageId: string;
  totalItems: number;
} | null {
  const buffer = activeBuffers.get(key);
  if (!buffer) return null;

  if (buffer.timer) {
    clearTimeout(buffer.timer);
    buffer.timer = undefined;
  }
  activeBuffers.delete(key);

  const textFragments: string[] = [];
  const audios: Array<{ id: string; url: string; duration?: number }> = [];
  const images: Array<{ id: string; url: string }> = [];
  let latestMsgId = '';

  for (const item of buffer.items) {
    latestMsgId = item.id;
    if (item.type === 'text' && item.text) {
      textFragments.push(item.text);
    } else if (item.type === 'audio' && item.url) {
      audios.push({ id: item.id, url: item.url, duration: item.duration });
    } else if (item.type === 'image' && item.url) {
      images.push({ id: item.id, url: item.url });
    }
  }

  // Join text fragments with single space
  const aggregatedText = textFragments.join(' ').trim();

  return {
    key: buffer.key,
    appId: buffer.appId,
    senderId: buffer.senderId,
    senderName: buffer.senderName,
    senderPhone: buffer.senderPhone,
    channelType: buffer.channelType,
    topicId: buffer.topicId,
    guildId: buffer.guildId,
    botId: buffer.botId,
    aggregatedText,
    textFragments,
    audios,
    images,
    latestMessageId: latestMsgId,
    totalItems: buffer.items.length,
  };
}

/**
 * Peek buffer status without clearing
 */
export function getBufferStatus(key: string) {
  const b = activeBuffers.get(key);
  if (!b) return null;
  return {
    key: b.key,
    itemCount: b.items.length,
    lastActivity: b.lastActivity,
    windowMs: b.windowMs,
  };
}

/**
 * Clear all buffers (useful for testing or shutdown)
 */
export function clearAllBuffers() {
  activeBuffers.forEach((buffer) => {
    if (buffer.timer) clearTimeout(buffer.timer);
  });
  activeBuffers.clear();
}
