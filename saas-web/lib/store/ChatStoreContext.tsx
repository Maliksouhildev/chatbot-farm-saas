"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ContactProfile, ChatMessage, PAIRED_CHATS_BY_APP } from '@/lib/mock_chats';

export interface ChatStoreState {
  activeAppId: string;
  setActiveAppId: (id: string) => void;
  selectedContactId: string;
  setSelectedContactId: (id: string) => void;
  globalUnreadCount: number;
  connectedApps: Set<string>;
  isAppConnected: (appId: string) => boolean;
  connectApp: (appId: string) => void;
  disconnectApp: (appId: string) => void;
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
  isRightHubCollapsed: boolean;
  toggleRightHubCollapse: () => void;
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
        setConnectedApps(new Set<string>(JSON.parse(storedConnected)));
      }
      const storedAi = localStorage.getItem('cf_ai_enabled_channels');
      if (storedAi) {
        setAiEnabledByChannel({ ...INITIAL_AI_STATE, ...JSON.parse(storedAi) });
      }
      const storedChats = localStorage.getItem('cf_live_chats_by_app');
      if (storedChats) {
        setChatsByApp(prev => ({ ...prev, ...JSON.parse(storedChats) }));
      }
      const storedCollapsed = localStorage.getItem('cf_hub_collapsed');
      if (storedCollapsed) {
        setIsRightHubCollapsed(storedCollapsed === 'true');
      }
    } catch (e) {
      console.error('Error loading stored chat state:', e);
    }
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
      contacts.forEach(contact => {
        count += (contact.unreadCount || 0);
      });
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
    // Reset contacts for that channel
    setChatsByApp(prev => ({
      ...prev,
      [appId]: []
    }));
    if (activeAppId === appId) {
      setSelectedContactId('');
    }
  }, [activeAppId, isClient]);

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

    // Check if AI Auto-Reply should respond
    if (sender === 'customer' && aiEnabledByChannel[appId]) {
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
      }, 1200);
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
        lastMessage: text || (options?.isAudio ? '🎤 Voice message' : '📷 Image'),
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
      await fetch(sendEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: contactId,
          text,
          mediaUrl: options?.imageUrl,
          isAudio: options?.isAudio
        })
      });
    } catch (e) {
      // Backend send failure is gracefully handled in UI
    }
  }, []);

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
      const res = await fetch(`/api/channels/${appId}/chats`);
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

  // Periodic automated polling when a channel is connected (every 12 seconds)
  useEffect(() => {
    if (!connectedApps.has(activeAppId)) return;
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
        isAppConnected,
        connectApp,
        disconnectApp,
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
        isRightHubCollapsed,
        toggleRightHubCollapse,
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
