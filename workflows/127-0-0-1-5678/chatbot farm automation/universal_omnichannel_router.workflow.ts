import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Chatbot Farm - Universal Omnichannel Multimodal Router
// Nodes   : 12  |  Connections: 12
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                         Node type (short)         Flags
// IncomingOmnichannelWebhook            webhook
// ParseValidateInboundEvent             code
// IsAiBotToggleActive                   if
// DebounceSlidingBuffer17sAggregator    code
// IsVoiceNoteAudioPresent               if
// TranscribeVoiceNoteWhisperAudioFirst  httpRequest
// IsImagePresent                        if
// ContextAwareVisionAnalysisGeminiFlash httpRequest                [creds]
// AssembleMasterMultimodalDarijaPrompt  code
// LlmChatCompletionGemini25Flash        httpRequest                [creds]
// AntiBotSafeCadenceDelay               wait
// DispatchNativeQuotedReply             httpRequest
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// IncomingOmnichannelWebhook
//    → ParseValidateInboundEvent
//      → IsAiBotToggleActive
//        → DebounceSlidingBuffer17sAggregator
//          → IsVoiceNoteAudioPresent
//            → TranscribeVoiceNoteWhisperAudioFirst
//              → IsImagePresent
//                → ContextAwareVisionAnalysisGeminiFlash
//                  → AssembleMasterMultimodalDarijaPrompt
//                    → LlmChatCompletionGemini25Flash
//                      → AntiBotSafeCadenceDelay
//                        → DispatchNativeQuotedReply
// </workflow-map>

@workflow({
    id: 'Zu9M901h7pX8bvD3',
    name: 'Chatbot Farm - Universal Omnichannel Multimodal Router',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class ChatbotFarmUniversalOmnichannelRouterWorkflow {
    @node({
        id: '11111111-1111-4111-8111-111111111111',
        webhookId: '7fbca9ab-3df5-4232-894c-d1e68175dee4',
        name: 'Incoming Omnichannel Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [100, 300],
    })
    IncomingOmnichannelWebhook = {
        httpMethod: 'POST',
        path: 'universal-omnichannel-router',
        responseMode: 'onReceived',
        options: {},
    };

    @node({
        id: '22222222-2222-4222-8222-222222222222',
        name: 'Parse & Validate Inbound Event',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [320, 300],
    })
    ParseValidateInboundEvent = {
        jsCode: `const body = $input.first().json.body || $input.first().json;
let channel = 'whatsapp';
if (body.channel) channel = body.channel.toLowerCase();
else if (body.guild_id || body.channel_id) channel = 'discord';
else if (body.update_id || body.message?.chat) channel = 'telegram';

return { json: { ...body, channel, timestamp: new Date().toISOString() } };`,
    };

    @node({
        id: '33333333-3333-4333-8333-333333333333',
        name: 'Is AI Bot Toggle Active?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [540, 300],
    })
    IsAiBotToggleActive = {
        conditions: {
            conditions: [
                {
                    leftValue: '={{ $json.ai_enabled }}',
                    rightValue: true,
                    operator: { type: 'boolean', operation: 'equals' },
                },
            ],
            combinator: 'and',
        },
    };

    @node({
        id: '44444444-4444-4444-8444-444444444444',
        name: 'Debounce Sliding Buffer (17s Aggregator)',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [780, 300],
    })
    DebounceSlidingBuffer17sAggregator = {
        jsCode: `// 17-second sliding debounce aggregation
const inbound = $input.first().json;
return { json: { ...inbound, debounce_window_seconds: 17 } };`,
    };

    @node({
        id: '55555555-5555-4555-8555-555555555555',
        name: 'Is Voice Note Audio Present?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [1020, 300],
    })
    IsVoiceNoteAudioPresent = {
        conditions: {
            conditions: [
                {
                    leftValue: '={{ $json.is_audio }}',
                    rightValue: true,
                    operator: { type: 'boolean', operation: 'equals' },
                },
            ],
            combinator: 'and',
        },
    };

    @node({
        id: '66666666-6666-4666-8666-666666666666',
        name: 'Transcribe Voice Note (Whisper Audio-First)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [1260, 200],
    })
    TranscribeVoiceNoteWhisperAudioFirst = {
        method: 'POST',
        url: 'https://api.groq.com/openai/v1/audio/transcriptions',
    };

    @node({
        id: '77777777-7777-4777-8777-777777777777',
        name: 'Is Image Present?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [1500, 300],
    })
    IsImagePresent = {
        conditions: {
            conditions: [
                {
                    leftValue: '={{ $json.is_image }}',
                    rightValue: true,
                    operator: { type: 'boolean', operation: 'equals' },
                },
            ],
            combinator: 'and',
        },
    };

    @node({
        id: '88888888-8888-4888-8888-888888888888',
        name: 'Context-Aware Vision Analysis (Gemini Flash)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [1740, 200],
    })
    ContextAwareVisionAnalysisGeminiFlash = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    };

    @node({
        id: '99999999-9999-4999-8999-999999999999',
        name: 'Assemble Master Multimodal Darija Prompt',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1980, 300],
    })
    AssembleMasterMultimodalDarijaPrompt = {
        jsCode: `// Roll 33% reaction probability and format master prompt
const rollReaction = Math.random() < 0.33;
return { json: { should_react: rollReaction } };`,
    };

    @node({
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        name: 'LLM Chat Completion (Gemini 2.5 Flash)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [2220, 300],
    })
    LlmChatCompletionGemini25Flash = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    };

    @node({
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        name: 'Anti-Bot Safe Cadence Delay (Typing Simulator)',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [2460, 300],
    })
    AntiBotSafeCadenceDelay = {
        amount: 2,
        unit: 'seconds',
    };

    @node({
        id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        name: 'Dispatch Native Quoted Reply (WhatsApp / Discord / Telegram)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [2700, 300],
    })
    DispatchNativeQuotedReply = {
        method: 'POST',
        url: 'http://host.docker.internal:3000/api/channels/whatsapp/send',
    };
}
