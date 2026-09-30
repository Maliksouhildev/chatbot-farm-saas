const fs = require('fs');
let code = fs.readFileSync('components/workspace/AppSwitcherColumn.tsx', 'utf8');

const oldGrid = `            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))' }}>
              {rawChannels.filter(ch => !pinnedApps.includes(ch.id)).map(ch => (
                <div 
                  key={ch.id}
                  onClick={() => {
                    onPinApp && onPinApp(ch.id);
                  }}
                  className="relative flex flex-col items-center justify-center p-2 rounded-2xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-neutral-800 border border-transparent hover:border-gray-200 dark:hover:border-neutral-700 group"
                >
                  <div className="relative w-14 h-14 flex items-center justify-center scale-110 group-hover:scale-125 transition-transform duration-300">
                    {ch.iconComponent}`;

const newGrid = `            <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))' }}>
              {rawChannels.filter(ch => !pinnedApps.includes(ch.id)).map(ch => (
                <div 
                  key={ch.id}
                  onClick={() => {
                    onPinApp && onPinApp(ch.id);
                  }}
                  className="relative flex flex-col items-center justify-center p-1 rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-neutral-800 border border-transparent hover:border-gray-200 dark:hover:border-neutral-700 group"
                >
                  <div className="relative w-10 h-10 flex items-center justify-center scale-75 group-hover:scale-90 transition-transform duration-300">
                    {ch.iconComponent}`;

code = code.replace(oldGrid, newGrid);

const oldText = `<span className="mt-2 text-[10px] font-bold text-gray-600 dark:text-gray-400 text-center line-clamp-1">{ch.name}</span>`;
const newText = `<span className="mt-0.5 text-[8.5px] font-bold text-gray-600 dark:text-gray-400 text-center line-clamp-2 leading-tight px-0.5">{ch.name.replace(' (Line #2)', '')}</span>`;

code = code.replace(oldText, newText);

fs.writeFileSync('components/workspace/AppSwitcherColumn.tsx', code);
console.log('Fixed catalog grid');
