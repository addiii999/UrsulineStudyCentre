# ⚡ QUICK START - Security Fixes

**Time Required:** 30 minutes  
**Difficulty:** Easy  
**Breaking Changes:** None

---

## 🚀 5-STEP SETUP

### Step 1: Environment Variables (5 min)
```bash
# Copy template
cp .env.example .env.local

# Generate secrets
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env.local
echo "CRON_SECRET=$(openssl rand -hex 32)" >> .env.local

# Edit .env.local and fill in:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - ADMIN_USERNAME
# - ADMIN_PASSWORD_HASH (generate with: npx bcryptjs-cli hash YourPassword 12)
# - EMAIL_USER
# - EMAIL_PASS
```

### Step 2: Install Dependencies (2 min)
```bash
npm install
```

### Step 3: Database Migration (3 min)
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase_security_migration.sql`
3. Paste and click "Run"
4. Wait for "Success" message

### Step 4: Test Locally (5 min)
```bash
npm run dev

# Test these:
# 1. Admin login at http://localhost:3000/login
# 2. Submit enquiry form
# 3. Try uploading a file (as admin)
```

### Step 5: Deploy (15 min)
```bash
# Add environment variables to Vercel:
# Go to Vercel Dashboard → Settings → Environment Variables
# Add all variables from .env.local

# Deploy
vercel --prod

# Test production:
# 1. Admin login
# 2. Enquiry form
# 3. File upload
```

---

## ✅ VERIFICATION

After deployment, verify:
- [ ] Admin login works
- [ ] Can't login with wrong password more than 5 times
- [ ] Enquiry form works
- [ ] Can't submit more than 3 enquiries per hour
- [ ] File upload works (admin only)
- [ ] Can't upload non-image files
- [ ] No console errors

---

## 🆘 TROUBLESHOOTING

**"JWT_SECRET not configured"**
```bash
# Add to .env.local:
JWT_SECRET=$(openssl rand -base64 32)
```

**"Module not found: zod"**
```bash
npm install
```

**"Column does not exist"**
```sql
-- Run in Supabase SQL Editor:
-- Copy and paste supabase_security_migration.sql
```

**"Too many requests"**
```
Wait 15 minutes or adjust rate limits in:
src/lib/rateLimit.ts
```

---

## 📚 NEXT STEPS

1. ✅ Complete this quick start
2. 📖 Read `SECURITY_AUDIT_SUMMARY.md` for details
3. 🔐 Rotate Supabase keys (CRITICAL)
4. 🔑 Implement student password auth (CRITICAL)
5. 🛡️ Add CSRF protection (HIGH)

---

## 🎯 WHAT YOU GET

✅ **Secure Admin Login** - JWT + rate limiting  
✅ **Input Validation** - XSS & injection protection  
✅ **Rate Limiting** - Spam & DoS protection  
✅ **Secure File Upload** - Magic number verification  
✅ **Audit Logging** - Track all actions  
✅ **Database Security** - Enhanced constraints  

**And:** Zero breaking changes, all features work as before!

---

**Need Help?** Check `SECURITY_IMPLEMENTATION_GUIDE.md`
