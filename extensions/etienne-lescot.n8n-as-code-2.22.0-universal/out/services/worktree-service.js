"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorktreeService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
class WorktreeService {
    log;
    worktreesRoot;
    constructor(workspaceRoot, log = () => { }) {
        this.log = log;
        this.worktreesRoot = path.join(workspaceRoot, '.n8nac', 'worktrees');
    }
    async listWorktrees(repoPath) {
        try {
            const { stdout } = await execFileAsync('git', ['worktree', 'list', '--porcelain'], {
                cwd: repoPath,
                maxBuffer: 1024 * 1024,
            });
            return this.parseWorktreePorcelain(stdout);
        }
        catch (error) {
            this.log(`[n8n-worktree] List failed: ${error?.message || String(error)}`);
            return [];
        }
    }
    async createWorktree(repoPath, options = {}) {
        const branchName = this.normalizeBranchName(options.branchName || `n8n-agent-${Date.now().toString(36)}`);
        const worktreePath = path.join(this.worktreesRoot, branchName);
        fs.mkdirSync(this.worktreesRoot, { recursive: true });
        const args = ['worktree', 'add'];
        if (options.detach) {
            args.push('--detach');
        }
        else {
            args.push('-b', branchName);
        }
        args.push(worktreePath);
        if (options.baseBranch) {
            args.push(options.baseBranch);
        }
        try {
            await execFileAsync('git', args, {
                cwd: repoPath,
                maxBuffer: 10 * 1024 * 1024,
            });
            this.log(`[n8n-worktree] Created worktree at ${worktreePath} branch=${branchName}`);
        }
        catch (error) {
            const message = error?.message || String(error);
            this.log(`[n8n-worktree] Create failed: ${message}`);
            throw new Error(`Failed to create worktree: ${message}`);
        }
        const worktrees = await this.listWorktrees(repoPath);
        const created = await this.findWorktreeByPath(worktrees, worktreePath);
        if (!created) {
            throw new Error('Worktree created but not found in listing.');
        }
        return created;
    }
    async removeWorktree(repoPath, worktreePath) {
        const resolvedWorktreePath = this.resolveManagedWorktreePath(worktreePath);
        const worktrees = await this.listWorktrees(repoPath);
        const knownWorktree = await this.findWorktreeByPath(worktrees, resolvedWorktreePath);
        if (!knownWorktree) {
            throw new Error('Refusing to remove unknown worktree path.');
        }
        if (knownWorktree.locked) {
            throw new Error('Cannot remove locked worktree. Unlock it with Git before deleting it.');
        }
        try {
            await execFileAsync('git', ['worktree', 'remove', resolvedWorktreePath], {
                cwd: repoPath,
                maxBuffer: 10 * 1024 * 1024,
            });
            this.log(`[n8n-worktree] Removed worktree at ${resolvedWorktreePath}`);
        }
        catch (error) {
            const message = this.formatRemoveError(error);
            this.log(`[n8n-worktree] Remove failed: ${message}`);
            throw new Error(`Failed to remove worktree: ${message}`);
        }
    }
    getWorktreesRoot() {
        return this.worktreesRoot;
    }
    normalizeBranchName(value) {
        const branchName = value.trim();
        if (!branchName) {
            throw new Error('Worktree branch name is required.');
        }
        if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(branchName)) {
            throw new Error('Worktree branch name may only contain letters, numbers, dots, underscores, and hyphens.');
        }
        if (branchName.endsWith('.') || branchName.includes('..') || branchName.endsWith('.lock')) {
            throw new Error('Worktree branch name is not a safe Git branch name.');
        }
        return branchName;
    }
    resolveManagedWorktreePath(worktreePath) {
        const resolvedRoot = path.resolve(this.worktreesRoot);
        const resolvedWorktreePath = path.resolve(worktreePath);
        try {
            const realRoot = fs.realpathSync(this.worktreesRoot);
            const realWorktreePath = fs.realpathSync(worktreePath);
            if (!this.isManagedChildPath(realRoot, realWorktreePath)) {
                throw new Error('Refusing to remove worktree outside the managed worktrees directory.');
            }
            return realWorktreePath;
        }
        catch (error) {
            if (error?.code !== 'ENOENT') {
                throw error;
            }
        }
        if (!this.isManagedChildPath(resolvedRoot, resolvedWorktreePath)) {
            throw new Error('Refusing to remove worktree outside the managed worktrees directory.');
        }
        return resolvedWorktreePath;
    }
    isManagedChildPath(rootPath, childPath) {
        const relativePath = path.relative(rootPath, childPath);
        return Boolean(relativePath) && relativePath !== '..' && !relativePath.startsWith(`..${path.sep}`) && !path.isAbsolute(relativePath);
    }
    async findWorktreeByPath(worktrees, worktreePath) {
        const expectedPath = await this.canonicalPath(worktreePath);
        for (const worktree of worktrees) {
            if (await this.canonicalPath(worktree.path) === expectedPath) {
                return worktree;
            }
        }
        return undefined;
    }
    async canonicalPath(value) {
        try {
            return await fs.promises.realpath(value);
        }
        catch {
            return path.resolve(value);
        }
    }
    parseWorktreePorcelain(output) {
        const lines = output.trim().split('\n');
        const result = [];
        let current = {};
        for (const line of lines) {
            if (line === '') {
                if (current.path) {
                    result.push({
                        path: current.path,
                        head: current.head || '',
                        branch: current.branch,
                        bare: current.bare ?? false,
                        detached: current.detached ?? false,
                        locked: current.locked ?? false,
                    });
                }
                current = {};
                continue;
            }
            const spaceIndex = line.indexOf(' ');
            const key = spaceIndex >= 0 ? line.slice(0, spaceIndex) : line;
            const value = spaceIndex >= 0 ? line.slice(spaceIndex + 1) : '';
            switch (key) {
                case 'worktree':
                    current.path = value;
                    break;
                case 'HEAD':
                    current.head = value;
                    break;
                case 'branch':
                    current.branch = value;
                    break;
                case 'bare':
                    current.bare = true;
                    break;
                case 'detached':
                    current.detached = true;
                    break;
                case 'locked':
                    current.locked = true;
                    break;
            }
        }
        if (current.path) {
            result.push({
                path: current.path,
                head: current.head || '',
                branch: current.branch,
                bare: current.bare ?? false,
                detached: current.detached ?? false,
                locked: current.locked ?? false,
            });
        }
        return result;
    }
    formatRemoveError(error) {
        const stderr = typeof error?.stderr === 'string' ? error.stderr : '';
        const stdout = typeof error?.stdout === 'string' ? error.stdout : '';
        const message = [stderr, stdout, error?.message || String(error)].filter(Boolean).join('\n').trim();
        if (/contains modified or untracked files|contains.*uncommitted|is dirty/i.test(message)) {
            return 'Cannot remove worktree because it contains uncommitted changes. Commit, stash, or discard those changes first.';
        }
        return message || 'Unknown git worktree remove error.';
    }
}
exports.WorktreeService = WorktreeService;
//# sourceMappingURL=worktree-service.js.map