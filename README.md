# 🚀 KPI Platform - سیستم مدیریت KPI

پلتفرم ارزیابی عملکرد تیم محتوا با پشتیبانی کامل از زبان فارسی (RTL)

## ✨ ویژگی‌ها

- 🔐 **احراز هویت امن** با NextAuth.js
- 👥 **سیستم نقش‌های چندگانه**: مدیر، معاون فنی، استراتژیست، نویسنده
- 📊 **ارزیابی استراتژیست‌ها** توسط معاون فنی
- ✍️ **ارزیابی نویسنده‌ها** توسط استراتژیست‌ها
- 💬 **سیستم بازخورد** نویسنده‌ها به استراتژیست‌ها
- 🏢 **مدیریت کارگروه‌ها** و اعضا
- 📈 **گزارشات و آمار** جامع
- 🌙 **رابط کاربری مدرن** با shadcn/ui و Tailwind CSS
- 🔒 **کنترل دسترسی دقیق**: کاربران نمی‌توانند ارزیابی‌های خود را ببینند

## 🛠️ تکنولوژی‌های استفاده شده

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL با Prisma ORM
- **Authentication**: NextAuth.js v5
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS v3 با سیستم توکن سه‌لایه
- **Charts**: Recharts
- **Fonts**: وزیرمتن و استعداد (variable، خودمیزبان)
- **Language**: TypeScript
- **Form Validation**: Zod + React Hook Form

## 🎨 سیستم طراحی

سیستم طراحی کامل در [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) مستند شده است:
توکن‌های رنگ و تایپوگرافی، پالت داده اعتبارسنجی‌شده برای کوررنگی، باندهای امتیاز،
قواعد نمودار و پایه دسترس‌پذیری.

نسخه زنده آن روی مسیر **`/design-system`** اجرا می‌شود و از همان کامپوننت‌هایی
استفاده می‌کند که در محصول به کار می‌روند، بنابراین هرگز از واقعیت فاصله نمی‌گیرد.

```bash
npm run dev   # سپس http://localhost:3000/design-system
```

## 📋 پیش‌نیازها

قبل از شروع، مطمئن شوید موارد زیر نصب شده‌اند:

- Node.js 18+ و npm
- PostgreSQL 14+
- Git

## 🚀 نصب و راه‌اندازی

### 1. نصب Dependencies

```bash
npm install
```

### 2. تنظیم دیتابیس

ابتدا یک دیتابیس PostgreSQL ایجاد کنید:

```bash
# ورود به PostgreSQL
psql -U postgres

# ایجاد دیتابیس
CREATE DATABASE kpi_platform;

# خروج
\q
```

### 3. تنظیم متغیرهای محیطی

فایل `.env` را ویرایش کنید و مقادیر زیر را وارد کنید:

```env
# Database - آدرس دیتابیس خود را وارد کنید
DATABASE_URL="postgresql://username:password@localhost:5432/kpi_platform"

# NextAuth - یک کلید امن تولید کنید
AUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

برای تولید `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. اجرای Migration و Seed

```bash
# ایجاد جداول دیتابیس
npx prisma migrate dev --name init

# تولید Prisma Client
npx prisma generate

# ایجاد کاربر مدیر اولیه
npx prisma db seed
```

### 5. اجرای پروژه

```bash
# محیط توسعه
npm run dev

# محیط production
npm run build
npm start
```

پروژه روی [http://localhost:3000](http://localhost:3000) در دسترس خواهد بود.

## 🔑 اطلاعات ورود اولیه

پس از seed، می‌توانید با اطلاعات زیر وارد شوید:

- **ایمیل**: `admin@kpi.com`
- **رمز عبور**: `Admin@123`

⚠️ **هشدار**: حتماً پس از اولین ورود، رمز عبور را تغییر دهید!

## 📁 ساختار پروژه

```
rava-platform/
├── prisma/
│   ├── schema.prisma      # مدل دیتابیس
│   └── seed.ts           # داده‌های اولیه
├── src/
│   ├── app/
│   │   ├── (dashboard)/  # صفحات داشبورد
│   │   │   ├── admin/    # مدیریت (کاربران، کارگروه‌ها، گزارشات)
│   │   │   ├── evaluations/ # ارزیابی‌ها
│   │   │   ├── feedback/    # بازخوردها
│   │   │   └── dashboard/   # داشبورد اصلی
│   │   ├── api/          # API Routes
│   │   ├── login/        # صفحه ورود
│   │   └── layout.tsx    # Layout اصلی
│   ├── components/
│   │   ├── admin/        # کامپوننت‌های مدیریت
│   │   ├── auth/         # کامپوننت‌های احراز هویت
│   │   ├── dashboard/    # کامپوننت‌های داشبورد
│   │   ├── evaluations/  # کامپوننت‌های ارزیابی
│   │   ├── feedback/     # کامپوننت‌های بازخورد
│   │   └── ui/           # کامپوننت‌های shadcn/ui
│   ├── lib/
│   │   ├── auth.ts       # تنظیمات NextAuth
│   │   ├── prisma.ts     # Prisma Client
│   │   └── utils.ts      # توابع کمکی
│   └── types/
│       └── next-auth.d.ts # تایپ‌های NextAuth
└── package.json
```

## 👥 نقش‌ها و دسترسی‌ها

### مدیر سیستم (Admin)
- مشاهده و مدیریت همه کاربران
- مدیریت کارگروه‌ها و اعضا
- مشاهده گزارشات جامع
- دسترسی به همه بخش‌ها

### معاون فنی (Technical Deputy)
- ارزیابی استراتژیست‌ها
- مشاهده ارزیابی‌های خود (نه سایر استراتژیست‌ها)
- مشاهده بازخوردهای نویسنده‌ها

### استراتژیست (Strategist)
- ارزیابی نویسنده‌های کارگروه خود
- مشاهده ارزیابی‌هایی که خود انجام داده
- **نمی‌تواند** ارزیابی خود را ببیند
- **نمی‌تواند** بازخوردهای نویسنده‌ها را ببیند

### نویسنده (Writer)
- ارسال بازخورد به استراتژیست‌های کارگروه
- مشاهده بازخوردهای ارسالی خود
- **نمی‌تواند** ارزیابی‌های خود را ببیند
- **نمی‌تواند** ارزیابی انجام دهد

## 🎯 نحوه استفاده

### 1. ایجاد کاربران
مدیر می‌تواند از بخش "مدیریت > کاربران" کاربران جدید ایجاد کند و نقش‌های مختلف را به آن‌ها اختصاص دهد.

### 2. ایجاد کارگروه
از بخش "مدیریت > کارگروه‌ها" می‌توانید:
- کارگروه جدید ایجاد کنید
- اعضا را به کارگروه اضافه کنید
- نقش هر عضو را مشخص کنید (استراتژیست یا نویسنده)

### 3. ارزیابی استراتژیست
معاون فنی از بخش "ارزیابی استراتژیست‌ها" می‌تواند ارزیابی ماهانه استراتژیست‌ها را ثبت کند.

### 4. ارزیابی نویسنده
استراتژیست‌ها از بخش "ارزیابی نویسنده‌ها" می‌توانند نویسنده‌های کارگروه خود را ارزیابی کنند.

### 5. ارسال بازخورد
نویسنده‌ها از بخش "ارسال بازخورد" می‌توانند نظرات خود درباره استراتژیست‌ها را ثبت کنند.

### 6. مشاهده گزارشات
مدیر می‌تواند از بخش "گزارشات" آمار و اطلاعات کلی سیستم را مشاهده کند.

## 🔧 دستورات مفید

```bash
# مشاهده دیتابیس در Prisma Studio
npx prisma studio

# ایجاد migration جدید
npx prisma migrate dev --name migration_name

# Reset کردن دیتابیس
npx prisma migrate reset

# فرمت کردن schema
npx prisma format

# بررسی validation
npx prisma validate
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Admin
- `POST /api/admin/users` - ایجاد کاربر
- `PUT /api/admin/users` - ویرایش کاربر
- `DELETE /api/admin/users?id={id}` - حذف کاربر
- `POST /api/admin/workgroups` - ایجاد کارگروه
- `PUT /api/admin/workgroups` - ویرایش کارگروه
- `DELETE /api/admin/workgroups?id={id}` - حذف کارگروه
- `POST /api/admin/workgroups/members` - افزودن عضو
- `DELETE /api/admin/workgroups/members?id={id}` - حذف عضو

### Evaluations
- `POST /api/evaluations/strategist` - ارزیابی استراتژیست
- `POST /api/evaluations/writer` - ارزیابی نویسنده

### Feedback
- `POST /api/feedback/writer` - ارسال بازخورد

## 🎨 تنظیمات UI

پروژه از shadcn/ui با تم Slate استفاده می‌کند. برای سفارشی‌سازی رنگ‌ها، فایل `src/app/globals.css` را ویرایش کنید.

## 🐛 عیب‌یابی

### خطای اتصال به دیتابیس
- مطمئن شوید PostgreSQL در حال اجراست
- `DATABASE_URL` در `.env` را بررسی کنید
- دسترسی کاربر به دیتابیس را چک کنید

### خطای AUTH_SECRET
- مطمئن شوید `AUTH_SECRET` در `.env` تنظیم شده است
- از `openssl rand -base64 32` برای تولید کلید جدید استفاده کنید

### خطای Prisma Client
- `npx prisma generate` را اجرا کنید
- پروژه را مجدداً build کنید

## 📄 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

## 🤝 مشارکت

برای مشارکت در این پروژه:
1. Fork کنید
2. یک branch جدید ایجاد کنید
3. تغییرات خود را commit کنید
4. Pull Request ایجاد کنید

## 📞 پشتیبانی

برای سوالات و مشکلات، Issue ایجاد کنید.

---

ساخته شده با ❤️ برای تیم‌های محتوا
