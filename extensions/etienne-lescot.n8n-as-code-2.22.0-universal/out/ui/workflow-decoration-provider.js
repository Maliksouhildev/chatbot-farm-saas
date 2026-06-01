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
exports.WorkflowDecorationProvider = void 0;
const vscode = __importStar(require("vscode"));
const n8nac_1 = require("n8nac");
/**
 * Provides file decorations for workflow items in the tree view
 * This adds visual colorization and text decorations based on workflow status
 */
class WorkflowDecorationProvider {
    _onDidChangeFileDecorations = new vscode.EventEmitter();
    onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;
    /**
     * Trigger a refresh of all decorations
     */
    refresh() {
        this._onDidChangeFileDecorations.fire(undefined);
    }
    /**
     * Provide decoration for a given URI
     * URIs are in the format: n8n-workflow://<workflowId>?status=<status>&pendingAction=<action>
     */
    provideFileDecoration(uri) {
        if (uri.scheme !== 'n8n-workflow') {
            return undefined;
        }
        const params = new URLSearchParams(uri.query);
        const status = params.get('status');
        const pendingAction = params.get('pendingAction');
        // Handle pending actions first (highest priority)
        if (pendingAction === 'delete') {
            return {
                color: new vscode.ThemeColor('gitDecoration.deletedResourceForeground'),
                tooltip: 'Pending Deletion'
            };
        }
        if (pendingAction === 'conflict' || status === n8nac_1.WorkflowSyncStatus.CONFLICT) {
            return {
                color: new vscode.ThemeColor('errorForeground'),
                tooltip: 'Conflict - Resolve Required'
            };
        }
        // Handle status-based decorations
        switch (status) {
            case n8nac_1.WorkflowSyncStatus.TRACKED:
                return {
                    color: new vscode.ThemeColor('gitDecoration.untrackedResourceForeground'),
                    tooltip: 'Tracked'
                };
            case n8nac_1.WorkflowSyncStatus.EXIST_ONLY_REMOTELY:
                return {
                    color: new vscode.ThemeColor('gitDecoration.deletedResourceForeground'),
                    tooltip: 'Remote Only'
                };
            case n8nac_1.WorkflowSyncStatus.EXIST_ONLY_LOCALLY:
                return {
                    color: new vscode.ThemeColor('gitDecoration.addedResourceForeground'),
                    tooltip: 'Local Only'
                };
            default:
                return undefined;
        }
    }
    dispose() {
        this._onDidChangeFileDecorations.dispose();
    }
}
exports.WorkflowDecorationProvider = WorkflowDecorationProvider;
//# sourceMappingURL=workflow-decoration-provider.js.map