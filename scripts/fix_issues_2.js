const fs = require('fs');
const d = JSON.parse(fs.readFileSync('wsp.json'));

// 1. UPDATE LANGUAGE DETECTOR
const langNode = d.nodes.find(n => n.name === 'Calculate Predominant Lang');
if (langNode) {
    langNode.parameters.jsCode = `// Le LLM nous renvoie maintenant directement le décompte des mots par langue !
const llmResultStr = $('Detect Language HTTP').first().json.choices[0].message.content.trim();
let messageWordCounts = {};
try { messageWordCounts = JSON.parse(llmResultStr); } catch(e) {}

// On lit les stats actuelles depuis Redis
let redisItem = $('Redis Get Lang Stats').isExecuted ? $('Redis Get Lang Stats').first()?.json : {};
let statsStr = redisItem?.value || redisItem?.propertyName || redisItem?.data || "{}";
if (typeof statsStr === 'string' && statsStr.startsWith('STAT:')) statsStr = statsStr.substring(5);

let stats = {};
if (statsStr !== "{}" && typeof statsStr === 'string' && statsStr.trim().length > 0) {
    try { stats = JSON.parse(statsStr); } catch(e) {}
}

const text = ($('Active Text & History').first()?.json?.text || "").toLowerCase();

// EXPLICIT USER COMMAND OVERRIDES (Lock language completely)
if (text.includes("francais") || text.includes("français")) {
    stats = { "Français": 1000 };
} else if (text.includes("darja") || text.includes("derja") || text.includes("arabe") || text.includes("arab")) {
    stats = { "Darja Algéroise": 1000 };
} else if (Object.keys(stats).length === 0) {
    // Initialisation : on privilégie la Darja si le message contient des mots clés algériens !
    const hasArabicChars = /[\\u0600-\\u06FF]/.test(text);
    if (hasArabicChars) {
        stats['Arabe Classique'] = 10;
    } else if (text.includes('salam') || text.includes('kho') || text.includes('nekri') || text.includes('rani') || text.includes('partma') || text.includes('lghedoua') || text.includes('ghedoua') || text.includes('nchallah') || text.includes('chhal') || text.includes('mlih')) {
        stats['Darja Algéroise'] = 10;
    } else {
        stats['Français'] = 3;
    }
}

for (const [lang, count] of Object.entries(messageWordCounts)) {
    if (lang !== 'Inconnue' && ['Français', 'English', 'Arabe Classique', 'Darja Algéroise'].includes(lang)) {
        if (stats[lang] !== 1000) { // Don't override explicit locks
            stats[lang] = (stats[lang] || 0) + parseInt(count);
        }
    }
}

// DECAY: Cap the maximum total per language
const MAX_LANG_POINTS = 100;
for (const lang of Object.keys(stats)) {
    if (stats[lang] > MAX_LANG_POINTS && stats[lang] !== 1000) {
        stats[lang] = MAX_LANG_POINTS;
    }
}

// Trouver la langue dominante
let maxWords = -1;
let predominant = 'Français';

for (const [lang, count] of Object.entries(stats)) {
    if (count > maxWords) {
        maxWords = count;
        predominant = lang;
    } else if (count === maxWords) {
        if (lang === 'Français' || predominant === 'Français') {
            predominant = 'Français';
        }
    }
}

return [{
    json: {
        dominant_lang: predominant,
        new_stats_str: "STAT:" + JSON.stringify(stats)
    }
}];`;
}

// 2. UPDATE PROPRIETAIRE AGENT
const propAgent = d.nodes.find(n => n.name === 'Booking Agent (Proprietaire)');
if (propAgent && propAgent.parameters.options && propAgent.parameters.options.systemMessage) {
    let msg = propAgent.parameters.options.systemMessage;
    msg = msg.replace(
        '"date_disponibilite" : Demande à partir de quelle date l\'appartement sera disponible.',
        '"date_disponibilite" : Demande à partir de quelle date l\'appartement sera disponible. ⚠️ REGLE ABSOLUE : NE PARLE JAMAIS DE "RÉSERVER" NI DE "LOUER POUR VOUS". Le client est le PROPRIÉTAIRE. Demande juste quand son bien sera libre pour notre gestion.'
    );
    propAgent.parameters.options.systemMessage = msg;
}

// 3. UPDATE EXTRACT APPTS STATE
const extNode = d.nodes.find(n => n.name === 'Extract Appts State');
if (extNode && extNode.parameters.jsonBody) {
    let body = extNode.parameters.jsonBody;
    if (!body.includes("ga3 sif")) {
        body = body.replace(
            "11. REGLE DARJA (CRITIQUE): Les mots 'lghedoua'",
            "11. REGLE DARJA (CRITIQUE): 'ga3 sif', 'sif', 'chta' = 'été'/'hiver', stocke les dans 'date_disponibilite'. Les mots 'lghedoua'"
        );
        extNode.parameters.jsonBody = body;
    }
}

fs.writeFileSync('wsp.json', JSON.stringify(d, null, 2));
console.log('Fixed Language, Agent, and Extractor!');
