const fs = require('fs');
let code = fs.readFileSync('lib/bridges/googleChatBridge.ts', 'utf8');

const target = `    if (!accessToken) {
      return {
        success: true,
        chats: [],
        error: "Google Chat is connected. Connect Google Workspace with chat.spaces scope to stream real rooms.",
      };
    }`;

const replacement = `    if (!accessToken) {
      return {
        success: false,
        chats: [],
        error: "Google access token is missing. Please click '1-Click Connect' again to authenticate.",
      };
    }`;

code = code.replace(target, replacement);
fs.writeFileSync('lib/bridges/googleChatBridge.ts', code);
console.log("Fixed googleChatBridge empty token");
