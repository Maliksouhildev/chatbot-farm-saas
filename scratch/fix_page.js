const fs = require('fs');

const file = 'C:/Users/Public/projects/chatbot-farm/saas-web/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const importsToAdd = `import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableColumn({ id, children }: { id: string, children: (dragHandleProps: any) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    height: '100%',
  };

  return (
    <div ref={setNodeRef} style={style} className="h-full w-full relative">
      {children({ ...attributes, ...listeners })}
    </div>
  );
}
`;

content = content.replace("import React, { useState, useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\n" + importsToAdd);

const hooksToAdd = `  const [columnOrder, setColumnOrder] = useState(['switcher', 'chat', 'hub']);
  const [activeDragColId, setActiveDragColId] = useState<string | null>(null);

  const colSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleColDragStart = (event: any) => setActiveDragColId(event.active.id);
  const handleColDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveDragColId(null);
    if (over && active.id !== over.id) {
      setColumnOrder((prev) => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const activeThemeColor = APP_GRADIENT_THEMES[selectedAppId]?.solidColor || '#1B6648';
`;

content = content.replace("function HomeContent() {", "function HomeContent() {\n" + hooksToAdd);

const desktopWorkspaceRegex = /\{\/\* 1\. DESKTOP 3-COLUMN WORKSPACE[\s\S]*?\{\/\* 2\. MOBILE RESPONSIVE WORKSPACE/;

const newDesktopWorkspace = `{/* 1. DESKTOP 3-COLUMN WORKSPACE (Visible on screen width >= md / 768px) */}
                <div className="hidden md:flex w-full h-full min-h-0">
                  <style>{\`
                    .custom-resize-handle {
                      width: 6px;
                      background-color: transparent;
                      transition: background-color 0.2s;
                      cursor: col-resize;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      border-radius: 4px;
                      margin: 0 4px;
                    }
                    .custom-resize-handle:hover,
                    .custom-resize-handle[data-resize-handle-state="drag"] {
                      background-color: \${activeThemeColor};
                    }
                  \`}</style>
                  <DndContext sensors={colSensors} collisionDetection={closestCenter} onDragStart={handleColDragStart} onDragEnd={handleColDragEnd}>
                    <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                      <PanelGroup direction="horizontal" id="desktop-workspace">
                        {columnOrder.map((colId, index) => {
                          if (colId === 'hub' && isRightHubCollapsed) return null;
                          return (
                            <React.Fragment key={colId}>
                              <Panel id={colId} order={index} defaultSize={colId === 'switcher' ? 25 : colId === 'chat' ? (isRightHubCollapsed ? 75 : 45) : 30} minSize={20}>
                                <SortableColumn id={colId}>
                                  {(dragHandleProps) => (
                                    colId === 'switcher' ? (
                                      <AppSwitcherColumn
                                        dragHandleProps={dragHandleProps}
                                        appLastActivity={appLastActivity}
                                        selectedAppId={selectedAppId}
                                        onSelectApp={handleSelectApp}
                                        onOpenAddModal={() => setIsAddModalOpen(true)}
                                        onOpenConnectModal={handleOpenConnectModal}
                                        aiEnabledByChannel={aiEnabledByChannel}
                                        onToggleAi={handleToggleAi}
                                        connectedApps={connectedApps}
                                        pinnedApps={pinnedApps}
                                        onUnpinApp={handleUnpinApp}
                                        onReorderApps={handleReorderApps}
                                        onSetPinnedApps={handleSetPinnedApps}
                                        onPinApp={handlePinApp}
                                      />
                                    ) : colId === 'chat' ? (
                                      <MiddleChatColumn
                                        dragHandleProps={dragHandleProps}
                                        appId={selectedAppId}
                                        selectedContactId={selectedContactId}
                                        isLinked={isLinked}
                                        onLinkSuccess={() => setIsLinked(true)}
                                        onOpenAuth={() => setIsAuthModalOpen(true)}
                                        darkMode={darkMode}
                                        isAiActive={aiEnabledByChannel[selectedAppId] ?? false}
                                        onToggleAi={() => handleToggleAi(selectedAppId)}
                                        isConnected={connectedApps.has(selectedAppId)}
                                        onOpenConnect={() => handleOpenConnectModal(selectedAppId)}
                                        onDisconnect={handleDisconnectChannel}
                                        liveContacts={liveChatsByApp[selectedAppId] ?? []}
                                        onMessageActivity={handleMessageActivity}
                                        currentUser={currentUser}
                                        channelError={channelErrors[selectedAppId]}
                                      />
                                    ) : colId === 'hub' ? (
                                      <RightHubColumn
                                        dragHandleProps={dragHandleProps}
                                        selectedAppId={selectedAppId}
                                        selectedContactId={selectedContactId}
                                        onSelectChat={(chatId) => setSelectedContactId(chatId)}
                                        isAiActive={aiEnabledByChannel[selectedAppId] ?? false}
                                        onToggleAi={() => handleToggleAi(selectedAppId)}
                                        isConnected={connectedApps.has(selectedAppId)}
                                        liveContacts={liveChatsByApp[selectedAppId] ?? []}
                                        currentUser={currentUser}
                                        onContactAdded={(contact) => handleContactAdded(selectedAppId, contact)}
                                        onDisconnectChannel={handleDisconnectChannel}
                                      />
                                    ) : null
                                  )}
                                </SortableColumn>
                              </Panel>
                              {index < columnOrder.length - 1 && (!isRightHubCollapsed || index < columnOrder.filter(c => c !== 'hub').length - 1) && (
                                <PanelResizeHandle className="custom-resize-handle" />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </PanelGroup>
                    </SortableContext>
                  </DndContext>
                </div>

                {/* 2. MOBILE RESPONSIVE WORKSPACE`;

content = content.replace(desktopWorkspaceRegex, newDesktopWorkspace);

fs.writeFileSync(file, content);
console.log('Done');
