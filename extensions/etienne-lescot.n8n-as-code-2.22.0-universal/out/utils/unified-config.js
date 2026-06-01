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
exports.getUnifiedConfigPath = getUnifiedConfigPath;
exports.readUnifiedWorkspaceConfig = readUnifiedWorkspaceConfig;
exports.toStoredSyncFolder = toStoredSyncFolder;
exports.buildUnifiedWorkspaceConfig = buildUnifiedWorkspaceConfig;
exports.writeUnifiedWorkspaceConfig = writeUnifiedWorkspaceConfig;
const crypto_1 = require("crypto");
const path = __importStar(require("path"));
const n8nac_1 = require("n8nac");
function getUnifiedConfigPath(workspaceRoot) {
    return path.join(workspaceRoot, 'n8nac-config.json');
}
function readUnifiedWorkspaceConfig(workspaceRoot) {
    return new n8nac_1.ConfigService(workspaceRoot).getWorkspaceConfig();
}
function toStoredSyncFolder(workspaceRoot, syncFolder) {
    if (!syncFolder) {
        return 'workflows';
    }
    const normalizedWorkspaceRoot = path.resolve(workspaceRoot);
    const normalizedSyncFolder = path.resolve(syncFolder);
    return path.isAbsolute(syncFolder) && normalizedSyncFolder.startsWith(`${normalizedWorkspaceRoot}${path.sep}`)
        ? path.relative(workspaceRoot, syncFolder) || 'workflows'
        : syncFolder;
}
function getCurrentInstance(existing, instanceId) {
    const targetId = instanceId || existing.activeInstanceId;
    return targetId
        ? existing.instances.find((instance) => instance.id === targetId)
        : undefined;
}
function createDraftInstanceId() {
    return `instance-${(0, crypto_1.randomUUID)().slice(0, 8)}`;
}
function toActiveFields(active) {
    const next = {};
    const stringKeys = [
        'host',
        'syncFolder',
        'projectId',
        'projectName',
        'instanceIdentifier',
        'customNodesPath',
    ];
    for (const key of stringKeys) {
        const value = active?.[key];
        if (typeof value === 'string' && value.trim() !== '') {
            next[key] = value;
        }
    }
    if (typeof active?.folderSync === 'boolean') {
        next.folderSync = active.folderSync;
    }
    return next;
}
async function buildUnifiedWorkspaceConfig(input) {
    const existing = readUnifiedWorkspaceConfig(input.workspaceRoot);
    const current = input.createNew ? undefined : getCurrentInstance(existing, input.instanceId);
    const storedSyncFolder = toStoredSyncFolder(input.workspaceRoot, input.syncFolder || 'workflows');
    const instanceId = current?.id || input.instanceId || createDraftInstanceId();
    let resolvedInstanceIdentifier = input.instanceIdentifier;
    if (input.host && input.apiKey) {
        const credentials = {
            host: input.host,
            apiKey: input.apiKey
        };
        const { identifier } = await (0, n8nac_1.resolveInstanceIdentifier)(credentials, {
            client: input.client,
        });
        resolvedInstanceIdentifier = identifier;
    }
    else if (input.apiKey !== '' || input.host !== '') {
        resolvedInstanceIdentifier = undefined;
    }
    const instanceName = input.instanceName?.trim() || current?.name || input.host || 'Default instance';
    const profile = {
        id: instanceId,
        name: instanceName,
        host: input.host || undefined,
        syncFolder: storedSyncFolder || undefined,
        projectId: input.projectId || undefined,
        projectName: input.projectName || undefined,
        instanceIdentifier: resolvedInstanceIdentifier,
        customNodesPath: current?.customNodesPath,
        folderSync: current?.folderSync,
        verification: current?.verification,
    };
    const instances = [
        ...existing.instances.filter((instance) => instance.id !== profile.id),
        profile,
    ].sort((left, right) => left.name.localeCompare(right.name));
    const activeInstanceId = input.setActive === false
        ? (existing.activeInstanceId || profile.id)
        : profile.id;
    const active = instances.find((instance) => instance.id === activeInstanceId);
    return {
        version: 3,
        activeInstanceId,
        instances,
        ...toActiveFields(active),
    };
}
async function writeUnifiedWorkspaceConfig(input) {
    const service = new n8nac_1.ConfigService(input.workspaceRoot);
    const storedSyncFolder = toStoredSyncFolder(input.workspaceRoot, input.syncFolder || 'workflows');
    const result = await service.upsertInstanceConfigWithVerification({
        host: input.host || undefined,
        apiKey: input.apiKey || undefined,
        syncFolder: storedSyncFolder || undefined,
        projectId: input.projectId || undefined,
        projectName: input.projectName || undefined,
        instanceIdentifier: input.instanceIdentifier,
    }, {
        instanceId: input.instanceId,
        instanceName: input.instanceName,
        createNew: input.createNew,
        setActive: input.setActive,
        client: input.client,
    });
    if (result.status === 'duplicate') {
        throw new Error(`This n8n instance is already saved as "${result.duplicateInstance.name}".`);
    }
    return service.getWorkspaceConfig();
}
//# sourceMappingURL=unified-config.js.map