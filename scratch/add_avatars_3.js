const fs = require('fs');

let code = fs.readFileSync('lib/mock_chats.ts', 'utf8');

code = code.replace(/statusText: "([^"]+)",/g, (match, p1) => {
  return `profilePicUrl: "https://i.pravatar.cc/150?u=\${Math.random().toString(36).substring(7)}",\n      statusText: "${p1}",`;
});

fs.writeFileSync('lib/mock_chats.ts', code);
console.log('Added profilePicUrls properly');
