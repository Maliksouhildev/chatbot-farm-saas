"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Copy,
  Phone,
  Video,
  MessageSquare,
  Bell,
  BellOff,
  ShieldCheck,
  Lock,
  Share2,
  MoreVertical,
  ExternalLink,
  Star,
  FileText,
  Image as ImageIcon,
  Link2,
  ChevronRight,
  AlertTriangle,
  Slash,
  Heart,
  Camera,
  AtSign,
  Globe,
  Hash,
  QrCode,
  Info,
  Calendar,
  Flame,
  Sparkles,
  MapPin,
  Mic,
  Send,
  UserCheck,
  UserPlus,
  Users
} from 'lucide-react';
import {
  WhatsAppIcon,
  TelegramIcon,
  DiscordIcon,
  InstagramIcon,
  SignalIcon,
  XIcon,
  SlackIcon,
  LinkedInIcon,
  ViberIcon
} from '@/components/icons/BrandIcons';
import { ContactProfile, ChatMessage, getEnrichedProfile, APP_GRADIENT_THEMES } from '@/lib/mock_chats';
import { useChatStore } from '@/lib/store/ChatStoreContext';

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: ContactProfile | null;
  appId?: string;
  currentMessages?: ChatMessage[];
  darkMode?: boolean;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  contact: rawContact,
  appId: propAppId,
  currentMessages = [],
  darkMode = false,
}) => {
  const { openLightbox } = useChatStore();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showSecurityVerify, setShowSecurityVerify] = useState(false);
  const [telegramMediaTab, setTelegramMediaTab] = useState<'media' | 'files' | 'links' | 'voice'>('media');
  const [discordNote, setDiscordNote] = useState('');
  const [activePhotoPreview, setActivePhotoPreview] = useState<string | null>(null);

  // Enrich contact with fallbacks for the target channel
  const effectiveAppId = propAppId || rawContact?.appId || 'whatsapp';
  const contact = useMemo(() => {
    if (!rawContact) return null;
    return getEnrichedProfile(rawContact, effectiveAppId);
  }, [rawContact, effectiveAppId]);

  // Sync mute state and load saved discord note
  useEffect(() => {
    if (contact) {
      setIsMuted(Boolean(contact.notificationMuted));
      if (typeof window !== 'undefined' && contact.id) {
        try {
          const savedNote = localStorage.getItem(`cf_note_${contact.id}`);
          if (savedNote) setDiscordNote(savedNote);
          else if (contact.note) setDiscordNote(contact.note);
          else setDiscordNote('');
        } catch {}
      }
    }
  }, [contact]);

  // Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSecurityVerify) {
          setShowSecurityVerify(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showSecurityVerify, onClose]);

  // Copy helper
  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {}
  };

  const handleSaveDiscordNote = (newNote: string) => {
    setDiscordNote(newNote);
    if (contact && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`cf_note_${contact.id}`, newNote);
      } catch {}
    }
  };

  // Aggregate media items from conversation or mock
  const mediaPhotos = useMemo(() => {
    if (!contact) return [];
    const fromChat = currentMessages
      .concat(contact.messages || [])
      .filter((m) => m.imageUrl)
      .map((m) => m.imageUrl as string);
    if (fromChat.length > 0) return Array.from(new Set(fromChat));
    return [];
  }, [currentMessages, contact?.messages]);

  if (!isOpen || !contact) return null;

  // =========================================================================
  // 1. TELEGRAM NATIVE PROFILE DRAWER / MODAL
  // =========================================================================
  const renderTelegramProfile = () => {
    const isBroadcast = contact.isBroadcast || contact.statusText === 'Channel';
    const isGroup = contact.isGroup;

    return (
      <div className="w-full bg-[#FFFFFF] dark:bg-[#17212B] text-[#1B1B1B] dark:text-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-[#242F3D] flex flex-col max-h-[90vh]">
        {/* Telegram Top Bar */}
        <div className="h-14 px-4 bg-[#0088CC] text-white flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              title="Close Profile"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <h3 className="font-bold text-sm text-white">
              {isBroadcast ? 'Channel Info' : isGroup ? 'Group Info' : 'User Info'}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleCopy(contact.username ? `@${contact.username}` : contact.name, 'share')}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              title="Share Contact"
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Telegram Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
          {/* Hero: Large Avatar & Name */}
          <div className="flex items-center gap-4 pb-2 border-b border-gray-100 dark:border-[#242F3D]">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-md bg-[#2AABEE] text-white flex items-center justify-center font-bold text-2xl border-2 border-white dark:border-[#17212B]">
                {contact.profilePicUrl ? (
                  <img
                    src={contact.profilePicUrl}
                    alt={contact.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{contact.avatarText || contact.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#17212B]" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-[#1B1B1B] dark:text-white truncate flex items-center gap-1.5">
                <span>{contact.name}</span>
                {isBroadcast && <span className="text-sm">📢</span>}
              </h2>
              <p className="text-xs text-[#0088CC] dark:text-[#2AABEE] font-medium mt-0.5">
                {contact.lastSeen || (isBroadcast ? 'Broadcast Channel' : isGroup ? `${contact.handleOrPhone}` : 'online')}
              </p>
            </div>
          </div>

          {/* Quick Action Icons Bar */}
          <div className="grid grid-cols-4 gap-2 text-center py-1">
            <button
              type="button"
              onClick={onClose}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#202B36] transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[#0088CC]/10 text-[#0088CC] dark:text-[#2AABEE] flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">Message</span>
            </button>

            <button
              type="button"
              onClick={() => alert(`Calling ${contact.name} via Telegram Voice...`)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#202B36] transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[#0088CC]/10 text-[#0088CC] dark:text-[#2AABEE] flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">Call</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMuted((prev) => !prev)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#202B36] transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[#0088CC]/10 text-[#0088CC] dark:text-[#2AABEE] flex items-center justify-center">
                {isMuted ? <BellOff className="w-4 h-4 text-red-500" /> : <Bell className="w-4 h-4" />}
              </div>
              <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                {isMuted ? 'Unmute' : 'Mute'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsBlocked((prev) => !prev)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#202B36] transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                <Slash className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium text-red-500">
                {isBlocked ? 'Unblock' : 'Block'}
              </span>
            </button>
          </div>

          {/* Details Section */}
          <div className="space-y-3.5 bg-gray-50 dark:bg-[#202B36] p-4 rounded-2xl text-xs">
            {/* Phone Number */}
            {contact.phone && (
              <div className="flex items-center justify-between group">
                <div>
                  <div className="font-mono text-[13px] font-semibold text-gray-900 dark:text-white">
                    {contact.phone}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">Mobile Phone</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(contact.phone!, 'phone')}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-gray-500 dark:text-gray-300 transition-colors"
                  title="Copy Phone"
                >
                  {copiedField === 'phone' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* Username */}
            {contact.username && (
              <div className="flex items-center justify-between group">
                <div>
                  <div className="font-mono text-[13px] font-semibold text-[#0088CC] dark:text-[#2AABEE]">
                    @{contact.username}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">Username</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(`@${contact.username}`, 'username')}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-gray-500 dark:text-gray-300 transition-colors"
                  title="Copy Username"
                >
                  {copiedField === 'username' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* Bio */}
            {contact.bio && (
              <div className="pt-1">
                <div className="text-[12px] text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {contact.bio}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Bio</div>
              </div>
            )}

            {/* Notification Switch */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-white/5">
              <div>
                <span className="font-medium text-gray-800 dark:text-gray-200">Notifications</span>
                <span className="block text-[10px] text-gray-500">{isMuted ? 'Disabled' : 'Enabled'}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMuted((m) => !m)}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer relative ${
                  !isMuted ? 'bg-[#0088CC]' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    !isMuted ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Shared Content Tabs */}
          <div>
            <div className="flex items-center gap-4 border-b border-gray-200 dark:border-[#242F3D] pb-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTelegramMediaTab('media')}
                className={`pb-1 transition-colors cursor-pointer ${
                  telegramMediaTab === 'media'
                    ? 'text-[#0088CC] dark:text-[#2AABEE] border-b-2 border-[#0088CC]'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Media ({mediaPhotos.length})
              </button>
              <button
                type="button"
                onClick={() => setTelegramMediaTab('files')}
                className={`pb-1 transition-colors cursor-pointer ${
                  telegramMediaTab === 'files'
                    ? 'text-[#0088CC] dark:text-[#2AABEE] border-b-2 border-[#0088CC]'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Files (8)
              </button>
              <button
                type="button"
                onClick={() => setTelegramMediaTab('links')}
                className={`pb-1 transition-colors cursor-pointer ${
                  telegramMediaTab === 'links'
                    ? 'text-[#0088CC] dark:text-[#2AABEE] border-b-2 border-[#0088CC]'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Links (12)
              </button>
            </div>

            <div className="pt-3">
              {telegramMediaTab === 'media' && (
                <div className="grid grid-cols-3 gap-2">
                  {mediaPhotos.map((url, i) => (
                    <div
                      key={i}
                      onClick={() => openLightbox(url)}
                      className="aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 cursor-pointer hover:opacity-85 transition-opacity"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {telegramMediaTab === 'files' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-[#202B36]">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                      PDF
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">Catalogue_Produits_2026.pdf</div>
                      <div className="text-[10px] text-gray-500">4.2 MB • Yesterday</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-[#202B36]">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                      XLS
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">Tarifs_Yalidine_58_Wilayas.xlsx</div>
                      <div className="text-[10px] text-gray-500">1.1 MB • 3 days ago</div>
                    </div>
                  </div>
                </div>
              )}

              {telegramMediaTab === 'links' && (
                <div className="space-y-2 text-xs">
                  <a
                    href="https://chatbotfarm.dz"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-[#202B36] hover:bg-gray-100 dark:hover:bg-[#283544] transition-colors"
                  >
                    <Link2 className="w-4 h-4 text-[#0088CC] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#0088CC] truncate">https://chatbotfarm.dz</div>
                      <div className="text-[10px] text-gray-500">Official SaaS Documentation</div>
                    </div>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // 2. WHATSAPP NATIVE CONTACT INFO DRAWER
  // =========================================================================
  const renderWhatsAppProfile = () => {
    return (
      <div className="w-full bg-[#FFFFFF] dark:bg-[#111B21] text-[#111B21] dark:text-[#E9EDEF] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-[#222E35] flex flex-col max-h-[90vh]">
        {/* WhatsApp Header */}
        <div className="h-14 px-4 bg-[#008069] dark:bg-[#202C33] text-white flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
              title="Close Contact Info"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-sm text-white">Contact info</h3>
          </div>
        </div>

        {/* WhatsApp Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 space-y-3 bg-[#F0F2F5] dark:bg-[#0C1317]">
          {/* Section 1: Hero Avatar & Name */}
          <div className="bg-white dark:bg-[#111B21] p-6 flex flex-col items-center text-center shadow-xs">
            <div
              onClick={() => {
                if (contact.profilePicUrl) openLightbox(contact.profilePicUrl);
              }}
              className="w-32 h-32 rounded-full overflow-hidden shadow-md bg-[#00A884] text-white flex items-center justify-center font-bold text-4xl mb-4 cursor-pointer hover:scale-102 transition-transform border-4 border-white dark:border-[#202C33]"
            >
              {contact.profilePicUrl ? (
                <img
                  src={contact.profilePicUrl}
                  alt={contact.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                  className="w-full h-full object-cover"
                />
              ) : contact.isGroup ? (
                <Users className="w-16 h-16 text-white" />
              ) : (
                <span>{contact.avatarText || contact.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{contact.name}</h2>
            <p className="font-mono text-xs text-gray-500 dark:text-[#8696A0] mt-1">{contact.handleOrPhone}</p>

            {/* Quick action buttons */}
            <div className="flex items-center gap-6 mt-4">
              <button
                type="button"
                onClick={() => alert(`Initiating audio call with ${contact.name}...`)}
                className="flex flex-col items-center gap-1 text-[#008069] dark:text-[#00A884] hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#008069]/10 dark:bg-[#00A884]/20 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">Audio</span>
              </button>

              <button
                type="button"
                onClick={() => alert(`Initiating video call with ${contact.name}...`)}
                className="flex flex-col items-center gap-1 text-[#008069] dark:text-[#00A884] hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#008069]/10 dark:bg-[#00A884]/20 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">Video</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex flex-col items-center gap-1 text-[#008069] dark:text-[#00A884] hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#008069]/10 dark:bg-[#00A884]/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">Message</span>
              </button>
            </div>
          </div>

          {/* Section 2: About / Status */}
          <div className="bg-white dark:bg-[#111B21] p-4 shadow-xs text-xs space-y-1">
            <span className="text-[11px] text-gray-500 dark:text-[#8696A0] font-medium">About</span>
            <p className="text-gray-900 dark:text-gray-100 text-sm font-medium">
              {contact.about || "Hey there! I am using WhatsApp."}
            </p>
            <span className="text-[10px] text-gray-400 font-mono">Status updated {contact.time || 'recently'}</span>
          </div>

          {/* Section 2.5: Phone Number */}
          {(!contact.isGroup && (contact.phone || contact.handleOrPhone)) && (
            <div className="bg-white dark:bg-[#111B21] p-4 shadow-xs text-xs space-y-1">
              <span className="text-[11px] text-gray-500 dark:text-[#8696A0] font-medium">Phone number</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {contact.phone || contact.handleOrPhone}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(contact.phone || contact.handleOrPhone || '', 'wa-phone')}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  title="Copy phone number"
                >
                  {copiedField === 'wa-phone' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Section 3: Media, Links & Docs */}
          <div className="bg-white dark:bg-[#111B21] p-4 shadow-xs text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-gray-100">Media, links and docs</span>
              <span className="text-gray-500 dark:text-[#8696A0] font-mono text-[11px]">
                {mediaPhotos.length} photos
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {mediaPhotos.slice(0, 4).map((url, i) => (
                <div
                  key={i}
                  onClick={() => openLightbox(url)}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer hover:opacity-85 transition-opacity"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Privacy & Settings */}
          <div className="bg-white dark:bg-[#111B21] shadow-xs divide-y divide-gray-100 dark:divide-[#202C33] text-xs">
            {/* Starred Messages */}
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#202C33]/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-gray-500 dark:text-[#8696A0]" />
                <span className="text-gray-900 dark:text-gray-100 font-medium">Starred messages</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Mute Notifications */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-500 dark:text-[#8696A0]" />
                <div>
                  <span className="text-gray-900 dark:text-gray-100 font-medium block">Mute notifications</span>
                  <span className="text-[10px] text-gray-400">{isMuted ? 'Muted' : 'Unmuted'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMuted((m) => !m)}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer relative ${
                  isMuted ? 'bg-[#008069] dark:bg-[#00A884]' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isMuted ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* End-to-End Encryption */}
            <div
              onClick={() => setShowSecurityVerify(true)}
              className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#202C33]/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#008069] dark:text-[#00A884]" />
                <div>
                  <span className="text-gray-900 dark:text-gray-100 font-medium block">Encryption</span>
                  <span className="text-[11px] text-gray-500 dark:text-[#8696A0]">
                    Messages and calls are end-to-end encrypted. Tap to verify.
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Section 5: Common Groups */}
          {contact.commonGroups && contact.commonGroups.length > 0 && (
            <div className="bg-white dark:bg-[#111B21] p-4 shadow-xs text-xs space-y-2">
              <span className="text-gray-500 dark:text-[#8696A0] font-medium text-[11px]">
                {contact.commonGroups.length} groups in common
              </span>
              {contact.commonGroups.map((grp: any, i: number) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-600/10 text-[#008069] flex items-center justify-center font-bold text-xs">
                    👥
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{grp}</span>
                </div>
              ))}
            </div>
          )}

          {/* Section 6: Danger Actions */}
          <div className="bg-white dark:bg-[#111B21] shadow-xs text-xs divide-y divide-gray-100 dark:divide-[#202C33]">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Block ${contact.name}? They will no longer be able to message you.`)) {
                  setIsBlocked(true);
                }
              }}
              className="w-full p-4 text-left flex items-center gap-3 text-red-500 hover:bg-red-50/50 dark:hover:bg-red-500/10 transition-colors font-medium cursor-pointer"
            >
              <Slash className="w-5 h-5 shrink-0" />
              <span>Block {contact.name}</span>
            </button>
            <button
              type="button"
              onClick={() => alert(`Report sent for ${contact.name}. WhatsApp safety team will review.`)}
              className="w-full p-4 text-left flex items-center gap-3 text-red-500 hover:bg-red-50/50 dark:hover:bg-red-500/10 transition-colors font-medium cursor-pointer"
            >
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Report {contact.name}</span>
            </button>
          </div>
        </div>

        {/* Security Verify Modal Overlay */}
        {showSecurityVerify && (
          <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111B21] p-6 rounded-3xl max-w-sm w-full space-y-4 text-center shadow-2xl border border-gray-200 dark:border-[#222E35]">
              <div className="w-12 h-12 rounded-full bg-[#00A884]/20 text-[#00A884] mx-auto flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Verify Security Code</h3>
              <p className="text-xs text-gray-600 dark:text-[#8696A0] leading-relaxed">
                To verify that your messages and calls with {contact.name} are end-to-end encrypted, scan this code on their phone or compare the numbers.
              </p>
              <div className="w-40 h-40 bg-white p-3 rounded-2xl mx-auto border-2 border-black/10 flex items-center justify-center">
                <QrCode className="w-32 h-32 text-black" />
              </div>
              <div className="font-mono text-xs tracking-wider text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#202C33] p-2.5 rounded-xl">
                48291 03847 29103 48192 00192 84729
              </div>
              <button
                type="button"
                onClick={() => setShowSecurityVerify(false)}
                className="w-full py-2 bg-[#008069] text-white rounded-xl font-bold text-xs hover:bg-[#006e5a] transition-colors"
              >
                Close Verification
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // 3. DISCORD AUTHENTIC USER PROFILE POPOUT / CARD
  // =========================================================================
  const renderDiscordProfile = () => {
    const bannerColor = contact.bannerColor || '#5865F2';

    return (
      <div className="w-full bg-[#232428] text-white rounded-3xl overflow-hidden shadow-2xl border border-[#1E1F22] flex flex-col max-h-[90vh]">
        {/* Discord Profile Banner */}
        <div
          className="h-28 w-full relative shrink-0"
          style={{ backgroundColor: bannerColor }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 rounded-full transition-colors cursor-pointer text-white z-10"
            title="Close Discord Profile"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Discord Avatar & Badges Overlap Bar */}
        <div className="px-5 relative flex items-end justify-between -mt-12 shrink-0">
          {/* Avatar with Status Ring */}
          <div className="relative">
            <div className="w-22 h-22 rounded-full overflow-hidden bg-[#5865F2] border-[6px] border-[#232428] shadow-md flex items-center justify-center font-bold text-2xl">
              {contact.profilePicUrl ? (
                <img src={contact.profilePicUrl} alt={contact.name} className="w-full h-full object-cover" />
              ) : (
                <span>{contact.avatarText || contact.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            {/* Status dot (Online: green, DND: red, Idle: yellow) */}
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#23A55A] border-[3px] border-[#232428]" />
          </div>

          {/* Badges Cluster */}
          <div className="flex items-center gap-1 bg-[#111214] px-2.5 py-1 rounded-lg border border-white/5 mb-2">
            <span title="Discord Nitro" className="text-base cursor-help">🚀</span>
            <span title="HypeSquad Bravery" className="text-base cursor-help">🛡️</span>
            <span title="Server Booster" className="text-base cursor-help">💎</span>
            <span title="Active Developer" className="text-base cursor-help">⚡</span>
          </div>
        </div>

        {/* Discord Card Details Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
          {/* Display Name & Username & Pronouns */}
          <div className="bg-[#111214] p-3.5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-white leading-tight">{contact.name}</h2>
                <span className="text-xs font-mono text-[#949BA4]">@{contact.username || contact.handleOrPhone.replace(/^#/, '')}</span>
              </div>
              {contact.pronouns && (
                <span className="text-[10px] bg-[#2B2D31] text-[#DBDEE1] px-2 py-0.5 rounded-full font-mono">
                  {contact.pronouns}
                </span>
              )}
            </div>

            {/* Custom Status */}
            {contact.customStatus && (
              <div className="text-xs text-[#DBDEE1] flex items-center gap-1.5 pt-1 border-t border-white/5">
                <span>{contact.customStatus}</span>
              </div>
            )}
          </div>

          {/* About Me Section */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#B5BAC1]">About Me</h4>
            <div className="bg-[#111214] p-3 rounded-xl border border-white/5 text-xs text-[#DBDEE1] leading-relaxed whitespace-pre-wrap">
              {contact.bio || "Hardware enthusiast & competitive gamer. Algiers timezone UTC+1."}
            </div>
          </div>

          {/* Member Since Dates */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#B5BAC1]">Member Since</h4>
            <div className="bg-[#111214] p-3 rounded-xl border border-white/5 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#5865F2]/20 flex items-center justify-center text-[#5865F2]">
                  <DiscordIcon className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] text-[#949BA4] block">Discord</span>
                  <span className="font-semibold text-white text-[11px]">{contact.memberSince || 'Apr 14, 2018'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-[#949BA4] block">Server</span>
                  <span className="font-semibold text-white text-[11px]">{contact.discordJoinDate || 'Oct 02, 2023'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Roles */}
          {contact.roles && contact.roles.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-[#B5BAC1]">
                Roles ({contact.roles.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {contact.roles.map((r: any, i: number) => {
                  const roleName = typeof r === 'string' ? r : r.name;
                  const roleColor = typeof r === 'string' ? '#5865F2' : (r.color || '#5865F2');
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 bg-[#2B2D31] border border-white/5 px-2.5 py-1 rounded-md text-[11px] text-[#DBDEE1]"
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: roleColor }} />
                      <span>{roleName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Note Field (Editable with LocalStorage Sync) */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#B5BAC1]">Note</h4>
            <div className="bg-[#111214] p-2.5 rounded-xl border border-white/5">
              <input
                type="text"
                value={discordNote}
                onChange={(e) => handleSaveDiscordNote(e.target.value)}
                placeholder="Click to add a note"
                className="w-full bg-transparent text-xs text-white placeholder-[#949BA4] focus:outline-none"
              />
            </div>
          </div>

          {/* Mutual Stats */}
          <div className="flex items-center justify-between text-xs text-[#949BA4] bg-[#111214] p-3 rounded-xl border border-white/5">
            <span>Mutual Servers: <strong>{contact.mutualServersCount || 6}</strong></span>
            <span>Mutual Friends: <strong>{contact.mutualFriendsCount || 2}</strong></span>
          </div>

          {/* Send Message Shortcut */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Message to @{contact.name}</span>
          </button>
        </div>
      </div>
    );
  };

  // =========================================================================
  // 4. INSTAGRAM NATIVE PROFILE CARD / SHEET
  // =========================================================================
  const renderInstagramProfile = () => {
    return (
      <div className="w-full bg-white dark:bg-[#000000] text-gray-900 dark:text-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-neutral-800 flex flex-col max-h-[90vh]">
        {/* Instagram Header */}
        <div className="h-14 px-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm font-sans tracking-tight">@{contact.username || contact.handleOrPhone.replace(/^@/, '')}</span>
            <span className="text-[#0095F6] text-xs">✓</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
            title="Close Instagram Profile"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Instagram Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
          {/* Top Row: Avatar & Counters */}
          <div className="flex items-center justify-between gap-4">
            {/* Story Gradient Ring Avatar */}
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] shrink-0 cursor-pointer hover:scale-105 transition-transform">
              <div className="w-20 h-20 rounded-full bg-white dark:bg-black p-0.5 overflow-hidden">
                {contact.profilePicUrl ? (
                  <img
                    src={contact.profilePicUrl}
                    alt={contact.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-extrabold text-2xl">
                    {(contact.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Posts / Followers / Following */}
            <div className="flex-1 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="block font-extrabold text-sm text-gray-900 dark:text-white">
                  {contact.postsCount || 184}
                </span>
                <span className="text-[11px] text-gray-500">Posts</span>
              </div>
              <div>
                <span className="block font-extrabold text-sm text-gray-900 dark:text-white">
                  {contact.followersCount || '24.5K'}
                </span>
                <span className="text-[11px] text-gray-500">Followers</span>
              </div>
              <div>
                <span className="block font-extrabold text-sm text-gray-900 dark:text-white">
                  {contact.followingCount || 612}
                </span>
                <span className="text-[11px] text-gray-500">Following</span>
              </div>
            </div>
          </div>

          {/* Name & Bio */}
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">{contact.name}</h3>
            <span className="text-[11px] text-gray-500 block">Digital Creator & Fashion</span>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap pt-0.5">
              {contact.bio || "Fashion & Lifestyle creator in Algiers 🇩🇿 ✨\nLivraison 58 Wilayas 📦"}
            </p>
            {contact.websiteUrl && (
              <a
                href={contact.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#0095F6] font-semibold flex items-center gap-1 pt-1 hover:underline"
              >
                <Link2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{contact.websiteUrl.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsFollowing((f) => !f)}
              className={`py-1.5 px-3 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                isFollowing
                  ? 'bg-gray-200 dark:bg-neutral-800 text-gray-900 dark:text-white'
                  : 'bg-[#0095F6] hover:bg-[#0081d6] text-white'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-3 bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-900 dark:text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
            >
              Message
            </button>
          </div>

          {/* Story Highlights Preview */}
          <div className="flex items-center gap-3 overflow-x-auto py-2 custom-scrollbar">
            {['Alger', 'Outfits', 'Stock', 'FAQ'].map((tag, i) => (
              <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-13 h-13 rounded-full border border-gray-300 dark:border-neutral-700 p-0.5 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-[10px]">
                    {tag[0]}
                  </div>
                </div>
                <span className="text-[10px] text-gray-600 dark:text-gray-400">{tag}</span>
              </div>
            ))}
          </div>

          {/* Photo Grid Preview */}
          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-gray-100 dark:border-neutral-800">
            {mediaPhotos.map((url, i) => (
              <div
                key={i}
                onClick={() => openLightbox(url)}
                className="aspect-square bg-gray-100 dark:bg-neutral-900 cursor-pointer overflow-hidden hover:opacity-85 transition-opacity"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // 5. SNAPCHAT NATIVE FRIENDSHIP PROFILE
  // =========================================================================
  const renderSnapchatProfile = () => {
    return (
      <div className="w-full bg-[#FFFFFF] dark:bg-[#121212] text-gray-900 dark:text-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-neutral-800 flex flex-col max-h-[90vh]">
        {/* Snapchat Bright Yellow Top Banner */}
        <div className="h-28 bg-[#FFFC00] text-black relative shrink-0 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-widest uppercase">Snapchat Friendship</span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-black/20 hover:bg-black/30 rounded-full transition-colors cursor-pointer text-black"
              title="Close Snapchat Profile"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-right font-black text-2xl opacity-20 select-none">👻</div>
        </div>

        {/* Snap Bitmoji & Avatar Overlap */}
        <div className="px-5 relative flex items-end justify-between -mt-12 shrink-0">
          <div className="w-22 h-22 rounded-full overflow-hidden bg-white dark:bg-[#121212] border-4 border-[#FFFC00] shadow-lg flex items-center justify-center font-bold text-2xl">
            {contact.profilePicUrl ? (
              <img src={contact.profilePicUrl} alt={contact.name} className="w-full h-full object-cover" />
            ) : (
              <span>👻</span>
            )}
          </div>
          {/* Snap Score Pill */}
          <div className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{(contact.snapScore || 184520).toLocaleString()} Snapscore</span>
          </div>
        </div>

        {/* Snapchat Details Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 text-xs">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">{contact.name}</h2>
            <span className="font-mono text-gray-500 dark:text-gray-400">@{contact.username || contact.handleOrPhone}</span>
          </div>

          {/* Friendship Streak Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border border-amber-500/30 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🔥</span>
              <div>
                <span className="font-black text-sm text-gray-900 dark:text-white block">
                  {contact.friendshipStreak || 245} Days Snapstreak!
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  {contact.friendshipSince || "Best Friends since March 2023"}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold bg-[#FFFC00] text-black px-2 py-0.5 rounded-full">Active</span>
          </div>

          {/* Zodiac & Charms Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-gray-50 dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800">
              <span className="text-[10px] text-gray-500 block uppercase font-bold">Astrological Sign</span>
              <span className="font-black text-sm text-gray-900 dark:text-white">
                {contact.astrologicalSign || "♌ Leo"}
              </span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800">
              <span className="text-[10px] text-gray-500 block uppercase font-bold">Snap Map</span>
              <span className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>Algiers</span>
              </span>
            </div>
          </div>

          {/* Bio / Quote */}
          {contact.bio && (
            <div className="bg-gray-50 dark:bg-neutral-900 p-3.5 rounded-xl border border-gray-200 dark:border-neutral-800 leading-relaxed text-gray-700 dark:text-gray-300">
              {contact.bio}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => alert(`Sending Snap to ${contact.name}...`)}
              className="py-2.5 bg-[#FFFC00] hover:bg-yellow-400 text-black font-extrabold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Camera className="w-4 h-4" />
              <span>Send Snap</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-900 dark:text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </button>
            <button
              type="button"
              onClick={() => alert(`Calling ${contact.name}...`)}
              className="py-2.5 bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-900 dark:text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // 6. VIBER NATIVE PROFILE CARD
  // =========================================================================
  const renderViberProfile = () => {
    return (
      <div className="w-full bg-[#FFFFFF] dark:bg-[#1A1829] text-gray-900 dark:text-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-[#2D2A45] flex flex-col max-h-[90vh]">
        {/* Viber Purple Header */}
        <div className="h-14 px-4 bg-[#7360F2] text-white flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2">
            <ViberIcon className="w-6 h-6 text-white" />
            <span className="font-bold text-sm">Viber Contact</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
            title="Close Viber Profile"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viber Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 text-xs">
          <div className="flex flex-col items-center text-center pb-2">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#7360F2] text-white flex items-center justify-center font-bold text-3xl shadow-lg border-4 border-white dark:border-[#2D2A45] mb-3">
              {contact.profilePicUrl ? (
                <img src={contact.profilePicUrl} alt={contact.name} className="w-full h-full object-cover" />
              ) : (
                <span>{contact.avatarText || contact.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{contact.name}</h2>
            <p className="font-mono text-gray-500 dark:text-[#A7A3C2] text-sm mt-0.5">{contact.handleOrPhone}</p>
            <span className="text-[11px] text-emerald-500 font-semibold mt-1">● Online on Viber</span>
          </div>

          {/* Viber Free Call & Free Message Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => alert(`Initiating Free Viber Call to ${contact.handleOrPhone}...`)}
              className="py-3 px-4 bg-[#7360F2] hover:bg-[#604ee0] text-white font-bold rounded-2xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Free Viber Call</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 bg-gray-100 dark:bg-[#2D2A45] hover:bg-gray-200 dark:hover:bg-[#393557] text-gray-900 dark:text-white font-bold rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-[#7360F2]" />
              <span>Free Message</span>
            </button>
          </div>

          {/* Status & Bio */}
          <div className="bg-gray-50 dark:bg-[#232038] p-4 rounded-2xl border border-gray-100 dark:border-white/5 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold">About / Bio</span>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
              {contact.bio || contact.about || "Merchant account - Available for free business communication on Viber."}
            </p>
          </div>

          {/* Shared Media Count */}
          <div className="bg-gray-50 dark:bg-[#232038] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ImageIcon className="w-4 h-4 text-[#7360F2]" />
              <span className="font-medium text-gray-800 dark:text-gray-200">Photos & Videos</span>
            </div>
            <span className="font-bold text-[#7360F2]">{contact.mediaCount?.photos || 22}</span>
          </div>

          {/* Block Viber Contact */}
          <button
            type="button"
            onClick={() => setIsBlocked((b) => !b)}
            className="w-full py-2.5 text-center text-red-500 hover:bg-red-500/10 rounded-xl transition-colors font-semibold cursor-pointer"
          >
            {isBlocked ? 'Unblock Contact' : 'Block Contact'}
          </button>
        </div>
      </div>
    );
  };

  // =========================================================================
  // 7. GENERIC / MULTI-CHANNEL ADAPTIVE PROFILE
  // =========================================================================
  const renderGenericProfile = () => {
    const theme = APP_GRADIENT_THEMES[effectiveAppId] || APP_GRADIENT_THEMES.whatsapp;

    return (
      <div className="w-full bg-white dark:bg-[#1A1D23] text-gray-900 dark:text-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-[#2E333D] flex flex-col max-h-[90vh]">
        {/* Adaptive Header */}
        <div
          className="h-14 px-4 text-white flex items-center justify-between shrink-0 select-none shadow-sm"
          style={{ backgroundColor: theme.solidColor }}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{theme.name} Profile</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
            title="Close Profile"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 text-xs">
          <div className="flex flex-col items-center text-center pb-2">
            <div
              className="w-24 h-24 rounded-full overflow-hidden text-white flex items-center justify-center font-bold text-3xl shadow-lg mb-3"
              style={{ backgroundColor: theme.solidColor }}
            >
              {contact.profilePicUrl ? (
                <img src={contact.profilePicUrl} alt={contact.name} className="w-full h-full object-cover" />
              ) : (
                <span>{contact.avatarText || contact.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{contact.name}</h2>
            <p className="font-mono text-gray-500 text-sm mt-0.5">{contact.handleOrPhone}</p>
            <span className="text-[11px] text-emerald-500 font-semibold mt-1">
              ● Connected via {theme.name}
            </span>
          </div>

          {contact.bio && (
            <div className="bg-gray-50 dark:bg-[#242831] p-4 rounded-2xl border border-gray-200 dark:border-white/5 space-y-1">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Bio / Details</span>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                {contact.bio}
              </p>
            </div>
          )}

          {contact.phone && (
            <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#242831] rounded-2xl border border-gray-200 dark:border-white/5">
              <div>
                <span className="font-mono text-sm font-semibold">{contact.phone}</span>
                <span className="text-[10px] text-gray-400 block">Phone Number</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(contact.phone!, 'gen_phone')}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-gray-500 transition-colors"
              >
                {copiedField === 'gen_phone' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              style={{ backgroundColor: theme.solidColor }}
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Route to the authentic channel view
  const renderProfileContent = () => {
    switch (effectiveAppId) {
      case 'telegram':
        return renderTelegramProfile();
      case 'whatsapp':
      case 'whatsapp_2':
        return renderWhatsAppProfile();
      case 'discord':
        return renderDiscordProfile();
      case 'instagram':
        return renderInstagramProfile();
      case 'snapchat':
        return renderSnapchatProfile();
      case 'viber':
        return renderViberProfile();
      default:
        return renderGenericProfile();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="profile-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-text"
        role="dialog"
        aria-modal="true"
        aria-label={`${contact.name}'s Profile`}
      >
        <motion.div
          key="profile-modal-card"
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md relative"
        >
          {renderProfileContent()}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
