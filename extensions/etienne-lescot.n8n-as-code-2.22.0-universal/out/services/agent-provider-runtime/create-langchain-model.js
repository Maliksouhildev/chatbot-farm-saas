"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLocalProviderLangChainModel = createLocalProviderLangChainModel;
const anthropic_1 = require("@langchain/anthropic");
const openai_1 = require("@langchain/openai");
const chat_codex_oauth_js_1 = require("./chat-codex-oauth.js");
const copilot_account_js_1 = require("./copilot-account.js");
const COPILOT_DEFAULT_HEADERS = {
    'Editor-Version': 'vscode/1.95.3',
    'Editor-Plugin-Version': 'copilot-chat/0.22.4',
    'Openai-Intent': 'conversation-panel',
};
class CopilotCompletionsModel extends openai_1.ChatOpenAICompletions {
    _convertCompletionsDeltaToBaseMessageChunk(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delta, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rawResponse, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultRole) {
        const chunk = super._convertCompletionsDeltaToBaseMessageChunk(delta, rawResponse, defaultRole);
        const reasoningText = delta?.reasoning_text;
        if (typeof reasoningText === 'string' && reasoningText.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            chunk.additional_kwargs = {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...(chunk.additional_kwargs ?? {}),
                reasoning_content: reasoningText,
            };
        }
        return chunk;
    }
}
async function createLocalProviderLangChainModel(config) {
    switch (config.provider) {
        case 'openai-oauth':
            return new chat_codex_oauth_js_1.ChatCodexOAuth({
                model: config.model,
                reasoningEffort: config.reasoningEffort,
                accessToken: config.apiKey,
            });
        case 'copilot-proxy': {
            if (!config.apiKey) {
                throw new Error('GitHub Copilot provider is not connected.');
            }
            const runtimeAuth = await (0, copilot_account_js_1.resolveCopilotApiToken)(config.apiKey);
            const isGeminiModel = /^gemini/i.test(config.model);
            const copilotFields = {
                apiKey: runtimeAuth.token,
                model: config.model,
                configuration: {
                    baseURL: config.baseUrl || runtimeAuth.baseUrl || copilot_account_js_1.DEFAULT_COPILOT_API_BASE_URL,
                    defaultHeaders: COPILOT_DEFAULT_HEADERS,
                },
                ...(isGeminiModel ? { modelKwargs: { thinking_budget: 1024 } } : {}),
            };
            return new openai_1.ChatOpenAI({
                ...copilotFields,
                completions: new CopilotCompletionsModel(copilotFields),
            });
        }
        case 'minimax':
        case 'minimax-token-plan':
            return new anthropic_1.ChatAnthropic({
                apiKey: config.apiKey,
                model: config.model,
                anthropicApiUrl: config.baseUrl ?? 'https://api.minimax.io/anthropic',
            });
    }
}
//# sourceMappingURL=create-langchain-model.js.map