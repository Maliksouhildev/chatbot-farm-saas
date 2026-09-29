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
    const chat = chats.find((c) => c.id === chatId) || chats[0];

    return NextResponse.json({
      status: "ok",
      channelId,
      chatId: chat ? chat.id : chatId,
      messages: chat ? chat.messages : [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch messages", messages: [] },
      { status: 500 }
    );
  }
}
