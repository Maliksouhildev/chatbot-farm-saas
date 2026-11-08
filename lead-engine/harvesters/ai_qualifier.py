# =============================================================================
# Lead Engine Dual-Engine AI Qualification & Pitch Generator
# Hybrid Architecture: LLM (OpenAI / Gemini) with Deterministic NLP Fallback
# Generates culturally tuned pitches in Algerian Darija Arabizi, French, & English
# =============================================================================

import os
import json
import logging
import urllib.parse
from typing import Dict, Any, Optional, Tuple

import httpx

from config import (
    settings,
    normalize_algerian_phone,
    detect_language,
    detect_pain_points_and_service,
)

logger = logging.getLogger("ai_qualifier")
logger.setLevel(logging.INFO)


class AIQualifier:
    """
    Evaluates and qualifies raw leads using LLMs (OpenAI gpt-4o-mini / Gemini Flash)
    with an automatic, resilient, rule-based NLP fallback engine.
    Ensures zero downtime or blocked pipelines even without API keys or during rate limits.
    """

    def __init__(self):
        self.openai_key = settings.OPENAI_API_KEY
        self.gemini_key = settings.GEMINI_API_KEY
        self.model = getattr(settings, "OPENAI_MODEL", "gpt-4o-mini")

    async def qualify_lead(self, lead: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main qualification dispatcher.
        Tries LLM (OpenAI -> Gemini) and seamlessly falls back to heuristic NLP.
        """
        result = None

        # 1. Try OpenAI if key is present
        if self.openai_key and self.openai_key.startswith("sk-"):
            try:
                result = await self._qualify_with_openai(lead)
            except Exception as e:
                logger.warning(f"OpenAI qualification failed: {e}. Falling back...")

        # 2. Try Gemini if OpenAI unavailable or failed
        if not result and self.gemini_key:
            try:
                result = await self._qualify_with_gemini(lead)
            except Exception as e:
                logger.warning(f"Gemini qualification failed: {e}. Falling back...")

        # 3. Fallback to High-Precision Heuristic NLP Engine
        if not result:
            result = self._qualify_with_heuristics(lead)

        # 4. Generate instant 1-click WhatsApp wa.me outreach URL
        phone = lead.get("contact_whatsapp") or lead.get("contact_phone")
        if phone:
            norm_phone = normalize_algerian_phone(str(phone))
            if norm_phone:
                clean_digits = norm_phone.replace("+", "")
                encoded_pitch = urllib.parse.quote(result.get("ai_pitch_draft", ""))
                result["whatsapp_direct_url"] = f"https://wa.me/{clean_digits}?text={encoded_pitch}"
            else:
                result["whatsapp_direct_url"] = None
        else:
            result["whatsapp_direct_url"] = None

        return result

    async def _qualify_with_openai(self, lead: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Invokes OpenAI gpt-4o-mini using asynchronous HTTPX."""
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_key}",
            "Content-Type": "application/json",
        }

        system_prompt = (
            "You are an elite B2B Lead Qualification & Classification AI for an agency specializing in: "
            "1) n8n Workflow Automations, 2) Custom WhatsApp/Instagram Chatbots for e-commerce, and 3) Web Development.\n"
            "Qualify the lead strictly and output JSON only with keys:\n"
            "{\n"
            '  "country": "Algeria" | "France" | "USA" | "UK" | "UAE" | "<Country>",\n'
            '  "lead_category": "ACTIVE_REQUEST" | "PASSIVE_POTENTIAL",\n'
            '  "sub_niche": "<Specific niche like Ouedkniss Pro Store, Dental Clinic, SaaS Founder>",\n'
            '  "ai_fit_score": <Integer 1 to 10>,\n'
            '  "ai_scoring_reasoning": "<Short rationale for score>",\n'
            '  "detected_bottleneck": "<Specific operational pain point>",\n'
            '  "proposed_service": "n8n_automation" | "whatsapp_bot" | "instagram_bot" | "ecommerce_web_dev",\n'
            '  "ai_pitch_draft": "<2-3 sentence personalized pitch in their native language: Algerian Darija Arabizi/Arabic, French, or English. Reference their specific bottleneck and propose solving it. Zero fluff.>"\n'
            "}"
        )

        user_content = (
            f"Lead Data:\n"
            f"- Source: {lead.get('source')}\n"
            f"- Name/Store: {lead.get('name')}\n"
            f"- Company: {lead.get('company_name')}\n"
            f"- Phone/WA: {lead.get('contact_phone') or lead.get('contact_whatsapp')}\n"
            f"- Website: {lead.get('website_url')}\n"
            f"- Location/Wilaya: {lead.get('location_wilaya')}\n"
            f"- Raw Text:\n{lead.get('raw_content', '')[:1000]}"
        )

        payload = {
            "model": self.model or "gpt-4o-mini",
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
        }

        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                parsed["ai_fit_score"] = int(parsed.get("ai_fit_score", 6))
                return parsed
            else:
                logger.error(f"OpenAI error {resp.status_code}: {resp.text}")
                return None

    async def _qualify_with_gemini(self, lead: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Invokes Google Gemini 1.5/2.0 Flash via direct REST API."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        headers = {"Content-Type": "application/json"}

        prompt = (
            "You are a B2B lead qualification system. Analyze this business and reply ONLY with valid JSON.\n"
            "Format:\n"
            "{\n"
            '  "country": "Algeria",\n'
            '  "lead_category": "ACTIVE_REQUEST" or "PASSIVE_POTENTIAL",\n'
            '  "sub_niche": "string",\n'
            '  "ai_fit_score": 1 to 10,\n'
            '  "ai_scoring_reasoning": "string",\n'
            '  "detected_bottleneck": "string",\n'
            '  "proposed_service": "n8n_automation" | "whatsapp_bot" | "instagram_bot" | "ecommerce_web_dev",\n'
            '  "ai_pitch_draft": "Persuasive 2-3 sentence personalized pitch in Darija, French, or English depending on context"\n'
            "}\n\n"
            f"Business: {lead.get('company_name', lead.get('name', 'Business'))}\n"
            f"Source: {lead.get('source')}\n"
            f"Location: {lead.get('location_wilaya')}\n"
            f"Details: {lead.get('raw_content', '')[:800]}"
        )

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"response_mime_type": "application/json", "temperature": 0.2},
        }

        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text)
                parsed["ai_fit_score"] = int(parsed.get("ai_fit_score", 6))
                return parsed
            return None

    def _qualify_with_heuristics(self, lead: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deterministic NLP rule-based engine.
        Scores leads based on presence of direct buyer intent, pain points, and reachability.
        Drafts high-converting outreach messages tailored to Algerian and Global markets.
        """
        source = (lead.get("source") or "").lower()
        raw_text = lead.get("raw_content") or ""
        website = lead.get("website_url")
        phone = lead.get("contact_phone") or lead.get("contact_whatsapp")
        email = lead.get("contact_email")
        name = lead.get("company_name") or lead.get("name") or "Cher Partenaire"
        wilaya = lead.get("location_wilaya") or "votre région"

        # Determine language & pain points
        lang = detect_language(raw_text)
        pain_meta = detect_pain_points_and_service(raw_text, website)
        pain_points = list(pain_meta.get("pain_points", []))

        # Include any pre-existing pain points detected by scrapers (e.g. gmaps auditor)
        existing_pains = lead.get("identified_pain_points") or []
        if isinstance(existing_pains, list):
            for ep in existing_pains:
                if ep not in pain_points:
                    pain_points.append(ep)

        proposed_service = pain_meta.get("proposed_service", "n8n_automation")

        # Determine country & lead category
        is_direct = source in ["reddit", "telegram", "discord"]
        lead_category = "ACTIVE_REQUEST" if is_direct else "PASSIVE_POTENTIAL"

        country = "Algeria"
        if phone:
            phone_str = str(phone)
            if phone_str.startswith("+33"):
                country = "France"
            elif phone_str.startswith("+1"):
                country = "USA"
            elif phone_str.startswith("+44"):
                country = "UK"
            elif phone_str.startswith("+971"):
                country = "UAE"
            elif phone_str.startswith("+213") or phone_str.startswith("05") or phone_str.startswith("06") or phone_str.startswith("07"):
                country = "Algeria"
        elif source == "reddit":
            country = "Global / USA"

        # Sub-niche detection
        sub_niche = lead.get("sub_niche") or lead.get("category_niche")
        if not sub_niche:
            lower_text = raw_text.lower()
            if "dentaire" in lower_text or "clinique" in lower_text or "médical" in lower_text:
                sub_niche = "Cabinet Médical / Clinique"
            elif "ouedkniss" in source:
                sub_niche = "Ouedkniss Pro Store"
            elif "vetement" in lower_text or "boutique" in lower_text or "mode" in lower_text:
                sub_niche = "Boutique Mode & E-commerce"
            elif "saas" in lower_text or "founder" in lower_text:
                sub_niche = "SaaS / Tech Startup"
            else:
                sub_niche = "Local B2B Business"

        # Check for medical or dead website pain
        if "cabinet" in sub_niche.lower() or "clinique" in sub_niche.lower() or "médical" in sub_niche.lower():
            if "lacks_online_booking" not in pain_points:
                pain_points.append("lacks_online_booking")
            proposed_service = "whatsapp_bot"

        if website and ("dead" in website or "broken" in website or any("dead" in p or "broken" in p for p in pain_points)):
            if "broken_website" not in pain_points:
                pain_points.append("broken_website")
            proposed_service = "ecommerce_web_dev"

        # Calculate fit score (1-10)
        # Factor 1: Active intent vs passive fit (1-4 points)
        score = 4 if is_direct else 2

        # Factor 2: Severity of operational pain (1-4 points)
        if "dm_for_price" in pain_points or "manual_order_dispatch_58_wilayas" in pain_points:
            score += 3
        elif "seeking_automation_expert" in pain_points:
            score += 3
        elif "broken_website" in pain_points or "lacks_online_booking" in pain_points or "no_ecommerce_website" in pain_points or not website:
            score += 2
        else:
            score += 1

        # Factor 3: Reachability / Contact presence (1-3 points)
        if phone and (email or "ouedkniss" in source or is_direct):
            score += 3
        elif phone or email:
            score += 2
        else:
            score += 1

        # Clamp score 1 to 10
        score = max(1, min(10, score))

        # Detect primary bottleneck description
        if "dm_for_price" in pain_points:
            bottleneck = "Perte de clients due aux réponses manuelles 'Prix en privé' sur Instagram / FB"
        elif "manual_order_dispatch_58_wilayas" in pain_points:
            bottleneck = "Gestion manuelle lourde des commandes et expédition 58 wilayas (Yalidine/ZR)"
        elif "broken_website" in pain_points:
            bottleneck = "Site web inaccessible ou renvoyant une erreur HTTP / pas de nom de domaine opérationnel"
        elif "lacks_online_booking" in pain_points:
            bottleneck = "Prise de rendez-vous manuelle par téléphone saturée et risque élevé de no-shows"
        elif "no_ecommerce_website" in pain_points:
            bottleneck = "Absence de site web dédié avec catalogue produits et checkout automatisé"
        elif "seeking_automation_expert" in pain_points:
            bottleneck = "Besoin urgent de connecter les flux et d'automatiser les processus métier"
        else:
            bottleneck = "Processus de gestion des prospects manuel avec fort taux d'abandon"

        # Draft culturally tuned pitch
        pitch = self._generate_heuristic_pitch(
            lang=lang,
            country=country,
            name=name,
            wilaya=wilaya,
            service=proposed_service,
            pain_points=pain_points,
            sub_niche=sub_niche,
        )

        reasoning = (
            f"Qualifié via Heuristiques NLP. Source: {source.upper()}. "
            f"Contact direct identifié: {'Oui' if (phone or email) else 'Non'}. "
            f"Pain point critique: {bottleneck}."
        )

        return {
            "country": country,
            "lead_category": lead_category,
            "sub_niche": sub_niche,
            "ai_fit_score": score,
            "ai_scoring_reasoning": reasoning,
            "detected_bottleneck": bottleneck,
            "proposed_service": proposed_service,
            "ai_pitch_draft": pitch,
        }

    def _generate_heuristic_pitch(
        self,
        lang: str,
        country: str,
        name: str,
        wilaya: str,
        service: str,
        pain_points: list,
        sub_niche: str,
    ) -> str:
        """Assembles natural, high-converting outreach copy based on target dialect & service."""
        # 1. Algerian Darija Arabizi Pitch (Local E-Commerce & WhatsApp)
        if country == "Algeria" and ("dm_for_price" in pain_points or "manual_order_dispatch_58_wilayas" in pain_points):
            return (
                f"Salam {name}, chefna la boutique ta3kom fi {wilaya}. "
                f"Nla7dho bzaf commerçants ydi3oulhom les clients f les DMs 'prix en privé' ou la confirmation 58 wilayas. "
                f"Khdémna système WhatsApp bot yjawéb f 2 secondes, yrecouperi les commandes direct f Yalidine/ZR bla ma tba9aw tkatbo b yedkom. "
                f"T7ab nwerrilek demo 3la WhatsApp direct f 2 minutes?"
            )

        # 2. Algerian / French Local Business Pitch (Clinics, Stores needing websites)
        if country == "Algeria" or lang == "fr":
            if service == "ecommerce_web_dev" or "no_ecommerce_website" in pain_points:
                return (
                    f"Bonjour {name}, nous avons découvert votre activité à {wilaya}. "
                    f"Vos clients actuels n'ont pas de catalogue interactif pour commander directement en ligne 24/7. "
                    f"Nous développons des plateformes e-commerce légères connectées directement à la livraison 58 wilayas et WhatsApp. "
                    f"Seriez-vous ouvert à ce que nous vous partagions un aperçu sans engagement ?"
                )
            elif "cabinet" in sub_niche.lower() or "clinique" in sub_niche.lower():
                return (
                    f"Bonjour {name}, nous accompagnons les cabinets médicaux pour automatiser la prise de rendez-vous "
                    f"et les rappels patients via WhatsApp. Cela élimine 80% des appels téléphoniques et les oublis. "
                    f"Pouvons-nous vous envoyer une courte démonstration vidéo ?"
                )
            else:
                return (
                    f"Bonjour {name}, nous avons analysé votre flux de travail et pouvons automatiser vos relances clients "
                    f"et votre gestion des commandes via n8n. Seriez-vous disponible pour un échange rapide de 5 minutes ?"
                )

        # 3. Global / English Pitch (Reddit / SaaS / Tech agencies)
        return (
            f"Hey {name}, came across your request regarding automation workflows. "
            f"We specialize in building resilient n8n pipelines, custom API connectors, and automated chatbots that cut manual ops by 90%. "
            f"Happy to walk you through a quick Loom or live architecture review if you're still looking for a partner on this."
        )


ai_qualifier = AIQualifier()
