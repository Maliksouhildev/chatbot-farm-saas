const fs = require('fs');
const d = JSON.parse(fs.readFileSync('wsp.json'));

// ==================================================================
// FIX 1: Translation exception — French → Darja should be TRANSLATED
// The old rule "if text is in a different language → copy-paste" was
// causing the LLM to refuse translating French to Darja.
// We must restrict the copy-paste exception to English/Arabic ONLY.
// ==================================================================
const transNodes = [
  'Basic LLM Chain',
  'OpenAI Chat Model Traduction',
  'Traduction_WA_Pose_Question1',
  'Traduction_WA_Refus1',
  'Traduction_WA_Demande_Photos_Init',
  'Traduction_WA_Message_Support',
  'Traduction_WA_Evaluation_Photos'
];

const oldException = "Exception unique : texte 100% dans une langue différente de la cible → copier-coller.";
const newException = "Exception unique : si le texte est 100% en Anglais ou en Arabe Classique ET que la cible est Darja → copier-coller tel quel. ⚠️ JAMAIS utiliser cette exception pour du Français : le Français doit TOUJOURS être réécrit en Darja Algéroise.";

for (const name of transNodes) {
    const n = d.nodes.find(x => x.name === name);
    if (!n) continue;
    let msg = n.parameters?.messages?.messageValues?.[0]?.message || n.parameters?.text || '';
    if (msg.includes(oldException)) {
        msg = msg.replace(oldException, newException);
        if (n.parameters.messages) n.parameters.messages.messageValues[0].message = msg;
        else n.parameters.text = msg;
    }
}

// ==================================================================
// FIX 2: Proprietaire Agent — After ALL_FILLED, correct end flow
// The AI invented a fake "form" procedure. It must:
// 1. Call Export_CRM
// 2. Tell client their profile is saved, we'll call them soon
// 3. Trigger admin notification (ESCALADE_CRM_DONE sent separately)
// ==================================================================
const propAgent = d.nodes.find(n => n.name === 'Booking Agent (Proprietaire)');
if (propAgent) {
    let msg = propAgent.parameters.options.systemMessage;

    // Replace old ALL_FILLED block with explicit flow
    msg = msg.replace(
        `Si CHAMP MANQUANT = "ALL_FILLED" :
Tu dois IMMÉDIATEMENT demander au client la confirmation finale pour créer son offre et l'exporter au CRM.
Exemple: "Votre dossier est complet. Me confirmez-vous que je peux créer votre offre et la transmettre à notre équipe ?"


Si le client te donne son accord final, tu DOIS ABSOLUMENT APPELER l'outil Export_CRM.`,
        `Si CHAMP MANQUANT = "ALL_FILLED" :
ETAPE 1 — Demande la confirmation finale au client (UNE SEULE FOIS) :
Dis quelque chose comme : "Super, toutes les informations sont enregistrées ! Pour finaliser, puis-je confirmer votre dossier et le transmettre à notre équipe commerciale ?"

ETAPE 2 — Quand le client confirme (oui, ok, parfait, confirm, ih, yep...) :
→ APPELLE IMMÉDIATEMENT l'outil Export_CRM avec toutes les données du dossier.
→ Après l'appel (succès ou erreur), réponds au client : "Votre profil est bien enregistré dans notre système. Notre équipe vous contactera très prochainement pour finaliser les détails. Merci pour votre confiance !"
→ ⛔ INTERDIT : inventer des étapes, formulaires, emails, procédures. JAMAIS.
→ ⛔ INTERDIT : mentionner Gamma, script commercial, ou tout outil interne.`
    );

    // Add explicit escalade rule for film/events requested by owner (not just voyageur)
    msg = msg.replace(
        `2. *Cas Hors Processus* : Le client a une demande impossible pour toi (location à l'année, tournage vidéo, paiement en espèces non standard, événementiel, négociation de prix agressive).`,
        `2. *Cas Hors Processus* : Le client a une demande que tu ne peux pas traiter seul (tournage vidéo/film, événementiel, location à l'année, paiement en espèces non standard, demande de partenariat, etc.). Dans ce cas : réponds "Je transmets votre demande à notre équipe qui vous contactera rapidement." et AJOUTE ESCALADE_ADMIN. Ne refuse pas sèchement.`
    );

    propAgent.parameters.options.systemMessage = msg;
}

// ==================================================================
// FIX 3: Voyageur Agent — Same fix for film/event escalade
// ==================================================================
const voyAgent = d.nodes.find(n => n.name === 'Booking Agent (Voyageur)');
if (voyAgent) {
    let msg = voyAgent.parameters.options.systemMessage;
    msg = msg.replace(
        `2. *Cas Hors Processus* : Le client a une demande impossible pour toi (location à l'année, tournage vidéo, paiement en espèces non standard, événementiel, négociation de prix agressive).`,
        `2. *Cas Hors Processus* : Le client a une demande que tu ne peux pas traiter (tournage vidéo/film dans l'appartement, événementiel, location à l'année, demande de partenariat). Dans ce cas : réponds "Je transmets votre demande à notre responsable qui vous recontactera rapidement." et AJOUTE ESCALADE_ADMIN. Ne refuse pas sèchement et NE continue pas à poser des questions pour réserver.`
    );
    voyAgent.parameters.options.systemMessage = msg;
}

// ==================================================================
// FIX 4: The Brain message — "ab3atli" must not leak into French messages
// The Brain generates messages in French; clean up Darja words in its output
// ==================================================================
const brainNode = d.nodes.find(n => n.name === 'The Brain (Moyenne & Message)');
if (brainNode && brainNode.parameters.jsCode) {
    let code = brainNode.parameters.jsCode;
    // Remove any Darja words that may have been hardcoded by mistake
    if (!code.includes('// BRAIN LANGUAGE CLEAN')) {
        code = code.replace(
            'return [{',
            `// BRAIN LANGUAGE CLEAN: ensure no Darja leaks in Brain-generated French messages
final_message = final_message.replace(/\\bab3atli\\b/gi, 'envoyez-nous');
final_message = final_message.replace(/\\bb3atli\\b/gi, 'envoyez-nous');
final_message = final_message.replace(/\\bsifet-li\\b/gi, 'envoyez-nous');
final_message = final_message.replace(/\\b3afak\\b/gi, 'stp');

return [{`
        );
        brainNode.parameters.jsCode = code;
    }
}

fs.writeFileSync('wsp.json', JSON.stringify(d, null, 2));

// Verify
const dv = JSON.parse(fs.readFileSync('wsp.json'));
const transCheck = dv.nodes.find(n => n.name === 'Basic LLM Chain');
const transMsg = transCheck.parameters.messages.messageValues[0].message;
const propCheck = dv.nodes.find(n => n.name === 'Booking Agent (Proprietaire)');
const propMsg = propCheck.parameters.options.systemMessage;

console.log('✅ Translation exception fixed:', transMsg.includes('JAMAIS utiliser cette exception pour du Français'));
console.log('✅ Proprietaire end-flow fixed:', propMsg.includes('INTERDIT : inventer des étapes'));
console.log('✅ Proprietaire film escalade:', propMsg.includes('tournage vidéo/film'));
console.log('✅ Voyageur film escalade:', dv.nodes.find(n=>n.name==='Booking Agent (Voyageur)').parameters.options.systemMessage.includes('tournage vidéo/film dans l\'appartement'));
console.log('✅ Brain language clean:', dv.nodes.find(n=>n.name==='The Brain (Moyenne & Message)').parameters.jsCode.includes('BRAIN LANGUAGE CLEAN'));
