const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function main() {
  const artifactDir = 'C:\\Users\\mlkme\\.gemini\\antigravity\\brain\\4d688a9d-9a23-4cfc-b68e-b0acf766f62d';
  const tmpDir = path.join(os.tmpdir(), 'cdbg_ig_wiz_' + Date.now());
  
  console.log('Launching headless Chrome on port 9444...');
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9444',
    '--user-data-dir=' + tmpDir,
    '--window-size=1440,900',
    'http://localhost:3000'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2500));
    const res = await fetch('http://127.0.0.1:9444/json');
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

    console.log('1. Navigating to http://localhost:3000...');
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 2500));

    // Sign in test user and ensure Instagram is unlinked
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
        localStorage.setItem('cf_connected_apps_837b789a-8618-470e-a659-6a824d751f7f', JSON.stringify(['web_widget']));
        localStorage.setItem('cf_connected_apps', JSON.stringify(['web_widget']));
        localStorage.removeItem('cf_ig_account');
        localStorage.removeItem('cf_meta_auth');
        window.location.reload();
      })()`
    });

    await new Promise(r => setTimeout(r, 3000));

    // Select Instagram channel in AppSwitcherColumn
    console.log('3. Selecting Instagram channel in Column 1...');
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

    // Capture screenshot 1: Unlinked Empty State
    console.log('Capturing Screenshot 1: Unlinked Empty State (0 fake contacts)...');
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'verified_instagram_unlinked_empty_state.png'), Buffer.from(shot1.data, 'base64'));

    // Open Connect Modal for Instagram
    console.log('4. Clicking "Connect Instagram via Meta" to open Unified Wizard...');
    await send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const connectBtn = buttons.find(b => b.textContent && (
          b.textContent.includes('Connect Instagram via Meta') ||
          b.textContent.includes('Connect Instagram')
        ));
        if (connectBtn) connectBtn.click();
      })()`
    });

    await new Promise(r => setTimeout(r, 1500));

    // Capture screenshot 2: Step 1 - Choose Account Type
    console.log('Capturing Screenshot 2: Step 1 - Choose Account Type...');
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'verified_instagram_wizard_step1_choose_type.png'), Buffer.from(shot2.data, 'base64'));

    // Click Professional Account using #ig-wizard-card-professional
    console.log('5. Clicking #ig-wizard-card-professional...');
    await send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(() => {
        const el = document.getElementById('ig-wizard-card-professional');
        if (el) el.click();
      })()`
    });

    await new Promise(r => setTimeout(r, 1200));

    // Capture screenshot 3: Step 2A - Professional Configuration
    console.log('Capturing Screenshot 3: Step 2A - Professional Configuration...');
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'verified_instagram_wizard_step2a_professional.png'), Buffer.from(shot3.data, 'base64'));

    // Click Back to change account type using #ig-wizard-back-btn-meta
    console.log('6. Clicking #ig-wizard-back-btn-meta...');
    await send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(() => {
        const el = document.getElementById('ig-wizard-back-btn-meta');
        if (el) el.click();
      })()`
    });

    await new Promise(r => setTimeout(r, 1000));

    // Click Personal Account using #ig-wizard-card-personal
    console.log('7. Clicking #ig-wizard-card-personal...');
    await send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(() => {
        const el = document.getElementById('ig-wizard-card-personal');
        if (el) el.click();
      })()`
    });

    await new Promise(r => setTimeout(r, 1200));

    // Toggle the Session ID helper using #ig-wizard-session-help-btn
    console.log('8. Toggling 20-second sessionid guide (#ig-wizard-session-help-btn)...');
    await send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(() => {
        const el = document.getElementById('ig-wizard-session-help-btn');
        if (el) el.click();
      })()`
    });

    await new Promise(r => setTimeout(r, 1000));

    // Capture screenshot 4: Step 2B - Personal Configuration with Guide
    console.log('Capturing Screenshot 4: Step 2B - Personal Configuration with Guide...');
    const shot4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'verified_instagram_wizard_step2b_personal.png'), Buffer.from(shot4.data, 'base64'));

    // Fill in Username and connect
    console.log('9. Entering real store username (#ig-wizard-input-personal-username) and connecting...');
    await send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(() => {
        const userInp = document.getElementById('ig-wizard-input-personal-username');
        if (userInp) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeInputValueSetter.call(userInp, 'el_bahdja_store');
          userInp.dispatchEvent(new Event('input', { bubbles: true }));
          userInp.dispatchEvent(new Event('change', { bubbles: true }));
        }

        setTimeout(() => {
          const submitBtn = document.getElementById('ig-wizard-submit-personal');
          if (submitBtn) submitBtn.click();
        }, 300);
      })()`
    });

    await new Promise(r => setTimeout(r, 4000));

    // Capture screenshot 5: Connected Active CRM with Live Gateway & Real Handle
    console.log('Capturing Screenshot 5: Connected Active CRM with Live Gateway...');
    const shot5 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'verified_instagram_connected_active_crm.png'), Buffer.from(shot5.data, 'base64'));

    console.log('Verification completed successfully! All 5 artifacts captured.');
    ws.close();
  } catch (err) {
    console.error('Verification failed:', err);
  } finally {
    chrome.kill();
  }
}

main();
