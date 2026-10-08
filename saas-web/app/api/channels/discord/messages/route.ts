import { NextRequest, NextResponse } from "next/server";
import { PAIRED_CHATS_BY_APP } from "@/lib/mock_chats";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawChatId = searchParams.get("channelId") || searchParams.get("chatId") || "";
    const rawToken = searchParams.get("token") || searchParams.get("botToken") || process.env.DISCORD_BOT_TOKEN || "";

    const cleanChanId = rawChatId
      .replace(/^disc_dm_/, "")
      .replace(/^disc_chan_/, "")
      .replace(/^disc_/, "");

    const pairedChat = (PAIRED_CHATS_BY_APP.discord || []).find(
      (c) => c.id === rawChatId || c.id === cleanChanId || c.handleOrPhone === rawChatId
    );

    if (!cleanChanId || !/^\d+$/.test(cleanChanId)) {
      if (pairedChat && pairedChat.messages) {
        return NextResponse.json({
          success: true,
          channelId: rawChatId,
          messages: pairedChat.messages,
        });
      }
      return NextResponse.json({
        success: true,
        channelId: cleanChanId,
        messages: [],
      });
    }

    if (!rawToken) {
      if (pairedChat && pairedChat.messages) {
        return NextResponse.json({
          success: true,
          channelId: rawChatId,
          messages: pairedChat.messages,
        });
      }
      return NextResponse.json({
        success: true,
        channelId: cleanChanId,
        messages: [],
      });
    }

    // Resolve Authorization Header
    let authHeader = rawToken;
    let meData: any = null;

    if (rawToken.startsWith("Bot ")) {
      authHeader = rawToken;
      const res = await fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: authHeader },
      });
      if (res.ok) meData = await res.json();
    } else {
      const userRes = await fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: rawToken },
      });
      if (userRes.ok) {
        authHeader = rawToken;
        meData = await userRes.json();
      } else {
        const botRes = await fetch("https://discord.com/api/v10/users/@me", {
          headers: { Authorization: `Bot ${rawToken}` },
        });
        if (botRes.ok) {
          authHeader = `Bot ${rawToken}`;
          meData = await botRes.json();
        }
      }
    }

    const res = await fetch(`https://discord.com/api/v10/channels/${cleanChanId}/messages?limit=50`, {
      headers: { Authorization: authHeader },
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Discord API error: ${res.statusText}`, details: errText, messages: [] },
        { status: res.status }
      );
    }

    const discordMsgs = await res.json();
    if (!Array.isArray(discordMsgs)) {
      return NextResponse.json({ success: true, channelId: cleanChanId, messages: [] });
    }

    const currentUserId = meData?.id;

    // Discord returns messages newest first; reverse for chronological feed
    const chronological = discordMsgs.slice().reverse();

    const formatted = chronological.map((m: any) => {
      const isOperator = currentUserId ? m.author?.id === currentUserId : false;
      const d = new Date(m.timestamp);
      const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      let imageUrl: string | undefined = undefined;
      let fileName: string | undefined = undefined;
      let fileSize: string | undefined = undefined;

      if (Array.isArray(m.attachments) && m.attachments.length > 0) {
        const firstAtt = m.attachments[0];
        if (firstAtt.content_type?.startsWith("image/")) {
          imageUrl = firstAtt.url;
        } else {
          fileName = firstAtt.filename;
          fileSize = `${Math.round(firstAtt.size / 1024)} KB`;
        }
      }

      return {
        id: m.id,
        sender: isOperator ? "operator" : "customer",
        text: m.content || (imageUrl ? "Photo" : fileName ? `Attachment: ${fileName}` : ""),
        time: timeStr,
        timestamp: d.getTime(),
        delivered: true,
        seen: false,
        imageUrl,
        fileName,
        fileSize,
        authorName: m.author?.global_name || m.author?.username || "Discord User",
        authorAvatar: m.author?.avatar
          ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png`
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      channelId: cleanChanId,
      count: formatted.length,
      messages: formatted,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch Discord messages", messages: [] },
      { status: 500 }
    );
  }
}
