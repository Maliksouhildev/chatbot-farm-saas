"use client";

import React, { useState } from 'react';
import { BarChart2, Check, Lock, RotateCcw, HelpCircle } from 'lucide-react';

import type { TelegramPollData, TelegramPollOption } from '@/lib/mock_chats';
export type { TelegramPollData, TelegramPollOption };

interface TelegramPollWidgetProps {
  poll: TelegramPollData;
  messageId: string;
  isMe?: boolean;
  onVote: (messageId: string, options: string[]) => void;
}

export function TelegramPollWidget({ poll, messageId, isMe, onVote }: TelegramPollWidgetProps) {
  // Local state for multiple-choice selections before clicking "Vote"
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(() => {
    return new Set(poll.myChosenOptions || []);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleOption = (optHex: string) => {
    if (poll.closed) return;

    if (!poll.multipleChoice) {
      // Single choice -> immediate vote
      setIsSubmitting(true);
      onVote(messageId, [optHex]);
      setTimeout(() => setIsSubmitting(false), 500);
      return;
    }

    // Multiple choice -> toggle in selection set
    setSelectedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(optHex)) {
        next.delete(optHex);
      } else {
        next.add(optHex);
      }
      return next;
    });
  };

  const handleMultipleChoiceVote = () => {
    if (selectedOptions.size === 0 || poll.closed) return;
    setIsSubmitting(true);
    onVote(messageId, Array.from(selectedOptions));
    setTimeout(() => setIsSubmitting(false), 500);
  };

  const handleRetractVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (poll.closed) return;
    setIsSubmitting(true);
    setSelectedOptions(new Set());
    onVote(messageId, []);
    setTimeout(() => setIsSubmitting(false), 500);
  };

  const showResults = poll.hasVoted || poll.closed;

  return (
    <div className={`w-full max-w-[340px] sm:max-w-[380px] p-3.5 my-1.5 rounded-2xl select-none transition-all ${
      isMe
        ? 'bg-black/15 text-white border border-white/20'
        : 'bg-white/80 dark:bg-[#182533] text-gray-900 dark:text-gray-100 border border-black/10 dark:border-white/10 shadow-sm'
    }`}>
      {/* 1. Poll Header: Question & Meta */}
      <div className="mb-2.5">
        <h4 className="font-bold text-sm sm:text-base leading-snug break-words">
          {poll.question || 'Sondage'}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-[11px] opacity-75 font-medium flex-wrap">
          <span className="inline-flex items-center gap-1">
            <BarChart2 className="w-3.5 h-3.5 text-[#2AABEE] shrink-0" />
            <span>
              {poll.quiz
                ? (poll.isPublic ? 'Quiz public' : 'Quiz anonyme')
                : (poll.isPublic ? 'Sondage public' : 'Sondage anonyme')}
            </span>
          </span>
          {poll.multipleChoice && !showResults && (
            <span className="px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[10px] font-semibold">
              Choix multiples
            </span>
          )}
          {poll.closed && (
            <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
              <Lock className="w-3 h-3" />
              <span>Résultats finaux</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Options List */}
      <div className="space-y-1.5 my-2">
        {poll.options.map((opt, idx) => {
          const isSelectedInMulti = selectedOptions.has(opt.option);
          const isUserVote = opt.isChosen;

          if (!showResults) {
            // UNVOTED & OPEN: Interactive voting mode
            return (
              <button
                key={opt.option || idx}
                type="button"
                disabled={isSubmitting || poll.closed}
                onClick={() => toggleOption(opt.option)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer text-left group active:scale-[0.99] border ${
                  isSelectedInMulti
                    ? 'bg-[#2AABEE]/15 border-[#2AABEE]/40 dark:bg-[#2AABEE]/25'
                    : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {/* Radio or Checkbox */}
                <div className={`w-5 h-5 shrink-0 flex items-center justify-center transition-all ${
                  poll.multipleChoice
                    ? 'rounded-md border-2'
                    : 'rounded-full border-2'
                } ${
                  isSelectedInMulti
                    ? 'border-[#2AABEE] bg-[#2AABEE] text-white shadow-xs'
                    : 'border-gray-400 dark:border-neutral-500 group-hover:border-[#2AABEE]'
                }`}>
                  {isSelectedInMulti && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                {/* Option Text */}
                <span className="text-xs sm:text-sm font-medium flex-1 break-words">
                  {opt.text}
                </span>
              </button>
            );
          }

          // VOTED OR CLOSED: Results mode with animated progress bars & percentages
          let barBg = isMe ? 'bg-white/90' : 'bg-[#2AABEE]';
          if (poll.quiz) {
            if (opt.isCorrect) barBg = 'bg-emerald-500';
            else if (isUserVote && !opt.isCorrect) barBg = 'bg-rose-500';
          }

          return (
            <div
              key={opt.option || idx}
              className={`p-2 rounded-xl transition-all relative overflow-hidden ${
                isUserVote
                  ? 'bg-blue-500/10 dark:bg-blue-500/15 border border-[#2AABEE]/30'
                  : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {/* Option label & Percentage */}
              <div className="flex items-center justify-between gap-2 text-xs sm:text-sm relative z-10">
                <span className={`font-medium flex items-center gap-1.5 flex-1 break-words ${
                  isUserVote ? 'font-bold text-[#2AABEE] dark:text-[#54B9EE]' : ''
                }`}>
                  <span>{opt.text}</span>
                  {isUserVote && (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#2AABEE] text-white text-[10px] shrink-0" title="Votre vote">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                  {poll.quiz && opt.isCorrect && (
                    <span className="text-[10px] font-bold text-emerald-500">Correct</span>
                  )}
                </span>
                <span className="font-bold text-xs shrink-0 font-mono opacity-90">
                  {opt.percentage}%
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-2 relative z-10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barBg}`}
                  style={{ width: `${Math.max(opt.percentage, 0)}%` }}
                />
              </div>

              {/* Voter Count Subtitle */}
              <div className="flex items-center justify-between text-[10px] opacity-70 mt-1 font-mono relative z-10">
                <span>{opt.voters} vote{opt.voters !== 1 ? 's' : ''}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Multi-choice Action Button */}
      {poll.multipleChoice && !showResults && !poll.closed && (
        <div className="mt-2.5 pt-2 border-t border-black/10 dark:border-white/10 flex justify-end">
          <button
            type="button"
            disabled={selectedOptions.size === 0 || isSubmitting}
            onClick={handleMultipleChoiceVote}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              selectedOptions.size > 0
                ? 'bg-[#2AABEE] hover:bg-[#229ED9] text-white active:scale-95'
                : 'bg-gray-300 dark:bg-neutral-700 text-gray-500 dark:text-neutral-400 cursor-not-allowed opacity-60'
            }`}
          >
            {isSubmitting ? 'Envoi...' : `Voter (${selectedOptions.size})`}
          </button>
        </div>
      )}

      {/* 4. Poll Footer: Total votes & Retract Vote option */}
      <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] opacity-80 font-medium">
        <span>
          {poll.totalVoters > 0
            ? `${poll.totalVoters} participant${poll.totalVoters !== 1 ? 's' : ''}`
            : 'Aucun vote pour le moment'}
        </span>

        {poll.hasVoted && !poll.closed && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleRetractVote}
            className="text-[#2AABEE] dark:text-[#54B9EE] hover:underline font-semibold flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
            title="Annuler et modifier mon vote"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Annuler mon vote</span>
          </button>
        )}
      </div>

      {/* Quiz Solution Note if provided */}
      {poll.quiz && poll.solution && showResults && (
        <div className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-start gap-1.5 text-amber-700 dark:text-amber-300">
          <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p className="flex-1 break-words leading-tight">{poll.solution}</p>
        </div>
      )}
    </div>
  );
}
