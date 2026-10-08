"use client";

import React, { useState, useEffect } from 'react';
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
  Settings,
  Key,
  Globe,
  MessageSquare,
  ShieldCheck,
  Zap,
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
  Volume2
} from 'lucide-react';
import { DiscordIcon } from '@/components/icons/BrandIcons';
import { MOCK_CONTACTS_BY_APP, ContactProfile, APP_GRADIENT_THEMES, getContactsForApp } from '@/lib/mock_chats';

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
}) => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'analytics' | 'settings'>(activeTabOverride || 'contacts');
  const [isSimulatingLoad, setIsSimulatingLoad] = useState(false);

  useEffect(() => {
    setIsSimulatingLoad(true);
    const timer = setTimeout(() => setIsSimulatingLoad(false), 1500);
    return () => clearTimeout(timer);
  }, [selectedAppId]);
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

  // Discord Interactive Controls State
  const [isDiscordMicMuted, setIsDiscordMicMuted] = useState(true);
  const [isDiscordDeafened, setIsDiscordDeafened] = useState(false);

  // Inbox sync state
  const [isSyncingInbox, setIsSyncingInbox] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

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
        setSyncNotice(data.message || `Imported ${data.threads.length} conversations`);
        setTimeout(() => setSyncNotice(null), 3500);
      } else if (data.message) {
        setSyncNotice(data.message);
        setTimeout(() => setSyncNotice(null), 3500);
      }
    } catch (e: any) {
      setSyncNotice(e.message || 'Sync failed');
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
      const data = await res.json();
      if (data.success && data.contact) {
        const contactWithApp = { ...data.contact, appId: selectedAppId };
        setLocalAddedContacts((prev) => [contactWithApp, ...prev]);
        onContactAdded?.(contactWithApp);
        onSelectChat(contactWithApp.id);
        setIsAddClientModalOpen(false);
        setNewClientHandle('');
        setNewClientName('');
        setNewClientMsg('');
      }
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
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Multi-Bot assignment for active channel
  const [assignedBot, setAssignedBot] = useState<{ id: string; name: string; avatar: string } | null>(null);
  const [availableBots, setAvailableBots] = useState<any[]>([]);

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
          if (b.id === botId) {
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
        localStorage.setItem(`cf_assigned_bot_${selectedAppId}`, botId);
        setAvailableBots(updated);
        const target = updated.find((b: any) => b.id === botId);
        setAssignedBot(target || null);
      }
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

  // Resolve contacts list strictly based on real live contacts (zero synthetic fallback)
  const rawContacts: ContactProfile[] = (isConnected && liveContacts && liveContacts.length > 0)
    ? liveContacts.map((lc) => ({
        ...lc,
        topics: (lc.topics && lc.topics.length > 0) ? lc.topics : undefined,
        profilePicUrl: lc.profilePicUrl || null,
      }))
    : [];
  const extraForApp = localAddedContacts.filter((c) => c.appId === selectedAppId || !c.appId);
  const contactsList: ContactProfile[] = [
    ...extraForApp,
    ...rawContacts.filter((c) => !extraForApp.some((e) => e.id === c.id || e.handleOrPhone.toLowerCase() === c.handleOrPhone.toLowerCase()))
  ];
  // Chronological sort: newest activity always at the top (like native WhatsApp & Instagram)
  // For Discord: Messages Privés (dc_dm) is ALWAYS pinned at the very top of the list!
  const sortedContacts = [...contactsList].sort((a, b) => {
    if (selectedAppId === 'discord') {
      if (a.id === 'dc_dm' || a.name.toLowerCase().includes('messages privés')) return -1;
      if (b.id === 'dc_dm' || b.name.toLowerCase().includes('messages privés')) return 1;
    }
    return (b.timestamp || 0) - (a.timestamp || 0);
  });
  const filteredContacts = sortedContacts.filter((c) =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.handleOrPhone.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const activeContactId = selectedContactId || sortedContacts[0]?.id;
  const activeContact = sortedContacts.find((c: any) =>
    c.id === activeContactId ||
    (c.id && activeContactId && (c.id.split(',').includes(activeContactId) || activeContactId.split(',').includes(c.id)))
  );
  const currentAppTheme = APP_GRADIENT_THEMES[selectedAppId] || APP_GRADIENT_THEMES.whatsapp;

  return (
    <div 
    className="h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-white dark:bg-[#1A1D23] rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] text-[#1B1B1B] dark:text-gray-100 overflow-hidden shadow-sm"
    style={{ containerType: 'inline-size', containerName: 'righthub' }}
  >
    <style dangerouslySetInnerHTML={{ __html: `
      @container righthub (max-width: 230px) {
        .contacts-topics-split { flex-direction: column !important; }
        .topics-sidebar-pane { max-height: 48% !important; min-height: 140px !important; border-top: 1px solid rgba(0,0,0,0.1) !important; border-left: none !important; }
        .contacts-list-pane { border-right: none !important; }
      }
      @container righthub (max-width: 320px) {
        .hub-detach-text { display: none !important; }
        .hub-detach-btn { padding: 0.35rem !important; aspect-ratio: 1/1 !important; width: 2.25rem !important; height: 2.25rem !important; justify-content: center !important; }
        .analytics-grid { grid-template-columns: 1fr !important; gap: 0.5rem !important; }
      }
      @container righthub (max-width: 290px) {
        .hub-tab-text { display: none !important; }
        .hub-tab-count { display: none !important; }
        .hub-action-text { display: none !important; }
        .hub-action-btn { padding: 0.5rem !important; aspect-ratio: 1/1 !important; width: 2rem !important; height: 2rem !important; justify-content: center !important; }
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
        .analytics-container { padding: 0.75rem !important; }
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
          <div className="w-full flex items-center justify-between text-white pointer-events-none select-none">
            <div className="flex items-center gap-2 font-bold">
              {activeTab === 'analytics' ? <BarChart2 className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
              <span className="capitalize">{activeTab}</span>
            </div>
            {onReattach && (
              <button 
                onClick={onReattach} 
                onPointerDown={(e) => e.stopPropagation()}
                className="p-1.5 hover:bg-black/20 rounded-lg transition-colors cursor-pointer pointer-events-auto" 
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

          return (
            <div className="w-full flex items-center gap-1.5 min-w-0">
              <div className="flex-1 min-w-0">
                <nav 
                  className="relative h-9 w-full grid gap-1 p-0.5 bg-black/25 backdrop-blur-md rounded-xl border border-white/20 items-center"
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
                          className={`w-full h-full py-1.5 px-1.5 sm:px-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap overflow-hidden leading-none ${
                            isActive
                              ? 'text-gray-950 font-extrabold'
                              : 'text-white/80 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {tab.icon}
                          <span className="hub-tab-text">{tab.label}</span>
                          {'count' in tab && tab.count !== undefined && (
                            <span className="hub-tab-count text-[9px] opacity-90 flex items-center justify-center bg-black/10 dark:bg-white/10 rounded-full px-1.5 py-0.5 min-w-[18px] ml-0.5">
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
            {/* Search bar & + Add Client Button (Non-Discord Channels) */}
            {selectedAppId !== 'discord' && (
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
                {isConnected && (
                  <div className="flex items-center gap-1.5 shrink-0">
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
                    <button
                      id="add-client-btn"
                      type="button"
                      onClick={() => setIsAddClientModalOpen(true)}
                      title={`Add ${currentAppTheme.name} Client / Discussion`}
                      className="hub-action-btn px-2.5 py-2 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      style={{ backgroundColor: currentAppTheme.solidColor }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hub-action-text">Add Client</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Sync Notice Alert */}
            {syncNotice && (
              <div className="mx-4 mt-2 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-purple-800 dark:text-purple-200 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>{syncNotice}</span>
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
                            <span className="absolute -bottom-1 -right-1 bg-[#F23F43] text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center border-2 border-[#1E1F22] shadow-xs">
                              {dmUnread > 99 ? '99+' : dmUnread}
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
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                          ) : null}
                          <span className="font-extrabold text-xs text-white select-none">
                            {server.avatarText || server.name.slice(0, 2).toUpperCase()}
                          </span>

                          {/* Red Notification Badge */}
                          {isNouveau ? (
                            <span className="absolute -bottom-1 -right-1 bg-[#F23F43] text-white text-[8px] font-black rounded-full px-1 py-0.2 border border-[#1E1F22] shadow-xs tracking-tighter">
                              NOUVEAU
                            </span>
                          ) : unread > 0 ? (
                            <span className="absolute -bottom-1 -right-1 bg-[#F23F43] text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center border-2 border-[#1E1F22] shadow-xs">
                              {unread > 99 ? '99+' : unread}
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
                    ) : (
                      /* =========================================================================
                         SERVER CHANNELS VIEW (CATEGORIES + CHANNELS)
                         ========================================================================= */
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
                                          <span className="text-[#80848E] font-extrabold text-sm shrink-0">
                                            {isAnnouncement ? '📢' : isVoice ? '🔊' : '#'}
                                          </span>
                                          <span className="font-semibold text-xs truncate">
                                            {topic.name.replace(/^#/, '')}
                                          </span>
                                          {topic.closed && <span className="text-[10px] text-amber-400">🔒</span>}
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
                    )}
                  </div>

                  {/* Authentic Discord Bottom User Profile Bar */}
                  <div className="h-14 bg-[#232428] px-2 flex items-center justify-between border-t border-[#1E1F22] shrink-0 select-none">
                    {/* User Info with Avatar & Status */}
                    <div className="flex items-center gap-2 min-w-0 hover:bg-[#35373C]/60 p-1 -ml-1 rounded-md cursor-pointer transition-colors">
                      <div className="relative shrink-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#5865F2] flex items-center justify-center text-white font-black text-xs shadow-xs">
                          {(() => {
                            let discAvatar = null;
                            try {
                              const stored = typeof window !== 'undefined' ? localStorage.getItem('cf_discord_account') : null;
                              if (stored) discAvatar = JSON.parse(stored).avatar;
                            } catch {}
                            return discAvatar ? (
                              <img src={discAvatar} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                            ) : (
                              <DiscordIcon className="w-5 h-5 text-white" />
                            );
                          })()}
                        </div>
                        {/* Green Online Status Dot */}
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#23A55A] border-2 border-[#232428] flex items-center justify-center" />
                      </div>

                      <div className="min-w-0">
                        <div className="font-extrabold text-xs text-white truncate leading-tight">
                          {(() => {
                            try {
                              const stored = typeof window !== 'undefined' ? localStorage.getItem('cf_discord_account') : null;
                              if (stored) {
                                const acc = JSON.parse(stored);
                                return acc.displayName || acc.global_name || acc.username || currentUser?.name || "Discord Account";
                              }
                            } catch {}
                            return currentUser?.name || "Discord Account";
                          })()}
                        </div>
                        <div className="text-[10px] text-[#949BA4] truncate leading-tight">
                          {(() => {
                            try {
                              const stored = typeof window !== 'undefined' ? localStorage.getItem('cf_discord_account') : null;
                              if (stored) {
                                const acc = JSON.parse(stored);
                                return acc.username ? `@${acc.username}` : "En ligne";
                              }
                            } catch {}
                            return "En ligne";
                          })()}
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
                  {isConnected ? (
                    <button
                      id="empty-add-client-btn"
                      type="button"
                      onClick={() => setIsAddClientModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl text-white text-xs font-bold shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
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
                      className="px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer mt-1"
                      style={{ backgroundColor: currentAppTheme.solidColor }}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Connect {currentAppTheme.name}</span>
                    </button>
                  )}
                  {isConnected && selectedAppId !== 'instagram' && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Live Gateway Listening</span>
                    </div>
                  )}
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const isSelected =
                    contact.id === activeContactId ||
                    (contact.id && activeContactId && (contact.id.split(',').includes(activeContactId) || activeContactId.split(',').includes(contact.id)));
                  const isIg = selectedAppId === 'instagram';
                  return (
                    <button
                      key={contact.id}
                      id={`contact-item-${contact.id}`}
                      onClick={() => {
                        onSelectChat(contact.id);
                        onMarkAsRead?.(selectedAppId, contact.id);
                      }}
                      title={`${contact.name} — ${contact.lastMessage}`}
                      className={`contact-item-btn w-full p-2.5 sm:p-3 text-left transition-all flex items-center sm:items-start gap-3 relative cursor-pointer ${
                        isSelected
                          ? isIg
                            ? 'bg-pink-50/70 dark:bg-pink-950/30 border-l-4 border-l-[#C13584] shadow-xs'
                            : selectedAppId === 'telegram'
                              ? 'bg-sky-50/70 dark:bg-sky-950/30 border-l-4 border-l-[#2AABEE] shadow-xs'
                              : 'bg-[#ECECE2]/90 dark:bg-neutral-800/90 border-l-4 border-l-[#1B6648] shadow-xs'
                          : 'hover:bg-[#ECECE2]/40 dark:hover:bg-neutral-800/40 border-l-4 border-l-transparent'
                      }`}
                    >
                      {/* Avatar or Status Circle */}
                      <div className="contact-item-avatar-wrapper relative shrink-0 mt-0.5">
                        <div
                          className={`w-9 h-9 rounded-full ${
                            isIg
                              ? 'bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737]'
                              : contact.avatarColor || (contact.isGroup ? 'bg-indigo-600' : (selectedAppId === 'telegram' ? 'bg-[#2AABEE]' : 'bg-[#1B6648]'))
                          } text-white flex items-center justify-center font-bold text-xs shadow-xs relative overflow-hidden`}
                        >
                          {contact.profilePicUrl ? (
                            <img
                              src={contact.profilePicUrl}
                              alt={contact.name}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                              className={`absolute inset-0 w-full h-full rounded-full object-cover ${
                                isIg ? 'ring-2 ring-[#C13584] p-0.5' : 'border border-black/10 dark:border-white/10'
                              }`}
                            />
                          ) : null}
                          <span>{contact.avatarText || contact.name.slice(0, 2).toUpperCase()}</span>
                        </div>

                        {/* Broadcast Channel Badge (📢) */}
                        {(contact.statusText === 'Channel' || contact.isBroadcast) && (
                          <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center shadow-xs border border-white dark:border-neutral-900" title="Broadcast Channel">
                            📢
                          </span>
                        )}

                        {contact.status === 'ongoing' && !(contact.statusText === 'Channel' || contact.isBroadcast) && (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                            <span
                              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                                isIg ? 'bg-[#C13584]' : 'bg-[#1B6648]'
                              }`}
                              opacity-75
                            />
                            <span
                              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                                isIg ? 'bg-[#C13584]' : 'bg-[#1B6648]'
                              }`}
                            />
                          </span>
                        )}
                        {contact.status === 'finished' && !(contact.statusText === 'Channel' || contact.isBroadcast) && (
                          <CheckCircle2 className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-emerald-500 bg-white dark:bg-neutral-900 rounded-full" />
                        )}
                      </div>
                      <div className="contact-item-inner flex-1 min-w-0 flex flex-col justify-center">
                        <div className="contact-name-row flex items-center justify-between mb-0.5">
                          <h5
                            className={`font-bold text-xs truncate flex items-center gap-1.5 ${
                              isSelected
                                ? isIg
                                  ? 'text-[#C13584] dark:text-pink-400'
                                  : selectedAppId === 'telegram'
                                    ? 'text-[#2AABEE] dark:text-sky-400'
                                    : 'text-[#1B6648] dark:text-emerald-400'
                                : 'text-[#1B1B1B] dark:text-white'
                            }`}
                          >
                            <span>{contact.name}</span>
                            {isIg && <span className="text-[10px] text-pink-500 font-bold">✓</span>}
                            {(contact.statusText === 'Channel' || contact.isBroadcast) && (
                              <span className="text-[9px] bg-[#2AABEE]/15 text-[#2AABEE] font-bold px-1.5 py-0.2 rounded-full font-mono flex items-center gap-0.5">
                                <span>📢</span> Channel
                              </span>
                            )}
                          </h5>
                          <div className="flex flex-col items-end gap-1 shrink-0 ml-1.5">
                            <span className="contact-extra-details text-[10px] text-gray-400 font-mono">
                              {contact.lastMessageTime || contact.time || 'Just now'}
                            </span>
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
                                            : 'bg-[#25D366]'
                                }`}
                              >
                                {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <p className="contact-extra-details text-[11px] text-gray-500 dark:text-gray-400 truncate">{contact.lastMessage}</p>
                        <div className="contact-extra-details flex items-center justify-between mt-1.5 text-[10px]">
                          <span
                            className={`truncate ${
                              isIg
                                ? 'font-mono text-purple-600 dark:text-purple-400 font-bold'
                                : 'font-semibold text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {contact.handleOrPhone}
                          </span>
                          <span
                            className={`font-bold shrink-0 ${
                              isIg ? 'text-[#C13584]' : selectedAppId === 'telegram' ? 'text-[#2AABEE] dark:text-sky-400' : 'text-[#1B6648] dark:text-emerald-400'
                            }`}
                          >
                            {contact.spend || (isIg ? 'Instagram' : (contact.statusText === 'Channel' || contact.isBroadcast) ? '' : '')}
                          </span>
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
                      const stringToTopicColor = (str: string) => {
                        let hash = 0;
                        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
                        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
                        return '#' + '00000'.substring(0, 6 - c.length) + c;
                      };
                      const topicBg = topic.iconColor || stringToTopicColor(topic.name || topic.id);
                      const topicEmoji = topic.iconEmoji || (
                        topic.name.toLowerCase().includes('general') ? '💬' :
                        topic.name.toLowerCase().includes('cours') ? '📚' :
                        topic.name.toLowerCase().includes('td') || topic.name.toLowerCase().includes('tp') ? '🔬' :
                        topic.name.toLowerCase().includes('exam') ? '📝' :
                        topic.name.toLowerCase().includes('announc') ? '📢' :
                        topic.name.toLowerCase().includes('help') || topic.name.toLowerCase().includes('support') ? '🛟' :
                        topic.name.toLowerCase().includes('dev') || topic.name.toLowerCase().includes('code') ? '💻' :
                        null
                      );
                      const initial = topic.avatarText || (topic.name ? topic.name.trim()[0].toUpperCase() : '#');
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
                        className={`w-full p-2.5 sm:p-3 text-left transition-all flex items-center justify-between gap-2.5 relative cursor-pointer hover:bg-[#ECECE2]/60 dark:hover:bg-neutral-800/60 ${isTopicActive ? 'bg-white dark:bg-neutral-800 shadow-sm border-l-3 border-[#2AABEE]' : ''}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs text-white font-bold text-xs select-none"
                            style={{ backgroundColor: topicBg }}
                          >
                            {topicEmoji ? (
                              <span className="text-xs">{topicEmoji}</span>
                            ) : (
                              <span>{initial}</span>
                            )}
                          </div>
                          <span className="font-bold text-xs truncate text-gray-800 dark:text-gray-200">
                            #{topic.name.replace(/^#/, '')}
                          </span>
                          {topic.pinned && <span className="text-[10px]" title="Pinned Topic">📌</span>}
                          {topic.closed && <span className="text-[10px]" title="Closed Topic">🔒</span>}
                        </div>
                        {topic.unreadCount && topic.unreadCount > 0 ? (
                          <span className="shrink-0 flex items-center gap-1.5 bg-[#2AABEE] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span>{topic.unreadCount}</span>
                          </span>
                        ) : null}
                      </button>
                    ); })}
                  </div>
                </div>
              )}
            </div>
            )}


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
          {/* Gateway Credentials Box */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1B6648] dark:text-emerald-400" />
                <span>{selectedAppId.toUpperCase()} Gateway</span>
              </h5>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live API
              </span>
            </div>

            {selectedAppId === 'whatsapp' && (
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[11px] text-gray-500 font-medium">Evolution Baileys Instance</label>
                  <input type="text" readOnly value="alger_instance_01" className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg p-2 font-mono text-xs mt-0.5" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 font-medium">n8n Webhook Router</label>
                  <div className="flex items-center gap-1 mt-0.5 settings-row">
                    <input type="text" readOnly value="http://localhost:5678/webhook/farm-router" className="flex-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg p-2 font-mono text-xs" />
                    <button 
                      onClick={() => copyToClipboard('http://localhost:5678/webhook/farm-router', 'webhook')}
                      className="p-2 bg-gray-200/80 dark:bg-neutral-800 hover:bg-gray-300 rounded-lg text-gray-600 dark:text-gray-300 cursor-pointer"
                      title="Copy webhook"
                    >
                      {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedAppId === 'instagram' && (
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-[11px] text-gray-600 dark:text-gray-400 font-bold">Your Instagram @Username</label>
                  <input
                    type="text"
                    value={metaHandle}
                    onChange={(e) => setMetaHandle(e.target.value)}
                    placeholder="@your_instagram_handle"
                    className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl p-2.5 font-medium text-xs mt-0.5 focus:outline-none focus:border-[#C13584]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-600 dark:text-gray-400 font-bold">Meta Page / User Access Token</label>
                  <div className="flex items-center gap-1.5 mt-0.5 settings-row">
                    <input
                      type="password"
                      value={metaToken}
                      onChange={(e) => setMetaToken(e.target.value)}
                      placeholder="EAA... (Paste your Meta Access Token)"
                      className="flex-1 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl p-2.5 font-mono text-xs focus:outline-none focus:border-[#C13584]"
                    />
                    <button 
                      onClick={() => copyToClipboard(metaToken, 'key')}
                      className="p-2.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-xl text-gray-600 dark:text-gray-300 cursor-pointer shrink-0"
                      title="Copy token"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Webhook Configuration for Live Customer Messages */}
                <div className="p-2.5 rounded-xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                      Live Webhook URL (Meta Developer Portal)
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-medium">Callback URL</label>
                    <div className="flex items-center gap-1 mt-0.5 settings-row">
                      <input
                        type="text"
                        readOnly
                        value={typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/instagram` : 'https://.../api/webhooks/instagram'}
                        className="flex-1 bg-white dark:bg-neutral-900 border border-purple-200 dark:border-purple-800/40 rounded-lg p-1.5 font-mono text-[10px]"
                      />
                      <button
                        onClick={() => copyToClipboard(typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/instagram` : '', 'webhook')}
                        className="p-1.5 bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 rounded-lg text-purple-700 dark:text-purple-300 cursor-pointer shrink-0"
                        title="Copy Webhook URL"
                      >
                        {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-medium">Verify Token</label>
                    <div className="flex items-center gap-1 mt-0.5 settings-row">
                      <input
                        type="text"
                        readOnly
                        value="algeria_chatbot_farm_2026"
                        className="flex-1 bg-white dark:bg-neutral-900 border border-purple-200 dark:border-purple-800/40 rounded-lg p-1.5 font-mono text-[10px]"
                      />
                      <button
                        onClick={() => copyToClipboard('algeria_chatbot_farm_2026', 'key')}
                        className="p-1.5 bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 rounded-lg text-purple-700 dark:text-purple-300 cursor-pointer shrink-0"
                        title="Copy Verify Token"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-1 flex items-center gap-2 settings-buttons">
                  <button
                    type="button"
                    onClick={() => handleSaveChannelSettings('instagram')}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:opacity-95 cursor-pointer active:scale-98 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save & Connect Instagram</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleTestPing}
                    className="py-2 px-3 rounded-xl border border-gray-300 dark:border-neutral-700 font-bold text-xs hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer transition-all"
                  >
                    Test Ping
                  </button>
                </div>
                {saveStatus && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold text-center mt-1 animate-pulse">
                    ✓ {saveStatus}
                  </p>
                )}
              </div>
            )}

            {selectedAppId === 'telegram' && (
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-[11px] text-gray-600 dark:text-gray-400 font-bold">Active Bot Handle</label>
                  <input
                    type="text"
                    value={tgHandle}
                    onChange={(e) => setTgHandle(e.target.value)}
                    placeholder="@YourBotHandle"
                    className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl p-2.5 font-medium text-xs mt-0.5 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-600 dark:text-gray-400 font-bold">Telegram Bot Token (@BotFather)</label>
                  <input
                    type="password"
                    value={tgToken}
                    onChange={(e) => setTgToken(e.target.value)}
                    placeholder="123456789:AAHk..."
                    className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl p-2.5 font-mono text-xs mt-0.5 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="pt-1 flex items-center gap-2 settings-buttons">
                  <button
                    type="button"
                    onClick={() => handleSaveChannelSettings('telegram')}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-blue-700 cursor-pointer active:scale-98 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save & Connect Telegram</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleTestPing}
                    className="py-2 px-3 rounded-xl border border-gray-300 dark:border-neutral-700 font-bold text-xs hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer transition-all"
                  >
                    Test Ping
                  </button>
                </div>
                {saveStatus && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold text-center mt-1 animate-pulse">
                    ✓ {saveStatus}
                  </p>
                )}
              </div>
            )}

            {selectedAppId === 'messenger' && (
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-[11px] text-gray-600 dark:text-gray-400 font-bold">Facebook Page ID</label>
                  <input
                    type="text"
                    value={messengerPageId}
                    onChange={(e) => setMessengerPageId(e.target.value)}
                    placeholder="Your Page ID (e.g. 1092837461928)"
                    className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl p-2.5 font-mono text-xs mt-0.5 focus:outline-none focus:border-[#1877F2]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-600 dark:text-gray-400 font-bold">Page Access Token</label>
                  <input
                    type="password"
                    value={messengerToken}
                    onChange={(e) => setMessengerToken(e.target.value)}
                    placeholder="EAA..."
                    className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl p-2.5 font-mono text-xs mt-0.5 focus:outline-none focus:border-[#1877F2]"
                  />
                </div>
                <div className="pt-1 flex items-center gap-2 settings-buttons">
                  <button
                    type="button"
                    onClick={() => handleSaveChannelSettings('messenger')}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#1877F2] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-blue-600 cursor-pointer active:scale-98 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save & Connect Messenger</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleTestPing}
                    className="py-2 px-3 rounded-xl border border-gray-300 dark:border-neutral-700 font-bold text-xs hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer transition-all"
                  >
                    Test Ping
                  </button>
                </div>
                {saveStatus && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold text-center mt-1 animate-pulse">
                    ✓ {saveStatus}
                  </p>
                )}
              </div>
            )}

            {selectedAppId === 'web_widget' && (
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[11px] text-gray-500 font-medium">Storefront HTML Embed Script</label>
                  <div className="relative mt-0.5">
                    <textarea
                      readOnly
                      rows={3}
                      value={'<script src="https://cdn.chatbotfarm.dz/widget.js" data-store="storefront-active"></script>'}
                      className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg p-2 font-mono text-[10px] resize-none"
                    />
                    <button
                      onClick={() => copyToClipboard('<script src="https://cdn.chatbotfarm.dz/widget.js" data-store="storefront-active"></script>', 'webhook')}
                      className="absolute top-2 right-2 px-2 py-1 rounded bg-[#1B6648] text-white text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedAppId === 'gmail' && (
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-[11px] text-gray-600 dark:text-gray-400 font-bold">Connected Support Email</label>
                  <input
                    type="email"
                    value={gmailAddr}
                    onChange={(e) => setGmailAddr(e.target.value)}
                    placeholder="support@yourstore.com"
                    className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl p-2.5 font-medium text-xs mt-0.5 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="pt-1 flex items-center gap-2 settings-buttons">
                  <button
                    type="button"
                    onClick={() => handleSaveChannelSettings('gmail')}
                    className="flex-1 py-2 px-3 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-red-700 cursor-pointer active:scale-98 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save & Connect Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleTestPing}
                    className="py-2 px-3 rounded-xl border border-gray-300 dark:border-neutral-700 font-bold text-xs hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer transition-all"
                  >
                    Test Ping
                  </button>
                </div>
                {saveStatus && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold text-center mt-1 animate-pulse">
                    ✓ {saveStatus}
                  </p>
                )}
              </div>
            )}

            {!['whatsapp', 'instagram', 'telegram', 'messenger', 'web_widget', 'gmail'].includes(selectedAppId) && (
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-[11px] text-gray-600 dark:text-gray-400 font-bold">
                    {(APP_GRADIENT_THEMES[selectedAppId] || APP_GRADIENT_THEMES.whatsapp).name} Connection Status
                  </label>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700 mt-1">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Gateway Protocol:</span>
                    <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {isConnected ? 'Active & Synchronized' : 'Ready to Connect'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-gray-600 dark:text-gray-400 font-bold">Live Inbound Endpoint / Webhook</label>
                  <div className="flex items-center gap-1 mt-0.5 settings-row">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== 'undefined' ? `${window.location.origin}/api/channels/${selectedAppId}/send` : `http://localhost:3000/api/channels/${selectedAppId}/send`}
                      className="flex-1 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-2 font-mono text-[10px]"
                    />
                    <button
                      onClick={() => copyToClipboard(typeof window !== 'undefined' ? `${window.location.origin}/api/channels/${selectedAppId}/send` : '', 'webhook')}
                      className="p-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 rounded-lg text-gray-600 dark:text-gray-300 cursor-pointer shrink-0"
                    >
                      {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Test Connection Button */}
            <div className="pt-2">
              <button
                onClick={handleTestPing}
                disabled={pingStatus === 'testing'}
                className="w-full py-2 px-3 rounded-xl bg-white dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700 text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer"
              >
                {pingStatus === 'testing' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-[#1B6648] animate-spin" />
                    <span>Testing Gateway Route...</span>
                  </>
                ) : pingStatus === 'success' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">200 OK — {pingLatency}ms Response</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-3.5 h-3.5 text-[#1B6648] dark:text-emerald-400" />
                    <span>Ping & Verify Gateway Health</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Assigned Multi-Bot AI Agent */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-indigo-500" />
                <span>Assigned AI Bot</span>
              </h5>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                  <p className="font-bold text-xs text-[#1B1B1B] dark:text-white truncate">
                    {assignedBot?.name || 'No bot assigned'}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {assignedBot ? `Handles ${selectedAppId.toUpperCase()} messages` : 'Assign a bot in Settings'}
                  </p>
                </div>
              </div>

              {availableBots.length > 0 && (
                <select
                  value={assignedBot?.id || ''}
                  onChange={(e) => handleAssignBotToChannel(e.target.value)}
                  className="text-[11px] font-bold bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg px-2 py-1 outline-none text-[#1B1B1B] dark:text-white cursor-pointer shrink-0"
                >
                  <option value="" disabled>Switch Bot...</option>
                  {availableBots.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.avatar} {b.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Channel Automation Rules */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#111317] border border-[#DFDFD4] dark:border-neutral-800 space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#EB6708]" />
              <span>Channel Automation Rules</span>
            </h5>

            <div className="space-y-2.5 divide-y divide-gray-200/60 dark:divide-neutral-800">
              {/* Toggle 1: Darija Dialect */}
              <div className="flex items-center justify-between pt-1 gap-2 settings-toggle-row">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate">Algerian Darija Mode</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 settings-desc truncate">Marhba bik, chhal, kayen, bsahtek</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSetting('darijaMode')}
                  className={`relative inline-flex h-4 w-8 shrink-0 items-center rounded-full transition-all duration-200 cursor-pointer hover:scale-110 ${
                    settingsToggles.darijaMode ? 'bg-[#1B6648]' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      settingsToggles.darijaMode ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Yalidine Auto-Sync */}
              <div className="flex items-center justify-between pt-2 gap-2 settings-toggle-row">
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

              <form onSubmit={handleAddClient} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                    <span>
                      {['whatsapp', 'whatsapp_2', 'signal', 'google_messages', 'google_voice'].includes(selectedAppId)
                        ? 'Mobile Phone Number *'
                        : selectedAppId === 'discord'
                        ? 'Discord Channel or User *'
                        : selectedAppId === 'slack'
                        ? 'Slack Channel or Member *'
                        : selectedAppId === 'irc'
                        ? 'IRC Channel or Nick *'
                        : selectedAppId === 'matrix'
                        ? 'Matrix User ID *'
                        : selectedAppId === 'gmail'
                        ? 'Email Address *'
                        : `${currentAppTheme.name} Handle or ID *`}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Required</span>
                  </label>
                  <div className="relative">
                    <input
                      id="modal-client-handle-input"
                      type="text"
                      required
                      value={newClientHandle}
                      onChange={(e) => setNewClientHandle(e.target.value)}
                      placeholder={
                        ['whatsapp', 'whatsapp_2', 'signal', 'google_messages', 'google_voice'].includes(selectedAppId)
                          ? "+213 550 12 34 56"
                          : selectedAppId === 'discord'
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
