const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

const regex = /if \(groupRef\.current\) \{\s*groupRef\.current\.setLayout\(prefs\.panelSizes\);\s*\}/;

const fix = `if (groupRef.current) {
        try {
          if (Array.isArray(prefs.panelSizes)) {
            groupRef.current.setLayout(prefs.panelSizes);
          } else {
            const cols = (prefs.columnOrder || columnOrder).filter((c: string) => !(c === 'hub' && isRightHubCollapsed));
            const arr = cols.map((c: string) => prefs.panelSizes[c] !== undefined ? prefs.panelSizes[c] : (c === 'switcher' ? 25 : c === 'chat' ? 45 : 30));
            const total = arr.reduce((a: number, b: number) => a + b, 0);
            const normalized = arr.map((s: number) => (s / total) * 100);
            groupRef.current.setLayout(normalized);
          }
        } catch {}
      }`;

code = code.replace(regex, fix);

fs.writeFileSync('app/page.tsx', code);
console.log('Fixed applyUserPreferences to handle dictionary panelSizes');
