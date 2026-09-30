"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
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

function SortableColumn({ id, children, activeThemeColor }: { id: string, children: (dragHandleProps: any) => React.ReactNode, activeThemeColor: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  // Enforce strictly horizontal drag by nullifying the Y translation
  const horizontalTransform = transform ? { ...transform, y: 0 } : null;

  const style = {
    transform: CSS.Translate.toString(horizontalTransform),
    transition,
    opacity: 1,
    zIndex: isDragging ? 99999 : 1,
    height: '100%',
  } as React.CSSProperties;

  return (
    <div 
      ref={setNodeRef} 
      style={{ ...style, '--theme-color': activeThemeColor } as React.CSSProperties} 
      className={`h-full w-full relative sortable-column-container overflow-hidden rounded-3xl group ${isDragging ? 'shadow-2xl' : ''}`}
    >
      <div className="absolute inset-0 opacity-0 pointer-events-none column-collapsed-bg cursor-grab active:cursor-grabbing" style={{ backgroundColor: 'var(--theme-color)', zIndex: 50, borderRadius: 'inherit', transition: 'opacity 0.42s cubic-bezier(0.4,0,0.2,1)' }} {...attributes} {...listeners}></div>
      {/* Hide scrollbars globally on the column content during drag to prevent jitter */}
      <div className={`h-full w-full column-main-content ${isDragging ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`} style={{ transition: 'opacity 0.42s cubic-bezier(0.4,0,0.2,1)' }}>
        {/* Pass grab/grabbing cursors via dragHandleProps. Note: buttons inside should override cursor to default/pointer */}
        {children({ 
          ...attributes, 
          ...listeners, 
          className: isDragging ? "cursor-grabbing" : "cursor-grab" 
        })}
      </div>
      
      {/* Icon only view */}
      <div className="absolute inset-0 hidden column-icon-only items-center justify-center bg-white dark:bg-[#1A1D23] border border-[#DFDFD4] dark:border-[#2E333D] rounded-3xl cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
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
import { BillingView } from '@/components/views/BillingView';
import { SettingsView } from '@/components/views/SettingsView';
import { ProfileContactView } from '@/components/views/ProfileContactView';
import { ContactView } from '@/components/views/ContactView';
import { MOCK_CONTACTS_BY_APP, getContactsForApp, APP_GRADIENT_THEMES } from '@/lib/mock_chats';
import { supabase } from '@/lib/supabaseClient';
import { SoundManager } from '@/lib/SoundManager';
import { ChatStoreProvider, useChatStore } from '@/lib/store/ChatStoreContext';
import { ImageLightbox } from '@/components/workspace/ImageLightbox';
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
      const next = [...prev, tabId];
      debouncedSyncPreferences({ detachedTabs: next });
      return next;
    });
    setColumnOrder(prev => {
      if (prev.includes(tabId)) return prev;
      const next = [...prev, tabId];
      debouncedSyncPreferences({ columnOrder: next });
      return next;
    });
  };

  const handleReattachTab = (tabId: string) => {
    setDetachedTabs(prev => {
      const next = prev.filter(t => t !== tabId);
      debouncedSyncPreferences({ detachedTabs: next });
      return next;
    });
    setColumnOrder(prev => {
      const next = prev.filter(c => c !== tabId);
      debouncedSyncPreferences({ columnOrder: next });
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
      setColumnOrder(prefs.columnOrder);
    }
    if (prefs.pinnedApps && Array.isArray(prefs.pinnedApps)) {
      setPinnedApps(prefs.pinnedApps);
      localStorage.setItem(getStorageKey('cf_pinned_apps'), JSON.stringify(prefs.pinnedApps));
    }
    if (prefs.detachedTabs && Array.isArray(prefs.detachedTabs)) {
      setDetachedTabs(prefs.detachedTabs);
    }
    if (prefs.panelSizes) {
      localStorage.setItem(getStorageKey('cf_panel_sizes'), JSON.stringify(prefs.panelSizes));
      Object.entries(prefs.panelSizes).forEach(([k, v]) => {
        localStorage.setItem(k, v as string);
      });
      if (groupRef.current) {
        try {
          if (Array.isArray(prefs.panelSizes)) {
            groupRef.current.setLayout(prefs.panelSizes);
          } else {
            const cols = (prefs.columnOrder || columnOrder).filter((c: string) => !(c === 'hub' && isRightHubCollapsed));
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
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleColDragStart = (event: any) => setActiveDragColId(event.active.id);
  const handleColDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveDragColId(null);
    if (over && active.id !== over.id) {
            setColumnOrder((prev) => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);
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
                
                // Normalise to 100% just in case
                const total = newSizes.reduce((a,b) => a+b, 0);
                const normalized = newSizes.map(s => (s/total)*100);
                
                groupRef.current.setLayout(normalized);
              }
            } catch {}
          }
        }, 10);
        
        return next;
      });
    }
  };

  
  const { isRightHubCollapsed } = useChatStore();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<MainNavTab>('workspace');
  const [selectedAppId, setSelectedAppId] = useState('whatsapp');
  const activeThemeColor = APP_GRADIENT_THEMES[selectedAppId]?.solidColor || '#1B6648';
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

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem('cf_projects');
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      } else {
        const defaultProjects = [{ id: 'default', name: 'Main Workspace', role: 'owner' }];
        setProjects(defaultProjects);
        localStorage.setItem('cf_projects', JSON.stringify(defaultProjects));
      }
    } catch {}
  }, []);

  const handleCreateProject = () => {
    const id = 'proj_' + Date.now();
    const newProj = { id, name: 'Burner Project ' + (projects.length), role: 'admin' };
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
    
    const storedApps = localStorage.getItem(getStorageKey('cf_connected_apps'));
    if (storedApps) {
      try { setConnectedApps(new Set(JSON.parse(storedApps))); } catch { setConnectedApps(new Set()); }
    } else {
      setConnectedApps(new Set());
    }
    
    const storedLayout = localStorage.getItem(getStorageKey('cf_panel_sizes'));
    if (storedLayout && groupRef.current) {
      try { groupRef.current.setLayout(JSON.parse(storedLayout)); } catch {}
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

  const baseChannelIds = Array.from(new Set([...pinnedApps, ...Array.from(connectedApps)]));
  const activeChannelIds = currentUser?.workspace_owner_id
    ? baseChannelIds.filter(id => currentUser?.permissions?.assigned_channels?.includes(id))
    : baseChannelIds;

  const displayedConnectedApps = currentUser?.workspace_owner_id
    ? new Set(Array.from(connectedApps).filter(id => currentUser?.permissions?.assigned_channels?.includes(id)))
    : connectedApps;

  const displayedPinnedApps = currentUser?.workspace_owner_id
    ? pinnedApps.filter(id => currentUser?.permissions?.assigned_channels?.includes(id))
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

        // Load connected apps scoped specifically to this user (defaults to completely disconnected)
        const userAppsKey = `cf_connected_apps_${u.id}`;
        const userApps = localStorage.getItem(userAppsKey);
        const savedApps: string[] = userApps ? JSON.parse(userApps) : [];

        // If user logged in with Google (or has a Google email), auto-link Gmail & Google Chat seamlessly
        const isGoogleUser = u.provider === 'google' || u.provider === 'oauth' || (u.email && u.email.endsWith('@gmail.com'));
        if (isGoogleUser) {
          let updated = false;
          if (!localStorage.getItem(getStorageKey('cf_gmail_account'))) {
            localStorage.setItem(getStorageKey('cf_gmail_account'), JSON.stringify({
              email: u.email,
              name: u.name,
              provider: 'Google Workspace / Gmail Support',
              status: 'Connected & Listening',
              googleLinked: true
            }));
            updated = true;
          }
          if (!localStorage.getItem(getStorageKey('cf_google_chat_account'))) {
            localStorage.setItem(getStorageKey('cf_google_chat_account'), JSON.stringify({
              email: u.email,
              name: u.name,
              space: 'Workspace Team Chat',
              googleLinked: true
            }));
            updated = true;
          }
          if (!savedApps.includes('gmail')) {
            savedApps.push('gmail');
            updated = true;
          }
          if (!savedApps.includes('google_chat')) {
            savedApps.push('google_chat');
            updated = true;
          }
          if (updated) {
            localStorage.setItem(userAppsKey, JSON.stringify(savedApps));
            const globalApps = new Set(JSON.parse(localStorage.getItem(getStorageKey('cf_connected_apps')) || '[]'));
            globalApps.add('gmail');
            globalApps.add('google_chat');
            localStorage.setItem(getStorageKey('cf_connected_apps'), JSON.stringify(Array.from(globalApps)));
          }
        }

        setConnectedApps(new Set<string>(savedApps));

        // Immediately seed pre-extracted bridge contacts for all connected apps so UI displays without lag
        const initialChatsMap: Record<string, any[]> = {};
        savedApps.forEach((appId) => {
          const defaultContacts = getContactsForApp(appId, true);
          if (defaultContacts && defaultContacts.length > 0) {
            initialChatsMap[appId] = defaultContacts;
          }
        });
        if (Object.keys(initialChatsMap).length > 0) {
          setLiveChatsByApp((prev) => ({
            ...prev,
            ...initialChatsMap,
          }));
        }

        // Dynamically load chats for ALL connected apps for this user
        savedApps.forEach((appId) => {
          if (appId === 'whatsapp') {
            fetch('/api/channels/whatsapp/chats')
              .then((r) => r.json())
              .then((data) => {
                if (data.instance) {
                  try {
                    if (data.instance.phone) {
                      localStorage.setItem(getStorageKey('cf_whatsapp_number'), data.instance.phone);
                    }
                    localStorage.setItem(getStorageKey('cf_whatsapp_name'), data.instance.profileName || 'WhatsApp Business');
                    window.dispatchEvent(new Event('storage'));
                  } catch {}
                }
                if (Array.isArray(data.chats) && data.chats.length > 0) {
                  const sorted = [...data.chats].sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
                  setLiveChatsByApp((prev) => ({
                    ...prev,
                    whatsapp: sorted
                  }));
                }
              })
              .catch(() => {});
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
              token = localStorage.getItem(getStorageKey('cf_discord_token')) || '';
              if (!token) {
                const acc = localStorage.getItem(getStorageKey('cf_discord_account'));
                if (acc) token = JSON.parse(acc).token || '';
              }
            } catch {}
            fetch(`/api/channels/discord/chats?userId=${encodeURIComponent(u.id)}&token=${encodeURIComponent(token)}`)
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
                    discord: sorted
                  }));
                }
              })
              .catch(() => {});
          } else if (appId === 'gmail') {
            let gmEmail = u.email || session?.user?.email || '';
            // @ts-ignore
            let accessToken = session?.accessToken || '';
            try {
              const gm = localStorage.getItem(getStorageKey('cf_google_chat_account'));
              if (gm) {
                const parsed = JSON.parse(gm);
                gmEmail = parsed.email || gmEmail;
                if (!accessToken) accessToken = parsed.accessToken || '';
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
                }
              })
              .catch(() => {});
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
        if (window.location.hash || window.location.search.includes('code=')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    });

    // Check NextAuth session
    // @ts-ignore
    if (session?.user && session?.accessToken) {
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
  });
  
  const [channelErrors, setChannelErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!connectedApps.has(selectedAppId)) return;

    let isMounted = true;
    const fetchActiveChats = async () => {
      try {
        let endpoint = '';
        if (selectedAppId === 'whatsapp') {
          endpoint = '/api/channels/whatsapp/chats';
        } else if (selectedAppId === 'instagram') {
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
          endpoint = `/api/channels/instagram/chats?userId=${encodeURIComponent(currentUser?.id || '')}&pageId=${encodeURIComponent(pageId)}&igId=${encodeURIComponent(igId)}&accessToken=${encodeURIComponent(accessToken)}&sessionId=${encodeURIComponent(sessionId)}`;
        } else if (selectedAppId === 'messenger') {
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
          endpoint = `/api/channels/messenger/chats?pageId=${encodeURIComponent(pageId)}&token=${encodeURIComponent(token)}`;
        } else if (selectedAppId === 'telegram') {
          let token = '';
          let session = '';
          try {
            session = localStorage.getItem(getStorageKey('cf_telegram_session')) || '';
            token = localStorage.getItem(getStorageKey('cf_telegram_token')) || '';
          } catch {}
          endpoint = `/api/channels/telegram/chats?session=${encodeURIComponent(session)}&token=${encodeURIComponent(token)}`;
        } else if (selectedAppId === 'gmail') {
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
          endpoint = `/api/channels/gmail/chats?userId=${encodeURIComponent(currentUser?.id || '')}&email=${encodeURIComponent(email)}&accessToken=${encodeURIComponent(accessToken)}`;
        } else if (selectedAppId === 'x_twitter') {
          let session = '';
          try {
            session = localStorage.getItem(getStorageKey('cf_x_twitter_session')) || '';
          } catch {}
          endpoint = `/api/channels/x_twitter/chats?userId=${encodeURIComponent(currentUser?.id || '')}&session=${encodeURIComponent(session)}`;
        } else if (selectedAppId === 'google_chat') {
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
          endpoint = `/api/channels/google_chat/chats?userId=${encodeURIComponent(currentUser?.id || '')}&email=${encodeURIComponent(email)}&accessToken=${encodeURIComponent(accessToken)}`;
        } else if (selectedAppId === 'irc') {
          let channel = '#chatbot-farm';
          let host = 'irc.libera.chat';
          try {
            channel = localStorage.getItem(getStorageKey('cf_irc_channel')) || '#chatbot-farm';
            host = localStorage.getItem(getStorageKey('cf_irc_host')) || 'irc.libera.chat';
          } catch {}
          endpoint = `/api/channels/irc/chats?userId=${encodeURIComponent(currentUser?.id || '')}&channel=${encodeURIComponent(channel)}&host=${encodeURIComponent(host)}`;
        } else if (selectedAppId === 'linkedin') {
          let token = '';
          try {
            token = localStorage.getItem(getStorageKey('cf_linkedin_token')) || localStorage.getItem(getStorageKey('cf_linkedin_cookie')) || '';
          } catch {}
          endpoint = `/api/channels/linkedin/chats?userId=${encodeURIComponent(currentUser?.id || '')}&token=${encodeURIComponent(token)}`;
        } else if (selectedAppId === 'discord') {
          let token = '';
          try {
            token = localStorage.getItem(getStorageKey('cf_discord_token')) || '';
            if (!token) {
              const acc = localStorage.getItem(getStorageKey('cf_discord_account'));
              if (acc) token = JSON.parse(acc).token || '';
            }
          } catch {}
          endpoint = `/api/channels/discord/chats?userId=${encodeURIComponent(currentUser?.id || '')}&token=${encodeURIComponent(token)}`;
        } else {
          endpoint = `/api/channels/${selectedAppId}/chats?userId=${encodeURIComponent(currentUser?.id || '')}`;
        }

        if (!endpoint) return;

        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.chats)) {
            const rawChats = data.chats;
            setLiveChatsByApp((prev) => {
              const currentList = prev[selectedAppId] || [];
              const localSimulated = currentList.filter((c: any) => c.id?.startsWith('test_') || c.id?.startsWith('sim_'));
              const combined = [...rawChats];
              for (const sim of localSimulated) {
                if (!combined.some((c: any) => c.id === sim.id)) {
                  combined.push(sim);
                }
              }
              const sorted = combined.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
              return {
                ...prev,
                [selectedAppId]: sorted,
              };
            });
            setSelectedContactPath((prev: string[]) => {
              if (prev && rawChats.some((c: any) => c.id === prev)) return prev;
              return rawChats.length > 0 ? rawChats[0].id : '';
            });
          }
        }
      } catch (err) {
        console.error(`Failed to sync ${selectedAppId} chats:`, err);
      }
    };

    fetchActiveChats();
    const interval = setInterval(fetchActiveChats, 7000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [connectedApps, selectedAppId]);

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
        const updated = {
          ...contact,
          lastMessage: messageText,
          lastMessageTime: 'Just now',
          time: 'Just now',
          timestamp: now,
        };
        const nextList = [updated, ...currentList.filter((_: any, i: number) => i !== idx)];
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

  const handleDisconnectChannel = (appId: string) => {
    setConnectedApps((prev) => {
      const next = new Set(prev);
      next.delete(appId);
      try {
        if (currentUser?.id) {
          localStorage.setItem(getStorageKey(`cf_connected_apps_${currentUser.id}`), JSON.stringify(Array.from(next)));
        }
      } catch {}
      return next;
    });
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
    let contacts = liveChatsByApp[appId];
    if (!contacts || contacts.length === 0) {
      contacts = getContactsForApp(appId, connectedApps.has(appId));
      if (contacts.length > 0) {
        setLiveChatsByApp((prev) => ({
          ...prev,
          [appId]: contacts,
        }));
      }
    }
    if (contacts && contacts.length > 0) {
      setSelectedContactPath([contacts[0].id]);
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
    setConnectedApps((prev) => {
      const next = new Set(Array.from(prev).concat(appId));
      try {
        if (currentUser?.id) {
          localStorage.setItem(getStorageKey(`cf_connected_apps_${currentUser.id}`), JSON.stringify(Array.from(next)));
        }
        localStorage.setItem(getStorageKey('cf_connected_apps'), JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
    const contacts = getContactsForApp(appId, true);
    if (contacts.length > 0) {
      setLiveChatsByApp((prev) => ({
        ...prev,
        [appId]: contacts,
      }));
      setSelectedContactPath([contacts[0].id]);
    }
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
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
        />

        {/* 2. MAIN WORKSPACE / PAGE VIEWS WITH FLUID TRANSITIONS */}
        <div className="flex-1 min-h-0 w-full max-w-full min-w-0 p-1 md:p-2 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'workspace' && (
              <motion.div
                key="workspace-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-full min-w-0 h-full min-h-0 flex flex-col"
              >
                {/* 1. DESKTOP 3-COLUMN WORKSPACE (Visible on screen width >= md / 768px) */}
                <div className="hidden md:flex w-full h-full min-h-0">
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
                    .custom-resize-handle::after {
                      content: "";
                      position: absolute;
                      width: 6px;
                      height: 32px;
                      background-color: ${activeThemeColor};
                      border-radius: 4px;
                      opacity: 1;
                      transition: height 0.2s, background-color 0.2s, opacity 0.2s;
                    }
                    .custom-resize-handle:hover::after,
                    .custom-resize-handle[data-resize-handle-state="drag"]::after {
                      height: 32px;
                      background-color: ${activeThemeColor};
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
                    @container (max-width: 200px) {
                      .app-item-text { display: none !important; }
                      .app-item-container { justify-content: center !important; padding: 0.5rem !important; }
                      .app-item-ai-toggle { display: none !important; }
                    }
                    @container (max-width: 80px) {
                      .column-main-content { opacity: 0 !important; pointer-events: none !important; display: none !important; }
                      .column-collapsed-bg { opacity: 1 !important; pointer-events: auto !important; }
                      .column-icon-only { display: none !important; }
                    }
                  ` }} />
                  <DndContext sensors={colSensors} collisionDetection={closestCorners} onDragStart={handleColDragStart} onDragEnd={handleColDragEnd} modifiers={[restrictToHorizontalAxis]}>
                    <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                      <Group key={columnOrder.filter(c => !(c === 'hub' && isRightHubCollapsed)).length} groupRef={groupRef} orientation="horizontal" id="desktop-workspace-main" className="w-full h-full overflow-hidden flex gap-1.5" onLayoutChanged={(layout) => {
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
                          return visibleColumns.map((colId, index) => {
                            const colThemeColor = activeThemeColor;
                            
                            let savedSize = undefined;
                            try {
                              const stored = localStorage.getItem(getStorageKey('cf_panel_sizes'));
                              if (stored) {
                                const parsed = JSON.parse(stored);
                                if (!Array.isArray(parsed) && parsed[colId] !== undefined) savedSize = parsed[colId];
                              }
                            } catch {}

                            return (
                              <React.Fragment key={colId}>
                                <Panel 
                                  id={colId}
                                  defaultSize={savedSize !== undefined ? savedSize : (colId === 'switcher' ? 25 : colId === 'chat' ? (isRightHubCollapsed ? 75 : 45) : 30)} 
                                  minSize={colId === 'switcher' ? 18 : colId === 'chat' ? 30 : 22}
                                  style={{ overflow: activeDragColId ? 'visible' : 'hidden', zIndex: activeDragColId === colId ? 9999 : 1 }}
                                >
                                <SortableColumn id={colId} activeThemeColor={colThemeColor}>
                                  {(dragHandleProps) => (
                                    colId === 'switcher' ? (
                                      <AppSwitcherColumn
                                        dragHandleProps={dragHandleProps}
                                        appLastActivity={appLastActivity}
                                        selectedAppId={selectedAppId}
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
                                      />
                                    ) : colId === 'hub' ? (
                                      <RightHubColumn
                                        dragHandleProps={dragHandleProps}
                                        selectedAppId={selectedAppId}
                                        selectedContactId={selectedContactPath[0] || ''}
                            
                                        onSelectChat={(chatId) => setSelectedContactPath([chatId])}
                                        isAiActive={aiEnabledByChannel[selectedAppId] ?? false}
                                        onToggleAi={() => handleToggleAi(selectedAppId)}
                                        isConnected={connectedApps.has(selectedAppId)}
                                        liveContacts={liveChatsByApp[selectedAppId] ?? []}
                                        currentUser={currentUser}
                                        onContactAdded={(contact) => handleContactAdded(selectedAppId, contact)}
                                        onDisconnectChannel={handleDisconnectChannel}
                                        detachedTabs={detachedTabs}
                                        onDetach={handleDetachTab}
                                      />
                                    ) : (colId === 'analytics' || colId === 'settings') ? (
                                      <RightHubColumn
                                        dragHandleProps={dragHandleProps}
                                        selectedAppId={selectedAppId}
                                        selectedContactId={selectedContactPath[0] || ''}
                                        onSelectChat={(chatId) => setSelectedContactPath([chatId])}
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
                              </Panel>
                              {index < visibleColumns.length - 1 && (
                                  <Separator className="custom-resize-handle" />
                                )}
                              </React.Fragment>
                            );
                          });
                        })()}
                      </Group>
                    </SortableContext>
                  </DndContext>
                </div>

                {/* 2. MOBILE RESPONSIVE WORKSPACE (Visible on screen width < md / 768px) */}
                <div className="flex md:hidden flex-row h-full w-full max-w-full min-w-0 gap-1.5 overflow-hidden">
                  {/* Left Side Dock (Icons Only: Chat, Contacts, Stats, Settings) */}
                  <div className="w-11 sm:w-12 py-3 px-1.5 flex flex-col items-center gap-1.5.5 bg-white dark:bg-[#1A1D23] rounded-2xl sm:rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] shadow-xs shrink-0 self-stretch justify-start">
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
                  </div>

                  {/* Main Work Area: Sticked Channel Icons Atop Conversation Window */}
                  <div className="flex-1 min-w-0 max-w-full h-full min-h-0 flex flex-col relative">
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
                          />
                        ) : (
                          <RightHubColumn
                            selectedAppId={selectedAppId}
                            selectedContactId={selectedContactPath[0] || ''}
                            
                            onSelectChat={(chatId) => {
                              setSelectedContactPath([chatId]);
                              setMobileHubTab('chat');
                            }}
                            isAiActive={aiEnabledByChannel[selectedAppId] ?? false}
                            onToggleAi={() => handleToggleAi(selectedAppId)}
                            isConnected={connectedApps.has(selectedAppId)}
                            activeTabOverride={mobileHubTab}
                            liveContacts={liveChatsByApp[selectedAppId] ?? []}
                            currentUser={currentUser}
                            onContactAdded={(contact) => handleContactAdded(selectedAppId, contact)}
                            onDisconnectChannel={handleDisconnectChannel}
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
                  </div>
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
                <BillingView />
              </motion.div>
            )}

            {/* VIEW 3: SETTINGS & BYOK */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1 overflow-y-auto"
              >
                <SettingsView />
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
            try {
              const userAppsKey = `cf_connected_apps_${user.id}`;
              const userApps = localStorage.getItem(userAppsKey);
              if (userApps) {
                setConnectedApps(new Set<string>(JSON.parse(userApps)));
              } else {
                setConnectedApps(new Set<string>());
                localStorage.setItem(userAppsKey, JSON.stringify([]));
              }
            } catch {}
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

