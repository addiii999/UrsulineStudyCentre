-- ============================================================
-- MIGRATION: Add password authentication to students
-- Run this ONCE in: Supabase → SQL Editor → New Query → Run All
-- ============================================================

-- 1. Add password_hash column
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- NOTE:
-- Existing students will have password_hash = NULL.
-- The login API will securely fall back to using their Date of Birth (YYYY-MM-DD)
-- for their first login, and then automatically generate and save their bcrypt hash.
