const puppeteer = require('puppeteer-core');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\mlkme\\.gemini\\antigravity\\brain\\4d688a9d-9a23-4cfc-b68e-b0acf766f62d';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runMultiChannelCheck() {
  console.log('Testing omnichannel dashboard...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Connect WhatsApp, Telegram, Signal, Discord, Instagram, Slack, Gmail
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
    const connected = ['whatsapp', 'telegram', 'signal', 'discord', 'instagram', 'slack', 'gmail'];
    localStorage.setItem('cf_connected_apps', JSON.stringify(connected));
    localStorage.setItem(`cf_connected_apps_${user.id}`, JSON.stringify(connected));
  });

  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(2500);

  const dashPath = path.join(ARTIFACTS_DIR, 'verified_omnichannel_multi_live.png');
  await page.screenshot({ path: dashPath });
  console.log('Saved multi-channel live screenshot:', dashPath);

  // Switch to Discord to verify Discord native view
  await page.evaluate(() => {
    document.getElementById('channel-switcher-discord')?.click();
  });
  await sleep(1500);

  const discordPath = path.join(ARTIFACTS_DIR, 'verified_discord_native_live.png');
  await page.screenshot({ path: discordPath });
  console.log('Saved Discord screenshot:', discordPath);

  // Switch to Instagram
  await page.evaluate(() => {
    document.getElementById('channel-switcher-instagram')?.click();
  });
  await sleep(1500);

  const igPath = path.join(ARTIFACTS_DIR, 'verified_instagram_native_live.png');
  await page.screenshot({ path: igPath });
  console.log('Saved Instagram screenshot:', igPath);

  await browser.close();
}

runMultiChannelCheck().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
