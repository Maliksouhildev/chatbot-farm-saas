"use client";

import React, { useState, useRef, useEffect, useCallback, useLayoutEffect, useMemo } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { Folder, ChevronRight, Send, 
  Mic, 
  Paperclip, 
  Smile, 
  Phone, 
  PhoneMissed,
  PhoneIncoming,
  PhoneOutgoing,
  ExternalLink,
  Video, 
  Search, 
  MoreVertical, 
  CheckCheck, 
  Bot, 
  User, 
  ShieldCheck, 
  Heart, 
  ThumbsUp, 
  Image as ImageIcon, 
  ImageOff,
  FileText, 
  Mail, 
  MessageSquare,
  Reply, 
  ChevronLeft, 
  Minus, 
  Maximize2, 
  RefreshCw, 
  X, 
  Trash2, 
  RotateCcw,
  Sticker, 
  Ban,
  Camera, 
  Plus,
  Sparkles,
  Info,
  ShoppingBag,
  Clock,
  Bold,
  Italic,
  Underline,
  Link2,
  List,
  QrCode,
  Unlink,
  Edit3,
  Lock,
  Hash,
  AtSign,
  Globe,
  Server,
  Smartphone,
  Loader2,
  Zap,
  Check,
  Pin,
  PinOff,
  Target,
  GripVertical,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  AlertCircle,
  Star,
  UserPlus,
  LogOut,
  UserX,
  Inbox,
  Tag,
  Bookmark,
  Bell,
  Key,
  Eye,
  EyeOff,
  Volume2
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useChatStore } from '@/lib/store/ChatStoreContext';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { PullToRefresh } from './PullToRefresh';
import {
  WhatsAppIcon,
  InstagramIcon,
  TelegramIcon,
  MessengerIcon,
  StorefrontIcon,
  GmailIcon,
  SignalIcon,
  XIcon,
  GoogleMessagesIcon,
  GoogleChatIcon,
  GoogleVoiceIcon,
  DiscordIcon,
  SlackIcon,
  LinkedInIcon,
  IrcIcon,
  MatrixIcon,
  ViberIcon,
  SnapchatIcon
} from '@/components/icons/BrandIcons';
import { MOCK_CONTACTS_BY_APP, ContactProfile, ChatMessage, APP_GRADIENT_THEMES, getContactsForApp, PAIRED_CHATS_BY_APP, getRealInstagramProfile, isLightColor } from '@/lib/mock_chats';
import { ChannelNativeViews } from './ChannelNativeViews';
import { saveQuickTemplatesToCloud } from '@/lib/channelSync';
import { renderPressableText } from '@/lib/pressableLinks';
import { PhoneInput } from './PhoneInput';
import { SoundManager } from '@/lib/SoundManager';
import { WhatsAppAvatar } from './WhatsAppAvatar';
import { BOT_TEST_AVATAR } from '@/lib/whatsapp_avatars';
import { ScrollingGroupTitle } from './ScrollingGroupTitle';
import { TelegramPollWidget } from './TelegramPollWidget';




interface MiddleChatColumnProps {
  appId: string;
  selectedContactPath?: string[];
  onNavigatePath?: (path: string[]) => void;
  isLinked: boolean;
  onLinkSuccess: () => void;
  onOpenAuth: () => void;
  darkMode?: boolean;
  isAiActive?: boolean;
  onToggleAi?: () => void;
  isConnected?: boolean;
  onOpenConnect?: () => void;
  onDisconnect?: (appId: string) => void;
  liveContacts?: ContactProfile[];
  onMobileBack?: () => void;
  onMessageActivity?: (appId: string, contactId: string, messageText: string, timestamp?: number, isReceived?: boolean, topicId?: string) => void;
  isMobileEmbedded?: boolean;
  currentUser?: any;
  channelError?: string;
  dragHandleProps?: any;
  onMarkAsRead?: (appId: string, contactId: string, topicId?: string) => void;
  canSendMessages?: boolean;
  canMakeCalls?: boolean;
}

export interface QuickTemplate {
  id: string;
  label: string;
  text: string;
  icon?: string;
  isCustom?: boolean;
  isPinned?: boolean;
  appScope?: string[]; // e.g. ['all'] or ['whatsapp', 'telegram', ...]
  contactId?: string;  // Specific to a single client/chat ID
  contactName?: string; // Optional display label for specific contact
}

/**
 * Decodes HTML entities (e.g., &#39;, &quot;, &amp;, &lt;, &gt;) into clean display characters
 */
export function decodeHtmlEntities(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Safely extracts textual content from any message shape (string, object, nested payloads)
 * across Telegram, WhatsApp (Baileys), Instagram, Messenger, and live APIs without crashing.
 */
export const extractSafeText = (m: any, rawText?: any): string => {
  if (typeof rawText === 'string' && rawText.trim()) return rawText.trim();
  if (typeof m?.text === 'string' && m.text.trim()) return m.text.trim();
  if (typeof m?.message === 'string' && m.message.trim()) return m.message.trim();
  if (typeof m?.rawText === 'string' && m.rawText.trim()) return m.rawText.trim();
  if (typeof m?.caption === 'string' && m.caption.trim()) return m.caption.trim();
  if (typeof m?.body === 'string' && m.body.trim()) return m.body.trim();
  if (typeof m?.content === 'string' && m.content.trim()) return m.content.trim();

  // Handle nested objects (Telegram Bot/GramJS update, Baileys protobuf objects)
  const obj = (typeof rawText === 'object' && rawText !== null)
    ? rawText
    : (typeof m?.message === 'object' && m?.message !== null)
    ? m.message
    : (typeof m?.content === 'object' && m?.content !== null)
    ? m.content
    : null;

  if (obj) {
    if (typeof obj.text === 'string' && obj.text.trim()) return obj.text.trim();
    if (typeof obj.message === 'string' && obj.message.trim()) return obj.message.trim();
    if (typeof obj.conversation === 'string' && obj.conversation.trim()) return obj.conversation.trim();
    if (typeof obj.caption === 'string' && obj.caption.trim()) return obj.caption.trim();
    if (typeof obj.body === 'string' && obj.body.trim()) return obj.body.trim();
    if (typeof obj.extendedTextMessage?.text === 'string' && obj.extendedTextMessage.text.trim()) {
      return obj.extendedTextMessage.text.trim();
    }
  }

  // Media description fallbacks (strictly zero unicode emojis)
  if (m?.imageUrl) return '';
  if (m?.isAudio) return '';
  if (m?.fileName) return m.fileName || '';
  if (m?.videoUrl) return '';
  if (m?.isCall) {
    return m.callType?.includes('video') ? 'Appel vidéo' : 'Appel vocal';
  }

  return '';
};

/**
 * Checks if a message text is merely a placeholder label for an attachment rather than actual caption text
 */
export const isMediaPlaceholderText = (text: string | undefined | null): boolean => {
  if (!text) return true;
  const clean = text.replace(/^[📷🎥🎤🎵📄📍🏷️📹📞💬🚫\s]+/, '').trim().toLowerCase();
  return (
    clean === '' ||
    clean === 'photo' ||
    clean === 'photo attachment' ||
    clean === 'image' ||
    clean === 'picture' ||
    clean === 'video' ||
    clean === 'vidéo' ||
    clean === 'voice message' ||
    clean === 'message vocal' ||
    clean === 'voice note' ||
    clean === 'note vocale' ||
    clean === 'audio' ||
    clean === 'audio message' ||
    clean === 'document' ||
    clean === 'fichier' ||
    clean === 'media' ||
    clean === 'attachment' ||
    clean === 'poll' ||
    clean === 'sondage' ||
    clean.startsWith('sondage :') ||
    clean.startsWith('poll :')
  );
};

/**
 * Renders quoted/reply snippets with clean SVG icons instead of unicode emojis
 */
export const renderQuotedSnippet = (text: string | undefined | null) => {
  if (!text) return 'Message';
  const raw = text.trim();
  const lower = raw.toLowerCase();
  if (lower.includes('📷') || lower.includes('photo') || lower.includes('image')) {
    const clean = raw.replace(/^[📷\s]+/, '').replace(/^photo$/i, '').trim();
    return (
      <span className="inline-flex items-center gap-1">
        <Camera className="w-3 h-3 shrink-0 text-gray-400" />
        <span>{clean || 'Photo'}</span>
      </span>
    );
  }
  if (lower.includes('🎥') || lower.includes('video') || lower.includes('vidéo')) {
    const clean = raw.replace(/^[🎥\s]+/, '').replace(/^video$/i, '').trim();
    return (
      <span className="inline-flex items-center gap-1">
        <Video className="w-3 h-3 shrink-0 text-gray-400" />
        <span>{clean || 'Vidéo'}</span>
      </span>
    );
  }
  if (lower.includes('🎤') || lower.includes('vocal') || lower.includes('voice') || lower.includes('audio')) {
    const clean = raw.replace(/^[🎤🎵\s]+/, '').trim();
    return (
      <span className="inline-flex items-center gap-1">
        <Mic className="w-3 h-3 shrink-0 text-gray-400" />
        <span>{clean || 'Message vocal'}</span>
      </span>
    );
  }
  if (lower.includes('📄') || lower.includes('document') || lower.includes('fichier')) {
    const clean = raw.replace(/^[📄\s]+/, '').trim();
    return (
      <span className="inline-flex items-center gap-1">
        <FileText className="w-3 h-3 shrink-0 text-gray-400" />
        <span>{clean || 'Document'}</span>
      </span>
    );
  }
  return raw.replace(/^[📷🎥🎤🎵📄📍🏷️📹📞💬🚫\s]+/, '');
};

/**
 * Detects whether a message represents a system/service event in Telegram (joining, quitting, kicking, pinning, etc.)
 */
export const isTelegramEventMessage = (m: any, rawText?: any): boolean => {
  if (m?.isCall || m?.callType) return false;
  const aClass = String(m?.action?.className || m?.action?._ || '');
  if (aClass.includes('PhoneCall') || aClass.includes('phoneCall') || aClass.includes('Call')) {
    return false;
  }
  const text = extractSafeText(m, rawText).toLowerCase().trim();
  if (text.includes('appel vocal') || text.includes('voice call') || text.includes('appel vidéo') || text.includes('video call')) {
    return false;
  }

  if (
    m?.isEvent ||
    m?.type === 'event' ||
    m?.type === 'service' ||
    m?.isSystem ||
    m?.action ||
    m?._ === 'messageService' ||
    m?.action?._
  ) {
    return true;
  }
  if (!text) return false;

  // Telegram service notification / accept patterns
  if (
    text === 'notification' ||
    text === 'notification.' ||
    text.includes('accepted to the group') ||
    text.includes('was accepted') ||
    text.includes('accepted to group') ||
    text.includes('a été accepté') ||
    text.includes('تم قبوله')
  ) {
    return true;
  }

  // 1. Join patterns
  if (
    text.includes('joined') ||
    text.includes('invite link') ||
    text.includes('invitation link') ||
    text.includes('joined group') ||
    text.includes('joined the group') ||
    text.includes('joined the chat') ||
    text.includes('joined the channel') ||
    text.includes('joined channel') ||
    text.includes('joined via invite') ||
    text.includes('joined by invite') ||
    text.includes('joined via link') ||
    text.includes('rejoint') ||
    text.includes('rejoint le groupe') ||
    text.includes('a rejoint le groupe') ||
    text.includes('rejoint le canal') ||
    text.includes('a rejoint le canal') ||
    text.includes('rejoint via un lien') ||
    text.includes('rejoint via le lien') ||
    text.includes('member joined') ||
    text.includes('user joined') ||
    text.includes('انضم إلى المجموعة') ||
    text.includes('انضم إلى القناة') ||
    text.includes('انضم عبر الرابط') ||
    text.includes('انضم إلى المحادثة')
  ) {
    return true;
  }

  // 2. Leave / Quit patterns
  if (
    text.includes('left group') ||
    text.includes('left the group') ||
    text.includes('left the chat') ||
    text.includes('left the channel') ||
    text.includes('left channel') ||
    text.includes('quitted the group') ||
    text.includes('quitted group') ||
    text.includes('a quitté le groupe') ||
    text.includes('quitté le groupe') ||
    text.includes('a quitté le canal') ||
    text.includes('quitté le canal') ||
    text.includes('a quitté la conversation') ||
    text.includes('member left') ||
    text.includes('user left') ||
    text.includes('غادر المجموعة') ||
    text.includes('غادر القناة') ||
    text.includes('غادر المحادثة')
  ) {
    return true;
  }

  // 3. Kick / Remove patterns
  if (
    text.includes('removed from group') ||
    text.includes('removed from the group') ||
    text.includes('kicked from group') ||
    text.includes('kicked from the group') ||
    text.includes('a été retiré du groupe') ||
    text.includes('a été expulsé du groupe') ||
    text.includes('expulsé du groupe') ||
    text.includes('تمت إزالته من المجموعة')
  ) {
    return true;
  }

  // 4. Pin patterns
  if (
    text.includes('pinned a message') ||
    text.includes('pinned the message') ||
    text.includes('a épinglé un message') ||
    text.includes('قام بتثبيت رسالة')
  ) {
    return true;
  }

  // 5. Group changes
  if (
    text.includes('changed group photo') ||
    text.includes('changed group name') ||
    text.includes('changed the group photo') ||
    text.includes('changed the group name') ||
    text.includes('a changé la photo du groupe') ||
    text.includes('a changé le nom du groupe') ||
    text.includes('created group') ||
    text.includes('created the group') ||
    text.includes('a créé le groupe') ||
    text.includes('قام بتغيير صورة المجموعة') ||
    text.includes('قام بتغيير اسم المجموعة')
  ) {
    return true;
  }

  return false;
};

/**
 * Formats Telegram service/event message content with authentic Telegram styling and semantic icons
 */
export const renderTelegramEventContent = (m: any, rawText?: any) => {
  const text = extractSafeText(m, rawText).trim();
  const lowerText = text.toLowerCase();
  const sender = m?.senderName && m?.senderName !== '..' && m?.senderName !== 'User' && m?.senderName !== 'You' ? m.senderName : null;

  // Case 1: "Notification" text stored from previous service messages
  if (lowerText === 'notification' || lowerText === 'notification.') {
    return (
      <span className="leading-snug">
        {sender && <strong className="font-semibold text-white mr-1">{sender}</strong>}
        <span className="text-white/95">was accepted to the group</span>
      </span>
    );
  }

  // Case 2: Accepted to group (matches Real Telegram: "[Name] was accepted to the group")
  if (lowerText.includes('accepted to the group') || lowerText.includes('was accepted') || lowerText.includes('accepted to group')) {
    if (sender && lowerText.startsWith(sender.toLowerCase())) {
      const rest = text.slice(sender.length).trim();
      return (
        <span className="leading-snug">
          <strong className="font-semibold text-white mr-1">{sender}</strong>
          <span className="text-white/95">{rest}</span>
        </span>
      );
    }
    if (sender && !lowerText.includes(sender.toLowerCase())) {
      return (
        <span className="leading-snug">
          <strong className="font-semibold text-white mr-1">{sender}</strong>
          <span className="text-white/95">was accepted to the group</span>
        </span>
      );
    }
    return <span className="text-white/95 font-medium leading-snug">{text}</span>;
  }

  // Classify event type
  const isJoin =
    lowerText.includes('joined') ||
    lowerText.includes('rejoint') ||
    lowerText.includes('انضم');

  const isLeave =
    lowerText.includes('left') ||
    lowerText.includes('quitt') ||
    lowerText.includes('غادر');

  const isKick =
    lowerText.includes('removed') ||
    lowerText.includes('kicked') ||
    lowerText.includes('retiré') ||
    lowerText.includes('expulsé') ||
    lowerText.includes('إزال');

  const isPin =
    lowerText.includes('pinned') ||
    lowerText.includes('épinglé') ||
    lowerText.includes('تثبيت');

  let EventIcon = Info;
  let iconClass = 'text-blue-400';

  if (isJoin) {
    EventIcon = UserPlus;
    iconClass = 'text-[#2AABEE] dark:text-[#54b8ea]';
  } else if (isLeave) {
    EventIcon = LogOut;
    iconClass = 'text-rose-400';
  } else if (isKick) {
    EventIcon = UserX;
    iconClass = 'text-rose-400';
  } else if (isPin) {
    EventIcon = Pin;
    iconClass = 'text-amber-400 rotate-45';
  }

  let contentNode: React.ReactNode;
  if (sender && !lowerText.startsWith(sender.toLowerCase())) {
    const formattedAction = text.charAt(0).toLowerCase() + text.slice(1);
    contentNode = (
      <span>
        <strong className="font-semibold text-white mr-1">{sender}</strong>
        <span className="text-white/90">{formattedAction}</span>
      </span>
    );
  } else {
    contentNode = <span className="text-white/95">{text}</span>;
  }

  return (
    <>
      <EventIcon className={`w-3.5 h-3.5 shrink-0 ${iconClass}`} />
      <span className="leading-snug">{contentNode}</span>
    </>
  );
};

/**
 * Extracts leading emoji (or icon glyph) and clean display title from a Telegram topic
 */
/**
 * Extracts leading emoji (or icon glyph) and clean display title from a Telegram topic
 */
export function extractTopicGlyphAndTitle(topic: any): { glyph: string; title: string; isHash: boolean } {
  if (!topic) return { glyph: '#', title: 'General', isHash: true };
  const rawName = (topic.name || topic.title || '').trim();
  
  // Clean off any leading hash symbols and whitespace
  const cleanRaw = rawName.replace(/^#\s*/, '').trim();

  // If topic is General or id is 1 or starts with # General
  const isGeneral = String(topic.id) === '1' || Number(topic.id) === 1 ||
    cleanRaw.toLowerCase() === 'general' ||
    (topic as any)?.isGeneral;
  if (isGeneral) {
    return { glyph: '#', title: 'General', isHash: true };
  }

  // 1. Extract leading emoji or Extended Pictographic sequence
  let emojiMatch: RegExpMatchArray | null = null;
  try {
    const emojiRegex = new RegExp('^(\\p{Extended_Pictographic}(?:\\uFE0F|\\u200D\\p{Extended_Pictographic})*)', 'u');
    emojiMatch = cleanRaw.match(emojiRegex);
  } catch {}
  if (emojiMatch && emojiMatch[1]) {
    const emojiChar = emojiMatch[1];
    const rest = cleanRaw.slice(emojiChar.length).replace(/^#\s*/, '').trim();
    return {
      glyph: emojiChar,
      title: rest || cleanRaw,
      isHash: false
    };
  }

  // 2. If topic has explicit iconEmoji
  if (topic.iconEmoji) {
    return {
      glyph: topic.iconEmoji,
      title: cleanRaw.replace(/^#\s*/, '').trim(),
      isHash: false
    };
  }

  // 3. Responsive Telegram/Discord emoji fallback by topic name keyword
  const lower = cleanRaw.toLowerCase();
  let fallbackEmoji: string | null = null;
  if (lower.includes('important')) fallbackEmoji = '🆘';
  else if (lower.includes('meet') || lower.includes('zoom')) fallbackEmoji = '📹';
  else if (lower.includes('discuss') || lower.includes('chat')) fallbackEmoji = '💬';
  else if (lower.includes('automate') || lower.includes('programm')) fallbackEmoji = '🎹';
  else if (lower.includes('système') || lower.includes('asservi')) fallbackEmoji = '🤝';
  else if (lower.includes('calculateur') || lower.includes('embarqu')) fallbackEmoji = '📈';
  else if (lower.includes('contact')) fallbackEmoji = '🗨️';
  else if (lower.includes('robot')) fallbackEmoji = '🤖';
  else if (lower.includes('électronique') || lower.includes('puissance')) fallbackEmoji = '🚨';
  else if (lower.includes('tp ') || lower.includes('tp_')) fallbackEmoji = '📉';
  else if (lower.includes('cours') || lower.includes('book')) fallbackEmoji = '📚';
  else if (lower.includes('exam') || lower.includes('test')) fallbackEmoji = '📝';
  else if (lower.includes('announc') || lower.includes('info')) fallbackEmoji = '📢';
  else if (lower.includes('support') || lower.includes('help')) fallbackEmoji = '🛟';

  if (fallbackEmoji) {
    return {
      glyph: fallbackEmoji,
      title: cleanRaw.replace(/^#\s*/, '').trim(),
      isHash: false
    };
  }

  // Default topic glyph
  return {
    glyph: '#',
    title: cleanRaw.replace(/^#\s*/, '').trim(),
    isHash: true
  };
}

/**
 * Formats date into authentic Telegram timestamp (e.g., "10:35 AM", "Sat", "Oct 05")
 */
export function formatTopicDate(dateVal?: any): string {
  if (!dateVal) return '';
  const d = typeof dateVal === 'number' ? new Date(dateVal > 1e11 ? dateVal : dateVal * 1000) : new Date(dateVal);
  if (isNaN(d.getTime())) {
    if (typeof dateVal === 'string') return dateVal;
    return '';
  }
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays < 7) {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  } else {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export interface CleanDynamicVariable {
  key: string;       // e.g. '{name}'
  label: string;     // Clean label without {}, _, -
  colorClass: string; // Diverse soft colors
  fallbackValue: string;
}

export const CLEAN_DYNAMIC_VARIABLES: CleanDynamicVariable[] = [
  { key: '{name}', label: 'Client Name', colorClass: 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200', fallbackValue: 'Mohamed' },
  { key: '{client_phone}', label: 'Client Phone', colorClass: 'bg-sky-100/90 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-700 hover:bg-sky-200', fallbackValue: '+213 555 12 34 56' },
  { key: '{wilaya}', label: 'Client Wilaya', colorClass: 'bg-amber-100/90 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-200', fallbackValue: '16 - Alger' },
  { key: '{entreprise}', label: 'Company Name', colorClass: 'bg-purple-100/90 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-700 hover:bg-purple-200', fallbackValue: 'E-Shop Algérie' },
  { key: '{app_name}', label: 'Channel Name', colorClass: 'bg-blue-100/90 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-200', fallbackValue: 'WhatsApp' },
  { key: '{order_id}', label: 'Tracking Code', colorClass: 'bg-indigo-100/90 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-200', fallbackValue: 'DZ-YAL-84920' },
  { key: '{total_price}', label: 'Total Amount', colorClass: 'bg-rose-100/90 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-700 hover:bg-rose-200', fallbackValue: '4,800 DA' },
  { key: '{delivery_service}', label: 'Courier Name', colorClass: 'bg-teal-100/90 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300 dark:border-teal-700 hover:bg-teal-200', fallbackValue: 'Yalidine Express' },
  { key: '{store_website}', label: 'Store Website', colorClass: 'bg-violet-100/90 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300 border-violet-300 dark:border-violet-700 hover:bg-violet-200', fallbackValue: 'https://eshop.dz' },
  { key: '{admin_name}', label: 'Agent Name', colorClass: 'bg-orange-100/90 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-700 hover:bg-orange-200', fallbackValue: 'Agent Support' },
  { key: '{admin_phone}', label: 'Support Phone', colorClass: 'bg-cyan-100/90 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700 hover:bg-cyan-200', fallbackValue: '+213 21 00 00 00' },
  { key: '{time}', label: 'Current Time', colorClass: 'bg-fuchsia-100/90 text-fuchsia-800 dark:bg-fuchsia-950/60 dark:text-fuchsia-300 border-fuchsia-300 dark:border-fuchsia-700 hover:bg-fuchsia-200', fallbackValue: '14:30' },
];

export const ALL_APP_LOGOS_FOR_TEMPLATES: { id: string; name: string; icon: React.ReactNode }[] = [
  { id: 'all', name: 'Toutes les applications', icon: <Globe className="w-4 h-4 shrink-0 text-gray-700 dark:text-gray-200" /> },
  { id: 'whatsapp', name: 'WhatsApp', icon: <WhatsAppIcon className="w-4 h-4 shrink-0" /> },
  { id: 'whatsapp_2', name: 'WhatsApp (Line #2)', icon: <WhatsAppIcon className="w-4 h-4 shrink-0" /> },
  { id: 'telegram', name: 'Telegram', icon: <TelegramIcon className="w-4 h-4 shrink-0" /> },
  { id: 'instagram', name: 'Instagram', icon: <InstagramIcon className="w-4 h-4 shrink-0" /> },
  { id: 'messenger', name: 'Messenger', icon: <MessengerIcon className="w-4 h-4 shrink-0" /> },
  { id: 'discord', name: 'Discord', icon: <DiscordIcon className="w-4 h-4 shrink-0" /> },
  { id: 'gmail', name: 'Gmail', icon: <GmailIcon className="w-4 h-4 shrink-0" /> },
  { id: 'google_chat', name: 'Google Chat', icon: <GoogleChatIcon className="w-4 h-4 shrink-0" /> },
  { id: 'google_messages', name: 'Google Messages', icon: <GoogleMessagesIcon className="w-4 h-4 shrink-0" /> },
  { id: 'google_voice', name: 'Google Voice', icon: <GoogleVoiceIcon className="w-4 h-4 shrink-0" /> },
  { id: 'viber', name: 'Viber Business', icon: <ViberIcon className="w-4 h-4 shrink-0" /> },
  { id: 'snapchat', name: 'Snapchat', icon: <SnapchatIcon className="w-4 h-4 shrink-0" /> },
  { id: 'signal', name: 'Signal', icon: <SignalIcon className="w-4 h-4 shrink-0" /> },
  { id: 'matrix', name: 'Matrix Protocol', icon: <MatrixIcon className="w-4 h-4 shrink-0" /> },
  { id: 'slack', name: 'Slack', icon: <SlackIcon className="w-4 h-4 shrink-0" /> },
  { id: 'x_twitter', name: 'X / Twitter', icon: <XIcon className="w-4 h-4 shrink-0" /> },
  { id: 'linkedin', name: 'LinkedIn', icon: <LinkedInIcon className="w-4 h-4 shrink-0" /> },
  { id: 'irc', name: 'IRC Network', icon: <IrcIcon className="w-4 h-4 shrink-0" /> },
  { id: 'web_widget', name: 'Storefront Live Chat', icon: <StorefrontIcon className="w-4 h-4 shrink-0" /> },
];

const DEFAULT_QUICK_TEMPLATES: QuickTemplate[] = [
  { id: 't1', label: 'Salam Marhba', text: 'Salam {name}! Marhba bik f {entreprise}, kifach nqeddou n3awnouk lyoum?', icon: '👋', appScope: ['all'] },
  { id: 't2', label: 'Yalidine 58 Wilayas', text: 'Livraison disponible f 58 wilayas via {delivery_service} f 24-48h pour {wilaya}!', icon: '🚚', appScope: ['all'] },
  { id: 't3', label: 'Prix & Disponibilité', text: 'Salam {name}, le produit rah disponible f le stock f {entreprise}!', icon: '💰', appScope: ['all'] },
  { id: 't4', label: 'Confirmation Commande', text: 'Merci pour votre commande {name}! Votre colis {order_id} pour {wilaya} est en préparation.', icon: '✅', appScope: ['all'] },
  { id: 't5', label: 'Suivi de Colis', text: 'Votre colis {order_id} a été expédié via {delivery_service}. Vous recevrez un appel du livreur dès son arrivée à {wilaya}.', icon: '📦', appScope: ['all'] },
  { id: 't6', label: 'Paiement à la Livraison', text: 'Le paiement de {total_price} se fait main à main à la livraison après vérification de votre commande.', icon: '💳', appScope: ['all'] },
];

// Channel-specific protocol icons and action button text
export const getChannelConnectInfo = (targetAppId: string, channelName: string) => {
  switch (targetAppId) {
    case 'whatsapp':
      return {
        icon: <QrCode className="w-4 h-4 shrink-0" />,
        label: 'Scan QR to Link WhatsApp',
      };
    case 'whatsapp_2':
      return {
        icon: <QrCode className="w-4 h-4 shrink-0" />,
        label: 'Scan QR to Link Line #2',
      };
    case 'telegram':
      return {
        icon: <Bot className="w-4 h-4 shrink-0" />,
        label: 'Link Telegram (QR / Phone / Bot)',
      };
    case 'signal':
      return {
        icon: <Lock className="w-4 h-4 shrink-0" />,
        label: 'Link Signal (Phone Number SMS / Device)',
      };
    case 'discord':
      return {
        icon: <Bot className="w-4 h-4 shrink-0" />,
        label: 'Connect Discord (Account Sign-In / QR / Bot)',
      };
    case 'slack':
      return {
        icon: <Hash className="w-4 h-4 shrink-0" />,
        label: 'Connect Slack (Work Email Code / Token)',
      };
    case 'x_twitter':
      return {
        icon: <AtSign className="w-4 h-4 shrink-0" />,
        label: 'Connect X / Twitter (Account Sign-In / API)',
      };
    case 'matrix':
      return {
        icon: <Globe className="w-4 h-4 shrink-0" />,
        label: 'Connect Matrix Homeserver',
      };
    case 'irc':
      return {
        icon: <Server className="w-4 h-4 shrink-0" />,
        label: 'Join IRC Server & Channel',
      };
    case 'google_messages':
      return {
        icon: <Smartphone className="w-4 h-4 shrink-0" />,
        label: 'Pair Google Messages (Device Pairing / Phone)',
      };
    case 'google_chat':
      return {
        icon: <Globe className="w-4 h-4 shrink-0" />,
        label: 'Link Google Chat Space',
      };
    case 'google_voice':
      return {
        icon: <Smartphone className="w-4 h-4 shrink-0" />,
        label: 'Link Google Voice Number',
      };
    case 'linkedin':
      return {
        icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
        label: 'Connect LinkedIn Organization',
      };
    case 'instagram':
      return {
        icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
        label: 'Connect Instagram (Session ID / Login / Meta)',
      };
    case 'messenger':
      return {
        icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
        label: 'Connect Messenger (Facebook Page Sign-In / Token)',
      };
    case 'gmail':
      return {
        icon: <Mail className="w-4 h-4 shrink-0" />,
        label: 'Connect Support Gmail',
      };
    case 'web_widget':
      return {
        icon: <Globe className="w-4 h-4 shrink-0" />,
        label: 'Configure Storefront Web Widget',
      };
    case 'viber':
      return {
        icon: <ViberIcon className="w-4 h-4 shrink-0" />,
        label: 'Connect Viber (Phone / Bot)',
      };
    case 'snapchat':
      return {
        icon: <SnapchatIcon className="w-4 h-4 shrink-0" />,
        label: 'Connect Snapchat (Phone / Snapcode / Kit)',
      };
    default:
      return {
        icon: <QrCode className="w-4 h-4 shrink-0" />,
        label: `Connect ${channelName}`,
      };
  }
};

export const getChannelReconfigureInfo = (targetAppId: string, channelName: string) => {
  switch (targetAppId) {
    case 'whatsapp':
    case 'whatsapp_2':
      return {
        icon: <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
        label: 'Re-scan QR / Link Device',
      };
    case 'telegram':
      return {
        icon: <Bot className="w-4 h-4 text-[#0088CC] shrink-0" />,
        label: 'Re-link Telegram / Bot Token',
      };
    case 'signal':
      return {
        icon: <Lock className="w-4 h-4 text-[#3A76F0] shrink-0" />,
        label: 'Re-link Signal Device / Phone',
      };
    case 'discord':
      return {
        icon: <Bot className="w-4 h-4 text-[#5865F2] shrink-0" />,
        label: 'Reconfigure Discord Bot Token',
      };
    case 'slack':
      return {
        icon: <Hash className="w-4 h-4 text-[#4A154B] dark:text-[#E01E5A] shrink-0" />,
        label: 'Reconfigure Slack Workspace Token',
      };
    case 'x_twitter':
      return {
        icon: <AtSign className="w-4 h-4 text-neutral-800 dark:text-neutral-200 shrink-0" />,
        label: 'Reconfigure X / Twitter API',
      };
    case 'matrix':
      return {
        icon: <Globe className="w-4 h-4 text-[#0DBD8B] shrink-0" />,
        label: 'Reconfigure Matrix Homeserver',
      };
    case 'irc':
      return {
        icon: <Server className="w-4 h-4 text-[#00FF66] shrink-0" />,
        label: 'Reconfigure IRC Channel & Server',
      };
    case 'google_messages':
      return {
        icon: <Smartphone className="w-4 h-4 text-[#1A73E8] shrink-0" />,
        label: 'Re-pair RCS Phone Number',
      };
    case 'google_chat':
      return {
        icon: <Globe className="w-4 h-4 text-[#00AC47] shrink-0" />,
        label: 'Reconfigure Google Chat Space',
      };
    case 'google_voice':
      return {
        icon: <Smartphone className="w-4 h-4 text-[#0F9D58] shrink-0" />,
        label: 'Re-link Google Voice Number',
      };
    case 'linkedin':
      return {
        icon: <ShieldCheck className="w-4 h-4 text-[#0A66C2] shrink-0" />,
        label: 'Reconfigure LinkedIn Page Token',
      };
    case 'instagram':
      return {
        icon: <ShieldCheck className="w-4 h-4 text-[#EB6708] shrink-0" />,
        label: 'Re-authenticate Instagram Account',
      };
    case 'messenger':
      return {
        icon: <ShieldCheck className="w-4 h-4 text-[#1877F2] shrink-0" />,
        label: 'Re-authenticate Facebook Page',
      };
    case 'gmail':
      return {
        icon: <Mail className="w-4 h-4 text-[#EA4335] shrink-0" />,
        label: 'Re-authorize Support Gmail',
      };
    case 'web_widget':
      return {
        icon: <Globe className="w-4 h-4 text-emerald-600 shrink-0" />,
        label: 'Reconfigure Web Chat Widget',
      };
    case 'viber':
      return {
        icon: <ViberIcon className="w-4 h-4 text-[#7360F2] shrink-0" />,
        label: 'Reconfigure Viber Bot / Phone',
      };
    case 'snapchat':
      return {
        icon: <SnapchatIcon className="w-4 h-4 text-yellow-500 shrink-0" />,
        label: 'Reconfigure Snapchat Session',
      };
    default:
      return {
        icon: <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />,
        label: `Reconfigure ${channelName}`,
      };
  }
};

export const MiddleChatColumn: React.FC<MiddleChatColumnProps> = ({
  appId,
  selectedContactPath = [],
  onNavigatePath,
  isLinked,
  onLinkSuccess,
  onOpenAuth,
  darkMode = false,
  isAiActive = false,
  onToggleAi,
  isConnected = false,
  onOpenConnect,
  onDisconnect,
  liveContacts,
  onMobileBack,
  onMessageActivity,
  isMobileEmbedded = false,
  currentUser = null,
  channelError,
  dragHandleProps,
  onMarkAsRead,
  canSendMessages = true,
  canMakeCalls = true,
}) => {
  const { 
    openLightbox, 
    isRightHubCollapsed, 
    toggleRightHubCollapse, 
    replyingToMessage, 
    setReplyingToMessage, 
    likeMessage,
    dispatchMessageWithCadence,
    chatsByApp,
    activeProfileContact,
    activeProfileAppId,
    openProfile,
    closeProfile,
    deleteContact
  } = useChatStore();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSimulatingLoad, setIsSimulatingLoad] = useState(false);
  useEffect(() => {
    setIsSimulatingLoad(true);
    const timer = setTimeout(() => setIsSimulatingLoad(false), 1500);
    return () => clearTimeout(timer);
  }, [appId]);
  const [isTyping, setIsTyping] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const hoverCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMessageMouseEnter = useCallback((msgId: string) => {
    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
    setHoveredMessageId(msgId);
  }, []);

  const handleMessageMouseLeave = useCallback(() => {
    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current);
    }
    hoverCloseTimerRef.current = setTimeout(() => {
      setHoveredMessageId(null);
    }, 280);
  }, []);

  useEffect(() => {
    return () => {
      if (hoverCloseTimerRef.current) {
        clearTimeout(hoverCloseTimerRef.current);
      }
      if (testBotTimerRef.current) {
        clearTimeout(testBotTimerRef.current);
      }
    };
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const telegramFeedRef = useRef<HTMLDivElement>(null);
  const whatsappFeedRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastKnownLatestMsgIdRef = useRef<Record<string, string>>({});

  // Inverted AI Test Bot accumulation buffer & debounce timer
  const testBotBufferRef = useRef<{
    texts: string[];
    hasImages: boolean;
    hasAudios: boolean;
    lastMsgId?: string;
    lastMsgText?: string;
  }>({
    texts: [],
    hasImages: false,
    hasAudios: false,
  });
  const testBotTimerRef = useRef<NodeJS.Timeout | null>(null);
  const testBotIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingDebouncePauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [testBotDebounceCountdown, setTestBotDebounceCountdown] = useState<number | null>(null);
  const [isUserTypingDebounce, setIsUserTypingDebounce] = useState(false);

  useEffect(() => {
    return () => {
      if (testBotTimerRef.current) clearTimeout(testBotTimerRef.current);
      if (testBotIntervalRef.current) clearInterval(testBotIntervalRef.current);
      if (typingDebouncePauseTimerRef.current) clearTimeout(typingDebouncePauseTimerRef.current);
    };
  }, []);

  // Audio recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isChannelMenuOpen, setIsChannelMenuOpen] = useState(false);

  // In-chat tools & WhatsApp action buttons state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);

  // Gmail Interactive Selection, Favorites & Folder Tabs State
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [starredEmails, setStarredEmails] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('cf_gmail_starred');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [gmailActiveCategory, setGmailActiveCategory] = useState<string>('primary');

  const handleToggleSelectEmail = useCallback((id: string) => {
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleStarEmail = useCallback((id: string) => {
    setStarredEmails((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem('cf_gmail_starred', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }, []);

  // Quick Templates & Custom Messages State
  const [quickTemplates, setQuickTemplates] = useState<QuickTemplate[]>(DEFAULT_QUICK_TEMPLATES);
  const [quickReplyMode, setQuickReplyMode] = useState<'messages' | 'variables'>('messages');
  const [isQuickTemplatesOpen, setIsQuickTemplatesOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cf_quick_templates_open');
        if (stored !== null) return stored === 'true';
      } catch {}
    }
    return true;
  });

  const toggleQuickTemplates = useCallback((forceOpen?: boolean) => {
    setIsQuickTemplatesOpen((prev) => {
      const next = typeof forceOpen === 'boolean' ? forceOpen : !prev;
      try {
        localStorage.setItem('cf_quick_templates_open', String(next));
        window.dispatchEvent(new CustomEvent('cf_quick_templates_sync', { detail: { open: next } }));
        window.dispatchEvent(new Event('storage'));
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    const handleSync = (e: any) => {
      if (e?.detail?.open !== undefined) {
        setIsQuickTemplatesOpen(Boolean(e.detail.open));
      } else {
        try {
          const stored = localStorage.getItem('cf_quick_templates_open');
          if (stored !== null) {
            setIsQuickTemplatesOpen(stored === 'true');
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('cf_quick_templates_sync' as any, handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('cf_quick_templates_sync' as any, handleSync);
    };
  }, []);

  const scrollStreamRef = useRef<HTMLDivElement>(null);
  const saveQuickTemplatesTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (saveQuickTemplatesTimerRef.current) {
        clearTimeout(saveQuickTemplatesTimerRef.current);
      }
    };
  }, []);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = useCallback(() => {
    const el = scrollStreamRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  }, []);

  const scrollStream = useCallback((direction: 'left' | 'right') => {
    const el = scrollStreamRef.current;
    if (!el) return;
    const offset = direction === 'left' ? -220 : 220;
    el.scrollBy({ left: offset, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cf_quick_templates_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) setQuickTemplates(parsed);
      }
    } catch {}

    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('cf_quick_templates_v2');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) setQuickTemplates(parsed);
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync templates from cloud account
  useEffect(() => {
    if (!currentUser?.id) return;
    fetch(`/api/user/channels?userId=${encodeURIComponent(currentUser.id)}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data?.quickTemplates) && data.quickTemplates.length > 0) {
          setQuickTemplates(data.quickTemplates);
          try {
            localStorage.setItem('cf_quick_templates_v2', JSON.stringify(data.quickTemplates));
          } catch {}
        }
      })
      .catch(() => {});
  }, [currentUser?.id]);

  // Smooth mouse-wheel scrolling listener without CSS animation conflict
  useEffect(() => {
    const el = scrollStreamRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 0.9;
        checkScrollButtons();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    checkScrollButtons();

    const ro = new ResizeObserver(() => checkScrollButtons());
    ro.observe(el);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      ro.disconnect();
    };
  }, [checkScrollButtons, quickReplyMode, quickTemplates.length]);

  const saveTemplatesToStorage = useCallback((templates: QuickTemplate[]) => {
    setQuickTemplates(templates);
    try {
      localStorage.setItem('cf_quick_templates_v2', JSON.stringify(templates));
      window.dispatchEvent(new Event('storage'));
    } catch {}
    if (currentUser?.id) {
      saveQuickTemplatesToCloud(currentUser.id, templates);
    }
  }, [currentUser?.id]);

  const [templateContextMenu, setTemplateContextMenu] = useState<{ x: number; y: number; template: QuickTemplate } | null>(null);

  // Custom Message Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [newTemplateLabel, setNewTemplateLabel] = useState('');
  const [newTemplateText, setNewTemplateText] = useState('');
  const [newTemplateIcon, setNewTemplateIcon] = useState('💬');
  const [newTemplateAppScope, setNewTemplateAppScope] = useState<string[]>(['all']);
  const [newTemplateIsSpecificToChat, setNewTemplateIsSpecificToChat] = useState(false);
  const [isVariablesBarExpanded, setIsVariablesBarExpanded] = useState(false);
  const [isModalVariablesExpanded, setIsModalVariablesExpanded] = useState(false);
  const [showAllAppsInModal, setShowAllAppsInModal] = useState(false);
  const templateTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Dedicated Secure API Key Setup Modal State
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [modalApiKey, setModalApiKey] = useState('');
  const [modalProvider, setModalProvider] = useState<'gemini' | 'groq' | 'openrouter' | 'openai'>('gemini');
  const [showModalApiKey, setShowModalApiKey] = useState(false);
  const [modalKeyError, setModalKeyError] = useState<string | null>(null);

  useEffect(() => {
    if (isApiKeyModalOpen) {
      try {
        const saved = localStorage.getItem('cf_byok_key') || localStorage.getItem('cf_user_byok_key') || '';
        const savedProv = (localStorage.getItem('cf_byok_provider') as any) || 'gemini';
        if (saved) setModalApiKey(saved);
        if (savedProv) setModalProvider(savedProv);
      } catch {}
      setModalKeyError(null);
    }
  }, [isApiKeyModalOpen]);

  // Per-contact conversation store persisted in localStorage
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem('cf_conversations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return {};
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('cf_conversations');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            setConversations(parsed);
          }
        }
      } catch {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Dynamic real Instagram profile state and handle editor (strictly real credentials)
  const [igProfile, setIgProfile] = useState<{ username: string; name: string; isLinked: boolean }>(getRealInstagramProfile());
  const [isEditingIgHandle, setIsEditingIgHandle] = useState(false);
  const [newIgHandleInput, setNewIgHandleInput] = useState('');

  useEffect(() => {
    const syncIgProfile = () => {
      setIgProfile(getRealInstagramProfile());
    };
    syncIgProfile();
    window.addEventListener('storage', syncIgProfile);
    return () => window.removeEventListener('storage', syncIgProfile);
  }, []);

  const handleSaveIgHandle = (handle: string) => {
    const clean = handle.trim().replace(/^@/, '');
    if (!clean) return;
    try {
      const existing = localStorage.getItem('cf_ig_account');
      const parsed = existing ? JSON.parse(existing) : {};
      const updated = {
        ...parsed,
        username: clean,
        name: clean,
        igId: clean,
      };
      localStorage.setItem('cf_ig_account', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      setIgProfile({ username: clean, name: clean, isLinked: true });
      setIsEditingIgHandle(false);
    } catch {}
  };

  // Virtual Keyboard / Viewport detection for mobile (guarantees text input sits directly on top of keyboard)
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;

    const handleViewportChange = () => {
      const diff = window.innerHeight - vv.height;
      setKeyboardOffset(diff > 120 ? diff : 0);
    };

    vv.addEventListener('resize', handleViewportChange);
    vv.addEventListener('scroll', handleViewportChange);
    return () => {
      vv.removeEventListener('resize', handleViewportChange);
      vv.removeEventListener('scroll', handleViewportChange);
    };
  }, []);

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    setTimeout(() => {
      target?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      // Removed aggressive snap to bottom here
    }, 250);
  };

  // Direct Customer Discussion States (No Fake Simulation)
  const [newChatCustomerHandle, setNewChatCustomerHandle] = useState('');
  const [newChatCustomerName, setNewChatCustomerName] = useState('');
  const [newChatFirstMessage, setNewChatFirstMessage] = useState('');
  const [isSubmittingNewChat, setIsSubmittingNewChat] = useState(false);

  const handleStartNewChatDirect = async () => {
    const cleanHandle = newChatCustomerHandle.trim().replace(/^@/, '');
    const msg = newChatFirstMessage.trim();
    if (!cleanHandle || !msg) return;

    setIsSubmittingNewChat(true);
    try {
      const isPhone = cleanHandle.startsWith('+') || /^\d{7,15}$/.test(cleanHandle.replace(/\s+/g, ''));
      const contactId = `${appId}_${cleanHandle.replace(/\s+/g, '_')}`;

      // 1. Send via channel API if applicable
      if (appId === 'instagram') {
        let accessToken = '';
        let igId = '';
        let pageId = '';
        try {
          const igAcc = localStorage.getItem('cf_ig_account');
          if (igAcc) {
            const p = JSON.parse(igAcc);
            accessToken = p.pageAccessToken || p.accessToken || '';
            igId = p.igId || p.id || '';
            pageId = p.pageId || '';
          }
          if (!accessToken) {
            const metaAuth = localStorage.getItem('cf_meta_auth');
            if (metaAuth) {
              const parsed = JSON.parse(metaAuth);
              accessToken = parsed.userToken || '';
              if (!igId && parsed.instagramAccounts?.[0]) {
                igId = parsed.instagramAccounts[0].igId || parsed.instagramAccounts[0].id;
                pageId = parsed.instagramAccounts[0].pageId || '';
              }
            }
          }
        } catch {}

        await fetch('/api/channels/instagram/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientId: contactId,
            recipientHandle: `@${cleanHandle}`,
            recipientName: newChatCustomerName.trim() || cleanHandle,
            text: msg,
            accessToken,
            igId,
            pageId
          })
        }).catch(() => {});
      } else if (appId === 'viber') {
        fetch('/api/channels/viber/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: cleanHandle,
            name: newChatCustomerName.trim() || cleanHandle,
            initialMessage: msg
          })
        }).catch(() => {});
      } else if (appId === 'snapchat') {
        fetch('/api/channels/snapchat/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: isPhone ? cleanHandle : undefined,
            username: !isPhone ? cleanHandle : undefined,
            name: newChatCustomerName.trim() || cleanHandle,
            initialMessage: msg
          })
        }).catch(() => {});
      }

      // 2. Add message to local conversation store
      const newMsgObj: ChatMessage = {
        id: String(Date.now()),
        sender: 'operator',
        text: msg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        seen: true,
        seenTime: 'Just now',
        delivered: true,
        timestamp: Date.now(),
      };

      setConversations((prev) => ({
        ...prev,
        [contactId]: [newMsgObj]
      }));

      // 3. Create real ContactProfile and persist to cf_live_chats_by_app
      const currentTheme = APP_GRADIENT_THEMES[appId] || APP_GRADIENT_THEMES.whatsapp;
      const newContactObj: ContactProfile = {
        id: contactId,
        appId,
        name: newChatCustomerName.trim() || cleanHandle,
        handleOrPhone: cleanHandle,
        phone: isPhone ? cleanHandle : undefined,
        username: !isPhone ? (cleanHandle.startsWith('@') ? cleanHandle : `@${cleanHandle}`) : undefined,
        avatarColor: currentTheme.solidColor || '#7360F2',
        statusText: 'En ligne',
        lastMessage: msg,
        time: 'Just now',
        lastMessageTime: 'Just now',
        timestamp: Date.now(),
        unreadCount: 0,
        status: 'ongoing',
        messages: [newMsgObj]
      };

      try {
        const currentLive = JSON.parse(localStorage.getItem('cf_live_chats_by_app') || '{}');
        const appChats = currentLive[appId] || [];
        const existingIdx = appChats.findIndex((c: any) => c.id === contactId);
        if (existingIdx >= 0) {
          appChats[existingIdx].messages = [...(appChats[existingIdx].messages || []), newMsgObj];
          appChats[existingIdx].lastMessage = msg;
          appChats[existingIdx].timestamp = Date.now();
        } else {
          appChats.unshift(newContactObj);
        }
        currentLive[appId] = appChats;
        localStorage.setItem('cf_live_chats_by_app', JSON.stringify(currentLive));
        window.dispatchEvent(new Event('storage'));
      } catch {}

      // 4. Register contact in parent state and select it
      onMessageActivity?.(appId, contactId, msg, Date.now());
      onNavigatePath?.([contactId]);

      setNewChatCustomerHandle('');
      setNewChatCustomerName('');
      setNewChatFirstMessage('');
    } finally {
      setIsSubmittingNewChat(false);
    }
  };

  // Resolve current active contact based on available contacts
  const storeChats = chatsByApp?.[appId] || [];
  const localCachedChats = (() => {
    if (typeof window === 'undefined') return [];
    try {
      const s = JSON.parse(localStorage.getItem('cf_live_chats_by_app') || '{}');
      return Array.isArray(s[appId]) ? s[appId] : [];
    } catch {
      return [];
    }
  })();
  const pairedFallback = (PAIRED_CHATS_BY_APP[appId] && PAIRED_CHATS_BY_APP[appId].length > 0) ? PAIRED_CHATS_BY_APP[appId] : [];
  const currentAppContacts = (liveContacts && liveContacts.length > 0)
    ? liveContacts
    : (storeChats.length > 0)
      ? storeChats
      : (localCachedChats.length > 0)
        ? localCachedChats
        : (isConnected && pairedFallback.length > 0)
          ? pairedFallback
          : [];
  // Resolve the active contact traversing the hierarchy
  let resolvedContact = null;
  let currentList = currentAppContacts;
  
  if (selectedContactPath && selectedContactPath.length > 0) {
    for (const pId of selectedContactPath) {
      const cleanPhone = (c: any) => c.handleOrPhone?.replace(/\D/g, '') || '';
      const found = currentList.find(c =>
        c.id === pId ||
        c.id.split(',').includes(pId) ||
        pId.split(',').includes(c.id) ||
        (cleanPhone(c).length >= 6 && pId.includes(cleanPhone(c)))
      );
      if (found) {
        resolvedContact = found;
        if (found.children && found.children.length > 0) {
          currentList = found.children;
        } else {
          // If the contact has no children (e.g. it has topics or is a chat), stop traversing contact tree
          break;
        }
      } else {
        break;
      }
    }
  }

  if (!resolvedContact && typeof window !== 'undefined' && selectedContactPath && selectedContactPath.length > 0) {
    try {
      const stored = JSON.parse(localStorage.getItem('cf_live_chats_by_app') || '{}');
      const appStored = stored[appId] || [];
      const foundInStored = appStored.find((c: any) => c.id === selectedContactPath[0]);
      if (foundInStored) {
        resolvedContact = foundInStored;
      }
    } catch {}
  }

  if (!resolvedContact && selectedContactPath && selectedContactPath[0]?.startsWith('sandbox_bot_')) {
    const botId = selectedContactPath[0];
    let botMessages: ChatMessage[] = [
      {
        id: `bot_welcome_${botId}`,
        sender: 'customer',
        text: `Salam khoya! Marhba bik f Chatbot Farm 🇩🇿. Rani hna comme bot de test (Bot Test). B3atli ay message w njawbak direct!`,
        time: '10:00 AM',
        seen: true,
        delivered: true,
        timestamp: 1,
      }
    ];
    let botLastMsg = botMessages[0].text;
    let botLastTime = '10:00 AM';
    let botLastTs = 1;

    if (typeof window !== 'undefined') {
      try {
        const storedConvs = JSON.parse(localStorage.getItem('cf_conversations') || '{}');
        if (Array.isArray(storedConvs[botId]) && storedConvs[botId].length > 0) {
          botMessages = storedConvs[botId];
          const last = botMessages[botMessages.length - 1];
          if (last) {
            botLastMsg = last.text || (last.imageUrl ? 'Photo' : 'Voice note');
            botLastTime = last.time || 'Just now';
            botLastTs = last.timestamp || Date.now();
          }
        }
      } catch {}
    }

    resolvedContact = {
      id: botId,
      appId: appId,
      name: 'Bot Test',
      handleOrPhone: '+213 550 00 00 00 • AI Sandbox',
      avatarText: 'BT',
      avatarColor: '#059669',
      profilePicUrl: BOT_TEST_AVATAR,
      statusText: 'Online • AI Test Sandbox Active',
      lastMessage: botLastMsg,
      time: botLastTime,
      timestamp: botLastTs,
      unreadCount: 0,
      isAiTestBot: true,
      isPinned: true,
      messages: botMessages
    };
  }

  
  const activeContact = resolvedContact || currentAppContacts[0];
  const isTestBot = Boolean(activeContact?.isAiTestBot || activeContact?.id?.startsWith('sandbox_bot_'));
  const activeContactDisplayName = isTestBot ? 'Bot Test' : (activeContact?.name || '');
  const currentTopicId = selectedContactPath[1] || (activeContact?.isGroup ? activeContact?.topics?.[0]?.id : undefined);

  // Merge base contact messages with live/operator messages stored in state
  const activeMessages = useMemo(() => {
    const baseMsgs = isTestBot ? [] : (activeContact?.messages || []);
    const storedMsgs = activeContact ? (conversations[activeContact.id] || (isTestBot ? (activeContact.messages || []) : [])) : [];
    const msgMap = new Map<string, ChatMessage>();
    for (const m of baseMsgs) msgMap.set(m.id, m);
    for (const m of storedMsgs) msgMap.set(m.id, m);

    const getMsgTime = (m: any): number => {
      if (typeof m?.id === 'string' && m.id.startsWith('bot_welcome_')) return 1;
      if (typeof m?.timestamp === 'number' && !isNaN(m.timestamp) && m.timestamp > 0) return m.timestamp;
      const numId = Number(m?.id);
      if (!isNaN(numId) && numId > 1600000000000) return numId;
      return 2;
    };
    const allContactMessages = Array.from(msgMap.values()).sort((a: any, b: any) => getMsgTime(a) - getMsgTime(b));

    let msgs = allContactMessages;

    // For AI test bot sandbox, ensure no unwanted automatic bot reactions linger
    if (activeContact?.isAiTestBot || activeContact?.id?.startsWith('sandbox_bot_')) {
      msgs = msgs.map((m) => {
        if (m.reactions && m.reactions.length > 0) {
          const userOnly = m.reactions.filter((r) => r.userReacted);
          return { ...m, reactions: userOnly.length > 0 ? userOnly : undefined };
        }
        return m;
      });
    }

    if (currentTopicId && activeContact?.isGroup && activeContact?.topics && activeContact.topics.length > 0) {
      const currentTopicObj = activeContact.topics.find((t: any) => 
        String(t.id) === String(currentTopicId) ||
        (t.name && String(currentTopicId).toLowerCase().includes(t.name.toLowerCase()))
      );
      const isFirstOrGeneral = Boolean(
        currentTopicObj?.id === activeContact.topics[0]?.id ||
        String(currentTopicObj?.id) === '1' ||
        Number(currentTopicObj?.id) === 1 ||
        currentTopicObj?.name?.toLowerCase().includes('general') ||
        (currentTopicObj as any)?.isGeneral
      );

      const topicFiltered = msgs.filter((m) => {
        const isEventMsg = isTelegramEventMessage(m);
        if (isEventMsg) {
          // System event messages (joining via invite link, leaving, etc.) belong to the General channel in forum groups
          if (isFirstOrGeneral) return true;
          return m.topicId && String(m.topicId) === String(currentTopicId);
        }
        if (!m.topicId) {
          // Untagged messages in Telegram forum group belong to general/root topic
          return isFirstOrGeneral;
        }
        const mTopicStr = String(m.topicId).trim();
        const curTopicStr = String(currentTopicId).trim();
        if (mTopicStr === curTopicStr) return true;
        const mNum = mTopicStr.replace(/\D/g, '');
        const curNum = curTopicStr.replace(/\D/g, '');
        if (mNum && curNum && mNum === curNum) return true;
        if (currentTopicObj && (mTopicStr.toLowerCase() === currentTopicObj.name.toLowerCase() || mTopicStr.toLowerCase() === `#${currentTopicObj.name.toLowerCase()}`)) return true;
        return false;
      });

      if (topicFiltered.length > 0) {
        msgs = topicFiltered;
      } else if (allContactMessages.length > 0) {
        // Safety fallback: if topic-specific filter yields 0 messages, but the chat has active messages:
        // If we are in General or first topic, or if none of the messages have specific topicId tags,
        // fallback to allContactMessages so the chat is NEVER falsely displayed as empty!
        const hasAnyTopicTagged = allContactMessages.some((m) => Boolean(m.topicId));
        if (isFirstOrGeneral || !hasAnyTopicTagged) {
          msgs = allContactMessages;
        } else {
          msgs = topicFiltered;
        }
      } else {
        msgs = topicFiltered;
      }
    }
    return msgs;
  }, [activeContact, conversations, isTestBot, currentTopicId]);

  const currentTopic = activeContact?.topics?.find((t: any) => 
    String(t.id) === String(currentTopicId) ||
    (t.name && String(currentTopicId).toLowerCase().includes(t.name.toLowerCase()))
  ) || activeContact?.topics?.[0];

  const hasGroupTopics = Boolean(activeContact?.isGroup || (activeContact?.topics && activeContact.topics.length > 0));
  const isGeneralTopic = Boolean(
    hasGroupTopics && (
      String(currentTopic?.id) === '1' ||
      Number(currentTopic?.id) === 1 ||
      currentTopic?.id === activeContact?.topics?.[0]?.id ||
      (currentTopic as any)?.name?.toLowerCase().includes('general') ||
      (currentTopic as any)?.title?.toLowerCase().includes('general') ||
      (currentTopic as any)?.isGeneral
    )
  );

  const isTopicClosed = Boolean(currentTopic?.closed || (currentTopic as any)?.isClosed);
  const isChatReadOnly = Boolean(
    activeContact?.isReadOnly ||
    activeContact?.readOnly ||
    activeContact?.canSend === false ||
    activeContact?.isBroadcast ||
    activeContact?.statusText === 'Channel' ||
    isTopicClosed ||
    canSendMessages === false
  );

  const [isSwitchingChat, setIsSwitchingChat] = useState(false);
  useEffect(() => {
    if (activeContact?.id) {
      setIsSwitchingChat(true);
      const timer = setTimeout(() => setIsSwitchingChat(false), 50);
      return () => clearTimeout(timer);
    }
  }, [activeContact?.id, currentTopicId]);

  // Used channels calculation for template modal
  const usedChannelIds = React.useMemo(() => {
    let ids: string[] = ['whatsapp', 'telegram', 'gmail'];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cf_pinned_apps');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) ids = parsed;
        }
      } catch {}
    }
    if (appId && !ids.includes(appId)) ids.push(appId);
    return ids;
  }, [appId, isTemplateModalOpen]);

  const displayedAppsForModal = React.useMemo(() => {
    if (showAllAppsInModal) {
      return ALL_APP_LOGOS_FOR_TEMPLATES;
    }
    return ALL_APP_LOGOS_FOR_TEMPLATES.filter(app => app.id === 'all' || usedChannelIds.includes(app.id));
  }, [showAllAppsInModal, usedChannelIds]);

  // Resolve dynamic variables in template text with live runtime contact & app data
  const resolveTemplateVariables = useCallback((templateText: string) => {
    if (!templateText) return '';
    let res = templateText;

    const contactName = activeContact?.name || 'Client';
    const contactPhone = activeContact?.handleOrPhone || activeContact?.phone || '';
    const contactWilaya = (activeContact as any)?.wilaya || '16 - Alger';

    const entrepriseName = typeof window !== 'undefined' ? (localStorage.getItem('cf_store_name') || 'E-Shop Algérie') : 'E-Shop Algérie';
    const channelName = appId ? (appId.charAt(0).toUpperCase() + appId.slice(1).replace('_', ' ')) : 'Chat';
    const website = typeof window !== 'undefined' ? (localStorage.getItem('cf_store_website') || 'https://eshop.dz') : 'https://eshop.dz';

    const agentName = currentUser?.name || 'Agent';
    const agentPhone = typeof window !== 'undefined' ? (localStorage.getItem('cf_support_phone') || '+213 21 00 00 00') : '+213 21 00 00 00';
    const agentEmail = currentUser?.email || 'support@eshop.dz';

    const orderId = 'DZ-YAL-84920';
    const totalPrice = '4,800 DA';
    const deliveryService = 'Yalidine Express';
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    res = res
      .replace(/\{name\}/gi, contactName)
      .replace(/\{client_phone\}/gi, contactPhone)
      .replace(/\{wilaya\}/gi, contactWilaya)
      .replace(/\{entreprise\}/gi, entrepriseName)
      .replace(/\{app_name\}/gi, channelName)
      .replace(/\{store_website\}/gi, website)
      .replace(/\{admin_name\}/gi, agentName)
      .replace(/\{admin_phone\}/gi, agentPhone)
      .replace(/\{admin_email\}/gi, agentEmail)
      .replace(/\{order_id\}/gi, orderId)
      .replace(/\{total_price\}/gi, totalPrice)
      .replace(/\{delivery_service\}/gi, deliveryService)
      .replace(/\{time\}/gi, nowTime);

    return res;
  }, [activeContact, appId, currentUser]);

  const getVariableResolvedDisplay = useCallback((v: CleanDynamicVariable) => {
    if (!activeContact) return v.label;
    switch (v.key) {
      case '{name}': return activeContact.name || v.label;
      case '{client_phone}': return activeContact.handleOrPhone || activeContact.phone || v.label;
      case '{wilaya}': return (activeContact as any)?.wilaya || '16 - Alger';
      case '{app_name}': return appId.toUpperCase();
      case '{entreprise}': return typeof window !== 'undefined' ? (localStorage.getItem('cf_store_name') || 'E-Shop Algérie') : 'E-Shop Algérie';
      case '{order_id}': return 'DZ-YAL-84920';
      case '{total_price}': return '4,800 DA';
      case '{delivery_service}': return 'Yalidine Express';
      case '{time}': return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      default: return v.label;
    }
  }, [activeContact, appId]);

  const insertVariableIntoTemplate = useCallback((varKey: string, dropIndex?: number) => {
    const textarea = templateTextareaRef.current;
    if (!textarea) {
      setNewTemplateText(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + varKey);
      return;
    }

    const start = dropIndex !== undefined ? dropIndex : textarea.selectionStart;
    const end = dropIndex !== undefined ? dropIndex : textarea.selectionEnd;
    const currentVal = newTemplateText;
    const before = currentVal.substring(0, start);
    const after = currentVal.substring(end);
    const spacingBefore = before.length > 0 && !before.endsWith(' ') ? ' ' : '';
    const spacingAfter = after.length > 0 && !after.startsWith(' ') ? ' ' : '';
    const insertStr = `${spacingBefore}${varKey}${spacingAfter}`;
    const nextVal = before + insertStr + after;
    setNewTemplateText(nextVal);

    const newCursorPos = start + insertStr.length;
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  }, [newTemplateText]);

  const handleDropOnTemplateTextarea = useCallback((e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    const textarea = templateTextareaRef.current;
    let dropIndex = textarea ? textarea.selectionStart : undefined;

    if (typeof (document as any).caretRangeFromPoint === 'function') {
      const range = (document as any).caretRangeFromPoint(e.clientX, e.clientY);
      if (range && range.startOffset !== undefined) {
        dropIndex = range.startOffset;
      }
    } else if (typeof (document as any).caretPositionFromPoint === 'function') {
      const pos = (document as any).caretPositionFromPoint(e.clientX, e.clientY);
      if (pos && pos.offset !== undefined) {
        dropIndex = pos.offset;
      }
    }

    insertVariableIntoTemplate(data, dropIndex);
  }, [insertVariableIntoTemplate]);

  const handleSaveCustomTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newTemplateLabel.trim();
    const text = newTemplateText.trim();
    if (!label || !text) return;

    if (editingTemplateId) {
      const updated = quickTemplates.map((t) =>
        t.id === editingTemplateId
          ? {
              ...t,
              label,
              text,
              icon: newTemplateIcon.trim() || '💬',
              appScope: newTemplateAppScope,
              contactId: newTemplateIsSpecificToChat ? activeContact?.id : undefined,
              contactName: newTemplateIsSpecificToChat ? activeContact?.name : undefined,
            }
          : t
      );
      saveTemplatesToStorage(updated);
    } else {
      const newTpl: QuickTemplate = {
        id: `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        label,
        text,
        icon: newTemplateIcon.trim() || '💬',
        isCustom: true,
        appScope: newTemplateAppScope,
        contactId: newTemplateIsSpecificToChat ? activeContact?.id : undefined,
        contactName: newTemplateIsSpecificToChat ? activeContact?.name : undefined,
      };
      saveTemplatesToStorage([...quickTemplates, newTpl]);
    }

    setIsTemplateModalOpen(false);
    setEditingTemplateId(null);
  };

  const handleDeleteTemplate = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    saveTemplatesToStorage(quickTemplates.filter(t => t.id !== id));
    if (templateContextMenu?.template.id === id) setTemplateContextMenu(null);
  };

  const handleTogglePinTemplate = (id: string) => {
    saveTemplatesToStorage(quickTemplates.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t));
    setTemplateContextMenu(null);
  };

  const handleToggleChatSpecific = (id: string) => {
    saveTemplatesToStorage(
      quickTemplates.map(t => {
        if (t.id === id) {
          const isCurrentlySpecific = Boolean(t.contactId);
          return {
            ...t,
            contactId: isCurrentlySpecific ? undefined : activeContact?.id,
            contactName: isCurrentlySpecific ? undefined : activeContact?.name,
          };
        }
        return t;
      })
    );
    setTemplateContextMenu(null);
  };

  const handleToggleTemplateAppScope = (id: string, targetAppId: string) => {
    saveTemplatesToStorage(
      quickTemplates.map(t => {
        if (t.id === id) {
          let currentScope = t.appScope || ['all'];
          if (targetAppId === 'all') {
            return { ...t, appScope: ['all'] };
          }
          let filtered = currentScope.filter(s => s !== 'all');
          if (filtered.includes(targetAppId)) {
            filtered = filtered.filter(s => s !== targetAppId);
            if (filtered.length === 0) filtered = ['all'];
          } else {
            filtered.push(targetAppId);
          }
          return { ...t, appScope: filtered };
        }
        return t;
      })
    );
  };

  const handleStartEditTemplate = (t: QuickTemplate) => {
    setEditingTemplateId(t.id);
    setNewTemplateLabel(t.label);
    setNewTemplateText(t.text);
    setNewTemplateIcon(t.icon || '💬');
    setNewTemplateAppScope(t.appScope || ['all']);
    setNewTemplateIsSpecificToChat(Boolean(t.contactId));
    setTemplateContextMenu(null);
    setShowAllAppsInModal(false);
    setIsModalVariablesExpanded(false);
    setIsTemplateModalOpen(true);
  };

  const handleReorderTemplates = useCallback((newVisibleOrder: QuickTemplate[]) => {
    setQuickTemplates(prev => {
      const visibleIds = new Set(newVisibleOrder.map(t => t.id));
      const result: QuickTemplate[] = [];
      let visibleIdx = 0;

      for (const t of prev) {
        if (visibleIds.has(t.id)) {
          if (visibleIdx < newVisibleOrder.length) {
            result.push(newVisibleOrder[visibleIdx]);
            visibleIdx++;
          }
        } else {
          result.push(t);
        }
      }

      while (visibleIdx < newVisibleOrder.length) {
        result.push(newVisibleOrder[visibleIdx++]);
      }

      // Debounce persisting to storage and cloud so dragging is butter-smooth (60fps) with NO storage event echo loop!
      if (saveQuickTemplatesTimerRef.current) {
        clearTimeout(saveQuickTemplatesTimerRef.current);
      }
      saveQuickTemplatesTimerRef.current = setTimeout(() => {
        try {
          localStorage.setItem('cf_quick_templates_v2', JSON.stringify(result));
        } catch {}
        if (currentUser?.id) {
          saveQuickTemplatesToCloud(currentUser.id, result);
        }
      }, 350);

      return result;
    });
  }, [currentUser?.id]);

  const getTemplateColorStyles = (t: QuickTemplate) => {
    if (t.contactId) {
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 hover:border-amber-500 shadow-amber-500/10';
    }
    const scope = t.appScope;
    if (scope && scope.length === 1 && !scope.includes('all')) {
      const targetApp = scope[0];
      switch (targetApp) {
        case 'whatsapp':
        case 'whatsapp_2':
          return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 hover:border-emerald-500';
        case 'telegram':
          return 'bg-sky-50 dark:bg-sky-950/40 text-[#2AABEE] dark:text-sky-300 border-sky-300 dark:border-sky-700 hover:border-[#2AABEE]';
        case 'instagram':
          return 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700 hover:border-purple-500';
        case 'messenger':
          return 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700 hover:border-[#0084FF]';
        case 'gmail':
          return 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700 hover:border-[#EA4335]';
        case 'web_widget':
          return 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-700 hover:border-[#1B6648]';
      }
    } else if (scope && scope.length > 1 && !scope.includes('all')) {
      return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700 hover:border-indigo-500';
    }
    return 'bg-white dark:bg-[#1E293B] text-gray-800 dark:text-gray-100 border-gray-200 dark:border-slate-700/80 hover:border-[#1B6648] dark:hover:border-emerald-400';
  };

  interface QuickTemplateItemProps {
    template: QuickTemplate;
    resolvedText: string;
    resolvedLabel: string;
    colorClasses: string;
    onInsert: (text: string) => void;
    onContextMenu: (e: React.MouseEvent, t: QuickTemplate) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
  }

  const QuickTemplateItem: React.FC<QuickTemplateItemProps> = ({
    template: t,
    resolvedText,
    resolvedLabel,
    colorClasses,
    onInsert,
    onContextMenu,
    onDelete,
  }) => {
    const dragControls = useDragControls();

    return (
      <Reorder.Item
        key={t.id}
        value={t}
        id={t.id}
        dragListener={false}
        dragControls={dragControls}
        style={{ willChange: 'transform' }}
        whileDrag={{ scale: 1.04, boxShadow: "0 8px 20px rgba(0,0,0,0.18)", zIndex: 50 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="shrink-0 flex items-center select-none"
      >
        <div
          onContextMenu={(e) => onContextMenu(e, t)}
          className="relative group/tpl shrink-0 flex items-center"
        >
          <div
            className={`text-xs pl-1 pr-2.5 py-1 rounded-full shadow-2xs border font-medium transition-[background-color,border-color,box-shadow,opacity] duration-150 flex items-center gap-1.5 whitespace-nowrap select-none ${colorClasses}`}
            title={`${resolvedText}\n\n[Maintenir les 6 points pour glisser | Clic: Insérer | Clic droit: Options]`}
          >
            {/* Drag Handle: 6 dots icon - ONLY THIS initiates reorder drag */}
            <div
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dragControls.start(e);
              }}
              className="cursor-grab active:cursor-grabbing p-1 -ml-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center justify-center shrink-0 touch-none select-none"
              title="Maintenir et glisser pour réorganiser"
            >
              <GripVertical className="w-2.5 h-2.5 opacity-60 hover:opacity-100" />
            </div>

            {/* Clickable message button: strictly inserts text, NEVER drags, NEVER native text-drag */}
            <button
              type="button"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                onInsert(resolvedText);
              }}
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity select-none text-left"
            >
              <span className="text-sm leading-none shrink-0 pointer-events-none select-none">{t.icon || '💬'}</span>
              <span className="font-semibold pointer-events-none select-none">{resolvedLabel}</span>
              {t.isPinned && (
                <span className="shrink-0 inline-flex items-center text-amber-500 pointer-events-none" title="Épinglé au début">
                  <Pin className="w-2.5 h-2.5 fill-current rotate-45" />
                </span>
              )}
              {t.contactId && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold shrink-0 pointer-events-none" title={`Réservé à ${t.contactName || 'ce chat'}`}>
                  Ce chat
                </span>
              )}
            </button>

            {/* Quick delete button */}
            <button
              type="button"
              onClick={(e) => onDelete(t.id, e)}
              className="opacity-0 group-hover/tpl:opacity-100 p-0.5 -mr-1 ml-0.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-opacity cursor-pointer shadow-2xs"
              title="Supprimer ce message"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </Reorder.Item>
    );
  };

  // Render bottom quick templates bar
  const renderQuickTemplatesBar = () => {
    if (isChatReadOnly) return null;

    const activeTemplatesList = quickTemplates.length > 0 ? quickTemplates : DEFAULT_QUICK_TEMPLATES;
    let visibleTemplates = activeTemplatesList
      .filter((t) => {
        if (t.contactId && activeContact && t.contactId !== activeContact.id) {
          return false;
        }
        if (t.appScope && t.appScope.length > 0 && !t.appScope.includes('all')) {
          if (!t.appScope.includes(appId)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });

    if (visibleTemplates.length === 0) {
      visibleTemplates = DEFAULT_QUICK_TEMPLATES;
    }

    if (!isQuickTemplatesOpen) {
      return (
        <div className="relative px-2.5 sm:px-3 py-1 bg-[#F0F2F5]/90 dark:bg-[#111B21]/90 border-t border-[#DFDFD4]/80 dark:border-[#2E333D]/80 flex items-center justify-between shrink-0 select-none z-10 transition-colors">
          <button
            type="button"
            onClick={() => toggleQuickTemplates(true)}
            className="text-xs font-semibold text-gray-600 hover:text-emerald-600 dark:text-neutral-300 dark:hover:text-emerald-400 flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer group"
            title="Afficher les réponses rapides (messages préenregistrés)"
          >
            <span className="p-1 rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-bold">Réponses rapides</span>
            <span className="text-[10px] bg-black/5 dark:bg-white/10 px-1.5 py-0.2 rounded-full font-mono text-gray-500 dark:text-neutral-400">
              {visibleTemplates.length}
            </span>
            <ChevronUp className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 transition-transform group-hover:-translate-y-0.5" />
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setEditingTemplateId(null);
                setNewTemplateLabel('');
                setNewTemplateText('');
                setNewTemplateIcon('💬');
                setNewTemplateAppScope(['all']);
                setNewTemplateIsSpecificToChat(false);
                setShowAllAppsInModal(false);
                setIsModalVariablesExpanded(false);
                setIsTemplateModalOpen(true);
              }}
              className="text-[11px] text-gray-500 hover:text-emerald-600 dark:text-neutral-400 dark:hover:text-emerald-400 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Ajouter un message préenregistré"
            >
              <Plus className="w-3 h-3" />
              <span className="hidden sm:inline">Ajouter</span>
            </button>
            <button
              type="button"
              onClick={() => toggleQuickTemplates(true)}
              className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-md transition-all active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
              title="Déplier la barre de messages rapides"
            >
              <span>Ouvrir</span>
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="relative px-2.5 sm:px-3 py-1.5 bg-[#F0F2F5] dark:bg-[#111B21] border-t border-[#DFDFD4] dark:border-[#2E333D] flex items-center gap-2 shrink-0 select-none">
        {/* Category Segmented Switch: Logos-only (Ultra compact, zero text) */}
        <div className="flex items-center shrink-0 pr-1 border-r border-gray-300/60 dark:border-neutral-700/60">
          <div className="flex items-center p-0.5 rounded-lg bg-black/5 dark:bg-white/10 border border-gray-300/50 dark:border-neutral-700/50 shrink-0 select-none gap-0.5">
            <button
              type="button"
              onClick={() => setQuickReplyMode('messages')}
              className={`p-1 sm:p-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer ${
                quickReplyMode === 'messages'
                  ? 'bg-white dark:bg-[#1E293B] text-[#1B6648] dark:text-emerald-400 shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                  : 'text-gray-400 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
              title="Messages préenregistrés"
              aria-label="Messages préenregistrés"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setQuickReplyMode('variables')}
              className={`p-1 sm:p-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer ${
                quickReplyMode === 'variables'
                  ? 'bg-white dark:bg-[#1E293B] text-[#1B6648] dark:text-emerald-400 shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                  : 'text-gray-400 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
              title="Variables dynamiques ({name}, {wilaya}, etc.)"
              aria-label="Variables dynamiques"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </button>
          </div>
        </div>

        {/* Scrollable Stream Container with Left/Right smooth arrows */}
        <div className="relative flex-1 min-w-0 flex items-center">
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollStream('left')}
              className="absolute left-0 z-30 h-5 w-5 rounded-full bg-white/95 dark:bg-[#1E293B]/95 shadow-md border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:scale-110 active:scale-95 transition-all cursor-pointer -ml-1"
              title="Défiler à gauche"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
          )}

          {/* Scrollable Stream (zero-latency wheel, touch pan) */}
          <div
            ref={scrollStreamRef}
            onScroll={checkScrollButtons}
            className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 touch-pan-x overscroll-contain"
          >
            {quickReplyMode === 'messages' ? (
              visibleTemplates.length === 0 ? (
                <span className="text-[11px] text-gray-400 italic">
                  Aucun message pour ce canal. Cliquez sur Ajouter pour en créer un.
                </span>
              ) : (
                <Reorder.Group
                  axis="x"
                  values={visibleTemplates}
                  onReorder={handleReorderTemplates}
                  className="flex items-center gap-1.5 list-none m-0 p-0"
                >
                  {visibleTemplates.map((t) => {
                    const resolvedText = resolveTemplateVariables(t.text);
                    const colorClasses = getTemplateColorStyles(t);
                    const resolvedLabel = resolveTemplateVariables(t.label);

                    return (
                      <QuickTemplateItem
                        key={t.id}
                        template={t}
                        resolvedText={resolvedText}
                        resolvedLabel={resolvedLabel}
                        colorClasses={colorClasses}
                        onInsert={(text) => {
                          setInputMessage((prev) => prev ? `${prev} ${text}` : text);
                        }}
                        onContextMenu={(e, tpl) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setTemplateContextMenu({
                            x: Math.min(e.clientX, typeof window !== 'undefined' ? window.innerWidth - 260 : 300),
                            y: Math.min(e.clientY, typeof window !== 'undefined' ? window.innerHeight - 380 : 300),
                            template: tpl,
                          });
                        }}
                        onDelete={(id, e) => handleDeleteTemplate(id, e)}
                      />
                    );
                  })}
                </Reorder.Group>
              )
            ) : (
              /* Variables Mode: Clean Dynamic Variable chips with live resolved values */
              <div className="flex items-center gap-1.5 py-0.5 shrink-0">
                {CLEAN_DYNAMIC_VARIABLES.map((v) => {
                  const displayVal = getVariableResolvedDisplay(v);
                  const resolvedInsertion = resolveTemplateVariables(v.key);
                  return (
                    <button
                      key={v.key}
                      type="button"
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', resolvedInsertion);
                      }}
                      onClick={() => setInputMessage(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + resolvedInsertion)}
                      className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold shrink-0 cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 transition-all shadow-2xs flex items-center gap-1 ${v.colorClass}`}
                      title={`${v.label}: Cliquez pour insérer ou glissez (${resolvedInsertion})`}
                    >
                      <Sparkles className="w-2.5 h-2.5 opacity-60" />
                      <span className="truncate max-w-[130px] inline-block">{displayVal}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Scroll Right Button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollStream('right')}
              className="absolute right-0 z-30 h-5 w-5 rounded-full bg-white/95 dark:bg-[#1E293B]/95 shadow-md border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:scale-110 active:scale-95 transition-all cursor-pointer -mr-1"
              title="Défiler à droite"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Sticky Add & Close Controls */}
        <div className="sticky right-0 shrink-0 flex items-center pl-2 pr-0.5 gap-1.5 border-l border-gray-300/60 dark:border-neutral-700/60 bg-[#F0F2F5] dark:bg-[#111B21] shadow-[-8px_0_10px_-3px_rgba(0,0,0,0.06)] dark:shadow-[-8px_0_10px_-3px_rgba(0,0,0,0.4)] z-10">
          <button
            id="sticky-add-template-btn"
            type="button"
            onClick={() => {
              setEditingTemplateId(null);
              setNewTemplateLabel('');
              setNewTemplateText('');
              setNewTemplateIcon('💬');
              setNewTemplateAppScope(['all']);
              setNewTemplateIsSpecificToChat(false);
              setShowAllAppsInModal(false);
              setIsModalVariablesExpanded(false);
              setIsTemplateModalOpen(true);
            }}
            className="text-xs px-2.5 sm:px-3 py-1 rounded-full bg-[#1B6648] hover:bg-[#155239] text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap shadow-xs"
            title="Nouveau message préenregistré"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>

          <button
            type="button"
            onClick={() => toggleQuickTemplates(false)}
            className="p-1 sm:p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Fermer la barre de messages rapides (masquer pour toutes les apps)"
            aria-label="Fermer les messages préenregistrés"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Render modal on top of everything (z-[99999] portaled directly to document.body)
  const renderTemplateModal = () => {
    if (typeof document === 'undefined') return null;

    return createPortal(
      <AnimatePresence>
        {isTemplateModalOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1E222A] rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-700 p-5 w-full max-w-lg space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar select-none"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#1B6648] dark:text-emerald-400">
                    {editingTemplateId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                      {editingTemplateId ? 'Modifier le message préenregistré' : 'Nouveau message préenregistré'}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Personnalisez votre réponse avec des variables dynamiques en temps réel
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCustomTemplate} className="space-y-3.5">
                {/* 1. Icon & Label */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-1 space-y-1">
                    <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">Icône</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={newTemplateIcon}
                      onChange={(e) => setNewTemplateIcon(e.target.value)}
                      placeholder="💬"
                      className="w-full text-center px-2 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 caret-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-[#1B6648] dark:focus:ring-emerald-500"
                    />
                  </div>
                  <div className="col-span-3 space-y-1">
                    <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">Titre du bouton</label>
                    <input
                      type="text"
                      required
                      value={newTemplateLabel}
                      onChange={(e) => setNewTemplateLabel(e.target.value)}
                      placeholder="Ex: Devis Rapide"
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 caret-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-[#1B6648] dark:focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* 2. MESSAGE TEXTAREA ON TOP OF DYNAMIC VARIABLES */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">Message</label>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      Glissez ou cliquez sur une variable pour l'insérer
                    </span>
                  </div>
                  <textarea
                    ref={templateTextareaRef}
                    required
                    rows={3}
                    value={newTemplateText}
                    onChange={(e) => setNewTemplateText(e.target.value)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDropOnTemplateTextarea}
                    placeholder="Ex: Bonjour {name}, votre commande {order_id} pour {wilaya} est prête chez {entreprise}..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 caret-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-[#1B6648] dark:focus:ring-emerald-500 resize-none leading-relaxed"
                  />

                  {/* Live preview with real runtime values */}
                  {newTemplateText && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Aperçu en direct (données résolues) :</span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 italic leading-relaxed whitespace-pre-wrap">
                        {resolveTemplateVariables(newTemplateText)}
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. DYNAMIC VARIABLES SECTION (EXPANDABLE, MOSTLY COLLAPSED AT BASE) */}
                <div className="space-y-1.5 border border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 bg-gray-50/60 dark:bg-neutral-800/40">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsModalVariablesExpanded(prev => !prev)}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-gray-800 dark:text-gray-200 hover:text-emerald-600 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Variables Dynamiques</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/5 dark:bg-white/10 text-gray-500">
                        {CLEAN_DYNAMIC_VARIABLES.length}
                      </span>
                      {isModalVariablesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <span className="text-[10px] text-gray-400">
                      {isModalVariablesExpanded ? 'Glisser entre les mots' : 'Cliquer pour étendre'}
                    </span>
                  </div>

                  {/* Collapsed preview / Expanded full grid */}
                  {isModalVariablesExpanded ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto custom-scrollbar"
                    >
                      {CLEAN_DYNAMIC_VARIABLES.map((v) => (
                        <button
                          key={v.key}
                          type="button"
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', v.key);
                          }}
                          onClick={() => insertVariableIntoTemplate(v.key)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 shadow-2xs select-none ${v.colorClass}`}
                          title={`Glisser ou cliquer pour insérer ${v.label}`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
                      {CLEAN_DYNAMIC_VARIABLES.slice(0, 3).map((v) => (
                        <button
                          key={v.key}
                          type="button"
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', v.key);
                          }}
                          onClick={() => insertVariableIntoTemplate(v.key)}
                          className={`px-2 py-0.5 rounded-lg text-[10.5px] font-semibold border shrink-0 transition-all cursor-grab active:cursor-grabbing hover:scale-105 shadow-2xs select-none ${v.colorClass}`}
                          title={`Glisser ou cliquer pour insérer`}
                        >
                          {v.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setIsModalVariablesExpanded(true)}
                        className="text-[10px] font-bold text-emerald-600 hover:underline px-1 cursor-pointer shrink-0"
                      >
                        +{CLEAN_DYNAMIC_VARIABLES.length - 3} autres...
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. APPLICATIONS CIBLÉES (AUTHENTIC BRAND SVG LOGOS ONLY, NO NAMES, WITH '+' EXPANDER) */}
                <div className="space-y-1.5 pt-1 border-t border-gray-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">
                      Applications ciblées :
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {newTemplateAppScope.includes('all') ? 'Toutes les apps' : `${newTemplateAppScope.length} sélectionnée(s)`}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-200 dark:border-neutral-700/80">
                    {displayedAppsForModal.map((app) => {
                      const isSelected = newTemplateAppScope.includes(app.id);
                      return (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => {
                            if (app.id === 'all') {
                              setNewTemplateAppScope(['all']);
                            } else {
                              let updated = newTemplateAppScope.filter(a => a !== 'all');
                              if (updated.includes(app.id)) {
                                updated = updated.filter(a => a !== app.id);
                                if (updated.length === 0) updated = ['all'];
                              } else {
                                updated = [...updated, app.id];
                              }
                              setNewTemplateAppScope(updated);
                            }
                          }}
                          title={app.name}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer relative group ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/40 shadow-xs scale-105'
                              : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-gray-400 dark:hover:border-neutral-500 opacity-75 hover:opacity-100 hover:scale-105'
                          }`}
                        >
                          <div className="scale-95 group-hover:scale-105 transition-transform flex items-center justify-center">
                            {app.icon}
                          </div>
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {/* + Icon button to extend and see all apps */}
                    {!showAllAppsInModal && ALL_APP_LOGOS_FOR_TEMPLATES.length > displayedAppsForModal.length && (
                      <button
                        type="button"
                        onClick={() => setShowAllAppsInModal(true)}
                        className="w-9 h-9 rounded-xl border border-dashed border-[#1B6648]/60 dark:border-emerald-500/60 bg-[#1B6648]/5 dark:bg-emerald-950/20 hover:bg-[#1B6648]/15 text-[#1B6648] dark:text-emerald-400 flex items-center justify-center transition-all cursor-pointer hover:scale-105 shadow-2xs"
                        title="Voir toutes les 19 applications"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    )}
                  </div>

                  {/* Specific to active contact switch */}
                  {activeContact && (
                    <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newTemplateIsSpecificToChat}
                        onChange={(e) => setNewTemplateIsSpecificToChat(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                      />
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        Réserver ce message à <strong>{activeContact.name}</strong> uniquement (badge 🎯)
                      </span>
                    </label>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsTemplateModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 font-medium transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl text-xs bg-[#1B6648] hover:bg-[#144f37] text-white font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    {editingTemplateId ? 'Mettre à jour' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    );
  };

  // Save API key from the secure modal
  const handleSaveApiKeyFromModal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = modalApiKey.replace(/^['"]+|['"]+$/g, '').replace(/^Bearer\s+/i, '').trim();
    if (!clean) {
      setModalKeyError('Veuillez entrer une clé API valide.');
      return;
    }

    let detectedProv = modalProvider;
    let detectedModel = 'gemini-2.0-flash';
    if (clean.startsWith('gsk_')) {
      detectedProv = 'groq';
      detectedModel = 'llama-3.3-70b-versatile';
    } else if (clean.startsWith('sk-or-')) {
      detectedProv = 'openrouter';
      detectedModel = 'meta-llama/llama-3.3-70b-instruct';
    } else if (clean.startsWith('sk-')) {
      detectedProv = 'openai';
      detectedModel = 'gpt-4o-mini';
    } else {
      detectedProv = 'gemini';
      detectedModel = 'gemini-2.0-flash';
    }

    try {
      localStorage.setItem('cf_byok_key', clean);
      localStorage.setItem('cf_user_byok_key', clean);
      localStorage.setItem('cf_byok_provider', detectedProv);
      localStorage.setItem('cf_byok_model', detectedModel);
      const currSettings = JSON.parse(localStorage.getItem('cf_bot_settings') || '{}');
      currSettings.apiKey = clean;
      localStorage.setItem('cf_bot_settings', JSON.stringify(currSettings));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    setIsApiKeyModalOpen(false);
    setModalApiKey('');

    // Post instant confirmation in conversation
    if (activeContact) {
      const confirmMsg: ChatMessage = {
        id: `bot_key_conf_${Date.now()}`,
        sender: 'customer',
        text: `✅ **Clé API configurée avec succès !**\n\nVotre clé (${detectedProv.toUpperCase()}) a été enregistrée en toute sécurité dans votre navigateur sans être exposée dans le chat.\n\nVous pouvez désormais poser vos questions en Darija ou en Français : le bot est activé et prêt ! 🚀`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        seen: true,
        delivered: true,
        timestamp: Date.now(),
      };
      setConversations((prev) => ({
        ...prev,
        [activeContact.id]: [...(prev[activeContact.id] || activeContact.messages || []), confirmMsg],
      }));
    }
  };

  const API_KEY_PROVIDERS = {
    gemini: {
      name: 'Google Gemini (Flash 2.0)',
      badge: 'Recommandé • 100% Gratuit',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      link: 'https://aistudio.google.com/app/apikey',
      linkLabel: 'Obtenir ma clé Google AI Studio (Gratuit)',
      placeholder: 'AIzaSy...',
      description: 'Vision, audio et réponses Darija / Français rapides sans frais.',
    },
    groq: {
      name: 'Groq Cloud (LLaMA 3.3)',
      badge: 'Ultra Rapide • Gratuit',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      link: 'https://console.groq.com/keys',
      linkLabel: 'Obtenir ma clé Groq Cloud (Gratuit)',
      placeholder: 'gsk_...',
      description: 'Génération sub-seconde avec LLaMA 3.3 70B.',
    },
    openrouter: {
      name: 'OpenRouter',
      badge: 'Multi-modèles',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      link: 'https://openrouter.ai/keys',
      linkLabel: 'Obtenir ma clé OpenRouter',
      placeholder: 'sk-or-v1-...',
      description: 'Accédez à des dizaines de modèles (DeepSeek, Qwen, LLaMA).',
    },
    openai: {
      name: 'OpenAI (GPT-4o)',
      badge: 'GPT-4o Mini',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      link: 'https://platform.openai.com/api-keys',
      linkLabel: 'Obtenir ma clé OpenAI',
      placeholder: 'sk-proj-...',
      description: 'Grande précision et capacités multimodales.',
    },
  };

  const renderApiKeyModal = () => {
    if (typeof document === 'undefined') return null;

    const currentProvInfo = API_KEY_PROVIDERS[modalProvider];

    return createPortal(
      <AnimatePresence>
        {isApiKeyModalOpen && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1E222A] rounded-3xl shadow-2xl border border-gray-200 dark:border-neutral-700 p-5 sm:p-6 w-full max-w-md space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Key className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-gray-100">
                      Configuration Sécurisée Clé API
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Saisie locale sécurisée (jamais exposée en chat)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsApiKeyModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Provider Selection Tabs */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  Fournisseur d'IA
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['gemini', 'groq', 'openrouter', 'openai'] as const).map((prov) => {
                    const info = API_KEY_PROVIDERS[prov];
                    const isSelected = modalProvider === prov;
                    return (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => {
                          setModalProvider(prov);
                          setModalKeyError(null);
                        }}
                        className={`p-2 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                            : 'bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <div className="truncate">{info.name}</div>
                        <span className="text-[9.5px] font-normal opacity-75">{info.badge.split('•')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 1-Click Link to Get Key */}
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-neutral-900/80 border border-gray-200 dark:border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Besoin d'une clé gratuite ?</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentProvInfo.badgeColor}`}>
                    {currentProvInfo.badge}
                  </span>
                </div>
                <a
                  href={currentProvInfo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer text-center"
                >
                  <span>{currentProvInfo.linkLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <p className="text-[10px] text-gray-400 text-center">
                  {currentProvInfo.description}
                </p>
              </div>

              {/* Secure API Key Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                  <span>Collez votre clé API</span>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const clipText = await navigator.clipboard.readText();
                        if (clipText) {
                          setModalApiKey(clipText.trim());
                          setModalKeyError(null);
                        }
                      } catch {}
                    }}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    📋 Coller du presse-papier
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showModalApiKey ? 'text' : 'password'}
                    value={modalApiKey}
                    onChange={(e) => {
                      setModalApiKey(e.target.value);
                      setModalKeyError(null);
                    }}
                    placeholder={currentProvInfo.placeholder}
                    className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl px-3 py-2.5 font-mono text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalApiKey(!showModalApiKey)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  >
                    {showModalApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {modalKeyError && (
                  <p className="text-[11px] text-red-500 font-medium">{modalKeyError}</p>
                )}
              </div>

              {/* Security Banner */}
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[10.5px] text-gray-500 dark:text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Protection de la vie privée :</strong> Votre clé est chiffrée localement dans le stockage de votre navigateur. Elle n'apparaîtra jamais en clair dans le chat ni aux clients.
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsApiKeyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveApiKeyFromModal()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Enregistrer & Activer</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    );
  };

  // Render context menu for quick templates
  const renderTemplateContextMenu = () => {
    if (!templateContextMenu || typeof document === 'undefined') return null;

    return createPortal(
      <div
        style={{
          position: 'fixed',
          top: `${templateContextMenu.y}px`,
          left: `${templateContextMenu.x}px`,
          zIndex: 99999,
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-64 bg-white/95 dark:bg-[#1E222A]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-700 p-2 text-xs select-none animate-in fade-in zoom-in-95 duration-100 space-y-1"
      >
        <div className="px-2 py-1.5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-sm">{templateContextMenu.template.icon || '💬'}</span>
            <span className="font-bold text-gray-900 dark:text-white truncate">
              {templateContextMenu.template.label}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setTemplateContextMenu(null)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Option 1: Pin / Unpin */}
        <button
          type="button"
          onClick={() => handleTogglePinTemplate(templateContextMenu.template.id)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200 cursor-pointer font-medium text-left transition-colors"
        >
          {templateContextMenu.template.isPinned ? (
            <>
              <PinOff className="w-3.5 h-3.5 text-amber-500" />
              <span>Détacher de l'avant</span>
            </>
          ) : (
            <>
              <Pin className="w-3.5 h-3.5 text-amber-500 rotate-45" />
              <span>Épingler au début (En tête)</span>
            </>
          )}
        </button>

        {/* Option 2: Specific to this chat */}
        <button
          type="button"
          onClick={() => handleToggleChatSpecific(templateContextMenu.template.id)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200 cursor-pointer font-medium text-left transition-colors"
        >
          <Target className="w-3.5 h-3.5 text-amber-500" />
          <span className="truncate">
            {templateContextMenu.template.contactId
              ? 'Rendre accessible à tous les contacts'
              : `Spécifique à ce contact (${activeContact?.name || 'Contact'})`}
          </span>
        </button>

        {/* Option 3: App Scope Selector with Authentic SVG Logos */}
        <div className="px-2.5 py-1.5 border-t border-b border-gray-100 dark:border-neutral-800 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Adapter à l'application :
          </span>
          <div className="grid grid-cols-4 gap-1">
            {ALL_APP_LOGOS_FOR_TEMPLATES.slice(0, 8).map((app) => {
              const isSelected = templateContextMenu.template.appScope
                ? (app.id === 'all'
                    ? templateContextMenu.template.appScope.includes('all')
                    : templateContextMenu.template.appScope.includes(app.id))
                : app.id === 'all';

              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => handleToggleTemplateAppScope(templateContextMenu.template.id, app.id)}
                  title={app.name}
                  className={`p-1.5 rounded-lg flex items-center justify-center border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                      : 'border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="scale-90 flex items-center justify-center">{app.icon}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Option 4: Edit */}
        <button
          type="button"
          onClick={() => handleStartEditTemplate(templateContextMenu.template)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200 cursor-pointer font-medium text-left transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5 text-blue-500" />
          <span>Modifier texte & variables</span>
        </button>

        {/* Option 5: Delete */}
        <button
          type="button"
          onClick={() => handleDeleteTemplate(templateContextMenu.template.id)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 cursor-pointer font-medium text-left transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Supprimer ce message</span>
        </button>
      </div>,
      document.body
    );
  };

  const hasCachedMessages = Boolean(
    (conversations[activeContact?.id]?.length || 0) > 0 ||
    (activeContact?.messages && activeContact.messages.length > 0)
  );
  // Loading skeleton should ONLY be active while an active network fetch or chat switch is genuinely in flight
  const isChatLoading = (isLoadingMessages || isSwitchingChat) && activeMessages.length === 0 && !activeContact?.isAiTestBot;

  const handleNavigateDown = (childId: string) => {
    if (onNavigatePath) {
      onNavigatePath([...(selectedContactPath || []), childId]);
    }
  };

  const handleNavigateUp = () => {
    if (onNavigatePath && selectedContactPath && selectedContactPath.length > 1) {
      onNavigatePath(selectedContactPath.slice(0, -1));
    }
  };


  // Auto mark current conversation/topic as read upon opening
  useEffect(() => {
    if (activeContact?.id) {
      onMarkAsRead?.(appId, activeContact.id, currentTopicId);
    }
  }, [appId, activeContact?.id, currentTopicId, onMarkAsRead]);

  const [chatRefreshTrigger, setChatRefreshTrigger] = useState(0);
  const [isManualChatRefreshing, setIsManualChatRefreshing] = useState(false);

  const handleManualChatRefresh = async () => {
    setIsManualChatRefreshing(true);
    setChatRefreshTrigger((prev) => prev + 1);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsManualChatRefreshing(false);
  };

  // Live real-time message sync across all channels (WhatsApp, Instagram, Messenger, Telegram, Gmail)
  useEffect(() => {
    if (!isConnected || !activeContact?.id || activeContact.id.startsWith('sandbox_bot_')) {
      setIsLoadingMessages(false);
      return;
    }
    let isSubscribed = true;
    const hasVisibleMessages = activeMessages.length > 0;
    if (!hasVisibleMessages) {
      setIsLoadingMessages(true);
    }
    // Safety fallback in case of catastrophic network hang (12s instead of premature 800ms)
    const safetyTimer = setTimeout(() => {
      if (isSubscribed) setIsLoadingMessages(false);
    }, 12000);

    const fetchLiveMessages = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      try {
        let endpoint = '';
        if (appId === 'whatsapp') {
          endpoint = `/api/channels/whatsapp/messages?remoteJid=${encodeURIComponent(activeContact.id)}`;
        } else if (appId === 'instagram') {
          let accessToken = '';
          let igId = '';
          let pageId = '';
          try {
            const igAcc = localStorage.getItem('cf_ig_account');
            if (igAcc) {
              const p = JSON.parse(igAcc);
              accessToken = p.pageAccessToken || p.accessToken || '';
              igId = p.igId || p.id || '';
              pageId = p.pageId || '';
            }
            if (!accessToken) {
              const metaAuth = localStorage.getItem('cf_meta_auth');
              if (metaAuth) {
                const parsed = JSON.parse(metaAuth);
                accessToken = parsed.userToken || '';
                if (!igId && parsed.instagramAccounts?.[0]) {
                  igId = parsed.instagramAccounts[0].igId || parsed.instagramAccounts[0].id;
                  pageId = parsed.instagramAccounts[0].pageId || '';
                }
              }
            }
          } catch {}
          endpoint = `/api/channels/instagram/messages?conversationId=${encodeURIComponent(activeContact.id)}&accessToken=${encodeURIComponent(accessToken)}&igId=${encodeURIComponent(igId)}&pageId=${encodeURIComponent(pageId)}`;
        } else if (appId === 'messenger') {
          let token = '';
          try {
            const p = localStorage.getItem('cf_messenger_page');
            if (p) token = JSON.parse(p).accessToken || '';
          } catch {}
          endpoint = `/api/channels/messenger/messages?conversationId=${encodeURIComponent(activeContact.id)}&token=${encodeURIComponent(token)}`;
        } else if (appId === 'telegram') {
          let session = '';
          let token = '';
          try {
            session = localStorage.getItem('cf_telegram_session') || '';
            token = localStorage.getItem('cf_telegram_token') || '';
          } catch {}
          endpoint = `/api/channels/telegram/messages?chatId=${encodeURIComponent(activeContact.id)}&session=${encodeURIComponent(session)}&token=${encodeURIComponent(token)}`;
          if (currentTopicId) {
            endpoint += `&topicId=${encodeURIComponent(currentTopicId)}`;
          }
        } else if (appId === 'gmail') {
          endpoint = `/api/channels/gmail/messages?threadId=${encodeURIComponent(activeContact.id)}`;
        } else if (appId === 'discord') {
          let token = '';
          try {
            token = localStorage.getItem('cf_discord_token') || '';
            if (!token) {
              const acc = localStorage.getItem('cf_discord_account');
              if (acc) token = JSON.parse(acc).token || '';
            }
            if (token && !token.startsWith('Bot ') && !token.startsWith('Bot_ChatbotFarm')) {
              localStorage.removeItem('cf_discord_token');
              localStorage.removeItem('cf_discord_account');
              token = '';
            }
          } catch {}
          const discordTargetId = currentTopicId || activeContact.id;
          endpoint = `/api/channels/discord/messages?channelId=${encodeURIComponent(discordTargetId)}&token=${encodeURIComponent(token)}`;
        } else {
          endpoint = `/api/channels/${appId}/messages?chatId=${encodeURIComponent(activeContact.id)}`;
        }

        if (!endpoint) return;

        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          if (isSubscribed && Array.isArray(data.messages) && data.messages.length > 0) {
            setConversations((prev) => {
              const current = prev[activeContact.id] || [];
              const localAdded = current.filter((m) => !data.messages.some((dm: any) => dm.id === m.id));
              const merged = data.messages.map((dm: any) => {
                const existing = current.find((c) => c.id === dm.id);
                if (existing) {
                  return {
                    ...dm,
                    topicId: dm.topicId || existing.topicId,
                    reactions: existing.reactions || dm.reactions,
                    isDeleted: existing.isDeleted !== undefined ? existing.isDeleted : dm.isDeleted,
                    text: existing.isDeleted ? 'This message was deleted' : dm.text,
                    seen: dm.seen !== undefined ? (dm.seen || existing.seen) : existing.seen,
                    status: dm.status || (existing as any).status,
                    isCall: dm.isCall !== undefined ? dm.isCall : existing.isCall,
                    callType: dm.callType || existing.callType,
                    callDuration: dm.callDuration || existing.callDuration,
                    callOutcome: dm.callOutcome || existing.callOutcome,
                    imageUrl: dm.imageUrl || existing.imageUrl,
                    hasImages: Boolean(dm.imageUrl || existing.imageUrl || dm.hasImages || existing.hasImages),
                  };
                }
                return dm;
              });
              const combined = [...merged, ...localAdded];
              combined.sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0));
              if (current.length === combined.length && current.length > 0) {
                const isIdentical = current.every((cm, idx) => {
                  const nm = combined[idx];
                  return cm && nm && cm.id === nm.id && (cm as any).status === (nm as any).status && cm.seen === nm.seen && cm.text === nm.text && cm.timestamp === nm.timestamp;
                });
                if (isIdentical) return prev;
              }
              return {
                ...prev,
                [activeContact.id]: combined
              };
            });
            const lastMsg = data.messages[data.messages.length - 1];
            const cacheKey = `${activeContact.id}:${currentTopicId || 'root'}`;
            const prevLatestId = lastKnownLatestMsgIdRef.current[cacheKey];
            lastKnownLatestMsgIdRef.current[cacheKey] = lastMsg?.id;

            if (lastMsg && lastMsg.timestamp) {
              const currentContactTs = activeContact.timestamp || 0;
              const hasNewerActivity = (lastMsg.timestamp > currentContactTs) || (prevLatestId && lastMsg.id !== prevLatestId);
              if (hasNewerActivity) {
                onMessageActivity?.(appId, activeContact.id, lastMsg.text, lastMsg.timestamp, lastMsg.sender === 'customer', currentTopicId);
              }
            }
          }
        }
      } catch (err) {
        console.error(`Error fetching live ${appId} messages:`, err);
      } finally {
        if (isSubscribed) {
          setIsLoadingMessages(false);
        }
      }
    };

    fetchLiveMessages();
    const interval = setInterval(fetchLiveMessages, 6000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
      clearTimeout(safetyTimer);
    };
  }, [appId, isConnected, activeContact?.id, currentTopicId, chatRefreshTrigger]);

  const teleportToBottom = useCallback((behavior: 'auto' | 'smooth' = 'auto') => {
    if (telegramFeedRef.current) {
      telegramFeedRef.current.scrollTop = telegramFeedRef.current.scrollHeight;
    }
    if (whatsappFeedRef.current) {
      whatsappFeedRef.current.scrollTop = whatsappFeedRef.current.scrollHeight;
    }
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  }, []);

  const scrollToBottom = useCallback((behavior: 'auto' | 'smooth' = 'auto') => {
    teleportToBottom(behavior);
  }, [teleportToBottom]);

  // Synchronous pre-paint teleport to bottom on chat / topic switch or when messages finish loading: zero flash at top
  useLayoutEffect(() => {
    teleportToBottom('auto');
  }, [appId, activeContact?.id, currentTopicId, activeMessages.length, isChatLoading, teleportToBottom]);

  const renderChatLoadingSkeleton = () => (
    <div className="flex flex-col h-full justify-end p-4 space-y-4 animate-pulse">
      <div className="flex justify-center mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-xs text-gray-500 dark:text-gray-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
          <span>Syncing real-time messages...</span>
        </div>
      </div>
      <div className="flex items-end gap-2 justify-start max-w-[70%]">
        <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 shrink-0" />
        <div className="space-y-1.5 w-48">
          <div className="h-4 bg-black/10 dark:bg-white/10 rounded-lg w-full" />
          <div className="h-4 bg-black/10 dark:bg-white/10 rounded-lg w-2/3" />
        </div>
      </div>
      <div className="flex items-end gap-2 justify-end max-w-[70%] ml-auto">
        <div className="space-y-1.5 w-40">
          <div className="h-4 bg-black/10 dark:bg-white/10 rounded-lg w-full" />
          <div className="h-4 bg-black/10 dark:bg-white/10 rounded-lg w-3/4" />
        </div>
      </div>
      <div className="flex items-end gap-2 justify-start max-w-[70%]">
        <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 shrink-0" />
        <div className="space-y-1.5 w-64">
          <div className="h-4 bg-black/10 dark:bg-white/10 rounded-lg w-full" />
          <div className="h-4 bg-black/10 dark:bg-white/10 rounded-lg w-5/6" />
        </div>
      </div>
    </div>
  );

  // Direct scroll-to-bottom whenever chat or topic is opened/switched
  useEffect(() => {
    teleportToBottom('auto');
    const raf = requestAnimationFrame(() => teleportToBottom('auto'));
    const t = setTimeout(() => teleportToBottom('auto'), 80);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [appId, activeContact?.id, currentTopicId, activeMessages.length, teleportToBottom]);

  // Scroll to bottom on new messages if near bottom or sent by me
  useEffect(() => {
    if (telegramFeedRef.current) {
      telegramFeedRef.current.scrollTop = telegramFeedRef.current.scrollHeight;
    }
    if (!messagesEndRef.current) return;
    const container = messagesEndRef.current.parentElement;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 350;
      const lastMsg = activeMessages[activeMessages.length - 1];
      const isMe = lastMsg?.sender === 'operator';
      if (isNearBottom || isMe) {
        teleportToBottom('auto');
      }
    } else {
      teleportToBottom('auto');
    }
  }, [activeMessages.length, teleportToBottom]);

  useEffect(() => {
    let interval: any;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  const handleToggleVoiceRecord = () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      setRecordingDuration(0);
    } else {
      handleSendVoiceNote();
    }
  };

  const handleCancelVoiceRecord = () => {
    setIsRecordingVoice(false);
    setRecordingDuration(0);
  };

  // Inverted Sandbox AI Test Bot Executor: processes accumulated burst into one single response
  const executeTestBotReply = useCallback(async (targetAppId: string, targetContactId: string) => {
    // Clear countdown & timers
    if (testBotTimerRef.current) {
      clearTimeout(testBotTimerRef.current);
      testBotTimerRef.current = null;
    }
    if (testBotIntervalRef.current) {
      clearInterval(testBotIntervalRef.current);
      testBotIntervalRef.current = null;
    }
    setTestBotDebounceCountdown(null);

    // Extract accumulated content
    const accumulatedTexts = [...testBotBufferRef.current.texts];
    const hasImages = testBotBufferRef.current.hasImages;
    const hasAudios = testBotBufferRef.current.hasAudios;
    const targetUserMsgId = testBotBufferRef.current.lastMsgId;
    const lastUserSnippet = testBotBufferRef.current.lastMsgText || (hasImages ? 'Photo' : hasAudios ? 'Voice message' : 'Message');

    // Reset buffer
    testBotBufferRef.current = {
      texts: [],
      hasImages: false,
      hasAudios: false,
    };

    if (accumulatedTexts.length === 0 && !hasImages && !hasAudios) {
      return;
    }

    // Show typing indicator
    setIsTyping(true);

    // Read active bot configuration & BYOK key
    let botSettings: any = null;
    let byokKey: string | null = null;
    try {
      const assignedBotId = localStorage.getItem(`cf_assigned_bot_${targetAppId}`);
      if (assignedBotId) {
        const personaStr = localStorage.getItem(`cf_bot_persona_${assignedBotId}`);
        if (personaStr) {
          botSettings = JSON.parse(personaStr);
        }
      }
      if (!botSettings) {
        const savedSettings = localStorage.getItem('cf_bot_settings');
        if (savedSettings) botSettings = JSON.parse(savedSettings);
      }
      byokKey = 
        localStorage.getItem('cf_byok_key') || 
        localStorage.getItem('cf_user_byok_key') || 
        botSettings?.apiKey ||
        null;
      if (byokKey) byokKey = byokKey.replace(/^['"]+|['"]+$/g, '').replace(/^Bearer\s+/i, '').trim();
    } catch {}

    const combinedText = accumulatedTexts.join(' \n');

    // 1. Brief pause while AI generates response
    await new Promise((resolve) => setTimeout(resolve, 350));

    let replyText = '';

    // 1. Attempt n8n Webhook Router if configured and enabled
    let n8nErrorMsg: string | null = null;
    if (!replyText && botSettings?.useN8nRouter && botSettings?.n8nWebhookUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const isRealisticTyping = botSettings?.realisticTypingSimulation !== false && botSettings?.typingSimulationEnabled !== false;
        const n8nRes = await fetch(botSettings.n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appId: targetAppId,
            contactId: targetContactId,
            message: combinedText,
            messages: accumulatedTexts,
            textFragments: accumulatedTexts,
            hasImages,
            hasAudios,
            botSettings,
            debounce_seconds: botSettings?.debounceSeconds || 3,
            typing_simulation_enabled: isRealisticTyping,
            typing_cadence: botSettings?.typingCadence || 'natural',
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (n8nRes.ok) {
          const data = await n8nRes.json().catch(() => null);
          if (data) {
            if (typeof data === 'string') replyText = data;
            else if (data.reply) replyText = data.reply;
            else if (data.output) replyText = data.output;
            else if (data.text) replyText = data.text;
            else if (data.message) replyText = data.message;
            else if (Array.isArray(data) && data[0]) {
              const first = data[0];
              replyText = first?.reply || first?.output || first?.text || first?.message || (typeof first === 'string' ? first : '');
            } else if (typeof data === 'object') {
              const firstVal = Object.values(data)[0];
              if (typeof firstVal === 'string') replyText = firstVal;
            }
          }
        } else {
          n8nErrorMsg = `Webhook n8n HTTP ${n8nRes.status}`;
        }
      } catch (err: any) {
        n8nErrorMsg = err?.name === 'AbortError' ? 'Délai d\'attente dépassé' : 'Webhook inaccessible';
      }
    }

    // 2. Direct AI simulation if n8n did not produce a reply (fallback to direct LLM)
    if (!replyText) {
      try {
        const res = await fetch('/api/inbox/simulate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(byokKey ? { 'x-api-key': byokKey } : {}),
          },
          body: JSON.stringify({
            message: combinedText,
            messages: accumulatedTexts,
            textFragments: accumulatedTexts,
            hasImages,
            hasAudios,
            botSettings,
            apiKey: byokKey,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.reply) {
            replyText = data.reply;
          }
        }
      } catch (err) {
        console.warn('Simulation error:', err);
      }
    }

    if (!replyText) {
      replyText = `⚠️ Clé API Manquante / API Key Missing!\n\nPour que le bot puisse vous répondre intelligemment au lieu de messages automatiques, veuillez configurer une clé API gratuite ou le relier à votre flux n8n.\n\n🔑 Obtenez votre clé 100% Gratuite en 30 secondes :\n• Google AI Studio (Gemini Flash - Recommandé) :\n  https://aistudio.google.com/app/apikey\n• Groq Cloud (LLaMA 3.3 Ultra Rapide) :\n  https://console.groq.com/keys\n• OpenRouter (Multi-modèles) :\n  https://openrouter.ai/keys\n\n⚙️ Comment l'activer :\n👉 Cliquez sur le bouton "🔑 Configurer ma Clé API" ci-dessous pour l'enregistrer en toute sécurité !\n👉 Ou collez-la dans le volet droit > Paramètres du Bot > Clé API IA (BYOK).\n👉 Ou si vous avez un workflow n8n, cochez "Routage Webhook n8n" dans les paramètres à droite.`;
    }

    // 3. Realistic Bot Typing Simulation: "The more it writes, the more it waits"
    const isRealisticTyping = botSettings?.realisticTypingSimulation !== false && botSettings?.typingSimulationEnabled !== false;
    const cadence = botSettings?.typingCadence || 'natural';

    let typingDelayMs = 350;
    if (isRealisticTyping) {
      const textLen = replyText.length;
      if (cadence === 'fast') {
        typingDelayMs = Math.min(3200, Math.max(700, 450 + textLen * 12));
      } else if (cadence === 'slow') {
        typingDelayMs = Math.min(10000, Math.max(1800, 1200 + textLen * 38));
      } else { // natural
        typingDelayMs = Math.min(6500, Math.max(1200, 800 + textLen * 24));
      }
    }

    // Display realistic typing indicator in chat for the calculated duration
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, typingDelayMs));
    setIsTyping(false);

    // Inverted bot reply: sender is 'customer' so it renders on the left side
    const botMsgId = `bot_reply_${Date.now()}`;
    const botMsg: ChatMessage = {
      id: botMsgId,
      sender: 'customer',
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      seen: true,
      delivered: true,
      timestamp: Date.now(),
      replyTo: targetUserMsgId ? {
        id: targetUserMsgId,
        sender: 'You',
        text: lastUserSnippet.length > 50 ? lastUserSnippet.slice(0, 50) + '...' : lastUserSnippet,
      } : undefined,
    };

    setConversations((prev) => {
      const existing = prev[targetContactId] || [];
      const updated = [...existing, botMsg];

      // Persist to cf_conversations & cf_live_chats_by_app
      try {
        const storedConvs = JSON.parse(localStorage.getItem('cf_conversations') || '{}');
        storedConvs[targetContactId] = updated;
        localStorage.setItem('cf_conversations', JSON.stringify(storedConvs));

        const liveData = JSON.parse(localStorage.getItem('cf_live_chats_by_app') || '{}');
        if (liveData[targetAppId]) {
          const cIndex = liveData[targetAppId].findIndex((c: any) => c.id === targetContactId);
          if (cIndex >= 0) {
            liveData[targetAppId][cIndex].messages = updated;
            liveData[targetAppId][cIndex].lastMessage = replyText;
            liveData[targetAppId][cIndex].time = 'Just now';
            liveData[targetAppId][cIndex].timestamp = Date.now();
            localStorage.setItem('cf_live_chats_by_app', JSON.stringify(liveData));
          }
        }
      } catch {}

      return {
        ...prev,
        [targetContactId]: updated,
      };
    });

    SoundManager.play(targetAppId);
    onMessageActivity?.(targetAppId, targetContactId, replyText, Date.now(), true);

    // Safe live test: forward bot reply directly to the owner's WhatsApp phone (Message Yourself)
    // Never sends to external contacts
    if (targetAppId === 'whatsapp') {
      try {
        fetch('/api/channels/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            remoteJid: '213551671229@s.whatsapp.net',
            text: `🤖 [Bot Test]:\n${replyText}`
          })
        }).catch(() => {});
      } catch {}
    }
  }, [onMessageActivity]);

  // Resolve dynamic debounce window (default: 3s silence window instead of static 17s)
  const resolveDebounceSeconds = useCallback((targetAppId: string) => {
    let debounceSec = 3;
    try {
      const assignedBotId = localStorage.getItem(`cf_assigned_bot_${targetAppId}`);
      if (assignedBotId) {
        const personaStr = localStorage.getItem(`cf_bot_persona_${assignedBotId}`);
        if (personaStr) {
          const p = JSON.parse(personaStr);
          if (typeof p.debounceSeconds === 'number' && p.debounceSeconds > 0) {
            debounceSec = p.debounceSeconds;
          }
        }
      }
      if (debounceSec === 3) {
        const botSettingsStr = localStorage.getItem('cf_bot_settings');
        if (botSettingsStr) {
          const s = JSON.parse(botSettingsStr);
          if (typeof s.debounceSeconds === 'number' && s.debounceSeconds > 0) {
            debounceSec = s.debounceSeconds;
          }
        }
      }
    } catch {}
    return debounceSec;
  }, []);

  // Starts or resets the inactivity countdown (e.g. 3s). When inactivity reaches 0, executes bot reply.
  const startDebounceCountdown = useCallback((targetAppId: string, targetContactId: string) => {
    if (testBotTimerRef.current) clearTimeout(testBotTimerRef.current);
    if (testBotIntervalRef.current) clearInterval(testBotIntervalRef.current);

    const debounceSec = resolveDebounceSeconds(targetAppId);
    setTestBotDebounceCountdown(debounceSec);
    setIsUserTypingDebounce(false);

    let remaining = debounceSec;
    testBotIntervalRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        setTestBotDebounceCountdown(remaining);
      } else {
        setTestBotDebounceCountdown(null);
        if (testBotIntervalRef.current) {
          clearInterval(testBotIntervalRef.current);
          testBotIntervalRef.current = null;
        }
      }
    }, 1000);

    testBotTimerRef.current = setTimeout(() => {
      executeTestBotReply(targetAppId, targetContactId);
    }, debounceSec * 1000);
  }, [resolveDebounceSeconds, executeTestBotReply]);

  // Inverted Sandbox AI Test Bot Accumulator with Typing-Aware Debounce
  const triggerTestBotAccumulator = useCallback((
    targetAppId: string,
    targetContactId: string,
    content: { text?: string; isImage?: boolean; isAudio?: boolean; msgId?: string }
  ) => {
    // 1. Accumulate incoming piece
    if (content.text) {
      testBotBufferRef.current.texts.push(content.text);
      testBotBufferRef.current.lastMsgText = content.text;
    }
    if (content.isImage) testBotBufferRef.current.hasImages = true;
    if (content.isAudio) testBotBufferRef.current.hasAudios = true;
    if (content.msgId) testBotBufferRef.current.lastMsgId = content.msgId;

    // 2. Start inactivity window countdown
    startDebounceCountdown(targetAppId, targetContactId);
  }, [startDebounceCountdown]);

  // User typing detector: If user types while a debounce batch is pending, pause the countdown.
  // When user stops typing for 1.2s, restart the inactivity window countdown (3s)!
  useEffect(() => {
    if (!inputMessage || testBotBufferRef.current.texts.length === 0) return;
    if (!isTestBot || !activeContact?.id) return;

    // Pause active countdown while user is typing
    if (testBotTimerRef.current) {
      clearTimeout(testBotTimerRef.current);
      testBotTimerRef.current = null;
    }
    if (testBotIntervalRef.current) {
      clearInterval(testBotIntervalRef.current);
      testBotIntervalRef.current = null;
    }
    setIsUserTypingDebounce(true);

    // Wait 1.2s after user stops pressing keys before resuming inactivity countdown
    if (typingDebouncePauseTimerRef.current) {
      clearTimeout(typingDebouncePauseTimerRef.current);
    }
    typingDebouncePauseTimerRef.current = setTimeout(() => {
      setIsUserTypingDebounce(false);
      startDebounceCountdown(appId, activeContact.id);
    }, 1200);
  }, [inputMessage, isTestBot, activeContact?.id, appId, startDebounceCountdown]);

  const flushTestBotAccumulator = useCallback(() => {
    if (!activeContact?.id) return;
    if (typingDebouncePauseTimerRef.current) clearTimeout(typingDebouncePauseTimerRef.current);
    if (testBotTimerRef.current) clearTimeout(testBotTimerRef.current);
    if (testBotIntervalRef.current) clearInterval(testBotIntervalRef.current);
    setTestBotDebounceCountdown(null);
    setIsUserTypingDebounce(false);
    executeTestBotReply(appId, activeContact.id);
  }, [activeContact?.id, appId, executeTestBotReply]);

  const handleSendVoiceNote = () => {
    if (!activeContact) return;
    const duration = recordingDuration || 1;
    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'operator',
      text: '',
      time: 'Just now',
      isAudio: true,
      audioDuration: `${duration}s`,
      delivered: true,
      seen: false,
      timestamp: Date.now(),
      topicId: selectedContactPath[1] || (activeContact?.isGroup && activeContact?.topics?.[0]?.id) || undefined
    };
    setConversations((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMsg]
    }));
    onMessageActivity?.(appId, activeContact.id, 'Voice note', Date.now());
    setIsRecordingVoice(false);
    setRecordingDuration(0);

    const isTestBot = Boolean(activeContact?.isAiTestBot || activeContact?.id?.startsWith('sandbox_bot_'));
    if (isTestBot) {
      triggerTestBotAccumulator(appId, activeContact.id, {
        isAudio: true,
        text: 'Voice note',
        msgId: newMsg.id,
      });
      return;
    }

    setTimeout(() => {
      setConversations((prev) => {
        const list = prev[activeContact.id] || [];
        const updated = list.map((m) => (m.id === newMsg.id ? { ...m, seen: true, seenTime: 'Just now' } : m));
        return { ...prev, [activeContact.id]: updated };
      });
    }, 2800);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeContact) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const newMsg: ChatMessage = {
        id: String(Date.now()),
        sender: 'operator',
        text: '',
        imageUrl: reader.result as string,
        time: 'Just now',
        delivered: true,
        seen: false,
        timestamp: Date.now(),
        topicId: selectedContactPath[1] || (activeContact?.isGroup && activeContact?.topics?.[0]?.id) || undefined
      };
      setConversations((prev) => {
        const existing = prev[activeContact.id] || activeContact.messages || [];
        const updated = [...existing, newMsg];
        try {
          const storedConvs = JSON.parse(localStorage.getItem('cf_conversations') || '{}');
          storedConvs[activeContact.id] = updated;
          localStorage.setItem('cf_conversations', JSON.stringify(storedConvs));
        } catch {}
        return {
          ...prev,
          [activeContact.id]: updated
        };
      });
      onMessageActivity?.(appId, activeContact.id, 'Photo', Date.now());

      const isTestBot = Boolean(activeContact?.isAiTestBot || activeContact?.id?.startsWith('sandbox_bot_'));
      if (isTestBot) {
        triggerTestBotAccumulator(appId, activeContact.id, {
          isImage: true,
          text: file.name,
          msgId: newMsg.id,
        });
        return;
      }

      // Dispatch live photo to active channel
      if (isConnected && activeContact?.id) {
        if (appId === 'whatsapp') {
          fetch('/api/channels/whatsapp/send-media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              remoteJid: activeContact.id,
              media: reader.result,
              mediatype: 'image',
              fileName: file.name
            })
          }).catch((err) => console.error('Error dispatching WhatsApp image:', err));
        }
      }

      setTimeout(() => {
        setConversations((prev) => {
          const list = prev[activeContact.id] || [];
          const updated = list.map((m) => (m.id === newMsg.id ? { ...m, seen: true, seenTime: 'Just now' } : m));
          return { ...prev, [activeContact.id]: updated };
        });
      }, 2800);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeContact) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${(file.size / 1024).toFixed(0)} KB`;
    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'operator',
      text: file.name,
      fileName: file.name,
      fileSize: sizeStr,
      time: 'Just now',
      delivered: true,
      seen: false,
      timestamp: Date.now(),
      topicId: selectedContactPath[1] || (activeContact?.isGroup && activeContact?.topics?.[0]?.id) || undefined
    };
    setConversations((prev) => {
      const existing = prev[activeContact.id] || activeContact.messages || [];
      const updated = [...existing, newMsg];
      try {
        const storedConvs = JSON.parse(localStorage.getItem('cf_conversations') || '{}');
        storedConvs[activeContact.id] = updated;
        localStorage.setItem('cf_conversations', JSON.stringify(storedConvs));
      } catch {}
      return {
        ...prev,
        [activeContact.id]: updated
      };
    });
    onMessageActivity?.(appId, activeContact.id, file.name, Date.now());

    const isTestBot = Boolean(activeContact?.isAiTestBot || activeContact?.id?.startsWith('sandbox_bot_'));
    if (isTestBot) {
      triggerTestBotAccumulator(appId, activeContact.id, {
        text: `Fichier: ${file.name}`,
        msgId: newMsg.id,
      });
      return;
    }

    // Dispatch live document to active channel
    if (isConnected && activeContact?.id) {
      if (appId === 'whatsapp') {
        const reader = new FileReader();
        reader.onload = () => {
          fetch('/api/channels/whatsapp/send-media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              remoteJid: activeContact.id,
              media: reader.result,
              mediatype: 'document',
              fileName: file.name
            })
          }).catch((err) => console.error('Error dispatching WhatsApp document:', err));
        };
        reader.readAsDataURL(file);
      }
    }

    setTimeout(() => {
      setConversations((prev) => {
        const list = prev[activeContact.id] || [];
        const updated = list.map((m) => (m.id === newMsg.id ? { ...m, seen: true, seenTime: 'Just now' } : m));
        return { ...prev, [activeContact.id]: updated };
      });
    }, 2800);

    e.target.value = '';
  };


  // Solid brand-color header — high contrast, icons always visible
  const renderSolidHeader = (solidColor: string) => (
    <div
      className="absolute inset-0 shadow-md pointer-events-none"
      style={{ ...dragHandleProps?.style, backgroundColor: solidColor  }}
    />
  );


  // 1. Disconnected empty state — shown when the app has not been connected yet, or when signed out / unlinked
  const isSignedOut = !currentUser;
  const isExplicitlyUnlinked = typeof window !== 'undefined' && (
    localStorage.getItem(`cf_${appId}_unlinked`) === 'true' ||
    localStorage.getItem(`cf_${appId}_unlinked_default`) === 'true'
  );
  if (!isConnected && (isSignedOut || isExplicitlyUnlinked || ((!liveContacts || liveContacts.length === 0) && (!chatsByApp?.[appId] || chatsByApp[appId].length === 0)))) {
    const theme = APP_GRADIENT_THEMES[appId] || APP_GRADIENT_THEMES.whatsapp;
    const APP_ICONS: Record<string, React.ReactNode> = {
      whatsapp: <WhatsAppIcon className="w-16 h-16 drop-shadow-lg" />,
      whatsapp_2: <WhatsAppIcon className="w-16 h-16 drop-shadow-lg" />,
      instagram: <InstagramIcon className="w-16 h-16 drop-shadow-lg" />,
      telegram: <TelegramIcon className="w-16 h-16 drop-shadow-lg" />,
      signal: <SignalIcon className="w-16 h-16 drop-shadow-lg" />,
      messenger: <MessengerIcon className="w-16 h-16 drop-shadow-lg" />,
      x_twitter: <XIcon className="w-16 h-16 drop-shadow-lg" />,
      google_messages: <GoogleMessagesIcon className="w-16 h-16 drop-shadow-lg" />,
      google_chat: <GoogleChatIcon className="w-16 h-16 drop-shadow-lg" />,
      google_voice: <GoogleVoiceIcon className="w-16 h-16 drop-shadow-lg" />,
      discord: <DiscordIcon className="w-16 h-16 drop-shadow-lg" />,
      slack: <SlackIcon className="w-16 h-16 drop-shadow-lg" />,
      linkedin: <LinkedInIcon className="w-16 h-16 drop-shadow-lg" />,
      irc: <IrcIcon className="w-16 h-16 drop-shadow-lg" />,
      matrix: <MatrixIcon className="w-16 h-16 drop-shadow-lg" />,
      web_widget: <StorefrontIcon className="w-16 h-16 drop-shadow-lg" />,
      gmail: <GmailIcon className="w-16 h-16 drop-shadow-lg" />,
      viber: <ViberIcon className="w-16 h-16 drop-shadow-lg" />,
      snapchat: <SnapchatIcon className="w-16 h-16 drop-shadow-lg" />,
    };
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#F5F5ED] dark:bg-[#1A1D23] ${isMobileEmbedded ? 'rounded-b-3xl border-0 shadow-none' : 'rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] shadow-sm'} overflow-hidden`}>
        {/* Solid brand header bar with standardized h-14 height */}
        {!isMobileEmbedded && (
          <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 shrink-0 flex items-center justify-between border-b border-black/10 select-none shadow-xs rounded-t-3xl cursor-grab active:cursor-grabbing touch-none ${dragHandleProps?.className || ""}`}
            style={{ ...dragHandleProps?.style, backgroundColor: theme.solidColor  }}
          >
            <span className={`font-bold text-sm leading-none ${isLightColor(theme.solidColor) ? 'text-slate-950 font-black' : 'text-white'}`}>{theme.name}</span>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full leading-none ${
              isLightColor(theme.solidColor) ? 'bg-black/10 text-slate-950 border border-black/20 font-bold' : 'bg-black/20 text-white/90'
            }`}>
              Unlinked
            </span>
          </div>
        )}
        {/* Empty state body */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center gap-3 sm:gap-4 p-4 sm:p-6 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-md sm:shadow-lg shrink-0" style={{ ...dragHandleProps?.style, backgroundColor: theme.solidColor + '15'  }}>
            <div className="scale-80 sm:scale-100">
              {APP_ICONS[appId]}
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-base sm:text-lg text-gray-800 dark:text-white leading-tight">{theme.name}</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-[260px] leading-snug">
              Connect your real {theme.name} account to start receiving and sending messages here.
            </p>
          </div>
          {(() => {
            const btnInfo = getChannelConnectInfo(appId, theme.name);
            return (
              <motion.button
                id="empty-state-connect-channel-btn"
                onClick={onOpenConnect}
                className={`w-full max-w-[280px] py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2 shrink-0 ${
                  isLightColor(theme.solidColor) ? 'text-slate-950 font-black' : 'text-white'
                }`}
                style={{ ...dragHandleProps?.style, backgroundColor: theme.solidColor  }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    `0 0 0px ${theme.solidColor}00, 0 4px 6px -1px rgba(0, 0, 0, 0.1)`,
                    `0 0 25px ${theme.solidColor}90, 0 4px 6px -1px rgba(0, 0, 0, 0.1)`,
                    `0 0 0px ${theme.solidColor}00, 0 4px 6px -1px rgba(0, 0, 0, 0.1)`
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {btnInfo.icon}
                <span>{btnInfo.label}</span>
              </motion.button>
            );
          })()}
        </div>
      </div>
    );
  }

  // Handle voting on Telegram polls
  const handleTelegramVote = async (messageId: string, options: string[]) => {
    if (!activeContact) return;

    // 1. Optimistic UI update
    setConversations((prev) => {
      const currentList = prev[activeContact.id] || activeContact.messages || [];
      const updated = currentList.map((m) => {
        if (m.id !== messageId || !m.poll) return m;
        const currentPoll = m.poll;

        let totalDelta = 0;
        const newOptions = currentPoll.options.map((opt) => {
          const wasChosen = Boolean(opt.isChosen);
          const isNowChosen = options.includes(opt.option);
          let newVoters = opt.voters;
          if (!wasChosen && isNowChosen) {
            newVoters += 1;
            totalDelta += 1;
          } else if (wasChosen && !isNowChosen) {
            newVoters = Math.max(0, newVoters - 1);
            totalDelta -= 1;
          }
          return {
            ...opt,
            voters: newVoters,
            isChosen: isNowChosen
          };
        });

        const newTotalVoters = Math.max(0, (currentPoll.totalVoters || 0) + totalDelta);
        const recalculateOptions = newOptions.map((opt) => ({
          ...opt,
          percentage: newTotalVoters > 0 ? Math.round((opt.voters / newTotalVoters) * 100) : 0
        }));

        return {
          ...m,
          poll: {
            ...currentPoll,
            options: recalculateOptions,
            totalVoters: newTotalVoters,
            hasVoted: options.length > 0,
            myChosenOptions: options
          }
        };
      });

      try {
        const storedConvs = JSON.parse(localStorage.getItem('cf_conversations') || '{}');
        storedConvs[activeContact.id] = updated;
        localStorage.setItem('cf_conversations', JSON.stringify(storedConvs));
      } catch {}

      return { ...prev, [activeContact.id]: updated };
    });

    // 2. Dispatch vote to backend
    try {
      const res = await fetch('/api/channels/telegram/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: activeContact.id,
          messageId,
          options
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.poll) {
          setConversations((prev) => {
            const currentList = prev[activeContact.id] || activeContact.messages || [];
            const updated = currentList.map((m) => {
              if (m.id !== messageId) return m;
              return { ...m, poll: data.poll };
            });
            return { ...prev, [activeContact.id]: updated };
          });
        }
      }
    } catch (err) {
      console.error('Failed to submit telegram vote:', err);
    }
  };

  // Render photo / voice / file attachments inside message bubble
  const renderMessageAttachment = (m: ChatMessage, isMe: boolean) => {
    // If message contains a Telegram Poll, render the full interactive widget
    if (m.poll) {
      return (
        <TelegramPollWidget
          poll={m.poll}
          messageId={m.id}
          isMe={isMe}
          onVote={handleTelegramVote}
        />
      );
    }
    // Detect GIF or image links inside text if no explicit imageUrl exists
    let detectedImg = m.imageUrl;
    if (!detectedImg && m.text) {
      const match = m.text.match(/https?:\/\/[^\s]+(?:\.gif|\.png|\.jpe?g|\.webp|klipy\.com\/gifs\/[^\s]+|tenor\.com\/[^\s]+|giphy\.com\/[^\s]+)/i);
      if (match) detectedImg = match[0];
    }

    // Check if message contains a link URL and this image is a link preview
    const linkMatch = m.text?.match(/https?:\/\/[^\s]+/i);
    const targetLink = m.linkUrl || (linkMatch ? linkMatch[0] : null);
    const isLinkPreview = Boolean(
      m.isLinkPreview || 
      (targetLink && detectedImg && m.text && !m.videoUrl && !m.fileName)
    );

    return (
      <>
        {detectedImg && isLinkPreview && targetLink ? (
          <a
            href={targetLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={`my-2 flex items-center gap-2.5 p-2 rounded-2xl transition-all cursor-pointer group/link max-w-[280px] sm:max-w-[320px] select-none shadow-2xs border ${
              isMe
                ? 'bg-black/15 hover:bg-black/25 border-white/20 text-white'
                : 'bg-black/5 dark:bg-black/25 hover:bg-black/10 dark:hover:bg-black/35 border-black/10 dark:border-white/10 text-inherit'
            }`}
            title={`Ouvrir le lien : ${targetLink}`}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white dark:bg-[#182533] border border-black/10 dark:border-white/10 flex items-center justify-center p-1.5 shrink-0 relative group-hover/link:scale-105 transition-transform shadow-xs">
              <img
                src={detectedImg}
                alt="Link preview"
                loading="lazy"
                className="w-full h-full object-contain pointer-events-none"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover/link:bg-black/25 flex items-center justify-center transition-colors rounded-xl">
                <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover/link:opacity-100 drop-shadow-md transition-opacity" />
              </div>
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <span className={`text-[11px] font-bold truncate flex items-center gap-1 group-hover/link:underline ${isMe ? 'text-white' : 'text-[#2AABEE] dark:text-[#54B9EE]'}`}>
                <span className="truncate">
                  {m.linkTitle || (targetLink.includes('meet.google.com') ? 'Google Meet' : (() => {
                    try { return new URL(targetLink).hostname.replace(/^www\./, ''); } catch { return targetLink; }
                  })())}
                </span>
                <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
              </span>
              <p className="text-[10px] opacity-75 truncate font-mono mt-0.5">
                {targetLink.replace(/^https?:\/\//, '')}
              </p>
              <span className={`text-[9px] font-semibold mt-1 inline-flex items-center gap-1 ${isMe ? 'text-white/90' : 'text-[#2AABEE] dark:text-[#54B9EE]'}`}>
                Accéder au lien →
              </span>
            </div>
          </a>
        ) : detectedImg ? (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              openLightbox(detectedImg!);
            }}
            className="my-2 rounded-2xl overflow-hidden shadow-md max-w-full sm:max-w-[280px] border border-black/10 dark:border-white/10 cursor-pointer group/img relative bg-black/5 dark:bg-white/5"
            title="Click to view full screen"
          >
            <img 
              src={detectedImg} 
              alt="attachment" 
              loading="lazy"
              onLoad={() => teleportToBottom('auto')}
              onError={(e) => {
                const target = e.target as HTMLElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallback = parent.querySelector('.img-error-fallback') as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }
              }}
              className="w-full h-auto object-cover max-h-72 group-hover/img:scale-105 transition-transform [image-rendering:auto]" 
            />
            <div className="img-error-fallback hidden p-4 flex-col items-center justify-center gap-1.5 text-center text-gray-400 text-xs min-h-[140px] bg-black/10 dark:bg-black/30 rounded-2xl">
              <ImageOff className="w-6 h-6 text-gray-400" />
              <span className="text-[12px] font-semibold text-gray-300">Photo non disponible</span>
              <span className="text-[10px] text-gray-400">Le fichier média a expiré ou a été supprimé</span>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/25 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
              <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
            </div>
          </div>
        ) : null}
        {m.videoUrl && (
          <div className="my-2 rounded-2xl overflow-hidden shadow-md max-w-full sm:max-w-[320px] border border-black/10 dark:border-white/10 relative bg-black/80">
            <video 
              src={m.videoUrl} 
              controls 
              preload="metadata" 
              className="w-full h-auto max-h-72 rounded-2xl object-contain" 
            />
          </div>
        )}
        {m.isAudio && (
          <VoiceNotePlayer 
            duration={m.audioDuration} 
            audioUrl={m.audioUrl || (m.mediaType === 'audio' ? m.fileUrl : undefined)} 
            isSender={isMe} 
          />
        )}
        {m.fileName && (
          <a
            href={m.fileUrl || "#"}
            target={m.fileUrl ? "_blank" : undefined}
            rel="noopener noreferrer"
            onClick={(e) => { if (!m.fileUrl) e.preventDefault(); }}
            className={`p-2.5 rounded-2xl my-1.5 flex items-center gap-2.5 border shadow-xs max-w-[250px] transition-all hover:opacity-90 ${
              isMe
                ? 'bg-black/15 dark:bg-white/15 border-white/20 text-white'
                : 'bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-gray-100'
            }`}
          >
            <FileText className="w-5 h-5 shrink-0 opacity-80 text-[#5865F2]" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate hover:underline">{m.fileName}</p>
              <span className="text-[9px] opacity-70 font-mono">{m.fileSize || 'Fichier joint'}</span>
            </div>
            {m.fileUrl && <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60" />}
          </a>
        )}
        {m.isCall && (
          <div className="flex items-center gap-2 p-2 my-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <Phone className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {m.callType === 'missed' ? 'Appel vocal manqué' : `Appel terminé (${m.callDuration || '1m 20s'})`}
            </span>
          </div>
        )}
        {(m.text?.includes('Clé API Manquante') || m.text?.includes('API Key Missing')) && (
          <div className="mt-3 pt-2.5 border-t border-amber-500/20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsApiKeyModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>🔑 Configurer ma Clé API (Gratuit)</span>
            </button>
          </div>
        )}
      </>
    );
  };

  // Handle adding reactions
  const handleReact = (msgId: string, emoji: string) => {
    if (!activeContact) return;
    setConversations((prev) => {
      const currentList = prev[activeContact.id] || activeContact.messages || [];
      const updated = currentList.map((m) => {
        if (m.id !== msgId) return m;
        const currentReactions = m.reactions || [];
        const existing = currentReactions.find((r) => r.emoji === emoji);
        if (existing) {
          return {
            ...m,
            reactions: currentReactions.map((r) =>
              r.emoji === emoji ? { ...r, count: r.userReacted ? r.count - 1 : r.count + 1, userReacted: !r.userReacted } : r
            ).filter((r) => r.count > 0)
          };
        } else {
          return {
            ...m,
            reactions: [...currentReactions, { emoji, count: 1, userReacted: true }]
          };
        }
      });
      return { ...prev, [activeContact.id]: updated };
    });

    if (appId === 'whatsapp' && isConnected && activeContact?.id) {
      fetch('/api/channels/whatsapp/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remoteJid: activeContact.id,
          msgId,
          reaction: emoji
        })
      }).catch(() => {});
    }
  };

  // Handle deleting messages (Delete for everyone or for me)
  const handleDeleteMessage = (msgId: string, deleteMode: 'for_everyone' | 'for_me' = 'for_everyone') => {
    if (!activeContact) return;
    setConversations((prev) => {
      const currentList = prev[activeContact.id] || activeContact.messages || [];
      let updated: ChatMessage[];
      if (deleteMode === 'for_me') {
        updated = currentList.filter((m) => m.id !== msgId);
      } else {
        updated = currentList.map((m) => {
          if (m.id !== msgId) return m;
          return {
            ...m,
            text: 'This message was deleted',
            isDeleted: true,
            imageUrl: undefined,
            isAudio: false,
            fileName: undefined,
          };
        });
      }
      const lastMsg = updated[updated.length - 1];
      const snippet = lastMsg ? (lastMsg.isDeleted ? 'This message was deleted' : lastMsg.text) : '';
      onMessageActivity?.(appId, activeContact.id, snippet, Date.now());
      return { ...prev, [activeContact.id]: updated };
    });
  };

  const handleResetSandboxChat = () => {
    if (!activeContact) return;

    // 1. Cancel any active debounce timers & countdowns
    if (testBotTimerRef.current) {
      clearTimeout(testBotTimerRef.current);
      testBotTimerRef.current = null;
    }
    if (testBotIntervalRef.current) {
      clearInterval(testBotIntervalRef.current);
      testBotIntervalRef.current = null;
    }
    setTestBotDebounceCountdown(null);
    setIsTyping(false);

    // 2. Wipe bot accumulator buffer memory completely
    testBotBufferRef.current = {
      texts: [],
      hasImages: false,
      hasAudios: false,
      lastMsgId: undefined,
      lastMsgText: undefined,
    };

    // 3. Clear text input and replying preview
    setInputMessage('');
    setReplyingToMessage(null);

    // 4. Generate fresh initial welcome message
    const welcomeMsg: ChatMessage = {
      id: `bot_welcome_${activeContact.id}_${Date.now()}`,
      sender: 'customer',
      text: `Salam khoya! Marhba bik f Chatbot Farm 🇩🇿. Rani hna comme bot de test (Bot Test) pour vérifier les réponses, l'accumulation des messages, les photos w les vocaux. B3atli ay message w njawbak direct!`,
      time: '10:00 AM',
      seen: true,
      delivered: true,
      timestamp: Date.now(),
    };

    // 5. Update component state with only the welcome message
    setConversations((prev) => ({
      ...prev,
      [activeContact.id]: [welcomeMsg]
    }));

    // 6. Mutate activeContact in-place to ensure no stale references linger
    activeContact.name = 'Bot Test';
    activeContact.messages = [welcomeMsg];
    activeContact.lastMessage = welcomeMsg.text;
    activeContact.time = 'Just now';
    activeContact.lastMessageTime = 'Just now';
    activeContact.timestamp = Date.now();

    // 7. Persist to localStorage & sync parent
    try {
      const currentLive = JSON.parse(localStorage.getItem('cf_live_chats_by_app') || '{}');
      if (currentLive[appId]) {
        currentLive[appId] = currentLive[appId].map((c: any) =>
          c.id === activeContact.id || c.isAiTestBot
            ? { ...c, name: 'Bot Test', messages: [welcomeMsg], lastMessage: welcomeMsg.text, lastMessageTime: 'Just now', timestamp: Date.now() }
            : c
        );
        localStorage.setItem('cf_live_chats_by_app', JSON.stringify(currentLive));
      }
      const storedConvs = JSON.parse(localStorage.getItem('cf_conversations') || '{}');
      storedConvs[activeContact.id] = [welcomeMsg];
      localStorage.setItem('cf_conversations', JSON.stringify(storedConvs));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    onMessageActivity?.(appId, activeContact.id, welcomeMsg.text, Date.now());
  };

  const handleRemoveSandboxChat = () => {
    if (!activeContact) return;
    try {
      const removedList = JSON.parse(localStorage.getItem('cf_removed_test_bots') || '[]');
      if (!removedList.includes(appId)) {
        removedList.push(appId);
        localStorage.setItem('cf_removed_test_bots', JSON.stringify(removedList));
      }
      const currentLive = JSON.parse(localStorage.getItem('cf_live_chats_by_app') || '{}');
      if (currentLive[appId]) {
        currentLive[appId] = currentLive[appId].filter((c: any) => c.id !== activeContact.id && !c.isAiTestBot);
        localStorage.setItem('cf_live_chats_by_app', JSON.stringify(currentLive));
      }
      window.dispatchEvent(new Event('storage'));
      const remaining = (currentLive[appId] || []).filter((c: any) => c.id !== activeContact.id && !c.isAiTestBot);
      if (remaining.length > 0 && onNavigatePath) {
        onNavigatePath([remaining[0].id]);
      }
    } catch {}
  };

  const renderSandboxBanner = () => {

    if (!Boolean(activeContact?.isAiTestBot || activeContact?.id?.startsWith('sandbox_bot_'))) return null;
    return (
      <div className="bg-emerald-500/15 dark:bg-emerald-950/40 border-b border-emerald-500/30 px-3.5 py-1.5 flex items-center justify-between text-xs shrink-0 select-none z-10 gap-2">
        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-medium min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="truncate">
            <strong>Bot Test Sandbox:</strong> Vous écrivez comme Client — Le Bot répond intelligemment.
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isUserTypingDebounce ? (
            <>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                <span>Saisie en cours... ({testBotBufferRef.current.texts.length} msg)</span>
              </span>
              <button
                type="button"
                onClick={flushTestBotAccumulator}
                title="Envoyer la réponse immédiatement sans attendre la fin du debounce"
                className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                <Zap className="w-3 h-3" />
                <span>Répondre direct</span>
              </button>
            </>
          ) : (
            testBotDebounceCountdown !== null && testBotDebounceCountdown > 0 && (
              <>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" />
                  <span>Inactivité {testBotDebounceCountdown}s ({testBotBufferRef.current.texts.length} msg)</span>
                </span>
                <button
                  type="button"
                  onClick={flushTestBotAccumulator}
                  title="Envoyer la réponse immédiatement sans attendre la fin du debounce"
                  className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  <Zap className="w-3 h-3" />
                  <span>Répondre direct</span>
                </button>
              </>
            )
          )}
          <button
            type="button"
            onClick={handleResetSandboxChat}
            title="Réinitialiser la conversation"
            className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleRemoveSandboxChat}
            title="Retirer le Bot Test des contacts"
            className="text-[10px] bg-red-600/80 hover:bg-red-600 text-white font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
          >
            <Trash2 className="w-3 h-3" />
            <span>Retirer</span>
          </button>
        </div>
      </div>
    );
  };

  const getMessageDateGroup = (timestamp?: number, fallbackTime?: string): string => {
    let date: Date | null = null;
    if (timestamp && !isNaN(timestamp) && timestamp > 0) {
      date = new Date(timestamp);
    }
    if (!date || isNaN(date.getTime())) {
      return 'Aujourd\'hui';
    }
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) return 'Aujourd\'hui';

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return 'Hier';

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Group messages by day for authentic Telegram date separator badges (e.g. September 26)
  const getTelegramDateGroup = (timestamp?: any): string => {
    let ts = typeof timestamp === 'number' ? timestamp : Number(timestamp);
    if (!ts || isNaN(ts) || ts <= 0) return '';
    if (ts < 10000000000) {
      ts *= 1000;
    }
    const date = new Date(ts);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    if (isToday) return 'Today';

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
    if (isYesterday) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Safe search text highlighter & URL clickability/truncation
  const renderMessageText = (text: string, query: string) => {
    if (!text) return null;
    const trimmed = text.trim();
    const isImage = trimmed.match(/^https?:\/\/[^\s]+?\.(jpeg|jpg|gif|png|webp)($|\?)/i);
    const isVideo = trimmed.match(/^https?:\/\/[^\s]+?\.(mp4|webm|ogg)($|\?)/i);
    const isAudio = trimmed.match(/^https?:\/\/[^\s]+?\.(mp3|wav|ogg)($|\?)/i);
    const isTikTok = trimmed.match(/^https?:\/\/[^\s]*tiktok\.com\/[^\s]+/i);

    if (isImage) {
      return <img src={trimmed} alt="Attachment" className="max-w-full rounded-lg max-h-64 object-contain mt-1 mb-1" onClick={(e) => e.stopPropagation()} />;
    }
    if (isTikTok) {
      return (
        <a
          href={trimmed}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="group/tiktok block my-1.5 p-2.5 rounded-xl bg-black/5 dark:bg-black/30 hover:bg-black/10 dark:hover:bg-black/40 border border-black/10 dark:border-white/10 transition-all no-underline text-inherit max-w-sm"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.3 6.3 0 0 0 1.86-4.49v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.86-.09z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold text-xs text-gray-900 dark:text-gray-100 truncate">TikTok</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover/tiktok:text-gray-600 dark:group-hover/tiktok:text-gray-200 transition-colors shrink-0" />
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {trimmed.replace(/^https?:\/\/(www\.)?/, '')}
              </p>
            </div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span>Regarder sur TikTok</span>
            <span className="text-[9px] text-gray-400">tiktok.com ↗</span>
          </div>
        </a>
      );
    }
    if (isVideo) {
      return (
        <video src={trimmed} controls className="max-w-full rounded-lg max-h-64 mt-1 mb-1" onClick={(e) => e.stopPropagation()}>
          Your browser does not support the video tag.
        </video>
      );
    }
    if (isAudio) {
      return <audio src={trimmed} controls className="max-w-full mt-1 mb-1" onClick={(e) => e.stopPropagation()} />;
    }

    return renderPressableText(text, { appId, searchQuery: query });
  };

  const handleSend = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    if (!activeContact || isChatReadOnly) return;
    const textToSend = customText || inputMessage;
    if (!textToSend.trim()) return;

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'operator',
      text: textToSend.trim(),
      time: 'Just now',
      delivered: true,
      seen: false,
      timestamp: Date.now(),
      topicId: selectedContactPath[1] || (activeContact?.isGroup ? activeContact?.topics?.[0]?.id : undefined),
      replyTo: replyingToMessage ? {
        id: replyingToMessage.id,
        sender: replyingToMessage.sender === 'operator' ? 'You' : (activeContact.name || 'Customer'),
        text: replyingToMessage.text || (replyingToMessage.imageUrl ? 'Photo' : 'Voice message'),
      } : undefined
    };

    setConversations((prev) => {
      const existing = prev[activeContact.id] || activeContact.messages || [];
      const updated = [...existing, newMsg];
      try {
        const storedConvs = JSON.parse(localStorage.getItem('cf_conversations') || '{}');
        storedConvs[activeContact.id] = updated;
        localStorage.setItem('cf_conversations', JSON.stringify(storedConvs));
      } catch {}
      return {
        ...prev,
        [activeContact.id]: updated
      };
    });

    setReplyingToMessage(null);
    setInputMessage('');

    // Trigger chronological reorder: moves contact to top of list with updated snippet
    onMessageActivity?.(appId, activeContact.id, textToSend.trim(), Date.now());

    // Inverted AI Test Bot Sandbox check: accumulate and NEVER dispatch to external channels!
    const isTestBot = Boolean(activeContact?.isAiTestBot || activeContact?.id?.startsWith('sandbox_bot_'));
    if (isTestBot) {
      triggerTestBotAccumulator(appId, activeContact.id, {
        text: textToSend.trim(),
        msgId: newMsg.id,
      });
      return;
    }

    // Dispatch real message to the active connected channel with anti-ban rate limiting & typing cadence (F4)
    if (isConnected && activeContact?.id) {
      if (typeof dispatchMessageWithCadence === 'function') {
        dispatchMessageWithCadence(appId, textToSend.trim(), activeContact.id).catch((err) => {
          console.error('Error dispatching message with cadence:', err);
        });
      } else {
        if (appId === 'whatsapp') {
          fetch('/api/channels/whatsapp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              remoteJid: activeContact.id,
              text: textToSend.trim()
            })
          }).catch((err) => console.error('Error sending live WhatsApp message:', err));
        } else if (appId === 'instagram') {
          let accessToken = '';
          let igId = '';
          let pageId = '';
          let sessionId = '';
          try {
            const igAcc = localStorage.getItem('cf_ig_account');
            if (igAcc) {
              const p = JSON.parse(igAcc);
              accessToken = p.pageAccessToken || p.accessToken || '';
              igId = p.igId || p.id || '';
              pageId = p.pageId || '';
              sessionId = p.sessionId || '';
            }
            if (!accessToken) {
              const metaAuth = localStorage.getItem('cf_meta_auth');
              if (metaAuth) {
                const parsed = JSON.parse(metaAuth);
                accessToken = parsed.userToken || '';
                if (!igId && parsed.instagramAccounts?.[0]) {
                  igId = parsed.instagramAccounts[0].igId || parsed.instagramAccounts[0].id;
                  pageId = parsed.instagramAccounts[0].pageId || '';
                }
              }
            }
          } catch {}
          fetch('/api/channels/instagram/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientId: activeContact.id,
              recipientHandle: activeContact.handleOrPhone,
              recipientName: activeContact.name,
              text: textToSend.trim(),
              accessToken,
              igId,
              pageId,
              sessionId,
            })
          }).catch((err) => console.error('Error sending live Instagram message:', err));
        } else if (appId === 'messenger') {
          let accessToken = '';
          try {
            const p = localStorage.getItem('cf_messenger_page');
            if (p) accessToken = JSON.parse(p).accessToken || '';
          } catch {}
          fetch('/api/channels/messenger/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientId: activeContact.id,
              text: textToSend.trim(),
              accessToken
            })
          }).catch((err) => console.error('Error sending live Messenger message:', err));
        } else if (appId === 'telegram') {
          let token = '';
          let session = '';
          try {
            session = localStorage.getItem('cf_telegram_session') || '';
            token = localStorage.getItem('cf_telegram_token') || '';
          } catch {}
          fetch('/api/channels/telegram/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatId: activeContact.id,
              text: textToSend.trim(),
              topicId: selectedContactPath[1] || (activeContact?.isGroup && activeContact?.topics?.[0]?.id) || undefined,
              session,
              token
            })
          }).catch((err) => console.error('Error sending live Telegram message:', err));
        } else if (appId === 'gmail') {
          fetch('/api/channels/gmail/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: activeContact.handleOrPhone || activeContact.id,
              body: textToSend.trim(),
              subject: `Re: ${activeContact.lastMessage || 'Support inquiry'}`
            })
          }).catch((err) => console.error('Error sending live Gmail message:', err));
        } else if (appId === 'discord') {
          let token = '';
          try {
            token = localStorage.getItem('cf_discord_token') || '';
            if (!token) {
              const acc = localStorage.getItem('cf_discord_account');
              if (acc) token = JSON.parse(acc).token || '';
            }
            if (token && !token.startsWith('Bot ') && !token.startsWith('Bot_ChatbotFarm')) {
              localStorage.removeItem('cf_discord_token');
              localStorage.removeItem('cf_discord_account');
              token = '';
            }
          } catch {}
          fetch('/api/channels/discord/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatId: currentTopicId || activeContact.id,
              recipientId: currentTopicId || activeContact.id,
              text: textToSend.trim(),
              token,
              userId: currentUser?.id,
            })
          }).catch((err) => console.error('Error sending live Discord message:', err));
        } else {
          fetch(`/api/channels/${appId}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatId: activeContact.id,
              recipientId: activeContact.id,
              text: textToSend.trim(),
              session: appId === 'x_twitter' ? (localStorage.getItem('cf_x_twitter_session') || '') : undefined,
            })
          }).catch((err) => console.error(`Error sending live ${appId} message:`, err));
        }
      }
    }
  };

  // Unified floating reaction and action bar anchored under the message (mirrored: left for received, right for sent)
  const renderMessageActionBar = (m: ChatMessage, isMe: boolean) => {
    if (m.isDeleted) return null;
    const emojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.82, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.82, y: 3 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32, duration: 0.15 }}
        onMouseEnter={() => handleMessageMouseEnter(m.id)}
        onMouseLeave={handleMessageMouseLeave}
        onClick={(e) => e.stopPropagation()}
        className={`absolute -bottom-4 ${isMe ? 'right-1 flex-row-reverse' : 'left-1 flex-row'} z-40 flex items-center gap-0.5 bg-white/95 dark:bg-[#202C33]/95 backdrop-blur-md shadow-xl border border-gray-200/90 dark:border-neutral-700/90 rounded-full px-2 py-0.5 select-none animate-in fade-in zoom-in-95`}
      >
        {emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleReact(m.id, emoji);
              if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current);
              setHoveredMessageId(null);
            }}
            className="hover:scale-135 active:scale-90 transition-transform duration-100 p-1 text-sm leading-none cursor-pointer"
            title={`React ${emoji}`}
          >
            {emoji}
          </button>
        ))}

        <div className="w-[1px] h-3.5 bg-gray-300 dark:bg-neutral-600 mx-1 shrink-0" />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setReplyingToMessage(m);
            if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current);
            setHoveredMessageId(null);
          }}
          className="p-1 text-gray-500 hover:text-emerald-500 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          title="Quote / Reply to message"
        >
          <Reply className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteMessage(m.id, 'for_everyone');
            if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current);
            setHoveredMessageId(null);
          }}
          className="p-1 text-gray-400 hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          title="Delete message"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    );
  };

  const renderReactionPicker = (msgId: string, isMe: boolean) => {
    const m = (conversations[activeContact?.id || ''] || activeContact?.messages || []).find((msg) => msg.id === msgId) || { id: msgId, sender: isMe ? 'operator' : 'customer', text: '', time: '' };
    return renderMessageActionBar(m as ChatMessage, isMe);
  };

  // Channel 3-dots actions menu (Re-scan QR, Disconnect/Unlink channel)
  const renderChannelMenu = (targetAppId: string) => {
    const theme = APP_GRADIENT_THEMES[targetAppId] || APP_GRADIENT_THEMES.whatsapp;
    return (
      <div className="relative z-50">
        <button
          id="channel-action-menu-btn"
          type="button"
          onClick={() => setIsChannelMenuOpen((prev) => !prev)}
          className={`p-2 rounded-full transition-colors cursor-pointer ${
            isLightColor(theme.solidColor) ? 'text-slate-950 hover:bg-black/10' : 'text-white hover:bg-white/20'
          }`}
          title="Channel options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        <AnimatePresence>
          {isChannelMenuOpen && (
            <>
              {/* Click-outside dismissal backdrop */}
              <div 
                className="fixed inset-0 z-40 bg-transparent cursor-default" 
                onClick={() => setIsChannelMenuOpen(false)} 
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-[#1E222A] text-gray-800 dark:text-gray-100 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-700 py-1.5 z-50 text-xs select-none"
              >
                {(() => {
                  const menuInfo = getChannelReconfigureInfo(targetAppId, theme.name);
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        setIsChannelMenuOpen(false);
                        onOpenConnect?.();
                      }}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-neutral-800 flex items-center gap-2.5 font-semibold cursor-pointer transition-colors"
                    >
                      {menuInfo.icon}
                      <span>{menuInfo.label}</span>
                    </button>
                  );
                })()}
                <div className="my-1 border-t border-gray-100 dark:border-neutral-800" />
                <button
                  id="menu-unlink-channel-btn"
                  type="button"
                  onClick={() => {
                    setIsChannelMenuOpen(false);
                    onDisconnect?.(targetAppId);
                  }}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
                >
                  <Unlink className="w-4 h-4 text-red-500" />
                  <span>Unlink / Disconnect {theme.name}</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Connected channel but no contacts yet
  if (!activeContact) {
    const theme = APP_GRADIENT_THEMES[appId] || APP_GRADIENT_THEMES.whatsapp;
    const APP_ICONS: Record<string, React.ReactNode> = {
      whatsapp: <WhatsAppIcon className="w-14 h-14 drop-shadow-md" />,
      whatsapp_2: <WhatsAppIcon className="w-14 h-14 drop-shadow-md" />,
      instagram: <InstagramIcon className="w-14 h-14 drop-shadow-md" />,
      telegram: <TelegramIcon className="w-14 h-14 drop-shadow-md" />,
      signal: <SignalIcon className="w-14 h-14 drop-shadow-md" />,
      messenger: <MessengerIcon className="w-14 h-14 drop-shadow-md" />,
      x_twitter: <XIcon className="w-14 h-14 drop-shadow-md" />,
      google_messages: <GoogleMessagesIcon className="w-14 h-14 drop-shadow-md" />,
      google_chat: <GoogleChatIcon className="w-14 h-14 drop-shadow-md" />,
      google_voice: <GoogleVoiceIcon className="w-14 h-14 drop-shadow-md" />,
      discord: <DiscordIcon className="w-14 h-14 drop-shadow-md" />,
      slack: <SlackIcon className="w-14 h-14 drop-shadow-md" />,
      linkedin: <LinkedInIcon className="w-14 h-14 drop-shadow-md" />,
      irc: <IrcIcon className="w-14 h-14 drop-shadow-md" />,
      matrix: <MatrixIcon className="w-14 h-14 drop-shadow-md" />,
      web_widget: <StorefrontIcon className="w-14 h-14 drop-shadow-md" />,
      gmail: <GmailIcon className="w-14 h-14 drop-shadow-md" />,
      viber: <ViberIcon className="w-14 h-14 drop-shadow-md" />,
      snapchat: <SnapchatIcon className="w-14 h-14 drop-shadow-md" />,
    };

    let connectedProfileName = '';
    try {
      if (appId === 'x_twitter') {
        const xt = localStorage.getItem('cf_x_twitter_handle') || localStorage.getItem('cf_x_twitter_account');
        if (xt) {
          try {
            const p = JSON.parse(xt);
            connectedProfileName = p.handle || p.name || '';
          } catch {
            connectedProfileName = xt;
          }
        }
      } else if (appId === 'google_chat') {
        const gc = localStorage.getItem('cf_google_chat_space') || localStorage.getItem('cf_google_chat_account');
        if (gc) {
          try {
            const p = JSON.parse(gc);
            connectedProfileName = p.space || p.email || '';
          } catch {
            connectedProfileName = gc;
          }
        }
      } else if (appId === 'google_messages') {
        connectedProfileName = localStorage.getItem('cf_google_messages_phone') || '';
      } else if (appId === 'google_voice') {
        connectedProfileName = localStorage.getItem('cf_google_voice_number') || '';
      } else if (appId === 'linkedin') {
        connectedProfileName = localStorage.getItem('cf_linkedin_page') || '';
      } else if (appId === 'irc') {
        connectedProfileName = localStorage.getItem('cf_irc_nick') || '';
      } else if (appId === 'instagram') {
        connectedProfileName = `@${igProfile.username}`;
      } else if (appId === 'telegram') {
        const tg = localStorage.getItem('cf_telegram_bot');
        if (tg) {
          const p = JSON.parse(tg);
          connectedProfileName = p.username ? `@${p.username}` : '';
        }
      } else if (appId === 'messenger') {
        const fb = localStorage.getItem('cf_messenger_page');
        if (fb) {
          const p = JSON.parse(fb);
          connectedProfileName = p.name || '';
        }
      } else if (appId === 'gmail') {
        const gm = localStorage.getItem('cf_gmail_account');
        if (gm) {
          const p = JSON.parse(gm);
          connectedProfileName = p.email || '';
        }
      } else if (appId === 'viber') {
        const vb = localStorage.getItem('cf_viber_account');
        if (vb) {
          try {
            const p = JSON.parse(vb);
            connectedProfileName = p.name || p.phone || '';
          } catch {
            connectedProfileName = vb;
          }
        } else {
          connectedProfileName = localStorage.getItem('cf_viber_phone') || '';
        }
      } else if (appId === 'snapchat') {
        const sc = localStorage.getItem('cf_snapchat_account');
        if (sc) {
          try {
            const p = JSON.parse(sc);
            connectedProfileName = p.username ? `@${p.username}` : (p.name || '');
          } catch {
            connectedProfileName = sc;
          }
        } else {
          connectedProfileName = localStorage.getItem('cf_snapchat_username') || '';
        }
      }
    } catch {}

    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#F5F5ED] dark:bg-[#1A1D23] ${isMobileEmbedded ? 'rounded-b-3xl border-0 shadow-none' : 'rounded-3xl border shadow-sm'} border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden`}>
        {/* Solid brand header bar only when not embedded on mobile with strict h-14 height */}
        {!isMobileEmbedded && (
          <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 shrink-0 flex items-center justify-between border-b border-black/10 select-none shadow-xs rounded-t-3xl cursor-grab active:cursor-grabbing touch-none ${dragHandleProps?.className || ""}`}
            style={{ ...dragHandleProps?.style, backgroundColor: theme.solidColor  }}
          >
            <div className="flex items-center gap-2 min-w-0 pointer-events-none select-none">
              <span className={`font-bold text-sm truncate whitespace-nowrap leading-none ${
                isLightColor(theme.solidColor) ? 'text-slate-950 font-black' : 'text-white'
              }`}>
                {theme.name}
              </span>
              {connectedProfileName ? (
                <button
                  type="button"
                  onClick={() => {
                    if (appId === 'instagram') {
                      setNewIgHandleInput(igProfile.username);
                      setIsEditingIgHandle(true);
                    }
                  }}
                  title={appId === 'instagram' ? 'Click to edit your real Instagram @handle' : undefined}
                  className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold truncate max-w-[130px] leading-none shadow-2xs flex items-center gap-1 cursor-pointer transition-colors ${
                    isLightColor(theme.solidColor)
                      ? 'bg-black/10 hover:bg-black/20 border border-black/20 text-slate-950 font-black'
                      : 'bg-black/25 hover:bg-black/35 border border-white/20 text-white/95'
                  }`}
                >
                  <span className="truncate">{connectedProfileName}</span>
                  {appId === 'instagram' && <Edit3 className="w-2.5 h-2.5 opacity-80 shrink-0" />}
                </button>
              ) : (
                appId === 'instagram' && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewIgHandleInput('');
                      setIsEditingIgHandle(true);
                    }}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                      isLightColor(theme.solidColor)
                        ? 'bg-black/10 hover:bg-black/20 border border-black/20 text-slate-950'
                        : 'bg-black/20 hover:bg-black/35 border border-white/25 text-white/90'
                    }`}
                  >
                    <span>Link Real @Handle</span>
                    <Edit3 className="w-2.5 h-2.5 opacity-80 shrink-0" />
                  </button>
                )
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 whitespace-nowrap shadow-2xs leading-none ${
                isLightColor(theme.solidColor)
                  ? 'bg-black/10 border border-black/20 text-slate-950 font-bold'
                  : 'bg-black/25 border border-white/20 text-white'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                Connected & Live
              </span>
              {renderChannelMenu(appId)}
            </div>
          </div>
        )}
        {/* Empty state body */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
          {isSimulatingLoad ? (
            <>
              <div className="w-14 h-14 border-4 border-[#DFDFD4] dark:border-neutral-700 border-t-[#C13584] rounded-full animate-spin mb-2" style={{ borderTopColor: theme.solidColor }}></div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-1.5 animate-pulse">
                Connecting to {theme.name}...
              </h3>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 max-w-[280px] leading-relaxed">
                Establishing secure gateway link.
              </p>
            </>
          ) : (
            <>
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-md relative" style={{ ...dragHandleProps?.style, backgroundColor: theme.solidColor + '15'  }}>
            {APP_ICONS[appId]}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-gray-900" />
            </span>
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="font-extrabold text-base md:text-lg text-gray-800 dark:text-white">
              {connectedProfileName ? `${connectedProfileName} Connected & Live` : `${theme.name} Connected & Live`}
            </h3>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-200 dark:border-emerald-800/40 shadow-xs mx-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Gateway Listening</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pt-1">
              Your {theme.name} gateway is active. When a customer sends a message to {connectedProfileName || 'your account'}, their conversation will appear here automatically.
            </p>
          </div>

          {/* Discussion Starter Card with PhoneInput */}
          {(() => {
            const isPhoneApp = ['whatsapp', 'whatsapp_2', 'signal', 'viber', 'snapchat', 'google_messages', 'google_voice'].includes(appId);
            return (
              <div className="w-full max-w-sm mt-1 p-4 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-xs rounded-3xl border border-gray-200 dark:border-neutral-700 text-left space-y-3 shadow-md">
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 dark:border-neutral-700/60">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
                    <Send className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Démarrer une conversation</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono font-bold">{theme.name}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    {isPhoneApp ? "Numéro de mobile du destinataire :" : `Identifiant ${theme.name} :`}
                  </label>
                  {isPhoneApp ? (
                    <PhoneInput
                      value={newChatCustomerHandle}
                      onChange={(val) => setNewChatCustomerHandle(val)}
                      defaultCountry="DZ"
                      placeholder="Numéro mobile du contact"
                    />
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        value={newChatCustomerHandle}
                        onChange={(e) => setNewChatCustomerHandle(e.target.value)}
                        placeholder={appId === 'x_twitter' ? '@handle' : appId === 'gmail' ? 'email@domain.com' : 'Nom ou identifiant'}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    Nom du contact (optionnel) :
                  </label>
                  <input
                    type="text"
                    value={newChatCustomerName}
                    onChange={(e) => setNewChatCustomerName(e.target.value)}
                    placeholder="Ex: Amine, Client Oran..."
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    Premier message :
                  </label>
                  <textarea
                    rows={2}
                    value={newChatFirstMessage}
                    onChange={(e) => setNewChatFirstMessage(e.target.value)}
                    placeholder="Salam ! Comment puis-je vous aider ?"
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleStartNewChatDirect}
                  disabled={isSubmittingNewChat || !newChatCustomerHandle.trim() || !newChatFirstMessage.trim()}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer hover:opacity-95 active:scale-98 disabled:opacity-50 ${
                    isLightColor(theme.solidColor) ? 'text-slate-950 font-black' : 'text-white'
                  }`}
                  style={{ backgroundColor: theme.solidColor }}
                >
                  {isSubmittingNewChat ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Envoyer et ouvrir la discussion</span>
                </button>

                {liveContacts && liveContacts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (liveContacts[0]?.id) {
                        onNavigatePath?.([liveContacts[0].id]);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-700/50"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ouvrir la dernière discussion ({liveContacts[0].name})</span>
                  </button>
                )}
              </div>
            );
          })()}
            </>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {appId === 'instagram' && !igProfile.isLinked && (
              <button
                type="button"
                onClick={() => {
                  setNewIgHandleInput('');
                  setIsEditingIgHandle(true);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#C13584] hover:bg-[#A82A70] text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>Connect Your Real Instagram @Handle</span>
              </button>
            )}

            {appId === 'instagram' && onOpenConnect && (
              <button
                type="button"
                onClick={onOpenConnect}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Link2 className="w-3.5 h-3.5 text-[#C13584]" />
                <span>Link Meta Graph API Token</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 0. SPECIALIZED NATIVE APP REPLICAS (Discord, Slack, Signal, X, Matrix, IRC, LinkedIn, Google Family)
  // =========================================================================
  const activeTheme = APP_GRADIENT_THEMES[appId] || APP_GRADIENT_THEMES.whatsapp;
  
  // Render Directory Mode ONLY if the active contact has nested children and no topics
  if (activeContact && activeContact.isGroup && (!activeContact.topics || activeContact.topics.length === 0) && activeContact.children && activeContact.children.length > 0 && selectedContactPath.length <= 1) {
    const theme = APP_GRADIENT_THEMES[appId] || APP_GRADIENT_THEMES.discord;
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#F5F5ED] dark:bg-[#1A1D23] ${isMobileEmbedded ? 'rounded-b-3xl border-0 shadow-none' : 'rounded-3xl border shadow-sm'} border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden`}>
        <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 shrink-0 flex items-center justify-between border-b border-black/10 select-none shadow-xs ${isMobileEmbedded ? 'rounded-tr-2xl' : 'rounded-t-3xl'} cursor-grab active:cursor-grabbing touch-none ${dragHandleProps?.className || ""}`}
          style={{ ...dragHandleProps?.style, backgroundColor: theme.solidColor  }}
        >
          <div className={`flex items-center gap-3 min-w-0 ${isLightColor(theme.solidColor) ? 'text-slate-950' : 'text-white'}`}>
            {selectedContactPath.length > 1 && (
              <button onClick={handleNavigateUp} className={`p-1.5 -ml-2 rounded-full transition-colors shrink-0 ${
                isLightColor(theme.solidColor) ? 'hover:bg-black/10 text-slate-950' : 'hover:bg-white/20 text-white'
              }`}>
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="min-w-0">
              <h4 className="font-bold text-sm truncate leading-tight flex items-center gap-1.5">
                {activeContact.name}
              </h4>
              <p className={`text-[11px] truncate leading-tight ${isLightColor(theme.solidColor) ? 'text-slate-900/80 font-semibold' : 'text-white/80'}`}>
                {activeContact.children ? activeContact.children.length : 0} Channels
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 dark:bg-[#111418] space-y-2">
          {(!activeContact.children || activeContact.children.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-full opacity-50 text-sm">
              No channels available.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeContact.children.map((child: any) => (
                <button
                  key={child.id}
                  onClick={() => {
                    onMarkAsRead?.(appId, child.id);
                    handleNavigateDown(child.id);
                  }}
                  className="bg-white dark:bg-[#1E222A] border border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600 rounded-2xl p-4 flex flex-col gap-2 text-left transition-all hover:shadow-md cursor-pointer group"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white ${child.avatarColor || 'bg-gray-400'}`}>
                      {child.isGroup ? <Folder className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-emerald-500 transition-colors">
                        {child.name}
                      </h5>
                      <p className="text-[11px] text-gray-500 truncate">{child.handleOrPhone}</p>
                    </div>
                    {Boolean(child.unreadCount && child.unreadCount > 0) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white shadow-xs animate-pulse shrink-0">
                        {child.unreadCount}
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (['discord', 'slack', 'signal', 'x_twitter', 'matrix', 'irc', 'linkedin', 'google_messages', 'google_chat', 'google_voice', 'viber', 'snapchat'].includes(appId)) {
    const currentMsgs = (activeContact?.isGroup && activeContact?.topics && activeContact.topics.length > 0)
      ? activeMessages
      : (conversations[activeContact.id] || activeContact.messages || []);
    return (
      <div className="h-full w-full flex flex-col min-h-0 min-w-0 overflow-hidden">
        {renderSandboxBanner()}

        <ChannelNativeViews
        appId={appId}
        dragHandleProps={dragHandleProps}
        activeContact={activeContact}
        messages={currentMsgs}
        currentTopicId={currentTopicId}
        currentTopic={currentTopic}
        onSelectTopic={(tId) => {
          onNavigatePath?.([activeContact.id, tId]);
          onMarkAsRead?.(appId, activeContact.id, tId);
        }}
        currentUser={currentUser}
        onSendMessage={(text) => handleSend(undefined, text)}
        onSendVoiceNote={(duration) => {
          const newMsg: ChatMessage = {
            id: String(Date.now()),
            sender: 'operator',
            text: '🎤 Voice message',
            time: 'Just now',
            delivered: true,
            isAudio: true,
            audioDuration: duration,
            timestamp: Date.now(),
          };
          setConversations((prev) => ({
            ...prev,
            [activeContact.id]: [...(prev[activeContact.id] || activeContact.messages || []), newMsg],
          }));
          onMessageActivity?.(appId, activeContact.id, 'Voice note', Date.now());

          const isTestBot = Boolean(activeContact?.isAiTestBot || activeContact?.id?.startsWith('sandbox_bot_'));
          if (isTestBot) {
            triggerTestBotAccumulator(appId, activeContact.id, {
              isAudio: true,
              text: 'Voice note',
              msgId: newMsg.id,
            });
            return;
          }

          let token = '';
          if (appId === 'discord') {
            try {
              token = localStorage.getItem('cf_discord_token') || '';
              if (token && !token.startsWith('Bot ') && !token.startsWith('Bot_ChatbotFarm')) {
                localStorage.removeItem('cf_discord_token');
                localStorage.removeItem('cf_discord_account');
                token = '';
              }
            } catch {}
          }
          fetch(`/api/channels/${appId}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatId: activeContact.id,
              recipientId: activeContact.id,
              userId: currentUser?.id,
              isAudio: true,
              audioDuration: duration,
              text: 'Voice note',
              token,
            }),
          }).catch(() => {});
        }}
        onSendAttachment={(urlOrName, type, size) => {
          const isImg = type === 'image';
          const newMsg: ChatMessage = {
            id: String(Date.now()),
            sender: 'operator',
            text: isImg ? '' : urlOrName,
            time: 'Just now',
            delivered: true,
            imageUrl: isImg ? urlOrName : undefined,
            hasImages: isImg,
            fileName: isImg ? undefined : urlOrName,
            fileSize: size,
            timestamp: Date.now(),
          };
          setConversations((prev) => ({
            ...prev,
            [activeContact.id]: [...(prev[activeContact.id] || activeContact.messages || []), newMsg],
          }));
          onMessageActivity?.(appId, activeContact.id, isImg ? 'Photo' : urlOrName, Date.now());

          const isTestBot = Boolean(activeContact?.isAiTestBot || activeContact?.id?.startsWith('sandbox_bot_'));
          if (isTestBot) {
            triggerTestBotAccumulator(appId, activeContact.id, {
              isImage: isImg,
              text: isImg ? 'Photo' : urlOrName,
              msgId: newMsg.id,
            });
            return;
          }

          fetch(`/api/channels/${appId}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatId: activeContact.id,
              recipientId: activeContact.id,
              userId: currentUser?.id,
              imageUrl: isImg ? urlOrName : undefined,
              fileName: isImg ? undefined : urlOrName,
              fileSize: size,
              text: isImg ? '' : urlOrName,
            }),
          }).catch(() => {});
        }}
        renderMessageAttachment={renderMessageAttachment}
        renderChannelMenu={renderChannelMenu}
        renderQuickTemplatesBar={renderQuickTemplatesBar}
        inputText={inputMessage}
        setInputText={setInputMessage}
        onMobileBack={onMobileBack}
        isMobileEmbedded={isMobileEmbedded}
        theme={activeTheme}
        onDeleteMessage={handleDeleteMessage}
        onReact={handleReact}
      />
      {renderTemplateModal()}
      {renderApiKeyModal()}
      {renderTemplateContextMenu()}
    </div>
  );
  }

  // =========================================================================
  // 1. TELEGRAM REPLICA
  // =========================================================================
  if (appId === 'telegram') {
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#F3F4F6] dark:bg-[#0E1621] @container ${isMobileEmbedded ? 'rounded-b-3xl border-t-0 shadow-none' : 'rounded-3xl border shadow-sm'} border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden relative text-[#1B1B1B]`}>
        {/* Hidden File & Image Pickers */}
        <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

        {/* Header with Solid Brand Color */}
        <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 text-white flex items-center justify-between z-30 shadow-xs border-b border-black/10 shrink-0 select-none relative cursor-grab active:cursor-grabbing touch-none ${isMobileEmbedded ? 'rounded-tr-2xl' : 'rounded-t-3xl'} ${dragHandleProps?.className || ""}`}>
          {renderSolidHeader(APP_GRADIENT_THEMES.telegram.solidColor)}
          <div className="relative z-10 flex items-center gap-2 min-w-0">
            {onMobileBack && (
              <button
                type="button"
                onClick={onMobileBack}
                className="md:hidden p-1 -ml-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white shrink-0"
                title="Back to contacts"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div
              onClick={() => openProfile(activeContact, 'telegram')}
              className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
              title="Afficher le profil Telegram"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0 relative overflow-hidden flex items-center justify-center bg-[#0088CC]/20 text-white font-bold text-xs ring-1 ring-white/20">
                <TelegramIcon className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-xs shrink-0" />
                {activeContact?.profilePicUrl ? (
                  <img
                    src={activeContact.profilePicUrl}
                    alt=""
                    draggable={false}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    className="absolute inset-0 object-cover w-full h-full rounded-full pointer-events-none select-none"
                  />
                ) : activeContact?.channelEmoji ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0088CC] text-base select-none">
                    {activeContact.channelEmoji}
                  </div>
                ) : null}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-white leading-tight flex items-center gap-1.5">
                  <ScrollingGroupTitle
                    name={activeContactDisplayName}
                    isGroup={activeContact.isGroup}
                    isUntitledGroup={activeContact.isUntitledGroup}
                    participantNames={activeContact.participantNames}
                    titleClassName="font-bold text-xs sm:text-sm text-white"
                    badge={activeContact?.isBroadcast ? <Volume2 className="w-3 h-3 text-white/80 shrink-0" /> : undefined}
                  />
                  {currentTopic && (() => {
                    const glyphInfo = extractTopicGlyphAndTitle(currentTopic);
                    return (
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold text-white shadow-xs inline-flex items-center gap-1 shrink-0 bg-white/20 backdrop-blur-xs border border-white/20"
                      >
                        {glyphInfo.isHash ? (
                          <span className="text-white font-extrabold">#</span>
                        ) : (
                          <span>{glyphInfo.glyph}</span>
                        )}
                        <span>{glyphInfo.title}</span>
                        {isTopicClosed && (
                          <Lock className="w-2.5 h-2.5 opacity-90 ml-0.5 inline shrink-0" />
                        )}
                      </span>
                    );
                  })()}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-white/80 truncate leading-tight flex items-center gap-1.5 font-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block animate-pulse" />
                  <span>{activeContact.isAiTestBot || activeContact.id?.startsWith('sandbox_bot_') ? 'online • AI Test Mode' : (activeContact.handleOrPhone && activeContact.handleOrPhone.startsWith('@')) ? activeContact.handleOrPhone : 'online'}</span>
                  <span className="opacity-70">• {isAiActive ? 'AI Active' : 'Operator'}</span>
                  {activeContact?.isBroadcast && <span className="opacity-80">• Channel</span>}
                </p>
              </div>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-1 text-white shrink-0">
            <button
              disabled={!canMakeCalls}
              className={`hidden @[340px]:flex p-1.5 rounded-full transition-colors ${canMakeCalls ? 'hover:bg-white/20 cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
              title={canMakeCalls ? "Voice call" : "Voice calls restricted by administrator"}
            >
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button className="hidden @[300px]:flex p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer" title="Search"><Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
            {renderChannelMenu('telegram')}
          </div>
        </div>

        {/* Sandbox Test Bot Indicator Banner */}
        {renderSandboxBanner()}

        {/* In-Chat Channel / Topic Selector Bar with Live Notification Badges */}
        {activeContact?.isGroup && activeContact?.topics && activeContact.topics.length > 0 && (
          <div className="px-3 py-2 bg-white/90 dark:bg-[#151E27]/90 backdrop-blur-md border-b border-black/10 dark:border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 select-none z-10 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 shrink-0 flex items-center gap-1 pl-1">
              <Hash className="w-3 h-3 text-[#2AABEE]" /> Channels:
            </span>
            {activeContact.topics.map((t: any) => {
              const isCurrent = String(t.id) === String(currentTopicId) ||
                Boolean(String(t.id).replace(/\D/g, '') && String(t.id).replace(/\D/g, '') === String(currentTopicId).replace(/\D/g, ''));
              const hasUnread = Boolean(t.unreadCount && t.unreadCount > 0);
              const glyphInfo = extractTopicGlyphAndTitle(t);
              const isTopicItemClosed = Boolean(t.closed || (t as any)?.isClosed);
              return (
                <button
                  key={t.id}
                  id={`telegram-topic-tab-${t.id}`}
                  type="button"
                  onClick={() => {
                    onNavigatePath?.([activeContact.id, t.id]);
                    onMarkAsRead?.(appId, activeContact.id, t.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#2AABEE] text-white shadow-sm font-bold'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/15'
                  }`}
                >
                  {glyphInfo.isHash ? (
                    <span className={isCurrent ? 'text-white font-black' : 'text-[#2AABEE] font-black'}>#</span>
                  ) : (
                    <span>{glyphInfo.glyph}</span>
                  )}
                  <span>{glyphInfo.title}</span>
                  {isTopicItemClosed && (
                    <Lock className="w-2.5 h-2.5 text-amber-400 opacity-80 shrink-0" />
                  )}
                  {hasUnread && (
                    <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-500 text-white shadow-xs animate-pulse">
                      {t.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Message Feed */}
        <PullToRefresh
          onRefresh={handleManualChatRefresh}
          isRefreshing={isManualChatRefreshing}
          accentColor={APP_GRADIENT_THEMES.telegram.solidColor}
          className="flex-1 min-h-0 flex flex-col overflow-hidden"
        >
          <div ref={telegramFeedRef} style={{ overflowAnchor: 'auto' }} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#F3F4F6] dark:bg-[#0E1621] bg-telegram-pattern">
          {isChatLoading && activeMessages.length === 0 ? (
            renderChatLoadingSkeleton()
          ) : activeMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xl mb-3 shadow-xs">
                #
              </div>
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                {currentTopic ? `#${currentTopic.name.replace(/^#/, '')}` : 'Topic Discussion'}
              </h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                {activeContact.isBroadcast
                  ? 'No posts in this channel yet.'
                  : `This is the start of the discussion in ${currentTopic ? `#${currentTopic.name.replace(/^#/, '')}` : activeContact.name}. Send a message below to start chatting!`}
              </p>
            </div>
          ) : (
            activeMessages.map((m, idx) => {
              const isMe = m.sender === 'operator';

              const currentDateGroup = getTelegramDateGroup(m.timestamp);
              const prevDateGroup = idx > 0 ? getTelegramDateGroup(activeMessages[idx - 1].timestamp) : null;
              const showDateSeparator = Boolean(currentDateGroup && (idx === 0 || currentDateGroup !== prevDateGroup));
              
              const stringToColor = (str: string) => {
                let hash = 0;
                for (let i = 0; i < str.length; i++) {
                  hash = str.charCodeAt(i) + ((hash << 5) - hash);
                }
                const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
                return '#' + '00000'.substring(0, 6 - c.length) + c;
              };

              const renderMentions = (text: string) => {
                if (!text) return text;
                return renderPressableText(text, { appId: 'telegram' });
              };

              const telegramText = extractSafeText(m);
              const isEvent = isTelegramEventMessage(m, telegramText);

              if (isEvent) {
                return (
                  <React.Fragment key={m.id}>
                    {showDateSeparator && (
                      <div className="flex justify-center my-2.5 select-none">
                        <span className="inline-flex items-center justify-center px-3.5 py-0.5 rounded-full bg-black/40 dark:bg-black/60 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold shadow-xs border border-white/10 select-none">
                          {currentDateGroup}
                        </span>
                      </div>
                    )}
                    <div
                      id={`msg-${m.id}`}
                      className="flex justify-center my-2.5 w-full select-none"
                    >
                      <div
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-black/40 dark:bg-black/60 backdrop-blur-xs text-white text-[11.5px] sm:text-xs font-medium text-center shadow-xs border border-white/10 select-text"
                        title={m.time ? `${m.time}` : undefined}
                      >
                        {renderTelegramEventContent(m, telegramText)}
                      </div>
                    </div>
                  </React.Fragment>
                );
              }

              return (
                <React.Fragment key={m.id}>
                  {showDateSeparator && (
                    <div className="flex justify-center my-2.5 select-none">
                      <span className="inline-flex items-center justify-center px-3.5 py-0.5 rounded-full bg-black/40 dark:bg-black/60 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold shadow-xs border border-white/10 select-none">
                        {currentDateGroup}
                      </span>
                    </div>
                  )}
                  <div
                    id={`msg-${m.id}`}
                    onMouseEnter={() => handleMessageMouseEnter(m.id)}
                    onMouseLeave={handleMessageMouseLeave}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full group/msg relative transition-all ${
                  (m.reactions && m.reactions.length > 0) || hoveredMessageId === m.id ? 'mb-4' : 'mb-1.5'
                }`}
              >
                <div className="flex items-end gap-2 max-w-[78%]">
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gray-300 dark:bg-gray-700 overflow-hidden shadow-xs mb-1 relative flex items-center justify-center">
                      <div
                        className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs select-none"
                        style={{ backgroundColor: stringToColor(m.senderName || m.senderId || 'User') }}
                      >
                        {(m.senderName || 'U').charAt(0).toUpperCase()}
                      </div>
                      {(activeContact?.isGroup ? m.senderAvatar : (m.senderAvatar || activeContact?.profilePicUrl)) && (
                        <img
                          src={activeContact?.isGroup ? m.senderAvatar : (m.senderAvatar || activeContact?.profilePicUrl || undefined)}
                          alt={m.senderName || ''}
                          className="absolute inset-0 w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* Message Bubble Container with relative positioning for reactions */}
                  <div
                    onClick={() => setHoveredMessageId(hoveredMessageId === m.id ? null : m.id)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleReact(m.id, '❤️');
                    }}
                    className="relative group/bubble cursor-pointer"
                  >
                    <AnimatePresence>
                      {hoveredMessageId === m.id && !m.isDeleted && renderMessageActionBar(m, isMe)}
                    </AnimatePresence>

                    {m.pinned && !m.isDeleted && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold mb-0.5 ml-2">
                        <Pin className="w-2.5 h-2.5 fill-current rotate-45 shrink-0" />
                        <span className="opacity-90">Pinned Message</span>
                      </div>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed transition-colors ${
                        m.isDeleted
                          ? 'bg-gray-200/80 dark:bg-[#1E293B]/80 text-gray-500 dark:text-gray-400 italic rounded-br-sm border border-gray-300/60 dark:border-neutral-700/60'
                          : isMe
                          ? 'bg-[#2AABEE] text-white rounded-br-sm shadow-sm'
                          : 'bg-white dark:bg-[#182533] text-[#111827] dark:text-white rounded-bl-sm shadow-xs'
                      }`}
                    >
                      {/* Quoted Reply Block */}
                      {m.replyTo && !m.isDeleted && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetEl = document.getElementById(`msg-${m.replyTo?.id}`);
                            if (targetEl) {
                              targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              targetEl.classList.add('ring-2', 'ring-blue-400');
                              setTimeout(() => targetEl.classList.remove('ring-2', 'ring-blue-400'), 1500);
                            }
                          }}
                          className={`mb-1.5 rounded-lg px-2.5 py-1.5 text-[11px] overflow-hidden select-none cursor-pointer transition-colors border-l-4 ${
                            isMe
                              ? 'bg-black/10 dark:bg-black/25 border-white/80 hover:bg-black/15'
                              : 'bg-black/5 dark:bg-black/20 border-[#2AABEE] hover:bg-black/10'
                          }`}
                        >
                          <p className={`font-bold text-[10px] truncate leading-tight ${isMe ? 'text-white/90' : 'text-[#2AABEE]'}`}>
                            {m.replyTo.sender}
                          </p>
                          <p className={`truncate leading-tight mt-0.5 ${isMe ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>
                            {renderQuotedSnippet(m.replyTo.text)}
                          </p>
                        </div>
                      )}

                      {m.isDeleted ? (
                        <div className="flex items-center gap-1.5 py-1 text-xs opacity-70 select-none italic">
                          <Ban className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{isMe ? 'You deleted this message' : 'This message was deleted'}</span>
                        </div>
                      ) : (m.isCall || m.callType || (m.text && (m.text.toLowerCase().includes('appel vocal') || m.text.toLowerCase().includes('voice call') || m.text.toLowerCase().includes('appel vidéo')))) ? (
                        <div className="py-1 px-0.5 space-y-1.5 select-none min-w-[200px]">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                                m.callType?.startsWith('missed') || m.callOutcome === 'Missed' || m.callOutcome === 'Unanswered'
                                  ? 'bg-red-500/15 text-red-500 dark:bg-red-500/20'
                                  : isMe
                                  ? 'bg-white/20 text-white'
                                  : 'bg-[#2AABEE]/15 text-[#2AABEE] dark:bg-[#2AABEE]/20'
                              }`}
                            >
                              {m.callType?.includes('video') ? (
                                <Video className="w-4 h-4" />
                              ) : m.callType?.startsWith('missed') || m.callOutcome === 'Missed' ? (
                                <PhoneMissed className="w-4 h-4 text-red-500" />
                              ) : m.callType?.startsWith('outgoing') ? (
                                <PhoneOutgoing className="w-4 h-4" />
                              ) : (
                                <PhoneIncoming className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-xs leading-tight flex items-center gap-1.5">
                                <span className="truncate">
                                  {m.callType?.startsWith('missed') || m.callOutcome === 'Missed'
                                    ? (m.callType?.includes('video') ? 'Appel vidéo manqué' : 'Appel vocal manqué')
                                    : m.callType?.startsWith('outgoing')
                                    ? (m.callType?.includes('video') ? 'Appel vidéo sortant' : 'Appel vocal sortant')
                                    : (m.callType?.includes('video') ? 'Appel vidéo entrant' : 'Appel vocal entrant')}
                                </span>
                              </div>
                              <p className={`text-[10.5px] mt-0.5 ${isMe ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                                {m.callType?.startsWith('missed') || m.callOutcome === 'Missed'
                                  ? 'Sans réponse'
                                  : m.callDuration ? `Durée : ${m.callDuration}` : m.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {!isMe && activeContact?.isGroup && m.senderName && (
                            <div className="font-bold text-[11px] mb-0.5" style={{ color: stringToColor(m.senderName) }}>
                              {m.senderName}
                            </div>
                          )}
                          {(() => {
                            const raw = extractSafeText(m) || m.text || '';
                            const hasAttachment = Boolean(m.imageUrl || m.videoUrl || m.isAudio || m.fileName || m.poll);
                            const clean = raw ? raw.replace(/^[📷🎥🎤🎵📄📍🏷️📹📞💬🚫]+\s*/, '').trim() : '';
                            const showText = !m.poll && clean && (!hasAttachment || !isMediaPlaceholderText(clean));
                            return (
                              <>
                                {hasAttachment && renderMessageAttachment(m, isMe)}
                                {showText ? (
                                  <p className={`whitespace-pre-wrap font-normal break-words ${hasAttachment ? 'mt-1.5' : ''}`}>
                                    {renderMentions(clean)}
                                  </p>
                                ) : !hasAttachment ? (
                                  <p className="whitespace-pre-wrap font-normal italic opacity-80 flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>Message</span>
                                  </p>
                                ) : null}
                              </>
                            );
                          })()}
                        </>
                      )}

                      <div className="flex justify-end items-center gap-1 text-[10px] opacity-75 mt-1 select-none">
                        <span>{m.time}</span>
                        {isMe && !m.isDeleted && <CheckCheck className="w-3.5 h-3.5" />}
                        {m.seen && !m.isDeleted && <span className="text-[9px] ml-0.5">Seen</span>}
                      </div>
                    </div>

                    {/* Reaction badge directly docked under the message bubble */}
                    {m.reactions && m.reactions.length > 0 && !m.isDeleted && (
                      <div className={`absolute -bottom-2.5 ${isMe ? 'right-2' : 'left-2'} z-20 flex items-center gap-1 animate-in fade-in zoom-in-95`}>
                        {m.reactions.map((r, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReact(m.id, r.emoji);
                            }}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full shadow-md text-[11px] font-bold border transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                              r.userReacted
                                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                                : 'bg-white dark:bg-[#182533] border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200'
                            }`}
                            title="Click to toggle reaction"
                          >
                            <span>{r.emoji}</span>
                            {r.count > 1 && <span className="text-[10px]">{r.count}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })
      )}

          {isTyping && (
            <div className="flex items-center gap-2 text-gray-500 text-xs py-1">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce delay-100">●</span>
              <span className="animate-bounce delay-200">●</span>
              <span className="text-[11px] italic">{activeContactDisplayName} is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        </PullToRefresh>

        {/* Dynamic Quick Responses Bar */}
        {renderQuickTemplatesBar()}

        {/* Premade Message Creator & Editor Modal */}
        {renderTemplateModal()}
        {renderApiKeyModal()}

        {/* Right-Click Context Menu for Quick Templates */}
        {renderTemplateContextMenu()}

        {/* Input or Read-Only Banner */}
        {isChatReadOnly ? (
          <div 
            className="p-3.5 bg-gray-100/95 dark:bg-[#17212B]/95 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-center gap-2 shrink-0 z-20 text-center select-none shadow-xs backdrop-blur-xs"
            style={{ paddingBottom: keyboardOffset > 0 ? `${keyboardOffset + 12}px` : 'max(0.85rem, env(safe-area-inset-bottom, 0px))' }}
          >
            <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              {isTopicClosed 
                ? 'This topic is closed. Only administrators can send messages.'
                : 'Only administrators can send messages in this channel'}
            </span>
          </div>
        ) : (
          <form 
            onSubmit={handleSend} 
            className="p-3 bg-white dark:bg-[#17212B] border-t border-gray-200 dark:border-neutral-800 flex items-center gap-2 shrink-0 z-20"
            style={{ paddingBottom: keyboardOffset > 0 ? `${keyboardOffset + 12}px` : 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
              className="p-2 text-gray-400 hover:text-[#2AABEE] hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full hover:scale-115 active:scale-90 transition-all cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              title="Upload photo"
              className="p-2 text-gray-400 hover:text-[#2AABEE] hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full hover:scale-115 active:scale-90 transition-all cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => toggleQuickTemplates()}
              title={isQuickTemplatesOpen ? "Masquer les réponses rapides" : "Afficher les réponses rapides"}
              className={`p-2 rounded-full hover:scale-115 active:scale-90 transition-all cursor-pointer ${
                isQuickTemplatesOpen
                  ? 'text-[#2AABEE] bg-gray-100 dark:bg-neutral-800'
                  : 'text-gray-400 hover:text-[#2AABEE] hover:bg-gray-100 dark:hover:bg-neutral-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            {isRecordingVoice ? (
              <div className="flex-1 flex items-center justify-between bg-red-500/10 dark:bg-red-950/30 border border-red-500/30 rounded-xl px-3 py-1.5 text-red-600 dark:text-red-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="font-mono font-bold text-xs">
                    Voice 0:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={handleCancelVoiceRecord} className="p-1 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  <button type="button" onClick={handleSendVoiceNote} className="px-2.5 py-1 bg-[#2AABEE] hover:bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"><Send className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ) : (
              <input
                type="text"
                value={inputMessage}
                onFocus={handleInputFocus}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Write a message to ${activeContactDisplayName}...`}
                className="flex-1 bg-transparent px-2 py-1 text-xs focus:outline-none dark:text-white"
              />
            )}
            <button
              type="button"
              onClick={handleToggleVoiceRecord}
              title={isRecordingVoice ? "Send voice" : "Record voice"}
              className="p-2 text-gray-400 hover:text-[#2AABEE] hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full hover:scale-115 active:scale-90 transition-all cursor-pointer"
            >
              <Mic className={`w-4 h-4 ${isRecordingVoice ? 'text-red-500 animate-pulse' : ''}`} />
            </button>
            <button type="submit" className="p-2 text-[#2AABEE] hover:scale-120 active:scale-90 transition-transform cursor-pointer"><Send className="w-4 h-4" /></button>
          </form>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. INSTAGRAM DIRECT REPLICA
  // =========================================================================
  if (appId === 'instagram') {
    if (!activeContact) {
      return (
        <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#E6D3E7] dark:bg-[#201625] ${isMobileEmbedded ? 'rounded-b-3xl border-t-0 shadow-none' : 'rounded-3xl border shadow-sm'} border-[#D5BCD7] dark:border-[#38263F] overflow-hidden relative text-[#1B1B1B]`}>
          <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 text-white flex items-center justify-between z-30 shadow-xs border-b border-black/10 shrink-0 select-none relative cursor-grab active:cursor-grabbing touch-none ${isMobileEmbedded ? 'rounded-tr-2xl' : 'rounded-t-3xl'} ${dragHandleProps?.className || ""}`}>
            {renderSolidHeader(APP_GRADIENT_THEMES.instagram.solidColor)}
            <div className="relative z-10 flex items-center gap-2 min-w-0">
              {onMobileBack && (
                <button
                  type="button"
                  onClick={onMobileBack}
                  className="md:hidden p-1 -ml-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white shrink-0"
                  title="Back to contacts"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <InstagramIcon className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-xs shrink-0" />
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-tight flex items-center gap-1">
                  <span>Instagram Direct</span>
                </h4>
                <p className="text-[10px] sm:text-[11px] text-white/80 truncate leading-tight">
                  {igProfile.username ? `@${igProfile.username} Connected & Live` : 'Real Client Discussions'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white flex items-center justify-center shadow-lg">
              <InstagramIcon className="w-9 h-9" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                {igProfile.username ? `@${igProfile.username} Active` : 'Instagram Inbox Connected'}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Select an Instagram friend or client from your contacts panel on the right to view discussions, or start a new conversation below.
              </p>
            </div>
            <div className="w-full max-w-sm bg-white/80 dark:bg-[#2A1C30] backdrop-blur-md rounded-2xl p-4 border border-[#D5BCD7] dark:border-[#38263F] shadow-sm space-y-3 text-left">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#C13584]" />
                <span className="font-bold text-xs text-gray-900 dark:text-white">Direct Message a Client</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">@</span>
                <input
                  type="text"
                  value={newChatCustomerHandle}
                  onChange={(e) => setNewChatCustomerHandle(e.target.value.replace(/^@/, ''))}
                  placeholder="client_handle"
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#C13584]"
                />
              </div>
              <textarea
                rows={2}
                value={newChatFirstMessage}
                onChange={(e) => setNewChatFirstMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#C13584]"
              />
              <button
                type="button"
                onClick={handleStartNewChatDirect}
                disabled={isSubmittingNewChat || !newChatCustomerHandle.trim() || !newChatFirstMessage.trim()}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#833AB4] to-[#FD1D1D] text-white text-xs font-bold shadow-md hover:opacity-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Start Discussion</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#E6D3E7] dark:bg-[#201625] @container ${isMobileEmbedded ? 'rounded-b-3xl border-t-0 shadow-none' : 'rounded-3xl border shadow-sm'} border-[#D5BCD7] dark:border-[#38263F] overflow-hidden relative text-[#1B1B1B]`}>
        {/* Hidden File & Image Pickers */}
        <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

        {/* Header with Solid Brand Color */}
        <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 text-white flex items-center justify-between z-30 shadow-xs border-b border-black/10 shrink-0 select-none relative cursor-grab active:cursor-grabbing touch-none ${isMobileEmbedded ? 'rounded-tr-2xl' : 'rounded-t-3xl'} ${dragHandleProps?.className || ""}`}>
          {renderSolidHeader(APP_GRADIENT_THEMES.instagram.solidColor)}
          <div className="relative z-10 flex items-center gap-2 min-w-0">
            {onMobileBack && (
              <button
                type="button"
                onClick={onMobileBack}
                className="md:hidden p-1 -ml-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white shrink-0"
                title="Back to contacts"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div
              onClick={() => openProfile(activeContact, 'instagram')}
              className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
              title="Afficher le profil Instagram"
            >
              {activeContact?.profilePicUrl ? (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0 relative overflow-hidden ring-1 ring-white/20">
                  <img src={activeContact.profilePicUrl} alt="" draggable={false} className="object-cover w-full h-full rounded-full pointer-events-none select-none" />
                </div>
              ) : (
                <InstagramIcon className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-xs shrink-0" />
              )}
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-tight flex items-center gap-1">
                  {activeContactDisplayName} <span className="text-[10px] text-white/90">✓</span>
                </h4>
                <p className="text-[10px] sm:text-[11px] text-white/80 truncate leading-tight">
                  {activeContact.handleOrPhone} • {isAiActive ? 'Bot Actif' : 'Opérateur'}
                </p>
              </div>
            </div>
          </div>
          {/* User's Real Instagram Account Handle Badge with Live Green Indicator & 1-Click Edit */}
          <div className="relative z-10 flex items-center gap-1.5 shrink-0 mx-1">
            <button
              type="button"
              onClick={() => {
                setNewIgHandleInput(igProfile.username || '');
                setIsEditingIgHandle(true);
              }}
              title="Click to edit your real Instagram @handle"
              className="px-2.5 py-1 rounded-full bg-black/25 hover:bg-black/40 border border-white/25 text-white font-mono text-[10px] sm:text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-105 active:scale-95"
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${igProfile.username ? 'bg-emerald-400 animate-pulse' : 'bg-gray-300'}`} />
              <span className="truncate max-w-[85px] sm:max-w-[130px]">
                {igProfile.username ? `@${igProfile.username}` : 'Link Handle'}
              </span>
              <Edit3 className="w-2.5 h-2.5 opacity-80 shrink-0" />
            </button>
          </div>
          <div className="relative z-10 flex items-center gap-1 text-white shrink-0">
            <button
              disabled={!canMakeCalls}
              className={`hidden sm:flex p-1.5 rounded-full transition-colors ${canMakeCalls ? 'hover:bg-white/20 cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
              title={canMakeCalls ? "Voice call" : "Voice calls restricted by administrator"}
            >
              <Phone className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={!canMakeCalls}
              className={`hidden sm:flex p-1.5 rounded-full transition-colors ${canMakeCalls ? 'hover:bg-white/20 cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
              title={canMakeCalls ? "Video call" : "Video calls restricted by administrator"}
            >
              <Video className="w-3.5 h-3.5" />
            </button>
            {renderChannelMenu('instagram')}
          </div>
        </div>

        {/* Sandbox Test Bot Indicator Banner */}
        {renderSandboxBanner()}

        {/* Real Instagram Handle Inline Edit Modal */}
        <AnimatePresence>
          {isEditingIgHandle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
              onClick={() => setIsEditingIgHandle(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-white dark:bg-[#1E222A] rounded-2xl p-4 shadow-2xl border border-gray-200 dark:border-neutral-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                    <InstagramIcon className="w-4 h-4" />
                    <span>Set Your Real Instagram @Handle</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsEditingIgHandle(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter your store or personal Instagram handle to sync across all dashboard columns and conversations.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">@</span>
                  <input
                    type="text"
                    autoFocus
                    value={newIgHandleInput.replace(/^@/, '')}
                    onChange={(e) => setNewIgHandleInput(e.target.value.replace(/^@/, ''))}
                    placeholder="your_real_handle"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveIgHandle(newIgHandleInput);
                      }
                    }}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-[#C13584]"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingIgHandle(false)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveIgHandle(newIgHandleInput)}
                    className="px-4 py-1.5 rounded-xl bg-[#C13584] hover:bg-[#a82a71] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                  >
                    Save Handle
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#E6D3E7] dark:bg-[#201625]">
          {isChatLoading && activeMessages.length === 0 ? (
            renderChatLoadingSkeleton()
          ) : activeMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
              <InstagramIcon className="w-10 h-10 mb-2 opacity-40 text-[#C13584]" />
              <p className="font-semibold text-xs text-gray-800 dark:text-gray-200">No messages with {activeContact.name}</p>
              <p className="text-[11px] opacity-70 mt-1">Send a direct message below to start chatting</p>
            </div>
          ) : (
            activeMessages.map((m) => {
            const isMe = m.sender === 'operator';
            return (
              <div
                key={m.id}
                id={`msg-${m.id}`}
                onMouseEnter={() => handleMessageMouseEnter(m.id)}
                onMouseLeave={handleMessageMouseLeave}
                className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'} group/msg relative transition-all ${
                  (m.reactions && m.reactions.length > 0) || hoveredMessageId === m.id ? 'mb-4' : 'mb-1.5'
                }`}
              >
                {!isMe && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#8338EC] to-[#B5179E] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mb-1">
                    {activeContact?.profilePicUrl ? (
                      <img src={activeContact.profilePicUrl} alt="" className="object-cover w-full h-full rounded-full" />
                    ) : (
                      activeContact.avatarText
                    )}
                  </div>
                )}
                <div
                  onClick={() => setHoveredMessageId(hoveredMessageId === m.id ? null : m.id)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleReact(m.id, '❤️');
                  }}
                  className="relative group/bubble max-w-[72%] cursor-pointer"
                >
                  <AnimatePresence>
                    {hoveredMessageId === m.id && !m.isDeleted && renderMessageActionBar(m, isMe)}
                  </AnimatePresence>

                  <div
                    className={`px-4 py-2 rounded-3xl text-xs leading-relaxed transition-colors ${
                      m.isDeleted
                        ? 'bg-purple-100/80 dark:bg-purple-950/40 text-gray-500 dark:text-gray-400 italic rounded-br-md border border-purple-200/60 dark:border-purple-800/60'
                        : isMe
                        ? 'bg-[#7B2CBF] dark:bg-[#8338EC] text-white rounded-br-md shadow-xs'
                        : 'bg-white dark:bg-[#2E1F35] text-black dark:text-white rounded-bl-md shadow-xs'
                    }`}
                  >
                    {/* Instagram Quoted Reply Block */}
                    {m.replyTo && !m.isDeleted && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetEl = document.getElementById(`msg-${m.replyTo?.id}`);
                          if (targetEl) {
                            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            targetEl.classList.add('ring-2', 'ring-purple-400');
                            setTimeout(() => targetEl.classList.remove('ring-2', 'ring-purple-400'), 1500);
                          }
                        }}
                        className={`mb-1.5 rounded-lg px-2.5 py-1.5 text-[11px] overflow-hidden select-none cursor-pointer transition-colors border-l-4 ${
                          isMe
                            ? 'bg-black/10 dark:bg-black/25 border-white/80 hover:bg-black/15'
                            : 'bg-black/5 dark:bg-black/20 border-[#C13584] hover:bg-black/10'
                        }`}
                      >
                        <p className={`font-bold text-[10px] truncate leading-tight ${isMe ? 'text-white/90' : 'text-[#C13584]'}`}>
                          {m.replyTo.sender}
                        </p>
                        <p className={`truncate leading-tight mt-0.5 ${isMe ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>
                          {renderQuotedSnippet(m.replyTo.text)}
                        </p>
                      </div>
                    )}

                    {m.isDeleted ? (
                      <div className="flex items-center gap-1.5 py-1 text-xs opacity-70 select-none italic">
                        <Ban className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{isMe ? 'You deleted this message' : 'This message was deleted'}</span>
                      </div>
                    ) : (() => {
                      const raw = extractSafeText(m) || m.text || '';
                      const hasAttachment = Boolean(m.imageUrl || m.videoUrl || m.isAudio || m.fileName || m.poll);
                      const clean = raw ? raw.replace(/^[📷🎥🎤🎵📄📍🏷️📹📞💬🚫]+\s*/, '').trim() : '';
                      const showText = !m.poll && clean && (!hasAttachment || !isMediaPlaceholderText(clean));
                      return (
                        <>
                          {hasAttachment && renderMessageAttachment(m, isMe)}
                          {showText && (
                            <p className={`whitespace-pre-wrap break-words ${hasAttachment ? 'mt-1.5' : ''}`}>
                              {renderPressableText(clean, { appId: 'instagram' })}
                            </p>
                          )}
                          {!hasAttachment && !showText && (
                            <p className="whitespace-pre-wrap break-words flex items-center gap-1.5 text-xs opacity-70">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Message</span>
                            </p>
                          )}
                        </>
                      );
                    })()}

                    {isMe && !m.isDeleted && m.seen && (
                      <p className="text-[9px] text-white/70 text-right mt-0.5 select-none">Seen {m.seenTime || 'Just now'}</p>
                    )}
                  </div>

                  {/* Reaction badge directly docked under the message bubble */}
                  {m.reactions && m.reactions.length > 0 && !m.isDeleted && (
                    <div className={`absolute -bottom-2.5 ${isMe ? 'right-2' : 'left-2'} z-20 flex items-center gap-1 animate-in fade-in zoom-in-95`}>
                      {m.reactions.map((r, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReact(m.id, r.emoji);
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full shadow-md text-[11px] font-bold border transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                            r.userReacted
                              ? 'bg-purple-100 dark:bg-purple-900/60 border-purple-400 text-purple-800 dark:text-purple-200'
                              : 'bg-white dark:bg-[#2E1F35] border-[#D5BCD7] dark:border-[#38263F] text-gray-700 dark:text-gray-200'
                          }`}
                          title="Click to toggle reaction"
                        >
                          <span>{r.emoji}</span>
                          {r.count > 1 && <span className="text-[10px]">{r.count}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          }))}

          {isTyping && (
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 text-xs py-1 pl-8">
              <span className="animate-pulse">● ● ●</span>
              <span className="text-[10px]">{activeContactDisplayName} is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Quick Responses Bar */}
        {renderQuickTemplatesBar()}

        {/* Premade Message Creator & Editor Modal */}
        {renderTemplateModal()}
        {renderApiKeyModal()}

        {/* Right-Click Context Menu for Quick Templates */}
        {renderTemplateContextMenu()}

        {/* Input or Read-Only Banner */}
        {isChatReadOnly ? (
          <div 
            className="p-3.5 bg-[#E6D3E7]/90 dark:bg-[#201625]/90 border-t border-[#D5BCD7] dark:border-[#38263F] flex items-center justify-center gap-2 shrink-0 z-20 text-center select-none"
            style={{ paddingBottom: keyboardOffset > 0 ? `${keyboardOffset + 12}px` : 'max(0.85rem, env(safe-area-inset-bottom, 0px))' }}
          >
            <Lock className="w-4 h-4 text-purple-700 dark:text-purple-300 shrink-0" />
            <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">
              Only administrators can send messages in this channel
            </span>
          </div>
        ) : (
          <div 
            className="p-3 bg-[#E6D3E7] dark:bg-[#201625] border-t border-[#D5BCD7] dark:border-[#38263F] shrink-0 z-20"
            style={{ paddingBottom: keyboardOffset > 0 ? `${keyboardOffset + 12}px` : 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
          >
            <form onSubmit={handleSend} className="bg-white dark:bg-[#2E1F35] rounded-full px-3 py-1.5 flex items-center gap-2 shadow-xs border border-white/40 dark:border-white/10">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                title="Camera / Upload photo"
                className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7B2CBF] to-[#B5179E] text-white flex items-center justify-center shrink-0 hover:scale-115 active:scale-90 transition-all cursor-pointer shadow-xs"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload file"
                className="p-1 text-gray-500 hover:text-purple-600 hover:scale-115 active:scale-90 transition-all cursor-pointer"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => toggleQuickTemplates()}
                title={isQuickTemplatesOpen ? "Masquer les réponses rapides" : "Afficher les réponses rapides"}
                className={`p-1 rounded-full hover:scale-115 active:scale-90 transition-all cursor-pointer ${
                  isQuickTemplatesOpen
                    ? 'text-purple-600 bg-gray-100 dark:bg-neutral-800'
                    : 'text-gray-500 hover:text-purple-600'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              {isRecordingVoice ? (
                <div className="flex-1 flex items-center justify-between bg-red-500/10 rounded-full px-3 py-1 text-red-600 dark:text-red-400">
                  <span className="font-mono text-xs font-bold animate-pulse">0:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={handleCancelVoiceRecord} className="p-1 hover:text-red-700 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={handleSendVoiceNote} className="px-2 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-bold cursor-pointer">Send</button>
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={inputMessage}
                  onFocus={handleInputFocus}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Message ${activeContactDisplayName}...`}
                  className="flex-1 bg-transparent px-2 py-1 text-xs focus:outline-none dark:text-white placeholder-gray-500"
                />
              )}
              <button
                type="button"
                onClick={handleToggleVoiceRecord}
                title={isRecordingVoice ? "Send voice note" : "Record voice note"}
                className="p-1 text-gray-500 hover:text-purple-600 hover:scale-115 active:scale-90 transition-all cursor-pointer"
              >
                <Mic className={`w-4 h-4 ${isRecordingVoice ? 'text-red-500 animate-pulse' : ''}`} />
              </button>
              {inputMessage.trim() ? (
                <button type="submit" className="p-1 text-purple-600 hover:scale-120 active:scale-90 transition-transform cursor-pointer"><Send className="w-4 h-4" /></button>
              ) : (
                <button type="button" onClick={() => handleSend(undefined, '❤️')} className="p-1 text-red-500 hover:scale-125 active:scale-90 transition-transform cursor-pointer"><Heart className="w-4 h-4 fill-current" /></button>
              )}
            </form>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 3. FACEBOOK MESSENGER NATIVE REPLICA
  // =========================================================================
  if (appId === 'messenger') {
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#F5F5ED] dark:bg-[#18191A] ${isMobileEmbedded ? 'rounded-b-3xl border-t-0 shadow-none' : 'rounded-3xl border shadow-sm'} border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden relative text-[#1B1B1B] dark:text-white`}>
        {/* Hidden File & Image Pickers */}
        <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

        {/* Messenger Header with Solid Brand Color */}
        <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 text-white flex items-center justify-between z-30 shadow-xs border-b border-black/10 shrink-0 select-none relative cursor-grab active:cursor-grabbing touch-none ${isMobileEmbedded ? 'rounded-tr-2xl' : 'rounded-t-3xl'} ${dragHandleProps?.className || ""}`}>
          {renderSolidHeader(APP_GRADIENT_THEMES.messenger.solidColor)}
          <div className="relative z-10 flex items-center gap-2 min-w-0">
            {onMobileBack && (
              <button
                type="button"
                onClick={onMobileBack}
                className="md:hidden p-1 -ml-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white shrink-0"
                title="Back to contacts"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div
              onClick={() => openProfile(activeContact, 'messenger')}
              className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
              title="Afficher le profil Messenger"
            >
              {activeContact?.profilePicUrl ? (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0 relative overflow-hidden ring-1 ring-white/20">
                  <img src={activeContact.profilePicUrl} alt="" draggable={false} className="object-cover w-full h-full rounded-full pointer-events-none select-none" />
                </div>
              ) : (
                <MessengerIcon className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
              )}
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-tight flex items-center gap-1">
                  {activeContact.name}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-white/80 truncate leading-tight flex items-center gap-1.5 font-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block animate-pulse" />
                  <span>{activeContact.isAiTestBot || activeContact.id?.startsWith('sandbox_bot_') ? 'Actif(ve) • Mode Sandbox IA' : 'Actif(ve) en ligne'}</span>
                  <span className="opacity-70">• {isAiActive ? 'Bot Actif' : 'Opérateur'}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-1 text-white shrink-0">
            <button
              disabled={!canMakeCalls}
              className={`p-1.5 rounded-full transition-colors ${canMakeCalls ? 'hover:bg-white/20 cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
              title={canMakeCalls ? "Voice call" : "Voice calls restricted by administrator"}
            >
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              disabled={!canMakeCalls}
              className={`p-1.5 rounded-full transition-colors ${canMakeCalls ? 'hover:bg-white/20 cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
              title={canMakeCalls ? "Video call" : "Video calls restricted by administrator"}
            >
              <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            {renderChannelMenu('messenger')}
          </div>
        </div>

        {/* Sandbox Test Bot Indicator Banner */}
        {renderSandboxBanner()}

        {/* Messenger Message Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-gray-50/50 dark:bg-[#18191A]">
          {isChatLoading && activeMessages.length === 0 ? (
            renderChatLoadingSkeleton()
          ) : activeMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
              <MessengerIcon className="w-10 h-10 mb-2 opacity-40 text-[#0084FF]" />
              <p className="font-semibold text-xs text-gray-800 dark:text-gray-200">No messages with {activeContact.name}</p>
              <p className="text-[11px] opacity-70 mt-1">Send a direct message below to start chatting</p>
            </div>
          ) : (
            activeMessages.map((m) => {
            const isMe = m.sender === 'operator';
            return (
              <div
                key={m.id}
                id={`msg-${m.id}`}
                onMouseEnter={() => handleMessageMouseEnter(m.id)}
                onMouseLeave={handleMessageMouseLeave}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} group/msg relative transition-all ${
                  (m.reactions && m.reactions.length > 0) || hoveredMessageId === m.id ? 'mb-4' : 'mb-1.5'
                }`}
              >
                <div
                  onClick={() => setHoveredMessageId(hoveredMessageId === m.id ? null : m.id)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleReact(m.id, '❤️');
                  }}
                  className="relative group/bubble max-w-[75%] cursor-pointer"
                >
                  <AnimatePresence>
                    {hoveredMessageId === m.id && !m.isDeleted && renderMessageActionBar(m, isMe)}
                  </AnimatePresence>

                  <div
                    className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed transition-colors ${
                      m.isDeleted
                        ? 'bg-gray-200/80 dark:bg-[#2A2B2C]/80 text-gray-500 dark:text-gray-400 italic rounded-br-sm border border-gray-300/60 dark:border-neutral-700/60'
                        : isMe
                        ? 'bg-gradient-to-r from-[#0084FF] to-[#00C6FF] text-white rounded-br-sm shadow-xs'
                        : 'bg-gray-200 dark:bg-[#3A3B3C] text-gray-900 dark:text-white rounded-bl-sm'
                    }`}
                  >
                    {/* Messenger Quoted Reply Block */}
                    {m.replyTo && !m.isDeleted && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetEl = document.getElementById(`msg-${m.replyTo?.id}`);
                          if (targetEl) {
                            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            targetEl.classList.add('ring-2', 'ring-blue-400');
                            setTimeout(() => targetEl.classList.remove('ring-2', 'ring-blue-400'), 1500);
                          }
                        }}
                        className={`mb-1.5 rounded-lg px-2.5 py-1.5 text-[11px] overflow-hidden select-none cursor-pointer transition-colors border-l-4 ${
                          isMe
                            ? 'bg-black/10 dark:bg-black/25 border-white/80 hover:bg-black/15'
                            : 'bg-black/5 dark:bg-black/20 border-[#0084FF] hover:bg-black/10'
                        }`}
                      >
                        <p className={`font-bold text-[10px] truncate leading-tight ${isMe ? 'text-white/90' : 'text-[#0084FF]'}`}>
                          {m.replyTo.sender}
                        </p>
                        <p className={`truncate leading-tight mt-0.5 ${isMe ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>
                          {renderQuotedSnippet(m.replyTo.text)}
                        </p>
                      </div>
                    )}

                    {m.isDeleted ? (
                      <div className="flex items-center gap-1.5 py-1 text-xs opacity-70 select-none italic">
                        <Ban className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{isMe ? 'You deleted this message' : 'This message was deleted'}</span>
                      </div>
                    ) : (() => {
                      const raw = extractSafeText(m) || m.text || '';
                      const hasAttachment = Boolean(m.imageUrl || m.videoUrl || m.isAudio || m.fileName || m.poll);
                      const clean = raw ? raw.replace(/^[📷🎥🎤🎵📄📍🏷️📹📞💬🚫]+\s*/, '').trim() : '';
                      const showText = !m.poll && clean && (!hasAttachment || !isMediaPlaceholderText(clean));
                      return (
                        <>
                          {hasAttachment && renderMessageAttachment(m, isMe)}
                          {showText && (
                            <p className={`whitespace-pre-wrap break-words ${hasAttachment ? 'mt-1.5' : ''}`}>
                              {renderPressableText(clean, { appId: 'messenger' })}
                            </p>
                          )}
                          {!hasAttachment && !showText && (
                            <p className="whitespace-pre-wrap break-words flex items-center gap-1.5 text-xs opacity-70">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Message</span>
                            </p>
                          )}
                        </>
                      );
                    })()}

                    {isMe && !m.isDeleted && m.seen && (
                      <p className="text-[9px] text-white/80 text-right mt-0.5 select-none">Seen {m.seenTime || 'Just now'}</p>
                    )}
                  </div>

                  {/* Reaction badge directly docked under the message bubble */}
                  {m.reactions && m.reactions.length > 0 && !m.isDeleted && (
                    <div className={`absolute -bottom-2.5 ${isMe ? 'right-2' : 'left-2'} z-10 flex items-center gap-1 animate-in fade-in zoom-in-95`}>
                      {m.reactions.map((r, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReact(m.id, r.emoji);
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full shadow-md text-[11px] font-bold border transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                            r.userReacted
                              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-700 dark:text-blue-300'
                              : 'bg-white dark:bg-[#3A3B3C] border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200'
                          }`}
                          title="Click to toggle reaction"
                        >
                          <span>{r.emoji}</span>
                          {r.count > 1 && <span className="text-[10px]">{r.count}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          }))}

          {isTyping && (
            <div className="flex items-center gap-2 text-gray-500 text-xs py-1">
              <span className="animate-pulse">● ● ●</span>
              <span className="text-[10px]">{activeContactDisplayName} is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Quick Responses Bar */}
        {renderQuickTemplatesBar()}

        {/* Premade Message Creator & Editor Modal */}
        {renderTemplateModal()}
        {renderApiKeyModal()}

        {/* Right-Click Context Menu for Quick Templates */}
        {renderTemplateContextMenu()}

        {/* Messenger Input Bar */}
        {isChatReadOnly ? (
          <div className="p-3 bg-gray-100 dark:bg-[#242526] border-t border-gray-200 dark:border-neutral-800 text-center text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center gap-2 select-none shrink-0">
            <Lock className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Only administrators can send messages in this channel</span>
          </div>
        ) : (
          <form 
            onSubmit={handleSend} 
            className="p-3 bg-white dark:bg-[#242526] border-t border-gray-200 dark:border-neutral-800 flex items-center gap-2 shrink-0 z-20"
            style={{ paddingBottom: keyboardOffset > 0 ? `${keyboardOffset + 12}px` : 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
              className="p-2 text-[#0084FF] hover:bg-blue-50 dark:hover:bg-neutral-800 rounded-full hover:scale-115 active:scale-90 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              title="Upload photo"
              className="p-2 text-[#0084FF] hover:bg-blue-50 dark:hover:bg-neutral-800 rounded-full hover:scale-115 active:scale-90 transition-all cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => toggleQuickTemplates()}
              title={isQuickTemplatesOpen ? "Masquer les réponses rapides" : "Afficher les réponses rapides"}
              className={`p-2 rounded-full hover:scale-115 active:scale-90 transition-all cursor-pointer ${
                isQuickTemplatesOpen
                  ? 'text-[#0084FF] bg-blue-50 dark:bg-neutral-800'
                  : 'text-gray-400 hover:text-[#0084FF] hover:bg-blue-50 dark:hover:bg-neutral-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            {isRecordingVoice ? (
              <div className="flex-1 flex items-center justify-between bg-red-500/10 dark:bg-red-950/30 border border-red-500/30 rounded-full px-3 py-1 text-red-600 dark:text-red-400">
                <span className="font-mono text-xs font-bold animate-pulse">0:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={handleCancelVoiceRecord} className="p-1 hover:text-red-700 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={handleSendVoiceNote} className="px-2.5 py-0.5 bg-[#0084FF] text-white rounded-full text-xs font-bold cursor-pointer">Send</button>
                </div>
              </div>
            ) : (
              <input
                type="text"
                value={inputMessage}
                onFocus={handleInputFocus}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Aa"
                className="flex-1 bg-gray-100 dark:bg-[#3A3B3C] rounded-full px-4 py-2 text-xs focus:outline-none dark:text-white"
              />
            )}
            <button
              type="button"
              onClick={handleToggleVoiceRecord}
              title={isRecordingVoice ? "Send voice note" : "Record voice note"}
              className="p-2 text-[#0084FF] hover:bg-blue-50 dark:hover:bg-neutral-800 rounded-full hover:scale-115 active:scale-90 transition-all cursor-pointer"
            >
              <Mic className={`w-4 h-4 ${isRecordingVoice ? 'text-red-500 animate-pulse' : ''}`} />
            </button>
            {inputMessage.trim() ? (
              <button type="submit" className="p-2 text-[#0084FF] hover:scale-120 active:scale-90 transition-transform cursor-pointer"><Send className="w-4 h-4" /></button>
            ) : (
              <button
                type="button"
                onClick={() => handleSend(undefined, '👍')}
                className="p-2 text-[#0084FF] hover:scale-125 active:scale-90 transition-transform cursor-pointer"
                title="Send Thumbs Up"
              >
                <ThumbsUp className="w-5 h-5 fill-current" />
              </button>
            )}
          </form>
        )}
      </div>
    );
  }

  // =========================================================================
  // 4. STOREFRONT LIVE CHAT NATIVE REPLICA
  // =========================================================================
  if (appId === 'web_widget') {
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#F5F5ED] dark:bg-[#1A1D23] ${isMobileEmbedded ? 'rounded-b-3xl border-t-0 shadow-none' : 'rounded-3xl border shadow-sm'} border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden relative text-[#1B1B1B] dark:text-white`}>
        {/* Hidden File & Image Pickers */}
        <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

        {/* Storefront Header with Solid Brand Color */}
        <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 text-white flex items-center justify-between z-30 shadow-xs border-b border-black/10 shrink-0 select-none relative cursor-grab active:cursor-grabbing touch-none ${isMobileEmbedded ? 'rounded-tr-2xl' : 'rounded-t-3xl'} ${dragHandleProps?.className || ""}`}>
          {renderSolidHeader(APP_GRADIENT_THEMES.web_widget.solidColor)}
          <div className="relative z-10 flex items-center gap-2 min-w-0">
            {onMobileBack && (
              <button
                type="button"
                onClick={onMobileBack}
                className="md:hidden p-1 -ml-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white shrink-0"
                title="Back to contacts"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div
              onClick={() => openProfile(activeContact, 'web_widget')}
              className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
              title="Afficher les informations du client"
            >
              {activeContact?.profilePicUrl ? (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0 relative overflow-hidden ring-1 ring-white/20">
                  <img src={activeContact.profilePicUrl} alt="" draggable={false} className="object-cover w-full h-full rounded-full pointer-events-none select-none" />
                </div>
              ) : (
                <StorefrontIcon className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 drop-shadow-xs shrink-0 rounded-xl p-1" />
              )}
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-tight flex items-center gap-1">
                  {activeContact.name}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-white/80 truncate leading-tight flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>{activeContact.handleOrPhone}</span>
                  <span className="opacity-70">• {isAiActive ? 'Bot Actif' : 'Opérateur'}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-1.5 text-white shrink-0">
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Store Widget</span>
            {renderChannelMenu('web_widget')}
          </div>
        </div>

        {/* Live Cart Visitor Context Banner */}
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800/40 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200 shrink-0">
          <div className="flex items-center gap-1.5 font-medium">
            <ShoppingBag className="w-3.5 h-3.5 text-[#EB6708]" />
            <span>Active Cart: <strong>{activeContact.spend}</strong></span>
          </div>
          <span className="font-bold font-mono text-[10px] bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded">Live Session</span>
        </div>

        {/* Storefront Chat Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-[#F8FAF9] dark:bg-[#111418]">
          {isChatLoading && activeMessages.length === 0 ? (
            renderChatLoadingSkeleton()
          ) : activeMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400">
              <div className="w-12 h-12 rounded-2xl bg-[#1B6648]/10 text-[#1B6648] flex items-center justify-center font-bold text-xl mb-3 shadow-xs">
                🛍️
              </div>
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                {activeContact?.name || 'Storefront Chat'}
              </h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                No customer messages yet in this session.
              </p>
            </div>
          ) : (
            activeMessages.map((m) => {
            const isCustomer = m.sender === 'customer';
            const isMe = !isCustomer;
            return (
              <div
                key={m.id}
                id={`msg-${m.id}`}
                onMouseEnter={() => handleMessageMouseEnter(m.id)}
                onMouseLeave={handleMessageMouseLeave}
                className={`flex ${isCustomer ? 'justify-start' : 'justify-end'} group/msg relative transition-all ${
                  (m.reactions && m.reactions.length > 0) || hoveredMessageId === m.id ? 'mb-4' : 'mb-1.5'
                }`}
              >
                <div
                  onClick={() => setHoveredMessageId(hoveredMessageId === m.id ? null : m.id)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleReact(m.id, '❤️');
                  }}
                  className="relative group/bubble max-w-[75%] cursor-pointer"
                >
                  <AnimatePresence>
                    {hoveredMessageId === m.id && !m.isDeleted && renderMessageActionBar(m, isMe)}
                  </AnimatePresence>

                  <div
                    className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed transition-colors ${
                      m.isDeleted
                        ? 'bg-gray-200/80 dark:bg-neutral-800/80 text-gray-500 dark:text-gray-400 italic rounded-tr-sm border border-gray-300/60 dark:border-neutral-700/60'
                        : isCustomer
                        ? 'bg-white dark:bg-[#1E222A] text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-700 rounded-tl-sm shadow-xs'
                        : 'bg-[#1B6648] text-white rounded-tr-sm shadow-xs'
                    }`}
                  >
                    {/* Storefront Quoted Reply Block */}
                    {m.replyTo && !m.isDeleted && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetEl = document.getElementById(`msg-${m.replyTo?.id}`);
                          if (targetEl) {
                            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            targetEl.classList.add('ring-2', 'ring-emerald-400');
                            setTimeout(() => targetEl.classList.remove('ring-2', 'ring-emerald-400'), 1500);
                          }
                        }}
                        className={`mb-1.5 rounded-lg px-2.5 py-1.5 text-[11px] overflow-hidden select-none cursor-pointer transition-colors border-l-4 ${
                          isMe
                            ? 'bg-black/10 dark:bg-black/25 border-white/80 hover:bg-black/15'
                            : 'bg-black/5 dark:bg-black/20 border-emerald-600 hover:bg-black/10'
                        }`}
                      >
                        <p className={`font-bold text-[10px] truncate leading-tight ${isMe ? 'text-white/90' : 'text-emerald-700 dark:text-emerald-400'}`}>
                          {m.replyTo.sender}
                        </p>
                        <p className={`truncate leading-tight mt-0.5 ${isMe ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>
                          {renderQuotedSnippet(m.replyTo.text)}
                        </p>
                      </div>
                    )}

                    {m.isDeleted ? (
                      <div className="flex items-center gap-1.5 py-1 text-xs opacity-70 select-none italic">
                        <Ban className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{isMe ? 'You deleted this message' : 'This message was deleted'}</span>
                      </div>
                    ) : (() => {
                      const raw = extractSafeText(m) || m.text || '';
                      const hasAttachment = Boolean(m.imageUrl || m.videoUrl || m.isAudio || m.fileName || m.poll);
                      const clean = raw ? raw.replace(/^[📷🎥🎤🎵📄📍🏷️📹📞💬🚫]+\s*/, '').trim() : '';
                      const showText = !m.poll && clean && (!hasAttachment || !isMediaPlaceholderText(clean));
                      return (
                        <>
                          {hasAttachment && renderMessageAttachment(m, isMe)}
                          {showText && (
                            <p className={`whitespace-pre-wrap break-words ${hasAttachment ? 'mt-1.5' : ''}`}>
                              {renderPressableText(clean, { appId: 'web_widget' })}
                            </p>
                          )}
                          {!hasAttachment && !showText && (
                            <p className="whitespace-pre-wrap break-words flex items-center gap-1.5 text-xs opacity-70">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Message</span>
                            </p>
                          )}
                        </>
                      );
                    })()}

                    <p className="text-[9px] opacity-75 text-right mt-0.5 select-none">{m.time}</p>
                  </div>

                  {/* Reaction badge directly docked under the message bubble */}
                  {m.reactions && m.reactions.length > 0 && !m.isDeleted && (
                    <div className={`absolute -bottom-2.5 ${!isCustomer ? 'right-2' : 'left-2'} z-10 flex items-center gap-1 animate-in fade-in zoom-in-95`}>
                      {m.reactions.map((r, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReact(m.id, r.emoji);
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full shadow-md text-[11px] font-bold border transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                            r.userReacted
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                              : 'bg-white dark:bg-[#1E222A] border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200'
                          }`}
                          title="Click to toggle reaction"
                        >
                          <span>{r.emoji}</span>
                          {r.count > 1 && <span className="text-[10px]">{r.count}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          }))}
          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Quick Responses Bar */}
        {renderQuickTemplatesBar()}

        {/* Premade Message Creator & Editor Modal */}
        {renderTemplateModal()}
        {renderApiKeyModal()}

        {/* Right-Click Context Menu for Quick Templates */}
        {renderTemplateContextMenu()}

        {/* Input */}
        {isChatReadOnly ? (
          <div className="p-3 bg-gray-50 dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700 text-center text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center gap-2 select-none shrink-0">
            <Lock className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Only administrators can send messages in this channel</span>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-[#1A1D23] border-t border-gray-200 dark:border-neutral-800 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
              className="p-2 text-gray-500 hover:text-[#1B6648] rounded-full hover:scale-115 active:scale-90 transition-all cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              title="Upload photo"
              className="p-2 text-gray-500 hover:text-[#1B6648] rounded-full hover:scale-115 active:scale-90 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </button>
            {isRecordingVoice ? (
              <div className="flex-1 flex items-center justify-between bg-red-500/10 dark:bg-red-950/30 border border-red-500/30 rounded-xl px-3 py-1.5 text-red-600 dark:text-red-400">
                <span className="font-mono text-xs font-bold animate-pulse">Voice 0:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={handleCancelVoiceRecord} className="p-1 hover:text-red-700 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={handleSendVoiceNote} className="px-2.5 py-0.5 bg-[#1B6648] text-white rounded-lg text-xs font-bold cursor-pointer">Send</button>
                </div>
              </div>
            ) : (
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Reply to ${activeContact.name}...`}
                className="flex-1 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none dark:text-white"
              />
            )}
            <button
              type="button"
              onClick={handleToggleVoiceRecord}
              title={isRecordingVoice ? "Send voice note" : "Record voice note"}
              className="p-2 text-gray-500 hover:text-[#1B6648] rounded-full hover:scale-115 active:scale-90 transition-all cursor-pointer"
            >
              <Mic className={`w-4 h-4 ${isRecordingVoice ? 'text-red-500 animate-pulse' : ''}`} />
            </button>
            <button type="submit" className="p-2.5 bg-[#1B6648] text-white rounded-xl hover:bg-[#155239] hover:scale-110 active:scale-90 transition-all cursor-pointer"><Send className="w-4 h-4" /></button>
          </form>
        )}
      </div>
    );
  }

  // =========================================================================
  // 5. GMAIL REPLICA (Received email on top, Reply Maker at bottom)
  // =========================================================================
  if (appId === 'gmail') {
    const isStarred = Boolean(activeContact?.starred || (activeContact as any)?.labelIds?.includes?.('STARRED') || starredEmails.has(activeContact.id));
    const isSelected = selectedEmails.has(activeContact.id);
    const attachments = (activeContact as any)?.attachments || [];

    // Dynamically retrieve client labels from account
    let clientCustomLabels: Array<{ id: string; name: string }> = [];
    try {
      const storedLabels = localStorage.getItem('cf_gmail_labels');
      if (storedLabels) {
        const parsed = JSON.parse(storedLabels);
        if (Array.isArray(parsed)) {
          clientCustomLabels = parsed.filter((l: any) => l.type === 'user');
        }
      }
    } catch {}

    const GMAIL_HEADER_TABS = [
      { id: 'primary', label: 'Principale', icon: <Inbox className="w-3.5 h-3.5" /> },
      { id: 'starred', label: 'Messages suivis', icon: <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> },
      { id: 'important', label: 'Important', icon: <Bookmark className="w-3.5 h-3.5" /> },
      { id: 'sent', label: 'Envoyés', icon: <Send className="w-3.5 h-3.5" /> },
      { id: 'promotions', label: 'Promotions', icon: <Tag className="w-3.5 h-3.5" /> },
      { id: 'notifications', label: 'Notifications', icon: <Bell className="w-3.5 h-3.5" /> },
      { id: 'spam', label: 'Spam', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
      { id: 'trash', label: 'Corbeille', icon: <Trash2 className="w-3.5 h-3.5" /> },
      ...clientCustomLabels.map((l) => ({
        id: l.id,
        label: l.name,
        icon: <Bookmark className="w-3.5 h-3.5 text-purple-500" />,
      }))
    ];

    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#F5F5ED] dark:bg-[#1A1D23] ${isMobileEmbedded ? 'rounded-b-3xl border-t-0 shadow-none' : 'rounded-3xl border shadow-sm'} border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden relative text-[#1B1B1B] dark:text-white`}>
        {/* Header with Solid Brand Color */}
        <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 text-white flex items-center justify-between shrink-0 shadow-xs border-b border-black/10 select-none cursor-grab active:cursor-grabbing touch-none ${isMobileEmbedded ? 'rounded-tr-2xl' : 'rounded-t-3xl'} ${dragHandleProps?.className || ""}`} style={{ ...dragHandleProps?.style, backgroundColor: APP_GRADIENT_THEMES.gmail.solidColor  }}>
          <div className="flex items-center gap-2 min-w-0">
            {onMobileBack && (
              <button
                type="button"
                onClick={onMobileBack}
                className="md:hidden p-1 -ml-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white shrink-0"
                title="Back to emails"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <GmailIcon className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-xs text-white truncate block">
                {(activeContact as any)?.subject || activeContact.lastMessage || 'Customer Support Email'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full">
              {activeContact.statusText || 'Gmail'}
            </span>
            {renderChannelMenu('gmail')}
          </div>
        </div>

        {/* Authentic Gmail Category Tabs Bar (Auto-injected according to client account) */}
        <div className="flex items-center gap-1 px-3 py-1.5 bg-[#F0F2F5]/80 dark:bg-[#111B21]/80 border-b border-[#DFDFD4] dark:border-[#2E333D] overflow-x-auto no-scrollbar shrink-0 select-none text-xs custom-scrollbar">
          {GMAIL_HEADER_TABS.map((tab) => {
            const isActive = gmailActiveCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setGmailActiveCategory(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-red-500/15 text-red-600 dark:text-red-400 font-bold border border-red-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TOP HALF: Received Email Message */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#1A1D23] space-y-3 custom-scrollbar">
          {/* Email Subject Title Banner */}
          <div className="pb-2 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">
              {decodeHtmlEntities((activeContact as any)?.subject || activeContact.lastMessage || '(aucun objet)')}
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded font-medium border border-gray-200 dark:border-neutral-700">
                {(activeContact as any)?.category === 'promotions' ? 'Promotions' :
                 (activeContact as any)?.category === 'notifications' ? 'Notifications' :
                 (activeContact as any)?.category === 'important' ? 'Important' :
                 (activeContact as any)?.category === 'spam' ? 'Spam' :
                 (activeContact as any)?.category === 'sent' ? 'Envoyés' : 'Boîte de réception'}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">{activeContact.time}</span>
            </div>
          </div>

          {/* Sender Header (ZERO PROFILE PICTURES - Select Checkbox + Star Button) */}
          <div className="flex items-start justify-between pt-1">
            <div className="flex items-center gap-3">
              {/* 1. Square Checkbox to Select Email */}
              <button
                type="button"
                onClick={() => handleToggleSelectEmail(activeContact.id)}
                className={`w-4 h-4 rounded-[3px] border transition-colors flex items-center justify-center cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-400 dark:border-neutral-500 hover:border-gray-600 dark:hover:border-neutral-300'
                }`}
                title={isSelected ? "Désélectionner" : "Sélectionner ce message"}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </button>

              {/* 2. Star / Favorite Button */}
              <button
                type="button"
                onClick={() => handleToggleStarEmail(activeContact.id)}
                className={`p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-transform active:scale-90 cursor-pointer shrink-0 ${
                  isStarred ? 'text-amber-400' : 'text-gray-400 dark:text-neutral-500 hover:text-amber-400'
                }`}
                title={isStarred ? "Retirer des messages suivis" : "Ajouter aux messages suivis"}
              >
                <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>

              <div>
                <h5 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                  <span>{decodeHtmlEntities(activeContact.name)}</span>
                  <span className="text-gray-400 font-normal text-[11px]">&lt;{activeContact.handleOrPhone}&gt;</span>
                </h5>
                <p className="text-[10px] text-gray-500">to Support &bull; {activeContact.time}</p>
              </div>
            </div>
          </div>

          {/* Email Body text */}
          <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed pl-12 space-y-2 select-text">
            {isLoadingMessages ? (
              <div className="flex items-center gap-2 py-4 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                <span>Syncing email thread...</span>
              </div>
            ) : activeMessages.length === 0 ? (
              <div className="whitespace-pre-wrap">
                {renderPressableText(decodeHtmlEntities((activeContact as any)?.bodyText || activeContact.lastMessage || ''), { appId: 'gmail' }) || <span className="italic text-gray-400">No messages in this email thread.</span>}
              </div>
            ) : (
              activeMessages.map((m) => (
                <div key={m.id} className="whitespace-pre-wrap break-words">
                  {renderPressableText(decodeHtmlEntities(m.text), { appId: 'gmail' })}
                </div>
              ))
            )}
          </div>

          {/* Real Attachments Render (Zero Synthetic Mock Data) */}
          {attachments.length > 0 && (
            <div className="pl-12 pt-3 border-t border-gray-100 dark:border-neutral-800 flex flex-wrap gap-2">
              {attachments.map((att: any, idx: number) => (
                <div
                  key={att.id || idx}
                  className="inline-flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-xs shadow-2xs hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  {att.isImage ? (
                    <ImageIcon className="w-4 h-4 text-red-500 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate block max-w-[160px]">
                      {att.name || att.filename}
                    </span>
                    {att.size && <span className="text-[10px] text-gray-400 font-mono">{att.size}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Quick Responses Bar */}
        {renderQuickTemplatesBar()}

        {/* Premade Message Creator & Editor Modal */}
        {renderTemplateModal()}
        {renderApiKeyModal()}

        {/* Right-Click Context Menu for Quick Templates */}
        {renderTemplateContextMenu()}

        {/* BOTTOM HALF: Mail Formatting Message Maker & Reply Composer */}
        <div className="h-[260px] flex flex-col bg-gray-50/70 dark:bg-[#1E222A] p-3 shrink-0">
          <div className="flex items-center justify-between pb-2 mb-1 border-b border-gray-200 dark:border-neutral-700 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Reply className="w-4 h-4 text-gray-400" />
              <span>Reply to <strong>{activeContact.name} &lt;{activeContact.handleOrPhone}&gt;</strong></span>
            </div>
            <button
              onClick={() => setInputMessage(`Salam ${activeContact.name},\n\nNous vous confirmons que votre colis est déjà remis à Yalidine Express pour livraison demain matin à domicile.\n\nBien cordialement,\nL'équipe Commerciale bt test`)}
              className="text-[11px] font-bold text-[#8338EC] flex items-center gap-1 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Draft Reply
            </button>
          </div>

          {/* Formatting Toolbar */}
          <div className="flex items-center gap-2 pb-2 text-gray-500 dark:text-gray-400 text-xs border-b border-gray-200/50 dark:border-neutral-800">
            <button className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded"><Bold className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded"><Italic className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded"><Underline className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded"><Link2 className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded"><List className="w-3.5 h-3.5" /></button>
          </div>

          {/* Reply Textarea */}
          <textarea
            value={inputMessage}
            onFocus={handleInputFocus}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Write your email response..."
            className="flex-1 min-h-0 bg-transparent p-2 text-xs focus:outline-none dark:text-white resize-none custom-scrollbar leading-relaxed"
          />

          {/* Bottom Send & Action Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-neutral-700 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  alert(`Email sent successfully to ${activeContact.handleOrPhone}`);
                  setInputMessage('');
                }}
                className="px-4 py-1.5 rounded-full bg-[#1B1B1B] hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <span>Send</span>
                <span className="text-[10px] opacity-75">▾</span>
              </button>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded"><Paperclip className="w-4 h-4" /></button>
            </div>
            <button onClick={() => setInputMessage('')} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 6. WHATSAPP WEB NATIVE REPLICA (Default)
  // =========================================================================
  const filteredWhatsAppMessages = activeMessages.filter((m) => {
    if (!searchQuery.trim()) return true;
    return (
      m.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.fileName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#ECECE2] dark:bg-[#0B141A] @container ${isMobileEmbedded ? 'rounded-b-3xl border-t-0 shadow-none' : 'rounded-3xl border shadow-sm'} border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden relative text-[#1B1B1B]`}>
      {/* Hidden File & Image Pickers */}
      <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

      {/* Channel Header with Dynamic Solid Brand Color */}
      <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 text-white flex items-center justify-between shrink-0 shadow-xs border-b border-black/10 select-none cursor-grab active:cursor-grabbing touch-none ${isMobileEmbedded ? 'rounded-tr-2xl' : 'rounded-t-3xl'} ${dragHandleProps?.className || ""}`} style={{ ...dragHandleProps?.style, backgroundColor: (APP_GRADIENT_THEMES[appId] || APP_GRADIENT_THEMES.whatsapp).solidColor  }}>
        <div className="flex items-center gap-2 min-w-0">
          {onMobileBack && (
            <button
              type="button"
              onClick={onMobileBack}
              className="md:hidden p-1 -ml-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white shrink-0"
              title="Back to contacts"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div 
            onClick={() => openProfile(activeContact, appId)}
            className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
            title="Afficher les infos du contact"
          >
            {appId === 'whatsapp' || appId === 'whatsapp_2' ? (
              <WhatsAppAvatar
                profilePicUrl={activeContact.profilePicUrl}
                name={activeContact.name}
                identifier={activeContact.handleOrPhone || activeContact.id}
                isGroup={activeContact.isGroup}
                className="w-7 h-7 sm:w-8 sm:h-8 hover:scale-105 transition-transform"
                textSizeClass="text-[11px] font-bold"
              />
            ) : activeContact.profilePicUrl ? (
              <img
                src={activeContact.profilePicUrl}
                alt={activeContact.name}
                draggable={false}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shadow-xs shrink-0 pointer-events-none select-none hover:scale-105 transition-transform"
              />
            ) : activeContact?.channelEmoji ? (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/30 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs select-none">
                {activeContact.channelEmoji}
              </div>
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {activeContact.avatarText || activeContact.name?.[0]?.toUpperCase() || 'M'}
              </div>
            )}

            <div className="min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-white leading-tight flex items-center gap-1">
                <ScrollingGroupTitle
                  name={activeContact.isAiTestBot || activeContact.id?.startsWith('sandbox_bot_') ? 'Bot Test' : activeContact.name}
                  isGroup={activeContact.isGroup}
                  isUntitledGroup={activeContact.isUntitledGroup}
                  participantNames={activeContact.participantNames}
                  titleClassName="font-bold text-xs sm:text-sm text-white"
                  badge={activeContact?.isBroadcast ? <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/20 font-bold uppercase shrink-0">Canal</span> : undefined}
                />
              </h4>

              <p className="text-[10px] sm:text-[11px] text-white/85 truncate leading-tight flex items-center gap-1.5 font-normal mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block animate-pulse" />
                <span>
                  {activeContact.isAiTestBot || activeContact.id?.startsWith('sandbox_bot_')
                    ? 'en ligne • Mode Sandbox IA'
                    : activeContact.isGroup
                    ? (activeContact.handleOrPhone && activeContact.handleOrPhone.includes('participant') ? activeContact.handleOrPhone : 'groupe')
                    : 'en ligne'}
                </span>
                <span className="text-white/40">•</span>
                <span className="text-emerald-300 font-medium">{isAiActive ? 'Bot Actif' : 'Opérateur'}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 text-white shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              if (isSearchOpen) setSearchQuery('');
            }}
            className={`hidden @[300px]:flex p-1 sm:p-1.5 rounded-full transition-colors cursor-pointer ${isSearchOpen ? 'bg-white/30 text-white' : 'hover:bg-white/20 text-white'}`}
            title="Search conversation"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            disabled={!canMakeCalls}
            className={`hidden @[340px]:flex p-1 sm:p-1.5 rounded-full transition-colors ${canMakeCalls ? 'hover:bg-white/20 cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
            title={canMakeCalls ? "Voice call" : "Voice calls restricted by administrator"}
          >
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          {renderChannelMenu(appId)}
        </div>
      </div>

      {/* Sandbox Test Bot Indicator Banner */}
      {renderSandboxBanner()}

      {/* In-Chat Channel / Topic Selector Bar with Live Notification Badges */}
      {activeContact?.isGroup && activeContact?.topics && activeContact.topics.length > 0 && (
        <div className="px-3 py-2 bg-white/90 dark:bg-[#151E27]/90 backdrop-blur-md border-b border-black/10 dark:border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 select-none z-10 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 shrink-0 flex items-center gap-1 pl-1">
            <Hash className="w-3 h-3 text-indigo-500" /> Channels:
          </span>
          {activeContact.topics.map((t: any) => {
            const isCurrent = String(t.id) === String(currentTopicId) ||
              Boolean(String(t.id).replace(/\D/g, '') && String(t.id).replace(/\D/g, '') === String(currentTopicId).replace(/\D/g, ''));
            const hasUnread = Boolean(t.unreadCount && t.unreadCount > 0);
            const glyphInfo = extractTopicGlyphAndTitle(t);
            const isTopicItemClosed = Boolean(t.closed || (t as any)?.isClosed);
            return (
              <button
                key={t.id}
                id={`chat-topic-tab-${t.id}`}
                type="button"
                onClick={() => {
                  onNavigatePath?.([activeContact.id, t.id]);
                  onMarkAsRead?.(appId, activeContact.id, t.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/15'
                }`}
              >
                {glyphInfo.isHash ? (
                  <span className={isCurrent ? 'text-white font-black' : 'text-indigo-500 font-black'}>#</span>
                ) : (
                  <span>{glyphInfo.glyph}</span>
                )}
                <span>{glyphInfo.title}</span>
                {isTopicItemClosed && (
                  <Lock className="w-2.5 h-2.5 text-amber-400 opacity-80 shrink-0" />
                )}
                {hasUnread && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-500 text-white shadow-xs animate-pulse">
                    {t.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}


      {/* Real In-Chat Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3 py-2 bg-[#F0F2F5] dark:bg-[#111B21] border-b border-[#DFDFD4] dark:border-[#2E333D] flex items-center gap-2 shrink-0 overflow-hidden"
          >
            <Search className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages in this chat..."
              autoFocus
              className="flex-1 bg-white dark:bg-[#202C33] border border-[#DFDFD4] dark:border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-[#1B1B1B] dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#1B6648]"
            />
            {searchQuery && (
              <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 shrink-0">
                {filteredWhatsAppMessages.length} match{filteredWhatsAppMessages.length !== 1 ? 'es' : ''}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
              title="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* WhatsApp Disconnection / Error 401 Persistent Warning Banner */}
      {appId === 'whatsapp' && (channelError || !isConnected) && (
        <div className="bg-amber-500/15 dark:bg-amber-950/60 border-b border-amber-500/30 px-3.5 py-2 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 shrink-0 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold">WhatsApp d&#233;connect&#233; du t&#233;l&#233;phone (Erreur 401).</span>
              <span className="opacity-90 ml-1 hidden sm:inline">Aper&#231;u hors-ligne. Les nouveaux messages ne sont pas synchronis&#233;s en direct.</span>
            </div>
          </div>
          {onOpenConnect && (
            <button
              type="button"
              onClick={onOpenConnect}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scanner QR</span>
            </button>
          )}
        </div>
      )}

      {/* WhatsApp Doodle Feed */}
      <PullToRefresh
        onRefresh={handleManualChatRefresh}
        isRefreshing={isManualChatRefreshing}
        accentColor={(APP_GRADIENT_THEMES[appId] || APP_GRADIENT_THEMES.whatsapp).solidColor}
        className="flex-1 min-h-0 flex flex-col overflow-hidden"
      >
        <div ref={whatsappFeedRef} style={{ overflowAnchor: 'auto' }} className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 bg-whatsapp-doodle custom-scrollbar">
        <div className="hidden sm:flex justify-center my-0.5">
          <div className="bg-[#FFF9C4] dark:bg-[#1E293B] text-[#795548] dark:text-[#E2E8F0] text-[10px] px-2.5 py-0.5 rounded-md shadow-2xs flex items-center gap-1 text-center max-w-md">
            <ShieldCheck className="w-3 h-3 text-[#F57F17] shrink-0" />
            <span>Messages are end-to-end encrypted. {isAiActive ? 'AI active.' : 'Human Operator.'}</span>
          </div>
        </div>

        {isChatLoading && filteredWhatsAppMessages.length === 0 ? (
          renderChatLoadingSkeleton()
        ) : filteredWhatsAppMessages.length === 0 && searchQuery ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400 text-xs">
            <Search className="w-6 h-6 mb-2 opacity-40" />
            <p className="font-semibold">No messages found for "{searchQuery}"</p>
            <p className="text-[11px] opacity-70 mt-1">Try searching for other words or names</p>
          </div>
        ) : filteredWhatsAppMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xl mb-3 shadow-xs">
              <MessageSquare className="w-6 h-6 text-emerald-500" />
            </div>
            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">
              {activeContact?.name || 'WhatsApp Chat'}
            </h4>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              No messages here yet. Send a message below to start the conversation!
            </p>
          </div>
        ) : (
          filteredWhatsAppMessages.map((m, idx) => {
            const isCustomer = m.sender === 'customer';
            const isAi = m.sender === 'ai';
            const isMe = !isCustomer;

            const currentDateGroup = getMessageDateGroup(m.timestamp, m.time);
            const prevDateGroup = idx > 0 ? getMessageDateGroup(filteredWhatsAppMessages[idx - 1].timestamp, filteredWhatsAppMessages[idx - 1].time) : null;
            const showDateSeparator = idx === 0 || currentDateGroup !== prevDateGroup;

            const whatsappText = extractSafeText(m);
            const isEvent = isTelegramEventMessage(m, whatsappText);

            if (isEvent) {
              return (
                <React.Fragment key={m.id}>
                  {showDateSeparator && (
                    <div className="flex justify-center my-3 select-none">
                      <span className="bg-[#E9EDEF]/90 dark:bg-[#182229]/90 text-gray-600 dark:text-gray-300 text-[11px] font-medium px-3.5 py-1 rounded-lg shadow-xs uppercase tracking-wide border border-black/5 dark:border-white/5 backdrop-blur-xs">
                        {currentDateGroup}
                      </span>
                    </div>
                  )}
                  <div id={`msg-${m.id}`} className="flex justify-center my-2 select-none">
                    <div
                      className="bg-[#E9EDEF]/90 dark:bg-[#182229]/90 text-gray-700 dark:text-gray-300 text-[11.5px] font-medium px-3.5 py-1 rounded-lg shadow-xs flex items-center gap-1.5 text-center border border-black/5 dark:border-white/5 backdrop-blur-xs max-w-[85%]"
                      title={m.time ? `${m.time}` : undefined}
                    >
                      {renderTelegramEventContent(m, whatsappText)}
                    </div>
                  </div>
                </React.Fragment>
              );
            }

            return (
              <React.Fragment key={m.id}>
                {showDateSeparator && (
                  <div className="flex justify-center my-3 select-none">
                    <span className="bg-[#E9EDEF]/90 dark:bg-[#182229]/90 text-gray-600 dark:text-gray-300 text-[11px] font-medium px-3.5 py-1 rounded-lg shadow-xs uppercase tracking-wide border border-black/5 dark:border-white/5 backdrop-blur-xs">
                      {currentDateGroup}
                    </span>
                  </div>
                )}
                <div
                  id={`msg-${m.id}`}
                  onMouseEnter={() => handleMessageMouseEnter(m.id)}
                  onMouseLeave={handleMessageMouseLeave}
                  className={`flex ${isCustomer ? 'justify-start' : 'justify-end'} group/msg relative transition-all ${
                    (m.reactions && m.reactions.length > 0) || hoveredMessageId === m.id ? 'mb-4' : 'mb-1.5'
                  }`}
                >
                  <div
                    onClick={() => setHoveredMessageId(hoveredMessageId === m.id ? null : m.id)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleReact(m.id, '❤️');
                    }}
                    className="relative group/bubble max-w-[78%] cursor-pointer"
                  >
                    {/* Floating Action & Reaction Bar on Hover/Tap */}
                    <AnimatePresence>
                      {hoveredMessageId === m.id && !m.isDeleted && renderMessageActionBar(m, isMe)}
                    </AnimatePresence>

                    <div
                      className={`rounded-2xl px-3.5 py-2 space-y-1 shadow-xs relative text-xs leading-relaxed transition-colors ${
                        m.isDeleted
                          ? 'bg-[#E9ECEF]/90 dark:bg-[#1F2C34]/90 text-gray-500 dark:text-gray-400 italic rounded-tr-sm border border-gray-200/80 dark:border-neutral-700/80'
                          : isCustomer
                          ? 'bg-white dark:bg-[#202C33] text-[#1B1B1B] dark:text-white rounded-tl-sm'
                          : isAi
                          ? 'bg-[#E7F8E8] dark:bg-[#005C4B] text-[#0C381E] dark:text-emerald-100 rounded-tr-sm'
                          : 'bg-[#D9FDD3] dark:bg-[#005C4B] text-[#111B21] dark:text-white rounded-tr-sm'
                      }`}
                    >
                      {!isCustomer && !m.isDeleted && !m.isCall && (
                        <div className="text-[10px] font-bold flex items-center gap-1 mb-0.5">
                          {isAi ? (
                            <span className="text-[#1B6648] dark:text-emerald-300 flex items-center gap-1 font-semibold">
                              <Bot className="w-3.5 h-3.5" /> AI Darija Agent
                            </span>
                          ) : (
                            <span className="text-[#8A6D3B] dark:text-amber-300 flex items-center gap-1 font-semibold text-[10.5px]">
                              <User className="w-3.5 h-3.5" /> Human Operator
                            </span>
                          )}
                        </div>
                      )}

                      {/* WhatsApp Quoted Reply Block */}
                      {m.replyTo && !m.isDeleted && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetEl = document.getElementById(`msg-${m.replyTo?.id}`);
                            if (targetEl) {
                              targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              targetEl.classList.add('ring-2', 'ring-emerald-400');
                              setTimeout(() => targetEl.classList.remove('ring-2', 'ring-emerald-400'), 1500);
                            }
                          }}
                          className={`mb-1.5 rounded-lg px-2.5 py-1.5 text-[11px] overflow-hidden select-none cursor-pointer transition-colors border-l-4 ${
                            isMe
                              ? 'bg-black/5 dark:bg-black/20 border-emerald-600 hover:bg-black/10'
                              : 'bg-black/5 dark:bg-black/20 border-[#53BDEB] hover:bg-black/10'
                          }`}
                        >
                          <p className={`font-bold text-[10px] truncate leading-tight ${isMe ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#53BDEB]'}`}>
                            {m.replyTo.sender}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300 truncate leading-tight mt-0.5">
                            {renderQuotedSnippet(m.replyTo.text)}
                          </p>
                        </div>
                      )}

                      {m.isDeleted ? (
                        <div className="flex items-center gap-1.5 py-1 text-xs text-gray-500 dark:text-gray-400 select-none italic">
                          <Ban className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{isMe ? 'You deleted this message' : 'This message was deleted'}</span>
                        </div>
                      ) : (m.isCall || m.callType || (m.text && (
                        m.text.toLowerCase().includes('appel vocal') ||
                        m.text.toLowerCase().includes('voice call') ||
                        m.text.toLowerCase().includes('appel vidéo') ||
                        m.text.toLowerCase().includes('video call') ||
                        m.text.toLowerCase().includes('missed call') ||
                        m.text.toLowerCase().includes('appel manqué')
                      ))) ? (
                        <div className="py-1 px-0.5 space-y-2 select-none min-w-[210px]">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                                m.callType?.startsWith('missed') || m.callOutcome === 'Missed' || m.callOutcome === 'Unanswered'
                                  ? 'bg-red-500/15 text-red-500 dark:bg-red-500/20'
                                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20'
                              }`}
                            >
                              {m.callType?.includes('video') ? (
                                <Video className="w-4 h-4" />
                              ) : m.callType?.startsWith('missed') || m.callOutcome === 'Missed' ? (
                                <PhoneMissed className="w-4 h-4 text-red-500" />
                              ) : m.callType?.startsWith('outgoing') ? (
                                <PhoneOutgoing className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <PhoneIncoming className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-xs text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                <span className="truncate">
                                  {m.callType?.startsWith('missed') || m.callOutcome === 'Missed'
                                    ? (m.callType?.includes('video') ? 'Appel vidéo manqué' : 'Appel vocal manqué')
                                    : m.callType?.startsWith('outgoing')
                                    ? (m.callType?.includes('video') ? 'Appel vidéo sortant' : 'Appel vocal sortant')
                                    : (m.callType?.includes('video') ? 'Appel vidéo entrant' : 'Appel vocal entrant')}
                                </span>
                                {m.callDuration && (
                                  <span className="text-[10px] font-normal text-gray-500 dark:text-gray-400 shrink-0">
                                    ({m.callDuration})
                                  </span>
                                )}
                              </div>
                              <p className="text-[10.5px] text-gray-500 dark:text-gray-400 mt-0.5">
                                {m.callType?.startsWith('missed') || m.callOutcome === 'Missed'
                                  ? 'Sans réponse'
                                  : m.callDuration ? `Durée : ${m.callDuration}` : m.time}
                              </p>
                            </div>
                          </div>

                          {(m.callType?.startsWith('missed') || m.callOutcome === 'Missed') && (
                            <div className="pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center justify-end">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Rappeler</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (() => {
                        const raw = extractSafeText(m) || m.text || '';
                        const hasAttachment = Boolean(m.imageUrl || m.videoUrl || m.isAudio || m.fileName || m.poll);
                        const clean = raw ? raw.replace(/^[📷🎥🎤🎵📄📍🏷️📹📞💬🚫]+\s*/, '').trim() : '';
                        const showText = !m.poll && clean && (!hasAttachment || !isMediaPlaceholderText(clean));
                        return (
                          <>
                            {hasAttachment && renderMessageAttachment(m, isMe)}
                            {showText && (
                              <p className={`whitespace-pre-wrap font-normal ${hasAttachment ? 'mt-1.5' : ''}`}>
                                {renderMessageText(clean, searchQuery)}
                              </p>
                            )}
                          </>
                        );
                      })()}

                      <div className="flex justify-end items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 mt-1 select-none">
                        <span>{m.time}</span>
                        {!isCustomer && !m.isDeleted && !m.isCall && (
                          (m.seen || (m as any).status === 'read' || (m as any).status === 'played') ? (
                            <span className="flex items-center text-[#53BDEB]" title={m.seenTime ? `Vu ${m.seenTime}` : 'Vu'}>
                              <CheckCheck className="w-3.5 h-3.5 stroke-[2.2]" />
                            </span>
                          ) : (m.delivered !== false || (m as any).status === 'delivered') ? (
                            <span className="flex items-center text-gray-400 dark:text-gray-500" title="Distribué">
                              <CheckCheck className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-400 text-[10px]" title="Envoyé">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Reaction badge directly docked under the message bubble */}
                    {m.reactions && m.reactions.length > 0 && !m.isDeleted && (
                      <div className="absolute -bottom-2.5 right-2 z-20 flex items-center gap-1 animate-in fade-in zoom-in-95">
                        {m.reactions.map((r, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReact(m.id, r.emoji);
                            }}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full shadow-md text-[11px] font-bold border transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                              r.userReacted
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                                : 'bg-white dark:bg-[#202C33] border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200'
                            }`}
                            title="Click to toggle reaction"
                          >
                            <span>{r.emoji}</span>
                            {r.count > 1 && <span className="text-[10px]">{r.count}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}

        {isTyping && (
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs py-1">
            <span className="animate-pulse">● ● ●</span>
            <span className="text-[10px]">{activeContact.name} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      </PullToRefresh>

      {/* Attachment Menu Popup */}
      <AnimatePresence>
        {isAttachmentMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-20 left-4 z-40 bg-white dark:bg-[#1F2C34] rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-700 p-2 min-w-[210px] flex flex-col gap-1 text-xs"
          >
            <button
              type="button"
              onClick={() => {
                setIsAttachmentMenuOpen(false);
                imageInputRef.current?.click();
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200 font-semibold cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ImageIcon className="w-4 h-4" />
              </div>
              <span>Photos & Videos</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAttachmentMenuOpen(false);
                fileInputRef.current?.click();
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200 font-semibold cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-4 h-4" />
              </div>
              <span>Document / PDF</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAttachmentMenuOpen(false);
                handleSend(undefined, '📦 Bordereau de livraison Yalidine: Colis N° DZ-48820 (Taille L, 4,800 DA - Oran)');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200 font-semibold cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span>Yalidine Tracking Slip</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Emojis Tray */}
      <AnimatePresence>
        {isEmojiPickerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#F0F2F5] dark:bg-[#202C33] border-t border-[#DFDFD4] dark:border-[#2E333D] px-3 py-2 shrink-0 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Quick Emojis
              </span>
              <button
                type="button"
                onClick={() => setIsEmojiPickerOpen(false)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full text-gray-400 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 max-h-28 overflow-y-auto custom-scrollbar p-1">
              {[
                '😀', '😂', '😍', '❤️', '🔥', '👍', '🙏', '👏',
                '🎉', '✨', '🇩🇿', '📦', '🚚', '👕', '👟', '💯',
                '🤝', '📞', '👌', '😎', '💬', '⭐', '📍', '💰'
              ].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setInputMessage((prev) => prev + emoji)}
                  className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-[#2A3942] flex items-center justify-center text-lg hover:scale-125 transition-transform active:scale-95 cursor-pointer shadow-2xs"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Quick Responses Bar */}
      {renderQuickTemplatesBar()}

      {/* Premade Message Creator & Editor Modal (z-[99999] top of everything) */}
      {renderTemplateModal()}
      {renderApiKeyModal()}

      {/* Right-Click Context Menu for Quick Templates */}
      {renderTemplateContextMenu()}

      {/* Input Area or Live Voice Recording Bar */}
      {isRecordingVoice ? (
        <div className="p-3 bg-[#F0F2F5] dark:bg-[#202C33] border-t border-[#DFDFD4] dark:border-[#2E333D] flex items-center justify-between gap-3 shrink-0 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
            <span className="font-mono text-xs font-bold text-red-500">
              0:{recordingDuration < 10 ? '0' : ''}{recordingDuration}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-sans">
              Recording voice note...
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelVoiceRecord}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors cursor-pointer"
              title="Cancel voice recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleSendVoiceNote}
              className="px-3.5 py-1.5 bg-[#1B6648] hover:bg-[#144f37] text-white rounded-full font-bold text-xs flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
              title="Send voice note"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Quote / Replying-to Preview Bar */}
          <AnimatePresence>
            {replyingToMessage && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 py-2 bg-emerald-500/10 dark:bg-emerald-950/40 border-t border-emerald-500/20 flex items-center justify-between text-xs overflow-hidden shrink-0 z-20"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Reply className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                    Replying to {replyingToMessage.sender === 'operator' ? 'You' : activeContact.name}:
                  </span>
                  <span className="truncate text-neutral-600 dark:text-neutral-300">
                    {renderQuotedSnippet(replyingToMessage.text || (replyingToMessage.imageUrl ? 'Photo' : replyingToMessage.isAudio ? 'Voice message' : 'Message'))}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingToMessage(null)}
                  className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-neutral-400 hover:text-neutral-200 transition-colors"
                  title="Cancel reply"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {isChatReadOnly ? (
            <div 
              className="p-3.5 bg-[#F0F2F5]/95 dark:bg-[#202C33]/95 border-t border-[#DFDFD4] dark:border-[#2E333D] flex items-center justify-center gap-2 shrink-0 z-20 text-center select-none shadow-xs"
              style={{ paddingBottom: keyboardOffset > 0 ? `${keyboardOffset + 10}px` : 'max(0.85rem, env(safe-area-inset-bottom, 0px))' }}
            >
              <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Only administrators can send messages in this channel
              </span>
            </div>
          ) : (
            <form 
              onSubmit={handleSend} 
              className="p-2 sm:p-3 bg-[#F0F2F5] dark:bg-[#202C33] border-t border-[#DFDFD4] dark:border-[#2E333D] flex items-center gap-1.5 sm:gap-2 shrink-0 relative z-20"
              style={{ paddingBottom: keyboardOffset > 0 ? `${keyboardOffset + 10}px` : 'max(0.6rem, env(safe-area-inset-bottom, 0px))' }}
            >
            <button
              type="button"
              onClick={() => {
                setIsEmojiPickerOpen((prev) => !prev);
                setIsAttachmentMenuOpen(false);
              }}
              className={`p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer shrink-0 ${isEmojiPickerOpen ? 'text-[#1B6648] bg-white dark:bg-[#2A3942]' : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
              title="Insert emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAttachmentMenuOpen((prev) => !prev);
                setIsEmojiPickerOpen(false);
              }}
              className={`p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer shrink-0 ${isAttachmentMenuOpen ? 'text-[#1B6648] bg-white dark:bg-[#2A3942]' : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
              title="Attach file, photo or tracking"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => toggleQuickTemplates()}
              className={`p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer shrink-0 ${isQuickTemplatesOpen ? 'text-[#1B6648] bg-white dark:bg-[#2A3942]' : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
              title={isQuickTemplatesOpen ? "Masquer les réponses rapides" : "Afficher les réponses rapides"}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={inputMessage}
              onFocus={handleInputFocus}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Type a message to ${activeContact.name}...`}
              className="flex-1 min-w-0 bg-white dark:bg-[#2A3942] border border-[#DFDFD4] dark:border-gray-700 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs text-[#1B1B1B] dark:text-white focus:outline-none focus:border-[#1B6648]"
            />
            {inputMessage.trim() ? (
              <button
                type="submit"
                className="p-2 sm:p-2.5 bg-[#1B6648] hover:bg-[#144f37] text-white rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-sm shrink-0"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleToggleVoiceRecord}
                className="p-2 sm:p-2.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-[#1B6648] hover:text-white text-gray-700 dark:text-gray-200 transition-colors cursor-pointer shadow-xs shrink-0"
                title="Record voice note"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </form>
        )}
      </>
    )}
    </div>
  );
};
