export declare const DEFAULT_COPILOT_API_BASE_URL = "https://api.individual.githubcopilot.com";
export declare const GITHUB_COPILOT_DEFAULT_MODEL = "gpt-4.1";
export declare function resolveCopilotApiToken(githubToken: string): Promise<{
    token: string;
    expiresAt: number;
    baseUrl: string;
}>;
export declare function fetchGitHubCopilotModels(githubToken: string): Promise<string[]>;
//# sourceMappingURL=copilot-account.d.ts.map