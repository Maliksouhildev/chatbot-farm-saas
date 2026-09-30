const fs = require('fs');

// ── page.tsx fixes ──────────────────────────────────────────────────────────
let page = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Make collapsed-bg draggable + smooth transition (was missing {...attrs}{...listeners})
page = page.replace(
  `<div className="absolute inset-0 opacity-0 pointer-events-none column-collapsed-bg transition-opacity duration-200" style={{ backgroundColor: 'var(--theme-color)', zIndex: 50 }}></div>`,
  `<div className="absolute inset-0 opacity-0 pointer-events-none column-collapsed-bg cursor-grab active:cursor-grabbing" style={{ backgroundColor: 'var(--theme-color)', zIndex: 50, borderRadius: 'inherit', transition: 'opacity 0.42s cubic-bezier(0.4,0,0.2,1)' }} {...attributes} {...listeners}></div>`
);

// 2. Smooth fade on main content
page = page.replace(
  `className={\`h-full w-full column-main-content transition-opacity duration-200 \${isDragging ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}\`}`,
  `className={\`h-full w-full column-main-content \${isDragging ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}\`} style={{ transition: 'opacity 0.42s cubic-bezier(0.4,0,0.2,1)' }}`
);

// 3. Add gap between panels: add gap-3 to the Group wrapper
page = page.replace(
  `className="w-full h-full overflow-hidden" onLayoutChanged`,
  `className="w-full h-full overflow-hidden flex gap-3" onLayoutChanged`
);

// 4. Increase collapse threshold so lines are thicker (from 60px to 80px)
page = page.replace(
  `@container (max-width: 60px) {`,
  `@container (max-width: 80px) {`
);

// 5. Increase minSize to prevent too-thin lines (from 4 to 5)
page = page.replace(
  `minSize={4}`,
  `minSize={5}`
);

fs.writeFileSync('app/page.tsx', page);
console.log('page.tsx updated');

// ── AppSwitcherColumn.tsx: isolate X button per item ────────────────────────
let asc = fs.readFileSync('components/workspace/AppSwitcherColumn.tsx', 'utf8');

// The X button currently uses group-hover on the outer div which is correct.
// The problem is the outer div has class "group" which is shared.
// It already has group-hover:opacity-100 — this should work by default with Tailwind.
// The real fix: wrap each item in its own group scope by using a unique group name.
// We'll switch to using a local state hover approach instead.

// Replace the unpin button to use individual hover state via onMouseEnter/Leave
// First, add useState import already exists. We need to add hoveredId state.
// The SortableChannelItem function already receives individual ch.id so we can use
// a local useState inside the component to track hover.

asc = asc.replace(
  `function SortableChannelItem({ ch, isSelected, appTheme, isChannelConnected, onSelectApp, onOpenConnectModal, onUnpinApp, isAiActive, onToggleAi, unreadCount }: SortableChannelProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ch.id });`,
  `function SortableChannelItem({ ch, isSelected, appTheme, isChannelConnected, onSelectApp, onOpenConnectModal, onUnpinApp, isAiActive, onToggleAi, unreadCount }: SortableChannelProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ch.id });
  const [isHovered, setIsHovered] = React.useState(false);`
);

// Add onMouseEnter/Leave to the outer item div
asc = asc.replace(
  `id={\`channel-switcher-\${ch.id}\`}
      className={\`app-item-container w-full p-2.5 sm:px-3 rounded-2xl flex items-center gap-2.5 transition-all text-left relative group shadow-xs cursor-grab active:cursor-grabbing \${`,
  `id={\`channel-switcher-\${ch.id}\`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={\`app-item-container w-full p-2.5 sm:px-3 rounded-2xl flex items-center gap-2.5 transition-all text-left relative shadow-xs cursor-grab active:cursor-grabbing \${`
);

// Replace group-hover:opacity-100 on X button with isHovered conditional
asc = asc.replace(
  `className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white dark:bg-red-500 dark:hover:bg-red-600 rounded-full flex items-center justify-center shadow-sm z-20 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all cursor-pointer border border-white dark:border-neutral-800 hover:scale-110"`,
  `className={\`absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white dark:bg-red-500 dark:hover:bg-red-600 rounded-full flex items-center justify-center shadow-sm z-20 transition-all cursor-pointer border border-white dark:border-neutral-800 hover:scale-110 \${isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}\`}`
);

fs.writeFileSync('components/workspace/AppSwitcherColumn.tsx', asc);
console.log('AppSwitcherColumn.tsx updated');
console.log('All done!');
