const fs = require('fs');

let code = fs.readFileSync('components/workspace/RightHubColumn.tsx', 'utf8');

// 1. Add props to interface
const propsRegex = /interface RightHubColumnProps \{[\s\S]*?dragHandleProps\?: any;\n\}/;
const updatedProps = `import { Unlink } from 'lucide-react';

interface RightHubColumnProps {
  selectedAppId: string;
  selectedContactId?: string;
  onSelectChat: (chatId: string) => void;
  isAiActive?: boolean;
  onToggleAi?: () => void;
  isConnected?: boolean;
  activeTabOverride?: 'contacts' | 'analytics' | 'settings';
  liveContacts?: ContactProfile[];
  currentUser?: any;
  onContactAdded?: (contact: ContactProfile) => void;
  onDisconnectChannel?: (channelId: string) => void;
  dragHandleProps?: any;
  isStandalone?: boolean;
  detachedTabs?: string[];
  onDetach?: (tab: string) => void;
  onReattach?: () => void;
}`;
code = code.replace(propsRegex, updatedProps);

// 2. Add props to component signature
const sigRegex = /export const RightHubColumn: React\.FC<RightHubColumnProps> = \(\{[\s\S]*?dragHandleProps,\n\}\) => \{/;
const updatedSig = `export const RightHubColumn: React.FC<RightHubColumnProps> = ({
  selectedAppId,
  selectedContactId,
  onSelectChat,
  isAiActive = true,
  onToggleAi,
  isConnected = false,
  activeTabOverride,
  liveContacts,
  currentUser,
  onContactAdded,
  onDisconnectChannel,
  dragHandleProps,
  isStandalone,
  detachedTabs = [],
  onDetach,
  onReattach,
}) => {`;
code = code.replace(sigRegex, updatedSig);

// 3. Update the header rendering
const headerRegex = /<nav className="relative h-9 w-full grid grid-cols-3 gap-1 p-0\.5 bg-black\/25 backdrop-blur-md rounded-xl border border-white\/20 items-center">[\s\S]*?<\/nav>/;
const updatedHeader = `{isStandalone ? (
          <div className="w-full flex items-center justify-between text-white">
            <div className="flex items-center gap-2 font-bold">
              {activeTab === 'analytics' ? <BarChart2 className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
              <span className="capitalize">{activeTab}</span>
            </div>
            {onReattach && (
              <button onClick={onReattach} className="p-1.5 hover:bg-black/20 rounded-lg transition-colors cursor-pointer" title="Reattach to Hub">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <nav 
            className="relative h-9 w-full grid gap-1 p-0.5 bg-black/25 backdrop-blur-md rounded-xl border border-white/20 items-center"
            style={{ 
              gridTemplateColumns: \`repeat(\${3 - detachedTabs.length}, minmax(0, 1fr))\` 
            }}
          >
            {(() => {
              const ALL_TABS = [
                { id: 'contacts', label: 'Contacts', count: contactsList.length, icon: <MessageSquare className="w-3.5 h-3.5 shrink-0" /> },
                { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-3.5 h-3.5 shrink-0" /> },
                { id: 'settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5 shrink-0" /> },
              ] as const;
              
              const visibleTabs = ALL_TABS.filter(t => !detachedTabs.includes(t.id));
              const activeIndex = visibleTabs.findIndex(t => t.id === activeTab);
              
              return (
                <>
                  {activeIndex >= 0 && (
                    <div 
                      className="absolute top-[2px] bottom-[2px] bg-white rounded-lg shadow-sm z-0"
                      style={{
                        width: \`calc((100% - \${(visibleTabs.length - 1) * 4 + 4}px) / \${visibleTabs.length})\`,
                        transform: \`translateX(calc(\${activeIndex * 100}% + \${activeIndex * 4 + 2}px))\`,
                        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                    />
                  )}
                  {visibleTabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        id={\`tab-btn-\${tab.id}\`}
                        onClick={() => setActiveTab(tab.id)}
                        className={\`relative h-full py-1.5 px-3 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer z-10 whitespace-nowrap overflow-hidden leading-none \${
                          isActive
                            ? 'text-gray-950 font-extrabold'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }\`}
                      >
                        {tab.icon}
                        <span className="hub-tab-text">{tab.label}</span>
                        {'count' in tab && tab.count !== undefined && (
                          <span className="hub-tab-count text-[9px] opacity-90 flex items-center justify-center bg-black/10 dark:bg-white/10 rounded-full px-1.5 py-0.5 min-w-[18px] ml-0.5">
                            {tab.count}
                          </span>
                        )}
                        {isActive && (tab.id === 'analytics' || tab.id === 'settings') && onDetach && (
                          <div 
                            onClick={(e) => { e.stopPropagation(); onDetach(tab.id); }}
                            className="p-1 hover:bg-black/10 rounded-md transition-colors ml-1 cursor-pointer"
                            title="Detach to standalone column"
                          >
                            <Unlink className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </>
              );
            })()}
          </nav>
        )}`;

code = code.replace(headerRegex, updatedHeader);

fs.writeFileSync('components/workspace/RightHubColumn.tsx', code);
console.log('Fixed RightHubColumn headers');
