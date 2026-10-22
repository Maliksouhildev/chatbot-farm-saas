import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { CHANNEL_STARTER_CHATS } from "@/lib/channelRegistry";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: { channelId: string } }
) {
  try {
    const channelId = context.params.channelId;
    const body = await request.json().catch(() => ({}));
    const { method = "auto_import", userId, contactData } = body;

    // 1. Resolve merchant's bot_id
    let botId: string | null = null;
    if (userId) {
      const { data: userBots } = await supabaseAdmin
        .from("bots")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      if (userBots && userBots.length > 0) {
        botId = userBots[0].id;
      } else {
        const { data: newBot } = await supabaseAdmin
          .from("bots")
          .insert({
            user_id: userId,
            name: "Store Omnichannel Assistant",
            business_type: "retail",
            primary_language: "darija_latin",
            enabled_languages: ["darija_latin", "french", "darija_arabic"],
            base_persona: "Warm commercial assistant for Chatbot Farm merchants.",
            is_active: true,
          })
          .select("id")
          .single();
        if (newBot) botId = newBot.id;
      }
    }

    // 2. Add Contact Method
    if (method === "add_contact") {
      const { handle, name, initialMessage = "Bonjour !" } = contactData || {};
      const cleanHandle = (handle || "").trim();
      const contactName = (name || cleanHandle).trim();

      if (!cleanHandle) {
        return NextResponse.json({ error: "Handle or phone number is required" }, { status: 400 });
      }

      let convId = `local_${Date.now()}`;
      if (botId) {
        const { data: conv } = await supabaseAdmin
          .from("conversations")
          .insert({
            bot_id: botId,
            channel_type: channelId,
            contact_phone: cleanHandle,
            contact_name: contactName,
            last_message_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (conv) {
          convId = conv.id;
          await supabaseAdmin.from("chat_messages").insert({
            conversation_id: convId,
            sender: "human_operator",
            message_type: "text",
            content: initialMessage,
            created_at: new Date().toISOString(),
          });
        }
      }

      const newContact = {
        id: convId,
        appId: channelId,
        name: contactName,
        handleOrPhone: cleanHandle,
        avatarText: (contactName || "U")[0].toUpperCase(),
        avatarBg: "#1B6648",
        statusText: `${channelId.toUpperCase()} Contact`,
        spend: "0 DA",
        lastMessage: initialMessage,
        time: "Just now",
        lastMessageTime: "Just now",
        timestamp: Date.now(),
        unreadCount: 0,
        messages: [
          {
            id: `msg_${Date.now()}`,
            sender: "operator",
            text: initialMessage,
            time: "Just now",
            seen: true,
          },
        ],
      };

      return NextResponse.json({
        success: true,
        channelId,
        contact: newContact,
        message: `Contact ${contactName} added to ${channelId}`,
      });
    }

    // 3. Auto Import Method
    let importedThreads: any[] = [];
    if (botId) {
      const { data: existingConvs } = await supabaseAdmin
        .from("conversations")
        .select("*, chat_messages(*)")
        .eq("channel_type", channelId)
        .eq("bot_id", botId);

      if (existingConvs && existingConvs.length > 0) {
        importedThreads = existingConvs.map((c: any) => ({
          id: c.id,
          contact: {
            id: c.id,
            appId: channelId,
            name: c.contact_name || c.contact_phone,
            handleOrPhone: c.contact_phone,
            avatarText: (c.contact_name || "U")[0].toUpperCase(),
            avatarBg: "#1B6648",
            statusText: `${channelId.toUpperCase()} Contact`,
            spend: "4,800 DA",
            lastMessage: c.chat_messages?.[c.chat_messages.length - 1]?.content || "Tap to view",
            time: "Synced",
            lastMessageTime: "Synced",
            timestamp: new Date(c.last_message_at || c.created_at).getTime(),
            unreadCount: 0,
            messages: (c.chat_messages || []).map((m: any) => ({
              id: m.id,
              sender: m.sender === "human_operator" || m.sender === "operator" ? "operator" : "customer",
              text: m.content,
              time: "Synced",
              seen: true,
            })),
          },
        }));
      } else {
        // Seed starter chats
        const starters = CHANNEL_STARTER_CHATS[channelId] || [];
        importedThreads = starters.map((s) => ({ id: s.id, contact: s }));
      }
    }

    return NextResponse.json({
      success: true,
      channelId,
      message: `Successfully synchronized ${importedThreads.length} conversations for ${channelId}`,
      threads: importedThreads,
      count: importedThreads.length,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to sync channel" },
      { status: 500 }
    );
  }
}
