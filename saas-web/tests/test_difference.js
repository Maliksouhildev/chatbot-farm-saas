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

    const sbc = sw.querySelector('.switcher-bottom-container');
    const realBtn = sw.querySelector('.bottom-action-btn');

    // Test A: simple button inside sbc
    const btnA = document.createElement('button');
    btnA.className = 'bottom-action-btn';
    sbc.appendChild(btnA);

    // Test B: button with same classes directly inside sw
    const btnB = document.createElement('button');
    btnB.className = realBtn.className;
    sw.appendChild(btnB);

    return {
      btnA_inside_sbc: getComputedStyle(btnA).width,
      btnB_classes_in_sw: getComputedStyle(btnB).width,
      realBtnWidth: getComputedStyle(realBtn).width
    };
  });

  console.log('Result:', test);
  await browser.close();
}

run().catch(console.error);
