"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ContactProfile, ChatMessage, PAIRED_CHATS_BY_APP } from '@/lib/mock_chats';
import { globalOutboundRateLimiter, calculateTypingCadence } from '@/lib/rateLimit';

export interface ChatStoreState {
  activeAppId: string;
  setActiveAppId: (id: string) => void;
  selectedContactId: string;
  setSelectedContactId: (id: string) => void;
  globalUnreadCount: number;
  connectedApps: Set<string>;
  appConnections: Record<string, boolean>;
  isAppConnected: (appId: string) => boolean;
  connectApp: (appId: string) => void;
  disconnectApp: (appId: string) => void;
  dispatchMessageWithCadence: (
    appId: string,
    msg: ChatMessage | string,
    contactId?: string
  ) => Promise<void>;
  aiEnabledByChannel: Record<string, boolean>;
  toggleAiForChannel: (appId: string) => void;
  chatsByApp: Record<string, ContactProfile[]>;
  getChatsForCurrentApp: () => ContactProfile[];
  getCurrentContact: () => ContactProfile | undefined;
  sendMessage: (
    appId: string, 
    contactId: string, 
    text: string, 
    options?: { isAudio?: boolean; audioDuration?: string; imageUrl?: string; fileName?: string; fileSize?: string; replyToId?: string }
  ) => Promise<void>;
  receiveMessage: (
    appId: string, 
    contactId: string, 
    text: string, 
    sender?: 'customer' | 'operator' | 'ai',
    options?: { authorName?: string; hasImages?: boolean; imageUrl?: string; isAudio?: boolean; audioDuration?: string }
  ) => void;
  likeMessage: (appId: string, contactId: string, messageId: string) => void;
  addReaction: (appId: string, contactId: string, messageId: string, emoji: string) => void;
  deleteMessage: (appId: string, contactId: string, messageId: string) => void;
  addContact: (appId: string, contact: ContactProfile) => void;
  deleteContact: (appId: string, contactId: string) => void;
  isRightHubCollapsed: boolean;
  toggleRightHubCollapse: () => void;
  setRightHubCollapsed: (collapsed: boolean) => void;
  activeLightboxImage: string | null;
  activeLightboxType: 'image' | 'video';
  openLightbox: (url: string, type?: 'image' | 'video') => void;
  closeLightbox: () => void;
  replyingToMessage: ChatMessage | null;
  setReplyingToMessage: (msg: ChatMessage | null) => void;
  triggerSync: (appId: string) => Promise<void>;
  activeProfileContact: ContactProfile | null;
  activeProfileAppId?: string;
  openProfile: (contact: ContactProfile, appId?: string) => void;
  closeProfile: () => void;
}

const ChatStoreContext = createContext<ChatStoreState | null>(null);

const INITIAL_AI_STATE: Record<string, boolean> = {
  whatsapp: false,
  whatsapp_2: false,
  instagram: false,
  telegram: false,
  signal: false,
  messenger: false,
  x_twitter: false,
  google_messages: false,
  google_chat: false,
  google_voice: false,
  discord: false,
  slack: false,
  linkedin: false,
  irc: false,
  matrix: false,
  web_widget: false,
  gmail: false,
  viber: false,
  snapchat: false,
};

export const ChatStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeAppId, setActiveAppIdState] = useState<string>('whatsapp');
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [connectedApps, setConnectedApps] = useState<Set<string>>(new Set<string>());
  const [aiEnabledByChannel, setAiEnabledByChannel] = useState<Record<string, boolean>>(INITIAL_AI_STATE);
  const [chatsByApp, setChatsByApp] = useState<Record<string, ContactProfile[]>>(() => {
    // Deep clone initial empty paired chats
    const initial: Record<string, ContactProfile[]> = {};
    for (const key of Object.keys(PAIRED_CHATS_BY_APP)) {
      initial[key] = [...(PAIRED_CHATS_BY_APP[key] || [])];
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cf_live_chats_by_app');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            for (const [k, v] of Object.entries(parsed)) {
              if (Array.isArray(v) && v.length > 0) {
                initial[k] = v as ContactProfile[];
              }
            }
          }
        }
      } catch {}
    }
    return initial;
  });

  const [isRightHubCollapsed, setIsRightHubCollapsed] = useState<boolean>(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [activeLightboxType, setActiveLightboxType] = useState<'image' | 'video'>('image');
  const [replyingToMessage, setReplyingToMessage] = useState<ChatMessage | null>(null);
  const [activeProfileContact, setActiveProfileContact] = useState<ContactProfile | null>(null);
  const [activeProfileAppId, setActiveProfileAppId] = useState<string | undefined>(undefined);

  const openProfile = useCallback((contact: ContactProfile, appId?: string) => {
    setActiveProfileContact(contact);
    setActiveProfileAppId(appId || contact.appId || activeAppId);
  }, [activeAppId]);

  const closeProfile = useCallback(() => {
    setActiveProfileContact(null);
    setActiveProfileAppId(undefined);
  }, []);

  const isClient = typeof window !== 'undefined';

  // Load connected apps & AI state from localStorage
  useEffect(() => {
    if (!isClient) return;
    try {
      const storedConnected = localStorage.getItem('cf_connected_apps');
      if (storedConnected) {
        try {
          const parsed = JSON.parse(storedConnected);
          if (Array.isArray(parsed)) {
            setConnectedApps(new Set<string>(parsed));
          }
        } catch {}
      }

      const storedAi = localStorage.getItem('cf_ai_enabled_channels');
      if (storedAi) {
        try {
          const parsed = JSON.parse(storedAi);
          if (parsed && typeof parsed === 'object') {
            setAiEnabledByChannel({ ...INITIAL_AI_STATE, ...parsed });
          }
        } catch {}
      }

      const storedChats = localStorage.getItem('cf_live_chats_by_app');
      if (storedChats) {
        try {
          const parsed = JSON.parse(storedChats);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            setChatsByApp(prev => ({ ...prev, ...parsed }));
          }
        } catch {}
      }

      const storedCollapsed = localStorage.getItem('cf_hub_collapsed');
      if (storedCollapsed) {
        setIsRightHubCollapsed(storedCollapsed === 'true');
      }
    } catch {}
  }, [isClient]);

  // Persist chatsByApp changes to localStorage
  const saveChatsDebounced = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!isClient) return;
    if (saveChatsDebounced.current) clearTimeout(saveChatsDebounced.current);
    saveChatsDebounced.current = setTimeout(() => {
      try {
        localStorage.setItem('cf_live_chats_by_app', JSON.stringify(chatsByApp));
      } catch (e) {}
    }, 400);
  }, [chatsByApp, isClient]);

  const globalUnreadCount = React.useMemo(() => {
    let count = 0;
    Object.values(chatsByApp).forEach(contacts => {
      if (Array.isArray(contacts)) {
        contacts.forEach(contact => {
          count += (contact?.unreadCount || 0);
        });
      }
    });
    return count;
  }, [chatsByApp]);

  const setActiveAppId = useCallback((id: string) => {
    setActiveAppIdState(id);
    setSelectedContactId('');
    setReplyingToMessage(null);
  }, []);

  const handleSetSelectedContactId = useCallback((id: string) => {
    setSelectedContactId(id);
    if (id && activeAppId) {
      setChatsByApp(prev => {
        const channelChats = prev[activeAppId] || [];
        const contactIndex = channelChats.findIndex(c => c.id === id);
        if (contactIndex === -1 || !channelChats[contactIndex].unreadCount) return prev;
        
        const updatedContact = { ...channelChats[contactIndex], unreadCount: 0 };
        const updatedList = [...channelChats];
        updatedList[contactIndex] = updatedContact;
        return {
          ...prev,
          [activeAppId]: updatedList
        };
      });
    }
  }, [activeAppId]);

  const appConnections = useMemo(() => {
    const res: Record<string, boolean> = {};
    for (const app of Object.keys(PAIRED_CHATS_BY_APP)) {
      res[app] = connectedApps.has(app);
    }
    return res;
  }, [connectedApps]);

  const isAppConnected = useCallback((appId: string) => {
    return connectedApps.has(appId);
  }, [connectedApps]);

  const connectApp = useCallback((appId: string) => {
    setConnectedApps(prev => {
      const next = new Set(prev);
      next.add(appId);
      if (isClient) {
        localStorage.setItem('cf_connected_apps', JSON.stringify(Array.from(next)));
      }
      return next;
    });
  }, [isClient]);

  const disconnectApp = useCallback((appId: string) => {
    setConnectedApps(prev => {
      const next = new Set(prev);
      next.delete(appId);
      if (isClient) {
        localStorage.setItem('cf_connected_apps', JSON.stringify(Array.from(next)));
      }
      return next;
    });
    // F5 FIX: NEVER wipe chatsByApp[appId] = [] on disconnect or unpair!
    // NEVER remove cf_live_chats_by_app from localStorage!
    // Offline cached conversations and messages are preserved intact.
  }, [isClient]);

  const toggleAiForChannel = useCallback((appId: string) => {
    setAiEnabledByChannel(prev => {
      const next = { ...prev, [appId]: !prev[appId] };
      if (isClient) {
        localStorage.setItem('cf_ai_enabled_channels', JSON.stringify(next));
      }
      return next;
    });
  }, [isClient]);

  const toggleRightHubCollapse = useCallback(() => {
    setIsRightHubCollapsed(prev => {
      const next = !prev;
      if (isClient) {
        localStorage.setItem('cf_hub_collapsed', String(next));
      }
      return next;
    });
  }, [isClient]);

  const setRightHubCollapsed = useCallback((collapsed: boolean) => {
    setIsRightHubCollapsed(collapsed);
    if (isClient) {
      localStorage.setItem('cf_hub_collapsed', String(collapsed));
    }
  }, [isClient]);

  const openLightbox = useCallback((url: string, type?: 'image' | 'video') => {
    setActiveLightboxImage(url);
    const isVid = type === 'video' || /\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i.test(url) || url.includes('video=1') || url.includes('video');
    setActiveLightboxType(isVid ? 'video' : 'image');
  }, []);

  const closeLightbox = useCallback(() => {
    setActiveLightboxImage(null);
    setActiveLightboxType('image');
  }, []);

  const getChatsForCurrentApp = useCallback(() => {
    return chatsByApp[activeAppId] || [];
  }, [chatsByApp, activeAppId]);

  const getCurrentContact = useCallback(() => {
    const list = chatsByApp[activeAppId] || [];
    return list.find(c => c.id === selectedContactId) || list[0];
  }, [chatsByApp, activeAppId, selectedContactId]);

  const addContact = useCallback((appId: string, contact: ContactProfile) => {
    setChatsByApp(prev => {
      const currentList = prev[appId] || [];
      const exists = currentList.some(c => c.id === contact.id);
      if (exists) return prev;
      return {
        ...prev,
        [appId]: [contact, ...currentList]
      };
    });
  }, []);

  const deleteContact = useCallback((appId: string, contactId: string) => {
    setChatsByApp(prev => {
      const currentList = prev[appId] || [];
      const updated = currentList.filter(c => c.id !== contactId);
      return {
        ...prev,
        [appId]: updated
      };
    });

    if (isClient) {
      try {
        const stored = localStorage.getItem('cf_live_chats_by_app');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed[appId]) {
            parsed[appId] = (parsed[appId] as any[]).filter((c: any) => c.id !== contactId);
            localStorage.setItem('cf_live_chats_by_app', JSON.stringify(parsed));
          }
        }
        const storedConvs = localStorage.getItem('cf_conversations');
        if (storedConvs) {
          const parsedConvs = JSON.parse(storedConvs);
          delete parsedConvs[contactId];
          localStorage.setItem('cf_conversations', JSON.stringify(parsedConvs));
        }
        window.dispatchEvent(new Event('storage'));
      } catch {}
    }

    if (activeProfileContact?.id === contactId) {
      closeProfile();
    }
  }, [isClient, activeProfileContact, closeProfile]);

  // Dispatch incoming or simulated customer message
  const receiveMessage = useCallback((
    appId: string, 
    contactId: string, 
    text: string, 
    sender: 'customer' | 'operator' | 'ai' = 'customer',
    options?: { authorName?: string; hasImages?: boolean; imageUrl?: string; isAudio?: boolean; audioDuration?: string }
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sender,
      text,
      time: timeStr,
      timestamp: Date.now(),
      seen: sender !== 'customer',
      delivered: true,
      hasImages: options?.hasImages,
      imageUrl: options?.imageUrl,
      isAudio: options?.isAudio,
      audioDuration: options?.audioDuration,
      authorName: options?.authorName
    };

    setChatsByApp(prev => {
      const channelChats = prev[appId] || [];
      const contactIndex = channelChats.findIndex(c => c.id === contactId);

      if (contactIndex === -1) {
        // If contact doesn't exist yet, create a new one
        const newContact: ContactProfile = {
          id: contactId,
          appId,
          name: options?.authorName || 'New Contact',
          handleOrPhone: contactId,
          statusText: 'Active',
          lastMessage: text,
          lastMessageTime: timeStr,
          timestamp: Date.now(),
          unreadCount: sender === 'customer' ? 1 : 0,
          messages: [newMsg]
        };
        return {
          ...prev,
          [appId]: [newContact, ...channelChats]
        };
      }

      const updatedContact = {
        ...channelChats[contactIndex],
        lastMessage: text,
        lastMessageTime: timeStr,
        timestamp: Date.now(),
        unreadCount: sender === 'customer' ? (channelChats[contactIndex].unreadCount || 0) + 1 : 0,
        messages: [...(channelChats[contactIndex].messages || []), newMsg]
      };

      const updatedList = [...channelChats];
      updatedList.splice(contactIndex, 1);
      return {
        ...prev,
        [appId]: [updatedContact, ...updatedList]
      };
    });

    // Check if AI Auto-Reply should respond with human cadence
    if (sender === 'customer' && aiEnabledByChannel[appId]) {
      const cadenceDelay = calculateTypingCadence(text);
      setTimeout(async () => {
        try {
          const res = await fetch('/api/ai/auto-reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appId,
              contactId,
              messageText: text,
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.replyText) {
              receiveMessage(appId, contactId, data.replyText, 'ai', { authorName: 'AI Agent' });
            }
          }
        } catch (err) {
          console.error('AI auto-reply request error:', err);
        }
      }, cadenceDelay);
    }
  }, [aiEnabledByChannel]);

  // Dispatch outgoing message
  const sendMessage = useCallback(async (
    appId: string, 
    contactId: string, 
    text: string, 
    options?: { isAudio?: boolean; audioDuration?: string; imageUrl?: string; fileName?: string; fileSize?: string; replyToId?: string }
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: `msg_out_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sender: 'operator',
      text,
      time: timeStr,
      timestamp: Date.now(),
      seen: false,
      delivered: true,
      hasImages: Boolean(options?.imageUrl),
      imageUrl: options?.imageUrl,
      isAudio: options?.isAudio,
      audioDuration: options?.audioDuration,
      fileName: options?.fileName,
      fileSize: options?.fileSize
    };

    setChatsByApp(prev => {
      const channelChats = prev[appId] || [];
      const contactIndex = channelChats.findIndex(c => c.id === contactId);

      if (contactIndex === -1) return prev;

      const updatedContact = {
        ...channelChats[contactIndex],
        lastMessage: text || (options?.isAudio ? 'Voice message' : 'Photo'),
        lastMessageTime: timeStr,
        timestamp: Date.now(),
        messages: [...(channelChats[contactIndex].messages || []), newMsg]
      };

      const updatedList = [...channelChats];
      updatedList.splice(contactIndex, 1);
      return {
        ...prev,
        [appId]: [updatedContact, ...updatedList]
      };
    });

    // Clear replying state after sending
    setReplyingToMessage(null);

    // Call backend API if live channel
    try {
      const sendEndpoint = `/api/channels/${appId}/send`;
      let token = '';
      let session = '';
      let accessToken = '';
      let igId = '';
      let pageId = '';
      try {
        if (typeof window !== 'undefined') {
          session = localStorage.getItem(`cf_${appId}_session`) || localStorage.getItem('cf_telegram_session') || '';
          token = localStorage.getItem(`cf_${appId}_token`) || localStorage.getItem('cf_telegram_token') || '';
          const metaAuth = localStorage.getItem('cf_meta_auth');
          if (metaAuth) {
            const p = JSON.parse(metaAuth);
            accessToken = p.userToken || '';
            if (p.instagramAccounts?.[0]) {
              igId = p.instagramAccounts[0].igId || p.instagramAccounts[0].id || '';
              pageId = p.instagramAccounts[0].pageId || '';
            }
          }
          if (!accessToken && appId === 'instagram') {
            const igAcc = localStorage.getItem('cf_ig_account');
            if (igAcc) {
              const p = JSON.parse(igAcc);
              accessToken = p.pageAccessToken || p.accessToken || '';
              igId = p.igId || p.id || '';
              pageId = p.pageId || '';
            }
          }
          if (!accessToken && appId === 'messenger') {
            const page = localStorage.getItem('cf_messenger_page');
            if (page) accessToken = JSON.parse(page)?.accessToken || '';
          }
          if (!token && appId === 'discord') {
            token = localStorage.getItem('cf_discord_token') || '';
          }
        }
      } catch {}

      await fetch(sendEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: contactId,
          remoteJid: contactId,
          chatId: contactId,
          text,
          mediaUrl: options?.imageUrl,
          isAudio: options?.isAudio,
          token,
          session,
          accessToken,
          igId,
          pageId
        })
      });
    } catch (e) {
      // Backend send failure is gracefully handled in UI
    }
  }, []);

  // Outbound rate-limiting queue & human typing cadence dispatcher (F4)
  const dispatchMessageWithCadence = useCallback(async (
    appId: string, 
    msg: ChatMessage | string, 
    contactId?: string
  ) => {
    const text = typeof msg === 'string' ? msg : msg.text;
    const targetContactId = contactId || (typeof msg !== 'string' ? (msg as any).recipientId || selectedContactId : selectedContactId);
    
    // Calculate human typing duration (1.2s - 3.5s)
    const typingDuration = calculateTypingCadence(text);
    await new Promise((resolve) => setTimeout(resolve, typingDuration));

    // Await token-bucket capacity (burst max 3, 1 msg / 1.5s, min spacing 1.2s)
    await globalOutboundRateLimiter.acquire(appId);

    // Dispatch message through sendMessage
    if (targetContactId) {
      await sendMessage(appId, targetContactId, text, typeof msg !== 'string' ? {
        imageUrl: msg.imageUrl,
        isAudio: msg.isAudio,
        audioDuration: msg.audioDuration,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
      } : undefined);
    }
  }, [selectedContactId, sendMessage]);

  // Micro-interaction: Double tap / double click to like a message
  const likeMessage = useCallback((appId: string, contactId: string, messageId: string) => {
    setChatsByApp(prev => {
      const channelChats = prev[appId] || [];
      const contactIndex = channelChats.findIndex(c => c.id === contactId);
      if (contactIndex === -1) return prev;

      const contact = channelChats[contactIndex];
      const updatedMessages = (contact.messages || []).map(msg => {
        if (msg.id !== messageId) return msg;
        const currentReactions = msg.reactions || [];
        const heartReaction = currentReactions.find(r => r.emoji === '❤️');

        let newReactions;
        if (heartReaction && heartReaction.userReacted) {
          // Toggle off
          newReactions = currentReactions
            .map(r => r.emoji === '❤️' ? { ...r, count: r.count - 1, userReacted: false } : r)
            .filter(r => r.count > 0);
        } else if (heartReaction) {
          // React
          newReactions = currentReactions.map(r => r.emoji === '❤️' ? { ...r, count: r.count + 1, userReacted: true } : r);
        } else {
          // Add first heart
          newReactions = [...currentReactions, { emoji: '❤️', count: 1, userReacted: true }];
        }

        return {
          ...msg,
          reactions: newReactions
        };
      });

      const updatedContact = { ...contact, messages: updatedMessages };
      const updatedList = [...channelChats];
      updatedList[contactIndex] = updatedContact;
      return {
        ...prev,
        [appId]: updatedList
      };
    });
  }, []);

  const addReaction = useCallback((appId: string, contactId: string, messageId: string, emoji: string) => {
    setChatsByApp(prev => {
      const channelChats = prev[appId] || [];
      const contactIndex = channelChats.findIndex(c => c.id === contactId);
      if (contactIndex === -1) return prev;

      const contact = channelChats[contactIndex];
      const updatedMessages = (contact.messages || []).map(msg => {
        if (msg.id !== messageId) return msg;
        const currentReactions = msg.reactions || [];
        const existing = currentReactions.find(r => r.emoji === emoji);

        let newReactions;
        if (existing) {
          newReactions = currentReactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, userReacted: true } : r);
        } else {
          newReactions = [...currentReactions, { emoji, count: 1, userReacted: true }];
        }

        return { ...msg, reactions: newReactions };
      });

      const updatedContact = { ...contact, messages: updatedMessages };
      const updatedList = [...channelChats];
      updatedList[contactIndex] = updatedContact;
      return {
        ...prev,
        [appId]: updatedList
      };
    });
  }, []);

  const deleteMessage = useCallback((appId: string, contactId: string, messageId: string) => {
    setChatsByApp(prev => {
      const channelChats = prev[appId] || [];
      const contactIndex = channelChats.findIndex(c => c.id === contactId);
      if (contactIndex === -1) return prev;

      const contact = channelChats[contactIndex];
      const updatedMessages = (contact.messages || []).map(msg => {
        if (msg.id !== messageId) return msg;
        return { ...msg, isDeleted: true, text: 'This message was deleted' };
      });

      const updatedContact = { ...contact, messages: updatedMessages };
      const updatedList = [...channelChats];
      updatedList[contactIndex] = updatedContact;
      return {
        ...prev,
        [appId]: updatedList
      };
    });
  }, []);

  // Background Live Sync Bridge
  const triggerSync = useCallback(async (appId: string) => {
    if (!connectedApps.has(appId)) return;
    try {
      let url = `/api/channels/${appId}/chats`;
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem(`cf_${appId}_token`);
        if (storedToken) {
          url += `?token=${encodeURIComponent(storedToken)}&botToken=${encodeURIComponent(storedToken)}`;
        }
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.chats) && data.chats.length > 0) {
          setChatsByApp(prev => ({
            ...prev,
            [appId]: data.chats
          }));
        }
      }
    } catch (e) {
      // Sync failure is silent in background
    }
  }, [connectedApps]);

  // Automated sync when active channel changes or is connected
  useEffect(() => {
    if (!connectedApps.has(activeAppId)) return;
    triggerSync(activeAppId);
    const interval = setInterval(() => {
      triggerSync(activeAppId);
    }, 12000);
    return () => clearInterval(interval);
  }, [activeAppId, connectedApps, triggerSync]);

  return (
    <ChatStoreContext.Provider
      value={{
        activeAppId,
        setActiveAppId,
        selectedContactId,
        setSelectedContactId: handleSetSelectedContactId,
        globalUnreadCount,
        connectedApps,
        appConnections,
        isAppConnected,
        connectApp,
        disconnectApp,
        dispatchMessageWithCadence,
        aiEnabledByChannel,
        toggleAiForChannel,
        chatsByApp,
        getChatsForCurrentApp,
        getCurrentContact,
        sendMessage,
        receiveMessage,
        likeMessage,
        addReaction,
        deleteMessage,
        addContact,
        deleteContact,
        isRightHubCollapsed,
        toggleRightHubCollapse,
        setRightHubCollapsed,
        activeLightboxImage,
        activeLightboxType,
        openLightbox,
        closeLightbox,
        replyingToMessage,
        setReplyingToMessage,
        triggerSync,
        activeProfileContact,
        activeProfileAppId,
        openProfile,
        closeProfile,
      }}
    >
      {children}
    </ChatStoreContext.Provider>
  );
};

export const useChatStore = () => {
  const ctx = useContext(ChatStoreContext);
  if (!ctx) {
    throw new Error('useChatStore must be used within a ChatStoreProvider');
  }
  return ctx;
};
