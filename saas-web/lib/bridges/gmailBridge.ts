export interface GmailConversation {
  id: string;
  appId: "gmail";
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
 * Fetches real email threads from Gmail API
 */
export async function fetchRealGmailMessages(params: {
  accessToken?: string;
  email?: string;
}): Promise<{
  success: boolean;
  chats: GmailConversation[];
  error?: string;
}> {
  try {
    const { accessToken, email } = params;
    if (!accessToken) {
      return {
        success: false,
        chats: [],
        error: "Google access token is missing. Please click '1-Click Connect' again to grant permissions."
      };
    }

    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        success: false,
        chats: [],
        error: `Gmail API Error (${res.status}): ${errText}`,
      };
    }

    const data = await res.json().catch(() => ({}));
    const messageRefs = data.messages || [];

    const chats: GmailConversation[] = [];

    for (const m of messageRefs.slice(0, 10)) {
      const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!msgRes.ok) continue;
      const msgData = await msgRes.json();
      const headers = msgData.payload?.headers || [];

      const fromHeader = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "Client";
      const subjectHeader = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "Inquiry";
      const dateHeader = headers.find((h: any) => h.name.toLowerCase() === "date")?.value;

      const date = dateHeader ? new Date(dateHeader) : new Date();
      const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const snippet = msgData.snippet || subjectHeader;
      const cleanSender = fromHeader.replace(/<.*>/, "").trim() || fromHeader;
      const senderEmail = fromHeader.match(/<([^>]+)>/)?.[1] || fromHeader;

      chats.push({
        id: `gmail_${m.id}`,
        appId: "gmail",
        name: cleanSender,
        handleOrPhone: senderEmail,
        avatarText: (cleanSender || "G")[0].toUpperCase(),
        avatarBg: "#EA4335",
        statusText: `Email Support • ${subjectHeader}`,
        spend: "0 DA",
        lastMessage: snippet,
        time: timeStr,
        lastMessageTime: timeStr,
        timestamp: date.getTime(),
        unreadCount: msgData.labelIds?.includes("UNREAD") ? 1 : 0,
        messages: [
          {
            id: `msg_${m.id}`,
            sender: "customer",
            text: snippet,
            time: timeStr,
            seen: !msgData.labelIds?.includes("UNREAD"),
          },
        ],
      });
    }

    return {
      success: true,
      chats,
    };
  } catch (err: any) {
    return { success: false, chats: [], error: err.message };
  }
}
