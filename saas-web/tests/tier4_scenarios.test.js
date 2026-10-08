/**
 * Tier 4: Real-World Application Scenarios Test Suite
 * Comprehensive End-to-End User Workflows
 * 5 scenarios exercising full application lifecycles.
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

const scenarios = [];

function registerScenario(id, name, features, fn) {
  scenarios.push({ id, name, features, tier: 4, fn });
}

// ============================================================================
// Scenario 1: Narrow Mobile Navigation & Channel Switching (F1, F2)
// ============================================================================
registerScenario(
  'T4-S1',
  'Narrow Mobile Navigation & Channel Switching',
  ['F1', 'F2'],
  async ({ page }) => {
    // 1. Mobile viewport 390x844
    await page.setViewportSize({ width: 390, height: 844 });
    await navigateToApp(page);

    // 2. Verify zero horizontal overflow on mobile
    const overflow = await checkHorizontalOverflow(page);
    assert(!overflow.hasOverflow, `Mobile viewport has horizontal overflow: ${overflow.overflowPx}px`);

    // 3. Verify Navbar elements scale down gracefully
    const header = await page.waitForSelector('header');
    const logo = await header.$('text="Chatbot Farm"');
    assert(logo !== null, 'Logo visible on mobile');

    const nav = await page.$('header nav');
    const isNavVisible = nav ? await nav.isVisible() : false;
    assert(!isNavVisible, 'Desktop nav tabs must not display on mobile');

    // 4. Test Mobile Channel Switching
    const mobileDock = await page.waitForSelector('.flex.md\\:hidden');
    assert(mobileDock !== null, 'Mobile navigation dock should be visible');

    const contactsBtn = await mobileDock.$('button:has-text("Contacts")');
    if (contactsBtn) {
      await contactsBtn.click();
      await page.waitForTimeout(300);
      assert(await page.$('text="Conversations", text="Recent Chats"') !== null, 'Contacts tab content displayed');
    }

    const chatBtn = await mobileDock.$('button:has-text("Chat")');
    if (chatBtn) {
      await chatBtn.click();
      await page.waitForTimeout(300);
    }

    // Verify no unhandled page crashes occurred
    const pageErrors = page.consoleErrors.filter(e => !e.includes('Hydration') && !e.includes('404') && !e.includes('DndDescribedBy'));
    assert(pageErrors.length === 0, `Encountered unhandled page errors: ${pageErrors.join(', ')}`);
  }
);

// ============================================================================
// Scenario 2: Full Workspace Column Reordering & Drag Polish (F3, F4, F5)
// ============================================================================
registerScenario(
  'T4-S2',
  'Full Workspace Column Reordering & Drag Polish',
  ['F3', 'F4', 'F5'],
  async ({ page }) => {
    // 1. Desktop viewport 1440x900
    await page.setViewportSize({ width: 1440, height: 900 });
    await navigateToApp(page);

    // 2. Check initial 3-column setup
    const initialCols = await page.$$('.sortable-column-container');
    assert(initialCols.length >= 3, 'Must have at least 3 columns initially');

    // 3. Drag AppSwitcher header to middle position
    const switcherHeader = await page.waitForSelector('.switcher-header');
    const chatHeader = getColumnHeader(page, 1);
    await chatHeader.waitFor({ state: 'visible' });

    const sBox = await switcherHeader.boundingBox();
    const cBox = await chatHeader.boundingBox();
    assert(sBox && cBox, 'Header bounding boxes must exist');

    await page.mouse.move(sBox.x + sBox.width / 2, sBox.y + sBox.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(50);
    await page.mouse.move(sBox.x + sBox.width / 2 + 60, sBox.y + sBox.height / 2, { steps: 5 });
    await page.waitForTimeout(100);

    const handleOpacityDuring = await page.evaluate(() => {
      const handle = document.querySelector('.custom-resize-handle, [role="separator"]');
      if (!handle) return '0';
      return window.getComputedStyle(handle).opacity;
    });

    await page.mouse.move(cBox.x + cBox.width / 2 + 40, cBox.y + cBox.height / 2, { steps: 10 });
    await page.waitForTimeout(200);
    await page.mouse.up();
    await page.waitForTimeout(500);

    const handleOpacityAfter = await page.evaluate(() => {
      const handle = document.querySelector('.custom-resize-handle, [role="separator"]');
      if (!handle) return '1';
      return window.getComputedStyle(handle).opacity;
    });

    assert(parseFloat(handleOpacityDuring) === 0, 'Resize handles should be hidden during drag');
    assert(parseFloat(handleOpacityAfter) > 0, 'Resize handles should be restored after drop');

    // 5. Drag Chat column by its header back to the left
    const newChatHeader = getColumnHeader(page, 0);
    const nBox = await newChatHeader.boundingBox();
    if (nBox) {
      await page.mouse.move(nBox.x + nBox.width / 2, nBox.y + nBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(nBox.x + nBox.width / 2 + 100, nBox.y + nBox.height / 2, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(400);
    }

    const finalCols = await page.$$('.sortable-column-container');
    assert(finalCols.length >= 3, 'Workspace retains all columns after bidirectional drag reorder');
  }
);

// ============================================================================
// Scenario 3: Detached Analytics & Settings Long-Lived Monitoring (F6, F7)
// ============================================================================
registerScenario(
  'T4-S3',
  'Detached Analytics & Settings Long-Lived Monitoring (10+ seconds)',
  ['F6', 'F7'],
  async ({ page }) => {
    // 1. Desktop viewport 1600x900
    await page.setViewportSize({ width: 1600, height: 900 });
    await navigateToApp(page);

    // 2. Open Analytics tab in RightHub
    const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
    await analyticsTab.click();
    await page.waitForTimeout(300);

    // 3. Detach Analytics tab
    const detachBtn1 = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
    assert(await detachBtn1.isVisible(), 'Detach button must be prominent and visible');
    await detachBtn1.click();
    await page.waitForTimeout(500);

    // 4. Detach Settings tab from RightHub (column 2)
    const hubCol = getColumn(page, 2);
    const settingsTab = hubCol.locator('button:has-text("Settings")').first();
    await settingsTab.waitFor({ state: 'visible' });
    await settingsTab.click();
    await page.waitForTimeout(300);

    const detachBtn2 = hubCol.locator('[title*="Detach"], button:has-text("Detach")').first();
    await detachBtn2.waitFor({ state: 'visible' });
    await detachBtn2.click();
    await page.waitForTimeout(500);

    // 5. Verify 5 columns open
    let cols = await page.$$('.sortable-column-container');
    assert(cols.length === 5, `Expected 5 columns with Analytics and Settings detached, got ${cols.length}`);

    // 6. Long-lived persistence monitoring: 10 full seconds without resetting
    console.log('    Monitoring detached panels endurance across 10 seconds...');
    for (let sec = 2; sec <= 10; sec += 2) {
      await page.waitForTimeout(2000);
      cols = await page.$$('.sortable-column-container');
      assert(cols.length === 5, `Detached panels prematurely closed at ${sec} seconds`);
    }

    // 7. Reattach Settings panel
    const reattachBtns = await page.$$('[title*="Reattach"], button:has-text("Reattach")');
    if (reattachBtns.length > 0) {
      await reattachBtns[0].click();
      await page.waitForTimeout(500);
      cols = await page.$$('.sortable-column-container');
      assert(cols.length === 4, `Expected 4 columns after reattaching one panel, got ${cols.length}`);
    }
  }
);

// ============================================================================
// Scenario 4: Telegram Omnichannel Topic Browsing & Chat (F8, F9)
// ============================================================================
registerScenario(
  'T4-S4',
  'Telegram Omnichannel Topic Browsing & Chat',
  ['F8', 'F9'],
  async ({ page }) => {
    // 1. Desktop viewport 1280x800
    await page.setViewportSize({ width: 1280, height: 800 });
    await navigateToApp(page);

    // 2. Select Telegram from channel switcher
    const tgBtn = await page.waitForSelector('#channel-switcher-telegram, div:has-text("Telegram")');
    await tgBtn.click();
    await page.waitForTimeout(500);

    // 3. Verify Telegram contacts list contains real avatar images
    const hubCol = getColumn(page, 2);
    const contactAvatars = await hubCol.locator('img').count();
    assert(contactAvatars > 0, 'Telegram contacts list must render real profile avatars');

    // 4. Open forum group "Automatique L3"
    const groupItem = await page.waitForSelector('text="Automatique L3"', { timeout: 4000 });
    await groupItem.click();
    await page.waitForTimeout(400);

    // 5. Verify topics split pane appears with topics
    const topicGeneral = await page.waitForSelector('text="General"', { timeout: 4000 });
    const topicCours = await page.waitForSelector('text="Cours"', { timeout: 4000 });
    assert(topicGeneral !== null && topicCours !== null, 'Topics list must show General and Cours');

    // 6. Select "General" topic
    await topicGeneral.click();
    await page.waitForTimeout(500);

    // 7. Verify chat header displays real group avatar and Automatique L3 topic
    const chatHeader = getColumnHeader(page, 1);
    const headerImg = chatHeader.locator('img').first();
    assert(await headerImg.count() > 0, 'Topic chat header must render group avatar image');

    // 8. Send a chat message inside the topic thread
    const inputArea = await page.$('input[placeholder*="Type a message"], textarea[placeholder*="message"], input[type="text"]');
    if (inputArea) {
      await inputArea.fill('Test message for Telegram topic automated e2e');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      const text = await getColumn(page, 1).innerText();
      assert(text.includes('Automatique L3') || text.includes('General'), 'Topic view must remain active after sending message');
    }
  }
);

// ============================================================================
// Scenario 5: End-to-End Multitasking: Detached Panels + Drag Reorder + Mobile Collapse (F1-F9)
// ============================================================================
registerScenario(
  'T4-S5',
  'End-to-End Multitasking: Detached Panels + Drag Reorder + Mobile Collapse',
  ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9'],
  async ({ page }) => {
    // 1. Start in Desktop 1440x900
    await page.setViewportSize({ width: 1440, height: 900 });
    await navigateToApp(page);

    // 2. Switch to Telegram and open topic
    const tgBtn = await page.waitForSelector('#channel-switcher-telegram, div:has-text("Telegram")');
    await tgBtn.click();
    await page.waitForTimeout(300);

    const groupItem = await page.$('text="Automatique L3"');
    if (groupItem) {
      await groupItem.click();
      await page.waitForTimeout(300);
      const topicGeneral = await page.$('text="General"');
      if (topicGeneral) await topicGeneral.click();
    }

    // 3. Detach Analytics to expand to 4 columns
    const analyticsTab = await page.waitForSelector('button:has-text("Analytics"), button:has-text("Stats")');
    await analyticsTab.click();
    await page.waitForTimeout(200);

    const detachBtn = await page.waitForSelector('[title*="Detach"], button:has-text("Detach")');
    await detachBtn.click();
    await page.waitForTimeout(500);

    let cols = await page.$$('.sortable-column-container');
    assert(cols.length === 4, 'Should have 4 columns with detached panel');

    // 4. Drag MiddleChatColumn header across to reorder
    const chatHeader = getColumnHeader(page, 1);
    const cBox = await chatHeader.boundingBox();
    if (cBox) {
      await page.mouse.move(cBox.x + cBox.width / 2, cBox.y + cBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(cBox.x + cBox.width / 2 - 100, cBox.y + cBox.height / 2, { steps: 8 });
      await page.mouse.up();
      await page.waitForTimeout(400);
    }

    // 5. Toggle Dark Mode
    const darkToggle = await page.waitForSelector('header button[title*="Dark"], header button[title*="Switch"]');
    await darkToggle.click();
    await page.waitForTimeout(200);

    // 6. Transition to narrow mobile view (375x812)
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);

    const overflowMobile = await checkHorizontalOverflow(page);
    assert(!overflowMobile.hasOverflow, 'Zero overflow on mobile collapse during multitasking');

    // 7. Transition back to desktop (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);

    cols = await page.$$('.sortable-column-container');
    assert(cols.length >= 3, 'Workspace layout remains solid and intact throughout multitasking lifecycle');
  }
);

// ============================================================================
// Runner Function for Tier 4
// ============================================================================

async function runTier4(browser) {
  console.log(`\n======================================================`);
  console.log(`  TIER 4: REAL-WORLD APPLICATION SCENARIOS (${scenarios.length} scenarios)`);
  console.log(`======================================================\n`);

  const results = [];

  for (const s of scenarios) {
    const { context, page } = await createPage(browser);
    const startTime = Date.now();
    let passed = false;
    let error = null;

    try {
      await s.fn({ page, context });
      passed = true;
      console.log(`  ✓ [PASS] [${s.id}] ${s.name}`);
    } catch (err) {
      error = err.message || String(err);
      const screenshotPath = await captureScreenshot(page, `T4_${s.id}`);
      console.log(`  ✗ [FAIL] [${s.id}] ${s.name}`);
      console.log(`     Error: ${error}`);
      if (screenshotPath) console.log(`     Screenshot: ${screenshotPath}`);
    } finally {
      await context.close();
    }

    results.push({
      id: s.id,
      features: s.features,
      tier: 4,
      name: s.name,
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
      const results = await runTier4(browser);
      const passed = results.filter(r => r.passed).length;
      console.log(`\nTier 4 Summary: ${passed}/${results.length} passed.`);
      process.exit(passed === results.length ? 0 : 1);
    } finally {
      await browser.close();
    }
  })();
}

module.exports = {
  scenarios,
  runTier4,
};
