const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Fix the Group key, id, and onLayoutChanged
const groupRegex = /<Group key=\{columnOrder\.join\("-"\)\} groupRef=\{groupRef\} orientation="horizontal" id=\{`desktop-workspace-\$\{columnOrder\.join\("-"\)\}`\} className="w-full h-full overflow-hidden flex gap-1\.5" onLayoutChanged=\{\(layout\) => \{[\s\S]*?debouncedSyncPreferences\(\{ panelSizes: layout \}\);\s*\}\}>/;

const updatedGroup = `<Group groupRef={groupRef} orientation="horizontal" id="desktop-workspace-main" className="w-full h-full overflow-hidden flex gap-1.5" onLayoutChanged={(layout) => {
                        const visibleCols = columnOrder.filter(c => !(c === 'hub' && isRightHubCollapsed));
                        const sizeDict: Record<string, number> = {};
                        visibleCols.forEach((col, i) => { sizeDict[col] = layout[i]; });
                        localStorage.setItem(getStorageKey('cf_panel_sizes_dict'), JSON.stringify(sizeDict));
                        debouncedSyncPreferences({ panelSizes: sizeDict });
                      }}>`;

code = code.replace(groupRegex, updatedGroup);

// 2. Fix the size reading logic
const sizeReadingRegex = /let savedSize = undefined;\s*try \{\s*const stored = localStorage\.getItem\(getStorageKey\('cf_panel_sizes'\)\);\s*if \(stored\) \{\s*const parsed = JSON\.parse\(stored\);\s*if \(parsed\[colId\] !== undefined\) savedSize = parsed\[colId\];\s*\}\s*\} catch \{\}/;

const updatedSizeReading = `let savedSize = undefined;
                            try {
                              const stored = localStorage.getItem(getStorageKey('cf_panel_sizes_dict'));
                              if (stored) {
                                const parsed = JSON.parse(stored);
                                if (parsed[colId] !== undefined) savedSize = parsed[colId];
                              }
                            } catch {}`;

code = code.replace(sizeReadingRegex, updatedSizeReading);


fs.writeFileSync('app/page.tsx', code);
console.log('Fixed page.tsx Group blink and sizing memory');
