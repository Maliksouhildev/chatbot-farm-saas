"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Mic } from 'lucide-react';

interface VoiceNotePlayerProps {
  duration?: string; // e.g. "0:24"
  audioUrl?: string;
  isSender?: boolean;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  duration = "0:15",
  audioUrl,
  isSender = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const [currentTime, setCurrentTime] = useState<string>("0:00");
  const [displayDuration, setDisplayDuration] = useState<string>(duration || "0:15");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync displayDuration when prop changes
  useEffect(() => {
    if (duration) {
      setDisplayDuration(duration);
    }
  }, [duration]);

  // Parse total duration in seconds (fallback to 15s)
  const totalSeconds = (() => {
    if (!displayDuration) return 15;
    const parts = displayDuration.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10) || 15;
    }
    return 15;
  })();

  // Listen for other voice notes playing and pause this one
  useEffect(() => {
    const handleOtherPlay = (e: any) => {
      if (e.detail?.url && e.detail.url !== audioUrl && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    window.addEventListener('cf_audio_playing', handleOtherPlay);
    return () => window.removeEventListener('cf_audio_playing', handleOtherPlay);
  }, [audioUrl]);

  // Keep playbackSpeed in sync with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Synthetic interval only if no real audioUrl exists
  useEffect(() => {
    if (audioUrl) return;
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          const step = (100 / totalSeconds) * (1 / (10 / playbackSpeed));
          const next = prev + step;
          if (next >= 100) {
            setIsPlaying(false);
            setCurrentTime(displayDuration);
            return 0;
          }
          const currentSec = Math.floor((next / 100) * totalSeconds);
          const mins = Math.floor(currentSec / 60);
          const secs = currentSec % 60;
          setCurrentTime(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
          return next;
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, totalSeconds, playbackSpeed, displayDuration, audioUrl]);

  const playAudioFeedback = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(560, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {}
  };

  const togglePlay = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        if (progress >= 100 || audioRef.current.ended) {
          audioRef.current.currentTime = 0;
          setProgress(0);
        }
        window.dispatchEvent(new CustomEvent('cf_audio_playing', { detail: { url: audioUrl } }));
        audioRef.current.play().catch(err => {
          console.warn('[VoiceNotePlayer] Real audio playback error:', err);
          setIsPlaying(false);
        });
      }
    } else {
      if (progress >= 100) setProgress(0);
      const willPlay = !isPlaying;
      setIsPlaying(willPlay);
      if (willPlay) {
        playAudioFeedback();
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
      const total = Math.floor(audioRef.current.duration);
      const m = Math.floor(total / 60);
      const s = total % 60;
      setDisplayDuration(`${m}:${s < 10 ? '0' : ''}${s}`);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setProgress(Math.min(100, Math.max(0, (cur / dur) * 100)));
      const m = Math.floor(cur / 60);
      const s = Math.floor(cur % 60);
      setCurrentTime(`${m}:${s < 10 ? '0' : ''}${s}`);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime("0:00");
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newPercent = clickPos * 100;
    setProgress(newPercent);
    if (audioUrl && audioRef.current && isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
      audioRef.current.currentTime = clickPos * audioRef.current.duration;
    } else {
      const currentSec = Math.floor(clickPos * totalSeconds);
      const mins = Math.floor(currentSec / 60);
      const secs = currentSec % 60;
      setCurrentTime(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    }
  };

  const handleSpeedToggle = () => {
    const speeds: (1 | 1.5 | 2)[] = [1, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  // Fixed visual bar heights for realistic voice note waveform
  const waveformBars = [
    25, 45, 70, 90, 60, 40, 75, 100, 85, 55, 35, 65, 80, 95, 70, 40, 60, 85, 50, 30, 70, 90, 60, 40, 25
  ];

  return (
    <div className={`flex items-center gap-3 py-1 px-1 min-w-[220px] max-w-[280px] select-none ${isSender ? 'text-white' : 'text-neutral-200'}`}>
      {/* Hidden Native Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          playsInline
          className="hidden"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={(e) => {
            console.warn('[VoiceNotePlayer] Audio error event:', e);
            setIsPlaying(false);
          }}
        />
      )}

      {/* Play / Pause Circular Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm cursor-pointer ${
          isSender 
            ? 'bg-white/20 hover:bg-white/30 text-white' 
            : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      {/* Waveform Scrubber & Timer */}
      <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
        <div 
          className="flex items-center gap-[3px] h-6 cursor-pointer"
          onClick={handleScrub}
        >
          {waveformBars.map((heightPercent, idx) => {
            const barProgress = (idx / waveformBars.length) * 100;
            const isPlayed = barProgress <= progress;
            return (
              <span
                key={idx}
                style={{ height: `${heightPercent}%` }}
                className={`w-[3px] rounded-full transition-colors duration-150 ${
                  isPlayed 
                    ? (isSender ? 'bg-white' : 'bg-emerald-400') 
                    : (isSender ? 'bg-white/30' : 'bg-neutral-600')
                }`}
              />
            );
          })}
        </div>

        {/* Time and Duration Tracker */}
        <div className="flex items-center justify-between text-[11px] font-mono opacity-80">
          <span>{isPlaying ? currentTime : displayDuration}</span>
          <span className="flex items-center gap-1 text-[10px] opacity-75">
            <Mic className="w-2.5 h-2.5" /> Voice
          </span>
        </div>
      </div>

      {/* Speed Multiplier Button (1x, 1.5x, 2x) */}
      <button
        type="button"
        onClick={handleSpeedToggle}
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 border transition-colors cursor-pointer ${
          isSender
            ? 'border-white/30 hover:bg-white/10 text-white'
            : 'border-neutral-700 hover:bg-neutral-800 text-neutral-300'
        }`}
        title="Playback Speed"
      >
        {playbackSpeed}x
      </button>
    </div>
  );
};
