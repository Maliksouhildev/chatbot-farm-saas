const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Let's inspect the EXACT HTML of .switcher-bottom-container and the stylesheet
  const diff = await page.evaluate(() => {
    const sw = document.querySelector('.app-switcher-container');
    const panel = sw.closest('#switcher') || sw.parentElement;
    panel.style.setProperty('width', '200px', 'important');
    panel.style.setProperty('flex', 'none', 'important');

    const sbc = sw.querySelector('.switcher-bottom-container');
    const btn = sw.querySelector('.bottom-action-btn');

    // What if we test in a fresh div inside the app?
    const testDiv = document.createElement('div');
    testDiv.style.cssText = 'container-type: inline-size; width: 200px;';
    testDiv.innerHTML = `
      <style>
        @container (max-width: 200px) {
          .my-btn { width: 36px !important; }
        }
      </style>
      <button class="my-btn w-full">test</button>
    `;
    document.body.appendChild(testDiv);
    const testBtn = testDiv.querySelector('.my-btn');

    return {
      testBtnWidth: getComputedStyle(testBtn).width,
      realBtnWidth: getComputedStyle(btn).width,
      realBtnRect: btn.getBoundingClientRect().width,
      realBtnClass: btn.className,
      realBtnStyle: btn.getAttribute('style'),
      realBtnComputedStyles: {
        width: getComputedStyle(btn).width,
        maxWidth: getComputedStyle(btn).maxWidth,
        minWidth: getComputedStyle(btn).minWidth,
        flex: getComputedStyle(btn).flex,
        display: getComputedStyle(btn).display
      }
    };
  });

  console.log('Comparison:', diff);
  await browser.close();
}

run().catch(console.error);
