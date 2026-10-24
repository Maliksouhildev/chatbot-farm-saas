"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Key, CreditCard, Sparkles, X, Check, ShieldCheck, Zap } from 'lucide-react';

interface AiActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelName?: string;
  onActivateTrial: () => void;
  onGoToSettings: () => void;
  onGoToBilling: () => void;
}

export const AiActivationModal: React.FC<AiActivationModalProps> = ({
  isOpen,
  onClose,
  channelName = 'this channel',
  onActivateTrial,
  onGoToSettings,
  onGoToBilling,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Card with Spring Pop-in */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 35 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          className="relative bg-white dark:bg-[#1A1D23] rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] max-w-md w-full p-6 shadow-2xl space-y-5 text-[#1B1B1B] dark:text-white z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Icon & Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1B6648] to-emerald-400 text-white flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Activate 24/7 AI Sales Agent</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Autonomous Darija replies for {channelName}
              </p>
            </div>
          </div>

          {/* Description Banner */}
          <div className="p-3.5 rounded-2xl bg-[#ECECE2]/60 dark:bg-black/30 border border-[#DFDFD4] dark:border-neutral-800 text-xs text-gray-700 dark:text-gray-300 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 text-[#1B6648] dark:text-emerald-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>AI Sales Features</span>
            </div>
            <ul className="text-[11px] space-y-1 pl-1 list-disc list-inside">
              <li>Speaks fluent Algerian Darija (Arabizi & Arabic) + French</li>
              <li>Calculates Yalidine delivery fees to all 58 Wilayas</li>
              <li>Auto-mutes instantly when human operator types</li>
            </ul>
          </div>

          {/* Action Options */}
          <div className="space-y-2.5">
            {/* Option 1: Instant Sandbox Trial */}
            <button
              onClick={onActivateTrial}
              className="w-full p-3 rounded-2xl bg-[#1B6648] hover:bg-[#155239] text-white font-bold text-xs flex items-center justify-between shadow-md transition-all active:scale-98 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 text-left">
                <Zap className="w-4 h-4 text-emerald-300" />
                <div>
                  <p className="font-bold">Start Instant Sandbox Trial</p>
                  <p className="text-[10px] text-white/80">Activate demo AI replies for this session</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] uppercase tracking-wider font-extrabold">
                Free Trial
              </span>
            </button>

            {/* Option 2: Connect Free BYOK API Key (Groq / Gemini) */}
            <button
              onClick={onGoToSettings}
              className="w-full p-3 rounded-2xl bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 border border-[#DFDFD4] dark:border-neutral-700 text-[#1B1B1B] dark:text-white font-bold text-xs flex items-center justify-between transition-all active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-left">
                <Key className="w-4 h-4 text-[#EB6708]" />
                <div>
                  <p className="font-bold">Use Free BYOK (Groq / Gemini / DeepSeek)</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Bring your own zero-cost API key in Settings</p>
                </div>
              </div>
              <span className="text-gray-400 text-xs">→</span>
            </button>

            {/* Option 3: Upgrade to Full SaaS Plan */}
            <button
              onClick={onGoToBilling}
              className="w-full p-3 rounded-2xl bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 border border-[#DFDFD4] dark:border-neutral-700 text-[#1B1B1B] dark:text-white font-bold text-xs flex items-center justify-between transition-all active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-left">
                <CreditCard className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="font-bold">Subscribe via Chargily Pay (CIB / Dahabia)</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Unlimited AI messages + Yalidine automated tracking</p>
                </div>
              </div>
              <span className="text-gray-400 text-xs">→</span>
            </button>
          </div>

          <div className="pt-1 flex items-center justify-center gap-2 text-[10px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1B6648] dark:text-emerald-400" />
            <span>End-to-end encrypted • Server hosted in Algiers</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
