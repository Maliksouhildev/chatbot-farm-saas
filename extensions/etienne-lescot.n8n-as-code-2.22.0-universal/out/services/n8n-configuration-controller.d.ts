import * as vscode from 'vscode';
import { createN8nManagerFacade } from '@n8n-as-code/manager-adapter';
import { type IWorkspaceConfig, type IWorkspaceMigrationReport } from 'n8nac';
type N8nManagerFacade = ReturnType<typeof createN8nManagerFacade>;
type N8nGlobalConfig = Awaited<ReturnType<N8nManagerFacade['getGlobalConfig']>>;
type N8nWorkspaceOverrides = Awaited<ReturnType<N8nManagerFacade['readWorkspaceOverrides']>>;
type WorkspaceSnapshotConfig = IWorkspaceConfig | N8nWorkspaceOverrides;
type PreparedN8nContext = Awaited<ReturnType<N8nManagerFacade['prepareEffectiveContext']>>;
type EffectiveN8nContext = PreparedN8nContext['context'];
type SanitizedEffectiveN8nContext = Omit<EffectiveN8nContext, 'apiKey'> & {
    apiKey?: undefined;
    apiKeyAvailable?: boolean;
};
export interface N8nConfigurationSnapshot {
    workspaceRoot?: string;
    global: N8nGlobalConfig;
    workspace: WorkspaceSnapshotConfig;
    effective?: SanitizedEffectiveN8nContext;
    runtime?: PreparedN8nContext['runtime'];
    diagnostics?: PreparedN8nContext['diagnostics'];
    hasWorkspaceConfig: boolean;
    hasValidConnection: boolean;
    signature: string;
    runtimeSignature: string;
    error?: string;
    migration?: IWorkspaceMigrationReport;
}
export interface N8nConfigurationChangeEvent {
    snapshot: N8nConfigurationSnapshot;
    previous?: N8nConfigurationSnapshot;
    reason: string;
}
export declare class N8nConfigurationController implements vscode.Disposable {
    private readonly outputChannel?;
    private readonly onDidChangeEmitter;
    readonly onDidChangeSnapshot: vscode.Event<N8nConfigurationChangeEvent>;
    private readonly disposables;
    private readonly watcherDisposables;
    private refreshTimer?;
    private snapshot?;
    constructor(outputChannel?: vscode.OutputChannel | undefined);
    start(): void;
    getSnapshot(): N8nConfigurationSnapshot | undefined;
    refresh(reason?: string, options?: {
        force?: boolean;
    }): Promise<N8nConfigurationSnapshot>;
    scheduleRefresh(reason?: string): void;
    dispose(): void;
    private readSnapshot;
    private buildSnapshot;
    private readWorkspaceSnapshotConfig;
    private sanitizeEffectiveContext;
    private rebuildWatchers;
    private watchManagerConfigFiles;
    private watchWorkspaceConfigFile;
    private watchFile;
    private disposeWatchers;
}
export {};
//# sourceMappingURL=n8n-configuration-controller.d.ts.map