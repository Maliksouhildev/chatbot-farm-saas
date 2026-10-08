const fs = require('fs');

// 1. Update Navbar.tsx
let navbar = fs.readFileSync('components/layout/Navbar.tsx', 'utf8');

// Replace Bell with Bot in imports
if (!navbar.includes('Bot,')) {
  navbar = navbar.replace('Bell\n}', 'Bell,\n  Bot\n}');
}

// Replace Bell component with Bot component
navbar = navbar.replace(
  /<Bell className="w-4 h-4 text-gray-500 dark:text-gray-400" \/>/,
  '<Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />'
);

// We can also add Bot to imports if it's on a single line, but it seems it's multiline in Navbar.tsx (lines 5-22).
// Let's use a regex to ensure Bot is imported
if (!navbar.includes('Bot')) {
    navbar = navbar.replace(/import \{([^}]+)\} from 'lucide-react';/, (match, p1) => {
        return `import {${p1}, Bot} from 'lucide-react';`;
    });
}

fs.writeFileSync('components/layout/Navbar.tsx', navbar);


// 2. Update AppSwitcherColumn.tsx
let appSwitcher = fs.readFileSync('components/workspace/AppSwitcherColumn.tsx', 'utf8');

const oldToggle = `{onToggleAi && (
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleAi(ch.id); }}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            backgroundColor: isAiActive ? appTheme.solidColor : undefined,
            color: isAiActive ? '#FFFFFF' : undefined,
            borderColor: isAiActive ? appTheme.solidColor : undefined,
          }}
          className={\`app-item-ai-toggle absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-1 px-1.5 py-1 rounded-full transition-all duration-300 z-20 shadow-sm border cursor-pointer hover:scale-105 \${isAiActive ? "dark:border-white/20" : "bg-gray-100/80 text-gray-400 dark:bg-neutral-800/80 dark:text-gray-500 border-transparent"}\`}
          title={isAiActive ? "Toggle AI Agent Off" : "Toggle AI Agent On"}
        >
          <Sparkles className={\`w-3 h-3 transition-transform duration-500 \${isAiActive ? "rotate-12 scale-110" : "grayscale opacity-50"}\`} />{isAiActive && <span className="text-[8px] font-bold uppercase tracking-wider pr-0.5">AI ON</span>}
        </button>
      )}`;

const newToggle = `{onToggleAi && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleAi(ch.id); }}
          onPointerDown={(e) => e.stopPropagation()}
          className={\`app-item-ai-toggle absolute top-1/2 -translate-y-1/2 right-2 relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-all duration-200 cursor-pointer shadow-inner focus:outline-none hover:scale-105 z-20 border border-transparent \${
            isAiActive ? 'opacity-100' : 'bg-gray-200 dark:bg-gray-700/80 opacity-60 hover:opacity-100 dark:border-neutral-700'
          }\`}
          style={isAiActive ? { backgroundColor: appTheme.solidColor, boxShadow: \`0 0 8px \${appTheme.solidColor}60\` } : undefined}
          title={isAiActive ? 'Disable AI for this channel' : 'Enable AI for this channel'}
        >
          <span
            className={\`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300 \${
              isAiActive ? 'translate-x-4.5' : 'translate-x-0.5'
            }\`}
            style={isAiActive ? { transform: 'translateX(18px)' } : { transform: 'translateX(3px)' }}
          />
        </button>
      )}`;

appSwitcher = appSwitcher.replace(oldToggle, newToggle);

fs.writeFileSync('components/workspace/AppSwitcherColumn.tsx', appSwitcher);

console.log("Successfully updated toggles");
