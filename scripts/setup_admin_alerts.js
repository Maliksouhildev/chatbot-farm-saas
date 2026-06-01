const fs = require('fs');
const d = JSON.parse(fs.readFileSync('wsp.json'));

const ESCALADE_RULES = `
[ESCALADE ADMIN - CONDITIONS DE DÉCLENCHEMENT (CRITIQUE)]
Si la conversation rencontre l'une des situations suivantes, tu DOIS ABSOLUMENT insérer le mot-clé exact "ESCALADE_ADMIN" à la toute fin de ta réponse (et ne rien faire d'autre).
Situations d'Escalade :
1. Demande d'Humain : Le client demande explicitement à parler à un conseiller, au manager, au patron, ou à "quelqu'un de vrai".
2. Cas Complexe / Hors Processus : Le client a une demande que tes outils ne peuvent pas traiter (ex: location d'un an, paiement en crypto, tournage de film, événementiel).
3. Frustration / Colère : Le client montre des signes clairs de frustration, s'énerve, utilise des gros mots, ou se plaint de tes réponses.
4. Échec Outil Répété : Le client boucle sur la même question ou tu n'arrives pas à lui donner satisfaction.
5. Problème Technique : Le client signale une urgence grave (fuite d'eau, panne de courant).
Action : Réponds au client normalement (ex: "Je comprends, je transfère votre demande à notre équipe humaine.") et AJOUTE "ESCALADE_ADMIN" à la fin de ton texte.`;

const agentsToUpdate = ['Booking Agent (Voyageur)', 'Booking Agent (Proprietaire)', 'Agent Support Client'];

for (const name of agentsToUpdate) {
    const agent = d.nodes.find(n => n.name === name);
    if (agent && agent.parameters && agent.parameters.options && agent.parameters.options.systemMessage) {
        let msg = agent.parameters.options.systemMessage;
        
        // Remove old basic rules if present
        msg = msg.replace(/\[ESCALADE\]\nPlainte ou demande d'humain = ESCALADE_ADMIN/g, '');
        
        if (!msg.includes('[ESCALADE ADMIN - CONDITIONS DE DÉCLENCHEMENT')) {
            msg = msg + '\n\n' + ESCALADE_RULES;
            agent.parameters.options.systemMessage = msg;
        }
    }
}

// Update Admin Report Formatting
const adminReport = d.nodes.find(n => n.name === 'Code Build Admin Report 1');
if (adminReport && adminReport.parameters.jsCode) {
    let code = adminReport.parameters.jsCode;
    // Improve formatting of the report
    const oldReportFormat = "const report = `🚨 ESCALADE — INTERVENTION REQUISE";
    if (code.includes(oldReportFormat)) {
        code = code.replace(/const report = `🚨 ESCALADE — INTERVENTION REQUISE[\s\S]*?`;/, 
`const report = \`🚨 ESCALADE — INTERVENTION REQUISE 🚨

👤 *Client* : \${clientName}
📞 *Tél* : \${sender}
🤖 *Source* : \${agentName}

💬 *Dernier message du client* :
"\${lastMessage}"

📋 *Résumé IA (Raison de l'escalade)* :
\${cleanSummary || '(Aucun contexte fourni par l\\'IA)'}\${photoSection}

⚠️ *Action Requise* : Le bot est mis en pause sur cette conversation. Prenez en charge manuellement.\`;`);
        adminReport.parameters.jsCode = code;
    }
}

// Update WA Script Admin (CRM Notification)
const waScriptAdmin = d.nodes.find(n => n.name === 'WA Script Admin');
if (waScriptAdmin && waScriptAdmin.parameters.textBody) {
    let body = waScriptAdmin.parameters.textBody;
    if (!body.includes('https://airtable.com')) {
        body = body.replace(
            "🤝 Bon closing !",
            "🔗 *Lien CRM* : https://airtable.com (Ou Notion/Sheets — cliquez ici pour ouvrir la base de données)\n\n🤝 Bon closing !"
        );
        waScriptAdmin.parameters.textBody = body;
    }
}

fs.writeFileSync('wsp.json', JSON.stringify(d, null, 2));
console.log('Escalade rules and Admin Reports updated!');
