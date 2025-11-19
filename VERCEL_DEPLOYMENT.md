# Vercel Deployment Guide - Rava Platform

## 🚀 Quick Deployment

This guide will help you deploy your Rava Platform to Vercel with Neon PostgreSQL.

---

## 📋 Prerequisites

Before deploying, make sure you have:

- ✅ A [Vercel account](https://vercel.com/signup) (free tier works)
- ✅ Your Neon PostgreSQL database credentials
- ✅ Git repository pushed to GitHub/GitLab/Bitbucket
- ✅ Project is working locally (`npm run dev` runs successfully)

---

## 🔧 Pre-Deployment Checklist

### 1. Ensure Build Scripts are Ready

Your `package.json` already includes the necessary scripts:

```json
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack",
    "start": "next start",
    "postinstall": "prisma generate"
  }
}
```

✅ Already configured!

### 2. Vercel Configuration

A `vercel.json` file has been created with optimal settings:

```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

✅ Already configured!

### 3. Generate NextAuth Secret

Generate a secure secret for production:

```bash
openssl rand -base64 32
```

Copy the output - you'll need it for environment variables.

---

## 📦 Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended for First Time)

#### Step 1: Push Your Code to Git

```bash
# If you haven't already, initialize git and push to GitHub
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

#### Step 2: Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Select your repository from the list

#### Step 3: Configure Project Settings

Vercel will auto-detect Next.js. Keep these settings:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (leave default)
- **Build Command**: Use the one from vercel.json
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install`

#### Step 4: Add Environment Variables

Click **"Environment Variables"** and add the following:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_rZ8D0BtvdSJh@ep-hidden-leaf-a432u6lp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://your-preview.vercel.app` | Preview |
| `NEXTAUTH_SECRET` | [Your generated secret from step 3] | Production, Preview, Development |

**Important Notes:**
- For `NEXTAUTH_URL` in Production: You'll need to update this after deployment with your actual Vercel URL
- Check all three environments (Production, Preview, Development) for each variable

#### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Your app will be live at `https://your-project-name.vercel.app`

---

### Method 2: Deploy via Vercel CLI

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

#### Step 3: Deploy

```bash
# From your project root
cd /Users/mac/Desktop/rava-platform

# First deployment (interactive)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? rava-platform (or your choice)
# - Directory? ./
# - Override settings? No
```

#### Step 4: Add Environment Variables via CLI

```bash
# Add DATABASE_URL
vercel env add DATABASE_URL production
# Paste your Neon database URL when prompted

# Add NEXTAUTH_SECRET
vercel env add NEXTAUTH_SECRET production
# Paste your generated secret

# Add NEXTAUTH_URL
vercel env add NEXTAUTH_URL production
# Enter: https://your-project.vercel.app
```

#### Step 5: Deploy to Production

```bash
vercel --prod
```

---

## 🔄 Post-Deployment Steps

### 1. Update NEXTAUTH_URL

After first deployment, you'll have your Vercel URL. Update the environment variable:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Update `NEXTAUTH_URL` with your actual URL: `https://your-actual-url.vercel.app`
4. Click **Save**
5. Redeploy: **Deployments** → **...** → **Redeploy**

### 2. Verify Database Connection

1. Visit your deployed URL
2. Try logging in with admin credentials:
   - Email: `admin@kpi.com`
   - Password: `Admin@123`
3. Change the admin password immediately!

### 3. Set Up Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXTAUTH_URL` to use your custom domain

---

## 🔒 Security Best Practices

### ✅ Immediately After Deployment:

1. **Change Admin Password**
   - Log in with default credentials
   - Go to Profile → Change Password
   - Use a strong, unique password

2. **Rotate Database Credentials** (if sharing this guide)
   - Go to Neon Dashboard
   - Generate new credentials
   - Update `DATABASE_URL` in Vercel
   - Redeploy

3. **Enable Vercel Authentication** (optional)
   - For staging/preview environments
   - Settings → Deployment Protection

4. **Set Up Monitoring**
   - Enable Vercel Analytics
   - Set up error tracking (Sentry, etc.)

---

## 🐛 Troubleshooting

### Build Fails: "Prisma Client not generated"

**Solution:**
- The `postinstall` script should handle this automatically
- If not, check that `vercel.json` includes `prisma generate` in buildCommand

### Database Connection Error

**Solutions:**
1. Verify `DATABASE_URL` is correctly set in Vercel environment variables
2. Check Neon database is active (not paused)
3. Ensure connection string includes `?sslmode=require`
4. Verify Neon allows connections from all IPs (default)

### NextAuth Error: "Invalid URL"

**Solutions:**
1. Ensure `NEXTAUTH_URL` matches your actual Vercel URL (no trailing slash)
2. Make sure `NEXTAUTH_SECRET` is set
3. Redeploy after adding/changing environment variables

### Build Timeout

**Solutions:**
1. Remove `--webpack` flag from build script if issues persist
2. Check for large dependencies that could be optimized
3. Consider upgrading Vercel plan if consistently timing out

### "Database schema is out of sync"

**Solution:**
```bash
# This should run automatically via vercel.json buildCommand
# But if needed, you can run migrations manually:
# Connect to your Vercel project
vercel env pull .env.production
npx prisma migrate deploy
```

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to your Git repository:

- **Push to `main` branch** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

### Manual Redeployment

Via Dashboard:
1. Go to **Deployments**
2. Find the deployment you want to redeploy
3. Click **...** → **Redeploy**

Via CLI:
```bash
vercel --prod
```

---

## 📊 Monitoring Your Deployment

### Vercel Dashboard

Monitor your application:
- **Deployments**: View build logs and deployment history
- **Analytics**: Traffic and performance metrics (if enabled)
- **Logs**: Real-time function logs
- **Settings**: Environment variables, domains, etc.

### Database Monitoring

Monitor your Neon database:
- Go to [Neon Dashboard](https://console.neon.tech)
- Check database size, connections, and queries
- Set up alerts for important metrics

---

## 🚀 Performance Optimization

### After Successful Deployment:

1. **Enable Vercel Analytics**
   - Dashboard → Analytics → Enable

2. **Configure Caching**
   - Next.js automatically handles this
   - Review and optimize API routes

3. **Image Optimization**
   - Already handled by Next.js Image component
   - Ensure you're using `<Image>` from `next/image`

4. **Database Connection Pooling**
   - Already configured (using Neon pooler)
   - Monitor connection usage in Neon dashboard

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Neon Documentation](https://neon.tech/docs)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)

---

## 📝 Environment Variables Reference

### Required Variables

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://neondb_owner:npg_rZ8D0BtvdSJh@ep-hidden-leaf-a432u6lp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Authentication
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-generated-secret-here"
```

### Optional Variables

```env
# If you want different URLs for preview/production
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

---

## ✅ Deployment Checklist

Before going live:

- [ ] Environment variables set in Vercel
- [ ] Database migrations applied
- [ ] Admin password changed
- [ ] NEXTAUTH_URL updated with actual domain
- [ ] NEXTAUTH_SECRET is secure and unique
- [ ] Custom domain configured (if applicable)
- [ ] SSL/HTTPS working correctly
- [ ] Test login functionality
- [ ] Test all main features
- [ ] Check console for errors
- [ ] Set up error monitoring
- [ ] Configure backups (Neon)
- [ ] Document deployment for team

---

## 🆘 Need Help?

If you encounter issues:

1. Check Vercel build logs
2. Check Neon database status
3. Review this troubleshooting guide
4. Check Vercel Status Page
5. Contact Vercel Support (if needed)

---

**Deployment Prepared**: November 19, 2025
**Status**: ✅ Ready to Deploy

Good luck with your deployment! 🚀

