export type WorkspaceSnapshotLogger = (message: string) => void;
export declare class WorkspaceSnapshotService {
    private readonly log;
    private readonly snapshotRoot;
    constructor(storageRoot: string, log?: WorkspaceSnapshotLogger);
    capture(workspaceRoot: string | undefined, label: string): Promise<string | undefined>;
    restore(workspaceRoot: string | undefined, snapshotId: string | undefined): Promise<void>;
    private listTreeFiles;
    private removeTrackedFiles;
    private removePathIfPresent;
    private removeEmptyDirectory;
    private checkoutTree;
    private removeTempDirectory;
    private checkoutPrefix;
    private resolveWorkspacePath;
    private ensureSnapshotRepo;
    private revParse;
    private git;
    private gitDir;
}
//# sourceMappingURL=workspace-snapshot-service.d.ts.map