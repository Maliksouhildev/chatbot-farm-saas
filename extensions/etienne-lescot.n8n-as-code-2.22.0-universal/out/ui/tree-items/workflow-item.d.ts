import { IWorkflowStatus } from 'n8nac';
import { BaseTreeItem } from './base-tree-item.js';
import { TreeItemType } from '../../types.js';
import { ActionItemType } from './action-item.js';
/**
 * Tree item representing a single workflow.
 *
 * Design principles for actions:
 * - BOARD: requires workflow.id (remote existence). LOCAL-ONLY workflows cannot open in n8n UI.
 * - PULL: requires workflow.id (remote existence). LOCAL-ONLY workflows have nothing to pull.
 * - PUSH: requires workflow.filename (local existence). REMOTE-ONLY workflows have no local file.
 * - Archived workflows: READ-ONLY, only BOARD and PULL allowed.
 */
export declare class WorkflowItem extends BaseTreeItem {
    readonly workflow: IWorkflowStatus;
    readonly pendingAction?: "conflict" | undefined;
    readonly type = TreeItemType.WORKFLOW;
    constructor(workflow: IWorkflowStatus, pendingAction?: "conflict" | undefined);
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
    getAvailableActions(): ActionItemType[];
    /**
     * Create a resource URI for file decorations
     */
    private createResourceUri;
    setContextValue(value: string): void;
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
    private getContextValueForStatus;
    private getIcon;
    getContextValue(): string;
    updateState(_state: any): void;
}
//# sourceMappingURL=workflow-item.d.ts.map