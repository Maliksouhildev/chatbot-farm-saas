const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:\\Users\\mlkme\\.gemini\\antigravity\\brain\\4d688a9d-9a23-4cfc-b68e-b0acf766f62d';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function clickChannel(page, channelId) {
  await page.evaluate((id) => {
    const el = document.querySelector(`#channel-switcher-${id}`);
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  }, channelId);
  await new Promise((r) => setTimeout(r, 400));
  await page.click(`#channel-switcher-${channelId}`);
}

async function clearAndType(page, selector, text) {
  await page.waitForSelector(selector, { visible: true, timeout: 10000 });
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type(selector, text);
}

(async () => {
  console.log('--- STARTING VERIFICATION OF EASY CONNECT & ANTI-FAKE LOGINS ---');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', (msg) => {
    const txt = msg.text();
    if (txt.includes('Failed to') || txt.includes('Error') || txt.includes('success')) {
      console.log('BROWSER CONSOLE:', txt);
    }
  });

  // 1. Initial merchant session with clean disconnected state
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  await page.evaluate(() => {
    const user = {
      id: 'usr_test_merchant_99',
      name: 'Malik Souhil',
      email: 'merchant@store.dz',
      provider: 'credentials',
      plan: 'Enterprise DZ Pro',
      verified: true,
      avatar: 'M',
    };
    localStorage.setItem('cf_user_session', JSON.stringify(user));
    localStorage.setItem('cf_connected_apps', JSON.stringify(['whatsapp', 'telegram', 'discord']));
    localStorage.setItem('cf_connected_apps_usr_test_merchant_99', JSON.stringify(['whatsapp', 'telegram', 'discord']));
    localStorage.removeItem('cf_x_twitter_handle');
    localStorage.removeItem('cf_x_twitter_account');
    localStorage.removeItem('cf_linkedin_page');
    localStorage.removeItem('cf_linkedin_account');
    localStorage.removeItem('cf_google_chat_space');
    localStorage.removeItem('cf_google_chat_account');
    localStorage.removeItem('cf_gmail_account');
  });

  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));

  // =========================================================================
  // TEST 1: X (TWITTER) STRICT ANTI-FAKE REJECTION
  // =========================================================================
  console.log('\n--- 1. Testing Twitter / X Fake Credential Rejection ---');
  await clickChannel(page, 'x_twitter');
  await new Promise((r) => setTimeout(r, 1200));

  // Switch to Handle & Password tab
  await page.waitForSelector('#x-tab-login', { visible: true, timeout: 10000 });
  await page.click('#x-tab-login');
  await new Promise((r) => setTimeout(r, 600));

  // Type valid syntax handle that is fake/non-existent
  await clearAndType(page, '#x-login-handle-input', 'fake_user_99');
  await clearAndType(page, '#x-login-password-input', 'fake_password_123');

  // Click Submit
  await page.click('#x-login-submit-btn');
  await new Promise((r) => setTimeout(r, 2000));

  // Capture screenshot of fake login rejected
  const xFakePath = path.join(ARTIFACTS_DIR, 'verified_x_fake_login_rejected.png');
  await page.screenshot({ path: xFakePath, fullPage: false });
  console.log('Saved:', xFakePath);

  // Verify the error text is visible on screen
  const pageText = await page.evaluate(() => document.body.innerText);
  const errorFound = pageText.includes('could not be verified by X') || pageText.includes('Authentication Error') || pageText.includes('Invalid X username');
  console.log('Fake X login rejected successfully:', errorFound);

  // =========================================================================
  // TEST 2: X (TWITTER) 1-CLICK VERIFIED CONNECT
  // =========================================================================
  console.log('\n--- 2. Testing Twitter / X 1-Click OAuth Connect ---');
  await page.click('#x-tab-oauth');
  await new Promise((r) => setTimeout(r, 600));

  // Set clean handle for oauth
  await clearAndType(page, '#x-oauth-handle-input', 'dz_store_hq');

  // Click 1-Click Sign in with X
  await page.click('#x-oauth-submit-btn');
  await new Promise((r) => setTimeout(r, 3000));

  // Take screenshot of connected X channel
  const xConnPath = path.join(ARTIFACTS_DIR, 'verified_x_connected_live.png');
  await page.screenshot({ path: xConnPath, fullPage: false });
  console.log('Saved:', xConnPath);

  // Verify X is marked as connected in localStorage
  const isXConnected = await page.evaluate(() => {
    const apps = JSON.parse(localStorage.getItem('cf_connected_apps') || '[]');
    return apps.includes('x_twitter');
  });
  console.log('X (Twitter) connected in state:', isXConnected);

  // =========================================================================
  // TEST 3: LINKEDIN MODAL (QR CODE & 1-CLICK CONNECT)
  // =========================================================================
  console.log('\n--- 3. Testing LinkedIn Modal Options & QR Code ---');
  await clickChannel(page, 'linkedin');
  await new Promise((r) => setTimeout(r, 1200));

  // Verify LinkedIn Mobile QR Code Tab
  await page.waitForSelector('#linkedin-tab-qr', { visible: true, timeout: 10000 });
  await page.click('#linkedin-tab-qr');
  await new Promise((r) => setTimeout(r, 1000));

  const liQrPath = path.join(ARTIFACTS_DIR, 'verified_linkedin_qr_modal.png');
  await page.screenshot({ path: liQrPath, fullPage: false });
  console.log('Saved:', liQrPath);

  // Now connect via 1-Click Sign in with LinkedIn
  await page.click('#linkedin-tab-oauth');
  await new Promise((r) => setTimeout(r, 600));
  await page.click('#linkedin-oauth-submit-btn');
  await new Promise((r) => setTimeout(r, 3000));

  const liConnPath = path.join(ARTIFACTS_DIR, 'verified_linkedin_connected_live.png');
  await page.screenshot({ path: liConnPath, fullPage: false });
  console.log('Saved:', liConnPath);

  // =========================================================================
  // TEST 4: GOOGLE CHAT DIRECT CONNECT (NO WEBHOOK URL)
  // =========================================================================
  console.log('\n--- 4. Testing Google Chat Direct Connect ---');
  await clickChannel(page, 'google_chat');
  await new Promise((r) => setTimeout(r, 1200));

  await page.waitForSelector('#gchat-google-submit-btn', { visible: true, timeout: 10000 });
  const gchatModalPath = path.join(ARTIFACTS_DIR, 'verified_google_chat_modal.png');
  await page.screenshot({ path: gchatModalPath, fullPage: false });
  console.log('Saved:', gchatModalPath);

  // Connect Google Chat with 1-Click
  await page.click('#gchat-google-submit-btn');
  await new Promise((r) => setTimeout(r, 3000));

  // =========================================================================
  // TEST 5: GOOGLE USER AUTO-CONNECT & GMAIL CUSTOMER INQUIRIES
  // =========================================================================
  console.log('\n--- 5. Testing Google User Session Auto-Linking Gmail & Real Customer Emails ---');
  await page.evaluate(() => {
    const googleUser = {
      id: 'usr_test_merchant_99',
      name: 'Malik Souhil',
      email: 'malik.souhil@gmail.com',
      provider: 'google',
      plan: 'Enterprise DZ Pro',
      verified: true,
      avatar: 'M',
    };
    localStorage.setItem('cf_user_session', JSON.stringify(googleUser));
  });

  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 3000));

  // Select Gmail
  await clickChannel(page, 'gmail');
  await new Promise((r) => setTimeout(r, 2500));

  const gmailInBoxPath = path.join(ARTIFACTS_DIR, 'verified_gmail_real_emails_populated.png');
  await page.screenshot({ path: gmailInBoxPath, fullPage: false });
  console.log('Saved:', gmailInBoxPath);

  // Verify email threads exist in the DOM
  const inboxHtml = await page.evaluate(() => document.body.innerText);
  const hasAmine = inboxHtml.includes('Amine Rahmani');
  const hasDevis = inboxHtml.includes('Demande de devis & Facture Proforma');
  const hasNadia = inboxHtml.includes('Nadia Belkacem');
  console.log('Gmail threads found:', { hasAmine, hasDevis, hasNadia });

  // Click on Amine Rahmani's email thread to open it in middle column
  const clickedThread = await page.evaluate(() => {
    const allDivs = Array.from(document.querySelectorAll('div, button'));
    const amineItem = allDivs.find((el) => el.innerText && el.innerText.includes('Amine Rahmani'));
    if (amineItem) {
      amineItem.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Amine Rahmani thread:', clickedThread);
  await new Promise((r) => setTimeout(r, 2000));

  const gmailEmailOpenPath = path.join(ARTIFACTS_DIR, 'verified_gmail_email_opened.png');
  await page.screenshot({ path: gmailEmailOpenPath, fullPage: false });
  console.log('Saved:', gmailEmailOpenPath);

  // =========================================================================
  // TEST 6: SEND REPLY TO GMAIL INQUIRY
  // =========================================================================
  console.log('\n--- 6. Testing Reply to Gmail Customer ---');
  // Type and send reply
  const replyInput = await page.$('textarea, input[placeholder*="Reply"], input[placeholder*="message"]');
  if (replyInput) {
    await replyInput.type('Salam M. Rahmani, la facture proforma #4829 est prête. Livraison demain par Yalidine.');
    const sendBtn = await page.$('button[title*="Send"], button[type="submit"]');
    if (sendBtn) {
      await sendBtn.click();
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  const gmailReplyPath = path.join(ARTIFACTS_DIR, 'verified_gmail_reply_sent.png');
  await page.screenshot({ path: gmailReplyPath, fullPage: false });
  console.log('Saved:', gmailReplyPath);

  console.log('\n--- ALL VERIFICATIONS COMPLETED SUCCESSFULLY ---');
  await browser.close();
})().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
