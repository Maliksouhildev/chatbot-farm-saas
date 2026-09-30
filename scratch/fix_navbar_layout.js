const fs = require('fs');

let code = fs.readFileSync('components/layout/Navbar.tsx', 'utf8');

// 1. Change header to grid layout for perfect centering
code = code.replace(
  `className="sticky top-0 z-40 w-full max-w-full min-w-0 bg-white dark:bg-[#1A1D23] border-b border-[#DFDFD4] dark:border-[#2E333D] px-2.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between shadow-xs transition-colors shrink-0"`,
  `className="sticky top-0 z-40 w-full max-w-full min-w-0 bg-white dark:bg-[#1A1D23] border-b border-[#DFDFD4] dark:border-[#2E333D] px-2.5 sm:px-6 py-2 sm:py-2.5 grid grid-cols-3 items-center shadow-xs transition-colors shrink-0"`
);

// Add 'justify-self-start flex' to the Brand Emblem wrapper
code = code.replace(
  `className="flex items-center gap-2 sm:gap-2.5 select-none cursor-pointer group min-w-0 shrink"`,
  `className="flex items-center gap-2 sm:gap-2.5 select-none cursor-pointer group min-w-0 shrink justify-self-start"`
);

// Add 'justify-self-center' to the Nav
code = code.replace(
  `className="hidden md:flex items-center gap-0.5 lg:gap-1 p-1 bg-[#ECECE2]/70 dark:bg-black/40 rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] relative shrink-0"`,
  `className="hidden md:flex items-center gap-0.5 lg:gap-1 p-1 bg-[#ECECE2]/70 dark:bg-black/40 rounded-2xl border border-[#DFDFD4] dark:border-[#2E333D] relative shrink-0 justify-self-center"`
);

// Add 'justify-self-end flex' to the Right Actions
code = code.replace(
  `className="flex items-center gap-1.5 sm:gap-3 relative shrink-0" ref={dropdownRef}`,
  `className="flex items-center gap-1.5 sm:gap-4 relative shrink-0 justify-self-end" ref={dropdownRef}`
);


// 2. Remove the Team Button from Right Actions
const teamButtonHtml = `        {(!isEmployee || currentUser?.permissions?.modify_settings) && (
          <button
            onClick={onOpenTeamModal}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#1B1B1B] hover:bg-black dark:bg-[#1B6648] dark:hover:bg-[#15543A] text-white rounded-xl text-[11px] font-bold shadow-xs transition-all cursor-pointer"
            title="Manage Team & Permissions"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team</span>
          </button>
        )}`;
code = code.replace(teamButtonHtml, '');

// Wait! Sometimes the formatting is different. I'll use regex.
code = code.replace(/\{\(\!isEmployee \|\| currentUser\?\.permissions\?\.modify_settings\) && \(\s*<button\s*onClick=\{onOpenTeamModal\}[\s\S]*?<span>Team<\/span>\s*<\/button>\s*\)\}/, '');


// 3. Inject Workspace Switcher and Team Button into Profile Dropdown
const profileDropdownInjection = `
                  <div className="border-t border-gray-100 dark:border-neutral-800 my-1" />
                  
                  {/* Workspace Switcher */}
                  <div className="px-2 pt-1 pb-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">Workspaces</p>
                    <div className="max-h-32 overflow-y-auto custom-scrollbar pr-1 space-y-0.5">
                      {projects && projects.map((p: any) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            onSelectProject?.(p.id);
                            setIsProfileMenuOpen(false);
                          }}
                          className={\`w-full text-left px-2 py-1.5 text-xs font-bold rounded-lg flex items-center justify-between transition-colors \${activeProjectId === p.id ? 'bg-[#EB6708]/10 text-[#EB6708]' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'}\`}
                        >
                          <span className="truncate pr-2">{p.name}</span>
                          {activeProjectId === p.id && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        onCreateProject?.();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 mt-1 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[#EB6708] hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <span className="w-4 h-4 rounded bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-sm leading-none shrink-0 pb-0.5">+</span>
                      Create Burner Project
                    </button>
                  </div>

                  <div className="border-t border-gray-100 dark:border-neutral-800 my-1" />

                  {/* Team Button */}
                  {(!isEmployee || currentUser?.permissions?.modify_settings) && (
                    <button
                      onClick={() => {
                        onOpenTeamModal?.();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-[#ECECE2]/60 dark:hover:bg-neutral-800 text-left font-bold flex items-center gap-2 transition-colors cursor-pointer text-gray-800 dark:text-gray-200"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span>Manage Team & Permissions</span>
                    </button>
                  )}
`;

code = code.replace(`                  {/* Navigation Shortcuts */}`, profileDropdownInjection + '\n                  {/* Navigation Shortcuts */}');

fs.writeFileSync('components/layout/Navbar.tsx', code);
console.log('Fixed Navbar layout');
