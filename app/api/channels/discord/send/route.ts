import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { 
      chatId, 
      recipientId, 
      text, 
      token, 
      botToken, 
      userId,
      isAudio,
      audioDuration,
    } = body;

    const targetChatId = chatId || recipientId;
    const rawToken = token || botToken || process.env.DISCORD_BOT_TOKEN || "";
    const cleanChanId = (targetChatId || "")
      .replace(/^disc_dm_/, "")
      .replace(/^disc_chan_/, "")
      .replace(/^disc_/, "");

    const contentPayload = text || (isAudio ? `🎤 Voice note (${audioDuration || "0:05"})` : "");

    if (!cleanChanId || !/^\d+$/.test(cleanChanId)) {
      return NextResponse.json(
        { error: "Invalid Discord channel or DM ID" },
        { status: 400 }
      );
    }

    if (!rawToken) {
      return NextResponse.json(
        { error: "Discord token is required to dispatch live messages" },
        { status: 401 }
      );
    }

    // Resolve Authorization Header (User Token vs Bot Token)
    let authHeader = rawToken;
    if (rawToken.startsWith("Bot ")) {
      authHeader = rawToken;
    } else {
      // Test user token first
      const checkRes = await fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: rawToken },
      });
      if (checkRes.ok) {
        authHeader = rawToken;
      } else {
        authHeader = `Bot ${rawToken}`;
      }
    }

    // Dispatch message to Discord Channel/DM API
    const discordRes = await fetch(`https://discord.com/api/v10/channels/${cleanChanId}/messages`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: contentPayload }),
    });

    if (!discordRes.ok) {
      const errText = await discordRes.text();
      return NextResponse.json(
        { error: "Failed to dispatch message to Discord", details: errText },
        { status: discordRes.status }
      );
    }

    const discordMsg = await discordRes.json();

    // Persist to Supabase if merchant has bot setup
    try {
      if (userId) {
        const { data: userBots } = await supabaseAdmin
          .from("bots")
          .select("id")
          .eq("user_id", userId)
          .limit(1);

        if (userBots && userBots.length > 0) {
          const { data: conv } = await supabaseAdmin
            .from("conversations")
            .select("id")
            .eq("channel_type", "discord")
            .eq("contact_phone", targetChatId)
            .limit(1);

          let convId = conv?.[0]?.id;
          if (!convId) {
            const { data: newConv } = await supabaseAdmin
              .from("conversations")
              .insert({
                bot_id: userBots[0].id,
                channel_type: "discord",
                contact_phone: targetChatId,
                contact_name: targetChatId,
                last_message_at: new Date().toISOString(),
              })
              .select("id")
              .single();
            if (newConv) convId = newConv.id;
          }

          if (convId) {
            await supabaseAdmin.from("chat_messages").insert({
              conversation_id: convId,
              sender: "human_operator",
              message_type: isAudio ? "audio" : "text",
              content: contentPayload,
              created_at: new Date().toISOString(),
            });
            await supabaseAdmin
              .from("conversations")
              .update({ last_message_at: new Date().toISOString() })
              .eq("id", convId);
          }
        }
      }
    } catch (dbErr) {
      console.warn("Discord message Supabase backup error:", dbErr);
    }

    return NextResponse.json({
      success: true,
      messageId: discordMsg.id,
      chatId: targetChatId,
      text: discordMsg.content,
      author: discordMsg.author?.username,
      timestamp: new Date(discordMsg.timestamp).getTime(),
      status: "delivered",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send message to Discord" },
      { status: 500 }
    );
  }
}
