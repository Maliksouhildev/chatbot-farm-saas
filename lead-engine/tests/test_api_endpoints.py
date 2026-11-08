# =============================================================================
# Unit Tests: FastAPI Gateway & Endpoints
# =============================================================================

import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "harvesters"))

from main import app

client = TestClient(app)


def test_health_check_endpoint():
    """Verifies /health endpoint responds."""
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert "status" in data
    assert "services" in data


def test_campaign_start_endpoint():
    """Verifies POST /campaign/start starts campaign and returns lead data."""
    payload = {
        "prompt": "I am looking for perfume shops all over Algeria",
        "target_leads": 10,
    }
    resp = client.post("/campaign/start", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["total_leads"] >= 10
    assert "google_sheet_url" in data
    assert "campaign_id" in data


def test_whatsapp_incoming_webhook_endpoint():
    """Verifies POST /webhook/whatsapp-incoming processes incoming messages."""
    payload = {
        "event": "messages.upsert",
        "data": {
            "key": {
                "remoteJid": "213555998877@s.whatsapp.net",
                "fromMe": False,
                "id": "MSG_API_001",
            },
            "message": {
                "conversation": "Salam alikoum, chhal le prix du bot ?"
            },
        },
    }
    resp = client.post("/webhook/whatsapp-incoming", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "escalated"
    assert data["action"] == "telegram_alert_dispatched"


def test_transcribe_audio_endpoint():
    """Verifies POST /transcribe/audio handles audio base64."""
    import base64
    fake_audio = base64.b64encode(b"OggS\x00\x02mock_audio").decode("utf-8")
    payload = {
        "audio_base64": fake_audio,
        "filename": "test.ogg",
    }
    resp = client.post("/transcribe/audio", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "text" in data


def test_transcribe_multimodal_endpoint():
    """Verifies POST /transcribe/multimodal handles video/image payload."""
    import base64
    fake_video = base64.b64encode(b"\x00\x00\x00\x18ftypmp42mock").decode("utf-8")
    payload = {
        "media_base64": fake_video,
        "mime_type": "video/mp4",
        "prompt": "Analyze demo footage",
    }
    resp = client.post("/transcribe/multimodal", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "summary" in data


def test_get_escalations_endpoint():
    """Verifies GET /escalations responds with list."""
    resp = client.get("/escalations")
    assert resp.status_code == 200
    data = resp.json()
    assert "escalations" in data
