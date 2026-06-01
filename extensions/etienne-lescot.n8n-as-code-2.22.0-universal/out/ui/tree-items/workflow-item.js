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
exports.WorkflowItem = void 0;
const vscode = __importStar(require("vscode"));
const n8nac_1 = require("n8nac");
const base_tree_item_js_1 = require("./base-tree-item.js");
const types_js_1 = require("../../types.js");
const action_item_js_1 = require("./action-item.js");
/**
 * Tree item representing a single workflow.
 *
 * Design principles for actions:
 * - BOARD: requires workflow.id (remote existence). LOCAL-ONLY workflows cannot open in n8n UI.
 * - PULL: requires workflow.id (remote existence). LOCAL-ONLY workflows have nothing to pull.
 * - PUSH: requires workflow.filename (local existence). REMOTE-ONLY workflows have no local file.
 * - Archived workflows: READ-ONLY, only BOARD and PULL allowed.
 */
class WorkflowItem extends base_tree_item_js_1.BaseTreeItem {
    workflow;
    pendingAction;
    type = types_js_1.TreeItemType.WORKFLOW;
    constructor(workflow, pendingAction) {
        // Determine if this item should be collapsible (for conflicts and deletions)
        const shouldBeCollapsible = pendingAction === 'conflict' ||
            workflow.status === n8nac_1.WorkflowSyncStatus.CONFLICT;
        super(workflow.name, shouldBeCollapsible ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None);
        this.workflow = workflow;
        this.pendingAction = pendingAction;
        this.contextValue = this.getContextValueForStatus(workflow.status, workflow.isArchived ?? false, pendingAction);
        this.tooltip = workflow.name;
        // Only show status description when something requires attention
        if (pendingAction === 'conflict' || workflow.status === n8nac_1.WorkflowSyncStatus.CONFLICT) {
            this.description = '(conflict)';
        }
        else if (workflow.isArchived) {
            // Archived workflows cannot be activated, so show archived instead of active/inactive
            this.description = '(archived)';
        }
        else if (workflow.status === n8nac_1.WorkflowSyncStatus.EXIST_ONLY_REMOTELY || workflow.status === n8nac_1.WorkflowSyncStatus.TRACKED) {
            // Show active/inactive for cloud-only and synced workflows
            this.description = workflow.active ? '(active)' : '(inactive)';
        }
        else {
            this.description = undefined;
        }
        this.iconPath = this.getIcon(workflow.status, pendingAction);
        // Set resource URI for file decorations
        this.resourceUri = this.createResourceUri(workflow.id, workflow.status, pendingAction);
        // Default click behavior:
        // - Archived workflows: NO command (clicking does nothing - they're read-only)
        // - Conflicts: open diff
        // - Otherwise: open JSON for workflows with local files
        if (pendingAction === 'conflict' || workflow.status === n8nac_1.WorkflowSyncStatus.CONFLICT) {
            this.command = {
                command: 'n8n.resolveConflict',
                title: 'Show Diff',
                arguments: [{ workflow, choice: 'Show Diff' }]
            };
        }
        else if (!workflow.isArchived && workflow.status !== n8nac_1.WorkflowSyncStatus.EXIST_ONLY_REMOTELY) {
            // Non-archived workflows with local files can be opened
            this.command = {
                command: 'n8n.openJson',
                title: 'Open JSON',
                arguments: [workflow]
            };
        }
        // For archived workflows and remote-only workflows, no default command is set
    }
    /**
     * Get available actions for this workflow based on its state.
     * Returns action types that should be available for this workflow.
     *
     * SSOT table:
     * - TRACKED: BOARD, OPEN, PULL, PUSH (all available)
     * - TRACKED archived: BOARD, PULL (OPEN, PUSH disabled - local file is read-only)
     * - EXIST_ONLY_LOCALLY: OPEN, PUSH (BOARD, PULL disabled - no remote)
     * - EXIST_ONLY_LOCALLY archived: OPEN (all others disabled - no remote)
     * - EXIST_ONLY_REMOTELY: BOARD, PULL (OPEN, PUSH disabled - no local)
     * - EXIST_ONLY_REMOTELY archived: BOARD, PULL (OPEN, PUSH disabled)
     * - CONFLICT: SHOW_DIFF, FORCE_PUSH, PULL_REMOTE
     */
    getAvailableActions() {
        const { status } = this.workflow;
        const isArchived = this.workflow.isArchived ?? false;
        // Conflict state overrides everything
        if (status === n8nac_1.WorkflowSyncStatus.CONFLICT || this.pendingAction === 'conflict') {
            return [action_item_js_1.ActionItemType.SHOW_DIFF, action_item_js_1.ActionItemType.FORCE_PUSH, action_item_js_1.ActionItemType.PULL_REMOTE];
        }
        // Branch by sync status first
        switch (status) {
            case n8nac_1.WorkflowSyncStatus.EXIST_ONLY_LOCALLY:
                // Local-only: no remote, so no BOARD or PULL
                // Archived doesn't apply (no remote to archive from)
                return [action_item_js_1.ActionItemType.OPEN, action_item_js_1.ActionItemType.PUSH];
            case n8nac_1.WorkflowSyncStatus.EXIST_ONLY_REMOTELY:
                // Remote-only: no local file, so no OPEN or PUSH
                // BOARD and PULL always available (archived or not)
                return [action_item_js_1.ActionItemType.BOARD, action_item_js_1.ActionItemType.PULL];
            case n8nac_1.WorkflowSyncStatus.TRACKED:
                // Tracked: has both local and remote
                if (isArchived) {
                    // Archived workflows are read-only on remote side
                    // Local file exists but shouldn't be opened for editing since remote is archived
                    return [action_item_js_1.ActionItemType.BOARD, action_item_js_1.ActionItemType.PULL];
                }
                else {
                    // Normal tracked workflow: all actions available
                    return [action_item_js_1.ActionItemType.BOARD, action_item_js_1.ActionItemType.OPEN, action_item_js_1.ActionItemType.PULL, action_item_js_1.ActionItemType.PUSH];
                }
            default:
                return [];
        }
    }
    /**
     * Create a resource URI for file decorations
     */
    createResourceUri(id, status, pendingAction) {
        const params = new URLSearchParams();
        params.set('status', status);
        if (pendingAction) {
            params.set('pendingAction', pendingAction);
        }
        return vscode.Uri.parse(`n8n-workflow://${id}?${params.toString()}`);
    }
    setContextValue(value) {
        this.contextValue = value;
    }
    /**
     * Returns a contextValue string used by package.json `when` clauses for inline/context menus.
     *
     * Values:
     * - workflow-tracked         : TRACKED (both local and remote, not archived)
     * - workflow-tracked-archived: TRACKED, archived on remote → read-only
     * - workflow-local-only      : EXIST_ONLY_LOCALLY (new, not yet pushed)
     * - workflow-cloud-only      : EXIST_ONLY_REMOTELY (not yet pulled)
     * - workflow-conflict        : CONFLICT
     */
    getContextValueForStatus(status, isArchived, pendingAction) {
        if (pendingAction === 'conflict' || status === n8nac_1.WorkflowSyncStatus.CONFLICT)
            return 'workflow-conflict';
        switch (status) {
            case n8nac_1.WorkflowSyncStatus.EXIST_ONLY_REMOTELY:
                return 'workflow-cloud-only';
            case n8nac_1.WorkflowSyncStatus.EXIST_ONLY_LOCALLY:
                return 'workflow-local-only';
            default:
                // TRACKED: workflow known on both sides
                return isArchived ? 'workflow-tracked-archived' : 'workflow-tracked';
        }
    }
    getIcon(status, pendingAction) {
        if (pendingAction === 'conflict')
            return new vscode.ThemeIcon('alert', new vscode.ThemeColor('charts.red'));
        switch (status) {
            case n8nac_1.WorkflowSyncStatus.CONFLICT:
                return new vscode.ThemeIcon('alert', new vscode.ThemeColor('charts.red'));
            case n8nac_1.WorkflowSyncStatus.EXIST_ONLY_REMOTELY:
                // Remote-only: cloud icon (like a remote git branch not yet checked out)
                return new vscode.ThemeIcon('cloud', new vscode.ThemeColor('charts.blue'));
            case n8nac_1.WorkflowSyncStatus.EXIST_ONLY_LOCALLY:
                return new vscode.ThemeIcon('file-add', new vscode.ThemeColor('charts.orange'));
            default:
                // TRACKED: plain file icon, no color noise
                return new vscode.ThemeIcon('file');
        }
    }
    getContextValue() {
        return this.contextValue || 'workflow';
    }
    updateState(_state) {
        // Workflow items don't need dynamic updates for now
    }
}
exports.WorkflowItem = WorkflowItem;
//# sourceMappingURL=workflow-item.js.map