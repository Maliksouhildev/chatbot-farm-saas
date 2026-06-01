const http = require('http');

// ─── CONFIG ───────────────────────────────────────────────────────
const N8N_HOST    = 'localhost';
const N8N_PORT    = 5678;
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NGZkZDNmNS01MzE2LTRkYmEtYTBjZC0yNjBiMTY4NTBkYWEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2ODUzNDMwfQ.RrtNVjA5vwvNnlQztacbjkFNNI2lVCFFgbP6NWTe2RM';
const WEBHOOK_PATH = '/webhook/0c67bfb3-344d-43bb-9e3f-54058bf7ec45';
const TEST_USER_PHONE = '213999888777'; // Fake number to avoid collisions
const WA_PHONE_ID     = '1035565869637770';
const MAIN_WORKFLOW_ID = 'QOHXjLEGpudJ5cki'; // Important: restricts to wsp.json
// ──────────────────────────────────────────────────────────────────

let msgId = 30000;
const results = [];

function request(opts, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, json: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, raw: data }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(45000, () => { req.destroy(); reject(new Error('Timeout')); });
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

function n8nGet(path) {
  return request({
    host: N8N_HOST, port: N8N_PORT, path: '/api/v1' + path, method: 'GET',
    headers: { 'X-N8N-API-KEY': N8N_API_KEY, 'Accept': 'application/json' }
  });
}

function postWebhook(text) {
  const wamid = 'wamid.auto' + (++msgId);
  const payload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'AUTO_SIM',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: { display_phone_number: '123', phone_number_id: WA_PHONE_ID },
          contacts: [{ profile: { name: 'Auto Tester' }, wa_id: TEST_USER_PHONE }],
          messages: [{
            from: TEST_USER_PHONE, id: wamid,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            type: 'text', text: { body: text }
          }]
        },
        field: 'messages'
      }]
    }]
  };
  const body = JSON.stringify(payload);
  return request({
    host: N8N_HOST, port: N8N_PORT, path: WEBHOOK_PATH, method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  }, body).then(res => ({ res, wamid }));
}

const delay = ms => new Promise(r => setTimeout(r, ms));

async function getReplyText(sentAt, expectedWamid) {
  let attempts = 0;
  let execId = null;

  while (attempts < 15) {
    await delay(3000);
    const res = await n8nGet('/executions?limit=20');
    if (!res.json?.data) { attempts++; continue; }

    const execs = res.json.data.filter(e => 
      e.workflowId === MAIN_WORKFLOW_ID && 
      new Date(e.startedAt).getTime() >= sentAt - 2000
    );
    
    // Check which execution actually corresponds to our message
    for (const exec of execs) {
      if (!exec.finished) continue;
      const full = await n8nGet('/executions/' + exec.id + '?includeData=true');
      const runData = full.json?.data?.resultData?.runData;
      if (runData && runData['Webhook (Receive Message)']) {
         const whData = runData['Webhook (Receive Message)'][0]?.data?.main?.[0]?.[0]?.json?.body;
         const msgId = whData?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id;
         if (msgId === expectedWamid) {
           execId = exec.id;
           break;
         }
      }
    }
    
    if (execId) break;
    attempts++;
  }

  if (!execId) return "[TIMEOUT OR NO EXECUTION FOUND]";

  const full = await n8nGet('/executions/' + execId + '?includeData=true');
  const runData = full.json?.data?.resultData?.runData || {};
  const error = full.json?.data?.resultData?.error?.message;
  
  if (error) return `[CRASH: ${error}]`;

  // Look for our specific bot output nodes
  const buildBodyNodes = Object.keys(runData).filter(name =>
    name.includes('Build Body') || name.includes('WA ') || name.includes('Traduction') || name.includes('Basic LLM Chain')
  );

  let finalReply = "";
  for (const nodeName of buildBodyNodes) {
    const nodeRuns = runData[nodeName];
    if (!nodeRuns) continue;
    for (const run of nodeRuns) {
      const items = run?.data?.main?.[0] || [];
      for (const item of items) {
        // Translation direct output
        const output = item?.json?.output || item?.json?.text;
        if (output && typeof output === 'string' && output.length > 5 && (nodeName.includes('Traduction') || nodeName.includes('Basic LLM'))) {
          finalReply = output;
        }
        
        // Final WA payload
        const bodyStr = item?.json?.waBody || item?.json?.body;
        if (bodyStr && typeof bodyStr === 'string' && bodyStr.includes('"text"')) {
          try {
            const waMsg = JSON.parse(bodyStr);
            const text = waMsg?.text?.body || waMsg?.text;
            if (text && text.length > 5) finalReply = text;
          } catch {}
        }
      }
    }
  }

  return finalReply || "[NO TEXT EXTRACTED - Check Execution ID: " + execId + "]";
}

function checkDarjaQuality(text) {
  const flags = [];
  if (/\bwah\b/i.test(text)) flags.push('Contains "wah" (Moroccan)');
  if (/\b(qaddach|9addach)\b/i.test(text)) flags.push('Contains "9addach" (Eastern/Tunisian)');
  if (/\b3afak\b/i.test(text)) flags.push('Contains "3afak" (Banned)');
  if (/\bmzyan\b/i.test(text)) flags.push('Contains "mzyan" (Moroccan)');
  if (/\bdaba\b/i.test(text)) flags.push('Contains "daba" (Moroccan)');
  if (/[ا-ي]/.test(text)) flags.push('Contains Arabic script characters!');
  if (/\bq[aeiou]/i.test(text) && !/qua|que|qui|quo/.test(text)) flags.push('Possible q/9 error');
  if (/chambre\s+mli[^h]?h\b(?!a)/i.test(text)) flags.push('Gender error: chambre mlih');
  if (/\bt7ajer\b/i.test(text)) flags.push('Invented word: t7ajer');
  if (/\bsbath/i.test(text)) flags.push('Invented word: sbathom');
  if (text.includes('[CRASH')) flags.push('Workflow crashed');
  return flags;
}

async function runConv(name, messages) {
  console.log(`\n==================================================`);
  console.log(`💬 FLOW: ${name}`);
  console.log(`==================================================`);
  
  // Hard reset
  await postWebhook('reset');
  await delay(4000);

  for (const msg of messages) {
    console.log(`👨 User: ${msg}`);
    const sentAt = Date.now();
    const { wamid } = await postWebhook(msg);
    process.stdout.write(`⏳ Waiting for AI reply... `);
    
    const reply = await getReplyText(sentAt, wamid);
    console.log(`\n🤖 Bot : ${reply}`);
    
    const flags = checkDarjaQuality(reply);
    if (flags.length > 0) {
      console.log(`⚠️  Issues detected: ${flags.join(' | ')}`);
      results.push({ flow: name, user: msg, bot: reply, issues: flags });
    }
    console.log('');
    await delay(3000); // cooldown between messages
  }
}

async function main() {
  console.log('🚀 Starting Full Automated WhatsApp AI Simulation...\n');
  
  await runConv('1. Voyageur Darja Flow', [
    "Salam kho, rani n7awes 3la partma l kra",
    "lghedwa nchallah, 2 lilat",
    "hna 3"
  ]);

  await runConv('2. Proprietaire Darja Flow', [
    "salam, 3andi partma",
    "jay f hydra",
    "120m2 fiha 3 bit",
    "F4 w rahi disponible l sif jay nchallah"
  ]);

  await runConv('3. Language Switch Handling', [
    "Bonjour, je cherche un appartement",
    "ch7al souma t3ich", // sudden switch to Darja
  ]);

  await runConv('4. Edge Case (Out of Zone)', [
    "wesh rak, 3andi partma fi annaba",
  ]);

  console.log(`\n==================================================`);
  console.log(`📊 SIMULATION REPORT`);
  console.log(`==================================================`);
  if (results.length === 0) {
    console.log(`✅ ALL CLEAN! 0 Darja anomalies detected.`);
  } else {
    console.log(`❌ Found ${results.length} interactions with issues:\n`);
    results.forEach(r => {
      console.log(`[Flow: ${r.flow}]`);
      console.log(`User: ${r.user}`);
      console.log(`Bot:  ${r.bot}`);
      console.log(`Flag: ${r.issues.join(', ')}\n`);
    });
  }
}

main().catch(console.error);
