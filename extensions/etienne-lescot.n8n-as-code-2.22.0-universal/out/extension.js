'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const path = require('node:path');
process.env.N8N_AS_CODE_ASSETS_DIR ??= path.join(__dirname, '..', 'assets');
let runtime;
function loadRuntime() {
  runtime ??= import('./extension-runtime.mjs');
  return runtime;
}
async function activate(context) {
  try {
    return await (await loadRuntime()).activate(context);
  } catch (error) {
    const vscode = require('vscode');
    const message = error && (error.stack || error.message) || String(error);
    const outputChannel = vscode.window.createOutputChannel('n8n-as-code');
    outputChannel.appendLine('[n8n] Failed to load extension runtime: ' + message);
    try {
      context.subscriptions.push(vscode.commands.registerCommand('n8n.configure', async () => {
        outputChannel.show(true);
        vscode.window.showErrorMessage('n8n as code could not load its full runtime. See the n8n-as-code output channel for details.');
      }));
    } catch (registrationError) {
      outputChannel.appendLine('[n8n] Failed to register fallback configure command: ' + ((registrationError && (registrationError.stack || registrationError.message)) || String(registrationError)));
    }
    vscode.window.showErrorMessage('n8n as code could not load its full runtime. See the n8n-as-code output channel for details.');
  }
}
function deactivate() {
  return runtime ? Promise.resolve(runtime).then((loadedRuntime) => typeof loadedRuntime.deactivate === 'function' ? loadedRuntime.deactivate() : undefined) : undefined;
}
//# sourceMappingURL=extension.js.map
