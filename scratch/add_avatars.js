const fs = require('fs');

let code = fs.readFileSync('lib/mock_chats.ts', 'utf8');

// I will just use a regex replace to add profilePicUrl to every object that has an 'id:' and 'appId:'
// Wait, an easier way is to just inject it before 'statusText:'

const pravatar = (seed) => `"https://i.pravatar.cc/150?u=\${Math.random()}"`;

code = code.replace(/avatarText:([^,\n]+),\n\s*avatarColor:([^,\n]+),/g, (match, p1, p2) => {
  return `avatarText:${p1},
      avatarColor:${p2},
      profilePicUrl: \`https://i.pravatar.cc/150?u=\${Math.random().toString(36).substring(7)}\`,`;
});

fs.writeFileSync('lib/mock_chats.ts', code);
console.log('Added profilePicUrls');
