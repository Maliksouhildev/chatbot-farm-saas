const fs = require('fs');

let code = fs.readFileSync('components/workspace/MiddleChatColumn.tsx', 'utf8');
code = code.replace("import { Folder, ChevronRight,  motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';");
code = code.replace("import { \n  Send,", "import { \n  Folder, ChevronRight,\n  Send,");
fs.writeFileSync('components/workspace/MiddleChatColumn.tsx', code);

let page = fs.readFileSync('app/page.tsx', 'utf8');
page = page.replace("setSelectedContactId((prev) => {\n              if (prev && rawChats.some((c: any) => c.id === prev)) return prev;\n              return rawChats.length > 0 ? rawChats[0].id : '';\n            });", 
"setSelectedContactPath((prev) => {\n              if (prev.length > 0 && rawChats.some((c: any) => c.id === prev[0])) return prev;\n              return rawChats.length > 0 ? [rawChats[0].id] : [];\n            });");
fs.writeFileSync('app/page.tsx', page);

console.log('Fixed build errors');
