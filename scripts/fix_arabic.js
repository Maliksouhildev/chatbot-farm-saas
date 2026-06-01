const fs = require('fs');
const d = JSON.parse(fs.readFileSync('wsp.json'));

const nodes = [
  'Build Body: WA Voyageur1', 
  'Build Body: WA Pose Question1'
];

for (const name of nodes) {
  const n = d.nodes.find(x => x.name === name);
  if (n && n.parameters.jsCode) {
    n.parameters.jsCode = n.parameters.jsCode.replace(
      /text = text\.replace\(\/\\bt7ajer\\b\/gi, 'réserver'\);/g, 
      "text = text.replace(/\\bt7ajer\\b/gi, 'réserver');\ntext = text.replace(/[\\u0600-\\u06FF]/g, '');"
    );
  }
}

fs.writeFileSync('wsp.json', JSON.stringify(d, null, 2));
console.log('Arabic stripping added!');
