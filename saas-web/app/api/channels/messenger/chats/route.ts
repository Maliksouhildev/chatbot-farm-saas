import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId') || process.env.FB_PAGE_ID;
    const pageAccessToken = searchParams.get('token') || process.env.FB_PAGE_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;

    if (!pageId || !pageAccessToken) {
      return NextResponse.json({
        success: true,
        isLive: false,
        chats: []
      });
    }

    // Real Meta Graph API call for Page Conversations
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/conversations?fields=id,updated_time,participants,messages{id,message,created_time,from}&access_token=${pageAccessToken}`
    );

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json({ error: errorData.error?.message || 'Failed to fetch Facebook Page conversations', chats: [] }, { status: res.status });
    }

    const data = await res.json();
    const rawConversations = data.data || [];

    const chats = rawConversations.map((conv: any) => {
      const participant = conv.participants?.data?.find((p: any) => p.id !== pageId) || conv.participants?.data?.[0];
      const recentMessages = (conv.messages?.data || []).reverse();
      const lastMsg = recentMessages[recentMessages.length - 1];

      const msgTs = lastMsg?.created_time
        ? new Date(lastMsg.created_time).getTime()
        : conv.updated_time
        ? new Date(conv.updated_time).getTime()
        : 0;
      const timeStr = lastMsg?.created_time
        ? new Date(lastMsg.created_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Recent';

      return {
        id: conv.id,
        appId: 'messenger',
        name: participant?.name || 'Facebook Customer',
        handleOrPhone: participant?.id ? `ID: ${participant.id}` : 'Messenger User',
        lastMessage: lastMsg?.message || 'Attachment / Media',
        time: timeStr,
        lastMessageTime: timeStr,
        timestamp: msgTs,
        unreadCount: 0,
        statusText: 'Page Messenger',
        avatarText: (participant?.name || 'FB')[0].toUpperCase(),
        messages: recentMessages.map((m: any) => ({
          id: m.id,
          sender: m.from?.id === pageId ? 'operator' : 'customer',
          text: m.message || '',
          time: new Date(m.created_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          seen: true,
        }))
      };
    });

    chats.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));

    return NextResponse.json({ success: true, isLive: true, count: chats.length, chats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error', chats: [] }, { status: 500 });
  }
}
