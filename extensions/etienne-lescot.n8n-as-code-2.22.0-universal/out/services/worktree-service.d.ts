export interface WorktreeInfo {
    path: string;
    head: string;
    branch?: string;
    bare: boolean;
    detached: boolean;
    locked: boolean;
}
export interface CreateWorktreeOptions {
    branchName?: string;
    baseBranch?: string;
    detach?: boolean;
}
export type WorktreeLogger = (message: string) => void;
export declare class WorktreeService {
    private readonly log;
    private readonly worktreesRoot;
    constructor(workspaceRoot: string, log?: WorktreeLogger);
    listWorktrees(repoPath: string): Promise<WorktreeInfo[]>;
    createWorktree(repoPath: string, options?: CreateWorktreeOptions): Promise<WorktreeInfo>;
    removeWorktree(repoPath: string, worktreePath: string): Promise<void>;
    getWorktreesRoot(): string;
    private normalizeBranchName;
    private resolveManagedWorktreePath;
    private isManagedChildPath;
    private findWorktreeByPath;
    private canonicalPath;
    private parseWorktreePorcelain;
    private formatRemoveError;
}
//# sourceMappingURL=worktree-service.d.ts.map