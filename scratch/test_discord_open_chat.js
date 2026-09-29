const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\mlkme\\.gemini\\antigravity\\brain\\4d688a9d-9a23-4cfc-b68e-b0acf766f62d';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function run() {
  console.log('Testing starting a customer discussion in connected Discord...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

  await page.evaluate(() => {
    const user = {
      id: 'usr_test_merchant',
      email: 'merchant@store.dz',
      name: 'Store Owner'
    };
    localStorage.setItem('cf_user_session', JSON.stringify(user));
    const userAppsKey = `cf_connected_apps_${user.id}`;
    localStorage.setItem(userAppsKey, JSON.stringify(['discord']));
    localStorage.setItem('cf_discord_token', 'Bot DISCORD_TOKEN_VERIFIED');
    localStorage.setItem('cf_discord_account', JSON.stringify({
      id: '123456789012345678',
      username: 'AlgeriaTechStoreBot',
      displayName: 'Algeria Tech Store',
      avatar: null,
      verified: true
    }));
  });

  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Select Discord
  await page.click('#channel-switcher-discord');
  await new Promise(r => setTimeout(r, 1200));

  // Type in Start Discussion with Customer
  console.log('Typing customer handle and first message...');
  await page.type('input[placeholder*="customer_username"]', 'karim_customer_dz');
  await page.type('input[placeholder*="first message"]', 'Salam Karim, we received your order confirmation!');

  // Click Send Message & Open Chat
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await (await b.getProperty('innerText')).jsonValue();
    if (text && text.includes('Send Message & Open Chat')) {
      await b.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 2000));

  // Take screenshot of opened Discord conversation in Middle Column and contact appearing in Right Column
  const openedChatScreenshot = path.join(ARTIFACTS_DIR, 'verified_discord_customer_discussion_opened.png');
  await page.screenshot({ path: openedChatScreenshot });
  console.log('Saved Opened Discussion Screenshot to:', openedChatScreenshot);

  // Type a follow-up reply in Discord native input bar
  console.log('Typing follow-up reply in Discord chat input...');
  const discordInputs = await page.$$('input[placeholder*="Message"]');
  if (discordInputs.length > 0) {
    await discordInputs[0].type('Tracking number will be sent via SMS shortly.');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1500));
  }

  // Take screenshot of follow-up message in feed
  const replyScreenshot = path.join(ARTIFACTS_DIR, 'verified_discord_reply_sent.png');
  await page.screenshot({ path: replyScreenshot });
  console.log('Saved Reply Sent Screenshot to:', replyScreenshot);

  await browser.close();
  console.log('Discussion test completed successfully!');
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
