import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const pageId = url.searchParams.get('pageId') || process.env.FB_PAGE_ID;
    const igId = url.searchParams.get('igId') || process.env.INSTAGRAM_ACCOUNT_ID;
    const pageAccessToken = url.searchParams.get('accessToken') || process.env.META_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN;

    const chatsMap = new Map<string, any>();

    // 1. Fetch Instagram discussions for this user/bot from Supabase database
    try {
      let query = supabaseAdmin
        .from('conversations')
        .select('*, chat_messages(*)')
        .eq('channel_type', 'instagram');

      if (!userId) {
        return NextResponse.json({
          status: 'unlinked',
          count: 0,
          chats: [],
        });
      }

      const { data: userBot } = await supabaseAdmin
        .from('bots')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (!userBot || userBot.length === 0) {
        return NextResponse.json({
          status: 'unlinked',
          count: 0,
          chats: [],
        });
      }

      query = query.eq('bot_id', userBot[0].id);

      const { data: convs, error } = await query.order('last_message_at', { ascending: false });

      if (Array.isArray(convs) && convs.length > 0) {
        convs.forEach((c: any) => {
          const phoneOrHandle = (c.contact_phone || '').trim();
          // Filter out legacy test accounts like user_332211
          if (!phoneOrHandle || /^@?user_\d+$/i.test(phoneOrHandle) || /^test_/i.test(c.id)) {
            return;
          }

          const rawMsgs = Array.isArray(c.chat_messages) ? c.chat_messages : [];
          const sortedMsgs = rawMsgs.slice().sort(
            (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

          const msgs = sortedMsgs.map((m: any) => {
            const isMe = m.sender === 'human_operator' || m.sender === 'operator';
            const date = new Date(m.created_at || Date.now());
            const timeStr = isNaN(date.getTime())
              ? 'Just now'
              : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return {
              id: m.id,
              sender: isMe ? 'operator' : 'customer',
              text: m.content || '',
              time: timeStr,
              seen: true,
            };
          });

          const cleanHandle = phoneOrHandle.replace(/^@/, '');
          const fullHandle = `@${cleanHandle}`;

          const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
          const lastMsgText = lastMsg ? lastMsg.text : 'Direct message';
          
          let lastTimeStr = 'Recent';
          const lastTs = c.last_message_at ? new Date(c.last_message_at).getTime() : (c.created_at ? new Date(c.created_at).getTime() : Date.now());
          if (lastTs > 0) {
            const d = new Date(lastTs);
            const now = new Date();
            const diffMs = now.getTime() - d.getTime();
            const diffDays = Math.floor(diffMs / 86400000);
            if (diffDays === 0) {
              lastTimeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (diffDays === 1) {
              lastTimeStr = 'Yesterday';
            } else if (diffDays < 7) {
              lastTimeStr = d.toLocaleDateString([], { weekday: 'short' });
            } else {
              lastTimeStr = d.toLocaleDateString([], { day: '2-digit', month: 'short' });
            }
          }

          const displayName = c.contact_name || cleanHandle;

          chatsMap.set(fullHandle.toLowerCase(), {
            id: c.id,
            appId: 'instagram',
            name: displayName,
            handleOrPhone: fullHandle,
            profilePicUrl: null,
            lastMessage: lastMsgText,
            lastMessageTime: lastTimeStr,
            time: lastTimeStr,
            timestamp: lastTs,
            unreadCount: 0,
            avatarBg: '#C13584',
            avatarText: (displayName[0] || 'I').toUpperCase(),
            statusText: 'Instagram Direct',
            spend: '0 DA',
            messages: msgs,
          });
        });
      }
    } catch (dbErr) {
      console.warn('[Instagram Chats DB Notice]:', dbErr);
    }

    // 2. If Meta Graph API token is present, also fetch remote Graph API conversations
    if (pageAccessToken) {
      const candidateIds = Array.from(new Set([pageId, igId, 'me'].filter(Boolean))) as string[];
      for (const target of candidateIds) {
        try {
          const res = await fetch(
            `https://graph.facebook.com/v19.0/${target}/conversations?platform=instagram&fields=id,updated_time,participants,messages{id,message,created_time,from}&access_token=${pageAccessToken}`
          );
          const data = await res.json();
          if (res.ok && Array.isArray(data.data)) {
            data.data.forEach((conv: any) => {
              const otherParticipant =
                conv.participants?.data?.find((p: any) => p.id !== igId && p.id !== pageId) ||
                conv.participants?.data?.[0] ||
                {};
              const rawMsgs = conv.messages?.data || [];
              const lastMsg = rawMsgs[0] || {};
              const msgTime = lastMsg.created_time
                ? new Date(lastMsg.created_time).getTime()
                : conv.updated_time
                ? new Date(conv.updated_time).getTime()
                : 0;

              const lastMsgTimeStr = lastMsg.created_time
                ? new Date(lastMsg.created_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Recent';

              const username = (otherParticipant.username || otherParticipant.name || 'ig_user').replace(/^@/, '');
              const fullHandle = `@${username}`;

              if (!chatsMap.has(fullHandle.toLowerCase())) {
                const messages = rawMsgs
                  .slice()
                  .reverse()
                  .map((m: any) => ({
                    id: m.id || String(Date.now() + Math.random()),
                    sender: m.from?.id === igId || m.from?.id === pageId ? 'operator' : 'customer',
                    text: m.message || '',
                    time: m.created_time
                      ? new Date(m.created_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Just now',
                    seen: true,
                  }));

                chatsMap.set(fullHandle.toLowerCase(), {
                  id: conv.id,
                  appId: 'instagram',
                  name: otherParticipant.name || username,
                  handleOrPhone: fullHandle,
                  profilePicUrl: null,
                  lastMessage: lastMsg.message || 'Direct message',
                  lastMessageTime: lastMsgTimeStr,
                  time: lastMsgTimeStr,
                  timestamp: msgTime,
                  unreadCount: 0,
                  avatarBg: '#C13584',
                  avatarText: (username[0] || 'I').toUpperCase(),
                  statusText: 'Instagram Direct',
                  spend: '0 DA',
                  messages,
                });
              }
            });
            break;
          }
        } catch {}
      }
    }

    // Always sort chronologically: latest message activity at the top
    const allChats = Array.from(chatsMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return NextResponse.json({
      status: allChats.length > 0 || pageAccessToken ? 'connected' : 'unlinked',
      count: allChats.length,
      chats: allChats,
    });
  } catch (err: any) {
    console.error('Error fetching Instagram chats:', err);
    return NextResponse.json({ status: 'error', error: err.message, chats: [] }, { status: 500 });
  }
}
