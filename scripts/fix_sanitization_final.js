const fs = require('fs');
const d = JSON.parse(fs.readFileSync('wsp.json'));

// The inject_smart_sanitization.js ran, but this node still has the old simple firewall
// (without arabic chars strip). Re-inject the smart version with Arabic strip.

const buildBodyNames = [
  'Build Body: WA Voyageur1',
  'Build Body: WA Pose Question1',
  'Build Body: WA Refus1',
  'Build Body: WA Demande Photos Init',
  'Build Body: WA Message Support1',
  'Build Body: WA Eval Photos1'
];

for (const name of buildBodyNames) {
    const n = d.nodes.find(x => x.name === name);
    if (!n || !n.parameters.jsCode) continue;

    let code = n.parameters.jsCode;

    // Remove any existing sanitization block (old or new)
    code = code.replace(/\/\/ HARD SANITIZATION FIREWALL[\s\S]*?text = text\.replace\(.*?u06FF.*?\);\n/g, '');
    code = code.replace(/let lang[\s\S]*?}\n\/\/\s*Language lock end/g, '');

    // Remove old partial block without arabic
    code = code.replace(/\/\/ HARD SANITIZATION FIREWALL\n(text = text\.replace[^\n]*\n)+/, '');

    // Build the smart sanitization block
    const smartBlock = `
// SMART SANITIZATION FIREWALL
let _lang = "Français";
try { _lang = $('Set Context').first().json.langue_utilisateur; } catch(e) {}

if (_lang === 'Darja Algéroise') {
    text = text.replace(/\\b3afak\\b/gi, 't3ich');
    text = text.replace(/\\b[q9]addach\\b/gi, 'ch7al');
    text = text.replace(/\\bmzyan\\b/gi, 'mlih');
    text = text.replace(/\\bdaba\\b/gi, 'deba');
    text = text.replace(/\\bt9al[b]?chi\\b/gi, 'tdawwer');
    text = text.replace(/\\bwah\\b/gi, 'ih');
    text = text.replace(/\\bm3oul\\b/gi, 'prévu');
    text = text.replace(/\\bt7ajer\\b/gi, 'réserver');
    text = text.replace(/[\\u0600-\\u06FF]/g, '');
}
`;

    // Inject right before "const payload"
    if (!code.includes('SMART SANITIZATION FIREWALL')) {
        code = code.replace('const payload = JSON.stringify({', smartBlock + '\nconst payload = JSON.stringify({');
    }

    n.parameters.jsCode = code;
}

fs.writeFileSync('wsp.json', JSON.stringify(d, null, 2));
console.log('✅ Smart sanitization re-injected into all Build Body nodes');
