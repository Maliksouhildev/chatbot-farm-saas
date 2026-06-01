import { BaseTreeItem } from './base-tree-item.js';
import { TreeItemType } from '../../types.js';
/**
 * Tree item showing loading state
 */
export declare class LoadingItem extends BaseTreeItem {
    message: string;
    readonly type = TreeItemType.LOADING;
    constructor(message?: string);
    updateState(state: any): void;
}
//# sourceMappingURL=loading-item.d.ts.map