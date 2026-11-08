# =============================================================================
# Unit Tests: WhatsApp Conversational Agent & Escalation Relay
# =============================================================================

import os
import sys
import asyncio
import pytest

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "harvesters"))

from whatsapp_conversation_agent import (
    whatsapp_conversation_agent,
    AGENCY_RAG,
    ESCALATION_KEYWORDS,
)


def test_agency_rag_profile_loaded():
    """Verifies that config/agency_profile.json is properly parsed and accessible."""
    assert AGENCY_RAG is not None
    assert "agency" in AGENCY_RAG
    assert AGENCY_RAG["agency"]["founder"] == "Malik Souhil"
    assert "https://github.com/Maliksouhildev" in AGENCY_RAG["agency"]["github_url"]
    assert "services" in AGENCY_RAG
    assert "whatsapp_bot" in AGENCY_RAG["services"]
    assert "portfolio" in AGENCY_RAG
    assert len(AGENCY_RAG["portfolio"]) >= 3


def test_escalation_intent_detection():
    """Verifies that high-intent client questions trigger the escalation classifier."""
    high_intent_samples = [
        "Salam khouya, chhal le prix ta3 le bot WhatsApp ?",
        "Est-ce que kayen demo vidéo nchoufha ?",
        "Warili un exemple ou un aperçu pour ma boutique de parfum",
        "Combien coûte la mise en place avec Yalidine ?",
        "Je voudrais un devis et un appel téléphonique",
    ]
    for s in high_intent_samples:
        assert whatsapp_conversation_agent._is_high_intent_escalation(s) is True, f"Failed for: {s}"

    routine_samples = [
        "Salam",
        "Bonjour",
        "Sbah el khir",
        "Marhba",
    ]
    for s in routine_samples:
        assert whatsapp_conversation_agent._is_high_intent_escalation(s) is False, f"Failed for: {s}"


def test_routine_reply_darija_and_french():
    """Verifies autonomous responses for basic greetings in Darija and French."""
    dar_reply = whatsapp_conversation_agent._generate_routine_reply("Salam khouya", lead=None)
    assert len(dar_reply) > 20
    assert "salam" in dar_reply.lower() or "marhba" in dar_reply.lower() or "whatsapp" in dar_reply.lower()

    fr_reply = whatsapp_conversation_agent._generate_routine_reply("Bonjour, comment vous fonctionnez ?", lead=None)
    assert len(fr_reply) > 20
    assert "bonjour" in fr_reply.lower() or "merci" in fr_reply.lower()


def test_incoming_webhook_escalation_flow():
    """Simulates an incoming webhook where a client asks for a demo preview."""
    simulated_payload = {
        "event": "messages.upsert",
        "data": {
            "key": {
                "remoteJid": "213555123456@s.whatsapp.net",
                "fromMe": False,
                "id": "MSG_991827",
            },
            "message": {
                "conversation": "Salam khouya, est-ce que kayen demo vidéo nchouf kifach yemchi m3a Yalidine ?"
            },
        },
    }

    result = asyncio.run(whatsapp_conversation_agent.handle_incoming_webhook(simulated_payload))
    assert result["status"] == "escalated"
    assert result["action"] == "telegram_alert_dispatched"
    assert "213555123456" in result["phone"]


def test_incoming_webhook_routine_flow():
    """Simulates an incoming webhook where a client sends a standard greeting."""
    simulated_payload = {
        "event": "messages.upsert",
        "data": {
            "key": {
                "remoteJid": "213661998877@s.whatsapp.net",
                "fromMe": False,
                "id": "MSG_112233",
            },
            "message": {
                "conversation": "Salam alikoum"
            },
        },
    }

    result = asyncio.run(whatsapp_conversation_agent.handle_incoming_webhook(simulated_payload))
    assert result["status"] == "answered"
    assert len(result["reply"]) > 10
