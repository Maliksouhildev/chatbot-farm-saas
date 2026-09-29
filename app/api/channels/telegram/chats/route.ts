import { NextResponse } from 'next/server';
import { getClientFromSession, formatTelegramChat } from '@/lib/telegram_client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = searchParams.get('session');
    const token = searchParams.get('token');
    const isDemo = searchParams.get('demo') === 'true' || session?.startsWith('demo_');

    // 1. If unlinked (no session, no token, and no env token)
    if (!session && !token && !process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({
        success: true,
        isLive: false,
        status: 'unlinked',
        count: 0,
        chats: [],
      });
    }

    // 2. Personal Telegram Account (MTProto session)
    if (session) {
      try {
        const client = await getClientFromSession(session);
        const dialogs = await client.getDialogs({ limit: 30 });
        const chats = dialogs.map((d: any) => formatTelegramChat(d));

        return NextResponse.json({
          success: true,
          isLive: true,
          accountType: 'personal',
          count: chats.length,
          chats,
        });
      } catch (err: any) {
        console.warn('Telegram MTProto dialogs fetch failed:', err.message);
        return NextResponse.json({
          success: false,
          isLive: false,
          error: err.message,
          count: 0,
          chats: [],
        });
      }
    }

    // 3. Telegram Bot API fallback
    const botToken = token || process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?limit=50`);
      const data = await res.json();

      if (res.ok && data.ok) {
        const updates = data.result || [];
        const chatsMap = new Map<string, any>();

        for (const update of updates) {
          const msg = update.message || update.edited_message || update.channel_post;
          if (!msg || !msg.chat) continue;

          const chatId = String(msg.chat.id);
          const senderName = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ') || msg.chat.title || 'Telegram User';
          const handle = msg.from?.username ? `@${msg.from.username}` : `ID: ${chatId}`;
          const msgText = msg.text || (msg.photo ? '📷 Photo' : msg.voice ? '🎤 Voice message' : 'Document');
          const timeStr = new Date(msg.date * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const msgTs = (msg.date || 0) * 1000;

          if (!chatsMap.has(chatId)) {
            chatsMap.set(chatId, {
              id: chatId,
              appId: 'telegram',
              name: senderName,
              handleOrPhone: handle,
              lastMessage: msgText,
              time: timeStr,
              lastMessageTime: timeStr,
              timestamp: msgTs,
              unreadCount: 0,
              statusText: 'Online on Telegram',
              avatarText: (senderName || 'TG')[0].toUpperCase(),
              messages: [],
            });
          }

          const chat = chatsMap.get(chatId);
          chat.lastMessage = msgText;
          chat.time = timeStr;
          chat.lastMessageTime = timeStr;
          if (msgTs > (chat.timestamp || 0)) {
            chat.timestamp = msgTs;
          }
          chat.messages.push({
            id: String(msg.message_id),
            sender: msg.from?.is_bot ? 'operator' : 'customer',
            text: msgText,
            time: timeStr,
            seen: true,
          });
        }

        const chats = Array.from(chatsMap.values());
        chats.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
        return NextResponse.json({ success: true, isLive: true, count: chats.length, chats });
      }
    }

    return NextResponse.json({ success: true, isLive: false, count: 0, chats: [] });
  } catch (err: any) {
    console.error('Failed to fetch Telegram chats:', err);
    return NextResponse.json({ success: false, error: err.message, chats: [] }, { status: 500 });
  }
}
