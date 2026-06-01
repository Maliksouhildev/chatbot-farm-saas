type SnapshotForAiContextPolicy = {
    workspaceRoot?: string;
    hasWorkspaceConfig?: boolean;
};
export declare function hasExplicitWorkspaceConfig(workspaceRoot: string | undefined, existsSync?: (filePath: string) => boolean): boolean;
export declare function shouldAutoEnsureAiContext(input: {
    workspaceRoot?: string;
    snapshot?: SnapshotForAiContextPolicy;
    existsSync?: (filePath: string) => boolean;
}): boolean;
export {};
//# sourceMappingURL=ai-context-policy.d.ts.map