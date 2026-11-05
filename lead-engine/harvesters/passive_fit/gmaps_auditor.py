# =============================================================================
# Lead Engine Passive Fit: Google Maps Auditor
# Harvests local businesses and audits website health:
# Detects: Missing website, Dead/404 website, Facebook-only links, No WhatsApp booking
# Direct HTTP/Serper Places API with lightweight async probing (0 MB browser bloat)
# =============================================================================

import logging
import asyncio
import random
from typing import List, Dict, Any, Optional
import httpx
import psycopg2
from psycopg2.extras import RealDictCursor

from config import (
    settings,
    DZ_PHONE_REGEX,
    normalize_algerian_phone,
    detect_language,
)
from redis_dedup import dedup_manager

logger = logging.getLogger("gmaps_auditor")
logger.setLevel(logging.INFO)

SERPER_PLACES_URL = "https://google.serper.dev/places"

# Target local service businesses in Algeria and Global metropolitan hubs
DEFAULT_MAPS_TARGETS = [
    {"query": "Clinique médicale privée", "location": "Alger, Algérie"},
    {"query": "Agence de voyage", "location": "Oran, Algérie"},
    {"query": "Cabinet dentaire", "location": "Constantine, Algérie"},
    {"query": "École de formation professionnelle", "location": "Alger, Algérie"},
    {"query": "Salle des fêtes et traiteur", "location": "Blida, Algérie"},
    {"query": "Showroom meuble et décoration", "location": "Sétif, Algérie"},
    {"query": "Dental clinic", "location": "London, UK"},
    {"query": "Plumbing and HVAC contractor", "location": "Austin, TX"},
]


class GMapsAuditor:
    def __init__(self):
        self.api_key = settings.SERPER_API_KEY
        self.endpoint = SERPER_PLACES_URL

    async def audit_website_health(self, url: Optional[str]) -> Dict[str, Any]:
        """
        Lightweight async HTTP audit of the business website.
        Detects if site is NULL, a Facebook/social link, dead/unresponsive, or SSL broken.
        Takes < 1s and consumes zero browser RAM.
        """
        if not url:
            return {
                "health": "missing",
                "pain_point": "no_website_at_all",
                "details": "Business has no website listed on Google Maps",
            }

        url_lower = url.lower()

        # Social media link acting as website
        if "facebook.com" in url_lower:
            return {
                "health": "social_fallback",
                "pain_point": "facebook_page_as_website",
                "details": "Business relies exclusively on Facebook page with no branded domain",
            }
        if "instagram.com" in url_lower:
            return {
                "health": "social_fallback",
                "pain_point": "instagram_profile_as_website",
                "details": "Business links to Instagram without a dedicated website",
            }

        # Perform fast direct HTTP probe
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            }
            async with httpx.AsyncClient(timeout=8.0, follow_redirects=True, verify=False) as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code >= 400:
                    return {
                        "health": "dead",
                        "pain_point": "broken_website_http_error",
                        "details": f"Website returns HTTP status {resp.status_code}",
                    }

                body_text = resp.text.lower()
                # Check if website lacks WhatsApp or booking system
                lacks_whatsapp = "wa.me" not in body_text and "whatsapp" not in body_text

                return {
                    "health": "alive",
                    "pain_point": "lacks_whatsapp_booking" if lacks_whatsapp else "ok",
                    "details": "Website responds, but lacks automated WhatsApp lead capture"
                    if lacks_whatsapp
                    else "Healthy site",
                }

        except httpx.ConnectError:
            return {
                "health": "dead",
                "pain_point": "domain_offline_or_dns_failed",
                "details": "DNS resolution failed or server connection refused",
            }
        except httpx.TimeoutException:
            return {
                "health": "slow",
                "pain_point": "website_timeout_unresponsive",
                "details": "Server took over 8 seconds to respond",
            }
        except Exception as e:
            return {
                "health": "error",
                "pain_point": "website_ssl_or_handshake_error",
                "details": f"HTTP audit error: {str(e)}",
            }

    async def audit_niche(
        self,
        query: str,
        location: str,
        max_results: int = 20,
    ) -> List[Dict[str, Any]]:
        """
        Fetches Google Maps places and audits their digital presence.
        """
        if not self.api_key:
            logger.warning("SERPER_API_KEY missing. Google Maps auditing running in standby.")
            return []

        harvested = []
        headers = {
            "X-API-KEY": self.api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "q": f"{query} {location}",
            "location": location,
            "num": min(max_results, 30),
        }

        try:
            logger.info(f"Auditing Google Maps niche: '{query}' in '{location}'...")
            async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT_SECONDS) as client:
                res = await client.post(self.endpoint, headers=headers, json=payload)
                if res.status_code != 200:
                    logger.error(f"Serper Places API returned {res.status_code}: {res.text}")
                    return []

                data = res.json()
                places = data.get("places", [])

                for place in places:
                    title = place.get("title", "")
                    website = place.get("website")
                    phone = place.get("phoneNumber")
                    address = place.get("address", "")
                    rating = place.get("rating", 0)
                    rating_count = place.get("ratingCount", 0)

                    # Audit website
                    audit = await self.audit_website_health(website)

                    # Filter: Only qualify if there is a real friction point (dead site, missing site, FB link)
                    if audit["health"] == "alive" and audit["pain_point"] == "ok":
                        continue

                    # Phone normalization
                    clean_phone = None
                    if phone:
                        clean_phone = normalize_algerian_phone(phone) or phone.replace(" ", "")

                    if not clean_phone and not website:
                        continue

                    # Market & Country identification
                    is_dz = "alg" in location.lower() or (clean_phone and clean_phone.startswith("+213"))
                    market = "algeria" if is_dz else "global"
                    country = "Algeria" if is_dz else (
                        "France" if "france" in location.lower() or "paris" in location.lower() else
                        "UK" if "london" in location.lower() or "uk" in location.lower() else
                        "USA" if "austin" in location.lower() or "us" in location.lower() else "Global"
                    )

                    # Pain points & proposed service
                    pain_points = [audit["pain_point"]]
                    if audit["health"] in ["missing", "dead", "social_fallback"]:
                        proposed_service = "ecommerce_web_dev"
                    else:
                        proposed_service = "whatsapp_bot"

                    fingerprint = dedup_manager.compute_fingerprint(
                        source="gmaps",
                        external_id=str(place.get("cid") or title),
                        phone=clean_phone,
                    )

                    if dedup_manager.is_duplicate(fingerprint):
                        continue

                    lead_dict = {
                        "fingerprint": fingerprint,
                        "source": "gmaps",
                        "external_id": str(place.get("cid") or title),
                        "target_market": market,
                        "country": country,
                        "lead_category": "PASSIVE_POTENTIAL",
                        "sub_niche": query,
                        "name": title,
                        "company_name": title,
                        "contact_email": None,
                        "contact_phone": clean_phone,
                        "contact_whatsapp": clean_phone if (clean_phone and clean_phone.startswith("+213")) else None,
                        "contact_telegram": None,
                        "contact_instagram": None,
                        "contact_facebook": website if "facebook.com" in (website or "") else None,
                        "website_url": website,
                        "location_wilaya": location,
                        "category_niche": query,
                        "raw_content": (
                            f"Google Maps Place: {title}\n"
                            f"Category: {place.get('category')}\n"
                            f"Address: {address}\n"
                            f"Rating: {rating} ({rating_count} reviews)\n"
                            f"Audit Result: {audit['details']}"
                        ),
                        "detected_language": "fr" if is_dz else "en",
                        "identified_pain_points": pain_points,
                        "proposed_service": proposed_service,
                        "status": "new",
                        "synced_to_sheets": False,
                        "metadata": {
                            "audit_health": audit["health"],
                            "audit_details": audit["details"],
                            "rating": rating,
                            "reviews_count": rating_count,
                            "place_cid": place.get("cid"),
                        },
                    }

                    if self._save_to_db(lead_dict):
                        dedup_manager.mark_seen(
                            fingerprint,
                            {"source": "gmaps", "title": title, "audit": audit["health"]},
                        )
                        harvested.append(lead_dict)

                logger.info(f"Maps audit finished. Found {len(harvested)} qualified high-friction leads.")
                return harvested

        except Exception as e:
            logger.error(f"Error during Google Maps audit for {query} {location}: {e}")
            return []

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
                        contact_whatsapp, contact_facebook, website_url, location_wilaya,
                        category_niche, raw_content, detected_language,
                        identified_pain_points, proposed_service, status, synced_to_sheets, metadata
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
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
            logger.error(f"Error saving Google Maps lead: {e}")
            return False


# Singleton instance
gmaps_auditor = GMapsAuditor()
