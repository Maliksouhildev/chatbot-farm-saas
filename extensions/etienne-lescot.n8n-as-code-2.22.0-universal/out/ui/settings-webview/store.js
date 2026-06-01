"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = exports.actions = void 0;
exports.createSettingsWebviewStore = createSettingsWebviewStore;
const toolkit_1 = require("@reduxjs/toolkit");
function stateVersion(payload) {
    const version = Number(payload?.stateVersion || 0);
    return Number.isFinite(version) ? version : 0;
}
const serverSlice = (0, toolkit_1.createSlice)({
    name: 'server',
    initialState: null,
    reducers: {
        snapshotReceived: (state, action) => {
            const incomingVersion = stateVersion(action.payload);
            const currentVersion = stateVersion(state);
            if (incomingVersion && currentVersion && incomingVersion <= currentVersion)
                return state;
            return action.payload || null;
        },
        managedInstancePlaceholderReceived: (state, action) => {
            const nextState = state || { global: { instances: [] } };
            const global = nextState.global || (nextState.global = { instances: [] });
            const instances = Array.isArray(global.instances) ? global.instances : (global.instances = []);
            if (instances.some((instance) => instance.id === action.payload.instanceId))
                return nextState;
            instances.push({
                id: action.payload.instanceId,
                name: action.payload.instanceName || action.payload.instanceId,
                mode: 'managed-local-docker',
                publicUrlEnabled: true,
                runtimeStatus: 'installing',
            });
            return nextState;
        },
        environmentPinned: (state, action) => {
            if (!state?.workspace)
                return state;
            state.workspace.activeEnvironmentId = action.payload;
            return state;
        },
        environmentDeleted: (state, action) => {
            if (!state?.workspace)
                return state;
            const environments = Array.isArray(state.workspace.environments) ? state.workspace.environments : [];
            state.workspace.environments = environments.filter((environment) => environment.id !== action.payload);
            if (state.workspace.activeEnvironmentId === action.payload)
                state.workspace.activeEnvironmentId = '';
            return state;
        },
        environmentSaved: (state, action) => {
            if (!state?.workspace || !action.payload?.id)
                return state;
            const environments = Array.isArray(state.workspace.environments) ? state.workspace.environments : (state.workspace.environments = []);
            const index = environments.findIndex((environment) => environment.id === action.payload.id);
            if (index >= 0)
                environments[index] = { ...environments[index], ...action.payload };
            else
                environments.push(action.payload);
            state.workspace.activeEnvironmentId = state.workspace.activeEnvironmentId || action.payload.id;
            return state;
        },
        instanceDeleted: (state, action) => {
            if (!state?.global)
                return state;
            const instances = Array.isArray(state.global.instances) ? state.global.instances : [];
            state.global.instances = instances.filter((instance) => instance.id !== action.payload);
            return state;
        },
    },
});
const jobsSlice = (0, toolkit_1.createSlice)({
    name: 'jobs',
    initialState: {},
    reducers: {
        jobsReceived: (_state, action) => action.payload || {},
        jobReceived: (state, action) => {
            state[action.payload.instanceId] = action.payload;
        },
    },
});
const uiSlice = (0, toolkit_1.createSlice)({
    name: 'ui',
    initialState: { activeTab: 'environments', lastStateVersion: 0, pendingEnvironmentSaves: {}, pendingManagedCreate: false, pendingInstanceActions: {}, pendingProviderActions: {} },
    reducers: {
        tabSelected: (state, action) => { state.activeTab = action.payload; },
        modalOpened: (state, action) => {
            state.modal = action.payload;
            state.notice = undefined;
            state.credentials = undefined;
        },
        modalClosed: (state) => { state.modal = undefined; state.credentials = undefined; },
        noticeShown: (state, action) => {
            state.notice = action.payload;
            if (action.payload?.tone === 'error') {
                state.pendingActiveEnvironmentId = undefined;
                state.pendingEnvironmentSaves = {};
                state.pendingManagedCreate = false;
                state.pendingInstanceActions = {};
                state.pendingProviderActions = {};
            }
        },
        environmentActivationRequested: (state, action) => { state.pendingActiveEnvironmentId = action.payload; },
        environmentSaveRequested: (state, action) => { state.pendingEnvironmentSaves[action.payload] = true; },
        managedCreateRequested: (state) => { state.pendingManagedCreate = true; },
        instanceActionRequested: (state, action) => { state.pendingInstanceActions[action.payload.instanceId] = action.payload.action; },
        instanceActionCompleted: (state, action) => { delete state.pendingInstanceActions[action.payload]; },
        providerActionRequested: (state, action) => { state.pendingProviderActions[action.payload.provider] = action.payload.action; },
        providerActionCompleted: (state, action) => { delete state.pendingProviderActions[action.payload]; },
        credentialsReceived: (state, action) => { state.credentials = action.payload; },
    },
    extraReducers: (builder) => {
        builder.addCase(serverSlice.actions.snapshotReceived, (state, action) => {
            const incomingVersion = stateVersion(action.payload);
            if (incomingVersion && incomingVersion <= state.lastStateVersion)
                return;
            if (incomingVersion)
                state.lastStateVersion = incomingVersion;
            const activeEnvironmentId = String(action.payload?.workspace?.activeEnvironmentId || '');
            if (activeEnvironmentId && activeEnvironmentId === state.pendingActiveEnvironmentId) {
                state.pendingActiveEnvironmentId = undefined;
            }
            const environments = Array.isArray(action.payload?.workspace?.environments) ? action.payload.workspace.environments : [];
            if (state.pendingActiveEnvironmentId && environments.length && !environments.some((environment) => environment?.id === state.pendingActiveEnvironmentId)) {
                state.pendingActiveEnvironmentId = undefined;
            }
        });
        builder.addCase(serverSlice.actions.environmentPinned, (state, action) => {
            if (state.pendingActiveEnvironmentId === action.payload)
                state.pendingActiveEnvironmentId = undefined;
        });
        builder.addCase(serverSlice.actions.environmentDeleted, (state, action) => {
            if (state.pendingActiveEnvironmentId === action.payload)
                state.pendingActiveEnvironmentId = undefined;
        });
        builder.addCase(serverSlice.actions.environmentSaved, (state, action) => {
            delete state.pendingEnvironmentSaves[action.payload?.id || ''];
            delete state.pendingEnvironmentSaves.new;
        });
        builder.addCase(serverSlice.actions.instanceDeleted, (state, action) => {
            delete state.pendingInstanceActions[action.payload];
            if (state.modal?.kind === 'managed-detail' && state.modal.instanceId === action.payload)
                state.modal = undefined;
        });
    },
});
function blankEnvironmentDraft(id, environment) {
    return {
        id,
        environmentId: environment?.id,
        name: environment?.name || '',
        instanceChoice: environment?.managedInstanceId ? `managed:${environment.managedInstanceId}` : environment?.environmentTargetId ? `target:${environment.environmentTargetId}` : 'new-connected',
        instanceId: environment?.managedInstanceId,
        environmentTargetId: environment?.environmentTargetId,
        url: environment?.url || '',
        apiKey: '',
        apiKeyAvailable: environment?.apiKeyAvailable,
        projectId: environment?.projectId || '',
        projectName: environment?.projectName || '',
        workflowsPath: environment?.workflowsPath || environment?.workflowDir || environment?.syncFolder || defaultWorkflowsPath(environment?.name || ''),
        folderSync: environment?.folderSync !== false,
        customNodesPath: environment?.customNodesPath || '',
        description: environment?.description || '',
        dirty: false,
    };
}
const draftsSlice = (0, toolkit_1.createSlice)({
    name: 'drafts',
    initialState: { environment: {}, managed: { name: 'managed', tunnel: true } },
    reducers: {
        environmentDraftOpened: (state, action) => {
            const existing = state.environment[action.payload.id];
            if (!existing || !existing.dirty)
                state.environment[action.payload.id] = blankEnvironmentDraft(action.payload.id, action.payload.environment);
        },
        environmentDraftPatched: (state, action) => {
            const existing = state.environment[action.payload.id] || blankEnvironmentDraft(action.payload.id);
            const patch = { ...action.payload.patch };
            if (patch.name !== undefined && patch.workflowsPath === undefined && !existing.environmentId && existing.workflowsPath === defaultWorkflowsPath(existing.name)) {
                patch.workflowsPath = defaultWorkflowsPath(patch.name);
            }
            state.environment[action.payload.id] = { ...existing, ...patch, dirty: true };
        },
        environmentDraftProjectsReceived: (state, action) => {
            const existing = state.environment[action.payload.id];
            if (!existing)
                return;
            if (action.payload.requestKey && existing.projectRequestKey && action.payload.requestKey !== existing.projectRequestKey)
                return;
            existing.projectsLoading = false;
            existing.projects = action.payload.projects || [];
            existing.projectError = action.payload.error;
            if (action.payload.error) {
                existing.projectId = 'personal';
                existing.projectName = 'Personal';
                return;
            }
            const selectedProjectId = action.payload.selectedProjectId || existing.projectId;
            const selectedProject = existing.projects.find((project) => project.id === selectedProjectId) || existing.projects[0];
            existing.projectId = selectedProject?.id || 'personal';
            existing.projectName = action.payload.selectedProjectName || selectedProject?.name || 'Personal';
        },
        environmentDraftProjectsLoading: (state, action) => {
            const existing = state.environment[action.payload.id];
            if (!existing)
                return;
            existing.projectsLoading = true;
            existing.projectError = undefined;
            existing.projectRequestKey = action.payload.requestKey;
        },
        environmentDraftClosed: (state, action) => { delete state.environment[action.payload.id]; },
        managedDraftPatched: (state, action) => { state.managed = { ...state.managed, ...action.payload }; },
        managedDraftReset: (state) => { state.managed = { name: 'managed', tunnel: true }; },
        managedInstanceSelectedForEnvironment: (state, action) => {
            const draft = state.environment[action.payload.draftId];
            if (!draft)
                return;
            draft.instanceChoice = `managed:${action.payload.instanceId}`;
            draft.instanceId = action.payload.instanceId;
            draft.environmentTargetId = undefined;
            draft.url = '';
            draft.projectId = 'personal';
            draft.projectName = 'Personal';
            draft.dirty = true;
        },
    },
});
function defaultWorkflowsPath(name) {
    const slug = String(name || 'environment')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        || 'environment';
    return `workflows/${slug}`;
}
exports.actions = {
    ...serverSlice.actions,
    ...jobsSlice.actions,
    ...uiSlice.actions,
    ...draftsSlice.actions,
};
const reducer = {
    server: serverSlice.reducer,
    jobs: jobsSlice.reducer,
    ui: uiSlice.reducer,
    drafts: draftsSlice.reducer,
};
function createSettingsWebviewStore() {
    return (0, toolkit_1.configureStore)({ reducer });
}
exports.store = createSettingsWebviewStore();
//# sourceMappingURL=store.js.map