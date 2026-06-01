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
exports.ActionItem = exports.ActionItemType = void 0;
const vscode = __importStar(require("vscode"));
const base_tree_item_js_1 = require("./base-tree-item.js");
const types_js_1 = require("../../types.js");
/**
 * Action item types for child actions under workflows
 */
var ActionItemType;
(function (ActionItemType) {
    // Conflict resolution actions (OCC)
    ActionItemType["SHOW_DIFF"] = "show-diff";
    ActionItemType["FORCE_PUSH"] = "force-push";
    ActionItemType["PULL_REMOTE"] = "pull-remote";
    // Standard workflow actions
    ActionItemType["BOARD"] = "board";
    ActionItemType["PULL"] = "pull";
    ActionItemType["PUSH"] = "push";
    ActionItemType["OPEN"] = "open";
})(ActionItemType || (exports.ActionItemType = ActionItemType = {}));
/**
 * Tree item representing an action that can be taken on a workflow
 * Used as child items for workflows in CONFLICT or DELETED states
 */
class ActionItem extends base_tree_item_js_1.BaseTreeItem {
    actionType;
    workflowId;
    workflow;
    type = types_js_1.TreeItemType.INFO; // Use INFO type for action items
    constructor(actionType, workflowId, workflow) {
        super(ActionItem.getLabelForAction(actionType), vscode.TreeItemCollapsibleState.None);
        this.actionType = actionType;
        this.workflowId = workflowId;
        this.workflow = workflow;
        this.iconPath = ActionItem.getIconForAction(actionType);
        this.contextValue = `action-${actionType}`;
        this.command = ActionItem.getCommandForAction(actionType, workflow);
        this.tooltip = ActionItem.getTooltipForAction(actionType);
    }
    static getLabelForAction(actionType) {
        switch (actionType) {
            case ActionItemType.SHOW_DIFF:
                return '📄 Show Diff';
            case ActionItemType.FORCE_PUSH:
                return '⬆️ Keep Current (local)';
            case ActionItemType.PULL_REMOTE:
                return '⬇️ Keep Incoming (remote)';
            case ActionItemType.BOARD:
                return '🌐 Board';
            case ActionItemType.PULL:
                return '⬇️ Pull';
            case ActionItemType.PUSH:
                return '⬆️ Push';
            case ActionItemType.OPEN:
                return '📝 Open';
            default:
                return 'Unknown Action';
        }
    }
    static getIconForAction(actionType) {
        switch (actionType) {
            case ActionItemType.SHOW_DIFF:
                return new vscode.ThemeIcon('git-compare');
            case ActionItemType.FORCE_PUSH:
            case ActionItemType.PUSH:
                return new vscode.ThemeIcon('cloud-upload');
            case ActionItemType.PULL_REMOTE:
            case ActionItemType.PULL:
                return new vscode.ThemeIcon('cloud-download');
            case ActionItemType.BOARD:
                return new vscode.ThemeIcon('globe');
            case ActionItemType.OPEN:
                return new vscode.ThemeIcon('go-to-file');
            default:
                return new vscode.ThemeIcon('question');
        }
    }
    static getCommandForAction(actionType, workflow) {
        switch (actionType) {
            case ActionItemType.SHOW_DIFF:
                return {
                    command: 'n8n.resolveConflict',
                    title: 'Show Diff',
                    arguments: [{ workflow, choice: 'Show Diff' }]
                };
            case ActionItemType.FORCE_PUSH:
                return {
                    command: 'n8n.resolveConflict',
                    title: 'Keep Current (local)',
                    arguments: [{ workflow, choice: 'Keep Current (local)' }]
                };
            case ActionItemType.PULL_REMOTE:
                return {
                    command: 'n8n.resolveConflict',
                    title: 'Keep Incoming (remote)',
                    arguments: [{ workflow, choice: 'Keep Incoming (remote)' }]
                };
            case ActionItemType.BOARD:
                return {
                    command: 'n8n.openBoard',
                    title: 'Open Board',
                    arguments: [workflow]
                };
            case ActionItemType.PULL:
                return {
                    command: 'n8n.pullWorkflow',
                    title: 'Pull',
                    arguments: [workflow]
                };
            case ActionItemType.PUSH:
                return {
                    command: 'n8n.pushWorkflow',
                    title: 'Push',
                    arguments: [workflow]
                };
            case ActionItemType.OPEN:
                return {
                    command: 'n8n.openJson',
                    title: 'Open',
                    arguments: [workflow]
                };
            default:
                return undefined;
        }
    }
    static getTooltipForAction(actionType) {
        switch (actionType) {
            case ActionItemType.SHOW_DIFF:
                return 'Open a diff view comparing local and remote versions';
            case ActionItemType.FORCE_PUSH:
                return 'Keep your current local version — push it to n8n';
            case ActionItemType.PULL_REMOTE:
                return 'Keep the incoming remote version — overwrite local file';
            case ActionItemType.BOARD:
                return 'Open workflow in n8n web UI';
            case ActionItemType.PULL:
                return 'Pull latest from n8n to local file';
            case ActionItemType.PUSH:
                return 'Push local changes to n8n';
            case ActionItemType.OPEN:
                return 'Open local file in editor';
            default:
                return '';
        }
    }
    // Enabled/disabled state for actions
    static isEnabledForArchived(actionType) {
        // Only PULL and BOARD are allowed for archived workflows
        return actionType === ActionItemType.PULL || actionType === ActionItemType.BOARD;
    }
    static isLocalOnlyAction(actionType) {
        // BOARD requires a remote workflow (has id)
        return false; // BOARD is allowed for all, PULL/PUSH have their own logic
    }
    getContextValue() {
        return this.contextValue || 'action-item';
    }
    updateState(_state) {
        // Action items are static
    }
}
exports.ActionItem = ActionItem;
//# sourceMappingURL=action-item.js.map