const fs = require('fs');

let code = fs.readFileSync('components/workspace/MiddleChatColumn.tsx', 'utf8');

const searchStart = "filteredWhatsAppMessages.map((m) => {";
const searchEnd = "          })\n        )}";

const idx1 = code.indexOf(searchStart);
const idx2 = code.indexOf(searchEnd, idx1);

if (idx1 !== -1 && idx2 !== -1) {
  const replacement = "          filteredWhatsAppMessages.map((m) => {\n" +
"            const isCustomer = m.sender === 'customer';\n" +
"            const isAi = m.sender === 'ai';\n" +
"            const isMe = !isCustomer;\n\n" +
"            return (\n" +
"              <NativeWhatsAppBubble\n" +
"                key={m.id}\n" +
"                m={m}\n" +
"                isCustomer={isCustomer}\n" +
"                isMe={isMe}\n" +
"                isAi={isAi}\n" +
"                searchQuery={searchQuery}\n" +
"                renderMessageText={renderMessageText}\n" +
"                renderReactionPicker={renderReactionPicker}\n" +
"                renderMessageAttachment={renderMessageAttachment}\n" +
"                setHoveredMessageId={setHoveredMessageId}\n" +
"                hoveredMessageId={hoveredMessageId}\n" +
"                likeMessage={likeMessage}\n" +
"                setReplyingToMessage={setReplyingToMessage}\n" +
"                activeContact={activeContact}\n" +
"                appId={appId}\n" +
"              />\n" +
"            );\n" +
"          })\n" +
"        )}";
  
  code = code.substring(0, idx1) + replacement + code.substring(idx2 + searchEnd.length);
}

fs.writeFileSync('components/workspace/MiddleChatColumn.tsx', code);
console.log('Successfully injected NativeWhatsAppBubble');
