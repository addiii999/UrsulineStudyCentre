-- =====================================================================
-- URSULINE STUDY CENTRE — PENDING REGISTRATIONS TABLE
-- Run this in Supabase SQL Editor ONCE.
-- This table stores OTP + form data BEFORE final registration.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.pending_registrations (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email         TEXT        NOT NULL,
  name          TEXT        NOT NULL DEFAULT '',
  otp_code      TEXT        NOT NULL,
  otp_expires_at TIMESTAMPTZ NOT NULL,
  otp_attempts  INTEGER     DEFAULT 0,
  form_data     JSONB,      -- stores full form payload temporarily
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Unique index on email so upsert works
CREATE UNIQUE INDEX IF NOT EXISTS idx_pending_reg_email
  ON public.pending_registrations (email);

-- Auto-expire old records after 30 minutes (cleaned up by index)
CREATE INDEX IF NOT EXISTS idx_pending_reg_expires
  ON public.pending_registrations (otp_expires_at);

-- RLS: service role only
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- DONE!
-- =====================================================================
