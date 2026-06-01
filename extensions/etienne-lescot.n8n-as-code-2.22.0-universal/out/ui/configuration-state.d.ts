import type { IInstanceProfile } from 'n8nac';
export type UiInstance = {
    id: string;
    name: string;
    host: string;
    apiKey: string;
    syncFolder: string;
    projectId: string;
    projectName: string;
    verificationStatus: 'unverified' | 'verified' | 'failed';
    verificationLabel: string;
};
export type UiConfig = {
    instanceId: string;
    instanceName: string;
    host: string;
    apiKey: string;
    projectId: string;
    projectName: string;
    syncFolder: string;
    verificationStatus: 'unverified' | 'verified' | 'failed';
    verificationLabel: string;
};
export type ConfigurationInitState = {
    config: UiConfig;
    instances: UiInstance[];
    activeInstanceId: string;
    activeInstanceName: string;
};
type ResolvedConfigLike = {
    activeInstanceId?: string;
    activeInstanceName?: string;
    host: string;
    apiKey: string;
    projectId: string;
    projectName: string;
    syncFolder: string;
};
type BuildConfigurationInitStateInput = {
    workspaceConfig: {
        activeInstanceId?: string;
        instances: IInstanceProfile[];
    };
    activeInstance?: IInstanceProfile;
    resolved: ResolvedConfigLike;
    getApiKey: (host: string, instanceId?: string) => string | undefined;
    normalizeHost: (host: string) => string;
};
export declare function buildConfigurationInitState(input: BuildConfigurationInitStateInput): ConfigurationInitState;
export {};
//# sourceMappingURL=configuration-state.d.ts.map