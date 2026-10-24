import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId') || searchParams.get('conversationId');

    if (!threadId) {
      return NextResponse.json({ error: 'Missing threadId parameter' }, { status: 400 });
    }

    const { supabaseAdmin } = await import('@/lib/supabaseClient');
    const { data: dbMsgs } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', threadId)
      .order('created_at', { ascending: true });

    if (dbMsgs && dbMsgs.length > 0) {
      const messages = dbMsgs.map((m: any) => ({
        id: m.id,
        sender: m.sender === 'human_operator' || m.sender === 'operator' ? 'operator' : 'customer',
        text: m.content || '',
        time: new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        seen: true,
        fileName: m.message_type === 'file' ? m.content : undefined,
      }));
      return NextResponse.json({ success: true, isLive: true, messages });
    }

    return NextResponse.json({
      success: true,
      isLive: true,
      messages: []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error', messages: [] }, { status: 500 });
  }
}
