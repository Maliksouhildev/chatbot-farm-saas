# =============================================================================
# Lead Engine Pytest Configuration & Global Test Isolation
# Enforces complete mock of outbound WhatsApp / Telegram dispatches during testing
# ZERO live messages can leave the host during test executions
# =============================================================================

import os
import sys
import pytest
from unittest.mock import AsyncMock, patch

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "harvesters"))

from config import settings


@pytest.fixture(autouse=True)
def isolate_outbound_messaging(monkeypatch):
    """
    Globally isolates all outbound WhatsApp and external messaging.
    Guarantees that test payloads never reach live phones or Evolution API instances.
    """
    # Force safety lock on
    monkeypatch.setattr(settings, "ENABLE_EXTERNAL_OUTREACH", False)

    # In-memory mock for WhatsApp agent dispatcher
    async def mock_send_wa(phone, message, delay_ms=0):
        return True

    # In-memory mock for Telegram agent WhatsApp relay
    async def mock_dispatch_wa(lead, text):
        return True

    async def mock_dispatch_wa_media(lead, media_bytes, mime_type="video/mp4", caption="", filename="demo.mp4"):
        return True

    monkeypatch.setattr("whatsapp_conversation_agent.whatsapp_conversation_agent.send_whatsapp_message", mock_send_wa)
    monkeypatch.setattr("telegram_admin_bot.telegram_admin_bot._dispatch_whatsapp", mock_dispatch_wa)
    monkeypatch.setattr("telegram_admin_bot.telegram_admin_bot._dispatch_whatsapp_media", mock_dispatch_wa_media)
    monkeypatch.setattr("telegram_admin_bot.telegram_admin_bot.send_message", AsyncMock(return_value=True))

    yield
