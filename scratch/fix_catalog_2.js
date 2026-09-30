const fs = require('fs');
let code = fs.readFileSync('components/workspace/AppSwitcherColumn.tsx', 'utf8');

code = code.replace(/className="grid gap-3" style=\{\{ gridTemplateColumns: 'repeat\(auto-fill, minmax\(72px, 1fr\)\)' \}\}/g, 
  `className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))' }}`);

code = code.replace(/<div className="relative w-14 h-14 flex items-center justify-center scale-110 group-hover:scale-125 transition-transform duration-300">/g,
  `<div className="relative w-10 h-10 flex items-center justify-center scale-[0.65] group-hover:scale-75 transition-transform duration-300">`);

code = code.replace(/<span className="mt-2 text-\[10px\] font-bold text-gray-600 dark:text-gray-400 text-center line-clamp-1">\{ch\.name\}<\/span>/g,
  `<span className="mt-0.5 text-[8px] font-bold text-gray-600 dark:text-gray-400 text-center line-clamp-2 leading-tight px-0.5">{ch.name.replace(' (Line #2)', '')}</span>`);

fs.writeFileSync('components/workspace/AppSwitcherColumn.tsx', code);
console.log('Fixed catalog grid');
