const fs = require('fs');

let code = fs.readFileSync('lib/mock_chats.ts', 'utf8');

// I replaced statusText globally, so I need to undo it in the interface.
// The interface should be: profilePicUrl: \`...\`,\n      statusText: string;
// Wait, the interface should just be `statusText: string;`!

code = code.replace(/profilePicUrl: `https:\/\/i\.pravatar\.cc\/150\?u=[a-z0-9]+`,\n\s*statusText: string;/g, 'statusText: string;');

fs.writeFileSync('lib/mock_chats.ts', code);
console.log('Fixed interface');
