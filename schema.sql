-- =====================================================================
-- CHATBOT FARM SAAS: SUPABASE DATABASE SCHEMA WITH PGVECTOR
-- Multi-Tenant WhatsApp & Omnichannel Chatbot Platform (Algeria Edition)
-- =====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Organizations / Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    company_name TEXT,
    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Subscriptions & Credit Balances
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_tier TEXT DEFAULT 'starter' CHECK (plan_tier IN ('trial', 'starter', 'pro', 'byok', 'enterprise')),
    status TEXT DEFAULT 'active' CHECK (status IN ('trial', 'active', 'past_due', 'suspended', 'cancelled')),
    monthly_message_quota INT DEFAULT 1500,
    messages_used INT DEFAULT 0,
    credits_remaining INT DEFAULT 1500,
    byok_openai_key TEXT, -- Encrypted or client-supplied API key
    billing_gateway TEXT DEFAULT 'chargily' CHECK (billing_gateway IN ('chargily', 'baridimob', 'manual')),
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_subscription UNIQUE(user_id)
);

-- 4. Payment Receipts (BaridiMob & Chargily Transactions)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount_dzd NUMERIC(12, 2) NOT NULL,
    plan_tier TEXT NOT NULL,
    gateway TEXT NOT NULL CHECK (gateway IN ('chargily', 'baridimob')),
    chargily_invoice_id TEXT,
    receipt_image_url TEXT, -- For BaridiMob screenshot
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    verified_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bots (Chatbot Tenants)
CREATE TABLE IF NOT EXISTS public.bots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    business_type TEXT DEFAULT 'retail',
    primary_language TEXT DEFAULT 'darija_latin' CHECK (primary_language IN ('darija_latin', 'darija_arabic', 'french', 'standard_arabic', 'english')),
    enabled_languages JSONB DEFAULT '["darija_latin", "darija_arabic", "french"]'::jsonb,
    base_persona TEXT NOT NULL DEFAULT 'You are a warm, respectful Algerian customer service assistant.',
    custom_system_prompt TEXT DEFAULT '',
    contact_human_number TEXT, -- E.g. "0550123456" for order escalation
    auto_mute_minutes INT DEFAULT 30, -- Mute duration when human operator replies
    voice_notes_enabled BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Omnichannel Instances (WhatsApp / Evolution API, Telegram, Instagram)
CREATE TABLE IF NOT EXISTS public.bot_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE NOT NULL,
    channel_type TEXT NOT NULL CHECK (channel_type IN ('whatsapp', 'telegram', 'instagram', 'facebook')),
    instance_name TEXT NOT NULL UNIQUE, -- E.g. "inst_usr123_bot456" in Evolution API
    channel_identifier TEXT, -- WhatsApp phone number or @bot username
    auth_token TEXT, -- Telegram bot token or Evolution API token
    status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'connecting', 'qr_ready', 'disconnected')),
    qr_code_base64 TEXT,
    last_connected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Knowledge Base Documents (Files, URLs, FAQs)
CREATE TABLE IF NOT EXISTS public.knowledge_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('file_pdf', 'file_excel', 'website_url', 'faq_text')),
    title TEXT NOT NULL,
    source_url TEXT,
    raw_content TEXT,
    chunk_count INT DEFAULT 0,
    status TEXT DEFAULT 'processed' CHECK (status IN ('pending', 'processing', 'processed', 'error')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Knowledge Embeddings (pgvector store for RAG)
CREATE TABLE IF NOT EXISTS public.knowledge_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE NOT NULL,
    source_id UUID REFERENCES public.knowledge_sources(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(768), -- text-embedding-004 (768 dims)
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create HNSW index for ultra-fast cosine similarity search
CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_hnsw 
ON public.knowledge_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 9. Conversations & Messages (with Smart Human Auto-Mute)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE NOT NULL,
    channel_type TEXT NOT NULL,
    contact_phone TEXT NOT NULL, -- Remote customer JID / phone
    contact_name TEXT,
    is_muted_until TIMESTAMPTZ DEFAULT '1970-01-01 00:00:00+00', -- When human replies directly
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_bot_contact UNIQUE(bot_id, contact_phone)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('customer', 'ai', 'human_operator')),
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'audio', 'image', 'document')),
    content TEXT NOT NULL,
    audio_transcription TEXT,
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- FUNCTIONS & STORED PROCEDURES
-- =====================================================================

-- 1. RAG Similarity Match Function
CREATE OR REPLACE FUNCTION match_knowledge_embeddings(
    query_embedding VECTOR(768),
    match_bot_id UUID,
    match_threshold FLOAT DEFAULT 0.65,
    match_count INT DEFAULT 4
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ke.id,
        ke.content,
        ke.metadata,
        1 - (ke.embedding <=> query_embedding) AS similarity
    FROM public.knowledge_embeddings ke
    WHERE ke.bot_id = match_bot_id
      AND 1 - (ke.embedding <=> query_embedding) > match_threshold
    ORDER BY ke.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 2. Deduct Credit and Validate Subscription Function
CREATE OR REPLACE FUNCTION process_bot_credit_deduction(p_bot_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id UUID;
    v_sub RECORD;
    v_result JSONB;
BEGIN
    -- Get bot owner
    SELECT user_id INTO v_user_id FROM public.bots WHERE id = p_bot_id;
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'bot_not_found');
    END IF;

    -- Get subscription
    SELECT * INTO v_sub FROM public.subscriptions WHERE user_id = v_user_id FOR UPDATE;
    IF v_sub IS NULL THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'no_subscription');
    END IF;

    -- Check if subscription expired
    IF v_sub.current_period_end < NOW() THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'subscription_expired');
    END IF;

    -- Check if BYOK
    IF v_sub.plan_tier = 'byok' THEN
        RETURN jsonb_build_object('allowed', true, 'is_byok', true, 'api_key', v_sub.byok_openai_key);
    END IF;

    -- Check quota
    IF v_sub.credits_remaining <= 0 THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'quota_exceeded');
    END IF;

    -- Deduct 1 credit
    UPDATE public.subscriptions 
    SET credits_remaining = credits_remaining - 1,
        messages_used = messages_used + 1,
        updated_at = NOW()
    WHERE id = v_sub.id;

    RETURN jsonb_build_object('allowed', true, 'is_byok', false, 'credits_left', v_sub.credits_remaining - 1);
END;
$$;

-- 3. Auto-Mute Function (called by n8n when human operator replies)
CREATE OR REPLACE FUNCTION set_conversation_mute(
    p_instance_name TEXT,
    p_contact_phone TEXT,
    p_mute_minutes INT DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_bot_id UUID;
    v_conv_id UUID;
BEGIN
    -- Find bot_id from instance_name
    SELECT bot_id INTO v_bot_id FROM public.bot_channels WHERE instance_name = p_instance_name LIMIT 1;
    IF v_bot_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'reason', 'instance_not_found');
    END IF;

    -- Upsert conversation with mute timestamp
    INSERT INTO public.conversations (bot_id, channel_type, contact_phone, is_muted_until, last_message_at)
    VALUES (v_bot_id, 'whatsapp', p_contact_phone, NOW() + (p_mute_minutes || ' minutes')::INTERVAL, NOW())
    ON CONFLICT (bot_id, contact_phone)
    DO UPDATE SET 
        is_muted_until = NOW() + (p_mute_minutes || ' minutes')::INTERVAL,
        last_message_at = NOW()
    RETURNING id INTO v_conv_id;

    RETURN jsonb_build_object('success', true, 'conversation_id', v_conv_id, 'muted_until', NOW() + (p_mute_minutes || ' minutes')::INTERVAL);
END;
$$;
