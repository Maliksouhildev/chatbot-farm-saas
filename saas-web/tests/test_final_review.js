const { launchBrowser } = require('./helpers');

async function runAll() {
  console.log('================================================================');
  console.log('   STARTING DEEP RIGOROUS FINAL VERIFICATION TEST SUITE');
  console.log('================================================================\n');

  const browser = await launchBrowser({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition, desc) {
    if (condition) {
      console.log(`  ✓ [PASS] ${desc}`);
      testsPassed++;
    } else {
      console.error(`  ✗ [FAIL] ${desc}`);
      testsFailed++;
      throw new Error(`Assertion failed: ${desc}`);
    }
  }

  try {
    await page.addInitScript(() => {
      const user = {
        id: 'user_local_store_owner',
        email: 'owner@store.dz',
        name: 'Store Owner',
        provider: 'local',
        plan: 'Enterprise DZ Pro',
        verified: true,
        avatar: 'S',
      };
      localStorage.setItem('cf_user_session', JSON.stringify(user));
      localStorage.setItem('cf_connected_apps', JSON.stringify(['whatsapp', 'telegram']));
      localStorage.setItem('cf_connected_apps_user_local_store_owner', JSON.stringify(['whatsapp', 'telegram']));
      localStorage.setItem('cf_panel_sizes', JSON.stringify({ switcher: 25, chat: 45, hub: 30 }));
    });

    console.log('1. Navigating to application...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // =======================================================================
    // TIER 1: DRAG & DROP MECHANICS & DETERMINISTIC CENTER DROP
    // =======================================================================
    console.log('\n--- TIER 1: Drag & Drop Mechanics ---');

    async function getColOrder() {
      return await page.$$eval('[data-panel="true"]', panels => panels.map(p => p.getAttribute('data-testid') || p.id));
    }

    const initialCols = await getColOrder();
    assert(initialCols.length === 3 && initialCols[0] === 'switcher' && initialCols[1] === 'chat' && initialCols[2] === 'hub', 'Initial column order is [switcher, chat, hub]');

    // Check no DragOverlay on initial render
    const dragOverlayCount = await page.$$eval('.dnd-overlay, [class*="DragOverlay"]', els => els.length);
    assert(dragOverlayCount === 0, 'No DragOverlay present in DOM');

    // Drag chat (grabbed at left of header) to center (x = 720)
    const chatHeader = await page.$('#chat .cursor-grab');
    const chatBox = await chatHeader.boundingBox();
    await page.mouse.move(chatBox.x + 30, chatBox.y + 20);
    await page.mouse.down();
    // Move 10px to satisfy PointerSensor activationConstraint: { distance: 5 }
    await page.mouse.move(chatBox.x + 45, chatBox.y + 20, { steps: 5 });
    await page.waitForTimeout(100);

    // Verify opacity is 1 during drag
    const chatOpacity = await page.$eval('#chat .sortable-column-container', el => window.getComputedStyle(el).opacity);
    assert(chatOpacity === '1', `Physical dragged panel retains opacity: 1 (actual: ${chatOpacity})`);

    // Verify zIndex is 9999 during drag
    const chatZIndex = await page.$eval('#chat .sortable-column-container', el => window.getComputedStyle(el).zIndex);
    assert(chatZIndex === '9999', `Physical dragged panel has zIndex: 9999 (actual: ${chatZIndex})`);

    await page.mouse.move(720, chatBox.y + 20, { steps: 10 });
    await page.waitForTimeout(100);
    await page.mouse.up();
    await page.waitForTimeout(500);

    const colsAfterChatCenter = await getColOrder();
    assert(colsAfterChatCenter[1] === 'chat', `Chat dragged from left-header to center lands squarely in slot 1 (actual: ${JSON.stringify(colsAfterChatCenter)})`);

    // Drag switcher (col 0) to center (slot 1)
    const swHeader = await page.$('#switcher .cursor-grab');
    const swBox = await swHeader.boundingBox();
    await page.mouse.move(swBox.x + 30, swBox.y + 20);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(720, swBox.y + 20, { steps: 10 });
    await page.waitForTimeout(100);
    await page.mouse.up();
    await page.waitForTimeout(500);

    const colsAfterSwCenter = await getColOrder();
    assert(colsAfterSwCenter[1] === 'switcher', `Switcher dragged to center drops into slot 1 (actual: ${JSON.stringify(colsAfterSwCenter)})`);

    // Drag switcher to far left (x = 100)
    const swHeader2 = await page.$('#switcher .cursor-grab');
    const swBox2 = await swHeader2.boundingBox();
    await page.mouse.move(swBox2.x + 30, swBox2.y + 20);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(100, swBox2.y + 20, { steps: 10 });
    await page.waitForTimeout(100);
    await page.mouse.up();
    await page.waitForTimeout(500);

    const colsRestored = await getColOrder();
    assert(colsRestored[0] === 'switcher' && colsRestored[1] === 'chat', `Switcher dragged to far left returns to slot 0 (actual: ${JSON.stringify(colsRestored)})`);

    // =======================================================================
    // TIER 2: TELEGRAM AVATAR AUTHENTICITY & FALLBACKS
    // =======================================================================
    console.log('\n--- TIER 2: Telegram Avatar Authenticity ---');
    await page.click('#channel-switcher-telegram');
    await page.waitForTimeout(1500);

    // Verify 0 synthetic Pravatar/UI-Avatar images in Telegram channel
    const imgSources = await page.$$eval('img', imgs => imgs.map(i => i.src));
    const fakeImgs = imgSources.filter(src => src.includes('pravatar.cc') || src.includes('ui-avatars.com'));
    assert(fakeImgs.length === 0, `0 fake pravatar/ui-avatar images found in Telegram view (found: ${fakeImgs.length})`);

    // Verify avatar fallback shows initials when image is missing or 404s
    const avatarInitials = await page.$$eval('[id^="contact-item-"] span', spans => spans.map(s => s.innerText.trim()).filter(t => t.length === 2));
    assert(avatarInitials.includes('AU') && avatarInitials.includes('AL'), `Authentic contact initials (AU, AL) rendered cleanly (actual: ${JSON.stringify(avatarInitials)})`);

    // =======================================================================
    // TIER 3: GROUP CHAT SPLIT-VIEW & POLLING PERSISTENCE
    // =======================================================================
    console.log('\n--- TIER 3: Group Chat Split-View & Polling Persistence ---');
    const tg1 = await page.$('#contact-item-tg_1');
    assert(Boolean(tg1), 'Found group contact Automatique L3 (tg_1)');
    await tg1.click();
    await page.waitForTimeout(500);

    // Verify Topics split pane header is present
    let topicsHeader = await page.$('text="Topics"');
    assert(Boolean(topicsHeader), 'Topics split pane is visible immediately upon opening group chat');

    let topicButtons = await page.$$('button:has-text("#")');
    assert(topicButtons.length === 4, `4 forum topic buttons rendered (#General, #Cours, #TD/TP, #Exams) (actual: ${topicButtons.length})`);

    // Wait 15 seconds (two full 7-second background polling cycles)
    console.log('  ...waiting 15s across 2 background polling cycles to verify split-view does NOT disappear...');
    await page.waitForTimeout(15000);

    topicsHeader = await page.$('text="Topics"');
    assert(Boolean(topicsHeader), 'Topics split pane REMAINS VISIBLE after 15s and did NOT disappear during polling');

    topicButtons = await page.$$('button:has-text("#")');
    assert(topicButtons.length === 4, 'All 4 topics remain visible after 15s');

    // =======================================================================
    // TIER 4: CHANNEL / TOPIC CHAT CONTENT (NO BLANK VIEWS)
    // =======================================================================
    console.log('\n--- TIER 4: Specific Channel / Topic Chat Content ---');

    const topicsToTest = [
      { name: 'General', expectedText: 'Alice' },
      { name: 'Cours', expectedText: 'Chapter 3: State-Space Representation' },
      { name: 'TD/TP', expectedText: 'Reminder: TP #2 report' },
      { name: 'Exams', expectedText: 'Official notice: Midterm exam' }
    ];

    for (const t of topicsToTest) {
      const btn = await page.$(`button:has-text("${t.name}")`);
      assert(Boolean(btn), `Topic #${t.name} button found`);
      await btn.click();
      await page.waitForTimeout(600);

      // Check header breadcrumb
      const headerTitle = await page.$eval('#chat h4, [data-panel-id="chat"] h4', el => el.innerText);
      assert(headerTitle.includes(t.name), `Chat header contains topic breadcrumb #${t.name} (actual: "${headerTitle.replace(/\n/g, ' ')}")`);

      // Check messages are present and not blank
      const chatText = await page.$eval('#chat .custom-scrollbar, [data-panel-id="chat"] .custom-scrollbar', el => el.innerText);
      assert(chatText.includes(t.expectedText), `Topic #${t.name} contains topic message ("${t.expectedText}")`);
    }

    // Test sending message in topic #Cours
    console.log('\n--- Testing message sending in topic #Cours ---');
    const coursBtn = await page.$('button:has-text("Cours")');
    await coursBtn.click();
    await page.waitForTimeout(400);

    const testMsgText = `Verification note ${Date.now()}`;
    await page.fill('#chat input[type="text"], [data-panel-id="chat"] input[type="text"]', testMsgText);
    await page.click('#chat button[type="submit"], [data-panel-id="chat"] button[type="submit"]');
    await page.waitForTimeout(600);

    // Verify message appears in #Cours
    let coursChat = await page.$eval('#chat .custom-scrollbar, [data-panel-id="chat"] .custom-scrollbar', el => el.innerText);
    assert(coursChat.includes(testMsgText), `Sent message rendered immediately in topic #Cours`);

    // Switch to #General, verify message is NOT leaked
    const genBtn = await page.$('button:has-text("General")');
    await genBtn.click();
    await page.waitForTimeout(400);
    const genChat = await page.$eval('#chat .custom-scrollbar, [data-panel-id="chat"] .custom-scrollbar', el => el.innerText);
    assert(!genChat.includes(testMsgText), `Sent message is correctly isolated to #Cours and NOT leaked to #General`);

    // Switch back to #Cours, verify message is still there
    await coursBtn.click();
    await page.waitForTimeout(400);
    coursChat = await page.$eval('#chat .custom-scrollbar, [data-panel-id="chat"] .custom-scrollbar', el => el.innerText);
    assert(coursChat.includes(testMsgText), `Sent message is preserved upon switching back to #Cours`);

    console.log('\n================================================================');
    console.log(` ALL TESTS PASSED: ${testsPassed}/${testsPassed + testsFailed}`);
    console.log('================================================================');
  } finally {
    await browser.close();
  }
}

runAll().catch(err => {
  console.error('\nTest runner fatal error:', err);
  process.exit(1);
});
