# 🚀 Lead Engine: Production-Ready B2B Lead Gen & Omnichannel Outreach

An autonomous, self-hosted B2B Lead Generation, Qualification, and Omnichannel Outreach System engineered specifically for **Windows 11 (16GB RAM Host) with Docker Desktop (WSL2)**.

The system discovers and qualifies clients needing:
1. **AI Automations (n8n)**
2. **Custom Chatbots (WhatsApp, Instagram DM, Web)**
3. **Web Development & E-Commerce Infrastructure**

Across two primary markets:
- 🇩🇿 **Algeria (Local Market):** French & Algerian Darija (Arabizi + Arabic script). Solves local e-commerce pain points: *"Prix en privé"*, manual order processing, and *58 wilayas* delivery dispatch chaos (Yalidine, ZR Express).
- 🌐 **Global Market:** English & French B2B/SaaS/E-commerce. Solves workflow inefficiency, Zapier migration, CRM bottlenecks, and web dev needs.

---

## 🏛️ System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ACTIVE & PASSIVE SOURCES                           │
│  [Reddit PRAW]     [Telegram MTProto]   [Ouedkniss GraphQL]   [Google Dorks]    │
└────────┬───────────────────┬────────────────────┬──────────────────────┬────────┘
         │                   │                    │                      │
         ▼                   ▼                    ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    HARVESTERS MICROSERVICE (FastAPI :8000)                      │
│   • Redis SHA-256 Fingerprinting & 30-Day Deduplication                         │
│   • Multi-Lingual Regex Heuristics (Darija Arabizi, Arabic, French, English)    │
│   • APScheduler Automated Background Jobs (Hourly Scrapes)                      │
└─────────────────────────────────┬───────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      POSTGRESQL 16 & REDIS 7 DATA TIER                          │
│   • Leads Table (Deduplicated, Scored, Fingerprinted)                           │
│   • Outreach Logs (Channel, Timestamp, Delivery Status)                         │
│   • Message Dedup (14-Day Cooldown & Frequency Caps)                            │
└─────────────────────────────────┬───────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       N8N WORKFLOW ORCHESTRATION (:5678)                        │
│   01. AI Scoring Engine (GPT-4o-mini / Gemini Qualification Rubric)             │
│   02. Telegram HITL Approval Bot (Executive Card + [Approve] / [Reject])        │
│   03. Omnichannel Outreach Dispatcher (WhatsApp / Telegram / Email + Jitter)   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Hardware & Memory Budget (16GB RAM Host)

Strict Docker container resource limits (`deploy.resources.limits.memory`) prevent host degradation:

| Container | Base Image | RAM Limit | CPU Limit | Network Mode |
|---|---|---|---|---|
| `postgres` | `postgres:16-alpine` | **512 MB** | 1.0 CPU | Bridge |
| `redis` | `redis:7-alpine` | **256 MB** | 0.5 CPU | Bridge |
| `harvesters` | `python:3.11-slim` | **768 MB** | 1.5 CPU | Bridge |
| `n8n` | `docker.n8n.io/n8nio/n8n` | **1024 MB** | 1.5 CPU | Bridge |
| **Total Stack** | — | **~2.5 GB** | — | — |

> **Pro-Tip:** The stack strictly uses direct HTTP/2, GraphQL, and official API requests (`httpx`, `PRAW`, `Telethon`, Serper API) rather than running continuous headless Chromium instances. When auditing websites, it executes asynchronous HTTP status and DNS probes, keeping RAM utilization exceptionally low.

---

## 📁 Repository Structure

```text
lead-engine/
├── docker-compose.yml           # Multi-container orchestration with conflict-free host ports
├── .env.example                 # Comprehensive environment variable template
├── database/
│   └── init.sql                 # PostgreSQL 16 schema with triggers, views & dedup indexes
├── harvesters/                  # Containerized Python FastAPI microservice
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                  # API endpoints, 5 APScheduler jobs, & web cockpit
│   ├── dashboard.html           # Real-Time Mission Control & Instant WhatsApp UI
│   ├── ai_qualifier.py          # Dual-Engine AI scoring (OpenAI/Gemini + NLP Fallback)
│   ├── config.py                # Regex extractors (DZ phones, WhatsApp) & Darija/FR/EN triggers
│   ├── redis_dedup.py           # SHA-256 fingerprinting & 14-day debounce state manager
│   ├── active_intent/
│   │   ├── reddit_harvester.py  # PRAW OAuth2 with X-Ratelimit-Remaining backoff
│   │   └── telegram_listener.py # Telethon MTProto client for Algerian & Global channels
│   └── passive_fit/
│       ├── ouedkniss_graphql.py # Direct GraphQL scraper for Ouedkniss Pro stores
│       ├── dork_harvester.py    # Serper Google Dorks targeting "Prix en privé" stores
│       └── gmaps_auditor.py     # Local business auditor (Null/Dead/Facebook-only websites)
├── n8n_workflows/               # Importable n8n workflows
│   ├── 01_lead_ingestion_and_ai_scoring.json
│   ├── 02_telegram_hitl_approval_bot.json
│   ├── 03_omnichannel_outreach_and_debounce.json
│   └── 04_midnight_batch_and_google_sheets.json
└── scripts/
    ├── run_lead_engine.ps1      # 1-Click Master Launcher (Windows 11 bootstrapper)
    ├── start_tunnel.ps1         # Windows 11 PowerShell ngrok tunnel & webhook URL sync
    └── simulate_pipeline.py     # End-to-end pipeline integrity & pitch verification test
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Windows 11 Pro** with **Docker Desktop** (WSL2 backend enabled).
- **PowerShell 7+** (or standard Windows PowerShell).
- **ngrok CLI** installed (`winget install ngrok.ngrok`).

### 2. Configure Environment
Navigate into `lead-engine/` and copy the environment template:
```powershell
cd "d:\antigravity\bot farm\lead-engine"
cp .env.example .env
```
Fill in your credentials in `.env`:
- Database passwords & `N8N_ENCRYPTION_KEY`
- `TELEGRAM_BOT_TOKEN` & `TELEGRAM_ADMIN_CHAT_ID` (for HITL approvals)
- `OPENAI_API_KEY` or `GEMINI_API_KEY` (for qualification scoring)
- `SERPER_API_KEY` (for Google Dorks & Google Maps places)
- `REDDIT_CLIENT_ID` & `REDDIT_CLIENT_SECRET` (for r/n8n, r/automation)

### 3. Master 1-Click Launch (PowerShell)
Launch everything with healthcheck polling and automatic cockpit browser opening:
```powershell
.\scripts\run_lead_engine.ps1
```
This script initializes `.env`, boots Docker Desktop containers (`leadengine_postgres`, `leadengine_redis`, `leadengine_harvesters`, `leadengine_n8n`), checks connectivity, and opens the **Mission Control Cockpit** at `http://localhost:8000/dashboard`.

Alternatively, launch via standard Docker Compose:
```powershell
docker compose up -d --build
```
Check container status:
```powershell
docker compose ps
```

### 4. Open the Mission Control Cockpit
- **Mission Control Cockpit:** `http://localhost:8000/dashboard`
  - Real-time pipeline counters (Total, High Intent, Pending, Approved, Contacted)
  - 1-Click scraping triggers (`Reddit`, `Ouedkniss`, `Instagram Dorks`, `Google Maps`)
  - 1-Click **WhatsApp Direct (`wa.me`)** pre-filled with culturally tailored pitches in Darija/French/English
  - Instant dispatch via Evolution API
- **n8n Orchestrator:** `http://localhost:5679`

### 5. Start the Public Tunnel (PowerShell)
Execute the automated tunneling script:
```powershell
.\scripts\start_tunnel.ps1 -N8nPort 5679
```
This script:
1. Spawns `ngrok http 5679`.
2. Queries `http://127.0.0.1:4040/api/tunnels` to extract your public HTTPS URL.
3. Automatically updates `WEBHOOK_URL` in `.env`.
4. Outputs ready-to-use webhook URLs.

### 6. Import n8n Workflows
1. Open n8n at `http://localhost:5679`.
2. Complete initial admin setup.
3. Go to **Workflows > Import from File** and import:
   - `n8n_workflows/01_lead_ingestion_and_ai_scoring.json`
   - `n8n_workflows/02_telegram_hitl_approval_bot.json`
   - `n8n_workflows/03_omnichannel_outreach_and_debounce.json`
   - `n8n_workflows/04_midnight_batch_and_google_sheets.json`
4. Set credentials in n8n for:
   - PostgreSQL (`postgres:5432` inside docker network)
   - OpenAI or HTTP Header Auth (`Authorization: Bearer sk-...`)
   - Telegram Bot (`TELEGRAM_BOT_TOKEN`)
5. Toggle all four workflows to **Active**.

---

## 📡 Harvester API Reference

The Harvester microservice exposes a clean REST API on port `8000`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Connectivity check for Postgres, Redis, and Telegram listener |
| `POST` | `/harvest/reddit` | Trigger Reddit intent scan across target subreddits |
| `POST` | `/harvest/ouedkniss` | Query Ouedkniss GraphQL for Pro stores without websites |
| `POST` | `/harvest/dork` | Run Google Dorks for Algerian Instagram stores ("Prix en privé") |
| `POST` | `/harvest/gmaps` | Audit local businesses on Google Maps for dead/missing websites |
| `POST` | `/harvest/all` | Run orchestrated multi-source harvest batch |
| `GET` | `/leads` | Query leads with filters (`status`, `target_market`, `min_score`) |
| `POST` | `/leads/{id}/score` | Update AI qualification score, reasoning, and pitch |
| `POST` | `/leads/{id}/status` | Update status (`approved`, `rejected`, `blacklisted`) |
| `POST` | `/leads/{id}/outreach` | Log dispatched message and set 14-day debounce cooldown |
| `POST` | `/campaign/start` | Launch autonomous 58-Wilaya campaign from voice note/idea |
| `GET` | `/campaign/{id}/status` | Query campaign progress, top leads, and Google Sheet link |
| `GET` | `/campaign/{id}/export/csv` | 1-click download of sorted campaign CSV |
| `POST` | `/webhook/whatsapp-incoming` | Evolution API incoming webhook for Darija Conversational Agent |
| `GET` | `/escalations` | List pending high-intent client escalation alerts |
| `POST` | `/escalations/{id}/resolve` | Resolve escalation and dispatch admin reply to WhatsApp |
| `POST` | `/transcribe/audio` | Groq Whisper Large v3 Turbo voice note transcription (<500ms) |
| `POST` | `/transcribe/multimodal` | Google Gemini 1.5/2.0 Flash video/footage analysis |

---

## 📱 Mobile Command Copilot (Control from Your Phone)

You can run your entire lead acquisition agency straight from Telegram without ever touching a computer:
- 🎙️ **Voice Notes:** Send audio notes like *"I am looking for perfume shops all over Algeria"* -> Transcribed in <500ms via Groq Whisper -> Launches 58-Wilaya Grid.
- 💬 **WhatsApp Outreach:** Type `/send_ai DZ-PERF-001` or `/send DZ-PERF-001 <custom message>` to message prospects.
- 🚨 **Real-Time Escalations:** When a client asks high-stakes questions on WhatsApp (previews, demo videos, custom pricing), an emergency alert card is pushed to your phone with 1-click reply buttons (`[✅ Send AI Reply]`, `[📹 Send Demo Video]`).
- 📹 **Footage & Media Relay:** Reply to any alert card with a video, photo, or PDF from your phone; the bot routes your exact materials to that client on WhatsApp.

For the step-by-step key acquisition walkthrough, see **[`README_KEYS_GUIDE.md`](./README_KEYS_GUIDE.md)**.

---

## 🛡️ Anti-Spam & Debounce Mechanics

To protect WhatsApp and email accounts from getting flagged or blocked:
1. **Deterministic Fingerprinting:** Every lead is fingerprinted using a SHA-256 hash combining normalized phone/email and platform ID.
2. **14-Day Cooldown (`message_dedup`):** Once a lead is contacted, an entry is inserted into PostgreSQL and Redis with a 14-day TTL. Any outreach attempt before this cooldown expires is automatically blocked.
3. **Human-in-the-Loop (HITL) Telegram Approval:** Leads scoring $\ge 70$ trigger a Telegram review card. No outreach message is dispatched until you click **[✅ Approve & Dispatch]**.
4. **Human Emulation Jitter:** Messages have randomized delay intervals (15s to 60s) to prevent automated burst detection.
