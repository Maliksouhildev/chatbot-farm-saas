const puppeteer = require('puppeteer-core');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\mlkme\\.gemini\\antigravity\\brain\\4d688a9d-9a23-4cfc-b68e-b0acf766f62d';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runTest() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

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
    const connected = ['signal', 'discord', 'slack'];
    localStorage.setItem('cf_connected_apps', JSON.stringify(connected));
    localStorage.setItem(`cf_connected_apps_${user.id}`, JSON.stringify(connected));
  });

  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(2500);

  // 1. Switch to Signal
  console.log('Switching to Signal...');
  await page.evaluate(() => {
    document.getElementById('channel-switcher-signal')?.click();
  });
  await sleep(2000);

  // 2. Click Voice button
  console.log('Clicking Voice recording button...');
  await page.evaluate(() => {
    const micBtn = document.querySelector('button[title="Voice"]');
    if (micBtn) micBtn.click();
  });
  await sleep(1500);

  const recordingPath = path.join(ARTIFACTS_DIR, 'verified_signal_voice_recording.png');
  await page.screenshot({ path: recordingPath, fullPage: false });

  // 3. Click Send voice note
  console.log('Submitting voice note...');
  await page.evaluate(() => {
    const sendBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Send');
    if (sendBtn) sendBtn.click();
  });
  await sleep(2000);

  const sentVoicePath = path.join(ARTIFACTS_DIR, 'verified_signal_voice_sent.png');
  await page.screenshot({ path: sentVoicePath, fullPage: false });

  const hasVoiceMsg = await page.evaluate(() => {
    return document.body.innerText.includes('Voice message') || document.body.innerText.includes('🎤');
  });
  console.log('Signal voice note recorded and sent:', hasVoiceMsg);

  await browser.close();
}

runTest().catch(err => {
  console.error('Error running test:', err);
  process.exit(1);
});
