-- =============================================================================
-- Lead Engine Database Initialization Schema
-- PostgreSQL 16+ Production Schema for B2B Lead Gen & Omnichannel Outreach
-- Includes Phase 3 & 4: Country, Category, Sub-niche & Google Sheets Sync State
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. LEADS TABLE
-- Stores normalized leads harvested from active & passive sources
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint VARCHAR(64) UNIQUE NOT NULL,             -- SHA-256 hash for deduplication
    source VARCHAR(50) NOT NULL,                         -- 'reddit', 'telegram', 'ouedkniss', 'google_dork', 'gmaps', 'manual'
    external_id VARCHAR(255),                            -- Platform-specific ID (e.g. Reddit post ID, Ouedkniss store ID)
    target_market VARCHAR(20) NOT NULL,                  -- 'algeria', 'global'
    country VARCHAR(100) DEFAULT 'Algeria',              -- e.g. 'Algeria', 'France', 'USA', 'UK', 'UAE'
    lead_category VARCHAR(50) DEFAULT 'PASSIVE_POTENTIAL', -- 'ACTIVE_REQUEST' vs 'PASSIVE_POTENTIAL'
    sub_niche VARCHAR(100),                              -- e.g. 'Dental Clinic', 'Ouedkniss Pro Store', 'SaaS Founder'
    name VARCHAR(255),                                   -- Contact or store name
    company_name VARCHAR(255),                           -- Business name
    contact_email VARCHAR(255),                          -- Contact email
    contact_phone VARCHAR(50),                           -- Cleaned phone (e.g. +213555000000)
    contact_whatsapp VARCHAR(50),                        -- WhatsApp number or direct wa.me link
    contact_telegram VARCHAR(100),                       -- Telegram @username or user_id
    contact_instagram VARCHAR(100),                      -- Instagram handle or profile URL
    contact_facebook VARCHAR(255),                       -- Facebook page or profile URL
    website_url TEXT,                                    -- Existing website if any
    location_wilaya VARCHAR(100),                        -- Algerian Wilaya (1-58) or City/Region
    category_niche VARCHAR(100),                         -- General niche category
    raw_content TEXT,                                    -- Original text, bio, or listing description
    detected_language VARCHAR(10),                       -- 'dar' (Darija/Arabizi), 'ar', 'fr', 'en'
    identified_pain_points TEXT[] DEFAULT '{}',          -- e.g. ARRAY['no_website', 'dm_for_price', 'manual_order_flow']
    proposed_service VARCHAR(100),                       -- 'n8n_automation', 'whatsapp_bot', 'instagram_bot', 'ecommerce_web_dev'
    ai_fit_score INT DEFAULT 0 CHECK (ai_fit_score >= 0 AND ai_fit_score <= 100),
    ai_scoring_reasoning TEXT,                           -- Justification for the qualification score
    ai_pitch_draft TEXT,                                 -- Culturally tailored personalized icebreaker & pitch
    status VARCHAR(50) DEFAULT 'new',                    -- 'new', 'scored', 'hitl_pending', 'approved', 'rejected', 'contacted', 'replied', 'converted', 'blacklisted'
    synced_to_sheets BOOLEAN DEFAULT FALSE,              -- Track synchronization with Google Sheets master tracker
    metadata JSONB DEFAULT '{}'::jsonb,                  -- Flexible JSON payload for extra source-specific attributes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent column migrations for existing databases
ALTER TABLE leads ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Algeria';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_category VARCHAR(50) DEFAULT 'PASSIVE_POTENTIAL';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS sub_niche VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS synced_to_sheets BOOLEAN DEFAULT FALSE;

-- -----------------------------------------------------------------------------
-- 2. OUTREACH LOGS TABLE
-- Records every outreach attempt across all communication channels
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS outreach_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL,                        -- 'whatsapp', 'telegram', 'email', 'reddit_dm', 'instagram_dm'
    recipient_address VARCHAR(255) NOT NULL,             -- Phone number, Telegram handle, email, Reddit username
    message_content TEXT NOT NULL,                       -- Exact message payload dispatched
    sent_status VARCHAR(50) NOT NULL DEFAULT 'draft',    -- 'draft', 'queued', 'sent', 'failed', 'delivered', 'opened', 'replied'
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,                  -- Platform response IDs, webhook callbacks
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. MESSAGE DEDUPLICATION & DEBOUNCE TABLE
-- Enforces cross-channel anti-spam and contact frequency caps (e.g. 14 days cooldown)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS message_dedup (
    fingerprint VARCHAR(64) PRIMARY KEY,                 -- SHA-256 of normalized recipient + channel
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    channel VARCHAR(50) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    last_contacted_at TIMESTAMPTZ DEFAULT NOW(),
    debounce_until TIMESTAMPTZ NOT NULL,                 -- Timestamp before which contact is disallowed
    contact_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. PERFORMANCE & DEDUPLICATION INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_leads_fingerprint ON leads(fingerprint);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_ai_fit_score ON leads(ai_fit_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_target_market ON leads(target_market);
CREATE INDEX IF NOT EXISTS idx_leads_country ON leads(country);
CREATE INDEX IF NOT EXISTS idx_leads_category ON leads(lead_category);
CREATE INDEX IF NOT EXISTS idx_leads_synced_to_sheets ON leads(synced_to_sheets) WHERE synced_to_sheets = FALSE;
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_contact_phone ON leads(contact_phone) WHERE contact_phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_contact_email ON leads(contact_email) WHERE contact_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_outreach_lead_id ON outreach_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_outreach_channel ON outreach_logs(channel);
CREATE INDEX IF NOT EXISTS idx_outreach_sent_status ON outreach_logs(sent_status);
CREATE INDEX IF NOT EXISTS idx_outreach_created_at ON outreach_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dedup_recipient ON message_dedup(recipient);
CREATE INDEX IF NOT EXISTS idx_dedup_debounce_until ON message_dedup(debounce_until);

-- -----------------------------------------------------------------------------
-- 5. AUTOMATIC TIMESTAMP TRIGGER
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_leads_updated_at ON leads;
CREATE TRIGGER trg_leads_updated_at
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 6. ANALYTICAL & BATCH SYNC VIEWS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_lead_pipeline_summary AS
SELECT 
    country,
    target_market,
    lead_category,
    source,
    status,
    COUNT(*) AS total_count,
    ROUND(AVG(ai_fit_score), 1) AS avg_fit_score,
    COUNT(*) FILTER (WHERE ai_fit_score >= 70) AS high_intent_count
FROM leads
GROUP BY country, target_market, lead_category, source, status
ORDER BY total_count DESC;

CREATE OR REPLACE VIEW v_ready_for_sheets_sync AS
SELECT 
    id,
    created_at::DATE AS lead_date,
    COALESCE(country, 'Algeria') AS country,
    COALESCE(lead_category, 'PASSIVE_POTENTIAL') AS lead_category,
    COALESCE(company_name, name, 'Unknown Business') AS business_name,
    COALESCE(sub_niche, category_niche, 'General') AS sub_niche,
    ARRAY_TO_STRING(identified_pain_points, ', ') AS detected_bottleneck,
    COALESCE(contact_phone, contact_whatsapp, contact_email, contact_telegram, contact_instagram, 'N/A') AS contact_info,
    COALESCE(website_url, metadata->>'permalink', source) AS source_url,
    status AS outreach_status,
    ai_fit_score,
    ai_pitch_draft
FROM leads
WHERE synced_to_sheets = FALSE
  AND created_at >= NOW() - INTERVAL '48 hours'
ORDER BY created_at ASC;

CREATE OR REPLACE VIEW v_midnight_outreach_queue AS
SELECT 
    l.id AS lead_id,
    l.name,
    l.company_name,
    l.country,
    l.target_market,
    l.source,
    l.lead_category,
    l.ai_fit_score,
    l.proposed_service,
    l.contact_phone,
    l.contact_whatsapp,
    l.contact_telegram,
    l.contact_email,
    l.ai_pitch_draft,
    l.status
FROM leads l
WHERE l.status = 'approved'
  AND NOT EXISTS (
      SELECT 1 FROM message_dedup md 
      WHERE (md.recipient = l.contact_phone OR md.recipient = l.contact_email OR md.recipient = l.contact_telegram)
        AND md.debounce_until > NOW()
  )
ORDER BY l.ai_fit_score DESC, l.created_at ASC;
