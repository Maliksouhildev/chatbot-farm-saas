# =============================================================================
# Lead Engine Redis Deduplication & Rate Limiting Engine
# Enforces SHA-256 fingerprinting, 30-day deduplication, and sliding-window rate limits
# =============================================================================

import hashlib
import json
import logging
import time
from typing import Optional, Dict, Any

try:
    import redis
    HAS_REDIS = True
except ImportError:
    HAS_REDIS = False
    redis = None

from config import settings

logger = logging.getLogger("redis_dedup")
logger.setLevel(logging.INFO)


class RedisDedupManager:
    def __init__(self):
        self._client: Optional[Any] = None
        self._fallback_memory_set = set()

    @property
    def client(self) -> Optional[Any]:
        if not HAS_REDIS:
            return None
        if self._client is None:
            try:
                self._client = redis.Redis(
                    host=settings.REDIS_HOST,
                    port=settings.REDIS_PORT,
                    password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
                    db=settings.REDIS_DB,
                    decode_responses=True,
                    socket_connect_timeout=3,
                    socket_timeout=3,
                )
            except Exception as e:
                logger.error(f"Failed to connect to Redis: {e}")
                self._client = None
        return self._client

    def ping(self) -> bool:
        """Check if Redis is alive"""
        try:
            if not self.client:
                return False
            return bool(self.client.ping())
        except Exception as e:
            logger.warning(f"Redis ping failed: {e}")
            return False
        except Exception as e:
            logger.warning(f"Redis ping failed: {e}")
            return False

    @staticmethod
    def compute_fingerprint(
        source: str,
        external_id: Optional[str] = None,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        raw_text: Optional[str] = None,
    ) -> str:
        """
        Generates a deterministic SHA-256 hash across primary identity vectors.
        Prioritizes unique contact vectors (phone/email), falls back to source+external_id or text.
        """
        parts = [source.lower().strip()]
        if phone:
            parts.append(f"phone:{phone.strip()}")
        elif email:
            parts.append(f"email:{email.lower().strip()}")
        elif external_id:
            parts.append(f"id:{external_id.strip()}")
        elif raw_text:
            # Hash text snippet to avoid hash collision on small variations
            clean_text = "".join(raw_text.split()[:20]).lower()
            parts.append(f"text:{clean_text}")
        else:
            parts.append(f"ts:{time.time()}")

        combined = "|".join(parts)
        return hashlib.sha256(combined.encode("utf-8")).hexdigest()

    def is_duplicate(self, fingerprint: str) -> bool:
        """
        Returns True if the fingerprint has been seen in Redis within the TTL window.
        """
        if not self.client:
            return fingerprint in self._fallback_memory_set
        try:
            key = f"lead:seen:{fingerprint}"
            return bool(self.client.exists(key))
        except Exception as e:
            logger.error(f"Redis error during is_duplicate check: {e}")
            return fingerprint in self._fallback_memory_set

    def mark_seen(
        self,
        fingerprint: str,
        metadata: Optional[Dict[str, Any]] = None,
        ttl_days: Optional[int] = None,
    ) -> bool:
        """
        Marks a fingerprint as seen and stores summary metadata with TTL.
        """
        if not self.client:
            self._fallback_memory_set.add(fingerprint)
            return True
        try:
            days = ttl_days or settings.REDIS_DEDUP_TTL_DAYS
            ttl_seconds = days * 86400
            key = f"lead:seen:{fingerprint}"
            payload = json.dumps(metadata or {"seen_at": int(time.time())})
            self.client.setex(key, ttl_seconds, payload)
            return True
        except Exception as e:
            logger.error(f"Redis error during mark_seen: {e}")
            self._fallback_memory_set.add(fingerprint)
            return True

    def is_debounced(self, recipient: str, channel: str) -> bool:
        """
        Checks if a recipient was contacted via channel within the debounce window.
        """
        try:
            clean_recipient = recipient.strip().lower()
            key = f"debounce:{channel}:{clean_recipient}"
            return bool(self.client.exists(key))
        except Exception as e:
            logger.error(f"Redis error during is_debounced check: {e}")
            return False

    def set_debounce(
        self, recipient: str, channel: str, cooldown_days: int = 14
    ) -> bool:
        """
        Sets a debounce cooldown window on a recipient for a specific channel.
        """
        try:
            clean_recipient = recipient.strip().lower()
            key = f"debounce:{channel}:{clean_recipient}"
            ttl_seconds = cooldown_days * 86400
            self.client.setex(key, ttl_seconds, str(int(time.time())))
            return True
        except Exception as e:
            logger.error(f"Redis error during set_debounce: {e}")
            return False

    def check_rate_limit(
        self, key: str, max_calls: int, window_seconds: int
    ) -> bool:
        """
        Sliding-window rate limiter. Returns True if request is ALLOWED, False if throttled.
        """
        try:
            now = time.time()
            pipe = self.client.pipeline()
            r_key = f"ratelimit:{key}"

            # Remove entries older than the current window
            pipe.zremrangebyscore(r_key, 0, now - window_seconds)
            # Count elements in window
            pipe.zcard(r_key)
            # Add current timestamp
            pipe.zadd(r_key, {str(now): now})
            # Set TTL on key
            pipe.expire(r_key, window_seconds + 5)
            results = pipe.execute()

            call_count = results[1]
            return call_count < max_calls
        except Exception as e:
            logger.error(f"Redis error during rate_limit check: {e}")
            return True  # Fail open to prevent complete deadlock if Redis hiccups


# Global Singleton instance
dedup_manager = RedisDedupManager()
