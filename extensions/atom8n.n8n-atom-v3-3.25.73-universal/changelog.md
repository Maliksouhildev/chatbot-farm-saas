# Changelog

## Latest — 2026-04-28 

### Changed

- **Workspace context**: Replaced transient path-based `pinData` injection (`__filepath` / `__dirpath`) with a dedicated workspace context property, simplifying the workflow sync logic and reducing code complexity.
- **Extension display name**: Renamed from *n8n Atom 3.0* to *n8n Atom*.

---

## \[3.25.69\] — 2026-04-20

### Added

- **Atom Note**: Added the Atom Note extension to the Ecosystem collection sidebar, enabling quick access to the note-taking companion app from within the extension.

---

## \[3.25.68\] — 2026-04-14

### Fixed

- **SSH Remote Webview**: Decoupled the webview iframe URL from the local API URL so that SSH remote port-forwarding environments render the n8n UI correctly instead of showing a blank/404 page.
- **Proxy URL normalization**: Trailing slashes are now stripped from the proxy target URL to prevent malformed request paths.

---

## \[3.25.66\] — 2026-04-05

### Added

- **Executions panel**: New *Executions List* button in the info bar; clicking it fetches and displays the workflow's execution history directly inside the webview.
- **Execution detail data**: `includeData=true` query parameter is now appended to execution detail API requests so node output data is included.
- **View Change Log** button added to the sidebar guide menu for quick access to release notes.

---

## \[3.25.65\] — 2026-04-04

### Added

- **Clean .data files**: New sidebar menu action to remove all `.data` files from the workspace.
- **Rate Us** button in the sidebar guide menu, linking directly to Open VSX reviews.

### Changed

- **Report Issue** button in sidebar guide menu now displays a 🐛 bug emoji for better visibility.

---

## \[3.25.64\] — 2026-03-30

### Added

- **Switch to Fork** command for server management.
- **MCP Inspector** integration for the ecosystem extension (UI and event handling).
- **openEcosystemExtension**: prefers the **Open Dashboard** command, with fallback to the view container.
- In-memory injection of `__filepath` and `__dirpath` into trigger node `pinData` for webview context.

### Changed

- Strip `__filepath` and `__dirpath` from trigger node `pinData` before persistence to keep saved workflow data clean.

---

## \[3.25.63\] — 2026-03-26

### Changed

- **GitHub** URLs updated for repository ownership under **khanh-atom**.

---

## \[3.25.62\] — 2026-03-21

### Changed

- **README**: Installation steps and clearer notes on server connection options for the n8n extension.

---

## \[3.25.61\] — 2026-03-21

### Fixed

- Workflow fetch failures: error text now suggests checking **API key expiration** when relevant.

---

## \[3.25.60\] — 2026-03-19

### Fixed

- **Clipboard** n8n iframes inside webviews: macOS

---

## \[3.25.58\] / \[3.25.59\] — 2026-03-12

### Added

- **Refresh** action to re-import the local workflow file to the server before reloading the preview.

---

## \[3.25.57\] — 2026-03-10

### Added

- **Auto-save** for settings after a successful API key test.
- **serverUrl** normalization: trailing slashes stripped in `updateN8nSettings`.

### Fixed

- Bug affecting **local vs. server** sync.

---

## \[3.25.55\] / \[3.25.56\] — 2026-03-05

### Added

- **Workflow ID** from the document; info bar links to the specific workflow path in webview mode.
- **Server info bar** URL updates when the workflow ID changes (direct link to the workflow).

### Changed

- Removed the **Open workflow** button and related HTML generation in static and proxy modes.