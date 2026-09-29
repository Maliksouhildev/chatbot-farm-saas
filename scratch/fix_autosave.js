const fs = require('fs');
const file = 'C:/Users/Public/projects/chatbot-farm/saas-web/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/<PanelGroup direction="horizontal" id="desktop-workspace">/, '<PanelGroup direction="horizontal" id="desktop-workspace" autoSaveId="desktop-workspace-panels">');
fs.writeFileSync(file, content);
