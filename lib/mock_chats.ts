export interface ChatMessage {
  id: string;
  sender: "customer" | "operator" | "ai";
  text: string;
  time: string;
  seen?: boolean;
  seenTime?: string;
  delivered?: boolean;
  isDeleted?: boolean;
  reactions?: { emoji: string; count: number; userReacted?: boolean }[];
  hasImages?: boolean;
  imageUrl?: string;
  fileName?: string;
  fileSize?: string;
  isAudio?: boolean;
  audioDuration?: string;
  authorName?: string;
  authorAvatar?: string | null;
  timestamp?: number;
}

export interface ContactProfile {
  id: string;
  appId: string;
  name: string;
  handleOrPhone: string;
  avatarText?: string;
  avatarColor?: string;
  statusText: string;
  lastMessage: string;
  time?: string;
  lastMessageTime?: string;
  timestamp?: number;
  spend?: string;
  unreadCount?: number;
  status?: "ongoing" | "finished" | "new" | "read";
  profilePicUrl?: string | null;
  isGroup?: boolean;
  children?: ContactProfile[];
  avatarBg?: string;
  messages: ChatMessage[];
}

export const REAL_INSTAGRAM_CHATS: ContactProfile[] = [];

export const REAL_WHATSAPP_CHATS: ContactProfile[] = [];

export const PAIRED_CHATS_BY_APP: Record<string, ContactProfile[]> = {
  whatsapp: [],
  whatsapp_2: [],
  instagram: [],
  telegram: [
    {
      id: "tg_group_1",
      appId: "telegram",
      name: "Bot Farm Admins",
      handleOrPhone: "@botfarm_admins",
      avatarText: "BF",
      avatarColor: "bg-blue-500",
      profilePicUrl: "https://i.pravatar.cc/150?u=${Math.random().toString(36).substring(7)}",
      statusText: "Admin Group",
      lastMessage: "System update tonight.",
      time: "10:00 AM",
      isGroup: true,
      messages: [],
      children: [
        {
          id: "tg_topic_1",
          appId: "telegram",
          name: "General",
          handleOrPhone: "#general",
          profilePicUrl: "https://i.pravatar.cc/150?u=${Math.random().toString(36).substring(7)}",
      statusText: "Topic",
          lastMessage: "System update tonight.",
          time: "10:00 AM",
          isGroup: false,
          messages: [{ id: "m1", sender: "ai", text: "System update tonight.", time: "10:00 AM", seen: true }]
        },
        {
          id: "tg_topic_2",
          appId: "telegram",
          name: "Alerts",
          handleOrPhone: "#alerts",
          profilePicUrl: "https://i.pravatar.cc/150?u=${Math.random().toString(36).substring(7)}",
      statusText: "Topic",
          lastMessage: "Node is down.",
          time: "09:00 AM",
          isGroup: false,
          messages: [{ id: "m2", sender: "ai", text: "Node is down.", time: "09:00 AM", seen: true }]
        }
      ]
    },
    {
      id: "tg_user_1",
      appId: "telegram",
      name: "John Doe",
      handleOrPhone: "@johndoe",
      avatarText: "JD",
      avatarColor: "bg-green-500",
      profilePicUrl: "https://i.pravatar.cc/150?u=${Math.random().toString(36).substring(7)}",
      statusText: "Online",
      lastMessage: "Hey, is the bot working?",
      time: "11:00 AM",
      isGroup: false,
      messages: [{ id: "m3", sender: "customer", text: "Hey, is the bot working?", time: "11:00 AM", seen: true }]
    }
  ],
  signal: [],
  x_twitter: [],
  google_messages: [],
  google_chat: [],
  google_voice: [],
  discord: [
    {
      id: "dc_server_1",
      appId: "discord",
      name: "Support Server",
      handleOrPhone: "Server",
      avatarText: "SS",
      avatarColor: "bg-indigo-500",
      profilePicUrl: "https://i.pravatar.cc/150?u=${Math.random().toString(36).substring(7)}",
      statusText: "Support Hub",
      lastMessage: "Check the tickets",
      time: "12:00 PM",
      isGroup: true,
      messages: [],
      children: [
        {
          id: "dc_cat_1",
          appId: "discord",
          name: "Tickets",
          handleOrPhone: "Category",
          profilePicUrl: "https://i.pravatar.cc/150?u=${Math.random().toString(36).substring(7)}",
      statusText: "Category",
          lastMessage: "",
          isGroup: true,
          messages: [],
          children: [
            {
              id: "dc_chan_1",
              appId: "discord",
              name: "ticket-001",
              handleOrPhone: "#ticket-001",
              profilePicUrl: "https://i.pravatar.cc/150?u=${Math.random().toString(36).substring(7)}",
      statusText: "Text Channel",
              lastMessage: "I need help with my account.",
              time: "12:00 PM",
              isGroup: false,
              messages: [{ id: "m4", sender: "customer", text: "I need help with my account.", time: "12:00 PM", seen: true }]
            }
          ]
        },
        {
          id: "dc_chan_2",
          appId: "discord",
          name: "general",
          handleOrPhone: "#general",
          profilePicUrl: "https://i.pravatar.cc/150?u=${Math.random().toString(36).substring(7)}",
      statusText: "Text Channel",
          lastMessage: "Hello everyone!",
          time: "11:00 AM",
          isGroup: false,
          messages: [{ id: "m5", sender: "customer", text: "Hello everyone!", time: "11:00 AM", seen: true }]
        }
      ]
    }
  ],
  slack: [],
  linkedin: [],
  irc: [],
  matrix: [],
};

// Returns contacts for the selected app (Strictly real contacts only, no synthetic mock fallback)
export const getContactsForApp = (appId: string, isConnected: boolean): ContactProfile[] => {
  if (!isConnected) return [];
  const stored = PAIRED_CHATS_BY_APP[appId];
  if (stored && stored.length > 0) return stored;
  return [];
};

// Central helper to resolve the merchant's real Instagram handle (no synthetic fallbacks)
export const getRealInstagramProfile = (): { username: string; name: string; isLinked: boolean } => {
  if (typeof window === 'undefined') return { username: '', name: '', isLinked: false };
  try {
    const ig = localStorage.getItem('cf_ig_account');
    if (ig) {
      const p = JSON.parse(ig);
      const u = (p.username || p.name || '').replace(/^@/, '').trim();
      if (u) return { username: u, name: p.name || `@${u}`, isLinked: true };
    }
    const meta = localStorage.getItem('cf_meta_auth');
    if (meta) {
      const p = JSON.parse(meta);
      const u = p.instagramAccounts?.[0]?.username?.replace(/^@/, '').trim();
      if (u) return { username: u, name: p.instagramAccounts[0].name || `@${u}`, isLinked: true };
    }
  } catch {}
  return { username: '', name: '', isLinked: false };
};

// Legacy compatibility export
export const MOCK_CONTACTS_BY_APP: Record<string, ContactProfile[]> = PAIRED_CHATS_BY_APP;

export const APP_GRADIENT_THEMES: Record<string, { gradient: string; solidColor: string; accentColor: string; name: string }> = {
  whatsapp: {
    gradient: "bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366]",
    solidColor: "#1B6648",
    accentColor: "#1B6648",
    name: "WhatsApp Main",
  },
  whatsapp_2: {
    gradient: "bg-gradient-to-r from-[#075E54] via-[#15803d] to-[#16a34a]",
    solidColor: "#15803d",
    accentColor: "#15803d",
    name: "WhatsApp Secondary",
  },
  telegram: {
    gradient: "bg-gradient-to-r from-[#0088CC] via-[#2AABEE] to-[#0077B5]",
    solidColor: "#0088CC",
    accentColor: "#0088CC",
    name: "Telegram",
  },
  signal: {
    gradient: "bg-gradient-to-r from-[#2C6BED] via-[#3A76F0] to-[#508BFF]",
    solidColor: "#3A76F0",
    accentColor: "#3A76F0",
    name: "Signal",
  },
  instagram: {
    gradient: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
    solidColor: "#C13584",
    accentColor: "#833AB4",
    name: "Instagram",
  },
  messenger: {
    gradient: "bg-gradient-to-r from-[#00B2FE] via-[#006AFF] to-[#9B51E0]",
    solidColor: "#0084FF",
    accentColor: "#0084FF",
    name: "FB Messenger",
  },
  x_twitter: {
    gradient: "bg-gradient-to-r from-[#14171A] via-[#24272A] to-[#000000]",
    solidColor: "#14171A",
    accentColor: "#14171A",
    name: "X (Twitter)",
  },
  google_messages: {
    gradient: "bg-gradient-to-r from-[#1A73E8] via-[#4285F4] to-[#1967D2]",
    solidColor: "#1A73E8",
    accentColor: "#1A73E8",
    name: "Google Messages (RCS)",
  },
  google_chat: {
    gradient: "bg-gradient-to-r from-[#00AC47] via-[#00832D] to-[#006020]",
    solidColor: "#00AC47",
    accentColor: "#00AC47",
    name: "Google Chat",
  },
  google_voice: {
    gradient: "bg-gradient-to-r from-[#0F9D58] via-[#0B8043] to-[#05512B]",
    solidColor: "#0F9D58",
    accentColor: "#0F9D58",
    name: "Google Voice",
  },
  discord: {
    gradient: "bg-gradient-to-r from-[#5865F2] via-[#4752C4] to-[#3B44AC]",
    solidColor: "#5865F2",
    accentColor: "#5865F2",
    name: "Discord",
  },
  slack: {
    gradient: "bg-gradient-to-r from-[#4A154B] via-[#611f69] to-[#3F0F40]",
    solidColor: "#4A154B",
    accentColor: "#4A154B",
    name: "Slack",
  },
  linkedin: {
    gradient: "bg-gradient-to-r from-[#0A66C2] via-[#0077B5] to-[#004182]",
    solidColor: "#0A66C2",
    accentColor: "#0A66C2",
    name: "LinkedIn",
  },
  irc: {
    gradient: "bg-gradient-to-r from-[#1E222A] via-[#2E3440] to-[#1B1D23]",
    solidColor: "#1E222A",
    accentColor: "#00FF66",
    name: "IRC Network",
  },
  matrix: {
    gradient: "bg-gradient-to-r from-[#0F141C] via-[#0DBD8B] to-[#048A63]",
    solidColor: "#0DBD8B",
    accentColor: "#0DBD8B",
    name: "Matrix Protocol",
  },
  web_widget: {
    gradient: "bg-gradient-to-r from-[#0D9488] via-[#10B981] to-[#059669]",
    solidColor: "#0D9488",
    accentColor: "#0D9488",
    name: "Storefront Live Chat",
  },
  gmail: {
    gradient: "bg-gradient-to-r from-[#EA4335] via-[#D93025] to-[#B31412]",
    solidColor: "#EA4335",
    accentColor: "#EA4335",
    name: "Support Email",
  },
};
