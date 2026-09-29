import { NextResponse } from 'next/server';
import { getClientFromSession } from '@/lib/telegram_client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const session = searchParams.get('session');
    const token = searchParams.get('token') || process.env.TELEGRAM_BOT_TOKEN;

    if (!chatId) {
      return NextResponse.json({ error: 'chatId parameter is required' }, { status: 400 });
    }

    // 2. Personal Telegram Account (MTProto)
    if (session) {
      try {
        const client = await getClientFromSession(session);
        const tgMessages = await client.getMessages(chatId, { limit: 50 });

        const me = (await client.getMe()) as any;
        const myId = String(me?.id);

        const messages = tgMessages.reverse().map((m: any) => {
          const isFromMe = m.out === true || String(m.senderId) === myId;
          const date = m.date ? new Date(m.date * 1000) : new Date();
          return {
            id: String(m.id),
            sender: isFromMe ? 'operator' : 'customer',
            text: m.message || (m.media ? '📷 Photo / Media' : ''),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            delivered: true,
            seen: true,
          };
        });

        return NextResponse.json({
          success: true,
          isLive: true,
          messages,
        });
      } catch (err: any) {
        console.warn('Telegram MTProto messages fetch error:', err.message);
      }
    }

    // 3. Bot API fallback
    if (token) {
      const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=50`);
      const data = await res.json();

      if (res.ok && data.ok) {
        const updates = data.result || [];
        const messages = [];

        for (const update of updates) {
          const msg = update.message || update.edited_message;
          if (!msg || String(msg.chat?.id) !== chatId) continue;

          messages.push({
            id: String(msg.message_id),
            sender: msg.from?.is_bot ? 'operator' : 'customer',
            text: msg.text || (msg.photo ? '📷 Photo' : 'Message'),
            time: new Date(msg.date * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            delivered: true,
            seen: true,
          });
        }

        return NextResponse.json({ success: true, isLive: true, messages });
      }
    }

    return NextResponse.json({ success: true, isLive: false, messages: [] });
  } catch (err: any) {
    console.error('Error in Telegram messages GET:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
