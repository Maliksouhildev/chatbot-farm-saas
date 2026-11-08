# =============================================================================
# Unit & Integration Tests: TimeScheduler Engine & Bot Scheduling
# =============================================================================

import os
import sys
import pytest
import asyncio
from datetime import datetime, timedelta, timezone

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "harvesters"))

from time_scheduler import TimeScheduler, ALGIERS_TZ
from whatsapp_conversation_agent import whatsapp_conversation_agent
from telegram_admin_bot import telegram_admin_bot


@pytest.fixture
def scheduler(tmp_path):
    """Provides a TimeScheduler instance with an isolated temporary storage directory."""
    return TimeScheduler(data_dir=str(tmp_path))


def test_parse_midnight_intent_english(scheduler):
    """Verifies 'at midnight' scheduling in English."""
    res = scheduler.parse_schedule_intent("Deploy the research at midnight for perfume shops")
    assert res["is_scheduled"] is True
    assert res["run_at"].hour == 0
    assert res["run_at"].minute == 0
    assert "perfume shops" in res["clean_prompt"]
    assert res["delay_seconds"] > 0


def test_parse_midnight_intent_french(scheduler):
    """Verifies 'à minuit' scheduling in French."""
    res = scheduler.parse_schedule_intent("Lance la recherche à minuit pour les cliniques privées")
    assert res["is_scheduled"] is True
    assert res["run_at"].hour == 0
    assert res["delay_seconds"] > 0


def test_parse_midnight_intent_darija(scheduler):
    """Verifies 'f lil' (Algerian Darija Arabizi) scheduling."""
    res = scheduler.parse_schedule_intent("choufli les boutiques de parfum f lil")
    assert res["is_scheduled"] is True
    assert res["run_at"].hour == 0
    assert res["delay_seconds"] > 0


def test_parse_relative_delay_hours(scheduler):
    """Verifies relative hour parsing ('in 2 hours', 'dans 3 heures')."""
    res = scheduler.parse_schedule_intent("Start search for real estate in 2 hours")
    assert res["is_scheduled"] is True
    assert 7100 <= res["delay_seconds"] <= 7300
    assert "real estate" in res["clean_prompt"]


def test_parse_relative_delay_minutes(scheduler):
    """Verifies relative minute parsing ('in 30 mins', 'dans 15 minutes')."""
    res = scheduler.parse_schedule_intent("trouve moi des grossistes dans 30 minutes")
    assert res["is_scheduled"] is True
    assert 1700 <= res["delay_seconds"] <= 1850


def test_parse_tomorrow_specific_hour(scheduler):
    """Verifies 'tomorrow at 10 AM' scheduling."""
    res = scheduler.parse_schedule_intent("Deploy research tomorrow at 10 AM for wedding halls")
    assert res["is_scheduled"] is True
    assert res["run_at"].hour == 10
    assert res["run_at"].minute == 0
    assert "wedding halls" in res["clean_prompt"]


def test_parse_immediate_non_scheduled(scheduler):
    """Verifies that queries without timing directives execute immediately."""
    res = scheduler.parse_schedule_intent("Je cherche des parfumeries en Algérie")
    assert res["is_scheduled"] is False
    assert res["run_at"] is None
    assert res["delay_seconds"] == 0
    assert "Je cherche" in res["clean_prompt"]


def test_scheduled_task_lifecycle(scheduler):
    """Verifies task registration, listing, cancellation, and completion in registry."""
    run_dt = scheduler.get_current_time() + timedelta(hours=3)
    task = scheduler.register_scheduled_campaign(
        campaign_id="TEST_SCHED_001",
        clean_prompt="Magasins de sport",
        run_at=run_dt,
        channel="whatsapp",
        recipient="+213551671229",
        target_leads=50,
    )
    assert task["id"] == "TEST_SCHED_001"
    assert task["status"] == "scheduled"

    # List tasks
    all_tasks = scheduler.list_scheduled_campaigns(status="scheduled")
    assert any(t["id"] == "TEST_SCHED_001" for t in all_tasks)

    # Complete task
    scheduler.mark_task_completed("TEST_SCHED_001", result_summary="Found 50 leads")
    completed = scheduler.list_scheduled_campaigns(status="completed")
    assert any(t["id"] == "TEST_SCHED_001" for t in completed)

    # Register and cancel another
    scheduler.register_scheduled_campaign(
        campaign_id="TEST_SCHED_002",
        clean_prompt="Cliniques",
        run_at=run_dt,
        channel="telegram",
        recipient="12345678",
    )
    cancelled = scheduler.cancel_scheduled_campaign("TEST_SCHED_002")
    assert cancelled is True
    active_now = scheduler.list_scheduled_campaigns(status="scheduled")
    assert not any(t["id"] == "TEST_SCHED_002" for t in active_now)


def test_whatsapp_admin_scheduled_campaign_handling():
    """Verifies that an admin message with scheduling intent registers a timer on WhatsApp."""
    from config import settings
    settings.ADMIN_WHATSAPP_PHONE = "+213551671229"

    payload = {
        "event": "messages.upsert",
        "data": {
            "key": {
                "remoteJid": "213551671229@s.whatsapp.net",
                "fromMe": False,
                "id": "MSG_ADMIN_SCHED_01",
            },
            "message": {
                "conversation": "Deploy research at midnight for perfume shops all over Algeria"
            },
        },
    }

    result = asyncio.run(whatsapp_conversation_agent.handle_incoming_webhook(payload))
    assert result["status"] == "campaign_scheduled"
    assert "SCHED_" in result["campaign_id"]
    assert result["delay_seconds"] > 0


def test_whatsapp_admin_timers_command():
    """Verifies that /timers command on WhatsApp returns the list of pending tasks."""
    from config import settings
    settings.ADMIN_WHATSAPP_PHONE = "+213551671229"

    payload = {
        "event": "messages.upsert",
        "data": {
            "key": {
                "remoteJid": "213551671229@s.whatsapp.net",
                "fromMe": False,
                "id": "MSG_ADMIN_TIMERS_01",
            },
            "message": {
                "conversation": "/timers"
            },
        },
    }

    result = asyncio.run(whatsapp_conversation_agent.handle_incoming_webhook(payload))
    assert result["status"] == "admin_timers_sent"
    assert "count" in result


def test_telegram_admin_timers_command():
    """Verifies that /timers command on Telegram runs without error."""
    update = {
        "update_id": 9991,
        "message": {
            "message_id": 101,
            "chat": {"id": 123456789},
            "text": "/timers",
        },
    }
    # Should execute without throwing exceptions
    asyncio.run(telegram_admin_bot.handle_update(update))


def test_telegram_admin_scheduling_update():
    """Verifies that a Telegram message with scheduling intent triggers scheduled campaign card."""
    update = {
        "update_id": 9992,
        "message": {
            "message_id": 102,
            "chat": {"id": 123456789},
            "text": "Start research at midnight for wedding venues in Algeria",
        },
    }
    asyncio.run(telegram_admin_bot.handle_update(update))
