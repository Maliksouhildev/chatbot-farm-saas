const { chromium } = require('playwright');

async function check() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    const sw = document.querySelector('.app-switcher-container');
    const panel = sw.closest('#switcher') || sw.parentElement;
    
    // Test multiple widths
    const widthsToTest = [260, 251, 250, 240, 210, 201, 200, 195, 190, 180, 150];
    const report = [];

    for (const w of widthsToTest) {
      panel.style.setProperty('width', `${w}px`, 'important');
      panel.style.setProperty('flex', 'none', 'important');
      
      const csBtn = getComputedStyle(sw.querySelector('.bottom-action-btn'));
      const csAiTxt = getComputedStyle(sw.querySelector('.switcher-ai-toggle-text'));
      const csAddTxt = getComputedStyle(sw.querySelector('.add-channel-text'));
      const csFullTxt = getComputedStyle(sw.querySelector('.switcher-full-text'));
      const csLogo = getComputedStyle(sw.querySelector('.switcher-logo-icon'));

      report.push({
        panelWidth: w,
        swOffsetWidth: sw.offsetWidth,
        swClientWidth: sw.clientWidth,
        aiToggleTextDisplay: csAiTxt.display,
        addChannelTextDisplay: csAddTxt.display,
        btnWidth: csBtn.width,
        btnPadding: csBtn.padding,
        fullTextDisplay: csFullTxt.display,
        logoIconDisplay: csLogo.display
      });
    }

    return report;
  });

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}

check().catch(console.error);
