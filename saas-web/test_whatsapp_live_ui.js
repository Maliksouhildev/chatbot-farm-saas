const puppeteer = require('puppeteer-core');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function testWhatsAppUI() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  console.log('1. Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Wait 3 seconds for initial live chats to fetch from Evolution API
  await sleep(3500);

  // Check connected apps badge or channel list
  const activeChannelText = await page.evaluate(() => {
    const header = document.querySelector('.middle-chat-container') || document.body;
    return header.innerText.slice(0, 200);
  });
  console.log('Active channel text snippet:', activeChannelText);

  // Check contacts in RightHubColumn
  const contacts = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('button, div')).filter(el => {
      const txt = el.innerText || '';
      return txt.includes('WhatsApp') || txt.includes('+213') || txt.includes('Malik');
    });
    return {
      count: items.length,
      sampleText: items.slice(0, 5).map(i => i.innerText.replace(/\n+/g, ' | ').slice(0, 60))
    };
  });
  console.log('Contacts detected in UI:', contacts);

  // Check if any fake "Ahmed Y." exists anywhere in DOM
  const hasAhmedY = await page.evaluate(() => {
    return document.body.innerText.includes('Ahmed Y.');
  });
  console.log('Synthetic Ahmed Y. found in DOM:', hasAhmedY);

  // Take screenshot for artifact
  const screenshotPath = 'C:/Users/mehdi/.gemini/antigravity/brain/3870dbae-725c-4fdd-a376-2863449887d9/verified_live_whatsapp_sync.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('Saved screenshot to', screenshotPath);

  await browser.close();
  console.log('=== TEST COMPLETED SUCCESSFULLY ===');
}

testWhatsAppUI().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
