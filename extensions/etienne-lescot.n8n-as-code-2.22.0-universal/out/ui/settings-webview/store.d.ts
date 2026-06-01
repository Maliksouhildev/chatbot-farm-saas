import type { SetupJobState } from '../settings-view-model.js';
export type ModalState = {
    kind: 'environment';
    environmentId?: string;
    managedInstanceId?: string;
} | {
    kind: 'managed-form';
    returnToEnvironmentForm?: boolean;
    returnToEnvironmentDraftId?: string;
} | {
    kind: 'managed-detail';
    instanceId: string;
} | undefined;
export interface EnvironmentDraft {
    id: string;
    environmentId?: string;
    name: string;
    instanceChoice: string;
    instanceId?: string;
    environmentTargetId?: string;
    url: string;
    apiKey: string;
    apiKeyAvailable?: boolean;
    projectId: string;
    projectName: string;
    workflowsPath: string;
    folderSync: boolean;
    customNodesPath: string;
    description: string;
    dirty: boolean;
    projectsLoading?: boolean;
    projects?: Array<{
        id: string;
        name: string;
        type?: string;
        detail?: string;
        displayName?: string;
    }>;
    projectError?: string;
    projectRequestKey?: string;
}
export interface ManagedDraft {
    name: string;
    tunnel: boolean;
}
interface UiState {
    activeTab: 'environments' | 'managed-instances' | 'agent-providers' | 'about';
    modal?: ModalState;
    notice?: {
        tone: 'info' | 'error';
        message: string;
    };
    credentials?: {
        username: string;
        password: string;
    };
    pendingActiveEnvironmentId?: string;
    pendingEnvironmentSaves: Record<string, boolean>;
    pendingManagedCreate: boolean;
    pendingInstanceActions: Record<string, string>;
    pendingProviderActions: Record<string, string>;
    lastStateVersion: number;
}
interface DraftState {
    environment: Record<string, EnvironmentDraft>;
    managed: ManagedDraft;
}
export declare const actions: {
    environmentDraftOpened: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
        id: string;
        environment?: any;
    }, "drafts/environmentDraftOpened">;
    environmentDraftPatched: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
        id: string;
        patch: Partial<EnvironmentDraft>;
    }, "drafts/environmentDraftPatched">;
    environmentDraftProjectsReceived: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
        id: string;
        requestKey?: string;
        projects?: Array<{
            id: string;
            name: string;
            type?: string;
            detail?: string;
            displayName?: string;
        }>;
        selectedProjectId?: string;
        selectedProjectName?: string;
        error?: string;
    }, "drafts/environmentDraftProjectsReceived">;
    environmentDraftProjectsLoading: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
        id: string;
        requestKey?: string;
    }, "drafts/environmentDraftProjectsLoading">;
    environmentDraftClosed: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
        id: string;
    }, "drafts/environmentDraftClosed">;
    managedDraftPatched: import("@reduxjs/toolkit").ActionCreatorWithPayload<Partial<ManagedDraft>, "drafts/managedDraftPatched">;
    managedDraftReset: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"drafts/managedDraftReset">;
    managedInstanceSelectedForEnvironment: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
        draftId: string;
        instanceId: string;
    }, "drafts/managedInstanceSelectedForEnvironment">;
    tabSelected: import("@reduxjs/toolkit").ActionCreatorWithPayload<"environments" | "agent-providers" | "managed-instances" | "about", "ui/tabSelected">;
    modalOpened: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<ModalState, "ui/modalOpened">;
    modalClosed: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/modalClosed">;
    noticeShown: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<{
        tone: "info" | "error";
        message: string;
    } | undefined, "ui/noticeShown">;
    environmentActivationRequested: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/environmentActivationRequested">;
    environmentSaveRequested: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/environmentSaveRequested">;
    managedCreateRequested: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/managedCreateRequested">;
    instanceActionRequested: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
        instanceId: string;
        action: string;
    }, "ui/instanceActionRequested">;
    instanceActionCompleted: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/instanceActionCompleted">;
    providerActionRequested: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
        provider: string;
        action: string;
    }, "ui/providerActionRequested">;
    providerActionCompleted: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/providerActionCompleted">;
    credentialsReceived: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
        username: string;
        password: string;
    }, "ui/credentialsReceived">;
    jobsReceived: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<Record<string, SetupJobState> | undefined, "jobs/jobsReceived">;
    jobReceived: import("@reduxjs/toolkit").ActionCreatorWithPayload<SetupJobState, "jobs/jobReceived">;
    snapshotReceived: import("@reduxjs/toolkit").ActionCreatorWithPayload<any, "server/snapshotReceived">;
    managedInstancePlaceholderReceived: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
        instanceId: string;
        instanceName?: string;
    }, "server/managedInstancePlaceholderReceived">;
    environmentPinned: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "server/environmentPinned">;
    environmentDeleted: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "server/environmentDeleted">;
    environmentSaved: import("@reduxjs/toolkit").ActionCreatorWithPayload<any, "server/environmentSaved">;
    instanceDeleted: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "server/instanceDeleted">;
};
export declare function createSettingsWebviewStore(): import("@reduxjs/toolkit").EnhancedStore<{
    server: any;
    jobs: Record<string, SetupJobState>;
    ui: UiState;
    drafts: DraftState;
}, import("redux").UnknownAction, import("@reduxjs/toolkit").Tuple<[import("redux").StoreEnhancer<{
    dispatch: import("redux-thunk").ThunkDispatch<{
        server: any;
        jobs: Record<string, SetupJobState>;
        ui: UiState;
        drafts: DraftState;
    }, undefined, import("redux").UnknownAction>;
}>, import("redux").StoreEnhancer]>>;
export declare const store: import("@reduxjs/toolkit").EnhancedStore<{
    server: any;
    jobs: Record<string, SetupJobState>;
    ui: UiState;
    drafts: DraftState;
}, import("redux").UnknownAction, import("@reduxjs/toolkit").Tuple<[import("redux").StoreEnhancer<{
    dispatch: import("redux-thunk").ThunkDispatch<{
        server: any;
        jobs: Record<string, SetupJobState>;
        ui: UiState;
        drafts: DraftState;
    }, undefined, import("redux").UnknownAction>;
}>, import("redux").StoreEnhancer]>>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export {};
//# sourceMappingURL=store.d.ts.map