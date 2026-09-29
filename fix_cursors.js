const fs = require('fs');

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<div\s+\{\.\.\.dragHandleProps\}\s+className=([\"\{])(.*?)(cursor-grab\s+active:cursor-grabbing\s*)?(?<!\$\{dragHandleProps\?\.className\})([\"\}])/g, (match, openQuote, classes, oldCursor, closeQuote) => {
    let cleanClasses = classes.replace(/cursor-grab active:cursor-grabbing/g, '').trim();
    return `<div {...dragHandleProps} className={\`${cleanClasses} \${dragHandleProps?.className || "cursor-grab active:cursor-grabbing"}\`}`;
  });
  fs.writeFileSync(file, content);
}

processFile('components/workspace/MiddleChatColumn.tsx');
processFile('components/workspace/RightHubColumn.tsx');
