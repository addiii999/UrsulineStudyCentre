-- ============================================================
-- MIGRATION: Security Hardening & Rate Limiting
-- Run this ONCE in: Supabase → SQL Editor → New Query → Run All
-- ============================================================

-- 1. Create login_attempts table to prevent brute force
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address    TEXT        NOT NULL,
    username      TEXT,
    is_success    BOOLEAN     DEFAULT false,
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. Index for fast rate-limit checks
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time 
    ON public.login_attempts (ip_address, created_at DESC);

-- 3. Add IP Address column to audit_logs for better tracking
ALTER TABLE public.audit_logs
    ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- 4. Secure the tables (RLS)
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
-- No public access to login attempts
CREATE POLICY "admin_only_login_attempts" ON public.login_attempts
    FOR ALL USING (false);

-- ============================================================
-- DONE. This migration enables server-side brute force protection.
-- ============================================================
