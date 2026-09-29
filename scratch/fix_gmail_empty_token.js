const fs = require('fs');
let code = fs.readFileSync('lib/bridges/gmailBridge.ts', 'utf8');

const target = `    if (!accessToken) {
      return {
        success: true,
        chats: [],
      };
    }`;

const replacement = `    if (!accessToken) {
      return {
        success: false,
        chats: [],
        error: "Google access token is missing. Please click '1-Click Connect' again to grant permissions."
      };
    }`;

code = code.replace(target, replacement);
fs.writeFileSync('lib/bridges/gmailBridge.ts', code);
console.log("Fixed gmailBridge empty token");
