const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

code = code.replace(/selectedContactId=\{selectedContactId\}/g, "selectedContactId={selectedContactPath[0] || ''}");
code = code.replace(/onSelectChat=\{\(chatId\) => setSelectedContactId\(chatId\)\}/g, "onSelectChat={(chatId) => setSelectedContactPath([chatId])}");
code = code.replace(/selectedContactId=\{selectedContactPath\[0\] \|\| ''\}/, "selectedContactId={selectedContactPath[0] || ''}");

fs.writeFileSync('app/page.tsx', code);
console.log('Fixed RightHub props');
