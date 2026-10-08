# 🌐 Chatbot Farm — Complete Multi-Platform Credentials & Integration Guide

Welcome to the **Chatbot Farm Multi-Platform Integration Guide**. This master document details every single messaging channel supported by Chatbot Farm, exactly what credentials/keys/URLs are required, where to obtain them step-by-step, and how to test with **1-Click Instant Demo Login** without waiting for API approvals.

---

## 📑 Table of Channels

1. [WhatsApp (Main & Multi-Account)](#1-whatsapp-main--multi-account)
2. [Instagram (Direct Messages)](#2-instagram-direct-messages)
3. [Telegram (Personal MTProto & Bot API)](#3-telegram-personal-mtproto--bot-api)
4. [Signal (Private Messenger)](#4-signal-private-messenger)
5. [Facebook Messenger](#5-facebook-messenger)
6. [X (formerly Twitter Direct Messages)](#6-x-formerly-twitter-direct-messages)
7. [Google Messages (SMS / RCS)](#7-google-messages-sms--rcs)
8. [Google Chat (Workspace Spaces)](#8-google-chat-workspace-spaces)
9. [Google Voice (Business Phone & SMS)](#9-google-voice-business-phone--sms)
10. [Discord (Bots & Community DMs)](#10-discord-bots--community-dms)
11. [Slack (Workspaces & Apps)](#11-slack-workspaces--apps)
12. [LinkedIn (Messaging & Leads)](#12-linkedin-messaging--leads)
13. [IRC (Internet Relay Chat)](#13-irc-internet-relay-chat)
14. [Matrix Protocol (Beeper / Element Interoperable Bridge)](#14-matrix-protocol-beeper--element-interoperable-bridge)

---

## 🔒 100% Real Accounts & Live Connections Policy

> [!IMPORTANT]
> **Zero Synthetic Data / Zero Fake Messages Policy**:
> Every single channel in Chatbot Farm connects directly to your genuine communication networks. All mock conversations, demo contacts, and simulated messages have been completely removed.
> When you first start, all channels are **Disconnected** until you link them with your real credentials. Once linked, they stay connected permanently until you explicitly click "Disconnect / Unlink".

---

## 1. WhatsApp (Main & Multi-Account)

Chatbot Farm supports multiple WhatsApp phone numbers simultaneously (e.g. primary sales line + customer support line, or multi-branch numbers across Algiers, Oran, Constantine).

### Option A: Linked Devices QR Code (100% Free, Zero Meta Approval)
Uses your existing phone number (Mobilis, Djezzy, Ooredoo, or any international SIM):
- **Required from you**: Just your phone with WhatsApp installed.
- **Steps**:
  1. Open Chatbot Farm and click **WhatsApp** (or **WhatsApp Line #2** for multi-account).
  2. A real scannable QR code appears on the screen.
  3. On your phone, open WhatsApp > tap **Menu (⋮)** on Android or **Settings (⚙️)** on iPhone.
  4. Tap **Linked Devices** > **Link a Device**.
  5. Point your phone camera at the screen to scan.
  6. The device links instantly; all customer chats appear in your dashboard.

### Option B: WhatsApp Cloud API (Official Meta Enterprise)
- **Developer Portal**: [developers.facebook.com](https://developers.facebook.com/)
- **Required Credentials**:
  - `WHATSAPP_PHONE_NUMBER_ID`
  - `WHATSAPP_BUSINESS_ACCOUNT_ID`
  - `META_PERMANENT_ACCESS_TOKEN` (System User token)
  - Webhook URL: `https://your-domain.com/api/webhooks/whatsapp`
  - Webhook Verify Token: (Set by you in `.env.local`)
- **Steps**:
  1. Create a Business App on Meta for Developers.
  2. Add the **WhatsApp** product.
  3. Under WhatsApp > API Setup, add your phone number and complete SMS verification.
  4. Generate a System User Access Token with `whatsapp_business_messaging` permission.

---

## 2. Instagram (Direct Messages)

### Option A: Direct Username & Session (Fastest)
- **Required from you**: Instagram username (`@handle`) and optional Session ID (`sessionid`).
- **Where to get Session ID**:
  1. Log into [instagram.com](https://www.instagram.com) in your web browser.
  2. Press `F12` to open Developer Tools > go to **Application** tab > **Cookies** > `https://www.instagram.com`.
  3. Find the cookie named `sessionid` and copy its value.
  4. Paste into the Chatbot Farm Instagram connection modal.

### Option B: Official Meta Graph API
- **Developer Portal**: [developers.facebook.com](https://developers.facebook.com/)
- **Prerequisites**:
  - Instagram Professional Account (Creator or Business).
  - Connected Facebook Page.
  - In Instagram Mobile App: **Settings > Privacy > Messages > Allow Access to Messages = ON**.
- **Required Credentials**:
  - `META_APP_ID`: `1076353937258814` (already pre-configured)
  - `PAGE_ACCESS_TOKEN`: Generated from Graph API Explorer.
  - Permissions required: `instagram_basic`, `instagram_manage_messages`, `pages_show_list`, `pages_read_engagement`.

---

## 3. Telegram (Personal MTProto & Bot API)

Chatbot Farm provides dual Telegram integration: your personal Algerian Telegram account or an automated bot.

### Option A: Personal Account (MTProto — Reads/Sends via your Phone)
- **Required from you**: Your mobile phone number (e.g. `+213 550 12 34 56`).
- **Steps**:
  1. Select Telegram in Chatbot Farm > Choose **Personal Account**.
  2. Enter your phone number with country code `+213`.
  3. Click **Send 5-Digit Code to Telegram**.
  4. Open your official Telegram app; look for the login code message from Telegram.
  5. Paste the 5-digit code (and your 2FA cloud password if enabled).
  6. Connected! All private chats and group inquiries sync in real-time.

### Option B: Telegram Bot API (@BotFather)
- **Portal**: Direct inside Telegram app with [@BotFather](https://t.me/BotFather)
- **Required Credentials**:
  - `TELEGRAM_BOT_TOKEN` (Format: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)
- **Steps**:
  1. Open Telegram and search for `@BotFather`.
  2. Send `/newbot` and follow prompts to pick a name and `@username_bot`.
  3. Copy the HTTP API token provided by BotFather.
  4. Paste into the Chatbot Farm Telegram Bot Token field.

---

## 4. Signal (Private Messenger)

- **Official Project**: [signal.org](https://signal.org) / [bbernhard/signal-cli-rest-api](https://github.com/bbernhard/signal-cli-rest-api)
- **Required Credentials**:
  - `SIGNAL_PHONE_NUMBER` (e.g. `+213 661 22 33 44`)
  - `SIGNAL_REST_API_URL` (Default local: `http://localhost:8080`)
- **Steps**:
  1. If running locally via Docker:
     ```bash
     docker run -d --name signal-api -p 8080:8080 -v signal_data:/home/.local/share/signal-cli bbernhard/signal-cli-rest-api
     ```
  2. Open Chatbot Farm > Signal > Enter phone number and endpoint URL.
  3. Scan the generated QR code with the Signal app (**Settings > Linked Devices > Link New Device**).

---

## 5. Facebook Messenger

- **Developer Portal**: [developers.facebook.com](https://developers.facebook.com/)
- **Required Credentials**:
  - `FACEBOOK_PAGE_ID`
  - `PAGE_ACCESS_TOKEN`
  - Webhook URL: `https://your-domain.com/api/webhooks/messenger`
  - Webhook Verify Token: (Set in `.env.local`)
- **Steps**:
  1. Go to Meta Developers > Your App > Add **Messenger**.
  2. Under **Access Tokens**, link your Facebook Page and click **Generate Token**.
  3. Under **Webhooks**, subscribe to `messages` and `messaging_postbacks`.
  4. Paste the Page Token into Chatbot Farm or click **Log in with Meta** to auto-sync.

---

## 6. X (formerly Twitter Direct Messages)

- **Developer Portal**: [developer.x.com](https://developer.x.com/en/portal/dashboard)
- **Required Credentials**:
  - `X_API_KEY` (Consumer Key)
  - `X_API_SECRET_KEY` (Consumer Secret)
  - `X_BEARER_TOKEN`
  - `X_ACCESS_TOKEN` (User Context Token)
  - `X_ACCESS_TOKEN_SECRET`
- **Steps**:
  1. Go to the X Developer Portal and create a Project & App.
  2. Under **User authentication settings**, set App permissions to **Read and Write and Direct message**.
  3. Type of App: **Web App, Automated App or Bot**.
  4. Callback URL: `https://your-domain.com/api/auth/callback/x`.
  5. Under **Keys and Tokens**, generate your Consumer Keys and Access Token & Secret.
  6. Paste them into Chatbot Farm's X configuration card.

---

## 7. Google Messages (SMS / RCS)

- **Service Portal**: [messages.google.com/web](https://messages.google.com/web) or [Google RCS Business Messaging](https://developers.google.com/business-communications/rcs-business-messaging)
- **Required Credentials**:
  - Phone Number with active carrier SMS/RCS (Mobilis, Djezzy, Ooredoo, etc.)
  - For Enterprise: Google Cloud Project Number & Service Account JSON
- **Steps (Device Link)**:
  1. In Chatbot Farm, open Google Messages pairing.
  2. On your Android phone, open the **Google Messages** app.
  3. Tap your profile icon > **Device pairing** > **QR code scanner**.
  4. Scan the pairing code on your screen to bridge carrier SMS and RCS chats.

---

## 8. Google Chat (Workspace Spaces)

- **Console**: [console.cloud.google.com](https://console.cloud.google.com/)
- **Required Credentials**:
  - `GOOGLE_CHAT_SPACE_ID` (Format: `spaces/AAAAAAAAAAA`)
  - `GOOGLE_CHAT_WEBHOOK_URL` or Service Account Key JSON (`service_account.json`)
- **Steps (Incoming Webhook - Simplest)**:
  1. Open Google Chat in your browser.
  2. Go to the Space where you want customer inquiries to arrive.
  3. Click the Space name at top > **Apps & integrations** > **Webhooks**.
  4. Click **Add webhook**, give it the name "Chatbot Farm", and copy the URL.
  5. Paste into Chatbot Farm.

---

## 9. Google Voice (Business Phone & SMS)

- **Console**: [voice.google.com](https://voice.google.com/) / Google Workspace Admin
- **Required Credentials**:
  - `GOOGLE_VOICE_NUMBER` (e.g. `+1 (555) 345-6789`)
  - Google Workspace Email / SIP Trunk credentials
- **Steps**:
  1. Assign a Google Voice Standard or Premier license to your Workspace user.
  2. Configure inbound call/SMS forwarding in the Google Voice settings.
  3. Enter your Voice number in Chatbot Farm to route SMS conversations into your unified inbox.

---

## 10. Discord (Bots & Community DMs)

- **Developer Portal**: [discord.com/developers/applications](https://discord.com/developers/applications)
- **Required Credentials**:
  - `DISCORD_BOT_TOKEN`
  - `DISCORD_APPLICATION_ID` (Client ID)
  - `DISCORD_GUILD_ID` (Optional Server ID)
- **Steps**:
  1. Click **New Application** > name it "Chatbot Farm".
  2. Go to **Bot** tab > click **Reset Token** > copy the token.
  3. Scroll down to **Privileged Gateway Intents** and enable:
     - **Presence Intent**
     - **Server Members Intent**
     - **Message Content Intent** (Crucial for reading messages)
  4. Go to **OAuth2 > URL Generator** > select scopes `bot` > permissions `Send Messages`, `Read Messages/View Channels`, `Read Message History`.
  5. Open the generated URL in a browser to invite the bot to your Discord server.
  6. Paste the Bot Token into Chatbot Farm.

---

## 11. Slack (Workspaces & Apps)

- **API Portal**: [api.slack.com/apps](https://api.slack.com/apps)
- **Required Credentials**:
  - `SLACK_BOT_TOKEN` (Format: `xoxb-...`)
  - `SLACK_SIGNING_SECRET`
  - `SLACK_WEBHOOK_URL` (Optional)
- **Steps**:
  1. Go to `api.slack.com/apps` > click **Create New App** > **From scratch**.
  2. Go to **OAuth & Permissions** > scroll to **Bot Token Scopes** and add:
     - `chat:write`
     - `im:history`
     - `im:read`
     - `im:write`
     - `channels:history`
     - `channels:read`
  3. Scroll up and click **Install to Workspace** > allow permissions.
  4. Copy the **Bot User OAuth Token** (`xoxb-...`).
  5. Under **Basic Information**, copy the **Signing Secret**.
  6. Under **Event Subscriptions**, enable events and set Request URL: `https://your-domain.com/api/webhooks/slack`.

---

## 12. LinkedIn (Messaging & Leads)

- **Developer Portal**: [developer.linkedin.com](https://developer.linkedin.com/)
- **Option A (Cookie Session — Direct & No App Approval)**:
  - Required: `li_at` cookie.
  - Where to get: Log into [linkedin.com](https://www.linkedin.com) > press `F12` > Application > Cookies > copy the value of `li_at`.
- **Option B (Official API)**:
  - Required: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`.
  - Product: **Community Management API** (provides read/write messaging endpoints for company pages).

---

## 13. IRC (Internet Relay Chat)

- **Supported Networks**: Libera.Chat, OFTC, or custom private IRC daemons.
- **Required Credentials**:
  - `IRC_HOST` (Default: `irc.libera.chat`)
  - `IRC_PORT` (Default: `6697` with TLS/SSL encryption)
  - `IRC_NICKNAME` (e.g. `chatbot_farm_dz`)
  - `IRC_CHANNEL` (e.g. `#chatbot-farm` or `#algeria`)
  - `IRC_PASSWORD` (Optional NickServ identification password)
- **Steps**:
  1. Simply enter your desired host, nickname, and channel in Chatbot Farm.
  2. Click **Connect IRC Network**.
  3. Chatbot Farm establishes a persistent SSL connection to the network.

---

## 14. Matrix Protocol (Beeper / Element Interoperable Bridge)

Matrix is the open standard for decentralized, interoperable communication. It natively connects with **Beeper**, **Element**, and WhatsApp/Telegram bridges.

- **Supported Homeservers**: `https://matrix.org`, custom Synapse, Conduit, or Dendrite servers.
- **Required Credentials**:
  - `MATRIX_HOMESERVER_URL` (e.g. `https://matrix.org`)
  - `MATRIX_USER_ID` (Format: `@yourname:matrix.org`)
  - `MATRIX_ACCESS_TOKEN` (Format: `syt_...`)
  - `MATRIX_ROOM_ID` (Optional default room)
- **Where to get your Access Token**:
  1. In **Element** (Web or Desktop): Click your avatar > **All settings** > **Help & About**.
  2. Scroll down to the bottom > click **<Click to reveal access token>**.
  3. In **Beeper**: Open Beeper Desktop > Settings > Advanced > View Access Token.
  4. Paste into Chatbot Farm > Click **Connect Matrix Federation**.

---

## 🔒 Security & Privacy Architecture

- **Local & Encrypted**: All tokens and session cookies are stored either in your local server `.env.local` or encrypted in your browser's protected local storage.
- **No Third-Party Sharing**: Data flows directly between your Chatbot Farm instance and the messaging providers.
- **Auto-Failover**: If a live API token expires or an upstream service experiences downtime, Chatbot Farm gracefully maintains discussions and queues outgoing messages.
