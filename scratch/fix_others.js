const fs = require('fs');

function patchFile(file, propsRegex, propsReplacement, componentStartRegex, componentStartReplacement, headerRegex, headerReplacement) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(propsRegex, propsReplacement);
  content = content.replace(componentStartRegex, componentStartReplacement);
  content = content.replace(headerRegex, headerReplacement);
  fs.writeFileSync(file, content);
}

// AppSwitcherColumn
patchFile(
  'C:/Users/Public/projects/chatbot-farm/saas-web/components/workspace/AppSwitcherColumn.tsx',
  /unreadCounts\?: Record<string, number>;\n\}/,
  'unreadCounts?: Record<string, number>;\n  dragHandleProps?: any;\n}',
  /unreadCounts = \{\},\n\}\) => \{/,
  'unreadCounts = {},\n  dragHandleProps,\n}) => {',
  /<div className="h-14 px-4 shrink-0 flex items-center justify-between border-b border-\[#DFDFD4\] dark:border-\[#2E333D\]">/,
  '<div {...dragHandleProps} className="h-14 px-4 shrink-0 flex items-center justify-between border-b border-[#DFDFD4] dark:border-[#2E333D] cursor-grab active:cursor-grabbing">'
);

// RightHubColumn
patchFile(
  'C:/Users/Public/projects/chatbot-farm/saas-web/components/workspace/RightHubColumn.tsx',
  /onDisconnectChannel\?: \(channelId: string\) => void;\n\}/,
  'onDisconnectChannel?: (channelId: string) => void;\n  dragHandleProps?: any;\n}',
  /onDisconnectChannel,\n\}\) => \{/,
  'onDisconnectChannel,\n  dragHandleProps,\n}) => {',
  /<div\s+className="h-14 px-4 shrink-0 rounded-t-3xl border-b border-black\/10 select-none shadow-xs flex items-center"/,
  '<div {...dragHandleProps} className="h-14 px-4 shrink-0 rounded-t-3xl border-b border-black/10 select-none shadow-xs flex items-center cursor-grab active:cursor-grabbing"'
);
