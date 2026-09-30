import { NextResponse } from 'next/server';

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const API_KEY = process.env.EVOLUTION_API_KEY || 'farm_evolution_master_secret_2026';
const INSTANCE = 'default_instance';
const HEADERS = { apikey: API_KEY, 'Content-Type': 'application/json' };

function avatarColor(jid: string): string {
  const colors = ['#1B6648', '#7C3AED', '#0EA5E9', '#D97706', '#DC2626', '#059669', '#6366F1'];
  let hash = 0;
  for (let i = 0; i < jid.length; i++) hash = jid.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function extractLastMsgText(record: any): string {
  if (!record) return '';
  const msg = record.message || {};
  return (
    msg.conversation ||
    msg.extendedTextMessage?.text ||
    (msg.imageMessage ? '📷 Photo' : '') ||
    (msg.videoMessage ? '🎥 Vidéo' : '') ||
    (msg.audioMessage ? '🎵 Audio' : '') ||
    (msg.documentMessage ? '📄 Document' : '') ||
    (msg.stickerMessage ? '🎭 Sticker' : '') ||
    (msg.reactionMessage ? '❤️ Reaction' : '') ||
    (msg.locationMessage ? '📍 Localisation' : '') ||
    ''
  );
}

async function fetchLastMessage(remoteJid: string): Promise<{ text: string; ts: number }> {
  try {
    const res = await fetch(`${EVOLUTION_URL}/chat/findMessages/${INSTANCE}`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ where: { key: { remoteJid } }, limit: 1 }),
    });
    if (!res.ok) return { text: '', ts: 0 };
    const data = await res.json();
    const records: any[] = data?.messages?.records || [];
    if (records.length === 0) return { text: '', ts: 0 };
    const record = records[0];
    return {
      text: extractLastMsgText(record),
      ts: record.messageTimestamp || 0,
    };
  } catch {
    return { text: '', ts: 0 };
  }
}

export async function GET(req: Request) {
  try {
    // 1. Fetch chats, contacts and instance details in parallel
    const [chatsRes, contactsRes, instancesRes] = await Promise.all([
      fetch(`${EVOLUTION_URL}/chat/findChats/${INSTANCE}`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({}),
      }),
      fetch(`${EVOLUTION_URL}/chat/findContacts/${INSTANCE}`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({}),
      }),
      fetch(`${EVOLUTION_URL}/instance/fetchInstances`, {
        method: 'GET',
        headers: HEADERS,
      }).catch(() => null),
    ]);

    let instanceInfo: any = null;
    if (instancesRes && instancesRes.ok) {
      try {
        const instances = await instancesRes.json();
        const inst = Array.isArray(instances)
          ? instances.find((i: any) => i.name === INSTANCE) || instances[0]
          : null;
        if (inst) {
          const rawNumber = (inst.ownerJid || '').split('@')[0];
          instanceInfo = {
            profileName: inst.profileName || 'WhatsApp Business',
            ownerJid: inst.ownerJid || '',
            phone: rawNumber ? `+${rawNumber}` : '',
            connectionStatus: inst.connectionStatus || 'connected',
            profilePicUrl: inst.profilePicUrl || null,
          };
        }
      } catch {}
    }

    if (!chatsRes.ok) {
      return NextResponse.json({ chats: [], instance: instanceInfo });
    }

    const chats: any[] = await chatsRes.json();
    const contacts: any[] = contactsRes.ok ? await contactsRes.json() : [];

    // Build contacts map for profile pic & name lookup
    const contactsMap = new Map<string, any>();
    if (Array.isArray(contacts)) {
      contacts.forEach((c) => {
        if (c.remoteJid) contactsMap.set(c.remoteJid, c);
      });
    }

    // Filter out newsletters & broadcast
    const validChats = (Array.isArray(chats) ? chats : []).filter(
      (c) =>
        c.remoteJid &&
        !c.remoteJid.includes('@newsletter') &&
        !c.remoteJid.includes('status@broadcast')
    );

    // Sort by updatedAt descending (most recent first)
    validChats.sort((a, b) => {
      const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return tb - ta;
    });

    // Fetch last messages for top 25 chats in parallel (limit to avoid overloading)
    const TOP = Math.min(validChats.length, 25);
    const lastMessages = await Promise.all(
      validChats.slice(0, TOP).map((c) => fetchLastMessage(c.remoteJid))
    );

    const formattedChats = validChats.map((c, idx) => {
      const contactInfo = contactsMap.get(c.remoteJid) || {};
      const rawNumber = c.remoteJid.split('@')[0];
      const isGroup = c.remoteJid.includes('@g.us');
      const isLid = c.remoteJid.includes('@lid');

      // Name resolution: chat pushName > contacts pushName > formatted number
      let displayName =
        (c.pushName && c.pushName.trim()) ||
        (contactInfo.pushName && contactInfo.pushName.trim()) ||
        (isGroup ? 'WhatsApp Group' : isLid ? `~${rawNumber}` : `+${rawNumber}`);
      if (displayName.length > 32) displayName = displayName.slice(0, 30) + '…';

      const formattedPhone = isGroup
        ? 'WhatsApp Group'
        : isLid
        ? `~${rawNumber}`
        : `+${rawNumber}`;

      // Profile pic from chat > contacts map
      const pic = c.profilePicUrl || contactInfo.profilePicUrl || null;

      // Last message from fetched messages (top 25) or fallback
      const lastMsgData = idx < TOP ? lastMessages[idx] : null;
      const lastMsgText = lastMsgData?.text || '💬 Tap to open conversation';

      // Timestamp from last message or updatedAt
      let lastMsgTimeDisplay = 'Recent';
      const msgTs = lastMsgData?.ts;
      if (msgTs && msgTs > 0) {
        const d = new Date(msgTs * 1000);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffDays === 0) {
          lastMsgTimeDisplay = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
          lastMsgTimeDisplay = 'Yesterday';
        } else if (diffDays < 7) {
          lastMsgTimeDisplay = d.toLocaleDateString([], { weekday: 'short' });
        } else {
          lastMsgTimeDisplay = d.toLocaleDateString([], { day: '2-digit', month: 'short' });
        }
      } else if (c.updatedAt) {
        const d = new Date(c.updatedAt);
        lastMsgTimeDisplay = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      const numericalTs = (msgTs && msgTs > 0) ? (msgTs * 1000) : (c.updatedAt ? new Date(c.updatedAt).getTime() : 0);

      return {
        id: c.remoteJid,
        appId: 'whatsapp',
        name: displayName,
        handleOrPhone: formattedPhone,
        profilePicUrl: pic,
        lastMessage: lastMsgText,
        lastMessageTime: lastMsgTimeDisplay,
        time: lastMsgTimeDisplay,
        timestamp: numericalTs,
        unreadCount: c.unreadMessages || 0,
        avatarBg: avatarColor(c.remoteJid),
        statusText: isGroup ? 'Group' : 'WhatsApp',
        spend: '0 DA',
        messages: [],
      };
    });

    
    // Chronological sort: chats with latest message activity at the top
    formattedChats.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    // Deduplicate by name (specifically merging @lid and @s.whatsapp.net duplicates)
    const uniqueChatsMap = new Map<string, any>();
    const finalChats: any[] = [];

    for (const chat of formattedChats) {
      // Don't merge generic names or unnamed numbers
      const isGeneric = chat.name === 'WhatsApp Group' || chat.name.startsWith('~') || chat.name.startsWith('+');
      const key = isGeneric ? chat.id : chat.name;

      if (uniqueChatsMap.has(key)) {
        const existing = uniqueChatsMap.get(key);
        // Merge the IDs so the frontend can query both
        if (!existing.id.includes(chat.id)) {
          existing.id = existing.id + ',' + chat.id;
        }
        // Take the latest timestamp and message
        if ((chat.timestamp || 0) > (existing.timestamp || 0)) {
          existing.timestamp = chat.timestamp;
          existing.lastMessage = chat.lastMessage;
          existing.lastMessageTime = chat.lastMessageTime;
          existing.time = chat.time;
        }
        // Prefer non-generic handleOrPhone
        if (existing.handleOrPhone.startsWith('~') && !chat.handleOrPhone.startsWith('~')) {
          existing.handleOrPhone = chat.handleOrPhone;
        }
        // Prefer actual profile pic
        if (!existing.profilePicUrl && chat.profilePicUrl) {
          existing.profilePicUrl = chat.profilePicUrl;
        }
      } else {
        uniqueChatsMap.set(key, chat);
        finalChats.push(chat);
      }
    }

    // Sort one last time just in case merging changed the order
    finalChats.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return NextResponse.json({
      status: 'connected',
      count: finalChats.length,
      chats: finalChats,
      instance: instanceInfo,
    });

  } catch (err: any) {
    console.error('Error fetching WhatsApp chats:', err);
    return NextResponse.json({ chats: [], error: err.message }, { status: 500 });
  }
}
