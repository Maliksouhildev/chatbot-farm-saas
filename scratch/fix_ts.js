const fs = require('fs');
const file = 'C:/Users/Public/projects/chatbot-farm/saas-web/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Move activeThemeColor down
const themeColorRegex = /const activeThemeColor = APP_GRADIENT_THEMES\[selectedAppId\]\?\.solidColor \|\| '#1B6648';\n/;
content = content.replace(themeColorRegex, '');

const selectedAppIdRegex = /const \[selectedAppId, setSelectedAppId\] = useState\('whatsapp'\);\n/;
content = content.replace(selectedAppIdRegex, "const [selectedAppId, setSelectedAppId] = useState('whatsapp');\n  const activeThemeColor = APP_GRADIENT_THEMES[selectedAppId]?.solidColor || '#1B6648';\n");

// Remove order={index} from Panel
content = content.replace(/ order=\{index\}/g, '');

fs.writeFileSync(file, content);
