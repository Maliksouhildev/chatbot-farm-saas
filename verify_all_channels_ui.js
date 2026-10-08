const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\mlkme\\.gemini\\antigravity\\brain\\4d688a9d-9a23-4cfc-b68e-b0acf766f62d';

async function runVerification() {
  console.log('--- Launching Edge Browser ---');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  // Listen to console
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Provision merchant session and connected apps in localStorage
  console.log('Configuring merchant session with multi-channel connections in localStorage...');
  await page.evaluate(() => {
    const user = {
      id: "ca7e08cc-5db0-4c29-a213-057f7ef9e0b4",
      name: "Malik Mehdid",
      email: "contact@elbahdja.dz",
      plan: "Enterprise DZ Pro",
      verified: true,
      avatar: "M"
    };
    localStorage.setItem('cf_user_session', JSON.stringify(user));

    const connected = [
      'whatsapp',
      'whatsapp_2',
      'discord',
      'signal',
      'slack',
      'x_twitter',
      'matrix',
      'telegram',
      'instagram',
      'messenger',
      'gmail',
      'web_widget'
    ];
    localStorage.setItem(`cf_connected_apps_${user.id}`, JSON.stringify(connected));
  });

  // Reload to apply authenticated session
  console.log('Reloading with active multi-channel session...');
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForTimeout(2000);

  const results = {};

  // 1. Verify Discord
  console.log('\n--- 1. Testing Discord Channel ---');
  await page.evaluate(() => {
    // Click Discord channel in left/top bar
    const discordBtn = document.querySelector('button[title*="Discord"]') ||
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Discord') || b.id?.includes('discord'));
    if (discordBtn) discordBtn.click();
  });
  await page.waitForTimeout(2500);

  const discordScreenPath = path.join(ARTIFACTS_DIR, 'verified_discord_replicated_ui.png');
  await page.screenshot({ path: discordScreenPath, fullPage: false });

  const discordData = await page.evaluate(() => {
    const contacts = Array.from(document.querySelectorAll('#tab-btn-contacts, div, button'))
      .filter(el => el.textContent.includes('#commandes-dz') || el.textContent.includes('Karim_Alger'))
      .map(el => el.textContent.trim());
    const headerText = document.querySelector('h3, h4, h5')?.textContent || '';
    const hasRoleTag = document.body.innerText.includes('BOT') || document.body.innerText.includes('MEMBER');
    const hasCommandes = document.body.innerText.includes('#commandes-dz');
    const hasDiscordTheme = document.body.innerText.includes('Discord Guild') || document.body.innerText.includes('Welcome to');
    return { hasCommandes, hasRoleTag, hasDiscordTheme, textSample: document.body.innerText.slice(0, 300) };
  });
  console.log('Discord Verification Result:', discordData);
  results.discord = discordData;

  // Type a message in Discord and send
  console.log('Typing message in Discord...');
  const discordInput = await page.$('input[placeholder*="Message"]');
  if (discordInput) {
    await discordInput.type('Saha khoya, livraison confirmée!');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
  }
  const discordSentPath = path.join(ARTIFACTS_DIR, 'verified_discord_message_sent.png');
  await page.screenshot({ path: discordSentPath, fullPage: false });

  // 2. Verify Signal
  console.log('\n--- 2. Testing Signal Channel ---');
  await page.evaluate(() => {
    const signalBtn = Array.from(document.querySelectorAll('button')).find(b => 
      b.title?.toLowerCase().includes('signal') || b.id?.includes('signal') || b.textContent.includes('Signal')
    );
    if (signalBtn) signalBtn.click();
  });
  await page.waitForTimeout(2500);

  const signalScreenPath = path.join(ARTIFACTS_DIR, 'verified_signal_replicated_ui.png');
  await page.screenshot({ path: signalScreenPath, fullPage: false });

  const signalData = await page.evaluate(() => {
    const hasEncryptedNotice = document.body.innerText.includes('End-to-End Encrypted') || document.body.innerText.includes('end-to-end encrypted');
    const hasKarim = document.body.innerText.includes('Karim Signal DZ') || document.body.innerText.includes('+213 661 44 55 66');
    return { hasEncryptedNotice, hasKarim };
  });
  console.log('Signal Verification Result:', signalData);
  results.signal = signalData;

  // 3. Verify Slack
  console.log('\n--- 3. Testing Slack Channel ---');
  await page.evaluate(() => {
    const slackBtn = Array.from(document.querySelectorAll('button')).find(b => 
      b.title?.toLowerCase().includes('slack') || b.id?.includes('slack') || b.textContent.includes('Slack')
    );
    if (slackBtn) slackBtn.click();
  });
  await page.waitForTimeout(2500);

  const slackScreenPath = path.join(ARTIFACTS_DIR, 'verified_slack_replicated_ui.png');
  await page.screenshot({ path: slackScreenPath, fullPage: false });

  const slackData = await page.evaluate(() => {
    const hasB2B = document.body.innerText.includes('#b2b-grossistes');
    const hasSlackLive = document.body.innerText.includes('Slack Live') || document.body.innerText.includes('Slack Workspace');
    return { hasB2B, hasSlackLive };
  });
  console.log('Slack Verification Result:', slackData);
  results.slack = slackData;

  // 4. Verify X (Twitter)
  console.log('\n--- 4. Testing X (Twitter) Channel ---');
  await page.evaluate(() => {
    const xBtn = Array.from(document.querySelectorAll('button')).find(b => 
      b.title?.toLowerCase().includes('twitter') || b.title?.toLowerCase() === 'x' || b.id?.includes('x_twitter') || b.textContent.includes('Twitter') || b.textContent.includes('X')
    );
    if (xBtn) xBtn.click();
  });
  await page.waitForTimeout(2500);

  const xScreenPath = path.join(ARTIFACTS_DIR, 'verified_xtwitter_replicated_ui.png');
  await page.screenshot({ path: xScreenPath, fullPage: false });

  const xData = await page.evaluate(() => {
    const hasSamir = document.body.innerText.includes('Samir Tech DZ') || document.body.innerText.includes('@samir_tech_dz');
    const hasDirectMsg = document.body.innerText.includes('Direct Message') || document.body.innerText.includes('Start a new message');
    return { hasSamir, hasDirectMsg };
  });
  console.log('X / Twitter Verification Result:', xData);
  results.x_twitter = xData;

  // 5. Verify Matrix
  console.log('\n--- 5. Testing Matrix Channel ---');
  await page.evaluate(() => {
    const mtxBtn = Array.from(document.querySelectorAll('button')).find(b => 
      b.title?.toLowerCase().includes('matrix') || b.id?.includes('matrix') || b.textContent.includes('Matrix')
    );
    if (mtxBtn) mtxBtn.click();
  });
  await page.waitForTimeout(2500);

  const mtxScreenPath = path.join(ARTIFACTS_DIR, 'verified_matrix_replicated_ui.png');
  await page.screenshot({ path: mtxScreenPath, fullPage: false });

  const mtxData = await page.evaluate(() => {
    const hasHichem = document.body.innerText.includes('Hichem Matrix') || document.body.innerText.includes('@hichem:matrix.org');
    const hasSynapse = document.body.innerText.includes('Matrix Synapse') || document.body.innerText.includes('e2e:megolm');
    return { hasHichem, hasSynapse };
  });
  console.log('Matrix Verification Result:', mtxData);
  results.matrix = mtxData;

  await browser.close();
  console.log('\n=========================================');
  console.log('ALL CHANNELS UI VERIFICATION COMPLETED:');
  console.log(JSON.stringify(results, null, 2));
  console.log('=========================================');
}

runVerification().catch(err => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
