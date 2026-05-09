-- =====================================================================
-- URSULINE STUDY CENTRE — STUDENT AUTH MIGRATION
-- =====================================================================
-- IMPORTANT: To avoid "column does not exist" parsing errors in Supabase,
-- please run PHASE 1 first. Once it completes successfully, run PHASE 2.
-- =====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- ⚠️ PHASE 1: CREATE COLUMNS AND TABLES (Highlight and run this first)
-- ─────────────────────────────────────────────────────────────────────

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

-- 2. Add authentication columns to enquiries table
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

-- Ensure columns exist in case the table was created previously
ALTER TABLE public.login_attempts
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS is_success BOOLEAN DEFAULT false;

-- ─────────────────────────────────────────────────────────────────────
-- ⚠️ PHASE 2: INDEXES AND UPDATES
-- Using a DO block with EXECUTE prevents Postgres from trying to parse 
-- the 'email' column before Phase 1 creates it.
-- ─────────────────────────────────────────────────────────────────────

DO $$ 
BEGIN
  -- 4. Indexes for fast lookups
  EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS idx_students_email ON public.students (email) WHERE email IS NOT NULL';
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_students_phone ON public.students (present_phone)';
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_students_deleted ON public.students (is_deleted, created_at DESC)';
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON public.login_attempts (ip_address, created_at DESC)';
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts (email, is_success, created_at DESC)';

  -- 6. Update existing students' approval_status default if needed
  EXECUTE 'UPDATE public.students SET approval_status = ''pending'' WHERE approval_status IS NULL';
END $$;

-- 5. RLS on login_attempts
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- DONE!
-- =====================================================================
