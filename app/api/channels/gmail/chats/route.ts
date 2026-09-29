import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const emailParam = searchParams.get('email') || process.env.SUPPORT_EMAIL || 'support@chatbotfarm.dz';

    let convs: any[] = [];
    let botId: string | null = null;

    if (userId) {
      try {
        const { data: userBots } = await supabaseAdmin
          .from('bots')
          .select('id')
          .eq('user_id', userId)
          .limit(1);

        if (userBots && userBots.length > 0) {
          botId = userBots[0].id;
        }

        if (botId) {
          const { data, error } = await supabaseAdmin
            .from('conversations')
            .select('*, chat_messages(*)')
            .eq('channel_type', 'gmail')
            .eq('bot_id', botId)
            .order('last_message_at', { ascending: false });

          if (!error && Array.isArray(data) && data.length > 0) {
            convs = data;
          }
        }
      } catch (err) {
        console.warn('Gmail Supabase fetch warning:', err);
      }
    }

    if (convs.length > 0) {
      const chats = convs.map((c: any) => {
        const rawMsgs = Array.isArray(c.chat_messages) ? c.chat_messages : [];
        const sortedMsgs = rawMsgs.slice().sort(
          (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        const msgs = sortedMsgs.map((m: any) => ({
          id: m.id,
          sender: m.sender === 'human_operator' || m.sender === 'operator' ? 'operator' : 'customer',
          text: m.content || '',
          time: new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          seen: true,
          fileName: m.message_type === 'file' ? m.content : undefined,
        }));

        const date = c.last_message_at ? new Date(c.last_message_at) : new Date(c.created_at || Date.now());
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return {
          id: c.id,
          appId: 'gmail',
          name: c.contact_name || 'Client Support',
          handleOrPhone: c.contact_phone || emailParam,
          avatarText: (c.contact_name || 'C')[0].toUpperCase(),
          avatarBg: '#EA4335',
          statusText: 'Gmail Support • Inbound',
          spend: c.total_spend ? `${c.total_spend} DA` : '0 DA',
          lastMessage: c.chat_messages?.[0]?.content?.slice(0, 60) || 'Support email inquiry',
          time: timeStr,
          lastMessageTime: timeStr,
          timestamp: date.getTime(),
          unreadCount: 0,
          messages: msgs,
        };
      });

      return NextResponse.json({
        success: true,
        channelId: 'gmail',
        isLive: true,
        count: chats.length,
        chats,
      });
    }

    // Real Gmail Bridge check
    const accessToken = searchParams.get('accessToken') || '';
    const email = searchParams.get('email') || emailParam;
    if (accessToken) {
      const { fetchRealGmailMessages } = await import('@/lib/bridges/gmailBridge');
      const realGmail = await fetchRealGmailMessages({ accessToken, email });
      if (!realGmail.success) {
        return NextResponse.json({
          success: false,
          channelId: 'gmail',
          isLive: false,
          count: 0,
          chats: [],
          error: realGmail.error || 'Failed to fetch real Gmail messages',
        });
      }
      if (realGmail.chats.length > 0) {
        return NextResponse.json({
          success: true,
          channelId: 'gmail',
          isLive: true,
          count: realGmail.chats.length,
          chats: realGmail.chats,
        });
      }
    }

    // Honest clean 0-count response (Zero synthetic mock fallback)
    return NextResponse.json({
      success: true,
      channelId: 'gmail',
      isLive: true,
      count: 0,
      chats: [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error', chats: [] }, { status: 500 });
  }
}

