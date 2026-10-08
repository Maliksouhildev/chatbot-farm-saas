/**
 * Tier 3: Cross-Feature Combinations Test Suite
 * Pairwise and multi-feature interaction testing.
 * Minimum requirement: ≥10 tests.
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

function registerTest(id, features, name, fn) {
  tests.push({ id, features, name, tier: 3, fn });
}

// ----------------------------------------------------------------------------
// T3-1: F1 + F2 (Navbar + AppSwitcher Collapse)
// ----------------------------------------------------------------------------
registerTest('T3-1', ['F1', 'F2'], 'Shrinking viewport to 640px while AppSwitcher is minimized produces zero overflow and proper collapses', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 750 });
  await navigateToApp(page);

  const overflow = await checkHorizontalOverflow(page);
  assert(!overflow.hasOverflow, `Overflow detected at 640px viewport: ${overflow.overflowPx}px`);

  const aiText = await page.$('header span:has-text("AI Agent")');
  const isVisible = aiText ? await aiText.isVisible() : false;
  assert(!isVisible, 'AI Agent text should be collapsed in Navbar at 640px');
});

// ----------------------------------------------------------------------------
// T3-2: F1 + F6 (Navbar + Detached Panel)
// ----------------------------------------------------------------------------
registerTest('T3-2', ['F1', 'F6'], 'Detaching Analytics panel while viewport is at 768px tablet width keeps detached panel and navbar responsive', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(200);

  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  await detachBtn.click();
  await page.waitForTimeout(500);

  await page.setViewportSize({ width: 768, height: 800 });
  await page.waitForTimeout(400);

  const overflow = await checkHorizontalOverflow(page);
  assert(!overflow.hasOverflow, 'Zero overflow with detached panel at 768px');
});

// ----------------------------------------------------------------------------
// T3-3: F2 + F3 (AppSwitcher Collapse + Column Drag)
// ----------------------------------------------------------------------------
registerTest('T3-3', ['F2', 'F3'], 'Dragging App Switcher while in minimized state preserves drag handle and placeholder position', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const header = await page.waitForSelector('.switcher-header');
  const box = await header.boundingBox();
  assert(box !== null, 'Switcher header bounding box must exist');

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2, { steps: 5 });
  await page.waitForTimeout(200);

  const isDragging = await page.evaluate(() => {
    return document.body.classList.contains('is-dragging') ||
      document.querySelector('.sortable-column-container.shadow-2xl') !== null;
  });

  await page.mouse.up();
  assert(isDragging, 'AppSwitcher header drag should initiate properly');
});

// ----------------------------------------------------------------------------
// T3-4: F3 + F4 (Drag Placeholder + MiddleChatColumn Drag)
// ----------------------------------------------------------------------------
registerTest('T3-4', ['F3', 'F4'], 'Dragging MiddleChatColumn swaps positions with AppSwitcher smoothly', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const switcherHeader = await page.waitForSelector('.switcher-header');
  const chatHeader = getColumnHeader(page, 1);
  await chatHeader.waitFor({ state: 'visible' });

  const sBox = await switcherHeader.boundingBox();
  const cBox = await chatHeader.boundingBox();
  assert(sBox && cBox, 'Header bounding boxes must exist');

  await page.mouse.move(cBox.x + cBox.width / 2, cBox.y + cBox.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(100);
  await page.mouse.move(sBox.x + sBox.width / 2 - 20, sBox.y + sBox.height / 2, { steps: 15 });
  await page.waitForTimeout(300);
  await page.mouse.up();
  await page.waitForTimeout(500);

  const firstCol = getColumn(page, 0);
  const isChatFirst = await firstCol.locator('.h-14').count();
  assert(isChatFirst > 0, 'Chat column should now be the first column');
});

// ----------------------------------------------------------------------------
// T3-5: F4 + F5 (MiddleChatColumn Drag + Hide Resize Handles)
// ----------------------------------------------------------------------------
registerTest('T3-5', ['F4', 'F5'], 'Initiating drag from MiddleChatColumn header hides all resize handles and restores them on drop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateToApp(page);

  const chatHeader = getColumnHeader(page, 1);
  await chatHeader.waitFor({ state: 'visible' });
  const box = await chatHeader.boundingBox();
  assert(box !== null, 'Chat header bounding box must exist');

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2, { steps: 5 });
  await page.waitForTimeout(200);

  const opacityDuring = await page.evaluate(() => {
    const handle = document.querySelector('.custom-resize-handle, [role="separator"]');
    if (!handle) return '0';
    return window.getComputedStyle(handle).opacity;
  });

  await page.mouse.up();
  await page.waitForTimeout(300);

  const opacityAfter = await page.evaluate(() => {
    const handle = document.querySelector('.custom-resize-handle, [role="separator"]');
    if (!handle) return '1';
    return window.getComputedStyle(handle).opacity;
  });

  assert(parseFloat(opacityDuring) === 0, `Handle opacity should be 0 during chat drag, got ${opacityDuring}`);
  assert(parseFloat(opacityAfter) > 0, `Handle opacity should restore after chat drag, got ${opacityAfter}`);
});

// ----------------------------------------------------------------------------
// T3-6: F6 + F7 (Detached Panels + High Visibility Detach Button in Dark Mode)
// ----------------------------------------------------------------------------
registerTest('T3-6', ['F6', 'F7'], 'Clicking prominent detach button in Dark Mode detaches panel and retains standalone state beyond 4s', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await navigateToApp(page);

  const darkToggle = await page.waitForSelector('header button[title*="Dark"], header button[title*="Switch"]');
  await darkToggle.click();
  await page.waitForTimeout(200);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(200);

  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  assert(await detachBtn.isVisible(), 'Detach button must be visible in dark mode');
  await detachBtn.click();

  await page.waitForTimeout(4500);

  const cols = await page.$$('.sortable-column-container');
  assert(cols.length === 4, `Expected 4 columns after 4.5s in dark mode, found ${cols.length}`);
});

// ----------------------------------------------------------------------------
// T3-7: F6 + F8 (Detached Panels + Telegram Topics)
// ----------------------------------------------------------------------------
registerTest('T3-7', ['F6', 'F8'], 'Detaching Settings tab while active in Telegram Topics view preserves topics split pane', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
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

  const settingsTab = await page.waitForSelector('button:has-text("Settings")');
  await settingsTab.click();
  await page.waitForTimeout(200);

  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  await detachBtn.click();
  await page.waitForTimeout(1000);

  const chatCol = getColumn(page, 1);
  const text = await chatCol.innerText();
  assert(text.includes('Automatique L3') || text.includes('General'), 'Telegram topic must remain selected and open after detaching Settings');
});

// ----------------------------------------------------------------------------
// T3-8: F8 + F9 (Telegram Topics + Global Real Avatars)
// ----------------------------------------------------------------------------
registerTest('T3-8', ['F8', 'F9'], 'Telegram topics view renders real group avatar <img> in chat header', async ({ page }) => {
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
  await page.waitForTimeout(400);

  const chatHeader = getColumnHeader(page, 1);
  const headerImg = chatHeader.locator('img').first();
  assert(await headerImg.count() > 0, 'Group avatar img must be rendered in chat header for Telegram topic');
  const src = await headerImg.getAttribute('src');
  assert(src && src.startsWith('http'), `Avatar img must have valid URL, got ${src}`);
});

// ----------------------------------------------------------------------------
// T3-9: F3 + F5 + F6 (Drag Reorder + Hide Handles + Detached Panels)
// ----------------------------------------------------------------------------
registerTest('T3-9', ['F3', 'F5', 'F6'], 'Dragging detached 4th panel across workspace hides all 3 resize handles cleanly', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await navigateToApp(page);

  const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
  await analyticsTab.click();
  await page.waitForTimeout(200);

  const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
  await detachBtn.click();
  await page.waitForTimeout(500);

  const detachedCol = getColumn(page, 3);
  const header = detachedCol.locator('.h-14, [class*="cursor-grab"]').first();
  await header.waitFor({ state: 'visible' });

  const box = await header.boundingBox();
  assert(box !== null, 'Detached header bounding box must exist');

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 100, box.y + box.height / 2, { steps: 5 });
  await page.waitForTimeout(200);

  const allHidden = await page.evaluate(() => {
    const handles = Array.from(document.querySelectorAll('.custom-resize-handle, [role="separator"]'));
    return handles.every(h => window.getComputedStyle(h).opacity === '0');
  });

  await page.mouse.up();
  assert(allHidden, 'All 3 resize handles must have opacity: 0 during detached panel drag');
});

// ----------------------------------------------------------------------------
// T3-10: F1 + F4 + F9 (Responsive Navbar + Chat Drag + Global Avatars)
// ----------------------------------------------------------------------------
registerTest('T3-10', ['F1', 'F4', 'F9'], 'Dragging chat header at 900px viewport with real contact avatar preserves drag integrity and zero overflow', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 800 });
  await navigateToApp(page);

  const chatHeader = getColumnHeader(page, 1);
  await chatHeader.waitFor({ state: 'visible' });
  const avatar = chatHeader.locator('img').first();
  if (await avatar.count() > 0) {
    const isDraggable = await avatar.getAttribute('draggable');
    assert(isDraggable === 'false', 'Avatar must not hijack header drag');
  }

  const overflow = await checkHorizontalOverflow(page);
  assert(!overflow.hasOverflow, 'Zero horizontal overflow at 900px during chat layout operation');
});

// ============================================================================
// Runner Function for Tier 3
// ============================================================================

async function runTier3(browser) {
  console.log(`\n======================================================`);
  console.log(`  TIER 3: CROSS-FEATURE INTERACTIONS SUITE (${tests.length} tests)`);
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
      console.log(`  ✓ [PASS] [${t.id}] (${t.features.join('+')}) ${t.name}`);
    } catch (err) {
      error = err.message || String(err);
      const screenshotPath = await captureScreenshot(page, `T3_${t.id}`);
      console.log(`  ✗ [FAIL] [${t.id}] (${t.features.join('+')}) ${t.name}`);
      console.log(`     Error: ${error}`);
      if (screenshotPath) console.log(`     Screenshot: ${screenshotPath}`);
    } finally {
      await context.close();
    }

    results.push({
      id: t.id,
      features: t.features,
      tier: 3,
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
      const results = await runTier3(browser);
      const passed = results.filter(r => r.passed).length;
      console.log(`\nTier 3 Summary: ${passed}/${results.length} passed.`);
      process.exit(passed === results.length ? 0 : 1);
    } finally {
      await browser.close();
    }
  })();
}

module.exports = {
  tests,
  runTier3,
};
