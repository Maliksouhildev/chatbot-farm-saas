const fs = require('fs');
const path = require('path');

function replaceAvatarsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex patterns to find avatar rendering blocks.
  // We need to look for `activeContact.avatarText`, `TelegramIcon`, `InstagramIcon`, `MessengerIcon`, `StorefrontIcon` inside top bars and message feeds.

  // Let's do manual replacements for known patterns to be safe and accurate.
  
  // MiddleChatColumn.tsx
  // Telegram Header
  content = content.replace(
    /<TelegramIcon className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-xs shrink-0" \/>/g,
    `{activeContact?.profilePicUrl ? (
              <img src={activeContact.profilePicUrl} alt="" className="object-cover w-full h-full rounded-full shrink-0" style={{ width: '1.75rem', height: '1.75rem' }} />
            ) : (
              <TelegramIcon className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-xs shrink-0" />
            )}`
  );
  
  // Instagram Empty State Header
  // Note: we can match all InstagramIcon in the top bar.
  content = content.replace(
    /<InstagramIcon className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-xs shrink-0" \/>/g,
    `{activeContact?.profilePicUrl ? (
              <img src={activeContact.profilePicUrl} alt="" className="object-cover w-full h-full rounded-full shrink-0" style={{ width: '1.75rem', height: '1.75rem' }} />
            ) : (
              <InstagramIcon className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-xs shrink-0" />
            )}`
  );

  // Messenger Header
  content = content.replace(
    /<MessengerIcon className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" \/>/g,
    `{activeContact?.profilePicUrl ? (
              <img src={activeContact.profilePicUrl} alt="" className="object-cover w-full h-full rounded-full shrink-0" style={{ width: '1.75rem', height: '1.75rem' }} />
            ) : (
              <MessengerIcon className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
            )}`
  );

  // Web Widget Header
  content = content.replace(
    /<StorefrontIcon className="w-7 h-7 sm:w-8 sm:h-8 bg-white\/20 drop-shadow-xs shrink-0 rounded-xl p-1" \/>/g,
    `{activeContact?.profilePicUrl ? (
              <img src={activeContact.profilePicUrl} alt="" className="object-cover w-full h-full rounded-full shrink-0" style={{ width: '1.75rem', height: '1.75rem' }} />
            ) : (
              <StorefrontIcon className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 drop-shadow-xs shrink-0 rounded-xl p-1" />
            )}`
  );
  
  // MiddleChatColumn.tsx: Instagram Bubble
  content = content.replace(
    /<div className="w-6 h-6 rounded-full bg-gradient-to-tr from-\[#8338EC\] to-\[#B5179E\] text-white flex items-center justify-center text-\[10px\] font-bold shrink-0 mb-1">\s*\{activeContact\.avatarText\}\s*<\/div>/g,
    `<div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#8338EC] to-[#B5179E] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mb-1">
                    {activeContact?.profilePicUrl ? (
                      <img src={activeContact.profilePicUrl} alt="" className="object-cover w-full h-full rounded-full" />
                    ) : (
                      activeContact.avatarText
                    )}
                  </div>`
  );
  
  // MiddleChatColumn.tsx: Gmail Bubble
  content = content.replace(
    /<div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">\s*\{activeContact\.avatarText\}\s*<\/div>/g,
    `<div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                {activeContact?.profilePicUrl ? (
                  <img src={activeContact.profilePicUrl} alt="" className="object-cover w-full h-full rounded-full" />
                ) : (
                  activeContact.avatarText
                )}
              </div>`
  );

  fs.writeFileSync(filePath, content, 'utf8');
}

replaceAvatarsInFile(path.join(__dirname, 'components/workspace/MiddleChatColumn.tsx'));
