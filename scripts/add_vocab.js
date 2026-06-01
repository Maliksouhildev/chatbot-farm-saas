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
      if (!msg.includes("CORRECTIONS DE VOCABULAIRE")) {
          msg = msg.replace(
              '❌ qrib / qal / qbel / tqedder / nqdir — STRICTEMENT INTERDIT',
              '❌ qrib / qal / qbel / tqedder / nqdir — STRICTEMENT INTERDIT\n\n▶ 3.5. CORRECTIONS DE VOCABULAIRE\n❌ "chi" (ex: chi soual) → ✅ "kash" (ex: kash soual)\n❌ "n9alek 7al" → ✅ "nchouflek" ou "nwarilek"\n❌ "t9edder t7ab" → ✅ "ida t7ab" ou "ila rak 7ab"'
          );
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
console.log('Vocabulary corrections added!');
