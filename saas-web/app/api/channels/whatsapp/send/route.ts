import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { remoteJid, text, instance = 'default_instance' } = body;

    if (!remoteJid || !text) {
      return NextResponse.json({ error: 'Missing remoteJid or text' }, { status: 400 });
    }

    const evolutionUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    const apiKey = process.env.EVOLUTION_API_KEY || 'farm_evolution_master_secret_2026';

    // Sanitize comma-separated merged JIDs to determine the primary target recipient
    const jids = String(remoteJid)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const targetJid =
      jids.find((j) => j.endsWith('@g.us')) ||
      jids.find((j) => j.endsWith('@s.whatsapp.net')) ||
      jids[0];

    const sendRes = await fetch(`${evolutionUrl}/message/sendText/${instance}`, {
      method: 'POST',
      headers: { apikey: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        number: targetJid,
        text: text
      })
    });

    const result = await sendRes.json();

    if (!sendRes.ok) {
      return NextResponse.json({ error: result?.response || result?.message || 'Failed to send' }, { status: sendRes.status });
    }

    return NextResponse.json({
      success: true,
      messageId: result?.key?.id || result?.id,
      status: 'sent',
      result
    });
  } catch (err: any) {
    console.error('Error sending message:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
