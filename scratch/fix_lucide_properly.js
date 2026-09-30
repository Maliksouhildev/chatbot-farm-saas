const fs = require('fs');

let code = fs.readFileSync('components/workspace/MiddleChatColumn.tsx', 'utf8');

const regex = /import \{\s+Send,/;
code = code.replace(regex, "import { Folder, ChevronRight, Send,");

fs.writeFileSync('components/workspace/MiddleChatColumn.tsx', code);
console.log('Fixed lucide imports properly');
