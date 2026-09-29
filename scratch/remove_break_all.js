const fs = require('fs');
let code = fs.readFileSync('components/workspace/MiddleChatColumn.tsx', 'utf8');
code = code.replace(/break-words break-all/g, 'break-words');
fs.writeFileSync('components/workspace/MiddleChatColumn.tsx', code);
console.log("Removed break-all");
