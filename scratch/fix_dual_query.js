const fs = require('fs');

let code = fs.readFileSync('app/api/channels/whatsapp/messages/route.ts', 'utf8');

const replacement = `    const res = await fetch(\`\${evolutionUrl}/chat/findMessages/\${instance}\`, {
      method: 'POST',
      headers: { apikey: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        where: {
          key: {
            remoteJid: remoteJid
          }
        },
        limit: 100
      })
    });

    if (!res.ok) {
      return NextResponse.json({ messages: [] });
    }

    const data = await res.json();
    let records = data.messages?.records || [];
    
    // Fetch @lid alias if it's a standard whatsapp net number
    if (remoteJid.includes('@s.whatsapp.net')) {
       const lid = remoteJid.replace('@s.whatsapp.net', '@lid');
       const resLid = await fetch(\`\${evolutionUrl}/chat/findMessages/\${instance}\`, {
         method: 'POST',
         headers: { apikey: apiKey, 'Content-Type': 'application/json' },
         body: JSON.stringify({
           where: { key: { remoteJid: lid } },
           limit: 50
         })
       });
       if (resLid.ok) {
         const dataLid = await resLid.json();
         const recordsLid = dataLid.messages?.records || [];
         records = [...records, ...recordsLid];
       }
    } else if (remoteJid.includes('@lid')) {
       const snet = remoteJid.replace('@lid', '@s.whatsapp.net');
       const resSnet = await fetch(\`\${evolutionUrl}/chat/findMessages/\${instance}\`, {
         method: 'POST',
         headers: { apikey: apiKey, 'Content-Type': 'application/json' },
         body: JSON.stringify({
           where: { key: { remoteJid: snet } },
           limit: 50
         })
       });
       if (resSnet.ok) {
         const dataSnet = await resSnet.json();
         const recordsSnet = dataSnet.messages?.records || [];
         records = [...records, ...recordsSnet];
       }
    }`;

code = code.replace(/    const res = await fetch\([\s\S]*?const records = data\.messages\?\.records \|\| \[\];/g, replacement);

fs.writeFileSync('app/api/channels/whatsapp/messages/route.ts', code);
console.log('Successfully injected dual query fix');
