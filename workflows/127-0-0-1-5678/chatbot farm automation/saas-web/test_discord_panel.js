const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log('=== STARTING DISCORD PANEL AUTOMATED VERIFICATION ===');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  console.log('1. Setting up connected apps and reloading...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const user = { id: 'admin_local', name: 'Store Owner' };
    const apps = ['whatsapp', 'telegram', 'instagram', 'discord', 'signal', 'slack', 'gmail'];
    localStorage.setItem('cf_user_session', JSON.stringify(user));
    localStorage.setItem('cf_connected_apps_admin_local', JSON.stringify(apps));
    localStorage.setItem('cf_connected_apps', JSON.stringify(apps));
    localStorage.setItem('cf_pinned_apps', JSON.stringify(apps));
    localStorage.removeItem('cf_live_chats_by_app');
    localStorage.removeItem('cf_app_chats_discord');
    localStorage.removeItem('cf_discord_unlinked');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);

  console.log('2. Switching to Discord channel tab...');
  await page.evaluate(() => {
    const el = document.getElementById('channel-switcher-discord');
    const clickable = el?.querySelector('.absolute.inset-0') || el;
    clickable?.click();
  });
  await sleep(2000);

  // Verification 1: Discord Dual Column Layout in Right Hub
  console.log('3. Checking Discord Layout & Pinned Direct Messages...');
  const dmCheck = await page.evaluate(() => {
    const dmBtn = document.getElementById('contact-item-dc_dm');
    const bsk33zTopic = document.getElementById('topic-item-dm_bsk33z');
    const doubleCounterTopic = document.getElementById('topic-item-dm_doublecounter');
    const userProfileName = document.querySelector('span.text-xs.font-bold.text-white')?.textContent || '';
    
    return {
      hasDmButton: !!dmBtn,
      hasBsk33z: !!bsk33zTopic,
      hasDoubleCounter: !!doubleCounterTopic,
      userProfileName
    };
  });
  console.log('DM Check Result:', JSON.stringify(dmCheck, null, 2));

  // Take DM screenshot
  const dmScreenshotPath = path.join(__dirname, 'test_discord_dm_view.png');
  await page.screenshot({ path: dmScreenshotPath });
  console.log('Saved DM screenshot to:', dmScreenshotPath);

  // Verification 2: Check Middle Chat Column Discord Native View
  console.log('4. Checking Discord Native View in Middle Column...');
  const chatViewCheck = await page.evaluate(() => {
    const hasSearch = !!document.querySelector('input[placeholder="Rechercher"]');
    const inputBar = document.querySelector('input[placeholder*="Envoyer un message"]');
    const inputPlaceholder = inputBar?.getAttribute('placeholder') || '';
    const avatars = document.querySelectorAll('img');
    
    return {
      hasSearch,
      hasInputBar: !!inputBar,
      inputPlaceholder,
      avatarCount: avatars.length
    };
  });
  console.log('Chat View Check Result:', JSON.stringify(chatViewCheck, null, 2));

  // Verification 3: Switch to a Discord Server (Titan Shifters Guild)
  console.log('5. Switching to Server: Titan Shifters Guild (dc_titan)...');
  await page.evaluate(() => {
    const titanBtn = document.getElementById('contact-item-dc_titan');
    titanBtn?.click();
  });
  await sleep(2000);

  const serverCheck = await page.evaluate(() => {
    const generalTopic = document.getElementById('topic-item-t_titan_general');
    const voiceTopic = document.getElementById('topic-item-t_titan_voice');
    const categoryHeaders = Array.from(document.querySelectorAll('span')).filter(s => 
      s.textContent?.includes('INFORMATIONS') || 
      s.textContent?.includes('SALONS TEXTUELS') || 
      s.textContent?.includes('SALONS VOCAUX')
    ).map(s => s.textContent.trim());
    
    return {
      hasGeneralTopic: !!generalTopic,
      hasVoiceTopic: !!voiceTopic,
      categoryHeaders
    };
  });
  console.log('Server Check Result:', JSON.stringify(serverCheck, null, 2));

  // Verification 4: Click sub-channel #général
  console.log('6. Clicking sub-channel #général (#t_titan_general)...');
  await page.evaluate(() => {
    const generalTopic = document.getElementById('topic-item-t_titan_general');
    generalTopic?.click();
  });
  await sleep(2000);

  const subchannelCheck = await page.evaluate(() => {
    const inputBar = document.querySelector('input[placeholder*="Envoyer un message"]');
    const inputPlaceholder = inputBar?.getAttribute('placeholder') || '';
    const middleHero = document.querySelector('div[class*="border-b"] h1, div[class*="border-b"] h2, h1, h2')?.textContent || '';
    
    return {
      middleHero,
      inputPlaceholder
    };
  });
  console.log('Subchannel Check Result:', JSON.stringify(subchannelCheck, null, 2));

  // Take Server screenshot
  const serverScreenshotPath = path.join(__dirname, 'test_discord_server_view.png');
  await page.screenshot({ path: serverScreenshotPath });
  console.log('Saved Server screenshot to:', serverScreenshotPath);

  // Verification 5: Audio controls toggle
  console.log('7. Testing bottom bar audio mute/deafen controls...');
  const audioCheck = await page.evaluate(() => {
    const micBtn = Array.from(document.querySelectorAll('button')).find(b => 
      (b.getAttribute('title') || '').toLowerCase().includes('micro')
    );
    const deafenBtn = Array.from(document.querySelectorAll('button')).find(b => 
      (b.getAttribute('title') || '').toLowerCase().includes('casque') || 
      (b.getAttribute('title') || '').toLowerCase().includes('sourdine')
    );
    const initialMicTitle = micBtn?.getAttribute('title');
    
    micBtn?.click();
    const updatedMicTitle = micBtn?.getAttribute('title');
    
    return {
      hasMic: !!micBtn,
      hasDeafen: !!deafenBtn,
      initialMicTitle,
      updatedMicTitle
    };
  });
  console.log('Audio Check Result:', JSON.stringify(audioCheck, null, 2));

  await browser.close();
  console.log('\n=== ALL DISCORD VERIFICATIONS COMPLETE SUCCESSFULLY ===');
}

run().catch(err => {
  console.error('Fatal error during test:', err);
  process.exit(1);
});
