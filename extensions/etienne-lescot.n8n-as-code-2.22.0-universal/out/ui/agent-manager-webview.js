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
exports.AgentManagerWebview = void 0;
const vscode = __importStar(require("vscode"));
const agent_runtime_controller_js_1 = require("../services/agent-runtime-controller.js");
const agent_provider_service_js_1 = require("../services/agent-provider-service.js");
const agent_provider_settings_js_1 = require("../services/agent-provider-settings.js");
const agent_manager_html_js_1 = require("./agent-manager-html.js");
class AgentManagerWebview {
    static currentPanel;
    _panel;
    _context;
    _disposables = [];
    constructor(panel, context) {
        this._panel = panel;
        this._context = context;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.onDidReceiveMessage((message) => {
            void this.handleMessage(message);
        }, null, this._disposables);
        void this.render();
    }
    static createOrShow(context) {
        if (AgentManagerWebview.currentPanel) {
            AgentManagerWebview.currentPanel._panel.reveal(vscode.ViewColumn.One);
            void AgentManagerWebview.currentPanel.render();
            return;
        }
        const panel = vscode.window.createWebviewPanel('n8nAgentManager', 'n8n Agent Manager', vscode.ViewColumn.One, { enableScripts: true, retainContextWhenHidden: true, localResourceRoots: [] });
        AgentManagerWebview.currentPanel = new AgentManagerWebview(panel, context);
    }
    dispose() {
        if (AgentManagerWebview.currentPanel === this) {
            AgentManagerWebview.currentPanel = undefined;
        }
        this._panel.dispose();
        while (this._disposables.length) {
            this._disposables.pop()?.dispose();
        }
    }
    async render() {
        const settings = (0, agent_provider_settings_js_1.readAgentProviderSettings)(this._context.globalState);
        const provider = settings.provider;
        const definition = agent_provider_service_js_1.AGENT_PROVIDER_DEFINITIONS[provider];
        this._panel.webview.html = (0, agent_manager_html_js_1.buildAgentManagerHtml)({
            provider,
            providerLabel: definition.label,
            model: settings.model,
            baseUrl: settings.baseUrl,
            reasoningEffort: settings.reasoningEffort,
            supportsReasoningEffort: (0, agent_provider_service_js_1.providerSupportsReasoningEffort)(provider, settings.model),
            hasStoredApiKey: Boolean(await this._context.secrets.get((0, agent_runtime_controller_js_1.getAgentProviderSecretKey)(provider))),
            authKind: definition.authKind,
        });
    }
    async handleMessage(message) {
        if (!message || typeof message !== 'object') {
            return;
        }
        const payload = message;
        if (payload.type === 'setApiKey') {
            await vscode.commands.executeCommand('n8n.agent.setupProvider');
            await this.render();
            return;
        }
        if (payload.type === 'selectModel') {
            await vscode.commands.executeCommand('n8n.agent.selectModel');
            await this.render();
            return;
        }
        if (payload.type === 'selectReasoningEffort') {
            await vscode.commands.executeCommand('n8n.agent.selectReasoningEffort');
            await this.render();
            return;
        }
        if (payload.type === 'openSettings') {
            await vscode.commands.executeCommand('n8n.configure', 'agent-providers');
        }
    }
}
exports.AgentManagerWebview = AgentManagerWebview;
//# sourceMappingURL=agent-manager-webview.js.map