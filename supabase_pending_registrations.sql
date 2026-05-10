-- =====================================================================
-- URSULINE STUDY CENTRE — PENDING REGISTRATIONS TABLE (v2)
-- Run this in Supabase SQL Editor.
-- If you already ran v1, just run the ALTER TABLE at the bottom.
-- =====================================================================

-- Create table (safe if already exists)
CREATE TABLE IF NOT EXISTS public.pending_registrations (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email          TEXT        NOT NULL,
  name           TEXT        NOT NULL DEFAULT '',
  otp_code       TEXT        NOT NULL,
  otp_expires_at TIMESTAMPTZ NOT NULL,
  otp_attempts   INTEGER     DEFAULT 0,
  verified       BOOLEAN     DEFAULT false,   -- TRUE after correct OTP
  form_data      JSONB,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Add 'verified' column if table already existed without it
ALTER TABLE public.pending_registrations
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- Unique index on email so upsert works
CREATE UNIQUE INDEX IF NOT EXISTS idx_pending_reg_email
  ON public.pending_registrations (email);

-- Index for expiry cleanup
CREATE INDEX IF NOT EXISTS idx_pending_reg_expires
  ON public.pending_registrations (otp_expires_at);

-- RLS: service role only
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- DONE!
-- =====================================================================
