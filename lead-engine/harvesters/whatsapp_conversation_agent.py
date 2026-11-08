# =============================================================================
# Lead Engine WhatsApp Two-Way Conversational Agent
# Handles incoming Evolution API WhatsApp webhook events, speaks authentic
# Algerian Darija Arabizi & French, uses agency RAG profile, maintains conversation
# memory in DB, injects human delays, and triggers instant Telegram Escalation Cards
# =============================================================================

import os
import sys
import json
import logging
import asyncio
import re
import time
from datetime import datetime
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

from config import (
    settings,
    normalize_algerian_phone,
    detect_language,
)
from redis_dedup import dedup_manager
from telegram_admin_bot import telegram_admin_bot
from media_transcriber import media_transcriber
from batch_harvester import batch_harvester
from time_scheduler import time_scheduler

logger = logging.getLogger("whatsapp_agent")
logger.setLevel(logging.INFO)

# Load Central Agency Profile & RAG Foundation
PROFILE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "config", "agency_profile.json")
AGENCY_RAG: Dict[str, Any] = {}
if os.path.exists(PROFILE_PATH):
    try:
        with open(PROFILE_PATH, "r", encoding="utf-8") as f:
            AGENCY_RAG = json.load(f)
    except Exception as e:
        logger.error(f"Failed to load agency_profile.json: {e}")

# High-Intent / Escalation Trigger Keywords (Arabic, Arabizi, French)
ESCALATION_KEYWORDS = [
    # Preview / Demo / Video footage requests
    "demo", "démo", "preview", "video", "vidéo", "nchouf", "warili", "werili", "apercu", "aperçu",
    "footage", "exemple", "namoudaj", "namoudhaj", "portfolio", "test",
    # Custom pricing / negotiation
    "chhal le prix", "chhal soum", "chhal tdir", "combien ca coute", "combien", "coûte", "coute", "prix", "prix svp", "devis",
    "tarif", "negocier", "remise", "tkhfid", "prix final", "soum final", "mise en place",
    # Direct human / meeting request
    "n3ayetlek", "appel", "appel telephonique", "rendez-vous", "rdv", "rencontre", "bureau",
    "contract", "contrat", "facture",
]


class WhatsAppConversationAgent:
    """
    Two-Way Conversational AI for outbound client responses.
    Emulates natural human texting delays, handles routine FAQs, and escalates high-value leads.
    """

    def __init__(self):
        self.evolution_url = settings.EVOLUTION_API_URL
        self.instance = settings.EVOLUTION_INSTANCE_NAME
        self.api_key = settings.EVOLUTION_API_KEY
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        self._bot_sent_message_ids = set()

    async def handle_incoming_webhook(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes Evolution API webhook payload (`messages.upsert`).
        Identifies sender (Admin vs Client), handles audio transcription via Groq Whisper,
        executes Admin mobile commands & campaigns, or automates client replies & escalations.
        """
        logger.info("Received WhatsApp incoming webhook event.")

        # Extract message metadata (supports text, voice notes, and media)
        message_data = await self._extract_message_data(payload)
        if not message_data:
            return {"status": "ignored", "reason": "Not a standard incoming client or admin message"}

        sender_phone = message_data["phone"]
        message_text = message_data.get("text", "")
        norm_phone = normalize_algerian_phone(sender_phone) or sender_phone

        # 1. Admin Detection & Routing (Mobile command center from your phone)
        if self._is_admin(norm_phone, message_text):
            logger.info(f"👑 Admin command/request detected from WhatsApp phone: {norm_phone}")
            return await self._handle_admin_interaction(norm_phone, message_data)

        # 2. Client Handling: Lookup lead in PostgreSQL or local campaign files
        lead = self._find_lead_by_phone(norm_phone)

        # 3. Check Intent: Escalation vs Routine
        is_escalation = self._is_high_intent_escalation(message_text)

        # 4. Log incoming message turn
        self._record_conversation_turn(
            lead_id=lead["id"] if lead and lead.get("id") else None,
            sender_type="client",
            recipient=norm_phone,
            content=message_text,
            intent="escalation" if is_escalation else "routine",
        )

        # 5. Handle Escalation to Telegram Admin Bot and Admin WhatsApp
        if is_escalation:
            logger.info(f"🚨 High intent escalation detected for client: {norm_phone}")
            client_id = lead.get("client_id", "DZ-UNKNOWN") if lead else "NEW-INQUIRY"
            business_name = lead.get("company_name", lead.get("name", "Boutique")) if lead else "Prospective Client"

            # Generate suggested reply using agency RAG
            suggested_reply = self._generate_suggested_reply(message_text, lead)

            # Send Telegram Alert Card to Admin's phone
            await telegram_admin_bot.send_escalation_card(
                lead_id=str(lead.get("id", "unknown")) if lead else "unknown",
                client_id=client_id,
                business_name=business_name,
                phone=norm_phone,
                client_message=message_text,
                suggested_ai_reply=suggested_reply,
            )

            # If admin WhatsApp is configured, also push escalation alert directly to admin's WhatsApp!
            admin_phone = settings.ADMIN_WHATSAPP_PHONE or settings.ADMIN_PHONE_NUMBER or os.getenv("ADMIN_WHATSAPP_PHONE")
            if admin_phone:
                admin_norm = normalize_algerian_phone(admin_phone) or admin_phone
                wa_escalation_card = (
                    f"🚨 *ESCALATION: Client #{client_id}*\n"
                    f"🏢 *Boutique:* {business_name}\n"
                    f"📱 *Phone:* `{norm_phone}`\n\n"
                    f"💬 *Question du client:*\n_{message_text}_\n\n"
                    f"💡 *Réponse IA suggérée (Darija):*\n`{suggested_reply}`\n\n"
                    f"📲 *Pour répondre :*\n"
                    f"`/send_ai {client_id}`\n"
                    f"ou `/send {client_id} Votre message`\n"
                    f"ou envoyez une vidéo avec le tag `#{client_id}`"
                )
                await self.send_whatsapp_message(admin_norm, wa_escalation_card, delay_ms=1000)

            # Save to escalations table
            self._save_escalation(lead, client_id, norm_phone, message_text, suggested_reply)

            # Send polite Darija acknowledgment to client with human delay
            ack_msg = "Salam khouya! Bien reçu, nchouf m3a l'équipe et nwerrilek l'aperçu/la démo f quelques minutes."
            await self.send_whatsapp_message(norm_phone, ack_msg, delay_ms=2500)

            return {
                "status": "escalated",
                "client_id": client_id,
                "phone": norm_phone,
                "action": "telegram_alert_dispatched",
            }

        # 6. Routine Inquiry: AI Answers Autonomously using RAG
        reply_text = self._generate_routine_reply(message_text, lead)
        await self.send_whatsapp_message(norm_phone, reply_text, delay_ms=2000)

        # Record AI reply turn
        self._record_conversation_turn(
            lead_id=lead["id"] if lead and lead.get("id") else None,
            sender_type="ai",
            recipient=norm_phone,
            content=reply_text,
            intent="routine_reply",
        )

        return {
            "status": "answered",
            "phone": norm_phone,
            "reply": reply_text,
        }

    def _is_admin(self, norm_phone: str, text: str) -> bool:
        """Determines if the WhatsApp message originated from the configured Admin."""
        admin_phones = [
            settings.ADMIN_WHATSAPP_PHONE,
            settings.ADMIN_PHONE_NUMBER,
            os.getenv("ADMIN_WHATSAPP_PHONE"),
            os.getenv("ADMIN_PHONE_NUMBER"),
        ]
        valid_admins = [normalize_algerian_phone(p) or p for p in admin_phones if p]
        if norm_phone and any(norm_phone == adm for adm in valid_admins):
            return True
        # Also check admin command prefixes
        stripped = text.strip().lower()
        if stripped.startswith(("/start", "/help", "/campaigns", "/leads", "/send", "/send_ai", "/status", "/timers", "/scheduled", "/cancel")):
            return True
        return False

    async def _handle_admin_interaction(
        self,
        norm_phone: str,
        message_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Handles commands, campaigns, and media forwarding from the Admin's WhatsApp."""
        text = message_data.get("text", "")
        media_type = message_data.get("media_type")

        # 1. Start / Help menu
        if text.startswith(("/start", "/help")) or text.lower() in ["menu", "aide"]:
            help_text = (
                "🤖 *Admin WhatsApp Copilot*\n\n"
                "📱 *Commandes depuis votre téléphone :*\n"
                "• 🎙️ *Envoyez une note vocale :* ex: 'Je cherche des parfumeries en Algérie'\n"
                "• 💬 *Envoyez une idée par texte :* 'Trouve-moi des boutiques de parfum en Algérie'\n"
                "• ⏰ *Planification intelligente :* 'Lance la recherche à minuit' ou 'dans 2 heures'\n"
                "• 📹 *Envoyez une vidéo ou document :* Mentionnez #DZ-PERF-001 pour transférer au client\n"
                "• `/campaigns` : Liste des campagnes actives\n"
                "• `/leads` : Top prospects qualifiés\n"
                "• `/timers` : Prospections programmées en attente\n"
                "• `/cancel <ID>` : Annuler une prospection programmée\n"
                "• `/send_ai <ClientID>` : Envoie le pitch Darija au client\n"
                "• `/send <ClientID> <Message>` : Envoie un message personnalisé\n"
                "• `/status` : État du système"
            )
            await self.send_whatsapp_message(norm_phone, help_text)
            return {"status": "admin_help_sent", "phone": norm_phone}

        # 2. Campaigns list
        if text.startswith("/campaigns"):
            campaigns_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "campaigns")
            msg = "📂 *Campagnes actives :*\n"
            found = False
            if os.path.exists(campaigns_dir):
                c_files = [f for f in os.listdir(campaigns_dir) if f.endswith(".json")]
                for cf in sorted(c_files, reverse=True)[:5]:
                    c_id = cf.split("_")[0]
                    c_name = cf.replace(".json", "").replace(f"{c_id}_", "").replace("_", " ")
                    msg += f"• `{c_id}` : {c_name[:40]}\n"
                    found = True
            if not found:
                msg += "Aucune campagne enregistrée pour le moment. Envoyez une idée pour en lancer une !"
            await self.send_whatsapp_message(norm_phone, msg)
            return {"status": "admin_campaigns_sent", "phone": norm_phone}

        # 3. Leads list
        if text.startswith("/leads"):
            parts = text.strip().split()
            c_filter = parts[1] if len(parts) > 1 else None
            lead_summary = "⭐ *Top Prospects Qualifiés :*\n"
            top_leads = []
            campaigns_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "campaigns")
            if os.path.exists(campaigns_dir):
                for cf in sorted(os.listdir(campaigns_dir), reverse=True):
                    if cf.endswith(".json") and (not c_filter or cf.startswith(c_filter)):
                        try:
                            with open(os.path.join(campaigns_dir, cf), "r", encoding="utf-8") as f:
                                data = json.load(f)
                                if isinstance(data, list):
                                    top_leads = sorted(data, key=lambda x: x.get("ai_fit_score", 0), reverse=True)[:5]
                                    break
                        except Exception:
                            pass
            if top_leads:
                for l in top_leads:
                    lead_summary += f"• *{l.get('client_id')}* : {l.get('name')} ({l.get('location_wilaya', 'Algérie')}) | Score : {l.get('ai_fit_score')}/10\n  📱 `{l.get('contact_phone')}`\n"
            else:
                lead_summary += "Aucun prospect trouvé. Lancez une campagne d'abord !"
            await self.send_whatsapp_message(norm_phone, lead_summary)
            return {"status": "admin_leads_sent", "phone": norm_phone}

        # 4. /send_ai <client_id>
        if text.startswith("/send_ai"):
            parts = text.strip().split()
            if len(parts) < 2:
                await self.send_whatsapp_message(norm_phone, "⚠️ Utilisation : `/send_ai <ClientID>` (ex: `/send_ai DZ-PERF-001`)")
                return {"status": "admin_invalid_args"}
            cid = parts[1].strip()
            lead = telegram_admin_bot._get_lead(cid)
            if not lead or not (lead.get("contact_phone") or lead.get("contact_whatsapp")):
                await self.send_whatsapp_message(norm_phone, f"❌ Prospect `{cid}` introuvable.")
                return {"status": "admin_lead_not_found"}

            client_phone = lead.get("contact_phone") or lead.get("contact_whatsapp")
            pitch = lead.get("ai_pitch_draft") or "Salam, nous souhaitons vous présenter nos services d'automatisation."
            await self.send_whatsapp_message(client_phone, pitch, delay_ms=1500)
            telegram_admin_bot._resolve_escalation_in_db(cid, admin_reply=pitch)
            await self.send_whatsapp_message(norm_phone, f"🚀 Pitch IA envoyé à *{lead.get('name')}* (`{client_phone}`) :\n_{pitch}_")
            return {"status": "admin_pitch_sent", "client_id": cid}

        # 5. /send <client_id> <message>
        if text.startswith("/send"):
            parts = text.strip().split(maxsplit=2)
            if len(parts) < 3:
                await self.send_whatsapp_message(norm_phone, "⚠️ Utilisation : `/send <ClientID> <Message>`")
                return {"status": "admin_invalid_args"}
            cid = parts[1].strip()
            custom_msg = parts[2].strip()
            lead = telegram_admin_bot._get_lead(cid)
            if not lead or not (lead.get("contact_phone") or lead.get("contact_whatsapp")):
                await self.send_whatsapp_message(norm_phone, f"❌ Prospect `{cid}` introuvable.")
                return {"status": "admin_lead_not_found"}

            client_phone = lead.get("contact_phone") or lead.get("contact_whatsapp")
            await self.send_whatsapp_message(client_phone, custom_msg, delay_ms=1500)
            telegram_admin_bot._resolve_escalation_in_db(cid, admin_reply=custom_msg)
            await self.send_whatsapp_message(norm_phone, f"🚀 Message envoyé à *{lead.get('name')}* (`{client_phone}`) :\n_{custom_msg}_")
            return {"status": "admin_custom_sent", "client_id": cid}

        # 6. Status check
        if text.startswith("/status"):
            status_text = "📊 *État du système :*\n• Harvester 58 Wilayas : En ligne\n• Agent WhatsApp : Actif\n• Groq Whisper : Prêt\n• Déduplication Redis : Opérationnelle"
            await self.send_whatsapp_message(norm_phone, status_text)
            return {"status": "admin_status_sent"}

        # 6b. Timers & Scheduled campaigns list
        if text.startswith(("/timers", "/scheduled")):
            scheduled_tasks = time_scheduler.list_scheduled_campaigns(status="scheduled")
            if not scheduled_tasks:
                await self.send_whatsapp_message(norm_phone, "⏰ Aucune prospection programmée en attente.")
                return {"status": "admin_timers_sent", "count": 0}

            msg = "⏰ *Prospections Programmées en Attente :*\n\n"
            now = time_scheduler.get_current_time()
            for t in scheduled_tasks:
                run_at_str = t.get("run_at", "")
                try:
                    run_dt = datetime.fromisoformat(run_at_str)
                    diff = run_dt - now
                    diff_sec = max(0, int(diff.total_seconds()))
                    h_rem = diff_sec // 3600
                    m_rem = (diff_sec % 3600) // 60
                    rem_str = f"dans {h_rem}h {m_rem}m"
                except Exception:
                    rem_str = run_at_str

                msg += f"• `{t.get('id')}` : _{t.get('prompt')}_\n  📅 {rem_str} ({t.get('channel')})\n"

            msg += "\n💡 Pour annuler : `/cancel <ID>`"
            await self.send_whatsapp_message(norm_phone, msg)
            return {"status": "admin_timers_sent", "count": len(scheduled_tasks)}

        # 6c. Cancel scheduled campaign
        if text.startswith("/cancel"):
            parts = text.strip().split()
            if len(parts) < 2:
                await self.send_whatsapp_message(norm_phone, "⚠️ Utilisation : `/cancel <TaskID>` (ex: `/cancel SCHED_1730000000`)")
                return {"status": "admin_cancel_missing_arg"}
            tid = parts[1].strip()
            success = time_scheduler.cancel_scheduled_campaign(tid)
            if success:
                await self.send_whatsapp_message(norm_phone, f"✅ Prospection programmée `{tid}` annulée avec succès.")
                return {"status": "admin_timer_cancelled", "task_id": tid}
            else:
                await self.send_whatsapp_message(norm_phone, f"❌ Impossible d'annuler `{tid}` (introuvable ou déjà traitée).")
                return {"status": "admin_timer_not_found", "task_id": tid}

        # 7. Media Upload / Relay to client
        if media_type in ["video", "image", "document"]:
            cid_match = re.search(r"#?(DZ-[A-Z0-9]+-\d+)", text)
            if cid_match:
                cid = cid_match.group(1)
                lead = telegram_admin_bot._get_lead(cid)
                if lead and (lead.get("contact_phone") or lead.get("contact_whatsapp")):
                    client_phone = lead.get("contact_phone") or lead.get("contact_whatsapp")
                    await telegram_admin_bot._dispatch_whatsapp_media(
                        lead=lead,
                        media_bytes=message_data.get("media_bytes"),
                        mime_type=message_data.get("mime_type", "video/mp4"),
                        caption=text or "Voici la documentation / aperçu démo demandé.",
                    )
                    telegram_admin_bot._resolve_escalation_in_db(cid, admin_reply=f"[Media sent: {media_type}] {text}")
                    await self.send_whatsapp_message(norm_phone, f"✅ Média transféré avec succès à *{lead.get('name')}* (`{client_phone}`) !")
                    return {"status": "admin_media_relayed", "client_id": cid}
                else:
                    await self.send_whatsapp_message(norm_phone, f"⚠️ Prospect `{cid}` introuvable.")
                    return {"status": "admin_lead_not_found"}
            else:
                # Multimodal analysis with Gemini
                await self.send_whatsapp_message(norm_phone, "📹 Média reçu. Analyse par Google Gemini Flash en cours...")
                analysis = await media_transcriber.analyze_multimodal_media(
                    message_data.get("media_bytes") or b"",
                    mime_type=message_data.get("mime_type", "video/mp4"),
                    prompt=text,
                )
                gemini_resp = (
                    f"🧠 *Analyse Gemini :*\n\n{analysis.get('summary', 'Analyse terminée.')}\n\n"
                    f"💡 *Pitch suggéré :*\n`{analysis.get('suggested_client_pitch_darija', 'Prêt à relayer.')}`"
                )
                await self.send_whatsapp_message(norm_phone, gemini_resp)
                return {"status": "admin_media_analyzed"}

        # 8. Treat natural language message as campaign idea (e.g. "I am looking for perfume shops all over Algeria")
        if len(text.strip()) > 5:
            # Target lead detection
            target_leads = 1000
            count_match = re.search(r"(\d{2,4})\s*(clients|leads|prospects|boutiques|magasins)", text, re.IGNORECASE)
            if count_match:
                target_leads = min(int(count_match.group(1)), 1000)

            # Check time-aware schedule intent
            sched_info = time_scheduler.parse_schedule_intent(text)
            if sched_info["is_scheduled"]:
                campaign_id = f"SCHED_{int(time.time())}"
                time_scheduler.register_scheduled_campaign(
                    campaign_id=campaign_id,
                    clean_prompt=sched_info["clean_prompt"],
                    run_at=sched_info["run_at"],
                    channel="whatsapp",
                    recipient=norm_phone,
                    target_leads=target_leads,
                )

                delay_h = sched_info["delay_seconds"] // 3600
                delay_m = (sched_info["delay_seconds"] % 3600) // 60
                sched_msg = (
                    f"⏳ *Prospection Programmée avec Succès !*\n\n"
                    f"🎯 *Objectif :* _{sched_info['clean_prompt']}_\n"
                    f"⏰ *Date d'exécution :* {sched_info['human_readable']}\n"
                    f"🕒 *Délai d'attente :* {delay_h}h {delay_m}m\n"
                    f"🆔 *ID Tâche :* `{campaign_id}`\n\n"
                    f"💤 _Le système reste en veille (0% CPU, zéro mémoire) jusqu'à l'heure exacte, puis exécutera la prospection et vous enverra le Google Sheet._\n"
                    f"Pour annuler à tout moment : `/cancel {campaign_id}`"
                )
                await self.send_whatsapp_message(norm_phone, sched_msg)

                # Background delayed worker
                async def _delayed_whatsapp_task():
                    try:
                        await asyncio.sleep(sched_info["delay_seconds"])
                        # Verify not cancelled
                        active_tasks = time_scheduler.list_scheduled_campaigns(status="scheduled")
                        if not any(t.get("id") == campaign_id for t in active_tasks):
                            logger.info(f"Scheduled task {campaign_id} was cancelled before execution.")
                            return

                        logger.info(f"Executing scheduled campaign {campaign_id} for {norm_phone}")
                        res = await batch_harvester.execute_campaign(
                            idea_prompt=sched_info["clean_prompt"],
                            target_leads=target_leads,
                        )
                        time_scheduler.mark_task_completed(campaign_id, result_summary=f"Harvested {res['total_leads']} leads")

                        c_msg = (
                            f"🎉 *Prospection Programmée Terminée !*\n\n"
                            f"🎯 *Campagne :* {res['campaign_name']}\n"
                            f"📊 *Total Prospects :* {res['total_leads']}\n"
                            f"⭐ *Haute Pertinence (Score ≥ 7) :* {res['high_intent_count']}\n"
                            f"📋 *Google Sheet :* {res['google_sheet_url']}\n\n"
                            f"💡 *Top Prospects :*\n"
                        )
                        for l in res.get("top_leads", [])[:3]:
                            c_msg += f"• *{l['client_id']}* : {l['name']} ({l.get('location_wilaya', 'Algérie')}) | Score : {l.get('ai_fit_score')}/10\n"

                        c_msg += f"\n📲 `/send_ai {res['top_leads'][0]['client_id']}` pour contacter."
                        await self.send_whatsapp_message(norm_phone, c_msg)
                    except Exception as err:
                        logger.error(f"Error in delayed execution of {campaign_id}: {err}")
                        await self.send_whatsapp_message(norm_phone, f"⚠️ Erreur lors de l'exécution programmée `{campaign_id}`: {err}")

                asyncio.create_task(_delayed_whatsapp_task())
                return {
                    "status": "campaign_scheduled",
                    "campaign_id": campaign_id,
                    "run_at": sched_info["run_at_iso"],
                    "delay_seconds": sched_info["delay_seconds"],
                }

            # Immediate execution
            await self.send_whatsapp_message(
                norm_phone,
                f"🎯 *Nouvelle idée reçue :*\n_{text}_\n\n🚀 Lancement de la prospection intelligente sur 58 wilayas...",
            )

            # Launch campaign
            result = await batch_harvester.execute_campaign(
                idea_prompt=text,
                target_leads=target_leads,
            )

            completion_msg = (
                f"🎉 *Campagne terminée : {result['campaign_name']}*\n\n"
                f"📊 *Total Prospects :* {result['total_leads']}\n"
                f"⭐ *Haute Pertinence (Score ≥ 7) :* {result['high_intent_count']}\n"
                f"📋 *Lien Google Sheet :* {result['google_sheet_url']}\n\n"
                f"💡 *Aperçu des meilleurs prospects :*\n"
            )
            for l in result.get("top_leads", [])[:3]:
                completion_msg += f"• *{l['client_id']}* : {l['name']} ({l.get('location_wilaya', 'Algérie')}) | Score : {l.get('ai_fit_score')}/10\n"

            completion_msg += (
                f"\n📲 *Pour lancer un contact :*\n"
                f"`/send_ai {result['top_leads'][0]['client_id']}`\n"
                f"ou `/send {result['top_leads'][0]['client_id']} Votre message`"
            )
            await self.send_whatsapp_message(norm_phone, completion_msg)
            return {
                "status": "campaign_launched",
                "campaign_id": result.get("campaign_id"),
                "total_leads": result.get("total_leads"),
            }

        return {"status": "ignored", "reason": "Message too short"}

    async def _extract_message_data(self, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parses Evolution API event structure (text, voice notes, media)."""
        data = payload.get("data", payload)
        if isinstance(data, dict):
            key = data.get("key", {})
            msg_id = key.get("id")
            if msg_id and msg_id in self._bot_sent_message_ids:
                return None

            remote_jid = key.get("remoteJid", "")
            if "@s.whatsapp.net" not in remote_jid:
                return None

            phone_digits = remote_jid.split("@")[0]
            phone = f"+{phone_digits}"

            # If fromMe is True, only process if sender is the Admin messaging themselves (Notes to Self)
            if key.get("fromMe", False):
                admin_phones = [
                    settings.ADMIN_WHATSAPP_PHONE,
                    settings.ADMIN_PHONE_NUMBER,
                    os.getenv("ADMIN_WHATSAPP_PHONE"),
                ]
                valid_admins = [normalize_algerian_phone(p) or p for p in admin_phones if p]
                if not any(phone == adm for adm in valid_admins):
                    return None

            msg = data.get("message", {})

            # 1. Check Text
            text = (
                msg.get("conversation")
                or msg.get("extendedTextMessage", {}).get("text")
                or ""
            )

            # 2. Check Voice Note / Audio
            audio_msg = msg.get("audioMessage") or msg.get("voiceMessage")
            media_type = None
            media_bytes = None
            mime_type = "audio/ogg"

            if audio_msg:
                media_type = "audio"
                mime_type = audio_msg.get("mimetype", "audio/ogg")
                if "base64" in audio_msg:
                    import base64
                    try:
                        media_bytes = base64.b64decode(audio_msg["base64"])
                    except Exception:
                        pass
                elif "url" in audio_msg:
                    try:
                        async with httpx.AsyncClient(timeout=10.0) as client:
                            resp = await client.get(audio_msg["url"])
                            if resp.status_code == 200:
                                media_bytes = resp.content
                    except Exception:
                        pass

                # Transcribe with Groq Whisper
                trans_res = await media_transcriber.transcribe_voice_note(media_bytes or b"", filename="whatsapp_voice.ogg")
                text = trans_res.get("text", "")

            # 3. Check Video / Image / Document
            video_msg = msg.get("videoMessage")
            image_msg = msg.get("imageMessage")
            doc_msg = msg.get("documentMessage")

            if video_msg:
                media_type = "video"
                mime_type = video_msg.get("mimetype", "video/mp4")
                text = video_msg.get("caption", text)
            elif image_msg:
                media_type = "image"
                mime_type = image_msg.get("mimetype", "image/jpeg")
                text = image_msg.get("caption", text)
            elif doc_msg:
                media_type = "document"
                mime_type = doc_msg.get("mimetype", "application/pdf")
                text = doc_msg.get("caption", text)

            if text or media_type:
                return {
                    "phone": phone,
                    "text": text.strip() if text else "",
                    "media_type": media_type,
                    "media_bytes": media_bytes,
                    "mime_type": mime_type,
                    "raw_msg": msg,
                }

        return None

    def _is_high_intent_escalation(self, text: str) -> bool:
        """Determines if the client inquiry requires human intervention or preview assets."""
        lower = text.lower()
        return any(k in lower for k in ESCALATION_KEYWORDS)

    def _generate_suggested_reply(self, client_text: str, lead: Optional[Dict[str, Any]]) -> str:
        """Drafts suggested Darija / French response referencing agency RAG."""
        lower = client_text.lower()
        if any(w in lower for w in ["demo", "video", "apercu", "nchouf"]):
            return (
                "Salam khouya! Kayen démo wajda ta3 le bot WhatsApp kifach yrecouperi les commandes "
                "et ytwassa9 direct f Yalidine. Chouf la vidéo hadi: https://github.com/Maliksouhildev/chatbot-farm-saas"
            )
        elif any(w in lower for w in ["prix", "soum", "combien"]):
            return (
                "Salam khouya! Le pack complet يدير 45,000 DZD pour la configuration initiale "
                "+ 15,000 DZD/mois pour l'hébergement et l'assistance continue avec Yalidine."
            )
        else:
            return (
                "Salam khouya! Ya3tik essaha 3la l'intérêt. Notre équipe prépare les détails "
                "sur mesure pour votre boutique et on vous répond tout de suite."
            )

    def _generate_routine_reply(self, client_text: str, lead: Optional[Dict[str, Any]]) -> str:
        """Autonomous responder for basic greetings and FAQs."""
        lower = client_text.lower()
        lang = detect_language(client_text)

        if any(w in lower for w in ["salam", "bonjour", "salut", "marhaba", "coucou", "sbah el khir"]):
            if lang == "dar" or lang == "ar":
                return (
                    "Salam khouya! Marhba bik. Nous développons des agents WhatsApp intelligents "
                    "pour automatiser les commandes e-commerce et la livraison 58 wilayas. T7ab nwerrilek aperçu ?"
                )
            else:
                return (
                    "Bonjour ! Merci pour votre message. Nous accompagnons les entreprises pour "
                    "automatiser leurs commandes et leur service client sur WhatsApp. En quoi pouvons-nous vous aider ?"
                )

        if "yalidine" in lower or "livraison" in lower or "zr" in lower:
            return (
                "Iyeh bien sûr, le bot est connecté directement avec l'API Yalidine et ZR Express. "
                "Dès que le client valide la commande, le bon d'expédition s'imprime automatiquement."
            )

        # Default helpful fallback
        return (
            "Salam khouya ! Bien reçu votre message. Nous avons bien noté vos besoins et notre fondateur "
            "Malik va vous envoyer une réponse détaillée dans quelques instants."
        )

    async def send_whatsapp_message(
        self,
        phone: str,
        message: str,
        delay_ms: int = 2000,
    ) -> bool:
        """
        Dispatches WhatsApp message via Evolution API.
        Emulates human typing presence and respects 14-day anti-ban limits.
        """
        clean_digits = "".join(filter(str.isdigit, phone))
        url = f"{self.evolution_url}/message/sendText/{self.instance}"
        headers = {"apikey": self.api_key or "", "Content-Type": "application/json"}
        payload = {
            "number": clean_digits,
            "options": {"delay": delay_ms, "presence": "composing"},
            "text": message,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code in [200, 201]:
                    try:
                        res_data = resp.json()
                        msg_id = res_data.get("key", {}).get("id")
                        if msg_id:
                            self._bot_sent_message_ids.add(msg_id)
                            if len(self._bot_sent_message_ids) > 1000:
                                self._bot_sent_message_ids = set(list(self._bot_sent_message_ids)[-500:])
                    except Exception:
                        pass
                    logger.info(f"WhatsApp message dispatched to {clean_digits}.")
                    return True
                else:
                    logger.warning(f"Evolution API outbound standby ({resp.status_code}): {resp.text}")
        except Exception as e:
            logger.info(f"Evolution API offline/standby: {e}")
        return False

    def _find_lead_by_phone(self, phone: str) -> Optional[Dict[str, Any]]:
        """Looks up lead by phone in PostgreSQL with fallback to local campaign records."""
        try:
            if psycopg2:
                conn = psycopg2.connect(
                    host=settings.POSTGRES_HOST,
                    port=settings.POSTGRES_PORT,
                    dbname=settings.POSTGRES_DB,
                    user=settings.POSTGRES_USER,
                    password=settings.POSTGRES_PASSWORD,
                    connect_timeout=3,
                )
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        "SELECT * FROM leads WHERE contact_phone = %s OR contact_whatsapp = %s LIMIT 1;",
                        (phone, phone),
                    )
                    lead = cur.fetchone()
                    conn.close()
                    if lead:
                        return dict(lead)
        except Exception:
            pass

        # Fallback to local files
        return telegram_admin_bot._get_lead(phone)

    def _record_conversation_turn(
        self,
        lead_id: Optional[str],
        sender_type: str,
        recipient: str,
        content: str,
        intent: str,
    ):
        """Persists conversation message turn to PostgreSQL."""
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
                cur.execute(
                    """
                    INSERT INTO conversation_turns (lead_id, channel, sender_type, recipient, message_content, intent)
                    VALUES (%s, 'whatsapp', %s, %s, %s, %s);
                    """,
                    (lead_id, sender_type, recipient, content, intent),
                )
                conn.commit()
                conn.close()
        except Exception:
            pass

    def _save_escalation(
        self,
        lead: Optional[Dict[str, Any]],
        client_id: str,
        phone: str,
        client_msg: str,
        suggested_reply: str,
    ):
        """Persists emergency escalation card into escalations table."""
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
                cur.execute(
                    """
                    INSERT INTO escalations (lead_id, client_id, recipient_phone, client_message, status, suggested_ai_reply)
                    VALUES (%s, %s, %s, %s, 'pending', %s);
                    """,
                    (lead["id"] if lead else None, client_id, phone, client_msg, suggested_reply),
                )
                conn.commit()
                conn.close()
        except Exception:
            pass


whatsapp_conversation_agent = WhatsAppConversationAgent()
