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

    const btn = sw.querySelector('.bottom-action-btn');

    // Case 1: As is
    const asIs = getComputedStyle(btn).width;

    // Case 2: Add style with explicit container name: @container appswitcher (max-width: 200px)
    const s1 = document.createElement('style');
    s1.innerHTML = '@container appswitcher (max-width: 200px) { .bottom-action-btn { width: 36px !important; } }';
    document.head.appendChild(s1);
    const withNamedCQ = getComputedStyle(btn).width;

    // Case 3: Remove container-name from sw
    sw.style.containerName = 'none';
    const withUnnamedContainer = getComputedStyle(btn).width;

    return {
      asIs,
      withNamedCQ,
      withUnnamedContainer
    };
  });

  console.log('Result:', test);
  await browser.close();
}

run().catch(console.error);
