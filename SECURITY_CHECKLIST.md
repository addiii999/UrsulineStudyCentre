# ✅ SECURITY IMPLEMENTATION CHECKLIST

**Project:** Ursuline Study Centre  
**Date:** May 8, 2026

---

## 🔴 CRITICAL (Do Immediately - 30 min)

### Environment Setup
- [ ] Copy `.env.example` to `.env.local`
- [ ] Generate `JWT_SECRET`: `openssl rand -base64 32`
- [ ] Generate `CRON_SECRET`: `openssl rand -hex 32`
- [ ] Generate admin password hash: `npx bcryptjs-cli hash YourPassword 12`
- [ ] Fill in all Supabase credentials in `.env.local`
- [ ] Fill in email credentials in `.env.local`
- [ ] Verify `.env.local` is in `.gitignore`

### Dependencies
- [ ] Run `npm install`
- [ ] Verify no errors during installation
- [ ] Check that `zod`, `dompurify`, `file-type` are installed

### Database Migration
- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Copy contents of `supabase_security_migration.sql`
- [ ] Paste and run in SQL Editor
- [ ] Verify "Success" message for all statements
- [ ] Check that `login_attempts` table exists
- [ ] Check that `audit_logs` has new columns (`ip_address`, `metadata`)

### Local Testing
- [ ] Run `npm run dev`
- [ ] Test admin login at `http://localhost:3000/login`
- [ ] Try wrong password 6 times (should block after 5)
- [ ] Test enquiry form submission
- [ ] Try submitting 4 enquiries (should block 4th)
- [ ] Test file upload (as admin)
- [ ] Try uploading a .txt file (should reject)
- [ ] Check browser console for errors

### Vercel Deployment
- [ ] Go to Vercel Dashboard → Settings → Environment Variables
- [ ] Add `JWT_SECRET`
- [ ] Add `CRON_SECRET`
- [ ] Add `ADMIN_PASSWORD_HASH`
- [ ] Add all other secrets from `.env.local`
- [ ] Set environment to "Production, Preview, Development"
- [ ] Deploy: `vercel --prod`
- [ ] Wait for deployment to complete

### Production Testing
- [ ] Test admin login on production URL
- [ ] Test rate limiting on production
- [ ] Test enquiry form on production
- [ ] Test file upload on production
- [ ] Check Vercel logs for errors
- [ ] Verify no console errors in browser

### Key Rotation (CRITICAL)
- [ ] Go to Supabase Dashboard → Settings → API
- [ ] Click "Reset" on anon public key
- [ ] Click "Reset" on service_role key
- [ ] Copy new keys
- [ ] Update `.env.local` with new keys
- [ ] Update Vercel environment variables with new keys
- [ ] Redeploy: `vercel --prod`
- [ ] Test that everything still works

---

## 🟡 HIGH PRIORITY (This Week)

### Student Authentication
- [ ] Add `password_hash` column to `students` table
- [ ] Add `email` column to `students` table
- [ ] Create unique index on email
- [ ] Update `/api/student/login/route.ts` to require password
- [ ] Implement password reset flow
- [ ] Add "Forgot Password" link to login page
- [ ] Test student login with password
- [ ] Update student registration to collect password

### CSRF Protection
- [ ] Install `csrf` package: `npm install csrf`
- [ ] Create CSRF token generation utility
- [ ] Add CSRF tokens to all forms
- [ ] Validate CSRF tokens on server
- [ ] Test CSRF protection
- [ ] Document CSRF implementation

### Security Monitoring
- [ ] Set up daily audit log review
- [ ] Create alert for >10 failed logins/hour
- [ ] Create alert for >50 enquiries/hour
- [ ] Set up Sentry or similar error tracking
- [ ] Create security dashboard in admin panel
- [ ] Document monitoring procedures

---

## 🟢 MEDIUM PRIORITY (This Month)

### 2FA for Admin
- [ ] Install `speakeasy` package for TOTP
- [ ] Add `totp_secret` column to admin table (or settings)
- [ ] Create 2FA setup page
- [ ] Generate QR code for authenticator app
- [ ] Implement 2FA verification on login
- [ ] Generate backup codes
- [ ] Test 2FA flow
- [ ] Document 2FA setup for admins

### Email Verification
- [ ] Create email verification token system
- [ ] Send verification email on student registration
- [ ] Create email verification page
- [ ] Mark students as verified
- [ ] Require verification for certain actions
- [ ] Test email verification flow

### Password Reset
- [ ] Create password reset token system
- [ ] Implement "Forgot Password" flow
- [ ] Send reset email
- [ ] Create password reset page
- [ ] Test password reset flow
- [ ] Add rate limiting to reset requests

### Enhanced Logging
- [ ] Log all admin actions with before/after values
- [ ] Log all student profile changes
- [ ] Log all file uploads/deletions
- [ ] Create log retention policy
- [ ] Set up log archiving
- [ ] Create log analysis tools

### Backup & Recovery
- [ ] Test backup restoration process
- [ ] Encrypt backup files
- [ ] Store backups in multiple locations
- [ ] Create disaster recovery plan
- [ ] Document recovery procedures
- [ ] Test recovery procedures

---

## 🔵 LOW PRIORITY (Future)

### Advanced Security
- [ ] Implement IP whitelisting for admin
- [ ] Add device fingerprinting
- [ ] Implement session management dashboard
- [ ] Add "Active Sessions" view for admin
- [ ] Implement "Logout All Devices"
- [ ] Add security questions as backup auth

### Compliance
- [ ] GDPR compliance audit
- [ ] Create privacy policy
- [ ] Create terms of service
- [ ] Implement data export feature
- [ ] Implement data deletion feature
- [ ] Create consent management

### Performance
- [ ] Implement Redis for rate limiting
- [ ] Add caching layer
- [ ] Optimize database queries
- [ ] Add CDN for static assets
- [ ] Implement lazy loading
- [ ] Add service worker for offline support

### Testing
- [ ] Write unit tests for validation
- [ ] Write integration tests for APIs
- [ ] Write E2E tests for critical flows
- [ ] Set up automated security scanning
- [ ] Conduct penetration testing
- [ ] Create security test suite

---

## 📊 PROGRESS TRACKING

### Overall Progress
- Critical Tasks: __ / 30 (0%)
- High Priority: __ / 15 (0%)
- Medium Priority: __ / 20 (0%)
- Low Priority: __ / 20 (0%)

### Security Score
- Before: 🔴 CRITICAL RISK
- Current: 🟡 MEDIUM RISK (after critical tasks)
- Target: 🟢 LOW RISK (after all tasks)

---

## 🎯 MILESTONES

### Milestone 1: Production Ready (30 min)
- [ ] All critical tasks completed
- [ ] Deployed to production
- [ ] Keys rotated
- [ ] Basic security in place

### Milestone 2: Enhanced Security (1 week)
- [ ] Student password auth implemented
- [ ] CSRF protection added
- [ ] Monitoring set up
- [ ] High priority tasks completed

### Milestone 3: Advanced Security (1 month)
- [ ] 2FA implemented
- [ ] Email verification added
- [ ] Password reset working
- [ ] Medium priority tasks completed

### Milestone 4: Enterprise Grade (3 months)
- [ ] All security features implemented
- [ ] Compliance audit passed
- [ ] Penetration testing completed
- [ ] Low priority tasks completed

---

## 📝 NOTES

### Completed Tasks
_Add notes here as you complete tasks_

### Issues Encountered
_Document any problems and solutions_

### Future Improvements
_Ideas for additional security enhancements_

---

**Last Updated:** May 8, 2026  
**Next Review:** ___________  
**Reviewed By:** ___________
