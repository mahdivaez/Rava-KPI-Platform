# 🗄️ اطلاعات دیتابیس و پروژه

## ✅ وضعیت: همه چیز آماده است!

تاریخ راه‌اندازی: 8 نوامبر 2025

---

## 🔐 اطلاعات دیتابیس

### اتصال PostgreSQL
```
Database: rava_kpi_platform
User: postgres
Password: 00Eability
Host: localhost
Port: 5432
```

### Connection String
```
DATABASE_URL="postgresql://postgres:00Eability@localhost:5432/rava_kpi_platform"
```

---

## 🔑 اطلاعات ورود اولیه

### Admin اولیه (ایجاد شده)
```
ایمیل: admin@kpi.com
رمز عبور: Admin@123
```

⚠️ **هشدار امنیتی**: 
حتماً پس از اولین ورود، رمز عبور را تغییر دهید!

---

## 🌐 GitHub Repository

### آدرس Repository
```
https://github.com/mahdivaez/Rava-KPI-Platform.git
```

### وضعیت Push
✅ **موفق**: تمام کد با موفقیت به GitHub push شد

### آخرین Commit
```
Initial commit: Complete KPI Platform with full features
- 68 فایل تغییر یافته
- 8858 خط اضافه شده
```

---

## 🚀 دستورات اجرا

### اجرای پروژه
```bash
cd /Users/mac/Desktop/rava-platform
npm run dev
```

### دسترسی به برنامه
```
URL: http://localhost:3000
```

### مشاهده دیتابیس
```bash
npx prisma studio
```

یا مستقیماً با psql:
```bash
psql -U postgres -d rava_kpi_platform
```

---

## 📊 وضعیت دیتابیس

### Tables ایجاد شده
✅ User (کاربران)
✅ Workgroup (کارگروه‌ها)
✅ WorkgroupMember (اعضای کارگروه)
✅ StrategistEvaluation (ارزیابی استراتژیست‌ها)
✅ WriterEvaluation (ارزیابی نویسنده‌ها)
✅ WriterFeedback (بازخورد نویسنده‌ها)

### Migration
✅ Migration اجرا شد: `20251108193654_init`
✅ Seed اجرا شد: Admin user ایجاد شد

---

## 🔄 دستورات Git

### Pull آخرین تغییرات
```bash
git pull origin main
```

### Push تغییرات جدید
```bash
git add .
git commit -m "توضیحات تغییرات"
git push origin main
```

### بررسی وضعیت
```bash
git status
```

---

## 📝 نکات مهم

### امنیت
1. ⚠️ رمز عبور admin را فوراً تغییر دهید
2. ⚠️ در production از رمز قوی برای دیتابیس استفاده کنید
3. ⚠️ AUTH_SECRET را برای production تغییر دهید:
   ```bash
   openssl rand -base64 32
   ```

### Backup
برای backup از دیتابیس:
```bash
pg_dump -U postgres rava_kpi_platform > backup_$(date +%Y%m%d).sql
```

برای restore:
```bash
psql -U postgres rava_kpi_platform < backup_20241108.sql
```

---

## 🛠️ دستورات مفید

### Reset دیتابیس
```bash
npx prisma migrate reset
```
⚠️ این دستور تمام داده‌ها را پاک می‌کند!

### Regenerate Prisma Client
```bash
npx prisma generate
```

### Format schema
```bash
npx prisma format
```

### بررسی اتصال دیتابیس
```bash
psql -U postgres -d rava_kpi_platform -c "SELECT version();"
```

---

## 📈 مراحل بعدی

### 1. اجرای پروژه
```bash
npm run dev
```

### 2. ورود به سیستم
به http://localhost:3000 بروید و با admin@kpi.com وارد شوید

### 3. تغییر رمز عبور
از پروفایل admin، رمز عبور را تغییر دهید

### 4. ایجاد کاربران
از منوی "مدیریت > کاربران" کاربران جدید ایجاد کنید

### 5. ایجاد کارگروه‌ها
از منوی "مدیریت > کارگروه‌ها" کارگروه‌های خود را بسازید

---

## 🔗 لینک‌های مفید

- **Repository**: https://github.com/mahdivaez/Rava-KPI-Platform
- **Local**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (بعد از `npx prisma studio`)

---

## 📞 پشتیبانی

در صورت بروز مشکل:

1. لاگ‌های برنامه را بررسی کنید
2. دیتابیس را با `npx prisma studio` چک کنید
3. اتصال به دیتابیس را تست کنید
4. مستندات README.md را مطالعه کنید

---

**✨ همه چیز آماده است! شروع کنید! ✨**


