import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const instance = searchParams.get('instance') || 'default_instance';
    
    const body = await req.json();
    const message = body.message;

    if (!message) {
      return NextResponse.json({ error: 'Missing message object' }, { status: 400 });
    }

    const evolutionUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    const apiKey = process.env.EVOLUTION_API_KEY || 'farm_evolution_master_secret_2026';

    const res = await fetch(`${evolutionUrl}/chat/getBase64FromMediaMessage/${instance}`, {
      method: 'POST',
      headers: { apikey: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Evolution API error fetching media:', errorText);
      return NextResponse.json({ error: 'Failed to fetch media from Evolution API' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Error fetching whatsapp media:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
