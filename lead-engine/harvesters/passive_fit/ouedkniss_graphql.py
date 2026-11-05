# =============================================================================
# Lead Engine Passive Fit: Ouedkniss Direct GraphQL Scraper
# Harvests Algerian Pro Stores lacking modern websites & automated order systems
# Operates via direct HTTPX GraphQL calls - ZERO headless browser overhead
# =============================================================================

import logging
import time
import random
from typing import List, Dict, Any, Optional
import httpx
import psycopg2
from psycopg2.extras import RealDictCursor

from config import (
    settings,
    normalize_algerian_phone,
    detect_language,
    detect_pain_points_and_service,
)
from redis_dedup import dedup_manager

logger = logging.getLogger("ouedkniss_graphql")
logger.setLevel(logging.INFO)

OUEDKNISS_GRAPHQL_URL = "https://api.ouedkniss.com/graphql"

# Targeted high-turnover retail & wholesale niches in Algeria
TARGET_NICHES = [
    "informatique",
    "electromenager",
    "vetements",
    "cosmetique",
    "pieces-detachees",
    "meubles",
    "telephone",
]

DEFAULT_USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
]


class OuedknissHarvester:
    def __init__(self):
        self.endpoint = OUEDKNISS_GRAPHQL_URL

    def _build_graphql_payload(self, keyword: str, page: int = 1) -> Dict[str, Any]:
        """
        Constructs GraphQL query targeting Pro Stores with inventory metadata.
        """
        query = """
        query SearchStores($q: String, $page: Int) {
            storeSearch(q: $q, page: $page) {
                data {
                    id
                    name
                    slug
                    description
                    phone
                    phones
                    email
                    website
                    address
                    wilaya {
                        id
                        name
                        code
                    }
                    commune {
                        name
                    }
                    followerCount
                    announcementsCount
                    hasDelivery
                }
                paginatorInfo {
                    currentPage
                    hasMorePages
                    total
                }
            }
        }
        """
        return {
            "query": query,
            "variables": {
                "q": keyword,
                "page": page,
            },
        }

    async def harvest_stores(
        self,
        categories: Optional[List[str]] = None,
        max_pages: int = 3,
    ) -> List[Dict[str, Any]]:
        """
        Queries Ouedkniss GraphQL endpoint for stores and qualifies passive leads.
        """
        niches = categories or TARGET_NICHES
        harvested_leads = []

        headers = {
            "User-Agent": random.choice(DEFAULT_USER_AGENTS),
            "Content-Type": "application/json",
            "Accept": "application/json, text/plain, */*",
            "Origin": "https://www.ouedkniss.com",
            "Referer": "https://www.ouedkniss.com/boutiques",
        }

        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT_SECONDS, headers=headers, http2=True) as client:
            for niche in niches:
                logger.info(f"Harvesting Ouedkniss Pro stores for niche: '{niche}'...")

                for page in range(1, max_pages + 1):
                    payload = self._build_graphql_payload(niche, page=page)
                    try:
                        response = await client.post(self.endpoint, json=payload)

                        # If GraphQL endpoint returns non-200 or blocks, handle gracefully
                        if response.status_code != 200:
                            logger.warning(
                                f"Ouedkniss GraphQL returned HTTP {response.status_code} for {niche} (page {page})."
                            )
                            # Fallback simulated probe if external API changed or requires cloudflare cookie
                            break

                        res_json = response.json()
                        stores_data = (
                            res_json.get("data", {})
                            .get("storeSearch", {})
                            .get("data", [])
                        )

                        if not stores_data:
                            logger.info(f"No more stores found for niche '{niche}' on page {page}.")
                            break

                        for store in stores_data:
                            lead = self._audit_and_qualify_store(store, niche)
                            if not lead:
                                continue

                            if dedup_manager.is_duplicate(lead["fingerprint"]):
                                continue

                            if self._save_to_db(lead):
                                dedup_manager.mark_seen(
                                    lead["fingerprint"],
                                    {"source": "ouedkniss", "store": store.get("name")},
                                )
                                harvested_leads.append(lead)

                        # Check pagination
                        has_more = (
                            res_json.get("data", {})
                            .get("storeSearch", {})
                            .get("paginatorInfo", {})
                            .get("hasMorePages", False)
                        )
                        if not has_more:
                            break

                        await asyncio.sleep(random.uniform(1.2, 2.5))

                    except httpx.RequestError as exc:
                        logger.error(f"Network error requesting Ouedkniss GraphQL: {exc}")
                        break
                    except Exception as exc:
                        logger.error(f"Unexpected error parsing Ouedkniss store data: {exc}")
                        break

        logger.info(
            f"Ouedkniss harvest complete. Discovered {len(harvested_leads)} qualified passive leads."
        )
        return harvested_leads

    def _audit_and_qualify_store(self, store: Dict[str, Any], niche: str) -> Optional[Dict[str, Any]]:
        """
        Audits store to verify passive qualification fit:
        1. Does it have products but NO dedicated e-commerce web platform?
        2. Does it rely solely on a phone / Facebook page?
        """
        store_id = str(store.get("id") or store.get("slug"))
        name = store.get("name")
        website = (store.get("website") or "").strip()
        description = store.get("description") or ""
        phones_list = store.get("phones") or ([store.get("phone")] if store.get("phone") else [])
        
        # Extract phone and normalize
        clean_phone = None
        for p in phones_list:
            if p:
                norm = normalize_algerian_phone(str(p))
                if norm:
                    clean_phone = norm
                    break

        # Qualification filter: Store must have contact method
        if not clean_phone and not store.get("email"):
            return None

        # Check website pain points
        pain_points = []
        proposed_service = "ecommerce_web_dev"

        if not website:
            pain_points.append("no_website")
            pain_points.append("manual_order_intake")
            proposed_service = "ecommerce_web_dev"
        elif "facebook.com" in website.lower() or "instagram.com" in website.lower():
            pain_points.append("social_media_only_no_cart")
            proposed_service = "whatsapp_bot"
        else:
            # Already has a custom website; check if they have high inventory and need n8n inventory sync
            announcements = store.get("announcementsCount") or 0
            if announcements > 30:
                pain_points.append("inventory_sync_needed")
                proposed_service = "n8n_automation"
            else:
                return None  # Already equipped with website and low volume

        wilaya_info = store.get("wilaya", {})
        wilaya_name = wilaya_info.get("name") if isinstance(wilaya_info, dict) else "Algeria"

        fingerprint = dedup_manager.compute_fingerprint(
            source="ouedkniss",
            external_id=store_id,
            phone=clean_phone,
            email=store.get("email"),
        )

        raw_content = (
            f"Ouedkniss Pro Store: {name}\n"
            f"Niche: {niche}\n"
            f"Wilaya: {wilaya_name}\n"
            f"Items Count: {store.get('announcementsCount', 0)}\n"
            f"Description: {description}\n"
            f"Existing Link: {website or 'None'}"
        )

        return {
            "fingerprint": fingerprint,
            "source": "ouedkniss",
            "external_id": store_id,
            "target_market": "algeria",
            "name": name,
            "company_name": name,
            "contact_email": store.get("email"),
            "contact_phone": clean_phone,
            "contact_whatsapp": clean_phone,
            "contact_telegram": None,
            "contact_instagram": website if "instagram.com" in website.lower() else None,
            "contact_facebook": website if "facebook.com" in website.lower() else None,
            "website_url": website if website and not any(s in website.lower() for s in ["facebook", "instagram"]) else None,
            "location_wilaya": wilaya_name,
            "category_niche": niche,
            "raw_content": raw_content,
            "detected_language": detect_language(description or name),
            "identified_pain_points": pain_points,
            "proposed_service": proposed_service,
            "status": "new",
            "metadata": {
                "store_slug": store.get("slug"),
                "announcements_count": store.get("announcementsCount"),
                "has_delivery": store.get("hasDelivery"),
                "address": store.get("address"),
            },
        }

    def _save_to_db(self, lead: Dict[str, Any]) -> bool:
        """Persists Ouedkniss lead to database."""
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
                        fingerprint, source, external_id, target_market, name,
                        company_name, contact_email, contact_phone, contact_whatsapp,
                        contact_instagram, contact_facebook, website_url, location_wilaya,
                        category_niche, raw_content, detected_language,
                        identified_pain_points, proposed_service, status, metadata
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                    ON CONFLICT (fingerprint) DO NOTHING
                    RETURNING id;
                    """,
                    (
                        lead["fingerprint"],
                        lead["source"],
                        lead["external_id"],
                        lead["target_market"],
                        lead["name"],
                        lead["company_name"],
                        lead["contact_email"],
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
                        psycopg2.extras.Json(lead["metadata"]),
                    ),
                )
                inserted = cur.fetchone()
                conn.commit()
                conn.close()
                return bool(inserted)
        except Exception as e:
            logger.error(f"Error persisting Ouedkniss lead: {e}")
            return False


# Singleton instance
ouedkniss_harvester = OuedknissHarvester()
