"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Upload, Check, Sparkles, User, Link2 } from 'lucide-react';

interface AvatarEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onSave: (updated: { name: string; avatar: string }) => void;
}

const PRESET_AVATARS = [
  '👨‍💻', '👩‍💻', '🥷', '🦊', '🦁', '🤖', '🧑‍🚀', '👑',
  '⚡', '🌟', '🧙', '🦅', '💎', '🚀', '🎯', '🔥'
];

export const AvatarEditModal: React.FC<AvatarEditModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSave,
}) => {
  const [name, setName] = useState(currentUser?.name || 'Store Owner');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '👨‍💻');
  const [customUrl, setCustomUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      setAvatar(customUrl.trim());
      setShowUrlInput(false);
      setCustomUrl('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim() || currentUser?.name || 'User',
      avatar,
    });
    onClose();
  };

  const isImageUrl = avatar.startsWith('http') || avatar.startsWith('data:image');

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
              <div className="w-8 h-8 rounded-xl bg-[#1B6648]/10 text-[#1B6648] dark:text-emerald-400 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#1B1B1B] dark:text-white">Edit Profile & Avatar</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Personalize your public identity</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Live Avatar Preview with change controls */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 overflow-hidden shadow-lg bg-gradient-to-tr from-[#1B6648] to-emerald-500 flex items-center justify-center text-3xl">
                  {isImageUrl ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="select-none">{avatar}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#1B6648] hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95"
                  title="Upload Image"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <p className="mt-2 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                Click upload or pick an avatar below
              </p>
            </div>

            {/* Display Name Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-semibold bg-gray-50 dark:bg-neutral-800/80 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-[#1B6648] outline-hidden text-[#1B1B1B] dark:text-white transition-all"
                />
              </div>
            </div>

            {/* Avatar Preset Grid */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Preset Avatars & Characters
                </label>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-[11px] font-bold text-[#1B6648] dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Link2 className="w-3 h-3" />
                  Image URL
                </button>
              </div>

              {showUrlInput && (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.png"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-gray-50 dark:bg-neutral-800 border border-[#DFDFD4] dark:border-neutral-700 rounded-xl focus:outline-hidden dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3 py-1.5 bg-[#1B6648] text-white text-xs font-bold rounded-xl"
                  >
                    Apply
                  </button>
                </div>
              )}

              <div className="grid grid-cols-8 gap-1.5">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`h-9 rounded-xl flex items-center justify-center text-lg transition-transform active:scale-90 border ${
                      avatar === av
                        ? 'border-[#1B6648] bg-emerald-50 dark:bg-emerald-950/40 scale-105 shadow-xs'
                        : 'border-[#DFDFD4] dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
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
                className="px-5 py-2 text-xs font-bold bg-[#1B6648] hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
