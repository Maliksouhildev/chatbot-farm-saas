import * as vscode from 'vscode';
import { TreeItemType } from '../../types.js';
/**
 * Base class for all tree items in the enhanced workflow tree provider
 */
export declare abstract class BaseTreeItem extends vscode.TreeItem {
    abstract readonly type: TreeItemType;
    constructor(label: string, collapsibleState?: vscode.TreeItemCollapsibleState);
    /**
     * Get the context value for this item (used for when clauses in package.json)
     */
    getContextValue(): string;
    /**
     * Update the item based on current state
     */
    updateState(_state: any): void;
}
//# sourceMappingURL=base-tree-item.d.ts.map