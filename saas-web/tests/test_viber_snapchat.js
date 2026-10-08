const puppeteer = require('puppeteer-core');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function runTests() {
  console.log("=== Testing Viber & Snapchat Catalog & Connection Overhaul ===");
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

    // 1. Check if Viber and Snapchat appear in App Catalog drawer or switcher
    console.log("1. Checking App Catalog drawer for Viber and Snapchat...");
    const addBtn = await page.$('.bottom-action-btn');
    if (addBtn) {
      await addBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      const pageContent = await page.content();
      const hasViberInDrawer = pageContent.includes('Viber');
      const hasSnapchatInDrawer = pageContent.includes('Snapchat');
      console.log(`  Catalog Drawer: Viber=${hasViberInDrawer}, Snapchat=${hasSnapchatInDrawer}`);
      if (!hasViberInDrawer || !hasSnapchatInDrawer) {
        throw new Error("Viber or Snapchat missing in App Catalog drawer");
      }
    }

    // 2. Test Backend Verify API for Viber
    console.log("2. Testing Viber backend verification...");
    const viberRes = await page.evaluate(async () => {
      const res = await fetch('/api/channels/viber/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'test_viber_token_123', name: 'Test Viber Store' })
      });
      return { status: res.status, data: await res.json() };
    });
    console.log("  Viber Verify Response:", viberRes.status, viberRes.data.success);
    if (!viberRes.data.success || viberRes.data.channelId !== 'viber') {
      throw new Error("Viber verify route failed");
    }

    // 3. Test Backend Verify API for Snapchat
    console.log("3. Testing Snapchat backend verification...");
    const snapRes = await page.evaluate(async () => {
      const res = await fetch('/api/channels/snapchat/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: 'snap_client_123', token: 'snap_token_abc' })
      });
      return { status: res.status, data: await res.json() };
    });
    console.log("  Snapchat Verify Response:", snapRes.status, snapRes.data.success);
    if (!snapRes.data.success || snapRes.data.channelId !== 'snapchat') {
      throw new Error("Snapchat verify route failed");
    }

    // 4. Test Outbound Send for Viber and Snapchat
    console.log("4. Testing Viber and Snapchat outbound message send...");
    const sendRes = await page.evaluate(async () => {
      const vSend = await fetch('/api/channels/viber/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: 'viber_user_1', text: 'Hello Viber Customer!' })
      });
      const sSend = await fetch('/api/channels/snapchat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: 'snap_user_1', text: 'Hello Snapchat Customer!' })
      });
      return {
        viberStatus: vSend.status,
        viberData: await vSend.json(),
        snapStatus: sSend.status,
        snapData: await sSend.json()
      };
    });
    console.log("  Viber Send Status:", sendRes.viberStatus, sendRes.viberData.status);
    console.log("  Snapchat Send Status:", sendRes.snapStatus, sendRes.snapData.status);

    if (sendRes.viberStatus !== 200 || sendRes.snapStatus !== 200) {
      throw new Error("Send endpoints failed for Viber or Snapchat");
    }

    console.log("\n=======================================================");
    console.log("🎉 ALL VIBER & SNAPCHAT INTEGRATION TESTS PASSED!");
    console.log("=======================================================\n");
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
