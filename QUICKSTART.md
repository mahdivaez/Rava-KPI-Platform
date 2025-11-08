# ⚡ راهنمای شروع سریع

## نصب و اجرا در 5 دقیقه! 🚀

### 1️⃣ نصب Dependencies
```bash
npm install
```

### 2️⃣ تنظیم دیتابیس
```bash
# ایجاد دیتابیس PostgreSQL
createdb kpi_platform

# یا از psql:
psql -U postgres -c "CREATE DATABASE kpi_platform;"
```

### 3️⃣ تنظیم Environment Variables
فایل `.env` را ویرایش کنید:
```bash
# آدرس دیتابیس
DATABASE_URL="postgresql://postgres:password@localhost:5432/kpi_platform"

# کلید امنیتی (تولید با: openssl rand -base64 32)
AUTH_SECRET="$(openssl rand -base64 32)"

NEXTAUTH_URL="http://localhost:3000"
```

### 4️⃣ اجرای Migration و Seed
```bash
# ایجاد جداول
npx prisma migrate dev --name init

# ایجاد admin اولیه
npx prisma db seed
```

### 5️⃣ اجرای پروژه
```bash
npm run dev
```

**🎉 آماده است!** به http://localhost:3000 بروید

## 🔐 ورود اولیه

```
ایمیل: admin@kpi.com
رمز: Admin@123
```

## 🎯 مراحل بعدی

1. **کاربران جدید**: مدیریت > کاربران > کاربر جدید
2. **کارگروه**: مدیریت > کارگروه‌ها > کارگروه جدید  
3. **افزودن اعضا**: کلیک روی آیکون "Users" در لیست کارگروه‌ها
4. **شروع ارزیابی**: از منوی مربوطه

## 🛠️ دستورات مفید

```bash
# مشاهده دیتابیس
npx prisma studio

# Reset دیتابیس
npx prisma migrate reset

# Build production
npm run build && npm start
```

## 📚 مستندات کامل

برای جزئیات بیشتر:
- **نصب کامل**: `SETUP.md`
- **مستندات**: `README.md`

---

💡 **نکته**: برای محیط production، حتماً:
- رمز عبور admin را تغییر دهید
- یک `AUTH_SECRET` قوی تولید کنید
- از HTTPS استفاده کنید

