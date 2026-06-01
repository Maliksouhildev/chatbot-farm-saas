import * as vscode from 'vscode';
export declare class AgentManagerWebview {
    static currentPanel: AgentManagerWebview | undefined;
    private readonly _panel;
    private readonly _context;
    private readonly _disposables;
    private constructor();
    static createOrShow(context: vscode.ExtensionContext): void;
    dispose(): void;
    private render;
    private handleMessage;
}
//# sourceMappingURL=agent-manager-webview.d.ts.map