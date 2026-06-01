"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AGENT_REASONING_EFFORTS = void 0;
exports.getReasoningCapability = getReasoningCapability;
exports.normalizeReasoningEffortForCapability = normalizeReasoningEffortForCapability;
exports.buildLangChainReasoningOptions = buildLangChainReasoningOptions;
exports.getReasoningOptions = getReasoningOptions;
exports.shouldDisableModelStreamingForToolCalling = shouldDisableModelStreamingForToolCalling;
exports.AGENT_REASONING_EFFORTS = ['none', 'minimal', 'low', 'medium', 'high', 'xhigh'];
const OPENAI_REASONING_EFFORTS = ['none', 'low', 'medium', 'high'];
const ANTHROPIC_REASONING_EFFORTS = ['none', 'low', 'medium', 'high', 'xhigh'];
const OPENROUTER_REASONING_EFFORTS = ['none', 'low', 'medium', 'high'];
const GOOGLE_REASONING_EFFORTS = ['none', 'low', 'medium', 'high'];
function getReasoningCapability(provider, model) {
    const normalizedProvider = provider;
    if (normalizedProvider === 'openai-oauth') {
        return { supported: true, efforts: exports.AGENT_REASONING_EFFORTS, defaultEffort: 'medium', strategy: 'custom-openai-account' };
    }
    if ((normalizedProvider === 'openai' || normalizedProvider === 'openai-compatible') && isOpenAIReasoningModel(model)) {
        return { supported: true, efforts: OPENAI_REASONING_EFFORTS, defaultEffort: 'medium', strategy: 'openai-responses' };
    }
    if (normalizedProvider === 'anthropic' && isAnthropicReasoningModel(model)) {
        return { supported: true, efforts: ANTHROPIC_REASONING_EFFORTS, defaultEffort: 'medium', strategy: 'anthropic-thinking' };
    }
    if (normalizedProvider === 'openrouter' && isOpenRouterReasoningModel(model)) {
        return { supported: true, efforts: OPENROUTER_REASONING_EFFORTS, defaultEffort: 'medium', strategy: 'openrouter-reasoning' };
    }
    if (normalizedProvider === 'google' && isGeminiThinkingModel(model)) {
        return { supported: true, efforts: GOOGLE_REASONING_EFFORTS, defaultEffort: 'medium', strategy: 'google-thinking' };
    }
    return { supported: false, efforts: ['none'] };
}
function normalizeReasoningEffortForCapability(effort, capability) {
    if (!capability.supported)
        return undefined;
    if (!effort)
        return capability.defaultEffort;
    if (capability.efforts.includes(effort))
        return effort;
    if (effort === 'minimal' && capability.efforts.includes('low'))
        return 'low';
    if (effort === 'xhigh' && capability.efforts.includes('high'))
        return 'high';
    return capability.defaultEffort;
}
function buildLangChainReasoningOptions(provider, model, effort) {
    const capability = getReasoningCapability(provider, model);
    const normalizedEffort = normalizeReasoningEffortForCapability(effort, capability);
    if (!capability.supported || !normalizedEffort || normalizedEffort === 'none')
        return {};
    switch (capability.strategy) {
        case 'openai-responses':
            return {
                reasoning: { effort: toOpenAIReasoningEffort(normalizedEffort) },
                useResponsesApi: true,
            };
        case 'anthropic-thinking':
            return buildAnthropicReasoningOptions(model, normalizedEffort);
        case 'openrouter-reasoning':
            return {
                modelKwargs: {
                    reasoning: { effort: toOpenAIReasoningEffort(normalizedEffort) },
                    include_reasoning: true,
                },
            };
        case 'google-thinking':
            return {
                thinkingConfig: {
                    includeThoughts: true,
                    thinkingLevel: toGoogleThinkingLevel(normalizedEffort),
                    thinkingBudget: toGoogleThinkingBudget(normalizedEffort),
                },
                modelKwargs: {
                    extra_body: {
                        google: {
                            thinking_config: {
                                include_thoughts: true,
                                thinking_budget: toGoogleThinkingBudget(normalizedEffort),
                            },
                        },
                    },
                },
            };
        default:
            return {};
    }
}
function getReasoningOptions(provider, model, selected) {
    const capability = getReasoningCapability(provider, model);
    return capability.efforts.map((effort) => ({
        id: effort,
        label: effort,
        selected: effort === selected,
    }));
}
function shouldDisableModelStreamingForToolCalling(provider, model) {
    return provider === 'google' && normalizeModelName(model).startsWith('gemini-3');
}
function buildAnthropicReasoningOptions(model, effort) {
    if (isAnthropicAdaptiveThinkingModel(model)) {
        return {
            thinking: { type: 'adaptive', display: 'summarized' },
            outputConfig: { effort: toAnthropicEffort(effort) },
        };
    }
    return {
        thinking: {
            type: 'enabled',
            budget_tokens: toAnthropicBudgetTokens(effort),
            display: 'summarized',
        },
    };
}
function isOpenAIReasoningModel(model) {
    const normalized = normalizeModelName(model);
    return /^(o\d|o\d-|o\d\.|gpt-5|gpt-5-|gpt-5\.)/.test(normalized);
}
function isAnthropicReasoningModel(model) {
    const normalized = normalizeModelName(model);
    return /^claude-(opus|sonnet|haiku)-4/.test(normalized) || /^claude-3-7/.test(normalized) || normalized.includes('claude-3.7');
}
function isAnthropicAdaptiveThinkingModel(model) {
    const normalized = normalizeModelName(model);
    return /^claude-(opus|sonnet)-4-[67]/.test(normalized) || /^claude-(opus|sonnet)-4\.(6|7)/.test(normalized);
}
function isGeminiThinkingModel(model) {
    const normalized = normalizeModelName(model);
    return normalized.startsWith('gemini-2.5') || normalized.startsWith('gemini-3');
}
function isOpenRouterReasoningModel(model) {
    const normalized = normalizeModelName(model);
    return isOpenAIReasoningModel(normalized)
        || isAnthropicReasoningModel(normalized.replace(/^anthropic\//, ''))
        || normalized.includes('/deepseek-r1')
        || normalized.includes('deepseek/deepseek-r1')
        || normalized.includes('/qwen') && normalized.includes('thinking')
        || normalized.includes('/grok-4')
        || normalized.includes('grok-4');
}
function toOpenAIReasoningEffort(effort) {
    if (effort === 'high' || effort === 'xhigh')
        return 'high';
    if (effort === 'medium')
        return 'medium';
    return 'low';
}
function toAnthropicEffort(effort) {
    if (effort === 'xhigh')
        return 'xhigh';
    if (effort === 'high')
        return 'high';
    if (effort === 'medium')
        return 'medium';
    return 'low';
}
function toAnthropicBudgetTokens(effort) {
    if (effort === 'xhigh')
        return 16_000;
    if (effort === 'high')
        return 10_000;
    if (effort === 'medium')
        return 4_000;
    return 1_024;
}
function toGoogleThinkingLevel(effort) {
    if (effort === 'high' || effort === 'xhigh')
        return 'HIGH';
    if (effort === 'medium')
        return 'MEDIUM';
    return 'LOW';
}
function toGoogleThinkingBudget(effort) {
    if (effort === 'high' || effort === 'xhigh')
        return 8_192;
    if (effort === 'medium')
        return 4_096;
    return 1_024;
}
function normalizeModelName(model) {
    return model?.trim().toLowerCase() || '';
}
//# sourceMappingURL=agent-provider-capabilities.js.map