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
    let msg = '';
    if (n.parameters && n.parameters.messages && n.parameters.messages.messageValues && n.parameters.messages.messageValues[0]) {
      msg = n.parameters.messages.messageValues[0].message;
    } else if (n.parameters && n.parameters.text) {
      msg = n.parameters.text;
    }
    
    if (msg) {
        // Add "sifet" to CORRECTIONS DE VOCABULAIRE
        if (msg.includes('CORRECTIONS DE VOCABULAIRE')) {
            if (!msg.includes('"sifet"')) {
                msg = msg.replace(
                    '▶ 3.5. CORRECTIONS DE VOCABULAIRE\n',
                    '▶ 3.5. CORRECTIONS DE VOCABULAIRE\n❌ "sifet" ou "sifetli" ou "sifet-li" → ✅ "ab3atli" ou "b3atli"\n'
                );
            }
        }
        
        // Also fix the verbs section
        msg = msg.replace('Envoyer     → sifet / 3ayyet / "envoyer"', 'Envoyer     → ab3at / b3at / "envoyer"');
        msg = msg.replace('✅ sifet / 3ayyet / "envoie" (français)', '✅ ab3at / b3at / "envoie" (français)');
        msg = msg.replace('sbat/sbathom → ❌ BANNI', 'sbat/sbathom/sifet → ❌ BANNI');
        msg = msg.replace('"3afak envoie-moi les photos" → "stp, sifet-li les photos" OU "sifet-li les photos, t3ich"', '"3afak envoie-moi les photos" → "stp, ab3atli les photos" OU "b3atli les photos t3ich"');

        if (n.parameters.messages) {
          n.parameters.messages.messageValues[0].message = msg;
        } else {
          n.parameters.text = msg;
        }
    }
  }
}

// Update Extract Appts State
const ext = d.nodes.find(n => n.name === 'Extract Appts State');
if (ext && ext.parameters.jsonBody) {
    if (!ext.parameters.jsonBody.includes('REGLE SURFACE')) {
        ext.parameters.jsonBody = ext.parameters.jsonBody.replace(
            "11. REGLE DARJA",
            "12. REGLE SURFACE (CRITIQUE): Si le client mentionne une mesure comme '100mcarre', '100 m²', '75', '80 metres', c'est OBLIGATOIREMENT le champ 'surface'. 11. REGLE DARJA"
        );
    }
}

fs.writeFileSync('wsp.json', JSON.stringify(d, null, 2));
console.log('Vocabulary and Extractor updated!');
