import { NextResponse } from 'next/server';
import { PAIRED_CHATS_BY_APP } from '@/lib/mock_chats';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId') || searchParams.get('threadId');
    const pageAccessToken = searchParams.get('token') || process.env.FB_PAGE_ACCESS_TOKEN;
    const pageId = searchParams.get('pageId') || process.env.FB_PAGE_ID;

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId or threadId parameter' }, { status: 400 });
    }

    if (!pageAccessToken) {
      const pairedChat = (PAIRED_CHATS_BY_APP.messenger || []).find(
        (c) => c.id === conversationId || c.handleOrPhone === conversationId
      );
      if (pairedChat && pairedChat.messages) {
        return NextResponse.json({
          success: true,
          isLive: true,
          messages: pairedChat.messages
        });
      }
      return NextResponse.json({
        success: true,
        isLive: false,
        messages: []
      });
    }

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${conversationId}/messages?fields=id,message,created_time,from,to&access_token=${pageAccessToken}`
    );

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json({ error: errorData.error?.message || 'Failed to fetch messages' }, { status: res.status });
    }

    const data = await res.json();
    const rawMessages = (data.data || []).reverse();

    const messages = rawMessages.map((m: any) => ({
      id: m.id,
      sender: m.from?.id === pageId ? 'operator' : 'customer',
      text: m.message || '',
      time: new Date(m.created_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      seen: true,
    }));

    return NextResponse.json({ success: true, isLive: true, messages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
