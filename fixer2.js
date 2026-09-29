const fs = require('fs');
let file1 = 'components/workspace/MiddleChatColumn.tsx';
let file2 = 'components/workspace/RightHubColumn.tsx';

function fixFile(file) {
  let lines = fs.readFileSync(file, 'utf8').split('\n');
  let fixed = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('className={``h-14')) {
      // Find the end of this className attribute
      let fullMatch = lines[i];
      let j = i;
      while (!fullMatch.includes('`}`}')) {
        j++;
        if (j >= lines.length) break;
        fullMatch += '\n' + lines[j];
      }
      
      // Fix it:
      // className={``h-14 ... ${cond ? 'a' : 'b' ${dragHandleProps...}`}
      // to:
      // className={`h-14 ... ${cond ? 'a' : 'b'} ${dragHandleProps...}`}
      
      fullMatch = fullMatch.replace(/className=\{\`\`(.*?)\s*\$\{isMobileEmbedded \? 'rounded-tr-2xl' : 'rounded-t-3xl'\s*\$\{dragHandleProps\?\.className \|\| "cursor-grab active:cursor-grabbing"\}\`\}\`/g, 
        'className={`$1 ${isMobileEmbedded ? \'rounded-tr-2xl\' : \'rounded-t-3xl\'} ${dragHandleProps?.className || "cursor-grab active:cursor-grabbing"}`}'
      );
      
      fullMatch = fullMatch.replace(/className=\{\`\`(.*?)\s*\$\{dragHandleProps\?\.className \|\| "cursor-grab active:cursor-grabbing"\}\`\}\`/g, 
        'className={`$1 ${dragHandleProps?.className || "cursor-grab active:cursor-grabbing"}`}'
      );

      // In case the above regexes didn't match perfectly, let's just do simple replacements:
      fullMatch = fullMatch.replace(/className=\{\`\`(.*?)(\$\{isMobileEmbedded.*?)(\$\{dragHandleProps.*?)\`\}\`/s, 'className={`$1$2} $3`}');
      fullMatch = fullMatch.replace(/className=\{\`\`(.*?)\`\}/s, 'className={`$1`}');
      
      let linesArray = fullMatch.split('\n');
      lines.splice(i, j - i + 1, ...linesArray);
      fixed = true;
    }
    // RightHubColumn has similar but maybe slightly different
    if (lines[i].includes('className={`h-14 px-4 shrink-0 \nrounded-t-3xl border-b border-black/10 select-none shadow-xs flex items-center ${dragHandleProps?.className || \n"cursor-grab active:cursor-grabbing"}`}')) {
      // Already correct or broken?
    }
  }
  
  // Actually, let's just use string replacement on the whole file
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/className=\{\`\`(.*?)(\$\{isMobileEmbedded \? 'rounded-tr-2xl' : 'rounded-t-3xl')\s*(\$\{dragHandleProps\?\.className \|\| "cursor-grab active:cursor-grabbing"\})\`\}\`/gs, 
    'className={`$1$2} $3`}'
  );
  
  c = c.replace(/className=\{\`\`(.*?)(\$\{dragHandleProps\?\.className \|\| "cursor-grab active:cursor-grabbing"\})\`\}\`/gs, 
    'className={`$1$2`}'
  );
  
  fs.writeFileSync(file, c);
}

fixFile(file1);
fixFile(file2);
console.log('Fixed');
