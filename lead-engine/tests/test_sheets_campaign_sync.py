# =============================================================================
# Unit Tests: Google Sheets Campaign Sync & Top-Score Sort
# =============================================================================

import os
import sys
import csv
import json
import pytest

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "harvesters"))

from sheets_campaign_sync import sheets_campaign_sync, CAMPAIGN_HEADERS


def test_sync_campaign_leads_sorting_and_export():
    """Verifies that leads are sorted by ai_fit_score descending and exported to CSV."""
    test_leads = [
        {
            "client_id": "DZ-PERF-001",
            "name": "Boutique Low Score",
            "company_name": "Boutique Low Score",
            "location_wilaya": "Adrar (01), Algérie",
            "contact_phone": "+213555000001",
            "ai_fit_score": 4,
            "detected_bottleneck": "No website",
            "ai_pitch_draft": "Pitch draft 1",
            "status": "new",
        },
        {
            "client_id": "DZ-PERF-002",
            "name": "Parfumerie El Bahia Top",
            "company_name": "Parfumerie El Bahia Top",
            "location_wilaya": "Oran (31), Algérie",
            "contact_phone": "+213555000002",
            "ai_fit_score": 9,
            "detected_bottleneck": "Prix en privé & Yalidine delivery",
            "ai_pitch_draft": "Salam khouya! Chefna la boutique ta3kom...",
            "status": "hitl_pending",
        },
        {
            "client_id": "DZ-PERF-003",
            "name": "Élixir Alger Middle",
            "company_name": "Élixir Alger Middle",
            "location_wilaya": "Alger (16), Algérie",
            "contact_phone": "+213555000003",
            "ai_fit_score": 7,
            "detected_bottleneck": "Manual orders",
            "ai_pitch_draft": "Pitch draft 3",
            "status": "hitl_pending",
        },
    ]

    result = sheets_campaign_sync.sync_campaign_leads(
        campaign_id="DZ-PERF-TEST",
        campaign_name="Perfume Shops Algeria Test",
        leads=test_leads,
    )

    assert result["status"] == "success"
    assert result["total_leads"] == 3
    assert result["top_scoring_leads"] == 2  # score 9 and score 7 >= 7
    assert os.path.exists(result["local_csv_path"])

    # Read the exported CSV to verify sort order (top score first)
    with open(result["local_csv_path"], "r", encoding="utf-8-sig") as f:
        reader = list(csv.reader(f))
        headers = reader[0]
        row1 = reader[1]
        row2 = reader[2]
        row3 = reader[3]

    assert headers == CAMPAIGN_HEADERS
    # First data row must be the highest score (DZ-PERF-002 with score 9)
    assert row1[0] == "DZ-PERF-002"
    assert int(row1[7]) == 9
    # Second row must be score 7
    assert row2[0] == "DZ-PERF-003"
    assert int(row2[7]) == 7
    # Third row must be score 4
    assert row3[0] == "DZ-PERF-001"
    assert int(row3[7]) == 4


def test_wa_me_link_generation_in_sheets():
    """Verifies that 1-click wa.me links are correctly populated in sheet export."""
    lead = {
        "client_id": "DZ-PERF-010",
        "company_name": "Parfums d'Orient",
        "contact_phone": "+213661123456",
        "ai_fit_score": 8,
        "ai_pitch_draft": "Salam khouya demo wajda",
    }
    result = sheets_campaign_sync.sync_campaign_leads(
        campaign_id="DZ-PERF-TEST-WA",
        campaign_name="Test WA Link",
        leads=[lead],
    )
    with open(result["local_csv_path"], "r", encoding="utf-8-sig") as f:
        reader = list(csv.reader(f))
        data_row = reader[1]
        wa_link = data_row[4]
        assert "wa.me/213661123456" in wa_link
