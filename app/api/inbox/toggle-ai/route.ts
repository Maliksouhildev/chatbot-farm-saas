import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { conversationId, enabled } = await req.json();

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    await supabase
      .from('conversations')
      .update({ ai_enabled: enabled })
      .eq('id', conversationId);

    return NextResponse.json({ success: true, ai_enabled: enabled });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
