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
  Clock
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
  WhatsAppIcon
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
}) => {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

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
    if (!inputText.trim()) return;
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
    const isChannel = activeContact.handleOrPhone.startsWith("Channel") || activeContact.name.startsWith("#");
    return (
      <div className={`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-[#313338] text-white ${isMobileEmbedded ? "rounded-b-3xl border-t-0 shadow-none" : "rounded-3xl border shadow-sm"} border-[#232428] overflow-hidden relative font-sans`}>
        {renderSharedControls()}
        {/* Discord Header */}
        <div className="h-14 px-4 bg-[#2B2D31] border-b border-[#202225] flex items-center justify-between shrink-0 shadow-xs select-none">
          <div className="flex items-center gap-2.5 min-w-0">
            {onMobileBack && (
              <button type="button" onClick={onMobileBack} className="md:hidden p-1 -ml-1 text-gray-300 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-7 h-7 rounded-lg bg-[#5865F2] flex items-center justify-center shrink-0">
              <DiscordIcon className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[#80848E] font-extrabold text-sm">{isChannel ? "#" : "@"}</span>
                <span className="font-extrabold text-xs text-white truncate">{activeContact.name.replace(/^#/, "")}</span>
              </div>
              <span className="text-[10px] text-[#949BA4] block truncate">{activeContact.statusText}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#232428] text-[#DBDEE1] font-mono px-2 py-0.5 rounded-full border border-white/5">
              Discord Guild
            </span>
            {renderChannelMenu("discord")}
          </div>
        </div>

        {/* Discord Messages Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#313338]">
          <div className="pb-3 border-b border-[#3F4147] text-left">
            <div className="w-12 h-12 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-extrabold text-lg mb-2">
              {isChannel ? "#" : activeContact.avatarText || "D"}
            </div>
            <h3 className="font-extrabold text-base text-white">Welcome to {activeContact.name}!</h3>
            <p className="text-xs text-[#949BA4]">This is the start of the {activeContact.name} channel discussion.</p>
          </div>

          {messages.map((m) => {
            const isMe = m.sender === "operator";
            return (
              <div
                key={m.id}
                onMouseEnter={() => setHoveredMsgId(m.id)}
                onMouseLeave={() => setHoveredMsgId(null)}
                className="flex items-start gap-3 group px-2 py-1 -mx-2 rounded-lg hover:bg-[#2E3035] transition-colors relative"
              >
                {m.authorAvatar ? (
                  <img src={m.authorAvatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10" />
                ) : (
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${isMe ? "bg-[#5865F2]" : activeContact.avatarBg || "bg-[#23A55A]"}`}>
                    {isMe ? "OP" : activeContact.avatarText || "U"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white hover:underline cursor-pointer">
                      {isMe ? "Store Operator" : (m.authorName || activeContact.name)}
                    </span>
                    {isMe ? (
                      <span className="text-[9px] bg-[#5865F2] text-white px-1.5 py-0.2 rounded-xs font-black uppercase">BOT</span>
                    ) : (
                      <span className="text-[9px] bg-[#23A55A]/20 text-[#23A55A] px-1.5 py-0.2 rounded-xs font-bold uppercase">MEMBER</span>
                    )}
                    <span className="text-[10px] text-[#949BA4] font-mono">{m.time}</span>
                  </div>
                  <div className="text-xs text-[#DBDEE1] mt-0.5 leading-relaxed break-words">
                    {m.text}
                  </div>
                  {renderMessageAttachment(m, isMe)}
                </div>

                {/* Hover Action Bar */}
                {hoveredMsgId === m.id && (
                  <div className="absolute right-2 -top-3 bg-[#313338] border border-[#232428] shadow-lg rounded-md px-1.5 py-0.5 flex items-center gap-1 z-20">
                    <button type="button" onClick={() => onReact?.(m.id, "❤️")} className="hover:scale-120 text-xs cursor-pointer">❤️</button>
                    <button type="button" onClick={() => onReact?.(m.id, "🔥")} className="hover:scale-120 text-xs cursor-pointer">🔥</button>
                    <button type="button" onClick={() => onReact?.(m.id, "👍")} className="hover:scale-120 text-xs cursor-pointer">👍</button>
                    <button type="button" onClick={() => onDeleteMessage?.(m.id)} className="p-0.5 text-red-400 hover:text-red-300 cursor-pointer" title="Delete">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Discord Input Bar */}
        <div className="p-3 bg-[#313338] border-t border-[#232428]">
          {isRecording ? (
            <div className="bg-[#383A40] rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-red-400 font-mono font-bold">Recording: {recordSeconds}s</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setIsRecording(false)} className="text-[#949BA4] hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
                <button type="button" onClick={handleVoiceSubmit} className="px-3 py-1 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg font-bold">
                  Send Voice
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSend} className="bg-[#383A40] rounded-xl px-3 py-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => imgInputRef.current?.click()}
                className="w-6 h-6 rounded-full bg-[#4E5058] hover:bg-[#5865F2] text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Upload Photo or Video"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                className="text-[#B5BAC1] hover:text-white cursor-pointer"
                title="Attach Document"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${isChannel ? "#" : "@"}${activeContact.name.replace(/^#/, "")}`}
                className="flex-1 bg-transparent text-xs text-white placeholder-[#80848E] focus:outline-none font-sans"
              />
              <button
                type="button"
                onClick={() => setIsRecording(true)}
                className="text-[#B5BAC1] hover:text-white cursor-pointer"
                title="Record Voice Memo"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg cursor-pointer disabled:opacity-30 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
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
        <div className="h-14 px-4 bg-[#1A1D21] border-b border-[#2C3136] flex items-center justify-between shrink-0 shadow-xs select-none">
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
        <div className="h-14 px-4 bg-[#232428] border-b border-[#2B2D31] flex items-center justify-between shrink-0 shadow-xs select-none">
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
        <div className="h-14 px-4 bg-black border-b border-[#2F3336] flex items-center justify-between shrink-0 shadow-xs select-none">
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
        <div className="h-14 px-4 bg-[#141B26] border-b border-[#1E2633] flex items-center justify-between shrink-0 shadow-xs select-none">
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
        <div className="h-14 px-4 bg-[#14171E] border-b border-emerald-900/40 flex items-center justify-between shrink-0 select-none">
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
        <div className="h-14 px-4 bg-white dark:bg-[#1D2226] border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between shrink-0 shadow-xs select-none">
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
        <div className="h-14 px-4 bg-white dark:bg-[#1E1F22] border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between shrink-0 shadow-xs select-none">
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
      </div>
    );
  }

  // Fallback (returns null so parent can render other layouts)
  return null;
};
