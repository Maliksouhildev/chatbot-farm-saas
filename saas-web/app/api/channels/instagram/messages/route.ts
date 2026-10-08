import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { PAIRED_CHATS_BY_APP } from '@/lib/mock_chats';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId') || searchParams.get('threadId');
    const accessToken = searchParams.get('accessToken') || searchParams.get('token') || process.env.META_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN;
    const igId = searchParams.get('igId') || process.env.INSTAGRAM_ACCOUNT_ID;
    const pageId = searchParams.get('pageId') || process.env.FB_PAGE_ID;

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId parameter' }, { status: 400 });
    }

    const messagesMap = new Map<string, any>();

    // 1. Check Supabase chat_messages & conversations
    try {
      const cleanHandle = conversationId.replace(/^instagram_|^@/, '');
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationId);

      let convData: any = null;

      if (isUUID) {
        const { data: convById } = await supabaseAdmin
          .from('conversations')
          .select('id, contact_phone, contact_name, chat_messages(*)')
          .eq('id', conversationId)
          .single();
        convData = convById;
      }

      if (!convData) {
        const { data: convs } = await supabaseAdmin
          .from('conversations')
          .select('id, contact_phone, contact_name, chat_messages(*)')
          .eq('channel_type', 'instagram')
          .or(`contact_phone.eq.@${cleanHandle},contact_phone.eq.${cleanHandle}`)
          .limit(1);

        if (convs && convs.length > 0) {
          convData = convs[0];
        }
      }

      if (convData) {
        const rawMsgs = Array.isArray(convData.chat_messages) ? convData.chat_messages : [];
        rawMsgs.forEach((m: any) => {
          const id = m.id;
          if (!messagesMap.has(id)) {
            const ts = new Date(m.created_at || Date.now()).getTime();
            const isMe = m.sender === 'human_operator' || m.sender === 'operator';
            const date = new Date(m.created_at || Date.now());
            const timeStr = isNaN(date.getTime())
              ? 'Just now'
              : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            messagesMap.set(id, {
              id,
              sender: isMe ? 'operator' : 'customer',
              text: m.content || '',
              time: timeStr,
              timestamp: ts,
              seen: true,
            });
          }
        });
      }
    } catch (dbErr) {
      console.warn('[Instagram Messages DB Notice]:', dbErr);
    }

    // 2. If Meta Graph API access token is present, query Meta Graph API
    if (accessToken) {
      try {
        const res = await fetch(
          `https://graph.facebook.com/v19.0/${conversationId}/messages?fields=id,message,created_time,from,to&access_token=${accessToken}`
        );
        if (res.ok) {
          const data = await res.json();
          const rawMessages = (data.data || []).reverse();
          rawMessages.forEach((m: any) => {
            const isMe = (igId && m.from?.id === igId) || (pageId && m.from?.id === pageId);
            const ts = new Date(m.created_time).getTime();
            messagesMap.set(m.id, {
              id: m.id,
              sender: isMe ? 'operator' : 'customer',
              text: m.message || '',
              time: new Date(m.created_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: ts,
              seen: true,
            });
          });
        }
      } catch {}
    }

    // Sort messages chronologically
    let messages = Array.from(messagesMap.values()).sort(
      (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
    );

    if (messages.length === 0 && conversationId) {
      const pairedChat = (PAIRED_CHATS_BY_APP.instagram || []).find(
        (c) => c.id === conversationId || c.handleOrPhone === conversationId || c.username === conversationId || `@${c.username}` === conversationId
      );
      if (pairedChat && pairedChat.messages) {
        messages = pairedChat.messages;
      }
    }

    return NextResponse.json({
      success: true,
      isLive: true,
      count: messages.length,
      messages,
    });
  } catch (err: any) {
    console.error('Error fetching Instagram messages:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error', messages: [] }, { status: 500 });
  }
}

