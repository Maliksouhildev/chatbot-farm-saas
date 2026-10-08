"use client";

import React, { useState } from 'react';
import { Bot, User, Send, Sparkles, RefreshCw, X } from 'lucide-react';

interface VirtualSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VirtualSimulatorModal: React.FC<VirtualSimulatorModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'customer' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Salam khoya! Marhba bik f store ta3na! Kifech nqder n3awnek lyom? 3andna les parfums w les montres top qualité!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'customer', text: userText }]);
    setIsThinking(true);

    try {
      const res = await fetch('/api/inbox/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();
      if (data && data.reply) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Saha khoya! Kayen livraison 58 wilayas via Yalidine w paiement à la livraison.' }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-neutral-950 border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px] text-white animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center font-bold text-sm">
              🤖
            </div>
            <div>
              <h4 className="font-bold text-sm">Virtual Customer Sandbox</h4>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Darija AI Simulator (No phone needed)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/40">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                  m.sender === 'customer'
                    ? 'bg-neutral-800 text-white rounded-tr-sm'
                    : 'bg-gradient-to-br from-pink-950/80 to-purple-950/80 border border-pink-500/30 text-white rounded-tl-sm'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-pink-950/40 border border-pink-500/20 rounded-2xl rounded-tl-sm px-4 py-2 text-xs text-pink-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Algerian Darija reply...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2 border-t border-white/5 bg-neutral-900/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setInput('Salam, 3andkom parfum Sauvage?')}
            className="text-xs px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 whitespace-nowrap"
          >
            Prix Sauvage?
          </button>
          <button
            onClick={() => setInput('Chhal livraison l Oran via Yalidine?')}
            className="text-xs px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 whitespace-nowrap"
          >
            Livraison Oran?
          </button>
          <button
            onClick={() => setInput('Nhab ncommander wahda!')}
            className="text-xs px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 whitespace-nowrap"
          >
            Commander
          </button>
        </div>

        {/* Input bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-neutral-900 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type as a customer in Darija, Arabizi, French..."
            className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="p-2.5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-white disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
