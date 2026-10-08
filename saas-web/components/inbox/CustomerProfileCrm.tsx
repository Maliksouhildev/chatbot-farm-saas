"use client";

import React, { useState } from 'react';
import { Bot, User, Phone, MapPin, Tag, ShoppingBag, Clock, Sparkles, AlertCircle, CheckCircle2, ChevronRight, BarChart2 } from 'lucide-react';

interface CustomerProfileCrmProps {
  conversation: any;
  onToggleAi: (enabled: boolean) => void;
  onUpdateTags: (tags: string[]) => void;
  onAssignAgent: (agentName: string) => void;
}

export const CustomerProfileCrm: React.FC<CustomerProfileCrmProps> = ({
  conversation,
  onToggleAi,
  onUpdateTags,
  onAssignAgent,
}) => {
  const [newTag, setNewTag] = useState('');
  const [notes, setNotes] = useState(conversation?.customer_notes || 'Customer interested in Sauvage Élixir. Mentioned Yalidine delivery to Oran.');
  const [isSaved, setIsSaved] = useState(false);

  if (!conversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500">
        <User className="w-12 h-12 text-gray-700 mb-3" />
        <p className="font-medium text-gray-400">No conversation selected</p>
        <p className="text-xs text-gray-600 mt-1">Select a customer from the inbox to view CRM data and AI controls.</p>
      </div>
    );
  }

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    const currentTags = conversation.tags || ['Sauvage 3500 DA', 'VIP Customer'];
    if (!currentTags.includes(newTag.trim())) {
      onUpdateTags([...currentTags, newTag.trim()]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = conversation.tags || ['Sauvage 3500 DA', 'VIP Customer'];
    onUpdateTags(currentTags.filter((t: string) => t !== tagToRemove));
  };

  const handleSaveNotes = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const isAiActive = conversation.ai_enabled !== false;
  const tags = conversation.tags || ['Sauvage 3500 DA', 'Yalidine Delivery', 'Verified'];

  return (
    <div className="h-full overflow-y-auto p-5 space-y-6 text-white text-sm bg-neutral-950/80 border-l border-white/10 custom-scrollbar">
      {/* 1. Header Customer Card */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white font-bold text-lg shadow-lg">
          {(conversation.contact_name || conversation.contact_phone || 'C')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-base truncate text-white">{conversation.contact_name || 'Customer'}</h4>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Phone className="w-3 h-3 text-emerald-400" />
            {conversation.contact_phone}
          </p>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {conversation.channel_type || 'whatsapp'}
        </span>
      </div>

      {/* 2. AI BOT MASTER CONTROL SWITCH */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className={`w-5 h-5 ${isAiActive ? 'text-pink-400' : 'text-gray-500'}`} />
            <span className="font-bold text-sm">AI Sales Assistant</span>
          </div>
          <button
            onClick={() => onToggleAi(!isAiActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              isAiActive ? 'bg-gradient-to-r from-pink-500 to-orange-500' : 'bg-neutral-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAiActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          {isAiActive ? (
            <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              AI is actively auto-replying in Algerian Darija.
            </span>
          ) : (
            <span className="text-amber-400 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              AI is paused. Only human operators can answer.
            </span>
          )}
        </p>

        {isAiActive && (
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
            <span>Collision Guard:</span>
            <span className="text-gray-300 font-mono">Auto-cancels on human typing</span>
          </div>
        )}
      </div>

      {/* 3. ASSIGNED AGENT */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assigned Agent</label>
        <select
          value={conversation.assigned_to || 'unassigned'}
          onChange={(e) => onAssignAgent(e.target.value)}
          className="w-full bg-neutral-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
        >
          <option value="unassigned">👤 Unassigned</option>
          <option value="agent_malik">⭐ Malik (Me)</option>
          <option value="agent_sarah">👩 Sarah (Customer Success)</option>
          <option value="agent_karim">👨 Karim (Logistics & Yalidine)</option>
        </select>
      </div>

      {/* 4. CRM SUMMARY & METRICS */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-orange-400" />
          Customer Overview
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[11px] text-gray-500 flex items-center gap-1">
              <ShoppingBag className="w-3 h-3 text-pink-400" /> Total Orders
            </span>
            <p className="text-base font-bold text-white">{conversation.order_count || 2} orders</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[11px] text-gray-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Total Spend
            </span>
            <p className="text-base font-bold text-emerald-400">{conversation.total_spend || '8,300'} DA</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
          <span className="text-gray-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400" /> Wilaya Destination:
          </span>
          <span className="font-semibold text-white">{conversation.wilaya || '16 - Alger (Bab Ezzouar)'}</span>
        </div>
      </div>

      {/* 5. INTERACTIVE TAGS */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-pink-400" />
          Customer Tags
        </label>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-pink-500/10 text-pink-300 border border-pink-500/20"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-white font-bold ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <form onSubmit={handleAddTag} className="flex gap-1.5 mt-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="+ Add tag (e.g. VIP, Urgent)..."
            className="flex-1 bg-neutral-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-pink-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-white transition-colors"
          >
            Add
          </button>
        </form>
      </div>

      {/* 6. INTERNAL OPERATOR NOTES */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Internal Notes (Team Only)</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add private customer notes here..."
          className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-pink-500 resize-none"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSaveNotes}
            className="px-3 py-1 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
          >
            {isSaved ? <CheckCircle2 className="w-3 h-3 text-white" /> : null}
            {isSaved ? 'Saved!' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
};
