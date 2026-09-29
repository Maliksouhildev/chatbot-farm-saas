const fs = require('fs');
const file = 'C:/Users/Public/projects/chatbot-farm/saas-web/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import \{ Panel, PanelGroup, PanelResizeHandle \} from 'react-resizable-panels';/g, 'import { Panel, Group, Separator } from \'react-resizable-panels\';');

content = content.replace(/<PanelGroup direction="horizontal" id="desktop-workspace" autoSaveId="desktop-workspace-panels">/g, '<Group orientation="horizontal" id="desktop-workspace">');

content = content.replace(/<\/PanelGroup>/g, '</Group>');

content = content.replace(/<PanelResizeHandle className="custom-resize-handle" \/>/g, '<Separator className="custom-resize-handle" />');

fs.writeFileSync(file, content);
