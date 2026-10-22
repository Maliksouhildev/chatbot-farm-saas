const puppeteer = require('puppeteer-core');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function testViberUi() {
  console.log("=== Testing Simplified Viber Pairing Flow ===");
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 }
  });

  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Set up active app as Viber (unconnected)
    await page.evaluate(() => {
      localStorage.setItem('cf_pinned_apps', JSON.stringify(['whatsapp', 'viber']));
      localStorage.setItem('cf_connected_apps', JSON.stringify(['whatsapp']));
      localStorage.setItem('cf_active_app', 'viber');
      localStorage.removeItem('cf_viber_account');
      localStorage.removeItem('cf_viber_phone');
      localStorage.removeItem('cf_viber_token');
    });

    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // 1. Click the Connect Viber button in MiddleChatColumn using its exact ID
    console.log("1. Clicking '#empty-state-connect-channel-btn' button...");
    const clickedConnect = await page.evaluate(() => {
      const btn = document.getElementById('empty-state-connect-channel-btn');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log(`  Connect button clicked: ${clickedConnect}`);
    if (!clickedConnect) {
      // Fallback: click switcher first then connect button
      await page.evaluate(() => {
        const sw = document.getElementById('channel-switcher-viber');
        sw?.click();
      });
      await new Promise(r => setTimeout(r, 1000));
      await page.evaluate(() => {
        const btn = document.getElementById('empty-state-connect-channel-btn');
        btn?.click();
      });
    }

    await new Promise(r => setTimeout(r, 1500));

    // 2. Inspect modal tabs and verify simplified layout
    console.log("2. Inspecting Viber Pairing Modal DOM...");
    const modalInspection = await page.evaluate(() => {
      const phoneTab = document.getElementById('viber-tab-phone');
      const tokenTab = document.getElementById('viber-tab-token');
      const phoneInput = document.getElementById('viber-input-phone');
      const submitPhoneBtn = document.getElementById('viber-submit-phone-btn');
      
      // Check for elements that MUST NOT exist (the bloat that user complained about)
      const qrTab = document.getElementById('viber-tab-qr');
      const legacyCodeInput = document.querySelector('input[placeholder="849216"]');
      const autoFillBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Auto-Fill Code'));

      return {
        hasPhoneTab: Boolean(phoneTab),
        hasTokenTab: Boolean(tokenTab),
        hasPhoneInput: Boolean(phoneInput),
        phoneInputValue: phoneInput ? phoneInput.value : null,
        hasSubmitPhoneBtn: Boolean(submitPhoneBtn),
        // Bloat check (should all be false/null)
        hasBrokenQrTab: Boolean(qrTab),
        hasLegacyCodeInput: Boolean(legacyCodeInput),
        hasAutoFillBtn: Boolean(autoFillBtn),
      };
    });

    console.log("  Modal DOM Elements:", modalInspection);
    if (!modalInspection.hasPhoneTab || !modalInspection.hasTokenTab) {
      throw new Error("Viber Phone or Token tab missing from modal");
    }
    if (modalInspection.hasBrokenQrTab || modalInspection.hasLegacyCodeInput || modalInspection.hasAutoFillBtn) {
      throw new Error("Modal still contains legacy bloat elements (QR/Code/Auto-fill)!");
    }

    // 3. Click the 'Vérifier et lier le compte Viber' button
    console.log("3. Submitting Phone Pairing form...");
    await page.evaluate(() => {
      const btn = document.getElementById('viber-submit-phone-btn');
      if (btn) btn.click();
    });

    // Wait for connection to succeed
    await new Promise(r => setTimeout(r, 2000));

    // 4. Verify local storage and connected status
    const postConnectCheck = await page.evaluate(() => {
      const viberAcc = localStorage.getItem('cf_viber_account');
      const viberPhone = localStorage.getItem('cf_viber_phone');
      const connectedApps = JSON.parse(localStorage.getItem('cf_connected_apps') || '[]');
      const errorEl = document.querySelector('.bg-red-50, .bg-red-950\\/30');
      return {
        isViberConnected: connectedApps.includes('viber'),
        hasViberAccount: Boolean(viberAcc),
        viberPhone,
        hasErrorMessage: Boolean(errorEl),
        errorText: errorEl ? errorEl.textContent : null,
      };
    });

    console.log("  Post-Connect Status:", postConnectCheck);
    if (postConnectCheck.hasErrorMessage) {
      throw new Error(`Connection failed with error displayed: ${postConnectCheck.errorText}`);
    }
    if (!postConnectCheck.isViberConnected || !postConnectCheck.hasViberAccount) {
      throw new Error("Viber was not registered as connected in storage!");
    }

    console.log("🎉 MODAL UI AND PHONE LINKING FLOW FULLY VERIFIED AND WORKING!");
  } finally {
    await browser.close();
  }
}

testViberUi().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
