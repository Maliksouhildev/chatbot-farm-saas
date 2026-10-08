const { chromium } = require('playwright');

async function whyWidth() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    const sw = document.querySelector('.app-switcher-container');
    const panel = sw.closest('#switcher') || sw.parentElement;
    panel.style.setProperty('width', '180px', 'important');
    panel.style.setProperty('flex', 'none', 'important');

    const btn = sw.querySelector('.bottom-action-btn');
    
    // Check if the rule is matched using Chrome's matched CSS rules
    // Let's create an inline style test on the button
    const testCases = [
      { name: 'as-is', width: getComputedStyle(btn).width, rectWidth: btn.getBoundingClientRect().width },
    ];

    // Try setting style.width
    btn.style.width = '36px';
    testCases.push({ name: 'style.width=36px', width: getComputedStyle(btn).width, rectWidth: btn.getBoundingClientRect().width });

    btn.style.width = '36px !important'; // Invalid in CSSOM, need setProperty
    btn.style.setProperty('width', '36px', 'important');
    testCases.push({ name: 'setProperty width 36px !important', width: getComputedStyle(btn).width, rectWidth: btn.getBoundingClientRect().width });

    // Try removing w-full
    btn.classList.remove('w-full');
    testCases.push({ name: 'after remove w-full', width: getComputedStyle(btn).width, rectWidth: btn.getBoundingClientRect().width });

    // Try changing display to inline-flex
    btn.style.display = 'inline-flex';
    testCases.push({ name: 'display: inline-flex', width: getComputedStyle(btn).width, rectWidth: btn.getBoundingClientRect().width });

    // Try changing display to block
    btn.style.display = 'block';
    testCases.push({ name: 'display: block', width: getComputedStyle(btn).width, rectWidth: btn.getBoundingClientRect().width });

    return testCases;
  });

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}

whyWidth().catch(console.error);
