const fs = require('fs');
let file = 'components/workspace/MiddleChatColumn.tsx';
let c = fs.readFileSync(file, 'utf8');

// Match className={``something ${cond ? 'a' : 'b' ${dragHandleProps...}`}
const badPattern = /className=\{\`\`(.*?)\s*\$\{isMobileEmbedded \? 'rounded-tr-2xl' : 'rounded-t-3xl'\s*\$\{dragHandleProps\?\.className \|\| \"cursor-grab active:cursor-grabbing\"\}\`\}\`/g;

c = c.replace(/className=\{\`\`(.*?)(\$\{.*?\})\s*\$\{dragHandleProps\?\.className\s*\|\|\s*"cursor-grab active:cursor-grabbing"\}\`\}\`/g, 
  (match, p1, p2) => {
    return `className={\`${p1.trim()} ${p2} \${dragHandleProps?.className || "cursor-grab active:cursor-grabbing"}\`}`;
  }
);
fs.writeFileSync(file, c);
console.log('Fixed');
