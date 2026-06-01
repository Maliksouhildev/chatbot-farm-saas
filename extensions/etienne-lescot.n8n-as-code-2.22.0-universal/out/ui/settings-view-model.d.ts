export type Tone = 'ready' | 'started' | 'stopped' | 'installing' | 'warning' | 'error' | 'muted';
export interface SetupJobState {
    instanceId: string;
    instanceName?: string;
    status: 'installing' | 'succeeded' | 'failed' | 'cancelling' | 'cancelled';
    message?: string;
    error?: string;
    returnToEnvironmentForm?: boolean;
}
export interface ManagedStatus {
    label: string;
    tone: Tone;
    priority: number;
    message: string;
    canOpen: boolean;
    canCreateEnvironment: boolean;
    canCancel: boolean;
}
export interface InstanceLike {
    id: string;
    name?: string;
    mode?: string;
    host?: string;
    baseUrl?: string;
    displayUrl?: string;
    tunnelPublicUrl?: string;
    runtimeStatus?: string;
    runtimeReady?: boolean;
    runtimeBlockedCode?: string;
    runtimeBlockedMessage?: string;
    tunnelRunning?: boolean;
}
export interface EnvironmentLike {
    id: string;
    name?: string;
    environmentTargetId?: string;
    managedInstanceId?: string;
    sourceKind?: string;
    accessStatus?: string;
}
export interface TargetLike {
    id: string;
    name?: string;
    kind?: string;
    managedInstanceId?: string;
    url?: string;
    accessStatus?: string;
}
export declare function instanceDisplayType(instance: Pick<InstanceLike, 'mode'>): 'managed instance' | 'connected instance';
export declare function instanceUrl(instance: InstanceLike): string;
export declare function managedInstanceUiStatus(instance: InstanceLike | undefined, job?: SetupJobState): ManagedStatus;
export declare function environmentManagedInstanceStatus(env: EnvironmentLike, target: TargetLike | undefined, instances: InstanceLike[], jobs: Record<string, SetupJobState>): ManagedStatus | undefined;
export declare function environmentAccessBadge(accessStatus?: string): {
    label: string;
    tone: Tone;
} | undefined;
export interface InstanceChoice {
    value: string;
    label: string;
    group: 'Create' | 'Saved instances';
    mode: 'new-connected' | 'new-managed' | 'connected' | 'managed';
    instanceId?: string;
    targetId?: string;
    url?: string;
}
export declare function buildEnvironmentInstanceChoices(targets: TargetLike[], instances: InstanceLike[]): InstanceChoice[];
//# sourceMappingURL=settings-view-model.d.ts.map