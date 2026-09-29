const fs = require('fs');
const path = 'app/api/channels/[channelId]/chats/route.ts';
let code = fs.readFileSync(path, 'utf8');

const target = `      if (channelId === "google_chat") {
        const accessToken = searchParams.get("accessToken") || botToken;
        const email = searchParams.get("email") || "";
        const gChatRes = await fetchRealGoogleChatConversations({ accessToken, email });
        if (gChatRes.success && gChatRes.chats.length > 0) {`;

const replacement = `      if (channelId === "google_chat") {
        const accessToken = searchParams.get("accessToken") || botToken;
        const email = searchParams.get("email") || "";
        const gChatRes = await fetchRealGoogleChatConversations({ accessToken, email });
        if (!gChatRes.success) {
          return NextResponse.json({
            success: false,
            channelId,
            isLive: false,
            count: 0,
            chats: [],
            error: gChatRes.error || 'Failed to fetch Google Chat',
          });
        }
        if (gChatRes.chats.length > 0) {`;

code = code.replace(target, replacement);
fs.writeFileSync(path, code);
console.log("Done");
