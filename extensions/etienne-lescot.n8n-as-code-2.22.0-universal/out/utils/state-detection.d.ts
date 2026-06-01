import { ConfigValidationResult } from '../types.js';
export interface ResolvedN8nWorkspaceConfig {
    host: string;
    apiKey: string;
    syncFolder: string;
    projectId: string;
    projectName: string;
    activeInstanceId: string;
    activeInstanceName: string;
    environmentId?: string;
    environmentName?: string;
    environmentTargetId?: string;
    environmentTargetName?: string;
}
export declare function getResolvedN8nConfig(workspaceRoot?: string | undefined): ResolvedN8nWorkspaceConfig;
/**
 * Get the current workspace root path
 * Returns undefined if no workspace is open
 */
export declare function getWorkspaceRoot(): string | undefined;
/**
 * Get normalized n8n connection credentials.
 */
export declare function getN8nConfig(): {
    host: string;
    apiKey: string;
};
/**
 * Validate n8n configuration
 */
export declare function validateN8nConfig(): ConfigValidationResult;
/**
 * Check if a workspace folder was initialized with a canonical n8n sync identity.
 */
export declare function isFolderPreviouslyInitialized(workspaceRoot: string): boolean;
/**
 * Check for external-instance AI context files
 */
export declare function hasAIContextFiles(workspaceRoot: string): boolean;
/**
 * Determine the initial extension state based on workspace and configuration
 */
export declare function determineInitialState(workspaceRoot?: string): {
    state: 'uninitialized' | 'configuring' | 'initialized';
    hasValidConfig: boolean;
    isPreviouslyInitialized: boolean;
};
/**
 * Get sync directory path for the current workspace
 */
export declare function getSyncDirectoryPath(): string | undefined;
/**
 * Check if sync directory exists
 */
export declare function doesSyncDirectoryExist(): boolean;
/**
 * Get the canonical instance identifier from external-instance configuration.
 */
export declare function getExistingInstanceIdentifier(workspaceRoot: string): string | undefined;
//# sourceMappingURL=state-detection.d.ts.map