const { chromium } = require('playwright');

async function testMarker() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  const testRes = await page.evaluate(() => {
    const sw = document.querySelector('.app-switcher-container');
    const panel = sw.closest('#switcher') || sw.parentElement;
    panel.style.setProperty('width', '150px', 'important');
    panel.style.setProperty('flex', 'none', 'important');

    const btn = sw.querySelector('.bottom-action-btn');
    
    const s = document.createElement('style');
    s.innerHTML = '@container (max-width: 200px) { .test-marker { color: rgb(123, 45, 67) !important; } }';
    sw.appendChild(s);
    btn.classList.add('test-marker');

    return {
      testMarkerColor: getComputedStyle(btn).color,
      isContainerQueryWorking: getComputedStyle(btn).color === 'rgb(123, 45, 67)'
    };
  });
  console.log('Result:', testRes);
  await browser.close();
}

testMarker().catch(console.error);
