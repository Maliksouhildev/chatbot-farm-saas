const puppeteer = require('puppeteer-core');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  const clickResult = await page.evaluate(() => {
    const avatar = document.querySelector('.contact-item-avatar-wrapper');
    if (!avatar) return { found: false };
    console.log('Clicking avatar element:', avatar.outerHTML);
    avatar.click();
    return { found: true };
  });
  console.log('Click result:', clickResult);
  await new Promise(r => setTimeout(r, 1000));

  const dialogInfo = await page.evaluate(() => {
    const dialogs = document.querySelectorAll('[role="dialog"]');
    return {
      dialogCount: dialogs.length,
      html: dialogs[0]?.outerHTML?.slice(0, 300) || null,
      bodyText: document.body.innerText.slice(0, 500)
    };
  });
  console.log('Dialog info:', dialogInfo);
  await browser.close();
})();
