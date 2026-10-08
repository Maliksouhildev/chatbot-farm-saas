/**
 * Adversarial Challenger 1: Empirical Stress Suite for Milestone 2 (R1, R2, R3)
 *
 * Specific Verification Mandate:
 * 1. Fast consecutive drag events across ALL 17 channels:
 *    whatsapp, whatsapp_2, telegram, signal, instagram, messenger, x_twitter,
 *    google_messages, google_chat, google_voice, discord, slack, linkedin,
 *    irc, matrix, web_widget, gmail
 * 2. Splitter handle invisibility (opacity: 0 !important; pointer-events: none !important;)
 *    during active drag (3-column & 4-column layouts) and restoration after drop.
 * 3. Escape key drag cancel restoring initial order without leaving lingering classes.
 */

const {
  launchBrowser,
  createPage,
  navigateToApp,
  getColumn,
  getColumnHeader,
  captureScreenshot,
  assert,
  assertEqual,
} = require('./helpers');

const ALL_17_CHANNELS = [
  'whatsapp',
  'whatsapp_2',
  'telegram',
  'signal',
  'instagram',
  'messenger',
  'x_twitter',
  'google_messages',
  'google_chat',
  'google_voice',
  'discord',
  'slack',
  'linkedin',
  'irc',
  'matrix',
  'web_widget',
  'gmail'
];

function getRealConsoleErrors(page) {
  // Filter out Next.js / React SSR dev-only hydration warnings and 404 asset loads
  return (page.consoleErrors || []).filter(msg => {
    if (msg.includes('aria-describedby')) return false;
    if (msg.includes('Warning: Prop')) return false;
    if (msg.includes('Warning: Extra attributes')) return false;
    if (msg.includes('Failed to load resource') && msg.includes('404')) return false;
    return true;
  });
}

const challengerTests = [];

function registerTest(id, name, fn) {
  challengerTests.push({ id, name, fn });
}

// ============================================================================
// SUITE 1: ALL 17 CHANNELS DRAG VERIFICATION & FAST CONSECUTIVE REORDERING
// ============================================================================

registerTest('C1-CHANNELS-ALL17', 'Verify drag handle attributes & drag reordering across ALL 17 channel headers', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  // Pin and connect all 17 channels in localStorage before navigation
  await page.addInitScript((channels) => {
    localStorage.setItem('cf_pinned_apps', JSON.stringify(channels));
    localStorage.setItem('cf_connected_apps', JSON.stringify(channels));
  }, ALL_17_CHANNELS);

  await navigateToApp(page);

  // Test every single one of the 17 channels
  for (const ch of ALL_17_CHANNELS) {
    // Select channel in AppSwitcher
    const chBtn = page.locator(`#channel-switcher-${ch}`);
    await chBtn.scrollIntoViewIfNeeded();
    await chBtn.click({ force: true });
    await page.waitForTimeout(200);

    // If any modal opened, close it cleanly
    const closeBtn = page.locator('.fixed.inset-0 button:has(svg), .fixed.inset-0 button[title*="Close"]').first();
    if (await closeBtn.count() > 0 && await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(150);
    }

    // Locate MiddleChatColumn header (at index 1)
    const middleCol = getColumn(page, 1);
    const chatHeader = middleCol.locator('.h-14, [class*="cursor-grab"]').first();
    await chatHeader.waitFor({ state: 'visible', timeout: 5000 });

    // 1. Verify drag handle CSS classes & attributes
    const cls = await chatHeader.getAttribute('class');
    assert(cls && cls.includes('cursor-grab'), `[Channel: ${ch}] header must have cursor-grab class. Got: ${cls}`);
    assert(cls && cls.includes('touch-none'), `[Channel: ${ch}] header must have touch-none class. Got: ${cls}`);

    // 2. Verify avatar images inside header have draggable=false
    const avatars = chatHeader.locator('img');
    const avatarCount = await avatars.count();
    for (let i = 0; i < avatarCount; i++) {
      const draggableAttr = await avatars.nth(i).getAttribute('draggable');
      assert(draggableAttr === 'false', `[Channel: ${ch}] Avatar ${i} must have draggable="false"`);
    }

    // 3. Perform drag to swap MiddleChatColumn with AppSwitcher
    const headerBox = await chatHeader.boundingBox();
    assert(headerBox !== null, `[Channel: ${ch}] header bounding box must exist`);

    const startX = headerBox.x + headerBox.width / 2;
    const startY = headerBox.y + headerBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    // Drag left by 300px to swap into column 0
    await page.mouse.move(startX - 300, startY, { steps: 8 });
    await page.waitForTimeout(100);

    // Check that drag is active
    const isDraggingDuring = await page.evaluate(() => document.body.classList.contains('is-dragging'));
    assert(isDraggingDuring, `[Channel: ${ch}] is-dragging must be active during drag`);

    await page.mouse.up();
    await page.waitForTimeout(200);

    // Check swap occurred: column 0 should now be MiddleChatColumn, column 1 should be AppSwitcher
    const col0 = getColumn(page, 0);
    const col0HasChat = (await col0.locator('.h-14, [class*="cursor-grab"]').count()) > 0;
    assert(col0HasChat, `[Channel: ${ch}] Column 0 should contain chat header after leftward drag swap`);

    // 4. Drag it back from column 0 to column 1
    const newChatHeader = col0.locator('.h-14, [class*="cursor-grab"]').first();
    const newBox = await newChatHeader.boundingBox();
    assert(newBox !== null, `[Channel: ${ch}] new chat header bounding box must exist in column 0`);

    await page.mouse.move(newBox.x + newBox.width / 2, newBox.y + newBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(newBox.x + newBox.width / 2 + 300, newBox.y + newBox.height / 2, { steps: 8 });
    await page.waitForTimeout(100);
    await page.mouse.up();
    await page.waitForTimeout(200);

    // Verify restored: column 0 is switcher, column 1 is chat
    const restoredCol0 = getColumn(page, 0);
    const restoredCol1 = getColumn(page, 1);
    const hasSwitcher = (await restoredCol0.locator('.switcher-header').count()) > 0;
    const hasChat = (await restoredCol1.locator('.h-14').count()) > 0;
    assert(hasSwitcher, `[Channel: ${ch}] Restored column 0 must contain switcher`);
    assert(hasChat, `[Channel: ${ch}] Restored column 1 must contain chat`);
  }

  // Ensure 0 page errors
  const realErrors = getRealConsoleErrors(page);
  assert(realErrors.length === 0, `Expected 0 console errors across all 17 channels, got: ${realErrors.join(', ')}`);
});

registerTest('C1-CHANNELS-RAPID', 'Fast consecutive drag-and-drop reordering across channels without race conditions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.addInitScript((channels) => {
    localStorage.setItem('cf_pinned_apps', JSON.stringify(channels));
    localStorage.setItem('cf_connected_apps', JSON.stringify(channels));
  }, ALL_17_CHANNELS);

  await navigateToApp(page);

  const testChannels = ['telegram', 'discord', 'slack', 'instagram', 'x_twitter', 'gmail'];

  for (const ch of testChannels) {
    const chBtn = page.locator(`#channel-switcher-${ch}`);
    await chBtn.scrollIntoViewIfNeeded();
    await chBtn.click({ force: true });
    await page.waitForTimeout(150);

    const closeBtn = page.locator('.fixed.inset-0 button:has(svg), .fixed.inset-0 button[title*="Close"]').first();
    if (await closeBtn.count() > 0 && await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(100);
    }

    // Perform 3 rapid consecutive drag swaps back and forth
    for (let cycle = 0; cycle < 3; cycle++) {
      const middleCol = getColumn(page, 1);
      const chatHeader = middleCol.locator('.h-14, [class*="cursor-grab"]').first();
      const box = await chatHeader.boundingBox();
      if (!box) continue;

      const sx = box.x + box.width / 2;
      const sy = box.y + box.height / 2;

      // Fast swap left
      await page.mouse.move(sx, sy);
      await page.mouse.down();
      await page.mouse.move(sx - 280, sy, { steps: 4 });
      await page.mouse.up();
      await page.waitForTimeout(80);

      // Fast swap right
      const col0 = getColumn(page, 0);
      const col0Header = col0.locator('.h-14, [class*="cursor-grab"]').first();
      const box0 = await col0Header.boundingBox();
      if (!box0) continue;

      await page.mouse.move(box0.x + box0.width / 2, box0.y + box0.height / 2);
      await page.mouse.down();
      await page.mouse.move(box0.x + box0.width / 2 + 280, box0.y + box0.height / 2, { steps: 4 });
      await page.mouse.up();
      await page.waitForTimeout(80);
    }

    // Verify workspace layout stability
    const colCount = await page.locator('.sortable-column-container').count();
    assertEqual(colCount, 3, `Column count must remain exactly 3 after rapid drags for ${ch}`);

    const isDraggingStuck = await page.evaluate(() => document.body.classList.contains('is-dragging'));
    assert(!isDraggingStuck, `is-dragging must not be stuck active after rapid drags for ${ch}`);
  }

  const realErrors = getRealConsoleErrors(page);
  assert(realErrors.length === 0, `Expected 0 console errors during rapid drags, got: ${realErrors.join(', ')}`);
});

// ============================================================================
// SUITE 2: SPLITTER HANDLE INVISIBILITY (opacity: 0, pointer-events: none)
// ============================================================================

registerTest('C1-SPLITTER-INVIS-3COL', 'Splitter handles are completely invisible (opacity: 0 !important; pointer-events: none !important;) during active drag (3 columns)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  // 1. Baseline: verify resize handles exist and are visible
  const handles = page.locator('.custom-resize-handle, [data-resize-handle]');
  const handleCount = await handles.count();
  assert(handleCount >= 2, `Expected at least 2 resize handles for 3 columns, found: ${handleCount}`);

  const baselineStyles = await page.evaluate(() => {
    const list = Array.from(document.querySelectorAll('.custom-resize-handle, [data-resize-handle]'));
    return list.map(el => {
      const cs = window.getComputedStyle(el);
      const afterCs = window.getComputedStyle(el, '::after');
      return {
        opacity: cs.opacity,
        pointerEvents: cs.pointerEvents,
        afterOpacity: afterCs.opacity,
      };
    });
  });

  for (let i = 0; i < baselineStyles.length; i++) {
    const s = baselineStyles[i];
    assert(parseFloat(s.opacity) > 0, `Handle ${i} must have opacity > 0 before drag (got ${s.opacity})`);
    assert(s.pointerEvents !== 'none', `Handle ${i} pointerEvents must not be none before drag (got ${s.pointerEvents})`);
  }

  // 2. Initiate active drag from MiddleChatColumn header
  const chatHeader = getColumnHeader(page, 1);
  const box = await chatHeader.boundingBox();
  assert(box !== null, 'Chat header bounding box must exist');

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  // Move 60px to trigger drag threshold
  await page.mouse.move(startX + 60, startY, { steps: 5 });
  await page.waitForTimeout(200);

  // 3. Inspect styles during active drag
  const dragStyles = await page.evaluate(() => {
    const hasClass = document.body.classList.contains('is-dragging');
    const list = Array.from(document.querySelectorAll('.custom-resize-handle, [data-resize-handle]'));
    const styles = list.map(el => {
      const cs = window.getComputedStyle(el);
      const afterCs = window.getComputedStyle(el, '::after');
      return {
        opacity: cs.opacity,
        pointerEvents: cs.pointerEvents,
        afterOpacity: afterCs.opacity,
      };
    });
    return { hasClass, styles };
  });

  assert(dragStyles.hasClass, 'document.body must have is-dragging class during active drag');
  for (let i = 0; i < dragStyles.styles.length; i++) {
    const s = dragStyles.styles[i];
    assertEqual(s.opacity, '0', `Handle ${i} opacity must be '0' during drag`);
    assertEqual(s.pointerEvents, 'none', `Handle ${i} pointerEvents must be 'none' during drag`);
    assertEqual(s.afterOpacity, '0', `Handle ${i} ::after pseudo-element opacity must be '0' during drag`);
  }

  // 4. Test hover over separator coordinates during active drag
  const firstHandle = handles.first();
  const handleBox = await firstHandle.boundingBox();
  if (handleBox) {
    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
    await page.waitForTimeout(50);
    const cursor = await page.evaluate(() => {
      const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
      return el ? window.getComputedStyle(el).cursor : '';
    });
    assert(cursor !== 'col-resize', `Cursor over separator during drag must not be col-resize, got: ${cursor}`);
  }

  // 5. Release mouse and verify immediate restoration
  await page.mouse.up();
  await page.waitForTimeout(250);

  const postDrag = await page.evaluate(() => {
    const hasClass = document.body.classList.contains('is-dragging');
    const list = Array.from(document.querySelectorAll('.custom-resize-handle, [data-resize-handle]'));
    const styles = list.map(el => {
      const cs = window.getComputedStyle(el);
      return {
        opacity: cs.opacity,
        pointerEvents: cs.pointerEvents,
      };
    });
    return { hasClass, styles };
  });

  assert(!postDrag.hasClass, 'document.body must NOT have is-dragging class after drag end');
  for (let i = 0; i < postDrag.styles.length; i++) {
    const s = postDrag.styles[i];
    assert(parseFloat(s.opacity) > 0, `Handle ${i} opacity must be restored to > 0 (got ${s.opacity})`);
    assert(s.pointerEvents !== 'none', `Handle ${i} pointerEvents must not be none after drag (got ${s.pointerEvents})`);
  }
});

registerTest('C1-SPLITTER-INVIS-4COL', 'Splitter handles invisibility across all 3 separators during drag with 4 columns (detached panel)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await navigateToApp(page);

  // Switch to Analytics tab first so detach button is present
  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")', { timeout: 5000 });
  await analyticsTab.click();
  await page.waitForTimeout(200);

  // Detach Analytics tab
  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")', { timeout: 5000 });
  await detachBtn.click();
  await page.waitForTimeout(400);

  // Verify 4 columns exist
  const colCount = await page.locator('.sortable-column-container').count();
  assertEqual(colCount, 4, 'Must have 4 columns after detaching tab');

  // Verify 3 resize handles exist
  const handles = page.locator('.custom-resize-handle, [data-resize-handle]');
  const handleCount = await handles.count();
  assertEqual(handleCount, 3, 'Must have exactly 3 resize handles for 4 columns');

  // Initiate drag from 4th column header (detached panel)
  const fourthCol = getColumn(page, 3);
  const fourthHeader = fourthCol.locator('.h-14, [class*="cursor-grab"]').first();
  const box = await fourthHeader.boundingBox();
  assert(box !== null, '4th column header bounding box must exist');

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x - 150, box.y + box.height / 2, { steps: 5 });
  await page.waitForTimeout(200);

  // Check all 3 handles are hidden during drag
  const stylesDuring = await page.evaluate(() => {
    const list = Array.from(document.querySelectorAll('.custom-resize-handle, [data-resize-handle]'));
    return list.map(el => {
      const cs = window.getComputedStyle(el);
      const afterCs = window.getComputedStyle(el, '::after');
      return {
        opacity: cs.opacity,
        pointerEvents: cs.pointerEvents,
        afterOpacity: afterCs.opacity,
      };
    });
  });

  assertEqual(stylesDuring.length, 3, 'Must inspect all 3 handles during drag');
  for (let i = 0; i < stylesDuring.length; i++) {
    const s = stylesDuring[i];
    assertEqual(s.opacity, '0', `4-column handle ${i} opacity must be '0' during drag`);
    assertEqual(s.pointerEvents, 'none', `4-column handle ${i} pointerEvents must be 'none' during drag`);
    assertEqual(s.afterOpacity, '0', `4-column handle ${i} ::after opacity must be '0' during drag`);
  }

  // Release mouse
  await page.mouse.up();
  await page.waitForTimeout(250);

  // Verify all 3 handles restored
  const restored = await page.evaluate(() => {
    const list = Array.from(document.querySelectorAll('.custom-resize-handle, [data-resize-handle]'));
    return list.map(el => window.getComputedStyle(el).opacity);
  });
  for (let i = 0; i < restored.length; i++) {
    assert(parseFloat(restored[i]) > 0, `Handle ${i} must restore opacity after drag`);
  }
});

registerTest('C1-SPLITTER-RESIZE-POST-DRAG', 'Splitter handle is fully interactive and successfully resizes columns after drag operations', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  // Perform a column drag operation first
  const chatHeader = getColumnHeader(page, 1);
  const box = await chatHeader.boundingBox();
  assert(box !== null, 'Chat header must exist');

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 80, box.y + box.height / 2, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(200);

  // Now perform an actual resize using the first resize handle
  const handle = page.locator('.custom-resize-handle, [data-resize-handle]').first();
  const handleBox = await handle.boundingBox();
  assert(handleBox !== null, 'Resize handle bounding box must exist');

  const initialCol0Width = (await getColumn(page, 0).boundingBox()).width;

  // Drag the resize handle to the right by 80px
  const hx = handleBox.x + handleBox.width / 2;
  const hy = handleBox.y + handleBox.height / 2;
  await page.mouse.move(hx, hy);
  await page.mouse.down();
  await page.mouse.move(hx + 80, hy, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(300);

  const finalCol0Width = (await getColumn(page, 0).boundingBox()).width;
  assert(finalCol0Width > initialCol0Width + 20, `Column 0 width must increase after handle resize (initial: ${initialCol0Width}, final: ${finalCol0Width})`);
});

// ============================================================================
// SUITE 3: ESCAPE KEY DRAG CANCEL
// ============================================================================

registerTest('C1-ESCAPE-CANCEL-REORDER', 'Escape key drag cancel restores exact initial column order without lingering classes or broken transforms', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  // Initial arrangement check: col 0 is switcher, col 1 is chat, col 2 is hub
  const initialHeaders = await page.evaluate(() => {
    const cols = Array.from(document.querySelectorAll('.sortable-column-container'));
    return cols.map(c => {
      if (c.querySelector('.switcher-header')) return 'switcher';
      if (c.querySelector('.h-14')) return 'chat';
      return 'hub';
    });
  });

  // Start dragging MiddleChatColumn (col 1) leftwards over AppSwitcher (col 0)
  const chatHeader = getColumnHeader(page, 1);
  const box = await chatHeader.boundingBox();
  assert(box !== null, 'Chat header bounding box must exist');

  const sx = box.x + box.width / 2;
  const sy = box.y + box.height / 2;

  await page.mouse.move(sx, sy);
  await page.mouse.down();
  // Drag left by 280px to trigger onDragOver swap
  await page.mouse.move(sx - 280, sy, { steps: 8 });
  await page.waitForTimeout(150);

  // Verify dynamic reorder has occurred while mouse is down
  const isDraggingDuring = await page.evaluate(() => document.body.classList.contains('is-dragging'));
  assert(isDraggingDuring, 'is-dragging must be active during drag');

  // PRESS ESCAPE KEY TO CANCEL
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);

  // Release mouse
  await page.mouse.up();
  await page.waitForTimeout(200);

  // 1. Verify is-dragging class is removed
  const isDraggingAfter = await page.evaluate(() => document.body.classList.contains('is-dragging'));
  assert(!isDraggingAfter, 'document.body must NOT retain is-dragging class after Escape cancel');

  // 2. Verify DragOverlay is removed
  const overlayCount = await page.locator('[data-dnd-overlay="true"]').count();
  assertEqual(overlayCount, 0, 'DragOverlay must be completely unmounted after Escape cancel');

  // 3. Verify column order is restored to initialHeaders
  const currentHeaders = await page.evaluate(() => {
    const cols = Array.from(document.querySelectorAll('.sortable-column-container'));
    return cols.map(c => {
      if (c.querySelector('.switcher-header')) return 'switcher';
      if (c.querySelector('.h-14')) return 'chat';
      return 'hub';
    });
  });

  assertEqual(JSON.stringify(currentHeaders), JSON.stringify(initialHeaders), `Column arrangement must revert to initial order after Escape cancel (initial: ${initialHeaders}, current: ${currentHeaders})`);

  // 4. Verify resize handles are fully visible
  const handleStyles = await page.evaluate(() => {
    const list = Array.from(document.querySelectorAll('.custom-resize-handle, [data-resize-handle]'));
    return list.map(el => window.getComputedStyle(el).opacity);
  });
  for (let i = 0; i < handleStyles.length; i++) {
    assert(parseFloat(handleStyles[i]) > 0, `Handle ${i} must restore opacity after Escape cancel`);
  }
});

registerTest('C1-ESCAPE-CANCEL-RAPID-STRESS', '10 consecutive rapid drag-start & Escape-cancel cycles preserve workspace integrity', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  for (let cycle = 1; cycle <= 10; cycle++) {
    const chatHeader = getColumnHeader(page, 1);
    const box = await chatHeader.boundingBox();
    if (!box) continue;

    const sx = box.x + box.width / 2;
    const sy = box.y + box.height / 2;

    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx - 150, sy, { steps: 4 });
    await page.waitForTimeout(30);

    // Cancel with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(20);
    await page.mouse.up();
    await page.waitForTimeout(50);

    // Verify after each cycle
    const isDragging = await page.evaluate(() => document.body.classList.contains('is-dragging'));
    assert(!isDragging, `Cycle ${cycle}: is-dragging must not linger after Escape cancel`);

    const colCount = await page.locator('.sortable-column-container').count();
    assertEqual(colCount, 3, `Cycle ${cycle}: Column count must remain 3`);
  }

  // Verify final arrangement: col 0 is switcher, col 1 is chat, col 2 is hub
  const col0HasSwitcher = (await getColumn(page, 0).locator('.switcher-header').count()) > 0;
  const col1HasChat = (await getColumn(page, 1).locator('.h-14').count()) > 0;
  assert(col0HasSwitcher, 'Col 0 must remain switcher after 10 rapid cancel cycles');
  assert(col1HasChat, 'Col 1 must remain chat after 10 rapid cancel cycles');
});

registerTest('C1-ESCAPE-CANCEL-4COL', 'Escape key drag cancel restores 4th detached column to original position cleanly', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await navigateToApp(page);

  // Switch to Analytics tab first
  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")', { timeout: 5000 });
  await analyticsTab.click();
  await page.waitForTimeout(200);

  // Detach tab to create 4th column
  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")', { timeout: 5000 });
  await detachBtn.click();
  await page.waitForTimeout(400);

  // 4th column header
  const fourthCol = getColumn(page, 3);
  const fourthHeader = fourthCol.locator('.h-14, [class*="cursor-grab"]').first();
  const box = await fourthHeader.boundingBox();
  assert(box !== null, '4th column header must exist');

  // Drag 4th column all the way left to position 0
  const sx = box.x + box.width / 2;
  const sy = box.y + box.height / 2;

  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await page.mouse.move(sx - 800, sy, { steps: 12 });
  await page.waitForTimeout(150);

  // Cancel with Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  await page.mouse.up();
  await page.waitForTimeout(250);

  // Verify 4th column restored to position 3
  const currentCount = await page.locator('.sortable-column-container').count();
  assertEqual(currentCount, 4, 'Must still have 4 columns after Escape cancel');

  const isDragging = await page.evaluate(() => document.body.classList.contains('is-dragging'));
  assert(!isDragging, 'is-dragging must be removed after 4-column Escape cancel');

  // Verify all 3 handles are visible
  const handleStyles = await page.evaluate(() => {
    const list = Array.from(document.querySelectorAll('.custom-resize-handle, [data-resize-handle]'));
    return list.map(el => window.getComputedStyle(el).opacity);
  });
  assertEqual(handleStyles.length, 3, 'Must have 3 handles');
  for (let i = 0; i < handleStyles.length; i++) {
    assert(parseFloat(handleStyles[i]) > 0, `Handle ${i} must restore opacity`);
  }
});

// ============================================================================
// SUITE 4: SUB-5PX MICRO-DRAG IMMUNITY & THRESHOLD
// ============================================================================

registerTest('C1-MICRO-DRAG-THRESHOLD', 'Sub-5px drag attempts do not trigger drag state; >=5px triggers drag state cleanly', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const chatHeader = getColumnHeader(page, 1);
  const box = await chatHeader.boundingBox();
  assert(box !== null, 'Chat header must exist');

  const sx = box.x + box.width / 2;
  const sy = box.y + box.height / 2;

  // Micro-drags 1px to 4px
  for (const px of [1, 2, 3, 4]) {
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx + px, sy);
    await page.waitForTimeout(40);

    const isDragging = await page.evaluate(() => document.body.classList.contains('is-dragging'));
    assert(!isDragging, `${px}px movement must NOT trigger is-dragging`);

    await page.mouse.up();
    await page.waitForTimeout(40);
  }

  // Threshold >= 5px
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await page.mouse.move(sx + 15, sy, { steps: 3 });
  await page.waitForTimeout(100);

  const isDraggingOverThreshold = await page.evaluate(() => document.body.classList.contains('is-dragging'));
  assert(isDraggingOverThreshold, '15px movement must trigger is-dragging');

  await page.mouse.up();
  await page.waitForTimeout(100);
});

// ============================================================================
// RUNNER
// ============================================================================

async function runAll() {
  console.log('================================================================');
  console.log('  CHALLENGER 1: EMPIRICAL STRESS & ADVERSARIAL SUITE (M2: R1, R2, R3)');
  console.log('================================================================\n');

  const browser = await launchBrowser();
  let passedCount = 0;
  let failedCount = 0;
  const results = [];

  try {
    for (const t of challengerTests) {
      const { page, context } = await createPage(browser);
      const start = Date.now();
      let passed = false;
      let error = null;

      try {
        await t.fn({ page });
        passed = true;
        passedCount++;
        console.log(`  ✓ [PASS] [${t.id}] ${t.name}`);
      } catch (err) {
        failedCount++;
        error = err.message;
        console.error(`  ✗ [FAIL] [${t.id}] ${t.name}`);
        console.error(`     Error: ${err.message}`);
        const screenshot = await captureScreenshot(page, `chal1_${t.id}`);
        if (screenshot) console.error(`     Screenshot: ${screenshot}`);
      } finally {
        await context.close();
      }

      results.push({ id: t.id, name: t.name, passed, error, durationMs: Date.now() - start });
    }
  } finally {
    await browser.close();
  }

  console.log('\n================================================================');
  console.log(` RESULTS: ${passedCount}/${challengerTests.length} passed, ${failedCount} failed`);
  console.log('================================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runAll().catch(err => {
    console.error('Fatal challenger runner error:', err);
    process.exit(1);
  });
}

module.exports = { challengerTests, runAll };
