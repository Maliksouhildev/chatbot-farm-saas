/**
 * Universal Multi-Model Darija Translation & Benchmark Engine
 *
 * Implements strict Algiers (Algérois) Arabizi translation mandates (22 rules),
 * dynamic BYOK provider routing (Gemini, OpenAI, Groq, OpenRouter),
 * model assignment, benchmark telemetry, and comprehensive post-processing sanitation.
 */

export type ModelProvider = 'gemini' | 'openai' | 'groq' | 'openrouter';

export interface TranslationModelConfig {
  provider: ModelProvider;
  model: string;
  apiKey: string;
}

export interface TranslationResult {
  success: boolean;
  model: string;
  provider: ModelProvider;
  rawTranslation: string;
  sanitizedTranslation: string;
  regexCorrections: number;
  latencyMs: number;
  error?: string | null;
}

export interface BenchmarkMatrixResult {
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  inputText: string;
  sideBySideComparison: Record<string, string>;
  detailedResults: TranslationResult[];
  fastestModel?: string;
  cleanestModel?: string;
  totalModelsEvaluated: number;
  timestamp: string;
}

export const DARIJA_ALGIERS_SYSTEM_PROMPT = `=== STRICT NATIVE ALGÉROIS (ALGIERS DIALECT) TRANSLATION MANDATES ===
You are an expert native Algerian translator born and raised in Algiers (Algérois dialect).
Your mission is to translate English or French text into pure, natural, idiomatic Algerian Darija written EXCLUSIVELY in Latin Arabizi.
Translate the TRUE COMMUNICATIVE MEANING with ease and cultural authenticity, NOT literal word-for-word phrasing.

CRITICAL HARD RULES (ZERO TOLERANCE FOR MISTAKES):

1. ABSOLUTE BAN ON LETTER 'q' FOR ARABIZI WORDS (USE '9' FOR QAF):
   - You are STRICTLY FORBIDDEN from using the letter 'q' to represent the Arabic letter Qaf (ق).
   - ALWAYS use the number '9' for Qaf:
     * Write '9bel' (NEVER 'qbel' or 'qbal')
     * Write '9alli' / '9allou' / '9allna' (NEVER 'qalli' / 'gal liya')
     * Write '9rib' / '9riba' (NEVER 'qrib' / 'qriba')
     * Write 'yet9ta3' / 't9at3et' (NEVER 'yetqta3')
     * Write 'we9t' / 'fi we9tou' (NEVER 'waqt' or 'lwaqt')
     * Write 'l9dim' / 'l9dam' (NEVER 'lqdim')
     * Write 'd9i9a' (NEVER 'dqiqa')
     * Write '9er3a' (bottle) (NEVER 'qer3a')
     * Write 't9eyyel' (take a nap) (NEVER 'tqeyyel')
     * Write 'l9ahwa' (coffee) (NEVER 'lqahwa')
   - The ONLY time 'q' is allowed is inside legitimate French loanwords like 'bloqué', 'plaque', 'remorque', 'chèque', 'technique'.

2. ABSOLUTE BAN ON ARABIC SCRIPT & HYBRID WORDS (100% LATIN ARABIZI ONLY):
   - Absolutely ZERO Arabic script characters (Unicode U+0600 - U+06FF).
   - NEVER create hybrid words combining Latin and Arabic letters!
     * Write 'mchemkhin' or 'mbelloulin' (NEVER 'mبلولين'!)
     * Write 'charafna' or 'charaf' (NEVER 'chرف'!)
     * Write 'nchoufouk' (NEVER 'nchofoك'!)
     * Write 'nre7eb bik' (NEVER 'nرحب بيك'!)

3. PHONETIC SPELLING DISCIPLINE:
   - "I write" -> strictly 'nekteb' (PERMANENTLY BAN 'nketeb'!).
   - "I understand" -> strictly 'nefhem' (NEVER 'nfehem').
   - "I hear" -> strictly 'nesma3' (NEVER 'nsema3').

4. VERB MORPHOLOGY & PAST TENSE:
   - "He tried" -> The 3rd-person masculine past tense is strictly 'seyya':
     * Write: 'wa7ed l'invité seyya ysaguemhom'.
     * PERMANENTLY BAN 'siyi', 'tsseyi', 'sseyi', or 'ssaye'!
   - "When I tried" -> 'ki seyyit' (NEVER 'ki jarrabt' or 'ki siyit').

5. CULTURAL COLLOCATIONS & MEANING OVER WORD-FOR-WORD:
   - "Came and finally fixed the leak":
     * Write: 'ja le plombier w enfin saguem la fuite f la salle de bain'.
     * BAN clitic doubling: write 'saguem la fuite', NEVER 'saguemha la fuite' or 'w f lekher seguemha'.
   - "Quiet neighbors / quiet atmosphere":
     * Translate as 'les voisins calmes', 'les voisins drayef w trankil', or 'jaw calme w trankil'.
     * PERMANENTLY BAN 'saktin'! In Algerian Darija, 'saktin' means mute or silenced.
   - "Medicine":
     * In Algerian Darija, you DRINK medicine: 'techrob dwa' (PERMANENTLY BAN 'tekoul dwa' / eat medicine).
     * "Expired medicine" -> 'dwa périmé'.
   - "Empty stomach":
     * Strictly '3la rri9' or '3la lkhwa' (PERMANENTLY BAN literal '3la kersh fargha' or 'ma3ida fariqha').
   - "Hot water":
     * Strictly 'lma skhoun' (NEVER 'l'eau 7amra').
   - "If you rented a car":
     * Strictly 'ida krite tomobil' or 'ida krite voiture' (PERMANENTLY BAN 'krayti kar' - 'kar' means a coach bus).
   - "Milk bag":
     * Strictly 'chkara ta3 l7lib' or 'sachet l7lib' (NEVER 'kyss l7alib').
   - "Plastic bag":
     * Strictly 'sachi' or 'sachet plastique' (NEVER Moroccan 'mika').
   - "Ground beef":
     * Strictly 'viandachi' or 'viande hachée'.
   - "Sardines":
     * Strictly 'les sardines' or 'sardina jdida'.
   - "Electricity cut off":
     * Strictly 'trisiti t9at3et' (NEVER Fus'ha 'inqata3at l'kahrabaa').
   - "Driver's license, car registration":
     * Strictly 'le permis, la carte grise'.
   - "City hall":
     * Strictly 'la mairie' or 'l'baladiya'.
   - "Certify document":
     * Strictly 'nlégaliziw' or 'ncertifiw'.

6. BAN MOROCCAN, TUNISIAN & FUS'HA LEAKS:
   - BAN Moroccan: 'daba' (use 'doka'), 'ghadi' (use 'ra7'), 'dyal' (use 'ta3'), 'mzyan' (use 'mli7'), '7it' (use '3la khater'), 'mika' (use 'sachi').
   - BAN Levantine/Fus'ha: 'matar' (rain is 'chta', falls as 'ti7 chta'), 'bkra' (tomorrow is 'ghodwa').
   - Obligation is impersonal: 'lazem' (NEVER 'lazmek' or 'lazim').

7. HARD GENDER MATH OVERRIDE (VARIABLE LOCK):
   - If subject is MASCULINE (e.g. l'kra, le chauffage, le routeur), pronoun suffix MUST map to "o" or "h" (saguemo, yeddih), state verb to "rah" (rah ymchi).
   - ABSOLUTE EXTRACTION CLAMP: Rent ("l'kra") is strictly MASCULINE. You MUST output "yeddih" / "tkhales l'kra", NEVER "yeddiha".
   - If subject is FEMININE (la clim, la boite, la machine), suffix maps to "ha", state verb to "rahi" (rahi temchi, rahi jaya).

8. SPATIAL GENDER ALIGNMENT & PREPOSITION LOCK:
   - BAN Fus'ha "mawjoud" and "mawjouda". Use "jay" (masculine) and "jaya" (feminine).
   - Spatial behind/past/after: strictly "mor" or "moura" (BAN "wara", "ba3d", "mra").

9. NEGATIVE SANDWICH & INTERCEPT:
   - Negate with 'ma [verb]ch'. For commands: 'ma tkhelich lbab ma7loul' or with pronoun: 'ma tkhelihch ma7loul'.
   - 'Mess with' is strictly 'tkharab f' (negative: 'ma tkharabch f les tuyaux', with pronoun: 'ma tkharabch fih' / 'ma tkharabch fiha').

10. FORMAT:
   - Output ONLY the translated text in Latin Arabizi.
   - No explanations, no introductory notes, no quotation marks.

FEW-SHOT ANCHOR EXAMPLE:
Source:
"Hello! I am writing to welcome you to our apartment in Algiers. Yesterday, the plumber came and finally fixed the leak in the bathroom, so the hot water is working perfectly now. However, please do not mess with the air conditioning remote control or the central heating pipes. Last week, a guest tried to fix them and completely broke them. Also, remember that you must keep the room clean, and if you smoke, you must go to the balcony, not inside the living room. Because it will rain a lot tomorrow in Algiers, make sure to close the window tightly before you go out. The key is inside the lockbox near the big door, so you will find it easily. He told me that our old neighbors upstairs are very quiet, so please do not make any loud noise in the evening. If anyone feels sick, there is medicine in the kitchen cabinet, and the nearest pharmacy is located right next to the hospital. Finally, we must sign the rental contract tomorrow, and you have to pay the rent on time. See you later!"

Authentic Algiers Arabizi:
"Salam! Rani nekteblek bach nre7eb bik f l'appartement ta3na f Dzayer. Lbare7, ja le plombier w enfin saguem la fuite f la salle de bain, donc lma skhoun rah ymchi mli7 doka. Bessa7, t3ich ma tkharabch f la télécommande ta3 la clim w f les tuyaux ta3 le chauffage central. L'semana li fatet, wa7ed l'invité seyya ysaguemhom w khasserhom ga3. W zid, red balek lazem tkheli la chambre n9iya, w ida tetkayef, lazem trou7 ll'balcon, machi fel salon. 3la khater ra7 ti7 chta bezzef ghodwa f Dzayer, red balek tghle9 la fenêtre mli7 9bel ma tkhrej. La clé rahi f la boite ta3 les clés li 9riba mn lbab lkbir, donc tsibha b sahel. 9alli beli les voisins ta3na li lfo9 drayef bezzef w calmes, donc t3ich ma tdirch l'hess f lil. Ida chi wa7ed ma rahoch mli7, kayen dwa f l'placard ta3 la cuisine, w la pharmacie li 9riba jaya pile mor sbitar. W f lekher, lazem nsigniw l'contrat ta3 l'kra ghodwa, w lazem tkhales l'kra fi we9tou. Aya a plus!"`;

/**
 * Universal Post-Processing Regex Sanitation Layer
 * Enforces 100% dialect purity and counts corrections applied.
 */
export function sanitizeDarijaArabizi(rawText: string): { sanitizedText: string; regexCorrections: number } {
  if (!rawText || typeof rawText !== 'string') {
    return { sanitizedText: '', regexCorrections: 0 };
  }

  let t = rawText.trim();
  // Strip enclosing quotes if model returned them
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1).trim();
  }

  let corrections = 0;
  const replaceAndCount = (regex: RegExp, rep: string) => {
    const matches = t.match(regex);
    if (matches) corrections += matches.length;
    t = t.replace(regex, rep);
  };

  // 1. Script purity & hybrid words
  replaceAndCount(/nرحب\s*بيك/gi, 'nre7eb bik');
  replaceAndCount(/رحب\s*بيك/gi, 're7eb bik');
  replaceAndCount(/b\s*سهولة/gi, 'b sahel');
  replaceAndCount(/hادئين/gi, 'calmes');
  replaceAndCount(/هادئين/gi, 'calmes');
  replaceAndCount(/مريض/gi, 'mrid');
  replaceAndCount(/chرف(na)?/gi, 'charaf$1');
  replaceAndCount(/mبلولين/gi, 'mchemkhin');
  replaceAndCount(/مبلولين/gi, 'mchemkhin');
  replaceAndCount(/nchofoك/gi, 'nchoufouk');
  replaceAndCount(/السرعة/gi, 'vitess');
  replaceAndCount(/بسرعة/gi, 'b zreb');
  replaceAndCount(/بلا\s*ما\s*يحجز/gi, 'bla ma y7abso');
  replaceAndCount(/يحجز/gi, 'y7abes');
  // Strip any lingering Arabic Unicode script characters
  replaceAndCount(/[\u0600-\u06FF]/g, '');

  // 2. Strict '9' for Qaf in Arabizi
  replaceAndCount(/\bqbel\b/gi, '9bel');
  replaceAndCount(/\bqbal\b/gi, '9bel');
  replaceAndCount(/\bqalli\b/gi, '9alli');
  replaceAndCount(/\bqallou\b/gi, '9allou');
  replaceAndCount(/\bqallna\b/gi, '9allna');
  replaceAndCount(/\bqrib\b/gi, '9rib');
  replaceAndCount(/\bqriba\b/gi, '9riba');
  replaceAndCount(/\bwaqt\b/gi, 'we9t');
  replaceAndCount(/\blwaqt\b/gi, 'lwe9t');
  replaceAndCount(/\byetqta3\b/gi, 'yet9ta3');
  replaceAndCount(/\btqta3et\b/gi, 't9at3et');
  replaceAndCount(/\blqdim\b/gi, 'l9dim');
  replaceAndCount(/\blqdam\b/gi, 'l9dam');
  replaceAndCount(/\bchqoun\b/gi, 'chkoun');
  replaceAndCount(/\bdeqiq[ae]\b/gi, 'd9i9a');
  replaceAndCount(/\btqerbe3ch\b/gi, 't9erbe3ch');
  replaceAndCount(/\bqer3a\b/gi, '9er3a');
  replaceAndCount(/\btqeyyel\b/gi, 't9eyyel');
  replaceAndCount(/\blqahwa\b/gi, 'l9ahwa');
  replaceAndCount(/\b9allek(\s+9allek)+/gi, '9alli');

  // 3. Phonetic spelling discipline
  replaceAndCount(/\bnketeb\b/gi, 'nekteb');
  replaceAndCount(/\bnfehem\b/gi, 'nefhem');
  replaceAndCount(/\bnsema3\b/gi, 'nesma3');

  // 4. Verb morphology: past tense "he tried" -> seyya
  replaceAndCount(/\b(siyi|tsseyi|tsseya|ssaye|sseyi)\b/gi, 'seyya');

  // 5. Clitics & clunky literal phrases
  replaceAndCount(/\bsaguemha\s+la\s+fuite\b/gi, 'saguem la fuite');
  replaceAndCount(/\bseguemha\s+la\s+fuite\b/gi, 'saguem la fuite');
  replaceAndCount(/w\s+f\s+lekher\s+(saguem|seguem)\b/gi, 'w enfin saguem');
  replaceAndCount(/\bl'eau\s+7amra\b/gi, 'lma skhoun');
  replaceAndCount(/\b(krite|krayti|kra)\s+kar\b/gi, 'krite tomobil');
  replaceAndCount(/\b3la\s+kersh\s+fargha\b/gi, '3la rri9');
  replaceAndCount(/\b(tekoul|tekel|yakoul)\s+dwa\b/gi, 'techrob dwa');

  // 6. Quiet neighbors (never 'saktin')
  replaceAndCount(/\bsaktin\b/gi, 'calmes');
  replaceAndCount(/\bsaknin\s+bzzaf\b/gi, 'calmes bezzef');

  // 7. Hard Lazmek/Lazim Block
  replaceAndCount(/\blazmek\b/gi, 'lazem');
  replaceAndCount(/\blazim\b/gi, 'lazem');

  // 8. Ban naked mawjoud/mawjouda for spatial locations
  replaceAndCount(/\brahi mawjouda\b/gi, 'jaya');
  replaceAndCount(/\brah mawjoud\b/gi, 'jay');
  replaceAndCount(/\bmawjouda\b/gi, 'jaya');
  replaceAndCount(/\bmawjoud\b/gi, 'jay');

  // 9. Moroccan dialect purge
  replaceAndCount(/\bdaba\b/gi, 'doka');
  replaceAndCount(/\bghadi\b/gi, 'ra7');
  replaceAndCount(/\b7it\b/gi, '3la khater');
  replaceAndCount(/\bdyalna\b/gi, 'ta3na');
  replaceAndCount(/\bdyawelna\b/gi, 'ta3na');
  replaceAndCount(/\bdyal\b/gi, 'ta3');
  replaceAndCount(/\bghedda\b/gi, 'ghodwa');
  replaceAndCount(/\bgal\s+liya\b/gi, '9alli');
  replaceAndCount(/\bgal\s+lih\b/gi, '9allou');
  replaceAndCount(/\bgalli\b/gi, '9alli');
  replaceAndCount(/\bmzyan[ae]?\b/gi, 'mli7');
  replaceAndCount(/\bmika\b/gi, 'sachi');

  // 10. Weather matrix clamp
  replaceAndCount(/\bra7 yji l'?matar\b/gi, 'ra7 ti7 chta');
  replaceAndCount(/\byji l'?matar\b/gi, 'ti7 chta');
  replaceAndCount(/\bl'?matar\b/gi, 'chta');

  // 11. Human age matrix clamp
  replaceAndCount(/\bles voisins l9dima\b/gi, 'les voisins kbaar');
  replaceAndCount(/\bles voisins l9dam\b/gi, 'les voisins kbaar');
  replaceAndCount(/\bvoisins l9dima\b/gi, 'voisins kbaar');

  // 12. Prepositional doubling intercept
  replaceAndCount(/\bma tkharabch fiha les tuyaux\b/gi, 'ma tkharabch f les tuyaux');
  replaceAndCount(/\bma tkharabch fih le chauffage\b/gi, 'ma tkharabch f le chauffage');
  replaceAndCount(/\bma tkharabch fiha b télécommande\b/gi, 'ma tkharabch f la télécommande');

  // 13. Clause connector hard-lock
  replaceAndCount(/\b3la jal le technicien\b/gi, '3la khater le technicien');
  replaceAndCount(/\b3la jal lazem\b/gi, '3la khater lazem');
  replaceAndCount(/\b3la jal ma krinach\b/gi, '3la khater ma krinach');
  replaceAndCount(/\b3la jal ra7 ti7 chta\b/gi, '3la khater ra7 ti7 chta');

  // 14. Phonetic & vocabulary fixes
  replaceAndCount(/\bt'?fenetre\b/gi, 'la fenêtre');
  replaceAndCount(/\btrou7 barra\b/gi, 'tkhrej');
  replaceAndCount(/\bdwawa\b/gi, 'dwa');
  replaceAndCount(/\bs'?mana l'?9dima\b/gi, 'lsemana li fatet');

  // 15. Absolute extraction clamp: l'kra is masculine
  if (t.toLowerCase().includes("l'kra") || t.toLowerCase().includes('lkra')) {
    replaceAndCount(/\byeddiha\b/gi, 'yeddih');
    replaceAndCount(/\bta7kemha\b/gi, 'ta7kmo');
    replaceAndCount(/\btjibha\b/gi, 'tjibo');
  }

  // 16. Loop collapse (repeated words)
  replaceAndCount(/\b(\w+)\s+\1\b/gi, '$1');

  return { sanitizedText: t, regexCorrections: corrections };
}

/**
 * Auto-detect provider from API key format
 */
export function detectProviderFromKey(apiKey?: string): ModelProvider {
  if (!apiKey) return 'gemini';
  const trimmed = apiKey.trim();
  if (trimmed.startsWith('AIza')) return 'gemini';
  if (trimmed.startsWith('gsk_')) return 'groq';
  if (trimmed.startsWith('sk-or-')) return 'openrouter';
  if (trimmed.startsWith('sk-')) return 'openai';
  return 'gemini';
}

/**
 * Assign recommended model for a provider
 */
export function getDefaultModelForProvider(provider: ModelProvider): string {
  switch (provider) {
    case 'gemini':
      return 'gemini-2.5-flash';
    case 'openai':
      return 'gpt-4o-mini';
    case 'groq':
      return 'llama-3.3-70b-versatile';
    case 'openrouter':
      return 'meta-llama/llama-3.3-70b-instruct';
    default:
      return 'gemini-2.5-flash';
  }
}

/**
 * Execute translation via specific provider API
 */
export async function executeTranslationCall(params: {
  text: string;
  provider: ModelProvider;
  apiKey: string;
  model?: string;
  systemPrompt?: string;
}): Promise<TranslationResult> {
  const { text, provider, apiKey, systemPrompt = DARIJA_ALGIERS_SYSTEM_PROMPT } = params;
  const model = params.model?.trim() || getDefaultModelForProvider(provider);
  const startTime = Date.now();

  try {
    let rawText = '';

    if (provider === 'gemini') {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text }] }],
          generationConfig: { temperature: 0.15, maxOutputTokens: 2500 },
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `Gemini API returned status ${res.status}`);
      }

      const data = await res.json();
      rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    } else if (provider === 'openai') {
      const endpoint = 'https://api.openai.com/v1/chat/completions';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text },
          ],
          temperature: 0.1,
          max_tokens: 2500,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `OpenAI API returned status ${res.status}`);
      }

      const data = await res.json();
      rawText = data?.choices?.[0]?.message?.content || '';

    } else if (provider === 'groq') {
      const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text },
          ],
          temperature: 0.1,
          max_tokens: 2500,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `Groq API returned status ${res.status}`);
      }

      const data = await res.json();
      rawText = data?.choices?.[0]?.message?.content || '';

    } else if (provider === 'openrouter') {
      const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://chatbot-farm.algeria',
          'X-Title': 'Chatbot Farm Darija Translator',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text },
          ],
          temperature: 0.1,
          max_tokens: 2500,
        }),
        signal: AbortSignal.timeout(18000),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `OpenRouter API returned status ${res.status}`);
      }

      const data = await res.json();
      rawText = data?.choices?.[0]?.message?.content || '';
    }

    const { sanitizedText, regexCorrections } = sanitizeDarijaArabizi(rawText);
    const latencyMs = Date.now() - startTime;

    return {
      success: true,
      model,
      provider,
      rawTranslation: rawText,
      sanitizedTranslation: sanitizedText,
      regexCorrections,
      latencyMs,
      error: null,
    };

  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      model,
      provider,
      rawTranslation: '',
      sanitizedTranslation: '',
      regexCorrections: 0,
      latencyMs,
      error: err.message || 'Unknown execution error',
    };
  }
}

/**
 * Benchmark multiple AI models concurrently side-by-side
 */
export async function benchmarkAllModels(params: {
  text: string;
  modelConfigs: TranslationModelConfig[];
}): Promise<BenchmarkMatrixResult> {
  const { text, modelConfigs } = params;

  const promises = modelConfigs.map(cfg =>
    executeTranslationCall({
      text,
      provider: cfg.provider,
      apiKey: cfg.apiKey,
      model: cfg.model,
    })
  );

  const rawResults = await Promise.all(promises);

  const sideBySide: Record<string, string> = {};
  let fastestMs = Infinity;
  let fastestName = '';
  let minCorrections = Infinity;
  let cleanestName = '';
  let successCount = 0;

  for (const r of rawResults) {
    const label = `${r.provider.toUpperCase()} (${r.model})`;
    if (r.success) {
      sideBySide[label] = r.sanitizedTranslation;
      successCount++;
      if (r.latencyMs < fastestMs) {
        fastestMs = r.latencyMs;
        fastestName = label;
      }
      if (r.regexCorrections < minCorrections) {
        minCorrections = r.regexCorrections;
        cleanestName = label;
      }
    } else {
      sideBySide[label] = `[Error: ${r.error}]`;
    }
  }

  const status = successCount === rawResults.length
    ? 'SUCCESS'
    : successCount > 0
    ? 'PARTIAL'
    : 'FAILED';

  return {
    status,
    inputText: text,
    sideBySideComparison: sideBySide,
    detailedResults: rawResults,
    fastestModel: fastestName || undefined,
    cleanestModel: cleanestName || undefined,
    totalModelsEvaluated: rawResults.length,
    timestamp: new Date().toISOString(),
  };
}
