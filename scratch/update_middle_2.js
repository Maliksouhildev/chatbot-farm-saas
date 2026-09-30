const fs = require('fs');
let code = fs.readFileSync('components/workspace/MiddleChatColumn.tsx', 'utf8');

const directoryView = `
  // Render Directory Mode if the active contact is a Group
  if (activeContact && activeContact.isGroup) {
    const theme = APP_GRADIENT_THEMES[appId] || APP_GRADIENT_THEMES.discord;
    return (
      <div className={\`h-full w-full max-w-full min-w-0 min-h-0 flex flex-col bg-white dark:bg-[#1A1D23] \${isMobileEmbedded ? 'rounded-b-3xl border-0 shadow-none' : 'rounded-3xl border shadow-sm'} border-[#DFDFD4] dark:border-[#2E333D] overflow-hidden\`}>
        <div {...dragHandleProps} className={\`h-14 px-4 sm:px-5 shrink-0 flex items-center justify-between border-b border-black/10 select-none shadow-xs \${isMobileEmbedded ? 'rounded-tr-2xl' : 'rounded-t-3xl'} \${dragHandleProps?.className || "cursor-grab active:cursor-grabbing"}\`}
          style={{ backgroundColor: theme.solidColor }}
        >
          <div className="flex items-center gap-3 min-w-0 text-white">
            {selectedContactPath.length > 1 && (
              <button onClick={handleNavigateUp} className="p-1.5 -ml-2 rounded-full hover:bg-white/20 transition-colors shrink-0">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="min-w-0">
              <h4 className="font-bold text-sm truncate leading-tight flex items-center gap-1.5">
                {activeContact.name}
              </h4>
              <p className="text-[11px] text-white/80 truncate leading-tight">
                {activeContact.children ? activeContact.children.length : 0} Channels
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 dark:bg-[#111418] space-y-2">
          {(!activeContact.children || activeContact.children.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-full opacity-50 text-sm">
              No channels available.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeContact.children.map((child: any) => (
                <button
                  key={child.id}
                  onClick={() => handleNavigateDown(child.id)}
                  className="bg-white dark:bg-[#1E222A] border border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600 rounded-2xl p-4 flex flex-col gap-2 text-left transition-all hover:shadow-md cursor-pointer group"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={\`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white \${child.avatarColor || 'bg-gray-400'}\`}>
                      {child.isGroup ? <Folder className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-emerald-500 transition-colors">
                        {child.name}
                      </h5>
                      <p className="text-[11px] text-gray-500 truncate">{child.handleOrPhone}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
`;

const searchStr = `if (['discord', 'slack', 'signal', 'x_twitter', 'matrix', 'irc', 'linkedin', 'google_messages', 'google_chat', 'google_voice'].includes(appId)) {`;

code = code.replace(searchStr, directoryView + "\n  " + searchStr);
fs.writeFileSync('components/workspace/MiddleChatColumn.tsx', code);
console.log('Fixed MiddleChatColumn.tsx Part 2');
