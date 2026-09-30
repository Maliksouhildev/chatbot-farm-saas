import { NextResponse } from 'next/server';

function extractMessageText(msgObj: any): string {
  if (!msgObj) return '';
  if (typeof msgObj.conversation === 'string') return msgObj.conversation;
  if (msgObj.extendedTextMessage?.text) return msgObj.extendedTextMessage.text;
  if (msgObj.imageMessage?.caption) return msgObj.imageMessage.caption;
  if (msgObj.videoMessage?.caption) return msgObj.videoMessage.caption;
  if (msgObj.documentMessage?.fileName) return '📄 ' + msgObj.documentMessage.fileName;
  if (msgObj.contactMessage?.displayName) return '👤 ' + msgObj.contactMessage.displayName;
  return '';
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

    const jids = remoteJid.split(',');
    
    const fetchMessagesForJid = async (jid: string) => {
      const res = await fetch(`${evolutionUrl}/chat/findMessages/${instance}`, {
        method: 'POST',
        headers: { apikey: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          where: { key: { remoteJid: jid } },
          limit: 100
        })
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.messages?.records || [];
    };

    const results = await Promise.all(jids.map(fetchMessagesForJid));
    let records = results.flat();

    
    // Fetch @lid alias if it's a standard whatsapp net number
    if (remoteJid.includes('@s.whatsapp.net')) {
       const lid = remoteJid.replace('@s.whatsapp.net', '@lid');
       const resLid = await fetch(`${evolutionUrl}/chat/findMessages/${instance}`, {
         method: 'POST',
         headers: { apikey: apiKey, 'Content-Type': 'application/json' },
         body: JSON.stringify({
           where: { key: { remoteJid: lid } },
           limit: 50
         })
       });
       if (resLid.ok) {
         const dataLid = await resLid.json();
         const recordsLid = dataLid.messages?.records || [];
         records = [...records, ...recordsLid];
       }
    } else if (remoteJid.includes('@lid')) {
       const snet = remoteJid.replace('@lid', '@s.whatsapp.net');
       const resSnet = await fetch(`${evolutionUrl}/chat/findMessages/${instance}`, {
         method: 'POST',
         headers: { apikey: apiKey, 'Content-Type': 'application/json' },
         body: JSON.stringify({
           where: { key: { remoteJid: snet } },
           limit: 50
         })
       });
       if (resSnet.ok) {
         const dataSnet = await resSnet.json();
         const recordsSnet = dataSnet.messages?.records || [];
         records = [...records, ...recordsSnet];
       }
    }

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
      const isSticker = r.messageType === 'stickerMessage' || !!r.message?.stickerMessage;
      
      let mediaType = null;
      if (isAudio) mediaType = 'audio';
      else if (isVideo) mediaType = 'video';
      else if (isImage) mediaType = 'image';
      else if (isSticker) mediaType = 'sticker';

      return {
        id: r.id || r.key?.id || String(Math.random()),
        sender: isMe ? 'operator' : 'customer',
        text: text,
        time: timeStr,
        seen: true,
        isAudio: isAudio,
        audioDuration: isAudio ? '0:15' : undefined,
        mediaType,
        rawMessage: r
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
