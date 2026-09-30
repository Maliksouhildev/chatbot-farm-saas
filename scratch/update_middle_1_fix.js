const fs = require('fs');

let code = fs.readFileSync('components/workspace/MiddleChatColumn.tsx', 'utf8');

const oldLogic = /const activeContact = currentAppContacts\.find\(\(c\) => c\.id === selectedContactId\) \|\| currentAppContacts\[0\];\s+const activeMessages = activeContact \? \(conversations\[activeContact\.id\] \|\| activeContact\.messages \|\| \[\]\) : \[\];/;

const activeContactLogic = `  // Resolve the active contact traversing the hierarchy
  let resolvedContact = null;
  let currentList = currentAppContacts;
  
  if (selectedContactPath && selectedContactPath.length > 0) {
    for (const pId of selectedContactPath) {
      const found = currentList.find(c => c.id === pId);
      if (found) {
        resolvedContact = found;
        if (found.children) currentList = found.children;
      } else {
        break;
      }
    }
  }
  
  const activeContact = resolvedContact || currentAppContacts[0];
  const activeMessages = activeContact ? (conversations[activeContact.id] || activeContact.messages || []) : [];

  const handleNavigateDown = (childId: string) => {
    if (onNavigatePath) {
      onNavigatePath([...(selectedContactPath || []), childId]);
    }
  };

  const handleNavigateUp = () => {
    if (onNavigatePath && selectedContactPath && selectedContactPath.length > 1) {
      onNavigatePath(selectedContactPath.slice(0, -1));
    }
  };
`;

code = code.replace(oldLogic, activeContactLogic);
fs.writeFileSync('components/workspace/MiddleChatColumn.tsx', code);
console.log('Fixed activeContact logic');
