const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Fix colThemeColor mapping
c = c.replace(
  "const colThemeColor = colId === 'switcher' ? '#1B6648' : colId === 'chat' ? activeThemeColor : '#3B82F6';",
  "const colThemeColor = activeThemeColor;"
);

// 2. Fix SortableColumn style and remove column-line-only
// Find SortableColumn return
c = c.replace(
  "const style = {\n    transform: CSS.Translate.toString(horizontalTransform),\n    transition,\n    opacity: 1, // User asked not to be transparent\n    zIndex: isDragging ? 99999 : 1, // Stay on top while dragging\n    height: '100%',\n  };",
  "const style = {\n    transform: CSS.Translate.toString(horizontalTransform),\n    transition,\n    opacity: 1,\n    zIndex: isDragging ? 99999 : 1,\n    height: '100%',\n  } as React.CSSProperties;"
);

c = c.replace(
  "<div \n      ref={setNodeRef} \n      style={style} \n      className={`h-full w-full relative sortable-column-container group ${isDragging ? 'shadow-2xl' : ''}`}\n    >",
  "<div \n      ref={setNodeRef} \n      style={{ ...style, '--theme-color': activeThemeColor } as React.CSSProperties} \n      className={`h-full w-full relative sortable-column-container overflow-hidden group ${isDragging ? 'shadow-2xl' : ''}`}\n    >"
);

// Remove the line-only view
c = c.replace(
  /\{\/\* Line only view \*\/\}\s*<div className="absolute inset-0 hidden column-line-only items-center justify-center bg-transparent cursor-grab active:cursor-grabbing" \{\.\.\.attributes\} \{\.\.\.listeners\}>\s*<div className="w-2 h-full rounded-full transition-all" style=\{\{ backgroundColor: activeThemeColor \}\} \/>\s*<\/div>/g,
  ""
);

// 3. Fix Hydration Error and CSS container queries
c = c.replace(
  /<style>\{`([\s\S]*?)`\}<\/style>/g,
  (match, p1) => {
    // Replace the container query inside the style block
    let newCss = p1.replace(
      /@container \(max-width: 60px\) \{\s*\.column-main-content \{ opacity: 0 !important; pointer-events: none !important; \}\s*\.column-line-only \{ display: flex !important; \}\s*\}/g,
      `@container (max-width: 60px) {
                      .column-main-content { opacity: 0 !important; pointer-events: none !important; }
                      .sortable-column-container { background-color: var(--theme-color) !important; transition: background-color 0.2s; }
                      .column-icon-only { display: none !important; }
                    }`
    );
    return `<style dangerouslySetInnerHTML={{ __html: \`${newCss}\` }} />`;
  }
);

fs.writeFileSync('app/page.tsx', c);
console.log("Successfully executed plan");
