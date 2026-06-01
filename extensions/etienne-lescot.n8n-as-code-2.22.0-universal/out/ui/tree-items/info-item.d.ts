import * as vscode from 'vscode';
import { BaseTreeItem } from './base-tree-item.js';
import { TreeItemType } from '../../types.js';
/**
 * Simple info message tree item (non-interactive)
 */
export declare class InfoItem extends BaseTreeItem {
    readonly type = TreeItemType.INFO;
    constructor(label: string, description?: string, icon?: vscode.ThemeIcon);
    getContextValue(): string;
    updateState(_state: any): void;
}
//# sourceMappingURL=info-item.d.ts.map