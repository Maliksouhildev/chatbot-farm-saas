# =============================================================================
# Lead Engine Harvesters Configuration & Linguistic Taxonomy
# Handles Algerian Market (Darija Arabizi + Arabic + French) & Global Market (EN/FR)
# =============================================================================

import os
import re
from typing import List, Dict, Optional

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
    HAS_PYDANTIC_SETTINGS = True
except ImportError:
    HAS_PYDANTIC_SETTINGS = False
    BaseSettings = object
    SettingsConfigDict = None


class Settings:
    if HAS_PYDANTIC_SETTINGS:
        class _PydanticImpl(BaseSettings):
            model_config = SettingsConfigDict(
                env_file=(".env", "../.env"),
                env_file_encoding="utf-8",
                extra="ignore"
            )
            POSTGRES_HOST: str = "postgres"
            POSTGRES_PORT: int = 5432
            POSTGRES_DB: str = "lead_engine"
            POSTGRES_USER: str = "postgres"
            POSTGRES_PASSWORD: str = "postgres_secure_password"
            REDIS_HOST: str = "redis"
            REDIS_PORT: int = 6379
            REDIS_PASSWORD: Optional[str] = None
            REDIS_DB: int = 0
            REDIS_DEDUP_TTL_DAYS: int = 30
            REDDIT_CLIENT_ID: Optional[str] = None
            REDDIT_CLIENT_SECRET: Optional[str] = None
            REDDIT_USER_AGENT: str = "python:lead-engine-b2b:v1.0 (by /u/system_architect)"
            REDDIT_USERNAME: Optional[str] = None
            REDDIT_PASSWORD: Optional[str] = None
            TELEGRAM_API_ID: Optional[int] = None
            TELEGRAM_API_HASH: Optional[str] = None
            TELEGRAM_PHONE: Optional[str] = None
            TELEGRAM_SESSION_DIR: str = "/app/session"
            TELEGRAM_SESSION_NAME: str = "telethon_harvester"
            TELEGRAM_TARGET_GROUPS: str = "algeria_ecommerce,dz_freelancers,n8n_community,saas_founders"
            SERPER_API_KEY: Optional[str] = None
            N8N_WEBHOOK_URL: str = "http://n8n:5678/webhook/lead-ingestion"
            OPENAI_API_KEY: Optional[str] = None
            OPENAI_MODEL: str = "gpt-4o-mini"
            GEMINI_API_KEY: Optional[str] = None
            GROQ_API_KEY: Optional[str] = None
            TELEGRAM_BOT_TOKEN: Optional[str] = None
            TELEGRAM_ADMIN_CHAT_ID: Optional[int] = None
            EVOLUTION_API_URL: str = "http://localhost:8080"
            EVOLUTION_API_KEY: Optional[str] = None
            EVOLUTION_INSTANCE_NAME: str = "lead_dispatch"
            GOOGLE_SHEETS_SPREADSHEET_ID: Optional[str] = None
            GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON: Optional[str] = None
            GOOGLE_SHEETS_TAB_NAME: str = "Master Leads"
            MAX_HARVEST_BATCH_SIZE: int = 50
            REQUEST_TIMEOUT_SECONDS: int = 15
            REDDIT_SUBREDDITS: str = "n8n,automation,nocode,Entrepreneur,smallbusiness,forhire,freelance_forhire,SaaS,algeria"

            @property
            def postgres_dsn(self) -> str:
                pwd = f":{self.POSTGRES_PASSWORD}" if self.POSTGRES_PASSWORD else ""
                return f"postgresql://{self.POSTGRES_USER}{pwd}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    else:
        def __init__(self):
            self.POSTGRES_HOST = os.getenv("POSTGRES_HOST", "postgres")
            self.POSTGRES_PORT = int(os.getenv("POSTGRES_PORT", 5432))
            self.POSTGRES_DB = os.getenv("POSTGRES_DB", "lead_engine")
            self.POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
            self.POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres_secure_password")
            self.REDIS_HOST = os.getenv("REDIS_HOST", "redis")
            self.REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
            self.REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")
            self.REDIS_DB = int(os.getenv("REDIS_DB", 0))
            self.REDIS_DEDUP_TTL_DAYS = int(os.getenv("REDIS_DEDUP_TTL_DAYS", 30))
            self.REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
            self.REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
            self.REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT", "python:lead-engine-b2b:v1.0 (by /u/system_architect)")
            self.REDDIT_USERNAME = os.getenv("REDDIT_USERNAME")
            self.REDDIT_PASSWORD = os.getenv("REDDIT_PASSWORD")
            self.TELEGRAM_API_ID = int(os.getenv("TELEGRAM_API_ID")) if os.getenv("TELEGRAM_API_ID") else None
            self.TELEGRAM_API_HASH = os.getenv("TELEGRAM_API_HASH")
            self.TELEGRAM_PHONE = os.getenv("TELEGRAM_PHONE")
            self.TELEGRAM_SESSION_DIR = os.getenv("TELEGRAM_SESSION_DIR", "/app/session")
            self.TELEGRAM_SESSION_NAME = os.getenv("TELEGRAM_SESSION_NAME", "telethon_harvester")
            self.TELEGRAM_TARGET_GROUPS = os.getenv("TELEGRAM_TARGET_GROUPS", "algeria_ecommerce,dz_freelancers,n8n_community,saas_founders")
            self.SERPER_API_KEY = os.getenv("SERPER_API_KEY")
            self.N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "http://n8n:5678/webhook/lead-ingestion")
            self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
            self.OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
            self.GROQ_API_KEY = os.getenv("GROQ_API_KEY")
            self.TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
            self.TELEGRAM_ADMIN_CHAT_ID = int(os.getenv("TELEGRAM_ADMIN_CHAT_ID")) if os.getenv("TELEGRAM_ADMIN_CHAT_ID") else None
            self.EVOLUTION_API_URL = os.getenv("EVOLUTION_API_URL", "http://localhost:8080")
            self.EVOLUTION_API_KEY = os.getenv("EVOLUTION_API_KEY")
            self.EVOLUTION_INSTANCE_NAME = os.getenv("EVOLUTION_INSTANCE_NAME", "lead_dispatch")
            self.GOOGLE_SHEETS_SPREADSHEET_ID = os.getenv("GOOGLE_SHEETS_SPREADSHEET_ID")
            self.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON = os.getenv("GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON")
            self.GOOGLE_SHEETS_TAB_NAME = os.getenv("GOOGLE_SHEETS_TAB_NAME", "Master Leads")
            self.MAX_HARVEST_BATCH_SIZE = int(os.getenv("MAX_HARVEST_BATCH_SIZE", 50))
            self.REQUEST_TIMEOUT_SECONDS = int(os.getenv("REQUEST_TIMEOUT_SECONDS", 15))
            self.REDDIT_SUBREDDITS = os.getenv("REDDIT_SUBREDDITS", "n8n,automation,nocode,Entrepreneur,smallbusiness,forhire,freelance_forhire,SaaS,algeria")

            @property
            def postgres_dsn(self) -> str:
                pwd = f":{self.POSTGRES_PASSWORD}" if self.POSTGRES_PASSWORD else ""
                return f"postgresql://{self.POSTGRES_USER}{pwd}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"


settings = Settings._PydanticImpl() if HAS_PYDANTIC_SETTINGS else Settings()


# =============================================================================
# LINGUISTIC INTENT & PAIN POINT TRIGGER DICTIONARIES
# =============================================================================

# Algerian Darija / Arabizi Keywords (Latin script with numerals 3, 5, 7, 9)
DARIJA_ARABIZI_TRIGGERS: List[str] = [
    "prix en mp",
    "prix en prive",
    "prix prive",
    "58 wilayas",
    "livraison 58",
    "dispo 58",
    "commande f le prive",
    "commande en prive",
    "khassni bot",
    "khassni site",
    "khassni developer",
    "chhal soum",
    "chhal le prix",
    "sel3a",
    "kayen livraison",
    "atloub f prive",
    "recherche dev",
    "yalidine",
    "zr express",
    "ecotrack",
    "khedma",
    "baghi nzid",
    "page facebook",
]

# Arabic Script Triggers (Algerian & Maghreb E-commerce & Tech)
ARABIC_SCRIPT_TRIGGERS: List[str] = [
    "السعر في الخاص",
    "السعر على الخاص",
    "التوصيل 58 ولاية",
    "التوصيل لجميع الولايات",
    "خدمة التوصيل متوفرة",
    "للطلب تواصل عبر الواتساب",
    "للطلب في الخاص",
    "متجر الكتروني",
    "برمجة موقع",
    "بوت واتساب",
    "أتمتة",
    "موقع الكتروني",
    "طلب مسبق",
]

# French Triggers (Algerian B2B & Global French Market)
FRENCH_TRIGGERS: List[str] = [
    "prix en mp",
    "prix en privé",
    "livraison 58 wilayas",
    "contactez nous sur whatsapp",
    "commande par message",
    "recherche développeur",
    "automatisation n8n",
    "chatbot whatsapp",
    "création site web",
    "site vitrine",
    "site e-commerce",
    "gestion des commandes",
    "workflow automatisé",
    "besoin d'automatiser",
    "cherche freelance automatisation",
    "intégration api",
]

# English Triggers (Global Market: Active Intent & Pain Points)
ENGLISH_INTENT_TRIGGERS: List[str] = [
    "looking for automation",
    "need an n8n expert",
    "need n8n developer",
    "automate workflow",
    "whatsapp bot developer",
    "build custom chatbot",
    "instagram dm automation",
    "web scraping automation",
    "crm integration",
    "hire web developer",
    "zapier to n8n",
    "looking for chatbot developer",
    "automate lead generation",
    "need a website built",
    "build an e-commerce store",
]

# =============================================================================
# REGEX EXTRACTORS & NORMALIZERS
# =============================================================================

# Algerian Phone Numbers: Handles +213, 00213, 05xx, 06xx, 07xx, Landlines (021, 023, 031, etc.)
DZ_PHONE_REGEX = re.compile(
    r"(?:(?:\+|00)213[\s.-]?\(?0?\)?|0)(?:[567]\d{8}|(?:2[13-9]|3[1-9]|4[1-9])\d{6})",
    re.IGNORECASE
)

# International Phone Numbers
INTL_PHONE_REGEX = re.compile(
    r"(?:\+|00)[1-9]\d{1,14}(?:[\s.-]?\d+){2,}",
    re.IGNORECASE
)

# Email address extraction
EMAIL_REGEX = re.compile(
    r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
    re.IGNORECASE
)

# Instagram username or link extraction
INSTAGRAM_REGEX = re.compile(
    r"(?:https?://(?:www\.)?instagram\.com/([a-zA-Z0-9_.-]+)|@([a-zA-Z0-9_.-]{3,30}))",
    re.IGNORECASE
)

# Facebook page or link extraction
FACEBOOK_REGEX = re.compile(
    r"https?://(?:www\.)?facebook\.com/([a-zA-Z0-9_.-]+)",
    re.IGNORECASE
)

# WhatsApp direct link
WHATSAPP_LINK_REGEX = re.compile(
    r"https?://(?:api\.)?wa\.me/([0-9+]+)|https?://chat\.whatsapp\.com/([a-zA-Z0-9]+)",
    re.IGNORECASE
)


def normalize_algerian_phone(raw: str) -> Optional[str]:
    """
    Cleans and converts raw phone strings to standard international E.164: +213XXXXXXXXX
    """
    if not raw:
        return None
    # Strip spaces, dots, dashes, parentheses
    cleaned = re.sub(r"[\s\.\-\(\)]", "", raw)
    
    # 00213... -> +213...
    if cleaned.startswith("00213"):
        cleaned = "+213" + cleaned[5:]
    # 213... without plus
    elif cleaned.startswith("213") and not cleaned.startswith("+"):
        cleaned = "+213" + cleaned[3:]
    # Local DZ 05/06/07/02x -> +2135...
    elif cleaned.startswith("0") and len(cleaned) == 10:
        cleaned = "+213" + cleaned[1:]
    
    if cleaned.startswith("+213") and len(cleaned) == 13:
        return cleaned
    return None


def detect_language(text: str) -> str:
    """
    Detects primary language/dialect of the raw text:
    - 'ar': Arabic script
    - 'dar': Darija Arabizi (Latin script with 58 wilayas, prix prive, numerals)
    - 'fr': French
    - 'en': English
    """
    if not text:
        return "en"
    
    lower = text.lower()
    
    # Check Arabic script presence
    if any("\u0600" <= char <= "\u06FF" for char in text):
        return "ar"
    
    # Check Darija Arabizi indicators
    for kw in DARIJA_ARABIZI_TRIGGERS:
        if kw in lower:
            return "dar"
            
    # Check French triggers
    fr_hits = sum(1 for kw in FRENCH_TRIGGERS if kw in lower)
    en_hits = sum(1 for kw in ENGLISH_INTENT_TRIGGERS if kw in lower)
    
    # Common French vocabulary heuristics
    french_words = ["bonjour", "avec", "pour", "dans", "votre", "nous", "vous", "disponible", "projet"]
    fr_word_hits = sum(1 for w in french_words if re.search(r"\b" + w + r"\b", lower))
    
    if fr_hits > 0 or fr_word_hits >= 2:
        return "fr"
    
    return "en"


def detect_pain_points_and_service(text: str, website: Optional[str] = None) -> Dict[str, any]:
    """
    Heuristic rule engine to identify business friction and tag matching services.
    """
    lower = text.lower() if text else ""
    pain_points = []
    proposed_service = "n8n_automation"

    # Pain Point: Prix en privé / manual DM answering fatigue
    if any(k in lower for k in ["prix en mp", "prix en prive", "prix privé", "السعر في الخاص", "commande en mp", "commande en prive", "commande en privé", "commande f le prive"]):
        pain_points.append("dm_for_price")
        pain_points.append("manual_customer_support")
        proposed_service = "instagram_bot"

    # Pain Point: No website / Broken website
    if not website or "facebook.com" in (website or "") or "instagram.com" in (website or ""):
        pain_points.append("no_ecommerce_website")
        if "instagram_bot" not in proposed_service:
            proposed_service = "ecommerce_web_dev"

    # Pain Point: Order & Delivery coordination (58 wilayas dispatch)
    if any(k in lower for k in ["58 wilayas", "livraison 58", "yalidine", "zr express", "ecotrack"]):
        pain_points.append("manual_order_dispatch_58_wilayas")
        proposed_service = "whatsapp_bot"

    # Pain Point: Seeking technical integration / active hiring
    if any(k in lower for k in ["looking for automation", "need n8n", "hire developer", "recherche développeur", "workflow"]):
        pain_points.append("seeking_automation_expert")
        proposed_service = "n8n_automation"

    return {
        "pain_points": pain_points,
        "proposed_service": proposed_service
    }
