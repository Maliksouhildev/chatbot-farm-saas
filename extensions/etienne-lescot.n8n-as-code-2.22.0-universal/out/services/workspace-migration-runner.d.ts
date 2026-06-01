import * as vscode from 'vscode';
import { type IWorkspaceMigrationReport } from 'n8nac';
export declare function runWorkspaceMigrationFromVscode(context: vscode.ExtensionContext, workspaceRoot: string): Promise<{
    outcome: 'not-needed';
} | {
    outcome: 'cancelled';
    report: IWorkspaceMigrationReport;
} | {
    outcome: 'migrated';
    report: IWorkspaceMigrationReport;
}>;
//# sourceMappingURL=workspace-migration-runner.d.ts.map