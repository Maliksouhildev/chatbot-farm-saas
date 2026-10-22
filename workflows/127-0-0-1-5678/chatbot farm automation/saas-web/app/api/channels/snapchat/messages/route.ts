import { NextRequest, NextResponse } from "next/server";
import { PAIRED_CHATS_BY_APP, ChatMessage } from "@/lib/mock_chats";

export const dynamic = "force-dynamic";

// In-memory runtime message store for live messaging persistence per Snapchat chat
const snapchatConversationStore = new Map<string, ChatMessage[]>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId") || searchParams.get("remoteJid");

    if (!chatId) {
      return NextResponse.json({ success: true, count: 0, messages: [] });
    }

    // Check dynamic store first
    if (snapchatConversationStore.has(chatId)) {
      const msgs = snapchatConversationStore.get(chatId) || [];
      return NextResponse.json({
        success: true,
        channelId: "snapchat",
        chatId,
        count: msgs.length,
        messages: msgs,
      });
    }

    // Search in paired Snapchat contacts or return empty list
    const allSnap = PAIRED_CHATS_BY_APP["snapchat"] || [];

    const matched = allSnap.find(
      (c) => c.id === chatId || c.handleOrPhone === chatId || (c.phone && c.phone === chatId) || (c.username && c.username === chatId)
    );

    const messages = matched?.messages || [];
    snapchatConversationStore.set(chatId, [...messages]);

    return NextResponse.json({
      success: true,
      channelId: "snapchat",
      chatId,
      count: messages.length,
      messages,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, messages: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { chatId, text, imageUrl, isAudio, audioDuration, isSnap } = body;

    if (!chatId) {
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }

    let defaultText = text;
    if (!defaultText) {
      if (isSnap) defaultText = "Snap envoyé (10s)";
      else if (isAudio) defaultText = "Note vocale Snapchat";
      else if (imageUrl) defaultText = "";
      else defaultText = "Chat";
    }

    const newMsg: ChatMessage = {
      id: `sm_${Date.now()}`,
      sender: "operator",
      text: defaultText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      delivered: true,
      seen: true,
      timestamp: Date.now(),
      imageUrl: imageUrl || undefined,
      isAudio: isAudio || false,
      audioDuration: audioDuration || undefined,
    };

    const existing = snapchatConversationStore.get(chatId) || [];
    existing.push(newMsg);
    snapchatConversationStore.set(chatId, existing);

    return NextResponse.json({
      success: true,
      status: "delivered",
      channelId: "snapchat",
      messageId: newMsg.id,
      timestamp: Date.now(),
      message: newMsg,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
