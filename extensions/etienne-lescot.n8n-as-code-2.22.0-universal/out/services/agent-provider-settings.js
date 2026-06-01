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
exports.readAgentProviderSettings = readAgentProviderSettings;
exports.updateAgentProviderSettings = updateAgentProviderSettings;
const vscode = __importStar(require("vscode"));
const AGENT_PROVIDER_IDS = new Set([
    'anthropic',
    'openai',
    'google',
    'mistral',
    'openrouter',
    'openai-oauth',
    'copilot-proxy',
    'minimax',
    'minimax-token-plan',
    'openai-compatible',
]);
const AGENT_REASONING_EFFORT_SETTINGS = ['none', 'minimal', 'low', 'medium', 'high', 'xhigh'];
const SELECTED_PROVIDER_STATE_KEY = 'n8n.agent.provider';
const SELECTED_MODEL_STATE_KEY = 'n8n.agent.model';
const BASE_URL_STATE_KEY = 'n8n.agent.baseUrl';
const REASONING_EFFORT_STATE_KEY = 'n8n.agent.reasoningEffort';
const MANAGED_SETTINGS_STATE_KEY = 'n8n.agent.settingsManaged';
function readAgentProviderSettings(state) {
    const legacyConfig = vscode.workspace.getConfiguration('n8n.agent');
    const legacyProvider = readOptionalString(legacyConfig.get('provider'));
    const useManagedSettings = state.get(MANAGED_SETTINGS_STATE_KEY) === true || !legacyProvider;
    const provider = normalizeAgentProviderId(useManagedSettings
        ? readPersistedString(state, SELECTED_PROVIDER_STATE_KEY, legacyProvider)
        : legacyProvider) || 'openai';
    const model = (useManagedSettings
        ? readPersistedString(state, SELECTED_MODEL_STATE_KEY, legacyConfig.get('model'))
        : readOptionalString(legacyConfig.get('model'))) || undefined;
    const baseUrl = (useManagedSettings
        ? readPersistedString(state, BASE_URL_STATE_KEY, legacyConfig.get('baseUrl'))
        : readOptionalString(legacyConfig.get('baseUrl'))) || undefined;
    const reasoningValue = useManagedSettings
        ? readPersistedString(state, REASONING_EFFORT_STATE_KEY, legacyConfig.get('reasoningEffort'))
        : readOptionalString(legacyConfig.get('reasoningEffort'));
    const reasoningEffort = AGENT_REASONING_EFFORT_SETTINGS.includes(reasoningValue)
        ? reasoningValue
        : undefined;
    return { provider, model, baseUrl, reasoningEffort };
}
function normalizeAgentProviderId(provider) {
    const normalized = provider?.trim().toLowerCase();
    if (!normalized)
        return undefined;
    if (normalized === 'claude')
        return 'anthropic';
    if (normalized === 'anthropic-proxy')
        return 'anthropic';
    if (normalized === 'gemini')
        return 'google';
    return AGENT_PROVIDER_IDS.has(normalized) ? normalized : undefined;
}
async function updateAgentProviderSettings(state, patch) {
    await state.update(MANAGED_SETTINGS_STATE_KEY, true);
    if ('provider' in patch)
        await state.update(SELECTED_PROVIDER_STATE_KEY, patch.provider);
    if ('model' in patch)
        await state.update(SELECTED_MODEL_STATE_KEY, patch.model || undefined);
    if ('baseUrl' in patch)
        await state.update(BASE_URL_STATE_KEY, patch.baseUrl || undefined);
    if ('reasoningEffort' in patch)
        await state.update(REASONING_EFFORT_STATE_KEY, patch.reasoningEffort || undefined);
}
function readPersistedString(state, key, legacyValue) {
    const value = state.get(key);
    return readOptionalString(value ?? legacyValue);
}
function readOptionalString(value) {
    return String(value ?? '').trim();
}
//# sourceMappingURL=agent-provider-settings.js.map