const fs = require('fs');
let code = fs.readFileSync('components/workspace/MiddleChatColumn.tsx', 'utf8');

// Update Interface
code = code.replace(/selectedContactId\?: string;/, "selectedContactPath?: string[];\n  onNavigatePath?: (path: string[]) => void;");

// Update Props
code = code.replace(/selectedContactId,/, "selectedContactPath = [],\n  onNavigatePath,");

// Update activeContact logic
const activeContactLogic = `  // Resolve the active contact traversing the hierarchy
  let resolvedContact = null;
  let currentList = currentAppContacts;
  
  if (selectedContactPath.length > 0) {
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
      onNavigatePath([...selectedContactPath, childId]);
    }
  };

  const handleNavigateUp = () => {
    if (onNavigatePath && selectedContactPath.length > 1) {
      onNavigatePath(selectedContactPath.slice(0, -1));
    }
  };
`;

code = code.replace(/const activeContact = currentAppContacts\.find\(\(c\) => c\.id === selectedContactId\) \|\| currentAppContacts\[0\];\n  const activeMessages = activeContact \? \(conversations\[activeContact\.id\] \|\| activeContact\.messages \|\| \[\]\) : \[\];/, activeContactLogic);

fs.writeFileSync('components/workspace/MiddleChatColumn.tsx', code);
console.log('Fixed MiddleChatColumn.tsx Part 1');
