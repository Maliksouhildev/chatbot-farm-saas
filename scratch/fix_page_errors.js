const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const replacementBg = `
              .then((data) => {
                if (data.success === false && data.error) {
                  setChannelErrors((prev) => ({ ...prev, [appId]: data.error }));
                } else {
                  setChannelErrors((prev) => {
                    if (!prev[appId]) return prev;
                    const next = { ...prev };
                    delete next[appId];
                    return next;
                  });
                }
                if (Array.isArray(data.chats) && data.chats.length > 0) {`;

const replacementFg = `
            .then((data) => {
              if (data.success === false && data.error) {
                setChannelErrors((prev) => ({ ...prev, [selectedAppId]: data.error }));
              } else {
                setChannelErrors((prev) => {
                  if (!prev[selectedAppId]) return prev;
                  const next = { ...prev };
                  delete next[selectedAppId];
                  return next;
                });
              }
              if (Array.isArray(data.chats) && data.chats.length > 0) {`;

let replaced = 0;
code = code.replace(/\.then\(\(data\) => \{\s+if \(Array\.isArray\(data\.chats\) && data\.chats\.length > 0\) \{/g, (match, offset) => {
   replaced++;
   if (offset > 15000) return replacementFg;
   return replacementBg;
});

fs.writeFileSync('app/page.tsx', code);
console.log("Replaced", replaced, "occurrences.");
