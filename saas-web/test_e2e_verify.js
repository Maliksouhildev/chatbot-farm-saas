const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log('=== STARTING 5 CORE REQUIREMENTS COMPLETE VERIFICATION ===');
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

  console.log('1. Loading dashboard and initializing session...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Provision session & connected apps
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
    req1_scrollToBottom: false,
    req2_channelProfilePicsAndEmojis: false,
    req3_readOnlyBroadcastAndClosedTopic: false,
    req4_imageDisplayAndLightbox: false,
    req5_uiResponsivenessNoOverlap: false,
    details: []
  };

  // Switch to Telegram
  console.log('\n--- Switching to Telegram channel ---');
  await page.evaluate(() => {
    const el = document.getElementById('channel-switcher-telegram');
    const clickable = el?.querySelector('.absolute.inset-0') || el;
    clickable?.click();
  });
  await sleep(1500);

  // Click tg_1 ("Automatique L3") to see topic list & chat
  // Verify Automatique L3 has no fake topics
  console.log('\n--- Checking Automatique L3 (Pure Group - No Fake Topics) ---');
  await page.evaluate(() => {
    const tg1 = document.querySelector('button[id="contact-item-tg_1"]');
    if (tg1) tg1.click();
  });
  await sleep(800);
  const autoL3Topics = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button[id^="topic-item-"]')).length;
  });
  console.log('Automatique L3 topics count (must be 0):', autoL3Topics);

  // Now select Forum Demo to verify topic features
  console.log('\n--- Selecting Community Forum Demo (Group with Topics) ---');
  const clickedForum = await page.evaluate(() => {
    const forum = document.querySelector('button[id="contact-item-tg_forum_demo"]');
    if (forum) {
      forum.click();
      return true;
    }
    return false;
  });
  console.log('Clicked tg_forum_demo:', clickedForum);
  await sleep(1200);

  // REQ 2: Channel Profile Pics, Icons & Emojis
  console.log('\n--- Checking REQ 2: Profile Pics, Topic Emojis & Badges ---');
  const req2Data = await page.evaluate(() => {
    const headerTitle = document.querySelector('h3')?.innerText || '';
    const headerEmoji = document.querySelector('h3')?.parentElement?.innerText || '';
    const headerImg = Boolean(document.querySelector('.h-14 img'));
    const topicButtons = Array.from(document.querySelectorAll('button[id^="topic-item-"]')).map(b => b.innerText.replace(/\s+/g, ' ').trim());
    const contacts = Array.from(document.querySelectorAll('button[id^="contact-item-"]')).map(c => ({
      text: c.innerText.replace(/\s+/g, ' ').trim(),
      hasBadge: Boolean(c.querySelector('[title="Broadcast Channel"]')) || c.innerText.includes('📢'),
      hasImg: Boolean(c.querySelector('img'))
    }));
    return { headerTitle, headerEmoji, headerImg, topicButtons, contacts };
  });
  console.log('REQ 2 Check:', req2Data);

  const hasTopicEmojis = req2Data.topicButtons.some(t => t.includes('💬') || t.includes('📚') || t.includes('🔬') || t.includes('📝'));
  const hasBroadcastBadge = req2Data.contacts.some(c => c.hasBadge || c.text.includes('📢'));
  const hasProfilePics = req2Data.contacts.some(c => c.hasImg) && req2Data.headerImg;

  if (hasTopicEmojis && hasBroadcastBadge && hasProfilePics && autoL3Topics === 0) {
    report.req2_channelProfilePicsAndEmojis = true;
    report.details.push('REQ 2 PASS: Channel profile pics, topic emojis (💬, 📚, 🔬, 📝), and broadcast badges (📢) render properly; Automatique L3 has no fake topics');
  } else {
    report.details.push(`REQ 2 FAIL: hasTopicEmojis=${hasTopicEmojis}, hasBroadcastBadge=${hasBroadcastBadge}, hasProfilePics=${hasProfilePics}, autoL3Topics=${autoL3Topics}`);
  }

  // REQ 1: Scroll to Bottom on open
  console.log('\n--- Checking REQ 1: Direct Scroll to Bottom ---');
  const scrollInitial = await page.evaluate(() => {
    const el = document.querySelector('.custom-scrollbar');
    if (!el) return { found: false, diff: -1 };
    const diff = el.scrollHeight - el.scrollTop - el.clientHeight;
    return { found: true, scrollTop: el.scrollTop, clientHeight: el.clientHeight, scrollHeight: el.scrollHeight, diff };
  });
  console.log('Scroll check on topic 1:', scrollInitial);

  // Switch to topic 2 and verify scroll to bottom
  await page.evaluate(() => {
    const t2 = document.querySelector('button[id="topic-item-t_2"]');
    if (t2) t2.click();
  });
  await sleep(700);

  const scrollTopic2 = await page.evaluate(() => {
    const el = document.querySelector('.custom-scrollbar');
    if (!el) return { found: false, diff: -1 };
    const diff = el.scrollHeight - el.scrollTop - el.clientHeight;
    return { found: true, scrollTop: el.scrollTop, clientHeight: el.clientHeight, scrollHeight: el.scrollHeight, diff };
  });
  console.log('Scroll check on topic 2:', scrollTopic2);

  if (scrollInitial.found && scrollInitial.diff < 50 && scrollTopic2.diff < 50) {
    report.req1_scrollToBottom = true;
    report.details.push('REQ 1 PASS: Chat scroll container immediately and unconditionally scrolls to bottom on open and switch');
  } else {
    report.details.push(`REQ 1: scroll diffs: t1=${scrollInitial.diff}, t2=${scrollTopic2.diff}`);
  }

  // REQ 4: Sent / received image display & lightbox
  console.log('\n--- Checking REQ 4: Image display and Lightbox ---');
  // Switch back to topic 1 which contains Bob's photo message
  await page.evaluate(() => {
    const t1 = document.querySelector('button[id="topic-item-t_1"]');
    if (t1) t1.click();
  });
  await sleep(700);

  const imageCheck = await page.evaluate(() => {
    const img = document.querySelector('.custom-scrollbar img[alt="attachment"]');
    if (!img) return { found: false };
    const rect = img.getBoundingClientRect();
    return {
      found: true,
      src: img.src.substring(0, 60),
      width: rect.width,
      height: rect.height,
      displayed: rect.width > 50 && rect.height > 50
    };
  });
  console.log('Image element in chat bubble:', imageCheck);

  // Click image to trigger lightbox
  let lightboxOpened = false;
  if (imageCheck.found) {
    await page.evaluate(() => {
      const img = document.querySelector('.custom-scrollbar img[alt="attachment"]');
      if (img) (img.parentElement || img).click();
    });
    await sleep(700);

    lightboxOpened = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0.z-50');
      const lightboxImg = modal ? modal.querySelector('img') : null;
      return Boolean(lightboxImg);
    });
    console.log('Lightbox opened successfully:', lightboxOpened);

    // Close lightbox via Escape key
    await page.keyboard.press('Escape');
    await sleep(400);
  }

  if (imageCheck.displayed && lightboxOpened) {
    report.req4_imageDisplayAndLightbox = true;
    report.details.push('REQ 4 PASS: Images render inside chat bubble with thumbnail zoom and full lightbox modal');
  } else {
    report.details.push(`REQ 4 FAIL: imgDisplayed=${imageCheck.displayed}, lightboxOpened=${lightboxOpened}`);
  }

  // REQ 3: Read-Only Broadcast Channel & Closed Topic
  console.log('\n--- Checking REQ 3: Read-Only Broadcast & Closed Topic ---');
  // 1. Check Closed Topic (t_4 "Exams (Closed)")
  await page.evaluate(() => {
    const t4 = document.querySelector('button[id="topic-item-t_4"]');
    if (t4) t4.click();
  });
  await sleep(800);

  const closedTopicCheck = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const hasTopicClosedBanner = bodyText.includes('This topic is closed. Only administrators can send messages') || bodyText.includes('topic is closed');
    const inputBar = document.querySelector('input[placeholder*="Write a message to"]');
    return { hasTopicClosedBanner, hasInputBar: Boolean(inputBar) };
  });
  console.log('Closed Topic Check (t_4):', closedTopicCheck);

  // 2. Check Broadcast Channel (tg_broadcast_1 "Farm Announcements")
  await page.evaluate(() => {
    const bcast = document.querySelector('button[id="contact-item-tg_broadcast_1"]');
    if (bcast) bcast.click();
  });
  await sleep(800);

  const broadcastCheck = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const hasBroadcastBanner = bodyText.includes('Only administrators can send messages in this channel') || bodyText.includes('channel is read-only');
    const inputBar = document.querySelector('input[placeholder*="Write a message to"]');
    return { hasBroadcastBanner, hasInputBar: Boolean(inputBar) };
  });
  console.log('Broadcast Channel Check (tg_broadcast_1):', broadcastCheck);

  if (closedTopicCheck.hasTopicClosedBanner && !closedTopicCheck.hasInputBar && broadcastCheck.hasBroadcastBanner && !broadcastCheck.hasInputBar) {
    report.req3_readOnlyBroadcastAndClosedTopic = true;
    report.details.push('REQ 3 PASS: Read-only banner replaces input bar on both broadcast channels and closed topics');
  } else {
    report.details.push(`REQ 3 FAIL: closedBanner=${closedTopicCheck.hasTopicClosedBanner}, closedNoInput=${!closedTopicCheck.hasInputBar}, bcastBanner=${broadcastCheck.hasBroadcastBanner}, bcastNoInput=${!broadcastCheck.hasInputBar}`);
  }

  // REQ 5: UI Responsiveness Revamp
  console.log('\n--- Checking REQ 5: UI Responsiveness at Narrow Viewport ---');
  await page.setViewport({ width: 900, height: 768 });
  await sleep(600);

  const respData = await page.evaluate(() => {
    // 1. Check Detach button does not overlap nav tab pills
    const tabs = document.querySelectorAll('button[id^="hub-tab-"]');
    const detachBtn = document.querySelector('[title="Detach to floating window"]');
    let detachOverlap = false;
    if (detachBtn && tabs.length > 0) {
      const dRect = detachBtn.getBoundingClientRect();
      const tabRects = Array.from(tabs).map(t => t.getBoundingClientRect());
      detachOverlap = tabRects.some(r => !(
        dRect.right < r.left || 
        dRect.left > r.right || 
        dRect.bottom < r.top || 
        dRect.top > r.bottom
      ));
    }

    // 2. Check Avatar circles are perfect circles and not deformed
    const avatars = document.querySelectorAll('[id^="contact-item-"] .contact-item-avatar-wrapper > div');
    let avatarDeformed = false;
    avatars.forEach(a => {
      const rect = a.getBoundingClientRect();
      if (rect.width > 0 && Math.abs(rect.width - rect.height) > 4) {
        avatarDeformed = true;
      }
    });

    return { detachOverlap, avatarDeformed, tabCount: tabs.length };
  });
  console.log('Responsiveness Data:', respData);

  if (!respData.detachOverlap && !respData.avatarDeformed) {
    report.req5_uiResponsivenessNoOverlap = true;
    report.details.push('REQ 5 PASS: Detach button does not overlap tab pills and avatar circles maintain aspect-ratio');
  } else {
    report.details.push(`REQ 5 FAIL: detachOverlap=${respData.detachOverlap}, avatarDeformed=${respData.avatarDeformed}`);
  }

  // Take final screenshots of the verified states
  const screenshotBroadcast = path.join(__dirname, 'verified_req3_broadcast_readonly.png');
  await page.screenshot({ path: screenshotBroadcast });
  console.log('Saved broadcast screenshot to:', screenshotBroadcast);

  // Switch back to topic 4 to capture closed topic banner
  await page.evaluate(() => {
    const forum = document.querySelector('button[id="contact-item-tg_forum_demo"]');
    if (forum) forum.click();
  });
  await sleep(600);
  await page.evaluate(() => {
    const t4 = document.querySelector('button[id="topic-item-t_4"]');
    if (t4) t4.click();
  });
  await sleep(600);

  const screenshotClosedTopic = path.join(__dirname, 'verified_req3_closed_topic.png');
  await page.screenshot({ path: screenshotClosedTopic });
  console.log('Saved closed topic screenshot to:', screenshotClosedTopic);

  // Switch to topic 1 to capture image message & full view
  await page.evaluate(() => {
    const t1 = document.querySelector('button[id="topic-item-t_1"]');
    if (t1) t1.click();
  });
  await sleep(600);

  const screenshotTopic1 = path.join(__dirname, 'verified_req2_and_4_topic1_feed.png');
  await page.screenshot({ path: screenshotTopic1 });
  console.log('Saved topic 1 screenshot to:', screenshotTopic1);

  console.log('\n=============================================');
  console.log('FINAL 5 CORE REQUIREMENTS TEST RESULTS:');
  console.log(JSON.stringify(report, null, 2));
  console.log('=============================================');

  await browser.close();
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
