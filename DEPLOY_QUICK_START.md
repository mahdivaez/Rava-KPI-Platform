# 🚀 Quick Deploy to Vercel - Cheat Sheet

## Prerequisites
- ✅ Project working locally
- ✅ Vercel account
- ✅ Code pushed to GitHub/GitLab

---

## 🎯 5-Minute Deploy

### 1. Generate Auth Secret
```bash
openssl rand -base64 32
```
Copy the output!

### 2. Go to Vercel
1. Visit: https://vercel.com/new
2. Import your Git repository
3. Framework: **Next.js** (auto-detected)

### 3. Add Environment Variables

Add these 3 variables (check all environments):

```
DATABASE_URL = postgresql://neondb_owner:npg_rZ8D0BtvdSJh@ep-hidden-leaf-a432u6lp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

NEXTAUTH_SECRET = [paste your generated secret]

NEXTAUTH_URL = https://your-project.vercel.app
```

### 4. Deploy
Click **Deploy** and wait ~3 minutes!

### 5. After Deployment
1. Update `NEXTAUTH_URL` with your actual Vercel URL
2. Redeploy (Deployments → ... → Redeploy)
3. Login with `admin@kpi.com` / `Admin@123`
4. **Change the admin password immediately!**

---

## 📖 Full Guide
See `VERCEL_DEPLOYMENT.md` for detailed instructions and troubleshooting.

---

## 🐛 Quick Fixes

**Build failed?**
```bash
# Test locally first
npm run build
```

**Can't login?**
- Check NEXTAUTH_URL matches your domain
- Verify NEXTAUTH_SECRET is set
- Redeploy after adding variables

**Database error?**
- Verify DATABASE_URL is correct
- Check Neon database is active

---

**That's it! You're live! 🎉**

