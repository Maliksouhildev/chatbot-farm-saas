import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

const SYNTHETIC_NAMES = [
  "Mohamed Constantine",
  "Amira Oran (Mode & Robes)",
  "Karim Signal DZ",
  "Fatima Zohra Oran",
  "Mourad Constantinois",
  "Sofiane Alger (VIP)",
  "Lina Oran (Mode DZ)",
  "Yacine Commerce Alger",
  "sarah.lifestyle.dz",
  "El Bahdja Store DZ",
  "Visiteur #482 (Alger)",
  "Algerie Import SARL",
  "#commandes-dz",
  "Karim_Alger#4821",
  "Yacine_Gaming#1337",
  "#b2b-grossistes",
  "Mehdi Benali (Comptabilité)",
  "Samir Tech DZ",
  "DZ Fashion Trends"
];

export async function POST(req: NextRequest) {
  try {
    let deletedCount = 0;

    for (const name of SYNTHETIC_NAMES) {
      // Find conversations with synthetic names
      const { data: convs } = await supabaseAdmin
        .from("conversations")
        .select("id")
        .ilike("contact_name", `%${name}%`);

      if (convs && convs.length > 0) {
        const convIds = convs.map((c) => c.id);
        // Delete messages
        await supabaseAdmin
          .from("chat_messages")
          .delete()
          .in("conversation_id", convIds);

        // Delete conversations
        const { error } = await supabaseAdmin
          .from("conversations")
          .delete()
          .in("id", convIds);

        if (!error) {
          deletedCount += convIds.length;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} synthetic mock conversations from database.`,
      deletedCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to cleanup mock conversations" },
      { status: 500 }
    );
  }
}
