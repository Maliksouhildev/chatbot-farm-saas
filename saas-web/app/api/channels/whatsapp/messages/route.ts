import { NextResponse } from 'next/server';
import { PAIRED_CHATS_BY_APP } from '@/lib/mock_chats';

function formatSeconds(sec?: number): string {
  if (!sec || isNaN(sec)) return '0:15';
  const mins = Math.floor(sec / 60);
  const remainder = Math.floor(sec % 60);
  return `${mins}:${remainder.toString().padStart(2, '0')}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const remoteJidParam = searchParams.get('remoteJid');
    const instance = searchParams.get('instance') || 'default_instance';

    if (!remoteJidParam) {
      return NextResponse.json({ messages: [] });
    }

    const evolutionUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    const apiKey = process.env.EVOLUTION_API_KEY || 'farm_evolution_master_secret_2026';
    const headers = { apikey: apiKey, 'Content-Type': 'application/json' };

    // Support comma-separated merged JIDs (e.g. phone @s.whatsapp.net + lid @lid or group JID)
    let jids = remoteJidParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (jids.length === 0) {
      return NextResponse.json({ messages: [] });
    }

    // If only one JID was provided, check if WhatsApp chats registry has an associated paired LID or phone JID
    if (jids.length === 1) {
      try {
        const chatsUrl = new URL('/api/channels/whatsapp/chats', req.url);
        const chatsRes = await fetch(chatsUrl.toString());
        if (chatsRes.ok) {
          const chatsData = await chatsRes.json();
          const target = jids[0];
          const targetDigits = target.replace(/\D/g, '');
          const foundChat = (chatsData.chats || []).find((c: any) => {
            if (c.id === target || c.id.split(',').includes(target)) return true;
            if (targetDigits && c.handleOrPhone && c.handleOrPhone.replace(/\D/g, '') === targetDigits) return true;
            return false;
          });
          if (foundChat && foundChat.id) {
            jids = foundChat.id.split(',').map((j: string) => j.trim()).filter(Boolean);
          }
        }
      } catch {}
    }

    // Query messages for each JID using Evolution API v2 Prisma syntax: { where: { key: { remoteJid } } }
    const recordsMap = new Map<string, any>();

    await Promise.all(
      jids.map(async (jid) => {
        try {
          const res = await fetch(`${evolutionUrl}/chat/findMessages/${instance}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              where: {
                key: {
                  remoteJid: jid
                }
              },
              limit: 100
            })
          });

          if (!res.ok) return;
          const data = await res.json();
          const records = data?.messages?.records || [];

          for (const r of records) {
            const id = r.id || r.key?.id;
            if (id && !recordsMap.has(id)) {
              recordsMap.set(id, r);
            }
          }
        } catch (fetchErr) {
          console.error(`Error fetching messages for JID ${jid}:`, fetchErr);
        }
      })
    );

    const records = Array.from(recordsMap.values());

    // Sort chronologically (oldest first, newest last)
    records.sort((a: any, b: any) => (a.messageTimestamp || 0) - (b.messageTimestamp || 0));

    // Filter out internal sync packets, reactions, and completely empty messages
    const validRecords = records.filter((r: any) => {
      const msgObj = r.message || {};
      const stubType = r.messageStubType;
      const msgTypeStr = String(r.messageType || '').toLowerCase();

      // Always keep calls
      const isCallStub =
        msgTypeStr.includes('call') ||
        stubType === 2 || stubType === '2' || stubType === 'CALL_MISSED_VOICE' ||
        stubType === 3 || stubType === '3' || stubType === 'CALL_MISSED_VIDEO' ||
        stubType === 8 || stubType === '8' || stubType === 'CALL_ATTEMPTED_VOICE' ||
        stubType === 9 || stubType === '9' || stubType === 'CALL_ATTEMPTED_VIDEO' ||
        stubType === 10 || stubType === '10' || stubType === 'CALL_OUTGOING_VOICE' ||
        stubType === 11 || stubType === '11' || stubType === 'CALL_OUTGOING_VIDEO' ||
        r.messageType === 'call' || r.messageType === 'call_log';
      if (isCallStub) return true;

      // Keep media
      if (r.messageType === 'imageMessage' || !!msgObj.imageMessage) return true;
      if (r.messageType === 'videoMessage' || !!msgObj.videoMessage) return true;
      if (r.messageType === 'audioMessage' || !!msgObj.audioMessage) return true;
      if (r.messageType === 'documentMessage' || !!msgObj.documentMessage) return true;
      if (r.messageType === 'contactMessage' || !!msgObj.contactMessage) return true;
      if (r.messageType === 'locationMessage' || !!msgObj.locationMessage) return true;

      // Keep messages with actual text
      const text =
        typeof msgObj.conversation === 'string'
          ? msgObj.conversation.trim()
          : (msgObj.extendedTextMessage?.text || '').trim();
      if (text) return true;

      // Drop internal synchronization frames, reaction packets, empty protocol markers
      return false;
    });

    const formatted = validRecords.map((r: any) => {
      const isMe = r.fromMe === true || r.keyFromMe === true || r.key?.fromMe === true;
      const ts = r.messageTimestamp || 0;
      const date = new Date(ts * 1000);
      const timeStr = isNaN(date.getTime())
        ? 'Recent'
        : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const msgObj = r.message || {};

      // Determine real media types
      const isImage = r.messageType === 'imageMessage' || !!msgObj.imageMessage;
      const isVideo = r.messageType === 'videoMessage' || !!msgObj.videoMessage;
      const isAudio = r.messageType === 'audioMessage' || !!msgObj.audioMessage;
      const isDoc = r.messageType === 'documentMessage' || !!msgObj.documentMessage;

      const messageId = r.id || r.key?.id || String(Math.random());

      let mediaType: 'image' | 'video' | 'audio' | undefined;
      let imageUrl: string | undefined;
      let videoUrl: string | undefined;
      let videoDuration: string | undefined;
      let audioUrl: string | undefined;
      let audioDuration: string | undefined;
      let fileName: string | undefined;
      let fileSize: string | undefined;
      let text = '';

      if (isImage) {
        mediaType = 'image';
        imageUrl = `/api/channels/whatsapp/media?messageId=${encodeURIComponent(messageId)}&instance=${encodeURIComponent(instance)}`;
        // Only set text if user provided an actual caption
        text = msgObj.imageMessage?.caption || '';
      } else if (isVideo) {
        mediaType = 'video';
        videoUrl = `/api/channels/whatsapp/media?messageId=${encodeURIComponent(messageId)}&instance=${encodeURIComponent(instance)}`;
        text = msgObj.videoMessage?.caption || '';
        const durationSec = msgObj.videoMessage?.seconds;
        if (durationSec && !isNaN(Number(durationSec))) {
          videoDuration = formatSeconds(Number(durationSec));
        }
        const length = msgObj.videoMessage?.fileLength;
        if (length) {
          const num = Number(length);
          fileSize = num > 1024 * 1024 ? `${(num / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(num / 1024)} KB`;
        }
      } else if (isAudio) {
        mediaType = 'audio';
        audioUrl = `/api/channels/whatsapp/media?messageId=${encodeURIComponent(messageId)}&instance=${encodeURIComponent(instance)}`;
        const durationSec = msgObj.audioMessage?.seconds;
        audioDuration = formatSeconds(durationSec);
        text = '';
      } else if (isDoc) {
        fileName = msgObj.documentMessage?.fileName || 'Document';
        const length = msgObj.documentMessage?.fileLength;
        if (length) {
          const num = Number(length);
          fileSize = num > 1024 * 1024 ? `${(num / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(num / 1024)} KB`;
        }
        text = msgObj.documentMessage?.caption || '';
      } else {
        // Plain text or standard message
        text =
          typeof msgObj.conversation === 'string'
            ? msgObj.conversation
            : msgObj.extendedTextMessage?.text ||
              msgObj.contactMessage?.displayName
            ? `👤 ${msgObj.contactMessage.displayName}`
            : '';
      }

      // Call detection & parsing (Evolution API / Baileys call records and stubs)
      const stubType = r.messageStubType;
      const stubParams = Array.isArray(r.messageStubParameters) ? r.messageStubParameters : [];
      const msgTypeStr = String(r.messageType || '').toLowerCase();
      const isCallStub =
        msgTypeStr.includes('call') ||
        stubType === 2 || stubType === '2' || stubType === 'CALL_MISSED_VOICE' ||
        stubType === 3 || stubType === '3' || stubType === 'CALL_MISSED_VIDEO' ||
        stubType === 8 || stubType === '8' || stubType === 'CALL_ATTEMPTED_VOICE' ||
        stubType === 9 || stubType === '9' || stubType === 'CALL_ATTEMPTED_VIDEO' ||
        stubType === 10 || stubType === '10' || stubType === 'CALL_OUTGOING_VOICE' ||
        stubType === 11 || stubType === '11' || stubType === 'CALL_OUTGOING_VIDEO' ||
        !!msgObj.call || !!msgObj.callLogMessage || !!r.call;

      let isCall = false;
      let callType: 'missed_voice' | 'missed_video' | 'incoming_voice' | 'incoming_video' | 'outgoing_voice' | 'outgoing_video' | undefined;
      let callDuration: string | undefined;
      let callOutcome: string | undefined;

      if (isCallStub) {
        isCall = true;
        const isVideoCall =
          stubType === 3 || stubType === '3' || stubType === 'CALL_MISSED_VIDEO' ||
          stubType === 9 || stubType === '9' || stubType === 'CALL_ATTEMPTED_VIDEO' ||
          stubType === 11 || stubType === '11' || stubType === 'CALL_OUTGOING_VIDEO' ||
          msgTypeStr.includes('video') ||
          !!msgObj.call?.isVideo ||
          !!msgObj.callLogMessage?.isVideo;

        const rawDurationNum = Number(
          r.duration ||
          msgObj.call?.duration ||
          msgObj.callLogMessage?.duration ||
          (stubParams[0] && !isNaN(Number(stubParams[0])) ? stubParams[0] : 0)
        );

        if (rawDurationNum > 0) {
          callDuration = formatSeconds(rawDurationNum);
        }

        const explicitOutcome = String(
          r.callOutcome ||
          msgObj.call?.outcome ||
          msgObj.callLogMessage?.outcome ||
          ''
        ).toLowerCase();

        const isExplicitlyMissed =
          stubType === 2 || stubType === '2' || stubType === 'CALL_MISSED_VOICE' ||
          stubType === 3 || stubType === '3' || stubType === 'CALL_MISSED_VIDEO' ||
          stubType === 8 || stubType === '8' || stubType === 'CALL_ATTEMPTED_VOICE' ||
          stubType === 9 || stubType === '9' || stubType === 'CALL_ATTEMPTED_VIDEO' ||
          msgTypeStr.includes('missed') ||
          explicitOutcome === 'missed' ||
          explicitOutcome === 'declined' ||
          explicitOutcome === 'rejected';

        const isExplicitlyOutgoing =
          stubType === 10 || stubType === '10' || stubType === 'CALL_OUTGOING_VOICE' ||
          stubType === 11 || stubType === '11' || stubType === 'CALL_OUTGOING_VIDEO' ||
          msgTypeStr.includes('outgoing') ||
          isMe;

        // If call lasted more than 0 seconds or connected/answered -> It is an ANSWERED call
        const isAnswered = rawDurationNum > 0 || explicitOutcome === 'connected' || explicitOutcome === 'accepted' || explicitOutcome === 'answered';

        if (isVideoCall) {
          if (isExplicitlyOutgoing) {
            callType = 'outgoing_video';
            callOutcome = isAnswered ? 'Outgoing' : 'Unanswered';
            text = callDuration ? `Outgoing video call (${callDuration})` : 'Outgoing video call';
          } else if (isExplicitlyMissed && !isAnswered) {
            callType = 'missed_video';
            callOutcome = 'Missed';
            text = 'Missed video call';
          } else {
            // Incoming answered call
            callType = 'incoming_video';
            callOutcome = 'Incoming';
            text = callDuration ? `Incoming video call (${callDuration})` : 'Incoming video call';
          }
        } else {
          // Voice Call
          if (isExplicitlyOutgoing) {
            callType = 'outgoing_voice';
            callOutcome = isAnswered ? 'Outgoing' : 'Unanswered';
            text = callDuration ? `Outgoing voice call (${callDuration})` : 'Outgoing voice call';
          } else if (isExplicitlyMissed && !isAnswered) {
            callType = 'missed_voice';
            callOutcome = 'Missed';
            text = 'Missed voice call';
          } else {
            // Incoming answered call
            callType = 'incoming_voice';
            callOutcome = 'Incoming';
            text = callDuration ? `Incoming voice call (${callDuration})` : 'Incoming voice call';
          }
        }
      }

      // Compute authentic status
      const updates = Array.isArray(r.MessageUpdate) ? r.MessageUpdate : [];
      const hasRead =
        updates.some((u: any) => u.status === 'READ' || u.status === 'PLAYED' || u.status === 3 || u.status === 4) ||
        r.status === 'READ' ||
        r.status === 'PLAYED' ||
        r.status === 3 ||
        r.status === 4;

      const hasDelivered =
        hasRead ||
        updates.some((u: any) => u.status === 'DELIVERY_ACK' || u.status === 2) ||
        r.status === 'DELIVERY_ACK' ||
        r.status === 2;

      let status: 'sending' | 'sent' | 'delivered' | 'read' = 'sent';
      let seen = false;
      let delivered = false;

      if (!isMe) {
        status = 'delivered';
        seen = false;
        delivered = true;
      } else {
        if (hasRead) {
          status = 'read';
          seen = true;
          delivered = true;
        } else if (hasDelivered) {
          status = 'delivered';
          seen = false;
          delivered = true;
        } else if (r.status === 'PENDING' || r.status === 0) {
          status = 'sending';
          seen = false;
          delivered = false;
        } else {
          status = 'sent';
          seen = false;
          delivered = false;
        }
      }

      return {
        id: messageId,
        sender: isMe ? ('operator' as const) : ('customer' as const),
        text,
        time: timeStr,
        timestamp: ts * 1000,
        seen,
        delivered,
        status,
        isAudio,
        audioDuration,
        imageUrl,
        videoUrl,
        videoDuration,
        audioUrl,
        mediaType,
        fileName,
        fileSize,
        isCall,
        callType,
        callDuration,
        callOutcome,
        message: r.message,
        fromMe: isMe
      };
    });

    if (formatted.length === 0) {
      const topicId = searchParams.get('topicId');
      const pairedChat = (PAIRED_CHATS_BY_APP.whatsapp || []).find(
        (c) => c.id === remoteJidParam || c.handleOrPhone === remoteJidParam || (c.phone && c.phone === remoteJidParam)
      );
      if (pairedChat && pairedChat.messages) {
        let pairedMsgs = pairedChat.messages;
        if (topicId) {
          pairedMsgs = pairedMsgs.filter((m: any) => 
            String(m.topicId) === String(topicId) || 
            (String(topicId) === 'wa_t_gen' && (!m.topicId || String(m.topicId) === 'wa_t_gen'))
          );
        }
        return NextResponse.json({
          remoteJid: remoteJidParam,
          count: pairedMsgs.length,
          messages: pairedMsgs
        });
      }
    }

    return NextResponse.json({
      remoteJid: remoteJidParam,
      count: formatted.length,
      messages: formatted
    });
  } catch (err: any) {
    console.error('Error fetching chat messages:', err);
    return NextResponse.json({ messages: [], error: err.message }, { status: 500 });
  }
}
