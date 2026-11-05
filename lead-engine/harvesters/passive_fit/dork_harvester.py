# =============================================================================
# Lead Engine Passive Fit: Google Dork Harvester (Serper.dev API)
# Targets Algerian Instagram & Facebook E-Commerce stores suffering from
# "Prix en Privé" / "58 Wilayas" manual DM order bottlenecks
# Uses Serper API (direct HTTP) - ZERO headless browser overhead
# =============================================================================

import logging
import re
import random
import asyncio
from typing import List, Dict, Any, Optional
import httpx
import psycopg2
from psycopg2.extras import RealDictCursor

from config import (
    settings,
    DZ_PHONE_REGEX,
    WHATSAPP_LINK_REGEX,
    INSTAGRAM_REGEX,
    normalize_algerian_phone,
    detect_language,
)
from redis_dedup import dedup_manager

logger = logging.getLogger("dork_harvester")
logger.setLevel(logging.INFO)

SERPER_API_URL = "https://google.serper.dev/search"

# Algerian targeted dork queries
TARGET_DORKS = [
    'site:instagram.com "58 wilayas" "prix en privé"',
    'site:instagram.com "58 wilayas" "prix en mp"',
    'site:instagram.com "livraison 58 wilayas" "commande en privé"',
    'site:instagram.com "livraison disponible 58 wilayas" "wa.me"',
    'site:facebook.com "58 wilayas" "prix en mp"',
    'site:facebook.com "livraison 58 wilayas" "commande par whatsapp"',
    'site:instagram.com "boutique algerie" "prix en mp"',
    'site:instagram.com "vente en ligne" "58 wilayas" "alger"',
]


class DorkHarvester:
    def __init__(self):
        self.api_key = settings.SERPER_API_KEY
        self.endpoint = SERPER_API_URL

    async def harvest_dorks(
        self,
        dork_queries: Optional[List[str]] = None,
        max_results_per_dork: int = 20,
    ) -> List[Dict[str, Any]]:
        """
        Executes Google Dorks via Serper.dev API to extract e-commerce stores in Algeria.
        """
        queries = dork_queries or TARGET_DORKS
        harvested = []

        if not self.api_key:
            logger.warning(
                "SERPER_API_KEY is not configured in .env. Dork harvester will simulate or run in standby."
            )
            return []

        headers = {
            "X-API-KEY": self.api_key,
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT_SECONDS) as client:
            for query in queries:
                logger.info(f"Executing Google Dork search: {query}...")
                payload = {
                    "q": query,
                    "num": min(max_results_per_dork, 50),
                    "gl": "dz",
                    "hl": "fr",
                }

                try:
                    res = await client.post(self.endpoint, headers=headers, json=payload)
                    if res.status_code != 200:
                        logger.error(f"Serper API returned {res.status_code}: {res.text}")
                        continue

                    data = res.json()
                    organic = data.get("organic", [])

                    for item in organic:
                        lead = self._parse_search_result(item, query)
                        if not lead:
                            continue

                        if dedup_manager.is_duplicate(lead["fingerprint"]):
                            continue

                        if self._save_to_db(lead):
                            dedup_manager.mark_seen(
                                lead["fingerprint"],
                                {"source": "google_dork", "link": lead.get("website_url")},
                            )
                            harvested.append(lead)

                    await asyncio.sleep(random.uniform(0.8, 1.8))

                except Exception as e:
                    logger.error(f"Error during dork query '{query}': {e}")

        logger.info(f"Dork harvesting finished. Discovered {len(harvested)} qualified passive leads.")
        return harvested

    def _parse_search_result(self, item: Dict[str, Any], query_used: str) -> Optional[Dict[str, Any]]:
        """Parses organic search item and extracts Algerian store info and contacts."""
        title = item.get("title", "")
        snippet = item.get("snippet", "")
        link = item.get("link", "")
        combined_text = f"{title}\n{snippet}"

        # Extract Instagram handle if applicable
        ig_username = None
        ig_match = INSTAGRAM_REGEX.search(link) or INSTAGRAM_REGEX.search(snippet)
        if ig_match:
            ig_username = ig_match.group(1) or ig_match.group(2)

        # Extract Algerian Phone / WhatsApp
        clean_phone = None
        phone_match = DZ_PHONE_REGEX.search(combined_text)
        if phone_match:
            clean_phone = normalize_algerian_phone(phone_match.group(0))

        # Check for WhatsApp link
        wa_match = WHATSAPP_LINK_REGEX.search(combined_text)
        wa_contact = None
        if wa_match:
            wa_num = wa_match.group(1)
            wa_contact = normalize_algerian_phone(wa_num) or clean_phone

        # Filter: lead must have either a clean phone or an Instagram username
        if not clean_phone and not ig_username:
            return None

        # Clean store name
        store_name = title.split("•")[0].split("-")[0].replace("Instagram", "").replace("Facebook", "").strip()
        if not store_name:
            store_name = f"@{ig_username}" if ig_username else "Algerian Online Boutique"

        # Identify friction
        pain_points = ["dm_for_price", "manual_customer_support"]
        proposed_service = "instagram_bot"

        if "58 wilayas" in combined_text.lower():
            pain_points.append("58_wilayas_order_chaos")
            proposed_service = "whatsapp_bot"

        if "site:" in query_used and "instagram" in query_used:
            pain_points.append("no_ecommerce_website")

        fingerprint = dedup_manager.compute_fingerprint(
            source="google_dork",
            external_id=ig_username or link,
            phone=clean_phone,
            raw_text=title,
        )

        return {
            "fingerprint": fingerprint,
            "source": "google_dork",
            "external_id": link,
            "target_market": "algeria",
            "country": "Algeria",
            "lead_category": "PASSIVE_POTENTIAL",
            "sub_niche": "Algerian Social Store",
            "name": store_name,
            "company_name": store_name,
            "contact_email": None,
            "contact_phone": clean_phone,
            "contact_whatsapp": wa_contact or clean_phone,
            "contact_telegram": None,
            "contact_instagram": f"@{ig_username}" if ig_username else None,
            "contact_facebook": link if "facebook.com" in link else None,
            "website_url": link,
            "location_wilaya": "Algeria (58 Wilayas)",
            "category_niche": "E-Commerce / Retail",
            "raw_content": f"Title: {title}\nSnippet: {snippet}\nURL: {link}\nDork: {query_used}",
            "detected_language": detect_language(combined_text),
            "identified_pain_points": pain_points,
            "proposed_service": proposed_service,
            "status": "new",
            "synced_to_sheets": False,
            "metadata": {
                "source_dork": query_used,
                "google_position": item.get("position"),
                "snippet": snippet,
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
                        lead_category, sub_niche, name, company_name, contact_phone,
                        contact_whatsapp, contact_instagram, contact_facebook, website_url,
                        location_wilaya, category_niche, raw_content,
                        detected_language, identified_pain_points, proposed_service,
                        status, synced_to_sheets, metadata
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
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
                        lead["company_name"],
                        lead["contact_phone"],
                        lead["contact_whatsapp"],
                        lead["contact_instagram"],
                        lead["contact_facebook"],
                        lead["website_url"],
                        lead["location_wilaya"],
                        lead["category_niche"],
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
            logger.error(f"Error saving dork lead: {e}")
            return False


# Singleton instance
dork_harvester = DorkHarvester()
