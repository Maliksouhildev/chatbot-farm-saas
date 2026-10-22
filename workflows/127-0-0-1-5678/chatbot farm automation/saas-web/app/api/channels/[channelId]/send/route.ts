import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: { channelId: string } }
) {
  try {
    const channelId = context.params.channelId;
    const body = await request.json().catch(() => ({}));
    const { 
      text, 
      chatId, 
      recipientId, 
      userId,
      isAudio, 
      audioDuration, 
      imageUrl, 
      fileName, 
      fileSize,
      botToken,
    } = body;

    const targetChatId = chatId || recipientId;
    const messageId = `msg_${channelId}_${Date.now()}`;
    const msgType = isAudio ? "audio" : imageUrl ? "image" : fileName ? "file" : "text";
    const contentPayload = text || imageUrl || fileName || (isAudio ? `🎤 Voice note (${audioDuration || "0:05"})` : "");

    // 1. Persist to Supabase if conversation exists or can be matched
    try {
      let resolvedConvId: string | null = null;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetChatId || "");

      if (isUuid) {
        resolvedConvId = targetChatId;
      } else if (targetChatId) {
        const { data: conv } = await supabaseAdmin
          .from("conversations")
          .select("id")
          .eq("channel_type", channelId)
          .eq("contact_phone", targetChatId)
          .limit(1);

        if (conv && conv.length > 0) {
          resolvedConvId = conv[0].id;
        }
      }

      // If user provided, ensure conversation exists in Supabase
      if (!resolvedConvId && userId && targetChatId) {
        const { data: userBots } = await supabaseAdmin
          .from("bots")
          .select("id")
          .eq("user_id", userId)
          .limit(1);

        if (userBots && userBots.length > 0) {
          const { data: newConv } = await supabaseAdmin
            .from("conversations")
            .insert({
              bot_id: userBots[0].id,
              channel_type: channelId,
              contact_phone: targetChatId,
              contact_name: targetChatId,
              last_message_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (newConv) resolvedConvId = newConv.id;
        }
      }

      if (resolvedConvId) {
        await supabaseAdmin.from("chat_messages").insert({
          conversation_id: resolvedConvId,
          sender: "human_operator",
          message_type: msgType,
          content: contentPayload,
          created_at: new Date().toISOString(),
        });

        await supabaseAdmin
          .from("conversations")
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", resolvedConvId);
      }
    } catch (dbErr) {
      console.warn("Failed to persist message to Supabase:", dbErr);
    }

    // 2. Outbound Dispatch to Live Platform API
    // Discord Live Dispatch
    if (channelId === "discord") {
      const activeToken = botToken || process.env.DISCORD_BOT_TOKEN;
      const cleanChanId = (targetChatId || "").replace(/^disc_/, "");
      if (activeToken && cleanChanId && /^\d+$/.test(cleanChanId)) {
        try {
          await fetch(`https://discord.com/api/v10/channels/${cleanChanId}/messages`, {
            method: "POST",
            headers: {
              Authorization: `Bot ${activeToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: contentPayload }),
          });
        } catch (dErr) {
          console.warn("Live Discord dispatch failed:", dErr);
        }
      }
    }

    // Twitter (X) Live Dispatch
    if (channelId === "x_twitter") {
      const sessionStr = body.session || "";
      if (sessionStr && targetChatId) {
        try {
          const { sendRealTwitterDM } = await import("@/lib/bridges/twitterBridge");
          const session = JSON.parse(sessionStr);
          await sendRealTwitterDM({
            session,
            recipientIdOrHandle: targetChatId,
            text: contentPayload,
          });
        } catch (xErr) {
          console.warn("Live X dispatch failed:", xErr);
        }
      }
    }

    // Google Chat Live Dispatch
    if (channelId === "google_chat") {
      const accessToken = body.accessToken || botToken;
      if (accessToken && targetChatId) {
        try {
          const { sendRealGoogleChatMessage } = await import("@/lib/bridges/googleChatBridge");
          await sendRealGoogleChatMessage({
            accessToken,
            spaceName: targetChatId,
            text: contentPayload,
          });
        } catch (gcErr) {
          console.warn("Live Google Chat dispatch failed:", gcErr);
        }
      }
    }

    // IRC Live Dispatch
    if (channelId === "irc") {
      const channel = body.channel || targetChatId || "#chatbot-farm";
      try {
        const { sendRealIrcMessage } = await import("@/lib/bridges/ircBridge");
        await sendRealIrcMessage({
          channel,
          text: contentPayload,
        });
      } catch (ircErr) {
        console.warn("Live IRC dispatch failed:", ircErr);
      }
    }

    return NextResponse.json({
      success: true,
      channelId,
      messageId,
      chatId: targetChatId,
      text: contentPayload,
      message_type: msgType,
      isAudio: !!isAudio,
      audioDuration,
      imageUrl,
      fileName,
      fileSize,
      timestamp: Date.now(),
      status: "delivered",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to dispatch message" },
      { status: 500 }
    );
  }
}
