"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mic,
  Paperclip,
  Smile,
  Phone,
  Video,
  Search,
  MoreVertical,
  CheckCheck,
  Bot,
  User,
  ShieldCheck,
  Heart,
  ThumbsUp,
  Image as ImageIcon,
  FileText,
  ChevronLeft,
  Trash2,
  Lock,
  Hash,
  AtSign,
  Sparkles,
  Server,
  Terminal,
  Check,
  ExternalLink,
  Plus,
  X,
  Clock,
  Bell,
  Pin,
  Users,
  Inbox,
  HelpCircle,
  Gift,
  UserPlus,
  LogOut,
  Info,
  Camera,
  Flame
} from "lucide-react";
import { isTelegramEventMessage } from "./MiddleChatColumn";
import { ContactProfile, ChatMessage } from "@/lib/mock_chats";
import { renderPressableText } from "@/lib/pressableLinks";
import {
  DiscordIcon,
  SlackIcon,
  SignalIcon,
  XIcon,
  MatrixIcon,
  IrcIcon,
  LinkedInIcon,
  GoogleMessagesIcon,
  GoogleChatIcon,
  GoogleVoiceIcon,
  WhatsAppIcon,
  ViberIcon,
  SnapchatIcon
} from "@/components/icons/BrandIcons";

interface ChannelNativeViewsProps {
  appId: string;
  activeContact: ContactProfile;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSendVoiceNote: (duration: string) => void;
  onSendAttachment: (urlOrName: string, type: "image" | "file", size?: string) => void;
  renderMessageAttachment: (m: ChatMessage, isMe: boolean) => React.ReactNode;
  renderChannelMenu: (appId: string) => React.ReactNode;
  renderQuickTemplatesBar?: () => React.ReactNode;
  inputText?: string;
  setInputText?: (val: string | ((prev: string) => string)) => void;
  onMobileBack?: () => void;
  isMobileEmbedded?: boolean;
  theme: { solidColor: string; name: string };
  onDeleteMessage?: (msgId: string) => void;
  onReact?: (msgId: string, emoji: string) => void;
  dragHandleProps?: Record<string, any>;
  currentTopicId?: string;
  currentTopic?: any;
  onSelectTopic?: (topicId: string) => void;
  currentUser?: any;
}

export const ChannelNativeViews: React.FC<ChannelNativeViewsProps> = ({
  appId,
  activeContact,
  messages,
  onSendMessage,
  onSendVoiceNote,
  onSendAttachment,
  renderMessageAttachment,
  renderChannelMenu,
  renderQuickTemplatesBar,
  inputText: externalInputText,
  setInputText: externalSetInputText,
  onMobileBack,
  isMobileEmbedded = false,
  theme,
  onDeleteMessage,
  onReact,
  dragHandleProps,
  currentTopicId,
  currentTopic,
  onSelectTopic,
  currentUser,
}) => {
  const [localInputText, setLocalInputText] = useState("");
  const inputText = externalInputText !== undefined ? externalInputText : localInputText;
  const setInputText = externalSetInputText || setLocalInputText;

  const renderQuickBar = () => {
    if (!renderQuickTemplatesBar) return null;
    return (
      <div className="shrink-0 w-full overflow-hidden border-b border-black/10 dark:border-white/10">
        {renderQuickTemplatesBar()}
      </div>
    );
  };
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);

  // Viber Native Features State
  const [activeViberCall, setActiveViberCall] = useState<'audio' | 'video' | null>(null);
  const [viberCallSeconds, setViberCallSeconds] = useState(0);
  const [isViberCallMuted, setIsViberCallMuted] = useState(false);
  const [isViberCallSpeaker, setIsViberCallSpeaker] = useState(true);
  const [showViberContactInfo, setShowViberContactInfo] = useState(false);
  const [showViberStickers, setShowViberStickers] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeViberCall) {
      setViberCallSeconds(0);
      timer = setInterval(() => setViberCallSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [activeViberCall]);

  const handleEndViberCall = () => {
    const mins = Math.floor(viberCallSeconds / 60);
    const secs = viberCallSeconds % 60;
    const durStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    const callTypeStr = activeViberCall === 'video' ? 'Appel vidéo Viber' : 'Appel vocal Viber gratuit';
    onSendMessage(`📞 ${callTypeStr} terminé (${durStr})`);
    setActiveViberCall(null);
  };

  const VIBER_STICKERS = [
    { id: 'vs_heart', emoji: '💜', label: 'Rakuten' },
    { id: 'vs_wave', emoji: '👋', label: 'Salam' },
    { id: 'vs_thumb', emoji: '👍', label: 'Bravo' },
    { id: 'vs_party', emoji: '🎉', label: 'Mabrouk' },
    { id: 'vs_package', emoji: '📦', label: 'Colis' },
    { id: 'vs_check', emoji: '✅', label: 'Confirmé' },
    { id: 'vs_coffee', emoji: '☕', label: 'Pause' },
    { id: 'vs_fire', emoji: '🔥', label: 'Top' },
  ];

  // Snapchat Native Features State
  const [activeSnapCall, setActiveSnapCall] = useState<'audio' | 'video' | null>(null);
  const [snapCallSeconds, setSnapCallSeconds] = useState(0);
  const [isSnapCallMuted, setIsSnapCallMuted] = useState(false);
  const [isSnapCallSpeaker, setIsSnapCallSpeaker] = useState(true);
  const [showSnapProfile, setShowSnapProfile] = useState(false);
  const [showSnapStickers, setShowSnapStickers] = useState(false);
  const [activeOpenedSnap, setActiveOpenedSnap] = useState<{ id: string; text: string; imageUrl?: string; secondsRemaining: number } | null>(null);
  const [savedSnapChatIds, setSavedSnapChatIds] = useState<Set<string>>(new Set());
  const [openedSnapIds, setOpenedSnapIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeSnapCall) {
      setSnapCallSeconds(0);
      timer = setInterval(() => setSnapCallSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [activeSnapCall]);

  // Snap viewer countdown
  useEffect(() => {
    let snapTimer: NodeJS.Timeout;
    if (activeOpenedSnap) {
      snapTimer = setInterval(() => {
        setActiveOpenedSnap((prev) => {
          if (!prev) return null;
          if (prev.secondsRemaining <= 1) {
            setOpenedSnapIds((s) => new Set(s).add(prev.id));
            return null;
          }
          return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(snapTimer);
  }, [activeOpenedSnap]);

  const handleEndSnapCall = () => {
    const mins = Math.floor(snapCallSeconds / 60);
    const secs = snapCallSeconds % 60;
    const durStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    const callTypeStr = activeSnapCall === 'video' ? 'Appel vidéo Snapchat HD' : 'Appel vocal Snapchat';
    onSendMessage(`📞 ${callTypeStr} terminé (${durStr})`);
    setActiveSnapCall(null);
  };

  const toggleSaveSnapChat = (msgId: string) => {
    setSavedSnapChatIds((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  };

  const handleOpenSnap = (msg: ChatMessage) => {
    setOpenedSnapIds((prev) => new Set(prev).add(msg.id));
    setActiveOpenedSnap({
      id: msg.id,
      text: msg.text,
      imageUrl: msg.imageUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1200&fit=crop',
      secondsRemaining: 10,
    });
  };

  const SNAP_STICKERS = [
    { id: 'ss_streak', emoji: '🔥', label: 'Streak' },
    { id: 'ss_ghost', emoji: '👻', label: 'Snapchat' },
    { id: 'ss_hundred', emoji: '💯', label: '100%' },
    { id: 'ss_wave', emoji: '👋', label: 'Salam' },
    { id: 'ss_heart', emoji: '❤️', label: 'Love' },
    { id: 'ss_shopping', emoji: '🛍️', label: 'Commande' },
    { id: 'ss_express', emoji: '⚡', label: 'Express' },
    { id: 'ss_party', emoji: '🎉', label: 'Mabrouk' },
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const isReadOnly = Boolean(activeContact?.isReadOnly || activeContact?.readOnly || activeContact?.canSend === false || activeContact?.isBroadcast || activeContact?.statusText === 'Channel');

  const renderReadOnlyBanner = () => (
    <div className="p-3 mx-4 my-2.5 rounded-xl bg-gray-500/10 border border-gray-500/20 text-center text-xs text-gray-400 font-medium flex items-center justify-center gap-2 select-none shrink-0">
      <Lock className="w-4 h-4 text-amber-500 shrink-0" />
      <span>Only administrators can send messages in this channel</span>
    </div>
  );

  // Auto scroll on contact switch or new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
      messagesEndRef.current.scrollIntoView({ behavior: "auto", block: "end" });
    }
    const t = setTimeout(() => {
      if (messagesEndRef.current) {
        const container = messagesEndRef.current.parentElement;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
        messagesEndRef.current.scrollIntoView({ behavior: "auto", block: "end" });
      }
    }, 120);
    return () => clearTimeout(t);
  }, [activeContact?.id, messages.length]);

  // Voice recording timer
  useEffect(() => {
    let timer: any;
    if (isRecording) {
      setRecordSeconds(0);
      timer = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isReadOnly) return;
    onSendMessage(inputText.trim());
    setInputText("");
    setIsEmojiOpen(false);
  };

  const handleVoiceSubmit = () => {
    const mins = Math.floor(recordSeconds / 60);
    const secs = recordSeconds % 60;
    const duration = `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    onSendVoiceNote(duration);
    setIsRecording(false);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onSendAttachment(event.target.result as string, "image", `${Math.round(file.size / 1024)} KB`);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendAttachment(file.name, "file", `${Math.round(file.size / 1024)} KB`);
    }
    e.target.value = "";
  };

  const renderSharedControls = () => (
    <>
      <input
        ref={imgInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
        className="hidden"
        onChange={handleDocFileChange}
      />
    </>
  );

  // =========================================================================
  // 1. DISCORD REPLICA
  // =========================================================================
  if (appId === "discord") {
    const activeTopic = currentTopic || (activeContact.topics ? activeContact.topics.find((t: any) => String(t.id) === String(currentTopicId)) : null) || (activeContact.topics?.[0]);
    const isDMMode = activeContact.id === "dc_dm" || activeTopic?.type === "dm" || (!activeContact.name.startsWith("#") && activeContact.handleOrPhone === "Direct Messages");
    const targetName = activeTopic ? activeTopic.name.replace(/^#/, "") : activeContact.name.replace(/^#/, "");
    const targetAvatar = activeTopic?.profilePicUrl || activeContact.profilePicUrl;
    const isTargetClosed = Boolean(activeTopic?.closed || activeContact.readOnly);
    const isTargetBroadcast = Boolean(activeTopic?.isBroadcast || activeContact.isBroadcast);
    const targetStatus = activeTopic?.userStatus || "online";
    const targetActivity = activeTopic?.userActivity || activeContact.statusText;

    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#313338] text-white ${isMobileEmbedded ? "rounded-b-3xl border-t-0 shadow-none" : "rounded-3xl border shadow-sm"} border-[#232428] overflow-hidden relative font-sans select-text`}>
        {renderSharedControls()}

        {/* Discord Authentic Header */}
        <div {...dragHandleProps} className={`h-12 px-4 bg-[#2B2D31] border-b border-[#202225] flex items-center justify-between shrink-0 shadow-xs select-none cursor-grab active:cursor-grabbing touch-none z-20 ${dragHandleProps?.className || ""}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {onMobileBack && (
              <button type="button" onClick={onMobileBack} className="md:hidden p-1 -ml-1 text-gray-300 hover:text-white cursor-pointer" title="Back to channels">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            
            {/* Header Icon / Avatar with Real-time Status Badge */}
            {isDMMode ? (
              <div className="relative shrink-0">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-[#5865F2] flex items-center justify-center text-xs font-bold shadow-xs">
                  {targetAvatar ? (
                    <img src={targetAvatar} alt={targetName} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                  ) : (
                    <span>{targetName.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#2B2D31] ${
                  targetStatus === 'online' ? 'bg-[#23A55A]' :
                  targetStatus === 'idle' ? 'bg-[#F0B232]' :
                  targetStatus === 'dnd' ? 'bg-[#F23F43]' : 'bg-[#80848E]'
                }`} />
              </div>
            ) : (
              <div className="text-[#80848E] font-extrabold text-base shrink-0 flex items-center justify-center">
                {activeTopic?.type === 'announcement' ? '📢' : activeTopic?.type === 'voice' ? '🔊' : '#'}
              </div>
            )}

            <div className="min-w-0 flex items-center gap-2">
              <span className="font-bold text-sm text-white truncate hover:underline cursor-pointer">
                {targetName}
              </span>
              {activeTopic?.badgeText && (
                <span className="text-[10px] bg-[#5865F2] text-white font-extrabold px-1.5 py-0.2 rounded-xs uppercase tracking-wide shrink-0">
                  {activeTopic.badgeText}
                </span>
              )}
              {targetActivity && (
                <span className="hidden md:inline-block text-[11px] text-[#949BA4] truncate border-l border-[#3F4147] pl-2">
                  {targetActivity}
                </span>
              )}
            </div>
          </div>

          {/* Right Action Icons (Discord Desktop Suite) */}
          <div className="flex items-center gap-2.5 text-[#B5BAC1]">
            <button type="button" className="hidden lg:flex hover:text-white transition-colors cursor-pointer p-1" title="Salons / Fils">
              <Hash className="w-4 h-4" />
            </button>
            <button type="button" className="hover:text-white transition-colors cursor-pointer p-1" title="Notifications">
              <Bell className="w-4 h-4" />
            </button>
            <button type="button" className="hover:text-white transition-colors cursor-pointer p-1" title="Messages épinglés">
              <Pin className="w-4 h-4" />
            </button>
            <button type="button" className="hidden sm:flex hover:text-white transition-colors cursor-pointer p-1" title="Afficher les membres">
              <Users className="w-4 h-4" />
            </button>
            
            {/* Search Input Box */}
            <div className="hidden sm:flex items-center bg-[#1E1F22] hover:bg-[#18191C] rounded-md px-2 py-1 text-xs text-[#949BA4] border border-transparent focus-within:border-[#5865F2] w-32 md:w-40 transition-all">
              <input
                type="text"
                placeholder="Rechercher"
                className="bg-transparent text-xs text-white placeholder-[#80848E] focus:outline-none w-full"
              />
              <Search className="w-3.5 h-3.5 ml-1 shrink-0 text-[#949BA4]" />
            </div>

            <button type="button" className="hover:text-white transition-colors cursor-pointer p-1" title="Boîte de réception">
              <Inbox className="w-4 h-4" />
            </button>
            <button type="button" className="hover:text-white transition-colors cursor-pointer p-1" title="Aide">
              <HelpCircle className="w-4 h-4" />
            </button>

            {renderChannelMenu("discord")}
          </div>
        </div>

        {/* Discord Sub-Channels Quick Selector Bar (Horizontal Navigation) */}
        {activeContact?.topics && activeContact.topics.length > 0 && (
          <div className="px-3 py-1.5 bg-[#2B2D31]/95 backdrop-blur-md border-b border-[#202225] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 select-none z-10 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#949BA4] shrink-0 flex items-center gap-1 pl-1">
              {isDMMode ? <AtSign className="w-3 h-3 text-[#5865F2]" /> : <Hash className="w-3 h-3 text-[#5865F2]" />}
              {isDMMode ? 'Messages :' : 'Salons :'}
            </span>
            {activeContact.topics.map((t: any) => {
              const isCurrent = String(t.id) === String(activeTopic?.id);
              const hasUnread = Boolean(t.unreadCount && t.unreadCount > 0);
              const tEmoji = t.iconEmoji || (t.type === 'voice' ? '🔊' : t.type === 'announcement' ? '📢' : '#');
              return (
                <button
                  key={t.id}
                  id={`subchannel-tab-${t.id}`}
                  type="button"
                  onClick={() => onSelectTopic?.(t.id)}
                  className={`h-7 px-2.5 rounded-md text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#404249] text-white shadow-xs font-bold'
                      : 'text-[#949BA4] hover:bg-[#35373C] hover:text-[#DBDEE1]'
                  }`}
                >
                  {isDMMode && t.profilePicUrl ? (
                    <img src={t.profilePicUrl} alt="" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                  ) : (
                    <span className="text-[11px] shrink-0">{tEmoji}</span>
                  )}
                  <span className="truncate max-w-[120px]">{t.name.replace(/^#/, '')}</span>
                  {hasUnread && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-[#F23F43] text-white shadow-xs">
                      {t.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Discord Messages Feed with Welcome Hero */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#313338]">
          {/* Authentic Discord Channel / DM Welcome Hero Banner */}
          <div className="pb-4 pt-2 border-b border-[#3F4147] text-left select-none">
            {isDMMode ? (
              <div className="flex items-center gap-4 mb-2">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-[#5865F2] flex items-center justify-center text-white font-black text-xl shadow-md border-2 border-[#202225]">
                    {targetAvatar ? (
                      <img src={targetAvatar} alt={targetName} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    ) : (
                      <span>{targetName.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#313338] ${
                    targetStatus === 'online' ? 'bg-[#23A55A]' :
                    targetStatus === 'idle' ? 'bg-[#F0B232]' :
                    targetStatus === 'dnd' ? 'bg-[#F23F43]' : 'bg-[#80848E]'
                  }`} />
                </div>
                <div>
                  <h3 className="font-black text-xl text-white">{targetName}</h3>
                  <p className="text-xs text-[#949BA4] font-mono">@{targetName.toLowerCase().replace(/\s+/g, '_')}</p>
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#4E5058] flex items-center justify-center text-white font-black text-3xl mb-3 shadow-md">
                {activeTopic?.type === 'announcement' ? '📢' : activeTopic?.type === 'voice' ? '🔊' : '#'}
              </div>
            )}
            <h3 className="font-black text-xl text-white">
              {isDMMode ? `Début de votre conversation avec @${targetName}` : `Bienvenue dans #${targetName} !`}
            </h3>
            <p className="text-xs text-[#949BA4] mt-1 max-w-lg leading-relaxed">
              {isDMMode
                ? `C'est le tout début de votre historique de messages privés avec ${targetName}. Les communications sont synchronisées avec vos flux SaaS.`
                : `C'est le début du salon #${targetName} sur le serveur ${activeContact.name}. Partagez vos annonces et collaborez avec les membres.`}
            </p>
          </div>

          {/* Messages Stream */}
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-60 text-xs text-[#949BA4]">
              <span>Aucun message dans ce salon pour le moment. Dites bonjour ! 👋</span>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender === "operator";
              const speakerName = isMe ? (currentUser?.name || "malik") : (m.authorName || targetName);
              const speakerAvatar = isMe ? (currentUser?.image || currentUser?.avatarUrl || null) : (m.authorAvatar || targetAvatar);
              const roleColor = isMe ? "#5865F2" : (m.authorRoleColor || (m.authorRole === "ADMIN" ? "#ED4245" : m.authorRole === "VIP" ? "#E91E63" : m.authorRole === "DEV" ? "#FEE75C" : m.authorRole === "MOD" ? "#23A55A" : "#DBDEE1"));
              const roleTag = isMe ? "OP" : (m.authorRole || (activeTopic?.isBot ? "BOT" : null));

              const isEvent = isTelegramEventMessage(m, m.text);
              if (isEvent) {
                const lowerText = (m.text || '').toLowerCase();
                const isJoin = lowerText.includes('joined') || lowerText.includes('rejoint') || lowerText.includes('انضم');
                const isLeave = lowerText.includes('left') || lowerText.includes('quitt') || lowerText.includes('غادر');
                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 py-1 px-3 -mx-2 rounded-lg hover:bg-[#2E3035]/50 transition-colors text-xs text-[#949BA4] select-text my-1"
                  >
                    {isJoin ? (
                      <UserPlus className="w-4 h-4 text-[#23A55A] shrink-0" />
                    ) : isLeave ? (
                      <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-[#5865F2] shrink-0" />
                    )}
                    <span className="flex-1 min-w-0">
                      <strong className="text-white hover:underline cursor-pointer mr-1">{speakerName}</strong>
                      <span>{m.text?.charAt(0).toLowerCase() + m.text?.slice(1)}</span>
                    </span>
                    <span className="text-[10px] text-[#949BA4] font-mono shrink-0 select-none">{m.time}</span>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  onMouseEnter={() => setHoveredMsgId(m.id)}
                  onMouseLeave={() => setHoveredMsgId(null)}
                  className="flex items-start gap-3 group px-2 py-1 -mx-2 rounded-lg hover:bg-[#2E3035] transition-colors relative"
                >
                  {/* Speaker Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#5865F2] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs mt-0.5">
                    {speakerAvatar ? (
                      <img src={speakerAvatar} alt={speakerName} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    ) : (
                      <span>{speakerName.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs hover:underline cursor-pointer" style={{ color: roleColor }}>
                        {speakerName}
                      </span>
                      {roleTag && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-xs font-black uppercase tracking-wider ${
                          roleTag === 'BOT' ? 'bg-[#5865F2] text-white' :
                          roleTag === 'ADMIN' ? 'bg-[#ED4245] text-white' :
                          roleTag === 'DEV' ? 'bg-[#FEE75C] text-black font-extrabold' :
                          roleTag === 'VIP' ? 'bg-[#E91E63] text-white' :
                          roleTag === 'MOD' ? 'bg-[#23A55A] text-white' : 'bg-[#5865F2] text-white'
                        }`}>
                          {roleTag}
                        </span>
                      )}
                      <span className="text-[10px] text-[#949BA4] font-mono select-none">{m.time}</span>
                    </div>

                    {/* Message Body */}
                    <div className="text-xs text-[#DBDEE1] mt-0.5 leading-relaxed break-words whitespace-pre-wrap">
                      {renderPressableText(m.text, { appId: 'discord' })}
                    </div>

                    {/* Rich Bot Embed Card (Discord Embed System) */}
                    {m.embed && (
                      <div className="mt-2 max-w-md bg-[#2B2D31] border-l-4 rounded-r-lg p-3 text-xs shadow-md space-y-1.5" style={{ borderLeftColor: m.embed.color || "#5865F2" }}>
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          {m.embed.title}
                        </div>
                        <div className="text-[11px] text-[#DBDEE1] leading-relaxed">
                          {m.embed.description}
                        </div>
                        {m.embed.fields && m.embed.fields.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            {m.embed.fields.map((f: any, fIdx: number) => (
                              <div key={fIdx} className="bg-black/20 p-1.5 rounded-md">
                                <div className="text-[9px] font-bold text-[#949BA4] uppercase tracking-wider">{f.name}</div>
                                <div className="text-[11px] font-semibold text-white mt-0.5">{f.value}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {m.embed.footer && (
                          <div className="text-[9px] text-[#949BA4] font-mono pt-1 border-t border-white/5">
                            {m.embed.footer}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Attachment Render */}
                    {renderMessageAttachment(m, isMe)}

                    {/* Discord Reaction Pills */}
                    {m.reactions && m.reactions.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        {m.reactions.map((r, rIdx) => (
                          <button
                            key={rIdx}
                            type="button"
                            onClick={() => onReact?.(m.id, r.emoji)}
                            className={`px-2 py-0.5 rounded-md text-xs flex items-center gap-1 border transition-all cursor-pointer ${
                              r.userReacted
                                ? 'bg-[#3C4270] border-[#5865F2] text-[#5865F2]'
                                : 'bg-[#2B2D31] border-[#3F4147] text-[#DBDEE1] hover:bg-[#35373C]'
                            }`}
                          >
                            <span>{r.emoji}</span>
                            <span className="font-bold text-[10px]">{r.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Hover Floating Action Bar */}
                  {hoveredMsgId === m.id && (
                    <div className="absolute right-2 -top-3 bg-[#313338] border border-[#232428] shadow-lg rounded-md px-1.5 py-0.5 flex items-center gap-1 z-20">
                      <button type="button" onClick={() => onReact?.(m.id, "❤️")} className="hover:scale-120 text-xs cursor-pointer p-0.5" title="Love">❤️</button>
                      <button type="button" onClick={() => onReact?.(m.id, "🔥")} className="hover:scale-120 text-xs cursor-pointer p-0.5" title="Fire">🔥</button>
                      <button type="button" onClick={() => onReact?.(m.id, "👍")} className="hover:scale-120 text-xs cursor-pointer p-0.5" title="Thumbs Up">👍</button>
                      <button type="button" onClick={() => onReact?.(m.id, "🎉")} className="hover:scale-120 text-xs cursor-pointer p-0.5" title="Celebrate">🎉</button>
                      <button type="button" onClick={() => onDeleteMessage?.(m.id)} className="p-0.5 text-red-400 hover:text-red-300 cursor-pointer" title="Supprimer le message">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Discord Input Bar */}
        {isTargetClosed ? renderReadOnlyBanner() : (
          <div className="bg-[#313338] border-t border-[#232428] flex flex-col shrink-0">
            {renderQuickBar()}
            <div className="p-3">
            {isRecording ? (
              <div className="bg-[#383A40] rounded-xl p-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-red-400 font-mono font-bold">Enregistrement audio : {recordSeconds}s</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setIsRecording(false)} className="text-[#949BA4] hover:text-white p-1 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={handleVoiceSubmit} className="px-3 py-1 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg font-bold cursor-pointer">
                    Envoyer Vocal
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSend} className="bg-[#383A40] rounded-xl px-3 py-2 flex items-center gap-2 shadow-xs">
                {/* Plus Button in Circle */}
                <button
                  type="button"
                  onClick={() => imgInputRef.current?.click()}
                  className="w-6 h-6 rounded-full bg-[#4E5058] hover:bg-[#5865F2] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Ajouter une photo ou vidéo"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="text-[#B5BAC1] hover:text-white cursor-pointer shrink-0"
                  title="Joindre un fichier"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isDMMode ? `Envoyer un message à @${targetName}` : `Envoyer un message dans #${targetName}`}
                  className="flex-1 bg-transparent text-xs text-white placeholder-[#80848E] focus:outline-none font-sans"
                />

                {/* Right Action Badges */}
                <button type="button" className="text-[#B5BAC1] hover:text-[#5865F2] cursor-pointer shrink-0 hidden sm:block p-1" title="Offrir Nitro">
                  <Gift className="w-4 h-4" />
                </button>
                <button type="button" className="text-[#B5BAC1] hover:text-white cursor-pointer shrink-0 hidden sm:block px-1 py-0.5 rounded bg-[#4E5058] text-[9px] font-black" title="Sélecteur GIF">
                  GIF
                </button>
                <button
                  type="button"
                  onClick={() => setIsEmojiOpen(!isEmojiOpen)}
                  className="text-[#B5BAC1] hover:text-[#FEE75C] cursor-pointer shrink-0 p-1"
                  title="Sélecteur d'émojis"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsRecording(true)}
                  className="text-[#B5BAC1] hover:text-white cursor-pointer shrink-0 p-1"
                  title="Enregistrer un message vocal"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg cursor-pointer disabled:opacity-30 transition-all shrink-0"
                  title="Envoyer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
            
            {/* Discord Typing & Helper Indicator */}
            <div className="px-2 pt-1 text-[10px] text-[#949BA4] flex items-center justify-between select-none">
              <span className="truncate">
                {isDMMode ? `${targetName} est actuellement actif.` : `Connecté au serveur ${activeContact.name}`}
              </span>
              <span className="font-mono text-[9px] opacity-75">Discord Omnichannel v2</span>
            </div>
          </div>
        </div>
      )}
      </div>
    );
  }

  // =========================================================================
  // 2. SLACK REPLICA
  // =========================================================================
  if (appId === "slack") {
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#1A1D21] text-white ${isMobileEmbedded ? "rounded-b-3xl border-t-0 shadow-none" : "rounded-3xl border shadow-sm"} border-[#2C3136] overflow-hidden relative font-sans`}>
        {renderSharedControls()}
        {/* Slack Header */}
        <div {...dragHandleProps} className={`h-14 px-4 bg-[#1A1D21] border-b border-[#2C3136] flex items-center justify-between shrink-0 shadow-xs select-none cursor-grab active:cursor-grabbing touch-none ${dragHandleProps?.className || ""}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {onMobileBack && (
              <button type="button" onClick={onMobileBack} className="md:hidden p-1 -ml-1 text-gray-300 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-7 h-7 rounded-lg bg-[#4A154B] flex items-center justify-center shrink-0">
              <SlackIcon className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-white truncate">{activeContact.name}</span>
                <span className="text-[10px] text-gray-400">⭐</span>
              </div>
              <span className="text-[10px] text-[#ABABAD] block truncate">Slack Workspace Channel</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#4A154B]/30 text-[#ECB22E] font-bold px-2 py-0.5 rounded-md border border-[#ECB22E]/20">
              Slack Live
            </span>
            {renderChannelMenu("slack")}
          </div>
        </div>

        {/* Slack Messages Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-[#1A1D21]">
          {messages.map((m) => {
            const isMe = m.sender === "operator";
            return (
              <div
                key={m.id}
                onMouseEnter={() => setHoveredMsgId(m.id)}
                onMouseLeave={() => setHoveredMsgId(null)}
                className="flex items-start gap-3 group px-2 py-1.5 -mx-2 rounded-lg hover:bg-[#222529] transition-colors relative"
              >
                <div className={`w-9 h-9 rounded-md flex items-center justify-center text-white font-bold text-xs shrink-0 ${isMe ? "bg-[#4A154B]" : activeContact.avatarBg || "bg-[#36C5F0]"}`}>
                  {isMe ? "OP" : activeContact.avatarText || "S"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-white">{isMe ? "You (Operator)" : activeContact.name}</span>
                    <span className="text-[10px] text-[#ABABAD] font-mono">{m.time}</span>
                  </div>
                  <div className="text-xs text-[#D1D2D3] mt-0.5 leading-relaxed break-words whitespace-pre-wrap">{renderPressableText(m.text, { appId: 'slack' })}</div>
                  {renderMessageAttachment(m, isMe)}
                </div>

                {hoveredMsgId === m.id && (
                  <div className="absolute right-2 -top-2 bg-[#222529] border border-[#383F45] shadow-lg rounded-md px-1.5 py-0.5 flex items-center gap-1 z-20">
                    <button type="button" onClick={() => onReact?.(m.id, "✅")} className="text-xs cursor-pointer">✅</button>
                    <button type="button" onClick={() => onReact?.(m.id, "🙌")} className="text-xs cursor-pointer">🙌</button>
                    <button type="button" onClick={() => onDeleteMessage?.(m.id)} className="p-0.5 text-red-400 hover:text-red-300 cursor-pointer">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Slack Composer with Formatting Bar */}
        {isReadOnly ? renderReadOnlyBanner() : (
          <div className="bg-[#1A1D21] border-t border-[#2C3136] flex flex-col shrink-0">
            {renderQuickBar()}
            <div className="p-3">
              <div className="border border-[#383F45] rounded-xl overflow-hidden bg-[#222529]">
                {/* Formatting Toolbar */}
                <div className="px-3 py-1 bg-[#1A1D21]/80 border-b border-[#383F45] flex items-center gap-2 text-[#ABABAD] text-xs">
                  <button type="button" onClick={() => setInputText((p) => p + "**text**")} className="font-bold hover:text-white p-0.5">B</button>
                  <button type="button" onClick={() => setInputText((p) => p + "_text_")} className="italic hover:text-white p-0.5">I</button>
                  <button type="button" onClick={() => docInputRef.current?.click()} className="hover:text-white p-0.5" title="Attach file">
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => imgInputRef.current?.click()} className="hover:text-white p-0.5" title="Add image">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => setIsRecording(true)} className="hover:text-white p-0.5" title="Record Voice">
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </div>
                {isRecording ? (
                  <div className="p-3 flex items-center justify-between text-xs bg-red-950/20 text-red-300">
                    <span>Recording Slack Audio: {recordSeconds}s</span>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setIsRecording(false)} className="text-gray-400">Cancel</button>
                      <button type="button" onClick={handleVoiceSubmit} className="px-3 py-1 bg-[#007A5A] text-white rounded font-bold">Send</button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSend} className="p-2.5 flex items-center gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Reply to ${activeContact.name}...`}
                      className="flex-1 bg-transparent text-xs text-white placeholder-[#ABABAD] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="p-1.5 bg-[#007A5A] hover:bg-[#148567] text-white rounded-lg cursor-pointer disabled:opacity-30"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 3. SIGNAL REPLICA (End-to-End Encrypted)
  // =========================================================================
  if (appId === "signal") {
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#1B1C1F] text-white ${isMobileEmbedded ? "rounded-b-3xl border-t-0 shadow-none" : "rounded-3xl border shadow-sm"} border-[#2B2D31] overflow-hidden relative font-sans`}>
        {renderSharedControls()}
        {/* Signal Header */}
        <div {...dragHandleProps} className={`h-14 px-4 bg-[#232428] border-b border-[#2B2D31] flex items-center justify-between shrink-0 shadow-xs select-none cursor-grab active:cursor-grabbing touch-none ${dragHandleProps?.className || ""}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {onMobileBack && (
              <button type="button" onClick={onMobileBack} className="md:hidden p-1 -ml-1 text-gray-300 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-7 h-7 rounded-xl bg-[#3A76F0] flex items-center justify-center shrink-0">
              <SignalIcon className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-xs text-white truncate block">{activeContact.name}</span>
              <span className="text-[10px] text-[#3A76F0] flex items-center gap-1 font-bold">
                <Lock className="w-2.5 h-2.5" />
                <span>Signal Encrypted</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#3A76F0]/20 text-[#3A76F0] font-bold px-2 py-0.5 rounded-full border border-[#3A76F0]/30">
              Verified Key
            </span>
            {renderChannelMenu("signal")}
          </div>
        </div>

        {/* Signal Messages Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2.5 custom-scrollbar bg-[#1B1C1F]">
          <div className="mx-auto max-w-[260px] p-2 bg-[#2B2D31]/80 rounded-xl text-center text-[10px] text-gray-400 space-y-0.5">
            <Lock className="w-3 h-3 text-[#3A76F0] mx-auto mb-1" />
            <p className="font-bold text-gray-300">Messages and calls are end-to-end encrypted.</p>
            <p>No one outside of this chat can read them.</p>
          </div>

          {messages.map((m) => {
            const isMe = m.sender === "operator";
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs relative ${
                    isMe
                      ? "bg-[#3A76F0] text-white rounded-br-xs shadow-md"
                      : "bg-[#2B2D31] text-gray-100 rounded-bl-xs shadow-xs"
                  }`}
                >
                  <p className="leading-relaxed break-words whitespace-pre-wrap">{renderPressableText(m.text, { appId: 'signal' })}</p>
                  {renderMessageAttachment(m, isMe)}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-75">
                    <span>{m.time}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Signal Composer */}
        {isReadOnly ? renderReadOnlyBanner() : (
          <div className="bg-[#232428] border-t border-[#2B2D31] flex flex-col shrink-0">
            {renderQuickBar()}
            <div className="p-3">
              {isRecording ? (
                <div className="flex items-center justify-between text-xs bg-red-950/30 p-2 rounded-full text-red-300">
                  <span className="font-bold font-mono pl-2">Signal Voice: {recordSeconds}s</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIsRecording(false)} className="text-gray-400">Cancel</button>
                    <button type="button" onClick={handleVoiceSubmit} className="px-3 py-1 bg-[#3A76F0] text-white rounded-full font-bold">Send</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <button type="button" onClick={() => imgInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white" title="Photo">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => docInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white" title="File">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Signal message"
                    className="flex-1 bg-[#1B1C1F] border border-[#383A40] rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-[#3A76F0]"
                  />
                  <button type="button" onClick={() => setIsRecording(true)} className="p-2 text-gray-400 hover:text-white" title="Voice">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2 bg-[#3A76F0] hover:bg-blue-600 text-white rounded-full disabled:opacity-30 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 4. X (TWITTER) REPLICA (Pure Black Minimalist DM)
  // =========================================================================
  if (appId === "x_twitter") {
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-black text-white ${isMobileEmbedded ? "rounded-b-3xl border-t-0 shadow-none" : "rounded-3xl border shadow-sm"} border-[#2F3336] overflow-hidden relative font-sans`}>
        {renderSharedControls()}
        {/* X Header */}
        <div {...dragHandleProps} className={`h-14 px-4 bg-black border-b border-[#2F3336] flex items-center justify-between shrink-0 shadow-xs select-none cursor-grab active:cursor-grabbing touch-none ${dragHandleProps?.className || ""}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {onMobileBack && (
              <button type="button" onClick={onMobileBack} className="md:hidden p-1 -ml-1 text-gray-300 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-7 h-7 rounded-lg bg-black border border-white/20 flex items-center justify-center shrink-0">
              <XIcon className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-xs text-white truncate">{activeContact.name}</span>
                <span className="text-[#1D9BF0] font-bold text-xs">✓</span>
              </div>
              <span className="text-[10px] text-gray-500 block truncate">{activeContact.handleOrPhone}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-white/10 text-white font-mono px-2 py-0.5 rounded-full">
              Direct Message
            </span>
            {renderChannelMenu("x_twitter")}
          </div>
        </div>

        {/* X Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black">
          {messages.map((m) => {
            const isMe = m.sender === "operator";
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-3xl text-xs relative ${
                    isMe
                      ? "bg-[#1D9BF0] text-white rounded-br-xs shadow-md"
                      : "bg-[#2F3336] text-white rounded-bl-xs"
                  }`}
                >
                  <p className="leading-relaxed break-words whitespace-pre-wrap">{renderPressableText(m.text, { appId: 'x_twitter' })}</p>
                  {renderMessageAttachment(m, isMe)}
                  <span className="block text-[9px] opacity-75 mt-1 text-right">{m.time}</span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* X Input */}
        {isReadOnly ? renderReadOnlyBanner() : (
          <div className="bg-black border-t border-[#2F3336] flex flex-col shrink-0">
            {renderQuickBar()}
            <div className="p-3">
              {isRecording ? (
                <div className="flex items-center justify-between text-xs bg-red-950/30 p-2 rounded-full text-red-300">
                  <span className="font-bold pl-2">X Voice Note: {recordSeconds}s</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIsRecording(false)} className="text-gray-400">Cancel</button>
                    <button type="button" onClick={handleVoiceSubmit} className="px-3 py-1 bg-[#1D9BF0] text-white rounded-full font-bold">Send</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSend} className="flex items-center gap-2 bg-[#202327] rounded-full px-3 py-1.5 border border-transparent focus-within:border-[#1D9BF0]">
                  <button type="button" onClick={() => imgInputRef.current?.click()} className="text-[#1D9BF0] hover:text-blue-400 p-1">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => docInputRef.current?.click()} className="text-[#1D9BF0] hover:text-blue-400 p-1">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Start a new message"
                    className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
                  />
                  <button type="button" onClick={() => setIsRecording(true)} className="text-[#1D9BF0] hover:text-blue-400 p-1">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-1.5 bg-[#1D9BF0] hover:bg-blue-600 text-white rounded-full disabled:opacity-30 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 5. MATRIX REPLICA (Matrix Green Terminal Room)
  // =========================================================================
  if (appId === "matrix") {
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#0F141C] text-[#E0E6ED] ${isMobileEmbedded ? "rounded-b-3xl border-t-0 shadow-none" : "rounded-3xl border shadow-sm"} border-[#1E2633] overflow-hidden relative font-sans`}>
        {renderSharedControls()}
        {/* Matrix Header */}
        <div {...dragHandleProps} className={`h-14 px-4 bg-[#141B26] border-b border-[#1E2633] flex items-center justify-between shrink-0 shadow-xs select-none cursor-grab active:cursor-grabbing touch-none ${dragHandleProps?.className || ""}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {onMobileBack && (
              <button type="button" onClick={onMobileBack} className="md:hidden p-1 -ml-1 text-gray-300 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-7 h-7 rounded-lg bg-[#0DBD8B]/20 border border-[#0DBD8B] flex items-center justify-center shrink-0 text-[#0DBD8B] font-bold">
              [m]
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-xs text-white truncate block">{activeContact.name}</span>
              <span className="text-[10px] text-[#0DBD8B] font-mono flex items-center gap-1 font-bold">
                <Lock className="w-2.5 h-2.5" />
                <span>Encrypted Matrix Synapse</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#0DBD8B]/10 text-[#0DBD8B] font-mono px-2 py-0.5 rounded-full border border-[#0DBD8B]/30">
              e2e:megolm
            </span>
            {renderChannelMenu("matrix")}
          </div>
        </div>

        {/* Matrix Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#0F141C]">
          {messages.map((m) => {
            const isMe = m.sender === "operator";
            return (
              <div key={m.id} className="flex items-start gap-3 text-xs">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${isMe ? "bg-[#0DBD8B] text-black" : "bg-[#1E2633] text-[#0DBD8B] border border-[#0DBD8B]/40"}`}>
                  {isMe ? "OP" : activeContact.avatarText || "M"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0DBD8B] font-mono">{isMe ? "@operator:local" : activeContact.handleOrPhone}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{m.time}</span>
                  </div>
                  <div className="text-xs text-gray-200 mt-0.5 leading-relaxed break-words whitespace-pre-wrap">{renderPressableText(m.text, { appId: 'matrix' })}</div>
                  {renderMessageAttachment(m, isMe)}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Matrix Composer */}
        {isReadOnly ? renderReadOnlyBanner() : (
          <div className="bg-[#141B26] border-t border-[#1E2633] flex flex-col shrink-0">
            {renderQuickBar()}
            <div className="p-3">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <button type="button" onClick={() => imgInputRef.current?.click()} className="text-[#0DBD8B] hover:text-white p-1">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => docInputRef.current?.click()} className="text-[#0DBD8B] hover:text-white p-1">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Send an encrypted message..."
                  className="flex-1 bg-[#0F141C] border border-[#1E2633] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#0DBD8B]"
                />
                <button type="button" onClick={() => setIsRecording(true)} className="text-[#0DBD8B] hover:text-white p-1">
                  <Mic className="w-4 h-4" />
                </button>
                <button type="submit" disabled={!inputText.trim()} className="px-3 py-2 bg-[#0DBD8B] hover:bg-[#0aa579] text-black rounded-xl font-bold text-xs disabled:opacity-30 cursor-pointer">
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 6. IRC REPLICA (Classic Monospace Terminal)
  // =========================================================================
  if (appId === "irc") {
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#1E222A] text-[#00FF66] ${isMobileEmbedded ? "rounded-b-3xl border-t-0 shadow-none" : "rounded-3xl border shadow-sm"} border-emerald-950 overflow-hidden relative font-mono`}>
        {renderSharedControls()}
        {/* IRC Header */}
        <div {...dragHandleProps} className={`h-14 px-4 bg-[#14171E] border-b border-emerald-900/40 flex items-center justify-between shrink-0 select-none cursor-grab active:cursor-grabbing touch-none ${dragHandleProps?.className || ""}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {onMobileBack && (
              <button type="button" onClick={onMobileBack} className="md:hidden p-1 -ml-1 text-emerald-400">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-7 h-7 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/40 flex items-center justify-center shrink-0 text-[#00FF66] font-bold text-xs">
              #
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-xs text-[#00FF66] truncate block">{activeContact.name}</span>
              <span className="text-[10px] text-emerald-400/70 block truncate">irc.libera.chat • +nt [topic: Store Relays]</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-950 text-[#00FF66] px-2 py-0.5 rounded-sm border border-emerald-800">
              SSL:6697
            </span>
            {renderChannelMenu("irc")}
          </div>
        </div>

        {/* IRC Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-[#1E222A] text-xs">
          <div className="text-emerald-500/70 text-[10px] pb-2 border-b border-emerald-900/30">
            *** Now talking in {activeContact.name}<br />
            *** Mode {activeContact.name} +nt by ChanServ
          </div>
          {messages.map((m) => {
            const isMe = m.sender === "operator";
            return (
              <div key={m.id} className="leading-snug">
                <span className="text-gray-500 font-mono text-[10px]">[{m.time}] </span>
                <span className={isMe ? "text-amber-400 font-bold" : "text-[#00FF66] font-bold"}>
                  &lt;{isMe ? "operator" : activeContact.name.replace(/^#/, "")}&gt;{" "}
                </span>
                <span className="text-gray-100 break-all">{renderPressableText(m.text, { appId: 'irc' })}</span>
                {renderMessageAttachment(m, isMe)}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* IRC Prompt Input */}
        {isReadOnly ? renderReadOnlyBanner() : (
          <div className="bg-[#14171E] border-t border-emerald-900/40 flex flex-col shrink-0">
            {renderQuickBar()}
            <div className="p-3">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <span className="text-amber-400 text-xs font-bold shrink-0">&gt;</span>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type message or /command..."
                  className="flex-1 bg-transparent text-xs text-[#00FF66] placeholder-emerald-800 focus:outline-none font-mono"
                />
                <button type="submit" disabled={!inputText.trim()} className="px-3 py-1.5 bg-[#00FF66] text-black font-bold text-xs rounded-sm cursor-pointer disabled:opacity-30">
                  SEND
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 7. LINKEDIN REPLICA (Corporate B2B InMail)
  // =========================================================================
  if (appId === "linkedin") {
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-white dark:bg-[#1D2226] text-gray-900 dark:text-white ${isMobileEmbedded ? "rounded-b-3xl border-t-0 shadow-none" : "rounded-3xl border shadow-sm"} border-gray-200 dark:border-neutral-800 overflow-hidden relative font-sans`}>
        {renderSharedControls()}
        {/* LinkedIn Header */}
        <div {...dragHandleProps} className={`h-14 px-4 bg-white dark:bg-[#1D2226] border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between shrink-0 shadow-xs select-none cursor-grab active:cursor-grabbing touch-none ${dragHandleProps?.className || ""}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {onMobileBack && (
              <button type="button" onClick={onMobileBack} className="md:hidden p-1 -ml-1 text-gray-500">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-[#0A66C2] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {activeContact.avatarText || "IN"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-gray-900 dark:text-white truncate">{activeContact.name}</span>
                <span className="text-[10px] bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 px-1.5 rounded-sm font-semibold">1st</span>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block truncate">{activeContact.handleOrPhone}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#0A66C2]/10 text-[#0A66C2] font-bold px-2 py-0.5 rounded-full">
              LinkedIn InMail
            </span>
            {renderChannelMenu("linkedin")}
          </div>
        </div>

        {/* LinkedIn Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gray-50 dark:bg-[#15191C]">
          {messages.map((m) => {
            const isMe = m.sender === "operator";
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs relative ${
                    isMe
                      ? "bg-[#0A66C2] text-white rounded-br-xs shadow-xs"
                      : "bg-white dark:bg-[#1D2226] text-gray-900 dark:text-gray-100 rounded-bl-xs border border-gray-200 dark:border-neutral-800 shadow-xs"
                  }`}
                >
                  <p className="leading-relaxed break-words whitespace-pre-wrap">{renderPressableText(m.text, { appId: 'linkedin' })}</p>
                  {renderMessageAttachment(m, isMe)}
                  <span className="block text-[9px] opacity-75 mt-1 text-right">{m.time}</span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* LinkedIn Composer */}
        {isReadOnly ? renderReadOnlyBanner() : (
          <div className="bg-white dark:bg-[#1D2226] border-t border-gray-200 dark:border-neutral-800 flex flex-col shrink-0">
            {renderQuickBar()}
            <div className="p-3">
              <form onSubmit={handleSend} className="flex items-center gap-2">
              <button type="button" onClick={() => imgInputRef.current?.click()} className="text-gray-500 hover:text-[#0A66C2] p-1">
                <ImageIcon className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => docInputRef.current?.click()} className="text-gray-500 hover:text-[#0A66C2] p-1">
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 bg-gray-100 dark:bg-[#15191C] border border-gray-300 dark:border-neutral-700 rounded-full px-4 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#0A66C2]"
              />
              <button type="button" onClick={() => setIsRecording(true)} className="text-gray-500 hover:text-[#0A66C2] p-1">
                <Mic className="w-4 h-4" />
              </button>
              <button type="submit" disabled={!inputText.trim()} className="px-3.5 py-1.5 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs rounded-full disabled:opacity-30 cursor-pointer">
                Send
              </button>
            </form>
          </div>
        </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 8. GOOGLE MESSAGES (RCS) / GOOGLE CHAT / GOOGLE VOICE
  // =========================================================================
  const isGoogleFamily = appId === "google_messages" || appId === "google_chat" || appId === "google_voice";
  if (isGoogleFamily) {
    const brandColor = appId === "google_messages" ? "#1A73E8" : appId === "google_chat" ? "#00AC47" : "#0F9D58";
    const label = appId === "google_messages" ? "RCS Message" : appId === "google_chat" ? "Google Chat" : "Google Voice SMS";

    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-white dark:bg-[#1E1F22] text-gray-900 dark:text-white ${isMobileEmbedded ? "rounded-b-3xl border-t-0 shadow-none" : "rounded-3xl border shadow-sm"} border-gray-200 dark:border-neutral-800 overflow-hidden relative font-sans`}>
        {renderSharedControls()}
        {/* Google Header */}
        <div {...dragHandleProps} className={`h-14 px-4 bg-white dark:bg-[#1E1F22] border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between shrink-0 shadow-xs select-none cursor-grab active:cursor-grabbing touch-none ${dragHandleProps?.className || ""}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {onMobileBack && (
              <button type="button" onClick={onMobileBack} className="md:hidden p-1 -ml-1 text-gray-500">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs" style={{ backgroundColor: brandColor }}>
              {activeContact.avatarText || "G"}
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-xs text-gray-900 dark:text-white truncate block">{activeContact.name}</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block truncate">{activeContact.handleOrPhone}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: brandColor + "20", color: brandColor }}>
              {label}
            </span>
            {renderChannelMenu(appId)}
          </div>
        </div>

        {/* Google Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2.5 custom-scrollbar bg-[#F2F4F7] dark:bg-[#141517]">
          {messages.map((m) => {
            const isMe = m.sender === "operator";
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-xs relative ${
                    isMe
                      ? "text-white rounded-br-xs shadow-xs"
                      : "bg-white dark:bg-[#2B2D30] text-gray-900 dark:text-gray-100 rounded-bl-xs shadow-xs"
                  }`}
                  style={isMe ? { backgroundColor: brandColor } : {}}
                >
                  <p className="leading-relaxed break-words whitespace-pre-wrap">{renderPressableText(m.text, { appId: appId })}</p>
                  {renderMessageAttachment(m, isMe)}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-75">
                    <span>{m.time}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Google Composer */}
        {isReadOnly ? renderReadOnlyBanner() : (
          <div className="bg-white dark:bg-[#1E1F22] border-t border-gray-200 dark:border-neutral-800 flex flex-col shrink-0">
            {renderQuickBar()}
            <div className="p-3">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <button type="button" onClick={() => imgInputRef.current?.click()} className="text-gray-500 hover:text-gray-700 p-1">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => docInputRef.current?.click()} className="text-gray-500 hover:text-gray-700 p-1">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Send ${label}...`}
                  className="flex-1 bg-gray-100 dark:bg-[#2B2D30] border border-gray-300 dark:border-neutral-700 rounded-full px-4 py-2 text-xs text-gray-900 dark:text-white focus:outline-none"
                />
                <button type="button" onClick={() => setIsRecording(true)} className="text-gray-500 hover:text-gray-700 p-1">
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 text-white rounded-full disabled:opacity-30 cursor-pointer shadow-md"
                  style={{ backgroundColor: brandColor }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 8. VIBER REPLICA (Rakuten Viber Purple)
  // =========================================================================
  if (appId === "viber") {
    const contactPhone = activeContact.handleOrPhone || activeContact.phone || "+213 551 24 88 19";
    const isOnline = activeContact.statusText === "En ligne" || !activeContact.statusText;

    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#F4F2F9] dark:bg-[#14121E] text-gray-900 dark:text-white ${isMobileEmbedded ? "rounded-b-3xl border-t-0 shadow-none" : "rounded-3xl border shadow-sm"} border-[#E2DCF7] dark:border-[#2D2845] overflow-hidden relative font-sans`}>
        {renderSharedControls()}

        {/* Viber Header */}
        <div {...dragHandleProps} className={`h-14 px-3 sm:px-4 bg-[#7360F2] text-white flex items-center justify-between shrink-0 shadow-sm select-none cursor-grab active:cursor-grabbing touch-none ${dragHandleProps?.className || ""}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {onMobileBack && (
              <button type="button" onClick={onMobileBack} className="md:hidden p-1 -ml-1 text-white/80 hover:text-white cursor-pointer">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            
            {/* Avatar with online indicator */}
            <div 
              onClick={() => setShowViberContactInfo(true)}
              className="relative w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 cursor-pointer overflow-hidden shadow-xs hover:ring-2 hover:ring-white/40 transition-all"
            >
              {activeContact.profilePicUrl ? (
                <img
                  src={activeContact.profilePicUrl}
                  alt={activeContact.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="font-extrabold text-xs text-white">
                  {activeContact.avatarText || activeContact.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#7360F2] rounded-full" />
              )}
            </div>

            {/* Contact details */}
            <div 
              onClick={() => setShowViberContactInfo(true)}
              className="min-w-0 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs text-white truncate block max-w-[150px] sm:max-w-[220px]">
                  {activeContact.name}
                </span>
                {activeContact.isBroadcast ? (
                  <span className="text-[9px] bg-white/25 px-1.5 py-0.2 rounded-full font-bold">📢 Canal</span>
                ) : (
                  <span className="text-[10px] text-purple-200" title="Viber Business">✓</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-white/85 font-mono truncate">
                <span>{contactPhone}</span>
                <span>•</span>
                <span className="font-sans text-[10px] text-white/75">{activeContact.statusText || 'En ligne'}</span>
              </div>
            </div>
          </div>

          {/* Action buttons: Free Call, Video, Info, Menu */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveViberCall('audio')}
              title="Appel Viber gratuit"
              className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveViberCall('video')}
              title="Appel vidéo Viber"
              className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowViberContactInfo(true)}
              title="Détails du contact"
              className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4" />
            </button>
            {renderChannelMenu("viber")}
          </div>
        </div>

        {/* Viber Messages Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 custom-scrollbar bg-[#F4F2F9] dark:bg-[#14121E]">
          {/* Encryption banner */}
          <div className="mx-auto max-w-[290px] p-2 bg-[#7360F2]/10 dark:bg-[#7360F2]/20 border border-[#7360F2]/25 rounded-2xl text-center text-[10px] text-[#7360F2] dark:text-[#B6ACFA] space-y-0.5 shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-[#7360F2] dark:text-[#B6ACFA] mx-auto mb-0.5" />
            <p className="font-bold">Messages et appels chiffrés de bout en bout avec Rakuten Viber.</p>
          </div>

          {/* Date separator */}
          <div className="flex justify-center my-1">
            <span className="px-3 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-400">
              Aujourd&apos;hui
            </span>
          </div>

          {messages.map((m) => {
            const isMe = m.sender === "operator";
            const isSticker = m.text?.includes('[Sticker Viber:');
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} group`}>
                <div
                  className={`max-w-[78%] sm:max-w-[70%] px-3.5 py-2.5 rounded-2xl text-xs relative ${
                    isSticker
                      ? "bg-transparent shadow-none p-1 text-center"
                      : isMe
                      ? "bg-[#7360F2] text-white rounded-br-xs shadow-sm"
                      : "bg-white dark:bg-[#231F33] text-gray-900 dark:text-gray-100 rounded-bl-xs shadow-xs border border-[#E2DCF7] dark:border-[#2D2845]"
                  }`}
                >
                  {/* Sender name if group */}
                  {!isMe && (activeContact.isGroup || activeContact.isBroadcast) && (
                    <span className="block text-[10px] font-black text-[#7360F2] mb-0.5">
                      {m.senderName || activeContact.name}
                    </span>
                  )}

                  {/* Text or Sticker */}
                  {isSticker ? (
                    <div className="text-4xl p-2 animate-bounce">
                      {m.text.split(' ')[0]}
                    </div>
                  ) : (
                    <p className="leading-relaxed break-words whitespace-pre-wrap font-normal">
                      {renderPressableText(m.text, { appId: 'viber' })}
                    </p>
                  )}

                  {renderMessageAttachment(m, isMe)}

                  {/* Message footer */}
                  <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isMe ? "text-white/80" : "text-gray-400 dark:text-gray-500"}`}>
                    <span>{m.time}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Viber Stickers Drawer */}
        <AnimatePresence>
          {showViberStickers && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white dark:bg-[#1E1A30] border-t border-[#E2DCF7] dark:border-[#2D2845] p-3 overflow-hidden shadow-inner"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#7360F2] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Autocollants Officiels Viber</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowViberStickers(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {VIBER_STICKERS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onSendMessage(`${s.emoji} [Sticker Viber: ${s.label}]`);
                      setShowViberStickers(false);
                    }}
                    className="p-2 rounded-xl hover:bg-[#7360F2]/10 dark:hover:bg-[#7360F2]/20 flex flex-col items-center gap-1 transition-all hover:scale-110 cursor-pointer"
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="text-[9px] font-medium text-gray-500 truncate max-w-[50px]">{s.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Viber Composer */}
        {isReadOnly ? renderReadOnlyBanner() : (
          <div className="bg-white dark:bg-[#1C182B] border-t border-[#E2DCF7] dark:border-[#2D2845] flex flex-col shrink-0">
            {renderQuickBar()}
            <div className="p-2.5 sm:p-3">
              {isRecording ? (
                <div className="flex items-center justify-between text-xs bg-purple-950/40 p-2.5 rounded-full text-purple-200 border border-[#7360F2]/30">
                  <span className="font-bold font-mono pl-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>Message vocal Viber: {recordSeconds}s</span>
                  </span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIsRecording(false)} className="text-gray-400 hover:text-white px-2 cursor-pointer">
                      Annuler
                    </button>
                    <button type="button" onClick={handleVoiceSubmit} className="px-3.5 py-1 bg-[#7360F2] text-white rounded-full font-bold shadow-xs cursor-pointer">
                      Envoyer
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSend} className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setShowViberStickers(!showViberStickers)}
                    className={`p-2 rounded-full transition-colors cursor-pointer ${showViberStickers ? 'text-[#7360F2] bg-[#7360F2]/10' : 'text-gray-400 hover:text-[#7360F2]'}`}
                    title="Autocollants Viber"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => imgInputRef.current?.click()} className="p-2 text-gray-400 hover:text-[#7360F2] transition-colors cursor-pointer" title="Photo">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => docInputRef.current?.click()} className="p-2 text-gray-400 hover:text-[#7360F2] transition-colors cursor-pointer" title="Document">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Rédiger un message Viber..."
                    className="flex-1 bg-[#F4F2F9] dark:bg-[#231F33] border border-[#E2DCF7] dark:border-[#2D2845] rounded-full px-4 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#7360F2] placeholder-gray-400"
                  />
                  <button type="button" onClick={() => setIsRecording(true)} className="p-2 text-gray-400 hover:text-[#7360F2] transition-colors cursor-pointer" title="Message vocal">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2 bg-[#7360F2] hover:bg-[#624EE8] text-white rounded-full disabled:opacity-30 cursor-pointer shadow-md transition-colors shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Viber Live Calling Screen */}
        <AnimatePresence>
          {activeViberCall && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#2D234D]/95 backdrop-blur-md z-50 flex flex-col items-center justify-between p-8 text-white select-none"
            >
              <div className="text-center space-y-1">
                <span className="text-[11px] font-bold text-purple-200 tracking-wider uppercase">
                  {activeViberCall === 'video' ? 'Appel vidéo Viber HD' : 'Appel Viber gratuit'}
                </span>
                <p className="text-xs text-purple-300">
                  {viberCallSeconds < 2 ? "Connexion en cours..." : `En communication • ${Math.floor(viberCallSeconds / 60)}:${(viberCallSeconds % 60).toString().padStart(2, '0')}`}
                </p>
              </div>

              {/* Pulsing Avatar */}
              <div className="relative flex items-center justify-center my-6">
                <span className="absolute w-36 h-36 rounded-full bg-[#7360F2]/30 animate-ping" />
                <span className="absolute w-28 h-28 rounded-full bg-[#7360F2]/40" />
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-2xl bg-[#7360F2] flex items-center justify-center">
                  {activeContact.profilePicUrl ? (
                    <img src={activeContact.profilePicUrl} alt={activeContact.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-white">{activeContact.avatarText || activeContact.name.slice(0, 2)}</span>
                  )}
                </div>
              </div>

              {/* Name & Phone */}
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-white">{activeContact.name}</h3>
                <p className="text-xs font-mono text-purple-200">{contactPhone}</p>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] text-purple-200 mt-2">
                  <Lock className="w-3 h-3" />
                  <span>Chiffré de bout en bout</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsViberCallMuted(!isViberCallMuted)}
                  className={`p-3 rounded-full transition-colors cursor-pointer ${isViberCallMuted ? 'bg-red-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                  title={isViberCallMuted ? "Activer le micro" : "Couper le micro"}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleEndViberCall}
                  className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl cursor-pointer transition-transform active:scale-90"
                  title="Raccrocher"
                >
                  <Phone className="w-6 h-6 rotate-[135deg]" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsViberCallSpeaker(!isViberCallSpeaker)}
                  className={`p-3 rounded-full transition-colors cursor-pointer ${isViberCallSpeaker ? 'bg-[#7360F2] text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                  title={isViberCallSpeaker ? "Haut-parleur actif" : "Haut-parleur désactivé"}
                >
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Viber Contact Details Modal */}
        <AnimatePresence>
          {showViberContactInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
              onClick={() => setShowViberContactInfo(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-white dark:bg-[#1E1A30] rounded-3xl p-5 shadow-2xl border border-[#E2DCF7] dark:border-[#2D2845] space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-neutral-800">
                  <span className="text-xs font-bold text-[#7360F2] flex items-center gap-1.5">
                    <ViberIcon className="w-4 h-4" />
                    <span>Profil Viber Business</span>
                  </span>
                  <button type="button" onClick={() => setShowViberContactInfo(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center space-y-2 py-2">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#7360F2] shadow-md">
                    {activeContact.profilePicUrl ? (
                      <img src={activeContact.profilePicUrl} alt={activeContact.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#7360F2] flex items-center justify-center text-white text-xl font-bold">
                        {activeContact.avatarText || activeContact.name.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white">{activeContact.name}</h4>
                  <p className="text-xs font-mono font-bold text-[#7360F2] bg-[#7360F2]/10 px-3 py-1 rounded-full">
                    {contactPhone}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {activeContact.bio || "Client Viber connecté"}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-neutral-800 text-xs">
                  <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Chiffrement bout en bout</span>
                    </span>
                    <span className="text-emerald-500 font-bold text-[10px]">Activé</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#7360F2]" />
                      <span>Appels gratuits Viber</span>
                    </span>
                    <span className="text-purple-500 font-bold text-[10px]">Disponible</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowViberContactInfo(false);
                      setActiveViberCall('audio');
                    }}
                    className="py-2 px-3 rounded-xl bg-[#7360F2] hover:bg-[#624EE8] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Appeler</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowViberContactInfo(false);
                      setActiveViberCall('video');
                    }}
                    className="py-2 px-3 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-[#7360F2] dark:text-purple-300 hover:bg-purple-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Vidéo HD</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // =========================================================================
  // 9. SNAPCHAT REPLICA (Authentic Snapchat Experience)
  // =========================================================================
  if (appId === "snapchat") {
    const snapHandle = activeContact.username || (activeContact.handleOrPhone ? activeContact.handleOrPhone.split('•')[0].trim() : '@snap_contact');
    const snapPhone = activeContact.phone || (activeContact.handleOrPhone?.includes('+') ? activeContact.handleOrPhone.split('•')[1]?.trim() : '+213 551 24 88 19');
    const streakMatch = activeContact.statusText?.match(/🔥\s*(\d+)/);
    const streakCount = streakMatch ? streakMatch[1] : (activeContact.bio?.match(/🔥\s*(\d+)/)?.[1] || "42");

    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-white dark:bg-[#101114] text-gray-900 dark:text-white ${isMobileEmbedded ? "rounded-b-3xl border-t-0 shadow-none" : "rounded-3xl border shadow-sm"} border-gray-200 dark:border-neutral-800 overflow-hidden relative font-sans`}>
        {renderSharedControls()}

        {/* Snapchat Header */}
        <div {...dragHandleProps} className={`h-14 px-4 bg-[#FFFC00] text-black flex items-center justify-between shrink-0 shadow-xs select-none cursor-grab active:cursor-grabbing touch-none border-b border-yellow-300 ${dragHandleProps?.className || ""}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {onMobileBack && (
              <button type="button" onClick={onMobileBack} className="md:hidden p-1 -ml-1 text-black/80 hover:text-black cursor-pointer">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Bitmoji Avatar with Story Ring */}
            <button
              type="button"
              onClick={() => setShowSnapProfile(true)}
              className="relative group shrink-0 cursor-pointer"
              title="Ouvrir le profil Snapchat"
            >
              <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 shadow-xs">
                <div className="w-full h-full rounded-full overflow-hidden bg-black/5 flex items-center justify-center">
                  {activeContact.profilePicUrl ? (
                    <img src={activeContact.profilePicUrl} alt={activeContact.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black text-xs text-black">{activeContact.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#FFFC00]" />
            </button>

            {/* Contact Name, Handle & Streaks */}
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-black text-xs text-black truncate block">{activeContact.name}</span>
                <span className="text-[10px] bg-black/15 text-black font-extrabold px-1.5 py-0.2 rounded-full inline-flex items-center gap-0.5 shrink-0">
                  <Flame className="w-2.5 h-2.5 text-amber-600 fill-amber-500" />
                  <span>{streakCount}</span>
                </span>
              </div>
              <span className="text-[10px] text-black/75 flex items-center gap-1 font-semibold truncate">
                <span className="font-mono">{snapHandle}</span>
                <span>•</span>
                <span className="truncate">{snapPhone}</span>
              </span>
            </div>
          </div>

          {/* Action Buttons: Audio Call, Video Call, Profile Info & Menu */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSnapCall('audio')}
              className="p-1.5 rounded-full hover:bg-black/10 text-black transition-colors cursor-pointer"
              title="Appel vocal Snapchat"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveSnapCall('video')}
              className="p-1.5 rounded-full hover:bg-black/10 text-black transition-colors cursor-pointer"
              title="Appel vidéo Snapchat HD"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowSnapProfile(true)}
              className="p-1.5 rounded-full hover:bg-black/10 text-black transition-colors cursor-pointer"
              title="Profil Snapcode"
            >
              <Info className="w-4 h-4" />
            </button>
            {renderChannelMenu("snapchat")}
          </div>
        </div>

        {/* Snapchat Messages Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#FAFAFA] dark:bg-[#121316]">
          {/* Security & Streak Pill */}
          <div className="mx-auto max-w-xs p-2.5 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/40 rounded-2xl text-center text-[10px] text-yellow-900 dark:text-yellow-300 space-y-1 shadow-xs">
            <div className="flex items-center justify-center gap-1.5 font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Snap Streak en cours : {streakCount} jours avec {activeContact.name} !</span>
            </div>
            <p className="text-[9px] text-yellow-800/80 dark:text-yellow-400/80">
              Chiffré de bout en bout • Les Snaps non sauvegardés s&apos;effacent après visionnage.
            </p>
          </div>

          {messages.map((m) => {
            const isMe = m.sender === "operator";
            const isSnapMessage = m.text.includes("🟥") || m.text.includes("Nouveau Snap") || m.text.toLowerCase().includes("snap");
            const isOpened = openedSnapIds.has(m.id) || m.seen;
            const isSaved = savedSnapChatIds.has(m.id);

            return (
              <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} group`}>
                {isSnapMessage ? (
                  /* Visual Snap Card (Red / Unopened / Opened) */
                  <div
                    onClick={() => handleOpenSnap(m)}
                    className={`max-w-[80%] p-3 rounded-2xl text-xs cursor-pointer transition-all shadow-xs border ${
                      isMe
                        ? "bg-[#00ACFF] text-white border-transparent"
                        : isOpened
                        ? "bg-gray-100 dark:bg-[#1E2024] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-neutral-800"
                        : "bg-red-500/10 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-300 dark:border-red-900/50 hover:bg-red-500/15"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isOpened ? "bg-gray-300 dark:bg-neutral-700 text-gray-600 dark:text-gray-300" : "bg-red-500 text-white animate-pulse"}`}>
                        {isOpened ? <Check className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs">{isOpened ? "◽ Snap ouvert" : "🟥 Nouveau Snap reçu (10s)"}</p>
                        <p className="text-[10px] opacity-80">{isOpened ? "Visionné • Appuyer pour revoir" : "Appuyer pour visionner le Snap"}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1.5 text-[9px] opacity-75">
                      <span>{m.time}</span>
                    </div>
                  </div>
                ) : (
                  /* Regular Snapchat Blue / Gray Chat Card */
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs relative transition-all ${
                      isSaved ? "ring-2 ring-blue-400 shadow-md" : "shadow-xs"
                    } ${
                      isMe
                        ? "bg-[#00ACFF] text-white rounded-br-xs"
                        : "bg-gray-100 dark:bg-[#1E2024] text-gray-900 dark:text-gray-100 rounded-bl-xs border-l-4 border-l-gray-300 dark:border-l-neutral-700"
                    }`}
                  >
                    {isSaved && (
                      <span className="text-[9px] font-bold text-blue-500 dark:text-blue-300 flex items-center gap-1 mb-1">
                        <Pin className="w-2.5 h-2.5" />
                        <span>Enregistré dans le Chat</span>
                      </span>
                    )}

                    <p className="leading-relaxed break-words whitespace-pre-wrap">{renderPressableText(m.text, { appId: 'snapchat' })}</p>
                    {renderMessageAttachment(m, isMe)}

                    <div className="flex items-center justify-between gap-2 mt-1.5 text-[9px] opacity-75">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveSnapChat(m.id);
                        }}
                        className="hover:underline flex items-center gap-0.5 cursor-pointer opacity-80 hover:opacity-100"
                        title={isSaved ? "Retirer de la sauvegarde" : "Enregistrer dans le Chat"}
                      >
                        <Pin className="w-2.5 h-2.5" />
                        <span>{isSaved ? "Sauvegardé" : "Enregistrer"}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <span>{m.time}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Bitmoji Stickers Drawer */}
        <AnimatePresence>
          {showSnapStickers && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gray-50 dark:bg-[#17181C] border-t border-gray-200 dark:border-neutral-800 p-2.5 shrink-0 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-1.5 px-1">
                <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Stickers Bitmoji & Streaks</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowSnapStickers(false)}
                  className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-1">
                {SNAP_STICKERS.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      onSendMessage(`${st.emoji} ${st.label}`);
                      setShowSnapStickers(false);
                    }}
                    className="p-2 rounded-xl bg-white dark:bg-neutral-800 hover:bg-yellow-50 dark:hover:bg-neutral-700 text-center transition-all shadow-xs border border-gray-100 dark:border-neutral-700 cursor-pointer group flex flex-col items-center gap-0.5"
                  >
                    <span className="text-xl group-hover:scale-125 transition-transform">{st.emoji}</span>
                    <span className="text-[9px] font-semibold text-gray-600 dark:text-gray-300 truncate w-full">{st.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Snapchat Composer */}
        {isReadOnly ? renderReadOnlyBanner() : (
          <div className="bg-white dark:bg-[#181818] border-t border-gray-200 dark:border-neutral-800 flex flex-col shrink-0">
            {renderQuickBar()}
            <div className="p-3">
              {isRecording ? (
                <div className="flex items-center justify-between text-xs bg-yellow-950/30 p-2 rounded-full text-yellow-300">
                  <span className="font-bold font-mono pl-2">Voice Note: {recordSeconds}s</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIsRecording(false)} className="text-gray-400">Cancel</button>
                    <button type="button" onClick={handleVoiceSubmit} className="px-3 py-1 bg-[#00ACFF] text-white rounded-full font-bold">Send</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSend} className="flex items-center gap-1.5">
                  {/* Camera Snap button */}
                  <button
                    type="button"
                    onClick={() => {
                      onSendMessage("🟥 Nouveau Snap photo envoyé (10s)");
                    }}
                    className="p-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black shadow-xs transition-colors cursor-pointer"
                    title="Prendre & envoyer un Snap (10s)"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  {/* Sticker Drawer */}
                  <button
                    type="button"
                    onClick={() => setShowSnapStickers(!showSnapStickers)}
                    className="p-2 text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors cursor-pointer"
                    title="Stickers Bitmoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  {/* Photo File Picker */}
                  <button
                    type="button"
                    onClick={() => imgInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    title="Galerie de photos"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  {/* Text Input */}
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Envoyer un Chat..."
                    className="flex-1 bg-gray-100 dark:bg-[#202020] border border-gray-300 dark:border-neutral-700 rounded-full px-4 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#FFFC00]"
                  />

                  {/* Mic for Voice Note */}
                  <button
                    type="button"
                    onClick={() => setIsRecording(true)}
                    className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    title="Note vocale"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Send Button (#00ACFF) */}
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2 bg-[#00ACFF] hover:bg-[#0096E0] text-white rounded-full disabled:opacity-30 cursor-pointer shadow-md transition-colors"
                    title="Envoyer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Snapchat Live Calling Screen (Audio / Video) */}
        <AnimatePresence>
          {activeSnapCall && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0F1015]/95 backdrop-blur-md z-50 flex flex-col items-center justify-between p-8 text-white select-none"
            >
              <div className="text-center space-y-1">
                <span className="text-[11px] font-black text-yellow-300 tracking-wider uppercase flex items-center justify-center gap-1">
                  <SnapchatIcon className="w-3.5 h-3.5" />
                  <span>{activeSnapCall === 'video' ? 'Appel vidéo Snapchat HD' : 'Appel vocal Snapchat'}</span>
                </span>
                <p className="text-xs text-gray-300 font-mono">
                  {snapCallSeconds < 2 ? "Connexion du flux Snap..." : `En ligne • ${Math.floor(snapCallSeconds / 60)}:${(snapCallSeconds % 60).toString().padStart(2, '0')}`}
                </p>
              </div>

              {/* Pulsing Bitmoji Avatar */}
              <div className="relative flex items-center justify-center my-6">
                <span className="absolute w-36 h-36 rounded-full bg-yellow-400/20 animate-ping" />
                <span className="absolute w-28 h-28 rounded-full bg-yellow-400/30" />
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-3 border-[#FFFC00] shadow-2xl bg-[#FFFC00] flex items-center justify-center">
                  {activeContact.profilePicUrl ? (
                    <img src={activeContact.profilePicUrl} alt={activeContact.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-black">{activeContact.name.slice(0, 2)}</span>
                  )}
                </div>
              </div>

              {/* Contact Name & Handle */}
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-white">{activeContact.name}</h3>
                <p className="text-xs font-mono text-yellow-300">{snapHandle}</p>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] text-gray-200 mt-2">
                  <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Streak 🔥 {streakCount} jours</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsSnapCallMuted(!isSnapCallMuted)}
                  className={`p-3 rounded-full transition-colors cursor-pointer ${isSnapCallMuted ? 'bg-red-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                  title={isSnapCallMuted ? "Activer le micro" : "Couper le micro"}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleEndSnapCall}
                  className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl cursor-pointer transition-transform active:scale-90"
                  title="Raccrocher"
                >
                  <Phone className="w-6 h-6 rotate-[135deg]" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSnapCallSpeaker(!isSnapCallSpeaker)}
                  className={`p-3 rounded-full transition-colors cursor-pointer ${isSnapCallSpeaker ? 'bg-yellow-400 text-black' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                  title={isSnapCallSpeaker ? "Haut-parleur actif" : "Haut-parleur désactivé"}
                >
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Visual Snap Player (10s Countdown Ring) */}
        <AnimatePresence>
          {activeOpenedSnap && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 z-50 flex flex-col justify-between p-5 text-white select-none cursor-pointer"
              onClick={() => {
                setOpenedSnapIds((s) => new Set(s).add(activeOpenedSnap.id));
                setActiveOpenedSnap(null);
              }}
            >
              {/* Header with Countdown Ring */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white">
                    <img src={activeContact.profilePicUrl || ''} alt={activeContact.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-extrabold text-xs text-white">{activeContact.name}</p>
                    <p className="text-[10px] text-gray-300 font-mono">Snap en direct</p>
                  </div>
                </div>

                {/* 10s Countdown Badge */}
                <div className="w-9 h-9 rounded-full bg-yellow-400 text-black flex items-center justify-center font-black text-sm shadow-lg border-2 border-white animate-pulse">
                  {activeOpenedSnap.secondsRemaining}s
                </div>
              </div>

              {/* Snap Visual Content */}
              <div className="my-auto text-center space-y-3">
                <div className="max-w-xs mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-black">
                  <img src={activeOpenedSnap.imageUrl} alt="Snap Content" className="w-full h-72 object-cover" />
                </div>
                <div className="inline-block px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-xs">
                  {activeOpenedSnap.text}
                </div>
              </div>

              {/* Footer instruction */}
              <div className="text-center text-[11px] text-gray-400">
                <span>Appuyez n&apos;importe où pour fermer le Snap</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Snapchat Contact Snapcode Profile Modal */}
        <AnimatePresence>
          {showSnapProfile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
              onClick={() => setShowSnapProfile(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-white dark:bg-[#1A1C23] rounded-3xl p-5 shadow-2xl border border-yellow-200 dark:border-neutral-800 space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-neutral-800">
                  <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5">
                    <SnapchatIcon className="w-4 h-4" />
                    <span>Profil Snapchat & Snapcode</span>
                  </span>
                  <button type="button" onClick={() => setShowSnapProfile(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Yellow Snapcode Badge */}
                <div className="bg-[#FFFC00] text-black rounded-2xl p-5 text-center shadow-inner relative space-y-2">
                  <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-3 border-black shadow-md bg-white">
                    {activeContact.profilePicUrl ? (
                      <img src={activeContact.profilePicUrl} alt={activeContact.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-black">{activeContact.name.slice(0, 2)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-black">{activeContact.name}</h3>
                    <p className="font-mono text-xs text-black/80 font-bold">{snapHandle}</p>
                  </div>
                  <div className="inline-flex items-center gap-1 bg-black/15 px-3 py-1 rounded-full text-[11px] font-black text-black">
                    <Flame className="w-3 h-3 text-amber-700 fill-amber-700" />
                    <span>Streak 🔥 {streakCount} jours</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800/60">
                    <span className="text-gray-500 dark:text-gray-400">Numéro de téléphone :</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">{snapPhone}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800/60">
                    <span className="text-gray-500 dark:text-gray-400">Score Snap :</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">148,290 pts</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800/60">
                    <span className="text-gray-500 dark:text-gray-400">Statut :</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      <span>Ami Snapchat Vérifié</span>
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSnapProfile(false);
                      setActiveSnapCall('audio');
                    }}
                    className="py-2 px-3 rounded-xl bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Appel Snap</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSnapProfile(false);
                      setActiveSnapCall('video');
                    }}
                    className="py-2 px-3 rounded-xl bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Vidéo HD</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Fallback (returns null so parent can render other layouts)
  return null;
};
