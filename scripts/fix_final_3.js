const fs = require('fs');
const d = JSON.parse(fs.readFileSync('wsp.json'));

// ============================================================
// FIX 1: CRM ADMIN NOTIFICATION
// Instead of a Gamma script + link, send the full prospect card
// ============================================================
const waScriptAdmin = d.nodes.find(n => n.name === 'WA Script Admin');
if (waScriptAdmin && waScriptAdmin.parameters.textBody) {
    waScriptAdmin.parameters.textBody = `=🏠 *NOUVEAU PROPRIÉTAIRE AJOUTÉ AU CRM*
━━━━━━━━━━━━━━━━━━━━━━━━

👤 *Nom* : {{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.contacts[0].profile.name || 'Inconnu' }}
📞 *Téléphone* : {{ $('Webhook (Receive Message)').first().json.body.entry[0].changes[0].value.messages[0].from }}

🏢 *Données du Bien* :
{{ (() => {
  try {
    const state = JSON.parse($('State Clean Code').first().json.appts_state_json || '[]');
    const a = state[0] || {};
    let lines = [];
    if (a.ville_quartier) lines.push('📍 Localisation : ' + a.ville_quartier);
    if (a.surface)        lines.push('📐 Surface : ' + a.surface + ' m²');
    if (a.etage)          lines.push('🏗️ Étage : ' + a.etage);
    if (a.nombre_pieces)  lines.push('🛏️ Pièces : ' + a.nombre_pieces);
    if (a.date_disponibilite) lines.push('📅 Disponibilité : ' + a.date_disponibilite);
    return lines.length > 0 ? lines.join('\\n') : '(Données non renseignées)';
  } catch(e) { return '(Erreur lecture état)'; }
})() }}

📸 *Photos* : {{ $('Set Context').first().json.liens_photos || 'Aucune photo' }}

━━━━━━━━━━━━━━━━━━━━━━━━
🤝 Bon closing !`;
}

// ============================================================
// FIX 2: VOYAGEUR AGENT — HARD ANTI-HALLUCINATION RULE
// When tool returns no new options, the AI MUST stop and say so
// ============================================================
const voyageurAgent = d.nodes.find(n => n.name === 'Booking Agent (Voyageur)');
if (voyageurAgent && voyageurAgent.parameters.options && voyageurAgent.parameters.options.systemMessage) {
    let msg = voyageurAgent.parameters.options.systemMessage;

    const oldRule = `Si le tool retourne "AUCUNE_NOUVELLE_OPTION" → dis : "J'ai tout montré ! Ces appartements sont les seuls disponibles pour ces dates."`;
    const newRule = `Si le tool retourne "AUCUNE_NOUVELLE_OPTION" ou que le résultat de l'outil est vide / contient aucun appartement :
→ TU DOIS DIRE : "J'ai tout montré ! Nous n'avons plus d'autres appartements disponibles pour ces dates."
→ ⛔ RÈGLE D'OR ABSOLUE : Tu as l'INTERDICTION TOTALE ET SANS EXCEPTION d'inventer, de copier, de mémoriser ou de réutiliser des noms d'appartements qui ne proviennent pas du résultat de l'outil pour CET appel précis. Si l'outil ne retourne rien de nouveau → il n'y a rien. JAMAIS d'appartements de mémoire. JAMAIS de noms du catalogue. UNIQUEMENT ce que l'outil retourne à l'instant présent.`;

    msg = msg.replace(oldRule, newRule);

    // Also reinforce at the top of the format rules
    const oldFormat = `🛑 APPARTS DISPONIBLES : Un seul paragraphe chaleureux avec max 3 options, prix en Euros ET Dinars, lien de réservation.`;
    const newFormat = `🛑 APPARTS DISPONIBLES : Un seul paragraphe chaleureux avec max 3 options, prix en Euros ET Dinars, lien de réservation.
⛔ RÈGLE ANTI-HALLUCINATION : N'utilise JAMAIS un nom d'appartement ou un lien qui ne provient pas du dernier appel à "Verifier_TOUTE_La_Liste". Aucune exception. Même si tu connais des appartements depuis le catalogue, ne les présente JAMAIS sans les avoir validés via l'outil en temps réel.`;

    msg = msg.replace(oldFormat, newFormat);

    voyageurAgent.parameters.options.systemMessage = msg;
}

// ============================================================
// FIX 3: PROPORTIONAL ESCALADE RULES (all agents)
// Remove overly aggressive trigger "Frustration / Colère" is fine,
// but remove "Echec Outil Répété" which was too broad
// ============================================================
const PROPORTIONAL_ESCALADE = `
[ESCALADE ADMIN - CONDITIONS DE DÉCLENCHEMENT]
Uniquement dans ces cas précis, réponds normalement au client et AJOUTE "ESCALADE_ADMIN" à la toute fin de ton message :
1. *Demande d'Humain* : Le client demande explicitement à parler à un conseiller, au manager, ou à "quelqu'un de réel".
2. *Cas Hors Processus* : Le client a une demande impossible pour toi (location à l'année, tournage vidéo, paiement en espèces non standard, événementiel, négociation de prix agressive).
3. *Frustration Explicite* : Le client s'énerve clairement ou utilise des termes désobligeants ENVERS LE SERVICE (pas juste s'il est pressé ou impatient).
4. *Urgence Technique sur Réservation Active* : Le client signale un problème grave sur place (fuite, panne, porte bloquée).
⚠️ IMPORTANT : Ne déclenche PAS l'escalade pour des questions auxquelles tu peux répondre, des réponses courtes ambiguës, ou une simple incompréhension. L'escalade est un dernier recours, pas une réaction par défaut.`;

const agentsToUpdate = ['Booking Agent (Voyageur)', 'Booking Agent (Proprietaire)', 'Agent Support Client'];
for (const name of agentsToUpdate) {
    const agent = d.nodes.find(n => n.name === name);
    if (agent && agent.parameters && agent.parameters.options && agent.parameters.options.systemMessage) {
        let msg = agent.parameters.options.systemMessage;
        // Replace the old escalade block with the proportional one
        msg = msg.replace(/\n\[ESCALADE ADMIN - CONDITIONS DE DÉCLENCHEMENT[\s\S]*$/, PROPORTIONAL_ESCALADE);
        agent.parameters.options.systemMessage = msg;
    }
}

fs.writeFileSync('wsp.json', JSON.stringify(d, null, 2));
console.log('✅ Fixed: CRM Notification, Anti-Hallucination, Proportional Escalade');
