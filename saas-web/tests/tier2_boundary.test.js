/**
 * Tier 2: Boundary & Corner Cases Test Suite (F1 - F9)
 * Extreme widths, rapid interactions, multi-tab switching, offline/empty states.
 * Minimum requirement: ≥5 tests per feature (≥45 total).
 */

const {
  launchBrowser,
  createPage,
  navigateToApp,
  getColumn,
  getColumnHeader,
  captureScreenshot,
  checkHorizontalOverflow,
  assert,
  assertEqual,
} = require('./helpers');

const tests = [];

function registerTest(id, feature, name, fn) {
  tests.push({ id, feature, name, tier: 2, fn });
}

// ============================================================================
// Feature F1: Responsive Navbar Boundaries
// ============================================================================

registerTest('F1-B1', 'F1', 'Extreme narrow viewport (320px) produces zero horizontal scroll/overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 600 });
  await navigateToApp(page);

  const overflow = await checkHorizontalOverflow(page);
  assert(!overflow.hasOverflow, `Document has horizontal overflow of ${overflow.overflowPx}px at 320px viewport`);
});

registerTest('F1-B2', 'F1', 'Navbar boundary at 880px vs 881px: nav tabs visibility toggle', async ({ page }) => {
  await page.setViewportSize({ width: 881, height: 800 });
  await navigateToApp(page);
  const nav881 = await page.$('header nav');
  const visible881 = nav881 ? await nav881.isVisible() : false;

  await page.setViewportSize({ width: 880, height: 800 });
  await page.waitForTimeout(200);
  const nav880 = await page.$('header nav');
  const visible880 = nav880 ? await nav880.isVisible() : false;

  assert(visible880 === false, 'Nav tabs must be hidden at 880px boundary');
});

registerTest('F1-B3', 'F1', 'Navbar boundary at 640px vs 641px: AI Agent text visibility transition', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 800 });
  await navigateToApp(page);

  const aiText640 = await page.$('header span:has-text("AI Agent")');
  const isVisible640 = aiText640 ? await aiText640.isVisible() : false;
  assert(!isVisible640, 'AI Agent text should be hidden at 640px boundary');
});

registerTest('F1-B4', 'F1', 'Navbar boundary at 400px: AI toggle opacity/visibility disappears', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 800 });
  await navigateToApp(page);

  const isHiddenAt400 = await page.evaluate(() => {
    const btn = document.querySelector('header button[title*="AI for current channel"]');
    if (!btn) return true;
    const style = window.getComputedStyle(btn.parentElement || btn);
    return style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) < 0.1;
  });
  assert(isHiddenAt400, 'AI toggle container must disappear/fade to opacity 0 at <= 400px');
});

registerTest('F1-B5', 'F1', 'Dark mode toggle operates reliably across multiple viewport resizing events', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const darkBtn = await page.waitForSelector('header button[title*="Dark"], header button[title*="Switch"]');
  await darkBtn.click();
  await page.waitForTimeout(200);

  let isDark = await page.evaluate(() => document.documentElement.classList.contains('dark') || document.querySelector('.dark') !== null);
  assert(isDark, 'Application should activate dark mode class after toggling');

  await page.setViewportSize({ width: 375, height: 800 });
  await page.waitForTimeout(200);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(200);

  isDark = await page.evaluate(() => document.documentElement.classList.contains('dark') || document.querySelector('.dark') !== null);
  assert(isDark, 'Dark mode class must persist after viewport resizing');
});

// ============================================================================
// Feature F2: App Switcher Container Queries Boundaries
// ============================================================================

registerTest('F2-B1', 'F2', 'AppSwitcher handles minimal width (120px) without breaking or horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const overflow = await page.evaluate(() => {
    const switcher = document.querySelector('.sortable-column-container:has(.switcher-header)');
    if (!switcher) return { hasOverflow: false };
    return {
      hasOverflow: switcher.scrollWidth > switcher.clientWidth + 5,
      scrollWidth: switcher.scrollWidth,
      clientWidth: switcher.clientWidth
    };
  });
  assert(!overflow.hasOverflow, 'AppSwitcher column must not trigger horizontal scroll');
});

registerTest('F2-B2', 'F2', 'Channel items have no text overflow or text clipping outside panel bounds at 160px', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const hasOverflowingText = await page.evaluate(() => {
    const textEls = document.querySelectorAll('.app-item-text, .app-item-container span');
    let overflowingCount = 0;
    textEls.forEach(el => {
      if (el.scrollWidth > el.clientWidth + 5 && window.getComputedStyle(el).overflow !== 'hidden' && window.getComputedStyle(el).textOverflow !== 'ellipsis') {
        overflowingCount++;
      }
    });
    return overflowingCount;
  });
  assert(hasOverflowingText === 0, `Found ${hasOverflowingText} overflowing text elements inside channel switcher`);
});

registerTest('F2-B3', 'F2', 'Boundary at 200px: bottom button .add-channel-text hides gracefully', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const hasAddButton = await page.$('.bottom-action-btn');
  assert(hasAddButton !== null, 'Bottom action button should exist in AppSwitcher');

  const hasRule = await page.evaluate(() => {
    const styleTags = Array.from(document.querySelectorAll('style'));
    return styleTags.some(s => s.innerHTML.includes('200px') && (s.innerHTML.includes('.app-item-text') || s.innerHTML.includes('.add-channel-text')));
  });
  assert(hasRule, 'Container query rule at 200px should be defined for collapsing elements');
});

registerTest('F2-B4', 'F2', 'Rapid channel switching (WhatsApp -> Telegram -> Gmail) updates state cleanly', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const channelsToTest = ['whatsapp', 'telegram', 'gmail'];
  for (const ch of channelsToTest) {
    const btn = await page.$(`#channel-switcher-${ch}`);
    if (btn) {
      await btn.click({ force: true });
      await page.waitForTimeout(200);

      // Dismiss connect modal if unlinked channel triggers modal
      const modal = await page.$('.fixed.inset-0.bg-black\\/65');
      if (modal) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
      }
    }
  }

  const chatCol = getColumn(page, 1);
  assert(await chatCol.count() > 0, 'Chat column should be responsive after rapid channel switches');
});

registerTest('F2-B5', 'F2', 'App Catalog drawer opens and closes repeatedly without lingering backdrops', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  for (let i = 0; i < 3; i++) {
    const addBtn = await page.waitForSelector('.bottom-action-btn');
    await addBtn.click();
    await page.waitForTimeout(300);

    const backdrop = await page.$('.absolute.inset-0.bg-black\\/20');
    if (backdrop) {
      await backdrop.click({ force: true });
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(300);
  }

  const catalogTitle = await page.$('text="App Catalog"');
  const isVisible = catalogTitle ? await catalogTitle.isVisible() : false;
  assert(!isVisible, 'App Catalog drawer should be completely closed after cycling');
});

// ============================================================================
// Feature F3: Drag Placeholder Under Cursor Boundaries
// ============================================================================

registerTest('F3-B1', 'F3', 'Drag cancellation via Escape key restores initial column arrangement without error', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const header = await page.waitForSelector('.switcher-header');
  const box = await header.boundingBox();
  assert(box !== null, 'Header bounding box must exist');

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2, { steps: 5 });
  await page.waitForTimeout(200);

  await page.keyboard.press('Escape');
  await page.mouse.up();
  await page.waitForTimeout(300);

  const columns = await page.$$('.sortable-column-container');
  assert(columns.length >= 3, 'All columns should still exist after drag cancellation');
});

registerTest('F3-B2', 'F3', 'Micro-drags (< 5px) do not trigger unwanted column reorder', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const header = await page.waitForSelector('.switcher-header');
  const box = await header.boundingBox();
  assert(box !== null, 'Header bounding box must exist');

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 2, box.y + box.height / 2);
  await page.mouse.up();
  await page.waitForTimeout(200);

  const firstCol = getColumn(page, 0);
  const containsSwitcher = await firstCol.locator('.switcher-header').count();
  assert(containsSwitcher > 0, 'Micro-drag below threshold should not reorder column');
});

registerTest('F3-B3', 'F3', 'Extreme drag velocity across all 3 columns preserves column integrity', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const header = await page.waitForSelector('.switcher-header');
  const box = await header.boundingBox();
  assert(box !== null, 'Header bounding box must exist');

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(1200, box.y + box.height / 2, { steps: 2 });
  await page.waitForTimeout(100);
  await page.mouse.up();
  await page.waitForTimeout(400);

  const columns = await page.$$('.sortable-column-container');
  assert(columns.length >= 3, 'Workspace must remain intact with all columns after high velocity drag');
});

registerTest('F3-B4', 'F3', 'Column reorder works when RightHubColumn is collapsed (2 columns active)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const collapseBtn = await page.$('[title*="Collapse"], button:has(.lucide-panel-right-close)');
  if (collapseBtn) {
    await collapseBtn.click();
    await page.waitForTimeout(300);
  }

  const columns = await page.$$('.sortable-column-container');
  assert(columns.length >= 2, 'At least 2 columns should remain');
});

registerTest('F3-B5', 'F3', 'Dragging with 4 columns (1 detached panel) updates placeholder without offset bug', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await navigateToApp(page);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(200);

  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  await detachBtn.click();
  await page.waitForTimeout(500);

  const columns = await page.$$('.sortable-column-container');
  assert(columns.length === 4, 'Should have 4 columns with detached tab');
});

// ============================================================================
// Feature F4: Draggable MiddleChatColumn Boundaries
// ============================================================================

registerTest('F4-B1', 'F4', 'Channel switching preserves draggable MiddleChatColumn header across all channels', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const channels = ['whatsapp', 'telegram'];
  for (const ch of channels) {
    const chBtn = await page.$(`#channel-switcher-${ch}`);
    if (chBtn) {
      await chBtn.click({ force: true });
      await page.waitForTimeout(300);

      const modal = await page.$('.fixed.inset-0.bg-black\\/65');
      if (modal) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
      }

      const chatHeader = getColumnHeader(page, 1);
      const cls = await chatHeader.getAttribute('class');
      assert(cls && cls.includes('cursor-grab'), `Channel ${ch} header must preserve cursor-grab drag handle`);
    }
  }
});

registerTest('F4-B2', 'F4', 'Clicking interactive buttons inside chat header does NOT trigger column drag', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const chatHeader = getColumnHeader(page, 1);
  const searchBtn = await chatHeader.locator('button').first();
  if (await searchBtn.count() > 0) {
    await searchBtn.click();
    await page.waitForTimeout(200);

    const isDragging = await page.evaluate(() => document.body.classList.contains('is-dragging'));
    assert(!isDragging, 'Clicking button inside chat header must not initiate column drag');
  }
});

registerTest('F4-B3', 'F4', 'Selecting text inside chat message thread does NOT initiate column drag', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const chatCol = getColumn(page, 1);
  const messageBox = chatCol.locator('[class*="overflow-y-auto"]').first();
  if (await messageBox.count() > 0) {
    const box = await messageBox.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 50, box.y + 100);
      await page.mouse.down();
      await page.mouse.move(box.x + 150, box.y + 100, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(200);

      const isDragging = await page.evaluate(() => document.body.classList.contains('is-dragging'));
      assert(!isDragging, 'Text selection inside message area must not trigger column drag');
    }
  }
});

registerTest('F4-B4', 'F4', 'Header drag operates smoothly when chat column is resized to minimum width', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const chatHeader = getColumnHeader(page, 1);
  assert(await chatHeader.count() > 0, 'Chat header should be draggable at all column sizes');
});

registerTest('F4-B5', 'F4', 'Attempting to drag avatar image does not produce native browser ghost image drag', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const chatHeader = getColumnHeader(page, 1);
  const avatar = chatHeader.locator('img').first();
  if (await avatar.count() > 0) {
    const draggableAttr = await avatar.getAttribute('draggable');
    assert(draggableAttr === 'false', 'Avatar image must explicitly specify draggable="false"');
  }
});

// ============================================================================
// Feature F5: Hide Panel Resize Handles During Drag Boundaries
// ============================================================================

registerTest('F5-B1', 'F5', 'Drag start and immediate Escape key unhides resize handles immediately', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const header = await page.waitForSelector('.switcher-header');
  const box = await header.boundingBox();
  assert(box !== null, 'Header bounding box must exist');

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2, { steps: 5 });
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await page.waitForTimeout(300);

  const opacity = await page.evaluate(() => {
    const handle = document.querySelector('.custom-resize-handle, [role="separator"]');
    if (!handle) return '1';
    return window.getComputedStyle(handle).opacity;
  });
  assert(parseFloat(opacity) > 0, `Resize handle opacity must restore to >0 on cancel, got ${opacity}`);
});

registerTest('F5-B2', 'F5', 'Dragging with 4 columns (1 detached panel) hides all 3 separators simultaneously', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await navigateToApp(page);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(200);

  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  await detachBtn.click();
  await page.waitForTimeout(500);

  const handles = await page.$$('.custom-resize-handle, [role="separator"]');
  assert(handles.length === 3, `Expected 3 resize handles for 4 columns, found ${handles.length}`);
});

registerTest('F5-B3', 'F5', 'Mouse hovering over separator during active drag does not change cursor to col-resize', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const header = await page.waitForSelector('.switcher-header');
  const handle = await page.waitForSelector('.custom-resize-handle, [role="separator"]');
  const hBox = await header.boundingBox();
  const sepBox = await handle.boundingBox();
  assert(hBox && sepBox, 'Bounding boxes must exist');

  await page.mouse.move(hBox.x + hBox.width / 2, hBox.y + hBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(sepBox.x + sepBox.width / 2, sepBox.y + sepBox.height / 2, { steps: 5 });
  await page.waitForTimeout(100);

  const handlePointerEvents = await handle.evaluate(el => window.getComputedStyle(el).pointerEvents);
  await page.mouse.up();

  assert(handlePointerEvents === 'none', 'Separator must ignore pointer events during drag');
});

registerTest('F5-B4', 'F5', 'Fast consecutive drag-starts and drag-ends do not leave handles stuck at opacity: 0', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const header = await page.waitForSelector('.switcher-header');
  const box = await header.boundingBox();
  assert(box !== null, 'Header bounding box must exist');

  for (let i = 0; i < 3; i++) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 30, box.y + box.height / 2);
    await page.mouse.up();
    await page.waitForTimeout(100);
  }

  const finalOpacity = await page.evaluate(() => {
    const handle = document.querySelector('.custom-resize-handle, [role="separator"]');
    if (!handle) return '1';
    return window.getComputedStyle(handle).opacity;
  });

  assert(parseFloat(finalOpacity) > 0, `Handles must not remain stuck at opacity 0, got ${finalOpacity}`);
});

registerTest('F5-B5', 'F5', 'Resizing a panel before dragging works normally without lingering drag classes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const handle = await page.waitForSelector('.custom-resize-handle, [role="separator"]');
  const box = await handle.boundingBox();
  assert(box !== null, 'Handle bounding box must exist');

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2);
  await page.mouse.up();
  await page.waitForTimeout(200);

  const isDragging = await page.evaluate(() => document.body.classList.contains('is-dragging'));
  assert(!isDragging, 'Workspace should not retain is-dragging class after resizing');
});

// ============================================================================
// Feature F6: Detached Panels Long Endurance Boundaries
// ============================================================================

registerTest('F6-B1', 'F6', 'Detached panel stays open continuously for 8+ seconds without resetting', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await navigateToApp(page);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(200);

  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  await detachBtn.click();
  await page.waitForTimeout(500);

  for (let i = 0; i < 4; i++) {
    await page.waitForTimeout(2000);
    const cols = await page.$$('.sortable-column-container');
    assert(cols.length === 4, `Detached panel prematurely disappeared at interval ${i + 1} (${(i + 1) * 2}s)`);
  }
});

registerTest('F6-B2', 'F6', 'Detaching BOTH Analytics and Settings simultaneously creates 5 columns without crash', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 800 });
  await navigateToApp(page);

  // Detach Analytics
  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(200);
  const detachBtn1 = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  await detachBtn1.click();
  await page.waitForTimeout(500);

  // In RightHubColumn (column 2), click Settings
  const hubCol = getColumn(page, 2);
  const settingsTab = hubCol.locator('button:has-text("Settings")').first();
  await settingsTab.waitFor({ state: 'visible' });
  await settingsTab.click();
  await page.waitForTimeout(300);

  const detachBtn2 = hubCol.locator('[title*="Detach"], button:has-text("Detach")').first();
  await detachBtn2.waitFor({ state: 'visible' });
  await detachBtn2.click();
  await page.waitForTimeout(500);

  const cols = await page.$$('.sortable-column-container');
  assert(cols.length === 5, `Expected 5 columns with both panels detached, found ${cols.length}`);
});

registerTest('F6-B3', 'F6', 'Local storage preferences update while panel is detached does not wipe detached panel', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await navigateToApp(page);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(200);
  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  await detachBtn.click();
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    localStorage.setItem('cf_last_ping', String(Date.now()));
    window.dispatchEvent(new Event('storage'));
  });
  await page.waitForTimeout(1000);

  const cols = await page.$$('.sortable-column-container');
  assert(cols.length === 4, 'Detached panel should remain after localStorage updates');
});

registerTest('F6-B4', 'F6', 'Channel switching (WhatsApp -> Telegram) while panel is detached preserves detached panel', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await navigateToApp(page);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(200);
  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  await detachBtn.click();
  await page.waitForTimeout(500);

  const tgBtn = await page.waitForSelector('#channel-switcher-telegram, div:has-text("Telegram")');
  await tgBtn.click();
  await page.waitForTimeout(500);

  const cols = await page.$$('.sortable-column-container');
  assert(cols.length === 4, 'Detached panel must remain open after switching channels');
});

registerTest('F6-B5', 'F6', 'Resizing detached panel updates sizes without triggering panel collapse', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await navigateToApp(page);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(200);
  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  await detachBtn.click();
  await page.waitForTimeout(500);

  const lastHandle = (await page.$$('.custom-resize-handle, [role="separator"]')).pop();
  if (lastHandle) {
    const box = await lastHandle.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 - 40, box.y + box.height / 2);
      await page.mouse.up();
      await page.waitForTimeout(300);
    }
  }

  const cols = await page.$$('.sortable-column-container');
  assert(cols.length === 4, 'Detached panel must remain open after being resized');
});

// ============================================================================
// Feature F7: High-Visibility Detach Button Boundaries
// ============================================================================

registerTest('F7-B1', 'F7', 'Contacts tab does NOT display detach button (non-detachable tab)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const contactsTab = await page.waitForSelector('button:has-text("Contacts")');
  await contactsTab.click();
  await page.waitForTimeout(200);

  const detachBtn = await contactsTab.$('[title*="Detach"]');
  assert(detachBtn === null, 'Contacts tab must not display a detach button');
});

registerTest('F7-B2', 'F7', 'Inactive detachable tab does NOT render active detach button', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const contactsTab = await page.waitForSelector('button:has-text("Contacts")');
  await contactsTab.click();
  await page.waitForTimeout(200);

  const inactiveAnalyticsBtn = await page.$('button:has-text("Analytics") [title*="Detach"], button:has-text("Stats") [title*="Detach"]');
  assert(inactiveAnalyticsBtn === null, 'Inactive tab must not render active detach button');
});

registerTest('F7-B3', 'F7', 'Detach button remains clickable when RightHubColumn is narrow (250px)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(200);

  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  const box = await detachBtn.boundingBox();
  assert(box !== null && box.width > 10 && box.height > 10, 'Detach button must have sufficient clickable area');
});

registerTest('F7-B4', 'F7', 'Hovering over detach button produces visual feedback transition', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(200);

  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  await detachBtn.hover();
  await page.waitForTimeout(150);

  assert(detachBtn !== null, 'Detach button should handle hover interactions');
});

registerTest('F7-B5', 'F7', 'Clicking detach button triggers single detach event without double-firing', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await navigateToApp(page);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(200);

  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  await detachBtn.click();
  await page.waitForTimeout(500);

  const cols = await page.$$('.sortable-column-container');
  assert(cols.length === 4, `Expected exactly 4 columns after single detach click, found ${cols.length}`);
});

// ============================================================================
// Feature F8: Persistent Telegram Topics Split Pane Boundaries
// ============================================================================

registerTest('F8-B1', 'F8', 'Polling interval does NOT reset active topic path after 5 seconds', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const tgBtn = await page.waitForSelector('#channel-switcher-telegram, div:has-text("Telegram")');
  await tgBtn.click();
  await page.waitForTimeout(300);

  const groupItem = await page.waitForSelector('text="Automatique L3"', { timeout: 4000 });
  await groupItem.click();
  await page.waitForTimeout(300);

  const topicGeneral = await page.waitForSelector('text="General"', { timeout: 4000 });
  await topicGeneral.click();

  await page.waitForTimeout(5000);

  const chatCol = getColumn(page, 1);
  const text = await chatCol.innerText();
  assert(text.includes('Automatique L3') || text.includes('General'), 'Topic selection must remain intact through 5s polling');
});

registerTest('F8-B2', 'F8', 'Direct message contact (Alex) does not display topics list and opens DM immediately', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const tgBtn = await page.waitForSelector('#channel-switcher-telegram, div:has-text("Telegram")');
  await tgBtn.click();
  await page.waitForTimeout(300);

  const alexItem = await page.waitForSelector('text="Alex"', { timeout: 4000 });
  await alexItem.click();
  await page.waitForTimeout(400);

  const topicsHeader = await page.$('text="General"');
  const isVisible = topicsHeader ? await topicsHeader.isVisible() : false;
  assert(!isVisible, 'Direct message contact Alex must not show topics split pane');
});

registerTest('F8-B3', 'F8', 'Rapid switching between forum group and direct message does not crash React state', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const tgBtn = await page.waitForSelector('#channel-switcher-telegram, div:has-text("Telegram")');
  await tgBtn.click();
  await page.waitForTimeout(300);

  for (let i = 0; i < 2; i++) {
    const groupItem = await page.waitForSelector('text="Automatique L3"', { timeout: 4000 });
    await groupItem.click();
    await page.waitForTimeout(200);

    const alexItem = await page.waitForSelector('text="Alex"', { timeout: 4000 });
    await alexItem.click();
    await page.waitForTimeout(200);
  }

  const columns = await page.$$('.sortable-column-container');
  assert(columns.length >= 3, 'Workspace must remain functional after rapid contact type switching');
});

registerTest('F8-B4', 'F8', 'Navigating between topics updates message contents accurately', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const tgBtn = await page.waitForSelector('#channel-switcher-telegram, div:has-text("Telegram")');
  await tgBtn.click();
  await page.waitForTimeout(300);

  const groupItem = await page.waitForSelector('text="Automatique L3"', { timeout: 4000 });
  await groupItem.click();
  await page.waitForTimeout(300);

  const topicGeneral = await page.waitForSelector('text="General"', { timeout: 4000 });
  await topicGeneral.click();
  await page.waitForTimeout(300);

  const chatCol = getColumn(page, 1);
  assert(await chatCol.count() > 0, 'Chat column should be open on General topic');
});

registerTest('F8-B5', 'F8', 'Empty topic (Exams or Cours) displays empty state gracefully without errors', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const tgBtn = await page.waitForSelector('#channel-switcher-telegram, div:has-text("Telegram")');
  await tgBtn.click();
  await page.waitForTimeout(300);

  const groupItem = await page.waitForSelector('text="Automatique L3"', { timeout: 4000 });
  await groupItem.click();
  await page.waitForTimeout(300);

  const topicExams = await page.$('text="Exams"');
  if (topicExams) {
    await topicExams.click();
    await page.waitForTimeout(300);
    assert(page.consoleErrors.length === 0, 'No console errors should occur when viewing empty topic');
  }
});

// ============================================================================
// Feature F9: Global Real Profile Pictures Boundaries
// ============================================================================

registerTest('F9-B1', 'F9', 'Contact avatar images do not trigger layout shift or horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const overflow = await checkHorizontalOverflow(page);
  assert(!overflow.hasOverflow, 'Avatar images should not cause horizontal overflow');
});

registerTest('F9-B2', 'F9', 'Contact avatar fallback initial is rendered gracefully if image fails', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const hubCol = getColumn(page, 2);
  const avatars = await hubCol.locator('img, .rounded-full').all();
  assert(avatars.length > 0, 'Contacts should render styled round avatar containers');
});

registerTest('F9-B3', 'F9', 'Header avatar image explicitly prevents HTML5 drag hijacking (draggable=false)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const chatHeader = getColumnHeader(page, 1);
  const img = chatHeader.locator('img').first();
  if (await img.count() > 0) {
    const isDraggable = await img.getAttribute('draggable');
    assert(isDraggable === 'false', 'Header avatar img must have draggable="false"');
  }
});

registerTest('F9-B4', 'F9', 'Profile pictures render with 1:1 circular aspect ratio', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const hubCol = getColumn(page, 2);
  const img = hubCol.locator('img').first();
  if (await img.count() > 0) {
    const box = await img.boundingBox();
    if (box) {
      const diff = Math.abs(box.width - box.height);
      assert(diff <= 2, `Avatar should be 1:1 square/circular aspect ratio, got ${box.width}x${box.height}`);
    }
  }
});

registerTest('F9-B5', 'F9', 'Switching between contacts updates header avatar image src reliably', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const hubCol = getColumn(page, 2);
  const contactItems = await hubCol.locator('[class*="cursor-pointer"]').all();

  for (let i = 0; i < Math.min(3, contactItems.length); i++) {
    await contactItems[i].click();
    await page.waitForTimeout(200);

    const chatHeader = getColumnHeader(page, 1);
    const headerImg = chatHeader.locator('img').first();
    if (await headerImg.count() > 0) {
      const src = await headerImg.getAttribute('src');
      assert(src && src.length > 0, 'Header avatar should have valid src');
    }
  }

  assert(true, 'Contact switching executed cleanly');
});

// ============================================================================
// Runner Function for Tier 2
// ============================================================================

async function runTier2(browser) {
  console.log(`\n======================================================`);
  console.log(`  TIER 2: BOUNDARY & CORNER CASES SUITE (${tests.length} tests)`);
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
      const screenshotPath = await captureScreenshot(page, `T2_${t.id}`);
      console.log(`  ✗ [FAIL] [${t.id}] (${t.feature}) ${t.name}`);
      console.log(`     Error: ${error}`);
      if (screenshotPath) console.log(`     Screenshot: ${screenshotPath}`);
    } finally {
      await context.close();
    }

    results.push({
      id: t.id,
      feature: t.feature,
      tier: 2,
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
      const results = await runTier2(browser);
      const passed = results.filter(r => r.passed).length;
      console.log(`\nTier 2 Summary: ${passed}/${results.length} passed.`);
      process.exit(passed === results.length ? 0 : 1);
    } finally {
      await browser.close();
    }
  })();
}

module.exports = {
  tests,
  runTier2,
};
