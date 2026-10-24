export interface GmailAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  isImage: boolean;
  attachmentId?: string;
}

export interface GmailCategoryLabel {
  id: string;
  name: string;
  type: "system" | "user";
  unreadCount?: number;
  totalCount?: number;
}

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
  subject: string;
  snippet: string;
  starred: boolean;
  category: "primary" | "promotions" | "notifications" | "important" | "spam" | "sent" | "trash";
  labelIds: string[];
  attachments: GmailAttachment[];
  bodyText?: string;
  bodyHtml?: string;
  messages: Array<{
    id: string;
    sender: "customer" | "operator";
    text: string;
    time: string;
    seen: boolean;
    attachments?: GmailAttachment[];
  }>;
}

/**
 * Decodes HTML entities (e.g., &#39;, &quot;, &amp;, &lt;, &gt;) into natural characters
 */
export function decodeHtmlEntities(str?: string): string {
  if (!str) return "";
  return str
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Recursively parses email payload parts for text bodies and genuine attachments
 */
function parseGmailParts(
  parts: any[],
  attachments: GmailAttachment[],
  bodyRef: { text?: string; html?: string }
) {
  if (!Array.isArray(parts)) return;

  for (const part of parts) {
    const filename = part.filename;
    const mimeType = part.mimeType || "";
    const body = part.body || {};

    if (filename && filename.length > 0) {
      const sizeBytes = body.size || 0;
      const sizeStr = sizeBytes > 1048576 
        ? `${(sizeBytes / 1048576).toFixed(1)} MB`
        : `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
      const isImg = mimeType.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(filename);

      attachments.push({
        id: body.attachmentId || `att_${attachments.length + 1}`,
        name: filename,
        size: sizeStr,
        type: mimeType,
        isImage: isImg,
        attachmentId: body.attachmentId,
      });
    }

    if (!filename && mimeType === "text/plain" && body.data && !bodyRef.text) {
      try {
        bodyRef.text = Buffer.from(body.data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
      } catch {}
    } else if (!filename && mimeType === "text/html" && body.data && !bodyRef.html) {
      try {
        bodyRef.html = Buffer.from(body.data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
      } catch {}
    }

    if (Array.isArray(part.parts)) {
      parseGmailParts(part.parts, attachments, bodyRef);
    }
  }
}

/**
 * Fetches real email threads and authentic client labels from Gmail API
 */
export async function fetchRealGmailMessages(params: {
  accessToken?: string;
  email?: string;
}): Promise<{
  success: boolean;
  chats: GmailConversation[];
  labels: GmailCategoryLabel[];
  error?: string;
}> {
  try {
    const { accessToken } = params;
    if (!accessToken) {
      return {
        success: false,
        chats: [],
        labels: [],
        error: "Google access token is missing. Please click '1-Click Connect' again to grant permissions."
      };
    }

    // 1. Auto-inject the user's authentic Gmail labels (Categories, System & Custom Client Folders)
    const labels: GmailCategoryLabel[] = [
      { id: "INBOX", name: "Principale", type: "system" },
      { id: "CATEGORY_PROMOTIONS", name: "Promotions", type: "system" },
      { id: "CATEGORY_UPDATES", name: "Notifications", type: "system" },
      { id: "STARRED", name: "Messages suivis", type: "system" },
      { id: "IMPORTANT", name: "Important", type: "system" },
      { id: "SENT", name: "Envoyés", type: "system" },
      { id: "SPAM", name: "Spam", type: "system" },
      { id: "TRASH", name: "Corbeille", type: "system" },
    ];

    try {
      const labelsRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/labels", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (labelsRes.ok) {
        const labelsData = await labelsRes.json();
        if (Array.isArray(labelsData.labels)) {
          for (const l of labelsData.labels) {
            if (l.type === "user" && l.name) {
              labels.push({
                id: l.id,
                name: l.name,
                type: "user",
                unreadCount: l.messagesUnread || 0,
                totalCount: l.messagesTotal || 0,
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn("Could not fetch custom Gmail labels:", e);
    }

    // 2. Fetch real messages from Gmail API (up to 30 messages across categories)
    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=30", {
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
        labels,
        error: `Gmail API Error (${res.status}): ${errText}`,
      };
    }

    const data = await res.json().catch(() => ({}));
    const messageRefs = data.messages || [];

    const chats: GmailConversation[] = [];

    for (const m of messageRefs.slice(0, 25)) {
      const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!msgRes.ok) continue;
      const msgData = await msgRes.json();
      const headers = msgData.payload?.headers || [];

      const fromHeader = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "Client";
      const subjectHeader = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "(aucun objet)";
      const dateHeader = headers.find((h: any) => h.name.toLowerCase() === "date")?.value;

      const date = dateHeader ? new Date(dateHeader) : new Date();
      const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const cleanSubject = decodeHtmlEntities(subjectHeader);
      const rawSnippet = msgData.snippet || subjectHeader;
      const snippet = decodeHtmlEntities(rawSnippet);
      const cleanSender = decodeHtmlEntities(fromHeader.replace(/<.*>/, "").trim() || fromHeader);
      const senderEmail = fromHeader.match(/<([^>]+)>/)?.[1] || fromHeader;
      const labelIds: string[] = Array.isArray(msgData.labelIds) ? msgData.labelIds : [];

      const isStarred = labelIds.includes("STARRED");
      const isUnread = labelIds.includes("UNREAD");

      // Categorize message authentic to Gmail categories
      let category: GmailConversation["category"] = "primary";
      if (labelIds.includes("SPAM")) {
        category = "spam";
      } else if (labelIds.includes("TRASH")) {
        category = "trash";
      } else if (labelIds.includes("SENT")) {
        category = "sent";
      } else if (labelIds.includes("CATEGORY_PROMOTIONS")) {
        category = "promotions";
      } else if (labelIds.includes("CATEGORY_UPDATES") || labelIds.includes("CATEGORY_FORUMS") || labelIds.includes("CATEGORY_SOCIAL")) {
        category = "notifications";
      } else if (labelIds.includes("IMPORTANT")) {
        category = "important";
      }

      // Extract real attachments and message bodies
      const attachments: GmailAttachment[] = [];
      const bodyRef: { text?: string; html?: string } = {};

      if (msgData.payload?.body?.data) {
        try {
          bodyRef.text = Buffer.from(msgData.payload.body.data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
        } catch {}
      }

      if (Array.isArray(msgData.payload?.parts)) {
        parseGmailParts(msgData.payload.parts, attachments, bodyRef);
      }

      if (bodyRef.text) {
        bodyRef.text = decodeHtmlEntities(bodyRef.text);
      }

      const emailContent = bodyRef.text || snippet || cleanSubject;

      chats.push({
        id: `gmail_${m.id}`,
        appId: "gmail",
        name: cleanSender,
        handleOrPhone: senderEmail,
        avatarText: (cleanSender || "G")[0].toUpperCase(),
        avatarBg: "#EA4335",
        statusText: `Email Support • ${cleanSubject}`,
        spend: "0 DA",
        lastMessage: snippet,
        time: timeStr,
        lastMessageTime: timeStr,
        timestamp: date.getTime(),
        unreadCount: isUnread ? 1 : 0,
        subject: cleanSubject,
        snippet,
        starred: isStarred,
        category,
        labelIds,
        attachments,
        bodyText: bodyRef.text,
        bodyHtml: bodyRef.html,
        messages: [
          {
            id: `msg_${m.id}`,
            sender: "customer",
            text: emailContent,
            time: timeStr,
            seen: !isUnread,
            attachments: attachments.length > 0 ? attachments : undefined,
          },
        ],
      });
    }

    return {
      success: true,
      chats,
      labels,
    };
  } catch (err: any) {
    return { success: false, chats: [], labels: [], error: err.message };
  }
}
