const fs = require('fs');
const file = 'C:/Users/Public/projects/chatbot-farm/saas-web/components/workspace/MiddleChatColumn.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/className='h-14/g, 'className=\"h-14');
content = content.replace(/<div className=\{\`h-14/g, '<div {...dragHandleProps} className={\`h-14');

fs.writeFileSync(file, content);
