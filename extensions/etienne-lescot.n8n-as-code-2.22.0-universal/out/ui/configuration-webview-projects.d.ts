type UiProject = {
    id: string;
    name: string;
    type?: string;
    detail?: string;
    displayName?: string;
};
type ManagerProjectFacade = {
    listProjects(input: {
        workspaceRoot?: string;
        instanceId?: string;
        syncFolderDefault: 'workspace';
        consumer: 'vscode';
        autoStart: true;
    }): Promise<Array<{
        id: string;
        name?: string;
        title?: string;
        displayName?: string;
        label?: string;
        type?: string;
    }>>;
};
export type ProjectsLoadedMessage = {
    type: 'projectsLoaded';
    scope: string;
    requestId: number;
    requestKey?: string;
    projects: UiProject[];
    selectedProjectId: string;
    selectedProjectName: string;
};
export declare function loadProjectsForConfigurationWebview(payload: Record<string, unknown>, options: {
    workspaceRoot?: string;
    workspaceFacade: ManagerProjectFacade;
    globalFacade: ManagerProjectFacade;
}): Promise<ProjectsLoadedMessage>;
export {};
//# sourceMappingURL=configuration-webview-projects.d.ts.map