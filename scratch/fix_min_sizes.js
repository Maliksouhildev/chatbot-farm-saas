const fs = require('fs');

let page = fs.readFileSync('app/page.tsx', 'utf8');

page = page.replace(/minSize=\{5\}/g, "minSize={colId === 'switcher' ? 18 : colId === 'chat' ? 30 : 22}");

fs.writeFileSync('app/page.tsx', page);
console.log('Fixed min sizes');
