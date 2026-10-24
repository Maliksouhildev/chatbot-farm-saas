import { NextResponse } from 'next/server';
import {
  getClientFromSession,
  getTelegramEntity,
  getTelegramRawEntity,
  clearCachedTelegramMessages
} from '@/lib/telegram_client';
import { Api } from 'telegram';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session, chatId, messageId, options } = body;

    if (!chatId || !messageId) {
      return NextResponse.json({ error: 'Missing chatId or messageId' }, { status: 400 });
    }

    // Demo / Test sessions
    if (!session || session.startsWith('test_') || session.startsWith('demo_') || chatId.startsWith('tg_')) {
      return NextResponse.json({
        success: true,
        isDemo: true,
        message: 'Vote registered successfully in demo mode'
      });
    }

    const client = await getClientFromSession(session);
    let targetPeer: any = getTelegramEntity(session, chatId);
    let rawEntity: any = getTelegramRawEntity(session, chatId);

    if (!targetPeer && !rawEntity) {
      try {
        targetPeer = await client.getInputEntity(chatId);
      } catch {}
      if (!targetPeer && /^\d+$/.test(chatId)) {
        try {
          targetPeer = await client.getInputEntity(Number(chatId));
        } catch {}
      }
    }

    const fetchPeer = rawEntity || targetPeer || chatId;

    // Convert options array of hex strings to Buffers
    const optionBuffers: Buffer[] = (Array.isArray(options) ? options : [])
      .map((opt: string) => {
        try {
          return Buffer.from(opt, 'hex');
        } catch {
          return Buffer.from([Number(opt)]);
        }
      })
      .filter(Boolean);

    // Call GramJS Api.messages.SendVote
    const res = await client.invoke(
      new Api.messages.SendVote({
        peer: fetchPeer,
        msgId: Number(messageId),
        options: optionBuffers,
      })
    );

    // Invalidate message cache so next poll fetches fresh vote counts
    clearCachedTelegramMessages(chatId);

    return NextResponse.json({
      success: true,
      result: res,
    });
  } catch (err: any) {
    console.error('Error voting in Telegram poll:', err);
    return NextResponse.json({ error: err.message || 'Failed to vote' }, { status: 500 });
  }
}
