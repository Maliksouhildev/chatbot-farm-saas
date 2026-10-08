export interface LinkedInConversation {
  id: string;
  appId: "linkedin";
  name: string;
  handleOrPhone: string;
  avatarText: string;
  avatarBg: string;
  statusText: string;
  spend: string;
  lastMessage: string;
  time: string;
  lastMessageTime: string;
  timestamp: number;
  unreadCount: number;
  messages: Array<{
    id: string;
    sender: "customer" | "operator";
    text: string;
    time: string;
    seen: boolean;
  }>;
}

/**
 * Fetches real LinkedIn InMail / messaging conversations using session cookie or OAuth token
 */
export async function fetchRealLinkedInConversations(params: {
  tokenOrCookie?: string;
  page?: string;
}): Promise<{
  success: boolean;
  chats: LinkedInConversation[];
  error?: string;
}> {
  try {
    const { tokenOrCookie } = params;
    if (!tokenOrCookie) {
      return {
        success: true,
        chats: [],
      };
    }

    const isCookie = tokenOrCookie.startsWith("AQED") || tokenOrCookie.length > 50;

    let res: Response;
    if (isCookie) {
      // Query LinkedIn Voyager internal messaging API
      res = await fetch("https://www.linkedin.com/voyager/api/messaging/conversations?count=20", {
        headers: {
          "csrf-token": "ajax:0",
          cookie: `li_at=${tokenOrCookie}; JSESSIONID="ajax:0"`,
          "x-restli-protocol-version": "2.0.0",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        },
      });
    } else {
      // Query official LinkedIn Messaging API v2
      res = await fetch("https://api.linkedin.com/v2/messages", {
        headers: {
          Authorization: `Bearer ${tokenOrCookie}`,
          "Content-Type": "application/json",
        },
      });
    }

    if (!res.ok) {
      return {
        success: true,
        chats: [],
      };
    }

    const data = await res.json().catch(() => ({}));
    const elements = data.elements || [];

    const chats: LinkedInConversation[] = elements.map((conv: any) => {
      const participant = conv.participants?.[0] || {};
      const name = `${participant.miniProfile?.firstName || "LinkedIn"} ${participant.miniProfile?.lastName || "Member"}`.trim();
      const headline = participant.miniProfile?.occupation || "Professional";

      return {
        id: `li_${conv.entityUrn || Date.now()}`,
        appId: "linkedin",
        name,
        handleOrPhone: headline,
        avatarText: (name || "L")[0].toUpperCase(),
        avatarBg: "#0A66C2",
        statusText: `LinkedIn • ${headline}`,
        spend: "0 DA",
        lastMessage: conv.events?.[0]?.eventContent?.attributedBody?.text || "LinkedIn Conversation",
        time: "Recent",
        lastMessageTime: "Recent",
        timestamp: Date.now(),
        unreadCount: conv.unreadCount || 0,
        messages: [],
      };
    });

    return {
      success: true,
      chats,
    };
  } catch (err: any) {
    return { success: false, chats: [], error: err.message };
  }
}
