import { IWorkflowStatus, SyncManager } from 'n8nac';
interface WorkflowsState {
    byId: Record<string, IWorkflowStatus>;
    allIds: string[];
    lastSync: number;
}
interface SyncState {
    mode: 'auto' | 'manual';
    isWatching: boolean;
    isSyncing: boolean;
    lastError: string | null;
    archiveFilter: 'workflows' | 'archived' | 'all';
}
interface ConflictsState {
    byWorkflowId: Record<string, {
        id: string;
        filename: string;
        remoteContent: any;
    }>;
}
export interface RootState {
    workflows: WorkflowsState;
    sync: SyncState;
    conflicts: ConflictsState;
}
export declare function setSyncManager(manager: SyncManager): void;
export declare function clearSyncManager(): void;
export declare const loadWorkflows: import("@reduxjs/toolkit").AsyncThunk<IWorkflowStatus[], void, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const store: import("@reduxjs/toolkit").EnhancedStore<{
    workflows: WorkflowsState;
    sync: SyncState;
    conflicts: ConflictsState;
}, import("redux").UnknownAction, import("@reduxjs/toolkit").Tuple<[import("redux").StoreEnhancer<{
    dispatch: import("redux-thunk").ThunkDispatch<{
        workflows: WorkflowsState;
        sync: SyncState;
        conflicts: ConflictsState;
    }, undefined, import("redux").UnknownAction>;
}>, import("redux").StoreEnhancer]>>;
export type AppDispatch = typeof store.dispatch;
export declare const setWorkflows: import("@reduxjs/toolkit").ActionCreatorWithPayload<IWorkflowStatus[], "workflows/setWorkflows">, updateWorkflow: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    id: string;
    updates: Partial<IWorkflowStatus>;
}, "workflows/updateWorkflow">, upsertWorkflow: import("@reduxjs/toolkit").ActionCreatorWithPayload<IWorkflowStatus, "workflows/upsertWorkflow">, removeWorkflow: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "workflows/removeWorkflow">;
export declare const setMode: import("@reduxjs/toolkit").ActionCreatorWithPayload<"auto" | "manual", "sync/setMode">, setWatching: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "sync/setWatching">, setSyncing: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "sync/setSyncing">, setError: import("@reduxjs/toolkit").ActionCreatorWithPayload<string | null, "sync/setError">, setArchiveFilter: import("@reduxjs/toolkit").ActionCreatorWithPayload<"workflows" | "archived" | "all", "sync/setArchiveFilter">;
export declare const addConflict: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    id: string;
    filename: string;
    remoteContent: any;
}, "conflicts/addConflict">, removeConflict: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "conflicts/removeConflict">, clearConflicts: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"conflicts/clearConflicts">;
export declare const selectAllWorkflows: (state: RootState) => IWorkflowStatus[];
export declare const selectWorkflowById: (state: RootState, id: string) => IWorkflowStatus | undefined;
export declare const selectConflicts: (state: RootState) => Record<string, {
    id: string;
    filename: string;
    remoteContent: any;
}>;
export declare const selectSyncState: (state: RootState) => SyncState;
export declare const selectArchiveFilter: (state: RootState) => "workflows" | "archived" | "all";
export {};
//# sourceMappingURL=workflow-store.d.ts.map