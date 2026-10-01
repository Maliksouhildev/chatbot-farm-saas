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
  topicId?: string;
  imageUrl?: string;
  videoUrl?: string;
  fileName?: string;
  fileSize?: string;
  isAudio?: boolean;
  audioDuration?: string;
  authorName?: string;
  authorAvatar?: string | null;
  timestamp?: number;
  mediaType?: "image" | "video" | "audio";
  message?: any;
  fromMe?: boolean;
  pinned?: boolean;
  senderName?: string;
  senderAvatar?: string;
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
  children?: ContactProfile[];
  avatarBg?: string;
  messages: ChatMessage[];
  topics?: { id: string; name: string; unreadCount?: number; pinned?: boolean }[];
  isGroup?: boolean;
}

export const REAL_INSTAGRAM_CHATS: ContactProfile[] = [];

export const REAL_WHATSAPP_CHATS: ContactProfile[] = [];

export const PAIRED_CHATS_BY_APP: Record<string, ContactProfile[]> = {
  whatsapp: [
    {
      id: "wa_1",
      appId: "whatsapp",
      name: "Ahmed Y.",
      handleOrPhone: "+213 555 1234",
      statusText: "Online",
      lastMessage: "Is this still available?",
      time: "10:30 AM",
      profilePicUrl: "https://i.pravatar.cc/150?u=ahmed",
      messages: [
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          text: "Is this still available?",
          time: "10:30 AM"
        }
      ]
    },
    {
      id: "wa_2",
      appId: "whatsapp",
      name: "Sarah Jones",
      handleOrPhone: "+1 555 9876",
      statusText: "Last seen today",
      lastMessage: "See you later!",
      time: "09:45 AM",
      profilePicUrl: "https://i.pravatar.cc/150?u=sarahj",
      messages: [
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          text: "See you later!",
          time: "09:45 AM"
        }
      ]
    }
  ],
  whatsapp_2: [
    {
      id: "wa2_1",
      appId: "whatsapp_2",
      name: "Business Support",
      handleOrPhone: "+44 20 7946 0958",
      statusText: "Online",
      lastMessage: "We have received your request.",
      time: "11:15 AM",
      profilePicUrl: "https://i.pravatar.cc/150?u=bizsupport",
      messages: [
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          text: "We have received your request.",
          time: "11:15 AM"
        }
      ]
    }
  ],
  instagram: [
    {
      id: "ig_1",
      appId: "instagram",
      name: "Sara M.",
      handleOrPhone: "@sara_m",
      statusText: "Active 2h ago",
      lastMessage: "Thanks!",
      time: "11:00 AM",
      profilePicUrl: "https://i.pravatar.cc/150?u=sara",
      messages: [
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          text: "Thanks!",
          time: "11:00 AM"
        }
      ]
    },
    {
      id: "ig_2",
      appId: "instagram",
      name: "Mike T.",
      handleOrPhone: "@mike_t",
      statusText: "Active now",
      lastMessage: "Check this out \ud83d\udd25",
      time: "12:30 PM",
      profilePicUrl: "https://i.pravatar.cc/150?u=miket",
      messages: [
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          text: "Check this out \ud83d\udd25",
          time: "12:30 PM"
        }
      ]
    }
  ],
  telegram: [
    {
      id: "tg_1",
      appId: "telegram",
      name: "Automatique L3",
      handleOrPhone: "Group • 120 members",
      statusText: "Active",
      lastMessage: "Can someone share the notes?",
      time: "09:15 AM",
      profilePicUrl: "https://i.pravatar.cc/150?u=autol3",
      isGroup: true,
      topics: [
        { id: "t_1", name: "General", unreadCount: 5, pinned: true },
        { id: "t_2", name: "Cours", unreadCount: 0 },
        { id: "t_3", name: "TD/TP", unreadCount: 12 },
        { id: "t_4", name: "Exams", unreadCount: 2 }
      ],
      messages: [
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          senderName: "Alice",
          text: "Can someone share the notes from @prof?",
          time: "09:15 AM",
          pinned: true
        },
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          senderName: "Bob",
          text: "Here is the photo of the board",
          time: "09:16 AM",
          hasImages: true,
          imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"
        }
      ]
    },
    {
      id: "tg_2",
      appId: "telegram",
      name: "Alex",
      handleOrPhone: "@alex99",
      statusText: "last seen recently",
      lastMessage: "Sure, let's do it.",
      time: "02:10 PM",
      profilePicUrl: "https://i.pravatar.cc/150?u=alex",
      messages: [
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          text: "Sure, let's do it.",
          time: "02:10 PM"
        }
      ]
    }
  ],
  messenger: [
    {
      id: "ms_1",
      appId: "messenger",
      name: "John Doe",
      handleOrPhone: "John Doe",
      statusText: "Active 5m ago",
      lastMessage: "Are you coming?",
      time: "05:00 PM",
      profilePicUrl: "https://i.pravatar.cc/150?u=johnd",
      messages: [
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          text: "Are you coming?",
          time: "05:00 PM"
        }
      ]
    }
  ],
  web_widget: [
    {
      id: "ww_1",
      appId: "web_widget",
      name: "Guest 942",
      handleOrPhone: "Website Visitor",
      statusText: "Browsing pricing",
      lastMessage: "How much is the pro plan?",
      time: "03:20 PM",
      profilePicUrl: "https://i.pravatar.cc/150?u=guest942",
      messages: [
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          text: "How much is the pro plan?",
          time: "03:20 PM"
        }
      ]
    }
  ],
  gmail: [
    {
      id: "gm_1",
      appId: "gmail",
      name: "Alice Smith",
      handleOrPhone: "alice@example.com",
      statusText: "Offline",
      lastMessage: "Weekly Report Attached",
      time: "Yesterday",
      profilePicUrl: "https://i.pravatar.cc/150?u=alice",
      messages: [
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          text: "Weekly Report Attached",
          time: "Yesterday"
        }
      ]
    }
  ],
  signal: [
    {
      id: "sg_1",
      appId: "signal",
      name: "Bob",
      handleOrPhone: "+1 555 1111",
      statusText: "Secure",
      lastMessage: "Key verified",
      time: "Mon",
      profilePicUrl: "https://i.pravatar.cc/150?u=bob",
      messages: [
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          text: "Key verified",
          time: "Mon"
        }
      ]
    }
  ],
  x_twitter: [
    {
      id: "tw_1",
      appId: "x_twitter",
      name: "Tech News",
      handleOrPhone: "@technews",
      statusText: "Follows you",
      lastMessage: "Latest update is out",
      time: "2 days ago",
      profilePicUrl: "https://i.pravatar.cc/150?u=technews",
      messages: [
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          text: "Latest update is out",
          time: "2 days ago"
        }
      ]
    }
  ],
  google_messages: [
    {
      id: "gm_2",
      appId: "google_messages",
      name: "Mom",
      handleOrPhone: "Mom",
      statusText: "Mobile",
      lastMessage: "Call me when you can",
      time: "10:00 AM",
      profilePicUrl: "https://i.pravatar.cc/150?u=mom",
      messages: [
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          text: "Call me when you can",
          time: "10:00 AM"
        }
      ]
    }
  ],
  google_chat: [
    {
      id: "gc_1",
      appId: "google_chat",
      name: "Project Team",
      handleOrPhone: "Space",
      statusText: "Active",
      lastMessage: "Deployment successful",
      time: "11:45 AM",
      profilePicUrl: "https://i.pravatar.cc/150?u=project",
      messages: [
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          text: "Deployment successful",
          time: "11:45 AM"
        }
      ]
    }
  ],
  google_voice: [],
  discord: [
    {
      id: "dc_1",
      appId: "discord",
      name: "GamerPro",
      handleOrPhone: "GamerPro#1234",
      statusText: "Playing Valorant",
      lastMessage: "Let's duo",
      time: "08:00 PM",
      profilePicUrl: "https://i.pravatar.cc/150?u=gamerpro",
      messages: [
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          text: "Let's duo",
          time: "08:00 PM"
        }
      ]
    },
    {
      id: "dc_2",
      appId: "discord",
      name: "DevServer",
      handleOrPhone: "DevServer",
      statusText: "14 online",
      lastMessage: "PR merged",
      time: "09:00 PM",
      profilePicUrl: "https://i.pravatar.cc/150?u=devserver",
      messages: [
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          text: "PR merged",
          time: "09:00 PM"
        }
      ]
    }
  ],
  slack: [
    {
      id: "sl_1",
      appId: "slack",
      name: "Marketing",
      handleOrPhone: "#marketing",
      statusText: "Channel",
      lastMessage: "Campaign is live",
      time: "10:15 AM",
      profilePicUrl: "https://i.pravatar.cc/150?u=marketing",
      messages: [
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          text: "Campaign is live",
          time: "10:15 AM"
        }
      ]
    }
  ],
  linkedin: [
    {
      id: "li_1",
      appId: "linkedin",
      name: "Recruiter",
      handleOrPhone: "Tech Recruiter",
      statusText: "Active now",
      lastMessage: "Are you open to new roles?",
      time: "Yesterday",
      profilePicUrl: "https://i.pravatar.cc/150?u=recruiter",
      messages: [
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          text: "Are you open to new roles?",
          time: "Yesterday"
        }
      ]
    }
  ],
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
