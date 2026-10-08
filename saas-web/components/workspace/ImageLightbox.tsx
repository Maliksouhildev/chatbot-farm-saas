"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Maximize2 } from 'lucide-react';
import { useChatStore } from '@/lib/store/ChatStoreContext';

export const ImageLightbox: React.FC = () => {
  const { activeLightboxImage, activeLightboxType, closeLightbox } = useChatStore();
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    };
    if (activeLightboxImage) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxImage, closeLightbox]);

  // Reset zoom on media change
  useEffect(() => {
    setZoomLevel(1);
  }, [activeLightboxImage]);

  if (!activeLightboxImage) return null;

  const isVideo = activeLightboxType === 'video' || 
    /\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i.test(activeLightboxImage) || 
    activeLightboxImage.includes('video=1') ||
    activeLightboxImage.includes('video');

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.35, 3.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.35, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const handleDownload = () => {
    if (!activeLightboxImage) return;
    const a = document.createElement('a');
    a.href = `${activeLightboxImage}${activeLightboxImage.includes('?') ? '&' : '?'}download=1`;
    a.download = isVideo ? `chat-video-${Date.now()}.mp4` : `chat-media-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md p-4 select-none"
        onClick={closeLightbox}
      >
        {/* Floating Top Control Toolbar */}
        <div 
          className="absolute top-5 right-5 flex items-center gap-2 bg-neutral-900/85 border border-neutral-700/60 rounded-full px-4 py-2 shadow-2xl backdrop-blur-md z-20"
          onClick={e => e.stopPropagation()}
        >
          {!isVideo && (
            <>
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <div className="w-[1px] h-4 bg-neutral-700 mx-1" />
            </>
          )}

          <button
            onClick={handleDownload}
            className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
            title={isVideo ? "Download Video" : "Download Image"}
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={closeLightbox}
            className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-full transition-colors ml-1 cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Display: Video or Zoomable Image */}
        <div 
          className="relative max-w-6xl max-h-[85vh] w-full flex items-center justify-center overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {isVideo ? (
            <video
              ref={videoRef}
              src={activeLightboxImage}
              controls
              autoPlay
              playsInline
              className="max-h-[82vh] max-w-[88vw] rounded-2xl shadow-2xl bg-black border border-neutral-800"
            />
          ) : (
            <motion.img
              src={activeLightboxImage}
              alt="Expanded chat media"
              style={{ transform: `scale(${zoomLevel})` }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="max-h-[80vh] max-w-[85vw] object-contain rounded-xl shadow-2xl cursor-grab active:cursor-grabbing border border-neutral-800"
            />
          )}
        </div>

        {/* Footer Zoom / Info Indicator */}
        <div className="absolute bottom-5 text-xs text-neutral-400 font-mono bg-neutral-900/70 px-3.5 py-1.5 rounded-full border border-neutral-800 shadow-md">
          {isVideo ? "Fullscreen Video Player • Press Esc to exit" : `${Math.round(zoomLevel * 100)}% • Press Esc to exit`}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
