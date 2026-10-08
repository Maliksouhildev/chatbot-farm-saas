const { chromium } = require('playwright');

async function check() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);

  const domInfo = await page.evaluate(() => {
    const header = document.querySelector('header');
    const appSwitcher = document.querySelector('.app-switcher-container');
    const appSwitcherParent = appSwitcher ? appSwitcher.parentElement : null;
    const panel = appSwitcher ? appSwitcher.closest('[data-panel]') : null;

    return {
      header: header ? {
        className: header.className,
        style: header.getAttribute('style'),
        rect: header.getBoundingClientRect()
      } : null,
      appSwitcher: appSwitcher ? {
        className: appSwitcher.className,
        style: appSwitcher.getAttribute('style'),
        rect: appSwitcher.getBoundingClientRect()
      } : null,
      panel: panel ? {
        id: panel.getAttribute('id'),
        dataPanelId: panel.getAttribute('data-panel-id'),
        style: panel.getAttribute('style'),
        rect: panel.getBoundingClientRect()
      } : null
    };
  });

  console.log('DOM Info:', JSON.stringify(domInfo, null, 2));
  await browser.close();
}

check().catch(console.error);
