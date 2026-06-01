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
exports.StatusBar = void 0;
const vscode = __importStar(require("vscode"));
class StatusBar {
    item;
    constructor() {
        this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.item.command = 'n8n.pull';
    }
    showSyncing() {
        this.item.text = '$(sync~spin) n8n';
        this.item.tooltip = 'Syncing...';
        this.item.show();
    }
    showSynced() {
        this.item.text = '$(check) n8n';
        this.item.tooltip = 'Workflows Synced';
        this.item.show();
        setTimeout(() => {
            this.item.text = 'n8n'; // Revert to neutral state
        }, 3000);
    }
    showError(msg) {
        this.item.text = '$(error) n8n';
        this.item.tooltip = msg;
        this.item.show();
    }
    setWatchMode(active) {
        if (active) {
            this.item.text = '$(eye) n8n (Watch)';
            this.item.tooltip = 'n8n: Watch Mode Active';
            this.item.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        }
        else {
            this.item.text = 'n8n';
            this.item.tooltip = 'n8n: Manual Mode';
            this.item.backgroundColor = undefined;
        }
        this.item.show();
    }
    // New methods for initialization state management
    hide() {
        this.item.hide();
    }
    showLoading(message = 'Initializing...') {
        this.item.text = `$(loading~spin) ${message}`;
        this.item.tooltip = message;
        this.item.show();
    }
    showNotInitialized() {
        this.item.text = '$(info) n8n: Not initialized';
        this.item.tooltip = 'Click to initialize n8n as code';
        this.item.command = 'n8n.init';
        this.item.show();
    }
    showConfiguring() {
        this.item.text = '$(settings) n8n: Configure';
        this.item.tooltip = 'Configure n8n settings to continue';
        this.item.command = 'n8n.configure';
        this.item.show();
    }
    showSettingsChanged() {
        this.item.text = '$(alert) n8n: Apply changes';
        this.item.tooltip = 'Settings changed. Sync is paused until you apply the new settings.';
        this.item.command = 'n8n.applySettings';
        this.item.show();
    }
}
exports.StatusBar = StatusBar;
//# sourceMappingURL=status-bar.js.map