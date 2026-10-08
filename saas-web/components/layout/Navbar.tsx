"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  CreditCard, 
  Settings, 
  User, 
  PhoneCall, 
  Sparkles, 
  Sun, 
  Moon,
  ChevronDown,
  LogOut,
  CheckCircle2,
  Menu,
  X,
  Bot,
  Users,
  Pencil,
  Trash2
} from 'lucide-react';

import { useChatStore } from '@/lib/store/ChatStoreContext';
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceModal';
import { AvatarEditModal } from '@/components/workspace/AvatarEditModal';

export type MainNavTab = 'workspace' | 'billing' | 'bot_settings' | 'settings' | 'profile' | 'contact';

interface NavbarProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  currentUser: any;
  onOpenAuth: () => void;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleAi?: (channelId: string) => void;
  onOpenTeamModal?: () => void;
  projects?: any[];
  activeProjectId?: string;
  onSelectProject?: (projectId: string) => void;
  onCreateProject?: (workspace?: { name: string; icon: string; color: string }) => void;
  onDeleteProject?: (projectId: string) => void;
  onUpdateUser?: (updated: { name: string; avatar: string }) => void;
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onOpenAuth,
  onLogout,
  darkMode,
  onToggleDarkMode,
  onToggleAi,
  onOpenTeamModal,
  projects = [],
  activeProjectId = 'default',
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onUpdateUser,
  isAdmin = true,
}) => {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const { globalUnreadCount, activeAppId, aiEnabledByChannel } = useChatStore();
  const isGlobalAiActive = activeAppId ? aiEnabledByChannel[activeAppId] : false;

  const activeProject = projects?.find(p => p.id === activeProjectId) || projects?.[0] || {
    id: 'default',
    name: 'Main Workspace',
    icon: '🏢',
    color: '#1B6648',
    role: 'owner',
  };

  const navItemsRaw: { id: MainNavTab; label: string; icon: React.ReactNode, perm?: string, hideForEmployee?: boolean }[] = [
    { id: 'workspace', label: 'Workspace', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'billing', label: 'Billing Plans', icon: <CreditCard className="w-3.5 h-3.5" />, hideForEmployee: true },
    { id: 'bot_settings', label: 'Bot Settings', icon: <Bot className="w-3.5 h-3.5" />, perm: 'modify_settings' },
    { id: 'contact', label: 'Contact', icon: <PhoneCall className="w-3.5 h-3.5" /> },
  ];

  const isEmployee = !!currentUser?.workspace_owner_id;
  const navItems = navItemsRaw.filter(item => {
    if (isEmployee) {
      if (item.hideForEmployee) return false;
      if (item.perm && !currentUser?.permissions?.[item.perm]) return false;
    }
    return true;
  });

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateWorkspace = (data: { name: string; icon: string; color: string }) => {
    if (onCreateProject) {
      onCreateProject(data);
    }
  };

  const isUserAvatarImage = currentUser?.avatar?.startsWith('http') || currentUser?.avatar?.startsWith('data:image');

  return (
    <>
      <header 
        style={{ containerType: 'inline-size', containerName: 'navbar' }}
        className="navbar-container sticky top-0 z-40 w-full max-w-full min-w-0 bg-white dark:bg-[#1A1D23] border-b border-[#DFDFD4] dark:border-[#2E333D] px-2.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between shadow-xs transition-colors shrink-0"
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @container navbar (max-width: 880px) {
            .navbar-center-nav { display: none !important; }
            .navbar-mobile-toggle { display: flex !important; }
            .navbar-logo-subtitle { display: none !important; }
          }
          @container navbar (min-width: 881px) {
            .navbar-mobile-toggle { display: none !important; }
          }
          @container navbar (max-width: 640px) {
            .navbar-ai-label { display: none !important; }
            .navbar-ai-toggle { padding: 0.25rem 0.5rem !important; gap: 0.25rem !important; }
          }
          @container navbar (max-width: 400px) {
            .navbar-ai-toggle {
              opacity: 0 !important;
              pointer-events: none !important;
              max-width: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              border: none !important;
              display: none !important;
            }
          }
        `}} />
        
        {/* Left Section: Brand Emblem & Workspace Selector */}
        <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
          {/* Brand Emblem */}
          <div 
            onClick={() => onSelectTab('workspace')}
            className="navbar-logo flex items-center gap-2 sm:gap-2.5 select-none cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#EB6708] to-[#FB9B3C] flex items-center justify-center font-black text-white text-xs sm:text-sm shadow-md group-hover:scale-105 transition-transform shrink-0">
              CF
            </div>
            <div className="min-w-0 hidden sm:block">
              <h1 className="font-black text-xs sm:text-base text-[#1B6648] dark:text-emerald-400 tracking-tight flex items-center gap-1 sm:gap-1.5 leading-tight truncate">
                Chatbot Farm <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#1B6648]/10 text-[#1B6648] dark:bg-emerald-950/40 dark:text-emerald-400">SAAS</span>
              </h1>
              <p className="navbar-logo-subtitle hidden xl:block text-[11px] text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Algerian Omnichannel & Darija AI</p>
            </div>
          </div>
        </div>

        {/* Center Nav Tabs with Framer Motion Sliding Pill */}
        <nav className="navbar-center-nav hidden md:flex items-center gap-0.5 lg:gap-1 p-1 bg-[#ECECE2]/70 dark:bg-black/40 rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] relative shrink-0">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            if (item.id === 'workspace') {
              return (
                <div key={item.id} className="relative" ref={projectDropdownRef}>
                  <button
                    onClick={() => {
                      onSelectTab('workspace');
                      setIsProjectDropdownOpen(!isProjectDropdownOpen);
                    }}
                    className={`relative px-2.5 lg:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer z-10 whitespace-nowrap group ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-[#1B1B1B] dark:text-gray-200 dark:hover:text-white'
                    }`}
                    title="Switch, Create, or Delete Workspaces"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavTab"
                        className="absolute inset-0 bg-[#1B6648] rounded-xl shadow-xs z-[-1]"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                    {item.icon}
                    <span>{activeProject.name || item.label}</span>
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: activeProject.color || '#1B6648' }}
                      title={activeProject.name}
                    />
                    <ChevronDown
                      className={`w-3 h-3 text-current opacity-70 group-hover:opacity-100 transition-transform duration-200 ${
                        isProjectDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Workspace Switcher Popover directly under Workspace Tab */}
                  <AnimatePresence>
                    {isProjectDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-white dark:bg-[#1A1D23] border border-[#DFDFD4] dark:border-[#2E333D] shadow-2xl p-2 z-50 text-xs space-y-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Workspaces</span>
                          <span className="text-[10px] text-gray-400 font-mono">{projects.length} Available</span>
                        </div>

                        <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1 py-1">
                          {projects.map((p: any) => {
                            const isSel = (p.id === activeProjectId);
                            const canDelete = isAdmin && projects.length > 1;
                            return (
                              <div
                                key={p.id}
                                onClick={() => {
                                  onSelectProject?.(p.id);
                                  setIsProjectDropdownOpen(false);
                                }}
                                className={`group/ws w-full px-2.5 py-2 text-xs font-bold rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                                  isSel
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-[#1B6648] dark:text-emerald-400 border border-emerald-500/20'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 border border-transparent'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate pr-2">
                                  <span
                                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 shadow-2xs"
                                    style={{ backgroundColor: `${p.color || '#1B6648'}20` }}
                                  >
                                    {p.icon || '🏢'}
                                  </span>
                                  <div className="truncate text-left">
                                    <div className="truncate font-bold">{p.name}</div>
                                    {isSel && <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-normal">Active</div>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-[#1B6648] dark:text-emerald-400" />}
                                  {canDelete && (
                                    <button
                                      type="button"
                                      title="Delete Workspace"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`Are you sure you want to delete workspace "${p.name}"?`)) {
                                          onDeleteProject?.(p.id);
                                        }
                                      }}
                                      className="opacity-0 group-hover/ws:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {isAdmin && (
                          <div className="border-t border-gray-100 dark:border-neutral-800 pt-1.5">
                            <button
                              onClick={() => {
                                setIsProjectDropdownOpen(false);
                                setIsCreateWorkspaceModalOpen(true);
                              }}
                              className="w-full text-left px-2.5 py-2 text-xs font-bold text-[#1B6648] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <span className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center text-sm leading-none shrink-0 font-bold">+</span>
                              <span>Create New Workspace</span>
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative px-2.5 lg:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer z-10 whitespace-nowrap ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-[#1B1B1B] dark:text-gray-200 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute inset-0 bg-[#1B6648] rounded-xl shadow-xs z-[-1]"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                {item.icon}
                <span className="hidden lg:inline">{item.label}</span>
                <span className="inline lg:hidden">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right User & Dark Mode Actions */}
        <div className="navbar-actions flex items-center gap-1.5 sm:gap-4 relative shrink-0 justify-self-end ml-auto" ref={dropdownRef}>
          
          {/* Global AI Toggle & Notification Badge */}
          <div className="navbar-ai-toggle flex items-center gap-2 sm:gap-3 mr-1 sm:mr-2 bg-gray-50 dark:bg-neutral-800/50 px-2 sm:px-3 py-1.5 rounded-2xl border border-[#DFDFD4] dark:border-neutral-700 shadow-sm transition-all duration-200 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                {globalUnreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[9px] font-bold text-white shadow-sm">
                    {globalUnreadCount > 99 ? '99+' : globalUnreadCount}
                  </span>
                )}
              </div>
              <span className="navbar-ai-label text-[11px] font-bold text-gray-700 dark:text-gray-300">AI Agent</span>
            </div>
            <button
              type="button"
              onClick={() => onToggleAi && onToggleAi(activeAppId)}
              className={`navbar-ai-btn relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 cursor-pointer shadow-inner focus:outline-hidden focus:ring-2 focus:ring-emerald-400/40 hover:scale-105 shrink-0 ${
                isGlobalAiActive ? 'bg-[#1B6648]' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              title={isGlobalAiActive ? 'Disable AI for current channel' : 'Enable AI for current channel'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  isGlobalAiActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 sm:p-2 rounded-xl bg-[#ECECE2]/80 dark:bg-neutral-800 text-gray-700 dark:text-amber-400 hover:scale-105 transition-all shadow-xs cursor-pointer"
            title={darkMode ? 'Switch to Light Beige' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {currentUser ? (
            <div className="relative">
              {/* Clickable Profile Badge */}
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 sm:pr-3 rounded-2xl hover:bg-[#ECECE2]/60 dark:hover:bg-neutral-800 transition-colors border border-transparent hover:border-[#DFDFD4] dark:hover:border-neutral-700 cursor-pointer"
              >
                <div className="relative">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#1B6648] to-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-sm overflow-hidden">
                    {isUserAvatarImage ? (
                      <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{currentUser.avatar || currentUser.name?.[0]?.toUpperCase() || 'M'}</span>
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" />
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <span className="font-bold text-[#1B1B1B] dark:text-gray-200 dark:text-white block max-w-[110px] truncate leading-tight">
                    {currentUser.name || 'My Account'}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block leading-tight">
                    Owner
                  </span>
                </div>
                <ChevronDown className={`hidden lg:block w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#1A1D23] border border-[#DFDFD4] dark:border-[#2E333D] shadow-xl p-2.5 z-50 text-xs space-y-1"
                  >
                    {/* User Info Header: Profile Picture on LEFT with Edit Pencil Icon */}
                    <div className="p-3 rounded-2xl bg-gray-50/80 dark:bg-black/40 border border-gray-100 dark:border-neutral-800 flex items-center gap-3">
                      {/* Left Avatar with Pencil overlay */}
                      <div className="relative group shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1B6648] to-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-xs overflow-hidden">
                          {isUserAvatarImage ? (
                            <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <span>{currentUser.avatar || currentUser.name[0]?.toUpperCase() || 'M'}</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAvatarModalOpen(true);
                            setIsProfileMenuOpen(false);
                          }}
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1B6648] hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                          title="Edit profile & avatar"
                        >
                          <Pencil className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {/* User Name & Email on the Right (No green enterprise text) */}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-[#1B1B1B] dark:text-white truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-neutral-800 my-1" />
                    
                    {/* Workspace Switcher */}
                    <div className="px-1.5 pt-1 pb-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">Workspaces</p>
                      <div className="max-h-32 overflow-y-auto custom-scrollbar pr-1 space-y-0.5">
                        {projects && projects.map((p: any) => {
                          const isSel = (activeProjectId === p.id);
                          return (
                            <button
                              key={p.id}
                              onClick={() => {
                                onSelectProject?.(p.id);
                                setIsProfileMenuOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                                isSel
                                  ? 'bg-[#1B6648]/10 text-[#1B6648] dark:text-emerald-400'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate pr-2">
                                <span
                                  className="w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0"
                                  style={{ backgroundColor: `${p.color || '#1B6648'}20` }}
                                >
                                  {p.icon || '🏢'}
                                </span>
                                <span className="truncate">{p.name}</span>
                              </div>
                              {isSel && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsCreateWorkspaceModalOpen(true);
                        }}
                        className="w-full text-left px-2.5 py-1.5 mt-1 text-xs font-bold text-[#1B6648] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <span className="w-4 h-4 rounded-md bg-emerald-500/10 flex items-center justify-center text-xs leading-none shrink-0 font-bold">+</span>
                        <span>Create Workspace</span>
                      </button>
                    </div>

                    <div className="border-t border-gray-100 dark:border-neutral-800 my-1" />

                    {/* Customize Profile Button */}
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsAvatarModalOpen(true);
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-[#ECECE2]/60 dark:hover:bg-neutral-800 text-left font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-gray-800 dark:text-gray-200"
                    >
                      <User className="w-4 h-4 text-[#1B6648] dark:text-emerald-400" />
                      <span>Customize Profile</span>
                    </button>

                    {/* Add Collaborators Button */}
                    {(!isEmployee || currentUser?.permissions?.modify_settings) && (
                      <button
                        onClick={() => {
                          onOpenTeamModal?.();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-[#ECECE2]/60 dark:hover:bg-neutral-800 text-left font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-gray-800 dark:text-gray-200"
                      >
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>Add Collaborators</span>
                      </button>
                    )}

                    {/* Settings & Configuration Button */}
                    {(!isEmployee || currentUser?.permissions?.modify_settings) && (
                      <button
                        onClick={() => {
                          onSelectTab('settings');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-[#ECECE2]/60 dark:hover:bg-neutral-800 text-left font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-gray-800 dark:text-gray-200"
                      >
                        <Settings className="w-4 h-4 text-[#EB6708]" />
                        <span>Settings</span>
                      </button>
                    )}

                    <div className="border-t border-gray-100 dark:border-neutral-800 my-1" />

                    {/* Log Out Button */}
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-left font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="p-1.5 sm:px-4 sm:py-2 bg-[#EB6708] hover:bg-[#EB6708]/90 text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-98 flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Sign In"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="navbar-mobile-toggle md:hidden p-1.5 sm:p-2 rounded-xl bg-[#ECECE2]/80 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 hover:scale-105 transition-all shadow-xs cursor-pointer ml-0.5 sm:ml-1"
            title="Navigation Menu"
            aria-label="Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer (Floating Overlay) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="md:hidden absolute top-full left-0 right-0 z-50 bg-white dark:bg-[#1A1D23] border-b border-[#DFDFD4] dark:border-[#2E333D] shadow-2xl p-4 space-y-3"
            >
              {/* Navigation links list */}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-3 cursor-pointer ${
                        isActive
                          ? 'bg-[#1B6648] text-white shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-[#ECECE2]/60 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="border-t border-[#DFDFD4] dark:border-[#2E333D] pt-2" />

              {/* User Session or Sign In */}
              {currentUser ? (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1B6648] to-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                        {isUserAvatarImage ? (
                          <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span>{currentUser.avatar || currentUser.name[0]?.toUpperCase() || 'M'}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[#1B1B1B] dark:text-gray-200 dark:text-white truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono truncate">{currentUser.email}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full py-2.5 bg-[#EB6708] hover:bg-[#EB6708]/90 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sign In to Chatbot Farm</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Modals for Create Workspace and Avatar Edit */}
      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceModalOpen}
        onClose={() => setIsCreateWorkspaceModalOpen(false)}
        onCreate={handleCreateWorkspace}
      />

      <AvatarEditModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentUser={currentUser}
        onSave={(updated) => {
          if (onUpdateUser) {
            onUpdateUser(updated);
          }
        }}
      />
    </>
  );
};
