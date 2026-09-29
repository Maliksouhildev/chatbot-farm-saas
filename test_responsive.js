const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, 'test_screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function runTests() {
  console.log('Launching browser with Chrome channel...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    try {
      browser = await chromium.launch({ channel: 'msedge', headless: true });
    } catch (e2) {
      console.log('Falling back to default chromium...');
      browser = await chromium.launch({ headless: true });
    }
  }

  const results = {
    errors: [],
    overflows: [],
    visualIssues: [],
    screenshots: []
  };

  const viewports = [
    { name: 'desktop_1920x1080', width: 1920, height: 1080, isMobile: false },
    { name: 'laptop_1280x800', width: 1280, height: 800, isMobile: false },
    { name: 'tablet_768x1024', width: 768, height: 1024, isMobile: false },
    { name: 'mobile_390x844', width: 390, height: 844, isMobile: true },
    { name: 'mobile_360x740', width: 360, height: 740, isMobile: true }
  ];

  for (const vp of viewports) {
    console.log(`\n========================================`);
    console.log(`Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);
    
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
    });
    const page = await context.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`[Console Error][${vp.name}]:`, msg.text());
        results.errors.push({ viewport: vp.name, text: msg.text() });
      }
    });

    page.on('pageerror', err => {
      console.log(`[Page Error][${vp.name}]:`, err.message);
      results.errors.push({ viewport: vp.name, error: err.message });
    });

    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);

      // Check for horizontal scroll / overflow
      const overflowData = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const scrollW = document.documentElement.scrollWidth;
        const bodyW = document.body.scrollWidth;
        const clippingElements = [];

        document.querySelectorAll('*').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > docWidth + 3) {
            clippingElements.push({
              tag: el.tagName.toLowerCase(),
              id: el.id || undefined,
              className: (el.className || '').toString().slice(0, 60),
              overflowPx: Math.round(rect.right - docWidth)
            });
          }
        });

        // Also check if any text is overflowing its container without ellipsis
        const textOverflows = [];
        document.querySelectorAll('h1, h2, h3, p, span, button').forEach(el => {
          if (el.scrollWidth > el.clientWidth + 5 && el.clientWidth > 0) {
            const style = window.getComputedStyle(el);
            if (style.overflow !== 'hidden' && style.textOverflow !== 'ellipsis') {
              textOverflows.push({
                text: el.innerText ? el.innerText.slice(0, 30) : '',
                tag: el.tagName.toLowerCase(),
                scrollWidth: el.scrollWidth,
                clientWidth: el.clientWidth,
                className: (el.className || '').toString().slice(0, 50)
              });
            }
          }
        });

        return {
          docWidth,
          scrollW,
          bodyW,
          hasHorizontalScroll: scrollW > docWidth || bodyW > docWidth,
          clippingElements: clippingElements.slice(0, 5),
          textOverflows: textOverflows.slice(0, 5)
        };
      });

      console.log(`Horizontal overflow check:`, overflowData.hasHorizontalScroll ? 'FAILED (Overflow detected!)' : 'PASSED (No horizontal scroll)');
      if (overflowData.hasHorizontalScroll || overflowData.clippingElements.length > 0) {
        results.overflows.push({ viewport: vp.name, ...overflowData });
      }
      if (overflowData.textOverflows.length > 0) {
        results.visualIssues.push({ viewport: vp.name, type: 'text_overflow', items: overflowData.textOverflows });
      }

      // Default light mode screenshot
      const shotLight = path.join(screenshotDir, `${vp.name}_light.png`);
      await page.screenshot({ path: shotLight, fullPage: false });
      results.screenshots.push(shotLight);
      console.log(`Saved screenshot: ${shotLight}`);

      // Test Dark Mode toggle
      const darkToggle = await page.$('button[title*="Dark"], button[title*="theme"], button:has(svg.lucide-moon), button:has(svg.lucide-sun)');
      if (darkToggle) {
        await darkToggle.click();
        await page.waitForTimeout(500);
        const shotDark = path.join(screenshotDir, `${vp.name}_dark.png`);
        await page.screenshot({ path: shotDark, fullPage: false });
        results.screenshots.push(shotDark);
        console.log(`Saved dark mode screenshot: ${shotDark}`);
      }

      // If mobile, test dock tabs
      if (vp.isMobile) {
        const tabs = ['Contacts', 'Analytics', 'Settings'];
        for (const t of tabs) {
          const btn = await page.$(`button[title="${t}"]`);
          if (btn) {
            await btn.click();
            await page.waitForTimeout(400);
            const shotTab = path.join(screenshotDir, `${vp.name}_mobile_tab_${t.toLowerCase()}.png`);
            await page.screenshot({ path: shotTab });
            console.log(`Saved mobile tab screenshot: ${shotTab}`);
          }
        }
      }

    } catch (err) {
      console.error(`Error on ${vp.name}:`, err.message);
    } finally {
      await context.close();
    }
  }

  await browser.close();
  console.log('\n========================================');
  console.log('Visual Responsiveness Test Complete!');
  console.log(`Errors caught: ${results.errors.length}`);
  console.log(`Overflow issues: ${results.overflows.length}`);
  console.log(`Visual text issues: ${results.visualIssues.length}`);
  console.log(`Screenshots captured: ${results.screenshots.length}`);
  console.log('========================================');

  fs.writeFileSync(path.join(__dirname, 'responsive_report.json'), JSON.stringify(results, null, 2));
}

runTests().catch(err => {
  console.error('Fatal in test runner:', err);
  process.exit(1);
});
