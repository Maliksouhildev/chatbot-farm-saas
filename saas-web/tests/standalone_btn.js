const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setContent(`
    <style>
      .w-full { width: 100%; }
      .container { container-type: inline-size; width: 200px; }
      @container (max-width: 200px) {
        .btn { width: 36px !important; height: 36px !important; aspect-ratio: 1/1 !important; margin: 0 auto !important; }
      }
    </style>
    <div class="container">
      <button class="btn w-full" style="display: flex;">+</button>
    </div>
  `);

  const res = await page.evaluate(() => {
    const btn = document.querySelector('button');
    return {
      rect: btn.getBoundingClientRect().width,
      cs: getComputedStyle(btn).width
    };
  });
  console.log('Standalone result:', res);
  await browser.close();
}

run().catch(console.error);
