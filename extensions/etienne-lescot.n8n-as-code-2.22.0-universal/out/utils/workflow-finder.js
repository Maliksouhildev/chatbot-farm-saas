"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWorkflowQuickPickItems = buildWorkflowQuickPickItems;
exports.getWorkflowFinderCommand = getWorkflowFinderCommand;
const n8nac_1 = require("n8nac");
function buildWorkflowQuickPickItems(workflows) {
    return [...workflows]
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
        .map(workflow => {
        const archivedIcon = workflow.isArchived ? '$(archive) ' : '';
        const archivedSuffix = workflow.isArchived ? ' [archived]' : '';
        return {
            label: `${archivedIcon}${workflow.name}${archivedSuffix}`,
            description: workflow.id ? `ID: ${workflow.id}` : 'Local only',
            detail: workflow.filename
                ? `${workflow.filename} • ${workflow.status}`
                : `Remote only • ${workflow.status}`,
            workflow,
        };
    });
}
function getWorkflowFinderCommand(workflow) {
    if (workflow.status === n8nac_1.WorkflowSyncStatus.EXIST_ONLY_REMOTELY) {
        return workflow.id ? 'n8n.openBoard' : undefined;
    }
    return workflow.filename ? 'n8n.openJson' : (workflow.id ? 'n8n.openBoard' : undefined);
}
//# sourceMappingURL=workflow-finder.js.map