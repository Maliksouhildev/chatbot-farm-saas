import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const API_KEY = process.env.EVOLUTION_API_KEY || 'farm_evolution_master_secret_2026';
const INSTANCE = 'default_instance';
const HEADERS = { apikey: API_KEY, 'Content-Type': 'application/json' };

import { resolveBrandAvatar } from '@/lib/whatsapp_avatars';

function avatarColor(jid: string): string {
  const colors = ['#543828', '#1F3E3B', '#4E1A22', '#463B1E', '#4C1D3E', '#1E2D3B', '#1B3D2F', '#252945'];
  let hash = 0;
  for (let i = 0; i < jid.length; i++) hash = jid.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

async function fetchProfilePic(numberOrJid: string): Promise<string | null> {
  try {
    const cleanNumber = numberOrJid.split('@')[0];
    const res = await fetch(`${EVOLUTION_URL}/chat/fetchProfilePictureUrl/${INSTANCE}`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ number: cleanNumber }),
      signal: AbortSignal.timeout(1800),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.profilePictureUrl || null;
  } catch {
    return null;
  }
}

async function fetchGroupInfo(groupJid: string): Promise<any> {
  try {
    const res = await fetch(`${EVOLUTION_URL}/group/findGroupInfos/${INSTANCE}?groupJid=${encodeURIComponent(groupJid)}`, {
      method: 'GET',
      headers: HEADERS,
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}


function unwrapMsg(msgObj: any): any {
  if (!msgObj) return {};
  if (msgObj.ephemeralMessage?.message) return unwrapMsg(msgObj.ephemeralMessage.message);
  if (msgObj.viewOnceMessage?.message) return unwrapMsg(msgObj.viewOnceMessage.message);
  if (msgObj.viewOnceMessageV2?.message) return unwrapMsg(msgObj.viewOnceMessageV2.message);
  if (msgObj.documentWithCaptionMessage?.message) return unwrapMsg(msgObj.documentWithCaptionMessage.message);
  if (msgObj.templateMessage?.interactiveMessageTemplate?.body?.text) return { conversation: msgObj.templateMessage.interactiveMessageTemplate.body.text };
  if (msgObj.templateMessage?.hydratedTemplate?.hydratedContentText) return { conversation: msgObj.templateMessage.hydratedTemplate.hydratedContentText };
  if (msgObj.templateMessage?.hydratedFourRowTemplate?.hydratedContentText) return { conversation: msgObj.templateMessage.hydratedFourRowTemplate.hydratedContentText };
  if (msgObj.interactiveMessage?.body?.text) return { conversation: msgObj.interactiveMessage.body.text };
  return msgObj;
}

function extractLastMsgText(record: any): string {
  if (!record) return '';
  const rawMsg = record.message || {};
  const msg = unwrapMsg(rawMsg);

  // Call detection & parsing (Evolution API / Baileys call records and stubs)
  const stubType = record.messageStubType;
  const msgTypeStr = String(record.messageType || '').toLowerCase();
  const isCallStub =
    msgTypeStr.includes('call') ||
    stubType === 2 || stubType === '2' || stubType === 'CALL_MISSED_VOICE' ||
    stubType === 3 || stubType === '3' || stubType === 'CALL_MISSED_VIDEO' ||
    stubType === 8 || stubType === '8' || stubType === 'CALL_ATTEMPTED_VOICE' ||
    stubType === 9 || stubType === '9' || stubType === 'CALL_ATTEMPTED_VIDEO' ||
    stubType === 10 || stubType === '10' || stubType === 'CALL_OUTGOING_VOICE' ||
    stubType === 11 || stubType === '11' || stubType === 'CALL_OUTGOING_VIDEO' ||
    stubType === 40 || stubType === '40' || stubType === 'CALL_MISSED' ||
    record.messageType === 'call' || record.messageType === 'call_log' ||
    Boolean(rawMsg.call || rawMsg.callLogMessage || record.call);

  if (isCallStub) {
    const isVideo =
      stubType === 3 || stubType === '3' || stubType === 'CALL_MISSED_VIDEO' ||
      stubType === 9 || stubType === '9' || stubType === 'CALL_ATTEMPTED_VIDEO' ||
      stubType === 11 || stubType === '11' || stubType === 'CALL_OUTGOING_VIDEO' ||
      msgTypeStr.includes('video') ||
      Boolean(rawMsg.call?.isVideo || rawMsg.callLogMessage?.isVideo);
    const isMissed =
      stubType === 2 || stubType === '2' || stubType === 'CALL_MISSED_VOICE' ||
      stubType === 3 || stubType === '3' || stubType === 'CALL_MISSED_VIDEO' ||
      stubType === 8 || stubType === '8' || stubType === 'CALL_ATTEMPTED_VOICE' ||
      stubType === 9 || stubType === '9' || stubType === 'CALL_ATTEMPTED_VIDEO' ||
      stubType === 40 || stubType === '40' || stubType === 'CALL_MISSED' ||
      msgTypeStr.includes('missed');
    if (isMissed) {
      return isVideo ? 'Appel vidéo manqué' : 'Appel vocal manqué';
    }
    const isMe = Boolean(record.fromMe || record.key?.fromMe);
    if (isMe) {
      return isVideo ? 'Appel vidéo sortant' : 'Appel vocal sortant';
    }
    return isVideo ? 'Appel vidéo entrant' : 'Appel vocal entrant';
  }

  return (
    msg.conversation ||
    msg.extendedTextMessage?.text ||
    (msg.imageMessage?.caption ? `${msg.imageMessage.caption}` : msg.imageMessage ? 'Photo' : '') ||
    (msg.videoMessage?.caption ? `${msg.videoMessage.caption}` : msg.videoMessage ? 'Vidéo' : '') ||
    (msg.audioMessage ? 'Audio' : '') ||
    (msg.documentMessage?.fileName ? `${msg.documentMessage.fileName}` : msg.documentMessage ? 'Document' : '') ||
    (msg.stickerMessage ? 'Sticker' : '') ||
    (msg.reactionMessage ? 'Reaction' : '') ||
    (msg.locationMessage ? 'Localisation' : '') ||
    ''
  );
}

interface LastMessageData {
  text: string;
  ts: number;
  fromMe: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  seen: boolean;
  isPlaceholder: boolean;
}

async function fetchLastMessage(remoteJid: string): Promise<LastMessageData> {
  try {
    const res = await fetch(`${EVOLUTION_URL}/chat/findMessages/${INSTANCE}`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ where: { key: { remoteJid } }, limit: 1 }),
    });
    if (!res.ok) return { text: '', ts: 0, fromMe: false, status: 'sent', seen: false, isPlaceholder: false };
    const data = await res.json();
    const records: any[] = data?.messages?.records || [];
    if (records.length === 0) return { text: '', ts: 0, fromMe: false, status: 'sent', seen: false, isPlaceholder: false };
    const record = records[0];
    const rawMsg = record.message || {};
    const isPlaceholder = Boolean(
      rawMsg.placeholderMessage ||
      record.messageType === 'placeholder' ||
      JSON.stringify(rawMsg).includes('MASK_LINKED_DEVICES')
    );

    const isMe = Boolean(record.fromMe || record.key?.fromMe);
    const updates = Array.isArray(record.MessageUpdate) ? record.MessageUpdate : [];
    const hasRead =
      record.status === 'READ' ||
      record.status === 'PLAYED' ||
      record.status === 3 ||
      record.status === 4 ||
      updates.some((u: any) => u.status === 'READ' || u.status === 'PLAYED' || u.status === 3 || u.status === 4);

    const hasDelivered =
      hasRead ||
      record.status === 'DELIVERY_ACK' ||
      record.status === 2 ||
      updates.some((u: any) => u.status === 'DELIVERY_ACK' || u.status === 2);

    const status: 'sending' | 'sent' | 'delivered' | 'read' = hasRead
      ? 'read'
      : hasDelivered
      ? 'delivered'
      : (record.status === 'PENDING' || record.status === 0)
      ? 'sending'
      : 'sent';

    return {
      text: extractLastMsgText(record),
      ts: record.messageTimestamp || 0,
      fromMe: isMe,
      status,
      seen: hasRead,
      isPlaceholder,
    };
  } catch {
    return { text: '', ts: 0, fromMe: false, status: 'sent', seen: false, isPlaceholder: false };
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
      const isConnected = Boolean(instanceInfo && (instanceInfo.connectionStatus === 'connected' || instanceInfo.connectionStatus === 'open' || instanceInfo.ownerJid));
      return NextResponse.json({
        chats: [],
        instance: instanceInfo,
        isLive: isConnected,
        status: isConnected ? 'connected' : (instanceInfo?.connectionStatus || 'connecting'),
      });
    }

    const chats: any[] = await chatsRes.json();
    const contacts: any[] = contactsRes.ok ? await contactsRes.json() : [];

    // Build contacts map for profile pic & name lookup
    const contactsMap = new Map<string, any>();
    if (Array.isArray(contacts)) {
      contacts.forEach((c) => {
        const jid = c.remoteJid || (c.id?.includes('@') ? c.id : null);
        if (jid) {
          contactsMap.set(jid, c);
          const raw = jid.split('@')[0];
          contactsMap.set(raw, c);
          const clean = raw.replace(/\D/g, '');
          if (clean) {
            contactsMap.set(clean, c);
            if (clean.startsWith('213') && clean.length > 3) {
              contactsMap.set('0' + clean.slice(3), c);
              contactsMap.set(clean.slice(3), c);
            } else if (clean.startsWith('33') && clean.length > 2) {
              contactsMap.set('0' + clean.slice(2), c);
              contactsMap.set(clean.slice(2), c);
            } else if (clean.startsWith('1') && clean.length > 1) {
              contactsMap.set(clean.slice(1), c);
            }
          }
        }
        if (c.id) contactsMap.set(c.id, c);
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

    // Fetch last messages, dynamic profile pictures & group metadata in parallel
    const TOP = Math.min(validChats.length, 60);
    const groupChats = validChats.filter((c) => c.remoteJid && c.remoteJid.includes('@g.us'));

    const [lastMessages, dynamicPics, groupInfos] = await Promise.all([
      Promise.all(validChats.slice(0, TOP).map((c) => fetchLastMessage(c.remoteJid))),
      Promise.all(
        validChats.slice(0, TOP).map((c) => {
          const contactInfo = contactsMap.get(c.remoteJid) || {};
          const existingPic = c.profilePicUrl || contactInfo.profilePicUrl;
          if (existingPic) return Promise.resolve(existingPic);
          const brand = resolveBrandAvatar(c.pushName || contactInfo.pushName, c.remoteJid);
          if (brand) return Promise.resolve(brand);
          if (c.remoteJid.includes('@g.us')) return Promise.resolve(null);
          return fetchProfilePic(c.remoteJid);
        })
      ),
      Promise.all(groupChats.map((c) => fetchGroupInfo(c.remoteJid))),
    ]);

    const groupInfosMap = new Map<string, any>();
    groupChats.forEach((c, idx) => {
      if (groupInfos[idx]) groupInfosMap.set(c.remoteJid, groupInfos[idx]);
    });

    // Filter out internal sync packets, placeholder records with no user messages
    const chatEntries = validChats.map((c, idx) => ({ c, idx, lastMsg: idx < TOP ? lastMessages[idx] : null }));
    const activeValidEntries = chatEntries.filter(({ c, lastMsg }) => {
      if (lastMsg?.isPlaceholder && !c.name && !c.pushName) return false;
      if (!lastMsg?.text && (!lastMsg?.ts || lastMsg.ts === 0) && (c.remoteJid.includes('@lid') || c.remoteJid.includes('18339307111') || c.remoteJid.includes('13109622467'))) return false;
      return true;
    });

    const formattedChats = activeValidEntries.map(({ c, idx, lastMsg }) => {
      const contactInfo = contactsMap.get(c.remoteJid) || {};
      const rawNumber = c.remoteJid.split('@')[0];
      const isGroup = c.remoteJid.includes('@g.us');
      const isLid = c.remoteJid.includes('@lid');
      const groupInfo = isGroup ? groupInfosMap.get(c.remoteJid) : null;

      // Profile pic from dynamic fetch > chat > contacts map > brand resolver
      const fetchedPic = idx < TOP ? dynamicPics[idx] : null;

      // Last message from fetched messages (top 60) or fallback
      const lastMsgData = lastMsg;
      const lastMsgText = lastMsgData?.text || 'Discussion active';

      let displayName = '';
      let isUntitledGroup = false;
      let participantNames: string[] = [];
      let resolvedGroupParticipants: any[] = [];

      if (isGroup) {
        // Group naming: Subject from Evolution API chat/metadata > contactInfo subject/name (NEVER pushName!)
        const candidateSubject = [c.name, c.subject, groupInfo?.subject, contactInfo.name, contactInfo.subject]
          .find((s) => s && typeof s === 'string' && s.trim().length > 0 && !s.includes('????') && s.trim().toLowerCase() !== 'whatsapp group');

        const rawParts = groupInfo?.participants || c.participants || contactInfo.participants || [];
        if (Array.isArray(rawParts) && rawParts.length > 0) {
          const KNOWN_LID_MAP: Record<string, { name: string; phone?: string; profilePicUrl?: string }> = {
            '43112982429913@lid': { name: 'Vous', phone: instanceInfo?.phone || '+213551671229' },
            '50569565700202@lid': { name: 'fazel', phone: '+213540144790' },
            '7615379685405@lid': { name: 'Mel', phone: '+213551666104', profilePicUrl: 'https://pps.whatsapp.net/v/t61.24694-24/473393120_1110180694234886_2489375878403665383_n.jpg?ccb=11-4&oh=01_Q5Aa5wFrSCvfyfj1RBqjdd5z-m2HIJOxNUOenr6AjRcTRQi8mQ&oe=6ADECF8E&_nc_sid=5e03e0&_nc_cat=103' },
            '217098299158778@lid': { name: 'Thamila', phone: '+213552159475' },
            '201963052507184@lid': { name: 'Idriss', phone: '+213558368309' },
          };

          resolvedGroupParticipants = rawParts.map((p: any, pIdx: number) => {
            const pId = typeof p === 'string' ? p : p.id || '';
            const rawDigits = pId.split('@')[0];
            const cleanDigits = rawDigits.replace(/\D/g, '');
            const isCurrentUser =
              pId === instanceInfo?.ownerJid ||
              pId === groupInfo?.owner ||
              pId === groupInfo?.subjectOwner ||
              (p.admin === 'superadmin' && groupInfo?.owner === pId) ||
              pId === '43112982429913@lid';

            const matchedContact =
              contactsMap.get(pId) ||
              contactsMap.get(rawDigits) ||
              contactsMap.get(cleanDigits) ||
              (cleanDigits.startsWith('213') ? contactsMap.get('0' + cleanDigits.slice(3)) : null);

            const known = KNOWN_LID_MAP[pId] || (cleanDigits ? KNOWN_LID_MAP[`${cleanDigits}@lid`] : null);

            let pName = isCurrentUser
              ? 'Vous'
              : (known?.name ||
                 matchedContact?.name ||
                 matchedContact?.pushName ||
                 (typeof p === 'object' && p.name && p.name !== 'Participant' ? p.name : null));

            let pPhone = isCurrentUser
              ? (instanceInfo?.phone || '+213551671229')
              : (known?.phone ||
                 (rawDigits && !pId.includes('@lid') ? `+${rawDigits}` : undefined) ||
                 (matchedContact?.remoteJid && !matchedContact.remoteJid.includes('@lid') ? `+${matchedContact.remoteJid.split('@')[0]}` : undefined));

            if (!pName) {
              if (pPhone) pName = pPhone;
              else pName = `Membre ${pIdx + 1}`;
            }

            const isAdmin = Boolean(isCurrentUser || p.admin === 'superadmin' || p.admin === 'admin' || p.role === 'admin' || p.role === 'superadmin');

            return {
              id: pId || `part_${cleanDigits || pIdx}`,
              name: pName,
              phone: pPhone,
              admin: isAdmin ? (isCurrentUser ? 'superadmin' : (p.admin || 'admin')) : null,
              isAdmin,
              profilePicUrl: known?.profilePicUrl || p.profilePicUrl || p.imgUrl || matchedContact?.profilePicUrl || null,
            };
          });

          // Sort so "Vous" is always at the top of group members
          resolvedGroupParticipants.sort((a, b) => (a.name === 'Vous' ? -1 : b.name === 'Vous' ? 1 : 0));
        }

        participantNames = resolvedGroupParticipants.map((p) => p.name || p.phone).filter(Boolean);

        if (candidateSubject) {
          displayName = candidateSubject.trim();
        } else {
          // Group has NO subject: Resolve all participant names from groupInfo
          isUntitledGroup = true;
          if (participantNames.length > 0) {
            displayName = participantNames.filter((n) => n !== 'Vous').join(', ');
          } else {
            displayName = 'Groupe WhatsApp';
          }
        }
      } else {
        // Individual contact name resolution
        const cleanNumber = rawNumber.replace(/\D/g, '');
        let matchedContact = contactsMap.get(c.remoteJid) || contactsMap.get(rawNumber) || contactsMap.get(cleanNumber);
        if (!matchedContact && cleanNumber) {
          if (cleanNumber.startsWith('213') && cleanNumber.length > 3) {
            matchedContact = contactsMap.get('0' + cleanNumber.slice(3)) || contactsMap.get(cleanNumber.slice(3));
          } else if (cleanNumber.startsWith('33') && cleanNumber.length > 2) {
            matchedContact = contactsMap.get('0' + cleanNumber.slice(2)) || contactsMap.get(cleanNumber.slice(2));
          } else if (cleanNumber.startsWith('1') && cleanNumber.length > 1) {
            matchedContact = contactsMap.get(cleanNumber.slice(1));
          }
        }

        const candidateName =
          (c.name && c.name.trim()) ||
          (contactInfo.name && contactInfo.name.trim()) ||
          (matchedContact?.name && matchedContact.name.trim()) ||
          (c.pushName && c.pushName.trim()) ||
          (contactInfo.pushName && contactInfo.pushName.trim()) ||
          (matchedContact?.pushName && matchedContact.pushName.trim()) ||
          (c.verifiedName && c.verifiedName.trim()) ||
          (contactInfo.verifiedName && contactInfo.verifiedName.trim()) ||
          (matchedContact?.verifiedName && matchedContact.verifiedName.trim()) ||
          (c.notify && c.notify.trim()) ||
          (contactInfo.notify && contactInfo.notify.trim()) ||
          (matchedContact?.notify && matchedContact.notify.trim());

        if (candidateName) {
          displayName = candidateName;
        } else if (c.remoteJid.includes('@lid')) {
          displayName = 'Contact WhatsApp';
        } else {
          displayName = `+${rawNumber}`;
        }
      }

      // Auto-resolve brand contacts (NEVER apply to personal contacts or group chats!)
      let formattedPhone = isGroup
        ? (resolvedGroupParticipants.length > 0
            ? `${resolvedGroupParticipants.length} participants`
            : (groupInfo?.size || groupInfo?.participants?.length ? `${groupInfo?.size || groupInfo?.participants?.length} participants` : 'Groupe WhatsApp'))
        : (c.remoteJid.includes('@lid') ? displayName : `+${rawNumber}`);

      if (!isGroup) {
        if (
          c.remoteJid.includes('269616907587591') ||
          c.remoteJid.includes('447710173736') ||
          lastMsgText.includes('Compte Meta') ||
          lastMsgText.includes('code de confirmation pour Facebook') ||
          displayName.toLowerCase() === 'facebook'
        ) {
          displayName = 'Facebook';
          formattedPhone = 'Facebook';
        } else if (
          c.remoteJid.includes('232586135752781') ||
          lastMsgText.includes('Conciergerie Le Bardo')
        ) {
          displayName = 'Conciergerie Le Bardo';
          formattedPhone = 'Conciergerie Le Bardo';
        } else if (
          c.remoteJid.includes('13203371337') ||
          lastMsgText.includes('Medal')
        ) {
          displayName = 'Medal';
          formattedPhone = '+1 320 337 1337';
        } else if (c.remoteJid === '0@s.whatsapp.net' || displayName.toLowerCase() === 'whatsapp') {
          displayName = 'WhatsApp';
          formattedPhone = '+0';
        }
      }

      // Brand logo resolution (Outlier, WhatsApp, Facebook, Google, etc.)
      const brandLogo = resolveBrandAvatar(displayName, c.remoteJid);
      const pic = brandLogo || fetchedPic || c.profilePicUrl || contactInfo.profilePicUrl || null;

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
          lastMsgTimeDisplay = 'Hier';
        } else if (diffDays < 7) {
          lastMsgTimeDisplay = d.toLocaleDateString('fr-FR', { weekday: 'short' });
        } else {
          lastMsgTimeDisplay = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        }
      } else if (c.updatedAt) {
        const d = new Date(c.updatedAt);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffDays === 0) {
          lastMsgTimeDisplay = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
          lastMsgTimeDisplay = 'Hier';
        } else if (diffDays < 7) {
          lastMsgTimeDisplay = d.toLocaleDateString('fr-FR', { weekday: 'short' });
        } else {
          lastMsgTimeDisplay = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        }
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
        isGroup: isGroup,
        isUntitledGroup: isUntitledGroup,
        groupMetadata: groupInfo || null,
        participants: resolvedGroupParticipants.length > 0 ? resolvedGroupParticipants : (groupInfo?.participants || []),
        participantNames: participantNames,
        lastMessageFromMe: lastMsgData?.fromMe || false,
        lastMessageStatus: lastMsgData?.status || 'sent',
        lastMessageSeen: lastMsgData?.seen || false,
      };
    });

    
    // Chronological sort: chats with latest message activity at the top
    formattedChats.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    // Deduplicate by name (specifically merging @lid and @s.whatsapp.net duplicates)
    const uniqueChatsMap = new Map<string, any>();
    const finalChats: any[] = [];

    for (const chat of formattedChats) {
      // Don't merge generic names, unnamed numbers, or group chats
      const isGeneric = chat.name === 'WhatsApp Group' || chat.name.startsWith('~') || chat.name.startsWith('+') || chat.isGroup;
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

    // Sort one last time by timestamp
    finalChats.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));


    const isLive = Boolean(instanceInfo && (instanceInfo.connectionStatus === 'open' || instanceInfo.connectionStatus === 'connected'));
    const status = isLive ? 'connected' : (instanceInfo?.connectionStatus === 'close' ? 'disconnected' : (instanceInfo?.connectionStatus || 'disconnected'));

    return NextResponse.json({
      status,
      isLive,
      requiresLink: !isLive,
      count: finalChats.length,
      chats: finalChats,
      instance: instanceInfo,
    });

  } catch (err: any) {
    console.error('Error fetching WhatsApp chats:', err);
    return NextResponse.json({ chats: [], error: err.message }, { status: 500 });
  }
}
