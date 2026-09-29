import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

const DEFAULT_BOT_ID = '71d0f49e-7ae7-4153-aab6-cadafeaf1332';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      recipientId, 
      text, 
      accessToken: bodyToken, 
      igId, 
      pageId, 
      recipientHandle, 
      recipientName,
      sessionId: bodySessionId 
    } = body;
    
    const accessToken = bodyToken || process.env.META_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN;
    const sessionId = bodySessionId || process.env.INSTAGRAM_SESSION_ID;

    const finalRecipientId = recipientId || body.conversationId || body.threadId;
    const finalText = text || body.message;

    if (!finalRecipientId || !finalText) {
      return NextResponse.json({ error: 'recipientId and text are required' }, { status: 400 });
    }

    const cleanRaw = (recipientHandle || finalRecipientId || 'instagram_customer').replace(/^instagram_|^@/, '');
    const cleanHandle = `@${cleanRaw}`;
    const now = new Date().toISOString();

    // 1. Resolve active bot_id
    let botId = DEFAULT_BOT_ID;
    try {
      const { data: botList } = await supabaseAdmin.from('bots').select('id').limit(1);
      if (botList && botList.length > 0) {
        botId = botList[0].id;
      }
    } catch {}

    // 2. Resolve or create Supabase conversation record
    let conversationId: string | null = null;
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(finalRecipientId);
      if (isUUID) {
        conversationId = finalRecipientId;
      } else {
        const { data: existing } = await supabaseAdmin
          .from('conversations')
          .select('id')
          .eq('channel_type', 'instagram')
          .eq('contact_phone', cleanHandle)
          .limit(1);

        if (existing && existing.length > 0) {
          conversationId = existing[0].id;
        }
      }

      if (conversationId) {
        await supabaseAdmin
          .from('conversations')
          .update({
            last_message_at: now,
            contact_name: recipientName || cleanRaw
          })
          .eq('id', conversationId);
      } else {
        const { data: created } = await supabaseAdmin
          .from('conversations')
          .insert({
            bot_id: botId,
            channel_type: 'instagram',
            contact_phone: cleanHandle,
            contact_name: recipientName || cleanRaw,
            last_message_at: now
          })
          .select();

        if (created && created.length > 0) {
          conversationId = created[0].id;
        }
      }

      // 3. Insert outbound message into chat_messages
      if (conversationId) {
        await supabaseAdmin
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            sender: 'human_operator',
            message_type: 'text',
            content: finalText.trim(),
            created_at: now
          });
      }
    } catch (dbErr) {
      console.warn('[Instagram Send DB Notice]:', dbErr);
    }

    let liveDelivered = false;
    let dispatchMethod = 'local_crm';
    let dispatchDetails: any = null;

    // 4. METHOD A: DIRECT INSTAGRAM SESSION DISPATCH (Private Web Direct API)
    if (sessionId) {
      try {
        const clientContext = String(Date.now() + Math.floor(Math.random() * 1000));
        const formData = new URLSearchParams();
        formData.append('text', finalText.trim());
        formData.append('client_context', clientContext);
        formData.append('mutation_token', clientContext);

        if (/^\d+$/.test(finalRecipientId)) {
          formData.append('recipient_users', JSON.stringify([[finalRecipientId]]));
        } else if (/^thread_|\d+_\d+/.test(finalRecipientId)) {
          formData.append('thread_ids', JSON.stringify([finalRecipientId.replace(/^thread_/, '')]));
        }

        const directRes = await fetch('https://i.instagram.com/api/v1/direct_v2/threads/broadcast/text/', {
          method: 'POST',
          headers: {
            'User-Agent': 'Instagram 270.0.0.17.348 Android (31/12; 420dpi; 1080x2400; Xiaomi; M2102J20SG; vayu; qcom; en_US; 443422026)',
            'Cookie': `sessionid=${sessionId.trim()};`,
            'X-IG-App-ID': '936619743392459',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': '*/*',
          },
          body: formData.toString()
        });

        if (directRes.ok) {
          const directData = await directRes.json();
          liveDelivered = true;
          dispatchMethod = 'direct_session';
          dispatchDetails = directData;
        } else {
          console.warn('[Instagram Direct API Outbound Notice]: HTTP', directRes.status);
        }
      } catch (directErr: any) {
        console.warn('[Instagram Direct Outbound Notice]:', directErr.message);
      }
    }

    // 5. METHOD B: META GRAPH API DISPATCH
    if (!liveDelivered && accessToken) {
      try {
        const targetId = pageId || igId || 'me';
        const endpoint = `https://graph.facebook.com/v19.0/${targetId}/messages?access_token=${accessToken}`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: finalRecipientId.replace(/^@/, '') },
            message: { text: finalText.trim() }
          })
        });

        const data = await res.json();
        if (!data.error) {
          liveDelivered = true;
          dispatchMethod = 'meta_graph_api';
          dispatchDetails = data;
        } else {
          console.warn('[Meta Graph Outbound Notice]:', data.error.message);
        }
      } catch (metaErr: any) {
        console.warn('[Meta Outbound Error]:', metaErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      delivered: liveDelivered,
      mode: dispatchMethod,
      conversationId,
      recipient: cleanHandle,
      details: dispatchDetails,
      message: liveDelivered 
        ? `Message sent to ${cleanHandle} via ${dispatchMethod === 'direct_session' ? 'Instagram Direct' : 'Meta API'}`
        : `Message saved in CRM for ${cleanHandle}`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
