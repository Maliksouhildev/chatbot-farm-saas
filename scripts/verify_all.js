const fs = require('fs');
const d = JSON.parse(fs.readFileSync('wsp.json'));

let passed = 0;
let failed = 0;

function check(label, condition) {
    if (condition) {
        console.log('✅ ' + label);
        passed++;
    } else {
        console.log('❌ ' + label);
        failed++;
    }
}

// Check 1: CRM notification sends full prospect card
const waAdmin = d.nodes.find(n => n.name === 'WA Script Admin');
check('CRM notification contains Localisation', waAdmin.parameters.textBody.includes('Localisation'));
check('CRM notification contains Surface', waAdmin.parameters.textBody.includes('Surface'));
check('CRM notification contains Disponibilite', waAdmin.parameters.textBody.includes('Disponibilit'));

// Check 2: Anti-hallucination rule in Voyageur
const voy = d.nodes.find(n => n.name === 'Booking Agent (Voyageur)');
check('Anti-hallucination REGLE OR present', voy.parameters.options.systemMessage.includes("D'OR ABSOLUE"));
check('Anti-hallucination INTERDICTION present', voy.parameters.options.systemMessage.includes('inventer'));

// Check 3: Proportional escalade in all agents
const agents = ['Booking Agent (Voyageur)', 'Booking Agent (Proprietaire)', 'Agent Support Client'];
for (const name of agents) {
    const a = d.nodes.find(n => n.name === name);
    if (a) {
        check(name + ' — escalade proportionnelle', a.parameters.options.systemMessage.includes('Ne déclenche PAS'));
    }
}

// Check 4: Vocabulary fix (sifet banned)
const transNode = d.nodes.find(n => n.name === 'Basic LLM Chain');
const transMsg = transNode.parameters.messages.messageValues[0].message;
check('Translation node bans "sifet"', transMsg.includes('ab3atli') || transMsg.includes('b3atli'));

// Check 5: Language lock on "francais" keyword  
const langNode = d.nodes.find(n => n.name === 'Calculate Predominant Lang');
check('Language node has explicit francais lock', langNode.parameters.jsCode.includes('francais'));

// Check 6: Router handles proprietaire intent
const setCtx = d.nodes.find(n => n.name === 'Set Context');
check('Set Context hasNewIntent includes mettre en location', setCtx.parameters.jsCode.includes('mettre en location'));

// Check 7: Extractor handles "ga3 sif"
const extNode = d.nodes.find(n => n.name === 'Extract Appts State');
check('Extractor handles ga3 sif', extNode.parameters.jsonBody.includes('ga3 sif'));

// Check 8: Build Body firewall present
const buildBody = d.nodes.find(n => n.name === 'Build Body: WA Voyageur1');
check('Build Body has arabic sanitization', buildBody.parameters.jsCode.includes('u0600-u06FF') || buildBody.parameters.jsCode.includes('\\u0600'));

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`RÉSULTAT : ${passed} ✅  /  ${failed} ❌  tests`);
