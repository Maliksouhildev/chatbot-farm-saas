const fs = require('fs');
const d = JSON.parse(fs.readFileSync('wsp.json'));

const langNode = d.nodes.find(n => n.name === 'Calculate Predominant Lang');
if (langNode && langNode.parameters.jsCode) {
    langNode.parameters.jsCode = langNode.parameters.jsCode.replace(
        "if (text.includes('salam') || text.includes('kho') || text.includes('nekri') || text.includes('rani') || text.includes('partma') || text.includes('lghedoua')) {",
        "const hasArabicChars = /[\\u0600-\\u06FF]/.test(text);\n    if (hasArabicChars) {\n        stats['Arabe Classique'] = 10;\n    } else if (text.includes('salam') || text.includes('kho') || text.includes('nekri') || text.includes('rani') || text.includes('partma') || text.includes('lghedoua') || text.includes('ghedoua') || text.includes('ghedwa') || text.includes('nchallah') || text.includes('waktach') || text.includes('chhal') || text.includes('ch7al') || text.includes('mlih')) {"
    );
}

fs.writeFileSync('wsp.json', JSON.stringify(d, null, 2));
console.log('Language initialization updated!');
