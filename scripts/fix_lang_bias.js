const fs = require('fs');
const d = JSON.parse(fs.readFileSync('wsp.json'));

const langNode = d.nodes.find(n => n.name === 'Calculate Predominant Lang');

langNode.parameters.jsCode = `// Le LLM nous renvoie directement le décompte des mots par langue !
const llmResultStr = $('Detect Language HTTP').first().json.choices[0].message.content.trim();
let messageWordCounts = {};
try { messageWordCounts = JSON.parse(llmResultStr); } catch(e) {}

// On lit les stats accumulées depuis Redis
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
} else if (text.includes("darja") || text.includes("derja") || (text.includes("arabe") && !text.includes("appartement"))) {
    stats = { "Darja Algéroise": 1000 };
} else {
    // Add LLM word counts to accumulated stats (no pre-initialization bias)
    for (const [lang, count] of Object.entries(messageWordCounts)) {
        if (lang !== 'Inconnue' && ['Français', 'English', 'Arabe Classique', 'Darja Algéroise'].includes(lang)) {
            if ((stats[lang] || 0) !== 1000) {
                stats[lang] = (stats[lang] || 0) + parseInt(count);
            }
        }
    }

    // Keyword tiebreaker: only add a small bonus (+2) if stats are tied or empty
    const hasArabicChars = /[\\u0600-\\u06FF]/.test(text);
    const darjaKeywords = ['salam', 'kho', 'nekri', 'rani', 'partma', 'ghedoua', 'lghedoua', 'nchallah', 'waktach', 'ch7al', 'mlih', 'labass', '3andi', 't7ab', 'n9dir'];
    const hasDarjaKeyword = darjaKeywords.some(kw => text.includes(kw));

    const frScore = stats['Français'] || 0;
    const djScore = stats['Darja Algéroise'] || 0;

    if (hasArabicChars && !hasDarjaKeyword) {
        // Pure Arabic script → small boost for Arabe Classique
        stats['Arabe Classique'] = (stats['Arabe Classique'] || 0) + 2;
    } else if (hasDarjaKeyword && djScore >= frScore) {
        // Darja keyword present AND Darja is already not losing → small boost
        stats['Darja Algéroise'] = djScore + 2;
    }

    // Cap at 100 to prevent runaway dominance
    const MAX = 100;
    for (const lang of Object.keys(stats)) {
        if (stats[lang] > MAX) stats[lang] = MAX;
    }
}

// Find dominant language
let maxWords = -1;
let predominant = 'Français';

for (const [lang, count] of Object.entries(stats)) {
    if (count > maxWords) {
        maxWords = count;
        predominant = lang;
    } else if (count === maxWords) {
        // Tie → prefer Français (safer default)
        if (lang === 'Français' || predominant !== 'Français') {
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

fs.writeFileSync('wsp.json', JSON.stringify(d, null, 2));

// Verify
const check = JSON.parse(fs.readFileSync('wsp.json'));
const ln = check.nodes.find(n => n.name === 'Calculate Predominant Lang');
console.log('✅ No pre-initialization bias:', !ln.parameters.jsCode.includes("stats['Darja Algéroise'] = 10"));
console.log('✅ Keyword is tiebreaker only (djScore >= frScore):', ln.parameters.jsCode.includes('djScore >= frScore'));
console.log('✅ Explicit french lock preserved:', ln.parameters.jsCode.includes('francais'));

// Simulate the failing case
let simStats = {};
const simLLM = { 'Français': 6, 'Darja Algéroise': 2 };
for (const [lang, count] of Object.entries(simLLM)) {
    simStats[lang] = (simStats[lang] || 0) + parseInt(count);
}
// nchallah keyword present, but Darja (2) < Français (6) → no boost
const djS = simStats['Darja Algéroise'] || 0;
const frS = simStats['Français'] || 0;
if (djS >= frS) simStats['Darja Algéroise'] = djS + 2; // would NOT run since 2 < 6
let winner = 'Français';
for (const [l, c] of Object.entries(simStats)) { if (c > (simStats[winner] || 0)) winner = l; }
console.log('✅ Simulation "nchallah" in French message → winner:', winner, '(expected: Français)');
