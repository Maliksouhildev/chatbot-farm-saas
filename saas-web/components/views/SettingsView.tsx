"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Settings as SettingsIcon,
  Smartphone,
  Shield,
  Key,
  CreditCard,
  Palette,
  Bot,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Download,
  Trash2,
  Lock,
  Sliders,
  CheckCircle2,
  Zap,
  Globe,
  Bell,
  HardDrive,
  FileText,
  User,
  ChevronRight,
  Sun,
  Moon,
  Upload,
  Camera,
  Link2,
  ShieldCheck,
  Mail,
  Save
} from 'lucide-react';

import { ByokManager } from '@/components/settings/ByokManager';
import { PromptCustomizer } from '@/components/dashboard/PromptCustomizer';
import { KnowledgeBaseManager } from '@/components/dashboard/KnowledgeBaseManager';
import { BotFarmManager } from '@/components/dashboard/BotFarmManager';

type SettingsTab = 'profile' | 'apps' | 'privacy' | 'apis' | 'payments' | 'customization';

interface SettingsViewProps {
  initialTab?: SettingsTab;
  currentUser?: any;
  onUpdateUser?: (updated: { name: string; avatar: string }) => void;
  onOpenAvatarModal?: () => void;
}

const PRESET_AVATARS = [
  '👨‍💻', '👩‍💻', '🥷', '🦊', '🦁', '🤖', '🧑‍🚀', '👑',
  '⚡', '🌟', '🧙', '🦅', '💎', '🚀', '🎯', '🔥'
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  initialTab = 'profile',
  currentUser,
  onUpdateUser,
  onOpenAvatarModal,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Profile local state (strictly real user data)
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profileAvatar, setProfileAvatar] = useState(currentUser?.avatar || '👨‍💻');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSavedNotification, setIsSavedNotification] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Privacy toggles
  const [dataRetention, setDataRetention] = useState('90');
  const [anonymizeDarija, setAnonymizeDarija] = useState(true);

  // App connection toggles & real channel metadata
  const [connectedApps, setConnectedApps] = useState<{ [id: string]: boolean }>({
    discord: false,
    whatsapp: false,
    telegram: false,
    gmail: false,
    messenger: false,
    instagram: false,
  });

  const [channelInfo, setChannelInfo] = useState<{
    whatsapp?: string;
    discord?: string;
    telegram?: string;
    gmail?: string;
  }>({});

  // Load real preferences & real channel connection state from storage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('cf_user_session');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.name) setProfileName(u.name);
        if (u.email) setProfileEmail(u.email);
        if (u.avatar) setProfileAvatar(u.avatar);
      } else if (currentUser) {
        if (currentUser.name) setProfileName(currentUser.name);
        if (currentUser.email) setProfileEmail(currentUser.email);
        if (currentUser.avatar) setProfileAvatar(currentUser.avatar);
      }

      const savedRetention = localStorage.getItem('cf_data_retention');
      if (savedRetention) setDataRetention(savedRetention);
      const savedAnon = localStorage.getItem('cf_anonymize_darija');
      if (savedAnon !== null) setAnonymizeDarija(savedAnon === 'true');

      // 1. Load real connected apps
      const savedApps = localStorage.getItem('cf_connected_apps') || (currentUser?.id ? localStorage.getItem(`cf_connected_apps_${currentUser.id}`) : null);
      const activeList: string[] = savedApps ? JSON.parse(savedApps) : [];
      const appMap: { [id: string]: boolean } = {
        discord: activeList.includes('discord'),
        whatsapp: activeList.includes('whatsapp'),
        telegram: activeList.includes('telegram'),
        gmail: activeList.includes('gmail'),
        messenger: activeList.includes('messenger'),
        instagram: activeList.includes('instagram'),
      };
      setConnectedApps(appMap);

      // 2. Load real channel metadata
      const info: typeof channelInfo = {};

      const waRaw = localStorage.getItem('cf_whatsapp_account');
      if (waRaw) {
        try {
          const parsed = JSON.parse(waRaw);
          info.whatsapp = parsed.phone || parsed.name || 'Connected';
        } catch {
          info.whatsapp = waRaw;
        }
      }

      const dcRaw = localStorage.getItem('cf_discord_account');
      if (dcRaw) {
        try {
          const parsed = JSON.parse(dcRaw);
          info.discord = parsed.username || parsed.guildName || 'Connected';
        } catch {
          info.discord = dcRaw;
        }
      }

      const tgRaw = localStorage.getItem('cf_telegram_account');
      if (tgRaw) {
        try {
          const parsed = JSON.parse(tgRaw);
          info.telegram = parsed.username ? `@${parsed.username}` : (parsed.title || 'Connected');
        } catch {
          info.telegram = tgRaw;
        }
      }

      const gmRaw = localStorage.getItem('cf_gmail_account');
      if (gmRaw) {
        try {
          const parsed = JSON.parse(gmRaw);
          info.gmail = parsed.email || 'Connected';
        } catch {
          info.gmail = gmRaw;
        }
      }

      setChannelInfo(info);

    } catch {}
  }, [currentUser]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleApp = (appId: string) => {
    const updated = { ...connectedApps, [appId]: !connectedApps[appId] };
    setConnectedApps(updated);
    try {
      const activeList = Object.keys(updated).filter(k => updated[k]);
      localStorage.setItem('cf_connected_apps', JSON.stringify(activeList));
      if (currentUser?.id) {
        localStorage.setItem(`cf_connected_apps_${currentUser.id}`, JSON.stringify(activeList));
      }
    } catch {}
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated = {
      name: profileName.trim() || currentUser?.name || 'User',
      avatar: profileAvatar,
    };
    if (onUpdateUser) {
      onUpdateUser(updated);
    } else {
      try {
        const current = JSON.parse(localStorage.getItem('cf_user_session') || '{}');
        const next = { ...current, ...updated, email: profileEmail };
        localStorage.setItem('cf_user_session', JSON.stringify(next));
      } catch {}
    }
    setIsSavedNotification(true);
    setTimeout(() => setIsSavedNotification(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB. Please select a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfileAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (customAvatarUrl.trim()) {
      setProfileAvatar(customAvatarUrl.trim());
      setShowUrlInput(false);
      setCustomAvatarUrl('');
    }
  };

  const isAvatarImage = profileAvatar.startsWith('http') || profileAvatar.startsWith('data:image');

  // Real plan display logic
  const currentPlan = currentUser?.plan || 'Free Tier';
  const isPro = Boolean(currentUser?.plan && currentUser.plan.toLowerCase().includes('pro'));

  // If user is Pro and was on APIs tab, fallback to customization
  useEffect(() => {
    if (isPro && activeTab === 'apis') {
      setActiveTab('customization');
    }
  }, [isPro, activeTab]);

  const getPlanPriceDisplay = () => {
    const p = currentPlan.toLowerCase();
    if (p.includes('pro')) return '7,500 DZD / mois';
    if (p.includes('starter')) return '3,500 DZD / mois';
    if (p.includes('byok')) return '2,000 DZD / mois';
    return '0 DZD (Free Manual Messaging)';
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode; desc: string }[] = useMemo(() => {
    const list: { id: SettingsTab; label: string; icon: React.ReactNode; desc: string }[] = [
      { id: 'profile', label: 'Profile & Account', icon: <User className="w-4 h-4" />, desc: 'Personalize avatar, display name, email, credentials' },
      { id: 'apps', label: 'Apps & Channels', icon: <Smartphone className="w-4 h-4" />, desc: 'Real status for WhatsApp, Telegram, Discord, Gmail' },
      { id: 'customization', label: 'Bot Farm & AI', icon: <Bot className="w-4 h-4" />, desc: 'Create multiple bots, assign apps, custom Darija settings' },
      { id: 'privacy', label: 'Privacy & Security', icon: <Shield className="w-4 h-4" />, desc: 'Data retention, PII masking, local cache' },
      { id: 'payments', label: 'Billing & Payments', icon: <CreditCard className="w-4 h-4" />, desc: 'Chargily CIB/EDAHABIA, active plan, receipts' },
    ];

    // User requirement: API plug hidden when subscribed to Pro, by default at the bottom of the page
    if (!isPro) {
      list.push({
        id: 'apis',
        label: 'APIs & Webhooks',
        icon: <Key className="w-4 h-4" />,
        desc: 'BYOK keys, n8n webhooks, Cloud APIs',
      });
    }

    return list;
  }, [isPro]);

  // Search filtering logic
  const filteredTabs = useMemo(() => {
    if (!searchQuery.trim()) return tabs;
    const q = searchQuery.toLowerCase();
    return tabs.filter(t => 
      t.label.toLowerCase().includes(q) || 
      t.desc.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 md:px-8 space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Header with Live Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DFDFD4] dark:border-[#2E333D] pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#1B1B1B] dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#EB6708]" />
            Workspace & Application Settings
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
            Manage profile identity, channels, privacy rules, API credentials, billing, and Darija AI preferences
          </p>
        </div>

        {/* Real-time functional search bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settings, profile, APIs..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-[#1A1D23] border border-[#DFDFD4] dark:border-[#2E333D] rounded-xl focus:ring-2 focus:ring-[#1B6648] outline-hidden text-[#1B1B1B] dark:text-white shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. Horizontal Tab Navigation with Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#1B6648] text-white shadow-xs scale-102'
                  : 'bg-white dark:bg-[#1A1D23] text-gray-700 dark:text-gray-300 border border-[#DFDFD4] dark:border-[#2E333D] hover:bg-gray-50 dark:hover:bg-neutral-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      <div className="space-y-6">

        {/* TAB 0: PROFILE & ACCOUNT CUSTOMIZATION */}
        {(activeTab === 'profile' || searchQuery) && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#1B1B1B] dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-[#1B6648] dark:text-emerald-400" />
                  Profile Identity & Account Customization
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Manage your display name, profile avatar photo, and account security
                </p>
              </div>

              {isSavedNotification && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-[#1B6648] dark:text-emerald-400 text-xs font-bold rounded-xl animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Profile Saved Successfully!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="p-6 rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-xs space-y-6">
                
                {/* Avatar Row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-[#DFDFD4] dark:border-[#2E333D]">
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#1B6648] to-emerald-500 text-white flex items-center justify-center font-black text-3xl shadow-md overflow-hidden">
                      {isAvatarImage ? (
                        <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span>{profileAvatar || '👨‍💻'}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#1B6648] hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                      title="Upload Photo"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#1B1B1B] dark:text-white">Profile Photo & Avatar</h4>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl transition-colors flex items-center gap-1.5"
                        >
                          <Upload className="w-3 h-3" />
                          Upload Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(!showUrlInput)}
                          className="px-3 py-1 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 text-xs font-bold text-[#1B6648] dark:text-emerald-400 rounded-xl transition-colors flex items-center gap-1.5"
                        >
                          <Link2 className="w-3 h-3" />
                          Image URL
                        </button>
                      </div>
                    </div>

                    {showUrlInput && (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="url"
                          placeholder="https://example.com/avatar.png"
                          value={customAvatarUrl}
                          onChange={(e) => setCustomAvatarUrl(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs bg-gray-50 dark:bg-neutral-800 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl focus:outline-hidden dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleApplyUrl}
                          className="px-3 py-1.5 bg-[#1B6648] text-white text-xs font-bold rounded-xl"
                        >
                          Apply
                        </button>
                      </div>
                    )}

                    <div className="pt-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Preset Avatars</p>
                      <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
                        {PRESET_AVATARS.map((av) => (
                          <button
                            key={av}
                            type="button"
                            onClick={() => setProfileAvatar(av)}
                            className={`h-8 rounded-xl flex items-center justify-center text-base transition-transform active:scale-90 border ${
                              profileAvatar === av
                                ? 'border-[#1B6648] bg-emerald-50 dark:bg-emerald-950/40 scale-105 shadow-xs'
                                : 'border-[#DFDFD4] dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800'
                            }`}
                          >
                            {av}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name & Email Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Display Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Your full name..."
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-semibold bg-gray-50 dark:bg-neutral-800/80 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-[#1B6648] outline-hidden text-[#1B1B1B] dark:text-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="your-email@domain.com"
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-semibold bg-gray-50 dark:bg-neutral-800/80 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-[#1B6648] outline-hidden text-[#1B1B1B] dark:text-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Details & Security Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Role & Authority</span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{currentUser?.role || 'Workspace Owner'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Session Duration</span>
                    <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Persistent (30 Days)
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Current Plan</span>
                    <div className="text-xs font-bold text-[#EB6708]">
                      {currentPlan}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#1B6648] hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB 1: ALL APPS & CHANNELS */}
        {(activeTab === 'apps' || searchQuery) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#1B1B1B] dark:text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Omnichannel Messaging Integrations
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Real connection status for your active social and messaging platforms
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* WhatsApp Card */}
              <div className="p-4 rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                      WA
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1B1B1B] dark:text-white">WhatsApp Business</h4>
                      <span className="text-[10px] text-gray-400">Evolution API / Cloud</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleApp('whatsapp')}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      connectedApps.whatsapp ? 'bg-[#1B6648]' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        connectedApps.whatsapp ? 'translate-x-4.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-black/30 p-2 rounded-xl flex items-center justify-between">
                  <span className="truncate">
                    {connectedApps.whatsapp ? (channelInfo.whatsapp || 'Connected') : 'Not Connected'}
                  </span>
                  <span className={`text-[10px] font-bold shrink-0 ${connectedApps.whatsapp ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {connectedApps.whatsapp ? 'Active' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Discord Card */}
              <div className="p-4 rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                      DC
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1B1B1B] dark:text-white">Discord Guild & DMs</h4>
                      <span className="text-[10px] text-gray-400">Multi-Channel Bot</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleApp('discord')}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      connectedApps.discord ? 'bg-[#1B6648]' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        connectedApps.discord ? 'translate-x-4.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-black/30 p-2 rounded-xl flex items-center justify-between">
                  <span className="truncate">
                    {connectedApps.discord ? (channelInfo.discord || 'Connected') : 'Not Connected'}
                  </span>
                  <span className={`text-[10px] font-bold shrink-0 ${connectedApps.discord ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {connectedApps.discord ? 'Active' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Telegram Card */}
              <div className="p-4 rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-sm">
                      TG
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1B1B1B] dark:text-white">Telegram Bot API</h4>
                      <span className="text-[10px] text-gray-400">Bot Token Integration</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleApp('telegram')}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      connectedApps.telegram ? 'bg-[#1B6648]' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        connectedApps.telegram ? 'translate-x-4.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-black/30 p-2 rounded-xl flex items-center justify-between">
                  <span className="truncate">
                    {connectedApps.telegram ? (channelInfo.telegram || 'Connected') : 'Not Connected'}
                  </span>
                  <span className={`text-[10px] font-bold shrink-0 ${connectedApps.telegram ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {connectedApps.telegram ? 'Active' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Gmail Card */}
              <div className="p-4 rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-sm">
                      GM
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1B1B1B] dark:text-white">Gmail Integration</h4>
                      <span className="text-[10px] text-gray-400">OAuth 2.0 Token</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleApp('gmail')}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      connectedApps.gmail ? 'bg-[#1B6648]' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        connectedApps.gmail ? 'translate-x-4.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-black/30 p-2 rounded-xl flex items-center justify-between">
                  <span className="truncate">
                    {connectedApps.gmail ? (channelInfo.gmail || 'Connected') : 'Not Connected'}
                  </span>
                  <span className={`text-[10px] font-bold shrink-0 ${connectedApps.gmail ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {connectedApps.gmail ? 'Active' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Facebook Messenger Card */}
              <div className="p-4 rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm">
                      FB
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1B1B1B] dark:text-white">Facebook Page Messenger</h4>
                      <span className="text-[10px] text-gray-400">Meta Graph API</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleApp('messenger')}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      connectedApps.messenger ? 'bg-[#1B6648]' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        connectedApps.messenger ? 'translate-x-4.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-black/30 p-2 rounded-xl flex items-center justify-between">
                  <span className="truncate">
                    {connectedApps.messenger ? 'Page Linked' : 'Not Connected'}
                  </span>
                  <span className={`text-[10px] font-bold shrink-0 ${connectedApps.messenger ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {connectedApps.messenger ? 'Active' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Instagram Card */}
              <div className="p-4 rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center font-bold text-sm">
                      IG
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1B1B1B] dark:text-white">Instagram Direct</h4>
                      <span className="text-[10px] text-gray-400">Meta Instagram Graph</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleApp('instagram')}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      connectedApps.instagram ? 'bg-[#1B6648]' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        connectedApps.instagram ? 'translate-x-4.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-black/30 p-2 rounded-xl flex items-center justify-between">
                  <span className="truncate">
                    {connectedApps.instagram ? 'Account Linked' : 'Not Connected'}
                  </span>
                  <span className={`text-[10px] font-bold shrink-0 ${connectedApps.instagram ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {connectedApps.instagram ? 'Active' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRIVACY & DATA SECURITY */}
        {(activeTab === 'privacy' || searchQuery) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#1B1B1B] dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Privacy & Data Security Rules
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Manage Algerian customer data retention, PII anonymization, and cryptographic standards
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-xs space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1B1B1B] dark:text-white">Conversation Retention Policy</h4>
                    <p className="text-[11px] text-gray-400">Automatic pruning of older customer chat records</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {['30', '90', '365', 'forever'].map((days) => (
                    <button
                      key={days}
                      onClick={() => {
                        setDataRetention(days);
                        localStorage.setItem('cf_data_retention', days);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        dataRetention === days
                          ? 'bg-[#1B6648] text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {days === 'forever' ? 'Keep Forever' : `${days} Days`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-[#EB6708] flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1B1B1B] dark:text-white">Darija Customer PII Masking</h4>
                      <p className="text-[11px] text-gray-400">Filter phone numbers (05/06/07), CCP, and addresses from AI logs</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const val = !anonymizeDarija;
                      setAnonymizeDarija(val);
                      localStorage.setItem('cf_anonymize_darija', String(val));
                    }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      anonymizeDarija ? 'bg-[#1B6648]' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        anonymizeDarija ? 'translate-x-4.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Ensures full compliance with Algerian consumer data regulations (Law 18-07).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] bg-gray-50 dark:bg-black/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                <FileText className="w-4 h-4 text-gray-400" />
                <span>Export or Clear Local Application Storage</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const data = {
                      projects: localStorage.getItem('cf_projects'),
                      user: localStorage.getItem('cf_user_session'),
                      exportedAt: new Date().toISOString(),
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `chatbot-farm-backup-${Date.now()}.json`;
                    a.click();
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Data JSON
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to purge local cache? (Your login session will remain active)')) {
                      localStorage.removeItem('cf_chats_cache');
                      alert('Local cache successfully cleared.');
                    }
                  }}
                  className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Purge Cache
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BOT FARM & CUSTOMIZATION */}
        {(activeTab === 'customization' || searchQuery) && (
          <BotFarmManager isProUser={isPro} />
        )}

        {/* TAB 4: BILLING & PAYMENT METHODS */}
        {(activeTab === 'payments' || searchQuery) && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black text-[#1B1B1B] dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#1B6648] dark:text-emerald-400" />
                Active Subscription & Payment Channels
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                View your active plan entitlement and supported payment methods
              </p>
            </div>

            {/* Current Real Plan Overview */}
            <div className="p-6 rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] bg-gradient-to-r from-emerald-950/10 via-white to-orange-500/10 dark:from-emerald-950/30 dark:via-[#1A1D23] dark:to-orange-950/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1B6648] text-white font-black text-[10px] tracking-wider uppercase">
                    Active Plan
                  </span>
                  <h4 className="text-base font-black text-[#1B1B1B] dark:text-white">
                    {currentPlan}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Full dashboard management and Algerian Darija customer messaging.
                </p>
              </div>

              <div className="text-right">
                <div className="text-base font-black text-[#1B6648] dark:text-emerald-400">{getPlanPriceDisplay()}</div>
                <div className="text-[10px] text-gray-400">Workspace Active Session</div>
              </div>
            </div>

            {/* Real Payment Methods Status (Zero fake card numbers) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1B1B1B] dark:text-white">Chargily Pay</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">Available</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Instant DZD card payments via EDAHABIA and CIB.
                </p>
                <div className="pt-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Ready at checkout
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1B1B1B] dark:text-white">BaridiMob / CCP</span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">Available</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Manual postal transfer with receipt approval.
                </p>
                <div className="pt-2 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  Ready at checkout
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1B1B1B] dark:text-white">Stripe Gateway</span>
                  <span className="text-[10px] text-gray-400">International</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Supports foreign Visa and Mastercard cards.
                </p>
                <div className="pt-2 text-[11px] font-medium text-gray-500">
                  Configured on demand
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: APIS & WEBHOOKS (USER REQUIREMENT: Hidden on Pro, placed at bottom by default) */}
        {!isPro && (activeTab === 'apis' || searchQuery) && (
          <div className="space-y-6 pt-2">
            <div>
              <h3 className="text-sm font-black text-[#1B1B1B] dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-[#EB6708]" />
                API Credentials & Webhook Endpoints (Free Tier BYOK)
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Configure your Bring-Your-Own-Key (BYOK) AI providers and external automation webhooks
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-xs">
              <ByokManager isPro={isPro} />
            </div>

            {/* Automation Webhooks */}
            <div className="p-5 rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-[#EB6708] flex items-center justify-center font-black text-xs">
                    n8n
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1B1B1B] dark:text-white">Workflow Automation Webhooks</h4>
                    <p className="text-[11px] text-gray-400">Route incoming messages and captured orders into automated pipelines</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Port 5678 Ready
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-neutral-800 space-y-1">
                  <span className="font-bold text-gray-600 dark:text-gray-400 block text-[10px] uppercase">New Order Webhook</span>
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#1B1B1B] dark:text-gray-200">
                    <span className="truncate">/api/webhooks/orders</span>
                    <button
                      onClick={() => handleCopy('/api/webhooks/orders', 'n8n_order')}
                      className="text-[#1B6648] dark:text-emerald-400 font-bold ml-2 shrink-0"
                    >
                      {copiedKey === 'n8n_order' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-neutral-800 space-y-1">
                  <span className="font-bold text-gray-600 dark:text-gray-400 block text-[10px] uppercase">Lead Extraction Webhook</span>
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#1B1B1B] dark:text-gray-200">
                    <span className="truncate">/api/webhooks/leads</span>
                    <button
                      onClick={() => handleCopy('/api/webhooks/leads', 'n8n_lead')}
                      className="text-[#1B6648] dark:text-emerald-400 font-bold ml-2 shrink-0"
                    >
                      {copiedKey === 'n8n_lead' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
