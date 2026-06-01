"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowWebview = exports.buildWebviewHtml = void 0;
const vscode = __importStar(require("vscode"));
const webview_html_js_1 = require("./webview-html.js");
const workflow_webview_registry_js_1 = require("../services/workflow-webview-registry.js");
var webview_html_js_2 = require("./webview-html.js");
Object.defineProperty(exports, "buildWebviewHtml", { enumerable: true, get: function () { return webview_html_js_2.buildWebviewHtml; } });
class WorkflowWebview {
    static currentPanel;
    _panel;
    _workflowId;
    _disposables = [];
    _registryDisposable;
    _onClipboardPasteRequest;
    constructor(panel, workflowId, url) {
        this._panel = panel;
        this._workflowId = workflowId;
        this._registryDisposable = workflow_webview_registry_js_1.workflowWebviewRegistry.register({
            getWorkflowId: () => this._workflowId,
            reloadWorkflow: () => this._panel.webview.postMessage({ type: webview_html_js_1.WORKFLOW_WEBVIEW_RELOAD_MESSAGE }),
        });
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this.getHtmlForWebview(workflowId, url);
        // Handle messages from the webview (clipboard bridge on macOS)
        this._panel.webview.onDidReceiveMessage(async (message) => {
            if (message.type === 'clipboard-write' && typeof message.text === 'string') {
                try {
                    await vscode.env.clipboard.writeText(message.text);
                }
                catch (e) {
                    console.error('[Webview] Clipboard write error', e);
                }
            }
            // The parent webview validates origin and issues one-time grant tokens;
            // here we only check that the message type is correct and grantToken is present.
            if (message.type === 'clipboard-paste-request' && typeof message.grantToken === 'string') {
                void this._onClipboardPasteRequest?.(this._panel, message.grantToken)
                    ?.catch(e => console.error('[Webview] Clipboard paste handler error', e));
            }
        }, null, this._disposables);
    }
    /**
     * Register a callback for when the iframe requests paste data.
     * The callback receives the panel and the one-time grant token so it can
     * send clipboard data back, and the token is validated on the webview side.
     */
    static onClipboardPasteRequest(handler) {
        if (WorkflowWebview.currentPanel) {
            WorkflowWebview.currentPanel._onClipboardPasteRequest = handler;
        }
    }
    static createOrShow(workflow, url, viewColumn) {
        const column = viewColumn || (vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined);
        // If we already have a panel, reuse it and refresh the HTML so that the
        // parent-webview script reflects the new URL/origin for origin validation.
        if (WorkflowWebview.currentPanel) {
            WorkflowWebview.currentPanel._panel.reveal(column);
            WorkflowWebview.currentPanel.update(workflow.id, url);
            return;
        }
        const panel = vscode.window.createWebviewPanel('n8nWorkflow', `n8n: ${workflow.name}`, column || vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true, // Keep webview state when hidden
            localResourceRoots: [] // Security: No local file access needed
        });
        WorkflowWebview.currentPanel = new WorkflowWebview(panel, workflow.id, url);
    }
    /**
     * Trigger a reload of the webview if the workflowId matches the one currently displayed.
     */
    static reloadIfMatching(workflowId, _outputChannel) {
        return workflow_webview_registry_js_1.workflowWebviewRegistry.reloadIfMatching(workflowId);
    }
    update(workflowId, url) {
        this._workflowId = workflowId;
        this._panel.title = `n8n: ${workflowId}`;
        this._panel.webview.html = this.getHtmlForWebview(workflowId, url);
    }
    dispose() {
        if (WorkflowWebview.currentPanel === this) {
            WorkflowWebview.currentPanel = undefined;
        }
        this._registryDisposable?.dispose();
        this._registryDisposable = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x)
                x.dispose();
        }
    }
    getHtmlForWebview(workflowId, url) {
        return (0, webview_html_js_1.buildWebviewHtml)(workflowId, url);
    }
}
exports.WorkflowWebview = WorkflowWebview;
//# sourceMappingURL=workflow-webview.js.map