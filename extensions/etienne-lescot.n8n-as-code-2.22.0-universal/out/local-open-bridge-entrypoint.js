"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/@n8n-as-code/n8n-manager-core/dist/index.js
var import_node_child_process3 = require("node:child_process");
var import_node_util3 = require("node:util");

// ../../node_modules/@n8n-as-code/n8n-manager-core/dist/configuration-service.js
var import_node_crypto = __toESM(require("node:crypto"), 1);
var import_node_fs = __toESM(require("node:fs"), 1);
var import_node_os = __toESM(require("node:os"), 1);
var import_node_path = __toESM(require("node:path"), 1);
var DEFAULT_WORKSPACE_CONFIG = "n8nac-config.json";
function resolveN8nManagerHome() {
  const configuredHome = process.env.N8N_MANAGER_HOME?.trim();
  if (configuredHome) {
    return import_node_path.default.resolve(configuredHome);
  }
  const configuredStatePath = process.env.N8N_MANAGER_STATE_PATH?.trim();
  if (configuredStatePath) {
    return import_node_path.default.dirname(import_node_path.default.resolve(configuredStatePath));
  }
  return import_node_path.default.join(import_node_os.default.homedir(), ".n8n-manager");
}
function getDefaultN8nManagerSyncFolder(baseDir = resolveN8nManagerHome()) {
  return import_node_path.default.join(baseDir, "workflows");
}
var N8nConfigurationService = class {
  baseDir;
  instancesPath;
  secretsPath;
  workspaceConfigName;
  constructor(options = {}) {
    this.baseDir = import_node_path.default.resolve(options.baseDir ?? resolveN8nManagerHome());
    this.instancesPath = import_node_path.default.resolve(options.instancesPath ?? import_node_path.default.join(this.baseDir, "instances.json"));
    this.secretsPath = import_node_path.default.resolve(options.secretsPath ?? import_node_path.default.join(this.baseDir, "secrets.json"));
    this.workspaceConfigName = options.workspaceConfigName ?? DEFAULT_WORKSPACE_CONFIG;
  }
  getGlobalConfig() {
    return this.readGlobalConfig();
  }
  listInstances() {
    return this.readGlobalConfig().instances;
  }
  getInstance(instanceId) {
    return this.listInstances().find((instance) => instance.id === instanceId);
  }
  getGlobalActiveInstance() {
    const config = this.readGlobalConfig();
    return config.activeInstanceId ? config.instances.find((instance) => instance.id === config.activeInstanceId) : void 0;
  }
  upsertInstance(input, options = {}) {
    const config = this.readGlobalConfig();
    const existing = input.id ? config.instances.find((instance2) => instance2.id === input.id) : void 0;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const baseUrl = cleanString(input.baseUrl ?? input.host ?? existing?.baseUrl);
    const id = cleanString(input.id ?? existing?.id) ?? createInstanceId(baseUrl ?? input.name);
    const hasTunnelPublicUrlInput = Object.prototype.hasOwnProperty.call(input, "tunnelPublicUrl");
    const hasTunnelTargetUrlInput = Object.prototype.hasOwnProperty.call(input, "tunnelTargetUrl");
    const hasTunnelPidInput = Object.prototype.hasOwnProperty.call(input, "tunnelPid");
    const hasTunnelErrorInput = Object.prototype.hasOwnProperty.call(input, "tunnelLastError");
    const hasTunnelNextRetryAtInput = Object.prototype.hasOwnProperty.call(input, "tunnelNextRetryAt");
    const mode = input.mode ?? existing?.mode ?? "existing";
    const instance = {
      id,
      name: cleanString(input.name ?? existing?.name) ?? createDefaultInstanceName(baseUrl),
      mode,
      baseUrl,
      provider: input.provider ?? existing?.provider ?? providerForMode(mode),
      instanceIdentifier: cleanString(input.instanceIdentifier ?? existing?.instanceIdentifier),
      verification: input.verification ?? existing?.verification,
      defaultProject: input.defaultProject ?? existing?.defaultProject,
      runtimeStatePath: cleanString(input.runtimeStatePath ?? existing?.runtimeStatePath),
      apiKeyRef: input.apiKey || existing?.apiKeyAvailable ? `n8n-manager:instance:${id}` : existing?.apiKeyRef,
      apiKeyAvailable: Boolean(input.apiKey) || Boolean(existing?.apiKeyAvailable),
      publicUrlEnabled: input.publicUrlEnabled ?? existing?.publicUrlEnabled ?? false,
      desiredState: input.desiredState ?? existing?.desiredState ?? (mode === "managed-local-docker" ? "running" : void 0),
      tunnelPublicUrl: cleanString(hasTunnelPublicUrlInput ? input.tunnelPublicUrl : existing?.tunnelPublicUrl),
      tunnelTargetUrl: cleanString(hasTunnelTargetUrlInput ? input.tunnelTargetUrl : existing?.tunnelTargetUrl),
      tunnelPid: hasTunnelPidInput ? typeof input.tunnelPid === "number" ? input.tunnelPid : void 0 : existing?.tunnelPid,
      tunnelLastAttemptAt: cleanString(input.tunnelLastAttemptAt ?? existing?.tunnelLastAttemptAt),
      tunnelLastError: cleanString(hasTunnelErrorInput ? input.tunnelLastError : existing?.tunnelLastError),
      tunnelNextRetryAt: cleanString(hasTunnelNextRetryAtInput ? input.tunnelNextRetryAt : existing?.tunnelNextRetryAt),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      metadata: input.metadata ?? existing?.metadata
    };
    const instances = [
      ...config.instances.filter((candidate) => candidate.id !== id),
      stripUndefined(instance)
    ].sort((left, right) => left.name.localeCompare(right.name));
    const next = {
      ...config,
      activeInstanceId: options.setActive === false ? config.activeInstanceId ?? id : id,
      instances
    };
    this.writeGlobalConfig(next);
    if (input.apiKey) {
      this.saveApiKey(id, input.apiKey);
    }
    return stripUndefined(instance);
  }
  upsertInstanceFromLifecycle(instance, options = {}) {
    return this.upsertInstance({
      id: instance.id,
      name: options.name,
      mode: instance.mode,
      baseUrl: instance.baseUrl,
      provider: instance.provider,
      runtimeStatePath: instance.runtimeStatePath ?? (instance.mode === "managed-local-docker" ? this.getRuntimeStatePath(instance.id) : void 0),
      apiKey: options.apiKey ?? instance.apiKey,
      apiKeyRef: instance.apiKeyRef,
      publicUrlEnabled: instance.publicUrlEnabled,
      desiredState: instance.desiredState,
      tunnelPublicUrl: instance.tunnelPublicUrl,
      tunnelTargetUrl: instance.tunnelTargetUrl,
      tunnelPid: instance.tunnelPid,
      tunnelLastAttemptAt: instance.tunnelLastAttemptAt,
      tunnelLastError: instance.tunnelLastError,
      tunnelNextRetryAt: instance.tunnelNextRetryAt,
      metadata: stripUndefined({
        containerName: instance.containerName,
        volumeName: instance.volumeName,
        image: instance.image,
        databaseType: instance.databaseType,
        databasePath: instance.databasePath
      })
    }, { setActive: options.setActive });
  }
  deleteInstance(instanceId) {
    const config = this.readGlobalConfig();
    const deletedInstance = config.instances.find((instance) => instance.id === instanceId);
    if (!deletedInstance) {
      throw new Error(`Unknown n8n instance: ${instanceId}`);
    }
    const instances = config.instances.filter((instance) => instance.id !== instanceId);
    const activeInstanceId = config.activeInstanceId === instanceId ? instances[0]?.id : config.activeInstanceId;
    this.writeGlobalConfig({ ...config, instances, activeInstanceId });
    this.deleteApiKey(instanceId);
    return {
      deletedInstance,
      activeInstance: activeInstanceId ? instances.find((instance) => instance.id === activeInstanceId) : void 0
    };
  }
  setGlobalActiveInstance(instanceId) {
    const config = this.readGlobalConfig();
    const instance = config.instances.find((candidate) => candidate.id === instanceId);
    if (!instance) {
      throw new Error(`Unknown n8n instance: ${instanceId}`);
    }
    this.writeGlobalConfig({ ...config, activeInstanceId: instance.id });
    return instance;
  }
  setDefaultSyncFolder(syncFolder) {
    const config = this.readGlobalConfig();
    const defaultSyncFolder = import_node_path.default.resolve(syncFolder);
    const next = { ...config, defaultSyncFolder };
    this.writeGlobalConfig(next);
    return next;
  }
  setInstanceDefaultProject(instanceId, project) {
    const instance = this.getInstance(instanceId);
    if (!instance) {
      throw new Error(`Unknown n8n instance: ${instanceId}`);
    }
    return this.upsertInstance({ ...instance, defaultProject: project }, { setActive: false });
  }
  clearInstanceTunnel(instanceId) {
    const config = this.readGlobalConfig();
    const instance = config.instances.find((candidate) => candidate.id === instanceId);
    if (!instance) {
      throw new Error(`Unknown n8n instance: ${instanceId}`);
    }
    const nextInstance = stripUndefined({
      ...instance,
      tunnelPublicUrl: void 0,
      tunnelTargetUrl: void 0,
      tunnelPid: void 0,
      tunnelLastAttemptAt: void 0,
      tunnelLastError: void 0,
      tunnelNextRetryAt: void 0,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    const instances = config.instances.map((candidate) => candidate.id === instanceId ? nextInstance : candidate);
    this.writeGlobalConfig({ ...config, instances });
    return nextInstance;
  }
  readWorkspaceOverrides(workspaceRoot) {
    const configPath = this.getWorkspaceConfigPath(workspaceRoot);
    if (!import_node_fs.default.existsSync(configPath)) {
      return { version: 3 };
    }
    const parsed = JSON.parse(import_node_fs.default.readFileSync(configPath, "utf8"));
    return normalizeWorkspaceOverrides(parsed, configPath);
  }
  writeWorkspaceOverrides(workspaceRoot, overrides) {
    const configPath = this.getWorkspaceConfigPath(workspaceRoot);
    const next = sanitizeWorkspaceOverrides({ version: 3, ...overrides });
    import_node_fs.default.mkdirSync(import_node_path.default.dirname(configPath), { recursive: true });
    import_node_fs.default.writeFileSync(configPath, `${JSON.stringify(next, null, 2)}
`);
    return next;
  }
  clearWorkspaceOverrides(workspaceRoot) {
    import_node_fs.default.rmSync(this.getWorkspaceConfigPath(workspaceRoot), { force: true });
  }
  resolveEffectiveContext(input = {}) {
    const globalConfig = this.readGlobalConfig();
    const workspace = input.workspaceRoot ? this.readWorkspaceOverrides(input.workspaceRoot) : { version: 3 };
    const requestedInstanceId = cleanString(input.instanceId);
    const workspaceInstanceId = cleanString(workspace.activeInstanceId);
    const globalInstanceId = cleanString(globalConfig.activeInstanceId);
    const activeInstanceId = requestedInstanceId ?? workspaceInstanceId ?? globalInstanceId;
    if (!activeInstanceId) {
      throw new Error("No active n8n instance is configured. Run `n8n-manager instances add` first.");
    }
    const instance = globalConfig.instances.find((candidate) => candidate.id === activeInstanceId);
    if (!instance) {
      throw new Error(`Active n8n instance "${activeInstanceId}" does not exist in the global n8n-manager store.`);
    }
    const apiBaseUrl = resolveInstanceApiBaseUrl(instance);
    if (!apiBaseUrl) {
      throw new Error(`n8n instance "${instance.name}" has no base URL configured.`);
    }
    const publicBaseUrl = resolveInstancePublicBaseUrl(instance);
    const workspaceSyncFolder = cleanString(workspace.syncFolder);
    const syncFolderDefault = input.syncFolderDefault ?? "global";
    const syncFolder = workspaceSyncFolder ? input.workspaceRoot ? resolveWorkspacePath(input.workspaceRoot, workspaceSyncFolder) : workspaceSyncFolder : syncFolderDefault === "workspace" && input.workspaceRoot ? import_node_path.default.join(input.workspaceRoot, "workflows") : globalConfig.defaultSyncFolder;
    const projectId = cleanString(workspace.projectId) ?? instance.defaultProject?.id;
    const projectName = cleanString(workspace.projectName) ?? instance.defaultProject?.name;
    if (input.requireProject && (!projectId || !projectName)) {
      throw new Error(`No n8n project is configured for instance "${instance.name}". Select a project for this workspace or set an instance default project.`);
    }
    return {
      instance,
      activeInstanceId: instance.id,
      activeInstanceName: instance.name,
      apiBaseUrl,
      publicBaseUrl,
      host: apiBaseUrl,
      baseUrl: apiBaseUrl,
      apiKey: this.getApiKey(instance.id),
      syncFolder,
      projectId,
      projectName,
      instanceIdentifier: instance.instanceIdentifier,
      folderSync: workspace.folderSync ?? false,
      customNodesPath: workspace.customNodesPath,
      sources: {
        instance: requestedInstanceId ? "explicit" : workspaceInstanceId ? "workspace" : "global",
        syncFolder: workspaceSyncFolder ? "workspace" : syncFolderDefault === "workspace" && input.workspaceRoot ? "workspace-default" : "global",
        project: workspace.projectId || workspace.projectName ? "workspace" : instance.defaultProject ? "global" : "missing"
      }
    };
  }
  getApiKey(instanceId) {
    return this.readSecrets().instanceApiKeys[instanceId];
  }
  saveApiKey(instanceId, apiKey) {
    const secrets = this.readSecrets();
    secrets.instanceApiKeys[instanceId] = apiKey;
    this.writeSecrets(secrets);
  }
  deleteApiKey(instanceId) {
    const secrets = this.readSecrets();
    if (!(instanceId in secrets.instanceApiKeys)) {
      return;
    }
    delete secrets.instanceApiKeys[instanceId];
    this.writeSecrets(secrets);
  }
  getWorkspaceConfigPath(workspaceRoot) {
    return import_node_path.default.join(import_node_path.default.resolve(workspaceRoot), this.workspaceConfigName);
  }
  getRuntimeStatePath(instanceId) {
    return import_node_path.default.join(this.baseDir, "runtime", `${safeFileName(instanceId)}.json`);
  }
  readGlobalConfig() {
    if (!import_node_fs.default.existsSync(this.instancesPath)) {
      return {
        version: 1,
        defaultSyncFolder: getDefaultN8nManagerSyncFolder(this.baseDir),
        instances: []
      };
    }
    const parsed = JSON.parse(import_node_fs.default.readFileSync(this.instancesPath, "utf8"));
    const instances = Array.isArray(parsed.instances) ? parsed.instances.map(sanitizeInstance) : [];
    const activeInstanceId = typeof parsed.activeInstanceId === "string" && instances.some((instance) => instance.id === parsed.activeInstanceId) ? parsed.activeInstanceId : instances[0]?.id;
    return {
      version: 1,
      activeInstanceId,
      defaultSyncFolder: cleanString(parsed.defaultSyncFolder) ?? getDefaultN8nManagerSyncFolder(this.baseDir),
      instances
    };
  }
  writeGlobalConfig(config) {
    import_node_fs.default.mkdirSync(import_node_path.default.dirname(this.instancesPath), { recursive: true });
    import_node_fs.default.writeFileSync(this.instancesPath, `${JSON.stringify(stripUndefined(config), null, 2)}
`);
  }
  readSecrets() {
    if (!import_node_fs.default.existsSync(this.secretsPath)) {
      return { version: 1, instanceApiKeys: {} };
    }
    const parsed = JSON.parse(import_node_fs.default.readFileSync(this.secretsPath, "utf8"));
    return {
      version: 1,
      instanceApiKeys: parsed.instanceApiKeys && typeof parsed.instanceApiKeys === "object" ? Object.fromEntries(Object.entries(parsed.instanceApiKeys).filter(([, value]) => typeof value === "string")) : {}
    };
  }
  writeSecrets(secrets) {
    import_node_fs.default.mkdirSync(import_node_path.default.dirname(this.secretsPath), { recursive: true });
    import_node_fs.default.writeFileSync(this.secretsPath, `${JSON.stringify(secrets, null, 2)}
`, { mode: 384 });
    try {
      import_node_fs.default.chmodSync(this.secretsPath, 384);
    } catch {
    }
  }
};
function normalizeWorkspaceOverrides(raw, configPath) {
  if (!raw || typeof raw !== "object") {
    throw new Error(`Invalid n8n workspace config at ${configPath}. Recreate it with the version 3 workspace override format.`);
  }
  const source = raw;
  if (Array.isArray(source.instances) || source.version !== 3) {
    throw new Error(`Unsupported legacy n8n workspace config at ${configPath}. Reconfigure this workspace with the version 3 override format.`);
  }
  return sanitizeWorkspaceOverrides(source);
}
function sanitizeWorkspaceOverrides(source) {
  return stripUndefined({
    version: 3,
    activeInstanceId: cleanString(source.activeInstanceId),
    syncFolder: cleanString(source.syncFolder),
    projectId: cleanString(source.projectId),
    projectName: cleanString(source.projectName),
    folderSync: typeof source.folderSync === "boolean" ? source.folderSync : void 0,
    customNodesPath: cleanString(source.customNodesPath)
  });
}
function sanitizeInstance(source) {
  const id = cleanString(source.id) ?? createInstanceId(source.baseUrl ?? source.name);
  return stripUndefined({
    id,
    name: cleanString(source.name) ?? createDefaultInstanceName(source.baseUrl),
    mode: source.mode ?? "existing",
    baseUrl: cleanString(source.baseUrl),
    provider: source.provider ?? providerForMode(source.mode ?? "existing"),
    instanceIdentifier: cleanString(source.instanceIdentifier),
    verification: source.verification,
    defaultProject: source.defaultProject?.id && source.defaultProject.name ? { id: source.defaultProject.id, name: source.defaultProject.name } : void 0,
    runtimeStatePath: cleanString(source.runtimeStatePath),
    apiKeyRef: cleanString(source.apiKeyRef),
    apiKeyAvailable: Boolean(source.apiKeyAvailable),
    publicUrlEnabled: typeof source.publicUrlEnabled === "boolean" ? source.publicUrlEnabled : void 0,
    desiredState: source.desiredState === "stopped" ? "stopped" : source.mode === "managed-local-docker" ? "running" : void 0,
    tunnelPublicUrl: cleanString(source.tunnelPublicUrl ?? readMetadataString(source.metadata, "tunnelPublicUrl")),
    tunnelTargetUrl: cleanString(source.tunnelTargetUrl ?? readMetadataString(source.metadata, "tunnelTargetUrl")),
    tunnelPid: typeof source.tunnelPid === "number" ? source.tunnelPid : readMetadataNumber(source.metadata, "tunnelPid"),
    tunnelLastAttemptAt: cleanString(source.tunnelLastAttemptAt),
    tunnelLastError: cleanString(source.tunnelLastError),
    tunnelNextRetryAt: cleanString(source.tunnelNextRetryAt),
    createdAt: cleanString(source.createdAt),
    updatedAt: cleanString(source.updatedAt),
    metadata: source.metadata
  });
}
function providerForMode(mode) {
  if (mode === "managed-local-docker")
    return "docker";
  if (mode === "existing")
    return "external";
  return "none";
}
function createInstanceId(seed) {
  const prefix = seed ? safeFileName(seed).slice(0, 32) : "instance";
  return `${prefix || "instance"}-${import_node_crypto.default.randomUUID().slice(0, 8)}`;
}
function createDefaultInstanceName(baseUrl) {
  if (!baseUrl) {
    return "n8n instance";
  }
  try {
    return new URL(baseUrl).host;
  } catch {
    return baseUrl;
  }
}
function cleanString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function resolveWorkspacePath(workspaceRoot, targetPath) {
  return import_node_path.default.isAbsolute(targetPath) ? targetPath : import_node_path.default.resolve(workspaceRoot, targetPath);
}
function resolveInstanceApiBaseUrl(instance) {
  return cleanString(instance.baseUrl) ?? cleanString(instance.tunnelPublicUrl);
}
function resolveInstancePublicBaseUrl(instance) {
  return cleanString(instance.tunnelPublicUrl);
}
function readMetadataString(metadata, key) {
  if (!metadata || typeof metadata !== "object") {
    return void 0;
  }
  return cleanString(metadata[key]);
}
function readMetadataNumber(metadata, key) {
  if (!metadata || typeof metadata !== "object") {
    return void 0;
  }
  const value = metadata[key];
  return typeof value === "number" ? value : void 0;
}
function safeFileName(value) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "instance";
}
function stripUndefined(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== void 0));
}

// ../../node_modules/@n8n-as-code/n8n-manager-core/dist/cloudflared.js
var import_node_child_process = require("node:child_process");
var import_node_util = require("node:util");
var execFileAsync = (0, import_node_util.promisify)(import_node_child_process.execFile);

// ../../node_modules/@n8n-as-code/n8n-manager-core/dist/agent-tooling.js
var import_node_fs2 = __toESM(require("node:fs"), 1);
var import_node_http = require("node:http");
var import_node_path2 = __toESM(require("node:path"), 1);

// ../../node_modules/@n8n-as-code/n8n-manager-core/dist/process-utils.js
var import_node_child_process2 = require("node:child_process");
var import_node_util2 = require("node:util");
var execFileAsync2 = (0, import_node_util2.promisify)(import_node_child_process2.execFile);

// ../../node_modules/@n8n-as-code/n8n-manager-core/dist/agent-tooling.js
var LOCAL_BRIDGE_HOST = "127.0.0.1";
var DEFAULT_LOCAL_BRIDGE_PORT = 3791;
var TUNNEL_RETRY_COOLDOWN_MS = 10 * 60 * 1e3;
var serverPromise;
var server;
var activePort = DEFAULT_LOCAL_BRIDGE_PORT;
async function ensureLocalN8nAuthBridgeRunningInProcess() {
  const existing = getActiveLocalOpenBridgeState();
  if (existing && existing.pid !== process.pid) {
    activePort = existing.port;
    return existing;
  }
  if (serverPromise) {
    await serverPromise;
    return getActiveLocalOpenBridgeState() ?? { port: activePort, pid: process.pid, startedAt: (/* @__PURE__ */ new Date()).toISOString() };
  }
  serverPromise = new Promise((resolve, reject) => {
    const tryListen = (port) => {
      const nextServer = (0, import_node_http.createServer)((request, response) => {
        void handleBridgeRequest(request, response);
      });
      nextServer.once("error", (error) => {
        server = void 0;
        if (error.code === "EADDRINUSE" && port !== 0) {
          tryListen(0);
          return;
        }
        serverPromise = void 0;
        reject(error);
      });
      nextServer.listen(port, LOCAL_BRIDGE_HOST, () => {
        const address = nextServer.address();
        activePort = typeof address === "object" && address ? address.port : port;
        server = nextServer;
        saveLocalOpenBridgeState({
          port: activePort,
          pid: process.pid,
          startedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        resolve();
      });
    };
    tryListen(DEFAULT_LOCAL_BRIDGE_PORT);
  });
  await serverPromise;
  return getActiveLocalOpenBridgeState() ?? { port: activePort, pid: process.pid, startedAt: (/* @__PURE__ */ new Date()).toISOString() };
}
function buildManagedN8nWorkflowOpenPage(input) {
  const pageTitle = escapeHtml(`Open ${input.targetUrl}`);
  const escapedTargetUrl = escapeHtml(input.targetUrl);
  const escapedLoginUrl = escapeHtml(input.loginUrl);
  const escapedEmail = escapeHtml(input.credentials.email);
  const escapedPassword = escapeHtml(input.credentials.password);
  const encodedTargetUrl = JSON.stringify(input.targetUrl);
  const encodedLoginUrl = JSON.stringify(input.loginUrl);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${pageTitle}</title>
    <style>
      :root { color-scheme: dark; --bg: #101418; --panel: #171d23; --text: #eef3f7; --muted: #9aa7b3; --accent: #ff6d5a; --accent-strong: #ff8d6b; --border: rgba(255,255,255,0.08); }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: var(--bg); color: var(--text); font: 16px/1.5 ui-sans-serif, system-ui, sans-serif; }
      .panel { width: min(680px, calc(100vw - 32px)); background: var(--panel); border: 1px solid var(--border); border-radius: 18px; padding: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.35); }
      h1 { margin: 0 0 8px; font-size: 24px; }
      p { margin: 0 0 14px; color: var(--muted); }
      .status { margin: 18px 0; padding: 12px 14px; border-radius: 12px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); }
      .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 18px; }
      a, button { appearance: none; border: 0; border-radius: 999px; padding: 10px 16px; font: inherit; cursor: pointer; text-decoration: none; }
      .primary { background: linear-gradient(135deg, var(--accent), var(--accent-strong)); color: #111; font-weight: 700; }
      .secondary { background: rgba(255,255,255,0.06); color: var(--text); }
      .secret { margin-top: 16px; padding: 14px; border-radius: 12px; border: 1px solid var(--border); background: rgba(0,0,0,0.18); }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; word-break: break-all; }
      .hidden { display: none; }
    </style>
  </head>
  <body>
    <main class="panel">
      <h1>Opening n8n workflow</h1>
      <p>n8n-manager is signing you into n8n, then opening the workflow.</p>
      <div class="status" id="status">Signing in...</div>
      <div class="actions">
        <button class="primary" type="button" id="continue">Continue</button>
        <a class="secondary hidden" href="${escapedTargetUrl}" id="open-link">Open workflow directly</a>
        <button class="secondary" type="button" id="show-creds">Show credentials</button>
      </div>
      <section class="secret hidden" id="credentials">
        <p>Email<br /><code>${escapedEmail}</code></p>
        <p>Password<br /><code>${escapedPassword}</code></p>
      </section>
      <form id="login-form" method="post" action="${escapedLoginUrl}" target="n8n-manager-login-window" style="display:none">
        <input type="hidden" name="emailOrLdapLoginId" value="${escapedEmail}" />
        <input type="hidden" name="password" value="${escapedPassword}" />
      </form>
    </main>
    <script>
      (function() {
        var form = document.getElementById('login-form');
        var status = document.getElementById('status');
        var creds = document.getElementById('credentials');
        var btn = document.getElementById('show-creds');
        var continueBtn = document.getElementById('continue');
        var openLink = document.getElementById('open-link');
        var targetUrl = ${encodedTargetUrl};
        var helperWindow = null;

        btn && btn.addEventListener('click', function() { creds && creds.classList.remove('hidden'); });

        function revealFallback(message) {
          if (status) status.textContent = message;
          if (creds) creds.classList.remove('hidden');
          if (openLink) openLink.classList.remove('hidden');
        }

        function startLogin() {
          try {
            helperWindow = window.open('about:blank', 'n8n-manager-login-window', 'popup,width=520,height=640');
          } catch (e) {
            helperWindow = null;
          }
          if (!helperWindow) {
            revealFallback('Browser blocked the helper window. Click Continue to allow sign-in, or open the workflow directly and use the credentials below.');
            return false;
          }
          try {
            helperWindow.document.write('<!doctype html><title>Signing in...</title><body style="font: 16px system-ui; padding: 24px;">Signing you into n8n...</body>');
            helperWindow.document.close();
          } catch (e) {}
          if (status) status.textContent = 'Signing in via the helper window...';
          try {
            form.submit();
          } catch (e) {
            revealFallback((e && e.message) || 'Sign-in failed.');
            return false;
          }
          window.setTimeout(function() {
            try { helperWindow.close(); } catch (e) {}
            window.location.replace(targetUrl);
          }, 1200);
          return true;
        }

        continueBtn && continueBtn.addEventListener('click', function() { startLogin(); });
        if (!startLogin() && status) status.textContent = 'Automatic sign-in needs a top-level helper window. Click Continue.';
      })();
    </script>
  </body>
</html>`;
}
async function handleBridgeRequest(request, response) {
  const method = request.method ?? "GET";
  const url = new URL(request.url ?? "/", `http://${LOCAL_BRIDGE_HOST}:${activePort}`);
  if (method === "GET" && url.pathname === "/health") {
    response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    response.end("OK");
    return;
  }
  if (method !== "GET" || !url.pathname.startsWith("/open/n8n-workflow/")) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  const token = decodeURIComponent(url.pathname.slice("/open/n8n-workflow/".length)).trim();
  const target = resolveStoredWorkflowOpenTarget(token);
  const resolution = await resolveManagedWorkflowOpen(target);
  if (!resolution.ok) {
    response.writeHead(resolution.statusCode, { "content-type": "text/plain; charset=utf-8" });
    response.end(resolution.error);
    return;
  }
  if (resolution.payload.mode === "direct") {
    response.writeHead(302, { Location: resolution.payload.targetUrl });
    response.end();
    return;
  }
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(resolution.payload.fallbackPage);
}
async function resolveManagedWorkflowOpen(target) {
  const targetUrl = normalizeUrl(target);
  if (!targetUrl) {
    return { ok: false, statusCode: 400, error: "Workflow target URL is invalid." };
  }
  const configuration = new N8nConfigurationService();
  const instance = findInstanceForTarget(configuration.listInstances(), targetUrl);
  if (!instance) {
    return { ok: true, payload: { mode: "direct", targetUrl: targetUrl.toString() } };
  }
  const credentials = await resolveManagedN8nOwnerCredentialsForInstance(instance);
  if (!credentials) {
    return { ok: true, payload: { mode: "direct", targetUrl: targetUrl.toString() } };
  }
  return {
    ok: true,
    payload: {
      mode: "managed",
      targetUrl: targetUrl.toString(),
      fallbackPage: buildManagedN8nWorkflowOpenPage({
        targetUrl: targetUrl.toString(),
        loginUrl: new URL("/rest/login", targetUrl.origin).toString(),
        credentials
      })
    }
  };
}
async function resolveManagedN8nOwnerCredentialsForInstance(instance) {
  if (instance.mode !== "managed-local-docker" || !instance.runtimeStatePath) {
    return void 0;
  }
  const runtime = await readPrivateRuntimeState(instance.runtimeStatePath);
  if (!runtime?.ownerEmail || !runtime.ownerPassword) {
    return void 0;
  }
  return {
    email: runtime.ownerEmail,
    password: runtime.ownerPassword,
    firstName: runtime.ownerFirstName,
    lastName: runtime.ownerLastName
  };
}
async function readPrivateRuntimeState(runtimeStatePath) {
  try {
    const parsed = JSON.parse(await import_node_fs2.default.promises.readFile(runtimeStatePath, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : void 0;
  } catch {
    return void 0;
  }
}
function findInstanceForTarget(instances, targetUrl) {
  return instances.find((instance) => {
    const origins = [instance.baseUrl, instance.tunnelPublicUrl].map((candidate) => normalizeUrl(candidate ?? "")?.origin).filter((origin) => Boolean(origin));
    return origins.includes(targetUrl.origin);
  });
}
function resolveStoredWorkflowOpenTarget(token) {
  return readPersistedTargets()[token] ?? "";
}
function readPersistedTargets() {
  try {
    const filePath = getBridgeTargetsPath();
    if (!import_node_fs2.default.existsSync(filePath))
      return {};
    const parsed = JSON.parse(import_node_fs2.default.readFileSync(filePath, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
function getActiveLocalOpenBridgeState() {
  const state = readLocalOpenBridgeState();
  if (!state)
    return void 0;
  if (!isPidAlive(state.pid)) {
    if (state.tunnelPid && isPidAlive(state.tunnelPid)) {
      void terminateProcess(state.tunnelPid);
    }
    clearLocalOpenBridgeState();
    return void 0;
  }
  if (state.tunnelPid && !isPidAlive(state.tunnelPid)) {
    const nextState = {
      port: state.port,
      pid: state.pid,
      startedAt: state.startedAt
    };
    saveLocalOpenBridgeState(nextState);
    activePort = nextState.port;
    return nextState;
  }
  activePort = state.port;
  return state;
}
function readLocalOpenBridgeState() {
  try {
    const statePath = getLocalOpenBridgeStatePath();
    if (!import_node_fs2.default.existsSync(statePath))
      return void 0;
    const parsed = JSON.parse(import_node_fs2.default.readFileSync(statePath, "utf8"));
    return typeof parsed.port === "number" && typeof parsed.pid === "number" && typeof parsed.startedAt === "string" ? {
      port: parsed.port,
      pid: parsed.pid,
      startedAt: parsed.startedAt,
      publicUrl: cleanString2(parsed.publicUrl),
      tunnelTargetUrl: cleanString2(parsed.tunnelTargetUrl),
      tunnelPid: typeof parsed.tunnelPid === "number" ? parsed.tunnelPid : void 0,
      tunnelLastAttemptAt: cleanString2(parsed.tunnelLastAttemptAt),
      tunnelLastError: cleanString2(parsed.tunnelLastError),
      tunnelNextRetryAt: cleanString2(parsed.tunnelNextRetryAt)
    } : void 0;
  } catch {
    return void 0;
  }
}
function saveLocalOpenBridgeState(state) {
  import_node_fs2.default.mkdirSync(resolveN8nManagerHome(), { recursive: true });
  import_node_fs2.default.writeFileSync(getLocalOpenBridgeStatePath(), JSON.stringify(state, null, 2));
}
function clearLocalOpenBridgeState() {
  import_node_fs2.default.rmSync(getLocalOpenBridgeStatePath(), { force: true });
}
function getLocalOpenBridgeStatePath() {
  return import_node_path2.default.join(resolveN8nManagerHome(), "local-open-bridge.json");
}
function getOpenLinksDir() {
  return import_node_path2.default.join(resolveN8nManagerHome(), "open-links");
}
function getBridgeTargetsPath() {
  return import_node_path2.default.join(getOpenLinksDir(), "bridge-targets.json");
}
async function terminateProcess(pid) {
  if (pid === process.pid) {
    return;
  }
  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
    }
  }
  const deadline = Date.now() + 5e3;
  while (isPidAlive(pid) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!isPidAlive(pid)) {
    return;
  }
  try {
    process.kill(-pid, "SIGKILL");
  } catch {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
    }
  }
}
function isPidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
function normalizeUrl(value) {
  try {
    return new URL(value);
  } catch {
    return void 0;
  }
}
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function cleanString2(value) {
  return typeof value === "string" && value.trim() ? value.trim() : void 0;
}

// ../../node_modules/@n8n-as-code/n8n-manager-core/dist/index.js
var TUNNEL_RETRY_COOLDOWN_MS2 = 10 * 60 * 1e3;
var execFileAsync3 = (0, import_node_util3.promisify)(import_node_child_process3.execFile);
var N8N_CONTAINER_DATA_DIR = "/home/node/.n8n";
var N8N_SQLITE_DATABASE_PATH = `${N8N_CONTAINER_DATA_DIR}/database.sqlite`;

// src/local-open-bridge-entrypoint.ts
async function main() {
  await ensureLocalN8nAuthBridgeRunningInProcess();
}
void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
