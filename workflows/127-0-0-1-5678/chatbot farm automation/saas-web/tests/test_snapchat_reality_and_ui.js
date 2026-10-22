const assert = require('assert');
const http = require('http');

function httpGet(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', reject);
  });
}

function httpPost(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(`http://localhost:3000${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING SNAPCHAT REALITY & UI TEST SUITE ---');

  // Test 1: GET /api/channels/snapchat/chats returns realistic contacts
  console.log('\n[Test 1] Testing GET /api/channels/snapchat/chats');
  const chatsRes = await httpGet('/api/channels/snapchat/chats');
  assert.strictEqual(chatsRes.status, 200, 'Expected status 200');
  assert.strictEqual(chatsRes.body.success, true, 'Expected success: true');
  assert.strictEqual(chatsRes.body.channelId, 'snapchat', 'Expected channelId: snapchat');
  assert(Array.isArray(chatsRes.body.chats), 'Expected chats array');
  assert(chatsRes.body.chats.length >= 5, `Expected at least 5 chats, got ${chatsRes.body.chats.length}`);

  const yacine = chatsRes.body.chats.find(c => c.name.includes('Yacine'));
  assert(yacine, 'Expected contact Yacine Snap');
  assert(yacine.phone && yacine.phone.includes('+213'), `Expected Algerian phone number, got ${yacine.phone}`);
  assert(yacine.username && yacine.username.startsWith('@'), `Expected Snapchat handle, got ${yacine.username}`);
  assert(yacine.profilePicUrl && yacine.profilePicUrl.startsWith('http'), 'Expected realistic avatar photo URL');
  assert(yacine.statusText && yacine.statusText.includes('🔥'), 'Expected Snapchat streak indicator');
  assert(Array.isArray(yacine.messages) && yacine.messages.length > 0, 'Expected realistic message history');
  console.log('✓ PASS: GET /api/channels/snapchat/chats returns rich contacts with Algerian numbers, Bitmojis & Streaks');

  // Test 2: GET /api/channels/snapchat/messages returns conversation messages
  console.log('\n[Test 2] Testing GET /api/channels/snapchat/messages?chatId=snap_yacine');
  const msgsRes = await httpGet('/api/channels/snapchat/messages?chatId=snap_yacine');
  assert.strictEqual(msgsRes.status, 200, 'Expected status 200');
  assert.strictEqual(msgsRes.body.success, true, 'Expected success: true');
  assert(Array.isArray(msgsRes.body.messages), 'Expected messages array');
  assert(msgsRes.body.messages.length >= 3, `Expected at least 3 messages, got ${msgsRes.body.messages.length}`);
  console.log('✓ PASS: GET /api/channels/snapchat/messages returns message history for contact');

  // Test 3: POST /api/channels/snapchat/send dispatches live message
  console.log('\n[Test 3] Testing POST /api/channels/snapchat/send');
  const sendRes = await httpPost('/api/channels/snapchat/send', {
    chatId: 'snap_yacine',
    text: 'Test live message Snapchat delivery confirmation',
  });
  assert.strictEqual(sendRes.status, 200, 'Expected status 200');
  assert.strictEqual(sendRes.body.status, 'delivered', 'Expected status: delivered');
  assert.strictEqual(sendRes.body.channelId, 'snapchat', 'Expected channelId: snapchat');
  console.log('✓ PASS: POST /api/channels/snapchat/send dispatches message successfully');

  // Test 4: POST /api/channels/snapchat/messages appends to conversation
  console.log('\n[Test 4] Testing POST /api/channels/snapchat/messages');
  const postMsgRes = await httpPost('/api/channels/snapchat/messages', {
    chatId: 'snap_yacine',
    text: 'Salam Yacine, commande confirmée ! 🔥',
  });
  assert.strictEqual(postMsgRes.status, 200, 'Expected status 200');
  assert.strictEqual(postMsgRes.body.success, true, 'Expected success: true');
  assert.strictEqual(postMsgRes.body.status, 'delivered', 'Expected delivered status');

  const checkMsgsRes = await httpGet('/api/channels/snapchat/messages?chatId=snap_yacine');
  const lastMsg = checkMsgsRes.body.messages[checkMsgsRes.body.messages.length - 1];
  assert.strictEqual(lastMsg.text, 'Salam Yacine, commande confirmée ! 🔥', 'Expected message to be appended');
  console.log('✓ PASS: POST /api/channels/snapchat/messages appends message to active discussion');

  // Test 5: Dynamic Add Contact POST /api/channels/snapchat/chats
  console.log('\n[Test 5] Testing POST /api/channels/snapchat/chats (Dynamic add)');
  const addContactRes = await httpPost('/api/channels/snapchat/chats', {
    name: 'Karim Snap Test',
    username: '@karim_dz23',
    phone: '+213 661 99 88 77',
    initialMessage: 'Salam, premier message Snapchat test !',
  });
  assert.strictEqual(addContactRes.status, 200, 'Expected status 200');
  assert.strictEqual(addContactRes.body.success, true, 'Expected success: true');
  assert(addContactRes.body.contact, 'Expected contact returned');
  assert.strictEqual(addContactRes.body.contact.name, 'Karim Snap Test', 'Expected correct name');
  assert.strictEqual(addContactRes.body.contact.username, '@karim_dz23', 'Expected correct username');

  const verifyNewChat = await httpGet('/api/channels/snapchat/chats');
  const foundNew = verifyNewChat.body.chats.find(c => c.name === 'Karim Snap Test');
  assert(foundNew, 'Expected dynamically added contact in chats list');
  console.log('✓ PASS: POST /api/channels/snapchat/chats creates new contact dynamically');

  // Test 6: POST /api/channels/snapchat/verify
  console.log('\n[Test 6] Testing POST /api/channels/snapchat/verify (QR & SMS verification)');
  const verifyRes = await httpPost('/api/channels/snapchat/verify', {
    method: 'sms',
    phone: '+213 551 67 12 29',
    code: '749182',
    username: '@snap_merchant_dz',
  });
  assert.strictEqual(verifyRes.status, 200, 'Expected status 200');
  assert.strictEqual(verifyRes.body.success, true, 'Expected success: true');
  assert.strictEqual(verifyRes.body.channelId, 'snapchat', 'Expected channelId: snapchat');
  assert(verifyRes.body.account.verified, 'Expected verified: true');
  console.log('✓ PASS: POST /api/channels/snapchat/verify validates authentication flow');

  console.log('\n🎉 ALL 6 SNAPCHAT TESTS PASSED SUCCESSFULLY! 🎉\n');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
