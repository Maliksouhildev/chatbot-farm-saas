"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, X, Plus, ShieldCheck, Mail, Save, User as UserIcon, Check, Settings, 
  BarChart2, Bot, Trash2, Briefcase, Phone, MessageSquare, Link as LinkIcon, 
  Palette, Globe, Shield, Sparkles, CheckSquare, Square
} from 'lucide-react';
import {
  WhatsAppIcon,
  InstagramIcon,
  TelegramIcon,
  MessengerIcon,
  GmailIcon,
  DiscordIcon,
  SlackIcon,
  GoogleVoiceIcon,
  SignalIcon,
  ViberIcon,
  SnapchatIcon,
  LinkedInIcon,
  StorefrontIcon,
} from '@/components/icons/BrandIcons';

export interface TeamMemberPermissions {
  is_admin?: boolean;
  can_access_all_workspaces?: boolean;
  assigned_workspaces?: string[];
  assigned_channels: string[];
  can_send_messages?: boolean;
  can_make_calls?: boolean;
  can_manage_channels?: boolean;
  can_edit_ui?: boolean;
  view_analytics: boolean;
  modify_settings: boolean;
  toggle_ai: boolean;
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  permissions: TeamMemberPermissions;
}

interface TeamManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  availableChannels: string[];
  projects?: any[];
}

const ALL_CHANNELS_METADATA: { id: string; name: string; icon: React.ReactNode; color: string }[] = [
  { id: 'whatsapp', name: 'WhatsApp Business', icon: <WhatsAppIcon className="w-4 h-4" />, color: '#1FAF38' },
  { id: 'whatsapp_second', name: 'WhatsApp #2', icon: <WhatsAppIcon className="w-4 h-4" />, color: '#15803D' },
  { id: 'instagram', name: 'Instagram DMs', icon: <InstagramIcon className="w-4 h-4" />, color: '#E1306C' },
  { id: 'telegram', name: 'Telegram', icon: <TelegramIcon className="w-4 h-4" />, color: '#24A1DE' },
  { id: 'messenger', name: 'Messenger', icon: <MessengerIcon className="w-4 h-4" />, color: '#006AFF' },
  { id: 'gmail', name: 'Gmail Support', icon: <GmailIcon className="w-4 h-4" />, color: '#EA4335' },
  { id: 'discord', name: 'Discord', icon: <DiscordIcon className="w-4 h-4" />, color: '#5865F2' },
  { id: 'slack', name: 'Slack Connect', icon: <SlackIcon className="w-4 h-4" />, color: '#4A154B' },
  { id: 'google_voice', name: 'Google Voice VoIP', icon: <GoogleVoiceIcon className="w-4 h-4" />, color: '#0F9D58' },
  { id: 'signal', name: 'Signal Private', icon: <SignalIcon className="w-4 h-4" />, color: '#3A76F0' },
  { id: 'viber', name: 'Viber Business', icon: <ViberIcon className="w-4 h-4" />, color: '#7360F2' },
  { id: 'snapchat', name: 'Snapchat Ads', icon: <SnapchatIcon className="w-4 h-4" />, color: '#FFFC00' },
  { id: 'linkedin', name: 'LinkedIn Leads', icon: <LinkedInIcon className="w-4 h-4" />, color: '#0A66C2' },
  { id: 'storefront', name: 'Storefront Live', icon: <StorefrontIcon className="w-4 h-4" />, color: '#059669' },
  { id: 'web_widget', name: 'Live Web Chat', icon: <Globe className="w-4 h-4 text-emerald-500" />, color: '#10B981' },
];

export const TeamManagerModal: React.FC<TeamManagerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  availableChannels = [],
  projects = [{ id: 'default', name: 'Main Workspace', icon: '🏢', color: '#1B6648' }],
}) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviteMode, setIsInviteMode] = useState(false);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newInviteName, setNewInviteName] = useState('');
  const [useLocalStore, setUseLocalStore] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchMembers();
    }
  }, [isOpen, currentUser]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/team?ownerId=${currentUser.id}`);
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      if (data.team) {
        setMembers(data.team);
      }
    } catch (err) {
      console.warn("API failed, falling back to localStorage", err);
      setUseLocalStore(true);
      const local = localStorage.getItem(`cf_team_${currentUser.id}`);
      if (local) {
        setMembers(JSON.parse(local));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveLocalMembers = (newMembers: TeamMember[]) => {
    setMembers(newMembers);
    localStorage.setItem(`cf_team_${currentUser.id}`, JSON.stringify(newMembers));
  };

  const updateMemberPermissions = async (memberId: string, updatedPermissions: TeamMemberPermissions) => {
    if (useLocalStore) {
      saveLocalMembers(members.map(m => m.id === memberId ? { ...m, permissions: updatedPermissions } : m));
    } else {
      setMembers(members.map(m => m.id === memberId ? { ...m, permissions: updatedPermissions } : m));
      try {
        await fetch('/api/team', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: memberId, permissions: updatedPermissions })
        });
      } catch {
        saveLocalMembers(members.map(m => m.id === memberId ? { ...m, permissions: updatedPermissions } : m));
      }
    }
  };

  const handleInvite = async () => {
    if (!newInviteEmail) return;
    setIsLoading(true);

    const initialChannels = availableChannels.length > 0 
      ? availableChannels 
      : ['whatsapp', 'telegram', 'gmail'];

    const newMemberParams = {
      ownerId: currentUser.id,
      email: newInviteEmail,
      name: newInviteName || newInviteEmail.split('@')[0],
      permissions: {
        is_admin: false,
        can_access_all_workspaces: true,
        assigned_workspaces: projects.map(p => p.id),
        assigned_channels: initialChannels,
        can_send_messages: true,
        can_make_calls: true,
        can_manage_channels: false,
        can_edit_ui: false,
        view_analytics: false,
        modify_settings: false,
        toggle_ai: false,
      } as TeamMemberPermissions
    };

    if (useLocalStore) {
      const newMember: TeamMember = {
        id: `team_${Date.now()}`,
        ...newMemberParams,
      };
      saveLocalMembers([...members, newMember]);
    } else {
      try {
        const res = await fetch('/api/team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMemberParams)
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to invite');
        }
        const data = await res.json();
        setMembers([...members, data]);
      } catch (err: any) {
        alert(err.message);
      }
    }
    
    setNewInviteEmail('');
    setNewInviteName('');
    setIsInviteMode(false);
    setIsLoading(false);
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!window.confirm("Are you sure you want to remove this collaborator?")) return;
    const nextMembers = members.filter(m => m.id !== memberId);
    setMembers(nextMembers);

    if (useLocalStore) {
      saveLocalMembers(nextMembers);
    } else {
      try {
        await fetch(`/api/team?userId=${memberId}`, { method: 'DELETE' });
      } catch {
        saveLocalMembers(nextMembers);
      }
    }
  };

  const handleTogglePermission = async (memberId: string, field: keyof TeamMemberPermissions) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const currentVal = !!member.permissions[field];
    const updatedPermissions = { ...member.permissions, [field]: !currentVal };

    // If granting full admin rights, auto-enable all capabilities
    if (field === 'is_admin' && !currentVal) {
      updatedPermissions.can_access_all_workspaces = true;
      updatedPermissions.can_send_messages = true;
      updatedPermissions.can_make_calls = true;
      updatedPermissions.can_manage_channels = true;
      updatedPermissions.can_edit_ui = true;
      updatedPermissions.view_analytics = true;
      updatedPermissions.modify_settings = true;
      updatedPermissions.toggle_ai = true;
    }

    await updateMemberPermissions(memberId, updatedPermissions);
  };

  const handleToggleWorkspace = async (memberId: string, workspaceId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    let currentWs = member.permissions.assigned_workspaces || projects.map(p => p.id);
    let nextWs = currentWs.includes(workspaceId)
      ? currentWs.filter(id => id !== workspaceId)
      : [...currentWs, workspaceId];

    if (nextWs.length === 0) {
      nextWs = ['default'];
    }

    const updatedPermissions = { ...member.permissions, assigned_workspaces: nextWs };
    await updateMemberPermissions(memberId, updatedPermissions);
  };

  const handleToggleChannel = async (memberId: string, channelId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    let newChannels = [...(member.permissions.assigned_channels || [])];
    if (newChannels.includes(channelId)) {
      newChannels = newChannels.filter(id => id !== channelId);
    } else {
      newChannels.push(channelId);
    }

    const updatedPermissions = { ...member.permissions, assigned_channels: newChannels };
    await updateMemberPermissions(memberId, updatedPermissions);
  };

  const handleSetAllChannels = async (memberId: string, selectAll: boolean) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const allChannelIds = ALL_CHANNELS_METADATA.map(c => c.id);
    const updatedPermissions = {
      ...member.permissions,
      assigned_channels: selectAll ? allChannelIds : []
    };
    await updateMemberPermissions(memberId, updatedPermissions);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-4xl max-h-[92vh] bg-[#ECECE2] dark:bg-[#1A1D23] rounded-3xl shadow-2xl border border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#13151A] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1B6648]/10 dark:bg-emerald-950/40 text-[#1B6648] dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#1B1B1B] dark:text-white leading-tight">Team Management & Access Control</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Configure collaborator roles, workspace scopes, permitted app logos, and actions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-gray-800 dark:text-gray-200">Collaborators ({members.length})</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Control granular rights for each staff member</p>
              </div>
              <button
                onClick={() => setIsInviteMode(!isInviteMode)}
                className="px-3.5 py-2 bg-[#1B6648] hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Collaborator</span>
              </button>
            </div>

            {isInviteMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-white dark:bg-black/30 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row gap-3 shadow-sm"
              >
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Collaborator Email Address"
                    value={newInviteEmail}
                    onChange={e => setNewInviteEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-gray-50 dark:bg-neutral-800 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden dark:text-white"
                  />
                </div>
                <div className="flex-1 relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Collaborator Name (Optional)"
                    value={newInviteName}
                    onChange={e => setNewInviteName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-gray-50 dark:bg-neutral-800 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden dark:text-white"
                  />
                </div>
                <button
                  onClick={handleInvite}
                  disabled={isLoading || !newInviteEmail}
                  className="px-4 py-2 bg-[#1B6648] hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isLoading ? 'Inviting...' : 'Invite Collaborator'}
                </button>
              </motion.div>
            )}

            <div className="space-y-5">
              {members.length === 0 && !isLoading && (
                <div className="text-center py-12 bg-white dark:bg-[#13151A] rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] text-gray-500 dark:text-gray-400 font-medium">
                  <Users className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-600 mb-2 opacity-50" />
                  <p className="font-bold text-sm">No collaborators yet</p>
                  <p className="text-xs text-gray-400 mt-1">Invite team members to assign workspaces and channel permissions.</p>
                </div>
              )}

              {members.map(member => {
                const isAdmin = !!member.permissions.is_admin;
                const canAccessAllWorkspaces = isAdmin || !!member.permissions.can_access_all_workspaces;
                const assignedWs = member.permissions.assigned_workspaces || ['default'];
                const assignedChannels = member.permissions.assigned_channels || [];

                return (
                  <div key={member.id} className="bg-white dark:bg-[#13151A] p-4 sm:p-5 rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] shadow-sm space-y-4">
                    {/* Member Top Bar */}
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1B6648] to-emerald-400 text-white flex items-center justify-center font-black text-sm shadow-xs">
                          {member.name?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-gray-900 dark:text-white text-sm">{member.name}</h4>
                            {isAdmin ? (
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#1B6648] dark:text-emerald-400 flex items-center gap-1">
                                <Shield className="w-3 h-3" /> Admin
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400">
                                Collaborator
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{member.email}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteMember(member.id)}
                        title="Remove Collaborator"
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Master Admin Toggle Banner */}
                    <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isAdmin 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                        : 'bg-gray-50 dark:bg-neutral-800/40 border-gray-200 dark:border-neutral-800'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className={`w-5 h-5 ${isAdmin ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
                        <div>
                          <span className="text-xs font-black text-gray-900 dark:text-white block">Full Admin Rights</span>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">Unrestricted access across all workspaces, channels, messaging, and system settings</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTogglePermission(member.id, 'is_admin')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                          isAdmin ? 'bg-[#1B6648]' : 'bg-gray-300 dark:bg-neutral-700'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAdmin ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Workspace Scope Assignment */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <h5 className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-300">Workspace Scope</h5>
                        </div>
                        {!isAdmin && (
                          <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 dark:text-gray-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={canAccessAllWorkspaces}
                              onChange={() => handleTogglePermission(member.id, 'can_access_all_workspaces')}
                              className="rounded text-[#1B6648] focus:ring-emerald-500"
                            />
                            <span>Allow All Workspaces</span>
                          </label>
                        )}
                      </div>

                      {isAdmin || canAccessAllWorkspaces ? (
                        <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Collaborator has access to all current and future workspaces.</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {projects.map(proj => {
                            const isAssigned = assignedWs.includes(proj.id);
                            return (
                              <button
                                key={proj.id}
                                type="button"
                                onClick={() => handleToggleWorkspace(member.id, proj.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                                  isAssigned
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-[#1B6648] text-[#1B6648] dark:text-emerald-400 shadow-2xs'
                                    : 'bg-gray-50 dark:bg-neutral-850 border-gray-200 dark:border-neutral-750 text-gray-500 dark:text-gray-400 opacity-60 hover:opacity-100'
                                }`}
                              >
                                <span className="w-4 h-4 rounded-md flex items-center justify-center text-xs" style={{ backgroundColor: `${proj.color || '#1B6648'}20` }}>
                                  {proj.icon || '🏢'}
                                </span>
                                <span>{proj.name}</span>
                                {isAssigned && <Check className="w-3.5 h-3.5 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Permitted Apps & Channels with Official Logos */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <h5 className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-300">Permitted Apps & Channels</h5>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSetAllChannels(member.id, true)}
                            className="text-[10px] font-bold text-[#1B6648] dark:text-emerald-400 hover:underline cursor-pointer"
                          >
                            Select All
                          </button>
                          <span className="text-gray-300 dark:text-neutral-700">|</span>
                          <button
                            type="button"
                            onClick={() => handleSetAllChannels(member.id, false)}
                            className="text-[10px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                          >
                            Deselect All
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {ALL_CHANNELS_METADATA.map(channel => {
                          const isAssigned = isAdmin || assignedChannels.includes(channel.id);
                          return (
                            <button
                              key={channel.id}
                              type="button"
                              disabled={isAdmin}
                              onClick={() => handleToggleChannel(member.id, channel.id)}
                              className={`p-2 rounded-2xl border transition-all flex items-center gap-2.5 text-left cursor-pointer ${
                                isAssigned
                                  ? 'bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 shadow-2xs ring-1 ring-emerald-500/30'
                                  : 'bg-gray-50/70 dark:bg-neutral-900/40 border-gray-200/60 dark:border-neutral-800 text-gray-400 dark:text-gray-600 opacity-50 grayscale hover:grayscale-0 hover:opacity-100'
                              }`}
                            >
                              <div className="shrink-0">{channel.icon}</div>
                              <div className="min-w-0 flex-1">
                                <span className={`text-[11px] font-bold truncate block ${isAssigned ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                                  {channel.name}
                                </span>
                              </div>
                              {isAssigned && (
                                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] shrink-0">
                                  ✓
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action & Feature Rights Toggles */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-300">Feature & Action Permissions</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {/* Send Messages */}
                        <label className={`flex items-center justify-between p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                          (isAdmin || member.permissions.can_send_messages !== false)
                            ? 'bg-white dark:bg-neutral-800/80 border-gray-200 dark:border-neutral-700'
                            : 'bg-gray-50 dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800 opacity-60'
                        }`}>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Send Messages</span>
                          </div>
                          <input
                            type="checkbox"
                            disabled={isAdmin}
                            checked={isAdmin || member.permissions.can_send_messages !== false}
                            onChange={() => handleTogglePermission(member.id, 'can_send_messages')}
                            className="w-4 h-4 rounded text-[#1B6648] focus:ring-emerald-500"
                          />
                        </label>

                        {/* Calling & Voice */}
                        <label className={`flex items-center justify-between p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                          (isAdmin || member.permissions.can_make_calls !== false)
                            ? 'bg-white dark:bg-neutral-800/80 border-gray-200 dark:border-neutral-700'
                            : 'bg-gray-50 dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800 opacity-60'
                        }`}>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Voice & Audio Calls</span>
                          </div>
                          <input
                            type="checkbox"
                            disabled={isAdmin}
                            checked={isAdmin || member.permissions.can_make_calls !== false}
                            onChange={() => handleTogglePermission(member.id, 'can_make_calls')}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                          />
                        </label>

                        {/* Link / Unlink Channels */}
                        <label className={`flex items-center justify-between p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                          (isAdmin || !!member.permissions.can_manage_channels)
                            ? 'bg-white dark:bg-neutral-800/80 border-gray-200 dark:border-neutral-700'
                            : 'bg-gray-50 dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800 opacity-60'
                        }`}>
                          <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Link / Unlink Accounts</span>
                          </div>
                          <input
                            type="checkbox"
                            disabled={isAdmin}
                            checked={isAdmin || !!member.permissions.can_manage_channels}
                            onChange={() => handleTogglePermission(member.id, 'can_manage_channels')}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                          />
                        </label>

                        {/* Edit UI & App Placement */}
                        <label className={`flex items-center justify-between p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                          (isAdmin || !!member.permissions.can_edit_ui)
                            ? 'bg-white dark:bg-neutral-800/80 border-gray-200 dark:border-neutral-700'
                            : 'bg-gray-50 dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800 opacity-60'
                        }`}>
                          <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-fuchsia-500" />
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Edit UI & App Layouts</span>
                          </div>
                          <input
                            type="checkbox"
                            disabled={isAdmin}
                            checked={isAdmin || !!member.permissions.can_edit_ui}
                            onChange={() => handleTogglePermission(member.id, 'can_edit_ui')}
                            className="w-4 h-4 rounded text-fuchsia-600 focus:ring-fuchsia-500"
                          />
                        </label>

                        {/* View Analytics */}
                        <label className={`flex items-center justify-between p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                          (isAdmin || !!member.permissions.view_analytics)
                            ? 'bg-white dark:bg-neutral-800/80 border-gray-200 dark:border-neutral-700'
                            : 'bg-gray-50 dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800 opacity-60'
                        }`}>
                          <div className="flex items-center gap-2">
                            <BarChart2 className="w-4 h-4 text-teal-500" />
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">View Analytics</span>
                          </div>
                          <input
                            type="checkbox"
                            disabled={isAdmin}
                            checked={isAdmin || !!member.permissions.view_analytics}
                            onChange={() => handleTogglePermission(member.id, 'view_analytics')}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                          />
                        </label>

                        {/* Modify Settings */}
                        <label className={`flex items-center justify-between p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                          (isAdmin || !!member.permissions.modify_settings)
                            ? 'bg-white dark:bg-neutral-800/80 border-gray-200 dark:border-neutral-700'
                            : 'bg-gray-50 dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800 opacity-60'
                        }`}>
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-orange-500" />
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Modify Settings</span>
                          </div>
                          <input
                            type="checkbox"
                            disabled={isAdmin}
                            checked={isAdmin || !!member.permissions.modify_settings}
                            onChange={() => handleTogglePermission(member.id, 'modify_settings')}
                            className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                          />
                        </label>

                        {/* Toggle AI Autonomous Bot */}
                        <label className={`flex items-center justify-between p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                          (isAdmin || !!member.permissions.toggle_ai)
                            ? 'bg-white dark:bg-neutral-800/80 border-gray-200 dark:border-neutral-700'
                            : 'bg-gray-50 dark:bg-neutral-900/40 border-gray-200 dark:border-neutral-800 opacity-60'
                        }`}>
                          <div className="flex items-center gap-2">
                            <Bot className="w-4 h-4 text-purple-500" />
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Toggle AI Agents</span>
                          </div>
                          <input
                            type="checkbox"
                            disabled={isAdmin}
                            checked={isAdmin || !!member.permissions.toggle_ai}
                            onChange={() => handleTogglePermission(member.id, 'toggle_ai')}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                          />
                        </label>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
