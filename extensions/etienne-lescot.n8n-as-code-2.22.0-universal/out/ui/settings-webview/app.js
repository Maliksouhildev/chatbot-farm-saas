"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const client_1 = require("react-dom/client");
const react_redux_1 = require("react-redux");
const store_js_1 = require("./store.js");
const settings_view_model_js_1 = require("../settings-view-model.js");
const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : { postMessage: (message) => console.log(message) };
const post = (message) => vscode.postMessage(message);
function useAppDispatch() { return (0, react_redux_1.useDispatch)(); }
function server(state) { return state.server || {}; }
function instances(state) { return server(state).global?.instances || []; }
function workspace(state) { return server(state).workspace || {}; }
function environments(state) { return workspace(state).environments || []; }
function targets(state) { return workspace(state).environmentTargets || []; }
function setupActive(state) { return Object.values(state.jobs).some((job) => job.status === 'installing' || job.status === 'cancelling'); }
function App() {
    const dispatch = useAppDispatch();
    const activeTab = (0, react_redux_1.useSelector)((state) => state.ui.activeTab);
    const notice = (0, react_redux_1.useSelector)((state) => state.ui.notice);
    (0, react_1.useEffect)(() => {
        const listener = (event) => {
            const message = event.data || {};
            if (message.type === 'init') {
                dispatch(store_js_1.actions.snapshotReceived(message));
                dispatch(store_js_1.actions.jobsReceived(message.setupJobs));
            }
            if (message.type === 'activeTab')
                dispatch(store_js_1.actions.tabSelected(normalizeTab(message.tab)));
            if (message.type === 'environmentPinned')
                dispatch(store_js_1.actions.environmentPinned(String(message.environmentId || '')));
            if (message.type === 'environmentDeleted')
                dispatch(store_js_1.actions.environmentDeleted(String(message.environmentId || '')));
            if (message.type === 'instanceDeleted')
                dispatch(store_js_1.actions.instanceDeleted(String(message.instanceId || '')));
            if (message.type === 'environmentSaved') {
                const savedEnvironment = message.environment || {};
                dispatch(store_js_1.actions.environmentSaved(savedEnvironment));
                dispatch(store_js_1.actions.environmentDraftClosed({ id: String(savedEnvironment.id || 'new') }));
                dispatch(store_js_1.actions.environmentDraftClosed({ id: 'new' }));
                dispatch(store_js_1.actions.modalClosed());
            }
            if (message.type === 'setupJob')
                dispatch(store_js_1.actions.jobReceived(message.job));
            if (message.type === 'managedInstanceCreated') {
                dispatch(store_js_1.actions.managedInstancePlaceholderReceived({ instanceId: message.instanceId, instanceName: message.instanceName }));
                dispatch(store_js_1.actions.jobReceived({ instanceId: message.instanceId, instanceName: message.instanceName, status: 'installing', returnToEnvironmentForm: Boolean(message.returnToEnvironmentForm) }));
                if (message.returnToEnvironmentForm) {
                    const returnDraftId = String(message.returnToEnvironmentDraftId || 'new');
                    dispatch(store_js_1.actions.managedInstanceSelectedForEnvironment({ draftId: returnDraftId, instanceId: message.instanceId }));
                    dispatch(store_js_1.actions.modalOpened({ kind: 'environment', environmentId: returnDraftId === 'new' ? undefined : returnDraftId }));
                }
                else {
                    dispatch(store_js_1.actions.tabSelected('managed-instances'));
                }
            }
            if (message.type === 'projectsLoaded')
                dispatch(store_js_1.actions.environmentDraftProjectsReceived({ id: String(message.draftId || 'new'), requestKey: message.requestKey, projects: message.projects || [], selectedProjectId: message.selectedProjectId, selectedProjectName: message.selectedProjectName }));
            if (message.type === 'projectsError')
                dispatch(store_js_1.actions.environmentDraftProjectsReceived({ id: String(message.draftId || 'new'), requestKey: message.requestKey, error: message.message || 'Unable to load projects.' }));
            if (message.type === 'managedCredentials')
                dispatch(store_js_1.actions.credentialsReceived(message.credentials));
            if (message.type === 'error')
                dispatch(store_js_1.actions.noticeShown({ tone: 'error', message: message.message || 'Unexpected error' }));
            if (message.type === 'migrationCompleted')
                post({ type: 'refreshState' });
            if (message.type === 'saved')
                return;
        };
        window.addEventListener('message', listener);
        post({ type: 'refreshState' });
        return () => window.removeEventListener('message', listener);
    }, [dispatch]);
    return (0, jsx_runtime_1.jsxs)("div", { className: "settings-shell", children: [(0, jsx_runtime_1.jsxs)("aside", { className: "sidebar", children: [(0, jsx_runtime_1.jsx)("div", { className: "sidebar-title", children: "n8n settings" }), (0, jsx_runtime_1.jsx)(Tab, { id: "environments", label: "n8n environments", active: activeTab }), (0, jsx_runtime_1.jsx)(Tab, { id: "managed-instances", label: "managed instances", active: activeTab }), (0, jsx_runtime_1.jsx)(Tab, { id: "agent-providers", label: "Agent providers", active: activeTab }), (0, jsx_runtime_1.jsx)(Tab, { id: "about", label: "About", active: activeTab })] }), (0, jsx_runtime_1.jsxs)("main", { className: "page", children: [notice?.tone === 'error' ? (0, jsx_runtime_1.jsx)("div", { className: "inline-message notice error", children: notice.message }) : null, (0, jsx_runtime_1.jsx)(MigrationBanner, {}), activeTab === 'environments' ? (0, jsx_runtime_1.jsx)(EnvironmentsTab, {}) : null, activeTab === 'managed-instances' ? (0, jsx_runtime_1.jsx)(ManagedInstancesTab, {}) : null, activeTab === 'agent-providers' ? (0, jsx_runtime_1.jsx)(AgentProvidersTab, {}) : null, activeTab === 'about' ? (0, jsx_runtime_1.jsx)(AboutTab, {}) : null, (0, jsx_runtime_1.jsx)(ActiveModal, {})] })] });
}
function MigrationBanner() {
    const migration = (0, react_redux_1.useSelector)((state) => server(state).migration);
    if (!migration?.required)
        return null;
    const operations = Array.isArray(migration.operations) ? migration.operations : [];
    const details = operations.map((operation) => {
        const count = Number(operation.instanceCount || 0);
        return count ? `${operation.id} (${count})` : operation.id;
    }).filter(Boolean).join(', ');
    return (0, jsx_runtime_1.jsxs)("section", { className: "inline-message migration-banner", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { children: "Migration required" }), (0, jsx_runtime_1.jsxs)("p", { className: "subtle", children: ["This workspace configuration needs to be migrated before it is fully up to date", details ? `: ${details}` : '.'] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => post({ type: 'migrateWorkspaceConfiguration' }), children: "Run migration" })] });
}
function normalizeTab(tab) {
    if (tab === 'agent-providers')
        return 'agent-providers';
    if (tab === 'managed-instances')
        return 'managed-instances';
    if (tab === 'about')
        return 'about';
    return 'environments';
}
function Tab(props) {
    const dispatch = useAppDispatch();
    return (0, jsx_runtime_1.jsx)("button", { className: `tab-button ${props.active === props.id ? 'active' : ''}`, onClick: () => dispatch(store_js_1.actions.tabSelected(props.id)), children: props.label });
}
function Icon({ name }) {
    const paths = {
        edit: 'M11.7 1.3 14.7 4.3 5.2 13.8 2 14l.2-3.2 9.5-9.5Zm-.9 2.3-7.4 7.4-.1 1.7 1.7-.1 7.4-7.4-1.6-1.6Z',
        external: 'M9 2h5v5h-1V3.7L7.4 9.3l-.7-.7L12.3 3H9V2ZM3 4h4v1H4v7h7V9h1v4H3V4Z',
        manage: 'M7.2 1h1.6l.4 1.6c.4.1.8.3 1.1.5l1.4-.8 1.1 1.1-.8 1.4c.2.4.4.7.5 1.1l1.5.4v1.6l-1.5.4c-.1.4-.3.8-.5 1.1l.8 1.4-1.1 1.1-1.4-.8c-.4.2-.7.4-1.1.5L8.8 14H7.2l-.4-1.6c-.4-.1-.8-.3-1.1-.5l-1.4.8-1.1-1.1.8-1.4c-.2-.4-.4-.7-.5-1.1L2 7.8V6.2l1.5-.4c.1-.4.3-.8.5-1.1l-.8-1.4 1.1-1.1 1.4.8c.4-.2.7-.4 1.1-.5L7.2 1ZM8 5.4A2.6 2.6 0 1 0 8 10.6 2.6 2.6 0 0 0 8 5.4Z',
        trash: 'M6 2h4l1 1h3v1H2V3h3l1-1Zm-2 3h8l-.6 9H4.6L4 5Zm2 1v7h1V6H6Zm3 0v7h1V6H9Z',
    };
    return (0, jsx_runtime_1.jsx)("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: (0, jsx_runtime_1.jsx)("path", { d: paths[name] }) });
}
function EnvironmentsTab() {
    const dispatch = useAppDispatch();
    const loading = (0, react_redux_1.useSelector)((state) => !state.server);
    const envs = (0, react_redux_1.useSelector)(environments);
    return (0, jsx_runtime_1.jsxs)("section", { className: "stack", children: [(0, jsx_runtime_1.jsxs)("header", { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { children: "n8n environments" }), (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Workspace sync profiles linked to connected or managed n8n instances." })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { dispatch(store_js_1.actions.environmentDraftOpened({ id: 'new' })); dispatch(store_js_1.actions.modalOpened({ kind: 'environment' })); }, children: "Add environment" })] }), loading ? (0, jsx_runtime_1.jsxs)("div", { className: "panel loading-state", children: [(0, jsx_runtime_1.jsx)("span", { className: "spinner", "aria-hidden": "true" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { children: "Loading environments" }), (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Reading workspace settings and checking n8n configuration." })] })] }) : null, !loading && (envs.length ? (0, jsx_runtime_1.jsx)("div", { className: "grid", children: envs.map((env) => (0, jsx_runtime_1.jsx)(EnvironmentCard, { env: env }, env.id)) }) : (0, jsx_runtime_1.jsxs)("div", { className: "panel empty-state", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Create your first environment" }), (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Choose an existing n8n instance or create a managed local instance, then save the environment to start syncing workflows." }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { dispatch(store_js_1.actions.environmentDraftOpened({ id: 'new' })); dispatch(store_js_1.actions.modalOpened({ kind: 'environment' })); }, children: "Add environment" })] }))] });
}
function EnvironmentCard({ env }) {
    const dispatch = useAppDispatch();
    const activeEnvironmentId = (0, react_redux_1.useSelector)((state) => workspace(state).activeEnvironmentId || '');
    const allTargets = (0, react_redux_1.useSelector)(targets);
    const allEnvironments = (0, react_redux_1.useSelector)(environments);
    const allInstances = (0, react_redux_1.useSelector)(instances);
    const jobs = (0, react_redux_1.useSelector)((state) => state.jobs);
    const pendingActiveEnvironmentId = (0, react_redux_1.useSelector)((state) => state.ui.pendingActiveEnvironmentId || '');
    const target = allTargets.find((item) => item.id === env.environmentTargetId);
    const access = (0, settings_view_model_js_1.environmentAccessBadge)(env.accessStatus || target?.accessStatus);
    const managed = (0, settings_view_model_js_1.environmentManagedInstanceStatus)(env, target, allInstances, jobs);
    const effectiveActiveEnvironmentId = pendingActiveEnvironmentId || activeEnvironmentId;
    const isActive = env.id === effectiveActiveEnvironmentId;
    const isPending = env.id === pendingActiveEnvironmentId;
    const setActive = () => {
        if (env.id === effectiveActiveEnvironmentId)
            return;
        dispatch(store_js_1.actions.environmentActivationRequested(env.id));
        post({ type: 'pinEnvironment', environmentId: env.id });
    };
    return (0, jsx_runtime_1.jsxs)("article", { className: `card clickable ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`, role: "button", tabIndex: 0, "aria-label": `${isActive ? 'Active environment' : 'Set active environment'}: ${env.name}`, onClick: setActive, onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar' || event.code === 'Space') {
                event.preventDefault();
                setActive();
            }
        }, children: [(0, jsx_runtime_1.jsx)("span", { className: `status-corner ${isActive ? 'active' : ''}`, title: isActive ? 'Active environment' : 'Inactive environment', "aria-label": isActive ? 'Active environment' : 'Inactive environment', children: isActive ? '✓' : '' }), (0, jsx_runtime_1.jsxs)("div", { className: "card-top", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { children: env.name }), (0, jsx_runtime_1.jsxs)("p", { className: "subtle", children: [env.workflowsPath || env.workflowDir || env.syncFolder || 'workflows', env.projectName ? ` · ${env.projectName}` : ''] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "row", children: [isActive ? (0, jsx_runtime_1.jsx)("span", { className: "badge active", children: isPending ? 'Activating' : 'Active' }) : null, access ? (0, jsx_runtime_1.jsx)("span", { className: `badge ${access.tone}`, children: access.label }) : null] })] }), (0, jsx_runtime_1.jsx)("p", { className: "subtle", children: target?.name || env.environmentTargetName || env.url || 'No instance target' }), (0, jsx_runtime_1.jsxs)("div", { className: "row", onClick: (event) => event.stopPropagation(), children: [managed ? (0, jsx_runtime_1.jsxs)("button", { className: `badge button ${managed.tone}`, "aria-label": `Open managed instance details: ${managed.label}`, onClick: () => dispatch(store_js_1.actions.modalOpened({ kind: 'managed-detail', instanceId: env.managedInstanceId || target?.managedInstanceId })), children: ["Managed instance: ", managed.label] }) : (0, jsx_runtime_1.jsx)("span", { className: "badge", children: "Connected instance" }), (0, jsx_runtime_1.jsx)("button", { className: "icon-button secondary", "aria-label": `Edit environment ${env.name}`, title: "Edit environment", onClick: () => { dispatch(store_js_1.actions.environmentDraftOpened({ id: env.id, environment: env })); dispatch(store_js_1.actions.modalOpened({ kind: 'environment', environmentId: env.id })); }, children: (0, jsx_runtime_1.jsx)(Icon, { name: "edit" }) }), (0, jsx_runtime_1.jsx)("button", { className: "icon-button danger delete-action", "aria-label": `Delete environment ${env.name}`, title: "Delete environment", onClick: () => post({ type: 'deleteEnvironment', environmentId: env.id }), children: (0, jsx_runtime_1.jsx)(Icon, { name: "trash" }) })] })] });
}
function ManagedInstancesTab() {
    const dispatch = useAppDispatch();
    const managed = (0, react_redux_1.useSelector)(instances).filter((instance) => instance.mode === 'managed-local-docker');
    const activeSetup = (0, react_redux_1.useSelector)(setupActive);
    return (0, jsx_runtime_1.jsxs)("section", { className: "stack", children: [(0, jsx_runtime_1.jsxs)("header", { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { children: "managed instances" }), (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Local n8n-manager controlled runtimes used by environments." })] }), (0, jsx_runtime_1.jsx)("button", { disabled: activeSetup, onClick: () => dispatch(store_js_1.actions.modalOpened({ kind: 'managed-form' })), children: "Create managed instance" })] }), activeSetup ? (0, jsx_runtime_1.jsx)("div", { className: "inline-message warning", children: "Another managed instance is installing. Wait for it to finish or cancel it." }) : null, (0, jsx_runtime_1.jsx)("div", { className: "grid", children: managed.length ? managed.map((instance) => (0, jsx_runtime_1.jsx)(ManagedInstanceCard, { instance: instance }, instance.id)) : (0, jsx_runtime_1.jsx)("div", { className: "panel muted", children: "No managed instances yet." }) })] });
}
function ManagedInstanceCard({ instance }) {
    const dispatch = useAppDispatch();
    const jobs = (0, react_redux_1.useSelector)((state) => state.jobs);
    const envs = (0, react_redux_1.useSelector)(environments);
    const allTargets = (0, react_redux_1.useSelector)(targets);
    const status = (0, settings_view_model_js_1.managedInstanceUiStatus)(instance, jobs[instance.id]);
    const usedBy = envs.filter((env) => {
        const target = allTargets.find((item) => item.id === env.environmentTargetId);
        return env.managedInstanceId === instance.id || target?.managedInstanceId === instance.id;
    });
    const url = (0, settings_view_model_js_1.instanceUrl)(instance);
    const openDetail = () => dispatch(store_js_1.actions.modalOpened({ kind: 'managed-detail', instanceId: instance.id }));
    return (0, jsx_runtime_1.jsxs)("article", { className: "card clickable", role: "button", tabIndex: 0, onClick: openDetail, onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar' || event.code === 'Space') {
                event.preventDefault();
                openDetail();
            }
        }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "card-top", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { children: instance.name || instance.id }), (0, jsx_runtime_1.jsx)("p", { className: "subtle", children: url || 'URL pending' })] }), (0, jsx_runtime_1.jsx)("span", { className: `badge ${status.tone}`, children: status.label })] }), (0, jsx_runtime_1.jsx)("p", { className: "subtle", children: usedBy.length ? `Used by: ${usedBy.map((env) => env.name).join(', ')}` : 'Not used by any environment' }), (0, jsx_runtime_1.jsxs)("div", { className: "row", onClick: (event) => event.stopPropagation(), children: [status.canOpen && url ? (0, jsx_runtime_1.jsx)("button", { className: "icon-button", "aria-label": `Open ${instance.name || instance.id}`, title: "Open instance", onClick: () => post({ type: 'openExternal', url }), children: (0, jsx_runtime_1.jsx)(Icon, { name: "external" }) }) : null, !usedBy.length ? (0, jsx_runtime_1.jsx)("button", { className: "secondary", onClick: () => { dispatch(store_js_1.actions.environmentDraftOpened({ id: 'new' })); dispatch(store_js_1.actions.managedInstanceSelectedForEnvironment({ draftId: 'new', instanceId: instance.id })); dispatch(store_js_1.actions.modalOpened({ kind: 'environment', managedInstanceId: instance.id })); }, children: "Create environment" }) : null, status.canCancel ? (0, jsx_runtime_1.jsx)("button", { className: "secondary", onClick: () => post({ type: 'cancelManagedInstanceSetup', instanceId: instance.id }), children: "Cancel" }) : null, (0, jsx_runtime_1.jsx)("button", { className: "icon-button secondary", "aria-label": `Manage ${instance.name || instance.id}`, title: "Manage instance", onClick: () => dispatch(store_js_1.actions.modalOpened({ kind: 'managed-detail', instanceId: instance.id })), children: (0, jsx_runtime_1.jsx)(Icon, { name: "manage" }) })] })] });
}
function AgentProvidersTab() {
    const providers = (0, react_redux_1.useSelector)((state) => server(state).providers || []);
    const sortedProviders = [...providers].sort((left, right) => Number(Boolean(right.connected)) - Number(Boolean(left.connected)) || String(left.label || left.provider || left.id).localeCompare(String(right.label || right.provider || right.id)));
    return (0, jsx_runtime_1.jsxs)("section", { className: "stack", children: [(0, jsx_runtime_1.jsx)("header", { children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { children: "Agent providers" }), (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "AI provider connections used by agent workflows." })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "stack", children: sortedProviders.map((provider) => {
                    const providerId = provider.provider || provider.id;
                    return (0, jsx_runtime_1.jsxs)("article", { className: "card", children: [(0, jsx_runtime_1.jsxs)("div", { className: "card-top", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { children: provider.label || providerId }), (0, jsx_runtime_1.jsx)("p", { className: "subtle", children: provider.model || provider.reason || '' })] }), (0, jsx_runtime_1.jsx)("span", { className: `badge ${provider.connected ? 'ready' : ''}`, children: provider.connected ? 'Connected' : 'Not connected' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "row", children: [provider.connected ? null : (0, jsx_runtime_1.jsx)("button", { onClick: () => post({ type: 'connectProvider', provider: providerId }), children: "Connect" }), provider.connected ? (0, jsx_runtime_1.jsx)("button", { className: "secondary", onClick: () => post({ type: 'disconnectProvider', provider: providerId }), children: "Disconnect" }) : null] })] }, providerId);
                }) })] });
}
function AboutTab() {
    const about = (0, react_redux_1.useSelector)((state) => server(state).about || {});
    return (0, jsx_runtime_1.jsxs)("section", { className: "stack", children: [(0, jsx_runtime_1.jsx)("header", { children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { children: "About" }), (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "n8n as code extension details." })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "panel", children: [(0, jsx_runtime_1.jsxs)("p", { children: ["Extension version: ", about.extensionVersion || 'unknown'] }), (0, jsx_runtime_1.jsxs)("p", { children: ["n8nac version: ", about.cliVersion || 'unknown'] })] })] });
}
function ActiveModal() {
    const modal = (0, react_redux_1.useSelector)((state) => state.ui.modal);
    if (!modal)
        return null;
    if (modal.kind === 'environment')
        return (0, jsx_runtime_1.jsx)(EnvironmentFormModal, { environmentId: modal.environmentId });
    if (modal.kind === 'managed-form')
        return (0, jsx_runtime_1.jsx)(ManagedInstanceFormModal, { returnToEnvironmentForm: modal.returnToEnvironmentForm, returnToEnvironmentDraftId: modal.returnToEnvironmentDraftId });
    if (modal.kind === 'managed-detail')
        return (0, jsx_runtime_1.jsx)(ManagedInstanceDetailModal, { instanceId: modal.instanceId });
    return null;
}
function EnvironmentFormModal({ environmentId }) {
    const dispatch = useAppDispatch();
    const draftId = environmentId || 'new';
    const draft = (0, react_redux_1.useSelector)((state) => state.drafts.environment[draftId]);
    const allTargets = (0, react_redux_1.useSelector)(targets);
    const allEnvironments = (0, react_redux_1.useSelector)(environments);
    const allInstances = (0, react_redux_1.useSelector)(instances);
    const jobs = (0, react_redux_1.useSelector)((state) => state.jobs);
    const activeSetup = (0, react_redux_1.useSelector)(setupActive);
    const notice = (0, react_redux_1.useSelector)((state) => state.ui.notice);
    const savePending = (0, react_redux_1.useSelector)((state) => Boolean(state.ui.pendingEnvironmentSaves[draftId]));
    const choices = (0, settings_view_model_js_1.buildEnvironmentInstanceChoices)(allTargets, allInstances);
    const selected = choices.find((choice) => choice.value === draft?.instanceChoice);
    const editingEnvironment = Boolean(environmentId);
    const isManaged = selected?.mode === 'managed';
    const status = isManaged ? (0, settings_view_model_js_1.managedInstanceUiStatus)(allInstances.find((instance) => instance.id === selected.instanceId), selected.instanceId ? jobs[selected.instanceId] : undefined) : undefined;
    const patch = (patch) => dispatch(store_js_1.actions.environmentDraftPatched({ id: draftId, patch }));
    const patchName = (name) => {
        const currentDefault = defaultWorkflowsPathForName(draft?.name || '', allEnvironments, environmentId);
        const nextPatch = { name };
        if (!editingEnvironment && draft?.workflowsPath === currentDefault) {
            nextPatch.workflowsPath = defaultWorkflowsPathForName(name, allEnvironments, environmentId);
        }
        patch(nextPatch);
    };
    const normalizedWorkflowsPath = normalizeWorkflowsPath(draft?.workflowsPath || '');
    const workflowsPathConflict = Boolean(normalizedWorkflowsPath) && allEnvironments
        .filter((environment) => environment?.id !== environmentId)
        .some((environment) => normalizeWorkflowsPath(environment?.workflowsPath || environment?.workflowDir || environment?.syncFolder || '') === normalizedWorkflowsPath);
    const canContinue = draft && selected && selected.mode !== 'new-managed' && (isManaged || selected?.targetId || selected?.mode !== 'new-connected' || (draft.url && (draft.apiKey || draft.apiKeyAvailable)));
    if (!draft)
        return null;
    const save = () => {
        if (savePending || workflowsPathConflict)
            return;
        dispatch(store_js_1.actions.environmentSaveRequested(draftId));
        post({
            type: 'saveEnvironment', environmentId, name: draft.name, environmentTargetId: selected?.targetId || draft.environmentTargetId || '', instanceId: selected?.instanceId || draft.instanceId || '', url: isManaged ? '' : draft.url || selected?.url || '', apiKey: isManaged ? '' : draft.apiKey, projectId: isManaged ? 'personal' : draft.projectId || 'personal', projectName: isManaged ? 'Personal' : draft.projectName || 'Personal', workflowsPath: draft.workflowsPath, folderSync: draft.folderSync, customNodesPath: draft.customNodesPath, description: draft.description,
        });
    };
    return (0, jsx_runtime_1.jsxs)(Modal, { title: environmentId ? 'Edit environment' : 'Add environment', onClose: () => { dispatch(store_js_1.actions.environmentDraftClosed({ id: draftId })); dispatch(store_js_1.actions.modalClosed()); }, children: [notice?.tone === 'error' ? (0, jsx_runtime_1.jsx)("div", { className: "inline-message error", children: notice.message }) : null, (0, jsx_runtime_1.jsxs)("div", { className: "form-grid", children: [(0, jsx_runtime_1.jsxs)("label", { children: ["Name", (0, jsx_runtime_1.jsx)("input", { value: draft.name, onChange: (event) => patchName(event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Instance", (0, jsx_runtime_1.jsxs)("select", { value: draft.instanceChoice, onChange: (event) => { const value = event.target.value; const choice = choices.find((item) => item.value === value); if (choice?.mode === 'new-managed') {
                                    dispatch(store_js_1.actions.modalOpened({ kind: 'managed-form', returnToEnvironmentForm: true, returnToEnvironmentDraftId: draftId }));
                                    return;
                                } patch({ instanceChoice: value, instanceId: choice?.instanceId, environmentTargetId: choice?.targetId, url: choice?.url || '', apiKeyAvailable: choice?.mode === 'new-connected' ? false : draft.apiKeyAvailable, projectId: choice?.mode === 'managed' ? 'personal' : '', projectName: choice?.mode === 'managed' ? 'Personal' : '', projects: undefined, projectError: undefined, projectsLoading: false, projectRequestKey: undefined }); }, children: [(0, jsx_runtime_1.jsx)("optgroup", { label: "Create", children: choices.filter((choice) => choice.group === 'Create').map((choice) => (0, jsx_runtime_1.jsx)("option", { value: choice.value, children: choice.label }, choice.value)) }), (0, jsx_runtime_1.jsx)("optgroup", { label: "Saved instances", children: choices.filter((choice) => choice.group === 'Saved instances').map((choice) => (0, jsx_runtime_1.jsx)("option", { value: choice.value, children: choice.label }, choice.value)) })] })] })] }), selected?.mode === 'new-connected' ? (0, jsx_runtime_1.jsxs)("div", { className: "form-grid", children: [(0, jsx_runtime_1.jsxs)("label", { children: ["n8n URL", (0, jsx_runtime_1.jsx)("input", { value: draft.url, onChange: (event) => patch({ url: event.target.value }) })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["API key", (0, jsx_runtime_1.jsx)("input", { type: "password", value: draft.apiKey, onChange: (event) => patch({ apiKey: event.target.value }), placeholder: draft.apiKeyAvailable ? 'Stored API key will be reused' : '' })] })] }) : null, selected?.mode === 'new-managed' ? (0, jsx_runtime_1.jsx)("div", { className: "inline-message", children: "Select New managed instance to create a linkable local runtime first." }) : null, canContinue && isManaged ? (0, jsx_runtime_1.jsxs)("div", { className: "inline-message warning", children: ["Managed instance is ", status?.label.toLowerCase(), ". You can finish this environment now; runtime status will update in the background."] }) : null, canContinue && !isManaged ? (0, jsx_runtime_1.jsx)(ProjectFields, { draft: draft, patch: patch, draftId: draftId, selected: selected }) : null, canContinue ? (0, jsx_runtime_1.jsxs)("div", { className: "form-grid", children: [(0, jsx_runtime_1.jsxs)("label", { children: ["Workflows path", (0, jsx_runtime_1.jsx)("input", { value: draft.workflowsPath, onChange: (event) => patch({ workflowsPath: event.target.value }) }), workflowsPathConflict ? (0, jsx_runtime_1.jsx)("span", { className: "inline-message error", children: "Another environment already uses this workflows path." }) : null] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Custom nodes path", (0, jsx_runtime_1.jsx)("input", { value: draft.customNodesPath, onChange: (event) => patch({ customNodesPath: event.target.value }) })] })] }) : null, canContinue ? (0, jsx_runtime_1.jsxs)("label", { children: ["Description", (0, jsx_runtime_1.jsx)("textarea", { value: draft.description, onChange: (event) => patch({ description: event.target.value }) })] }) : null, (0, jsx_runtime_1.jsxs)("div", { className: "toolbar", children: [(0, jsx_runtime_1.jsx)("button", { onClick: save, disabled: !draft.name || !canContinue || workflowsPathConflict || savePending, children: savePending ? 'Saving...' : 'Save environment' }), !isManaged ? (0, jsx_runtime_1.jsx)("button", { className: "secondary", disabled: activeSetup || savePending, onClick: () => dispatch(store_js_1.actions.modalOpened({ kind: 'managed-form', returnToEnvironmentForm: true, returnToEnvironmentDraftId: draftId })), children: "Create local instance" }) : null] })] });
}
function ProjectFields({ draft, patch, draftId, selected }) {
    const dispatch = useAppDispatch();
    const requestKey = `${selected?.value || ''}|${selected?.targetId || ''}|${draft.url || selected?.url || ''}|${draft.apiKey ? 'key' : draft.apiKeyAvailable ? 'stored' : ''}`;
    (0, react_1.useEffect)(() => {
        if (!selected || selected.mode === 'managed' || selected.mode === 'new-managed')
            return;
        if (draft.projectsLoading && draft.projectRequestKey === requestKey)
            return;
        if ((draft.projects || draft.projectError) && draft.projectRequestKey === requestKey)
            return;
        dispatch(store_js_1.actions.environmentDraftProjectsLoading({ id: draftId, requestKey }));
        post({ type: 'loadProjects', scope: 'environment', draftId, requestKey, instanceId: selected?.instanceId || '', environmentTargetId: selected?.targetId || '', host: selected?.targetId ? '' : draft.url || selected?.url || '', apiKey: selected?.targetId ? '' : draft.apiKey, projectId: draft.projectId, projectName: draft.projectName });
    }, [dispatch, draft.apiKey, draft.apiKeyAvailable, draft.projectError, draft.projectId, draft.projectName, draft.projectRequestKey, draft.projects, draft.projectsLoading, draft.url, draftId, requestKey, selected]);
    if (draft.projectsLoading)
        return (0, jsx_runtime_1.jsx)("div", { className: "inline-message", children: "Checking project access..." });
    if (draft.projectError)
        return null;
    const projects = draft.projects || [];
    const selectableProjects = projects.filter((project) => project.id !== 'personal' || projects.length > 1);
    if (selectableProjects.length <= 1 && selectableProjects[0]?.id === 'personal')
        return null;
    if (!selectableProjects.length)
        return null;
    return (0, jsx_runtime_1.jsx)("div", { className: "form-grid", children: (0, jsx_runtime_1.jsxs)("label", { children: ["Project", (0, jsx_runtime_1.jsx)("select", { value: draft.projectId, onChange: (event) => { const project = projects.find((item) => item.id === event.target.value); patch({ projectId: event.target.value, projectName: project?.name || '' }); }, children: selectableProjects.map((project) => (0, jsx_runtime_1.jsx)("option", { value: project.id, children: project.displayName || project.name }, project.id)) })] }) });
}
function ManagedInstanceFormModal({ returnToEnvironmentForm, returnToEnvironmentDraftId }) {
    const dispatch = useAppDispatch();
    const draft = (0, react_redux_1.useSelector)((state) => state.drafts.managed);
    const activeSetup = (0, react_redux_1.useSelector)(setupActive);
    return (0, jsx_runtime_1.jsxs)(Modal, { title: "Create managed instance", onClose: () => dispatch(store_js_1.actions.modalClosed()), children: [activeSetup ? (0, jsx_runtime_1.jsx)("div", { className: "inline-message warning", children: "Another managed instance is installing. Wait for it to finish or cancel it." }) : null, (0, jsx_runtime_1.jsxs)("div", { className: "form-grid", children: [(0, jsx_runtime_1.jsxs)("label", { children: ["Name", (0, jsx_runtime_1.jsx)("input", { value: draft.name, onChange: (event) => dispatch(store_js_1.actions.managedDraftPatched({ name: event.target.value })) })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Public URL", (0, jsx_runtime_1.jsxs)("select", { value: draft.tunnel ? 'public' : 'local', onChange: (event) => dispatch(store_js_1.actions.managedDraftPatched({ tunnel: event.target.value === 'public' })), children: [(0, jsx_runtime_1.jsx)("option", { value: "public", children: "Enable public URL" }), (0, jsx_runtime_1.jsx)("option", { value: "local", children: "Local only" })] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "toolbar", children: (0, jsx_runtime_1.jsx)("button", { disabled: activeSetup || !draft.name.trim(), onClick: () => { post({ type: 'createManagedInstance', instanceName: draft.name, tunnel: draft.tunnel, returnToEnvironmentForm, returnToEnvironmentDraftId }); dispatch(store_js_1.actions.managedDraftReset()); if (!returnToEnvironmentForm)
                        dispatch(store_js_1.actions.modalClosed()); }, children: "Create managed instance" }) })] });
}
function ManagedInstanceDetailModal({ instanceId }) {
    const dispatch = useAppDispatch();
    const instance = (0, react_redux_1.useSelector)(instances).find((item) => item.id === instanceId);
    const jobs = (0, react_redux_1.useSelector)((state) => state.jobs);
    const status = (0, settings_view_model_js_1.managedInstanceUiStatus)(instance, jobs[instanceId]);
    const credentials = (0, react_redux_1.useSelector)((state) => state.ui.credentials);
    const url = instance ? (0, settings_view_model_js_1.instanceUrl)(instance) : '';
    return (0, jsx_runtime_1.jsxs)(Modal, { title: instance?.name || instanceId, onClose: () => dispatch(store_js_1.actions.modalClosed()), children: [(0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsx)("span", { className: `badge ${status.tone}`, children: status.label }), (0, jsx_runtime_1.jsx)("span", { className: "subtle", children: status.message })] }), (0, jsx_runtime_1.jsx)("p", { className: "subtle", children: url || 'URL pending' }), (0, jsx_runtime_1.jsxs)("div", { className: "toolbar", children: [status.canOpen && url ? (0, jsx_runtime_1.jsx)("button", { className: "icon-button", "aria-label": `Open ${instance?.name || instanceId}`, title: "Open instance", onClick: () => post({ type: 'openExternal', url }), children: (0, jsx_runtime_1.jsx)(Icon, { name: "external" }) }) : null, (0, jsx_runtime_1.jsx)("button", { className: "secondary", onClick: () => post({ type: 'manageInstanceRuntime', instanceId, action: 'start' }), children: "Start" }), (0, jsx_runtime_1.jsx)("button", { className: "secondary", onClick: () => post({ type: 'manageInstanceRuntime', instanceId, action: 'stop' }), children: "Stop" }), (0, jsx_runtime_1.jsx)("button", { className: "secondary", onClick: () => post({ type: 'manageInstanceRuntime', instanceId, action: 'restart' }), children: "Restart" }), (0, jsx_runtime_1.jsx)("button", { className: "secondary", onClick: () => post({ type: 'refreshPublicUrl', instanceId }), children: "Refresh public URL" }), status.canCancel ? (0, jsx_runtime_1.jsx)("button", { className: "secondary", onClick: () => post({ type: 'cancelManagedInstanceSetup', instanceId }), children: "Cancel setup" }) : null] }), (0, jsx_runtime_1.jsxs)("div", { className: "toolbar", children: [(0, jsx_runtime_1.jsx)("button", { className: "secondary", onClick: () => post({ type: 'showManagedCredentials', instanceId }), children: "Show credentials" }), (0, jsx_runtime_1.jsx)("button", { className: "secondary", onClick: () => { dispatch(store_js_1.actions.environmentDraftOpened({ id: 'new' })); dispatch(store_js_1.actions.managedInstanceSelectedForEnvironment({ draftId: 'new', instanceId })); dispatch(store_js_1.actions.modalOpened({ kind: 'environment', managedInstanceId: instanceId })); }, children: "Create environment" }), (0, jsx_runtime_1.jsx)("button", { className: "icon-button danger delete-action", "aria-label": `Delete instance ${instance?.name || instanceId}`, title: "Delete instance", onClick: () => post({ type: 'deleteInstance', instanceId, instanceName: instance?.name }), children: (0, jsx_runtime_1.jsx)(Icon, { name: "trash" }) })] }), credentials ? (0, jsx_runtime_1.jsxs)("div", { className: "panel", children: [(0, jsx_runtime_1.jsxs)("p", { children: ["Username: ", credentials.username] }), (0, jsx_runtime_1.jsxs)("p", { children: ["Password: ", credentials.password] })] }) : null] });
}
function Modal({ title, children, onClose }) {
    return (0, jsx_runtime_1.jsx)("div", { className: "modal-backdrop", children: (0, jsx_runtime_1.jsxs)("section", { className: "modal-card", role: "dialog", "aria-modal": "true", "aria-label": title, children: [(0, jsx_runtime_1.jsxs)("div", { className: "modal-head", children: [(0, jsx_runtime_1.jsx)("h2", { children: title }), (0, jsx_runtime_1.jsx)("button", { className: "secondary", onClick: onClose, children: "Close" })] }), children] }) });
}
function defaultWorkflowsPathForName(name, existingEnvironments, currentEnvironmentId) {
    const slug = String(name || 'environment')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        || 'environment';
    const used = new Set(existingEnvironments
        .filter((environment) => environment?.id !== currentEnvironmentId)
        .map((environment) => normalizeWorkflowsPath(environment?.workflowsPath || environment?.workflowDir || environment?.syncFolder || ''))
        .filter(Boolean));
    let candidate = `workflows/${slug}`;
    let counter = 2;
    while (used.has(normalizeWorkflowsPath(candidate))) {
        candidate = `workflows/${slug}-${counter}`;
        counter += 1;
    }
    return candidate;
}
function normalizeWorkflowsPath(value) {
    return String(value || '').trim().replace(/\\/g, '/').replace(/\/+$/g, '').toLowerCase();
}
(0, client_1.createRoot)(document.getElementById('root')).render((0, jsx_runtime_1.jsx)(react_redux_1.Provider, { store: store_js_1.store, children: (0, jsx_runtime_1.jsx)(App, {}) }));
//# sourceMappingURL=app.js.map