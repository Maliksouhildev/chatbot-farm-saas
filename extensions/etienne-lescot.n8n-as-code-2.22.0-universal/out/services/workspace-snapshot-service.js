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
exports.WorkspaceSnapshotService = void 0;
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const crypto_1 = require("crypto");
const util_1 = require("util");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
class WorkspaceSnapshotService {
    log;
    snapshotRoot;
    constructor(storageRoot, log = () => { }) {
        this.log = log;
        this.snapshotRoot = path.join(storageRoot, 'agent-workspace-snapshots');
    }
    async capture(workspaceRoot, label) {
        if (!workspaceRoot)
            return undefined;
        const resolvedRoot = path.resolve(workspaceRoot);
        if (!fs.existsSync(resolvedRoot))
            return undefined;
        try {
            await this.ensureSnapshotRepo(resolvedRoot);
            await this.git(resolvedRoot, ['add', '-A', '--', '.']);
            const message = `${label}\n\nworkspace: ${resolvedRoot}`;
            const { stdout } = await this.git(resolvedRoot, ['commit', '--allow-empty', '-m', message]);
            const match = stdout.match(/\[[^\s]+(?:\s+\([^)]+\))?\s+([a-f0-9]+)\]/i);
            if (match?.[1]) {
                return await this.revParse(resolvedRoot, match[1]);
            }
            return this.revParse(resolvedRoot, 'HEAD');
        }
        catch (error) {
            this.log(`[n8n-agent] Workspace snapshot failed: ${error?.message || String(error)}`);
            return undefined;
        }
    }
    async restore(workspaceRoot, snapshotId) {
        if (!snapshotId)
            return;
        if (!workspaceRoot) {
            throw new Error('Cannot restore workspace snapshot without an open workspace.');
        }
        const resolvedRoot = path.resolve(workspaceRoot);
        await this.ensureSnapshotRepo(resolvedRoot);
        await this.capture(resolvedRoot, 'Before checkpoint rewind restore');
        const currentFiles = await this.listTreeFiles(resolvedRoot, 'HEAD');
        await this.removeTrackedFiles(resolvedRoot, currentFiles);
        await this.checkoutTree(resolvedRoot, snapshotId);
        await this.git(resolvedRoot, ['read-tree', snapshotId]);
    }
    async listTreeFiles(workspaceRoot, treeish) {
        const { stdout } = await this.git(workspaceRoot, ['ls-tree', '-r', '-z', '--name-only', treeish]);
        return stdout.split('\0').filter(Boolean);
    }
    async removeTrackedFiles(workspaceRoot, files) {
        const directories = new Set();
        for (const file of files) {
            const absolutePath = this.resolveWorkspacePath(workspaceRoot, file);
            directories.add(path.dirname(absolutePath));
            await this.removePathIfPresent(absolutePath);
        }
        const sortedDirectories = Array.from(directories)
            .filter((directory) => path.relative(workspaceRoot, directory))
            .sort((a, b) => b.length - a.length);
        for (const directory of sortedDirectories) {
            await this.removeEmptyDirectory(directory);
        }
    }
    async removePathIfPresent(absolutePath) {
        let stat;
        try {
            stat = await fs.promises.lstat(absolutePath);
        }
        catch (error) {
            if (error?.code === 'ENOENT')
                return;
            throw error;
        }
        if (stat.isDirectory() && !stat.isSymbolicLink()) {
            await fs.promises.rm(absolutePath, { recursive: true });
        }
        else {
            await fs.promises.unlink(absolutePath);
        }
    }
    async removeEmptyDirectory(absolutePath) {
        try {
            await fs.promises.rmdir(absolutePath);
        }
        catch (error) {
            if (error?.code === 'ENOENT' || error?.code === 'ENOTEMPTY' || error?.code === 'EEXIST')
                return;
            throw error;
        }
    }
    async checkoutTree(workspaceRoot, treeish) {
        const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'n8nac-snapshot-index-'));
        const env = { GIT_INDEX_FILE: path.join(tempDir, 'index') };
        try {
            await this.git(workspaceRoot, ['read-tree', treeish], { env });
            await this.git(workspaceRoot, ['checkout-index', '-a', '-f', `--prefix=${this.checkoutPrefix(workspaceRoot)}`], { env });
        }
        finally {
            await this.removeTempDirectory(tempDir);
        }
    }
    async removeTempDirectory(absolutePath) {
        try {
            await fs.promises.rm(absolutePath, { recursive: true });
        }
        catch (error) {
            if (error?.code === 'ENOENT')
                return;
            throw error;
        }
    }
    checkoutPrefix(workspaceRoot) {
        return workspaceRoot.endsWith(path.sep) ? workspaceRoot : `${workspaceRoot}${path.sep}`;
    }
    resolveWorkspacePath(workspaceRoot, file) {
        const absolutePath = path.resolve(workspaceRoot, file);
        const relativePath = path.relative(workspaceRoot, absolutePath);
        if (!relativePath || relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
            throw new Error(`Snapshot path escapes workspace: ${file}`);
        }
        return absolutePath;
    }
    async ensureSnapshotRepo(workspaceRoot) {
        const gitDir = this.gitDir(workspaceRoot);
        if (!fs.existsSync(gitDir)) {
            await fs.promises.mkdir(path.dirname(gitDir), { recursive: true });
            await execFileAsync('git', ['init', '--bare', gitDir], { maxBuffer: 10 * 1024 * 1024 });
        }
        await fs.promises.mkdir(path.join(gitDir, 'info'), { recursive: true });
        await fs.promises.writeFile(path.join(gitDir, 'info', 'exclude'), [
            '.git',
            '.git/',
            '.git/**',
            '',
        ].join('\n'), 'utf8');
        await this.git(workspaceRoot, ['config', 'user.name', 'n8n Agent Workbench']);
        await this.git(workspaceRoot, ['config', 'user.email', 'n8n-agent-workbench@localhost']);
        await this.git(workspaceRoot, ['config', 'commit.gpgsign', 'false']);
        await this.git(workspaceRoot, ['config', 'core.autocrlf', 'false']);
    }
    async revParse(workspaceRoot, ref) {
        const { stdout } = await this.git(workspaceRoot, ['rev-parse', ref]);
        return stdout.trim();
    }
    async git(workspaceRoot, args, options = {}) {
        const result = await execFileAsync('git', [
            `--git-dir=${this.gitDir(workspaceRoot)}`,
            `--work-tree=${workspaceRoot}`,
            ...args,
        ], {
            cwd: workspaceRoot,
            env: options.env ? { ...process.env, ...options.env } : process.env,
            maxBuffer: 50 * 1024 * 1024,
        });
        return {
            stdout: String(result.stdout || ''),
            stderr: String(result.stderr || ''),
        };
    }
    gitDir(workspaceRoot) {
        const id = (0, crypto_1.createHash)('sha256').update(path.resolve(workspaceRoot)).digest('hex').slice(0, 32);
        return path.join(this.snapshotRoot, `${id}.git`);
    }
}
exports.WorkspaceSnapshotService = WorkspaceSnapshotService;
//# sourceMappingURL=workspace-snapshot-service.js.map