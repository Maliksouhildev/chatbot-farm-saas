"use client";

import React from 'react';

export interface ScrollingGroupTitleProps {
  name: string;
  isGroup?: boolean;
  isUntitledGroup?: boolean;
  participantNames?: string[];
  maxWidthClass?: string;
  className?: string;
  titleClassName?: string;
  badge?: React.ReactNode;
}

export const ScrollingGroupTitle: React.FC<ScrollingGroupTitleProps> = ({
  name,
  isGroup = false,
  isUntitledGroup = false,
  participantNames = [],
  maxWidthClass,
  className = '',
  titleClassName = '',
  badge,
}) => {
  const cleanName = (name || '').replace(/🤖\s*/g, '').trim();

  // If not a group, render standard truncated name
  if (!isGroup) {
    return (
      <span className={`truncate inline-flex items-center gap-1 min-w-0 ${className}`}>
        <span className={`truncate ${titleClassName}`}>{cleanName}</span>
        {badge}
      </span>
    );
  }

  // Group handling: determine if this group title is a list of participants or long title
  const namesText = (participantNames && participantNames.length > 0)
    ? participantNames.join(', ')
    : cleanName;

  const shouldMarquee = isUntitledGroup || namesText.includes(',') || namesText.length > 26;

  // Standard short group name (e.g. "Myfamily")
  if (!shouldMarquee) {
    return (
      <span className={`truncate inline-flex items-center gap-1.5 min-w-0 ${className}`}>
        <span className={`truncate ${titleClassName}`}>{cleanName}</span>
        {badge}
      </span>
    );
  }

  // Untitled group or multi-name list: bounded animated scrolling marquee
  const containerWidth = maxWidthClass || 'max-w-[170px] xs:max-w-[230px] sm:max-w-[320px] md:max-w-[420px]';

  return (
    <div className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
      <div
        className={`relative inline-flex items-center overflow-hidden select-none ${containerWidth}`}
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 12px, black calc(100% - 12px), transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12px, black calc(100% - 12px), transparent 100%)',
        }}
        title={`Membres du groupe : ${namesText}`}
      >
        <div className="animate-marquee-scroll inline-flex items-center whitespace-nowrap will-change-transform py-0.5">
          <span className={`pr-4 shrink-0 ${titleClassName}`}>{namesText}</span>
          <span className={`pr-4 shrink-0 opacity-40 ${titleClassName}`} aria-hidden="true">• {namesText}</span>
        </div>
      </div>
      {badge}
    </div>
  );
};
