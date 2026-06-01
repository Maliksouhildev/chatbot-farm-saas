export interface AgentManagerHtmlInput {
    provider: string;
    providerLabel: string;
    model?: string;
    baseUrl?: string;
    reasoningEffort?: string;
    supportsReasoningEffort?: boolean;
    hasStoredApiKey: boolean;
    authKind: string;
}
export declare function buildAgentManagerHtml(input: AgentManagerHtmlInput): string;
//# sourceMappingURL=agent-manager-html.d.ts.map