# 🛠️ Lead Engine: Complete Production Setup Guide

A complete, non-placeholder operational walkthrough for setting up API credentials, Google Sheets synchronization, Telegram Human-In-The-Loop approval, and launching the containerized stack on **Windows 11 with Docker Desktop**.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [API Credentials Setup](#2-api-credentials-setup)
   - [Telegram MTProto (Telethon Scraper)](#a-telegram-mtproto-api_id--api_hash)
   - [Telegram HITL Approval Bot (@BotFather)](#b-telegram-hitl-bot--admin-chat-id)
   - [Reddit PRAW OAuth2 API](#c-reddit-praw-oauth2-api)
   - [Google Sheets Service Account (Phase 4 Sync)](#d-google-sheets-service-account)
   - [Evolution API (WhatsApp Gateway)](#e-evolution-api-whatsapp)
   - [OpenAI / Gemini API (AI Scoring)](#f-openai--gemini-api)
   - [Serper.dev (Google Dorks & Maps Places)](#g-serperdev-api)
3. [Booting the Containers](#3-booting-the-containers)
4. [Public Tunneling & Webhook Sync (PowerShell)](#4-public-tunneling--webhook-sync)
5. [Importing & Activating the 4 n8n Workflows](#5-importing--activating-the-4-n8n-workflows)
6. [End-to-End Verification Checklist](#6-end-to-end-verification-checklist)

---

## 1. Prerequisites

- **Host Machine:** Windows 11 Pro / Enterprise (16GB RAM recommended).
- **Docker Desktop:** Installed with **WSL2 backend** enabled.
- **PowerShell 7+** (or standard Windows 11 PowerShell).
- **ngrok CLI:** Install via winget:
  ```powershell
  winget install ngrok.ngrok
  ```
  Authenticate your ngrok account:
  ```powershell
  ngrok config add-authtoken <YOUR_NGROK_AUTHTOKEN>
  ```

---

## 2. API Credentials Setup

### A. Telegram MTProto (`api_id` & `api_hash`)
*Used by `telegram_listener.py` to monitor public groups & freelance channels in real time.*

1. Go to **[https://my.telegram.org/apps](https://my.telegram.org/apps)**.
2. Log in with your phone number (including international prefix, e.g., `+213...`).
3. Click on **API development tools**.
4. Fill in:
   - **App title:** `LeadEngine Harvester`
   - **Short name:** `leadengine`
   - **Platform:** `Other` (or `Desktop`)
5. Click **Create application**.
6. Copy the resulting:
   - `api_id` (e.g. `12345678`)
   - `api_hash` (e.g. `a1b2c3d4e5f60718293a4b5c6d7e8f90`)
7. Paste these into `lead-engine/.env`:
   ```env
   TELEGRAM_API_ID=12345678
   TELEGRAM_API_HASH=your_telegram_api_hash_hex
   TELEGRAM_PHONE=+213555000000
   ```

---

### B. Telegram HITL Bot & Admin Chat ID
*Used by n8n Workflow 02 to send review cards with inline [Approve] / [Reject] buttons.*

1. Open Telegram and search for **[@BotFather](https://t.me/BotFather)**.
2. Send `/newbot`.
3. Choose a name (e.g., `Lead Engine Admin Bot`) and username (e.g., `my_lead_engine_approval_bot`).
4. Copy the HTTP API token provided by BotFather (e.g. `7123456789:ABCdefGHIjklMNOpqrSTUvwxYZ`).
5. Open your new bot and click **Start**.
6. Find your numeric Telegram ID:
   - Search for **[@userinfobot](https://t.me/userinfobot)** in Telegram and click **Start**.
   - Copy your `Id` number (e.g. `987654321`).
7. Paste these into `lead-engine/.env`:
   ```env
   TELEGRAM_BOT_TOKEN=7123456789:ABCdefGHIjklMNOpqrSTUvwxYZ
   TELEGRAM_ADMIN_CHAT_ID=987654321
   ```

---

### C. Reddit PRAW OAuth2 API
*Used by `reddit_harvester.py` to scan `r/n8n`, `r/automation`, `r/forhire`, etc.*

1. Go to **[https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)** (log in to your Reddit account).
2. Scroll to the bottom and click **create another app...** (or **create an app...**).
3. Fill in:
   - **name:** `lead-engine-harvester`
   - Select the radio button: **script** (for personal use).
   - **description:** `B2B lead generation scanner`
   - **about url:** (leave blank or use `http://localhost`)
   - **redirect uri:** `http://localhost:8080`
4. Click **create app**.
5. Note your credentials:
   - **Client ID:** Found directly under the app name (14 characters string, e.g. `xYz1234_ABCDE`).
   - **Client Secret:** Found next to `secret` (27 characters string).
6. Paste into `lead-engine/.env`:
   ```env
   REDDIT_CLIENT_ID=your_14_char_client_id
   REDDIT_CLIENT_SECRET=your_27_char_client_secret
   REDDIT_USER_AGENT=python:lead-engine-b2b:v1.0 (by /u/your_reddit_username)
   ```

---

### D. Google Sheets Service Account
*Used by Phase 4 (`04_midnight_batch_and_google_sheets.json`) to automatically sync qualified leads at 00:00 every night.*

1. Go to the **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Create a new project (e.g., `Lead-Engine-Automations`).
3. In the search bar at the top, search for and enable:
   - **Google Sheets API**
   - **Google Drive API**
4. Navigate to **APIs & Services > Credentials**.
5. Click **+ CREATE CREDENTIALS > Service account**.
   - **Service account name:** `lead-engine-sheets-sync`
   - Click **CREATE AND CONTINUE** and **DONE**.
6. Under the "Service Accounts" list, click on the newly created service account email.
7. Click the **KEYS** tab > **ADD KEY > Create new key**.
8. Select **JSON** and click **CREATE**. A `.json` key file will download to your PC.
9. Create your Master Google Sheet:
   - Open [Google Sheets](https://sheets.new) and create a spreadsheet named `Lead Engine Master Tracker`.
   - Rename the first tab to `Master Leads`.
   - In Row 1, set up the following headers:
     `Date` | `Country` | `Category (Active Request vs Passive Potential)` | `Business/User Name` | `Sub-Niche` | `Detected Bottleneck` | `Contact Info` | `Source URL` | `Outreach Status` | `AI Score` | `Draft Pitch`
10. **Share the Sheet with the Service Account:**
    - Click the green **Share** button in the top-right of your Google Sheet.
    - Paste the Service Account's email address (e.g. `lead-engine-sheets-sync@lead-engine-automations.iam.gserviceaccount.com`).
    - Give it role: **Editor**, uncheck "Notify people", and click **Share**.
11. Copy your **Spreadsheet ID** from the URL:
    `https://docs.google.com/spreadsheets/d/`**`1A2B3C4D5E6F7G8H9I0J_your_spreadsheet_id`**`/edit`
12. Paste into `lead-engine/.env`:
    ```env
    GOOGLE_SHEETS_SPREADSHEET_ID=1A2B3C4D5E6F7G8H9I0J_your_spreadsheet_id
    GOOGLE_SHEETS_TAB_NAME=Master Leads
    ```

---

### E. Evolution API (WhatsApp Gateway)
*Used for dispatching personalized WhatsApp messages and buffering incoming replies.*

1. If running Evolution API locally or remotely, set:
   ```env
   EVOLUTION_API_URL=http://localhost:8080
   EVOLUTION_API_KEY=your_evolution_api_key_token
   EVOLUTION_INSTANCE_NAME=lead_dispatch
   ```
2. In Evolution API Manager, configure the Webhook URL to:
   `<PUBLIC_TUNNEL_URL>/webhook/whatsapp-incoming`
   with events: `MESSAGES_UPSERT`.

---

### F. OpenAI / Gemini API
*Used for B2B qualification scoring (1-10) and drafting native pitches.*

1. Obtain an API key from **[https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)**.
2. In `lead-engine/.env`:
   ```env
   OPENAI_API_KEY=sk-proj-your_openai_api_key
   OPENAI_MODEL=gpt-4o-mini
   ```

---

### G. Serper.dev API
*Used for Google Dorks (Algerian Instagram stores) and Google Maps local business auditing.*

1. Go to **[https://serper.dev](https://serper.dev)** and sign up (free tier includes 2,500 queries).
2. Copy your API Key from the dashboard.
3. In `lead-engine/.env`:
   ```env
   SERPER_API_KEY=your_serper_dev_api_key
   ```

---

## 3. Booting the Containers

1. Navigate to the `lead-engine` folder:
   ```powershell
   cd "d:\antigravity\bot farm\lead-engine"
   ```
2. Create your `.env` from `.env.example`:
   ```powershell
   Copy-Item .env.example .env
   ```
   *(Ensure all credentials from Step 2 are filled in `.env`)*
3. Build and launch the containers:
   ```powershell
   docker compose up -d --build
   ```
4. Verify all 4 containers are running healthy:
   ```powershell
   docker compose ps
   ```
   Output should show:
   - `leadengine_postgres` (Up, healthy on port 5432)
   - `leadengine_redis` (Up, healthy on port 6379)
   - `leadengine_harvesters` (Up, healthy on port 8000)
   - `leadengine_n8n` (Up, healthy on port 5678)

---

## 4. Public Tunneling & Webhook Sync

Run the PowerShell automation script:
```powershell
.\scripts\start_tunnel.ps1
```
The script will:
- Launch `ngrok http 5678`.
- Query `http://127.0.0.1:4040/api/tunnels` for the public HTTPS address.
- Automatically update `WEBHOOK_URL` in `lead-engine/.env`.
- Display your active webhook endpoints.

---

## 5. Importing & Activating the 4 n8n Workflows

1. Open your browser and navigate to **[http://localhost:5678](http://localhost:5678)**.
2. Create your local n8n admin account upon first login.
3. Set up Credentials in n8n (**Settings > Credentials**):
   - **Postgres:** Host: `postgres`, Port: `5432`, Database: `lead_engine`, User: `postgres`, Password: `<YOUR_POSTGRES_PASSWORD>`
   - **Header Auth (OpenAI):** Name: `Authorization`, Value: `Bearer sk-...`
   - **Telegram API:** Access Token: `<YOUR_TELEGRAM_BOT_TOKEN>`
   - **Google Sheets OAuth2 / Service Account:** Upload the JSON key obtained from Google Cloud.
   - **SMTP:** Host: `smtp.gmail.com`, Port: `587`, User/Password: Your email credentials.
4. Go to **Workflows > Import from File** and import each workflow from `lead-engine/n8n_workflows/`:
   - `01_lead_ingestion_and_ai_scoring.json`
   - `02_telegram_hitl_approval_bot.json`
   - `03_omnichannel_outreach_and_debounce.json`
   - `04_midnight_batch_and_google_sheets.json`
5. Turn the toggle in the top-right of each workflow to **Active**.

---

## 6. End-to-End Verification Checklist

Test each phase to verify operational readiness:

### 1. Test Harvester API Health
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/health"
```
*Expected response:*
```json
{
  "status": "healthy",
  "services": {
    "postgres": "connected",
    "redis": "connected",
    "telegram_listener": "online",
    "apscheduler": "running"
  }
}
```

### 2. Trigger an On-Demand Scrape
- **Google Maps Dental Clinics Audit:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:8000/harvest/gmaps" -Method Post -ContentType "application/json" -Body '{"query": "Cabinet dentaire", "location": "Alger, Algérie", "max_results": 5}'
  ```
- **Ouedkniss Pro Stores:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:8000/harvest/ouedkniss" -Method Post -ContentType "application/json" -Body '{"categories": ["informatique"], "max_pages": 1}'
  ```
- **Reddit Active Intent:**
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:8000/harvest/reddit" -Method Post -ContentType "application/json" -Body '{"subreddits": ["n8n", "automation"], "limit_per_sub": 10}'
  ```

### 3. Check Telegram HITL Approval Card
Within 15 minutes (or via manual execution in n8n of `01_lead_ingestion_and_ai_scoring`), any lead scoring $\ge 7/10$ will arrive in your Telegram bot with:
- Country & Category (`[🔥 ACTIVE REQUEST]` vs `[⚡ PASSIVE POTENTIAL]`)
- Sub-Niche & Bottleneck
- Culturally tailored Pitch Draft
- `[ ✅ Approve & Queue ]` / `[ ❌ Reject ]` inline buttons.

### 4. Verify 10s Debounce on Incoming WhatsApp Replies
When a client sends multiple WhatsApp messages in quick succession, the 10-second Redis buffer groups the messages into a single conversational context, preventing race conditions or double-messaging.

### 5. Verify Midnight 00:00 Batch Routine
At `00:00` nightly (or via the "Test workflow" button in n8n for `04_midnight_batch_and_google_sheets.json`):
- All unsynced leads from the past 24h are formatted and appended to your Master Google Sheet.
- `synced_to_sheets` is flipped to `TRUE` in PostgreSQL.
- Queued approved outreach messages are dispatched with randomized anti-ban delays.
- An executive report is delivered to your Telegram Admin Bot.
