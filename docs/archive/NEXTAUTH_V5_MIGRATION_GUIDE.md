# NextAuth v5 Migration Guide - Complete Fix

## ✅ Changes Made

### 1. Updated `package.json`
- Changed `next-auth` from `^4.24.8` to `^5.0.0-beta.25`

### 2. Rewrote `src/lib/auth.ts` for v5
- Removed v4 syntax (`NextAuthOptions`, `getServerSession`)
- Using v5 syntax: `NextAuth()` returns `{ handlers, signIn, signOut, auth }`
- Removed test users fallback - now uses Prisma DB only
- Added `trustHost: true` for production
- Proper JWT and session callbacks

### 3. Updated API Route
- `src/app/api/auth/[...nextauth]/route.ts` now uses `handlers` export

### 4. Replaced All `getSession()` with `auth()`
- Updated 30+ files to use `auth()` from NextAuth v5
- Updated server action signOut to use `signOut()` function

### 5. Updated `prisma/seed.ts`
- Added logging for NODE_ENV (no blocking checks)
- Works in production

### 6. Updated `next.config.js`
- Added webpack configuration (disables Turbopack)
- Keeps serverComponentsExternalPackages

### 7. Created `.env.example`
- Shows correct v5 environment variables

---

## 🚀 Server Deployment Steps

### Step 1: Update Environment Variables

Edit `.env` file on server:

```bash
cd /var/www/Rava-KPI-Platform
nano .env
```

**Required variables for NextAuth v5:**

```env
# Database
DATABASE_URL="postgresql://kpi_admin_user:O0Eabilitu@localhost:5432/kpi_analysis_db"

# NextAuth v5 (Auth.js) - REQUIRED
AUTH_SECRET="generate-with-openssl-rand-hex-32"
AUTH_URL="http://93.127.182.46"
AUTH_TRUST_HOST=true

# Node Environment
NODE_ENV=production
```

**Generate AUTH_SECRET:**
```bash
openssl rand -hex 32
```

**⚠️ IMPORTANT:** 
- Use `AUTH_SECRET` (NOT `NEXTAUTH_SECRET`)
- Use `AUTH_URL` (NOT `NEXTAUTH_URL`)
- Remove any `NEXTAUTH_SECRET` or `NEXTAUTH_URL` variables

### Step 2: Pull Latest Code

```bash
cd /var/www/Rava-KPI-Platform
git pull origin main
```

### Step 3: Install Dependencies

```bash
npm install
# This will install next-auth@5.0.0-beta.25
```

### Step 4: Generate Prisma Client

```bash
npm run postinstall
# or explicitly:
npx prisma generate
```

### Step 5: Run Database Migrations

```bash
# Check migration status
npx prisma migrate status

# Apply pending migrations
npx prisma migrate deploy

# Or if you need to create migrations:
# npx prisma migrate dev --name init
```

### Step 6: Seed Database

```bash
# Seed will work in production now
npm run seed

# Expected output:
# ✅ Admin user created: admin@kpi.com | Password: Admin@123
# ✅ All normal users created
```

### Step 7: Build Application

```bash
# Clean previous build
rm -rf .next

# Build with Webpack (not Turbopack)
npm run build
```

### Step 8: Restart PM2

```bash
# Stop existing processes
pm2 delete all

# Load environment variables
set -a; source .env; set +a

# Verify AUTH_SECRET is loaded
echo "AUTH_SECRET=$AUTH_SECRET"

# Start application
pm2 start npm --name rava -- start --update-env

# Check logs
pm2 logs rava --lines 50
```

### Step 9: Verify Environment Variables in PM2

```bash
# Check if PM2 has the correct env vars
pm2 env rava | grep AUTH

# Should show:
# AUTH_SECRET=...
# AUTH_URL=http://93.127.182.46
# AUTH_TRUST_HOST=true
```

---

## 🧪 Testing

### 1. Test Login

1. Navigate to: `http://93.127.182.46/login`
2. Use credentials:
   - Email: `admin@kpi.com`
   - Password: `Admin@123`
3. Should redirect to `/dashboard` after successful login
4. **Session should persist** - refresh page, should stay logged in

### 2. Test Session Persistence

1. After login, refresh the page (F5)
2. Should remain on dashboard (not redirect to login)
3. Check browser console - no errors about `NEXTAUTH_SECRET` or `AUTH_SECRET`

### 3. Test Sign Out

1. Click sign out button
2. Should redirect to `/login`
3. Should not be able to access `/dashboard` without logging in again

---

## 🔍 Troubleshooting

### Issue: "AUTH_SECRET is not set"

**Solution:**
```bash
# Check .env file
cat .env | grep AUTH_SECRET

# If empty, generate and add:
openssl rand -hex 32
# Add to .env: AUTH_SECRET="<generated-value>"

# Restart PM2 with env
pm2 restart rava --update-env
```

### Issue: "Database not configured"

**Solution:**
```bash
# Check DATABASE_URL
cat .env | grep DATABASE_URL

# Verify database connection
psql "$DATABASE_URL" -c "SELECT 1;"
```

### Issue: "Failed to find Server Action"

**Solution:**
- This was caused by v4/v5 mixing - should be fixed now
- Rebuild: `rm -rf .next && npm run build`

### Issue: Users not created after seed

**Solution:**
```bash
# Check if seed ran successfully
npm run seed

# Check database directly
psql "$DATABASE_URL" -c "SELECT email FROM \"User\" LIMIT 5;"

# If empty, run seed again
npm run seed
```

### Issue: Build fails with Turbopack

**Solution:**
- Already fixed in `next.config.js` - uses Webpack now
- If still fails, check: `npm run build` should use Webpack

---

## 📋 Summary of Changes

| File | Change |
|------|--------|
| `package.json` | Updated next-auth to v5 beta |
| `src/lib/auth.ts` | Complete rewrite for v5 syntax |
| `src/app/api/auth/[...nextauth]/route.ts` | Updated to use handlers |
| `src/app/actions/auth.ts` | Updated signOut to use v5 function |
| 30+ component/route files | Replaced `getSession()` with `auth()` |
| `prisma/seed.ts` | Added logging, works in production |
| `next.config.js` | Added webpack config |
| `.env.example` | Created with v5 variables |

---

## ✅ Expected Results

After completing all steps:

1. ✅ Login works with `admin@kpi.com` / `Admin@123`
2. ✅ Session persists after login (no redirect to login page)
3. ✅ No client-side errors in browser console
4. ✅ Build succeeds with Webpack
5. ✅ Seed creates users in production database
6. ✅ All protected routes accessible after login
7. ✅ Sign out works correctly

---

**Migration Date:** 2025-12-12
**NextAuth Version:** 5.0.0-beta.25
**Next.js Version:** 14.2.5

