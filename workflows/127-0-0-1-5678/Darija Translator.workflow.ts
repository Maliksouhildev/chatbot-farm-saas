import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Darija Translator
// Nodes   : 5  |  Connections: 4
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                         Node type (short)         Flags
// Webhook                               webhook
// SetContextDynamicAdapter              code
// DynamicMultiModelEngine               code
// SanitizeOutput                        code
// RespondToWebhook                      respondToWebhook
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → SetContextDynamicAdapter
//      → DynamicMultiModelEngine
//        → SanitizeOutput
//          → RespondToWebhook
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: '9eDt9JDIJqyfsg2a',
    name: 'Darija Translator',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class DarijaTranslatorWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: 'e604589e-0c44-443e-9519-cade4cd4d735',
        webhookId: '8c6450de-f3d7-4cff-a8c9-1a6d8c800220',
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2.1,
        position: [0, 4400],
    })
    Webhook = {
        httpMethod: 'POST',
        path: 'translate-darija',
        responseMode: 'responseNode',
        options: {},
    };

    @node({
        id: 'db60f120-c111-4ffc-b8db-9457c7f9c7c2',
        name: 'Set Context & Dynamic Inbound Adapter',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [240, 4400],
    })
    SetContextDynamicAdapter = {
        jsCode: `const item = $input.first();
const q = item.json.query || {};
const b = item.json.body || {};
const h = item.json.headers || {};

const text = b.text || q.text || item.json.text || "";
const apiKey = b.apiKey || q.apiKey || h['x-api-key'] || h['authorization']?.replace('Bearer ', '') || '';
const provider = b.provider || q.provider || '';
const model = b.model || q.model || '';

return [{
    json: {
        text,
        apiKey,
        provider,
        model,
        mode: 'single',
        benchmark: false
    }
}];`,
    };

    @node({
        id: 'dfd2116f-f176-47f8-8268-4ce1b3577c21',
        name: 'Dynamic Multi-Model Engine',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [480, 4400],
    })
    DynamicMultiModelEngine = {
        jsCode: `const input = $input.first().json;
const textToTranslate = input.text || "Hello! Welcome to our apartment in Algiers.";

const systemPrompt = \`=== STRICT NATIVE ALGÉROIS (ALGIERS DIALECT) TRANSLATION MANDATES ===
You are an expert native Algerian translator born and raised in Algiers (Algérois dialect).
Your mission is to translate English or French text into pure, natural, idiomatic Algerian Darija written EXCLUSIVELY in Latin Arabizi.
Translate the TRUE COMMUNICATIVE MEANING with ease and cultural authenticity, NOT literal word-for-word phrasing.

CRITICAL HARD RULES:
1. ABSOLUTE BAN ON LETTER 'q' FOR ARABIZI WORDS (USE '9' FOR QAF): Write '9bel', '9alli', '9rib', 'yet9ta3', 'we9t', 'l9dim', 'd9i9a', '9er3a'.
2. ABSOLUTE BAN ON ARABIC SCRIPT & HYBRID WORDS (100% LATIN ARABIZI ONLY): Zero Arabic letters (U+0600-U+06FF). Write 'nre7eb bik', 'mchemkhin', 'charafna'.
3. PHONETIC SPELLING DISCIPLINE: strictly 'nekteb' (BAN 'nketeb'), 'nefhem', 'nesma3'.
4. VERB MORPHOLOGY & PAST TENSE: "He tried" is strictly 'seyya' (BAN 'siyi', 'tsseyi').
5. CULTURAL COLLOCATIONS: "came and finally fixed the leak" -> 'ja le plombier w enfin saguem la fuite f la salle de bain'. "quiet neighbors" -> 'les voisins calmes'. "drink medicine" -> 'techrob dwa'. "hot water" -> 'lma skhoun'. "empty stomach" -> '3la rri9'.
6. BAN MOROCCAN: BAN 'daba' (use 'doka'), BAN 'ghadi' (use 'ra7'), BAN '7it' (use '3la khater'), BAN 'dyal' (use 'ta3'), BAN 'mzyan' (use 'mli7'), BAN 'mika' (use 'sachi').
7. Obligation: strictly impersonal 'lazem' (BAN 'lazmek', 'lazim').
8. Rent is masculine: "l'kra" -> 'yeddih' (BAN 'yeddiha').
9. Spatial: BAN 'mawjoud'/'mawjouda', use 'jay'/'jaya'. Behind -> 'mor' / 'moura'.
10. Format: Output ONLY the translated text in Latin Arabizi. No notes.\`;

function detectProvider(key) {
    if (!key) return 'gemini';
    const k = key.trim();
    if (k.startsWith('AIza')) return 'gemini';
    if (k.startsWith('gsk_')) return 'groq';
    if (k.startsWith('sk-or-')) return 'openrouter';
    if (k.startsWith('sk-')) return 'openai';
    return 'gemini';
}

function getDefaultModel(prov) {
    if (prov === 'gemini') return 'gemini-2.5-flash';
    if (prov === 'groq') return 'llama-3.3-70b-versatile';
    if (prov === 'openai') return 'gpt-4o-mini';
    if (prov === 'openrouter') return 'meta-llama/llama-3.3-70b-instruct';
    return 'gemini-2.5-flash';
}

const apiKey = input.apiKey || process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || '';
const provider = input.provider || detectProvider(apiKey);
const model = input.model || getDefaultModel(provider);

const startTime = Date.now();
let rawOutput = '';

if (provider === 'gemini') {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;
    const res = await this.helpers.httpRequest({
        url,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: textToTranslate }] }],
            generationConfig: { temperature: 0.15, maxOutputTokens: 2500 }
        },
        json: true
    });
    rawOutput = res?.candidates?.[0]?.content?.parts?.[0]?.text || '';
} else if (provider === 'openai') {
    const res = await this.helpers.httpRequest({
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
        body: {
            model,
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: textToTranslate }],
            temperature: 0.1,
            max_tokens: 2500
        },
        json: true
    });
    rawOutput = res?.choices?.[0]?.message?.content || '';
} else if (provider === 'groq') {
    const res = await this.helpers.httpRequest({
        url: 'https://api.groq.com/openai/v1/chat/completions',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
        body: {
            model,
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: textToTranslate }],
            temperature: 0.1,
            max_tokens: 2500
        },
        json: true
    });
    rawOutput = res?.choices?.[0]?.message?.content || '';
} else if (provider === 'openrouter') {
    const res = await this.helpers.httpRequest({
        url: 'https://openrouter.ai/api/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + apiKey,
            'HTTP-Referer': 'https://chatbot-farm.algeria',
            'X-Title': 'Chatbot Farm n8n'
        },
        body: {
            model,
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: textToTranslate }],
            temperature: 0.1,
            max_tokens: 2500
        },
        json: true
    });
    rawOutput = res?.choices?.[0]?.message?.content || '';
}

const latencyMs = Date.now() - startTime;
return [{
    json: {
        text: rawOutput,
        raw_text: rawOutput,
        provider,
        model,
        latencyMs
    }
}];`,
    };

    @node({
        id: 'c1b48e3a-93f8-4b72-b2a6-2d93e1152a88',
        name: 'Sanitize Output',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [720, 4400],
    })
    SanitizeOutput = {
        jsCode: `for (const item of $input.all()) {
    if (item.json && typeof item.json.text === 'string') {
        let t = item.json.text;
        if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
            t = t.slice(1, -1).trim();
        }
        const raw = t;
        let corrections = 0;
        const replaceAndCount = (regex, rep) => {
            const matches = t.match(regex);
            if (matches) corrections += matches.length;
            t = t.replace(regex, rep);
        };

        // 1. Script purity & hybrid words
        replaceAndCount(/nرحب\\s*بيك/gi, 'nre7eb bik');
        replaceAndCount(/رحب\\s*بيك/gi, 're7eb bik');
        replaceAndCount(/b\\s*سهولة/gi, 'b sahel');
        replaceAndCount(/hادئين/gi, 'calmes');
        replaceAndCount(/هادئين/gi, 'calmes');
        replaceAndCount(/مريض/gi, 'mrid');
        replaceAndCount(/chرف(na)?/gi, 'charaf$1');
        replaceAndCount(/mبلولين/gi, 'mchemkhin');
        replaceAndCount(/مبلولين/gi, 'mchemkhin');
        replaceAndCount(/nchofoك/gi, 'nchoufouk');
        replaceAndCount(/السرعة/gi, 'vitess');
        replaceAndCount(/بسرعة/gi, 'b zreb');
        replaceAndCount(/بلا\\s*ما\\s*يحجز/gi, 'bla ma y7abso');
        replaceAndCount(/يحجز/gi, 'y7abes');
        replaceAndCount(/[\\u0600-\\u06FF]/g, '');

        // 2. Strict '9' for Qaf in Arabizi
        replaceAndCount(/\\bqbel\\b/gi, '9bel');
        replaceAndCount(/\\bqbal\\b/gi, '9bel');
        replaceAndCount(/\\bqalli\\b/gi, '9alli');
        replaceAndCount(/\\bqallou\\b/gi, '9allou');
        replaceAndCount(/\\bqallna\\b/gi, '9allna');
        replaceAndCount(/\\bqrib\\b/gi, '9rib');
        replaceAndCount(/\\bqriba\\b/gi, '9riba');
        replaceAndCount(/\\bwaqt\\b/gi, 'we9t');
        replaceAndCount(/\\blwaqt\\b/gi, 'lwe9t');
        replaceAndCount(/\\byetqta3\\b/gi, 'yet9ta3');
        replaceAndCount(/\\btqta3et\\b/gi, 't9at3et');
        replaceAndCount(/\\blqdim\\b/gi, 'l9dim');
        replaceAndCount(/\\blqdam\\b/gi, 'l9dam');
        replaceAndCount(/\\bchqoun\\b/gi, 'chkoun');
        replaceAndCount(/\\bdeqiq[ae]\\b/gi, 'd9i9a');
        replaceAndCount(/\\btqerbe3ch\\b/gi, 't9erbe3ch');
        replaceAndCount(/\\bqer3a\\b/gi, '9er3a');
        replaceAndCount(/\\btqeyyel\\b/gi, 't9eyyel');
        replaceAndCount(/\\blqahwa\\b/gi, 'l9ahwa');
        replaceAndCount(/\\b9allek(\\s+9allek)+/gi, '9alli');

        // 3. Phonetic spelling discipline
        replaceAndCount(/\\bnketeb\\b/gi, 'nekteb');
        replaceAndCount(/\\bnfehem\\b/gi, 'nefhem');
        replaceAndCount(/\\bnsema3\\b/gi, 'nesma3');

        // 4. Verb morphology: past tense "he tried" -> seyya
        replaceAndCount(/\\b(siyi|tsseyi|tsseya|ssaye|sseyi)\\b/gi, 'seyya');

        // 5. Clitics & clunky literal phrases
        replaceAndCount(/\\bsaguemha\\s+la\\s+fuite\\b/gi, 'saguem la fuite');
        replaceAndCount(/\\bseguemha\\s+la\\s+fuite\\b/gi, 'saguem la fuite');
        replaceAndCount(/w\\s+f\\s+lekher\\s+(saguem|seguem)\\b/gi, 'w enfin saguem');
        replaceAndCount(/\\bl'eau\\s+7amra\\b/gi, 'lma skhoun');
        replaceAndCount(/\\b(krite|krayti|kra)\\s+kar\\b/gi, 'krite tomobil');
        replaceAndCount(/\\b3la\\s+kersh\\s+fargha\\b/gi, '3la rri9');
        replaceAndCount(/\\b(tekoul|tekel|yakoul)\\s+dwa\\b/gi, 'techrob dwa');

        // 6. Quiet neighbors (never 'saktin')
        replaceAndCount(/\\bsaktin\\b/gi, 'calmes');
        replaceAndCount(/\\bsaknin\\s+bzzaf\\b/gi, 'calmes bezzef');

        // 7. Hard Lazmek/Lazim Block
        replaceAndCount(/\\blazmek\\b/gi, 'lazem');
        replaceAndCount(/\\blazim\\b/gi, 'lazem');

        // 8. Ban naked mawjoud/mawjouda for spatial locations
        replaceAndCount(/\\brahi mawjouda\\b/gi, 'jaya');
        replaceAndCount(/\\brah mawjoud\\b/gi, 'jay');
        replaceAndCount(/\\bmawjouda\\b/gi, 'jaya');
        replaceAndCount(/\\bmawjoud\\b/gi, 'jay');

        // 9. Moroccan dialect purge
        replaceAndCount(/\\bdaba\\b/gi, 'doka');
        replaceAndCount(/\\bghadi\\b/gi, 'ra7');
        replaceAndCount(/\\b7it\\b/gi, '3la khater');
        replaceAndCount(/\\bdyalna\\b/gi, 'ta3na');
        replaceAndCount(/\\bdyawelna\\b/gi, 'ta3na');
        replaceAndCount(/\\bdyal\\b/gi, 'ta3');
        replaceAndCount(/\\bghedda\\b/gi, 'ghodwa');
        replaceAndCount(/\\bgal\\s+liya\\b/gi, '9alli');
        replaceAndCount(/\\bgal\\s+lih\\b/gi, '9allou');
        replaceAndCount(/\\bgalli\\b/gi, '9alli');
        replaceAndCount(/\\bmzyan[ae]?\\b/gi, 'mli7');
        replaceAndCount(/\\bmika\\b/gi, 'sachi');

        // 10. Weather matrix clamp
        replaceAndCount(/\\bra7 yji l'?matar\\b/gi, 'ra7 ti7 chta');
        replaceAndCount(/\\byji l'?matar\\b/gi, 'ti7 chta');
        replaceAndCount(/\\bl'?matar\\b/gi, 'chta');

        // 11. Human age matrix clamp
        replaceAndCount(/\\bles voisins l9dima\\b/gi, 'les voisins kbaar');
        replaceAndCount(/\\bles voisins l9dam\\b/gi, 'les voisins kbaar');
        replaceAndCount(/\\bvoisins l9dima\\b/gi, 'voisins kbaar');

        // 12. Prepositional doubling intercept
        replaceAndCount(/\\bma tkharabch fiha les tuyaux\\b/gi, 'ma tkharabch f les tuyaux');
        replaceAndCount(/\\bma tkharabch fih le chauffage\\b/gi, 'ma tkharabch f le chauffage');
        replaceAndCount(/\\bma tkharabch fiha b télécommande\\b/gi, 'ma tkharabch f la télécommande');

        // 13. Clause connector hard-lock
        replaceAndCount(/\\b3la jal le technicien\\b/gi, '3la khater le technicien');
        replaceAndCount(/\\b3la jal lazem\\b/gi, '3la khater lazem');
        replaceAndCount(/\\b3la jal ma krinach\\b/gi, '3la khater ma krinach');
        replaceAndCount(/\\b3la jal ra7 ti7 chta\\b/gi, '3la khater ra7 ti7 chta');

        // 14. Phonetic & vocabulary fixes
        replaceAndCount(/\\bt'?fenetre\\b/gi, 'la fenêtre');
        replaceAndCount(/\\btrou7 barra\\b/gi, 'tkhrej');
        replaceAndCount(/\\bdwawa\\b/gi, 'dwa');
        replaceAndCount(/\\bs'?mana l'?9dima\\b/gi, 'lsemana li fatet');

        // 15. Absolute extraction clamp: l'kra is masculine
        if (t.toLowerCase().includes("l'kra") || t.toLowerCase().includes('lkra')) {
            replaceAndCount(/\\byeddiha\\b/gi, 'yeddih');
            replaceAndCount(/\\bta7kemha\\b/gi, 'ta7kmo');
            replaceAndCount(/\\btjibha\\b/gi, 'tjibo');
        }

        // 16. Loop collapse
        replaceAndCount(/\\b(\\w+)\\s+\\1\\b/gi, '$1');

        item.json.raw_text = raw;
        item.json.text = t;
        item.json.regex_corrections = corrections;
        item.json.error = null;
    }
}
return $input.all();`,
    };

    @node({
        id: '63bc70fa-dffb-403d-9f21-ae0b857e999c',
        name: 'Respond To Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [960, 4400],
    })
    RespondToWebhook = {
        respondWith: 'json',
        responseBody: '={{ $json }}',
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook.out(0).to(this.SetContextDynamicAdapter.in(0));
        this.SetContextDynamicAdapter.out(0).to(this.DynamicMultiModelEngine.in(0));
        this.DynamicMultiModelEngine.out(0).to(this.SanitizeOutput.in(0));
        this.SanitizeOutput.out(0).to(this.RespondToWebhook.in(0));
    }
}
