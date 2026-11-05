# =============================================================================
# Lead Engine Harvesters API Gateway & Scheduler (FastAPI + APScheduler)
# Provides REST endpoints for n8n orchestration, real-time Telethon listener,
# and periodic harvesting jobs across Algerian and Global markets
# =============================================================================

import os
import sys
import logging
import asyncio
from contextlib import asynccontextmanager
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import psycopg2
from psycopg2.extras import RealDictCursor
import httpx

# Ensure harvester submodules are in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "active_intent"))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "passive_fit"))

from config import settings
from redis_dedup import dedup_manager
from active_intent.reddit_harvester import reddit_harvester
from active_intent.telegram_listener import telegram_harvester
from passive_fit.ouedkniss_graphql import ouedkniss_harvester
from passive_fit.dork_harvester import dork_harvester
from passive_fit.gmaps_auditor import gmaps_auditor

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("main_api")

scheduler = AsyncIOScheduler()

# =============================================================================
# LIFESPAN & BACKGROUND WORKERS
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Lead Engine API and background scheduler...")
    
    # 1. Start APScheduler for automated recurring scrapes
    scheduler.add_job(
        func=lambda: reddit_harvester.harvest(limit_per_sub=15),
        trigger="interval",
        minutes=30,
        id="scheduled_reddit_harvest",
        name="Hourly Reddit Harvester",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("APScheduler started with recurring Reddit harvester job.")

    # 2. Launch Telegram MTProto listener in non-blocking background task
    telegram_task = None
    if settings.TELEGRAM_API_ID and settings.TELEGRAM_API_HASH:
        telegram_task = asyncio.create_task(telegram_harvester.start_listener())
        logger.info("Telegram background listener task spawned.")
    else:
        logger.info("Telegram listener inactive (TELEGRAM_API_ID not provided).")

    yield

    # Teardown
    logger.info("Shutting down scheduler and connections...")
    scheduler.shutdown(wait=False)
    if telegram_task and not telegram_task.done():
        telegram_task.cancel()


app = FastAPI(
    title="Lead Engine B2B Harvesting & Qualification API",
    version="1.0.0",
    description="Containerized microservice for active & passive lead acquisition in Algeria and Global markets.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# PYDANTIC SCHEMAS
# =============================================================================

class RedditHarvestRequest(BaseModel):
    subreddits: Optional[List[str]] = None
    query: Optional[str] = None
    limit_per_sub: int = Field(default=20, ge=1, le=100)

class OuedknissHarvestRequest(BaseModel):
    categories: Optional[List[str]] = None
    max_pages: int = Field(default=2, ge=1, le=10)

class DorkHarvestRequest(BaseModel):
    dork_queries: Optional[List[str]] = None
    max_results_per_dork: int = Field(default=15, ge=1, le=50)

class GMapsAuditRequest(BaseModel):
    query: str = Field(default="Clinique médicale")
    location: str = Field(default="Alger, Algérie")
    max_results: int = Field(default=15, ge=1, le=50)

class StatusUpdateRequest(BaseModel):
    status: str = Field(description="new, scored, hitl_pending, approved, rejected, contacted, blacklisted")

class OutreachLogRequest(BaseModel):
    channel: str = Field(description="whatsapp, telegram, email, reddit_dm, instagram_dm")
    recipient_address: str
    message_content: str
    sent_status: str = Field(default="sent")
    debounce_days: int = Field(default=14)

class AIScoreRequest(BaseModel):
    ai_fit_score: int = Field(ge=0, le=100)
    ai_scoring_reasoning: str
    ai_pitch_draft: str
    proposed_service: Optional[str] = None

# =============================================================================
# API ROUTES
# =============================================================================

@app.get("/health")
def health_check():
    """System healthcheck reporting PostgreSQL, Redis, and Telethon connectivity."""
    db_ok = False
    try:
        conn = psycopg2.connect(
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            dbname=settings.POSTGRES_DB,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            connect_timeout=3,
        )
        conn.close()
        db_ok = True
    except Exception as e:
        logger.error(f"PostgreSQL health check failed: {e}")

    redis_ok = dedup_manager.ping()
    telegram_active = bool(telegram_harvester.client and telegram_harvester.client.is_connected())

    return {
        "status": "healthy" if (db_ok and redis_ok) else "degraded",
        "services": {
            "postgres": "connected" if db_ok else "disconnected",
            "redis": "connected" if redis_ok else "disconnected",
            "telegram_listener": "online" if telegram_active else "standby",
            "apscheduler": "running" if scheduler.running else "stopped",
        },
    }

@app.post("/harvest/reddit")
async def trigger_reddit_harvest(req: RedditHarvestRequest, bg: BackgroundTasks):
    """Triggers Reddit OAuth2 harvest across buyer-intent subreddits."""
    # Run in background to prevent HTTP timeout on long scrapes
    def _run():
        reddit_harvester.harvest(
            subreddits=req.subreddits,
            query=req.query,
            limit_per_sub=req.limit_per_sub,
        )
    bg.add_task(_run)
    return {"message": "Reddit harvest task dispatched in background", "params": req.dict()}

@app.post("/harvest/ouedkniss")
async def trigger_ouedkniss_harvest(req: OuedknissHarvestRequest):
    """Queries Ouedkniss GraphQL endpoint directly for Algerian Pro stores lacking modern websites."""
    leads = await ouedkniss_harvester.harvest_stores(
        categories=req.categories,
        max_pages=req.max_pages,
    )
    return {"status": "success", "harvested_count": len(leads), "leads": leads[:5]}

@app.post("/harvest/dork")
async def trigger_dork_harvest(req: DorkHarvestRequest):
    """Executes Google Dorks targeting Algerian stores suffering from 'Prix en privé' fatigue."""
    leads = await dork_harvester.harvest_dorks(
        dork_queries=req.dork_queries,
        max_results_per_dork=req.max_results_per_dork,
    )
    return {"status": "success", "harvested_count": len(leads), "leads": leads[:5]}

@app.post("/harvest/gmaps")
async def trigger_gmaps_audit(req: GMapsAuditRequest):
    """Scrapes Google Maps places and audits whether website is dead, missing, or social-only."""
    leads = await gmaps_auditor.audit_niche(
        query=req.query,
        location=req.location,
        max_results=req.max_results,
    )
    return {"status": "success", "harvested_count": len(leads), "leads": leads[:5]}

@app.post("/harvest/all")
async def trigger_full_harvest_batch(bg: BackgroundTasks):
    """Orchestrates an aggregated harvest cycle across all enabled channels."""
    async def _batch():
        logger.info("Executing comprehensive harvest orchestration...")
        # 1. Reddit
        reddit_harvester.harvest(limit_per_sub=15)
        # 2. Ouedkniss
        await ouedkniss_harvester.harvest_stores(max_pages=2)
        # 3. Google Dorks
        await dork_harvester.harvest_dorks(max_results_per_dork=15)
        # 4. Google Maps
        await gmaps_auditor.audit_niche(query="Clinique médicale", location="Alger, Algérie", max_results=15)
        logger.info("Full harvest batch complete.")

    bg.add_task(_batch)
    return {"message": "Full omnichannel harvest batch initiated in background."}

@app.get("/leads")
def get_leads(
    status: Optional[str] = None,
    target_market: Optional[str] = None,
    source: Optional[str] = None,
    min_score: int = Query(default=0, ge=0, le=100),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    """Fetches filtered leads from PostgreSQL."""
    try:
        conn = psycopg2.connect(
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            dbname=settings.POSTGRES_DB,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
        )
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            filters = ["ai_fit_score >= %s"]
            params = [min_score]

            if status:
                filters.append("status = %s")
                params.append(status)
            if target_market:
                filters.append("target_market = %s")
                params.append(target_market)
            if source:
                filters.append("source = %s")
                params.append(source)

            where_clause = " AND ".join(filters)
            params.extend([limit, offset])

            query = f"""
                SELECT id, fingerprint, source, target_market, name, company_name,
                       contact_phone, contact_whatsapp, contact_telegram, contact_instagram,
                       website_url, location_wilaya, category_niche, detected_language,
                       identified_pain_points, proposed_service, ai_fit_score,
                       ai_scoring_reasoning, ai_pitch_draft, status, created_at
                FROM leads
                WHERE {where_clause}
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s;
            """
            cur.execute(query, tuple(params))
            rows = cur.fetchall()
            conn.close()
            return {"count": len(rows), "leads": rows}
    except Exception as e:
        logger.error(f"Error querying leads: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/leads/{lead_id}/score")
def update_lead_ai_score(lead_id: str, req: AIScoreRequest):
    """Updates AI qualification score, reasoning, and pitch draft generated by n8n LLM node."""
    try:
        conn = psycopg2.connect(
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            dbname=settings.POSTGRES_DB,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
        )
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            next_status = "hitl_pending" if req.ai_fit_score >= 70 else "scored"
            cur.execute(
                """
                UPDATE leads
                SET ai_fit_score = %s,
                    ai_scoring_reasoning = %s,
                    ai_pitch_draft = %s,
                    proposed_service = COALESCE(%s, proposed_service),
                    status = %s
                WHERE id = %s
                RETURNING id, name, ai_fit_score, status;
                """,
                (
                    req.ai_fit_score,
                    req.ai_scoring_reasoning,
                    req.ai_pitch_draft,
                    req.proposed_service,
                    next_status,
                    lead_id,
                ),
            )
            updated = cur.fetchone()
            conn.commit()
            conn.close()

            if not updated:
                raise HTTPException(status_code=404, detail="Lead not found")
            return {"status": "success", "lead": updated}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating lead score: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/leads/{lead_id}/status")
def update_lead_status(lead_id: str, req: StatusUpdateRequest):
    """Updates status of lead (e.g. approve/reject via Telegram HITL bot)."""
    try:
        conn = psycopg2.connect(
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            dbname=settings.POSTGRES_DB,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
        )
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE leads SET status = %s WHERE id = %s RETURNING id, status;",
                (req.status, lead_id),
            )
            updated = cur.fetchone()
            conn.commit()
            conn.close()

            if not updated:
                raise HTTPException(status_code=404, detail="Lead not found")
            return {"status": "success", "lead_id": lead_id, "new_status": req.status}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating lead status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/leads/{lead_id}/outreach")
def log_outreach_and_debounce(lead_id: str, req: OutreachLogRequest):
    """
    Logs dispatched outreach message in outreach_logs and registers 14-day debounce in message_dedup.
    """
    try:
        conn = psycopg2.connect(
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            dbname=settings.POSTGRES_DB,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
        )
        with conn.cursor() as cur:
            # 1. Insert outreach log
            cur.execute(
                """
                INSERT INTO outreach_logs (lead_id, channel, recipient_address, message_content, sent_status, sent_at)
                VALUES (%s, %s, %s, %s, %s, NOW())
                RETURNING id;
                """,
                (lead_id, req.channel, req.recipient_address, req.message_content, req.sent_status),
            )
            log_id = cur.fetchone()[0]

            # 2. Insert or update deduplication cooldown table
            dedup_fp = dedup_manager.compute_fingerprint(
                source="outreach",
                phone=req.recipient_address if req.recipient_address.startswith("+") else None,
                email=req.recipient_address if "@" in req.recipient_address else None,
                external_id=f"{req.channel}:{req.recipient_address}",
            )

            cur.execute(
                """
                INSERT INTO message_dedup (fingerprint, lead_id, channel, recipient, last_contacted_at, debounce_until)
                VALUES (%s, %s, %s, %s, NOW(), NOW() + INTERVAL '%s days')
                ON CONFLICT (fingerprint) DO UPDATE
                SET last_contacted_at = NOW(),
                    debounce_until = NOW() + INTERVAL '%s days',
                    contact_count = message_dedup.contact_count + 1;
                """,
                (dedup_fp, lead_id, req.channel, req.recipient_address, req.debounce_days, req.debounce_days),
            )

            # Update lead status to 'contacted'
            cur.execute("UPDATE leads SET status = 'contacted' WHERE id = %s;", (lead_id,))

            conn.commit()
            conn.close()

            # Also set debounce in Redis
            dedup_manager.set_debounce(req.recipient_address, req.channel, cooldown_days=req.debounce_days)

            return {"status": "success", "outreach_log_id": log_id, "cooldown_days": req.debounce_days}
    except Exception as e:
        logger.error(f"Error logging outreach: {e}")
        raise HTTPException(status_code=500, detail=str(e))
