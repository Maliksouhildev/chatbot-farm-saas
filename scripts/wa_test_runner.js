/**
 * WhatsApp Bot Automated Test Runner
 * ====================================
 * Fires real WhatsApp-shaped webhook payloads at your n8n instance
 * and logs what the bot responded with (or errors).
 *
 * Usage:
 *   1. Set N8N_URL and YOUR_PHONE below
 *   2. node wa_test_runner.js
 *   3. Watch the n8n execution logs in parallel if you want full detail
 */

const https = require('https');
const http = require('http');

// ─── CONFIG — FILL THESE IN ───────────────────────────────────────
const N8N_HOST = 'localhost';           // your n8n host (or domain without https://)
const N8N_PORT = 5678;                  // your n8n port
const N8N_HTTPS = false;               // set true if your n8n is on HTTPS
const WEBHOOK_PATH = '/webhook/0c67bfb3-344d-43bb-9e3f-54058bf7ec45';
const WA_PHONE_NUMBER_ID = '1035565869637770'; // your WA Business phone ID
const TEST_USER_PHONE = '213551671229'; // your own number (receives the bot replies)
const DELAY_MS = 4000;                 // wait between messages (let debounce settle)
// ──────────────────────────────────────────────────────────────────

let msgIdCounter = 1000;
let testsPassed = 0;
let testsFailed = 0;
const results = [];

function makePayload(text, type = 'text', extras = {}) {
  const msgId = 'wamid.test' + (++msgIdCounter);
  const base = {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'ENTRY_ID',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: { display_phone_number: '123', phone_number_id: WA_PHONE_NUMBER_ID },
          contacts: [{ profile: { name: 'Test User' }, wa_id: TEST_USER_PHONE }],
          messages: [{
            from: TEST_USER_PHONE,
            id: msgId,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            type: type,
            ...(type === 'text' ? { text: { body: text } } : {}),
            ...(type === 'audio' ? { audio: { id: 'fake_audio_id_123', mime_type: 'audio/ogg; codecs=opus' } } : {}),
            ...(type === 'image' ? { image: { id: 'fake_image_id_123', mime_type: 'image/jpeg', caption: text } } : {}),
            ...extras
          }]
        },
        field: 'messages'
      }]
    }]
  };
  return base;
}

function post(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const options = {
      host: N8N_HOST,
      port: N8N_PORT,
      path: WEBHOOK_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = (N8N_HTTPS ? https : http).request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(body);
    req.end();
  });
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runTest(name, messageFn, expectFn) {
  process.stdout.write(`  Testing: ${name} ... `);
  try {
    const payload = messageFn();
    const res = await post(payload);
    const passed = expectFn(res);
    if (passed) {
      console.log('✅ PASS');
      testsPassed++;
      results.push({ name, status: 'PASS', http: res.status });
    } else {
      console.log(`❌ FAIL (HTTP ${res.status}, body: ${res.body.substring(0, 100)})`);
      testsFailed++;
      results.push({ name, status: 'FAIL', http: res.status, body: res.body.substring(0, 200) });
    }
  } catch(e) {
    console.log(`❌ ERROR: ${e.message}`);
    testsFailed++;
    results.push({ name, status: 'ERROR', error: e.message });
  }
}

// Expect n8n webhook to accept the payload (200 or 200-level)
const expectAccepted = (res) => res.status >= 200 && res.status < 400;

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║      WhatsApp Bot Automated Test Runner              ║');
  console.log(`║  Target: ${N8N_HTTPS ? 'https' : 'http'}://${N8N_HOST}:${N8N_PORT}${WEBHOOK_PATH.substring(0, 20)}...  ║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // ── GROUP 1: Basic text routing ─────────────────────────────────
  console.log('GROUP 1: Basic text routing');

  await runTest('Reset command', () => makePayload('reset'), expectAccepted);
  await delay(DELAY_MS);

  await runTest('French greeting → voyageur path', () => makePayload('Bonjour, je cherche un appartement'), expectAccepted);
  await delay(DELAY_MS);

  await runTest('Darja greeting → should NOT hit Darija wall', () => makePayload('Salam kho labas'), expectAccepted);
  await delay(DELAY_MS);

  await runTest('English message', () => makePayload('Hello I need an apartment for tomorrow'), expectAccepted);
  await delay(DELAY_MS);

  // ── GROUP 2: Proprietaire path ──────────────────────────────────
  console.log('\nGROUP 2: Propriétaire path');

  await runTest('Reset before proprietaire test', () => makePayload('reset'), expectAccepted);
  await delay(DELAY_MS);

  await runTest('Proprietaire intent — French', () => makePayload('Bonjour, j\'ai un appartement à louer'), expectAccepted);
  await delay(DELAY_MS);

  await runTest('Proprietaire intent — Darja', () => makePayload('3andi partma habi nekri'), expectAccepted);
  await delay(DELAY_MS);

  // ── GROUP 3: Voyageur flow ──────────────────────────────────────
  console.log('\nGROUP 3: Voyageur booking flow');

  await runTest('Reset', () => makePayload('reset'), expectAccepted);
  await delay(DELAY_MS);

  await runTest('Voyageur: looking for apartment', () => makePayload('Je cherche un appartement pour demain'), expectAccepted);
  await delay(DELAY_MS * 2);

  await runTest('Voyageur: provide dates (1 night)', () => makePayload('1 nuit'), expectAccepted);
  await delay(DELAY_MS);

  await runTest('Voyageur: provide guests', () => makePayload('2 personnes'), expectAccepted);
  await delay(DELAY_MS);

  // ── GROUP 4: Language detection edge cases ───────────────────────
  console.log('\nGROUP 4: Language detection edge cases');

  await runTest('Mixed Darja+French → should not escalate', () => makePayload('Salam, je cherche un appart'), expectAccepted);
  await delay(DELAY_MS);

  await runTest('Short reply (oui)', () => makePayload('oui'), expectAccepted);
  await delay(DELAY_MS);

  await runTest('Short reply (non)', () => makePayload('non'), expectAccepted);
  await delay(DELAY_MS);

  await runTest('Number reply (2)', () => makePayload('2'), expectAccepted);
  await delay(DELAY_MS);

  // ── GROUP 5: Audio message ──────────────────────────────────────
  console.log('\nGROUP 5: Audio message handling');

  await runTest('Audio message → should not crash (will fail on fake media ID)', 
    () => makePayload('', 'audio'),
    (res) => res.status < 500  // 4xx acceptable (fake media ID), 5xx = real crash
  );
  await delay(DELAY_MS);

  // ── GROUP 6: Image message ──────────────────────────────────────
  console.log('\nGROUP 6: Image message handling');

  await runTest('Image message → should not crash (will fail on fake media ID)',
    () => makePayload('', 'image'),
    (res) => res.status < 500
  );
  await delay(DELAY_MS);

  // ── GROUP 7: Zone detection ─────────────────────────────────────
  console.log('\nGROUP 7: Zone detection');

  await runTest('Reset', () => makePayload('reset'), expectAccepted);
  await delay(DELAY_MS);

  await runTest('In-zone city (Alger)', () => makePayload('J\'ai un appartement à Alger'), expectAccepted);
  await delay(DELAY_MS);

  await runTest('Reset', () => makePayload('reset'), expectAccepted);
  await delay(DELAY_MS);

  await runTest('Out-of-zone city (Oran) → should escalate', () => makePayload('J\'ai un appartement à Oran'), expectAccepted);
  await delay(DELAY_MS);

  // ── SUMMARY ────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log(`║  RESULTS: ${testsPassed} passed, ${testsFailed} failed out of ${testsPassed + testsFailed} tests`);
  console.log('╚══════════════════════════════════════════════════════╝');

  if (testsFailed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => r.status !== 'PASS').forEach(r => {
      console.log(`  - ${r.name}: ${r.status}${r.error ? ' → ' + r.error : ''}`);
      if (r.body) console.log(`    Response: ${r.body}`);
    });
  }

  console.log('\n⚠️  NOTE: "PASS" here means the webhook accepted the payload without crashing.');
  console.log('   Check n8n execution logs to verify the bot\'s actual responses were correct.');
  console.log('   Audio/image tests expect 4xx (fake media ID) — 5xx would mean a real crash.\n');
}

main().catch(console.error);
