"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';

function SortableColumn({ id, children, activeThemeColor, onContextMenu }: { id: string, children: (dragHandleProps: any) => React.ReactNode, activeThemeColor: string, onContextMenu?: (e: React.MouseEvent) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  // Enforce strictly horizontal drag by nullifying the Y translation
  const horizontalTransform = transform ? { ...transform, y: 0 } : null;

  const style = {
    transform: CSS.Translate.toString(horizontalTransform),
    transition: isDragging ? 'none' : transition,
    opacity: 1,
    zIndex: isDragging ? 9999 : 1,
    height: '100%',
  } as React.CSSProperties;

  return (
    <div 
      ref={setNodeRef} 
      style={{ ...style, '--theme-color': activeThemeColor } as React.CSSProperties} 
      onContextMenu={(e) => {
        if (!e.defaultPrevented) {
          e.preventDefault();
          onContextMenu && onContextMenu(e);
        }
      }}
      className={`h-full w-full relative sortable-column-container overflow-hidden rounded-3xl group ${isDragging ? 'shadow-2xl z-[9999]' : ''}`}
    >
      <div className="absolute inset-0 opacity-0 pointer-events-none column-collapsed-bg touch-none" style={{ backgroundColor: 'var(--theme-color)', zIndex: 50, borderRadius: 'inherit' }}></div>
      {/* Hide scrollbars globally on the column content during drag to prevent jitter */}
      <div className={`h-full w-full column-main-content ${isDragging ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`}>
        {/* Pass grab/grabbing cursors via dragHandleProps. Note: buttons inside should override cursor to default/pointer */}
        {children({ 
          ...attributes, 
          ...listeners, 
          style: { touchAction: 'none' },
          className: isDragging ? "cursor-grabbing touch-none select-none" : "cursor-grab active:cursor-grabbing touch-none select-none" 
        })}
      </div>
      
      {/* Icon only view */}
      <div className="absolute inset-0 hidden column-icon-only items-center justify-center bg-white dark:bg-[#1A1D23] border border-[#DFDFD4] dark:border-[#2E333D] rounded-3xl touch-none cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        {id === 'switcher' ? <SettingsIcon className="w-8 h-8 text-emerald-600" /> : id === 'chat' ? <MessageSquare className="w-8 h-8" style={{color: activeThemeColor}} /> : <Users className="w-8 h-8 text-blue-500" />}
      </div>
      
      
    </div>
  );
}


import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Navbar, MainNavTab } from '@/components/layout/Navbar';
import { AppSwitcherColumn } from '@/components/workspace/AppSwitcherColumn';
import { MiddleChatColumn } from '@/components/workspace/MiddleChatColumn';
import { RightHubColumn } from '@/components/workspace/RightHubColumn';
import { AddChannelModal } from '@/components/workspace/AddChannelModal';
import { AuthModal } from '@/components/workspace/AuthModal';
import { TeamManagerModal } from '@/components/workspace/TeamManagerModal';
import { useSession, signOut } from "next-auth/react";
import { AiActivationModal } from '@/components/workspace/AiActivationModal';
import { ConnectChannelModal } from '@/components/workspace/ConnectChannelModal';
import { PanelContextMenu, LayoutPreset, SavedLayout } from '@/components/workspace/PanelContextMenu';
import { BillingView } from '@/components/views/BillingView';
import { SettingsView } from '@/components/views/SettingsView';
import { ProfileContactView } from '@/components/views/ProfileContactView';
import { ContactView } from '@/components/views/ContactView';
import { MOCK_CONTACTS_BY_APP, getContactsForApp, APP_GRADIENT_THEMES, getCustomAppTheme } from '@/lib/mock_chats';
import { supabase } from '@/lib/supabaseClient';
import { SoundManager } from '@/lib/SoundManager';
import { ChatStoreProvider, useChatStore } from '@/lib/store/ChatStoreContext';
import { ImageLightbox } from '@/components/workspace/ImageLightbox';
import { UserProfileModal } from '@/components/workspace/UserProfileModal';
import { MessageSquare, Users, BarChart2, Settings as SettingsIcon, Plus } from 'lucide-react';
import {
  WhatsAppIcon,
  InstagramIcon,
  TelegramIcon,
  MessengerIcon,
  StorefrontIcon,
  GmailIcon,
  SignalIcon,
  XIcon,
  GoogleMessagesIcon,
  GoogleChatIcon,
  GoogleVoiceIcon,
  DiscordIcon,
  SlackIcon,
  LinkedInIcon,
  IrcIcon,
  MatrixIcon
} from '@/components/icons/BrandIcons';

function HomeContent() {
  const [columnOrder, setColumnOrder] = useState(['switcher', 'chat', 'hub']);
  const [detachedTabs, setDetachedTabs] = useState<string[]>([]);
  const [activeDragColId, setActiveDragColId] = useState<string | null>(null);

  const pendingPrefs = useRef<any>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const groupRef = useRef<any>(null);

    const handleDetachTab = (tabId: string) => {
    setDetachedTabs(prev => {
      // No longer persist detachedTabs — session-only to prevent refresh crash
      return [...prev, tabId];
    });
    setColumnOrder(prev => {
      if (prev.includes(tabId)) return prev;
      return [...prev, tabId];
      // Don't sync the detached columnOrder to Supabase — it causes refresh crashes
    });
  };

  const handleReattachTab = (tabId: string) => {
    setDetachedTabs(prev => prev.filter(t => t !== tabId));
    setColumnOrder(prev => {
      const next = prev.filter(c => c !== tabId);
      // Only sync core columns back to Supabase
      const CORE_COLS = new Set(['switcher', 'chat', 'hub']);
      debouncedSyncPreferences({ columnOrder: next.filter(c => CORE_COLS.has(c)) });
      return next;
    });
  };

  const syncPreferences = async () => {
    const currentPending = { ...pendingPrefs.current };
    pendingPrefs.current = {};
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Only sync if real Supabase user
    
    const existingPrefs = user.user_metadata?.preferences || {};
    const updatedPrefs = { ...existingPrefs, ...currentPending };
    
    await supabase.auth.updateUser({
      data: { preferences: updatedPrefs }
    });
  };

  const debouncedSyncPreferences = (newPrefs: any) => {
    pendingPrefs.current = { ...pendingPrefs.current, ...newPrefs };
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      syncPreferences();
    }, 1500);
  };

  const applyUserPreferences = (user: any) => {
    const prefs = user?.user_metadata?.preferences;
    if (!prefs) return;
    if (prefs.columnOrder && Array.isArray(prefs.columnOrder)) {
      // Strip detached tab IDs (analytics/settings) from server prefs - keep session active detached tabs
      const CORE_COLS = new Set(['switcher', 'chat', 'hub']);
      const coreOrder = Array.from(new Set<string>(prefs.columnOrder.filter((c: string) => CORE_COLS.has(c))));
      
      setColumnOrder((prev) => {
        const activeDetached = prev.filter((c) => !CORE_COLS.has(c));
        if (coreOrder.length !== 3) {
          return ['switcher', 'chat', 'hub', ...activeDetached];
        }
        return [...coreOrder, ...activeDetached];
      });
    }
    if (prefs.pinnedApps && Array.isArray(prefs.pinnedApps)) {
      setPinnedApps(prefs.pinnedApps);
      localStorage.setItem(getStorageKey('cf_pinned_apps'), JSON.stringify(prefs.pinnedApps));
    }
    if (prefs.connectedApps && Array.isArray(prefs.connectedApps)) {
      setConnectedApps((prev) => new Set([...Array.from(prev), ...prefs.connectedApps]));
    }
    // detachedTabs intentionally NOT restored — always start fresh each session
    if (prefs.panelSizes) {
      localStorage.setItem(getStorageKey('cf_panel_sizes'), JSON.stringify(prefs.panelSizes));
      Object.entries(prefs.panelSizes).forEach(([k, v]) => {
        localStorage.setItem(k, v as string);
      });
      if (groupRef.current) {
        try {
          if (Array.isArray(prefs.panelSizes)) {
            // Legacy array format - slice to correct visible items to prevent index crash
            const expectedLength = isRightHubCollapsed ? 2 : 3;
            const safeSizes = prefs.panelSizes.slice(0, expectedLength);
            const total = safeSizes.reduce((a: number, b: number) => a + b, 0);
            groupRef.current.setLayout(safeSizes.map((s: number) => (s / total) * 100));
          } else {
            const ALLOWED_CORE = new Set(['switcher', 'chat', 'hub']);
            const rawCols = prefs.columnOrder || columnOrder;
            const uniqueCols = Array.from(new Set<string>(rawCols.filter((c: string) => ALLOWED_CORE.has(c))));
            // Fallback to default if invalid
            const cols = (uniqueCols.length === 3 ? uniqueCols : ['switcher', 'chat', 'hub']).filter(c => !(c === 'hub' && isRightHubCollapsed));
            const arr = cols.map((c: string) => prefs.panelSizes[c] !== undefined ? prefs.panelSizes[c] : (c === 'switcher' ? 25 : c === 'chat' ? 45 : 30));
            const total = arr.reduce((a: number, b: number) => a + b, 0);
            const normalized = arr.map((s: number) => (s / total) * 100);
            groupRef.current.setLayout(normalized);
          }
        } catch {}
      }
    }
  };

  const panelStorage = {
    getItem: (name: string) => {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem(name);
    },
    setItem: (name: string, value: string) => {
      localStorage.setItem(name, value);
      
      const existingSizesStr = localStorage.getItem(getStorageKey('cf_panel_sizes')) || '{}';
      let existingSizes = {};
      try { existingSizes = JSON.parse(existingSizesStr); } catch {}
      
      const newSizes = { ...existingSizes, [name]: value };
      localStorage.setItem(getStorageKey('cf_panel_sizes'), JSON.stringify(newSizes));
      
      debouncedSyncPreferences({ panelSizes: newSizes });
    }
  };

  const colSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 1 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleColDragStart = (event: any) => {
    const userPerms = currentUser?.user_metadata?.permissions || currentUser?.permissions;
    const isEmp = Boolean(currentUser?.workspace_owner_id);
    const isAdm = !isEmp || userPerms?.is_admin === true;
    if (!isAdm && userPerms?.can_edit_ui === false) return;

    setActiveDragColId(event.active.id);
    if (typeof document !== 'undefined') {
      document.body.classList.add('is-dragging');
    }
  };

  const handleColDragCancel = () => {
    setActiveDragColId(null);
    if (typeof document !== 'undefined') {
      document.body.classList.remove('is-dragging');
    }
  };

  useEffect(() => {
    if (activeDragColId) {
      document.body.classList.add('is-dragging');
    } else {
      document.body.classList.remove('is-dragging');
    }
    return () => {
      document.body.classList.remove('is-dragging');
    };
  }, [activeDragColId]);

  const handleColDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveDragColId(null);
    if (typeof document !== 'undefined') {
      document.body.classList.remove('is-dragging');
    }

    if (over && active.id !== over.id) {
      setColumnOrder((prev) => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const next = arrayMove(prev, oldIndex, newIndex);
        debouncedSyncPreferences({ columnOrder: next });

        // Restore correct sizes for the new layout array to prevent them from inheriting the wrong positional size
        setTimeout(() => {
          if (groupRef.current) {
            try {
              const stored = localStorage.getItem(getStorageKey('cf_panel_sizes'));
              if (stored) {
                const parsed = JSON.parse(stored);
                const visibleCols = next.filter(c => !(c === 'hub' && isRightHubCollapsed));
                const newSizes = visibleCols.map(colId => parsed[colId] !== undefined ? parsed[colId] : (colId === 'switcher' ? 25 : colId === 'chat' ? 45 : 30));
                const total = newSizes.reduce((a, b) => a + b, 0);
                const normalized = newSizes.map(s => (s / total) * 100);
                groupRef.current.setLayout(normalized);
              }
            } catch {}
          }
        }, 10);

        return next;
      });
    }
  };

  
  const { isRightHubCollapsed, activeProfileContact, activeProfileAppId, closeProfile } = useChatStore();
  const visibleColumns = columnOrder.filter(c => !(c === 'hub' && isRightHubCollapsed));
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<MainNavTab>('workspace');
  const [selectedAppId, setSelectedAppId] = useState('whatsapp');
  const [themeVersion, setThemeVersion] = useState(0);

  useEffect(() => {
    const handleThemeChange = () => setThemeVersion(v => v + 1);
    window.addEventListener('app_theme_changed', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);
    return () => {
      window.removeEventListener('app_theme_changed', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  const activeThemeColor = getCustomAppTheme(selectedAppId)?.solidColor || APP_GRADIENT_THEMES[selectedAppId]?.solidColor || '#1B6648';
  const [selectedContactPath, setSelectedContactPath] = useState<string[]>([]);
  const [isLinked, setIsLinked] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileHubTab, setMobileHubTab] = useState<'chat' | 'contacts' | 'analytics' | 'settings'>('chat');
  
  // AI auto-reply toggle state - OFF BY DEFAULT for all channels as requested
  const [aiEnabledByChannel, setAiEnabledByChannel] = useState<Record<string, boolean>>({
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
  });

  // Track whether user has active AI subscription, BYOK key, or Sandbox trial active
  const [hasAiAccess, setHasAiAccess] = useState(false);

  // Track which apps the user has connected (persisted in localStorage per user)
  const [connectedApps, setConnectedApps] = useState<Set<string>>(new Set<string>());
  const [pinnedApps, setPinnedApps] = useState<string[]>(['whatsapp', 'telegram', 'gmail']);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('default');
  const activeProjectIdRef = useRef(activeProjectId);

  const getStorageKey = (key: string) => {
    if (key === 'cf_user_session' || key === 'cf_theme_mode' || key === 'cf_projects') return key;
    return activeProjectIdRef.current === 'default' ? key : key + '_' + activeProjectIdRef.current;
  };

  useEffect(() => {
    activeProjectIdRef.current = activeProjectId;
  }, [activeProjectId]);

  // Panel Layout Context Menu & Custom Layout Presets
  const [panelContextMenu, setPanelContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    targetColId?: string;
  } | null>(null);

  const [savedCustomLayouts, setSavedCustomLayouts] = useState<SavedLayout[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('cf_user_saved_layouts');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const handleResetLayoutAll = () => {
    const defaultOrder = ['switcher', 'chat', 'hub'];
    const defaultSizes: Record<string, number> = {
      switcher: 25,
      chat: isRightHubCollapsed ? 75 : 45,
      hub: 30,
    };
    setColumnOrder(defaultOrder);
    localStorage.setItem(getStorageKey('cf_panel_sizes'), JSON.stringify(defaultSizes));
    debouncedSyncPreferences({ columnOrder: defaultOrder, panelSizes: defaultSizes });
    setTimeout(() => {
      if (groupRef.current) {
        try {
          const visible = defaultOrder.filter(c => !(c === 'hub' && isRightHubCollapsed));
          const arr = visible.map(c => defaultSizes[c] || 33.3);
          const total = arr.reduce((a, b) => a + b, 0);
          groupRef.current.setLayout(arr.map(s => (s / total) * 100));
        } catch {}
      }
    }, 50);
  };

  const handleResetLayoutSizeOnly = () => {
    const defaultSizes: Record<string, number> = {
      switcher: 25,
      chat: isRightHubCollapsed ? 75 : 45,
      hub: 30,
    };
    localStorage.setItem(getStorageKey('cf_panel_sizes'), JSON.stringify(defaultSizes));
    debouncedSyncPreferences({ panelSizes: defaultSizes });
    setTimeout(() => {
      if (groupRef.current) {
        try {
          const visible = columnOrder.filter(c => !(c === 'hub' && isRightHubCollapsed));
          const arr = visible.map(c => defaultSizes[c] || 33.3);
          const total = arr.reduce((a, b) => a + b, 0);
          groupRef.current.setLayout(arr.map(s => (s / total) * 100));
        } catch {}
      }
    }, 50);
  };

  const handleResetLayoutPositionOnly = () => {
    const defaultOrder = ['switcher', 'chat', 'hub'];
    setColumnOrder(defaultOrder);
    debouncedSyncPreferences({ columnOrder: defaultOrder });
    setTimeout(() => {
      if (groupRef.current) {
        try {
          const stored = localStorage.getItem(getStorageKey('cf_panel_sizes'));
          if (stored) {
            const parsed = JSON.parse(stored);
            if (!Array.isArray(parsed)) {
              const visible = defaultOrder.filter(c => !(c === 'hub' && isRightHubCollapsed));
              const arr = visible.map(c => parsed[c] !== undefined ? parsed[c] : (c === 'switcher' ? 25 : c === 'chat' ? 45 : 30));
              const total = arr.reduce((a, b) => a + b, 0);
              groupRef.current.setLayout(arr.map(s => (s / total) * 100));
            }
          }
        } catch {}
      }
    }, 50);
  };

  const handleApplyLayoutPreset = (preset: { columnOrder: string[]; panelSizes: Record<string, number> }) => {
    setColumnOrder(preset.columnOrder);
    localStorage.setItem(getStorageKey('cf_panel_sizes'), JSON.stringify(preset.panelSizes));
    debouncedSyncPreferences({ columnOrder: preset.columnOrder, panelSizes: preset.panelSizes });
    setTimeout(() => {
      if (groupRef.current) {
        try {
          const visible = preset.columnOrder.filter(c => !(c === 'hub' && isRightHubCollapsed));
          const arr = visible.map(c => preset.panelSizes[c] !== undefined ? preset.panelSizes[c] : 33.3);
          const total = arr.reduce((a, b) => a + b, 0);
          groupRef.current.setLayout(arr.map(s => (s / total) * 100));
        } catch {}
      }
    }, 50);
  };

  const handleSaveCurrentLayout = (name: string) => {
    let currentSizes: Record<string, number> = {};
    try {
      const stored = localStorage.getItem(getStorageKey('cf_panel_sizes'));
      if (stored) currentSizes = JSON.parse(stored);
    } catch {}

    const newLayout: SavedLayout = {
      id: 'layout_' + Date.now(),
      name,
      createdAt: Date.now(),
      columnOrder: [...columnOrder],
      panelSizes: currentSizes,
    };
    const updated = [newLayout, ...savedCustomLayouts];
    setSavedCustomLayouts(updated);
    try {
      localStorage.setItem('cf_user_saved_layouts', JSON.stringify(updated));
    } catch {}
  };

  const handleDeleteSavedLayout = (id: string) => {
    const updated = savedCustomLayouts.filter(l => l.id !== id);
    setSavedCustomLayouts(updated);
    try {
      localStorage.setItem('cf_user_saved_layouts', JSON.stringify(updated));
    } catch {}
  };

  const handleCopyLayout = () => {
    let currentSizes: Record<string, number> = {};
    try {
      const stored = localStorage.getItem(getStorageKey('cf_panel_sizes'));
      if (stored) currentSizes = JSON.parse(stored);
    } catch {}
    const payload = JSON.stringify({
      version: 1,
      type: 'chatbot-farm-layout',
      columnOrder,
      panelSizes: currentSizes,
    }, null, 2);
    try {
      navigator.clipboard.writeText(payload);
    } catch {}
  };

  const handlePasteLayout = (text: string): boolean => {
    try {
      const parsed = JSON.parse(text);
      if (parsed && (Array.isArray(parsed.columnOrder) || typeof parsed.panelSizes === 'object')) {
        const order = Array.isArray(parsed.columnOrder) && parsed.columnOrder.length > 0 ? parsed.columnOrder : ['switcher', 'chat', 'hub'];
        const sizes = parsed.panelSizes && typeof parsed.panelSizes === 'object' ? parsed.panelSizes : { switcher: 25, chat: 45, hub: 30 };
        handleApplyLayoutPreset({ columnOrder: order, panelSizes: sizes });
        return true;
      }
    } catch {}
    return false;
  };

  const handleMaximizeCol = (colId: string) => {
    const visible = columnOrder.filter(c => !(c === 'hub' && isRightHubCollapsed));
    const others = visible.filter(c => c !== colId);
    const otherShare = others.length > 0 ? (24 / others.length) : 0;
    const newSizes: Record<string, number> = { [colId]: 76 };
    others.forEach(c => { newSizes[c] = otherShare; });
    
    localStorage.setItem(getStorageKey('cf_panel_sizes'), JSON.stringify(newSizes));
    debouncedSyncPreferences({ panelSizes: newSizes });
    if (groupRef.current) {
      try {
        const arr = visible.map(c => newSizes[c]);
        groupRef.current.setLayout(arr);
      } catch {}
    }
  };

  const handleMoveCol = (colId: string, direction: 'left' | 'right') => {
    setColumnOrder(prev => {
      const index = prev.indexOf(colId);
      if (index === -1) return prev;
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = arrayMove(prev, index, targetIndex);
      debouncedSyncPreferences({ columnOrder: next });
      return next;
    });
  };

  const restoreAndSyncConnectedApps = useCallback((u: any): string[] => {
    if (!u) return [];

    const userAppsKey = `cf_connected_apps_${u.id}`;
    const allFound = new Set<string>();

    // 1. Check user-specific key
    try {
      const userApps = localStorage.getItem(userAppsKey) || localStorage.getItem(getStorageKey(userAppsKey));
      if (userApps) {
        const parsed = JSON.parse(userApps);
        if (Array.isArray(parsed)) parsed.forEach(a => allFound.add(a));
      }
    } catch {}

    // 2. Check user preferences from Supabase metadata or user payload
    const userMetadataPrefs = u?.user_metadata?.preferences || u?.user_metadata;
    if (userMetadataPrefs?.connectedApps && Array.isArray(userMetadataPrefs.connectedApps)) {
      userMetadataPrefs.connectedApps.forEach((app: string) => allFound.add(app));
    }
    if (userMetadataPrefs?.connected_apps && Array.isArray(userMetadataPrefs.connected_apps)) {
      userMetadataPrefs.connected_apps.forEach((app: string) => allFound.add(app));
    }
    if (u?.connectedApps && Array.isArray(u.connectedApps)) {
      u.connectedApps.forEach((app: string) => allFound.add(app));
    }

    // 3. Check global and local session keys
    try {
      const globalApps: string[] = JSON.parse(localStorage.getItem('cf_connected_apps') || '[]');
      if (Array.isArray(globalApps)) globalApps.forEach(a => allFound.add(a));
    } catch {}
    try {
      const adminApps: string[] = JSON.parse(localStorage.getItem('cf_connected_apps_admin_local') || '[]');
      if (Array.isArray(adminApps)) adminApps.forEach(a => allFound.add(a));
    } catch {}

    // 4. Telegram credentials persistence
    const tgSession = localStorage.getItem('cf_telegram_session') || localStorage.getItem(getStorageKey('cf_telegram_session')) || localStorage.getItem('cf_telegram_token');
    if (tgSession) allFound.add('telegram');

    // 5. Discord credentials persistence (strictly require token or account)
    const discordToken = localStorage.getItem('cf_discord_token') || localStorage.getItem('cf_discord_account') || localStorage.getItem(getStorageKey('cf_discord_token'));
    if (discordToken) {
      allFound.add('discord');
    } else {
      allFound.delete('discord');
    }

    // 6. WhatsApp credentials persistence
    const waUnlinked = localStorage.getItem('cf_whatsapp_unlinked') === 'true' || localStorage.getItem(getStorageKey('cf_whatsapp_unlinked')) === 'true';
    if (!waUnlinked) {
      const waLinked = localStorage.getItem('cf_whatsapp_linked') || localStorage.getItem('cf_whatsapp_number') || localStorage.getItem('cf_whatsapp_creds') || localStorage.getItem(getStorageKey('cf_whatsapp_number'));
      if (waLinked) allFound.add('whatsapp');
    }

    // 7. Google Workspace auto-link
    const isGoogleUser = u.provider === 'google' || u.provider === 'oauth' || (u.email && u.email.endsWith('@gmail.com'));
    if (isGoogleUser) {
      allFound.add('gmail');
      allFound.add('google_chat');
    }

    // 8. Viber & Snapchat persistence
    const viberAcc = localStorage.getItem('cf_viber_account') || localStorage.getItem('cf_viber_token') || localStorage.getItem('cf_viber_phone');
    if (viberAcc) allFound.add('viber');
    const snapAcc = localStorage.getItem('cf_snapchat_account') || localStorage.getItem('cf_snapchat_token') || localStorage.getItem('cf_snapchat_username') || localStorage.getItem('cf_snapchat_phone');
    if (snapAcc) allFound.add('snapchat');

    // 9. Respect explicit unlinks across all channels
    ['whatsapp', 'whatsapp_2', 'telegram', 'signal', 'instagram', 'messenger', 'discord', 'gmail'].forEach((appKey) => {
      if (localStorage.getItem(`cf_${appKey}_unlinked`) === 'true' || localStorage.getItem(getStorageKey(`cf_${appKey}_unlinked`)) === 'true') {
        allFound.delete(appKey);
      }
    });

    const savedApps = Array.from(allFound);

    try {
      localStorage.setItem(userAppsKey, JSON.stringify(savedApps));
      localStorage.setItem(getStorageKey(userAppsKey), JSON.stringify(savedApps));
      localStorage.setItem(getStorageKey('cf_connected_apps'), JSON.stringify(savedApps));
      localStorage.setItem('cf_connected_apps', JSON.stringify(savedApps));
    } catch {}

    if (savedApps.length > 0) {
      setConnectedApps(new Set<string>(savedApps));
      debouncedSyncPreferences({ connectedApps: savedApps });
    }

    return savedApps;
  }, []);

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem('cf_projects');
      if (storedProjects) {
        const parsed = JSON.parse(storedProjects).map((p: any) => ({
          ...p,
          icon: p.icon || '🏢',
          color: p.color || '#1B6648',
        }));
        setProjects(parsed);
      } else {
        const defaultProjects = [{ id: 'default', name: 'Main Workspace', icon: '🏢', color: '#1B6648', role: 'owner' }];
        setProjects(defaultProjects);
        localStorage.setItem('cf_projects', JSON.stringify(defaultProjects));
      }
    } catch {}
  }, []);

  const handleCreateProject = (customData?: { name?: string; icon?: string; color?: string }) => {
    const id = 'proj_' + Date.now();
    const newProj = {
      id,
      name: customData?.name || ('Workspace ' + (projects.length + 1)),
      icon: customData?.icon || '🏢',
      color: customData?.color || '#1B6648',
      role: 'owner',
    };
    const nextProjects = [...projects, newProj];
    setProjects(nextProjects);
    localStorage.setItem('cf_projects', JSON.stringify(nextProjects));
    
    // Inherit main account emails
    const inheritEmail = (key: string) => {
      const val = localStorage.getItem(key);
      if (val) localStorage.setItem(key + '_' + id, val);
    };
    inheritEmail('cf_gmail_account');
    inheritEmail('cf_google_chat_account');
    
    // Also copy connected apps so it shows up as connected
    const mainApps = localStorage.getItem('cf_connected_apps');
    if (mainApps) {
      try {
        const parsed = JSON.parse(mainApps);
        const inheritedApps = parsed.filter((app: string) => ['gmail', 'google_chat'].includes(app));
        localStorage.setItem('cf_connected_apps_' + id, JSON.stringify(inheritedApps));
      } catch {}
    }
    
    handleSelectProject(id);
  };

  const handleDeleteProject = (projectId: string) => {
    if (projects.length <= 1) return;
    const nextProjects = projects.filter(p => p.id !== projectId);
    setProjects(nextProjects);
    try {
      localStorage.setItem('cf_projects', JSON.stringify(nextProjects));
    } catch {}
    if (activeProjectId === projectId) {
      handleSelectProject(nextProjects[0].id);
    }
  };

  const handleUpdateUser = (updated: { name: string; avatar: string }) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      name: updated.name,
      avatar: updated.avatar,
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem(getStorageKey('cf_user_session'), JSON.stringify(updatedUser));
    } catch {}
  };

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    activeProjectIdRef.current = projectId;
    
    const loadState = (key: string, setter: any, defaultVal: any) => {
      const stored = localStorage.getItem(getStorageKey(key));
      if (stored) {
        try { setter(JSON.parse(stored)); } catch { setter(defaultVal); }
      } else {
        setter(defaultVal);
      }
    };
    
    loadState('cf_pinned_apps', setPinnedApps, ['whatsapp', 'telegram', 'gmail']);
    
    const storedApps = localStorage.getItem(getStorageKey('cf_connected_apps')) || localStorage.getItem('cf_connected_apps');
    if (storedApps) {
      try {
        const parsed = JSON.parse(storedApps);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConnectedApps(new Set(parsed));
        } else if (currentUser) {
          restoreAndSyncConnectedApps(currentUser);
        }
      } catch {
        if (currentUser) restoreAndSyncConnectedApps(currentUser);
      }
    } else if (currentUser) {
      restoreAndSyncConnectedApps(currentUser);
    }
    
    const storedLayout = localStorage.getItem(getStorageKey('cf_panel_sizes'));
    if (storedLayout && groupRef.current) {
      try {
        const parsed = JSON.parse(storedLayout);
        // Always derive a 3-item array from core columns only — never pass stale 4-item data
        const CORE = ['switcher', 'chat', 'hub'].filter(c => !(c === 'hub' && isRightHubCollapsed));
        const arr = Array.isArray(parsed)
          ? parsed.slice(0, CORE.length)
          : CORE.map(col => parsed[col] ?? (col === 'switcher' ? 25 : col === 'chat' ? 45 : 30));
        const total = arr.reduce((a: number, b: number) => a + b, 0);
        groupRef.current.setLayout(arr.map((s: number) => (s / total) * 100));
      } catch {}
    }
  };

    const [isClientMounted, setIsClientMounted] = useState(false);
  const [liveWhatsAppChats, setLiveWhatsAppChats] = useState<any[]>([]);

  // Connect channel modal
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [connectingAppId, setConnectingAppId] = useState<string>('whatsapp');

  // Real-time finger tracking drag physics for mobile channel sliding
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragDirectionLocked = useRef<'none' | 'horizontal' | 'vertical'>('none');

  const channelIds = [
    'whatsapp',
    'whatsapp_2',
    'telegram',
    'signal',
    'instagram',
    'messenger',
    'x_twitter',
    'google_messages',
    'google_chat',
    'google_voice',
    'discord',
    'slack',
    'linkedin',
    'irc',
    'matrix',
    'web_widget',
    'gmail'
  ];
  const channelDisplayNames: Record<string, string> = {
    whatsapp: 'WhatsApp Main',
    whatsapp_2: 'WhatsApp Line #2',
    telegram: 'Telegram',
    signal: 'Signal',
    instagram: 'Instagram',
    messenger: 'Messenger',
    x_twitter: 'X (Twitter)',
    google_messages: 'Google Messages',
    google_chat: 'Google Chat',
    google_voice: 'Google Voice',
    discord: 'Discord',
    slack: 'Slack',
    linkedin: 'LinkedIn',
    irc: 'IRC',
    matrix: 'Matrix Protocol',
    web_widget: 'Storefront',
    gmail: 'Gmail',
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    dragDirectionLocked.current = 'none';
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current || e.touches.length !== 1) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartPos.current.x;
    const deltaY = currentY - touchStartPos.current.y;

    if (dragDirectionLocked.current === 'none') {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 7) {
        dragDirectionLocked.current = 'vertical';
        return;
      }
      if (Math.abs(deltaX) > 7) {
        dragDirectionLocked.current = 'horizontal';
        setIsDragging(true);
      }
    }

    if (dragDirectionLocked.current === 'horizontal') {
      const currentIdx = activeChannelIds.indexOf(selectedAppId);
      let offset = deltaX;
      // Rubber-band dampening if dragging past ends
      if ((currentIdx === 0 && deltaX > 0) || (currentIdx === activeChannelIds.length - 1 && deltaX < 0)) {
        offset = deltaX * 0.22;
      }
      setDragOffset(offset);
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartPos.current) return;

    if (dragDirectionLocked.current === 'horizontal' && isDragging) {
      const currentIdx = activeChannelIds.indexOf(selectedAppId);
      const threshold = 48;

      if (dragOffset < -threshold && currentIdx < activeChannelIds.length - 1) {
        handleSelectApp(activeChannelIds[currentIdx + 1]);
        setMobileHubTab('chat');
      } else if (dragOffset > threshold && currentIdx > 0) {
        handleSelectApp(activeChannelIds[currentIdx - 1]);
        setMobileHubTab('chat');
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    touchStartPos.current = null;
    dragDirectionLocked.current = 'none';
  };

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [appLastActivity, setAppLastActivity] = useState<Record<string, number>>({});

  useEffect(() => {
    SoundManager.initialize();
    const stored = localStorage.getItem(getStorageKey('cf_pinned_apps'));
    if (stored) {
      try {
        setPinnedApps(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const handlePinApp = (appId: string) => {
    setPinnedApps(prev => {
      if (prev.includes(appId)) return prev;
      const next = [...prev, appId];
      localStorage.setItem(getStorageKey('cf_pinned_apps'), JSON.stringify(next));
      debouncedSyncPreferences({ pinnedApps: next });
      return next;
    });
  };

  const handleUnpinApp = (appId: string) => {
    setPinnedApps(prev => {
      const next = prev.filter(id => id !== appId);
      localStorage.setItem(getStorageKey('cf_pinned_apps'), JSON.stringify(next));
      debouncedSyncPreferences({ pinnedApps: next });
      return next;
    });
  };

  const handleSetPinnedApps = (newOrder: string[]) => {
    setPinnedApps(newOrder);
    localStorage.setItem(getStorageKey('cf_pinned_apps'), JSON.stringify(newOrder));
    debouncedSyncPreferences({ pinnedApps: newOrder });
  };

  const handleReorderApps = (sourceId: string, targetId: string) => {
    setPinnedApps(prev => {
      const next = [...prev];
      const sourceIndex = next.indexOf(sourceId);
      const targetIndex = next.indexOf(targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;
      
      next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, sourceId);
      
      localStorage.setItem(getStorageKey('cf_pinned_apps'), JSON.stringify(next));
      debouncedSyncPreferences({ pinnedApps: next });
      return next;
    });
  };
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [targetAiChannel, setTargetAiChannel] = useState<string>('whatsapp');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authModalNotice, setAuthModalNotice] = useState<string | null>(null);

  const userPermissions = currentUser?.user_metadata?.permissions || currentUser?.permissions;
  const isEmployee = Boolean(currentUser?.workspace_owner_id);
  const isAdmin = !isEmployee || userPermissions?.is_admin === true;

  const allowedProjects = useMemo(() => {
    if (isAdmin || userPermissions?.can_access_all_workspaces !== false) {
      return projects;
    }
    const assigned = userPermissions?.assigned_workspaces || [];
    const filtered = projects.filter(p => assigned.includes(p.id));
    return filtered.length > 0 ? filtered : projects.slice(0, 1);
  }, [isAdmin, userPermissions, projects]);

  useEffect(() => {
    if (allowedProjects.length > 0 && !allowedProjects.some(p => p.id === activeProjectId)) {
      handleSelectProject(allowedProjects[0].id);
    }
  }, [allowedProjects, activeProjectId]);

  const canEditUi = isAdmin || userPermissions?.can_edit_ui !== false;
  const canManageChannels = isAdmin || userPermissions?.can_manage_channels !== false;
  const canSendMessages = isAdmin || userPermissions?.can_send_messages !== false;
  const canMakeCalls = isAdmin || userPermissions?.can_make_calls !== false;

  const baseChannelIds = Array.from(new Set([...pinnedApps, ...Array.from(connectedApps)]));
  const activeChannelIds = (!isAdmin && userPermissions?.assigned_channels && userPermissions.assigned_channels.length > 0)
    ? baseChannelIds.filter(id => userPermissions.assigned_channels.includes(id))
    : baseChannelIds;

  const displayedConnectedApps = (!isAdmin && userPermissions?.assigned_channels && userPermissions.assigned_channels.length > 0)
    ? new Set(Array.from(connectedApps).filter(id => userPermissions.assigned_channels.includes(id)))
    : connectedApps;

  const displayedPinnedApps = (!isAdmin && userPermissions?.assigned_channels && userPermissions.assigned_channels.length > 0)
    ? pinnedApps.filter(id => userPermissions.assigned_channels.includes(id))
    : pinnedApps;

  // Column Resizing States
  const [leftColWidth, setLeftColWidth] = useState(300);
  const [rightColWidth, setRightColWidth] = useState(300);

  const startLeftResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = leftColWidth;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      requestAnimationFrame(() => {
        setLeftColWidth(Math.max(200, Math.min(600, startWidth + (moveEvent.pageX - startX))));
      });
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const startRightResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = rightColWidth;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      requestAnimationFrame(() => {
        setRightColWidth(Math.max(200, Math.min(600, startWidth - (moveEvent.pageX - startX))));
      });
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Restore saved session and persistent theme mode on initial render
  useEffect(() => {
    setIsClientMounted(true);
    try {
      // 1. Theme persistence: always preserved across refreshes, logouts and logins
      const savedTheme = localStorage.getItem(getStorageKey('cf_theme_mode'));
      if (savedTheme === 'dark') {
        setDarkMode(true);
      } else if (savedTheme === 'light') {
        setDarkMode(false);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDarkMode(true);
      }

      // 2. User session & Channel isolation
      let u: any = null;
      try {
        const savedUser = localStorage.getItem(getStorageKey('cf_user_session'));
        if (savedUser) u = JSON.parse(savedUser);
      } catch {}

      if (!u) {
        u = {
          id: 'admin_local',
          name: 'Store Owner',
          email: 'admin@chatbotfarm.local',
          provider: 'local',
          plan: 'Enterprise DZ Pro',
          verified: true,
          avatar: 'S',
        };
        localStorage.setItem(getStorageKey('cf_user_session'), JSON.stringify(u));
      }

      if (u) {
        setCurrentUser(u);

        // Load and synchronize connected apps scoped to this user
        const savedApps = restoreAndSyncConnectedApps(u);

        // Probe WhatsApp Evolution API on mount only if not unlinked
        const waIsUnlinked = localStorage.getItem('cf_whatsapp_unlinked') === 'true' || localStorage.getItem(getStorageKey('cf_whatsapp_unlinked')) === 'true';
        if (!waIsUnlinked && savedApps.includes('whatsapp')) {
          fetch('/api/channels/whatsapp/chats')
            .then((r) => r.json())
            .then((data) => {
              if (data.isLive && data.status === 'connected' && data.instance) {
                try {
                  if (data.instance.phone) {
                    localStorage.setItem(getStorageKey('cf_whatsapp_number'), data.instance.phone);
                    localStorage.setItem('cf_whatsapp_number', data.instance.phone);
                  }
                  localStorage.setItem(getStorageKey('cf_whatsapp_name'), data.instance.profileName || 'WhatsApp Business');
                  localStorage.setItem('cf_whatsapp_name', data.instance.profileName || 'WhatsApp Business');
                  localStorage.setItem('cf_whatsapp_linked', 'true');
                  localStorage.setItem(getStorageKey('cf_whatsapp_linked'), 'true');
                  window.dispatchEvent(new Event('storage'));
                } catch {}
                if (Array.isArray(data.chats) && data.chats.length > 0) {
                  const sorted = [...data.chats].sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
                  setLiveChatsByApp((prev) => ({
                    ...prev,
                    whatsapp: sorted
                  }));
                }
              } else if (!data.isLive || data.status === 'unlinked') {
                setConnectedApps((prev) => {
                  const next = new Set(prev);
                  next.delete('whatsapp');
                  return next;
                });
                setLiveChatsByApp((prev) => ({
                  ...prev,
                  whatsapp: []
                }));
              }
            })
            .catch(() => {});
        } else {
          setConnectedApps((prev) => {
            const next = new Set(prev);
            next.delete('whatsapp');
            return next;
          });
          setLiveChatsByApp((prev) => ({
            ...prev,
            whatsapp: []
          }));
        }

        // Dynamically load chats for ALL connected apps for this user
        savedApps.forEach((appId: string) => {
          if (appId === 'whatsapp') {
            // Already probed above
          } else if (appId === 'instagram') {
            fetch(`/api/channels/instagram/chats?userId=${encodeURIComponent(u.id)}`)
              .then((r) => r.json())
              .then((igData) => {
                if (Array.isArray(igData.chats) && igData.chats.length > 0) {
                  setLiveChatsByApp((prev) => ({
                    ...prev,
                    instagram: igData.chats || []
                  }));
                }
              })
              .catch(() => {});
          } else if (appId === 'discord') {
            let token = '';
            try {
              token = localStorage.getItem(getStorageKey('cf_discord_token')) || localStorage.getItem('cf_discord_token') || '';
              if (!token) {
                const acc = localStorage.getItem(getStorageKey('cf_discord_account')) || localStorage.getItem('cf_discord_account');
                if (acc) token = JSON.parse(acc).token || '';
              }
            } catch {}
            if (!token) {
              setConnectedApps((prev) => {
                const next = new Set(prev);
                next.delete('discord');
                return next;
              });
              setLiveChatsByApp((prev) => ({
                ...prev,
                discord: []
              }));
            } else {
              fetch(`/api/channels/discord/chats?userId=${encodeURIComponent(u.id)}&token=${encodeURIComponent(token)}`)
                .then((r) => r.json())
                .then((data) => {
                  if (data.status === 'unlinked' || data.success === false) {
                    setConnectedApps((prev) => {
                      const next = new Set(prev);
                      next.delete('discord');
                      return next;
                    });
                    setLiveChatsByApp((prev) => ({
                      ...prev,
                      discord: []
                    }));
                    if (data.error) {
                      setChannelErrors((prev) => ({ ...prev, [appId]: data.error }));
                    }
                  } else {
                    setChannelErrors((prev) => {
                      if (!prev[appId]) return prev;
                      const next = { ...prev };
                      delete next[appId];
                      return next;
                    });
                    if (Array.isArray(data.chats)) {
                      const sorted = [...data.chats].sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
                      setLiveChatsByApp((prev) => ({
                        ...prev,
                        discord: sorted
                      }));
                    }
                  }
                })
                .catch(() => {});
            }
          } else if (appId === 'gmail') {
            let gmEmail = u.email || session?.user?.email || '';
            // @ts-ignore
            let accessToken = session?.accessToken || '';
            try {
              const gmAcc = localStorage.getItem(getStorageKey('cf_gmail_account')) || localStorage.getItem('cf_gmail_account');
              if (gmAcc) {
                const parsed = JSON.parse(gmAcc);
                if (parsed.email) gmEmail = parsed.email;
                if (!accessToken && parsed.accessToken) accessToken = parsed.accessToken;
              }
              const gChat = localStorage.getItem(getStorageKey('cf_google_chat_account')) || localStorage.getItem('cf_google_chat_account');
              if (gChat) {
                const parsed = JSON.parse(gChat);
                if (!gmEmail && parsed.email) gmEmail = parsed.email;
                if (!accessToken && parsed.accessToken) accessToken = parsed.accessToken;
              }
              if (!accessToken) {
                accessToken = localStorage.getItem(getStorageKey('cf_google_access_token')) || localStorage.getItem('cf_google_access_token') || '';
              }
            } catch {}
            fetch(`/api/channels/gmail/chats?userId=${encodeURIComponent(u.id)}&email=${encodeURIComponent(gmEmail)}&accessToken=${encodeURIComponent(accessToken)}`)
              .then((r) => r.json())
              
              .then((data) => {
                if (data.success === false && data.error) {
                  setChannelErrors((prev) => ({ ...prev, [appId]: data.error }));
                } else {
                  setChannelErrors((prev) => {
                    if (!prev[appId]) return prev;
                    const next = { ...prev };
                    delete next[appId];
                    return next;
                  });
                }
                if (Array.isArray(data.chats) && data.chats.length > 0) {
                  const sorted = [...data.chats].sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
                  setLiveChatsByApp((prev) => ({
                    ...prev,
                    gmail: sorted
                  }));
                }
              })
          } else if (appId === 'google_chat') {
            let gcEmail = u.email || session?.user?.email || '';
            // @ts-ignore
            let accessToken = session?.accessToken || '';
            try {
              const gc = localStorage.getItem(getStorageKey('cf_google_chat_account'));
              if (gc) {
                const parsed = JSON.parse(gc);
                gcEmail = parsed.email || gcEmail;
                if (!accessToken) accessToken = parsed.accessToken || '';
              }
            } catch {}
            fetch(`/api/channels/google_chat/chats?userId=${encodeURIComponent(u.id)}&email=${encodeURIComponent(gcEmail)}&accessToken=${encodeURIComponent(accessToken)}`)
              .then((r) => r.json())
              
              .then((data) => {
                if (data.success === false && data.error) {
                  setChannelErrors((prev) => ({ ...prev, [appId]: data.error }));
                } else {
                  setChannelErrors((prev) => {
                    if (!prev[appId]) return prev;
                    const next = { ...prev };
                    delete next[appId];
                    return next;
                  });
                }
                if (Array.isArray(data.chats) && data.chats.length > 0) {
                  const sorted = [...data.chats].sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
                  setLiveChatsByApp((prev) => ({
                    ...prev,
                    google_chat: sorted
                  }));
                }
              })
              .catch(() => {});
          } else if (appId === 'telegram') {
            let tgToken = '';
            let tgSession = '';
            try {
              tgSession = localStorage.getItem('cf_telegram_session') || localStorage.getItem(getStorageKey('cf_telegram_session')) || '';
              tgToken = localStorage.getItem('cf_telegram_token') || localStorage.getItem(getStorageKey('cf_telegram_token')) || '';
            } catch {}
            fetch(`/api/channels/telegram/chats?session=${encodeURIComponent(tgSession)}&token=${encodeURIComponent(tgToken)}&userId=${encodeURIComponent(u.id)}`)
              .then((r) => r.json())
              .then((data) => {
                if (Array.isArray(data.chats) && data.chats.length > 0) {
                  const sorted = [...data.chats].sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
                  setLiveChatsByApp((prev) => ({
                    ...prev,
                    telegram: sorted
                  }));
                }
              })
              .catch(() => {});
          } else {
            fetch(`/api/channels/${appId}/chats?userId=${encodeURIComponent(u.id)}`)
              .then((r) => r.json())
              
            .then((data) => {
              if (data.success === false && data.error) {
                setChannelErrors((prev) => ({ ...prev, [selectedAppId]: data.error }));
              } else {
                setChannelErrors((prev) => {
                  if (!prev[selectedAppId]) return prev;
                  const next = { ...prev };
                  delete next[selectedAppId];
                  return next;
                });
              }
              if (Array.isArray(data.chats) && data.chats.length > 0) {
                const sorted = [...data.chats].sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
                setLiveChatsByApp((prev) => ({
                  ...prev,
                  [appId]: sorted
                }));
              } else {
                setLiveChatsByApp((prev) => ({
                  ...prev,
                  [appId]: []
                }));
              }
            })
            .catch(() => {
              setLiveChatsByApp((prev) => ({
                ...prev,
                [appId]: []
              }));
            });
          }
        });
      } else {
        // Logged out: channels are locked & inaccessible
        setCurrentUser(null);
        setConnectedApps(new Set<string>());
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    }

    // Handle OAuth callback URL params (e.g. ?code=... or #access_token=...)
    if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      if (code) {
        supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
          if (data?.session?.user) {
            const u = {
              id: data.session.user.id,
              name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'Merchant',
              email: data.session.user.email,
              provider: data.session.user.app_metadata?.provider || 'google',
              plan: 'Enterprise DZ Pro',
              verified: true,
              avatar: (data.session.user.user_metadata?.full_name || data.session.user.email || 'M')[0].toUpperCase(),
              workspace_owner_id: data.session.user.user_metadata?.workspace_owner_id,
              permissions: data.session.user.user_metadata?.permissions,
            };
            localStorage.setItem(getStorageKey('cf_user_session'), JSON.stringify(u));
            setCurrentUser(u);
            restoreAndSyncConnectedApps(u);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }).catch((err) => {
          console.warn('OAuth code exchange warning:', err);
        });
      }
    }

    // Check active Supabase session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        applyUserPreferences(session.user);
        const u = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Merchant',
          email: session.user.email,
          provider: session.user.app_metadata?.provider || 'oauth',
          plan: 'Enterprise DZ Pro',
          verified: true,
          avatar: (session.user.user_metadata?.full_name || session.user.email || 'M')[0].toUpperCase(),
          workspace_owner_id: session.user.user_metadata?.workspace_owner_id,
          permissions: session.user.user_metadata?.permissions,
        };
        localStorage.setItem(getStorageKey('cf_user_session'), JSON.stringify(u));
        setCurrentUser(u);
        restoreAndSyncConnectedApps(u);
        if (window.location.hash || window.location.search.includes('code=')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    });

    // Check NextAuth session
    // @ts-ignore
    if (session?.user) {
      // @ts-ignore
      if (session?.accessToken) {
        // @ts-ignore
        localStorage.setItem(getStorageKey('cf_google_access_token'), session.accessToken);
        // @ts-ignore
        localStorage.setItem('cf_google_access_token', session.accessToken);
      }
      const savedUser = localStorage.getItem(getStorageKey('cf_user_session'));
      const currentUserEmail = savedUser ? JSON.parse(savedUser).email : null;
      
      if (!savedUser || currentUserEmail !== session.user.email) {
        const u = {
          id: session.user.email,
          name: session.user.name || session.user.email?.split('@')[0] || 'Merchant',
          email: session.user.email,
          provider: 'google',
          plan: 'Enterprise DZ Pro',
          verified: true,
          avatar: (session.user.name || session.user.email || 'M')[0].toUpperCase(),
        };
        localStorage.setItem(getStorageKey('cf_user_session'), JSON.stringify(u));
        setCurrentUser(u);
        restoreAndSyncConnectedApps(u);
      }
    }

    // Supabase Auth listener for OAuth callback redirects and cross-tab sign-out
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        applyUserPreferences(session.user);
        const u = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Merchant',
          email: session.user.email,
          provider: session.user.app_metadata?.provider || 'oauth',
          plan: 'Enterprise DZ Pro',
          verified: true,
          avatar: (session.user.user_metadata?.full_name || session.user.email || 'M')[0].toUpperCase(),
          workspace_owner_id: session.user.user_metadata?.workspace_owner_id,
          permissions: session.user.user_metadata?.permissions,
        };
        localStorage.setItem(getStorageKey('cf_user_session'), JSON.stringify(u));
        setCurrentUser(u);
        restoreAndSyncConnectedApps(u);
        if (typeof window !== 'undefined' && (window.location.hash || window.location.search.includes('code='))) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Real-time synchronization of chats & contacts across all active channels
  const [liveChatsByApp, setLiveChatsByApp] = useState<Record<string, any[]>>({
    whatsapp: [],
    whatsapp_2: [],
    instagram: [],
    messenger: [],
    telegram: [],
    signal: [],
    x_twitter: [],
    google_messages: [],
    google_chat: [],
    google_voice: [],
    discord: [],
    slack: [],
    linkedin: [],
    irc: [],
    matrix: [],
    web_widget: [],
    gmail: [],
    viber: [],
    snapchat: [],
  });

  // Computed unread counts by app channel for red notification badges
  const unreadCountsByApp = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const [appId, chats] of Object.entries(liveChatsByApp)) {
      if (!connectedApps.has(appId)) continue;
      const effectiveChats = Array.isArray(chats) ? chats : [];
      if (Array.isArray(effectiveChats)) {
        let total = 0;
        for (const chat of effectiveChats) {
          let chatUnreads = chat.unreadCount || 0;
          if (Array.isArray(chat.topics) && chat.topics.length > 0) {
            const topicsUnread = chat.topics.reduce((sum: number, t: any) => sum + (t.unreadCount || 0), 0);
            chatUnreads = Math.max(chatUnreads, topicsUnread);
          }
          total += chatUnreads;
        }
        if (total > 0) {
          counts[appId] = total;
        }
      }
    }
    return counts;
  }, [liveChatsByApp, connectedApps]);
  
  const [channelErrors, setChannelErrors] = useState<Record<string, string>>({});

  const resolveChannelEndpoint = useCallback((appId: string) => {
    if (appId === 'whatsapp') {
      return '/api/channels/whatsapp/chats';
    } else if (appId === 'instagram') {
      let igId = '';
      let pageId = '';
      let accessToken = '';
      let sessionId = '';
      try {
        const igAccount = localStorage.getItem(getStorageKey('cf_ig_account'));
        if (igAccount) {
          const parsed = JSON.parse(igAccount);
          igId = parsed.igId || parsed.id || '';
          pageId = parsed.pageId || '';
          accessToken = parsed.pageAccessToken || parsed.accessToken || '';
          sessionId = parsed.sessionId || '';
        }
        if (!accessToken) {
          const metaAuth = localStorage.getItem(getStorageKey('cf_meta_auth'));
          if (metaAuth) {
            const parsed = JSON.parse(metaAuth);
            accessToken = parsed.userToken || '';
            if (!igId && parsed.instagramAccounts?.[0]) {
              igId = parsed.instagramAccounts[0].igId || parsed.instagramAccounts[0].id;
              pageId = parsed.instagramAccounts[0].pageId || '';
            }
          }
        }
      } catch {}
      return `/api/channels/instagram/chats?userId=${encodeURIComponent(currentUser?.id || '')}&pageId=${encodeURIComponent(pageId)}&igId=${encodeURIComponent(igId)}&accessToken=${encodeURIComponent(accessToken)}&sessionId=${encodeURIComponent(sessionId)}`;
    } else if (appId === 'messenger') {
      let pageId = '';
      let token = '';
      try {
        const page = localStorage.getItem(getStorageKey('cf_messenger_page'));
        if (page) {
          const parsed = JSON.parse(page);
          pageId = parsed.id || '';
          token = parsed.accessToken || '';
        }
      } catch {}
      return `/api/channels/messenger/chats?pageId=${encodeURIComponent(pageId)}&token=${encodeURIComponent(token)}`;
    } else if (appId === 'telegram') {
      let token = '';
      let session = '';
      try {
        session = localStorage.getItem(getStorageKey('cf_telegram_session')) || localStorage.getItem('cf_telegram_session') || '';
        token = localStorage.getItem(getStorageKey('cf_telegram_token')) || localStorage.getItem('cf_telegram_token') || '';
      } catch {}
      return `/api/channels/telegram/chats?session=${encodeURIComponent(session)}&token=${encodeURIComponent(token)}`;
    } else if (appId === 'gmail') {
      let email = session?.user?.email || '';
      // @ts-ignore
      let accessToken = session?.accessToken || '';
      try {
        const gmAcc = localStorage.getItem(getStorageKey('cf_gmail_account')) || localStorage.getItem('cf_gmail_account');
        if (gmAcc) {
          const parsed = JSON.parse(gmAcc);
          if (parsed.email) email = parsed.email;
          if (!accessToken && parsed.accessToken) accessToken = parsed.accessToken;
        }
        const gChat = localStorage.getItem(getStorageKey('cf_google_chat_account')) || localStorage.getItem('cf_google_chat_account');
        if (gChat) {
          const parsed = JSON.parse(gChat);
          if (!email && parsed.email) email = parsed.email;
          if (!accessToken && parsed.accessToken) accessToken = parsed.accessToken;
        }
        if (!accessToken) {
          accessToken = localStorage.getItem(getStorageKey('cf_google_access_token')) || localStorage.getItem('cf_google_access_token') || '';
        }
      } catch {}
      return `/api/channels/gmail/chats?userId=${encodeURIComponent(currentUser?.id || '')}&email=${encodeURIComponent(email)}&accessToken=${encodeURIComponent(accessToken)}`;
    } else if (appId === 'x_twitter') {
      let sessionVal = '';
      try {
        sessionVal = localStorage.getItem(getStorageKey('cf_x_twitter_session')) || '';
      } catch {}
      return `/api/channels/x_twitter/chats?userId=${encodeURIComponent(currentUser?.id || '')}&session=${encodeURIComponent(sessionVal)}`;
    } else if (appId === 'google_chat') {
      let email = session?.user?.email || '';
      // @ts-ignore
      let accessToken = session?.accessToken || '';
      try {
        const acc = localStorage.getItem(getStorageKey('cf_google_chat_account'));
        if (acc) {
          const parsed = JSON.parse(acc);
          email = parsed.email || email;
          if (!accessToken) accessToken = parsed.accessToken || '';
        }
      } catch {}
      return `/api/channels/google_chat/chats?userId=${encodeURIComponent(currentUser?.id || '')}&email=${encodeURIComponent(email)}&accessToken=${encodeURIComponent(accessToken)}`;
    } else if (appId === 'irc') {
      let channel = '#chatbot-farm';
      let host = 'irc.libera.chat';
      try {
        channel = localStorage.getItem(getStorageKey('cf_irc_channel')) || '#chatbot-farm';
        host = localStorage.getItem(getStorageKey('cf_irc_host')) || 'irc.libera.chat';
      } catch {}
      return `/api/channels/irc/chats?userId=${encodeURIComponent(currentUser?.id || '')}&channel=${encodeURIComponent(channel)}&host=${encodeURIComponent(host)}`;
    } else if (appId === 'linkedin') {
      let token = '';
      try {
        token = localStorage.getItem(getStorageKey('cf_linkedin_token')) || localStorage.getItem(getStorageKey('cf_linkedin_cookie')) || '';
      } catch {}
      return `/api/channels/linkedin/chats?userId=${encodeURIComponent(currentUser?.id || '')}&token=${encodeURIComponent(token)}`;
    } else if (appId === 'discord') {
      let token = '';
      try {
        token = localStorage.getItem(getStorageKey('cf_discord_token')) || '';
        if (!token) {
          const acc = localStorage.getItem(getStorageKey('cf_discord_account'));
          if (acc) token = JSON.parse(acc).token || '';
        }
      } catch {}
      return `/api/channels/discord/chats?userId=${encodeURIComponent(currentUser?.id || '')}&token=${encodeURIComponent(token)}`;
    }
    return `/api/channels/${appId}/chats?userId=${encodeURIComponent(currentUser?.id || '')}`;
  }, [currentUser?.id, session]);

  useEffect(() => {
    let isMounted = true;

    const syncChatsForApp = async (targetAppId: string, isSelected: boolean) => {
      if (!connectedApps.has(targetAppId)) return;
      try {
        const endpoint = resolveChannelEndpoint(targetAppId);
        if (!endpoint) return;

        const res = await fetch(endpoint);
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;

        if (targetAppId === 'whatsapp' && (!data.isLive || data.status === 'unlinked')) {
          setConnectedApps((prev) => {
            if (!prev.has(targetAppId)) return prev;
            const next = new Set(prev);
            next.delete(targetAppId);
            try {
              localStorage.setItem('cf_connected_apps', JSON.stringify(Array.from(next)));
            } catch {}
            return next;
          });
          setLiveChatsByApp((prev) => ({
            ...prev,
            [targetAppId]: []
          }));
          return;
        }

        if (!Array.isArray(data.chats)) return;

        const rawChats = data.chats;
        setLiveChatsByApp((prev) => {
          const currentList = prev[targetAppId] || [];
          const combinedMap = new Map<string, any>();

          if (!data.isLive && targetAppId !== 'whatsapp') {
            for (const chat of currentList) {
              combinedMap.set(chat.id, chat);
            }
          }

          let hasNewIncomingMessage = false;

          for (const raw of rawChats) {
            const existing = currentList.find((c: any) => c.id === raw.id);
            if (existing) {
              const hasRecentOperatorActivity = existing.lastSender === 'operator' && (Date.now() - (existing.timestamp || 0) < 60000);
              const effectiveTimestamp = hasRecentOperatorActivity
                ? Math.max(existing.timestamp || 0, raw.timestamp || 0)
                : (raw.timestamp || existing.timestamp || 0);
              const useRawDetails = !hasRecentOperatorActivity || ((raw.timestamp || 0) >= (existing.timestamp || 0));

              if (raw.timestamp && existing.timestamp && raw.timestamp > existing.timestamp && raw.lastSender !== 'operator') {
                hasNewIncomingMessage = true;
              }

              combinedMap.set(raw.id, {
                ...existing,
                ...raw,
                timestamp: effectiveTimestamp,
                lastMessage: useRawDetails ? raw.lastMessage : existing.lastMessage,
                lastMessageTime: useRawDetails ? (raw.lastMessageTime || raw.time) : existing.lastMessageTime,
                time: useRawDetails ? (raw.time || raw.lastMessageTime) : existing.time,
                topics: (raw.topics && raw.topics.length > 0) ? raw.topics : undefined,
                isGroup: (raw.isGroup !== undefined) ? raw.isGroup : existing.isGroup,
                messages: (raw.messages && raw.messages.length > 0) ? raw.messages : (existing.messages || []),
                profilePicUrl: raw.profilePicUrl || existing.profilePicUrl || null,
                unreadCount: raw.unreadCount !== undefined ? raw.unreadCount : (existing.unreadCount || 0),
              });
            } else {
              combinedMap.set(raw.id, {
                ...raw,
                topics: (raw.topics && raw.topics.length > 0) ? raw.topics : undefined,
              });
            }
          }

          if (hasNewIncomingMessage) {
            SoundManager.play(targetAppId);
          }

          const combined = Array.from(combinedMap.values());
          const sorted = combined.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));

          if (isSelected) {
            setSelectedContactPath((prevPath: string[]) => {
              const currentPath = Array.isArray(prevPath) ? prevPath : (prevPath ? [prevPath] : []);
              const currentChatId = currentPath[0];
              if (currentChatId) {
                const found = sorted.find((c: any) => c.id === currentChatId || (c.id && c.id.split(',').includes(currentChatId)) || (currentChatId.includes(',') && currentChatId.split(',').includes(c.id)));
                if (found) {
                  const resolvedId = found.id;
                  if (found.topics && found.topics.length > 0 && currentPath.length === 1) {
                    return [resolvedId, found.topics[0].id];
                  }
                  if (currentPath.length > 1) {
                    return [resolvedId, ...currentPath.slice(1)];
                  }
                  return [resolvedId];
                }
              }
              if (sorted.length > 0) {
                const top = sorted[0];
                if (top.topics && top.topics.length > 0) {
                  return [top.id, top.topics[0].id];
                }
                return [top.id];
              }
              return [];
            });
          }

          return {
            ...prev,
            [targetAppId]: sorted,
          };
        });
      } catch (err) {
        console.error(`Failed to sync ${targetAppId} chats:`, err);
      }
    };

    // 1. Immediately sync selected active channel
    syncChatsForApp(selectedAppId, true);

    // 2. Fast poll active channel every 2.5 seconds
    const activeInterval = setInterval(() => {
      syncChatsForApp(selectedAppId, true);
    }, 2500);

    // 3. Poll background connected channels every 5 seconds for instant cross-app badges
    const bgInterval = setInterval(() => {
      const otherConnected = Array.from(connectedApps).filter((appId) => appId !== selectedAppId);
      for (const bgApp of otherConnected) {
        syncChatsForApp(bgApp, false);
      }
    }, 5000);

    // 4. Instant sync on window focus and visibility change
    const handleVisibilitySync = () => {
      if (document.visibilityState === 'visible') {
        syncChatsForApp(selectedAppId, true);
        const otherConnected = Array.from(connectedApps).filter((appId) => appId !== selectedAppId);
        for (const bgApp of otherConnected) {
          syncChatsForApp(bgApp, false);
        }
      }
    };

    window.addEventListener('focus', handleVisibilitySync);
    document.addEventListener('visibilitychange', handleVisibilitySync);

    return () => {
      isMounted = false;
      clearInterval(activeInterval);
      clearInterval(bgInterval);
      window.removeEventListener('focus', handleVisibilitySync);
      document.removeEventListener('visibilitychange', handleVisibilitySync);
    };
  }, [connectedApps, selectedAppId, resolveChannelEndpoint]);

  // Real-time mark-as-read: removes topic unread, decrements group chat unread, decrements app unread dock
  const handleMarkAsRead = useCallback((appId: string, contactId: string, topicId?: string) => {
    setLiveChatsByApp((prev) => {
      const currentList = prev[appId];
      if (!currentList || !Array.isArray(currentList)) return prev;

      let changed = false;
      const nextList = currentList.map((contact: any) => {
        if (contact.id !== contactId) return contact;

        let newTopics = contact.topics;
        let newUnreadCount = contact.unreadCount || 0;

        if (topicId && Array.isArray(contact.topics)) {
          let topicCleared = 0;
          newTopics = contact.topics.map((t: any) => {
            if (String(t.id) === String(topicId)) {
              topicCleared = t.unreadCount || 0;
              return { ...t, unreadCount: 0 };
            }
            return t;
          });
          if (topicCleared > 0) {
            newUnreadCount = Math.max(0, newUnreadCount - topicCleared);
            changed = true;
          }
        } else {
          if (newUnreadCount > 0 || (Array.isArray(contact.topics) && contact.topics.some((t: any) => (t.unreadCount || 0) > 0))) {
            changed = true;
            newUnreadCount = 0;
            if (Array.isArray(contact.topics)) {
              newTopics = contact.topics.map((t: any) => ({ ...t, unreadCount: 0 }));
            }
          }
        }

        if (changed) {
          return {
            ...contact,
            unreadCount: newUnreadCount,
            topics: newTopics,
          };
        }
        return contact;
      });

      if (!changed) return prev;
      return {
        ...prev,
        [appId]: nextList,
      };
    });
  }, []);

  // Dynamically re-orders contacts chronologically: latest message jumps directly to top (index 0)
  const handleMessageActivity = (appId: string, contactId: string, messageText: string, timestamp?: number, isReceived?: boolean) => {
    const now = timestamp || Date.now();
    
    setAppLastActivity(prev => ({ ...prev, [appId]: now }));
    
    if (isReceived) {
      SoundManager.play(appId);
    }
    
    // Sort logic handled in render, we just need to update the contact
    
    setLiveChatsByApp((prev) => {
      const currentList = prev[appId] || [];
      const idx = currentList.findIndex((c: any) => c.id === contactId);
      if (idx !== -1) {
        const contact = currentList[idx];
        const isRecent = Date.now() - now < 30000;
        const timeFormatted = isRecent
          ? 'Just now'
          : new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const updated = {
          ...contact,
          lastMessage: messageText,
          lastMessageTime: timeFormatted,
          time: timeFormatted,
          timestamp: Math.max(contact.timestamp || 0, now),
          lastSender: isReceived ? 'customer' : 'operator',
        };
        const nextList = [updated, ...currentList.filter((_: any, i: number) => i !== idx)];
        nextList.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
        return {
          ...prev,
          [appId]: nextList,
        };
      } else {
        const cleanRaw = contactId.replace(/^instagram_|^whatsapp_|^telegram_|^messenger_|^gmail_/, '');
        const cleanHandle = cleanRaw.startsWith('@') ? cleanRaw : `@${cleanRaw}`;
        const cleanName = cleanRaw.replace(/^@/, '');
        const avatarInitial = (cleanName[0] || 'C').toUpperCase();

        const newContact = {
          id: contactId,
          appId,
          name: cleanName,
          handleOrPhone: cleanHandle,
          profilePicUrl: null,
          lastMessage: messageText,
          lastMessageTime: 'Just now',
          time: 'Just now',
          timestamp: now,
          unreadCount: 0,
          avatarBg: APP_GRADIENT_THEMES[appId]?.solidColor || '#C13584',
          avatarText: avatarInitial,
          statusText: 'Active',
          spend: '0 DA',
          messages: [
            {
              id: String(now),
              sender: 'operator',
              text: messageText,
              time: 'Just now',
              seen: true
            }
          ]
        };
        setSelectedContactPath([contactId]);
        setMobileHubTab('chat');
        return {
          ...prev,
          [appId]: [newContact, ...currentList]
        };
      }
    });
  };

  const handleContactAdded = (appId: string, contact: any) => {
    setLiveChatsByApp((prev) => {
      const current = prev[appId] || [];
      const filtered = current.filter((c: any) => c.id !== contact.id && c.handleOrPhone !== contact.handleOrPhone);
      return {
        ...prev,
        [appId]: [contact, ...filtered]
      };
    });
    setSelectedContactPath([contact.id]);
  };

  const handleDisconnectChannel = async (appId: string) => {
    // 1. Mark explicitly unlinked in localStorage & purge channel-specific tokens
    try {
      localStorage.setItem(`cf_${appId}_unlinked`, 'true');
      localStorage.setItem(getStorageKey(`cf_${appId}_unlinked`), 'true');

      if (appId === 'whatsapp' || appId === 'whatsapp_2') {
        localStorage.removeItem('cf_whatsapp_linked');
        localStorage.removeItem(getStorageKey('cf_whatsapp_linked'));
        localStorage.removeItem('cf_whatsapp_number');
        localStorage.removeItem(getStorageKey('cf_whatsapp_number'));
        localStorage.removeItem('cf_whatsapp_name');
        localStorage.removeItem(getStorageKey('cf_whatsapp_name'));
        localStorage.removeItem('cf_whatsapp_creds');
        localStorage.removeItem(getStorageKey('cf_whatsapp_creds'));

        // Dispatch backend logout to Evolution API
        fetch('/api/channels/whatsapp/logout', { method: 'POST' }).catch(() => {});
      } else if (appId === 'telegram') {
        localStorage.removeItem('cf_telegram_session');
        localStorage.removeItem(getStorageKey('cf_telegram_session'));
        localStorage.removeItem('cf_telegram_token');
        localStorage.removeItem(getStorageKey('cf_telegram_token'));
      } else if (appId === 'instagram') {
        localStorage.removeItem('cf_ig_account');
        localStorage.removeItem('cf_meta_auth');
      } else if (appId === 'messenger') {
        localStorage.removeItem('cf_messenger_page');
      } else if (appId === 'discord') {
        localStorage.removeItem('cf_discord_token');
        localStorage.removeItem('cf_discord_account');
      }
      window.dispatchEvent(new Event('storage'));
    } catch {}

    // 2. Remove channel from connectedApps and persist
    setConnectedApps((prev) => {
      const next = new Set(prev);
      next.delete(appId);
      const arr = Array.from(next);
      try {
        if (currentUser?.id) {
          localStorage.setItem(`cf_connected_apps_${currentUser.id}`, JSON.stringify(arr));
          localStorage.setItem(getStorageKey(`cf_connected_apps_${currentUser.id}`), JSON.stringify(arr));
        }
        localStorage.setItem('cf_connected_apps', JSON.stringify(arr));
        localStorage.setItem(getStorageKey('cf_connected_apps'), JSON.stringify(arr));
      } catch {}
      debouncedSyncPreferences({ connectedApps: arr });
      return next;
    });

    // 3. Clear all live contacts, messages, and notification badges for this channel
    setLiveChatsByApp((prev) => ({
      ...prev,
      [appId]: []
    }));

    // 4. Reset path if currently on this channel
    setSelectedContactPath([]);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('cf_user_session');
      await supabase.auth.signOut();
      await signOut({ redirect: false });
    } catch (e) {}
    setCurrentUser(null);
    setConnectedApps(new Set<string>());
    setLiveChatsByApp({
      whatsapp: [],
      instagram: [],
      messenger: [],
      telegram: [],
      web_widget: [],
      gmail: [],
    });
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(getStorageKey('cf_theme_mode'), next ? 'dark' : 'light');
      } catch {}
      return next;
    });
  };

  const handleSelectApp = (appId: string) => {
    setSelectedAppId(appId);

    // Strictly verify Discord authentication: require token or account in storage
    if (appId === 'discord') {
      const discToken = typeof window !== 'undefined'
        ? (localStorage.getItem('cf_discord_token') || localStorage.getItem(getStorageKey('cf_discord_token')) || localStorage.getItem('cf_discord_account') || localStorage.getItem(getStorageKey('cf_discord_account')))
        : null;
      if (!discToken) {
        setConnectedApps((prev) => {
          if (!prev.has('discord')) return prev;
          const next = new Set(prev);
          next.delete('discord');
          return next;
        });
        setLiveChatsByApp((prev) => ({ ...prev, discord: [] }));
        setSelectedContactPath([]);
        return;
      }
    }

    const isConn = connectedApps.has(appId) ||
      (typeof window !== 'undefined' && Boolean(
        localStorage.getItem(`cf_${appId}_account`) ||
        (appId === 'discord' && (localStorage.getItem('cf_discord_token') || localStorage.getItem('cf_discord_account'))) ||
        (appId === 'viber' && (localStorage.getItem('cf_viber_account') || localStorage.getItem('cf_viber_phone'))) ||
        (appId === 'snapchat' && (localStorage.getItem('cf_snapchat_account') || localStorage.getItem('cf_snapchat_username')))
      ));

    if (isConn && !connectedApps.has(appId)) {
      setConnectedApps((prev) => new Set(Array.from(prev).concat(appId)));
    }

    const contacts = liveChatsByApp[appId] || [];

    if (isConn && contacts && contacts.length > 0) {
      const sorted = [...contacts].sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
      const top = sorted[0];
      if (top.topics && top.topics.length > 0) {
        setSelectedContactPath([top.id, top.topics[0].id]);
      } else {
        setSelectedContactPath([top.id]);
      }
    } else {
      setSelectedContactPath([]);
    }
  };

  const handleToggleAi = (channelId: string) => {
    if (currentUser?.workspace_owner_id && !currentUser?.permissions?.toggle_ai) {
      alert("You don't have permission to toggle AI agents.");
      return;
    }

    const isCurrentlyActive = !!aiEnabledByChannel[channelId];

    if (isCurrentlyActive) {
      // Allow turning off directly
      setAiEnabledByChannel((prev) => ({
        ...prev,
        [channelId]: false
      }));
    } else {
      // Turning ON: check for subscription access OR stored BYOK API key
      const byokKey = typeof window !== 'undefined' ? localStorage.getItem(getStorageKey('cf_byok_key')) : null;
      if (!hasAiAccess && !byokKey) {
        setTargetAiChannel(channelId);
        setIsAiModalOpen(true);
      } else {
        setAiEnabledByChannel((prev) => ({
          ...prev,
          [channelId]: true
        }));
      }
    }
  };

  const handleActivateAiTrial = () => {
    setHasAiAccess(true);
    setAiEnabledByChannel((prev) => ({
      ...prev,
      [targetAiChannel]: true
    }));
    setIsAiModalOpen(false);
  };

  const handleAddChannel = (newChannel: any) => {
    setIsAddModalOpen(false);
    const targetId = newChannel?.type === 'whatsapp_sim' ? 'whatsapp_2' : (newChannel?.type || newChannel?.appId || 'whatsapp');
    handleOpenConnectModal(targetId);
  };

  // Open the connect modal for a specific app (gated by authentication)
  const handleOpenConnectModal = (appId: string) => {
    if (!currentUser) {
      setAuthModalNotice('Please sign in or create an account to pair your store channels and generate QR codes.');
      setIsAuthModalOpen(true);
      return;
    }
    setConnectingAppId(appId);
    setIsConnectModalOpen(true);
  };

  // Mark an app as connected after successful QR scan / OAuth / Instant Demo
  const handleConnectSuccess = (appId: string) => {
    setSelectedAppId(appId);
    try {
      localStorage.removeItem(`cf_${appId}_unlinked`);
      localStorage.removeItem(getStorageKey(`cf_${appId}_unlinked`));
      if (appId === 'whatsapp' || appId === 'whatsapp_2') {
        localStorage.setItem('cf_whatsapp_linked', 'true');
        localStorage.setItem(getStorageKey('cf_whatsapp_linked'), 'true');
      }
      window.dispatchEvent(new Event('storage'));
    } catch {}

    setConnectedApps((prev) => {
      const next = new Set(Array.from(prev).concat(appId));
      try {
        if (currentUser?.id) {
          localStorage.setItem(getStorageKey(`cf_connected_apps_${currentUser.id}`), JSON.stringify(Array.from(next)));
        }
        localStorage.setItem(getStorageKey('cf_connected_apps'), JSON.stringify(Array.from(next)));
        localStorage.setItem('cf_connected_apps', JSON.stringify(Array.from(next)));
      } catch {}
      debouncedSyncPreferences({ connectedApps: Array.from(next) });
      return next;
    });
    fetch(`/api/channels/${appId}/chats?userId=${encodeURIComponent(currentUser?.id || '')}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.chats) && data.chats.length > 0) {
          setLiveChatsByApp((prev) => ({
            ...prev,
            [appId]: data.chats,
          }));
          setSelectedContactPath([data.chats[0].id]);
        }
      })
      .catch(() => {});
    setIsConnectModalOpen(false);
  };

  // Monotonic upward entrance animation:
  const columnVariants: Variants = {
    hidden: { 
      opacity: 0.9, 
      y: 12 
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: 'tween',
        delay: index * 0.05,
        duration: 0.25,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <main className="h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full max-w-full overflow-hidden bg-[#ECECE2] dark:bg-[#0F1115] flex flex-col selection:bg-[#EB6708] selection:text-white transition-all duration-500 ease-in-out">
        {/* 1. TOP NAVBAR WITH SMOOTH SLIDING PILL */}
        <Navbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentUser={currentUser}
          onOpenAuth={() => {
            setAuthModalNotice(null);
            setIsAuthModalOpen(true);
          }}
          onLogout={handleLogout}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onToggleAi={handleToggleAi}
          onOpenTeamModal={() => setIsTeamModalOpen(true)}
          projects={allowedProjects}
          activeProjectId={activeProjectId}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          onUpdateUser={handleUpdateUser}
          isAdmin={isAdmin}
        />

        {/* 2. MAIN WORKSPACE / PAGE VIEWS WITH FLUID TRANSITIONS */}
        <div className="flex-1 min-h-0 w-full max-w-full min-w-0 p-1 md:p-2 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'workspace' && (
              <motion.div
                key={`workspace-view-${activeProjectId}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-full min-w-0 h-full min-h-0 flex flex-col"
              >
                {/* 1. DESKTOP 3-COLUMN WORKSPACE (Visible on screen width >= md / 768px) */}
                <div className={`hidden md:flex w-full h-full min-h-0 ${activeDragColId ? 'is-dragging' : ''}`}>
                  <style dangerouslySetInnerHTML={{ __html: `
                    .custom-resize-handle {
                      width: 12px;
                      background-color: transparent;
                      cursor: col-resize;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      margin: 0 -2px;
                      position: relative;
                      z-index: 10;
                    }
                    @keyframes handleEntrance {
                      0% { opacity: 0; transform: scaleY(0.3); }
                      60% { opacity: 0; transform: scaleY(0.3); }
                      100% { opacity: 1; transform: scaleY(1); }
                    }
                    .custom-resize-handle::after {
                      content: "";
                      position: absolute;
                      width: 6px;
                      height: 32px;
                      background-color: ${activeThemeColor};
                      border-radius: 4px;
                      opacity: 1;
                      animation: handleEntrance 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                      transition: height 0.2s, background-color 0.2s, opacity 0.2s;
                    }
                    .custom-resize-handle:hover::after,
                    .custom-resize-handle[data-resize-handle-state="drag"]::after {
                      height: 32px;
                      background-color: ${activeThemeColor};
                    }
                    
                    .is-dragging [data-resize-handle],
                    .is-dragging [data-panel-resize-handle-id],
                    .is-dragging [data-panel-resize-handle-enabled],
                    .is-dragging .custom-resize-handle,
                    .is-dragging [role="separator"],
                    .is-dragging .custom-resize-handle::after {
                      opacity: 0 !important;
                      visibility: hidden !important;
                      pointer-events: none !important;
                      transition: opacity 0.15s ease-out, visibility 0.15s ease-out;
                    }

                    .sortable-column-container .cursor-grab button,
                    .sortable-column-container .cursor-grabbing button,
                    .cursor-grab button,
                    .cursor-grabbing button {
                      cursor: pointer !important;
                    }

                    .sortable-column-container {
                      container-type: inline-size;
                    }
                    @container (max-width: 80px) {
                      .column-main-content { opacity: 0 !important; pointer-events: none !important; display: none !important; }
                      .column-collapsed-bg { opacity: 1 !important; pointer-events: auto !important; cursor: grab !important; }
                      .column-icon-only { display: none !important; }
                    }
                  ` }} />
                  <DndContext
                    sensors={colSensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleColDragStart}
                    onDragEnd={handleColDragEnd}
                    onDragCancel={handleColDragCancel}
                    modifiers={[restrictToHorizontalAxis]}
                  >
                    <SortableContext items={visibleColumns} strategy={horizontalListSortingStrategy}>
                      <Group key={columnOrder.filter(c => !(c === 'hub' && isRightHubCollapsed)).length} groupRef={groupRef} orientation="horizontal" id="desktop-workspace-main" className="w-full h-full overflow-hidden flex" onLayoutChanged={(layout) => {
                        const visibleCols = columnOrder.filter(c => !(c === 'hub' && isRightHubCollapsed));
                        const sizeDict: Record<string, number> = {};
                        
                        // Grab existing sizes to not overwrite hidden panels
                        let existingSizes: Record<string, number> = {};
                        try {
                          const stored = localStorage.getItem(getStorageKey('cf_panel_sizes'));
                          if (stored) {
                            const parsed = JSON.parse(stored);
                            if (!Array.isArray(parsed)) existingSizes = parsed;
                          }
                        } catch {}
                        
                        visibleCols.forEach((col, i) => { existingSizes[col] = layout[i]; });
                        localStorage.setItem(getStorageKey('cf_panel_sizes'), JSON.stringify(existingSizes));
                        debouncedSyncPreferences({ panelSizes: existingSizes });
                      }}>
                        {(() => {
                          const visibleColumns = columnOrder.filter(c => !(c === 'hub' && isRightHubCollapsed));
                          const children: React.ReactNode[] = [];
                          
                          visibleColumns.forEach((colId, index) => {
                            const colThemeColor = activeThemeColor;
                            
                            let savedSize = undefined;
                            try {
                              const stored = localStorage.getItem(getStorageKey('cf_panel_sizes'));
                              if (stored) {
                                const parsed = JSON.parse(stored);
                                if (!Array.isArray(parsed) && parsed[colId] !== undefined) savedSize = parsed[colId];
                              }
                            } catch {}

                            children.push(
                              <Panel 
                                key={colId}
                                id={colId}
                                defaultSize={savedSize !== undefined ? savedSize : (colId === 'switcher' ? 25 : colId === 'chat' ? (isRightHubCollapsed ? 75 : 45) : 30)} 
                                minSize={colId === 'switcher' ? 5 : colId === 'chat' ? 35 : 25}
                                style={{ overflow: activeDragColId ? 'visible' : 'hidden', zIndex: activeDragColId === colId ? 9999 : 1 }}
                              >
                                <motion.div
                                  key={`panel-entrance-${colId}`}
                                  initial={{ y: '50vh', opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{
                                    y: { 
                                      duration: 0.9, 
                                      delay: index * 0.14, 
                                      ease: [0.16, 1, 0.3, 1] 
                                    },
                                    opacity: { 
                                      duration: 0.45, 
                                      delay: index * 0.14, 
                                      ease: 'easeOut' 
                                    }
                                  }}
                                  className="h-full w-full"
                                  style={{
                                    overflow: activeDragColId ? 'visible' : 'hidden',
                                    zIndex: activeDragColId === colId ? 9999 : 1,
                                    willChange: 'transform, opacity'
                                  }}
                                >
                                  <SortableColumn 
                                    id={colId} 
                                    activeThemeColor={colThemeColor}
                                    onContextMenu={(e) => {
                                      setPanelContextMenu({
                                        isOpen: true,
                                        x: e.clientX,
                                        y: e.clientY,
                                        targetColId: colId
                                      });
                                    }}
                                  >
                                  {(dragHandleProps) => (
                                    colId === 'switcher' ? (
                                      <AppSwitcherColumn
                                        dragHandleProps={dragHandleProps}
                                        appLastActivity={appLastActivity}
                                        selectedAppId={selectedAppId}
                                        unreadCounts={unreadCountsByApp}
                                        onSelectApp={handleSelectApp}
                                        onOpenAddModal={() => setIsAddModalOpen(true)}
                                        onOpenConnectModal={handleOpenConnectModal}
                                        aiEnabledByChannel={aiEnabledByChannel}
                                        onToggleAi={handleToggleAi}
                                        connectedApps={displayedConnectedApps}
                                        pinnedApps={displayedPinnedApps}
                                        onUnpinApp={handleUnpinApp}
                                        onReorderApps={handleReorderApps}
                                        onSetPinnedApps={handleSetPinnedApps}
                                        onPinApp={handlePinApp}
                                        canEditUi={canEditUi}
                                        canManageChannels={canManageChannels}
                                      />
                                    ) : colId === 'chat' ? (
                                      <MiddleChatColumn
                                        dragHandleProps={dragHandleProps}
                                        appId={selectedAppId}
                                        selectedContactPath={selectedContactPath}
                                        onNavigatePath={setSelectedContactPath}
                                        isLinked={isLinked}
                                        onLinkSuccess={() => setIsLinked(true)}
                                        onOpenAuth={() => setIsAuthModalOpen(true)}
                                        darkMode={darkMode}
                                        isAiActive={aiEnabledByChannel[selectedAppId] ?? false}
                                        onToggleAi={() => handleToggleAi(selectedAppId)}
                                        isConnected={connectedApps.has(selectedAppId)}
                                        onOpenConnect={() => handleOpenConnectModal(selectedAppId)}
                                        onDisconnect={handleDisconnectChannel}
                                        liveContacts={liveChatsByApp[selectedAppId] ?? []}
                                        onMessageActivity={handleMessageActivity}
                                        currentUser={currentUser}
                                        channelError={channelErrors[selectedAppId]}
                                        onMarkAsRead={handleMarkAsRead}
                                        canSendMessages={canSendMessages}
                                        canMakeCalls={canMakeCalls}
                                      />
                                    ) : colId === 'hub' ? (
                                      <RightHubColumn
                                        dragHandleProps={dragHandleProps}
                                        selectedAppId={selectedAppId}
                                        selectedContactId={selectedContactPath[0] || ''}
                                        selectedTopicId={selectedContactPath[1] || ''}
                                        onSelectTopic={(topicId, contactId) => {
                                          const currentChats = liveChatsByApp[selectedAppId] || [];
                                          const parentId = contactId || selectedContactPath[0] || currentChats[0]?.id || '';
                                          if (parentId) {
                                            setSelectedContactPath([parentId, topicId]);
                                            handleMarkAsRead(selectedAppId, parentId, topicId);
                                          }
                                        }}
                                        onSelectChat={(chatId) => {
                                          const currentChats = liveChatsByApp[selectedAppId] || [];
                                          const target = currentChats.find((c: any) => c.id === chatId);
                                          if (target?.topics && target.topics.length > 0) {
                                            setSelectedContactPath([chatId, target.topics[0].id]);
                                            handleMarkAsRead(selectedAppId, chatId, target.topics[0].id);
                                          } else {
                                            setSelectedContactPath([chatId]);
                                            handleMarkAsRead(selectedAppId, chatId);
                                          }
                                        }}
                                        onMarkAsRead={handleMarkAsRead}
                                        isAiActive={aiEnabledByChannel[selectedAppId] ?? false}
                                        onToggleAi={() => handleToggleAi(selectedAppId)}
                                        isConnected={connectedApps.has(selectedAppId)}
                                        liveContacts={liveChatsByApp[selectedAppId] ?? []}
                                        currentUser={currentUser}
                                        onContactAdded={(contact) => handleContactAdded(selectedAppId, contact)}
                                        onDisconnectChannel={handleDisconnectChannel}
                                        onOpenConnect={() => handleOpenConnectModal(selectedAppId)}
                                        detachedTabs={detachedTabs}
                                        onDetach={handleDetachTab}
                                      />
                                    ) : (colId === 'analytics' || colId === 'settings') ? (
                                      <RightHubColumn
                                        dragHandleProps={dragHandleProps}
                                        selectedAppId={selectedAppId}
                                        selectedContactId={selectedContactPath[0] || ''}
                              selectedTopicId={selectedContactPath[1] || ''}
                              onSelectTopic={(topicId) => setSelectedContactPath([selectedContactPath[0], topicId])}
                                        onSelectChat={(chatId) => {
                                          setLiveChatsByApp((prev) => {
                                            const list = prev[selectedAppId] || [];
                                            return {
                                              ...prev,
                                              [selectedAppId]: list.map((c: any) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
                                            };
                                          });
                                          const currentChats = liveChatsByApp[selectedAppId] || [];
                                          const target = currentChats.find((c: any) => c.id === chatId);
                                          if (target?.topics && target.topics.length > 0) {
                                            setSelectedContactPath([chatId, target.topics[0].id]);
                                          } else {
                                            setSelectedContactPath([chatId]);
                                          }
                                        }}
                                        isAiActive={aiEnabledByChannel[selectedAppId] ?? false}
                                        onToggleAi={() => handleToggleAi(selectedAppId)}
                                        isConnected={connectedApps.has(selectedAppId)}
                                        liveContacts={liveChatsByApp[selectedAppId] ?? []}
                                        currentUser={currentUser}
                                        isStandalone={true}
                                        activeTabOverride={colId as 'analytics' | 'settings'}
                                        onReattach={() => handleReattachTab(colId)}
                                      />
                                    ) : null
                                  )}
                                </SortableColumn>
                              </motion.div>
                            </Panel>
                          );

                            if (index < visibleColumns.length - 1) {
                              children.push(
                                <Separator 
                                  key={`handle-${index}`} 
                                  className="custom-resize-handle"
                                  onContextMenu={(e: any) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setPanelContextMenu({
                                      isOpen: true,
                                      x: e.clientX,
                                      y: e.clientY
                                    });
                                  }}
                                />
                              );
                            }
                          });
                          
                          return children;
                        })()}
                      </Group>
                    </SortableContext>
                  </DndContext>

                  <PanelContextMenu
                    isOpen={Boolean(panelContextMenu?.isOpen)}
                    position={panelContextMenu ? { x: panelContextMenu.x, y: panelContextMenu.y } : { x: 0, y: 0 }}
                    targetColId={panelContextMenu?.targetColId}
                    isRightHubCollapsed={isRightHubCollapsed}
                    columnOrder={columnOrder}
                    currentSizes={(() => {
                      try {
                        const s = localStorage.getItem(getStorageKey('cf_panel_sizes'));
                        if (s) return JSON.parse(s);
                      } catch {}
                      return { switcher: 25, chat: 45, hub: 30 };
                    })()}
                    onClose={() => setPanelContextMenu(null)}
                    onResetAll={handleResetLayoutAll}
                    onResetSizeOnly={handleResetLayoutSizeOnly}
                    onResetPositionOnly={handleResetLayoutPositionOnly}
                    onApplyPreset={handleApplyLayoutPreset}
                    onSaveCurrentLayout={handleSaveCurrentLayout}
                    savedLayouts={savedCustomLayouts}
                    onApplySavedLayout={handleApplyLayoutPreset}
                    onDeleteSavedLayout={handleDeleteSavedLayout}
                    onCopyLayout={handleCopyLayout}
                    onPasteLayout={handlePasteLayout}
                    onMaximizeCol={handleMaximizeCol}
                    onMoveCol={handleMoveCol}
                  />
                </div>

                {/* 2. MOBILE RESPONSIVE WORKSPACE (Visible on screen width < md / 768px) */}
                <div className="flex md:hidden flex-row h-full w-full max-w-full min-w-0 gap-1.5 overflow-hidden">
                  {/* Left Side Dock (Icons Only: Chat, Contacts, Stats, Settings) */}
                  <motion.div
                    initial={{ y: '40vh', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      y: { duration: 0.85, delay: 0.0, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.45, delay: 0.0, ease: 'easeOut' }
                    }}
                    className="w-11 sm:w-12 py-3 px-1.5 flex flex-col items-center gap-1.5.5 bg-white dark:bg-[#1A1D23] rounded-2xl sm:rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] shadow-xs shrink-0 self-stretch justify-start"
                  >
                    {([
                      { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-4 h-4" /> },
                      { id: 'contacts', label: 'Contacts', icon: <Users className="w-4 h-4" /> },
                      { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" />, perm: 'view_analytics' },
                      { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" />, perm: 'modify_settings' },
                    ] as const).filter(tab => !('perm' in tab) || !currentUser?.workspace_owner_id || currentUser?.permissions?.[(tab as any).perm]).map((tab) => {
                      const isActive = mobileHubTab === tab.id;
                      const activeTheme = APP_GRADIENT_THEMES[selectedAppId] || APP_GRADIENT_THEMES.whatsapp;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setMobileHubTab(tab.id)}
                          title={tab.label}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                            isActive
                              ? 'text-white shadow-xs scale-105'
                              : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                          style={isActive ? { backgroundColor: activeTheme.solidColor } : undefined}
                        >
                          {tab.icon}
                          {tab.id === 'contacts' && (liveChatsByApp[selectedAppId] || []).length > 0 && !isActive && (
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>

                  {/* Main Work Area: Sticked Channel Icons Atop Conversation Window */}
                  <motion.div
                    initial={{ y: '40vh', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      y: { duration: 0.85, delay: 0.14, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.45, delay: 0.14, ease: 'easeOut' }
                    }}
                    className="flex-1 min-w-0 max-w-full h-full min-h-0 flex flex-col relative"
                  >
                    {/* Sticked Channel Switcher Icons Bar (Selected icon seamlessly surrounded by top bar's color) */}
                    <div className="w-full pt-1 pl-3 pr-1 flex items-end justify-between gap-1 shrink-0 select-none z-20">
                      <div className="flex items-end gap-1.5 overflow-x-auto no-scrollbar max-w-full">
                        {activeChannelIds.map(id => [
                          { id: 'whatsapp', name: 'WhatsApp', icon: <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8" /> },
                          { id: 'whatsapp_2', name: 'WhatsApp 2', icon: <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8" /> },
                          { id: 'instagram', name: 'Instagram', icon: <InstagramIcon className="w-7 h-7 sm:w-8 sm:h-8" /> },
                          { id: 'telegram', name: 'Telegram', icon: <TelegramIcon className="w-7 h-7 sm:w-8 sm:h-8" /> },
                          { id: 'messenger', name: 'Messenger', icon: <MessengerIcon className="w-7 h-7 sm:w-8 sm:h-8" /> },
                          { id: 'signal', name: 'Signal', icon: <SignalIcon className="w-7 h-7 sm:w-8 sm:h-8" /> },
                          { id: 'x_twitter', name: 'X', icon: <XIcon className="w-7 h-7 sm:w-8 sm:h-8" /> },
                          { id: 'google_messages', name: 'Google Messages', icon: <GoogleMessagesIcon className="w-7 h-7 sm:w-8 sm:h-8" /> },
                          { id: 'google_chat', name: 'Google Chat', icon: <GoogleChatIcon className="w-7 h-7 sm:w-8 sm:h-8" /> },
                          { id: 'google_voice', name: 'Google Voice', icon: <GoogleVoiceIcon className="w-7 h-7 sm:w-8 sm:h-8" /> },
                          { id: 'discord', name: 'Discord', icon: <DiscordIcon className="w-7 h-7 sm:w-8 sm:h-8" /> },
                          { id: 'slack', name: 'Slack', icon: <SlackIcon className="w-7 h-7 sm:w-8 sm:h-8" /> },
                          { id: 'linkedin', name: 'LinkedIn', icon: <LinkedInIcon className="w-7 h-7 sm:w-8 sm:h-8" /> },
                          { id: 'irc', name: 'IRC', icon: <IrcIcon className="w-7 h-7 sm:w-8 sm:h-8" /> },
                          { id: 'matrix', name: 'Matrix', icon: <MatrixIcon className="w-7 h-7 sm:w-8 sm:h-8" /> },
                          { id: 'web_widget', name: 'Storefront', icon: <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-black font-black text-xs flex items-center justify-center shadow-xs border border-gray-200">CF</div> },
                          { id: 'gmail', name: 'Gmail', icon: <GmailIcon className="w-7 h-7 sm:w-8 sm:h-8" /> },
                        ].find(app => app.id === id)).filter((ch): ch is NonNullable<typeof ch> => Boolean(ch)).map((ch) => {
                          const isSelected = ch.id === selectedAppId;
                          const isConn = connectedApps.has(ch.id);
                          const chatList = liveChatsByApp[ch.id] || [];
                          const unreadTotal = chatList.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
                          const badgeCount = unreadTotal > 0 ? unreadTotal : (isConn && chatList.length > 0 ? chatList.length : (ch.id === 'whatsapp' ? 30 : 0));
                          const activeTheme = APP_GRADIENT_THEMES[selectedAppId] || APP_GRADIENT_THEMES.whatsapp;

                          if (isSelected) {
                            return (
                              <div
                                key={ch.id}
                                className="relative px-2.5 pt-2 pb-1.5 rounded-t-2xl flex items-center justify-center transition-all duration-200 -mb-[1px] z-20 shadow-xs"
                                style={{
                                  backgroundColor: activeTheme.solidColor,
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSelectApp(ch.id);
                                    setMobileHubTab('chat');
                                  }}
                                  title={ch.name}
                                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center relative overflow-visible cursor-pointer active:scale-95 transition-transform"
                                >
                                  <div className="shrink-0 flex items-center justify-center">
                                    {ch.icon}
                                  </div>
                                  {badgeCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black flex items-center justify-center bg-red-500 text-white shadow-xs border-2 border-white dark:border-neutral-900 leading-none">
                                      {badgeCount > 99 ? '99+' : badgeCount}
                                    </span>
                                  )}
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div key={ch.id} className="pb-1 px-0.5 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  handleSelectApp(ch.id);
                                  setMobileHubTab('chat');
                                }}
                                title={ch.name}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center relative overflow-visible cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-xs"
                              >
                                <div className="shrink-0 flex items-center justify-center">
                                  {ch.icon}
                                </div>
                                {badgeCount > 0 ? (
                                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full text-[9px] font-black flex items-center justify-center bg-red-500 text-white shadow-xs border-2 border-white dark:border-neutral-900 leading-none">
                                    {badgeCount > 99 ? '99+' : badgeCount}
                                  </span>
                                ) : isConn ? (
                                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center pointer-events-none">
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 border border-white shadow-xs" />
                                  </span>
                                ) : null}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pb-1 pr-1 flex items-center">
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          title="Add Channel"
                          className="w-8 h-8 rounded-full border border-dashed border-gray-400 dark:border-neutral-600 bg-white/60 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95 shadow-2xs"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Sliding Content with Interactive Finger Drag Physics */}
                    <div
                      className="flex-1 min-h-0 w-full overflow-hidden flex flex-col rounded-b-3xl rounded-tr-2xl border-x border-b border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-sm relative touch-pan-y"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <div
                        className="w-full h-full flex flex-col flex-1 min-h-0"
                        style={{
                          transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.015}deg)`,
                          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        {mobileHubTab === 'chat' ? (
                          <MiddleChatColumn
                            appId={selectedAppId}
                            selectedContactPath={selectedContactPath}
                            onNavigatePath={setSelectedContactPath}
                            isLinked={isLinked}
                            onLinkSuccess={() => setIsLinked(true)}
                            onOpenAuth={() => setIsAuthModalOpen(true)}
                            darkMode={darkMode}
                            isAiActive={aiEnabledByChannel[selectedAppId] ?? false}
                            onToggleAi={() => handleToggleAi(selectedAppId)}
                            isConnected={connectedApps.has(selectedAppId)}
                            onOpenConnect={() => handleOpenConnectModal(selectedAppId)}
                            onDisconnect={handleDisconnectChannel}
                            liveContacts={liveChatsByApp[selectedAppId] ?? []}
                            onMobileBack={() => setMobileHubTab('contacts')}
                            onMessageActivity={handleMessageActivity}
                            isMobileEmbedded={true}
                            currentUser={currentUser}
                            channelError={channelErrors[selectedAppId]}
                            onMarkAsRead={handleMarkAsRead}
                            canSendMessages={canSendMessages}
                            canMakeCalls={canMakeCalls}
                          />
                        ) : (
                          <RightHubColumn
                            selectedAppId={selectedAppId}
                            selectedContactId={selectedContactPath[0] || ''}
                            selectedTopicId={selectedContactPath[1] || ''}
                            onSelectTopic={(topicId, contactId) => {
                              const currentChats = liveChatsByApp[selectedAppId] || [];
                              const parentId = contactId || selectedContactPath[0] || currentChats[0]?.id || '';
                              if (parentId) {
                                setSelectedContactPath([parentId, topicId]);
                                handleMarkAsRead(selectedAppId, parentId, topicId);
                              }
                              setMobileHubTab('chat');
                            }}
                            onSelectChat={(chatId) => {
                              const currentChats = liveChatsByApp[selectedAppId] || [];
                              const target = currentChats.find((c: any) => c.id === chatId);
                              if (target?.topics && target.topics.length > 0) {
                                setSelectedContactPath([chatId, target.topics[0].id]);
                                handleMarkAsRead(selectedAppId, chatId, target.topics[0].id);
                              } else {
                                setSelectedContactPath([chatId]);
                                handleMarkAsRead(selectedAppId, chatId);
                              }
                              setMobileHubTab('chat');
                            }}
                            onMarkAsRead={handleMarkAsRead}
                            isAiActive={aiEnabledByChannel[selectedAppId] ?? false}
                            onToggleAi={() => handleToggleAi(selectedAppId)}
                            isConnected={connectedApps.has(selectedAppId)}
                            activeTabOverride={mobileHubTab}
                            liveContacts={liveChatsByApp[selectedAppId] ?? []}
                            currentUser={currentUser}
                            onContactAdded={(contact) => handleContactAdded(selectedAppId, contact)}
                            onDisconnectChannel={handleDisconnectChannel}
                            onOpenConnect={() => handleOpenConnectModal(selectedAppId)}
                          />
                        )}
                      </div>

                      {/* Interactive Floating Peek Pill when dragging past 25px */}
                      {isDragging && Math.abs(dragOffset) > 25 && (
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 z-30 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-[11px] font-bold shadow-xl border border-white/20 flex items-center gap-1.5 pointer-events-none transition-opacity animate-in fade-in ${
                            dragOffset < 0 ? 'right-3' : 'left-3'
                          }`}
                        >
                          {dragOffset < 0 ? (
                            <>
                              <span>Slide to {channelDisplayNames[channelIds[channelIds.indexOf(selectedAppId) + 1]] || 'Next'}</span>
                              <span className="text-amber-400">→</span>
                            </>
                          ) : (
                            <>
                              <span className="text-amber-400">←</span>
                              <span>Slide to {channelDisplayNames[channelIds[channelIds.indexOf(selectedAppId) - 1]] || 'Prev'}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* VIEW 2: BILLING PLANS */}
            {activeTab === 'billing' && (
              <motion.div
                key="billing-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1 overflow-y-auto"
              >
                <BillingView currentUser={currentUser} />
              </motion.div>
            )}

            {/* VIEW 3: SETTINGS & BOT SETTINGS */}
            {(activeTab === 'settings' || activeTab === 'bot_settings') && (
              <motion.div
                key={activeTab === 'bot_settings' ? 'bot-settings-view' : 'settings-view'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1 overflow-y-auto"
              >
                <SettingsView
                  initialTab={activeTab === 'bot_settings' ? 'customization' : 'profile'}
                  currentUser={currentUser}
                  onUpdateUser={handleUpdateUser}
                />
              </motion.div>
            )}

            {/* VIEW 4: PROFILE */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1 overflow-y-auto"
              >
                <ProfileContactView />
              </motion.div>
            )}

            {/* VIEW 5: DEDICATED CONTACT PAGE (Not identical to Profile!) */}
            {activeTab === 'contact' && (
              <motion.div
                key="contact-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1 overflow-y-auto"
              >
                <ContactView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MODALS */}
        <AddChannelModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddChannel={handleAddChannel}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false);
            setAuthModalNotice(null);
          }}
          onSuccess={(user) => {
            setCurrentUser(user);
            setAuthModalNotice(null);
            restoreAndSyncConnectedApps(user);
          }}
          notice={authModalNotice}
        />

        {/* AI ACTIVATION & GATING MODAL */}
        <AiActivationModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          channelName={selectedAppId.toUpperCase()}
          onActivateTrial={handleActivateAiTrial}
          onGoToSettings={() => {
            setIsAiModalOpen(false);
            setActiveTab('settings');
          }}
          onGoToBilling={() => {
            setIsAiModalOpen(false);
            setActiveTab('billing');
          }}
        />

        {/* TEAM MANAGER MODAL */}
        <TeamManagerModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          currentUser={currentUser}
          availableChannels={Array.from(connectedApps)}
          projects={projects}
        />

        {/* CHANNEL CONNECTION MODAL (QR / OAuth / Token) */}
        <ConnectChannelModal
          appId={connectingAppId}
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
          onConnectSuccess={handleConnectSuccess}
        />

        {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
        <ImageLightbox />

        {/* AUTHENTIC USER PROFILE MODAL / DRAWER */}
        <UserProfileModal
          isOpen={Boolean(activeProfileContact)}
          contact={activeProfileContact}
          appId={activeProfileAppId || selectedAppId}
          onClose={closeProfile}
          darkMode={darkMode}
        />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <ChatStoreProvider>
      <HomeContent />
    </ChatStoreProvider>
  );
}

