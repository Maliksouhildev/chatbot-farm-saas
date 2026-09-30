const fs = require('fs');

let code = fs.readFileSync('app/api/channels/whatsapp/messages/route.ts', 'utf8');

const updatedLogic = `
    const evolutionUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    const apiKey = process.env.EVOLUTION_API_KEY || 'farm_evolution_master_secret_2026';

    const jids = remoteJid.split(',');
    
    const fetchMessagesForJid = async (jid: string) => {
      const res = await fetch(\`\${evolutionUrl}/chat/findMessages/\${instance}\`, {
        method: 'POST',
        headers: { apikey: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          where: { key: { remoteJid: jid } },
          limit: 100
        })
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.messages?.records || [];
    };

    const results = await Promise.all(jids.map(fetchMessagesForJid));
    let records = results.flat();
`;

const targetRegex = /const evolutionUrl = [\s\S]*?let records = data\.messages\?\.records \|\| \[\];/;

code = code.replace(targetRegex, updatedLogic);

fs.writeFileSync('app/api/channels/whatsapp/messages/route.ts', code);
console.log('Updated messages/route.ts');
