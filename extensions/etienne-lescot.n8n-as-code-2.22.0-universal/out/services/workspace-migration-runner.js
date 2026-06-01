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
exports.runWorkspaceMigrationFromVscode = runWorkspaceMigrationFromVscode;
const vscode = __importStar(require("vscode"));
const n8nac_1 = require("n8nac");
async function runWorkspaceMigrationFromVscode(context, workspaceRoot) {
    const facade = new n8nac_1.WorkspaceMigrationFacade({
        workspaceRoot,
        legacySettingsProvider: () => readLegacyN8nSettingsForMigration(context),
    });
    const migration = facade.inspect();
    if (!migration)
        return { outcome: 'not-needed' };
    const confirmation = await vscode.window.showWarningMessage(formatMigrationPrompt(migration), { modal: true }, 'Run migration');
    if (confirmation !== 'Run migration')
        return { outcome: 'cancelled', report: migration };
    const result = await facade.migrate({ write: true });
    if (migration.operations.some((operation) => operation.id === 'legacy-workspace-config')) {
        await clearLegacyWorkspaceSettings();
    }
    return { outcome: 'migrated', report: result };
}
function formatMigrationPrompt(migration) {
    const operationLabels = migration.operations.map((operation) => operation.label).join(', ');
    return operationLabels
        ? `Migration required: ${operationLabels}. This will update the workspace configuration.`
        : 'Migration required. This will update the workspace configuration.';
}
async function readLegacyN8nSettingsForMigration(context) {
    const config = vscode.workspace.getConfiguration('n8n');
    const configuredApiKey = String(config.get('apiKey') || '').trim();
    return {
        host: String(config.get('host') || '').trim().replace(/\/$/, ''),
        apiKey: configuredApiKey || await readLegacySecretApiKeyForMigration(context),
    };
}
async function readLegacySecretApiKeyForMigration(context) {
    const candidates = ['n8n.apiKey', 'apiKey', 'n8n-as-code.apiKey', 'n8nAsCode.apiKey', 'n8nApiKey'];
    for (const key of candidates) {
        const value = (await context.secrets.get(key))?.trim();
        if (value)
            return value;
    }
    return '';
}
async function clearLegacyWorkspaceSettings() {
    const config = vscode.workspace.getConfiguration('n8n');
    const keys = [
        'host',
        'apiKey',
        'syncFolder',
        'projectId',
        'projectName',
    ];
    for (const key of keys) {
        const inspected = config.inspect(key);
        if (inspected?.workspaceValue !== undefined) {
            await config.update(key, undefined, vscode.ConfigurationTarget.Workspace);
        }
        if (inspected?.workspaceFolderValue !== undefined) {
            await config.update(key, undefined, vscode.ConfigurationTarget.WorkspaceFolder);
        }
    }
}
//# sourceMappingURL=workspace-migration-runner.js.map