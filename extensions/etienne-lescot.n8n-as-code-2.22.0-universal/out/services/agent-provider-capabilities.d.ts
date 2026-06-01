export type AgentCapabilityProvider = 'anthropic' | 'openai' | 'google' | 'mistral' | 'openrouter' | 'openai-oauth' | 'copilot-proxy' | 'minimax' | 'minimax-token-plan' | 'openai-compatible';
export type AgentReasoningEffort = 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh';
export declare const AGENT_REASONING_EFFORTS: readonly AgentReasoningEffort[];
export interface ReasoningCapability {
    supported: boolean;
    efforts: readonly AgentReasoningEffort[];
    defaultEffort?: AgentReasoningEffort;
    strategy?: 'custom-openai-account' | 'openai-responses' | 'anthropic-thinking' | 'openrouter-reasoning' | 'google-thinking';
}
export interface LangChainReasoningOptions {
    reasoning?: {
        effort: 'low' | 'medium' | 'high';
    };
    thinking?: Record<string, unknown>;
    outputConfig?: Record<string, unknown>;
    thinkingConfig?: Record<string, unknown>;
    modelKwargs?: Record<string, unknown>;
    useResponsesApi?: boolean;
}
export declare function getReasoningCapability(provider: string, model?: string): ReasoningCapability;
export declare function normalizeReasoningEffortForCapability(effort: AgentReasoningEffort | undefined, capability: ReasoningCapability): AgentReasoningEffort | undefined;
export declare function buildLangChainReasoningOptions(provider: string, model: string | undefined, effort: AgentReasoningEffort | undefined): LangChainReasoningOptions;
export declare function getReasoningOptions(provider: string, model?: string, selected?: AgentReasoningEffort): Array<{
    id: AgentReasoningEffort;
    label: string;
    selected: boolean;
}>;
export declare function shouldDisableModelStreamingForToolCalling(provider: string, model?: string): boolean;
//# sourceMappingURL=agent-provider-capabilities.d.ts.map