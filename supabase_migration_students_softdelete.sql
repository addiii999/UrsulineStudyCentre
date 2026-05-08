-- ============================================================
-- MIGRATION: Add soft-delete support to students table
-- Run this ONCE in: Supabase → SQL Editor → New Query → Run All
-- Safe to re-run — all statements use IF NOT EXISTS / IF EXISTS
-- ============================================================

-- 1. Add is_deleted column
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS is_deleted   BOOLEAN     DEFAULT false;

-- 2. Add deleted_at column
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS deleted_at   TIMESTAMPTZ DEFAULT NULL;

-- 3. Add deleted_by column (records which admin deleted it)
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS deleted_by   TEXT        DEFAULT NULL;

-- 4. Add emergency_contact column (used by student portal settings)
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS emergency_contact TEXT   DEFAULT NULL;

-- 5. Backfill: ensure no existing records are accidentally marked deleted
UPDATE public.students
  SET is_deleted = false
  WHERE is_deleted IS NULL;

-- 6. Index for fast trash queries
CREATE INDEX IF NOT EXISTS idx_students_is_deleted
  ON public.students (is_deleted, deleted_at DESC);

-- 7. Ensure audit_logs table exists (required by the app)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    action      TEXT        NOT NULL,
    table_name  TEXT        NOT NULL,
    item_id     TEXT,
    item_label  TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- 8. Also add is_deleted + deleted_at to enquiries if missing
ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS is_deleted   BOOLEAN     DEFAULT false;
ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS deleted_at   TIMESTAMPTZ DEFAULT NULL;

UPDATE public.enquiries
  SET is_deleted = false
  WHERE is_deleted IS NULL;

-- ============================================================
-- DONE. Run this in Supabase SQL Editor, then reload your app.
-- ============================================================
