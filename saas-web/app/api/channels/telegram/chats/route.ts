import { NextResponse } from 'next/server';
import { getClientFromSession, formatTelegramChat, getTelegramForumTopics } from '@/lib/telegram_client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = searchParams.get('session');
    const token = searchParams.get('token');
    const isDemo = searchParams.get('demo') === 'true' || session?.startsWith('demo_');

    // 1. If unlinked (no session, no token, and no env token)
    if (!session && !token && !process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({
        success: true,
        isLive: false,
        status: 'unlinked',
        count: 0,
        chats: [],
      });
    }

    // 2. Demo & Test Fixtures (authentic Telegram schemas for testing zero-message contacts and forum supergroups)
    if (session?.startsWith('test_') || session?.startsWith('demo_') || isDemo) {
      const now = Date.now();
      const demoChats = [
        {
          id: 'tg_thamila_real',
          appId: 'telegram',
          name: 'Thamila',
          handleOrPhone: '+213 555 1234',
          lastMessage: 'No messages yet',
          time: '07:03 PM',
          lastMessageTime: '07:03 PM',
          timestamp: now,
          unreadCount: 0,
          statusText: 'Online',
          avatarText: 'T',
          profilePicUrl: null,
          isGroup: false,
          isBroadcast: false,
          isReadOnly: false,
          canSend: true,
          messages: [],
        },
        {
          id: 'tg_supergroup_university',
          appId: 'telegram',
          name: 'الجامعة',
          handleOrPhone: 'Supergroup • 1,500 members',
          lastMessage: 'مرحبا بالجميع في جامعة الجزائر',
          time: '06:30 PM',
          lastMessageTime: '06:30 PM',
          timestamp: now - 3600000,
          unreadCount: 0,
          statusText: 'Supergroup',
          avatarText: 'ج',
          profilePicUrl: null,
          isGroup: true,
          isBroadcast: false,
          isReadOnly: false,
          canSend: true,
          topics: [
            {
              id: '1',
              name: 'General',
              unreadCount: 0,
              pinned: false,
              closed: false,
              iconColor: '#2AABEE',
              avatarText: '#',
            },
          ],
          messages: [
            {
              id: 'm_tg_univ_1',
              topicId: '1',
              sender: 'customer',
              senderName: 'Ahmed',
              text: 'مرحبا بالجميع في جامعة الجزائر',
              time: '06:30 PM',
              timestamp: now - 3600000,
              seen: false,
              delivered: true,
            },
          ],
        },
      ];

      return NextResponse.json({
        success: true,
        isLive: true,
        accountType: 'personal',
        count: demoChats.length,
        chats: demoChats,
      });
    }

    // 2. Personal Telegram Account (MTProto session)
    if (session) {
      try {
        const client = await getClientFromSession(session);
        const dialogs = await client.getDialogs({ limit: 30 });
        const chats = await Promise.all(
          dialogs.map(async (d: any) => {
            let topics: any[] | undefined = undefined;
            const entity = d.entity || {};
            const isForum = Boolean(entity.forum);
            const chatId = String(d.id || entity.id);

            if (isForum) {
              topics = await getTelegramForumTopics(client, entity, chatId);
            }

            return formatTelegramChat(d, session, topics);
          })
        );

        chats.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));

        return NextResponse.json({
          success: true,
          isLive: true,
          accountType: 'personal',
          count: chats.length,
          chats,
        });
      } catch (err: any) {
        console.warn('Telegram MTProto dialogs fetch failed:', err.message);
        return NextResponse.json({
          success: false,
          isLive: false,
          error: err.message,
          count: 0,
          chats: [],
        });
      }
    }

    // 3. Telegram Bot API fallback
    const botToken = token || process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?limit=50`);
      const data = await res.json();

      if (res.ok && data.ok) {
        const updates = data.result || [];
        const chatsMap = new Map<string, any>();

        for (const update of updates) {
          const msg = update.message || update.edited_message || update.channel_post;
          if (!msg || !msg.chat) continue;

          const chatId = String(msg.chat.id);
          const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup' || Boolean(msg.chat.title) || chatId.startsWith('-');
          const senderName = msg.chat.title || [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ') || 'Telegram User';
          const handle = isGroup ? (msg.chat.title || 'Community') : (msg.from?.username ? `@${msg.from.username}` : '');
          const msgText = msg.text || (msg.photo ? '📷 Photo' : msg.voice ? '🎤 Voice message' : 'Document');
          const timeStr = new Date(msg.date * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const msgTs = (msg.date || 0) * 1000;

          if (!chatsMap.has(chatId)) {
            chatsMap.set(chatId, {
              id: chatId,
              appId: 'telegram',
              name: senderName,
              handleOrPhone: handle,
              lastMessage: msgText,
              time: timeStr,
              lastMessageTime: timeStr,
              timestamp: msgTs,
              unreadCount: 0,
              statusText: isGroup ? 'Active Group' : 'Online on Telegram',
              avatarText: (senderName || 'TG')[0].toUpperCase(),
              profilePicUrl: `/api/channels/telegram/avatar?id=${encodeURIComponent(chatId)}${botToken ? `&token=${encodeURIComponent(botToken)}` : ''}`,
              isGroup,
              topics: undefined,
              messages: [],
            });
          }

          const chat = chatsMap.get(chatId);
          chat.lastMessage = msgText;
          chat.time = timeStr;
          chat.lastMessageTime = timeStr;
          if (msgTs > (chat.timestamp || 0)) {
            chat.timestamp = msgTs;
          }
          const threadId = msg.message_thread_id ? String(msg.message_thread_id) : undefined;
          if (threadId) {
            chat.isGroup = true;
            if (!chat.topics) chat.topics = [];
            if (!chat.topics.some((t: any) => t.id === threadId)) {
              const topicName = msg.forum_topic_created?.name || `Topic ${threadId}`;
              const iconColor = msg.forum_topic_created?.icon_color
                ? `#${(msg.forum_topic_created.icon_color & 0x00FFFFFF).toString(16).padStart(6, '0')}`
                : undefined;
              chat.topics.push({
                id: threadId,
                name: topicName,
                iconColor,
                unreadCount: 0,
                pinned: false,
                closed: false,
                avatarText: (topicName[0] || '#').toUpperCase(),
              });
            }
          }
          chat.messages.push({
            id: String(msg.message_id),
            topicId: threadId,
            sender: msg.from?.is_bot ? 'operator' : 'customer',
            text: msgText,
            time: timeStr,
            timestamp: msgTs,
            seen: false,
          });
        }

        const chats = Array.from(chatsMap.values());
        chats.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
        return NextResponse.json({ success: true, isLive: true, count: chats.length, chats });
      }
    }

    return NextResponse.json({ success: true, isLive: false, count: 0, chats: [] });
  } catch (err: any) {
    console.error('Failed to fetch Telegram chats:', err);
    return NextResponse.json({ success: false, error: err.message, chats: [] }, { status: 500 });
  }
}
