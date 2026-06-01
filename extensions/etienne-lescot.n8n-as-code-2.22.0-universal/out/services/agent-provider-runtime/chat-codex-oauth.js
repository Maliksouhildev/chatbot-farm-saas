"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatCodexOAuth = void 0;
const chat_models_1 = require("@langchain/core/language_models/chat_models");
const messages_1 = require("@langchain/core/messages");
const outputs_1 = require("@langchain/core/outputs");
const json_schema_1 = require("@langchain/core/utils/json_schema");
const openai_account_js_1 = require("./openai-account.js");
class ChatCodexOAuth extends chat_models_1.BaseChatModel {
    static lc_name() {
        return 'ChatCodexOAuth';
    }
    model;
    reasoningEffort;
    sessionId;
    boundTools;
    boundCallOptions;
    accessToken;
    previousPrompt;
    previousResponseId;
    constructor(fields) {
        super(fields);
        this.model = fields.model;
        this.reasoningEffort = fields.reasoningEffort ?? (0, openai_account_js_1.getDefaultCodexReasoningEffort)(fields.model);
        this.sessionId = (0, openai_account_js_1.ensureCodexSessionId)(fields.sessionId);
        this.boundTools = fields.boundTools;
        this.boundCallOptions = fields.boundCallOptions;
        this.accessToken = fields.accessToken;
        this.previousPrompt = fields.previousPrompt;
        this.previousResponseId = fields.previousResponseId;
    }
    _llmType() {
        return 'chat-codex-oauth';
    }
    _identifyingParams() {
        return {
            provider: 'openai-codex-auth',
            model: this.model,
            reasoningEffort: this.reasoningEffort,
            sessionId: this.sessionId,
        };
    }
    bindTools(tools, kwargs) {
        const normalizedTools = tools
            .map(toLanguageModelTool)
            .filter((tool) => Boolean(tool));
        const boundCallOptions = {
            ...(kwargs ?? {}),
        };
        return new ChatCodexOAuth({
            model: this.model,
            reasoningEffort: this.reasoningEffort,
            sessionId: this.sessionId,
            disableStreaming: this.disableStreaming,
            outputVersion: this.outputVersion,
            boundTools: normalizedTools,
            boundCallOptions,
            accessToken: this.accessToken,
            previousPrompt: this.previousPrompt,
            previousResponseId: this.previousResponseId,
            ...(kwargs?.callbacks ? { callbacks: kwargs.callbacks } : {}),
            ...(kwargs?.tags ? { tags: kwargs.tags } : {}),
            ...(kwargs?.metadata ? { metadata: kwargs.metadata } : {}),
        });
    }
    async _generate(messages, options, _runManager) {
        const model = (0, openai_account_js_1.createOpenAiAccountLanguageModel)(this.model, this.reasoningEffort, this.sessionId, this.accessToken);
        const boundToolChoice = this.boundCallOptions?.tool_choice;
        const prompt = toLanguageModelPrompt(messages);
        const incremental = buildIncrementalPrompt(this.previousPrompt, prompt, this.previousResponseId);
        const result = await model.doGenerate({
            inputFormat: 'prompt',
            mode: {
                type: 'regular',
                tools: options.tools ?? this.boundTools ?? [],
                toolChoice: normalizeToolChoice(options.tool_choice ?? boundToolChoice),
            },
            prompt: incremental.prompt,
            ...(incremental.previousResponseId ? { headers: { 'x-n8n-previous-response-id': incremental.previousResponseId } } : {}),
            abortSignal: options.signal,
        });
        this.previousPrompt = prompt;
        this.previousResponseId = result.response?.id;
        const text = result.text ?? '';
        const toolCalls = (result.toolCalls ?? []).map((toolCall) => ({
            id: toolCall.toolCallId,
            name: toolCall.toolName,
            args: parseToolArgs(toolCall.toolName, toolCall.args),
        }));
        const aiMessage = new messages_1.AIMessage({
            content: text,
            tool_calls: toolCalls,
            additional_kwargs: {
                ...(result.response?.assistantPhase ? { phase: result.response.assistantPhase } : {}),
                ...(result.response?.rawOutputItems ? { codex_output_items: result.response.rawOutputItems } : {}),
            },
            response_metadata: {
                ...(result.response?.assistantPhase ? { phase: result.response.assistantPhase } : {}),
                ...(result.response?.rawOutputItems ? { codex_output_items: result.response.rawOutputItems } : {}),
            },
            usage_metadata: result.usage
                ? {
                    input_tokens: result.usage.promptTokens,
                    output_tokens: result.usage.completionTokens,
                    total_tokens: result.usage.promptTokens + result.usage.completionTokens,
                }
                : undefined,
        });
        return {
            generations: [{
                    text,
                    message: aiMessage,
                    generationInfo: {
                        finishReason: result.finishReason,
                        warnings: result.warnings,
                    },
                }],
            llmOutput: {
                finishReason: result.finishReason,
                usage: result.usage,
                warnings: result.warnings,
            },
        };
    }
    async *_streamResponseChunks(messages, options, runManager) {
        const DEBUG_STREAM = process.env.DEBUG_CODEX_STREAM === '1';
        if (DEBUG_STREAM)
            console.error('[DEBUG_CODEX_STREAM] _streamResponseChunks() called');
        const model = (0, openai_account_js_1.createOpenAiAccountLanguageModel)(this.model, this.reasoningEffort, this.sessionId, this.accessToken);
        const boundToolChoice = this.boundCallOptions?.tool_choice;
        if (DEBUG_STREAM)
            console.error('[DEBUG_CODEX_STREAM] Calling model.doStream()');
        const prompt = toLanguageModelPrompt(messages);
        const incremental = buildIncrementalPrompt(this.previousPrompt, prompt, this.previousResponseId);
        const result = await model.doStream({
            inputFormat: 'prompt',
            mode: {
                type: 'regular',
                tools: options.tools ?? this.boundTools ?? [],
                toolChoice: normalizeToolChoice(options.tool_choice ?? boundToolChoice),
            },
            prompt: incremental.prompt,
            ...(incremental.previousResponseId ? { headers: { 'x-n8n-previous-response-id': incremental.previousResponseId } } : {}),
            abortSignal: options.signal,
        });
        if (DEBUG_STREAM)
            console.error('[DEBUG_CODEX_STREAM] doStream() returned, getting reader');
        const reader = result.stream.getReader();
        const toolCallIndexes = new Map();
        const getToolCallIndex = (toolCallId) => {
            const existing = toolCallIndexes.get(toolCallId);
            if (existing !== undefined) {
                return existing;
            }
            const next = toolCallIndexes.size;
            toolCallIndexes.set(toolCallId, next);
            return next;
        };
        try {
            if (DEBUG_STREAM)
                console.error('[DEBUG_CODEX_STREAM] Reading stream...');
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    if (DEBUG_STREAM)
                        console.error('[DEBUG_CODEX_STREAM] Stream done');
                    break;
                }
                if (DEBUG_STREAM)
                    console.error('[DEBUG_CODEX_STREAM] Got part:', JSON.stringify(value).slice(0, 200));
                const part = value;
                if (part.type === 'text-delta') {
                    if (DEBUG_STREAM)
                        console.error('[DEBUG_CODEX_STREAM] Yielding text-delta:', part.textDelta);
                    const message = new messages_1.AIMessageChunk({
                        content: part.textDelta,
                        additional_kwargs: {},
                    });
                    const chunk = new outputs_1.ChatGenerationChunk({
                        message,
                        text: part.textDelta,
                    });
                    yield chunk;
                    await runManager?.handleLLMNewToken(part.textDelta, { prompt: 0, completion: 0 }, undefined, undefined, undefined, { chunk });
                }
                else if (part.type === 'tool-call-delta') {
                    const index = getToolCallIndex(part.toolCallId);
                    const message = new messages_1.AIMessageChunk({
                        content: '',
                        tool_call_chunks: [{
                                name: part.toolName,
                                args: part.argsTextDelta,
                                id: part.toolCallId,
                                index,
                                type: 'tool_call_chunk',
                            }],
                        additional_kwargs: {
                            tool_calls: [{
                                    id: part.toolCallId,
                                    index,
                                    function: {
                                        name: part.toolName,
                                        arguments: part.argsTextDelta,
                                    },
                                }],
                        },
                    });
                    yield new outputs_1.ChatGenerationChunk({ message, text: '' });
                }
                else if (part.type === 'tool-call') {
                    const index = getToolCallIndex(part.toolCallId);
                    const parsedArgs = parseToolArgs(part.toolName, part.args);
                    const message = new messages_1.AIMessageChunk({
                        content: '',
                        tool_calls: [{
                                name: part.toolName,
                                args: parsedArgs,
                                id: part.toolCallId,
                                type: 'tool_call',
                            }],
                        tool_call_chunks: [{
                                name: part.toolName,
                                args: part.args,
                                id: part.toolCallId,
                                index,
                                type: 'tool_call_chunk',
                            }],
                        additional_kwargs: {
                            tool_calls: [{
                                    id: part.toolCallId,
                                    index,
                                    function: {
                                        name: part.toolName,
                                        arguments: part.args,
                                    },
                                }],
                        },
                    });
                    yield new outputs_1.ChatGenerationChunk({ message, text: '' });
                }
                else if (part.type === 'finish') {
                    this.previousPrompt = prompt;
                    this.previousResponseId = part.providerMetadata?.responseId;
                    if (DEBUG_STREAM)
                        console.error('[DEBUG_CODEX_STREAM] Got finish:', part.finishReason);
                    yield new outputs_1.ChatGenerationChunk({
                        message: new messages_1.AIMessageChunk({
                            content: '',
                            usage_metadata: {
                                input_tokens: part.usage.promptTokens,
                                output_tokens: part.usage.completionTokens,
                                total_tokens: part.usage.promptTokens + part.usage.completionTokens,
                            },
                            response_metadata: {
                                finishReason: part.finishReason,
                                ...(part.providerMetadata?.assistantPhase ? { phase: part.providerMetadata.assistantPhase } : {}),
                                ...(part.providerMetadata?.rawOutputItems ? { codex_output_items: part.providerMetadata.rawOutputItems } : {}),
                            },
                            additional_kwargs: {
                                ...(part.providerMetadata?.assistantPhase ? { phase: part.providerMetadata.assistantPhase } : {}),
                                ...(part.providerMetadata?.rawOutputItems ? { codex_output_items: part.providerMetadata.rawOutputItems } : {}),
                            },
                        }),
                        text: '',
                        generationInfo: {
                            finishReason: part.finishReason,
                        },
                    });
                    return;
                }
                else if (part.type === 'error') {
                    throw new Error(`Codex stream error: ${part.error}`);
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
}
exports.ChatCodexOAuth = ChatCodexOAuth;
function buildIncrementalPrompt(previousPrompt, nextPrompt, previousResponseId) {
    if (!previousPrompt || !previousResponseId || previousPrompt.length >= nextPrompt.length) {
        return { prompt: nextPrompt };
    }
    const samePrefix = previousPrompt.every((message, index) => JSON.stringify(message) === JSON.stringify(nextPrompt[index]));
    if (!samePrefix) {
        return { prompt: nextPrompt };
    }
    let deltaPrompt = nextPrompt.slice(previousPrompt.length);
    while (deltaPrompt[0]?.role === 'assistant') {
        deltaPrompt = deltaPrompt.slice(1);
    }
    if (deltaPrompt.length === 0) {
        return { prompt: nextPrompt };
    }
    return {
        prompt: deltaPrompt,
        previousResponseId,
    };
}
function toLanguageModelPrompt(messages) {
    return messages.map((message) => {
        if (messages_1.SystemMessage.isInstance(message)) {
            return {
                role: 'system',
                content: stringifyMessageContent(message.content),
            };
        }
        if (messages_1.HumanMessage.isInstance(message)) {
            return {
                role: 'user',
                content: [{ type: 'text', text: stringifyMessageContent(message.content) }],
            };
        }
        if (messages_1.ToolMessage.isInstance(message)) {
            return {
                role: 'tool',
                content: [{
                        type: 'tool-result',
                        toolCallId: message.tool_call_id,
                        toolName: message.name || 'tool',
                        result: stringifyMessageContent(message.content),
                        isError: message.status === 'error',
                    }],
            };
        }
        if (messages_1.AIMessage.isInstance(message)) {
            const content = [];
            const text = stringifyMessageContent(message.content);
            if (text) {
                content.push({ type: 'text', text });
            }
            for (const toolCall of message.tool_calls ?? []) {
                content.push({
                    type: 'tool-call',
                    toolCallId: toolCall.id || toolCall.name,
                    toolName: toolCall.name,
                    args: toolCall.args,
                });
            }
            return {
                role: 'assistant',
                content,
                ...extractAssistantPhase(message),
                ...extractRawOutputItems(message),
            };
        }
        return {
            role: 'user',
            content: [{ type: 'text', text: stringifyMessageContent(message.content) }],
        };
    });
}
function extractAssistantPhase(message) {
    const additionalPhase = message.additional_kwargs && typeof message.additional_kwargs === 'object'
        ? message.additional_kwargs.phase
        : undefined;
    if (typeof additionalPhase === 'string' && additionalPhase.trim()) {
        return { phase: additionalPhase.trim() };
    }
    const responsePhase = message.response_metadata && typeof message.response_metadata === 'object'
        ? message.response_metadata.phase
        : undefined;
    if (typeof responsePhase === 'string' && responsePhase.trim()) {
        return { phase: responsePhase.trim() };
    }
    return {};
}
function extractRawOutputItems(message) {
    const fromAdditional = message.additional_kwargs && typeof message.additional_kwargs === 'object'
        ? message.additional_kwargs.codex_output_items
        : undefined;
    if (Array.isArray(fromAdditional)) {
        return { rawOutputItems: fromAdditional.filter((item) => Boolean(item) && typeof item === 'object') };
    }
    const fromResponse = message.response_metadata && typeof message.response_metadata === 'object'
        ? message.response_metadata.codex_output_items
        : undefined;
    if (Array.isArray(fromResponse)) {
        return { rawOutputItems: fromResponse.filter((item) => Boolean(item) && typeof item === 'object') };
    }
    return {};
}
function stringifyMessageContent(content) {
    if (typeof content === 'string') {
        return content;
    }
    if (Array.isArray(content)) {
        return content
            .map((part) => {
            if (typeof part === 'string') {
                return part;
            }
            if (part && typeof part === 'object' && 'text' in part && typeof part.text === 'string') {
                return part.text;
            }
            return '';
        })
            .join('\n')
            .trim();
    }
    return content == null ? '' : String(content);
}
function normalizeToolChoice(toolChoice) {
    if (!toolChoice || toolChoice === 'auto') {
        return undefined;
    }
    if (toolChoice === 'any') {
        return { type: 'required' };
    }
    if (toolChoice === 'none') {
        return { type: 'none' };
    }
    if (typeof toolChoice === 'string') {
        return { type: 'tool', toolName: toolChoice };
    }
    return undefined;
}
function parseToolArgs(toolName, args) {
    try {
        const parsed = JSON.parse(args);
        const normalized = parsed && typeof parsed === 'object' ? parsed : {};
        if (toolName === 'edit_file' && normalized.replace_all === null) {
            delete normalized.replace_all;
        }
        return normalized;
    }
    catch {
        return {};
    }
}
function toLanguageModelTool(input) {
    if (!input || typeof input !== 'object') {
        return undefined;
    }
    const candidate = input;
    const name = typeof candidate.name === 'string' ? candidate.name : undefined;
    if (!name) {
        return undefined;
    }
    const parameters = toJsonSchema(candidate.parameters ?? candidate.schema);
    return {
        type: 'function',
        name,
        description: typeof candidate.description === 'string' ? candidate.description : undefined,
        parameters,
        strict: true,
    };
}
function toJsonSchema(schema) {
    const converted = schema && typeof schema === 'object'
        ? (0, json_schema_1.toJsonSchema)(schema)
        : undefined;
    return normalizeJsonSchemaRoot(converted);
}
function normalizeJsonSchemaRoot(schema) {
    const normalized = normalizeJsonSchema(schema && typeof schema === 'object' && !Array.isArray(schema)
        ? schema
        : { type: 'object', properties: {}, additionalProperties: true });
    return normalized.type === 'object'
        ? normalized
        : { type: 'object', properties: {}, additionalProperties: true };
}
function normalizeJsonSchema(schema) {
    const normalized = { ...schema };
    if (normalized.type === 'object') {
        normalized.properties = normalized.properties ?? {};
    }
    if (normalized.items && typeof normalized.items === 'object' && !Array.isArray(normalized.items)) {
        normalized.items = normalizeJsonSchema(normalized.items);
    }
    if (Array.isArray(normalized.anyOf)) {
        normalized.anyOf = normalized.anyOf.map((entry) => entry && typeof entry === 'object' && !Array.isArray(entry)
            ? normalizeJsonSchema(entry)
            : entry);
    }
    if (normalized.properties) {
        normalized.properties = Object.fromEntries(Object.entries(normalized.properties).map(([key, value]) => [
            key,
            value && typeof value === 'object' && !Array.isArray(value)
                ? normalizeJsonSchema(value)
                : value,
        ]));
    }
    return normalized;
}
//# sourceMappingURL=chat-codex-oauth.js.map