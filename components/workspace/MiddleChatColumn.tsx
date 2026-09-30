"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, ChevronRight, Send, 
  Mic, 
  Paperclip, 
  Smile, 
  Phone, 
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
  FileText, 
  Mail, 
  MessageSquare,
  Reply, 
  ChevronLeft, 
  Minus, 
  Maximize2, 
  X, 
  Trash2, 
  Sticker, 
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
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';
import { useChatStore } from '@/lib/store/ChatStoreContext';
import { VoiceNotePlayer } from './VoiceNotePlayer';
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
  MatrixIcon
} from '@/components/icons/BrandIcons';
import { MOCK_CONTACTS_BY_APP, ContactProfile, ChatMessage, APP_GRADIENT_THEMES, getContactsForApp, PAIRED_CHATS_BY_APP, getRealInstagramProfile } from '@/lib/mock_chats';
import { ChannelNativeViews } from './ChannelNativeViews';

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
  onMessageActivity?: (appId: string, contactId: string, messageText: string, timestamp?: number, isReceived?: boolean) => void;
  isMobileEmbedded?: boolean;
  currentUser?: any;
  channelError?: string;
  dragHandleProps?: any;
}

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
}) => {
  const { 
    openLightbox, 
    isRightHubCollapsed, 
    toggleRightHubCollapse, 
    replyingToMessage, 
    setReplyingToMessage, 
    likeMessage 
  } = useChatStore();
  const [inputMessage, setInputMessage] = useState('');
  const [isSimulatingLoad, setIsSimulatingLoad] = useState(false);
  useEffect(() => {
    setIsSimulatingLoad(true);
    const timer = setTimeout(() => setIsSimulatingLoad(false), 1500);
    return () => clearTimeout(timer);
  }, [appId]);
  const [isTyping, setIsTyping] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Per-contact conversation store
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});

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
  const [newChatFirstMessage, setNewChatFirstMessage] = useState('');
  const [isSubmittingNewChat, setIsSubmittingNewChat] = useState(false);

  const handleStartNewChatDirect = async () => {
    const cleanHandle = newChatCustomerHandle.trim().replace(/^@/, '');
    const msg = newChatFirstMessage.trim();
    if (!cleanHandle || !msg) return;

    setIsSubmittingNewChat(true);
    try {
      const contactId = `${appId}_${cleanHandle}`;

      // 1. Send via channel API
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
            recipientName: cleanHandle,
            text: msg,
            accessToken,
            igId,
            pageId
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
        seenTime: 'Just now'
      };

      setConversations((prev) => ({
        ...prev,
        [contactId]: [newMsgObj]
      }));

      // 3. Register contact in parent state and select it
      onMessageActivity?.(appId, contactId, msg, Date.now());

      setNewChatCustomerHandle('');
      setNewChatFirstMessage('');
    } finally {
      setIsSubmittingNewChat(false);
    }
  };

  // Resolve current active contact based on whether app is connected and live contacts are available
  const fallbackContacts = getContactsForApp(appId, isConnected);
  const currentAppContacts = (isConnected && liveContacts && liveContacts.length > 0)
    ? liveContacts
    : (isConnected ? fallbackContacts : []);
    // Resolve the active contact traversing the hierarchy
  let resolvedContact = null;
  let currentList = currentAppContacts;
  
  if (selectedContactPath && selectedContactPath.length > 0) {
    for (const pId of selectedContactPath) {
      const found = currentList.find(c => c.id === pId);
      if (found) {
        resolvedContact = found;
        if (found.children) currentList = found.children;
      } else {
        break;
      }
    }
  }
  
  const activeContact = resolvedContact || currentAppContacts[0];
  const activeMessages = activeContact ? (conversations[activeContact.id] || activeContact.messages || []) : [];

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


  // Live real-time message sync across all channels (WhatsApp, Instagram, Messenger, Telegram, Gmail)
  useEffect(() => {
    if (!isConnected || !activeContact?.id) return;
    let isSubscribed = true;

    const fetchLiveMessages = async () => {
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
          } catch {}
          endpoint = `/api/channels/discord/messages?channelId=${encodeURIComponent(activeContact.id)}&token=${encodeURIComponent(token)}`;
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
                    reactions: existing.reactions || dm.reactions,
                    isDeleted: existing.isDeleted !== undefined ? existing.isDeleted : dm.isDeleted,
                    text: existing.isDeleted ? '🚫 This message was deleted' : dm.text,
                    seen: existing.seen !== undefined ? existing.seen : dm.seen,
                  };
                }
                return dm;
              });
              return {
                ...prev,
                [activeContact.id]: [...merged, ...localAdded]
              };
            });
            const lastMsg = data.messages[data.messages.length - 1];
            if (lastMsg?.text && lastMsg.text !== activeContact.lastMessage) {
              onMessageActivity?.(appId, activeContact.id, lastMsg.text, Date.now());
            }
          }
        }
      } catch (err) {
        console.error(`Error fetching live ${appId} messages:`, err);
      }
    };

    fetchLiveMessages();
    const interval = setInterval(fetchLiveMessages, 6000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [appId, isConnected, activeContact?.id]);

  useEffect(() => {
    if (!messagesEndRef.current) return;
    const container = messagesEndRef.current.parentElement;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 350;
      if (isNearBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      }
    } else {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [activeMessages]);

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

  const handleSendVoiceNote = () => {
    if (!activeContact) return;
    const duration = recordingDuration || 1;
    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'operator',
      text: `Voice note (${duration}s)`,
      isAudio: true,
      audioDuration: `0:${duration < 10 ? '0' : ''}${duration}`,
      time: 'Just now',
      delivered: true,
      seen: false
    };
    setConversations((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMsg]
    }));
    onMessageActivity?.(appId, activeContact.id, `🎤 Voice note (${duration}s)`, Date.now());
    setIsRecordingVoice(false);
    setRecordingDuration(0);

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
        text: file.name,
        imageUrl: reader.result as string,
        time: 'Just now',
        delivered: true,
        seen: false
      };
      setConversations((prev) => ({
        ...prev,
        [activeContact.id]: [...(prev[activeContact.id] || []), newMsg]
      }));
      onMessageActivity?.(appId, activeContact.id, '📷 Photo', Date.now());

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
      seen: false
    };
    setConversations((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMsg]
    }));
    onMessageActivity?.(appId, activeContact.id, `📄 ${file.name}`, Date.now());

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
      className="absolute inset-0 shadow-md"
      style={{ backgroundColor: solidColor }}
    />
  );


  // 2. Disconnected empty state — shown when the app has not been connected yet
  if (!isConnected) {
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
    };
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-white dark:bg-[#1A1D23] ${isMobileEmbedded ? 'rounded-b-3xl border-0 shadow-none' : 'rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] shadow-sm'} overflow-hidden`}>
        {/* Solid brand header bar with standardized h-14 height */}
        {!isMobileEmbedded && (
          <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 shrink-0 flex items-center justify-between border-b border-black/10 select-none shadow-xs rounded-t-3xl ${dragHandleProps?.className || "cursor-grab active:cursor-grabbing"}`}
            style={{ backgroundColor: theme.solidColor }}
          >
            <span className="text-white font-bold text-sm leading-none">{theme.name}</span>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/20 text-white/90 leading-none">
              Unlinked
            </span>
          </div>
        )}
        {/* Empty state body */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center gap-3 sm:gap-4 p-4 sm:p-6 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-md sm:shadow-lg shrink-0" style={{ backgroundColor: theme.solidColor + '15' }}>
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
                className="w-full max-w-[280px] py-3 px-5 rounded-2xl text-white font-bold text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2 shrink-0"
                style={{ backgroundColor: theme.solidColor }}
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

  // Render photo / voice / file attachments inside message bubble
  const renderMessageAttachment = (m: ChatMessage, isMe: boolean) => (
    <>
      {m.imageUrl && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            openLightbox(m.imageUrl!);
          }}
          className="my-2 rounded-2xl overflow-hidden shadow-md max-w-[280px] border border-black/10 dark:border-white/10 cursor-pointer group/img relative"
          title="Click to view full screen"
        >
          <img src={m.imageUrl} alt="attachment" className="w-full h-auto object-cover max-h-60 group-hover/img:scale-105 transition-transform" />
          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/25 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
            <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
          </div>
        </div>
      )}
      {m.isAudio && (
        <VoiceNotePlayer duration={m.audioDuration} isSender={isMe} />
      )}
      {m.fileName && (
        <div className={`p-2.5 rounded-2xl my-1.5 flex items-center gap-2.5 border shadow-xs max-w-[250px] ${
          isMe
            ? 'bg-black/15 dark:bg-white/15 border-white/20 text-white'
            : 'bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-gray-100'
        }`}>
          <FileText className="w-5 h-5 shrink-0 opacity-80" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">{m.fileName}</p>
            <span className="text-[9px] opacity-70 font-mono">{m.fileSize || 'File'}</span>
          </div>
        </div>
      )}
    </>
  );

  // Handle adding reactions
  const handleReact = (msgId: string, emoji: string) => {
    if (!activeContact) return;
    setConversations((prev) => {
      const currentList = prev[activeContact.id] || [];
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
            text: '🚫 This message was deleted',
            isDeleted: true,
            imageUrl: undefined,
            isAudio: false,
            fileName: undefined,
          };
        });
      }
      const lastMsg = updated[updated.length - 1];
      const snippet = lastMsg ? (lastMsg.isDeleted ? '🚫 This message was deleted' : lastMsg.text) : '';
      onMessageActivity?.(appId, activeContact.id, snippet, Date.now());
      return { ...prev, [activeContact.id]: updated };
    });
  };

  // Safe search text highlighter & URL clickability/truncation
  const renderMessageText = (text: string, query: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urlParts = text.split(urlRegex);

    return urlParts.map((part, index) => {
      if (part.match(urlRegex)) {
        const url = part;
        const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i);
        const isVideo = url.match(/\.(mp4|webm|ogg)($|\?)/i);
        const isAudio = url.match(/\.(mp3|wav|ogg)($|\?)/i);
        const isTikTok = url.includes('tiktok.com');
        
        if (isImage) {
          return <img key={index} src={url} alt="Attachment" className="max-w-full rounded-lg max-h-64 object-contain mt-1 mb-1" onClick={(e) => e.stopPropagation()} />;
        }
        if (isVideo || isTikTok) {
          return (
            <video key={index} src={url} controls className="max-w-full rounded-lg max-h-64 mt-1 mb-1" onClick={(e) => e.stopPropagation()}>
              Your browser does not support the video tag.
            </video>
          );
        }
        if (isAudio) {
          return <audio key={index} src={url} controls className="max-w-full mt-1 mb-1" onClick={(e) => e.stopPropagation()} />;
        }

        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {url}
          </a>
        );
      }

      if (!query.trim()) return <span key={index}>{part}</span>;
      
      const searchParts = part.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
      return (
        <span key={index}>
          {searchParts.map((sp, i) =>
            sp.toLowerCase() === query.toLowerCase() ? (
              <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white rounded-xs px-0.5">
                {sp}
              </mark>
            ) : (
              <span key={i}>{sp}</span>
            )
          )}
        </span>
      );
    });
  };

  const handleSend = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    if (!activeContact) return;
    const textToSend = customText || inputMessage;
    if (!textToSend.trim()) return;

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'operator',
      text: textToSend.trim(),
      time: 'Just now',
      delivered: true,
      seen: false
    };

    setConversations((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMsg]
    }));

    setInputMessage('');

    // Trigger chronological reorder: moves contact to top of list with updated snippet
    onMessageActivity?.(appId, activeContact.id, textToSend.trim(), Date.now());

    // Dispatch real message to the active connected channel
    if (isConnected && activeContact?.id) {
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
        } catch {}
        fetch('/api/channels/discord/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: activeContact.id,
            recipientId: activeContact.id,
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
    } else {
      // For mock channels, simulate customer typing after 1.5 seconds, then mark as seen
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setConversations((prev) => {
            const list = prev[activeContact.id] || [];
            const updated = list.map((m) => (m.id === newMsg.id ? { ...m, seen: true, seenTime: 'Just now' } : m));
            return { ...prev, [activeContact.id]: updated };
          });
        }, 2500);
      }, 1200);
    }
  };

  // Render Reaction floating bar anchored at bottom-right corner of message bubble (like native WhatsApp/Messenger)
  const renderReactionPicker = (msgId: string, isMe: boolean) => (
    <div
      className="absolute -top-8 right-2 bg-white dark:bg-[#1E222A] shadow-xl border border-gray-200 dark:border-neutral-700 rounded-full px-2.5 py-1.5 flex items-center gap-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap"
    >
      {['❤️', '👍', '😂', '🔥', '🙏'].map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleReact(msgId, emoji);
            setHoveredMessageId(null);
          }}
          className="hover:scale-130 transition-transform p-0.5 text-sm active:scale-95 cursor-pointer"
        >
          {emoji}
        </button>
      ))}
    </div>
  );

  // Channel 3-dots actions menu (Re-scan QR, Disconnect/Unlink channel)
  const renderChannelMenu = (targetAppId: string) => {
    const theme = APP_GRADIENT_THEMES[targetAppId] || APP_GRADIENT_THEMES.whatsapp;
    return (
      <div className="relative z-50">
        <button
          id="channel-action-menu-btn"
          type="button"
          onClick={() => setIsChannelMenuOpen((prev) => !prev)}
          className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
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
      }
    } catch {}

    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-white dark:bg-[#1A1D23] ${isMobileEmbedded ? 'rounded-b-3xl border-0 shadow-none' : 'rounded-3xl border shadow-sm'} border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden`}>
        {/* Solid brand header bar only when not embedded on mobile with strict h-14 height */}
        {!isMobileEmbedded && (
          <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 shrink-0 flex items-center justify-between border-b border-black/10 select-none shadow-xs rounded-t-3xl ${dragHandleProps?.className || "cursor-grab active:cursor-grabbing"}`}
            style={{ backgroundColor: theme.solidColor }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-white font-bold text-sm truncate whitespace-nowrap leading-none">
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
                  className="px-2.5 py-1 rounded-full bg-black/25 hover:bg-black/35 border border-white/20 text-white/95 font-mono text-[11px] font-bold truncate max-w-[130px] leading-none shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
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
                    className="px-2 py-0.5 rounded-full bg-black/20 hover:bg-black/35 border border-white/25 text-white/90 text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <span>Link Real @Handle</span>
                    <Edit3 className="w-2.5 h-2.5 opacity-80 shrink-0" />
                  </button>
                )
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-full bg-black/25 border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 whitespace-nowrap shadow-2xs leading-none">
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
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-md relative" style={{ backgroundColor: theme.solidColor + '15' }}>
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

          {/* Beeper-Style Bridge Sync Card (No awkward manual handle typing) */}
          <div className="w-full max-w-sm mt-1 p-4 bg-gray-50 dark:bg-neutral-800/80 rounded-2xl border border-gray-200 dark:border-neutral-700 text-center space-y-3 shadow-xs">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>Direct Bridge Active</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
              Select any contact or conversation from the inbox on the right to view message history, media, and send direct replies.
            </p>
            {liveContacts && liveContacts.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (liveContacts[0]?.id) {
                    onMessageActivity?.(appId, liveContacts[0].id, liveContacts[0].lastMessage || '', Date.now());
                  }
                }}
                className="w-full py-2 px-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer hover:opacity-90 active:scale-98"
                style={{ backgroundColor: theme.solidColor }}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Latest Conversation ({liveContacts[0].name})</span>
              </button>
            )}
          </div>
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
  
  // Render Directory Mode if the active contact is a Group
  if (activeContact && activeContact.isGroup) {
    const theme = APP_GRADIENT_THEMES[appId] || APP_GRADIENT_THEMES.discord;
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-white dark:bg-[#1A1D23] ${isMobileEmbedded ? 'rounded-b-3xl border-0 shadow-none' : 'rounded-3xl border shadow-sm'} border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden`}>
        <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 shrink-0 flex items-center justify-between border-b border-black/10 select-none shadow-xs ${isMobileEmbedded ? 'rounded-tr-2xl' : 'rounded-t-3xl'} ${dragHandleProps?.className || "cursor-grab active:cursor-grabbing"}`}
          style={{ backgroundColor: theme.solidColor }}
        >
          <div className="flex items-center gap-3 min-w-0 text-white">
            {selectedContactPath.length > 1 && (
              <button onClick={handleNavigateUp} className="p-1.5 -ml-2 rounded-full hover:bg-white/20 transition-colors shrink-0">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="min-w-0">
              <h4 className="font-bold text-sm truncate leading-tight flex items-center gap-1.5">
                {activeContact.name}
              </h4>
              <p className="text-[11px] text-white/80 truncate leading-tight">
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
                  onClick={() => handleNavigateDown(child.id)}
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

  if (['discord', 'slack', 'signal', 'x_twitter', 'matrix', 'irc', 'linkedin', 'google_messages', 'google_chat', 'google_voice'].includes(appId)) {
    const currentMsgs = conversations[activeContact.id] || activeContact.messages || [];
    return (
      <ChannelNativeViews
        appId={appId}
        activeContact={activeContact}
        messages={currentMsgs}
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
          };
          setConversations((prev) => ({
            ...prev,
            [activeContact.id]: [...(prev[activeContact.id] || activeContact.messages || []), newMsg],
          }));
          onMessageActivity?.(appId, activeContact.id, '🎤 Voice note', Date.now());
          let token = '';
          if (appId === 'discord') {
            try {
              token = localStorage.getItem('cf_discord_token') || '';
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
              text: '🎤 Voice message',
              token,
            }),
          }).catch(() => {});
        }}
        onSendAttachment={(urlOrName, type, size) => {
          const isImg = type === 'image';
          const newMsg: ChatMessage = {
            id: String(Date.now()),
            sender: 'operator',
            text: isImg ? '📷 Photo' : urlOrName,
            time: 'Just now',
            delivered: true,
            imageUrl: isImg ? urlOrName : undefined,
            hasImages: isImg,
            fileName: isImg ? undefined : urlOrName,
            fileSize: size,
          };
          setConversations((prev) => ({
            ...prev,
            [activeContact.id]: [...(prev[activeContact.id] || activeContact.messages || []), newMsg],
          }));
          onMessageActivity?.(appId, activeContact.id, isImg ? '📷 Photo' : urlOrName, Date.now());
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
              text: isImg ? '📷 Photo' : urlOrName,
            }),
          }).catch(() => {});
        }}
        renderMessageAttachment={renderMessageAttachment}
        renderChannelMenu={renderChannelMenu}
        onMobileBack={onMobileBack}
        isMobileEmbedded={isMobileEmbedded}
        theme={activeTheme}
        onDeleteMessage={handleDeleteMessage}
        onReact={handleReact}
      />
    );
  }

  // =========================================================================
  // 1. TELEGRAM REPLICA
  // =========================================================================
  if (appId === 'telegram') {
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#F3F4F6] dark:bg-[#0E1621] ${isMobileEmbedded ? 'rounded-b-3xl border-t-0 shadow-none' : 'rounded-3xl border shadow-sm'} border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden relative text-[#1B1B1B]`}>
        {/* Hidden File & Image Pickers */}
        <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

        {/* Header with Solid Brand Color */}
        <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 text-white flex items-center justify-between z-30 shadow-xs border-b border-black/10 shrink-0 select-none relative ${isMobileEmbedded ? 'rounded-tr-2xl' : 'rounded-t-3xl'} ${dragHandleProps?.className || "cursor-grab active:cursor-grabbing"}`}>
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
            <TelegramIcon className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-xs shrink-0" />
            <div className="min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-tight flex items-center gap-1">
                {activeContact.name}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-white/80 truncate leading-tight flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{activeContact.handleOrPhone}</span>
                <span className="opacity-70">• {isAiActive ? '🤖 AI' : '👤 Operator'}</span>
              </p>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-1 text-white shrink-0">
            <button className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"><Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
            <button className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"><Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
            {renderChannelMenu('telegram')}
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#F3F4F6] dark:bg-[#0E1621]">
          {activeMessages.map((m) => {
            const isMe = m.sender === 'operator';
            return (
              <div
                key={m.id}
                onMouseEnter={() => setHoveredMessageId(m.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {/* Message Bubble Container with relative positioning for reactions */}
                <div className={`relative group/bubble max-w-[78%] ${m.reactions && m.reactions.length > 0 ? "mb-3.5" : ""}`}>
                  {hoveredMessageId === m.id && renderReactionPicker(m.id, isMe)}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#2AABEE] text-white rounded-br-sm shadow-sm'
                        : 'bg-white dark:bg-[#182533] text-[#111827] dark:text-white rounded-bl-sm shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap font-normal">{renderMessageText(m.text || '', searchQuery)}</p>
                    {renderMessageAttachment(m, isMe)}
                    {m.hasImages && (
                      <div className="grid grid-cols-3 gap-1.5 my-2 pt-1">
                        <div className="aspect-square rounded-xl bg-gray-200 overflow-hidden shadow-xs">
                          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop" alt="p1" className="w-full h-full object-cover" />
                        </div>
                        <div className="aspect-square rounded-xl bg-gray-200 overflow-hidden shadow-xs">
                          <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop" alt="p2" className="w-full h-full object-cover" />
                        </div>
                        <div className="aspect-square rounded-xl bg-gray-900 relative overflow-hidden shadow-xs flex items-center justify-center text-white font-bold text-xs">
                          <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop" alt="p3" className="w-full h-full object-cover opacity-60" />
                          <span className="absolute font-bold text-sm">+3</span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end items-center gap-1 text-[10px] opacity-75 mt-1">
                      <span>{m.time}</span>
                      {isMe && <CheckCheck className="w-3.5 h-3.5" />}
                      {m.seen && <span className="text-[9px] ml-0.5">Seen</span>}
                    </div>
                  </div>

                  {/* Reaction badge directly docked under the message bubble */}
                  {m.reactions && m.reactions.length > 0 && (
                    <div className={`absolute -bottom-2.5 ${isMe ? 'right-2' : 'left-2'} z-10 flex items-center gap-1`}>
                      {m.reactions.map((r, i) => (
                        <span key={i} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-white dark:bg-[#1E222A] shadow-md border border-gray-200 dark:border-neutral-700 text-[11px] font-bold">
                          {r.emoji} {r.count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-gray-500 text-xs py-1">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce delay-100">●</span>
              <span className="animate-bounce delay-200">●</span>
              <span className="text-[11px] italic">{activeContact.name} is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
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
              placeholder={`Write a message to ${activeContact.name}...`}
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
          <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 text-white flex items-center justify-between z-30 shadow-xs border-b border-black/10 shrink-0 select-none relative ${isMobileEmbedded ? 'rounded-tr-2xl' : 'rounded-t-3xl'} ${dragHandleProps?.className || "cursor-grab active:cursor-grabbing"}`}>
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
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#E6D3E7] dark:bg-[#201625] ${isMobileEmbedded ? 'rounded-b-3xl border-t-0 shadow-none' : 'rounded-3xl border shadow-sm'} border-[#D5BCD7] dark:border-[#38263F] overflow-hidden relative text-[#1B1B1B]`}>
        {/* Hidden File & Image Pickers */}
        <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

        {/* Header with Solid Brand Color */}
        <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 text-white flex items-center justify-between z-30 shadow-xs border-b border-black/10 shrink-0 select-none relative ${isMobileEmbedded ? 'rounded-tr-2xl' : 'rounded-t-3xl'} ${dragHandleProps?.className || "cursor-grab active:cursor-grabbing"}`}>
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
                {activeContact.name} <span className="text-[10px] text-white/90">✓</span>
              </h4>
              <p className="text-[10px] sm:text-[11px] text-white/80 truncate leading-tight">
                {activeContact.handleOrPhone} • {isAiActive ? '🤖 AI' : '👤 Manual'}
              </p>
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
            <button className="hidden sm:flex p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"><Phone className="w-3.5 h-3.5" /></button>
            <button className="hidden sm:flex p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"><Video className="w-3.5 h-3.5" /></button>
            {renderChannelMenu('instagram')}
          </div>
        </div>

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
          {activeMessages.map((m) => {
            const isMe = m.sender === 'operator';
            return (
              <div
                key={m.id}
                onMouseEnter={() => setHoveredMessageId(m.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
                className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#8338EC] to-[#B5179E] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mb-1">
                    {activeContact.avatarText}
                  </div>
                )}
                <div className={`relative group/bubble max-w-[72%] ${m.reactions && m.reactions.length > 0 ? "mb-3.5" : ""}`}>
                  {hoveredMessageId === m.id && renderReactionPicker(m.id, isMe)}
                  <div
                    className={`px-4 py-2 rounded-3xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#7B2CBF] dark:bg-[#8338EC] text-white rounded-br-md shadow-xs'
                        : 'bg-white dark:bg-[#2E1F35] text-black dark:text-white rounded-bl-md shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{renderMessageText(m.text || '', searchQuery)}</p>
                    {renderMessageAttachment(m, isMe)}
                    {isMe && m.seen && (
                      <p className="text-[9px] text-white/70 text-right mt-0.5">Seen {m.seenTime || 'Just now'}</p>
                    )}
                  </div>

                  {/* Reaction badge directly docked under the message bubble */}
                  {m.reactions && m.reactions.length > 0 && (
                    <div className={`absolute -bottom-2.5 ${isMe ? 'right-2' : 'left-2'} z-10 flex items-center gap-1`}>
                      {m.reactions.map((r, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full bg-white dark:bg-[#2E1F35] shadow-md border border-[#D5BCD7] dark:border-[#38263F] text-[11px] font-bold">
                          {r.emoji} {r.count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 text-xs py-1 pl-8">
              <span className="animate-pulse">● ● ●</span>
              <span className="text-[10px]">{activeContact.name} is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
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
                placeholder={`Message ${activeContact.name}...`}
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
      </div>
    );
  }

  // =========================================================================
  // 3. FACEBOOK MESSENGER NATIVE REPLICA
  // =========================================================================
  if (appId === 'messenger') {
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-white dark:bg-[#18191A] ${isMobileEmbedded ? 'rounded-b-3xl border-t-0 shadow-none' : 'rounded-3xl border shadow-sm'} border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden relative text-[#1B1B1B] dark:text-white`}>
        {/* Hidden File & Image Pickers */}
        <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

        {/* Messenger Header with Solid Brand Color */}
        <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 text-white flex items-center justify-between z-30 shadow-xs border-b border-black/10 shrink-0 select-none relative ${isMobileEmbedded ? 'rounded-tr-2xl' : 'rounded-t-3xl'} ${dragHandleProps?.className || "cursor-grab active:cursor-grabbing"}`}>
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
            <MessengerIcon className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
            <div className="min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-tight flex items-center gap-1">
                {activeContact.name}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-white/80 truncate leading-tight flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{activeContact.handleOrPhone}</span>
                <span className="opacity-70">• {isAiActive ? '🤖 AI' : '👤 Operator'}</span>
              </p>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-1 text-white shrink-0">
            <button className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"><Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
            <button className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"><Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
            {renderChannelMenu('messenger')}
          </div>
        </div>

        {/* Messenger Message Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-gray-50/50 dark:bg-[#18191A]">
          {activeMessages.map((m) => {
            const isMe = m.sender === 'operator';
            return (
              <div
                key={m.id}
                onMouseEnter={() => setHoveredMessageId(m.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`relative group/bubble max-w-[75%] ${m.reactions && m.reactions.length > 0 ? "mb-3.5" : ""}`}>
                  {hoveredMessageId === m.id && renderReactionPicker(m.id, isMe)}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-gradient-to-r from-[#0084FF] to-[#00C6FF] text-white rounded-br-sm shadow-xs'
                        : 'bg-gray-200 dark:bg-[#3A3B3C] text-gray-900 dark:text-white rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{renderMessageText(m.text || '', searchQuery)}</p>
                    {renderMessageAttachment(m, isMe)}
                    {isMe && m.seen && (
                      <p className="text-[9px] text-white/80 text-right mt-0.5">Seen {m.seenTime || 'Just now'}</p>
                    )}
                  </div>

                  {/* Reaction badge directly docked under the message bubble */}
                  {m.reactions && m.reactions.length > 0 && (
                    <div className={`absolute -bottom-2.5 ${isMe ? 'right-2' : 'left-2'} z-10 flex items-center gap-1`}>
                      {m.reactions.map((r, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full bg-white dark:bg-[#3A3B3C] shadow-md border border-gray-200 dark:border-neutral-700 text-[11px] font-bold">
                          {r.emoji} {r.count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-gray-500 text-xs py-1">
              <span className="animate-pulse">● ● ●</span>
              <span className="text-[10px]">{activeContact.name} is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Messenger Input Bar */}
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
      </div>
    );
  }

  // =========================================================================
  // 4. STOREFRONT LIVE CHAT NATIVE REPLICA
  // =========================================================================
  if (appId === 'web_widget') {
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-white dark:bg-[#1A1D23] ${isMobileEmbedded ? 'rounded-b-3xl border-t-0 shadow-none' : 'rounded-3xl border shadow-sm'} border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden relative text-[#1B1B1B] dark:text-white`}>
        {/* Hidden File & Image Pickers */}
        <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

        {/* Storefront Header with Solid Brand Color */}
        <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 text-white flex items-center justify-between z-30 shadow-xs border-b border-black/10 shrink-0 select-none relative ${isMobileEmbedded ? 'rounded-tr-2xl' : 'rounded-t-3xl'} ${dragHandleProps?.className || "cursor-grab active:cursor-grabbing"}`}>
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
            <StorefrontIcon className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 drop-shadow-xs shrink-0 rounded-xl p-1" />
            <div className="min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-tight flex items-center gap-1">
                {activeContact.name}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-white/80 truncate leading-tight flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{activeContact.handleOrPhone}</span>
                <span className="opacity-70">• {isAiActive ? '🤖 AI' : '👤 Operator'}</span>
              </p>
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
          {activeMessages.map((m) => {
            const isCustomer = m.sender === 'customer';
            return (
              <div
                key={m.id}
                onMouseEnter={() => setHoveredMessageId(m.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
                className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`relative group/bubble max-w-[75%] ${m.reactions && m.reactions.length > 0 ? "mb-3.5" : ""}`}>
                  {hoveredMessageId === m.id && renderReactionPicker(m.id, !isCustomer)}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      isCustomer
                        ? 'bg-white dark:bg-[#1E222A] text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-700 rounded-tl-sm shadow-xs'
                        : 'bg-[#1B6648] text-white rounded-tr-sm shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{renderMessageText(m.text || '', searchQuery)}</p>
                    {renderMessageAttachment(m, !isCustomer)}
                    <p className="text-[9px] opacity-75 text-right mt-0.5">{m.time}</p>
                  </div>

                  {/* Reaction badge directly docked under the message bubble */}
                  {m.reactions && m.reactions.length > 0 && (
                    <div className={`absolute -bottom-2.5 ${!isCustomer ? 'right-2' : 'left-2'} z-10 flex items-center gap-1`}>
                      {m.reactions.map((r, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full bg-white dark:bg-[#1E222A] shadow-md border border-gray-200 dark:border-neutral-700 text-[11px] font-bold">
                          {r.emoji} {r.count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 bg-white dark:bg-[#1A1D23] border-t border-gray-100 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => handleSend(undefined, 'Livraison 58 wilayas disponible avec Yalidine!')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-[#1B6648] hover:text-white text-gray-700 dark:text-gray-300 shrink-0 font-medium transition-colors"
          >
            🚚 Livraison 58 Wilayas
          </button>
          <button
            onClick={() => handleSend(undefined, 'Paiement à la livraison après inspection du colis.')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-[#1B6648] hover:text-white text-gray-700 dark:text-gray-300 shrink-0 font-medium transition-colors"
          >
            💵 Paiement Cash à la Livraison
          </button>
        </div>

        {/* Input */}
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
      </div>
    );
  }

  // =========================================================================
  // 5. GMAIL REPLICA (Received email on top, Reply Maker at bottom)
  // =========================================================================
  if (appId === 'gmail') {
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-white dark:bg-[#1A1D23] ${isMobileEmbedded ? 'rounded-b-3xl border-t-0 shadow-none' : 'rounded-3xl border shadow-sm'} border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden relative text-[#1B1B1B] dark:text-white`}>
        {/* Header with Solid Brand Color */}
        <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 text-white flex items-center justify-between shrink-0 shadow-xs border-b border-black/10 select-none ${isMobileEmbedded ? 'rounded-tr-2xl' : 'rounded-t-3xl'} ${dragHandleProps?.className || "cursor-grab active:cursor-grabbing"}`} style={{ backgroundColor: APP_GRADIENT_THEMES.gmail.solidColor }}>
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
            <GmailIcon className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-xs text-white truncate block">
                {activeContact.lastMessage || 'Customer Support Email'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full">
              {activeContact.statusText}
            </span>
            {renderChannelMenu('gmail')}
          </div>
        </div>

        {/* TOP HALF: Received Email Message */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#1A1D23] space-y-3 custom-scrollbar">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                {activeContact.avatarText}
              </div>
              <div>
                <h5 className="font-bold text-xs text-gray-900 dark:text-white">
                  {activeContact.name} <span className="text-gray-400 font-normal">&lt;{activeContact.handleOrPhone}&gt;</span>
                </h5>
                <p className="text-[10px] text-gray-500">to Support • Today, {activeContact.time}</p>
              </div>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">{activeContact.time}</span>
          </div>

          <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed pl-12 space-y-2">
            {activeMessages.map((m) => (
              <p key={m.id}>{renderMessageText(m.text || '', searchQuery)}</p>
            ))}
          </div>

          <div className="pl-12 pt-2">
            <div className="inline-flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-xs">
              <FileText className="w-4 h-4 text-red-500" />
              <span className="font-medium">bon_commande_4829.pdf</span>
              <span className="text-[10px] text-gray-400">(142 KB)</span>
            </div>
          </div>
        </div>

        {/* BOTTOM HALF: Mail Formatting Message Maker & Reply Composer */}
        <div className="h-[260px] flex flex-col bg-gray-50/70 dark:bg-[#1E222A] p-3 shrink-0">
          <div className="flex items-center justify-between pb-2 mb-1 border-b border-gray-200 dark:border-neutral-700 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Reply className="w-4 h-4 text-gray-400" />
              <span>Reply to <strong>{activeContact.name} &lt;{activeContact.handleOrPhone}&gt;</strong></span>
            </div>
            <button
              onClick={() => setInputMessage(`Salam ${activeContact.name},\n\nNous vous confirmons que votre colis est déjà remis à Yalidine Express pour livraison demain matin à domicile.\n\nBien cordialement,\nL'équipe Commerciale El Bahdja`)}
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
    <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#ECECE2] dark:bg-[#0B141A] ${isMobileEmbedded ? 'rounded-b-3xl border-t-0 shadow-none' : 'rounded-3xl border shadow-sm'} border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden relative text-[#1B1B1B]`}>
      {/* Hidden File & Image Pickers */}
      <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

      {/* Channel Header with Dynamic Solid Brand Color */}
      <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 text-white flex items-center justify-between shrink-0 shadow-xs border-b border-black/10 select-none ${isMobileEmbedded ? 'rounded-tr-2xl' : 'rounded-t-3xl'} ${dragHandleProps?.className || "cursor-grab active:cursor-grabbing"}`} style={{ backgroundColor: (APP_GRADIENT_THEMES[appId] || APP_GRADIENT_THEMES.whatsapp).solidColor }}>
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
          {activeContact.profilePicUrl ? (
            <img
              src={activeContact.profilePicUrl}
              alt={activeContact.name}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white/40 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {activeContact.avatarText || activeContact.name?.[0]?.toUpperCase() || 'M'}
            </div>
          )}
          <div className="min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-tight">
              {activeContact.name}
            </h4>
            <p className="text-[9.5px] sm:text-[11px] text-white/90 truncate leading-tight flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block" />
              <span>{activeContact.handleOrPhone || '+213551666104'}</span>
              <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0 inline-block" />
              <span className="opacity-90">{isAiActive ? 'AI' : 'Operat'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 text-white shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              if (isSearchOpen) setSearchQuery('');
            }}
            className={`p-1 sm:p-1.5 rounded-full transition-colors cursor-pointer ${isSearchOpen ? 'bg-white/30 text-white' : 'hover:bg-white/20 text-white'}`}
            title="Search conversation"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button className="p-1 sm:p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer" title="Voice call"><Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
          <button
            type="button"
            onClick={toggleRightHubCollapse}
            className="p-1 sm:p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white hidden md:flex items-center"
            title={isRightHubCollapsed ? "Expand Details Hub" : "Collapse Details Hub"}
          >
            {isRightHubCollapsed ? <PanelRightOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <PanelRightClose className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
          {renderChannelMenu(appId)}
        </div>
      </div>

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

      {/* WhatsApp Doodle Feed */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 bg-whatsapp-doodle custom-scrollbar">
        <div className="hidden sm:flex justify-center my-0.5">
          <div className="bg-[#FFF9C4] dark:bg-[#1E293B] text-[#795548] dark:text-[#E2E8F0] text-[10px] px-2.5 py-0.5 rounded-md shadow-2xs flex items-center gap-1 text-center max-w-md">
            <ShieldCheck className="w-3 h-3 text-[#F57F17] shrink-0" />
            <span>Messages are end-to-end encrypted. {isAiActive ? 'AI active.' : 'Human Operator.'}</span>
          </div>
        </div>

        {filteredWhatsAppMessages.length === 0 && searchQuery ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400 text-xs">
            <Search className="w-6 h-6 mb-2 opacity-40" />
            <p className="font-semibold">No messages found for "{searchQuery}"</p>
            <p className="text-[11px] opacity-70 mt-1">Try searching for other words or names</p>
          </div>
        ) : (
          filteredWhatsAppMessages.map((m) => {
            const isCustomer = m.sender === 'customer';
            const isAi = m.sender === 'ai';
            const isMe = !isCustomer;

            return (
              <div
                key={m.id}
                onMouseEnter={() => setHoveredMessageId(m.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
                className={`flex ${isCustomer ? 'justify-start' : 'justify-end'} group/msg relative`}
              >
                <div
                  onClick={() => setHoveredMessageId(hoveredMessageId === m.id ? null : m.id)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    likeMessage(appId, activeContact.id, m.id);
                  }}
                  className={`relative group/bubble max-w-[78%] cursor-pointer ${m.reactions && m.reactions.length > 0 ? "mb-3.5" : ""}`}
                >
                  {/* Floating Action & Reaction Bar on Hover/Tap */}
                  {hoveredMessageId === m.id && !m.isDeleted && (
                    <div className="absolute -bottom-3.5 right-1 z-30 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150">
                      {renderReactionPicker(m.id, isMe)}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReplyingToMessage(m);
                        }}
                        className="bg-white dark:bg-[#1E222A] p-1.5 rounded-full shadow-md border border-gray-200 dark:border-neutral-700 text-gray-500 hover:text-emerald-500 transition-colors cursor-pointer"
                        title="Quote / Reply to message"
                      >
                        <Reply className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMessage(m.id, 'for_everyone');
                          setHoveredMessageId(null);
                        }}
                        className="bg-white dark:bg-[#1E222A] p-1.5 rounded-full shadow-md border border-gray-200 dark:border-neutral-700 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-3.5 py-2 space-y-1 shadow-xs relative text-xs leading-relaxed ${
                      m.isDeleted
                        ? 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 italic rounded-tr-sm border border-dashed border-gray-300 dark:border-neutral-700'
                        : isCustomer
                        ? 'bg-white dark:bg-[#202C33] text-[#1B1B1B] dark:text-white rounded-tl-sm'
                        : isAi
                        ? 'bg-[#E7F8E8] dark:bg-[#005C4B] text-[#0C381E] dark:text-emerald-100 rounded-tr-sm'
                        : 'bg-[#D9FDD3] dark:bg-[#005C4B] text-[#111B21] dark:text-white rounded-tr-sm'
                    }`}
                  >
                    {!isCustomer && !m.isDeleted && (
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

                    {m.isDeleted ? (
                      <div className="flex items-center gap-1.5 py-0.5 text-xs text-gray-400 dark:text-gray-500 select-none">
                        <Minus className="w-3.5 h-3.5 shrink-0" />
                        <span>🚫 This message was deleted</span>
                      </div>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap font-normal">{renderMessageText(m.text || '', searchQuery)}</p>

                        {/* Attachments: playable voice note, photo, or document */}
                        {renderMessageAttachment(m, isMe)}
                      </>
                    )}

                    <div className="flex justify-end items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 mt-1 select-none">
                      <span>{m.time}</span>
                      {!isCustomer && !m.isDeleted && (
                        m.seen ? (
                          <span className="flex items-center gap-0.5 text-[#53BDEB]" title={m.seenTime ? `Seen ${m.seenTime}` : 'Seen'}>
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-bold">Seen</span>
                          </span>
                        ) : m.delivered !== false ? (
                          <span className="flex items-center gap-0.5 text-gray-400 dark:text-gray-500" title="Delivered">
                            <CheckCheck className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[10px]" title="Sent">✓</span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Reaction badge directly docked under the message bubble */}
                  {m.reactions && m.reactions.length > 0 && (
                    <div className={`absolute -bottom-2.5 ${!isCustomer ? 'right-2' : 'left-2'} z-10 flex items-center gap-1`}>
                      {m.reactions.map((r, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleReact(m.id, r.emoji)}
                          className="inline-flex items-center px-2 py-0.5 rounded-full bg-white dark:bg-[#202C33] shadow-md border border-gray-200 dark:border-neutral-700 text-[11px] font-bold hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                        >
                          {r.emoji} {r.count}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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

      {/* Quick Darija Chips */}
      <div className="px-3.5 py-1.5 bg-[#F0F2F5]/90 dark:bg-[#111B21]/90 border-t border-[#DFDFD4] dark:border-[#2E333D] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] font-extrabold uppercase text-gray-500 dark:text-gray-400 shrink-0 tracking-wider">
          QUICK DARIJA:
        </span>
        <button
          type="button"
          onClick={() => setInputMessage('Salam Mel! Hadi test direct.')}
          className="text-xs px-3 py-1 rounded-full bg-white dark:bg-[#202C33] text-gray-800 dark:text-gray-100 shadow-2xs shrink-0 border border-gray-200 dark:border-neutral-700 hover:border-[#1B6648] font-medium transition-all active:scale-95 cursor-pointer flex items-center gap-1"
        >
          <span>👋</span>
          <span>Salam Marhba</span>
        </button>
        <button
          type="button"
          onClick={() => setInputMessage('Livraison 58 wilayas via Yalidine Express!')}
          className="text-xs px-3 py-1 rounded-full bg-white dark:bg-[#202C33] text-gray-800 dark:text-gray-100 shadow-2xs shrink-0 border border-gray-200 dark:border-neutral-700 hover:border-[#1B6648] font-medium transition-all active:scale-95 cursor-pointer flex items-center gap-1"
        >
          <span>📦</span>
          <span>Yalidine 58 Wilayas</span>
        </button>
      </div>

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
                    {replyingToMessage.text || (replyingToMessage.imageUrl ? '📷 Photo' : '🎤 Voice message')}
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
      </>
    )}
    </div>
  );
};
