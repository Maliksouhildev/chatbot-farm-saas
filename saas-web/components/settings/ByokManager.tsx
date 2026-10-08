"use client";

import React, { useState, useEffect } from 'react';
import { Key, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface ByokManagerProps {
  isPro?: boolean;
}

export const ByokManager: React.FC<ByokManagerProps> = ({ isPro: isProProp }) => {
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('llama-3.3-70b');
  const [isSaved, setIsSaved] = useState(false);
  const [isPro, setIsPro] = useState(isProProp || false);

  useEffect(() => {
    if (isProProp !== undefined) {
      setIsPro(isProProp);
      return;
    }
    try {
      const session = localStorage.getItem('cf_user_session');
      if (session) {
        const user = JSON.parse(session);
        if (user?.plan && user.plan.toLowerCase().includes('pro')) {
          setIsPro(true);
        }
      }
    } catch {}
  }, [isProProp]);

  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('cf_byok_key');
      const savedModel = localStorage.getItem('cf_byok_model');
      if (savedKey) setApiKey(savedKey);
      if (savedModel) setModelName(savedModel);
    } catch {}
  }, []);

  if (isPro) {
    return null;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('cf_byok_key', apiKey.trim());
      localStorage.setItem('cf_byok_model', modelName.trim());
    } catch {}
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#EB6708]" />
          AI Engine Connection
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-xs">
          Connect your custom AI provider or use our managed infrastructure.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            API Key
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#1E222A] rounded-xl focus:ring-2 focus:ring-[#EB6708] outline-none transition-shadow"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Model Name
          </label>
          <div className="relative">
            <Sparkles className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="e.g. gpt-4o, llama-3.3-70b"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#1E222A] rounded-xl focus:ring-2 focus:ring-[#EB6708] outline-none transition-shadow"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#1B1B1B] dark:bg-white text-white dark:text-black hover:opacity-90 font-bold text-xs rounded-xl shadow-md flex justify-center items-center gap-2 transition-all"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            {isSaved ? 'Connected securely' : 'Save Connection'}
          </button>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
            Don't want to manage keys? <button type="button" className="text-[#EB6708] font-bold hover:underline ml-1">Upgrade to Cloud Pro</button>
          </p>
        </div>
      </form>
    </div>
  );
};
