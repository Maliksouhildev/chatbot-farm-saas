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
exports.EnhancedWorkflowTreeProvider = void 0;
const vscode = __importStar(require("vscode"));
const n8nac_1 = require("n8nac");
const types_js_1 = require("../types.js");
const state_detection_js_1 = require("../utils/state-detection.js");
const workflow_store_js_1 = require("../services/workflow-store.js");
const loading_item_js_1 = require("./tree-items/loading-item.js");
const error_item_js_1 = require("./tree-items/error-item.js");
const workflow_item_js_1 = require("./tree-items/workflow-item.js");
const info_item_js_1 = require("./tree-items/info-item.js");
const action_item_js_1 = require("./tree-items/action-item.js");
/**
 * Enhanced tree provider that handles multiple extension states
 */
class EnhancedWorkflowTreeProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    syncManager;
    extensionState = types_js_1.ExtensionState.UNINITIALIZED;
    initializationError;
    // Cache management
    cachedTreeItems = null;
    cacheInvalidationTime = 0;
    // Debouncing for refresh
    refreshTimeout = null;
    // Store subscription
    storeUnsubscribe;
    constructor() {
        // No more manual event listeners!
    }
    /**
     * Subscribe to Redux store
     */
    subscribeToStore(reduxStore) {
        // Unsubscribe previous if any
        if (this.storeUnsubscribe) {
            this.storeUnsubscribe();
        }
        this.storeUnsubscribe = reduxStore.subscribe(() => {
            // Store changed, refresh tree
            this.invalidateCache();
            this.refresh();
        });
    }
    /**
     * Get the current extension state
     */
    getExtensionState() {
        return this.extensionState;
    }
    /**
     * Set the current extension state
     */
    setExtensionState(state, error) {
        if (this.extensionState !== state || this.initializationError !== error) {
            this.extensionState = state;
            this.initializationError = error;
            this.invalidateCache();
            this.refresh();
        }
    }
    /**
     * Set the sync manager (when initialized)
     */
    setSyncManager(manager) {
        this.syncManager = manager;
        this.invalidateCache();
        this.refresh();
    }
    /**
     * Refresh the tree view with debouncing and cache invalidation
     */
    refresh() {
        // Invalidate cache
        this.cachedTreeItems = null;
        // Clear existing timeout if any
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
        }
        // Set new timeout for debounced refresh
        this.refreshTimeout = setTimeout(() => {
            this._onDidChangeTreeData.fire();
            this.refreshTimeout = null;
        }, 100);
    }
    /**
     * Invalidate cache (call when data changes)
     */
    invalidateCache() {
        this.cachedTreeItems = null;
        this.cacheInvalidationTime = Date.now();
    }
    /**
     * Check if cache is valid (less than 1 second old)
     */
    isCacheValid() {
        const CACHE_TTL_MS = 1000; // 1 second
        return this.cachedTreeItems !== null &&
            Date.now() - this.cacheInvalidationTime < CACHE_TTL_MS;
    }
    /**
     * Get tree item for element
     */
    getTreeItem(element) {
        return element;
    }
    /**
     * Get children for element (or root if no element)
     */
    async getChildren(element) {
        // If element is a WorkflowItem, return its action children
        if (element && element instanceof workflow_item_js_1.WorkflowItem) {
            return this.getWorkflowActionItems(element);
        }
        // Root level items
        if (!element) {
            const migrationItems = this.getMigrationItems();
            if (migrationItems.length) {
                return migrationItems;
            }
            switch (this.extensionState) {
                case types_js_1.ExtensionState.UNINITIALIZED:
                    return this.getUninitializedItems();
                case types_js_1.ExtensionState.CONFIGURING:
                    return this.getConfiguringItems();
                case types_js_1.ExtensionState.SETTINGS_CHANGED:
                    return this.getSettingsChangedItems();
                case types_js_1.ExtensionState.INITIALIZING:
                    return this.getInitializingItems();
                case types_js_1.ExtensionState.INITIALIZED:
                    return await this.getInitializedItems();
                case types_js_1.ExtensionState.ERROR:
                    return this.getErrorItems();
                default:
                    return [];
            }
        }
        return [];
    }
    /**
     * Get action items for a workflow based on its state.
     * This is the SSOT for determining which actions are available.
     *
     * Rules:
     * - Conflicts: SHOW_DIFF, FORCE_PUSH, PULL_REMOTE
     * - TRACKED archived: BOARD, PULL only (OPEN, PUSH disabled - local file is read-only)
     * - EXIST_ONLY_LOCALLY: OPEN, PUSH only (BOARD, PULL disabled - no remote)
     * - EXIST_ONLY_LOCALLY archived: OPEN only (all others disabled - no remote)
     * - EXIST_ONLY_REMOTELY: BOARD, PULL only (OPEN, PUSH disabled - no local)
     * - EXIST_ONLY_REMOTELY archived: BOARD, PULL only (OPEN, PUSH disabled)
     * - Non-archived TRACKED: all actions available
     */
    getWorkflowActionItems(workflowItem) {
        const { workflow, pendingAction } = workflowItem;
        const actions = [];
        // Conflict resolution actions override everything
        if (pendingAction === 'conflict' || workflow.status === n8nac_1.WorkflowSyncStatus.CONFLICT) {
            actions.push(new action_item_js_1.ActionItem(action_item_js_1.ActionItemType.SHOW_DIFF, workflow.id, workflow), new action_item_js_1.ActionItem(action_item_js_1.ActionItemType.FORCE_PUSH, workflow.id, workflow), new action_item_js_1.ActionItem(action_item_js_1.ActionItemType.PULL_REMOTE, workflow.id, workflow));
            return actions;
        }
        // Use the SSOT method on WorkflowItem to get available actions
        const availableActions = workflowItem.getAvailableActions();
        for (const actionType of availableActions) {
            actions.push(new action_item_js_1.ActionItem(actionType, workflow.id || '', workflow));
        }
        return actions;
    }
    getInitializingItems() {
        return [new loading_item_js_1.LoadingItem('Initializing n8n...')];
    }
    getMigrationItems() {
        const workspaceRoot = (0, state_detection_js_1.getWorkspaceRoot)();
        if (!workspaceRoot)
            return [];
        try {
            const configService = new n8nac_1.ConfigService(workspaceRoot);
            const migration = new n8nac_1.WorkspaceMigrationFacade({ configService }).inspect();
            if (!migration)
                return [];
            const title = new info_item_js_1.InfoItem('Migration required', '', new vscode.ThemeIcon('warning', new vscode.ThemeColor('notificationsWarningIcon.foreground')));
            title.tooltip = 'Run the migration to update this workspace configuration.';
            const migrate = new info_item_js_1.InfoItem('Run migration', '', new vscode.ThemeIcon('arrow-right'));
            migrate.tooltip = 'Run required workspace migrations.';
            migrate.command = {
                command: 'n8n.migrateWorkspaceConfiguration',
                title: 'Run Migration'
            };
            const configure = new info_item_js_1.InfoItem('Open n8n environments', '', new vscode.ThemeIcon('settings-gear'));
            configure.command = {
                command: 'n8n.configure',
                title: 'Open n8n Environments'
            };
            return [title, migrate, configure];
        }
        catch {
            return [];
        }
    }
    getUninitializedItems() {
        return [
            new info_item_js_1.InfoItem('n8n-as-code is not initialized', 'Open configuration to start', new vscode.ThemeIcon('info')),
            this.createConfigureItem('Configure n8n environments')
        ];
    }
    getConfiguringItems() {
        return [
            new info_item_js_1.InfoItem('Configure n8n environments', 'Workspace configuration is incomplete', new vscode.ThemeIcon('warning')),
            this.createConfigureItem('Open configuration')
        ];
    }
    getSettingsChangedItems() {
        const apply = new info_item_js_1.InfoItem('Apply configuration changes', '', new vscode.ThemeIcon('check'));
        apply.command = {
            command: 'n8n.applySettings',
            title: 'Apply Configuration Changes'
        };
        return [
            new info_item_js_1.InfoItem('Configuration changed', 'Apply changes before syncing', new vscode.ThemeIcon('warning')),
            apply,
            this.createConfigureItem('Open configuration')
        ];
    }
    createConfigureItem(label) {
        const item = new info_item_js_1.InfoItem(label, '', new vscode.ThemeIcon('settings-gear'));
        item.command = {
            command: 'n8n.configure',
            title: label
        };
        return item;
    }
    async getInitializedItems() {
        if (this.isCacheValid() && this.cachedTreeItems) {
            return this.cachedTreeItems;
        }
        // Read from Redux Store
        const state = workflow_store_js_1.store.getState();
        const workflows = (0, workflow_store_js_1.selectAllWorkflows)(state);
        const conflicts = (0, workflow_store_js_1.selectConflicts)(state);
        const items = [];
        // Add workflow items
        if (workflows.length > 0) {
            items.push(...workflows.map(wf => {
                const pendingAction = conflicts[wf.id] ? 'conflict' : undefined;
                return new workflow_item_js_1.WorkflowItem(wf, pendingAction);
            }));
        }
        else if (this.syncManager) {
            items.push(new info_item_js_1.InfoItem('No workflows found', 'Create workflows in n8n or sync', new vscode.ThemeIcon('info')));
        }
        this.cachedTreeItems = items;
        this.cacheInvalidationTime = Date.now();
        return items;
    }
    getErrorItems() {
        const configValidation = (0, state_detection_js_1.validateN8nConfig)();
        const items = [];
        // 1. Main Error Item (non-clickable, just status)
        const errorItem = new error_item_js_1.ErrorItem(this.initializationError || 'Unknown error', false);
        errorItem.label = 'Initialization Failed';
        errorItem.description = '';
        errorItem.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('errorForeground'));
        items.push(errorItem);
        // 2. Explanation
        const explanationItem = new info_item_js_1.InfoItem('Connection failed', this.initializationError || 'Check the effective instance configuration', new vscode.ThemeIcon('warning'));
        explanationItem.tooltip = this.initializationError;
        items.push(explanationItem);
        // 3. Spacing
        items.push(new info_item_js_1.InfoItem('', '', new vscode.ThemeIcon('blank')));
        // 4. Action: Retry
        if (configValidation.isValid) {
            const retryItem = new info_item_js_1.InfoItem('Retry Connection', '', new vscode.ThemeIcon('refresh'));
            retryItem.command = {
                command: 'n8n.init',
                title: 'Retry Connection'
            };
            items.push(retryItem);
        }
        // 5. Action: Configure
        const settingsItem = new info_item_js_1.InfoItem('Configure', '', new vscode.ThemeIcon('settings-gear'));
        settingsItem.command = {
            command: 'n8n.configure',
            title: 'Configure'
        };
        items.push(settingsItem);
        return items;
    }
    getParent(_element) {
        return null;
    }
    resolveTreeItem(_item, element, _token) {
        return element;
    }
    async getWorkflowItem(workflow) {
        if (this.extensionState !== types_js_1.ExtensionState.INITIALIZED) {
            return undefined;
        }
        const items = await this.getInitializedItems();
        if (workflow.id) {
            const itemById = items.find((item) => item instanceof workflow_item_js_1.WorkflowItem && item.workflow.id === workflow.id);
            if (itemById) {
                return itemById;
            }
        }
        if (!workflow.filename) {
            return undefined;
        }
        return items.find((item) => item instanceof workflow_item_js_1.WorkflowItem
            && !item.workflow.id
            && item.workflow.filename === workflow.filename);
    }
    /**
     * Get conflict data for a workflow (helper for hooks)
     */
    getConflict(id) {
        const state = workflow_store_js_1.store.getState();
        const conflicts = (0, workflow_store_js_1.selectConflicts)(state);
        const conflict = conflicts[id];
        return conflict ? { id: conflict.id, filename: conflict.filename, remoteContent: conflict.remoteContent } : undefined;
    }
    dispose() {
        if (this.storeUnsubscribe) {
            this.storeUnsubscribe();
        }
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
            this.refreshTimeout = null;
        }
    }
}
exports.EnhancedWorkflowTreeProvider = EnhancedWorkflowTreeProvider;
//# sourceMappingURL=enhanced-workflow-tree-provider.js.map