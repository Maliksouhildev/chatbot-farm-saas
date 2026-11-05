# =============================================================================
# Lead Engine Active Intent: Telegram MTProto Listener
# Telethon event-driven listener & historical scanner for Algerian & Global Groups
# Detects Darija, Arabic, French, and English intent signals in real time
# =============================================================================

import os
import asyncio
import logging
from typing import Optional, List, Dict, Any
from telethon import TelegramClient, events
from telethon.tl.types import Channel, Chat, User
import psycopg2
from psycopg2.extras import RealDictCursor

from config import (
    settings,
    DARIJA_ARABIZI_TRIGGERS,
    ARABIC_SCRIPT_TRIGGERS,
    FRENCH_TRIGGERS,
    ENGLISH_INTENT_TRIGGERS,
    DZ_PHONE_REGEX,
    normalize_algerian_phone,
    detect_language,
    detect_pain_points_and_service,
)
from redis_dedup import dedup_manager

logger = logging.getLogger("telegram_listener")
logger.setLevel(logging.INFO)


class TelegramHarvester:
    def __init__(self):
        self.client: Optional[TelegramClient] = None
        self._is_running = False
        self.session_path = os.path.join(
            settings.TELEGRAM_SESSION_DIR, f"{settings.TELEGRAM_SESSION_NAME}.session"
        )

    def _init_client(self) -> bool:
        """Initializes Telethon MTProto client if API ID and Hash are provided."""
        if not settings.TELEGRAM_API_ID or not settings.TELEGRAM_API_HASH:
            logger.warning(
                "Telegram MTProto credentials (TELEGRAM_API_ID / TELEGRAM_API_HASH) not configured. Telegram listener running in standby."
            )
            return False

        try:
            os.makedirs(settings.TELEGRAM_SESSION_DIR, exist_ok=True)
            self.client = TelegramClient(
                self.session_path,
                api_id=settings.TELEGRAM_API_ID,
                api_hash=settings.TELEGRAM_API_HASH,
            )
            return True
        except Exception as e:
            logger.error(f"Failed to initialize Telethon client: {e}")
            self.client = None
            return False

    def _matches_intent(self, text: str) -> bool:
        """Checks if the message matches active buyer intent across any of the 4 languages."""
        if not text or len(text.strip()) < 10:
            return False

        lower = text.lower()
        all_triggers = (
            DARIJA_ARABIZI_TRIGGERS
            + ARABIC_SCRIPT_TRIGGERS
            + FRENCH_TRIGGERS
            + ENGLISH_INTENT_TRIGGERS
        )
        return any(trigger in lower for trigger in all_triggers)

    def _extract_lead_data(self, message, sender, chat) -> Dict[str, Any]:
        """Normalizes Telegram message into standard Lead Engine record."""
        text = message.text or ""
        sender_username = getattr(sender, "username", None) if sender else None
        first_name = getattr(sender, "first_name", "") or ""
        last_name = getattr(sender, "last_name", "") or ""
        full_name = f"{first_name} {last_name}".strip() or sender_username or "Telegram User"

        # Extract Algerian phone numbers if mentioned in the message or profile
        raw_phone_match = DZ_PHONE_REGEX.search(text)
        clean_phone = normalize_algerian_phone(raw_phone_match.group(0)) if raw_phone_match else None

        lang = detect_language(text)
        market = "algeria" if (clean_phone or lang in ["dar", "ar"]) else "global"
        heuristics = detect_pain_points_and_service(text)

        chat_title = getattr(chat, "title", str(getattr(chat, "id", "chat")))

        fingerprint = dedup_manager.compute_fingerprint(
            source="telegram",
            external_id=f"{message.chat_id}:{message.id}",
            phone=clean_phone,
            raw_text=text[:60],
        )

        country = "Algeria" if market == "algeria" else "Global"
        return {
            "fingerprint": fingerprint,
            "source": "telegram",
            "external_id": f"{message.chat_id}_{message.id}",
            "target_market": market,
            "country": country,
            "lead_category": "ACTIVE_REQUEST",
            "sub_niche": chat_title or "Telegram Group",
            "name": full_name,
            "company_name": None,
            "contact_email": None,
            "contact_phone": clean_phone,
            "contact_whatsapp": clean_phone,
            "contact_telegram": f"@{sender_username}" if sender_username else str(getattr(sender, "id", "")),
            "contact_instagram": None,
            "contact_facebook": None,
            "website_url": None,
            "location_wilaya": "Algeria" if market == "algeria" else "Global",
            "category_niche": chat_title,
            "raw_content": text,
            "detected_language": lang,
            "identified_pain_points": heuristics["pain_points"],
            "proposed_service": heuristics["proposed_service"],
            "status": "new",
            "synced_to_sheets": False,
            "metadata": {
                "chat_id": message.chat_id,
                "message_id": message.id,
                "date": str(message.date),
                "chat_title": chat_title,
                "sender_id": getattr(sender, "id", None),
            },
        }

    def _save_to_db(self, lead: Dict[str, Any]) -> bool:
        """Persists lead to PostgreSQL."""
        try:
            conn = psycopg2.connect(
                host=settings.POSTGRES_HOST,
                port=settings.POSTGRES_PORT,
                dbname=settings.POSTGRES_DB,
                user=settings.POSTGRES_USER,
                password=settings.POSTGRES_PASSWORD,
            )
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO leads (
                        fingerprint, source, external_id, target_market, country,
                        lead_category, sub_niche, name, contact_phone, contact_whatsapp,
                        contact_telegram, raw_content, detected_language, identified_pain_points,
                        proposed_service, status, synced_to_sheets, metadata
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                    ON CONFLICT (fingerprint) DO NOTHING
                    RETURNING id;
                    """,
                    (
                        lead["fingerprint"],
                        lead["source"],
                        lead["external_id"],
                        lead["target_market"],
                        lead["country"],
                        lead["lead_category"],
                        lead["sub_niche"],
                        lead["name"],
                        lead["contact_phone"],
                        lead["contact_whatsapp"],
                        lead["contact_telegram"],
                        lead["raw_content"],
                        lead["detected_language"],
                        lead["identified_pain_points"],
                        lead["proposed_service"],
                        lead["status"],
                        lead["synced_to_sheets"],
                        psycopg2.extras.Json(lead["metadata"]),
                    ),
                )
                inserted = cur.fetchone()
                conn.commit()
                conn.close()
                return bool(inserted)
        except Exception as e:
            logger.error(f"Database error saving Telegram lead: {e}")
            return False

    async def start_listener(self):
        """Asynchronous worker that listens for live incoming Telegram messages."""
        if not self._init_client():
            return

        try:
            await self.client.connect()
            if not await self.client.is_user_authorized():
                logger.warning(
                    f"Telegram client not authorized. Please run interactive login to generate {self.session_path}."
                )
                return

            self._is_running = True
            logger.info("Telegram real-time listener connected and monitoring messages...")

            @self.client.on(events.NewMessage())
            async def handler(event):
                try:
                    text = event.raw_text
                    if not self._matches_intent(text):
                        return

                    sender = await event.get_sender()
                    chat = await event.get_chat()
                    lead = self._extract_lead_data(event.message, sender, chat)

                    if dedup_manager.is_duplicate(lead["fingerprint"]):
                        return

                    if self._save_to_db(lead):
                        dedup_manager.mark_seen(lead["fingerprint"], {"source": "telegram"})
                        logger.info(
                            f"Captured high-intent Telegram lead from {lead['name']} ({lead['target_market']})"
                        )

                except Exception as inner_e:
                    logger.error(f"Error handling Telegram message event: {inner_e}")

            await self.client.run_until_disconnected()

        except Exception as e:
            logger.error(f"Telegram listener encountered fatal loop error: {e}")
        finally:
            self._is_running = False

    async def scan_recent_dialogs(self, limit_per_chat: int = 30) -> List[Dict[str, Any]]:
        """Scans recent messages in joined channels/groups on-demand."""
        if not self.client:
            if not self._init_client():
                return []

        harvested = []
        try:
            if not self.client.is_connected():
                await self.client.connect()
            if not await self.client.is_user_authorized():
                logger.warning("Telegram client unauthorized for dialog scanning.")
                return []

            target_chats = [c.strip() for c in settings.TELEGRAM_TARGET_GROUPS.split(",") if c.strip()]
            dialogs = await self.client.get_dialogs(limit=50)

            for dialog in dialogs:
                if target_chats and dialog.name not in target_chats and str(dialog.id) not in target_chats:
                    continue

                logger.info(f"Scanning Telegram dialog: {dialog.name}...")
                async for message in self.client.iter_messages(dialog, limit=limit_per_chat):
                    if not message.text or not self._matches_intent(message.text):
                        continue

                    sender = await message.get_sender()
                    lead = self._extract_lead_data(message, sender, dialog)

                    if dedup_manager.is_duplicate(lead["fingerprint"]):
                        continue

                    if self._save_to_db(lead):
                        dedup_manager.mark_seen(lead["fingerprint"], {"source": "telegram"})
                        harvested.append(lead)

            logger.info(f"Telegram manual scan finished. Discovered {len(harvested)} qualified leads.")
            return harvested

        except Exception as e:
            logger.error(f"Error during Telegram dialog scan: {e}")
            return []


# Singleton instance
telegram_harvester = TelegramHarvester()
