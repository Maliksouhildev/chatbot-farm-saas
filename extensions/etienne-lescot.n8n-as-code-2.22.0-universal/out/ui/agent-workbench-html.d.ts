export interface AgentWorkbenchHtmlInput {
    workflowId: string;
    workflowName: string;
    workflowFilename?: string;
    workflowFilePath?: string;
    workflowAttached?: boolean;
    workflowUrl?: string;
    workflowReloadUrl?: string;
    providerModelLabel: string;
}
export declare const AGENT_WORKBENCH_BUILD = "awb-2026.05.21.1-last-active-session";
export declare function buildAgentWorkbenchHtml(input: AgentWorkbenchHtmlInput): string;
//# sourceMappingURL=agent-workbench-html.d.ts.map