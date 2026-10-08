/**
 * Empirical Boundary Evaluator
 * Challenger 1 (Milestone 1)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function evaluateAll() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  const report = {
    navbarViewportTests: [],
    navbarContainerTests: [],
    appSwitcherContainerTests: [],
    collisions: [],
    overflows: []
  };

  // --------------------------------------------------------------------------
  // 1. Navbar Viewport Width Tests
  // --------------------------------------------------------------------------
  console.log('Testing Navbar at Viewport Widths: 881, 880, 641, 640, 401, 400, 320...');
  for (const w of [881, 880, 641, 640, 401, 400, 320]) {
    const page = await browser.newPage({ viewport: { width: w, height: 800 } });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    const data = await page.evaluate((width) => {
      const header = document.querySelector('header');
      const doc = document.documentElement;
      const body = document.body;

      const logo = document.querySelector('.navbar-logo');
      const centerNav = document.querySelector('.navbar-center-nav');
      const actions = document.querySelector('.navbar-actions');
      const aiToggle = document.querySelector('.navbar-ai-toggle');
      const aiLabel = document.querySelector('.navbar-ai-label');
      const mobileToggle = document.querySelector('.navbar-mobile-toggle');

      const logoRect = logo ? logo.getBoundingClientRect() : null;
      const navRect = (centerNav && getComputedStyle(centerNav).display !== 'none') ? centerNav.getBoundingClientRect() : null;
      const actionsRect = actions ? actions.getBoundingClientRect() : null;

      const hasHorizontalScroll = doc.scrollWidth > doc.clientWidth || body.scrollWidth > doc.clientWidth;

      // Check collision
      let collision = false;
      let collisionDetail = '';
      if (logoRect && actionsRect) {
        if (navRect) {
          if (logoRect.right > navRect.left) {
            collision = true;
            collisionDetail = `Logo overlaps CenterNav (${logoRect.right} > ${navRect.left})`;
          }
          if (navRect.right > actionsRect.left) {
            collision = true;
            collisionDetail = `CenterNav overlaps Actions (${navRect.right} > ${actionsRect.left})`;
          }
        } else {
          if (logoRect.right > actionsRect.left) {
            collision = true;
            collisionDetail = `Logo overlaps Actions (${logoRect.right} > ${actionsRect.left})`;
          }
        }
      }

      return {
        viewportWidth: width,
        headerOffsetWidth: header.offsetWidth,
        headerClientWidth: header.clientWidth,
        headerPadding: getComputedStyle(header).paddingLeft + ' + ' + getComputedStyle(header).paddingRight,
        containerInlineSize: header.clientWidth - parseFloat(getComputedStyle(header).paddingLeft) - parseFloat(getComputedStyle(header).paddingRight),
        centerNavDisplay: centerNav ? getComputedStyle(centerNav).display : null,
        mobileToggleDisplay: mobileToggle ? getComputedStyle(mobileToggle).display : null,
        aiLabelDisplay: aiLabel ? getComputedStyle(aiLabel).display : null,
        aiToggleDisplay: aiToggle ? getComputedStyle(aiToggle).display : null,
        aiToggleOpacity: aiToggle ? getComputedStyle(aiToggle).opacity : null,
        hasHorizontalScroll,
        collision,
        collisionDetail
      };
    }, w);

    report.navbarViewportTests.push(data);
    if (data.collision) report.collisions.push(data);
    if (data.hasHorizontalScroll) report.overflows.push(data);
    await page.close();
  }

  // --------------------------------------------------------------------------
  // 2. Navbar Container Inline-Size Tests
  // (Viewport where header content-box is exactly 881px, 880px, 641px, 640px, 401px, 400px)
  // At >=640px, padding is 48px (24px left + 24px right).
  // Content box = 881px -> Viewport = 881 + 48 = 929px.
  // Content box = 880px -> Viewport = 880 + 48 = 928px.
  // Content box = 641px -> Viewport = 641 + 48 = 689px.
  // Content box = 640px -> Viewport = 640 + 48 = 688px.
  // Content box = 401px -> (padding is 20px below 640px) -> Viewport = 401 + 20 = 421px.
  // Content box = 400px -> Viewport = 400 + 20 = 420px.
  // --------------------------------------------------------------------------
  console.log('Testing Navbar at Container Inline-Size Breakpoints (Viewports: 929, 928, 689, 688, 421, 420)...');
  for (const w of [929, 928, 689, 688, 421, 420]) {
    const page = await browser.newPage({ viewport: { width: w, height: 800 } });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    const data = await page.evaluate((width) => {
      const header = document.querySelector('header');
      const doc = document.documentElement;

      const logo = document.querySelector('.navbar-logo');
      const centerNav = document.querySelector('.navbar-center-nav');
      const actions = document.querySelector('.navbar-actions');
      const aiToggle = document.querySelector('.navbar-ai-toggle');
      const aiLabel = document.querySelector('.navbar-ai-label');
      const mobileToggle = document.querySelector('.navbar-mobile-toggle');

      const logoRect = logo ? logo.getBoundingClientRect() : null;
      const navRect = (centerNav && getComputedStyle(centerNav).display !== 'none') ? centerNav.getBoundingClientRect() : null;
      const actionsRect = actions ? actions.getBoundingClientRect() : null;

      let collision = false;
      let collisionDetail = '';
      if (logoRect && actionsRect) {
        if (navRect) {
          if (logoRect.right > navRect.left) {
            collision = true;
            collisionDetail = `Logo overlaps CenterNav (${logoRect.right} > ${navRect.left})`;
          }
          if (navRect.right > actionsRect.left) {
            collision = true;
            collisionDetail = `CenterNav overlaps Actions (${navRect.right} > ${actionsRect.left})`;
          }
        } else {
          if (logoRect.right > actionsRect.left) {
            collision = true;
            collisionDetail = `Logo overlaps Actions (${logoRect.right} > ${actionsRect.left})`;
          }
        }
      }

      return {
        viewportWidth: width,
        containerInlineSize: header.clientWidth - parseFloat(getComputedStyle(header).paddingLeft) - parseFloat(getComputedStyle(header).paddingRight),
        centerNavDisplay: centerNav ? getComputedStyle(centerNav).display : null,
        mobileToggleDisplay: mobileToggle ? getComputedStyle(mobileToggle).display : null,
        aiLabelDisplay: aiLabel ? getComputedStyle(aiLabel).display : null,
        aiToggleDisplay: aiToggle ? getComputedStyle(aiToggle).display : null,
        aiToggleOpacity: aiToggle ? getComputedStyle(aiToggle).opacity : null,
        hasHorizontalScroll: doc.scrollWidth > doc.clientWidth,
        collision,
        collisionDetail
      };
    }, w);

    report.navbarContainerTests.push(data);
    if (data.collision) report.collisions.push(data);
    if (data.hasHorizontalScroll) report.overflows.push(data);
    await page.close();
  }

  // --------------------------------------------------------------------------
  // 3. App Switcher Container Width Tests (253, 252, 203, 202, 193, 192, 112)
  // Note: App Switcher has 1px border on each side (2px total).
  // Content box = 251px -> Panel width = 253px.
  // Content box = 250px -> Panel width = 252px.
  // Content box = 201px -> Panel width = 203px.
  // Content box = 200px -> Panel width = 202px.
  // Content box = 191px -> Panel width = 193px.
  // Content box = 190px -> Panel width = 192px.
  // Also test direct panel widths: 251, 250, 201, 200, 191, 190.
  // --------------------------------------------------------------------------
  console.log('Testing App Switcher Container Widths with layout frame wait...');
  const appWidths = [260, 253, 252, 251, 250, 203, 202, 201, 200, 193, 192, 191, 190, 110];

  for (const targetW of appWidths) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Set width and wait 300ms for layout and style recalculation
    await page.evaluate((w) => {
      const sw = document.querySelector('.app-switcher-container');
      const panel = sw.closest('#switcher') || sw.parentElement;
      panel.style.setProperty('width', `${w}px`, 'important');
      panel.style.setProperty('flex', 'none', 'important');
      panel.style.setProperty('min-width', '0px', 'important');
      panel.style.setProperty('max-width', `${w}px`, 'important');
    }, targetW);

    await page.waitForTimeout(300);

    const data = await page.evaluate((targetW) => {
      const sw = document.querySelector('.app-switcher-container');
      const btn = sw.querySelector('.bottom-action-btn');
      const aiToggleText = sw.querySelector('.switcher-ai-toggle-text');
      const aiToggleBtn = sw.querySelector('.switcher-ai-toggle');
      const fullText = sw.querySelector('.switcher-full-text');
      const logoIcon = sw.querySelector('.switcher-logo-icon');
      const itemTexts = sw.querySelectorAll('.app-item-text');
      const addChannelText = sw.querySelector('.add-channel-text');
      const header = sw.querySelector('.switcher-header');

      const swBorder = parseFloat(getComputedStyle(sw).borderLeftWidth) + parseFloat(getComputedStyle(sw).borderRightWidth);
      const containerInlineSize = sw.clientWidth; // clientWidth excludes border, equals content box

      // Check header collision
      let headerCollision = false;
      let headerCollisionDetail = '';
      if (fullText && aiToggleBtn && getComputedStyle(fullText).display !== 'none' && getComputedStyle(aiToggleBtn).display !== 'none') {
        const ftRect = fullText.getBoundingClientRect();
        const aiRect = aiToggleBtn.getBoundingClientRect();
        if (ftRect.right > aiRect.left) {
          headerCollision = true;
          headerCollisionDetail = `Header text overlaps Auto-AI (${ftRect.right} > ${aiRect.left})`;
        }
      }

      // Check horizontal overflow
      const switcherOverflow = sw.scrollWidth > sw.clientWidth + 1;

      return {
        targetWidth: targetW,
        containerInlineSize,
        aiToggleTextDisplay: aiToggleText ? getComputedStyle(aiToggleText).display : null,
        aiToggleBtnWidth: aiToggleBtn ? Math.round(aiToggleBtn.getBoundingClientRect().width) : null,
        fullTextDisplay: fullText ? getComputedStyle(fullText).display : null,
        logoIconDisplay: logoIcon ? getComputedStyle(logoIcon).display : null,
        addChannelTextDisplay: addChannelText ? getComputedStyle(addChannelText).display : null,
        btnWidth: btn ? Math.round(btn.getBoundingClientRect().width) : null,
        firstItemTextDisplay: itemTexts.length > 0 ? getComputedStyle(itemTexts[0]).display : null,
        switcherOverflow,
        headerCollision,
        headerCollisionDetail
      };
    }, targetW);

    report.appSwitcherContainerTests.push(data);
    if (data.headerCollision) report.collisions.push(data);
    if (data.switcherOverflow) report.overflows.push(data);
    await page.close();
  }

  await browser.close();

  fs.writeFileSync(path.join(__dirname, 'empirical_boundary_summary.json'), JSON.stringify(report, null, 2));
  console.log('\nEmpirical Boundary Evaluation Complete! Results saved to empirical_boundary_summary.json.');
}

evaluateAll().catch(console.error);
