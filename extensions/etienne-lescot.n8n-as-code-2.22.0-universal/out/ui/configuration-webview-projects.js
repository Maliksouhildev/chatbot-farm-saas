"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadProjectsForConfigurationWebview = loadProjectsForConfigurationWebview;
const n8nac_1 = require("n8nac");
const project_display_js_1 = require("../utils/project-display.js");
const PERSONAL_PROJECT = {
    id: 'personal',
    name: 'Personal',
    type: 'personal',
    detail: 'Type: personal | ID: personal',
    displayName: 'Personal',
};
function toUiProject(project) {
    const name = project.name || project.title || project.displayName || project.label || '';
    const displayable = { id: project.id, name, type: project.type };
    return {
        id: project.id,
        name: (0, project_display_js_1.getCanonicalProjectName)(displayable),
        type: project.type,
        detail: (0, project_display_js_1.getProjectDetail)(displayable),
        displayName: (0, project_display_js_1.getProjectDisplayLabel)(displayable),
    };
}
function dedupeUiProjects(projects) {
    const byId = new Map();
    for (const project of projects) {
        if (!project.id)
            continue;
        const externalInstance = byId.get(project.id);
        if (!externalInstance || (!externalInstance.name && project.name) || externalInstance.id === 'personal') {
            byId.set(project.id, project);
        }
    }
    return [...byId.values()];
}
async function loadProjectsFromApi(host, apiKey) {
    const client = new n8nac_1.N8nApiClient({ host, apiKey });
    await client.assertApiAccess();
    return (await client.getProjects()).map(toUiProject);
}
function normalizeHost(host) {
    const trimmed = (host || '').trim();
    return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}
function envVarSlug(value) {
    return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}
function readWorkspaceTargetApiKey(targetId, targetName) {
    const candidates = [
        `N8NAC_TARGET_${envVarSlug(targetId)}_API_KEY`,
        `N8NAC_TARGET_${envVarSlug(targetName)}_API_KEY`,
    ];
    for (const key of candidates) {
        const value = process.env[key]?.trim().replace(/^["']|["']$/g, '');
        if (value)
            return value;
    }
    return undefined;
}
async function loadProjectsForConfigurationWebview(payload, options) {
    const scope = String(payload.scope || 'workspace');
    const requestId = Number(payload.requestId || 0);
    const requestKey = String(payload.requestKey || '');
    const selectedProjectId = String(payload.projectId || '');
    const selectedProjectName = String(payload.projectName || '');
    const postProjectsLoaded = (projects, fallbackProjectId = '') => ({
        type: 'projectsLoaded',
        scope,
        requestId,
        requestKey,
        projects: dedupeUiProjects(projects),
        selectedProjectId: selectedProjectId || fallbackProjectId,
        selectedProjectName: selectedProjectName || (fallbackProjectId === 'personal' ? 'Personal' : ''),
    });
    let instanceId = String(payload.instanceId || '').trim() || undefined;
    const environmentTargetId = String(payload.environmentTargetId || '').trim();
    if (!instanceId && options.workspaceRoot && environmentTargetId) {
        const configService = new n8nac_1.ConfigService(options.workspaceRoot);
        const environmentId = String(payload.environmentId || '').trim();
        const environment = environmentId ? configService.getEnvironment(environmentId) : undefined;
        const targetChanged = Boolean(environment && environmentTargetId && environment.environmentTargetId !== environmentTargetId);
        const target = configService.getInstanceTarget(environmentTargetId || environment?.environmentTargetId || '');
        if (environmentId && !targetChanged) {
            const resolvedEnvironment = await configService.prepareEnvironment(environmentId);
            if (!resolvedEnvironment.apiKey)
                throw new Error(`Environment "${resolvedEnvironment.environmentName}" needs an API key before projects can be loaded.`);
            return postProjectsLoaded(await loadProjectsFromApi(resolvedEnvironment.host, resolvedEnvironment.apiKey));
        }
        if (target.kind === 'managed-instance')
            instanceId = target.managedInstanceId;
        if (target.kind === 'external-instance') {
            const apiKey = readWorkspaceTargetApiKey(target.id, target.name) || configService.getWorkspaceTargetApiKey(target.id) || configService.getApiKey(target.url);
            if (!apiKey) {
                if (scope === 'environment')
                    throw new Error('Missing API key. Add an API key before selecting project or sync settings.');
                return postProjectsLoaded([PERSONAL_PROJECT], 'personal');
            }
            return postProjectsLoaded(await loadProjectsFromApi(target.url, apiKey));
        }
    }
    const host = instanceId ? '' : normalizeHost(String(payload.host || ''));
    const apiKey = String(payload.apiKey || '').trim();
    if (host) {
        if (!apiKey) {
            if (scope === 'environment')
                throw new Error('Missing API key. Add an API key before selecting project or sync settings.');
            return postProjectsLoaded([PERSONAL_PROJECT], 'personal');
        }
        return postProjectsLoaded(await loadProjectsFromApi(host, apiKey));
    }
    const projectFacade = scope === 'environment' && instanceId
        ? options.globalFacade
        : options.workspaceFacade;
    const uiProjects = (await projectFacade.listProjects({
        workspaceRoot: scope === 'environment' && instanceId ? undefined : options.workspaceRoot,
        instanceId,
        syncFolderDefault: 'workspace',
        consumer: 'vscode',
        autoStart: true,
    })).map(toUiProject);
    return postProjectsLoaded(uiProjects);
}
//# sourceMappingURL=configuration-webview-projects.js.map