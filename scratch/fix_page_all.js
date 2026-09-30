const fs = require('fs');

let page = fs.readFileSync('app/page.tsx', 'utf8');

page = page.replace(/setSelectedContactId\(\(prev\)/g, "setSelectedContactPath((prev: string[])");
page = page.replace(/setSelectedContactId\(contactId\);/g, "setSelectedContactPath([contactId]);");
page = page.replace(/setSelectedContactId\(contact\.id\);/g, "setSelectedContactPath([contact.id]);");
page = page.replace(/setSelectedContactId\(contacts\[0\]\.id\);/g, "setSelectedContactPath([contacts[0].id]);");
page = page.replace(/setSelectedContactId\(chatId\);/g, "setSelectedContactPath([chatId]);");

// Wait, the prev replacement above:
// I already replaced the prev logic in my previous script, let's see if it's correct.
// Actually, I can just use a regex for all generic strings!
page = page.replace(/setSelectedContactId\((.*?)\)/g, (match, p1) => {
  if (p1.includes('prev')) return match; // Leave prev alone if already handled
  return `setSelectedContactPath([${p1}])`;
});

fs.writeFileSync('app/page.tsx', page);
console.log('Fixed remaining occurrences');
