"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instanceDisplayType = instanceDisplayType;
exports.instanceUrl = instanceUrl;
exports.managedInstanceUiStatus = managedInstanceUiStatus;
exports.environmentManagedInstanceStatus = environmentManagedInstanceStatus;
exports.environmentAccessBadge = environmentAccessBadge;
exports.buildEnvironmentInstanceChoices = buildEnvironmentInstanceChoices;
function instanceDisplayType(instance) {
    return instance.mode === 'managed-local-docker' ? 'managed instance' : 'connected instance';
}
function instanceUrl(instance) {
    return instance.displayUrl || instance.tunnelPublicUrl || instance.host || instance.baseUrl || '';
}
function managedInstanceUiStatus(instance, job) {
    if (job?.status === 'installing') {
        return { label: 'Installing', tone: 'installing', priority: 90, message: job.message || 'Managed instance is installing.', canOpen: false, canCreateEnvironment: true, canCancel: true };
    }
    if (job?.status === 'cancelling') {
        return { label: 'Cancelling', tone: 'warning', priority: 95, message: 'Cancellation requested. Waiting for setup to stop safely.', canOpen: false, canCreateEnvironment: false, canCancel: false };
    }
    if (job?.status === 'cancelled') {
        return { label: 'Cancelled', tone: 'warning', priority: 80, message: 'Setup was cancelled.', canOpen: false, canCreateEnvironment: false, canCancel: false };
    }
    if (job?.status === 'failed') {
        return { label: 'Failed', tone: 'error', priority: 100, message: job.error || job.message || 'Setup failed.', canOpen: false, canCreateEnvironment: false, canCancel: false };
    }
    if (!instance) {
        return { label: 'Failed', tone: 'error', priority: 100, message: 'Managed instance record is missing.', canOpen: false, canCreateEnvironment: false, canCancel: false };
    }
    if (instance.runtimeBlockedCode === 'docker-not-found') {
        return { label: 'Docker not found', tone: 'error', priority: 100, message: instance.runtimeBlockedMessage || 'Docker is required for managed instances.', canOpen: false, canCreateEnvironment: true, canCancel: false };
    }
    if (instance.runtimeBlockedMessage) {
        return { label: 'Failed', tone: 'error', priority: 90, message: instance.runtimeBlockedMessage, canOpen: false, canCreateEnvironment: true, canCancel: false };
    }
    if (instance.runtimeStatus === 'starting') {
        return { label: 'Starting', tone: 'installing', priority: 70, message: 'Runtime is starting.', canOpen: false, canCreateEnvironment: true, canCancel: false };
    }
    if (instance.runtimeReady || instance.runtimeStatus === 'ready' || instance.runtimeStatus === 'running') {
        if (!instanceUrl(instance)) {
            return { label: 'URL pending', tone: 'warning', priority: 60, message: 'Runtime is ready but no URL is available yet.', canOpen: false, canCreateEnvironment: true, canCancel: false };
        }
        if (instance.tunnelPublicUrl && instance.tunnelRunning === false) {
            return { label: 'Tunnel stopped', tone: 'warning', priority: 65, message: 'The public tunnel is not running.', canOpen: true, canCreateEnvironment: true, canCancel: false };
        }
        return { label: 'Started', tone: 'started', priority: 10, message: 'Managed runtime is ready.', canOpen: true, canCreateEnvironment: true, canCancel: false };
    }
    if (instance.runtimeStatus === 'stopped') {
        return { label: 'Stopped', tone: 'stopped', priority: 40, message: 'Managed runtime is stopped.', canOpen: Boolean(instanceUrl(instance)), canCreateEnvironment: true, canCancel: false };
    }
    return { label: 'Stopped', tone: 'muted', priority: 50, message: 'Runtime status is unavailable.', canOpen: Boolean(instanceUrl(instance)), canCreateEnvironment: true, canCancel: false };
}
function environmentManagedInstanceStatus(env, target, instances, jobs) {
    const managedInstanceId = env.managedInstanceId || target?.managedInstanceId;
    if (!managedInstanceId)
        return undefined;
    return managedInstanceUiStatus(instances.find((instance) => instance.id === managedInstanceId), jobs[managedInstanceId]);
}
function environmentAccessBadge(accessStatus) {
    if (!accessStatus || accessStatus === 'unknown')
        return undefined;
    if (accessStatus === 'ready')
        return { label: 'Ready', tone: 'ready' };
    if (accessStatus === 'missing-api-key')
        return { label: 'Missing API key', tone: 'error' };
    if (accessStatus === 'invalid-api-key')
        return { label: 'Invalid API key', tone: 'error' };
    if (accessStatus === 'project-inaccessible')
        return { label: 'Project inaccessible', tone: 'warning' };
    if (accessStatus === 'runtime-unavailable')
        return { label: 'Runtime unavailable', tone: 'warning' };
    return { label: accessStatus.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '), tone: 'warning' };
}
function buildEnvironmentInstanceChoices(targets, instances) {
    const choices = [
        { value: 'new-connected', label: 'New connected instance', group: 'Create', mode: 'new-connected' },
        { value: 'new-managed', label: 'New managed instance', group: 'Create', mode: 'new-managed' },
    ];
    const seen = new Set();
    for (const target of targets || []) {
        if (target.kind === 'managed-instance' && target.managedInstanceId) {
            const key = `managed:${target.managedInstanceId}`;
            if (seen.has(key))
                continue;
            seen.add(key);
            const instance = instances.find((item) => item.id === target.managedInstanceId);
            choices.push({ value: key, label: `${target.name || instance?.name || target.managedInstanceId} - managed instance`, group: 'Saved instances', mode: 'managed', instanceId: target.managedInstanceId, targetId: target.id });
            continue;
        }
        const normalizedUrl = String(target.url || '').replace(/\/+$/g, '');
        if (!normalizedUrl)
            continue;
        const key = `url:${normalizedUrl}`;
        if (seen.has(key))
            continue;
        seen.add(key);
        choices.push({ value: `target:${target.id}`, label: `${target.name || normalizedUrl} - connected instance`, group: 'Saved instances', mode: 'connected', targetId: target.id, url: normalizedUrl });
    }
    for (const instance of instances || []) {
        if (instance.mode === 'managed-local-docker') {
            const key = `managed:${instance.id}`;
            if (seen.has(key))
                continue;
            seen.add(key);
            choices.push({ value: key, label: `${instance.name || instance.id} - managed instance`, group: 'Saved instances', mode: 'managed', instanceId: instance.id });
            continue;
        }
        const normalizedUrl = instanceUrl(instance).replace(/\/+$/g, '');
        if (!normalizedUrl)
            continue;
        const key = `url:${normalizedUrl}`;
        if (seen.has(key))
            continue;
        seen.add(key);
        choices.push({ value: `instance:${instance.id}`, label: `${instance.name || normalizedUrl} - connected instance`, group: 'Saved instances', mode: 'connected', instanceId: instance.id, url: normalizedUrl });
    }
    return choices;
}
//# sourceMappingURL=settings-view-model.js.map