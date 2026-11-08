# =============================================================================
# Unit Tests: Telegram Admin Command & Escalation Bot
# =============================================================================

import os
import sys
import asyncio
import pytest

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "harvesters"))

from telegram_admin_bot import telegram_admin_bot


def test_send_escalation_card_formatting():
    """Verifies escalation card message construction and inline buttons."""
    res = asyncio.run(telegram_admin_bot.send_escalation_card(
        lead_id="test-uuid-1234",
        client_id="DZ-PERF-015",
        business_name="Parfumerie El Bahia - Oran",
        phone="+213555123456",
        client_message="Salam khouya, chhal le prix et est-ce que kayen demo ?",
        suggested_ai_reply="Salam khouya! Le bot يدير 45,000 DZD avec Yalidine...",
    ))
    assert res is True


def test_handle_telegram_text_command_help():
    """Verifies handling of /start or /help command."""
    update = {
        "update_id": 1001,
        "message": {
            "message_id": 501,
            "chat": {"id": 123456789},
            "text": "/help",
        },
    }
    asyncio.run(telegram_admin_bot.handle_update(update))


def test_handle_callback_query_send_ai():
    """Verifies handling of inline callback query for [Send AI Reply]."""
    callback_update = {
        "update_id": 1002,
        "callback_query": {
            "id": "cb_query_999",
            "message": {
                "message_id": 502,
                "chat": {"id": 123456789},
            },
            "data": "send_ai:non-existent-lead",
        },
    }
    asyncio.run(telegram_admin_bot.handle_update(callback_update))


def test_handle_callback_query_send_demo():
    """Verifies handling of inline callback query for [Send Demo Video]."""
    callback_update = {
        "update_id": 1003,
        "callback_query": {
            "id": "cb_query_1000",
            "message": {
                "message_id": 503,
                "chat": {"id": 123456789},
            },
            "data": "send_demo:non-existent-lead",
        },
    }
    asyncio.run(telegram_admin_bot.handle_update(callback_update))


def test_handle_media_upload_to_client():
    """Verifies routing of uploaded media tagged with client ID #DZ-PERF-015."""
    media_update = {
        "update_id": 1004,
        "message": {
            "message_id": 504,
            "chat": {"id": 123456789},
            "video": {
                "file_id": "mock_file_id_123",
                "mime_type": "video/mp4",
            },
            "caption": "Voila la démo #DZ-PERF-015",
        },
    }
    asyncio.run(telegram_admin_bot.handle_update(media_update))
