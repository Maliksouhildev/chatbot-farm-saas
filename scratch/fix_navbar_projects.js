const fs = require('fs');
let code = fs.readFileSync('components/layout/Navbar.tsx', 'utf8');

// 1. Add props to interface
const propsRegex = /interface NavbarProps \{[\s\S]*?\}/;
code = code.replace(propsRegex, `interface NavbarProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  currentUser: any;
  onOpenAuth: () => void;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleAi?: (channelId: string) => void;
  onOpenTeamModal?: () => void;
  projects?: any[];
  activeProjectId?: string;
  onSelectProject?: (projectId: string) => void;
  onCreateProject?: () => void;
}`);

// 2. Add props to component definition
code = code.replace(/export const Navbar: React\.FC<NavbarProps> = \(\{[\s\S]*?darkMode,[\s\S]*?onToggleDarkMode,[\s\S]*?onToggleAi,[\s\S]*?onOpenTeamModal,[\s\S]*?\}\) => \{/, 
`export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onOpenAuth,
  onLogout,
  darkMode,
  onToggleDarkMode,
  onToggleAi,
  onOpenTeamModal,
  projects = [],
  activeProjectId = 'default',
  onSelectProject,
  onCreateProject,
}) => {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);`);

// 3. Update UI to show project switcher in the logo area
const logoArea = `<div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#EB6708] to-[#FF8A00] rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-sm sm:text-base shadow-[0_4px_12px_rgba(235,103,8,0.3)]">
            CF
          </div>
          <span className="font-extrabold text-[#EB6708] text-base sm:text-lg lg:text-xl hidden md:block tracking-tight drop-shadow-sm">Chatbot Farm</span>
        </div>`;

const newLogoArea = `<div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#EB6708] to-[#FF8A00] rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-sm sm:text-base shadow-[0_4px_12px_rgba(235,103,8,0.3)] shrink-0">
            CF
          </div>
          <div className="hidden md:flex flex-col relative">
            <button 
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/10 px-2 py-1 rounded-lg transition-colors text-left"
            >
              <span className="font-extrabold text-[#EB6708] text-base lg:text-xl tracking-tight drop-shadow-sm truncate max-w-[150px]">
                {projects.find(p => p.id === activeProjectId)?.name || 'Main Workspace'}
              </span>
              <ChevronDown className="w-4 h-4 text-[#EB6708]" />
            </button>
            
            <AnimatePresence>
              {isProjectDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProjectDropdownOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full mt-1 left-0 w-64 bg-white dark:bg-[#1A1D23] rounded-xl shadow-xl border border-gray-200 dark:border-neutral-800 py-2 z-50 overflow-hidden"
                  >
                    <div className="px-3 pb-2 mb-2 border-b border-gray-100 dark:border-neutral-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Workspaces
                    </div>
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectProject?.(p.id);
                          setIsProjectDropdownOpen(false);
                        }}
                        className={\`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors \${activeProjectId === p.id ? 'text-[#EB6708] font-bold' : 'text-gray-700 dark:text-gray-200'}\`}
                      >
                        <div className={\`w-2 h-2 rounded-full \${activeProjectId === p.id ? 'bg-[#EB6708]' : 'bg-gray-300 dark:bg-neutral-600'}\`} />
                        <div className="flex-1 truncate">{p.name}</div>
                        {p.role && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-neutral-800 rounded font-mono text-gray-500">
                            {p.role}
                          </span>
                        )}
                      </button>
                    ))}
                    
                    <div className="border-t border-gray-100 dark:border-neutral-800 mt-2 pt-2">
                      <button
                        onClick={() => {
                          onCreateProject?.();
                          setIsProjectDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#EB6708] hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors flex items-center gap-2"
                      >
                        <span className="w-5 h-5 rounded bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-lg leading-none shrink-0 pb-0.5">+</span>
                        Create Burner Project
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>`;

code = code.replace(logoArea, newLogoArea);
fs.writeFileSync('components/layout/Navbar.tsx', code);
console.log('Fixed Navbar');
