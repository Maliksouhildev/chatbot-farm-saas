"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildConfigurationInitState = buildConfigurationInitState;
function buildConfigurationInitState(input) {
    const { workspaceConfig, activeInstance, resolved, getApiKey, normalizeHost } = input;
    const instances = workspaceConfig.instances.map((instance) => ({
        id: instance.id,
        name: instance.name,
        host: normalizeHost(instance.host || ''),
        apiKey: instance.host ? (getApiKey(instance.host, instance.id) || '') : '',
        syncFolder: instance.syncFolder || 'workflows',
        projectId: instance.projectId || '',
        projectName: instance.projectName || '',
        verificationStatus: instance.verification?.status || 'unverified',
        verificationLabel: getVerificationLabel(instance.verification?.status || 'unverified'),
    }));
    const activeHost = activeInstance?.host || resolved.host;
    const activeInstanceId = activeInstance?.id || resolved.activeInstanceId || '';
    const activeInstanceName = activeInstance?.name || resolved.activeInstanceName || '';
    const activeApiKey = activeInstance?.host
        ? (getApiKey(activeInstance.host, activeInstance.id) || '')
        : resolved.apiKey;
    return {
        config: {
            instanceId: activeInstanceId,
            instanceName: activeInstanceName,
            host: normalizeHost(activeHost),
            apiKey: activeApiKey.trim(),
            projectId: activeInstance?.projectId || resolved.projectId,
            projectName: activeInstance?.projectName || resolved.projectName,
            syncFolder: activeInstance?.syncFolder || resolved.syncFolder,
            verificationStatus: activeInstance?.verification?.status || 'unverified',
            verificationLabel: getVerificationLabel(activeInstance?.verification?.status || 'unverified'),
        },
        instances,
        activeInstanceId,
        activeInstanceName,
    };
}
function getVerificationLabel(status) {
    if (status === 'verified') {
        return 'Verified';
    }
    if (status === 'failed') {
        return 'Verification failed';
    }
    return 'Not verified yet';
}
//# sourceMappingURL=configuration-state.js.map