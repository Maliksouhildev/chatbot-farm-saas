import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: { channelId: string } }
) {
  try {
    const channelId = context.params.channelId;
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId") || searchParams.get("conversationId") || searchParams.get("remoteJid");

    if (chatId) {
      // Fetch authentic stored messages for this conversation from Supabase
      const { data: conv } = await supabaseAdmin
        .from("conversations")
        .select("id, chat_messages(*)")
        .or(`id.eq.${chatId},contact_phone.eq.${chatId}`)
        .maybeSingle();

      if (conv && conv.chat_messages && conv.chat_messages.length > 0) {
        const sortedMsgs = conv.chat_messages
          .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((m: any) => ({
            id: m.id,
            sender: m.sender || (m.from_me ? "operator" : "customer"),
            text: m.content || m.text || "",
            time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            timestamp: new Date(m.created_at).getTime(),
            delivered: true,
            seen: true,
          }));

        return NextResponse.json({
          status: "ok",
          channelId,
          chatId,
          messages: sortedMsgs,
        });
      }
    }

    return NextResponse.json({
      status: "ok",
      channelId,
      chatId,
      messages: [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch messages", messages: [] },
      { status: 500 }
    );
  }
}
