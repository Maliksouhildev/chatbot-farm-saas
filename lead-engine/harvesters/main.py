# =============================================================================
# Lead Engine Harvesters API Gateway & Scheduler (FastAPI + APScheduler)
# Provides REST endpoints for n8n orchestration, real-time Telethon listener,
# autonomous multi-source scheduling, dual-engine AI qualification, and web cockpit
# =============================================================================

import os
import sys
import logging
import asyncio
from contextlib import asynccontextmanager
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel, Field
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import psycopg2
from psycopg2.extras import RealDictCursor
import httpx

# Ensure harvester submodules are in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "active_intent"))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "passive_fit"))

from config import settings, normalize_algerian_phone
from redis_dedup import dedup_manager
from ai_qualifier import ai_qualifier
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
# AUTONOMOUS PIPELINE HELPERS
# =============================================================================

async def run_auto_qualification_batch(limit: int = 50) -> Dict[str, Any]:
    """
    Fetches leads with status='new' or unassigned score, executes dual-engine AI qualification
    (OpenAI / Gemini / Heuristic NLP), persists results to PostgreSQL, and forwards high-scoring
    leads (score >= 7) to Telegram HITL / n8n webhook.
    """
    logger.info("Executing scheduled/on-demand AI lead qualification batch...")
    qualified_count = 0
    high_intent_count = 0

    try:
        conn = psycopg2.connect(
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            dbname=settings.POSTGRES_DB,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            connect_timeout=5,
        )
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, fingerprint, source, target_market, country, lead_category, sub_niche,
                       name, company_name, contact_phone, contact_whatsapp, contact_telegram,
                       contact_instagram, contact_email, website_url, location_wilaya, category_niche,
                       raw_content, detected_language, identified_pain_points, proposed_service,
                       ai_fit_score, status
                FROM leads
                WHERE status = 'new' OR ai_fit_score = 0
                ORDER BY created_at ASC
                LIMIT %s;
                """,
                (limit,),
            )
            unscored = cur.fetchall()

            for lead in unscored:
                # 1. Evaluate lead through Dual-Engine AI Qualifier
                eval_res = await ai_qualifier.qualify_lead(lead)
                score = eval_res.get("ai_fit_score", 5)
                is_high_intent = score >= 7
                next_status = "hitl_pending" if is_high_intent else "scored"

                # 2. Persist evaluated attributes to database
                cur.execute(
                    """
                    UPDATE leads
                    SET ai_fit_score = %s,
                        ai_scoring_reasoning = %s,
                        ai_pitch_draft = %s,
                        proposed_service = COALESCE(%s, proposed_service),
                        country = COALESCE(%s, country),
                        lead_category = COALESCE(%s, lead_category),
                        sub_niche = COALESCE(%s, sub_niche),
                        status = %s
                    WHERE id = %s;
                    """,
                    (
                        score,
                        eval_res.get("ai_scoring_reasoning", ""),
                        eval_res.get("ai_pitch_draft", ""),
                        eval_res.get("proposed_service"),
                        eval_res.get("country"),
                        eval_res.get("lead_category"),
                        eval_res.get("sub_niche"),
                        next_status,
                        lead["id"],
                    ),
                )
                qualified_count += 1
                if is_high_intent:
                    high_intent_count += 1

                # 3. Notify n8n HITL webhook if high intent lead detected
                if is_high_intent:
                    try:
                        async with httpx.AsyncClient(timeout=3.0) as client:
                            payload = {
                                "lead_id": str(lead["id"]),
                                "fingerprint": lead["fingerprint"],
                                "name": lead["name"],
                                "company_name": lead["company_name"],
                                "country": eval_res.get("country", lead["country"]),
                                "lead_category": eval_res.get("lead_category", lead["lead_category"]),
                                "sub_niche": eval_res.get("sub_niche", lead["sub_niche"]),
                                "contact_phone": lead["contact_phone"],
                                "contact_whatsapp": lead["contact_whatsapp"],
                                "contact_telegram": lead["contact_telegram"],
                                "contact_instagram": lead["contact_instagram"],
                                "ai_fit_score": score,
                                "ai_scoring_reasoning": eval_res.get("ai_scoring_reasoning"),
                                "detected_bottleneck": eval_res.get("detected_bottleneck"),
                                "proposed_service": eval_res.get("proposed_service"),
                                "ai_pitch_draft": eval_res.get("ai_pitch_draft"),
                                "source": lead["source"],
                            }
                            # Send to HITL webhook (non-blocking)
                            await client.post("http://n8n:5678/webhook/telegram-hitl-trigger", json=payload)
                    except Exception as notify_err:
                        logger.debug(f"Direct n8n trigger notification standby: {notify_err}")

            conn.commit()
        conn.close()
        logger.info(f"Auto-qualification completed: {qualified_count} scored, {high_intent_count} high intent.")
        return {"status": "success", "qualified_count": qualified_count, "high_intent_count": high_intent_count}

    except Exception as e:
        logger.error(f"Error in auto-qualification batch: {e}")
        return {"status": "error", "message": str(e), "qualified_count": qualified_count}


# =============================================================================
# LIFESPAN & BACKGROUND WORKERS
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Lead Engine API and background scheduler...")

    # 1. Recurring Reddit buyer intent scraper (every 30 mins)
    scheduler.add_job(
        func=lambda: reddit_harvester.harvest(limit_per_sub=15),
        trigger="interval",
        minutes=30,
        id="scheduled_reddit_harvest",
        name="Hourly Reddit Harvester",
        replace_existing=True,
    )

    # 2. Recurring Ouedkniss Pro Store scraper (every 60 mins)
    scheduler.add_job(
        func=lambda: asyncio.create_task(ouedkniss_harvester.harvest_stores(max_pages=2)),
        trigger="interval",
        minutes=60,
        id="scheduled_ouedkniss_harvest",
        name="Ouedkniss Pro Store Scraper",
        replace_existing=True,
    )

    # 3. Recurring Google Dork e-commerce scanner (every 90 mins)
    scheduler.add_job(
        func=lambda: asyncio.create_task(dork_harvester.harvest_dorks(max_results_per_dork=15)),
        trigger="interval",
        minutes=90,
        id="scheduled_dork_harvest",
        name="Google Dorks Instagram/FB Scraper",
        replace_existing=True,
    )

    # 4. Recurring Google Maps local business auditor (every 180 mins)
    scheduler.add_job(
        func=lambda: asyncio.create_task(
            gmaps_auditor.audit_niche(query="Clinique médicale", location="Alger, Algérie", max_results=15)
        ),
        trigger="interval",
        minutes=180,
        id="scheduled_gmaps_audit",
        name="Google Maps Local Business Auditor",
        replace_existing=True,
    )

    # 5. Recurring Autonomous AI Qualification & Scoring Loop (every 10 mins)
    scheduler.add_job(
        func=lambda: asyncio.create_task(run_auto_qualification_batch(limit=25)),
        trigger="interval",
        minutes=10,
        id="scheduled_auto_qualification",
        name="Autonomous AI Lead Qualification & Pitch Generator",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("APScheduler started with 5 orchestrated autonomous recurring background jobs.")

    # 6. Launch Telegram MTProto listener in non-blocking background task
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
    version="2.5.0",
    description="Autonomous microservice for active & passive lead acquisition in Algeria and Global markets.",
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

class InstantWhatsAppRequest(BaseModel):
    lead_id: str
    recipient: str
    message: str

class AIScoreRequest(BaseModel):
    ai_fit_score: int = Field(ge=0, le=100)
    ai_scoring_reasoning: str
    ai_pitch_draft: str
    proposed_service: Optional[str] = None
    country: Optional[str] = None
    lead_category: Optional[str] = None
    sub_niche: Optional[str] = None

class MarkSyncedRequest(BaseModel):
    lead_ids: List[str] = Field(description="List of lead UUIDs successfully synced to Google Sheets")


# =============================================================================
# WEB DASHBOARD & COCKPIT ROUTES
# =============================================================================

@app.get("/", response_class=HTMLResponse)
@app.get("/dashboard", response_class=HTMLResponse)
def serve_dashboard():
    """Serves the Mission Control Executive Cockpit."""
    dashboard_path = os.path.join(os.path.dirname(__file__), "dashboard.html")
    if os.path.exists(dashboard_path):
        with open(dashboard_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse("<h1>Lead Engine Dashboard file not found</h1>", status_code=404)


@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    """Returns aggregated pipeline metrics for the real-time cockpit."""
    try:
        conn = psycopg2.connect(
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            dbname=settings.POSTGRES_DB,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            connect_timeout=3,
        )
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT 
                    COUNT(*) AS total,
                    COUNT(*) FILTER (WHERE ai_fit_score >= 7) AS high_intent,
                    COUNT(*) FILTER (WHERE status = 'hitl_pending') AS hitl_pending,
                    COUNT(*) FILTER (WHERE status = 'approved') AS approved,
                    COUNT(*) FILTER (WHERE status = 'contacted') AS contacted,
                    COUNT(*) FILTER (WHERE synced_to_sheets = TRUE) AS synced_to_sheets
                FROM leads;
                """
            )
            row = cur.fetchone()
            conn.close()

            return {
                "total": row[0] or 0,
                "high_intent": row[1] or 0,
                "hitl_pending": row[2] or 0,
                "approved": row[3] or 0,
                "contacted": row[4] or 0,
                "synced_to_sheets": row[5] or 0,
            }
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        return {
            "total": 0,
            "high_intent": 0,
            "hitl_pending": 0,
            "approved": 0,
            "contacted": 0,
            "synced_to_sheets": 0,
        }


# =============================================================================
# CORE API ROUTES
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
            "jobs_count": len(scheduler.get_jobs()),
        },
    }


@app.post("/leads/auto-qualify")
async def trigger_auto_qualify(bg: BackgroundTasks, limit: int = Query(default=50, ge=1, le=200)):
    """Triggers immediate AI scoring & pitch generation on all unscored leads."""
    res = await run_auto_qualification_batch(limit=limit)
    return res


@app.post("/harvest/reddit")
async def trigger_reddit_harvest(req: RedditHarvestRequest, bg: BackgroundTasks):
    """Triggers Reddit OAuth2 harvest across buyer-intent subreddits."""
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
        reddit_harvester.harvest(limit_per_sub=15)
        await ouedkniss_harvester.harvest_stores(max_pages=2)
        await dork_harvester.harvest_dorks(max_results_per_dork=15)
        await gmaps_auditor.audit_niche(query="Clinique médicale", location="Alger, Algérie", max_results=15)
        await run_auto_qualification_batch(limit=50)
        logger.info("Full harvest batch & AI qualification complete.")

    bg.add_task(_batch)
    return {"message": "Full omnichannel harvest batch initiated in background."}


@app.get("/leads")
def get_leads(
    status: Optional[str] = None,
    target_market: Optional[str] = None,
    country: Optional[str] = None,
    lead_category: Optional[str] = None,
    synced_to_sheets: Optional[bool] = None,
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
            if country:
                filters.append("country = %s")
                params.append(country)
            if lead_category:
                filters.append("lead_category = %s")
                params.append(lead_category)
            if synced_to_sheets is not None:
                filters.append("synced_to_sheets = %s")
                params.append(synced_to_sheets)
            if source:
                filters.append("source = %s")
                params.append(source)

            where_clause = " AND ".join(filters)
            params.extend([limit, offset])

            query = f"""
                SELECT id, fingerprint, source, target_market, country, lead_category, sub_niche,
                       name, company_name, contact_phone, contact_whatsapp, contact_telegram,
                       contact_instagram, contact_email, website_url, location_wilaya, category_niche,
                       detected_language, identified_pain_points, proposed_service,
                       ai_fit_score, ai_scoring_reasoning, ai_pitch_draft, status,
                       synced_to_sheets, created_at
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
    """Updates AI qualification score, reasoning, pitch draft, and classification."""
    try:
        conn = psycopg2.connect(
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            dbname=settings.POSTGRES_DB,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
        )
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            is_high_intent = req.ai_fit_score >= 70 or (req.ai_fit_score >= 7 and req.ai_fit_score <= 10)
            next_status = "hitl_pending" if is_high_intent else "scored"
            cur.execute(
                """
                UPDATE leads
                SET ai_fit_score = %s,
                    ai_scoring_reasoning = %s,
                    ai_pitch_draft = %s,
                    proposed_service = COALESCE(%s, proposed_service),
                    country = COALESCE(%s, country),
                    lead_category = COALESCE(%s, lead_category),
                    sub_niche = COALESCE(%s, sub_niche),
                    status = %s
                WHERE id = %s
                RETURNING id, name, country, lead_category, ai_fit_score, status;
                """,
                (
                    req.ai_fit_score,
                    req.ai_scoring_reasoning,
                    req.ai_pitch_draft,
                    req.proposed_service,
                    req.country,
                    req.lead_category,
                    req.sub_niche,
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


@app.post("/leads/mark-synced")
def mark_leads_synced(req: MarkSyncedRequest):
    """Marks a list of lead UUIDs as synchronized to Google Sheets."""
    if not req.lead_ids:
        return {"status": "success", "synced_count": 0}
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
                """
                UPDATE leads
                SET synced_to_sheets = TRUE
                WHERE id = ANY(%s::uuid[])
                RETURNING id;
                """,
                (req.lead_ids,),
            )
            updated_rows = cur.fetchall()
            conn.commit()
            conn.close()
            return {"status": "success", "synced_count": len(updated_rows)}
    except Exception as e:
        logger.error(f"Error marking leads synced: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/leads/{lead_id}/status")
def update_lead_status(lead_id: str, req: StatusUpdateRequest):
    """Updates status of lead (e.g. approve/reject via Telegram HITL bot or dashboard)."""
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
    """Logs dispatched outreach message in outreach_logs and registers 14-day debounce in message_dedup."""
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
                """
                INSERT INTO outreach_logs (lead_id, channel, recipient_address, message_content, sent_status, sent_at)
                VALUES (%s, %s, %s, %s, %s, NOW())
                RETURNING id;
                """,
                (lead_id, req.channel, req.recipient_address, req.message_content, req.sent_status),
            )
            log_id = cur.fetchone()[0]

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

            cur.execute("UPDATE leads SET status = 'contacted' WHERE id = %s;", (lead_id,))
            conn.commit()
            conn.close()

            dedup_manager.set_debounce(req.recipient_address, req.channel, cooldown_days=req.debounce_days)

            return {"status": "success", "outreach_log_id": log_id, "cooldown_days": req.debounce_days}
    except Exception as e:
        logger.error(f"Error logging outreach: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/outreach/instant-whatsapp")
async def instant_whatsapp_outreach(req: InstantWhatsAppRequest):
    """
    Directly dispatches an automated WhatsApp pitch via Evolution API.
    Enforces the 14-day anti-spam cooldown and updates status to 'contacted'.
    """
    clean_digits = "".join(filter(str.isdigit, req.recipient))
    evolution_url = os.getenv("EVOLUTION_API_URL", "http://localhost:8080")
    instance = os.getenv("EVOLUTION_INSTANCE_NAME", "lead_dispatch")
    api_key = os.getenv("EVOLUTION_API_KEY", "")

    # Check 14-day debounce in Redis first
    if dedup_manager.is_debounced(req.recipient, "whatsapp"):
        raise HTTPException(status_code=429, detail="Recipient is within active 14-day cooldown window.")

    sent_status = "sent"
    error_msg = None

    try:
        headers = {"apikey": api_key, "Content-Type": "application/json"}
        payload = {
            "number": clean_digits,
            "options": {"delay": 1500, "presence": "composing"},
            "text": req.message,
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(f"{evolution_url}/message/sendText/{instance}", headers=headers, json=payload)
            if resp.status_code not in [200, 201]:
                sent_status = "simulated_standby"
                error_msg = f"Evolution response {resp.status_code}: {resp.text}"
    except Exception as e:
        sent_status = "simulated_standby"
        error_msg = str(e)

    # Log in database and trigger 14-day debounce
    log_req = OutreachLogRequest(
        channel="whatsapp",
        recipient_address=req.recipient,
        message_content=req.message,
        sent_status=sent_status,
        debounce_days=14,
    )
    log_outreach_and_debounce(req.lead_id, log_req)

    return {
        "status": "success",
        "delivery_state": sent_status,
        "detail": error_msg or "Message dispatched successfully",
    }
