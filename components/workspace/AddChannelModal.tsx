"use client";

import React, { useState } from 'react';
import { X, MessageSquare, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WhatsAppIcon,
  InstagramIcon,
  TelegramIcon,
  MessengerIcon,
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

interface AddChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChannel: (appId: string) => void;
  pinnedApps?: string[];
  connectedApps?: Set<string>;
}

export const AddChannelModal: React.FC<AddChannelModalProps> = ({ isOpen, onClose, onAddChannel, pinnedApps = [], connectedApps = new Set() }) => {
  const CHANNEL_CATALOG = [
    { id: 'whatsapp', title: 'WhatsApp', icon: <WhatsAppIcon className="w-12 h-12" />, color: '#1B6648' },
    { id: 'whatsapp_2', title: 'WhatsApp 2', icon: <WhatsAppIcon className="w-12 h-12" />, color: '#15803d' },
    { id: 'instagram', title: 'Instagram', icon: <InstagramIcon className="w-12 h-12" />, color: '#E1306C' },
    { id: 'messenger', title: 'Messenger', icon: <MessengerIcon className="w-12 h-12" />, color: '#00B2FF' },
    { id: 'telegram', title: 'Telegram', icon: <TelegramIcon className="w-12 h-12" />, color: '#0088CC' },
    { id: 'gmail', title: 'Gmail', icon: <GmailIcon className="w-12 h-12" />, color: '#EA4335' },
    { id: 'google_chat', title: 'Google Chat', icon: <GoogleChatIcon className="w-12 h-12" />, color: '#00AC47' },
    { id: 'google_messages', title: 'Messages', icon: <GoogleMessagesIcon className="w-12 h-12" />, color: '#1A73E8' },
    { id: 'google_voice', title: 'Google Voice', icon: <GoogleVoiceIcon className="w-12 h-12" />, color: '#0F9D58' },
    { id: 'signal', title: 'Signal', icon: <SignalIcon className="w-12 h-12" />, color: '#3A76F0' },
    { id: 'discord', title: 'Discord', icon: <DiscordIcon className="w-12 h-12" />, color: '#5865F2' },
    { id: 'slack', title: 'Slack', icon: <SlackIcon className="w-12 h-12" />, color: '#4A154B' },
    { id: 'x_twitter', title: 'X (Twitter)', icon: <XIcon className="w-12 h-12" />, color: '#14171A' },
    { id: 'linkedin', title: 'LinkedIn', icon: <LinkedInIcon className="w-12 h-12" />, color: '#0A66C2' },
    { id: 'irc', title: 'IRC', icon: <IrcIcon className="w-12 h-12" />, color: '#1E222A' },
    { id: 'matrix', title: 'Matrix', icon: <MatrixIcon className="w-12 h-12" />, color: '#0DBD8B' }
  ];

  // Filter out apps that are already pinned
  const availableChannels = CHANNEL_CATALOG.filter(cat => !pinnedApps.includes(cat.id));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: '-100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-2 top-2 bottom-2 z-50 w-full max-w-[360px] md:max-w-[420px] bg-white dark:bg-[#1A1D23] border border-[#DFDFD4] dark:border-[#2E333D] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col"
          >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DFDFD4] dark:border-[#2E333D] pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1B6648]/10 text-[#1B6648] dark:text-emerald-400 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#1B6648] dark:text-emerald-400">Add Channels</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Select an app to pin it to your workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 flex items-center justify-center text-gray-500 dark:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 6x6 Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {availableChannels.map((cat) => {
              const isConnected = connectedApps.has(cat.id);
              return (
                <div
                  key={cat.id}
                  onClick={() => onAddChannel(cat.id)}
                  className="group cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="relative w-20 h-20 rounded-2xl bg-gray-50 dark:bg-[#22262E] border border-gray-200 dark:border-neutral-700 flex items-center justify-center shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md group-hover:border-[#1B6648] dark:group-hover:border-emerald-500">
                    <div style={{ color: cat.color }}>{cat.icon}</div>
                    
                    {isConnected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#22262E] rounded-full shadow-sm" title="Connected" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 text-center leading-tight px-1">
                    {cat.title}
                  </span>
                </div>
              );
            })}
          </div>
          {availableChannels.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">All channels are already pinned to your workspace!</p>
            </div>
          )}
        </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
