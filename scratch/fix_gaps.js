const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

code = code.replace(/p-2 sm:p-2\.5 md:p-5/g, "p-1 md:p-2");
code = code.replace(/gap-3/g, "gap-1.5");

fs.writeFileSync('app/page.tsx', code);
console.log('Fixed gaps');
