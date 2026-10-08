const { chromium } = require('playwright');
const assert = require('assert');

(async () => {
  console.log('================================================================');
  console.log('   STARTING WHATSAPP OVERHAUL VERIFICATION SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function testPass(desc) {
    passedTests++;
    totalTests++;
    console.log(`  ✓ [PASS] ${desc}`);
  }

  function testFail(desc, err) {
    totalTests++;
    console.error(`  ✗ [FAIL] ${desc}:`, err?.message || err);
  }

  // -------------------------------------------------------------
  // Test Tier 1: Backend Isolation & Media Streaming APIs
  // -------------------------------------------------------------
  console.log('--- Tier 1: Backend API Tests ---');
  try {
    // 1. Isolation check
    const chatsRes = await fetch('http://localhost:3000/api/channels/whatsapp/chats');
    const chatsData = await chatsRes.json();
    const chats = chatsData.chats || [];
    assert(chats.length >= 2, 'Must have at least 2 WhatsApp chats to verify isolation');
    
    const c1 = chats[0];
    const c2 = chats[1];
    
    const m1Res = await fetch(`http://localhost:3000/api/channels/whatsapp/messages?remoteJid=${encodeURIComponent(c1.id)}`);
    const m1Data = await m1Res.json();
    
    const m2Res = await fetch(`http://localhost:3000/api/channels/whatsapp/messages?remoteJid=${encodeURIComponent(c2.id)}`);
    const m2Data = await m2Res.json();
    
    const ids1 = new Set((m1Data.messages || []).map(m => m.id));
    const overlap = (m2Data.messages || []).filter(m => ids1.has(m.id));
    assert.strictEqual(overlap.length, 0, `Overlap between contact ${c1.name} and ${c2.name} must be 0`);
    testPass('Contact thread isolation: 0 cross-contamination between different contacts');
  } catch (err) {
    testFail('Contact thread isolation', err);
  }

  try {
    // 2. Media proxy streaming check
    const mediaRes = await fetch('http://localhost:3000/api/channels/whatsapp/media?messageId=cmu71b4oc0005sxgxtj1j5443');
    assert.strictEqual(mediaRes.status, 200, 'Media response status must be 200');
    assert.strictEqual(mediaRes.headers.get('content-type'), 'video/mp4', 'Content-Type must be video/mp4');
    const buf = await mediaRes.arrayBuffer();
    assert(buf.byteLength > 1000000, 'Media payload buffer must be non-empty valid video');
    testPass('Media proxy streaming: successfully streams binary MP4 video from Evolution API');
  } catch (err) {
    testFail('Media proxy streaming', err);
  }

  try {
    // 3. Download header check
    const downloadRes = await fetch('http://localhost:3000/api/channels/whatsapp/media?messageId=cmu71b4oc0005sxgxtj1j5443&download=1');
    const disp = downloadRes.headers.get('content-disposition');
    assert(disp && disp.includes('attachment; filename='), 'Download request must set Content-Disposition: attachment');
    testPass('Media download: sets Content-Disposition attachment header for direct downloads');
  } catch (err) {
    testFail('Media download', err);
  }

  try {
    // 4. Send media validation check
    const sendMediaRes = await fetch('http://localhost:3000/api/channels/whatsapp/send-media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.strictEqual(sendMediaRes.status, 400, 'Empty send-media body must return 400 Bad Request');
    testPass('Send media route: validates request parameters and returns 400 on missing payload');
  } catch (err) {
    testFail('Send media route validation', err);
  }

  // -------------------------------------------------------------
  // Test Tier 2: Frontend UI & Interaction Tests (Playwright)
  // -------------------------------------------------------------
  console.log('\n--- Tier 2: Frontend UI & Interactive Tests ---');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.addInitScript(() => {
      localStorage.setItem('cf_connected_apps', JSON.stringify(['whatsapp']));
      localStorage.setItem('cf_connected_apps_admin_local', JSON.stringify(['whatsapp']));
    });

    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // 5. Header Right Panel Toggle Button Removal Check
    const toggleButtonExists = await page.evaluate(() => {
      const chatHeader = document.querySelector('.middlechat-header') || document.querySelector('#chat');
      const buttons = Array.from(document.querySelectorAll('button[title*="Details Hub"]'));
      return buttons.length > 0;
    });
    assert.strictEqual(toggleButtonExists, false, 'Details Hub toggle button must be completely absent in WhatsApp header');
    testPass('Header Clean-up: Right panel collapse toggle button is completely removed');

    // 6. Quick Responses Bar and (+) Modal Check
    const quickBarText = await page.evaluate(() => {
      const el = document.querySelector('.middle-chat-container');
      return el ? el.innerText : '';
    });
    assert(quickBarText.includes('RÉPONSES RAPIDES:') || quickBarText.includes('QUICK'), 'Quick responses bar must be rendered');
    testPass('Quick Responses Bar: displays dynamic quick response templates bar');

    // 7. Verify (+) Modal Open and Custom Template Creation
    const addBtn = await page.locator('button[title="Ajouter un message préenregistré personnalisé"]');
    assert(await addBtn.count() > 0, 'Add template (+) button must exist');
    await addBtn.first().click();
    await page.waitForTimeout(300);

    const modalTitleVisible = await page.locator('text=Nouveau message préenregistré').isVisible();
    assert(modalTitleVisible, 'Custom template modal must open upon clicking (+)');
    testPass('Quick Template Modal: opens modal dialog upon clicking (+) button');

    // Fill new template
    await page.locator('input[placeholder="Ex: Devis Rapide"]').fill('Test Devis Rapide');
    await page.locator('textarea[placeholder*="Bonjour {name}"]').fill('Salam {name}, voici le tarif promo 2,500 DA!');
    await page.locator('button:has-text("Enregistrer")').click();
    await page.waitForTimeout(500);

    // Verify template chip is rendered
    const newChip = await page.locator('button:has-text("Test Devis Rapide")');
    assert(await newChip.count() > 0, 'New custom template chip must appear in the quick responses bar');
    testPass('Custom Template Persistence: new template is successfully created and rendered in the bar');

    // 8. Clicking quick template fills input
    await newChip.first().click();
    await page.waitForTimeout(200);
    const inputVal = await page.locator('#whatsapp-chat-input').first().inputValue();
    assert(inputVal.includes('2,500 DA'), 'Clicking quick template chip must populate message input');
    testPass('Quick Template Injection: clicking template populates input with resolved text');

    // 9. Absence of fake "Seen" text label
    const hasSeenText = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span'));
      return spans.some(s => s.textContent?.trim() === 'Seen');
    });
    assert.strictEqual(hasSeenText, false, 'Redundant text "Seen" must be absent, replaced by clean checkmarks');
    testPass('Native Status Display: text label "Seen" is replaced by clean WhatsApp checkmarks');

    // 10. Floating Reaction Position
    const reactionPickerInDom = await page.evaluate(() => {
      const pickers = Array.from(document.querySelectorAll('.animate-in'));
      return pickers.some(p => p.className.includes('-bottom-3.5'));
    });
    assert.strictEqual(reactionPickerInDom, false, 'No reaction picker should be anchored with -bottom-3.5');
    testPass('Reaction Picker Positioning: reaction picker is no longer docked awkwardly at the bottom overlapping text');

  } catch (err) {
    testFail('Frontend UI tests', err);
  } finally {
    if (browser) await browser.close();
  }

  console.log('\n================================================================');
  console.log(`   TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('================================================================');

  if (passedTests === totalTests) {
    console.log('   🎉 ALL WHATSAPP OVERHAUL REQUIREMENTS VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } else {
    process.exit(1);
  }
})();
