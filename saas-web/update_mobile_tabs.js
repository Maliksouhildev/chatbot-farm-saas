const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Change px-1 to px-3 to give room for the fluid curves
const targetContainer = `<div className="w-full pt-1 px-1 flex items-end justify-between gap-1 shrink-0 select-none z-20">`;
const replacementContainer = `<div className="w-full pt-1 pl-3 pr-1 flex items-end justify-between gap-1 shrink-0 select-none z-20">`;
c = c.replace(targetContainer, replacementContainer);

// 2. Replace the active tab div
const targetTab = `                              <div
                                key={ch.id}
                                className="relative px-2.5 pt-2 pb-1.5 rounded-t-2xl flex items-center justify-center transition-all duration-200 -mb-[1px] z-20 shadow-xs"
                                style={{
                                  backgroundColor: activeTheme.solidColor,
                                }}
                              >
                                <button`;

const replacementTab = `                              <div
                                key={ch.id}
                                className="relative px-2.5 pt-2 pb-1.5 rounded-t-2xl flex items-center justify-center transition-all duration-200 -mb-[1px] z-20"
                                style={{
                                  backgroundColor: activeTheme.solidColor,
                                }}
                              >
                                {/* Left Fluid Curve (Gooey Tab Effect) */}
                                <svg className="absolute bottom-0 -left-3 w-3 h-3 text-transparent z-20 pointer-events-none" viewBox="0 0 12 12">
                                  <path d="M12 0 A12 12 0 0 0 0 12 H12 V0 Z" fill={activeTheme.solidColor} />
                                </svg>
                                {/* Right Fluid Curve (Gooey Tab Effect) */}
                                <svg className="absolute bottom-0 -right-3 w-3 h-3 text-transparent z-20 pointer-events-none" viewBox="0 0 12 12">
                                  <path d="M0 0 A12 12 0 0 1 12 12 H0 V0 Z" fill={activeTheme.solidColor} />
                                </svg>
                                <button`;

c = c.replace(targetTab, replacementTab);

fs.writeFileSync('app/page.tsx', c);
console.log("Successfully updated mobile tabs");
