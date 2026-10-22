import { NextResponse } from 'next/server';
import {
  getClientFromSession,
  getCachedTelegramMessages,
  setCachedTelegramMessages,
  clientMeCache,
  getTelegramEntity,
  recordTelegramEntity,
  getTelegramRawEntity
} from '@/lib/telegram_client';
import { utils } from 'telegram';

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

    // 1. Demo & Test Fixtures
    if (session?.startsWith('test_') || session?.startsWith('demo_') || chatId.startsWith('tg_')) {
      if (chatId === 'tg_supergroup_university') {
        const now = Date.now();
        const demoMessages = [
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
          {
            id: 'm_tg_univ_2',
            topicId: '1',
            sender: 'operator',
            senderName: 'You',
            text: 'أهلاً بك يا أحمد، كيف يمكننا مساعدتك اليوم؟',
            time: '06:35 PM',
            timestamp: now - 3300000,
            seen: true,
            delivered: true,
          },
          {
            id: 'm_tg_univ_3',
            topicId: '1',
            sender: 'customer',
            senderName: 'Administration',
            text: 'Sondage : Quel jour préférez-vous pour la séance de révision ?',
            time: '06:40 PM',
            timestamp: now - 3000000,
            seen: true,
            delivered: true,
            poll: {
              id: 'poll_demo_univ_1',
              question: 'Quel jour préférez-vous pour la séance de révision ?',
              options: [
                { text: 'Lundi 14h - 16h', option: '00', voters: 18, percentage: 45, isChosen: false },
                { text: 'Mercredi 10h - 12h', option: '01', voters: 14, percentage: 35, isChosen: false },
                { text: 'Samedi matin en ligne', option: '02', voters: 8, percentage: 20, isChosen: false }
              ],
              totalVoters: 40,
              closed: false,
              isPublic: true,
              multipleChoice: false,
              quiz: false,
              hasVoted: false,
              myChosenOptions: []
            }
          }
        ];
        return NextResponse.json({
          success: true,
          count: demoMessages.length,
          messages: demoMessages,
        });
      }
      if (chatId === 'tg_thamila_real') {
        return NextResponse.json({
          success: true,
          count: 0,
          messages: [],
        });
      }
    }

    // 2. Personal Telegram Account (MTProto)
    if (session) {
      const cacheKey = `${chatId}:${topicId || 'root'}:${session}`;
      const cachedMessages = getCachedTelegramMessages(cacheKey);
      if (cachedMessages && cachedMessages.length > 0) {
        return NextResponse.json({
          success: true,
          count: cachedMessages.length,
          messages: cachedMessages,
        });
      }

      try {
        const client = await getClientFromSession(session);

        // 1. Resolve peer using cached access_hash entity or raw GramJS entity
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

        // If not found in cache, fetch dialogs to register all chat entities
        if (!targetPeer && !rawEntity) {
          try {
            const dl = await client.getDialogs({ limit: 100 });
            for (const d of dl) {
              recordTelegramEntity(session, d);
            }
            targetPeer = getTelegramEntity(session, chatId);
            rawEntity = getTelegramRawEntity(session, chatId);

            // Fuzzy dialog scan by ID / digits / title / username if not directly resolved
            if (!targetPeer && !rawEntity) {
              const cleanTarget = chatId.replace(/\D/g, '');
              const matchedDialog = dl.find((d: any) => {
                const dIdStr = String(d.id || d.entity?.id || '');
                const dClean = dIdStr.replace(/\D/g, '');
                const titleMatch = d.name && d.name.toLowerCase() === chatId.toLowerCase();
                const userMatch = d.entity?.username && d.entity.username.toLowerCase() === chatId.toLowerCase().replace(/^@/, '');
                return dIdStr === chatId || (cleanTarget && dClean === cleanTarget) || titleMatch || userMatch;
              });
              if (matchedDialog) {
                recordTelegramEntity(session, matchedDialog);
                targetPeer = matchedDialog.inputEntity || (matchedDialog.entity ? utils.getInputPeer(matchedDialog.entity) : null);
                rawEntity = matchedDialog.entity;
              }
            }
          } catch (err: any) {
            console.warn(`[Telegram MTProto] Could not resolve entity for chatId=${chatId}:`, err?.message);
          }
        }

        const fetchPeer = rawEntity || targetPeer || chatId;
        const numTopic = topicId ? Number(String(topicId).replace(/\D/g, '')) : NaN;
        const isGeneralOrRoot = !topicId || isNaN(numTopic) || numTopic === 1 || String(topicId).toLowerCase().includes('general');

        let tgMessages: any[] = [];
        if (!isGeneralOrRoot) {
          // Specific sub-topic: try with replyTo
          try {
            tgMessages = await Promise.race([
              client.getMessages(fetchPeer, { limit: 100, replyTo: numTopic }),
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Topic messages fetch timeout')), 6000))
            ]);
          } catch (err: any) {
            console.warn(`[Telegram MTProto] getMessages with replyTo=${numTopic} failed (${err?.message}), falling back to chat history`);
          }
        }

        // For General topic, or if replyTo returned 0 messages, fetch full chat history
        if (isGeneralOrRoot || tgMessages.length === 0) {
          try {
            const generalMessages = await Promise.race([
              client.getMessages(fetchPeer, { limit: 100 }),
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error('General messages fetch timeout')), 6000))
            ]);
            if (generalMessages && generalMessages.length > 0) {
              tgMessages = generalMessages;
            }
          } catch (err: any) {
            console.warn(`[Telegram MTProto] getMessages for chat ${chatId} failed:`, err?.message);
          }
        }

        let me = clientMeCache.get(session);
        if (!me) {
          me = (await client.getMe()) as any;
          if (me) clientMeCache.set(session, me);
        }
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
          let isAudio = false;
          let audioDuration: string | undefined = undefined;
          let fileName: string | undefined = undefined;
          let fileSize: string | undefined = undefined;

          // 1. Text extraction from GramJS / MTProto properties
          let text = '';
          if (typeof m.message === 'string' && m.message.trim()) {
            text = m.message.trim();
          } else if (typeof m.text === 'string' && m.text.trim()) {
            text = m.text.trim();
          } else if (typeof m.rawText === 'string' && m.rawText.trim()) {
            text = m.rawText.trim();
          } else if (typeof m.caption === 'string' && m.caption.trim()) {
            text = m.caption.trim();
          } else if (m.originalArgs && typeof m.originalArgs.message === 'string' && m.originalArgs.message.trim()) {
            text = m.originalArgs.message.trim();
          }

          let isLinkPreview = false;
          let linkUrl = '';
          let linkTitle = '';
          let linkDescription = '';
          let audioUrl: string | undefined = undefined;
          let pollData: any = undefined;

          // 2. Media handling (Photos, WebPages, Voice Notes, Documents, Video, Stickers, Location, Contacts, Polls)
          if (m.media || m.photo || m.document || m.voice || m.video || m.sticker) {
            const mClass = m.media?.className || m.media?._ || '';
            const isWebPage = mClass === 'MessageMediaWebPage' || Boolean(m.media?.webpage);
            const doc = m.document || m.media?.document;
            const audioAttr = doc?.attributes?.find((a: any) => a.className === 'DocumentAttributeAudio');
            const isVoiceDoc = Boolean(m.voice || (audioAttr && audioAttr.voice) || doc?.mimeType?.includes('ogg') || doc?.mimeType?.includes('opus'));
            const isAudioDoc = Boolean(m.audio || audioAttr || doc?.mimeType?.startsWith('audio/'));

            if (isWebPage) {
              isLinkPreview = true;
              linkUrl = m.media?.webpage?.url || '';
              linkTitle = m.media?.webpage?.title || m.media?.webpage?.siteName || '';
              linkDescription = m.media?.webpage?.description || '';
              imageUrl = `/api/channels/telegram/media?chatId=${encodeURIComponent(chatId)}&messageId=${m.id}&session=${encodeURIComponent(session || '')}`;
            } else if (mClass === 'MessageMediaPhoto' || m.photo) {
              imageUrl = `/api/channels/telegram/media?chatId=${encodeURIComponent(chatId)}&messageId=${m.id}&session=${encodeURIComponent(session || '')}`;
              if (!text) text = '';
            } else if (isVoiceDoc || isAudioDoc) {
              isAudio = true;
              audioUrl = `/api/channels/telegram/media?chatId=${encodeURIComponent(chatId)}&messageId=${m.id}&session=${encodeURIComponent(session || '')}`;
              const durSec = m.voice?.duration || audioAttr?.duration || (m.audio as any)?.duration || 15;
              audioDuration = `${Math.floor(durSec / 60)}:${String(durSec % 60).padStart(2, '0')}`;
              if (!text) text = '';
            } else if (m.video || m.videoNote) {
              if (!text) text = '';
            } else if (m.sticker) {
              if (!text) text = 'Sticker';
            } else if (mClass === 'MessageMediaDocument' || m.document) {
              const doc = m.document || m.media?.document;
              const fnAttr = doc?.attributes?.find((a: any) => a.className === 'DocumentAttributeFilename');
              fileName = fnAttr?.fileName || 'document.pdf';
              if (doc?.size) {
                fileSize = `${Math.round(doc.size / 1024)} KB`;
              }
              if (!text) text = fileName || 'File';
            } else if (mClass === 'MessageMediaContact') {
              const cName = [m.media?.firstName, m.media?.lastName].filter(Boolean).join(' ') || 'Contact';
              if (!text) text = `${cName} (${m.media?.phoneNumber || ''})`;
            } else if (mClass === 'MessageMediaGeo' || mClass === 'MessageMediaVenue') {
              if (!text) text = m.media?.title || 'Location';
            } else if (mClass === 'MessageMediaPoll' || m.media?.poll) {
              const p = m.media.poll;
              const res = m.media.results;
              const qText = typeof p?.question === 'string'
                ? p.question
                : (p?.question?.text || 'Sondage');
              text = qText;

              const totalVoters = Number(res?.totalVoters || 0);
              const resultsMap = new Map<string, { voters: number; chosen: boolean; correct?: boolean }>();
              if (res?.results && Array.isArray(res.results)) {
                for (const r of res.results) {
                  const optHex = r.option ? (Buffer.isBuffer(r.option) || r.option instanceof Uint8Array ? Buffer.from(r.option).toString('hex') : String(r.option)) : '';
                  if (optHex) {
                    resultsMap.set(optHex, {
                      voters: Number(r.voters || 0),
                      chosen: Boolean(r.chosen),
                      correct: Boolean(r.correct),
                    });
                  }
                }
              }

              const answers = Array.isArray(p?.answers) ? p.answers : [];
              let userHasVoted = false;
              const myChosenOptions: string[] = [];

              const parsedOptions = answers.map((ans: any, idx: number) => {
                const optHex = ans.option ? (Buffer.isBuffer(ans.option) || ans.option instanceof Uint8Array ? Buffer.from(ans.option).toString('hex') : String(ans.option)) : String(idx);
                const ansText = typeof ans.text === 'string' ? ans.text : (ans.text?.text || `Option ${idx + 1}`);
                const rInfo = resultsMap.get(optHex);
                const voters = rInfo?.voters || 0;
                const isChosen = Boolean(rInfo?.chosen);
                if (isChosen) {
                  userHasVoted = true;
                  myChosenOptions.push(optHex);
                }
                const percentage = totalVoters > 0 ? Math.round((voters / totalVoters) * 100) : 0;
                return {
                  text: ansText,
                  option: optHex,
                  voters,
                  percentage,
                  isChosen,
                  isCorrect: rInfo?.correct,
                };
              });

              if (!userHasVoted && res?.results && Array.isArray(res.results) && res.results.some((r: any) => Boolean(r.chosen))) {
                userHasVoted = true;
              }

              pollData = {
                id: String(p?.id || m.id),
                question: qText,
                options: parsedOptions,
                totalVoters,
                closed: Boolean(p?.closed),
                isPublic: Boolean(p?.publicVoters),
                multipleChoice: Boolean(p?.multipleChoice),
                quiz: Boolean(p?.quiz),
                hasVoted: userHasVoted,
                myChosenOptions,
                solution: res?.solution || undefined,
              };
            } else if (mClass === 'MessageMediaDice') {
              if (!text) text = `Dice: ${m.media?.value || ''}`;
            } else if (!text && mClass !== 'MessageMediaEmpty' && !isWebPage) {
              text = 'Media';
            }
          }

          // If text contains a URL, ensure linkUrl is populated for previews
          if (!linkUrl && text) {
            const urlMatch = text.match(/https?:\/\/[^\s]+/i);
            if (urlMatch) {
              linkUrl = urlMatch[0];
            }
          }

          // 3. Service messages & actions (chat join, accept, pin, call, etc.)
          let isServiceAction = false;
          let isCall = false;
          let callType: 'missed_voice' | 'missed_video' | 'incoming_voice' | 'incoming_video' | 'outgoing_voice' | 'outgoing_video' | undefined = undefined;
          let callDuration: string | undefined = undefined;
          let callOutcome: string | undefined = undefined;

          if (m.action || m.className === 'MessageService' || m._ === 'messageService') {
            const aClass = m.action?.className || m.action?._ || '';
            const who = senderName && senderName !== 'User' && senderName !== 'You' ? senderName : '';

            if (aClass.includes('PhoneCall') || aClass.includes('phoneCall') || aClass.includes('Call')) {
              isCall = true;
              isServiceAction = false;
              const isVideo = Boolean(m.action?.video);
              const durNum = Number(m.action?.duration || 0);
              if (durNum > 0) {
                callDuration = durNum >= 60 ? `${Math.floor(durNum / 60)}m ${durNum % 60}s` : `${durNum}s`;
              }
              const reasonClass = String(m.action?.reason?.className || m.action?.reason?._ || '').toLowerCase();
              const isMissed = reasonClass.includes('missed') || reasonClass.includes('busy') || (!isFromMe && durNum === 0);

              if (isVideo) {
                if (isFromMe) {
                  callType = 'outgoing_video';
                  callOutcome = durNum > 0 ? 'Outgoing' : 'Cancelled';
                  text = callDuration ? `Appel vidéo sortant (${callDuration})` : 'Appel vidéo sortant';
                } else if (isMissed) {
                  callType = 'missed_video';
                  callOutcome = 'Missed';
                  text = 'Appel vidéo manqué';
                } else {
                  callType = 'incoming_video';
                  callOutcome = 'Incoming';
                  text = callDuration ? `Appel vidéo entrant (${callDuration})` : 'Appel vidéo entrant';
                }
              } else {
                if (isFromMe) {
                  callType = 'outgoing_voice';
                  callOutcome = durNum > 0 ? 'Outgoing' : 'Cancelled';
                  text = callDuration ? `Appel vocal sortant (${callDuration})` : 'Appel vocal sortant';
                } else if (isMissed) {
                  callType = 'missed_voice';
                  callOutcome = 'Missed';
                  text = 'Appel vocal manqué';
                } else {
                  callType = 'incoming_voice';
                  callOutcome = 'Incoming';
                  text = callDuration ? `Appel vocal entrant (${callDuration})` : 'Appel vocal entrant';
                }
              }
            } else {
              isServiceAction = true;
              if (aClass.includes('MessageActionChatJoinedByRequest') || aClass.includes('ChatJoinedByRequest') || aClass.includes('JoinedByRequest')) {
                text = who ? `${who} was accepted to the group` : 'was accepted to the group';
              } else if (aClass.includes('MessageActionChatJoinedByLink') || aClass.includes('ChatJoinedByLink') || aClass.includes('JoinedByLink')) {
                text = who ? `${who} joined the group via invite link` : 'joined the group via invite link';
              } else if (aClass.includes('ChatAddUser')) {
                text = who ? `${who} joined the group` : 'joined the group';
              } else if (aClass.includes('ChatDeleteUser')) {
                text = who ? `${who} left the group` : 'left the group';
              } else if (aClass.includes('PinMessage')) {
                text = who ? `${who} pinned a message` : 'pinned a message';
              } else if (aClass.includes('ChatEditTitle')) {
                text = who ? `${who} changed group title to "${m.action.title || ''}"` : `Changed group title to "${m.action.title || ''}"`;
              } else if (aClass.includes('ChatEditPhoto')) {
                text = who ? `${who} changed group photo` : 'Changed group photo';
              } else if (aClass.includes('TopicCreate')) {
                text = who ? `${who} created the topic "${m.action.title || ''}"` : 'Created a new topic';
              } else if (aClass.includes('ContactSignUp')) {
                text = who ? `${who} joined Telegram` : 'Joined Telegram';
              } else {
                text = who ? `${who} was accepted to the group` : 'was accepted to the group';
              }
            }
          }

          // Fallback so bubble never renders blank
          if (!text) {
            text = 'Message';
          }

          let msgTopicId: string | undefined = undefined;
          const r = m.replyTo || m.reply_to;
          const replyTop = r?.replyToTopId || r?.reply_to_top_id;
          const replyMsg = r?.replyToMsgId || r?.reply_to_msg_id;
          const isForum = Boolean(r?.forumTopic || r?.forum_topic);

          if (replyTop) {
            msgTopicId = String(replyTop);
          } else if (isForum && replyMsg) {
            msgTopicId = String(replyMsg);
          } else if (topicId && !isGeneralOrRoot) {
            msgTopicId = String(topicId);
          } else if (isForum) {
            msgTopicId = '1';
          }

          return {
            id: String(m.id),
            sender: isFromMe ? 'operator' : 'customer',
            senderId,
            senderName,
            senderAvatar,
            topicId: msgTopicId,
            text,
            isEvent: isServiceAction,
            isSystem: isServiceAction,
            type: isServiceAction ? 'service' : undefined,
            isCall,
            callType,
            callDuration,
            callOutcome,
            imageUrl,
            hasImages: Boolean(imageUrl),
            isLinkPreview: Boolean(isLinkPreview || (linkUrl && imageUrl && !isAudio && !fileName)),
            linkUrl: linkUrl || undefined,
            linkTitle: linkTitle || undefined,
            linkDescription: linkDescription || undefined,
            isAudio,
            audioUrl,
            audioDuration,
            fileName,
            fileSize,
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: m.date ? m.date * 1000 : 0,
            delivered: true,
            seen: true,
            poll: pollData,
          };
        });

        if (messages.length > 0) {
          setCachedTelegramMessages(cacheKey, messages);
        }

        return NextResponse.json({
          success: true,
          isLive: true,
          count: messages.length,
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
          let botAudioUrl: string | undefined = undefined;
          let botIsAudio = false;
          let botAudioDuration = '0:15';

          if (Array.isArray(msg.photo) && msg.photo.length > 0) {
            const bestPhoto = msg.photo[msg.photo.length - 1];
            if (bestPhoto?.file_id) {
              botImgUrl = `/api/channels/telegram/media?fileId=${encodeURIComponent(bestPhoto.file_id)}&token=${encodeURIComponent(token)}`;
            }
          } else if (msg.voice?.file_id) {
            botIsAudio = true;
            botAudioUrl = `/api/channels/telegram/media?fileId=${encodeURIComponent(msg.voice.file_id)}&token=${encodeURIComponent(token)}`;
            if (msg.voice.duration) {
              botAudioDuration = `${Math.floor(msg.voice.duration / 60)}:${String(msg.voice.duration % 60).padStart(2, '0')}`;
            }
          } else if (msg.audio?.file_id) {
            botIsAudio = true;
            botAudioUrl = `/api/channels/telegram/media?fileId=${encodeURIComponent(msg.audio.file_id)}&token=${encodeURIComponent(token)}`;
            if (msg.audio.duration) {
              botAudioDuration = `${Math.floor(msg.audio.duration / 60)}:${String(msg.audio.duration % 60).padStart(2, '0')}`;
            }
          }

          messages.push({
            id: String(msg.message_id),
            topicId: threadId,
            sender: msg.from?.is_bot ? 'operator' : 'customer',
            senderId: sId,
            senderName: sName,
            senderAvatar: sId ? `/api/channels/telegram/avatar?id=${encodeURIComponent(sId)}&token=${encodeURIComponent(token)}` : undefined,
            text: msg.text || '',
            imageUrl: botImgUrl,
            hasImages: Boolean(botImgUrl),
            isAudio: botIsAudio,
            audioUrl: botAudioUrl,
            audioDuration: botIsAudio ? botAudioDuration : undefined,
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
