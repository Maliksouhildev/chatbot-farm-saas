"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Plus, ShieldCheck, Mail, Save, User as UserIcon, Check, Settings, BarChart2, Bot, LayoutGrid } from 'lucide-react';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  permissions: {
    view_analytics: boolean;
    modify_settings: boolean;
    toggle_ai: boolean;
    assigned_channels: string[];
  };
}

interface TeamManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  availableChannels: string[];
}

export const TeamManagerModal: React.FC<TeamManagerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  availableChannels
}) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviteMode, setIsInviteMode] = useState(false);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newInviteName, setNewInviteName] = useState('');
  
  // Local fallback if API fails
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

  const handleInvite = async () => {
    if (!newInviteEmail) return;
    setIsLoading(true);
    const newMemberParams = {
      ownerId: currentUser.id,
      email: newInviteEmail,
      name: newInviteName || newInviteEmail.split('@')[0],
      permissions: {
        view_analytics: false,
        modify_settings: false,
        toggle_ai: false,
        assigned_channels: []
      }
    };

    if (useLocalStore) {
      const newMember: TeamMember = {
        id: `mock_team_${Date.now()}`,
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

  const handleTogglePermission = async (memberId: string, field: keyof TeamMember['permissions']) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const updatedPermissions = { ...member.permissions, [field]: !member.permissions[field] };
    
    if (useLocalStore) {
      saveLocalMembers(members.map(m => m.id === memberId ? { ...m, permissions: updatedPermissions } : m));
    } else {
      setMembers(members.map(m => m.id === memberId ? { ...m, permissions: updatedPermissions } : m));
      await fetch('/api/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: memberId, permissions: updatedPermissions })
      });
    }
  };

  const handleToggleChannel = async (memberId: string, channelId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    let newChannels = [...member.permissions.assigned_channels];
    if (newChannels.includes(channelId)) {
      newChannels = newChannels.filter(id => id !== channelId);
    } else {
      newChannels.push(channelId);
    }

    const updatedPermissions = { ...member.permissions, assigned_channels: newChannels };
    
    if (useLocalStore) {
      saveLocalMembers(members.map(m => m.id === memberId ? { ...m, permissions: updatedPermissions } : m));
    } else {
      setMembers(members.map(m => m.id === memberId ? { ...m, permissions: updatedPermissions } : m));
      await fetch('/api/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: memberId, permissions: updatedPermissions })
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-4xl max-h-[90vh] bg-[#ECECE2] dark:bg-[#1A1D23] rounded-3xl shadow-2xl border border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#13151A] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#1B1B1B] dark:text-white leading-tight">Team Management</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Manage employees and their access permissions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 dark:text-gray-200">Your Employees ({members.length})</h3>
              <button
                onClick={() => setIsInviteMode(!isInviteMode)}
                className="px-4 py-2 bg-[#1B6648] hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Burner Account</span>
              </button>
            </div>

            {isInviteMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-white dark:bg-black/30 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex flex-col sm:flex-row gap-3"
              >
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Employee Email Address"
                    value={newInviteEmail}
                    onChange={e => setNewInviteEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-neutral-800 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                  />
                </div>
                <div className="flex-1 relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Employee Name (Optional)"
                    value={newInviteName}
                    onChange={e => setNewInviteName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-neutral-800 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                  />
                </div>
                <button
                  onClick={handleInvite}
                  disabled={isLoading || !newInviteEmail}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all"
                >
                  {isLoading ? 'Creating...' : 'Create & Invite'}
                </button>
              </motion.div>
            )}

            <div className="space-y-4">
              {members.length === 0 && !isLoading && (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400 font-medium">
                  No employees found. Create a burner account to get started.
                </div>
              )}
              {members.map(member => (
                <div key={member.id} className="bg-white dark:bg-[#13151A] p-4 sm:p-5 rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">
                        {member.name?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{member.name}</h4>
                        <p className="text-xs text-gray-500 font-mono">{member.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* General Permissions */}
                  <div>
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Global Access Rights</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-neutral-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={member.permissions.view_analytics}
                          onChange={() => handleTogglePermission(member.id, 'view_analytics')}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-50 dark:focus:ring-offset-neutral-900 bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600"
                        />
                        <BarChart2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">View Analytics</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-neutral-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={member.permissions.modify_settings}
                          onChange={() => handleTogglePermission(member.id, 'modify_settings')}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-50 dark:focus:ring-offset-neutral-900 bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600"
                        />
                        <Settings className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Modify Settings</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-neutral-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={member.permissions.toggle_ai}
                          onChange={() => handleTogglePermission(member.id, 'toggle_ai')}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-50 dark:focus:ring-offset-neutral-900 bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600"
                        />
                        <Bot className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Toggle AI Agents</span>
                      </label>
                    </div>
                  </div>

                  {/* Channel Assignments */}
                  <div>
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Assigned Channels</span>
                      <span className="text-xs font-medium normal-case text-gray-400">If unchecked, channel is completely hidden</span>
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {availableChannels.map(channel => {
                        const isAssigned = member.permissions.assigned_channels.includes(channel);
                        return (
                          <button
                            key={channel}
                            onClick={() => handleToggleChannel(member.id, channel)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                              isAssigned
                                ? 'bg-[#1B6648]/10 border-[#1B6648] text-[#1B6648] dark:bg-emerald-900/30 dark:border-emerald-500 dark:text-emerald-400'
                                : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-400 hover:border-gray-300 dark:hover:border-neutral-500'
                            }`}
                          >
                            {isAssigned && <Check className="w-3.5 h-3.5" />}
                            {channel.replace('_', ' ').toUpperCase()}
                          </button>
                        );
                      })}
                      {availableChannels.length === 0 && (
                        <div className="text-xs text-gray-400 italic">No active channels connected to assign.</div>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
