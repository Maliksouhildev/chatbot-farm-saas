# =============================================================================
# Lead Engine Active Intent: Reddit Harvester
# Uses PRAW OAuth2 with dynamic rate-limit inspection and exponential backoff
# Scans subreddits for active buyer intent (n8n, chatbots, web dev)
# =============================================================================

import logging
import time
import random
from typing import List, Dict, Any, Optional
try:
    import praw
    from prawcore.exceptions import ResponseException, RequestException, ServerError
    HAS_PRAW = True
except ImportError:
    HAS_PRAW = False
    praw = None
    ResponseException = Exception
    RequestException = Exception
    ServerError = Exception

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False
    psycopg2 = None
    RealDictCursor = None

from config import (
    settings,
    ENGLISH_INTENT_TRIGGERS,
    FRENCH_TRIGGERS,
    detect_language,
    detect_pain_points_and_service,
)
from redis_dedup import dedup_manager

logger = logging.getLogger("reddit_harvester")
logging.basicConfig(level=logging.INFO)


class RedditHarvester:
    def __init__(self):
        self.reddit: Optional[praw.Reddit] = None
        self._init_praw()

    def _init_praw(self):
        """Initializes the PRAW client using OAuth2 application credentials."""
        if not settings.REDDIT_CLIENT_ID or not settings.REDDIT_CLIENT_SECRET:
            logger.warning(
                "Reddit API credentials (REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET) missing. Reddit harvesting will be skipped or simulated."
            )
            return

        try:
            self.reddit = praw.Reddit(
                client_id=settings.REDDIT_CLIENT_ID,
                client_secret=settings.REDDIT_CLIENT_SECRET,
                user_agent=settings.REDDIT_USER_AGENT,
                username=settings.REDDIT_USERNAME if settings.REDDIT_USERNAME else None,
                password=settings.REDDIT_PASSWORD if settings.REDDIT_PASSWORD else None,
                ratelimit_seconds=300,
            )
            # Read-only mode test
            logger.info(f"PRAW initialized successfully. Read-only mode: {self.reddit.read_only}")
        except Exception as e:
            logger.error(f"Failed to initialize PRAW: {e}")
            self.reddit = None

    def _handle_rate_limit(self):
        """
        Inspects PRAW client rate limits and executes exponential backoff if limits are low.
        """
        if not self.reddit:
            return

        rate_limit = getattr(self.reddit.auth, "limits", {})
        remaining = rate_limit.get("remaining")
        reset_timestamp = rate_limit.get("reset_timestamp")

        if remaining is not None and remaining < 10:
            sleep_time = max(5.0, (reset_timestamp - time.time()) if reset_timestamp else 30.0)
            logger.warning(
                f"Reddit rate limit threshold reached! Remaining: {remaining}. Sleeping for {sleep_time:.1f}s"
            )
            time.sleep(sleep_time + random.uniform(1.0, 3.0))

    def _is_client_seeking(self, title: str, text: str, link_flair: Optional[str]) -> bool:
        """
        Heuristic filter to ensure the poster is a buyer/client, NOT another freelancer pitching.
        """
        combined = f"{title} {text}".lower()
        flair = (link_flair or "").lower()

        # Disqualify freelancers selling services
        disqualifiers = ["[for hire]", "for hire", "portfolio", "i will build", "offering my services", "hiring me"]
        if any(d in combined or d in flair for d in disqualifiers):
            return False

        # Positive buying signals
        buyer_signals = [
            "[hiring]",
            "hiring",
            "looking to hire",
            "looking for someone",
            "need a developer",
            "need someone to automate",
            "budget",
            "paying",
            "contract",
            "freelancer needed",
            "can someone build",
            "recommend someone",
        ]
        if any(s in combined or s in flair for s in buyer_signals):
            return True

        # Check keyword intent triggers
        for kw in ENGLISH_INTENT_TRIGGERS + FRENCH_TRIGGERS:
            if kw in combined:
                return True

        return False

    def harvest(
        self,
        subreddits: Optional[List[str]] = None,
        query: Optional[str] = None,
        limit_per_sub: int = 25,
    ) -> List[Dict[str, Any]]:
        """
        Scrapes new posts and intent searches across target subreddits.
        Deduplicates against Redis and inserts new leads into PostgreSQL.
        """
        if not self.reddit:
            logger.warning("Reddit harvester called but PRAW is not configured.")
            return []

        subs_to_scan = subreddits or [s.strip() for s in settings.REDDIT_SUBREDDITS.split(",") if s.strip()]
        found_leads = []

        for sub_name in subs_to_scan:
            try:
                logger.info(f"Scanning r/{sub_name} for active B2B leads...")
                sub = self.reddit.subreddit(sub_name)

                # 1. Fetch new posts
                submissions = list(sub.new(limit=limit_per_sub))

                # 2. If a specific intent query is specified, also search
                if query:
                    search_results = list(sub.search(query, sort="new", time_filter="week", limit=limit_per_sub))
                    submissions.extend(search_results)

                for post in submissions:
                    self._handle_rate_limit()

                    # Deduplication via Redis
                    fingerprint = dedup_manager.compute_fingerprint(
                        source="reddit",
                        external_id=post.id,
                        raw_text=post.title,
                    )

                    if dedup_manager.is_duplicate(fingerprint):
                        continue

                    # Filter for buyer intent
                    flair = getattr(post, "link_flair_text", "")
                    if not self._is_client_seeking(post.title, post.selftext, flair):
                        continue

                    raw_content = f"Title: {post.title}\nFlair: {flair}\nURL: {post.url}\n\n{post.selftext}"
                    lang = detect_language(raw_content)
                    market = "algeria" if sub_name.lower() == "algeria" or lang in ["dar", "ar"] else "global"
                    heuristics = detect_pain_points_and_service(raw_content)

                    author_name = str(post.author) if post.author else "anonymous"

                    country = "Algeria" if market == "algeria" else "USA"
                    lead_dict = {
                        "fingerprint": fingerprint,
                        "source": "reddit",
                        "external_id": post.id,
                        "target_market": market,
                        "country": country,
                        "lead_category": "ACTIVE_REQUEST",
                        "sub_niche": f"r/{sub_name}",
                        "name": author_name,
                        "company_name": None,
                        "contact_email": None,
                        "contact_phone": None,
                        "contact_whatsapp": None,
                        "contact_telegram": None,
                        "contact_reddit": f"/u/{author_name}" if post.author else None,
                        "website_url": post.url,
                        "location_wilaya": "Algeria" if market == "algeria" else "Global",
                        "category_niche": f"r/{sub_name}",
                        "raw_content": raw_content,
                        "detected_language": lang,
                        "identified_pain_points": heuristics["pain_points"],
                        "proposed_service": heuristics["proposed_service"],
                        "status": "new",
                        "synced_to_sheets": False,
                        "metadata": {
                            "reddit_score": post.score,
                            "num_comments": post.num_comments,
                            "permalink": f"https://reddit.com{post.permalink}",
                            "subreddit": sub_name,
                            "created_utc": post.created_utc,
                        },
                    }

                    # Save to DB and Redis
                    saved = self._save_to_db(lead_dict)
                    if saved:
                        dedup_manager.mark_seen(fingerprint, {"source": "reddit", "sub": sub_name})
                        found_leads.append(lead_dict)

                # Randomized politeness pause between subreddits
                time.sleep(random.uniform(1.5, 3.5))

            except (ResponseException, RequestException, ServerError) as api_err:
                logger.error(f"Reddit API network/server error on r/{sub_name}: {api_err}")
                time.sleep(5)
            except Exception as e:
                logger.error(f"Unexpected error harvesting r/{sub_name}: {e}")

        logger.info(f"Completed Reddit harvesting run. Discovered {len(found_leads)} new qualified leads.")
        return found_leads

    def _save_to_db(self, lead: Dict[str, Any]) -> bool:
        """Persists the harvested lead record to PostgreSQL."""
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
                        lead_category, sub_niche, name, raw_content, detected_language,
                        identified_pain_points, proposed_service, status, synced_to_sheets, metadata
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
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
            logger.error(f"Database insert error for Reddit lead {lead['fingerprint']}: {e}")
            return False


# Singleton instance
reddit_harvester = RedditHarvester()
