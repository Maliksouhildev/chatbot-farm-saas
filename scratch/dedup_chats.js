const fs = require('fs');

let code = fs.readFileSync('app/api/channels/whatsapp/chats/route.ts', 'utf8');

const deduplicationLogic = `
    // Chronological sort: chats with latest message activity at the top
    formattedChats.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    // Deduplicate by name (specifically merging @lid and @s.whatsapp.net duplicates)
    const uniqueChatsMap = new Map<string, any>();
    const finalChats: any[] = [];

    for (const chat of formattedChats) {
      // Don't merge generic names or unnamed numbers
      const isGeneric = chat.name === 'WhatsApp Group' || chat.name.startsWith('~') || chat.name.startsWith('+');
      const key = isGeneric ? chat.id : chat.name;

      if (uniqueChatsMap.has(key)) {
        const existing = uniqueChatsMap.get(key);
        // Merge the IDs so the frontend can query both
        if (!existing.id.includes(chat.id)) {
          existing.id = existing.id + ',' + chat.id;
        }
        // Take the latest timestamp and message
        if ((chat.timestamp || 0) > (existing.timestamp || 0)) {
          existing.timestamp = chat.timestamp;
          existing.lastMessage = chat.lastMessage;
          existing.lastMessageTime = chat.lastMessageTime;
          existing.time = chat.time;
        }
        // Prefer non-generic handleOrPhone
        if (existing.handleOrPhone.startsWith('~') && !chat.handleOrPhone.startsWith('~')) {
          existing.handleOrPhone = chat.handleOrPhone;
        }
        // Prefer actual profile pic
        if (!existing.profilePicUrl && chat.profilePicUrl) {
          existing.profilePicUrl = chat.profilePicUrl;
        }
      } else {
        uniqueChatsMap.set(key, chat);
        finalChats.push(chat);
      }
    }

    // Sort one last time just in case merging changed the order
    finalChats.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return NextResponse.json({
      status: 'connected',
      count: finalChats.length,
      chats: finalChats,
      instance: instanceInfo,
    });
`;

code = code.replace(
  /\/\/ Chronological sort: chats with latest message activity at the top\s*formattedChats\.sort\(\(a, b\) => \(b\.timestamp \|\| 0\) - \(a\.timestamp \|\| 0\)\);\s*return NextResponse\.json\(\{\s*status: 'connected',\s*count: formattedChats\.length,\s*chats: formattedChats,\s*instance: instanceInfo,\s*\}\);/,
  deduplicationLogic
);

fs.writeFileSync('app/api/channels/whatsapp/chats/route.ts', code);
console.log('Added deduplication to chats/route.ts');
