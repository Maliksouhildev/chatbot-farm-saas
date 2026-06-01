import * as vscode from 'vscode';
import { type AgentReasoningEffort as AgentProviderReasoningEffort } from './agent-provider-capabilities.js';
import type { WorktreeInfo } from './worktree-service.js';
export interface AgentPromptInput {
    prompt: string;
    workflowId?: string;
    workflowName?: string;
    workflowFilename?: string;
    workflowFilePath?: string;
    workspaceRoot?: string;
    worktreePath?: string;
    nodeContext?: AgentNodeContext;
    nodeContexts?: AgentNodeContext[];
    sessionId?: string;
}
export interface AgentNodeContext {
    name: string;
    type?: string;
    id?: string;
}
export interface AgentWorkflowContext {
    id?: string;
    name: string;
    filename?: string;
    filePath?: string;
}
export type AgentReasoningEffort = AgentProviderReasoningEffort;
export interface AgentContextUsage {
    promptTokens: number;
    completionTokens: number;
    contextWindowTokens: number;
    fillPercent: number;
    source: 'api' | 'estimated';
}
export interface AgentCheckpointSummary {
    id: string;
    sessionId: string;
    createdAt: string;
    messageCount: number;
    summary?: string;
    reason?: CheckpointReason;
    label?: string;
    restoredAt?: string;
}
export interface AgentCompactionSummary {
    summary: string;
    source: 'llm' | 'fallback';
    messagesCompacted: number;
    preservedRecentMessages: number;
    estimatedTokens?: number;
    thresholdTokens?: number;
    fallbackReason?: string;
}
export interface AgentMessageCheckpointLink {
    runtimeCheckpointId?: string;
    workspaceSnapshotId?: string;
    workbenchCheckpointId: string;
}
export interface AgentSessionSummary {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messageCount: number;
    isActive: boolean;
    isRunning: boolean;
    isClosed: boolean;
    checkpointCount: number;
    workflowId?: string;
    workflowLabel: string;
    workflowContext?: AgentWorkflowContext;
    totalCompactions: number;
}
export type AgentTimelineEntry = {
    kind: 'user-message';
    id: string;
    text: string;
    timestamp: number;
    checkpoint?: AgentMessageCheckpointLink;
} | {
    kind: 'system-notice';
    id: string;
    text: string;
    timestamp: number;
} | {
    kind: 'workflow-context';
    id: string;
    timestamp: number;
    action: 'set';
    workflow: AgentWorkflowContext;
} | {
    kind: 'workflow-context';
    id: string;
    timestamp: number;
    action: 'clear';
} | {
    kind: 'node-context';
    id: string;
    timestamp: number;
    nodes: AgentNodeContext[];
} | {
    kind: 'assistant-body';
    id: string;
    text: string;
    streaming: boolean;
    finalState?: string;
} | {
    kind: 'operation';
    id: string;
    tone: 'info' | 'success' | 'error';
    title: string;
    detail?: string;
    category?: string;
    status?: 'running' | 'done' | 'error';
    body?: string;
    summary?: string;
    startedAt?: number;
    endedAt?: number;
} | {
    kind: 'compaction';
    id: string;
    timestamp: number;
    event: AgentCompactionSummary;
} | {
    kind: 'context-usage';
    id: string;
    timestamp: number;
    usage: AgentContextUsage;
};
export interface AgentSessionState {
    sessionId: string;
    title: string;
    entries: AgentTimelineEntry[];
    checkpoints: AgentCheckpointSummary[];
    contextUsage?: AgentContextUsage;
    lastCompaction?: AgentCompactionSummary;
    totalCompactions: number;
    workflowId?: string;
    workflowLabel: string;
    workflowContext?: AgentWorkflowContext;
    nodeContexts: AgentNodeContext[];
}
export interface AgentWorkbenchState {
    workflow: {
        id?: string;
        name?: string;
        filename?: string;
    };
    workflowContext?: AgentWorkflowContext;
    provider: string;
    model?: string;
    baseUrl?: string;
    reasoningEffort?: AgentReasoningEffort;
    supportsReasoningEffort: boolean;
    currentNodeContext?: AgentNodeContext;
    currentNodeContexts: AgentNodeContext[];
    activeSessionId: string;
    sessions: AgentSessionSummary[];
    session: AgentSessionState;
    isRunning: boolean;
    activeWorktree?: WorktreeInfo;
    availableWorktrees: WorktreeInfo[];
}
export interface AgentRunResult {
    workflowChanged: boolean;
    workflowContext?: AgentWorkflowContext;
}
export type AgentStreamEvent = {
    type: 'start';
    sessionId: string;
    message: string;
} | {
    type: 'progress';
    tone: 'info' | 'success' | 'error';
    title: string;
    detail?: string;
    phase?: string;
} | {
    type: 'operation';
    operationId: string;
    label: string;
    category: string;
    status: 'running' | 'done' | 'error';
    body?: string;
    summary?: string;
    startedAt: number;
    endedAt?: number;
} | {
    type: 'text-delta';
    delta: string;
} | {
    type: 'compaction';
    summary: string;
    source: 'llm' | 'fallback';
    messagesCompacted: number;
    preservedRecentMessages: number;
    estimatedTokens?: number;
    thresholdTokens?: number;
    fallbackReason?: string;
} | AgentContextUsageEvent | {
    type: 'final';
    sessionId: string;
    response: string;
    finalState: string;
    runtimeFinalizing?: boolean;
} | {
    type: 'error';
    error: string;
};
type AgentContextUsageEvent = {
    type: 'context-usage';
    promptTokens: number;
    completionTokens: number;
    contextWindowTokens: number;
    fillPercent: number;
    source: 'api' | 'estimated';
};
export type AgentWorkbenchMessage = {
    type: 'agent.status';
    status: 'idle' | 'running' | 'stopping';
    detail?: string;
} | {
    type: 'agent.state';
    state: AgentWorkbenchState;
    stateSequence?: number;
} | {
    type: 'agent.streamEvent';
    event: AgentStreamEvent;
} | {
    type: 'agent.messageRewind';
    prompt: string;
} | {
    type: 'agent.error';
    message: string;
} | {
    type: 'agent.done';
};
export type AgentWorkbenchPostMessage = (message: AgentWorkbenchMessage) => Thenable<boolean>;
export declare const N8N_AGENT_PROVIDER_SECRET_PREFIX = "n8n.agent.providerApiKey.";
export declare function getAgentProviderSecretKey(provider: string): string;
type CheckpointReason = 'manual' | 'auto' | 'before-tool' | 'after-tool' | 'before-compaction' | 'after-compaction';
export declare class AgentRuntimeController implements vscode.Disposable {
    private readonly _context;
    private readonly outputChannel;
    private readonly activeRuns;
    private readonly stoppedRuns;
    private readonly queuedPrompts;
    private cachedAgentHandle;
    private sessionRuntimePromise;
    private checkpointerPromise;
    private readonly workspaceSnapshots;
    constructor(_context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel);
    getWorkbenchState(input: Omit<AgentPromptInput, 'prompt'>): Promise<AgentWorkbenchState>;
    createSession(input: Omit<AgentPromptInput, 'prompt'>): Promise<AgentWorkbenchState>;
    getActiveWorktreePath(sessionId?: string): string | undefined;
    setActiveWorktreePath(worktreePath: string | undefined, sessionId?: string): Promise<void>;
    clearActiveWorktreePath(worktreePath: string): Promise<void>;
    private deleteActiveWorktreePathForSession;
    private readActiveWorktreePathsBySession;
    getLatestSessionId(): Promise<string | undefined>;
    getLatestSessionIdForWorkflow(workflow: AgentWorkflowContext): Promise<string | undefined>;
    attachSessionToWorkflowIfUnattached(sessionId: string | undefined, workflow: AgentWorkflowContext, input: Omit<AgentPromptInput, 'prompt'>): Promise<string | undefined>;
    createSessionForWorkflow(workflow: AgentWorkflowContext, input: Omit<AgentPromptInput, 'prompt'>): Promise<string>;
    selectSession(sessionId: string, input: Omit<AgentPromptInput, 'prompt'>): Promise<AgentWorkbenchState>;
    renameSession(sessionId: string, title: string, input: Omit<AgentPromptInput, 'prompt'>): Promise<AgentWorkbenchState>;
    deleteSession(sessionId: string, input: Omit<AgentPromptInput, 'prompt'>): Promise<AgentWorkbenchState>;
    attachSessionToCurrentWorkflow(sessionId: string, input: Omit<AgentPromptInput, 'prompt'>): Promise<AgentWorkbenchState>;
    detachSession(sessionId: string, input: Omit<AgentPromptInput, 'prompt'>): Promise<AgentWorkbenchState>;
    setWorkflowContext(sessionId: string, workflow: AgentWorkflowContext, input: Omit<AgentPromptInput, 'prompt'>): Promise<AgentWorkbenchState>;
    clearWorkflowContext(sessionId: string, input: Omit<AgentPromptInput, 'prompt'>): Promise<AgentWorkbenchState>;
    setNodeContexts(sessionId: string, nodes: AgentNodeContext[], input: Omit<AgentPromptInput, 'prompt'>): Promise<AgentWorkbenchState>;
    saveCheckpoint(sessionId: string, input: Omit<AgentPromptInput, 'prompt'>): Promise<AgentWorkbenchState>;
    rewindToUserMessage(sessionId: string, messageId: string, input: Omit<AgentPromptInput, 'prompt'>): Promise<{
        state: AgentWorkbenchState;
        prompt: string;
    }>;
    restoreCheckpoint(sessionId: string, checkpointId: string, input: Omit<AgentPromptInput, 'prompt'>): Promise<AgentWorkbenchState>;
    deleteCheckpoint(sessionId: string, checkpointId: string, input: Omit<AgentPromptInput, 'prompt'>): Promise<AgentWorkbenchState>;
    compactSession(sessionId: string, input: Omit<AgentPromptInput, 'prompt'>): Promise<AgentWorkbenchState>;
    sendPrompt(input: AgentPromptInput, postMessage: AgentWorkbenchPostMessage): Promise<AgentRunResult>;
    queuePrompt(input: AgentPromptInput, postMessage: AgentWorkbenchPostMessage, reason?: 'pending' | 'steer'): Promise<AgentRunResult>;
    stop(postMessage: AgentWorkbenchPostMessage, sessionId?: string): Promise<void>;
    dispose(): void;
    private runInitialAgentTurn;
    private isDeepAgentV3Run;
    private isAsyncIterable;
    private consumeDeepAgentV3Run;
    private consumeDeepAgentV3MessageProjection;
    private isToolMessageProjection;
    private consumeDeepAgentV3Message;
    private consumeDeepAgentV3MessageEvents;
    private consumeDeepAgentV3MessageReasoning;
    private consumeDeepAgentV3MessageText;
    private consumeDeepAgentV3MessageUsage;
    private consumeDeepAgentV3ProtocolProjection;
    private createToolOperationEvent;
    private emitCompactionFromToolOutput;
    private contextUsageEventFromUsage;
    private saveAutoCheckpointAfterFileModificationInBackground;
    private saveAutoCheckpointAfterFileModification;
    private truncateOperationDetail;
    private loadAgentProviderRegistry;
    private describeProviderRuntimeConfig;
    private getProviderRuntimeConfig;
    private getDeepAgentHandle;
    private createInvalidToolCallRecoveryMiddleware;
    private createProviderMessageCompatibilityMiddleware;
    private normalizeProviderMessage;
    private messageHasUnsupportedComplexContent;
    private cloneMessageWithTextContent;
    private extractProviderToolCalls;
    private extractRawProviderToolCalls;
    private extractProviderTextContent;
    private getProviderContentBlocks;
    private omitProviderToolCalls;
    private omitProviderOutputVersion;
    private countRecentInvalidToolCallRecoveryAttempts;
    private getMessageId;
    private buildInvalidToolCallRecoveryPrompt;
    private buildStaticSystemPrompt;
    private buildInvocationPrompt;
    private loadCompactedSessionContext;
    private formatNodeContexts;
    private getWorkspaceMemorySources;
    private getAgentMemorySources;
    private getWorkspaceSkillSources;
    private getAgentSkillSources;
    private directoryHasSkill;
    private loadWorkflowContext;
    private extractAgentText;
    private extractMessageTextFromOutput;
    private summarizeAgentOutput;
    private readMessageEventIndex;
    private extractContentBlockText;
    private extractContentBlockReasoning;
    private isToolContentBlock;
    private messageHasToolCalls;
    private extractAssistantTextFromAgentOutput;
    private extractAssistantMessageText;
    private isInternalRecoveryText;
    private extractProviderOutputItemsText;
    private extractProviderOutputItemText;
    private buildInvalidToolCallRepairPrompt;
    private extractInvalidToolCallsFromAgentOutput;
    private extractInvalidToolCallsFromMessage;
    private isAssistantMessage;
    private getMessageType;
    private extractMessageTextContent;
    private sanitizeAssistantText;
    private buildProviderStatusLine;
    private hasProviderEnvironmentSecret;
    private buildScaffoldResponse;
    private throwIfAborted;
    private raceAbort;
    private getSessionRuntime;
    private flushSessionWrites;
    private getSessionScope;
    private getInputWorkflowContext;
    private getUnattachedSessionScope;
    private getDefaultSessionTitle;
    private deriveSessionTitle;
    private listSessionSummaries;
    private buildSessionState;
    private withWorkflowContext;
    private getLatestWorkflowContext;
    private workflowContextsMatch;
    private getLatestNodeContexts;
    private normalizeNodeContexts;
    private inferWorkflowContextFromWorkspace;
    private inferWorkflowContextFromWrittenFiles;
    private extractWorkflowFilePathFromOperation;
    private listWorkflowSourceCandidates;
    private collectWorkflowSourceCandidates;
    private readWorkflowContextFromTypeScriptFile;
    private extractWorkflowDecoratorMetadata;
    private extractStringProperty;
    private getEntryText;
    private readSessionEntries;
    private writeSessionEntries;
    private normalizeEntries;
    private isNoiseOperation;
    private applyStreamEvent;
    private finalizePendingOperations;
    private consolidateFinalAssistant;
    private findLastUserMessageIndex;
    private findLastAssistantBodyIndex;
    private findMatchingPendingOperationIndex;
    private normalizeOperationKind;
    private createSystemNotice;
    private appendRunStoppedNotice;
    private withoutContextUsage;
    private buildCheckpointSurfacePayload;
    private buildCheckpointSummary;
    private saveWorkbenchCheckpoint;
    private saveBeforeUserMessageCheckpoint;
    private maybeSaveWorkbenchCheckpoint;
    private withLegacyCheckpointPayload;
    private extractCheckpointPayloads;
    private isWorkbenchSurfacePayload;
    private isRecord;
    private toCompactionSummary;
    private numberOrZero;
    private optionalNumber;
    private createLangChainModel;
    private getDefaultModelForProvider;
    private createPersistentCheckpointer;
    private buildAgentBackendEnv;
    private createStreamAccumulator;
    private shouldShowToolOperation;
    private categorizeTool;
    private formatToolLabel;
    private extractCommandFromToolPayload;
    private extractFilePathFromToolPayload;
    private extractTodoSummary;
    private extractTodosFromPayload;
    private stringifyToolOutput;
    private extractToolMessageContent;
    private stringifyToolPayload;
    private extractCompactionSummary;
    private summarizeSessionForCompaction;
    private ensureAgentHandleWithCheckpoint;
    private resolveContextWindow;
    private isCompactionState;
}
export {};
//# sourceMappingURL=agent-runtime-controller.d.ts.map