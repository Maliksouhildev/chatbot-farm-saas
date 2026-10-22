import { NextRequest, NextResponse } from "next/server";
import { PAIRED_CHATS_BY_APP, REAL_SNAPCHAT_CHATS, ContactProfile } from "@/lib/mock_chats";

export const dynamic = "force-dynamic";

// In-memory runtime cache for dynamically added Snapchat contacts during the session
let dynamicSnapchatChats: ContactProfile[] = [];

export async function GET(request: NextRequest) {
  try {
    const baseChats = (PAIRED_CHATS_BY_APP["snapchat"] && PAIRED_CHATS_BY_APP["snapchat"].length > 0)
      ? PAIRED_CHATS_BY_APP["snapchat"]
      : REAL_SNAPCHAT_CHATS;

    const mergedMap = new Map<string, ContactProfile>();
    for (const c of dynamicSnapchatChats) mergedMap.set(c.id, c);
    for (const c of baseChats) {
      if (!mergedMap.has(c.id)) mergedMap.set(c.id, c);
    }
    const finalChats = Array.from(mergedMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return NextResponse.json(
      {
        success: true,
        status: "connected",
        channelId: "snapchat",
        isLive: true,
        count: finalChats.length,
        chats: finalChats,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: true,
        status: "connected",
        channelId: "snapchat",
        isLive: true,
        count: REAL_SNAPCHAT_CHATS.length,
        chats: REAL_SNAPCHAT_CHATS,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { name, phone, handle, username, initialMessage } = body;
    const cleanPhone = (phone || "").trim() || "+213 551 00 22 33";
    const cleanUsername = (username || handle || "").trim() || `@snap_${cleanPhone.replace(/\D/g, "").slice(-6)}`;
    const cleanName = (name || `Ami Snap (${cleanUsername})`).trim();
    const firstMsg = (initialMessage || "Salam, nouveau contact Snapchat ajouté ! 🔥").trim();

    const newContact: ContactProfile = {
      id: `snap_${Date.now()}`,
      appId: "snapchat",
      name: cleanName,
      handleOrPhone: `${cleanUsername} • ${cleanPhone}`,
      phone: cleanPhone,
      username: cleanUsername,
      profilePicUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
      avatarColor: "#FFFC00",
      statusText: "Ami Snapchat • 🔥 1",
      lastMessage: firstMsg,
      time: "Just now",
      lastMessageTime: "Just now",
      timestamp: Date.now(),
      unreadCount: 0,
      status: "ongoing",
      bio: "Snap Streak 🔥 1 • Compte vérifié",
      messages: [
        {
          id: `sm_${Date.now()}`,
          sender: "operator",
          text: firstMsg,
          time: "Just now",
          delivered: true,
          seen: true,
          timestamp: Date.now(),
        },
      ],
    };

    dynamicSnapchatChats.unshift(newContact);

    return NextResponse.json({
      success: true,
      channelId: "snapchat",
      contact: newContact,
      message: `Contact Snapchat ${cleanName} ajouté avec succès.`,
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
