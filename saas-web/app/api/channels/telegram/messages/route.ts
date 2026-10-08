import { NextResponse } from 'next/server';
import { getClientFromSession } from '@/lib/telegram_client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const session = searchParams.get('session');
    const token = searchParams.get('token') || process.env.TELEGRAM_BOT_TOKEN;

    const topicId = searchParams.get('topicId');

    if (!chatId) {
      return NextResponse.json({ error: 'chatId parameter is required' }, { status: 400 });
    }

    // 2. Personal Telegram Account (MTProto)
    if (session) {
      try {
        const client = await getClientFromSession(session);
        const options: any = { limit: 50 };
        if (topicId) {
          const numTopic = Number(String(topicId).replace(/\D/g, ''));
          if (!isNaN(numTopic) && numTopic > 0) {
            options.replyTo = numTopic;
          }
        }

        let tgMessages: any[] = [];
        try {
          tgMessages = await client.getMessages(chatId, options);
        } catch (fetchErr: any) {
          if (options.replyTo) {
            console.warn(`[Telegram MTProto] Fetching with replyTo=${options.replyTo} failed (${fetchErr?.message}), falling back to general messages`);
            tgMessages = await client.getMessages(chatId, { limit: 50 });
          } else {
            throw fetchErr;
          }
        }

        const me = (await client.getMe()) as any;
        const myId = String(me?.id || '');

        const messages = tgMessages.reverse().map((m: any) => {
          let senderId = '';
          if (m.senderId) {
            senderId = String(m.senderId);
          } else if (m.fromId) {
            const fid: any = m.fromId;
            senderId = String(fid.userId || fid.channelId || fid.chatId || '');
          }

          const isFromMe = m.out === true || (Boolean(senderId) && senderId === myId);
          const date = m.date ? new Date(m.date * 1000) : new Date();

          let senderName = isFromMe ? 'You' : 'User';
          if (!isFromMe) {
            if (m.sender) {
              senderName = [m.sender.firstName, m.sender.lastName].filter(Boolean).join(' ') || m.sender.title || (m.sender.username ? `@${m.sender.username}` : '') || 'User';
            } else if (m.postAuthor) {
              senderName = m.postAuthor;
            }
          }

          const senderAvatar = !isFromMe && senderId
            ? `/api/channels/telegram/avatar?id=${encodeURIComponent(senderId)}&session=${encodeURIComponent(session)}`
            : undefined;

          let imageUrl: string | undefined = undefined;
          let text = m.message || '';
          if (m.media) {
            const mClass = m.media.className;
            if (mClass === 'MessageMediaPhoto') {
              if (!text) text = '📷 Photo';
              imageUrl = `/api/channels/telegram/media?chatId=${encodeURIComponent(chatId)}&messageId=${m.id}&session=${encodeURIComponent(session || '')}`;
            } else if (mClass === 'MessageMediaDocument') {
              if (!text) text = '📄 Document';
            } else {
              if (!text) text = '📷 Media';
            }
          }

          let msgTopicId: string | undefined = undefined;
          if (topicId) {
            msgTopicId = String(topicId);
          } else if (m.replyTo?.forumTopic) {
            msgTopicId = String(m.replyTo.replyToTopId || m.replyTo.replyToMsgId || 1);
          } else if (m.replyTo?.replyToTopId) {
            msgTopicId = String(m.replyTo.replyToTopId);
          }

          return {
            id: String(m.id),
            sender: isFromMe ? 'operator' : 'customer',
            senderId,
            senderName,
            senderAvatar,
            topicId: msgTopicId,
            text,
            imageUrl,
            hasImages: Boolean(imageUrl),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: m.date ? m.date * 1000 : 0,
            delivered: true,
            seen: true,
          };
        });

        return NextResponse.json({
          success: true,
          isLive: true,
          messages,
        });
      } catch (err: any) {
        console.warn('Telegram MTProto messages fetch error:', err.message);
      }
    }

    // 3. Bot API fallback
    if (token) {
      const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=50`);
      const data = await res.json();

      if (res.ok && data.ok) {
        const updates = data.result || [];
        const messages = [];

        for (const update of updates) {
          const msg = update.message || update.edited_message;
          if (!msg || String(msg.chat?.id) !== chatId) continue;

          const threadId = msg.message_thread_id ? String(msg.message_thread_id) : (topicId || undefined);
          if (topicId) {
            const numReq = String(topicId).replace(/\D/g, '');
            const numThread = threadId ? String(threadId).replace(/\D/g, '') : '';
            if (String(threadId) !== String(topicId) && (!numReq || numReq !== numThread)) continue;
          }

          const sId = msg.from?.id ? String(msg.from.id) : (msg.sender_chat?.id ? String(msg.sender_chat.id) : '');
          const sName = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ') || msg.sender_chat?.title || (msg.from?.username ? `@${msg.from.username}` : '') || 'Telegram User';

          let botImgUrl: string | undefined = undefined;
          if (Array.isArray(msg.photo) && msg.photo.length > 0) {
            const bestPhoto = msg.photo[msg.photo.length - 1];
            if (bestPhoto?.file_id) {
              botImgUrl = `/api/channels/telegram/media?fileId=${encodeURIComponent(bestPhoto.file_id)}&token=${encodeURIComponent(token)}`;
            }
          }

          messages.push({
            id: String(msg.message_id),
            topicId: threadId,
            sender: msg.from?.is_bot ? 'operator' : 'customer',
            senderId: sId,
            senderName: sName,
            senderAvatar: sId ? `/api/channels/telegram/avatar?id=${encodeURIComponent(sId)}&token=${encodeURIComponent(token)}` : undefined,
            text: msg.text || (msg.photo ? '📷 Photo' : 'Message'),
            imageUrl: botImgUrl,
            hasImages: Boolean(botImgUrl),
            time: new Date(msg.date * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: (msg.date || 0) * 1000,
            delivered: true,
            seen: true,
          });
        }

        return NextResponse.json({ success: true, isLive: true, messages });
      }
    }

    return NextResponse.json({ success: true, isLive: false, messages: [] });
  } catch (err: any) {
    console.error('Error in Telegram messages GET:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
