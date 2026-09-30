const fs = require('fs');

let code = fs.readFileSync('components/workspace/MiddleChatColumn.tsx', 'utf8');

code = code.replace(/import \{/, "import { Folder, ChevronRight, ");

fs.writeFileSync('components/workspace/MiddleChatColumn.tsx', code);
console.log('Added lucide imports');
