# 🔐 SECURITY IMPLEMENTATION GUIDE

## ⚡ QUICK START (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Environment Variables
```bash
# Copy the example file
cp .env.example .env.local

# Generate secrets
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env.local
echo "CRON_SECRET=$(openssl rand -hex 32)" >> .env.local

# Edit .env.local and add your Supabase credentials
```

### Step 3: Run Database Migration
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase_security_migration.sql`
3. Paste and click "Run"
4. Verify all statements executed successfully

### Step 4: Deploy
```bash
# Test locally first
npm run dev

# Deploy to Vercel
vercel --prod

# Add environment variables in Vercel Dashboard:
# - JWT_SECRET
# - CRON_SECRET
# - All other secrets from .env.local
```

---

## 📋 DETAILED IMPLEMENTATION STEPS

### 1. Environment Configuration

#### Generate All Required Secrets:
```bash
# JWT Secret (for admin sessions)
openssl rand -base64 32

# Cron Secret (for automated cleanup)
openssl rand -hex 32

# Admin Password Hash (replace 'YourPassword' with actual password)
npx bcryptjs-cli hash YourPassword 12
```

#### Update .env.local:
```env
# Supabase (get from Supabase Dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=https://ursulinstudycentre.in

# Admin Auth
ADMIN_USERNAME=ursulinestudycentre@gmail.com
ADMIN_PASSWORD_HASH=<generated_hash>
ADMIN_SESSION_SECRET=<generated_secret>
JWT_SECRET=<generated_secret>

# Email
EMAIL_USER=ursulinestudycentre@gmail.com
EMAIL_PASS=<gmail_app_password>

# Cron
CRON_SECRET=<generated_secret>
```

#### Add to Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all variables from .env.local
3. Set environment to "Production, Preview, Development"
4. Save and redeploy

---

### 2. Database Migration

#### Run the Security Migration:
```sql
-- In Supabase SQL Editor, run: supabase_security_migration.sql
```

This creates:
- ✅ Enhanced audit_logs table with IP tracking
- ✅ login_attempts table for brute force protection
- ✅ Indexes for performance
- ✅ Rate limiting functions
- ✅ Data validation constraints
- ✅ Security monitoring view

#### Verify Migration:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('audit_logs', 'login_attempts');

-- Check if new columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
AND column_name IN ('ip_address', 'metadata');
```

---

### 3. Rotate Supabase Keys (CRITICAL)

⚠️ **Your current keys are exposed in the audit report. You MUST rotate them.**

#### Steps:
1. Go to Supabase Dashboard → Settings → API
2. Click "Reset" next to "anon public" key
3. Click "Reset" next to "service_role" key
4. Copy new keys
5. Update .env.local
6. Update Vercel environment variables
7. Redeploy application

---

### 4. Test Security Features

#### Test Admin Login Rate Limiting:
```bash
# Try logging in with wrong password 6 times
# Should get blocked after 5 attempts
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrong"}'
```

#### Test Enquiry Rate Limiting:
```bash
# Submit 4 enquiries quickly
# 4th should be rate limited
for i in {1..4}; do
  curl -X POST http://localhost:3000/api/enquiry \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","phone":"1234567890","class":"Class X"}'
done
```

#### Test File Upload Validation:
```bash
# Try uploading a non-image file
# Should be rejected
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.txt" \
  -F "folder=faculty"
```

---

### 5. Monitor Security

#### Check Security Dashboard:
```sql
-- In Supabase SQL Editor
SELECT * FROM security_dashboard;
```

#### Check Recent Login Attempts:
```sql
SELECT * FROM login_attempts 
ORDER BY created_at DESC 
LIMIT 20;
```

#### Check Audit Logs:
```sql
SELECT * FROM audit_logs 
WHERE action IN ('failed_login', 'unauthorized_request')
ORDER BY created_at DESC 
LIMIT 50;
```

---

## 🛡️ SECURITY FEATURES IMPLEMENTED

### ✅ Authentication & Authorization
- [x] JWT-based admin sessions (2-hour expiry)
- [x] Rate limiting on login (5 attempts / 15 min)
- [x] Account lockout after failed attempts
- [x] Login attempt tracking
- [x] IP address logging
- [x] Timing attack prevention
- [x] Secure cookie configuration (httpOnly, secure, sameSite)

### ✅ Input Validation & Sanitization
- [x] Zod schema validation for all inputs
- [x] HTML sanitization (XSS prevention)
- [x] Field whitelisting (mass assignment protection)
- [x] Phone number format validation
- [x] Aadhaar format validation
- [x] Text length limits

### ✅ Rate Limiting
- [x] Admin login: 5 attempts / 15 min
- [x] Student login: 10 attempts / 5 min
- [x] Enquiry: 3 submissions / hour
- [x] Student application: 2 / 24 hours
- [x] File upload: 10 / hour
- [x] General API: 100 / minute

### ✅ File Upload Security
- [x] Magic number verification (not just MIME type)
- [x] File size limits (5MB max)
- [x] Image-only uploads
- [x] Automatic WebP conversion
- [x] Metadata stripping
- [x] Secure filename generation with hash
- [x] Rate limiting

### ✅ Audit Logging
- [x] All admin actions logged
- [x] IP address tracking
- [x] User identification
- [x] Metadata support
- [x] Failed login tracking
- [x] Unauthorized access attempts

### ✅ Database Security
- [x] Enhanced RLS policies
- [x] Data validation constraints
- [x] Unique constraints (phone numbers)
- [x] Format validation (phone, aadhaar)
- [x] Automatic text sanitization
- [x] Indexes for performance

---

## ⚠️ REMAINING SECURITY TASKS

### Critical (Do Immediately):
1. **Rotate Supabase Keys** - Current keys exposed
2. **Set CRON_SECRET** - Currently undefined
3. **Test All Features** - Verify nothing broke

### High Priority (This Week):
1. **Student Password Authentication**
   - Add password_hash column to students table
   - Implement password-based login
   - Add password reset flow

2. **Email Verification**
   - Add email column to students table
   - Implement verification flow
   - Send verification emails

3. **CSRF Protection**
   - Implement CSRF tokens
   - Add to all forms
   - Validate on server

### Medium Priority (This Month):
1. **2FA for Admin** - Add TOTP-based 2FA
2. **Security Monitoring** - Set up alerts for suspicious activity
3. **Penetration Testing** - Hire security firm
4. **Compliance Audit** - GDPR, data protection
5. **Backup Encryption** - Encrypt backup files

---

## 🚨 SECURITY INCIDENT RESPONSE

### If You Detect a Breach:
1. **Immediately** rotate all secrets (Supabase keys, JWT secret, admin password)
2. Check audit_logs and login_attempts for suspicious activity
3. Review recent database changes
4. Check for unauthorized admin access
5. Notify affected users if data was compromised
6. Document the incident
7. Implement additional security measures

### Monitoring Checklist (Daily):
- [ ] Check failed login attempts
- [ ] Review audit logs for suspicious activity
- [ ] Monitor rate limit violations
- [ ] Check for unusual database queries
- [ ] Verify backup integrity

---

## 📞 SUPPORT

### Issues During Implementation:
1. Check console logs for errors
2. Verify environment variables are set correctly
3. Ensure database migration completed successfully
4. Test in development before production

### Common Issues:

**"JWT_SECRET not configured"**
- Solution: Add JWT_SECRET to .env.local and Vercel

**"CRON_SECRET not configured"**
- Solution: Generate and add CRON_SECRET

**"Column does not exist"**
- Solution: Run supabase_security_migration.sql

**"Rate limit exceeded"**
- Solution: Wait for rate limit window to reset, or adjust limits in src/lib/rateLimit.ts

---

## ✅ VERIFICATION CHECKLIST

Before going to production:
- [ ] All environment variables set in Vercel
- [ ] Database migration completed successfully
- [ ] Supabase keys rotated
- [ ] Admin login works with new JWT system
- [ ] Rate limiting tested and working
- [ ] File upload security tested
- [ ] Audit logging verified
- [ ] No console errors in production
- [ ] All existing features still work
- [ ] UI/UX unchanged
- [ ] Performance acceptable

---

## 📚 ADDITIONAL RESOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Last Updated:** May 8, 2026  
**Version:** 1.0  
**Status:** Ready for Implementation
