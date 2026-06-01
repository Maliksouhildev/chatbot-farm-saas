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
exports.getResolvedN8nConfig = getResolvedN8nConfig;
exports.getWorkspaceRoot = getWorkspaceRoot;
exports.getN8nConfig = getN8nConfig;
exports.validateN8nConfig = validateN8nConfig;
exports.isFolderPreviouslyInitialized = isFolderPreviouslyInitialized;
exports.hasAIContextFiles = hasAIContextFiles;
exports.determineInitialState = determineInitialState;
exports.getSyncDirectoryPath = getSyncDirectoryPath;
exports.doesSyncDirectoryExist = doesSyncDirectoryExist;
exports.getExistingInstanceIdentifier = getExistingInstanceIdentifier;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const n8nac_1 = require("n8nac");
const unified_config_js_1 = require("./unified-config.js");
function readString(value) {
    return typeof value === 'string' ? value.trim() : '';
}
function normalizeHost(host) {
    const trimmed = readString(host).replace(/^['"]|['"]$/g, '');
    return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}
function getSettingsValue(key) {
    return readString(vscode.workspace.getConfiguration('n8n').get(key));
}
function getEnvValue(key) {
    return readString(process.env[key]).replace(/^['"]|['"]$/g, '');
}
function getResolvedN8nConfig(workspaceRoot = getWorkspaceRoot()) {
    const unified = workspaceRoot ? (0, unified_config_js_1.readUnifiedWorkspaceConfig)(workspaceRoot) : undefined;
    const configService = workspaceRoot ? new n8nac_1.ConfigService(workspaceRoot) : undefined;
    const environment = configService ? (() => {
        try {
            return configService.resolveEnvironment();
        }
        catch {
            return undefined;
        }
    })() : undefined;
    if (environment) {
        return {
            host: normalizeHost(environment.host) || getEnvValue('N8N_HOST'),
            apiKey: environment.apiKey || '',
            syncFolder: environment.syncFolder || 'workflows',
            projectId: environment.projectId || '',
            projectName: environment.projectName || '',
            activeInstanceId: environment.activeInstanceId || '',
            activeInstanceName: environment.activeInstanceName || environment.environmentTargetName || '',
            environmentId: environment.environmentId,
            environmentName: environment.environmentName,
            environmentTargetId: environment.environmentTargetId,
            environmentTargetName: environment.environmentTargetName,
        };
    }
    const activeInstance = workspaceRoot && configService ? configService.getActiveInstance() : undefined;
    const host = normalizeHost(readString(unified?.host) || getSettingsValue('host') || getEnvValue('N8N_HOST'));
    const apiKey = (host && configService ? configService.getApiKey(host, activeInstance?.id) : undefined)
        || getSettingsValue('apiKey')
        || getEnvValue('N8N_API_KEY');
    return {
        host,
        apiKey,
        syncFolder: readString(unified?.syncFolder) || getSettingsValue('syncFolder') || 'workflows',
        projectId: readString(unified?.projectId) || getSettingsValue('projectId'),
        projectName: readString(unified?.projectName) || getSettingsValue('projectName'),
        activeInstanceId: readString(unified?.activeInstanceId) || activeInstance?.id || '',
        activeInstanceName: activeInstance?.name || '',
    };
}
/**
 * Get the current workspace root path
 * Returns undefined if no workspace is open
 */
function getWorkspaceRoot() {
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        return undefined;
    }
    return vscode.workspace.workspaceFolders[0].uri.fsPath;
}
/**
 * Get normalized n8n connection credentials.
 */
function getN8nConfig() {
    const { host, apiKey } = getResolvedN8nConfig();
    return { host, apiKey };
}
/**
 * Validate n8n configuration
 */
function validateN8nConfig() {
    const { host, apiKey } = getN8nConfig();
    const missing = [];
    if (!host || host.trim() === '') {
        missing.push('n8n.host');
    }
    if (!apiKey || apiKey.trim() === '') {
        missing.push('n8n.apiKey');
    }
    return {
        isValid: missing.length === 0,
        missing,
        error: missing.length > 0 ? `Missing configuration: ${missing.join(', ')}` : undefined
    };
}
/**
 * Check if a workspace folder was initialized with a canonical n8n sync identity.
 */
function isFolderPreviouslyInitialized(workspaceRoot) {
    if (!workspaceRoot) {
        return false;
    }
    return (0, n8nac_1.isCanonicalUserInstanceIdentifier)((0, unified_config_js_1.readUnifiedWorkspaceConfig)(workspaceRoot).instanceIdentifier);
}
/**
 * Check for external-instance AI context files
 */
function hasAIContextFiles(workspaceRoot) {
    if (!workspaceRoot) {
        return false;
    }
    return fs.existsSync(path.join(workspaceRoot, 'AGENTS.md'));
}
/**
 * Determine the initial extension state based on workspace and configuration
 */
function determineInitialState(workspaceRoot) {
    const configValidation = validateN8nConfig();
    const hasValidConfig = configValidation.isValid;
    if (!workspaceRoot) {
        return {
            state: 'uninitialized',
            hasValidConfig: false,
            isPreviouslyInitialized: false
        };
    }
    if (!fs.existsSync(path.join(workspaceRoot, 'n8nac-config.json'))) {
        return {
            state: 'configuring',
            hasValidConfig: false,
            isPreviouslyInitialized: false
        };
    }
    const isPreviouslyInitialized = isFolderPreviouslyInitialized(workspaceRoot);
    if (isPreviouslyInitialized && hasValidConfig) {
        // Auto-load external-instance configuration
        return {
            state: 'initialized',
            hasValidConfig: true,
            isPreviouslyInitialized: true
        };
    }
    else if (!hasValidConfig) {
        // Configuration is incomplete
        return {
            state: 'configuring',
            hasValidConfig: false,
            isPreviouslyInitialized
        };
    }
    else {
        // Valid config but not previously initialized
        return {
            state: 'uninitialized',
            hasValidConfig: true,
            isPreviouslyInitialized: false
        };
    }
}
/**
 * Get sync directory path for the current workspace
 */
function getSyncDirectoryPath() {
    const workspaceRoot = getWorkspaceRoot();
    if (!workspaceRoot) {
        return undefined;
    }
    const folder = getResolvedN8nConfig(workspaceRoot).syncFolder;
    return path.isAbsolute(folder) ? folder : path.resolve(workspaceRoot, folder);
}
/**
 * Check if sync directory exists
 */
function doesSyncDirectoryExist() {
    const syncDir = getSyncDirectoryPath();
    return syncDir ? fs.existsSync(syncDir) : false;
}
/**
 * Get the canonical instance identifier from external-instance configuration.
 */
function getExistingInstanceIdentifier(workspaceRoot) {
    const identifier = (0, unified_config_js_1.readUnifiedWorkspaceConfig)(workspaceRoot).instanceIdentifier;
    return (0, n8nac_1.isCanonicalUserInstanceIdentifier)(identifier) ? identifier : undefined;
}
//# sourceMappingURL=state-detection.js.map