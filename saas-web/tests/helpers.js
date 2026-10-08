/**
 * E2E Test Suite - Shared Helpers and Browser Fixtures
 * Playwright fixture with Chrome / Edge / Chromium fallback for Windows.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const REPORT_DIR = path.join(__dirname, 'reports');
const DEFAULT_TIMEOUT = 5000;

// Ensure output directories exist
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

/**
 * Launch Chromium browser with fallback chain
 */
async function launchBrowser(options = {}) {
  const headless = options.headless !== undefined ? options.headless : true;
  let browser;

  try {
    browser = await chromium.launch({ channel: 'chrome', headless });
  } catch (e1) {
    try {
      browser = await chromium.launch({ channel: 'msedge', headless });
    } catch (e2) {
      browser = await chromium.launch({ headless });
    }
  }

  return browser;
}

/**
 * Create a new isolated browser context and page
 */
async function createPage(browser, options = {}) {
  const viewport = options.viewport || { width: 1280, height: 800 };
  const context = await browser.newContext({
    viewport,
    isMobile: options.isMobile || false,
    hasTouch: options.isMobile || false,
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  page.setDefaultTimeout(DEFAULT_TIMEOUT);

  // Track console errors
  page.consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      page.consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    page.consoleErrors.push(err.message);
  });

  return { context, page };
}

/**
 * Navigate to BASE_URL and wait for hydration/readiness
 */
async function navigateToApp(page, timeout = 15000) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout });
  await page.waitForTimeout(800);
}

/**
 * Get Column locator by 0-based index
 */
function getColumn(page, index) {
  return page.locator('.sortable-column-container').nth(index);
}

/**
 * Get Column header locator by 0-based column index
 */
function getColumnHeader(page, index) {
  return page.locator('.sortable-column-container').nth(index).locator('.h-14, .switcher-header').first();
}

/**
 * Ensure a specific channel is pinned to the AppSwitcher
 */
async function ensureChannelPinned(page, channelId) {
  const existing = await page.$(`#channel-switcher-${channelId}`);
  if (existing) return;

  const addBtn = await page.$('.bottom-action-btn');
  if (addBtn) {
    await addBtn.click();
    await page.waitForTimeout(300);
    const catalogItem = await page.$(`text="${channelId}"`);
    if (catalogItem) {
      await catalogItem.click();
      await page.waitForTimeout(200);
    }
    const closeBtn = await page.$('button:has(svg):has-text(""), .bg-red-100');
    if (closeBtn) {
      await closeBtn.click();
      await page.waitForTimeout(200);
    }
  }
}

/**
 * Take screenshot on failure
 */
async function captureScreenshot(page, name) {
  try {
    const filename = `${name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);
    await page.screenshot({ path: filepath, fullPage: false });
    return filepath;
  } catch (err) {
    console.error(`Failed to capture screenshot for ${name}:`, err.message);
    return null;
  }
}

/**
 * Check if the document has horizontal scroll / overflow
 */
async function checkHorizontalOverflow(page) {
  return await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const bodyWidth = document.body.scrollWidth;
    const overflow = Math.max(scrollWidth, bodyWidth) - docWidth;
    return {
      docWidth,
      scrollWidth,
      bodyWidth,
      hasOverflow: overflow > 2,
      overflowPx: Math.max(0, overflow),
    };
  });
}

/**
 * Standard Assertion Helper
 */
function assert(condition, message) {
  if (!condition) {
    const err = new Error(message || 'Assertion failed');
    err.isAssertionError = true;
    throw err;
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    const msg = `${message || 'Assertion failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
    const err = new Error(msg);
    err.isAssertionError = true;
    throw err;
  }
}

module.exports = {
  BASE_URL,
  SCREENSHOT_DIR,
  REPORT_DIR,
  DEFAULT_TIMEOUT,
  launchBrowser,
  createPage,
  navigateToApp,
  getColumn,
  getColumnHeader,
  ensureChannelPinned,
  captureScreenshot,
  checkHorizontalOverflow,
  assert,
  assertEqual,
};
