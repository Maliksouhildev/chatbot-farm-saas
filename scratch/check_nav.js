const fs = require('fs');
const lines = fs.readFileSync('components/workspace/RightHubColumn.tsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('<nav className="relative h-9'));
console.log(lines.slice(idx-5, idx+40).join('\n'));
