const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

const regex = /<Group key=\{columnOrder\.join\("-"\)\} groupRef=\{groupRef\} orientation="horizontal" id=\{`desktop-workspace-\$\{columnOrder\.join\("-"\)\}`\} className="w-full h-full overflow-hidden flex gap-1\.5" onLayoutChanged=\{\(layout\) => \{/g;

code = code.replace(regex, `<Group groupRef={groupRef} orientation="horizontal" id="desktop-workspace-main" className="w-full h-full overflow-hidden flex gap-1.5" onLayoutChanged={(layout) => {`);

fs.writeFileSync('app/page.tsx', code);
console.log('Fixed page.tsx Group blink');
