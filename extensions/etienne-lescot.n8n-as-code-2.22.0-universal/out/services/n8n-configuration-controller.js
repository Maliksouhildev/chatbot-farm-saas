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
exports.N8nConfigurationController = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const crypto_1 = require("crypto");
const manager_adapter_1 = require("@n8n-as-code/manager-adapter");
const n8nac_1 = require("n8nac");
class N8nConfigurationController {
    outputChannel;
    onDidChangeEmitter = new vscode.EventEmitter();
    onDidChangeSnapshot = this.onDidChangeEmitter.event;
    disposables = [];
    watcherDisposables = [];
    refreshTimer;
    snapshot;
    constructor(outputChannel) {
        this.outputChannel = outputChannel;
    }
    start() {
        this.rebuildWatchers();
        this.disposables.push(vscode.workspace.onDidChangeWorkspaceFolders(() => {
            this.rebuildWatchers();
            this.scheduleRefresh('workspace-folders-changed');
        }));
        this.scheduleRefresh('startup');
    }
    getSnapshot() {
        return this.snapshot;
    }
    async refresh(reason = 'manual', options = {}) {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = undefined;
        }
        const previous = this.snapshot;
        const next = await this.readSnapshot();
        this.snapshot = next;
        if (options.force || !previous || previous.signature !== next.signature || previous.error !== next.error) {
            this.outputChannel?.appendLine(`[n8n] Configuration snapshot refreshed (${reason}).`);
            this.onDidChangeEmitter.fire({ snapshot: next, previous, reason });
        }
        return next;
    }
    scheduleRefresh(reason = 'watcher') {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
        this.refreshTimer = setTimeout(() => {
            this.refreshTimer = undefined;
            void this.refresh(reason).catch((error) => {
                this.outputChannel?.appendLine(`[n8n] Configuration refresh failed: ${error?.message || error}`);
            });
        }, 120);
    }
    dispose() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = undefined;
        }
        this.disposeWatchers();
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        this.disposables.length = 0;
        this.onDidChangeEmitter.dispose();
    }
    async readSnapshot() {
        const workspaceRoot = getWorkspaceRoot();
        const facade = (0, manager_adapter_1.createN8nManagerFacade)({ workspaceRoot });
        const configService = workspaceRoot ? new n8nac_1.ConfigService(workspaceRoot) : undefined;
        const hasWorkspaceConfig = workspaceRoot
            ? fs.existsSync(path.join(workspaceRoot, 'n8nac-config.json'))
            : false;
        try {
            let global = await facade.getGlobalConfig();
            const migration = hasWorkspaceConfig && configService ? new n8nac_1.WorkspaceMigrationFacade({ configService }).inspect() : undefined;
            if (!hasWorkspaceConfig) {
                return this.buildSnapshot({
                    workspaceRoot,
                    global,
                    workspace: { version: 3 },
                    hasWorkspaceConfig: false,
                    hasValidConnection: false,
                });
            }
            if (migration?.operations.some((operation) => operation.id === 'legacy-workspace-config')) {
                return this.buildSnapshot({
                    workspaceRoot,
                    global,
                    workspace: { version: 3 },
                    hasWorkspaceConfig,
                    hasValidConnection: false,
                    migration,
                });
            }
            const workspace = workspaceRoot && configService ? configService.getWorkspaceConfig() : { version: 3 };
            const isEnvironmentWorkspace = workspace.version === 4;
            let prepared = isEnvironmentWorkspace ? undefined : await facade.prepareEffectiveContext({
                workspaceRoot,
                syncFolderDefault: 'workspace',
                consumer: 'vscode',
                autoStart: true,
            }).catch(() => undefined);
            let effective = isEnvironmentWorkspace && configService
                ? await configService.prepareWorkspaceContext({ consumer: 'vscode' }).catch(() => configService.getEffectiveContext())
                : prepared?.context;
            if (prepared) {
                const effectiveHost = prepared.context.apiBaseUrl ?? prepared.context.host;
                if (effectiveHost && prepared.context.apiKey && !(0, n8nac_1.isCanonicalUserInstanceIdentifier)(prepared.context.instanceIdentifier)) {
                    const { identifier } = await (0, n8nac_1.resolveInstanceIdentifier)({
                        host: effectiveHost,
                        apiKey: prepared.context.apiKey,
                    });
                    await facade.upsertInstance({
                        id: prepared.context.activeInstanceId,
                        instanceIdentifier: identifier,
                    }, { setActive: false });
                    prepared = {
                        ...prepared,
                        context: {
                            ...prepared.context,
                            instanceIdentifier: identifier,
                            instance: {
                                ...prepared.context.instance,
                                instanceIdentifier: identifier,
                            },
                        },
                    };
                }
                global = await facade.getGlobalConfig();
            }
            const hasValidConnection = Boolean((effective?.apiBaseUrl ?? effective?.host) && effective?.apiKey && !prepared?.runtime.blocked);
            return this.buildSnapshot({
                workspaceRoot,
                global,
                workspace,
                effective,
                runtime: prepared?.runtime,
                diagnostics: prepared?.diagnostics,
                hasWorkspaceConfig,
                hasValidConnection,
                migration,
            });
        }
        catch (error) {
            const global = await facade.getGlobalConfig().catch(() => ({
                version: 1,
                defaultSyncFolder: '',
                instances: [],
            }));
            const workspace = workspaceRoot && configService
                ? this.readWorkspaceSnapshotConfig(configService)
                : { version: 3 };
            return this.buildSnapshot({
                workspaceRoot,
                global,
                workspace,
                hasWorkspaceConfig,
                hasValidConnection: false,
                error: error?.message || String(error),
            });
        }
    }
    buildSnapshot(input) {
        const workspace = input.workspace;
        const effective = input.effective;
        const credentialFingerprint = input.effective?.apiKey
            ? (0, crypto_1.createHash)('sha256').update(input.effective.apiKey).digest('hex')
            : '';
        const runtimeSignature = JSON.stringify({
            workspaceRoot: input.workspaceRoot || '',
            workspaceVersion: workspace?.version || '',
            activeEnvironmentId: workspace?.activeEnvironmentId || '',
            environmentId: effective?.environmentId || workspace?.activeEnvironment?.id || '',
            environmentName: effective?.environmentName || workspace?.activeEnvironment?.name || '',
            environmentTargetId: effective?.environmentTargetId || workspace?.environmentTargetId || '',
            environmentTargetName: effective?.environmentTargetName || workspace?.environmentTargetName || '',
            sourceKind: effective?.sourceKind || workspace?.sourceKind || '',
            credentialSource: effective?.apiKeySource || workspace?.credentialSource || '',
            credentialFingerprint,
            activeInstanceId: input.effective?.activeInstanceId || '',
            apiBaseUrl: input.effective?.apiBaseUrl ?? input.effective?.host ?? '',
            publicBaseUrl: input.effective?.publicBaseUrl || '',
            hasApiKey: Boolean(input.effective?.apiKey),
            syncFolder: input.effective?.syncFolder || '',
            projectId: input.effective?.projectId || '',
            projectName: input.effective?.projectName || '',
            instanceIdentifier: input.effective?.instanceIdentifier || '',
            folderSync: Boolean(input.effective?.folderSync),
            runtimeStatus: input.runtime?.status || '',
            runtimeReady: Boolean(input.runtime?.ready),
            runtimeBlocked: input.runtime?.blocked?.code || '',
            tunnelPublicUrl: input.runtime?.tunnel?.publicUrl || '',
            tunnelRunning: Boolean(input.runtime?.tunnel?.running),
            error: input.error || '',
            migration: input.migration ? {
                status: input.migration.status,
                configPath: input.migration.configPath,
                required: input.migration.required,
                operations: input.migration.operations.map((operation) => ({
                    id: operation.id,
                    instanceCount: operation.instanceCount,
                })),
            } : undefined,
        });
        const signature = JSON.stringify({
            runtime: runtimeSignature,
            hasWorkspaceConfig: input.hasWorkspaceConfig,
            global: {
                activeInstanceId: input.global.activeInstanceId || '',
                defaultSyncFolder: input.global.defaultSyncFolder || '',
                instances: input.global.instances.map((instance) => ({
                    id: instance.id,
                    name: instance.name,
                    mode: instance.mode,
                    url: instance.baseUrl || '',
                    tunnelPublicUrl: instance.tunnelPublicUrl || '',
                    apiKeyAvailable: Boolean(instance.apiKeyAvailable),
                    defaultProjectId: instance.defaultProject?.id || '',
                    defaultProjectName: instance.defaultProject?.name || '',
                    instanceIdentifier: instance.instanceIdentifier || '',
                    updatedAt: instance.updatedAt || '',
                })),
            },
            workspace: input.workspace,
        });
        return {
            ...input,
            effective: this.sanitizeEffectiveContext(input.effective),
            signature,
            runtimeSignature,
            migration: input.migration,
        };
    }
    readWorkspaceSnapshotConfig(configService) {
        try {
            return configService.getWorkspaceConfig();
        }
        catch {
            return { version: 3 };
        }
    }
    sanitizeEffectiveContext(effective) {
        if (!effective)
            return undefined;
        const { apiKey: _apiKey, ...safeEffective } = effective;
        return {
            ...safeEffective,
            apiKey: undefined,
            apiKeyAvailable: Boolean(effective.apiKey),
        };
    }
    rebuildWatchers() {
        this.disposeWatchers();
        this.watchManagerConfigFiles();
        this.watchWorkspaceConfigFile();
    }
    watchManagerConfigFiles() {
        const paths = (0, manager_adapter_1.resolveN8nManagerConfigurationPaths)();
        if (!fs.existsSync(paths.homeDir)) {
            return;
        }
        this.watchFile(paths.homeDir, 'instances.json', 'global-instances-changed');
        this.watchFile(paths.homeDir, 'secrets.json', 'global-secrets-changed');
    }
    watchWorkspaceConfigFile() {
        const workspaceRoot = getWorkspaceRoot();
        if (!workspaceRoot) {
            return;
        }
        this.watchFile(workspaceRoot, 'n8nac-config.json', 'workspace-overrides-changed');
    }
    watchFile(directory, fileName, reason) {
        const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(vscode.Uri.file(directory), fileName), false, false, false);
        const refresh = () => this.scheduleRefresh(reason);
        watcher.onDidCreate(refresh, undefined, this.watcherDisposables);
        watcher.onDidChange(refresh, undefined, this.watcherDisposables);
        watcher.onDidDelete(refresh, undefined, this.watcherDisposables);
        this.watcherDisposables.push(watcher);
    }
    disposeWatchers() {
        for (const disposable of this.watcherDisposables) {
            disposable.dispose();
        }
        this.watcherDisposables.length = 0;
    }
}
exports.N8nConfigurationController = N8nConfigurationController;
function getWorkspaceRoot() {
    return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}
//# sourceMappingURL=n8n-configuration-controller.js.map