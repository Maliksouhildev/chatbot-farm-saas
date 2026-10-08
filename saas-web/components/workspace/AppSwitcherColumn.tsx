"use client";

import React, { useState } from 'react';
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
import { Plus, Bot, Sparkles } from 'lucide-react';
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
import { APP_GRADIENT_THEMES, getRealInstagramProfile } from '@/lib/mock_chats';
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
  onUnpinApp?: (id: string) => void;
  onOpenCustomize?: (channel: any, rect: DOMRect) => void;
  isPinnedTop?: boolean;
  canEditUi?: boolean;
}

function SortableChannelItem({ ch, isSelected, appTheme, isChannelConnected, onSelectApp, onOpenConnectModal, onUnpinApp, isAiActive, onToggleAi, unreadCount, onOpenCustomize, isPinnedTop = false, canEditUi = true }: SortableChannelProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ch.id,
    disabled: !canEditUi,
  });
  const [isHovered, setIsHovered] = useState(false);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    backgroundColor: isSelected ? appTheme.solidColor : undefined,
    color: isSelected ? '#FFFFFF' : undefined,
    boxShadow: isSelected ? `0 4px 14px 0 ${appTheme.solidColor}40` : undefined,
    userSelect: 'none' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      draggable={false}
      {...attributes}
      {...listeners}
      id={`channel-switcher-${ch.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        onOpenCustomize && onOpenCustomize(ch, rect);
      }}
      className={`app-item-container w-full p-2.5 sm:px-3 rounded-2xl flex items-center gap-2.5 transition-all text-left relative shadow-xs ${canEditUi ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} select-none ${
        isSelected
          ? 'font-bold border-transparent scale-[1.01]'
          : 'bg-white dark:bg-[#1E222A] text-gray-800 dark:text-gray-200 border border-[#DFDFD4] dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800/80'
      }`}
    >
      {canEditUi && (
        <button 
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onUnpinApp && onUnpinApp(ch.id); }}
          className={`app-item-unpin-btn absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white dark:bg-red-500 dark:hover:bg-red-600 rounded-full flex items-center justify-center shadow-sm z-30 transition-all cursor-pointer border border-white dark:border-neutral-800 hover:scale-110 ${isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          title="Remove from Panel"
          onPointerDown={(e) => e.stopPropagation()} 
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      )}

      <div 
        className={`absolute inset-0 z-10 ${canEditUi ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`} 
        onClick={() => {
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
        {unreadCount > 0 && (
          <span className="app-corner-badge absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black min-w-[18px] h-4 px-1 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-[#1E222A] pointer-events-none z-20">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      <div className="app-item-text flex-1 min-w-0 flex flex-col justify-center z-0 pointer-events-none">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-extrabold truncate flex items-center gap-1 min-w-0" style={!isSelected ? { color: appTheme.textColor } : undefined}>
            <span className="truncate">{ch.name}</span>
            {isPinnedTop && <span className="shrink-0 text-[10px]" title="Pinned Top">📌</span>}
          </span>
        </div>
        
        <span className={`text-[9px] font-semibold truncate mt-0.5 ${isSelected ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
          {ch.subtitle}
        </span>
      </div>

      {/* Right Actions: Centered Notification Badge and AI Toggle */}
      <div className="flex items-center gap-1.5 ml-auto shrink-0 z-20">
        {unreadCount > 0 && (
          <span className="app-inline-badge shrink-0 self-center my-auto bg-red-500 text-white text-[10px] font-black min-w-[20px] h-5 px-1.5 rounded-full shadow-sm flex items-center justify-center pointer-events-none z-10 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {onToggleAi && (
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
}) => {
  const isChannelConnected = (id: string) => connectedApps.has(id);
  const [localPinned, setLocalPinned] = useState<string[]>(pinnedApps);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [customizeTarget, setCustomizeTarget] = useState<{ channel: any; rect: DOMRect } | null>(null);

  const [pinnedTopApps, setPinnedTopApps] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['whatsapp'];
    try {
      const stored = localStorage.getItem('cf_pinned_top_apps');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return ['whatsapp'];
  });

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

  const handleUnpinAppWrapper = (appId: string) => {
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

  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
    if (typeof document !== 'undefined') {
      document.body.classList.add('is-dragging');
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (typeof document !== 'undefined') {
      document.body.classList.remove('is-dragging');
    }
    
    if (over && active.id !== over.id) {
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

  
  const channels: any[] = [...localPinned]
    .map(id => rawChannels.find(ch => ch.id === id))
    .filter(Boolean)
    .filter((ch): ch is NonNullable<typeof ch> => Boolean(ch))
    .map(ch => {
      const chId = ch.id;
      const workingApps = ['whatsapp', 'whatsapp_2', 'telegram', 'discord', 'gmail', 'google_chat', 'google_messages', 'google_voice', 'viber', 'snapchat', 'signal', 'matrix', 'irc', 'web_widget'];
      const abandonedApps = ['linkedin', 'messenger', 'instagram', 'x_twitter'];
      
      let newCh = { ...ch };
      if (!workingApps.includes(ch.id)) {
        newCh.iconComponent = <div className="grayscale opacity-40">{ch.iconComponent}</div>;
      }
      
      if (abandonedApps.includes(ch.id)) {
        newCh.isComingSoon = true;
        newCh.subtitle = "Under Construction";
      }
      
      return newCh;
    });

  const liveCount = channels.filter(c => c.status === 'connected').length;

  const pinnedTopChannels = pinnedTopApps
    .map(id => channels.find(ch => ch.id === id))
    .filter((ch): ch is NonNullable<typeof ch> => Boolean(ch));
  const unpinnedChannels = localPinned
    .filter(id => !pinnedTopApps.includes(id))
    .map(id => channels.find(ch => ch.id === id))
    .filter((ch): ch is NonNullable<typeof ch> => Boolean(ch));
  const unpinnedIds = unpinnedChannels.map(ch => ch.id);

  return (
    <div 
      style={{ containerType: 'inline-size', containerName: 'appswitcher' }}
      className="app-switcher-container h-full w-full min-h-0 flex flex-col relative bg-white dark:bg-[#1A1D23] rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden select-none shadow-sm"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        /* Default badge display */
        .app-corner-badge {
          display: none;
        }
        .app-inline-badge {
          display: inline-flex;
        }

        /* Auto-AI collapses to icon & Live hides: <= 280px */
        @container (max-width: 280px) {
          .switcher-ai-toggle-text { display: none !important; }
          .switcher-ai-toggle {
            padding: 0 !important;
            width: 1.75rem !important;
            height: 1.75rem !important;
            aspect-ratio: 1/1 !important;
            border-radius: 9999px !important;
            justify-content: center !important;
          }
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

        /* Extreme narrow rail: <= 85px (too narrow for side-by-side logo + toggle) */
        @container (max-width: 85px) {
          .app-item-ai-toggle { display: none !important; }
          .app-item-container {
            justify-content: center !important;
            padding: 0.375rem !important;
            width: 3rem !important;
            height: 3rem !important;
            max-width: 3rem !important;
            aspect-ratio: 1/1 !important;
            margin: 0 auto !important;
            gap: 0 !important;
          }
          .bottom-action-btn {
            width: 2.25rem !important;
            height: 2.25rem !important;
            aspect-ratio: 1/1 !important;
            margin: 0 auto !important;
            border-radius: 0.75rem !important;
            justify-content: center !important;
          }
          .switcher-ai-toggle { display: none !important; }
          .switcher-header { justify-content: center !important; }
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
            <span>{liveCount}/{channels.length}</span>
            <span className="switcher-live-word">Live</span>
          </span>
        </div>
        
        <button
          onPointerDown={(e) => e.stopPropagation()}
          className="switcher-ai-toggle ml-auto relative inline-flex h-6 items-center gap-1.5 rounded-full px-2 transition-all duration-200 cursor-pointer shadow-inner focus:outline-none hover:scale-105 z-20 bg-[#1B6648] text-white shrink-0"
          title="Master AI Toggle"
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="switcher-ai-toggle-text text-[10px] font-bold">Auto-AI</span>
        </button>
      </div>

      {/* Channels List */}
      
      {/* We use ReactSortable for mobile-like drag and drop fluid animation */}
      <DndContext id="app-switcher-dnd" sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
        <div className="flex-1 min-h-0 p-3 flex flex-col gap-2.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <SortableContext items={channels.map(c => c.id)} strategy={verticalListSortingStrategy}>
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
                  canEditUi={canEditUi}
                />
              );
            })}
          </SortableContext>
        </div>

        <DragOverlay zIndex={9999} dropAnimation={null}>
          {activeDragId ? (() => {
            const ch = channels.find(c => c.id === activeDragId);
            if (!ch) return null;
            const isSelected = ch.id === selectedAppId;
            const appTheme = APP_GRADIENT_THEMES[ch.id] || APP_GRADIENT_THEMES.whatsapp;
            
            return (
              <div
                className={`app-item-container w-full p-2.5 sm:px-3 rounded-2xl flex items-center justify-between gap-2.5 transition-all text-left relative group shadow-2xl cursor-grabbing scale-[1.03] rotate-1 ${
                  isSelected
                    ? 'font-bold border-transparent'
                    : 'bg-white dark:bg-[#1E222A] text-gray-800 dark:text-gray-200 border border-[#DFDFD4] dark:border-neutral-800'
                }`}
                style={isSelected ? { backgroundColor: appTheme.solidColor, color: '#FFFFFF', boxShadow: `0 4px 14px 0 ${appTheme.solidColor}40` } : undefined}
              >
                <div className="relative shrink-0 flex items-center justify-center z-0">
                  {ch.iconComponent}
                  {(unreadCounts[ch.id] || 0) > 0 && (
                    <span className="app-corner-badge absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black min-w-[18px] h-4 px-1 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-[#1E222A] pointer-events-none z-20">
                      {(unreadCounts[ch.id] || 0) > 99 ? '99+' : (unreadCounts[ch.id] || 0)}
                    </span>
                  )}
                </div>
                <div className="app-item-text flex-1 min-w-0 flex flex-col justify-center z-0 pointer-events-none">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-extrabold truncate" style={!isSelected ? { color: appTheme?.accentColor || appTheme?.solidColor } : undefined}>
                      {ch.name}
                    </span>
                    {(unreadCounts[ch.id] || 0) > 0 && (
                      <span className="app-inline-badge shrink-0 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                        {(unreadCounts[ch.id] || 0) > 99 ? '99+' : (unreadCounts[ch.id] || 0)}
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] font-semibold truncate mt-0.5 ${isSelected ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                    {ch.subtitle}
                  </span>
                </div>
                {isChannelConnected(ch.id) && onToggleAi && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleAi(ch.id); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className={`app-item-ai-toggle ml-auto relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-all duration-200 cursor-pointer shadow-inner focus:outline-none hover:scale-105 z-20 border border-transparent ${(aiEnabledByChannel[ch.id] ?? false) ? "opacity-100" : "bg-gray-200 dark:bg-gray-700/80 opacity-60 hover:opacity-100 dark:border-neutral-700"}`}
                    style={(aiEnabledByChannel[ch.id] ?? false) ? { backgroundColor: appTheme.solidColor, boxShadow: `0 0 8px ${appTheme.solidColor}60` } : undefined}
                    title={(aiEnabledByChannel[ch.id] ?? false) ? "Disable AI for this channel" : "Enable AI for this channel"}
                  >
                    <span
                      className={`flex items-center justify-center h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300`}
                      style={(aiEnabledByChannel[ch.id] ?? false) ? { transform: 'translateX(18px)' } : { transform: 'translateX(2px)' }}
                    >
                      {(aiEnabledByChannel[ch.id] ?? false) ? <Bot className="w-2.5 h-2.5" style={{ color: appTheme.solidColor }} /> : <Sparkles className="w-2.5 h-2.5 text-gray-400" />}
                    </span>
                  </button>
                )}
              </div>
            );
          })() : null}
        </DragOverlay>
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
            
            <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))' }}>
              {rawChannels.filter(ch => !pinnedApps.includes(ch.id)).map(ch => (
                <div 
                  key={ch.id}
                  onClick={() => {
                    onPinApp && onPinApp(ch.id);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setCustomizeTarget({ channel: ch, rect });
                  }}
                  className="relative flex flex-col items-center justify-center p-2 rounded-2xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-neutral-800 border border-transparent hover:border-gray-200 dark:hover:border-neutral-700 group"
                >
                  <div className="relative w-10 h-10 flex items-center justify-center scale-[0.65] group-hover:scale-75 transition-transform duration-300">
                    {ch.iconComponent}
                    {ch.status === 'connected' && (
                      <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white dark:border-[#1A1D23]" />
                      </span>
                    )}
                  </div>
                  <span className="mt-0.5 text-[8.5px] font-bold text-gray-600 dark:text-gray-400 text-center line-clamp-2 leading-tight px-0.5">{ch.name.replace(' (Line #2)', '')}</span>
                </div>
              ))}
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
        onClose={() => setCustomizeTarget(null)}
      />
    </div>
  );
};
