const fs = require('fs');
['components/workspace/MiddleChatColumn.tsx', 'components/workspace/RightHubColumn.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/className=\{\`\`(.*?)\s*\$\{dragHandleProps\?\.className\s*\|\|\s*"cursor-grab active:cursor-grabbing"\}\`\}/g, (match, classes) => {
    // If there's an unmatched open bracket from before (like another ${ condition ), we should handle it carefully.
    // Actually, looking at the syntax error: `isMobileEmbedded ? 'rounded-tr-2xl' : 'rounded-t-3xl' ${dragHandleProps?.className`
    // It's missing the closing `}` for the `${` expression inside the string. Wait, the original string was:
    // `${isMobileEmbedded ? 'rounded-tr-2xl' : 'rounded-t-3xl'}`
    // So the previous script replaced `}` with `${dragHandleProps?.className || "cursor-grab active:cursor-grabbing"}`
    // Let's just fix it manually with replace instead of regex since it's probably only a few places.
  });
});
