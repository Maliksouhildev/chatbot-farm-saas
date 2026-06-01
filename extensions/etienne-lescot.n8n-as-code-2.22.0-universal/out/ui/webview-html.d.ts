/**
 * Pure function that generates the parent-webview HTML for a given workflow.
 *
 * Lives in a separate module so it can be unit-tested without importing vscode.
 * WorkflowWebview delegates to this function internally.
 *
 * Security model for the clipboard bridge:
 *   - No static secret (nonce) is embedded here or in the injected bridge
 *     script that runs inside the n8n iframe.  Any constant reachable by
 *     iframe JavaScript could be read and replayed by hostile scripts.
 *   - Origin validation, per-request one-time grant tokens, and rate-limiting
 *     are all enforced in the parent-webview JavaScript (this file), which is
 *     extension-controlled and inaccessible to iframe code.
 */
export declare const WORKFLOW_WEBVIEW_RELOAD_MESSAGE = "n8nac.workflow.reload";
export declare function buildWebviewHtml(workflowId: string, url: string): string;
//# sourceMappingURL=webview-html.d.ts.map