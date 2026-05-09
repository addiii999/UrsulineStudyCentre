-- =====================================================================
-- URSULINE STUDY CENTRE — STUDENT AUTH MIGRATION
-- Run this in Supabase SQL Editor before deploying the auth system.
-- Safe to re-run — all statements are idempotent (IF NOT EXISTS).
-- =====================================================================

-- 1. Add authentication columns to students table
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS email             TEXT,
  ADD COLUMN IF NOT EXISTS password_hash     TEXT,
  ADD COLUMN IF NOT EXISTS email_verified    BOOLEAN     DEFAULT false,
  ADD COLUMN IF NOT EXISTS otp_code          TEXT,
  ADD COLUMN IF NOT EXISTS otp_expires_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS otp_attempts      INTEGER     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS approval_status   TEXT        DEFAULT 'pending'
    CHECK (approval_status IN ('pending','approved','rejected')),
  ADD COLUMN IF NOT EXISTS is_deleted        BOOLEAN     DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by        TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact TEXT;

-- 2. Add authentication columns to enquiries table (for soft-delete support)
ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS is_deleted  BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by  TEXT,
  ADD COLUMN IF NOT EXISTS student_id  UUID REFERENCES public.students(id) ON DELETE SET NULL;

-- 3. Add login_attempts table for brute-force protection
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address  TEXT,
  email       TEXT,
  is_success  BOOLEAN     DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 4. Indexes for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_email    ON public.students (email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_students_phone           ON public.students (present_phone);
CREATE INDEX IF NOT EXISTS idx_students_deleted         ON public.students (is_deleted, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time   ON public.login_attempts (ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email     ON public.login_attempts (email, is_success, created_at DESC);

-- 5. RLS on login_attempts (service role only)
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
-- No public access; only service role (used via createAdminClient) can write/read.

-- 6. Update existing students' approval_status default if needed
UPDATE public.students
SET approval_status = 'pending'
WHERE approval_status IS NULL;

-- =====================================================================
-- DONE. Now update Vercel env vars:
--   ADMIN_USERNAME=ursulinestudycentre@gmail.com
--   ADMIN_PASSWORD_HASH=<bcrypt hash>
--   JWT_SECRET=<random 32-char secret>
-- =====================================================================
