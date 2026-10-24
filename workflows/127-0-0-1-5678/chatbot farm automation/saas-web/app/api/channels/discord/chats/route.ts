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

    // 1. Check in-memory cache to prevent spamming Discord API
    const cacheKey = `${userId || ""}_${rawToken.substring(0, 25)}`;
    const globalDiscordCache: Map<string, { data: any; expiresAt: number }> =
      (globalThis as any).__discordChatsCache ||
      ((globalThis as any).__discordChatsCache = new Map());

    const cached = globalDiscordCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data);
    }

    // 2. Handle 1-Click / Sandbox Master Token
    if (rawToken.startsWith("Bot_ChatbotFarm")) {
      const communityGuild = {
        id: "guild_community_dz",
        appId: "discord",
        name: "Serveur Discord (Boutique)",
        handleOrPhone: "@chatbotfarm_dz",
        avatarText: "CF",
        avatarColor: "bg-[#5865F2]",
        avatarUrl: null,
        profilePicUrl: null,
        statusText: "4 salons actifs",
        spend: "0 DA",
        lastMessage: "#général : Bienvenue sur le serveur",
        time: "Live",
        lastMessageTime: "Live",
        timestamp: Date.now() - 3600000,
        unreadCount: 0,
        isGroup: true,
        topics: [
          { id: "dc_general", name: "général", category: "SALONS TEXTUELS", unreadCount: 0, type: "text", iconEmoji: "#" },
          { id: "dc_commandes", name: "commandes", category: "SALONS TEXTUELS", unreadCount: 0, type: "text", iconEmoji: "#" },
          { id: "dc_support", name: "support-client", category: "SALONS TEXTUELS", unreadCount: 0, type: "text", iconEmoji: "#" },
          { id: "dc_annonces", name: "annonces", category: "INFORMATIONS", unreadCount: 0, type: "announcement", iconEmoji: "#" },
        ],
        messages: [
          {
            id: "msg_dc_welcome",
            sender: "operator",
            text: "👋 Bienvenue sur votre serveur Discord lié à Chatbot Farm !",
            time: "10:00",
            timestamp: Date.now() - 1000 * 3600 * 4,
          },
        ],
      };

      const resultPayload = {
        success: true,
        status: "connected",
        channelId: "discord",
        isLive: true,
        account: {
          id: "1285293847291029504",
          username: "Client_Discord_DZ",
          displayName: "Client Discord DZ",
          avatar: null,
        },
        count: 1,
        chats: [communityGuild],
        timestamp: Date.now(),
      };

      globalDiscordCache.set(cacheKey, { data: resultPayload, expiresAt: Date.now() + 30000 });
      return NextResponse.json(resultPayload);
    }

    // 3. Resolve Authorization Header & Identity against Discord API (Bot Token Only)
    const authHeader = rawToken.startsWith("Bot ") ? rawToken : `Bot ${rawToken}`;
    let meData: any = null;
    const isBot = true;

    try {
      const res = await fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: authHeader },
      });
      if (res.ok) {
        meData = await res.json();
      }
    } catch (err: any) {
      console.warn("Discord @me fetch error:", err);
    }

    if (!meData) {
      return NextResponse.json(
        { error: "Token de Bot Discord invalide ou expiré. Veuillez vérifier votre Bot Token sur le Discord Developer Portal ou utiliser la connexion 1-Clic." },
        { status: 401 }
      );
    }

    const chats: any[] = [];
    const addedContactIds = new Set<string>();

    // 4. Fetch Direct Messages (DMs & Group DMs)
    try {
      const dmsRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
        headers: { Authorization: authHeader },
        signal: AbortSignal.timeout(3500),
      });

      if (dmsRes.ok) {
        const rawDms = await dmsRes.json();
        if (Array.isArray(rawDms)) {
          // For the top 15 most recent DMs, fetch recent message history
          for (const dm of rawDms.slice(0, 15)) {
            const isGroup = dm.type === 3;
            const recipient = dm.recipients?.[0] || {};
            const contactName = isGroup
              ? dm.name || (dm.recipients ? dm.recipients.map((r: any) => r.global_name || r.username).join(", ") : "Groupe Discord")
              : (recipient.global_name || recipient.username || "Contact Discord");
            const handle = isGroup
              ? `Groupe (${dm.recipients?.length || 0} membres)`
              : `@${recipient.username || "user"}`;
            const avatarUrl = recipient.avatar
              ? `https://cdn.discordapp.com/avatars/${recipient.id}/${recipient.avatar}.png`
              : null;

            // Fetch real messages for this DM channel
            let channelMessages: any[] = [];
            let lastMsgText = "Discussion active";
            let lastMsgTime = "Live";
            let lastMsgTimestamp = Date.now();

            try {
              const msgRes = await fetch(`https://discord.com/api/v10/channels/${dm.id}/messages?limit=20`, {
                headers: { Authorization: authHeader },
                signal: AbortSignal.timeout(2000),
              });
              if (msgRes.ok) {
                const rawMsgs = await msgRes.json();
                if (Array.isArray(rawMsgs) && rawMsgs.length > 0) {
                  // Discord returns messages newest first -> reverse for chronological order
                  channelMessages = rawMsgs.reverse().map((m: any) => {
                    const att = m.attachments?.[0];
                    const contentType = att?.content_type || "";
                    const fileNameLower = (att?.filename || "").toLowerCase();

                    const isImg = Boolean(
                      contentType.startsWith("image/") ||
                      fileNameLower.match(/\.(png|jpe?g|gif|webp|svg)$/i) ||
                      att?.width
                    );
                    const isAud = Boolean(
                      contentType.startsWith("audio/") ||
                      fileNameLower.match(/\.(mp3|ogg|wav|m4a|aac)$/i)
                    );
                    const isVid = Boolean(
                      contentType.startsWith("video/") ||
                      fileNameLower.match(/\.(mp4|webm|mov|mkv)$/i)
                    );

                    // Detect GIF or image links inside text content (Klipy, Tenor, Giphy, Imgur, direct urls)
                    let textContent = m.content || "";
                    let detectedMediaUrl: string | undefined = undefined;
                    if (!att && textContent) {
                      const linkMatch = textContent.match(/https?:\/\/[^\s]+(?:\.gif|\.png|\.jpe?g|\.webp|klipy\.com\/gifs\/[^\s]+|tenor\.com\/[^\s]+|giphy\.com\/[^\s]+)/i);
                      if (linkMatch) {
                        detectedMediaUrl = linkMatch[0];
                      }
                    }

                    const finalImgUrl = isImg ? att?.url : detectedMediaUrl;
                    const finalVidUrl = isVid ? att?.url : undefined;

                    return {
                      id: m.id,
                      sender: m.author?.id === meData.id ? "operator" : "customer",
                      text: textContent || (isImg ? "Photo" : isAud ? "Message vocal" : isVid ? "Vidéo" : att ? `${att.filename}` : "Message"),
                      time: new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      timestamp: new Date(m.timestamp).getTime(),
                      seen: true,
                      delivered: true,
                      authorName: m.author?.global_name || m.author?.username,
                      authorAvatar: m.author?.avatar
                        ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png`
                        : null,
                      imageUrl: finalImgUrl,
                      hasImages: Boolean(finalImgUrl),
                      isAudio: isAud,
                      audioDuration: isAud ? "0:15" : undefined,
                      videoUrl: finalVidUrl,
                      fileName: (!isImg && !isAud && !isVid && att) ? att.filename : undefined,
                      fileSize: att ? `${Math.round((att.size || 0) / 1024)} KB` : undefined,
                      fileUrl: att ? att.url : undefined,
                    };
                  });

                  const newestMsg = channelMessages[channelMessages.length - 1];
                  if (newestMsg) {
                    lastMsgText = newestMsg.text || "Message";
                    lastMsgTime = newestMsg.time;
                    lastMsgTimestamp = newestMsg.timestamp;
                  }
                }
              }
            } catch {}

            const contactItem = {
              id: dm.id,
              appId: "discord",
              name: contactName,
              handleOrPhone: handle,
              avatarText: (contactName || "D")[0].toUpperCase(),
              avatarBg: "#5865F2",
              avatarUrl,
              profilePicUrl: avatarUrl,
              statusText: isGroup ? "Discussion de groupe" : "Discussion privée",
              spend: "0 DA",
              lastMessage: lastMsgText,
              time: lastMsgTime,
              lastMessageTime: lastMsgTime,
              timestamp: lastMsgTimestamp,
              unreadCount: 0,
              messages: channelMessages,
              discordChannelId: dm.id,
              discordRecipientId: recipient.id,
              isDm: true,
              userStatus: "online",
              userActivity: isGroup ? "Discussion de groupe" : "Discussion privée",
              type: "dm",
              iconEmoji: isGroup ? "👥" : "👤",
            };

            chats.push(contactItem);
            addedContactIds.add(dm.id);
            if (recipient.id) addedContactIds.add(recipient.id);
          }
        }
      }
    } catch (dmErr) {
      console.warn("Failed to fetch Discord DMs:", dmErr);
    }



    // 6. Fetch Real Server Guilds & Channels (+ Members if Bot)
    try {
      const guildsRes = await fetch("https://discord.com/api/v10/users/@me/guilds", {
        headers: { Authorization: authHeader },
        signal: AbortSignal.timeout(3500),
      });

      if (guildsRes.ok) {
        const guilds = await guildsRes.json();
        if (Array.isArray(guilds)) {
          // Process joined guilds (up to 30 servers auto-injected safely)
          for (const guild of guilds.slice(0, 30)) {
            try {
              // 6a. If Bot, fetch guild members and list human members as individual contacts
              if (isBot) {
                try {
                  const membersRes = await fetch(`https://discord.com/api/v10/guilds/${guild.id}/members?limit=25`, {
                    headers: { Authorization: authHeader },
                    signal: AbortSignal.timeout(2500),
                  });
                  if (membersRes.ok) {
                    const members = await membersRes.json();
                    if (Array.isArray(members)) {
                      for (const m of members) {
                        const mu = m.user || {};
                        if (!mu.id || mu.bot || mu.id === meData.id || addedContactIds.has(mu.id)) continue;
                        const mName = m.nick || mu.global_name || mu.username || "Membre Serveur";
                        const mAvatar = mu.avatar
                          ? `https://cdn.discordapp.com/avatars/${mu.id}/${mu.avatar}.png`
                          : null;

                        chats.push({
                          id: mu.id,
                          appId: "discord",
                          name: mName,
                          handleOrPhone: `@${mu.username}`,
                          avatarText: (mName || "M")[0].toUpperCase(),
                          avatarBg: "#5865F2",
                          avatarUrl: mAvatar,
                          profilePicUrl: mAvatar,
                          statusText: `Membre • ${guild.name}`,
                          spend: "0 DA",
                          lastMessage: `Membre du serveur ${guild.name}`,
                          time: "Live",
                          lastMessageTime: "Live",
                          timestamp: Date.now() - 3600000,
                          unreadCount: 0,
                          messages: [],
                          discordRecipientId: mu.id,
                          isDm: true,
                          userStatus: "online",
                          userActivity: guild.name,
                          type: "dm",
                          iconEmoji: "👤",
                        });
                        addedContactIds.add(mu.id);
                      }
                    }
                  }
                } catch {}
              }

              // 6b. Fetch guild channels for the server group entry
              const chanRes = await fetch(`https://discord.com/api/v10/guilds/${guild.id}/channels`, {
                headers: { Authorization: authHeader },
                signal: AbortSignal.timeout(3000),
              });

              if (chanRes.ok) {
                const channels = await chanRes.json();
                if (Array.isArray(channels)) {
                  const categoryMap: Record<string, string> = {};
                  channels.filter((c: any) => c.type === 4).forEach((cat: any) => {
                    categoryMap[cat.id] = cat.name.toUpperCase();
                  });

                  const validChannels = channels.filter((c: any) => [0, 2, 5].includes(c.type));
                  const guildTopics = validChannels.map((tc: any) => ({
                    id: tc.id,
                    name: tc.name,
                    category: categoryMap[tc.parent_id] || "SALONS TEXTUELS",
                    unreadCount: 0,
                    type: tc.type === 2 ? "voice" : tc.type === 5 ? "announcement" : "text",
                    iconEmoji: tc.type === 2 ? "🔊" : "#",
                  }));

                  const guildIcon = guild.icon
                    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                    : null;

                  chats.push({
                    id: guild.id,
                    appId: "discord",
                    name: guild.name,
                    handleOrPhone: guild.name,
                    avatarText: guild.name.slice(0, 2).toUpperCase(),
                    avatarColor: "bg-[#5865F2]",
                    avatarUrl: guildIcon,
                    profilePicUrl: guildIcon,
                    statusText: `${guildTopics.length} salons`,
                    spend: "0 DA",
                    lastMessage: guildTopics[0] ? `#${guildTopics[0].name}` : "Serveur connecté",
                    time: "Live",
                    lastMessageTime: "Live",
                    timestamp: Date.now() - 3600000,
                    unreadCount: 0,
                    isGroup: true,
                    topics: guildTopics,
                    messages: [],
                  });
                }
              }
            } catch {}
          }
        }
      }
    } catch (gErr) {
      console.warn("Failed to fetch Discord Guilds:", gErr);
    }

    // 7. If Bot and has no guilds found yet, add primary server
    if (chats.length === 0 && isBot) {
      const botName = meData?.username || "Discord Assistant";
      chats.push({
        id: `guild_primary_${meData?.id || "bot"}`,
        appId: "discord",
        name: `${botName} (Serveur Principal)`,
        handleOrPhone: meData?.username ? `@${meData.username}` : "@discord_bot",
        avatarText: (botName || "D")[0].toUpperCase(),
        avatarColor: "bg-[#5865F2]",
        avatarUrl: meData?.avatar ? `https://cdn.discordapp.com/avatars/${meData.id}/${meData.avatar}.png` : null,
        profilePicUrl: meData?.avatar ? `https://cdn.discordapp.com/avatars/${meData.id}/${meData.avatar}.png` : null,
        statusText: "Serveur Discord Actif",
        spend: "0 DA",
        lastMessage: "Bot Discord connecté avec succès",
        time: "Live",
        lastMessageTime: "Live",
        timestamp: Date.now(),
        unreadCount: 0,
        isGroup: true,
        topics: [
          { id: "dc_general", name: "général", category: "SALONS TEXTUELS", unreadCount: 0, type: "text", iconEmoji: "#" },
          { id: "dc_commandes", name: "commandes", category: "SALONS TEXTUELS", unreadCount: 0, type: "text", iconEmoji: "#" },
          { id: "dc_support", name: "support-client", category: "SALONS TEXTUELS", unreadCount: 0, type: "text", iconEmoji: "#" },
          { id: "dc_annonces", name: "annonces", category: "INFORMATIONS", unreadCount: 0, type: "announcement", iconEmoji: "#" },
        ],
        messages: [
          {
            id: "msg_dc_welcome",
            sender: "operator",
            text: `👋 Bienvenue ! Votre compte Discord (${botName}) est connecté et opérationnel.`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            timestamp: Date.now(),
          },
        ],
      });
    }

    // Sort contacts: DMs first, latest timestamp descending
    chats.sort((a, b) => {
      if (a.isDm && !b.isDm) return -1;
      if (!a.isDm && b.isDm) return 1;
      return (b.timestamp || 0) - (a.timestamp || 0);
    });

    const resultPayload = {
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
    };

    globalDiscordCache.set(cacheKey, { data: resultPayload, expiresAt: Date.now() + 30000 });
    return NextResponse.json(resultPayload);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch Discord chats", chats: [] },
      { status: 500 }
    );
  }
}
