'use client';

import React, { useState } from 'react';
import { Users } from 'lucide-react';
import {
  getWhatsAppDefaultAvatar,
  resolveBrandAvatar,
} from '@/lib/whatsapp_avatars';

interface WhatsAppAvatarProps {
  profilePicUrl?: string | null;
  name?: string;
  identifier?: string;
  isGroup?: boolean;
  className?: string;
  textSizeClass?: string;
  iconSizeClass?: string;
  onClick?: () => void;
}

export function WhatsAppAvatar({
  profilePicUrl,
  name = '',
  identifier = '',
  isGroup = false,
  className = 'w-9 h-9',
  textSizeClass = 'text-xs font-bold',
  iconSizeClass,
  onClick,
}: WhatsAppAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // 1. Resolve brand logo (Outlier, Facebook, WhatsApp, etc.) if not explicitly provided
  const effectivePic = (!imgError && (profilePicUrl || resolveBrandAvatar(name, identifier))) || null;

  // 2. Compute deterministic palette and initials
  const avatarStyle = getWhatsAppDefaultAvatar(identifier, name, isGroup);

  if (effectivePic) {
    return (
      <div
        onClick={onClick}
        className={`${className} rounded-full shrink-0 relative overflow-hidden bg-neutral-800 select-none ${
          onClick ? 'cursor-pointer' : ''
        }`}
      >
        <img
          src={effectivePic}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full block pointer-events-none"
        />
      </div>
    );
  }

  // 3. Fallback for WhatsApp Groups without profile picture (Matches phone screenshot)
  if (avatarStyle.isGroup) {
    return (
      <div
        onClick={onClick}
        style={{ backgroundColor: avatarStyle.bg }}
        className={`${className} rounded-full shrink-0 flex items-center justify-center select-none shadow-xs ${
          onClick ? 'cursor-pointer' : ''
        }`}
      >
        <Users className={`${iconSizeClass || 'w-[52%] h-[52%]'} text-[#8696A0]`} />
      </div>
    );
  }

  // 4. Fallback for Contacts without profile picture (Exact deterministic WhatsApp colors + initials)
  return (
    <div
      onClick={onClick}
      style={{ backgroundColor: avatarStyle.bg, color: avatarStyle.text }}
      className={`${className} rounded-full shrink-0 flex items-center justify-center ${textSizeClass} select-none shadow-xs font-sans tracking-tight ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <span>{avatarStyle.initials}</span>
    </div>
  );
}
