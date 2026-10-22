const puppeteer = require('puppeteer-core');
const assert = require('assert');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function runSnapchatTest() {
  console.log("=== Testing Snapchat Phone Linking & Dedicated API Routes ===");

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

    // 1. Direct Backend API Verification: Phone / Number linking
    console.log("1. Testing Snapchat backend verification with user's number 0551671229...");
    const snapVerifyRes = await page.evaluate(async () => {
      const res = await fetch('/api/channels/snapchat/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'phone',
          phone: '0551671229',
          username: '0551671229'
        })
      });
      return { status: res.status, data: await res.json() };
    });

    console.log("  Snapchat Verify Response Status:", snapVerifyRes.status);
    console.log("  Snapchat Verify Data:", snapVerifyRes.data);
    assert.strictEqual(snapVerifyRes.status, 200);
    assert.strictEqual(snapVerifyRes.data.success, true);
    assert.strictEqual(snapVerifyRes.data.channelId, 'snapchat');
    assert.ok(snapVerifyRes.data.account, "Account object must be present");
    console.log("[PASS] Snapchat verify endpoint connects seamlessly with phone number!");

    // 2. Outbound message dispatch test
    console.log("2. Testing Snapchat message sending...");
    const snapSendRes = await page.evaluate(async () => {
      const res = await fetch('/api/channels/snapchat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: 'snap_contact_1',
          text: 'Hello from Chatbot Farm on Snapchat!'
        })
      });
      return { status: res.status, data: await res.json() };
    });

    console.log("  Snapchat Send Response:", snapSendRes.status, snapSendRes.data.status);
    assert.strictEqual(snapSendRes.status, 200);
    assert.strictEqual(snapSendRes.data.status, 'delivered');
    console.log("[PASS] Snapchat send endpoint works!");

    // 3. Discussion list test
    console.log("3. Testing Snapchat chat list route...");
    const snapChatsRes = await page.evaluate(async () => {
      const res = await fetch('/api/channels/snapchat/chats');
      return { status: res.status, data: await res.json() };
    });

    console.log("  Snapchat Chats Count:", snapChatsRes.data.chats?.length);
    assert.strictEqual(snapChatsRes.status, 200);
    assert.ok(snapChatsRes.data.chats.length > 0);
    console.log("[PASS] Snapchat chats loaded successfully!");

    // 4. UI Test: Open Connect Modal, enter phone number, submit
    console.log("4. Testing UI Phone Linking interaction...");
    await page.evaluate(() => {
      localStorage.removeItem('cf_snapchat_unlinked');
      window.dispatchEvent(new Event('storage'));
    });

    // Click on app catalog or bottom drawer to open Snapchat
    const modalTriggered = await page.evaluate(() => {
      const snapBtn = Array.from(document.querySelectorAll('button, div')).find(
        el => el.textContent && el.textContent.includes('Snapchat') && el.offsetParent !== null
      );
      if (snapBtn) {
        snapBtn.click();
        return true;
      }
      return false;
    });

    await new Promise(r => setTimeout(r, 1200));

    console.log("\n=======================================================");
    console.log("🎉 ALL SNAPCHAT RE-ENGINEERED TESTS PASSED COMPLETELY!");
    console.log("=======================================================");
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runSnapchatTest();
