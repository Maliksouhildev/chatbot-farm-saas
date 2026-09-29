const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\mlkme\\.gemini\\antigravity\\brain\\4d688a9d-9a23-4cfc-b68e-b0acf766f62d';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

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

  // Provision merchant session and all 17 connected apps in localStorage
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
      'telegram',
      'signal',
      'instagram',
      'messenger',
      'x_twitter',
      'google_messages',
      'google_chat',
      'google_voice',
      'discord',
      'slack',
      'linkedin',
      'irc',
      'matrix',
      'web_widget',
      'gmail'
    ];
    localStorage.setItem(`cf_connected_apps_${user.id}`, JSON.stringify(connected));
    localStorage.setItem('cf_connected_apps', JSON.stringify(connected));
  });

  // Reload to apply authenticated session
  console.log('Reloading with active multi-channel session...');
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(2500);

  // Helper to switch channels via the AppSwitcherColumn
  async function selectChannel(channelId) {
    const clicked = await page.evaluate((id) => {
      const el = document.getElementById(`channel-switcher-${id}`);
      if (el) {
        el.click();
        return true;
      }
      return false;
    }, channelId);
    console.log(`Switch to channel '${channelId}': clicked = ${clicked}`);
    await sleep(2000);
    return clicked;
  }

  const results = {};

  // 1. Verify Discord
  console.log('\n--- 1. Testing Discord Channel ---');
  await selectChannel('discord');

  const discordScreenPath = path.join(ARTIFACTS_DIR, 'verified_discord_replicated_ui.png');
  await page.screenshot({ path: discordScreenPath, fullPage: false });

  const discordData = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const hasRoleTag = bodyText.includes('BOT') || bodyText.includes('MEMBER') || bodyText.includes('142 members');
    const hasCommandes = bodyText.includes('#commandes-dz');
    const hasKarim = bodyText.includes('Karim_Alger') || bodyText.includes('Yacine_Gaming');
    const hasDiscordTheme = bodyText.includes('Discord') || bodyText.includes('#commandes-dz');
    return { hasCommandes, hasRoleTag, hasKarim, hasDiscordTheme, sample: bodyText.slice(0, 300) };
  });
  console.log('Discord Verification Result:', discordData);
  results.discord = discordData;

  // Type a message in Discord and send
  console.log('Typing message in Discord...');
  const discordInput = await page.$('input[placeholder*="Message"]');
  if (discordInput) {
    await discordInput.type('Saha khoya, livraison confirmée!');
    await page.keyboard.press('Enter');
    await sleep(1000);
  }
  const discordSentPath = path.join(ARTIFACTS_DIR, 'verified_discord_message_sent.png');
  await page.screenshot({ path: discordSentPath, fullPage: false });

  // Switch to Karim_Alger contact in Discord to verify contact-specific discussion replication
  console.log('Switching to Karim_Alger in Discord...');
  const clickedKarim = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button[id^="contact-item-"]'));
    const kBtn = buttons.find(b => b.innerText.includes('Karim_Alger'));
    if (kBtn) {
      kBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Karim_Alger in Discord:', clickedKarim);
  await sleep(1500);
  const discordKarimPath = path.join(ARTIFACTS_DIR, 'verified_discord_karim_discussion.png');
  await page.screenshot({ path: discordKarimPath, fullPage: false });

  // 2. Verify Signal
  console.log('\n--- 2. Testing Signal Channel ---');
  await selectChannel('signal');

  const signalScreenPath = path.join(ARTIFACTS_DIR, 'verified_signal_replicated_ui.png');
  await page.screenshot({ path: signalScreenPath, fullPage: false });

  const signalData = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const hasEncryptedNotice = bodyText.includes('End-to-End Encrypted') || bodyText.includes('end-to-end encrypted') || bodyText.includes('Signal');
    const hasKarim = bodyText.includes('Karim Signal DZ') || bodyText.includes('+213 661 44 55 66');
    const hasYasmine = bodyText.includes('Fatima Zohra') || bodyText.includes('Yasmine');
    return { hasEncryptedNotice, hasKarim, hasYasmine };
  });
  console.log('Signal Verification Result:', signalData);
  results.signal = signalData;

  // Switch to Fatima Zohra in Signal
  console.log('Switching to Fatima Zohra in Signal...');
  const clickedFatima = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button[id^="contact-item-"]'));
    const fBtn = buttons.find(b => b.innerText.includes('Fatima Zohra'));
    if (fBtn) {
      fBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Fatima Zohra in Signal:', clickedFatima);
  await sleep(1500);
  const signalFatimaPath = path.join(ARTIFACTS_DIR, 'verified_signal_fatima_discussion.png');
  await page.screenshot({ path: signalFatimaPath, fullPage: false });

  // 3. Verify Slack
  console.log('\n--- 3. Testing Slack Channel ---');
  await selectChannel('slack');

  const slackScreenPath = path.join(ARTIFACTS_DIR, 'verified_slack_replicated_ui.png');
  await page.screenshot({ path: slackScreenPath, fullPage: false });

  const slackData = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const hasB2B = bodyText.includes('#b2b-grossistes') || bodyText.includes('B2B Grossistes');
    const hasSupport = bodyText.includes('#support-dz') || bodyText.includes('Slack');
    const hasFormatBar = bodyText.includes('Send to') || bodyText.includes('Jot something down') || bodyText.includes('Message #');
    return { hasB2B, hasSupport, hasFormatBar };
  });
  console.log('Slack Verification Result:', slackData);
  results.slack = slackData;

  // 4. Verify X (Twitter)
  console.log('\n--- 4. Testing X (Twitter) Channel ---');
  await selectChannel('x_twitter');

  const xScreenPath = path.join(ARTIFACTS_DIR, 'verified_xtwitter_replicated_ui.png');
  await page.screenshot({ path: xScreenPath, fullPage: false });

  const xData = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const hasSamir = bodyText.includes('Samir Tech DZ') || bodyText.includes('@samir_tech_dz');
    const hasDirectMsg = bodyText.includes('Direct Message') || bodyText.includes('Start a new message') || bodyText.includes('@');
    return { hasSamir, hasDirectMsg };
  });
  console.log('X / Twitter Verification Result:', xData);
  results.x_twitter = xData;

  // 5. Verify Matrix
  console.log('\n--- 5. Testing Matrix Channel ---');
  await selectChannel('matrix');

  const mtxScreenPath = path.join(ARTIFACTS_DIR, 'verified_matrix_replicated_ui.png');
  await page.screenshot({ path: mtxScreenPath, fullPage: false });

  const mtxData = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const hasHichem = bodyText.includes('Hichem Matrix') || bodyText.includes('@hichem:matrix.org');
    const hasSynapse = bodyText.includes('Matrix Synapse') || bodyText.includes('e2e:megolm') || bodyText.includes('matrix.org');
    return { hasHichem, hasSynapse };
  });
  console.log('Matrix Verification Result:', mtxData);
  results.matrix = mtxData;

  // 6. Verify LinkedIn
  console.log('\n--- 6. Testing LinkedIn Channel ---');
  await selectChannel('linkedin');

  const linkedinScreenPath = path.join(ARTIFACTS_DIR, 'verified_linkedin_replicated_ui.png');
  await page.screenshot({ path: linkedinScreenPath, fullPage: false });

  const linkedinData = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const hasAmine = bodyText.includes('Amine Benali') || bodyText.includes('Procurement Director');
    const hasLinkedIn = bodyText.includes('LinkedIn') || bodyText.includes('InMail');
    return { hasAmine, hasLinkedIn };
  });
  console.log('LinkedIn Verification Result:', linkedinData);
  results.linkedin = linkedinData;

  // 7. Verify IRC
  console.log('\n--- 7. Testing IRC Network ---');
  await selectChannel('irc');

  const ircScreenPath = path.join(ARTIFACTS_DIR, 'verified_irc_replicated_ui.png');
  await page.screenshot({ path: ircScreenPath, fullPage: false });

  const ircData = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const hasIrcChan = bodyText.includes('#algeria-tech') || bodyText.includes('#marketplace');
    const hasIrcPrompt = bodyText.includes('IRC') || bodyText.includes('MODE') || bodyText.includes('JOIN');
    return { hasIrcChan, hasIrcPrompt };
  });
  console.log('IRC Verification Result:', ircData);
  results.irc = ircData;

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
