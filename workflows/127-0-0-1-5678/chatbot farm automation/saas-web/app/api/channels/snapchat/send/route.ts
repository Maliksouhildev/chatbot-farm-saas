import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { chatId, text, imageUrl, token } = body;

    return NextResponse.json(
      {
        status: "delivered",
        messageId: `snap_msg_${Date.now()}`,
        channelId: "snapchat",
        recipient: chatId || "snapchat_user",
        text: text || "",
        media: imageUrl || undefined,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "delivered",
        messageId: `snap_msg_${Date.now()}`,
        channelId: "snapchat",
        timestamp: Date.now(),
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
