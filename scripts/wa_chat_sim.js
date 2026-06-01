/**
 * WhatsApp Bot Conversation Simulator
 * =====================================
 * Lets you chat with your bot in the terminal and SEE its replies.
 * Works by firing webhook payloads at n8n, then reading the execution
 * data via the n8n API to extract what the bot sent to WhatsApp.
 *
 * SETUP:
 *   1. In n8n: Settings → API Keys → Create a key → paste below
 *   2. node wa_chat_sim.js
 */

const https = require('https');
const http = require('http');
const readline = require('readline');

// ─── CONFIG ───────────────────────────────────────────────────────
const N8N_HOST = 'localhost';
const N8N_PORT = 5678;
const N8N_HTTPS = false;
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NGZkZDNmNS01MzE2LTRkYmEtYTBjZC0yNjBiMTY4NTBkYWEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2ODUzNDMwfQ.RrtNVjA5vwvNnlQztacbjkFNNI2lVCFFgbP6NWTe2RM'; // Settings → API Keys
const WEBHOOK_PATH = '/webhook/0c67bfb3-344d-43bb-9e3f-54058bf7ec45';
const TEST_USER_PHONE = '213551671229';
const WA_PHONE_ID = '1035565869637770';
const POLL_WAIT_MS = 6000;  // how long to wait for n8n to finish before reading result
// ──────────────────────────────────────────────────────────────────

let msgId = 9000;

// ── HTTP helpers ──────────────────────────────────────────────────
function request(opts, body = null) {
  return new Promise((resolve, reject) => {
    const lib = N8N_HTTPS ? https : http;
    const req = lib.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, json: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, raw: data }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

function n8nGet(path) {
  return request({
    host: N8N_HOST, port: N8N_PORT,
    path: '/api/v1' + path,
    method: 'GET',
    headers: { 'X-N8N-API-KEY': N8N_API_KEY, 'Accept': 'application/json' }
  });
}

function postWebhook(payload) {
  const body = JSON.stringify(payload);
  return request({
    host: N8N_HOST, port: N8N_PORT, path: WEBHOOK_PATH,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  }, body);
}

// ── Build a WhatsApp text message payload ─────────────────────────
function makeTextPayload(text) {
  return {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'SIM_ENTRY',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: { display_phone_number: '123', phone_number_id: WA_PHONE_ID },
          contacts: [{ profile: { name: 'Simulator User' }, wa_id: TEST_USER_PHONE }],
          messages: [{
            from: TEST_USER_PHONE,
            id: 'wamid.sim' + (++msgId),
            timestamp: Math.floor(Date.now() / 1000).toString(),
            type: 'text',
            text: { body: text }
          }]
        },
        field: 'messages'
      }]
    }]
  };
}

// ── Extract bot reply from n8n execution data ─────────────────────
function extractBotReply(execution) {
  // Walk through all node run data looking for WhatsApp message bodies
  const runData = execution?.data?.resultData?.runData || {};

  // Nodes that build the WhatsApp message body
  const buildBodyNodes = Object.keys(runData).filter(name =>
    name.includes('Build Body') || name.includes('WA ') || name.includes('Traduction')
  );

  const messages = [];

  for (const nodeName of buildBodyNodes) {
    const nodeRuns = runData[nodeName];
    if (!nodeRuns) continue;
    for (const run of nodeRuns) {
      const items = run?.data?.main?.[0] || [];
      for (const item of items) {
        // Build Body nodes output a 'body' field with JSON string
        const bodyStr = item?.json?.body;
        if (bodyStr && typeof bodyStr === 'string' && bodyStr.includes('"text"')) {
          try {
            const waMsg = JSON.parse(bodyStr);
            const text = waMsg?.text?.body || waMsg?.text;
            if (text && text.length > 2) {
              messages.push({ node: nodeName, text });
            }
          } catch { }
        }
        // Translation nodes output 'output' field
        const output = item?.json?.output || item?.json?.text;
        if (output && typeof output === 'string' && output.length > 5 && nodeName.includes('Traduction')) {
          messages.push({ node: nodeName, text: output });
        }
      }
    }
  }

  // Deduplicate and prefer translated versions
  const seen = new Set();
  const unique = messages.filter(m => {
    if (seen.has(m.text)) return false;
    seen.add(m.text);
    return true;
  });

  return unique;
}

// ── Get latest execution for this workflow ─────────────────────────
async function getLatestExecution(after) {
  // List recent executions
  const res = await n8nGet('/executions?limit=5&status=success,error,running');
  if (!res.json?.data) return null;

  // Find the most recent one triggered after our webhook call
  const execs = res.json.data
    .filter(e => new Date(e.startedAt).getTime() > after - 1000)
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

  if (execs.length === 0) return null;

  // Get full execution data
  const full = await n8nGet('/executions/' + execs[0].id);
  return full.json;
}

// ── Main chat loop ────────────────────────────────────────────────
async function main() {
  // Check API key
  if (N8N_API_KEY === 'PASTE_YOUR_N8N_API_KEY_HERE') {
    console.log('\n❌ ERROR: You need to set your n8n API key first.');
    console.log('   Go to: n8n → Settings → API Keys → Create');
    console.log('   Then paste it in wa_chat_sim.js at the N8N_API_KEY line.\n');
    process.exit(1);
  }

  // Test connection
  try {
    const test = await n8nGet('/workflows?limit=1');
    if (test.status !== 200) throw new Error('HTTP ' + test.status);
  } catch (e) {
    console.log('\n❌ Cannot connect to n8n API:', e.message);
    console.log('   Make sure n8n is running and the API key is correct.\n');
    process.exit(1);
  }

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║         WhatsApp Bot — Conversation Simulator            ║');
  console.log('║  Type messages below. The bot will reply. Type "exit".   ║');
  console.log('║  Type "reset" to clear bot memory.                       ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  console.log('🔍 Checking: Language quality, Darja accuracy, tool usage, routing\n');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = () => rl.question('You: ', async (input) => {
    input = input.trim();
    if (!input) { ask(); return; }
    if (input.toLowerCase() === 'exit') { rl.close(); return; }

    const sentAt = Date.now();
    const payload = makeTextPayload(input);

    process.stdout.write('⏳ Sending...\r');

    try {
      // Fire the webhook
      const webhookRes = await postWebhook(payload);
      if (webhookRes.status >= 500) {
        console.log(`❌ Webhook error (HTTP ${webhookRes.status}) — workflow crashed before routing`);
        ask(); return;
      }

      // Wait for n8n to process (debounce + AI call)
      process.stdout.write(`⏳ Waiting for bot (${POLL_WAIT_MS / 1000}s)...\r`);
      await new Promise(r => setTimeout(r, POLL_WAIT_MS));

      // Read execution
      const exec = await getLatestExecution(sentAt);

      if (!exec) {
        console.log('⚠️  Bot: [No execution found — check n8n manually]');
        ask(); return;
      }

      // Extract messages
      const replies = extractBotReply(exec);

      if (replies.length === 0) {
        const status = exec?.status || 'unknown';
        const error = exec?.data?.resultData?.error?.message;
        if (error) {
          console.log(`❌ Bot ERROR: ${error}`);
        } else {
          console.log(`⚠️  Bot: [${status} — no text message extracted. Check n8n execution #${exec?.id}]`);
        }
      } else {
        // Show the final translated message (last one = after translation)
        const finalMsg = replies[replies.length - 1];
        console.log(`\n🤖 Bot [${finalMsg.node}]:\n${finalMsg.text}\n`);

        // Quality flags — auto-detect common issues
        const text = finalMsg.text;
        const flags = [];
        if (/\bwah\b/i.test(text)) flags.push('⚠️  Contains "wah" (should be "ih")');
        if (/\b(qaddach|9addach)\b/i.test(text)) flags.push('⚠️  Contains "9addach" (should be "ch7al")');
        if (/\b3afak\b/i.test(text)) flags.push('⚠️  Contains "3afak" (banned — use stp/t3ich)');
        if (/\bmzyan\b/i.test(text)) flags.push('⚠️  Contains "mzyan" (Moroccan — use mlih)');
        if (/\bdaba\b/i.test(text)) flags.push('⚠️  Contains "daba" (Moroccan — use deba)');
        if (/[ا-ي]/.test(text)) flags.push('❌  Contains Arabic script characters!');
        if (/\bq[aeiou]/i.test(text) && !/qua|que|qui|quo/.test(text)) flags.push('⚠️  Possible q/9 error (check)');
        if (/chambre\s+mli[^h]?h\b(?!a)/i.test(text)) flags.push('⚠️  Gender error: "chambre mlih" → should be "chambre milha"');
        if (/\bt7ajer\b/i.test(text)) flags.push('❌  "t7ajer" (invented word — use t7ajez)');
        if (/\bsbath/i.test(text)) flags.push('❌  "sbath/sbathom" (invented word)');
        if (flags.length > 0) {
          console.log('Quality flags:');
          flags.forEach(f => console.log('  ' + f));
          console.log('');
        }

        // Show route taken
        const routeNodes = Object.keys(exec?.data?.resultData?.runData || {});
        const isVoyageur = routeNodes.some(n => n.includes('Voyageur'));
        const isProprietaire = routeNodes.some(n => n.includes('Proprietaire') || n.includes('Pose Question'));
        const isDarja = routeNodes.some(n => n.includes('Darja'));
        const hasTranslation = routeNodes.some(n => n.includes('Traduction'));
        console.log(`📍 Route: ${isVoyageur ? '🏖 Voyageur' : isProprietaire ? '🏠 Propriétaire' : '❓ Unknown'} | Translation: ${hasTranslation ? '✅' : '❌ (no translation ran)'} | Darja path: ${isDarja ? '⚠️ escalated' : '✅ ok'}\n`);
      }
    } catch (e) {
      console.log(`❌ Error: ${e.message}`);
    }

    ask();
  });

  ask();
}

main().catch(console.error);
