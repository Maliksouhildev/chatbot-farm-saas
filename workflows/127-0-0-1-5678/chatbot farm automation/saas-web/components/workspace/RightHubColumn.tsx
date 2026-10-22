"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  CheckCircle2, 
  Clock, 
  Search, 
  BarChart2, 
  TrendingUp, 
  ShoppingBag, 
  Truck,
  Building2,
  Utensils,
  Sparkles,
  Settings,
  Key,
  Eye,
  EyeOff,
  Globe,
  MessageSquare,
  ShieldCheck,
  Zap,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Code,
  Activity,
  RefreshCw,
  Sliders,
  BellRing,
  UserPlus,
  Hash,
  Plus,
  X,
  User,
  Unlink,
  ChevronDown,
  Mic,
  MicOff,
  Headphones,
  Compass,
  Gift,
  Smile,
  Volume2,
  Lock,
  Megaphone,
  Pin,
  AlertTriangle,
  AlertCircle,
  QrCode,
  Phone,
  PhoneMissed,
  PhoneIncoming,
  PhoneOutgoing,
  Video,
  Star,
  Inbox,
  Tag,
  Bell,
  Bookmark,
  FileText,
  Image as ImageIcon,
  Send,
  Trash2,
  MoreVertical,
  RotateCcw,
  Camera,
  CheckCheck,
  MapPin
} from 'lucide-react';
import { DiscordIcon } from '@/components/icons/BrandIcons';
import { MOCK_CONTACTS_BY_APP, ContactProfile, APP_GRADIENT_THEMES, getContactsForApp, isLightColor } from '@/lib/mock_chats';
import { decodeHtmlEntities, extractTopicGlyphAndTitle, formatTopicDate } from './MiddleChatColumn';

import { PhoneInput } from './PhoneInput';
import { WhatsAppAvatar } from './WhatsAppAvatar';
import { BOT_TEST_AVATAR } from '@/lib/whatsapp_avatars';
import { useChatStore } from '@/lib/store/ChatStoreContext';
import { UserProfileModal } from './UserProfileModal';
import { ScrollingGroupTitle } from './ScrollingGroupTitle';
import { PullToRefresh } from './PullToRefresh';




export interface BotPresetConfig {
  id: string;
  name: string;
  icon: string;
  botName: string;
  businessName: string;
  primaryLanguage: 'darija_latin' | 'darija_arabic' | 'french' | 'english';
  basePersona: string;
  customInstructions: string;
  contactHumanNumber: string;
  n8nWebhookUrl?: string;
  useN8nRouter?: boolean;
}

export const DEFAULT_BOT_PRESETS: BotPresetConfig[] = [
  {
    id: 'ecommerce_dz',
    name: 'E-Commerce & Yalidine COD',
    icon: 'ecommerce_dz',
    botName: 'Bot Test',
    businessName: 'Boutique DZ',
    primaryLanguage: 'darija_latin',
    basePersona: 'Vendeur commercial algérien chaleureux, rapide et accueillant.',
    customInstructions: 'Prix en Dinars (DA / alf). Livraison 58 wilayas via Yalidine (400 DA Alger, 700 DA autres wilayas). Paiement à la livraison.',
    contactHumanNumber: '0551671229',
    n8nWebhookUrl: 'http://localhost:5678/webhook/farm-router',
    useN8nRouter: false,
  },
  {
    id: 'conciergerie',
    name: 'Conciergerie & Locations DZ',
    icon: 'conciergerie',
    botName: 'Concierge El Djazaïr',
    businessName: 'Appartements & Suites Alger',
    primaryLanguage: 'darija_latin',
    basePersona: 'Concierge bilingue Darija/Français pour accueil clients et appartements.',
    customInstructions: 'Gérer les clés (boîte à clé), règles de maison (calme le soir, balcon pour fumer), contrat de location et paiement.',
    contactHumanNumber: '0550123456',
    n8nWebhookUrl: 'http://localhost:5678/webhook/farm-router',
    useN8nRouter: false,
  },
  {
    id: 'restaurant_food',
    name: 'Restaurant & Fast Food',
    icon: 'restaurant_food',
    botName: 'Chef Service Client',
    businessName: 'Snack & Grill Alger',
    primaryLanguage: 'darija_latin',
    basePersona: 'Prise de commande rapide en Darija pour plats, burgers et grillades.',
    customInstructions: 'Confirmer le menu, boissons, temps de préparation (20-30 min) et adresse de livraison exacte.',
    contactHumanNumber: '0555987654',
    n8nWebhookUrl: 'http://localhost:5678/webhook/farm-router',
    useN8nRouter: false,
  },
  {
    id: 'customer_care',
    name: 'Support Client & SAV',
    icon: 'customer_care',
    botName: 'Support Technique DZ',
    businessName: 'Service Après-Vente',
    primaryLanguage: 'darija_latin',
    basePersona: 'Support technique patient et courtois avec escalade opérateur.',
    customInstructions: 'Aider au dépannage, répondre aux garanties, proposer le contact direct avec l\'administrateur si problème bloquant.',
    contactHumanNumber: '0551671229',
    n8nWebhookUrl: 'http://localhost:5678/webhook/farm-router',
    useN8nRouter: false,
  },
  {
    id: 'custom_bot',
    name: 'Configuration Personnalisée',
    icon: 'custom_bot',
    botName: 'Mon Assistant IA',
    businessName: 'Mon Entreprise',
    primaryLanguage: 'darija_latin',
    basePersona: 'Assistant IA personnalisé selon les besoins du magasin.',
    customInstructions: 'Instructions spécifiques configurées par le gérant.',
    contactHumanNumber: '0550000000',
    n8nWebhookUrl: 'http://localhost:5678/webhook/farm-router',
    useN8nRouter: false,
  },
];

interface RightHubColumnProps {
  selectedAppId: string;
  selectedContactId?: string;
  selectedTopicId?: string;
  onSelectChat: (chatId: string) => void;
  onSelectTopic?: (topicId: string, contactId?: string) => void;
  onMarkAsRead?: (appId: string, contactId: string, topicId?: string) => void;
  isAiActive?: boolean;
  onToggleAi?: () => void;
  isConnected?: boolean;
  activeTabOverride?: 'contacts' | 'analytics' | 'settings';
  liveContacts?: ContactProfile[];
  currentUser?: any;
  onContactAdded?: (contact: ContactProfile) => void;
  onDisconnectChannel?: (channelId: string) => void;
  dragHandleProps?: any;
  isStandalone?: boolean;
  detachedTabs?: string[];
  onDetach?: (tab: string) => void;
  onReattach?: () => void;
  onOpenConnect?: () => void;
  channelError?: string;
}

export const RightHubColumn: React.FC<RightHubColumnProps> = ({
  selectedAppId,
  selectedContactId,
  selectedTopicId,
  onSelectChat,
  onSelectTopic,
  onMarkAsRead,
  isAiActive = true,
  onToggleAi,
  isConnected = false,
  activeTabOverride,
  liveContacts,
  currentUser,
  onContactAdded,
  onDisconnectChannel,
  dragHandleProps,
  isStandalone,
  detachedTabs = [],
  onDetach,
  onReattach,
  onOpenConnect,
  channelError,
}) => {
  const {
    activeProfileContact,
    activeProfileAppId,
    openProfile,
    closeProfile,
    deleteContact
  } = useChatStore();

  const [activeTab, setActiveTab] = useState<'contacts' | 'analytics' | 'settings'>(activeTabOverride || 'contacts');
  const [isSimulatingLoad] = useState(false);

  useEffect(() => {
    if (activeTabOverride) {
      setActiveTab(activeTabOverride);
    }
  }, [activeTabOverride]);
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Real Add Client Modal States
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [newClientHandle, setNewClientHandle] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientMsg, setNewClientMsg] = useState('');
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [localAddedContacts, setLocalAddedContacts] = useState<ContactProfile[]>([]);
  const [removedBotAppIds, setRemovedBotAppIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cf_removed_test_bots');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });

  // Gmail Authentic Tab, Multi-Select & Favorite Star State
  const [gmailTab, setGmailTab] = useState<string>('primary');
  const [selectedEmailIds, setSelectedEmailIds] = useState<Set<string>>(new Set());
  const [starredEmailIds, setStarredEmailIds] = useState<Set<string>>(new Set());

  const toggleSelectEmail = (id: string) => {
    setSelectedEmailIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllEmails = (emails: ContactProfile[]) => {
    setSelectedEmailIds((prev) => {
      if (prev.size === emails.length && emails.length > 0) {
        return new Set();
      }
      return new Set(emails.map((e) => e.id));
    });
  };

  const toggleStarEmail = (id: string) => {
    setStarredEmailIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const GMAIL_DEFAULT_TABS = [
    { id: 'primary', label: 'Principale', icon: <Inbox className="w-4 h-4" /> },
    { id: 'promotions', label: 'Promotions', icon: <Tag className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'important', label: 'Important', icon: <Bookmark className="w-4 h-4" /> },
    { id: 'starred', label: 'Messages suivis', icon: <Star className="w-4 h-4" /> },
    { id: 'sent', label: 'Envoyés', icon: <Send className="w-4 h-4" /> },
    { id: 'spam', label: 'Spam', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'trash', label: 'Corbeille', icon: <Trash2 className="w-4 h-4" /> },
  ];

  const gmailTabsList = useMemo(() => {
    const list = [...GMAIL_DEFAULT_TABS];
    try {
      const raw = localStorage.getItem('cf_gmail_labels');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const l of parsed) {
            if (l.type === 'user' && l.name && !list.some((t) => t.id === l.id || t.label.toLowerCase() === l.name.toLowerCase())) {
              list.push({
                id: l.id,
                label: l.name,
                icon: <Bookmark className="w-4 h-4 text-purple-500" />
              });
            }
          }
        }
      }
    } catch {}
    return list;
  }, []);

  // Discord Interactive Controls State
  const [isDiscordMicMuted, setIsDiscordMicMuted] = useState(true);
  const [isDiscordDeafened, setIsDiscordDeafened] = useState(false);

  // Inbox sync state
  const [isSyncingInbox, setIsSyncingInbox] = useState(false);
  const [syncNotice, setSyncNotice] = useState<{ type: 'success' | 'warning' | 'error' | 'info'; text: string; requiresQr?: boolean } | null>(null);

  const handleSyncInbox = async () => {
    setIsSyncingInbox(true);
    setSyncNotice(null);
    try {
      const syncEndpoint = selectedAppId === 'instagram' 
        ? '/api/channels/instagram/sync' 
        : `/api/channels/${selectedAppId}/sync`;

      let sessionId = '';
      let username = '';
      try {
        const ig = localStorage.getItem('cf_ig_account');
        if (ig) {
          const p = JSON.parse(ig);
          sessionId = p.sessionId || '';
          username = p.username || '';
        }
      } catch {}

      const res = await fetch(syncEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'auto_import',
          userId: currentUser?.id,
          username,
          sessionId,
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.threads)) {
        data.threads.forEach((t: any) => {
          if (t.contact) {
            onContactAdded?.(t.contact);
          }
        });
        setSyncNotice({ type: 'success', text: data.message || `Imported ${data.threads.length} conversations` });
        setTimeout(() => setSyncNotice(null), 3500);
      } else if (data.requiresLink || data.connected === false || data.status === 'close' || (data.message && data.message.includes('401'))) {
        setSyncNotice({
          type: 'warning',
          text: data.message || 'Session WhatsApp déconnectée du téléphone (Erreur 401).',
          requiresQr: true,
        });
      } else if (data.message) {
        setSyncNotice({ type: 'info', text: data.message });
        setTimeout(() => setSyncNotice(null), 3500);
      }
    } catch (e: any) {
      setSyncNotice({ type: 'error', text: e.message || 'Sync failed' });
      setTimeout(() => setSyncNotice(null), 3500);
    } finally {
      setIsSyncingInbox(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = newClientHandle.trim().replace(/^@/, '');
    if (!cleanHandle) return;
    setIsAddingClient(true);
    try {
      const addEndpoint = selectedAppId === 'instagram' 
        ? '/api/channels/instagram/sync' 
        : `/api/channels/${selectedAppId}/sync`;

      let sessionId = '';
      try {
        const ig = localStorage.getItem('cf_ig_account');
        if (ig) sessionId = JSON.parse(ig).sessionId || '';
      } catch {}

      let createdContact: any = null;

      try {
        const res = await fetch(addEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'add_contact',
            userId: currentUser?.id,
            sessionId,
            contactData: {
              handle: cleanHandle,
              name: newClientName.trim() || cleanHandle,
              initialMessage: newClientMsg.trim() || 'Bonjour !',
            }
          })
        });
        const data = await res.json().catch(() => null);
        if (data?.success && data?.contact) {
          createdContact = { ...data.contact, appId: selectedAppId };
        }
      } catch {}

      if (!createdContact) {
        const isPhone = cleanHandle.startsWith('+') || /^\d{7,15}$/.test(cleanHandle.replace(/\s+/g, ''));
        const contactId = `${selectedAppId}_${cleanHandle.replace(/\s+/g, '_')}`;
        createdContact = {
          id: contactId,
          appId: selectedAppId,
          name: newClientName.trim() || cleanHandle,
          handleOrPhone: cleanHandle,
          phone: isPhone ? cleanHandle : undefined,
          username: !isPhone ? (cleanHandle.startsWith('@') ? cleanHandle : `@${cleanHandle}`) : undefined,
          avatarColor: currentAppTheme.solidColor || '#7360F2',
          statusText: 'En ligne',
          lastMessage: newClientMsg.trim() || 'Bonjour !',
          time: 'Just now',
          lastMessageTime: 'Just now',
          timestamp: Date.now(),
          unreadCount: 0,
          status: 'ongoing',
          messages: [
            {
              id: `msg_${Date.now()}`,
              sender: 'operator',
              text: newClientMsg.trim() || 'Bonjour !',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              seen: true,
              seenTime: 'Just now',
              delivered: true,
              timestamp: Date.now(),
            }
          ]
        };
      }

      setLocalAddedContacts((prev) => [createdContact, ...prev]);
      onContactAdded?.(createdContact);
      onSelectChat(createdContact.id);

      // Persist to cf_live_chats_by_app
      try {
        const currentLive = JSON.parse(localStorage.getItem('cf_live_chats_by_app') || '{}');
        const appChats = currentLive[selectedAppId] || [];
        const existingIdx = appChats.findIndex((c: any) => c.id === createdContact.id);
        if (existingIdx >= 0) {
          appChats[existingIdx] = createdContact;
        } else {
          appChats.unshift(createdContact);
        }
        currentLive[selectedAppId] = appChats;
        localStorage.setItem('cf_live_chats_by_app', JSON.stringify(currentLive));
        window.dispatchEvent(new Event('storage'));
      } catch {}

      setIsAddClientModalOpen(false);
      setNewClientHandle('');
      setNewClientName('');
      setNewClientMsg('');
    } catch (err) {
      console.warn('Failed to add client:', err);
    } finally {
      setIsAddingClient(false);
    }
  };
  
  // Real dynamic channel credentials
  const [metaToken, setMetaToken] = useState('');
  const [metaHandle, setMetaHandle] = useState('');
  const [tgToken, setTgToken] = useState('');
  const [tgHandle, setTgHandle] = useState('');
  const [messengerPageId, setMessengerPageId] = useState('');
  const [messengerToken, setMessengerToken] = useState('');
  const [gmailAddr, setGmailAddr] = useState('');
  const [discordAccount, setDiscordAccount] = useState<any>(null);
  const [origin, setOrigin] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // Multi-Bot assignment for active channel
  const [assignedBot, setAssignedBot] = useState<{ id: string; name: string; avatar: string } | null>(null);
  const [availableBots, setAvailableBots] = useState<any[]>([]);
  const [isBotDropdownOpen, setIsBotDropdownOpen] = useState(false);
  const botDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (botDropdownRef.current && !botDropdownRef.current.contains(event.target as Node)) {
        setIsBotDropdownOpen(false);
      }
    };
    if (isBotDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBotDropdownOpen]);

  useEffect(() => {
    try {
      const ig = localStorage.getItem('cf_ig_account');
      if (ig) {
        const p = JSON.parse(ig);
        setMetaHandle(p.username ? `@${p.username}` : (p.name || ''));
        setMetaToken(p.pageAccessToken || p.accessToken || '');
      } else {
        const auth = localStorage.getItem('cf_meta_auth');
        if (auth) {
          const p = JSON.parse(auth);
          setMetaToken(p.userToken || '');
          if (p.instagramAccounts?.[0]?.username) {
            setMetaHandle(`@${p.instagramAccounts[0].username}`);
          }
        }
      }

      const tg = localStorage.getItem('cf_telegram_bot');
      if (tg) {
        const p = JSON.parse(tg);
        setTgHandle(p.username ? `@${p.username}` : '');
      }
      setTgToken(localStorage.getItem('cf_telegram_token') || '');

      const disc = localStorage.getItem('cf_discord_account');
      if (disc) {
        setDiscordAccount(JSON.parse(disc));
      } else {
        setDiscordAccount(null);
      }

      const fb = localStorage.getItem('cf_messenger_page');
      if (fb) {
        const p = JSON.parse(fb);
        setMessengerPageId(p.id || '');
        setMessengerToken(p.accessToken || '');
      }

      const gm = localStorage.getItem('cf_gmail_account');
      if (gm) {
        const p = JSON.parse(gm);
        setGmailAddr(p.email || '');
      }

      // Check assigned bot
      const botsStr = localStorage.getItem('cf_bots_list');
      if (botsStr) {
        const list = JSON.parse(botsStr);
        setAvailableBots(list);
        const bot = list.find((b: any) => b.assignedApps && b.assignedApps.includes(selectedAppId));
        setAssignedBot(bot || null);
      }
    } catch {}
  }, [selectedAppId]);

  const handleAssignBotToChannel = (botId: string) => {
    try {
      const botsStr = localStorage.getItem('cf_bots_list');
      if (botsStr) {
        const list = JSON.parse(botsStr);
        const updated = list.map((b: any) => {
          if (botId && b.id === botId) {
            const has = b.assignedApps?.includes(selectedAppId);
            return {
              ...b,
              assignedApps: has ? b.assignedApps : [...(b.assignedApps || []), selectedAppId]
            };
          } else {
            return {
              ...b,
              assignedApps: (b.assignedApps || []).filter((a: string) => a !== selectedAppId)
            };
          }
        });
        localStorage.setItem('cf_bots_list', JSON.stringify(updated));
        if (botId) {
          localStorage.setItem(`cf_assigned_bot_${selectedAppId}`, botId);
        } else {
          localStorage.removeItem(`cf_assigned_bot_${selectedAppId}`);
        }
        setAvailableBots(updated);
        const target = botId ? updated.find((b: any) => b.id === botId) : null;
        setAssignedBot(target || null);
      }
    } catch {}
  };

  useEffect(() => {
    try {
      const storedLive = localStorage.getItem('cf_live_chats_by_app');
      if (storedLive) {
        let changed = false;
        const parsedLive = JSON.parse(storedLive);
        for (const appId in parsedLive) {
          if (Array.isArray(parsedLive[appId])) {
            parsedLive[appId] = parsedLive[appId].map((c: any) => {
              if (c.id?.startsWith('sandbox_bot_') || (c.name && (c.name.toLowerCase().includes('el bahdja') || c.name.toLowerCase().includes('bt test') || c.name.toLowerCase().includes('bot test')))) {
                changed = true;
                return { ...c, name: 'Bot Test', avatar: BOT_TEST_AVATAR, profilePicUrl: BOT_TEST_AVATAR, isAiTestBot: true, isPinned: true };
              }
              return c;
            });
          }
        }
        if (changed) {
          localStorage.setItem('cf_live_chats_by_app', JSON.stringify(parsedLive));
          window.dispatchEvent(new Event('storage'));
        }
      }
    } catch {}
  }, []);

  const handleAddTestBotContact = () => {
    const botContactId = `sandbox_bot_${selectedAppId}`;
    const createdBotContact: ContactProfile = {
      id: botContactId,
      appId: selectedAppId,
      name: 'Bot Test',
      handleOrPhone: '+213 550 00 00 00 • AI Sandbox',
      avatarText: 'BT',
      avatarColor: '#059669',
      profilePicUrl: BOT_TEST_AVATAR,
      statusText: 'Online • AI Test Sandbox Active',
      lastMessage: 'Salam khoya! Marhba bik, rani hna bach n3awnek. Kifech n9der nsa3dek doka?',
      time: 'Just now',
      lastMessageTime: 'Just now',
      timestamp: Date.now(),
      unreadCount: 0,
      status: 'ongoing',
      isAiTestBot: true,
      isPinned: true,
      messages: [
        {
          id: `bot_welcome_${botContactId}`,
          sender: 'customer',
          text: `Salam khoya! Marhba bik f Chatbot Farm 🇩🇿. Rani hna comme bot de test (Bot Test) pour vérifier les réponses, l'accumulation des messages, les photos w les vocaux. B3atli ay message w njawbak direct!`,
          time: '10:00 AM',
          seen: true,
          delivered: true,
          timestamp: 1,
        }
      ]
    };

    setLocalAddedContacts((prev) => {
      const filtered = prev.filter((c) => c.id !== botContactId && !c.isAiTestBot);
      return [createdBotContact, ...filtered];
    });
    setRemovedBotAppIds((prev) => {
      const next = prev.filter((id) => id !== selectedAppId);
      try { localStorage.setItem('cf_removed_test_bots', JSON.stringify(next)); } catch {}
      return next;
    });
    onContactAdded?.(createdBotContact);
    onSelectChat(createdBotContact.id);

    try {
      const currentLive = JSON.parse(localStorage.getItem('cf_live_chats_by_app') || '{}');
      const appChats = (currentLive[selectedAppId] || []).filter((c: any) => c.id !== botContactId && !c.isAiTestBot);
      appChats.unshift(createdBotContact);
      currentLive[selectedAppId] = appChats;
      localStorage.setItem('cf_live_chats_by_app', JSON.stringify(currentLive));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  const handleResetTestBotConversation = (botId: string = `sandbox_bot_${selectedAppId}`, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    try {
      const welcomeMsg = {
        id: `bot_welcome_${botId}`,
        sender: 'customer' as const,
        text: `Salam khoya! Marhba bik f Chatbot Farm 🇩🇿. Rani hna comme bot de test (Bot Test). B3atli ay message w njawbak direct!`,
        time: '10:00 AM',
        seen: true,
        delivered: true,
        timestamp: 1,
      };

      // Reset in local storage conversations
      const storedConvs = JSON.parse(localStorage.getItem('cf_conversations') || '{}');
      storedConvs[botId] = [welcomeMsg];
      localStorage.setItem('cf_conversations', JSON.stringify(storedConvs));

      // Reset in cf_live_chats_by_app
      const currentLive = JSON.parse(localStorage.getItem('cf_live_chats_by_app') || '{}');
      if (currentLive[selectedAppId]) {
        currentLive[selectedAppId] = currentLive[selectedAppId].map((c: any) => {
          if (c.id === botId || c.isAiTestBot) {
            return {
              ...c,
              messages: [welcomeMsg],
              lastMessage: welcomeMsg.text,
              lastMessageTime: 'Just now',
              timestamp: Date.now(),
            };
          }
          return c;
        });
        localStorage.setItem('cf_live_chats_by_app', JSON.stringify(currentLive));
      }

      setLocalAddedContacts((prev) =>
        prev.map((c) =>
          c.id === botId || c.isAiTestBot
            ? { ...c, messages: [welcomeMsg], lastMessage: welcomeMsg.text, lastMessageTime: 'Just now', timestamp: Date.now() }
            : c
        )
      );

      window.dispatchEvent(new Event('storage'));
      setSyncNotice({ type: 'success', text: 'Conversation du Bot Test réinitialisée avec succès !' });
      setTimeout(() => setSyncNotice(null), 3000);
    } catch {}
  };

  const handleRemoveTestBotContact = (botId: string = `sandbox_bot_${selectedAppId}`, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    try {
      setLocalAddedContacts((prev) => prev.filter((c) => c.id !== botId && !c.isAiTestBot));
      setRemovedBotAppIds((prev) => {
        const next = [...prev.filter((id) => id !== selectedAppId), selectedAppId];
        try { localStorage.setItem('cf_removed_test_bots', JSON.stringify(next)); } catch {}
        return next;
      });

      const currentLive = JSON.parse(localStorage.getItem('cf_live_chats_by_app') || '{}');
      if (currentLive[selectedAppId]) {
        currentLive[selectedAppId] = currentLive[selectedAppId].filter((c: any) => c.id !== botId && !c.isAiTestBot);
        localStorage.setItem('cf_live_chats_by_app', JSON.stringify(currentLive));
      }

      // If active chat was this bot, switch to next available contact
      if (selectedContactId === botId || selectedContactId?.startsWith('sandbox_bot_')) {
        const remaining = (currentLive[selectedAppId] || []).filter((c: any) => c.id !== botId && !c.isAiTestBot);
        if (remaining.length > 0) {
          onSelectChat(remaining[0].id);
        }
      }

      window.dispatchEvent(new Event('storage'));
      setSyncNotice({ type: 'info', text: 'Bot Test retiré de la liste des contacts.' });
      setTimeout(() => setSyncNotice(null), 3000);
    } catch {}
  };


  const handleSaveChannelSettings = (channelId: string) => {
    try {
      if (channelId === 'instagram') {
        const cleanHandle = metaHandle.trim().replace(/^@/, '');
        const cleanToken = metaToken.trim();
        const accountData = {
          username: cleanHandle || 'instagram_user',
          igId: cleanHandle || 'instagram_user',
          pageAccessToken: cleanToken,
          name: cleanHandle || 'Instagram User'
        };
        localStorage.setItem('cf_ig_account', JSON.stringify(accountData));
        if (cleanToken) {
          localStorage.setItem('cf_meta_token', cleanToken);
        }
        const savedApps = new Set(JSON.parse(localStorage.getItem('cf_connected_apps') || '["web_widget"]'));
        savedApps.add('instagram');
        localStorage.setItem('cf_connected_apps', JSON.stringify(Array.from(savedApps)));
        window.dispatchEvent(new Event('storage'));
        setSaveStatus('Instagram Gateway Synced & Live!');
        setTimeout(() => setSaveStatus(null), 3500);
      } else if (channelId === 'telegram') {
        const cleanToken = tgToken.trim();
        const cleanHandle = tgHandle.trim().replace(/^@/, '');
        if (cleanToken) {
          localStorage.setItem('cf_telegram_token', cleanToken);
          localStorage.setItem('cf_telegram_bot', JSON.stringify({ username: cleanHandle }));
          const savedApps = new Set(JSON.parse(localStorage.getItem('cf_connected_apps') || '["web_widget"]'));
          savedApps.add('telegram');
          localStorage.setItem('cf_connected_apps', JSON.stringify(Array.from(savedApps)));
          window.dispatchEvent(new Event('storage'));
          setSaveStatus('Telegram Gateway Synced & Live!');
          setTimeout(() => setSaveStatus(null), 3500);
        }
      } else if (channelId === 'messenger') {
        const pageData = { id: messengerPageId.trim(), accessToken: messengerToken.trim(), name: 'Facebook Page' };
        localStorage.setItem('cf_messenger_page', JSON.stringify(pageData));
        const savedApps = new Set(JSON.parse(localStorage.getItem('cf_connected_apps') || '["web_widget"]'));
        savedApps.add('messenger');
        localStorage.setItem('cf_connected_apps', JSON.stringify(Array.from(savedApps)));
        window.dispatchEvent(new Event('storage'));
        setSaveStatus('Messenger Gateway Synced & Live!');
        setTimeout(() => setSaveStatus(null), 3500);
      } else if (channelId === 'gmail') {
        const cleanEmail = gmailAddr.trim();
        localStorage.setItem('cf_gmail_account', JSON.stringify({ email: cleanEmail }));
        const savedApps = new Set(JSON.parse(localStorage.getItem('cf_connected_apps') || '["web_widget"]'));
        savedApps.add('gmail');
        localStorage.setItem('cf_connected_apps', JSON.stringify(Array.from(savedApps)));
        window.dispatchEvent(new Event('storage'));
        setSaveStatus('Support Email Synced & Live!');
        setTimeout(() => setSaveStatus(null), 3500);
      }
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  };
  
  // Interactive test ping state
  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'success'>('idle');
  const [pingLatency, setPingLatency] = useState(28);

  // Toggleable gateway settings
  const [settingsToggles, setSettingsToggles] = useState({
    darijaMode: true,
    yalidineAutoSync: true,
    humanEscalation: true,
    sendSeenReceipts: true,
  });

  const toggleSetting = (key: keyof typeof settingsToggles) => {
    setSettingsToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestPing = () => {
    setPingStatus('testing');
    setTimeout(() => {
      setPingLatency(Math.floor(Math.random() * 25) + 18);
      setPingStatus('success');
      setTimeout(() => setPingStatus('idle'), 4000);
    }, 900);
  };

  const copyToClipboard = (text: string, type: 'key' | 'webhook') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    }
  };

  const formatContactTime = (contact: ContactProfile) => {
    if (contact.lastMessageTime && contact.lastMessageTime !== 'Recent' && contact.lastMessageTime !== 'Just now') {
      return contact.lastMessageTime;
    }
    if (contact.time && contact.time !== 'Recent' && contact.time !== 'Just now') {
      return contact.time;
    }
    if (contact.timestamp && !isNaN(contact.timestamp) && contact.timestamp > 0) {
      const d = new Date(contact.timestamp);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (diffDays === 1) return 'Hier';
      if (diffDays < 7) return d.toLocaleDateString('fr-FR', { weekday: 'short' });
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    }
    return 'Récemment';
  };

  const renderLastMessageSnippet = (contact: ContactProfile) => {
    const rawText = contact.lastMessage || '';
    const lower = rawText.toLowerCase().trim();

    const lastMsgObj = Array.isArray(contact.messages) && contact.messages.length > 0
      ? contact.messages[contact.messages.length - 1]
      : null;

    const isMe = lastMsgObj
      ? (lastMsgObj.sender === 'operator' || (lastMsgObj.sender as string) === 'user')
      : Boolean((contact as any).lastMessageFromMe);

    const isSeen = lastMsgObj
      ? Boolean(lastMsgObj.seen || (lastMsgObj as any).status === 'read' || (lastMsgObj as any).status === 'played')
      : Boolean((contact as any).lastMessageSeen || (contact as any).lastMessageStatus === 'read' || (contact as any).lastMessageStatus === 'played');

    const lastMsgStatus = (lastMsgObj as any)?.status || (contact as any).lastMessageStatus || 'sent';

    // Detect media & call types
    const isCall = Boolean(lastMsgObj?.isCall || lastMsgObj?.callType) ||
      lower.startsWith('appel') || lower.startsWith('missed') ||
      lower.includes('appel vocal') || lower.includes('appel vidéo') || lower.includes('voice call') || lower.includes('video call') || lower.includes('missed call');
    const isMissedCall = Boolean(lastMsgObj?.callType?.includes('missed') || lastMsgObj?.callOutcome === 'Missed') ||
      lower.includes('manqué') || lower.includes('missed') || lower.includes('unanswered') || lower.includes('sans réponse');
    const isVideoCall = Boolean(lastMsgObj?.callType?.includes('video')) ||
      lower.includes('video call') || lower.includes('appel vidéo');

    const isPhoto = Boolean(lastMsgObj?.imageUrl || lastMsgObj?.hasImages) || lower.includes('📷') || lower.includes('photo') || lower.includes('image') || lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg');
    const isVideo = Boolean(lastMsgObj?.videoUrl) || lower.includes('🎥') || lower.includes('video') || lower.includes('vidéo') || lower.endsWith('.mp4') || lower.endsWith('.mov');
    const isVoice = Boolean(lastMsgObj?.isAudio) || lower.includes('🎤') || lower.includes('vocal') || lower.includes('voice') || lower.includes('audio') || lower.endsWith('.mp3') || lower.endsWith('.wav') || lower.endsWith('.m4a');
    const isDoc = Boolean(lastMsgObj?.fileName) || lower.includes('📄') || lower.includes('document') || lower.includes('fichier') || lower.endsWith('.pdf') || lower.endsWith('.docx') || lower.endsWith('.xlsx');
    const isLocation = lower.includes('📍') || lower.includes('localisation') || lower.includes('position');
    const isSticker = lower.includes('sticker') || lower.includes('autocollant');

    // Strip leading emojis from label
    const cleanText = rawText.replace(/^[📷🎥🎤🎵📄📍🏷️📹📞💬🚫\s]+/, '').trim();

    return (
      <div className="flex items-center gap-1 min-w-0 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 select-none">
        {isMe && (
          <span className="shrink-0 inline-flex items-center" title={isSeen ? "Vu" : lastMsgStatus === 'delivered' ? "Distribué" : "Envoyé"}>
            {isSeen ? (
              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] shrink-0" />
            ) : lastMsgStatus === 'delivered' ? (
              <CheckCheck className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
            ) : (
              <Check className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
            )}
          </span>
        )}

        {isCall ? (
          isMissedCall ? (
            <span className="inline-flex items-center gap-1 truncate text-red-500 dark:text-red-400 font-medium">
              <PhoneMissed className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="truncate">{cleanText || (isVideoCall ? 'Appel vidéo manqué' : 'Appel vocal manqué')}</span>
            </span>
          ) : isVideoCall ? (
            <span className="inline-flex items-center gap-1 truncate text-emerald-600 dark:text-emerald-400 font-medium">
              <Video className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{cleanText || 'Appel vidéo'}</span>
            </span>
          ) : isMe ? (
            <span className="inline-flex items-center gap-1 truncate text-gray-600 dark:text-gray-300 font-medium">
              <PhoneOutgoing className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{cleanText || 'Appel vocal sortant'}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 truncate text-emerald-600 dark:text-emerald-400 font-medium">
              <PhoneIncoming className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{cleanText || 'Appel vocal'}</span>
            </span>
          )
        ) : isPhoto ? (
          <span className="inline-flex items-center gap-1 truncate text-gray-600 dark:text-gray-300 font-medium">
            <Camera className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
            <span className="truncate">{cleanText || 'Photo'}</span>
          </span>
        ) : isVideo ? (
          <span className="inline-flex items-center gap-1 truncate text-gray-600 dark:text-gray-300 font-medium">
            <Video className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
            <span className="truncate">{cleanText || 'Vidéo'}</span>
          </span>
        ) : isVoice ? (
          <span className="inline-flex items-center gap-1 truncate text-gray-600 dark:text-gray-300 font-medium">
            <Mic className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
            <span className="truncate">{cleanText || 'Message vocal'}</span>
          </span>
        ) : isDoc ? (
          <span className="inline-flex items-center gap-1 truncate text-gray-600 dark:text-gray-300 font-medium">
            <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
            <span className="truncate">{cleanText || 'Document'}</span>
          </span>
        ) : isLocation ? (
          <span className="inline-flex items-center gap-1 truncate text-gray-600 dark:text-gray-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
            <span className="truncate">{cleanText || 'Localisation'}</span>
          </span>
        ) : isSticker ? (
          <span className="inline-flex items-center gap-1 truncate text-gray-600 dark:text-gray-300 font-medium">
            <Smile className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
            <span className="truncate">Sticker</span>
          </span>
        ) : (
          <span className="truncate">{rawText}</span>
        )}
      </div>
    );
  };

  // Resolve contacts list strictly based on real live contacts (zero synthetic fallback)
  const cachedForApp = (() => {
    if (typeof window === 'undefined') return [];
    try {
      const s = JSON.parse(localStorage.getItem('cf_live_chats_by_app') || '{}');
      return Array.isArray(s[selectedAppId]) ? s[selectedAppId] : [];
    } catch {
      return [];
    }
  })();
  const effectiveLive = (liveContacts && liveContacts.length > 0) ? liveContacts : cachedForApp;
  const rawContacts: ContactProfile[] = (effectiveLive && effectiveLive.length > 0)
    ? effectiveLive.map((lc) => ({
        ...lc,
        topics: (lc.topics && lc.topics.length > 0) ? lc.topics : undefined,
        profilePicUrl: lc.profilePicUrl || null,
      }))
    : [];
  const extraForApp = localAddedContacts.filter((c) => c.appId === selectedAppId || !c.appId);
  const contactsList: ContactProfile[] = [
    ...extraForApp,
    ...rawContacts.filter((c) => !extraForApp.some((e) => e.id === c.id || (e.handleOrPhone && c.handleOrPhone && e.handleOrPhone.toLowerCase() === c.handleOrPhone.toLowerCase())))
  ];

  // Auto-inject Bot Test as a general feature across all apps (unless explicitly removed)
  const botId = `sandbox_bot_${selectedAppId}`;
  const isBotRemoved = removedBotAppIds.includes(selectedAppId);
  const hasBotInList = contactsList.some((c) => c.id === botId || c.isAiTestBot);
  if (!hasBotInList && !isBotRemoved) {
    let botMessages: any[] = [
      {
        id: `bot_welcome_${botId}`,
        sender: 'customer',
        text: `Salam khoya! Marhba bik f Chatbot Farm 🇩🇿. Rani hna comme bot de test (Bot Test) pour vérifier les réponses, l'accumulation des messages, les photos w les vocaux. B3atli ay message w njawbak direct!`,
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

    contactsList.unshift({
      id: botId,
      appId: selectedAppId,
      name: 'Bot Test',
      handleOrPhone: '+213 550 00 00 00 • AI Sandbox',
      avatarText: 'BT',
      avatarColor: '#059669',
      profilePicUrl: BOT_TEST_AVATAR,
      statusText: 'Online • AI Test Sandbox Active',
      lastMessage: botLastMsg,
      time: botLastTime,
      lastMessageTime: botLastTime,
      timestamp: botLastTs,
      unreadCount: 0,
      status: 'ongoing',
      isAiTestBot: true,
      isPinned: true,
      messages: botMessages
    });
  }
  // Chronological sort: newest activity always at the top (like native WhatsApp & Instagram)
  // For Discord: Messages Privés (dc_dm) is ALWAYS pinned at the very top of the list!
  // Test Bot (Bot Test) is ALWAYS pinned at the very top!
  const sortedContacts = [...contactsList].sort((a, b) => {
    const isBotA = a.isAiTestBot || a.id?.startsWith('sandbox_bot_') || a.isPinned;
    const isBotB = b.isAiTestBot || b.id?.startsWith('sandbox_bot_') || b.isPinned;
    if (isBotA && !isBotB) return -1;
    if (!isBotA && isBotB) return 1;

    if (selectedAppId === 'discord') {
      if (a.id === 'dc_dm' || a.name.toLowerCase().includes('messages privés')) return -1;
      if (b.id === 'dc_dm' || b.name.toLowerCase().includes('messages privés')) return 1;
    }

    const getEffectiveTimestamp = (c: any) => {
      let ts = c.timestamp || 0;
      if (Array.isArray(c.messages) && c.messages.length > 0) {
        const lastMsg = c.messages[c.messages.length - 1];
        if (lastMsg && lastMsg.timestamp && lastMsg.timestamp > ts) {
          ts = lastMsg.timestamp;
        }
      }
      return ts;
    };

    return getEffectiveTimestamp(b) - getEffectiveTimestamp(a);
  });

  const isGmail = selectedAppId === 'gmail';

  const filteredContacts = sortedContacts.filter((c: any) => {
    const query = searchFilter.toLowerCase().trim();
    const matchesSearch = !query ||
      c.name.toLowerCase().includes(query) ||
      c.handleOrPhone.toLowerCase().includes(query) ||
      (c.username && c.username.toLowerCase().includes(query)) ||
      (c.phone && c.phone.toLowerCase().includes(query)) ||
      (c.subject && c.subject.toLowerCase().includes(query)) ||
      (c.snippet && c.snippet.toLowerCase().includes(query)) ||
      c.lastMessage.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (isGmail) {
      const isStarred = starredEmailIds.has(c.id) || Boolean(c.starred) || c.labelIds?.includes?.('STARRED');
      if (gmailTab === 'starred' || gmailTab === 'STARRED') {
        return isStarred;
      }
      if (gmailTab === 'primary' || gmailTab === 'INBOX') {
        return (c.category === 'primary' || !c.category || c.labelIds?.includes?.('INBOX')) && c.category !== 'spam' && c.category !== 'trash' && !c.labelIds?.includes?.('SPAM') && !c.labelIds?.includes?.('TRASH');
      }
      if (gmailTab === 'promotions' || gmailTab === 'CATEGORY_PROMOTIONS') {
        return c.category === 'promotions' || c.labelIds?.includes?.('CATEGORY_PROMOTIONS');
      }
      if (gmailTab === 'notifications' || gmailTab === 'CATEGORY_UPDATES') {
        return c.category === 'notifications' || c.labelIds?.includes?.('CATEGORY_UPDATES') || c.labelIds?.includes?.('CATEGORY_FORUMS') || c.labelIds?.includes?.('CATEGORY_SOCIAL');
      }
      if (gmailTab === 'important' || gmailTab === 'IMPORTANT') {
        return c.category === 'important' || c.labelIds?.includes?.('IMPORTANT');
      }
      if (gmailTab === 'sent' || gmailTab === 'SENT') {
        return c.category === 'sent' || c.labelIds?.includes?.('SENT');
      }
      if (gmailTab === 'spam' || gmailTab === 'SPAM') {
        return c.category === 'spam' || c.labelIds?.includes?.('SPAM');
      }
      if (gmailTab === 'trash' || gmailTab === 'TRASH') {
        return c.category === 'trash' || c.labelIds?.includes?.('TRASH');
      }
      if (c.labelIds && Array.isArray(c.labelIds) && c.labelIds.includes(gmailTab)) {
        return true;
      }
      return true;
    }

    return true;
  });

  const activeContactId = selectedContactId || sortedContacts[0]?.id;
  const activeContact = sortedContacts.find((c: any) =>
    c.id === activeContactId ||
    (c.id && activeContactId && (c.id.split(',').includes(activeContactId) || activeContactId.split(',').includes(c.id)))
  );
  const currentAppTheme = APP_GRADIENT_THEMES[selectedAppId] || APP_GRADIENT_THEMES.whatsapp;

  if (activeProfileContact) {
    return (
      <div 
        className="h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#F5F5ED] dark:bg-[#1A1D23] rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] text-[#1B1B1B] dark:text-gray-100 overflow-hidden shadow-sm"
        style={{ containerType: 'inline-size', containerName: 'righthub' }}
      >
        <UserProfileModal
          isOpen={true}
          embedded={true}
          contact={activeProfileContact}
          appId={activeProfileAppId || selectedAppId}
          onClose={closeProfile}
          onDeleteContact={(id) => {
            deleteContact(activeProfileAppId || selectedAppId, id);
            setLocalAddedContacts((prev) => prev.filter((c) => c.id !== id));
            closeProfile();
          }}
        />
      </div>
    );
  }

  return (
    <div 
    className="h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#F5F5ED] dark:bg-[#1A1D23] rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] text-[#1B1B1B] dark:text-gray-100 overflow-hidden shadow-sm"
    style={{ containerType: 'inline-size', containerName: 'righthub' }}
  >
    <style dangerouslySetInnerHTML={{ __html: `
      @container righthub (max-width: 230px) {
        .contacts-topics-split { flex-direction: column !important; }
        .topics-sidebar-pane { max-height: 48% !important; min-height: 140px !important; border-top: 1px solid rgba(0,0,0,0.1) !important; border-left: none !important; }
        .contacts-list-pane { border-right: none !important; }
      }
      @container righthub (max-width: 440px) {
        .hub-detach-text { display: none !important; }
        .hub-detach-btn { padding: 0.35rem !important; aspect-ratio: 1/1 !important; width: 2.25rem !important; height: 2.25rem !important; justify-content: center !important; }
        .hub-tab-count { display: none !important; }
        .hub-action-text { display: none !important; }
        .hub-action-btn { padding: 0.45rem !important; aspect-ratio: 1/1 !important; width: 2rem !important; height: 2rem !important; justify-content: center !important; }
        .hub-tab-text { font-size: 10px !important; letter-spacing: -0.02em !important; }
      }
      @container righthub (max-width: 320px) {
        .hub-tab-text { display: none !important; }
        .analytics-grid { grid-template-columns: 1fr !important; gap: 0.5rem !important; }
      }
      @container righthub (max-width: 290px) {
        .settings-container { padding: 0.75rem !important; }
        .settings-disconnect-row { flex-direction: column !important; align-items: stretch !important; gap: 0.5rem !important; }
        .settings-disconnect-btn { width: 100% !important; margin-top: 0.25rem !important; }
        .settings-toggle-row { gap: 0.5rem !important; }
        .settings-row { flex-direction: column !important; align-items: stretch !important; gap: 0.5rem !important; }
        .settings-buttons { flex-direction: column !important; width: 100% !important; }
        .settings-buttons button { width: 100% !important; }
      }
      @container righthub (max-width: 250px) {
        .contact-extra-details { display: none !important; }
        .settings-desc { display: none !important; }
        .settings-header-icon { display: none !important; }
        .settings-badge { display: none !important; }
        .analytics-container { padding: 0.75rem !important; }
      }
      @container righthub (max-width: 210px) {
        .settings-container { padding: 0.5rem !important; }
        .settings-card { padding: 0.5rem !important; }
      }
      @container righthub (max-width: 190px) {
        .contact-item-inner { display: none !important; }
        .contact-item-btn { justify-content: center !important; padding: 0.5rem 0.25rem !important; }
        .contact-item-avatar-wrapper { margin: 0 auto !important; }
        .contacts-search-input { display: none !important; }
      }
    `}} />
      {/* Top Header with App Solid Brand Color - Matches Middle Chat Column */}
      <div {...dragHandleProps} className={`h-14 px-3 sm:px-4 shrink-0 rounded-t-3xl border-b border-black/10 select-none shadow-xs flex items-center cursor-grab active:cursor-grabbing touch-none ${dragHandleProps?.className || ""}`}
        style={{ backgroundColor: currentAppTheme.solidColor }}
      >
        {/* Sliding Navigation Tabs: perfectly centered grid layout with equal widths and matching height */}
        {isStandalone ? (
          <div className={`w-full flex items-center justify-between pointer-events-none select-none ${
            isLightColor(currentAppTheme.solidColor) ? 'text-slate-950' : 'text-white'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              {activeTab === 'analytics' ? <BarChart2 className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
              <span className="capitalize">{activeTab}</span>
            </div>
            {onReattach && (
              <button 
                onClick={onReattach} 
                onPointerDown={(e) => e.stopPropagation()}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer pointer-events-auto ${
                  isLightColor(currentAppTheme.solidColor) ? 'hover:bg-black/10 text-slate-950' : 'hover:bg-black/20 text-white'
                }`} 
                title="Reattach to Hub"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (() => {
          const ALL_TABS = [
            { id: 'contacts', label: 'Contacts', count: contactsList.length, icon: <MessageSquare className="w-3.5 h-3.5 shrink-0" /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-3.5 h-3.5 shrink-0" /> },
            { id: 'settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5 shrink-0" /> },
          ] as const;
          
          const visibleTabs = ALL_TABS.filter(t => !detachedTabs.includes(t.id));
          const activeIndex = visibleTabs.findIndex(t => t.id === activeTab);
          const canDetachActive = (activeTab === 'analytics' || activeTab === 'settings') && Boolean(onDetach) && !detachedTabs.includes(activeTab);
          const isLight = isLightColor(currentAppTheme.solidColor);

          return (
            <div className="w-full flex items-center gap-1.5 min-w-0">
              <div className="flex-1 min-w-0">
                <nav 
                  className={`relative h-9 w-full grid gap-1 p-0.5 rounded-xl border items-center ${
                    isLight 
                      ? 'bg-black/10 backdrop-blur-md border-black/20' 
                      : 'bg-black/25 backdrop-blur-md border-white/20'
                  }`}
                  style={{ 
                    gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))` 
                  }}
                >
                  {activeIndex >= 0 && (
                    <div 
                      className="absolute top-[2px] bottom-[2px] bg-white rounded-lg shadow-sm z-0"
                      style={{
                        width: `calc((100% - ${(visibleTabs.length - 1) * 4 + 4}px) / ${visibleTabs.length})`,
                        transform: `translateX(calc(${activeIndex * 100}% + ${activeIndex * 4 + 2}px))`,
                        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                    />
                  )}
                  {visibleTabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <div key={tab.id} className="relative h-full flex items-center justify-center z-10 min-w-0">
                        <button
                          id={`tab-btn-${tab.id}`}
                          onClick={() => setActiveTab(tab.id)}
                          title={tab.label}
                          className={`w-full h-full py-1.5 px-1 sm:px-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap overflow-hidden leading-none min-w-0 ${
                            isActive
                              ? 'text-gray-950 font-extrabold'
                              : (isLight ? 'text-slate-900/80 hover:text-slate-950 hover:bg-black/10 font-bold' : 'text-white/80 hover:text-white hover:bg-white/10')
                          }`}
                        >
                          <span className="shrink-0 flex items-center justify-center pointer-events-none">
                            {tab.icon}
                          </span>
                          <span className="hub-tab-text truncate min-w-0 pointer-events-none">{tab.label}</span>
                          {'count' in tab && tab.count !== undefined && (
                            <span className="hub-tab-count shrink-0 text-[8.5px] opacity-90 flex items-center justify-center bg-black/10 dark:bg-white/10 rounded-full px-1 py-0.5 min-w-[15px] ml-0.5">
                              {tab.count}
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </nav>
              </div>
              {canDetachActive && (
                <button 
                  type="button"
                  onClick={() => onDetach?.(activeTab)}
                  className="hub-detach-btn h-9 px-2 sm:px-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center gap-1 shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0 z-20"
                  title={`Detach ${activeTab} to independent column`}
                >
                  <Unlink className="w-3 h-3 shrink-0" />
                  <span className="hub-detach-text text-[9px] font-bold uppercase tracking-wider">Detach</span>
                </button>
              )}
            </div>
          );
        })()}
      </div>

      {/* ========================================================================= */}
      {/* TABS CONTENT WITH FLUID ANIMATION */}
      {/* ========================================================================= */}
      <AnimatePresence mode="wait">
        {activeTab === 'contacts' && (
          <motion.div
            key="contacts-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="flex-1 min-h-0 flex flex-col overflow-hidden"
          >
            <PullToRefresh
              onRefresh={handleSyncInbox}
              isRefreshing={isSyncingInbox}
              accentColor={currentAppTheme.solidColor}
              className="flex-1 min-h-0 flex flex-col overflow-hidden"
            >
              {/* Search bar & Category Tabs */}
            {isGmail ? (
              <div className="flex flex-col border-b border-[#DFDFD4] dark:border-[#2E333D] shrink-0 bg-[#F5F5ED] dark:bg-[#1A1D23]">
                {/* Gmail Top Actions Bar */}
                <div className="px-3 py-2 flex items-center justify-between gap-2 border-b border-black/5 dark:border-white/5">
                  {/* Left controls: Select All Checkbox + Dropdown arrow + Refresh + More */}
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="flex items-center rounded hover:bg-black/5 dark:hover:bg-white/10 p-0.5">
                      <button
                        type="button"
                        onClick={() => toggleSelectAllEmails(filteredContacts)}
                        className={`w-4 h-4 rounded-[3px] border transition-colors flex items-center justify-center cursor-pointer ${
                          selectedEmailIds.size > 0 && selectedEmailIds.size === filteredContacts.length
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : selectedEmailIds.size > 0
                            ? 'bg-blue-600/30 border-blue-600 text-blue-600'
                            : 'border-gray-400 dark:border-neutral-500 hover:border-gray-600 dark:hover:border-neutral-300'
                        }`}
                        title="Tout sélectionner / désélectionner"
                      >
                        {selectedEmailIds.size > 0 && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <ChevronDown className="w-3 h-3 text-gray-400 ml-0.5" />
                    </div>

                    <button
                      type="button"
                      onClick={handleSyncInbox}
                      disabled={isSyncingInbox}
                      className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
                      title="Actualiser la boîte de réception"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingInbox ? 'animate-spin text-[#EA4335]' : ''}`} />
                    </button>

                    <button
                      type="button"
                      className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
                      title="Plus d'actions"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Right controls: Search input & Add email */}
                  <div className="flex items-center gap-2 flex-1 max-w-[280px]">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Rechercher dans les messages..."
                        className="w-full bg-[#ECECE2]/60 dark:bg-black/30 border border-[#DFDFD4] dark:border-neutral-700 rounded-lg pl-7 pr-2.5 py-1 text-xs text-[#1B1B1B] dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#EA4335]"
                      />
                    </div>
                    <button
                      id="gmail-add-test-bot-btn"
                      type="button"
                      onClick={handleAddTestBotContact}
                      className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/25 transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2"
                      title="Tester l'Assistant IA Sandbox Gmail"
                    >
                      <Bot className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Test Bot</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddClientModalOpen(true)}
                      className="p-1.5 rounded-lg bg-[#EA4335] hover:bg-[#d93025] text-white transition-all shadow-xs shrink-0 cursor-pointer"
                      title="Nouveau message / contact"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Gmail Authentic Category Tabs Bar (Scrollable horizontally) */}
                <div className="flex items-center gap-1 px-2 overflow-x-auto no-scrollbar border-b border-black/5 dark:border-white/5 select-none text-xs custom-scrollbar">
                  {gmailTabsList.map((tab: any) => {
                    const isActive = gmailTab === tab.id;
                    const count = sortedContacts.filter((c: any) => {
                      const isSt = starredEmailIds.has(c.id) || Boolean(c.starred) || c.labelIds?.includes?.('STARRED');
                      if (tab.id === 'starred') return isSt;
                      if (tab.id === 'primary') return (c.category === 'primary' || !c.category || c.labelIds?.includes?.('INBOX')) && c.category !== 'spam' && c.category !== 'trash' && !c.labelIds?.includes?.('SPAM') && !c.labelIds?.includes?.('TRASH');
                      if (tab.id === 'promotions') return c.category === 'promotions' || c.labelIds?.includes?.('CATEGORY_PROMOTIONS');
                      if (tab.id === 'notifications') return c.category === 'notifications' || c.labelIds?.includes?.('CATEGORY_UPDATES') || c.labelIds?.includes?.('CATEGORY_FORUMS');
                      if (tab.id === 'important') return c.category === 'important' || c.labelIds?.includes?.('IMPORTANT');
                      if (tab.id === 'sent') return c.category === 'sent' || c.labelIds?.includes?.('SENT');
                      if (tab.id === 'spam') return c.category === 'spam' || c.labelIds?.includes?.('SPAM');
                      if (tab.id === 'trash') return c.category === 'trash' || c.labelIds?.includes?.('TRASH');
                      if (c.labelIds && Array.isArray(c.labelIds) && c.labelIds.includes(tab.id)) return true;
                      return false;
                    }).length;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setGmailTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                          isActive
                            ? 'border-[#EA4335] text-[#EA4335] dark:border-white dark:text-white font-bold bg-black/5 dark:bg-white/5'
                            : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {count > 0 && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            isActive
                              ? 'bg-[#EA4335] text-white'
                              : 'bg-black/10 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                          }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : selectedAppId !== 'discord' ? (
              <div className="px-4 py-3 border-b border-[#DFDFD4] dark:border-[#2E333D] shrink-0 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder={`Search ${selectedAppId === 'instagram' ? 'friends & clients' : selectedAppId + ' contacts'}...`}
                    className="w-full bg-[#ECECE2]/40 dark:bg-black/40 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl pl-8 pr-3 py-2 text-xs text-[#1B1B1B] dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#C13584]"
                  />
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isConnected && (
                    <button
                      id="sync-inbox-btn"
                      type="button"
                      onClick={handleSyncInbox}
                      disabled={isSyncingInbox}
                      title={`Auto-import all real discussions from ${currentAppTheme.name}`}
                      className="hub-action-btn px-2.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingInbox ? 'animate-spin' : ''}`} />
                      <span className="hub-action-text">Sync</span>
                    </button>
                  )}
                  <button
                    id="add-test-bot-btn"
                    type="button"
                    onClick={handleAddTestBotContact}
                    title="Ajouter un contact Bot de Test IA (Discussion inversée sandbox)"
                    className="hub-action-btn px-2.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                  >
                    <Bot className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="hub-action-text">Test Bot</span>
                  </button>
                  <button
                    id="add-client-btn"
                    type="button"
                    onClick={() => setIsAddClientModalOpen(true)}
                    title={`Add ${currentAppTheme.name} Client / Discussion`}
                    className={`hub-action-btn px-2.5 py-2 rounded-xl text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                      isLightColor(currentAppTheme.solidColor) ? 'text-slate-950 font-black' : 'text-white'
                    }`}
                    style={{ backgroundColor: currentAppTheme.solidColor }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hub-action-text">Add Client</span>
                  </button>
                </div>
              </div>
            ) : null}

            {/* Disconnected Offline Snapshot Persistent Alert */}
            {selectedAppId === 'whatsapp' && (channelError || !isConnected) && !syncNotice && (
              <div className="mx-3 sm:mx-4 mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-[11px] truncate leading-tight">Session déconnectée (Erreur 401)</p>
                    <p className="text-[10px] opacity-80 truncate">Aperçu hors-ligne. Reconnectez le QR pour synchroniser.</p>
                  </div>
                </div>
                {onOpenConnect && (
                  <button
                    type="button"
                    onClick={onOpenConnect}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] shrink-0 cursor-pointer shadow-xs flex items-center gap-1 transition-all active:scale-95"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>Scanner QR</span>
                  </button>
                )}
              </div>
            )}

            {/* Sync Notice Alert */}
            {syncNotice && (
              <div
                className={`mx-3 sm:mx-4 mt-2 p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 shadow-xs transition-all animate-in fade-in slide-in-from-top-1 ${
                  syncNotice.type === 'warning'
                    ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/30 text-amber-900 dark:text-amber-200'
                    : syncNotice.type === 'error'
                    ? 'bg-red-500/10 dark:bg-red-950/40 border-red-500/30 text-red-900 dark:text-red-200'
                    : 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {syncNotice.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : syncNotice.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                  <span className="truncate leading-tight text-[11px]">{syncNotice.text}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {syncNotice.requiresQr && onOpenConnect && (
                    <button
                      type="button"
                      onClick={() => onOpenConnect()}
                      className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] shadow-xs flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                    >
                      <QrCode className="w-3 h-3" />
                      <span>Scanner QR</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSyncNotice(null)}
                    className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Contacts Feed & Topics Split View */}
            {selectedAppId === 'discord' && isConnected && sortedContacts.length > 0 ? (
              <div className="flex-1 min-h-0 flex overflow-hidden bg-[#2B2D31] text-white">
                {/* 1. Left Vertical Server Rail (Discord Guild Dock) */}
                <div className="w-[68px] shrink-0 bg-[#1E1F22] flex flex-col items-center py-3 gap-2 overflow-y-auto no-scrollbar select-none z-10 border-r border-[#141517]">
                  {/* Discord Home / Messages Privés button */}
                  {(() => {
                    const dmContact = sortedContacts.find(c => c.id === 'dc_dm') || sortedContacts[0];
                    const isDmSelected = activeContactId === 'dc_dm' || activeContact?.id === 'dc_dm';
                    const dmUnread = dmContact?.unreadCount || 0;
                    return (
                      <div key="dc_dm_wrapper" className="relative group flex items-center justify-center w-full">
                        {/* White Left Indicator Pill */}
                        <span className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 ${
                          isDmSelected ? 'h-10 opacity-100' : dmUnread > 0 ? 'h-2.5 opacity-100' : 'h-0 opacity-0 group-hover:h-5 group-hover:opacity-100'
                        }`} />
                        
                        <button
                          type="button"
                          id="contact-item-dc_dm"
                          onClick={() => {
                            onSelectChat('dc_dm');
                            onMarkAsRead?.('discord', 'dc_dm');
                          }}
                          title="Messages privés"
                          className={`w-12 h-12 flex items-center justify-center transition-all duration-200 cursor-pointer relative shadow-xs ${
                            isDmSelected
                              ? 'bg-[#5865F2] text-white rounded-2xl'
                              : 'bg-[#313338] text-[#DBDEE1] hover:bg-[#5865F2] hover:text-white rounded-3xl hover:rounded-2xl'
                          }`}
                        >
                          <DiscordIcon className="w-6 h-6" />
                          {dmUnread > 0 && (
                            <span className="absolute -bottom-1 -right-1 bg-[#F23F43] text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] px-1.5 flex items-center justify-center border-2 border-[#1E1F22] shadow-xs">
                              {dmUnread > 999 ? '999+' : dmUnread}
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })()}

                  {/* Separator Divider */}
                  <div className="w-8 h-[2px] bg-[#35363C] rounded-full my-1 shrink-0" />

                  {/* Guild Server Icons */}
                  {sortedContacts.filter(c => c.id !== 'dc_dm').map((server) => {
                    const isServerSelected = server.id === activeContactId;
                    const unread = server.unreadCount || 0;
                    const isNouveau = server.guildBadge === 'NOUVEAU' || server.statusText?.includes('NOUVEAU');

                    return (
                      <div key={server.id} className="relative group flex items-center justify-center w-full">
                        {/* White Left Indicator Pill */}
                        <span className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 ${
                          isServerSelected ? 'h-10 opacity-100' : unread > 0 ? 'h-2.5 opacity-100' : 'h-0 opacity-0 group-hover:h-5 group-hover:opacity-100'
                        }`} />

                        <button
                          type="button"
                          id={`contact-item-${server.id}`}
                          onClick={() => {
                            onSelectChat(server.id);
                            onMarkAsRead?.('discord', server.id);
                          }}
                          title={server.name}
                          className={`w-12 h-12 flex items-center justify-center transition-all duration-200 cursor-pointer relative shadow-xs overflow-hidden ${
                            isServerSelected
                              ? 'rounded-2xl ring-2 ring-[#5865F2]'
                              : 'rounded-3xl hover:rounded-2xl'
                          } ${server.avatarColor || 'bg-[#313338]'}`}
                        >
                          {server.profilePicUrl ? (
                            <img
                              src={server.profilePicUrl}
                              alt={server.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { 
                                (e.target as HTMLElement).style.display = 'none';
                                const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span className={`font-extrabold text-xs text-white select-none ${server.profilePicUrl ? 'hidden' : 'flex'}`}>
                            {server.avatarText || server.name.slice(0, 2).toUpperCase()}
                          </span>

                          {/* Red Notification Badge */}
                          {isNouveau ? (
                            <span className="absolute -bottom-1 -right-1 bg-[#F23F43] text-white text-[8px] font-black rounded-full px-1 py-0.2 border border-[#1E1F22] shadow-xs tracking-tighter">
                              NOUVEAU
                            </span>
                          ) : unread > 0 ? (
                            <span className="absolute -bottom-1 -right-1 bg-[#F23F43] text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] px-1.5 flex items-center justify-center border-2 border-[#1E1F22] shadow-xs">
                              {unread > 999 ? '999+' : unread}
                            </span>
                          ) : null}
                        </button>
                      </div>
                    );
                  })}

                  {/* Add Server Button */}
                  <button
                    type="button"
                    onClick={() => setIsAddClientModalOpen(true)}
                    title="Ajouter un serveur"
                    className="w-12 h-12 rounded-3xl hover:rounded-2xl bg-[#313338] hover:bg-[#23A55A] text-[#23A55A] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer group mt-1"
                  >
                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                  </button>

                  {/* Explore Compass Button */}
                  <button
                    type="button"
                    onClick={handleSyncInbox}
                    title="Synchroniser les serveurs Discord"
                    className="w-12 h-12 rounded-3xl hover:rounded-2xl bg-[#313338] hover:bg-[#5865F2] text-[#B5BAC1] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
                  >
                    <Compass className="w-5 h-5" />
                  </button>
                </div>

                {/* 2. Channel & DM Sidebar */}
                <div className="flex-1 min-w-0 flex flex-col bg-[#2B2D31] text-[#949BA4] h-full overflow-hidden">
                  {/* Top Search Input */}
                  <div className="p-2.5 border-b border-[#202225] shrink-0">
                    <div className="bg-[#1E1F22] hover:bg-[#141517] rounded-md px-2.5 py-1.5 text-xs text-[#949BA4] flex items-center justify-between cursor-pointer transition-colors shadow-2xs">
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Recherche ou lance une conversation"
                        className="bg-transparent text-xs text-white placeholder-[#949BA4] focus:outline-none w-full"
                      />
                      <Search className="w-3.5 h-3.5 ml-1 shrink-0 text-[#949BA4]" />
                    </div>
                  </div>

                  {/* Sidebar List Content */}
                  <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-0.5 custom-scrollbar">
                    {activeContact?.id === 'dc_dm' ? (
                      /* =========================================================================
                         MESSAGES PRIVÉS (DIRECT MESSAGES VIEW)
                         ========================================================================= */
                      <>
                        {/* Quick Navigation Links */}
                        <div className="space-y-0.5 mb-3">
                          <button
                            type="button"
                            className="w-full px-3 py-2 rounded-md flex items-center gap-3 text-xs font-semibold bg-[#35373C] text-white cursor-pointer transition-colors"
                          >
                            <User className="w-4 h-4 text-[#DBDEE1]" />
                            <span>Amis</span>
                          </button>
                          <button
                            type="button"
                            className="w-full px-3 py-2 rounded-md flex items-center gap-3 text-xs font-semibold text-[#949BA4] hover:bg-[#35373C]/60 hover:text-[#DBDEE1] cursor-pointer transition-colors"
                          >
                            <Zap className="w-4 h-4 text-[#5865F2]" />
                            <span>Nitro</span>
                          </button>
                          <button
                            type="button"
                            className="w-full px-3 py-2 rounded-md flex items-center gap-3 text-xs font-semibold text-[#949BA4] hover:bg-[#35373C]/60 hover:text-[#DBDEE1] cursor-pointer transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4 text-[#FEE75C]" />
                            <span>Boutique</span>
                          </button>
                          <button
                            type="button"
                            className="w-full px-3 py-2 rounded-md flex items-center gap-3 text-xs font-semibold text-[#949BA4] hover:bg-[#35373C]/60 hover:text-[#DBDEE1] cursor-pointer transition-colors"
                          >
                            <Compass className="w-4 h-4 text-[#EB459E]" />
                            <span>Quêtes</span>
                          </button>
                        </div>

                        {/* Direct Messages Section Header */}
                        <div className="flex items-center justify-between px-2 pt-2 pb-1 text-[11px] font-extrabold uppercase tracking-wider text-[#949BA4]">
                          <span>Messages privés</span>
                          <button type="button" onClick={() => setIsAddClientModalOpen(true)} className="hover:text-white transition-colors cursor-pointer" title="Créer un message privé">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* List of Direct Messages */}
                        {activeContact?.topics?.filter((t: any) => !searchFilter || t.name.toLowerCase().includes(searchFilter.toLowerCase()) || (t.userActivity && t.userActivity.toLowerCase().includes(searchFilter.toLowerCase()))).map((topic: any, idx: number) => {
                          const isTopicActive = selectedTopicId === topic.id || (!selectedTopicId && idx === 0);
                          const statusDotClass =
                            topic.userStatus === 'online' ? 'bg-[#23A55A]' :
                            topic.userStatus === 'idle' ? 'bg-[#F0B232]' :
                            topic.userStatus === 'dnd' ? 'bg-[#F23F43]' : 'bg-[#80848E]';

                          return (
                            <button
                              key={topic.id}
                              id={`topic-item-${topic.id}`}
                              onClick={() => {
                                onSelectTopic?.(topic.id);
                                onMarkAsRead?.('discord', activeContact?.id || 'dc_dm', topic.id);
                              }}
                              className={`w-full px-2 py-2 rounded-md text-left transition-all flex items-center gap-3 group cursor-pointer ${
                                isTopicActive
                                  ? 'bg-[#35373C] text-white shadow-xs'
                                  : 'text-[#949BA4] hover:bg-[#35373C]/60 hover:text-[#DBDEE1]'
                              }`}
                            >
                              {/* User Avatar with Status Dot */}
                              <div className="relative shrink-0">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#5865F2] flex items-center justify-center text-xs font-bold text-white shadow-xs">
                                  {topic.profilePicUrl ? (
                                    <img src={topic.profilePicUrl} alt={topic.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                                  ) : (
                                    <span>{topic.name.slice(0, 2).toUpperCase()}</span>
                                  )}
                                </div>
                                {/* Status Badge */}
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#2B2D31] ${statusDotClass}`} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className={`font-bold text-xs truncate ${isTopicActive ? 'text-white' : 'text-[#DBDEE1]'}`}>
                                      {topic.name}
                                    </span>
                                    {topic.badgeText && (
                                      <span className="text-[9px] bg-[#5865F2] text-white font-extrabold px-1 rounded-xs uppercase tracking-tight shrink-0">
                                        {topic.badgeText}
                                      </span>
                                    )}
                                  </div>
                                  {topic.unreadCount && topic.unreadCount > 0 ? (
                                    <span className="shrink-0 bg-[#F23F43] text-white text-[10px] font-black rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                                      {topic.unreadCount}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-[11px] text-[#949BA4] truncate mt-0.5">
                                  {topic.userActivity || 'Ne pas déranger'}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </>
                    ) : activeContact?.topics && activeContact.topics.length > 0 ? (
                      <>
                        {/* Server Header */}
                            <div className="h-10 px-3 -mx-2 mb-2 border-b border-[#202225] flex items-center justify-between font-extrabold text-sm text-white hover:bg-[#35373C]/50 rounded-t-md transition-colors cursor-pointer select-none">
                              <span className="truncate">{activeContact?.name}</span>
                              <ChevronDown className="w-4 h-4 text-[#949BA4] shrink-0" />
                            </div>

                            {/* Channels grouped by Category */}
                            {(() => {
                              const topics = (activeContact?.topics || []).filter((t: any) => !searchFilter || t.name.toLowerCase().includes(searchFilter.toLowerCase()));
                              const categories = Array.from(new Set(topics.map((t: any) => t.category || 'SALONS TEXTUELS')));

                              return categories.map((catName) => {
                                const catTopics = topics.filter((t: any) => (t.category || 'SALONS TEXTUELS') === catName);

                                return (
                                  <div key={catName} className="mb-3">
                                    <div className="px-1 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#949BA4] flex items-center gap-1 select-none">
                                      <ChevronDown className="w-3 h-3 text-[#949BA4]" />
                                      <span>{catName}</span>
                                    </div>

                                    <div className="space-y-0.5 mt-0.5">
                                      {catTopics.map((topic: any, idx: number) => {
                                        const isTopicActive = selectedTopicId === topic.id || (!selectedTopicId && idx === 0);
                                        const isVoice = topic.type === 'voice';
                                        const isAnnouncement = topic.type === 'announcement' || topic.isBroadcast;

                                        return (
                                          <button
                                            key={topic.id}
                                            id={`topic-item-${topic.id}`}
                                            onClick={() => {
                                              onSelectTopic?.(topic.id);
                                              onMarkAsRead?.('discord', activeContact?.id || 'dc_dm', topic.id);
                                            }}
                                            className={`w-full px-2 py-1.5 rounded-md text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                                              isTopicActive
                                                ? 'bg-[#404249] text-white shadow-xs font-bold'
                                                : 'text-[#949BA4] hover:bg-[#35373C]/60 hover:text-[#DBDEE1]'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2 min-w-0">
                                              <span className="text-[#80848E] font-extrabold text-sm shrink-0 flex items-center">
                                                {isAnnouncement ? <Megaphone className="w-3.5 h-3.5 text-amber-400" /> : isVoice ? <Volume2 className="w-3.5 h-3.5 text-[#23A55A]" /> : '#'}
                                              </span>
                                              <span className="font-semibold text-xs truncate">
                                                {topic.name.replace(/^#/, '')}
                                              </span>
                                              {topic.closed && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                                            </div>
                                            {topic.unreadCount && topic.unreadCount > 0 ? (
                                              <span className="shrink-0 bg-[#F23F43] text-white text-[10px] font-black rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                                                {topic.unreadCount}
                                              </span>
                                            ) : null}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </>
                        ) : (
                          /* DISCORD CONTACT PROFILE CARD (NO EMPTY GREY SPACE) */
                          <div className="flex flex-col h-full bg-[#2B2D31] text-white -mx-2 -my-2 overflow-y-auto custom-scrollbar">
                            {/* Top Discord Banner */}
                            <div className="h-24 bg-gradient-to-r from-[#5865F2] via-[#4752C4] to-[#7289DA] relative shrink-0">
                              <div className="absolute -bottom-7 left-4">
                                <div className="relative">
                                  <div className="w-16 h-16 rounded-full overflow-hidden bg-[#5865F2] ring-4 ring-[#2B2D31] flex items-center justify-center font-black text-white text-lg shadow-lg">
                                    {activeContact?.profilePicUrl ? (
                                      <img src={activeContact.profilePicUrl} alt={activeContact.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <span>{(activeContact?.name || "D").slice(0, 2).toUpperCase()}</span>
                                    )}
                                  </div>
                                  <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-[#23A55A] ring-3 ring-[#2B2D31]" title="En ligne" />
                                </div>
                              </div>
                            </div>

                            {/* User Identity & Info Box */}
                            <div className="pt-9 px-4 pb-4 space-y-3.5 flex-1">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-extrabold text-base text-white truncate">{activeContact?.name}</h4>
                                  <span className="text-[9px] bg-[#5865F2] text-white font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                                    AMI
                                  </span>
                                </div>
                                <p className="text-xs text-[#949BA4] font-mono mt-0.5">
                                  {activeContact?.handleOrPhone || `@${(activeContact?.name || "discord_user").toLowerCase().replace(/\s+/g, '_')}`}
                                </p>
                              </div>

                              {/* Quick Actions (Message, Call, Video) */}
                              <div className="grid grid-cols-3 gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {}}
                                  className="py-2 px-2.5 rounded-xl bg-[#383A40] hover:bg-[#404249] text-xs font-semibold text-white flex flex-col items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                                >
                                  <MessageSquare className="w-4 h-4 text-[#5865F2]" />
                                  <span className="text-[10px] text-[#DBDEE1]">Message</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {}}
                                  className="py-2 px-2.5 rounded-xl bg-[#383A40] hover:bg-[#404249] text-xs font-semibold text-white flex flex-col items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                                >
                                  <Phone className="w-4 h-4 text-[#23A55A]" />
                                  <span className="text-[10px] text-[#DBDEE1]">Appel</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {}}
                                  className="py-2 px-2.5 rounded-xl bg-[#383A40] hover:bg-[#404249] text-xs font-semibold text-white flex flex-col items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                                >
                                  <Video className="w-4 h-4 text-[#5865F2]" />
                                  <span className="text-[10px] text-[#DBDEE1]">Vidéo</span>
                                </button>
                              </div>

                              {/* User Details & Status Card */}
                              <div className="bg-[#1E1F22] rounded-xl p-3 space-y-2.5 border border-[#232428] text-xs">
                                <div>
                                  <span className="text-[10px] font-extrabold text-[#949BA4] uppercase tracking-wider block">
                                    Statut en ligne
                                  </span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-[#23A55A] animate-pulse" />
                                    <span className="text-white text-xs font-medium">
                                      {activeContact?.statusText || "Actif sur Discord"}
                                    </span>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-white/5">
                                  <span className="text-[10px] font-extrabold text-[#949BA4] uppercase tracking-wider block">
                                    Discussion directe
                                  </span>
                                  <span className="text-[#DBDEE1] text-[11px] block mt-0.5">
                                    Canal privé chiffré Discord
                                  </span>
                                </div>

                                <div className="pt-2 border-t border-white/5">
                                  <span className="text-[10px] font-extrabold text-[#949BA4] uppercase tracking-wider block">
                                    Dernière activité
                                  </span>
                                  <span className="text-[#949BA4] text-[11px] block mt-0.5 italic">
                                    {activeContact?.lastMessage || "Discussion active"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                  {/* Authentic Discord Bottom User Profile Bar */}
                  <div className="h-14 bg-[#232428] px-2 flex items-center justify-between border-t border-[#1E1F22] shrink-0 select-none">
                    {/* User Info with Avatar & Status */}
                    <div className="flex items-center gap-2 min-w-0 hover:bg-[#35373C]/60 p-1 -ml-1 rounded-md cursor-pointer transition-colors">
                      <div className="relative shrink-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#5865F2] flex items-center justify-center text-white font-black text-xs shadow-xs">
                          {discordAccount?.avatar ? (
                            <img src={discordAccount.avatar} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                          ) : (
                            <DiscordIcon className="w-5 h-5 text-white" />
                          )}
                        </div>
                        {/* Green Online Status Dot */}
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#23A55A] border-2 border-[#232428] flex items-center justify-center" />
                      </div>

                      <div className="min-w-0">
                        <div className="font-extrabold text-xs text-white truncate leading-tight">
                          {discordAccount?.displayName || discordAccount?.global_name || discordAccount?.username || currentUser?.name || "Discord Account"}
                        </div>
                        <div className="text-[10px] text-[#949BA4] truncate leading-tight">
                          {discordAccount?.username ? `@${discordAccount.username}` : "En ligne"}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Audio & Settings Controls */}
                    <div className="flex items-center gap-0.5 text-[#B5BAC1]">
                      <button
                        type="button"
                        onClick={() => setIsDiscordMicMuted(!isDiscordMicMuted)}
                        className={`p-1.5 rounded-md hover:bg-[#35373C] transition-colors cursor-pointer ${isDiscordMicMuted ? 'text-[#F23F43]' : 'hover:text-white'}`}
                        title={isDiscordMicMuted ? "Activer le micro" : "Couper le micro"}
                      >
                        {isDiscordMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setIsDiscordDeafened(!isDiscordDeafened)}
                        className={`p-1.5 rounded-md hover:bg-[#35373C] transition-colors cursor-pointer ${isDiscordDeafened ? 'text-[#F23F43]' : 'hover:text-white'}`}
                        title={isDiscordDeafened ? "Activer le casque" : "Mettre en sourdine"}
                      >
                        <Headphones className="w-4 h-4" />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setActiveTab('settings')}
                        className="p-1.5 rounded-md hover:bg-[#35373C] hover:text-white transition-colors cursor-pointer"
                        title="Paramètres utilisateur"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
            <div className="contacts-topics-split flex-1 min-h-0 flex flex-row overflow-hidden">
              <div className={`contacts-list-pane flex-1 min-h-0 overflow-y-auto divide-y divide-[#DFDFD4]/50 dark:divide-neutral-800/80 custom-scrollbar ${activeContact?.isGroup && activeContact?.topics?.length ? 'border-r border-[#DFDFD4] dark:border-neutral-800' : ''}`}>
              {isSimulatingLoad ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
                  <div className="w-8 h-8 border-4 border-[#DFDFD4] dark:border-neutral-700 border-t-[#C13584] rounded-full animate-spin" style={{ borderTopColor: currentAppTheme.solidColor }}></div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 animate-pulse">Syncing {currentAppTheme.name} feed...</span>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs" style={{ backgroundColor: currentAppTheme.solidColor + '15' }}>
                    <MessageSquare className="w-6 h-6" style={{ color: currentAppTheme.solidColor }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {isConnected ? 'Listening for incoming messages' : 'No conversations yet'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[220px] leading-relaxed mt-1">
                      {isConnected
                        ? `Connected to ${currentAppTheme.name}. Inquiries and discussions will appear here in real-time.`
                        : 'Connect this channel to see real customer discussions and contacts here.'}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
                      id="empty-add-test-bot-btn"
                      type="button"
                      onClick={handleAddTestBotContact}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-xs hover:bg-emerald-500/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5 text-emerald-500" />
                      <span>+ Tester le Bot IA (Sandbox)</span>
                    </button>
                    {isConnected ? (
                      <button
                        id="empty-add-client-btn"
                        type="button"
                        onClick={() => setIsAddClientModalOpen(true)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                          isLightColor(currentAppTheme.solidColor) ? 'text-slate-950 font-black' : 'text-white'
                        }`}
                        style={{ backgroundColor: currentAppTheme.solidColor }}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>+ Add {currentAppTheme.name} Client</span>
                      </button>
                    ) : (
                      <button
                        id="empty-connect-channel-btn"
                        type="button"
                        onClick={onOpenConnect}
                        className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                          isLightColor(currentAppTheme.solidColor) ? 'text-slate-950 font-black' : 'text-white'
                        }`}
                        style={{ backgroundColor: currentAppTheme.solidColor }}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Connect {currentAppTheme.name}</span>
                      </button>
                    )}
                  </div>
                  {isConnected && selectedAppId !== 'instagram' && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Live Gateway Listening</span>
                    </div>
                  )}
                </div>
              ) : (
                filteredContacts.map((contact: any) => {
                  const isSelected =
                    contact.id === activeContactId ||
                    (contact.id && activeContactId && (contact.id.split(',').includes(activeContactId) || activeContactId.split(',').includes(contact.id)));
                  const isIg = selectedAppId === 'instagram';

                  if (isGmail) {
                    const isStarred = starredEmailIds.has(contact.id) || Boolean(contact.starred) || contact.labelIds?.includes?.('STARRED');
                    const isChecked = selectedEmailIds.has(contact.id);
                    const att = contact.attachments?.[0];

                    return (
                      <button
                        key={contact.id}
                        id={`contact-item-${contact.id}`}
                        onClick={() => {
                          onSelectChat(contact.id);
                          onMarkAsRead?.('gmail', contact.id);
                        }}
                        title={`${decodeHtmlEntities(contact.name)} — ${decodeHtmlEntities(contact.subject || contact.lastMessage)}`}
                        className={`contact-item-btn w-full px-3 py-2.5 text-left transition-colors flex items-center gap-3 relative cursor-pointer border-b border-black/5 dark:border-white/5 ${
                          isSelected
                            ? 'bg-[#2B2D31] text-white border-l-4 border-l-[#EA4335] shadow-xs'
                            : 'bg-white dark:bg-[#1E1F22] hover:bg-[#F2F3F5] dark:hover:bg-[#2B2D31]/70 border-l-4 border-l-transparent text-[#1B1B1B] dark:text-gray-200'
                        }`}
                      >
                        {/* 1. Square Checkbox & Star (NO CIRCULAR PROFILE PICTURE) */}
                        <div
                          className="flex items-center gap-2 shrink-0 select-none"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => toggleSelectEmail(contact.id)}
                            className={`w-4 h-4 rounded-[3px] border transition-colors flex items-center justify-center cursor-pointer ${
                              isChecked
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-400 dark:border-neutral-500 hover:border-gray-600 dark:hover:border-neutral-300'
                            }`}
                            title={isChecked ? "Désélectionner" : "Sélectionner"}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleStarEmail(contact.id)}
                            className={`p-0.5 rounded transition-transform active:scale-90 cursor-pointer ${
                              isStarred
                                ? 'text-amber-400'
                                : 'text-gray-400 dark:text-neutral-500 hover:text-amber-400'
                            }`}
                            title="Ajouter aux messages suivis"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                isStarred ? 'fill-amber-400 text-amber-400' : ''
                              }`}
                            />
                          </button>
                        </div>

                        {/* 2. Sender Name, Subject - Snippet, Real Attachment Chip, Time */}
                        <div className="contact-item-inner flex-1 min-w-0 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
                            {/* Sender Name in Bold */}
                            <span
                              className={`text-xs truncate shrink-0 ${
                                isSelected
                                  ? 'font-black text-white'
                                  : contact.unreadCount > 0
                                  ? 'font-black text-black dark:text-white'
                                  : 'font-semibold text-gray-800 dark:text-gray-200'
                              } w-24 sm:w-36`}
                            >
                              {decodeHtmlEntities(contact.name)}
                            </span>

                            {/* Subject - Snippet Preview */}
                            <div className="flex items-center gap-1 min-w-0 flex-1 truncate text-xs">
                              <span
                                className={`truncate ${
                                  isSelected
                                    ? 'font-bold text-white'
                                    : contact.unreadCount > 0
                                    ? 'font-bold text-gray-900 dark:text-white'
                                    : 'font-normal text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {decodeHtmlEntities(contact.subject || contact.name)}
                              </span>
                              <span className="text-gray-400 dark:text-neutral-500 truncate hidden md:inline">
                                &mdash; {decodeHtmlEntities(contact.snippet || contact.lastMessage)}
                              </span>
                            </div>

                            {/* Genuine Attachment Chip (e.g. 🖼 1000026777.jpg) matching user screenshot */}
                            {att && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 text-[10px] text-red-600 dark:text-red-400 shrink-0">
                                {att.isImage ? (
                                  <ImageIcon className="w-3 h-3 text-red-500" />
                                ) : (
                                  <FileText className="w-3 h-3 text-red-500" />
                                )}
                                <span className="font-medium truncate max-w-[110px]">
                                  {att.name}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Far Right Time / Date */}
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span
                              className={`text-[10px] font-mono ${
                                contact.unreadCount > 0
                                  ? 'font-bold text-black dark:text-white'
                                  : 'text-gray-400 dark:text-neutral-400'
                              }`}
                            >
                              {contact.time || contact.lastMessageTime || 'Live'}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  }

                  const isBot = Boolean(contact.isAiTestBot || contact.id?.startsWith('sandbox_bot_'));

                  return (
                    <button
                      key={contact.id}
                      id={`contact-item-${contact.id}`}
                      onClick={() => {
                        onSelectChat(contact.id);
                        onMarkAsRead?.(selectedAppId, contact.id);
                      }}
                      title={`${isBot ? 'Bot Test' : contact.name} — ${contact.lastMessage}`}
                      className={`contact-item-btn w-full p-2.5 sm:p-3 text-left transition-all flex items-center sm:items-start gap-3 relative cursor-pointer group/contact ${
                        isBot
                          ? isSelected
                            ? 'bg-emerald-500/20 dark:bg-emerald-950/50 border-l-4 border-l-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                            : 'bg-emerald-500/[0.08] dark:bg-emerald-950/25 border-l-4 border-l-emerald-500/80 shadow-xs hover:bg-emerald-500/15'
                          : isSelected
                          ? isIg
                            ? 'bg-pink-50/70 dark:bg-pink-950/30 border-l-4 border-l-[#C13584] shadow-xs'
                            : selectedAppId === 'telegram'
                              ? 'bg-sky-50/70 dark:bg-sky-950/30 border-l-4 border-l-[#2AABEE] shadow-xs'
                              : selectedAppId === 'viber'
                                ? 'bg-purple-50/70 dark:bg-purple-950/30 border-l-4 border-l-[#7360F2] shadow-xs'
                                : selectedAppId === 'snapchat'
                                  ? 'bg-yellow-50/80 dark:bg-yellow-950/30 border-l-4 border-l-[#FFFC00] shadow-xs'
                                  : 'bg-[#ECECE2]/90 dark:bg-neutral-800/90 border-l-4 border-l-[#1B6648] shadow-xs'
                          : 'hover:bg-[#ECECE2]/40 dark:hover:bg-neutral-800/40 border-l-4 border-l-transparent'
                      }`}
                    >
                      {/* Avatar or Status Circle */}
                      <div
                        className="contact-item-avatar-wrapper relative shrink-0 mt-0.5 cursor-pointer hover:scale-105 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProfile(contact, selectedAppId);
                        }}
                        title="Voir le profil du contact"
                      >
                        {isBot ? (
                          <div className="w-9 h-9 rounded-full shrink-0 relative overflow-hidden bg-neutral-800 select-none shadow-xs">
                            <img
                              src={BOT_TEST_AVATAR}
                              alt="Bot Test"
                              className="w-full h-full object-cover rounded-full block pointer-events-none"
                            />
                          </div>
                        ) : selectedAppId === 'whatsapp' || selectedAppId === 'whatsapp_2' ? (
                          <WhatsAppAvatar
                            profilePicUrl={contact.profilePicUrl}
                            name={contact.name}
                            identifier={contact.handleOrPhone || contact.id}
                            isGroup={contact.isGroup}
                            className="w-9 h-9"
                          />
                        ) : (
                          <div
                            className={`w-9 h-9 rounded-full ${
                              isIg
                                ? 'bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737]'
                                : contact.avatarColor || (contact.isGroup ? 'bg-indigo-600' : (selectedAppId === 'telegram' ? 'bg-[#2AABEE]' : selectedAppId === 'viber' ? 'bg-[#7360F2]' : selectedAppId === 'snapchat' ? 'bg-[#FFFC00] text-black font-extrabold' : 'bg-neutral-800'))
                            } text-white flex items-center justify-center font-bold text-xs shadow-xs relative overflow-hidden`}
                          >
                            {contact.profilePicUrl ? (
                              <img
                                src={contact.profilePicUrl}
                                alt={contact.name}
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                  const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'inline';
                                }}
                                className={`absolute inset-0 w-full h-full rounded-full object-cover ${
                                  isIg ? 'ring-2 ring-[#C13584] p-0.5' : selectedAppId === 'snapchat' ? 'ring-2 ring-yellow-400 p-0.5' : ''
                                }`}
                              />
                            ) : null}
                            <span className={contact.profilePicUrl ? 'hidden' : 'inline'}>{contact.avatarText || contact.name.slice(0, 2).toUpperCase()}</span>
                          </div>
                        )}

                        {/* Broadcast Channel Badge */}
                        {(contact.statusText === 'Channel' || contact.isBroadcast) && (
                          <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center shadow-xs border border-white dark:border-neutral-900" title="Broadcast Channel">
                            <Volume2 className="w-2.5 h-2.5" />
                          </span>
                        )}

                        {contact.status === 'ongoing' && !(contact.statusText === 'Channel' || contact.isBroadcast) && selectedAppId !== 'whatsapp' && selectedAppId !== 'whatsapp_2' && (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                            <span
                              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                                isIg ? 'bg-[#C13584]' : selectedAppId === 'viber' ? 'bg-[#7360F2]' : selectedAppId === 'snapchat' ? 'bg-amber-400' : 'bg-[#1B6648]'
                              }`}
                              opacity-75
                            />
                            <span
                              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                                isIg ? 'bg-[#C13584]' : selectedAppId === 'viber' ? 'bg-[#7360F2]' : selectedAppId === 'snapchat' ? 'bg-amber-400' : 'bg-[#1B6648]'
                              }`}
                            />
                          </span>
                        )}
                        {contact.status === 'finished' && !(contact.statusText === 'Channel' || contact.isBroadcast) && selectedAppId !== 'whatsapp' && selectedAppId !== 'whatsapp_2' && (
                          <CheckCircle2 className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-emerald-500 bg-white dark:bg-neutral-900 rounded-full" />
                        )}
                      </div>
                      <div className="contact-item-inner flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                        {/* Row 1: Contact Name (left) & Time / Bot Inline Actions (right) */}
                        <div className="contact-name-row flex items-center justify-between gap-1.5">
                          <h5
                            className={`font-bold text-xs truncate flex items-center gap-1.5 ${
                              isBot
                                ? 'text-emerald-700 dark:text-emerald-300 font-extrabold'
                                : isSelected
                                ? isIg
                                  ? 'text-[#C13584] dark:text-pink-400'
                                  : selectedAppId === 'telegram'
                                    ? 'text-[#2AABEE] dark:text-sky-400'
                                    : selectedAppId === 'viber'
                                      ? 'text-[#7360F2] dark:text-purple-400'
                                      : selectedAppId === 'snapchat'
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-[#1B6648] dark:text-emerald-400'
                                : 'text-[#1B1B1B] dark:text-white'
                            }`}
                          >
                            <ScrollingGroupTitle
                              name={isBot ? 'Bot Test' : contact.name}
                              isGroup={contact.isGroup}
                              isUntitledGroup={contact.isUntitledGroup}
                              participantNames={contact.participantNames}
                              maxWidthClass="max-w-[110px] xs:max-w-[145px] sm:max-w-[170px]"
                              titleClassName="font-bold text-xs"
                            />
                            {isBot && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.2 rounded flex items-center gap-0.5 shadow-2xs shrink-0">
                                <Pin className="w-2.5 h-2.5 fill-current" />
                                <span>PINNÉ</span>
                              </span>
                            )}
                            {isIg && <span className="text-[10px] text-pink-500 font-bold shrink-0">✓</span>}
                            {(contact.statusText === 'Channel' || contact.isBroadcast) && (
                              <span className="text-[9px] bg-[#2AABEE]/15 text-[#2AABEE] font-bold px-1.5 py-0.2 rounded-full font-mono flex items-center gap-1 shrink-0">
                                <Volume2 className="w-2.5 h-2.5 shrink-0" />
                                <span>Canal</span>
                              </span>
                            )}
                          </h5>

                          <div className="flex items-center gap-1 shrink-0 ml-1.5">
                            {isBot ? (
                              <div className="flex items-center gap-1">
                                <span
                                  role="button"
                                  onClick={(e) => handleResetTestBotConversation(contact.id, e)}
                                  title="Réinitialiser la conversation"
                                  className="p-1 rounded-md hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </span>
                                <span
                                  role="button"
                                  onClick={(e) => handleRemoveTestBotContact(contact.id, e)}
                                  title="Retirer le Bot Test"
                                  className="p-1 rounded-md hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 font-normal shrink-0">
                                {formatContactTime(contact)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Row 2: WhatsApp-Authentic Snippet (SVG Icon + Checkmark + Text) & Unread Badge */}
                        <div className="flex items-center justify-between gap-1.5 min-w-0">
                          <div className="flex-1 min-w-0">
                            {renderLastMessageSnippet(contact)}
                          </div>

                          {contact.unreadCount && contact.unreadCount > 0 ? (
                            <span
                              className={`shrink-0 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs flex items-center justify-center ${
                                isIg
                                  ? 'bg-[#C13584]'
                                  : selectedAppId === 'telegram'
                                    ? 'bg-[#2AABEE]'
                                    : selectedAppId === 'discord'
                                      ? 'bg-[#5865F2]'
                                      : selectedAppId === 'slack'
                                        ? 'bg-[#4A154B]'
                                        : selectedAppId === 'gmail'
                                          ? 'bg-[#EA4335]'
                                          : selectedAppId === 'viber'
                                            ? 'bg-[#7360F2]'
                                            : selectedAppId === 'snapchat'
                                              ? 'bg-[#FFFC00] text-black font-black border border-black/20'
                                              : 'bg-[#25D366]'
                              }`}
                            >
                              {contact.unreadCount > 999 ? '999+' : contact.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  );
                })
                )}
              </div>

              {/* Topics Split Pane */}
              {activeContact?.isGroup && activeContact?.topics && activeContact.topics.length > 0 && (
                <div className="topics-sidebar-pane flex-1 min-h-0 overflow-y-auto bg-gray-50/50 dark:bg-[#111317]/50 custom-scrollbar flex flex-col">
                  <div className="px-3 py-2 border-b border-[#DFDFD4] dark:border-neutral-800 bg-[#ECECE2]/40 dark:bg-black/40 text-xs font-bold text-gray-500 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-[#2AABEE]" />
                      <span>Topics</span>
                    </div>
                    <span className="text-[10px] text-gray-400 bg-gray-200/50 dark:bg-neutral-800 px-1.5 py-0.5 rounded-full font-mono">
                      {activeContact.topics.length}
                    </span>
                  </div>
                  <div className="flex-1 divide-y divide-[#DFDFD4]/30 dark:divide-neutral-800/50">
                    {activeContact.topics.map((topic: any, idx: number) => {
                      const isTopicActive = selectedTopicId === topic.id || (!selectedTopicId && idx === 0);
                      const glyphInfo = extractTopicGlyphAndTitle(topic);
                      const isTopicItemClosed = Boolean(topic.closed || (topic as any)?.isClosed);
                      const topicDateStr = formatTopicDate(topic.date || topic.timestamp);

                      // Build the second-line snippet authentic to Telegram
                      let topicSnippet = topic.lastMessage || '';
                      if (topic.lastMessageSender) {
                        topicSnippet = `${topic.lastMessageSender}: ${topicSnippet}`;
                      }
                      if (!topicSnippet) {
                        if (String(topic.id) === '1' || glyphInfo.title.toLowerCase() === 'general') {
                          topicSnippet = '. . joined the group via invite link';
                        } else {
                          topicSnippet = topic.userActivity || '';
                        }
                      }

                      return (
                        <button
                          key={topic.id}
                          id={`topic-item-${topic.id}`}
                          onClick={() => {
                            const targetContactId = activeContact?.id || selectedContactId || sortedContacts[0]?.id;
                            onSelectTopic?.(topic.id, targetContactId);
                            if (targetContactId) {
                              onMarkAsRead?.(selectedAppId, targetContactId, topic.id);
                            }
                          }}
                          className={`w-full px-3 py-2 text-left transition-all flex flex-col justify-center relative cursor-pointer border-b border-black/5 dark:border-white/5 ${
                            isTopicActive
                              ? 'bg-black/5 dark:bg-[#1E293B] border-l-4 border-l-[#2AABEE] shadow-xs'
                              : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] border-l-4 border-l-transparent text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {/* Top Row: [Emoji or #] [Title] ...... [Lock] [Pin] [Date/Time] */}
                          <div className="flex items-center justify-between gap-1.5 w-full min-w-0">
                            <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                              {/* Leading Glyph: Crisp emoji or Telegram blue # (NO profile picture circle) */}
                              <span className="shrink-0 text-base leading-none select-none flex items-center justify-center w-5">
                                {glyphInfo.isHash ? (
                                  <span className="text-[#2AABEE] font-black text-sm">#</span>
                                ) : (
                                  <span className="text-sm sm:text-base">{glyphInfo.glyph}</span>
                                )}
                              </span>
                              <span
                                className={`font-semibold text-xs sm:text-[13px] truncate ${
                                  isTopicActive
                                    ? 'text-[#2AABEE] dark:text-[#54b8ea] font-bold'
                                    : 'text-gray-900 dark:text-white'
                                }`}
                              >
                                {glyphInfo.title}
                              </span>
                            </div>

                            {/* Right Meta Badges: Lock, Pin, Date */}
                            <div className="flex items-center gap-1.5 shrink-0 text-gray-400 dark:text-gray-500 select-none text-[10px]">
                              {isTopicItemClosed && (
                                <span className="text-gray-400 dark:text-gray-400 text-xs leading-none" title="Verrouillé">🔒</span>
                              )}
                              {topic.pinned && (
                                <span className="text-amber-500" title="Épinglé">
                                  <Pin className="w-3 h-3 fill-current rotate-45 inline" />
                                </span>
                              )}
                              {topicDateStr && (
                                <span className="font-mono text-[10.5px] opacity-80">{topicDateStr}</span>
                              )}
                            </div>
                          </div>

                          {/* Bottom Row: [Last message snippet preview] ...... [Unread Count Badge] */}
                          <div className="flex items-center justify-between gap-2 w-full min-w-0 mt-0.5 pl-7">
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate flex-1 leading-tight">
                              {topicSnippet}
                            </p>
                            {topic.unreadCount && topic.unreadCount > 0 ? (
                              <span className="shrink-0 bg-[#2AABEE] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs">
                                {topic.unreadCount}
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            )}

            </PullToRefresh>
          </motion.div>
        )}

      {/* ========================================================================= */}
      {/* TAB 2: ANALYTICS (Contextual to Selected App + Synced Master AI Switch) */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <motion.div
          key="analytics-tab"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}
          className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 space-y-4 custom-scrollbar text-xs analytics-container"
        >
          {/* Synchronized AI Switch */}
          <div className="p-3.5 rounded-2xl bg-[#ECECE2]/50 dark:bg-black/30 border border-[#DFDFD4] dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#1B6648] dark:text-emerald-400" />
                <span className="font-bold text-xs text-[#1B6648] dark:text-emerald-400">
                  AI Sales Agent ({selectedAppId.toUpperCase()})
                </span>
              </div>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
              {isAiActive
                ? 'Auto-replying in authentic Algiers Darija with Yalidine delivery calculation.'
                : 'AI auto-responder paused. Operators reply manually.'}
            </p>
          </div>

          {/* App Specific Metrics */}
          {selectedAppId === 'whatsapp' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 analytics-grid">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800">
                  <span className="text-[10px] text-gray-500 flex items-center gap-1"><ShoppingBag className="w-3 h-3 text-[#EB6708]" /> Orders Closed</span>
                  <p className="text-base font-black mt-1">14 orders</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800">
                  <span className="text-[10px] text-gray-500 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-[#1B6648]" /> WhatsApp GMV</span>
                  <p className="text-base font-black text-[#1B6648] dark:text-emerald-400 mt-1">49,000 DA</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-[#1B6648]" /> Yalidine Express Sync</span>
                  <span className="font-bold text-[#EB6708]">12 Shipped • 2 Pending</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden flex">
                  <div className="bg-[#1B6648] h-full w-[70%]" />
                  <div className="bg-[#FB9B3C] h-full w-[20%]" />
                  <div className="bg-red-400 h-full w-[10%]" />
                </div>
              </div>
            </div>
          )}

          {selectedAppId === 'instagram' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 analytics-grid">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800">
                  <span className="text-[10px] text-gray-500">IG Inbound DMs</span>
                  <p className="text-base font-black text-[#8338EC] mt-1">42 DMs</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800">
                  <span className="text-[10px] text-gray-500">Story Conversions</span>
                  <p className="text-base font-black text-[#EB6708] mt-1">18 sales</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800 space-y-1">
                <span className="text-[10px] text-gray-500">Top Inquired Product</span>
                <p className="text-xs font-bold">Montre Homme Noire (4,800 DA)</p>
              </div>
            </div>
          )}

          {selectedAppId === 'telegram' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 analytics-grid">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800">
                  <span className="text-[10px] text-gray-500">Bot Commands</span>
                  <p className="text-base font-black text-blue-500 mt-1">128 hits</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800">
                  <span className="text-[10px] text-gray-500">Active Telegram Users</span>
                  <p className="text-base font-black text-[#1B6648] mt-1">64</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800 space-y-1">
                <span className="text-[10px] text-gray-500">Popular Command</span>
                <p className="text-xs font-mono font-bold text-blue-500">/catalogue (45 times)</p>
              </div>
            </div>
          )}

          {selectedAppId === 'messenger' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 analytics-grid">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800">
                  <span className="text-[10px] text-gray-500">Facebook Ad Leads</span>
                  <p className="text-base font-black text-[#0084FF] mt-1">34 leads</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800">
                  <span className="text-[10px] text-gray-500">Avg Response Time</span>
                  <p className="text-base font-black text-emerald-600 mt-1">&lt; 45s</p>
                </div>
              </div>
            </div>
          )}

          {selectedAppId === 'web_widget' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 analytics-grid">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800">
                  <span className="text-[10px] text-gray-500">Live Active Visitors</span>
                  <p className="text-base font-black text-teal-600 mt-1">8 online</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800">
                  <span className="text-[10px] text-gray-500">Cart Recovery Rate</span>
                  <p className="text-base font-black text-[#EB6708] mt-1">32.4%</p>
                </div>
              </div>
            </div>
          )}

          {selectedAppId === 'gmail' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 analytics-grid">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800">
                  <span className="text-[10px] text-gray-500">Emails Resolved</span>
                  <p className="text-base font-black text-red-500 mt-1">24 threads</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800">
                  <span className="text-[10px] text-gray-500">Invoices Sent</span>
                  <p className="text-base font-black text-emerald-600 mt-1">18 PDFs</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: APP SPECIFIC SETTINGS (Fully Functional & Interactive) */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <motion.div
          key="settings-tab"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}
          className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 space-y-4 custom-scrollbar text-xs settings-container"
        >
          {/* Assigned Multi-Bot AI Agent */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between gap-1 min-w-0">
              <h5 title="Assigned AI Bot" className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5 truncate min-w-0">
                <Bot className="settings-header-icon w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">Assigned AI Bot</span>
              </h5>
              <span title={assignedBot ? 'Routing Active' : 'Unassigned'} className={`settings-badge text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                assignedBot ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-gray-200 dark:bg-neutral-800 text-gray-500'
              }`}>
                {assignedBot ? 'Routing Active' : 'Unassigned'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-[#1E222A] border border-gray-200 dark:border-neutral-700">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl p-1 rounded-lg bg-gray-100 dark:bg-black/30 shrink-0">
                  {assignedBot?.avatar || '🤖'}
                </span>
                <div className="min-w-0">
                  <p title={assignedBot?.name || 'No bot assigned'} className="font-bold text-xs text-[#1B1B1B] dark:text-white truncate">
                    {assignedBot?.name || 'No bot assigned'}
                  </p>
                  <p title={assignedBot ? `Handles ${selectedAppId.toUpperCase()} messages` : 'Assign a bot in Settings'} className="text-[10px] text-gray-400 truncate">
                    {assignedBot ? `Handles ${selectedAppId.toUpperCase()} messages` : 'Assign a bot in Settings'}
                  </p>
                </div>
              </div>

              {availableBots.length > 0 && (
                <div className="relative shrink-0" ref={botDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsBotDropdownOpen(!isBotDropdownOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-gray-50 hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700/80 border border-gray-200 dark:border-neutral-700 rounded-xl text-gray-900 dark:text-white transition-all shadow-xs cursor-pointer max-w-[170px]"
                    title="Switch bot assignment"
                  >
                    <span className="text-sm shrink-0">{assignedBot?.avatar || '🤖'}</span>
                    <span className="truncate text-[11px] font-bold">{assignedBot?.name || 'Switch Bot...'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200 ${isBotDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isBotDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1.5 w-60 p-1.5 bg-white dark:bg-[#1A1D23] border border-gray-200 dark:border-neutral-700 rounded-2xl shadow-xl z-50 overflow-hidden"
                      >
                        <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-neutral-800 mb-1">
                          Select AI Persona
                        </div>
                        <div className="max-h-52 overflow-y-auto space-y-0.5 custom-scrollbar">
                          {availableBots.map((b: any) => {
                            const isSelected = assignedBot?.id === b.id;
                            return (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => {
                                  handleAssignBotToChannel(b.id);
                                  setIsBotDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                                    : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-800 dark:text-gray-200 font-medium'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-base shrink-0 p-1 rounded-lg bg-gray-100 dark:bg-neutral-800/80">
                                    {b.avatar || '🤖'}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-xs truncate leading-snug">{b.name}</p>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate leading-snug">
                                      {b.assignedApps?.length || 0} channel{(b.assignedApps?.length || 0) !== 1 ? 's' : ''} assigned
                                    </p>
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {assignedBot && (
                          <div className="pt-1 mt-1 border-t border-gray-100 dark:border-neutral-800">
                            <button
                              type="button"
                              onClick={() => {
                                handleAssignBotToChannel('');
                                setIsBotDropdownOpen(false);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors cursor-pointer font-semibold"
                            >
                              <X className="w-3.5 h-3.5 shrink-0" />
                              <span>Unassign from channel</span>
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Channel Automation Rules */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800 space-y-3">
            <h5 title="Channel Automation Rules" className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5 truncate min-w-0">
              <Sliders className="settings-header-icon w-3.5 h-3.5 text-[#EB6708] shrink-0" />
              <span className="truncate">Channel Automation Rules</span>
            </h5>

            <div className="space-y-2.5 divide-y divide-gray-200/60 dark:divide-neutral-800">
              {/* Toggle: Yalidine Auto-Sync */}
              <div className="flex items-center justify-between pt-1 gap-2 settings-toggle-row">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate">Yalidine Auto Tracking</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 settings-desc truncate">Generate tracking codes instantly</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSetting('yalidineAutoSync')}
                  className={`relative inline-flex h-4 w-8 shrink-0 items-center rounded-full transition-all duration-200 cursor-pointer hover:scale-110 ${
                    settingsToggles.yalidineAutoSync ? 'bg-[#1B6648]' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      settingsToggles.yalidineAutoSync ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3: Human Agent Escalation */}
              <div className="flex items-center justify-between pt-2 gap-2 settings-toggle-row">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate">Operator Escalation</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 settings-desc truncate">Alert on angry/urgent keywords</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSetting('humanEscalation')}
                  className={`relative inline-flex h-4 w-8 shrink-0 items-center rounded-full transition-all duration-200 cursor-pointer hover:scale-110 ${
                    settingsToggles.humanEscalation ? 'bg-[#1B6648]' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      settingsToggles.humanEscalation ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 4: Seen Receipt */}
              <div className="flex items-center justify-between pt-2 gap-2 settings-toggle-row">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate">Send 'Seen' Receipts (Vu)</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 settings-desc truncate">Trigger blue checks on incoming message</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSetting('sendSeenReceipts')}
                  className={`relative inline-flex h-4 w-8 shrink-0 items-center rounded-full transition-all duration-200 cursor-pointer hover:scale-110 ${
                    settingsToggles.sendSeenReceipts ? 'bg-[#1B6648]' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      settingsToggles.sendSeenReceipts ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Dedicated Channel Disconnect / Reset Section */}
          <div className="p-3.5 rounded-2xl bg-red-50/70 dark:bg-red-950/20 border border-red-200/80 dark:border-red-800/40 space-y-2">
            <div className="flex items-center justify-between settings-disconnect-row">
              <div className="min-w-0 flex-1">
                <h5 className="font-bold text-xs text-red-700 dark:text-red-400 flex items-center gap-1.5 truncate">
                  <Unlink className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Disconnect {currentAppTheme.name}</span>
                </h5>
                <p className="text-[10px] text-red-600/80 dark:text-red-400/70 settings-desc truncate">
                  Reset gateway session or switch account credentials
                </p>
              </div>
              <button
                id="settings-disconnect-channel-btn"
                type="button"
                onClick={() => onDisconnectChannel?.(selectedAppId)}
                className="settings-disconnect-btn shrink-0 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer text-center"
              >
                Disconnect
              </button>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* ADD REAL CLIENT MODAL (For Instagram Friends & Client Discussions)       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAddClientModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            onClick={() => setIsAddClientModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white dark:bg-[#1E222A] rounded-3xl p-5 shadow-2xl border border-gray-200 dark:border-neutral-700 space-y-4"
            >
              <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-xl text-white flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: currentAppTheme.solidColor }}
                  >
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 dark:text-white leading-tight">
                      Add {currentAppTheme.name} Client
                    </h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Start an authentic discussion on {currentAppTheme.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick 1-Click AI Test Bot Sandbox Button */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between gap-2 shadow-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                    <Bot className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Discussion Test Bot IA</span>
                  </div>
                  <p className="text-[10.5px] text-gray-500 dark:text-gray-400 truncate">
                    Tester l'assistant immédiatement sans vrai contact
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleAddTestBotContact();
                    setIsAddClientModalOpen(false);
                  }}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  <span>Tester</span>
                </button>
              </div>

              <form onSubmit={handleAddClient} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                    <span>
                      {['whatsapp', 'whatsapp_2', 'signal', 'viber', 'snapchat', 'google_messages', 'google_voice'].includes(selectedAppId)
                        ? 'Numéro de Téléphone *'
                        : selectedAppId === 'discord'
                        ? 'Canal Discord ou Utilisateur *'
                        : selectedAppId === 'slack'
                        ? 'Canal Slack ou Membre *'
                        : selectedAppId === 'irc'
                        ? 'Canal IRC ou Pseudo *'
                        : selectedAppId === 'matrix'
                        ? 'Matrix User ID *'
                        : selectedAppId === 'gmail'
                        ? 'Adresse Email *'
                        : `Identifiant ${currentAppTheme.name} *`}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Requis</span>
                  </label>
                  {['whatsapp', 'whatsapp_2', 'signal', 'viber', 'snapchat', 'google_messages', 'google_voice'].includes(selectedAppId) ? (
                    <PhoneInput
                      id="modal-client-handle-input"
                      value={newClientHandle}
                      onChange={(val) => setNewClientHandle(val)}
                      defaultCountry="DZ"
                      placeholder="Numéro mobile du contact"
                    />
                  ) : (
                    <div className="relative">
                      <input
                        id="modal-client-handle-input"
                        type="text"
                        required
                        value={newClientHandle}
                        onChange={(e) => setNewClientHandle(e.target.value)}
                        placeholder={
                          selectedAppId === 'discord'
                            ? "#commandes-oran or Amine#1234"
                            : selectedAppId === 'slack'
                            ? "#general or @mehdi"
                            : selectedAppId === 'irc'
                            ? "#algeria or redha_dz"
                            : selectedAppId === 'matrix'
                            ? "@client:matrix.org"
                            : selectedAppId === 'gmail'
                            ? "client@gmail.com"
                            : "@username"
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#1B6648]"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Contact / Display Name (Optional)
                  </label>
                  <input
                    id="modal-client-name-input"
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g. Amine / Boutique Mode"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#C13584]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    First Message / Greeting
                  </label>
                  <textarea
                    id="modal-client-msg-input"
                    rows={2}
                    value={newClientMsg}
                    onChange={(e) => setNewClientMsg(e.target.value)}
                    placeholder="Bonjour, merci pour votre commande..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#C13584]"
                  />
                </div>

                <button
                  id="modal-submit-add-client-btn"
                  type="submit"
                  disabled={isAddingClient || !newClientHandle.trim()}
                  className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all hover:opacity-95 active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)"
                  }}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isAddingClient ? 'Adding Client...' : 'Add Client & Open Chat'}</span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
