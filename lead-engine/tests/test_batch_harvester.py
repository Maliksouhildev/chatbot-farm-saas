# =============================================================================
# Unit & Integration Tests: 58-Wilaya Batch Harvester
# =============================================================================

import os
import sys
import asyncio
import pytest

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "harvesters"))

from batch_harvester import batch_harvester


def test_batch_harvester_execution():
    """
    Executes a test batch campaign for 'I am looking for perfume shops all over Algeria'.
    Verifies sequential Client ID generation (DZ-PERF-001...), E.164 phone normalization,
    AI qualification scores, and Google Sheets CSV creation.
    """
    prompt = "I am looking for perfume shops all over Algeria"
    result = asyncio.run(batch_harvester.execute_campaign(
        idea_prompt=prompt,
        target_leads=20,
    ))

    assert result is not None
    assert result["status"] == "success"
    assert result["total_leads"] >= 20
    assert "PERF" in result["campaign_id"]
    assert "top_leads" in result
    assert len(result["top_leads"]) > 0

    top_lead = result["top_leads"][0]
    assert top_lead["client_id"].startswith("DZ-PERF-")
    assert top_lead["contact_phone"].startswith("+213")
    assert top_lead["ai_fit_score"] >= 1
    assert len(top_lead["ai_pitch_draft"]) > 10
    assert "location_wilaya" in top_lead

    assert os.path.exists(result["local_csv_path"])


def test_synthetic_58_wilaya_directory_leads():
    """Verifies that synthetic directory leads cover wilayas and valid Algerian operator prefixes."""
    plan = {
        "niche_slug": "PERF",
        "niche_name": "Parfumerie & Cosmétique",
    }
    leads = batch_harvester._generate_58_wilaya_leads(plan, count=50)

    assert len(leads) == 50
    for lead in leads:
        assert lead["contact_phone"].startswith("+213")
        assert any(lead["contact_phone"].startswith(f"+213{op}") for op in ["5", "6", "7"])
        assert "location_wilaya" in lead
        assert "Algérie" in lead["location_wilaya"]
