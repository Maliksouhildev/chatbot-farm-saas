const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

// Replace selectedContactId with selectedContactPath array
code = code.replace(/const \[selectedContactId, setSelectedContactId\] = useState<string>\(''\);/, "const [selectedContactPath, setSelectedContactPath] = useState<string[]>([]);");

// Replace setSelectedContactId occurrences
// 1. In onSelectApp callback:
code = code.replace(/setSelectedContactId\(''\);/, "setSelectedContactPath([]);");

// 2. In handleSelectApp:
code = code.replace(/setSelectedContactId\(''\);/g, "setSelectedContactPath([]);");

// 3. In useEffect (auto-select contact if none selected):
code = code.replace(/if \(!selectedContactId && defaultContacts\.length > 0\) \{/, "if (selectedContactPath.length === 0 && defaultContacts.length > 0) {");
code = code.replace(/setSelectedContactId\(defaultContacts\[0\]\.id\);/, "setSelectedContactPath([defaultContacts[0].id]);");

// 4. In RightHubColumn props:
code = code.replace(/activeContactId=\{selectedContactId\}/, "activeContactId={selectedContactPath[0] || ''}");
code = code.replace(/onSelectChat=\{\(id\) => setSelectedContactId\(id\)\}/, "onSelectChat={(id) => setSelectedContactPath([id])}");

// 5. In MiddleChatColumn props:
code = code.replace(/selectedContactId=\{selectedContactId\}/, "selectedContactPath={selectedContactPath}");
code = code.replace(/onNavigatePath=\{\(path\) => setSelectedContactPath\(path\)\}/g, ""); // Ensure it doesn't already exist
code = code.replace(/selectedContactPath=\{selectedContactPath\}/, "selectedContactPath={selectedContactPath}\n                                        onNavigatePath={setSelectedContactPath}");

fs.writeFileSync('app/page.tsx', code);
console.log('Fixed page.tsx');
