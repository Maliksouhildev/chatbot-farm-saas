import { NextResponse } from 'next/server';
import {
  executeTranslationCall,
  benchmarkAllModels,
  detectProviderFromKey,
  getDefaultModelForProvider,
  ModelProvider,
  TranslationModelConfig,
  DARIJA_ALGIERS_SYSTEM_PROMPT,
} from '@/lib/darija_translation_engine';

export const dynamic = 'force-dynamic';

const DEFAULT_BENCHMARK_PROMPT =
  "Hello! I am writing to welcome you to our apartment in Algiers. Yesterday, the plumber came and finally fixed the leak in the bathroom, so the hot water is working perfectly now. However, please do not mess with the air conditioning remote control or the central heating pipes. Last week, a guest tried to fix them and completely broke them. Also, remember that you must keep the room clean, and if you smoke, you must go to the balcony, not inside the living room.\n\nBecause it will rain a lot tomorrow in Algiers, make sure to close the window tightly before you go out. The key is inside the lockbox near the big door, so you will find it easily. He told me that our old neighbors upstairs are very quiet, so please do not make any loud noise in the evening. If anyone feels sick, there is medicine in the kitchen cabinet, and the nearest pharmacy is located right next to the hospital.\n\nFinally, we must sign the rental contract tomorrow, and you have to pay the rent on time. See you later!";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const headers = req.headers;

    const text = body.text || body.content || body.prompt || DEFAULT_BENCHMARK_PROMPT;
    const mode = body.mode || (body.benchmark ? 'benchmark' : 'single');

    // 1. Benchmark Matrix Mode: Evaluates multiple models side-by-side
    if (mode === 'benchmark') {
      const modelConfigs: TranslationModelConfig[] = [];

      // Add models from provided keys or environment
      const geminiKey = body.geminiKey || body.apiKey || process.env.GEMINI_API_KEY;
      if (geminiKey && !geminiKey.startsWith('AIzaSy_your-')) {
        modelConfigs.push({
          provider: 'gemini',
          model: body.geminiModel || 'gemini-2.5-flash',
          apiKey: geminiKey,
        });
      }

      const groqKey = body.groqKey || body.apiKey || process.env.GROQ_API_KEY;
      if (groqKey && !groqKey.startsWith('gsk_your-')) {
        modelConfigs.push({
          provider: 'groq',
          model: body.groqModel || 'llama-3.3-70b-versatile',
          apiKey: groqKey,
        });
      }

      const openAiKey = body.openAiKey || body.apiKey || process.env.OPENAI_API_KEY;
      if (openAiKey && !openAiKey.startsWith('sk-proj-your-')) {
        modelConfigs.push({
          provider: 'openai',
          model: body.openAiModel || 'gpt-4o-mini',
          apiKey: openAiKey,
        });
      }

      const openRouterKey = body.openRouterKey || body.apiKey || process.env.OPENROUTER_API_KEY;
      if (openRouterKey && !openRouterKey.startsWith('sk-or-your-')) {
        modelConfigs.push({
          provider: 'openrouter',
          model: body.openRouterModel || 'meta-llama/llama-3.3-70b-instruct',
          apiKey: openRouterKey,
        });
      }

      // If user passed a single custom key, detect provider and assign model
      if (modelConfigs.length === 0 && (body.apiKey || headers.get('x-api-key'))) {
        const rawKey = body.apiKey || headers.get('x-api-key') || '';
        const prov = body.provider || detectProviderFromKey(rawKey);
        const mdl = body.model || getDefaultModelForProvider(prov);
        modelConfigs.push({ provider: prov, model: mdl, apiKey: rawKey });
      }

      if (modelConfigs.length === 0) {
        return NextResponse.json(
          {
            error: 'No active AI keys found for benchmark evaluation. Please provide apiKey in request body or settings.',
          },
          { status: 400 }
        );
      }

      const benchmarkResult = await benchmarkAllModels({ text, modelConfigs });

      return NextResponse.json({
        success: true,
        mode: 'benchmark',
        benchmark: benchmarkResult,
      });
    }

    // 2. Single Translation Mode: Dynamically adapts to user's chosen API key & assigned model
    const headerKey = headers.get('x-api-key') || headers.get('authorization')?.replace('Bearer ', '');
    const userApiKey = body.apiKey || headerKey || process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY;

    if (!userApiKey || userApiKey.startsWith('AIzaSy_your-')) {
      return NextResponse.json(
        {
          error: 'Missing API key. Please configure your Gemini, OpenAI, Groq, or OpenRouter key in Settings (BYOK).',
        },
        { status: 401 }
      );
    }

    // Detect provider
    const provider: ModelProvider = (body.provider as ModelProvider) || detectProviderFromKey(userApiKey);

    // Assign appropriate model
    const model = body.model || getDefaultModelForProvider(provider);

    // Execute translation
    const translationResult = await executeTranslationCall({
      text,
      provider,
      apiKey: userApiKey,
      model,
    });

    if (!translationResult.success) {
      return NextResponse.json(
        {
          error: translationResult.error || 'Failed to generate translation with chosen model',
          provider,
          model,
          latencyMs: translationResult.latencyMs,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      provider: translationResult.provider,
      model: translationResult.model,
      translation: translationResult.sanitizedTranslation,
      rawTranslation: translationResult.rawTranslation,
      regexCorrections: translationResult.regexCorrections,
      latencyMs: translationResult.latencyMs,
      inputLength: text.length,
      rulesEnforced: 22,
    });

  } catch (error: any) {
    console.error('Translation route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during translation' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text') || searchParams.get('q') || DEFAULT_BENCHMARK_PROMPT;
    const apiKey = searchParams.get('apiKey') || searchParams.get('key') || process.env.GEMINI_API_KEY;
    const providerParam = searchParams.get('provider') as ModelProvider | null;
    const modelParam = searchParams.get('model') || undefined;

    if (!apiKey || apiKey.startsWith('AIzaSy_your-')) {
      return NextResponse.json(
        { error: 'Please supply apiKey query parameter or configure BYOK in settings.' },
        { status: 400 }
      );
    }

    const provider = providerParam || detectProviderFromKey(apiKey);
    const model = modelParam || getDefaultModelForProvider(provider);

    const result = await executeTranslationCall({
      text,
      provider,
      apiKey,
      model,
    });

    return NextResponse.json({
      success: result.success,
      provider: result.provider,
      model: result.model,
      translation: result.sanitizedTranslation,
      rawTranslation: result.rawTranslation,
      regexCorrections: result.regexCorrections,
      latencyMs: result.latencyMs,
      error: result.error,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
