# Chatbot Farm SaaS (Algeria Edition) 🇩🇿

A complete, scalable multi-tenant SaaS platform empowering Algerian businesses to deploy AI chatbots that speak **authentic Algerian Darija** (in Latin Arabizi and Arabic script), French, and Arabic across **WhatsApp, Telegram, and Instagram**.

---

## 🚀 Key Features

1. **Instant WhatsApp QR Pairing**:
   - Clients link their existing WhatsApp business or personal phone number via a live QR code scan on the web dashboard (powered by Evolution API v2).
   - Zero per-number SIM costs for you. Clients keep their numbers and contacts.

2. **Authentic Algerian Darija Dialect Engine**:
   - Understands and speaks authentic Darija with numbers (3, 7, 9, 5).
   - Code-switches naturally between Arabizi, Arabic script, and French commercial terminology.
   - Enforces strict Algiers dialect boundaries (e.g. `doka/dorka`, `lazem`, `t3ich`, `ma ... ch` negative sandwich) with zero Moroccan/Levantine drift.

3. **WhatsApp Voice Notes (Vocaux) Transcription**:
   - Built-in speech-to-text pipeline using Groq Whisper (`whisper-large-v3`).
   - Understands spoken Algerian Darija voice messages and replies automatically.

4. **Multi-Source RAG Knowledge Base**:
   - Upload PDF brochures, catalogs, and menus.
   - Crawl website / store URLs.
   - Direct FAQ inputs and CSV/Excel product catalog parsing.
   - Indexed via OpenAI `text-embedding-3-small` into Supabase `pgvector` with HNSW cosine search.

5. **Smart Auto-Mute (Human Takeover)**:
   - When a business owner replies to a customer directly from their WhatsApp phone, the AI automatically pauses for 30 minutes.

6. **Algerian Payment Processing**:
   - **Chargily Pay v2**: Instant online card payments with **EDAHABIA** and **CIB** in DZD. Automated webhook credit activation.
   - **BaridiMob / CCP**: Manual receipt screenshot upload with 1-click admin approval.
   - **BYOK Tier**: Tech-savvy clients can bring their own OpenAI API key.

---

## 📂 Repository Structure

```
chatbot farm automation/
├── schema.sql                               # Complete Supabase PostgreSQL + pgvector schema
├── universal_omnichannel_router.json         # n8n Master Router Workflow (JSON format)
├── universal_omnichannel_router.workflow.ts  # n8n-as-code TypeScript workflow definition
├── docker-compose.yml                       # Turnkey VPS deployment (Evolution API, n8n, Redis, Postgres)
├── .env.example                             # Environment variables template
└── saas-web/                                # Next.js 14 Fullstack Dashboard
    ├── lib/
    │   ├── chargily.ts                      # Chargily Pay v2 SDK integration
    │   ├── evolution.ts                     # Evolution API v2 WhatsApp client
    │   ├── darija_prompt_builder.ts         # Algerian Darija system prompt compiler
    │   └── rag_processor.ts                 # Document chunker & vector embedding generator
    ├── app/
    │   └── api/webhooks/chargily/route.ts   # Chargily EDAHABIA payment webhook
    └── components/dashboard/
        ├── QRCodeCard.tsx                   # Live WhatsApp pairing QR code component
        ├── PromptCustomizer.tsx             # Darija dialect & business persona manager
        ├── KnowledgeBaseManager.tsx         # PDF / URL / FAQ RAG manager
        └── PricingPlans.tsx                 # DZD Subscription tiers & BaridiMob modal
```

---

## 🛠️ Step-by-Step Setup

### Step 1: Database Setup (Supabase)
1. Go to your [Supabase Dashboard](https://supabase.com) (or self-hosted PostgreSQL).
2. Open the **SQL Editor**.
3. Paste the contents of [`schema.sql`](./schema.sql) and run it.
4. This will enable `pgvector`, create all multi-tenant tables, and register the `match_knowledge_embeddings` and `process_bot_credit_deduction` stored procedures.

### Step 2: VPS Deployment (Single-Command Docker)
On your Ubuntu VPS (Hetzner, Contabo, etc.):
```bash
# Clone the repository
git clone <your-repo>
cd "chatbot farm automation"

# Copy and edit environment variables
cp .env.example .env
nano .env

# Launch containers
docker compose up -d
```

### Step 3: Import n8n Workflow
1. Access your n8n instance at `http://your-server-ip:5678` (or your domain).
2. Go to **Workflows > Import from File**.
3. Select [`universal_omnichannel_router.json`](./universal_omnichannel_router.json).
4. Activate the workflow. The webhook URL is:
   `https://n8n.yourdomain.dz/webhook/universal-omnichannel-router`

---

## 💰 Unit Economics & Pricing Tiers

| Tier | Price (DZD) | Included Messages | Features |
|---|---|---|---|
| **Starter** | **3,500 DA / month** | 1,500 msgs | 1 WhatsApp QR, Darija Arabizi & Arabic, PDFs/FAQs RAG, Auto-Mute |
| **Pro** | **7,500 DA / month** | 4,000 msgs | Voice Notes (Whisper), Omnichannel (WA + IG + TG), URL scraper, Excel catalog |
| **BYOK** | **2,000 DA / month** | Unlimited | Client supplies own OpenAI Key, full platform features |

Operating cost per active client is less than **300 DA / month** (using `gpt-4o-mini`), leaving **>90% profit margin**.
