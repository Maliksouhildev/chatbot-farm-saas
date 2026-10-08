const fs = require('fs');
let c = fs.readFileSync('components/workspace/MiddleChatColumn.tsx', 'utf8');
c = c.split('active:cursor-grabbing"}`}}>').join('active:cursor-grabbing"}`>');
c = c.split('active:cursor-grabbing"}`}} style=').join('active:cursor-grabbing"`} style=');
fs.writeFileSync('components/workspace/MiddleChatColumn.tsx', c);
console.log("Fixed syntax errors");
