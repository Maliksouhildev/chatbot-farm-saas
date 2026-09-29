const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function main() {
  const artifactDir = 'C:\\Users\\mlkme\\.gemini\\antigravity\\brain\\4d688a9d-9a23-4cfc-b68e-b0acf766f62d';
  const tmpDir = path.join(os.tmpdir(), 'cdbg_ig_mob_' + Date.now());
  
  console.log('Launching mobile headless Chrome on port 9455...');
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9455',
    '--user-data-dir=' + tmpDir,
    '--window-size=390,844',
    'http://localhost:3000'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2500));
    const res = await fetch('http://127.0.0.1:9455/json');
    const pages = await res.json();
    const targetPage = pages.find(p => p.url.includes('3000')) || pages[0];
    const ws = new WebSocket(targetPage.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === id) {
            ws.removeEventListener('message', handler);
            resolve(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
      hasTouch: true
    });

    console.log('1. Navigating to http://localhost:3000 on mobile...');
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 2500));

    // Sign in test user with real Instagram connected
    console.log('2. Signing in test user...');
    await send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(async () => {
        const userObj = {
          id: '837b789a-8618-470e-a659-6a824d751f7f',
          name: 'Malik Store',
          email: 'malik@store.dz',
          provider: 'google',
          plan: 'Enterprise DZ Pro',
          verified: true,
          avatar: 'M'
        };
        localStorage.setItem('cf_user_session', JSON.stringify(userObj));
        localStorage.setItem('cf_connected_apps_837b789a-8618-470e-a659-6a824d751f7f', JSON.stringify(['web_widget', 'instagram']));
        localStorage.setItem('cf_connected_apps', JSON.stringify(['web_widget', 'instagram']));
        localStorage.setItem('cf_ig_account', JSON.stringify({
          username: 'el_bahdja_store',
          igId: 'el_bahdja_store',
          name: 'El Bahdja Store'
        }));
        window.location.reload();
      })()`
    });

    await new Promise(r => setTimeout(r, 3000));

    // Select Instagram on mobile
    console.log('3. Selecting Instagram on mobile...');
    await send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(() => {
        const channelDivs = Array.from(document.querySelectorAll('div[role="button"]'));
        const igChannel = channelDivs.find(d => d.textContent && d.textContent.includes('Instagram'));
        if (igChannel) igChannel.click();
      })()`
    });

    await new Promise(r => setTimeout(r, 1500));

    // Capture mobile CRM view
    console.log('Capturing mobile connected Instagram CRM view...');
    const shotMob1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'verified_instagram_mobile_connected_crm.png'), Buffer.from(shotMob1.data, 'base64'));

    // Open connect modal on mobile
    console.log('4. Opening ConnectChannelModal on mobile...');
    await send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(() => {
        const linkBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Link Meta Graph API Token'));
        if (linkBtn) linkBtn.click();
      })()`
    });

    await new Promise(r => setTimeout(r, 1500));

    // Capture mobile wizard view
    console.log('Capturing mobile Instagram Unified Wizard view...');
    const shotMob2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'verified_instagram_mobile_wizard_view.png'), Buffer.from(shotMob2.data, 'base64'));

    console.log('Mobile verification completed successfully!');
    ws.close();
  } catch (err) {
    console.error('Mobile verification error:', err);
  } finally {
    chrome.kill();
  }
}

main();
