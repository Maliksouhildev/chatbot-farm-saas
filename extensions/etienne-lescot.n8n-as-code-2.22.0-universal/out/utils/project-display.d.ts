export type DisplayableProject = {
    id?: string;
    name?: string;
    type?: string;
};
export declare function getPersonalProjectOwner(project: DisplayableProject): string | undefined;
export declare function getProjectDisplayLabel(project: DisplayableProject): string;
export declare function getCanonicalProjectName(project: DisplayableProject): string;
export declare function getProjectDetail(project: DisplayableProject): string;
//# sourceMappingURL=project-display.d.ts.map