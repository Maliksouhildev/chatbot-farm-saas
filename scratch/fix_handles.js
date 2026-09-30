const fs = require('fs');

let page = fs.readFileSync('app/page.tsx', 'utf8');

// Thicker resize handle for better UX
page = page.replace(/width: 4px;/g, 'width: 6px;');
page = page.replace(/height: 24px;/g, 'height: 32px;');

// Increase touch target size
page = page.replace(/width: 8px; \/\* Touch target width \*\//g, 'width: 12px; /* Touch target width */');
page = page.replace(/margin: 0 -4px;/g, 'margin: 0 -6px;');

fs.writeFileSync('app/page.tsx', page);
console.log('Fixed resize handles');
