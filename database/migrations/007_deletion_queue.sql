-- =====================================================================
-- URSULINE STUDY CENTRE — SCHEDULED DELETION QUEUE
-- Run this in Supabase SQL Editor ONCE.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.deletion_queue (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id        UUID        NOT NULL,
  student_name      TEXT        NOT NULL,
  student_phone     TEXT,
  student_class     TEXT,
  deleted_by        TEXT        NOT NULL DEFAULT 'admin',
  deletion_requested_at TIMESTAMPTZ DEFAULT now(),
  scheduled_deletion_at TIMESTAMPTZ NOT NULL,  -- 30 days from request
  purged_at         TIMESTAMPTZ,               -- set when auto-purged
  is_purged         BOOLEAN     DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- Index for cleanup job efficiency
CREATE INDEX IF NOT EXISTS idx_deletion_queue_scheduled
  ON public.deletion_queue (scheduled_deletion_at)
  WHERE is_purged = false;

-- RLS: service role only
ALTER TABLE public.deletion_queue ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- DONE!
-- =====================================================================
