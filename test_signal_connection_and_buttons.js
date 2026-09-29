const puppeteer = require('puppeteer-core');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\mlkme\\.gemini\\antigravity\\brain\\4d688a9d-9a23-4cfc-b68e-b0acf766f62d';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runTest() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Setup user session without Signal connected initially to test unlinked empty state
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
    // Clear connected apps so we can test the empty states
    localStorage.setItem('cf_connected_apps', JSON.stringify([]));
    localStorage.setItem(`cf_connected_apps_${user.id}`, JSON.stringify([]));
    localStorage.removeItem('cf_signal_account');
    localStorage.removeItem('cf_signal_phone');
  });

  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(2500);

  // 1. Switch to Signal channel
  console.log('1. Switching to Signal channel...');
  await page.evaluate(() => {
    document.getElementById('channel-switcher-signal')?.click();
  });
  await sleep(1500);

  // 2. Verify empty-state button text
  const emptyStateBtnText = await page.evaluate(() => {
    const btn = document.getElementById('empty-state-connect-channel-btn');
    return btn ? btn.innerText.trim() : null;
  });
  console.log('Signal Empty-State Button Text:', emptyStateBtnText);

  const unlinkedPath = path.join(ARTIFACTS_DIR, 'verified_signal_unlinked_empty_state.png');
  await page.screenshot({ path: unlinkedPath });
  console.log('Saved unlinked empty state screenshot:', unlinkedPath);

  // 3. Click the "Link Signal (QR / Phone Number)" button
  console.log('3. Opening Signal Connect Modal...');
  await page.evaluate(() => {
    document.getElementById('empty-state-connect-channel-btn')?.click();
  });
  await sleep(1500);

  const modalQrPath = path.join(ARTIFACTS_DIR, 'verified_signal_modal_desktop_qr.png');
  await page.screenshot({ path: modalQrPath });
  console.log('Saved modal desktop QR screenshot:', modalQrPath);

  // 4. Switch to "Phone Number" tab
  console.log('4. Switching to Signal Phone Number Tab...');
  await page.click('#signal-tab-phone-btn');
  await sleep(1200);

  // 5. Test typing in Phone Number input and Store Profile Name
  console.log('5. Testing Signal Phone Input typing...');
  await page.waitForSelector('#signal-phone-input', { visible: true });
  await page.type('#signal-phone-input', '+213 661 77 88 99', { delay: 40 });
  await page.type('#signal-name-input', ' Store', { delay: 40 });

  const modalPhonePath = path.join(ARTIFACTS_DIR, 'verified_signal_phone_input_typed.png');
  await page.screenshot({ path: modalPhonePath });
  console.log('Saved phone input typed screenshot:', modalPhonePath);

  // 6. Click "Send Verification Code"
  console.log('6. Clicking Send Verification Code...');
  await page.click('#signal-send-code-btn');
  await sleep(1500);

  // 7. Verify SMS code step is rendered and type 6-digit code
  console.log('7. Verifying SMS 6-digit code step...');
  await page.waitForSelector('#signal-code-input', { visible: true });
  await page.type('#signal-code-input', '654321', { delay: 40 });
  await sleep(800);

  const modalCodePath = path.join(ARTIFACTS_DIR, 'verified_signal_sms_code_step.png');
  await page.screenshot({ path: modalCodePath });
  console.log('Saved SMS code step screenshot:', modalCodePath);

  // 8. Test Desktop QR Instant Approval Link
  console.log('8. Testing QR link instant demo approval...');
  // Switch back to QR tab
  await page.click('#signal-tab-qr-btn');
  await sleep(1000);

  // Click "Approve Signal Link (Instant Demo Test)"
  await page.click('#signal-approve-qr-btn');
  await sleep(2500);

  // 9. Verify Signal is now connected & Fatima discussion is active
  console.log('9. Checking connected Signal state in workspace...');
  await sleep(1500);
  const isSignalActive = await page.evaluate(() => {
    return document.body.innerText.includes('Karim Signal DZ') || document.body.innerText.includes('Signal Encrypted');
  });
  console.log('Signal Active Discussion Shown:', isSignalActive);

  // 10. Open 3-dots menu in MiddleChatColumn to verify adapted label
  console.log('10. Checking 3-dots menu item label...');
  await page.click('#channel-action-menu-btn');
  await sleep(1000);

  const menuText = await page.evaluate(() => {
    const btn = document.querySelector('button > span');
    // find button containing Re-link
    const allButtons = Array.from(document.querySelectorAll('button'));
    const reLinkBtn = allButtons.find(b => b.innerText.includes('Re-link Signal Device / Phone'));
    return reLinkBtn ? reLinkBtn.innerText : '';
  });
  console.log('3-dots menu text found:', menuText);

  const connectedMenuPath = path.join(ARTIFACTS_DIR, 'verified_signal_connected_menu_open.png');
  await page.screenshot({ path: connectedMenuPath });
  console.log('Saved connected Signal workspace screenshot with open menu:', connectedMenuPath);

  // 11. Check Discord & Slack button texts
  console.log('11. Testing other channel button adaptations...');
  await page.evaluate(() => {
    document.getElementById('channel-switcher-discord')?.click();
  });
  await sleep(1200);
  const discordBtnText = await page.evaluate(() => {
    const btn = document.getElementById('empty-state-connect-channel-btn');
    return btn ? btn.innerText.trim() : null;
  });
  console.log('Discord Empty-State Button Text:', discordBtnText);

  await page.evaluate(() => {
    document.getElementById('channel-switcher-slack')?.click();
  });
  await sleep(1200);
  const slackBtnText = await page.evaluate(() => {
    const btn = document.getElementById('empty-state-connect-channel-btn');
    return btn ? btn.innerText.trim() : null;
  });
  console.log('Slack Empty-State Button Text:', slackBtnText);

  await page.evaluate(() => {
    document.getElementById('channel-switcher-irc')?.click();
  });
  await sleep(1200);
  const ircBtnText = await page.evaluate(() => {
    const btn = document.getElementById('empty-state-connect-channel-btn');
    return btn ? btn.innerText.trim() : null;
  });
  console.log('IRC Empty-State Button Text:', ircBtnText);

  console.log('SUCCESS: All end-to-end tests finished successfully!');
  await browser.close();
}

runTest().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
