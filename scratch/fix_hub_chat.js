const fs = require('fs');

// 1. Fix RightHubColumn Contacts Badge
let rightHub = fs.readFileSync('components/workspace/RightHubColumn.tsx', 'utf8');
const oldBadgeTarget = `                  {'count' in tab && tab.count !== undefined && (
                    <span className="text-[10px] opacity-75 hidden sm:inline">({tab.count})</span>
                  )}`;
const newBadgeTarget = `                  {'count' in tab && tab.count !== undefined && (
                    <span className={\`text-[9px] hidden sm:flex items-center justify-center px-1.5 py-0.5 rounded-full font-black ml-1.5 \${
                      activeTab === tab.id
                        ? 'bg-[#1B1B1B] text-white dark:bg-white dark:text-black'
                        : 'bg-gray-200 text-gray-700 dark:bg-neutral-700 dark:text-gray-300'
                    }\`}>
                      {tab.count}
                    </span>
                  )}`;
rightHub = rightHub.replace(oldBadgeTarget, newBadgeTarget);
fs.writeFileSync('components/workspace/RightHubColumn.tsx', rightHub);
console.log("Fixed RightHubColumn badge");

// 2. Fix MiddleChatColumn Scrolling and Overflow
let middleChat = fs.readFileSync('components/workspace/MiddleChatColumn.tsx', 'utf8');

// Fix scrolling behavior
middleChat = middleChat.replace(
  `  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);`,
  `  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [activeMessages]);`
);

// Fix long text overflow in chat bubbles
// There are multiple places where message text is rendered. Usually something like:
// <p className="whitespace-pre-wrap">{m.text}</p>
// We need to change that to:
// <p className="whitespace-pre-wrap break-words break-all">{m.text}</p>
middleChat = middleChat.replace(/className="whitespace-pre-wrap"/g, 'className="whitespace-pre-wrap break-words break-all"');
middleChat = middleChat.replace(/className="whitespace-pre-wrap text-\[13px\]/g, 'className="whitespace-pre-wrap break-words break-all text-[13px]');
middleChat = middleChat.replace(/className="whitespace-pre-wrap leading-relaxed"/g, 'className="whitespace-pre-wrap break-words break-all leading-relaxed"');

fs.writeFileSync('components/workspace/MiddleChatColumn.tsx', middleChat);
console.log("Fixed MiddleChatColumn scrolling and overflow");
