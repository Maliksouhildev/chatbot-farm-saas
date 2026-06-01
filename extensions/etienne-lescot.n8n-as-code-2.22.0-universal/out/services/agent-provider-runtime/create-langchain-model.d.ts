import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { CodexReasoningEffort } from './openai-account.js';
export type LocalAgentProvider = 'openai-oauth' | 'copilot-proxy' | 'minimax' | 'minimax-token-plan';
export interface LocalLangChainModelConfig {
    provider: LocalAgentProvider;
    model: string;
    apiKey?: string;
    baseUrl?: string;
    reasoningEffort?: CodexReasoningEffort;
}
export declare function createLocalProviderLangChainModel(config: LocalLangChainModelConfig): Promise<BaseChatModel>;
//# sourceMappingURL=create-langchain-model.d.ts.map