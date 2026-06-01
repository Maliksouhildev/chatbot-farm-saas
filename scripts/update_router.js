const fs = require('fs');
const d = JSON.parse(fs.readFileSync('wsp.json'));

const setContext = d.nodes.find(n => n.name === 'Set Context');
if (setContext && setContext.parameters.jsCode) {
    setContext.parameters.jsCode = setContext.parameters.jsCode.replace(
        "const hasNewIntent = /\\b(i need|i want|je cherche|je veux|j'ai besoin|j'aimerais|louer pour moi|cherche un apart|trouver un apart)\\b/i.test(text);",
        "const hasNewIntent = /\\b(i need|i want|je cherche|je veux|j'ai besoin|j'aimerais|louer pour moi|cherche un apart|trouver un apart|mettre en location|j'ai un appart|j'ai un appartement|my apartment|mon appartement|a louer)\\b/i.test(text);"
    );
}

const router = d.nodes.find(n => n.name === 'AI Routeur1');
if (router && router.parameters.options && router.parameters.options.systemMessage) {
    let msg = router.parameters.options.systemMessage;
    msg = msg.replace(
        "EXCEPTION: The ONLY way to change an active lock is if the client writes a complete sentence stating they want to completely change the subject, OR if they explicitly CORRECT themselves (e.g., \"no I mean\", \"nn je veux dire\", \"en fait je veux\"). If they correct themselves, you MUST change the classification to match their NEW intent.",
        "EXCEPTION: The ONLY way to change an active lock is if the client writes a complete sentence stating they want to completely change the subject, OR if they explicitly CORRECT themselves (e.g., \"no I mean\", \"nn je veux dire\", \"en fait je veux\"), OR if they provide a clear new intent (like \"j'ai un appartement à mettre en location\" which explicitly changes from traveler to owner). If the intent clearly changes, you MUST change the classification to match their NEW intent."
    );
    router.parameters.options.systemMessage = msg;
}

fs.writeFileSync('wsp.json', JSON.stringify(d, null, 2));
console.log('Router logic updated!');
