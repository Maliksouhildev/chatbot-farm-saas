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
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Menu,
  X,
  Bell,
  Bot,
  Users
} from 'lucide-react';

import { useChatStore } from '@/lib/store/ChatStoreContext';

export type MainNavTab = 'workspace' | 'billing' | 'settings' | 'profile' | 'contact';

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
  onCreateProject?: () => void;
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
}) => {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { globalUnreadCount, activeAppId, aiEnabledByChannel } = useChatStore();
  const isGlobalAiActive = activeAppId ? aiEnabledByChannel[activeAppId] : false;

  const navItemsRaw: { id: MainNavTab; label: string; icon: React.ReactNode, perm?: string, hideForEmployee?: boolean }[] = [
    { id: 'workspace', label: 'Workspace', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'billing', label: 'Billing Plans', icon: <CreditCard className="w-3.5 h-3.5" />, hideForEmployee: true },
    { id: 'settings', label: 'Bot Settings', icon: <Settings className="w-3.5 h-3.5" />, perm: 'modify_settings' },
    { id: 'profile', label: 'Profile', icon: <User className="w-3.5 h-3.5" /> },
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

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full max-w-full min-w-0 bg-white dark:bg-[#1A1D23] border-b border-[#DFDFD4] dark:border-[#2E333D] px-2.5 sm:px-6 py-2 sm:py-2.5 grid grid-cols-3 items-center shadow-xs transition-colors shrink-0">
      {/* Brand Emblem */}
      <div 
        onClick={() => onSelectTab('workspace')}
        className="flex items-center gap-2 sm:gap-2.5 select-none cursor-pointer group min-w-0 shrink justify-self-start"
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#EB6708] to-[#FB9B3C] flex items-center justify-center font-black text-white text-xs sm:text-sm shadow-md group-hover:scale-105 transition-transform shrink-0">
          CF
        </div>
        <div className="min-w-0">
          <h1 className="font-black text-xs sm:text-base text-[#1B6648] dark:text-emerald-400 tracking-tight flex items-center gap-1 sm:gap-1.5 leading-tight truncate">
            Chatbot Farm <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#1B6648]/10 text-[#1B6648] dark:bg-emerald-950/40 dark:text-emerald-400">SAAS</span>
          </h1>
          <p className="hidden xl:block text-[11px] text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Algerian Omnichannel & Darija AI</p>
        </div>
      </div>

      {/* Center Nav Tabs with Framer Motion Sliding Pill */}
      <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 p-1 bg-[#ECECE2]/70 dark:bg-black/40 rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] relative shrink-0 justify-self-center">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
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
              <span className="inline lg:hidden">{item.id === 'billing' ? 'Billing' : item.id === 'settings' ? 'Settings' : item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right User & Dark Mode Actions */}
      <div className="flex items-center gap-1.5 sm:gap-4 relative shrink-0 justify-self-end" ref={dropdownRef}>
        
        {/* Global AI Toggle & Notification Badge */}
        <div className="flex items-center gap-3 mr-2 bg-gray-50 dark:bg-neutral-800/50 px-3 py-1.5 rounded-2xl border border-[#DFDFD4] dark:border-neutral-700 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {globalUnreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[9px] font-bold text-white shadow-sm">
                  {globalUnreadCount > 99 ? '99+' : globalUnreadCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 hidden sm:inline-block">AI Agent</span>
          </div>
          <button
            type="button"
            onClick={() => onToggleAi && onToggleAi(activeAppId)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 cursor-pointer shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-400/40 hover:scale-105 ${
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
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#1B6648] to-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-sm">
                  {currentUser.avatar || currentUser.name[0]?.toUpperCase() || 'M'}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" />
              </div>
              <div className="hidden lg:block text-left text-xs">
                <span className="font-bold text-[#1B1B1B] dark:text-gray-200 dark:text-white block max-w-[110px] truncate leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block leading-tight">
                  Verified Merchant
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
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#1A1D23] border border-[#DFDFD4] dark:border-[#2E333D] shadow-xl p-2 z-50 text-xs space-y-1"
                >
                  {/* User Info Header */}
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-neutral-800 space-y-1">
                    <p className="font-bold text-sm text-[#1B1B1B] dark:text-gray-200 dark:text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">
                      {currentUser.email}
                    </p>
                    <div className="pt-1 flex items-center gap-1 text-[10px] text-[#1B6648] dark:text-emerald-400 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{currentUser.plan || 'Enterprise DZ Pro'}</span>
                    </div>
                  </div>


                  <div className="border-t border-gray-100 dark:border-neutral-800 my-1" />
                  
                  {/* Workspace Switcher */}
                  <div className="px-2 pt-1 pb-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">Workspaces</p>
                    <div className="max-h-32 overflow-y-auto custom-scrollbar pr-1 space-y-0.5">
                      {projects && projects.map((p: any) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            onSelectProject?.(p.id);
                            setIsProfileMenuOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 text-xs font-bold rounded-lg flex items-center justify-between transition-colors ${activeProjectId === p.id ? 'bg-[#EB6708]/10 text-[#EB6708]' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
                        >
                          <span className="truncate pr-2">{p.name}</span>
                          {activeProjectId === p.id && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        onCreateProject?.();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 mt-1 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[#EB6708] hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <span className="w-4 h-4 rounded bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-sm leading-none shrink-0 pb-0.5">+</span>
                      Create Burner Project
                    </button>
                  </div>

                  <div className="border-t border-gray-100 dark:border-neutral-800 my-1" />

                  {/* Team Button */}
                  {(!isEmployee || currentUser?.permissions?.modify_settings) && (
                    <button
                      onClick={() => {
                        onOpenTeamModal?.();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-[#ECECE2]/60 dark:hover:bg-neutral-800 text-left font-bold flex items-center gap-2 transition-colors cursor-pointer text-gray-800 dark:text-gray-200"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span>Manage Team & Permissions</span>
                    </button>
                  )}

                  {/* Navigation Shortcuts */}
                  <button
                    onClick={() => {
                      onSelectTab('profile');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-[#ECECE2]/60 dark:hover:bg-neutral-800 text-left font-bold flex items-center gap-2 transition-colors cursor-pointer text-gray-800 dark:text-gray-200"
                  >
                    <User className="w-3.5 h-3.5 text-[#1B6648] dark:text-emerald-400" />
                    <span>View Full Profile & Invoices</span>
                  </button>

                  {(!isEmployee || currentUser?.permissions?.modify_settings) && (
                    <button
                      onClick={() => {
                        onSelectTab('settings');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-[#ECECE2]/60 dark:hover:bg-neutral-800 text-left font-bold flex items-center gap-2 transition-colors cursor-pointer text-gray-800 dark:text-gray-200"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#EB6708]" />
                      <span>Bot Settings</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onSelectTab('contact');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-[#ECECE2]/60 dark:hover:bg-neutral-800 text-left font-bold flex items-center gap-2 transition-colors cursor-pointer text-gray-800 dark:text-gray-200"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-blue-500" />
                    <span>Contact Support Center</span>
                  </button>

                  <div className="border-t border-gray-100 dark:border-neutral-800 my-1" />

                  {/* Log Out Button */}
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-left font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out (Déconnexion)</span>
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
          className="md:hidden p-1.5 sm:p-2 rounded-xl bg-[#ECECE2]/80 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 hover:scale-105 transition-all shadow-xs cursor-pointer ml-0.5 sm:ml-1"
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
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-xs text-[#1B1B1B] dark:text-gray-200 dark:text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-gray-500 font-mono truncate">{currentUser.email}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1B6648]/10 text-[#1B6648] dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">
                    {currentUser.plan || 'Pro'}
                  </span>
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
  );
};
