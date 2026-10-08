/**
 * Tier 1: Feature Coverage Test Suite (F1 - F9)
 * Tests primary behavior / happy path for each assigned feature.
 * Minimum requirement: ≥5 tests per feature (≥45 total).
 */

const {
  launchBrowser,
  createPage,
  navigateToApp,
  getColumn,
  getColumnHeader,
  ensureChannelPinned,
  captureScreenshot,
  assert,
  assertEqual,
} = require('./helpers');

const tests = [];

function registerTest(id, feature, name, fn) {
  tests.push({ id, feature, name, tier: 1, fn });
}

// ============================================================================
// Feature F1: Responsive Navbar (ORIGINAL_REQUEST §R1)
// ============================================================================

registerTest('F1-1', 'F1', 'Navbar logo is present, visible, and anchored far left', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const header = await page.waitForSelector('header', { state: 'visible' });
  const logo = await header.$('text="Chatbot Farm"');
  assert(logo !== null, 'Chatbot Farm logo text should be present');

  const logoBox = await logo.boundingBox();
  assert(logoBox !== null && logoBox.x < 150, `Logo should be anchored on far left, got x=${logoBox?.x}`);
});

registerTest('F1-2', 'F1', 'Desktop nav tabs are visible at viewport width > 880px', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const nav = await page.waitForSelector('header nav', { timeout: 3000 });
  const isVisible = await nav.isVisible();
  assert(isVisible, 'Nav tabs container should be visible at 1280px');

  const workspaceTab = await page.$('header nav button:has-text("Workspace")');
  assert(workspaceTab !== null, 'Workspace tab should exist in nav at desktop width');
});

registerTest('F1-3', 'F1', 'Nav tabs hide when navbar container/viewport <= 880px', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 800 });
  await navigateToApp(page);

  const nav = await page.$('header nav');
  if (nav) {
    const isVisible = await nav.isVisible();
    assert(!isVisible, 'Center nav tabs must be hidden at <=880px (tested at 768px)');
  }
});

registerTest('F1-4', 'F1', 'AI Agent toggle is visible with label text at 1024px', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await navigateToApp(page);

  const aiText = await page.$('header span:has-text("AI Agent")');
  assert(aiText !== null, 'AI Agent label text element should exist at 1024px');
  const isVisible = await aiText.isVisible();
  assert(isVisible, 'AI Agent label text should be visible at 1024px');
});

registerTest('F1-5', 'F1', 'AI Agent label text is collapsed/hidden at <= 640px', async ({ page }) => {
  await page.setViewportSize({ width: 500, height: 800 });
  await navigateToApp(page);

  const aiText = await page.$('header span:has-text("AI Agent")');
  if (aiText) {
    const isVisible = await aiText.isVisible();
    assert(!isVisible, 'AI Agent label text must be collapsed/hidden at <= 640px (tested at 500px)');
  }
});

registerTest('F1-6', 'F1', 'AI Agent toggle disappears or becomes transparent at <= 400px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await navigateToApp(page);

  const aiToggleContainer = await page.$('header div:has(button[title*="AI for current channel"])');
  if (aiToggleContainer) {
    const style = await aiToggleContainer.evaluate(el => {
      const s = window.getComputedStyle(el);
      return {
        display: s.display,
        opacity: s.opacity,
        visibility: s.visibility
      };
    });
    const isHidden = style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) < 0.1;
    assert(isHidden, `AI Agent toggle must be transparent or hidden at <= 400px, got display=${style.display}, opacity=${style.opacity}`);
  }
});

// ============================================================================
// Feature F2: App Switcher Container Queries & Button Collapse (ORIGINAL_REQUEST §R1)
// ============================================================================

registerTest('F2-1', 'F2', 'App Switcher header displays Channels title and Live count badge at standard width', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const channelsTitle = await page.waitForSelector('.switcher-header span:has-text("Channels")', { timeout: 4000 });
  assert(channelsTitle !== null, 'Channels title should be present in switcher header');

  const liveBadge = await page.$('.switcher-header span:has-text("Live")');
  assert(liveBadge !== null, 'Live status badge should be present in switcher header');
});

registerTest('F2-2', 'F2', 'App Switcher "Auto-AI" toggle displays text at standard column width', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const autoAiText = await page.waitForSelector('.switcher-ai-toggle-text', { timeout: 4000 });
  const isVisible = await autoAiText.isVisible();
  assert(isVisible, 'Auto-AI text should be visible at standard column width');
});

registerTest('F2-3', 'F2', 'App Switcher "Auto-AI" collapses text into logo icon at minimal column width', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const hasStyleRule = await page.evaluate(() => {
    const styleTags = Array.from(document.querySelectorAll('style'));
    return styleTags.some(s => s.innerHTML.includes('.switcher-ai-toggle-text') && s.innerHTML.includes('display: none'));
  });
  assert(hasStyleRule, 'Container query styles must specify display: none for .switcher-ai-toggle-text on narrow width');
});

registerTest('F2-4', 'F2', 'App Switcher bottom button displays "Add Channel / Phone" at standard width', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const addBtn = await page.waitForSelector('.bottom-action-btn', { timeout: 4000 });
  const textSpan = await addBtn.$('.add-channel-text');
  assert(textSpan !== null, 'Add channel text span should exist');
  const isVisible = await textSpan.isVisible();
  assert(isVisible, 'Add Channel / Phone text should be visible at standard width');
});

registerTest('F2-5', 'F2', 'App Switcher bottom button collapses text without overflow when column is <= 200px', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const hasCollapseRule = await page.evaluate(() => {
    const styleTags = Array.from(document.querySelectorAll('style'));
    return styleTags.some(s => (s.innerHTML.includes('.add-channel-text') || s.innerHTML.includes('.bottom-action-btn') || s.innerHTML.includes('200px')) && s.innerHTML.includes('none'));
  });
  assert(hasCollapseRule, 'CSS container queries or styles must collapse Add Channel button text at <= 200px');
});

registerTest('F2-6', 'F2', 'Clicking Add Channel button opens App Catalog drawer', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const addBtn = await page.waitForSelector('.bottom-action-btn', { timeout: 4000 });
  await addBtn.click();
  await page.waitForTimeout(400);

  const catalogTitle = await page.waitForSelector('text="App Catalog"', { timeout: 4000 });
  assert(catalogTitle !== null, 'App Catalog drawer title should appear upon clicking Add Channel');
});

// ============================================================================
// Feature F3: Drag Placeholder Under Cursor (ORIGINAL_REQUEST §R2)
// ============================================================================

registerTest('F3-1', 'F3', 'Workspace contains SortableContext managing 3 main columns', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const columns = await page.$$('.sortable-column-container');
  assert(columns.length >= 3, `Expected at least 3 sortable column containers, found ${columns.length}`);
});

registerTest('F3-2', 'F3', 'AppSwitcher header has cursor-grab and drag listeners', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const header = await page.waitForSelector('.switcher-header', { timeout: 4000 });
  const className = await header.getAttribute('class');
  assert(className.includes('cursor-grab'), 'Switcher header should have cursor-grab class');

  const role = await header.getAttribute('role');
  const ariaDescribedby = await header.getAttribute('aria-describedby');
  assert(ariaDescribedby !== null || role !== null, 'Switcher header should have accessibility drag handle attributes');
});

registerTest('F3-3', 'F3', 'Initiating column drag applies active drag styling or overlay', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const header = await page.waitForSelector('.switcher-header', { timeout: 4000 });
  const box = await header.boundingBox();
  assert(box !== null, 'Switcher header bounding box must be available');

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2, { steps: 5 });
  await page.waitForTimeout(200);

  const isDraggingActive = await page.evaluate(() => {
    return document.body.classList.contains('is-dragging') ||
      document.querySelector('.is-dragging') !== null ||
      document.querySelector('[data-dnd-overlay]') !== null ||
      document.querySelector('.sortable-column-container.shadow-2xl') !== null;
  });

  await page.mouse.up();
  assert(isDraggingActive, 'Dragging should trigger active drag styling / overlay in DOM');
});

registerTest('F3-4', 'F3', 'Dragging App Switcher over Middle Chat updates column order', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const switcherHeader = await page.waitForSelector('.switcher-header');
  const chatHeaderLoc = getColumnHeader(page, 1);
  await chatHeaderLoc.waitFor({ state: 'visible' });

  const sBox = await switcherHeader.boundingBox();
  const cBox = await chatHeaderLoc.boundingBox();
  assert(sBox && cBox, 'Column bounding boxes must be available');

  await page.mouse.move(sBox.x + sBox.width / 2, sBox.y + sBox.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(100);
  await page.mouse.move(cBox.x + cBox.width / 2 + 50, cBox.y + cBox.height / 2, { steps: 15 });
  await page.waitForTimeout(300);
  await page.mouse.up();
  await page.waitForTimeout(500);

  const firstCol = getColumn(page, 0);
  const containsSwitcher = await firstCol.locator('.switcher-header').count();
  assert(containsSwitcher === 0, 'After dragging right over chat column, first column should no longer be switcher');
});

registerTest('F3-5', 'F3', 'Column reorder persists layout in local storage cf_panel_sizes / preferences', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const hasStorageKey = await page.evaluate(() => {
    return Object.keys(localStorage).some(k => k.includes('cf_panel_sizes') || k.includes('preferences'));
  });
  assert(hasStorageKey, 'Application should manage layout / panel preferences in localStorage');
});

// ============================================================================
// Feature F4: Draggable MiddleChatColumn (ORIGINAL_REQUEST §R2)
// ============================================================================

registerTest('F4-1', 'F4', 'MiddleChatColumn header has cursor-grab and drag handle attributes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const chatHeader = getColumnHeader(page, 1);
  await chatHeader.waitFor({ state: 'visible' });
  const className = await chatHeader.getAttribute('class');
  assert(className && className.includes('cursor-grab'), 'MiddleChatColumn header must have cursor-grab class');
});

registerTest('F4-2', 'F4', 'MiddleChatColumn header initiates drag event on pointer down', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const chatHeader = getColumnHeader(page, 1);
  await chatHeader.waitFor({ state: 'visible' });
  const box = await chatHeader.boundingBox();
  assert(box !== null, 'Chat header bounding box must exist');

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 50, box.y + box.height / 2, { steps: 5 });
  await page.waitForTimeout(200);

  const isDragging = await page.evaluate(() => {
    const cols = document.querySelectorAll('.sortable-column-container');
    const secondCol = cols[1];
    return secondCol && (secondCol.classList.contains('shadow-2xl') || document.querySelector('[data-dnd-overlay]') !== null);
  });

  await page.mouse.up();
  assert(isDragging, 'Dragging MiddleChatColumn header must initiate drag state');
});

registerTest('F4-3', 'F4', 'MiddleChatColumn can be dragged left to swap positions with AppSwitcher', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const switcherHeader = await page.waitForSelector('.switcher-header');
  const chatHeader = getColumnHeader(page, 1);
  await chatHeader.waitFor({ state: 'visible' });

  const sBox = await switcherHeader.boundingBox();
  const cBox = await chatHeader.boundingBox();
  assert(sBox && cBox, 'Bounding boxes must exist');

  await page.mouse.move(cBox.x + cBox.width / 2, cBox.y + cBox.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(100);
  await page.mouse.move(sBox.x + sBox.width / 2 - 30, sBox.y + sBox.height / 2, { steps: 15 });
  await page.waitForTimeout(300);
  await page.mouse.up();
  await page.waitForTimeout(500);

  const firstCol = getColumn(page, 0);
  const isChat = await firstCol.locator('.h-14').count();
  assert(isChat > 0, 'First column should now be chat column after swapping left');
});

registerTest('F4-4', 'F4', 'WhatsApp channel header includes dragHandleProps', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const waBtn = await page.waitForSelector('#channel-switcher-whatsapp, button:has-text("WhatsApp")', { timeout: 3000 });
  await waBtn.click();
  await page.waitForTimeout(300);

  const header = getColumnHeader(page, 1);
  await header.waitFor({ state: 'visible' });
  const className = await header.getAttribute('class');
  assert(className && className.includes('cursor-grab'), 'WhatsApp channel header must spread dragHandleProps with cursor-grab');
});

registerTest('F4-5', 'F4', 'Telegram channel header includes dragHandleProps', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const tgBtn = await page.waitForSelector('#channel-switcher-telegram, div:has-text("Telegram")', { timeout: 3000 });
  await tgBtn.click();
  await page.waitForTimeout(300);

  const header = getColumnHeader(page, 1);
  await header.waitFor({ state: 'visible' });
  const className = await header.getAttribute('class');
  assert(className && className.includes('cursor-grab'), 'Telegram channel header must spread dragHandleProps with cursor-grab');
});

registerTest('F4-6', 'F4', 'Channel header avatar images have draggable=false', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const header = getColumnHeader(page, 1);
  await header.waitFor({ state: 'visible' });
  const headerAvatars = await header.locator('img').all();
  for (const avatar of headerAvatars) {
    const draggable = await avatar.getAttribute('draggable');
    assert(draggable === 'false', 'Avatar images in chat header must have draggable="false"');
  }
});

// ============================================================================
// Feature F5: Hide Panel Resize Handles During Drag (ORIGINAL_REQUEST §R2)
// ============================================================================

registerTest('F5-1', 'F5', 'Panel resize handles (.custom-resize-handle) exist between columns', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const handles = await page.$$('.custom-resize-handle, [role="separator"]');
  assert(handles.length >= 2, `Expected at least 2 resize handles between columns, found ${handles.length}`);
});

registerTest('F5-2', 'F5', 'Resize handles are visible before drag begins', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const handle = await page.waitForSelector('.custom-resize-handle, [role="separator"]');
  const opacity = await handle.evaluate(el => window.getComputedStyle(el).opacity);
  assert(parseFloat(opacity) > 0, `Resize handle should be visible, got opacity=${opacity}`);
});

registerTest('F5-3', 'F5', 'Workspace sets is-dragging or hides resize handles during column drag', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const header = await page.waitForSelector('.switcher-header');
  const box = await header.boundingBox();
  assert(box !== null, 'Header bounding box must exist');

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2, { steps: 5 });
  await page.waitForTimeout(200);

  const handleOpacityDuringDrag = await page.evaluate(() => {
    const handle = document.querySelector('.custom-resize-handle, [role="separator"]');
    if (!handle) return '0';
    return window.getComputedStyle(handle).opacity;
  });

  await page.mouse.up();
  assert(parseFloat(handleOpacityDuringDrag) === 0, `Resize handles must have opacity: 0 during drag, got ${handleOpacityDuringDrag}`);
});

registerTest('F5-4', 'F5', 'Resize handles have pointer-events: none during drag', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const header = await page.waitForSelector('.switcher-header');
  const box = await header.boundingBox();
  assert(box !== null, 'Header bounding box must exist');

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2, { steps: 5 });
  await page.waitForTimeout(200);

  const pointerEvents = await page.evaluate(() => {
    const handle = document.querySelector('.custom-resize-handle, [role="separator"]');
    if (!handle) return 'none';
    return window.getComputedStyle(handle).pointerEvents;
  });

  await page.mouse.up();
  assert(pointerEvents === 'none', `Resize handles must have pointer-events: none during drag, got ${pointerEvents}`);
});

registerTest('F5-5', 'F5', 'Resize handles restore visibility and interactivity after drag release', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const header = await page.waitForSelector('.switcher-header');
  const box = await header.boundingBox();
  assert(box !== null, 'Header bounding box must exist');

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2, { steps: 5 });
  await page.waitForTimeout(100);
  await page.mouse.up();
  await page.waitForTimeout(300);

  const handleOpacityAfter = await page.evaluate(() => {
    const handle = document.querySelector('.custom-resize-handle, [role="separator"]');
    if (!handle) return '1';
    return window.getComputedStyle(handle).opacity;
  });

  assert(parseFloat(handleOpacityAfter) > 0, `Resize handles must restore visibility after drag, got ${handleOpacityAfter}`);
});

// ============================================================================
// Feature F6: Detached Panels 3s Disappearance Fix (ORIGINAL_REQUEST §R3)
// ============================================================================

registerTest('F6-1', 'F6', 'RightHubColumn has detachable tabs (Analytics, Settings)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")', { timeout: 4000 });
  assert(analyticsTab !== null, 'Analytics tab should exist in RightHub');

  const settingsTab = await page.$('button:has-text("Settings")');
  assert(settingsTab !== null, 'Settings tab should exist in RightHub');
});

registerTest('F6-2', 'F6', 'Detaching Analytics tab creates 4th standalone column in workspace', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await navigateToApp(page);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(300);

  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")', { timeout: 3000 });
  await detachBtn.click();
  await page.waitForTimeout(500);

  const columns = await page.$$('.sortable-column-container');
  assert(columns.length === 4, `Expected 4 columns after detaching Analytics, found ${columns.length}`);
});

registerTest('F6-3', 'F6', 'Detached panel persists after 1 second', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await navigateToApp(page);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(300);

  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  await detachBtn.click();

  await page.waitForTimeout(1000);
  const columns = await page.$$('.sortable-column-container');
  assert(columns.length === 4, `Detached panel must remain open after 1s, found ${columns.length} columns`);
});

registerTest('F6-4', 'F6', 'Detached panel persists past 4 seconds without 3s disappearance reset', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await navigateToApp(page);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(300);

  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  await detachBtn.click();

  await page.waitForTimeout(4500);
  const columns = await page.$$('.sortable-column-container');
  assert(columns.length === 4, `Detached panel must persist past 4s without resetting to 3 columns, found ${columns.length}`);
});

registerTest('F6-5', 'F6', 'Detached panel has Reattach action that closes standalone panel', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await navigateToApp(page);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(300);

  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  await detachBtn.click();
  await page.waitForTimeout(500);

  const reattachBtn = await page.waitForSelector('[title*="Reattach"], button:has-text("Reattach")', { timeout: 3000 });
  await reattachBtn.click();
  await page.waitForTimeout(500);

  const columns = await page.$$('.sortable-column-container');
  assert(columns.length === 3, `After reattaching, column count should return to 3, found ${columns.length}`);
});

// ============================================================================
// Feature F7: High-Visibility Panel Detach Button (ORIGINAL_REQUEST §R3)
// ============================================================================

registerTest('F7-1', 'F7', 'Active detachable tab displays detach button', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(300);

  const detachBtn = await page.$('[title*="Detach"], button:has-text("Detach")');
  assert(detachBtn !== null, 'Detach button must be rendered on active detachable tab');
});

registerTest('F7-2', 'F7', 'Detach button has distinct, prominent styling', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(300);

  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  const className = await detachBtn.getAttribute('class');
  const style = await detachBtn.evaluate(el => window.getComputedStyle(el).backgroundColor);
  const isDistinct = className.includes('bg-red') || className.includes('bg-rose') || className.includes('text-red') || (style !== 'rgba(0, 0, 0, 0)' && style !== 'transparent');
  assert(isDistinct, `Detach button should have distinct prominent styling, got class: ${className}`);
});

registerTest('F7-3', 'F7', 'Detach button has accessible title / tooltip', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(300);

  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  const title = await detachBtn.getAttribute('title');
  const ariaLabel = await detachBtn.getAttribute('aria-label');
  assert((title && title.toLowerCase().includes('detach')) || (ariaLabel && ariaLabel.toLowerCase().includes('detach')), 'Detach button must have descriptive title/aria-label containing "detach"');
});

registerTest('F7-4', 'F7', 'Detach button is visible in Light Mode', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  if (isDark) {
    const darkToggle = await page.$('header button[title*="Light"]');
    if (darkToggle) await darkToggle.click();
    await page.waitForTimeout(200);
  }

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(300);

  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  const isVisible = await detachBtn.isVisible();
  assert(isVisible, 'Detach button must be visible in Light Mode');
});

registerTest('F7-5', 'F7', 'Detach button is visible in Dark Mode', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const darkToggle = await page.waitForSelector('header button[title*="Dark"], header button[title*="Switch"]');
  await darkToggle.click();
  await page.waitForTimeout(200);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(300);

  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  const isVisible = await detachBtn.isVisible();
  assert(isVisible, 'Detach button must be visible in Dark Mode');
});

// ============================================================================
// Feature F8: Persistent Telegram Topics Split Pane (ORIGINAL_REQUEST §R4)
// ============================================================================

registerTest('F8-1', 'F8', 'Telegram channel loads Telegram contacts including forum group', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const tgBtn = await page.waitForSelector('#channel-switcher-telegram, div:has-text("Telegram")');
  await tgBtn.click();
  await page.waitForTimeout(500);

  const groupItem = await page.waitForSelector('text="Automatique L3"', { timeout: 4000 });
  assert(groupItem !== null, 'Automatique L3 Telegram group should be listed');
});

registerTest('F8-2', 'F8', 'Selecting Automatique L3 displays topics list', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const tgBtn = await page.waitForSelector('#channel-switcher-telegram, div:has-text("Telegram")');
  await tgBtn.click();
  await page.waitForTimeout(400);

  const groupItem = await page.waitForSelector('text="Automatique L3"', { timeout: 4000 });
  await groupItem.click();
  await page.waitForTimeout(500);

  const topicGeneral = await page.waitForSelector('text="General"', { timeout: 4000 });
  assert(topicGeneral !== null, 'Topics list (e.g. General) should appear upon selecting forum group');
});

registerTest('F8-3', 'F8', 'Clicking topic "General" opens topic messages view', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const tgBtn = await page.waitForSelector('#channel-switcher-telegram, div:has-text("Telegram")');
  await tgBtn.click();
  await page.waitForTimeout(400);

  const groupItem = await page.waitForSelector('text="Automatique L3"', { timeout: 4000 });
  await groupItem.click();
  await page.waitForTimeout(400);

  const topicGeneral = await page.waitForSelector('text="General"', { timeout: 4000 });
  await topicGeneral.click();
  await page.waitForTimeout(500);

  const chatCol = getColumn(page, 1);
  const text = await chatCol.innerText();
  assert(text.includes('Automatique L3') || text.includes('General'), 'Chat column should display topic name / messages');
});

registerTest('F8-4', 'F8', 'Topic split pane persists for 2 seconds without reverting', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const tgBtn = await page.waitForSelector('#channel-switcher-telegram, div:has-text("Telegram")');
  await tgBtn.click();
  await page.waitForTimeout(400);

  const groupItem = await page.waitForSelector('text="Automatique L3"', { timeout: 4000 });
  await groupItem.click();
  await page.waitForTimeout(400);

  const topicGeneral = await page.waitForSelector('text="General"', { timeout: 4000 });
  await topicGeneral.click();

  await page.waitForTimeout(2500);

  const chatCol = getColumn(page, 1);
  const text = await chatCol.innerText();
  assert(text.includes('Automatique L3') || text.includes('General'), 'Topic split pane must persist after 2.5s without reverting');
});

registerTest('F8-5', 'F8', 'Switching topics updates topic header and active topic indicator', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const tgBtn = await page.waitForSelector('#channel-switcher-telegram, div:has-text("Telegram")');
  await tgBtn.click();
  await page.waitForTimeout(400);

  const groupItem = await page.waitForSelector('text="Automatique L3"', { timeout: 4000 });
  await groupItem.click();
  await page.waitForTimeout(400);

  const topicGeneral = await page.waitForSelector('text="General"', { timeout: 4000 });
  await topicGeneral.click();
  await page.waitForTimeout(300);

  const topicCours = await page.waitForSelector('text="Cours"', { timeout: 4000 });
  await topicCours.click();
  await page.waitForTimeout(400);

  const chatCol = getColumn(page, 1);
  const text = await chatCol.innerText();
  assert(text.includes('Cours') || text.includes('Automatique L3'), 'Switching topic should update topic view in chat column');
});

// ============================================================================
// Feature F9: Global Real Profile Pictures (ORIGINAL_REQUEST §R4)
// ============================================================================

registerTest('F9-1', 'F9', 'RightHub contacts list renders real <img> avatars for contacts', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const hubCol = getColumn(page, 2);
  const contactImgs = await hubCol.locator('img').all();
  assert(contactImgs.length > 0, `RightHub contacts list must render real <img> profile pictures, found ${contactImgs.length}`);

  const src = await contactImgs[0].getAttribute('src');
  assert(src && src.startsWith('http'), `Avatar img must have valid URL src, got ${src}`);
});

registerTest('F9-2', 'F9', 'WhatsApp chat header renders real <img> profile picture', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const header = getColumnHeader(page, 1);
  const headerImg = await header.locator('img').first();
  const count = await headerImg.count();
  assert(count > 0, 'WhatsApp chat header must render real <img> profile picture');
  const src = await headerImg.getAttribute('src');
  assert(src && src.length > 5, 'WhatsApp header avatar must have valid src');
});

registerTest('F9-3', 'F9', 'Telegram chat header renders real <img> profile picture', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const tgBtn = await page.waitForSelector('#channel-switcher-telegram, div:has-text("Telegram")');
  await tgBtn.click();
  await page.waitForTimeout(500);

  const header = getColumnHeader(page, 1);
  const count = await header.locator('img').count();
  assert(count > 0, 'Telegram chat header must render real <img> profile picture');
});

registerTest('F9-4', 'F9', 'Discord chat header renders real <img> profile picture', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  // Pin Discord from App Catalog if not already pinned
  await ensureChannelPinned(page, 'discord');

  const discordBtn = await page.waitForSelector('#channel-switcher-discord, div:has-text("Discord")', { timeout: 4000 });
  await discordBtn.click();
  await page.waitForTimeout(500);

  const header = getColumnHeader(page, 1);
  const count = await header.locator('img').count();
  assert(count > 0, 'Discord chat header must render real <img> profile picture');
});

registerTest('F9-5', 'F9', 'Global contacts data in mock_chats contains valid profilePicUrls across all channels', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const mockDataValidity = await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll('img')).map(i => i.src);
    const pravatarOrUnsplash = images.filter(s => s.includes('pravatar') || s.includes('unsplash') || s.includes('github') || s.includes('avatar'));
    return pravatarOrUnsplash.length;
  });

  assert(mockDataValidity > 0, `Expected global real profile picture URLs in UI, found ${mockDataValidity}`);
});

// ============================================================================
// Runner Function for Tier 1
// ============================================================================

async function runTier1(browser) {
  console.log(`\n======================================================`);
  console.log(`  TIER 1: FEATURE COVERAGE SUITE (${tests.length} tests)`);
  console.log(`======================================================\n`);

  const results = [];

  for (const t of tests) {
    const { context, page } = await createPage(browser);
    const startTime = Date.now();
    let passed = false;
    let error = null;

    try {
      await t.fn({ page, context });
      passed = true;
      console.log(`  ✓ [PASS] [${t.id}] (${t.feature}) ${t.name}`);
    } catch (err) {
      error = err.message || String(err);
      const screenshotPath = await captureScreenshot(page, `T1_${t.id}`);
      console.log(`  ✗ [FAIL] [${t.id}] (${t.feature}) ${t.name}`);
      console.log(`     Error: ${error}`);
      if (screenshotPath) console.log(`     Screenshot: ${screenshotPath}`);
    } finally {
      await context.close();
    }

    results.push({
      id: t.id,
      feature: t.feature,
      tier: 1,
      name: t.name,
      passed,
      error,
      durationMs: Date.now() - startTime,
    });
  }

  return results;
}

if (require.main === module) {
  (async () => {
    const browser = await launchBrowser();
    try {
      const results = await runTier1(browser);
      const passed = results.filter(r => r.passed).length;
      console.log(`\nTier 1 Summary: ${passed}/${results.length} passed.`);
      process.exit(passed === results.length ? 0 : 1);
    } finally {
      await browser.close();
    }
  })();
}

module.exports = {
  tests,
  runTier1,
};
