import { NextResponse } from 'next/server';
import { getClientFromSession } from '@/lib/telegram_client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chatId, text, session, token } = body;

    if (!chatId || !text) {
      return NextResponse.json({ error: 'chatId and text are required' }, { status: 400 });
    }

    // 1. Personal Telegram Account (MTProto)
    if (session && !session.startsWith('demo_')) {
      try {
        const client = await getClientFromSession(session);
        const sentMsg = await client.sendMessage(chatId, { message: text.trim() });

        return NextResponse.json({
          success: true,
          mode: 'personal',
          messageId: String(sentMsg.id),
          chatId,
        });
      } catch (err: any) {
        console.error('Error sending message via personal Telegram MTProto:', err);
        return NextResponse.json(
          { error: err.message || 'Failed to send message via Telegram' },
          { status: 500 }
        );
      }
    }

    // 2. Telegram Bot API
    const botToken = token || process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        return NextResponse.json(
          { error: data.description || 'Failed to send message via Telegram Bot' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        mode: 'bot',
        messageId: data.result?.message_id,
        chatId: data.result?.chat?.id,
      });
    }

    // 3. Demo / Local Simulation fallback
    return NextResponse.json({
      success: true,
      mode: 'demo',
      mock: true,
      messageId: `tg_msg_${Date.now()}`,
      status: 'sent_locally',
    });
  } catch (err: any) {
    console.error('Error in Telegram send POST:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
