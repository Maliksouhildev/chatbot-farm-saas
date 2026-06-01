import { BaseTreeItem } from './base-tree-item.js';
import { TreeItemType } from '../../types.js';
/**
 * Tree item showing error state with retry option
 */
export declare class ErrorItem extends BaseTreeItem {
    errorMessage: string;
    canRetry: boolean;
    readonly type = TreeItemType.ERROR;
    constructor(errorMessage: string, canRetry?: boolean);
    private getTooltip;
    updateState(state: any): void;
}
//# sourceMappingURL=error-item.d.ts.map