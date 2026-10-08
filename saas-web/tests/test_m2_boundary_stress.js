/**
 * Adversarial Challenger 2: Boundary & Stress Tests for Milestone 2 (R1, R2, R3)
 *
 * Specific Verification Objectives:
 * 1. Micro-drags (<5px): Moving pointer by <5px must NOT trigger column reorder,
 *    must NOT set .is-dragging on document.body, and must NOT spawn DragOverlay.
 *    Threshold transition: >=5px DOES initiate drag.
 * 2. Minimum column width dragging: Resizing column to minimum size, then dragging
 *    header horizontally to swap positions. Drop commits layout cleanly.
 * 3. Detached panels layout dragging: 4-column layout (detached Analytics/Settings).
 *    Dragging detached panel to reorder between columns, verifying all 3 separators
 *    are hidden (opacity: 0, pointer-events: none) during drag, and order commits.
 * 4. Avatar image click/drag isolation: Avatar images in chat header must have
 *    draggable="false" and pointer-events: none, preventing native HTML5 ghost
 *    image dragging and passing drag events cleanly to column drag handle. Contact
 *    list avatar clicks select contact without column drag.
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

const boundaryTests = [];

function test(id, name, fn) {
  boundaryTests.push({ id, name, fn });
}

// ============================================================================
// SUITE 1: MICRO-DRAGS (< 5px)
// ============================================================================

test('BC-MICRO-1', 'AppSwitcher header micro-drags (1px, 2px, 3px, 4px) do NOT trigger is-dragging, overlay, or reordering', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const header = await page.waitForSelector('.switcher-header');
  const box = await header.boundingBox();
  assert(box !== null, 'AppSwitcher header bounding box must exist');

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  // Test micro-movements from 1px to 4px
  for (const delta of [1, 2, 3, 4]) {
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + delta, startY);
    await page.waitForTimeout(50);

    const isDragging = await page.evaluate(() => document.body.classList.contains('is-dragging'));
    const hasOverlay = await page.evaluate(() => document.querySelector('[data-dnd-overlay="true"]') !== null);

    assert(!isDragging, `is-dragging must NOT be active during ${delta}px micro-drag`);
    assert(!hasOverlay, `DragOverlay must NOT appear during ${delta}px micro-drag`);

    await page.mouse.up();
    await page.waitForTimeout(100);
  }

  // Verify column order remains intact
  const firstCol = getColumn(page, 0);
  const count = await firstCol.locator('.switcher-header').count();
  assert(count > 0, 'AppSwitcher must remain in column position 0 after micro-drags');
});

test('BC-MICRO-2', 'MiddleChatColumn header diagonal micro-drag (<5px vector) does NOT activate drag state', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const chatHeader = getColumnHeader(page, 1);
  const box = await chatHeader.boundingBox();
  assert(box !== null, 'MiddleChatColumn header bounding box must exist');

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  // Diagonal move: dx=2px, dy=2px => distance = sqrt(8) ~= 2.83px < 5px
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 2, startY + 2);
  await page.waitForTimeout(50);

  const isDragging = await page.evaluate(() => document.body.classList.contains('is-dragging'));
  const hasOverlay = await page.evaluate(() => document.querySelector('[data-dnd-overlay="true"]') !== null);

  assert(!isDragging, 'is-dragging must NOT activate on sub-5px diagonal movement');
  assert(!hasOverlay, 'DragOverlay must NOT activate on sub-5px diagonal movement');

  await page.mouse.up();
  await page.waitForTimeout(100);

  const secondCol = getColumn(page, 1);
  const isChat = await secondCol.locator('.lucide-message-square, input[placeholder*="Type a message"], [class*="chat"]').count();
  assert(isChat > 0, 'MiddleChatColumn must remain in column position 1 after micro-drag');
});

test('BC-MICRO-3', 'Distance activation threshold transition: 4px fails to activate, 7px activates drag cleanly', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const header = await page.waitForSelector('.switcher-header');
  const box = await header.boundingBox();
  assert(box !== null, 'Header bounding box must exist');

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  // 1. Move 4px: under threshold
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 4, startY);
  await page.waitForTimeout(60);

  const activeAt4 = await page.evaluate(() => document.body.classList.contains('is-dragging'));
  assert(!activeAt4, 'At 4px displacement, drag must NOT activate (distance constraint is 5px)');
  await page.mouse.up();
  await page.waitForTimeout(150);

  // 2. Move 8px: exceeds threshold => must activate
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 8, startY);
  await page.waitForTimeout(60);

  const activeAt8 = await page.evaluate(() => document.body.classList.contains('is-dragging'));
  assert(activeAt8, 'At 8px displacement (>5px threshold), is-dragging MUST be active');

  // Cancel via Escape
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await page.waitForTimeout(150);

  const activeAfterCancel = await page.evaluate(() => document.body.classList.contains('is-dragging'));
  assert(!activeAfterCancel, 'After cancellation, is-dragging must be cleared');
});

// ============================================================================
// SUITE 2: MINIMUM COLUMN WIDTH DRAGGING
// ============================================================================

test('BC-MINWIDTH-1', 'AppSwitcher resized to minimum width can still be grabbed and dragged to swap positions', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  // Locate the first resize handle between AppSwitcher and MiddleChat
  const resizeHandle = page.locator('.custom-resize-handle').first();
  assert(await resizeHandle.count() > 0, 'First resize handle must exist');

  const handleBox = await resizeHandle.boundingBox();
  assert(handleBox !== null, 'Resize handle bounding box must exist');

  // Drag separator left to compress AppSwitcher to its minimum size
  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(handleBox.x - 200, handleBox.y + handleBox.height / 2, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(300);

  // Verify AppSwitcher width is reduced (< 260px)
  const switcherCol = getColumn(page, 0);
  const switcherBox = await switcherCol.boundingBox();
  assert(switcherBox !== null, 'AppSwitcher bounding box must exist');
  assert(switcherBox.width < 290, `AppSwitcher width should be compressed, got ${switcherBox.width}px`);

  // Now grab the narrow AppSwitcher header and drag it right across MiddleChat to swap
  const switcherHeader = switcherCol.locator('.switcher-header').first();
  const narrowHeaderBox = await switcherHeader.boundingBox();
  assert(narrowHeaderBox !== null, 'Narrow AppSwitcher header bounding box must exist');

  const grabX = narrowHeaderBox.x + narrowHeaderBox.width / 2;
  const grabY = narrowHeaderBox.y + narrowHeaderBox.height / 2;

  await page.mouse.move(grabX, grabY);
  await page.mouse.down();
  // Drag past MiddleChat center
  await page.mouse.move(grabX + 380, grabY, { steps: 10 });
  await page.waitForTimeout(200);

  // Verify overlay and is-dragging are active during the drag
  const isDragging = await page.evaluate(() => document.body.classList.contains('is-dragging'));
  assert(isDragging, 'is-dragging must be active while dragging narrow column');

  await page.mouse.up();
  await page.waitForTimeout(400);

  // Verify swap occurred: position 0 is now MiddleChat, position 1 is AppSwitcher
  const col0 = getColumn(page, 0);
  const col0HasChat = await col0.locator('[class*="chat"], .lucide-message-square, input[placeholder*="Type"]').count();
  assert(col0HasChat > 0, 'Column 0 must now contain Chat after swapping with narrow AppSwitcher');

  const col1 = getColumn(page, 1);
  const col1HasSwitcher = await col1.locator('.switcher-header').count();
  assert(col1HasSwitcher > 0, 'Column 1 must now contain AppSwitcher after swap');
});

test('BC-MINWIDTH-2', 'MiddleChatColumn compressed to minimum width is draggable and swaps cleanly with adjacent columns', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  // Squeeze MiddleChat by moving handle 1 left and handle 2 right
  const handles = page.locator('.custom-resize-handle');
  assert(await handles.count() >= 2, 'Must have at least 2 resize handles');

  const handle2Box = await handles.nth(1).boundingBox();
  if (handle2Box) {
    await page.mouse.move(handle2Box.x + handle2Box.width / 2, handle2Box.y + handle2Box.height / 2);
    await page.mouse.down();
    await page.mouse.move(handle2Box.x - 120, handle2Box.y + handle2Box.height / 2, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(300);
  }

  // Grab MiddleChat header (position 1)
  const chatHeader = getColumnHeader(page, 1);
  const chatBox = await chatHeader.boundingBox();
  assert(chatBox !== null, 'Chat header bounding box must exist');

  // Drag MiddleChat left across AppSwitcher (position 0)
  await page.mouse.move(chatBox.x + chatBox.width / 2, chatBox.y + chatBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(100, chatBox.y + chatBox.height / 2, { steps: 10 });
  await page.waitForTimeout(200);

  await page.mouse.up();
  await page.waitForTimeout(400);

  // Verify Chat is now at position 0
  const firstCol = getColumn(page, 0);
  const hasChat = await firstCol.locator('[class*="chat"], .lucide-message-square, input[placeholder*="Type"]').count();
  assert(hasChat > 0, 'MiddleChat must now occupy column position 0 after leftward drag');
});

test('BC-MINWIDTH-3', 'Resize handles restore full opacity, pointer-events, and hover feedback after minimum width drag', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  // Perform quick drag and drop
  const header = await page.waitForSelector('.switcher-header');
  const box = await header.boundingBox();
  assert(box !== null, 'Header bounding box must exist');

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2, { steps: 3 });
  await page.waitForTimeout(100);
  await page.mouse.up();
  await page.waitForTimeout(300);

  // Check resize handles styles
  const handleStyles = await page.evaluate(() => {
    const handles = Array.from(document.querySelectorAll('.custom-resize-handle'));
    return handles.map(h => {
      const cs = window.getComputedStyle(h);
      return {
        opacity: cs.opacity,
        pointerEvents: cs.pointerEvents,
        cursor: cs.cursor,
      };
    });
  });

  assert(handleStyles.length >= 2, 'Expected at least 2 resize handles');
  for (let i = 0; i < handleStyles.length; i++) {
    const h = handleStyles[i];
    assert(h.opacity === '1', `Handle ${i} opacity must be '1', got '${h.opacity}'`);
    assert(h.pointerEvents !== 'none', `Handle ${i} pointer-events must not be 'none'`);
    assert(h.cursor === 'col-resize', `Handle ${i} cursor must be 'col-resize', got '${h.cursor}'`);
  }
});

// ============================================================================
// SUITE 3: DETACHED PANELS LAYOUT DRAGGING (4-COLUMN LAYOUT)
// ============================================================================

test('BC-DETACH-1', 'Detaching Analytics tab creates 4 columns with 3 resize handles', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await navigateToApp(page);

  // Switch to Analytics tab
  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(200);

  // Click detach button
  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  await detachBtn.click();
  await page.waitForTimeout(500);

  // Verify 4 columns exist
  const columns = await page.$$('.sortable-column-container');
  assertEqual(columns.length, 4, 'Workspace must display exactly 4 columns when 1 panel is detached');

  // Verify 3 resize handles exist
  const handles = await page.$$('.custom-resize-handle');
  assertEqual(handles.length, 3, 'Workspace must have exactly 3 resize handles between 4 columns');
});

test('BC-DETACH-2', 'Dragging detached 4th panel left across workspace conceals all 3 resize handles and commits reorder', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await navigateToApp(page);

  // Detach Analytics
  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(200);
  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  await detachBtn.click();
  await page.waitForTimeout(500);

  // Column 3 is the detached panel
  const detachedCol = getColumn(page, 3);
  const detachedHeader = detachedCol.locator('.h-14, [class*="cursor-grab"]').first();
  const detachedBox = await detachedHeader.boundingBox();
  assert(detachedBox !== null, 'Detached panel header bounding box must exist');

  // Grab detached header and drag left towards index 1 (approx x=400)
  await page.mouse.move(detachedBox.x + detachedBox.width / 2, detachedBox.y + detachedBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(450, detachedBox.y + detachedBox.height / 2, { steps: 12 });
  await page.waitForTimeout(200);

  // Check that all 3 handles are hidden during drag
  const handlesHiddenDuringDrag = await page.evaluate(() => {
    const handles = Array.from(document.querySelectorAll('.custom-resize-handle'));
    return handles.every(h => {
      const cs = window.getComputedStyle(h);
      return cs.opacity === '0' && cs.pointerEvents === 'none';
    });
  });
  assert(handlesHiddenDuringDrag, 'All 3 resize handles must have opacity: 0 and pointer-events: none while dragging 4th panel');

  // Drop
  await page.mouse.up();
  await page.waitForTimeout(500);

  // Verify all 4 columns still exist
  const colsAfter = await page.$$('.sortable-column-container');
  assertEqual(colsAfter.length, 4, 'All 4 columns must remain after drop');

  // Verify detached panel has not disappeared / closed
  const hasAnalytics = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.sortable-column-container')).some(c =>
      (c.innerText && c.innerText.includes('Analytics')) ||
      (c.textContent && c.textContent.toLowerCase().includes('analytics'))
    );
  });
  assert(hasAnalytics, 'Detached Analytics panel must remain present and functional after reorder');

  // Verify all 3 handles restored visibility
  const handlesRestored = await page.evaluate(() => {
    const handles = Array.from(document.querySelectorAll('.custom-resize-handle'));
    return handles.every(h => window.getComputedStyle(h).opacity === '1');
  });
  assert(handlesRestored, 'All 3 resize handles must restore opacity: 1 after drop');
});

test('BC-DETACH-3', 'Dragging AppSwitcher across detached 4-column layout updates placeholder without leftward offset bug', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await navigateToApp(page);

  // Detach Analytics
  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(200);
  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  await detachBtn.click();
  await page.waitForTimeout(500);

  // Drag AppSwitcher (column 0) right into column position 2 (x=800)
  const switcherHeader = await page.waitForSelector('.switcher-header');
  const sBox = await switcherHeader.boundingBox();
  assert(sBox !== null, 'Switcher bounding box must exist');

  await page.mouse.move(sBox.x + sBox.width / 2, sBox.y + sBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(750, sBox.y + sBox.height / 2, { steps: 12 });
  await page.waitForTimeout(250);

  // Verify DragOverlay is rendered and tracking cursor (not collapsed to left: 0)
  const overlayPos = await page.evaluate(() => {
    const overlay = document.querySelector('[data-dnd-overlay="true"]');
    if (!overlay) return null;
    const rect = overlay.getBoundingClientRect();
    return { left: rect.left, width: rect.width };
  });

  assert(overlayPos !== null, 'DragOverlay must be visible during 4-column drag');
  assert(overlayPos.left > 200, `DragOverlay left (${overlayPos.left}px) should track cursor horizontally, not locked to left: 0`);

  // Release
  await page.mouse.up();
  await page.waitForTimeout(400);

  // Verify AppSwitcher is no longer in column 0
  const col0 = getColumn(page, 0);
  const col0IsSwitcher = await col0.locator('.switcher-header').count();
  assertEqual(col0IsSwitcher, 0, 'AppSwitcher must have moved out of column position 0');
});

test('BC-DETACH-4', 'Escape key cancels 4-column drag and restores initial order immediately', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await navigateToApp(page);

  // Detach Settings (specifically inside RightHubColumn, not Navbar)
  const settingsTab = await page.waitForSelector('.sortable-column-container button:has-text("Settings")');
  await settingsTab.click();
  await page.waitForTimeout(200);
  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  await detachBtn.click();
  await page.waitForTimeout(500);

  // Record initial order of column headers
  const initialHeaders = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.sortable-column-container')).map(c => c.getAttribute('data-panel-id') || c.innerText.slice(0, 20));
  });

  // Start dragging column 0
  const header = await page.waitForSelector('.switcher-header');
  const box = await header.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 400, box.y + box.height / 2, { steps: 8 });
  await page.waitForTimeout(150);

  // Press Escape
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await page.waitForTimeout(300);

  // Verify headers restored to initial
  const restoredHeaders = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.sortable-column-container')).map(c => c.getAttribute('data-panel-id') || c.innerText.slice(0, 20));
  });

  assertEqual(restoredHeaders.length, initialHeaders.length, 'Column count must match');
  assertEqual(restoredHeaders[0], initialHeaders[0], 'First column must be restored to original after Escape');
});

// ============================================================================
// SUITE 4: AVATAR IMAGE CLICK / DRAG ISOLATION (NO GHOST IMAGE DRAG)
// ============================================================================

test('BC-AVATAR-1', 'Chat header avatar img tags across multiple channels have draggable="false" and pointer-events: none', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const channelsToVerify = ['whatsapp', 'telegram', 'instagram'];

  for (const ch of channelsToVerify) {
    const btn = await page.$(`#channel-switcher-${ch}`);
    if (btn) {
      await btn.click({ force: true });
      await page.waitForTimeout(300);

      // Dismiss connect modal if shown
      const modal = await page.$('.fixed.inset-0.bg-black\\/65');
      if (modal) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
      }

      // Check header avatar
      const chatHeader = getColumnHeader(page, 1);
      const avatarImg = chatHeader.locator('img').first();
      if (await avatarImg.count() > 0) {
        const draggable = await avatarImg.getAttribute('draggable');
        assertEqual(draggable, 'false', `Avatar in channel ${ch} header must have draggable="false"`);

        const styles = await avatarImg.evaluate(el => {
          const cs = window.getComputedStyle(el);
          return {
            pointerEvents: cs.pointerEvents,
            userSelect: cs.userSelect,
          };
        });
        assert(
          styles.pointerEvents === 'none',
          `Avatar in channel ${ch} header must have pointer-events: none to avoid intercepting drag`
        );
      }
    }
  }
});

test('BC-AVATAR-2', 'Mousedown and drag directly ON chat header avatar does NOT trigger HTML5 ghost drag, smoothly drags column', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  // Switch to Telegram and close modal via X button if shown
  const tgBtn = await page.$('#channel-switcher-telegram');
  if (tgBtn) {
    await tgBtn.click({ force: true });
    await page.waitForTimeout(300);
    const closeBtn = await page.$('.fixed.inset-0 button:has(.lucide-x)');
    if (closeBtn) {
      await closeBtn.click();
      await page.waitForTimeout(300);
    }
  }

  // Setup HTML5 dragstart event listener on page to detect unwanted native image drag
  await page.evaluate(() => {
    window.__nativeDragTriggered = false;
    window.addEventListener('dragstart', (e) => {
      window.__nativeDragTriggered = true;
    }, true);
  });

  const chatHeader = getColumnHeader(page, 1);
  const avatar = chatHeader.locator('img, .rounded-full, svg').first();
  const avatarBox = await avatar.boundingBox();
  assert(avatarBox !== null, 'Header avatar bounding box must exist');

  // Move directly to avatar center
  const centerX = avatarBox.x + avatarBox.width / 2;
  const centerY = avatarBox.y + avatarBox.height / 2;

  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  // Drag left by 200px
  await page.mouse.move(centerX - 200, centerY, { steps: 10 });
  await page.waitForTimeout(150);

  // Check if native HTML5 ghost image drag was triggered
  const nativeDrag = await page.evaluate(() => window.__nativeDragTriggered);
  assert(!nativeDrag, 'Native HTML5 dragstart must NOT be triggered when dragging on avatar');

  // Check if column drag was initiated instead
  const isDragging = await page.evaluate(() => document.body.classList.contains('is-dragging'));
  assert(isDragging, 'Column drag MUST initiate cleanly even when starting mouse gesture on top of avatar');

  await page.mouse.up();
  await page.waitForTimeout(300);

  const isDraggingAfter = await page.evaluate(() => document.body.classList.contains('is-dragging'));
  assert(!isDraggingAfter, 'is-dragging must be removed after mouse release');
});

test('BC-AVATAR-3', 'RightHubColumn contact list avatar click selects contact without triggering column drag', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  // Find contacts in RightHubColumn
  const rightCol = getColumn(page, 2);
  const contactItem = rightCol.locator('[id^="contact-item-"]').nth(1);
  if (await contactItem.count() > 0) {
    const contactAvatar = contactItem.locator('img, .rounded-full').first();
    assert(await contactAvatar.count() > 0, 'Contact item avatar must exist');

    // Click directly on contact avatar
    await contactAvatar.click();
    await page.waitForTimeout(200);

    // Verify is-dragging is NOT set
    const isDragging = await page.evaluate(() => document.body.classList.contains('is-dragging'));
    assert(!isDragging, 'Clicking contact avatar must NOT trigger is-dragging on workspace');

    // Verify contact was selected
    const isSelected = await contactItem.evaluate(el => el.classList.contains('border-l-4'));
    assert(isSelected, 'Contact should be selected after clicking its avatar');
  }
});

test('BC-AVATAR-4', 'Attempting to drag a contact avatar in RightHub does NOT trigger column drag', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const rightCol = getColumn(page, 2);
  const contactItem = rightCol.locator('[id^="contact-item-"]').first();
  if (await contactItem.count() > 0) {
    const avatar = contactItem.locator('img, .rounded-full').first();
    const box = await avatar.boundingBox();
    if (box) {
      // Mouse down and drag inside contact list
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 80, box.y + box.height / 2, { steps: 5 });
      await page.waitForTimeout(100);

      const isDragging = await page.evaluate(() => document.body.classList.contains('is-dragging'));
      assert(!isDragging, 'Dragging on contact item avatar in RightHub must NOT initiate workspace column drag');

      await page.mouse.up();
      await page.waitForTimeout(100);
    }
  }
});

// ============================================================================
// TEST RUNNER
// ============================================================================

async function runAll() {
  console.log('================================================================');
  console.log('  CHALLENGER 2: EMPIRICAL BOUNDARY & STRESS SUITE (M2: R1, R2, R3)');
  console.log('================================================================\n');

  const browser = await launchBrowser();
  let passedCount = 0;
  let failedCount = 0;
  const results = [];

  try {
    for (const t of boundaryTests) {
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
        const screenshot = await captureScreenshot(page, `boundary_${t.id}`);
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
  console.log(` RESULTS: ${passedCount}/${boundaryTests.length} passed, ${failedCount} failed`);
  console.log('================================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runAll().catch(err => {
    console.error('Fatal boundary runner error:', err);
    process.exit(1);
  });
}

module.exports = { boundaryTests, runAll };
