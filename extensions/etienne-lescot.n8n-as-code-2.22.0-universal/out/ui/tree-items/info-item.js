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
exports.InfoItem = void 0;
const vscode = __importStar(require("vscode"));
const base_tree_item_js_1 = require("./base-tree-item.js");
const types_js_1 = require("../../types.js");
/**
 * Simple info message tree item (non-interactive)
 */
class InfoItem extends base_tree_item_js_1.BaseTreeItem {
    type = types_js_1.TreeItemType.INFO;
    constructor(label, description, icon) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.description = description;
        this.iconPath = icon || new vscode.ThemeIcon('info');
        this.contextValue = 'info';
    }
    getContextValue() {
        return 'info';
    }
    updateState(_state) {
        // Info items don't need dynamic updates
    }
}
exports.InfoItem = InfoItem;
//# sourceMappingURL=info-item.js.map