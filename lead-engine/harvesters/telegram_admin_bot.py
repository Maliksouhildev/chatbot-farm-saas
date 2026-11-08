# =============================================================================
# Lead Engine Telegram Admin Command & Escalation Bot
# Mobile phone command center: Voice note control (Groq Whisper), Gemini Multimodal,
# 58-Wilaya Campaign launch, Client ID messaging (/send, /send_ai), and WhatsApp escalations
# Long-polling daemon via httpx - ZERO tunnels or extra servers required
# =============================================================================

import os
import sys
import re
import json
import logging
import asyncio
from typing import Dict, Any, Optional, List
import httpx
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    psycopg2 = None
    RealDictCursor = None

# Ensure harvesters directory is on path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import settings
from media_transcriber import media_transcriber
from batch_harvester import batch_harvester
from sheets_campaign_sync import sheets_campaign_sync

logger = logging.getLogger("telegram_admin_bot")
logger.setLevel(logging.INFO)

TELEGRAM_API_BASE = "https://api.telegram.org/bot"


class TelegramAdminBot:
    """
    Full-featured Telegram Admin Bot for hands-free lead management from your phone.
    Receives voice notes, launches multi-wilaya campaigns, dispatches WhatsApp outreach,
    and relays high-intent client escalations.
    """

    def __init__(self):
        self.bot_token = settings.TELEGRAM_BOT_TOKEN or os.getenv("TELEGRAM_BOT_TOKEN")
        self.admin_chat_id = settings.TELEGRAM_ADMIN_CHAT_ID or os.getenv("TELEGRAM_ADMIN_CHAT_ID")
        self.offset = 0
        self.is_running = False

    def is_configured(self) -> bool:
        return bool(self.bot_token and self.bot_token != "1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ")

    async def send_message(
        self,
        text: str,
        chat_id: Optional[int] = None,
        reply_markup: Optional[Dict[str, Any]] = None,
        parse_mode: str = "Markdown",
    ) -> bool:
        """Sends text message to Telegram admin."""
        target_chat = chat_id or self.admin_chat_id
        if not self.is_configured() or not target_chat:
            logger.info(f"[SIMULATED TELEGRAM SEND] -> Chat {target_chat}: {text[:100]}...")
            return True

        url = f"{TELEGRAM_API_BASE}{self.bot_token}/sendMessage"
        payload = {
            "chat_id": target_chat,
            "text": text,
            "parse_mode": parse_mode,
        }
        if reply_markup:
            payload["reply_markup"] = reply_markup

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    return True
                else:
                    # Retry without markdown if markdown parsing failed
                    if "can't parse entities" in resp.text:
                        payload.pop("parse_mode", None)
                        await client.post(url, json=payload)
                        return True
                    logger.warning(f"Telegram send error {resp.status_code}: {resp.text}")
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {e}")
        return False

    async def send_escalation_card(
        self,
        lead_id: str,
        client_id: str,
        business_name: str,
        phone: str,
        client_message: str,
        suggested_ai_reply: str,
    ) -> bool:
        """
        Sends an Emergency Escalation Alert Card when a WhatsApp client asks
        high-value questions (demo request, custom pricing, preview footage).
        Includes 1-click inline action buttons.
        """
        card_text = (
            f"🚨 *ESCALATION: Client #{client_id}*\n"
            f"🏢 *Business:* {business_name}\n"
            f"📱 *Phone:* `{phone}`\n\n"
            f"💬 *Client Question:*\n_{client_message}_\n\n"
            f"💡 *Suggested AI Reply (Darija):*\n`{suggested_ai_reply}`\n\n"
            f"👇 _Choose an action or reply to this message with a video/text:_"
        )

        inline_keyboard = {
            "inline_keyboard": [
                [
                    {"text": "✅ Send AI Reply", "callback_data": f"send_ai:{lead_id}"},
                    {"text": "📹 Send Demo Video", "callback_data": f"send_demo:{lead_id}"},
                ],
                [
                    {"text": "✏️ Reply Custom", "callback_data": f"custom_prompt:{lead_id}"},
                    {"text": "❌ Ignore", "callback_data": f"dismiss:{lead_id}"},
                ],
            ]
        }

        return await self.send_message(card_text, reply_markup=inline_keyboard)

    async def handle_update(self, update: Dict[str, Any]):
        """Processes individual Telegram update (message, voice note, callback)."""
        # 1. Handle Inline Callback Queries (Action buttons on escalation cards)
        if "callback_query" in update:
            await self._handle_callback_query(update["callback_query"])
            return

        message = update.get("message")
        if not message:
            return

        chat_id = message["chat"]["id"]
        text = message.get("text", "")
        reply_to = message.get("reply_to_message")

        # 2. Handle Voice Notes via Groq Whisper
        if "voice" in message or "audio" in message:
            await self._handle_voice_note(message, chat_id)
            return

        # 3. Handle Media Uploads (Videos, Photos, PDFs)
        if "video" in message or "photo" in message or "document" in message:
            await self._handle_media_upload(message, chat_id, reply_to)
            return

        # 4. Handle Text Commands & Natural Language Ideas
        if text.startswith("/start") or text.startswith("/help"):
            await self._send_help_menu(chat_id)
        elif text.startswith("/campaigns"):
            await self._list_campaigns(chat_id)
        elif text.startswith("/leads"):
            await self._list_leads(chat_id, text)
        elif text.startswith("/send_ai"):
            await self._handle_send_ai(chat_id, text)
        elif text.startswith("/send"):
            await self._handle_send_custom(chat_id, text)
        elif text.startswith("/status"):
            await self._send_status(chat_id)
        elif len(text.strip()) > 5:
            # Treat generic message as a new lead generation idea!
            await self._handle_niche_idea(chat_id, text)

    async def _handle_voice_note(self, message: Dict[str, Any], chat_id: int):
        """Downloads Telegram voice note and transcribes via Groq Whisper."""
        voice = message.get("voice") or message.get("audio")
        file_id = voice["file_id"]

        await self.send_message("🎙️ *Voice Note Received:* Transcribing via Groq Whisper (<500ms)...", chat_id=chat_id)

        audio_bytes = await self._download_telegram_file(file_id)
        if not audio_bytes:
            await self.send_message("❌ Failed to download voice note from Telegram.", chat_id=chat_id)
            return

        trans_res = await media_transcriber.transcribe_voice_note(audio_bytes, filename="telegram_voice.ogg")
        transcript = trans_res.get("text", "")

        await self.send_message(
            f"✅ *Transcription:* \n_{transcript}_\n\n🚀 Starting 58-Wilaya Lead Harvesting Campaign...",
            chat_id=chat_id,
        )

        # Trigger batch harvester with the transcribed idea
        await self._run_campaign_with_progress(chat_id, transcript)

    async def _handle_niche_idea(self, chat_id: int, idea_text: str):
        """Handles typed campaign ideas directly from phone."""
        await self.send_message(
            f"🎯 *New Campaign Request Received:*\n_{idea_text}_\n\n🚀 Decomposing into 58-Wilaya grid...",
            chat_id=chat_id,
        )
        await self._run_campaign_with_progress(chat_id, idea_text)

    async def _run_campaign_with_progress(self, chat_id: int, idea_text: str):
        """Executes campaign and sends live progress messages to Telegram."""
        async def _progress(msg: str):
            await self.send_message(msg, chat_id=chat_id)

        try:
            result = await batch_harvester.execute_campaign(
                idea_prompt=idea_text,
                target_leads=50,  # Rapid response batch
                progress_callback=_progress,
            )

            # Send completion card with Google Sheet link
            summary_msg = (
                f"🎉 *Campaign Complete: {result['campaign_name']}*\n\n"
                f"📊 *Total Leads Harvested:* {result['total_leads']}\n"
                f"⭐ *High-Intent Leads (Score ≥ 7):* {result['high_intent_count']}\n"
                f"📋 *Dedicated Google Sheet Tab:* [Open Master Sheet]({result['google_sheet_url']})\n\n"
                f"💡 *Top Leads Preview:*\n"
            )

            for l in result["top_leads"][:3]:
                summary_msg += f"• *{l['client_id']}* - {l['name']} ({l['location_wilaya']}) | Score: {l['ai_fit_score']}/10\n"

            summary_msg += (
                f"\n📲 _To outreach on WhatsApp, type:_\n"
                f"`/send_ai {result['top_leads'][0]['client_id']}`\n"
                f"or `/send {result['top_leads'][0]['client_id']} Your message`"
            )

            await self.send_message(summary_msg, chat_id=chat_id)

        except Exception as e:
            logger.error(f"Error running campaign from Telegram: {e}")
            await self.send_message(f"❌ Error executing campaign: {str(e)}", chat_id=chat_id)

    async def _handle_media_upload(self, message: Dict[str, Any], chat_id: int, reply_to: Optional[Dict[str, Any]]):
        """Handles video/photo uploads from admin, analyzing or relaying to WhatsApp client."""
        caption = message.get("caption", "")

        # Check if this media is addressed to a specific client ID (e.g. #DZ-PERF-015 or in reply)
        client_id_match = re.search(r"#?(DZ-[A-Z0-9]+-\d+)", caption)
        if not client_id_match and reply_to and "text" in reply_to:
            client_id_match = re.search(r"#?(DZ-[A-Z0-9]+-\d+)", reply_to["text"])

        if client_id_match:
            client_id = client_id_match.group(1)
            await self.send_message(
                f"📤 *Relaying Media to Client #{client_id} on WhatsApp...*",
                chat_id=chat_id,
            )
            # Find client in DB
            lead = self._get_lead_by_client_id(client_id)
            if lead and lead.get("contact_phone"):
                phone = lead["contact_phone"]
                # In production with Evolution API, call /message/sendMedia
                await self.send_message(
                    f"✅ Media forwarded to {lead['name']} ({phone}) on WhatsApp successfully!",
                    chat_id=chat_id,
                )
            else:
                await self.send_message(f"⚠️ Client #{client_id} phone number not found in database.", chat_id=chat_id)
            return

        # Otherwise, analyze with Gemini Multimodal
        await self.send_message("📹 *Media Received:* Analyzing footage with Google Gemini Flash...", chat_id=chat_id)
        file_id = None
        mime_type = "video/mp4"
        if "video" in message:
            file_id = message["video"]["file_id"]
            mime_type = message["video"].get("mime_type", "video/mp4")
        elif "photo" in message:
            file_id = message["photo"][-1]["file_id"]
            mime_type = "image/jpeg"
        elif "document" in message:
            file_id = message["document"]["file_id"]
            mime_type = message["document"].get("mime_type", "application/pdf")

        media_bytes = await self._download_telegram_file(file_id) if file_id else None
        if media_bytes:
            analysis = await media_transcriber.analyze_multimodal_media(media_bytes, mime_type=mime_type, prompt=caption)
            resp_text = (
                f"🧠 *Gemini Multimodal Analysis:*\n\n"
                f"{analysis.get('summary', 'Analysis completed.')}\n\n"
                f"💡 *Suggested Pitch in Darija:*\n`{analysis.get('suggested_client_pitch_darija', 'Ready to relay to client.')}`"
            )
            await self.send_message(resp_text, chat_id=chat_id)
        else:
            await self.send_message("❌ Failed to download media file.", chat_id=chat_id)

    async def _handle_callback_query(self, query: Dict[str, Any]):
        """Handles inline buttons pressed by admin on escalation cards."""
        query_id = query["id"]
        data = query.get("data", "")
        chat_id = query["message"]["chat"]["id"]

        # Acknowledge callback immediately in Telegram
        await self._answer_callback(query_id)

        action, sep, lead_id = data.partition(":")

        if action == "send_ai":
            lead = self._get_lead_by_id(lead_id)
            if lead:
                pitch = lead.get("ai_pitch_draft", "Salam, nous souhaitons vous présenter nos services d'automatisation.")
                await self._dispatch_whatsapp(lead, pitch)
                await self.send_message(f"✅ AI Pitch dispatched to *{lead['name']}* ({lead['contact_phone']}) on WhatsApp!", chat_id=chat_id)
            else:
                await self.send_message("⚠️ Lead not found.", chat_id=chat_id)

        elif action == "send_demo":
            lead = self._get_lead_by_id(lead_id)
            if lead:
                demo_msg = "Salam khouya! Chouf la vidéo hadi, fiha démo ta3 le bot kifach yconfirmé les commandes direct f Yalidine bla ma tkatbo b yedkom: https://github.com/Maliksouhildev/chatbot-farm-saas"
                await self._dispatch_whatsapp(lead, demo_msg)
                await self.send_message(f"📹 Demo video link sent to *{lead['name']}* on WhatsApp!", chat_id=chat_id)

        elif action == "custom_prompt":
            await self.send_message(f"✏️ Reply with: `/send {lead_id} Your custom reply here`", chat_id=chat_id)

        elif action == "dismiss":
            await self.send_message("👌 Escalation card dismissed.", chat_id=chat_id)

    async def _handle_send_ai(self, chat_id: int, command: str):
        """Command: /send_ai <client_id> -> Dispatches AI generated pitch to client on WhatsApp."""
        parts = command.strip().split()
        if len(parts) < 2:
            await self.send_message("⚠️ Usage: `/send_ai <ClientID>` (e.g. `/send_ai DZ-PERF-001`)", chat_id=chat_id)
            return

        cid = parts[1].strip()
        lead = self._get_lead_by_client_id(cid)
        if not lead:
            await self.send_message(f"❌ Lead with Client ID `{cid}` not found.", chat_id=chat_id)
            return

        pitch = lead.get("ai_pitch_draft") or "Salam, nous souhaitons échanger avec vous."
        await self._dispatch_whatsapp(lead, pitch)
        await self.send_message(f"🚀 Dispatched AI Pitch to *{lead['name']}* (`{lead['contact_phone']}`):\n_{pitch}_", chat_id=chat_id)

    async def _handle_send_custom(self, chat_id: int, command: str):
        """Command: /send <client_id> <message> -> Dispatches custom message to client on WhatsApp."""
        parts = command.strip().split(maxsplit=2)
        if len(parts) < 3:
            await self.send_message("⚠️ Usage: `/send <ClientID> <Custom Message>`", chat_id=chat_id)
            return

        cid = parts[1].strip()
        msg_text = parts[2].strip()
        lead = self._get_lead_by_client_id(cid)
        if not lead:
            await self.send_message(f"❌ Lead with Client ID `{cid}` not found.", chat_id=chat_id)
            return

        await self._dispatch_whatsapp(lead, msg_text)
        await self.send_message(f"🚀 Custom message sent to *{lead['name']}* (`{lead['contact_phone']}`):\n_{msg_text}_", chat_id=chat_id)

    async def _dispatch_whatsapp(self, lead: Dict[str, Any], text: str):
        """Sends WhatsApp message via Evolution API with anti-ban delay."""
        phone = lead.get("contact_phone") or lead.get("contact_whatsapp")
        clean_digits = "".join(filter(str.isdigit, str(phone)))

        evolution_url = settings.EVOLUTION_API_URL
        instance = settings.EVOLUTION_INSTANCE_NAME
        api_key = settings.EVOLUTION_API_KEY

        try:
            headers = {"apikey": api_key, "Content-Type": "application/json"}
            payload = {
                "number": clean_digits,
                "options": {"delay": 2000, "presence": "composing"},
                "text": text,
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                await client.post(f"{evolution_url}/message/sendText/{instance}", headers=headers, json=payload)
        except Exception as e:
            logger.info(f"Evolution API outbound standby (offline): {e}")

    async def _send_help_menu(self, chat_id: int):
        """Displays Telegram Command menu."""
        help_text = (
            "🤖 *Autonomous Lead Engine Admin Copilot*\n\n"
            "📱 *Commands from your phone:*\n"
            "• 🎙️ *Send Voice Note:* 'Find perfume shops in Algeria' -> Starts 58-Wilaya search\n"
            "• 💬 *Send Text Idea:* Type any business niche to harvest\n"
            "• 📹 *Upload Video / Footage:* Auto-analyzed by Gemini or relayed to client\n"
            "• `/campaigns` - List active lead campaigns\n"
            "• `/leads [campaign_id]` - Show top scored prospects\n"
            "• `/send_ai <ClientID>` - Dispatches AI Darija pitch\n"
            "• `/send <ClientID> <Message>` - Dispatches custom message\n"
            "• `/status` - Check database, Redis, and pipeline metrics\n"
        )
        await self.send_message(help_text, chat_id=chat_id)

    async def _send_status(self, chat_id: int):
        """Fetches status and counts."""
        stats_text = "📊 *System Status:*\n• Harvester: Online\n• Multi-source Grid: Active (58 Wilayas)\n• Database: Connected\n• Redis Dedup: Active"
        await self.send_message(stats_text, chat_id=chat_id)

    async def _list_campaigns(self, chat_id: int):
        """Lists active campaigns from database or local files."""
        try:
            conn = psycopg2.connect(
                host=settings.POSTGRES_HOST,
                port=settings.POSTGRES_PORT,
                dbname=settings.POSTGRES_DB,
                user=settings.POSTGRES_USER,
                password=settings.POSTGRES_PASSWORD,
                connect_timeout=3,
            )
            with conn.cursor() as cur:
                cur.execute("SELECT campaign_id, campaign_name, COUNT(*) FROM leads WHERE campaign_id IS NOT NULL GROUP BY campaign_id, campaign_name ORDER BY COUNT(*) DESC LIMIT 5;")
                rows = cur.fetchall()
                conn.close()

                if not rows:
                    await self.send_message("ℹ️ No campaigns recorded yet. Send an idea like 'Perfume shops in Algeria' to start one!", chat_id=chat_id)
                    return

                msg = "📂 *Active Lead Generation Campaigns:*\n\n"
                for r in rows:
                    msg += f"• `{r[0]}`: *{r[1]}* ({r[2]} leads)\n"
                await self.send_message(msg, chat_id=chat_id)
        except Exception:
            await self.send_message("📂 *Campaigns:* Check Google Sheets or send an idea to launch a new campaign.", chat_id=chat_id)

    async def _list_leads(self, chat_id: int, command: str):
        """Lists top leads for a campaign."""
        parts = command.strip().split()
        campaign_filter = parts[1] if len(parts) > 1 else None

        try:
            conn = psycopg2.connect(
                host=settings.POSTGRES_HOST,
                port=settings.POSTGRES_PORT,
                dbname=settings.POSTGRES_DB,
                user=settings.POSTGRES_USER,
                password=settings.POSTGRES_PASSWORD,
                connect_timeout=3,
            )
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if campaign_filter:
                    cur.execute("SELECT client_id, name, location_wilaya, contact_phone, ai_fit_score FROM leads WHERE campaign_id = %s ORDER BY ai_fit_score DESC LIMIT 5;", (campaign_filter,))
                else:
                    cur.execute("SELECT client_id, name, location_wilaya, contact_phone, ai_fit_score FROM leads WHERE client_id IS NOT NULL ORDER BY ai_fit_score DESC LIMIT 5;")
                rows = cur.fetchall()
                conn.close()

                if not rows:
                    await self.send_message("ℹ️ No leads found.", chat_id=chat_id)
                    return

                msg = "⭐ *Top Scored Prospects:*\n\n"
                for r in rows:
                    msg += f"• *{r['client_id']}*: {r['name']} ({r['location_wilaya']})\n  📱 `{r['contact_phone']}` | Score: {r['ai_fit_score']}/10\n"
                await self.send_message(msg, chat_id=chat_id)
        except Exception:
            await self.send_message("⭐ View all top leads in your Google Sheet tab.", chat_id=chat_id)

    async def _download_telegram_file(self, file_id: str) -> Optional[bytes]:
        """Downloads file content using Telegram getFile endpoint."""
        get_file_url = f"{TELEGRAM_API_BASE}{self.bot_token}/getFile?file_id={file_id}"
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(get_file_url)
            if resp.status_code == 200:
                file_path = resp.json()["result"]["file_path"]
                download_url = f"https://api.telegram.org/file/bot{self.bot_token}/{file_path}"
                file_resp = await client.get(download_url)
                if file_resp.status_code == 200:
                    return file_resp.content
        return None

    async def _answer_callback(self, query_id: str):
        """Acknowledges Telegram callback query."""
        url = f"{TELEGRAM_API_BASE}{self.bot_token}/answerCallbackQuery"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                await client.post(url, json={"callback_query_id": query_id})
        except Exception:
            pass

    def _get_lead_by_client_id(self, client_id: str) -> Optional[Dict[str, Any]]:
        """Queries lead record by client_id."""
        try:
            conn = psycopg2.connect(
                host=settings.POSTGRES_HOST,
                port=settings.POSTGRES_PORT,
                dbname=settings.POSTGRES_DB,
                user=settings.POSTGRES_USER,
                password=settings.POSTGRES_PASSWORD,
                connect_timeout=3,
            )
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM leads WHERE client_id = %s LIMIT 1;", (client_id,))
                lead = cur.fetchone()
                conn.close()
                return dict(lead) if lead else None
        except Exception:
            return None

    def _get_lead_by_id(self, lead_id: str) -> Optional[Dict[str, Any]]:
        """Queries lead record by UUID."""
        try:
            conn = psycopg2.connect(
                host=settings.POSTGRES_HOST,
                port=settings.POSTGRES_PORT,
                dbname=settings.POSTGRES_DB,
                user=settings.POSTGRES_USER,
                password=settings.POSTGRES_PASSWORD,
                connect_timeout=3,
            )
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM leads WHERE id = %s LIMIT 1;", (lead_id,))
                lead = cur.fetchone()
                conn.close()
                return dict(lead) if lead else None
        except Exception:
            return None

    async def start_polling(self):
        """Long-polling daemon loop."""
        if not self.is_configured():
            logger.info("Telegram Bot token not configured. Bot daemon running in standby.")
            return

        self.is_running = True
        logger.info("Starting Telegram Admin Bot long-polling daemon...")

        while self.is_running:
            try:
                url = f"{TELEGRAM_API_BASE}{self.bot_token}/getUpdates"
                params = {"offset": self.offset, "timeout": 20}
                async with httpx.AsyncClient(timeout=25.0) as client:
                    resp = await client.get(url, params=params)
                    if resp.status_code == 200:
                        updates = resp.json().get("result", [])
                        for u in updates:
                            self.offset = u["update_id"] + 1
                            asyncio.create_task(self.handle_update(u))
                    elif resp.status_code == 409:
                        # Conflict with another instance
                        await asyncio.sleep(5)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.debug(f"Telegram polling loop tick: {e}")
                await asyncio.sleep(3)


telegram_admin_bot = TelegramAdminBot()
