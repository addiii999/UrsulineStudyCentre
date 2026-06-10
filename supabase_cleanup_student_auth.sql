-- =====================================================================
-- URSULINE STUDY CENTRE — STUDENT AUTHENTICATION CLEANUP
-- =====================================================================
-- This script completely removes the unused student authentication 
-- and login tracking tables/columns from the database.
--
-- INSTRUCTIONS:
-- Copy and paste this script into your Supabase SQL Editor and click "Run".
-- =====================================================================

-- 1. Drop unused authentication tracking tables
DROP TABLE IF EXISTS public.pending_registrations;
DROP TABLE IF EXISTS public.login_attempts;

-- 2. Drop unused authentication columns from the students table
ALTER TABLE public.students
  DROP COLUMN IF EXISTS password_hash,
  DROP COLUMN IF EXISTS email_verified,
  DROP COLUMN IF EXISTS otp_code,
  DROP COLUMN IF EXISTS otp_expires_at,
  DROP COLUMN IF EXISTS otp_attempts,
  DROP COLUMN IF EXISTS approval_status;

-- 3. Drop auth-related indexes if they still exist
DROP INDEX IF EXISTS public.idx_login_attempts_ip_time;
DROP INDEX IF EXISTS public.idx_login_attempts_email;
DROP INDEX IF EXISTS public.idx_pending_reg_email;
DROP INDEX IF EXISTS public.idx_pending_reg_expires;

-- Note: We are keeping the `email` column as it is useful for admin records.
-- We are also keeping the `is_deleted` and `deleted_at` columns as they are 
-- used for the soft-delete/recovery feature in the admin panel.

-- =====================================================================
-- CLEANUP COMPLETE!
-- =====================================================================
