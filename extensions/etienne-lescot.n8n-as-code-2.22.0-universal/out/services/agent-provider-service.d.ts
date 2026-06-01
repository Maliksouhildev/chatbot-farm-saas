import * as vscode from 'vscode';
import { type AgentReasoningEffort } from './agent-provider-capabilities.js';
export { AGENT_REASONING_EFFORTS } from './agent-provider-capabilities.js';
export type AgentModelProvider = 'anthropic' | 'openai' | 'google' | 'mistral' | 'openrouter' | 'openai-oauth' | 'copilot-proxy' | 'minimax' | 'minimax-token-plan' | 'openai-compatible';
export type ProviderAuthKind = 'api-key' | 'oauth-device' | 'setup-token' | 'none';
export type AgentProviderReasoningEffort = AgentReasoningEffort;
export interface AgentProviderDefinition {
    id: AgentModelProvider;
    label: string;
    description: string;
    defaultModel: string;
    defaultBaseUrl?: string;
    requiresApiKey: boolean;
    authKind: ProviderAuthKind;
    envKeys: string[];
    canDiscoverModels: boolean;
}
export interface AgentProviderConnectionState {
    id: AgentModelProvider;
    label: string;
    description: string;
    authKind: ProviderAuthKind;
    defaultModel: string;
    defaultBaseUrl?: string;
    requiresApiKey: boolean;
    connected: boolean;
    credentialSource?: 'secret' | 'environment';
    selected: boolean;
    model?: string;
    baseUrl?: string;
    supportsReasoningEffort?: boolean;
    reasoningEffort?: AgentProviderReasoningEffort;
}
export declare const AGENT_PROVIDER_DEFINITIONS: Record<AgentModelProvider, AgentProviderDefinition>;
export declare const AGENT_SELECTABLE_PROVIDERS: readonly AgentModelProvider[];
export declare function normalizeAgentProviderId(provider?: string): AgentModelProvider | undefined;
export declare function providerNeedsBaseUrlInput(provider: AgentModelProvider): boolean;
export declare function providerSupportsReasoningEffort(provider: AgentModelProvider, model?: string): boolean;
export declare class AgentProviderService {
    private readonly context;
    constructor(context: vscode.ExtensionContext);
    getDefinition(provider: string): AgentProviderDefinition;
    getStoredCredential(provider: AgentModelProvider): Promise<string | undefined>;
    listProviderConnectionStates(): Promise<AgentProviderConnectionState[]>;
    disconnectProvider(provider: AgentModelProvider): Promise<void>;
    hasEnvironmentCredential(provider: AgentModelProvider): boolean;
    setupProvider(provider: AgentModelProvider): Promise<boolean>;
    selectModel(provider: AgentModelProvider): Promise<string | undefined>;
    selectReasoningEffort(provider: AgentModelProvider, model?: string): Promise<AgentProviderReasoningEffort | undefined>;
    syncReasoningEffortConfiguration(provider: AgentModelProvider, model?: string): Promise<AgentProviderReasoningEffort | undefined>;
    fetchAvailableModels(provider: AgentModelProvider): Promise<string[]>;
    private readEnvironmentCredential;
    private probeMiniMaxModels;
    private getMiniMaxCompletionDiscoveryUrl;
    private getDisabledProviders;
    private setProviderDisabled;
    private fetchJsonModels;
    private getDefaultReasoningEffort;
    private fetchOpenAiOauthModels;
    private extractChatGptAccountId;
    private runDeviceFlow;
    private showDeviceFlowModal;
    private showDeviceFlowWebview;
    private buildDeviceFlowHtml;
    private escapeHtml;
    private getNonce;
    private beginOpenAiDeviceAuth;
    private completeOpenAiDeviceAuth;
    private completeOpenAiDeviceAuthLegacy;
    private exchangeOpenAiDeviceCode;
    private beginGitHubDeviceAuth;
    private completeGitHubDeviceAuth;
    private completeGitHubDeviceAuthLegacy;
    private sleep;
}
//# sourceMappingURL=agent-provider-service.d.ts.map