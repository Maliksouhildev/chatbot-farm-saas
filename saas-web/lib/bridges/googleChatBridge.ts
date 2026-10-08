export interface GoogleChatSpace {
  name: string;
  displayName: string;
  type: "ROOM" | "DM" | "GROUP_CHAT";
  spaceThreadingState?: string;
}

export interface GoogleChatMessage {
  id: string;
  name: string;
  text: string;
  sender: "customer" | "operator";
  createTime: string;
}

export interface GoogleChatConversation {
  id: string;
  appId: "google_chat";
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
 * Fetches real Google Chat spaces and messages using Google OAuth access token
 */
export async function fetchRealGoogleChatConversations(params: {
  accessToken?: string;
  email?: string;
}): Promise<{
  success: boolean;
  chats: GoogleChatConversation[];
  error?: string;
}> {
  try {
    const { accessToken } = params;
    if (!accessToken) {
      return {
        success: false,
        chats: [],
        error: "Google access token is missing. Please click '1-Click Connect' again to authenticate.",
      };
    }

    // Call Google Chat API v1 spaces endpoint
    const res = await fetch("https://chat.googleapis.com/v1/spaces?pageSize=20", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      return {
        success: false,
        chats: [],
        error: `Google Chat API returned HTTP ${res.status}: ${err}`,
      };
    }

    const data = await res.json();
    const spaces: GoogleChatSpace[] = data.spaces || [];

    const realChats: GoogleChatConversation[] = [];

    for (const sp of spaces) {
      // Fetch latest messages from this space
      const msgRes = await fetch(`https://chat.googleapis.com/v1/${sp.name}/messages?pageSize=15`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const msgData = msgRes.ok ? await msgRes.json() : { messages: [] };
      const rawMsgs = msgData.messages || [];

      const messages = rawMsgs.map((m: any) => {
        const date = new Date(m.createTime || Date.now());
        const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return {
          id: m.name || `gc_msg_${Date.now()}_${Math.random()}`,
          sender: "customer" as const,
          text: m.text || "",
          time: timeStr,
          seen: true,
        };
      });

      const lastMsg = messages[messages.length - 1];

      realChats.push({
        id: `gchat_${sp.name.replace(/[^a-zA-Z0-9_]/g, "_")}`,
        appId: "google_chat",
        name: sp.displayName || (sp.type === "DM" ? "Direct Message" : "Google Chat Space"),
        handleOrPhone: sp.name,
        avatarText: (sp.displayName || "G")[0].toUpperCase(),
        avatarBg: "#00AC47",
        statusText: `Google Chat • ${sp.type || "Space"}`,
        spend: "0 DA",
        lastMessage: lastMsg ? lastMsg.text : "Active Google Chat space",
        time: lastMsg ? lastMsg.time : "Live",
        lastMessageTime: lastMsg ? lastMsg.time : "Live",
        timestamp: Date.now(),
        unreadCount: 0,
        messages,
      });
    }

    return {
      success: true,
      chats: realChats,
    };
  } catch (err: any) {
    console.error("[GoogleChatBridge] Failed to fetch real spaces:", err);
    return { success: false, chats: [], error: err.message };
  }
}

/**
 * Sends a real message to a Google Chat space
 */
export async function sendRealGoogleChatMessage(params: {
  accessToken?: string;
  spaceName: string;
  text: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { accessToken, spaceName, text } = params;
    if (!accessToken) {
      return { success: false, error: "Missing Google Chat access token." };
    }

    const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text.trim() }),
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: true, messageId: data.name };
    }

    const err = await res.text().catch(() => "Unknown error");
    return { success: false, error: `Failed to send Google Chat message: ${err}` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
