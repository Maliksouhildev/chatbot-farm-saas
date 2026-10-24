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
  console.log('--- STARTING VIBER REALITY & UI TEST SUITE ---');

  // Test 1: GET /api/channels/viber/chats returns realistic contacts
  console.log('\n[Test 1] Testing GET /api/channels/viber/chats');
  const chatsRes = await httpGet('/api/channels/viber/chats');
  assert.strictEqual(chatsRes.status, 200, 'Expected status 200');
  assert.strictEqual(chatsRes.body.success, true, 'Expected success: true');
  assert.strictEqual(chatsRes.body.channelId, 'viber', 'Expected channelId: viber');
  assert(Array.isArray(chatsRes.body.chats), 'Expected chats array');
  assert(chatsRes.body.chats.length >= 5, `Expected at least 5 chats, got ${chatsRes.body.chats.length}`);

  const sofiane = chatsRes.body.chats.find(c => c.name.includes('Sofiane'));
  assert(sofiane, 'Expected contact Sofiane Benali');
  assert(sofiane.phone.includes('+213'), `Expected Algerian phone number, got ${sofiane.phone}`);
  assert(sofiane.profilePicUrl && sofiane.profilePicUrl.startsWith('http'), 'Expected realistic avatar photo URL');
  assert(Array.isArray(sofiane.messages) && sofiane.messages.length > 0, 'Expected realistic message history');
  console.log('✓ PASS: GET /api/channels/viber/chats returns rich contacts with Algerian numbers & avatars');

  // Test 2: GET /api/channels/viber/messages returns conversation messages
  console.log('\n[Test 2] Testing GET /api/channels/viber/messages?chatId=vib_sofiane');
  const msgsRes = await httpGet('/api/channels/viber/messages?chatId=vib_sofiane');
  assert.strictEqual(msgsRes.status, 200, 'Expected status 200');
  assert.strictEqual(msgsRes.body.success, true, 'Expected success: true');
  assert(Array.isArray(msgsRes.body.messages), 'Expected messages array');
  assert(msgsRes.body.messages.length >= 3, `Expected at least 3 messages, got ${msgsRes.body.messages.length}`);
  console.log('✓ PASS: GET /api/channels/viber/messages returns message history for contact');

  // Test 3: POST /api/channels/viber/send dispatches live message
  console.log('\n[Test 3] Testing POST /api/channels/viber/send');
  const sendRes = await httpPost('/api/channels/viber/send', {
    chatId: 'vib_sofiane',
    text: 'Test live message Viber delivery confirmation',
  });
  assert.strictEqual(sendRes.status, 200, 'Expected status 200');
  assert.strictEqual(sendRes.body.status, 'delivered', 'Expected status: delivered');
  assert.strictEqual(sendRes.body.channelId, 'viber', 'Expected channelId: viber');
  console.log('✓ PASS: POST /api/channels/viber/send dispatches message successfully');

  // Test 4: POST /api/channels/viber/messages appends to conversation
  console.log('\n[Test 4] Testing POST /api/channels/viber/messages');
  const postMsgRes = await httpPost('/api/channels/viber/messages', {
    chatId: 'vib_sofiane',
    text: 'Merci Sofiane pour votre commande !',
  });
  assert.strictEqual(postMsgRes.status, 200, 'Expected status 200');
  assert.strictEqual(postMsgRes.body.success, true, 'Expected success: true');
  assert.strictEqual(postMsgRes.body.status, 'delivered', 'Expected delivered status');

  const checkMsgsRes = await httpGet('/api/channels/viber/messages?chatId=vib_sofiane');
  const lastMsg = checkMsgsRes.body.messages[checkMsgsRes.body.messages.length - 1];
  assert.strictEqual(lastMsg.text, 'Merci Sofiane pour votre commande !', 'Expected message to be appended');
  console.log('✓ PASS: POST /api/channels/viber/messages appends message to active discussion');

  // Test 5: Dynamic Add Contact POST /api/channels/viber/chats
  console.log('\n[Test 5] Testing dynamic contact creation via POST /api/channels/viber/chats');
  const addContactRes = await httpPost('/api/channels/viber/chats', {
    name: 'Karim E-Shop',
    phone: '+213 555 88 44 22',
    initialMessage: 'Salam khoya, bienvenue sur mon Viber !',
  });
  assert.strictEqual(addContactRes.status, 200, 'Expected status 200');
  assert.strictEqual(addContactRes.body.success, true, 'Expected success: true');
  assert(addContactRes.body.contact && addContactRes.body.contact.id, 'Expected contact object with ID');
  assert.strictEqual(addContactRes.body.contact.phone, '+213 555 88 44 22', 'Expected matching phone');
  console.log('✓ PASS: POST /api/channels/viber/chats successfully creates new Viber contact');

  // Test 6: Verify Phone Pairing Route
  console.log('\n[Test 6] Testing POST /api/channels/viber/verify with phone pairing');
  const verifyRes = await httpPost('/api/channels/viber/verify', {
    phone: '0551671229',
  });
  assert.strictEqual(verifyRes.status, 200, 'Expected status 200');
  assert.strictEqual(verifyRes.body.success, true, 'Expected success: true');
  assert.strictEqual(verifyRes.body.account.phone, '0551671229', 'Expected user phone number in account');
  console.log('✓ PASS: Viber verify route connects phone number directly');

  console.log('\n=======================================');
  console.log('ALL 6 VIBER TESTS PASSED WITH 100% SUCCESS!');
  console.log('=======================================');
}

runTests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
