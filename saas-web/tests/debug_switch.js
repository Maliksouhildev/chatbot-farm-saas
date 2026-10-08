const puppeteer = require('puppeteer-core');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE_PATH, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    localStorage.setItem('cf_pinned_apps', JSON.stringify(['whatsapp', 'telegram', 'discord', 'instagram', 'snapchat', 'viber']));
    localStorage.setItem('cf_connected_apps', JSON.stringify(['whatsapp', 'telegram', 'discord', 'instagram', 'snapchat', 'viber']));
    localStorage.setItem('cf_user_session', JSON.stringify({ name: 'Malik Souhil', id: 'usr_123' }));
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  for (const app of ['whatsapp', 'telegram', 'discord', 'instagram', 'snapchat', 'viber']) {
    console.log(`\n=== Testing app ${app} ===`);
    // Click switcher
    await page.evaluate((id) => {
      const switcher = document.getElementById(`channel-switcher-${id}`);
      const btn = switcher?.querySelector('.absolute.inset-0') || switcher;
      btn?.click();
    }, app);
    await new Promise(r => setTimeout(r, 800));

    // Check contact list
    const contacts = await page.evaluate(() => {
      const names = Array.from(document.querySelectorAll('h5')).map(h => h.innerText);
      const avatars = document.querySelectorAll('.contact-item-avatar-wrapper').length;
      return { names, avatars };
    });
    console.log(`Contacts for ${app}:`, contacts);

    // Click contact row to select chat
    await page.evaluate(() => {
      const row = document.querySelector('.contact-item-inner');
      row?.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // Click avatar wrapper to open profile
    await page.evaluate(() => {
      const avatar = document.querySelector('.contact-item-avatar-wrapper');
      avatar?.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Check dialog
    const dialog = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      return {
        hasDialog: Boolean(d),
        textPreview: d?.innerText?.slice(0, 150)
      };
    });
    console.log(`Dialog for ${app}:`, dialog);

    // Close dialog
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 400));
  }

  await browser.close();
})();
