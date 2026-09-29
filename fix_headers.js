const fs = require('fs');
let content = fs.readFileSync('components/workspace/MiddleChatColumn.tsx', 'utf8');

// The corrupted pattern looks like:
// active:cursor-grabbing"}`}>
// or
// active:cursor-grabbing"}`}> style={{...}}>
// Wait, let's just use regex to fix all the div headers.
// The div headers start with:
// <div {...dragHandleProps} className={`h-14 px-4 sm:px-5 text-white flex items-center justify-between
// We want to ensure the className properly closes and the div properly closes.

// Let's just find all instances of `dragHandleProps?.className || "cursor-grab active:cursor-grabbing"`
// and make sure they look like this:
// ${dragHandleProps?.className || "cursor-grab active:cursor-grabbing"}`}
// followed optionally by style={...} and then >

// Since it's corrupted, let's just match:
// "cursor-grab active:cursor-grabbing"}`... something >
// Actually, let's just use regex to clean it up:
content = content.replace(/active:cursor-grabbing"\}(`\}|`\}\}|`\}>|`\)}>).*?(style=\{\{.*?\}\})?>?/g, (match, p1, p2) => {
    // If it has a style tag attached in the match, preserve it
    let stylePart = "";
    if (match.includes("style={{")) {
        stylePart = match.substring(match.indexOf("style={{"));
        // remove trailing > if exists in stylePart
        if (stylePart.endsWith(">")) {
            stylePart = stylePart.slice(0, -1);
        }
    }
    
    if (stylePart) {
        return `active:cursor-grabbing"\}`} ${stylePart}>`;
    } else {
        return `active:cursor-grabbing"\}`}>`;
    }
});

// Write it back
fs.writeFileSync('components/workspace/MiddleChatColumn.tsx', content);
console.log("Fixed headers");
