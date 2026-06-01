import * as vscode from 'vscode';
import type { N8nConfigurationController } from '../services/n8n-configuration-controller.js';
export declare class ConfigurationWebview {
    static currentPanel: ConfigurationWebview | undefined;
    private readonly _panel;
    private readonly _context;
    private readonly _configurationController;
    private readonly _providerService;
    private readonly _disposables;
    private _stateVersion;
    private _initialTab;
    private readonly _managedSetupJobs;
    private readonly _managedSetupJobCleanupTimers;
    private _queuedPinEnvironmentId;
    private _pinEnvironmentTask;
    private constructor();
    static createOrShow(context: vscode.ExtensionContext, configurationController: N8nConfigurationController, initialTab?: string): void;
    private handleMessage;
    private notifySaved;
    private queuePinEnvironment;
    private drainPinEnvironmentQueue;
    private migrateWorkspaceConfiguration;
    private ensureEmbeddedWorkspaceTarget;
    private saveGlobalInstance;
    private hasActiveManagedSetup;
    private createManagedInstance;
    private runManagedSetupJob;
    private postSetupJob;
    private scheduleManagedSetupJobCleanup;
    private serializeSetupJob;
    private postInitialState;
    private getHtmlForWebview;
    private getWebviewOptions;
    private static getWebviewOptions;
}
//# sourceMappingURL=configuration-webview.d.ts.map