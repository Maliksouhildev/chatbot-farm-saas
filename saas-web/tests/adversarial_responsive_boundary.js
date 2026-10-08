/**
 * Adversarial Responsive Boundary Stress Test Harness
 * Author: Challenger 1 (Milestone 1)
 * 
 * Tests boundary conditions:
 * - Navbar: 881px vs 880px, 641px vs 640px, 401px vs 400px, 320px
 * - App Switcher: 251px vs 250px, 201px vs 200px, 191px vs 190px, 110px
 * 
 * Verifies:
 * - Element visibility switches (display, opacity)
 * - Bounding box collisions & overlap
 * - Horizontal overflow / scrollbar (scrollWidth vs clientWidth)
 * - Text overflow and clipping
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, 'challenger_screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function runAdversarialSuite() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = {
    navbarTests: [],
    appSwitcherTests: [],
    failures: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  function recordResult(testGroup, testCase) {
    results.summary.total++;
    if (testCase.passed) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
      results.failures.push({
        group: testGroup,
        name: testCase.name,
        details: testCase.details
      });
    }
    if (testGroup === 'navbar') {
      results.navbarTests.push(testCase);
    } else {
      results.appSwitcherTests.push(testCase);
    }
  }

  // =========================================================================
  // PART 1: NAVBAR BOUNDARY STRESS TESTS
  // =========================================================================
  console.log('\n======================================================');
  console.log('PART 1: Testing Navbar Boundary Viewports');
  console.log('======================================================');

  const navbarViewports = [
    { width: 881, height: 800, label: '881px (Nav tabs visible)' },
    { width: 880, height: 800, label: '880px (Nav tabs hidden, hamburger visible)' },
    { width: 641, height: 800, label: '641px (AI label visible)' },
    { width: 640, height: 800, label: '640px (AI label hidden)' },
    { width: 401, height: 800, label: '401px (AI toggle visible)' },
    { width: 400, height: 800, label: '400px (AI toggle transparent/hidden)' },
    { width: 320, height: 600, label: '320px (Extreme narrow viewport)' }
  ];

  for (const vp of navbarViewports) {
    console.log(`\nEvaluating Navbar at ${vp.width}px (${vp.label})...`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height }
    });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(600);

    const measurements = await page.evaluate((width) => {
      const header = document.querySelector('header');
      const doc = document.documentElement;
      const body = document.body;

      const logo = document.querySelector('.navbar-logo');
      const centerNav = document.querySelector('.navbar-center-nav');
      const actions = document.querySelector('.navbar-actions');
      const aiToggle = document.querySelector('.navbar-ai-toggle');
      const aiLabel = document.querySelector('.navbar-ai-label');
      const mobileToggle = document.querySelector('.navbar-mobile-toggle');

      const headerRect = header ? header.getBoundingClientRect() : null;
      const logoRect = logo ? logo.getBoundingClientRect() : null;
      const centerNavRect = (centerNav && window.getComputedStyle(centerNav).display !== 'none') ? centerNav.getBoundingClientRect() : null;
      const actionsRect = actions ? actions.getBoundingClientRect() : null;
      const aiToggleRect = aiToggle ? aiToggle.getBoundingClientRect() : null;

      const centerNavStyle = centerNav ? window.getComputedStyle(centerNav) : null;
      const mobileToggleStyle = mobileToggle ? window.getComputedStyle(mobileToggle) : null;
      const aiLabelStyle = aiLabel ? window.getComputedStyle(aiLabel) : null;
      const aiToggleStyle = aiToggle ? window.getComputedStyle(aiToggle) : null;

      // Check collision
      let hasCollision = false;
      let collisionDetails = [];

      if (logoRect && actionsRect) {
        if (centerNavRect) {
          // Logo vs Center Nav
          if (logoRect.right > centerNavRect.left + 1) {
            hasCollision = true;
            collisionDetails.push(`Logo (right ${Math.round(logoRect.right)}) overlaps Center Nav (left ${Math.round(centerNavRect.left)})`);
          }
          // Center Nav vs Actions
          if (centerNavRect.right > actionsRect.left + 1) {
            hasCollision = true;
            collisionDetails.push(`Center Nav (right ${Math.round(centerNavRect.right)}) overlaps Actions (left ${Math.round(actionsRect.left)})`);
          }
        } else {
          // Logo vs Actions directly
          if (logoRect.right > actionsRect.left + 1) {
            hasCollision = true;
            collisionDetails.push(`Logo (right ${Math.round(logoRect.right)}) overlaps Actions (left ${Math.round(actionsRect.left)})`);
          }
        }
      }

      // Check horizontal scroll / overflow
      const docOverflow = doc.scrollWidth > doc.clientWidth;
      const bodyOverflow = body.scrollWidth > doc.clientWidth;
      const headerOverflow = header ? header.scrollWidth > header.clientWidth : false;

      // Check text clipping
      const textClippings = [];
      if (header) {
        header.querySelectorAll('span, button, p, h1').forEach(el => {
          if (el.scrollWidth > el.clientWidth + 3 && el.clientWidth > 0) {
            const st = window.getComputedStyle(el);
            if (st.overflow !== 'hidden' && st.textOverflow !== 'ellipsis') {
              textClippings.push({
                text: el.innerText ? el.innerText.trim().slice(0, 30) : '',
                tag: el.tagName.toLowerCase(),
                scrollWidth: el.scrollWidth,
                clientWidth: el.clientWidth,
                className: (el.className || '').toString().slice(0, 40)
              });
            }
          }
        });
      }

      return {
        width,
        docWidth: doc.clientWidth,
        docScrollWidth: doc.scrollWidth,
        hasDocScroll: docOverflow || bodyOverflow,
        hasHeaderScroll: headerOverflow,
        headerWidth: headerRect ? headerRect.width : null,
        centerNavDisplay: centerNavStyle ? centerNavStyle.display : null,
        mobileToggleDisplay: mobileToggleStyle ? mobileToggleStyle.display : null,
        aiLabelDisplay: aiLabelStyle ? aiLabelStyle.display : null,
        aiToggleDisplay: aiToggleStyle ? aiToggleStyle.display : null,
        aiToggleOpacity: aiToggleStyle ? parseFloat(aiToggleStyle.opacity) : null,
        aiToggleWidth: aiToggleRect ? aiToggleRect.width : 0,
        hasCollision,
        collisionDetails,
        textClippings
      };
    }, vp.width);

    // Save screenshot
    const shotPath = path.join(screenshotDir, `navbar_${vp.width}px.png`);
    await page.screenshot({ path: shotPath });
    await page.close();

    // Verify expectations
    let passed = true;
    const failures = [];

    if (measurements.hasDocScroll) {
      passed = false;
      failures.push(`Horizontal document scrollbar present: scrollWidth (${measurements.docScrollWidth}px) > clientWidth (${measurements.docWidth}px)`);
    }

    if (measurements.hasHeaderScroll) {
      passed = false;
      failures.push(`Navbar header scrollWidth exceeds clientWidth`);
    }

    if (measurements.hasCollision) {
      passed = false;
      failures.push(`Navbar elements collision detected: ${measurements.collisionDetails.join('; ')}`);
    }

    if (measurements.textClippings.length > 0) {
      passed = false;
      failures.push(`Text clipping without ellipsis in navbar: ${JSON.stringify(measurements.textClippings)}`);
    }

    // Breakpoint specific checks
    if (vp.width === 881) {
      if (measurements.centerNavDisplay === 'none') {
        passed = false;
        failures.push(`Expected .navbar-center-nav to be visible at 881px, got display: none`);
      }
      if (measurements.mobileToggleDisplay !== 'none') {
        passed = false;
        failures.push(`Expected .navbar-mobile-toggle to be hidden at 881px, got display: ${measurements.mobileToggleDisplay}`);
      }
    } else if (vp.width === 880) {
      if (measurements.centerNavDisplay !== 'none') {
        passed = false;
        failures.push(`Expected .navbar-center-nav to be hidden at 880px, got display: ${measurements.centerNavDisplay}`);
      }
      if (measurements.mobileToggleDisplay !== 'flex') {
        passed = false;
        failures.push(`Expected .navbar-mobile-toggle to be display: flex at 880px, got display: ${measurements.mobileToggleDisplay}`);
      }
    } else if (vp.width === 641) {
      if (measurements.aiLabelDisplay === 'none') {
        passed = false;
        failures.push(`Expected .navbar-ai-label to be visible at 641px, got display: none`);
      }
    } else if (vp.width === 640) {
      if (measurements.aiLabelDisplay !== 'none') {
        passed = false;
        failures.push(`Expected .navbar-ai-label to be hidden at 640px, got display: ${measurements.aiLabelDisplay}`);
      }
    } else if (vp.width === 401) {
      if (measurements.aiToggleDisplay === 'none' || measurements.aiToggleOpacity < 0.5) {
        passed = false;
        failures.push(`Expected .navbar-ai-toggle to be visible at 401px, got display: ${measurements.aiToggleDisplay}, opacity: ${measurements.aiToggleOpacity}`);
      }
    } else if (vp.width === 400) {
      const isHidden = measurements.aiToggleDisplay === 'none' || measurements.aiToggleOpacity === 0;
      if (!isHidden) {
        passed = false;
        failures.push(`Expected .navbar-ai-toggle to be hidden/opacity 0 at 400px, got display: ${measurements.aiToggleDisplay}, opacity: ${measurements.aiToggleOpacity}`);
      }
    }

    console.log(`  -> Result: ${passed ? 'PASSED' : 'FAILED'}`);
    if (!passed) {
      console.log(`     Details:`, failures);
    }

    recordResult('navbar', {
      name: `Navbar at ${vp.width}px`,
      width: vp.width,
      measurements,
      passed,
      details: failures
    });
  }

  // =========================================================================
  // PART 2: APP SWITCHER BOUNDARY STRESS TESTS
  // =========================================================================
  console.log('\n======================================================');
  console.log('PART 2: Testing App Switcher Container Query Boundaries');
  console.log('======================================================');

  const appSwitcherBoundaryWidths = [
    { targetWidth: 251, label: '251px (Auto-AI toggle text visible)' },
    { targetWidth: 250, label: '250px (Auto-AI toggle text collapsed to circular button)' },
    { targetWidth: 201, label: '201px (Add Channel text & channel labels visible)' },
    { targetWidth: 200, label: '200px (Add Channel collapsed to 36px + icon, items to icons)' },
    { targetWidth: 191, label: '191px (Full header text visible, logo icon hidden)' },
    { targetWidth: 190, label: '190px (Header text collapsed to logo icon)' },
    { targetWidth: 110, label: '110px (Extreme narrow rail, Auto-AI toggle hidden)' }
  ];

  for (const item of appSwitcherBoundaryWidths) {
    console.log(`\nEvaluating App Switcher at container width ${item.targetWidth}px (${item.label})...`);
    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 }
    });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(600);

    // Apply exact container width to the panel containing AppSwitcherColumn
    const measurements = await page.evaluate((targetWidth) => {
      const panel = document.querySelector('#switcher') || document.querySelector('[data-panel-id="switcher"]');
      const switcher = document.querySelector('.app-switcher-container');
      if (!switcher) return { error: 'App switcher container not found' };

      // Set fixed width on the container / panel to test exact container query boundary
      if (panel) {
        panel.style.setProperty('flex', 'none', 'important');
        panel.style.setProperty('width', `${targetWidth}px`, 'important');
        panel.style.setProperty('min-width', '0px', 'important');
        panel.style.setProperty('max-width', `${targetWidth}px`, 'important');
      } else {
        switcher.style.setProperty('width', `${targetWidth}px`, 'important');
      }

      // Force layout reflow
      const switcherRect = switcher.getBoundingClientRect();

      const aiToggleText = switcher.querySelector('.switcher-ai-toggle-text');
      const aiToggleBtn = switcher.querySelector('.switcher-ai-toggle');
      const fullText = switcher.querySelector('.switcher-full-text');
      const logoIcon = switcher.querySelector('.switcher-logo-icon');
      const itemTexts = switcher.querySelectorAll('.app-item-text');
      const itemAiToggles = switcher.querySelectorAll('.app-item-ai-toggle');
      const addChannelText = switcher.querySelector('.add-channel-text');
      const bottomBtn = switcher.querySelector('.bottom-action-btn');
      const header = switcher.querySelector('.switcher-header');

      const aiToggleTextStyle = aiToggleText ? window.getComputedStyle(aiToggleText) : null;
      const aiToggleBtnStyle = aiToggleBtn ? window.getComputedStyle(aiToggleBtn) : null;
      const fullTextStyle = fullText ? window.getComputedStyle(fullText) : null;
      const logoIconStyle = logoIcon ? window.getComputedStyle(logoIcon) : null;
      const addChannelTextStyle = addChannelText ? window.getComputedStyle(addChannelText) : null;
      const bottomBtnStyle = bottomBtn ? window.getComputedStyle(bottomBtn) : null;

      const aiToggleBtnRect = aiToggleBtn ? aiToggleBtn.getBoundingClientRect() : null;
      const bottomBtnRect = bottomBtn ? bottomBtn.getBoundingClientRect() : null;
      const headerRect = header ? header.getBoundingClientRect() : null;

      // Check header collision
      let headerCollision = false;
      let headerCollisionDetail = '';
      if (fullText && aiToggleBtn && fullTextStyle && fullTextStyle.display !== 'none' && aiToggleBtnStyle && aiToggleBtnStyle.display !== 'none') {
        const ftRect = fullText.getBoundingClientRect();
        const aiRect = aiToggleBtn.getBoundingClientRect();
        if (ftRect.right > aiRect.left) {
          headerCollision = true;
          headerCollisionDetail = `Header text (right ${Math.round(ftRect.right)}) overlaps Auto-AI toggle (left ${Math.round(aiRect.left)})`;
        }
      }

      // Check horizontal overflow
      const switcherOverflow = switcher.scrollWidth > switcher.clientWidth + 1;
      const headerOverflow = header ? header.scrollWidth > header.clientWidth + 1 : false;

      // Check text clippings
      const textClippings = [];
      switcher.querySelectorAll('span, button, p, h1').forEach(el => {
        if (el.scrollWidth > el.clientWidth + 3 && el.clientWidth > 0) {
          const st = window.getComputedStyle(el);
          if (st.overflow !== 'hidden' && st.textOverflow !== 'ellipsis') {
            textClippings.push({
              text: el.innerText ? el.innerText.trim().slice(0, 30) : '',
              tag: el.tagName.toLowerCase(),
              scrollWidth: el.scrollWidth,
              clientWidth: el.clientWidth,
              className: (el.className || '').toString().slice(0, 40)
            });
          }
        }
      });

      return {
        targetWidth,
        actualWidth: Math.round(switcherRect.width),
        switcherOverflow,
        headerOverflow,
        headerCollision,
        headerCollisionDetail,
        aiToggleTextDisplay: aiToggleTextStyle ? aiToggleTextStyle.display : null,
        aiToggleBtnWidth: aiToggleBtnRect ? Math.round(aiToggleBtnRect.width) : null,
        aiToggleBtnHeight: aiToggleBtnRect ? Math.round(aiToggleBtnRect.height) : null,
        aiToggleBtnDisplay: aiToggleBtnStyle ? aiToggleBtnStyle.display : null,
        fullTextDisplay: fullTextStyle ? fullTextStyle.display : null,
        logoIconDisplay: logoIconStyle ? logoIconStyle.display : null,
        addChannelTextDisplay: addChannelTextStyle ? addChannelTextStyle.display : null,
        bottomBtnWidth: bottomBtnRect ? Math.round(bottomBtnRect.width) : null,
        bottomBtnHeight: bottomBtnRect ? Math.round(bottomBtnRect.height) : null,
        firstItemTextDisplay: itemTexts.length > 0 ? window.getComputedStyle(itemTexts[0]).display : null,
        firstItemAiToggleDisplay: itemAiToggles.length > 0 ? window.getComputedStyle(itemAiToggles[0]).display : null,
        textClippings
      };
    }, item.targetWidth);

    // Save screenshot
    const shotPath = path.join(screenshotDir, `app_switcher_${item.targetWidth}px.png`);
    await page.screenshot({ path: shotPath });
    await page.close();

    // Verify expectations
    let passed = true;
    const failures = [];

    if (measurements.switcherOverflow) {
      passed = false;
      failures.push(`App Switcher container has horizontal scroll (scrollWidth > clientWidth) at ${item.targetWidth}px`);
    }

    if (measurements.headerOverflow) {
      passed = false;
      failures.push(`App Switcher header has horizontal scroll (scrollWidth > clientWidth) at ${item.targetWidth}px`);
    }

    if (measurements.headerCollision) {
      passed = false;
      failures.push(`App Switcher header collision: ${measurements.headerCollisionDetail}`);
    }

    if (measurements.textClippings.length > 0) {
      passed = false;
      failures.push(`App Switcher text clipping without ellipsis: ${JSON.stringify(measurements.textClippings)}`);
    }

    // Boundary specific checks
    if (item.targetWidth === 251) {
      if (measurements.aiToggleTextDisplay === 'none') {
        passed = false;
        failures.push(`Expected .switcher-ai-toggle-text to be visible at 251px, got display: none`);
      }
    } else if (item.targetWidth === 250) {
      if (measurements.aiToggleTextDisplay !== 'none') {
        passed = false;
        failures.push(`Expected .switcher-ai-toggle-text to be hidden at 250px, got display: ${measurements.aiToggleTextDisplay}`);
      }
      // AI button should be circular ~28px
      if (measurements.aiToggleBtnWidth > 32 || measurements.aiToggleBtnWidth < 24) {
        passed = false;
        failures.push(`Expected .switcher-ai-toggle to be ~28px wide at 250px, got ${measurements.aiToggleBtnWidth}px`);
      }
    } else if (item.targetWidth === 201) {
      if (measurements.addChannelTextDisplay === 'none') {
        passed = false;
        failures.push(`Expected .add-channel-text to be visible at 201px, got display: none`);
      }
      if (measurements.firstItemTextDisplay === 'none') {
        passed = false;
        failures.push(`Expected .app-item-text to be visible at 201px, got display: none`);
      }
    } else if (item.targetWidth === 200) {
      if (measurements.addChannelTextDisplay !== 'none') {
        passed = false;
        failures.push(`Expected .add-channel-text to be hidden at 200px, got display: ${measurements.addChannelTextDisplay}`);
      }
      if (measurements.firstItemTextDisplay !== 'none') {
        passed = false;
        failures.push(`Expected .app-item-text to be hidden at 200px, got display: ${measurements.firstItemTextDisplay}`);
      }
      // Bottom button should be ~36px (2.25rem) square button
      if (measurements.bottomBtnWidth > 40 || measurements.bottomBtnWidth < 30) {
        passed = false;
        failures.push(`Expected .bottom-action-btn to collapse to ~36px at 200px, got width ${measurements.bottomBtnWidth}px`);
      }
    } else if (item.targetWidth === 191) {
      if (measurements.fullTextDisplay === 'none') {
        passed = false;
        failures.push(`Expected .switcher-full-text to be visible at 191px, got display: none`);
      }
      if (measurements.logoIconDisplay !== 'none') {
        passed = false;
        failures.push(`Expected .switcher-logo-icon to be hidden at 191px, got display: ${measurements.logoIconDisplay}`);
      }
    } else if (item.targetWidth === 190) {
      if (measurements.fullTextDisplay !== 'none') {
        passed = false;
        failures.push(`Expected .switcher-full-text to be hidden at 190px, got display: ${measurements.fullTextDisplay}`);
      }
      if (measurements.logoIconDisplay !== 'flex') {
        passed = false;
        failures.push(`Expected .switcher-logo-icon to be display: flex at 190px, got display: ${measurements.logoIconDisplay}`);
      }
    } else if (item.targetWidth === 110) {
      if (measurements.aiToggleBtnDisplay !== 'none') {
        passed = false;
        failures.push(`Expected .switcher-ai-toggle to be hidden at 110px, got display: ${measurements.aiToggleBtnDisplay}`);
      }
    }

    console.log(`  -> Result: ${passed ? 'PASSED' : 'FAILED'}`);
    if (!passed) {
      console.log(`     Details:`, failures);
    }

    recordResult('appSwitcher', {
      name: `App Switcher at ${item.targetWidth}px`,
      targetWidth: item.targetWidth,
      measurements,
      passed,
      details: failures
    });
  }

  await browser.close();

  // Write full results to file
  const reportPath = path.join(__dirname, 'challenger_boundary_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log('\n======================================================');
  console.log('CHALLENGER STRESS SUITE SUMMARY');
  console.log(`Total tests:  ${results.summary.total}`);
  console.log(`Passed:       ${results.summary.passed}`);
  console.log(`Failed:       ${results.summary.failed}`);
  console.log('======================================================\n');

  if (results.summary.failed > 0) {
    console.log('FAILED CASES:');
    results.failures.forEach(f => {
      console.log(`[${f.group.toUpperCase()}] ${f.name}:`);
      f.details.forEach(d => console.log(`   - ${d}`));
    });
    process.exit(1);
  } else {
    console.log('ALL ADVERSARIAL BOUNDARY TESTS PASSED EMPIRICALLY!');
    process.exit(0);
  }
}

runAdversarialSuite().catch(err => {
  console.error('Fatal in adversarial test runner:', err);
  process.exit(1);
});
