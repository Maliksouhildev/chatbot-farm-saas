import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Chatbot Farm - Universal Omnichannel Router (Gemini Direct)
// Nodes   : 13  |  Connections: 13
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// IncomingWebhook                    webhook
// ParseInboundPayload                code
// CheckIfOwnerSentMessage            if
// AutoMuteHumanOperatorActive        httpRequest
// LookupBotTenantConfig              httpRequest
// CheckDeductSubscriptionCredit      httpRequest
// IsSubscriptionActiveFunded         if
// IsAudioMessage                     if
// TranscribeVoiceNoteWhisper         httpRequest
// AssembleMasterDarijaPrompt         code
// LlmChatCompletionGemini            httpRequest                [creds]
// DispatchReplyViaEvolutionApi       httpRequest
// RecordLogInSupabase                httpRequest
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// IncomingWebhook
//    → ParseInboundPayload
//      → CheckIfOwnerSentMessage
//        → AutoMuteHumanOperatorActive
//       .out(1) → LookupBotTenantConfig
//          → CheckDeductSubscriptionCredit
//            → IsSubscriptionActiveFunded
//              → IsAudioMessage
//                → TranscribeVoiceNoteWhisper
//                  → AssembleMasterDarijaPrompt
//                    → LlmChatCompletionGemini
//                      → DispatchReplyViaEvolutionApi
//                        → RecordLogInSupabase
//               .out(1) → AssembleMasterDarijaPrompt (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'Zu9M901h7pX8bvD3',
    name: 'Chatbot Farm - Universal Omnichannel Router (Gemini Direct)',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class ChatbotFarmUniversalOmnichannelRouterGeminiDirectWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '11111111-1111-4111-8111-111111111111',
        webhookId: '7fbca9ab-3df5-4232-894c-d1e68175dee4',
        name: 'Incoming Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [100, 300],
    })
    IncomingWebhook = {
        httpMethod: 'POST',
        path: 'universal-omnichannel-router',
        responseMode: 'onReceived',
        options: {},
    };

    @node({
        id: '22222222-2222-4222-8222-222222222222',
        name: 'Parse Inbound Payload',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [320, 300],
    })
    ParseInboundPayload = {
        jsCode: `const body = $input.first().json.body || $input.first().json;

// 1. Filter out non-message events (like contacts.update, presence.update, chats.update)
if (body.event && body.event !== 'messages.upsert') {
  return [];
}

const instanceName = body.instance || body.instanceName || 'default_instance';
const data = body.data || body;
const key = data.key || {};
const message = data.message || {};

const isFromMe = key.fromMe === true;
const remoteJid = key.remoteJid || data.sender || '';
const pushName = data.pushName || 'Client';

let messageText = '';
let isAudio = false;
let audioUrl = '';

if (message.conversation) {
  messageText = message.conversation;
} else if (message.extendedTextMessage && message.extendedTextMessage.text) {
  messageText = message.extendedTextMessage.text;
} else if (message.audioMessage) {
  isAudio = true;
  audioUrl = message.audioMessage.url || '';
} else if (body.text) {
  messageText = body.text;
}

// Ignore empty payloads
if (!messageText.trim() && !isAudio) {
  return [];
}

// Extract clean phone number without @s.whatsapp.net
const cleanPhone = remoteJid.replace('@s.whatsapp.net', '').replace('@c.us', '');

return {
  json: {
    instance_name: instanceName,
    remote_jid: remoteJid,
    customer_phone: cleanPhone,
    customer_name: pushName,
    is_from_me: isFromMe,
    raw_message_text: messageText.trim(),
    is_audio: isAudio,
    audio_url: audioUrl,
    timestamp: new Date().toISOString()
  }
};`,
    };

    @node({
        id: '33333333-3333-4333-8333-333333333333',
        name: 'Check If Owner Sent Message',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [540, 300],
    })
    CheckIfOwnerSentMessage = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'c3333333-3333-4333-8333-333333333333',
                    leftValue: '={{ $json.is_from_me }}',
                    rightValue: true,
                    operator: {
                        type: 'boolean',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: '44444444-4444-4444-8444-444444444444',
        name: 'Auto-Mute: Human Operator Active',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [780, 160],
    })
    AutoMuteHumanOperatorActive = {
        method: 'POST',
        url: 'https://nxovnidenzneydcovmnh.supabase.co/rest/v1/rpc/set_conversation_mute',
        authentication: 'none',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'apikey',
                    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b3ZuaWRlbnpuZXlkY292bW5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI3NzE3NiwiZXhwIjoyMTA0ODUzMTc2fQ.iwOaeENgTbXx53OJkaapM7y0PUg7BLnQAvG2-aGtAQ8',
                },
                {
                    name: 'Authorization',
                    value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b3ZuaWRlbnpuZXlkY292bW5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI3NzE3NiwiZXhwIjoyMTA0ODUzMTc2fQ.iwOaeENgTbXx53OJkaapM7y0PUg7BLnQAvG2-aGtAQ8',
                },
                {
                    name: 'Content-Type',
                    value: 'application/json',
                },
            ],
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `={
  "p_instance_name": "{{ $json.instance_name }}",
  "p_contact_phone": "{{ $json.customer_phone }}",
  "p_mute_minutes": 30
}`,
        options: {},
    };

    @node({
        id: '55555555-5555-4555-8555-555555555555',
        name: 'Lookup Bot & Tenant Config',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [780, 420],
    })
    LookupBotTenantConfig = {
        method: 'GET',
        url: 'https://nxovnidenzneydcovmnh.supabase.co/rest/v1/bot_channels',
        authentication: 'none',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'apikey',
                    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b3ZuaWRlbnpuZXlkY292bW5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI3NzE3NiwiZXhwIjoyMTA0ODUzMTc2fQ.iwOaeENgTbXx53OJkaapM7y0PUg7BLnQAvG2-aGtAQ8',
                },
                {
                    name: 'Authorization',
                    value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b3ZuaWRlbnpuZXlkY292bW5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI3NzE3NiwiZXhwIjoyMTA0ODUzMTc2fQ.iwOaeENgTbXx53OJkaapM7y0PUg7BLnQAvG2-aGtAQ8',
                },
            ],
        },
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'instance_name',
                    value: '=eq.{{ $json.instance_name }}',
                },
                {
                    name: 'select',
                    value: 'bot_id,bots(id,user_id,name,primary_language,base_persona,custom_system_prompt,contact_human_number,auto_mute_minutes,voice_notes_enabled,is_active)',
                },
            ],
        },
        options: {},
    };

    @node({
        id: '66666666-6666-4666-8666-666666666666',
        name: 'Check & Deduct Subscription Credit',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [1020, 420],
    })
    CheckDeductSubscriptionCredit = {
        method: 'POST',
        url: 'https://nxovnidenzneydcovmnh.supabase.co/rest/v1/rpc/process_bot_credit_deduction',
        authentication: 'none',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'apikey',
                    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b3ZuaWRlbnpuZXlkY292bW5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI3NzE3NiwiZXhwIjoyMTA0ODUzMTc2fQ.iwOaeENgTbXx53OJkaapM7y0PUg7BLnQAvG2-aGtAQ8',
                },
                {
                    name: 'Authorization',
                    value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b3ZuaWRlbnpuZXlkY292bW5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI3NzE3NiwiZXhwIjoyMTA0ODUzMTc2fQ.iwOaeENgTbXx53OJkaapM7y0PUg7BLnQAvG2-aGtAQ8',
                },
                {
                    name: 'Content-Type',
                    value: 'application/json',
                },
            ],
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `={
  "p_bot_id": "{{ $json.bots.id }}"
}`,
        options: {},
    };

    @node({
        id: '77777777-7777-4777-8777-777777777777',
        name: 'Is Subscription Active & Funded?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [1260, 420],
    })
    IsSubscriptionActiveFunded = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'c7777777-7777-4777-8777-777777777777',
                    leftValue: '={{ $json.allowed }}',
                    rightValue: true,
                    operator: {
                        type: 'boolean',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: '88888888-8888-4888-8888-888888888888',
        name: 'Is Audio Message?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [1500, 420],
    })
    IsAudioMessage = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'c8888888-8888-4888-8888-888888888888',
                    leftValue: "={{ $('Parse Inbound Payload').first().json.is_audio }}",
                    rightValue: true,
                    operator: {
                        type: 'boolean',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: '99999999-9999-4999-8999-999999999999',
        name: 'Transcribe Voice Note (Whisper)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [1740, 300],
    })
    TranscribeVoiceNoteWhisper = {
        method: 'POST',
        url: 'https://api.groq.com/openai/v1/audio/transcriptions',
        authentication: 'none',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'Authorization',
                    value: '=Bearer {{ $env.GROQ_API_KEY }}',
                },
            ],
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `={
  "model": "whisper-large-v3",
  "url": "{{ $('Parse Inbound Payload').first().json.audio_url }}",
  "temperature": 0.0,
  "language": "ar"
}`,
        options: {},
    };

    @node({
        id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        name: 'Assemble Master Darija Prompt',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [2000, 420],
    })
    AssembleMasterDarijaPrompt = {
        jsCode: `const lookup = $('Lookup Bot & Tenant Config').first().json;
const botConfig = lookup.bots || (Array.isArray(lookup) ? lookup[0]?.bots : null) || {};
const inbound = $('Parse Inbound Payload').first().json;

let questionText = inbound.raw_message_text || '';
if (inbound.is_audio) {
  const whisperRes = $('Transcribe Voice Note (Whisper)').first()?.json;
  if (whisperRes && whisperRes.text) {
    questionText = whisperRes.text;
  }
}

const botName = botConfig.name || 'El Bahdja Store Assistant';
const humanNum = botConfig.contact_human_number || '0551671229';

const systemPrompt = \`You are \${botName}, an authentic Algerian commercial assistant.\\nPrimary mission: Answer customer inquiries warmly, provide accurate details, and take orders smoothly.\\n\\nCRITICAL ALGERIAN DARIJA RULES:\\n1. TONE & IDENTITY: You are based in Algeria. Be warm, polite, and helpful ("khoya", "khti", "saha", "marhba bik").\\n2. SCRIPT ADAPTATION:\\n   - If customer writes in Latin Arabizi (e.g. "salam chhal had lproduit"), reply in natural Algerian Arabizi (using 3, 7, 9, 5 naturally: e.g. "Salam khoya! Had lproduit dayer 3500 DA, w kayen livraison l 58 wilayas via Yalidine!").\\n   - If customer writes in Arabic alphabet, reply in authentic Algerian Darija using Arabic script.\\n   - If customer writes in French, reply in polished, polite French.\\n3. ALGIERS DARIJA DIALECT ACCURACY:\\n   - Use "doka" or "dorka" for now/immediately (never "derk/derwek").\\n   - Obligation: Use "lazem" (never "khassni" or Moroccan "khass").\\n   - Politeness: Use "t3ich" or "y3aychek" for please (never "3afak").\\n   - Positive: Use "chbab", "hayel", "top" (never "zine").\\n   - Negative sandwich: Use "ma [verb]ch" (e.g. "ma 3andnach").\\n4. PRICING IN ALGERIA:\\n   - State prices clearly in DZD (e.g., "3500 DA"). If customary, add vernacular "350 alf".\\n5. ORDER TAKING:\\n   - If customer wants to order, ask for:\\n     * Nom et Prénom\\n     * Numéro de téléphone\\n     * Wilaya et Commune\\n     * Quantité / Produit désiré\\n\\n[BUSINESS PERSONA & CATALOG]\\n\${botConfig.base_persona || 'Warm Algerian store assistant'}\\n\${botConfig.custom_system_prompt || 'Parfums (3500 DA), Montres (4800 DA). Livraison 58 wilayas.'}\`;

return {
  json: {
    system_prompt: systemPrompt,
    user_question: questionText,
    bot_id: botConfig.id || '71d0f49e-7ae7-4153-aab6-cadafeaf1332',
    instance_name: inbound.instance_name,
    remote_jid: inbound.remote_jid,
    customer_phone: inbound.customer_phone
  }
};`,
    };

    @node({
        id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        name: 'LLM Chat Completion (Gemini)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [2240, 420],
        credentials: { googlePalmApi: { id: '4ifvA2ET1NbduXfK', name: 'Google Gemini(PaLM) Api account' } },
    })
    LlmChatCompletionGemini = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googlePalmApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `={
  "system_instruction": {
    "parts": [{ "text": {{ JSON.stringify($json.system_prompt) }} }]
  },
  "contents": [
    {
      "role": "user",
      "parts": [{ "text": {{ JSON.stringify($json.user_question) }} }]
    }
  ],
  "generationConfig": {
    "temperature": 0.3
  }
}`,
        options: {},
    };

    @node({
        id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
        name: 'Dispatch Reply via Evolution API',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [2480, 420],
    })
    DispatchReplyViaEvolutionApi = {
        method: 'POST',
        url: "=http://host.docker.internal:8080/message/sendText/{{ $('Assemble Master Darija Prompt').first().json.instance_name }}",
        authentication: 'none',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'apikey',
                    value: 'farm_evolution_master_secret_2026',
                },
                {
                    name: 'Content-Type',
                    value: 'application/json',
                },
            ],
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `={
  "number": "{{ $('Assemble Master Darija Prompt').first().json.customer_phone }}",
  "text": "{{ $('LLM Chat Completion (Gemini)').first().json.candidates[0].content.parts[0].text.replace(/\\"/g, '\\\\"').replace(/\\n/g, '\\\\n') }}"
}`,
        options: {},
    };

    @node({
        id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
        name: 'Record Log in Supabase',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [2720, 420],
    })
    RecordLogInSupabase = {
        method: 'POST',
        url: 'https://nxovnidenzneydcovmnh.supabase.co/rest/v1/chat_messages',
        authentication: 'none',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'apikey',
                    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b3ZuaWRlbnpuZXlkY292bW5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI3NzE3NiwiZXhwIjoyMTA0ODUzMTc2fQ.iwOaeENgTbXx53OJkaapM7y0PUg7BLnQAvG2-aGtAQ8',
                },
                {
                    name: 'Authorization',
                    value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b3ZuaWRlbnpuZXlkY292bW5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI3NzE3NiwiZXhwIjoyMTA0ODUzMTc2fQ.iwOaeENgTbXx53OJkaapM7y0PUg7BLnQAvG2-aGtAQ8',
                },
                {
                    name: 'Content-Type',
                    value: 'application/json',
                },
            ],
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `={
  "conversation_id": "{{ $('Assemble Master Darija Prompt').first().json.bot_id }}",
  "sender": "ai",
  "message_type": "text",
  "content": "{{ $('LLM Chat Completion (Gemini)').first().json.candidates[0].content.parts[0].text.replace(/\\"/g, '\\\\"').replace(/\\n/g, '\\\\n') }}",
  "tokens_used": {{ $('LLM Chat Completion (Gemini)').first().json.usageMetadata.totalTokenCount || 0 }}
}`,
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.IncomingWebhook.out(0).to(this.ParseInboundPayload.in(0));
        this.ParseInboundPayload.out(0).to(this.CheckIfOwnerSentMessage.in(0));
        this.CheckIfOwnerSentMessage.out(0).to(this.AutoMuteHumanOperatorActive.in(0));
        this.CheckIfOwnerSentMessage.out(1).to(this.LookupBotTenantConfig.in(0));
        this.LookupBotTenantConfig.out(0).to(this.CheckDeductSubscriptionCredit.in(0));
        this.CheckDeductSubscriptionCredit.out(0).to(this.IsSubscriptionActiveFunded.in(0));
        this.IsSubscriptionActiveFunded.out(0).to(this.IsAudioMessage.in(0));
        this.IsAudioMessage.out(0).to(this.TranscribeVoiceNoteWhisper.in(0));
        this.IsAudioMessage.out(1).to(this.AssembleMasterDarijaPrompt.in(0));
        this.TranscribeVoiceNoteWhisper.out(0).to(this.AssembleMasterDarijaPrompt.in(0));
        this.AssembleMasterDarijaPrompt.out(0).to(this.LlmChatCompletionGemini.in(0));
        this.LlmChatCompletionGemini.out(0).to(this.DispatchReplyViaEvolutionApi.in(0));
        this.DispatchReplyViaEvolutionApi.out(0).to(this.RecordLogInSupabase.in(0));
    }
}
