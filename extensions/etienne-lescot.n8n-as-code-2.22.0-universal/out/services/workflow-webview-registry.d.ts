export interface WorkflowWebviewReloadTarget {
    getWorkflowId(): string | undefined;
    reloadWorkflow(): Thenable<boolean> | Promise<boolean> | boolean;
    describeTarget?(): string;
}
export declare class WorkflowWebviewRegistry {
    private readonly targets;
    private debugLogger;
    setDebugLogger(logger: ((message: string) => void) | undefined): void;
    register(target: WorkflowWebviewReloadTarget): {
        dispose(): void;
    };
    reloadIfMatching(workflowId: string): boolean;
}
export declare const workflowWebviewRegistry: WorkflowWebviewRegistry;
//# sourceMappingURL=workflow-webview-registry.d.ts.map