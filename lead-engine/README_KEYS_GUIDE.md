# 🔑 Autonomous Lead Engine: Complete API Keys & Setup Guide

This guide walks you step-by-step through obtaining every free-tier API key and connecting your phone for hands-free B2B lead generation and conversational outreach.

---

## ⚡ Quick Architecture Overview

```
[ Your Phone (Telegram) ] 
       │ (Voice notes & commands)
       ▼
[ Groq Whisper Large v3 Turbo ] ── (<500ms free transcription)
       │
       ▼
[ 58-Wilaya Batch Harvester ] ──── (Serper Maps + Social Dorks + Ouedkniss)
       │
       ▼
[ Google Sheets Master Sync ] ──── (Dedicated campaign tab sorted by top score)
       │
       ▼
[ Evolution API (WhatsApp) ] ───── (Cold outreach + Conversational Darija agent)
       │ (High-intent questions: previews, pricing, demo footage)
       ▼
[ Telegram Escalation Card ] ───── (Instant alert to your phone with 1-click reply buttons)
```

---

## 1. 🎙️ Groq Cloud API Key (Free Whisper Turbo)
Groq provides high-speed, free access to `whisper-large-v3-turbo` (>200 words/second) to transcribe your voice notes in under 500ms.

1. Go to: **https://console.groq.com/keys**
2. Sign in with Google or GitHub.
3. Click **Create API Key**.
4. Name it `Lead-Engine-Whisper` and copy the key (starts with `gsk_...`).
5. Paste into `.env`:
   ```env
   GROQ_API_KEY=gsk_your_groq_api_key_here
   ```

---

## 2. 🧠 Google Gemini API Key (Free Multimodal Video & Vision)
Gemini 1.5/2.0 Flash is used for multimodal video/footage analysis and LLM query decomposition.

1. Go to: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account.
3. Click **Create API Key** (choose *Create key in new project*).
4. Copy the generated key (starts with `AIzaSy...`).
5. Paste into `.env`:
   ```env
   GEMINI_API_KEY=AIzaSy_your_gemini_api_key_here
   ```

---

## 3. 🤖 Telegram Admin Command Bot & Chat ID (Ban-Proof Mobile Tier)
Controls your lead generation directly from your phone.

### Step 3.1: Create Bot via @BotFather
1. Open Telegram on your phone or desktop and search for **@BotFather**.
2. Send `/newbot`.
3. Follow the prompts:
   - Name: `Lead Engine Admin Bot`
   - Username: `MyLeadEngineAdmin_bot` (must end in `bot`).
4. Copy the HTTP API token provided (e.g. `7891234567:AAFl...`).
5. Paste into `.env`:
   ```env
   TELEGRAM_BOT_TOKEN=7891234567:AAFl_your_bot_token_here
   ```

### Step 3.2: Get Your Numeric Telegram Chat ID
1. In Telegram, search for **@userinfobot**.
2. Click **Start**.
3. It will return your numeric user ID (e.g. `123456789`).
4. Paste into `.env`:
   ```env
   TELEGRAM_ADMIN_CHAT_ID=123456789
   ```

---

## 4. 🌐 Serper.dev API Key (2,500 Free Google Maps & Dork Searches)
Powers the 58-Wilaya Google Maps Places and Instagram/Facebook "Prix en privé" scrapers without browser bloat.

1. Go to: **https://serper.dev**
2. Sign up with Google (automatically grants **2,500 free search credits**).
3. Navigate to the **API Key** tab on your dashboard.
4. Copy the key.
5. Paste into `.env`:
   ```env
   SERPER_API_KEY=your_serper_dev_key_here
   ```

---

## 5. 📊 Google Sheets Service Account (Master Tracker Sync)
Allows the lead engine to create dedicated campaign tabs and sort top-scoring leads to the top.

1. Open **Google Cloud Console**: https://console.cloud.google.com
2. Create a new project (e.g., `Lead-Engine-Master`).
3. Enable APIs:
   - Search for **Google Sheets API** -> Click **Enable**.
   - Search for **Google Drive API** -> Click **Enable**.
4. Go to **APIs & Services** > **Credentials** > **Create Credentials** > **Service Account**.
   - Service account name: `lead-engine-sheets-sync`
   - Grant role: `Project > Editor` (or `Sheets Editor`).
5. Click on the created service account > Go to **Keys** tab > **Add Key** > **Create new key** > Select **JSON**.
6. Save the downloaded JSON file into your project folder:
   `config/google_service_account.json`
7. Create a master Google Sheet in your Google Drive:
   - Copy the spreadsheet ID from the URL:
     `https://docs.google.com/spreadsheets/d/`**`1A2B3C4D5E6F7G8H9I0J`**`/edit`
   - Click **Share** on your spreadsheet and paste the service account email (e.g. `lead-engine-sheets-sync@lead-engine-master.iam.gserviceaccount.com`) as **Editor**.
8. Configure in `.env`:
   ```env
   GOOGLE_SHEETS_SPREADSHEET_ID=1A2B3C4D5E6F7G8H9I0J
   GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON=config/google_service_account.json
   ```
*(Note: If you don't configure Google Sheets credentials, the system automatically exports formatted `.csv` files locally and gives you a 1-click link!)*

---

## 6. 💬 Evolution API WhatsApp Setup (Outbound Client Outreach)
Evolution API runs locally in Docker and connects your dedicated WhatsApp number for automated client messaging.

1. In `docker-compose.yml`, Evolution API is pre-configured on port `8080`.
2. Generate an instance:
   ```bash
   curl -X POST http://localhost:8080/instance/create \
     -H "apikey: your_evolution_api_key_token" \
     -H "Content-Type: application/json" \
     -d '{"instanceName": "lead_dispatch", "token": "your_evolution_api_key_token", "qrcode": true}'
   ```
3. Open `http://localhost:8080/instance/connect/lead_dispatch` in your browser.
4. Scan the QR code with your dedicated WhatsApp device (**Linked Devices** > **Link a Device**).
5. Configure in `.env`:
   ```env
   EVOLUTION_API_URL=http://localhost:8080
   EVOLUTION_API_KEY=your_evolution_api_key_token
   EVOLUTION_INSTANCE_NAME=lead_dispatch
   ADMIN_WHATSAPP_PHONE=+213555000000
   ```
   *(Set `ADMIN_WHATSAPP_PHONE` to your personal mobile number so you can control the engine directly from WhatsApp too!)*

---

## 📱 How to Use from Your Phone (Step-by-Step)
You can manage the engine either from **Telegram** (100% ban-proof) or directly from **WhatsApp** (by messaging the dedicated number from your personal `ADMIN_WHATSAPP_PHONE`).

### Scenario A: Launching a 58-Wilaya Search
1. Open your Telegram or WhatsApp chat with the bot.
2. Hold the microphone button and send a voice note (or type a message):
   > *"I am looking for perfume shops all over Algeria"*
3. Within 500ms, Groq Whisper transcribes your voice note and the bot replies:
   > `🎙️ Transcribed: "I am looking for perfume shops all over Algeria"`
   > `🎯 Planned campaign 'Perfume Shops Algeria 58 Wilayas Grid'`
4. The system executes searches across all 58 wilayas, classifies leads, assigns Client IDs (`DZ-PERF-001` to `DZ-PERF-1000`), and formats the Google Sheet tab with the top-scoring prospects at the top.
5. The bot sends you a clickable link to open your Google Sheet tab directly on your phone!

### Scenario B: Dispatching Messages to Prospects
- To send an AI-crafted Darija pitch:
  `/send_ai DZ-PERF-001`
- To send a custom message:
  `/send DZ-PERF-001 Salam khouya, voici notre offre...`
- To view top leads:
  `/leads`
- To view active campaigns:
  `/campaigns`

### Scenario C: Client Replies & Escalations
1. When a client replies on WhatsApp asking for a preview or video demo:
2. The AI agent immediately sends an Emergency Alert Card to your Telegram and WhatsApp:
   ```
   🚨 ESCALATION: Client #DZ-PERF-015 (Parfumerie El Bahia - Oran)
   📱 Phone: +213555123456
   💬 Client Question: "Salam khouya, chhal le prix et est-ce que kayen demo video?"
   💡 Suggested AI Reply (Darija): "Salam khouya! Chouf la vidéo hadi..."
   ```
3. You can either tap **[✅ Send AI Reply]**, reply `/send DZ-PERF-015 ...`, or directly send a video clip from your phone gallery to the bot with the caption `#DZ-PERF-015` — the bot will immediately forward that video to the client on WhatsApp!
