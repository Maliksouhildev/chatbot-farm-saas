const fs = require('fs');
const d = JSON.parse(fs.readFileSync('wsp.json'));

const nodesToUpdate = [
  'Basic LLM Chain',
  'OpenAI Chat Model Traduction',
  'Traduction_WA_Pose_Question1',
  'Traduction_WA_Refus1',
  'Traduction_WA_Demande_Photos_Init',
  'Traduction_WA_Message_Support',
  'Traduction_WA_Evaluation_Photos'
];

for (const name of nodesToUpdate) {
  const n = d.nodes.find(x => x.name === name);
  if (n) {
    let msg = "";
    if (n.parameters && n.parameters.messages && n.parameters.messages.messageValues && n.parameters.messages.messageValues[0]) {
      msg = n.parameters.messages.messageValues[0].message;
    } else if (n.parameters && n.parameters.text) {
      msg = n.parameters.text; // For some nodes
    }
    
    if (msg) {
      if (!msg.includes("ARABE CLASSIQUE — RÈGLES")) {
        const arabicRule = `
════════════════════════════════════════════
ARABE CLASSIQUE — RÈGLES (SI LANGUE CIBLE = ARABE CLASSIQUE)
════════════════════════════════════════════
⚠️ SI la langue cible est "Arabe Classique" ou "Arabe", IGNORE TOUTES LES RÈGLES DARJA CI-DESSOUS.
✅ Écris en Arabe Classique (الفصحى), utilise l'alphabet arabe, et adopte un ton courtois et chaleureux.
`;
        
        msg = msg.replace('════════════════════════════════════════════\nDARJA ALGÉROIS — RÈGLES ABSOLUES', arabicRule + '\n════════════════════════════════════════════\nDARJA ALGÉROIS — RÈGLES ABSOLUES (APPLIQUER SEULEMENT SI DARJA)');
        
        if (n.parameters.messages) {
          n.parameters.messages.messageValues[0].message = msg;
        } else {
          n.parameters.text = msg;
        }
      }
    }
  }
}

fs.writeFileSync('wsp.json', JSON.stringify(d, null, 2));
console.log('Arabic prompt rules added!');
