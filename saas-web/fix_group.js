const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

c = c.replace(
  '<Group orientation="horizontal" id="desktop-workspace" className="w-full h-full overflow-hidden">',
  '<Group key={columnOrder.join("-")} orientation="horizontal" id={`desktop-workspace-${columnOrder.join("-")}`} className="w-full h-full overflow-hidden">'
);

fs.writeFileSync('app/page.tsx', c);
console.log("Fixed Group key");
