const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  const info = await page.evaluate(() => {
    const sw = document.querySelector('.app-switcher-container');
    const panel = sw.closest('#switcher') || sw.parentElement;
    panel.style.setProperty('width', '180px', 'important');
    panel.style.setProperty('flex', 'none', 'important');

    const btn = sw.querySelector('.bottom-action-btn');
    const span = sw.querySelector('.add-channel-text');

    // Check computed styles
    const btnCS = getComputedStyle(btn);
    const spanCS = getComputedStyle(span);

    // Let's check what styles are applied to btn directly or via stylesheet
    const appliedProperties = {};
    for (let i = 0; i < btnCS.length; i++) {
      const prop = btnCS[i];
      if (['width', 'height', 'max-width', 'min-width', 'aspect-ratio', 'padding', 'margin', 'border-radius'].includes(prop)) {
        appliedProperties[prop] = btnCS.getPropertyValue(prop);
      }
    }

    return {
      spanDisplay: spanCS.display,
      btnWidth: btn.getBoundingClientRect().width,
      btnHeight: btn.getBoundingClientRect().height,
      btnStyles: appliedProperties
    };
  });

  console.log('Investigation info at 180px:', info);
  await browser.close();
}

test().catch(console.error);
