"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Briefcase } from 'lucide-react';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (workspace: { name: string; icon: string; color: string }) => void;
}

const PRESET_ICONS = ['🏢', '🚀', '🛒', '💬', '🤖', '⚡', '📦', '🎯', '💼', '🛍️', '🌐', '🔥'];

const PRESET_COLORS = [
  { name: 'Emerald', hex: '#1B6648' },
  { name: 'Sunset', hex: '#EB6708' },
  { name: 'Ocean', hex: '#2563EB' },
  { name: 'Purple', hex: '#7C3AED' },
  { name: 'Rose', hex: '#E11D48' },
  { name: 'Teal', hex: '#0D9488' },
  { name: 'Amber', hex: '#D97706' },
  { name: 'Slate', hex: '#475569' },
];

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏢');
  const [selectedColor, setSelectedColor] = useState('#1B6648');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
    });
    setName('');
    setSelectedIcon('🏢');
    setSelectedColor('#1B6648');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-white dark:bg-[#1A1D23] rounded-3xl shadow-2xl border border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#DFDFD4] dark:border-[#2E333D] bg-gray-50/70 dark:bg-[#13151A] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-xs"
                style={{ backgroundColor: `${selectedColor}20`, color: selectedColor }}
              >
                {selectedIcon}
              </div>
              <div>
                <h3 className="font-black text-sm text-[#1B1B1B] dark:text-white">Create New Workspace</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Name and customize your team workspace</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Workspace Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Workspace Name
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. DZ E-Commerce Hub, Support Team..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium bg-gray-50 dark:bg-neutral-800/80 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-[#1B6648] outline-hidden text-[#1B1B1B] dark:text-white transition-all"
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Workspace Icon
              </label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`h-9 rounded-xl flex items-center justify-center text-base transition-transform active:scale-90 border ${
                      selectedIcon === icon
                        ? 'border-[#1B6648] bg-emerald-50 dark:bg-emerald-950/40 scale-105 shadow-xs'
                        : 'border-[#DFDFD4] dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Accent Picker */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Accent Color
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 shadow-xs relative"
                    title={c.name}
                  >
                    {selectedColor === c.hex && (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Pill */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Navbar Preview
              </label>
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-black/40 border border-dashed border-gray-200 dark:border-neutral-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
                    style={{ backgroundColor: `${selectedColor}25` }}
                  >
                    {selectedIcon}
                  </span>
                  <span className="text-xs font-bold text-[#1B1B1B] dark:text-white">
                    {name.trim() || 'My Workspace'}
                  </span>
                </div>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: selectedColor }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#DFDFD4] dark:border-[#2E333D]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-5 py-2 text-xs font-bold bg-[#1B6648] hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Workspace</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
