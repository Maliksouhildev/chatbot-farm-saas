"use client";

import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Bot, Sparkles, Pin } from 'lucide-react';
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
  MatrixIcon,
  ViberIcon,
  SnapchatIcon
} from '@/components/icons/BrandIcons';
import { APP_GRADIENT_THEMES, getRealInstagramProfile, isChannelFunctional, isLightColor } from '@/lib/mock_chats';
import { AppCustomizerPopover } from './AppCustomizerPopover';

export interface AppChannel {
  id: string;
  name: string;
  iconComponent: React.ReactNode;
  badgeColor: string;
  unread: number;
  status: 'connected' | 'unlinked';
  phone?: string;
  subtitle?: string;
  isComingSoon?: boolean;
}

interface AppSwitcherColumnProps {
  selectedAppId: string;
  onSelectApp: (appId: string) => void;
  onOpenAddModal: () => void;
  onOpenConnectModal?: (appId: string) => void;
  aiEnabledByChannel?: Record<string, boolean>;
  onToggleAi?: (channelId: string) => void;
  onToggleAllAi?: (enable: boolean) => void;
  connectedApps?: Set<string>;
  pinnedApps?: string[];
  onUnpinApp?: (appId: string) => void;
  onPinApp?: (appId: string) => void;
  appLastActivity?: Record<string, number>;
  onReorderApps?: (sourceId: string, targetId: string) => void;
  onSetPinnedApps?: (newOrder: string[]) => void;
  unreadCounts?: Record<string, number>;
  dragHandleProps?: any;
  canEditUi?: boolean;
  canManageChannels?: boolean;
  onDisconnectChannel?: (appId: string) => void;
}


// Global cursor tracker for stationary hit-testing across DOM re-renders and unpin reflows
let globalPointerCoords = { x: -1, y: -1, timestamp: 0 };

if (typeof window !== 'undefined') {
  const updateGlobalPointer = (e: MouseEvent | PointerEvent) => {
    globalPointerCoords.x = e.clientX;
    globalPointerCoords.y = e.clientY;
    globalPointerCoords.timestamp = Date.now();
  };
  window.addEventListener('pointermove', updateGlobalPointer, { passive: true });
  window.addEventListener('mousemove', updateGlobalPointer, { passive: true });
  window.addEventListener('pointerdown', updateGlobalPointer, { passive: true });
  window.addEventListener('click', updateGlobalPointer, { passive: true });
}

interface SortableChannelProps {
  isAiActive: boolean;
  onToggleAi?: (id: string) => void;
  unreadCount: number;
  ch: any;
  isSelected: boolean;
  appTheme: any;
  isChannelConnected: (id: string) => boolean;
  onSelectApp: (id: string) => void;
  onOpenConnectModal?: (id: string) => void;
  onUnpinApp?: (id: string, clientX?: number, clientY?: number) => void;
  onOpenCustomize?: (channel: any, rect: DOMRect) => void;
  isPinnedTop?: boolean;
  onTogglePinTop?: (id: string) => void;
  canEditUi?: boolean;
  mounted?: boolean;
  isHovered?: boolean;
  onHover?: () => void;
  onUnhover?: () => void;
}

function SortableChannelItem({
  ch,
  isSelected,
  appTheme,
  isChannelConnected,
  onSelectApp,
  onOpenConnectModal,
  onUnpinApp,
  isAiActive,
  onToggleAi,
  unreadCount,
  onOpenCustomize,
  isPinnedTop = false,
  onTogglePinTop,
  canEditUi = true,
  mounted = false,
  isHovered = false,
  onHover,
  onUnhover,
}: SortableChannelProps) {
  const isDraggable = canEditUi && !isPinnedTop;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ch.id,
    disabled: !isDraggable,
  });

  const isLight = isLightColor(appTheme.solidColor);
  const selectedTextColor = isLight ? '#0F172A' : '#FFFFFF';

  const style = {
    transform: isDraggable ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.25 : (ch.isComingSoon ? 0.45 : 1),
    filter: ch.isComingSoon ? 'grayscale(95%)' : undefined,
    backgroundColor: isSelected ? appTheme.solidColor : undefined,
    color: isSelected ? selectedTextColor : undefined,
    boxShadow: isSelected ? `0 4px 14px 0 ${appTheme.solidColor}40` : undefined,
    userSelect: 'none' as const,
  };

  const handleUnpinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof window !== 'undefined') {
      globalPointerCoords.x = e.clientX;
      globalPointerCoords.y = e.clientY;
      globalPointerCoords.timestamp = Date.now();
      window.dispatchEvent(new CustomEvent('cf-unpin-refresh', {
        detail: { x: e.clientX, y: e.clientY }
      }));
    }
    onUnpinApp && onUnpinApp(ch.id, e.clientX, e.clientY);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      draggable={false}
      {...(isDraggable ? attributes : {})}
      {...(isDraggable ? listeners : {})}
      id={`channel-switcher-${ch.id}`}
      data-app-id={ch.id}
      onMouseEnter={onHover}
      onPointerEnter={onHover}
      onPointerOver={onHover}
      onMouseMove={onHover}
      onPointerMove={onHover}
      onMouseLeave={onUnhover}
      onPointerLeave={onUnhover}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        onOpenCustomize && onOpenCustomize(ch, rect);
      }}
      className={`app-item-container w-full p-2.5 sm:px-3 rounded-2xl flex items-center gap-2.5 transition-all text-left relative shadow-xs ${isHovered ? 'is-hovered' : ''} ${
        ch.isComingSoon 
          ? 'cursor-not-allowed opacity-50 grayscale hover:opacity-75 hover:grayscale-0' 
          : isDraggable 
            ? 'cursor-grab active:cursor-grabbing' 
            : 'cursor-pointer'
      } select-none ${
        isSelected
          ? 'font-bold border-transparent scale-[1.01]'
          : 'bg-white dark:bg-[#1E222A] text-gray-800 dark:text-gray-200 border border-[#DFDFD4] dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800/80'
      }`}
    >
      {canEditUi && (
        <button 
          type="button"
          onClick={handleUnpinClick}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className={`app-item-unpin-btn absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white dark:bg-red-500 dark:hover:bg-red-600 rounded-full flex items-center justify-center shadow-sm z-50 transition-all cursor-pointer border border-white dark:border-neutral-800 hover:scale-110 before:absolute before:-inset-1.5 before:content-[''] ${
            isHovered 
              ? 'opacity-100 pointer-events-auto visible' 
              : 'opacity-0 pointer-events-none invisible'
          }`}
          title="Remove from Panel"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      )}

      <div 
        className={`absolute inset-0 z-10 ${ch.isComingSoon ? 'cursor-not-allowed' : isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`} 
        onClick={() => {
          if (ch.isComingSoon) {
            return;
          }
          onSelectApp(ch.id);
          if (!isChannelConnected(ch.id) && onOpenConnectModal) {
            onOpenConnectModal(ch.id);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const el = (e.currentTarget.closest('.app-item-container') as HTMLElement) || e.currentTarget;
          const rect = el.getBoundingClientRect();
          onOpenCustomize && onOpenCustomize(ch, rect);
        }}
      />

      <div className="relative shrink-0 flex items-center justify-center z-0 pointer-events-none select-none">
        {ch.iconComponent}
        {unreadCount > 0 && mounted && (
          <span 
            suppressHydrationWarning 
            className="app-corner-badge absolute -top-1.5 -right-2 bg-red-500 text-white text-[9.5px] font-black min-w-[18px] h-4 px-1 rounded-full inline-flex items-center justify-center text-center shadow-md border-2 border-white dark:border-[#1E222A] pointer-events-none z-20 tabular-nums leading-none select-none"
          >
            {unreadCount > 999 ? '999+' : unreadCount}
          </span>
        )}
      </div>

      <div className="app-item-text flex-1 min-w-0 flex flex-col justify-center z-0 pointer-events-none">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-extrabold truncate flex items-center gap-1 min-w-0" style={{ color: isSelected ? selectedTextColor : appTheme.textColor }}>
            <span className="truncate">{ch.name}</span>
            {ch.isComingSoon && (
              <span className={`shrink-0 px-1.5 py-0.2 text-[8px] font-bold rounded-md ${
                isSelected && isLight ? 'bg-black/15 text-slate-950 border border-black/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}>
                Bientôt
              </span>
            )}
            {isPinnedTop && !ch.isComingSoon && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onTogglePinTop && onTogglePinTop(ch.id);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="shrink-0 p-1 rounded-md hover:bg-amber-500/10 active:scale-95 transition-all cursor-pointer z-20 group/pin"
                title="Pinned to Top (Click to Unpin)"
              >
                <Pin className={`w-3 h-3 rotate-45 transition-transform group-hover/pin:-rotate-12 ${
                  isSelected 
                    ? (isLight ? 'text-slate-950 fill-slate-950 drop-shadow-xs' : 'text-white fill-white/80 drop-shadow-xs')
                    : 'text-amber-500 fill-amber-500/80 dark:text-amber-400 dark:fill-amber-400/80 drop-shadow-xs'
                }`} />
              </button>
            )}
          </span>
        </div>
        
        <span className={`text-[9px] font-semibold truncate mt-0.5 ${
          isSelected 
            ? (isLight ? 'text-slate-900/90 font-bold' : 'text-white/90') 
            : 'text-gray-400 dark:text-gray-500'
        }`}>
          {ch.isComingSoon ? 'Bientôt disponible' : ch.subtitle}
        </span>
      </div>

      {/* Right Actions: Centered Notification Badge and AI Toggle */}
      <div className="app-item-actions flex items-center h-5 gap-1.5 ml-auto shrink-0 z-20">
        {unreadCount > 0 && mounted && (
          <span 
            suppressHydrationWarning 
            className="app-inline-badge shrink-0 inline-flex items-center justify-center bg-red-500 text-white text-[10.5px] font-black min-w-[20px] h-5 px-1.5 rounded-full shadow-xs tabular-nums text-center pointer-events-none z-10 leading-none select-none"
          >
            {unreadCount > 999 ? '999+' : unreadCount}
          </span>
        )}

        {!ch.isComingSoon && onToggleAi && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleAi(ch.id); }}
            onPointerDown={(e) => e.stopPropagation()}
            className={`app-item-ai-toggle relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-all duration-200 cursor-pointer shadow-inner focus:outline-none hover:scale-105 border border-transparent ${
              isAiActive ? 'opacity-100' : 'bg-gray-200 dark:bg-gray-700/80 opacity-60 hover:opacity-100 dark:border-neutral-700'
            }`}
            style={isAiActive ? { backgroundColor: appTheme.solidColor, boxShadow: `0 0 8px ${appTheme.solidColor}60` } : undefined}
            title={isAiActive ? 'Disable AI for this channel' : 'Enable AI for this channel'}
          >
            <span
              className={`flex items-center justify-center h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300`}
              style={isAiActive ? { transform: 'translateX(18px)' } : { transform: 'translateX(2px)' }}
            >
              {isAiActive ? <Bot className="w-2.5 h-2.5" style={{ color: appTheme.solidColor }} /> : <Sparkles className="w-2.5 h-2.5 text-gray-400" />}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export const AppSwitcherColumn: React.FC<AppSwitcherColumnProps> = ({
  selectedAppId,
  onSelectApp,
  onOpenAddModal,
  onOpenConnectModal,
  aiEnabledByChannel = {},
  onToggleAi,
  onToggleAllAi,
  connectedApps = new Set(),
  pinnedApps = ['whatsapp', 'telegram', 'gmail'],
  onUnpinApp,
  onReorderApps,
  onPinApp,
  onSetPinnedApps,
  appLastActivity = {},
  unreadCounts = {},
  dragHandleProps,
  canEditUi = true,
  canManageChannels = true,
  onDisconnectChannel,
}) => {
  const isChannelConnected = (id: string) => connectedApps.has(id);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const [localPinned, setLocalPinned] = useState<string[]>(pinnedApps);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [customizeTarget, setCustomizeTarget] = useState<{ channel: any; rect: DOMRect } | null>(null);

  const [pinnedTopApps, setPinnedTopApps] = useState<string[]>(['whatsapp']);
  const [hoveredAppId, setHoveredAppId] = useState<string | null>(null);

  const checkStationaryHover = useCallback((clientX?: number, clientY?: number) => {
    const x = clientX !== undefined ? clientX : globalPointerCoords.x;
    const y = clientY !== undefined ? clientY : globalPointerCoords.y;
    if (typeof window === 'undefined' || x < 0 || y < 0) return;
    try {
      const el = document.elementFromPoint(x, y);
      const container = el?.closest('.app-item-container') as HTMLElement | null;
      const nextAppId = container?.getAttribute('data-app-id') || null;
      setHoveredAppId(nextAppId);
    } catch {
      setHoveredAppId(null);
    }
  }, []);

  useEffect(() => {
    const handleUnpinRefresh = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (customEvt.detail) {
        globalPointerCoords.x = customEvt.detail.x;
        globalPointerCoords.y = customEvt.detail.y;
        globalPointerCoords.timestamp = Date.now();
      }
      checkStationaryHover(customEvt.detail?.x, customEvt.detail?.y);
    };

    window.addEventListener('cf-unpin-refresh', handleUnpinRefresh);
    return () => {
      window.removeEventListener('cf-unpin-refresh', handleUnpinRefresh);
    };
  }, [checkStationaryHover]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cf_pinned_top_apps');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setPinnedTopApps(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      globalPointerCoords.x = e.clientX;
      globalPointerCoords.y = e.clientY;
      globalPointerCoords.timestamp = Date.now();

      const target = e.target as HTMLElement | null;
      const appContainer = target?.closest('.app-item-container') as HTMLElement | null;
      if (appContainer) {
        const appId = appContainer.getAttribute('data-app-id');
        if (appId && appId !== hoveredAppId) {
          setHoveredAppId(appId);
        }
      } else {
        if (hoveredAppId !== null) {
          setHoveredAppId(null);
        }
      }
    };

    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
    };
  }, [hoveredAppId]);

  const handleTogglePinTop = (appId: string) => {
    setPinnedTopApps((prev) => {
      let next: string[];
      if (prev.includes(appId)) {
        next = prev.filter(id => id !== appId);
      } else {
        next = [appId, ...prev.filter(id => id !== appId)];
      }
      try {
        localStorage.setItem('cf_pinned_top_apps', JSON.stringify(next));
      } catch {}

      // Keep pinned apps pinned at the top of localPinned order without losing ANY app
      setLocalPinned((prevLocal) => {
        const allApps = Array.from(new Set([...prevLocal, appId]));
        const pinnedList = next.filter(id => allApps.includes(id));
        const unpinnedList = allApps.filter(id => !next.includes(id));
        const newOrder = [...pinnedList, ...unpinnedList];
        if (onSetPinnedApps) onSetPinnedApps(newOrder);
        return newOrder;
      });

      return next;
    });
  };

  const handleUnpinAppWrapper = (appId: string, clientX?: number, clientY?: number) => {
    setLocalPinned((prev) => prev.filter(id => id !== appId));
    if (pinnedTopApps.includes(appId)) {
      setPinnedTopApps((prev) => {
        const next = prev.filter(id => id !== appId);
        try {
          localStorage.setItem('cf_pinned_top_apps', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
    if (onUnpinApp) {
      onUnpinApp(appId);
    }

    if (clientX !== undefined && clientY !== undefined && clientX >= 0 && clientY >= 0) {
      const detectNextHovered = () => {
        checkStationaryHover(clientX, clientY);
      };
      requestAnimationFrame(detectNextHovered);
      setTimeout(detectNextHovered, 30);
      setTimeout(detectNextHovered, 80);
      setTimeout(detectNextHovered, 150);
    } else {
      setHoveredAppId(null);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Collision detection that strictly ignores pinned apps so dragged apps can never target or displace pinned apps
  const collisionDetectionStrategy = React.useCallback(
    (args: any) => {
      const filteredContainers = args.droppableContainers.filter(
        (container: any) => !pinnedTopApps.includes(container.id)
      );
      return closestCenter({
        ...args,
        droppableContainers: filteredContainers,
      });
    },
    [pinnedTopApps]
  );

  const [dragItemWidth, setDragItemWidth] = useState<number | null>(null);

  const handleDragStart = (event: any) => {
    if (pinnedTopApps.includes(event.active.id)) {
      return;
    }
    setActiveDragId(event.active.id);
    if (typeof document !== 'undefined') {
      const el = document.getElementById(`channel-switcher-${event.active.id}`);
      if (el) {
        setDragItemWidth(el.getBoundingClientRect().width);
      }
      document.body.classList.add('is-dragging');
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveDragId(null);
    setDragItemWidth(null);
    if (typeof document !== 'undefined') {
      document.body.classList.remove('is-dragging');
    }
    
    if (over && active.id !== over.id) {
      if (pinnedTopApps.includes(active.id) || pinnedTopApps.includes(over.id)) {
        return;
      }
      const oldIndex = localPinned.indexOf(active.id);
      const newIndex = localPinned.indexOf(over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(localPinned, oldIndex, newIndex);
        setLocalPinned(reordered);
        if (onSetPinnedApps) onSetPinnedApps(reordered);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
    setDragItemWidth(null);
    if (typeof document !== 'undefined') {
      document.body.classList.remove('is-dragging');
    }
  };

  
  // Sync when parent updates (but not while we are dragging)
  React.useEffect(() => {
    setLocalPinned(pinnedApps);
  }, [pinnedApps]);

  const [draggedAppId, setDraggedAppId] = React.useState<string | null>(null);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  // Read real dynamic account profiles from localStorage
  const [accountProfiles, setAccountProfiles] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const updateProfiles = () => {
      try {
        const profiles: Record<string, string> = {};
        const realIg = getRealInstagramProfile();
        if (realIg.username) {
          profiles.instagram = `@${realIg.username}`;
        }

        const tgUser = localStorage.getItem('cf_telegram_user');
        if (tgUser) {
          const p = JSON.parse(tgUser);
          if (p.username) profiles.telegram = `@${p.username}`;
          else if (p.phone) profiles.telegram = p.phone;
          else if (p.firstName) profiles.telegram = p.firstName;
        } else {
          const tg = localStorage.getItem('cf_telegram_bot');
          if (tg) {
            const p = JSON.parse(tg);
            if (p.username) profiles.telegram = `@${p.username}`;
            else if (p.first_name) profiles.telegram = p.first_name;
          }
        }

        const fb = localStorage.getItem('cf_messenger_page');
        if (fb) {
          const p = JSON.parse(fb);
          if (p.name) profiles.messenger = p.name;
        }

        const gm = localStorage.getItem('cf_gmail_account');
        if (gm) {
          const p = JSON.parse(gm);
          if (p.email) profiles.gmail = p.email;
        }

        const wa = localStorage.getItem('cf_whatsapp_number');
        if (wa) {
          profiles.whatsapp = wa;
        }

        const wa2 = localStorage.getItem('cf_whatsapp_2_number');
        if (wa2) profiles.whatsapp_2 = wa2;

        const sig = localStorage.getItem('cf_signal_phone');
        if (sig) profiles.signal = sig;

        const xt = localStorage.getItem('cf_x_twitter_handle') || localStorage.getItem('cf_x_twitter_account');
        if (xt) {
          try {
            const p = JSON.parse(xt);
            profiles.x_twitter = p.handle || p.name || '@x_account';
          } catch {
            profiles.x_twitter = xt;
          }
        }

        const gmMsg = localStorage.getItem('cf_google_messages_phone');
        if (gmMsg) profiles.google_messages = gmMsg;

        const gChat = localStorage.getItem('cf_google_chat_space') || localStorage.getItem('cf_google_chat_account');
        if (gChat) {
          try {
            const p = JSON.parse(gChat);
            profiles.google_chat = p.space || p.email || 'Workspace Chat';
          } catch {
            profiles.google_chat = gChat;
          }
        }

        const gVoice = localStorage.getItem('cf_google_voice_number') || localStorage.getItem('cf_google_voice_account');
        if (gVoice) {
          try {
            const p = JSON.parse(gVoice);
            profiles.google_voice = p.number || 'Google Voice';
          } catch {
            profiles.google_voice = gVoice;
          }
        }

        const disc = localStorage.getItem('cf_discord_bot');
        if (disc) profiles.discord = disc;

        const slk = localStorage.getItem('cf_slack_bot');
        if (slk) profiles.slack = slk;

        const li = localStorage.getItem('cf_linkedin_page') || localStorage.getItem('cf_linkedin_account');
        if (li) {
          try {
            const p = JSON.parse(li);
            profiles.linkedin = p.page || p.name || 'LinkedIn InMail';
          } catch {
            profiles.linkedin = li;
          }
        }

        const ircNick = localStorage.getItem('cf_irc_nick');
        if (ircNick) profiles.irc = ircNick;

        const matUser = localStorage.getItem('cf_matrix_user');
        if (matUser) profiles.matrix = matUser;

        const vib = localStorage.getItem('cf_viber_account') || localStorage.getItem('cf_viber_phone');
        if (vib) {
          try {
            const p = JSON.parse(vib);
            profiles.viber = p.name || p.phone || 'Connected';
          } catch {
            profiles.viber = vib;
          }
        } else {
          profiles.viber = '+213 551 24 88 19';
        }

        const sc = localStorage.getItem('cf_snapchat_account') || localStorage.getItem('cf_snapchat_username');
        if (sc) {
          try {
            const p = JSON.parse(sc);
            profiles.snapchat = p.username ? `@${p.username}` : (p.name || 'Connected');
          } catch {
            profiles.snapchat = sc;
          }
        }

        setAccountProfiles(profiles);
      } catch {}
    };

    updateProfiles();
    window.addEventListener('storage', updateProfiles);
    return () => window.removeEventListener('storage', updateProfiles);
  }, [connectedApps]);

  const rawChannels: AppChannel[] = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      iconComponent: <WhatsAppIcon className="w-10 h-10 drop-shadow-sm" />,
      badgeColor: 'bg-[#1B6648]',
      unread: 0,
      status: isChannelConnected('whatsapp') ? 'connected' : 'unlinked',
      subtitle: isChannelConnected('whatsapp') 
        ? (accountProfiles.whatsapp || 'Connected') 
        : 'Scan QR to Link',
    },
    {
      id: 'whatsapp_2',
      name: 'WhatsApp (Line #2)',
      iconComponent: <WhatsAppIcon className="w-10 h-10 drop-shadow-sm" />,
      badgeColor: 'bg-[#15803d]',
      unread: 0,
      status: isChannelConnected('whatsapp_2') ? 'connected' : 'unlinked',
      subtitle: isChannelConnected('whatsapp_2')
        ? (accountProfiles.whatsapp_2 || 'Connected')
        : 'Dual SIM / 2nd Line',
    },
    {
      id: 'telegram',
      name: 'Telegram',
      iconComponent: <TelegramIcon className="w-10 h-10 drop-shadow-sm" />,
      badgeColor: 'bg-[#0088CC]',
      unread: 0,
      status: isChannelConnected('telegram') ? 'connected' : 'unlinked',
      subtitle: isChannelConnected('telegram') 
        ? (accountProfiles.telegram || 'Connected') 
        : 'Connect Phone / Bot',
    },
    {
      id: 'signal',
      name: 'Signal Messenger',
      iconComponent: <SignalIcon className="w-10 h-10 drop-shadow-sm" />,
      badgeColor: 'bg-[#3A76F0]',
      unread: 0,
      status: isChannelConnected('signal') ? 'connected' : 'unlinked',
      subtitle: isChannelConnected('signal')
        ? (accountProfiles.signal || 'Connected')
        : 'Phone SMS / Private Chat',
    },
    {
      id: 'instagram',
      name: 'Instagram (DMs)',
      iconComponent: <InstagramIcon className="w-10 h-10 drop-shadow-sm" />,
      badgeColor: 'bg-[#EB6708]',
      unread: 0,
      status: isChannelConnected('instagram') ? 'connected' : 'unlinked',
      subtitle: isChannelConnected('instagram')
        ? (accountProfiles.instagram || 'Connected')
        : 'Direct DMs / Meta',
    },
    {
      id: 'messenger',
      name: 'FB Messenger',
      iconComponent: <MessengerIcon className="w-10 h-10 drop-shadow-sm" />,
      badgeColor: 'bg-[#1877F2]',
      unread: 0,
      status: isChannelConnected('messenger') ? 'connected' : 'unlinked',
      subtitle: isChannelConnected('messenger') 
        ? (accountProfiles.messenger || 'Connected') 
        : 'Facebook Page Sign-In',
    },
    {
      id: 'x_twitter',
      name: 'X (formerly Twitter)',
      iconComponent: <XIcon className="w-10 h-10 drop-shadow-sm" />,
      badgeColor: 'bg-[#14171A]',
      unread: 0,
      status: isChannelConnected('x_twitter') ? 'connected' : 'unlinked',
      subtitle: isChannelConnected('x_twitter')
        ? (accountProfiles.x_twitter || 'Connected')
        : 'Account Sign-In / API',
    },
    {
      id: 'google_messages',
      name: 'Google Messages',
      iconComponent: <GoogleMessagesIcon className="w-10 h-10 drop-shadow-sm" />,
      badgeColor: 'bg-[#1A73E8]',
      unread: 0,
      status: isChannelConnected('google_messages') ? 'connected' : 'unlinked',
      subtitle: isChannelConnected('google_messages')
        ? (accountProfiles.google_messages || 'Connected')
        : 'Device QR / Phone',
    },
    {
      id: 'google_chat',
      name: 'Google Chat',
      iconComponent: <GoogleChatIcon className="w-10 h-10 drop-shadow-sm" />,
      badgeColor: 'bg-[#00AC47]',
      unread: 0,
      status: isChannelConnected('google_chat') ? 'connected' : 'unlinked',
      subtitle: isChannelConnected('google_chat')
        ? (accountProfiles.google_chat || 'Connected')
        : 'Workspace Chat Spaces',
    },
    {
      id: 'google_voice',
      name: 'Google Voice',
      iconComponent: <GoogleVoiceIcon className="w-10 h-10 drop-shadow-sm" />,
      badgeColor: 'bg-[#0F9D58]',
      unread: 0,
      status: isChannelConnected('google_voice') ? 'connected' : 'unlinked',
      subtitle: isChannelConnected('google_voice')
        ? (accountProfiles.google_voice || 'Connected')
        : 'Business Phone & SMS',
    },
    {
      id: 'discord',
      name: 'Discord',
      iconComponent: <DiscordIcon className="w-10 h-10 drop-shadow-sm" />,
      badgeColor: 'bg-[#5865F2]',
      unread: 0,
      status: isChannelConnected('discord') ? 'connected' : 'unlinked',
      subtitle: isChannelConnected('discord')
        ? (accountProfiles.discord || 'Connected')
        : 'Account Sign-In / QR',
    },
    {
      id: 'slack',
      name: 'Slack',
      iconComponent: <SlackIcon className="w-10 h-10 drop-shadow-sm" />,
      badgeColor: 'bg-[#4A154B]',
      unread: 0,
      status: isChannelConnected('slack') ? 'connected' : 'unlinked',
      subtitle: isChannelConnected('slack')
        ? (accountProfiles.slack || 'Connected')
        : 'Work Email / Token',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn (Messaging)',
      iconComponent: <LinkedInIcon className="w-10 h-10 drop-shadow-sm" />,
      badgeColor: 'bg-[#0A66C2]',
      unread: 0,
      status: isChannelConnected('linkedin') ? 'connected' : 'unlinked',
      subtitle: isChannelConnected('linkedin')
        ? (accountProfiles.linkedin || 'Connected')
        : 'Professional Leads & DMs',
    },
    {
      id: 'irc',
      name: 'IRC Network',
      iconComponent: <IrcIcon className="w-10 h-10 drop-shadow-sm" />,
      badgeColor: 'bg-[#1E222A]',
      unread: 0,
      status: isChannelConnected('irc') ? 'connected' : 'unlinked',
      subtitle: isChannelConnected('irc')
        ? (accountProfiles.irc || 'Connected')
        : 'IRC Channels & Nick',
    },
    {
      id: 'matrix',
      name: 'Matrix Protocol',
      iconComponent: <MatrixIcon className="w-10 h-10 drop-shadow-sm" />,
      badgeColor: 'bg-[#0DBD8B]',
      unread: 0,
      status: isChannelConnected('matrix') ? 'connected' : 'unlinked',
      subtitle: isChannelConnected('matrix')
        ? (accountProfiles.matrix || 'Connected')
        : 'Beeper / Element Bridge',
    },
    {
      id: 'web_widget',
      name: 'Storefront Live Chat',
      iconComponent: <StorefrontIcon className="w-10 h-10 drop-shadow-sm" />,
      badgeColor: 'bg-teal-600',
      unread: 0,
      status: isChannelConnected('web_widget') ? 'connected' : 'unlinked',
      subtitle: isChannelConnected('web_widget') ? 'Storefront Widget' : 'Click to Embed',
    },
    {
      id: 'gmail',
      name: 'Support Email',
      iconComponent: <GmailIcon className="w-10 h-10 drop-shadow-sm" />,
      badgeColor: 'bg-red-500',
      unread: 0,
      status: isChannelConnected('gmail') ? 'connected' : 'unlinked',
      subtitle: isChannelConnected('gmail') 
        ? (accountProfiles.gmail || 'Connected') 
        : 'Connect Support Email',
    },
    {
      id: 'viber',
      name: 'Viber Business',
      iconComponent: <ViberIcon className="w-10 h-10 drop-shadow-sm" />,
      badgeColor: 'bg-[#7360F2]',
      unread: 0,
      status: isChannelConnected('viber') ? 'connected' : 'unlinked',
      subtitle: isChannelConnected('viber')
        ? (accountProfiles.viber || 'Connected')
        : 'Connect Bot / Phone',
    },
    {
      id: 'snapchat',
      name: 'Snapchat',
      iconComponent: <SnapchatIcon className="w-10 h-10 drop-shadow-sm" />,
      badgeColor: 'bg-[#FFFC00]',
      unread: 0,
      status: isChannelConnected('snapchat') ? 'connected' : 'unlinked',
      subtitle: isChannelConnected('snapchat')
        ? (accountProfiles.snapchat || 'Connected')
        : 'Scan Snapcode / Add',
    }
  ];

  
  const orderedPinnedIds = [
    ...pinnedTopApps.filter(id => localPinned.includes(id)),
    ...localPinned.filter(id => !pinnedTopApps.includes(id))
  ];
  
  const channels: any[] = orderedPinnedIds
    .map(id => rawChannels.find(ch => ch.id === id))
    .filter(Boolean)
    .filter((ch): ch is NonNullable<typeof ch> => Boolean(ch))
    .map(ch => {
      const isFunctional = isChannelFunctional(ch.id);
      let newCh = { ...ch };
      if (!isFunctional) {
        newCh.isComingSoon = true;
        newCh.subtitle = "Bientôt disponible";
        newCh.iconComponent = <div className="grayscale opacity-40">{ch.iconComponent}</div>;
      }
      return newCh;
    });

  const liveCount = channels.filter(c => c.status === 'connected').length;

  const isAnyAiActive = React.useMemo(() => {
    return channels.some(ch => !ch.isComingSoon && !!aiEnabledByChannel[ch.id]);
  }, [channels, aiEnabledByChannel]);

  const handleToggleGlobalAi = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleAllAi) {
      onToggleAllAi(!isAnyAiActive);
    } else if (onToggleAi) {
      const targetState = !isAnyAiActive;
      channels.filter(ch => !ch.isComingSoon).forEach(ch => {
        if (!!aiEnabledByChannel[ch.id] !== targetState) {
          onToggleAi(ch.id);
        }
      });
    }
  };

  const pinnedTopChannels = pinnedTopApps
    .map(id => channels.find(ch => ch.id === id))
    .filter((ch): ch is NonNullable<typeof ch> => Boolean(ch));
  const unpinnedChannels = orderedPinnedIds
    .filter(id => !pinnedTopApps.includes(id))
    .map(id => channels.find(ch => ch.id === id))
    .filter((ch): ch is NonNullable<typeof ch> => Boolean(ch));
  const unpinnedIds = unpinnedChannels.map(ch => ch.id);

  return (
    <div 
      style={{ containerType: 'inline-size', containerName: 'appswitcher' }}
      className="app-switcher-container h-full w-full min-h-0 flex flex-col relative bg-[#F5F5ED] dark:bg-[#1A1D23] rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden select-none shadow-sm"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        /* Default badge display */
        .app-corner-badge {
          display: none;
        }
        .app-inline-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          box-sizing: border-box;
        }
        .app-item-actions {
          display: flex;
          align-items: center;
          height: 1.25rem;
        }

        /* Live word hides: <= 280px */
        @container (max-width: 280px) {
          .switcher-live-word { display: none !important; }
        }

        /* Narrow Column (<= 240px): 
           Keep app logo on far left, AI toggle on far right, hide middle text & palette button */
        @container (max-width: 240px) {
          .switcher-title-text { display: none !important; }
          .switcher-logo-icon { display: flex !important; }
          .app-item-text { display: none !important; }
          .app-item-customize-btn { display: none !important; }
          .app-inline-badge { display: none !important; }
          .app-corner-badge { display: flex !important; }
          .app-item-container {
            width: 100% !important;
            max-width: 100% !important;
            justify-content: space-between !important;
            padding: 0.375rem 0.5rem !important;
            height: auto !important;
            aspect-ratio: auto !important;
            margin: 0 !important;
          }
          .app-item-ai-toggle {
            display: inline-flex !important;
            margin-left: auto !important;
            flex-shrink: 0 !important;
          }
          .switcher-bottom-container { padding: 0.5rem !important; }
          .add-channel-text { display: none !important; }
          .bottom-action-btn {
            width: 100% !important;
            justify-content: center !important;
            padding: 0.5rem !important;
          }
        }
        @container (min-width: 241px) {
          .switcher-logo-icon { display: none !important; }
          .app-corner-badge { display: none !important; }
          .app-inline-badge { display: inline-flex !important; }
          .add-channel-text-short { display: none !important; }
        }

        /* Compact rail: hide text label on global AI toggle */
        @container (max-width: 220px) {
          .switcher-global-ai-label { display: none !important; }
        }

        /* Narrow rail: <= 130px (too narrow for side-by-side logo + toggle) */
        @container (max-width: 130px) {
          .app-item-ai-toggle { display: none !important; }
          .app-item-actions { display: none !important; }
          .app-item-container {
            justify-content: center !important;
            padding: 0.375rem !important;
            gap: 0 !important;
          }
          .switcher-ai-toggle { display: none !important; }
          .switcher-header { justify-content: center !important; }
        }

        /* Extreme narrow rail: <= 75px */
        @container (max-width: 75px) {
          .app-item-container {
            width: 2.75rem !important;
            height: 2.75rem !important;
            max-width: 2.75rem !important;
            aspect-ratio: 1/1 !important;
            margin: 0 auto !important;
            padding: 0 !important;
          }
          .bottom-action-btn {
            width: 2.25rem !important;
            height: 2.25rem !important;
            aspect-ratio: 1/1 !important;
            margin: 0 auto !important;
            border-radius: 0.75rem !important;
            justify-content: center !important;
            padding: 0 !important;
          }
        }

        /* Ensure unpin button is strictly visible ONLY on the actively hovered app */
        .app-item-container.is-hovered .app-item-unpin-btn,
        .app-item-unpin-btn:hover,
        .app-item-unpin-btn:active {
          opacity: 1 !important;
          pointer-events: auto !important;
          visibility: visible !important;
          display: flex !important;
        }

        .app-item-container:not(.is-hovered) .app-item-unpin-btn {
          opacity: 0 !important;
          pointer-events: none !important;
          visibility: hidden !important;
          display: none !important;
        }
      `}} />
      <div {...dragHandleProps} className={`switcher-header h-14 px-3 sm:px-4 shrink-0 flex items-center justify-between border-b border-[#DFDFD4] dark:border-[#2E333D] ${dragHandleProps?.className || "cursor-grab active:cursor-grabbing"}`}>
        <div className="flex items-center gap-1.5 pointer-events-none select-none min-w-0">
          <div className="switcher-logo-icon hidden items-center justify-center w-7 h-7 rounded-lg bg-[#1B6648] text-white shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <span className="switcher-title-text text-[11px] font-extrabold uppercase tracking-wider text-[#1B6648] dark:text-emerald-400 shrink-0">
            Channels
          </span>
          <span suppressHydrationWarning className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#1B6648]/10 text-[#1B6648] dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span suppressHydrationWarning>{mounted ? liveCount : 0}/{channels.length}</span>
            <span className="switcher-live-word">Live</span>
          </span>
        </div>

        {/* Master AI Agents Toggle */}
        <div className="switcher-ai-toggle shrink-0 flex items-center ml-auto">
          <button
            type="button"
            onClick={handleToggleGlobalAi}
            title={isAnyAiActive ? "Désactiver les agents IA pour tous les canaux" : "Activer les agents IA pour tous les canaux"}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 border cursor-pointer select-none ${
              isAnyAiActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60 shadow-sm'
                : 'bg-white/80 text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-gray-700 dark:bg-[#252830] dark:text-gray-400 dark:border-gray-700 dark:hover:bg-[#2e333d]'
            }`}
          >
            <Bot className={`w-3.5 h-3.5 shrink-0 transition-transform ${isAnyAiActive ? 'text-emerald-600 dark:text-emerald-400 scale-105' : 'text-gray-400'}`} />
            <span className="switcher-global-ai-label text-[10.5px] leading-none tracking-tight">
              Agents IA
            </span>
            <span
              className={`w-6 h-3.5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                isAnyAiActive ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`bg-white w-2.5 h-2.5 rounded-full shadow-sm transform transition-transform duration-200 ${
                  isAnyAiActive ? 'translate-x-2.5' : 'translate-x-0'
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Channels List */}
      
      {/* We use ReactSortable for mobile-like drag and drop fluid animation */}
      <DndContext id="app-switcher-dnd" sensors={sensors} collisionDetection={collisionDetectionStrategy} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
        <div 
          className="flex-1 min-h-0 p-3 flex flex-col gap-2.5 overflow-y-auto overflow-x-hidden custom-scrollbar"
          onPointerLeave={() => setHoveredAppId(null)}
          onMouseLeave={() => setHoveredAppId(null)}
          onScroll={() => checkStationaryHover()}
        >
          <SortableContext items={unpinnedIds} strategy={verticalListSortingStrategy}>
            {channels.map((ch) => {
              const isSelected = ch.id === selectedAppId;
              const appTheme = APP_GRADIENT_THEMES[ch.id] || APP_GRADIENT_THEMES.whatsapp;
              
              return (
                <SortableChannelItem
                  key={ch.id}
                  ch={ch}
                  isSelected={isSelected}
                  appTheme={appTheme}
                  isChannelConnected={isChannelConnected}
                  onSelectApp={onSelectApp}
                  onOpenConnectModal={onOpenConnectModal}
                  onUnpinApp={handleUnpinAppWrapper}
                  isAiActive={aiEnabledByChannel[ch.id] ?? false}
                  onToggleAi={onToggleAi}
                  unreadCount={unreadCounts[ch.id] || 0}
                  onOpenCustomize={(channel, rect) => setCustomizeTarget({ channel, rect })}
                  isPinnedTop={pinnedTopApps.includes(ch.id)}
                  onTogglePinTop={handleTogglePinTop}
                  canEditUi={canEditUi}
                  mounted={mounted}
                  isHovered={hoveredAppId === ch.id}
                  onHover={() => setHoveredAppId(ch.id)}
                  onUnhover={() => setHoveredAppId((cur) => cur === ch.id ? null : cur)}
                />
              );
            })}
          </SortableContext>
        </div>

        {mounted && typeof document !== 'undefined' && createPortal(
          <DragOverlay zIndex={99999} dropAnimation={null}>
            {activeDragId ? (() => {
              const ch = channels.find(c => c.id === activeDragId);
              if (!ch) return null;
              const isSelected = ch.id === selectedAppId;
              const appTheme = APP_GRADIENT_THEMES[ch.id] || APP_GRADIENT_THEMES.whatsapp;
              const isNarrow = dragItemWidth !== null && dragItemWidth <= 240;
              const isTooNarrowForToggle = dragItemWidth !== null && dragItemWidth <= 130;
              const unread = unreadCounts[ch.id] || 0;
              
              return (
                <div
                  className={`app-item-container rounded-2xl flex items-center transition-all text-left relative shadow-2xl cursor-grabbing pointer-events-none select-none scale-[1.02] ${
                    isTooNarrowForToggle ? 'p-1.5 justify-center' : isNarrow ? 'p-1.5 justify-between' : 'p-2.5 sm:px-3 justify-between gap-2.5'
                  } ${
                    isSelected
                      ? 'font-bold border-transparent'
                      : 'bg-white dark:bg-[#1E222A] text-gray-800 dark:text-gray-200 border border-[#DFDFD4] dark:border-neutral-800'
                  }`}
                  style={{
                    width: dragItemWidth ? `${dragItemWidth}px` : '100%',
                    backgroundColor: isSelected ? appTheme.solidColor : undefined,
                    color: isSelected ? '#FFFFFF' : undefined,
                    boxShadow: isSelected ? `0 4px 14px 0 ${appTheme.solidColor}40` : undefined,
                  }}
                >
                  <div className="relative shrink-0 flex items-center justify-center z-0 pointer-events-none select-none">
                    {ch.iconComponent}
                    {unread > 0 && (
                      <span 
                        className={`absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black min-w-[18px] h-4 px-1 rounded-full items-center justify-center shadow-md border-2 border-white dark:border-[#1E222A] pointer-events-none z-20 ${
                          isNarrow ? 'flex' : 'hidden'
                        }`}
                      >
                        {unread > 999 ? '999+' : unread}
                      </span>
                    )}
                  </div>

                  {!isNarrow && (
                    <div className="app-item-text flex-1 min-w-0 flex flex-col justify-center z-0 pointer-events-none">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-extrabold truncate flex items-center gap-1 min-w-0" style={!isSelected ? { color: (appTheme as any)?.textColor || appTheme?.accentColor || appTheme?.solidColor } : undefined}>
                          <span className="truncate">{ch.name}</span>
                          {pinnedTopApps.includes(ch.id) && (
                            <Pin className={`w-3 h-3 rotate-45 shrink-0 ${
                              isSelected 
                                ? 'text-white fill-white/80 drop-shadow-xs' 
                                : 'text-amber-500 fill-amber-500/80 dark:text-amber-400 dark:fill-amber-400/80 drop-shadow-xs'
                            }`} />
                          )}
                        </span>
                      </div>
                      <span className={`text-[9px] font-semibold truncate mt-0.5 ${isSelected ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                        {ch.subtitle}
                      </span>
                    </div>
                  )}

                  {!isTooNarrowForToggle && (
                    <div className={`app-item-actions flex items-center h-5 gap-1.5 ml-auto shrink-0 z-20 pointer-events-none`}>
                      {!isNarrow && unread > 0 && (
                        <span className="app-inline-badge shrink-0 inline-flex items-center justify-center bg-red-500 text-white text-[10.5px] font-black min-w-[20px] h-5 px-1.5 rounded-full shadow-xs tabular-nums text-center pointer-events-none z-10 leading-none select-none">
                          {unread > 999 ? '999+' : unread}
                        </span>
                      )}

                      {onToggleAi && (
                        <div
                          className={`app-item-ai-toggle relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-all duration-200 shadow-inner border border-transparent ${(aiEnabledByChannel[ch.id] ?? false) ? "opacity-100" : "bg-gray-200 dark:bg-gray-700/80 opacity-60 dark:border-neutral-700"}`}
                          style={(aiEnabledByChannel[ch.id] ?? false) ? { backgroundColor: appTheme.solidColor, boxShadow: `0 0 8px ${appTheme.solidColor}60` } : undefined}
                        >
                          <span
                            className={`flex items-center justify-center h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300`}
                            style={(aiEnabledByChannel[ch.id] ?? false) ? { transform: 'translateX(18px)' } : { transform: 'translateX(2px)' }}
                          >
                            {(aiEnabledByChannel[ch.id] ?? false) ? <Bot className="w-2.5 h-2.5" style={{ color: appTheme.solidColor }} /> : <Sparkles className="w-2.5 h-2.5 text-gray-400" />}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })() : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      {/* Bottom Actions & Gateway Status */}
      {canManageChannels && (
        <div className="switcher-bottom-container p-4 border-t border-[#DFDFD4] dark:border-[#2E333D] shrink-0 mt-auto bg-gray-50/40 dark:bg-neutral-900/40 transition-all">
          <button
            onClick={() => setIsAddDrawerOpen(true)}
            className="bottom-action-btn w-full py-2.5 px-3 rounded-xl border border-dashed border-[#1B6648]/40 dark:border-emerald-500/40 hover:border-[#1B6648] bg-[#1B6648]/5 dark:bg-emerald-950/20 hover:bg-[#1B6648]/10 text-[#1B6648] dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="add-channel-text">
              <span className="add-channel-text-full">Add Channel / Phone</span>
              <span className="add-channel-text-short">Add Channel</span>
            </span>
          </button>
        </div>
      )}

      {/* Sliding App Catalog Drawer */}
      <AnimatePresence>
        {isAddDrawerOpen && (
          <React.Fragment>
            {/* Backdrop for Instagram-like comment feel */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 dark:bg-black/50 z-40 rounded-3xl"
              onClick={() => setIsAddDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="absolute inset-x-0 bottom-0 top-[40%] bg-white dark:bg-[#1A1D23] z-50 rounded-b-3xl border-t border-[#DFDFD4] dark:border-[#2E333D] overflow-y-auto shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] p-4 custom-scrollbar flex flex-col"
            >
              {/* Draggable Handle Indicator */}
              <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-gray-800 dark:text-gray-200">App Catalog</h3>
              <button 
                onClick={() => setIsAddDrawerOpen(false)}
                className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-500 hover:text-white dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-500 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(54px, 1fr))' }}>
              {rawChannels.filter(ch => !pinnedApps.includes(ch.id)).map(ch => {
                const isFunctional = isChannelFunctional(ch.id);
                return (
                  <div 
                    key={ch.id}
                    onClick={() => {
                      if (!isFunctional) return;
                      onPinApp && onPinApp(ch.id);
                    }}
                    title={!isFunctional ? `${ch.name} (Bientôt disponible)` : `Ajouter ${ch.name}`}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setCustomizeTarget({ channel: ch, rect });
                    }}
                    className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all border ${
                      !isFunctional 
                        ? 'opacity-40 grayscale cursor-not-allowed bg-gray-50/50 dark:bg-neutral-900/50 border-gray-200/50 dark:border-neutral-800/50' 
                        : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 border-transparent hover:border-gray-200 dark:hover:border-neutral-700 group'
                    }`}
                  >
                    <div className={`relative w-11 h-11 flex items-center justify-center scale-[0.88] ${isFunctional ? 'group-hover:scale-100' : ''} transition-transform duration-300`}>
                      {ch.iconComponent}
                      {!isFunctional && (
                        <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded text-[7px] font-black uppercase tracking-tight bg-amber-500 text-white shadow-xs">
                          Bientôt
                        </span>
                      )}
                      {isFunctional && ch.status === 'connected' && (
                        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white dark:border-[#1A1D23]" />
                        </span>
                      )}
                    </div>
                    <span className={`mt-0.5 text-[8.5px] font-bold text-center line-clamp-2 leading-tight px-0.5 ${!isFunctional ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
                      {ch.name.replace(' (Line #2)', '')}
                    </span>
                    {!isFunctional && (
                      <span className="text-[7.5px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                        Bientôt
                      </span>
                    )}
                  </div>
                );
              })}
              {rawChannels.filter(ch => !pinnedApps.includes(ch.id)).length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-gray-500">
                  All available apps are already pinned!
                </div>
              )}
            </div>
          </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>

      {/* App Customizer Popover - Portal rendered directly to document.body with z-[99999] so it is on top of everything */}
      <AppCustomizerPopover
        isOpen={Boolean(customizeTarget)}
        channel={customizeTarget?.channel || null}
        anchorRect={customizeTarget?.rect || null}
        isConnected={customizeTarget ? isChannelConnected(customizeTarget.channel.id) : false}
        isPinned={customizeTarget ? pinnedTopApps.includes(customizeTarget.channel.id) : false}
        onTogglePin={(appId) => {
          handleTogglePinTop(appId);
        }}
        onOpenConnectModal={onOpenConnectModal}
        onDisconnect={onDisconnectChannel}
        onClose={() => setCustomizeTarget(null)}
      />
    </div>
  );
};
