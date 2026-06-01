const fs = require('fs');
const d = JSON.parse(fs.readFileSync('wsp.json'));

const brain = d.nodes.find(n => n.name === 'The Brain (Moyenne & Message)');
if (brain && brain.parameters.jsCode) {
    // We want to make sure the apptStateStr parsing is robust
    if (brain.parameters.jsCode.includes('apptStateStr = Object.values(apptStateInputJson)[0] || "[]";')) {
        brain.parameters.jsCode = brain.parameters.jsCode.replace(
            'apptStateStr = Object.values(apptStateInputJson)[0] || "[]";',
            'apptStateStr = apptStateInputJson.value || apptStateInputJson.data || apptStateInputJson.propertyName || Object.values(apptStateInputJson)[0] || "[]";'
        );
    }
}

fs.writeFileSync('wsp.json', JSON.stringify(d, null, 2));
console.log('Brain updated!');
