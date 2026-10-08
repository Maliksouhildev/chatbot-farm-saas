const { chromium } = require('playwright');

async function testNamedContainer() {
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
    s.innerHTML = `
      @container appswitcher (max-width: 200px) {
        .test-marker-named { color: rgb(123, 45, 67) !important; }
      }
    `;
    document.head.appendChild(s);
    btn.classList.add('test-marker-named');

    return {
      swWidth: sw.getBoundingClientRect().width,
      containerName: getComputedStyle(sw).containerName,
      containerType: getComputedStyle(sw).containerType,
      parentContainerName: getComputedStyle(panel).containerName,
      parentContainerType: getComputedStyle(panel).containerType,
      testMarkerNamedColor: getComputedStyle(btn).color,
      isNamedWorking: getComputedStyle(btn).color === 'rgb(123, 45, 67)'
    };
  });
  console.log('Result:', testRes);
  await browser.close();
}

testNamedContainer().catch(console.error);
