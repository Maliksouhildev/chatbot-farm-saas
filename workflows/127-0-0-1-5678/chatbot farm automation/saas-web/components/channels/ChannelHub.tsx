"use client";

import React, { useState } from 'react';
import { MessageSquare, Send, Instagram, Facebook, Globe, CheckCircle2, QrCode, Copy, Key, ExternalLink, ShieldCheck } from 'lucide-react';
import { QRCodeCard } from '@/components/dashboard/QRCodeCard';

export const ChannelHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'telegram' | 'instagram' | 'widget'>('whatsapp');
  const [telegramToken, setTelegramToken] = useState('');
  const [isTelegramSaved, setIsTelegramSaved] = useState(false);
  const [copiedWidget, setCopiedWidget] = useState(false);

  const embedScript = `<script src="https://cdn.chatbotfarm.dz/v1/widget.js" data-bot-id="71d0f49e-7ae7-4153-aab6-cadafeaf1332" async></script>`;

  const handleCopyWidget = () => {
    navigator.clipboard.writeText(embedScript);
    setCopiedWidget(true);
    setTimeout(() => setCopiedWidget(false), 2000);
  };

  const handleSaveTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramToken.trim()) return;
    setIsTelegramSaved(true);
    setTimeout(() => setIsTelegramSaved(false), 2500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 text-white">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-orange-400 to-amber-300">
          Connect Your Channels
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
          All your customer conversations from WhatsApp, Telegram, Instagram, and your e-commerce storefront flow into one single live inbox.
        </p>
      </div>

      {/* Channel Switcher Tabs */}
      <div className="flex justify-center gap-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-4 h-4 text-emerald-400" /> },
          { id: 'telegram', label: 'Telegram Bot', icon: <Send className="w-4 h-4 text-blue-400" /> },
          { id: 'instagram', label: 'Instagram & FB', icon: <Instagram className="w-4 h-4 text-pink-400" /> },
          { id: 'widget', label: 'Store Web Widget', icon: <Globe className="w-4 h-4 text-cyan-400" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2.5 transition-all ${
              activeTab === tab.id
                ? 'bg-white text-black shadow-xl shadow-pink-500/10 scale-105'
                : 'glass-panel text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: WHATSAPP */}
      {activeTab === 'whatsapp' && (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 100% Free & Zero Setup Cost
            </span>
            <h3 className="text-2xl font-bold text-white">Connect Your WhatsApp in Seconds</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Open WhatsApp on your phone, go to <strong>Linked Devices &gt; Link a Device</strong>, and scan the QR code.
              Evolution API connects instantly as a multi-device client—no Meta fees or phone switching required.
            </p>
            <div className="space-y-2 text-xs text-gray-400 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span> Authentic Algerian Darija AI responses
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span> Groq Whisper-large voice note transcription
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span> Seamless human takeover with collision guard
              </div>
            </div>
          </div>
          <div className="md:col-span-6 flex justify-center">
            <QRCodeCard botId="71d0f49e-7ae7-4153-aab6-cadafeaf1332" instanceName="default_instance" />
          </div>
        </div>
      )}

      {/* TAB 2: TELEGRAM */}
      {activeTab === 'telegram' && (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Telegram Bot Integration</h3>
              <p className="text-xs text-gray-400">Connect in 1 minute using @BotFather</p>
            </div>
          </div>

          <form onSubmit={handleSaveTelegram} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1.5 block">
                Telegram Bot Token:
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  placeholder="1234567890:ABCdefGhIJKlmNoPQRstuVWXyz..."
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Open <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">@BotFather</a> on Telegram, create a new bot with <code className="text-gray-300">/newbot</code>, and paste the token above.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isTelegramSaved ? <CheckCircle2 className="w-4 h-4" /> : null}
              {isTelegramSaved ? 'Telegram Bot Connected!' : 'Connect Telegram Bot'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: INSTAGRAM & FACEBOOK */}
      {activeTab === 'instagram' && (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 max-w-2xl mx-auto space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-orange-400 text-white flex items-center justify-center mx-auto shadow-lg">
            <Instagram className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-white">Instagram Direct & Facebook Messenger</h3>
          <p className="text-sm text-gray-400 leading-relaxed max-w-lg mx-auto">
            Reply to your Instagram DMs and Facebook Page messages directly from the unified inbox.
            Both human operators and the AI bot can interact with your followers seamlessly.
          </p>

          <button className="px-6 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 font-bold text-white rounded-xl text-sm transition-transform hover:scale-105 shadow-xl">
            Connect Meta Business Page
          </button>
        </div>
      )}

      {/* TAB 4: STORE WEB CHAT WIDGET */}
      {activeTab === 'widget' && (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Embeddable E-Commerce Live Chat Widget</h3>
              <p className="text-xs text-gray-400">Add a floating live chat widget to your Shopify, WooCommerce, or custom storefront</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 block">Copy & Paste inside your website &lt;head&gt; or &lt;body&gt;:</label>
            <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-cyan-300 flex items-center justify-between gap-4">
              <span className="truncate">{embedScript}</span>
              <button
                onClick={handleCopyWidget}
                className="shrink-0 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedWidget ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-gray-400">
            <div className="font-semibold text-white">Why use the Web Widget?</div>
            <p>
              Visitors on your online store can ask questions about your stock, sizing, and shipping directly.
              Incoming chats instantly trigger in your Unified Inbox, and your Darija AI bot can close the sale immediately!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
