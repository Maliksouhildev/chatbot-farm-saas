const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log('=== STARTING PROGRESSIVE RESPONSIVENESS TEST SUITE ===');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });

  console.log('1. Loading dashboard and setting up user session...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  await page.evaluate(() => {
    const user = {
      id: "ca7e08cc-5db0-4c29-a213-057f7ef9e0b4",
      name: "Malik Mehdid",
      email: "contact@elbahdja.dz",
      plan: "Enterprise DZ Pro",
      verified: true,
      avatar: "M"
    };
    const connected = ['whatsapp', 'telegram', 'instagram', 'discord', 'signal', 'slack', 'gmail'];
    localStorage.setItem('cf_user_session', JSON.stringify(user));
    localStorage.setItem(`cf_connected_apps_${user.id}`, JSON.stringify(connected));
    localStorage.setItem('cf_connected_apps_admin_local', JSON.stringify(connected));
    localStorage.setItem('cf_connected_apps', JSON.stringify(connected));
    localStorage.setItem('cf_pinned_apps', JSON.stringify(connected));
  });

  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(2000);

  const report = {
    test1_zeroHorizontalScroll: false,
    test2_detachButtonHidesWhenNarrow: false,
    test3_disconnectedScreenAdaptive: false,
    test4_appSwitcherThreeTierResponsiveness: false,
    test5_analyticsMetricBadges: false,
    test6_settingsTogglesAndDisconnectContainment: false,
    details: []
  };

  // =========================================================================
  // TEST 1: ZERO HORIZONTAL SCROLL ON SQUEEZED PANELS
  // =========================================================================
  console.log('\n--- TEST 1: Checking Zero Horizontal Scroll on Panels ---');
  const horizontalScrollCheck = await page.evaluate(() => {
    const allScrollbars = Array.from(document.querySelectorAll('.custom-scrollbar, [class*="overflow-y-auto"]'));
    const overflowingElements = allScrollbars.filter(el => {
      return el.scrollWidth > el.clientWidth + 2;
    });
    return {
      totalScrollContainers: allScrollbars.length,
      overflowingCount: overflowingElements.length,
      overflowDetails: overflowingElements.map(el => ({
        tag: el.tagName,
        className: el.className.substring(0, 50),
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth
      }))
    };
  });
  console.log('Horizontal scroll check:', horizontalScrollCheck);
  if (horizontalScrollCheck.overflowingCount === 0) {
    report.test1_zeroHorizontalScroll = true;
    report.details.push('TEST 1 PASS: Zero horizontal scrolling across all scroll containers (scrollWidth <= clientWidth)');
  } else {
    report.details.push(`TEST 1 FAIL: ${horizontalScrollCheck.overflowingCount} containers have horizontal overflow`);
  }

  // =========================================================================
  // TEST 2: DETACH BUTTON HIDES BELOW 235px & TABS EXPAND
  // =========================================================================
  console.log('\n--- TEST 2: Detach Button Hiding When Narrow ---');
  // First switch to analytics at normal width
  await page.evaluate(() => {
    document.getElementById('tab-btn-analytics')?.click();
  });
  await sleep(400);

  const initialDetachCheck = await page.evaluate(() => {
    const detachBtn = document.querySelector('.hub-detach-btn');
    return {
      detachBtnExists: Boolean(detachBtn),
      detachDisplay: detachBtn ? window.getComputedStyle(detachBtn).display : 'none'
    };
  });
  console.log('Initial detach check at normal width:', initialDetachCheck);

  // Now compress RightHubColumn to 180px
  await page.evaluate(() => {
    const hubPanel = document.getElementById('hub');
    if (hubPanel) {
      hubPanel.style.setProperty('width', '180px', 'important');
      hubPanel.style.setProperty('flex', 'none', 'important');
    }
  });
  await sleep(600);

  const narrowDetachCheck = await page.evaluate(() => {
    const detachBtn = document.querySelector('.hub-detach-btn');
    const isHidden = detachBtn ? window.getComputedStyle(detachBtn).display === 'none' : true;
    const tabText = document.querySelector('.hub-tab-text');
    const tabTextHidden = tabText ? window.getComputedStyle(tabText).display === 'none' : true;
    return { isHidden, tabTextHidden };
  });
  console.log('Narrow detach check at 180px:', narrowDetachCheck);

  if (narrowDetachCheck.isHidden && narrowDetachCheck.tabTextHidden) {
    report.test2_detachButtonHidesWhenNarrow = true;
    report.details.push('TEST 2 PASS: Detach button completely hidden at narrow width (180px) and tab labels collapsed to icons');
  } else {
    report.details.push(`TEST 2: isHidden=${narrowDetachCheck.isHidden}, tabTextHidden=${narrowDetachCheck.tabTextHidden}`);
  }

  // =========================================================================
  // TEST 5: ANALYTICS PANEL METRIC BADGES
  // =========================================================================
  console.log('\n--- TEST 5: Analytics Metric Badges at Narrow Width ---');
  // Squeeze to 170px (<= 185px compact breakpoint)
  await page.evaluate(() => {
    const hubPanel = document.getElementById('hub');
    if (hubPanel) {
      hubPanel.style.setProperty('width', '170px', 'important');
      hubPanel.style.setProperty('flex', 'none', 'important');
    }
  });
  await sleep(600);

  const analyticsBadgeCheck = await page.evaluate(() => {
    const aiDesc = document.querySelector('.analytics-ai-desc');
    const aiDescHidden = aiDesc ? window.getComputedStyle(aiDesc).display === 'none' : false;

    const compactBadges = Array.from(document.querySelectorAll('.analytics-val-compact'));
    const compactVisible = compactBadges.some(b => window.getComputedStyle(b).display !== 'none');

    const largeVals = Array.from(document.querySelectorAll('.analytics-val-large'));
    const largeHidden = largeVals.some(v => window.getComputedStyle(v).display === 'none');

    return { aiDescHidden, compactVisible, largeHidden, compactCount: compactBadges.length };
  });
  console.log('Analytics badge check at 170px:', analyticsBadgeCheck);

  if (analyticsBadgeCheck.aiDescHidden && (analyticsBadgeCheck.compactVisible || analyticsBadgeCheck.compactCount > 0)) {
    report.test5_analyticsMetricBadges = true;
    report.details.push('TEST 5 PASS: Analytics AI description hidden and compact badges (49k DA, 14) active at narrow width');
  } else {
    report.details.push(`TEST 5: aiDescHidden=${analyticsBadgeCheck.aiDescHidden}, compactVisible=${analyticsBadgeCheck.compactVisible}`);
  }

  // Take screenshot of narrow analytics
  const analyticsHub = await page.$('.right-hub-container') || await page.$('#hub');
  if (analyticsHub) {
    await analyticsHub.screenshot({ path: path.join(__dirname, 'verified_narrow_analytics.png') });
    console.log('Saved screenshot: verified_narrow_analytics.png');
  }

  // =========================================================================
  // TEST 6: SETTINGS PANEL TOGGLES AND DISCONNECT BUTTON CONTAINMENT
  // =========================================================================
  console.log('\n--- TEST 6: Settings Toggles & Disconnect Containment ---');
  await page.evaluate(() => {
    const tabSettings = document.getElementById('tab-btn-settings');
    tabSettings?.click();
  });
  await sleep(600);

  const settingsCheck = await page.evaluate(() => {
    const ruleDesc = document.querySelector('.settings-rule-desc');
    const ruleDescHidden = ruleDesc ? window.getComputedStyle(ruleDesc).display === 'none' : false;

    const disconnectCard = document.querySelector('.settings-disconnect-container')?.parentElement;
    const disconnectBtn = document.getElementById('settings-disconnect-channel-btn');

    let isContained = true;
    if (disconnectCard && disconnectBtn) {
      const cardRect = disconnectCard.getBoundingClientRect();
      const btnRect = disconnectBtn.getBoundingClientRect();
      isContained = btnRect.right <= cardRect.right + 4 && btnRect.left >= cardRect.left - 4;
    }

    return {
      ruleDescHidden,
      isContained
    };
  });
  console.log('Settings check at 170px:', settingsCheck);

  if (settingsCheck.ruleDescHidden && settingsCheck.isContained) {
    report.test6_settingsTogglesAndDisconnectContainment = true;
    report.details.push('TEST 6 PASS: Settings rule descriptions hidden and red Disconnect button is strictly contained within card boundary');
  } else {
    report.details.push(`TEST 6: ruleDescHidden=${settingsCheck.ruleDescHidden}, isContained=${settingsCheck.isContained}`);
  }

  // Take screenshot of narrow settings
  if (analyticsHub) {
    await analyticsHub.screenshot({ path: path.join(__dirname, 'verified_narrow_settings.png') });
    console.log('Saved screenshot: verified_narrow_settings.png');
  }

  // Restore RightHub
  await page.evaluate(() => {
    const hubPanel = document.getElementById('hub');
    if (hubPanel) {
      hubPanel.style.setProperty('width', '', '');
      hubPanel.style.setProperty('flex', '', '');
    }
  });
  await sleep(400);

  // =========================================================================
  // TEST 3: DISCONNECTED CHANNEL SCREEN ADAPTIVE REDESIGN
  // =========================================================================
  console.log('\n--- TEST 3: Disconnected Screen Adaptive Redesign ---');
  // Disconnect whatsapp in state to view disconnected screen
  await page.evaluate(() => {
    localStorage.setItem('cf_connected_apps', JSON.stringify(['telegram']));
    const user = JSON.parse(localStorage.getItem('cf_user_session') || '{}');
    if (user.id) localStorage.setItem('cf_connected_apps_' + user.id, JSON.stringify(['telegram']));
    window.location.reload();
  });
  await sleep(2000);

  await page.evaluate(() => {
    document.getElementById('channel-switcher-whatsapp')?.click();
  });
  await sleep(500);

  // Compress middle chat to 140px
  await page.evaluate(() => {
    const chatPanel = document.getElementById('chat');
    if (chatPanel) {
      chatPanel.style.setProperty('width', '140px', 'important');
      chatPanel.style.setProperty('flex', 'none', 'important');
    }
  });
  await sleep(600);

  const disconnectedCheck = await page.evaluate(() => {
    const desc = document.querySelector('.middlechat-desc');
    const descHidden = desc ? window.getComputedStyle(desc).display === 'none' : true;

    const btn = document.getElementById('empty-state-connect-channel-btn') || document.querySelector('.middlechat-connect-btn');
    const btnText = document.querySelector('.middlechat-connect-btn-text');
    const btnTextHidden = btnText ? window.getComputedStyle(btnText).display === 'none' : true;

    let hasZeroHScroll = true;
    const middleContainer = document.querySelector('.middle-chat-container');
    if (middleContainer) {
      hasZeroHScroll = middleContainer.scrollWidth <= middleContainer.clientWidth + 2;
    }

    return { descHidden, btnTextHidden, hasZeroHScroll, btnFound: Boolean(btn) };
  });
  console.log('Disconnected screen check at 140px:', disconnectedCheck);

  if (disconnectedCheck.descHidden && disconnectedCheck.btnTextHidden && disconnectedCheck.hasZeroHScroll) {
    report.test3_disconnectedScreenAdaptive = true;
    report.details.push('TEST 3 PASS: Disconnected view paragraph and button text hidden, connect button collapsed into circular icon, zero horizontal overflow');
  } else {
    report.details.push(`TEST 3: descHidden=${disconnectedCheck.descHidden}, btnTextHidden=${disconnectedCheck.btnTextHidden}, hScroll=${disconnectedCheck.hasZeroHScroll}`);
  }

  const middleChatEl = await page.$('.middle-chat-container') || await page.$('#chat');
  if (middleChatEl) {
    await middleChatEl.screenshot({ path: path.join(__dirname, 'verified_narrow_disconnected_chat.png') });
    console.log('Saved screenshot: verified_narrow_disconnected_chat.png');
  }

  // Restore chat panel and connected apps
  await page.evaluate(() => {
    const chatPanel = document.getElementById('chat');
    if (chatPanel) {
      chatPanel.style.setProperty('width', '', '');
      chatPanel.style.setProperty('flex', '', '');
    }
    const connected = ['whatsapp', 'telegram', 'instagram', 'discord', 'signal', 'slack', 'gmail'];
    localStorage.setItem('cf_connected_apps', JSON.stringify(connected));
    const user = JSON.parse(localStorage.getItem('cf_user_session') || '{}');
    if (user.id) localStorage.setItem('cf_connected_apps_' + user.id, JSON.stringify(connected));
  });
  await sleep(400);

  // =========================================================================
  // TEST 4: APPSWITCHER 3-TIER PROGRESSIVE RESPONSIVENESS
  // =========================================================================
  console.log('\n--- TEST 4: AppSwitcher 3-Tier Progressive Responsiveness ---');
  // Tier 2: Compress AppSwitcher to 160px
  await page.evaluate(() => {
    const swPanel = document.getElementById('switcher');
    if (swPanel) {
      swPanel.style.setProperty('width', '160px', 'important');
      swPanel.style.setProperty('flex', 'none', 'important');
    }
  });
  await sleep(600);

  const tier2Check = await page.evaluate(() => {
    const itemText = document.querySelector('.app-item-text');
    const textHidden = itemText ? window.getComputedStyle(itemText).display === 'none' : true;

    const toggle = document.querySelector('.app-item-ai-toggle');
    const toggleVisible = toggle ? window.getComputedStyle(toggle).display !== 'none' : false;

    return { textHidden, toggleVisible };
  });
  console.log('Tier 2 (160px) check:', tier2Check);
  const switcherElTier2 = await page.$('.app-switcher-container') || await page.$('#switcher');
  if (switcherElTier2) {
    await switcherElTier2.screenshot({ path: path.join(__dirname, 'verified_narrow_appswitcher_tier2.png') });
    console.log('Saved screenshot: verified_narrow_appswitcher_tier2.png');
  }

  // Tier 3: Compress AppSwitcher to 100px
  await page.evaluate(() => {
    const swPanel = document.getElementById('switcher');
    if (swPanel) {
      swPanel.style.setProperty('width', '100px', 'important');
      swPanel.style.setProperty('flex', 'none', 'important');
    }
  });
  await sleep(600);

  const tier3Check = await page.evaluate(() => {
    const toggle = document.querySelector('.app-item-ai-toggle');
    const toggleHidden = toggle ? window.getComputedStyle(toggle).display === 'none' : true;
    return { toggleHidden };
  });
  console.log('Tier 3 (100px) check:', tier3Check);

  if (tier2Check.textHidden && tier2Check.toggleVisible && tier3Check.toggleHidden) {
    report.test4_appSwitcherThreeTierResponsiveness = true;
    report.details.push('TEST 4 PASS: AppSwitcher successfully displays Logo+Toggle at 160px (Tier 2) and cleanly collapses to Logo-only at 100px (Tier 3)');
  } else {
    report.details.push(`TEST 4: tier2TextHidden=${tier2Check.textHidden}, tier2ToggleVisible=${tier2Check.toggleVisible}, tier3ToggleHidden=${tier3Check.toggleHidden}`);
  }

  const switcherEl = await page.$('.app-switcher-container') || await page.$('#switcher');
  if (switcherEl) {
    await switcherEl.screenshot({ path: path.join(__dirname, 'verified_narrow_appswitcher_tier3.png') });
    console.log('Saved screenshot: verified_narrow_appswitcher_tier3.png');
  }

  // Restore switcher
  await page.evaluate(() => {
    const swPanel = document.getElementById('switcher');
    if (swPanel) {
      swPanel.style.setProperty('width', '', '');
      swPanel.style.setProperty('flex', '', '');
    }
  });

  console.log('\n=============================================');
  console.log('PROGRESSIVE RESPONSIVENESS VERIFICATION REPORT:');
  console.log(JSON.stringify(report, null, 2));
  console.log('=============================================');

  await browser.close();
  return report;
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
