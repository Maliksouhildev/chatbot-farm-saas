import type * as vscode from 'vscode';
export declare class ProxyService {
    private server;
    private proxy;
    private wsServer;
    private port;
    private target;
    private publicBaseUrl;
    private outputChannel;
    private secrets;
    private cookieJar;
    private htmlRoutes;
    private externalAuthSessions;
    private lastWorkflowProxyUrl;
    private readonly externalAuthRoutePrefix;
    private readonly externalAuthSessionTtlMs;
    constructor();
    setSecrets(secrets: vscode.SecretStorage): void;
    setOutputChannel(channel: vscode.OutputChannel): void;
    registerHtmlRoute(routePath: string, html: string): void;
    setPublicBaseUrl(publicBaseUrl: string | undefined): void;
    private getProxyBaseUrl;
    private rewriteProxyLocation;
    private trimTrailingSlash;
    private urlPathMatchesBase;
    private stripTargetBasePath;
    /**
     * Check whether a WebSocket close code is valid for sending in a close frame.
     * Codes 1004, 1005, 1006, and 1015 are reserved and MUST NOT be set as a
     * status code in a Close control frame (RFC 6455 §7.4.1).
     */
    private isSendableCloseCode;
    private log;
    private openExternalUrl;
    private getStorageKey;
    /**
     * Generate a stable port number between 10000 and 60000 based on the target URL
     */
    private getStablePort;
    private cleanupExternalAuthSessions;
    private createExternalAuthSession;
    private getExternalAuthSession;
    private normalizeExternalAuthTargetUrl;
    private buildExternalAuthProxyUrl;
    private parseExternalAuthProxyRequest;
    private isExternalN8nRedirect;
    private createExternalAuthHandoff;
    private buildProxyRequestUrl;
    private rememberWorkflowProxyUrl;
    private getWorkflowRetryUrl;
    private buildExternalAuthHandoffHtml;
    private handleExternalAuthProxyRequest;
    private saveCookies;
    private loadCookies;
    private buildMergedCookieHeader;
    start(targetUrl: string): Promise<string>;
    /**
     * Returns the injectable bridge script as a string.
     * Exported as a static helper so it can be unit-tested in isolation.
     *
     * Security model:
     * - The bridge script intentionally carries no static secret because any
     *   constant embedded here is readable by code running inside the iframe.
     * - Origin validation, per-request one-time grant tokens, and rate-limiting
     *   are all enforced in the parent webview (workflow-webview.ts), which is
     *   extension-controlled and not accessible to iframe scripts.
     */
    static buildBridgeScript(clipboardBridgeEnabled?: boolean, nodeBridgeEnabled?: boolean, pageKind?: string): string;
    /**
     * Inject a clipboard bridge script into n8n's HTML responses.
     *
     * On macOS, Electron intercepts Cmd+C/V/X at the native menu level before
     * keyboard events reach the webview. The Clipboard API also doesn't work
     * inside cross-origin iframes in VS Code webviews.
     *
     * This bridge script:
     * 1. Intercepts Cmd+V keydown in the iframe
     * 2. Requests clipboard data from the parent webview via postMessage
     * 3. Monkey-patches navigator.clipboard.readText so n8n reads our data
     * 4. Dispatches synthetic keyboard and clipboard events to trigger n8n's paste handler
     */
    private injectClipboardBridge;
    stop(): void;
    getProxyUrl(): string;
    private getRegisteredHtmlRoute;
    private normalizeRoutePath;
}
//# sourceMappingURL=proxy-service.d.ts.map