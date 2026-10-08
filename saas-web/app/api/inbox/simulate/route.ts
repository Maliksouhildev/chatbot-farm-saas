import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const systemPrompt = `You are an authentic Algerian commercial assistant for an e-commerce store.
Rules:
1. Speak natural, warm Algerian Darija (or Arabizi if customer uses Arabizi).
2. Prices in DZD (e.g. 3500 DA / 350 alf).
3. Delivery: 58 wilayas via Yalidine (Alger 400 DA, other wilayas 700 DA). Payment on delivery.
4. Keep answers concise, polite ("khoya", "khti", "marhba bik").`;

    // Try Google Gemini 2.5 Flash if key available
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && !geminiKey.startsWith('AIzaSy...')) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: message }] }],
          generationConfig: { temperature: 0.3 }
        })
      });
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return NextResponse.json({ reply });
    }

    // Default authentic Algerian fallback
    return NextResponse.json({
      reply: `Salam khoya! Marhba bik!\n\nIyeh kayen parfum Sauvage Élixir dayer 3500 DA (350 alf).\nKayen livraison l 58 wilayas via Yalidine (400 DA l Alger, 700 DA l les autres wilayas).\nW l paiement ykoun ki tel7aq la commande 3andek (paiement à la livraison).\n\nThab tcommander wahda doka?`
    });
  } catch (error: any) {
    return NextResponse.json({
      reply: 'Saha khoya! Kayen livraison 58 wilayas via Yalidine w paiement à la livraison.'
    });
  }
}
