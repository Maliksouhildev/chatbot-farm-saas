const puppeteer = require('puppeteer-core');
const path = require('path');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\mlkme\\.gemini\\antigravity\\brain\\4d688a9d-9a23-4cfc-b68e-b0acf766f62d';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  await page.evaluate(() => {
    const user = {
      id: 'usr_clean_merchant_01',
      name: 'Malik Souhil',
      email: 'merchant@store.dz',
      provider: 'google',
      plan: 'Enterprise Pro',
      verified: true,
      avatar: 'M',
    };
    localStorage.setItem('cf_user_session', JSON.stringify(user));
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Switch to X Twitter
  await page.evaluate(() => {
    const el = document.querySelector('#channel-switcher-x_twitter');
    if (el) el.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Click Connect
  await page.evaluate(() => {
    const btn = document.querySelector('#channel-connect-trigger-btn');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verified_x_beeper_cookie_modal.png') });
  console.log('Screenshot saved: verified_x_beeper_cookie_modal.png');
  await browser.close();
})();
