const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  const test = await page.evaluate(() => {
    const sw = document.querySelector('.app-switcher-container');
    const panel = sw.closest('#switcher') || sw.parentElement;
    panel.style.setProperty('width', '200px', 'important');
    panel.style.setProperty('flex', 'none', 'important');

    // Create test button directly inside sw
    const btnTest = document.createElement('button');
    btnTest.className = 'bottom-action-btn';
    sw.appendChild(btnTest);

    return {
      swWidth: sw.getBoundingClientRect().width,
      swClientWidth: sw.clientWidth,
      btnTestWidth: getComputedStyle(btnTest).width,
      realBtnWidth: getComputedStyle(sw.querySelector('.bottom-action-btn')).width
    };
  });

  console.log('Result:', test);
  await browser.close();
}

run().catch(console.error);
