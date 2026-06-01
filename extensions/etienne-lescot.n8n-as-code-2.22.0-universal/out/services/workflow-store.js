"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectArchiveFilter = exports.selectSyncState = exports.selectConflicts = exports.selectWorkflowById = exports.selectAllWorkflows = exports.clearConflicts = exports.removeConflict = exports.addConflict = exports.setArchiveFilter = exports.setError = exports.setSyncing = exports.setWatching = exports.setMode = exports.removeWorkflow = exports.upsertWorkflow = exports.updateWorkflow = exports.setWorkflows = exports.store = exports.loadWorkflows = void 0;
exports.setSyncManager = setSyncManager;
exports.clearSyncManager = clearSyncManager;
const toolkit_1 = require("@reduxjs/toolkit");
// ============================================================================
// Workflows Slice
// ============================================================================
const workflowsSlice = (0, toolkit_1.createSlice)({
    name: 'workflows',
    initialState: {
        byId: {},
        allIds: [],
        lastSync: 0,
    },
    reducers: {
        // Replace all workflows (from full sync)
        setWorkflows: (state, action) => {
            state.byId = {};
            state.allIds = [];
            action.payload.forEach(wf => {
                // Use filename as key for workflows without ID (newly created locally)
                const key = wf.id || `file:${wf.filename}`;
                state.byId[key] = wf;
                state.allIds.push(key);
            });
            state.lastSync = Date.now();
        },
        // Update single workflow
        updateWorkflow: (state, action) => {
            const { id, updates } = action.payload;
            // Try both ID and filename-based keys
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
            // Try to find by ID or filename-based key
            delete state.byId[id];
            // Also try filename-based key pattern
            const fileKey = Object.keys(state.byId).find(k => k.startsWith('file:') && state.byId[k].id === id);
            if (fileKey)
                delete state.byId[fileKey];
            state.allIds = state.allIds.filter(wfId => wfId !== id && wfId !== fileKey);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(exports.loadWorkflows.fulfilled, (state, action) => {
            state.byId = {};
            state.allIds = [];
            action.payload.forEach((wf) => {
                const key = wf.id || `file:${wf.filename}`;
                state.byId[key] = wf;
                state.allIds.push(key);
            });
            state.lastSync = Date.now();
        });
    },
});
// ============================================================================
// Sync Slice
// ============================================================================
const syncSlice = (0, toolkit_1.createSlice)({
    name: 'sync',
    initialState: {
        mode: 'auto',
        isWatching: false,
        isSyncing: false,
        lastError: null,
        archiveFilter: 'workflows',
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
        },
    },
});
// ============================================================================
// Conflicts Slice
// ============================================================================
const conflictsSlice = (0, toolkit_1.createSlice)({
    name: 'conflicts',
    initialState: {
        byWorkflowId: {},
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
        },
    },
});
// ============================================================================
// Async Thunks (for SyncManager integration)
// ============================================================================
// Store reference to SyncManager (set from extension.ts)
let syncManagerRef = null;
function setSyncManager(manager) {
    syncManagerRef = manager;
}
function clearSyncManager() {
    syncManagerRef = null;
}
// Load workflows from SyncManager
exports.loadWorkflows = (0, toolkit_1.createAsyncThunk)('workflows/load', async (_, { getState }) => {
    if (!syncManagerRef)
        throw new Error('SyncManager not initialized');
    const state = exports.store.getState();
    const filter = state.sync.archiveFilter;
    const options = {};
    if (filter === 'all')
        options.includeArchived = true;
    if (filter === 'archived')
        options.onlyArchived = true;
    return await syncManagerRef.listWorkflows(options);
});
// ============================================================================
// Store Configuration
// ============================================================================
exports.store = (0, toolkit_1.configureStore)({
    reducer: {
        workflows: workflowsSlice.reducer,
        sync: syncSlice.reducer,
        conflicts: conflictsSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        // Disable serialization check for large workflow objects
        serializableCheck: false,
    }),
});
// Export individual actions
_a = workflowsSlice.actions, exports.setWorkflows = _a.setWorkflows, exports.updateWorkflow = _a.updateWorkflow, exports.upsertWorkflow = _a.upsertWorkflow, exports.removeWorkflow = _a.removeWorkflow;
_b = syncSlice.actions, exports.setMode = _b.setMode, exports.setWatching = _b.setWatching, exports.setSyncing = _b.setSyncing, exports.setError = _b.setError, exports.setArchiveFilter = _b.setArchiveFilter;
_c = conflictsSlice.actions, exports.addConflict = _c.addConflict, exports.removeConflict = _c.removeConflict, exports.clearConflicts = _c.clearConflicts;
// Selectors
const selectAllWorkflows = (state) => state.workflows.allIds.map(key => state.workflows.byId[key]).filter(Boolean);
exports.selectAllWorkflows = selectAllWorkflows;
const selectWorkflowById = (state, id) => {
    // Try direct ID first, then try filename-based key
    return state.workflows.byId[id] ||
        Object.values(state.workflows.byId).find(wf => wf.id === id);
};
exports.selectWorkflowById = selectWorkflowById;
const selectConflicts = (state) => state.conflicts.byWorkflowId;
exports.selectConflicts = selectConflicts;
const selectSyncState = (state) => state.sync;
exports.selectSyncState = selectSyncState;
const selectArchiveFilter = (state) => state.sync.archiveFilter;
exports.selectArchiveFilter = selectArchiveFilter;
//# sourceMappingURL=workflow-store.js.map