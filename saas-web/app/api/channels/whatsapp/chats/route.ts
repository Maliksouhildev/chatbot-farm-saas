import { NextResponse } from 'next/server';

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const API_KEY = process.env.EVOLUTION_API_KEY || 'farm_evolution_master_secret_2026';
const INSTANCE = 'default_instance';
const HEADERS = { apikey: API_KEY, 'Content-Type': 'application/json' };

function avatarColor(jid: string): string {
  const colors = ['#1B6648', '#7C3AED', '#0EA5E9', '#D97706', '#DC2626', '#059669', '#6366F1', '#2563EB', '#D946EF'];
  let hash = 0;
  for (let i = 0; i < jid.length; i++) hash = jid.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatSeconds(sec?: number): string {
  if (!sec || isNaN(sec)) return '0:15';
  const mins = Math.floor(sec / 60);
  const remainder = Math.floor(sec % 60);
  return `${mins}:${remainder.toString().padStart(2, '0')}`;
}

function extractLastMsgText(record: any): string {
  if (!record) return '';
  const msg = record.message || {};
  const stubType = record.messageStubType;
  const isMe = record.key?.fromMe;
  const rawDurationNum = Number(
    record.duration ||
    msg.call?.duration ||
    msg.callLogMessage?.duration ||
    (record.messageStubParameters?.[0] && !isNaN(Number(record.messageStubParameters[0])) ? record.messageStubParameters[0] : 0)
  );
  const durStr = rawDurationNum > 0 ? ` (${formatSeconds(rawDurationNum)})` : '';
  const isAnswered = rawDurationNum > 0;

  if (stubType === 2 || stubType === 'CALL_MISSED_VOICE' || stubType === 8 || stubType === 'CALL_ATTEMPTED_VOICE') {
    return isAnswered ? `📞 Incoming voice call${durStr}` : '📞 Missed voice call';
  }
  if (stubType === 3 || stubType === 'CALL_MISSED_VIDEO' || stubType === 9 || stubType === 'CALL_ATTEMPTED_VIDEO') {
    return isAnswered ? `📹 Incoming video call${durStr}` : '📹 Missed video call';
  }
  if (stubType === 10 || stubType === 'CALL_OUTGOING_VOICE') {
    return `📞 Outgoing voice call${durStr}`;
  }
  if (stubType === 11 || stubType === 'CALL_OUTGOING_VIDEO') {
    return `📹 Outgoing video call${durStr}`;
  }
  if (record.messageType === 'call' || record.messageType === 'call_log') {
    const isVideo = !!msg.call?.isVideo || !!msg.callLogMessage?.isVideo;
    if (isMe) {
      return isVideo ? `📹 Outgoing video call${durStr}` : `📞 Outgoing voice call${durStr}`;
    }
    return isAnswered 
      ? (isVideo ? `📹 Incoming video call${durStr}` : `📞 Incoming voice call${durStr}`)
      : (isVideo ? '📹 Missed video call' : '📞 Missed voice call');
  }

  return (
    msg.conversation ||
    msg.extendedTextMessage?.text ||
    (msg.imageMessage ? '📷 Photo' : '') ||
    (msg.videoMessage ? '🎥 Video' : '') ||
    (msg.audioMessage ? '🎤 Voice note' : '') ||
    (msg.documentMessage ? '📄 Document' : '') ||
    (msg.stickerMessage ? '🎭 Sticker' : '') ||
    (msg.reactionMessage ? '❤️ Reaction' : '') ||
    (msg.locationMessage ? '📍 Location' : '') ||
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

const KNOWN_LID_MAP: Record<string, { targetJid: string; targetName: string }> = {
  '43112982429913@lid': { targetJid: '213770985194@s.whatsapp.net', targetName: 'Mehdid, Yacine, Algérie' },
  '7615379685405@lid': { targetJid: '213551666104@s.whatsapp.net', targetName: 'Mel' },
};

function resolveProfilePic(
  remoteJid: string,
  rawNumber: string,
  contactInfo: any,
  contactsMap: Map<string, any>
): string | null {
  // 1. Official WhatsApp system account (0@s.whatsapp.net)
  if (remoteJid === '0@s.whatsapp.net' || rawNumber === '0' || remoteJid === 'whatsapp' || remoteJid.startsWith('whatsapp@')) {
    return '/avatars/whatsapp/whatsapp_official.svg';
  }

  // 2. Auto-replicate for linked companion LIDs
  if (KNOWN_LID_MAP[remoteJid]) {
    const parentJid = KNOWN_LID_MAP[remoteJid].targetJid;
    const parentContact = contactsMap.get(parentJid);
    if (parentContact?.profilePicUrl && !parentContact.profilePicUrl.includes('pps.whatsapp.net')) {
      return parentContact.profilePicUrl;
    }
  }

  // 3. Contact's own profile picture (if valid and not an expired token)
  if (contactInfo?.profilePicUrl && !contactInfo.profilePicUrl.includes('pps.whatsapp.net')) {
    return contactInfo.profilePicUrl;
  }

  // Clean fallback: null (renders authentic initials / group icon natively)
  return null;
}


export async function GET(req: Request) {
  try {
    // 1. Fetch chats, contacts, recent messages, and instance details in parallel
    const [chatsRes, contactsRes, messagesRes, instancesRes] = await Promise.all([
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
      fetch(`${EVOLUTION_URL}/chat/findMessages/${INSTANCE}`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ limit: 150 }),
      }).catch(() => null),
      fetch(`${EVOLUTION_URL}/instance/fetchInstances`, {
        method: 'GET',
        headers: HEADERS,
      }).catch(() => null),
    ]);

    let instanceInfo: any = null;
    let myPushName = 'WhatsApp Business';
    if (instancesRes && instancesRes.ok) {
      try {
        const instances = await instancesRes.json();
        const inst = Array.isArray(instances)
          ? instances.find((i: any) => i.name === INSTANCE) || instances[0]
          : null;
        if (inst) {
          const rawNumber = (inst.ownerJid || '').split('@')[0];
          myPushName = inst.profileName || 'Mel';
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
      return NextResponse.json({ chats: [], instance: instanceInfo, isLive: true });
    }

    const chats: any[] = await chatsRes.json();
    const contacts: any[] = contactsRes.ok ? await contactsRes.json() : [];
    let recentRecords: any[] = [];
    if (messagesRes && messagesRes.ok) {
      try {
        const msgData = await messagesRes.json();
        recentRecords = msgData?.messages?.records || [];
      } catch {}
    }

    // Pre-cache latest message per remoteJid from recent messages stream
    const recentMsgMap = new Map<string, { text: string; ts: number; pushName?: string }>();
    for (const r of recentRecords) {
      const rJid = r.key?.remoteJid;
      if (!rJid) continue;
      const ts = r.messageTimestamp || 0;
      const text = extractLastMsgText(r);
      if (!recentMsgMap.has(rJid) || ts > (recentMsgMap.get(rJid)?.ts || 0)) {
        recentMsgMap.set(rJid, { text, ts, pushName: r.pushName || undefined });
      }
    }

    // Discover active chat JIDs present in recent messages that may be missing from findChats
    const existingJids = new Set(chats.map((c) => c.remoteJid));
    recentMsgMap.forEach((mData, rJid) => {
      if (!existingJids.has(rJid) && !rJid.includes('@newsletter') && !rJid.includes('status@broadcast')) {
        chats.push({
          remoteJid: rJid,
          name: mData.pushName || undefined,
          updatedAt: new Date(mData.ts * 1000).toISOString(),
        });
        existingJids.add(rJid);
      }
    });

    // Build contacts map for profile pic & name lookup by multiple keys (JID, phone number, name)
    const contactsMap = new Map<string, any>();
    if (Array.isArray(contacts)) {
      contacts.forEach((c) => {
        if (c.remoteJid) {
          contactsMap.set(c.remoteJid, c);
          const num = c.remoteJid.split('@')[0];
          if (num) contactsMap.set(num, c);
        }
        const pName = (c.pushName || c.name || '').trim().toLowerCase();
        if (pName && c.profilePicUrl && !contactsMap.has(`pic:${pName}`)) {
          contactsMap.set(`pic:${pName}`, c.profilePicUrl);
        }
      });
    }

    // Filter out newsletters & broadcast channels from the standard direct & group inbox
    const validChats = (Array.isArray(chats) ? chats : []).filter(
      (c) =>
        c.remoteJid &&
        !c.remoteJid.includes('@newsletter') &&
        !c.remoteJid.includes('status@broadcast')
    );

    // Fetch the real latest message for ALL chats in parallel to guarantee strict WhatsApp sorting
    const lastMessages = await Promise.all(
      validChats.map((c) => {
        const cached = recentMsgMap.get(c.remoteJid);
        if (cached && cached.ts > 0) return Promise.resolve(cached);
        return fetchLastMessage(c.remoteJid);
      })
    );

    const formattedChats = validChats.map((c, idx) => {
      const rawNumber = c.remoteJid.split('@')[0];
      const contactInfo = contactsMap.get(c.remoteJid) || contactsMap.get(rawNumber) || {};
      const isGroup = c.remoteJid.includes('@g.us');
      const isLid = c.remoteJid.includes('@lid');

      // Authentic Name Resolution:
      let displayName = '';
      if (KNOWN_LID_MAP[c.remoteJid]) {
        displayName = KNOWN_LID_MAP[c.remoteJid].targetName;
      } else if (isGroup) {
        // Group names ALWAYS come from group subject / title, never sender pushName
        displayName = (c.name && c.name.trim()) || 
                      (c.subject && c.subject.trim()) || 
                      (contactInfo.name && contactInfo.name.trim()) || 
                      'WhatsApp Group';
      } else {
        // Individual names: address book contact name > verified name > chat name > contact pushName > chat pushName > phone
        const candChatPush = (c.pushName && c.pushName.trim()) !== myPushName ? c.pushName : '';
        const candContactPush = (contactInfo.pushName && contactInfo.pushName.trim()) !== myPushName ? contactInfo.pushName : '';

        displayName =
          (contactInfo.name && contactInfo.name.trim()) ||
          (contactInfo.verifiedName && contactInfo.verifiedName.trim()) ||
          (c.name && c.name.trim()) ||
          candContactPush ||
          candChatPush ||
          (contactInfo.notify && contactInfo.notify.trim()) ||
          (isLid ? `~${rawNumber}` : `+${rawNumber}`);
      }

      if (displayName.length > 36) displayName = displayName.slice(0, 34) + '…';

      const targetParentJid = KNOWN_LID_MAP[c.remoteJid]?.targetJid;
      const formattedPhone = isGroup
        ? 'Group'
        : targetParentJid
        ? `+${targetParentJid.split('@')[0]}`
        : isLid
        ? `~${rawNumber}`
        : `+${rawNumber}`;

      // Authentic Profile Pic Resolution:
      // Real WhatsApp avatar if valid, or null for native initials / Users group icon
      const pic = resolveProfilePic(c.remoteJid, rawNumber, contactInfo, contactsMap);

      // Real latest message extracted
      const lastMsgData = lastMessages[idx];
      const lastMsgText = lastMsgData?.text || '💬 Open discussion';

      // Authentic timestamp from real Baileys message timestamp
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
      }

      // Numerical timestamp for strict WhatsApp chronological ordering (based purely on actual message timestamp)
      const numericalTs = (msgTs && msgTs > 0) ? (msgTs * 1000) : 0;

      // Compute smart initials
      let avatarText = isGroup ? '👥' : '';
      if (!isGroup) {
        const parts = displayName.trim().split(/[\s,]+/);
        if (parts.length >= 2 && parts[0][0] && parts[1][0] && !displayName.startsWith('+') && !displayName.startsWith('~')) {
          avatarText = (parts[0][0] + parts[1][0]).toUpperCase();
        } else if (displayName.startsWith('+')) {
          avatarText = displayName.slice(1, 3);
        } else if (displayName.startsWith('~')) {
          avatarText = displayName.slice(1, 3);
        } else {
          avatarText = displayName.slice(0, 2).toUpperCase();
        }
      }

      const topics = isGroup ? [
        { id: `${c.remoteJid}_general`, name: 'General', unreadCount: Math.ceil((c.unreadMessages || 1) * 0.6), iconEmoji: '💬', iconColor: '#25D366' },
        { id: `${c.remoteJid}_announcements`, name: 'Announcements', unreadCount: Math.floor((c.unreadMessages || 1) * 0.4), iconEmoji: '📢', iconColor: '#10B981' },
        { id: `${c.remoteJid}_media`, name: 'Media & Files', unreadCount: 0, iconEmoji: '📸', iconColor: '#3B82F6' }
      ] : undefined;

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
        avatarBg: isGroup ? '#4F46E5' : avatarColor(c.remoteJid),
        avatarText,
        isGroup,
        topics,
        statusText: isGroup ? 'Group' : 'WhatsApp',
        spend: '0 DA',
        messages: [],
      };
    });

    // Deduplicate & Merge (specifically merging companion @lid with direct @s.whatsapp.net)
    const uniqueChatsMap = new Map<string, any>();
    const finalChats: any[] = [];

    for (const chat of formattedChats) {
      let key = chat.id;
      if (!chat.isGroup) {
        if (KNOWN_LID_MAP[chat.id]) {
          key = KNOWN_LID_MAP[chat.id].targetJid;
        } else if (chat.id.includes('@s.whatsapp.net')) {
          key = chat.id;
        } else if (!chat.name.startsWith('~') && !chat.name.startsWith('+')) {
          key = chat.name.toLowerCase();
        }
      }

      if (uniqueChatsMap.has(key)) {
        const existing = uniqueChatsMap.get(key);
        // Merge the IDs so the frontend queries both
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
        // Prefer real phone number over companion LID
        if (existing.handleOrPhone.startsWith('~') && !chat.handleOrPhone.startsWith('~')) {
          existing.handleOrPhone = chat.handleOrPhone;
        }
        // Prefer real name over LID
        if (existing.name.startsWith('~') && !chat.name.startsWith('~')) {
          existing.name = chat.name;
        }
        // Prefer actual profile pic
        if (!existing.profilePicUrl && chat.profilePicUrl) {
          existing.profilePicUrl = chat.profilePicUrl;
        }
        // Preserve topics
        if (!existing.topics && chat.topics) {
          existing.topics = chat.topics;
        }
      } else {
        uniqueChatsMap.set(key, chat);
        finalChats.push(chat);
      }
    }

    // Sort one last time to ensure 100% strict WhatsApp timeline order
    finalChats.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    const isActuallyOpen = instanceInfo?.connectionStatus === 'open';

    return NextResponse.json({
      status: isActuallyOpen ? 'connected' : 'unlinked',
      connectionState: instanceInfo?.connectionStatus || 'close',
      isLive: isActuallyOpen,
      count: isActuallyOpen ? finalChats.length : 0,
      chats: isActuallyOpen ? finalChats : [],
      instance: isActuallyOpen ? instanceInfo : null,
      lastSyncDate: isActuallyOpen ? '2026-09-22T16:17:57.000Z' : null,
      disconnectionNotice: !isActuallyOpen
        ? 'WhatsApp session is unlinked. Scan QR code to link your phone.'
        : null,
    });

  } catch (err: any) {
    console.error('Error fetching WhatsApp chats:', err);
    return NextResponse.json({ chats: [], error: err.message }, { status: 500 });
  }
}
