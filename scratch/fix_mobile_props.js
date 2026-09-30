const fs = require('fs');
let page = fs.readFileSync('app/page.tsx', 'utf8');

page = page.replace(/selectedContactId=\{selectedContactPath\[0\] \|\| ''\}/g, "selectedContactPath={selectedContactPath}\n                            onNavigatePath={setSelectedContactPath}");

fs.writeFileSync('app/page.tsx', page);
console.log('Fixed mobile render props');
