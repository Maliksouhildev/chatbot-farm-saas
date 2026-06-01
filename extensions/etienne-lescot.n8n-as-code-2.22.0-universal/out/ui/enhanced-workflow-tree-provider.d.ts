import * as vscode from 'vscode';
import { Store } from '@reduxjs/toolkit';
import { IWorkflowStatus, SyncManager } from 'n8nac';
import { ExtensionState } from '../types.js';
import { RootState } from '../services/workflow-store.js';
import { BaseTreeItem } from './tree-items/base-tree-item.js';
import { WorkflowItem } from './tree-items/workflow-item.js';
/**
 * Enhanced tree provider that handles multiple extension states
 */
export declare class EnhancedWorkflowTreeProvider implements vscode.TreeDataProvider<BaseTreeItem> {
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<BaseTreeItem | undefined | null | void>;
    private syncManager;
    private extensionState;
    private initializationError;
    private cachedTreeItems;
    private cacheInvalidationTime;
    private refreshTimeout;
    private storeUnsubscribe?;
    constructor();
    /**
     * Subscribe to Redux store
     */
    subscribeToStore(reduxStore: Store<RootState>): void;
    /**
     * Get the current extension state
     */
    getExtensionState(): ExtensionState;
    /**
     * Set the current extension state
     */
    setExtensionState(state: ExtensionState, error?: string): void;
    /**
     * Set the sync manager (when initialized)
     */
    setSyncManager(manager: SyncManager | undefined): void;
    /**
     * Refresh the tree view with debouncing and cache invalidation
     */
    refresh(): void;
    /**
     * Invalidate cache (call when data changes)
     */
    invalidateCache(): void;
    /**
     * Check if cache is valid (less than 1 second old)
     */
    private isCacheValid;
    /**
     * Get tree item for element
     */
    getTreeItem(element: BaseTreeItem): vscode.TreeItem;
    /**
     * Get children for element (or root if no element)
     */
    getChildren(element?: BaseTreeItem): Promise<BaseTreeItem[]>;
    /**
     * Get action items for a workflow based on its state.
     * This is the SSOT for determining which actions are available.
     *
     * Rules:
     * - Conflicts: SHOW_DIFF, FORCE_PUSH, PULL_REMOTE
     * - TRACKED archived: BOARD, PULL only (OPEN, PUSH disabled - local file is read-only)
     * - EXIST_ONLY_LOCALLY: OPEN, PUSH only (BOARD, PULL disabled - no remote)
     * - EXIST_ONLY_LOCALLY archived: OPEN only (all others disabled - no remote)
     * - EXIST_ONLY_REMOTELY: BOARD, PULL only (OPEN, PUSH disabled - no local)
     * - EXIST_ONLY_REMOTELY archived: BOARD, PULL only (OPEN, PUSH disabled)
     * - Non-archived TRACKED: all actions available
     */
    private getWorkflowActionItems;
    private getInitializingItems;
    private getMigrationItems;
    private getUninitializedItems;
    private getConfiguringItems;
    private getSettingsChangedItems;
    private createConfigureItem;
    private getInitializedItems;
    private getErrorItems;
    getParent(_element: BaseTreeItem): vscode.ProviderResult<BaseTreeItem>;
    resolveTreeItem(_item: BaseTreeItem, element: BaseTreeItem, _token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem>;
    getWorkflowItem(workflow: IWorkflowStatus): Promise<WorkflowItem | undefined>;
    /**
     * Get conflict data for a workflow (helper for hooks)
     */
    getConflict(id: string): any;
    dispose(): void;
}
//# sourceMappingURL=enhanced-workflow-tree-provider.d.ts.map