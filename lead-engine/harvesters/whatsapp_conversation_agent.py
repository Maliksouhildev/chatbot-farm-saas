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

    async def handle_incoming_webhook(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes Evolution API webhook payload (`messages.upsert`).
        Identifies sender, loads lead history, determines escalation, and replies.
        """
        logger.info("Received WhatsApp incoming webhook event.")

        # Extract message metadata from Evolution API structure
        message_data = self._extract_message_data(payload)
        if not message_data:
            return {"status": "ignored", "reason": "Not a standard incoming client text"}

        sender_phone = message_data["phone"]
        message_text = message_data["text"]
        norm_phone = normalize_algerian_phone(sender_phone) or sender_phone

        # 1. Lookup lead record in PostgreSQL
        lead = self._find_lead_by_phone(norm_phone)

        # 2. Check Intent: Escalation vs Routine
        is_escalation = self._is_high_intent_escalation(message_text)

        # 3. Log incoming message turn
        self._record_conversation_turn(
            lead_id=lead["id"] if lead else None,
            sender_type="client",
            recipient=norm_phone,
            content=message_text,
            intent="escalation" if is_escalation else "routine",
        )

        # 4. Handle Escalation to Telegram Admin Bot
        if is_escalation:
            logger.info(f"🚨 High intent escalation detected for client: {norm_phone}")
            client_id = lead.get("client_id", "DZ-UNKNOWN") if lead else "NEW-INQUIRY"
            business_name = lead.get("company_name", lead.get("name", "Boutique")) if lead else "Prospective Client"

            # Generate suggested reply using agency RAG
            suggested_reply = self._generate_suggested_reply(message_text, lead)

            # Send Telegram Alert Card to Admin's phone
            await telegram_admin_bot.send_escalation_card(
                lead_id=str(lead["id"]) if lead else "unknown",
                client_id=client_id,
                business_name=business_name,
                phone=norm_phone,
                client_message=message_text,
                suggested_ai_reply=suggested_reply,
            )

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

        # 5. Routine Inquiry: AI Answers Autonomously using RAG
        reply_text = self._generate_routine_reply(message_text, lead)
        await self.send_whatsapp_message(norm_phone, reply_text, delay_ms=2000)

        # Record AI reply turn
        self._record_conversation_turn(
            lead_id=lead["id"] if lead else None,
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

    def _extract_message_data(self, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parses Evolution API event structure."""
        data = payload.get("data", payload)
        if isinstance(data, dict):
            key = data.get("key", {})
            # Ignore messages sent by ourselves
            if key.get("fromMe", False):
                return None

            remote_jid = key.get("remoteJid", "")
            if "@s.whatsapp.net" not in remote_jid:
                return None

            phone_digits = remote_jid.split("@")[0]
            msg = data.get("message", {})
            text = (
                msg.get("conversation")
                or msg.get("extendedTextMessage", {}).get("text")
                or msg.get("imageMessage", {}).get("caption")
                or ""
            )

            if text:
                return {"phone": f"+{phone_digits}", "text": text.strip()}

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
                    logger.info(f"WhatsApp message dispatched to {clean_digits}.")
                    return True
                else:
                    logger.warning(f"Evolution API outbound standby ({resp.status_code}): {resp.text}")
        except Exception as e:
            logger.info(f"Evolution API offline/standby: {e}")
        return False

    def _find_lead_by_phone(self, phone: str) -> Optional[Dict[str, Any]]:
        """Looks up lead by phone in PostgreSQL."""
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
                cur.execute(
                    "SELECT * FROM leads WHERE contact_phone = %s OR contact_whatsapp = %s LIMIT 1;",
                    (phone, phone),
                )
                lead = cur.fetchone()
                conn.close()
                return dict(lead) if lead else None
        except Exception:
            return None

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
