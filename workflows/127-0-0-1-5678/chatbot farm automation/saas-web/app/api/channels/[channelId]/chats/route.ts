import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { fetchRealTwitterDMs, TwitterSession } from "@/lib/bridges/twitterBridge";
import { fetchRealGoogleChatConversations } from "@/lib/bridges/googleChatBridge";
import { fetchRealIrcMessages } from "@/lib/bridges/ircBridge";
import { fetchRealLinkedInConversations } from "@/lib/bridges/linkedinBridge";
import { fetchRealGmailMessages } from "@/lib/bridges/gmailBridge";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: { channelId: string } }
) {
  try {
    const channelId = context.params.channelId;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const botToken = searchParams.get("botToken") || searchParams.get("token") || "";
    const sessionParam = searchParams.get("session") || "";

    // 1. Resolve merchant's bot_id from Supabase
    let botId: string | null = null;
    if (userId) {
      const { data: userBots } = await supabaseAdmin
        .from("bots")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      if (userBots && userBots.length > 0) {
        botId = userBots[0].id;
      }
    }

    // 2. Fetch stored conversations from Supabase for this channel
    let convs: any[] = [];
    if (botId) {
      const { data, error } = await supabaseAdmin
        .from("conversations")
        .select("*, chat_messages(*)")
        .eq("channel_type", channelId)
        .eq("bot_id", botId)
        .order("last_message_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        convs = data;
      }
    }

    // 3. Twitter / X Real Bridge (Beeper-Style)
    if (channelId === "x_twitter") {
      let twitterSession: TwitterSession | null = null;
      if (sessionParam) {
        try {
          twitterSession = JSON.parse(decodeURIComponent(sessionParam));
        } catch {}
      }

      if (twitterSession && twitterSession.authToken && twitterSession.ct0) {
        const liveDms = await fetchRealTwitterDMs(twitterSession);
        if (liveDms.success && liveDms.chats.length > 0) {
          return NextResponse.json({
            success: true,
            status: "connected",
            channelId,
            isLive: true,
            count: liveDms.chats.length,
            chats: liveDms.chats,
            timestamp: Date.now(),
          });
        }
      }
    }

    // 4. Google Chat Real Bridge (Google Workspace API)
    if (channelId === "google_chat") {
      const accessToken = searchParams.get("accessToken") || botToken;
      const email = searchParams.get("email") || "";
      const gChatRes = await fetchRealGoogleChatConversations({ accessToken, email });
      if (gChatRes.success && gChatRes.chats.length > 0) {
        return NextResponse.json({
          success: true,
          status: "connected",
          channelId,
          isLive: true,
          count: gChatRes.chats.length,
          chats: gChatRes.chats,
          timestamp: Date.now(),
        });
      }
    }

    // 5. Gmail Real Bridge (Gmail API)
    if (channelId === "gmail") {
      const accessToken = searchParams.get("accessToken") || botToken;
      const email = searchParams.get("email") || "";
      const gmailRes = await fetchRealGmailMessages({ accessToken, email });
      if (gmailRes.success && gmailRes.chats.length > 0) {
        return NextResponse.json({
          success: true,
          status: "connected",
          channelId,
          isLive: true,
          count: gmailRes.chats.length,
          chats: gmailRes.chats,
          timestamp: Date.now(),
        });
      }
    }

    // 6. IRC Real Bridge (TCP/TLS socket)
    if (channelId === "irc") {
      const channel = searchParams.get("channel") || "#chatbot-farm";
      const host = searchParams.get("host") || "irc.libera.chat";
      const ircRes = await fetchRealIrcMessages({ channel, host });
      if (ircRes.success && ircRes.chats.length > 0) {
        return NextResponse.json({
          success: true,
          status: "connected",
          channelId,
          isLive: true,
          count: ircRes.chats.length,
          chats: ircRes.chats,
          timestamp: Date.now(),
        });
      }
    }

    // 7. LinkedIn Real Bridge
    if (channelId === "linkedin") {
      const tokenOrCookie = searchParams.get("token") || searchParams.get("cookie") || "";
      const page = searchParams.get("page") || "";
      const liRes = await fetchRealLinkedInConversations({ tokenOrCookie, page });
      if (liRes.success && liRes.chats.length > 0) {
        return NextResponse.json({
          success: true,
          status: "connected",
          channelId,
          isLive: true,
          count: liRes.chats.length,
          chats: liRes.chats,
          timestamp: Date.now(),
        });
      }
    }

    // 8. Discord live guild channels
    if (channelId === "discord" && (botToken || process.env.DISCORD_BOT_TOKEN)) {
      const activeToken = botToken || process.env.DISCORD_BOT_TOKEN;
      try {
        const res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
          headers: { Authorization: `Bot ${activeToken}` },
        });
        if (res.ok) {
          const guilds = await res.json();
          if (Array.isArray(guilds) && guilds.length > 0) {
            const guildId = guilds[0].id;
            const chanRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
              headers: { Authorization: `Bot ${activeToken}` },
            });
            if (chanRes.ok) {
              const channels = await chanRes.json();
              const textChannels = channels.filter((c: any) => c.type === 0);
              if (textChannels.length > 0) {
                const liveDiscordChats = textChannels.slice(0, 15).map((tc: any) => ({
                  id: `disc_${tc.id}`,
                  appId: "discord",
                  name: `#${tc.name}`,
                  handleOrPhone: `Guild: ${guilds[0].name}`,
                  avatarText: "#",
                  avatarBg: "#5865F2",
                  statusText: `Discord Channel • ${tc.topic || "Discussion"}`,
                  spend: "0 DA",
                  lastMessage: tc.last_message_id ? "Active Discord discussion" : "Start discussion",
                  time: "Live",
                  lastMessageTime: "Live",
                  timestamp: Date.now(),
                  unreadCount: 0,
                  messages: [],
                }));

                return NextResponse.json({
                  success: true,
                  status: "connected",
                  channelId,
                  isLive: true,
                  accountType: "discord_bot",
                  count: liveDiscordChats.length,
                  chats: liveDiscordChats,
                  timestamp: Date.now(),
                });
              }
            }
          }
        }
      } catch (dErr) {
        console.warn("Discord live fetch failed, using stored conversations:", dErr);
      }
    }

    // 9. If real conversations exist in Supabase, format them
    if (convs.length > 0) {
      const chats = convs.map((c: any) => {
        const rawMsgs = Array.isArray(c.chat_messages) ? c.chat_messages : [];
        const sortedMsgs = rawMsgs.slice().sort(
          (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        const msgs = sortedMsgs.map((m: any) => {
          const isMe = m.sender === "human_operator" || m.sender === "operator";
          const date = new Date(m.created_at || Date.now());
          const timeStr = isNaN(date.getTime())
            ? "Just now"
            : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          return {
            id: m.id,
            sender: isMe ? "operator" : "customer",
            text: m.content || "",
            time: timeStr,
            seen: true,
            isAudio: m.message_type === "audio",
            imageUrl: m.message_type === "image" ? m.content : undefined,
            fileName: m.message_type === "file" ? m.content : undefined,
          };
        });

        const lastMsg = msgs[msgs.length - 1];
        const lastMsgText = lastMsg ? lastMsg.text : "Tap to open discussion";
        const date = c.last_message_at ? new Date(c.last_message_at) : new Date(c.created_at || Date.now());
        const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        return {
          id: c.id,
          appId: channelId,
          name: c.contact_name || c.contact_phone || `${channelId} User`,
          handleOrPhone: c.contact_phone || `@user_${c.id.slice(0, 5)}`,
          avatarText: (c.contact_name || c.contact_phone || "U")[0].toUpperCase(),
          avatarBg: "#1B6648",
          statusText: `${channelId.toUpperCase()} Contact`,
          spend: c.total_spend ? `${c.total_spend} DA` : "0 DA",
          lastMessage: lastMsgText,
          time: timeStr,
          lastMessageTime: timeStr,
          timestamp: date.getTime(),
          unreadCount: 0,
          messages: msgs,
        };
      });

      return NextResponse.json({
        success: true,
        status: "connected",
        channelId,
        isLive: true,
        count: chats.length,
        chats,
        timestamp: Date.now(),
      });
    }

    // 10. Clean honest 0-count response (Zero synthetic mock fallback)
    return NextResponse.json({
      success: true,
      status: "connected",
      channelId,
      isLive: true,
      count: 0,
      chats: [],
      timestamp: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", error: error.message || "Failed to fetch channel chats", chats: [] },
      { status: 500 }
    );
  }
}

