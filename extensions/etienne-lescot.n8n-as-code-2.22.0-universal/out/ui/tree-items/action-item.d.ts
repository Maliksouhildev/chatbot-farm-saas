import { BaseTreeItem } from './base-tree-item.js';
import { TreeItemType } from '../../types.js';
/**
 * Action item types for child actions under workflows
 */
export declare enum ActionItemType {
    SHOW_DIFF = "show-diff",
    FORCE_PUSH = "force-push",
    PULL_REMOTE = "pull-remote",
    BOARD = "board",// Open workflow in n8n UI (requires remote id)
    PULL = "pull",// Pull from remote to local (requires remote id)
    PUSH = "push",// Push from local to remote (requires local file)
    OPEN = "open"
}
/**
 * Tree item representing an action that can be taken on a workflow
 * Used as child items for workflows in CONFLICT or DELETED states
 */
export declare class ActionItem extends BaseTreeItem {
    readonly actionType: ActionItemType;
    readonly workflowId: string;
    readonly workflow: any;
    readonly type = TreeItemType.INFO;
    constructor(actionType: ActionItemType, workflowId: string, workflow: any);
    private static getLabelForAction;
    private static getIconForAction;
    private static getCommandForAction;
    private static getTooltipForAction;
    static isEnabledForArchived(actionType: ActionItemType): boolean;
    static isLocalOnlyAction(actionType: ActionItemType): boolean;
    getContextValue(): string;
    updateState(_state: any): void;
}
//# sourceMappingURL=action-item.d.ts.map