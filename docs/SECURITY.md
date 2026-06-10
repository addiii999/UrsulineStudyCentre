# Security Reference — Ursuline Study Centre

**Last Updated:** June 2026  
**Status:** Production-Ready

---

## Overview

This document is the single source of truth for all security practices, configurations, and procedures for the Ursuline Study Centre platform.

---

## Architecture

| Layer | Protection |
|-------|-----------|
| **Middleware** | Admin route protection, CSRF, rate limiting, security headers (`src/middleware.ts`) |
| **API** | Zod input validation, DOMPurify XSS sanitization, per-route rate limiting |
| **Authentication** | JWT-based admin sessions (2-hour expiry), bcrypt password hashing |
| **File Uploads** | Magic number verification, 5MB limit, WebP conversion, secure filenames |
| **Database** | Supabase RLS policies, audit logs, login attempt tracking |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_APP_URL=https://ursulinestudycentre.com

ADMIN_USERNAME=ursulinestudycentre@gmail.com
ADMIN_PASSWORD_HASH=<bcrypt_hash>
ADMIN_SESSION_SECRET=<random_32_bytes>
JWT_SECRET=<random_32_bytes>

EMAIL_USER=ursulinestudycentre@gmail.com
EMAIL_PASS=<gmail_app_password>

CRON_SECRET=<random_hex_32>
```

**Generate secrets:**
```bash
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Max 256) }))
```

---

## Middleware Security (`src/middleware.ts`)

Automatically protects every request matching `/api/*` and `/admin/*`:

- **Admin Route Protection** — Redirects unauthenticated requests to `/admin/login`
- **CSRF Protection** — Blocks cross-origin mutation requests in production
- **Rate Limiting** — 100 req/min general; 20 req/min for admin login routes
- **Security Headers** — `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Admin login | 5 attempts / 15 min (in `src/lib/rateLimit.ts`) |
| Enquiry form | 3 submissions / hour |
| File upload | 10 uploads / hour |
| General API | 100 requests / minute (middleware) |

---

## Database Security

Run `database/migrations/` scripts in Supabase SQL Editor in order.

### Monitoring Queries
```sql
-- Recent login attempts
SELECT * FROM login_attempts ORDER BY created_at DESC LIMIT 20;

-- Failed logins / unauthorized access
SELECT * FROM audit_logs
WHERE action IN ('failed_login', 'unauthorized_request')
ORDER BY created_at DESC LIMIT 50;

-- Security dashboard view
SELECT * FROM security_dashboard;
```

---

## Rotating Supabase Keys

1. Supabase Dashboard → Settings → API
2. Reset `anon public` key
3. Reset `service_role` key
4. Update `.env.local` and Vercel environment variables
5. Redeploy

---

## Incident Response

If a breach is suspected:
1. Immediately rotate all secrets (Supabase keys, JWT_SECRET, admin password)
2. Review `audit_logs` and `login_attempts` tables
3. Check recent database changes
4. Notify affected users if data was compromised
5. Document the incident

---

## Pre-Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Database migrations completed
- [ ] Supabase keys rotated
- [ ] Admin login tested
- [ ] Rate limiting verified
- [ ] File upload security tested
- [ ] No console errors in production
