"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  isRefreshing?: boolean;
  accentColor?: string;
  pullThreshold?: number; // default 65px
  maxPullDistance?: number; // default 95px
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  isRefreshing = false,
  accentColor = '#10B981',
  pullThreshold = 65,
  maxPullDistance = 95,
  className = '',
  children,
  disabled = false,
}) => {
  const [isMobileTouch, setIsMobileTouch] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [localRefreshing, setLocalRefreshing] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hasMovedPastThresholdRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const detectMobile = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      const isMobileWidth = window.innerWidth <= 768;
      // Strictly mobile touch devices only
      setIsMobileTouch(hasTouch && (isCoarse || isMobileWidth));
    };
    detectMobile();
    window.addEventListener('resize', detectMobile);
    return () => window.removeEventListener('resize', detectMobile);
  }, []);

  const effectiveRefreshing = isRefreshing || localRefreshing;

  // Helper to find inner scrollable container if any
  const getScrollTop = useCallback((target?: EventTarget | null) => {
    if (target && target instanceof HTMLElement && containerRef.current) {
      let el: HTMLElement | null = target;
      while (el && el !== containerRef.current) {
        if (el.scrollTop > 0) return el.scrollTop;
        el = el.parentElement;
      }
    }
    if (!containerRef.current) return 0;
    if (containerRef.current.scrollTop > 0) return containerRef.current.scrollTop;
    const scrollables = containerRef.current.querySelectorAll(
      '.overflow-y-auto, .overflow-y-scroll, .contacts-list-pane'
    );
    for (let i = 0; i < scrollables.length; i++) {
      const el = scrollables[i] as HTMLElement;
      if (el.scrollTop > 0) return el.scrollTop;
    }
    return 0;
  }, []);

  const triggerRefresh = useCallback(async () => {
    if (effectiveRefreshing || disabled || !isMobileTouch) return;
    setLocalRefreshing(true);
    setPullDistance(52); // Keep indicator visible while refreshing

    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(18);
      }
    } catch {}

    try {
      const p = onRefresh();
      if (p && typeof p.then === 'function') {
        await p;
      } else {
        await new Promise((r) => setTimeout(r, 650));
      }
    } finally {
      setTimeout(() => {
        setLocalRefreshing(false);
        setPullDistance(0);
      }, 300);
    }
  }, [effectiveRefreshing, disabled, isMobileTouch, onRefresh]);

  // Touch event listeners for mobile devices only
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || effectiveRefreshing || !isMobileTouch) return;
    if (getScrollTop(e.target) <= 0) {
      startYRef.current = e.touches[0].clientY;
      currentYRef.current = e.touches[0].clientY;
      isDraggingRef.current = true;
      hasMovedPastThresholdRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || disabled || effectiveRefreshing || !isMobileTouch) return;
    currentYRef.current = e.touches[0].clientY;
    const diff = currentYRef.current - startYRef.current;

    if (diff > 0 && getScrollTop() <= 0) {
      const distance = Math.min(maxPullDistance, Math.pow(diff, 0.85) * 0.65);
      setPullDistance(distance);
      setIsPulling(true);

      if (distance >= pullThreshold && !hasMovedPastThresholdRef.current) {
        hasMovedPastThresholdRef.current = true;
        try {
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(12);
          }
        } catch {}
      } else if (distance < pullThreshold) {
        hasMovedPastThresholdRef.current = false;
      }
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsPulling(false);

    if (pullDistance >= pullThreshold) {
      triggerRefresh();
    } else {
      setPullDistance(0);
    }
  };

  // On PC / non-mobile devices, render simple children with zero pull/scroll interceptors
  if (!isMobileTouch) {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        {children}
      </div>
    );
  }

  const progressRatio = Math.min(1, pullDistance / pullThreshold);
  const rotationDeg = effectiveRefreshing ? undefined : Math.min(360, progressRatio * 360);
  const showIndicator = pullDistance > 8 || effectiveRefreshing;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative select-none ${className}`}
    >
      {/* Floating Pull-to-Refresh Pill Indicator */}
      <div
        style={{
          transform: `translate(-50%, ${effectiveRefreshing ? 12 : Math.max(-44, pullDistance - 44)}px) scale(${showIndicator ? 1 : 0.8})`,
          opacity: showIndicator ? Math.min(1, Math.max(0, (pullDistance - 8) / 25)) : 0,
          transition: isPulling ? 'none' : 'transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease',
        }}
        className="absolute top-0 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1E222A] shadow-md border border-black/10 dark:border-white/10"
      >
        <RefreshCw
          className={`w-3.5 h-3.5 shrink-0 ${effectiveRefreshing ? 'animate-spin' : ''}`}
          style={{
            color: accentColor,
            transform: rotationDeg !== undefined ? `rotate(${rotationDeg}deg)` : undefined,
            transition: isPulling ? 'none' : 'transform 0.15s ease',
          }}
        />
        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap">
          {effectiveRefreshing
            ? 'Actualisation...'
            : pullDistance >= pullThreshold
            ? 'Relacher pour actualiser'
            : 'Tirer pour actualiser'}
        </span>
      </div>

      {/* Children content that smoothly shifts down when pulled */}
      <div
        style={{
          transform: `translateY(${effectiveRefreshing ? 42 : Math.max(0, pullDistance * 0.65)}px)`,
          transition: isPulling ? 'none' : 'transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="w-full h-full flex flex-col flex-1 min-h-0"
      >
        {children}
      </div>
    </div>
  );
};
