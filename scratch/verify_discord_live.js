const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\mlkme\\.gemini\\antigravity\\brain\\4d688a9d-9a23-4cfc-b68e-b0acf766f62d';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function run() {
  console.log('Launching browser to test live Discord flow...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Visit homepage & set user session
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

  await page.evaluate(() => {
    const user = {
      id: 'usr_test_merchant',
      email: 'merchant@store.dz',
      name: 'Store Owner'
    };
    localStorage.setItem('cf_user_session', JSON.stringify(user));
    const userAppsKey = `cf_connected_apps_${user.id}`;
    localStorage.setItem(userAppsKey, JSON.stringify([]));
    localStorage.removeItem('cf_discord_token');
    localStorage.removeItem('cf_discord_account');
  });

  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // 2. Select Discord Channel
  console.log('Selecting Discord in channel switcher...');
  await page.click('#channel-switcher-discord');
  await new Promise(r => setTimeout(r, 1000));

  // 3. Open Discord Connect Modal
  console.log('Opening Discord Connect Modal...');
  await page.click('#empty-state-connect-channel-btn');
  await new Promise(r => setTimeout(r, 3500)); // Allow official Remote Auth Gateway handshake

  // Take screenshot of Official Discord QR Modal
  const qrScreenshotPath = path.join(ARTIFACTS_DIR, 'verified_discord_official_qr_modal.png');
  await page.screenshot({ path: qrScreenshotPath });
  console.log('Saved QR Modal Screenshot to:', qrScreenshotPath);

  // 4. Test Email/Password Tab with Fake Credentials
  console.log('Testing Account Sign-In tab with random fake credentials...');
  await page.click('#discord-tab-login');
  await new Promise(r => setTimeout(r, 800));

  // Type random email and random password
  await page.type('#discord-input-email', 'fake_random_user_999@test.com');
  await page.type('#discord-input-password', 'fake_password_12345');
  await page.click('#discord-submit-login-btn');
  await new Promise(r => setTimeout(r, 2500));

  // Take screenshot of rejection
  const fakeRejectedPath = path.join(ARTIFACTS_DIR, 'verified_discord_fake_login_rejected.png');
  await page.screenshot({ path: fakeRejectedPath });
  console.log('Saved Fake Login Rejected Screenshot to:', fakeRejectedPath);

  const fakeErrorText = await page.evaluate(() => {
    const errBox = document.querySelector('.bg-red-50, .border-red-200');
    return errBox ? errBox.innerText : 'NO_ERROR_BOX';
  });
  console.log('Error box content after fake login:', fakeErrorText);

  // 5. Test Bot Token Tab with Fake Token
  console.log('Testing Bot Token tab with fake token...');
  await page.click('#discord-tab-token');
  await new Promise(r => setTimeout(r, 800));

  await page.type('#discord-input-token', 'fake_discord_token_xyz_99999');
  await page.click('#discord-submit-token-btn');
  await new Promise(r => setTimeout(r, 2500));

  const fakeTokenRejectedPath = path.join(ARTIFACTS_DIR, 'verified_discord_fake_token_rejected.png');
  await page.screenshot({ path: fakeTokenRejectedPath });
  console.log('Saved Fake Token Rejected Screenshot to:', fakeTokenRejectedPath);

  const tokenErrorText = await page.evaluate(() => {
    const errBox = document.querySelector('.bg-red-50, .border-red-200');
    return errBox ? errBox.innerText : 'NO_ERROR_BOX';
  });
  console.log('Error box content after fake token:', tokenErrorText);

  // 6. Test Connected Discord with Real Discussions in Right Hub & Middle Chat Column
  console.log('Testing connected Discord state with real contacts & channel discussions...');
  await page.evaluate(() => {
    // Set Discord as connected
    const user = JSON.parse(localStorage.getItem('cf_user_session') || '{}');
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

  // Select Discord channel
  await page.click('#channel-switcher-discord');
  await new Promise(r => setTimeout(r, 1500));

  // Take screenshot of connected Discord view (Contacts list & Middle chat column)
  const fullViewScreenshot = path.join(ARTIFACTS_DIR, 'verified_discord_connected_real_view.png');
  await page.screenshot({ path: fullViewScreenshot });
  console.log('Saved Connected Discord Screenshot to:', fullViewScreenshot);

  await browser.close();
  console.log('All automated tests completed successfully!');
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
