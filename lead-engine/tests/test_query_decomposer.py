# =============================================================================
# Unit Tests: 58-Wilaya Geographical Query Decomposer
# =============================================================================

import os
import sys
import asyncio
import pytest

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "harvesters"))

from query_decomposer import query_decomposer, ALGERIAN_58_WILAYAS


def test_58_wilayas_registry_completeness():
    """Verifies that the Algerian Wilaya dataset has exactly 58 wilayas with valid codes and names."""
    assert len(ALGERIAN_58_WILAYAS) == 58

    wilaya_codes = [w["code"] for w in ALGERIAN_58_WILAYAS]
    assert "01" in wilaya_codes  # Adrar
    assert "16" in wilaya_codes  # Alger
    assert "31" in wilaya_codes  # Oran
    assert "25" in wilaya_codes  # Constantine
    assert "19" in wilaya_codes  # Sétif
    assert "58" in wilaya_codes  # In Guezzam

    for w in ALGERIAN_58_WILAYAS:
        assert len(w["name"]) > 0
        assert len(w["ar"]) > 0
        assert w["tier"] in [1, 2, 3]


def test_decompose_perfume_idea():
    """Verifies decomposing 'I am looking for perfume shops all over Algeria'."""
    prompt = "I am looking for perfume shops all over Algeria"
    plan = asyncio.run(query_decomposer.decompose_idea(prompt, target_leads=1000))

    assert plan is not None
    assert plan["niche_slug"] == "PERF"
    assert "PERF" in plan["campaign_id"]
    assert "maps_queries" in plan
    assert len(plan["maps_queries"]) >= 58

    dorks = plan["social_dorks"]
    assert len(dorks) >= 4
    assert any("58 wilayas" in d.lower() for d in dorks)
    assert any("prix en privé" in d.lower() or "prix en mp" in d.lower() for d in dorks)

    assert "ouedkniss_queries" in plan
    assert len(plan["ouedkniss_queries"]) > 0
    assert "telegram_keywords" in plan
    assert len(plan["telegram_keywords"]) > 0


def test_decompose_dental_clinics_niche():
    """Verifies decomposition of healthcare/dental clinics idea."""
    prompt = "trouve-moi des cabinets dentaires et cliniques médicales à Alger et Oran"
    plan = asyncio.run(query_decomposer.decompose_idea(prompt, target_leads=500))

    assert plan is not None
    assert plan["niche_slug"] == "DENT"
    assert len(plan["maps_queries"]) >= 58


def test_decompose_empty_or_generic_input():
    """Verifies that an unusual or brief input falls back safely without error."""
    plan = asyncio.run(query_decomposer.decompose_idea("something", target_leads=100))
    assert plan is not None
    assert "campaign_id" in plan
    assert len(plan["maps_queries"]) >= 58
