const fs = require('fs');

let code = fs.readFileSync('lib/mock_chats.ts', 'utf8');

// I will just use a regex replace to add profilePicUrl to every object that has 'statusText:'
// But only if it doesn't already have 'profilePicUrl' right before it.

code = code.replace(/statusText:/g, (match) => {
  return `profilePicUrl: \`https://i.pravatar.cc/150?u=\${Math.random().toString(36).substring(7)}\`,\n      statusText:`;
});

fs.writeFileSync('lib/mock_chats.ts', code);
console.log('Added profilePicUrls to all');
