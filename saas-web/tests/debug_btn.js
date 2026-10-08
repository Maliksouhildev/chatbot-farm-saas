const { chromium } = require('playwright');

async function debugBtn() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    const sw = document.querySelector('.app-switcher-container');
    const panel = sw.closest('#switcher') || sw.parentElement;
    panel.style.setProperty('width', '200px', 'important');
    panel.style.setProperty('flex', 'none', 'important');

    const btn = sw.querySelector('.bottom-action-btn');
    
    // Inspect computed style of btn
    const cs = window.getComputedStyle(btn);
    
    // Check all matching rules from all stylesheets
    const matchedRules = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText && btn.matches(rule.selectorText)) {
            matchedRules.push({
              text: rule.cssText,
              selector: rule.selectorText,
              width: rule.style.width,
              priority: rule.style.getPropertyPriority('width')
            });
          }
          if (rule.cssRules) {
            for (const sub of rule.cssRules) {
              if (sub.selectorText && btn.matches(sub.selectorText)) {
                matchedRules.push({
                  parentRule: rule.conditionText || rule.cssText.slice(0, 40),
                  text: sub.cssText,
                  selector: sub.selectorText,
                  width: sub.style.width,
                  priority: sub.style.getPropertyPriority('width')
                });
              }
            }
          }
        }
      } catch (e) {}
    }

    return {
      btnWidth: btn.getBoundingClientRect().width,
      btnHeight: btn.getBoundingClientRect().height,
      computedWidth: cs.width,
      computedHeight: cs.height,
      computedPadding: cs.padding,
      computedAspectRatio: cs.aspectRatio,
      matchedRules
    };
  });

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}

debugBtn().catch(console.error);
