"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Volume2, CheckCheck, Smile, Paperclip, AlertCircle, RefreshCw } from 'lucide-react';

interface ChatFeedProps {
  conversation: any;
  messages: any[];
  onSendMessage: (text: string) => Promise<void>;
  onTriggerAiReply?: () => void;
  isAiGenerating?: boolean;
}

export const ChatFeed: React.FC<ChatFeedProps> = ({
  conversation,
  messages,
  onSendMessage,
  onTriggerAiReply,
  isAiGenerating = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiGenerating]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);
    try {
      await onSendMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleCanned = (text: string) => {
    setInputText(text);
  };

  if (!conversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500 bg-neutral-950">
        <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center mb-4 text-gray-600">
          💬
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Select a Conversation</h3>
        <p className="text-sm text-gray-400 max-w-sm">
          Pick any customer chat on the left to start live chatting, monitor AI Darija responses, or take over manually.
        </p>
      </div>
    );
  }

  const isAiActive = conversation.ai_enabled !== false;

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-white relative">
      {/* 1. CHAT HEADER */}
      <div className="px-6 py-4 border-b border-white/10 bg-neutral-900/60 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center font-bold text-white">
              {(conversation.contact_name || conversation.contact_phone || 'C')[0].toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-neutral-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">{conversation.contact_name || 'Customer'}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {conversation.channel_type || 'whatsapp'}
              </span>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-2">
              <span>{conversation.contact_phone}</span>
              <span>•</span>
              <span className="text-gray-500">Status: {conversation.status || 'open'}</span>
            </p>
          </div>
        </div>

        {/* Header Right Status */}
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border ${
              isAiActive
                ? 'bg-pink-500/10 text-pink-400 border-pink-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            {isAiActive ? 'AI Auto-Pilot ON' : 'Human Operator Mode'}
          </span>
        </div>
      </div>

      {/* 2. MESSAGES STREAM */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
            <p className="text-sm">No messages yet in this conversation.</p>
            <p className="text-xs text-gray-600 mt-1">Send a message below or trigger a test message.</p>
          </div>
        ) : (
          messages.map((msg: any) => {
            const isCustomer = msg.sender === 'customer';
            const isAi = msg.sender === 'ai';
            const isHuman = msg.sender === 'human_operator';

            return (
              <div
                key={msg.id || Math.random()}
                className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[75%] md:max-w-[65%] rounded-2xl px-4 py-3 space-y-1.5 shadow-md ${
                    isCustomer
                      ? 'bg-neutral-900 border border-white/10 text-gray-100 rounded-tl-sm'
                      : isAi
                      ? 'bg-gradient-to-br from-pink-950/70 to-purple-950/70 border border-pink-500/30 text-white rounded-tr-sm'
                      : 'bg-emerald-950/60 border border-emerald-500/30 text-white rounded-tr-sm'
                  }`}
                >
                  {/* Sender Header Badge */}
                  <div className="flex items-center justify-between gap-3 text-[11px]">
                    <span className="font-semibold flex items-center gap-1">
                      {isCustomer && <User className="w-3 h-3 text-gray-400" />}
                      {isAi && (
                        <span className="text-pink-400 flex items-center gap-1 font-bold">
                          <Bot className="w-3 h-3" /> AI Darija Assistant
                        </span>
                      )}
                      {isHuman && (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          👤 Human Operator (Malik)
                        </span>
                      )}
                    </span>
                    <span className="text-gray-500 text-[10px]">
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                    </span>
                  </div>

                  {/* Audio Voice Note Player (if audio message) */}
                  {msg.message_type === 'audio' && (
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1 my-1">
                      <div className="flex items-center gap-2 text-xs text-pink-300">
                        <Volume2 className="w-4 h-4 text-pink-400 animate-pulse" />
                        <span className="font-medium">Voice Note Audio</span>
                      </div>
                      {msg.audio_transcription && (
                        <p className="text-xs text-gray-300 italic bg-white/5 p-2 rounded-lg mt-1">
                          "{msg.audio_transcription}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Message Content */}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>

                  {/* Delivery Status Indicator */}
                  {!isCustomer && (
                    <div className="flex justify-end text-[10px] text-gray-400 items-center gap-1 pt-0.5">
                      <span>Delivered</span>
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* AI Generating Indicator */}
        {isAiGenerating && (
          <div className="flex justify-start">
            <div className="bg-pink-950/40 border border-pink-500/20 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 text-xs text-pink-300">
              <Sparkles className="w-4 h-4 animate-spin text-pink-400" />
              <span>AI is crafting reply in authentic Darija...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. CANNED RESPONSES SHORTCUTS */}
      <div className="px-6 py-2 border-t border-white/5 bg-neutral-900/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] text-gray-500 uppercase tracking-wider shrink-0 font-medium">Quick:</span>
        <button
          onClick={() => handleCanned('Salam khoya! Marhba bik, kifech nqder n3awnek lyom?')}
          className="text-xs px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 transition-colors shrink-0"
        >
          👋 Salam Marhba
        </button>
        <button
          onClick={() => handleCanned('Kayen livraison l 58 wilayas via Yalidine! Alger 400 DA w les autres wilayas 700 DA.')}
          className="text-xs px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 transition-colors shrink-0"
        >
          📦 Yalidine Livraison
        </button>
        <button
          onClick={() => handleCanned('Bach tconfirmi la commande t3ich ba3telna: Nom, Prénom, Numéro, Wilaya w Commune.')}
          className="text-xs px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 transition-colors shrink-0"
        >
          📝 Demande d'adresse
        </button>
      </div>

      {/* 4. REPLY INPUT BOX */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-neutral-900/90 flex items-center gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isAiActive ? 'Type a reply (sending cancels any pending AI response)...' : 'Type operator reply to customer...'}
          className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
        >
          {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
