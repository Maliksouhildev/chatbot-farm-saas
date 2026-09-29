"use client";

import React from 'react';
import { ByokManager } from '@/components/settings/ByokManager';
import { PromptCustomizer } from '@/components/dashboard/PromptCustomizer';
import { KnowledgeBaseManager } from '@/components/dashboard/KnowledgeBaseManager';

export const SettingsView: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 md:px-8 space-y-6 animate-in fade-in duration-200">
      <div className="text-center space-y-1">
        <h2 className="text-2xl md:text-3xl font-black text-[#1B1B1B] dark:text-white">
          AI Bot & BYOK API Configuration
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-xs max-w-xl mx-auto">
          Plug in your free Groq or Google Gemini API key, customize your Algerian Darija dialect rules, and upload PDF product catalogs.
        </p>
      </div>

      {/* 1. BYOK API Keys */}
      <div className="p-6 rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-sm">
        <ByokManager />
      </div>

      {/* 2. Prompt & Dialect Customizer (Spans full width so Form and Preview have ample room) */}
      <div className="p-6 rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-sm">
        <PromptCustomizer />
      </div>

      {/* 3. Knowledge Base & Document Training (Spans full width) */}
      <div className="p-6 rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] bg-white dark:bg-[#1A1D23] shadow-sm">
        <KnowledgeBaseManager botId="dummy-bot-id" />
      </div>

    </div>
  );
};
