const fs = require('fs');

let code = fs.readFileSync('components/workspace/AppSwitcherColumn.tsx', 'utf8');

// 1. Add style and container-type to root div
const rootDiv = `    <div className="h-full flex flex-col relative app-switcher-column bg-[#ECECE2]/30 dark:bg-[#15171C]/50 border-r border-[#DFDFD4] dark:border-[#2E333D] rounded-l-3xl overflow-hidden">`;

const updatedRootDiv = `    <div 
      className="h-full flex flex-col relative app-switcher-column bg-[#ECECE2]/30 dark:bg-[#15171C]/50 border-r border-[#DFDFD4] dark:border-[#2E333D] rounded-l-3xl overflow-hidden"
      style={{ containerType: 'inline-size', containerName: 'sidebar' }}
    >
      <style dangerouslySetInnerHTML={{ __html: \`
        @container sidebar (max-width: 170px) {
          .app-item-text { display: none !important; }
          .app-item-container { justify-content: space-between; padding-left: 1rem !important; padding-right: 1rem !important; }
        }
        @container sidebar (max-width: 110px) {
          .app-item-ai-toggle { 
            width: 1.5rem !important; 
            height: 1.5rem !important; 
            display: flex !important; 
            align-items: center !important; 
            justify-content: center !important; 
            padding: 0 !important;
            margin-left: 0 !important;
          }
          .app-item-ai-toggle span { 
            transform: none !important; 
            width: 100% !important; 
            height: 100% !important; 
            background: transparent !important; 
            box-shadow: none !important; 
          }
          .add-channel-text { display: none !important; }
          .app-item-container { justify-content: space-between; padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
        }
        @container sidebar (max-width: 75px) {
          .app-item-ai-toggle { display: none !important; }
          .app-item-container { justify-content: center !important; padding-left: 0 !important; padding-right: 0 !important; }
          .bottom-action-btn { padding: 0.5rem !important; }
        }
      \`}} />`;

code = code.replace(rootDiv, updatedRootDiv);

// 2. Add 'add-channel-text' class to the text inside the Add Channel button
code = code.replace(
  `<span>Add Channel / Phone</span>`,
  `<span className="add-channel-text">Add Channel / Phone</span>`
);

// Add 'bottom-action-btn' to the button
code = code.replace(
  `className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#1B6648]/40 dark:border-emerald-500/40 hover:border-[#1B6648] bg-[#1B6648]/5 dark:bg-emerald-950/20 hover:bg-[#1B6648]/10 text-[#1B6648] dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"`,
  `className="bottom-action-btn w-full py-2.5 px-3 rounded-xl border border-dashed border-[#1B6648]/40 dark:border-emerald-500/40 hover:border-[#1B6648] bg-[#1B6648]/5 dark:bg-emerald-950/20 hover:bg-[#1B6648]/10 text-[#1B6648] dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"`
);

// Fix the DragOverlay which has a duplicated inline block of similar logic.
// We should make sure `.app-item-container` is applied to the DragOverlay's wrapper if it isn't.
// Wait, the DragOverlay renders a `div` but it doesn't have `.app-item-container`.
// I will just add `.app-item-container` to the DragOverlay `div`.
code = code.replace(
  `className={\`w-full p-2.5 sm:px-3 rounded-2xl flex items-center gap-2.5 transition-all text-left relative group shadow-2xl cursor-grabbing scale-[1.03] rotate-1`,
  `className={\`app-item-container w-full p-2.5 sm:px-3 rounded-2xl flex items-center gap-2.5 transition-all text-left relative group shadow-2xl cursor-grabbing scale-[1.03] rotate-1`
);

// Also add `.app-item-ai-toggle` and `.app-item-text` to the DragOverlay elements.
code = code.replace(
  `className={\`absolute top-1/2 -translate-y-1/2 right-2 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-all duration-200`,
  `className={\`app-item-ai-toggle absolute top-1/2 -translate-y-1/2 right-2 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-all duration-200`
);

code = code.replace(
  `<div className="flex-1 min-w-0 flex flex-col justify-center z-0 pointer-events-none">`,
  `<div className="app-item-text flex-1 min-w-0 flex flex-col justify-center z-0 pointer-events-none">`
);

fs.writeFileSync('components/workspace/AppSwitcherColumn.tsx', code);
console.log('Fixed AppSwitcherColumn container queries');
