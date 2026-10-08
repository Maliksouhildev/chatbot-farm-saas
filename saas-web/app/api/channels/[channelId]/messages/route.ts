import { NextRequest, NextResponse } from "next/server";
import { PAIRED_CHATS_BY_APP } from "@/lib/mock_chats";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: { channelId: string } }
) {
  try {
    const channelId = context.params.channelId;
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId") || searchParams.get("conversationId") || searchParams.get("remoteJid");

    const chats = PAIRED_CHATS_BY_APP[channelId] || [];
    const chat = chatId ? chats.find((c) => c.id === chatId || c.handleOrPhone === chatId || c.username === chatId) : null;

    const topicId = searchParams.get("topicId");
    let messages = chat ? (chat.messages || []) : [];
    if (topicId && messages.length > 0) {
      messages = messages.filter((m: any) => 
        String(m.topicId) === String(topicId) || 
        (String(topicId) === "1" && (!m.topicId || String(m.topicId) === "1"))
      );
    }

    return NextResponse.json({
      status: "ok",
      channelId,
      chatId: chat ? chat.id : (chatId || ""),
      messages,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch messages", messages: [] },
      { status: 500 }
    );
  }
}
