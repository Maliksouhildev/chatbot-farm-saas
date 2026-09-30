const fs = require('fs');

let code = fs.readFileSync('components/layout/Navbar.tsx', 'utf8');

const regex = /\{\/\* Team Management \(Owner Only\) \*\/\}[\s\S]*?<\/button>\s*\)\}/;
code = code.replace(regex, '');

fs.writeFileSync('components/layout/Navbar.tsx', code);
console.log('Removed top level Team button');
