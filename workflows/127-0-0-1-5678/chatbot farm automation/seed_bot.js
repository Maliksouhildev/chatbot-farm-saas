const SUPABASE_URL = "https://nxovnidenzneydcovmnh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b3ZuaWRlbnpuZXlkY292bW5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI3NzE3NiwiZXhwIjoyMTA0ODUzMTc2fQ.iwOaeENgTbXx53OJkaapM7y0PUg7BLnQAvG2-aGtAQ8";

async function main() {
    console.log("Creating Admin User...");
    // 1. Create or get user
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
            "apikey": SERVICE_KEY,
            "Authorization": `Bearer ${SERVICE_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: "admin@chatbotfarm.dz",
            password: "AdminPassword2026!",
            email_confirm: true,
            user_metadata: { full_name: "Admin Store" }
        })
    });
    
    let userId;
    const userData = await userRes.json();
    if (userData && userData.id) {
        userId = userData.id;
        console.log("User Created:", userId);
    } else {
        // List users to get existing
        const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
            headers: {
                "apikey": SERVICE_KEY,
                "Authorization": `Bearer ${SERVICE_KEY}`
            }
        });
        const listData = await listRes.json();
        userId = listData.users[0]?.id;
        console.log("Using Existing User:", userId);
    }

    if (!userId) {
        throw new Error("Could not create or find user");
    }

    // 2. Create Profile
    await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: "POST",
        headers: {
            "apikey": SERVICE_KEY,
            "Authorization": `Bearer ${SERVICE_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify({
            id: userId,
            full_name: "El Bahdja Store Admin",
            phone_number: "0551671229",
            company_name: "El Bahdja Store",
            role: "admin"
        })
    });

    // 3. Create Subscription with 10,000 credits
    console.log("Creating Subscription...");
    await fetch(`${SUPABASE_URL}/rest/v1/subscriptions`, {
        method: "POST",
        headers: {
            "apikey": SERVICE_KEY,
            "Authorization": `Bearer ${SERVICE_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify({
            user_id: userId,
            plan_tier: "pro",
            status: "active",
            monthly_message_quota: 10000,
            messages_used: 0,
            credits_remaining: 10000,
            billing_gateway: "manual"
        })
    });

    // 4. Create Bot
    console.log("Creating Bot...");
    const botRes = await fetch(`${SUPABASE_URL}/rest/v1/bots`, {
        method: "POST",
        headers: {
            "apikey": SERVICE_KEY,
            "Authorization": `Bearer ${SERVICE_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        },
        body: JSON.stringify({
            user_id: userId,
            name: "El Bahdja Store Assistant",
            business_type: "retail",
            primary_language: "darija_latin",
            base_persona: "You are a warm, helpful Algerian commercial assistant for El Bahdja store. Welcome clients warmly with authentic Darija ('Saha khoya, marhba bik!', 'Chhal mn pièce thab tcommondi?'). Always quote prices in DZD (e.g. 3500 DA).",
            custom_system_prompt: "Catalog: 1) Parfum Sauvage Élixir: 3500 DA. 2) Montre Homme Noire: 4800 DA. Livraison disponible vers les 58 wilayas via Yalidine (400 DA Alger, 700 DA autres wilayas). Paiement à la livraison.",
            contact_human_number: "0551671229",
            auto_mute_minutes: 30,
            voice_notes_enabled: true,
            is_active: true
        })
    });
    const botData = await botRes.json();
    const botId = botData[0]?.id;
    console.log("Bot created with ID:", botId);

    // 5. Link default_instance
    console.log("Linking default_instance channel...");
    await fetch(`${SUPABASE_URL}/rest/v1/bot_channels`, {
        method: "POST",
        headers: {
            "apikey": SERVICE_KEY,
            "Authorization": `Bearer ${SERVICE_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify({
            bot_id: botId,
            channel_type: "whatsapp",
            instance_name: "default_instance",
            channel_identifier: "213551671229",
            status: "connected"
        })
    });

    console.log("SUCCESS! All tables seeded and default_instance is fully linked to Bot ID:", botId);
}

main().catch(console.error);
