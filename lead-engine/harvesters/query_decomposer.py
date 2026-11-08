# =============================================================================
# Lead Engine 58-Wilaya Geographical Query Decomposer
# Decomposes broad business ideas (e.g. "perfume shops in Algeria") into
# a 58-wilaya geographic grid + social dorks + marketplace terms targeting ~1,000 leads
# =============================================================================

import os
import re
import json
import logging
from typing import Dict, Any, List, Optional
import httpx

from config import settings

logger = logging.getLogger("query_decomposer")
logger.setLevel(logging.INFO)

# Comprehensive 58-Wilaya Registry of Algeria (Wilaya Code, Latin Name, Arabic Name)
ALGERIAN_58_WILAYAS = [
    {"code": "01", "name": "Adrar", "ar": "أدرار", "tier": 3},
    {"code": "02", "name": "Chlef", "ar": "الشلف", "tier": 2},
    {"code": "03", "name": "Laghouat", "ar": "الأغواط", "tier": 3},
    {"code": "04", "name": "Oum El Bouaghi", "ar": "أم البواقي", "tier": 3},
    {"code": "05", "name": "Batna", "ar": "باتنة", "tier": 2},
    {"code": "06", "name": "Béjaïa", "ar": "بجاية", "tier": 2},
    {"code": "07", "name": "Biskra", "ar": "بسكرة", "tier": 2},
    {"code": "08", "name": "Béchar", "ar": "بشار", "tier": 3},
    {"code": "09", "name": "Blida", "ar": "البليدة", "tier": 1},
    {"code": "10", "name": "Bouira", "ar": "البويرة", "tier": 2},
    {"code": "11", "name": "Tamanrasset", "ar": "تمنراست", "tier": 3},
    {"code": "12", "name": "Tébessa", "ar": "تبسة", "tier": 3},
    {"code": "13", "name": "Tlemcen", "ar": "تلمسان", "tier": 2},
    {"code": "14", "name": "Tiaret", "ar": "تيارت", "tier": 3},
    {"code": "15", "name": "Tizi Ouzou", "ar": "تيزي وزو", "tier": 2},
    {"code": "16", "name": "Alger", "ar": "الجزائر", "tier": 1},
    {"code": "17", "name": "Djelfa", "ar": "الجلفة", "tier": 3},
    {"code": "18", "name": "Jijel", "ar": "جيجل", "tier": 2},
    {"code": "19", "name": "Sétif", "ar": "سطيف", "tier": 1},
    {"code": "20", "name": "Saïda", "ar": "سعيدة", "tier": 3},
    {"code": "21", "name": "Skikda", "ar": "سكيكدة", "tier": 2},
    {"code": "22", "name": "Sidi Bel Abbès", "ar": "سيدي بلعباس", "tier": 2},
    {"code": "23", "name": "Annaba", "ar": "عنابة", "tier": 1},
    {"code": "24", "name": "Guelma", "ar": "قالمة", "tier": 3},
    {"code": "25", "name": "Constantine", "ar": "قسنطينة", "tier": 1},
    {"code": "26", "name": "Médéa", "ar": "المدية", "tier": 2},
    {"code": "27", "name": "Mostaganem", "ar": "مستغانم", "tier": 2},
    {"code": "28", "name": "M'Sila", "ar": "المسيلة", "tier": 3},
    {"code": "29", "name": "Mascara", "ar": "معسكر", "tier": 3},
    {"code": "30", "name": "Ouargla", "ar": "ورقلة", "tier": 2},
    {"code": "31", "name": "Oran", "ar": "وهران", "tier": 1},
    {"code": "32", "name": "El Bayadh", "ar": "البيض", "tier": 3},
    {"code": "33", "name": "Illizi", "ar": "إليزي", "tier": 3},
    {"code": "34", "name": "Bordj Bou Arréridj", "ar": "برج بوعريريج", "tier": 2},
    {"code": "35", "name": "Boumerdès", "ar": "بومرداس", "tier": 2},
    {"code": "36", "name": "El Tarf", "ar": "الطارف", "tier": 3},
    {"code": "37", "name": "Tindouf", "ar": "تندوف", "tier": 3},
    {"code": "38", "name": "Tissemsilt", "ar": "تيسمسيلت", "tier": 3},
    {"code": "39", "name": "El Oued", "ar": "الوادي", "tier": 2},
    {"code": "40", "name": "Khenchela", "ar": "خنشلة", "tier": 3},
    {"code": "41", "name": "Souk Ahras", "ar": "سوق أهراس", "tier": 3},
    {"code": "42", "name": "Tipaza", "ar": "تيبازة", "tier": 2},
    {"code": "43", "name": "Mila", "ar": "ميلة", "tier": 3},
    {"code": "44", "name": "Aïn Defla", "ar": "عين الدفلى", "tier": 3},
    {"code": "45", "name": "Naâma", "ar": "النعامة", "tier": 3},
    {"code": "46", "name": "Aïn Témouchent", "ar": "عين تموشنت", "tier": 3},
    {"code": "47", "name": "Ghardaïa", "ar": "غرداية", "tier": 2},
    {"code": "48", "name": "Relizane", "ar": "غليزان", "tier": 3},
    {"code": "49", "name": "El M'Ghair", "ar": "المغير", "tier": 3},
    {"code": "50", "name": "El Meniaa", "ar": "المنيعة", "tier": 3},
    {"code": "51", "name": "Ouled Djellal", "ar": "أولاد جلال", "tier": 3},
    {"code": "52", "name": "Bordj Baji Mokhtar", "ar": "برج باجي مختار", "tier": 3},
    {"code": "53", "name": "Béni Abbès", "ar": "بني عباس", "tier": 3},
    {"code": "54", "name": "Timimoun", "ar": "تيميمون", "tier": 3},
    {"code": "55", "name": "Touggourt", "ar": "تقرت", "tier": 3},
    {"code": "56", "name": "Djanet", "ar": "جانت", "tier": 3},
    {"code": "57", "name": "In Salah", "ar": "عين صالح", "tier": 3},
    {"code": "58", "name": "In Guezzam", "ar": "عين قزام", "tier": 3},
]


class QueryDecomposer:
    """
    Translates high-level founder ideas into granular multi-source scraping queries.
    Capable of planning and scaling to ~1,000 targeted prospect targets across Algeria.
    """

    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        self.openai_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")

    async def decompose_idea(
        self,
        idea_text: str,
        target_leads: int = 1000,
    ) -> Dict[str, Any]:
        """
        Main entry point for decomposing an idea.
        Tries LLM (Gemini / OpenAI) first, falls back to deterministic heuristic grid.
        """
        logger.info(f"Decomposing idea: '{idea_text}' (Target: {target_leads} leads)")

        # 1. Try Gemini if configured
        if self.gemini_key:
            try:
                res = await self._decompose_with_gemini(idea_text, target_leads)
                if res and res.get("maps_queries"):
                    return res
            except Exception as e:
                logger.warning(f"Gemini query decomposition error: {e}. Falling back to rule grid...")

        # 2. Try OpenAI if configured
        if self.openai_key and self.openai_key.startswith("sk-"):
            try:
                res = await self._decompose_with_openai(idea_text, target_leads)
                if res and res.get("maps_queries"):
                    return res
            except Exception as e:
                logger.warning(f"OpenAI query decomposition error: {e}. Falling back to rule grid...")

        # 3. Deterministic Algorithmic Decomposer (58 Wilayas Grid)
        return self._decompose_heuristically(idea_text, target_leads)

    def _decompose_heuristically(
        self,
        idea_text: str,
        target_leads: int = 1000,
    ) -> Dict[str, Any]:
        """
        Deterministic, robust 58-Wilaya query generation engine.
        Extracts core subject and creates queries for Maps, Instagram/FB Dorks, Ouedkniss, and Telegram.
        """
        lower = idea_text.lower()

        # Detect niche & synonyms (multilingual: EN, FR, AR, Darija Arabizi)
        if any(w in lower for w in ["parfum", "perfume", "parfumerie", "fragrance", "riha", "ri7a", "rwayeh", "rwaye7", "عطر", "عطور", "روائح"]):
            niche_slug = "PERF"
            niche_name = "Parfumerie & Cosmétique"
            keywords_fr = ["Parfumerie", "Boutique parfum", "Parfum de luxe", "Vente de parfum"]
            dork_terms = ["parfum", "parfumerie", "parfum original", "parfum de niche"]
            ouedkniss_cat = "cosmetique"
        elif any(w in lower for w in ["dent", "dentaire", "dental", "dentiste", "clinique"]):
            niche_slug = "DENT"
            niche_name = "Cabinets Dentaires & Cliniques"
            keywords_fr = ["Cabinet dentaire", "Chirurgien dentiste", "Clinique dentaire"]
            dork_terms = ["dentiste", "cabinet dentaire", "blanchiment dentaire"]
            ouedkniss_cat = "services"
        elif any(w in lower for w in ["vetement", "mode", "habit", "boutique", "robe", "chaussure"]):
            niche_slug = "FASH"
            niche_name = "Mode & Boutiques Vêtements"
            keywords_fr = ["Boutique de vêtements", "Prêt-à-porter", "Magasin de mode"]
            dork_terms = ["boutique vetement", "robe de soiree", "pret a porter dz"]
            ouedkniss_cat = "vetements"
        elif any(w in lower for w in ["informatique", "laptop", "ordinateur", "pc", "tech"]):
            niche_slug = "TECH"
            niche_name = "Informatique & High-Tech"
            keywords_fr = ["Magasin informatique", "Vente pc gamer", "Accessoires informatique"]
            dork_terms = ["pc gamer dz", "vente informatique algerie", "laptop occasion dz"]
            ouedkniss_cat = "informatique"
        else:
            # Generic B2B extractor
            clean_subject = re.sub(r"(i am looking for|je cherche|trouve-moi|des|shops|boutiques|en alg[ée]rie|all over algeria)", "", lower).strip()
            subject_title = clean_subject.capitalize() if clean_subject else "Commerce & Services"
            niche_slug = (clean_subject[:4].upper() if clean_subject else "GEN").replace(" ", "")
            niche_name = f"B2B {subject_title}"
            keywords_fr = [f"Boutique {clean_subject}", f"Vente {clean_subject}", f"Fournisseur {clean_subject}"]
            dork_terms = [clean_subject, f"{clean_subject} dz"]
            ouedkniss_cat = "autre"

        import datetime
        date_str = datetime.datetime.now().strftime("%Y%m%d")
        campaign_id = f"DZ-{niche_slug}-{date_str}"
        campaign_name = f"{niche_name} - 58 Wilayas Grid"

        # 1. Generate 58-Wilaya Google Maps Queries (Tier 1 major commercial hubs prioritized)
        maps_queries = []
        for w in ALGERIAN_58_WILAYAS:
            for kw in keywords_fr[:2]:
                maps_queries.append({
                    "query": f"{kw} {w['name']}",
                    "location": f"{w['name']}, Algérie",
                    "wilaya": w["name"],
                    "wilaya_code": w["code"],
                    "tier": w["tier"],
                })

        # 2. Generate Social Dorks (Instagram & Facebook targeting "Prix en privé" & "58 Wilayas")
        social_dorks = []
        for dt in dork_terms:
            social_dorks.append(f'site:instagram.com "{dt}" "58 wilayas" "prix en privé"')
            social_dorks.append(f'site:instagram.com "{dt}" "livraison 58 wilayas" "wa.me"')
            social_dorks.append(f'site:facebook.com "{dt}" "58 wilayas" "prix en mp"')
            social_dorks.append(f'site:instagram.com "{dt}" "algerie" "commande en privé"')

        # 3. Generate Ouedkniss Pro Store queries
        ouedkniss_queries = [
            {"keyword": dork_terms[0], "category": ouedkniss_cat, "max_pages": 5},
            {"keyword": keywords_fr[0], "category": ouedkniss_cat, "max_pages": 5},
        ]

        # 4. Generate Telegram search keywords
        telegram_keywords = [
            f"{dork_terms[0]} algerie",
            f"grossiste {dork_terms[0]} dz",
            f"vente {dork_terms[0]} 58 wilayas",
        ]

        return {
            "campaign_id": campaign_id,
            "campaign_name": campaign_name,
            "niche_slug": niche_slug,
            "niche_name": niche_name,
            "target_leads": target_leads,
            "estimated_leads_capacity": len(maps_queries) * 15 + len(social_dorks) * 20 + 200,
            "maps_queries": maps_queries,
            "social_dorks": social_dorks,
            "ouedkniss_queries": ouedkniss_queries,
            "telegram_keywords": telegram_keywords,
        }

    async def _decompose_with_gemini(self, idea_text: str, target_leads: int) -> Dict[str, Any]:
        """Uses Gemini Flash to expand synonyms and craft localized research strategies."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        prompt = (
            "You are a lead generation strategist. A user gave this niche idea: "
            f"'{idea_text}'.\n"
            "Decompose this into a structured 58-wilaya lead harvesting strategy in Algeria.\n"
            "Respond ONLY with valid JSON matching:\n"
            "{\n"
            '  "campaign_name": "string",\n'
            '  "niche_slug": "3-4 letters uppercase e.g. PERF",\n'
            '  "niche_name": "string",\n'
            '  "primary_search_terms": ["term1", "term2", "term3"],\n'
            '  "social_dorks": ["site:instagram.com ...", "site:facebook.com ..."],\n'
            '  "ouedkniss_category": "cosmetique" | "informatique" | "vetements" | "autre",\n'
            '  "telegram_keywords": ["keyword1", "keyword2"]\n'
            "}"
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"response_mime_type": "application/json", "temperature": 0.2},
        }
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text)

                niche_slug = parsed.get("niche_slug", "NICHE")[:4].upper()
                import datetime
                date_str = datetime.datetime.now().strftime("%Y%m%d")
                campaign_id = f"DZ-{niche_slug}-{date_str}"

                # Expand 58-Wilaya maps queries using LLM terms
                maps_queries = []
                terms = parsed.get("primary_search_terms", ["Boutique"])
                for w in ALGERIAN_58_WILAYAS:
                    maps_queries.append({
                        "query": f"{terms[0]} {w['name']}",
                        "location": f"{w['name']}, Algérie",
                        "wilaya": w["name"],
                        "wilaya_code": w["code"],
                        "tier": w["tier"],
                    })

                return {
                    "campaign_id": campaign_id,
                    "campaign_name": parsed.get("campaign_name", f"{niche_slug} Algeria Campaign"),
                    "niche_slug": niche_slug,
                    "niche_name": parsed.get("niche_name", idea_text),
                    "target_leads": target_leads,
                    "maps_queries": maps_queries,
                    "social_dorks": parsed.get("social_dorks", []),
                    "ouedkniss_queries": [{"keyword": terms[0], "category": parsed.get("ouedkniss_category", "autre"), "max_pages": 5}],
                    "telegram_keywords": parsed.get("telegram_keywords", []),
                }
            return {}

    async def _decompose_with_openai(self, idea_text: str, target_leads: int) -> Dict[str, Any]:
        """Uses OpenAI gpt-4o-mini as alternative LLM planner."""
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "gpt-4o-mini",
            "response_format": {"type": "json_object"},
            "messages": [
                {
                    "role": "system",
                    "content": "Decompose B2B lead niche for Algeria into JSON with campaign_name, niche_slug, niche_name, primary_search_terms, social_dorks, ouedkniss_category, telegram_keywords.",
                },
                {"role": "user", "content": f"Idea: {idea_text}"},
            ],
        }
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                content = json.loads(data["choices"][0]["message"]["content"])
                niche_slug = content.get("niche_slug", "NICHE")[:4].upper()
                import datetime
                date_str = datetime.datetime.now().strftime("%Y%m%d")
                campaign_id = f"DZ-{niche_slug}-{date_str}"

                maps_queries = []
                terms = content.get("primary_search_terms", ["Boutique"])
                for w in ALGERIAN_58_WILAYAS:
                    maps_queries.append({
                        "query": f"{terms[0]} {w['name']}",
                        "location": f"{w['name']}, Algérie",
                        "wilaya": w["name"],
                        "wilaya_code": w["code"],
                        "tier": w["tier"],
                    })

                return {
                    "campaign_id": campaign_id,
                    "campaign_name": content.get("campaign_name", f"{niche_slug} Algeria Campaign"),
                    "niche_slug": niche_slug,
                    "niche_name": content.get("niche_name", idea_text),
                    "target_leads": target_leads,
                    "maps_queries": maps_queries,
                    "social_dorks": content.get("social_dorks", []),
                    "ouedkniss_queries": [{"keyword": terms[0], "category": content.get("ouedkniss_category", "autre"), "max_pages": 5}],
                    "telegram_keywords": content.get("telegram_keywords", []),
                }
            return {}


query_decomposer = QueryDecomposer()
