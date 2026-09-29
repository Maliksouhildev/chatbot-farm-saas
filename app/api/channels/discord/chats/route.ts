import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const rawToken = searchParams.get("token") || searchParams.get("botToken") || process.env.DISCORD_BOT_TOKEN || "";

    // If no token provided, try fetching stored Supabase conversations
    if (!rawToken) {
      if (userId) {
        const { data: userBots } = await supabaseAdmin
          .from("bots")
          .select("id")
          .eq("user_id", userId)
          .limit(1);

        if (userBots && userBots.length > 0) {
          const { data: convs } = await supabaseAdmin
            .from("conversations")
            .select("*, chat_messages(*)")
            .eq("channel_type", "discord")
            .eq("bot_id", userBots[0].id)
            .order("last_message_at", { ascending: false });

          if (convs && convs.length > 0) {
            const formatted = convs.map((c: any) => ({
              id: c.id,
              appId: "discord",
              name: c.contact_name || "Discord User",
              handleOrPhone: c.contact_phone || "@discord_user",
              avatarText: (c.contact_name || "D")[0].toUpperCase(),
              avatarBg: "#5865F2",
              statusText: "Discord Contact",
              spend: "0 DA",
              lastMessage: c.chat_messages?.[c.chat_messages.length - 1]?.content || "Start discussion",
              time: "Recent",
              lastMessageTime: "Recent",
              timestamp: new Date(c.last_message_at || c.created_at || Date.now()).getTime(),
              unreadCount: 0,
              messages: [],
            }));

            return NextResponse.json({
              success: true,
              status: "connected",
              channelId: "discord",
              isLive: true,
              count: formatted.length,
              chats: formatted,
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        status: "unlinked",
        channelId: "discord",
        count: 0,
        chats: [],
      });
    }

    // 1. Resolve Authorization Header (User Token vs Bot Token)
    let authHeader = rawToken;
    let meData: any = null;

    if (rawToken.startsWith("Bot ")) {
      authHeader = rawToken;
      const res = await fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: authHeader },
      });
      if (res.ok) meData = await res.json();
    } else {
      // Try as User Token first
      const userRes = await fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: rawToken },
      });
      if (userRes.ok) {
        authHeader = rawToken;
        meData = await userRes.json();
      } else {
        // Try as Bot Token
        const botRes = await fetch("https://discord.com/api/v10/users/@me", {
          headers: { Authorization: `Bot ${rawToken}` },
        });
        if (botRes.ok) {
          authHeader = `Bot ${rawToken}`;
          meData = await botRes.json();
        }
      }
    }

    if (!meData) {
      return NextResponse.json(
        { error: "Invalid Discord token. Please authenticate or provide a valid token." },
        { status: 401 }
      );
    }

    const chats: any[] = [];

    // 2. Fetch Real Direct Messages (DMs & Group DMs)
    try {
      const dmsRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
        headers: { Authorization: authHeader },
      });

      if (dmsRes.ok) {
        const dms = await dmsRes.json();
        if (Array.isArray(dms)) {
          // Process DMs concurrently up to 20
          const dmPromises = dms.slice(0, 20).map(async (dm: any) => {
            const isGroup = dm.type === 3;
            const recipient = dm.recipients?.[0] || {};
            const contactName = isGroup
              ? dm.name || (dm.recipients ? dm.recipients.map((r: any) => r.global_name || r.username).join(", ") : "Group Discussion")
              : (recipient.global_name || recipient.username || "Discord Contact");
            const handle = isGroup
              ? `Group (${dm.recipients?.length || 0} members)`
              : `@${recipient.username || "user"}`;
            const avatarUrl = recipient.avatar
              ? `https://cdn.discordapp.com/avatars/${recipient.id}/${recipient.avatar}.png`
              : null;

            // Fetch last message for snippet
            let lastSnippet = "Start discussion";
            let lastTimeStr = "Live";
            let lastTimestamp = Date.now();

            try {
              const msgRes = await fetch(`https://discord.com/api/v10/channels/${dm.id}/messages?limit=1`, {
                headers: { Authorization: authHeader },
                signal: AbortSignal.timeout(3000),
              });
              if (msgRes.ok) {
                const msgs = await msgRes.json();
                if (Array.isArray(msgs) && msgs.length > 0) {
                  const m = msgs[0];
                  lastSnippet = m.content || (m.attachments?.length ? "📎 Attachment" : "Discussion active");
                  const d = new Date(m.timestamp);
                  lastTimeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  lastTimestamp = d.getTime();
                }
              }
            } catch {}

            return {
              id: `disc_dm_${dm.id}`,
              appId: "discord",
              name: contactName,
              handleOrPhone: handle,
              avatarText: (contactName || "D")[0].toUpperCase(),
              avatarBg: "#5865F2",
              avatarUrl,
              statusText: isGroup ? "Discord Group DM" : "Discord Direct Message",
              spend: "0 DA",
              lastMessage: lastSnippet,
              time: lastTimeStr,
              lastMessageTime: lastTimeStr,
              timestamp: lastTimestamp,
              unreadCount: 0,
              messages: [],
              discordChannelId: dm.id,
              isDm: true,
            };
          });

          const resolvedDms = await Promise.all(dmPromises);
          chats.push(...resolvedDms);
        }
      }
    } catch (dmErr) {
      console.warn("Failed to fetch Discord DMs:", dmErr);
    }

    // 3. Fetch Real Server Guilds & Channels
    try {
      const guildsRes = await fetch("https://discord.com/api/v10/users/@me/guilds", {
        headers: { Authorization: authHeader },
      });

      if (guildsRes.ok) {
        const guilds = await guildsRes.json();
        if (Array.isArray(guilds)) {
          // Check top 4 guilds to avoid hitting rate limits
          for (const guild of guilds.slice(0, 4)) {
            try {
              const chanRes = await fetch(`https://discord.com/api/v10/guilds/${guild.id}/channels`, {
                headers: { Authorization: authHeader },
                signal: AbortSignal.timeout(3000),
              });

              if (chanRes.ok) {
                const channels = await chanRes.json();
                if (Array.isArray(channels)) {
                  // Filter for text channels (type 0)
                  const textChannels = channels.filter((c: any) => c.type === 0).slice(0, 5);
                  for (const tc of textChannels) {
                    chats.push({
                      id: `disc_chan_${tc.id}`,
                      appId: "discord",
                      name: `#${tc.name}`,
                      handleOrPhone: guild.name,
                      avatarText: "#",
                      avatarBg: "#5865F2",
                      avatarUrl: guild.icon
                        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                        : null,
                      statusText: `Discord Channel • ${guild.name}`,
                      spend: "0 DA",
                      lastMessage: tc.topic || "Active Discord channel discussion",
                      time: "Live",
                      lastMessageTime: "Live",
                      timestamp: Date.now() - 3600000,
                      unreadCount: 0,
                      messages: [],
                      discordChannelId: tc.id,
                      isGuildChannel: true,
                      guildName: guild.name,
                    });
                  }
                }
              }
            } catch {}
          }
        }
      }
    } catch (gErr) {
      console.warn("Failed to fetch Discord Guilds:", gErr);
    }

    // Sort all chats by latest timestamp descending
    chats.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return NextResponse.json({
      success: true,
      status: "connected",
      channelId: "discord",
      isLive: true,
      account: {
        id: meData.id,
        username: meData.username,
        displayName: meData.global_name || meData.username,
        avatar: meData.avatar
          ? `https://cdn.discordapp.com/avatars/${meData.id}/${meData.avatar}.png`
          : null,
      },
      count: chats.length,
      chats,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch Discord chats", chats: [] },
      { status: 500 }
    );
  }
}
