import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, instance = 'default_instance' } = body;

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
      return NextResponse.json({ error: 'Failed to fetch media from Evolution API' }, { status: res.status });
    }

    const data = await res.json();
    
    // Evolution API returns { base64: "...", mimetype: "..." }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Error fetching media base64:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
