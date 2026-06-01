"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowWebviewRegistry = exports.WorkflowWebviewRegistry = void 0;
class WorkflowWebviewRegistry {
    targets = new Set();
    debugLogger;
    setDebugLogger(logger) {
        this.debugLogger = logger;
    }
    register(target) {
        this.targets.add(target);
        this.debugLogger?.(`[workflow-registry] register target=${target.describeTarget?.() || 'unknown'} workflowId=${target.getWorkflowId() || 'none'} total=${this.targets.size}`);
        return {
            dispose: () => {
                this.targets.delete(target);
                this.debugLogger?.(`[workflow-registry] dispose target=${target.describeTarget?.() || 'unknown'} total=${this.targets.size}`);
            },
        };
    }
    reloadIfMatching(workflowId) {
        let reloaded = false;
        this.debugLogger?.(`[workflow-registry] reloadIfMatching workflowId=${workflowId} targets=${this.targets.size}`);
        for (const target of [...this.targets]) {
            const targetWorkflowId = target.getWorkflowId();
            if (targetWorkflowId !== workflowId) {
                this.debugLogger?.(`[workflow-registry] skip target=${target.describeTarget?.() || 'unknown'} targetWorkflowId=${targetWorkflowId || 'none'}`);
                continue;
            }
            reloaded = true;
            this.debugLogger?.(`[workflow-registry] reloading target=${target.describeTarget?.() || 'unknown'} workflowId=${workflowId}`);
            void Promise.resolve(target.reloadWorkflow()).catch(() => {
                // Webview reload is best-effort; stale targets unregister on dispose.
            });
        }
        this.debugLogger?.(`[workflow-registry] reloadIfMatching result workflowId=${workflowId} reloaded=${reloaded}`);
        return reloaded;
    }
}
exports.WorkflowWebviewRegistry = WorkflowWebviewRegistry;
exports.workflowWebviewRegistry = new WorkflowWebviewRegistry();
//# sourceMappingURL=workflow-webview-registry.js.map