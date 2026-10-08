export interface ChannelStarterChat {
  id: string;
  appId: string;
  name: string;
  handleOrPhone: string;
  avatarText?: string;
  avatarBg?: string;
  statusText: string;
  spend: string;
  lastMessage: string;
  time: string;
  lastMessageTime: string;
  timestamp: number;
  unreadCount: number;
  messages: {
    id: string;
    sender: 'customer' | 'operator';
    text: string;
    time: string;
    seen: boolean;
    isAudio?: boolean;
    audioDuration?: string;
    imageUrl?: string;
    fileName?: string;
    fileSize?: string;
  }[];
}

// All mock/synthetic starter chats completely purged.
// Only authentic customer discussions fetched from live channels/APIs are displayed.
export const CHANNEL_STARTER_CHATS: Record<string, ChannelStarterChat[]> = {};
