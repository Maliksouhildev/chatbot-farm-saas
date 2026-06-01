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
exports.BaseTreeItem = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Base class for all tree items in the enhanced workflow tree provider
 */
class BaseTreeItem extends vscode.TreeItem {
    constructor(label, collapsibleState = vscode.TreeItemCollapsibleState.None) {
        super(label, collapsibleState);
    }
    /**
     * Get the context value for this item (used for when clauses in package.json)
     */
    getContextValue() {
        return this.type;
    }
    /**
     * Update the item based on current state
     */
    updateState(_state) {
        // Base implementation does nothing
        // Override in subclasses to update based on state changes
    }
}
exports.BaseTreeItem = BaseTreeItem;
//# sourceMappingURL=base-tree-item.js.map