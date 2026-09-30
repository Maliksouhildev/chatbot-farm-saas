const fs = require('fs');

let code = fs.readFileSync('app/api/channels/whatsapp/messages/route.ts', 'utf8');

// The flawed lid guessing logic spans from `// Fetch @lid alias...` to right before `records.sort...`

const fixLogic = `    let records = results.flat();

    // Sort by timestamp ascending
    records.sort((a: any, b: any) => (a.messageTimestamp || 0) - (b.messageTimestamp || 0));

    const formattedMessages = records.map((record: any) => {`;

code = code.replace(/let records = results\.flat\(\);[\s\S]*?const formattedMessages = records\.map\(\(record: any\) => \{/, fixLogic);

fs.writeFileSync('app/api/channels/whatsapp/messages/route.ts', code);
console.log('Cleaned up messages/route.ts');
