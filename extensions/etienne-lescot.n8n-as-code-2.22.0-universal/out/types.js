"use strict";
/**
 * Extension state management types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeItemType = exports.ExtensionState = void 0;
/**
 * The current state of the n8n-as-code extension
 */
var ExtensionState;
(function (ExtensionState) {
    /** Extension is not initialized, waiting for user action */
    ExtensionState["UNINITIALIZED"] = "uninitialized";
    /** Configuration is incomplete (missing host or API key) */
    ExtensionState["CONFIGURING"] = "configuring";
    /** Initialization is in progress */
    ExtensionState["INITIALIZING"] = "initializing";
    /** Extension is fully initialized and operational */
    ExtensionState["INITIALIZED"] = "initialized";
    /** Initialization failed with an error */
    ExtensionState["ERROR"] = "error";
    /** Settings have changed, waiting for user to apply them */
    ExtensionState["SETTINGS_CHANGED"] = "settings-changed";
})(ExtensionState || (exports.ExtensionState = ExtensionState = {}));
/**
 * Tree item types for the enhanced workflow tree provider
 */
var TreeItemType;
(function (TreeItemType) {
    /** Big initialization button */
    TreeItemType["INIT_BUTTON"] = "init-button";
    /** Configuration status/guidance item */
    TreeItemType["CONFIG_STATUS"] = "config-status";
    /** Loading indicator */
    TreeItemType["LOADING"] = "loading";
    /** Error display item */
    TreeItemType["ERROR"] = "error";
    /** Workflow item (existing) */
    TreeItemType["WORKFLOW"] = "workflow";
    /** AI action button at bottom */
    TreeItemType["AI_ACTION"] = "ai-action";
    /** Informational message item */
    TreeItemType["INFO"] = "info";
})(TreeItemType || (exports.TreeItemType = TreeItemType = {}));
//# sourceMappingURL=types.js.map