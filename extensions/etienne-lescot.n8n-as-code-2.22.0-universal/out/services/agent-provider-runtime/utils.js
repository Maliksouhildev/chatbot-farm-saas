"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RETRY_CONFIG = exports.CODEX_UPSTREAM_TIMEOUT_MS = void 0;
exports.withRetry = withRetry;
exports.timeoutSignal = timeoutSignal;
exports.parseCodexUpstreamTimeoutMs = parseCodexUpstreamTimeoutMs;
/** Default timeout for upstream Codex API calls (ms). */
exports.CODEX_UPSTREAM_TIMEOUT_MS = parseCodexUpstreamTimeoutMs(process.env.N8N_CODEX_UPSTREAM_TIMEOUT_MS);
/** Default retry configuration for transient failures. */
exports.RETRY_CONFIG = {
    maxAttempts: 3,
    initialDelayMs: 500,
    maxDelayMs: 8_000,
    backoffMultiplier: 2,
};
async function withRetry(fn, label, options = {}) {
    let attempt = 0;
    let delay = options.delayMs ?? exports.RETRY_CONFIG.initialDelayMs;
    const maxAttempts = options.retries ?? exports.RETRY_CONFIG.maxAttempts;
    while (true) {
        try {
            return await fn();
        }
        catch (err) {
            attempt++;
            if (attempt >= maxAttempts)
                throw err;
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay = Math.min(delay * exports.RETRY_CONFIG.backoffMultiplier, exports.RETRY_CONFIG.maxDelayMs);
        }
    }
}
/** Creates an AbortSignal that times out after `timeoutMs`. */
function timeoutSignal(timeoutMs, _label) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    if (typeof timer.unref === 'function')
        timer.unref();
    return controller.signal;
}
function parseCodexUpstreamTimeoutMs(value, fallback = 300_000) {
    if (typeof value !== 'string') {
        return fallback;
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return fallback;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }
    return parsed;
}
//# sourceMappingURL=utils.js.map