import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { conversationId, channelType, recipient, content } = await req.json();

    if (!content || !conversationId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // 1. Insert message into Supabase as human_operator
    const { data: msgData, error: msgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender: 'human_operator',
        message_type: 'text',
        content: content
      })
      .select()
      .single();

    // 2. Update conversation timestamp
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    // 3. Dispatch to Evolution API if WhatsApp
    if (channelType === 'whatsapp' && recipient) {
      const evolutionUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
      const evolutionKey = process.env.EVOLUTION_API_KEY || 'farm_evolution_master_secret_2026';
      
      const cleanNumber = recipient.replace('@s.whatsapp.net', '').replace('@c.us', '');

      fetch(`${evolutionUrl}/message/sendText/default_instance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionKey
        },
        body: JSON.stringify({
          number: cleanNumber,
          text: content
        })
      }).catch(err => console.log('Evolution outbound error:', err));
    }

    return NextResponse.json({ success: true, message: msgData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
