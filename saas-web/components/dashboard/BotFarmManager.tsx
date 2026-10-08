"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bot,
  Plus,
  Trash2,
  Check,
  Settings,
  Sparkles,
  Share2,
  BookOpen,
  Layers,
  Key,
  ShieldCheck,
  Edit2,
  CheckCircle2,
  Info
} from 'lucide-react';
import {
  WhatsAppIcon,
  InstagramIcon,
  TelegramIcon,
  DiscordIcon,
  MessengerIcon,
  GmailIcon
} from '@/components/icons/BrandIcons';
import { PromptCustomizer } from './PromptCustomizer';
import { KnowledgeBaseManager } from './KnowledgeBaseManager';
import { ByokManager } from '../settings/ByokManager';

export interface BotInstance {
  id: string;
  name: string;
  avatar: string;
  description?: string;
  assignedApps: string[];
  createdAt: string;
}

export const SUPPORTED_CHANNELS = [
  { id: 'whatsapp', name: 'WhatsApp Business', desc: 'Evolution API / Cloud', color: '#25D366', Icon: WhatsAppIcon },
  { id: 'instagram', name: 'Instagram Direct', desc: 'Meta Graph API', color: '#E1306C', Icon: InstagramIcon },
  { id: 'telegram', name: 'Telegram Bot', desc: '@BotFather Token', color: '#0088cc', Icon: TelegramIcon },
  { id: 'discord', name: 'Discord Guild & DMs', desc: 'Multi-Channel Bot', color: '#5865F2', Icon: DiscordIcon },
  { id: 'messenger', name: 'Facebook Messenger', desc: 'Meta Page Webhooks', color: '#0084FF', Icon: MessengerIcon },
  { id: 'gmail', name: 'Gmail Integration', desc: 'OAuth 2.0 Inbound', color: '#EA4335', Icon: GmailIcon },
];

const AVATAR_OPTIONS = ['🤖', '🛍️', '💬', '⚡', '👑', '🎯', '🚀', '👩‍💼', '👨‍💼', '💼', '🎧', '✨'];

interface BotFarmManagerProps {
  isProUser?: boolean;
  initialBotId?: string;
}

export const BotFarmManager: React.FC<BotFarmManagerProps> = ({
  isProUser = false,
  initialBotId
}) => {
  const [bots, setBots] = useState<BotInstance[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'persona' | 'apps' | 'knowledge'>('persona');

  // Modal / Inline Creator state
  const [isCreating, setIsCreating] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [newBotAvatar, setNewBotAvatar] = useState('🤖');
  const [newBotDescription, setNewBotDescription] = useState('');
  const [newBotApps, setNewBotApps] = useState<string[]>([]);

  // Editing bot name / avatar inline
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  // 1. Load bots on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cf_bots_list');
      if (saved) {
        const parsed: BotInstance[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBots(parsed);
          setSelectedBotId(initialBotId || parsed[0].id);
          return;
        }
      }
    } catch {}

    // Clean initial bot (no fake data)
    const initialBot: BotInstance = {
      id: 'bot_primary',
      name: 'Primary AI Assistant',
      avatar: '🤖',
      description: 'Main omnichannel customer support & sales agent',
      assignedApps: ['whatsapp', 'telegram', 'instagram', 'discord', 'messenger', 'gmail'],
      createdAt: new Date().toISOString(),
    };
    const initialList = [initialBot];
    setBots(initialList);
    setSelectedBotId(initialBot.id);
    try {
      localStorage.setItem('cf_bots_list', JSON.stringify(initialList));
      initialBot.assignedApps.forEach(app => {
        localStorage.setItem(`cf_assigned_bot_${app}`, initialBot.id);
      });
    } catch {}
  }, [initialBotId]);

  // Selected bot reference
  const selectedBot = useMemo(() => {
    return bots.find(b => b.id === selectedBotId) || bots[0] || null;
  }, [bots, selectedBotId]);

  // Helper to persist bots
  const persistBots = (updatedList: BotInstance[]) => {
    setBots(updatedList);
    try {
      localStorage.setItem('cf_bots_list', JSON.stringify(updatedList));
      // Sync app mappings
      SUPPORTED_CHANNELS.forEach(ch => {
        const assigned = updatedList.find(b => b.assignedApps.includes(ch.id));
        if (assigned) {
          localStorage.setItem(`cf_assigned_bot_${ch.id}`, assigned.id);
        } else {
          localStorage.removeItem(`cf_assigned_bot_${ch.id}`);
        }
      });
    } catch {}
  };

  // 2. Create Bot Handler
  const handleCreateBot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName.trim()) return;

    const newId = `bot_${Date.now()}`;
    // Apps to assign: remove them from any existing bots
    const updatedExisting = bots.map(b => ({
      ...b,
      assignedApps: b.assignedApps.filter(app => !newBotApps.includes(app))
    }));

    const createdBot: BotInstance = {
      id: newId,
      name: newBotName.trim(),
      avatar: newBotAvatar,
      description: newBotDescription.trim() || 'Custom AI Agent',
      assignedApps: newBotApps,
      createdAt: new Date().toISOString(),
    };

    const finalList = [...updatedExisting, createdBot];
    persistBots(finalList);
    setSelectedBotId(newId);
    setIsCreating(false);
    setNewBotName('');
    setNewBotDescription('');
    setNewBotApps([]);
    setNewBotAvatar('🤖');
  };

  // 3. Delete Bot Handler
  const handleDeleteBot = (botIdToDelete: string) => {
    if (bots.length <= 1) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this bot? Its assigned apps will become unassigned.");
    if (!confirmDelete) return;

    const remaining = bots.filter(b => b.id !== botIdToDelete);
    persistBots(remaining);
    if (selectedBotId === botIdToDelete) {
      setSelectedBotId(remaining[0].id);
    }
  };

  // 4. Toggle App Assignment for Selected Bot
  const handleToggleApp = (appId: string) => {
    if (!selectedBot) return;

    const isAssignedToThis = selectedBot.assignedApps.includes(appId);
    let updatedList: BotInstance[];

    if (isAssignedToThis) {
      // Remove from selected bot
      updatedList = bots.map(b =>
        b.id === selectedBot.id
          ? { ...b, assignedApps: b.assignedApps.filter(a => a !== appId) }
          : b
      );
    } else {
      // Assign to selected bot, unassign from any other bot
      updatedList = bots.map(b => {
        if (b.id === selectedBot.id) {
          return { ...b, assignedApps: [...b.assignedApps, appId] };
        } else {
          return { ...b, assignedApps: b.assignedApps.filter(a => a !== appId) };
        }
      });
    }

    persistBots(updatedList);
  };

  // 5. Update Bot Identity (Name & Avatar)
  const handleSaveIdentity = () => {
    if (!selectedBot || !editName.trim()) return;
    const updated = bots.map(b =>
      b.id === selectedBot.id
        ? { ...b, name: editName.trim(), avatar: editAvatar || b.avatar }
        : b
    );
    persistBots(updated);
    setIsEditingIdentity(false);
  };

  const startEditIdentity = () => {
    if (!selectedBot) return;
    setEditName(selectedBot.name);
    setEditAvatar(selectedBot.avatar);
    setIsEditingIdentity(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: BOT FARM OVERVIEW & BOT SELECTOR */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-[#1B1B1B] dark:text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-500" />
              Bot Farm & Multi-Agent Manager
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Create multiple autonomous AI agents, assign each to specific apps, and fine-tune individual Darija personas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 shrink-0 transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Bot</span>
          </button>
        </div>

        {/* Bot Cards Carousel / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {bots.map((bot) => {
            const isSelected = bot.id === selectedBotId;
            return (
              <div
                key={bot.id}
                onClick={() => setSelectedBotId(bot.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] hover:border-gray-400 dark:hover:border-neutral-700'
                }`}
              >
                {/* Card Top */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl p-2 rounded-xl bg-gray-100 dark:bg-black/30 border border-black/5 shrink-0">
                      {bot.avatar}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-[#1B1B1B] dark:text-white truncate">
                          {bot.name}
                        </h4>
                        {isSelected && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-indigo-500 text-white shrink-0">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {bot.assignedApps.length} assigned channel{bot.assignedApps.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {bots.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBot(bot.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Bot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Assigned Apps Badges */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {bot.assignedApps.length === 0 ? (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        No apps assigned
                      </span>
                    ) : (
                      bot.assignedApps.map((appKey) => {
                        const channelDef = SUPPORTED_CHANNELS.find(c => c.id === appKey);
                        if (!channelDef) return null;
                        const { Icon } = channelDef;
                        return (
                          <span
                            key={appKey}
                            title={channelDef.name}
                            className="w-5 h-5 rounded-md flex items-center justify-center p-0.5 bg-gray-100 dark:bg-black/40 border border-black/5 dark:border-white/10"
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </span>
                        );
                      })
                    )}
                  </div>

                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                    Configure →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CREATE NEW BOT MODAL */}
      {/* ------------------------------------------------------------- */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1D23] rounded-3xl max-w-lg w-full p-6 border border-gray-200 dark:border-[#2E333D] shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Create New Bot</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBot} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Bot Name
                </label>
                <input
                  type="text"
                  required
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  placeholder="e.g. Sales Closer, VIP Concierge, Support Desk"
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent dark:bg-[#2A2D35] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Pick Bot Avatar
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewBotAvatar(emoji)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                        newBotAvatar === emoji
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-500/40 scale-105'
                          : 'bg-gray-100 dark:bg-black/30 hover:bg-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Assign Apps to this Bot (Optional)
                </label>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                  Select which channels should route conversations to this new bot:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SUPPORTED_CHANNELS.map((ch) => {
                    const isChecked = newBotApps.includes(ch.id);
                    const { Icon } = ch;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          setNewBotApps(prev =>
                            prev.includes(ch.id)
                              ? prev.filter(x => x !== ch.id)
                              : [...prev, ch.id]
                          );
                        }}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isChecked
                            ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-900/30 font-bold'
                            : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-xs text-[#1B1B1B] dark:text-gray-200 truncate">{ch.name}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-indigo-600 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-neutral-700 text-xs font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Create & Configure Bot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: CONFIGURE SELECTED BOT */}
      {/* ------------------------------------------------------------- */}
      {selectedBot && (
        <div className="p-6 rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-xs space-y-6">
          {/* Bot Header & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/40 text-indigo-600">
                {selectedBot.avatar}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-[#1B1B1B] dark:text-white">
                    {selectedBot.name}
                  </h3>
                  <button
                    type="button"
                    onClick={startEditIdentity}
                    className="p-1 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors"
                    title="Rename Bot"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ID: <span className="font-mono text-[10px]">{selectedBot.id}</span> • Routing to {selectedBot.assignedApps.length} active channel{selectedBot.assignedApps.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Sub-tabs selector for selected bot */}
            <div className="flex items-center bg-gray-100 dark:bg-black/30 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveSubTab('persona')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeSubTab === 'persona'
                    ? 'bg-white dark:bg-[#2A2D35] text-[#1B1B1B] dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Persona & Darija</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('apps')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeSubTab === 'apps'
                    ? 'bg-white dark:bg-[#2A2D35] text-[#1B1B1B] dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>App Assignments ({selectedBot.assignedApps.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('knowledge')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeSubTab === 'knowledge'
                    ? 'bg-white dark:bg-[#2A2D35] text-[#1B1B1B] dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>Knowledge Base</span>
              </button>
            </div>
          </div>

          {/* Quick inline rename if active */}
          {isEditingIdentity && (
            <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 space-y-3">
              <h5 className="text-xs font-bold text-gray-900 dark:text-white">Rename Bot & Change Avatar</h5>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#1A1D23] outline-none"
                  placeholder="Bot Name"
                />
                <div className="flex items-center gap-1.5">
                  {AVATAR_OPTIONS.slice(0, 6).map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setEditAvatar(emo)}
                      className={`w-7 h-7 text-sm rounded-lg ${editAvatar === emo ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-neutral-800'}`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveIdentity}
                    className="px-3 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingIdentity(false)}
                    className="px-3 py-2 border border-gray-300 dark:border-neutral-700 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 1: APP ASSIGNMENTS */}
          {activeSubTab === 'apps' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#1B1B1B] dark:text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-500" />
                  Assign Apps & Channels to {selectedBot.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select which social and messaging apps this bot handles. When customers message on an assigned app, this bot will reply using its customized persona and knowledge base.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {SUPPORTED_CHANNELS.map((ch) => {
                  const isAssignedToThis = selectedBot.assignedApps.includes(ch.id);
                  const otherOwner = !isAssignedToThis ? bots.find(b => b.assignedApps.includes(ch.id)) : null;
                  const { Icon } = ch;

                  return (
                    <div
                      key={ch.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isAssignedToThis
                          ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs ring-1 ring-emerald-500/30'
                          : otherOwner
                          ? 'border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-black/20 opacity-80'
                          : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#1A1D23]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-gray-100 dark:bg-black/30">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-[#1B1B1B] dark:text-white">
                              {ch.name}
                            </h5>
                            <p className="text-[10px] text-gray-400">
                              {ch.desc}
                            </p>
                          </div>
                        </div>

                        {/* Toggle switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleApp(ch.id)}
                          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                            isAssignedToThis ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              isAssignedToThis ? 'translate-x-4.5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Status footer */}
                      <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px]">
                        {isAssignedToThis ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Assigned to this bot
                          </span>
                        ) : otherOwner ? (
                          <span className="text-gray-500 text-[10px]">
                            Handled by: <span className="font-semibold text-gray-700 dark:text-gray-300">{otherOwner.name} ({otherOwner.avatar})</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[10px]">
                            Not assigned to any bot
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleApp(ch.id)}
                          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          {isAssignedToThis ? 'Unassign' : otherOwner ? 'Take Over' : 'Assign'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUBTAB 2: PERSONA & DARIJA DIALECT */}
          {activeSubTab === 'persona' && (
            <div className="space-y-4">
              <PromptCustomizer botId={selectedBot.id} />
            </div>
          )}

          {/* SUBTAB 3: KNOWLEDGE BASE */}
          {activeSubTab === 'knowledge' && (
            <div className="space-y-4">
              <KnowledgeBaseManager botId={selectedBot.id} />
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: DEVELOPER API PLUG (BYOK) */}
      {/* USER RULE: Hidden when client subscribes to Pro version; */}
      {/* By default placed at the bottom of the page */}
      {/* ------------------------------------------------------------- */}
      {!isProUser && (
        <div className="pt-8 border-t border-[#DFDFD4] dark:border-[#2E333D] space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-[#1B1B1B] dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-[#EB6708]" />
                Developer API Plug & BYOK Connection (Free Tier)
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Plug your custom Groq, OpenAI, or Gemini API key to run bots on the free tier. Pro subscribers automatically receive Chatbot Farm managed Cloud AI with zero API key configuration.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 self-start sm:self-auto">
              BYOK Mode Available
            </span>
          </div>

          <div className="p-6 rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-xs">
            <ByokManager isPro={false} />
          </div>
        </div>
      )}
    </div>
  );
};
