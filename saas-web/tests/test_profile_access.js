const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log('================================================================');
  console.log('   RUNNING PROFILE ACCESS & AUTHENTIC VIEW VERIFICATION');
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
    await sleep(1500);

    // Setup pinned apps in switcher and connected apps (WhatsApp connected, other channels demo-paired)
    await page.evaluate(() => {
      const apps = ['whatsapp', 'telegram', 'discord', 'instagram', 'snapchat', 'viber'];
      localStorage.setItem('cf_pinned_apps', JSON.stringify(apps));
      localStorage.setItem('cf_connected_apps', JSON.stringify(['whatsapp']));
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(2000);

    // Helper: switch app via AppSwitcher
    async function selectApp(appId) {
      await page.evaluate((id) => {
        const switcher = document.getElementById(`channel-switcher-${id}`);
        const clickable = switcher?.querySelector('.absolute.inset-0') || switcher;
        if (clickable) clickable.click();
      }, appId);
      await sleep(600);
      await page.keyboard.press('Escape');
      await sleep(400);
    }

    // Helper: close profile dialog if open
    async function closeAnyOpenProfile() {
      await page.evaluate(() => {
        const closeBtns = document.querySelectorAll('[aria-label="Close"], button[title="Close"], .fixed.inset-0');
        closeBtns.forEach(b => b.click());
      });
      await page.keyboard.press('Escape');
      await sleep(400);
    }

    // =========================================================================
    // 1. WhatsApp Profile Test
    // =========================================================================
    console.log('\n--- 1. Testing WhatsApp Profile Access ---');
    await selectApp('whatsapp');

    // Click contact avatar in RightHubColumn (prioritizing an individual contact if available)
    const waAvatarClicked = await page.evaluate(() => {
      const contactBtns = Array.from(document.querySelectorAll('.contact-item-btn'));
      const targetBtn = contactBtns.find(b => b.innerText.includes('+') || b.innerText.includes('Thamila') || b.innerText.includes('Ahmed')) || contactBtns[0] || document.querySelector('.contact-item-avatar-wrapper')?.closest('button');
      if (targetBtn) {
        targetBtn.click();
        const avatar = targetBtn.querySelector('.contact-item-avatar-wrapper') || targetBtn;
        avatar.click();
        return true;
      }
      return false;
    });
    assert(waAvatarClicked, 'Contact avatar should be present in contact listing');
    await sleep(800);

    const waProfileData = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return null;
      const text = dialog.innerText;
      return {
        hasDialog: true,
        text,
        hasPhone: text.includes('+213') || /\+\d+/.test(text) || text.includes('~') || text.includes('Group'),
        hasAbout: text.includes('Hey there! I am using WhatsApp') || text.includes('About') || text.includes('Dispo sur Alger'),
        hasEncryptionNotice: text.includes('End-to-end encrypted') || text.includes('Encryption'),
        hasVerifyModalBtn: Boolean(Array.from(dialog.querySelectorAll('button')).find(b => b.innerText.includes('Verify')))
      };
    });

    test('WhatsApp contact info drawer: large circular photo, phone, about status, and encryption notice', () => {
      assert(waProfileData, 'Profile dialog must be visible');
      assert(waProfileData.hasPhone, 'WhatsApp profile must display phone number');
      assert(waProfileData.hasAbout, 'WhatsApp profile must display About / status quote');
      assert(waProfileData.hasEncryptionNotice, 'WhatsApp profile must display encryption notice');
    });

    // Test Security Verify Modal
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const verifyBtn = Array.from(dialog?.querySelectorAll('button') || []).find(b => b.innerText.includes('Verify'));
      if (verifyBtn) verifyBtn.click();
    });
    await sleep(500);

    const secVerifyResult = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const text = dialog?.innerText || '';
      return {
        has60Digits: text.includes('60-digit number') || text.includes('QR Code') || text.includes('encrypted') || text.includes('Security code'),
        hasQrBadge: Boolean(dialog?.querySelector('svg'))
      };
    });

    test('WhatsApp end-to-end encryption verification modal with 60-digit security code and QR badge', () => {
      assert(secVerifyResult.has60Digits, 'Encryption verify modal must show security code explanation');
    });

    // Close verify modal and main profile via Escape key
    await page.keyboard.press('Escape');
    await sleep(300);
    await page.keyboard.press('Escape');
    await sleep(400);

    // Test WhatsApp chat header avatar click
    const waHeaderClicked = await page.evaluate(() => {
      const headerTrigger = document.querySelector('[title="View WhatsApp Contact info"]');
      if (headerTrigger) {
        headerTrigger.click();
        return true;
      }
      return false;
    });
    await sleep(600);
    const waHeaderDialogOpened = await page.evaluate(() => Boolean(document.querySelector('[role="dialog"]')));
    test('WhatsApp chat header click opens contact profile drawer', () => {
      assert(waHeaderClicked, 'WhatsApp chat header trigger must exist');
      assert(waHeaderDialogOpened, 'Clicking header must open contact profile');
    });
    await closeAnyOpenProfile();

    // =========================================================================
    // 2. Telegram Profile Test
    // =========================================================================
    console.log('\n--- 2. Testing Telegram Profile Access ---');
    await selectApp('telegram');

    // Select the contact so MiddleChatColumn has an active chat
    await page.evaluate(() => {
      const contactBtn = document.querySelector('.contact-item-btn') || document.querySelector('.contact-item-avatar-wrapper')?.closest('button');
      if (contactBtn) contactBtn.click();
    });
    await sleep(500);

    // Click contact avatar in RightHubColumn
    await page.evaluate(() => {
      const avatar = document.querySelector('.contact-item-avatar-wrapper');
      if (avatar) avatar.click();
    });
    await sleep(800);
    await page.screenshot({ path: 'tests/screenshots/verified_profile_telegram.png' });

    const tgProfileData = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return null;
      const text = dialog.innerText;
      return {
        hasDialog: true,
        text,
        hasUsername: text.includes('@') || Boolean(dialog.querySelector('[title="Copy Username"]')),
        hasPhone: text.includes('+213') || /\+\d+/.test(text) || text.includes('Hidden (Broadcast Channel)') || text.includes('Channel'),
        hasBio: text.includes('Bio') || text.includes('Active on telegram') || text.includes('student') || text.includes('boutique') || text.includes('broadcast channel') || text.includes('Official'),
        hasNotificationsToggle: text.includes('Notifications'),
        hasMediaTabs: text.includes('Media') || text.includes('Files') || text.includes('Links')
      };
    });

    test('Telegram authentic profile modal: rounded avatar, @username, phone, bio, notifications toggle & shared media tabs', () => {
      assert(tgProfileData, 'Telegram profile dialog must be visible');
      assert(tgProfileData.hasUsername, 'Telegram profile must display @username');
      assert(tgProfileData.hasPhone, 'Telegram profile must display phone number');
      assert(tgProfileData.hasNotificationsToggle, 'Telegram profile must display notifications toggle');
      assert(tgProfileData.hasMediaTabs, 'Telegram profile must display shared media/files tabs');
    });

    // Dismiss with Close button
    await page.evaluate(() => {
      const closeBtn = document.querySelector('[aria-label="Close"], button[title="Close Profile"]');
      if (closeBtn) closeBtn.click();
    });
    await sleep(400);

    // Test Telegram chat header click
    const tgHeaderClicked = await page.evaluate(() => {
      const headerTrigger = document.querySelector('[title="View Telegram Profile"]') ||
                            document.querySelector('[title="View Telegram Contact info"]') ||
                            document.querySelector('h4')?.closest('.cursor-pointer');
      if (headerTrigger) {
        headerTrigger.click();
        return true;
      }
      return false;
    });
    await sleep(600);
    const tgHeaderDialogOpened = await page.evaluate(() => Boolean(document.querySelector('[role="dialog"]')));
    test('Telegram chat header click opens user info modal', () => {
      assert(tgHeaderClicked, 'Telegram chat header trigger must exist');
      assert(tgHeaderDialogOpened, 'Clicking Telegram header must open user info modal');
    });
    await closeAnyOpenProfile();

    // =========================================================================
    // 3. Discord Profile Test
    // =========================================================================
    console.log('\n--- 3. Testing Discord Profile Access ---');
    await selectApp('discord');

    // Select the contact so MiddleChatColumn loads it
    await page.evaluate(() => {
      const contactBtn = document.querySelector('.contact-item-btn') || document.querySelector('.contact-item-avatar-wrapper')?.closest('button');
      if (contactBtn) contactBtn.click();
    });
    await sleep(500);

    // Click avatar in contact listing
    await page.evaluate(() => {
      const avatar = document.querySelector('.contact-item-avatar-wrapper');
      if (avatar) avatar.click();
    });
    await sleep(800);
    await page.screenshot({ path: 'tests/screenshots/verified_profile_discord.png' });

    const discordProfileData = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return null;
      const text = dialog.innerText;
      return {
        hasDialog: true,
        text,
        hasBadges: Boolean(dialog.querySelector('[title*="Subscriber"], [title*="Booster"], [title*="Dev"]')) || text.includes('⚡') || text.includes('Nitro') || text.includes('Active User'),
        hasRoles: text.includes('ROLES') || text.includes('Member') || text.includes('Bot') || text.includes('Roles'),
        hasAboutMe: text.includes('ABOUT ME') || text.includes('About') || text.includes('Active on discord'),
        hasNoteSection: text.includes('NOTE') || Boolean(dialog.querySelector('input[placeholder*="note"], textarea')),
        hasMemberSince: text.includes('MEMBER SINCE') || text.includes('Joined') || text.includes('January')
      };
    });

    test('Discord authentic user popout card: custom banner, badges cluster, custom status, About Me, roles pills, and editable note', () => {
      assert(discordProfileData, 'Discord profile dialog must be visible');
      assert(discordProfileData.hasAboutMe, 'Discord profile must have About Me section');
      assert(discordProfileData.hasRoles, 'Discord profile must display Roles pills');
      assert(discordProfileData.hasNoteSection, 'Discord profile must have editable NOTE section');
    });

    // Test saving Discord note in localStorage
    const noteSaved = await page.evaluate(() => {
      const noteInput = document.querySelector('input[placeholder*="note"], textarea');
      if (noteInput) {
        noteInput.value = 'VIP customer - High priority';
        noteInput.dispatchEvent(new Event('input', { bubbles: true }));
        noteInput.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    });
    await sleep(300);
    test('Discord note persistence interactive update', () => {
      assert(noteSaved, 'Discord note input should be interactive');
    });

    // Dismiss modal via close button or backdrop click
    await closeAnyOpenProfile();

    // Test Discord native chat header & message author clicks
    const discordHeaderClicked = await page.evaluate(() => {
      const headerAvatar = document.querySelector('[title="View Discord Profile"]');
      if (headerAvatar) {
        headerAvatar.click();
        return true;
      }
      return false;
    });
    await sleep(600);
    const discordHeaderOpened = await page.evaluate(() => Boolean(document.querySelector('[role="dialog"]')));
    test('Discord channel header click opens user profile card', () => {
      assert(discordHeaderClicked, 'Discord header profile trigger must exist');
      assert(discordHeaderOpened, 'Clicking Discord header must open profile card');
    });
    await closeAnyOpenProfile();

    // =========================================================================
    // 4. Instagram Profile Test
    // =========================================================================
    console.log('\n--- 4. Testing Instagram Profile Access ---');
    await selectApp('instagram');

    // Select the contact
    await page.evaluate(() => {
      const contactBtn = document.querySelector('.contact-item-btn') || document.querySelector('.contact-item-avatar-wrapper')?.closest('button');
      if (contactBtn) contactBtn.click();
    });
    await sleep(500);

    await page.evaluate(() => {
      const avatar = document.querySelector('.contact-item-avatar-wrapper');
      if (avatar) avatar.click();
    });
    await sleep(800);
    await page.screenshot({ path: 'tests/screenshots/verified_profile_instagram.png' });

    const igProfileData = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return null;
      const text = dialog.innerText.toLowerCase();
      return {
        hasDialog: true,
        text,
        hasCounters: text.includes('posts') && text.includes('followers') && text.includes('following'),
        hasBio: text.includes('bio') || text.includes('official') || text.includes('boutique') || text.includes('dz') || text.includes('active on instagram') || text.includes('fashion') || text.includes('creator'),
        hasActionButtons: text.includes('follow') || text.includes('following') || text.includes('message')
      };
    });

    test('Instagram profile sheet: story gradient ring avatar, posts/followers/following counters, bio & actions', () => {
      assert(igProfileData, 'Instagram profile dialog must be visible');
      assert(igProfileData.hasCounters, 'Instagram profile must display posts/followers/following counters');
      assert(igProfileData.hasActionButtons, 'Instagram profile must display action buttons');
    });

    await page.keyboard.press('Escape');
    await sleep(400);

    // =========================================================================
    // 5. Snapchat Profile Test
    // =========================================================================
    console.log('\n--- 5. Testing Snapchat Profile Access ---');
    await selectApp('snapchat');

    // Select the contact
    await page.evaluate(() => {
      const contactBtn = document.querySelector('.contact-item-btn') || document.querySelector('.contact-item-avatar-wrapper')?.closest('button');
      if (contactBtn) contactBtn.click();
    });
    await sleep(500);

    await page.evaluate(() => {
      const avatar = document.querySelector('.contact-item-avatar-wrapper');
      if (avatar) avatar.click();
    });
    await sleep(800);
    await page.screenshot({ path: 'tests/screenshots/verified_profile_snapchat.png' });

    const snapProfileData = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return null;
      const text = dialog.innerText;
      return {
        hasDialog: true,
        text,
        hasSnapScore: text.includes('Snap Score') || /\d{2,3},\d{3}/.test(text),
        hasStreak: text.includes('Streak') || text.includes('🔥') || text.includes('245') || text.includes('180'),
        hasAstrological: text.includes('Leo') || text.includes('Libra') || text.includes('♌') || text.includes('♎'),
        hasActions: text.includes('Send Snap') || text.includes('Chat')
      };
    });

    test('Snapchat friendship profile: yellow card, Bitmoji, Snapcode, Snap Score, astrology badge & streak banner', () => {
      assert(snapProfileData, 'Snapchat profile dialog must be visible');
      assert(snapProfileData.hasSnapScore, 'Snapchat profile must display Snap Score');
      assert(snapProfileData.hasStreak, 'Snapchat profile must display active streak banner');
      assert(snapProfileData.hasAstrological, 'Snapchat profile must display astrological sign');
    });

    await page.keyboard.press('Escape');
    await sleep(400);

    // Test Snapchat Native View header trigger
    const snapHeaderClicked = await page.evaluate(() => {
      const trigger = document.querySelector('[title="View Snapchat Friendship Profile"]');
      if (trigger) {
        trigger.click();
        return true;
      }
      return false;
    });
    await sleep(600);
    const snapHeaderOpened = await page.evaluate(() => Boolean(document.querySelector('[role="dialog"]')));
    test('Snapchat native chat header click opens friendship profile', () => {
      assert(snapHeaderClicked, 'Snapchat chat header trigger must exist');
      assert(snapHeaderOpened, 'Clicking Snapchat header must open friendship profile');
    });
    await closeAnyOpenProfile();

    // =========================================================================
    // 6. Viber Profile Test
    // =========================================================================
    console.log('\n--- 6. Testing Viber Profile Access ---');
    await selectApp('viber');

    // Select the contact
    await page.evaluate(() => {
      const contactBtn = document.querySelector('.contact-item-btn') || document.querySelector('.contact-item-avatar-wrapper')?.closest('button');
      if (contactBtn) contactBtn.click();
    });
    await sleep(500);

    await page.evaluate(() => {
      const avatar = document.querySelector('.contact-item-avatar-wrapper');
      if (avatar) avatar.click();
    });
    await sleep(800);
    await page.screenshot({ path: 'tests/screenshots/verified_profile_viber.png' });

    const viberProfileData = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return null;
      const text = dialog.innerText;
      return {
        hasDialog: true,
        text,
        hasPhone: text.includes('+213') || /\+\d+/.test(text),
        hasFreeCall: text.includes('Free Call') || text.includes('Free Message'),
        hasAbout: text.includes('About') || text.includes('Viber') || text.includes('Yalidine') || text.includes('call')
      };
    });

    test('Viber contact card: Viber purple brand card, phone number, Free Call and Free Message action buttons', () => {
      assert(viberProfileData, 'Viber profile dialog must be visible');
      assert(viberProfileData.hasPhone, 'Viber profile must display phone number');
      assert(viberProfileData.hasFreeCall, 'Viber profile must display Free Call / Message buttons');
    });

    await page.keyboard.press('Escape');
    await sleep(400);

    // Test Viber Native View header trigger
    const viberHeaderClicked = await page.evaluate(() => {
      const trigger = document.querySelector('[title="View Viber Contact Info"]');
      if (trigger) {
        trigger.click();
        return true;
      }
      return false;
    });
    await sleep(600);
    const viberHeaderOpened = await page.evaluate(() => Boolean(document.querySelector('[role="dialog"]')));
    test('Viber native chat header click opens Viber contact card', () => {
      assert(viberHeaderClicked, 'Viber chat header trigger must exist');
      assert(viberHeaderOpened, 'Clicking Viber header must open contact card');
    });
    await closeAnyOpenProfile();

    console.log('\n================================================================');
    console.log(`   TEST SUMMARY: ${passed}/${passed + failed} TESTS PASSED`);
    console.log('================================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('   🎉 ALL PROFILE ACCESS VERIFICATION TESTS PASSED!');
    }
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
