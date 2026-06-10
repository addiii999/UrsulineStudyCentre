-- ============================================================
-- SECURITY MIGRATION: Enhanced Audit Logging & Login Tracking
-- Run this in: Supabase → SQL Editor → New Query → Run All
-- Safe to re-run — all statements use IF NOT EXISTS
-- ============================================================

-- 1. Enhance audit_logs table with additional security fields
ALTER TABLE public.audit_logs 
  ADD COLUMN IF NOT EXISTS user_id TEXT,
  ADD COLUMN IF NOT EXISTS user_email TEXT,
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 2. Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip 
  ON public.audit_logs(ip_address);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action_time 
  ON public.audit_logs(action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user 
  ON public.audit_logs(user_email, created_at DESC);

-- 3. Create login_attempts table for brute force protection
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  username TEXT,
  is_success BOOLEAN DEFAULT false,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Add indexes for login_attempts
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time 
  ON public.login_attempts(ip_address, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_login_attempts_success 
  ON public.login_attempts(is_success, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_login_attempts_username 
  ON public.login_attempts(username, created_at DESC);

-- 5. Enable RLS on login_attempts (admin-only access)
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- No public policies - only service role can access

-- 6. Create function to auto-cleanup old login attempts (older than 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM public.login_attempts 
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to check rate limiting at database level
CREATE OR REPLACE FUNCTION public.check_enquiry_rate_limit(
  p_phone TEXT,
  p_hours INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.enquiries
  WHERE phone = p_phone
    AND created_at > NOW() - (p_hours || ' hours')::INTERVAL;
  
  RETURN recent_count < 3; -- Max 3 enquiries per hour
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Add unique constraint on students phone (prevent duplicates)
-- Note: This may fail if duplicates exist - clean them first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'students_present_phone_unique'
  ) THEN
    -- Only add if no duplicates exist
    IF (SELECT COUNT(*) FROM (
      SELECT present_phone, COUNT(*) as cnt 
      FROM public.students 
      WHERE present_phone IS NOT NULL 
      GROUP BY present_phone 
      HAVING COUNT(*) > 1
    ) duplicates) = 0 THEN
      ALTER TABLE public.students 
        ADD CONSTRAINT students_present_phone_unique 
        UNIQUE (present_phone);
    ELSE
      RAISE NOTICE 'Duplicate phone numbers exist. Clean them before adding unique constraint.';
    END IF;
  END IF;
END $$;

-- 9. Add check constraints for data validation
ALTER TABLE public.students 
  ADD CONSTRAINT IF NOT EXISTS students_phone_format 
  CHECK (present_phone ~ '^\d{10}$');

ALTER TABLE public.students 
  ADD CONSTRAINT IF NOT EXISTS students_aadhaar_format 
  CHECK (aadhaar_last4 IS NULL OR length(aadhaar_last4) = 4);

ALTER TABLE public.enquiries 
  ADD CONSTRAINT IF NOT EXISTS enquiries_phone_format 
  CHECK (phone ~ '^\d{10}$');

-- 10. Create function to sanitize text input (remove HTML tags)
CREATE OR REPLACE FUNCTION public.sanitize_text(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove HTML tags
  RETURN regexp_replace(input_text, '<[^>]*>', '', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 11. Add trigger to auto-sanitize enquiry messages
CREATE OR REPLACE FUNCTION public.sanitize_enquiry_message()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.message IS NOT NULL THEN
    NEW.message := public.sanitize_text(NEW.message);
  END IF;
  IF NEW.name IS NOT NULL THEN
    NEW.name := public.sanitize_text(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sanitize_enquiry_before_insert ON public.enquiries;
CREATE TRIGGER sanitize_enquiry_before_insert
  BEFORE INSERT ON public.enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_enquiry_message();

-- 12. Create view for security monitoring (admin dashboard)
CREATE OR REPLACE VIEW public.security_dashboard AS
SELECT 
  'failed_logins_last_hour' as metric,
  COUNT(*)::TEXT as value
FROM public.login_attempts
WHERE is_success = false 
  AND created_at > NOW() - INTERVAL '1 hour'
UNION ALL
SELECT 
  'unique_ips_last_hour' as metric,
  COUNT(DISTINCT ip_address)::TEXT as value
FROM public.login_attempts
WHERE created_at > NOW() - INTERVAL '1 hour'
UNION ALL
SELECT 
  'enquiries_last_hour' as metric,
  COUNT(*)::TEXT as value
FROM public.enquiries
WHERE created_at > NOW() - INTERVAL '1 hour'
UNION ALL
SELECT 
  'suspicious_activities' as metric,
  COUNT(*)::TEXT as value
FROM public.audit_logs
WHERE action = 'suspicious_activity'
  AND created_at > NOW() - INTERVAL '24 hours';

-- 13. Grant necessary permissions
GRANT SELECT ON public.security_dashboard TO authenticated;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Next steps:
-- 1. Verify all tables and indexes were created successfully
-- 2. Test login_attempts tracking
-- 3. Monitor security_dashboard view
-- 4. Set up automated cleanup job for old login attempts
-- ============================================================

-- Optional: Schedule automatic cleanup (run daily)
-- You can set this up in Supabase Dashboard → Database → Cron Jobs
-- Or use pg_cron extension if available:
-- SELECT cron.schedule('cleanup-login-attempts', '0 2 * * *', 'SELECT cleanup_old_login_attempts()');
