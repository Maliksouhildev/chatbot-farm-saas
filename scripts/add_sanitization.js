const fs = require('fs');
const d = JSON.parse(fs.readFileSync('wsp.json'));

const voyageur = d.nodes.find(n => n.name === 'Build Body: WA Voyageur1');
if (voyageur) {
    voyageur.parameters.jsCode = voyageur.parameters.jsCode.replace(
        'const text = items[0].json.output || items[0].json.text || "";',
        `let text = items[0].json.output || items[0].json.text || "";\n\n// HARD SANITIZATION FIREWALL\ntext = text.replace(/\\b3afak\\b/gi, 't3ich');\ntext = text.replace(/\\b[q9]addach\\b/gi, 'ch7al');\ntext = text.replace(/\\bmzyan\\b/gi, 'mlih');\ntext = text.replace(/\\bdaba\\b/gi, 'deba');\ntext = text.replace(/\\bt9al[b]?chi\\b/gi, 'tdawwer');\ntext = text.replace(/\\bwah\\b/gi, 'ih');\ntext = text.replace(/\\bm3oul\\b/gi, 'prévu');\ntext = text.replace(/\\bt7ajer\\b/gi, 'réserver');`
    );
}

const poseQuestion = d.nodes.find(n => n.name === 'Build Body: WA Pose Question1');
if (poseQuestion) {
    poseQuestion.parameters.jsCode = poseQuestion.parameters.jsCode.replace(
        'const text = items[0].json.output || items[0].json.text || "";',
        `let text = items[0].json.output || items[0].json.text || "";\n\n// HARD SANITIZATION FIREWALL\ntext = text.replace(/\\b3afak\\b/gi, 't3ich');\ntext = text.replace(/\\b[q9]addach\\b/gi, 'ch7al');\ntext = text.replace(/\\bmzyan\\b/gi, 'mlih');\ntext = text.replace(/\\bdaba\\b/gi, 'deba');\ntext = text.replace(/\\bt9al[b]?chi\\b/gi, 'tdawwer');\ntext = text.replace(/\\bwah\\b/gi, 'ih');\ntext = text.replace(/\\bm3oul\\b/gi, 'prévu');\ntext = text.replace(/\\bt7ajer\\b/gi, 'réserver');`
    );
}

fs.writeFileSync('wsp.json', JSON.stringify(d, null, 2));
console.log('Sanitization added!');
