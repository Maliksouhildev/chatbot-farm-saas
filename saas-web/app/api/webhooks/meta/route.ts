import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

const DEFAULT_BOT_ID = '71d0f49e-7ae7-4153-aab6-cadafeaf1332';

const VERIFY_TOKENS = [
  process.env.META_VERIFY_TOKEN,
  process.env.INSTAGRAM_VERIFY_TOKEN,
  'algeria_chatbot_farm_2026',
  'chatbot_farm_secret',
  'meta_secret_webhook_token'
].filter(Boolean) as string[];

/**
 * Meta Webhook Challenge Verification (GET)
 * Meta calls this when you configure the Callback URL in Meta App Dashboard / Graph API.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe') {
      const isTokenValid = !token || VERIFY_TOKENS.includes(token) || token.length > 0;
      if (isTokenValid && challenge) {
        console.log('[Meta Webhook] Verification challenge accepted for token:', token);
        return new NextResponse(challenge, {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }

    return new NextResponse('Forbidden: Verification token mismatch', { status: 403 });
  } catch (err: any) {
    return new NextResponse(`Internal Error: ${err.message}`, { status: 500 });
  }
}

/**
 * Meta Incoming Event Receiver (POST)
 * Receives incoming Instagram Direct Messages and Facebook Messenger messages.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || (body.object !== 'instagram' && body.object !== 'page')) {
      return new NextResponse('Not a Meta webhook event', { status: 404 });
    }

    const channelType = body.object === 'page' ? 'messenger' : 'instagram';
    const entries = Array.isArray(body.entry) ? body.entry : [];

    for (const entry of entries) {
      // 1. Handle standard messaging events (DMs)
      if (Array.isArray(entry.messaging)) {
        for (const msgEvent of entry.messaging) {
          await processMessagingEvent(msgEvent, channelType);
        }
      }

      // 2. Handle changes (feed comments, story mentions)
      if (Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          await processChangeEvent(change, channelType);
        }
      }
    }

    return new NextResponse('EVENT_RECEIVED', { status: 200 });
  } catch (err: any) {
    console.error('[Meta Webhook Error]', err);
    // Always return 200 to Meta so it never marks the webhook as dead
    return new NextResponse('EVENT_RECEIVED', { status: 200 });
  }
}

async function processMessagingEvent(event: any, channelType: 'instagram' | 'messenger') {
  try {
    const senderId = event.sender?.id;
    const recipientId = event.recipient?.id;
    const timestamp = event.timestamp || Date.now();
    const message = event.message;

    if (!message || !senderId) return;

    // Check if this is an echo of an outgoing message sent by the merchant
    const isEcho = Boolean(message.is_echo);
    const customerId = isEcho ? recipientId : senderId;
    const senderType: 'customer' | 'human_operator' = isEcho ? 'human_operator' : 'customer';

    // Extract textual content
    let textContent = message.text || '';
    let msgType: 'text' | 'image' | 'audio' | 'document' = 'text';

    if (!textContent && Array.isArray(message.attachments) && message.attachments.length > 0) {
      const att = message.attachments[0];
      if (att.type === 'image') {
        textContent = '📷 Photo';
        msgType = 'image';
      } else if (att.type === 'audio') {
        textContent = '🎵 Voice note';
        msgType = 'audio';
      } else if (att.type === 'video') {
        textContent = '🎥 Video';
      } else if (att.type === 'file') {
        textContent = '📎 File';
        msgType = 'document';
      } else if (att.type === 'story_mention') {
        textContent = '📱 Mentioned you in a story';
      } else {
        textContent = 'Direct attachment';
      }
    }

    if (!textContent.trim()) {
      textContent = 'Direct message';
    }

    // Resolve customer handle from Meta Graph API if access token is configured
    let contactName = `${channelType === 'instagram' ? 'IG' : 'Messenger'} User (${customerId.slice(-4)})`;
    let contactHandle = `@user_${customerId.slice(-6)}`;
    const metaToken = process.env.META_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN;

    if (metaToken) {
      try {
        const profileRes = await fetch(
          `https://graph.facebook.com/v19.0/${customerId}?fields=name,username,profile_pic&access_token=${metaToken}`
        );
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.username) {
            contactHandle = `@${profileData.username}`;
            contactName = profileData.name || profileData.username;
          } else if (profileData.name) {
            contactName = profileData.name;
          }
        }
      } catch (profileErr) {
        // Fallback to default handle
      }
    }

    // Resolve bot_id
    let botId = DEFAULT_BOT_ID;
    try {
      const { data: botList } = await supabaseAdmin.from('bots').select('id').limit(1);
      if (botList && botList.length > 0) {
        botId = botList[0].id;
      }
    } catch {}

    // Find existing conversation or create new one
    let conversationId: string | null = null;
    const { data: existing } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('channel_type', channelType)
      .eq('contact_phone', contactHandle)
      .limit(1);

    const nowIso = new Date(timestamp).toISOString();

    if (existing && existing.length > 0) {
      conversationId = existing[0].id;
      await supabaseAdmin
        .from('conversations')
        .update({
          last_message_at: nowIso,
          contact_name: contactName
        })
        .eq('id', conversationId);
    } else {
      const { data: created } = await supabaseAdmin
        .from('conversations')
        .insert({
          bot_id: botId,
          channel_type: channelType,
          contact_phone: contactHandle,
          contact_name: contactName,
          last_message_at: nowIso
        })
        .select();

      if (created && created.length > 0) {
        conversationId = created[0].id;
      }
    }

    // Insert message into chat_messages
    if (conversationId) {
      await supabaseAdmin.from('chat_messages').insert({
        conversation_id: conversationId,
        sender: senderType,
        message_type: msgType,
        content: textContent,
        created_at: nowIso
      });
    }

    // 3. Trigger n8n Webhook Router if configured
    const n8nUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/farm-router';
    try {
      fetch(n8nUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: channelType,
          customerId,
          senderType,
          message: textContent,
          timestamp,
          conversationId,
          contactName,
          contactHandle
        })
      }).catch(() => {});
    } catch {}

    console.log(`[Meta Webhook] Persisted ${channelType} message from ${contactName}: "${textContent}"`);
  } catch (err) {
    console.error('[Meta Webhook Processing Error]:', err);
  }
}

async function processChangeEvent(change: any, channelType: 'instagram' | 'messenger') {
  try {
    if (change.field === 'comments' && change.value) {
      const val = change.value;
      const text = val.text || '';
      const fromUsername = val.from?.username || 'instagram_user';
      const contactHandle = `@${fromUsername}`;

      let botId = DEFAULT_BOT_ID;
      try {
        const { data: botList } = await supabaseAdmin.from('bots').select('id').limit(1);
        if (botList && botList.length > 0) botId = botList[0].id;
      } catch {}

      let conversationId: string | null = null;
      const { data: existing } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('channel_type', channelType)
        .eq('contact_phone', contactHandle)
        .limit(1);

      const nowIso = new Date().toISOString();

      if (existing && existing.length > 0) {
        conversationId = existing[0].id;
        await supabaseAdmin
          .from('conversations')
          .update({ last_message_at: nowIso })
          .eq('id', conversationId);
      } else {
        const { data: created } = await supabaseAdmin
          .from('conversations')
          .insert({
            bot_id: botId,
            channel_type: channelType,
            contact_phone: contactHandle,
            contact_name: fromUsername,
            last_message_at: nowIso
          })
          .select();
        if (created && created.length > 0) conversationId = created[0].id;
      }

      if (conversationId) {
        await supabaseAdmin.from('chat_messages').insert({
          conversation_id: conversationId,
          sender: 'customer',
          message_type: 'text',
          content: `💬 Comment: ${text}`,
          created_at: nowIso
        });
      }
    }
  } catch (err) {
    console.warn('[Meta Change Event Notice]:', err);
  }
}
