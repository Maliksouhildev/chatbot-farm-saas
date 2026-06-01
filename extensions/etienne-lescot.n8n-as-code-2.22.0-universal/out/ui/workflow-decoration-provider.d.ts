import * as vscode from 'vscode';
/**
 * Provides file decorations for workflow items in the tree view
 * This adds visual colorization and text decorations based on workflow status
 */
export declare class WorkflowDecorationProvider implements vscode.FileDecorationProvider {
    private _onDidChangeFileDecorations;
    readonly onDidChangeFileDecorations: vscode.Event<vscode.Uri | vscode.Uri[] | undefined>;
    /**
     * Trigger a refresh of all decorations
     */
    refresh(): void;
    /**
     * Provide decoration for a given URI
     * URIs are in the format: n8n-workflow://<workflowId>?status=<status>&pendingAction=<action>
     */
    provideFileDecoration(uri: vscode.Uri): vscode.ProviderResult<vscode.FileDecoration>;
    dispose(): void;
}
//# sourceMappingURL=workflow-decoration-provider.d.ts.map