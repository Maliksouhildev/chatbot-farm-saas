# =============================================================================
# Lead Engine Time-Aware Scheduler & Natural Language Timer Engine
# Interprets natural language scheduling intents (e.g. "deploy at midnight",
# "tomorrow at 10 AM", "in 2 hours", "f lil") and manages delayed campaign execution
# =============================================================================

import os
import re
import json
import logging
import asyncio
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, Tuple, List

logger = logging.getLogger("time_scheduler")
logger.setLevel(logging.INFO)

# Default Business Timezone for Algeria (UTC+1, Africa/Algiers)
ALGIERS_TZ = timezone(timedelta(hours=1))


class TimeScheduler:
    """
    Time-aware engine that parses natural language timing directives,
    calculates exact wall-clock run dates, persists scheduled jobs to disk,
    and executes paced research batches at the exact scheduled moment.
    """

    def __init__(self, data_dir: Optional[str] = None):
        self.data_dir = data_dir or os.path.join(
            os.path.dirname(os.path.abspath(__file__)), "..", "data"
        )
        self.storage_file = os.path.join(self.data_dir, "scheduled_campaigns.json")
        self._ensure_storage()

    def _ensure_storage(self):
        """Ensures the storage directory and JSON registry file exist."""
        try:
            os.makedirs(self.data_dir, exist_ok=True)
            if not os.path.exists(self.storage_file):
                with open(self.storage_file, "w", encoding="utf-8") as f:
                    json.dump([], f)
        except Exception as e:
            logger.warning(f"Failed to initialize scheduled campaigns storage: {e}")

    def get_current_time(self) -> datetime:
        """Returns the current aware datetime in Algiers timezone (UTC+1)."""
        return datetime.now(ALGIERS_TZ)

    def parse_schedule_intent(self, prompt: str) -> Dict[str, Any]:
        """
        Analyzes an incoming prompt for time-scheduling directives.
        Supports English, French, and Algerian Darija expressions.
        
        Returns:
            {
                "is_scheduled": bool,
                "clean_prompt": str,
                "run_at": datetime or None,
                "run_at_iso": str or None,
                "delay_seconds": int,
                "human_readable": str
            }
        """
        now = self.get_current_time()
        lower = prompt.lower().strip()
        matched = False
        target_dt = None
        removed_phrase = ""

        # ---------------------------------------------------------------------
        # 1. Midnight / Minuit / 00:00 / F lil
        # ---------------------------------------------------------------------
        midnight_patterns = [
            r"\b(at\s+midnight|to\s+midnight|for\s+midnight)\b",
            r"\b(à\s+minuit|a\s+minuit|pour\s+minuit|ce\s+soir\s+à\s+minuit)\b",
            r"\b(at\s+00:00|à\s+00h00|a\s+00h|à\s+00:00)\b",
            r"\b(f\s+lil|f\s+el\s+lil|fel\s+lil)\b",
        ]
        for pat in midnight_patterns:
            m = re.search(pat, lower)
            if m:
                matched = True
                removed_phrase = m.group(0)
                # Next midnight: today at 24:00 (i.e. tomorrow 00:00)
                target_dt = now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
                break

        # ---------------------------------------------------------------------
        # 2. Relative delays: "in X hours", "in X minutes", "dans X heures"
        # ---------------------------------------------------------------------
        if not matched:
            rel_hour_match = re.search(
                r"\b(?:in|dans|ba3d|baad)\s+(\d+)\s*(?:hours?|hrs?|heures?|h|swayea|sweya)\b",
                lower,
            )
            if rel_hour_match:
                matched = True
                hours = int(rel_hour_match.group(1))
                removed_phrase = rel_hour_match.group(0)
                target_dt = now + timedelta(hours=hours)

        if not matched:
            rel_min_match = re.search(
                r"\b(?:in|dans|ba3d|baad)\s+(\d+)\s*(?:minutes?|mins?|m|dqayeq|d9aye9)\b",
                lower,
            )
            if rel_min_match:
                matched = True
                minutes = int(rel_min_match.group(1))
                removed_phrase = rel_min_match.group(0)
                target_dt = now + timedelta(minutes=minutes)

        # ---------------------------------------------------------------------
        # 3. "Tomorrow at X", "Demain à X", "Ghodwa f X"
        # ---------------------------------------------------------------------
        if not matched:
            tmrw_match = re.search(
                r"\b(?:tomorrow|demain|ghodwa)\s+(?:at|à|a|f)?\s*(\d{1,2})(?::(\d{2})|h(\d{2})?)?\s*(am|pm)?\b",
                lower,
            )
            if tmrw_match:
                matched = True
                removed_phrase = tmrw_match.group(0)
                hour = int(tmrw_match.group(1))
                minute = int(tmrw_match.group(2) or tmrw_match.group(3) or 0)
                ampm = (tmrw_match.group(4) or "").lower()

                if ampm == "pm" and hour < 12:
                    hour += 12
                elif ampm == "am" and hour == 12:
                    hour = 0

                target_dt = (now + timedelta(days=1)).replace(
                    hour=hour, minute=minute, second=0, microsecond=0
                )

        # ---------------------------------------------------------------------
        # 4. Explicit time today: "at 21:00", "à 20h30", "at 9 PM"
        # ---------------------------------------------------------------------
        if not matched:
            time_match = re.search(
                r"\b(?:at|à|a|pour)\s+(\d{1,2})(?::(\d{2})|h(\d{2})?)?\s*(am|pm)?\b",
                lower,
            )
            if time_match:
                hour = int(time_match.group(1))
                minute = int(time_match.group(2) or time_match.group(3) or 0)
                ampm = (time_match.group(4) or "").lower()

                # Avoid false matches like "at 1000 leads"
                if hour <= 24:
                    if ampm == "pm" and hour < 12:
                        hour += 12
                    elif ampm == "am" and hour == 12:
                        hour = 0

                    candidate = now.replace(
                        hour=hour, minute=minute, second=0, microsecond=0
                    )
                    # If time already passed today, schedule for tomorrow
                    if candidate <= now:
                        candidate += timedelta(days=1)

                    matched = True
                    removed_phrase = time_match.group(0)
                    target_dt = candidate

        # ---------------------------------------------------------------------
        # 5. Clean prompt & format result
        # ---------------------------------------------------------------------
        if matched and target_dt:
            # Strip the timing phrase from the core search idea
            clean = re.sub(re.escape(removed_phrase), "", prompt, flags=re.IGNORECASE).strip()
            # Clean up residual words like "deploy the research", "lance la recherche", "at", etc.
            clean = re.sub(r"^(deploy|start|lance|lancer|programme|plan)\s+(the\s+)?(research\s+for|search\s+for|la\s+recherche\s+pour)?", "", clean, flags=re.IGNORECASE).strip()
            if not clean:
                clean = prompt

            diff = target_dt - now
            total_seconds = max(1, int(diff.total_seconds()))
            hours_rem = total_seconds // 3600
            mins_rem = (total_seconds % 3600) // 60

            time_str = target_dt.strftime("%H:%M")
            date_str = target_dt.strftime("%d/%m/%Y")
            human_readable = (
                f"Déploiement programmé pour le {date_str} à {time_str} "
                f"(dans {hours_rem}h {mins_rem}m - heure d'Algérie UTC+1)"
            )

            return {
                "is_scheduled": True,
                "clean_prompt": clean,
                "run_at": target_dt,
                "run_at_iso": target_dt.isoformat(),
                "delay_seconds": total_seconds,
                "human_readable": human_readable,
            }

        return {
            "is_scheduled": False,
            "clean_prompt": prompt,
            "run_at": None,
            "run_at_iso": None,
            "delay_seconds": 0,
            "human_readable": "Exécution immédiate",
        }

    # =========================================================================
    # PERSISTENT TASK REGISTRY
    # =========================================================================

    def register_scheduled_campaign(
        self,
        campaign_id: str,
        clean_prompt: str,
        run_at: datetime,
        channel: str,
        recipient: str,
        target_leads: int = 1000,
    ) -> Dict[str, Any]:
        """Saves a scheduled task to local JSON registry."""
        task = {
            "id": campaign_id,
            "prompt": clean_prompt,
            "channel": channel,
            "recipient": recipient,
            "target_leads": target_leads,
            "run_at": run_at.isoformat(),
            "created_at": self.get_current_time().isoformat(),
            "status": "scheduled",
        }

        try:
            tasks = self.list_scheduled_campaigns()
            tasks.append(task)
            with open(self.storage_file, "w", encoding="utf-8") as f:
                json.dump(tasks, f, indent=2, ensure_ascii=False)
            logger.info(f"Registered scheduled campaign {campaign_id} for {run_at.isoformat()}")
        except Exception as e:
            logger.error(f"Error persisting scheduled campaign: {e}")

        return task

    def list_scheduled_campaigns(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Lists all registered scheduled campaigns."""
        if not os.path.exists(self.storage_file):
            return []
        try:
            with open(self.storage_file, "r", encoding="utf-8") as f:
                tasks = json.load(f)
            if status:
                return [t for t in tasks if t.get("status") == status]
            return tasks
        except Exception as e:
            logger.warning(f"Error reading scheduled campaigns: {e}")
            return []

    def mark_task_completed(self, campaign_id: str, result_summary: Optional[str] = None):
        """Marks a scheduled task as completed."""
        try:
            tasks = self.list_scheduled_campaigns()
            for t in tasks:
                if t.get("id") == campaign_id:
                    t["status"] = "completed"
                    t["completed_at"] = self.get_current_time().isoformat()
                    if result_summary:
                        t["result_summary"] = result_summary
            with open(self.storage_file, "w", encoding="utf-8") as f:
                json.dump(tasks, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error updating task status: {e}")

    def cancel_scheduled_campaign(self, campaign_id: str) -> bool:
        """Cancels a scheduled campaign."""
        try:
            tasks = self.list_scheduled_campaigns()
            found = False
            for t in tasks:
                if t.get("id") == campaign_id and t.get("status") == "scheduled":
                    t["status"] = "cancelled"
                    found = True
            if found:
                with open(self.storage_file, "w", encoding="utf-8") as f:
                    json.dump(tasks, f, indent=2, ensure_ascii=False)
            return found
        except Exception as e:
            logger.error(f"Error cancelling task: {e}")
            return False


time_scheduler = TimeScheduler()
