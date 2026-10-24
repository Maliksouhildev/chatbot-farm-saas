"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChatFeed } from './ChatFeed';
import { CustomerProfileCrm } from './CustomerProfileCrm';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Bot, 
  User, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  Globe, 
  Send,
  SlidersHorizontal,
  RefreshCw,
  Zap
} from 'lucide-react';

// Channel Definitions
type ChannelFilter = 'all' | 'whatsapp' | 'instagram' | 'telegram' | 'facebook' | 'simulator';

export const UnifiedInbox: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<ChannelFilter>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  useEffect(() => {
    // Load strictly real conversations from Supabase (zero mock fallback)
    async function loadData() {
      try {
        const { data: convData, error } = await supabase
          .from('conversations')
          .select('*')
          .order('last_message_at', { ascending: false });

        if (!error && convData && convData.length > 0) {
          setConversations(convData);
          setSelectedConversationId(convData[0].id);
        } else {
          setConversations([]);
          setSelectedConversationId(null);
          setMessages([]);
        }
      } catch (err) {
        setConversations([]);
        setSelectedConversationId(null);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();

    // Setup Supabase Realtime Subscription for incoming messages
    const channel = supabase
      .channel('realtime_chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = payload.new;
          if (newMsg.conversation_id === selectedConversationId) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update messages when selecting another conversation
  useEffect(() => {
    if (!selectedConversationId) return;

    async function loadConvMessages() {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', selectedConversationId)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          setMessages(data);
        } else {
          setMessages([]);
        }
      } catch (e) {
        setMessages([]);
      }
    }

    loadConvMessages();
  }, [selectedConversationId]);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId) || conversations[0];

  // Send human operator reply
  const handleSendMessage = async (text: string) => {
    if (!selectedConversation) return;

    const newMsg = {
      id: 'm-' + Date.now(),
      conversation_id: selectedConversation.id,
      sender: 'human_operator',
      message_type: 'text',
      content: text,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, newMsg]);

    // Send to API endpoint for multi-channel dispatch
    try {
      await fetch('/api/inbox/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          channelType: selectedConversation.channel_type,
          recipient: selectedConversation.contact_phone,
          content: text
        })
      });
    } catch (err) {
      console.log('Outbound API send error:', err);
    }
  };

  // Toggle AI for this conversation
  const handleToggleAi = async (enabled: boolean) => {
    if (!selectedConversation) return;

    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConversation.id ? { ...c, ai_enabled: enabled } : c))
    );

    try {
      await fetch('/api/inbox/toggle-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          enabled
        })
      });
    } catch (e) {
      console.log('Toggle error:', e);
    }
  };

  const handleUpdateTags = (newTags: string[]) => {
    if (!selectedConversation) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConversation.id ? { ...c, tags: newTags } : c))
    );
  };

  const handleAssignAgent = (agent: string) => {
    if (!selectedConversation) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConversation.id ? { ...c, assigned_to: agent } : c))
    );
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesChannel = activeChannel === 'all' || c.channel_type === activeChannel;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      c.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contact_phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.last_message?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesStatus && matchesSearch;
  });

  return (
    <div className="w-full h-[85vh] rounded-3xl overflow-hidden border border-white/10 bg-neutral-950 shadow-2xl flex flex-col">
      {/* 3-COLUMN MAIN LAYOUT */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        
        {/* COLUMN 1: CHANNELS & CONVERSATION LIST (3.5 cols) */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3.5 border-r border-white/10 flex flex-col bg-neutral-950/90">
          
          {/* Header & Search */}
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-lg text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-pink-500" />
                Live Omnichannel Inbox
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 font-bold border border-pink-500/20">
                {conversations.length} Active
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, or message..."
                className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Channel Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
              {[
                { id: 'all', label: 'All', icon: '🌐' },
                { id: 'whatsapp', label: 'WhatsApp', icon: '🟢' },
                { id: 'instagram', label: 'Instagram', icon: '📸' },
                { id: 'telegram', label: 'Telegram', icon: '✈️' },
                { id: 'simulator', label: 'Simulator', icon: '🧪' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveChannel(tab.id as ChannelFilter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                    activeChannel === tab.id
                      ? 'bg-gradient-to-r from-pink-500/20 to-orange-500/20 text-pink-300 border border-pink-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List Cards */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">
                No chats found in this filter.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConversationId;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`w-full p-4 text-left transition-colors flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-white/[0.06] border-l-4 border-l-pink-500'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-700 flex items-center justify-center font-bold text-sm text-white">
                        {(conv.contact_name || conv.contact_phone || 'C')[0].toUpperCase()}
                      </div>
                      <span className="absolute -bottom-1 -right-1 text-xs">
                        {conv.channel_type === 'whatsapp' && '🟢'}
                        {conv.channel_type === 'telegram' && '✈️'}
                        {conv.channel_type === 'instagram' && '📸'}
                        {conv.channel_type === 'simulator' && '🧪'}
                      </span>
                    </div>

                    {/* Chat preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="font-bold text-sm text-white truncate">{conv.contact_name || 'Customer'}</h4>
                        <span className="text-[10px] text-gray-500 whitespace-nowrap">
                          {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-400 truncate">
                        {conv.last_message || 'Active conversation'}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        {conv.ai_enabled !== false ? (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 flex items-center gap-0.5">
                            <Bot className="w-2.5 h-2.5" /> AI
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 flex items-center gap-0.5">
                            <User className="w-2.5 h-2.5" /> Human
                          </span>
                        )}

                        {conv.unread_count > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-pink-500 text-white ml-auto">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 2: CENTER LIVE CHAT FEED (5.5 cols) */}
        <div className="col-span-12 md:col-span-8 lg:col-span-5.5 flex flex-col border-r border-white/10">
          <ChatFeed
            conversation={selectedConversation}
            messages={messages}
            onSendMessage={handleSendMessage}
            isAiGenerating={isAiGenerating}
          />
        </div>

        {/* COLUMN 3: RIGHT CUSTOMER CRM & AI CONTROLS (3 cols) */}
        <div className="hidden lg:block lg:col-span-3 h-full">
          <CustomerProfileCrm
            conversation={selectedConversation}
            onToggleAi={handleToggleAi}
            onUpdateTags={handleUpdateTags}
            onAssignAgent={handleAssignAgent}
          />
        </div>

      </div>
    </div>
  );
};
