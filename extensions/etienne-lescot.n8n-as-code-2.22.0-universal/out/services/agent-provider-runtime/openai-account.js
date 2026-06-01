"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CODEX_REASONING_EFFORT_OPTIONS = exports.OPENAI_ACCOUNT_DEFAULT_MODEL = exports.OPENAI_ACCOUNT_BASE_URL = void 0;
exports.getDefaultCodexReasoningEffort = getDefaultCodexReasoningEffort;
exports.beginCodexAuth = beginCodexAuth;
exports.beginCodexDeviceAuth = beginCodexDeviceAuth;
exports.completeCodexAuth = completeCodexAuth;
exports.completeCodexDeviceAuth = completeCodexDeviceAuth;
exports.getCodexAuthPath = getCodexAuthPath;
exports.ensureOpenAiAccountSession = ensureOpenAiAccountSession;
exports.getOpenAiAccountSession = getOpenAiAccountSession;
exports.fetchOpenAiAccountModels = fetchOpenAiAccountModels;
exports.validateOpenAiAccountRuntime = validateOpenAiAccountRuntime;
exports.createOpenAiAccountLanguageModel = createOpenAiAccountLanguageModel;
exports.ensureCodexInstructions = ensureCodexInstructions;
exports.ensureCodexSessionId = ensureCodexSessionId;
const node_fs_1 = __importDefault(require("node:fs"));
const node_http_1 = __importDefault(require("node:http"));
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const node_crypto_1 = require("node:crypto");
const tool_schema_js_1 = require("./tool-schema.js");
const utils_js_1 = require("./utils.js");
exports.OPENAI_ACCOUNT_BASE_URL = 'https://chatgpt.com/backend-api';
exports.OPENAI_ACCOUNT_DEFAULT_MODEL = 'gpt-5.4';
/**
 * The originator value sent in the `originator` header.
 * Matches the value used by the official Codex CLI, so the backend
 * can attribute requests to a known client family.
 */
const CODEX_ORIGINATOR = 'codex_cli_rs';
const CODEX_INSTALLATION_ID_FILENAME = 'codex_installation_id';
const CODEX_DEFAULT_INSTRUCTIONS = `You are Codex, based on GPT-5. You are running as a coding agent inside the n8n Workbench on the user's computer.

Prefer acting with the available tools over prolonged deliberation. In the Workbench, use the dedicated file tools for reading and editing files instead of shell commands when possible, and use shell tools primarily for commands, package managers, git, and runtime checks.`;
/**
 * Reasoning effort level for Codex responses API.
 * Corresponds to the `reasoning_effort` parameter accepted by the API.
 * - 'none': No reasoning (fastest)
 * - 'minimal': Minimal reasoning (~5-10% of budget)
 * - 'low': Low reasoning (~10-20% of max_completion_tokens)
 * - 'medium': Medium reasoning (~50% of max_completion_tokens) — default
 * - 'high': High reasoning (~80% of max_completion_tokens)
 * - 'xhigh': Extra high reasoning (~95% of max_completion_tokens)
 */
exports.CODEX_REASONING_EFFORT_OPTIONS = ['none', 'minimal', 'low', 'medium', 'high', 'xhigh'];
function getDefaultCodexReasoningEffort(modelId) {
    return /^gpt-5\.4(?:$|[-.])/i.test(modelId) ? 'none' : 'medium';
}
function toCodexReasoningPayload(modelId, reasoningEffort) {
    if (reasoningEffort === 'none') {
        return {};
    }
    const effort = reasoningEffort === 'minimal'
        ? 'low'
        : reasoningEffort === 'xhigh'
            ? 'high'
            : reasoningEffort;
    return {
        reasoning: {
            effort,
            ...(/^gpt-5/i.test(modelId) ? { summary: 'auto' } : {}),
        },
    };
}
/** Endpoint path for Codex responses on the ChatGPT backend. */
const CODEX_RESPONSES_PATH = '/codex/responses';
const CODEX_MODELS_PATH = '/codex/models';
let modelDiscoveryCache = null;
const MODEL_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
/** JWT claim namespace used by OpenAI to embed ChatGPT account metadata. */
const JWT_ACCOUNT_CLAIM = 'https://api.openai.com/auth';
// ─── OAuth / PKCE constants ────────────────────────────────────────────────────
const CODEX_ISSUER = 'https://auth.openai.com';
const CODEX_TOKEN_ENDPOINT = 'https://auth.openai.com/oauth/token';
const CODEX_DEVICE_AUTHORIZATION_ENDPOINT = 'https://auth.openai.com/api/accounts/deviceauth/usercode';
const CODEX_DEVICE_TOKEN_ENDPOINT = 'https://auth.openai.com/api/accounts/deviceauth/token';
const CODEX_DEVICE_REDIRECT_URI = 'https://auth.openai.com/deviceauth/callback';
const CODEX_DEVICE_POLLING_SAFETY_MARGIN_MS = 3000;
const CODEX_CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';
const CODEX_CALLBACK_PORT = 1455;
const CODEX_CALLBACK_PATH = '/auth/callback';
const CODEX_REDIRECT_URI = `http://localhost:${CODEX_CALLBACK_PORT}${CODEX_CALLBACK_PATH}`;
const CODEX_SCOPES = 'openid profile email offline_access';
let pendingCodexCallbackServer;
// Survives stopCodexCallbackServer() so completeCodexAuth() can still await it.
let pendingCodexResult;
// Persists even when the callback server fails to bind, so pasted redirect URLs
// can still be validated when callbackServerStarted: false.
let pendingCodexState;
let pendingCodexVerifier;
function generateCodexPkce() {
    const verifier = (0, node_crypto_1.randomBytes)(32).toString('hex');
    const challenge = (0, node_crypto_1.createHash)('sha256').update(verifier).digest('base64url');
    return { verifier, challenge };
}
function stopCodexCallbackServer() {
    if (pendingCodexCallbackServer) {
        clearTimeout(pendingCodexCallbackServer.timeout);
        pendingCodexCallbackServer.server.close();
        pendingCodexCallbackServer = undefined;
        // Note: pendingCodexResult, pendingCodexState, pendingCodexVerifier are intentionally preserved.
    }
}
async function startCodexCallbackServer(state, verifier) {
    // Persist state/verifier before attempting to bind, so pasted redirect URLs
    // remain valid even when the server fails to start (e.g. port in use / headless).
    pendingCodexState = state;
    pendingCodexVerifier = verifier;
    stopCodexCallbackServer();
    let resolveCode;
    let rejectCode;
    const waitForCode = new Promise((resolve, reject) => {
        resolveCode = resolve;
        rejectCode = reject;
    });
    const server = node_http_1.default.createServer((req, res) => {
        const url = new URL(req.url ?? '/', CODEX_REDIRECT_URI);
        if (url.pathname !== CODEX_CALLBACK_PATH) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            return;
        }
        const returnedState = url.searchParams.get('state');
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');
        if (error || returnedState !== state || !code) {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<html><body><h3>Sign-in failed.</h3><p>Return to the terminal and try again.</p></body></html>');
            rejectCode?.(new Error(error ?? 'OAuth callback: invalid state or missing code.'));
            stopCodexCallbackServer();
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<html><body><h3>OpenAI account connected.</h3><p>You can return to the n8n Workbench setup wizard.</p></body></html>');
        resolveCode?.({ code, verifier });
        stopCodexCallbackServer();
    });
    const timeout = setTimeout(() => {
        rejectCode?.(new Error('OpenAI OAuth callback timed out. Please retry.'));
        stopCodexCallbackServer();
    }, 3 * 60_000);
    pendingCodexCallbackServer = { expectedState: state, verifier, server, waitForCode, timeout };
    pendingCodexResult = waitForCode;
    const started = await new Promise((resolve) => {
        server.once('error', (err) => {
            rejectCode?.(err instanceof Error ? err : new Error(String(err)));
            stopCodexCallbackServer();
            resolve(false);
        });
        server.listen(CODEX_CALLBACK_PORT, '127.0.0.1', () => resolve(true));
    });
    return started;
}
async function beginCodexAuth() {
    const state = (0, node_crypto_1.randomBytes)(16).toString('hex');
    const { verifier, challenge } = generateCodexPkce();
    const serverStarted = await startCodexCallbackServer(state, verifier);
    const url = new URL(`${CODEX_ISSUER}/oauth/authorize`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', CODEX_CLIENT_ID);
    url.searchParams.set('redirect_uri', CODEX_REDIRECT_URI);
    url.searchParams.set('scope', CODEX_SCOPES);
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('id_token_add_organizations', 'true');
    url.searchParams.set('codex_cli_simplified_flow', 'true');
    url.searchParams.set('originator', 'n8n-workbench');
    url.searchParams.set('state', state);
    return { authUrl: url.toString(), callbackServerStarted: serverStarted };
}
async function beginCodexDeviceAuth() {
    const response = await fetch(CODEX_DEVICE_AUTHORIZATION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: CODEX_CLIENT_ID }),
    });
    if (!response.ok) {
        let errorCode;
        let errorDescription;
        try {
            const errorPayload = await response.json();
            errorCode = errorPayload.error;
            errorDescription = errorPayload.error_description ?? errorPayload.message;
        }
        catch {
            // Ignore non-JSON error responses.
        }
        throw new Error(errorDescription
            ? `OpenAI device login failed: ${errorDescription}`
            : errorCode
                ? `OpenAI device login failed: ${errorCode}`
                : `OpenAI device login failed: HTTP ${response.status}`);
    }
    const device = await response.json();
    if (!device.device_auth_id || !device.user_code) {
        throw new Error('OpenAI device login returned an incomplete challenge.');
    }
    const intervalSeconds = Number.parseInt(device.interval ?? '5', 10);
    const intervalMs = Math.max(Number.isFinite(intervalSeconds) ? intervalSeconds : 5, 1) * 1000;
    return {
        verificationUri: `${CODEX_ISSUER}/codex/device`,
        verificationUriComplete: undefined,
        userCode: device.user_code,
        deviceAuthId: device.device_auth_id,
        intervalMs,
        expiresAt: Date.now() + ((device.expires_in ?? 600) * 1000),
    };
}
function persistCodexSession(tokens) {
    const authPath = getCodexAuthPath();
    node_fs_1.default.mkdirSync(node_path_1.default.dirname(authPath), { recursive: true });
    node_fs_1.default.writeFileSync(authPath, JSON.stringify({
        auth_mode: 'chatgpt',
        tokens,
        last_refresh: new Date().toISOString(),
    }, null, 2), { mode: 0o600 });
    return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        source: 'codex',
    };
}
function readManualCodexCallback(input) {
    const trimmed = input.trim();
    if (!trimmed) {
        return undefined;
    }
    const expectedState = pendingCodexState;
    const verifier = pendingCodexVerifier;
    if (!expectedState || !verifier) {
        throw new Error('No pending OpenAI OAuth session. Restart the sign-in flow.');
    }
    let callbackUrl;
    try {
        callbackUrl = new URL(trimmed, CODEX_REDIRECT_URI);
    }
    catch {
        throw new Error('Paste the full OpenAI callback URL after signing in.');
    }
    const returnedState = callbackUrl.searchParams.get('state');
    const code = callbackUrl.searchParams.get('code');
    const error = callbackUrl.searchParams.get('error');
    if (error || returnedState !== expectedState || !code) {
        throw new Error(error ?? 'OAuth callback: invalid state or missing code.');
    }
    stopCodexCallbackServer();
    pendingCodexResult = undefined;
    pendingCodexState = undefined;
    pendingCodexVerifier = undefined;
    return { code, verifier };
}
async function completeCodexAuth(input = '') {
    const manualResult = readManualCodexCallback(input);
    if (manualResult) {
        const { code, verifier } = manualResult;
        const body = new URLSearchParams();
        body.set('grant_type', 'authorization_code');
        body.set('code', code);
        body.set('redirect_uri', CODEX_REDIRECT_URI);
        body.set('client_id', CODEX_CLIENT_ID);
        body.set('code_verifier', verifier);
        const tokenRes = await fetch(CODEX_TOKEN_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });
        if (!tokenRes.ok) {
            throw new Error(`OpenAI token exchange failed: HTTP ${tokenRes.status}`);
        }
        const tokens = await tokenRes.json();
        if (!tokens.access_token) {
            throw new Error('OpenAI token exchange returned no access_token.');
        }
        return persistCodexSession(tokens);
    }
    // The callback server may have already fired and cleared pendingCodexCallbackServer,
    // but the promise is preserved in pendingCodexResult.
    const resultPromise = pendingCodexCallbackServer?.waitForCode ?? pendingCodexResult;
    if (!resultPromise) {
        const existing = readCodexSession();
        if (existing)
            return existing;
        throw new Error('No pending OpenAI OAuth session. Restart the sign-in flow.');
    }
    pendingCodexResult = undefined;
    const { code, verifier } = await resultPromise;
    // Exchange code for tokens.
    const body = new URLSearchParams();
    body.set('grant_type', 'authorization_code');
    body.set('code', code);
    body.set('redirect_uri', CODEX_REDIRECT_URI);
    body.set('client_id', CODEX_CLIENT_ID);
    body.set('code_verifier', verifier);
    const tokenRes = await fetch(CODEX_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
    });
    if (!tokenRes.ok) {
        throw new Error(`OpenAI token exchange failed: HTTP ${tokenRes.status}`);
    }
    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
        throw new Error('OpenAI token exchange returned no access_token.');
    }
    return persistCodexSession(tokens);
}
async function completeCodexDeviceAuth(challenge) {
    const intervalMs = Math.max(1000, challenge.intervalMs);
    while (Date.now() < challenge.expiresAt) {
        const response = await fetch(CODEX_DEVICE_TOKEN_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                device_auth_id: challenge.deviceAuthId,
                user_code: challenge.userCode,
            }),
        });
        if (response.ok) {
            const deviceToken = await response.json();
            if (!deviceToken.authorization_code || !deviceToken.code_verifier) {
                throw new Error('OpenAI device login returned an incomplete authorization result.');
            }
            const body = new URLSearchParams();
            body.set('grant_type', 'authorization_code');
            body.set('code', deviceToken.authorization_code);
            body.set('redirect_uri', CODEX_DEVICE_REDIRECT_URI);
            body.set('client_id', CODEX_CLIENT_ID);
            body.set('code_verifier', deviceToken.code_verifier);
            const tokenResponse = await fetch(CODEX_TOKEN_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString(),
            });
            if (!tokenResponse.ok) {
                throw new Error(`OpenAI token exchange failed: HTTP ${tokenResponse.status}`);
            }
            const tokens = await tokenResponse.json();
            if (!tokens.access_token) {
                throw new Error('OpenAI device login returned no access_token.');
            }
            return persistCodexSession(tokens);
        }
        if (response.status !== 403 && response.status !== 404) {
            let payload;
            try {
                payload = await response.json();
            }
            catch {
                payload = undefined;
            }
            throw new Error(payload?.error_description || payload?.message || payload?.error || `OpenAI device flow failed: HTTP ${response.status}`);
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs + CODEX_DEVICE_POLLING_SAFETY_MARGIN_MS));
    }
    throw new Error('OpenAI device code expired. Retry setup.');
}
// ─── Path helpers ──────────────────────────────────────────────────────────────
/** Path to the Codex CLI auth file. Override with N8N_CODEX_AUTH_PATH for tests. */
function getCodexAuthPath() {
    return process.env.N8N_CODEX_AUTH_PATH || node_path_1.default.join(node_os_1.default.homedir(), '.codex', 'auth.json');
}
// ─── Session readers ───────────────────────────────────────────────────────────
function readCodexSession() {
    const authPath = getCodexAuthPath();
    if (!node_fs_1.default.existsSync(authPath)) {
        return undefined;
    }
    try {
        const parsed = JSON.parse(node_fs_1.default.readFileSync(authPath, 'utf8'));
        const accessToken = parsed.tokens?.access_token?.trim();
        if (!accessToken) {
            return undefined;
        }
        return {
            accessToken,
            refreshToken: parsed.tokens?.refresh_token?.trim() || undefined,
            source: 'codex',
        };
    }
    catch {
        return undefined;
    }
}
// ─── Token refresh ──────────────────────────────────────────────────────────────
/** Returns the expiry time (in seconds since epoch) from an access token's JWT payload. */
function getTokenExpiry(accessToken) {
    try {
        const parts = accessToken.split('.');
        if (parts.length !== 3)
            return undefined;
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        const exp = payload['exp'];
        return typeof exp === 'number' ? exp : undefined;
    }
    catch {
        return undefined;
    }
}
/** Returns true when the token expires within `minValiditySeconds` from now. */
function isTokenExpiringSoon(accessToken, minValiditySeconds = 60) {
    const expiry = getTokenExpiry(accessToken);
    if (expiry === undefined)
        return false;
    return Date.now() / 1000 + minValiditySeconds > expiry;
}
/** Refreshes the access token using the stored refresh token.
 *  Updates ~/.codex/auth.json with the new tokens. */
async function refreshCodexToken(refreshToken) {
    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', refreshToken);
    body.set('client_id', CODEX_CLIENT_ID);
    const res = await fetch(CODEX_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
    });
    if (!res.ok) {
        throw new Error(`Token refresh failed: HTTP ${res.status}`);
    }
    const tokens = await res.json();
    if (!tokens.access_token) {
        throw new Error('Token refresh returned no access_token.');
    }
    // Persist updated tokens to ~/.codex/auth.json
    const authPath = getCodexAuthPath();
    const existing = node_fs_1.default.existsSync(authPath)
        ? JSON.parse(node_fs_1.default.readFileSync(authPath, 'utf8'))
        : { tokens: {} };
    existing.tokens = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? refreshToken,
        account_id: existing.tokens?.account_id,
    };
    existing.last_refresh = new Date().toISOString();
    node_fs_1.default.mkdirSync(node_path_1.default.dirname(authPath), { recursive: true });
    node_fs_1.default.writeFileSync(authPath, JSON.stringify(existing, null, 2), { mode: 0o600 });
    return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? refreshToken,
        source: 'codex',
    };
}
/** Reads the session and automatically refreshes if the access token is expiring soon. */
async function ensureOpenAiAccountSession(accessToken) {
    const explicitAccessToken = accessToken?.trim();
    if (explicitAccessToken) {
        return {
            accessToken: explicitAccessToken,
            source: 'codex',
        };
    }
    const session = readCodexSession();
    if (!session)
        return undefined;
    // Check if token is expired or about to expire (within 60s)
    if (isTokenExpiringSoon(session.accessToken)) {
        if (session.refreshToken) {
            try {
                return await refreshCodexToken(session.refreshToken);
            }
            catch {
                // Refresh failed — return stale session and let the API call fail naturally
            }
        }
        // If refresh failed or no refresh token, still return the session
        // The API call will fail naturally if the token is truly expired
    }
    return session;
}
// ─── Public session API ────────────────────────────────────────────────────────
function getOpenAiAccountSession() {
    return readCodexSession();
}
// ─── Model discovery ───────────────────────────────────────────────────────────
/**
 * Fetches available models from the ChatGPT Codex backend with ETag caching.
 *
 * Discovery policy — all models compatible with the ChatGPT/Codex OAuth plan,
 * shown in the account's model selector (visibility = "list").  This includes
 * models regardless of their `supported_in_api` flag, because some plans expose
 * models that are not yet surfaced in the standalone API but are usable through
 * the ChatGPT UI and the Codex relay.
 *
 * Filter chain applied to the `/codex/models` payload:
 *   1. non-empty slug
 *   2. visibility === "list"  (excludes internal / hidden entries)
 *   3. no further filter on `supported_in_api`
 *   4. sorted by ascending `priority`
 *
 * Falls back to the in-memory cache on network failure or 304 Not Modified.
 * Returns `[]` if the cache is empty and the network call fails.
 */
async function fetchOpenAiAccountModels(accessToken) {
    const now = Date.now();
    // Return cached data if still valid (within TTL and have ETag for conditional request)
    if (modelDiscoveryCache && (now - modelDiscoveryCache.timestamp) < MODEL_CACHE_TTL_MS) {
        return modelDiscoveryCache.models;
    }
    try {
        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        };
        try {
            const accountId = extractChatGptAccountId(accessToken);
            headers['chatgpt-account-id'] = accountId;
        }
        catch {
            // Account ID not available in token, proceed without it
        }
        // Include If-None-Match if we have an ETag from previous request
        if (modelDiscoveryCache?.etag) {
            headers['If-None-Match'] = modelDiscoveryCache.etag;
        }
        const response = await fetch(`${exports.OPENAI_ACCOUNT_BASE_URL}${CODEX_MODELS_PATH}?client_version=1.0.0`, { headers });
        if (response.status === 304 && modelDiscoveryCache) {
            // Not modified - update timestamp and return cached data
            modelDiscoveryCache.timestamp = now;
            return modelDiscoveryCache.models;
        }
        if (!response.ok) {
            throw new Error(`Model discovery failed: ${response.status} ${response.statusText}`);
        }
        const data = (await response.json());
        const models = (data.models ?? [])
            .filter((model) => typeof model.slug === 'string' && model.slug.trim().length > 0)
            .filter((model) => (model.visibility ?? 'list') === 'list')
            .sort((left, right) => (left.priority ?? Number.MAX_SAFE_INTEGER) - (right.priority ?? Number.MAX_SAFE_INTEGER))
            .map((model) => model.slug.trim());
        if (models.length === 0) {
            // API returned no compatible models, don't overwrite cache with an empty list.
            return modelDiscoveryCache?.models ?? [];
        }
        // Update cache
        modelDiscoveryCache = {
            models,
            etag: response.headers.get('ETag') ?? modelDiscoveryCache?.etag ?? null,
            timestamp: now,
        };
        return models;
    }
    catch (error) {
        // On error, return cached data if available. Avoid inventing models the account may not support.
        if (modelDiscoveryCache?.models.length) {
            return modelDiscoveryCache.models;
        }
        console.warn(`[openai-account] Model discovery failed: ${error instanceof Error ? error.message : String(error)}.`);
        return [];
    }
}
// ─── Runtime validation ─────────────────────────────────────────────────────────
async function validateOpenAiAccountRuntime(modelId = exports.OPENAI_ACCOUNT_DEFAULT_MODEL) {
    if (process.env.N8N_SKIP_CODEX_RUNTIME_VALIDATION === '1') {
        return { ok: true, text: 'OK' };
    }
    const session = await ensureOpenAiAccountSession();
    if (!session) {
        return { ok: false, error: 'No OpenAI account session found.' };
    }
    try {
        const result = await runOpenAiAccountCompletion(modelId, {
            inputFormat: 'prompt',
            mode: { type: 'regular' },
            prompt: [{ role: 'user', content: [{ type: 'text', text: 'Reply with exactly OK.' }] }],
        });
        return {
            ok: result.text.trim().toUpperCase().includes('OK'),
            text: result.text,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
            return { ok: true, text: 'Quota exhausted for current model; runtime endpoint is reachable.' };
        }
        return { ok: false, error: message };
    }
}
// ─── Language model ────────────────────────────────────────────────────────────
function createOpenAiAccountLanguageModel(modelId, reasoningEffort = getDefaultCodexReasoningEffort(modelId), sessionId, accessToken) {
    return {
        specificationVersion: 'v1',
        provider: 'openai-oauth.account',
        modelId,
        defaultObjectGenerationMode: undefined,
        supportsImageUrls: false,
        supportsStructuredOutputs: false,
        async doGenerate(options) {
            const execution = await runOpenAiAccountCompletion(modelId, options, reasoningEffort, sessionId, accessToken);
            return {
                text: execution.text,
                finishReason: execution.finishReason,
                usage: execution.usage,
                ...(execution.toolCalls ? { toolCalls: execution.toolCalls } : {}),
                rawCall: {
                    rawPrompt: options.prompt,
                    rawSettings: { modelId },
                },
                warnings: execution.warnings,
                response: {
                    timestamp: new Date(),
                    modelId,
                    ...(execution.responseId ? { id: execution.responseId } : {}),
                    ...(execution.assistantPhase ? { assistantPhase: execution.assistantPhase } : {}),
                    ...(execution.rawOutputItems ? { rawOutputItems: execution.rawOutputItems } : {}),
                },
            };
        },
        async doStream(options) {
            const session = await ensureOpenAiAccountSession(accessToken);
            if (!session) {
                throw new Error('OpenAI account session not found. Run `codex --login` to sign in.');
            }
            const regularMode = options.mode.type === 'regular' ? options.mode : undefined;
            const tools = getFunctionTools(options.mode);
            const accountId = extractChatGptAccountId(session.accessToken);
            const { instructions, input } = convertPromptToCodexInput(options.prompt);
            const reasoning = toCodexReasoningPayload(modelId, reasoningEffort);
            const previousResponseId = readOptionalString(options.headers?.['x-n8n-previous-response-id']);
            const codexIdentity = buildCodexIdentity(sessionId);
            const body = {
                model: modelId,
                store: false,
                stream: true,
                instructions: ensureCodexInstructions(instructions),
                input,
                ...reasoning,
                include: ['reasoning.encrypted_content'],
                client_metadata: codexIdentity.clientMetadata,
                ...(previousResponseId ? { previous_response_id: previousResponseId } : {}),
                ...(tools.length > 0 ? { tools: toCodexTools(tools), tool_choice: toCodexToolChoice(regularMode?.toolChoice), parallel_tool_calls: true } : { tool_choice: 'auto' }),
            };
            const response = await (0, utils_js_1.withRetry)(async () => {
                const response = await fetch(`${exports.OPENAI_ACCOUNT_BASE_URL}${CODEX_RESPONSES_PATH}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.accessToken}`,
                        'chatgpt-account-id': accountId,
                        'OpenAI-Beta': 'responses=experimental',
                        'originator': CODEX_ORIGINATOR,
                        'User-Agent': buildCodexUserAgent(),
                        'x-client-request-id': codexIdentity.requestId,
                        'x-codex-window-id': codexIdentity.windowId,
                        'x-codex-installation-id': codexIdentity.installationId,
                        'accept': 'text/event-stream',
                        'content-type': 'application/json',
                        ...(sessionId ? { 'session_id': sessionId } : {}),
                    },
                    body: JSON.stringify(body),
                    signal: options.abortSignal
                        ? AbortSignal.any([options.abortSignal, (0, utils_js_1.timeoutSignal)(utils_js_1.CODEX_UPSTREAM_TIMEOUT_MS, 'codex-streaming')])
                        : (0, utils_js_1.timeoutSignal)(utils_js_1.CODEX_UPSTREAM_TIMEOUT_MS, 'codex-streaming'),
                });
                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(errText.trim() || `Codex completion failed: HTTP ${response.status}`);
                }
                if (!response.body) {
                    throw new Error('Codex completion returned empty response body.');
                }
                return response;
            }, 'Codex streaming completion');
            if (!response.body) {
                throw new Error('Codex completion returned empty response body.');
            }
            let inputTokens = 0;
            let outputTokens = 0;
            let finishReason = 'unknown';
            const toolCalls = new Map();
            let responseId;
            let assistantPhase;
            let rawOutputItems;
            const stream = new ReadableStream({
                async pull(controller) {
                    let completed = false;
                    for await (const event of parseCodexSSE(response.body)) {
                        const type = typeof event.type === 'string' ? event.type : undefined;
                        if (!type)
                            continue;
                        if (type === 'response.output_text.delta') {
                            if (typeof event.delta === 'string') {
                                controller.enqueue({ type: 'text-delta', textDelta: event.delta });
                            }
                        }
                        else if (type === 'response.output_item.added' || type === 'response.output_item.done') {
                            const item = readResponseOutputItem(event);
                            const toolCall = extractCodexToolCallFromItem(item, toolCalls.size);
                            if (toolCall) {
                                toolCalls.set(toolCall.toolCallId, toolCall);
                                controller.enqueue({
                                    type: 'tool-call-delta',
                                    toolCallType: 'function',
                                    toolCallId: toolCall.toolCallId,
                                    toolName: toolCall.toolName,
                                    argsTextDelta: toolCall.args,
                                });
                            }
                            if (item && typeof item === 'object' && item.type === 'message') {
                                const phase = readOptionalString(item.phase);
                                if (phase) {
                                    assistantPhase = phase;
                                }
                            }
                        }
                        else if (type === 'response.function_call_arguments.delta') {
                            const itemId = readOptionalString(event.item_id) || readOptionalString(event.call_id);
                            if (!itemId)
                                continue;
                            const existing = toolCalls.get(itemId);
                            if (!existing || typeof event.delta !== 'string')
                                continue;
                            const delta = event.delta;
                            const newArgs = `${existing.args}${delta}`;
                            toolCalls.set(itemId, { ...existing, args: newArgs });
                            controller.enqueue({
                                type: 'tool-call-delta',
                                toolCallType: 'function',
                                toolCallId: itemId,
                                toolName: existing.toolName,
                                argsTextDelta: delta,
                            });
                        }
                        else if (type === 'response.function_call_arguments.done') {
                            const itemId = readOptionalString(event.item_id) || readOptionalString(event.call_id);
                            if (!itemId)
                                continue;
                            const existing = toolCalls.get(itemId);
                            if (!existing)
                                continue;
                            const finalArgs = readOptionalString(event.arguments) ?? existing.args;
                            toolCalls.set(itemId, { ...existing, args: finalArgs });
                        }
                        else if (type === 'response.completed') {
                            const resp = event.response;
                            responseId = readOptionalString(resp?.id);
                            inputTokens = resp?.usage?.input_tokens ?? 0;
                            outputTokens = resp?.usage?.output_tokens ?? 0;
                            rawOutputItems = Array.isArray(resp?.output)
                                ? resp.output.filter((item) => Boolean(item) && typeof item === 'object')
                                : undefined;
                            for (const item of Array.isArray(resp?.output) ? resp.output : []) {
                                const toolCall = extractCodexToolCallFromItem(item, toolCalls.size);
                                if (toolCall)
                                    toolCalls.set(toolCall.toolCallId, toolCall);
                            }
                            completed = true;
                            break;
                        }
                        else if (type === 'response.failed') {
                            const resp = event.response;
                            throw new Error(resp?.error?.message || 'Codex response failed.');
                        }
                        else if (type === 'error') {
                            const msg = typeof event.message === 'string' ? event.message : '';
                            throw new Error(msg || 'Codex stream error.');
                        }
                    }
                    finishReason = toolCalls.size > 0 ? 'tool-calls' : 'stop';
                    controller.enqueue({
                        type: 'finish',
                        finishReason,
                        usage: { promptTokens: inputTokens, completionTokens: outputTokens },
                        ...((responseId || assistantPhase || rawOutputItems)
                            ? { providerMetadata: { ...(responseId ? { responseId } : {}), ...(assistantPhase ? { assistantPhase } : {}), ...(rawOutputItems ? { rawOutputItems } : {}) } }
                            : {}),
                    });
                    controller.close();
                    if (!completed) {
                        return;
                    }
                },
            });
            return {
                stream,
                rawCall: {
                    rawPrompt: options.prompt,
                    rawSettings: { modelId },
                },
                warnings: [],
            };
        },
    };
}
// ─── Inference (Codex Responses API via chatgpt.com/backend-api) ──────────────
async function runOpenAiAccountCompletion(modelId, options, reasoningEffort = getDefaultCodexReasoningEffort(modelId), sessionId, accessToken) {
    const session = await ensureOpenAiAccountSession(accessToken);
    if (!session) {
        throw new Error('OpenAI account session not found. Run `codex --login` to sign in.');
    }
    const regularMode = options.mode.type === 'regular' ? options.mode : undefined;
    const tools = getFunctionTools(options.mode);
    const warnings = buildCodexWarnings(options, tools);
    const accountId = extractChatGptAccountId(session.accessToken);
    const { instructions, input } = convertPromptToCodexInput(options.prompt);
    const reasoning = toCodexReasoningPayload(modelId, reasoningEffort);
    const previousResponseId = readOptionalString(options.headers?.['x-n8n-previous-response-id']);
    const codexIdentity = buildCodexIdentity(sessionId);
    const body = {
        model: modelId,
        store: false,
        stream: true,
        instructions: ensureCodexInstructions(instructions),
        input,
        ...reasoning,
        include: ['reasoning.encrypted_content'],
        client_metadata: codexIdentity.clientMetadata,
        ...(previousResponseId ? { previous_response_id: previousResponseId } : {}),
        ...(tools.length > 0 ? { tools: toCodexTools(tools), tool_choice: toCodexToolChoice(regularMode?.toolChoice), parallel_tool_calls: true } : { tool_choice: 'auto' }),
    };
    const rawResponse = await (0, utils_js_1.withRetry)(async () => {
        const response = await fetch(`${exports.OPENAI_ACCOUNT_BASE_URL}${CODEX_RESPONSES_PATH}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.accessToken}`,
                'chatgpt-account-id': accountId,
                'OpenAI-Beta': 'responses=experimental',
                'originator': CODEX_ORIGINATOR,
                'User-Agent': buildCodexUserAgent(),
                'x-client-request-id': codexIdentity.requestId,
                'x-codex-window-id': codexIdentity.windowId,
                'x-codex-installation-id': codexIdentity.installationId,
                'accept': 'text/event-stream',
                'content-type': 'application/json',
                ...(sessionId ? { 'session_id': sessionId } : {}),
            },
            body: JSON.stringify(body),
            signal: (0, utils_js_1.timeoutSignal)(utils_js_1.CODEX_UPSTREAM_TIMEOUT_MS, 'codex-non-streaming'),
        });
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText.trim() || `Codex completion failed: HTTP ${response.status}`);
        }
        if (!response.body) {
            throw new Error('Codex completion returned empty response body.');
        }
        return response;
    }, 'Codex non-streaming completion');
    const responseBody = rawResponse.body;
    let text = '';
    let inputTokens = 0;
    let outputTokens = 0;
    const toolCalls = new Map();
    let responseId;
    let assistantPhase;
    let rawOutputItems;
    for await (const event of parseCodexSSE(responseBody)) {
        const type = typeof event.type === 'string' ? event.type : undefined;
        if (!type)
            continue;
        if (type === 'response.output_text.delta') {
            if (typeof event.delta === 'string') {
                text += event.delta;
            }
        }
        else if (type === 'response.output_item.added' || type === 'response.output_item.done') {
            const item = readResponseOutputItem(event);
            const toolCall = extractCodexToolCallFromItem(item, toolCalls.size);
            if (toolCall) {
                toolCalls.set(toolCall.toolCallId, toolCall);
            }
            if (item && typeof item === 'object' && item.type === 'message') {
                const phase = readOptionalString(item.phase);
                if (phase) {
                    assistantPhase = phase;
                }
            }
        }
        else if (type === 'response.function_call_arguments.delta') {
            const itemId = readOptionalString(event.item_id) || readOptionalString(event.call_id);
            if (!itemId) {
                continue;
            }
            const existing = toolCalls.get(itemId);
            if (!existing || typeof event.delta !== 'string') {
                continue;
            }
            toolCalls.set(itemId, {
                ...existing,
                args: `${existing.args}${event.delta}`,
            });
        }
        else if (type === 'response.function_call_arguments.done') {
            const itemId = readOptionalString(event.item_id) || readOptionalString(event.call_id);
            if (!itemId) {
                continue;
            }
            const existing = toolCalls.get(itemId);
            if (!existing) {
                continue;
            }
            const finalArgs = readOptionalString(event.arguments);
            if (finalArgs) {
                toolCalls.set(itemId, {
                    ...existing,
                    args: finalArgs,
                });
            }
        }
        else if (type === 'response.completed') {
            const resp = event.response;
            responseId = readOptionalString(resp?.id);
            inputTokens = resp?.usage?.input_tokens ?? 0;
            outputTokens = resp?.usage?.output_tokens ?? 0;
            rawOutputItems = Array.isArray(resp?.output)
                ? resp.output.filter((item) => Boolean(item) && typeof item === 'object')
                : undefined;
            for (const item of Array.isArray(resp?.output) ? resp.output : []) {
                const toolCall = extractCodexToolCallFromItem(item, toolCalls.size);
                if (toolCall) {
                    toolCalls.set(toolCall.toolCallId, toolCall);
                }
            }
        }
        else if (type === 'response.failed') {
            const resp = event.response;
            throw new Error(resp?.error?.message || 'Codex response failed.');
        }
        else if (type === 'error') {
            const msg = typeof event.message === 'string' ? event.message : '';
            throw new Error(msg || 'Codex stream error.');
        }
    }
    return {
        text,
        finishReason: toolCalls.size > 0 ? 'tool-calls' : 'stop',
        usage: { promptTokens: inputTokens, completionTokens: outputTokens },
        ...(toolCalls.size > 0 ? { toolCalls: [...toolCalls.values()] } : {}),
        warnings,
        ...(responseId ? { responseId } : {}),
        ...(assistantPhase ? { assistantPhase } : {}),
        ...(rawOutputItems ? { rawOutputItems } : {}),
    };
}
// ─── Shared helpers ────────────────────────────────────────────────────────────
function extractChatGptAccountId(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3)
            throw new Error('Invalid token');
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        const claim = payload[JWT_ACCOUNT_CLAIM];
        const accountId = claim?.chatgpt_account_id;
        if (typeof accountId !== 'string' || !accountId) {
            throw new Error('No chatgpt_account_id in token');
        }
        return accountId;
    }
    catch {
        throw new Error('Failed to extract chatgpt_account_id from Codex token. Ensure the token was obtained via `codex --login`.');
    }
}
function convertPromptToCodexInput(prompt) {
    const instructionParts = [];
    const input = [];
    for (const message of prompt) {
        if (message.role === 'system') {
            if (message.content) {
                instructionParts.push(message.content);
            }
            continue;
        }
        if (message.role === 'user') {
            const text = message.content.map((p) => p.type === 'text' ? (p.text ?? '') : `[${p.type}]`).join('\n');
            input.push({ role: 'user', content: [{ type: 'input_text', text }] });
        }
        else if (message.role === 'assistant') {
            if (Array.isArray(message.rawOutputItems) && message.rawOutputItems.length > 0) {
                for (const item of message.rawOutputItems) {
                    const sanitized = sanitizeResponsesOutputItem(item);
                    if (sanitized) {
                        input.push(sanitized);
                    }
                }
                continue;
            }
            const text = message.content
                .filter((p) => p.type === 'text' || p.type === 'reasoning')
                .map((p) => p.text ?? '')
                .join('\n')
                .trim();
            if (text) {
                input.push({ role: 'assistant', content: [{ type: 'output_text', text }], ...(message.phase ? { phase: message.phase } : {}) });
            }
            for (const part of message.content) {
                if (part.type !== 'tool-call') {
                    continue;
                }
                input.push({
                    type: 'function_call',
                    call_id: part.toolCallId,
                    name: part.toolName,
                    arguments: JSON.stringify(part.args ?? {}),
                });
            }
        }
        else {
            for (const part of message.content) {
                input.push({
                    type: 'function_call_output',
                    call_id: part.toolCallId,
                    output: stringifyToolResult(part.result),
                });
            }
        }
    }
    const instructions = instructionParts
        .map((part) => part.trim())
        .filter(Boolean)
        .join('\n\n') || undefined;
    return { instructions, input };
}
function sanitizeResponsesOutputItem(item) {
    const sanitized = { ...item };
    delete sanitized.id;
    delete sanitized.status;
    if (Array.isArray(sanitized.content)) {
        sanitized.content = sanitized.content
            .filter((part) => Boolean(part) && typeof part === 'object')
            .map((part) => {
            const nextPart = { ...part };
            delete nextPart.id;
            delete nextPart.status;
            return nextPart;
        });
    }
    return sanitized;
}
function ensureCodexInstructions(instructions) {
    const trimmed = instructions?.trim();
    if (!trimmed) {
        return CODEX_DEFAULT_INSTRUCTIONS;
    }
    if (trimmed.includes('You are Codex, based on GPT-5.')) {
        return trimmed;
    }
    return `${CODEX_DEFAULT_INSTRUCTIONS}\n\n${trimmed}`;
}
function ensureCodexSessionId(sessionId) {
    const trimmed = sessionId?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : (0, node_crypto_1.randomUUID)();
}
function buildCodexIdentity(sessionId) {
    const requestId = ensureCodexSessionId(sessionId);
    const windowId = `${requestId}:0`;
    const installationId = ensureCodexInstallationId();
    return {
        installationId,
        requestId,
        windowId,
        clientMetadata: {
            'x-codex-installation-id': installationId,
            'x-codex-window-id': windowId,
        },
    };
}
function ensureCodexInstallationId() {
    const installPath = node_path_1.default.join(node_os_1.default.homedir(), '.n8n-as-code', CODEX_INSTALLATION_ID_FILENAME);
    try {
        const existing = node_fs_1.default.readFileSync(installPath, 'utf8').trim();
        if (existing) {
            return existing;
        }
    }
    catch {
        // fall through to generate and persist a new id
    }
    const installationId = (0, node_crypto_1.randomUUID)();
    try {
        node_fs_1.default.mkdirSync(node_path_1.default.dirname(installPath), { recursive: true });
        node_fs_1.default.writeFileSync(installPath, installationId);
    }
    catch {
        return installationId;
    }
    return installationId;
}
async function* parseCodexSSE(body) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        buffer += decoder.decode(value, { stream: true });
        let idx = buffer.indexOf('\n\n');
        while (idx !== -1) {
            const chunk = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            const dataLines = chunk
                .split('\n')
                .filter((l) => l.startsWith('data:'))
                .map((l) => l.slice(5).trim());
            if (dataLines.length > 0) {
                const data = dataLines.join('\n').trim();
                if (data && data !== '[DONE]') {
                    try {
                        yield JSON.parse(data);
                    }
                    catch { /* skip malformed */ }
                }
            }
            idx = buffer.indexOf('\n\n');
        }
    }
}
function buildCodexWarnings(options, functionTools) {
    if (options.mode.type !== 'regular' || !options.mode.tools || options.mode.tools.length === 0) {
        return [];
    }
    return options.mode.tools
        .filter((tool) => tool.type !== 'function' || !functionTools.includes(tool))
        .map((tool) => ({
        type: 'unsupported-tool',
        tool,
        details: 'openai-oauth currently supports only function tools on the Codex backend.',
    }));
}
function getFunctionTools(mode) {
    if (mode.type !== 'regular' || !Array.isArray(mode.tools) || mode.tools.length === 0) {
        return [];
    }
    return mode.tools.filter((tool) => tool.type === 'function');
}
function toCodexTools(tools) {
    return tools.map((tool) => ({
        type: 'function',
        name: tool.name,
        ...(tool.description ? { description: tool.description } : {}),
        parameters: (0, tool_schema_js_1.normalizeFunctionToolParametersSchema)(tool.parameters, { forceRequiredObjectProperties: true }),
        strict: tool.strict ?? true,
    }));
}
function toCodexToolChoice(toolChoice) {
    if (!toolChoice || toolChoice.type === 'auto') {
        return 'auto';
    }
    if (toolChoice.type === 'none' || toolChoice.type === 'required') {
        return toolChoice.type;
    }
    if (toolChoice.type === 'tool') {
        return {
            type: 'function',
            name: toolChoice.toolName,
        };
    }
    return 'auto';
}
function readResponseOutputItem(event) {
    if (event.item && typeof event.item === 'object') {
        return event.item;
    }
    if (event.output_item && typeof event.output_item === 'object') {
        return event.output_item;
    }
    return undefined;
}
function extractCodexToolCallFromItem(item, index) {
    if (!item || typeof item !== 'object') {
        return undefined;
    }
    const record = item;
    if (record.type !== 'function_call') {
        return undefined;
    }
    const toolName = readOptionalString(record.name);
    if (!toolName) {
        return undefined;
    }
    const toolCallId = readOptionalString(record.call_id)
        || readOptionalString(record.id)
        || `openai-account-tool-call-${index + 1}`;
    const args = typeof record.arguments === 'string'
        ? record.arguments
        : JSON.stringify(record.arguments ?? {});
    return {
        toolCallType: 'function',
        toolCallId,
        toolName,
        args,
    };
}
function stringifyToolResult(value) {
    if (typeof value === 'string') {
        return value;
    }
    try {
        return JSON.stringify(value ?? null);
    }
    catch {
        return String(value);
    }
}
function readOptionalString(value) {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}
function buildCodexUserAgent() {
    const termProgram = process.env.TERM_PROGRAM;
    const termProgramVersion = process.env.TERM_PROGRAM_VERSION;
    const termSessionId = process.env.TERM_SESSION_ID;
    const weztermVersion = process.env.WEZTERM_VERSION;
    const isKitty = process.env.KITTY_WINDOW_ID || (process.env.TERM || '').includes('kitty');
    const isAlacritty = process.env.ALACRITTY_SOCKET || process.env.TERM === 'alacritty';
    const isGnomeTerminal = process.env.GNOME_TERMINAL_SCREEN;
    const isWindowsTerminal = process.env.WT_SESSION;
    let terminal = 'unknown';
    if (termProgram) {
        terminal = termProgramVersion ? `${termProgram}/${termProgramVersion}` : termProgram;
    }
    else if (weztermVersion) {
        terminal = `WezTerm/${weztermVersion}`;
    }
    else if (isKitty) {
        terminal = 'kitty';
    }
    else if (isAlacritty) {
        terminal = 'Alacritty';
    }
    else if (isGnomeTerminal) {
        terminal = 'gnome-terminal';
    }
    else if (isWindowsTerminal) {
        terminal = 'WindowsTerminal';
    }
    else if (termSessionId) {
        terminal = 'Apple_Terminal';
    }
    else if (process.env.TERM) {
        terminal = process.env.TERM || 'unknown';
    }
    return `${CODEX_ORIGINATOR}/0.0.0 (${node_os_1.default.platform()} ${node_os_1.default.release()}; ${node_os_1.default.arch()}) ${terminal}`;
}
//# sourceMappingURL=openai-account.js.map