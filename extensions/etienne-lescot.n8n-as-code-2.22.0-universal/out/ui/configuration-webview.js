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
exports.ConfigurationWebview = void 0;
const vscode = __importStar(require("vscode"));
const crypto_1 = require("crypto");
const manager_adapter_1 = require("@n8n-as-code/manager-adapter");
const n8nac_1 = require("n8nac");
const state_detection_js_1 = require("../utils/state-detection.js");
const agent_provider_service_js_1 = require("../services/agent-provider-service.js");
const configuration_webview_html_js_1 = require("./configuration-webview-html.js");
const workspace_migration_runner_js_1 = require("../services/workspace-migration-runner.js");
const configuration_webview_projects_js_1 = require("./configuration-webview-projects.js");
const WORKSPACE_ENVIRONMENT_MODEL_METADATA = { n8nacWorkspaceEnvironmentModel: 'v4' };
function normalizeHost(host) {
    const trimmed = (host || '').trim();
    return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}
function normalizeWorkflowsPath(workflowsPath) {
    return String(workflowsPath || '').trim().replace(/\\/g, '/').replace(/\/+$/g, '');
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
    const cleared = [];
    for (const key of keys) {
        const inspected = config.inspect(key);
        if (inspected?.workspaceValue !== undefined) {
            await config.update(key, undefined, vscode.ConfigurationTarget.Workspace);
            cleared.push(`n8n.${key}`);
        }
        if (inspected?.workspaceFolderValue !== undefined) {
            await config.update(key, undefined, vscode.ConfigurationTarget.WorkspaceFolder);
            cleared.push(`n8n.${key}`);
        }
    }
    return [...new Set(cleared)];
}
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
function fallbackManagedInstanceId() {
    return `managed-${(0, crypto_1.randomUUID)().slice(0, 8)}`;
}
function normalizeManagedInstanceId(value) {
    const sanitized = String(value || '')
        .trim()
        .replace(/[^A-Za-z0-9-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 32);
    return sanitized && /^[A-Za-z0-9][A-Za-z0-9-]{0,31}$/.test(sanitized)
        ? sanitized
        : fallbackManagedInstanceId();
}
function normalizeManagedInstanceName(value) {
    const sanitized = String(value || '')
        .trim()
        .replace(/[^A-Za-z0-9 _-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 64)
        .trim();
    return sanitized || 'managed';
}
class ConfigurationWebview {
    static currentPanel;
    _panel;
    _context;
    _configurationController;
    _providerService;
    _disposables = [];
    _stateVersion = 0;
    _initialTab;
    _managedSetupJobs = new Map();
    _managedSetupJobCleanupTimers = new Map();
    _queuedPinEnvironmentId;
    _pinEnvironmentTask;
    constructor(panel, context, configurationController, initialTab) {
        this._panel = panel;
        this._context = context;
        this._configurationController = configurationController;
        this._providerService = new agent_provider_service_js_1.AgentProviderService(context);
        this._initialTab = initialTab;
        this._panel.onDidDispose(() => {
            for (const timer of this._managedSetupJobCleanupTimers.values()) {
                clearTimeout(timer);
            }
            this._managedSetupJobCleanupTimers.clear();
            for (const disposable of this._disposables) {
                disposable.dispose();
            }
            this._disposables.length = 0;
            ConfigurationWebview.currentPanel = undefined;
        });
        this._panel.webview.options = this.getWebviewOptions();
        this._panel.webview.onDidReceiveMessage((message) => {
            void this.handleMessage(message);
        });
        this._panel.webview.html = this.getHtmlForWebview();
        void this.postInitialState();
        this._disposables.push(this._configurationController.onDidChangeSnapshot((event) => {
            void this.postInitialState(event.snapshot);
        }));
        this._panel.onDidChangeViewState(() => {
            if (this._panel.visible) {
                void this.postInitialState();
            }
        });
    }
    static createOrShow(context, configurationController, initialTab) {
        const column = vscode.ViewColumn.One;
        if (ConfigurationWebview.currentPanel) {
            ConfigurationWebview.currentPanel._panel.reveal(column);
            if (initialTab) {
                ConfigurationWebview.currentPanel._panel.webview.postMessage({ type: 'activeTab', tab: initialTab });
            }
            return;
        }
        const panel = vscode.window.createWebviewPanel('n8nConfiguration', 'n8n: Configure', column, ConfigurationWebview.getWebviewOptions(context));
        ConfigurationWebview.currentPanel = new ConfigurationWebview(panel, context, configurationController, initialTab);
    }
    async handleMessage(message) {
        try {
            if (!message || typeof message !== 'object')
                return;
            const payload = message;
            const workspaceRoot = (0, state_detection_js_1.getWorkspaceRoot)();
            const facade = (0, manager_adapter_1.createN8nManagerFacade)({ workspaceRoot });
            const globalFacade = (0, manager_adapter_1.createN8nManagerFacade)({});
            switch (payload.type) {
                case 'refreshState':
                    await this._configurationController.refresh('webview-refresh', { force: true });
                    return;
                case 'migrateWorkspaceConfiguration':
                case 'migrateLegacyWorkspaceConfig':
                case 'migrateGlobalInstancesToEnvironments': {
                    if (!workspaceRoot)
                        throw new Error('Open a workspace before running migration.');
                    await this.migrateWorkspaceConfiguration(workspaceRoot);
                    return;
                }
                case 'loadProjects': {
                    try {
                        const result = await (0, configuration_webview_projects_js_1.loadProjectsForConfigurationWebview)(payload, {
                            workspaceRoot,
                            workspaceFacade: facade,
                            globalFacade,
                        });
                        this._panel.webview.postMessage({ ...result, draftId: payload.draftId });
                    }
                    catch (error) {
                        this._panel.webview.postMessage({
                            type: 'projectsError',
                            draftId: payload.draftId,
                            requestKey: payload.requestKey,
                            message: error?.message || 'Unable to load projects.',
                        });
                    }
                    return;
                }
                case 'createManagedInstance': {
                    await this.createManagedInstance(payload, globalFacade);
                    return;
                }
                case 'cancelManagedInstanceSetup': {
                    const instanceId = String(payload.instanceId || '').trim();
                    if (!instanceId)
                        throw new Error('Instance is required.');
                    const job = this._managedSetupJobs.get(instanceId);
                    if (!job || !['installing', 'cancelling'].includes(job.status))
                        return;
                    job.status = 'cancelling';
                    job.cancellationRequested = true;
                    job.message = 'Cancellation requested. Waiting for setup to stop safely.';
                    await this.postSetupJob(job);
                    return;
                }
                case 'loadEnvironmentEditCredentials': {
                    if (!workspaceRoot)
                        throw new Error('Open a workspace before editing workspace environments.');
                    const environmentId = String(payload.environmentId || '').trim();
                    if (!environmentId)
                        throw new Error('Environment is required.');
                    const environment = new n8nac_1.ConfigService(workspaceRoot).resolveEnvironment(environmentId);
                    this._panel.webview.postMessage({
                        type: 'environmentEditCredentials',
                        environmentId,
                        host: normalizeHost(environment.host || ''),
                        apiKeyAvailable: Boolean(environment.apiKey),
                    });
                    return;
                }
                case 'saveInstanceTarget': {
                    if (!workspaceRoot)
                        throw new Error('Open a workspace before saving workspace instance targets.');
                    const configService = new n8nac_1.ConfigService(workspaceRoot);
                    const targetId = String(payload.targetId || '').trim();
                    const requestedKind = String(payload.sourceKind || '').trim();
                    const input = {
                        name: String(payload.name || '').trim(),
                        managedInstanceId: String(payload.managedInstanceId || '').trim() || undefined,
                        url: normalizeHost(String(payload.url || '')) || undefined,
                        description: String(payload.description || '').trim() || undefined,
                    };
                    if (targetId) {
                        const externalInstance = configService.getInstanceTarget(targetId);
                        if (requestedKind && requestedKind !== externalInstance.kind) {
                            throw new Error('Changing an instance target type is not supported. Create a new target instead.');
                        }
                        configService.updateInstanceTarget(targetId, input);
                    }
                    else {
                        configService.addInstanceTarget(input);
                    }
                    await clearLegacyWorkspaceSettings();
                    await this._configurationController.refresh('webview-save-instance-target', { force: true });
                    this.notifySaved();
                    return;
                }
                case 'deleteInstanceTarget': {
                    if (!workspaceRoot)
                        throw new Error('Open a workspace before deleting workspace instance targets.');
                    const targetId = String(payload.targetId || '').trim();
                    if (!targetId)
                        throw new Error('Instance target is required.');
                    const configService = new n8nac_1.ConfigService(workspaceRoot);
                    const target = configService.getInstanceTarget(targetId);
                    const confirmation = await vscode.window.showWarningMessage(`Remove workspace instance target "${target.name}"?`, { modal: true }, 'Remove');
                    if (confirmation !== 'Remove') {
                        this._panel.webview.postMessage({ type: 'cancelled' });
                        return;
                    }
                    configService.removeInstanceTarget(targetId);
                    await this._configurationController.refresh('webview-delete-instance-target', { force: true });
                    this.notifySaved();
                    return;
                }
                case 'saveEnvironment': {
                    if (!workspaceRoot)
                        throw new Error('Open a workspace before saving workspace environments.');
                    const configService = new n8nac_1.ConfigService(workspaceRoot);
                    const environmentId = String(payload.environmentId || '').trim();
                    let environmentTargetId = String(payload.environmentTargetId || '').trim();
                    let existingEnvironmentTargetId = '';
                    let currentEnvironmentTargetUrl = '';
                    if (environmentId) {
                        const existingEnvironment = configService.getEnvironment(environmentId);
                        existingEnvironmentTargetId = existingEnvironment.environmentTargetId;
                        const existingTarget = configService.getInstanceTarget(existingEnvironmentTargetId);
                        if (existingTarget.kind === 'external-instance') {
                            currentEnvironmentTargetUrl = normalizeHost(existingTarget.url);
                        }
                        else {
                            const instance = (await globalFacade.listInstances()).find((item) => item.id === existingTarget.managedInstanceId);
                            currentEnvironmentTargetUrl = normalizeHost(instance?.tunnelPublicUrl || instance?.baseUrl || '');
                        }
                    }
                    const instanceId = String(payload.instanceId || '').trim();
                    const url = normalizeHost(String(payload.url || ''));
                    const apiKey = String(payload.apiKey || '').trim();
                    const name = String(payload.name || '').trim();
                    const projectId = String(payload.projectId || '').trim();
                    const projectName = String(payload.projectName || '').trim() || 'Personal';
                    if (environmentId && !environmentTargetId && !instanceId && !url) {
                        environmentTargetId = existingEnvironmentTargetId;
                    }
                    const selectedExistingTargetChanged = Boolean(environmentId && environmentTargetId && environmentTargetId !== existingEnvironmentTargetId);
                    if (environmentId && !selectedExistingTargetChanged && url && url !== currentEnvironmentTargetUrl) {
                        if (!apiKey)
                            throw new Error('API key is required when replacing the environment URL.');
                        environmentTargetId = this.ensureEmbeddedWorkspaceTarget(configService, {
                            name: name || url,
                            url,
                        });
                    }
                    if (!environmentTargetId && instanceId) {
                        const instance = (await globalFacade.listInstances()).find((item) => item.id === instanceId);
                        if (!instance)
                            throw new Error(`Unknown n8n instance preset: ${instanceId}`);
                        if (instance.mode === 'managed-local-docker') {
                            environmentTargetId = configService.ensureManagedInstanceTarget({
                                name: instance.name || instanceId,
                                managedInstanceId: instanceId,
                            }).id;
                        }
                        else {
                            const targetUrl = normalizeHost(instance.tunnelPublicUrl || instance.baseUrl || url);
                            if (!targetUrl)
                                throw new Error('Remote n8n URL is required for this environment.');
                            environmentTargetId = this.ensureEmbeddedWorkspaceTarget(configService, {
                                name: instance.name || name || targetUrl,
                                url: targetUrl,
                            });
                            const storedApiKey = configService.getApiKey(targetUrl, instance.id);
                            if (storedApiKey)
                                configService.saveWorkspaceTargetApiKey(environmentTargetId, storedApiKey);
                        }
                    }
                    if (!environmentTargetId && url) {
                        const existingPreset = (await globalFacade.listInstances()).find((instance) => normalizeHost(instance.tunnelPublicUrl || instance.baseUrl || '') === url && instance.mode !== 'managed-local-docker');
                        environmentTargetId = this.ensureEmbeddedWorkspaceTarget(configService, {
                            name: name || existingPreset?.name || url,
                            url,
                        });
                        const storedApiKey = apiKey || (existingPreset ? configService.getApiKey(url, existingPreset.id) : undefined);
                        if (storedApiKey)
                            configService.saveWorkspaceTargetApiKey(environmentTargetId, storedApiKey);
                    }
                    if (!environmentId && environmentTargetId && url) {
                        const selectedTarget = configService.getInstanceTarget(environmentTargetId);
                        const targetInstance = selectedTarget.kind === 'managed-instance'
                            ? (await globalFacade.listInstances()).find((instance) => instance.id === selectedTarget.managedInstanceId)
                            : undefined;
                        if (selectedTarget.kind === 'managed-instance' && targetInstance?.mode !== 'managed-local-docker') {
                            environmentTargetId = this.ensureEmbeddedWorkspaceTarget(configService, {
                                name: selectedTarget.name || name || url,
                                url,
                            });
                        }
                    }
                    if (environmentTargetId && url && apiKey) {
                        configService.saveWorkspaceTargetApiKey(environmentTargetId, apiKey);
                    }
                    const workflowsPath = normalizeWorkflowsPath(String(payload.workflowsPath || payload.workflowDir || '').trim());
                    const syncFolder = normalizeWorkflowsPath(String(payload.syncFolder || '').trim());
                    const folderSync = typeof payload.folderSync === 'boolean' ? payload.folderSync : undefined;
                    const input = {
                        name,
                        environmentTarget: environmentTargetId,
                        projectId,
                        projectName,
                        workflowsPath: workflowsPath || undefined,
                        syncFolder: workflowsPath ? undefined : syncFolder || undefined,
                        folderSync,
                        customNodesPath: String(payload.customNodesPath || '').trim() || undefined,
                        description: String(payload.description || '').trim() || undefined,
                    };
                    const savedEnvironment = environmentId
                        ? configService.updateEnvironment(environmentId, input)
                        : configService.addEnvironment(input);
                    await clearLegacyWorkspaceSettings();
                    this._panel.webview.postMessage({ type: 'environmentSaved', environment: savedEnvironment });
                    this.notifySaved();
                    void this._configurationController.refresh('webview-save-environment', { force: true }).catch(() => undefined);
                    return;
                }
                case 'pinEnvironment': {
                    if (!workspaceRoot)
                        throw new Error('Open a workspace before pinning workspace environments.');
                    const environmentId = String(payload.environmentId || '').trim();
                    if (!environmentId)
                        throw new Error('Environment is required.');
                    this.queuePinEnvironment(environmentId);
                    return;
                }
                case 'deleteEnvironment': {
                    if (!workspaceRoot)
                        throw new Error('Open a workspace before deleting workspace environments.');
                    const environmentId = String(payload.environmentId || '').trim();
                    if (!environmentId)
                        throw new Error('Environment is required.');
                    const configService = new n8nac_1.ConfigService(workspaceRoot);
                    const environment = configService.getEnvironment(environmentId);
                    const confirmation = await vscode.window.showWarningMessage(`Remove workspace environment "${environment.name}"?`, { modal: true }, 'Remove');
                    if (confirmation !== 'Remove') {
                        this._panel.webview.postMessage({ type: 'cancelled' });
                        return;
                    }
                    configService.removeEnvironment(environmentId);
                    this._panel.webview.postMessage({ type: 'environmentDeleted', environmentId });
                    this.notifySaved();
                    void this._configurationController.refresh('webview-delete-environment', { force: true }).catch(() => undefined);
                    return;
                }
                case 'saveGlobalInstance':
                    const warnings = await this.saveGlobalInstance(payload, globalFacade);
                    await this._configurationController.refresh('webview-save-global-instance', { force: true });
                    this.notifySaved();
                    if (warnings.length) {
                        this._panel.webview.postMessage({ type: 'error', message: warnings.join('\n') });
                    }
                    return;
                case 'setGlobalActiveInstance': {
                    const instanceId = String(payload.instanceId || '').trim();
                    if (!instanceId)
                        throw new Error('Instance is required.');
                    await globalFacade.setGlobalActiveInstance(instanceId);
                    await this._configurationController.refresh('webview-set-global-active', { force: true });
                    this.notifySaved();
                    return;
                }
                case 'manageInstanceRuntime': {
                    const instanceId = String(payload.instanceId || '').trim();
                    const action = String(payload.action || '').trim();
                    if (!instanceId)
                        throw new Error('Instance is required.');
                    if (!['start', 'stop', 'restart'].includes(action))
                        throw new Error('Unsupported instance action.');
                    const actionLabel = action === 'start' ? 'Starting' : action === 'stop' ? 'Stopping' : 'Restarting';
                    await vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: `${actionLabel} n8n instance`,
                        cancellable: false,
                    }, async () => {
                        if (action === 'start')
                            await globalFacade.startInstance(instanceId);
                        if (action === 'stop')
                            await globalFacade.stopInstance(instanceId);
                        if (action === 'restart')
                            await globalFacade.restartInstance(instanceId);
                    });
                    await this._configurationController.refresh(`webview-${action}-instance`, { force: true });
                    this.notifySaved();
                    return;
                }
                case 'refreshPublicUrl': {
                    const instanceId = String(payload.instanceId || '').trim();
                    if (!instanceId)
                        throw new Error('Instance is required.');
                    const access = await vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: 'Refreshing public URL',
                        cancellable: false,
                    }, () => globalFacade.resolveInstanceAccess({
                        instanceId,
                        syncFolderDefault: 'workspace',
                        consumer: 'vscode',
                        mode: 'reconcile',
                        refreshPublicUrl: true,
                    }));
                    await this._configurationController.refresh('webview-refresh-public-url', { force: true });
                    this.notifySaved();
                    if (access.warnings.length) {
                        this._panel.webview.postMessage({ type: 'error', message: access.warnings.join('\n') });
                    }
                    return;
                }
                case 'showManagedCredentials': {
                    const instanceId = String(payload.instanceId || '').trim();
                    if (!instanceId)
                        throw new Error('Instance is required.');
                    const credentials = await globalFacade.getManagedOwnerCredentials(instanceId);
                    if (!credentials)
                        throw new Error('Managed owner credentials are not available for this instance.');
                    this._panel.webview.postMessage({ type: 'managedCredentials', credentials });
                    return;
                }
                case 'copyText': {
                    const value = String(payload.value || '');
                    if (!value)
                        return;
                    await vscode.env.clipboard.writeText(value);
                    this._panel.webview.postMessage({ type: 'copied' });
                    return;
                }
                case 'openExternal': {
                    const url = String(payload.url || '').trim();
                    if (!url)
                        return;
                    await vscode.env.openExternal(vscode.Uri.parse(url));
                    return;
                }
                case 'saveWorkspaceContext': {
                    if (!workspaceRoot)
                        throw new Error('Open a workspace before saving workspace n8n settings.');
                    if (new n8nac_1.ConfigService(workspaceRoot).getWorkspaceConfig().version === 4) {
                        throw new Error('This workspace uses environments. Pin or edit an environment instead of saving legacy workspace settings.');
                    }
                    const syncFolder = String(payload.syncFolder || '').trim();
                    await facade.writeWorkspaceOverrides({
                        version: 3,
                        activeInstanceId: String(payload.activeInstanceId || '').trim() || undefined,
                        syncFolder: syncFolder || undefined,
                        projectId: String(payload.projectId || '').trim() || undefined,
                        projectName: String(payload.projectName || '').trim() || undefined,
                        folderSync: Boolean(payload.folderSync),
                    }, workspaceRoot);
                    const clearedLegacySettings = await clearLegacyWorkspaceSettings();
                    await this._context.workspaceState.update('n8n.suppressSettingsChangedOnce', true);
                    await this._configurationController.refresh('webview-save-workspace-context', { force: true });
                    if (clearedLegacySettings.length > 0) {
                        void vscode.window.showInformationMessage(`n8n-as-code moved legacy VS Code workspace settings (${clearedLegacySettings.join(', ')}) into n8n-manager plus n8nac-config.json workspace overrides.`);
                    }
                    this.notifySaved();
                    return;
                }
                case 'deleteInstance': {
                    const instanceId = String(payload.instanceId || '').trim();
                    if (!instanceId)
                        throw new Error('Instance is required.');
                    const instanceName = String(payload.instanceName || instanceId).trim();
                    const confirmation = await vscode.window.showWarningMessage(`Delete global n8n instance "${instanceName}"?`, { modal: true }, 'Delete');
                    if (confirmation !== 'Delete') {
                        this._panel.webview.postMessage({ type: 'cancelled' });
                        return;
                    }
                    const workspaceConfig = workspaceRoot ? new n8nac_1.ConfigService(workspaceRoot).getWorkspaceConfig() : undefined;
                    const workspaceOverrides = workspaceRoot && workspaceConfig?.version !== 4 ? await facade.readWorkspaceOverrides(workspaceRoot) : undefined;
                    await globalFacade.deleteInstance(instanceId);
                    if (workspaceRoot && workspaceOverrides?.activeInstanceId === instanceId) {
                        await facade.writeWorkspaceOverrides({
                            ...workspaceOverrides,
                            activeInstanceId: undefined,
                        }, workspaceRoot);
                    }
                    this._panel.webview.postMessage({ type: 'instanceDeleted', instanceId });
                    this.notifySaved();
                    void this._configurationController.refresh('webview-delete-instance', { force: true }).catch(() => undefined);
                    return;
                }
                case 'openSettings':
                    await vscode.commands.executeCommand('n8n.openSettings');
                    return;
                case 'connectProvider': {
                    const provider = (0, agent_provider_service_js_1.normalizeAgentProviderId)(String(payload.provider || ''));
                    if (!provider)
                        throw new Error('Unsupported provider.');
                    const configured = await this._providerService.setupProvider(provider);
                    if (configured) {
                        await this._providerService.selectModel(provider);
                    }
                    await this.postInitialState();
                    this._panel.webview.postMessage({ type: 'activeTab', tab: 'agent-providers' });
                    this.notifySaved();
                    return;
                }
                case 'disconnectProvider': {
                    const provider = (0, agent_provider_service_js_1.normalizeAgentProviderId)(String(payload.provider || ''));
                    if (!provider)
                        throw new Error('Unsupported provider.');
                    await this._providerService.disconnectProvider(provider);
                    await this.postInitialState();
                    this._panel.webview.postMessage({ type: 'activeTab', tab: 'agent-providers' });
                    this.notifySaved();
                    return;
                }
            }
        }
        catch (error) {
            this._panel.webview.postMessage({
                type: 'error',
                message: error?.message || 'Unexpected error',
            });
            void this._configurationController.refresh('webview-error-refresh', { force: true }).catch(() => undefined);
        }
    }
    notifySaved() {
        void vscode.window.showInformationMessage('Settings saved.');
    }
    queuePinEnvironment(environmentId) {
        this._queuedPinEnvironmentId = environmentId;
        if (!this._pinEnvironmentTask) {
            this._pinEnvironmentTask = this.drainPinEnvironmentQueue()
                .catch((error) => {
                this._panel.webview.postMessage({ type: 'error', message: error?.message || 'Unable to pin environment.' });
            })
                .finally(() => {
                this._pinEnvironmentTask = undefined;
            });
        }
    }
    async drainPinEnvironmentQueue() {
        let pinned = false;
        while (this._queuedPinEnvironmentId) {
            const environmentId = this._queuedPinEnvironmentId;
            this._queuedPinEnvironmentId = undefined;
            const workspaceRoot = (0, state_detection_js_1.getWorkspaceRoot)();
            if (!workspaceRoot)
                throw new Error('Open a workspace before pinning workspace environments.');
            try {
                new n8nac_1.ConfigService(workspaceRoot).pinEnvironment(environmentId);
                this._panel.webview.postMessage({ type: 'environmentPinned', environmentId });
                pinned = true;
            }
            catch (error) {
                if (!this._queuedPinEnvironmentId)
                    throw error;
            }
        }
        if (pinned) {
            this.notifySaved();
            void this._configurationController.refresh('webview-pin-environment', { force: true }).catch(() => undefined);
        }
    }
    async migrateWorkspaceConfiguration(workspaceRoot) {
        const result = await (0, workspace_migration_runner_js_1.runWorkspaceMigrationFromVscode)(this._context, workspaceRoot);
        if (result.outcome === 'not-needed') {
            this.notifySaved();
            await this._configurationController.refresh('webview-migration-not-needed', { force: true });
            return;
        }
        if (result.outcome === 'cancelled') {
            this._panel.webview.postMessage({ type: 'cancelled' });
            return;
        }
        const snapshot = await this._configurationController.refresh('webview-run-migration', { force: true });
        await this.postInitialState(snapshot);
        this._panel.webview.postMessage({
            type: 'migrationCompleted',
            backupPath: result.report.backupPath || '',
            migratedCount: result.report.migratedEnvironmentIds?.length || 0,
            deletedCount: result.report.deletedGlobalInstanceIds?.length || 0,
        });
    }
    ensureEmbeddedWorkspaceTarget(configService, input) {
        const url = normalizeHost(input.url);
        const externalInstance = configService.listInstanceTargets().find((target) => {
            return target.kind === 'external-instance' && normalizeHost(target.url) === url;
        });
        if (externalInstance)
            return externalInstance.id;
        const existingNames = new Set(configService.listInstanceTargets().map((target) => target.name.toLowerCase()));
        const baseName = input.name || url;
        let name = baseName;
        let counter = 2;
        while (existingNames.has(name.toLowerCase())) {
            name = `${baseName} ${counter}`;
            counter += 1;
        }
        return configService.addInstanceTarget({ name, url }).id;
    }
    async saveGlobalInstance(payload, facade) {
        const mode = String(payload.mode || 'existing').trim();
        const host = normalizeHost(String(payload.host || ''));
        const apiKey = String(payload.apiKey || '').trim();
        const instanceId = String(payload.instanceId || '').trim() || undefined;
        const instanceName = String(payload.instanceName || '').trim() || undefined;
        const setActive = Boolean(payload.setActive);
        const workspaceRoot = (0, state_detection_js_1.getWorkspaceRoot)();
        if (mode === 'managed-local-docker') {
            const previousActive = await facade.getGlobalActiveInstance();
            const instance = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Preparing managed local n8n',
                cancellable: false,
            }, () => facade.setup({
                mode: 'managed-local',
                instanceId,
                instanceName,
                tunnel: Boolean(payload.tunnel),
            }));
            if (workspaceRoot && instance.baseUrl) {
                await new n8nac_1.ConfigService(workspaceRoot).getOrCreateInstanceIdentifier(instance.baseUrl, instance.id).catch(() => undefined);
            }
            if (instanceName) {
                await facade.upsertInstance({ id: instance.id, name: instanceName, publicUrlEnabled: Boolean(payload.tunnel) }, { setActive });
            }
            if (!setActive && previousActive?.id && previousActive.id !== instance.id) {
                await facade.setGlobalActiveInstance(previousActive.id);
            }
            return Array.isArray(instance.warnings) ? instance.warnings : [];
        }
        if (mode === 'existing' && !instanceId && (!host || !apiKey)) {
            throw new Error('Host and API key are required for a new externalInstance n8n instance.');
        }
        const identifierResolution = host && apiKey
            ? await (0, n8nac_1.resolveInstanceIdentifier)({ host, apiKey })
            : undefined;
        await facade.upsertInstance({
            id: instanceId,
            name: instanceName,
            mode: mode === 'generation-only' ? 'generation-only' : 'existing',
            baseUrl: host || undefined,
            apiKey: apiKey || undefined,
            instanceIdentifier: identifierResolution?.identifier,
        }, { setActive });
        return [];
    }
    hasActiveManagedSetup() {
        return [...this._managedSetupJobs.values()].some((job) => job.status === 'installing' || job.status === 'cancelling');
    }
    async createManagedInstance(payload, facade) {
        if (this.hasActiveManagedSetup()) {
            throw new Error('Another managed instance is installing. Wait for it to finish or cancel it.');
        }
        const instanceId = normalizeManagedInstanceId(payload.instanceId || fallbackManagedInstanceId());
        const instanceName = normalizeManagedInstanceName(payload.instanceName);
        const tunnel = Boolean(payload.tunnel);
        const returnToEnvironmentForm = Boolean(payload.returnToEnvironmentForm);
        const returnToEnvironmentDraftId = String(payload.returnToEnvironmentDraftId || '').trim() || undefined;
        const placeholder = {
            id: instanceId,
            name: instanceName,
            mode: 'managed-local-docker',
            publicUrlEnabled: tunnel,
            metadata: WORKSPACE_ENVIRONMENT_MODEL_METADATA,
        };
        await facade.upsertInstance(placeholder, { setActive: false });
        const job = {
            instanceId,
            instanceName,
            status: 'installing',
            message: 'Managed instance is installing.',
            returnToEnvironmentForm,
            returnToEnvironmentDraftId,
            startedAt: Date.now(),
        };
        this._managedSetupJobs.set(instanceId, job);
        this._panel.webview.postMessage({ type: 'managedInstanceCreated', instanceId, instanceName, returnToEnvironmentForm, returnToEnvironmentDraftId });
        this._panel.webview.postMessage({ type: 'setupJob', job: this.serializeSetupJob(job) });
        void this.runManagedSetupJob(job, { tunnel });
    }
    async runManagedSetupJob(job, options) {
        const facade = (0, manager_adapter_1.createN8nManagerFacade)({});
        const previousActive = await facade.getGlobalActiveInstance().catch(() => undefined);
        try {
            await this.postSetupJob(job);
            const instance = await facade.setup({
                mode: 'managed-local',
                instanceId: job.instanceId,
                instanceName: job.instanceName,
                tunnel: options.tunnel,
            });
            if (job.cancellationRequested) {
                job.status = 'cancelled';
                job.message = 'Setup was cancelled.';
                job.completedAt = Date.now();
                await facade.deleteInstance(job.instanceId).catch(() => undefined);
                await this._configurationController.refresh('webview-managed-setup-cancelled', { force: true });
                await this.postSetupJob(job);
                return;
            }
            if (job.instanceName) {
                const update = {
                    id: instance.id,
                    name: job.instanceName,
                    publicUrlEnabled: options.tunnel,
                    metadata: WORKSPACE_ENVIRONMENT_MODEL_METADATA,
                };
                await facade.upsertInstance(update, { setActive: false });
            }
            if (previousActive?.id && previousActive.id !== instance.id) {
                await facade.setGlobalActiveInstance(previousActive.id).catch(() => undefined);
            }
            job.status = 'succeeded';
            job.message = 'Managed instance is ready.';
            job.completedAt = Date.now();
            const snapshot = await this._configurationController.refresh('webview-managed-setup-succeeded', { force: true });
            await this.postInitialState(snapshot);
            await this.postSetupJob(job);
            if (Array.isArray(instance.warnings) && instance.warnings.length) {
                this._panel.webview.postMessage({ type: 'error', message: instance.warnings.join('\n') });
            }
        }
        catch (error) {
            job.status = job.cancellationRequested ? 'cancelled' : 'failed';
            job.error = error?.message || 'Managed instance setup failed.';
            job.message = job.status === 'cancelled' ? 'Setup was cancelled.' : job.error;
            job.completedAt = Date.now();
            const failedPlaceholder = {
                id: job.instanceId,
                name: job.instanceName,
                mode: 'managed-local-docker',
                publicUrlEnabled: options.tunnel,
                metadata: WORKSPACE_ENVIRONMENT_MODEL_METADATA,
            };
            await facade.upsertInstance(failedPlaceholder, { setActive: false }).catch(() => undefined);
            await this._configurationController.refresh('webview-managed-setup-failed', { force: true }).catch(() => undefined);
            await this.postSetupJob(job);
        }
    }
    async postSetupJob(job) {
        this._panel.webview.postMessage({ type: 'setupJob', job: this.serializeSetupJob(job) });
        this.scheduleManagedSetupJobCleanup(job);
    }
    scheduleManagedSetupJobCleanup(job) {
        if (!job.completedAt || !['succeeded', 'failed', 'cancelled'].includes(job.status))
            return;
        const existingTimer = this._managedSetupJobCleanupTimers.get(job.instanceId);
        if (existingTimer)
            clearTimeout(existingTimer);
        const timer = setTimeout(() => {
            const current = this._managedSetupJobs.get(job.instanceId);
            if (current && current.completedAt === job.completedAt && ['succeeded', 'failed', 'cancelled'].includes(current.status)) {
                this._managedSetupJobs.delete(job.instanceId);
                void this.postInitialState().catch(() => undefined);
            }
            this._managedSetupJobCleanupTimers.delete(job.instanceId);
        }, 5 * 60 * 1000);
        this._managedSetupJobCleanupTimers.set(job.instanceId, timer);
    }
    serializeSetupJob(job) {
        const { cancellationRequested: _cancellationRequested, ...serialized } = job;
        return serialized;
    }
    async postInitialState(snapshot) {
        const stateVersion = ++this._stateVersion;
        const currentSnapshot = snapshot ?? this._configurationController.getSnapshot()
            ?? await this._configurationController.refresh('webview-open', { force: true });
        const workspaceRoot = (0, state_detection_js_1.getWorkspaceRoot)();
        const facade = (0, manager_adapter_1.createN8nManagerFacade)({ workspaceRoot });
        const instanceFacade = (0, manager_adapter_1.createN8nManagerFacade)({});
        const globalConfig = currentSnapshot.global;
        const workspaceOverrides = currentSnapshot.workspace;
        const effectiveContext = currentSnapshot.effective;
        const instances = await Promise.all(globalConfig.instances.map(async (instance) => {
            try {
                const runtime = await instanceFacade.status({ instanceId: instance.id });
                const access = await instanceFacade.resolveInstanceAccess({
                    instanceId: instance.id,
                    mode: 'observe',
                });
                const displayUrl = access.authUrl || access.publicN8nUrl || (access.publicUrlEnabled ? '' : access.apiBaseUrl || '');
                return {
                    ...instance,
                    host: displayUrl,
                    displayUrl,
                    authBridgePublicUrl: access.authUrl,
                    verificationStatus: instance.verification?.status || 'unverified',
                    verificationLabel: instance.verification?.status === 'verified'
                        ? 'Verified'
                        : instance.verification?.status === 'failed'
                            ? 'Verification failed'
                            : 'Not verified yet',
                    runtimeStatus: runtime.status,
                    runtimeReady: 'ready' in runtime ? runtime.ready : runtime.status === 'ready',
                    ownerCredentialsAvailable: Boolean(runtime.instance?.ownerCredentialsAvailable),
                    runtimeBlockedCode: 'blocked' in runtime ? runtime.blocked?.code : undefined,
                    runtimeBlockedMessage: 'blocked' in runtime ? runtime.blocked?.message : undefined,
                    runtimeWarnings: access.warnings.length ? access.warnings : ('warnings' in runtime ? runtime.warnings : undefined),
                    tunnelRunning: access.tunnel?.running,
                    tunnelPublicUrl: access.publicN8nUrl || instance.tunnelPublicUrl,
                    access,
                };
            }
            catch (error) {
                return {
                    ...instance,
                    host: instance.tunnelPublicUrl || instance.baseUrl || '',
                    verificationStatus: instance.verification?.status || 'unverified',
                    verificationLabel: instance.verification?.status === 'verified'
                        ? 'Verified'
                        : instance.verification?.status === 'failed'
                            ? 'Verification failed'
                            : 'Not verified yet',
                    runtimeStatus: 'unknown',
                    runtimeReady: false,
                    runtimeBlockedMessage: error?.message || 'Runtime status unavailable.',
                };
            }
        }));
        this._panel.webview.postMessage({
            type: 'init',
            stateVersion,
            global: {
                activeInstanceId: globalConfig.activeInstanceId || '',
                defaultSyncFolder: globalConfig.defaultSyncFolder,
                instances,
            },
            workspace: workspaceOverrides,
            migration: currentSnapshot.migration,
            effective: effectiveContext ? {
                activeInstanceId: effectiveContext.activeInstanceId,
                activeInstanceName: effectiveContext.activeInstanceName,
                host: effectiveContext.host,
                apiBaseUrl: effectiveContext.apiBaseUrl ?? effectiveContext.host,
                publicBaseUrl: effectiveContext.publicBaseUrl || '',
                workflowsPath: effectiveContext.workflowsPath || effectiveContext.workflowDir || effectiveContext.syncFolder,
                syncFolder: effectiveContext.workflowsPath || effectiveContext.workflowDir || effectiveContext.syncFolder,
                projectId: effectiveContext.projectId || '',
                projectName: effectiveContext.projectName || '',
                sources: effectiveContext.sources,
            } : undefined,
            providers: await this._providerService.listProviderConnectionStates(),
            setupJobs: Object.fromEntries([...this._managedSetupJobs.entries()].map(([id, job]) => [id, this.serializeSetupJob(job)])),
            about: {
                extensionVersion: String(this._context.extension.packageJSON?.version || ''),
                cliVersion: String(this._context.extension.packageJSON?.dependencies?.n8nac || ''),
            },
        });
        if (this._initialTab) {
            this._panel.webview.postMessage({ type: 'activeTab', tab: this._initialTab });
            this._initialTab = undefined;
        }
    }
    getHtmlForWebview() {
        const scriptUri = this._panel.webview.asWebviewUri(vscode.Uri.joinPath(this._context.extensionUri, 'out', 'settings-webview.js'));
        return (0, configuration_webview_html_js_1.getConfigurationHtml)(getNonce(), scriptUri.toString());
    }
    getWebviewOptions() {
        return ConfigurationWebview.getWebviewOptions(this._context);
    }
    static getWebviewOptions(context) {
        return {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'out')],
        };
    }
}
exports.ConfigurationWebview = ConfigurationWebview;
//# sourceMappingURL=configuration-webview.js.map