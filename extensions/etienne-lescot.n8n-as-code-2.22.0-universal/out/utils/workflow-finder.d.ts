import type { QuickPickItem } from 'vscode';
import { IWorkflowStatus } from 'n8nac';
export interface WorkflowQuickPickItem extends QuickPickItem {
    workflow: IWorkflowStatus;
}
export declare function buildWorkflowQuickPickItems(workflows: IWorkflowStatus[]): WorkflowQuickPickItem[];
export declare function getWorkflowFinderCommand(workflow: IWorkflowStatus): string | undefined;
//# sourceMappingURL=workflow-finder.d.ts.map