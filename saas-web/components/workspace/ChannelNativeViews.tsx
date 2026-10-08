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
  Gift
} from "lucide-react";
import { ContactProfile, ChatMessage } from "@/lib/mock_chats";
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
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);

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
                      {m.text}
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
                            {m.embed.fields.map((f, fIdx) => (
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
          <div className="p-3 bg-[#313338] border-t border-[#232428]">
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
                  <div className="text-xs text-[#D1D2D3] mt-0.5 leading-relaxed">{m.text}</div>
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
          <div className="p-3 bg-[#1A1D21] border-t border-[#2C3136]">
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
                  <p className="leading-relaxed break-words">{m.text}</p>
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
          <div className="p-3 bg-[#232428] border-t border-[#2B2D31]">
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
                  <p className="leading-relaxed break-words">{m.text}</p>
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
          <div className="p-3 bg-black border-t border-[#2F3336]">
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
                  <div className="text-xs text-gray-200 mt-0.5 leading-relaxed">{m.text}</div>
                  {renderMessageAttachment(m, isMe)}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Matrix Composer */}
        {isReadOnly ? renderReadOnlyBanner() : (
          <div className="p-3 bg-[#141B26] border-t border-[#1E2633]">
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
                <span className="text-gray-100">{m.text}</span>
                {renderMessageAttachment(m, isMe)}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* IRC Prompt Input */}
        {isReadOnly ? renderReadOnlyBanner() : (
          <div className="p-3 bg-[#14171E] border-t border-emerald-900/40">
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
                  <p className="leading-relaxed break-words">{m.text}</p>
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
          <div className="p-3 bg-white dark:bg-[#1D2226] border-t border-gray-200 dark:border-neutral-800">
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
                  <p className="leading-relaxed break-words">{m.text}</p>
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
          <div className="p-3 bg-white dark:bg-[#1E1F22] border-t border-gray-200 dark:border-neutral-800">
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
        )}
      </div>
    );
  }

  // =========================================================================
  // 8. VIBER REPLICA (Rakuten Viber Purple)
  // =========================================================================
  if (appId === "viber") {
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#F4F2F9] dark:bg-[#14121E] text-gray-900 dark:text-white ${isMobileEmbedded ? "rounded-b-3xl border-t-0 shadow-none" : "rounded-3xl border shadow-sm"} border-[#E2DCF7] dark:border-[#2D2845] overflow-hidden relative font-sans`}>
        {renderSharedControls()}
        {/* Viber Header */}
        <div {...dragHandleProps} className={`h-14 px-4 bg-[#7360F2] text-white flex items-center justify-between shrink-0 shadow-xs select-none cursor-grab active:cursor-grabbing touch-none ${dragHandleProps?.className || ""}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {onMobileBack && (
              <button type="button" onClick={onMobileBack} className="md:hidden p-1 -ml-1 text-white/80 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
              <ViberIcon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-xs text-white truncate block">{activeContact.name}</span>
              <span className="text-[10px] text-white/80 flex items-center gap-1 font-medium">
                <Lock className="w-2.5 h-2.5" />
                <span>Viber Encrypted</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-white/20 text-white font-bold px-2.5 py-0.5 rounded-full border border-white/30 backdrop-blur-xs">
              Viber Business
            </span>
            {renderChannelMenu("viber")}
          </div>
        </div>

        {/* Viber Messages Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2.5 custom-scrollbar bg-[#F4F2F9] dark:bg-[#14121E]">
          <div className="mx-auto max-w-[270px] p-2 bg-[#7360F2]/10 dark:bg-[#7360F2]/20 border border-[#7360F2]/20 rounded-xl text-center text-[10px] text-[#7360F2] dark:text-[#A79AF7] space-y-0.5">
            <Lock className="w-3 h-3 text-[#7360F2] dark:text-[#A79AF7] mx-auto mb-1" />
            <p className="font-bold">Messages are end-to-end encrypted with Rakuten Viber.</p>
          </div>

          {messages.map((m) => {
            const isMe = m.sender === "operator";
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs relative ${
                    isMe
                      ? "bg-[#7360F2] text-white rounded-br-xs shadow-md"
                      : "bg-white dark:bg-[#231F33] text-gray-900 dark:text-gray-100 rounded-bl-xs shadow-xs border border-[#E2DCF7] dark:border-[#2D2845]"
                  }`}
                >
                  <p className="leading-relaxed break-words">{m.text}</p>
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

        {/* Viber Composer */}
        {isReadOnly ? renderReadOnlyBanner() : (
          <div className="p-3 bg-white dark:bg-[#1C182B] border-t border-[#E2DCF7] dark:border-[#2D2845]">
            {isRecording ? (
              <div className="flex items-center justify-between text-xs bg-purple-950/30 p-2 rounded-full text-purple-300">
                <span className="font-bold font-mono pl-2">Viber Voice Note: {recordSeconds}s</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsRecording(false)} className="text-gray-400">Cancel</button>
                  <button type="button" onClick={handleVoiceSubmit} className="px-3 py-1 bg-[#7360F2] text-white rounded-full font-bold">Send</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <button type="button" onClick={() => imgInputRef.current?.click()} className="p-2 text-gray-400 hover:text-[#7360F2]" title="Photo">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => docInputRef.current?.click()} className="p-2 text-gray-400 hover:text-[#7360F2]" title="File">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Viber message..."
                  className="flex-1 bg-[#F4F2F9] dark:bg-[#231F33] border border-[#E2DCF7] dark:border-[#2D2845] rounded-full px-4 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#7360F2]"
                />
                <button type="button" onClick={() => setIsRecording(true)} className="p-2 text-gray-400 hover:text-[#7360F2]" title="Voice">
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 bg-[#7360F2] hover:bg-[#624EE8] text-white rounded-full disabled:opacity-30 cursor-pointer shadow-md transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 9. SNAPCHAT REPLICA (Snapchat Clean View)
  // =========================================================================
  if (appId === "snapchat") {
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-white dark:bg-[#121212] text-gray-900 dark:text-white ${isMobileEmbedded ? "rounded-b-3xl border-t-0 shadow-none" : "rounded-3xl border shadow-sm"} border-gray-200 dark:border-neutral-800 overflow-hidden relative font-sans`}>
        {renderSharedControls()}
        {/* Snapchat Header */}
        <div {...dragHandleProps} className={`h-14 px-4 bg-[#FFFC00] text-black flex items-center justify-between shrink-0 shadow-xs select-none cursor-grab active:cursor-grabbing touch-none ${dragHandleProps?.className || ""}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {onMobileBack && (
              <button type="button" onClick={onMobileBack} className="md:hidden p-1 -ml-1 text-black/80 hover:text-black">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center shrink-0 border border-black/20">
              <SnapchatIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-xs text-black truncate block">{activeContact.name}</span>
              <span className="text-[10px] text-black/70 flex items-center gap-1 font-semibold">
                <span>Snapchat Friend</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-black/10 text-black font-extrabold px-2.5 py-0.5 rounded-full border border-black/15">
              Snapchat
            </span>
            {renderChannelMenu("snapchat")}
          </div>
        </div>

        {/* Snapchat Messages Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2.5 custom-scrollbar bg-[#FAFAFA] dark:bg-[#121212]">
          <div className="mx-auto max-w-[270px] p-2 bg-[#FFFC00]/20 border border-[#FFFC00]/40 rounded-xl text-center text-[10px] text-gray-800 dark:text-yellow-300 space-y-0.5">
            <p className="font-bold">Snapchat Chat & Snaps</p>
          </div>

          {messages.map((m) => {
            const isMe = m.sender === "operator";
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs relative ${
                    isMe
                      ? "bg-[#00ACFF] text-white rounded-br-xs shadow-md"
                      : "bg-gray-100 dark:bg-[#202020] text-gray-900 dark:text-gray-100 rounded-bl-xs shadow-xs"
                  }`}
                >
                  <p className="leading-relaxed break-words">{m.text}</p>
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

        {/* Snapchat Composer */}
        {isReadOnly ? renderReadOnlyBanner() : (
          <div className="p-3 bg-white dark:bg-[#181818] border-t border-gray-200 dark:border-neutral-800">
            {isRecording ? (
              <div className="flex items-center justify-between text-xs bg-yellow-950/30 p-2 rounded-full text-yellow-300">
                <span className="font-bold font-mono pl-2">Voice Note: {recordSeconds}s</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsRecording(false)} className="text-gray-400">Cancel</button>
                  <button type="button" onClick={handleVoiceSubmit} className="px-3 py-1 bg-[#00ACFF] text-white rounded-full font-bold">Send</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <button type="button" onClick={() => imgInputRef.current?.click()} className="p-2 text-gray-400 hover:text-black dark:hover:text-white" title="Photo">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => docInputRef.current?.click()} className="p-2 text-gray-400 hover:text-black dark:hover:text-white" title="File">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Send a chat..."
                  className="flex-1 bg-gray-100 dark:bg-[#202020] border border-gray-300 dark:border-neutral-700 rounded-full px-4 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#FFFC00]"
                />
                <button type="button" onClick={() => setIsRecording(true)} className="p-2 text-gray-400 hover:text-black dark:hover:text-white" title="Voice">
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 bg-[#00ACFF] hover:bg-[#0096E0] text-white rounded-full disabled:opacity-30 cursor-pointer shadow-md transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    );
  }

  // Fallback (returns null so parent can render other layouts)
  return null;
};
