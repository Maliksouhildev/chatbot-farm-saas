import { NextResponse } from 'next/server';

function extractMessageText(msgObj: any): string {
  if (!msgObj) return '';
  if (typeof msgObj.conversation === 'string') return msgObj.conversation;
  if (msgObj.extendedTextMessage?.text) return msgObj.extendedTextMessage.text;
  if (msgObj.imageMessage?.caption) return msgObj.imageMessage.caption;
  if (msgObj.imageMessage) return '📷 Photo';
  if (msgObj.videoMessage?.caption) return msgObj.videoMessage.caption;
  if (msgObj.videoMessage) return '🎥 Video';
  if (msgObj.audioMessage) return '🎤 Voice note';
  if (msgObj.documentMessage?.fileName) return '📄 ' + msgObj.documentMessage.fileName;
  if (msgObj.documentMessage) return '📄 Document';
  if (msgObj.stickerMessage) return '🎨 Sticker';
  if (msgObj.contactMessage?.displayName) return '👤 ' + msgObj.contactMessage.displayName;
  return 'Message';
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const remoteJid = searchParams.get('remoteJid');
    const instance = searchParams.get('instance') || 'default_instance';

    if (!remoteJid) {
      return NextResponse.json({ messages: [] });
    }

    const evolutionUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    const apiKey = process.env.EVOLUTION_API_KEY || 'farm_evolution_master_secret_2026';

    const res = await fetch(`${evolutionUrl}/chat/findMessages/${instance}`, {
      method: 'POST',
      headers: { apikey: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        where: {
          remoteJid: remoteJid
        },
        limit: 100
      })
    });

    if (!res.ok) {
      return NextResponse.json({ messages: [] });
    }

    const data = await res.json();
    const records = data.messages?.records || [];

    // Sort chronologically (oldest first, newest last)
    records.sort((a: any, b: any) => (a.messageTimestamp || 0) - (b.messageTimestamp || 0));

    const formatted = records.map((r: any) => {
      const isMe = r.fromMe === true || r.keyFromMe === true || r.key?.fromMe === true;
      const date = new Date((r.messageTimestamp || 0) * 1000);
      const timeStr = isNaN(date.getTime())
        ? 'Recent'
        : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const text = extractMessageText(r.message);
      const isAudio = r.messageType === 'audioMessage' || !!r.message?.audioMessage;
      const isVideo = r.messageType === 'videoMessage' || !!r.message?.videoMessage;
      const isImage = r.messageType === 'imageMessage' || !!r.message?.imageMessage;
      
      let mediaType;
      if (isAudio) mediaType = 'audio';
      else if (isVideo) mediaType = 'video';
      else if (isImage) mediaType = 'image';

      return {
        id: r.id || r.key?.id || String(Math.random()),
        sender: isMe ? 'operator' : 'customer',
        text: text,
        time: timeStr,
        seen: true,
        isAudio: isAudio,
        audioDuration: isAudio ? '0:15' : undefined,
        mediaType,
        message: r.message,
        fromMe: isMe
      };
    });

    return NextResponse.json({
      remoteJid,
      count: formatted.length,
      messages: formatted
    });
  } catch (err: any) {
    console.error('Error fetching chat messages:', err);
    return NextResponse.json({ messages: [], error: err.message }, { status: 500 });
  }
}
