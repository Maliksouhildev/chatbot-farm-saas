// src/extension.ts
import * as vscode18 from "vscode";
import * as path8 from "path";
import * as fs9 from "fs";
import { createHash as createHash4 } from "crypto";
import {
  SyncManager as SyncManager2,
  CliApi,
  N8nApiClient as N8nApiClient2,
  WorkflowSyncStatus as WorkflowSyncStatus5,
  ConfigService as ConfigService7,
  resolveInstanceIdentifier as resolveInstanceIdentifier4,
  isCanonicalUserInstanceIdentifier as isCanonicalUserInstanceIdentifier3,
  SYNC_EVENT_JOURNAL_FILENAME
} from "n8nac";
import { AiContextGenerator, getN8nacDevConfigFilenames } from "@n8n-as-code/skills";

// src/ui/status-bar.ts
import * as vscode from "vscode";
var StatusBar = class {
  item;
  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.item.command = "n8n.pull";
  }
  showSyncing() {
    this.item.text = "$(sync~spin) n8n";
    this.item.tooltip = "Syncing...";
    this.item.show();
  }
  showSynced() {
    this.item.text = "$(check) n8n";
    this.item.tooltip = "Workflows Synced";
    this.item.show();
    setTimeout(() => {
      this.item.text = "n8n";
    }, 3e3);
  }
  showError(msg) {
    this.item.text = "$(error) n8n";
    this.item.tooltip = msg;
    this.item.show();
  }
  setWatchMode(active) {
    if (active) {
      this.item.text = "$(eye) n8n (Watch)";
      this.item.tooltip = "n8n: Watch Mode Active";
      this.item.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
    } else {
      this.item.text = "n8n";
      this.item.tooltip = "n8n: Manual Mode";
      this.item.backgroundColor = void 0;
    }
    this.item.show();
  }
  // New methods for initialization state management
  hide() {
    this.item.hide();
  }
  showLoading(message = "Initializing...") {
    this.item.text = `$(loading~spin) ${message}`;
    this.item.tooltip = message;
    this.item.show();
  }
  showNotInitialized() {
    this.item.text = "$(info) n8n: Not initialized";
    this.item.tooltip = "Click to initialize n8n as code";
    this.item.command = "n8n.init";
    this.item.show();
  }
  showConfiguring() {
    this.item.text = "$(settings) n8n: Configure";
    this.item.tooltip = "Configure n8n settings to continue";
    this.item.command = "n8n.configure";
    this.item.show();
  }
  showSettingsChanged() {
    this.item.text = "$(alert) n8n: Apply changes";
    this.item.tooltip = "Settings changed. Sync is paused until you apply the new settings.";
    this.item.command = "n8n.applySettings";
    this.item.show();
  }
};

// src/ui/enhanced-workflow-tree-provider.ts
import * as vscode9 from "vscode";
import { ConfigService as ConfigService3, WorkspaceMigrationFacade, WorkflowSyncStatus as WorkflowSyncStatus2 } from "n8nac";

// src/utils/state-detection.ts
import * as vscode2 from "vscode";
import { ConfigService as ConfigService2, isCanonicalUserInstanceIdentifier } from "n8nac";

// src/utils/unified-config.ts
import {
  ConfigService,
  resolveInstanceIdentifier
} from "n8nac";
function readUnifiedWorkspaceConfig(workspaceRoot) {
  return new ConfigService(workspaceRoot).getWorkspaceConfig();
}

// src/utils/state-detection.ts
function readString(value) {
  return typeof value === "string" ? value.trim() : "";
}
function normalizeHost(host) {
  const trimmed = readString(host).replace(/^['"]|['"]$/g, "");
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}
function getSettingsValue(key) {
  return readString(vscode2.workspace.getConfiguration("n8n").get(key));
}
function getEnvValue(key) {
  return readString(process.env[key]).replace(/^['"]|['"]$/g, "");
}
function getResolvedN8nConfig(workspaceRoot = getWorkspaceRoot()) {
  const unified = workspaceRoot ? readUnifiedWorkspaceConfig(workspaceRoot) : void 0;
  const configService = workspaceRoot ? new ConfigService2(workspaceRoot) : void 0;
  const environment = configService ? (() => {
    try {
      return configService.resolveEnvironment();
    } catch {
      return void 0;
    }
  })() : void 0;
  if (environment) {
    return {
      host: normalizeHost(environment.host) || getEnvValue("N8N_HOST"),
      apiKey: environment.apiKey || "",
      syncFolder: environment.syncFolder || "workflows",
      projectId: environment.projectId || "",
      projectName: environment.projectName || "",
      activeInstanceId: environment.activeInstanceId || "",
      activeInstanceName: environment.activeInstanceName || environment.environmentTargetName || "",
      environmentId: environment.environmentId,
      environmentName: environment.environmentName,
      environmentTargetId: environment.environmentTargetId,
      environmentTargetName: environment.environmentTargetName
    };
  }
  const activeInstance = workspaceRoot && configService ? configService.getActiveInstance() : void 0;
  const host = normalizeHost(
    readString(unified?.host) || getSettingsValue("host") || getEnvValue("N8N_HOST")
  );
  const apiKey = (host && configService ? configService.getApiKey(host, activeInstance?.id) : void 0) || getSettingsValue("apiKey") || getEnvValue("N8N_API_KEY");
  return {
    host,
    apiKey,
    syncFolder: readString(unified?.syncFolder) || getSettingsValue("syncFolder") || "workflows",
    projectId: readString(unified?.projectId) || getSettingsValue("projectId"),
    projectName: readString(unified?.projectName) || getSettingsValue("projectName"),
    activeInstanceId: readString(unified?.activeInstanceId) || activeInstance?.id || "",
    activeInstanceName: activeInstance?.name || ""
  };
}
function getWorkspaceRoot() {
  if (!vscode2.workspace.workspaceFolders || vscode2.workspace.workspaceFolders.length === 0) {
    return void 0;
  }
  return vscode2.workspace.workspaceFolders[0].uri.fsPath;
}
function getN8nConfig() {
  const { host, apiKey } = getResolvedN8nConfig();
  return { host, apiKey };
}
function validateN8nConfig() {
  const { host, apiKey } = getN8nConfig();
  const missing = [];
  if (!host || host.trim() === "") {
    missing.push("n8n.host");
  }
  if (!apiKey || apiKey.trim() === "") {
    missing.push("n8n.apiKey");
  }
  return {
    isValid: missing.length === 0,
    missing,
    error: missing.length > 0 ? `Missing configuration: ${missing.join(", ")}` : void 0
  };
}

// src/services/workflow-store.ts
import { configureStore, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
var workflowsSlice = createSlice({
  name: "workflows",
  initialState: {
    byId: {},
    allIds: [],
    lastSync: 0
  },
  reducers: {
    // Replace all workflows (from full sync)
    setWorkflows: (state, action) => {
      state.byId = {};
      state.allIds = [];
      action.payload.forEach((wf) => {
        const key = wf.id || `file:${wf.filename}`;
        state.byId[key] = wf;
        state.allIds.push(key);
      });
      state.lastSync = Date.now();
    },
    // Update single workflow
    updateWorkflow: (state, action) => {
      const { id, updates } = action.payload;
      const key = id || (updates.filename ? `file:${updates.filename}` : id);
      if (state.byId[key]) {
        state.byId[key] = { ...state.byId[key], ...updates };
      }
    },
    // Add or replace workflow
    upsertWorkflow: (state, action) => {
      const wf = action.payload;
      const key = wf.id || `file:${wf.filename}`;
      if (!state.byId[key]) {
        state.allIds.push(key);
      }
      state.byId[key] = wf;
    },
    // Remove workflow
    removeWorkflow: (state, action) => {
      const id = action.payload;
      delete state.byId[id];
      const fileKey = Object.keys(state.byId).find((k) => k.startsWith("file:") && state.byId[k].id === id);
      if (fileKey) delete state.byId[fileKey];
      state.allIds = state.allIds.filter((wfId) => wfId !== id && wfId !== fileKey);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(loadWorkflows.fulfilled, (state, action) => {
      state.byId = {};
      state.allIds = [];
      action.payload.forEach((wf) => {
        const key = wf.id || `file:${wf.filename}`;
        state.byId[key] = wf;
        state.allIds.push(key);
      });
      state.lastSync = Date.now();
    });
  }
});
var syncSlice = createSlice({
  name: "sync",
  initialState: {
    mode: "auto",
    isWatching: false,
    isSyncing: false,
    lastError: null,
    archiveFilter: "workflows"
  },
  reducers: {
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    setWatching: (state, action) => {
      state.isWatching = action.payload;
    },
    setSyncing: (state, action) => {
      state.isSyncing = action.payload;
    },
    setError: (state, action) => {
      state.lastError = action.payload;
    },
    setArchiveFilter: (state, action) => {
      state.archiveFilter = action.payload;
    }
  }
});
var conflictsSlice = createSlice({
  name: "conflicts",
  initialState: {
    byWorkflowId: {}
  },
  reducers: {
    addConflict: (state, action) => {
      const { id, filename, remoteContent } = action.payload;
      state.byWorkflowId[id] = { id, filename, remoteContent };
    },
    removeConflict: (state, action) => {
      delete state.byWorkflowId[action.payload];
    },
    clearConflicts: (state) => {
      state.byWorkflowId = {};
    }
  }
});
var syncManagerRef = null;
function setSyncManager(manager) {
  syncManagerRef = manager;
}
function clearSyncManager() {
  syncManagerRef = null;
}
var loadWorkflows = createAsyncThunk(
  "workflows/load",
  async (_, { getState }) => {
    if (!syncManagerRef) throw new Error("SyncManager not initialized");
    const state = store.getState();
    const filter = state.sync.archiveFilter;
    const options = {};
    if (filter === "all") options.includeArchived = true;
    if (filter === "archived") options.onlyArchived = true;
    return await syncManagerRef.listWorkflows(options);
  }
);
var store = configureStore({
  reducer: {
    workflows: workflowsSlice.reducer,
    sync: syncSlice.reducer,
    conflicts: conflictsSlice.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    // Disable serialization check for large workflow objects
    serializableCheck: false
  })
});
var {
  setWorkflows,
  updateWorkflow,
  upsertWorkflow,
  removeWorkflow
} = workflowsSlice.actions;
var {
  setMode,
  setWatching,
  setSyncing,
  setError,
  setArchiveFilter
} = syncSlice.actions;
var {
  addConflict,
  removeConflict,
  clearConflicts
} = conflictsSlice.actions;
var selectAllWorkflows = (state) => state.workflows.allIds.map((key) => state.workflows.byId[key]).filter(Boolean);
var selectConflicts = (state) => state.conflicts.byWorkflowId;
var selectArchiveFilter = (state) => state.sync.archiveFilter;

// src/ui/tree-items/loading-item.ts
import * as vscode4 from "vscode";

// src/ui/tree-items/base-tree-item.ts
import * as vscode3 from "vscode";
var BaseTreeItem = class extends vscode3.TreeItem {
  constructor(label, collapsibleState = vscode3.TreeItemCollapsibleState.None) {
    super(label, collapsibleState);
  }
  /**
   * Get the context value for this item (used for when clauses in package.json)
   */
  getContextValue() {
    return this.type;
  }
  /**
   * Update the item based on current state
   */
  updateState(_state) {
  }
};

// src/ui/tree-items/loading-item.ts
var LoadingItem = class extends BaseTreeItem {
  constructor(message = "Initializing n8n...") {
    super(message, vscode4.TreeItemCollapsibleState.None);
    this.message = message;
    this.iconPath = new vscode4.ThemeIcon("loading~spin");
    this.description = "Please wait";
    this.tooltip = "Initialization in progress";
  }
  message;
  type = "loading" /* LOADING */;
  updateState(state) {
    const { message } = state;
    if (message && message !== this.message) {
      this.message = message;
      this.label = message;
    }
  }
};

// src/ui/tree-items/error-item.ts
import * as vscode5 from "vscode";
var ErrorItem = class extends BaseTreeItem {
  constructor(errorMessage, canRetry = true) {
    super("Initialization Failed", vscode5.TreeItemCollapsibleState.None);
    this.errorMessage = errorMessage;
    this.canRetry = canRetry;
    this.iconPath = new vscode5.ThemeIcon("error");
    this.description = "Click to retry";
    this.tooltip = this.getTooltip();
    this.command = canRetry ? {
      command: "n8n.init",
      title: "Retry Initialization",
      arguments: []
    } : void 0;
  }
  errorMessage;
  canRetry;
  type = "error" /* ERROR */;
  getTooltip() {
    return `Error: ${this.errorMessage}

${this.canRetry ? "Click to retry initialization" : "Please check configuration and try again"}`;
  }
  updateState(state) {
    const { errorMessage, canRetry } = state;
    this.errorMessage = errorMessage || this.errorMessage;
    this.canRetry = canRetry !== void 0 ? canRetry : this.canRetry;
    this.tooltip = this.getTooltip();
    this.command = this.canRetry ? {
      command: "n8n.init",
      title: "Retry Initialization",
      arguments: []
    } : void 0;
  }
};

// src/ui/tree-items/workflow-item.ts
import * as vscode7 from "vscode";
import { WorkflowSyncStatus } from "n8nac";

// src/ui/tree-items/action-item.ts
import * as vscode6 from "vscode";
var ActionItem = class _ActionItem extends BaseTreeItem {
  // Use INFO type for action items
  constructor(actionType, workflowId, workflow) {
    super(_ActionItem.getLabelForAction(actionType), vscode6.TreeItemCollapsibleState.None);
    this.actionType = actionType;
    this.workflowId = workflowId;
    this.workflow = workflow;
    this.iconPath = _ActionItem.getIconForAction(actionType);
    this.contextValue = `action-${actionType}`;
    this.command = _ActionItem.getCommandForAction(actionType, workflow);
    this.tooltip = _ActionItem.getTooltipForAction(actionType);
  }
  actionType;
  workflowId;
  workflow;
  type = "info" /* INFO */;
  static getLabelForAction(actionType) {
    switch (actionType) {
      case "show-diff" /* SHOW_DIFF */:
        return "\u{1F4C4} Show Diff";
      case "force-push" /* FORCE_PUSH */:
        return "\u2B06\uFE0F Keep Current (local)";
      case "pull-remote" /* PULL_REMOTE */:
        return "\u2B07\uFE0F Keep Incoming (remote)";
      case "board" /* BOARD */:
        return "\u{1F310} Board";
      case "pull" /* PULL */:
        return "\u2B07\uFE0F Pull";
      case "push" /* PUSH */:
        return "\u2B06\uFE0F Push";
      case "open" /* OPEN */:
        return "\u{1F4DD} Open";
      default:
        return "Unknown Action";
    }
  }
  static getIconForAction(actionType) {
    switch (actionType) {
      case "show-diff" /* SHOW_DIFF */:
        return new vscode6.ThemeIcon("git-compare");
      case "force-push" /* FORCE_PUSH */:
      case "push" /* PUSH */:
        return new vscode6.ThemeIcon("cloud-upload");
      case "pull-remote" /* PULL_REMOTE */:
      case "pull" /* PULL */:
        return new vscode6.ThemeIcon("cloud-download");
      case "board" /* BOARD */:
        return new vscode6.ThemeIcon("globe");
      case "open" /* OPEN */:
        return new vscode6.ThemeIcon("go-to-file");
      default:
        return new vscode6.ThemeIcon("question");
    }
  }
  static getCommandForAction(actionType, workflow) {
    switch (actionType) {
      case "show-diff" /* SHOW_DIFF */:
        return {
          command: "n8n.resolveConflict",
          title: "Show Diff",
          arguments: [{ workflow, choice: "Show Diff" }]
        };
      case "force-push" /* FORCE_PUSH */:
        return {
          command: "n8n.resolveConflict",
          title: "Keep Current (local)",
          arguments: [{ workflow, choice: "Keep Current (local)" }]
        };
      case "pull-remote" /* PULL_REMOTE */:
        return {
          command: "n8n.resolveConflict",
          title: "Keep Incoming (remote)",
          arguments: [{ workflow, choice: "Keep Incoming (remote)" }]
        };
      case "board" /* BOARD */:
        return {
          command: "n8n.openBoard",
          title: "Open Board",
          arguments: [workflow]
        };
      case "pull" /* PULL */:
        return {
          command: "n8n.pullWorkflow",
          title: "Pull",
          arguments: [workflow]
        };
      case "push" /* PUSH */:
        return {
          command: "n8n.pushWorkflow",
          title: "Push",
          arguments: [workflow]
        };
      case "open" /* OPEN */:
        return {
          command: "n8n.openJson",
          title: "Open",
          arguments: [workflow]
        };
      default:
        return void 0;
    }
  }
  static getTooltipForAction(actionType) {
    switch (actionType) {
      case "show-diff" /* SHOW_DIFF */:
        return "Open a diff view comparing local and remote versions";
      case "force-push" /* FORCE_PUSH */:
        return "Keep your current local version \u2014 push it to n8n";
      case "pull-remote" /* PULL_REMOTE */:
        return "Keep the incoming remote version \u2014 overwrite local file";
      case "board" /* BOARD */:
        return "Open workflow in n8n web UI";
      case "pull" /* PULL */:
        return "Pull latest from n8n to local file";
      case "push" /* PUSH */:
        return "Push local changes to n8n";
      case "open" /* OPEN */:
        return "Open local file in editor";
      default:
        return "";
    }
  }
  // Enabled/disabled state for actions
  static isEnabledForArchived(actionType) {
    return actionType === "pull" /* PULL */ || actionType === "board" /* BOARD */;
  }
  static isLocalOnlyAction(actionType) {
    return false;
  }
  getContextValue() {
    return this.contextValue || "action-item";
  }
  updateState(_state) {
  }
};

// src/ui/tree-items/workflow-item.ts
var WorkflowItem = class extends BaseTreeItem {
  constructor(workflow, pendingAction) {
    const shouldBeCollapsible = pendingAction === "conflict" || workflow.status === WorkflowSyncStatus.CONFLICT;
    super(
      workflow.name,
      shouldBeCollapsible ? vscode7.TreeItemCollapsibleState.Expanded : vscode7.TreeItemCollapsibleState.None
    );
    this.workflow = workflow;
    this.pendingAction = pendingAction;
    this.contextValue = this.getContextValueForStatus(workflow.status, workflow.isArchived ?? false, pendingAction);
    this.tooltip = workflow.name;
    if (pendingAction === "conflict" || workflow.status === WorkflowSyncStatus.CONFLICT) {
      this.description = "(conflict)";
    } else if (workflow.isArchived) {
      this.description = "(archived)";
    } else if (workflow.status === WorkflowSyncStatus.EXIST_ONLY_REMOTELY || workflow.status === WorkflowSyncStatus.TRACKED) {
      this.description = workflow.active ? "(active)" : "(inactive)";
    } else {
      this.description = void 0;
    }
    this.iconPath = this.getIcon(workflow.status, pendingAction);
    this.resourceUri = this.createResourceUri(workflow.id, workflow.status, pendingAction);
    if (pendingAction === "conflict" || workflow.status === WorkflowSyncStatus.CONFLICT) {
      this.command = {
        command: "n8n.resolveConflict",
        title: "Show Diff",
        arguments: [{ workflow, choice: "Show Diff" }]
      };
    } else if (!workflow.isArchived && workflow.status !== WorkflowSyncStatus.EXIST_ONLY_REMOTELY) {
      this.command = {
        command: "n8n.openJson",
        title: "Open JSON",
        arguments: [workflow]
      };
    }
  }
  workflow;
  pendingAction;
  type = "workflow" /* WORKFLOW */;
  /**
   * Get available actions for this workflow based on its state.
   * Returns action types that should be available for this workflow.
   * 
   * SSOT table:
   * - TRACKED: BOARD, OPEN, PULL, PUSH (all available)
   * - TRACKED archived: BOARD, PULL (OPEN, PUSH disabled - local file is read-only)
   * - EXIST_ONLY_LOCALLY: OPEN, PUSH (BOARD, PULL disabled - no remote)
   * - EXIST_ONLY_LOCALLY archived: OPEN (all others disabled - no remote)
   * - EXIST_ONLY_REMOTELY: BOARD, PULL (OPEN, PUSH disabled - no local)
   * - EXIST_ONLY_REMOTELY archived: BOARD, PULL (OPEN, PUSH disabled)
   * - CONFLICT: SHOW_DIFF, FORCE_PUSH, PULL_REMOTE
   */
  getAvailableActions() {
    const { status } = this.workflow;
    const isArchived = this.workflow.isArchived ?? false;
    if (status === WorkflowSyncStatus.CONFLICT || this.pendingAction === "conflict") {
      return ["show-diff" /* SHOW_DIFF */, "force-push" /* FORCE_PUSH */, "pull-remote" /* PULL_REMOTE */];
    }
    switch (status) {
      case WorkflowSyncStatus.EXIST_ONLY_LOCALLY:
        return ["open" /* OPEN */, "push" /* PUSH */];
      case WorkflowSyncStatus.EXIST_ONLY_REMOTELY:
        return ["board" /* BOARD */, "pull" /* PULL */];
      case WorkflowSyncStatus.TRACKED:
        if (isArchived) {
          return ["board" /* BOARD */, "pull" /* PULL */];
        } else {
          return ["board" /* BOARD */, "open" /* OPEN */, "pull" /* PULL */, "push" /* PUSH */];
        }
      default:
        return [];
    }
  }
  /**
   * Create a resource URI for file decorations
   */
  createResourceUri(id, status, pendingAction) {
    const params = new URLSearchParams();
    params.set("status", status);
    if (pendingAction) {
      params.set("pendingAction", pendingAction);
    }
    return vscode7.Uri.parse(`n8n-workflow://${id}?${params.toString()}`);
  }
  setContextValue(value) {
    this.contextValue = value;
  }
  /**
   * Returns a contextValue string used by package.json `when` clauses for inline/context menus.
   *
   * Values:
   * - workflow-tracked         : TRACKED (both local and remote, not archived)
   * - workflow-tracked-archived: TRACKED, archived on remote → read-only
   * - workflow-local-only      : EXIST_ONLY_LOCALLY (new, not yet pushed)
   * - workflow-cloud-only      : EXIST_ONLY_REMOTELY (not yet pulled)
   * - workflow-conflict        : CONFLICT
   */
  getContextValueForStatus(status, isArchived, pendingAction) {
    if (pendingAction === "conflict" || status === WorkflowSyncStatus.CONFLICT) return "workflow-conflict";
    switch (status) {
      case WorkflowSyncStatus.EXIST_ONLY_REMOTELY:
        return "workflow-cloud-only";
      case WorkflowSyncStatus.EXIST_ONLY_LOCALLY:
        return "workflow-local-only";
      default:
        return isArchived ? "workflow-tracked-archived" : "workflow-tracked";
    }
  }
  getIcon(status, pendingAction) {
    if (pendingAction === "conflict") return new vscode7.ThemeIcon("alert", new vscode7.ThemeColor("charts.red"));
    switch (status) {
      case WorkflowSyncStatus.CONFLICT:
        return new vscode7.ThemeIcon("alert", new vscode7.ThemeColor("charts.red"));
      case WorkflowSyncStatus.EXIST_ONLY_REMOTELY:
        return new vscode7.ThemeIcon("cloud", new vscode7.ThemeColor("charts.blue"));
      case WorkflowSyncStatus.EXIST_ONLY_LOCALLY:
        return new vscode7.ThemeIcon("file-add", new vscode7.ThemeColor("charts.orange"));
      default:
        return new vscode7.ThemeIcon("file");
    }
  }
  getContextValue() {
    return this.contextValue || "workflow";
  }
  updateState(_state) {
  }
};

// src/ui/tree-items/info-item.ts
import * as vscode8 from "vscode";
var InfoItem = class extends BaseTreeItem {
  type = "info" /* INFO */;
  constructor(label, description, icon) {
    super(label, vscode8.TreeItemCollapsibleState.None);
    this.description = description;
    this.iconPath = icon || new vscode8.ThemeIcon("info");
    this.contextValue = "info";
  }
  getContextValue() {
    return "info";
  }
  updateState(_state) {
  }
};

// src/ui/enhanced-workflow-tree-provider.ts
var EnhancedWorkflowTreeProvider = class {
  _onDidChangeTreeData = new vscode9.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  syncManager;
  extensionState = "uninitialized" /* UNINITIALIZED */;
  initializationError;
  // Cache management
  cachedTreeItems = null;
  cacheInvalidationTime = 0;
  // Debouncing for refresh
  refreshTimeout = null;
  // Store subscription
  storeUnsubscribe;
  constructor() {
  }
  /**
   * Subscribe to Redux store
   */
  subscribeToStore(reduxStore) {
    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
    }
    this.storeUnsubscribe = reduxStore.subscribe(() => {
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
    this.cachedTreeItems = null;
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
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
    const CACHE_TTL_MS = 1e3;
    return this.cachedTreeItems !== null && Date.now() - this.cacheInvalidationTime < CACHE_TTL_MS;
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
    if (element && element instanceof WorkflowItem) {
      return this.getWorkflowActionItems(element);
    }
    if (!element) {
      const migrationItems = this.getMigrationItems();
      if (migrationItems.length) {
        return migrationItems;
      }
      switch (this.extensionState) {
        case "uninitialized" /* UNINITIALIZED */:
          return this.getUninitializedItems();
        case "configuring" /* CONFIGURING */:
          return this.getConfiguringItems();
        case "settings-changed" /* SETTINGS_CHANGED */:
          return this.getSettingsChangedItems();
        case "initializing" /* INITIALIZING */:
          return this.getInitializingItems();
        case "initialized" /* INITIALIZED */:
          return await this.getInitializedItems();
        case "error" /* ERROR */:
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
    if (pendingAction === "conflict" || workflow.status === WorkflowSyncStatus2.CONFLICT) {
      actions.push(
        new ActionItem("show-diff" /* SHOW_DIFF */, workflow.id, workflow),
        new ActionItem("force-push" /* FORCE_PUSH */, workflow.id, workflow),
        new ActionItem("pull-remote" /* PULL_REMOTE */, workflow.id, workflow)
      );
      return actions;
    }
    const availableActions = workflowItem.getAvailableActions();
    for (const actionType of availableActions) {
      actions.push(new ActionItem(actionType, workflow.id || "", workflow));
    }
    return actions;
  }
  getInitializingItems() {
    return [new LoadingItem("Initializing n8n...")];
  }
  getMigrationItems() {
    const workspaceRoot = getWorkspaceRoot();
    if (!workspaceRoot) return [];
    try {
      const configService = new ConfigService3(workspaceRoot);
      const migration = new WorkspaceMigrationFacade({ configService }).inspect();
      if (!migration) return [];
      const title = new InfoItem(
        "Migration required",
        "",
        new vscode9.ThemeIcon("warning", new vscode9.ThemeColor("notificationsWarningIcon.foreground"))
      );
      title.tooltip = "Run the migration to update this workspace configuration.";
      const migrate = new InfoItem("Run migration", "", new vscode9.ThemeIcon("arrow-right"));
      migrate.tooltip = "Run required workspace migrations.";
      migrate.command = {
        command: "n8n.migrateWorkspaceConfiguration",
        title: "Run Migration"
      };
      const configure = new InfoItem("Open n8n environments", "", new vscode9.ThemeIcon("settings-gear"));
      configure.command = {
        command: "n8n.configure",
        title: "Open n8n Environments"
      };
      return [title, migrate, configure];
    } catch {
      return [];
    }
  }
  getUninitializedItems() {
    return [
      new InfoItem("n8n-as-code is not initialized", "Open configuration to start", new vscode9.ThemeIcon("info")),
      this.createConfigureItem("Configure n8n environments")
    ];
  }
  getConfiguringItems() {
    return [
      new InfoItem("Configure n8n environments", "Workspace configuration is incomplete", new vscode9.ThemeIcon("warning")),
      this.createConfigureItem("Open configuration")
    ];
  }
  getSettingsChangedItems() {
    const apply = new InfoItem("Apply configuration changes", "", new vscode9.ThemeIcon("check"));
    apply.command = {
      command: "n8n.applySettings",
      title: "Apply Configuration Changes"
    };
    return [
      new InfoItem("Configuration changed", "Apply changes before syncing", new vscode9.ThemeIcon("warning")),
      apply,
      this.createConfigureItem("Open configuration")
    ];
  }
  createConfigureItem(label) {
    const item = new InfoItem(label, "", new vscode9.ThemeIcon("settings-gear"));
    item.command = {
      command: "n8n.configure",
      title: label
    };
    return item;
  }
  async getInitializedItems() {
    if (this.isCacheValid() && this.cachedTreeItems) {
      return this.cachedTreeItems;
    }
    const state = store.getState();
    const workflows = selectAllWorkflows(state);
    const conflicts = selectConflicts(state);
    const items = [];
    if (workflows.length > 0) {
      items.push(...workflows.map((wf) => {
        const pendingAction = conflicts[wf.id] ? "conflict" : void 0;
        return new WorkflowItem(wf, pendingAction);
      }));
    } else if (this.syncManager) {
      items.push(new InfoItem(
        "No workflows found",
        "Create workflows in n8n or sync",
        new vscode9.ThemeIcon("info")
      ));
    }
    this.cachedTreeItems = items;
    this.cacheInvalidationTime = Date.now();
    return items;
  }
  getErrorItems() {
    const configValidation = validateN8nConfig();
    const items = [];
    const errorItem = new ErrorItem(this.initializationError || "Unknown error", false);
    errorItem.label = "Initialization Failed";
    errorItem.description = "";
    errorItem.iconPath = new vscode9.ThemeIcon("error", new vscode9.ThemeColor("errorForeground"));
    items.push(errorItem);
    const explanationItem = new InfoItem(
      "Connection failed",
      this.initializationError || "Check the effective instance configuration",
      new vscode9.ThemeIcon("warning")
    );
    explanationItem.tooltip = this.initializationError;
    items.push(explanationItem);
    items.push(new InfoItem("", "", new vscode9.ThemeIcon("blank")));
    if (configValidation.isValid) {
      const retryItem = new InfoItem("Retry Connection", "", new vscode9.ThemeIcon("refresh"));
      retryItem.command = {
        command: "n8n.init",
        title: "Retry Connection"
      };
      items.push(retryItem);
    }
    const settingsItem = new InfoItem("Configure", "", new vscode9.ThemeIcon("settings-gear"));
    settingsItem.command = {
      command: "n8n.configure",
      title: "Configure"
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
    if (this.extensionState !== "initialized" /* INITIALIZED */) {
      return void 0;
    }
    const items = await this.getInitializedItems();
    if (workflow.id) {
      const itemById = items.find(
        (item) => item instanceof WorkflowItem && item.workflow.id === workflow.id
      );
      if (itemById) {
        return itemById;
      }
    }
    if (!workflow.filename) {
      return void 0;
    }
    return items.find(
      (item) => item instanceof WorkflowItem && !item.workflow.id && item.workflow.filename === workflow.filename
    );
  }
  /**
   * Get conflict data for a workflow (helper for hooks)
   */
  getConflict(id) {
    const state = store.getState();
    const conflicts = selectConflicts(state);
    const conflict = conflicts[id];
    return conflict ? { id: conflict.id, filename: conflict.filename, remoteContent: conflict.remoteContent } : void 0;
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
};

// src/ui/workflow-webview.ts
import * as vscode10 from "vscode";

// src/ui/webview-html.ts
var WORKFLOW_WEBVIEW_RELOAD_MESSAGE = "n8nac.workflow.reload";
function buildWebviewHtml(workflowId, url) {
  const htmlSafe = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const safeWorkflowIdHtml = htmlSafe(workflowId);
  const safeWorkflowIdJs = JSON.stringify(workflowId);
  const reloadMessageTypeJs = JSON.stringify(WORKFLOW_WEBVIEW_RELOAD_MESSAGE);
  let iframePermissionOrigin = "src";
  try {
    iframePermissionOrigin = new URL(url).origin;
  } catch {
  }
  const iframeAllowPolicy = `clipboard-read ${iframePermissionOrigin}; clipboard-write ${iframePermissionOrigin}; geolocation ${iframePermissionOrigin}; microphone ${iframePermissionOrigin}; camera ${iframePermissionOrigin}`;
  return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval'; frame-src *; connect-src *; img-src * data:; style-src * 'unsafe-inline';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>n8n: ${safeWorkflowIdHtml}</title>
            <style>
                body, html { 
                    margin: 0; 
                    padding: 0; 
                    height: 100%; 
                    overflow: hidden; 
                    background: var(--vscode-editor-background, #1e1e1e);
                }
                .iframe-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }
                iframe { 
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%; 
                    height: 100%; 
                    border: none; 
                    display: block;
                    transition: opacity 0.3s ease;
                }
                iframe.hidden {
                    opacity: 0;
                    pointer-events: none;
                }
                .loading-overlay {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    padding: 5px 10px;
                    background: var(--vscode-button-background, #007acc);
                    color: var(--vscode-button-foreground, #ffffff);
                    font-family: system-ui, -apple-system, sans-serif;
                    font-size: 12px;
                    border-radius: 4px;
                    display: none;
                    z-index: 100;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .initial-loading {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-family: system-ui, -apple-system, sans-serif;
                    color: #666;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div id="loading-overlay" class="loading-overlay">Refreshing n8n...</div>
            <div id="initial-loading" class="initial-loading">Loading n8n workflow...</div>
            
            <div class="iframe-container">
                <iframe 
                    id="frame-1"
                    src="${url}" 
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads allow-top-navigation allow-top-navigation-by-user-activation"
                    allow="${iframeAllowPolicy}">
                </iframe>
                <iframe 
                    id="frame-2"
                    class="hidden"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads allow-top-navigation allow-top-navigation-by-user-activation"
                    allow="${iframeAllowPolicy}">
                </iframe>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                let activeFrame = document.getElementById('frame-1');
                let pendingFrame = document.getElementById('frame-2');
                const loadingOverlay = document.getElementById('loading-overlay');
                const initialLoading = document.getElementById('initial-loading');
                const workflowId = ${safeWorkflowIdJs};
                
                function focusActiveFrame() {
                    try {
                        if (document.activeElement !== activeFrame) {
                            activeFrame.focus();
                        }
                    } catch (e) {
                        // ignore focus errors
                    }
                }

                // Hide initial loading when first iframe is ready
                activeFrame.onload = () => {
                    initialLoading.style.display = 'none';
                    focusActiveFrame();
                };

                /**
                 * Attempt a "Soft Refresh" by finding n8n's Vue instance and triggering a workflow load.
                 */
                function attemptSoftRefresh() {
                    try {
                        const win = activeFrame.contentWindow;
                        // n8n uses Vue 2, usually reachable via #app
                        const app = win.document.querySelector('#app');
                        if (app && app.__vue__) {
                            const vueInstance = app.__vue__;
                            const store = vueInstance.$store;
                            
                            if (store && store.dispatch) {
                                store.dispatch('workflows/getWorkflow', workflowId);
                                return true;
                            }
                        }
                    } catch (e) {
                        // console.warn('[Webview] Soft Refresh failed or cross-origin blocked:', e);
                    }
                    return false;
                }

                /**
                 * Perform a "Seamless Refresh" using double buffering.
                 */
                function performSeamlessRefresh() {
                    loadingOverlay.style.display = 'block';

                    pendingFrame.onload = () => {
                        // Swap frames
                        activeFrame.classList.add('hidden');
                        pendingFrame.classList.remove('hidden');

                        // Update references
                        const temp = activeFrame;
                        activeFrame = pendingFrame;
                        pendingFrame = temp;

                        focusActiveFrame();
                        loadingOverlay.style.display = 'none';
                    };

                    // Trigger load in pending frame
                    try {
                        const reloadUrl = new URL(activeFrame.src);
                        reloadUrl.searchParams.set('_n8nacRefresh', String(Date.now()));
                        pendingFrame.src = reloadUrl.toString();
                    } catch (e) {
                        pendingFrame.src = activeFrame.src;
                    }
                }

                // Handle messages from the extension and iframe
                // Security:
                //   - iframeOrigin is used to validate that paste/copy messages come
                //     from the legitimate n8n iframe, not an unrelated window.
                //   - Per-request one-time grant tokens (generated here, never in the
                //     iframe) prevent a static secret from being embedded in the
                //     iframe page where hostile scripts could read and replay it.
                //   - Rate limiting caps clipboard reads to one per PASTE_RATE_LIMIT_MS
                //     to bound the worst-case exfiltration window.
                var iframeOrigin = ${JSON.stringify(iframePermissionOrigin)};
                var PASTE_RATE_LIMIT_MS = 1000;
                var _lastPasteMs = 0;
                var _pendingGrants = new Map();
                var GRANT_TTL_MS = 5000;

                function issuePasteGrant() {
                    var token = crypto.randomUUID();
                    var expiry = Date.now() + GRANT_TTL_MS;
                    _pendingGrants.set(token, expiry);
                    // Auto-expire
                    setTimeout(function() { _pendingGrants.delete(token); }, GRANT_TTL_MS);
                    return token;
                }

                function consumeGrant(token) {
                    var expiry = _pendingGrants.get(token);
                    if (!expiry || Date.now() > expiry) return false;
                    _pendingGrants.delete(token);
                    return true;
                }

                window.addEventListener('message', (event) => {
                    const message = event.data;
                    if (!message || typeof message !== 'object') return;

                    if (message.type === ${reloadMessageTypeJs}) {
                        const softRefreshWorked = attemptSoftRefresh();
                        if (!softRefreshWorked) {
                            performSeamlessRefresh();
                        }
                        return;
                    }

                    // Clipboard bridge: iframe requests paste data -> forward to extension host
                    // Validate origin, apply rate limit, issue a one-time grant token.
                    if (message.type === 'n8n-paste-request') {
                        if (event.origin !== iframeOrigin) return;
                        var now = Date.now();
                        if (now - _lastPasteMs < PASTE_RATE_LIMIT_MS) return;
                        _lastPasteMs = now;
                        var grantToken = issuePasteGrant();
                        vscode.postMessage({ type: 'clipboard-paste-request', grantToken: grantToken });
                        return;
                    }

                    // Clipboard bridge: iframe sends copied text -> write to system clipboard
                    if (message.type === 'n8n-clipboard-write' && typeof message.text === 'string') {
                        if (event.origin !== iframeOrigin) return;
                        vscode.postMessage({ type: 'clipboard-write', text: message.text });
                        return;
                    }

                    // Clipboard bridge: extension reports clipboard read failure \u2014 consume the grant.
                    if (message.type === 'clipboard-error' && typeof message.grantToken === 'string') {
                        consumeGrant(message.grantToken);
                        return;
                    }

                    // Clipboard bridge: extension sends paste data back -> forward to iframe
                    // Reject messages that did not originate from the extension host
                    // (i.e. reject any attempt by the iframe to spoof this path).
                    // Then consume the one-time grant token before forwarding.
                    if (message.type === 'clipboard-paste' && typeof message.text === 'string'
                            && typeof message.grantToken === 'string') {
                        if (event.origin !== window.origin) return;
                        if (!consumeGrant(message.grantToken)) return;
                        try {
                            var iframeWin = activeFrame.contentWindow;
                            if (iframeWin) iframeWin.postMessage({ type: 'n8n-clipboard-paste', text: message.text }, iframeOrigin);
                        } catch(e) {}
                        return;
                    }
                });

                window.addEventListener('pointerdown', () => focusActiveFrame(), true);
            </script>
        </body>
        </html>`;
}

// src/services/workflow-webview-registry.ts
var WorkflowWebviewRegistry = class {
  targets = /* @__PURE__ */ new Set();
  debugLogger;
  setDebugLogger(logger) {
    this.debugLogger = logger;
  }
  register(target) {
    this.targets.add(target);
    this.debugLogger?.(`[workflow-registry] register target=${target.describeTarget?.() || "unknown"} workflowId=${target.getWorkflowId() || "none"} total=${this.targets.size}`);
    return {
      dispose: () => {
        this.targets.delete(target);
        this.debugLogger?.(`[workflow-registry] dispose target=${target.describeTarget?.() || "unknown"} total=${this.targets.size}`);
      }
    };
  }
  reloadIfMatching(workflowId) {
    let reloaded = false;
    this.debugLogger?.(`[workflow-registry] reloadIfMatching workflowId=${workflowId} targets=${this.targets.size}`);
    for (const target of [...this.targets]) {
      const targetWorkflowId = target.getWorkflowId();
      if (targetWorkflowId !== workflowId) {
        this.debugLogger?.(`[workflow-registry] skip target=${target.describeTarget?.() || "unknown"} targetWorkflowId=${targetWorkflowId || "none"}`);
        continue;
      }
      reloaded = true;
      this.debugLogger?.(`[workflow-registry] reloading target=${target.describeTarget?.() || "unknown"} workflowId=${workflowId}`);
      void Promise.resolve(target.reloadWorkflow()).catch(() => {
      });
    }
    this.debugLogger?.(`[workflow-registry] reloadIfMatching result workflowId=${workflowId} reloaded=${reloaded}`);
    return reloaded;
  }
};
var workflowWebviewRegistry = new WorkflowWebviewRegistry();

// src/ui/workflow-webview.ts
var WorkflowWebview = class _WorkflowWebview {
  static currentPanel;
  _panel;
  _workflowId;
  _disposables = [];
  _registryDisposable;
  _onClipboardPasteRequest;
  constructor(panel, workflowId, url) {
    this._panel = panel;
    this._workflowId = workflowId;
    this._registryDisposable = workflowWebviewRegistry.register({
      getWorkflowId: () => this._workflowId,
      reloadWorkflow: () => this._panel.webview.postMessage({ type: WORKFLOW_WEBVIEW_RELOAD_MESSAGE })
    });
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this.getHtmlForWebview(workflowId, url);
    this._panel.webview.onDidReceiveMessage(async (message) => {
      if (message.type === "clipboard-write" && typeof message.text === "string") {
        try {
          await vscode10.env.clipboard.writeText(message.text);
        } catch (e) {
          console.error("[Webview] Clipboard write error", e);
        }
      }
      if (message.type === "clipboard-paste-request" && typeof message.grantToken === "string") {
        void this._onClipboardPasteRequest?.(this._panel, message.grantToken)?.catch((e) => console.error("[Webview] Clipboard paste handler error", e));
      }
    }, null, this._disposables);
  }
  /**
   * Register a callback for when the iframe requests paste data.
   * The callback receives the panel and the one-time grant token so it can
   * send clipboard data back, and the token is validated on the webview side.
   */
  static onClipboardPasteRequest(handler) {
    if (_WorkflowWebview.currentPanel) {
      _WorkflowWebview.currentPanel._onClipboardPasteRequest = handler;
    }
  }
  static createOrShow(workflow, url, viewColumn) {
    const column = viewColumn || (vscode10.window.activeTextEditor ? vscode10.window.activeTextEditor.viewColumn : void 0);
    if (_WorkflowWebview.currentPanel) {
      _WorkflowWebview.currentPanel._panel.reveal(column);
      _WorkflowWebview.currentPanel.update(workflow.id, url);
      return;
    }
    const panel = vscode10.window.createWebviewPanel(
      "n8nWorkflow",
      `n8n: ${workflow.name}`,
      column || vscode10.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        // Keep webview state when hidden
        localResourceRoots: []
        // Security: No local file access needed
      }
    );
    _WorkflowWebview.currentPanel = new _WorkflowWebview(panel, workflow.id, url);
  }
  /**
   * Trigger a reload of the webview if the workflowId matches the one currently displayed.
   */
  static reloadIfMatching(workflowId, _outputChannel) {
    return workflowWebviewRegistry.reloadIfMatching(workflowId);
  }
  update(workflowId, url) {
    this._workflowId = workflowId;
    this._panel.title = `n8n: ${workflowId}`;
    this._panel.webview.html = this.getHtmlForWebview(workflowId, url);
  }
  dispose() {
    if (_WorkflowWebview.currentPanel === this) {
      _WorkflowWebview.currentPanel = void 0;
    }
    this._registryDisposable?.dispose();
    this._registryDisposable = void 0;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) x.dispose();
    }
  }
  getHtmlForWebview(workflowId, url) {
    return buildWebviewHtml(workflowId, url);
  }
};

// src/ui/agent-workbench-webview.ts
import * as vscode12 from "vscode";
import * as fs from "fs";

// src/ui/agent-workbench-html.ts
var AGENT_WORKBENCH_BUILD = "awb-2026.05.21.1-last-active-session";
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function getNonce() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let nonce = "";
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}
function buildAgentWorkbenchHtml(input) {
  const nonce = getNonce();
  const hasWorkflow = Boolean(input.workflowAttached || input.workflowUrl);
  const hasWorkflowUi = Boolean(input.workflowUrl);
  const safeWorkflowName = escapeHtml(input.workflowName);
  const safeWorkflowId = escapeHtml(input.workflowId);
  const initialWorkflowLabel = hasWorkflow ? safeWorkflowName : "No workflow context";
  const safeWorkflowUrl = escapeHtml(input.workflowUrl || "");
  const safeProviderModelLabel = escapeHtml(input.providerModelLabel);
  const safeWorkbenchBuild = escapeHtml(AGENT_WORKBENCH_BUILD);
  const workflowIdJs = JSON.stringify(input.workflowId);
  const workflowNameJs = JSON.stringify(input.workflowName || input.workflowId || "Current workflow");
  const workflowFilenameJs = JSON.stringify(input.workflowFilename || "");
  const workflowFilePathJs = JSON.stringify(input.workflowFilePath || "");
  const workflowUrlJs = JSON.stringify(input.workflowUrl || "");
  const workflowReloadUrlJs = JSON.stringify(input.workflowReloadUrl || input.workflowUrl || "");
  let iframePermissionOrigin = "src";
  try {
    iframePermissionOrigin = input.workflowUrl ? new URL(input.workflowUrl).origin : "src";
  } catch {
  }
  const iframeAllowPolicy = `clipboard-read ${iframePermissionOrigin}; clipboard-write ${iframePermissionOrigin}; geolocation ${iframePermissionOrigin}; microphone ${iframePermissionOrigin}; camera ${iframePermissionOrigin}`;
  const lucideIcon = (paths) => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
  const newConversationIcon = lucideIcon('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v6"/><path d="M9 10h6"/>');
  const historyIcon = lucideIcon('<path d="M3 12a9 9 0 1 0 9-9 9.8 9.8 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>');
  const trashIcon = lucideIcon('<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>');
  const compactIcon = lucideIcon('<path d="M6 12h12"/><path d="m8 4 4 4 4-4"/><path d="m8 20 4-4 4 4"/>');
  const checkpointIcon = lucideIcon('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>');
  const rewindIcon = lucideIcon('<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>');
  const copyIcon = lucideIcon('<rect width="12" height="12" x="8" y="8" rx="1.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>');
  const stopIcon = lucideIcon('<rect width="10" height="10" x="7" y="7" rx="1.5"/>');
  const sendIcon = lucideIcon('<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>');
  const readOpIcon = lucideIcon('<path d="M12 7v10"/><path d="M17 12H7"/>');
  const writeOpIcon = lucideIcon('<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>');
  const shellOpIcon = lucideIcon('<path d="m4 17 6-5-6-5"/><path d="M12 19h8"/>');
  const webOpIcon = lucideIcon('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/>');
  const toolOpIcon = lucideIcon('<path d="M14.7 6.3a4 4 0 0 0-5.66 5.66L4 17v3h3l5.04-5.04A4 4 0 0 0 17.7 9.3l-2 2-3-3 2-2Z"/>');
  const agentOpIcon = lucideIcon('<path d="M12 3 4 7v5c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V7l-8-4Z"/><path d="M9.5 12.5 11 14l3.5-3.5"/>');
  const phaseOpIcon = lucideIcon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>');
  const thinkingOpIcon = lucideIcon('<path d="M9.5 9a3 3 0 1 1 5 2.2c-.8.7-1.5 1.2-1.5 2.3"/><path d="M12 17h.01"/><path d="M7 4.8A9 9 0 1 0 17 4.8"/>');
  const todoOpIcon = lucideIcon('<path d="M9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>');
  const statusRunningIcon = lucideIcon('<path d="M21 12a9 9 0 1 1-6.22-8.56"/><path d="M21 3v6h-6"/>');
  const statusDoneIcon = lucideIcon('<path d="M20 6 9 17l-5-5"/>');
  const statusErrorIcon = lucideIcon('<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>');
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src *; connect-src *; img-src * data:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>n8n Agent Workbench: ${safeWorkflowName}</title>
    <style>
        :root {
            color-scheme: light dark;
            --border: var(--vscode-panel-border, #2f3337);
            --muted: var(--vscode-descriptionForeground, #8b949e);
            --bg: var(--vscode-editor-background, #1e1e1e);
            --panel: var(--vscode-sideBar-background, #181818);
            --elevated: color-mix(in srgb, var(--panel) 88%, white 4%);
            --text: var(--vscode-editor-foreground, #d4d4d4);
            --accent: var(--vscode-button-background, #0e639c);
            --accent-text: var(--vscode-button-foreground, #ffffff);
            --input: var(--vscode-input-background, #2a2a2a);
            --success: var(--vscode-testing-iconPassed, #3fb950);
            --error: var(--vscode-errorForeground, #f85149);
            --warning: var(--vscode-editorWarning-foreground, #d29922);
        }
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: var(--bg);
            color: var(--text);
            font-family: var(--vscode-font-family, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
        }
        * { box-sizing: border-box; }
        button, input, select, textarea { font: inherit; }
        .workbench {
            display: grid;
            grid-template-columns: ${hasWorkflow ? "minmax(360px, .95fr) minmax(420px, 1.05fr)" : "minmax(420px, 1fr)"};
            height: 100vh;
            width: 100vw;
            min-width: 0;
            min-height: 0;
        }
        .chat {
            min-width: 0;
            min-height: 0;
            background: var(--panel);
        }
        .chat {
            display: grid;
            grid-template-rows: auto 1fr auto;
            border-right: ${hasWorkflow ? "1px solid var(--border)" : "0"};
        }
        .workflow {
            position: relative;
            min-width: 0;
            min-height: 0;
            background: var(--bg);
        }
        .chat-head {
            padding: 12px 14px;
        }
        .chat-head {
            border-bottom: 1px solid var(--border);
        }
        .chat-title {
            font-size: 14px;
            font-weight: 700;
        }
        .chat-subtitle, .meta-text {
            color: var(--muted);
            font-size: 12px;
            line-height: 1.4;
        }
        .toolbar {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 10px;
        }
        .toolbar.compact {
            margin-top: 0;
        }
        .meta-grid {
            display: grid;
            gap: 6px;
        }
        .meta-row {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            align-items: baseline;
        }
        .meta-row code {
            color: var(--text);
            overflow-wrap: anywhere;
        }
        .sessions {
            overflow: auto;
            min-height: 0;
            padding: 8px 0 0;
            display: grid;
            gap: 8px;
        }
        .session-item {
            border: 1px solid var(--border);
            border-radius: 10px;
            background: color-mix(in srgb, var(--bg) 82%, transparent);
            padding: 10px;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: flex-start;
            gap: 6px;
        }
        .session-item.active {
            border-color: color-mix(in srgb, var(--accent) 58%, var(--border));
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 42%, transparent);
        }
        button.session-select {
            display: grid;
            min-width: 0;
            gap: 6px;
            padding: 0;
            border: 0;
            border-radius: 6px;
            background: transparent;
            color: var(--text);
            text-align: left;
        }
        button.session-select:focus-visible {
            outline: 1px solid var(--vscode-focusBorder, var(--accent));
            outline-offset: 2px;
        }
        .session-item-head {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            align-items: flex-start;
        }
        .session-item-title {
            font-size: 13px;
            font-weight: 650;
            line-height: 1.35;
            overflow-wrap: anywhere;
        }
        .session-item-badges {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            justify-content: flex-end;
            align-items: center;
            flex: 0 0 auto;
        }
        .session-delete {
            width: 26px;
            height: 26px;
            min-width: 26px;
            padding: 0;
            border-radius: 6px;
            color: var(--muted);
        }
        .session-delete:hover:not(:disabled) {
            color: var(--error);
            border-color: color-mix(in srgb, var(--error) 58%, var(--border));
            background: color-mix(in srgb, var(--error) 12%, transparent);
        }
        .session-delete svg {
            width: 14px;
            height: 14px;
            stroke: currentColor;
            fill: none;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        .badge {
            border: 1px solid var(--border);
            border-radius: 999px;
            padding: 2px 7px;
            font-size: 11px;
            color: var(--muted);
        }
        .badge.active {
            color: var(--accent-text);
            background: var(--accent);
            border-color: var(--accent);
        }
        .badge.error {
            color: var(--error);
            border-color: color-mix(in srgb, var(--error) 55%, var(--border));
        }
        .badge.success {
            color: var(--success);
            border-color: color-mix(in srgb, var(--success) 55%, var(--border));
        }
        .session-item-foot {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            color: var(--muted);
            font-size: 11px;
        }
        .checkpoint-item {
            border: 1px solid var(--border);
            border-radius: 10px;
            background: color-mix(in srgb, var(--bg) 82%, transparent);
            padding: 10px;
            display: grid;
            gap: 8px;
        }
        .checkpoint-item-head,
        .checkpoint-item-foot {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            align-items: flex-start;
        }
        .checkpoint-item-title {
            font-size: 13px;
            font-weight: 650;
            line-height: 1.35;
            overflow-wrap: anywhere;
        }
        .checkpoint-item-meta {
            color: var(--muted);
            font-size: 11px;
            line-height: 1.4;
        }
        .checkpoint-actions {
            display: flex;
            gap: 7px;
            justify-content: flex-end;
            flex-wrap: wrap;
        }
        .history-overlay,
        .checkpoint-overlay {
            position: fixed;
            inset: 0;
            z-index: 10;
            display: none;
            align-items: flex-start;
            justify-content: center;
            padding-top: 42px;
            background: rgba(0, 0, 0, .28);
        }
        .history-overlay.open,
        .checkpoint-overlay.open { display: flex; }
        .history-modal,
        .checkpoint-modal {
            width: min(560px, calc(100vw - 28px));
            max-height: min(640px, calc(100vh - 84px));
            display: grid;
            grid-template-rows: auto auto 1fr auto;
            border: 1px solid var(--border);
            border-radius: 12px;
            background: color-mix(in srgb, var(--panel) 96%, black 8%);
            box-shadow: 0 18px 48px rgba(0, 0, 0, .45);
            overflow: hidden;
        }
        .checkpoint-modal { grid-template-rows: auto 1fr auto; }
        .history-head,
        .history-controls,
        .history-foot,
        .checkpoint-head,
        .checkpoint-foot {
            padding: 12px;
            border-bottom: 1px solid color-mix(in srgb, var(--border) 75%, transparent);
        }
        .history-head,
        .checkpoint-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }
        .history-title,
        .checkpoint-title {
            font-size: 14px;
            font-weight: 650;
        }
        .history-list,
        .checkpoint-list {
            overflow: auto;
            min-height: 0;
            padding: 10px 12px;
        }
        .history-foot,
        .checkpoint-foot {
            border-bottom: 0;
            border-top: 1px solid color-mix(in srgb, var(--border) 75%, transparent);
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }
        #checkpoint-open,
        #checkpoint-overlay,
        .checkpoint-item .checkpoint-actions {
            display: none !important;
        }
        .chat-head {
            display: grid;
            gap: 10px;
        }
        .chat-head-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            align-items: flex-start;
        }
        .chat-head-main {
            min-width: 0;
            display: grid;
            gap: 8px;
            flex: 1 1 auto;
        }
        .chat-title-row {
            display: flex;
            align-items: baseline;
            gap: 10px;
            min-width: 0;
        }
        .conversation-title {
            min-width: 0;
            color: var(--muted);
            font-size: 12px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .workbench-build {
            color: var(--muted);
            font-size: 10px;
            line-height: 1;
            opacity: .72;
            flex: 0 0 auto;
            user-select: text;
        }
        .context-actions {
            display: flex;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
            min-width: 0;
        }
        .workflow-selector {
            width: fit-content;
            max-width: 100%;
            min-height: 0;
            padding: 0;
            color: var(--muted);
            background: transparent;
            border: 0;
            border-radius: 0;
            text-align: left;
            font-size: 12px;
            line-height: 1.4;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .workflow-selector:hover {
            color: var(--text);
            text-decoration: underline;
        }
        .header-actions {
            position: relative;
            display: flex;
            gap: 8px;
            align-items: center;
            justify-content: flex-end;
            min-width: 0;
        }
        .run-indicator {
            display: none;
            width: 15px;
            height: 15px;
            grid-template-columns: repeat(3, 1fr);
            gap: 2px;
            align-items: center;
            justify-self: start;
            padding: 10px 14px 18px;
        }
        .run-indicator.active { display: grid; }
        .run-indicator span {
            width: 3px;
            height: 3px;
            background: var(--muted);
            opacity: .35;
            animation: pixelPulse 900ms infinite ease-in-out;
        }
        .run-indicator span:nth-child(2) { animation-delay: 90ms; }
        .run-indicator span:nth-child(3) { animation-delay: 180ms; }
        .run-indicator span:nth-child(4) { animation-delay: 270ms; }
        .run-indicator span:nth-child(5) { animation-delay: 360ms; background: var(--accent); }
        .run-indicator span:nth-child(6) { animation-delay: 450ms; }
        .run-indicator span:nth-child(7) { animation-delay: 540ms; }
        .run-indicator span:nth-child(8) { animation-delay: 630ms; }
        .run-indicator span:nth-child(9) { animation-delay: 720ms; }
        @keyframes pixelPulse {
            0%, 100% { opacity: .25; transform: scale(.8); }
            50% { opacity: 1; transform: scale(1.15); }
        }
        .chat-meta {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
        }
        .context-pill {
            display: none;
            gap: 7px;
            align-items: center;
            max-width: 230px;
            border: 1px solid var(--border);
            border-radius: 999px;
            padding: 4px 8px;
            color: var(--muted);
            font-size: 12px;
            line-height: 1.2;
            white-space: nowrap;
        }
        .context-pill.active { display: inline-flex; }
        .context-meter {
            width: 42px;
            height: 4px;
            border-radius: 999px;
            background: color-mix(in srgb, var(--border) 70%, transparent);
            overflow: hidden;
        }
        .context-meter-fill {
            display: block;
            width: 0;
            height: 100%;
            background: var(--accent);
        }
        .feed {
            overflow: auto;
            min-height: 0;
            padding: 14px 14px 8px;
            display: grid;
            gap: 10px;
            align-content: start;
        }
        .entry {
            border: 1px solid var(--border);
            border-radius: 12px;
            background: color-mix(in srgb, var(--bg) 84%, transparent);
            padding: 10px 11px;
            white-space: pre-wrap;
            line-height: 1.45;
            font-size: 13px;
            overflow-wrap: anywhere;
        }
        .entry.user {
            border-color: color-mix(in srgb, var(--accent) 55%, var(--border));
        }
        .entry.system { color: var(--muted); }
        .entry.assistant.streaming { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 35%, transparent); }
        .entry.operation, .entry.compaction, .entry.context { background: color-mix(in srgb, var(--elevated) 90%, transparent); }
        .entry-body {
            white-space: pre-wrap;
        }
        .message-group {
            display: grid;
            gap: 6px;
        }
        .message-actions {
            display: flex;
            justify-content: flex-end;
            gap: 14px;
            padding-right: 1px;
        }
        .message-action {
            display: inline-grid;
            place-items: center;
            width: 18px;
            height: 18px;
            border: 0;
            border-radius: 4px;
            background: transparent;
            color: var(--muted);
            cursor: pointer;
            padding: 0;
        }
        .message-action:hover:not(:disabled) {
            color: var(--text);
            background: color-mix(in srgb, var(--elevated) 70%, transparent);
        }
        .message-action:disabled {
            opacity: 0.55;
            cursor: default;
        }
        .message-action svg {
            width: 14px;
            height: 14px;
            stroke: currentColor;
            fill: none;
            stroke-width: 1.7;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        .entry-head {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            align-items: center;
            margin-bottom: 6px;
        }
        .entry-title {
            display: flex;
            gap: 8px;
            align-items: center;
            font-weight: 650;
        }
        .entry-kind-icon {
            display: inline-grid;
            place-items: center;
            width: 18px;
            height: 18px;
            color: var(--muted);
            flex: 0 0 auto;
        }
        .entry-kind-icon svg {
            width: 15px;
            height: 15px;
            stroke: currentColor;
            fill: none;
            stroke-width: 1.9;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        .entry-subtle {
            color: var(--muted);
            font-size: 11px;
        }
        .entry-status {
            color: var(--muted);
            font-size: 11px;
            display: inline-grid;
            place-items: center;
            width: 18px;
            height: 18px;
            flex: 0 0 auto;
        }
        .entry-status svg {
            width: 15px;
            height: 15px;
            stroke: currentColor;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        .entry-status.running { color: var(--warning); }
        .entry-status.done { color: var(--success); }
        .entry-status.error { color: var(--error); }
        .details {
            margin-top: 8px;
            border-top: 1px solid color-mix(in srgb, var(--border) 75%, transparent);
            padding-top: 8px;
        }
        .details summary {
            cursor: pointer;
            color: var(--muted);
            font-size: 12px;
        }
        .details-body {
            margin-top: 8px;
            padding: 8px;
            border-radius: 8px;
            background: color-mix(in srgb, var(--bg) 76%, transparent);
            white-space: pre-wrap;
            font-family: var(--vscode-editor-font-family, var(--vscode-font-family, monospace));
            font-size: 12px;
        }
        .operation-compact {
            display: grid;
            gap: 6px;
            margin-top: 2px;
        }
        .operation-row {
            display: grid;
            grid-template-columns: 68px minmax(0, 1fr);
            gap: 8px;
            align-items: baseline;
            min-width: 0;
            font-size: 12px;
        }
        .operation-label {
            color: var(--muted);
            font-size: 11px;
            text-transform: uppercase;
        }
        .operation-value {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .operation-code {
            font-family: var(--vscode-editor-font-family, var(--vscode-font-family, monospace));
        }
        .todo-list {
            display: grid;
            gap: 4px;
        }
        .todo-checklist {
            display: grid;
            gap: 5px;
            margin-top: 4px;
        }
        .todo-item {
            display: grid;
            grid-template-columns: 16px minmax(0, 1fr);
            gap: 7px;
            align-items: start;
            color: var(--text);
            font-size: 12px;
        }
        .todo-box {
            display: inline-grid;
            place-items: center;
            width: 13px;
            height: 13px;
            margin-top: 2px;
            border: 1px solid color-mix(in srgb, var(--muted) 72%, transparent);
            border-radius: 3px;
            color: var(--accent-text);
            background: transparent;
            font-size: 10px;
            line-height: 1;
        }
        .todo-item.completed .todo-box {
            border-color: var(--success);
            background: color-mix(in srgb, var(--success) 72%, transparent);
        }
        .todo-item.in-progress .todo-box {
            border-color: var(--warning);
            background: color-mix(in srgb, var(--warning) 18%, transparent);
        }
        .todo-text {
            min-width: 0;
            overflow-wrap: anywhere;
        }
        .todo-item.completed .todo-text {
            color: var(--muted);
            text-decoration: line-through;
        }
        .todo-line {
            display: grid;
            grid-template-columns: 86px minmax(0, 1fr);
            gap: 8px;
        }
        .todo-status {
            color: var(--muted);
            text-transform: capitalize;
        }
        .composer {
            display: grid;
            gap: 6px;
            margin: 8px 12px 12px;
            padding: 8px;
            border: 1px solid var(--vscode-input-border, var(--border));
            border-radius: 8px;
            background: var(--input);
            box-shadow: 0 0 0 1px color-mix(in srgb, var(--border) 45%, transparent);
        }
        .composer-input {
            display: grid;
            gap: 4px;
            min-width: 0;
        }
        .composer-meta {
            display: flex;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
        }
        .pending-prompt {
            display: none;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 8px;
            align-items: center;
            padding: 6px 7px 6px 9px;
            border: 1px solid color-mix(in srgb, var(--accent) 42%, var(--border));
            border-radius: 7px;
            background: color-mix(in srgb, var(--accent) 14%, transparent);
            color: var(--text);
            font-size: 12px;
        }
        .pending-prompt.open { display: grid; }
        .runtime-finalizing {
            display: none;
            color: var(--muted);
            font-size: 11px;
            line-height: 1.25;
            padding: 0 2px;
        }
        .runtime-finalizing.open {
            display: block;
        }
        .pending-prompt-main {
            display: flex;
            gap: 7px;
            align-items: center;
            min-width: 0;
        }
        .pending-prompt-label {
            flex: 0 0 auto;
            color: var(--muted);
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0;
        }
        .pending-prompt-text {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .pending-prompt button {
            min-height: 24px;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 11px;
        }
        .composer-toolbar {
            display: flex;
            gap: 8px;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            min-height: 30px;
        }
        .composer-provider {
            position: relative;
            display: flex;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
            min-width: 0;
        }
        .inline-popover {
            position: absolute;
            left: 0;
            bottom: calc(100% + 8px);
            z-index: 8;
            display: none;
            width: min(390px, calc(100vw - 28px));
            max-height: min(420px, calc(100vh - 96px));
            overflow: hidden;
            border: 1px solid var(--border);
            border-radius: 10px;
            background: color-mix(in srgb, var(--panel) 96%, black 6%);
            box-shadow: 0 16px 42px rgba(0, 0, 0, .42);
            grid-template-rows: auto auto auto minmax(0, 1fr) auto;
        }
        .inline-popover.open { display: grid; }
        .inline-popover.reasoning {
            left: auto;
            right: 0;
            width: 220px;
        }
        .inline-popover.new-session {
            left: auto;
            right: 0;
            top: calc(100% + 8px);
            bottom: auto;
            width: min(340px, calc(100vw - 28px));
        }
        .inline-popover.worktree {
            left: auto;
            right: 0;
            width: min(340px, calc(100vw - 28px));
        }
        .inline-option.worktree-item {
            grid-template-columns: 1fr auto auto auto;
        }
        .inline-option.worktree-item .branch-name {
            color: var(--muted);
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 10px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .worktree-delete {
            width: 22px;
            height: 22px;
            min-width: 22px;
            padding: 0;
            border-radius: 4px;
            color: var(--muted);
            display: inline-grid;
            place-items: center;
        }
        .worktree-delete:hover {
            color: var(--error);
            background: color-mix(in srgb, var(--error) 12%, transparent);
        }
        .worktree-delete svg {
            width: 12px;
            height: 12px;
        }
        #select-worktree {
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        #select-worktree.worktree-active {
            color: var(--accent-text);
            background: var(--accent);
        }
        .worktree-warning {
            display: none;
            padding: 4px 14px 6px;
            color: var(--warning);
            font-size: 12px;
            line-height: 1.4;
        }
        .worktree-warning.active {
            display: block;
        }
        .inline-popover-head {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            align-items: center;
            padding: 9px 10px;
            border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
            color: var(--muted);
            font-size: 12px;
        }
        .inline-popover-head strong {
            color: var(--text);
            font-weight: 650;
        }
        .inline-back {
            display: flex;
            align-items: center;
            gap: 6px;
            width: 100%;
            padding: 9px 10px;
            border: 0;
            border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
            border-radius: 0;
            color: var(--text);
            background: color-mix(in srgb, var(--accent) 16%, transparent);
            text-align: left;
            font-size: 12px;
            font-weight: 650;
        }
        .inline-back:hover {
            background: color-mix(in srgb, var(--accent) 24%, transparent);
        }
        .inline-search-wrap {
            padding: 8px 9px;
            border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
        }
        .inline-search {
            min-height: 30px;
            padding: 6px 8px;
            border-radius: 7px;
            font-size: 12px;
        }
        .inline-popover-list {
            overflow: auto;
            min-height: 0;
            padding: 4px;
        }
        .inline-popover-foot {
            padding: 7px 10px;
            border-top: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
        }
        .inline-divider {
            height: 1px;
            margin: 4px 6px;
            background: color-mix(in srgb, var(--border) 72%, transparent);
        }
        .inline-link {
            width: auto;
            min-height: 0;
            padding: 0;
            border: 0;
            color: var(--muted);
            background: transparent;
            font-size: 12px;
            text-align: left;
        }
        .inline-link:hover {
            color: var(--text);
            text-decoration: underline;
        }
        .inline-option {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 4px 10px;
            width: 100%;
            padding: 8px 9px;
            border: 0;
            border-radius: 7px;
            background: transparent;
            color: var(--text);
            text-align: left;
        }
        .inline-option:hover,
        .inline-option.active {
            background: color-mix(in srgb, var(--accent) 18%, transparent);
        }
        .inline-option .main {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .inline-option .sub,
        .inline-option .mark {
            color: var(--muted);
            font-size: 11px;
        }
        .inline-option .mark { align-self: center; }
        .inline-option.provider {
            font-weight: 650;
        }
        .context-badges {
            display: flex;
            gap: 6px;
            align-items: center;
            flex-wrap: wrap;
            min-width: 0;
        }
        .context-badge {
            display: inline-flex;
            gap: 6px;
            align-items: center;
            width: fit-content;
            max-width: 100%;
            padding: 3px 8px;
            border: 1px solid color-mix(in srgb, var(--accent) 55%, var(--border));
            border-radius: 999px;
            color: var(--accent-text);
            background: color-mix(in srgb, var(--accent) 60%, transparent);
            font-size: 12px;
            line-height: 1.25;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .context-badge.workflow {
            border-color: color-mix(in srgb, var(--warning) 60%, var(--border));
            color: var(--text);
            background: color-mix(in srgb, var(--warning) 30%, transparent);
        }
        .context-badge button {
            border: 0;
            background: transparent;
            color: inherit;
            cursor: pointer;
            padding: 0 1px;
            line-height: 1;
        }
        .mention-menu {
            display: none;
            max-height: 220px;
            overflow: auto;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: color-mix(in srgb, var(--panel) 96%, black 4%);
            box-shadow: 0 10px 28px rgba(0, 0, 0, .32);
        }
        .mention-menu.open { display: grid; }
        .mention-option {
            display: grid;
            gap: 2px;
            padding: 8px 10px;
            border: 0;
            border-bottom: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
            background: transparent;
            color: var(--text);
            text-align: left;
            cursor: pointer;
        }
        .mention-option:hover { background: color-mix(in srgb, var(--accent) 18%, transparent); }
        .mention-option small { color: var(--muted); }
        .composer-actions {
            display: flex;
            gap: 8px;
            align-items: center;
            margin-left: auto;
        }
        textarea, input[type="text"], select {
            width: 100%;
            min-height: 36px;
            border: 1px solid var(--vscode-input-border, transparent);
            border-radius: 8px;
            background: var(--input);
            color: var(--text);
            padding: 9px 10px;
            outline: none;
        }
        textarea {
            resize: none;
            min-height: 72px;
            max-height: 160px;
            line-height: 1.4;
            border: 0;
            border-radius: 0;
            background: transparent;
            padding: 4px 2px;
        }
        button {
            border: none;
            border-radius: 8px;
            padding: 8px 11px;
            color: var(--accent-text);
            background: var(--accent);
            cursor: pointer;
        }
        button.secondary {
            color: var(--vscode-button-secondaryForeground, var(--text));
            background: var(--vscode-button-secondaryBackground, #3a3d41);
        }
        button.ghost {
            color: var(--muted);
            background: transparent;
            border: 1px solid var(--border);
        }
        button.small {
            padding: 5px 8px;
            font-size: 12px;
            min-height: 30px;
        }
        button.icon-button {
            display: inline-grid;
            place-items: center;
            width: 30px;
            min-width: 30px;
            height: 30px;
            padding: 0;
        }
        button.icon-button svg {
            width: 15px;
            height: 15px;
            stroke: currentColor;
            fill: none;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        .composer button.small,
        .composer .send-button,
        .composer .stop-button {
            min-height: 28px;
            padding: 4px 8px;
            border-radius: 6px;
        }
        .send-button,
        .stop-button.active {
            display: inline-grid;
            place-items: center;
            width: 32px;
            min-width: 32px;
            height: 32px;
            padding: 0;
            border-radius: 9px;
            line-height: 1;
            box-shadow: 0 1px 0 color-mix(in srgb, white 18%, transparent) inset;
        }
        .send-button svg,
        .stop-button svg {
            width: 15px;
            height: 15px;
            stroke: currentColor;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        .stop-button {
            display: none;
        }
        .stop-button.active {
            color: var(--error);
            background: transparent;
            border: 1px solid color-mix(in srgb, var(--error) 55%, var(--border));
            box-shadow: none;
        }
        button:disabled {
            cursor: not-allowed;
            opacity: .55;
        }
        .session-item {
            color: var(--text);
            text-align: left;
            background: color-mix(in srgb, var(--bg) 82%, transparent);
            border: 1px solid var(--border);
        }
        iframe {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            border: 0;
        }
        .empty-workflow {
            position: absolute;
            inset: 0;
            display: grid;
            place-items: center;
            padding: 24px;
            text-align: center;
            color: var(--muted);
        }
        .refresh-pill {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 2;
            display: none;
            padding: 5px 9px;
            border-radius: 999px;
            background: var(--accent);
            color: var(--accent-text);
            font-size: 12px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
        }
        .empty-note {
            color: var(--muted);
            font-size: 12px;
            line-height: 1.5;
            padding: 12px 14px;
        }
        @media (max-width: 1200px) {
            .workbench {
                grid-template-columns: 1fr;
                grid-template-rows: ${hasWorkflow ? "minmax(360px, 48%) 1fr" : "1fr"};
            }
            .chat {
                border-right: 0;
            }
            .workflow {
                grid-column: 1 / -1;
                border-top: 1px solid var(--border);
            }
        }
        @media (max-width: 900px) {
            .workbench {
                grid-template-columns: 1fr;
                grid-template-rows: auto ${hasWorkflow ? "minmax(280px, 42%)" : ""};
            }
            .chat {
                border-right: 0;
                border-bottom: 1px solid var(--border);
            }
            .composer { margin: 8px; }
        }
    </style>
</head>
<body>
    <main id="workbench" class="workbench">
        <section class="chat" aria-label="Agent chat">
            <header class="chat-head">
                <div class="chat-head-row">
                    <div class="chat-head-main">
                        <div class="chat-title-row">
                            <div class="chat-title">Workflow Architect</div>
                            <div id="conversation-title" class="conversation-title"></div>
                            <div class="workbench-build" title="Agent Workbench build">${safeWorkbenchBuild}</div>
                        </div>
                        <div class="context-actions">
                            <div id="context-pill" class="context-pill" title="Context usage">
                                <span id="context-label">Context</span>
                                <span class="context-meter" aria-hidden="true"><span id="context-meter-fill" class="context-meter-fill"></span></span>
                            </div>
                            <button id="compact-context" class="ghost small icon-button" type="button" title="Compact context" aria-label="Compact context">${compactIcon}</button>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button id="checkpoint-open" class="ghost small icon-button" type="button" title="Checkpoints" aria-label="Checkpoints">${checkpointIcon}</button>
                        <button id="history-open" class="ghost small icon-button" type="button" title="Conversation history" aria-label="Conversation history">${historyIcon}</button>
                        <button id="new-session-header" class="ghost small icon-button" type="button" title="New conversation" aria-label="New conversation">${newConversationIcon}</button>
                        <div id="new-session-menu" class="inline-popover new-session" role="menu" aria-label="Start new conversation"></div>
                    </div>
                </div>
            </header>
            <div id="feed" class="feed"></div>
            <div id="run-indicator" class="run-indicator" aria-label="Agent running" title="Agent running">
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
            <form id="composer" class="composer">
                <div class="composer-input">
                    <div id="context-badges" class="context-badges"></div>
                    <div id="pending-prompt" class="pending-prompt" aria-live="polite"></div>
                    <div id="runtime-finalizing" class="runtime-finalizing" aria-live="polite">Finalizing context before the next run...</div>
                    <div id="mention-menu" class="mention-menu"></div>
                    <textarea id="prompt" placeholder="Ask the n8n agent what to do with this workflow..." rows="2"></textarea>
                    <div class="composer-toolbar">
                        <div class="composer-provider">
                            <button id="select-model" class="secondary small" type="button" title="${safeProviderModelLabel}">${safeProviderModelLabel}</button>
                            <button id="select-reasoning" class="secondary small" type="button">Reasoning</button>
                            <button id="select-worktree" class="secondary small" type="button" title="Worktree">Workspace</button>
                            <div id="provider-menu" class="inline-popover" role="menu"></div>
                            <div id="reasoning-menu" class="inline-popover reasoning" role="menu"></div>
                            <div id="worktree-menu" class="inline-popover worktree" role="menu"></div>
                        </div>
                        <div class="composer-actions">
                            <button id="stop" class="ghost stop-button" type="button" title="Stop" aria-label="Stop" disabled>${stopIcon}</button>
                            <button id="send" class="send-button" type="submit" title="Send" aria-label="Send">${sendIcon}</button>
                        </div>
                    </div>
                </div>
            </form>
            <div id="worktree-warning" class="worktree-warning" aria-live="polite">Isolated worktree \u2014 n8n-as-code config changes and local workflow list from extension UI don't apply here.</div>
        </section>
        ${hasWorkflow ? `<section class="workflow" aria-label="n8n workflow">
            <div id="refresh-pill" class="refresh-pill">Refreshing n8n...</div>
            ${hasWorkflowUi ? `<iframe
                id="workflow-frame"
                src="${safeWorkflowUrl}"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads allow-top-navigation allow-top-navigation-by-user-activation"
                allow="${iframeAllowPolicy}">
            </iframe>` : `<div class="empty-workflow"><div><strong>Workflow UI unavailable</strong><br>Push this workflow to n8n to preview and interact with its UI here.</div></div>`}
        </section>` : ""}
        <div id="history-overlay" class="history-overlay" role="dialog" aria-modal="true" aria-label="Conversation history">
            <div class="history-modal">
                <div class="history-head">
                    <div>
                        <div class="history-title">Conversation History</div>
                        <div class="meta-text">Open a previous chat or start a new one.</div>
                    </div>
                    <button id="history-close" class="ghost small" type="button" aria-label="Close history">Close</button>
                </div>
                <div class="history-controls">
                    <select id="session-filter" aria-label="Filter conversations">
                        <option value="current">Current workflow</option>
                        <option value="all">All conversations</option>
                    </select>
                </div>
                <div id="session-list" class="sessions history-list"></div>
                <div class="history-foot">
                    <button id="new-session" class="secondary small" type="button">New chat</button>
                </div>
            </div>
        </div>
        <div id="checkpoint-overlay" class="checkpoint-overlay" role="dialog" aria-modal="true" aria-label="Checkpoints">
            <div class="checkpoint-modal">
                <div class="checkpoint-head">
                    <div>
                        <div class="checkpoint-title">Checkpoints</div>
                        <div class="meta-text">Save, restore, or delete checkpoints for this conversation.</div>
                    </div>
                    <button id="checkpoint-close" class="ghost small" type="button" aria-label="Close checkpoints">Close</button>
                </div>
                <div id="checkpoint-list" class="checkpoint-list sessions"></div>
                <div class="checkpoint-foot">
                    <button id="checkpoint-save" class="secondary small" type="button">Save checkpoint</button>
                </div>
            </div>
        </div>
    </main>
    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        let workflowId = ${workflowIdJs};
        let workflowName = ${workflowNameJs};
        let workflowFilename = ${workflowFilenameJs};
        let workflowFilePath = ${workflowFilePathJs};
        let workflowUrl = ${workflowUrlJs};
        let workflowReloadUrl = ${workflowReloadUrlJs};
        let openWorkflowContext = workflowId || workflowFilename || workflowFilePath
            ? { id: workflowId || undefined, name: workflowName, filename: workflowFilename || undefined, filePath: workflowFilePath || undefined }
            : null;
        let iframeOrigin = ${JSON.stringify(iframePermissionOrigin)};
        const PASTE_RATE_LIMIT_MS = 1000;
        const GRANT_TTL_MS = 5000;
        let lastPasteMs = 0;
        const pendingGrants = new Map();
        let isRunning = false;
        let currentWorkflowContext = null;
        let currentNodeContexts = [];
        let availableWorkflowCache = [];
        let activeFilter = 'current';
        let state = null;
        let providerModelCache = {};
        let providerMenuOpen = false;
        let providerMenuMode = 'models';
        let providerMenuProvider = '';
        let modelSearchQuery = '';
        let reasoningMenuOpen = false;
        let newSessionMenuOpen = false;
        let worktreeMenuOpen = false;
        let activeWorktreePath = null;
        let autoScrollFeed = true;
        let pendingPrompt = null;
        let runtimeFinalizing = false;
        let lastStateSequence = 0;
        const rewoundMessageIds = new Set();
        const expandedDetailKeys = new Set();

        const OP_ICONS = {
            'file-read': ${JSON.stringify(readOpIcon)},
            'file-write': ${JSON.stringify(writeOpIcon)},
            shell: ${JSON.stringify(shellOpIcon)},
            web: ${JSON.stringify(webOpIcon)},
            tool: ${JSON.stringify(toolOpIcon)},
            agent: ${JSON.stringify(agentOpIcon)},
            phase: ${JSON.stringify(phaseOpIcon)},
            thinking: ${JSON.stringify(thinkingOpIcon)},
            todo: ${JSON.stringify(todoOpIcon)}
        };

        const STATUS_ICONS = {
            running: ${JSON.stringify(statusRunningIcon)},
            done: ${JSON.stringify(statusDoneIcon)},
            error: ${JSON.stringify(statusErrorIcon)}
        };

        const feed = document.getElementById('feed');
        const form = document.getElementById('composer');
        const promptInput = document.getElementById('prompt');
        const pendingPromptEl = document.getElementById('pending-prompt');
        const runtimeFinalizingEl = document.getElementById('runtime-finalizing');
        const worktreeWarningEl = document.getElementById('worktree-warning');
        const sendButton = document.getElementById('send');
        const stopButton = document.getElementById('stop');
        const selectModelButton = document.getElementById('select-model');
        const selectReasoningButton = document.getElementById('select-reasoning');
        const providerMenu = document.getElementById('provider-menu');
        const reasoningMenu = document.getElementById('reasoning-menu');
        const selectWorktreeButton = document.getElementById('select-worktree');
        const worktreeMenu = document.getElementById('worktree-menu');
        const frame = document.getElementById('workflow-frame');
        const refreshPill = document.getElementById('refresh-pill');
        const contextBadges = document.getElementById('context-badges');
        const mentionMenu = document.getElementById('mention-menu');
        const conversationTitle = document.getElementById('conversation-title');
        const sessionList = document.getElementById('session-list');
        const sessionFilter = document.getElementById('session-filter');
        const contextPill = document.getElementById('context-pill');
        const contextLabel = document.getElementById('context-label');
        const contextMeterFill = document.getElementById('context-meter-fill');
        const newSessionButton = document.getElementById('new-session');
        const newSessionHeaderButton = document.getElementById('new-session-header');
        const newSessionMenu = document.getElementById('new-session-menu');
        const checkpointOpenButton = document.getElementById('checkpoint-open');
        const checkpointCloseButton = document.getElementById('checkpoint-close');
        const checkpointOverlay = document.getElementById('checkpoint-overlay');
        const checkpointList = document.getElementById('checkpoint-list');
        const checkpointSaveButton = document.getElementById('checkpoint-save');
        const historyOpenButton = document.getElementById('history-open');
        const historyCloseButton = document.getElementById('history-close');
        const historyOverlay = document.getElementById('history-overlay');
        const runIndicator = document.getElementById('run-indicator');
        const compactContextButton = document.getElementById('compact-context');

        function on(element, eventName, handler) {
            if (element) element.addEventListener(eventName, handler);
        }

        function isFeedNearBottom() {
            if (!feed) return true;
            return feed.scrollHeight - feed.scrollTop - feed.clientHeight <= 48;
        }

        function setRunning(running) {
            isRunning = running;
            sendButton.disabled = false;
            stopButton.disabled = !running;
            stopButton.classList.toggle('active', running);
            checkpointOpenButton.disabled = running;
            checkpointSaveButton.disabled = running;
            compactContextButton.disabled = running;
            if (runIndicator) runIndicator.classList.toggle('active', running);
            renderRuntimeFinalizing();
            renderCheckpoints();
            renderFeed();
        }

        function renderPendingPrompt() {
            if (!pendingPromptEl) return;
            if (!pendingPrompt) {
                pendingPromptEl.classList.remove('open');
                pendingPromptEl.innerHTML = '';
                return;
            }
            pendingPromptEl.classList.add('open');
            pendingPromptEl.innerHTML =
                '<div class="pending-prompt-main">' +
                    '<span class="pending-prompt-label">' + (pendingPrompt.mode === 'steering' ? 'Steering' : 'Pending') + '</span>' +
                    '<span class="pending-prompt-text" title="' + escapeHtml(pendingPrompt.text) + '">' + escapeHtml(pendingPrompt.text) + '</span>' +
                '</div>' +
                '<button id="pending-steer" class="secondary small" type="button"' + (pendingPrompt.mode === 'steering' ? ' disabled' : '') + '>Steer</button>';
            const steerButton = document.getElementById('pending-steer');
            on(steerButton, 'click', () => {
                if (!pendingPrompt || !state) return;
                pendingPrompt = { ...pendingPrompt, mode: 'steering' };
                renderPendingPrompt();
                vscode.postMessage({ type: 'agent.steer', text: pendingPrompt.text, workflowId, nodeContexts: currentNodeContexts, sessionId: state.activeSessionId });
            });
        }

        function renderRuntimeFinalizing() {
            if (!runtimeFinalizingEl) return;
            runtimeFinalizingEl.classList.toggle('open', Boolean(runtimeFinalizing));
        }

        function escapeText(value) {
            return value == null ? '' : String(value);
        }

        function escapeHtml(value) {
            return escapeText(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        function formatDate(value) {
            try { return new Date(value).toLocaleString(); } catch (e) { return String(value || ''); }
        }

        function sanitizeNodeContext(value) {
            if (!value || typeof value !== 'object') return null;
            const name = typeof value.name === 'string' ? value.name.trim() : '';
            if (!name) return null;
            return {
                name,
                type: typeof value.type === 'string' ? value.type.trim() : '',
                id: typeof value.id === 'string' ? value.id.trim() : '',
            };
        }

        function sameNode(a, b) {
            return a && b && a.name === b.name && (a.type || '') === (b.type || '') && (a.id || '') === (b.id || '');
        }

        function setNodeContexts(nodes, notify) {
            const next = [];
            for (const value of Array.isArray(nodes) ? nodes : (nodes ? [nodes] : [])) {
                const node = sanitizeNodeContext(value);
                if (!node || next.some((existing) => sameNode(existing, node))) continue;
                next.push(node);
            }
            currentNodeContexts = currentWorkflowContext ? next : [];
            renderContextBadges();
            if (notify && state) {
                vscode.postMessage({ type: 'agent.nodeDetailChanged', workflowId, nodeContexts: currentNodeContexts, sessionId: state.activeSessionId });
            }
        }

        function addNodeContext(node, notify) {
            if (!currentWorkflowContext) return;
            const normalized = sanitizeNodeContext(node);
            if (!normalized || currentNodeContexts.some((existing) => sameNode(existing, normalized))) return;
            setNodeContexts([...currentNodeContexts, normalized], notify);
        }

        function renderContextBadges() {
            if (!contextBadges) return;
            contextBadges.innerHTML = '';
            if (currentWorkflowContext) {
                contextBadges.appendChild(contextBadge('@workflow ' + currentWorkflowContext.name, 'workflow', 'Detach workflow context', () => {
                    currentWorkflowContext = null;
                    currentNodeContexts = [];
                    renderContextBadges();
                    if (state) vscode.postMessage({ type: 'agent.context.workflow.clear', sessionId: state.activeSessionId });
                }));
            }
            for (const node of currentNodeContexts) {
                contextBadges.appendChild(contextBadge('@node ' + node.name, 'node', 'Remove node context', () => {
                    setNodeContexts(currentNodeContexts.filter((candidate) => !sameNode(candidate, node)), true);
                }));
            }
        }

        function contextBadge(text, type, label, onClose) {
            const badge = document.createElement('span');
            badge.className = 'context-badge ' + type;
            const title = document.createElement('span');
            title.textContent = text;
            const close = document.createElement('button');
            close.type = 'button';
            close.setAttribute('aria-label', label);
            close.title = label;
            close.textContent = '\xD7';
            close.addEventListener('click', onClose);
            badge.append(title, close);
            return badge;
        }

        function isWorkflowFrameEvent(event) {
            if (!frame || event.source !== frame.contentWindow) return false;
            return event.origin === iframeOrigin || event.origin === 'null';
        }

        function reloadWorkflowFrame() {
            if (!frame || !refreshPill) return;
            refreshPill.style.display = 'block';
            const currentSrc = workflowReloadUrl || frame.src || workflowUrl;
            frame.onload = () => {
                refreshPill.style.display = 'none';
                frame.onload = null;
            };
            try {
                const reloadUrl = new URL(currentSrc);
                reloadUrl.searchParams.set('_n8nacRefresh', String(Date.now()));
                frame.src = reloadUrl.toString();
            } catch (e) {
                frame.src = currentSrc;
            }
        }

        function issuePasteGrant() {
            const token = crypto.randomUUID();
            pendingGrants.set(token, Date.now() + GRANT_TTL_MS);
            setTimeout(() => pendingGrants.delete(token), GRANT_TTL_MS);
            return token;
        }

        function consumeGrant(token) {
            const expiry = pendingGrants.get(token);
            if (!expiry || Date.now() > expiry) return false;
            pendingGrants.delete(token);
            return true;
        }

        function filteredSessions() {
            const sessions = (state && state.sessions) || [];
            if (activeFilter === 'all') return sessions;
            if (activeFilter === 'unattached') return sessions.filter((session) => !session.workflowId);
            return sessions.filter((session) => {
                const activeWorkflowKey = currentWorkflowContext && (currentWorkflowContext.id || currentWorkflowContext.filename || currentWorkflowContext.name);
                if (!activeWorkflowKey) return !session.workflowContext;
                const sessionWorkflow = session.workflowContext || {};
                return sessionWorkflow.id === activeWorkflowKey || sessionWorkflow.filename === activeWorkflowKey || sessionWorkflow.name === activeWorkflowKey;
            });
        }

        function getActiveSession() {
            return state && state.session ? state.session : null;
        }

        function renderSessions() {
            sessionList.innerHTML = '';
            const sessions = filteredSessions();
            if (!sessions.length) {
                const empty = document.createElement('div');
                empty.className = 'empty-note';
                empty.textContent = activeFilter === 'all'
                    ? 'No sessions yet.'
                    : activeFilter === 'unattached'
                        ? 'No new workflow chats.'
                        : 'No sessions for this workflow yet.';
                sessionList.appendChild(empty);
                return;
            }

            for (const session of sessions) {
                const item = document.createElement('div');
                item.className = 'session-item' + (session.isActive ? ' active' : '');
                const selectButton = document.createElement('button');
                selectButton.type = 'button';
                selectButton.className = 'session-select';
                selectButton.setAttribute('aria-label', 'Open conversation ' + session.title);
                const selectSession = () => {
                    closeHistory();
                    vscode.postMessage({ type: 'agent.session.select', sessionId: session.id });
                };
                selectButton.addEventListener('click', selectSession);

                const head = document.createElement('div');
                head.className = 'session-item-head';
                const title = document.createElement('div');
                title.className = 'session-item-title';
                title.textContent = session.title;

                const badges = document.createElement('div');
                badges.className = 'session-item-badges';
                if (session.isActive) badges.appendChild(badge('Active', 'active'));
                if (session.checkpointCount) badges.appendChild(badge(session.checkpointCount + ' cp', 'success'));
                const deleteButton = document.createElement('button');
                deleteButton.type = 'button';
                deleteButton.className = 'ghost session-delete';
                deleteButton.title = 'Delete conversation';
                deleteButton.setAttribute('aria-label', 'Delete conversation ' + session.title);
                deleteButton.innerHTML = ${JSON.stringify(trashIcon)};
                deleteButton.disabled = Boolean(session.isRunning);
                deleteButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (deleteButton.disabled) return;
                    vscode.postMessage({ type: 'agent.session.delete', sessionId: session.id });
                });
                badges.appendChild(deleteButton);
                head.appendChild(title);

                const foot = document.createElement('div');
                foot.className = 'session-item-foot';
                const attachment = document.createElement('span');
                attachment.textContent = session.workflowLabel;
                const updated = document.createElement('span');
                updated.textContent = formatDate(session.updatedAt);
                foot.append(attachment, updated);

                selectButton.append(head, foot);
                item.append(selectButton, badges);
                sessionList.appendChild(item);
            }
        }

        function badge(text, klass) {
            const el = document.createElement('span');
            el.className = 'badge' + (klass ? ' ' + klass : '');
            el.textContent = text;
            return el;
        }

        function openHistory() {
            renderSessions();
            historyOverlay.classList.add('open');
        }

        function closeHistory() {
            historyOverlay.classList.remove('open');
        }

        function renderCheckpoints() {
            if (!checkpointList) return;
            checkpointList.innerHTML = '';
            const session = getActiveSession();
            const checkpoints = session && Array.isArray(session.checkpoints) ? session.checkpoints : [];
            if (!checkpoints.length) {
                const empty = document.createElement('div');
                empty.className = 'empty-note';
                empty.textContent = 'No checkpoints for this conversation yet.';
                checkpointList.appendChild(empty);
                return;
            }
            for (const checkpoint of checkpoints) {
                const item = document.createElement('div');
                item.className = 'checkpoint-item';

                const head = document.createElement('div');
                head.className = 'checkpoint-item-head';
                const titleWrap = document.createElement('div');
                const title = document.createElement('div');
                title.className = 'checkpoint-item-title';
                title.textContent = checkpoint.label || checkpoint.summary || 'Checkpoint';
                const meta = document.createElement('div');
                meta.className = 'checkpoint-item-meta';
                const metaParts = [formatDate(checkpoint.createdAt), (checkpoint.messageCount || 0) + ' messages'];
                if (checkpoint.restoredAt) metaParts.push('Restored ' + formatDate(checkpoint.restoredAt));
                meta.textContent = metaParts.join(' \xB7 ');
                titleWrap.append(title, meta);
                head.appendChild(titleWrap);
                if (checkpoint.reason) head.appendChild(badge(checkpoint.reason, 'success'));

                const foot = document.createElement('div');
                foot.className = 'checkpoint-item-foot';
                const summary = document.createElement('div');
                summary.className = 'checkpoint-item-meta';
                summary.textContent = checkpoint.summary || '';
                const actions = document.createElement('div');
                actions.className = 'checkpoint-actions';
                const restore = document.createElement('button');
                restore.type = 'button';
                restore.className = 'secondary small';
                restore.textContent = 'Restore';
                restore.disabled = isRunning;
                restore.addEventListener('click', () => {
                    if (!state || !state.activeSessionId) return;
                    if (!window.confirm('Restore this checkpoint? The agent runtime and saved Workbench surface state will be restored.')) return;
                    closeCheckpointPanel();
                    vscode.postMessage({ type: 'agent.checkpoint.restore', sessionId: state.activeSessionId, checkpointId: checkpoint.id });
                });
                const del = document.createElement('button');
                del.type = 'button';
                del.className = 'ghost small';
                del.textContent = 'Delete';
                del.disabled = isRunning;
                del.addEventListener('click', () => {
                    if (!state || !state.activeSessionId) return;
                    if (!window.confirm('Delete this checkpoint? This cannot be undone.')) return;
                    vscode.postMessage({ type: 'agent.checkpoint.delete', sessionId: state.activeSessionId, checkpointId: checkpoint.id });
                });
                actions.append(restore, del);
                foot.append(summary, actions);
                item.append(head, foot);
                checkpointList.appendChild(item);
            }
        }

        function openCheckpointPanel() {
            closeHistory();
            renderCheckpoints();
            checkpointOverlay.classList.add('open');
        }

        function closeCheckpointPanel() {
            checkpointOverlay.classList.remove('open');
        }

        function closeInlineMenus() {
            providerMenuOpen = false;
            reasoningMenuOpen = false;
            newSessionMenuOpen = false;
            worktreeMenuOpen = false;
            if (providerMenu) providerMenu.classList.remove('open');
            if (reasoningMenu) reasoningMenu.classList.remove('open');
            if (newSessionMenu) newSessionMenu.classList.remove('open');
            if (worktreeMenu) worktreeMenu.classList.remove('open');
        }

        function renderWorktreeMenu() {
            if (!worktreeMenu || !state) return;
            worktreeMenu.innerHTML = '';

            const head = document.createElement('div');
            head.className = 'inline-popover-head';
            head.innerHTML = '<strong>Workspace</strong><span>Choose where the agent works</span>';
            worktreeMenu.appendChild(head);

            const list = document.createElement('div');
            list.className = 'inline-popover-list';

            const currentOption = inlineOption('Current workspace', 'Work in this VS Code workspace directly', state.activeWorktree ? '' : 'Active', '');
            currentOption.addEventListener('click', () => {
                closeInlineMenus();
                vscode.postMessage({ type: 'agent.worktree.clear' });
            });
            list.appendChild(currentOption);

            const divider = document.createElement('div');
            divider.className = 'inline-divider';
            list.appendChild(divider);

            const createOption = inlineOption('+ Create new worktree', 'Isolated branch for agent changes', '', '');
            createOption.addEventListener('click', () => {
                closeInlineMenus();
                vscode.postMessage({ type: 'agent.worktree.create' });
            });
            list.appendChild(createOption);

            const worktrees = Array.isArray(state.availableWorktrees) ? state.availableWorktrees : [];
            const activePath = state.activeWorktree ? state.activeWorktree.path : activeWorktreePath;
            for (const wt of worktrees) {
                const branchDisplay = wt.branch ? wt.branch.replace('refs/heads/', '') : (wt.detached ? '(detached)' : '');
                const isActive = activePath === wt.path;

                const wrapper = document.createElement('div');
                wrapper.style.display = 'contents';

                const option = document.createElement('button');
                option.type = 'button';
                option.className = 'inline-option worktree-item' + (isActive ? ' active' : '');
                const main = document.createElement('span');
                main.className = 'main';
                main.textContent = branchDisplay || wt.path.split('/').pop() || 'worktree';
                const sub = document.createElement('span');
                sub.className = 'branch-name';
                sub.textContent = wt.path;
                const mark = document.createElement('span');
                mark.className = 'mark';
                mark.textContent = isActive ? 'Active' : '';

                const removeBtn = document.createElement('span');
                removeBtn.className = 'ghost worktree-delete';
                removeBtn.title = 'Remove worktree';
                removeBtn.setAttribute('role', 'button');
                removeBtn.setAttribute('tabindex', '0');
                removeBtn.setAttribute('aria-label', 'Remove worktree ' + (branchDisplay || wt.path));
                removeBtn.innerHTML = ${JSON.stringify(trashIcon)};
                if (!isActive) {
                    removeBtn.addEventListener('click', (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        vscode.postMessage({ type: 'agent.worktree.remove', path: wt.path });
                    });
                } else {
                    removeBtn.style.opacity = '0.38';
                    removeBtn.style.pointerEvents = 'none';
                }
                option.append(main, sub, mark, removeBtn);
                option.addEventListener('click', () => {
                    closeInlineMenus();
                    vscode.postMessage({ type: 'agent.worktree.select', path: wt.path });
                });
                wrapper.appendChild(option);
                list.appendChild(wrapper);
            }

            worktreeMenu.appendChild(list);
            worktreeMenu.classList.toggle('open', worktreeMenuOpen);
        }

        function openWorktreeMenu() {
            closeHistory();
            closeCheckpointPanel();
            providerMenuOpen = false;
            reasoningMenuOpen = false;
            newSessionMenuOpen = false;
            worktreeMenuOpen = !worktreeMenuOpen;
            if (providerMenu) providerMenu.classList.remove('open');
            if (reasoningMenu) reasoningMenu.classList.remove('open');
            if (newSessionMenu) newSessionMenu.classList.remove('open');
            vscode.postMessage({ type: 'agent.worktree.list' });
            renderWorktreeMenu();
        }

        function workflowKey(workflow) {
            return workflow && (workflow.id || workflow.filename || workflow.name || '');
        }

        function renderNewSessionMenu() {
            if (!newSessionMenu || !state) return;
            newSessionMenu.innerHTML = '';

            const head = document.createElement('div');
            head.className = 'inline-popover-head';
            head.innerHTML = '<strong>New conversation</strong><span>Select context</span>';
            newSessionMenu.appendChild(head);

            const list = document.createElement('div');
            list.className = 'inline-popover-list';
            const menuWorkflowContext = currentWorkflowContext || openWorkflowContext;
            if (menuWorkflowContext) {
                const current = inlineOption('This workflow', menuWorkflowContext.name || 'Current workflow', 'Current', 'workflow');
                current.addEventListener('click', () => startNewSession(menuWorkflowContext));
                list.appendChild(current);
            }

            const blank = inlineOption('New workflow', 'Start without workflow context', '', 'workflow');
            blank.addEventListener('click', () => startNewSession(null));
            list.appendChild(blank);

            const workflows = Array.isArray(state.availableWorkflows) ? state.availableWorkflows : availableWorkflowCache;
            if (workflows.length) {
                const divider = document.createElement('div');
                divider.className = 'inline-divider';
                list.appendChild(divider);
            }
            const currentKey = workflowKey(menuWorkflowContext);
            for (const workflow of workflows) {
                const key = workflowKey(workflow);
                if (currentKey && key && key === currentKey) continue;
                const label = workflow.name || workflow.id || workflow.filename || 'Workflow';
                const detail = [workflow.filename, workflow.id].filter(Boolean).join(' \xB7 ') || 'Existing workflow';
                const option = inlineOption(label, detail, '', 'workflow');
                option.addEventListener('click', () => startNewSession(workflow));
                list.appendChild(option);
            }

            newSessionMenu.appendChild(list);
            newSessionMenu.classList.toggle('open', newSessionMenuOpen);
        }

        function openNewSessionMenu() {
            closeHistory();
            closeCheckpointPanel();
            providerMenuOpen = false;
            reasoningMenuOpen = false;
            newSessionMenuOpen = !newSessionMenuOpen;
            if (providerMenu) providerMenu.classList.remove('open');
            if (reasoningMenu) reasoningMenu.classList.remove('open');
            renderNewSessionMenu();
        }

        function connectedProviders() {
            const providers = Array.isArray(state && state.providerOptions) ? [...state.providerOptions] : [];
            if (state && state.provider && !providers.some((provider) => provider.id === state.provider)) {
                providers.unshift({
                    id: state.provider,
                    label: state.provider,
                    description: 'Current provider',
                    selected: true,
                    connected: true,
                    model: state.model,
                });
            }
            return providers.filter((provider) => provider.connected || provider.selected);
        }

        function renderProviderMenu() {
            if (!providerMenu || !state) return;
            const providers = connectedProviders();
            const selectedProvider = state.provider || '';
            const activeProvider = providerMenuProvider || selectedProvider;
            providerMenu.innerHTML = '';
            if (providerMenuMode === 'providers') {
                renderProviderPicker(providers, selectedProvider);
            } else {
                renderModelPicker(providers, activeProvider, selectedProvider);
            }
            providerMenu.classList.toggle('open', providerMenuOpen);
        }

        function renderProviderPicker(providers, selectedProvider) {
            const head = document.createElement('div');
            head.className = 'inline-popover-head';
            head.innerHTML = '<strong>Connected providers</strong><span>' + escapeHtml(providers.length ? providers.length + ' connected' : 'none connected') + '</span>';
            providerMenu.appendChild(head);
            const list = document.createElement('div');
            list.className = 'inline-popover-list';
            if (!providers.length) {
                const empty = document.createElement('div');
                empty.className = 'empty-note';
                empty.textContent = 'No connected providers.';
                list.appendChild(empty);
            }
            for (const provider of providers) {
                const providerButton = inlineOption(provider.label || provider.id, provider.description || '', provider.id === selectedProvider ? 'Selected' : '', 'provider');
                providerButton.addEventListener('click', () => {
                    providerMenuMode = 'models';
                    providerMenuProvider = provider.id;
                    modelSearchQuery = '';
                    renderProviderMenu();
                    vscode.postMessage({ type: 'agent.selectModel', provider: provider.id });
                });
                list.appendChild(providerButton);
            }
            providerMenu.appendChild(list);
            appendProviderMenuFooter();
        }

        function renderModelPicker(providers, activeProvider, selectedProvider) {
            const provider = providers.find((candidate) => candidate.id === activeProvider) || providers.find((candidate) => candidate.id === selectedProvider) || providers[0] || { id: selectedProvider, label: selectedProvider || 'Provider' };
            if (!providerMenuProvider && provider.id) providerMenuProvider = provider.id;
            const back = document.createElement('button');
            back.type = 'button';
            back.className = 'inline-back';
            back.textContent = '\u2190 Providers';
            back.addEventListener('click', () => {
                providerMenuMode = 'providers';
                modelSearchQuery = '';
                renderProviderMenu();
            });
            providerMenu.appendChild(back);

            const head = document.createElement('div');
            head.className = 'inline-popover-head';
            head.innerHTML = '<strong>' + escapeHtml(provider.label || provider.id || 'Provider') + '</strong><span>Models</span>';
            providerMenu.appendChild(head);

            const searchWrap = document.createElement('div');
            searchWrap.className = 'inline-search-wrap';
            const search = document.createElement('input');
            search.className = 'inline-search';
            search.type = 'text';
            search.placeholder = 'Search models...';
            search.value = modelSearchQuery;
            search.addEventListener('input', () => {
                modelSearchQuery = search.value || '';
                renderProviderMenu();
                const nextSearch = providerMenu.querySelector('.inline-search');
                if (nextSearch) {
                    nextSearch.focus();
                    nextSearch.selectionStart = nextSearch.selectionEnd = nextSearch.value.length;
                }
            });
            searchWrap.appendChild(search);
            providerMenu.appendChild(searchWrap);

            const list = document.createElement('div');
            list.className = 'inline-popover-list';
            const allModels = providerModelCache[provider.id] || (provider.id === selectedProvider ? state.modelOptions || [] : []);
            const query = modelSearchQuery.trim().toLowerCase();
            const models = allModels.filter((model) => !query || String(model.label || model.id || '').toLowerCase().includes(query));
            if (!allModels.length) {
                const loading = document.createElement('div');
                loading.className = 'empty-note';
                loading.textContent = 'Loading models...';
                list.appendChild(loading);
                if (provider.id) vscode.postMessage({ type: 'agent.selectModel', provider: provider.id });
            } else if (!models.length) {
                const empty = document.createElement('div');
                empty.className = 'empty-note';
                empty.textContent = 'No models match this search.';
                list.appendChild(empty);
            }
            for (const model of models) {
                const modelButton = inlineOption(model.label || model.id, model.fallback ? 'Known/default model' : provider.label || provider.id, model.selected ? 'Active' : '', 'model');
                modelButton.addEventListener('click', () => {
                    closeInlineMenus();
                    vscode.postMessage({ type: 'agent.providerModel.select', provider: provider.id, model: model.id || model.label });
                });
                list.appendChild(modelButton);
            }
            providerMenu.appendChild(list);
            appendProviderMenuFooter();
        }

        function appendProviderMenuFooter() {
            const foot = document.createElement('div');
            foot.className = 'inline-popover-foot';
            const add = document.createElement('button');
            add.type = 'button';
            add.className = 'inline-link';
            add.textContent = 'Add more providers...';
            add.addEventListener('click', () => {
                closeInlineMenus();
                vscode.postMessage({ type: 'agent.providers.configure' });
            });
            foot.appendChild(add);
            providerMenu.appendChild(foot);
        }

        function renderReasoningMenu() {
            if (!reasoningMenu || !state) return;
            reasoningMenu.innerHTML = '';
            const head = document.createElement('div');
            head.className = 'inline-popover-head';
            head.textContent = 'Reasoning effort';
            reasoningMenu.appendChild(head);
            const list = document.createElement('div');
            list.className = 'inline-popover-list';
            const options = Array.isArray(state.reasoningOptions) ? state.reasoningOptions : [];
            for (const option of options) {
                const button = inlineOption(option.label || option.id, '', option.selected ? 'Active' : '', '');
                button.addEventListener('click', () => {
                    closeInlineMenus();
                    vscode.postMessage({ type: 'agent.selectReasoningEffort', effort: option.id || option.label });
                });
                list.appendChild(button);
            }
            reasoningMenu.appendChild(list);
            reasoningMenu.classList.toggle('open', reasoningMenuOpen && state.supportsReasoningEffort);
        }

        function inlineOption(label, sub, mark, klass) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'inline-option' + (klass ? ' ' + klass : '') + (mark ? ' active' : '');
            const main = document.createElement('span');
            main.className = 'main';
            main.textContent = label || '';
            const marker = document.createElement('span');
            marker.className = 'mark';
            marker.textContent = mark || '';
            button.append(main, marker);
            if (sub) {
                const detail = document.createElement('span');
                detail.className = 'sub';
                detail.textContent = sub;
                button.appendChild(detail);
            }
            return button;
        }

        function renderChatMeta() {
            if (!state) return;
            if (conversationTitle) {
                const title = state.session && state.session.title ? state.session.title : '';
                conversationTitle.textContent = title;
                conversationTitle.title = title;
            }
            const providerLabel = (state.provider || 'provider') + (state.model ? ' / ' + state.model : '');
            selectModelButton.textContent = providerLabel;
            selectModelButton.title = providerLabel;
            if (state.provider && Array.isArray(state.modelOptions)) providerModelCache[state.provider] = state.modelOptions;
            selectReasoningButton.textContent = state.reasoningEffort ? 'Reasoning ' + state.reasoningEffort : 'Reasoning';
            selectReasoningButton.style.display = state.supportsReasoningEffort ? 'inline-block' : 'none';
            if (selectWorktreeButton) {
                activeWorktreePath = state.activeWorktree ? state.activeWorktree.path : null;
                const wtLabel = state.activeWorktree
                    ? (state.activeWorktree.branch ? state.activeWorktree.branch.replace('refs/heads/', '') : 'Worktree')
                    : 'Workspace';
                selectWorktreeButton.textContent = wtLabel;
                selectWorktreeButton.title = state.activeWorktree ? state.activeWorktree.path : 'Current workspace';
                selectWorktreeButton.classList.toggle('worktree-active', Boolean(state.activeWorktree));
            }
            if (worktreeWarningEl) {
                worktreeWarningEl.classList.toggle('active', Boolean(state.activeWorktree));
            }
            renderProviderMenu();
            renderReasoningMenu();
            renderWorktreeMenu();
            renderNewSessionMenu();
            const usage = state.session && state.session.contextUsage;
            if (!usage || usage.source !== 'api') {
                contextPill.classList.remove('active');
                contextLabel.textContent = 'Context';
                contextMeterFill.style.width = '0%';
                contextPill.title = 'Context usage unavailable';
                return;
            }
            const percent = Math.max(0, Math.min(100, Number(usage.fillPercent) || 0));
            contextPill.classList.add('active');
            contextLabel.textContent = percent + '% context';
            contextPill.title = percent + '% of ' + usage.contextWindowTokens + ' tokens \xB7 prompt ' + usage.promptTokens + ' \xB7 completion ' + usage.completionTokens + ' \xB7 ' + usage.source;
            contextMeterFill.style.width = percent + '%';
        }

        function renderFeed() {
            const shouldStickToBottom = autoScrollFeed || isFeedNearBottom();
            const previousScrollTop = feed.scrollTop;
            feed.innerHTML = '';
            const visibleEntries = state && state.session && Array.isArray(state.session.entries)
                ? state.session.entries.filter((entry) => entry.kind !== 'context-usage' && entry.kind !== 'workflow-context' && entry.kind !== 'node-context')
                : [];
            if (!visibleEntries.length) {
                return;
            }
            for (let idx = 0; idx < visibleEntries.length; idx += 1) {
                feed.appendChild(renderEntry(visibleEntries[idx], idx));
            }
            if (shouldStickToBottom) {
                feed.scrollTop = feed.scrollHeight;
                autoScrollFeed = true;
            } else {
                feed.scrollTop = previousScrollTop;
            }
        }

        function renderEntry(entry, index) {
            if (entry.kind === 'user-message') {
                return userMessageEntry(entry);
            }
            if (entry.kind === 'system-notice') {
                return textEntry('system', entry.text);
            }
            if (entry.kind === 'assistant-body') {
                return assistantMessageEntry(entry);
            }
            if (entry.kind === 'context-usage') return document.createComment('context usage');
            if (entry.kind === 'workflow-context' || entry.kind === 'node-context') return document.createComment('context marker');
            if (entry.kind === 'compaction') {
                const el = document.createElement('div');
                el.className = 'entry compaction';
                const isFallback = entry.event.source === 'fallback';
                const title = isFallback ? 'Context compacted with fallback' : 'Context compacted';
                const detailText =
                    'Source: ' + escapeText(entry.event.source) + '\\n' +
                    'Messages compacted: ' + escapeText(entry.event.messagesCompacted) + '\\n' +
                    'Preserved recent messages: ' + escapeText(entry.event.preservedRecentMessages) +
                    (entry.event.estimatedTokens ? '\\nEstimated tokens: ' + escapeText(entry.event.estimatedTokens) : '') +
                    (entry.event.thresholdTokens ? '\\nThreshold tokens: ' + escapeText(entry.event.thresholdTokens) : '') +
                    (entry.event.fallbackReason ? '\\nFallback reason: ' + escapeText(entry.event.fallbackReason) : '');
                const details = createPersistentDetails(getEntryDetailKey(entry, index), 'Show compaction details', detailText);
                el.innerHTML = '<div class="entry-head"><div class="entry-title">' + escapeHtml(title) + '</div><div class="entry-subtle">' + escapeHtml(new Date(entry.timestamp).toLocaleTimeString()) + '</div></div><div>' + escapeHtml(entry.event.summary) + '</div>';
                el.appendChild(details);
                return el;
            }
            if (entry.kind === 'operation') {
                const el = document.createElement('div');
                el.className = 'entry operation';
                const icon = OP_ICONS[entry.category || 'tool'] || OP_ICONS.tool;
                const statusClass = entry.status ? ' ' + entry.status : '';
                const statusLabel = entry.status || entry.tone || '';
                const statusIcon = STATUS_ICONS[entry.status] || '';
                const title = entry.title || 'Operation';
                const compactHtml = formatOperationCompactHtml(entry);
                el.innerHTML = '<div class="entry-head">' +
                    '<div class="entry-title">' +
                    '<span class="entry-kind-icon" aria-hidden="true">' + icon + '</span>' +
                    '<span>' + escapeHtml(title) + '</span></div>' +
                    '<div class="entry-status' + escapeHtml(statusClass) + '" title="' + escapeHtml(statusLabel) + '" aria-label="' + escapeHtml(statusLabel) + '">' + statusIcon + '<span class="sr-only">' + escapeHtml(statusLabel) + '</span></div>' +
                    '</div>' +
                    compactHtml;
                if (entry.body || entry.summary) {
                    el.appendChild(createPersistentDetails(getEntryDetailKey(entry, index), 'Show details', formatOperationDetailsBody(entry)));
                }
                return el;
            }
            return textEntry('system', 'Unsupported entry');
        }

        function getEntryDetailKey(entry, index) {
            return (entry && entry.id ? entry.id : (entry.kind || 'entry') + ':' + index) + ':details';
        }

        function createPersistentDetails(key, label, body) {
            const details = document.createElement('details');
            details.className = 'details';
            details.open = expandedDetailKeys.has(key);
            details.addEventListener('toggle', () => {
                if (details.open) expandedDetailKeys.add(key);
                else expandedDetailKeys.delete(key);
            });
            const summary = document.createElement('summary');
            summary.textContent = label;
            const content = document.createElement('div');
            content.className = 'details-body';
            content.textContent = escapeText(body);
            details.append(summary, content);
            return details;
        }

        function formatOperationCompactHtml(entry) {
            if (entry.category === 'todo') return formatTodoCompactHtml(entry);
            const command = getOperationCommand(entry);
            const filePath = getOperationFilePath(entry);
            const result = formatOperationResultPreview(entry, command);
            const fileLabel = isPlanFileOperation(entry, filePath) ? 'Plan' : 'File';
            if (!command && !filePath && !result) return '';
            return '<div class="operation-compact">' +
                (command ? operationRowHtml('Command', command, true) : '') +
                (filePath ? operationRowHtml(fileLabel, filePath, true) : '') +
                (result ? operationRowHtml(entry.category === 'file-read' ? 'Preview' : 'Output', result, false) : '') +
                '</div>';
        }

        function operationRowHtml(label, value, code) {
            return '<div class="operation-row"><span class="operation-label">' + escapeHtml(label) + '</span><' + (code ? 'code' : 'span') + ' class="operation-value' + (code ? ' operation-code' : '') + '">' + escapeHtml(value) + '</' + (code ? 'code' : 'span') + '></div>';
        }

        function getOperationCommand(entry) {
            if (entry.category !== 'shell') return '';
            for (const value of [entry.summary, entry.detail, entry.body]) {
                const text = String(value || '').trim();
                if (text.startsWith('$ ')) return text.slice(2).trim();
            }
            return '';
        }

        function getOperationFilePath(entry) {
            if (entry.category !== 'file-read' && entry.category !== 'file-write') return '';
            for (const value of [entry.summary, entry.detail, entry.body, entry.title]) {
                const parsed = extractFilePathFromValue(value);
                if (parsed) return parsed;
            }
            return '';
        }

        function extractFilePathFromValue(value) {
            const seen = new Set();
            function visit(candidate) {
                if (candidate == null) return '';
                if (typeof candidate === 'string') {
                    const trimmed = candidate.trim();
                    if (!trimmed) return '';
                    if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && !seen.has(trimmed)) {
                        seen.add(trimmed);
                        try { return visit(JSON.parse(trimmed)); } catch (e) { /* fall through */ }
                    }
                    const quoted = trimmed.match(/['"]([^'"]+\\/[^'"]+)['"]/);
                    if (quoted) return quoted[1];
                    const afterVerb = trimmed.match(/^(?:Read|Write|Edit)\\s+(.+)$/i);
                    if (afterVerb && afterVerb[1].includes('/')) return afterVerb[1].trim();
                    if (trimmed.startsWith('/') && !trimmed.includes('\\n')) return trimmed;
                    return '';
                }
                if (Array.isArray(candidate)) {
                    for (const item of candidate) {
                        const filePath = visit(item);
                        if (filePath) return filePath;
                    }
                    return '';
                }
                if (typeof candidate === 'object') {
                    for (const key of ['file_path', 'filePath', 'path']) {
                        if (typeof candidate[key] === 'string' && candidate[key].trim()) return candidate[key].trim();
                    }
                    for (const key of ['input', 'args', 'kwargs', 'update']) {
                        const filePath = visit(candidate[key]);
                        if (filePath) return filePath;
                    }
                }
                return '';
            }
            return visit(value);
        }

        function isPlanFileOperation(entry, filePath) {
            if (!filePath || !/\\.md$/i.test(filePath)) return false;
            return /plan|planning|spec|proposal|implementation/i.test(filePath + ' ' + (entry.title || '') + ' ' + (entry.summary || ''));
        }

        function formatOperationResultPreview(entry, command) {
            const raw = entry.category === 'shell'
                ? (entry.body && String(entry.body).trim() !== ('$ ' + command) ? entry.body : '')
                : (entry.detail || entry.summary || '');
            const extracted = extractReadableToolText(raw);
            if (extracted) return truncateCompactText(extracted);
            if (looksLikeStructuredPayload(raw)) return '';
            return truncateCompactText(raw);
        }

        function formatOperationDetailsBody(entry) {
            if (entry.category === 'todo') {
                const todoText = formatTodosText(extractTodosFromValue(entry.body || entry.summary || entry.detail));
                if (todoText) return todoText;
            }
            const raw = entry.body || entry.summary || '';
            const extracted = extractReadableToolText(raw);
            return extracted || raw;
        }

        function formatTodoCompactHtml(entry) {
            const todos = extractTodosFromValue(entry.body || entry.summary || entry.detail);
            if (!todos.length) {
                const result = formatOperationResultPreview(entry, '');
                return result ? '<div class="operation-compact">' + operationRowHtml('Todos', result, false) + '</div>' : '';
            }
            const counts = todos.reduce((acc, todo) => {
                const status = String(todo.status || 'pending');
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});
            const active = todos.find((todo) => todo.status === 'in_progress') || todos.find((todo) => todo.status === 'pending') || todos[0];
            const summary = [
                todos.length + ' item' + (todos.length === 1 ? '' : 's'),
                counts.in_progress ? counts.in_progress + ' in progress' : '',
                counts.pending ? counts.pending + ' pending' : '',
                counts.completed ? counts.completed + ' completed' : '',
            ].filter(Boolean).join(' \xB7 ');
            return '<div class="operation-compact">' +
                operationRowHtml('Todos', summary, false) +
                (active && active.content ? operationRowHtml(active.status === 'in_progress' ? 'Current' : 'Next', String(active.content), false) : '') +
                formatTodoChecklistHtml(todos) +
                '</div>';
        }

        function formatTodoChecklistHtml(todos) {
            if (!todos.length) return '';
            return '<div class="todo-checklist">' + todos.map((todo) => {
                const status = String(todo.status || 'pending');
                const normalized = status.replace(/_/g, '-');
                const checked = status === 'completed';
                const marker = checked ? '\u2713' : status === 'in_progress' ? '\xB7' : '';
                return '<div class="todo-item ' + escapeHtml(normalized) + '">' +
                    '<span class="todo-box" aria-hidden="true">' + escapeHtml(marker) + '</span>' +
                    '<span class="todo-text">' + escapeHtml(String(todo.content || '')) + '</span>' +
                    '</div>';
            }).join('') + '</div>';
        }

        function extractTodosFromValue(value) {
            const seen = new Set();
            function visit(candidate) {
                if (candidate == null) return [];
                if (typeof candidate === 'string') {
                    const trimmed = candidate.trim();
                    if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('[')) || seen.has(trimmed)) return [];
                    seen.add(trimmed);
                    try { return visit(JSON.parse(trimmed)); } catch (e) { return []; }
                }
                if (Array.isArray(candidate)) {
                    if (candidate.every((item) => item && typeof item === 'object' && 'content' in item)) return candidate;
                    return candidate.flatMap(visit);
                }
                if (typeof candidate === 'object') {
                    if (Array.isArray(candidate.todos)) return visit(candidate.todos);
                    for (const key of ['update', 'input', 'args', 'kwargs']) {
                        const todos = visit(candidate[key]);
                        if (todos.length) return todos;
                    }
                }
                return [];
            }
            return visit(value);
        }

        function formatTodosText(todos) {
            if (!todos.length) return '';
            return todos.map((todo) => '[' + String(todo.status || 'pending').replace(/_/g, ' ') + '] ' + String(todo.content || '')).join('\\n');
        }

        function truncateCompactText(value) {
            const normalized = String(value || '').replace(/\\s+/g, ' ').trim();
            if (!normalized) return '';
            return normalized.length > 220 ? normalized.slice(0, 220) + '...' : normalized;
        }

        function looksLikeStructuredPayload(value) {
            const text = String(value || '').trim();
            return text.startsWith('{') || text.startsWith('[') || text.includes('"lc":') || text.includes('"kwargs":') || text.includes('ToolMessage');
        }

        function extractReadableToolText(value) {
            const seen = new Set();
            function visit(candidate) {
                if (candidate == null) return '';
                if (typeof candidate === 'string') {
                    const trimmed = candidate.trim();
                    if (!trimmed) return '';
                    if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && !seen.has(trimmed)) {
                        seen.add(trimmed);
                        try {
                            return visit(JSON.parse(trimmed));
                        } catch (e) {
                            return looksLikeStructuredPayload(trimmed) ? '' : trimmed;
                        }
                    }
                    return looksLikeStructuredPayload(trimmed) ? '' : trimmed;
                }
                if (Array.isArray(candidate)) {
                    return candidate.map(visit).filter(Boolean).join('\\n');
                }
                if (typeof candidate === 'object') {
                    if (candidate.kwargs && typeof candidate.kwargs.content === 'string') return visit(candidate.kwargs.content);
                    if (typeof candidate.text === 'string') return visit(candidate.text);
                    if (typeof candidate.content === 'string') return visit(candidate.content);
                    if (Array.isArray(candidate.content)) return visit(candidate.content);
                    if (candidate.kwargs) return visit(candidate.kwargs);
                    if (candidate.update) return visit(candidate.update);
                    if (candidate.output) return visit(candidate.output);
                }
                return '';
            }
            return visit(value);
        }

        function textEntry(kind, text) {
            const el = document.createElement('div');
            el.className = 'entry ' + kind;
            el.textContent = text || '';
            return el;
        }

        function userMessageEntry(entry) {
            const wrap = document.createElement('div');
            wrap.className = 'message-group user-message';
            const el = document.createElement('div');
            el.className = 'entry user';
            const body = document.createElement('div');
            body.className = 'entry-body';
            body.textContent = entry.text || '';
            el.appendChild(body);
            wrap.appendChild(el);

            const checkpointId = entry.checkpoint && entry.checkpoint.workbenchCheckpointId;
            if (checkpointId) {
                const actions = document.createElement('div');
                actions.className = 'message-actions';
                const rewind = document.createElement('button');
                rewind.type = 'button';
                rewind.className = 'message-action message-rewind';
                rewind.title = 'Rewind to before this message';
                rewind.setAttribute('aria-label', 'Rewind to before this message');
                rewind.disabled = isRunning;
                rewind.innerHTML = '${rewindIcon}';
                rewind.addEventListener('click', () => {
                    if (!state || !state.activeSessionId || isRunning) return;
                    rewindMessageOptimistically(entry);
                    vscode.postMessage({
                        type: 'agent.message.rewind',
                        sessionId: state.activeSessionId,
                        messageId: entry.id,
                    });
                });
                const copy = document.createElement('button');
                copy.type = 'button';
                copy.className = 'message-action';
                copy.title = 'Copy message';
                copy.setAttribute('aria-label', 'Copy message');
                copy.innerHTML = '${copyIcon}';
                copy.addEventListener('click', () => {
                    vscode.postMessage({ type: 'clipboard-write', text: entry.text || '' });
                });
                actions.append(rewind, copy);
                wrap.appendChild(actions);
            }
            return wrap;
        }

        function assistantMessageEntry(entry) {
            const wrap = document.createElement('div');
            wrap.className = 'message-group assistant-message';
            const el = textEntry('assistant' + (entry.streaming ? ' streaming' : ''), entry.text || '');
            wrap.appendChild(el);
            if (!entry.streaming && entry.text) {
                const actions = document.createElement('div');
                actions.className = 'message-actions';
                const copy = document.createElement('button');
                copy.type = 'button';
                copy.className = 'message-action';
                copy.title = 'Copy response';
                copy.setAttribute('aria-label', 'Copy response');
                copy.innerHTML = '${copyIcon}';
                copy.addEventListener('click', () => {
                    vscode.postMessage({ type: 'clipboard-write', text: entry.text || '' });
                });
                actions.append(copy);
                wrap.appendChild(actions);
            }
            return wrap;
        }

        function rewindMessageOptimistically(entry) {
            if (!state || !state.session || !Array.isArray(state.session.entries)) return;
            const entries = state.session.entries;
            const idx = entries.findIndex((candidate) => candidate && candidate.kind === 'user-message' && candidate.id === entry.id);
            if (idx < 0) return;
            rewoundMessageIds.add(entry.id);
            state.session.entries = entries.slice(0, idx);
            state.session.contextUsage = undefined;
            pendingPrompt = null;
            renderPendingPrompt();
            promptInput.value = entry.text || '';
            renderAll();
            promptInput.focus();
            promptInput.selectionStart = promptInput.selectionEnd = promptInput.value.length;
        }

        function renderAll() {
            if (state && Array.isArray(state.availableWorkflows)) {
                availableWorkflowCache = state.availableWorkflows;
            }
            currentWorkflowContext = state && state.session ? state.session.workflowContext || null : null;
            setNodeContexts(state && state.session ? state.session.nodeContexts || [] : [], false);
            renderSessions();
            renderChatMeta();
            renderFeed();
            renderMentionMenu();
            if (checkpointOverlay && checkpointOverlay.classList.contains('open')) renderCheckpoints();
        }

        function incomingStateContainsRewoundMessage(nextState) {
            if (!nextState || !nextState.session || !Array.isArray(nextState.session.entries) || !rewoundMessageIds.size) return false;
            return nextState.session.entries.some((entry) => entry && entry.kind === 'user-message' && rewoundMessageIds.has(entry.id));
        }

        function incomingStateDropsLiveEntries(nextState) {
            if (!state || !state.session || !nextState || !nextState.session) return false;
            if (state.activeSessionId !== nextState.activeSessionId) return false;
            const currentEntries = Array.isArray(state.session.entries) ? state.session.entries : [];
            const nextEntries = Array.isArray(nextState.session.entries) ? nextState.session.entries : [];
            if (nextEntries.length >= currentEntries.length) return false;
            const hasLiveEntry = currentEntries.some((entry) =>
                entry && ((entry.kind === 'assistant-body' && entry.streaming) || (entry.kind === 'operation' && entry.status === 'running'))
            );
            return hasLiveEntry && (isRunning || runtimeFinalizing);
        }

        function acceptIncomingStateMessage(message) {
            const sequence = Number(message.stateSequence || 0);
            if (sequence && sequence < lastStateSequence) return false;
            if (incomingStateContainsRewoundMessage(message.state)) return false;
            if (incomingStateDropsLiveEntries(message.state)) return false;
            if (sequence) lastStateSequence = sequence;
            return true;
        }

        function getMentionQuery() {
            if (!promptInput) return null;
            const cursor = promptInput.selectionStart || 0;
            const before = promptInput.value.slice(0, cursor);
            const lower = before.toLowerCase();
            const workflowIndex = lower.lastIndexOf('@workflow');
            const nodeIndex = lower.lastIndexOf('@node');
            const start = Math.max(workflowIndex, nodeIndex);
            if (start < 0) return null;
            if (start > 0 && !' 	'.includes(before[start - 1])) return null;
            const kind = start === workflowIndex ? 'workflow' : 'node';
            const tokenLength = kind === 'workflow' ? '@workflow'.length : '@node'.length;
            const queryText = before.slice(start + tokenLength);
            if (queryText.includes(String.fromCharCode(10))) return null;
            return {
                kind,
                query: queryText.trim().toLowerCase(),
                start,
                end: cursor,
            };
        }

        function renderMentionMenu() {
            if (!mentionMenu) return;
            const mention = getMentionQuery();
            if (!mention || !state) {
                mentionMenu.classList.remove('open');
                mentionMenu.innerHTML = '';
                return;
            }
            if (mention.kind === 'node' && !currentWorkflowContext) {
                mentionMenu.classList.remove('open');
                mentionMenu.innerHTML = '';
                return;
            }
            const source = mention.kind === 'workflow' ? state.availableWorkflows || [] : state.availableNodes || [];
            const options = source.filter((item) => {
                const label = String(item.name || item.id || item.filename || '').toLowerCase();
                return !mention.query || label.includes(mention.query);
            }).slice(0, 12);
            mentionMenu.innerHTML = '';
            if (!options.length) {
                mentionMenu.classList.remove('open');
                return;
            }
            for (const option of options) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'mention-option';
                const label = document.createElement('span');
                label.textContent = option.name || option.id || option.filename || 'Workflow';
                const detail = document.createElement('small');
                detail.textContent = mention.kind === 'workflow'
                    ? [option.filename, option.id].filter(Boolean).join(' \xB7 ') || 'Workflow'
                    : [option.type, option.id].filter(Boolean).join(' \xB7 ') || 'Node';
                button.append(label, detail);
                button.addEventListener('click', () => applyMentionSelection(mention, option));
                mentionMenu.appendChild(button);
            }
            mentionMenu.classList.add('open');
        }

        function applyMentionSelection(mention, option) {
            const before = promptInput.value.slice(0, mention.start);
            const after = promptInput.value.slice(mention.end);
            promptInput.value = (before + after).replace(/ {2,}/g, ' ');
            promptInput.focus();
            promptInput.selectionStart = promptInput.selectionEnd = before.length;
            mentionMenu.classList.remove('open');
            if (mention.kind === 'workflow') {
                currentWorkflowContext = option;
                currentNodeContexts = [];
                renderContextBadges();
                if (state) vscode.postMessage({ type: 'agent.context.workflow.set', sessionId: state.activeSessionId, workflow: option });
                return;
            }
            addNodeContext(option, true);
        }

        function normalizeOperationKind(category, title) {
            const value = String(category || title || '').toLowerCase().replace(/_/g, '-');
            if (value === 'read-file' || value === 'file-read' || value === 'read') return 'file-read';
            if (value === 'write-file' || value === 'file-write' || value === 'write') return 'file-write';
            if (value.includes('shell')) return 'shell';
            if (value.includes('web')) return 'web';
            return value;
        }

        function findMatchingPendingOperationIndex(entries, operationId, title, category) {
            const exactIndex = entries.findIndex((entry) => entry.kind === 'operation' && entry.id === operationId);
            if (exactIndex >= 0) return exactIndex;
            const targetKind = normalizeOperationKind(category, title);
            for (let idx = entries.length - 1; idx >= 0; idx -= 1) {
                const entry = entries[idx];
                if (!entry || entry.kind !== 'operation') continue;
                if (entry.status !== 'running') continue;
                const entryKind = normalizeOperationKind(entry.category, entry.title);
                if (entryKind && targetKind && entryKind === targetKind) return idx;
                if ((entry.title || '') !== (title || '')) continue;
                const entryCategory = String(entry.category || '').toLowerCase();
                const targetCategory = String(category || '').toLowerCase();
                if (entryCategory && targetCategory && entryCategory !== targetCategory && entryCategory !== 'phase') continue;
                return idx;
            }
            return -1;
        }

        function finalizePendingOperations(entries, status) {
            return entries.map((entry) => {
                if (!entry || entry.kind !== 'operation' || entry.status !== 'running') return entry;
                return {
                    ...entry,
                    tone: status === 'error' ? 'error' : 'success',
                    status: status === 'error' ? 'error' : 'done',
                    endedAt: entry.endedAt || Date.now(),
                };
            });
        }

        function stopRunOptimistically() {
            if (!state || !state.session || !Array.isArray(state.session.entries)) return;
            let entries = finalizePendingOperations([...state.session.entries], 'done');
            const last = entries[entries.length - 1];
            if (!last || last.kind !== 'system-notice' || last.text !== 'Run stopped.') {
                entries.push({ kind: 'system-notice', id: crypto.randomUUID(), text: 'Run stopped.', timestamp: Date.now() });
            }
            state.session.entries = entries;
            pendingPrompt = null;
            renderPendingPrompt();
            setRunning(false);
            renderAll();
        }

        function stripEnvironmentDetails(text) {
            let value = String(text || '');
            const openTag = '<environment_details>';
            const closeTag = '</environment_details>';
            for (;;) {
                const start = value.toLowerCase().indexOf(openTag);
                if (start < 0) break;
                const end = value.toLowerCase().indexOf(closeTag, start + openTag.length);
                if (end < 0) {
                    value = value.slice(0, start);
                    break;
                }
                value = value.slice(0, start) + value.slice(end + closeTag.length);
            }
            return value.trim();
        }

        function lastUserMessageIndex(entries) {
            for (let idx = entries.length - 1; idx >= 0; idx -= 1) {
                if (entries[idx] && entries[idx].kind === 'user-message') return idx;
            }
            return -1;
        }

        function consolidateFinalAssistant(entries, response, finalState) {
            const userIdx = lastUserMessageIndex(entries);
            const finalText = stripEnvironmentDetails(response);
            let chosenText = finalText;
            const assistantTexts = [];
            let firstAssistantIdx = -1;
            for (let idx = userIdx + 1; idx < entries.length; idx += 1) {
                const entry = entries[idx];
                if (entry && entry.kind === 'assistant-body' && stripEnvironmentDetails(entry.text)) {
                    if (firstAssistantIdx < 0) firstAssistantIdx = idx;
                    assistantTexts.push(stripEnvironmentDetails(entry.text));
                }
            }
            for (const text of assistantTexts) {
                if (finalText.includes(text) && text.length >= Math.max(80, finalText.length * 0.6)) {
                    chosenText = text;
                }
            }
            const result = [];
            let inserted = false;
            for (let idx = 0; idx < entries.length; idx += 1) {
                const entry = entries[idx];
                if (idx > userIdx && entry.kind === 'assistant-body') {
                    if (!inserted && chosenText && idx === firstAssistantIdx) {
                        result.push({ kind: 'assistant-body', id: entry.id || crypto.randomUUID(), text: chosenText, streaming: false, finalState: finalState });
                        inserted = true;
                    }
                    continue;
                }
                result.push(entry);
            }
            if (!inserted && chosenText) {
                result.push({ kind: 'assistant-body', id: crypto.randomUUID(), text: chosenText, streaming: false, finalState: finalState });
            }
            return result;
        }

        function applyStreamEvent(event) {
            if (!state || !state.session) return;
            let entries = Array.isArray(state.session.entries) ? [...state.session.entries] : [];
            if (event.type === 'start') {
                entries = entries.filter((entry) => entry.kind !== 'context-usage');
                state.session.contextUsage = undefined;
                state.activeSessionId = event.sessionId;
                if (pendingPrompt && pendingPrompt.text === event.message) {
                    pendingPrompt = null;
                    renderPendingPrompt();
                }
                const last = entries[entries.length - 1];
                if (!last || last.kind !== 'user-message' || last.text !== event.message) {
                    entries.push({ kind: 'user-message', id: crypto.randomUUID(), text: event.message || '', timestamp: Date.now() });
                }
            } else if (event.type === 'text-delta') {
                let streamingIdx = -1;
                for (let idx = entries.length - 1; idx >= 0; idx -= 1) {
                    if (entries[idx] && entries[idx].kind === 'assistant-body' && entries[idx].streaming) {
                        streamingIdx = idx;
                        break;
                    }
                }
                if (streamingIdx >= 0) {
                    entries[streamingIdx].text += event.delta || '';
                } else {
                    entries.push({ kind: 'assistant-body', id: crypto.randomUUID(), text: event.delta || '', streaming: true });
                }
            } else if (event.type === 'final') {
                entries = finalizePendingOperations(entries, 'done');
                entries = consolidateFinalAssistant(entries, event.response || '', event.finalState);
                runtimeFinalizing = Boolean(event.runtimeFinalizing);
                setRunning(false);
                renderRuntimeFinalizing();
            } else if (event.type === 'operation') {
                const idx = findMatchingPendingOperationIndex(entries, event.operationId, event.label, event.category);
                const existing = idx >= 0 && entries[idx] && entries[idx].kind === 'operation' ? entries[idx] : null;
                const opEntry = {
                    kind: 'operation',
                    id: event.operationId || (existing && existing.id) || crypto.randomUUID(),
                    tone: event.status === 'error' ? 'error' : event.status === 'done' ? 'success' : 'info',
                    title: event.label,
                    detail: event.category === 'shell' && existing && existing.summary ? existing.summary : event.summary,
                    category: event.category,
                    status: event.status,
                    body: event.body || (existing && existing.body),
                    summary: event.category === 'shell' && existing && existing.summary ? existing.summary : event.summary,
                    startedAt: event.startedAt,
                    endedAt: event.endedAt,
                };
                if (idx >= 0) entries[idx] = opEntry;
                else entries.push(opEntry);
            } else if (event.type === 'progress') {
                const idx = findMatchingPendingOperationIndex(entries, '', event.title, event.phase || 'phase');
                const progressEntry = {
                    kind: 'operation',
                    id: idx >= 0 && entries[idx] && entries[idx].kind === 'operation' ? entries[idx].id : crypto.randomUUID(),
                    tone: event.tone,
                    title: event.title,
                    detail: event.detail,
                    category: event.phase || 'phase',
                    status: event.tone === 'error' ? 'error' : 'running',
                };
                if (idx >= 0) entries[idx] = progressEntry;
                else entries.push(progressEntry);
            } else if (event.type === 'compaction') {
                const compactionEntry = { kind: 'compaction', id: crypto.randomUUID(), timestamp: Date.now(), event: event };
                entries.push(compactionEntry);
                state.session.lastCompaction = event;
                state.session.totalCompactions = (state.session.totalCompactions || 0) + 1;
            } else if (event.type === 'context-usage') {
                if (event.source !== 'api') {
                    renderAll();
                    return;
                }
                state.session.contextUsage = {
                    promptTokens: event.promptTokens,
                    completionTokens: event.completionTokens,
                    contextWindowTokens: event.contextWindowTokens,
                    fillPercent: event.fillPercent,
                    source: event.source,
                };
                renderAll();
                return;
            } else if (event.type === 'error') {
                entries = finalizePendingOperations(entries, 'error');
                entries.push({ kind: 'system-notice', id: crypto.randomUUID(), text: 'Error: ' + event.error, timestamp: Date.now() });
            }
            state.session.entries = entries;
            renderAll();
        }

        function sendPrompt() {
            const text = promptInput.value.trim();
            if (!text || !state) return;
            promptInput.value = '';
            if (isRunning || runtimeFinalizing) {
                pendingPrompt = { text, mode: 'pending' };
                renderPendingPrompt();
                vscode.postMessage({ type: 'agent.queue', text, workflowId, nodeContexts: currentNodeContexts, sessionId: state.activeSessionId });
                return;
            }
            vscode.postMessage({ type: 'agent.send', text, workflowId, nodeContexts: currentNodeContexts, sessionId: state.activeSessionId });
        }

        on(form, 'submit', (event) => {
            event.preventDefault();
            autoScrollFeed = true;
            sendPrompt();
        });

        on(promptInput, 'keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendPrompt();
            }
        });
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeInlineMenus();
                if (mentionMenu) mentionMenu.classList.remove('open');
                if (historyOverlay && historyOverlay.classList.contains('open')) closeHistory();
                if (checkpointOverlay && checkpointOverlay.classList.contains('open')) closeCheckpointPanel();
            }
        });
        window.addEventListener('pointerdown', (event) => {
            const target = event.target;
            if (!(target instanceof Node)) return;
            if (providerMenu && (providerMenu.contains(target) || selectModelButton.contains(target))) return;
            if (reasoningMenu && (reasoningMenu.contains(target) || selectReasoningButton.contains(target))) return;
            if (newSessionMenu && (newSessionMenu.contains(target) || newSessionHeaderButton.contains(target))) return;
            if (worktreeMenu && (worktreeMenu.contains(target) || selectWorktreeButton.contains(target))) return;
            closeInlineMenus();
        }, true);
        on(promptInput, 'input', renderMentionMenu);
        on(promptInput, 'keyup', renderMentionMenu);
        on(feed, 'scroll', () => {
            autoScrollFeed = isFeedNearBottom();
        });

        on(stopButton, 'click', () => {
            stopButton.disabled = true;
            stopRunOptimistically();
            vscode.postMessage({ type: 'agent.stop' });
        });
        on(historyOpenButton, 'click', openHistory);
        on(historyCloseButton, 'click', closeHistory);
        on(historyOverlay, 'click', (event) => {
            if (event.target === historyOverlay) closeHistory();
        });
        on(checkpointOpenButton, 'click', openCheckpointPanel);
        on(checkpointCloseButton, 'click', closeCheckpointPanel);
        on(checkpointOverlay, 'click', (event) => {
            if (event.target === checkpointOverlay) closeCheckpointPanel();
        });
        on(selectModelButton, 'click', () => {
            providerMenuOpen = !providerMenuOpen;
            reasoningMenuOpen = false;
            providerMenuMode = 'models';
            providerMenuProvider = state && state.provider ? state.provider : providerMenuProvider;
            if (providerMenuOpen) modelSearchQuery = '';
            renderProviderMenu();
            renderReasoningMenu();
            if (providerMenuOpen) vscode.postMessage({ type: 'agent.providers.refresh' });
        });
        on(selectReasoningButton, 'click', () => {
            reasoningMenuOpen = !reasoningMenuOpen;
            providerMenuOpen = false;
            renderProviderMenu();
            renderReasoningMenu();
        });
        on(selectWorktreeButton, 'click', openWorktreeMenu);
        function startNewSession(workflow) {
            closeHistory();
            closeCheckpointPanel();
            closeInlineMenus();
            vscode.postMessage({ type: 'agent.session.new', workflow });
        }

        on(newSessionButton, 'click', openNewSessionMenu);
        on(newSessionHeaderButton, 'click', openNewSessionMenu);
        on(checkpointSaveButton, 'click', () => {
            if (!state || !state.activeSessionId || isRunning) return;
            vscode.postMessage({ type: 'agent.checkpoint.save', sessionId: state.activeSessionId });
        });
        on(compactContextButton, 'click', () => state && vscode.postMessage({ type: 'agent.context.compact', sessionId: state.activeSessionId }));
        on(sessionFilter, 'change', () => {
            activeFilter = sessionFilter.value || 'current';
            renderSessions();
        });

        window.addEventListener('message', (event) => {
            const message = event.data;
            if (!message || typeof message !== 'object') return;

            if (message.type === 'panel.visibility') {
                const isVisible = Boolean(message.visible);
                if (!isVisible) {
                    if (frame && frame.src !== 'about:blank') {
                        frame.src = 'about:blank';
                    }
                } else {
                    if (frame && frame.src !== workflowUrl && workflowUrl) {
                        frame.src = workflowUrl;
                    }
                }
                return;
            }

            if (message.type === 'workflow.reload') {
                vscode.postMessage({ type: 'workflow.reloadAck', workflowId, hasFrame: Boolean(frame), url: workflowReloadUrl || workflowUrl || '' });
                reloadWorkflowFrame();
                return;
            }

            if (message.type === 'workflow.update' && typeof message.url === 'string') {
                const nextWorkflowUrl = message.url;
                const shouldUpdateFrame = nextWorkflowUrl !== workflowUrl;
                workflowId = String(message.workflowId || workflowId);
                workflowName = String(message.workflowName || workflowName || workflowId || 'Current workflow');
                workflowFilename = String(message.workflowFilename || workflowFilename || '');
                workflowFilePath = String(message.workflowFilePath || workflowFilePath || '');
                openWorkflowContext = workflowId || workflowFilename || workflowFilePath
                    ? { id: workflowId || undefined, name: workflowName, filename: workflowFilename || undefined, filePath: workflowFilePath || undefined }
                    : null;
                workflowUrl = nextWorkflowUrl;
                workflowReloadUrl = typeof message.reloadUrl === 'string' && message.reloadUrl ? message.reloadUrl : workflowUrl;
                try { iframeOrigin = new URL(workflowUrl).origin; } catch (e) { iframeOrigin = 'src'; }
                if (frame && shouldUpdateFrame) frame.src = workflowUrl;
                return;
            }

            if (message.type === 'n8n-paste-request') {
                if (!isWorkflowFrameEvent(event)) return;
                const now = Date.now();
                if (now - lastPasteMs < PASTE_RATE_LIMIT_MS) return;
                lastPasteMs = now;
                vscode.postMessage({ type: 'clipboard-paste-request', grantToken: issuePasteGrant() });
                return;
            }

            if (message.type === 'n8n-node-detail-opened') {
                if (!isWorkflowFrameEvent(event)) return;
                addNodeContext(message.node, true);
                return;
            }

            if (message.type === 'n8n-node-context-cleared') {
                if (!isWorkflowFrameEvent(event)) return;
                setNodeContexts([], true);
                return;
            }

            if (message.type === 'n8n-clipboard-write' && typeof message.text === 'string') {
                if (!isWorkflowFrameEvent(event)) return;
                vscode.postMessage({ type: 'clipboard-write', text: message.text });
                return;
            }

            if (message.type === 'clipboard-error' && typeof message.grantToken === 'string') {
                consumeGrant(message.grantToken);
                return;
            }

            if (message.type === 'clipboard-paste' && typeof message.text === 'string' && typeof message.grantToken === 'string') {
                if (event.origin !== window.origin) return;
                if (!consumeGrant(message.grantToken)) return;
                try {
                    if (frame.contentWindow) {
                        frame.contentWindow.postMessage({ type: 'n8n-clipboard-paste', text: message.text }, iframeOrigin);
                    }
                } catch (e) {}
                return;
            }

            if (message.type === 'agent.status') {
                if (message.status === 'idle') runtimeFinalizing = false;
                setRunning(message.status === 'running');
                renderRuntimeFinalizing();
                return;
            }

            if (message.type === 'agent.error') {
                pendingPrompt = null;
                renderPendingPrompt();
                return;
            }

            if (message.type === 'agent.messageRewind') {
                pendingPrompt = null;
                renderPendingPrompt();
                promptInput.value = typeof message.prompt === 'string' ? message.prompt : '';
                promptInput.focus();
                promptInput.selectionStart = promptInput.selectionEnd = promptInput.value.length;
                return;
            }

            if (message.type === 'agent.state') {
                if (!acceptIncomingStateMessage(message)) return;
                state = message.state || null;
                activeWorktreePath = state && state.activeWorktree ? state.activeWorktree.path : null;
                renderAll();
                return;
            }

            if (message.type === 'agent.providerModels') {
                providerModelCache[String(message.provider || '')] = Array.isArray(message.models) ? message.models : [];
                providerMenuOpen = true;
                renderProviderMenu();
                return;
            }

            if (message.type === 'agent.worktrees') {
                if (state) {
                    state.availableWorktrees = Array.isArray(message.worktrees) ? message.worktrees : [];
                    state.activeWorktree = state.availableWorktrees.find((wt) => wt.path === message.activePath) || null;
                    activeWorktreePath = typeof message.activePath === 'string' && message.activePath ? message.activePath : null;
                    renderWorktreeMenu();
                }
                return;
            }

            if (message.type === 'agent.streamEvent') {
                applyStreamEvent(message.event || {});
                return;
            }
        });

        vscode.postMessage({ type: 'agent.ready' });
    </script>
</body>
</html>`;
}

// src/services/agent-provider-settings.ts
import * as vscode11 from "vscode";
var AGENT_PROVIDER_IDS = /* @__PURE__ */ new Set([
  "anthropic",
  "openai",
  "google",
  "mistral",
  "openrouter",
  "openai-oauth",
  "copilot-proxy",
  "minimax",
  "minimax-token-plan",
  "openai-compatible"
]);
var AGENT_REASONING_EFFORT_SETTINGS = ["none", "minimal", "low", "medium", "high", "xhigh"];
var SELECTED_PROVIDER_STATE_KEY = "n8n.agent.provider";
var SELECTED_MODEL_STATE_KEY = "n8n.agent.model";
var BASE_URL_STATE_KEY = "n8n.agent.baseUrl";
var REASONING_EFFORT_STATE_KEY = "n8n.agent.reasoningEffort";
var MANAGED_SETTINGS_STATE_KEY = "n8n.agent.settingsManaged";
function readAgentProviderSettings(state) {
  const legacyConfig = vscode11.workspace.getConfiguration("n8n.agent");
  const legacyProvider = readOptionalString(legacyConfig.get("provider"));
  const useManagedSettings = state.get(MANAGED_SETTINGS_STATE_KEY) === true || !legacyProvider;
  const provider = normalizeAgentProviderId(useManagedSettings ? readPersistedString(state, SELECTED_PROVIDER_STATE_KEY, legacyProvider) : legacyProvider) || "openai";
  const model = (useManagedSettings ? readPersistedString(state, SELECTED_MODEL_STATE_KEY, legacyConfig.get("model")) : readOptionalString(legacyConfig.get("model"))) || void 0;
  const baseUrl = (useManagedSettings ? readPersistedString(state, BASE_URL_STATE_KEY, legacyConfig.get("baseUrl")) : readOptionalString(legacyConfig.get("baseUrl"))) || void 0;
  const reasoningValue = useManagedSettings ? readPersistedString(state, REASONING_EFFORT_STATE_KEY, legacyConfig.get("reasoningEffort")) : readOptionalString(legacyConfig.get("reasoningEffort"));
  const reasoningEffort = AGENT_REASONING_EFFORT_SETTINGS.includes(reasoningValue) ? reasoningValue : void 0;
  return { provider, model, baseUrl, reasoningEffort };
}
function normalizeAgentProviderId(provider) {
  const normalized = provider?.trim().toLowerCase();
  if (!normalized) return void 0;
  if (normalized === "claude") return "anthropic";
  if (normalized === "anthropic-proxy") return "anthropic";
  if (normalized === "gemini") return "google";
  return AGENT_PROVIDER_IDS.has(normalized) ? normalized : void 0;
}
async function updateAgentProviderSettings(state, patch) {
  await state.update(MANAGED_SETTINGS_STATE_KEY, true);
  if ("provider" in patch) await state.update(SELECTED_PROVIDER_STATE_KEY, patch.provider);
  if ("model" in patch) await state.update(SELECTED_MODEL_STATE_KEY, patch.model || void 0);
  if ("baseUrl" in patch) await state.update(BASE_URL_STATE_KEY, patch.baseUrl || void 0);
  if ("reasoningEffort" in patch) await state.update(REASONING_EFFORT_STATE_KEY, patch.reasoningEffort || void 0);
}
function readPersistedString(state, key, legacyValue) {
  const value = state.get(key);
  return readOptionalString(value ?? legacyValue);
}
function readOptionalString(value) {
  return String(value ?? "").trim();
}

// src/services/agent-provider-capabilities.ts
var AGENT_REASONING_EFFORTS = ["none", "minimal", "low", "medium", "high", "xhigh"];
var OPENAI_REASONING_EFFORTS = ["none", "low", "medium", "high"];
var ANTHROPIC_REASONING_EFFORTS = ["none", "low", "medium", "high", "xhigh"];
var OPENROUTER_REASONING_EFFORTS = ["none", "low", "medium", "high"];
var GOOGLE_REASONING_EFFORTS = ["none", "low", "medium", "high"];
function getReasoningCapability(provider, model) {
  const normalizedProvider = provider;
  if (normalizedProvider === "openai-oauth") {
    return { supported: true, efforts: AGENT_REASONING_EFFORTS, defaultEffort: "medium", strategy: "custom-openai-account" };
  }
  if ((normalizedProvider === "openai" || normalizedProvider === "openai-compatible") && isOpenAIReasoningModel(model)) {
    return { supported: true, efforts: OPENAI_REASONING_EFFORTS, defaultEffort: "medium", strategy: "openai-responses" };
  }
  if (normalizedProvider === "anthropic" && isAnthropicReasoningModel(model)) {
    return { supported: true, efforts: ANTHROPIC_REASONING_EFFORTS, defaultEffort: "medium", strategy: "anthropic-thinking" };
  }
  if (normalizedProvider === "openrouter" && isOpenRouterReasoningModel(model)) {
    return { supported: true, efforts: OPENROUTER_REASONING_EFFORTS, defaultEffort: "medium", strategy: "openrouter-reasoning" };
  }
  if (normalizedProvider === "google" && isGeminiThinkingModel(model)) {
    return { supported: true, efforts: GOOGLE_REASONING_EFFORTS, defaultEffort: "medium", strategy: "google-thinking" };
  }
  return { supported: false, efforts: ["none"] };
}
function normalizeReasoningEffortForCapability(effort, capability) {
  if (!capability.supported) return void 0;
  if (!effort) return capability.defaultEffort;
  if (capability.efforts.includes(effort)) return effort;
  if (effort === "minimal" && capability.efforts.includes("low")) return "low";
  if (effort === "xhigh" && capability.efforts.includes("high")) return "high";
  return capability.defaultEffort;
}
function buildLangChainReasoningOptions(provider, model, effort) {
  const capability = getReasoningCapability(provider, model);
  const normalizedEffort = normalizeReasoningEffortForCapability(effort, capability);
  if (!capability.supported || !normalizedEffort || normalizedEffort === "none") return {};
  switch (capability.strategy) {
    case "openai-responses":
      return {
        reasoning: { effort: toOpenAIReasoningEffort(normalizedEffort) },
        useResponsesApi: true
      };
    case "anthropic-thinking":
      return buildAnthropicReasoningOptions(model, normalizedEffort);
    case "openrouter-reasoning":
      return {
        modelKwargs: {
          reasoning: { effort: toOpenAIReasoningEffort(normalizedEffort) },
          include_reasoning: true
        }
      };
    case "google-thinking":
      return {
        thinkingConfig: {
          includeThoughts: true,
          thinkingLevel: toGoogleThinkingLevel(normalizedEffort),
          thinkingBudget: toGoogleThinkingBudget(normalizedEffort)
        },
        modelKwargs: {
          extra_body: {
            google: {
              thinking_config: {
                include_thoughts: true,
                thinking_budget: toGoogleThinkingBudget(normalizedEffort)
              }
            }
          }
        }
      };
    default:
      return {};
  }
}
function getReasoningOptions(provider, model, selected) {
  const capability = getReasoningCapability(provider, model);
  return capability.efforts.map((effort) => ({
    id: effort,
    label: effort,
    selected: effort === selected
  }));
}
function shouldDisableModelStreamingForToolCalling(provider, model) {
  return provider === "google" && normalizeModelName(model).startsWith("gemini-3");
}
function buildAnthropicReasoningOptions(model, effort) {
  if (isAnthropicAdaptiveThinkingModel(model)) {
    return {
      thinking: { type: "adaptive", display: "summarized" },
      outputConfig: { effort: toAnthropicEffort(effort) }
    };
  }
  return {
    thinking: {
      type: "enabled",
      budget_tokens: toAnthropicBudgetTokens(effort),
      display: "summarized"
    }
  };
}
function isOpenAIReasoningModel(model) {
  const normalized = normalizeModelName(model);
  return /^(o\d|o\d-|o\d\.|gpt-5|gpt-5-|gpt-5\.)/.test(normalized);
}
function isAnthropicReasoningModel(model) {
  const normalized = normalizeModelName(model);
  return /^claude-(opus|sonnet|haiku)-4/.test(normalized) || /^claude-3-7/.test(normalized) || normalized.includes("claude-3.7");
}
function isAnthropicAdaptiveThinkingModel(model) {
  const normalized = normalizeModelName(model);
  return /^claude-(opus|sonnet)-4-[67]/.test(normalized) || /^claude-(opus|sonnet)-4\.(6|7)/.test(normalized);
}
function isGeminiThinkingModel(model) {
  const normalized = normalizeModelName(model);
  return normalized.startsWith("gemini-2.5") || normalized.startsWith("gemini-3");
}
function isOpenRouterReasoningModel(model) {
  const normalized = normalizeModelName(model);
  return isOpenAIReasoningModel(normalized) || isAnthropicReasoningModel(normalized.replace(/^anthropic\//, "")) || normalized.includes("/deepseek-r1") || normalized.includes("deepseek/deepseek-r1") || normalized.includes("/qwen") && normalized.includes("thinking") || normalized.includes("/grok-4") || normalized.includes("grok-4");
}
function toOpenAIReasoningEffort(effort) {
  if (effort === "high" || effort === "xhigh") return "high";
  if (effort === "medium") return "medium";
  return "low";
}
function toAnthropicEffort(effort) {
  if (effort === "xhigh") return "xhigh";
  if (effort === "high") return "high";
  if (effort === "medium") return "medium";
  return "low";
}
function toAnthropicBudgetTokens(effort) {
  if (effort === "xhigh") return 16e3;
  if (effort === "high") return 1e4;
  if (effort === "medium") return 4e3;
  return 1024;
}
function toGoogleThinkingLevel(effort) {
  if (effort === "high" || effort === "xhigh") return "HIGH";
  if (effort === "medium") return "MEDIUM";
  return "LOW";
}
function toGoogleThinkingBudget(effort) {
  if (effort === "high" || effort === "xhigh") return 8192;
  if (effort === "medium") return 4096;
  return 1024;
}
function normalizeModelName(model) {
  return model?.trim().toLowerCase() || "";
}

// src/ui/agent-workbench-webview.ts
var AgentWorkbenchWebview = class _AgentWorkbenchWebview {
  static _panels = /* @__PURE__ */ new Map();
  static _lastActiveSessionId;
  static _clipboardPasteHandler;
  _panel;
  _context;
  _agentRuntime;
  _outputChannel;
  _disposables = [];
  _registryDisposable;
  _workflow;
  _workflowFilePath;
  _workflowUrl;
  _workflowReloadUrl;
  _providerModelLabel;
  _nodeContexts = [];
  _workflowProviders;
  _activeSessionId;
  _stateSequence = 0;
  constructor(panel, context, workflow, workflowFilePath, workflowUrl, workflowReloadUrl, providerModelLabel, agentRuntime, outputChannel2, workflowProviders, initialSessionId) {
    this._panel = panel;
    this._context = context;
    this._workflow = workflow;
    this._workflowFilePath = workflowFilePath;
    this._workflowUrl = workflowUrl;
    this._workflowReloadUrl = workflowReloadUrl;
    this._providerModelLabel = providerModelLabel;
    this._agentRuntime = agentRuntime;
    this._outputChannel = outputChannel2;
    this._workflowProviders = workflowProviders;
    this._activeSessionId = initialSessionId;
    this.updateRegistryRegistration();
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.onDidChangeViewState((event) => {
      const isVisible = event.webviewPanel.visible;
      void this._panel.webview.postMessage({
        type: "panel.visibility",
        visible: isVisible
      });
      if (event.webviewPanel.active && this._activeSessionId) {
        _AgentWorkbenchWebview._lastActiveSessionId = this._activeSessionId;
      }
      if (isVisible) {
        void this.postWorkbenchState();
      }
    }, null, this._disposables);
    this._panel.webview.onDidReceiveMessage((message) => {
      void this.handleMessage(message).catch((error) => {
        const detail = error?.message || String(error);
        console.error("[AgentWorkbench] Message handler error", error);
        void this._panel.webview.postMessage({ type: "agent.streamEvent", event: { type: "error", error: detail } });
      });
    }, null, this._disposables);
    this._panel.webview.html = this.getHtmlForWebview();
  }
  static createOrShow(context, workflow, workflowFilePath, workflowUrl, workflowReloadUrl, providerModelLabel, agentRuntime, outputChannel2, workflowProviders, initialSessionId, viewColumn) {
    const column = viewColumn || vscode12.ViewColumn.One;
    if (initialSessionId) {
      const existingPanel = _AgentWorkbenchWebview._panels.get(initialSessionId);
      if (existingPanel) {
        existingPanel._panel.reveal(column);
        existingPanel._workflowProviders = workflowProviders;
        existingPanel.update(workflow, workflowFilePath, workflowUrl, workflowReloadUrl, providerModelLabel);
        return;
      }
    }
    const panel = vscode12.window.createWebviewPanel(
      "n8nAgentWorkbench",
      `n8n Agent: ${workflow?.name || "New workflow"}`,
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: []
      }
    );
    const workbench = new _AgentWorkbenchWebview(panel, context, workflow, workflowFilePath, workflowUrl, workflowReloadUrl, providerModelLabel, agentRuntime, outputChannel2, workflowProviders, initialSessionId);
    if (initialSessionId) {
      _AgentWorkbenchWebview._panels.set(initialSessionId, workbench);
      _AgentWorkbenchWebview._lastActiveSessionId = initialSessionId;
    }
  }
  static onClipboardPasteRequest(handler) {
    _AgentWorkbenchWebview._clipboardPasteHandler = handler;
  }
  static getCurrentActiveSessionId() {
    return _AgentWorkbenchWebview._lastActiveSessionId;
  }
  update(workflow, workflowFilePath, workflowUrl, workflowReloadUrl, providerModelLabel, postState = true) {
    const hadWorkflowFrame = Boolean(this._workflow);
    const hasWorkflowFrame = Boolean(workflow);
    const hadWorkflowUi = Boolean(this._workflowUrl);
    const hasWorkflowUi = Boolean(workflowUrl);
    this._workflow = workflow;
    this._workflowFilePath = workflowFilePath;
    this._workflowUrl = workflowUrl;
    this._workflowReloadUrl = workflowReloadUrl;
    this._providerModelLabel = providerModelLabel;
    this.updateRegistryRegistration();
    this._panel.title = `n8n Agent: ${workflow?.name || "New workflow"}`;
    if (hadWorkflowFrame !== hasWorkflowFrame || hadWorkflowUi !== hasWorkflowUi) {
      this._panel.webview.html = this.getHtmlForWebview();
      return;
    }
    this._panel.webview.postMessage({
      type: "workflow.update",
      workflowId: workflow?.id || "",
      workflowName: workflow?.name || "New workflow",
      workflowFilename: workflow?.filename || "",
      workflowFilePath: workflowFilePath || "",
      url: workflowUrl,
      reloadUrl: workflowReloadUrl
    });
    if (postState) void this.postWorkbenchState();
  }
  dispose() {
    if (this._activeSessionId) {
      if (_AgentWorkbenchWebview._panels.get(this._activeSessionId) === this) {
        _AgentWorkbenchWebview._panels.delete(this._activeSessionId);
      }
      if (_AgentWorkbenchWebview._lastActiveSessionId === this._activeSessionId) {
        _AgentWorkbenchWebview._lastActiveSessionId = void 0;
      }
    }
    this._registryDisposable?.dispose();
    this._registryDisposable = void 0;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      disposable?.dispose();
    }
  }
  async handleMessage(message) {
    if (!message || typeof message !== "object") {
      return;
    }
    const payload = message;
    if (payload.type === "agent.ready") {
      this._outputChannel.appendLine(`[n8n-agent-debug] webview ready workflowId=${this._workflow?.id || "none"} workflowFilePath=${this._workflowFilePath || "none"}`);
      await this.postWorkbenchState();
      return;
    }
    if (payload.type === "workflow.reloadAck") {
      this._outputChannel.appendLine(`[n8n-agent-debug] webview received workflow.reload workflowId=${String(payload.workflowId || this._workflow?.id || "none")} hasFrame=${String(Boolean(payload.hasFrame))} url=${String(payload.url || this._workflowReloadUrl || this._workflowUrl || "")}`);
      return;
    }
    if (payload.type === "clipboard-write" && typeof payload.text === "string") {
      try {
        await vscode12.env.clipboard.writeText(payload.text);
      } catch (error) {
        console.error("[AgentWorkbench] Clipboard write error", error);
      }
      return;
    }
    if (payload.type === "clipboard-paste-request" && typeof payload.grantToken === "string") {
      void _AgentWorkbenchWebview._clipboardPasteHandler?.(this._panel, payload.grantToken)?.catch((error) => console.error("[AgentWorkbench] Clipboard paste handler error", error));
      return;
    }
    if (payload.type === "agent.send" || payload.type === "agent.queue" || payload.type === "agent.steer") {
      const nodeContexts = this.sanitizeNodeContexts(payload.nodeContexts) || this.sanitizeNodeContexts(payload.nodeContext) || this._nodeContexts;
      this._outputChannel.appendLine(`[n8n-agent-debug] ${payload.type} workflowId=${this._workflow?.id || "none"} workflowFilePath=${this._workflowFilePath || "none"} sessionId=${typeof payload.sessionId === "string" ? payload.sessionId : "none"}`);
      const input = {
        prompt: String(payload.text || ""),
        workflowId: this._workflow?.id,
        workflowName: this._workflow?.name,
        workflowFilename: this._workflow?.filename,
        workflowFilePath: this._workflowFilePath,
        workspaceRoot: vscode12.workspace.workspaceFolders?.[0]?.uri.fsPath,
        nodeContext: nodeContexts[0],
        nodeContexts,
        sessionId: typeof payload.sessionId === "string" ? payload.sessionId : void 0
      };
      const result = payload.type === "agent.send" ? await this._agentRuntime.sendPrompt(input, (event) => this.postAgentRuntimeMessage(event)) : await this._agentRuntime.queuePrompt(input, (event) => this.postAgentRuntimeMessage(event), payload.type === "agent.steer" ? "steer" : "pending");
      this._outputChannel.appendLine(`[n8n-agent-debug] ${payload.type} completed workflowId=${this._workflow?.id || "none"} workflowChanged=${String(result.workflowChanged)}`);
      return;
    }
    if (payload.type === "agent.selectModel") {
      const provider = typeof payload.provider === "string" ? payload.provider : this.readSelectedProvider();
      await this._panel.webview.postMessage({
        type: "agent.providerModels",
        provider,
        models: await this._workflowProviders.listModelOptions(provider)
      });
      return;
    }
    if (payload.type === "agent.providers.configure") {
      await vscode12.commands.executeCommand("n8n.openAgentManager");
      return;
    }
    if (payload.type === "agent.providers.refresh") {
      await this.postWorkbenchState();
      return;
    }
    if (payload.type === "agent.workflow.select") {
      await vscode12.commands.executeCommand("n8n.openAgentWorkbench");
      return;
    }
    if (payload.type === "agent.selectReasoningEffort") {
      if (typeof payload.effort === "string") {
        await this._workflowProviders.selectReasoningEffort(payload.effort);
        await this.postWorkbenchState();
      }
      return;
    }
    if (payload.type === "agent.providerModel.select" && typeof payload.provider === "string" && typeof payload.model === "string") {
      await this._workflowProviders.selectProviderModel(payload.provider, payload.model);
      this._providerModelLabel = this.getProviderModelLabel();
      await this.postWorkbenchState();
      return;
    }
    if (payload.type === "agent.nodeDetailChanged") {
      this._nodeContexts = this.sanitizeNodeContexts(payload.nodeContexts) || this.sanitizeNodeContexts(payload.nodeContext) || [];
      if (typeof payload.sessionId === "string") {
        await this.postWorkbenchState(await this._agentRuntime.setNodeContexts(payload.sessionId, this._nodeContexts, this.buildWorkbenchInput()));
      }
      return;
    }
    if (payload.type === "agent.context.workflow.set" && typeof payload.sessionId === "string") {
      const workflow = this.sanitizeWorkflowContext(payload.workflow);
      if (!workflow) return;
      await this.postWorkbenchState(await this._agentRuntime.setWorkflowContext(payload.sessionId, workflow, this.buildWorkbenchInput()));
      return;
    }
    if (payload.type === "agent.context.workflow.clear" && typeof payload.sessionId === "string") {
      this._activeSessionId = payload.sessionId;
      this._nodeContexts = [];
      await this.postWorkbenchState(await this._agentRuntime.clearWorkflowContext(payload.sessionId, this.buildWorkbenchInput()));
      return;
    }
    if (payload.type === "agent.stop") {
      const sessionId = typeof payload.sessionId === "string" ? payload.sessionId : this._activeSessionId;
      await this._agentRuntime.stop((event) => this._panel.webview.postMessage(event), sessionId);
      return;
    }
    if (payload.type === "agent.session.new") {
      const workflow = this.sanitizeWorkflowContext(payload.workflow);
      const input = workflow ? {
        ...this.buildWorkbenchInput(),
        workflowId: workflow.id,
        workflowName: workflow.name,
        workflowFilename: workflow.filename,
        workflowFilePath: workflow.filePath,
        nodeContext: void 0,
        nodeContexts: void 0
      } : {
        ...this.buildWorkbenchInput(),
        workflowId: void 0,
        workflowName: void 0,
        workflowFilename: void 0,
        workflowFilePath: void 0,
        nodeContext: void 0,
        nodeContexts: void 0
      };
      const state = await this._agentRuntime.createSession(input);
      await vscode12.commands.executeCommand("n8n.openAgentWorkbench", { sessionId: state.activeSessionId, workflow });
      return;
    }
    if (payload.type === "agent.session.select" && typeof payload.sessionId === "string") {
      const sessionId = payload.sessionId;
      const existingPanel = _AgentWorkbenchWebview._panels.get(sessionId);
      if (existingPanel) {
        existingPanel._panel.reveal();
      } else {
        await vscode12.commands.executeCommand("n8n.openAgentWorkbench", { sessionId });
      }
      return;
    }
    if (payload.type === "agent.session.rename" && typeof payload.sessionId === "string" && typeof payload.title === "string") {
      await this.postWorkbenchState(await this._agentRuntime.renameSession(payload.sessionId, payload.title, this.buildWorkbenchInput()));
      return;
    }
    if (payload.type === "agent.session.delete" && typeof payload.sessionId === "string") {
      const sessionId = payload.sessionId;
      const confirmed = await vscode12.window.showWarningMessage(
        "Delete this conversation? This cannot be undone.",
        { modal: true },
        "Delete"
      );
      if (confirmed !== "Delete") return;
      const deletedPanel = _AgentWorkbenchWebview._panels.get(sessionId);
      const state = await this._agentRuntime.deleteSession(sessionId, this.buildWorkbenchInput());
      if (_AgentWorkbenchWebview._panels.get(sessionId) === deletedPanel) {
        _AgentWorkbenchWebview._panels.delete(sessionId);
      }
      if (deletedPanel && deletedPanel !== this) {
        deletedPanel.dispose();
      }
      await this.postWorkbenchState(state);
      return;
    }
    if (payload.type === "agent.session.attach" && typeof payload.sessionId === "string") {
      await this.postWorkbenchState(await this._agentRuntime.attachSessionToCurrentWorkflow(payload.sessionId, this.buildWorkbenchInput()));
      return;
    }
    if (payload.type === "agent.session.detach" && typeof payload.sessionId === "string") {
      await this.postWorkbenchState(await this._agentRuntime.detachSession(payload.sessionId, this.buildWorkbenchInput()));
      return;
    }
    if (payload.type === "agent.message.rewind" && typeof payload.sessionId === "string" && typeof payload.messageId === "string") {
      const result = await this._agentRuntime.rewindToUserMessage(payload.sessionId, payload.messageId, this.buildWorkbenchInput());
      await this.postWorkbenchState(result.state);
      await this._panel.webview.postMessage({ type: "agent.messageRewind", prompt: result.prompt });
      return;
    }
    if (payload.type === "agent.checkpoint.save" && typeof payload.sessionId === "string") {
      await this.postWorkbenchState(await this._agentRuntime.saveCheckpoint(payload.sessionId, this.buildWorkbenchInput()));
      return;
    }
    if (payload.type === "agent.checkpoint.restore" && typeof payload.sessionId === "string" && typeof payload.checkpointId === "string") {
      await this.postWorkbenchState(await this._agentRuntime.restoreCheckpoint(payload.sessionId, payload.checkpointId, this.buildWorkbenchInput()));
      return;
    }
    if (payload.type === "agent.checkpoint.delete" && typeof payload.sessionId === "string" && typeof payload.checkpointId === "string") {
      await this.postWorkbenchState(await this._agentRuntime.deleteCheckpoint(payload.sessionId, payload.checkpointId, this.buildWorkbenchInput()));
      return;
    }
    if (payload.type === "agent.context.compact" && typeof payload.sessionId === "string") {
      await this._panel.webview.postMessage({ type: "agent.status", status: "running", detail: "Compacting context..." });
      await this._panel.webview.postMessage({
        type: "agent.streamEvent",
        event: {
          type: "progress",
          tone: "info",
          title: "Compacting context",
          detail: "Requesting runtime context compaction",
          phase: "compaction"
        }
      });
      try {
        await this.postWorkbenchState(await this._agentRuntime.compactSession(payload.sessionId, this.buildWorkbenchInput()));
      } catch (error) {
        const message2 = error?.message || String(error);
        await this._panel.webview.postMessage({
          type: "agent.streamEvent",
          event: {
            type: "progress",
            tone: "error",
            title: "Context compaction failed",
            detail: message2,
            phase: "compaction"
          }
        });
        throw error;
      } finally {
        await this._panel.webview.postMessage({ type: "agent.status", status: "idle" });
      }
      return;
    }
    if (payload.type === "agent.worktree.list") {
      try {
        const allWorktrees = await this._workflowProviders.listWorktrees();
        const mainWorkspacePath = vscode12.workspace.workspaceFolders?.[0]?.uri.fsPath;
        const worktrees = allWorktrees.filter((wt) => wt.path !== mainWorkspacePath);
        const activePath = this._agentRuntime.getActiveWorktreePath(this._activeSessionId);
        await this._panel.webview.postMessage({
          type: "agent.worktrees",
          worktrees,
          activePath
        });
      } catch (error) {
        this._outputChannel.appendLine(`[n8n-agent] Worktree list error: ${error?.message || String(error)}`);
      }
      return;
    }
    if (payload.type === "agent.worktree.select" && typeof payload.path === "string") {
      try {
        const worktrees = await this._workflowProviders.listWorktrees();
        const isKnown = worktrees.some((wt) => wt.path === payload.path);
        if (!isKnown) {
          this._outputChannel.appendLine(`[n8n-agent] Worktree select refused: unknown path=${payload.path}`);
          return;
        }
        await this._agentRuntime.setActiveWorktreePath(payload.path, this._activeSessionId);
        this._outputChannel.appendLine(`[n8n-agent-debug] Worktree selected path=${payload.path}`);
        await this.postWorkbenchState();
      } catch (error) {
        this._outputChannel.appendLine(`[n8n-agent] Worktree select error: ${error?.message || String(error)}`);
      }
      return;
    }
    if (payload.type === "agent.worktree.create") {
      const branchName = typeof payload.branchName === "string" && payload.branchName ? payload.branchName : void 0;
      try {
        const worktree = await this._workflowProviders.createWorktree({ branchName });
        if (worktree) {
          await this._agentRuntime.setActiveWorktreePath(worktree.path, this._activeSessionId);
          this._outputChannel.appendLine(`[n8n-agent-debug] Worktree created and selected path=${worktree.path}`);
        }
      } catch (error) {
        const message2 = error?.message || String(error);
        this._outputChannel.appendLine(`[n8n-agent] Worktree create error: ${message2}`);
        await this._panel.webview.postMessage({ type: "agent.error", message: `Failed to create worktree: ${message2}` });
      }
      await this.postWorkbenchState();
      return;
    }
    if (payload.type === "agent.worktree.clear") {
      await this._agentRuntime.setActiveWorktreePath(void 0, this._activeSessionId);
      this._outputChannel.appendLine("[n8n-agent-debug] Worktree cleared, back to current workspace");
      await this.postWorkbenchState();
      return;
    }
    if (payload.type === "agent.worktree.remove" && typeof payload.path === "string") {
      const confirmed = await vscode12.window.showWarningMessage(
        "Delete this worktree? This will fail if it contains uncommitted changes.",
        { modal: true },
        "Delete"
      );
      if (confirmed !== "Delete") return;
      try {
        const allowed = await this._workflowProviders.listWorktrees();
        const isKnown = allowed.some((wt) => wt.path === payload.path);
        if (!isKnown) {
          throw new Error("Refusing to remove unknown worktree path.");
        }
        await this._workflowProviders.removeWorktree(payload.path);
        await this._agentRuntime.clearActiveWorktreePath(payload.path);
        this._outputChannel.appendLine(`[n8n-agent-debug] Worktree removed path=${payload.path}`);
      } catch (error) {
        const message2 = error?.message || String(error);
        this._outputChannel.appendLine(`[n8n-agent] Worktree remove error: ${message2}`);
        await this._panel.webview.postMessage({ type: "agent.error", message: `Failed to remove worktree: ${message2}` });
      }
      await this.postWorkbenchState();
      return;
    }
  }
  sanitizeNodeContext(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return void 0;
    }
    const record = value;
    const name = typeof record.name === "string" ? record.name.trim() : "";
    if (!name) {
      return void 0;
    }
    return {
      name,
      type: typeof record.type === "string" ? record.type.trim() || void 0 : void 0,
      id: typeof record.id === "string" ? record.id.trim() || void 0 : void 0
    };
  }
  sanitizeNodeContexts(value) {
    const values = Array.isArray(value) ? value : value ? [value] : [];
    const contexts = values.map((item) => this.sanitizeNodeContext(item)).filter((item) => Boolean(item));
    if (!contexts.length) return void 0;
    const seen = /* @__PURE__ */ new Set();
    return contexts.filter((node) => {
      const key = [node.name, node.type || "", node.id || ""].join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  sanitizeWorkflowContext(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
    const record = value;
    const id = typeof record.id === "string" ? record.id.trim() : "";
    const name = typeof record.name === "string" ? record.name.trim() : "";
    const filename = typeof record.filename === "string" ? record.filename.trim() : "";
    const filePath = typeof record.filePath === "string" ? record.filePath.trim() : "";
    if (!id && !name && !filename) return void 0;
    return {
      id: id || void 0,
      name: name || id || filename,
      filename: filename || void 0,
      filePath: filePath || void 0
    };
  }
  getProviderModelLabel() {
    const settings = readAgentProviderSettings(this._context.globalState);
    const provider = settings.provider;
    const model = settings.model || "";
    return model ? `${provider} / ${model}` : provider;
  }
  readSelectedProvider() {
    return readAgentProviderSettings(this._context.globalState).provider;
  }
  buildWorkbenchInput() {
    const activeWorktreePath = this._agentRuntime.getActiveWorktreePath(this._activeSessionId);
    return {
      workflowId: this._workflow?.id,
      workflowName: this._workflow?.name,
      workflowFilename: this._workflow?.filename,
      workflowFilePath: this._workflowFilePath,
      workspaceRoot: activeWorktreePath || vscode12.workspace.workspaceFolders?.[0]?.uri.fsPath,
      worktreePath: activeWorktreePath,
      nodeContext: this._nodeContexts[0],
      nodeContexts: this._nodeContexts,
      sessionId: this._activeSessionId
    };
  }
  async postWorkbenchState(state, options = {}) {
    const enrich = options.enrich !== false;
    const stateSequence = ++this._stateSequence;
    const nextState = state ?? await this._agentRuntime.getWorkbenchState(this.buildWorkbenchInput());
    const oldSessionId = this._activeSessionId;
    const newSessionId = nextState.activeSessionId;
    this._activeSessionId = newSessionId;
    this._nodeContexts = Array.isArray(nextState.currentNodeContexts) ? nextState.currentNodeContexts : [];
    if (oldSessionId && oldSessionId !== newSessionId) {
      if (_AgentWorkbenchWebview._panels.get(oldSessionId) === this) {
        _AgentWorkbenchWebview._panels.delete(oldSessionId);
      }
    }
    let ownsNewSession = false;
    if (newSessionId) {
      const existingOwner = _AgentWorkbenchWebview._panels.get(newSessionId);
      if (!existingOwner || existingOwner === this) {
        _AgentWorkbenchWebview._panels.set(newSessionId, this);
        ownsNewSession = true;
      } else {
        ownsNewSession = false;
      }
      if (this._panel.active && ownsNewSession) {
        _AgentWorkbenchWebview._lastActiveSessionId = newSessionId;
      }
    }
    if (this._panel.active && !ownsNewSession && _AgentWorkbenchWebview._lastActiveSessionId === oldSessionId) {
      _AgentWorkbenchWebview._lastActiveSessionId = void 0;
    }
    if (!enrich) {
      await this._panel.webview.postMessage({ type: "agent.state", state: nextState, stateSequence });
      if (!nextState.isRunning) {
        void this.postWorkbenchState(void 0, { enrich: true }).catch((error) => this._outputChannel.appendLine(`[n8n-agent] Background Workbench state enrichment failed: ${error?.message || String(error)}`));
      }
      return;
    }
    await this.reconcileWorkflowContext(nextState.workflowContext);
    const activeWorktreePath = this._agentRuntime.getActiveWorktreePath(nextState.activeSessionId);
    const allWorktrees = await this._workflowProviders.listWorktrees().catch(() => []);
    const mainWorkspacePath = vscode12.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const availableWorktrees = allWorktrees.filter((wt) => wt.path !== mainWorkspacePath);
    const activeWorktree = activeWorktreePath ? availableWorktrees.find((wt) => wt.path === activeWorktreePath) : void 0;
    const enrichedState = {
      ...nextState,
      availableWorkflows: await this.getWorkflowOptions(),
      availableNodes: await this.getWorkflowNodeOptions(),
      providerOptions: await this._workflowProviders.listProviderOptions().catch(() => []),
      modelOptions: await this._workflowProviders.listModelOptions(String(nextState.provider || "")).catch(() => []),
      reasoningOptions: getReasoningOptions(String(nextState.provider || ""), nextState.model, nextState.reasoningEffort),
      activeWorktree,
      availableWorktrees
    };
    await this._panel.webview.postMessage({ type: "agent.state", state: enrichedState, stateSequence });
  }
  async postAgentRuntimeMessage(message) {
    if (message.type === "agent.state") {
      await this.postWorkbenchState(message.state, { enrich: false });
      return true;
    }
    return this._panel.webview.postMessage(message);
  }
  async reconcileWorkflowContext(workflowContext) {
    if (!workflowContext) {
      if (this._workflow || this._workflowUrl || this._workflowFilePath) {
        this.update(void 0, void 0, void 0, void 0, this._providerModelLabel, false);
      }
      return;
    }
    const currentKey = this._workflow?.id || this._workflow?.filename || this._workflow?.name || "";
    const nextKey = workflowContext.id || workflowContext.filename || workflowContext.name || "";
    if (currentKey === nextKey && this._workflowFilePath === workflowContext.filePath) {
      return;
    }
    const target = await this._workflowProviders.resolveWorkflow(workflowContext);
    const workflow = target.workflow || {
      id: workflowContext.id || "",
      name: workflowContext.name,
      filename: workflowContext.filename || ""
    };
    this.update(workflow, target.workflowFilePath || workflowContext.filePath, target.workflowUrl, target.workflowReloadUrl, this._providerModelLabel, false);
  }
  async getWorkflowOptions() {
    const workflows = await this._workflowProviders.listWorkflows().catch(() => []);
    return Promise.all(workflows.map(async (workflow) => {
      const base = {
        id: workflow.id || void 0,
        name: workflow.name || workflow.id || workflow.filename || "Workflow",
        filename: workflow.filename || void 0
      };
      const target = await this._workflowProviders.resolveWorkflow(base).catch(() => void 0);
      return {
        ...base,
        filePath: target?.workflowFilePath
      };
    }));
  }
  async getWorkflowNodeOptions() {
    if (this._workflowFilePath) {
      try {
        const raw = await fs.promises.readFile(this._workflowFilePath, "utf8");
        return this.extractNodeContextsFromTypeScript(raw).filter((node) => Boolean(node));
      } catch {
      }
    }
    if (!this._workflow?.id) return [];
    return this._workflowProviders.listWorkflowNodes({
      id: this._workflow.id,
      name: this._workflow.name || this._workflow.id,
      filename: this._workflow.filename || void 0,
      filePath: this._workflowFilePath
    }).catch(() => []);
  }
  extractNodeContextsFromTypeScript(source) {
    const nodes = [];
    const nodeDecoratorPattern = /@node\s*\(\s*\{([\s\S]*?)\}\s*\)/g;
    let match;
    while (match = nodeDecoratorPattern.exec(source)) {
      const decoratorContent = match[1] || "";
      const name = this.extractStringProperty(decoratorContent, "name");
      if (!name) continue;
      nodes.push({
        name,
        type: this.extractStringProperty(decoratorContent, "type"),
        id: this.extractStringProperty(decoratorContent, "id")
      });
    }
    return nodes;
  }
  extractStringProperty(source, property) {
    const match = source.match(new RegExp(`${property}\\s*:\\s*(["'])((?:\\\\.|(?!\\1)[\\s\\S])*?)\\1`));
    return match?.[2]?.trim() || void 0;
  }
  updateRegistryRegistration() {
    const workflowId = this._workflow?.id;
    if (!workflowId) {
      this._registryDisposable?.dispose();
      this._registryDisposable = void 0;
      return;
    }
    if (this._registryDisposable) {
      return;
    }
    this._registryDisposable = workflowWebviewRegistry.register({
      getWorkflowId: () => this._workflow?.id,
      describeTarget: () => `agent-workbench:${this._panel.title}`,
      reloadWorkflow: () => {
        this._outputChannel.appendLine(`[n8n-agent-debug] registry requested workflow.reload workflowId=${this._workflow?.id || "none"} panel=${this._panel.title}`);
        return this._panel.webview.postMessage({ type: "workflow.reload" });
      }
    });
    this._outputChannel.appendLine(`[n8n-agent-debug] registry registration ensured workflowId=${workflowId}`);
  }
  getHtmlForWebview() {
    return buildAgentWorkbenchHtml({
      workflowId: this._workflow?.id || "",
      workflowName: this._workflow?.name || "New workflow",
      workflowFilename: this._workflow?.filename,
      workflowFilePath: this._workflowFilePath,
      workflowAttached: Boolean(this._workflow),
      workflowUrl: this._workflowUrl,
      workflowReloadUrl: this._workflowReloadUrl,
      providerModelLabel: this._providerModelLabel
    });
  }
};

// src/ui/configuration-webview.ts
import * as vscode15 from "vscode";
import { randomUUID as randomUUID3 } from "crypto";
import { createN8nManagerFacade } from "@n8n-as-code/manager-adapter";
import { ConfigService as ConfigService5, resolveInstanceIdentifier as resolveInstanceIdentifier2 } from "n8nac";

// src/services/agent-provider-service.ts
import * as vscode13 from "vscode";

// src/services/agent-runtime-controller.ts
import * as fs5 from "fs";
import * as path4 from "path";
import { randomUUID as randomUUID2 } from "crypto";

// src/services/workspace-snapshot-service.ts
import * as fs2 from "fs";
import * as os from "os";
import * as path from "path";
import { execFile } from "child_process";
import { createHash } from "crypto";
import { promisify } from "util";
var execFileAsync = promisify(execFile);
var WorkspaceSnapshotService = class {
  constructor(storageRoot, log = () => {
  }) {
    this.log = log;
    this.snapshotRoot = path.join(storageRoot, "agent-workspace-snapshots");
  }
  log;
  snapshotRoot;
  async capture(workspaceRoot, label) {
    if (!workspaceRoot) return void 0;
    const resolvedRoot = path.resolve(workspaceRoot);
    if (!fs2.existsSync(resolvedRoot)) return void 0;
    try {
      await this.ensureSnapshotRepo(resolvedRoot);
      await this.git(resolvedRoot, ["add", "-A", "--", "."]);
      const message = `${label}

workspace: ${resolvedRoot}`;
      const { stdout } = await this.git(resolvedRoot, ["commit", "--allow-empty", "-m", message]);
      const match = stdout.match(/\[[^\s]+(?:\s+\([^)]+\))?\s+([a-f0-9]+)\]/i);
      if (match?.[1]) {
        return await this.revParse(resolvedRoot, match[1]);
      }
      return this.revParse(resolvedRoot, "HEAD");
    } catch (error) {
      this.log(`[n8n-agent] Workspace snapshot failed: ${error?.message || String(error)}`);
      return void 0;
    }
  }
  async restore(workspaceRoot, snapshotId) {
    if (!snapshotId) return;
    if (!workspaceRoot) {
      throw new Error("Cannot restore workspace snapshot without an open workspace.");
    }
    const resolvedRoot = path.resolve(workspaceRoot);
    await this.ensureSnapshotRepo(resolvedRoot);
    await this.capture(resolvedRoot, "Before checkpoint rewind restore");
    const currentFiles = await this.listTreeFiles(resolvedRoot, "HEAD");
    await this.removeTrackedFiles(resolvedRoot, currentFiles);
    await this.checkoutTree(resolvedRoot, snapshotId);
    await this.git(resolvedRoot, ["read-tree", snapshotId]);
  }
  async listTreeFiles(workspaceRoot, treeish) {
    const { stdout } = await this.git(workspaceRoot, ["ls-tree", "-r", "-z", "--name-only", treeish]);
    return stdout.split("\0").filter(Boolean);
  }
  async removeTrackedFiles(workspaceRoot, files) {
    const directories = /* @__PURE__ */ new Set();
    for (const file of files) {
      const absolutePath = this.resolveWorkspacePath(workspaceRoot, file);
      directories.add(path.dirname(absolutePath));
      await this.removePathIfPresent(absolutePath);
    }
    const sortedDirectories = Array.from(directories).filter((directory) => path.relative(workspaceRoot, directory)).sort((a, b) => b.length - a.length);
    for (const directory of sortedDirectories) {
      await this.removeEmptyDirectory(directory);
    }
  }
  async removePathIfPresent(absolutePath) {
    let stat;
    try {
      stat = await fs2.promises.lstat(absolutePath);
    } catch (error) {
      if (error?.code === "ENOENT") return;
      throw error;
    }
    if (stat.isDirectory() && !stat.isSymbolicLink()) {
      await fs2.promises.rm(absolutePath, { recursive: true });
    } else {
      await fs2.promises.unlink(absolutePath);
    }
  }
  async removeEmptyDirectory(absolutePath) {
    try {
      await fs2.promises.rmdir(absolutePath);
    } catch (error) {
      if (error?.code === "ENOENT" || error?.code === "ENOTEMPTY" || error?.code === "EEXIST") return;
      throw error;
    }
  }
  async checkoutTree(workspaceRoot, treeish) {
    const tempDir = await fs2.promises.mkdtemp(path.join(os.tmpdir(), "n8nac-snapshot-index-"));
    const env6 = { GIT_INDEX_FILE: path.join(tempDir, "index") };
    try {
      await this.git(workspaceRoot, ["read-tree", treeish], { env: env6 });
      await this.git(workspaceRoot, ["checkout-index", "-a", "-f", `--prefix=${this.checkoutPrefix(workspaceRoot)}`], { env: env6 });
    } finally {
      await this.removeTempDirectory(tempDir);
    }
  }
  async removeTempDirectory(absolutePath) {
    try {
      await fs2.promises.rm(absolutePath, { recursive: true });
    } catch (error) {
      if (error?.code === "ENOENT") return;
      throw error;
    }
  }
  checkoutPrefix(workspaceRoot) {
    return workspaceRoot.endsWith(path.sep) ? workspaceRoot : `${workspaceRoot}${path.sep}`;
  }
  resolveWorkspacePath(workspaceRoot, file) {
    const absolutePath = path.resolve(workspaceRoot, file);
    const relativePath = path.relative(workspaceRoot, absolutePath);
    if (!relativePath || relativePath === ".." || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
      throw new Error(`Snapshot path escapes workspace: ${file}`);
    }
    return absolutePath;
  }
  async ensureSnapshotRepo(workspaceRoot) {
    const gitDir = this.gitDir(workspaceRoot);
    if (!fs2.existsSync(gitDir)) {
      await fs2.promises.mkdir(path.dirname(gitDir), { recursive: true });
      await execFileAsync("git", ["init", "--bare", gitDir], { maxBuffer: 10 * 1024 * 1024 });
    }
    await fs2.promises.mkdir(path.join(gitDir, "info"), { recursive: true });
    await fs2.promises.writeFile(
      path.join(gitDir, "info", "exclude"),
      [
        ".git",
        ".git/",
        ".git/**",
        ""
      ].join("\n"),
      "utf8"
    );
    await this.git(workspaceRoot, ["config", "user.name", "n8n Agent Workbench"]);
    await this.git(workspaceRoot, ["config", "user.email", "n8n-agent-workbench@localhost"]);
    await this.git(workspaceRoot, ["config", "commit.gpgsign", "false"]);
    await this.git(workspaceRoot, ["config", "core.autocrlf", "false"]);
  }
  async revParse(workspaceRoot, ref) {
    const { stdout } = await this.git(workspaceRoot, ["rev-parse", ref]);
    return stdout.trim();
  }
  async git(workspaceRoot, args, options = {}) {
    const result = await execFileAsync("git", [
      `--git-dir=${this.gitDir(workspaceRoot)}`,
      `--work-tree=${workspaceRoot}`,
      ...args
    ], {
      cwd: workspaceRoot,
      env: options.env ? { ...process.env, ...options.env } : process.env,
      maxBuffer: 50 * 1024 * 1024
    });
    return {
      stdout: String(result.stdout || ""),
      stderr: String(result.stderr || "")
    };
  }
  gitDir(workspaceRoot) {
    const id = createHash("sha256").update(path.resolve(workspaceRoot)).digest("hex").slice(0, 32);
    return path.join(this.snapshotRoot, `${id}.git`);
  }
};

// src/services/agent-provider-runtime/create-langchain-model.ts
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI, ChatOpenAICompletions } from "@langchain/openai";

// src/services/agent-provider-runtime/chat-codex-oauth.ts
import {
  BaseChatModel
} from "@langchain/core/language_models/chat_models";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage, AIMessageChunk } from "@langchain/core/messages";
import { ChatGenerationChunk } from "@langchain/core/outputs";
import { toJsonSchema as langChainToJsonSchema } from "@langchain/core/utils/json_schema";

// src/services/agent-provider-runtime/openai-account.ts
import fs3 from "node:fs";
import os2 from "node:os";
import path2 from "node:path";
import { createHash as createHash2, randomBytes, randomUUID } from "node:crypto";

// src/services/agent-provider-runtime/tool-schema.ts
function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function appendNullToType(type) {
  if (typeof type === "string") {
    return type === "null" ? "null" : [type, "null"];
  }
  if (Array.isArray(type)) {
    return type.includes("null") ? type : [...type, "null"];
  }
  return ["null"];
}
function makeSchemaNullable(schema) {
  if (schema.type !== void 0) {
    return {
      ...schema,
      type: appendNullToType(schema.type)
    };
  }
  if (Array.isArray(schema.anyOf)) {
    const hasNull = schema.anyOf.some((entry) => isRecord(entry) && entry.type === "null");
    if (!hasNull) {
      return {
        ...schema,
        anyOf: [...schema.anyOf, { type: "null" }]
      };
    }
  }
  if (Array.isArray(schema.oneOf)) {
    const hasNull = schema.oneOf.some((entry) => isRecord(entry) && entry.type === "null");
    if (!hasNull) {
      return {
        ...schema,
        oneOf: [...schema.oneOf, { type: "null" }]
      };
    }
  }
  return {
    anyOf: [schema, { type: "null" }]
  };
}
function normalizeSchemaNode(schema, forceRequired) {
  if (!isRecord(schema)) {
    return schema;
  }
  const normalized = { ...schema };
  if (Array.isArray(schema.anyOf)) {
    normalized.anyOf = schema.anyOf.map((entry) => normalizeSchemaNode(entry, forceRequired));
  }
  if (Array.isArray(schema.oneOf)) {
    normalized.oneOf = schema.oneOf.map((entry) => normalizeSchemaNode(entry, forceRequired));
  }
  if (isRecord(schema.items)) {
    normalized.items = normalizeSchemaNode(schema.items, forceRequired);
  }
  if (isRecord(schema.properties)) {
    const properties = Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => [key, normalizeSchemaNode(value, forceRequired)])
    );
    const propertyKeys = Object.keys(properties);
    const originalRequired = new Set(
      Array.isArray(schema.required) ? schema.required.filter((entry) => typeof entry === "string") : []
    );
    if (forceRequired) {
      for (const key of propertyKeys) {
        if (!originalRequired.has(key) && isRecord(properties[key])) {
          properties[key] = makeSchemaNullable(properties[key]);
        }
      }
    }
    normalized.properties = properties;
    normalized.required = forceRequired ? propertyKeys : [...originalRequired];
    if (normalized.additionalProperties === void 0) {
      normalized.additionalProperties = false;
    }
  }
  return normalized;
}
function normalizeFunctionToolParametersSchema(schema, options = {}) {
  return normalizeSchemaNode(schema, options.forceRequiredObjectProperties === true);
}

// src/services/agent-provider-runtime/utils.ts
var CODEX_UPSTREAM_TIMEOUT_MS = parseCodexUpstreamTimeoutMs(
  process.env.N8N_CODEX_UPSTREAM_TIMEOUT_MS
);
var RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelayMs: 500,
  maxDelayMs: 8e3,
  backoffMultiplier: 2
};
async function withRetry(fn, label, options = {}) {
  let attempt = 0;
  let delay = options.delayMs ?? RETRY_CONFIG.initialDelayMs;
  const maxAttempts = options.retries ?? RETRY_CONFIG.maxAttempts;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= maxAttempts) throw err;
      await new Promise((resolve5) => setTimeout(resolve5, delay));
      delay = Math.min(delay * RETRY_CONFIG.backoffMultiplier, RETRY_CONFIG.maxDelayMs);
    }
  }
}
function timeoutSignal(timeoutMs, _label) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  if (typeof timer.unref === "function") timer.unref();
  return controller.signal;
}
function parseCodexUpstreamTimeoutMs(value, fallback = 3e5) {
  if (typeof value !== "string") {
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

// src/services/agent-provider-runtime/openai-account.ts
var OPENAI_ACCOUNT_BASE_URL = "https://chatgpt.com/backend-api";
var CODEX_ORIGINATOR = "codex_cli_rs";
var CODEX_INSTALLATION_ID_FILENAME = "codex_installation_id";
var CODEX_DEFAULT_INSTRUCTIONS = `You are Codex, based on GPT-5. You are running as a coding agent inside the n8n Workbench on the user's computer.

Prefer acting with the available tools over prolonged deliberation. In the Workbench, use the dedicated file tools for reading and editing files instead of shell commands when possible, and use shell tools primarily for commands, package managers, git, and runtime checks.`;
function getDefaultCodexReasoningEffort(modelId) {
  return /^gpt-5\.4(?:$|[-.])/i.test(modelId) ? "none" : "medium";
}
function toCodexReasoningPayload(modelId, reasoningEffort) {
  if (reasoningEffort === "none") {
    return {};
  }
  const effort = reasoningEffort === "minimal" ? "low" : reasoningEffort === "xhigh" ? "high" : reasoningEffort;
  return {
    reasoning: {
      effort,
      .../^gpt-5/i.test(modelId) ? { summary: "auto" } : {}
    }
  };
}
var CODEX_RESPONSES_PATH = "/codex/responses";
var MODEL_CACHE_TTL_MS = 5 * 60 * 1e3;
var JWT_ACCOUNT_CLAIM = "https://api.openai.com/auth";
var CODEX_TOKEN_ENDPOINT = "https://auth.openai.com/oauth/token";
var CODEX_CLIENT_ID = "app_EMoamEEZ73f0CkXaXp7hrann";
var CODEX_CALLBACK_PORT = 1455;
var CODEX_CALLBACK_PATH = "/auth/callback";
var CODEX_REDIRECT_URI = `http://localhost:${CODEX_CALLBACK_PORT}${CODEX_CALLBACK_PATH}`;
function getCodexAuthPath() {
  return process.env.N8N_CODEX_AUTH_PATH || path2.join(os2.homedir(), ".codex", "auth.json");
}
function readCodexSession() {
  const authPath = getCodexAuthPath();
  if (!fs3.existsSync(authPath)) {
    return void 0;
  }
  try {
    const parsed = JSON.parse(fs3.readFileSync(authPath, "utf8"));
    const accessToken = parsed.tokens?.access_token?.trim();
    if (!accessToken) {
      return void 0;
    }
    return {
      accessToken,
      refreshToken: parsed.tokens?.refresh_token?.trim() || void 0,
      source: "codex"
    };
  } catch {
    return void 0;
  }
}
function getTokenExpiry(accessToken) {
  try {
    const parts = accessToken.split(".");
    if (parts.length !== 3) return void 0;
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    const exp = payload["exp"];
    return typeof exp === "number" ? exp : void 0;
  } catch {
    return void 0;
  }
}
function isTokenExpiringSoon(accessToken, minValiditySeconds = 60) {
  const expiry = getTokenExpiry(accessToken);
  if (expiry === void 0) return false;
  return Date.now() / 1e3 + minValiditySeconds > expiry;
}
async function refreshCodexToken(refreshToken) {
  const body = new URLSearchParams();
  body.set("grant_type", "refresh_token");
  body.set("refresh_token", refreshToken);
  body.set("client_id", CODEX_CLIENT_ID);
  const res = await fetch(CODEX_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });
  if (!res.ok) {
    throw new Error(`Token refresh failed: HTTP ${res.status}`);
  }
  const tokens = await res.json();
  if (!tokens.access_token) {
    throw new Error("Token refresh returned no access_token.");
  }
  const authPath = getCodexAuthPath();
  const existing = fs3.existsSync(authPath) ? JSON.parse(fs3.readFileSync(authPath, "utf8")) : { tokens: {} };
  existing.tokens = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? refreshToken,
    account_id: existing.tokens?.account_id
  };
  existing.last_refresh = (/* @__PURE__ */ new Date()).toISOString();
  fs3.mkdirSync(path2.dirname(authPath), { recursive: true });
  fs3.writeFileSync(authPath, JSON.stringify(existing, null, 2), { mode: 384 });
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? refreshToken,
    source: "codex"
  };
}
async function ensureOpenAiAccountSession(accessToken) {
  const explicitAccessToken = accessToken?.trim();
  if (explicitAccessToken) {
    return {
      accessToken: explicitAccessToken,
      source: "codex"
    };
  }
  const session = readCodexSession();
  if (!session) return void 0;
  if (isTokenExpiringSoon(session.accessToken)) {
    if (session.refreshToken) {
      try {
        return await refreshCodexToken(session.refreshToken);
      } catch {
      }
    }
  }
  return session;
}
function createOpenAiAccountLanguageModel(modelId, reasoningEffort = getDefaultCodexReasoningEffort(modelId), sessionId, accessToken) {
  return {
    specificationVersion: "v1",
    provider: "openai-oauth.account",
    modelId,
    defaultObjectGenerationMode: void 0,
    supportsImageUrls: false,
    supportsStructuredOutputs: false,
    async doGenerate(options) {
      const execution = await runOpenAiAccountCompletion(modelId, options, reasoningEffort, sessionId, accessToken);
      return {
        text: execution.text,
        finishReason: execution.finishReason,
        usage: execution.usage,
        ...execution.toolCalls ? { toolCalls: execution.toolCalls } : {},
        rawCall: {
          rawPrompt: options.prompt,
          rawSettings: { modelId }
        },
        warnings: execution.warnings,
        response: {
          timestamp: /* @__PURE__ */ new Date(),
          modelId,
          ...execution.responseId ? { id: execution.responseId } : {},
          ...execution.assistantPhase ? { assistantPhase: execution.assistantPhase } : {},
          ...execution.rawOutputItems ? { rawOutputItems: execution.rawOutputItems } : {}
        }
      };
    },
    async doStream(options) {
      const session = await ensureOpenAiAccountSession(accessToken);
      if (!session) {
        throw new Error("OpenAI account session not found. Run `codex --login` to sign in.");
      }
      const regularMode = options.mode.type === "regular" ? options.mode : void 0;
      const tools = getFunctionTools(options.mode);
      const accountId = extractChatGptAccountId(session.accessToken);
      const { instructions, input } = convertPromptToCodexInput(options.prompt);
      const reasoning = toCodexReasoningPayload(modelId, reasoningEffort);
      const previousResponseId = readOptionalString2(options.headers?.["x-n8n-previous-response-id"]);
      const codexIdentity = buildCodexIdentity(sessionId);
      const body = {
        model: modelId,
        store: false,
        stream: true,
        instructions: ensureCodexInstructions(instructions),
        input,
        ...reasoning,
        include: ["reasoning.encrypted_content"],
        client_metadata: codexIdentity.clientMetadata,
        ...previousResponseId ? { previous_response_id: previousResponseId } : {},
        ...tools.length > 0 ? { tools: toCodexTools(tools), tool_choice: toCodexToolChoice(regularMode?.toolChoice), parallel_tool_calls: true } : { tool_choice: "auto" }
      };
      const response = await withRetry(async () => {
        const response2 = await fetch(`${OPENAI_ACCOUNT_BASE_URL}${CODEX_RESPONSES_PATH}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.accessToken}`,
            "chatgpt-account-id": accountId,
            "OpenAI-Beta": "responses=experimental",
            "originator": CODEX_ORIGINATOR,
            "User-Agent": buildCodexUserAgent(),
            "x-client-request-id": codexIdentity.requestId,
            "x-codex-window-id": codexIdentity.windowId,
            "x-codex-installation-id": codexIdentity.installationId,
            "accept": "text/event-stream",
            "content-type": "application/json",
            ...sessionId ? { "session_id": sessionId } : {}
          },
          body: JSON.stringify(body),
          signal: options.abortSignal ? AbortSignal.any([options.abortSignal, timeoutSignal(CODEX_UPSTREAM_TIMEOUT_MS, "codex-streaming")]) : timeoutSignal(CODEX_UPSTREAM_TIMEOUT_MS, "codex-streaming")
        });
        if (!response2.ok) {
          const errText = await response2.text();
          throw new Error(errText.trim() || `Codex completion failed: HTTP ${response2.status}`);
        }
        if (!response2.body) {
          throw new Error("Codex completion returned empty response body.");
        }
        return response2;
      }, "Codex streaming completion");
      if (!response.body) {
        throw new Error("Codex completion returned empty response body.");
      }
      let inputTokens = 0;
      let outputTokens = 0;
      let finishReason = "unknown";
      const toolCalls = /* @__PURE__ */ new Map();
      let responseId;
      let assistantPhase;
      let rawOutputItems;
      const stream = new ReadableStream({
        async pull(controller) {
          let completed = false;
          for await (const event of parseCodexSSE(response.body)) {
            const type = typeof event.type === "string" ? event.type : void 0;
            if (!type) continue;
            if (type === "response.output_text.delta") {
              if (typeof event.delta === "string") {
                controller.enqueue({ type: "text-delta", textDelta: event.delta });
              }
            } else if (type === "response.output_item.added" || type === "response.output_item.done") {
              const item = readResponseOutputItem(event);
              const toolCall = extractCodexToolCallFromItem(item, toolCalls.size);
              if (toolCall) {
                toolCalls.set(toolCall.toolCallId, toolCall);
                controller.enqueue({
                  type: "tool-call-delta",
                  toolCallType: "function",
                  toolCallId: toolCall.toolCallId,
                  toolName: toolCall.toolName,
                  argsTextDelta: toolCall.args
                });
              }
              if (item && typeof item === "object" && item.type === "message") {
                const phase = readOptionalString2(item.phase);
                if (phase) {
                  assistantPhase = phase;
                }
              }
            } else if (type === "response.function_call_arguments.delta") {
              const itemId = readOptionalString2(event.item_id) || readOptionalString2(event.call_id);
              if (!itemId) continue;
              const existing = toolCalls.get(itemId);
              if (!existing || typeof event.delta !== "string") continue;
              const delta = event.delta;
              const newArgs = `${existing.args}${delta}`;
              toolCalls.set(itemId, { ...existing, args: newArgs });
              controller.enqueue({
                type: "tool-call-delta",
                toolCallType: "function",
                toolCallId: itemId,
                toolName: existing.toolName,
                argsTextDelta: delta
              });
            } else if (type === "response.function_call_arguments.done") {
              const itemId = readOptionalString2(event.item_id) || readOptionalString2(event.call_id);
              if (!itemId) continue;
              const existing = toolCalls.get(itemId);
              if (!existing) continue;
              const finalArgs = readOptionalString2(event.arguments) ?? existing.args;
              toolCalls.set(itemId, { ...existing, args: finalArgs });
            } else if (type === "response.completed") {
              const resp = event.response;
              responseId = readOptionalString2(resp?.id);
              inputTokens = resp?.usage?.input_tokens ?? 0;
              outputTokens = resp?.usage?.output_tokens ?? 0;
              rawOutputItems = Array.isArray(resp?.output) ? resp.output.filter((item) => Boolean(item) && typeof item === "object") : void 0;
              for (const item of Array.isArray(resp?.output) ? resp.output : []) {
                const toolCall = extractCodexToolCallFromItem(item, toolCalls.size);
                if (toolCall) toolCalls.set(toolCall.toolCallId, toolCall);
              }
              completed = true;
              break;
            } else if (type === "response.failed") {
              const resp = event.response;
              throw new Error(resp?.error?.message || "Codex response failed.");
            } else if (type === "error") {
              const msg = typeof event.message === "string" ? event.message : "";
              throw new Error(msg || "Codex stream error.");
            }
          }
          finishReason = toolCalls.size > 0 ? "tool-calls" : "stop";
          controller.enqueue({
            type: "finish",
            finishReason,
            usage: { promptTokens: inputTokens, completionTokens: outputTokens },
            ...responseId || assistantPhase || rawOutputItems ? { providerMetadata: { ...responseId ? { responseId } : {}, ...assistantPhase ? { assistantPhase } : {}, ...rawOutputItems ? { rawOutputItems } : {} } } : {}
          });
          controller.close();
          if (!completed) {
            return;
          }
        }
      });
      return {
        stream,
        rawCall: {
          rawPrompt: options.prompt,
          rawSettings: { modelId }
        },
        warnings: []
      };
    }
  };
}
async function runOpenAiAccountCompletion(modelId, options, reasoningEffort = getDefaultCodexReasoningEffort(modelId), sessionId, accessToken) {
  const session = await ensureOpenAiAccountSession(accessToken);
  if (!session) {
    throw new Error("OpenAI account session not found. Run `codex --login` to sign in.");
  }
  const regularMode = options.mode.type === "regular" ? options.mode : void 0;
  const tools = getFunctionTools(options.mode);
  const warnings = buildCodexWarnings(options, tools);
  const accountId = extractChatGptAccountId(session.accessToken);
  const { instructions, input } = convertPromptToCodexInput(options.prompt);
  const reasoning = toCodexReasoningPayload(modelId, reasoningEffort);
  const previousResponseId = readOptionalString2(options.headers?.["x-n8n-previous-response-id"]);
  const codexIdentity = buildCodexIdentity(sessionId);
  const body = {
    model: modelId,
    store: false,
    stream: true,
    instructions: ensureCodexInstructions(instructions),
    input,
    ...reasoning,
    include: ["reasoning.encrypted_content"],
    client_metadata: codexIdentity.clientMetadata,
    ...previousResponseId ? { previous_response_id: previousResponseId } : {},
    ...tools.length > 0 ? { tools: toCodexTools(tools), tool_choice: toCodexToolChoice(regularMode?.toolChoice), parallel_tool_calls: true } : { tool_choice: "auto" }
  };
  const rawResponse = await withRetry(async () => {
    const response = await fetch(`${OPENAI_ACCOUNT_BASE_URL}${CODEX_RESPONSES_PATH}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
        "chatgpt-account-id": accountId,
        "OpenAI-Beta": "responses=experimental",
        "originator": CODEX_ORIGINATOR,
        "User-Agent": buildCodexUserAgent(),
        "x-client-request-id": codexIdentity.requestId,
        "x-codex-window-id": codexIdentity.windowId,
        "x-codex-installation-id": codexIdentity.installationId,
        "accept": "text/event-stream",
        "content-type": "application/json",
        ...sessionId ? { "session_id": sessionId } : {}
      },
      body: JSON.stringify(body),
      signal: timeoutSignal(CODEX_UPSTREAM_TIMEOUT_MS, "codex-non-streaming")
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText.trim() || `Codex completion failed: HTTP ${response.status}`);
    }
    if (!response.body) {
      throw new Error("Codex completion returned empty response body.");
    }
    return response;
  }, "Codex non-streaming completion");
  const responseBody = rawResponse.body;
  let text = "";
  let inputTokens = 0;
  let outputTokens = 0;
  const toolCalls = /* @__PURE__ */ new Map();
  let responseId;
  let assistantPhase;
  let rawOutputItems;
  for await (const event of parseCodexSSE(responseBody)) {
    const type = typeof event.type === "string" ? event.type : void 0;
    if (!type) continue;
    if (type === "response.output_text.delta") {
      if (typeof event.delta === "string") {
        text += event.delta;
      }
    } else if (type === "response.output_item.added" || type === "response.output_item.done") {
      const item = readResponseOutputItem(event);
      const toolCall = extractCodexToolCallFromItem(item, toolCalls.size);
      if (toolCall) {
        toolCalls.set(toolCall.toolCallId, toolCall);
      }
      if (item && typeof item === "object" && item.type === "message") {
        const phase = readOptionalString2(item.phase);
        if (phase) {
          assistantPhase = phase;
        }
      }
    } else if (type === "response.function_call_arguments.delta") {
      const itemId = readOptionalString2(event.item_id) || readOptionalString2(event.call_id);
      if (!itemId) {
        continue;
      }
      const existing = toolCalls.get(itemId);
      if (!existing || typeof event.delta !== "string") {
        continue;
      }
      toolCalls.set(itemId, {
        ...existing,
        args: `${existing.args}${event.delta}`
      });
    } else if (type === "response.function_call_arguments.done") {
      const itemId = readOptionalString2(event.item_id) || readOptionalString2(event.call_id);
      if (!itemId) {
        continue;
      }
      const existing = toolCalls.get(itemId);
      if (!existing) {
        continue;
      }
      const finalArgs = readOptionalString2(event.arguments);
      if (finalArgs) {
        toolCalls.set(itemId, {
          ...existing,
          args: finalArgs
        });
      }
    } else if (type === "response.completed") {
      const resp = event.response;
      responseId = readOptionalString2(resp?.id);
      inputTokens = resp?.usage?.input_tokens ?? 0;
      outputTokens = resp?.usage?.output_tokens ?? 0;
      rawOutputItems = Array.isArray(resp?.output) ? resp.output.filter((item) => Boolean(item) && typeof item === "object") : void 0;
      for (const item of Array.isArray(resp?.output) ? resp.output : []) {
        const toolCall = extractCodexToolCallFromItem(item, toolCalls.size);
        if (toolCall) {
          toolCalls.set(toolCall.toolCallId, toolCall);
        }
      }
    } else if (type === "response.failed") {
      const resp = event.response;
      throw new Error(resp?.error?.message || "Codex response failed.");
    } else if (type === "error") {
      const msg = typeof event.message === "string" ? event.message : "";
      throw new Error(msg || "Codex stream error.");
    }
  }
  return {
    text,
    finishReason: toolCalls.size > 0 ? "tool-calls" : "stop",
    usage: { promptTokens: inputTokens, completionTokens: outputTokens },
    ...toolCalls.size > 0 ? { toolCalls: [...toolCalls.values()] } : {},
    warnings,
    ...responseId ? { responseId } : {},
    ...assistantPhase ? { assistantPhase } : {},
    ...rawOutputItems ? { rawOutputItems } : {}
  };
}
function extractChatGptAccountId(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid token");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    const claim = payload[JWT_ACCOUNT_CLAIM];
    const accountId = claim?.chatgpt_account_id;
    if (typeof accountId !== "string" || !accountId) {
      throw new Error("No chatgpt_account_id in token");
    }
    return accountId;
  } catch {
    throw new Error("Failed to extract chatgpt_account_id from Codex token. Ensure the token was obtained via `codex --login`.");
  }
}
function convertPromptToCodexInput(prompt) {
  const instructionParts = [];
  const input = [];
  for (const message of prompt) {
    if (message.role === "system") {
      if (message.content) {
        instructionParts.push(message.content);
      }
      continue;
    }
    if (message.role === "user") {
      const text = message.content.map((p) => p.type === "text" ? p.text ?? "" : `[${p.type}]`).join("\n");
      input.push({ role: "user", content: [{ type: "input_text", text }] });
    } else if (message.role === "assistant") {
      if (Array.isArray(message.rawOutputItems) && message.rawOutputItems.length > 0) {
        for (const item of message.rawOutputItems) {
          const sanitized = sanitizeResponsesOutputItem(item);
          if (sanitized) {
            input.push(sanitized);
          }
        }
        continue;
      }
      const text = message.content.filter((p) => p.type === "text" || p.type === "reasoning").map((p) => p.text ?? "").join("\n").trim();
      if (text) {
        input.push({ role: "assistant", content: [{ type: "output_text", text }], ...message.phase ? { phase: message.phase } : {} });
      }
      for (const part of message.content) {
        if (part.type !== "tool-call") {
          continue;
        }
        input.push({
          type: "function_call",
          call_id: part.toolCallId,
          name: part.toolName,
          arguments: JSON.stringify(part.args ?? {})
        });
      }
    } else {
      for (const part of message.content) {
        input.push({
          type: "function_call_output",
          call_id: part.toolCallId,
          output: stringifyToolResult(part.result)
        });
      }
    }
  }
  const instructions = instructionParts.map((part) => part.trim()).filter(Boolean).join("\n\n") || void 0;
  return { instructions, input };
}
function sanitizeResponsesOutputItem(item) {
  const sanitized = { ...item };
  delete sanitized.id;
  delete sanitized.status;
  if (Array.isArray(sanitized.content)) {
    sanitized.content = sanitized.content.filter((part) => Boolean(part) && typeof part === "object").map((part) => {
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
  if (trimmed.includes("You are Codex, based on GPT-5.")) {
    return trimmed;
  }
  return `${CODEX_DEFAULT_INSTRUCTIONS}

${trimmed}`;
}
function ensureCodexSessionId(sessionId) {
  const trimmed = sessionId?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : randomUUID();
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
      "x-codex-installation-id": installationId,
      "x-codex-window-id": windowId
    }
  };
}
function ensureCodexInstallationId() {
  const installPath = path2.join(os2.homedir(), ".n8n-as-code", CODEX_INSTALLATION_ID_FILENAME);
  try {
    const existing = fs3.readFileSync(installPath, "utf8").trim();
    if (existing) {
      return existing;
    }
  } catch {
  }
  const installationId = randomUUID();
  try {
    fs3.mkdirSync(path2.dirname(installPath), { recursive: true });
    fs3.writeFileSync(installPath, installationId);
  } catch {
    return installationId;
  }
  return installationId;
}
async function* parseCodexSSE(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx = buffer.indexOf("\n\n");
    while (idx !== -1) {
      const chunk = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const dataLines = chunk.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim());
      if (dataLines.length > 0) {
        const data = dataLines.join("\n").trim();
        if (data && data !== "[DONE]") {
          try {
            yield JSON.parse(data);
          } catch {
          }
        }
      }
      idx = buffer.indexOf("\n\n");
    }
  }
}
function buildCodexWarnings(options, functionTools) {
  if (options.mode.type !== "regular" || !options.mode.tools || options.mode.tools.length === 0) {
    return [];
  }
  return options.mode.tools.filter((tool) => tool.type !== "function" || !functionTools.includes(tool)).map((tool) => ({
    type: "unsupported-tool",
    tool,
    details: "openai-oauth currently supports only function tools on the Codex backend."
  }));
}
function getFunctionTools(mode) {
  if (mode.type !== "regular" || !Array.isArray(mode.tools) || mode.tools.length === 0) {
    return [];
  }
  return mode.tools.filter((tool) => tool.type === "function");
}
function toCodexTools(tools) {
  return tools.map((tool) => ({
    type: "function",
    name: tool.name,
    ...tool.description ? { description: tool.description } : {},
    parameters: normalizeFunctionToolParametersSchema(tool.parameters, { forceRequiredObjectProperties: true }),
    strict: tool.strict ?? true
  }));
}
function toCodexToolChoice(toolChoice) {
  if (!toolChoice || toolChoice.type === "auto") {
    return "auto";
  }
  if (toolChoice.type === "none" || toolChoice.type === "required") {
    return toolChoice.type;
  }
  if (toolChoice.type === "tool") {
    return {
      type: "function",
      name: toolChoice.toolName
    };
  }
  return "auto";
}
function readResponseOutputItem(event) {
  if (event.item && typeof event.item === "object") {
    return event.item;
  }
  if (event.output_item && typeof event.output_item === "object") {
    return event.output_item;
  }
  return void 0;
}
function extractCodexToolCallFromItem(item, index) {
  if (!item || typeof item !== "object") {
    return void 0;
  }
  const record = item;
  if (record.type !== "function_call") {
    return void 0;
  }
  const toolName = readOptionalString2(record.name);
  if (!toolName) {
    return void 0;
  }
  const toolCallId = readOptionalString2(record.call_id) || readOptionalString2(record.id) || `openai-account-tool-call-${index + 1}`;
  const args = typeof record.arguments === "string" ? record.arguments : JSON.stringify(record.arguments ?? {});
  return {
    toolCallType: "function",
    toolCallId,
    toolName,
    args
  };
}
function stringifyToolResult(value) {
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return String(value);
  }
}
function readOptionalString2(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : void 0;
}
function buildCodexUserAgent() {
  const termProgram = process.env.TERM_PROGRAM;
  const termProgramVersion = process.env.TERM_PROGRAM_VERSION;
  const termSessionId = process.env.TERM_SESSION_ID;
  const weztermVersion = process.env.WEZTERM_VERSION;
  const isKitty = process.env.KITTY_WINDOW_ID || (process.env.TERM || "").includes("kitty");
  const isAlacritty = process.env.ALACRITTY_SOCKET || process.env.TERM === "alacritty";
  const isGnomeTerminal = process.env.GNOME_TERMINAL_SCREEN;
  const isWindowsTerminal = process.env.WT_SESSION;
  let terminal = "unknown";
  if (termProgram) {
    terminal = termProgramVersion ? `${termProgram}/${termProgramVersion}` : termProgram;
  } else if (weztermVersion) {
    terminal = `WezTerm/${weztermVersion}`;
  } else if (isKitty) {
    terminal = "kitty";
  } else if (isAlacritty) {
    terminal = "Alacritty";
  } else if (isGnomeTerminal) {
    terminal = "gnome-terminal";
  } else if (isWindowsTerminal) {
    terminal = "WindowsTerminal";
  } else if (termSessionId) {
    terminal = "Apple_Terminal";
  } else if (process.env.TERM) {
    terminal = process.env.TERM || "unknown";
  }
  return `${CODEX_ORIGINATOR}/0.0.0 (${os2.platform()} ${os2.release()}; ${os2.arch()}) ${terminal}`;
}

// src/services/agent-provider-runtime/chat-codex-oauth.ts
var ChatCodexOAuth = class _ChatCodexOAuth extends BaseChatModel {
  static lc_name() {
    return "ChatCodexOAuth";
  }
  model;
  reasoningEffort;
  sessionId;
  boundTools;
  boundCallOptions;
  accessToken;
  previousPrompt;
  previousResponseId;
  constructor(fields) {
    super(fields);
    this.model = fields.model;
    this.reasoningEffort = fields.reasoningEffort ?? getDefaultCodexReasoningEffort(fields.model);
    this.sessionId = ensureCodexSessionId(fields.sessionId);
    this.boundTools = fields.boundTools;
    this.boundCallOptions = fields.boundCallOptions;
    this.accessToken = fields.accessToken;
    this.previousPrompt = fields.previousPrompt;
    this.previousResponseId = fields.previousResponseId;
  }
  _llmType() {
    return "chat-codex-oauth";
  }
  _identifyingParams() {
    return {
      provider: "openai-codex-auth",
      model: this.model,
      reasoningEffort: this.reasoningEffort,
      sessionId: this.sessionId
    };
  }
  bindTools(tools, kwargs) {
    const normalizedTools = tools.map(toLanguageModelTool).filter((tool) => Boolean(tool));
    const boundCallOptions = {
      ...kwargs ?? {}
    };
    return new _ChatCodexOAuth({
      model: this.model,
      reasoningEffort: this.reasoningEffort,
      sessionId: this.sessionId,
      disableStreaming: this.disableStreaming,
      outputVersion: this.outputVersion,
      boundTools: normalizedTools,
      boundCallOptions,
      accessToken: this.accessToken,
      previousPrompt: this.previousPrompt,
      previousResponseId: this.previousResponseId,
      ...kwargs?.callbacks ? { callbacks: kwargs.callbacks } : {},
      ...kwargs?.tags ? { tags: kwargs.tags } : {},
      ...kwargs?.metadata ? { metadata: kwargs.metadata } : {}
    });
  }
  async _generate(messages, options, _runManager) {
    const model = createOpenAiAccountLanguageModel(this.model, this.reasoningEffort, this.sessionId, this.accessToken);
    const boundToolChoice = this.boundCallOptions?.tool_choice;
    const prompt = toLanguageModelPrompt(messages);
    const incremental = buildIncrementalPrompt(this.previousPrompt, prompt, this.previousResponseId);
    const result = await model.doGenerate({
      inputFormat: "prompt",
      mode: {
        type: "regular",
        tools: options.tools ?? this.boundTools ?? [],
        toolChoice: normalizeToolChoice(options.tool_choice ?? boundToolChoice)
      },
      prompt: incremental.prompt,
      ...incremental.previousResponseId ? { headers: { "x-n8n-previous-response-id": incremental.previousResponseId } } : {},
      abortSignal: options.signal
    });
    this.previousPrompt = prompt;
    this.previousResponseId = result.response?.id;
    const text = result.text ?? "";
    const toolCalls = (result.toolCalls ?? []).map((toolCall) => ({
      id: toolCall.toolCallId,
      name: toolCall.toolName,
      args: parseToolArgs(toolCall.toolName, toolCall.args)
    }));
    const aiMessage = new AIMessage({
      content: text,
      tool_calls: toolCalls,
      additional_kwargs: {
        ...result.response?.assistantPhase ? { phase: result.response.assistantPhase } : {},
        ...result.response?.rawOutputItems ? { codex_output_items: result.response.rawOutputItems } : {}
      },
      response_metadata: {
        ...result.response?.assistantPhase ? { phase: result.response.assistantPhase } : {},
        ...result.response?.rawOutputItems ? { codex_output_items: result.response.rawOutputItems } : {}
      },
      usage_metadata: result.usage ? {
        input_tokens: result.usage.promptTokens,
        output_tokens: result.usage.completionTokens,
        total_tokens: result.usage.promptTokens + result.usage.completionTokens
      } : void 0
    });
    return {
      generations: [{
        text,
        message: aiMessage,
        generationInfo: {
          finishReason: result.finishReason,
          warnings: result.warnings
        }
      }],
      llmOutput: {
        finishReason: result.finishReason,
        usage: result.usage,
        warnings: result.warnings
      }
    };
  }
  async *_streamResponseChunks(messages, options, runManager) {
    const DEBUG_STREAM = process.env.DEBUG_CODEX_STREAM === "1";
    if (DEBUG_STREAM) console.error("[DEBUG_CODEX_STREAM] _streamResponseChunks() called");
    const model = createOpenAiAccountLanguageModel(this.model, this.reasoningEffort, this.sessionId, this.accessToken);
    const boundToolChoice = this.boundCallOptions?.tool_choice;
    if (DEBUG_STREAM) console.error("[DEBUG_CODEX_STREAM] Calling model.doStream()");
    const prompt = toLanguageModelPrompt(messages);
    const incremental = buildIncrementalPrompt(this.previousPrompt, prompt, this.previousResponseId);
    const result = await model.doStream({
      inputFormat: "prompt",
      mode: {
        type: "regular",
        tools: options.tools ?? this.boundTools ?? [],
        toolChoice: normalizeToolChoice(options.tool_choice ?? boundToolChoice)
      },
      prompt: incremental.prompt,
      ...incremental.previousResponseId ? { headers: { "x-n8n-previous-response-id": incremental.previousResponseId } } : {},
      abortSignal: options.signal
    });
    if (DEBUG_STREAM) console.error("[DEBUG_CODEX_STREAM] doStream() returned, getting reader");
    const reader = result.stream.getReader();
    const toolCallIndexes = /* @__PURE__ */ new Map();
    const getToolCallIndex = (toolCallId) => {
      const existing = toolCallIndexes.get(toolCallId);
      if (existing !== void 0) {
        return existing;
      }
      const next = toolCallIndexes.size;
      toolCallIndexes.set(toolCallId, next);
      return next;
    };
    try {
      if (DEBUG_STREAM) console.error("[DEBUG_CODEX_STREAM] Reading stream...");
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (DEBUG_STREAM) console.error("[DEBUG_CODEX_STREAM] Stream done");
          break;
        }
        if (DEBUG_STREAM) console.error("[DEBUG_CODEX_STREAM] Got part:", JSON.stringify(value).slice(0, 200));
        const part = value;
        if (part.type === "text-delta") {
          if (DEBUG_STREAM) console.error("[DEBUG_CODEX_STREAM] Yielding text-delta:", part.textDelta);
          const message = new AIMessageChunk({
            content: part.textDelta,
            additional_kwargs: {}
          });
          const chunk = new ChatGenerationChunk({
            message,
            text: part.textDelta
          });
          yield chunk;
          await runManager?.handleLLMNewToken(part.textDelta, { prompt: 0, completion: 0 }, void 0, void 0, void 0, { chunk });
        } else if (part.type === "tool-call-delta") {
          const index = getToolCallIndex(part.toolCallId);
          const message = new AIMessageChunk({
            content: "",
            tool_call_chunks: [{
              name: part.toolName,
              args: part.argsTextDelta,
              id: part.toolCallId,
              index,
              type: "tool_call_chunk"
            }],
            additional_kwargs: {
              tool_calls: [{
                id: part.toolCallId,
                index,
                function: {
                  name: part.toolName,
                  arguments: part.argsTextDelta
                }
              }]
            }
          });
          yield new ChatGenerationChunk({ message, text: "" });
        } else if (part.type === "tool-call") {
          const index = getToolCallIndex(part.toolCallId);
          const parsedArgs = parseToolArgs(part.toolName, part.args);
          const message = new AIMessageChunk({
            content: "",
            tool_calls: [{
              name: part.toolName,
              args: parsedArgs,
              id: part.toolCallId,
              type: "tool_call"
            }],
            tool_call_chunks: [{
              name: part.toolName,
              args: part.args,
              id: part.toolCallId,
              index,
              type: "tool_call_chunk"
            }],
            additional_kwargs: {
              tool_calls: [{
                id: part.toolCallId,
                index,
                function: {
                  name: part.toolName,
                  arguments: part.args
                }
              }]
            }
          });
          yield new ChatGenerationChunk({ message, text: "" });
        } else if (part.type === "finish") {
          this.previousPrompt = prompt;
          this.previousResponseId = part.providerMetadata?.responseId;
          if (DEBUG_STREAM) console.error("[DEBUG_CODEX_STREAM] Got finish:", part.finishReason);
          yield new ChatGenerationChunk({
            message: new AIMessageChunk({
              content: "",
              usage_metadata: {
                input_tokens: part.usage.promptTokens,
                output_tokens: part.usage.completionTokens,
                total_tokens: part.usage.promptTokens + part.usage.completionTokens
              },
              response_metadata: {
                finishReason: part.finishReason,
                ...part.providerMetadata?.assistantPhase ? { phase: part.providerMetadata.assistantPhase } : {},
                ...part.providerMetadata?.rawOutputItems ? { codex_output_items: part.providerMetadata.rawOutputItems } : {}
              },
              additional_kwargs: {
                ...part.providerMetadata?.assistantPhase ? { phase: part.providerMetadata.assistantPhase } : {},
                ...part.providerMetadata?.rawOutputItems ? { codex_output_items: part.providerMetadata.rawOutputItems } : {}
              }
            }),
            text: "",
            generationInfo: {
              finishReason: part.finishReason
            }
          });
          return;
        } else if (part.type === "error") {
          throw new Error(`Codex stream error: ${part.error}`);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
};
function buildIncrementalPrompt(previousPrompt, nextPrompt, previousResponseId) {
  if (!previousPrompt || !previousResponseId || previousPrompt.length >= nextPrompt.length) {
    return { prompt: nextPrompt };
  }
  const samePrefix = previousPrompt.every((message, index) => JSON.stringify(message) === JSON.stringify(nextPrompt[index]));
  if (!samePrefix) {
    return { prompt: nextPrompt };
  }
  let deltaPrompt = nextPrompt.slice(previousPrompt.length);
  while (deltaPrompt[0]?.role === "assistant") {
    deltaPrompt = deltaPrompt.slice(1);
  }
  if (deltaPrompt.length === 0) {
    return { prompt: nextPrompt };
  }
  return {
    prompt: deltaPrompt,
    previousResponseId
  };
}
function toLanguageModelPrompt(messages) {
  return messages.map((message) => {
    if (SystemMessage.isInstance(message)) {
      return {
        role: "system",
        content: stringifyMessageContent(message.content)
      };
    }
    if (HumanMessage.isInstance(message)) {
      return {
        role: "user",
        content: [{ type: "text", text: stringifyMessageContent(message.content) }]
      };
    }
    if (ToolMessage.isInstance(message)) {
      return {
        role: "tool",
        content: [{
          type: "tool-result",
          toolCallId: message.tool_call_id,
          toolName: message.name || "tool",
          result: stringifyMessageContent(message.content),
          isError: message.status === "error"
        }]
      };
    }
    if (AIMessage.isInstance(message)) {
      const content = [];
      const text = stringifyMessageContent(message.content);
      if (text) {
        content.push({ type: "text", text });
      }
      for (const toolCall of message.tool_calls ?? []) {
        content.push({
          type: "tool-call",
          toolCallId: toolCall.id || toolCall.name,
          toolName: toolCall.name,
          args: toolCall.args
        });
      }
      return {
        role: "assistant",
        content,
        ...extractAssistantPhase(message),
        ...extractRawOutputItems(message)
      };
    }
    return {
      role: "user",
      content: [{ type: "text", text: stringifyMessageContent(message.content) }]
    };
  });
}
function extractAssistantPhase(message) {
  const additionalPhase = message.additional_kwargs && typeof message.additional_kwargs === "object" ? message.additional_kwargs.phase : void 0;
  if (typeof additionalPhase === "string" && additionalPhase.trim()) {
    return { phase: additionalPhase.trim() };
  }
  const responsePhase = message.response_metadata && typeof message.response_metadata === "object" ? message.response_metadata.phase : void 0;
  if (typeof responsePhase === "string" && responsePhase.trim()) {
    return { phase: responsePhase.trim() };
  }
  return {};
}
function extractRawOutputItems(message) {
  const fromAdditional = message.additional_kwargs && typeof message.additional_kwargs === "object" ? message.additional_kwargs.codex_output_items : void 0;
  if (Array.isArray(fromAdditional)) {
    return { rawOutputItems: fromAdditional.filter((item) => Boolean(item) && typeof item === "object") };
  }
  const fromResponse = message.response_metadata && typeof message.response_metadata === "object" ? message.response_metadata.codex_output_items : void 0;
  if (Array.isArray(fromResponse)) {
    return { rawOutputItems: fromResponse.filter((item) => Boolean(item) && typeof item === "object") };
  }
  return {};
}
function stringifyMessageContent(content) {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content.map((part) => {
      if (typeof part === "string") {
        return part;
      }
      if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
        return part.text;
      }
      return "";
    }).join("\n").trim();
  }
  return content == null ? "" : String(content);
}
function normalizeToolChoice(toolChoice) {
  if (!toolChoice || toolChoice === "auto") {
    return void 0;
  }
  if (toolChoice === "any") {
    return { type: "required" };
  }
  if (toolChoice === "none") {
    return { type: "none" };
  }
  if (typeof toolChoice === "string") {
    return { type: "tool", toolName: toolChoice };
  }
  return void 0;
}
function parseToolArgs(toolName, args) {
  try {
    const parsed = JSON.parse(args);
    const normalized = parsed && typeof parsed === "object" ? parsed : {};
    if (toolName === "edit_file" && normalized.replace_all === null) {
      delete normalized.replace_all;
    }
    return normalized;
  } catch {
    return {};
  }
}
function toLanguageModelTool(input) {
  if (!input || typeof input !== "object") {
    return void 0;
  }
  const candidate = input;
  const name = typeof candidate.name === "string" ? candidate.name : void 0;
  if (!name) {
    return void 0;
  }
  const parameters = toJsonSchema(candidate.parameters ?? candidate.schema);
  return {
    type: "function",
    name,
    description: typeof candidate.description === "string" ? candidate.description : void 0,
    parameters,
    strict: true
  };
}
function toJsonSchema(schema) {
  const converted = schema && typeof schema === "object" ? langChainToJsonSchema(schema) : void 0;
  return normalizeJsonSchemaRoot(converted);
}
function normalizeJsonSchemaRoot(schema) {
  const normalized = normalizeJsonSchema(schema && typeof schema === "object" && !Array.isArray(schema) ? schema : { type: "object", properties: {}, additionalProperties: true });
  return normalized.type === "object" ? normalized : { type: "object", properties: {}, additionalProperties: true };
}
function normalizeJsonSchema(schema) {
  const normalized = { ...schema };
  if (normalized.type === "object") {
    normalized.properties = normalized.properties ?? {};
  }
  if (normalized.items && typeof normalized.items === "object" && !Array.isArray(normalized.items)) {
    normalized.items = normalizeJsonSchema(normalized.items);
  }
  if (Array.isArray(normalized.anyOf)) {
    normalized.anyOf = normalized.anyOf.map(
      (entry) => entry && typeof entry === "object" && !Array.isArray(entry) ? normalizeJsonSchema(entry) : entry
    );
  }
  if (normalized.properties) {
    normalized.properties = Object.fromEntries(
      Object.entries(normalized.properties).map(([key, value]) => [
        key,
        value && typeof value === "object" && !Array.isArray(value) ? normalizeJsonSchema(value) : value
      ])
    );
  }
  return normalized;
}

// src/services/agent-provider-runtime/copilot-account.ts
import fs4 from "node:fs";
import os3 from "node:os";
import path3 from "node:path";
var DEFAULT_COPILOT_API_BASE_URL = "https://api.individual.githubcopilot.com";
var COPILOT_TOKEN_URL = "https://api.github.com/copilot_internal/v2/token";
var COPILOT_USER_AGENT = "GitHubCopilotChat/0.26.7";
var COPILOT_EDITOR_VERSION = "vscode/1.96.2";
var COPILOT_EDITOR_PLUGIN_VERSION = "copilot-chat/0.26.7";
async function resolveCopilotApiToken(githubToken) {
  const cachePath = getCopilotTokenCachePath();
  const cached = readCachedCopilotToken(cachePath);
  if (cached && isCopilotTokenUsable(cached)) {
    return {
      token: cached.token,
      expiresAt: cached.expiresAt,
      baseUrl: deriveCopilotApiBaseUrlFromToken(cached.token) ?? DEFAULT_COPILOT_API_BASE_URL
    };
  }
  const response = await fetch(COPILOT_TOKEN_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${githubToken}`,
      "User-Agent": COPILOT_USER_AGENT
    }
  });
  if (!response.ok) {
    throw new Error(`Copilot token exchange failed: HTTP ${response.status}`);
  }
  const payload = parseCopilotTokenResponse(await response.json());
  writeCachedCopilotToken(cachePath, {
    token: payload.token,
    expiresAt: payload.expiresAt,
    updatedAt: Date.now()
  });
  return {
    token: payload.token,
    expiresAt: payload.expiresAt,
    baseUrl: deriveCopilotApiBaseUrlFromToken(payload.token) ?? DEFAULT_COPILOT_API_BASE_URL
  };
}
async function fetchGitHubCopilotModels(githubToken) {
  const runtimeAuth = await resolveCopilotApiToken(githubToken);
  const response = await fetch(`${runtimeAuth.baseUrl}/models`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${runtimeAuth.token}`,
      Accept: "application/json",
      "User-Agent": COPILOT_USER_AGENT,
      "Editor-Version": COPILOT_EDITOR_VERSION,
      "Editor-Plugin-Version": COPILOT_EDITOR_PLUGIN_VERSION
    }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const detail = body.trim();
    throw new Error(detail || `GitHub Copilot model discovery failed: HTTP ${response.status}`);
  }
  const payload = await response.json();
  const models = (payload.data ?? []).map((entry) => entry.id?.trim()).filter((entry) => Boolean(entry)).sort((a, b) => a.localeCompare(b));
  return [...new Set(models)];
}
function getCopilotTokenCachePath() {
  const override = readOptionalString3(process.env.N8N_COPILOT_TOKEN_CACHE_PATH);
  if (override) {
    return override;
  }
  return path3.join(os3.homedir(), ".n8n-as-code", "copilot-runtime-token.json");
}
function readCachedCopilotToken(cachePath) {
  try {
    const parsed = JSON.parse(fs4.readFileSync(cachePath, "utf8"));
    if (typeof parsed.token !== "string" || typeof parsed.expiresAt !== "number") {
      return void 0;
    }
    return {
      token: parsed.token,
      expiresAt: parsed.expiresAt,
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : 0
    };
  } catch {
    return void 0;
  }
}
function writeCachedCopilotToken(cachePath, token) {
  try {
    fs4.mkdirSync(path3.dirname(cachePath), { recursive: true });
    fs4.writeFileSync(cachePath, JSON.stringify(token, null, 2), { mode: 384 });
  } catch {
  }
}
function isCopilotTokenUsable(token) {
  return typeof token.token === "string" && token.token.length > 0 && token.expiresAt > Date.now() + 6e4;
}
function parseCopilotTokenResponse(payload) {
  const record = payload && typeof payload === "object" ? payload : {};
  const token = readOptionalString3(record.token);
  if (!token) {
    throw new Error("Copilot token exchange returned no token.");
  }
  const expiresAtSeconds = typeof record.expires_at === "number" ? record.expires_at : void 0;
  const expiresInSeconds = typeof record.expires_in === "number" ? record.expires_in : void 0;
  const expiresAt = expiresAtSeconds ? expiresAtSeconds * 1e3 : Date.now() + (expiresInSeconds ?? 300) * 1e3;
  return { token, expiresAt };
}
function deriveCopilotApiBaseUrlFromToken(token) {
  const payload = parseJwtPayload(token);
  const endpoints = payload?.endpoints;
  if (!endpoints || typeof endpoints !== "object") {
    return void 0;
  }
  const api = endpoints.api;
  return readOptionalString3(api);
}
function parseJwtPayload(token) {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return void 0;
    }
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return void 0;
  }
}
function readOptionalString3(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : void 0;
}

// src/services/agent-provider-runtime/create-langchain-model.ts
var COPILOT_DEFAULT_HEADERS = {
  "Editor-Version": "vscode/1.95.3",
  "Editor-Plugin-Version": "copilot-chat/0.22.4",
  "Openai-Intent": "conversation-panel"
};
var CopilotCompletionsModel = class extends ChatOpenAICompletions {
  _convertCompletionsDeltaToBaseMessageChunk(delta, rawResponse, defaultRole) {
    const chunk = super._convertCompletionsDeltaToBaseMessageChunk(delta, rawResponse, defaultRole);
    const reasoningText = delta?.reasoning_text;
    if (typeof reasoningText === "string" && reasoningText.length > 0) {
      chunk.additional_kwargs = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...chunk.additional_kwargs ?? {},
        reasoning_content: reasoningText
      };
    }
    return chunk;
  }
};
async function createLocalProviderLangChainModel(config) {
  switch (config.provider) {
    case "openai-oauth":
      return new ChatCodexOAuth({
        model: config.model,
        reasoningEffort: config.reasoningEffort,
        accessToken: config.apiKey
      });
    case "copilot-proxy": {
      if (!config.apiKey) {
        throw new Error("GitHub Copilot provider is not connected.");
      }
      const runtimeAuth = await resolveCopilotApiToken(config.apiKey);
      const isGeminiModel = /^gemini/i.test(config.model);
      const copilotFields = {
        apiKey: runtimeAuth.token,
        model: config.model,
        configuration: {
          baseURL: config.baseUrl || runtimeAuth.baseUrl || DEFAULT_COPILOT_API_BASE_URL,
          defaultHeaders: COPILOT_DEFAULT_HEADERS
        },
        ...isGeminiModel ? { modelKwargs: { thinking_budget: 1024 } } : {}
      };
      return new ChatOpenAI({
        ...copilotFields,
        completions: new CopilotCompletionsModel(copilotFields)
      });
    }
    case "minimax":
    case "minimax-token-plan":
      return new ChatAnthropic({
        apiKey: config.apiKey,
        model: config.model,
        anthropicApiUrl: config.baseUrl ?? "https://api.minimax.io/anthropic"
      });
  }
}

// src/services/agent-runtime-controller.ts
var ENVIRONMENT_DETAILS_BLOCK_PATTERN = /<environment_details>[\s\S]*?<\/environment_details>/gi;
var UNATTACHED_WORKFLOW_SCOPE_KEY = "__unattached__";
var DEFAULT_CONTEXT_WINDOW_TOKENS = 2e5;
var ACTIVE_WORKTREE_PATH_KEY = "n8n.agent.activeWorktreePath";
var ACTIVE_WORKTREE_PATH_BY_SESSION_KEY = "n8n.agent.activeWorktreePathBySession";
var INVALID_TOOL_CALL_RECOVERY_MARKER = "N8N_INVALID_TOOL_CALL_RECOVERY";
var N8N_AGENT_PROVIDER_SECRET_PREFIX = "n8n.agent.providerApiKey.";
function getAgentProviderSecretKey(provider) {
  return `${N8N_AGENT_PROVIDER_SECRET_PREFIX}${provider}`;
}
var AGENT_MODEL_PROVIDERS = Object.freeze([
  "anthropic",
  "openai",
  "google",
  "mistral",
  "openrouter",
  "openai-oauth",
  "copilot-proxy",
  "minimax",
  "minimax-token-plan",
  "openai-compatible"
]);
var AGENT_PROVIDER_DISPLAY_NAMES = {
  anthropic: "Claude API",
  openai: "OpenAI API",
  google: "Gemini API",
  mistral: "Mistral API",
  openrouter: "OpenRouter API",
  "openai-oauth": "OpenAI ChatGPT OAuth",
  "copilot-proxy": "GitHub Copilot OAuth",
  minimax: "MiniMax API",
  "minimax-token-plan": "MiniMax Token Plan",
  "openai-compatible": "OpenAI Compatible"
};
var AGENT_API_KEY_PROVIDERS = /* @__PURE__ */ new Set(["anthropic", "openai", "google", "mistral", "openrouter", "minimax", "minimax-token-plan"]);
function normalizeAgentProviderId2(provider) {
  const normalized = provider?.trim().toLowerCase();
  if (!normalized) return void 0;
  if (normalized === "claude") return "anthropic";
  if (normalized === "anthropic-proxy") return "anthropic";
  if (normalized === "gemini") return "google";
  return AGENT_MODEL_PROVIDERS.includes(normalized) ? normalized : void 0;
}
var LOCAL_AGENT_PROVIDER_REGISTRY = {
  AGENT_MODEL_PROVIDERS: [...AGENT_MODEL_PROVIDERS],
  normalizeProviderId: normalizeAgentProviderId2,
  providerRequiresApiKey: (provider) => AGENT_API_KEY_PROVIDERS.has(provider),
  getProviderDisplayName: (provider) => AGENT_PROVIDER_DISPLAY_NAMES[provider] || provider
};
function importRuntimeModule(specifier) {
  return import(specifier);
}
var WorkbenchSessionService = class {
  constructor(sessionsRoot) {
    this.sessionsRoot = sessionsRoot;
    this.recordsDir = path4.join(sessionsRoot, "records");
    this.displayDir = path4.join(sessionsRoot, "display");
    this.checkpointDir = path4.join(sessionsRoot, "checkpoints");
    fs5.mkdirSync(this.recordsDir, { recursive: true });
    fs5.mkdirSync(this.displayDir, { recursive: true });
    fs5.mkdirSync(this.checkpointDir, { recursive: true });
  }
  sessionsRoot;
  recordsDir;
  displayDir;
  checkpointDir;
  checkpointer;
  pendingDisplayWrites = /* @__PURE__ */ new Map();
  pendingRecordWrites = /* @__PURE__ */ new Map();
  flushTimer;
  flushPromise;
  list() {
    return this.readRecords().map((record) => {
      const display = this.readDisplaySession(record.id);
      return {
        id: record.id,
        title: display?.title || record.title,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        messageCount: Array.isArray(display?.displayThread) ? display.displayThread.length : 0
      };
    }).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }
  get(id) {
    const pending = this.pendingRecordWrites.get(id);
    if (pending) return pending;
    return this.readJson(this.recordPath(id));
  }
  getOrCreateForScope(scope, options) {
    const active = this.getActiveForScope(scope);
    return active || this.create({ title: options?.title, scope });
  }
  rotateForScope(scope, options) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    for (const record of this.listForScope(scope)) {
      this.writeRecord({ ...record, closedAt: record.closedAt || now, updatedAt: now });
    }
    return this.create({ title: options?.title, scope });
  }
  getActiveForScope(scope) {
    return this.listForScope(scope).filter((record) => !record.closedAt).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];
  }
  listForScope(scope) {
    return this.readRecords().filter((record) => record.scope?.kind === scope.kind && record.scope?.key === scope.key);
  }
  ensure(sessionId, options) {
    const existing = this.get(sessionId);
    if (existing) return existing;
    return this.create({ id: sessionId, title: options?.title, scope: options?.scope });
  }
  touch(sessionId, options) {
    const record = this.get(sessionId);
    if (!record) return void 0;
    const next = {
      ...record,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      ...options?.title ? { title: options.title } : {},
      ...options?.closed ? { closedAt: (/* @__PURE__ */ new Date()).toISOString() } : {}
    };
    this.writeRecord(next);
    const display = this.readDisplaySession(sessionId);
    if (display && options?.title) {
      this.writeDisplaySession({ ...display, title: options.title, updatedAt: next.updatedAt });
    }
    return next;
  }
  async delete(id) {
    if (this.flushPromise) {
      await this.flushPromise;
    }
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = void 0;
    }
    this.pendingRecordWrites.delete(id);
    this.pendingDisplayWrites.delete(id);
    if (this.pendingRecordWrites.size || this.pendingDisplayWrites.size) {
      await this.flushPendingWritesNow();
    }
    fs5.rmSync(this.recordPath(id), { force: true });
    fs5.rmSync(this.displayPath(id), { force: true });
    fs5.rmSync(this.sessionCheckpointDir(id), { recursive: true, force: true });
    await this.checkpointer?.deleteThread?.(id);
  }
  setCheckpointer(checkpointer) {
    this.checkpointer = checkpointer;
  }
  async resetRuntimeThread(sessionId) {
    await this.checkpointer?.deleteThread?.(sessionId);
    const record = this.get(sessionId);
    if (record?.restoredRuntimeCheckpointId) {
      const { restoredRuntimeCheckpointId: _unused, ...next } = record;
      this.writeRecord({ ...next, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    }
  }
  buildSessionConfig(sessionId) {
    const record = this.get(sessionId);
    const checkpointId = record?.restoredRuntimeCheckpointId;
    if (record && checkpointId) {
      const { restoredRuntimeCheckpointId: _unused, ...next } = record;
      this.writeRecord({ ...next, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    }
    return {
      configurable: {
        thread_id: sessionId,
        ...checkpointId ? { checkpoint_id: checkpointId } : {}
      }
    };
  }
  async listCheckpoints(sessionId) {
    const dir = this.sessionCheckpointDir(sessionId);
    if (!fs5.existsSync(dir)) return [];
    return fs5.readdirSync(dir).filter((file) => file.endsWith(".json")).map((file) => this.readJson(path4.join(dir, file))).filter((checkpoint) => Boolean(checkpoint)).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }
  async saveCheckpoint(sessionId, options = {}) {
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const display = this.readDisplaySession(sessionId);
    const runtimeCheckpointId = await this.getLatestRuntimeCheckpointId(sessionId);
    const checkpoint = {
      id: randomUUID2(),
      sessionId,
      createdAt,
      messageCount: Array.isArray(display?.displayThread) ? display.displayThread.length : 0,
      summary: options.summary,
      reason: options.reason,
      label: options.label,
      runtimeCheckpointId: options.runtimeCheckpointId ?? runtimeCheckpointId,
      payloadState: options.payloadState ?? (options.payloads ? { payloads: options.payloads } : void 0)
    };
    fs5.mkdirSync(this.sessionCheckpointDir(sessionId), { recursive: true });
    this.writeJson(this.checkpointPath(sessionId, checkpoint.id), checkpoint);
    return checkpoint;
  }
  async maybeSaveCheckpoint(sessionId, reason, options = {}) {
    if (reason !== "manual" && reason !== "auto" && reason !== "after-tool" && reason !== "after-compaction") {
      return void 0;
    }
    return this.saveCheckpoint(sessionId, { ...options, reason });
  }
  async restoreCheckpoint(sessionId, checkpointId) {
    const checkpoint = this.readJson(this.checkpointPath(sessionId, checkpointId));
    if (!checkpoint) {
      throw new Error(`Checkpoint not found: ${checkpointId}`);
    }
    const restoredAt = (/* @__PURE__ */ new Date()).toISOString();
    const warnings = [];
    if (checkpoint.runtimeCheckpointId) {
      const record = this.ensure(sessionId);
      this.writeRecord({
        ...record,
        restoredRuntimeCheckpointId: checkpoint.runtimeCheckpointId,
        updatedAt: restoredAt
      });
    } else {
      warnings.push("This checkpoint was created before a DeepAgentJS runtime checkpoint was available.");
    }
    this.writeJson(this.checkpointPath(sessionId, checkpointId), { ...checkpoint, restoredAt });
    return {
      sessionId,
      checkpointId,
      restoredAt,
      langGraphRestored: Boolean(checkpoint.runtimeCheckpointId),
      payloadState: checkpoint.payloadState,
      displayThreadRestored: false,
      warnings
    };
  }
  async deleteCheckpoint(sessionId, checkpointId) {
    fs5.rmSync(this.checkpointPath(sessionId, checkpointId), { force: true });
  }
  syncDisplayThread(sessionId, displayThread) {
    const record = this.ensure(sessionId);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const displaySession = {
      id: sessionId,
      title: record.title,
      createdAt: record.createdAt,
      updatedAt: now,
      displayThread
    };
    const nextRecord = { ...record, updatedAt: now };
    this.pendingDisplayWrites.set(sessionId, displaySession);
    this.pendingRecordWrites.set(sessionId, nextRecord);
    this.scheduleFlush();
  }
  clearDisplayThread(sessionId) {
    const display = this.readDisplaySession(sessionId);
    if (display) {
      this.pendingDisplayWrites.set(sessionId, { ...display, displayThread: [], updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
      this.scheduleFlush();
    }
  }
  setTitle(sessionId, title) {
    const record = this.ensure(sessionId, { title });
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.writeRecord({ ...record, title, updatedAt: now });
    const display = this.readDisplaySession(sessionId);
    if (display) {
      this.pendingDisplayWrites.set(sessionId, { ...display, title, updatedAt: now });
      this.scheduleFlush();
    }
  }
  readDisplaySession(sessionId) {
    if (!this.isNonEmptyString(sessionId)) return void 0;
    const pending = this.pendingDisplayWrites.get(sessionId);
    if (pending) return pending;
    return this.readJson(this.displayPath(sessionId));
  }
  async flushPendingWrites() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = void 0;
    }
    await this.flushPendingWritesNow();
  }
  create(options = {}) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const record = {
      id: options.id || randomUUID2(),
      title: options.title || "New conversation",
      createdAt: now,
      updatedAt: now,
      scope: options.scope
    };
    this.writeRecord(record);
    this.writeDisplaySession({ id: record.id, title: record.title, createdAt: now, updatedAt: now, displayThread: [] });
    return record;
  }
  readRecords() {
    if (!fs5.existsSync(this.recordsDir)) return [];
    return fs5.readdirSync(this.recordsDir).filter((file) => file.endsWith(".json") && !file.startsWith(".")).map((file) => this.readJson(path4.join(this.recordsDir, file))).map((record) => this.normalizeSessionRecord(record)).filter((record) => Boolean(record));
  }
  normalizeSessionRecord(record) {
    if (!record || typeof record !== "object") return void 0;
    const raw = record;
    if (!this.isNonEmptyString(raw.id)) return void 0;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return {
      id: raw.id,
      title: this.isNonEmptyString(raw.title) ? raw.title : "New conversation",
      createdAt: this.isNonEmptyString(raw.createdAt) ? raw.createdAt : now,
      updatedAt: this.isNonEmptyString(raw.updatedAt) ? raw.updatedAt : this.isNonEmptyString(raw.createdAt) ? raw.createdAt : now,
      scope: raw.scope,
      closedAt: raw.closedAt,
      restoredRuntimeCheckpointId: raw.restoredRuntimeCheckpointId
    };
  }
  writeRecord(record) {
    this.writeJson(this.recordPath(record.id), record);
  }
  async getLatestRuntimeCheckpointId(sessionId) {
    const config = { configurable: { thread_id: sessionId } };
    const tuple = await this.checkpointer?.getTuple?.(config).catch(() => void 0);
    const tupleCheckpointId = tuple?.checkpoint?.id || tuple?.config?.configurable?.checkpoint_id;
    if (typeof tupleCheckpointId === "string" && tupleCheckpointId) return tupleCheckpointId;
    const iterator = this.checkpointer?.list?.(config, { limit: 1 });
    if (!iterator) return void 0;
    try {
      for await (const checkpoint of iterator) {
        const checkpointId = checkpoint.checkpoint?.id || checkpoint.config?.configurable?.checkpoint_id;
        if (typeof checkpointId === "string" && checkpointId) return checkpointId;
        break;
      }
    } catch {
      return void 0;
    }
    return void 0;
  }
  writeDisplaySession(session) {
    this.writeJson(this.displayPath(session.id), session);
  }
  scheduleFlush() {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = void 0;
      void this.flushPendingWritesNow();
    }, 150);
  }
  async flushPendingWritesNow() {
    if (this.flushPromise) return this.flushPromise;
    this.flushPromise = (async () => {
      const displayWrites = [...this.pendingDisplayWrites.values()];
      const recordWrites = [...this.pendingRecordWrites.values()];
      this.pendingDisplayWrites.clear();
      this.pendingRecordWrites.clear();
      await Promise.all([
        ...displayWrites.map((session) => this.writeJsonAsync(this.displayPath(session.id), session)),
        ...recordWrites.map((record) => this.writeJsonAsync(this.recordPath(record.id), record))
      ]);
    })().finally(() => {
      this.flushPromise = void 0;
      if (this.pendingDisplayWrites.size || this.pendingRecordWrites.size) {
        this.scheduleFlush();
      }
    });
    return this.flushPromise;
  }
  recordPath(id) {
    return path4.join(this.recordsDir, `${this.safeId(id)}.json`);
  }
  displayPath(id) {
    return path4.join(this.displayDir, `${this.safeId(id)}.json`);
  }
  sessionCheckpointDir(sessionId) {
    return path4.join(this.checkpointDir, this.safeId(sessionId));
  }
  checkpointPath(sessionId, checkpointId) {
    return path4.join(this.sessionCheckpointDir(sessionId), `${this.safeId(checkpointId)}.json`);
  }
  safeId(value) {
    return value.replace(/[^a-zA-Z0-9._-]/g, "_");
  }
  isNonEmptyString(value) {
    return typeof value === "string" && value.length > 0;
  }
  readJson(filePath) {
    try {
      return JSON.parse(fs5.readFileSync(filePath, "utf8"));
    } catch {
      return void 0;
    }
  }
  writeJson(filePath, value) {
    fs5.mkdirSync(path4.dirname(filePath), { recursive: true });
    fs5.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}
`);
  }
  async writeJsonAsync(filePath, value) {
    await fs5.promises.mkdir(path4.dirname(filePath), { recursive: true });
    await fs5.promises.writeFile(filePath, `${JSON.stringify(value, null, 2)}
`, "utf8");
  }
};
var AgentRuntimeController = class {
  constructor(_context, outputChannel2) {
    this._context = _context;
    this.outputChannel = outputChannel2;
    this.workspaceSnapshots = new WorkspaceSnapshotService(_context.globalStorageUri.fsPath, (message) => {
      outputChannel2.appendLine(message);
    });
  }
  _context;
  outputChannel;
  activeRuns = /* @__PURE__ */ new Map();
  stoppedRuns = /* @__PURE__ */ new WeakSet();
  queuedPrompts = /* @__PURE__ */ new Map();
  cachedAgentHandle;
  sessionRuntimePromise;
  checkpointerPromise;
  workspaceSnapshots;
  async getWorkbenchState(input) {
    const scope = this.getSessionScope(input);
    const sessions = await this.getSessionRuntime();
    const activeRecord = input.sessionId ? sessions.service.ensure(input.sessionId, { title: this.getDefaultSessionTitle(input.workflowName) }) : sessions.service.getActiveForScope(scope) || sessions.service.getOrCreateForScope(scope, {
      title: this.getDefaultSessionTitle(input.workflowName)
    });
    const session = await this.buildSessionState(activeRecord.id, input);
    const workflowContext = session.workflowContext;
    const nodeContexts = session.nodeContexts.length ? session.nodeContexts : this.normalizeNodeContexts(input.nodeContexts || input.nodeContext);
    const providerConfig = await this.describeProviderRuntimeConfig();
    const reasoningCapability = getReasoningCapability(providerConfig.provider, providerConfig.model);
    return {
      workflow: {
        id: workflowContext?.id,
        name: workflowContext?.name,
        filename: workflowContext?.filename
      },
      workflowContext,
      provider: providerConfig.provider,
      model: providerConfig.model,
      baseUrl: providerConfig.baseUrl,
      reasoningEffort: providerConfig.reasoningEffort,
      supportsReasoningEffort: reasoningCapability.supported,
      currentNodeContext: nodeContexts[0],
      currentNodeContexts: nodeContexts,
      activeSessionId: activeRecord.id,
      sessions: await this.listSessionSummaries(scope, activeRecord.id),
      session,
      isRunning: this.activeRuns.has(activeRecord.id),
      availableWorktrees: []
    };
  }
  async createSession(input) {
    const workflow = this.getInputWorkflowContext(input);
    const scope = workflow ? this.getSessionScope(input) : this.getUnattachedSessionScope();
    const sessions = await this.getSessionRuntime();
    const record = sessions.service.rotateForScope(scope, {
      title: this.getDefaultSessionTitle(workflow?.name)
    });
    if (workflow) {
      this.writeSessionEntries(sessions.service, record.id, this.withWorkflowContext([], workflow));
      return this.getWorkbenchState({ ...input, sessionId: record.id, nodeContext: void 0, nodeContexts: void 0 });
    }
    return this.getWorkbenchState({ ...input, workflowId: void 0, workflowName: void 0, workflowFilename: void 0, workflowFilePath: void 0, nodeContext: void 0, nodeContexts: void 0, sessionId: record.id });
  }
  getActiveWorktreePath(sessionId) {
    const legacyPath = this._context.workspaceState.get(ACTIVE_WORKTREE_PATH_KEY);
    if (sessionId) {
      const sessionPath = this.readActiveWorktreePathsBySession()[sessionId];
      if (sessionPath === null) return void 0;
      return sessionPath ?? legacyPath;
    }
    return legacyPath;
  }
  async setActiveWorktreePath(worktreePath, sessionId) {
    if (sessionId) {
      const bySession = this.readActiveWorktreePathsBySession();
      if (worktreePath) {
        bySession[sessionId] = worktreePath;
      } else {
        bySession[sessionId] = null;
      }
      await this._context.workspaceState.update(ACTIVE_WORKTREE_PATH_BY_SESSION_KEY, bySession);
      return;
    }
    if (worktreePath) {
      await this._context.workspaceState.update(ACTIVE_WORKTREE_PATH_KEY, worktreePath);
    } else {
      await this._context.workspaceState.update(ACTIVE_WORKTREE_PATH_KEY, void 0);
    }
  }
  async clearActiveWorktreePath(worktreePath) {
    const bySession = this.readActiveWorktreePathsBySession();
    let changed = false;
    for (const [sessionId, activeWorktreePath] of Object.entries(bySession)) {
      if (activeWorktreePath === worktreePath) {
        bySession[sessionId] = null;
        changed = true;
      }
    }
    if (changed) {
      await this._context.workspaceState.update(ACTIVE_WORKTREE_PATH_BY_SESSION_KEY, bySession);
    }
    if (this._context.workspaceState.get(ACTIVE_WORKTREE_PATH_KEY) === worktreePath) {
      await this._context.workspaceState.update(ACTIVE_WORKTREE_PATH_KEY, void 0);
    }
  }
  async deleteActiveWorktreePathForSession(sessionId) {
    const bySession = this.readActiveWorktreePathsBySession();
    if (!Object.prototype.hasOwnProperty.call(bySession, sessionId)) return;
    delete bySession[sessionId];
    await this._context.workspaceState.update(ACTIVE_WORKTREE_PATH_BY_SESSION_KEY, bySession);
  }
  readActiveWorktreePathsBySession() {
    const value = this._context.workspaceState.get(ACTIVE_WORKTREE_PATH_BY_SESSION_KEY);
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter((entry) => entry[1] === null || typeof entry[1] === "string" && entry[1].trim().length > 0));
  }
  async getLatestSessionId() {
    const sessions = await this.getSessionRuntime();
    return [...sessions.service.list()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0]?.id;
  }
  async getLatestSessionIdForWorkflow(workflow) {
    const sessions = await this.getSessionRuntime();
    const summaries = sessions.service.list();
    let latest;
    for (const summary of summaries) {
      const record = sessions.service.get(summary.id);
      const context = this.getLatestWorkflowContext(this.readSessionEntries(sessions.service, summary.id), record);
      if (!context || !this.workflowContextsMatch(context, workflow)) continue;
      if (!latest || summary.updatedAt.localeCompare(latest.updatedAt) > 0) {
        latest = { id: summary.id, updatedAt: summary.updatedAt };
      }
    }
    return latest?.id;
  }
  async attachSessionToWorkflowIfUnattached(sessionId, workflow, input) {
    if (!sessionId) return void 0;
    const sessions = await this.getSessionRuntime();
    const record = sessions.service.get(sessionId);
    if (!record) return void 0;
    const entries = this.readSessionEntries(sessions.service, sessionId);
    if (!entries.some((entry) => entry.kind === "user-message" || entry.kind === "assistant-body" || entry.kind === "operation")) return void 0;
    const existingContext = this.getLatestWorkflowContext(entries, record);
    if (existingContext) return void 0;
    const name = workflow.name?.trim() || workflow.id || workflow.filename || "Workflow";
    this.writeSessionEntries(sessions.service, sessionId, this.withWorkflowContext(entries, { ...workflow, name }));
    sessions.service.touch(sessionId, { title: record.title === "New conversation" ? this.getDefaultSessionTitle(name) : record.title });
    await this.getWorkbenchState({ ...input, sessionId });
    return sessionId;
  }
  async createSessionForWorkflow(workflow, input) {
    const name = workflow.name?.trim() || workflow.id || workflow.filename || "Workflow";
    const sessions = await this.getSessionRuntime();
    const record = sessions.service.rotateForScope(this.getUnattachedSessionScope(), {
      title: this.getDefaultSessionTitle(name)
    });
    this.writeSessionEntries(sessions.service, record.id, this.withWorkflowContext([], { ...workflow, name }));
    await this.getWorkbenchState({ ...input, sessionId: record.id });
    return record.id;
  }
  async selectSession(sessionId, input) {
    const sessions = await this.getSessionRuntime();
    sessions.service.ensure(sessionId);
    return this.getWorkbenchState({ ...input, sessionId });
  }
  async renameSession(sessionId, title, input) {
    const trimmed = title.trim();
    if (!trimmed) {
      throw new Error("Session title is required.");
    }
    const sessions = await this.getSessionRuntime();
    sessions.service.touch(sessionId, { title: trimmed });
    sessions.service.setTitle(sessionId, trimmed);
    return this.getWorkbenchState(input);
  }
  async deleteSession(sessionId, input) {
    const scope = this.getSessionScope(input);
    const sessions = await this.getSessionRuntime();
    const active = sessions.service.getActiveForScope(scope)?.id;
    const deletedSelectedSession = input.sessionId === sessionId;
    await sessions.service.delete(sessionId);
    await this.deleteActiveWorktreePathForSession(sessionId);
    if (active === sessionId) {
      sessions.service.getOrCreateForScope(scope, { title: this.getDefaultSessionTitle(input.workflowName) });
    }
    return this.getWorkbenchState(deletedSelectedSession ? { ...input, sessionId: void 0 } : input);
  }
  async attachSessionToCurrentWorkflow(sessionId, input) {
    if (!input.workflowId) {
      throw new Error("Open a workflow before attaching a session.");
    }
    return this.setWorkflowContext(sessionId, {
      id: input.workflowId,
      name: input.workflowName || input.workflowId,
      filename: input.workflowFilename,
      filePath: input.workflowFilePath
    }, input);
  }
  async detachSession(sessionId, input) {
    return this.clearWorkflowContext(sessionId, input);
  }
  async setWorkflowContext(sessionId, workflow, input) {
    const name = workflow.name?.trim() || workflow.id || workflow.filename || "Workflow";
    const sessions = await this.getSessionRuntime();
    sessions.service.ensure(sessionId);
    const entries = this.withWorkflowContext(this.readSessionEntries(sessions.service, sessionId), {
      ...workflow,
      name
    });
    this.writeSessionEntries(sessions.service, sessionId, entries);
    return this.getWorkbenchState({ ...input, sessionId });
  }
  async clearWorkflowContext(sessionId, input) {
    const sessions = await this.getSessionRuntime();
    sessions.service.ensure(sessionId);
    this.writeSessionEntries(sessions.service, sessionId, [
      ...this.readSessionEntries(sessions.service, sessionId),
      { kind: "workflow-context", id: randomUUID2(), timestamp: Date.now(), action: "clear" },
      { kind: "node-context", id: randomUUID2(), timestamp: Date.now(), nodes: [] }
    ]);
    return this.getWorkbenchState({ ...input, sessionId, workflowId: void 0, workflowName: void 0, workflowFilename: void 0, workflowFilePath: void 0, nodeContext: void 0, nodeContexts: void 0 });
  }
  async setNodeContexts(sessionId, nodes, input) {
    const sessions = await this.getSessionRuntime();
    sessions.service.ensure(sessionId);
    const workflowContext = this.getLatestWorkflowContext(this.readSessionEntries(sessions.service, sessionId), sessions.service.get(sessionId));
    if (!workflowContext) {
      return this.getWorkbenchState({ ...input, sessionId, nodeContext: void 0, nodeContexts: void 0 });
    }
    this.writeSessionEntries(sessions.service, sessionId, [
      ...this.readSessionEntries(sessions.service, sessionId),
      { kind: "node-context", id: randomUUID2(), timestamp: Date.now(), nodes: this.normalizeNodeContexts(nodes) }
    ]);
    return this.getWorkbenchState({ ...input, sessionId });
  }
  async saveCheckpoint(sessionId, input) {
    const sessions = await this.getSessionRuntime();
    const surface = this.buildCheckpointSurfacePayload(sessions.service, sessionId);
    const label = surface.selectedWorkflow ? "Before workflow edit" : "Manual checkpoint";
    await this.saveWorkbenchCheckpoint(sessions.service, sessionId, {
      reason: "manual",
      label,
      summary: this.buildCheckpointSummary(surface),
      payloads: {
        surface
      }
    });
    const entries = this.readSessionEntries(sessions.service, sessionId);
    this.writeSessionEntries(sessions.service, sessionId, [
      ...entries,
      this.createSystemNotice(`Checkpoint saved: ${label}.`)
    ]);
    return this.getWorkbenchState({ ...input, sessionId });
  }
  async rewindToUserMessage(sessionId, messageId, input) {
    if (this.activeRuns.has(sessionId)) {
      throw new Error("An agent run is already active for this conversation.");
    }
    const sessions = await this.getSessionRuntime();
    const entries = this.readSessionEntries(sessions.service, sessionId);
    const targetIndex = entries.findIndex((entry) => entry.kind === "user-message" && entry.id === messageId);
    const target = targetIndex >= 0 ? entries[targetIndex] : void 0;
    if (!target || target.kind !== "user-message") {
      throw new Error("Cannot rewind: user message not found.");
    }
    const checkpointId = target.checkpoint?.workbenchCheckpointId;
    if (!checkpointId) {
      throw new Error("Cannot rewind: this message does not have a checkpoint.");
    }
    const result = await sessions.service.restoreCheckpoint(sessionId, checkpointId);
    await this.workspaceSnapshots.restore(input.workspaceRoot, target.checkpoint?.workspaceSnapshotId);
    const payloads = this.extractCheckpointPayloads(result);
    const surface = payloads.surface;
    if (this.isWorkbenchSurfacePayload(surface)) {
      const title = surface.title.trim() || sessions.service.get(sessionId)?.title || this.getDefaultSessionTitle(input.workflowName);
      sessions.service.touch(sessionId, { title });
      sessions.service.setTitle(sessionId, title);
      this.writeSessionEntries(sessions.service, sessionId, this.normalizeEntries(surface.displayThread));
    } else {
      this.writeSessionEntries(sessions.service, sessionId, entries.slice(0, targetIndex));
    }
    if (!result.langGraphRestored) {
      await sessions.service.resetRuntimeThread(sessionId);
    }
    return {
      state: await this.getWorkbenchState({ ...input, sessionId }),
      prompt: target.text
    };
  }
  async restoreCheckpoint(sessionId, checkpointId, input) {
    if (this.activeRuns.has(sessionId)) {
      throw new Error("An agent run is already active for this conversation.");
    }
    const sessions = await this.getSessionRuntime();
    const result = await sessions.service.restoreCheckpoint(sessionId, checkpointId);
    const payloads = this.extractCheckpointPayloads(result);
    const notices = [];
    const surface = payloads.surface;
    if (this.isWorkbenchSurfacePayload(surface)) {
      const entries = this.normalizeEntries(surface.displayThread);
      const title = surface.title.trim() || sessions.service.get(sessionId)?.title || this.getDefaultSessionTitle(input.workflowName);
      sessions.service.touch(sessionId, { title });
      sessions.service.setTitle(sessionId, title);
      this.writeSessionEntries(sessions.service, sessionId, [
        ...entries,
        this.createSystemNotice(`Restored checkpoint ${checkpointId}.`)
      ]);
    } else {
      notices.push(this.createSystemNotice(`Restored checkpoint ${checkpointId}. Runtime state was restored, but this checkpoint does not include Workbench surface state, so the visible conversation was kept.`));
    }
    for (const warning of result.warnings || []) {
      const message = typeof warning === "string" ? warning : String(warning);
      this.outputChannel.appendLine(`[n8n-agent] Checkpoint restore warning: ${message}`);
      notices.push(this.createSystemNotice(`Checkpoint warning: ${message}`));
    }
    if (notices.length) {
      this.writeSessionEntries(sessions.service, sessionId, [
        ...this.readSessionEntries(sessions.service, sessionId),
        ...notices
      ]);
    }
    return this.getWorkbenchState({ ...input, sessionId });
  }
  async deleteCheckpoint(sessionId, checkpointId, input) {
    const sessions = await this.getSessionRuntime();
    await sessions.service.deleteCheckpoint(sessionId, checkpointId);
    if ((input.sessionId || sessionId) === sessionId) {
      this.writeSessionEntries(sessions.service, sessionId, [
        ...this.readSessionEntries(sessions.service, sessionId),
        this.createSystemNotice("Checkpoint deleted.")
      ]);
    }
    return this.getWorkbenchState({ ...input, sessionId });
  }
  async compactSession(sessionId, input) {
    if (this.activeRuns.has(sessionId)) {
      throw new Error("An agent run is already active for this conversation.");
    }
    const sessions = await this.getSessionRuntime();
    const abortController = new AbortController();
    this.activeRuns.set(sessionId, { abortController, sessionId });
    try {
      let entries = this.readSessionEntries(sessions.service, sessionId);
      const event = await this.summarizeSessionForCompaction(sessionId, input, entries, abortController.signal);
      this.writeSessionEntries(sessions.service, sessionId, [
        ...this.withoutContextUsage(entries),
        { kind: "compaction", id: randomUUID2(), timestamp: Date.now(), event }
      ]);
      await sessions.service.resetRuntimeThread(sessionId);
      await this.saveWorkbenchCheckpoint(sessions.service, sessionId, {
        reason: "after-compaction",
        label: "After context compaction",
        summary: "Workbench checkpoint after context compaction",
        payloads: {
          surface: this.buildCheckpointSurfacePayload(sessions.service, sessionId)
        }
      }).catch((error) => {
        this.outputChannel.appendLine(`[n8n-agent] Manual compaction checkpoint failed: ${error?.message || String(error)}`);
      });
      return this.getWorkbenchState({ ...input, sessionId });
    } finally {
      const activeRun = this.activeRuns.get(sessionId);
      if (activeRun?.abortController === abortController) {
        this.activeRuns.delete(sessionId);
      }
    }
  }
  async sendPrompt(input, postMessage) {
    const sessions = await this.getSessionRuntime();
    const scope = this.getSessionScope(input);
    const activeRecord = input.sessionId ? sessions.service.ensure(input.sessionId, { title: this.getDefaultSessionTitle(input.workflowName) }) : sessions.service.getActiveForScope(scope) || sessions.service.getOrCreateForScope(scope, {
      title: this.getDefaultSessionTitle(input.workflowName)
    });
    const targetSessionId = activeRecord.id;
    input.sessionId = targetSessionId;
    const activeWorktreePath = this.getActiveWorktreePath(targetSessionId);
    if (activeWorktreePath) {
      input.workspaceRoot = activeWorktreePath;
      input.worktreePath = activeWorktreePath;
    }
    const activeRun = this.activeRuns.get(targetSessionId);
    if (activeRun) {
      if (activeRun.visibleDone) {
        const waitMs = activeRun.visibleFinalAt ? Date.now() - activeRun.visibleFinalAt : void 0;
        this.outputChannel.appendLine(`[n8n-agent-debug] prompt queued while DeepAgents finalizes sessionId=${targetSessionId} waitAfterVisibleMs=${waitMs ?? "unknown"} reason=pending`);
        return this.queuePrompt({ ...input, sessionId: targetSessionId }, postMessage, "pending");
      }
      await postMessage({
        type: "agent.error",
        message: "An agent run is already in progress. Stop it before sending another prompt."
      });
      return { workflowChanged: false };
    }
    const prompt = input.prompt.trim();
    if (!prompt) {
      return { workflowChanged: false };
    }
    const sessionContext = await this.buildSessionState(targetSessionId, input);
    const promptWorkflowContext = sessionContext.workflowContext;
    const promptNodeContexts = sessionContext.nodeContexts.length ? sessionContext.nodeContexts : this.normalizeNodeContexts(input.nodeContexts || input.nodeContext);
    const promptInput = {
      ...input,
      sessionId: targetSessionId,
      workflowId: promptWorkflowContext?.id,
      workflowName: promptWorkflowContext?.name,
      workflowFilename: promptWorkflowContext?.filename,
      workflowFilePath: promptWorkflowContext?.filePath || input.workflowFilePath,
      nodeContext: promptNodeContexts[0],
      nodeContexts: promptNodeContexts
    };
    const abortController = new AbortController();
    const nextActiveRun = { abortController, sessionId: targetSessionId, runStartedAt: Date.now() };
    this.activeRuns.set(targetSessionId, nextActiveRun);
    const derivedTitle = activeRecord.title === "New conversation" ? sessions.deriveSessionTitle(prompt, this.getDefaultSessionTitle(input.workflowName)) : activeRecord.title;
    sessions.service.touch(targetSessionId, { title: derivedTitle });
    sessions.service.setTitle(targetSessionId, derivedTitle);
    let entries = this.withoutContextUsage(this.readSessionEntries(sessions.service, targetSessionId));
    const beforeMessageCheckpoint = await this.saveBeforeUserMessageCheckpoint(sessions.service, targetSessionId, entries, prompt, input.workspaceRoot);
    entries = [...entries, {
      kind: "user-message",
      id: randomUUID2(),
      text: prompt,
      timestamp: Date.now(),
      checkpoint: {
        workbenchCheckpointId: beforeMessageCheckpoint.checkpoint.id,
        runtimeCheckpointId: beforeMessageCheckpoint.checkpoint.runtimeCheckpointId,
        workspaceSnapshotId: beforeMessageCheckpoint.workspaceSnapshotId
      }
    }];
    this.writeSessionEntries(sessions.service, targetSessionId, entries);
    await postMessage({ type: "agent.state", state: await this.getWorkbenchState({ ...input, sessionId: targetSessionId }) });
    await postMessage({ type: "agent.status", status: "running", detail: "Preparing n8n agent runtime..." });
    await postMessage({ type: "agent.streamEvent", event: { type: "start", sessionId: targetSessionId, message: prompt } });
    let result = { workflowChanged: false };
    let queuedPrompt;
    let postedIdle = false;
    try {
      const runResult = await this.runInitialAgentTurn(promptInput, entries, postMessage, abortController.signal);
      entries = runResult.entries;
      this.writeSessionEntries(sessions.service, targetSessionId, entries);
      const currentActiveRun = this.activeRuns.get(targetSessionId);
      if (!this.queuedPrompts.has(targetSessionId) && currentActiveRun?.abortController === abortController) {
        this.activeRuns.delete(targetSessionId);
        this.outputChannel.appendLine(`[n8n-agent-debug] agent host idle sessionId=${targetSessionId}`);
        await postMessage({ type: "agent.status", status: "idle" });
        postedIdle = true;
      }
      if (runResult.workflowChanged) {
        const inferredWorkflow = runResult.workflowContext || await this.inferWorkflowContextFromWorkspace(input.workspaceRoot);
        if (inferredWorkflow) {
          const shouldUpdateWorkflowContext = !promptWorkflowContext || !this.workflowContextsMatch(promptWorkflowContext, inferredWorkflow);
          if (shouldUpdateWorkflowContext) {
            entries = this.withWorkflowContext(entries, inferredWorkflow);
            this.writeSessionEntries(sessions.service, targetSessionId, entries);
          }
        }
      }
      await postMessage({ type: "agent.state", state: await this.getWorkbenchState({ ...input, sessionId: targetSessionId }) });
      await postMessage({ type: "agent.done" });
      this.outputChannel.appendLine(`[n8n-agent-debug] agent host done sessionId=${targetSessionId} queuedPrompt=${String(Boolean(this.queuedPrompts.has(targetSessionId)))}`);
      result = { workflowChanged: runResult.workflowChanged, workflowContext: runResult.workflowContext };
    } catch (error) {
      const message = error?.message || String(error);
      const currentActiveRun = this.activeRuns.get(targetSessionId);
      if (this.stoppedRuns.has(abortController)) {
        this.outputChannel.appendLine(`[n8n-agent-debug] agent runtime stopped sessionId=${targetSessionId}`);
        this.appendRunStoppedNotice(sessions.service, targetSessionId);
        this.queuedPrompts.delete(targetSessionId);
        result = { workflowChanged: false };
      } else if (currentActiveRun?.abortController === abortController && currentActiveRun.abortReason === "steer") {
        this.outputChannel.appendLine(`[n8n-agent-debug] agent runtime steered sessionId=${targetSessionId}`);
        const latestEntries = this.withoutContextUsage(this.readSessionEntries(sessions.service, targetSessionId));
        this.writeSessionEntries(sessions.service, targetSessionId, [
          ...this.finalizePendingOperations(latestEntries, "done"),
          this.createSystemNotice("Run steered by a newer message.")
        ]);
        await postMessage({ type: "agent.state", state: await this.getWorkbenchState({ ...input, sessionId: targetSessionId }) });
        result = { workflowChanged: false };
      } else {
        this.outputChannel.appendLine(`[n8n-agent] Run failed: ${message}`);
        const latestEntries = this.withoutContextUsage(this.readSessionEntries(sessions.service, targetSessionId));
        const failedEntries = [
          ...this.finalizePendingOperations(latestEntries, "error"),
          this.createSystemNotice(`Run failed: ${message}`)
        ];
        this.writeSessionEntries(sessions.service, targetSessionId, failedEntries);
        await postMessage({ type: "agent.streamEvent", event: { type: "error", error: message } });
        await postMessage({ type: "agent.error", message });
        await postMessage({ type: "agent.state", state: await this.getWorkbenchState({ ...input, sessionId: targetSessionId }) });
        result = { workflowChanged: false };
      }
    } finally {
      const currentActiveRun = this.activeRuns.get(targetSessionId);
      if (currentActiveRun?.abortController === abortController) {
        this.activeRuns.delete(targetSessionId);
      }
      queuedPrompt = this.queuedPrompts.get(targetSessionId);
      if (queuedPrompt) {
        this.queuedPrompts.delete(targetSessionId);
      } else if (!postedIdle) {
        await postMessage({ type: "agent.status", status: "idle" });
      }
    }
    if (queuedPrompt) {
      const queuedResult = await this.sendPrompt(queuedPrompt.input, postMessage);
      return { workflowChanged: result.workflowChanged || queuedResult.workflowChanged, workflowContext: queuedResult.workflowContext || result.workflowContext };
    }
    return result;
  }
  async queuePrompt(input, postMessage, reason = "pending") {
    const prompt = input.prompt.trim();
    if (!prompt) {
      return { workflowChanged: false };
    }
    const targetSessionId = input.sessionId;
    if (!targetSessionId) {
      return this.sendPrompt(input, postMessage);
    }
    const activeRun = this.activeRuns.get(targetSessionId);
    if (!activeRun) {
      return this.sendPrompt(input, postMessage);
    }
    this.queuedPrompts.set(targetSessionId, { input: { ...input, prompt }, reason });
    const waitMs = activeRun.visibleFinalAt ? Date.now() - activeRun.visibleFinalAt : void 0;
    this.outputChannel.appendLine(`[n8n-agent-debug] queuePrompt accepted sessionId=${targetSessionId} reason=${reason} visibleDone=${String(Boolean(activeRun.visibleDone))} waitAfterVisibleMs=${waitMs ?? "unknown"}`);
    if (reason === "steer") {
      activeRun.abortReason = "steer";
      await postMessage({ type: "agent.status", status: "stopping", detail: "Steering current run..." });
      activeRun.abortController.abort();
    }
    return { workflowChanged: false };
  }
  async stop(postMessage, sessionId) {
    let activeRun;
    if (sessionId) {
      activeRun = this.activeRuns.get(sessionId);
    } else {
      activeRun = this.activeRuns.values().next().value;
    }
    if (!activeRun) {
      await postMessage({ type: "agent.status", status: "idle" });
      return;
    }
    const runSessionId = activeRun.sessionId;
    this.queuedPrompts.delete(runSessionId);
    activeRun.abortReason = "stop";
    this.stoppedRuns.add(activeRun.abortController);
    activeRun.abortController.abort();
  }
  dispose() {
    for (const run of this.activeRuns.values()) {
      run.abortController.abort();
    }
    this.activeRuns.clear();
    this.queuedPrompts.clear();
    void this.flushSessionWrites();
  }
  async runInitialAgentTurn(input, initialEntries, postMessage, signal) {
    await this.throwIfAborted(signal);
    const providerRegistry = await this.loadAgentProviderRegistry().catch((error) => ({ error: error?.message || String(error) }));
    if ("error" in providerRegistry) {
      return {
        entries: [
          ...initialEntries,
          this.createSystemNotice(await this.buildScaffoldResponse(input, providerRegistry.error))
        ],
        workflowChanged: false
      };
    }
    const providerConfig = await this.getProviderRuntimeConfig(providerRegistry);
    if (!providerConfig.ready) {
      return {
        entries: [
          ...initialEntries,
          this.createSystemNotice(await this.buildScaffoldResponse(input, providerConfig.reason))
        ],
        workflowChanged: false
      };
    }
    const setupStartedAt = Date.now();
    const handle = await this.getDeepAgentHandle(providerConfig, input);
    this.outputChannel.appendLine(`[n8n-agent-debug] agent handle ready sessionId=${input.sessionId || "none"} provider=${providerConfig.provider} model=${providerConfig.model || "default"} elapsedMs=${Date.now() - setupStartedAt}`);
    const sessions = await this.getSessionRuntime();
    sessions.service.setCheckpointer(handle.checkpointer);
    const agent = handle.agent;
    const promptStartedAt = Date.now();
    const invocationPrompt = await this.buildInvocationPrompt(input);
    const nodeContextCount = this.normalizeNodeContexts(input.nodeContexts || input.nodeContext).length;
    this.outputChannel.appendLine(`[n8n-agent-debug] agent prompt built sessionId=${input.sessionId || "none"} elapsedMs=${Date.now() - promptStartedAt} promptChars=${invocationPrompt.length} nodeContexts=${nodeContextCount} workflowAttached=${String(Boolean(input.workflowId))}`);
    const messages = [{ role: "user", content: invocationPrompt }];
    const contextWindowTokens = await this.resolveContextWindow(providerConfig.provider, providerConfig.model, providerConfig.apiKey, providerConfig.baseUrl);
    const config = {
      ...sessions.service.buildSessionConfig(input.sessionId || ""),
      signal
    };
    let entries = [...initialEntries];
    if (typeof agent.streamEvents === "function") {
      const streamStartedAt = Date.now();
      this.outputChannel.appendLine(`[n8n-agent-debug] deepagents.v3.streamEvents start sessionId=${input.sessionId || "none"} promptChars=${invocationPrompt.length}`);
      const run = await this.raceAbort(Promise.resolve(agent.streamEvents({ messages }, { ...config, version: "v3" })), signal);
      this.outputChannel.appendLine(`[n8n-agent-debug] deepagents.v3.streamEvents resolved sessionId=${input.sessionId || "none"} elapsedMs=${Date.now() - streamStartedAt}`);
      if (!this.isDeepAgentV3Run(run)) {
        throw new Error("DeepAgents v3 stream did not return a run stream.");
      }
      return await this.raceAbort(this.consumeDeepAgentV3Run(run, input, entries, sessions.service, postMessage, signal, contextWindowTokens), signal);
    }
    const result = await this.raceAbort(Promise.resolve(agent.invoke({ messages }, config)), signal);
    const response = this.extractAgentText(result);
    const finalEvent = {
      type: "final",
      sessionId: input.sessionId || "",
      response,
      finalState: "done"
    };
    entries = this.applyStreamEvent(entries, finalEvent);
    await postMessage({ type: "agent.streamEvent", event: finalEvent });
    return { entries, workflowChanged: false };
  }
  isDeepAgentV3Run(value) {
    return Boolean(value && typeof value === "object" && "output" in Object(value) && Symbol.asyncIterator in Object(value));
  }
  isAsyncIterable(value) {
    return Boolean(value && typeof value === "object" && Symbol.asyncIterator in Object(value));
  }
  async consumeDeepAgentV3Run(run, input, initialEntries, service, postMessage, signal, contextWindowTokens) {
    const runStartedAt = Date.now();
    const accumulator = this.createStreamAccumulator();
    let entries = [...initialEntries];
    let fileModificationDetected = false;
    const writtenWorkflowPaths = /* @__PURE__ */ new Set();
    let authoritativeFinalEmitted = false;
    const loggedProjectionEvents = /* @__PURE__ */ new Set();
    this.outputChannel.appendLine(`[n8n-agent-debug] deepagents.v3.run started sessionId=${input.sessionId || "none"} workflowId=${input.workflowId || "none"}`);
    const syncEntries = () => {
      if (!input.sessionId) return;
      this.writeSessionEntries(service, input.sessionId, entries);
    };
    const emitStreamEvent = async (streamEvent) => {
      entries = this.applyStreamEvent(entries, streamEvent);
      syncEntries();
      await postMessage({ type: "agent.streamEvent", event: streamEvent });
      if (streamEvent.type === "operation" && streamEvent.category === "file-write") {
        const filePath = this.extractWorkflowFilePathFromOperation(streamEvent);
        if (filePath) writtenWorkflowPaths.add(filePath);
        if (streamEvent.status === "done") {
          fileModificationDetected = true;
        }
      }
    };
    const emitFinalEvent = async (response, finalState) => {
      if (authoritativeFinalEmitted) return;
      authoritativeFinalEmitted = true;
      const activeRun = input.sessionId ? this.activeRuns.get(input.sessionId) : void 0;
      if (activeRun && activeRun.sessionId === input.sessionId) {
        activeRun.visibleDone = true;
      }
      const elapsedMs = Date.now() - runStartedAt;
      this.outputChannel.appendLine(`[n8n-agent-debug] deepagents.v3.authoritative-final sessionId=${input.sessionId || "none"} elapsedMs=${elapsedMs} responseChars=${response.length} finalState=${finalState}`);
      const finalEvent = {
        type: "final",
        sessionId: input.sessionId || "",
        response,
        finalState,
        runtimeFinalizing: false
      };
      entries = this.applyStreamEvent(entries, finalEvent);
      syncEntries();
      await postMessage({ type: "agent.streamEvent", event: finalEvent });
    };
    const projectionConsumers = Promise.allSettled([
      this.consumeDeepAgentV3MessageProjection(run, accumulator, {
        signal,
        contextWindowTokens,
        onStreamEvent: emitStreamEvent,
        onProjectionEvent: (eventName, detail) => {
          if (loggedProjectionEvents.has(eventName)) return;
          loggedProjectionEvents.add(eventName);
          this.outputChannel.appendLine(`[n8n-agent-debug] deepagents.v3.message-event sessionId=${input.sessionId || "none"} event=${eventName} elapsedMs=${Date.now() - runStartedAt}${detail ? ` ${detail}` : ""}`);
        }
      }),
      this.consumeDeepAgentV3ProtocolProjection(run, {
        signal,
        onStreamEvent: emitStreamEvent
      })
    ]);
    void projectionConsumers.then((results) => {
      this.outputChannel.appendLine(`[n8n-agent-debug] deepagents.v3.projections settled sessionId=${input.sessionId || "none"} elapsedMs=${Date.now() - runStartedAt}`);
      for (const result of results) {
        if (result.status === "rejected" && !signal.aborted) {
          this.outputChannel.appendLine(`[n8n-agent] DeepAgents v3 projection consumer failed: ${result.reason?.message || String(result.reason)}`);
        }
      }
    });
    this.outputChannel.appendLine(`[n8n-agent-debug] deepagents.v3.run.output await-start sessionId=${input.sessionId || "none"} elapsedMs=${Date.now() - runStartedAt}`);
    const finalOutput = await this.raceAbort(Promise.resolve(run.output), signal);
    this.outputChannel.appendLine(`[n8n-agent-debug] deepagents.v3.run.output resolved sessionId=${input.sessionId || "none"} elapsedMs=${Date.now() - runStartedAt} output=${this.summarizeAgentOutput(finalOutput)}`);
    await this.throwIfAborted(signal);
    if (accumulator.thinkingText) {
      await emitStreamEvent({
        type: "operation",
        operationId: accumulator.thinkingOperationId || `thinking:${randomUUID2()}`,
        label: "Thinking",
        category: "thinking",
        status: "done",
        body: accumulator.thinkingText,
        startedAt: Date.now(),
        endedAt: Date.now()
      });
      accumulator.thinkingText = "";
      accumulator.thinkingOperationId = void 0;
    }
    await emitFinalEvent(
      this.extractAssistantTextFromAgentOutput(finalOutput) || accumulator.responseText || this.extractAgentText(finalOutput),
      run.interrupted ? "interrupted" : "done"
    );
    if (fileModificationDetected) {
      this.saveAutoCheckpointAfterFileModificationInBackground(service, input, entries);
    }
    const workflowContext = fileModificationDetected ? await this.inferWorkflowContextFromWrittenFiles([...writtenWorkflowPaths], input.workspaceRoot) : void 0;
    this.outputChannel.appendLine(`[n8n-agent-debug] agent runtime completed sessionId=${input.sessionId || "none"} workflowId=${input.workflowId || "none"} stream=v3 workflowChanged=${String(fileModificationDetected)} elapsedMs=${Date.now() - runStartedAt}`);
    return { entries, workflowChanged: fileModificationDetected, workflowContext };
  }
  async consumeDeepAgentV3MessageProjection(run, accumulator, callbacks) {
    if (!this.isAsyncIterable(run.messages)) return;
    for await (const message of run.messages) {
      await this.throwIfAborted(callbacks.signal);
      if (this.isToolMessageProjection(message)) continue;
      await this.consumeDeepAgentV3Message(message, accumulator, callbacks);
    }
  }
  isToolMessageProjection(message) {
    if (!this.isRecord(message)) return false;
    const node = String(message.node || "").toLowerCase();
    if (node === "tools" || node.endsWith(":tools") || node.endsWith("/tools")) return true;
    const namespace = Array.isArray(message.namespace) ? message.namespace.map(String) : [];
    return namespace.some((part) => {
      const normalized = part.toLowerCase();
      return normalized === "tools" || normalized.startsWith("tools:") || normalized.endsWith(":tools");
    });
  }
  async consumeDeepAgentV3Message(message, accumulator, callbacks) {
    if (this.isAsyncIterable(message)) {
      await this.consumeDeepAgentV3MessageEvents(message, accumulator, callbacks);
      return;
    }
    const messageKey = `message:${randomUUID2()}`;
    const [, messageText, , output] = await Promise.all([
      this.consumeDeepAgentV3MessageReasoning(message, messageKey, accumulator, callbacks),
      this.consumeDeepAgentV3MessageText(message, messageKey, accumulator, callbacks),
      this.consumeDeepAgentV3MessageUsage(message, callbacks),
      Promise.resolve(message.output).catch(() => void 0)
    ]);
    if (accumulator.thinkingText && accumulator.thinkingOperationId === `thinking:${messageKey}`) {
      await callbacks.onStreamEvent({
        type: "operation",
        operationId: accumulator.thinkingOperationId,
        label: "Thinking",
        category: "thinking",
        status: "done",
        body: accumulator.thinkingText,
        startedAt: Date.now(),
        endedAt: Date.now()
      });
      accumulator.thinkingText = "";
      accumulator.thinkingOperationId = void 0;
    }
    const finalText = this.extractMessageTextFromOutput(output) || messageText;
    if (finalText.trim() && !this.messageHasToolCalls(output)) this.sanitizeAssistantText(finalText);
  }
  async consumeDeepAgentV3MessageEvents(message, accumulator, callbacks) {
    const messageKey = `message:${randomUUID2()}`;
    const blockText = /* @__PURE__ */ new Map();
    let messageText = "";
    let hasToolCall = false;
    let textVisibilityResolved = false;
    let pendingVisibleText = "";
    let isInternalRecoveryMessage = false;
    const emitThinkingDone = async () => {
      if (!accumulator.thinkingText) return;
      await callbacks.onStreamEvent({
        type: "operation",
        operationId: accumulator.thinkingOperationId || `thinking:${messageKey}`,
        label: "Thinking",
        category: "thinking",
        status: "done",
        body: accumulator.thinkingText,
        startedAt: Date.now(),
        endedAt: Date.now()
      });
      accumulator.thinkingText = "";
      accumulator.thinkingOperationId = void 0;
    };
    const emitVisibleTextDelta = async (delta, blockIndex) => {
      if (!delta) return;
      await emitThinkingDone();
      accumulator.responseText += delta;
      messageText += delta;
      if (typeof blockIndex === "number") {
        blockText.set(blockIndex, `${blockText.get(blockIndex) || ""}${delta}`);
      }
      callbacks.onProjectionEvent?.("text-delta", `chars=${delta.length} totalChars=${messageText.length}`);
      await callbacks.onStreamEvent({ type: "text-delta", delta });
    };
    const emitTextDelta = async (delta, blockIndex) => {
      if (!delta || isInternalRecoveryMessage) return;
      if (!textVisibilityResolved) {
        pendingVisibleText += delta;
        if (INVALID_TOOL_CALL_RECOVERY_MARKER.startsWith(pendingVisibleText) && pendingVisibleText.length < INVALID_TOOL_CALL_RECOVERY_MARKER.length) {
          return;
        }
        textVisibilityResolved = true;
        if (pendingVisibleText.startsWith(INVALID_TOOL_CALL_RECOVERY_MARKER)) {
          isInternalRecoveryMessage = true;
          pendingVisibleText = "";
          blockText.clear();
          return;
        }
        const visibleText = pendingVisibleText;
        pendingVisibleText = "";
        await emitVisibleTextDelta(visibleText, blockIndex);
        return;
      }
      await emitVisibleTextDelta(delta, blockIndex);
    };
    const emitReasoningDelta = async (delta) => {
      if (!delta) return;
      accumulator.thinkingText += delta;
      accumulator.thinkingOperationId ||= `thinking:${messageKey}`;
      await callbacks.onStreamEvent({
        type: "operation",
        operationId: accumulator.thinkingOperationId,
        label: "Thinking",
        category: "thinking",
        status: "running",
        body: accumulator.thinkingText,
        startedAt: Date.now()
      });
    };
    for await (const event of message) {
      await this.throwIfAborted(callbacks.signal);
      if (!this.isRecord(event)) continue;
      const eventName = String(event.event || "");
      callbacks.onProjectionEvent?.(eventName);
      if (eventName === "message-start") {
        const usageEvent = this.contextUsageEventFromUsage(event.usage, callbacks.contextWindowTokens);
        if (usageEvent) await callbacks.onStreamEvent(usageEvent);
        continue;
      }
      if (eventName === "usage") {
        const usageEvent = this.contextUsageEventFromUsage(event.usage, callbacks.contextWindowTokens);
        if (usageEvent) await callbacks.onStreamEvent(usageEvent);
        continue;
      }
      if (eventName === "content-block-start") {
        const content = event.content;
        if (this.isToolContentBlock(content)) {
          hasToolCall = true;
        }
        await emitTextDelta(this.extractContentBlockText(content), this.readMessageEventIndex(event));
        await emitReasoningDelta(this.extractContentBlockReasoning(content));
        continue;
      }
      if (eventName === "content-block-delta") {
        const delta = event.delta || event.content;
        if (this.isToolContentBlock(delta) || this.isToolContentBlock(this.isRecord(delta) ? delta.fields : void 0)) {
          hasToolCall = true;
        }
        await emitTextDelta(this.extractContentBlockText(delta), this.readMessageEventIndex(event));
        await emitReasoningDelta(this.extractContentBlockReasoning(delta));
        continue;
      }
      if (eventName === "content-block-finish") {
        const content = event.content;
        if (this.isToolContentBlock(content)) {
          hasToolCall = true;
        }
        const index = this.readMessageEventIndex(event);
        const finalBlockText = this.extractContentBlockText(content);
        if (finalBlockText) {
          const currentBlockText = typeof index === "number" ? blockText.get(index) || "" : "";
          const missingText = currentBlockText && finalBlockText.startsWith(currentBlockText) ? finalBlockText.slice(currentBlockText.length) : currentBlockText ? "" : finalBlockText;
          await emitTextDelta(missingText, index);
        }
        if (this.extractContentBlockReasoning(content)) {
          await emitThinkingDone();
        }
        continue;
      }
      if (eventName === "message-finish") {
        const usageEvent = this.contextUsageEventFromUsage(event.usage, callbacks.contextWindowTokens);
        if (usageEvent) await callbacks.onStreamEvent(usageEvent);
        await emitThinkingDone();
        continue;
      }
      if (eventName === "error") {
        throw new Error(String(event.message || "DeepAgents message stream failed"));
      }
    }
    await emitThinkingDone();
  }
  async consumeDeepAgentV3MessageReasoning(message, messageKey, accumulator, callbacks) {
    if (!this.isAsyncIterable(message.reasoning)) return;
    for await (const delta of message.reasoning) {
      await this.throwIfAborted(callbacks.signal);
      if (typeof delta === "string" && delta) {
        callbacks.onProjectionEvent?.("message.reasoning-delta", `chars=${delta.length}`);
        accumulator.thinkingText += delta;
        accumulator.thinkingOperationId ||= `thinking:${messageKey}`;
        await callbacks.onStreamEvent({
          type: "operation",
          operationId: accumulator.thinkingOperationId,
          label: "Thinking",
          category: "thinking",
          status: "running",
          body: accumulator.thinkingText,
          startedAt: Date.now()
        });
      }
    }
  }
  async consumeDeepAgentV3MessageText(message, messageKey, accumulator, callbacks) {
    if (!this.isAsyncIterable(message.text)) return "";
    let text = "";
    let pendingText = "";
    let textVisibilityResolved = false;
    let isInternalRecoveryMessage = false;
    const emitVisibleTextDelta = async (delta) => {
      if (!delta) return;
      if (accumulator.thinkingText) {
        await callbacks.onStreamEvent({
          type: "operation",
          operationId: accumulator.thinkingOperationId || `thinking:${messageKey}`,
          label: "Thinking",
          category: "thinking",
          status: "done",
          body: accumulator.thinkingText,
          startedAt: Date.now(),
          endedAt: Date.now()
        });
        accumulator.thinkingText = "";
        accumulator.thinkingOperationId = void 0;
      }
      accumulator.responseText += delta;
      text += delta;
      await callbacks.onStreamEvent({ type: "text-delta", delta });
    };
    for await (const delta of message.text) {
      await this.throwIfAborted(callbacks.signal);
      if (typeof delta === "string" && delta) {
        callbacks.onProjectionEvent?.("message.text-delta", `chars=${delta.length}`);
        if (isInternalRecoveryMessage) {
          continue;
        }
        if (!textVisibilityResolved) {
          pendingText += delta;
          if (INVALID_TOOL_CALL_RECOVERY_MARKER.startsWith(pendingText) && pendingText.length < INVALID_TOOL_CALL_RECOVERY_MARKER.length) {
            continue;
          }
          textVisibilityResolved = true;
          if (pendingText.startsWith(INVALID_TOOL_CALL_RECOVERY_MARKER)) {
            isInternalRecoveryMessage = true;
            pendingText = "";
            continue;
          }
          const visibleText = pendingText;
          pendingText = "";
          await emitVisibleTextDelta(visibleText);
          continue;
        }
        await emitVisibleTextDelta(delta);
      }
    }
    return text;
  }
  async consumeDeepAgentV3MessageUsage(message, callbacks) {
    if (!this.isAsyncIterable(message.usage)) return;
    for await (const usage of message.usage) {
      await this.throwIfAborted(callbacks.signal);
      const usageEvent = this.contextUsageEventFromUsage(usage, callbacks.contextWindowTokens);
      if (usageEvent) await callbacks.onStreamEvent(usageEvent);
    }
  }
  async consumeDeepAgentV3ProtocolProjection(run, callbacks) {
    const activeTools = /* @__PURE__ */ new Map();
    for await (const protocolEvent of run) {
      await this.throwIfAborted(callbacks.signal);
      if (!this.isRecord(protocolEvent) || protocolEvent.method !== "tools") continue;
      const data = this.isRecord(protocolEvent.params) ? protocolEvent.params.data : void 0;
      if (!this.isRecord(data)) continue;
      const eventName = String(data.event || "");
      const toolCallId = String(data.tool_call_id || data.toolCallId || randomUUID2());
      const toolName = String(data.tool_name || data.name || activeTools.get(toolCallId)?.name || "tool");
      if (!this.shouldShowToolOperation(toolName)) continue;
      const operationId = `${toolName}:${toolCallId}`;
      const existing = activeTools.get(toolCallId);
      const startedAt = existing?.startedAt || Date.now();
      const category = this.categorizeTool(toolName);
      if (eventName === "tool-started") {
        activeTools.set(toolCallId, { name: toolName, input: data.input, startedAt, output: "" });
        await callbacks.onStreamEvent(this.createToolOperationEvent(operationId, toolName, category, "running", data.input, void 0, startedAt));
        continue;
      }
      if (eventName === "tool-output-delta") {
        const current = existing || { name: toolName, input: void 0, startedAt, output: "" };
        current.output += String(data.delta || "");
        activeTools.set(toolCallId, current);
        await callbacks.onStreamEvent(this.createToolOperationEvent(operationId, toolName, category, "running", current.input, current.output, current.startedAt));
        continue;
      }
      if (eventName === "tool-finished" || eventName === "tool-error") {
        const current = existing || { name: toolName, input: void 0, startedAt, output: "" };
        activeTools.delete(toolCallId);
        const output = eventName === "tool-error" ? String(data.message || "Tool failed") : data.output ?? current.output;
        await callbacks.onStreamEvent(this.createToolOperationEvent(operationId, toolName, category, eventName === "tool-error" ? "error" : "done", current.input, output, current.startedAt, Date.now()));
        await this.emitCompactionFromToolOutput(output, callbacks);
      }
    }
  }
  createToolOperationEvent(operationId, toolName, category, status, input, output, startedAt, endedAt) {
    const command = category === "shell" ? this.extractCommandFromToolPayload(input) : void 0;
    const filePath = category === "file-read" || category === "file-write" ? this.extractFilePathFromToolPayload(input) : void 0;
    const todoSummary = category === "todo" ? this.extractTodoSummary(input) : void 0;
    const outputText = output === void 0 ? void 0 : this.stringifyToolOutput(output);
    return {
      type: "operation",
      operationId,
      label: this.formatToolLabel(toolName),
      category,
      status,
      body: status === "running" ? outputText || (category === "todo" ? this.stringifyToolPayload(input) : command ? `$ ${command}` : this.stringifyToolPayload(input)) : outputText,
      summary: status === "running" ? command ? `$ ${command}` : filePath || todoSummary : this.truncateOperationDetail(outputText),
      startedAt,
      endedAt
    };
  }
  async emitCompactionFromToolOutput(output, callbacks) {
    const compaction = this.extractCompactionSummary(output);
    if (!compaction) return;
    await callbacks.onStreamEvent({
      type: "compaction",
      summary: compaction.summary,
      source: compaction.source,
      messagesCompacted: compaction.messagesCompacted,
      preservedRecentMessages: compaction.preservedRecentMessages,
      estimatedTokens: compaction.estimatedTokens,
      thresholdTokens: compaction.thresholdTokens,
      fallbackReason: compaction.fallbackReason
    });
  }
  contextUsageEventFromUsage(usage, contextWindowTokens) {
    const promptTokens = Number(usage?.input_tokens ?? usage?.promptTokens ?? usage?.prompt_tokens ?? 0);
    const completionTokens = Number(usage?.output_tokens ?? usage?.completionTokens ?? usage?.completion_tokens ?? 0);
    if (!promptTokens && !completionTokens) return void 0;
    const fillPercent = contextWindowTokens > 0 ? Math.min(100, Math.round(promptTokens / contextWindowTokens * 100)) : 0;
    return {
      type: "context-usage",
      promptTokens,
      completionTokens,
      contextWindowTokens,
      fillPercent,
      source: "api"
    };
  }
  saveAutoCheckpointAfterFileModificationInBackground(service, input, entries) {
    void this.saveAutoCheckpointAfterFileModification(service, input, entries).catch((error) => {
      this.outputChannel.appendLine(`[n8n-agent] Auto-checkpoint background task failed: ${error?.message || String(error)}`);
    });
  }
  async saveAutoCheckpointAfterFileModification(service, input, entries) {
    this.outputChannel.appendLine(`[n8n-agent-debug] agent runtime detected local workflow modification sessionId=${input.sessionId || "none"} workflowId=${input.workflowId || "none"} workflowFilePath=${input.workflowFilePath || "none"}`);
    try {
      await this.maybeSaveWorkbenchCheckpoint(service, input.sessionId || "", "after-tool", {
        label: "After file modifications",
        summary: "Saved after file modifications",
        payloads: {
          surface: this.buildCheckpointSurfacePayload(service, input.sessionId || "", entries)
        }
      });
    } catch (error) {
      this.outputChannel.appendLine(`[n8n-agent] Auto-checkpoint failed: ${error?.message || String(error)}`);
    }
  }
  truncateOperationDetail(value) {
    if (typeof value !== "string") return void 0;
    const normalized = value.trim();
    if (!normalized) return void 0;
    return normalized.length > 500 ? `${normalized.slice(0, 500)}...` : normalized;
  }
  async loadAgentProviderRegistry() {
    return LOCAL_AGENT_PROVIDER_REGISTRY;
  }
  async describeProviderRuntimeConfig() {
    const providerRegistry = await this.loadAgentProviderRegistry().catch(() => void 0);
    const settings = readAgentProviderSettings(this._context.globalState);
    const reasoningEffort = normalizeReasoningEffortForCapability(settings.reasoningEffort, getReasoningCapability(settings.provider, settings.model));
    if (!providerRegistry) {
      return {
        ready: false,
        provider: settings.provider,
        model: settings.model,
        baseUrl: settings.baseUrl,
        reasoningEffort,
        temperature: 0
      };
    }
    return this.getProviderRuntimeConfig(providerRegistry);
  }
  async getProviderRuntimeConfig(providerRegistry) {
    const settings = readAgentProviderSettings(this._context.globalState);
    const provider = settings.provider;
    const normalizedProvider = providerRegistry.normalizeProviderId(provider);
    const reasoningEffort = normalizeReasoningEffortForCapability(settings.reasoningEffort, getReasoningCapability(provider, settings.model));
    if (!normalizedProvider) {
      return {
        ready: false,
        reason: `Provider ${provider} is not supported by the embedded agent runtime.`,
        provider,
        model: settings.model,
        baseUrl: settings.baseUrl,
        reasoningEffort,
        temperature: 0
      };
    }
    const model = settings.model;
    const baseUrl = settings.baseUrl;
    const apiKey = await this._context.secrets.get(getAgentProviderSecretKey(normalizedProvider));
    if (normalizedProvider === "openai-oauth" && !apiKey) {
      return {
        ready: false,
        reason: "OpenAI OAuth needs to be connected. Open Settings > Agent Providers, then connect OpenAI ChatGPT OAuth.",
        provider: normalizedProvider,
        model,
        baseUrl,
        apiKey,
        reasoningEffort,
        temperature: 0
      };
    }
    if (providerRegistry.providerRequiresApiKey(normalizedProvider) && !apiKey && normalizedProvider !== "openai-oauth" && normalizedProvider !== "copilot-proxy") {
      return {
        ready: false,
        reason: `Missing API key for ${providerRegistry.getProviderDisplayName(normalizedProvider)}. Open Settings > Agent Providers to connect it.`,
        provider: normalizedProvider,
        model,
        baseUrl,
        apiKey,
        reasoningEffort,
        temperature: 0
      };
    }
    return {
      ready: true,
      provider: normalizedProvider,
      model,
      baseUrl,
      apiKey,
      reasoningEffort: normalizeReasoningEffortForCapability(reasoningEffort, getReasoningCapability(normalizedProvider, model)),
      temperature: 0
    };
  }
  async getDeepAgentHandle(providerConfig, input) {
    const rootDir = input.workspaceRoot || process.cwd();
    const deepagents = await importRuntimeModule("deepagents");
    const langchain = await importRuntimeModule("langchain");
    const messagesModule = await importRuntimeModule("@langchain/core/messages");
    const memorySources = await this.getAgentMemorySources(rootDir);
    const skillSourcePaths = await this.getAgentSkillSources(rootDir);
    const key = JSON.stringify({
      rootDir,
      provider: providerConfig.provider,
      model: providerConfig.model,
      baseUrl: providerConfig.baseUrl,
      reasoningEffort: providerConfig.reasoningEffort || "",
      memorySources,
      skillSourcePaths
    });
    if (this.cachedAgentHandle?.key === key) {
      return this.cachedAgentHandle.handle;
    }
    const model = await this.createLangChainModel(providerConfig);
    const checkpointer = await this.createPersistentCheckpointer();
    const backend = await deepagents.LocalShellBackend.create({
      rootDir,
      inheritEnv: false,
      env: this.buildAgentBackendEnv()
    });
    const agent = deepagents.createDeepAgent({
      model,
      checkpointer,
      backend,
      memory: memorySources,
      skills: skillSourcePaths,
      middleware: [
        this.createProviderMessageCompatibilityMiddleware(langchain, messagesModule),
        this.createInvalidToolCallRecoveryMiddleware(langchain, messagesModule)
      ].filter(Boolean),
      systemPrompt: this.buildStaticSystemPrompt(input.workspaceRoot)
    });
    const handle = { agent, checkpointer };
    this.cachedAgentHandle = { key, handle };
    return handle;
  }
  createInvalidToolCallRecoveryMiddleware(langchain, messagesModule) {
    const createMiddleware = langchain?.createMiddleware;
    const AIMessage2 = messagesModule?.AIMessage;
    const HumanMessage2 = messagesModule?.HumanMessage;
    const RemoveMessage = messagesModule?.RemoveMessage;
    if (typeof createMiddleware !== "function" || typeof AIMessage2 !== "function" || typeof HumanMessage2 !== "function" || typeof RemoveMessage !== "function") {
      return void 0;
    }
    return createMiddleware({
      name: "N8nInvalidToolCallRecovery",
      afterModel: {
        canJumpTo: ["model", "end"],
        hook: (state) => {
          const messages = Array.isArray(state?.messages) ? state.messages : [];
          const lastMessage = messages[messages.length - 1];
          const invalidCalls = this.extractInvalidToolCallsFromMessage(lastMessage);
          if (!invalidCalls.length) return void 0;
          const recoveryAttempts = this.countRecentInvalidToolCallRecoveryAttempts(messages);
          if (recoveryAttempts >= 2) {
            this.outputChannel.appendLine("[n8n-agent] Stopping invalid tool-call recovery after two failed repair attempts.");
            const lastMessageId2 = this.getMessageId(lastMessage);
            return {
              messages: [
                ...lastMessageId2 ? [new RemoveMessage({ id: lastMessageId2 })] : [],
                new AIMessage2("I could not construct a valid tool call after two repair attempts, so I stopped before executing malformed arguments. Please rephrase the request or choose a more specific next step.")
              ],
              jumpTo: "end"
            };
          }
          this.outputChannel.appendLine(`[n8n-agent-debug] recovering invalid tool call attempt=${recoveryAttempts + 1}`);
          const repairMessage = new HumanMessage2({
            content: this.buildInvalidToolCallRecoveryPrompt(invalidCalls)
          });
          const lastMessageId = this.getMessageId(lastMessage);
          return {
            messages: [
              ...lastMessageId ? [new RemoveMessage({ id: lastMessageId })] : [],
              repairMessage
            ],
            jumpTo: "model"
          };
        }
      }
    });
  }
  createProviderMessageCompatibilityMiddleware(langchain, messagesModule) {
    const createMiddleware = langchain?.createMiddleware;
    const AIMessage2 = messagesModule?.AIMessage;
    const ToolMessage2 = messagesModule?.ToolMessage;
    const HumanMessage2 = messagesModule?.HumanMessage;
    const SystemMessage2 = messagesModule?.SystemMessage;
    if (typeof createMiddleware !== "function" || typeof AIMessage2 !== "function" || typeof ToolMessage2 !== "function") {
      return void 0;
    }
    return createMiddleware({
      name: "N8nProviderMessageCompatibility",
      wrapModelCall: async (request, handler) => {
        const messages = Array.isArray(request?.messages) ? request.messages : void 0;
        if (!messages?.length) return handler(request);
        return handler({
          ...request,
          messages: messages.map((message) => this.normalizeProviderMessage(message, { AIMessage: AIMessage2, ToolMessage: ToolMessage2, HumanMessage: HumanMessage2, SystemMessage: SystemMessage2 }))
        });
      }
    });
  }
  normalizeProviderMessage(message, classes) {
    if (classes.AIMessage?.isInstance?.(message)) {
      const rawToolCalls = this.extractRawProviderToolCalls(message);
      const toolCalls = rawToolCalls.length ? [] : this.extractProviderToolCalls(message);
      if (!toolCalls.length && !this.messageHasUnsupportedComplexContent(message)) return message;
      return new classes.AIMessage({
        id: message.id,
        name: message.name,
        content: this.extractProviderTextContent(message),
        tool_calls: toolCalls,
        additional_kwargs: rawToolCalls.length ? { ...this.omitProviderOutputVersion(message.additional_kwargs), tool_calls: rawToolCalls } : this.omitProviderToolCalls(message.additional_kwargs),
        response_metadata: this.omitProviderOutputVersion(message.response_metadata)
      });
    }
    if (classes.ToolMessage?.isInstance?.(message)) {
      return new classes.ToolMessage({
        id: message.id,
        name: message.name,
        content: this.extractProviderTextContent(message),
        tool_call_id: message.tool_call_id,
        additional_kwargs: message.additional_kwargs,
        response_metadata: this.omitProviderOutputVersion(message.response_metadata)
      });
    }
    if (classes.SystemMessage?.isInstance?.(message) || classes.HumanMessage?.isInstance?.(message)) {
      if (!this.messageHasUnsupportedComplexContent(message)) return message;
      const MessageClass = classes.SystemMessage?.isInstance?.(message) ? classes.SystemMessage : classes.HumanMessage;
      return new MessageClass({
        id: message.id,
        name: message.name,
        content: this.extractProviderTextContent(message),
        additional_kwargs: message.additional_kwargs,
        response_metadata: this.omitProviderOutputVersion(message.response_metadata)
      });
    }
    if (this.messageHasUnsupportedComplexContent(message)) {
      return this.cloneMessageWithTextContent(message);
    }
    return message;
  }
  messageHasUnsupportedComplexContent(message) {
    return this.getProviderContentBlocks(message).some((block) => {
      if (!block || typeof block !== "object") return false;
      if (typeof block.type !== "string") return false;
      return block.type !== "text" && block.type !== "image_url";
    });
  }
  cloneMessageWithTextContent(message) {
    if (!message || typeof message !== "object") return message;
    const cloned = Object.create(Object.getPrototypeOf(message));
    Object.assign(cloned, message, {
      content: this.extractProviderTextContent(message),
      response_metadata: this.omitProviderOutputVersion(message.response_metadata)
    });
    return cloned;
  }
  extractProviderToolCalls(message) {
    const existing = Array.isArray(message?.tool_calls) ? message.tool_calls : [];
    const fromBlocks = this.getProviderContentBlocks(message).filter((block) => block?.type === "tool_call").map((block) => ({
      id: typeof block.id === "string" ? block.id : void 0,
      name: typeof block.name === "string" ? block.name : "tool",
      args: block.args ?? block.input ?? {},
      type: "tool_call"
    }));
    const seen = new Set(existing.map((toolCall) => `${toolCall.id || ""}:${toolCall.name || ""}`));
    return [
      ...existing,
      ...fromBlocks.filter((toolCall) => {
        const key = `${toolCall.id || ""}:${toolCall.name || ""}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
    ];
  }
  extractRawProviderToolCalls(message) {
    const rawToolCalls = message?.additional_kwargs?.tool_calls;
    if (!Array.isArray(rawToolCalls)) return [];
    return rawToolCalls.filter((toolCall) => this.isRecord(toolCall) && this.isRecord(toolCall.extra_content));
  }
  extractProviderTextContent(message) {
    return this.getProviderContentBlocks(message).map((block) => {
      if (typeof block === "string") return block;
      if (!block || typeof block !== "object") return "";
      if (typeof block.text === "string") return block.text;
      if (typeof block.content === "string") return block.content;
      return "";
    }).filter(Boolean).join("\n");
  }
  getProviderContentBlocks(message) {
    if (Array.isArray(message?.contentBlocks)) return message.contentBlocks;
    if (Array.isArray(message?.content)) return message.content;
    if (typeof message?.content === "string") return [{ type: "text", text: message.content }];
    return [];
  }
  omitProviderToolCalls(value) {
    if (!value || typeof value !== "object") return value;
    const { tool_calls: _toolCalls, ...rest } = value;
    return rest;
  }
  omitProviderOutputVersion(value) {
    if (!value || typeof value !== "object") return value;
    const { output_version: _outputVersion, ...rest } = value;
    return rest;
  }
  countRecentInvalidToolCallRecoveryAttempts(messages) {
    let attempts = 0;
    for (let idx = messages.length - 1; idx >= 0; idx -= 1) {
      const message = messages[idx];
      if (!this.isRecord(message)) continue;
      const text = this.extractMessageTextContent(message.content);
      if (text.includes("N8N_INVALID_TOOL_CALL_RECOVERY")) {
        attempts += 1;
        continue;
      }
      if (this.getMessageType(message) === "human") {
        break;
      }
    }
    return attempts;
  }
  getMessageId(message) {
    if (!this.isRecord(message)) return void 0;
    if (typeof message.id === "string") return message.id;
    const kwargs = this.isRecord(message.kwargs) ? message.kwargs : void 0;
    if (typeof kwargs?.id === "string") return kwargs.id;
    const lcKwargs = this.isRecord(message.lc_kwargs) ? message.lc_kwargs : void 0;
    if (typeof lcKwargs?.id === "string") return lcKwargs.id;
    return void 0;
  }
  buildInvalidToolCallRecoveryPrompt(invalidCalls) {
    const details = invalidCalls.map((call, index) => [
      `${index + 1}. Tool: ${call.name || "unknown"}`,
      call.error ? `Error: ${call.error}` : void 0,
      call.args ? `Malformed args: ${call.args}` : void 0
    ].filter(Boolean).join("\n")).join("\n\n");
    return [
      "N8N_INVALID_TOOL_CALL_RECOVERY",
      "Your previous assistant message contained a malformed tool call and was removed before tool execution.",
      details,
      "",
      "Repair instructions:",
      "- Continue the same user task.",
      "- Emit exactly one valid tool call or a final answer.",
      "- Do not stop after this repair message.",
      '- For the execute tool, pass exactly one JSON object with a command string: {"command":"..."}',
      "- Do not pass a separate path field to execute. If a working directory matters, include it inside the shell command, for example: cd /absolute/path && node ...",
      "- Do not concatenate multiple JSON objects in a tool call."
    ].filter(Boolean).join("\n");
  }
  buildStaticSystemPrompt(workspaceRoot) {
    return [
      "You are the embedded n8n-as-code VS Code agent.",
      "You help users design, inspect, validate, and operate n8n workflows from the current workspace.",
      "Your DeepAgents backend working directory is the VS Code workspace root. Use real workspace paths: either relative paths like workflows/dev/example.workflow.ts or absolute paths under the workspace root. Do not use pseudo-root paths like /workflows/... unless the workspace root itself is /.",
      "Use tools only when useful. For workflow-specific questions, use the inline workflow and node context supplied with each user turn as authoritative.",
      "When creating or editing n8n-as-code workflows, write TypeScript source files (.ts) using @workflow, @node, and @links decorators. Do not create raw n8n workflow JSON unless the user explicitly asks for JSON export.",
      'Do not invent workflow helper APIs such as createWorkflow. The canonical TypeScript shape is: import { workflow, node, links } from "@n8n-as-code/transformer"; then @workflow({...}) export class MyWorkflow { @node({...}) ManualTrigger = {}; @links() defineRouting() {} }.',
      "Do not claim to push workflows, provision credentials, or change n8n runtime state unless a tool explicitly performs that action successfully.",
      'When using the execute tool, pass exactly one argument object with a command string: {"command":"..."}. Never pass a separate path field, and never concatenate multiple JSON objects.',
      workspaceRoot ? `Workspace root: ${workspaceRoot}` : void 0,
      workspaceRoot ? `Example absolute workflow path: ${path4.join(workspaceRoot, "workflows/dev/example.workflow.ts")}` : void 0
    ].filter(Boolean).join("\n");
  }
  async buildInvocationPrompt(input) {
    const workflowContext = await this.loadWorkflowContext(input);
    const nodeContexts = this.normalizeNodeContexts(input.nodeContexts || input.nodeContext);
    const blocks = [
      input.workflowId ? `Current workflow: ${input.workflowName || input.workflowId} (${input.workflowId})` : "No workflow is attached. The user may be designing a new workflow.",
      input.workflowFilename ? `Current workflow file: ${input.workflowFilename}` : void 0,
      await this.loadCompactedSessionContext(input.sessionId),
      this.formatNodeContexts(nodeContexts),
      workflowContext,
      "User request:",
      input.prompt.trim()
    ].filter(Boolean);
    return blocks.join("\n\n");
  }
  async loadCompactedSessionContext(sessionId) {
    if (!sessionId) return void 0;
    const sessions = await this.getSessionRuntime();
    const entries = this.readSessionEntries(sessions.service, sessionId);
    const latestCompaction = [...entries].reverse().find((entry) => entry.kind === "compaction");
    if (!latestCompaction?.event.summary.trim()) return void 0;
    const recentText = entries.filter((entry) => "timestamp" in entry && entry.timestamp > latestCompaction.timestamp && entry.kind !== "context-usage").map((entry) => this.getEntryText(entry)).filter(Boolean).slice(-6).join("\n\n");
    return [
      "Compacted prior conversation context:",
      latestCompaction.event.summary,
      recentText ? `Recent conversation after compaction:
${recentText}` : void 0
    ].filter(Boolean).join("\n\n");
  }
  formatNodeContexts(nodeContexts) {
    if (!nodeContexts.length) {
      return void 0;
    }
    return [
      nodeContexts.length === 1 ? "Current n8n node context:" : "Current n8n node contexts:",
      ...nodeContexts.map((node, index) => [
        `${index + 1}. Node name: ${node.name}`,
        node.type ? `   Node type: ${node.type}` : void 0,
        node.id ? `   Node ID: ${node.id}` : void 0
      ].filter(Boolean).join("\n")),
      "When the user makes an ambiguous node-specific request, assume it refers to these selected nodes unless they name another node."
    ].filter(Boolean).join("\n");
  }
  async getWorkspaceMemorySources(rootDir) {
    const candidates = [
      path4.join(rootDir, "AGENTS.md"),
      path4.join(rootDir, "README.md"),
      path4.join(rootDir, "readme.md"),
      path4.join(rootDir, ".agents", "AGENTS.md")
    ];
    const existing = await Promise.all(candidates.map(async (candidate) => {
      try {
        const stat = await fs5.promises.stat(candidate);
        return stat.isFile() ? candidate : void 0;
      } catch {
        return void 0;
      }
    }));
    return existing.filter((candidate) => Boolean(candidate));
  }
  async getAgentMemorySources(rootDir) {
    const workspaceSources = await this.getWorkspaceMemorySources(rootDir);
    return [...new Set(workspaceSources)];
  }
  async getWorkspaceSkillSources(rootDir) {
    const candidates = [
      path4.join(rootDir, ".agents", "skills"),
      path4.join(rootDir, "skills"),
      path4.join(rootDir, "agent-skills")
    ];
    const existing = await Promise.all(candidates.map(async (candidate) => {
      try {
        const stat = await fs5.promises.stat(candidate);
        return stat.isDirectory() && await this.directoryHasSkill(candidate) ? candidate : void 0;
      } catch {
        return void 0;
      }
    }));
    return existing.filter((candidate) => Boolean(candidate));
  }
  async getAgentSkillSources(rootDir) {
    const candidatePaths = [
      ...await this.getWorkspaceSkillSources(rootDir)
    ].filter((candidate) => Boolean(candidate));
    const existing = await Promise.all(candidatePaths.map(async (candidate) => {
      try {
        const stat = await fs5.promises.stat(candidate);
        return stat.isDirectory() && await this.directoryHasSkill(candidate) ? candidate : void 0;
      } catch {
        return void 0;
      }
    }));
    return [...new Set(existing.filter((candidate) => Boolean(candidate)).map((candidate) => path4.relative(rootDir, candidate).replace(/\\/g, "/")).filter((candidate) => candidate && !candidate.startsWith("..")))];
  }
  async directoryHasSkill(directoryPath) {
    const directSkill = path4.join(directoryPath, "SKILL.md");
    try {
      const stat = await fs5.promises.stat(directSkill);
      if (stat.isFile()) return true;
    } catch {
    }
    try {
      const entries = await fs5.promises.readdir(directoryPath, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const stat = await fs5.promises.stat(path4.join(directoryPath, entry.name, "SKILL.md")).catch(() => void 0);
        if (stat?.isFile()) return true;
      }
    } catch {
      return false;
    }
    return false;
  }
  async loadWorkflowContext(input) {
    if (!input.workflowId && !input.workflowFilename) {
      return void 0;
    }
    const candidates = [];
    if (input.workspaceRoot && input.workflowFilename) {
      candidates.push(path4.join(input.workspaceRoot, input.workflowFilename));
      candidates.push(path4.join(input.workspaceRoot, "workflows", input.workflowFilename));
    }
    if (input.workspaceRoot && input.workflowId) {
      candidates.push(path4.join(input.workspaceRoot, "workflows", `${input.workflowId}.json`));
    }
    for (const candidate of [...new Set(candidates)]) {
      try {
        const stat = await fs5.promises.stat(candidate);
        if (!stat.isFile() || stat.size > 4e5) continue;
        const content = await fs5.promises.readFile(candidate, "utf8");
        return [
          "Selected workflow JSON context:",
          "```json",
          content,
          "```"
        ].join("\n");
      } catch {
      }
    }
    return [
      "Selected workflow metadata:",
      `Name: ${input.workflowName || "unknown"}`,
      `ID: ${input.workflowId || "not yet available"}`,
      "Workflow JSON was not found in the workspace. Explain only from available metadata and say when JSON details are needed."
    ].join("\n");
  }
  extractAgentText(result) {
    if (!result || typeof result !== "object") {
      return typeof result === "string" ? result : "The agent completed without producing text.";
    }
    const assistantText = this.extractAssistantTextFromAgentOutput(result);
    if (assistantText) return assistantText;
    const record = result;
    const messages = Array.isArray(record.messages) ? record.messages : [];
    const last = messages[messages.length - 1];
    const content = last?.content ?? record.content ?? record.output;
    const text = this.extractMessageTextContent(content);
    if (text.trim()) return this.sanitizeAssistantText(text);
    return "The agent completed without producing text.";
  }
  extractMessageTextFromOutput(output) {
    if (!this.isRecord(output)) return "";
    return this.sanitizeAssistantText(this.extractMessageTextContent(output.content));
  }
  summarizeAgentOutput(output) {
    if (!this.isRecord(output)) return typeof output;
    const keys = Object.keys(output).slice(0, 8).join(",");
    const messages = Array.isArray(output.messages) ? output.messages : [];
    const last = messages[messages.length - 1];
    const lastRole = this.isRecord(last) ? String(last.role || last._getType || last.type || last.name || "unknown") : "none";
    const lastTextChars = this.isRecord(last) ? this.extractMessageTextContent(last.content).length : 0;
    const lastProviderTextChars = this.isRecord(last) ? this.extractProviderOutputItemsText(last).length : 0;
    return `keys=${keys || "none"} messages=${messages.length} lastRole=${lastRole} lastTextChars=${lastTextChars} lastProviderTextChars=${lastProviderTextChars}`;
  }
  readMessageEventIndex(event) {
    const index = Number(event.index);
    return Number.isFinite(index) ? index : void 0;
  }
  extractContentBlockText(value) {
    if (!this.isRecord(value)) return "";
    const type = String(value.type || "").toLowerCase();
    if ((type === "text" || type === "text-delta") && typeof value.text === "string") {
      return value.text;
    }
    if (this.isRecord(value.fields)) {
      return this.extractContentBlockText(value.fields);
    }
    if (this.isRecord(value.content)) {
      return this.extractContentBlockText(value.content);
    }
    return "";
  }
  extractContentBlockReasoning(value) {
    if (!this.isRecord(value)) return "";
    const type = String(value.type || "").toLowerCase();
    if ((type === "reasoning" || type === "reasoning-delta") && typeof value.reasoning === "string") {
      return value.reasoning;
    }
    if (type === "thinking" && typeof value.thinking === "string") {
      return value.thinking;
    }
    if (this.isRecord(value.fields)) {
      return this.extractContentBlockReasoning(value.fields);
    }
    if (this.isRecord(value.content)) {
      return this.extractContentBlockReasoning(value.content);
    }
    return "";
  }
  isToolContentBlock(value) {
    if (!this.isRecord(value)) return false;
    const type = String(value.type || "").toLowerCase();
    if (type.includes("tool") || type === "input_json_delta") return true;
    for (const key of ["tool_calls", "toolCalls", "invalid_tool_calls", "invalidToolCalls"]) {
      if (Array.isArray(value[key]) && value[key].length > 0) return true;
    }
    return this.isToolContentBlock(value.fields) || this.isToolContentBlock(value.content);
  }
  messageHasToolCalls(message) {
    const visit = (value) => {
      if (!this.isRecord(value)) return false;
      for (const key of ["tool_calls", "toolCalls", "invalid_tool_calls", "invalidToolCalls"]) {
        if (Array.isArray(value[key]) && value[key].length > 0) return true;
      }
      for (const key of ["content", "content_blocks"]) {
        const blocks = value[key];
        if (Array.isArray(blocks) && blocks.some((block) => this.isRecord(block) && String(block.type || "").includes("tool"))) {
          return true;
        }
      }
      return visit(value.kwargs) || visit(value.lc_kwargs);
    };
    return visit(message);
  }
  extractAssistantTextFromAgentOutput(result) {
    if (!this.isRecord(result)) return "";
    const messages = Array.isArray(result.messages) ? result.messages : [];
    for (let idx = messages.length - 1; idx >= 0; idx -= 1) {
      const message = messages[idx];
      if (!this.isAssistantMessage(message)) continue;
      const text = this.extractAssistantMessageText(message);
      if (this.isInternalRecoveryText(text)) continue;
      if (text.trim()) return this.sanitizeAssistantText(text);
    }
    return "";
  }
  extractAssistantMessageText(message) {
    if (!this.isRecord(message)) return "";
    const directText = this.extractMessageTextContent(message.content);
    if (directText.trim()) return directText;
    const providerText = this.extractProviderOutputItemsText(message);
    if (providerText.trim()) return providerText;
    return "";
  }
  isInternalRecoveryText(value) {
    return value.trimStart().startsWith(INVALID_TOOL_CALL_RECOVERY_MARKER);
  }
  extractProviderOutputItemsText(message) {
    const candidates = [];
    const collect = (value) => {
      if (!this.isRecord(value)) return;
      for (const key of ["codex_output_items", "rawOutputItems", "output_items", "outputItems"]) {
        const candidate = value[key];
        if (Array.isArray(candidate) || this.isRecord(candidate)) {
          candidates.push(candidate);
        }
      }
    };
    collect(message);
    collect(message.additional_kwargs);
    collect(message.response_metadata);
    collect(message.kwargs);
    collect(message.lc_kwargs);
    if (this.isRecord(message.kwargs)) {
      collect(message.kwargs.additional_kwargs);
      collect(message.kwargs.response_metadata);
    }
    if (this.isRecord(message.lc_kwargs)) {
      collect(message.lc_kwargs.additional_kwargs);
      collect(message.lc_kwargs.response_metadata);
    }
    return candidates.map((candidate) => this.extractProviderOutputItemText(candidate)).join("");
  }
  extractProviderOutputItemText(value) {
    if (Array.isArray(value)) {
      return value.map((item) => this.extractProviderOutputItemText(item)).join("");
    }
    if (!this.isRecord(value)) return "";
    const type = String(value.type || "").toLowerCase();
    if ((type === "message" || type === "output_message") && Array.isArray(value.content)) {
      return this.extractMessageTextContent(value.content);
    }
    if ((type === "output_text" || type === "text") && typeof value.text === "string") {
      return value.text;
    }
    if (Array.isArray(value.content)) {
      return this.extractMessageTextContent(value.content);
    }
    return "";
  }
  buildInvalidToolCallRepairPrompt(result) {
    const invalidCalls = this.extractInvalidToolCallsFromAgentOutput(result);
    if (!invalidCalls.length) return void 0;
    const details = invalidCalls.map((call, index) => [
      `${index + 1}. Tool: ${call.name || "unknown"}`,
      call.error ? `Error: ${call.error}` : void 0,
      call.args ? `Malformed args: ${call.args}` : void 0
    ].filter(Boolean).join("\n")).join("\n\n");
    return [
      "Continue the same user task from the current workspace state.",
      "Your previous response ended with an invalid tool call, so no tool was executed.",
      details,
      "",
      "Repair instructions:",
      "- Emit a valid tool call or a final answer; do not stop after an invalid tool call.",
      '- For the execute tool, use exactly one JSON object with a single command string: {"command":"..."}',
      "- Do not pass a separate path field to execute. If a working directory matters, include it inside the shell command, for example: cd /absolute/path && node ...",
      "- Do not concatenate multiple JSON objects in a tool call."
    ].filter(Boolean).join("\n");
  }
  extractInvalidToolCallsFromAgentOutput(result) {
    if (!this.isRecord(result)) return [];
    const messages = Array.isArray(result.messages) ? result.messages : [];
    for (let idx = messages.length - 1; idx >= 0; idx -= 1) {
      const message = messages[idx];
      if (!this.isAssistantMessage(message)) continue;
      const calls = this.extractInvalidToolCallsFromMessage(message);
      if (calls.length) return calls;
    }
    return [];
  }
  extractInvalidToolCallsFromMessage(message) {
    const candidates = [];
    const collect = (value) => {
      if (!this.isRecord(value)) return;
      for (const key of ["invalid_tool_calls", "invalidToolCalls"]) {
        const direct = value[key];
        if (Array.isArray(direct)) candidates.push(...direct);
      }
      for (const key of ["content", "content_blocks"]) {
        const direct = value[key];
        if (Array.isArray(direct)) candidates.push(...direct);
      }
      if (this.isRecord(value.kwargs)) collect(value.kwargs);
      if (this.isRecord(value.lc_kwargs)) collect(value.lc_kwargs);
    };
    collect(message);
    return candidates.filter((candidate) => this.isRecord(candidate) && candidate.type === "invalid_tool_call").map((candidate) => ({
      name: typeof candidate.name === "string" ? candidate.name : void 0,
      args: typeof candidate.args === "string" ? candidate.args : this.stringifyToolPayload(candidate.args),
      error: typeof candidate.error === "string" ? candidate.error : void 0
    }));
  }
  isAssistantMessage(value) {
    if (!this.isRecord(value)) return false;
    const messageType = this.getMessageType(value);
    if (messageType === "tool" || messageType === "human" || messageType === "system") return false;
    if (messageType === "ai" || messageType === "assistant") return true;
    return false;
  }
  getMessageType(value) {
    const getter = value._getType;
    if (typeof getter === "function") {
      try {
        const type = getter.call(value);
        if (typeof type === "string") return type.toLowerCase();
      } catch {
      }
    }
    for (const key of ["type", "role"]) {
      const direct = value[key];
      if (typeof direct === "string") return direct.toLowerCase();
      const kwargs = this.isRecord(value.kwargs) ? value.kwargs[key] : void 0;
      if (typeof kwargs === "string") return kwargs.toLowerCase();
      const lcKwargs = this.isRecord(value.lc_kwargs) ? value.lc_kwargs[key] : void 0;
      if (typeof lcKwargs === "string") return lcKwargs.toLowerCase();
    }
    const constructorName = typeof value.constructor?.name === "string" ? value.constructor.name.toLowerCase() : "";
    if (constructorName.includes("toolmessage")) return "tool";
    if (constructorName.includes("humanmessage")) return "human";
    if (constructorName.includes("systemmessage")) return "system";
    if (constructorName.includes("aimessage")) return "ai";
    const lcId = Array.isArray(value.lc_id) ? value.lc_id.map(String).join("/").toLowerCase() : "";
    if (lcId.includes("toolmessage")) return "tool";
    if (lcId.includes("humanmessage")) return "human";
    if (lcId.includes("systemmessage")) return "system";
    if (lcId.includes("aimessage")) return "ai";
    if ("tool_call_id" in value || "toolCallId" in value) return "tool";
    return void 0;
  }
  extractMessageTextContent(value) {
    if (typeof value === "string") return value;
    if (this.isRecord(value)) {
      if (typeof value.text === "string") return value.text;
      if (Array.isArray(value.content)) return this.extractMessageTextContent(value.content);
      return "";
    }
    if (!Array.isArray(value)) return "";
    return value.map((part) => {
      if (typeof part === "string") return part;
      if (this.isRecord(part) && typeof part.text === "string") return part.text;
      if (this.isRecord(part) && Array.isArray(part.content)) return this.extractMessageTextContent(part.content);
      return "";
    }).join("");
  }
  sanitizeAssistantText(value) {
    if (this.isInternalRecoveryText(value)) return "";
    return value.replace(ENVIRONMENT_DETAILS_BLOCK_PATTERN, "").trim();
  }
  async buildProviderStatusLine() {
    const settings = readAgentProviderSettings(this._context.globalState);
    const provider = settings.provider;
    const model = settings.model || "";
    const baseUrl = settings.baseUrl || "";
    const reasoningEffort = settings.reasoningEffort;
    const storedSecret = await this._context.secrets.get(getAgentProviderSecretKey(provider));
    const hasEnvSecret = this.hasProviderEnvironmentSecret(provider);
    const secretState = storedSecret ? "API key stored in VS Code Secret Storage" : hasEnvSecret ? "API key available from environment" : "API key not configured yet";
    return `Agent provider: ${provider}${model ? ` / ${model}` : ""}${reasoningEffort ? ` / reasoning ${reasoningEffort}` : ""}${baseUrl ? ` / ${baseUrl}` : ""}. ${secretState}.`;
  }
  hasProviderEnvironmentSecret(provider) {
    const envKeys = {
      anthropic: ["ANTHROPIC_API_KEY"],
      openai: ["OPENAI_API_KEY"],
      google: ["GOOGLE_GENERATIVE_AI_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY"],
      mistral: ["MISTRAL_API_KEY"],
      openrouter: ["OPENROUTER_API_KEY"],
      "openai-compatible": ["OPENAI_COMPATIBLE_API_KEY"]
    };
    return (envKeys[provider] ?? []).some((key) => Boolean(process.env[key]?.trim()));
  }
  async buildScaffoldResponse(input, runtimeError) {
    const workflowLine = input.workflowId ? `Current workflow: ${input.workflowName || input.workflowId} (${input.workflowId}).` : "No remote workflow is selected yet.";
    const workspaceLine = input.workspaceRoot ? `Workspace: ${input.workspaceRoot}.` : "No workspace root was provided.";
    const runtimeLine = runtimeError ? `Embedded DeepAgentJS runtime is not loadable yet: ${runtimeError}` : "Embedded DeepAgentJS runtime is available. Tool and provider execution are enabled.";
    return [
      "The n8n Agent Workbench is wired into the VS Code extension host.",
      workflowLine,
      workspaceLine,
      await this.buildProviderStatusLine(),
      runtimeLine,
      "",
      "No workflow files, credentials, runtime state, or shell commands were changed unless the runtime explicitly reported success."
    ].join("\n");
  }
  async throwIfAborted(signal) {
    if (signal.aborted) {
      const error = new Error("Agent run cancelled.");
      error.name = "AbortError";
      throw error;
    }
  }
  async raceAbort(promise, signal) {
    if (signal.aborted) {
      await this.throwIfAborted(signal);
    }
    return new Promise((resolve5, reject) => {
      const onAbort = () => {
        const error = new Error("Agent run cancelled.");
        error.name = "AbortError";
        reject(error);
      };
      signal.addEventListener("abort", onAbort, { once: true });
      promise.then(
        (value) => {
          signal.removeEventListener("abort", onAbort);
          resolve5(value);
        },
        (error) => {
          signal.removeEventListener("abort", onAbort);
          reject(error);
        }
      );
    });
  }
  async getSessionRuntime() {
    if (!this.sessionRuntimePromise) {
      this.sessionRuntimePromise = (async () => {
        const sessionsRoot = path4.join(this._context.globalStorageUri.fsPath, "agent-sessions");
        await fs5.promises.mkdir(sessionsRoot, { recursive: true });
        const service = new WorkbenchSessionService(sessionsRoot);
        service.setCheckpointer(await this.createPersistentCheckpointer());
        return {
          service,
          deriveSessionTitle: this.deriveSessionTitle
        };
      })();
    }
    return this.sessionRuntimePromise;
  }
  async flushSessionWrites() {
    const sessions = await this.sessionRuntimePromise?.catch(() => void 0);
    await sessions?.service.flushPendingWrites?.();
  }
  getSessionScope(input) {
    if (input.workflowId) {
      return { kind: "vscode-workflow", key: input.workflowId };
    }
    return this.getUnattachedSessionScope();
  }
  getInputWorkflowContext(input) {
    const id = input.workflowId?.trim();
    const workflowName = input.workflowName?.trim();
    const filename = input.workflowFilename?.trim();
    const filePath = input.workflowFilePath?.trim();
    if (!id && !workflowName && !filename && !filePath) return void 0;
    const name = workflowName || id || filename || (filePath ? path4.basename(filePath) : void 0) || "Workflow";
    return {
      id: id || void 0,
      name,
      filename: filename || void 0,
      filePath: filePath || void 0
    };
  }
  getUnattachedSessionScope() {
    return { kind: "vscode-workflow", key: UNATTACHED_WORKFLOW_SCOPE_KEY };
  }
  getDefaultSessionTitle(workflowName) {
    return workflowName ? `${workflowName} conversation` : "New conversation";
  }
  deriveSessionTitle(text, fallback = "New conversation") {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized) return fallback;
    return normalized.length > 48 ? `${normalized.slice(0, 45).trim()}...` : normalized;
  }
  async listSessionSummaries(scope, activeSessionId) {
    const sessions = await this.getSessionRuntime();
    const summaries = await Promise.all(sessions.service.list().map(async (summary) => {
      const record = sessions.service.get(summary.id);
      const entries = this.readSessionEntries(sessions.service, summary.id);
      const workflowContext = this.getLatestWorkflowContext(entries, record);
      const checkpoints = await sessions.service.listCheckpoints(summary.id).catch(() => []);
      return {
        id: summary.id,
        title: summary.title,
        createdAt: summary.createdAt,
        updatedAt: summary.updatedAt,
        messageCount: summary.messageCount,
        isActive: summary.id === activeSessionId,
        isRunning: this.activeRuns.has(summary.id),
        isClosed: Boolean(record?.closedAt),
        checkpointCount: checkpoints.length,
        workflowId: workflowContext?.id,
        workflowLabel: workflowContext?.name || workflowContext?.id || workflowContext?.filename || "New workflow chat",
        workflowContext,
        totalCompactions: entries.filter((entry) => entry.kind === "compaction").length
      };
    }));
    return summaries.sort((left, right) => {
      if (left.isActive !== right.isActive) {
        return left.isActive ? -1 : 1;
      }
      const leftMatchesScope = left.workflowId === scope.key || !left.workflowContext && scope.key === UNATTACHED_WORKFLOW_SCOPE_KEY;
      const rightMatchesScope = right.workflowId === scope.key || !right.workflowContext && scope.key === UNATTACHED_WORKFLOW_SCOPE_KEY;
      if (leftMatchesScope !== rightMatchesScope) {
        return leftMatchesScope ? -1 : 1;
      }
      return right.updatedAt.localeCompare(left.updatedAt);
    });
  }
  async buildSessionState(sessionId, input) {
    const sessions = await this.getSessionRuntime();
    const displaySession = sessions.service.readDisplaySession(sessionId);
    const entries = this.normalizeEntries(displaySession?.displayThread);
    const checkpoints = await sessions.service.listCheckpoints(sessionId).catch(() => []);
    const record = sessions.service.get(sessionId);
    const workflowContext = this.getLatestWorkflowContext(entries, record);
    const nodeContexts = workflowContext ? this.getLatestNodeContexts(entries) : [];
    const latestUsageEntry = [...entries].reverse().find((entry) => entry.kind === "context-usage" && entry.usage.source === "api");
    const compactionEntries = entries.filter((entry) => entry.kind === "compaction");
    return {
      sessionId,
      title: displaySession?.title || record?.title || this.getDefaultSessionTitle(input.workflowName),
      entries,
      checkpoints: checkpoints.map((checkpoint) => ({
        id: checkpoint.id,
        sessionId: checkpoint.sessionId,
        createdAt: checkpoint.createdAt,
        messageCount: checkpoint.messageCount,
        summary: checkpoint.summary,
        reason: checkpoint.reason,
        label: checkpoint.label,
        restoredAt: checkpoint.restoredAt
      })),
      contextUsage: latestUsageEntry?.usage,
      lastCompaction: compactionEntries[compactionEntries.length - 1]?.event,
      totalCompactions: compactionEntries.length,
      workflowId: workflowContext?.id,
      workflowLabel: workflowContext?.name || workflowContext?.id || workflowContext?.filename || "New workflow chat",
      workflowContext,
      nodeContexts
    };
  }
  withWorkflowContext(entries, workflow) {
    const name = workflow.name?.trim() || workflow.id || workflow.filename || "Workflow";
    return [
      ...entries,
      {
        kind: "workflow-context",
        id: randomUUID2(),
        timestamp: Date.now(),
        action: "set",
        workflow: {
          id: workflow.id?.trim() || void 0,
          name,
          filename: workflow.filename?.trim() || void 0,
          filePath: workflow.filePath?.trim() || void 0
        }
      }
    ];
  }
  getLatestWorkflowContext(entries, record) {
    for (let idx = entries.length - 1; idx >= 0; idx -= 1) {
      const entry = entries[idx];
      if (entry.kind !== "workflow-context") continue;
      if (entry.action === "clear") return void 0;
      return entry.workflow;
    }
    const workflowId = record?.scope?.kind === "vscode-workflow" && record.scope.key !== UNATTACHED_WORKFLOW_SCOPE_KEY ? record.scope.key : void 0;
    return workflowId ? { id: workflowId, name: workflowId } : void 0;
  }
  workflowContextsMatch(left, right) {
    if (left.id && right.id && left.id === right.id) return true;
    if (left.filename && right.filename && left.filename === right.filename) return true;
    return Boolean(left.name && right.name && left.name === right.name);
  }
  getLatestNodeContexts(entries) {
    for (let idx = entries.length - 1; idx >= 0; idx -= 1) {
      const entry = entries[idx];
      if (entry.kind !== "node-context") continue;
      return this.normalizeNodeContexts(entry.nodes);
    }
    return [];
  }
  normalizeNodeContexts(value) {
    const values = Array.isArray(value) ? value : value ? [value] : [];
    const seen = /* @__PURE__ */ new Set();
    const result = [];
    for (const candidate of values) {
      const name = typeof candidate?.name === "string" ? candidate.name.trim() : "";
      if (!name) continue;
      const type = typeof candidate.type === "string" ? candidate.type.trim() : "";
      const id = typeof candidate.id === "string" ? candidate.id.trim() : "";
      const key = [name, type, id].join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({ name, type: type || void 0, id: id || void 0 });
    }
    return result;
  }
  async inferWorkflowContextFromWorkspace(workspaceRoot) {
    if (!workspaceRoot) return void 0;
    const candidates = await this.listWorkflowSourceCandidates(workspaceRoot);
    candidates.sort((left, right) => right.mtimeMs - left.mtimeMs);
    for (const candidate of candidates.slice(0, 12)) {
      const context = await this.readWorkflowContextFromTypeScriptFile(candidate.filePath, workspaceRoot);
      if (context) return context;
    }
    return void 0;
  }
  async inferWorkflowContextFromWrittenFiles(filePaths, workspaceRoot) {
    if (!workspaceRoot) return void 0;
    const seen = /* @__PURE__ */ new Set();
    for (const candidate of filePaths) {
      const resolved = path4.isAbsolute(candidate) ? candidate : path4.resolve(workspaceRoot, candidate);
      if (seen.has(resolved)) continue;
      seen.add(resolved);
      if (!resolved.endsWith(".workflow.ts")) continue;
      const relative4 = path4.relative(workspaceRoot, resolved);
      if (relative4.startsWith("..") || path4.isAbsolute(relative4)) continue;
      const context = await this.readWorkflowContextFromTypeScriptFile(resolved, workspaceRoot);
      if (context) return context;
    }
    return void 0;
  }
  extractWorkflowFilePathFromOperation(event) {
    for (const candidate of [event.summary, event.body]) {
      if (typeof candidate !== "string") continue;
      const trimmed = candidate.trim();
      if (!trimmed || !trimmed.endsWith(".workflow.ts")) continue;
      if (trimmed.includes("\n")) continue;
      return trimmed;
    }
    return void 0;
  }
  async listWorkflowSourceCandidates(workspaceRoot) {
    const results = [];
    await this.collectWorkflowSourceCandidates(workspaceRoot, results, workspaceRoot, 0);
    return results;
  }
  async collectWorkflowSourceCandidates(directory, results, workspaceRoot, depth) {
    if (depth > 4) return;
    const relative4 = path4.relative(workspaceRoot, directory).replace(/\\/g, "/");
    if (relative4 && /(^|\/)(node_modules|dist|out|\.git|\.kilo)(\/|$)/.test(relative4)) {
      return;
    }
    let entries;
    try {
      entries = await fs5.promises.readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const filePath = path4.join(directory, entry.name);
      if (entry.isDirectory()) {
        await this.collectWorkflowSourceCandidates(filePath, results, workspaceRoot, depth + 1);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".workflow.ts")) continue;
      const stat = await fs5.promises.stat(filePath).catch(() => void 0);
      if (stat?.isFile()) results.push({ filePath, mtimeMs: stat.mtimeMs });
    }
  }
  async readWorkflowContextFromTypeScriptFile(filePath, workspaceRoot) {
    try {
      const raw = await fs5.promises.readFile(filePath, "utf8");
      const metadata = this.extractWorkflowDecoratorMetadata(raw);
      const filename = path4.relative(workspaceRoot, filePath).replace(/\\/g, "/");
      return {
        id: metadata.id,
        name: metadata.name || path4.basename(filePath, ".workflow.ts"),
        filename,
        filePath
      };
    } catch {
      return void 0;
    }
  }
  extractWorkflowDecoratorMetadata(source) {
    const decoratorMatch = source.match(/@workflow\s*\(\s*\{([\s\S]*?)\}\s*\)/);
    const decoratorContent = decoratorMatch?.[1] || "";
    return {
      id: this.extractStringProperty(decoratorContent, "id"),
      name: this.extractStringProperty(decoratorContent, "name")
    };
  }
  extractStringProperty(source, property) {
    const match = source.match(new RegExp(`${property}\\s*:\\s*(["'])((?:\\\\.|(?!\\1)[\\s\\S])*?)\\1`));
    return match?.[2]?.trim() || void 0;
  }
  getEntryText(entry) {
    if (entry.kind === "user-message" || entry.kind === "system-notice" || entry.kind === "assistant-body") {
      return entry.text;
    }
    if (entry.kind === "workflow-context" || entry.kind === "node-context") {
      return "";
    }
    if (entry.kind === "operation") {
      return [entry.title, entry.detail, entry.summary, entry.body].filter(Boolean).join(" ");
    }
    if (entry.kind === "compaction") {
      return entry.event.summary;
    }
    if (entry.kind === "context-usage") {
      return `${entry.usage.fillPercent}% context usage`;
    }
    return "";
  }
  readSessionEntries(service, sessionId) {
    return this.normalizeEntries(service.readDisplaySession(sessionId)?.displayThread);
  }
  writeSessionEntries(service, sessionId, entries) {
    service.syncDisplayThread(sessionId, entries);
  }
  normalizeEntries(value) {
    return Array.isArray(value) ? value.filter((entry) => !this.isNoiseOperation(entry)) : [];
  }
  isNoiseOperation(entry) {
    if (entry.kind !== "operation") return false;
    const title = entry.title.toLowerCase();
    const detail = (entry.detail || entry.summary || "").toLowerCase();
    return title === "agent runtime" || detail === "run completed" || title.includes("run completed");
  }
  applyStreamEvent(entries, event) {
    if (event.type === "start") {
      return entries;
    }
    if (event.type === "text-delta") {
      const next = [...entries];
      const streamingIndex = this.findLastAssistantBodyIndex(next, true);
      if (streamingIndex >= 0) {
        const entry = next[streamingIndex];
        if (entry.kind === "assistant-body") {
          entry.text += event.delta;
        }
        return next;
      }
      next.push({ kind: "assistant-body", id: randomUUID2(), text: event.delta, streaming: true });
      return next;
    }
    if (event.type === "final") {
      const next = this.finalizePendingOperations([...entries], "done");
      return this.consolidateFinalAssistant(next, event.response, event.finalState);
    }
    if (event.type === "operation") {
      const next = [...entries];
      const existingIndex = this.findMatchingPendingOperationIndex(next, event.operationId, event.label, event.category);
      const existingEntry = existingIndex >= 0 && next[existingIndex]?.kind === "operation" ? next[existingIndex] : void 0;
      const shouldPreserveOperationSummary = ["shell", "file-read", "file-write", "todo"].includes(event.category);
      const operationEntry = {
        kind: "operation",
        id: event.operationId || existingEntry?.id || randomUUID2(),
        tone: event.status === "error" ? "error" : event.status === "done" ? "success" : "info",
        title: event.label,
        category: event.category,
        status: event.status,
        body: event.category === "todo" && existingEntry?.body ? existingEntry.body : event.body || existingEntry?.body,
        summary: shouldPreserveOperationSummary && existingEntry?.summary ? existingEntry.summary : event.summary,
        startedAt: event.startedAt,
        endedAt: event.endedAt,
        detail: shouldPreserveOperationSummary && existingEntry?.summary ? existingEntry.summary : event.summary
      };
      if (existingIndex >= 0) {
        next[existingIndex] = operationEntry;
        return next;
      }
      next.push(operationEntry);
      return next;
    }
    if (event.type === "progress") {
      const next = [...entries];
      const existingIndex = this.findMatchingPendingOperationIndex(next, void 0, event.title, event.phase || "phase");
      const progressEntry = {
        kind: "operation",
        id: existingIndex >= 0 ? next[existingIndex].id : randomUUID2(),
        tone: event.tone,
        title: event.title,
        detail: event.detail,
        category: event.phase || "phase",
        status: event.tone === "error" ? "error" : "running"
      };
      if (existingIndex >= 0) {
        next[existingIndex] = progressEntry;
        return next;
      }
      return [
        ...next,
        progressEntry
      ];
    }
    if (event.type === "compaction") {
      return [
        ...entries,
        {
          kind: "compaction",
          id: randomUUID2(),
          timestamp: Date.now(),
          event: {
            summary: event.summary,
            source: event.source,
            messagesCompacted: event.messagesCompacted,
            preservedRecentMessages: event.preservedRecentMessages,
            estimatedTokens: event.estimatedTokens,
            thresholdTokens: event.thresholdTokens,
            fallbackReason: event.fallbackReason
          }
        }
      ];
    }
    if (event.type === "context-usage") {
      const usageEntry = {
        kind: "context-usage",
        id: randomUUID2(),
        timestamp: Date.now(),
        usage: {
          promptTokens: event.promptTokens,
          completionTokens: event.completionTokens,
          contextWindowTokens: event.contextWindowTokens,
          fillPercent: event.fillPercent,
          source: event.source
        }
      };
      const withoutPrevious = this.withoutContextUsage(entries);
      return [...withoutPrevious, usageEntry];
    }
    if (event.type === "error") {
      return [...this.finalizePendingOperations(entries, "error"), this.createSystemNotice(`Error: ${event.error}`)];
    }
    return entries;
  }
  finalizePendingOperations(entries, status) {
    return entries.map((entry) => {
      if (entry.kind !== "operation" || entry.status !== "running") return entry;
      return {
        ...entry,
        tone: status === "error" ? "error" : "success",
        status,
        endedAt: entry.endedAt || Date.now()
      };
    });
  }
  consolidateFinalAssistant(entries, response, finalState) {
    const userIndex = this.findLastUserMessageIndex(entries);
    const finalText = this.sanitizeAssistantText(response);
    let chosenText = finalText;
    let firstAssistantIndex = -1;
    for (let idx = userIndex + 1; idx < entries.length; idx += 1) {
      const entry = entries[idx];
      if (entry.kind !== "assistant-body") continue;
      const text = this.sanitizeAssistantText(entry.text);
      if (text && firstAssistantIndex < 0) {
        firstAssistantIndex = idx;
      }
      if (text && finalText.includes(text) && text.length >= Math.max(80, finalText.length * 0.6)) {
        chosenText = text;
      }
    }
    const result = [];
    let inserted = false;
    for (let idx = 0; idx < entries.length; idx += 1) {
      const entry = entries[idx];
      if (idx > userIndex && entry.kind === "assistant-body") {
        if (!inserted && chosenText && idx === firstAssistantIndex) {
          result.push({ kind: "assistant-body", id: entry.id || randomUUID2(), text: chosenText, streaming: false, finalState });
          inserted = true;
        }
        continue;
      }
      result.push(entry);
    }
    if (!inserted && chosenText) {
      result.push({ kind: "assistant-body", id: randomUUID2(), text: chosenText, streaming: false, finalState });
    }
    return result;
  }
  findLastUserMessageIndex(entries) {
    for (let idx = entries.length - 1; idx >= 0; idx -= 1) {
      if (entries[idx].kind === "user-message") return idx;
    }
    return -1;
  }
  findLastAssistantBodyIndex(entries, streamingOnly) {
    for (let idx = entries.length - 1; idx >= 0; idx -= 1) {
      const entry = entries[idx];
      if (entry.kind !== "assistant-body") continue;
      if (streamingOnly && !entry.streaming) continue;
      return idx;
    }
    return -1;
  }
  findMatchingPendingOperationIndex(entries, operationId, title, category) {
    if (operationId) {
      const exactIndex = entries.findIndex((entry) => entry.kind === "operation" && entry.id === operationId);
      if (exactIndex >= 0) {
        return exactIndex;
      }
    }
    const targetKind = this.normalizeOperationKind(category, title);
    for (let idx = entries.length - 1; idx >= 0; idx -= 1) {
      const entry = entries[idx];
      if (entry.kind !== "operation") continue;
      if (entry.status !== "running") continue;
      const entryKind = this.normalizeOperationKind(entry.category, entry.title);
      if (entryKind && targetKind && entryKind === targetKind) {
        return idx;
      }
      if (entry.title !== title) continue;
      const entryCategory = String(entry.category || "").toLowerCase();
      const targetCategory = String(category || "").toLowerCase();
      if (entryCategory && targetCategory && entryCategory !== targetCategory && entryCategory !== "phase") continue;
      return idx;
    }
    return -1;
  }
  normalizeOperationKind(category, title) {
    const value = String(category || title || "").toLowerCase().replace(/_/g, "-");
    if (value === "read-file" || value === "file-read" || value === "read") return "file-read";
    if (value === "write-file" || value === "file-write" || value === "write") return "file-write";
    if (value.includes("shell")) return "shell";
    if (value.includes("web")) return "web";
    return value;
  }
  createSystemNotice(text) {
    return { kind: "system-notice", id: randomUUID2(), text, timestamp: Date.now() };
  }
  appendRunStoppedNotice(service, sessionId) {
    const entries = this.withoutContextUsage(this.readSessionEntries(service, sessionId));
    const last = entries[entries.length - 1];
    if (last?.kind === "system-notice" && last.text === "Run stopped.") {
      return;
    }
    this.writeSessionEntries(service, sessionId, [
      ...this.finalizePendingOperations(entries, "done"),
      this.createSystemNotice("Run stopped.")
    ]);
  }
  withoutContextUsage(entries) {
    return entries.filter((entry) => entry.kind !== "context-usage");
  }
  buildCheckpointSurfacePayload(service, sessionId, entriesOverride) {
    const displaySession = service.readDisplaySession(sessionId);
    const record = service.get(sessionId);
    const displayThread = this.normalizeEntries(entriesOverride || displaySession?.displayThread);
    const selectedWorkflow = this.getLatestWorkflowContext(displayThread, record);
    const selectedNodes = selectedWorkflow ? this.getLatestNodeContexts(displayThread) : [];
    return {
      version: 1,
      displayThread,
      contextMarkers: displayThread.filter((entry) => entry.kind === "workflow-context" || entry.kind === "node-context"),
      selectedWorkflow,
      selectedNodes,
      title: displaySession?.title || record?.title || this.getDefaultSessionTitle(),
      scope: record?.scope
    };
  }
  buildCheckpointSummary(surface) {
    if (surface.selectedWorkflow && surface.selectedNodes.length) {
      return `Workbench checkpoint for ${surface.selectedWorkflow.name} with ${surface.selectedNodes.length} selected node${surface.selectedNodes.length === 1 ? "" : "s"}`;
    }
    if (surface.selectedWorkflow) {
      return `Workbench checkpoint for ${surface.selectedWorkflow.name}`;
    }
    return "Workbench checkpoint";
  }
  async saveWorkbenchCheckpoint(service, sessionId, options) {
    return service.saveCheckpoint(sessionId, this.withLegacyCheckpointPayload(options));
  }
  async saveBeforeUserMessageCheckpoint(service, sessionId, entries, prompt, workspaceRoot) {
    service.setCheckpointer(await this.createPersistentCheckpointer());
    const workspaceSnapshotId = await this.workspaceSnapshots.capture(workspaceRoot, "Before user message");
    const surface = this.buildCheckpointSurfacePayload(service, sessionId, entries);
    const promptPreview = prompt.length > 80 ? `${prompt.slice(0, 77)}...` : prompt;
    const checkpoint = await this.saveWorkbenchCheckpoint(service, sessionId, {
      reason: "manual",
      label: "Before user message",
      summary: promptPreview ? `Before "${promptPreview}"` : "Before user message",
      payloads: {
        surface
      }
    });
    return { checkpoint, workspaceSnapshotId };
  }
  async maybeSaveWorkbenchCheckpoint(service, sessionId, reason, options) {
    if (typeof service.maybeSaveCheckpoint !== "function") {
      return this.saveWorkbenchCheckpoint(service, sessionId, { ...options, reason });
    }
    return service.maybeSaveCheckpoint(sessionId, reason, this.withLegacyCheckpointPayload(options));
  }
  withLegacyCheckpointPayload(options) {
    if (!options.payloads || options.payloadState !== void 0) {
      return options;
    }
    return {
      ...options,
      payloadState: { payloads: options.payloads }
    };
  }
  extractCheckpointPayloads(result) {
    if (this.isRecord(result.payloads)) {
      return result.payloads;
    }
    const payloadState = result.payloadState;
    if (this.isRecord(payloadState)) {
      if (this.isRecord(payloadState.payloads)) {
        return payloadState.payloads;
      }
      if (this.isRecord(payloadState.surface) || this.isRecord(payloadState.compaction)) {
        return payloadState;
      }
    }
    if (this.isCompactionState(payloadState)) {
      return { compaction: payloadState };
    }
    return {};
  }
  isWorkbenchSurfacePayload(value) {
    if (!this.isRecord(value)) return false;
    if (value.version !== 1) return false;
    if (!Array.isArray(value.displayThread)) return false;
    if (typeof value.title !== "string") return false;
    return true;
  }
  isRecord(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
  }
  toCompactionSummary(value) {
    if (!value || typeof value !== "object") return void 0;
    const event = value;
    const summary = typeof event.summary === "string" && event.summary.trim() ? event.summary.trim() : "Context compacted";
    return {
      summary,
      source: event.source === "fallback" ? "fallback" : "llm",
      messagesCompacted: this.numberOrZero(event.messagesCompacted),
      preservedRecentMessages: this.numberOrZero(event.preservedRecentMessages),
      estimatedTokens: this.optionalNumber(event.estimatedTokens),
      thresholdTokens: this.optionalNumber(event.thresholdTokens),
      fallbackReason: typeof event.fallbackReason === "string" && event.fallbackReason.trim() ? event.fallbackReason.trim() : void 0
    };
  }
  numberOrZero(value) {
    const number = typeof value === "number" ? value : Number(value || 0);
    return Number.isFinite(number) ? number : 0;
  }
  optionalNumber(value) {
    const number = typeof value === "number" ? value : Number(value);
    return Number.isFinite(number) ? number : void 0;
  }
  async createLangChainModel(providerConfig) {
    const provider = providerConfig.provider;
    const model = providerConfig.model || this.getDefaultModelForProvider(provider);
    const reasoningOptions = buildLangChainReasoningOptions(provider, model, providerConfig.reasoningEffort);
    if (provider === "openai-oauth" || provider === "copilot-proxy" || provider === "minimax" || provider === "minimax-token-plan") {
      return createLocalProviderLangChainModel({
        provider,
        model,
        apiKey: providerConfig.apiKey,
        baseUrl: providerConfig.baseUrl,
        reasoningEffort: providerConfig.reasoningEffort
      });
    }
    if (provider === "anthropic") {
      const { ChatAnthropic: ChatAnthropic2 } = await importRuntimeModule("@langchain/anthropic");
      return new ChatAnthropic2({
        apiKey: providerConfig.apiKey,
        model,
        ...reasoningOptions.thinking ? { thinking: reasoningOptions.thinking } : {},
        ...reasoningOptions.outputConfig ? { outputConfig: reasoningOptions.outputConfig } : {}
      });
    }
    if (provider === "mistral") {
      const { ChatMistralAI } = await importRuntimeModule("@langchain/mistralai");
      return new ChatMistralAI({ apiKey: providerConfig.apiKey, model });
    }
    const { ChatOpenAI: ChatOpenAI2 } = await importRuntimeModule("@langchain/openai");
    const baseURL = provider === "openrouter" ? providerConfig.baseUrl || "https://openrouter.ai/api/v1" : provider === "google" ? providerConfig.baseUrl || "https://generativelanguage.googleapis.com/v1beta/openai" : providerConfig.baseUrl;
    const modelKwargs = reasoningOptions.modelKwargs;
    return new ChatOpenAI2({
      ...providerConfig.apiKey ? { apiKey: providerConfig.apiKey } : {},
      model,
      ...reasoningOptions.reasoning ? { reasoning: reasoningOptions.reasoning } : {},
      ...reasoningOptions.useResponsesApi ? { useResponsesApi: true } : {},
      ...modelKwargs ? { modelKwargs } : {},
      ...shouldDisableModelStreamingForToolCalling(provider, model) ? { disableStreaming: true } : {},
      ...baseURL ? { configuration: { baseURL } } : {}
    });
  }
  getDefaultModelForProvider(provider) {
    const defaults = {
      anthropic: "claude-haiku-4-5",
      openai: "gpt-4o",
      google: "gemini-3-flash-preview",
      mistral: "mistral-large-latest",
      openrouter: "anthropic/claude-3.5-sonnet",
      "openai-oauth": "gpt-5.4",
      "copilot-proxy": "gpt-4.1",
      minimax: "MiniMax-M2.7",
      "minimax-token-plan": "MiniMax-M2.7",
      "openai-compatible": "gpt-4o"
    };
    return defaults[provider] || "gpt-4o";
  }
  async createPersistentCheckpointer() {
    if (!this.checkpointerPromise) {
      this.checkpointerPromise = (async () => {
        const checkpointsDir = path4.join(this._context.globalStorageUri.fsPath, "agent-sessions");
        await fs5.promises.mkdir(checkpointsDir, { recursive: true });
        const legacyCheckpointPath = path4.join(checkpointsDir, "langgraph-checkpoints.json");
        const checkpointRoot = path4.join(checkpointsDir, "langgraph-checkpoints-sharded");
        await fs5.promises.mkdir(checkpointRoot, { recursive: true });
        const checkpointModule = await importRuntimeModule("@langchain/langgraph-checkpoint");
        const BaseCheckpointSaver = checkpointModule.BaseCheckpointSaver;
        const copyCheckpoint = checkpointModule.copyCheckpoint;
        const getCheckpointId = checkpointModule.getCheckpointId;
        const writesIndexMap = checkpointModule.WRITES_IDX_MAP;
        const generateKey = (threadId, checkpointNamespace, checkpointId) => JSON.stringify([
          threadId,
          checkpointNamespace,
          checkpointId
        ]);
        const parseKey = (key) => {
          const [threadId, checkpointNamespace, checkpointId] = JSON.parse(key);
          return { threadId, checkpointNamespace, checkpointId };
        };
        class FileCheckpointSaver extends BaseCheckpointSaver {
          constructor(rootDir, legacyFilePath, log) {
            super();
            this.rootDir = rootDir;
            this.legacyFilePath = legacyFilePath;
            this.log = log;
          }
          rootDir;
          legacyFilePath;
          log;
          threads = /* @__PURE__ */ new Map();
          threadFilePath(threadId) {
            return path4.join(this.rootDir, encodeURIComponent(threadId), "state.json");
          }
          createEmptyThreadData() {
            return {
              storage: {},
              writes: {},
              flushQueue: Promise.resolve(),
              flushCounter: 0
            };
          }
          loadThread(threadId, options = {}) {
            const cached = this.threads.get(threadId);
            if (cached) return cached;
            const filePath = this.threadFilePath(threadId);
            let data = this.loadShardedThread(filePath);
            if (!data && options.allowLegacy) {
              data = this.loadLegacyThread(threadId);
              if (data) {
                const checkpointCount = Object.values(data.storage[threadId] ?? {}).reduce((count, checkpoints) => count + Object.keys(checkpoints).length, 0);
                this.log(`[n8n-agent-debug] migrated legacy langgraph checkpoints threadId=${threadId} checkpoints=${checkpointCount} writes=${Object.keys(data.writes).length}`);
                void this.flushThread(threadId, data).catch((error) => {
                  this.log(`[n8n-agent] Failed to persist migrated langgraph checkpoints threadId=${threadId}: ${error?.message || String(error)}`);
                });
              }
            }
            data ??= this.createEmptyThreadData();
            this.threads.set(threadId, data);
            return data;
          }
          loadShardedThread(filePath) {
            try {
              const raw = fs5.readFileSync(filePath, "utf8");
              const data = JSON.parse(raw);
              return {
                storage: data.storage && typeof data.storage === "object" ? data.storage : {},
                writes: data.writes && typeof data.writes === "object" ? data.writes : {},
                flushQueue: Promise.resolve(),
                flushCounter: 0
              };
            } catch {
              return void 0;
            }
          }
          loadLegacyThread(threadId) {
            if (!fs5.existsSync(this.legacyFilePath)) return void 0;
            const startedAt = Date.now();
            try {
              const raw = fs5.readFileSync(this.legacyFilePath, "utf8");
              const legacy = JSON.parse(raw);
              const storageForThread = legacy.storage?.[threadId];
              const writesForThread = {};
              for (const [key, value] of Object.entries(legacy.writes || {})) {
                try {
                  if (parseKey(key).threadId === threadId) {
                    writesForThread[key] = value;
                  }
                } catch {
                }
              }
              this.log(`[n8n-agent-debug] loaded legacy langgraph checkpoint file threadId=${threadId} elapsedMs=${Date.now() - startedAt} sizeBytes=${raw.length}`);
              if (!storageForThread && !Object.keys(writesForThread).length) return void 0;
              return {
                storage: storageForThread ? { [threadId]: storageForThread } : {},
                writes: writesForThread,
                flushQueue: Promise.resolve(),
                flushCounter: 0
              };
            } catch (error) {
              this.log(`[n8n-agent] Failed to load legacy langgraph checkpoints threadId=${threadId}: ${error?.message || String(error)}`);
              return void 0;
            }
          }
          encodeSerializedValue(value) {
            if (typeof value === "string") return value;
            if (value instanceof Uint8Array) {
              return new TextDecoder().decode(value);
            }
            if (value instanceof ArrayBuffer) {
              return new TextDecoder().decode(value);
            }
            if (ArrayBuffer.isView(value)) {
              return new TextDecoder().decode(value);
            }
            return this.decodeLegacySerializedValue(value);
          }
          decodeLegacySerializedValue(value) {
            if (typeof value === "string") return value;
            if (!value || typeof value !== "object") return String(value ?? "");
            const entries = Object.entries(value);
            if (!entries.length || !entries.every(([key, byte]) => /^\d+$/.test(key) && typeof byte === "number")) {
              return JSON.stringify(value);
            }
            const bytes = entries.sort(([left], [right]) => Number(left) - Number(right)).map(([, byte]) => Number(byte));
            return new TextDecoder().decode(Uint8Array.from(bytes));
          }
          async flushThread(threadId, threadData) {
            const filePath = this.threadFilePath(threadId);
            const flushStartedAt = Date.now();
            const flushTask = threadData.flushQueue.then(async () => {
              await fs5.promises.mkdir(path4.dirname(filePath), { recursive: true });
              const tmpPath = `${filePath}.${process.pid}.${Date.now()}.${threadData.flushCounter++}.tmp`;
              const payload = JSON.stringify({
                version: 2,
                storage: threadData.storage,
                writes: threadData.writes
              });
              await fs5.promises.writeFile(tmpPath, payload, "utf8");
              await fs5.promises.rename(tmpPath, filePath);
              const elapsedMs = Date.now() - flushStartedAt;
              if (elapsedMs > 500) {
                this.log(`[n8n-agent-debug] langgraph checkpoint shard flush slow threadId=${threadId} elapsedMs=${elapsedMs} sizeBytes=${payload.length}`);
              }
            });
            threadData.flushQueue = flushTask.catch(() => void 0);
            await flushTask;
          }
          async getTuple(config) {
            const threadId = config.configurable?.thread_id;
            const checkpointNamespace = config.configurable?.checkpoint_ns ?? "";
            if (!threadId) return void 0;
            let checkpointId = getCheckpointId(config);
            const threadData = this.loadThread(threadId, { allowLegacy: Boolean(checkpointId) });
            if (!checkpointId) {
              const checkpoints = threadData.storage[threadId]?.[checkpointNamespace];
              if (!checkpoints) return void 0;
              checkpointId = Object.keys(checkpoints).sort((a, b) => b.localeCompare(a))[0];
            }
            const saved = threadData.storage[threadId]?.[checkpointNamespace]?.[checkpointId];
            if (!saved) return void 0;
            const [checkpoint, metadata, parentCheckpointId] = saved;
            const key = generateKey(threadId, checkpointNamespace, checkpointId);
            const pendingWrites = await Promise.all(Object.values(threadData.writes[key] || {}).map(async ([taskId, channel, value]) => [
              taskId,
              channel,
              await this.serde.loadsTyped("json", this.decodeLegacySerializedValue(value))
            ]));
            const checkpointTuple = {
              config: { configurable: { thread_id: threadId, checkpoint_ns: checkpointNamespace, checkpoint_id: checkpointId } },
              checkpoint: await this.serde.loadsTyped("json", this.decodeLegacySerializedValue(checkpoint)),
              metadata: await this.serde.loadsTyped("json", this.decodeLegacySerializedValue(metadata)),
              pendingWrites
            };
            if (parentCheckpointId !== void 0) {
              checkpointTuple.parentConfig = { configurable: { thread_id: threadId, checkpoint_ns: checkpointNamespace, checkpoint_id: parentCheckpointId } };
            }
            return checkpointTuple;
          }
          async *list(config, options) {
            let { before, limit, filter } = options ?? {};
            const threadIds = config.configurable?.thread_id ? [config.configurable.thread_id] : fs5.existsSync(this.rootDir) ? fs5.readdirSync(this.rootDir).map((entry) => decodeURIComponent(entry)) : [];
            const configCheckpointNamespace = config.configurable?.checkpoint_ns;
            const configCheckpointId = config.configurable?.checkpoint_id;
            for (const threadId of threadIds) {
              const threadData = this.loadThread(threadId, { allowLegacy: Boolean(configCheckpointId) });
              for (const checkpointNamespace of Object.keys(threadData.storage[threadId] ?? {})) {
                if (configCheckpointNamespace !== void 0 && checkpointNamespace !== configCheckpointNamespace) continue;
                const checkpoints = threadData.storage[threadId]?.[checkpointNamespace] ?? {};
                const sortedCheckpoints = Object.entries(checkpoints).sort((a, b) => b[0].localeCompare(a[0]));
                for (const [checkpointId, [checkpoint, metadataStr, parentCheckpointId]] of sortedCheckpoints) {
                  if (configCheckpointId && checkpointId !== configCheckpointId) continue;
                  if (before?.configurable?.checkpoint_id && checkpointId >= before.configurable.checkpoint_id) continue;
                  const metadata = await this.serde.loadsTyped("json", this.decodeLegacySerializedValue(metadataStr));
                  if (filter && !Object.entries(filter).every(([key2, value]) => metadata?.[key2] === value)) continue;
                  if (limit !== void 0) {
                    if (limit <= 0) break;
                    limit -= 1;
                  }
                  const key = generateKey(threadId, checkpointNamespace, checkpointId);
                  const pendingWrites = await Promise.all(Object.values(threadData.writes[key] || {}).map(async ([taskId, channel, value]) => [
                    taskId,
                    channel,
                    await this.serde.loadsTyped("json", this.decodeLegacySerializedValue(value))
                  ]));
                  const checkpointTuple = {
                    config: { configurable: { thread_id: threadId, checkpoint_ns: checkpointNamespace, checkpoint_id: checkpointId } },
                    checkpoint: await this.serde.loadsTyped("json", this.decodeLegacySerializedValue(checkpoint)),
                    metadata,
                    pendingWrites
                  };
                  if (parentCheckpointId !== void 0) {
                    checkpointTuple.parentConfig = { configurable: { thread_id: threadId, checkpoint_ns: checkpointNamespace, checkpoint_id: parentCheckpointId } };
                  }
                  yield checkpointTuple;
                }
              }
            }
          }
          async put(config, checkpoint, metadata) {
            const preparedCheckpoint = copyCheckpoint(checkpoint);
            const threadId = config.configurable?.thread_id;
            const checkpointNamespace = config.configurable?.checkpoint_ns ?? "";
            if (!threadId) {
              throw new Error("Failed to put checkpoint. The passed RunnableConfig is missing configurable.thread_id.");
            }
            const threadData = this.loadThread(threadId);
            threadData.storage[threadId] ??= {};
            threadData.storage[threadId][checkpointNamespace] ??= {};
            const [[, serializedCheckpoint], [, serializedMetadata]] = await Promise.all([
              this.serde.dumpsTyped(preparedCheckpoint),
              this.serde.dumpsTyped(metadata)
            ]);
            threadData.storage[threadId][checkpointNamespace][checkpoint.id] = [
              this.encodeSerializedValue(serializedCheckpoint),
              this.encodeSerializedValue(serializedMetadata),
              config.configurable?.checkpoint_id
            ];
            await this.flushThread(threadId, threadData);
            return { configurable: { thread_id: threadId, checkpoint_ns: checkpointNamespace, checkpoint_id: checkpoint.id } };
          }
          async putWrites(config, writes, taskId) {
            const threadId = config.configurable?.thread_id;
            const checkpointNamespace = config.configurable?.checkpoint_ns ?? "";
            const checkpointId = config.configurable?.checkpoint_id;
            if (!threadId) {
              throw new Error("Failed to put writes. The passed RunnableConfig is missing configurable.thread_id.");
            }
            if (!checkpointId) {
              throw new Error("Failed to put writes. The passed RunnableConfig is missing configurable.checkpoint_id.");
            }
            const outerKey = generateKey(threadId, checkpointNamespace, checkpointId);
            const threadData = this.loadThread(threadId);
            const existingWrites = threadData.writes[outerKey];
            threadData.writes[outerKey] ??= {};
            await Promise.all(writes.map(async ([channel, value], idx) => {
              const [, serializedValue] = await this.serde.dumpsTyped(value);
              const writeIndex = writesIndexMap[channel] ?? idx;
              const innerKey = `${taskId},${writeIndex}`;
              if (writeIndex >= 0 && existingWrites && innerKey in existingWrites) return;
              threadData.writes[outerKey][innerKey] = [taskId, channel, this.encodeSerializedValue(serializedValue)];
            }));
            await this.flushThread(threadId, threadData);
          }
          async deleteThread(threadId) {
            const threadData = this.createEmptyThreadData();
            this.threads.set(threadId, threadData);
            await this.flushThread(threadId, threadData);
          }
        }
        return new FileCheckpointSaver(checkpointRoot, legacyCheckpointPath, (message) => this.outputChannel.appendLine(message));
      })();
    }
    return this.checkpointerPromise;
  }
  buildAgentBackendEnv() {
    return {
      PATH: process.env.PATH || "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
    };
  }
  createStreamAccumulator() {
    return { responseText: "", thinkingText: "" };
  }
  shouldShowToolOperation(toolName) {
    return !["ls", "glob", "grep"].includes(toolName);
  }
  categorizeTool(toolName) {
    const normalized = toolName.toLowerCase();
    if (normalized.includes("todo")) return "todo";
    if (normalized.includes("write") || normalized.includes("edit") || normalized.includes("delete") || normalized.includes("move")) return "file-write";
    if (normalized.includes("read")) return "file-read";
    if (normalized.includes("shell") || normalized.includes("execute")) return "shell";
    return "tool";
  }
  formatToolLabel(toolName) {
    return toolName.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }
  extractCommandFromToolPayload(value) {
    const visited = /* @__PURE__ */ new Set();
    const visit = (candidate) => {
      if (candidate === void 0 || candidate === null || visited.has(candidate)) return void 0;
      if (typeof candidate === "string") {
        const trimmed = candidate.trim();
        if (!trimmed) return void 0;
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
          try {
            return visit(JSON.parse(trimmed));
          } catch {
            return trimmed.includes("\n") ? void 0 : trimmed;
          }
        }
        return trimmed.includes("\n") ? void 0 : trimmed;
      }
      if (Array.isArray(candidate)) {
        for (const item of candidate) {
          const command = visit(item);
          if (command) return command;
        }
        return void 0;
      }
      if (typeof candidate === "object") {
        visited.add(candidate);
        const record = candidate;
        for (const key of ["command", "cmd", "shell", "script"]) {
          if (typeof record[key] === "string" && record[key].trim()) return record[key].trim();
        }
        for (const key of ["input", "args", "kwargs"]) {
          const command = visit(record[key]);
          if (command) return command;
        }
      }
      return void 0;
    };
    return visit(value);
  }
  extractFilePathFromToolPayload(value) {
    const visited = /* @__PURE__ */ new Set();
    const visit = (candidate) => {
      if (candidate === void 0 || candidate === null || visited.has(candidate)) return void 0;
      if (typeof candidate === "string") {
        const trimmed = candidate.trim();
        if (!trimmed) return void 0;
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
          try {
            return visit(JSON.parse(trimmed));
          } catch {
            return void 0;
          }
        }
        return void 0;
      }
      if (Array.isArray(candidate)) {
        for (const item of candidate) {
          const filePath = visit(item);
          if (filePath) return filePath;
        }
        return void 0;
      }
      if (typeof candidate === "object") {
        visited.add(candidate);
        const record = candidate;
        for (const key of ["file_path", "filePath", "path"]) {
          if (typeof record[key] === "string" && record[key].trim()) return record[key].trim();
        }
        for (const key of ["input", "args", "kwargs"]) {
          const filePath = visit(record[key]);
          if (filePath) return filePath;
        }
      }
      return void 0;
    };
    return visit(value);
  }
  extractTodoSummary(value) {
    const todos = this.extractTodosFromPayload(value);
    if (!todos.length) return void 0;
    const counts = todos.reduce((acc, todo) => {
      const status = String(todo.status || "pending");
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    return [
      `${todos.length} todo${todos.length === 1 ? "" : "s"}`,
      counts.in_progress ? `${counts.in_progress} in progress` : void 0,
      counts.pending ? `${counts.pending} pending` : void 0,
      counts.completed ? `${counts.completed} completed` : void 0
    ].filter(Boolean).join(" \xB7 ");
  }
  extractTodosFromPayload(value) {
    const visited = /* @__PURE__ */ new Set();
    const visit = (candidate) => {
      if (candidate === void 0 || candidate === null || visited.has(candidate)) return [];
      if (typeof candidate === "string") {
        const trimmed = candidate.trim();
        if (!trimmed || !trimmed.startsWith("{") && !trimmed.startsWith("[")) return [];
        try {
          return visit(JSON.parse(trimmed));
        } catch {
          return [];
        }
      }
      if (Array.isArray(candidate)) {
        if (candidate.every((item) => item && typeof item === "object" && "content" in item)) {
          return candidate;
        }
        return candidate.flatMap((item) => visit(item));
      }
      if (typeof candidate === "object") {
        visited.add(candidate);
        const record = candidate;
        if (Array.isArray(record.todos)) return visit(record.todos);
        for (const key of ["update", "input", "args", "kwargs"]) {
          const todos = visit(record[key]);
          if (todos.length) return todos;
        }
      }
      return [];
    };
    return visit(value);
  }
  stringifyToolOutput(value) {
    const extracted = this.extractToolMessageContent(value);
    return extracted ?? this.stringifyToolPayload(value);
  }
  extractToolMessageContent(value) {
    if (value === void 0 || value === null) return void 0;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return void 0;
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          return this.extractToolMessageContent(JSON.parse(trimmed));
        } catch {
          return trimmed;
        }
      }
      return trimmed;
    }
    if (Array.isArray(value)) {
      const parts = value.map((item) => this.extractToolMessageContent(item)).filter(Boolean);
      return parts.length ? parts.join("\n") : void 0;
    }
    if (typeof value === "object") {
      const record = value;
      const kwargs = record.kwargs && typeof record.kwargs === "object" ? record.kwargs : void 0;
      if (typeof kwargs?.content === "string") return kwargs.content.trim() || void 0;
      if (typeof record.content === "string") return record.content.trim() || void 0;
      if (Array.isArray(record.content)) return this.extractToolMessageContent(record.content);
      if (record.output !== void 0) return this.extractToolMessageContent(record.output);
    }
    return void 0;
  }
  stringifyToolPayload(value) {
    if (value === void 0 || value === null) return void 0;
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  extractCompactionSummary(value) {
    if (!this.isRecord(value)) return void 0;
    if (typeof value.summary !== "string" && typeof value.compaction !== "object") return void 0;
    return this.toCompactionSummary(this.isRecord(value.compaction) ? value.compaction : value);
  }
  async summarizeSessionForCompaction(sessionId, input, entries, signal) {
    const text = entries.map((entry) => this.getEntryText(entry)).filter(Boolean).join("\n\n").slice(-16e3);
    if (!text.trim()) {
      return {
        summary: "No conversation content was available to compact.",
        source: "fallback",
        messagesCompacted: 0,
        preservedRecentMessages: 0
      };
    }
    try {
      const providerRegistry = await this.loadAgentProviderRegistry();
      const providerConfig = await this.getProviderRuntimeConfig(providerRegistry);
      if (!providerConfig.ready) throw new Error(providerConfig.reason || "Provider is not ready.");
      const model = await this.createLangChainModel(providerConfig);
      const response = await model.invoke([
        { role: "user", content: `Summarize this Workbench conversation for future agent context. Keep key decisions, files, workflow context, and next steps.

${text}` }
      ], { signal });
      return {
        summary: this.extractAgentText({ messages: [response] }) || "Context compacted.",
        source: "llm",
        messagesCompacted: entries.length,
        preservedRecentMessages: Math.min(4, entries.length)
      };
    } catch (error) {
      return {
        summary: `Context compaction fallback: ${text.slice(-1200)}`,
        source: "fallback",
        messagesCompacted: entries.length,
        preservedRecentMessages: Math.min(4, entries.length),
        fallbackReason: error?.message || String(error)
      };
    }
  }
  async ensureAgentHandleWithCheckpoint(input) {
    const providerRegistry = await this.loadAgentProviderRegistry();
    const providerConfig = await this.getProviderRuntimeConfig(providerRegistry);
    if (!providerConfig.ready) {
      throw new Error(providerConfig.reason || "Agent provider is not ready.");
    }
    const handle = await this.getDeepAgentHandle(providerConfig, { ...input, prompt: "" });
    const sessions = await this.getSessionRuntime();
    sessions.service.setCheckpointer(handle.checkpointer);
    return handle;
  }
  async resolveContextWindow(provider, model, apiKey, baseUrl) {
    if (!model) {
      return DEFAULT_CONTEXT_WINDOW_TOKENS;
    }
    const normalizedModel = model.toLowerCase();
    if (provider === "openai-oauth" || provider === "openai") {
      if (/gpt-5/i.test(normalizedModel)) return 4e5;
      if (/gpt-4\.1|gpt-4o/i.test(normalizedModel)) return 128e3;
    }
    if (provider === "copilot-proxy") {
      if (/gpt-4\.1|gpt-5/i.test(normalizedModel)) return 128e3;
    }
    if (provider === "minimax" || provider === "minimax-token-plan") {
      return 2e5;
    }
    void apiKey;
    void baseUrl;
    return DEFAULT_CONTEXT_WINDOW_TOKENS;
  }
  isCompactionState(value) {
    return Boolean(
      value && typeof value === "object" && Array.isArray(value.compactionHistory) && typeof value.totalCompactions === "number"
    );
  }
};

// src/services/agent-provider-service.ts
var OPENAI_CODEX_CLIENT_ID = "app_EMoamEEZ73f0CkXaXp7hrann";
var OPENAI_CODEX_DEVICE_REDIRECT_URI = "https://auth.openai.com/deviceauth/callback";
var DISABLED_PROVIDERS_STATE_KEY = "n8n.agent.disabledProviders";
var MINIMAX_DISCOVERY_CANDIDATE_MODELS = [
  "MiniMax-M2.7",
  "MiniMax-M2.7-highspeed",
  "MiniMax-M2.5",
  "MiniMax-M2.5-highspeed",
  "MiniMax-M2.1",
  "MiniMax-M2.1-highspeed",
  "MiniMax-M2"
];
var MODEL_LIST_MAPPER = (payload) => {
  const data = Array.isArray(payload.data) ? payload.data : [];
  return data.map((entry) => entry && typeof entry === "object" ? String(entry.id || "").trim() : "").filter(Boolean).sort((left, right) => left.localeCompare(right));
};
var AGENT_PROVIDER_DEFINITIONS = {
  anthropic: {
    id: "anthropic",
    label: "Claude API",
    description: "ANTHROPIC_API_KEY",
    defaultModel: "claude-haiku-4-5",
    requiresApiKey: true,
    authKind: "api-key",
    envKeys: ["ANTHROPIC_LLM_API_KEY", "ANTHROPIC_API_KEY"],
    canDiscoverModels: true
  },
  openai: {
    id: "openai",
    label: "OpenAI API",
    description: "OPENAI_API_KEY",
    defaultModel: "gpt-4o",
    defaultBaseUrl: "https://api.openai.com/v1",
    requiresApiKey: true,
    authKind: "api-key",
    envKeys: ["OPENAI_LLM_API_KEY", "OPENAI_API_KEY"],
    canDiscoverModels: true
  },
  google: {
    id: "google",
    label: "Gemini API",
    description: "GOOGLE_GENERATIVE_AI_API_KEY",
    defaultModel: "gemini-3-flash-preview",
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    requiresApiKey: true,
    authKind: "api-key",
    envKeys: ["GOOGLE_GENERATIVE_AI_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY", "GEMINI_LLM_API_KEY", "GOOGLE_LLM_API_KEY"],
    canDiscoverModels: true
  },
  mistral: {
    id: "mistral",
    label: "Mistral API",
    description: "MISTRAL_API_KEY",
    defaultModel: "mistral-large-latest",
    defaultBaseUrl: "https://api.mistral.ai/v1",
    requiresApiKey: true,
    authKind: "api-key",
    envKeys: ["MISTRAL_API_KEY", "MISTRAL_LLM_API_KEY"],
    canDiscoverModels: true
  },
  openrouter: {
    id: "openrouter",
    label: "OpenRouter API",
    description: "OPENROUTER_API_KEY",
    defaultModel: "anthropic/claude-3.5-sonnet",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    requiresApiKey: true,
    authKind: "api-key",
    envKeys: ["OPENROUTER_API_KEY", "OPENROUTER_LLM_API_KEY"],
    canDiscoverModels: true
  },
  "openai-oauth": {
    id: "openai-oauth",
    label: "OpenAI ChatGPT OAuth",
    description: "ChatGPT subscription, device flow",
    defaultModel: "gpt-5.4",
    defaultBaseUrl: "https://chatgpt.com/backend-api",
    requiresApiKey: false,
    authKind: "oauth-device",
    envKeys: [],
    canDiscoverModels: true
  },
  "copilot-proxy": {
    id: "copilot-proxy",
    label: "GitHub Copilot OAuth",
    description: "GitHub Copilot subscription, device flow",
    defaultModel: "gpt-4.1",
    defaultBaseUrl: "https://api.individual.githubcopilot.com",
    requiresApiKey: false,
    authKind: "oauth-device",
    envKeys: ["COPILOT_GITHUB_TOKEN", "GH_TOKEN", "GITHUB_TOKEN"],
    canDiscoverModels: true
  },
  minimax: {
    id: "minimax",
    label: "MiniMax API",
    description: "MINIMAX_API_KEY",
    defaultModel: "MiniMax-M2.7",
    defaultBaseUrl: "https://api.minimax.io/anthropic",
    requiresApiKey: true,
    authKind: "api-key",
    envKeys: ["MINIMAX_API_KEY"],
    canDiscoverModels: true
  },
  "minimax-token-plan": {
    id: "minimax-token-plan",
    label: "MiniMax Token Plan",
    description: "MINIMAX_TOKEN_PLAN_API_KEY",
    defaultModel: "MiniMax-M2.7",
    defaultBaseUrl: "https://api.minimax.io/anthropic",
    requiresApiKey: true,
    authKind: "api-key",
    envKeys: ["MINIMAX_TOKEN_PLAN_API_KEY"],
    canDiscoverModels: true
  },
  "openai-compatible": {
    id: "openai-compatible",
    label: "OpenAI Compatible",
    description: "Custom base URL",
    defaultModel: "",
    requiresApiKey: false,
    authKind: "api-key",
    envKeys: ["OPENAI_COMPATIBLE_API_KEY"],
    canDiscoverModels: true
  }
};
var AGENT_SELECTABLE_PROVIDERS = Object.freeze(Object.keys(AGENT_PROVIDER_DEFINITIONS));
function normalizeAgentProviderId3(provider) {
  const normalized = provider?.trim().toLowerCase();
  if (!normalized) return void 0;
  if (normalized === "claude") return "anthropic";
  if (normalized === "anthropic-proxy") return "anthropic";
  if (normalized === "gemini") return "google";
  return normalized in AGENT_PROVIDER_DEFINITIONS ? normalized : void 0;
}
function providerNeedsBaseUrlInput(provider) {
  return provider === "openai-compatible";
}
function providerSupportsReasoningEffort(provider, model) {
  return getReasoningCapability(provider, model).supported;
}
var AgentProviderService = class {
  constructor(context) {
    this.context = context;
  }
  context;
  getDefinition(provider) {
    return AGENT_PROVIDER_DEFINITIONS[normalizeAgentProviderId3(provider) || "openai"];
  }
  async getStoredCredential(provider) {
    return this.context.secrets.get(getAgentProviderSecretKey(provider));
  }
  async listProviderConnectionStates() {
    const settings = readAgentProviderSettings(this.context.globalState);
    const selectedProvider = settings.provider;
    const selectedModel = settings.model;
    const configuredBaseUrl = settings.baseUrl;
    const selectedReasoningEffort = settings.reasoningEffort;
    const disabledProviders = this.getDisabledProviders();
    const states = await Promise.all(AGENT_SELECTABLE_PROVIDERS.map(async (provider) => {
      const definition = AGENT_PROVIDER_DEFINITIONS[provider];
      const hasStoredCredential = Boolean(await this.getStoredCredential(provider));
      const providerDisabled = disabledProviders.has(provider);
      const hasEnvironmentCredential = !providerDisabled && this.hasEnvironmentCredential(provider);
      const connected = !providerDisabled && (hasStoredCredential || hasEnvironmentCredential);
      return {
        id: provider,
        label: definition.label,
        description: definition.description,
        authKind: definition.authKind,
        defaultModel: definition.defaultModel,
        defaultBaseUrl: definition.defaultBaseUrl,
        requiresApiKey: definition.requiresApiKey,
        connected,
        credentialSource: hasStoredCredential ? "secret" : hasEnvironmentCredential ? "environment" : void 0,
        selected: provider === selectedProvider,
        model: provider === selectedProvider ? selectedModel : void 0,
        baseUrl: provider === "openai-compatible" ? configuredBaseUrl : definition.defaultBaseUrl,
        supportsReasoningEffort: providerSupportsReasoningEffort(provider, provider === selectedProvider ? selectedModel : definition.defaultModel),
        reasoningEffort: provider === selectedProvider && providerSupportsReasoningEffort(provider, selectedModel) ? selectedReasoningEffort : void 0
      };
    }));
    return states;
  }
  async disconnectProvider(provider) {
    await this.context.secrets.delete(getAgentProviderSecretKey(provider));
    await this.setProviderDisabled(provider, true);
    const selectedProvider = readAgentProviderSettings(this.context.globalState).provider;
    if (selectedProvider === provider) {
      await updateAgentProviderSettings(this.context.globalState, {
        provider: "openai",
        model: AGENT_PROVIDER_DEFINITIONS.openai.defaultModel,
        baseUrl: void 0,
        reasoningEffort: void 0
      });
    }
  }
  hasEnvironmentCredential(provider) {
    return AGENT_PROVIDER_DEFINITIONS[provider].envKeys.some((key) => Boolean(process.env[key]?.trim()));
  }
  async setupProvider(provider) {
    const definition = AGENT_PROVIDER_DEFINITIONS[provider];
    const settings = readAgentProviderSettings(this.context.globalState);
    const previousProvider = settings.provider;
    await this.setProviderDisabled(provider, false);
    let nextBaseUrl;
    if (providerNeedsBaseUrlInput(provider)) {
      const baseUrl = await vscode13.window.showInputBox({
        title: "OpenAI-compatible base URL",
        prompt: "Only OpenAI-compatible providers allow a custom base URL.",
        value: settings.baseUrl || "",
        ignoreFocusOut: true,
        validateInput: (value) => {
          if (!value.trim()) return "Base URL is required for OpenAI-compatible providers.";
          try {
            new URL(value.trim());
            return void 0;
          } catch {
            return "Enter a valid URL.";
          }
        }
      });
      if (baseUrl === void 0) return false;
      nextBaseUrl = baseUrl.trim().replace(/\/$/, "");
    }
    if (definition.authKind === "api-key") {
      const apiKey = await vscode13.window.showInputBox({
        title: `Set ${definition.label} API key`,
        prompt: "Stored in VS Code Secret Storage. Leave empty to clear the stored key and rely on environment credentials if available.",
        password: true,
        ignoreFocusOut: true
      });
      if (apiKey === void 0) return false;
      const trimmed = apiKey.trim();
      if (trimmed) {
        await this.context.secrets.store(getAgentProviderSecretKey(provider), trimmed);
      } else {
        await this.context.secrets.delete(getAgentProviderSecretKey(provider));
      }
    } else if (definition.authKind === "setup-token") {
      const token = await vscode13.window.showInputBox({
        title: "Connect Claude account",
        prompt: "Run `claude setup-token` in a logged-in Claude CLI, then paste the generated setup-token.",
        password: true,
        ignoreFocusOut: true
      });
      if (token === void 0) return false;
      if (token.trim()) await this.context.secrets.store(getAgentProviderSecretKey(provider), token.trim());
    } else if (definition.authKind === "oauth-device") {
      await this.runDeviceFlow(provider);
    }
    const currentModel = settings.model;
    await updateAgentProviderSettings(this.context.globalState, {
      provider,
      baseUrl: nextBaseUrl,
      model: !currentModel || previousProvider !== provider ? definition.defaultModel : currentModel
    });
    return true;
  }
  async selectModel(provider) {
    const definition = AGENT_PROVIDER_DEFINITIONS[provider];
    const models = await this.fetchAvailableModels(provider).catch(() => []);
    const currentModel = readAgentProviderSettings(this.context.globalState).model || definition.defaultModel;
    const items = [...new Set([...models.length ? models : [], definition.defaultModel, currentModel].filter(Boolean))].map((model) => ({ label: model, picked: model === currentModel }));
    const picked = await vscode13.window.showQuickPick(items, {
      title: `Select ${definition.label} model`,
      placeHolder: models.length ? "Live model list from provider" : "Live model list unavailable; using known defaults",
      ignoreFocusOut: true
    });
    if (!picked) return void 0;
    await updateAgentProviderSettings(this.context.globalState, { provider, model: picked.label });
    await this.syncReasoningEffortConfiguration(provider, picked.label);
    return picked.label;
  }
  async selectReasoningEffort(provider, model) {
    if (!providerSupportsReasoningEffort(provider, model)) {
      await updateAgentProviderSettings(this.context.globalState, { reasoningEffort: void 0 });
      return void 0;
    }
    const settings = readAgentProviderSettings(this.context.globalState);
    const capability = getReasoningCapability(provider, model || settings.model || "");
    const defaultReasoningEffort = this.getDefaultReasoningEffort(provider, model || settings.model || "");
    const current = normalizeReasoningEffortForCapability(settings.reasoningEffort, capability) || defaultReasoningEffort;
    const picked = await vscode13.window.showQuickPick(
      capability.efforts.map((effort) => ({
        label: effort,
        picked: effort === current,
        description: effort === defaultReasoningEffort ? "Provider default" : void 0
      })),
      {
        title: "Select reasoning effort",
        placeHolder: "Controls provider-specific reasoning or thinking budget when supported.",
        ignoreFocusOut: true
      }
    );
    if (!picked) return current;
    await updateAgentProviderSettings(this.context.globalState, { reasoningEffort: picked.label });
    return picked.label;
  }
  async syncReasoningEffortConfiguration(provider, model) {
    if (!providerSupportsReasoningEffort(provider, model)) {
      await updateAgentProviderSettings(this.context.globalState, { reasoningEffort: void 0 });
      return void 0;
    }
    const settings = readAgentProviderSettings(this.context.globalState);
    const capability = getReasoningCapability(provider, model || settings.model || "");
    const current = normalizeReasoningEffortForCapability(settings.reasoningEffort, capability);
    const defaultReasoningEffort = this.getDefaultReasoningEffort(provider, model || settings.model || "");
    const next = current || defaultReasoningEffort;
    await updateAgentProviderSettings(this.context.globalState, { reasoningEffort: next });
    return next;
  }
  async fetchAvailableModels(provider) {
    const definition = AGENT_PROVIDER_DEFINITIONS[provider];
    if (!definition.canDiscoverModels) return [];
    const apiKey = await this.getStoredCredential(provider) || this.readEnvironmentCredential(provider);
    const configuredBaseUrl = readAgentProviderSettings(this.context.globalState).baseUrl || "";
    const baseUrl = provider === "openai-compatible" ? configuredBaseUrl : definition.defaultBaseUrl;
    if ((definition.requiresApiKey || provider !== "openai-compatible") && !apiKey && definition.authKind !== "none") {
      return [];
    }
    if (provider === "anthropic") {
      return this.fetchJsonModels("https://api.anthropic.com/v1/models", { "x-api-key": apiKey || "", "anthropic-version": "2023-06-01" });
    }
    if (provider === "google") {
      return (await this.fetchJsonModels("https://generativelanguage.googleapis.com/v1beta/openai/models", { Authorization: `Bearer ${apiKey}` })).map((model) => model.replace(/^models\//, "")).filter((model) => /^gemini-/i.test(model));
    }
    if (provider === "openai-oauth") {
      return this.fetchOpenAiOauthModels(apiKey || "");
    }
    if (provider === "copilot-proxy") {
      return fetchGitHubCopilotModels(apiKey || "");
    }
    if (provider === "minimax" || provider === "minimax-token-plan") {
      return this.probeMiniMaxModels(apiKey || "", baseUrl || definition.defaultBaseUrl);
    }
    const modelsUrl = provider === "openai-compatible" ? baseUrl ? `${baseUrl.replace(/\/$/, "")}/models` : void 0 : `${(baseUrl || "").replace(/\/$/, "")}/models`;
    if (!modelsUrl) return [];
    return this.fetchJsonModels(modelsUrl, apiKey ? { Authorization: `Bearer ${apiKey}` } : {});
  }
  readEnvironmentCredential(provider) {
    if (this.getDisabledProviders().has(provider)) return void 0;
    for (const key of AGENT_PROVIDER_DEFINITIONS[provider].envKeys) {
      const value = process.env[key]?.trim();
      if (value) return value;
    }
    return void 0;
  }
  async probeMiniMaxModels(apiKey, baseUrl) {
    if (!apiKey) return [];
    const url = this.getMiniMaxCompletionDiscoveryUrl(baseUrl);
    const checks = await Promise.all(
      MINIMAX_DISCOVERY_CANDIDATE_MODELS.map(async (model) => {
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model,
              messages: [{ role: "user", content: "ping" }],
              max_tokens: 1
            })
          });
          return response.ok ? model : void 0;
        } catch {
          return void 0;
        }
      })
    );
    return checks.filter((model) => Boolean(model));
  }
  getMiniMaxCompletionDiscoveryUrl(baseUrl) {
    const resolvedBaseUrl = baseUrl || AGENT_PROVIDER_DEFINITIONS.minimax.defaultBaseUrl || "https://api.minimax.io/anthropic";
    if (resolvedBaseUrl.endsWith("/anthropic")) {
      return resolvedBaseUrl.replace(/\/anthropic\/?$/, "/v1/chat/completions");
    }
    return `${resolvedBaseUrl.replace(/\/$/, "")}/v1/chat/completions`;
  }
  getDisabledProviders() {
    const disabled = this.context.globalState.get(DISABLED_PROVIDERS_STATE_KEY, []);
    return new Set(disabled.map((provider) => normalizeAgentProviderId3(provider)).filter((provider) => Boolean(provider)));
  }
  async setProviderDisabled(provider, disabled) {
    const providers = this.getDisabledProviders();
    if (disabled) {
      providers.add(provider);
    } else {
      providers.delete(provider);
    }
    await this.context.globalState.update(DISABLED_PROVIDERS_STATE_KEY, [...providers]);
  }
  async fetchJsonModels(url, headers) {
    const response = await fetch(url, { headers: { Accept: "application/json", ...headers } });
    if (!response.ok) return [];
    const payload = await response.json();
    return [...new Set(MODEL_LIST_MAPPER(payload))];
  }
  getDefaultReasoningEffort(provider, model) {
    const capability = getReasoningCapability(provider, model || AGENT_PROVIDER_DEFINITIONS[provider].defaultModel);
    if (provider === "openai-oauth" && model.includes("codex-mini")) return "minimal";
    return capability.defaultEffort || "medium";
  }
  async fetchOpenAiOauthModels(accessToken) {
    if (!accessToken) return [];
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    };
    const accountId = this.extractChatGptAccountId(accessToken);
    if (accountId) {
      headers["chatgpt-account-id"] = accountId;
    }
    const response = await fetch("https://chatgpt.com/backend-api/codex/models?client_version=1.0.0", { headers });
    if (!response.ok) return [];
    const payload = await response.json();
    return [...new Set((payload.models ?? []).filter((model) => typeof model.slug === "string" && model.slug.trim().length > 0).filter((model) => (model.visibility ?? "list") === "list").sort((left, right) => (left.priority ?? Number.MAX_SAFE_INTEGER) - (right.priority ?? Number.MAX_SAFE_INTEGER)).map((model) => model.slug.trim()))];
  }
  extractChatGptAccountId(accessToken) {
    try {
      const parts = accessToken.split(".");
      if (parts.length !== 3) return void 0;
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
      const claim = payload["https://api.openai.com/auth"];
      return typeof claim?.chatgpt_account_id === "string" ? claim.chatgpt_account_id : void 0;
    } catch {
      return void 0;
    }
  }
  async runDeviceFlow(provider) {
    const challenge = provider === "openai-oauth" ? await this.beginOpenAiDeviceAuth() : await this.beginGitHubDeviceAuth();
    const cancellationSource = new vscode13.CancellationTokenSource();
    const authPanel = this.showDeviceFlowModal(provider, challenge, cancellationSource);
    try {
      const token = await vscode13.window.withProgress({
        location: vscode13.ProgressLocation.Notification,
        title: provider === "openai-oauth" ? "Waiting for OpenAI authorization" : "Waiting for GitHub authorization",
        cancellable: true
      }, async (progress, cancellationToken) => {
        const disposable = cancellationToken.onCancellationRequested(() => cancellationSource.cancel());
        try {
          progress.report({ message: `Code ${challenge.userCode}` });
          return provider === "openai-oauth" ? this.completeOpenAiDeviceAuth(challenge, cancellationSource.token) : this.completeGitHubDeviceAuth(challenge, cancellationSource.token);
        } finally {
          disposable.dispose();
        }
      });
      await this.context.secrets.store(getAgentProviderSecretKey(provider), token);
      vscode13.window.showInformationMessage(`${AGENT_PROVIDER_DEFINITIONS[provider].label} connected.`);
    } finally {
      authPanel.dispose();
      cancellationSource.dispose();
    }
  }
  showDeviceFlowModal(provider, challenge, cancellationSource) {
    const title = provider === "openai-oauth" ? "Connect OpenAI account" : "Connect GitHub Copilot";
    void vscode13.env.clipboard.writeText(challenge.userCode).then(void 0, () => void 0);
    void vscode13.env.openExternal(vscode13.Uri.parse(challenge.verificationUri));
    return this.showDeviceFlowWebview(title, provider, challenge, cancellationSource);
  }
  showDeviceFlowWebview(title, provider, challenge, cancellationSource) {
    const panel = vscode13.window.createWebviewPanel(
      "n8nAgentDeviceAuth",
      title,
      vscode13.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: false, localResourceRoots: [] }
    );
    panel.webview.html = this.buildDeviceFlowHtml(title, provider, challenge);
    const disposable = panel.webview.onDidReceiveMessage(async (message) => {
      if (!message || typeof message !== "object") return;
      const payload = message;
      if (payload.type === "copyCode") {
        await vscode13.env.clipboard.writeText(challenge.userCode);
        await panel.webview.postMessage({ type: "copied" });
        return;
      }
      if (payload.type === "openBrowser") {
        await vscode13.env.openExternal(vscode13.Uri.parse(challenge.verificationUri));
        return;
      }
      if (payload.type === "cancel") {
        cancellationSource.cancel();
        panel.dispose();
      }
    });
    panel.onDidDispose(() => disposable.dispose());
    return panel;
  }
  buildDeviceFlowHtml(title, provider, challenge) {
    const nonce = this.getNonce();
    const providerLabel = this.escapeHtml(AGENT_PROVIDER_DEFINITIONS[provider].label);
    const safeTitle = this.escapeHtml(title);
    const code = this.escapeHtml(challenge.userCode);
    const verificationUri = this.escapeHtml(challenge.verificationUri);
    const expiresInMinutes = Math.max(1, Math.ceil((challenge.expiresAt - Date.now()) / 6e4));
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>
    :root {
      --bg: var(--vscode-editor-background);
      --panel: var(--vscode-sideBar-background, var(--vscode-editor-background));
      --text: var(--vscode-editor-foreground);
      --muted: var(--vscode-descriptionForeground);
      --border: var(--vscode-panel-border, var(--vscode-input-border));
      --accent: var(--vscode-button-background);
      --accentText: var(--vscode-button-foreground);
    }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; background: var(--bg); color: var(--text); font-family: var(--vscode-font-family); }
    main { width: min(560px, 100%); border: 1px solid var(--border); border-radius: 14px; background: var(--panel); padding: 22px; display: grid; gap: 16px; box-shadow: 0 18px 60px rgba(0,0,0,.28); }
    h1, p { margin: 0; }
    h1 { font-size: 22px; }
    .muted { color: var(--muted); line-height: 1.45; }
    .code { border: 1px solid var(--border); border-radius: 12px; padding: 18px; text-align: center; font-size: 34px; font-weight: 800; letter-spacing: .16em; background: var(--vscode-input-background); user-select: all; }
    .url { color: var(--vscode-textLink-foreground); overflow-wrap: anywhere; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-end; }
    button { min-height: 34px; border: 1px solid transparent; border-radius: 7px; padding: 0 13px; color: var(--accentText); background: var(--accent); font-weight: 650; cursor: pointer; }
    button.secondary { color: var(--text); background: transparent; border-color: var(--border); }
    .copied { display: none; color: var(--vscode-testing-iconPassed, var(--text)); font-size: 12px; }
  </style>
</head>
<body>
  <main>
    <div>
      <h1>${safeTitle}</h1>
      <p class="muted">Authorize ${providerLabel} in your browser. n8n-as-code detects completion automatically.</p>
    </div>
    <div class="code" aria-label="Device code">${code}</div>
    <p class="muted">Open <span class="url">${verificationUri}</span> and enter this code. It expires in about ${expiresInMinutes} minutes.</p>
    <div id="copied" class="copied">Code copied to clipboard.</div>
    <div class="actions">
      <button id="copy" class="secondary" type="button">Copy Code</button>
      <button id="open" class="secondary" type="button">Open Browser</button>
      <button id="cancel" class="secondary" type="button">Cancel</button>
    </div>
  </main>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    document.getElementById('copy').addEventListener('click', () => vscode.postMessage({ type: 'copyCode' }));
    document.getElementById('open').addEventListener('click', () => vscode.postMessage({ type: 'openBrowser' }));
    document.getElementById('cancel').addEventListener('click', () => vscode.postMessage({ type: 'cancel' }));
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'copied') {
        const copied = document.getElementById('copied');
        copied.style.display = 'block';
        setTimeout(() => copied.style.display = 'none', 1400);
      }
    });
  </script>
</body>
</html>`;
  }
  escapeHtml(value) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  getNonce() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let nonce = "";
    for (let i = 0; i < 32; i++) {
      nonce += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return nonce;
  }
  async beginOpenAiDeviceAuth() {
    const response = await fetch("https://auth.openai.com/api/accounts/deviceauth/usercode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: OPENAI_CODEX_CLIENT_ID })
    });
    if (!response.ok) throw new Error(`OpenAI device login failed: HTTP ${response.status}`);
    const payload = await response.json();
    const deviceAuthId = String(payload.device_auth_id || "");
    const userCode = String(payload.user_code || "");
    if (!deviceAuthId || !userCode) throw new Error("OpenAI device login returned an incomplete challenge.");
    const intervalSeconds = Number.parseInt(String(payload.interval || "5"), 10);
    return {
      verificationUri: "https://auth.openai.com/codex/device",
      userCode,
      deviceAuthId,
      intervalMs: Math.max(Number.isFinite(intervalSeconds) ? intervalSeconds : 5, 1) * 1e3,
      expiresAt: Date.now() + Number(payload.expires_in || 600) * 1e3
    };
  }
  async completeOpenAiDeviceAuth(challenge, cancellationToken) {
    return this.completeOpenAiDeviceAuthLegacy(challenge, cancellationToken);
  }
  async completeOpenAiDeviceAuthLegacy(challenge, cancellationToken) {
    while (Date.now() < challenge.expiresAt - 3e3) {
      if (cancellationToken?.isCancellationRequested) throw new Error("OpenAI device login cancelled.");
      const response = await fetch("https://auth.openai.com/api/accounts/deviceauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_auth_id: challenge.deviceAuthId,
          user_code: challenge.userCode
        })
      });
      if (response.ok) {
        const deviceToken = await response.json();
        const authorizationCode = String(deviceToken.authorization_code || "");
        const codeVerifier = String(deviceToken.code_verifier || "");
        if (!authorizationCode || !codeVerifier) {
          throw new Error("OpenAI device login returned an incomplete authorization result.");
        }
        return this.exchangeOpenAiDeviceCode(authorizationCode, codeVerifier);
      }
      if (response.status !== 403 && response.status !== 404) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(String(payload.error_description || payload.message || payload.error || `OpenAI device flow failed: HTTP ${response.status}`));
      }
      await this.sleep(challenge.intervalMs + 3e3, cancellationToken);
    }
    throw new Error("OpenAI device login expired.");
  }
  async exchangeOpenAiDeviceCode(authorizationCode, codeVerifier) {
    const body = new URLSearchParams();
    body.set("grant_type", "authorization_code");
    body.set("code", authorizationCode);
    body.set("redirect_uri", OPENAI_CODEX_DEVICE_REDIRECT_URI);
    body.set("client_id", OPENAI_CODEX_CLIENT_ID);
    body.set("code_verifier", codeVerifier);
    const response = await fetch("https://auth.openai.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });
    if (!response.ok) {
      throw new Error(`OpenAI token exchange failed: HTTP ${response.status}`);
    }
    const tokens = await response.json();
    const accessToken = String(tokens.access_token || "");
    if (!accessToken) throw new Error("OpenAI device login returned no access token.");
    return accessToken;
  }
  async beginGitHubDeviceAuth() {
    const response = await fetch("https://github.com/login/device/code", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: "Iv1.b507a08c87ecfe98", scope: "read:user" })
    });
    if (!response.ok) throw new Error(`GitHub device code failed: HTTP ${response.status}`);
    const payload = await response.json();
    return {
      verificationUri: String(payload.verification_uri || "https://github.com/login/device"),
      userCode: String(payload.user_code || ""),
      deviceCode: String(payload.device_code || ""),
      intervalMs: Math.max(1e3, Number(payload.interval || 5) * 1e3),
      expiresAt: Date.now() + Number(payload.expires_in || 900) * 1e3
    };
  }
  async completeGitHubDeviceAuth(challenge, cancellationToken) {
    return this.completeGitHubDeviceAuthLegacy(challenge, cancellationToken);
  }
  async completeGitHubDeviceAuthLegacy(challenge, cancellationToken) {
    while (Date.now() < challenge.expiresAt) {
      if (cancellationToken?.isCancellationRequested) throw new Error("GitHub Copilot device login cancelled.");
      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: "Iv1.b507a08c87ecfe98",
          device_code: challenge.deviceCode || "",
          grant_type: "urn:ietf:params:oauth:grant-type:device_code"
        })
      });
      const payload = await response.json().catch(() => ({}));
      const accessToken = String(payload.access_token || "");
      if (accessToken) return accessToken;
      const error = String(payload.error || "");
      if (error && error !== "authorization_pending" && error !== "slow_down") {
        throw new Error(String(payload.error_description || error));
      }
      await this.sleep(challenge.intervalMs, cancellationToken);
    }
    throw new Error("GitHub Copilot device login expired.");
  }
  async sleep(ms, cancellationToken) {
    if (!cancellationToken) {
      await new Promise((resolve5) => setTimeout(resolve5, ms));
      return;
    }
    await new Promise((resolve5, reject) => {
      const timeout = setTimeout(() => {
        disposable.dispose();
        resolve5();
      }, ms);
      const disposable = cancellationToken.onCancellationRequested(() => {
        clearTimeout(timeout);
        disposable.dispose();
        reject(new Error("Device login cancelled."));
      });
    });
  }
};

// src/ui/configuration-webview-html.ts
function getConfigurationHtml(nonce, scriptUri) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>n8n Configuration</title>
  <style nonce="${nonce}">
    :root { --border: var(--vscode-panel-border, var(--vscode-input-border)); --muted: var(--vscode-descriptionForeground); --surface: var(--vscode-editor-background); --soft: color-mix(in srgb, var(--vscode-input-background) 72%, transparent); --accent: var(--vscode-button-background); }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--surface); color: var(--vscode-foreground); font-family: var(--vscode-font-family); }
    #root { min-height: 100vh; }
    .settings-shell { min-height: 100vh; display: grid; grid-template-columns: 190px minmax(0, 1fr); }
    .sidebar { border-right: 1px solid var(--border); background: color-mix(in srgb, var(--vscode-sideBar-background, var(--surface)) 88%, var(--surface)); padding: 14px 8px; display: grid; align-content: start; gap: 6px; }
    .sidebar-title { padding: 0 8px 10px; font-weight: 700; }
    .tab-button { width: 100%; justify-content: flex-start; text-align: left; color: var(--vscode-foreground); background: transparent; border-color: transparent; display: flex; gap: 8px; align-items: center; font-weight: 600; }
    .tab-button.active { background: var(--vscode-list-activeSelectionBackground, var(--vscode-list-hoverBackground)); color: var(--vscode-list-activeSelectionForeground, var(--vscode-foreground)); }
    .page { max-width: 1240px; width: 100%; padding: 18px; display: grid; gap: 14px; align-content: start; grid-auto-rows: max-content; }
    header, .panel-head, .card-top, .modal-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
    header { align-items: flex-end; border-bottom: 1px solid var(--border); padding-bottom: 12px; }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: 24px; line-height: 1.2; }
    h2 { font-size: 16px; }
    h3 { font-size: 13px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; }
    .muted, .subtle { color: var(--muted); line-height: 1.45; }
    .subtle { font-size: 12px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px; align-items: stretch; }
    .panel, .card, .modal-card { border: 1px solid var(--border); background: var(--soft); border-radius: 10px; padding: 14px; display: grid; gap: 12px; }
    .card { background: var(--vscode-editor-background); border-radius: 12px; height: 100%; grid-template-rows: auto minmax(36px, 1fr) auto; position: relative; }
    .card > .row:last-child { align-self: end; }
    .card.clickable { cursor: pointer; text-align: left; color: inherit; width: 100%; }
    .card.clickable:hover, .card.clickable:focus-visible { border-color: var(--vscode-focusBorder, var(--accent)); outline: 1px solid var(--vscode-focusBorder, var(--accent)); background: color-mix(in srgb, var(--vscode-list-hoverBackground, var(--vscode-input-background)) 35%, var(--vscode-editor-background)); }
    .card.active { border-color: var(--vscode-focusBorder, var(--accent)); box-shadow: 0 0 0 1px var(--vscode-focusBorder, var(--accent)); background: color-mix(in srgb, var(--vscode-button-background) 7%, var(--vscode-editor-background)); }
    .status-corner { position: absolute; top: 10px; left: 10px; width: 18px; height: 18px; border-radius: 999px; display: grid; place-items: center; color: var(--vscode-button-foreground); background: transparent; border: 1px solid color-mix(in srgb, var(--vscode-foreground) 40%, transparent); font-size: 11px; font-weight: 800; }
    .status-corner.active { background: var(--accent); border-color: var(--accent); }
    .card .card-top { padding-left: 22px; }
    .toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .stack { display: grid; gap: 10px; }
    .empty-state { max-width: 560px; justify-items: start; }
    .loading-state { max-width: 560px; display: flex; align-items: center; }
    .spinner { width: 16px; height: 16px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 999px; animation: spin .8s linear infinite; flex: 0 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .badge { border: 1px solid var(--border); border-radius: 999px; padding: 2px 8px; font-size: 11px; color: var(--muted); background: transparent; min-height: 22px; }
    .badge.button { cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
    .badge.button::after { content: '\u2197'; font-size: 10px; opacity: .85; }
    .badge.ready, .badge.started { color: var(--vscode-testing-iconPassed, var(--vscode-foreground)); border-color: color-mix(in srgb, var(--vscode-testing-iconPassed, var(--vscode-foreground)) 55%, var(--border)); }
    .badge.warning, .badge.installing { color: var(--vscode-editorWarning-foreground, var(--vscode-foreground)); border-color: color-mix(in srgb, var(--vscode-editorWarning-foreground, var(--vscode-foreground)) 55%, var(--border)); }
    .badge.error, .badge.failed { color: var(--vscode-errorForeground); border-color: color-mix(in srgb, var(--vscode-errorForeground) 55%, var(--border)); }
    .badge.active { color: var(--vscode-button-foreground); background: var(--accent); border-color: var(--accent); }
    label { display: grid; gap: 6px; font-size: 12px; color: var(--muted); font-weight: 600; }
    input, select, textarea { width: 100%; min-height: 36px; padding: 8px 10px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--border)); border-radius: 6px; }
    select option, select optgroup { color: var(--vscode-input-foreground); background: var(--vscode-input-background); }
    input[type="checkbox"] { width: 14px; height: 14px; min-height: 0; padding: 0; margin: 0; accent-color: var(--accent); }
    label.row { display: flex; width: fit-content; align-items: center; gap: 8px; }
    textarea { min-height: 76px; resize: vertical; }
    input:focus, select:focus, textarea:focus, button:focus-visible { outline: 1px solid var(--vscode-focusBorder); }
    button { min-height: 34px; border: 1px solid transparent; border-radius: 6px; padding: 0 12px; color: var(--vscode-button-foreground); background: var(--vscode-button-background); font-weight: 600; cursor: pointer; }
    button.secondary { color: var(--vscode-foreground); background: transparent; border-color: var(--border); }
    button.danger { background: var(--vscode-errorForeground); color: var(--vscode-editor-background); }
    button.icon-button { width: 34px; padding: 0; display: inline-grid; place-items: center; }
    button.icon-button svg { width: 15px; height: 15px; fill: currentColor; }
    button.delete-action { margin-left: auto; color: var(--vscode-errorForeground); background: transparent; border-color: color-mix(in srgb, var(--vscode-errorForeground) 45%, var(--border)); }
    button.delete-action:hover { color: var(--vscode-editor-background); background: var(--vscode-errorForeground); border-color: var(--vscode-errorForeground); }
    button.link { min-height: 0; padding: 0; border: 0; background: transparent; color: var(--vscode-textLink-foreground); }
    button:disabled { opacity: .55; cursor: not-allowed; }
    .notice { justify-self: start; width: auto; max-width: min(520px, 100%); }
    .inline-message { border: 1px solid var(--border); border-radius: 8px; padding: 10px; color: var(--muted); background: color-mix(in srgb, var(--vscode-input-background) 84%, transparent); }
    .inline-message.warning { color: var(--vscode-editorWarning-foreground, var(--vscode-foreground)); }
    .inline-message.error { color: var(--vscode-errorForeground); }
    .error-text { color: var(--vscode-errorForeground); }
    .migration-banner { display: flex; justify-content: space-between; align-items: center; gap: 12px; border-color: color-mix(in srgb, var(--vscode-editorWarning-foreground, var(--vscode-foreground)) 55%, var(--border)); }
    .migration-banner h2 { color: var(--vscode-editorWarning-foreground, var(--vscode-foreground)); }
    .modal-backdrop { position: fixed; inset: 0; background: color-mix(in srgb, var(--vscode-editor-background) 62%, black); display: grid; place-items: center; padding: 18px; z-index: 10; }
    .modal-card { width: min(720px, 100%); max-height: min(760px, 94vh); overflow: auto; background: var(--vscode-editor-background); }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
    @media (max-width: 720px) { .settings-shell { grid-template-columns: 1fr; } .sidebar { border-right: 0; border-bottom: 1px solid var(--border); } }
  </style>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

// src/services/workspace-migration-runner.ts
import * as vscode14 from "vscode";
import { WorkspaceMigrationFacade as WorkspaceMigrationFacade2 } from "n8nac";
async function runWorkspaceMigrationFromVscode(context, workspaceRoot) {
  const facade = new WorkspaceMigrationFacade2({
    workspaceRoot,
    legacySettingsProvider: () => readLegacyN8nSettingsForMigration(context)
  });
  const migration = facade.inspect();
  if (!migration) return { outcome: "not-needed" };
  const confirmation = await vscode14.window.showWarningMessage(
    formatMigrationPrompt(migration),
    { modal: true },
    "Run migration"
  );
  if (confirmation !== "Run migration") return { outcome: "cancelled", report: migration };
  const result = await facade.migrate({ write: true });
  if (migration.operations.some((operation) => operation.id === "legacy-workspace-config")) {
    await clearLegacyWorkspaceSettings();
  }
  return { outcome: "migrated", report: result };
}
function formatMigrationPrompt(migration) {
  const operationLabels = migration.operations.map((operation) => operation.label).join(", ");
  return operationLabels ? `Migration required: ${operationLabels}. This will update the workspace configuration.` : "Migration required. This will update the workspace configuration.";
}
async function readLegacyN8nSettingsForMigration(context) {
  const config = vscode14.workspace.getConfiguration("n8n");
  const configuredApiKey = String(config.get("apiKey") || "").trim();
  return {
    host: String(config.get("host") || "").trim().replace(/\/$/, ""),
    apiKey: configuredApiKey || await readLegacySecretApiKeyForMigration(context)
  };
}
async function readLegacySecretApiKeyForMigration(context) {
  const candidates = ["n8n.apiKey", "apiKey", "n8n-as-code.apiKey", "n8nAsCode.apiKey", "n8nApiKey"];
  for (const key of candidates) {
    const value = (await context.secrets.get(key))?.trim();
    if (value) return value;
  }
  return "";
}
async function clearLegacyWorkspaceSettings() {
  const config = vscode14.workspace.getConfiguration("n8n");
  const keys = [
    "host",
    "apiKey",
    "syncFolder",
    "projectId",
    "projectName"
  ];
  for (const key of keys) {
    const inspected = config.inspect(key);
    if (inspected?.workspaceValue !== void 0) {
      await config.update(key, void 0, vscode14.ConfigurationTarget.Workspace);
    }
    if (inspected?.workspaceFolderValue !== void 0) {
      await config.update(key, void 0, vscode14.ConfigurationTarget.WorkspaceFolder);
    }
  }
}

// src/ui/configuration-webview-projects.ts
import { ConfigService as ConfigService4, N8nApiClient } from "n8nac";

// src/utils/project-display.ts
function getPersonalProjectOwner(project) {
  if (project.type !== "personal") {
    return void 0;
  }
  const name = project.name?.trim();
  if (!name || name.toLowerCase() === "personal") {
    return void 0;
  }
  return name;
}
function getProjectDisplayLabel(project) {
  if (project.type !== "personal") {
    return getCanonicalProjectName(project);
  }
  const owner = getPersonalProjectOwner(project);
  return owner ? `Personal - ${owner}` : "Personal";
}
function getCanonicalProjectName(project) {
  if (project.type === "personal") {
    return "Personal";
  }
  return project.name?.trim() || project.id || "Unnamed project";
}
function getProjectDetail(project) {
  const parts = [];
  if (project.type) {
    parts.push(`Type: ${project.type}`);
  }
  const owner = getPersonalProjectOwner(project);
  if (owner) {
    parts.push(`Owner: ${owner}`);
  }
  if (project.id) {
    parts.push(`ID: ${project.id}`);
  }
  return parts.join(" | ");
}

// src/ui/configuration-webview-projects.ts
var PERSONAL_PROJECT = {
  id: "personal",
  name: "Personal",
  type: "personal",
  detail: "Type: personal | ID: personal",
  displayName: "Personal"
};
function toUiProject(project) {
  const name = project.name || project.title || project.displayName || project.label || "";
  const displayable = { id: project.id, name, type: project.type };
  return {
    id: project.id,
    name: getCanonicalProjectName(displayable),
    type: project.type,
    detail: getProjectDetail(displayable),
    displayName: getProjectDisplayLabel(displayable)
  };
}
function dedupeUiProjects(projects) {
  const byId = /* @__PURE__ */ new Map();
  for (const project of projects) {
    if (!project.id) continue;
    const externalInstance = byId.get(project.id);
    if (!externalInstance || !externalInstance.name && project.name || externalInstance.id === "personal") {
      byId.set(project.id, project);
    }
  }
  return [...byId.values()];
}
async function loadProjectsFromApi(host, apiKey) {
  const client = new N8nApiClient({ host, apiKey });
  await client.assertApiAccess();
  return (await client.getProjects()).map(toUiProject);
}
function normalizeHost2(host) {
  const trimmed = (host || "").trim();
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}
function envVarSlug(value) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function readWorkspaceTargetApiKey(targetId, targetName) {
  const candidates = [
    `N8NAC_TARGET_${envVarSlug(targetId)}_API_KEY`,
    `N8NAC_TARGET_${envVarSlug(targetName)}_API_KEY`
  ];
  for (const key of candidates) {
    const value = process.env[key]?.trim().replace(/^["']|["']$/g, "");
    if (value) return value;
  }
  return void 0;
}
async function loadProjectsForConfigurationWebview(payload, options) {
  const scope = String(payload.scope || "workspace");
  const requestId = Number(payload.requestId || 0);
  const requestKey = String(payload.requestKey || "");
  const selectedProjectId = String(payload.projectId || "");
  const selectedProjectName = String(payload.projectName || "");
  const postProjectsLoaded = (projects, fallbackProjectId = "") => ({
    type: "projectsLoaded",
    scope,
    requestId,
    requestKey,
    projects: dedupeUiProjects(projects),
    selectedProjectId: selectedProjectId || fallbackProjectId,
    selectedProjectName: selectedProjectName || (fallbackProjectId === "personal" ? "Personal" : "")
  });
  let instanceId = String(payload.instanceId || "").trim() || void 0;
  const environmentTargetId = String(payload.environmentTargetId || "").trim();
  if (!instanceId && options.workspaceRoot && environmentTargetId) {
    const configService = new ConfigService4(options.workspaceRoot);
    const environmentId = String(payload.environmentId || "").trim();
    const environment = environmentId ? configService.getEnvironment(environmentId) : void 0;
    const targetChanged = Boolean(environment && environmentTargetId && environment.environmentTargetId !== environmentTargetId);
    const target = configService.getInstanceTarget(environmentTargetId || environment?.environmentTargetId || "");
    if (environmentId && !targetChanged) {
      const resolvedEnvironment = await configService.prepareEnvironment(environmentId);
      if (!resolvedEnvironment.apiKey) throw new Error(`Environment "${resolvedEnvironment.environmentName}" needs an API key before projects can be loaded.`);
      return postProjectsLoaded(await loadProjectsFromApi(resolvedEnvironment.host, resolvedEnvironment.apiKey));
    }
    if (target.kind === "managed-instance") instanceId = target.managedInstanceId;
    if (target.kind === "external-instance") {
      const apiKey2 = readWorkspaceTargetApiKey(target.id, target.name) || configService.getWorkspaceTargetApiKey(target.id) || configService.getApiKey(target.url);
      if (!apiKey2) {
        if (scope === "environment") throw new Error("Missing API key. Add an API key before selecting project or sync settings.");
        return postProjectsLoaded([PERSONAL_PROJECT], "personal");
      }
      return postProjectsLoaded(await loadProjectsFromApi(target.url, apiKey2));
    }
  }
  const host = instanceId ? "" : normalizeHost2(String(payload.host || ""));
  const apiKey = String(payload.apiKey || "").trim();
  if (host) {
    if (!apiKey) {
      if (scope === "environment") throw new Error("Missing API key. Add an API key before selecting project or sync settings.");
      return postProjectsLoaded([PERSONAL_PROJECT], "personal");
    }
    return postProjectsLoaded(await loadProjectsFromApi(host, apiKey));
  }
  const projectFacade = scope === "environment" && instanceId ? options.globalFacade : options.workspaceFacade;
  const uiProjects = (await projectFacade.listProjects({
    workspaceRoot: scope === "environment" && instanceId ? void 0 : options.workspaceRoot,
    instanceId,
    syncFolderDefault: "workspace",
    consumer: "vscode",
    autoStart: true
  })).map(toUiProject);
  return postProjectsLoaded(uiProjects);
}

// src/ui/configuration-webview.ts
var WORKSPACE_ENVIRONMENT_MODEL_METADATA = { n8nacWorkspaceEnvironmentModel: "v4" };
function normalizeHost3(host) {
  const trimmed = (host || "").trim();
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}
function normalizeWorkflowsPath(workflowsPath) {
  return String(workflowsPath || "").trim().replace(/\\/g, "/").replace(/\/+$/g, "");
}
async function clearLegacyWorkspaceSettings2() {
  const config = vscode15.workspace.getConfiguration("n8n");
  const keys = [
    "host",
    "apiKey",
    "syncFolder",
    "projectId",
    "projectName"
  ];
  const cleared = [];
  for (const key of keys) {
    const inspected = config.inspect(key);
    if (inspected?.workspaceValue !== void 0) {
      await config.update(key, void 0, vscode15.ConfigurationTarget.Workspace);
      cleared.push(`n8n.${key}`);
    }
    if (inspected?.workspaceFolderValue !== void 0) {
      await config.update(key, void 0, vscode15.ConfigurationTarget.WorkspaceFolder);
      cleared.push(`n8n.${key}`);
    }
  }
  return [...new Set(cleared)];
}
function getNonce2() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
function fallbackManagedInstanceId() {
  return `managed-${randomUUID3().slice(0, 8)}`;
}
function normalizeManagedInstanceId(value) {
  const sanitized = String(value || "").trim().replace(/[^A-Za-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 32);
  return sanitized && /^[A-Za-z0-9][A-Za-z0-9-]{0,31}$/.test(sanitized) ? sanitized : fallbackManagedInstanceId();
}
function normalizeManagedInstanceName(value) {
  const sanitized = String(value || "").trim().replace(/[^A-Za-z0-9 _-]+/g, " ").replace(/\s+/g, " ").slice(0, 64).trim();
  return sanitized || "managed";
}
var ConfigurationWebview = class _ConfigurationWebview {
  static currentPanel;
  _panel;
  _context;
  _configurationController;
  _providerService;
  _disposables = [];
  _stateVersion = 0;
  _initialTab;
  _managedSetupJobs = /* @__PURE__ */ new Map();
  _managedSetupJobCleanupTimers = /* @__PURE__ */ new Map();
  _queuedPinEnvironmentId;
  _pinEnvironmentTask;
  constructor(panel, context, configurationController2, initialTab) {
    this._panel = panel;
    this._context = context;
    this._configurationController = configurationController2;
    this._providerService = new AgentProviderService(context);
    this._initialTab = initialTab;
    this._panel.onDidDispose(() => {
      for (const timer of this._managedSetupJobCleanupTimers.values()) {
        clearTimeout(timer);
      }
      this._managedSetupJobCleanupTimers.clear();
      for (const disposable of this._disposables) {
        disposable.dispose();
      }
      this._disposables.length = 0;
      _ConfigurationWebview.currentPanel = void 0;
    });
    this._panel.webview.options = this.getWebviewOptions();
    this._panel.webview.onDidReceiveMessage((message) => {
      void this.handleMessage(message);
    });
    this._panel.webview.html = this.getHtmlForWebview();
    void this.postInitialState();
    this._disposables.push(this._configurationController.onDidChangeSnapshot((event) => {
      void this.postInitialState(event.snapshot);
    }));
    this._panel.onDidChangeViewState(() => {
      if (this._panel.visible) {
        void this.postInitialState();
      }
    });
  }
  static createOrShow(context, configurationController2, initialTab) {
    const column = vscode15.ViewColumn.One;
    if (_ConfigurationWebview.currentPanel) {
      _ConfigurationWebview.currentPanel._panel.reveal(column);
      if (initialTab) {
        _ConfigurationWebview.currentPanel._panel.webview.postMessage({ type: "activeTab", tab: initialTab });
      }
      return;
    }
    const panel = vscode15.window.createWebviewPanel(
      "n8nConfiguration",
      "n8n: Configure",
      column,
      _ConfigurationWebview.getWebviewOptions(context)
    );
    _ConfigurationWebview.currentPanel = new _ConfigurationWebview(panel, context, configurationController2, initialTab);
  }
  async handleMessage(message) {
    try {
      if (!message || typeof message !== "object") return;
      const payload = message;
      const workspaceRoot = getWorkspaceRoot();
      const facade = createN8nManagerFacade({ workspaceRoot });
      const globalFacade = createN8nManagerFacade({});
      switch (payload.type) {
        case "refreshState":
          await this._configurationController.refresh("webview-refresh", { force: true });
          return;
        case "migrateWorkspaceConfiguration":
        case "migrateLegacyWorkspaceConfig":
        case "migrateGlobalInstancesToEnvironments": {
          if (!workspaceRoot) throw new Error("Open a workspace before running migration.");
          await this.migrateWorkspaceConfiguration(workspaceRoot);
          return;
        }
        case "loadProjects": {
          try {
            const result = await loadProjectsForConfigurationWebview(payload, {
              workspaceRoot,
              workspaceFacade: facade,
              globalFacade
            });
            this._panel.webview.postMessage({ ...result, draftId: payload.draftId });
          } catch (error) {
            this._panel.webview.postMessage({
              type: "projectsError",
              draftId: payload.draftId,
              requestKey: payload.requestKey,
              message: error?.message || "Unable to load projects."
            });
          }
          return;
        }
        case "createManagedInstance": {
          await this.createManagedInstance(payload, globalFacade);
          return;
        }
        case "cancelManagedInstanceSetup": {
          const instanceId = String(payload.instanceId || "").trim();
          if (!instanceId) throw new Error("Instance is required.");
          const job = this._managedSetupJobs.get(instanceId);
          if (!job || !["installing", "cancelling"].includes(job.status)) return;
          job.status = "cancelling";
          job.cancellationRequested = true;
          job.message = "Cancellation requested. Waiting for setup to stop safely.";
          await this.postSetupJob(job);
          return;
        }
        case "loadEnvironmentEditCredentials": {
          if (!workspaceRoot) throw new Error("Open a workspace before editing workspace environments.");
          const environmentId = String(payload.environmentId || "").trim();
          if (!environmentId) throw new Error("Environment is required.");
          const environment = new ConfigService5(workspaceRoot).resolveEnvironment(environmentId);
          this._panel.webview.postMessage({
            type: "environmentEditCredentials",
            environmentId,
            host: normalizeHost3(environment.host || ""),
            apiKeyAvailable: Boolean(environment.apiKey)
          });
          return;
        }
        case "saveInstanceTarget": {
          if (!workspaceRoot) throw new Error("Open a workspace before saving workspace instance targets.");
          const configService = new ConfigService5(workspaceRoot);
          const targetId = String(payload.targetId || "").trim();
          const requestedKind = String(payload.sourceKind || "").trim();
          const input = {
            name: String(payload.name || "").trim(),
            managedInstanceId: String(payload.managedInstanceId || "").trim() || void 0,
            url: normalizeHost3(String(payload.url || "")) || void 0,
            description: String(payload.description || "").trim() || void 0
          };
          if (targetId) {
            const externalInstance = configService.getInstanceTarget(targetId);
            if (requestedKind && requestedKind !== externalInstance.kind) {
              throw new Error("Changing an instance target type is not supported. Create a new target instead.");
            }
            configService.updateInstanceTarget(targetId, input);
          } else {
            configService.addInstanceTarget(input);
          }
          await clearLegacyWorkspaceSettings2();
          await this._configurationController.refresh("webview-save-instance-target", { force: true });
          this.notifySaved();
          return;
        }
        case "deleteInstanceTarget": {
          if (!workspaceRoot) throw new Error("Open a workspace before deleting workspace instance targets.");
          const targetId = String(payload.targetId || "").trim();
          if (!targetId) throw new Error("Instance target is required.");
          const configService = new ConfigService5(workspaceRoot);
          const target = configService.getInstanceTarget(targetId);
          const confirmation = await vscode15.window.showWarningMessage(
            `Remove workspace instance target "${target.name}"?`,
            { modal: true },
            "Remove"
          );
          if (confirmation !== "Remove") {
            this._panel.webview.postMessage({ type: "cancelled" });
            return;
          }
          configService.removeInstanceTarget(targetId);
          await this._configurationController.refresh("webview-delete-instance-target", { force: true });
          this.notifySaved();
          return;
        }
        case "saveEnvironment": {
          if (!workspaceRoot) throw new Error("Open a workspace before saving workspace environments.");
          const configService = new ConfigService5(workspaceRoot);
          const environmentId = String(payload.environmentId || "").trim();
          let environmentTargetId = String(payload.environmentTargetId || "").trim();
          let existingEnvironmentTargetId = "";
          let currentEnvironmentTargetUrl = "";
          if (environmentId) {
            const existingEnvironment = configService.getEnvironment(environmentId);
            existingEnvironmentTargetId = existingEnvironment.environmentTargetId;
            const existingTarget = configService.getInstanceTarget(existingEnvironmentTargetId);
            if (existingTarget.kind === "external-instance") {
              currentEnvironmentTargetUrl = normalizeHost3(existingTarget.url);
            } else {
              const instance = (await globalFacade.listInstances()).find((item) => item.id === existingTarget.managedInstanceId);
              currentEnvironmentTargetUrl = normalizeHost3(instance?.tunnelPublicUrl || instance?.baseUrl || "");
            }
          }
          const instanceId = String(payload.instanceId || "").trim();
          const url = normalizeHost3(String(payload.url || ""));
          const apiKey = String(payload.apiKey || "").trim();
          const name = String(payload.name || "").trim();
          const projectId = String(payload.projectId || "").trim();
          const projectName = String(payload.projectName || "").trim() || "Personal";
          if (environmentId && !environmentTargetId && !instanceId && !url) {
            environmentTargetId = existingEnvironmentTargetId;
          }
          const selectedExistingTargetChanged = Boolean(environmentId && environmentTargetId && environmentTargetId !== existingEnvironmentTargetId);
          if (environmentId && !selectedExistingTargetChanged && url && url !== currentEnvironmentTargetUrl) {
            if (!apiKey) throw new Error("API key is required when replacing the environment URL.");
            environmentTargetId = this.ensureEmbeddedWorkspaceTarget(configService, {
              name: name || url,
              url
            });
          }
          if (!environmentTargetId && instanceId) {
            const instance = (await globalFacade.listInstances()).find((item) => item.id === instanceId);
            if (!instance) throw new Error(`Unknown n8n instance preset: ${instanceId}`);
            if (instance.mode === "managed-local-docker") {
              environmentTargetId = configService.ensureManagedInstanceTarget({
                name: instance.name || instanceId,
                managedInstanceId: instanceId
              }).id;
            } else {
              const targetUrl = normalizeHost3(instance.tunnelPublicUrl || instance.baseUrl || url);
              if (!targetUrl) throw new Error("Remote n8n URL is required for this environment.");
              environmentTargetId = this.ensureEmbeddedWorkspaceTarget(configService, {
                name: instance.name || name || targetUrl,
                url: targetUrl
              });
              const storedApiKey = configService.getApiKey(targetUrl, instance.id);
              if (storedApiKey) configService.saveWorkspaceTargetApiKey(environmentTargetId, storedApiKey);
            }
          }
          if (!environmentTargetId && url) {
            const existingPreset = (await globalFacade.listInstances()).find((instance) => normalizeHost3(instance.tunnelPublicUrl || instance.baseUrl || "") === url && instance.mode !== "managed-local-docker");
            environmentTargetId = this.ensureEmbeddedWorkspaceTarget(configService, {
              name: name || existingPreset?.name || url,
              url
            });
            const storedApiKey = apiKey || (existingPreset ? configService.getApiKey(url, existingPreset.id) : void 0);
            if (storedApiKey) configService.saveWorkspaceTargetApiKey(environmentTargetId, storedApiKey);
          }
          if (!environmentId && environmentTargetId && url) {
            const selectedTarget = configService.getInstanceTarget(environmentTargetId);
            const targetInstance = selectedTarget.kind === "managed-instance" ? (await globalFacade.listInstances()).find((instance) => instance.id === selectedTarget.managedInstanceId) : void 0;
            if (selectedTarget.kind === "managed-instance" && targetInstance?.mode !== "managed-local-docker") {
              environmentTargetId = this.ensureEmbeddedWorkspaceTarget(configService, {
                name: selectedTarget.name || name || url,
                url
              });
            }
          }
          if (environmentTargetId && url && apiKey) {
            configService.saveWorkspaceTargetApiKey(environmentTargetId, apiKey);
          }
          const workflowsPath = normalizeWorkflowsPath(String(payload.workflowsPath || payload.workflowDir || "").trim());
          const syncFolder = normalizeWorkflowsPath(String(payload.syncFolder || "").trim());
          const folderSync = typeof payload.folderSync === "boolean" ? payload.folderSync : void 0;
          const input = {
            name,
            environmentTarget: environmentTargetId,
            projectId,
            projectName,
            workflowsPath: workflowsPath || void 0,
            syncFolder: workflowsPath ? void 0 : syncFolder || void 0,
            folderSync,
            customNodesPath: String(payload.customNodesPath || "").trim() || void 0,
            description: String(payload.description || "").trim() || void 0
          };
          const savedEnvironment = environmentId ? configService.updateEnvironment(environmentId, input) : configService.addEnvironment(input);
          await clearLegacyWorkspaceSettings2();
          this._panel.webview.postMessage({ type: "environmentSaved", environment: savedEnvironment });
          this.notifySaved();
          void this._configurationController.refresh("webview-save-environment", { force: true }).catch(() => void 0);
          return;
        }
        case "pinEnvironment": {
          if (!workspaceRoot) throw new Error("Open a workspace before pinning workspace environments.");
          const environmentId = String(payload.environmentId || "").trim();
          if (!environmentId) throw new Error("Environment is required.");
          this.queuePinEnvironment(environmentId);
          return;
        }
        case "deleteEnvironment": {
          if (!workspaceRoot) throw new Error("Open a workspace before deleting workspace environments.");
          const environmentId = String(payload.environmentId || "").trim();
          if (!environmentId) throw new Error("Environment is required.");
          const configService = new ConfigService5(workspaceRoot);
          const environment = configService.getEnvironment(environmentId);
          const confirmation = await vscode15.window.showWarningMessage(
            `Remove workspace environment "${environment.name}"?`,
            { modal: true },
            "Remove"
          );
          if (confirmation !== "Remove") {
            this._panel.webview.postMessage({ type: "cancelled" });
            return;
          }
          configService.removeEnvironment(environmentId);
          this._panel.webview.postMessage({ type: "environmentDeleted", environmentId });
          this.notifySaved();
          void this._configurationController.refresh("webview-delete-environment", { force: true }).catch(() => void 0);
          return;
        }
        case "saveGlobalInstance":
          const warnings = await this.saveGlobalInstance(payload, globalFacade);
          await this._configurationController.refresh("webview-save-global-instance", { force: true });
          this.notifySaved();
          if (warnings.length) {
            this._panel.webview.postMessage({ type: "error", message: warnings.join("\n") });
          }
          return;
        case "setGlobalActiveInstance": {
          const instanceId = String(payload.instanceId || "").trim();
          if (!instanceId) throw new Error("Instance is required.");
          await globalFacade.setGlobalActiveInstance(instanceId);
          await this._configurationController.refresh("webview-set-global-active", { force: true });
          this.notifySaved();
          return;
        }
        case "manageInstanceRuntime": {
          const instanceId = String(payload.instanceId || "").trim();
          const action = String(payload.action || "").trim();
          if (!instanceId) throw new Error("Instance is required.");
          if (!["start", "stop", "restart"].includes(action)) throw new Error("Unsupported instance action.");
          const actionLabel = action === "start" ? "Starting" : action === "stop" ? "Stopping" : "Restarting";
          await vscode15.window.withProgress({
            location: vscode15.ProgressLocation.Notification,
            title: `${actionLabel} n8n instance`,
            cancellable: false
          }, async () => {
            if (action === "start") await globalFacade.startInstance(instanceId);
            if (action === "stop") await globalFacade.stopInstance(instanceId);
            if (action === "restart") await globalFacade.restartInstance(instanceId);
          });
          await this._configurationController.refresh(`webview-${action}-instance`, { force: true });
          this.notifySaved();
          return;
        }
        case "refreshPublicUrl": {
          const instanceId = String(payload.instanceId || "").trim();
          if (!instanceId) throw new Error("Instance is required.");
          const access = await vscode15.window.withProgress({
            location: vscode15.ProgressLocation.Notification,
            title: "Refreshing public URL",
            cancellable: false
          }, () => globalFacade.resolveInstanceAccess({
            instanceId,
            syncFolderDefault: "workspace",
            consumer: "vscode",
            mode: "reconcile",
            refreshPublicUrl: true
          }));
          await this._configurationController.refresh("webview-refresh-public-url", { force: true });
          this.notifySaved();
          if (access.warnings.length) {
            this._panel.webview.postMessage({ type: "error", message: access.warnings.join("\n") });
          }
          return;
        }
        case "showManagedCredentials": {
          const instanceId = String(payload.instanceId || "").trim();
          if (!instanceId) throw new Error("Instance is required.");
          const credentials = await globalFacade.getManagedOwnerCredentials(instanceId);
          if (!credentials) throw new Error("Managed owner credentials are not available for this instance.");
          this._panel.webview.postMessage({ type: "managedCredentials", credentials });
          return;
        }
        case "copyText": {
          const value = String(payload.value || "");
          if (!value) return;
          await vscode15.env.clipboard.writeText(value);
          this._panel.webview.postMessage({ type: "copied" });
          return;
        }
        case "openExternal": {
          const url = String(payload.url || "").trim();
          if (!url) return;
          await vscode15.env.openExternal(vscode15.Uri.parse(url));
          return;
        }
        case "saveWorkspaceContext": {
          if (!workspaceRoot) throw new Error("Open a workspace before saving workspace n8n settings.");
          if (new ConfigService5(workspaceRoot).getWorkspaceConfig().version === 4) {
            throw new Error("This workspace uses environments. Pin or edit an environment instead of saving legacy workspace settings.");
          }
          const syncFolder = String(payload.syncFolder || "").trim();
          await facade.writeWorkspaceOverrides({
            version: 3,
            activeInstanceId: String(payload.activeInstanceId || "").trim() || void 0,
            syncFolder: syncFolder || void 0,
            projectId: String(payload.projectId || "").trim() || void 0,
            projectName: String(payload.projectName || "").trim() || void 0,
            folderSync: Boolean(payload.folderSync)
          }, workspaceRoot);
          const clearedLegacySettings = await clearLegacyWorkspaceSettings2();
          await this._context.workspaceState.update("n8n.suppressSettingsChangedOnce", true);
          await this._configurationController.refresh("webview-save-workspace-context", { force: true });
          if (clearedLegacySettings.length > 0) {
            void vscode15.window.showInformationMessage(
              `n8n-as-code moved legacy VS Code workspace settings (${clearedLegacySettings.join(", ")}) into n8n-manager plus n8nac-config.json workspace overrides.`
            );
          }
          this.notifySaved();
          return;
        }
        case "deleteInstance": {
          const instanceId = String(payload.instanceId || "").trim();
          if (!instanceId) throw new Error("Instance is required.");
          const instanceName = String(payload.instanceName || instanceId).trim();
          const confirmation = await vscode15.window.showWarningMessage(
            `Delete global n8n instance "${instanceName}"?`,
            { modal: true },
            "Delete"
          );
          if (confirmation !== "Delete") {
            this._panel.webview.postMessage({ type: "cancelled" });
            return;
          }
          const workspaceConfig = workspaceRoot ? new ConfigService5(workspaceRoot).getWorkspaceConfig() : void 0;
          const workspaceOverrides = workspaceRoot && workspaceConfig?.version !== 4 ? await facade.readWorkspaceOverrides(workspaceRoot) : void 0;
          await globalFacade.deleteInstance(instanceId);
          if (workspaceRoot && workspaceOverrides?.activeInstanceId === instanceId) {
            await facade.writeWorkspaceOverrides({
              ...workspaceOverrides,
              activeInstanceId: void 0
            }, workspaceRoot);
          }
          this._panel.webview.postMessage({ type: "instanceDeleted", instanceId });
          this.notifySaved();
          void this._configurationController.refresh("webview-delete-instance", { force: true }).catch(() => void 0);
          return;
        }
        case "openSettings":
          await vscode15.commands.executeCommand("n8n.openSettings");
          return;
        case "connectProvider": {
          const provider = normalizeAgentProviderId3(String(payload.provider || ""));
          if (!provider) throw new Error("Unsupported provider.");
          const configured = await this._providerService.setupProvider(provider);
          if (configured) {
            await this._providerService.selectModel(provider);
          }
          await this.postInitialState();
          this._panel.webview.postMessage({ type: "activeTab", tab: "agent-providers" });
          this.notifySaved();
          return;
        }
        case "disconnectProvider": {
          const provider = normalizeAgentProviderId3(String(payload.provider || ""));
          if (!provider) throw new Error("Unsupported provider.");
          await this._providerService.disconnectProvider(provider);
          await this.postInitialState();
          this._panel.webview.postMessage({ type: "activeTab", tab: "agent-providers" });
          this.notifySaved();
          return;
        }
      }
    } catch (error) {
      this._panel.webview.postMessage({
        type: "error",
        message: error?.message || "Unexpected error"
      });
      void this._configurationController.refresh("webview-error-refresh", { force: true }).catch(() => void 0);
    }
  }
  notifySaved() {
    void vscode15.window.showInformationMessage("Settings saved.");
  }
  queuePinEnvironment(environmentId) {
    this._queuedPinEnvironmentId = environmentId;
    if (!this._pinEnvironmentTask) {
      this._pinEnvironmentTask = this.drainPinEnvironmentQueue().catch((error) => {
        this._panel.webview.postMessage({ type: "error", message: error?.message || "Unable to pin environment." });
      }).finally(() => {
        this._pinEnvironmentTask = void 0;
      });
    }
  }
  async drainPinEnvironmentQueue() {
    let pinned = false;
    while (this._queuedPinEnvironmentId) {
      const environmentId = this._queuedPinEnvironmentId;
      this._queuedPinEnvironmentId = void 0;
      const workspaceRoot = getWorkspaceRoot();
      if (!workspaceRoot) throw new Error("Open a workspace before pinning workspace environments.");
      try {
        new ConfigService5(workspaceRoot).pinEnvironment(environmentId);
        this._panel.webview.postMessage({ type: "environmentPinned", environmentId });
        pinned = true;
      } catch (error) {
        if (!this._queuedPinEnvironmentId) throw error;
      }
    }
    if (pinned) {
      this.notifySaved();
      void this._configurationController.refresh("webview-pin-environment", { force: true }).catch(() => void 0);
    }
  }
  async migrateWorkspaceConfiguration(workspaceRoot) {
    const result = await runWorkspaceMigrationFromVscode(this._context, workspaceRoot);
    if (result.outcome === "not-needed") {
      this.notifySaved();
      await this._configurationController.refresh("webview-migration-not-needed", { force: true });
      return;
    }
    if (result.outcome === "cancelled") {
      this._panel.webview.postMessage({ type: "cancelled" });
      return;
    }
    const snapshot = await this._configurationController.refresh("webview-run-migration", { force: true });
    await this.postInitialState(snapshot);
    this._panel.webview.postMessage({
      type: "migrationCompleted",
      backupPath: result.report.backupPath || "",
      migratedCount: result.report.migratedEnvironmentIds?.length || 0,
      deletedCount: result.report.deletedGlobalInstanceIds?.length || 0
    });
  }
  ensureEmbeddedWorkspaceTarget(configService, input) {
    const url = normalizeHost3(input.url);
    const externalInstance = configService.listInstanceTargets().find((target) => {
      return target.kind === "external-instance" && normalizeHost3(target.url) === url;
    });
    if (externalInstance) return externalInstance.id;
    const existingNames = new Set(configService.listInstanceTargets().map((target) => target.name.toLowerCase()));
    const baseName = input.name || url;
    let name = baseName;
    let counter = 2;
    while (existingNames.has(name.toLowerCase())) {
      name = `${baseName} ${counter}`;
      counter += 1;
    }
    return configService.addInstanceTarget({ name, url }).id;
  }
  async saveGlobalInstance(payload, facade) {
    const mode = String(payload.mode || "existing").trim();
    const host = normalizeHost3(String(payload.host || ""));
    const apiKey = String(payload.apiKey || "").trim();
    const instanceId = String(payload.instanceId || "").trim() || void 0;
    const instanceName = String(payload.instanceName || "").trim() || void 0;
    const setActive = Boolean(payload.setActive);
    const workspaceRoot = getWorkspaceRoot();
    if (mode === "managed-local-docker") {
      const previousActive = await facade.getGlobalActiveInstance();
      const instance = await vscode15.window.withProgress({
        location: vscode15.ProgressLocation.Notification,
        title: "Preparing managed local n8n",
        cancellable: false
      }, () => facade.setup({
        mode: "managed-local",
        instanceId,
        instanceName,
        tunnel: Boolean(payload.tunnel)
      }));
      if (workspaceRoot && instance.baseUrl) {
        await new ConfigService5(workspaceRoot).getOrCreateInstanceIdentifier(instance.baseUrl, instance.id).catch(() => void 0);
      }
      if (instanceName) {
        await facade.upsertInstance({ id: instance.id, name: instanceName, publicUrlEnabled: Boolean(payload.tunnel) }, { setActive });
      }
      if (!setActive && previousActive?.id && previousActive.id !== instance.id) {
        await facade.setGlobalActiveInstance(previousActive.id);
      }
      return Array.isArray(instance.warnings) ? instance.warnings : [];
    }
    if (mode === "existing" && !instanceId && (!host || !apiKey)) {
      throw new Error("Host and API key are required for a new externalInstance n8n instance.");
    }
    const identifierResolution = host && apiKey ? await resolveInstanceIdentifier2({ host, apiKey }) : void 0;
    await facade.upsertInstance({
      id: instanceId,
      name: instanceName,
      mode: mode === "generation-only" ? "generation-only" : "existing",
      baseUrl: host || void 0,
      apiKey: apiKey || void 0,
      instanceIdentifier: identifierResolution?.identifier
    }, { setActive });
    return [];
  }
  hasActiveManagedSetup() {
    return [...this._managedSetupJobs.values()].some((job) => job.status === "installing" || job.status === "cancelling");
  }
  async createManagedInstance(payload, facade) {
    if (this.hasActiveManagedSetup()) {
      throw new Error("Another managed instance is installing. Wait for it to finish or cancel it.");
    }
    const instanceId = normalizeManagedInstanceId(payload.instanceId || fallbackManagedInstanceId());
    const instanceName = normalizeManagedInstanceName(payload.instanceName);
    const tunnel = Boolean(payload.tunnel);
    const returnToEnvironmentForm = Boolean(payload.returnToEnvironmentForm);
    const returnToEnvironmentDraftId = String(payload.returnToEnvironmentDraftId || "").trim() || void 0;
    const placeholder = {
      id: instanceId,
      name: instanceName,
      mode: "managed-local-docker",
      publicUrlEnabled: tunnel,
      metadata: WORKSPACE_ENVIRONMENT_MODEL_METADATA
    };
    await facade.upsertInstance(placeholder, { setActive: false });
    const job = {
      instanceId,
      instanceName,
      status: "installing",
      message: "Managed instance is installing.",
      returnToEnvironmentForm,
      returnToEnvironmentDraftId,
      startedAt: Date.now()
    };
    this._managedSetupJobs.set(instanceId, job);
    this._panel.webview.postMessage({ type: "managedInstanceCreated", instanceId, instanceName, returnToEnvironmentForm, returnToEnvironmentDraftId });
    this._panel.webview.postMessage({ type: "setupJob", job: this.serializeSetupJob(job) });
    void this.runManagedSetupJob(job, { tunnel });
  }
  async runManagedSetupJob(job, options) {
    const facade = createN8nManagerFacade({});
    const previousActive = await facade.getGlobalActiveInstance().catch(() => void 0);
    try {
      await this.postSetupJob(job);
      const instance = await facade.setup({
        mode: "managed-local",
        instanceId: job.instanceId,
        instanceName: job.instanceName,
        tunnel: options.tunnel
      });
      if (job.cancellationRequested) {
        job.status = "cancelled";
        job.message = "Setup was cancelled.";
        job.completedAt = Date.now();
        await facade.deleteInstance(job.instanceId).catch(() => void 0);
        await this._configurationController.refresh("webview-managed-setup-cancelled", { force: true });
        await this.postSetupJob(job);
        return;
      }
      if (job.instanceName) {
        const update = {
          id: instance.id,
          name: job.instanceName,
          publicUrlEnabled: options.tunnel,
          metadata: WORKSPACE_ENVIRONMENT_MODEL_METADATA
        };
        await facade.upsertInstance(update, { setActive: false });
      }
      if (previousActive?.id && previousActive.id !== instance.id) {
        await facade.setGlobalActiveInstance(previousActive.id).catch(() => void 0);
      }
      job.status = "succeeded";
      job.message = "Managed instance is ready.";
      job.completedAt = Date.now();
      const snapshot = await this._configurationController.refresh("webview-managed-setup-succeeded", { force: true });
      await this.postInitialState(snapshot);
      await this.postSetupJob(job);
      if (Array.isArray(instance.warnings) && instance.warnings.length) {
        this._panel.webview.postMessage({ type: "error", message: instance.warnings.join("\n") });
      }
    } catch (error) {
      job.status = job.cancellationRequested ? "cancelled" : "failed";
      job.error = error?.message || "Managed instance setup failed.";
      job.message = job.status === "cancelled" ? "Setup was cancelled." : job.error;
      job.completedAt = Date.now();
      const failedPlaceholder = {
        id: job.instanceId,
        name: job.instanceName,
        mode: "managed-local-docker",
        publicUrlEnabled: options.tunnel,
        metadata: WORKSPACE_ENVIRONMENT_MODEL_METADATA
      };
      await facade.upsertInstance(failedPlaceholder, { setActive: false }).catch(() => void 0);
      await this._configurationController.refresh("webview-managed-setup-failed", { force: true }).catch(() => void 0);
      await this.postSetupJob(job);
    }
  }
  async postSetupJob(job) {
    this._panel.webview.postMessage({ type: "setupJob", job: this.serializeSetupJob(job) });
    this.scheduleManagedSetupJobCleanup(job);
  }
  scheduleManagedSetupJobCleanup(job) {
    if (!job.completedAt || !["succeeded", "failed", "cancelled"].includes(job.status)) return;
    const existingTimer = this._managedSetupJobCleanupTimers.get(job.instanceId);
    if (existingTimer) clearTimeout(existingTimer);
    const timer = setTimeout(() => {
      const current = this._managedSetupJobs.get(job.instanceId);
      if (current && current.completedAt === job.completedAt && ["succeeded", "failed", "cancelled"].includes(current.status)) {
        this._managedSetupJobs.delete(job.instanceId);
        void this.postInitialState().catch(() => void 0);
      }
      this._managedSetupJobCleanupTimers.delete(job.instanceId);
    }, 5 * 60 * 1e3);
    this._managedSetupJobCleanupTimers.set(job.instanceId, timer);
  }
  serializeSetupJob(job) {
    const { cancellationRequested: _cancellationRequested, ...serialized } = job;
    return serialized;
  }
  async postInitialState(snapshot) {
    const stateVersion = ++this._stateVersion;
    const currentSnapshot = snapshot ?? this._configurationController.getSnapshot() ?? await this._configurationController.refresh("webview-open", { force: true });
    const workspaceRoot = getWorkspaceRoot();
    const facade = createN8nManagerFacade({ workspaceRoot });
    const instanceFacade = createN8nManagerFacade({});
    const globalConfig = currentSnapshot.global;
    const workspaceOverrides = currentSnapshot.workspace;
    const effectiveContext = currentSnapshot.effective;
    const instances = await Promise.all(globalConfig.instances.map(async (instance) => {
      try {
        const runtime = await instanceFacade.status({ instanceId: instance.id });
        const access = await instanceFacade.resolveInstanceAccess({
          instanceId: instance.id,
          mode: "observe"
        });
        const displayUrl = access.authUrl || access.publicN8nUrl || (access.publicUrlEnabled ? "" : access.apiBaseUrl || "");
        return {
          ...instance,
          host: displayUrl,
          displayUrl,
          authBridgePublicUrl: access.authUrl,
          verificationStatus: instance.verification?.status || "unverified",
          verificationLabel: instance.verification?.status === "verified" ? "Verified" : instance.verification?.status === "failed" ? "Verification failed" : "Not verified yet",
          runtimeStatus: runtime.status,
          runtimeReady: "ready" in runtime ? runtime.ready : runtime.status === "ready",
          ownerCredentialsAvailable: Boolean(runtime.instance?.ownerCredentialsAvailable),
          runtimeBlockedCode: "blocked" in runtime ? runtime.blocked?.code : void 0,
          runtimeBlockedMessage: "blocked" in runtime ? runtime.blocked?.message : void 0,
          runtimeWarnings: access.warnings.length ? access.warnings : "warnings" in runtime ? runtime.warnings : void 0,
          tunnelRunning: access.tunnel?.running,
          tunnelPublicUrl: access.publicN8nUrl || instance.tunnelPublicUrl,
          access
        };
      } catch (error) {
        return {
          ...instance,
          host: instance.tunnelPublicUrl || instance.baseUrl || "",
          verificationStatus: instance.verification?.status || "unverified",
          verificationLabel: instance.verification?.status === "verified" ? "Verified" : instance.verification?.status === "failed" ? "Verification failed" : "Not verified yet",
          runtimeStatus: "unknown",
          runtimeReady: false,
          runtimeBlockedMessage: error?.message || "Runtime status unavailable."
        };
      }
    }));
    this._panel.webview.postMessage({
      type: "init",
      stateVersion,
      global: {
        activeInstanceId: globalConfig.activeInstanceId || "",
        defaultSyncFolder: globalConfig.defaultSyncFolder,
        instances
      },
      workspace: workspaceOverrides,
      migration: currentSnapshot.migration,
      effective: effectiveContext ? {
        activeInstanceId: effectiveContext.activeInstanceId,
        activeInstanceName: effectiveContext.activeInstanceName,
        host: effectiveContext.host,
        apiBaseUrl: effectiveContext.apiBaseUrl ?? effectiveContext.host,
        publicBaseUrl: effectiveContext.publicBaseUrl || "",
        workflowsPath: effectiveContext.workflowsPath || effectiveContext.workflowDir || effectiveContext.syncFolder,
        syncFolder: effectiveContext.workflowsPath || effectiveContext.workflowDir || effectiveContext.syncFolder,
        projectId: effectiveContext.projectId || "",
        projectName: effectiveContext.projectName || "",
        sources: effectiveContext.sources
      } : void 0,
      providers: await this._providerService.listProviderConnectionStates(),
      setupJobs: Object.fromEntries([...this._managedSetupJobs.entries()].map(([id, job]) => [id, this.serializeSetupJob(job)])),
      about: {
        extensionVersion: String(this._context.extension.packageJSON?.version || ""),
        cliVersion: String(this._context.extension.packageJSON?.dependencies?.n8nac || "")
      }
    });
    if (this._initialTab) {
      this._panel.webview.postMessage({ type: "activeTab", tab: this._initialTab });
      this._initialTab = void 0;
    }
  }
  getHtmlForWebview() {
    const scriptUri = this._panel.webview.asWebviewUri(vscode15.Uri.joinPath(this._context.extensionUri, "out", "settings-webview.js"));
    return getConfigurationHtml(getNonce2(), scriptUri.toString());
  }
  getWebviewOptions() {
    return _ConfigurationWebview.getWebviewOptions(this._context);
  }
  static getWebviewOptions(context) {
    return {
      enableScripts: true,
      localResourceRoots: [vscode15.Uri.joinPath(context.extensionUri, "out")]
    };
  }
};

// src/ui/workflow-decoration-provider.ts
import * as vscode16 from "vscode";
import { WorkflowSyncStatus as WorkflowSyncStatus3 } from "n8nac";
var WorkflowDecorationProvider = class {
  _onDidChangeFileDecorations = new vscode16.EventEmitter();
  onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;
  /**
   * Trigger a refresh of all decorations
   */
  refresh() {
    this._onDidChangeFileDecorations.fire(void 0);
  }
  /**
   * Provide decoration for a given URI
   * URIs are in the format: n8n-workflow://<workflowId>?status=<status>&pendingAction=<action>
   */
  provideFileDecoration(uri) {
    if (uri.scheme !== "n8n-workflow") {
      return void 0;
    }
    const params = new URLSearchParams(uri.query);
    const status = params.get("status");
    const pendingAction = params.get("pendingAction");
    if (pendingAction === "delete") {
      return {
        color: new vscode16.ThemeColor("gitDecoration.deletedResourceForeground"),
        tooltip: "Pending Deletion"
      };
    }
    if (pendingAction === "conflict" || status === WorkflowSyncStatus3.CONFLICT) {
      return {
        color: new vscode16.ThemeColor("errorForeground"),
        tooltip: "Conflict - Resolve Required"
      };
    }
    switch (status) {
      case WorkflowSyncStatus3.TRACKED:
        return {
          color: new vscode16.ThemeColor("gitDecoration.untrackedResourceForeground"),
          tooltip: "Tracked"
        };
      case WorkflowSyncStatus3.EXIST_ONLY_REMOTELY:
        return {
          color: new vscode16.ThemeColor("gitDecoration.deletedResourceForeground"),
          tooltip: "Remote Only"
        };
      case WorkflowSyncStatus3.EXIST_ONLY_LOCALLY:
        return {
          color: new vscode16.ThemeColor("gitDecoration.addedResourceForeground"),
          tooltip: "Local Only"
        };
      default:
        return void 0;
    }
  }
  dispose() {
    this._onDidChangeFileDecorations.dispose();
  }
};

// src/services/proxy-service.ts
import * as http from "http";
import * as os4 from "os";
import HttpProxy from "http-proxy";
import { randomUUID as randomUUID4 } from "crypto";
import { WebSocket, WebSocketServer } from "ws";
var ProxyService = class _ProxyService {
  server;
  proxy;
  wsServer;
  port = 0;
  target = "";
  publicBaseUrl;
  outputChannel;
  secrets;
  cookieJar = /* @__PURE__ */ new Map();
  htmlRoutes = /* @__PURE__ */ new Map();
  externalAuthSessions = /* @__PURE__ */ new Map();
  lastWorkflowProxyUrl;
  externalAuthRoutePrefix = "/__n8nac-external-auth/";
  externalAuthSessionTtlMs = 15 * 60 * 1e3;
  constructor() {
  }
  setSecrets(secrets) {
    this.secrets = secrets;
  }
  setOutputChannel(channel) {
    this.outputChannel = channel;
  }
  registerHtmlRoute(routePath, html) {
    this.htmlRoutes.set(this.normalizeRoutePath(routePath), html);
  }
  setPublicBaseUrl(publicBaseUrl) {
    const trimmed = publicBaseUrl?.trim();
    this.publicBaseUrl = trimmed ? trimmed.replace(/\/$/, "") : void 0;
  }
  getProxyBaseUrl() {
    return this.publicBaseUrl || `http://localhost:${this.port}`;
  }
  rewriteProxyLocation(location, sourceUrl = this.target, externalAuthToken) {
    const proxyBaseUrl = this.getProxyBaseUrl();
    try {
      const targetUrl = new URL(this.target);
      const targetBasePath = this.trimTrailingSlash(targetUrl.pathname);
      const sourceBaseUrl = new URL(sourceUrl || this.target);
      if (location.startsWith("/") && !location.startsWith("//")) {
        const locationUrl2 = new URL(location, sourceBaseUrl.origin);
        if (locationUrl2.origin !== targetUrl.origin) {
          return externalAuthToken ? this.buildExternalAuthProxyUrl(locationUrl2.toString(), externalAuthToken) : location;
        }
        if (externalAuthToken) {
          this.externalAuthSessions.delete(externalAuthToken);
        }
        const remainingPath2 = this.stripTargetBasePath(locationUrl2.pathname, targetBasePath);
        return `${proxyBaseUrl}${remainingPath2}${locationUrl2.search}${locationUrl2.hash}`;
      }
      const locationUrl = location.startsWith("//") ? new URL(`${sourceBaseUrl.protocol}${location}`) : new URL(location);
      if (locationUrl.origin !== targetUrl.origin) {
        return externalAuthToken ? this.buildExternalAuthProxyUrl(locationUrl.toString(), externalAuthToken) : location;
      }
      if (externalAuthToken) {
        this.externalAuthSessions.delete(externalAuthToken);
      }
      if (!this.urlPathMatchesBase(locationUrl.pathname, targetBasePath)) {
        return location;
      }
      const remainingPath = this.stripTargetBasePath(locationUrl.pathname, targetBasePath);
      return `${proxyBaseUrl}${remainingPath}${locationUrl.search}${locationUrl.hash}`;
    } catch {
      return location;
    }
  }
  trimTrailingSlash(pathname) {
    const trimmed = pathname.replace(/\/$/, "");
    return trimmed === "/" ? "" : trimmed;
  }
  urlPathMatchesBase(pathname, basePath) {
    return !basePath || pathname === basePath || pathname.startsWith(`${basePath}/`);
  }
  stripTargetBasePath(pathname, basePath) {
    if (!this.urlPathMatchesBase(pathname, basePath)) {
      return pathname;
    }
    if (!basePath) {
      return pathname === "/" ? "" : pathname;
    }
    return pathname.slice(basePath.length);
  }
  /**
   * Check whether a WebSocket close code is valid for sending in a close frame.
   * Codes 1004, 1005, 1006, and 1015 are reserved and MUST NOT be set as a
   * status code in a Close control frame (RFC 6455 §7.4.1).
   */
  isSendableCloseCode(code) {
    if (code >= 3e3 && code <= 4999) {
      return true;
    }
    if (code >= 1e3 && code <= 1003) {
      return true;
    }
    if (code >= 1007 && code <= 1014) {
      return true;
    }
    return false;
  }
  log(message) {
    if (this.outputChannel) {
      this.outputChannel.appendLine(message);
    } else {
      console.log(message);
    }
  }
  async openExternalUrl(url) {
    try {
      const vscodeRuntime = await import("vscode");
      await vscodeRuntime.env.openExternal(vscodeRuntime.Uri.parse(url));
    } catch (error) {
      this.log(`[Proxy] Unable to open external authentication URL: ${error?.message || String(error)}`);
    }
  }
  getStorageKey() {
    return `n8n-cookies-${Buffer.from(this.target).toString("base64")}`;
  }
  /**
   * Generate a stable port number between 10000 and 60000 based on the target URL
   */
  getStablePort(targetUrl) {
    let hash = 0;
    for (let i = 0; i < targetUrl.length; i++) {
      const char = targetUrl.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return 1e4 + Math.abs(hash) % 5e4;
  }
  cleanupExternalAuthSessions() {
    const now = Date.now();
    for (const [token, session] of this.externalAuthSessions) {
      if (session.expiresAt <= now) {
        this.externalAuthSessions.delete(token);
      }
    }
  }
  createExternalAuthSession(expectedTargetUrl) {
    this.cleanupExternalAuthSessions();
    const token = randomUUID4();
    this.externalAuthSessions.set(token, {
      expiresAt: Date.now() + this.externalAuthSessionTtlMs,
      expectedTargetUrl: this.normalizeExternalAuthTargetUrl(expectedTargetUrl)
    });
    return token;
  }
  getExternalAuthSession(token) {
    this.cleanupExternalAuthSessions();
    return token ? this.externalAuthSessions.get(token) : void 0;
  }
  normalizeExternalAuthTargetUrl(targetUrl) {
    return new URL(targetUrl).toString();
  }
  buildExternalAuthProxyUrl(targetUrl, token) {
    const normalizedTargetUrl = this.normalizeExternalAuthTargetUrl(targetUrl);
    const sessionToken = token || this.createExternalAuthSession(normalizedTargetUrl);
    const session = this.getExternalAuthSession(sessionToken);
    if (session) {
      session.expectedTargetUrl = normalizedTargetUrl;
    }
    return `${this.getProxyBaseUrl()}${this.externalAuthRoutePrefix}${encodeURIComponent(sessionToken)}?url=${encodeURIComponent(normalizedTargetUrl)}`;
  }
  parseExternalAuthProxyRequest(requestUrl) {
    try {
      const url = new URL(requestUrl ?? "/", `http://localhost:${this.port || 0}`);
      if (!url.pathname.startsWith(this.externalAuthRoutePrefix)) {
        return void 0;
      }
      const token = decodeURIComponent(url.pathname.slice(this.externalAuthRoutePrefix.length));
      const targetUrl = url.searchParams.get("url") || "";
      const session = this.getExternalAuthSession(token);
      if (!session) {
        return void 0;
      }
      const parsedTargetUrl = new URL(targetUrl);
      if (!["http:", "https:"].includes(parsedTargetUrl.protocol)) {
        return void 0;
      }
      const normalizedTargetUrl = parsedTargetUrl.toString();
      if (normalizedTargetUrl !== session.expectedTargetUrl) {
        return void 0;
      }
      return { token, targetUrl: normalizedTargetUrl };
    } catch {
      return void 0;
    }
  }
  isExternalN8nRedirect(location) {
    try {
      const targetUrl = new URL(this.target);
      const locationUrl = new URL(location, targetUrl.origin);
      return locationUrl.origin !== targetUrl.origin;
    } catch {
      return false;
    }
  }
  createExternalAuthHandoff(location, returnUrl) {
    if (!this.isExternalN8nRedirect(location)) {
      return void 0;
    }
    const targetUrl = new URL(location, new URL(this.target).origin).toString();
    const authProxyUrl = this.buildExternalAuthProxyUrl(targetUrl);
    return {
      authProxyUrl,
      html: this.buildExternalAuthHandoffHtml(authProxyUrl, returnUrl)
    };
  }
  buildProxyRequestUrl(requestUrl) {
    const path9 = requestUrl && requestUrl.startsWith("/") ? requestUrl : `/${requestUrl || ""}`;
    return `${this.getProxyBaseUrl()}${path9}`;
  }
  rememberWorkflowProxyUrl(requestUrl) {
    try {
      const url = new URL(requestUrl ?? "/", `http://localhost:${this.port || 0}`);
      if (url.pathname.startsWith("/workflow/")) {
        this.lastWorkflowProxyUrl = this.buildProxyRequestUrl(`${url.pathname}${url.search}`);
      }
    } catch {
    }
  }
  getWorkflowRetryUrl(req) {
    const referrer = typeof req.headers.referer === "string" ? req.headers.referer : void 0;
    const proxyBaseUrl = new URL(this.getProxyBaseUrl());
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer);
        const proxyBasePath = this.trimTrailingSlash(proxyBaseUrl.pathname);
        const referrerPath = proxyBasePath && referrerUrl.pathname.startsWith(`${proxyBasePath}/`) ? referrerUrl.pathname.slice(proxyBasePath.length) : referrerUrl.pathname;
        if (referrerUrl.origin === proxyBaseUrl.origin && referrerPath.startsWith("/workflow/")) {
          return referrerUrl.toString();
        }
      } catch {
      }
    }
    return this.lastWorkflowProxyUrl || this.buildProxyRequestUrl(req.url);
  }
  buildExternalAuthHandoffHtml(authProxyUrl, returnUrl) {
    const htmlSafe = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const authUrlHtml = htmlSafe(authProxyUrl);
    const returnUrlHtml = htmlSafe(returnUrl);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>n8n sign-in</title>
  <style>
    html, body { margin: 0; min-height: 100%; background: #1e1e1e; color: #f3f3f3; font-family: system-ui, -apple-system, sans-serif; }
    body { display: grid; place-items: center; padding: 24px; box-sizing: border-box; }
    main { max-width: 520px; text-align: center; }
    h1 { font-size: 20px; line-height: 1.35; margin: 0 0 12px; font-weight: 600; }
    p { margin: 0 0 20px; color: #c8c8c8; line-height: 1.5; }
    a { color: #ffffff; }
    .actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .button { display: inline-flex; align-items: center; justify-content: center; min-height: 34px; padding: 0 14px; border-radius: 4px; background: #0e639c; color: #fff; text-decoration: none; font-size: 13px; }
    .secondary { background: #3c3c3c; }
  </style>
</head>
<body>
  <main>
    <h1>Continue n8n sign-in in your browser</h1>
    <p>Your SSO provider needs to run outside the embedded workflow view. After sign-in completes, return here and retry the workflow.</p>
    <div class="actions">
      <a class="button" href="${authUrlHtml}" target="_blank" rel="noreferrer">Open browser sign-in</a>
      <a class="button secondary" href="${returnUrlHtml}">Retry workflow</a>
    </div>
  </main>
</body>
</html>`;
  }
  handleExternalAuthProxyRequest(req, res) {
    const authRequest = this.parseExternalAuthProxyRequest(req.url);
    if (!authRequest || !this.proxy) {
      return false;
    }
    const targetUrl = new URL(authRequest.targetUrl);
    req.__n8nacExternalAuth = authRequest;
    req.url = `${targetUrl.pathname}${targetUrl.search}`;
    delete req.headers["accept-encoding"];
    req.headers["host"] = targetUrl.host;
    req.headers["origin"] = targetUrl.origin;
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("access-control-allow-credentials", "true");
    this.proxy.web(req, res, {
      target: targetUrl.origin,
      changeOrigin: true,
      secure: false,
      buffer: void 0
    });
    return true;
  }
  async saveCookies() {
    if (!this.secrets || !this.target) return;
    try {
      const cookies = Array.from(this.cookieJar.entries());
      await this.secrets.store(this.getStorageKey(), JSON.stringify(cookies));
    } catch (e) {
      this.log(`[Proxy] Error persisting cookies: ${e.message}`);
    }
  }
  async loadCookies() {
    if (!this.secrets || !this.target) return;
    try {
      const stored = await this.secrets.get(this.getStorageKey());
      if (stored) {
        const cookies = JSON.parse(stored);
        for (const [key, value] of cookies) {
          this.cookieJar.set(key, value);
        }
        this.log(`[Proxy] Loaded ${this.cookieJar.size} persisted cookies for ${this.target}`);
      }
    } catch (e) {
      this.log(`[Proxy] Error loading persisted cookies: ${e.message}`);
    }
  }
  buildMergedCookieHeader(clientCookies) {
    const finalCookies = clientCookies ? [clientCookies] : [];
    if (this.cookieJar.size > 0) {
      for (const [key, value] of this.cookieJar) {
        if (!clientCookies || !clientCookies.includes(key + "=")) {
          finalCookies.push(value);
        }
      }
    }
    return finalCookies.length > 0 ? finalCookies.join("; ") : void 0;
  }
  async start(targetUrl) {
    const normalizedTarget = targetUrl.endsWith("/") ? targetUrl.slice(0, -1) : targetUrl;
    const stablePort = this.getStablePort(normalizedTarget);
    if (this.server) {
      if (this.target === normalizedTarget && this.port === stablePort) {
        return `http://localhost:${this.port}`;
      }
      this.stop();
    }
    this.cookieJar.clear();
    this.htmlRoutes.clear();
    this.externalAuthSessions.clear();
    this.lastWorkflowProxyUrl = void 0;
    this.setPublicBaseUrl(void 0);
    this.target = normalizedTarget;
    this.port = stablePort;
    const isMacOS = os4.platform() === "darwin";
    await this.loadCookies();
    this.proxy = HttpProxy.createProxyServer({
      target: this.target,
      changeOrigin: true,
      secure: false,
      // Intercept HTML responses so we can inject the n8n UI bridge.
      selfHandleResponse: true,
      cookieDomainRewrite: "",
      // Rewrite all domains to match localhost
      preserveHeaderKeyCase: true,
      // Preserve header casing
      autoRewrite: true,
      // Automatically rewrite redirects
      xfwd: true
      // Add x-forwarded headers automatically
    });
    this.proxy.on("proxyRes", (proxyRes, req, res) => {
      const externalAuth = req.__n8nacExternalAuth;
      delete proxyRes.headers["x-frame-options"];
      delete proxyRes.headers["content-security-policy"];
      delete proxyRes.headers["content-security-policy-report-only"];
      proxyRes.headers["x-accel-buffering"] = "no";
      proxyRes.headers["cache-control"] = "no-cache, no-transform";
      proxyRes.headers["connection"] = "keep-alive";
      if (proxyRes.headers["location"]) {
        const location = proxyRes.headers["location"];
        const isRedirect = (proxyRes.statusCode || 0) >= 300 && (proxyRes.statusCode || 0) < 400;
        if (!externalAuth && isRedirect && this.isExternalN8nRedirect(location)) {
          const returnUrl = this.getWorkflowRetryUrl(req);
          const handoff = this.createExternalAuthHandoff(location, returnUrl);
          if (handoff) {
            const httpRes2 = res;
            void this.openExternalUrl(handoff.authProxyUrl);
            proxyRes.resume();
            httpRes2.writeHead(200, {
              "content-type": "text/html; charset=utf-8",
              "cache-control": "no-store"
            });
            httpRes2.end(handoff.html);
            return;
          }
        }
        proxyRes.headers["location"] = this.rewriteProxyLocation(
          location,
          externalAuth?.targetUrl ?? this.target,
          externalAuth?.token
        );
      }
      if (proxyRes.headers["set-cookie"]) {
        proxyRes.headers["set-cookie"] = proxyRes.headers["set-cookie"].map((cookie) => {
          const eqIdx = cookie.indexOf("=");
          const scIdx = cookie.indexOf(";");
          if (!externalAuth && eqIdx !== -1) {
            const key = cookie.substring(0, eqIdx).trim();
            const valuePart = cookie.substring(0, scIdx !== -1 ? scIdx : void 0).trim();
            this.cookieJar.set(key, valuePart);
          }
          this.saveCookies();
          return cookie.replace(/; Secure/gi, "").replace(/; SameSite=None/gi, "").replace(/; SameSite=Strict/gi, "").replace(/; SameSite=Lax/gi, "").replace(/; Domain=[^;]+/gi, "");
        });
      }
      proxyRes.headers["access-control-allow-origin"] = "*";
      proxyRes.headers["access-control-allow-credentials"] = "true";
      proxyRes.headers["access-control-allow-methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH";
      proxyRes.headers["access-control-allow-headers"] = "*";
      const rawCT = proxyRes.headers["content-type"];
      const contentType = Array.isArray(rawCT) ? rawCT[0] || "" : rawCT || "";
      const isHtml = contentType.includes("text/html");
      const httpRes = res;
      if (isHtml) {
        const chunks = [];
        proxyRes.on("data", (chunk) => chunks.push(chunk));
        proxyRes.on("end", () => {
          try {
            const raw = Buffer.concat(chunks);
            const charsetMatch = contentType.match(/charset=([^\s;]+)/i);
            const charset = charsetMatch?.[1] || "utf-8";
            let html = raw.toString(charset);
            if (!externalAuth) {
              html = this.injectClipboardBridge(html, isMacOS);
            }
            const encoded = Buffer.from(html, charset);
            delete proxyRes.headers["content-length"];
            delete proxyRes.headers["content-encoding"];
            httpRes.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
            httpRes.end(encoded);
          } catch {
            httpRes.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
            httpRes.end(Buffer.concat(chunks));
          }
        });
      } else {
        httpRes.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(httpRes);
      }
    });
    this.proxy.on("error", (err, _req, res) => {
      this.log(`[Proxy] ERROR: ${err.message}`);
      if (res.writeHead) {
        const response = res;
        if (!response.headersSent) {
          response.writeHead(502, { "Content-Type": "text/plain" });
        }
        response.end("Proxy Error: " + err.message);
      }
    });
    this.server = http.createServer((req, res) => {
      if (this.handleExternalAuthProxyRequest(req, res)) {
        return;
      }
      const routeHtml = this.getRegisteredHtmlRoute(req.url);
      if (routeHtml && req.method === "GET") {
        res.writeHead(200, {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store"
        });
        res.end(this.injectClipboardBridge(routeHtml, isMacOS, false, "auth-route"));
        return;
      }
      if (req.method === "OPTIONS") {
        res.writeHead(200, {
          "access-control-allow-origin": "*",
          "access-control-allow-credentials": "true",
          "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
          "access-control-allow-headers": "*"
        });
        res.end();
        return;
      }
      if (this.proxy) {
        delete req.headers["accept-encoding"];
        this.rememberWorkflowProxyUrl(req.url);
        const mergedCookies = this.buildMergedCookieHeader(req.headers.cookie);
        if (mergedCookies) {
          req.headers["cookie"] = mergedCookies;
        }
        const proxyHost = `localhost:${this.port}`;
        const targetIsHttps = this.target.startsWith("https");
        const proto = targetIsHttps ? "https" : "http";
        req.headers["x-forwarded-host"] = proxyHost;
        req.headers["x-forwarded-proto"] = proto;
        req.headers["x-forwarded-port"] = this.port.toString();
        if (targetIsHttps) {
          const targetHost = this.target.replace(/^https?:\/\//, "");
          req.headers["host"] = targetHost;
        } else {
          req.headers["host"] = proxyHost;
        }
        req.headers["origin"] = targetIsHttps ? this.target : `${proto}://${proxyHost}`;
        res.setHeader("access-control-allow-origin", "*");
        res.setHeader("access-control-allow-credentials", "true");
        res.setHeader("access-control-allow-methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
        res.setHeader("access-control-allow-headers", "*");
        this.proxy.web(req, res, { buffer: void 0, changeOrigin: true, secure: false });
      }
    });
    this.wsServer = new WebSocketServer({ noServer: true, perMessageDeflate: false });
    return new Promise((resolve5, reject) => {
      if (!this.server) return reject(new Error("Server not initialized"));
      this.server.listen(this.port, "localhost", () => {
        const proxyUrl = `http://localhost:${this.port}`;
        this.log(`\u{1F7E2} [Proxy] Started: ${proxyUrl} -> ${this.target}`);
        resolve5(proxyUrl);
      });
      this.server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          this.log(`\u26A0\uFE0F [Proxy] Port ${this.port} is in use, falling back to random port...`);
          this.server?.close();
          this.server = http.createServer(this.server?.listeners("request")[0]);
          this.server.listen(0, "localhost", () => {
            const address = this.server?.address();
            this.port = address.port;
            const proxyUrl = `http://localhost:${this.port}`;
            this.log(`\u{1F7E1} [Proxy] Server started on fallback port: ${this.port}`);
            resolve5(proxyUrl);
          });
        } else {
          reject(err);
        }
      });
      this.server.on("upgrade", (req, socket, head) => {
        if (this.wsServer) {
          const targetIsHttps = this.target.startsWith("https");
          const upstreamBaseUrl = this.target.replace(/^http/, "ws");
          const upstreamUrl = new URL(req.url ?? "/", `${upstreamBaseUrl}/`).toString();
          const headers = {};
          for (const [key, value] of Object.entries(req.headers)) {
            if (value !== void 0 && key !== "sec-websocket-extensions") {
              headers[key] = Array.isArray(value) ? value.join(", ") : value;
            }
          }
          headers["host"] = this.target.replace(/^https?:\/\//, "");
          headers["origin"] = this.target;
          headers["connection"] = "Upgrade";
          headers["upgrade"] = "websocket";
          delete headers["sec-websocket-extensions"];
          const mergedCookies = this.buildMergedCookieHeader(headers["cookie"]);
          if (mergedCookies) {
            headers["cookie"] = mergedCookies;
          }
          this.log(`[Proxy] WS Upgrade Request: ${req.url}`);
          this.wsServer.handleUpgrade(req, socket, head, (clientWs) => {
            const upstreamWs = new WebSocket(upstreamUrl, {
              headers,
              rejectUnauthorized: false,
              perMessageDeflate: false
            });
            const pingTimer = setInterval(() => {
              if (upstreamWs.readyState === WebSocket.OPEN) {
                upstreamWs.ping();
              }
            }, 55e3);
            const clearPing = () => clearInterval(pingTimer);
            clientWs.on("message", (data, isBinary) => {
              if (upstreamWs.readyState === WebSocket.OPEN) {
                upstreamWs.send(data, { binary: isBinary });
              }
            });
            upstreamWs.on("message", (data, isBinary) => {
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(data, { binary: isBinary });
              }
            });
            upstreamWs.on("open", () => {
              this.log(`[Proxy] WS Connection Open (Upstream)`);
            });
            upstreamWs.on("close", (code, reason) => {
              clearPing();
              this.log(`[Proxy] WS Connection Closed (Upstream): ${code}${reason.length > 0 ? ` ${reason.toString()}` : ""}`);
              if (clientWs.readyState === WebSocket.OPEN) {
                if (this.isSendableCloseCode(code)) {
                  clientWs.close(code, reason);
                } else {
                  clientWs.close();
                }
              } else {
                clientWs.terminate();
              }
            });
            clientWs.on("close", (code, reason) => {
              clearPing();
              if (upstreamWs.readyState === WebSocket.OPEN || upstreamWs.readyState === WebSocket.CONNECTING) {
                if (this.isSendableCloseCode(code)) {
                  upstreamWs.close(code, reason);
                } else {
                  upstreamWs.close();
                }
              }
            });
            upstreamWs.on("error", (err) => {
              clearPing();
              this.log(`[Proxy] WS Connection Error (Upstream): ${err.message}`);
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.close(1011, "Upstream proxy error");
              } else {
                clientWs.terminate();
              }
            });
            clientWs.on("error", (err) => {
              clearPing();
              this.log(`[Proxy] WS Connection Error (Client): ${err.message}`);
              if (upstreamWs.readyState === WebSocket.OPEN || upstreamWs.readyState === WebSocket.CONNECTING) {
                upstreamWs.terminate();
              }
            });
          });
        }
      });
      this.server.on("error", reject);
    });
  }
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
  static buildBridgeScript(clipboardBridgeEnabled = true, nodeBridgeEnabled = true, pageKind = "n8n") {
    return `<script>
(function(){
  var CLIPBOARD_BRIDGE_ENABLED = ${JSON.stringify(clipboardBridgeEnabled)};
  var NODE_BRIDGE_ENABLED = ${JSON.stringify(nodeBridgeEnabled)};
  var N8NAC_BRIDGE_PAGE_KIND = ${JSON.stringify(pageKind)};
  var N8NAC_BRIDGE_BUILD = "2026.05.04.8";
  var _pasteInProgress = false;
  var _lastNodeDetailSignature = "";
  var _lastCanvasNode = null;
  var _uiMutationTimer = null;
  var _uiMutationCount = 0;

  function postBridgeReady() {
    window.parent.postMessage({ type: "n8n-bridge-ready", build: N8NAC_BRIDGE_BUILD, pageKind: N8NAC_BRIDGE_PAGE_KIND, href: window.location.href }, "*");
  }

  function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  }

  function cleanText(value) {
    if (typeof value !== "string") return "";
    return value.replace(/\\s+/g, " ").trim();
  }

  function coerceNode(value) {
    var record = asRecord(value);
    if (!record) return null;
    var name = cleanText(record.name || record.displayName || record.label || record.title || "");
    if (!name) return null;
    return {
      name: name,
      type: cleanText(record.type || record.nodeType || record.typeVersion || ""),
      id: cleanText(record.id || record.nodeId || "")
    };
  }

  function describeElement(element) {
    if (!element || element.nodeType !== 1) return "unknown";
    var tag = cleanText(element.tagName || "element").toLowerCase();
    var testId = element.getAttribute && cleanText(element.getAttribute("data-test-id") || "");
    var label = element.getAttribute && cleanText(element.getAttribute("aria-label") || element.getAttribute("title") || "");
    var text = cleanText(element.textContent || "");
    if (text.length > 60) text = text.slice(0, 57) + "...";
    return [tag, testId || label || text].filter(Boolean).join(": ");
  }

  function postUiClick(event) {
    var target = event.target;
    var nodeRoot = findCanvasNodeElement(target);
    var canvasSurface = isCanvasSurfaceElement(target);
    var node = null;
    if (nodeRoot) {
      try { node = readNodeFromElement(target); } catch (e) {}
      window.setTimeout(function() {
        publishNodeDetail(node || readNodeFromStore());
      }, 50);
    } else if (canvasSurface) {
      clearNodeContext();
    }
    window.parent.postMessage({
      type: "n8n-ui-click",
      build: N8NAC_BRIDGE_BUILD,
      target: describeElement(event.target),
      nodeName: node && node.name
    }, "*");
  }

  function postUiChangedSoon() {
    _uiMutationCount += 1;
    if (_uiMutationTimer) return;
    _uiMutationTimer = window.setTimeout(function() {
      _uiMutationTimer = null;
      window.parent.postMessage({
        type: "n8n-ui-change",
        build: N8NAC_BRIDGE_BUILD,
        count: _uiMutationCount
      }, "*");
    }, 250);
  }

  function firstUsefulText(root) {
    if (!root) return "";
    var selectors = ["[data-test-id='node-title']", "[data-test-id*='node-name']", "[data-test-id*='nodeName']", "[class*='node-name']", "[class*='nodeName']", "[class*='node-title']", "[class*='nodeTitle']", "[class*='modal-title']", "[class*='ModalTitle']", ".el-dialog__title", "header [class*='title']", "header [class*='Title']", "[title]", "[aria-label]", "[role='heading']", "h1", "h2", "h3"];
    for (var i = 0; i < selectors.length; i++) {
      try {
        var candidate = root.matches && root.matches(selectors[i]) ? root : root.querySelector && root.querySelector(selectors[i]);
        var text = cleanText((candidate && (candidate.getAttribute("title") || candidate.getAttribute("aria-label") || candidate.textContent)) || "");
        if (text && text.length <= 120 && text !== "Parameters" && text !== "Settings") return text;
      } catch (e) {}
    }
    var fallback = cleanText(root.textContent || "");
    if (!fallback || fallback.length > 160) return "";
    return fallback;
  }

  function looksLikeNodeDetailPanel(root) {
    if (!root || !isVisible(root)) return false;
    var text = cleanText(root.textContent || "");
    if (!text) return false;
    if (/\\b(Parameters|Settings)\\b/.test(text) && /\\b(Execute step|INPUT|OUTPUT|Source for Prompt|Options)\\b/.test(text)) return true;
    if (/\\b(Node|Credential|Parameter|Execute step)\\b/.test(text) && /\\b(INPUT|OUTPUT|Parameters|Settings)\\b/.test(text)) return true;
    return false;
  }

  function isLikelyNodeTitleText(text) {
    text = cleanText(text);
    if (!text || text.length < 2 || text.length > 120) return false;
      if (/^(Parameters|Settings|INPUT|OUTPUT|Docs|Execute step|Execute previous nodes|No input data|No output data|Options|Add Option|Tool|Memory|Chat Model|Logs)$/i.test(text)) return false;
      if (/^(Tip:|Source for Prompt|Prompt \\(|Require Specific|Enable Fallback|Connected Chat Trigger Node)/i.test(text)) return false;
    if (/^[+\xD7x-\u2013\u2014|\u2022\xB7]+$/.test(text)) return false;
    return true;
  }

  function readNodeTitleFromPanelTopBand(root) {
    if (!root || !isVisible(root)) return null;
    var rootRect = root.getBoundingClientRect();
    var selectors = "div,span,h1,h2,h3,[role='heading'],[title],[aria-label]";
    var candidates = [];
    try { candidates = Array.prototype.slice.call(root.querySelectorAll(selectors)); } catch (e) { candidates = []; }
    if (root.matches && root.matches(selectors)) candidates.unshift(root);

    var best = null;
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      if (!isVisible(el)) continue;
      var rect = el.getBoundingClientRect();
      if (rect.top < rootRect.top - 2 || rect.top > rootRect.top + 80) continue;
      if (rect.left < rootRect.left - 2 || rect.left > rootRect.left + Math.max(220, rootRect.width * 0.45)) continue;
      var text = cleanText(el.getAttribute && (el.getAttribute("title") || el.getAttribute("aria-label")) || el.textContent || "");
      if (!isLikelyNodeTitleText(text)) continue;
      var score = (rect.top - rootRect.top) * 1000 + (rect.left - rootRect.left) + Math.max(0, text.length - 60) * 10;
      if (!best || score < best.score) best = { score: score, text: text };
    }
    return best ? { name: best.text, type: "", id: "" } : null;
  }

  function findNodeDetailRootByTextScan() {
    var candidates = [];
    try { candidates = Array.prototype.slice.call(document.querySelectorAll("[role='dialog'],[aria-modal='true'],section,aside,main,div")); } catch (e) { candidates = []; }
    var best = null;
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      if (!isVisible(el)) continue;
      var rect = el.getBoundingClientRect();
      if (rect.width < 300 || rect.height < 180) continue;
      var text = cleanText(el.textContent || "");
      if (!/\\bParameters\\b/.test(text) || !/\\bSettings\\b/.test(text) || !/\\bExecute step\\b/.test(text)) continue;
      var title = readNodeTitleFromPanelTopBand(el);
      if (!title) continue;
      var area = rect.width * rect.height;
      if (!best || area < best.area) best = { area: area, element: el };
    }
    return best ? best.element : null;
  }

  function findNodeDetailTitleByPanelText() {
    var titleSelectors = ["[data-test-id='node-title']", "[data-test-id*='node-name']", "[data-test-id*='nodeName']", "[class*='node-name']", "[class*='nodeName']", "[class*='modal-title']", "[class*='ModalTitle']", ".el-dialog__title", "header [class*='title']", "header [class*='Title']", "h1", "h2", "h3", "[role='heading']"];
    for (var i = 0; i < titleSelectors.length; i++) {
      var titles = [];
      try { titles = Array.prototype.slice.call(document.querySelectorAll(titleSelectors[i])); } catch (e) { titles = []; }
      for (var j = 0; j < titles.length; j++) {
        var title = titles[j];
        if (!isVisible(title)) continue;
        var name = cleanText(title.textContent || title.getAttribute("title") || title.getAttribute("aria-label") || "");
        if (!isLikelyNodeTitleText(name)) continue;

        var cursor = title;
        for (var depth = 0; cursor && depth < 8; depth++) {
          var text = cleanText(cursor.textContent || "");
          if (/\\bParameters\\b/.test(text) && /\\bSettings\\b/.test(text) && /\\bExecute step\\b/.test(text)) {
            return { name: name, type: "", id: "" };
          }
          cursor = cursor.parentElement;
        }
      }
    }
    return null;
  }

  function readNodeFromElement(element) {
    if (!element || !element.closest) return null;
    var root = findCanvasNodeElement(element);
    if (!root) return null;
    var attrHost = root.matches && (root.matches("[data-node-name]") || root.matches("[data-name]"))
      ? root
      : root.querySelector && root.querySelector("[data-node-name], [data-name]");
    var attrName = attrHost && cleanText(attrHost.getAttribute("data-node-name") || attrHost.getAttribute("data-name") || "");
    var name = attrName || firstUsefulText(root);
    if (!name) return null;
    return {
      name: name,
      type: cleanText((attrHost && (attrHost.getAttribute("data-node-type") || attrHost.getAttribute("data-type"))) || root.getAttribute && (root.getAttribute("data-node-type") || root.getAttribute("data-type")) || ""),
      id: cleanText((attrHost && (attrHost.getAttribute("data-node-id") || attrHost.getAttribute("data-id"))) || root.getAttribute && (root.getAttribute("data-node-id") || root.getAttribute("data-id")) || "")
    };
  }

  function findCanvasNodeElement(element) {
    if (!element || !element.closest) return null;
    var selectors = [
      "[data-test-id='canvas-node']",
      "[data-test-id*='canvas-node']",
      "[data-test-id*='workflow-node']",
      "[data-test-id*='node-view-node']",
      "[data-node-name]",
      "[data-name]",
      "[class*='canvas-node']",
      "[class*='CanvasNode']",
      "[class*='workflow-node']",
      "[class*='node-box']"
    ];
    for (var i = 0; i < selectors.length; i++) {
      try {
        var match = element.closest(selectors[i]);
        if (match && isVisible(match)) return match;
      } catch (e) {}
    }
    return null;
  }

  function isCanvasSurfaceElement(element) {
    if (!element || !element.closest) return false;
    if (findCanvasNodeElement(element)) return false;
    if (findNodeDetailRoot() && element.closest && element.closest("[role='dialog'],[aria-modal='true'],[class*='node-parameters'],[class*='NodeParameters'],[class*='modal'],[class*='Modal'],[class*='drawer'],[class*='Drawer']")) return false;
    var selectors = [
      "[data-test-id='canvas']",
      "[data-test-id*='canvas']",
      "[data-test-id*='node-view']",
      "[data-test-id*='workflow']",
      "[class*='canvas']",
      "[class*='Canvas']",
      "[class*='node-view']",
      "[class*='NodeView']",
      ".vue-flow",
      ".react-flow"
    ];
    for (var i = 0; i < selectors.length; i++) {
      try {
        var match = element.closest(selectors[i]);
        if (match && isVisible(match)) return true;
      } catch (e) {}
    }
    return false;
  }

  function readNodeFromStore() {
    try {
      var app = document.querySelector("#app");
      var vue = app && app.__vue__;
      var store = vue && vue.$store;
      if (!store) return null;
      var getters = store.getters || {};
      var getterKeys = ["ndv/activeNode", "nodeView/selectedNode", "workflows/getSelectedNode", "workflows/selectedNode"];
      for (var i = 0; i < getterKeys.length; i++) {
        var fromGetter = coerceNode(getters[getterKeys[i]]);
        if (fromGetter) return fromGetter;
      }
      var state = store.state || {};
      var candidates = [
        state.ndv && state.ndv.activeNode,
        state.ndv && state.ndv.node,
        state.nodeView && state.nodeView.selectedNode,
        state.workflows && state.workflows.selectedNode,
        state.workflows && state.workflows.activeNode
      ];
      for (var j = 0; j < candidates.length; j++) {
        var fromState = coerceNode(candidates[j]);
        if (fromState) return fromState;
      }
    } catch (e) {}
    return null;
  }

  function isVisible(el) {
    if (!el) return false;
    var rect = el.getBoundingClientRect && el.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return false;
    var style = window.getComputedStyle ? window.getComputedStyle(el) : null;
    return !style || (style.visibility !== "hidden" && style.display !== "none");
  }

  function findNodeDetailRoot() {
    var selectors = [
      "[data-test-id='ndv']",
      "[data-test-id='node-parameters']",
      "[data-test-id*='node-parameters']",
      "[data-test-id*='node-creator']",
      "[data-test-id*='node-detail']",
      "[data-test-id*='nodeDetail']",
      "[role='dialog']",
      "[aria-modal='true']",
      "[class*='node-parameters']",
      "[class*='NodeParameters']",
      "[class*='node-detail']",
      "[class*='NodeDetail']",
      "[class*='node-settings']",
      "[class*='NodeSettings']",
      "[class*='modal']",
      "[class*='Modal']",
      "[class*='dialog']",
      "[class*='Dialog']",
      "[class*='drawer']",
      "[class*='Drawer']",
      "[class*='ndv']",
      "[class*='NDV']"
    ];
    for (var i = 0; i < selectors.length; i++) {
      try {
        var nodes = document.querySelectorAll(selectors[i]);
        for (var j = 0; j < nodes.length; j++) {
          if (looksLikeNodeDetailPanel(nodes[j])) return nodes[j];
        }
      } catch (e) {}
    }
    return null;
  }

  function readNodeFromDom(root) {
    if (!root) return null;
    var attrHost = root.matches && root.matches("[data-node-name]") ? root : root.querySelector && root.querySelector("[data-node-name]");
    var attrName = attrHost && cleanText(attrHost.getAttribute("data-node-name") || "");
    if (attrName) {
      return {
        name: attrName,
        type: cleanText((attrHost && attrHost.getAttribute("data-node-type")) || ""),
        id: cleanText((attrHost && attrHost.getAttribute("data-node-id")) || "")
      };
    }
    var titleSelectors = ["[data-test-id='node-title']", "[data-test-id*='node-name']", "[data-test-id*='nodeName']", "[class*='node-name']", "[class*='nodeName']", "[class*='modal-title']", "[class*='ModalTitle']", ".el-dialog__title", "header [class*='title']", "header [class*='Title']", "h1", "h2", "h3", "[role='heading']"];
    for (var i = 0; i < titleSelectors.length; i++) {
      try {
        var title = root.querySelector(titleSelectors[i]);
        var text = cleanText(title && title.textContent || "");
        if (text && text !== "Parameters" && text !== "Settings" && text !== "INPUT" && text !== "OUTPUT" && text.length <= 120) {
          return { name: text, type: "", id: "" };
        }
      } catch (e) {}
    }
    return null;
  }

  function readNodeFromUrl() {
    try {
      var url = new URL(window.location.href);
      var name = cleanText(url.searchParams.get("node") || url.searchParams.get("nodeName") || "");
      var id = cleanText(url.searchParams.get("nodeId") || url.searchParams.get("selectedNode") || "");
      return name ? { name: name, type: "", id: id } : null;
    } catch (e) {
      return null;
    }
  }

  function publishNodeDetailIfOpen() {
    if (!NODE_BRIDGE_ENABLED) return;
    var root = findNodeDetailRoot();
    var node = readNodeFromStore() || (root ? readNodeFromDom(root) : null) || (root ? readNodeTitleFromPanelTopBand(root) : null) || findNodeDetailTitleByPanelText() || readNodeFromUrl() || (root ? _lastCanvasNode : null);
    publishNodeDetail(node);
  }

  function publishNodeDetail(node) {
    if (!NODE_BRIDGE_ENABLED) return;
    if (!node || !node.name) return;
    var signature = [node.name, node.type || "", node.id || ""].join("|");
    if (signature === _lastNodeDetailSignature) return;
    _lastNodeDetailSignature = signature;
    window.parent.postMessage({ type: "n8n-node-detail-opened", build: N8NAC_BRIDGE_BUILD, node: node }, "*");
  }

  function clearNodeContext() {
    _lastNodeDetailSignature = "";
    _lastCanvasNode = null;
    window.parent.postMessage({ type: "n8n-node-context-cleared", build: N8NAC_BRIDGE_BUILD }, "*");
  }

  function installNodeDetailObserver() {
    postBridgeReady();
    if (!NODE_BRIDGE_ENABLED) return;
    document.addEventListener("pointerdown", function(e) {
      var node = readNodeFromElement(e.target);
      if (node) _lastCanvasNode = node;
    }, true);
    document.addEventListener("click", function(e) {
      postUiClick(e);
    }, true);
    document.addEventListener("dblclick", function(e) {
      var node = readNodeFromElement(e.target) || _lastCanvasNode;
      if (!node) return;
      _lastCanvasNode = node;
      window.setTimeout(function() {
        publishNodeDetail(node || readNodeFromStore());
      }, 200);
    }, true);
    try {
      var observer = new MutationObserver(function() { postUiChangedSoon(); });
      observer.observe(document.body || document.documentElement, { childList: true, subtree: true, attributes: true });
    } catch (e) {}
    window.setInterval(postBridgeReady, 5000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installNodeDetailObserver, { once: true });
  } else {
    installNodeDetailObserver();
  }

  function handlePaste(text) {
    var el = document.activeElement;

    // Input/Textarea: direct value manipulation
    if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
      var s = el.selectionStart || 0;
      var end = el.selectionEnd || 0;
      el.value = el.value.substring(0, s) + text + el.value.substring(end);
      el.selectionStart = el.selectionEnd = s + text.length;
      el.dispatchEvent(new Event("input", {bubbles:true}));
      el.dispatchEvent(new Event("change", {bubbles:true}));
      return;
    }

    // Monkey-patch clipboard.readText so n8n gets our data
    var origRT = navigator.clipboard && navigator.clipboard.readText;
    try {
      if (navigator.clipboard) {
        navigator.clipboard.readText = function() {
          navigator.clipboard.readText = origRT;
          return Promise.resolve(text);
        };
      }
    } catch(ex) {
      try {
        Object.defineProperty(navigator.clipboard, "readText", {
          value: function() {
            Object.defineProperty(navigator.clipboard, "readText", {
              value: origRT, writable:true, configurable:true
            });
            return Promise.resolve(text);
          }, writable:true, configurable:true
        });
      } catch(ex2) {}
    }

    // Dispatch synthetic keydown Cmd+V (with guard to prevent re-entry)
    _pasteInProgress = true;
    var kbOpts = {key:"v",code:"KeyV",keyCode:86,which:86,metaKey:true,ctrlKey:false,bubbles:true,cancelable:true};
    var tgt = document.activeElement || document.body;
    tgt.dispatchEvent(new KeyboardEvent("keydown", kbOpts));
    document.dispatchEvent(new KeyboardEvent("keydown", kbOpts));

    // Also dispatch paste ClipboardEvent
    try {
      var dt = new DataTransfer();
      dt.setData("text/plain", text);
      tgt.dispatchEvent(new ClipboardEvent("paste",{bubbles:true,cancelable:true,clipboardData:dt}));
      document.dispatchEvent(new ClipboardEvent("paste",{bubbles:true,cancelable:true,clipboardData:dt}));
    } catch(ex) {}

    // Cleanup guard and monkey-patch after n8n has had time to read
    setTimeout(function(){
      _pasteInProgress = false;
      try { if(origRT && navigator.clipboard) navigator.clipboard.readText = origRT; } catch(ex){}
    }, 500);
  }

  // Intercept Cmd+V only (macOS-specific bridge \u2014 no static secret here;
  // origin validation and one-time grant tokens are enforced in the parent webview)
  document.addEventListener("keydown", function(e) {
    if (!CLIPBOARD_BRIDGE_ENABLED) return;
    if (e.metaKey && e.key === "v") {
      if (_pasteInProgress) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.parent.postMessage({ type: "n8n-paste-request" }, "*");
    }
    if (e.metaKey && e.key === "c") {
      setTimeout(function() {
        var sel = window.getSelection();
        var text = sel ? sel.toString() : "";
        if (text) {
          window.parent.postMessage({ type: "n8n-clipboard-write", text: text }, "*");
        }
      }, 50);
    }
  }, true);

  // Listen for paste data from parent webview
  // The parent webview validates origin and uses one-time grant tokens;
  // no additional secret is needed on this side.
  window.addEventListener("message", function(e) {
    var msg = e.data;
    if (!msg || typeof msg !== "object") return;
    if (CLIPBOARD_BRIDGE_ENABLED && msg.type === "n8n-clipboard-paste" && typeof msg.text === "string") {
      handlePaste(msg.text);
    }
  });
})();
</script>`;
  }
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
  injectClipboardBridge(html, clipboardBridgeEnabled = true, nodeBridgeEnabled = true, pageKind = "n8n") {
    const bridgeScript = _ProxyService.buildBridgeScript(clipboardBridgeEnabled, nodeBridgeEnabled, pageKind);
    if (html.includes("</head>")) {
      return html.replace("</head>", bridgeScript + "</head>");
    } else if (html.includes("</body>")) {
      return html.replace("</body>", bridgeScript + "</body>");
    }
    return html + bridgeScript;
  }
  stop() {
    if (this.wsServer) {
      this.wsServer.close();
      this.wsServer = void 0;
    }
    if (this.server) {
      this.server.close();
      this.server = void 0;
    }
    if (this.proxy) {
      this.proxy.close();
      this.proxy = void 0;
    }
  }
  getProxyUrl() {
    return this.port > 0 ? `http://localhost:${this.port}` : "";
  }
  getRegisteredHtmlRoute(requestUrl) {
    try {
      const url = new URL(requestUrl ?? "/", `http://localhost:${this.port || 0}`);
      return this.htmlRoutes.get(this.normalizeRoutePath(url.pathname));
    } catch {
      return void 0;
    }
  }
  normalizeRoutePath(routePath) {
    const trimmed = routePath.trim();
    if (!trimmed) return "/";
    try {
      return new URL(trimmed, "http://localhost").pathname;
    } catch {
      return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    }
  }
};

// src/services/worktree-service.ts
import * as fs6 from "fs";
import * as path5 from "path";
import { execFile as execFile2 } from "child_process";
import { promisify as promisify2 } from "util";
var execFileAsync2 = promisify2(execFile2);
var WorktreeService = class {
  constructor(workspaceRoot, log = () => {
  }) {
    this.log = log;
    this.worktreesRoot = path5.join(workspaceRoot, ".n8nac", "worktrees");
  }
  log;
  worktreesRoot;
  async listWorktrees(repoPath) {
    try {
      const { stdout } = await execFileAsync2("git", ["worktree", "list", "--porcelain"], {
        cwd: repoPath,
        maxBuffer: 1024 * 1024
      });
      return this.parseWorktreePorcelain(stdout);
    } catch (error) {
      this.log(`[n8n-worktree] List failed: ${error?.message || String(error)}`);
      return [];
    }
  }
  async createWorktree(repoPath, options = {}) {
    const branchName = this.normalizeBranchName(options.branchName || `n8n-agent-${Date.now().toString(36)}`);
    const worktreePath = path5.join(this.worktreesRoot, branchName);
    fs6.mkdirSync(this.worktreesRoot, { recursive: true });
    const args = ["worktree", "add"];
    if (options.detach) {
      args.push("--detach");
    } else {
      args.push("-b", branchName);
    }
    args.push(worktreePath);
    if (options.baseBranch) {
      args.push(options.baseBranch);
    }
    try {
      await execFileAsync2("git", args, {
        cwd: repoPath,
        maxBuffer: 10 * 1024 * 1024
      });
      this.log(`[n8n-worktree] Created worktree at ${worktreePath} branch=${branchName}`);
    } catch (error) {
      const message = error?.message || String(error);
      this.log(`[n8n-worktree] Create failed: ${message}`);
      throw new Error(`Failed to create worktree: ${message}`);
    }
    const worktrees = await this.listWorktrees(repoPath);
    const created = await this.findWorktreeByPath(worktrees, worktreePath);
    if (!created) {
      throw new Error("Worktree created but not found in listing.");
    }
    return created;
  }
  async removeWorktree(repoPath, worktreePath) {
    const resolvedWorktreePath = this.resolveManagedWorktreePath(worktreePath);
    const worktrees = await this.listWorktrees(repoPath);
    const knownWorktree = await this.findWorktreeByPath(worktrees, resolvedWorktreePath);
    if (!knownWorktree) {
      throw new Error("Refusing to remove unknown worktree path.");
    }
    if (knownWorktree.locked) {
      throw new Error("Cannot remove locked worktree. Unlock it with Git before deleting it.");
    }
    try {
      await execFileAsync2("git", ["worktree", "remove", resolvedWorktreePath], {
        cwd: repoPath,
        maxBuffer: 10 * 1024 * 1024
      });
      this.log(`[n8n-worktree] Removed worktree at ${resolvedWorktreePath}`);
    } catch (error) {
      const message = this.formatRemoveError(error);
      this.log(`[n8n-worktree] Remove failed: ${message}`);
      throw new Error(`Failed to remove worktree: ${message}`);
    }
  }
  getWorktreesRoot() {
    return this.worktreesRoot;
  }
  normalizeBranchName(value) {
    const branchName = value.trim();
    if (!branchName) {
      throw new Error("Worktree branch name is required.");
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(branchName)) {
      throw new Error("Worktree branch name may only contain letters, numbers, dots, underscores, and hyphens.");
    }
    if (branchName.endsWith(".") || branchName.includes("..") || branchName.endsWith(".lock")) {
      throw new Error("Worktree branch name is not a safe Git branch name.");
    }
    return branchName;
  }
  resolveManagedWorktreePath(worktreePath) {
    const resolvedRoot = path5.resolve(this.worktreesRoot);
    const resolvedWorktreePath = path5.resolve(worktreePath);
    try {
      const realRoot = fs6.realpathSync(this.worktreesRoot);
      const realWorktreePath = fs6.realpathSync(worktreePath);
      if (!this.isManagedChildPath(realRoot, realWorktreePath)) {
        throw new Error("Refusing to remove worktree outside the managed worktrees directory.");
      }
      return realWorktreePath;
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }
    if (!this.isManagedChildPath(resolvedRoot, resolvedWorktreePath)) {
      throw new Error("Refusing to remove worktree outside the managed worktrees directory.");
    }
    return resolvedWorktreePath;
  }
  isManagedChildPath(rootPath, childPath) {
    const relativePath = path5.relative(rootPath, childPath);
    return Boolean(relativePath) && relativePath !== ".." && !relativePath.startsWith(`..${path5.sep}`) && !path5.isAbsolute(relativePath);
  }
  async findWorktreeByPath(worktrees, worktreePath) {
    const expectedPath = await this.canonicalPath(worktreePath);
    for (const worktree of worktrees) {
      if (await this.canonicalPath(worktree.path) === expectedPath) {
        return worktree;
      }
    }
    return void 0;
  }
  async canonicalPath(value) {
    try {
      return await fs6.promises.realpath(value);
    } catch {
      return path5.resolve(value);
    }
  }
  parseWorktreePorcelain(output) {
    const lines = output.trim().split("\n");
    const result = [];
    let current = {};
    for (const line of lines) {
      if (line === "") {
        if (current.path) {
          result.push({
            path: current.path,
            head: current.head || "",
            branch: current.branch,
            bare: current.bare ?? false,
            detached: current.detached ?? false,
            locked: current.locked ?? false
          });
        }
        current = {};
        continue;
      }
      const spaceIndex = line.indexOf(" ");
      const key = spaceIndex >= 0 ? line.slice(0, spaceIndex) : line;
      const value = spaceIndex >= 0 ? line.slice(spaceIndex + 1) : "";
      switch (key) {
        case "worktree":
          current.path = value;
          break;
        case "HEAD":
          current.head = value;
          break;
        case "branch":
          current.branch = value;
          break;
        case "bare":
          current.bare = true;
          break;
        case "detached":
          current.detached = true;
          break;
        case "locked":
          current.locked = true;
          break;
      }
    }
    if (current.path) {
      result.push({
        path: current.path,
        head: current.head || "",
        branch: current.branch,
        bare: current.bare ?? false,
        detached: current.detached ?? false,
        locked: current.locked ?? false
      });
    }
    return result;
  }
  formatRemoveError(error) {
    const stderr = typeof error?.stderr === "string" ? error.stderr : "";
    const stdout = typeof error?.stdout === "string" ? error.stdout : "";
    const message = [stderr, stdout, error?.message || String(error)].filter(Boolean).join("\n").trim();
    if (/contains modified or untracked files|contains.*uncommitted|is dirty/i.test(message)) {
      return "Cannot remove worktree because it contains uncommitted changes. Commit, stash, or discard those changes first.";
    }
    return message || "Unknown git worktree remove error.";
  }
};

// src/services/n8n-configuration-controller.ts
import * as fs7 from "fs";
import * as path6 from "path";
import * as vscode17 from "vscode";
import { createHash as createHash3 } from "crypto";
import {
  createN8nManagerFacade as createN8nManagerFacade2,
  resolveN8nManagerConfigurationPaths
} from "@n8n-as-code/manager-adapter";
import { ConfigService as ConfigService6, WorkspaceMigrationFacade as WorkspaceMigrationFacade3, isCanonicalUserInstanceIdentifier as isCanonicalUserInstanceIdentifier2, resolveInstanceIdentifier as resolveInstanceIdentifier3 } from "n8nac";
var N8nConfigurationController = class {
  constructor(outputChannel2) {
    this.outputChannel = outputChannel2;
  }
  outputChannel;
  onDidChangeEmitter = new vscode17.EventEmitter();
  onDidChangeSnapshot = this.onDidChangeEmitter.event;
  disposables = [];
  watcherDisposables = [];
  refreshTimer;
  snapshot;
  start() {
    this.rebuildWatchers();
    this.disposables.push(vscode17.workspace.onDidChangeWorkspaceFolders(() => {
      this.rebuildWatchers();
      this.scheduleRefresh("workspace-folders-changed");
    }));
    this.scheduleRefresh("startup");
  }
  getSnapshot() {
    return this.snapshot;
  }
  async refresh(reason = "manual", options = {}) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = void 0;
    }
    const previous = this.snapshot;
    const next = await this.readSnapshot();
    this.snapshot = next;
    if (options.force || !previous || previous.signature !== next.signature || previous.error !== next.error) {
      this.outputChannel?.appendLine(`[n8n] Configuration snapshot refreshed (${reason}).`);
      this.onDidChangeEmitter.fire({ snapshot: next, previous, reason });
    }
    return next;
  }
  scheduleRefresh(reason = "watcher") {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = void 0;
      void this.refresh(reason).catch((error) => {
        this.outputChannel?.appendLine(`[n8n] Configuration refresh failed: ${error?.message || error}`);
      });
    }, 120);
  }
  dispose() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = void 0;
    }
    this.disposeWatchers();
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
    this.disposables.length = 0;
    this.onDidChangeEmitter.dispose();
  }
  async readSnapshot() {
    const workspaceRoot = getWorkspaceRoot2();
    const facade = createN8nManagerFacade2({ workspaceRoot });
    const configService = workspaceRoot ? new ConfigService6(workspaceRoot) : void 0;
    const hasWorkspaceConfig = workspaceRoot ? fs7.existsSync(path6.join(workspaceRoot, "n8nac-config.json")) : false;
    try {
      let global = await facade.getGlobalConfig();
      const migration = hasWorkspaceConfig && configService ? new WorkspaceMigrationFacade3({ configService }).inspect() : void 0;
      if (!hasWorkspaceConfig) {
        return this.buildSnapshot({
          workspaceRoot,
          global,
          workspace: { version: 3 },
          hasWorkspaceConfig: false,
          hasValidConnection: false
        });
      }
      if (migration?.operations.some((operation) => operation.id === "legacy-workspace-config")) {
        return this.buildSnapshot({
          workspaceRoot,
          global,
          workspace: { version: 3 },
          hasWorkspaceConfig,
          hasValidConnection: false,
          migration
        });
      }
      const workspace8 = workspaceRoot && configService ? configService.getWorkspaceConfig() : { version: 3 };
      const isEnvironmentWorkspace = workspace8.version === 4;
      let prepared = isEnvironmentWorkspace ? void 0 : await facade.prepareEffectiveContext({
        workspaceRoot,
        syncFolderDefault: "workspace",
        consumer: "vscode",
        autoStart: true
      }).catch(() => void 0);
      let effective = isEnvironmentWorkspace && configService ? await configService.prepareWorkspaceContext({ consumer: "vscode" }).catch(() => configService.getEffectiveContext()) : prepared?.context;
      if (prepared) {
        const effectiveHost = prepared.context.apiBaseUrl ?? prepared.context.host;
        if (effectiveHost && prepared.context.apiKey && !isCanonicalUserInstanceIdentifier2(prepared.context.instanceIdentifier)) {
          const { identifier } = await resolveInstanceIdentifier3({
            host: effectiveHost,
            apiKey: prepared.context.apiKey
          });
          await facade.upsertInstance({
            id: prepared.context.activeInstanceId,
            instanceIdentifier: identifier
          }, { setActive: false });
          prepared = {
            ...prepared,
            context: {
              ...prepared.context,
              instanceIdentifier: identifier,
              instance: {
                ...prepared.context.instance,
                instanceIdentifier: identifier
              }
            }
          };
        }
        global = await facade.getGlobalConfig();
      }
      const hasValidConnection = Boolean((effective?.apiBaseUrl ?? effective?.host) && effective?.apiKey && !prepared?.runtime.blocked);
      return this.buildSnapshot({
        workspaceRoot,
        global,
        workspace: workspace8,
        effective,
        runtime: prepared?.runtime,
        diagnostics: prepared?.diagnostics,
        hasWorkspaceConfig,
        hasValidConnection,
        migration
      });
    } catch (error) {
      const global = await facade.getGlobalConfig().catch(() => ({
        version: 1,
        defaultSyncFolder: "",
        instances: []
      }));
      const workspace8 = workspaceRoot && configService ? this.readWorkspaceSnapshotConfig(configService) : { version: 3 };
      return this.buildSnapshot({
        workspaceRoot,
        global,
        workspace: workspace8,
        hasWorkspaceConfig,
        hasValidConnection: false,
        error: error?.message || String(error)
      });
    }
  }
  buildSnapshot(input) {
    const workspace8 = input.workspace;
    const effective = input.effective;
    const credentialFingerprint = input.effective?.apiKey ? createHash3("sha256").update(input.effective.apiKey).digest("hex") : "";
    const runtimeSignature = JSON.stringify({
      workspaceRoot: input.workspaceRoot || "",
      workspaceVersion: workspace8?.version || "",
      activeEnvironmentId: workspace8?.activeEnvironmentId || "",
      environmentId: effective?.environmentId || workspace8?.activeEnvironment?.id || "",
      environmentName: effective?.environmentName || workspace8?.activeEnvironment?.name || "",
      environmentTargetId: effective?.environmentTargetId || workspace8?.environmentTargetId || "",
      environmentTargetName: effective?.environmentTargetName || workspace8?.environmentTargetName || "",
      sourceKind: effective?.sourceKind || workspace8?.sourceKind || "",
      credentialSource: effective?.apiKeySource || workspace8?.credentialSource || "",
      credentialFingerprint,
      activeInstanceId: input.effective?.activeInstanceId || "",
      apiBaseUrl: input.effective?.apiBaseUrl ?? input.effective?.host ?? "",
      publicBaseUrl: input.effective?.publicBaseUrl || "",
      hasApiKey: Boolean(input.effective?.apiKey),
      syncFolder: input.effective?.syncFolder || "",
      projectId: input.effective?.projectId || "",
      projectName: input.effective?.projectName || "",
      instanceIdentifier: input.effective?.instanceIdentifier || "",
      folderSync: Boolean(input.effective?.folderSync),
      runtimeStatus: input.runtime?.status || "",
      runtimeReady: Boolean(input.runtime?.ready),
      runtimeBlocked: input.runtime?.blocked?.code || "",
      tunnelPublicUrl: input.runtime?.tunnel?.publicUrl || "",
      tunnelRunning: Boolean(input.runtime?.tunnel?.running),
      error: input.error || "",
      migration: input.migration ? {
        status: input.migration.status,
        configPath: input.migration.configPath,
        required: input.migration.required,
        operations: input.migration.operations.map((operation) => ({
          id: operation.id,
          instanceCount: operation.instanceCount
        }))
      } : void 0
    });
    const signature = JSON.stringify({
      runtime: runtimeSignature,
      hasWorkspaceConfig: input.hasWorkspaceConfig,
      global: {
        activeInstanceId: input.global.activeInstanceId || "",
        defaultSyncFolder: input.global.defaultSyncFolder || "",
        instances: input.global.instances.map((instance) => ({
          id: instance.id,
          name: instance.name,
          mode: instance.mode,
          url: instance.baseUrl || "",
          tunnelPublicUrl: instance.tunnelPublicUrl || "",
          apiKeyAvailable: Boolean(instance.apiKeyAvailable),
          defaultProjectId: instance.defaultProject?.id || "",
          defaultProjectName: instance.defaultProject?.name || "",
          instanceIdentifier: instance.instanceIdentifier || "",
          updatedAt: instance.updatedAt || ""
        }))
      },
      workspace: input.workspace
    });
    return {
      ...input,
      effective: this.sanitizeEffectiveContext(input.effective),
      signature,
      runtimeSignature,
      migration: input.migration
    };
  }
  readWorkspaceSnapshotConfig(configService) {
    try {
      return configService.getWorkspaceConfig();
    } catch {
      return { version: 3 };
    }
  }
  sanitizeEffectiveContext(effective) {
    if (!effective) return void 0;
    const { apiKey: _apiKey, ...safeEffective } = effective;
    return {
      ...safeEffective,
      apiKey: void 0,
      apiKeyAvailable: Boolean(effective.apiKey)
    };
  }
  rebuildWatchers() {
    this.disposeWatchers();
    this.watchManagerConfigFiles();
    this.watchWorkspaceConfigFile();
  }
  watchManagerConfigFiles() {
    const paths = resolveN8nManagerConfigurationPaths();
    if (!fs7.existsSync(paths.homeDir)) {
      return;
    }
    this.watchFile(paths.homeDir, "instances.json", "global-instances-changed");
    this.watchFile(paths.homeDir, "secrets.json", "global-secrets-changed");
  }
  watchWorkspaceConfigFile() {
    const workspaceRoot = getWorkspaceRoot2();
    if (!workspaceRoot) {
      return;
    }
    this.watchFile(workspaceRoot, "n8nac-config.json", "workspace-overrides-changed");
  }
  watchFile(directory, fileName, reason) {
    const watcher = vscode17.workspace.createFileSystemWatcher(
      new vscode17.RelativePattern(vscode17.Uri.file(directory), fileName),
      false,
      false,
      false
    );
    const refresh = () => this.scheduleRefresh(reason);
    watcher.onDidCreate(refresh, void 0, this.watcherDisposables);
    watcher.onDidChange(refresh, void 0, this.watcherDisposables);
    watcher.onDidDelete(refresh, void 0, this.watcherDisposables);
    this.watcherDisposables.push(watcher);
  }
  disposeWatchers() {
    for (const disposable of this.watcherDisposables) {
      disposable.dispose();
    }
    this.watcherDisposables.length = 0;
  }
};
function getWorkspaceRoot2() {
  return vscode17.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

// src/extension.ts
import { createN8nManagerFacade as createN8nManagerFacade3 } from "@n8n-as-code/manager-adapter";
import { createTelemetryClient } from "@n8n-as-code/telemetry";

// src/constants/workspace.ts
var NO_WORKSPACE_ERROR_MESSAGE = "No workspace folder found. Please open a folder or a workspace to initialize the extension.";
var OPEN_FOLDER_ACTION = "Open Folder";

// src/utils/workflow-finder.ts
import { WorkflowSyncStatus as WorkflowSyncStatus4 } from "n8nac";
function buildWorkflowQuickPickItems(workflows) {
  return [...workflows].sort((a, b) => a.name.localeCompare(b.name, void 0, { sensitivity: "base" })).map((workflow) => {
    const archivedIcon = workflow.isArchived ? "$(archive) " : "";
    const archivedSuffix = workflow.isArchived ? " [archived]" : "";
    return {
      label: `${archivedIcon}${workflow.name}${archivedSuffix}`,
      description: workflow.id ? `ID: ${workflow.id}` : "Local only",
      detail: workflow.filename ? `${workflow.filename} \u2022 ${workflow.status}` : `Remote only \u2022 ${workflow.status}`,
      workflow
    };
  });
}

// src/utils/clipboard-utils.ts
function isClipboardBridgeRequired() {
  return process.platform === "darwin";
}

// src/utils/ai-context-policy.ts
import * as fs8 from "fs";
import * as path7 from "path";
function hasExplicitWorkspaceConfig(workspaceRoot, existsSync6 = fs8.existsSync) {
  return Boolean(workspaceRoot && existsSync6(path7.join(workspaceRoot, "n8nac-config.json")));
}
function shouldAutoEnsureAiContext(input) {
  const { workspaceRoot, snapshot, existsSync: existsSync6 = fs8.existsSync } = input;
  if (!workspaceRoot) return false;
  if (snapshot?.workspaceRoot === workspaceRoot) {
    return Boolean(snapshot.hasWorkspaceConfig);
  }
  return hasExplicitWorkspaceConfig(workspaceRoot, existsSync6);
}

// src/extension.ts
function registerClipboardHandler() {
  if (!isClipboardBridgeRequired()) return;
  WorkflowWebview.onClipboardPasteRequest(async (panel, grantToken) => {
    try {
      const text = await vscode18.env.clipboard.readText();
      panel.webview.postMessage({ type: "clipboard-paste", text, grantToken });
    } catch (error) {
      console.error("[Clipboard] Failed to read clipboard for paste request", error);
      panel.webview.postMessage({ type: "clipboard-error", grantToken });
    }
  });
  AgentWorkbenchWebview.onClipboardPasteRequest(async (panel, grantToken) => {
    try {
      const text = await vscode18.env.clipboard.readText();
      panel.webview.postMessage({ type: "clipboard-paste", text, grantToken });
    } catch (error) {
      console.error("[Clipboard] Failed to read clipboard for paste request", error);
      panel.webview.postMessage({ type: "clipboard-error", grantToken });
    }
  });
}
var syncManager;
var cli;
var initializingPromise;
var runtimeDisposables = [];
var configurationController;
var agentRuntimeController;
var agentProviderService;
var worktreeService;
var suppressNextConfigurationReaction = false;
var failedAutoInitRuntimeSignature;
var failedAutoInitConnectionKey;
var aiContextFreshnessTimer;
var aiContextFreshnessInFlight;
var extensionContextForAgentSettings;
var statusBar = new StatusBar();
var proxyService = new ProxyService();
var enhancedTreeProvider = new EnhancedWorkflowTreeProvider();
var decorationProvider = new WorkflowDecorationProvider();
var outputChannel = vscode18.window.createOutputChannel("n8n-as-code");
var workflowsTreeView;
var telemetryClient;
var conflictStore = /* @__PURE__ */ new Map();
var processedSyncEventIds = /* @__PURE__ */ new Set();
var AI_CONTEXT_METADATA_RELATIVE_PATH = path8.join(".n8nac", "ai-context.json");
var AI_CONTEXT_SIGNATURE_SCHEMA_VERSION = 1;
async function processSyncEventJournal(journalUri, source, markOnly = false) {
  if (!fs9.existsSync(journalUri.fsPath)) return;
  let raw;
  try {
    raw = await vscode18.workspace.fs.readFile(journalUri);
  } catch (err) {
    console.error("[n8n] Failed to read sync event journal", err);
    return;
  }
  const lines = Buffer.from(raw).toString("utf8").split("\n").filter(Boolean);
  for (const line of lines) {
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }
    if (!event.id) continue;
    if (markOnly) {
      processedSyncEventIds.add(event.id);
      continue;
    }
    if (processedSyncEventIds.has(event.id)) continue;
    processedSyncEventIds.add(event.id);
    trimProcessedSyncEvents();
    if (event.op !== "workflow.push") continue;
    if (event.status !== "success" || !event.remoteChanged || !event.workflowId) {
      outputChannel.appendLine(`[n8n-agent-debug] ${source} push event status=${event.status} workflowId=${event.workflowId || "none"} reload=false reason=${event.reason || ""}`);
      continue;
    }
    const reloaded = workflowWebviewRegistry.reloadIfMatching(event.workflowId);
    outputChannel.appendLine(`[n8n-agent-debug] ${source} push success workflowId=${event.workflowId} filename=${event.filename || "none"} reloaded=${reloaded}`);
  }
}
function trimProcessedSyncEvents() {
  while (processedSyncEventIds.size > 1e3) {
    const first = processedSyncEventIds.values().next().value;
    if (!first) return;
    processedSyncEventIds.delete(first);
  }
}
function findWorkflowByCommandArg(arg) {
  const candidate = arg?.workflow ? arg.workflow : arg;
  if (!candidate) return void 0;
  if (typeof candidate === "string") {
    return selectAllWorkflows(store.getState()).find((workflow) => workflow.id === candidate || workflow.filename === candidate);
  }
  return candidate;
}
async function refreshWorkflowList() {
  if (!cli) return [];
  const workflows = await cli.list();
  store.dispatch(setWorkflows(workflows));
  enhancedTreeProvider.refresh();
  return workflows;
}
async function activate(context) {
  extensionContextForAgentSettings = context;
  try {
    outputChannel.show(true);
    outputChannel.appendLine('\u{1F50C} Activation of "n8n-as-code"...');
  } catch {
  }
  const registerTelemetryCommand = (command, callback) => vscode18.commands.registerCommand(command, async (...args) => {
    const telemetry = telemetryClient;
    if (!telemetry) {
      return callback(...args);
    }
    const result = await telemetry.withTelemetry("vscode_command_completed", {
      command,
      has_workspace: Boolean(vscode18.workspace.workspaceFolders?.length),
      extension_state: String(enhancedTreeProvider.getExtensionState?.() ?? "unknown")
    }, async () => callback(...args));
    telemetry.trackActive({ activation_source_event: "vscode_command_completed" });
    return result;
  });
  context.subscriptions.push(
    registerTelemetryCommand("n8n.configure", async (initialTab) => {
      ConfigurationWebview.createOrShow(
        context,
        getOrCreateConfigurationController(),
        typeof initialTab === "string" ? initialTab : void 0
      );
    })
  );
  try {
    const controller = getOrCreateConfigurationController();
    context.subscriptions.push(
      controller,
      controller.onDidChangeSnapshot((event) => {
        const workspaceRoot = getWorkspaceRoot();
        if (shouldAutoEnsureAiContext({ workspaceRoot, snapshot: event.snapshot })) {
          scheduleEnsureAiContextFresh(context, `snapshot:${event.reason}`, event.snapshot);
        }
        void handleConfigurationSnapshotChanged(context, event);
      })
    );
  } catch (error) {
    outputChannel.appendLine(`[n8n] Configuration controller initialization failed: ${error?.message || error}`);
  }
  try {
    telemetryClient = createTelemetryClient({
      facade: "vscode",
      version: String(context.extension.packageJSON?.version ?? "2.3.3" ?? ""),
      forceDisabled: !vscode18.env.isTelemetryEnabled
    });
    telemetryClient.track("vscode_extension_activated", {
      vscode_version: vscode18.version,
      extension_version: String(context.extension.packageJSON?.version ?? ""),
      has_workspace: Boolean(vscode18.workspace.workspaceFolders?.length)
    });
    context.subscriptions.push(vscode18.env.onDidChangeTelemetryEnabled((enabled) => {
      telemetryClient = createTelemetryClient({
        facade: "vscode",
        version: String(context.extension.packageJSON?.version ?? "2.3.3" ?? ""),
        forceDisabled: !enabled
      });
    }));
  } catch (error) {
    outputChannel.appendLine(`[n8n] Telemetry initialization skipped: ${error?.message || error}`);
  }
  try {
    context.subscriptions.push(
      vscode18.workspace.registerTextDocumentContentProvider("n8n-remote", {
        provideTextDocumentContent(uri) {
          return conflictStore.get(uri.toString()) || "";
        }
      })
    );
    workflowsTreeView = vscode18.window.createTreeView("n8n-explorer.workflows", {
      treeDataProvider: enhancedTreeProvider,
      showCollapseAll: false
    });
    context.subscriptions.push(workflowsTreeView);
    context.subscriptions.push(
      vscode18.window.registerFileDecorationProvider(decorationProvider)
    );
    proxyService.setOutputChannel(outputChannel);
    proxyService.setSecrets(context.secrets);
    agentRuntimeController = new AgentRuntimeController(context, outputChannel);
    agentProviderService = new AgentProviderService(context);
    context.subscriptions.push(agentRuntimeController);
    context.subscriptions.push(
      registerTelemetryCommand("n8n.init", async () => {
        await handleInitializeCommand(context);
      }),
      registerTelemetryCommand("n8n.migrateWorkspaceConfiguration", async () => {
        await migrateWorkspaceConfiguration(context);
      }),
      registerTelemetryCommand("n8n.migrateLegacyWorkspace", async () => {
        await migrateWorkspaceConfiguration(context);
      }),
      registerTelemetryCommand("n8n.migrateGlobalInstancesToEnvironments", async () => {
        await migrateWorkspaceConfiguration(context);
      }),
      registerTelemetryCommand("n8n.switchInstance", async (args) => {
        await switchWorkspaceInstance(context, args);
      }),
      registerTelemetryCommand("n8n.pinWorkspaceInstance", async (args) => {
        await pinWorkspaceInstance(context, args);
      }),
      registerTelemetryCommand("n8n.clearWorkspaceInstance", async () => {
        await clearWorkspaceInstancePin(context);
      }),
      registerTelemetryCommand("n8n.deleteInstance", async (args) => {
        await deleteWorkspaceInstance(context, args);
      }),
      registerTelemetryCommand("n8n.applySettings", async () => {
        outputChannel.appendLine("[n8n] Applying new settings...");
        await reinitializeSyncManager(context);
        updateContextKeys();
      }),
      registerTelemetryCommand("n8n.showActive", async () => {
        store.dispatch(setArchiveFilter("workflows"));
        if (workflowsTreeView) workflowsTreeView.title = "Workflows";
        await store.dispatch(loadWorkflows());
      }),
      registerTelemetryCommand("n8n.showArchived", async () => {
        store.dispatch(setArchiveFilter("archived"));
        if (workflowsTreeView) workflowsTreeView.title = "Archived Workflows";
        await store.dispatch(loadWorkflows());
      }),
      registerTelemetryCommand("n8n.showAll", async () => {
        store.dispatch(setArchiveFilter("all"));
        if (workflowsTreeView) workflowsTreeView.title = "All Workflows";
        await store.dispatch(loadWorkflows());
      }),
      registerTelemetryCommand("n8n.openBoard", async (arg) => {
        const wf = arg?.workflow ? arg.workflow : arg;
        if (!wf) return;
        telemetryClient?.track("vscode_workflow_view_opened", { mode: "board", workflow_state: "unknown" });
        await openWorkflowBoard(wf);
      }),
      registerTelemetryCommand("n8n.openJson", async (arg) => {
        const wf = arg?.workflow ? arg.workflow : arg;
        if (!wf || !syncManager) return;
        telemetryClient?.track("vscode_workflow_view_opened", { mode: "json", workflow_state: "unknown" });
        const uri = getExistingWorkflowFileUri(wf);
        if (uri) {
          try {
            const doc = await vscode18.workspace.openTextDocument(uri);
            await vscode18.window.showTextDocument(doc);
          } catch (e) {
            vscode18.window.showErrorMessage(`Could not open file: ${e.message}`);
          }
        } else if (wf.id) {
          vscode18.window.showInformationMessage(`No local file found for "${wf.name}".`);
        }
      }),
      registerTelemetryCommand("n8n.openSplit", async (arg) => {
        const wf = await resolveWorkflowForSplitView(arg);
        if (!wf || !syncManager) return;
        telemetryClient?.track("vscode_workflow_view_opened", { mode: "split", workflow_state: "unknown" });
        const uri = getExistingWorkflowFileUri(wf);
        if (uri) {
          try {
            const doc = await vscode18.workspace.openTextDocument(uri);
            await vscode18.window.showTextDocument(doc, { viewColumn: vscode18.ViewColumn.One });
          } catch (e) {
            vscode18.window.showErrorMessage(`Could not open file: ${e.message}`);
          }
        }
        await openWorkflowBoard(wf, vscode18.ViewColumn.Two);
      }),
      registerTelemetryCommand("n8n.openAgentWorkbench", async (arg) => {
        const runtime = requireAgentRuntimeController();
        if (arg && typeof arg === "object" && typeof arg.sessionId === "string") {
          telemetryClient?.track("vscode_workflow_view_opened", { mode: "agent-workbench", workflow_state: arg.workflow ? "workflow-context" : "existing-session" });
          await openAgentWorkbench(context, arg.workflow, arg.sessionId);
          return;
        }
        const wf = findWorkflowByCommandArg(arg);
        if (wf) {
          const sessionId = await getOrCreateAgentSessionForWorkflow(wf);
          telemetryClient?.track("vscode_workflow_view_opened", { mode: "agent-workbench", workflow_state: "workflow-context" });
          await openAgentWorkbench(context, wf, sessionId);
          return;
        }
        if (arg === "new") {
          const state = await runtime.createSession({ workspaceRoot: vscode18.workspace.workspaceFolders?.[0]?.uri.fsPath });
          telemetryClient?.track("vscode_workflow_view_opened", { mode: "agent-workbench", workflow_state: "new" });
          await openAgentWorkbench(context, void 0, state.activeSessionId);
          return;
        }
        telemetryClient?.track("vscode_workflow_view_opened", { mode: "agent-workbench", workflow_state: "latest" });
        await openAgentWorkbench(context, void 0, await runtime.getLatestSessionId());
      }),
      registerTelemetryCommand("n8n.openAgentManager", async () => {
        ConfigurationWebview.createOrShow(context, requireConfigurationController(), "agent-providers");
      }),
      registerTelemetryCommand("n8n.agent.setupProvider", async () => {
        await setupAgentProvider(context);
      }),
      registerTelemetryCommand("n8n.agent.selectModel", async () => {
        await selectAgentModel();
      }),
      registerTelemetryCommand("n8n.agent.selectReasoningEffort", async () => {
        await selectAgentReasoningEffort();
      }),
      // n8nac push <path>
      registerTelemetryCommand("n8n.pushWorkflow", async (arg) => {
        if (enhancedTreeProvider.getExtensionState() === "settings-changed" /* SETTINGS_CHANGED */) {
          vscode18.window.showWarningMessage('n8n: Settings changed. Click "Apply Changes" to resume syncing.');
          return;
        }
        const wf = findWorkflowByCommandArg(arg);
        if (!cli || !syncManager) {
          vscode18.window.showWarningMessage("n8n is not initialized yet.");
          outputChannel.appendLine("[n8n] Push skipped: CLI or sync manager is not initialized.");
          return;
        }
        if (!wf?.filename) {
          vscode18.window.showWarningMessage("Cannot push: no local workflow file is available.");
          outputChannel.appendLine(`[n8n] Push skipped: invalid workflow argument ${JSON.stringify(arg)}`);
          return;
        }
        const workflowPath = path8.join(syncManager.getInstanceDirectory(), wf.filename);
        statusBar.showSyncing();
        try {
          const pushedId = await cli.push(workflowPath);
          const workflows = await refreshWorkflowList();
          const updatedWorkflow = workflows.find((candidate) => candidate.filename === wf.filename);
          const workflowId = updatedWorkflow?.id ?? pushedId ?? wf.id;
          await processSyncEventJournal(vscode18.Uri.file(await syncManager.getSyncEventJournalPath()), "command push journal");
          outputChannel.appendLine(`[n8n] Push successful: ${wf.name} (${workflowId ?? "unknown id"})`);
          statusBar.showSynced();
          vscode18.window.showInformationMessage(`\u2705 Pushed "${wf.name}"`);
        } catch (e) {
          const isOcc = e.message?.includes("Push rejected") || e.message?.includes("modified in the n8n UI");
          if (isOcc) {
            statusBar.showError("Conflict");
            await vscode18.commands.executeCommand("n8n.resolveConflict", { workflow: wf, choice: void 0 });
            await refreshWorkflowList();
            statusBar.showSynced();
          } else {
            statusBar.showError(e.message);
            vscode18.window.showErrorMessage(`Push Error: ${e.message}`);
          }
        }
      }),
      // n8nac pull <id>
      registerTelemetryCommand("n8n.pullWorkflow", async (arg) => {
        if (enhancedTreeProvider.getExtensionState() === "settings-changed" /* SETTINGS_CHANGED */) {
          vscode18.window.showWarningMessage('n8n: Settings changed. Click "Apply Changes" to resume syncing.');
          return;
        }
        const wf = findWorkflowByCommandArg(arg);
        if (!cli || !syncManager) {
          vscode18.window.showWarningMessage("n8n is not initialized yet.");
          outputChannel.appendLine("[n8n] Pull skipped: CLI or sync manager is not initialized.");
          return;
        }
        if (!wf?.id) {
          vscode18.window.showWarningMessage("Cannot pull: no remote workflow ID is available.");
          outputChannel.appendLine(`[n8n] Pull skipped: invalid workflow argument ${JSON.stringify(arg)}`);
          return;
        }
        if (wf.filename) {
          const workflowStatus = await cli.getSingleWorkflowDetailedStatus(wf.id, wf.filename);
          const hasConflict = workflowStatus.status === WorkflowSyncStatus5.CONFLICT;
          const hasLocalChanges = !!(workflowStatus.localHash && workflowStatus.lastSyncedHash && workflowStatus.localHash !== workflowStatus.lastSyncedHash);
          if (hasConflict || hasLocalChanges) {
            statusBar.showError("Conflict");
            await vscode18.commands.executeCommand("n8n.resolveConflict", { workflow: wf, choice: void 0 });
            await refreshWorkflowList();
            statusBar.showSynced();
            return;
          }
        }
        statusBar.showSyncing();
        try {
          outputChannel.appendLine(`[n8n] Pulling workflow: ${wf.name} (${wf.id})`);
          await cli.pull(wf.id);
          await refreshWorkflowList();
          statusBar.showSynced();
          outputChannel.appendLine(`[n8n] Pull successful: ${wf.name} (${wf.id})`);
          vscode18.window.showInformationMessage(`\u2705 Pulled "${wf.name}"`);
        } catch (e) {
          statusBar.showError(e.message);
          vscode18.window.showErrorMessage(`Pull Error: ${e.message}`);
        }
      }),
      // n8nac fetch <id>
      registerTelemetryCommand("n8n.fetchWorkflow", async (arg) => {
        if (enhancedTreeProvider.getExtensionState() === "settings-changed" /* SETTINGS_CHANGED */) {
          vscode18.window.showWarningMessage('n8n: Settings changed. Click "Apply Changes" to resume syncing.');
          return;
        }
        const wf = arg?.workflow ? arg.workflow : arg;
        if (!wf || !cli || !wf.id) return;
        statusBar.showSyncing();
        try {
          const found = await cli.fetch(wf.id);
          if (found) {
            outputChannel.appendLine(`[n8n] Fetched remote state for: ${wf.name} (${wf.id})`);
            const workflows = await cli.list();
            store.dispatch(setWorkflows(workflows));
            enhancedTreeProvider.refresh();
            statusBar.showSynced();
            vscode18.window.showInformationMessage(`\u2705 Fetched "${wf.name}"`);
          } else {
            statusBar.showSynced();
            vscode18.window.showWarningMessage(`\u26A0\uFE0F "${wf.name}" not found on remote \u2014 may have been deleted`);
          }
        } catch (e) {
          statusBar.showError(e.message);
          vscode18.window.showErrorMessage(`Fetch Error: ${e.message}`);
        }
      }),
      // n8nac list (global refresh — calls list with fresh remote fetch)
      registerTelemetryCommand("n8n.refresh", async () => {
        outputChannel.appendLine("[n8n] Manual refresh \u2014 running list...");
        if (!cli) {
          vscode18.window.showErrorMessage("n8n as code is not initialized. Please configure and initialize first.");
          enhancedTreeProvider.refresh();
          return;
        }
        statusBar.showSyncing();
        try {
          const workflows = await cli.list({ fetchRemote: true });
          store.dispatch(setWorkflows(workflows));
          outputChannel.appendLine(`[n8n] List refreshed. ${workflows.length} workflows.`);
          vscode18.window.showInformationMessage(`Refreshed workflow list (${workflows.length} workflows)`);
          statusBar.showSynced();
        } catch (error) {
          statusBar.showError(error.message);
          vscode18.window.showErrorMessage(`Refresh failed: ${error.message}`);
        }
        enhancedTreeProvider.refresh();
      }),
      registerTelemetryCommand("n8n.findWorkflow", async () => {
        if (enhancedTreeProvider.getExtensionState() === "settings-changed" /* SETTINGS_CHANGED */) {
          vscode18.window.showWarningMessage('n8n: Settings changed. Click "Apply Changes" to resume syncing.');
          return;
        }
        let workflows = cli ? await cli.list({ fetchRemote: true, includeArchived: true }) : [];
        if (workflows.length) {
          store.dispatch(setWorkflows(workflows));
          enhancedTreeProvider.refresh();
        }
        if (!workflows.length) {
          const message = cli ? "No workflows available to search." : 'n8n as code is not initialized. Run "Initialize n8n as code" or configure your settings first.';
          vscode18.window.showInformationMessage(message);
          return;
        }
        const picked = await vscode18.window.showQuickPick(
          buildWorkflowQuickPickItems(workflows),
          {
            title: `Find Workflow (${workflows.length})`,
            placeHolder: "Search by workflow name, ID, or local filename",
            ignoreFocusOut: true,
            matchOnDescription: true,
            matchOnDetail: true
          }
        );
        if (!picked) {
          return;
        }
        await revealWorkflowInTree(picked.workflow);
        await openWorkflowFromFinder(picked.workflow);
      }),
      registerTelemetryCommand("n8n.initializeAI", async (options) => {
        if (!vscode18.workspace.workspaceFolders?.length) {
          if (!options?.silent) await showNoWorkspaceError();
          return;
        }
        const rootPath = vscode18.workspace.workspaceFolders[0].uri.fsPath;
        try {
          if (options?.silent) {
            await ensureAiContextFresh(context, "manual-silent", { force: true });
          } else {
            await vscode18.window.withProgress({
              location: vscode18.ProgressLocation.Notification,
              title: "n8n: Initializing AI Context...",
              cancellable: false
            }, (progress) => ensureAiContextFresh(context, "manual", { force: true, progress }));
            vscode18.window.showInformationMessage("\u2728 n8n AI Context Updated!");
          }
        } catch (error) {
          if (options?.silent) {
            outputChannel.appendLine(`[n8n] Silent AI Init failed: ${error.message}`);
          } else {
            vscode18.window.showErrorMessage(`AI Init Failed: ${error.message}`);
          }
        }
      }),
      registerTelemetryCommand("n8n.agent.setApiKey", async () => {
        await setAgentProviderApiKey(context);
      }),
      registerTelemetryCommand("n8n.openSettings", async () => {
        await vscode18.commands.executeCommand("n8n.configure");
      }),
      registerTelemetryCommand("n8n.resolveConflict", async (arg) => {
        const wf = arg?.workflow ? arg.workflow : arg;
        if (!wf || !cli || !syncManager) return;
        let conflict = enhancedTreeProvider.getConflict(wf.id);
        if (!conflict && wf.filename) {
          try {
            const client = new N8nApiClient2(getN8nConfig());
            const remoteWorkflow = await client.getWorkflow(wf.id);
            conflict = { id: wf.id, filename: wf.filename, remoteContent: remoteWorkflow };
            store.dispatch(addConflict(conflict));
          } catch (e) {
            vscode18.window.showErrorMessage(`Failed to fetch remote workflow: ${e.message}`);
            return;
          }
        }
        if (!conflict) {
          vscode18.window.showInformationMessage("No conflict data found for this workflow.");
          return;
        }
        const { id, filename, remoteContent } = conflict;
        let choice = arg?.choice;
        if (!choice) {
          choice = await vscode18.window.showWarningMessage(
            `\u26A0\uFE0F Conflict on "${filename}": local and remote versions differ.`,
            "Show Diff",
            "Keep Current (local)",
            "Keep Incoming (remote)"
          );
        }
        if (choice === "Show Diff") {
          const remoteUri = vscode18.Uri.parse(`n8n-remote:${filename}?id=${id}`);
          const localUri = vscode18.Uri.file(path8.join(syncManager.getInstanceDirectory(), filename));
          conflictStore.set(remoteUri.toString(), JSON.stringify(remoteContent, null, 2));
          await vscode18.commands.executeCommand("vscode.diff", localUri, remoteUri, `${filename} \u2190 n8n Remote (read-only)`);
        } else if (choice === "Keep Current (local)") {
          await cli.resolveConflict(id, filename, "keep-current");
          await new Promise((r) => setTimeout(r, 500));
          store.dispatch(setWorkflows(await cli.list()));
          store.dispatch(removeConflict(id));
          await processSyncEventJournal(vscode18.Uri.file(await syncManager.getSyncEventJournalPath()), "conflict resolution journal");
          vscode18.window.showInformationMessage("\u2705 Pushed \u2014 remote overwritten with your local version.");
          enhancedTreeProvider.refresh();
        } else if (choice === "Keep Incoming (remote)") {
          await cli.resolveConflict(id, filename, "keep-incoming");
          await new Promise((r) => setTimeout(r, 500));
          store.dispatch(setWorkflows(await cli.list()));
          store.dispatch(removeConflict(id));
          vscode18.window.showInformationMessage("\u2705 Pulled \u2014 local file updated from n8n.");
          enhancedTreeProvider.refresh();
        }
      })
    );
    getOrCreateConfigurationController().start();
    context.subscriptions.push(
      vscode18.workspace.onDidChangeConfiguration(async (e) => {
        const suppressOnce = context.workspaceState.get("n8n.suppressSettingsChangedOnce");
        if (suppressOnce) {
          await context.workspaceState.update("n8n.suppressSettingsChangedOnce", false);
          return;
        }
        if (e.affectsConfiguration("n8n.host") || e.affectsConfiguration("n8n.apiKey") || e.affectsConfiguration("n8n.syncFolder") || e.affectsConfiguration("n8n.projectId") || e.affectsConfiguration("n8n.projectName")) {
          outputChannel.appendLine("[n8n] Critical settings changed. Pausing until applied.");
          if (syncManager) {
            enhancedTreeProvider.setExtensionState("settings-changed" /* SETTINGS_CHANGED */);
            statusBar.showSettingsChanged();
          } else {
            const root = getWorkspaceRoot();
            const hasUnifiedConfig = root ? fs9.existsSync(path8.join(root, "n8nac-config.json")) : false;
            const valid = validateN8nConfig().isValid;
            if (!hasUnifiedConfig || !valid) {
              resetExtensionRuntimeState();
              enhancedTreeProvider.setExtensionState("configuring" /* CONFIGURING */);
              statusBar.showConfiguring();
            } else {
              enhancedTreeProvider.setExtensionState("uninitialized" /* UNINITIALIZED */);
              statusBar.showNotInitialized();
            }
          }
          updateContextKeys();
        }
      })
    );
  } catch (error) {
    outputChannel.appendLine(`[n8n] Activation completed with degraded functionality: ${error?.stack || error?.message || error}`);
    vscode18.window.showErrorMessage(`n8n as code activation issue: ${error?.message || error}`);
  }
}
function getExistingWorkflowFileUri(workflow) {
  if (!syncManager || !workflow.filename) {
    return void 0;
  }
  const filePath = path8.join(syncManager.getInstanceDirectory(), workflow.filename);
  return fs9.existsSync(filePath) ? vscode18.Uri.file(filePath) : void 0;
}
async function revealWorkflowInTree(workflow) {
  if (!workflowsTreeView) {
    return;
  }
  const currentFilter = selectArchiveFilter(store.getState());
  if (workflow.isArchived && currentFilter === "workflows") {
    store.dispatch(setArchiveFilter("all"));
    if (workflowsTreeView) workflowsTreeView.title = "All Workflows";
  }
  const item = await enhancedTreeProvider.getWorkflowItem(workflow);
  if (!item) {
    return;
  }
  try {
    await workflowsTreeView.reveal(item, {
      select: true,
      focus: true,
      expand: true
    });
  } catch (error) {
    outputChannel.appendLine(`[n8n] Unable to reveal workflow ${workflow.name}: ${error.message}`);
  }
}
async function openWorkflowFromFinder(workflow) {
  const localUri = getExistingWorkflowFileUri(workflow);
  if (localUri) {
    await vscode18.commands.executeCommand("n8n.openJson", workflow);
    return;
  }
  if (workflow.id) {
    await vscode18.commands.executeCommand("n8n.openBoard", workflow);
    return;
  }
  vscode18.window.showWarningMessage(`Cannot open workflow "${workflow.name}": no local file or remote ID is available.`);
}
async function openWorkflowBoard(workflow, viewColumn) {
  if (!workflow.id) {
    vscode18.window.showWarningMessage(`Cannot open workflow "${workflow.name}": no remote ID is available.`);
    return;
  }
  try {
    const openTarget = await resolveWorkflowWebviewTarget(workflow);
    WorkflowWebview.createOrShow(workflow, openTarget.url, viewColumn);
    registerClipboardHandler();
  } catch (e) {
    vscode18.window.showErrorMessage(`Failed to open n8n workflow: ${e.message}`);
  }
}
async function resolveWorkflowForSplitView(arg) {
  const workflow = findWorkflowByCommandArg(arg);
  if (workflow) {
    return workflow;
  }
  if (!cli) {
    vscode18.window.showWarningMessage("n8n as code is not initialized. Configure and initialize n8n before opening Split View.");
    return void 0;
  }
  const workflows = await cli.list({ fetchRemote: true, includeArchived: true });
  if (!workflows.length) {
    vscode18.window.showInformationMessage("No workflows available for Split View.");
    return void 0;
  }
  store.dispatch(setWorkflows(workflows));
  enhancedTreeProvider.refresh();
  const picked = await vscode18.window.showQuickPick(
    buildWorkflowQuickPickItems(workflows),
    {
      title: `Open Split View (${workflows.length})`,
      placeHolder: "Select the workflow to open as JSON plus n8n board",
      ignoreFocusOut: true,
      matchOnDescription: true,
      matchOnDetail: true
    }
  );
  return picked?.workflow;
}
async function openAgentWorkbench(context, workflow, initialSessionId) {
  try {
    const openTarget = workflow?.id ? await resolveWorkflowWebviewTarget(workflow) : void 0;
    const workflowFilePath = workflow ? getExistingWorkflowFileUri(workflow)?.fsPath : void 0;
    const providerModelLabel = getSelectedAgentProviderModelLabel();
    AgentWorkbenchWebview.createOrShow(
      context,
      workflow,
      workflowFilePath,
      openTarget?.url,
      openTarget?.targetUrl,
      providerModelLabel,
      requireAgentRuntimeController(),
      outputChannel,
      {
        listWorkflows: listAgentWorkflowOptions,
        resolveWorkflow: resolveAgentWorkflowTarget,
        listWorkflowNodes: listAgentWorkflowNodes,
        listProviderOptions: listAgentProviderOptions,
        listModelOptions: listAgentModelOptions,
        selectProviderModel: selectAgentProviderModel,
        selectReasoningEffort: selectInlineAgentReasoningEffort,
        listWorktrees: listWorktreeOptions,
        createWorktree: createAgentWorktree,
        removeWorktree: removeAgentWorktree
      },
      initialSessionId,
      vscode18.ViewColumn.One
    );
    if (openTarget?.url) {
      registerClipboardHandler();
    }
  } catch (e) {
    vscode18.window.showErrorMessage(`Failed to open n8n Agent Workbench: ${e.message}`);
  }
}
async function getOrCreateAgentSessionForWorkflow(workflow) {
  const workflowFilePath = getExistingWorkflowFileUri(workflow)?.fsPath;
  const workflowContext = {
    id: workflow.id || void 0,
    name: workflow.name || workflow.id || workflow.filename || "Workflow",
    filename: workflow.filename || void 0,
    filePath: workflowFilePath
  };
  const runtime = requireAgentRuntimeController();
  const existingSessionId = await runtime.getLatestSessionIdForWorkflow(workflowContext);
  if (existingSessionId) return existingSessionId;
  const currentSessionId = await runtime.attachSessionToWorkflowIfUnattached(AgentWorkbenchWebview.getCurrentActiveSessionId(), workflowContext, {
    workflowId: workflow.id || void 0,
    workflowName: workflow.name,
    workflowFilename: workflow.filename,
    workflowFilePath,
    workspaceRoot: vscode18.workspace.workspaceFolders?.[0]?.uri.fsPath
  });
  if (currentSessionId) return currentSessionId;
  return runtime.createSessionForWorkflow(workflowContext, {
    workflowId: workflow.id || void 0,
    workflowName: workflow.name,
    workflowFilename: workflow.filename,
    workflowFilePath,
    workspaceRoot: vscode18.workspace.workspaceFolders?.[0]?.uri.fsPath
  });
}
async function listAgentWorkflowOptions() {
  if (cli) {
    const workflows = await cli.list({ fetchRemote: true, includeArchived: true });
    store.dispatch(setWorkflows(workflows));
    enhancedTreeProvider.refresh();
    return workflows;
  }
  return selectAllWorkflows(store.getState());
}
async function resolveAgentWorkflowTarget(workflowContext) {
  const workflows = await listAgentWorkflowOptions();
  const workflow = workflows.find((candidate) => Boolean(workflowContext.id && candidate.id === workflowContext.id) || Boolean(workflowContext.filename && candidate.filename === workflowContext.filename) || candidate.name === workflowContext.name);
  const effectiveWorkflow = workflow || {
    id: workflowContext.id || "",
    name: workflowContext.name,
    filename: workflowContext.filename || ""
  };
  const workflowFilePath = getExistingWorkflowFileUri(effectiveWorkflow)?.fsPath || workflowContext.filePath;
  if (!effectiveWorkflow.id) {
    return { workflow: effectiveWorkflow, workflowFilePath };
  }
  try {
    const openTarget = await resolveWorkflowWebviewTarget(effectiveWorkflow);
    return {
      workflow: effectiveWorkflow,
      workflowFilePath,
      workflowUrl: openTarget.url,
      workflowReloadUrl: openTarget.targetUrl
    };
  } catch {
    return { workflow: effectiveWorkflow, workflowFilePath };
  }
}
async function listAgentWorkflowNodes(workflowContext) {
  if (!workflowContext.id) return [];
  const config = getN8nConfig();
  if (!config.host || !config.apiKey) return [];
  const client = new N8nApiClient2(config);
  const workflow = await client.getWorkflow(workflowContext.id);
  const nodes = Array.isArray(workflow?.nodes) ? workflow.nodes : [];
  const result = [];
  for (const node of nodes) {
    const name = typeof node?.name === "string" ? node.name.trim() : "";
    if (!name) continue;
    const type = typeof node.type === "string" ? node.type.trim() : "";
    const id = typeof node.id === "string" ? node.id.trim() : "";
    result.push({ name, type: type || void 0, id: id || void 0 });
  }
  return result;
}
async function listAgentProviderOptions() {
  const states = await requireAgentProviderService().listProviderConnectionStates();
  return states.filter((state) => state.connected || state.selected).map((state) => ({
    id: state.id,
    label: state.label,
    description: state.description,
    connected: state.connected,
    selected: state.selected,
    model: state.model,
    defaultModel: state.defaultModel,
    supportsReasoningEffort: state.supportsReasoningEffort
  }));
}
async function listAgentModelOptions(providerId) {
  const provider = normalizeAgentProviderId3(providerId) || "openai";
  const definition = AGENT_PROVIDER_DEFINITIONS[provider];
  const settings = readAgentProviderSettings(contextGlobalState());
  const selectedProvider = settings.provider;
  const selectedModel = settings.model || "";
  const currentModel = provider === selectedProvider ? selectedModel || definition.defaultModel : definition.defaultModel;
  const liveModels = await requireAgentProviderService().fetchAvailableModels(provider).catch(() => []);
  return [...new Set([...liveModels.length ? liveModels : [], definition.defaultModel, currentModel].filter(Boolean))].map((model) => ({
    id: model,
    label: model,
    provider,
    providerLabel: definition.label,
    selected: provider === selectedProvider && model === currentModel,
    fallback: !liveModels.length
  }));
}
async function selectAgentProviderModel(providerId, model) {
  const provider = normalizeAgentProviderId3(providerId) || "openai";
  const trimmedModel = model.trim() || AGENT_PROVIDER_DEFINITIONS[provider].defaultModel;
  await updateAgentProviderSettings(contextGlobalState(), { provider, model: trimmedModel });
  await requireAgentProviderService().syncReasoningEffortConfiguration(provider, trimmedModel);
}
async function selectInlineAgentReasoningEffort(effort) {
  const normalized = AGENT_REASONING_EFFORTS.includes(effort) ? effort : void 0;
  if (!normalized) return;
  const settings = readAgentProviderSettings(contextGlobalState());
  const provider = settings.provider;
  const model = settings.model;
  if (!providerSupportsReasoningEffort(provider, model)) {
    await updateAgentProviderSettings(contextGlobalState(), { reasoningEffort: void 0 });
    return;
  }
  await updateAgentProviderSettings(contextGlobalState(), { reasoningEffort: normalized });
}
function getSelectedAgentProviderModelLabel() {
  const settings = readAgentProviderSettings(contextGlobalState());
  const provider = settings.provider;
  const model = settings.model || "";
  return model ? `${provider} / ${model}` : provider;
}
function contextGlobalState() {
  if (!extensionContextForAgentSettings) {
    throw new Error("Extension context is not initialized.");
  }
  return extensionContextForAgentSettings.globalState;
}
function getWorktreeService() {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) return void 0;
  const expectedRoot = path8.resolve(workspaceRoot, ".n8nac", "worktrees");
  if (!worktreeService || path8.resolve(worktreeService.getWorktreesRoot()) !== expectedRoot) {
    worktreeService = new WorktreeService(workspaceRoot, (message) => {
      outputChannel.appendLine(message);
    });
  }
  return worktreeService;
}
async function listWorktreeOptions() {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) return [];
  const service = getWorktreeService();
  if (!service) return [];
  return service.listWorktrees(workspaceRoot);
}
async function createAgentWorktree(options) {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) throw new Error("No workspace root available.");
  const service = getWorktreeService();
  if (!service) throw new Error("Worktree service unavailable.");
  return service.createWorktree(workspaceRoot, {
    branchName: options?.branchName,
    baseBranch: "HEAD"
  });
}
async function removeAgentWorktree(worktreePath) {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) throw new Error("No workspace root available.");
  const service = getWorktreeService();
  if (!service) throw new Error("Worktree service unavailable.");
  await service.removeWorktree(workspaceRoot, worktreePath);
}
async function resolveWorkflowWebviewTarget(workflow) {
  if (!workflow.id) {
    throw new Error(`Workflow "${workflow.name}" does not have a remote ID.`);
  }
  const workspaceRoot = getWorkspaceRoot();
  const facade = createN8nManagerFacade3({ workspaceRoot });
  if (workspaceRoot) {
    const configService = new ConfigService7(workspaceRoot);
    const workspaceConfig = configService.getWorkspaceConfig();
    if (workspaceConfig.version === 4) {
      const environment = await configService.prepareEnvironment();
      const n8nBaseUrl2 = environment.host;
      const proxyUrls2 = await startWorkflowProxy(n8nBaseUrl2);
      const workflowUrl2 = new URL(`/workflow/${encodeURIComponent(workflow.id)}`, n8nBaseUrl2.endsWith("/") ? n8nBaseUrl2 : `${n8nBaseUrl2}/`);
      workflowUrl2.searchParams.set("_n8nacBridge", String(Date.now()));
      if (environment.sourceKind === "managed-instance") {
        const openTarget2 = await facade.resolveWorkflowWebviewOpen({
          workflowId: workflow.id,
          proxyBaseUrl: proxyUrls2.localBaseUrl,
          workspaceRoot,
          workflowUrl: workflowUrl2.toString(),
          instanceId: environment.managedInstanceId
        });
        if (openTarget2.routePath && openTarget2.autoLoginPageHtml) {
          proxyService.registerHtmlRoute(openTarget2.routePath, externalizeProxyHtml(openTarget2.autoLoginPageHtml, proxyUrls2));
          outputChannel.appendLine(`[n8n] Opening workflow ${workflow.id} in environment ${environment.environmentName} through managed auto-login route.`);
        } else {
          outputChannel.appendLine(`[n8n] Opening workflow ${workflow.id} in environment ${environment.environmentName} through direct route.`);
        }
        return {
          url: externalizeProxyUrl(openTarget2.url, proxyUrls2),
          targetUrl: externalizeProxyUrl(openTarget2.targetUrl, proxyUrls2)
        };
      }
      outputChannel.appendLine(`[n8n] Opening workflow ${workflow.id} in external-instance workspace environment ${environment.environmentName}.`);
      return { url: `${proxyUrls2.publicBaseUrl}/workflow/${encodeURIComponent(workflow.id)}?${workflowUrl2.searchParams.toString()}`, targetUrl: workflowUrl2.toString() };
    }
  }
  const prepared = await facade.prepareEffectiveContext({
    workspaceRoot,
    syncFolderDefault: workspaceRoot ? "workspace" : "global",
    consumer: "vscode",
    autoStart: true
  });
  if (prepared.runtime.blocked) {
    throw new Error(prepared.runtime.blocked.message);
  }
  const effective = prepared.context;
  const n8nBaseUrl = effective.apiBaseUrl ?? effective.host;
  const proxyUrls = await startWorkflowProxy(n8nBaseUrl);
  const workflowUrl = new URL(`/workflow/${encodeURIComponent(workflow.id)}`, n8nBaseUrl.endsWith("/") ? n8nBaseUrl : `${n8nBaseUrl}/`);
  workflowUrl.searchParams.set("_n8nacBridge", String(Date.now()));
  const openTarget = await facade.resolveWorkflowWebviewOpen({
    workflowId: workflow.id,
    proxyBaseUrl: proxyUrls.localBaseUrl,
    workspaceRoot,
    workflowUrl: workflowUrl.toString()
  });
  if (openTarget.routePath && openTarget.autoLoginPageHtml) {
    proxyService.registerHtmlRoute(openTarget.routePath, externalizeProxyHtml(openTarget.autoLoginPageHtml, proxyUrls));
    outputChannel.appendLine(`[n8n] Opening workflow ${workflow.id} through managed auto-login webview route.`);
  } else {
    outputChannel.appendLine(`[n8n] Opening workflow ${workflow.id} through direct webview route.`);
  }
  return {
    url: externalizeProxyUrl(openTarget.url, proxyUrls),
    targetUrl: externalizeProxyUrl(openTarget.targetUrl, proxyUrls)
  };
}
async function startWorkflowProxy(n8nBaseUrl) {
  const localProxyUrl = await proxyService.start(n8nBaseUrl);
  const publicProxyUrl = await resolveWebviewProxyBaseUrl(localProxyUrl);
  proxyService.setPublicBaseUrl(publicProxyUrl);
  return {
    localBaseUrl: localProxyUrl.replace(/\/$/, ""),
    publicBaseUrl: publicProxyUrl
  };
}
function externalizeProxyUrl(url, proxyUrls) {
  if (proxyUrls.publicBaseUrl === proxyUrls.localBaseUrl) {
    return url;
  }
  try {
    const targetUrl = new URL(url);
    const localBaseUrl = new URL(proxyUrls.localBaseUrl);
    if (targetUrl.origin !== localBaseUrl.origin) {
      return url;
    }
    const localBasePath = trimTrailingSlash(localBaseUrl.pathname);
    if (!urlPathMatchesBase(targetUrl.pathname, localBasePath)) {
      return url;
    }
    const remainingPath = localBasePath ? targetUrl.pathname.slice(localBasePath.length) : targetUrl.pathname === "/" ? "" : targetUrl.pathname;
    return buildProxyUrl(proxyUrls.publicBaseUrl, remainingPath, targetUrl.search, targetUrl.hash);
  } catch {
    return url;
  }
}
function trimTrailingSlash(pathname) {
  const trimmed = pathname.replace(/\/$/, "");
  return trimmed === "/" ? "" : trimmed;
}
function urlPathMatchesBase(pathname, basePath) {
  return !basePath || pathname === basePath || pathname.startsWith(`${basePath}/`);
}
function buildProxyUrl(proxyBaseUrl, pathname, search = "", hash = "") {
  const path9 = pathname ? pathname.startsWith("/") ? pathname : `/${pathname}` : "";
  return `${proxyBaseUrl}${path9}${search}${hash}`;
}
function externalizeProxyHtml(html, proxyUrls) {
  if (proxyUrls.publicBaseUrl === proxyUrls.localBaseUrl) {
    return html;
  }
  return html.split(proxyUrls.localBaseUrl).join(proxyUrls.publicBaseUrl);
}
async function resolveWebviewProxyBaseUrl(localProxyUrl) {
  const normalizedLocalProxyUrl = localProxyUrl.replace(/\/$/, "");
  try {
    const externalUri = await vscode18.env.asExternalUri(vscode18.Uri.parse(normalizedLocalProxyUrl));
    const externalProxyUrl = externalUri.toString(true).replace(/\/$/, "");
    if (externalProxyUrl !== normalizedLocalProxyUrl) {
      outputChannel.appendLine(`[n8n] Exposed workflow proxy for webview: ${externalProxyUrl}`);
    }
    return externalProxyUrl;
  } catch (error) {
    outputChannel.appendLine(`[n8n] Failed to resolve external workflow proxy URL; using local URL. ${error?.message || String(error)}`);
    return normalizedLocalProxyUrl;
  }
}
function updateContextKeys() {
  const state = enhancedTreeProvider.getExtensionState();
  vscode18.commands.executeCommand("setContext", "n8n.state", state);
  vscode18.commands.executeCommand("setContext", "n8n.initialized", state === "initialized" /* INITIALIZED */);
}
function getOrCreateConfigurationController() {
  configurationController ??= new N8nConfigurationController(outputChannel);
  return configurationController;
}
function requireConfigurationController() {
  return getOrCreateConfigurationController();
}
async function migrateWorkspaceConfiguration(context) {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    vscode18.window.showWarningMessage(NO_WORKSPACE_ERROR_MESSAGE, OPEN_FOLDER_ACTION).then((selection) => {
      if (selection === OPEN_FOLDER_ACTION) void vscode18.commands.executeCommand("vscode.openFolder");
    });
    return;
  }
  const result = await runWorkspaceMigrationFromVscode(context, workspaceRoot);
  if (result.outcome === "not-needed") {
    await vscode18.window.showInformationMessage("No migration required.");
    await requireConfigurationController().refresh("migration-not-needed", { force: true });
    return;
  }
  if (result.outcome === "cancelled") return;
  await requireConfigurationController().refresh("migrate-workspace-configuration-command", { force: true });
  await determineInitialState(context);
  updateContextKeys();
  const backupPath = result.report.backupPath || "";
  const migratedEnvironmentCount = result.report.migratedEnvironmentIds?.length || 0;
  const suffix = backupPath ? ` Backup: ${backupPath}` : migratedEnvironmentCount ? ` ${migratedEnvironmentCount} environment${migratedEnvironmentCount === 1 ? "" : "s"} created.` : "";
  await vscode18.window.showInformationMessage(`Migration complete.${suffix}`);
}
function requireAgentRuntimeController() {
  if (!agentRuntimeController) {
    throw new Error("n8n agent runtime controller is not initialized.");
  }
  return agentRuntimeController;
}
function requireAgentProviderService() {
  if (!agentProviderService) {
    throw new Error("n8n agent provider service is not initialized.");
  }
  return agentProviderService;
}
async function setAgentProviderApiKey(context) {
  await setupAgentProvider(context);
}
async function setupAgentProvider(context) {
  const service = requireAgentProviderService();
  const currentProvider = readAgentProviderSettings(context.globalState).provider;
  const picked = await vscode18.window.showQuickPick(
    AGENT_SELECTABLE_PROVIDERS.map((provider) => ({
      provider,
      label: AGENT_PROVIDER_DEFINITIONS[provider].label,
      description: AGENT_PROVIDER_DEFINITIONS[provider].description,
      detail: AGENT_PROVIDER_DEFINITIONS[provider].authKind === "oauth-device" ? "OAuth device flow" : AGENT_PROVIDER_DEFINITIONS[provider].requiresApiKey ? "API key" : "Account credential",
      picked: provider === currentProvider
    })),
    {
      title: "Set up n8n Agent provider",
      placeHolder: "Providers and credentials are stored separately; model selection is fetched live.",
      ignoreFocusOut: true
    }
  );
  if (!picked) {
    return;
  }
  try {
    const configured = await service.setupProvider(picked.provider);
    if (!configured) return;
    await service.selectModel(picked.provider);
    vscode18.window.showInformationMessage(`Configured n8n Agent provider: ${picked.label}.`);
  } catch (error) {
    vscode18.window.showErrorMessage(`Provider setup failed: ${error?.message || String(error)}`);
  }
}
async function selectAgentModel() {
  const service = requireAgentProviderService();
  const currentProvider = readAgentProviderSettings(contextGlobalState()).provider;
  const pickedProvider = await vscode18.window.showQuickPick(
    AGENT_SELECTABLE_PROVIDERS.map((provider2) => ({
      provider: provider2,
      label: AGENT_PROVIDER_DEFINITIONS[provider2].label,
      description: AGENT_PROVIDER_DEFINITIONS[provider2].description,
      picked: provider2 === currentProvider
    })),
    {
      title: "Select provider for this n8n Agent session",
      placeHolder: "Choose a configured provider, then choose a live model.",
      ignoreFocusOut: true
    }
  );
  if (!pickedProvider) return;
  const provider = pickedProvider.provider;
  try {
    await updateAgentProviderSettings(contextGlobalState(), { provider });
    await service.selectModel(provider);
  } catch (error) {
    vscode18.window.showErrorMessage(`Model selection failed: ${error?.message || String(error)}`);
  }
}
async function selectAgentReasoningEffort() {
  const service = requireAgentProviderService();
  const settings = readAgentProviderSettings(contextGlobalState());
  const provider = settings.provider;
  const model = settings.model;
  try {
    await service.selectReasoningEffort(provider, model);
  } catch (error) {
    vscode18.window.showErrorMessage(`Reasoning effort selection failed: ${error?.message || String(error)}`);
  }
}
function getAutoInitConnectionKey(workspaceRoot) {
  const resolved = getResolvedN8nConfig(workspaceRoot);
  return JSON.stringify({
    workspaceRoot: workspaceRoot || "",
    activeInstanceId: resolved.activeInstanceId || "",
    host: resolved.host || "",
    hasApiKey: Boolean(resolved.apiKey),
    syncFolder: resolved.syncFolder || "",
    projectId: resolved.projectId || "",
    projectName: resolved.projectName || ""
  });
}
async function handleConfigurationSnapshotChanged(context, event) {
  if (suppressNextConfigurationReaction) {
    return;
  }
  if (initializingPromise) {
    outputChannel.appendLine(`[n8n] Configuration changed (${event.reason}) while initialization is running.`);
    return;
  }
  const runtimeChanged = Boolean(
    event.previous && event.previous.runtimeSignature !== event.snapshot.runtimeSignature
  );
  if (runtimeChanged) {
    failedAutoInitRuntimeSignature = void 0;
  }
  if (runtimeChanged || event.reason.includes("secret") || event.reason.includes("save")) {
    failedAutoInitConnectionKey = void 0;
  }
  if (syncManager && runtimeChanged) {
    const workspaceRoot = getWorkspaceRoot();
    const hasUnifiedConfig = workspaceRoot ? fs9.existsSync(path8.join(workspaceRoot, "n8nac-config.json")) : false;
    if (!hasUnifiedConfig) {
      resetExtensionRuntimeState();
      await determineInitialState(context);
      return;
    }
    if (event.snapshot.hasValidConnection) {
      await reinitializeSyncManager(context, { silent: event.reason !== "manual" });
    } else {
      resetExtensionRuntimeState();
      await determineInitialState(context);
    }
    return;
  }
  if (syncManager) {
    updateContextKeys();
    return;
  }
  await determineInitialState(context);
}
async function refreshConfigurationSnapshotAfterHandledMutation(reason) {
  const controller = configurationController;
  if (!controller) {
    return;
  }
  suppressNextConfigurationReaction = true;
  try {
    await controller.refresh(reason, { force: true });
  } finally {
    suppressNextConfigurationReaction = false;
  }
}
function disposeRuntimeDisposables() {
  for (const disposable of runtimeDisposables) {
    disposable.dispose();
  }
  runtimeDisposables = [];
}
function toInstanceQuickPickItem(instance, activeInstanceId) {
  const verificationDetail = instance.verification?.status === "verified" ? "Verified" : instance.verification?.status === "failed" ? "Verification failed" : void 0;
  return {
    label: instance.name,
    description: instance.host || "Host not configured",
    detail: instance.projectName || verificationDetail || (instance.id === activeInstanceId ? "Currently active" : ""),
    picked: instance.id === activeInstanceId,
    instanceId: instance.id
  };
}
function toEnvironmentQuickPickItem(environment, activeEnvironmentId) {
  return {
    label: environment.name,
    description: environment.projectName || environment.environmentTargetId,
    detail: environment.workflowsPath || environment.workflowDir || environment.syncFolder || (environment.id === activeEnvironmentId ? "Currently active" : ""),
    picked: environment.id === activeEnvironmentId,
    environmentId: environment.id
  };
}
async function switchWorkspaceInstance(context, args = {}) {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    vscode18.window.showErrorMessage(NO_WORKSPACE_ERROR_MESSAGE);
    return void 0;
  }
  const configService = new ConfigService7(workspaceRoot);
  const workspaceConfig = configService.getWorkspaceConfig();
  if (workspaceConfig.version !== 4) {
    const instances = configService.listInstances();
    if (!instances.length) {
      vscode18.window.showWarningMessage("No configured n8n instances found.");
      return void 0;
    }
    const activeInstanceId = configService.getActiveInstanceId();
    let targetInstanceId = args.instanceId?.trim();
    if (!targetInstanceId) {
      const picked = await vscode18.window.showQuickPick(
        instances.map((instance) => toInstanceQuickPickItem(instance, activeInstanceId)),
        {
          title: "Select the active workspace instance",
          ignoreFocusOut: true
        }
      );
      if (!picked) {
        return void 0;
      }
      targetInstanceId = picked.instanceId;
    }
    if (targetInstanceId === activeInstanceId) {
      return targetInstanceId;
    }
    const selectedInstance = configService.pinWorkspaceInstance(targetInstanceId);
    if (syncManager) {
      await reinitializeSyncManager(context);
    } else {
      await determineInitialState(context);
    }
    await refreshConfigurationSnapshotAfterHandledMutation("command-switch-workspace-instance");
    updateContextKeys();
    if (!args.silent) {
      vscode18.window.showInformationMessage(`Active n8n instance: ${selectedInstance.name}`);
    }
    return selectedInstance.id;
  }
  const environments = configService.listEnvironments();
  if (!environments.length) {
    vscode18.window.showWarningMessage("No workspace environments found. Create one in n8n: Configure.");
    return void 0;
  }
  const activeEnvironmentId = workspaceConfig.activeEnvironmentId;
  let targetEnvironmentId = args.environmentId?.trim() || args.instanceId?.trim();
  if (!targetEnvironmentId) {
    const picked = await vscode18.window.showQuickPick(
      environments.map((environment) => toEnvironmentQuickPickItem(environment, activeEnvironmentId)),
      {
        title: "Select the active workspace environment",
        ignoreFocusOut: true
      }
    );
    if (!picked) {
      return void 0;
    }
    targetEnvironmentId = picked.environmentId;
  }
  if (targetEnvironmentId === activeEnvironmentId) {
    return targetEnvironmentId;
  }
  const selectedEnvironment = configService.pinEnvironment(targetEnvironmentId);
  if (syncManager) {
    await reinitializeSyncManager(context);
  } else {
    await determineInitialState(context);
  }
  await refreshConfigurationSnapshotAfterHandledMutation("command-switch-workspace-environment");
  updateContextKeys();
  if (!args.silent) {
    vscode18.window.showInformationMessage(`Active n8n environment: ${selectedEnvironment.name}`);
  }
  return selectedEnvironment.id;
}
async function pinWorkspaceInstance(context, args = {}) {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    vscode18.window.showErrorMessage(NO_WORKSPACE_ERROR_MESSAGE);
    return void 0;
  }
  const configService = new ConfigService7(workspaceRoot);
  const workspaceConfig = configService.getWorkspaceConfig();
  if (workspaceConfig.version !== 4) {
    const instances = configService.listInstances();
    if (!instances.length) {
      vscode18.window.showWarningMessage("No configured n8n instances found.");
      return void 0;
    }
    let targetInstanceId = args.instanceId?.trim();
    if (!targetInstanceId) {
      const activeInstanceId = configService.getActiveInstanceId();
      const picked = await vscode18.window.showQuickPick(
        instances.map((instance) => toInstanceQuickPickItem(instance, activeInstanceId)),
        {
          title: "Pin workspace instance",
          ignoreFocusOut: true
        }
      );
      if (!picked) {
        return void 0;
      }
      targetInstanceId = picked.instanceId;
    }
    const selectedInstance = configService.pinWorkspaceInstance(targetInstanceId);
    if (syncManager) {
      await reinitializeSyncManager(context);
    } else {
      await determineInitialState(context);
    }
    await refreshConfigurationSnapshotAfterHandledMutation("command-pin-workspace-instance");
    updateContextKeys();
    if (!args.silent) {
      vscode18.window.showInformationMessage(`Workspace instance pinned: ${selectedInstance.name}`);
    }
    return selectedInstance.id;
  }
  const environments = configService.listEnvironments();
  if (!environments.length) {
    vscode18.window.showWarningMessage("No workspace environments found. Create one in n8n: Configure.");
    return void 0;
  }
  let targetEnvironmentId = args.environmentId?.trim() || args.instanceId?.trim();
  if (!targetEnvironmentId) {
    const activeEnvironmentId = workspaceConfig.activeEnvironmentId;
    const picked = await vscode18.window.showQuickPick(
      environments.map((environment) => toEnvironmentQuickPickItem(environment, activeEnvironmentId)),
      {
        title: "Pin workspace environment",
        ignoreFocusOut: true
      }
    );
    if (!picked) {
      return void 0;
    }
    targetEnvironmentId = picked.environmentId;
  }
  const selectedEnvironment = configService.pinEnvironment(targetEnvironmentId);
  if (syncManager) {
    await reinitializeSyncManager(context);
  } else {
    await determineInitialState(context);
  }
  await refreshConfigurationSnapshotAfterHandledMutation("command-pin-workspace-environment");
  updateContextKeys();
  if (!args.silent) {
    vscode18.window.showInformationMessage(`Workspace environment pinned: ${selectedEnvironment.name}`);
  }
  return selectedEnvironment.id;
}
async function clearWorkspaceInstancePin(context) {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    vscode18.window.showErrorMessage(NO_WORKSPACE_ERROR_MESSAGE);
    return;
  }
  const configService = new ConfigService7(workspaceRoot);
  const workspaceConfig = configService.getWorkspaceConfig();
  if (workspaceConfig.version !== 4) {
    configService.clearWorkspaceInstanceOverride();
    if (syncManager) {
      await reinitializeSyncManager(context);
    } else {
      await determineInitialState(context);
    }
    await refreshConfigurationSnapshotAfterHandledMutation("command-clear-workspace-instance");
    updateContextKeys();
    vscode18.window.showInformationMessage("Workspace instance override cleared.");
    return;
  }
  vscode18.window.showInformationMessage('This workspace uses environments. Use "Pin workspace environment" to change the default target.');
}
async function deleteWorkspaceInstance(context, args = {}) {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    vscode18.window.showErrorMessage(NO_WORKSPACE_ERROR_MESSAGE);
    return void 0;
  }
  const configService = new ConfigService7(workspaceRoot);
  const instances = configService.listInstances();
  if (!instances.length) {
    vscode18.window.showWarningMessage("No configured n8n instances found.");
    return void 0;
  }
  const activeInstanceId = configService.getActiveInstanceId();
  let targetInstanceId = args.instanceId?.trim();
  if (!targetInstanceId) {
    const picked = await vscode18.window.showQuickPick(
      instances.map((instance) => toInstanceQuickPickItem(instance, activeInstanceId)),
      {
        title: "Select the n8n instance to delete",
        ignoreFocusOut: true
      }
    );
    if (!picked) {
      return void 0;
    }
    targetInstanceId = picked.instanceId;
  }
  const targetInstance = instances.find((instance) => instance.id === targetInstanceId);
  if (!targetInstance) {
    vscode18.window.showErrorMessage(`Unknown instance: ${targetInstanceId}`);
    return void 0;
  }
  if (!args.skipConfirm) {
    const confirmation = await vscode18.window.showWarningMessage(
      `Delete instance "${targetInstance.name}"?`,
      { modal: true },
      "Delete"
    );
    if (confirmation !== "Delete") {
      return void 0;
    }
  }
  const wasActive = targetInstance.id === activeInstanceId;
  const result = configService.deleteInstance(targetInstance.id);
  const refreshAfterDelete = async () => {
    if (!wasActive) {
      await refreshConfigurationSnapshotAfterHandledMutation("command-delete-instance");
      updateContextKeys();
      return;
    }
    if (result.activeInstance) {
      await reinitializeSyncManager(context);
    } else {
      await determineInitialState(context);
    }
    await refreshConfigurationSnapshotAfterHandledMutation("command-delete-instance");
    updateContextKeys();
  };
  try {
    if (args.silent) {
      void refreshAfterDelete().catch((error) => {
        outputChannel.appendLine(`[n8n] Failed to refresh after deleting instance: ${error?.message || error}`);
      });
    } else {
      await refreshAfterDelete();
    }
  } catch (error) {
    outputChannel.appendLine(`[n8n] Instance deleted but refresh failed: ${error?.message || error}`);
    if (!args.silent) {
      vscode18.window.showWarningMessage(
        `Deleted instance "${result.deletedInstance.name}", but the extension state needs a refresh: ${error?.message || error}`
      );
    }
  }
  if (!args.silent) {
    const message = result.activeInstance ? `Deleted instance "${result.deletedInstance.name}". Current instance: ${result.activeInstance.name}` : `Deleted instance "${result.deletedInstance.name}". No instance is currently configured.`;
    vscode18.window.showInformationMessage(message);
  }
  return result.deletedInstance.id;
}
function resetExtensionRuntimeState() {
  if (syncManager) {
    syncManager.removeAllListeners();
  }
  disposeRuntimeDisposables();
  syncManager = void 0;
  cli = void 0;
  conflictStore.clear();
  enhancedTreeProvider.setSyncManager(void 0);
  clearSyncManager();
  store.dispatch(setWorkflows([]));
  store.dispatch(clearConflicts());
}
async function determineInitialState(context) {
  const configValidation = validateN8nConfig();
  const workspaceRoot = getWorkspaceRoot();
  const snapshot = configurationController?.getSnapshot();
  if (!workspaceRoot) {
    resetExtensionRuntimeState();
    enhancedTreeProvider.setExtensionState("uninitialized" /* UNINITIALIZED */);
    statusBar.hide();
    updateContextKeys();
    return;
  }
  const hasUnifiedConfig = fs9.existsSync(path8.join(workspaceRoot, "n8nac-config.json")) || snapshot?.workspaceRoot === workspaceRoot && snapshot.hasWorkspaceConfig;
  if (!hasUnifiedConfig) {
    resetExtensionRuntimeState();
    enhancedTreeProvider.setExtensionState("configuring" /* CONFIGURING */);
    statusBar.showConfiguring();
    updateContextKeys();
    return;
  }
  const hasValidConnection = configValidation.isValid || Boolean(snapshot?.workspaceRoot === workspaceRoot && snapshot.hasWorkspaceConfig && snapshot.hasValidConnection);
  if (hasValidConnection) {
    const autoInitConnectionKey = getAutoInitConnectionKey(workspaceRoot);
    if (failedAutoInitConnectionKey === autoInitConnectionKey) {
      outputChannel.appendLine("[n8n] Skipping automatic sync initialization for unchanged connection after previous failure.");
      updateContextKeys();
      return;
    }
    const runtimeSignature = configurationController?.getSnapshot()?.runtimeSignature;
    if (runtimeSignature && failedAutoInitRuntimeSignature === runtimeSignature) {
      outputChannel.appendLine("[n8n] Skipping automatic sync initialization for unchanged config after previous failure.");
      updateContextKeys();
      return;
    }
    outputChannel.appendLine("[n8n] Valid effective n8n config detected. Loading sync manager...");
    enhancedTreeProvider.setExtensionState("initializing" /* INITIALIZING */);
    updateContextKeys();
    statusBar.showLoading();
    try {
      initializingPromise = initializeSyncManager(context);
      await initializingPromise;
      failedAutoInitRuntimeSignature = void 0;
      failedAutoInitConnectionKey = void 0;
      enhancedTreeProvider.setExtensionState("initialized" /* INITIALIZED */);
      statusBar.showSynced();
    } catch (error) {
      failedAutoInitRuntimeSignature = runtimeSignature;
      failedAutoInitConnectionKey = autoInitConnectionKey;
      outputChannel.appendLine(`[n8n] Auto-load failed: ${error.message}`);
      enhancedTreeProvider.setExtensionState("error" /* ERROR */, error.message);
      statusBar.showError(error.message);
    } finally {
      initializingPromise = void 0;
    }
  } else if (!configValidation.isValid || snapshot?.error) {
    enhancedTreeProvider.setExtensionState("configuring" /* CONFIGURING */);
    statusBar.showConfiguring();
  }
  updateContextKeys();
}
async function handleInitializeCommand(context) {
  if (initializingPromise) {
    outputChannel.appendLine("[n8n] Initialization already in progress, waiting...");
    try {
      await initializingPromise;
      vscode18.window.showInformationMessage("\u2705 n8n as code initialized successfully!");
    } catch (error) {
      vscode18.window.showErrorMessage(`Initialization failed: ${error.message}`);
    }
    return;
  }
  if (!vscode18.workspace.workspaceFolders?.length) {
    await showNoWorkspaceError();
    return;
  }
  const configValidation = validateN8nConfig();
  if (!configValidation.isValid) {
    vscode18.window.showErrorMessage(`Missing configuration: ${configValidation.missing.join(", ")}`);
    ConfigurationWebview.createOrShow(context, requireConfigurationController());
    return;
  }
  enhancedTreeProvider.setExtensionState("initializing" /* INITIALIZING */);
  updateContextKeys();
  statusBar.showLoading();
  try {
    failedAutoInitRuntimeSignature = void 0;
    failedAutoInitConnectionKey = void 0;
    initializingPromise = initializeSyncManager(context);
    await initializingPromise;
    failedAutoInitRuntimeSignature = void 0;
    failedAutoInitConnectionKey = void 0;
    enhancedTreeProvider.setExtensionState("initialized" /* INITIALIZED */);
    updateContextKeys();
    statusBar.showSynced();
    vscode18.window.showInformationMessage("\u2705 n8n as code initialized successfully!");
  } catch (error) {
    failedAutoInitRuntimeSignature = configurationController?.getSnapshot()?.runtimeSignature;
    failedAutoInitConnectionKey = getAutoInitConnectionKey(getWorkspaceRoot());
    outputChannel.appendLine(`[n8n] Initialization failed: ${error.message}`);
    enhancedTreeProvider.setExtensionState("error" /* ERROR */, error.message);
    statusBar.showError(error.message);
    vscode18.window.showErrorMessage(`Initialization failed: ${error.message}`);
  } finally {
    initializingPromise = void 0;
  }
}
async function showNoWorkspaceError() {
  const action = await vscode18.window.showErrorMessage(NO_WORKSPACE_ERROR_MESSAGE, OPEN_FOLDER_ACTION);
  if (action === OPEN_FOLDER_ACTION) {
    await vscode18.commands.executeCommand("vscode.openFolder");
  }
}
function getHttpStatus(error) {
  return error?.response?.status;
}
function formatN8nApiError(error, host) {
  const status = getHttpStatus(error);
  if (status === 401) {
    return `Cannot authenticate to n8n at "${host}". Check the API key for the effective instance.`;
  }
  if (status === 403) {
    return `The API key reached n8n at "${host}", but it cannot access workflows. Check the API key permissions.`;
  }
  if (status === 404) {
    return `The n8n workflows API is not available at "${host}". Check the instance URL.`;
  }
  if (!error?.response) {
    return `Cannot connect to n8n at "${host}": ${error?.message || error}`;
  }
  return `n8n API request failed at "${host}" with status ${status}: ${error?.message || error}`;
}
async function assertN8nApiAccess(client, host) {
  try {
    await client.assertApiAccess();
  } catch (error) {
    throw new Error(formatN8nApiError(error, host));
  }
}
function scheduleEnsureAiContextFresh(context, reason, snapshot, versionHint) {
  if (aiContextFreshnessTimer) {
    clearTimeout(aiContextFreshnessTimer);
  }
  aiContextFreshnessTimer = setTimeout(() => {
    aiContextFreshnessTimer = void 0;
    void ensureAiContextFresh(context, reason, { snapshot, versionHint }).catch((error) => {
      outputChannel.appendLine(`[n8n] AI context freshness check failed: ${error?.message || error}`);
    });
  }, 500);
}
async function ensureAiContextFresh(context, reason, options = {}) {
  if (aiContextFreshnessInFlight) {
    await aiContextFreshnessInFlight;
    if (!options.force) return;
  }
  aiContextFreshnessInFlight = doEnsureAiContextFresh(context, reason, options);
  try {
    await aiContextFreshnessInFlight;
  } finally {
    aiContextFreshnessInFlight = void 0;
  }
}
async function doEnsureAiContextFresh(context, reason, options) {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) return;
  if (!options.force && !shouldAutoEnsureAiContext({ workspaceRoot, snapshot: options.snapshot })) {
    outputChannel.appendLine(`[n8n] Skipping automatic AI context refresh (${reason}): workspace is not explicitly configured.`);
    return;
  }
  const connection = resolveAiContextConnection(workspaceRoot);
  const metadata = readAiContextMetadata(workspaceRoot);
  const candidateVersion = options.versionHint || context.workspaceState.get("n8n.lastInitVersion") || metadata?.n8nVersion || "Unknown";
  let signature = buildAiContextSignature(workspaceRoot, options.snapshot, candidateVersion);
  const agentsVersion = readAgentsMdVersion(workspaceRoot);
  const currentCliVersion = getCurrentCliVersion();
  const agentsPath = path8.join(workspaceRoot, "AGENTS.md");
  const missingAgentsFile = !fs9.existsSync(agentsPath);
  const stampIsStale = Boolean(currentCliVersion && agentsVersion !== currentCliVersion);
  let needsUpdate = options.force || missingAgentsFile || stampIsStale || metadata?.schemaVersion !== AI_CONTEXT_SIGNATURE_SCHEMA_VERSION || metadata?.signature !== signature;
  if (!needsUpdate) {
    outputChannel.appendLine(`[n8n] AI context is fresh (${reason}).`);
    return;
  }
  const version2 = options.versionHint || await resolveAiContextVersion(context, connection.client, connection.host, true);
  signature = buildAiContextSignature(workspaceRoot, options.snapshot, version2);
  if (!options.force && metadata?.signature === signature && !missingAgentsFile && !stampIsStale) {
    outputChannel.appendLine(`[n8n] AI context is fresh (${reason}).`);
    return;
  }
  outputChannel.appendLine(`[n8n] Ensuring AI context is fresh (${reason})...`);
  await generateAiContextForWorkspace(context, connection.client, workspaceRoot, {
    silent: true,
    progress: options.progress,
    host: connection.host,
    versionHint: version2
  });
  writeAiContextMetadata(workspaceRoot, {
    schemaVersion: AI_CONTEXT_SIGNATURE_SCHEMA_VERSION,
    signature,
    n8nacVersion: currentCliVersion,
    n8nVersion: version2,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    reason
  });
}
function buildAiContextSignature(workspaceRoot, snapshot, n8nVersion) {
  const resolved = (() => {
    try {
      return getResolvedN8nConfig(workspaceRoot);
    } catch {
      return void 0;
    }
  })();
  const workspaceConfigHash = (() => {
    try {
      const configPath = path8.join(workspaceRoot, "n8nac-config.json");
      return fs9.existsSync(configPath) ? createHash4("sha256").update(fs9.readFileSync(configPath)).digest("hex") : "";
    } catch {
      return "";
    }
  })();
  const workspaceSnapshot = snapshot?.workspace;
  const payload = {
    schemaVersion: AI_CONTEXT_SIGNATURE_SCHEMA_VERSION,
    n8nacVersion: getCurrentCliVersion(),
    n8nVersion,
    runtimeSignature: snapshot?.runtimeSignature || "",
    workspaceConfigHash,
    activeEnvironmentId: workspaceSnapshot?.activeEnvironmentId || resolved?.environmentId || "",
    environmentTargetId: resolved?.environmentTargetId || "",
    syncFolder: resolved?.syncFolder || "",
    projectId: resolved?.projectId || "",
    projectName: resolved?.projectName || ""
  };
  return createHash4("sha256").update(JSON.stringify(payload)).digest("hex");
}
function getCurrentCliVersion() {
  return "2.3.3" ? "2.3.3" : void 0;
}
function readAgentsMdVersion(workspaceRoot) {
  try {
    const content = fs9.readFileSync(path8.join(workspaceRoot, "AGENTS.md"), "utf8");
    return content.match(/<!--\s*n8nac-version:\s*([^\s>]+)\s*-->/)?.[1];
  } catch {
    return void 0;
  }
}
function readAiContextMetadata(workspaceRoot) {
  try {
    const metadataPath = path8.join(workspaceRoot, AI_CONTEXT_METADATA_RELATIVE_PATH);
    if (!fs9.existsSync(metadataPath)) return void 0;
    return JSON.parse(fs9.readFileSync(metadataPath, "utf8"));
  } catch {
    return void 0;
  }
}
function writeAiContextMetadata(workspaceRoot, metadata) {
  const metadataPath = path8.join(workspaceRoot, AI_CONTEXT_METADATA_RELATIVE_PATH);
  fs9.mkdirSync(path8.dirname(metadataPath), { recursive: true });
  fs9.writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}
`);
}
async function generateAiContextForWorkspace(context, client, workspaceRoot, options = {}) {
  const version2 = options.versionHint || await resolveAiContextVersion(context, client, options.host, options.silent);
  options.progress?.report({ message: "Generating AGENTS.md..." });
  const distTag = false ? "next" : void 0;
  const cliVersion = "2.3.3" ? "2.3.3" : void 0;
  await new AiContextGenerator().generate(workspaceRoot, version2, distTag, {
    cliVersion,
    cliCommandOverride: resolveAiContextCliCommandOverride(context, workspaceRoot),
    managerCommandOverride: resolveAiContextManagerCommandOverride(context)
  });
  await context.workspaceState.update("n8n.lastInitVersion", version2);
  if (!options.silent) {
    vscode18.window.showInformationMessage(`\u2728 n8n AI Context Initialized! (v${version2})`);
  }
  return version2;
}
function resolveAiContextConnection(workspaceRoot) {
  const fromEffectiveContext = (() => {
    try {
      const effective = new ConfigService7(workspaceRoot).getEffectiveContext();
      const host2 = effective?.apiBaseUrl || effective?.host || effective?.baseUrl || "";
      const apiKey2 = effective?.apiKey || "";
      return { host: host2, apiKey: apiKey2 };
    } catch {
      return void 0;
    }
  })();
  const credentials = fromEffectiveContext?.host || fromEffectiveContext?.apiKey ? fromEffectiveContext : getN8nConfig();
  const host = credentials?.host || "";
  const apiKey = credentials?.apiKey || "";
  return {
    host,
    client: host && apiKey ? new N8nApiClient2({ host, apiKey }) : void 0
  };
}
async function resolveAiContextVersion(context, client, host, silent) {
  if (client) {
    try {
      return (await client.getHealth()).version;
    } catch (error) {
      const message = host ? `Could not fetch n8n version from "${host}"; generating AI context with fallback version.` : "Could not fetch n8n version; generating AI context with fallback version.";
      outputChannel.appendLine(`[n8n] ${message} ${error?.message || error}`);
      if (!silent) {
        vscode18.window.showWarningMessage(`n8n: ${message}`);
      }
    }
  }
  return context.workspaceState.get("n8n.lastInitVersion") || "Unknown";
}
function resolveAiContextCliCommandOverride(context, workspaceRoot) {
  if (process.env.N8NAC_COMMAND) {
    return void 0;
  }
  if (getN8nacDevConfigFilenames().some((filename) => fs9.existsSync(path8.join(workspaceRoot, filename)))) {
    return void 0;
  }
  if (context.extensionMode !== vscode18.ExtensionMode.Development) {
    return void 0;
  }
  const localCliPath = path8.resolve(context.extensionPath, "..", "cli", "dist", "index.js");
  if (!fs9.existsSync(localCliPath)) {
    return void 0;
  }
  return `node ${quoteShellArg(localCliPath)}`;
}
function resolveAiContextManagerCommandOverride(context) {
  if (process.env.N8N_MANAGER_COMMAND) {
    return process.env.N8N_MANAGER_COMMAND;
  }
  if (context.extensionMode !== vscode18.ExtensionMode.Development) {
    return void 0;
  }
  const siblingManagerCliPath = path8.resolve(context.extensionPath, "..", "..", "..", "n8n-manager", "packages", "cli", "dist", "index.js");
  if (!fs9.existsSync(siblingManagerCliPath)) {
    return void 0;
  }
  return `node ${quoteShellArg(siblingManagerCliPath)}`;
}
function quoteShellArg(value) {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}
async function updateAiContextAfterSyncInitialization(context, client, versionHint) {
  const currentVersion = versionHint || await resolveAiContextVersion(context, client, void 0, true);
  try {
    await ensureAiContextFresh(context, "sync-initialized", { force: true, versionHint: currentVersion });
  } catch (error) {
    outputChannel.appendLine(`[n8n] Failed to auto-generate AI context: ${error.message}`);
  }
}
async function initializeSyncManager(context) {
  resetExtensionRuntimeState();
  const workspaceRoot = vscode18.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspaceRoot) throw new Error(NO_WORKSPACE_ERROR_MESSAGE);
  const facade = createN8nManagerFacade3({ workspaceRoot });
  const configService = new ConfigService7(workspaceRoot);
  const workspaceConfig = configService.getWorkspaceConfig();
  const environment = workspaceConfig.version === 4 ? await configService.prepareEnvironment() : void 0;
  const prepared = environment ? void 0 : await facade.prepareEffectiveContext({
    workspaceRoot,
    syncFolderDefault: "workspace",
    consumer: "vscode",
    autoStart: true
  });
  if (prepared?.runtime.blocked) {
    throw new Error(prepared.runtime.blocked.message);
  }
  const effective = prepared?.context;
  const resolvedConfig = {
    ...getResolvedN8nConfig(workspaceRoot),
    activeInstanceId: environment?.activeInstanceId || effective?.activeInstanceId || "",
    host: environment?.host || effective?.apiBaseUrl || effective?.host || "",
    apiKey: environment?.apiKey || effective?.apiKey || "",
    workflowsPath: environment?.workflowsPath || environment?.workflowDir || effective?.workflowsPath || effective?.workflowDir || "",
    syncFolder: environment?.workflowsPath || environment?.workflowDir || effective?.workflowsPath || effective?.workflowDir || effective?.syncFolder || "workflows",
    workflowDir: environment?.workflowsPath || environment?.workflowDir || effective?.workflowsPath || effective?.workflowDir || "",
    projectId: environment?.projectId || effective?.projectId || "",
    projectName: environment?.projectName || effective?.projectName || ""
  };
  const { host, apiKey } = resolvedConfig;
  const folder = resolvedConfig.workflowsPath || resolvedConfig.workflowDir || resolvedConfig.syncFolder || "workflows";
  let projectId = resolvedConfig.projectId || void 0;
  let projectName = resolvedConfig.projectName || void 0;
  if (!host || !apiKey) throw new Error("Host/API Key missing. Please configure n8n.");
  const credentials = { host, apiKey };
  const client = new N8nApiClient2(credentials);
  await assertN8nApiAccess(client, host);
  const health = await client.getHealth();
  if (environment && (!projectId || !projectName)) {
    throw new Error(`Environment "${environment.environmentName}" is missing project configuration. Set it in n8n: Configure or run n8nac env update ${environment.environmentId} --project-id <id> --project-name <name>.`);
  }
  if (!projectId || !projectName) {
    const projects = environment ? await client.getProjects() : await facade.listProjects({
      workspaceRoot,
      syncFolderDefault: "workspace",
      consumer: "vscode",
      autoStart: true
    });
    if (!projects.length) throw new Error("No projects found. Cannot initialize sync.");
    let selectedProject = projects.length === 1 ? projects[0] : void 0;
    if (!selectedProject) {
      const picked = await vscode18.window.showQuickPick(
        projects.map((p) => ({
          label: getProjectDisplayLabel(p),
          description: p.type,
          detail: getProjectDetail(p),
          project: p
        })),
        { title: "Select the n8n project to sync", ignoreFocusOut: true }
      );
      if (!picked) throw new Error("Project selection cancelled.");
      selectedProject = picked.project;
    }
    if (!selectedProject) throw new Error("No project selected.");
    projectId = selectedProject.id;
    projectName = getCanonicalProjectName(selectedProject);
    outputChannel.appendLine(`[n8n] Selected project: ${getProjectDisplayLabel(selectedProject)} (${projectId})`);
  }
  const absDirectory = path8.isAbsolute(folder) ? folder : path8.resolve(workspaceRoot, folder);
  const workflowDir = resolvedConfig.workflowDir || "";
  const absWorkflowDirectory = workflowDir ? path8.isAbsolute(workflowDir) ? workflowDir : path8.resolve(workspaceRoot, workflowDir) : void 0;
  let instanceIdentifier;
  try {
    const resolution = await resolveInstanceIdentifier4(credentials, {
      client
    });
    instanceIdentifier = resolution.identifier;
    outputChannel.appendLine(`[n8n] Instance identifier: ${instanceIdentifier}`);
    const currentIdentifier = environment?.instanceIdentifier || effective?.instance.instanceIdentifier;
    if (!environment && !isCanonicalUserInstanceIdentifier3(currentIdentifier)) {
      await facade.upsertInstance({
        id: effective?.activeInstanceId,
        instanceIdentifier
      }, { setActive: false });
    }
  } catch (error) {
    throw new Error(`Cannot connect to n8n instance at "${host}". Please check if n8n is running.`);
  }
  syncManager = new SyncManager2(client, {
    directory: absDirectory,
    workflowsPath: absWorkflowDirectory,
    workflowDir: absWorkflowDirectory,
    syncInactive: true,
    ignoredTags: [],
    instanceIdentifier,
    instanceConfigPath: path8.join(workspaceRoot, "n8nac-config.json"),
    projectId,
    projectName,
    environmentId: environment?.environmentId,
    environmentName: environment?.environmentName,
    environmentTargetId: environment?.environmentTargetId,
    environmentTargetName: environment?.environmentTargetName,
    sourceKind: environment?.sourceKind
  });
  cli = new CliApi(syncManager);
  enhancedTreeProvider.setSyncManager(syncManager);
  setSyncManager(syncManager);
  enhancedTreeProvider.subscribeToStore(store);
  syncManager.on("connection-lost", (error) => {
    outputChannel.appendLine(`[n8n] CONNECTION LOST: ${error.message}`);
    enhancedTreeProvider.setExtensionState("error" /* ERROR */, error.message);
    statusBar.showError("Connection lost");
    vscode18.window.showErrorMessage(
      "Lost connection to n8n instance.",
      "Retry Connection",
      "Open Settings"
    ).then((choice) => {
      if (choice === "Retry Connection") reinitializeSyncManager(context);
      else if (choice === "Open Settings") vscode18.commands.executeCommand("n8n.openSettings");
    });
  });
  syncManager.on("error", (msg) => {
    outputChannel.appendLine(`[n8n] Error: ${msg}`);
    vscode18.window.showErrorMessage(`n8n Error: ${msg}`);
  });
  syncManager.on("log", (msg) => {
    outputChannel.appendLine(msg);
    if (msg.includes("Sync complete") || msg.includes("Push complete")) {
      vscode18.window.showInformationMessage(msg.replace(/^📥 |^📤 |^🔄 |^✅ /, ""));
    }
  });
  syncManager.on("remote-updated", (data) => {
    const reloaded = workflowWebviewRegistry.reloadIfMatching(data.workflowId);
    outputChannel.appendLine(`[n8n-agent-debug] syncManager remote-updated workflowId=${data.workflowId} filename=${data.filename} reloaded=${reloaded}`);
  });
  if (vscode18.workspace.workspaceFolders?.length) {
    const pattern = path8.isAbsolute(folder) ? new vscode18.RelativePattern(vscode18.Uri.file(absWorkflowDirectory || absDirectory), "**/*.workflow.ts") : absWorkflowDirectory ? new vscode18.RelativePattern(vscode18.Uri.file(absWorkflowDirectory), "**/*.workflow.ts") : new vscode18.RelativePattern(vscode18.workspace.workspaceFolders[0], `${folder}/**/*.workflow.ts`);
    const fileWatcher = vscode18.workspace.createFileSystemWatcher(pattern, false, true, false);
    const reloadList = async () => {
      if (!syncManager) return;
      try {
        await store.dispatch(loadWorkflows());
        enhancedTreeProvider.refresh();
      } catch (err) {
        console.error("[n8n] FS watcher: failed to refresh list", err);
      }
    };
    fileWatcher.onDidCreate(reloadList);
    fileWatcher.onDidDelete(reloadList);
    runtimeDisposables.push(fileWatcher);
  }
  const pollingInterval = setInterval(async () => {
    if (!cli) return;
    try {
      store.dispatch(setWorkflows(await cli.list({ fetchRemote: true })));
      enhancedTreeProvider.refresh();
    } catch (err) {
      console.error("[n8n] Polling: failed to refresh list", err);
    }
  }, 6e4);
  runtimeDisposables.push({ dispose: () => clearInterval(pollingInterval) });
  statusBar.setWatchMode(false);
  outputChannel.appendLine("[n8n] Loading workflow list...");
  try {
    const workflows = await cli.list({ fetchRemote: true });
    store.dispatch(setWorkflows(workflows));
    outputChannel.appendLine(`[n8n] Found ${workflows.length} workflows.`);
  } catch (error) {
    resetExtensionRuntimeState();
    outputChannel.appendLine(`[n8n] Failed to load workflows: ${error.message}`);
    throw error;
  }
  if (vscode18.workspace.workspaceFolders?.length && syncManager) {
    const journalPattern = path8.isAbsolute(folder) ? new vscode18.RelativePattern(vscode18.Uri.file(absWorkflowDirectory || absDirectory), `**/${SYNC_EVENT_JOURNAL_FILENAME}`) : absWorkflowDirectory ? new vscode18.RelativePattern(vscode18.Uri.file(absWorkflowDirectory), `**/${SYNC_EVENT_JOURNAL_FILENAME}`) : new vscode18.RelativePattern(vscode18.workspace.workspaceFolders[0], `${folder}/**/${SYNC_EVENT_JOURNAL_FILENAME}`);
    const journalUri = vscode18.Uri.file(await syncManager.getSyncEventJournalPath());
    await processSyncEventJournal(journalUri, "sync journal seed", true);
    const journalWatcher = vscode18.workspace.createFileSystemWatcher(journalPattern, false, false, true);
    const handleJournalWrite = async (changedUri) => {
      if (!cli) return;
      try {
        outputChannel.appendLine(`[n8n-agent-debug] syncEventJournal change path=${changedUri.fsPath}`);
        store.dispatch(setWorkflows(await cli.list()));
        enhancedTreeProvider.refresh();
        await processSyncEventJournal(changedUri, "syncEventWatcher");
      } catch (err) {
        console.error("[n8n] Sync event watcher: failed to refresh after CLI operation", err);
      }
    };
    journalWatcher.onDidCreate(handleJournalWrite);
    journalWatcher.onDidChange(handleJournalWrite);
    runtimeDisposables.push(journalWatcher);
    const journalPollingInterval = setInterval(() => {
      void processSyncEventJournal(journalUri, "syncEventPoll").catch((err) => {
        console.error("[n8n] Sync event poll: failed to process journal", err);
      });
    }, 2e3);
    runtimeDisposables.push({ dispose: () => clearInterval(journalPollingInterval) });
  }
  await updateAiContextAfterSyncInitialization(context, client, health.version);
}
async function reinitializeSyncManager(context, options = {}) {
  if (!syncManager) return;
  if (initializingPromise) {
    await initializingPromise;
    return;
  }
  outputChannel.appendLine("[n8n] Reinitializing with new settings...");
  try {
    syncManager.removeAllListeners();
    initializingPromise = initializeSyncManager(context);
    await initializingPromise;
    enhancedTreeProvider.setExtensionState("initialized" /* INITIALIZED */);
    updateContextKeys();
    enhancedTreeProvider.refresh();
    if (!options.silent) {
      vscode18.window.showInformationMessage("\u2705 n8n settings updated successfully.");
    }
  } catch (error) {
    failedAutoInitRuntimeSignature = configurationController?.getSnapshot()?.runtimeSignature;
    failedAutoInitConnectionKey = getAutoInitConnectionKey(getWorkspaceRoot());
    outputChannel.appendLine(`[n8n] Failed to reinitialize: ${error.message}`);
    enhancedTreeProvider.setExtensionState("error" /* ERROR */, error.message);
    updateContextKeys();
    if (!options.silent) {
      vscode18.window.showErrorMessage(`Failed to update settings: ${error.message}`);
    }
  } finally {
    initializingPromise = void 0;
  }
}
async function deactivate() {
  await telemetryClient?.flush(1e3);
  agentRuntimeController?.dispose();
  agentRuntimeController = void 0;
  disposeRuntimeDisposables();
  proxyService.stop();
}
export {
  activate,
  deactivate
};
//# sourceMappingURL=extension-runtime.mjs.map
