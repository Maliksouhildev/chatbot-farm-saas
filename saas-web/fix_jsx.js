const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

c = c.replace(
  /<Group orientation="horizontal" id="desktop-workspace" className="w-full h-full overflow-hidden">\s*\(\(\) => \{/g,
  '<Group orientation="horizontal" id="desktop-workspace" className="w-full h-full overflow-hidden">\n                        {(() => {'
);

c = c.replace(
  /\}\)\(\)\}\s*<\/Group>/g,
  '})()}\n                      </Group>'
);

fs.writeFileSync('app/page.tsx', c);
console.log("Fixed JSX");
