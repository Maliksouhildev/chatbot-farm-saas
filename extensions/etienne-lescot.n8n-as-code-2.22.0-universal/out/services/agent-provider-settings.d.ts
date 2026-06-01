import * as vscode from 'vscode';
export type AgentProviderId = 'anthropic' | 'openai' | 'google' | 'mistral' | 'openrouter' | 'openai-oauth' | 'copilot-proxy' | 'minimax' | 'minimax-token-plan' | 'openai-compatible';
export type AgentProviderReasoningEffortSetting = 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh';
export interface AgentProviderSettings {
    provider: AgentProviderId;
    model?: string;
    baseUrl?: string;
    reasoningEffort?: AgentProviderReasoningEffortSetting;
}
export declare function readAgentProviderSettings(state: vscode.Memento): AgentProviderSettings;
export declare function updateAgentProviderSettings(state: vscode.Memento, patch: Partial<AgentProviderSettings>): Promise<void>;
//# sourceMappingURL=agent-provider-settings.d.ts.map