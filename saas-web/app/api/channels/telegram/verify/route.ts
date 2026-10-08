import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token || process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      return NextResponse.json({ error: 'Telegram Bot Token is required' }, { status: 400 });
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await res.json();

    if (!res.ok || !data.ok) {
      return NextResponse.json(
        { error: data.description || 'Invalid Telegram Bot Token. Please check @BotFather.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      bot: {
        id: data.result.id,
        firstName: data.result.first_name,
        username: data.result.username,
        canJoinGroups: data.result.can_join_groups,
        supportsInlineQueries: data.result.supports_inline_queries,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to verify Telegram token' }, { status: 500 });
  }
}
