import { NextRequest, NextResponse } from "next/server";
import { ContactProfile } from "@/lib/mock_chats";

export const dynamic = "force-dynamic";

// In-memory runtime cache for dynamically added contacts during the session
let dynamicViberChats: ContactProfile[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token =
      searchParams.get("token") ||
      request.headers.get("x-viber-auth-token") ||
      process.env.VIBER_BOT_TOKEN ||
      "";

    // 1. Unlinked state: if no token provided and no dynamic session chats
    if (!token && dynamicViberChats.length === 0) {
      return NextResponse.json(
        {
          success: true,
          status: "unlinked",
          channelId: "viber",
          isLive: false,
          count: 0,
          chats: [],
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Viber-Auth-Token",
          },
        }
      );
    }

    // 2. Real Viber Bot API authentication and account info
    let accountInfo: any = null;
    let viberApiChats: ContactProfile[] = [];

    if (token) {
      try {
        const viberRes = await fetch("https://chatapi.viber.com/pa/get_account_info", {
          method: "POST",
          headers: {
            "X-Viber-Auth-Token": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
          signal: AbortSignal.timeout(4000),
        });

        if (viberRes.ok) {
          const vData = await viberRes.json();
          if (vData.status === 0) {
            accountInfo = vData;
            const members = Array.isArray(vData.members) ? vData.members : [];
            viberApiChats = members.map((m: any) => ({
              id: m.id,
              appId: "viber",
              name: m.name || "Abonné Viber",
              handleOrPhone: m.id,
              profilePicUrl: m.avatar || null,
              avatarColor: "#7360F2",
              statusText: m.role === "admin" ? "Administrateur Viber" : "Abonné Viber",
              lastMessage: "Discussion Viber active",
              time: "En ligne",
              lastMessageTime: "En ligne",
              timestamp: Date.now(),
              unreadCount: 0,
              status: "ongoing",
              messages: [],
            }));
          }
        }
      } catch (err: any) {
        console.warn("Viber Bot API verification failed:", err.message);
      }
    }

    // 3. Merge live Viber API contacts with runtime dynamic contacts
    const mergedMap = new Map<string, ContactProfile>();
    for (const c of dynamicViberChats) mergedMap.set(c.id, c);
    for (const c of viberApiChats) {
      if (!mergedMap.has(c.id)) mergedMap.set(c.id, c);
    }

    const finalChats = Array.from(mergedMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    const isLive = Boolean(accountInfo || token || finalChats.length > 0);

    return NextResponse.json(
      {
        success: true,
        status: isLive ? "connected" : "unlinked",
        channelId: "viber",
        isLive,
        account: accountInfo,
        count: finalChats.length,
        chats: finalChats,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Viber-Auth-Token",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: true,
        status: dynamicViberChats.length > 0 ? "connected" : "unlinked",
        channelId: "viber",
        isLive: dynamicViberChats.length > 0,
        count: dynamicViberChats.length,
        chats: dynamicViberChats,
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
    const { name, phone, handle, initialMessage } = body;
    const cleanPhone = (phone || handle || "").trim();
    if (!cleanPhone) {
      return NextResponse.json({ success: false, error: "Numéro de téléphone requis" }, { status: 400 });
    }
    const cleanName = (name || `Contact Viber (${cleanPhone})`).trim();
    const firstMsg = (initialMessage || "Nouveau contact Viber connecté.").trim();

    const newContact: ContactProfile = {
      id: `vib_${Date.now()}`,
      appId: "viber",
      name: cleanName,
      handleOrPhone: cleanPhone,
      phone: cleanPhone,
      avatarColor: "#7360F2",
      statusText: "En ligne",
      lastMessage: firstMsg,
      time: "Just now",
      lastMessageTime: "Just now",
      timestamp: Date.now(),
      unreadCount: 0,
      status: "ongoing",
      messages: [
        {
          id: `vm_${Date.now()}`,
          sender: "operator",
          text: firstMsg,
          time: "Just now",
          delivered: true,
          seen: true,
          timestamp: Date.now(),
        },
      ],
    };

    dynamicViberChats.unshift(newContact);

    return NextResponse.json({
      success: true,
      channelId: "viber",
      contact: newContact,
      message: `Contact ${cleanName} ajouté avec succès.`,
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
