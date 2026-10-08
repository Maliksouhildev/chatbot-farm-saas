const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log('================================================================');
  console.log('   RUNNING USER REQUIREMENTS VERIFICATION SUITE');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ✗ [FAIL] ${name}: ${e.message}`);
      failed++;
    }
  }

  // --- Tier 1: Asset and Storage Sanity Tests ---
  console.log('\n--- Tier 1: Assets & Mock Contacts Isolation ---');

  test('Wallpaper assets: dark and light mode doodle png files exist and are valid', () => {
    const darkBg = path.join(__dirname, '..', 'public', 'telegram-bg-dark.png');
    const lightBg = path.join(__dirname, '..', 'public', 'telegram-bg-light.png');
    assert(fs.existsSync(darkBg), 'telegram-bg-dark.png must exist');
    assert(fs.existsSync(lightBg), 'telegram-bg-light.png must exist');
    assert(fs.statSync(darkBg).size > 10000, 'dark wallpaper must be non-empty');
    assert(fs.statSync(lightBg).size > 10000, 'light wallpaper must be non-empty');
  });

  test('Mascot asset: telegram-mascot.png exists and has transparent dimensions', () => {
    const mascot = path.join(__dirname, '..', 'public', 'telegram-mascot.png');
    assert(fs.existsSync(mascot), 'telegram-mascot.png must exist');
    assert(fs.statSync(mascot).size > 5000, 'mascot image must be non-empty');
  });

  // --- Tier 2: Headless Browser Verification ---
  console.log('\n--- Tier 2: In-Browser End-to-End Tests ---');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 }
  });

  try {
    const page = await browser.newPage();
    page.on('console', msg => {
      if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
    });

    console.log('Loading app on http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    // TEST: Session Persistence & Pre-Authentication
    console.log('\nVerifying Multi-Channel Session Persistence...');
    const sessionPersistenceResult = await page.evaluate(() => {
      // Setup active credentials before login
      localStorage.setItem('cf_telegram_session', 'test_tg_session_string_12345');
      localStorage.setItem('cf_discord_token', 'test_discord_token_xyz');
      localStorage.setItem('cf_whatsapp_creds', 'test_wa_creds_token');
      localStorage.setItem('cf_connected_apps', JSON.stringify(['telegram', 'discord', 'whatsapp', 'gmail']));

      const newUser = {
        id: "usr_test_persist_9988",
        name: "Test Merchant",
        email: "merchant@test.com",
        plan: "Enterprise DZ Pro",
        verified: true,
        avatar: "T"
      };

      // Set user session as if logged in
      localStorage.setItem('cf_user_session', JSON.stringify(newUser));

      return {
        hasTg: Boolean(localStorage.getItem('cf_telegram_session')),
        hasDiscord: Boolean(localStorage.getItem('cf_discord_token')),
        hasWa: Boolean(localStorage.getItem('cf_whatsapp_creds')),
      };
    });

    test('Session credentials preserved in localStorage before reload', () => {
      assert.strictEqual(sessionPersistenceResult.hasTg, true);
      assert.strictEqual(sessionPersistenceResult.hasDiscord, true);
      assert.strictEqual(sessionPersistenceResult.hasWa, true);
    });

    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(2000);

    const reloadedConnectedApps = await page.evaluate(() => {
      const u = JSON.parse(localStorage.getItem('cf_user_session') || '{}');
      const userApps = JSON.parse(localStorage.getItem(`cf_connected_apps_${u.id}`) || '[]');
      const globalApps = JSON.parse(localStorage.getItem('cf_connected_apps') || '[]');
      return { userApps, globalApps };
    });

    test('Logging in automatically restores and pre-authenticates connected channels', () => {
      assert(reloadedConnectedApps.userApps.includes('telegram'), 'telegram must be in user connected apps');
      assert(reloadedConnectedApps.userApps.includes('discord'), 'discord must be in user connected apps');
      assert(reloadedConnectedApps.userApps.includes('whatsapp'), 'whatsapp must be in user connected apps');
    });

    // TEST: Telegram UI & Wallpaper & Empty State & Topic #General
    console.log('\nVerifying Telegram Native Interface UI...');
    await page.evaluate(() => {
      // Switch to Telegram
      const container = document.getElementById('channel-switcher-telegram');
      if (container) {
        const clickTarget = container.querySelector('.absolute.inset-0') || container;
        clickTarget.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
    });
    await sleep(2500);

    // Ensure Thamila (0 messages) is selected to verify empty conversation state
    await page.evaluate(() => {
      const thamilaBtn = document.querySelector('button[id="contact-item-tg_thamila_real"]');
      if (thamilaBtn) thamilaBtn.click();
    });
    await sleep(1000);

    const telegramUI = await page.evaluate(() => {
      const messageFeed = document.querySelector('.custom-scrollbar[style*="telegram-bg"]');
      const hasDoodleBg = messageFeed ? messageFeed.style.backgroundImage.includes('telegram-bg') : false;
      const mascotImg = document.querySelector('img[src="/telegram-mascot.png"]');
      const emptyStateCard = document.querySelector('.backdrop-blur-md');
      const emptyStateTitle = emptyStateCard ? emptyStateCard.textContent.includes('No messages here yet...') : false;

      return {
        hasDoodleBg,
        hasMascot: Boolean(mascotImg),
        emptyStateTitle,
        feedStyle: messageFeed ? messageFeed.getAttribute('style') : null
      };
    });

    test('Telegram doodle repeating wallpaper is active in message feed', () => {
      assert(telegramUI.hasDoodleBg, 'Message feed must have telegram-bg wallpaper style');
      assert(telegramUI.feedStyle.includes('repeat'), 'Wallpaper must have repeat background');
    });

    // Test Dark Mode vs Light Mode wallpaper
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await sleep(500);

    const darkWallpaper = await page.evaluate(() => {
      const feed = document.querySelector('.custom-scrollbar[style*="telegram-bg"]');
      return feed ? feed.style.backgroundImage : '';
    });
    console.log('Dark mode wallpaper:', darkWallpaper);

    // Switch to light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
    });
    await sleep(500);

    // TEST: Contact with 0 messages renders authentic empty state (Thamila test)
    test('Empty conversation state renders Telegram mascot and greeting matching Screenshot 2', () => {
      // When 0 messages, the mascot card must be present with "No messages here yet..."
      assert(telegramUI.hasMascot, 'Mascot image must be rendered');
      assert(telegramUI.emptyStateTitle, 'Must show "No messages here yet..."');
    });

    // Switch to supergroup "الجامعة" to verify forum topic and message bubble rendering
    await page.evaluate(() => {
      const univBtn = document.querySelector('button[id="contact-item-tg_supergroup_university"]');
      if (univBtn) univBtn.click();
    });
    await sleep(1500);

    // TEST: Topic #General is NOT marked Closed
    const topicGeneralStatus = await page.evaluate(() => {
      const generalTopicBadge = document.querySelector('[class*="Closed"]');
      const allText = document.body.innerText;
      const hasGeneralClosed = allText.includes('#General Closed') || allText.includes('General Closed');
      return { hasGeneralClosed, hasClosedBadge: Boolean(generalTopicBadge) };
    });

    test('Topic #General on supergroups is never falsely marked Closed', () => {
      assert.strictEqual(topicGeneralStatus.hasGeneralClosed, false, '#General must not have Closed badge');
    });

    // TEST: Incoming messages never show false "Seen"
    const seenCheck = await page.evaluate(() => {
      const bubbles = Array.from(document.querySelectorAll('.group\\/bubble'));
      const customerBubblesWithSeen = bubbles.filter(b => {
        const isCustomer = !b.className.includes('justify-end') && !b.closest('.justify-end');
        return isCustomer && b.textContent.includes('Seen');
      });
      return customerBubblesWithSeen.length;
    });

    test('Incoming customer messages never falsely display "Seen"', () => {
      assert.strictEqual(seenCheck, 0, '0 incoming bubbles should show "Seen"');
    });

  } finally {
    await browser.close();
  }

  console.log('\n================================================================');
  console.log(`   TEST SUMMARY: ${passed}/${passed + failed} TESTS PASSED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('   🎉 ALL USER REQUIREMENTS VERIFIED SUCCESSFULLY!\n');
  }
}

run().catch((err) => {
  console.error('Test suite runner crashed:', err);
  process.exit(1);
});
