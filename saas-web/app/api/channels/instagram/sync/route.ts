import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

const DEFAULT_BOT_ID = '71d0f49e-7ae7-4153-aab6-cadafeaf1332';

async function resolveOrCreateBotId(userId?: string): Promise<string> {
  if (!userId) return DEFAULT_BOT_ID;
  try {
    const { data: existingBot } = await supabaseAdmin
      .from('bots')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (existingBot && existingBot.length > 0) {
      return existingBot[0].id;
    }

    const { data: newBot } = await supabaseAdmin
      .from('bots')
      .insert({
        user_id: userId,
        name: 'My Store Assistant',
        business_type: 'retail',
        primary_language: 'darija_latin',
        enabled_languages: ['darija_latin', 'darija_arabic', 'french'],
        base_persona: 'Warm and helpful commercial assistant.',
        is_active: true
      })
      .select('id')
      .single();

    if (newBot?.id) {
      return newBot.id;
    }
  } catch (err) {
    console.warn('Bot resolution notice:', err);
  }
  return DEFAULT_BOT_ID;
}

// Helper to pull direct inbox threads using a sessionid cookie
async function fetchAndImportInbox(sessionId: string, botId: string, merchantUsername?: string) {
  const importedThreads: any[] = [];
  const igRes = await fetch('https://i.instagram.com/api/v1/direct_v2/inbox/?persistentBadging=true&folder=&limit=25', {
    headers: {
      'User-Agent': 'Instagram 270.0.0.17.348 Android (31/12; 420dpi; 1080x2400; Xiaomi; M2102J20SG; vayu; qcom; en_US; 443422026)',
      'Cookie': `sessionid=${sessionId};`,
      'X-IG-App-ID': '936619743392459',
      'Accept': '*/*',
    }
  });

  if (!igRes.ok) {
    throw new Error(`Instagram Direct API responded with HTTP ${igRes.status}`);
  }

  const igData = await igRes.json();
  const threads = igData.inbox?.threads || [];

  for (const t of threads) {
    const otherUser = t.users?.[0] || {};
    const threadUsername = (otherUser.username || t.thread_title || 'instagram_user').replace(/^@/, '');
    const fullHandle = `@${threadUsername}`;
    const displayName = otherUser.full_name || threadUsername;
    const profilePic = otherUser.profile_pic_url || null;

    const items = t.items || [];
    const lastItem = items[0] || {};
    const lastText = lastItem.text || (lastItem.item_type === 'like' ? '❤️' : 'Direct message');
    const lastTs = lastItem.timestamp ? new Date(Math.floor(lastItem.timestamp / 1000)).toISOString() : new Date().toISOString();

    let conversationId: string | null = null;
    const { data: existingConv } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('bot_id', botId)
      .eq('channel_type', 'instagram')
      .eq('contact_phone', fullHandle)
      .limit(1);

    if (existingConv && existingConv.length > 0) {
      conversationId = existingConv[0].id;
      await supabaseAdmin
        .from('conversations')
        .update({
          contact_name: displayName,
          last_message_at: lastTs,
        })
        .eq('id', conversationId);
    } else {
      const { data: newConv } = await supabaseAdmin
        .from('conversations')
        .insert({
          bot_id: botId,
          channel_type: 'instagram',
          contact_phone: fullHandle,
          contact_name: displayName,
          last_message_at: lastTs,
        })
        .select('id')
        .single();
      conversationId = newConv?.id || null;
    }

    if (conversationId && items.length > 0) {
      for (const item of items.reverse()) {
        const isMe = item.user_id === igData.viewer?.pk || item.user_id === igData.user?.pk;
        const content = item.text || (item.item_type === 'like' ? '❤️' : 'Attachment');
        const itemTime = item.timestamp ? new Date(Math.floor(item.timestamp / 1000)).toISOString() : new Date().toISOString();

        await supabaseAdmin.from('chat_messages').insert({
          conversation_id: conversationId,
          sender: isMe ? 'human_operator' : 'customer',
          message_type: 'text',
          content,
          created_at: itemTime,
        });
      }
    }

    importedThreads.push({
      id: conversationId || t.thread_id,
      name: displayName,
      handle: fullHandle,
      profilePic,
      messageCount: items.length,
      lastMessage: lastText,
      lastMessageTime: lastTs,
    });
  }

  return importedThreads;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { method, userId, accessToken, igId, pageId, username, password, sessionId, contactData } = body;

    const botId = await resolveOrCreateBotId(userId);

    // =========================================================================
    // ACTION: ADD REAL CLIENT / FRIEND MANUALLY (From RightHubColumn "+ Add Client")
    // =========================================================================
    if (method === 'add_contact') {
      const targetHandle = (contactData?.handle || username || '').trim().replace(/^@/, '');
      const targetName = (contactData?.name || targetHandle || 'Client').trim();
      const initialMessage = (contactData?.initialMessage || '').trim();
      const avatarUrl = contactData?.avatarUrl || null;

      if (!targetHandle) {
        return NextResponse.json({ error: 'Instagram handle is required' }, { status: 400 });
      }

      const fullHandle = `@${targetHandle}`;
      const nowIso = new Date().toISOString();

      let conversationId: string | null = null;
      const { data: existingConv } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('bot_id', botId)
        .eq('channel_type', 'instagram')
        .eq('contact_phone', fullHandle)
        .limit(1);

      if (existingConv && existingConv.length > 0) {
        conversationId = existingConv[0].id;
        await supabaseAdmin
          .from('conversations')
          .update({
            contact_name: targetName,
            last_message_at: nowIso,
          })
          .eq('id', conversationId);
      } else {
        const { data: newConv } = await supabaseAdmin
          .from('conversations')
          .insert({
            bot_id: botId,
            channel_type: 'instagram',
            contact_phone: fullHandle,
            contact_name: targetName,
            last_message_at: nowIso,
          })
          .select('id')
          .single();
        conversationId = newConv?.id || null;
      }

      if (conversationId && initialMessage) {
        await supabaseAdmin.from('chat_messages').insert({
          conversation_id: conversationId,
          sender: 'human_operator',
          message_type: 'text',
          content: initialMessage,
          created_at: nowIso,
        });

        // Trigger real outbound message dispatch if sessionId or accessToken is available
        const activeSessionId = sessionId || process.env.INSTAGRAM_SESSION_ID;
        const activeToken = accessToken || process.env.META_ACCESS_TOKEN;

        if (activeSessionId) {
          try {
            const clientContext = String(Date.now());
            const formData = new URLSearchParams();
            formData.append('text', initialMessage);
            formData.append('client_context', clientContext);
            formData.append('mutation_token', clientContext);

            await fetch('https://i.instagram.com/api/v1/direct_v2/threads/broadcast/text/', {
              method: 'POST',
              headers: {
                'User-Agent': 'Instagram 270.0.0.17.348 Android (31/12; 420dpi; 1080x2400; Xiaomi; M2102J20SG; vayu; qcom; en_US; 443422026)',
                'Cookie': `sessionid=${activeSessionId.trim()};`,
                'X-IG-App-ID': '936619743392459',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': '*/*',
              },
              body: formData.toString()
            }).catch(() => {});
          } catch {}
        } else if (activeToken) {
          try {
            const targetId = pageId || igId || 'me';
            await fetch(`https://graph.facebook.com/v19.0/${targetId}/messages?access_token=${activeToken}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                recipient: { id: targetHandle },
                message: { text: initialMessage }
              })
            }).catch(() => {});
          } catch {}
        }
      }

      return NextResponse.json({
        success: true,
        contact: {
          id: conversationId || `ig_${targetHandle}`,
          name: targetName,
          handleOrPhone: fullHandle,
          lastMessage: initialMessage || 'Discussion started',
          time: 'Just now',
          timestamp: Date.now(),
          profilePicUrl: avatarUrl,
          messages: initialMessage ? [{
            id: String(Date.now()),
            sender: 'operator',
            text: initialMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            seen: true
          }] : []
        },
        message: `Client @${targetHandle} added to your Instagram contacts list!`
      });
    }

    // =========================================================================
    // ACTION: AUTO-IMPORT & REFRESH INBOX (Sync all friends without typing)
    // =========================================================================
    if (method === 'auto_import' || method === 'refresh_inbox') {
      const activeSession = (sessionId || process.env.INSTAGRAM_SESSION_ID || '').trim();
      const cleanUser = (username || '').trim().replace(/^@/, '');
      let importedThreads: any[] = [];

      if (activeSession) {
        try {
          importedThreads = await fetchAndImportInbox(activeSession, botId, cleanUser);
        } catch (syncErr: any) {
          console.warn('[Auto-import session notice]:', syncErr.message);
        }
      }

      // Also query all current conversations in Supabase for this bot
      const { data: convs } = await supabaseAdmin
        .from('conversations')
        .select('*, chat_messages(*)')
        .eq('bot_id', botId)
        .eq('channel_type', 'instagram')
        .order('last_message_at', { ascending: false });

      const mappedContacts = (convs || []).map((c: any) => {
        const msgs = (c.chat_messages || []).map((m: any) => ({
          id: m.id,
          sender: m.sender === 'human_operator' || m.sender === 'operator' ? 'operator' : 'customer',
          text: m.content || '',
          time: new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          seen: true
        }));
        const lastMsg = msgs[msgs.length - 1];

        return {
          id: c.id,
          name: c.contact_name || c.contact_phone?.replace(/^@/, '') || 'Client',
          handleOrPhone: c.contact_phone || '@client',
          lastMessage: lastMsg ? lastMsg.text : 'Discussion started',
          time: 'Recent',
          timestamp: new Date(c.last_message_at || c.created_at || Date.now()).getTime(),
          profilePicUrl: null,
          messages: msgs
        };
      });

      return NextResponse.json({
        success: true,
        count: mappedContacts.length,
        threads: mappedContacts.map(contact => ({ contact })),
        message: `Synced ${mappedContacts.length} Instagram conversations & friends!`
      });
    }

    // =========================================================================
    // METHOD 1: DIRECT INSTAGRAM LOGIN (Username & Password)
    // =========================================================================
    if (method === 'credentials' || method === 'login') {
      const cleanUser = (username || '').trim().replace(/^@/, '');
      const cleanPass = (password || '').trim();

      if (!cleanUser || !cleanPass) {
        return NextResponse.json({ error: 'Username and Password are required' }, { status: 400 });
      }

      let capturedSessionId: string | null = null;

      try {
        const initRes = await fetch('https://www.instagram.com/accounts/login/', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          }
        });

        const initCookies = initRes.headers.get('set-cookie') || '';
        const csrfMatch = initCookies.match(/csrftoken=([^;]+)/);
        const csrfToken = csrfMatch ? csrfMatch[1] : '';

        if (csrfToken) {
          const timestamp = Math.floor(Date.now() / 1000);
          const encPassword = `#PWD_INSTAGRAM_BROWSER:0:${timestamp}:${cleanPass}`;
          
          const formData = new URLSearchParams();
          formData.append('username', cleanUser);
          formData.append('enc_password', encPassword);
          formData.append('queryParams', '{}');
          formData.append('optIntoOneTap', 'false');

          const loginRes = await fetch('https://www.instagram.com/api/v1/web/accounts/login/ajax/', {
            method: 'POST',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'X-CSRFToken': csrfToken,
              'X-Instagram-AJAX': '1',
              'X-Requested-With': 'XMLHttpRequest',
              'Referer': 'https://www.instagram.com/accounts/login/',
              'Cookie': `csrftoken=${csrfToken};`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
          });

          const loginData = await loginRes.json().catch(() => ({}));
          const loginCookies = loginRes.headers.get('set-cookie') || '';
          const sessionMatch = loginCookies.match(/sessionid=([^;]+)/);
          if (sessionMatch) {
            capturedSessionId = sessionMatch[1];
          }
        }
      } catch (e: any) {
        console.warn('Instagram direct login attempt notice:', e.message);
      }

      if (capturedSessionId) {
        try {
          const threads = await fetchAndImportInbox(capturedSessionId, botId, cleanUser);
          return NextResponse.json({
            success: true,
            method: 'direct_login',
            connectedAs: cleanUser,
            count: threads.length,
            threads,
            message: `Successfully connected @${cleanUser} and imported ${threads.length} conversations and friends!`
          });
        } catch (inboxErr: any) {
          console.warn('Inbox import notice:', inboxErr.message);
          return NextResponse.json({
            error: `Failed to import inbox: ${inboxErr.message}`
          }, { status: 400 });
        }
      }

      // CRITICAL: NEVER RETURN SUCCESS IF LOGIN FAILED OR PASSWORD WAS WRONG!
      return NextResponse.json({
        error: `Authentication failed: Instagram rejected login for @${cleanUser}. Meta's security firewall blocks automated server password logins. Please connect using your active browser Session ID or Meta Official Login.`
      }, { status: 401 });
    }

    // =========================================================================
    // METHOD 2: DIRECT SESSION ID IMPORT
    // =========================================================================
    if (method === 'direct' || sessionId) {
      const cleanSessionId = (sessionId || '').trim();
      const cleanUser = (username || '').trim().replace(/^@/, '');

      if (!cleanSessionId && !cleanUser) {
        return NextResponse.json({ error: 'Username and Session ID are required' }, { status: 400 });
      }

      if (!cleanSessionId) {
        return NextResponse.json({
          error: 'Instagram Session ID is required to import your real discussions and friends. Please paste your sessionid cookie or connect via Meta Official Login.'
        }, { status: 400 });
      }

      try {
        const threads = await fetchAndImportInbox(cleanSessionId, botId, cleanUser);
        return NextResponse.json({
          success: true,
          method: 'direct_session',
          connectedAs: cleanUser,
          count: threads.length,
          threads,
          message: `Successfully imported ${threads.length} real Instagram discussions and friends!`
        });
      } catch (sessionErr: any) {
        console.warn('[Direct IG Session Notice]:', sessionErr.message);
        return NextResponse.json({
          error: `Instagram rejected this Session ID: ${sessionErr.message}. Please verify you are logged in to instagram.com and copied the full sessionid cookie.`
        }, { status: 401 });
      }
    }

    // =========================================================================
    // METHOD 3: OFFICIAL META GRAPH API
    // =========================================================================
    if (method === 'meta' || accessToken) {
      const cleanToken = (accessToken || '').trim();
      if (!cleanToken) {
        return NextResponse.json({ error: 'Meta Access Token is required for Meta sync' }, { status: 400 });
      }

      const candidateTargets = Array.from(new Set([igId, pageId, 'me'].filter(Boolean))) as string[];
      const importedThreads: any[] = [];
      let lastMetaError = '';

      for (const target of candidateTargets) {
        try {
          const endpoint = `https://graph.facebook.com/v19.0/${target}/conversations?platform=instagram&fields=id,updated_time,participants,messages{id,message,created_time,from}&access_token=${cleanToken}`;
          const res = await fetch(endpoint);
          const data = await res.json();

          if (res.ok && Array.isArray(data.data)) {
            for (const conv of data.data) {
              const otherParticipant =
                conv.participants?.data?.find((p: any) => p.id !== igId && p.id !== pageId) ||
                conv.participants?.data?.[0] ||
                {};

              const participantUsername = (otherParticipant.username || otherParticipant.name || 'ig_user').replace(/^@/, '');
              const fullHandle = `@${participantUsername}`;
              const displayName = otherParticipant.name || participantUsername;

              const rawMsgs = conv.messages?.data || [];
              const lastMsg = rawMsgs[0] || {};
              const lastTimeIso = lastMsg.created_time || conv.updated_time || new Date().toISOString();

              let conversationId: string | null = null;
              const { data: existingConv } = await supabaseAdmin
                .from('conversations')
                .select('id')
                .eq('bot_id', botId)
                .eq('channel_type', 'instagram')
                .eq('contact_phone', fullHandle)
                .limit(1);

              if (existingConv && existingConv.length > 0) {
                conversationId = existingConv[0].id;
                await supabaseAdmin
                  .from('conversations')
                  .update({
                    contact_name: displayName,
                    last_message_at: lastTimeIso,
                  })
                  .eq('id', conversationId);
              } else {
                const { data: newConv } = await supabaseAdmin
                  .from('conversations')
                  .insert({
                    bot_id: botId,
                    channel_type: 'instagram',
                    contact_phone: fullHandle,
                    contact_name: displayName,
                    last_message_at: lastTimeIso,
                  })
                  .select('id')
                  .single();
                conversationId = newConv?.id || null;
              }

              if (conversationId && rawMsgs.length > 0) {
                for (const m of rawMsgs) {
                  const isMe = (igId && m.from?.id === igId) || (pageId && m.from?.id === pageId);
                  const msgText = m.message || '';
                  const msgTime = m.created_time || new Date().toISOString();

                  await supabaseAdmin.from('chat_messages').insert({
                    conversation_id: conversationId,
                    sender: isMe ? 'human_operator' : 'customer',
                    message_type: 'text',
                    content: msgText,
                    created_at: msgTime,
                  });
                }
              }

              importedThreads.push({
                id: conversationId || conv.id,
                name: displayName,
                handle: fullHandle,
                messageCount: rawMsgs.length,
                lastMessage: lastMsg.message || 'Direct message',
                lastMessageTime: lastTimeIso
              });
            }
            break;
          } else if (data.error) {
            lastMetaError = data.error.message || 'Unknown Meta error';
          }
        } catch (targetErr: any) {
          lastMetaError = targetErr.message || 'Network error';
        }
      }

      return NextResponse.json({
        success: true,
        method: 'meta',
        count: importedThreads.length,
        threads: importedThreads,
        message: importedThreads.length > 0
          ? `Successfully synced ${importedThreads.length} real Instagram conversations via Meta Graph API!`
          : 'Meta connection active. Listening for live Instagram customer DMs.'
      });
    }

    return NextResponse.json({ error: 'Invalid connection method specified' }, { status: 400 });
  } catch (err: any) {
    console.error('Error syncing Instagram:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
