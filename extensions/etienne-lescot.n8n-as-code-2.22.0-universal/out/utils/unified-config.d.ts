import { type IInstanceIdentifierClient, type IWorkspaceConfig, type IInstanceVerificationClient } from 'n8nac';
export type UnifiedWorkspaceConfig = IWorkspaceConfig;
type BuildUnifiedWorkspaceConfigInput = {
    workspaceRoot: string;
    host: string;
    apiKey: string;
    syncFolder: string;
    projectId?: string;
    projectName?: string;
    instanceIdentifier?: string;
    instanceId?: string;
    instanceName?: string;
    createNew?: boolean;
    setActive?: boolean;
    client?: IInstanceVerificationClient & IInstanceIdentifierClient;
};
export declare function getUnifiedConfigPath(workspaceRoot: string): string;
export declare function readUnifiedWorkspaceConfig(workspaceRoot: string): UnifiedWorkspaceConfig;
export declare function toStoredSyncFolder(workspaceRoot: string, syncFolder: string): string;
export declare function buildUnifiedWorkspaceConfig(input: BuildUnifiedWorkspaceConfigInput): Promise<UnifiedWorkspaceConfig>;
export declare function writeUnifiedWorkspaceConfig(input: BuildUnifiedWorkspaceConfigInput): Promise<UnifiedWorkspaceConfig>;
export {};
//# sourceMappingURL=unified-config.d.ts.map