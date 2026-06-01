import * as vscode from 'vscode';
import { IWorkflowStatus } from 'n8nac';
import { AgentRuntimeController, type AgentWorkflowContext } from '../services/agent-runtime-controller.js';
import type { WorktreeInfo } from '../services/worktree-service.js';
interface AgentWorkbenchNodeContext {
    name: string;
    type?: string;
    id?: string;
}
interface AgentWorkflowTarget {
    workflow?: IWorkflowStatus;
    workflowFilePath?: string;
    workflowUrl?: string;
    workflowReloadUrl?: string;
}
interface AgentWorkbenchWorkflowProviders {
    listWorkflows(): Promise<IWorkflowStatus[]>;
    resolveWorkflow(workflow: AgentWorkflowContext): Promise<AgentWorkflowTarget>;
    listWorkflowNodes(workflow: AgentWorkflowContext): Promise<AgentWorkbenchNodeContext[]>;
    listProviderOptions(): Promise<Array<Record<string, unknown>>>;
    listModelOptions(provider: string): Promise<Array<Record<string, unknown>>>;
    selectProviderModel(provider: string, model: string): Promise<void>;
    selectReasoningEffort(effort: string): Promise<void>;
    listWorktrees(): Promise<WorktreeInfo[]>;
    createWorktree(options?: {
        branchName?: string;
    }): Promise<WorktreeInfo | undefined>;
    removeWorktree(worktreePath: string): Promise<void>;
}
export declare class AgentWorkbenchWebview {
    private static readonly _panels;
    private static _lastActiveSessionId;
    private static _clipboardPasteHandler;
    private readonly _panel;
    private readonly _context;
    private readonly _agentRuntime;
    private readonly _outputChannel;
    private readonly _disposables;
    private _registryDisposable;
    private _workflow;
    private _workflowFilePath;
    private _workflowUrl;
    private _workflowReloadUrl;
    private _providerModelLabel;
    private _nodeContexts;
    private _workflowProviders;
    private _activeSessionId;
    private _stateSequence;
    private constructor();
    static createOrShow(context: vscode.ExtensionContext, workflow: IWorkflowStatus | undefined, workflowFilePath: string | undefined, workflowUrl: string | undefined, workflowReloadUrl: string | undefined, providerModelLabel: string, agentRuntime: AgentRuntimeController, outputChannel: vscode.OutputChannel, workflowProviders: AgentWorkbenchWorkflowProviders, initialSessionId?: string, viewColumn?: vscode.ViewColumn): void;
    static onClipboardPasteRequest(handler: (panel: vscode.WebviewPanel, grantToken: string) => Promise<void>): void;
    static getCurrentActiveSessionId(): string | undefined;
    update(workflow: IWorkflowStatus | undefined, workflowFilePath: string | undefined, workflowUrl: string | undefined, workflowReloadUrl: string | undefined, providerModelLabel: string, postState?: boolean): void;
    dispose(): void;
    private handleMessage;
    private sanitizeNodeContext;
    private sanitizeNodeContexts;
    private sanitizeWorkflowContext;
    private getProviderModelLabel;
    private readSelectedProvider;
    private buildWorkbenchInput;
    private postWorkbenchState;
    private postAgentRuntimeMessage;
    private reconcileWorkflowContext;
    private getWorkflowOptions;
    private getWorkflowNodeOptions;
    private extractNodeContextsFromTypeScript;
    private extractStringProperty;
    private updateRegistryRegistration;
    private getHtmlForWebview;
}
export {};
//# sourceMappingURL=agent-workbench-webview.d.ts.map