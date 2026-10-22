import { NextRequest, NextResponse } from "next/server";
import { ChatMessage } from "@/lib/mock_chats";

export const dynamic = "force-dynamic";

// In-memory runtime message store for live messaging persistence per chat
const viberConversationStore = new Map<string, ChatMessage[]>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId") || searchParams.get("remoteJid");

    if (!chatId) {
      return NextResponse.json({ success: true, count: 0, messages: [] });
    }

    const msgs = viberConversationStore.get(chatId) || [];
    return NextResponse.json({
      success: true,
      channelId: "viber",
      chatId,
      count: msgs.length,
      messages: msgs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, messages: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { chatId, text, imageUrl, isAudio, audioDuration, token } = body;

    if (!chatId) {
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }

    const viberToken = token || req.headers.get("x-viber-auth-token") || process.env.VIBER_BOT_TOKEN;

    // If an authentic Viber token is configured, dispatch to Viber Public Account Send API
    if (viberToken && !chatId.startsWith("vib_")) {
      try {
        const payload: any = {
          receiver: chatId,
          min_api_version: 1,
          type: imageUrl ? "picture" : "text",
          text: text || (imageUrl ? "Image" : ""),
          sender: {
            name: "Agent",
          },
        };
        if (imageUrl) {
          payload.media = imageUrl;
        }

        await fetch("https://chatapi.viber.com/pa/send_message", {
          method: "POST",
          headers: {
            "X-Viber-Auth-Token": viberToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(5000),
        });
      } catch (err: any) {
        console.warn("Viber send_message API notice:", err.message);
      }
    }

    const newMsg: ChatMessage = {
      id: `vm_${Date.now()}`,
      sender: "operator",
      text: text || "",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      delivered: true,
      seen: true,
      timestamp: Date.now(),
      imageUrl: imageUrl || undefined,
      isAudio: isAudio || false,
      audioDuration: audioDuration || undefined,
    };

    const existing = viberConversationStore.get(chatId) || [];
    existing.push(newMsg);
    viberConversationStore.set(chatId, existing);

    return NextResponse.json({
      success: true,
      status: "delivered",
      channelId: "viber",
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
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Viber-Auth-Token",
    },
  });
}
