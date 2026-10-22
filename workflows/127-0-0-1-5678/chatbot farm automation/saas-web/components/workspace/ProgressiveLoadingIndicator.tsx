"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Sparkles, ShieldCheck, Clock } from "lucide-react";

export interface ProgressiveLoadingIndicatorProps {
  isLoading: boolean;
  channelName?: string;
  initialMessage?: string;
  customStages?: string[];
  themeColor?: string;
  className?: string;
}

const DEFAULT_STAGES = [
  "Connexion et authentification en cours...",
  "Vérification des autorisations et clés d'accès...",
  "Synchronisation de la passerelle, veuillez patienter...",
  "Le service prend un peu de temps à répondre, finalisation en cours..."
];

export const ProgressiveLoadingIndicator: React.FC<ProgressiveLoadingIndicatorProps> = ({
  isLoading,
  channelName,
  initialMessage,
  customStages,
  themeColor = "#1B6648",
  className = ""
}) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const stages = customStages || (
    channelName ? [
      initialMessage || `Connexion à ${channelName} en cours...`,
      `Vérification des autorisations ${channelName}...`,
      `Synchronisation du flux ${channelName}, veuillez patienter...`,
      `Finalisation de la liaison ${channelName}, merci de patienter...`
    ] : DEFAULT_STAGES
  );

  useEffect(() => {
    if (!isLoading) {
      setStageIndex(0);
      setElapsedSeconds(0);
      return;
    }

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setElapsedSeconds(elapsed);

      if (elapsed >= 8) {
        setStageIndex(3);
      } else if (elapsed >= 4) {
        setStageIndex(2);
      } else if (elapsed >= 1.5) {
        setStageIndex(1);
      } else {
        setStageIndex(0);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        className={`p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-700/60 shadow-xl backdrop-blur-md flex flex-col gap-2.5 text-white overflow-hidden relative ${className}`}
      >
        {/* Animated accent gradient top line */}
        <div 
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse"
          style={{ background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)` }}
        />

        <div className="flex items-start gap-3">
          {/* Animated Spinner with Glow */}
          <div className="relative shrink-0 mt-0.5">
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center animate-spin text-white"
              style={{ backgroundColor: `${themeColor}33`, color: themeColor }}
            >
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div 
              className="absolute -inset-1 rounded-full blur-xs opacity-50 animate-ping pointer-events-none"
              style={{ backgroundColor: themeColor }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Chargement en cours</span>
              </span>
              <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                <span>{elapsedSeconds}s</span>
              </span>
            </div>

            {/* Dynamic Stage Message */}
            <motion.p
              key={stageIndex}
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xs font-semibold text-gray-200 mt-0.5 leading-snug"
            >
              {stages[stageIndex] || stages[0]}
            </motion.p>
          </div>
        </div>

        {/* Shimmering Progress Bar */}
        <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden relative">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: themeColor }}
            initial={{ width: "15%" }}
            animate={{
              width: stageIndex === 0 ? "35%" : stageIndex === 1 ? "65%" : stageIndex === 2 ? "85%" : "95%"
            }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </div>

        {/* Helper subtext when wait is longer */}
        {elapsedSeconds >= 4 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-[10px] text-gray-400 flex items-center gap-1.5 pt-0.5"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Ne fermez pas la fenêtre pendant la validation du compte.</span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
