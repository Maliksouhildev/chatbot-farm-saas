import * as vscode from 'vscode';
import { IWorkflowStatus } from 'n8nac';
export { buildWebviewHtml } from './webview-html.js';
export declare class WorkflowWebview {
    static currentPanel: WorkflowWebview | undefined;
    private readonly _panel;
    private _workflowId;
    private _disposables;
    private _registryDisposable;
    private _onClipboardPasteRequest;
    private constructor();
    /**
     * Register a callback for when the iframe requests paste data.
     * The callback receives the panel and the one-time grant token so it can
     * send clipboard data back, and the token is validated on the webview side.
     */
    static onClipboardPasteRequest(handler: (panel: vscode.WebviewPanel, grantToken: string) => Promise<void>): void;
    static createOrShow(workflow: IWorkflowStatus, url: string, viewColumn?: vscode.ViewColumn): void;
    /**
     * Trigger a reload of the webview if the workflowId matches the one currently displayed.
     */
    static reloadIfMatching(workflowId: string, _outputChannel?: vscode.OutputChannel): boolean;
    update(workflowId: string, url: string): void;
    dispose(): void;
    private getHtmlForWebview;
}
//# sourceMappingURL=workflow-webview.d.ts.map