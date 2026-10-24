import { NextResponse } from 'next/server';
import { markTelegramChatRead } from '@/lib/telegram_client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { session, chatId, topicId } = body;

    if (!chatId) {
      return NextResponse.json({ success: false, error: 'Missing chatId' }, { status: 400 });
    }

    await markTelegramChatRead(session || '', String(chatId), topicId ? String(topicId) : undefined);

    return NextResponse.json({ success: true, chatId, topicId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal error' }, { status: 500 });
  }
}
