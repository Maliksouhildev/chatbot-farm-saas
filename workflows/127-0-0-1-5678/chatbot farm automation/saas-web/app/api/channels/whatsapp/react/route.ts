import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { remoteJid, msgId, reaction, fromMe = false, instance = 'default_instance' } = body;

    if (!remoteJid || !msgId || !reaction) {
      return NextResponse.json({ error: 'Missing remoteJid, msgId or reaction' }, { status: 400 });
    }

    const evolutionUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    const apiKey = process.env.EVOLUTION_API_KEY || 'farm_evolution_master_secret_2026';

    const jidList = remoteJid.split(',').map((j: string) => j.trim()).filter(Boolean);
    const targetJid = jidList.find((j: string) => j.includes('@s.whatsapp.net') || j.includes('@g.us')) || jidList[0] || remoteJid;

    const res = await fetch(`${evolutionUrl}/message/sendReaction/${instance}`, {
      method: 'POST',
      headers: { apikey: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: {
          remoteJid: targetJid,
          fromMe: Boolean(fromMe),
          id: msgId
        },
        reaction
      })
    });

    const result = await res.json().catch(() => ({}));
    return NextResponse.json({
      success: res.ok,
      result
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
