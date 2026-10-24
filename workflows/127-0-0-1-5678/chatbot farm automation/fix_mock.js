const fs = require('fs');
const file = 'c:/Users/mlkme/.antigravity/workflows/127-0-0-1-5678/chatbot farm automation/saas-web/lib/mock_chats.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/lastMessage:\s*"([^"]+)",\s*time:\s*"([^"]+)",\s*profilePicUrl:\s*"([^"]+)",\s*messages:\s*\[\]/g, (match, msg, time, url) => {
  return `lastMessage: "${msg}",
      time: "${time}",
      profilePicUrl: "${url}",
      messages: [
        {
          id: "m_" + Math.random().toString(36).substr(2, 9),
          sender: "customer",
          text: "${msg}",
          time: "${time}"
        }
      ]`;
});

fs.writeFileSync(file, code);
console.log('Done!');
