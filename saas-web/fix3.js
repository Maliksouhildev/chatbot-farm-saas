const fs = require('fs');
let c = fs.readFileSync('components/workspace/MiddleChatColumn.tsx', 'utf8');

// The file currently has instances of:
// ... "cursor-grab active:cursor-grabbing"}`>
// We want to replace it with:
// ... "cursor-grab active:cursor-grabbing"}`}>

c = c.replace(/active:cursor-grabbing"`>/g, 'active:cursor-grabbing"}`}>');
c = c.replace(/active:cursor-grabbing"}`>/g, 'active:cursor-grabbing"}`}>');
c = c.replace(/active:cursor-grabbing"}`} style=/g, 'active:cursor-grabbing"}`}> style=');
c = c.replace(/active:cursor-grabbing"`} style=/g, 'active:cursor-grabbing"}`}> style=');

fs.writeFileSync('components/workspace/MiddleChatColumn.tsx', c);
console.log("Fixed syntax errors for real");
