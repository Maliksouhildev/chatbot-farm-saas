"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GITHUB_COPILOT_DEFAULT_MODEL = exports.DEFAULT_COPILOT_API_BASE_URL = void 0;
exports.resolveCopilotApiToken = resolveCopilotApiToken;
exports.fetchGitHubCopilotModels = fetchGitHubCopilotModels;
const node_fs_1 = __importDefault(require("node:fs"));
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
exports.DEFAULT_COPILOT_API_BASE_URL = 'https://api.individual.githubcopilot.com';
exports.GITHUB_COPILOT_DEFAULT_MODEL = 'gpt-4.1';
const COPILOT_TOKEN_URL = 'https://api.github.com/copilot_internal/v2/token';
const COPILOT_USER_AGENT = 'GitHubCopilotChat/0.26.7';
const COPILOT_EDITOR_VERSION = 'vscode/1.96.2';
const COPILOT_EDITOR_PLUGIN_VERSION = 'copilot-chat/0.26.7';
async function resolveCopilotApiToken(githubToken) {
    const cachePath = getCopilotTokenCachePath();
    const cached = readCachedCopilotToken(cachePath);
    if (cached && isCopilotTokenUsable(cached)) {
        return {
            token: cached.token,
            expiresAt: cached.expiresAt,
            baseUrl: deriveCopilotApiBaseUrlFromToken(cached.token) ?? exports.DEFAULT_COPILOT_API_BASE_URL,
        };
    }
    const response = await fetch(COPILOT_TOKEN_URL, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${githubToken}`,
            'User-Agent': COPILOT_USER_AGENT,
        },
    });
    if (!response.ok) {
        throw new Error(`Copilot token exchange failed: HTTP ${response.status}`);
    }
    const payload = parseCopilotTokenResponse(await response.json());
    writeCachedCopilotToken(cachePath, {
        token: payload.token,
        expiresAt: payload.expiresAt,
        updatedAt: Date.now(),
    });
    return {
        token: payload.token,
        expiresAt: payload.expiresAt,
        baseUrl: deriveCopilotApiBaseUrlFromToken(payload.token) ?? exports.DEFAULT_COPILOT_API_BASE_URL,
    };
}
async function fetchGitHubCopilotModels(githubToken) {
    const runtimeAuth = await resolveCopilotApiToken(githubToken);
    const response = await fetch(`${runtimeAuth.baseUrl}/models`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${runtimeAuth.token}`,
            Accept: 'application/json',
            'User-Agent': COPILOT_USER_AGENT,
            'Editor-Version': COPILOT_EDITOR_VERSION,
            'Editor-Plugin-Version': COPILOT_EDITOR_PLUGIN_VERSION,
        },
    });
    if (!response.ok) {
        const body = await response.text().catch(() => '');
        const detail = body.trim();
        throw new Error(detail || `GitHub Copilot model discovery failed: HTTP ${response.status}`);
    }
    const payload = await response.json();
    const models = (payload.data ?? [])
        .map((entry) => entry.id?.trim())
        .filter((entry) => Boolean(entry))
        .sort((a, b) => a.localeCompare(b));
    return [...new Set(models)];
}
function getCopilotTokenCachePath() {
    const override = readOptionalString(process.env.N8N_COPILOT_TOKEN_CACHE_PATH);
    if (override) {
        return override;
    }
    return node_path_1.default.join(node_os_1.default.homedir(), '.n8n-as-code', 'copilot-runtime-token.json');
}
function readCachedCopilotToken(cachePath) {
    try {
        const parsed = JSON.parse(node_fs_1.default.readFileSync(cachePath, 'utf8'));
        if (typeof parsed.token !== 'string' || typeof parsed.expiresAt !== 'number') {
            return undefined;
        }
        return {
            token: parsed.token,
            expiresAt: parsed.expiresAt,
            updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0,
        };
    }
    catch {
        return undefined;
    }
}
function writeCachedCopilotToken(cachePath, token) {
    try {
        node_fs_1.default.mkdirSync(node_path_1.default.dirname(cachePath), { recursive: true });
        node_fs_1.default.writeFileSync(cachePath, JSON.stringify(token, null, 2), { mode: 0o600 });
    }
    catch {
        // Non-fatal: a failed cache write should not block the current run.
    }
}
function isCopilotTokenUsable(token) {
    return typeof token.token === 'string' && token.token.length > 0 && token.expiresAt > Date.now() + 60_000;
}
function parseCopilotTokenResponse(payload) {
    const record = payload && typeof payload === 'object' ? payload : {};
    const token = readOptionalString(record.token);
    if (!token) {
        throw new Error('Copilot token exchange returned no token.');
    }
    const expiresAtSeconds = typeof record.expires_at === 'number' ? record.expires_at : undefined;
    const expiresInSeconds = typeof record.expires_in === 'number' ? record.expires_in : undefined;
    const expiresAt = expiresAtSeconds
        ? expiresAtSeconds * 1000
        : Date.now() + ((expiresInSeconds ?? 300) * 1000);
    return { token, expiresAt };
}
function deriveCopilotApiBaseUrlFromToken(token) {
    const payload = parseJwtPayload(token);
    const endpoints = payload?.endpoints;
    if (!endpoints || typeof endpoints !== 'object') {
        return undefined;
    }
    const api = endpoints.api;
    return readOptionalString(api);
}
function parseJwtPayload(token) {
    try {
        const [, payload] = token.split('.');
        if (!payload) {
            return undefined;
        }
        return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    }
    catch {
        return undefined;
    }
}
function readOptionalString(value) {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}
//# sourceMappingURL=copilot-account.js.map