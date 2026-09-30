const fs = require('fs');

let code = fs.readFileSync('components/workspace/RightHubColumn.tsx', 'utf8');

// 1. Add container query styles and container properties to the root div
const rootDivRegex = /<div className="h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-white dark:bg-\[\#1A1D23\] rounded-3xl border border-\[\#DFDFD4\] dark:border-\[\#2E333D\] text-\[\#1B1B1B\] dark:text-gray-100 overflow-hidden shadow-sm">/;

const updatedRootDiv = `<div 
    className="h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-white dark:bg-[#1A1D23] rounded-3xl border border-[#DFDFD4] dark:border-[#2E333D] text-[#1B1B1B] dark:text-gray-100 overflow-hidden shadow-sm"
    style={{ containerType: 'inline-size', containerName: 'righthub' }}
  >
    <style dangerouslySetInnerHTML={{ __html: \`
      @container righthub (max-width: 250px) {
        .hub-tab-text { display: none !important; }
        .hub-tab-count { display: none !important; }
        .hub-action-text { display: none !important; }
        .hub-action-btn { padding: 0.5rem !important; aspect-ratio: 1/1; justify-content: center; }
      }
      @container righthub (max-width: 200px) {
        .contact-extra-details { display: none !important; }
        .contact-item-inner { align-items: center !important; }
        .contact-name-row { margin-bottom: 0 !important; }
      }
    \`}} />`;

code = code.replace(rootDivRegex, updatedRootDiv);


// 2. Add classes to the Tabs
code = code.replace(
  `<span>{tab.label}</span>`,
  `<span className="hub-tab-text">{tab.label}</span>`
);
// Replace multiple times just in case, but map should only have it once
code = code.replace(
  `className="text-[9px] opacity-90 hidden sm:flex items-center justify-center bg-black/10 dark:bg-white/10 rounded-full px-1.5 py-0.5 min-w-[18px] ml-0.5"`,
  `className="hub-tab-count text-[9px] opacity-90 flex items-center justify-center bg-black/10 dark:bg-white/10 rounded-full px-1.5 py-0.5 min-w-[18px] ml-0.5"`
);


// 3. Add classes to Action Row (Sync, Add Client)
// Sync Button
code = code.replace(
  `className="px-2.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"`,
  `className="hub-action-btn px-2.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"`
);
// We need to change the hidden sm:inline to just hub-action-text
code = code.replace(
  `<span className="hidden sm:inline">Sync</span>`,
  `<span className="hub-action-text">Sync</span>`
);

// Add Client Button
code = code.replace(
  `className="px-2.5 py-2 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"`,
  `className="hub-action-btn px-2.5 py-2 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"`
);
code = code.replace(
  `<span className="hidden sm:inline">Add Client</span>`,
  `<span className="hub-action-text">Add Client</span>`
);


// 4. Contact List modifications
// Add .contact-item-inner to the main flex block for the content
code = code.replace(
  `<div className="flex-1 min-w-0">`,
  `<div className="contact-item-inner flex-1 min-w-0 flex flex-col justify-center">`
);

code = code.replace(
  `<div className="flex items-center justify-between mb-0.5">`,
  `<div className="contact-name-row flex items-center justify-between mb-0.5">`
);

// We need to wrap the rest of the details (time, last message, phone, spend) in .contact-extra-details
// The time is inside the name row, let's target the time span.
code = code.replace(
  `<span className="text-[10px] text-gray-400 font-mono">`,
  `<span className="contact-extra-details text-[10px] text-gray-400 font-mono">`
);

// The last message p tag
code = code.replace(
  `<p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{contact.lastMessage}</p>`,
  `<p className="contact-extra-details text-[11px] text-gray-500 dark:text-gray-400 truncate">{contact.lastMessage}</p>`
);

// The phone and spend wrapper
code = code.replace(
  `<div className="flex items-center justify-between mt-1.5 text-[10px]">`,
  `<div className="contact-extra-details flex items-center justify-between mt-1.5 text-[10px]">`
);


fs.writeFileSync('components/workspace/RightHubColumn.tsx', code);
console.log('Fixed RightHubColumn container queries');
