"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Check, X, Pin, Sparkles } from 'lucide-react';
import { AppChannel } from './AppSwitcherColumn';
import { getCustomAppTheme, setCustomAppTheme, APP_GRADIENT_THEMES } from '@/lib/mock_chats';
import { SoundManager } from '@/lib/SoundManager';

export interface AppCustomizerPopoverProps {
  isOpen: boolean;
  channel: AppChannel | null;
  anchorRect: DOMRect | null;
  isConnected: boolean;
  isPinned: boolean;
  onTogglePin?: (appId: string) => void;
  onOpenConnectModal?: (appId: string) => void;
  onClose: () => void;
}

const COLOR_SWATCHES = [
  { id: 'wa-green', color: '#1B6648', label: 'WhatsApp Green' },
  { id: 'emerald', color: '#0DBD8B', label: 'Emerald' },
  { id: 'forest', color: '#15803d', label: 'Forest Green' },
  { id: 'tg-blue', color: '#0088CC', label: 'Telegram Blue' },
  { id: 'discord-indigo', color: '#5865F2', label: 'Discord Purple' },
  { id: 'viber-purple', color: '#7360F2', label: 'Viber Purple' },
  { id: 'magenta', color: '#D946EF', label: 'Magenta' },
  { id: 'danger-red', color: '#EF4444', label: 'Crimson' },
  { id: 'amber', color: '#F59E0B', label: 'Amber' },
  { id: 'gradient-sunset', color: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)', isGradient: true, label: 'Sunset Gradient' }
];

export const AppCustomizerPopover: React.FC<AppCustomizerPopoverProps> = ({
  isOpen,
  channel,
  anchorRect,
  isConnected,
  isPinned,
  onTogglePin,
  onOpenConnectModal,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  const [activeColor, setActiveColor] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!channel) return;
    const currentTheme = getCustomAppTheme(channel.id);
    setActiveColor(currentTheme?.solidColor || APP_GRADIENT_THEMES[channel.id]?.solidColor || '#1B6648');

    try {
      const overrides = JSON.parse(localStorage.getItem('cf_sound_overrides') || '{}');
      setSoundEnabled(overrides[channel.id] !== false);
    } catch {
      setSoundEnabled(true);
    }
  }, [channel, isOpen]);

  // Handle outside clicks and ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !channel) return null;

  // Calculate coordinates: smart placement to the right of channel item
  const popoverWidth = 300;
  const popoverHeight = 460;
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800;

  let top = anchorRect ? anchorRect.top : 100;
  let left = anchorRect ? anchorRect.right + 16 : 280;

  // Prevent overflowing right edge with generous margin
  if (left + popoverWidth > viewportW - 24) {
    if (anchorRect && anchorRect.left - popoverWidth - 16 > 24) {
      left = anchorRect.left - popoverWidth - 16;
    } else {
      left = Math.max(24, viewportW - popoverWidth - 24);
    }
  }

  // Prevent overflowing bottom edge
  if (top + popoverHeight > viewportH - 24) {
    top = Math.max(24, viewportH - popoverHeight - 24);
  }

  const handleSelectColor = (colorVal: string, isGradient?: boolean) => {
    setActiveColor(colorVal);
    setCustomAppTheme(channel.id, colorVal);
    window.dispatchEvent(new Event('app_theme_changed'));
  };

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    try {
      const overrides = JSON.parse(localStorage.getItem('cf_sound_overrides') || '{}');
      overrides[channel.id] = nextState;
      localStorage.setItem('cf_sound_overrides', JSON.stringify(overrides));
    } catch {}

    if (nextState) {
      try {
        SoundManager.play(channel.id);
      } catch {}
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] pointer-events-none select-none"
      aria-modal="true"
      role="dialog"
    >
      {/* Invisible backdrop to capture outside clicks if needed */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-[1px] pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      {/* Floating Popover Container */}
      <motion.div
        ref={popoverRef}
        initial={{ opacity: 0, scale: 0.94, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 6 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: `${top}px`,
          left: `${left}px`,
          width: `${popoverWidth}px`,
        }}
        className="pointer-events-auto bg-[#181B20] text-white border border-[#2E333D] rounded-3xl p-5 sm:p-5.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col gap-4 z-[99999]"
      >
        {/* Header: Icon, Title, Status, Close */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0">
              {channel.iconComponent}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-[14px] text-white truncate leading-snug">
                {channel.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-[11px] font-semibold text-gray-300">
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pinned Top Toggle Button */}
        <button
          onClick={() => {
            onTogglePin && onTogglePin(channel.id);
          }}
          className={`w-full py-2 px-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all border ${
            isPinned 
              ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-950/50 shadow-sm'
              : 'border-neutral-700 bg-neutral-800/80 text-gray-300 hover:bg-neutral-800 hover:text-white'
          }`}
        >
          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-emerald-400' : ''}`} />
          <span>{isPinned ? '📌 Pinned Top' : '📌 Pin to Top'}</span>
        </button>

        {/* THEME COLOR Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-wider text-gray-400">
            <span>🎨</span>
            <span>THEME COLOR</span>
          </div>

          <div className="grid grid-cols-5 gap-2.5 justify-items-center">
            {COLOR_SWATCHES.map((swatch) => {
              const isSelected = activeColor.toLowerCase() === swatch.color.toLowerCase();
              return (
                <button
                  key={swatch.id}
                  onClick={() => handleSelectColor(swatch.color, swatch.isGradient)}
                  style={{
                    background: swatch.isGradient ? swatch.color : undefined,
                    backgroundColor: !swatch.isGradient ? swatch.color : undefined,
                  }}
                  className={`w-9 h-9 rounded-full relative flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-md ${
                    isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#181B20]' : 'opacity-90 hover:opacity-100'
                  }`}
                  title={swatch.label}
                >
                  {isSelected && (
                    <Check className="w-4 h-4 text-white drop-shadow stroke-[3]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification Sound Section */}
        <div
          onClick={handleToggleSound}
          className="p-3 rounded-2xl bg-neutral-800/70 hover:bg-neutral-800 border border-neutral-700/60 flex items-center gap-3 cursor-pointer transition-all active:scale-[0.99]"
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${soundEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-700/60 text-gray-400'}`}>
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-extrabold text-white">Notification Sound</span>
            <span className="text-[10px] font-medium text-gray-400">
              {soundEnabled ? 'Audio chime enabled' : 'Muted for this channel'}
            </span>
          </div>
        </div>

        {/* Connect / Manage Button */}
        <button
          onClick={() => {
            onClose();
            if (onOpenConnectModal) {
              onOpenConnectModal(channel.id);
            }
          }}
          className={`w-full py-2.5 px-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
            isConnected
              ? 'bg-neutral-800 hover:bg-neutral-700 text-gray-200 border border-neutral-700'
              : 'bg-[#1B6648] hover:bg-[#15803d] text-white shadow-emerald-950/40'
          }`}
        >
          {isConnected ? 'Manage Connection' : 'Connect Channel'}
        </button>
      </motion.div>
    </div>,
    document.body
  );
};
