import { NextResponse } from 'next/server';
import { buildSystemPrompt, BotPromptSettings } from '@/lib/darija_prompt_builder';

export async function POST(req: Request) {
  try {
    const bodyJson = await req.json().catch(() => ({}));
    const message = bodyJson.message || '';
    const hasImages = Boolean(bodyJson.hasImages || bodyJson.image);
    const hasAudios = Boolean(bodyJson.hasAudios || bodyJson.audio);
    const botSettings = bodyJson.botSettings;

    let systemPrompt = '';
    if (botSettings?.basePersona || botSettings?.customInstructions || botSettings?.botName) {
      const promptSettings: BotPromptSettings = {
        botName: botSettings.botName || 'El Bahdja Assistant',
        businessName: botSettings.businessName || 'Chatbot Farm Store',
        primaryLanguage: botSettings.primaryLanguage || 'darija_latin',
        enabledLanguages: ['darija_latin', 'darija_arabic', 'french', 'english'],
        basePersona: botSettings.basePersona || 'Warm Algerian store assistant offering prompt COD delivery.',
        customInstructions: botSettings.customInstructions || 'Prices in DZD. Cash on delivery across 58 wilayas via Yalidine. Payment on receipt.',
        contactHumanNumber: botSettings.contactHumanNumber || '0551671229',
        voiceNotesEnabled: true,
      };
      systemPrompt = buildSystemPrompt(promptSettings);
    } else {
      systemPrompt = `You are an authentic Algerian commercial assistant for an e-commerce store.
Rules:
1. Speak natural, warm Algerian Darija (or Arabizi if customer uses Arabizi).
2. Prices in DZD (e.g. 3500 DA / 350 alf).
3. Delivery: 58 wilayas via Yalidine (Alger 400 DA, other wilayas 700 DA). Payment on delivery.
4. Keep answers concise, polite ("khoya", "khti", "marhba bik").`;
    }

    // Try BYOK or Environment Keys (Gemini, Groq, OpenRouter, OpenAI)
    let incomingKey = (bodyJson.apiKey || req.headers.get('x-api-key') || bodyJson.botSettings?.apiKey || '').trim();
    incomingKey = incomingKey.replace(/^['"]+|['"]+$/g, '').replace(/^Bearer\s+/i, '').trim();

    let geminiKey: string | null = null;
    let groqKey: string | null = null;
    let openrouterKey: string | null = null;
    let openaiKey: string | null = null;

    // Strictly use the user's provided API key (from modal or bot settings) - never consume server developer keys
    if (incomingKey) {
      if (incomingKey.startsWith('gsk_')) {
        groqKey = incomingKey;
      } else if (incomingKey.startsWith('sk-or-')) {
        openrouterKey = incomingKey;
      } else if (incomingKey.startsWith('sk-')) {
        openaiKey = incomingKey;
      } else {
        // Any Google Gemini key (AIza... or other key token)
        geminiKey = incomingKey;
      }
    }

    const fragments: string[] = Array.isArray(bodyJson.textFragments)
      ? bodyJson.textFragments
      : Array.isArray(bodyJson.messages)
      ? bodyJson.messages
      : (typeof message === 'string' && message.includes('\n'))
      ? message.split('\n').map((s: string) => s.trim()).filter(Boolean)
      : [];

    let burstContext = '';
    if (fragments.length > 1) {
      burstContext = `\n\n[CONSIGNE ANTI-SPAM / RAFALE DE MESSAGES]:\nLe client a envoyé ${fragments.length} messages consécutifs en rafale :\n${fragments.map((frag: string, idx: number) => `  ${idx + 1}. "${frag}"`).join('\n')}\n-> RÈGLE OBLIGATOIRE: Donne UNE SEULE réponse consolidée et naturelle qui répond à l'ensemble de ses questions en même temps. Ne répète pas les salutations pour chaque fragment.`;
    }

    const userPrompt = `${message}${hasImages ? ' [Customer sent a photo]' : ''}${hasAudios ? ' [Customer sent a voice note]' : ''}${burstContext}`.trim();

    // 1. Google Gemini (Supports 2.0 Flash, 2.5 Flash, 1.5 Flash Latest with Auto-Discovery)
    if (geminiKey) {
      try {
        const candidateModels = [
          'gemini-2.0-flash',
          'gemini-2.5-flash',
          'gemini-1.5-flash-latest',
          'gemini-1.5-flash',
          'gemini-1.5-pro',
        ];

        let reply: string | null = null;
        let lastErrorMsg = '';

        const payload = {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nClient: ${userPrompt}` }]
            }
          ],
          generationConfig: { temperature: 0.3 }
        };

        // 1a. Try primary modern candidate models
        for (const model of candidateModels) {
          try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            if (res.ok) {
              const data = await res.json();
              const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (candidateText) {
                reply = candidateText.trim();
                break;
              }
            } else {
              const errData = await res.json().catch(() => ({}));
              lastErrorMsg = errData?.error?.message || `Erreur Gemini ${res.status}`;
              // If invalid key or quota exhausted, no point trying other model names
              if (res.status === 400 && lastErrorMsg.toLowerCase().includes('api_key_invalid')) {
                break;
              }
              if (res.status === 429) {
                break;
              }
            }
          } catch (modelErr: any) {
            lastErrorMsg = modelErr?.message || String(modelErr);
          }
        }

        // 1b. If not found or unsupported, query the user's available model list dynamically
        if (!reply && (lastErrorMsg.includes('not found') || lastErrorMsg.includes('not supported') || lastErrorMsg.includes('404'))) {
          try {
            const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
            if (listRes.ok) {
              const listData = await listRes.json();
              const available: string[] = (listData?.models || [])
                .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
                .map((m: any) => m.name?.replace('models/', ''))
                .filter(Boolean);

              const bestMatch = available.find((m) => m.includes('2.0') && m.includes('flash')) ||
                                available.find((m) => m.includes('flash') && !m.includes('preview')) ||
                                available.find((m) => m.includes('flash')) ||
                                available.find((m) => m.includes('gemini')) ||
                                available[0];

              if (bestMatch) {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${bestMatch}:generateContent?key=${geminiKey}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                if (res.ok) {
                  const data = await res.json();
                  const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (candidateText) reply = candidateText.trim();
                }
              }
            }
          } catch {}
        }

        if (reply) {
          return NextResponse.json({ reply });
        } else {
          return NextResponse.json({
            reply: `⚠️ Erreur Google Gemini (${lastErrorMsg || 'Modèle non disponible'}). Vérifiez votre clé sur https://aistudio.google.com/app/apikey`
          });
        }
      } catch (err: any) {
        return NextResponse.json({ reply: `⚠️ Erreur de connexion avec Google Gemini : ${err?.message || err}` });
      }
    }

    // 2. Groq Cloud (LLaMA 3.3)
    if (groqKey) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3
          })
        });
        if (res.ok) {
          const data = await res.json();
          const reply = data?.choices?.[0]?.message?.content;
          if (reply) return NextResponse.json({ reply: reply.trim() });
        } else {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `Erreur Groq ${res.status}`;
          return NextResponse.json({
            reply: `⚠️ Erreur Groq Cloud (${errMsg}). Vérifiez votre clé sur https://console.groq.com/keys`
          });
        }
      } catch (err: any) {
        return NextResponse.json({ reply: `⚠️ Erreur de connexion avec Groq : ${err?.message || err}` });
      }
    }

    // 3. OpenRouter
    if (openrouterKey) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openrouterKey}`
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.3-70b-instruct',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3
          })
        });
        if (res.ok) {
          const data = await res.json();
          const reply = data?.choices?.[0]?.message?.content;
          if (reply) return NextResponse.json({ reply: reply.trim() });
        } else {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `Erreur OpenRouter ${res.status}`;
          return NextResponse.json({
            reply: `⚠️ Erreur OpenRouter (${errMsg}). Vérifiez votre clé sur https://openrouter.ai/keys`
          });
        }
      } catch (err: any) {
        return NextResponse.json({ reply: `⚠️ Erreur de connexion OpenRouter : ${err?.message || err}` });
      }
    }

    // 4. OpenAI
    if (openaiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3
          })
        });
        if (res.ok) {
          const data = await res.json();
          const reply = data?.choices?.[0]?.message?.content;
          if (reply) return NextResponse.json({ reply: reply.trim() });
        } else {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `Erreur OpenAI ${res.status}`;
          return NextResponse.json({
            reply: `⚠️ Erreur OpenAI (${errMsg}). Vérifiez votre clé sur https://platform.openai.com/api-keys`
          });
        }
      } catch (err: any) {
        return NextResponse.json({ reply: `⚠️ Erreur de connexion OpenAI : ${err?.message || err}` });
      }
    }

    // No API key provided: Prompt the user to provide an API key or activate n8n router
    return NextResponse.json({
      missingKey: true,
      reply: `⚠️ Clé API Manquante / API Key Missing!\n\nPour que le bot puisse vous répondre intelligemment au lieu de messages automatiques, veuillez configurer une clé API gratuite ou le relier à votre flux n8n.\n\n🔑 Obtenez votre clé 100% Gratuite en 30 secondes :\n• Google AI Studio (Gemini Flash - Recommandé) :\n  https://aistudio.google.com/app/apikey\n• Groq Cloud (LLaMA 3.3 Ultra Rapide) :\n  https://console.groq.com/keys\n• OpenRouter (Multi-modèles) :\n  https://openrouter.ai/keys\n\n⚙️ Comment l'activer :\n👉 Cliquez sur le bouton "🔑 Configurer ma Clé API" ci-dessous pour l'enregistrer en toute sécurité !\n👉 Ou collez-la dans le volet droit > Paramètres du Bot > Clé API IA (BYOK).\n👉 Ou si vous avez un workflow n8n, cochez "Routage Webhook n8n" dans les paramètres à droite.`
    });
  } catch (error: any) {
    return NextResponse.json({
      reply: `⚠️ Erreur serveur : ${error?.message || error}`
    });
  }
}
