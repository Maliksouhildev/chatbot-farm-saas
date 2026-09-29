const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Add rounded-3xl to sortable-column-container
c = c.replace(
  "className={`h-full w-full relative sortable-column-container overflow-hidden group ${isDragging ? 'shadow-2xl' : ''}`}",
  "className={`h-full w-full relative sortable-column-container overflow-hidden rounded-3xl group ${isDragging ? 'shadow-2xl' : ''}`}"
);

// 2. Increase minSize
c = c.replace(
  "minSize={2}",
  "minSize={4}"
);

// 3. Widen resize handle (and remove negative margin)
c = c.replace(
  "width: 12px;\n                      background-color: transparent;\n                      cursor: col-resize;\n                      display: flex;\n                      justify-content: center;\n                      align-items: center;\n                      margin: 0 -2px;",
  "width: 16px;\n                      background-color: transparent;\n                      cursor: col-resize;\n                      display: flex;\n                      justify-content: center;\n                      align-items: center;\n                      margin: 0;"
);

// 4. Increase screen padding
c = c.replace(
  "p-2 sm:p-2.5 md:p-3 overflow-hidden flex flex-col",
  "p-2 sm:p-2.5 md:p-5 overflow-hidden flex flex-col"
);

fs.writeFileSync('app/page.tsx', c);
console.log("Changes applied successfully.");
