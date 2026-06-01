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
exports.ErrorItem = void 0;
const vscode = __importStar(require("vscode"));
const base_tree_item_js_1 = require("./base-tree-item.js");
const types_js_1 = require("../../types.js");
/**
 * Tree item showing error state with retry option
 */
class ErrorItem extends base_tree_item_js_1.BaseTreeItem {
    errorMessage;
    canRetry;
    type = types_js_1.TreeItemType.ERROR;
    constructor(errorMessage, canRetry = true) {
        super('Initialization Failed', vscode.TreeItemCollapsibleState.None);
        this.errorMessage = errorMessage;
        this.canRetry = canRetry;
        this.iconPath = new vscode.ThemeIcon('error');
        this.description = 'Click to retry';
        this.tooltip = this.getTooltip();
        // Make it clickable to retry initialization
        this.command = canRetry ? {
            command: 'n8n.init',
            title: 'Retry Initialization',
            arguments: []
        } : undefined;
    }
    getTooltip() {
        return `Error: ${this.errorMessage}\n\n${this.canRetry ? 'Click to retry initialization' : 'Please check configuration and try again'}`;
    }
    updateState(state) {
        const { errorMessage, canRetry } = state;
        this.errorMessage = errorMessage || this.errorMessage;
        this.canRetry = canRetry !== undefined ? canRetry : this.canRetry;
        this.tooltip = this.getTooltip();
        this.command = this.canRetry ? {
            command: 'n8n.init',
            title: 'Retry Initialization',
            arguments: []
        } : undefined;
    }
}
exports.ErrorItem = ErrorItem;
//# sourceMappingURL=error-item.js.map