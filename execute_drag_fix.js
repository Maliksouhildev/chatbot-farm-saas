const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

const target = `{columnOrder.map((colId, index) => {
                          if (colId === 'hub' && isRightHubCollapsed) return null;
                          const colThemeColor = activeThemeColor;
                          return (
                            <React.Fragment key={colId}>
                              <Panel 
                                id={colId} 
                                defaultSize={colId === 'switcher' ? 25 : colId === 'chat' ? (isRightHubCollapsed ? 75 : 45) : 30} 
                                minSize={2}
                                style={{ overflow: activeDragColId ? 'visible' : 'hidden', zIndex: activeDragColId === colId ? 9999 : 1 }}
                              >`;

const replacement = `(() => {
                          const visibleColumns = columnOrder.filter(c => !(c === 'hub' && isRightHubCollapsed));
                          return visibleColumns.map((colId, index) => {
                            const colThemeColor = activeThemeColor;
                            return (
                              <React.Fragment key={colId}>
                                <Panel 
                                  id={colId}
                                  order={index + 1}
                                  defaultSize={colId === 'switcher' ? 25 : colId === 'chat' ? (isRightHubCollapsed ? 75 : 45) : 30} 
                                  minSize={2}
                                  style={{ overflow: activeDragColId ? 'visible' : 'hidden', zIndex: activeDragColId === colId ? 9999 : 1 }}
                                >`;

c = c.replace(target, replacement);

const targetSeparator = `{index < columnOrder.length - 1 && (!isRightHubCollapsed || index < columnOrder.filter(c => c !== 'hub').length - 1) && (
                                <Separator className="custom-resize-handle" />
                              )}
                            </React.Fragment>
                          );
                        })}`;

const replacementSeparator = `{index < visibleColumns.length - 1 && (
                                  <Separator className="custom-resize-handle" />
                                )}
                              </React.Fragment>
                            );
                          });
                        })()}`;

c = c.replace(targetSeparator, replacementSeparator);

fs.writeFileSync('app/page.tsx', c);
console.log("Successfully executed drag fix plan");
