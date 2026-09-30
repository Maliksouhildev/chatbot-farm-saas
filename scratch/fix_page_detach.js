const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Add detachedTabs state
const stateRegex = /const \[columnOrder, setColumnOrder\] = useState\(\['switcher', 'chat', 'hub'\]\);/;
code = code.replace(stateRegex, `const [columnOrder, setColumnOrder] = useState(['switcher', 'chat', 'hub']);\n  const [detachedTabs, setDetachedTabs] = useState<string[]>([]);`);

// 2. Add handleDetachTab and handleReattachTab
const syncPrefsRegex = /const syncPreferences = async \(\) => \{/;
const handlers = `  const handleDetachTab = (tabId: string) => {
    setDetachedTabs(prev => {
      const next = [...prev, tabId];
      debouncedSyncPreferences({ detachedTabs: next });
      return next;
    });
    setColumnOrder(prev => {
      if (prev.includes(tabId)) return prev;
      const next = [...prev, tabId];
      debouncedSyncPreferences({ columnOrder: next });
      return next;
    });
  };

  const handleReattachTab = (tabId: string) => {
    setDetachedTabs(prev => {
      const next = prev.filter(t => t !== tabId);
      debouncedSyncPreferences({ detachedTabs: next });
      return next;
    });
    setColumnOrder(prev => {
      const next = prev.filter(c => c !== tabId);
      debouncedSyncPreferences({ columnOrder: next });
      return next;
    });
  };

  const syncPreferences = async () => {`;
code = code.replace(syncPrefsRegex, handlers);

// 3. Add to applyUserPreferences
const prefsPinnedRegex = /if \(prefs\.pinnedApps && Array\.isArray\(prefs\.pinnedApps\)\) \{[\s\S]*?localStorage\.setItem\(getStorageKey\('cf_pinned_apps'\), JSON\.stringify\(prefs\.pinnedApps\)\);\s*\}/;
const applyFix = `if (prefs.pinnedApps && Array.isArray(prefs.pinnedApps)) {
      setPinnedApps(prefs.pinnedApps);
      localStorage.setItem(getStorageKey('cf_pinned_apps'), JSON.stringify(prefs.pinnedApps));
    }
    if (prefs.detachedTabs && Array.isArray(prefs.detachedTabs)) {
      setDetachedTabs(prefs.detachedTabs);
    }`;
code = code.replace(prefsPinnedRegex, applyFix);

// 4. Render RightHubColumn for 'analytics' and 'settings'
const colIdRendererRegex = /colId === 'switcher' \? \([\s\S]*?\) : colId === 'chat' \? \([\s\S]*?\) : \([\s\S]*?<\/RightHubColumn>\s*\)/;

const newRenderer = `colId === 'switcher' ? (
                                      <AppSwitcherColumn
                                        dragHandleProps={dragHandleProps}
                                        appLastActivity={appLastActivity}
                                        selectedAppId={selectedAppId}
                                        onSelectApp={handleSelectApp}
                                        onOpenAddModal={() => setIsAddModalOpen(true)}
                                        onOpenConnectModal={handleOpenConnectModal}
                                        aiEnabledByChannel={aiEnabledByChannel}
                                        onToggleAi={handleToggleAi}
                                        connectedApps={displayedConnectedApps}
                                        pinnedApps={displayedPinnedApps}
                                        onUnpinApp={handleUnpinApp}
                                        onReorderApps={handleReorderApps}
                                        onSetPinnedApps={handleSetPinnedApps}
                                        onPinApp={handlePinApp}
                                      />
                                    ) : colId === 'chat' ? (
                                      <MiddleChatColumn
                                        dragHandleProps={dragHandleProps}
                                        selectedAppId={selectedAppId}
                                        selectedContactId={selectedContactId}
                                        isAiActive={aiEnabledByChannel[selectedAppId]}
                                        onToggleAi={() => handleToggleAi(selectedAppId)}
                                        isConnected={isChannelConnected(selectedAppId)}
                                        currentUser={session?.user}
                                        isLinked={isLinked}
                                        liveMessages={liveMessages[selectedAppId]?.[selectedContactId || ''] || []}
                                        liveContacts={liveContacts[selectedAppId] || []}
                                      />
                                    ) : colId === 'analytics' || colId === 'settings' ? (
                                      <RightHubColumn
                                        dragHandleProps={dragHandleProps}
                                        selectedAppId={selectedAppId}
                                        selectedContactId={selectedContactId}
                                        onSelectChat={setSelectedContactId}
                                        isAiActive={aiEnabledByChannel[selectedAppId]}
                                        onToggleAi={() => handleToggleAi(selectedAppId)}
                                        isConnected={isChannelConnected(selectedAppId)}
                                        currentUser={session?.user}
                                        liveContacts={liveContacts[selectedAppId] || []}
                                        isStandalone={true}
                                        activeTabOverride={colId as 'analytics' | 'settings'}
                                        onReattach={() => handleReattachTab(colId)}
                                      />
                                    ) : (
                                      <RightHubColumn
                                        dragHandleProps={dragHandleProps}
                                        selectedAppId={selectedAppId}
                                        selectedContactId={selectedContactId}
                                        onSelectChat={setSelectedContactId}
                                        isAiActive={aiEnabledByChannel[selectedAppId]}
                                        onToggleAi={() => handleToggleAi(selectedAppId)}
                                        isConnected={isChannelConnected(selectedAppId)}
                                        currentUser={session?.user}
                                        onContactAdded={(contact) => {
                                          setSelectedContactId(contact.id);
                                        }}
                                        onDisconnectChannel={(appId) => {
                                          setConnectedApps(prev => {
                                            const next = new Set(prev);
                                            next.delete(appId);
                                            return next;
                                          });
                                        }}
                                        liveContacts={liveContacts[selectedAppId] || []}
                                        detachedTabs={detachedTabs}
                                        onDetach={handleDetachTab}
                                      />
                                    )`;

code = code.replace(colIdRendererRegex, newRenderer);

fs.writeFileSync('app/page.tsx', code);
console.log('Fixed page.tsx to support detachable panels');
