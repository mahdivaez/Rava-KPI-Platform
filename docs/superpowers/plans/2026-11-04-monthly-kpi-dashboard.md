# Monthly KPI Dashboard + Client Score Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** داشبورد تحلیلی ادمین یک ماه انتخاب‌شده را نشان می‌دهد، و جدول رتبه‌بندی کل ستون «میانگین مشتری» و یک «نمرهٔ نهایی» نصف‌نصف می‌گیرد که ترتیب جدول بر اساس آن است.

**Architecture:** صفحهٔ سروری `/admin/dashboard` ماه را از `searchParams` می‌خواند و همان ماه را به لودرهای `admin-analytics` می‌دهد؛ همهٔ تجمیع‌ها روی رکوردهای همان ماه ساخته می‌شوند. تب «روند عملکرد» تنها جایی است که رکوردهای همهٔ ماه‌ها را می‌گیرد. نمرهٔ مشتری با همان کلید `targetId:targetRole` به `PersonAggregate` می‌پیوندد.

**Tech Stack:** Next.js 14 App Router (RSC)، TypeScript، Prisma، Radix Select، Tailwind، moment-jalaali.

**Spec:** `docs/superpowers/specs/2026-11-04-monthly-kpi-dashboard-design.md`

## Global Constraints

- بدون تغییر `prisma/schema.prisma` و بدون مهاجرت تازه.
- بدون افزودن وابستگی تازه به `package.json`.
- **بدون هارنس تست.** این پروژه هیچ ابزار تستی ندارد (§۸ سند). به‌جای چرخهٔ TDD، هر تسک با این سه چیز تأیید می‌شود: `npx tsc --noEmit`، `npm run lint`، و بررسی چشمی در برنامهٔ در حال اجرا. هر تسک «شرط پذیرش» خودش را دارد.
- وزن نمرهٔ نهایی: **۵۰٪ میانگین همکاران + ۵۰٪ میانگین مشتری**. اگر میانگین مشتری `null` باشد، نمرهٔ نهایی = میانگین همکاران.
- سطرهای `ClientEvaluation` با `skipped: true` نه در میانگین می‌آیند نه در شمارش.
- ماه پیش‌فرض = `getOpenPeriod()`؛ گزینهٔ «همهٔ ماه‌ها» وجود ندارد؛ ماه در URL به شکل `?month=<۱..۱۲>&year=<۱۴۰۰..۱۵۰۰>`.
- تب «روند عملکرد» هیچ ورودی فیلترشده‌ای نمی‌گیرد.
- فارسی و RTL؛ اعداد با `faNumber`/`faYear` از `@/lib/design-tokens`؛ فقط اجزای موجود در `src/components/ui`.

## Review Focus

1. **ماهِ بدون داده** (مثلاً ماه باز در روز اول): هر کارت باید `EmptyState` خودش را نشان بدهد، نه `۰` و نه `NaN`. — تسک ۳ و ۶
2. **پارامتر نامعتبر در URL** (`?month=99`، `?year=abc`، بدون پارامتر): باید بی‌سروصدا به ماه باز برگردد، نه خطا. — تسک ۳
3. **کسی که فقط نمرهٔ مشتری دارد** و در آن ماه هیچ ارزیابی همکاری نگرفته: نباید در جدول رتبه‌بندی بیاید (`peerCount > 0`). — تسک ۲ و ۴
4. **همهٔ نمره‌های مشتریِ یک نفر در آن ماه `skipped` باشد**: `clientAverage` باید `null` شود و «—» دیده شود، نه صفر که نمرهٔ نهایی را نصف کند. — تسک ۲
5. **مرز سال در فروردین**: «ماه قبل» برای کارت افت عملکرد باید اسفند سال قبل باشد. — تسک ۵

---

### Task 1: فیلتر ماه در لایهٔ تحلیل

**Files:**
- Modify: `src/lib/admin-analytics.ts` (`getRoleEvaluationRecords`, `getClientEvaluationRecords`, `getCoverageStats`)
- Modify: `src/app/(dashboard)/admin/reports/page.tsx` (فقط اگر امضای تابع شکسته شد — نباید بشکند)

**Interfaces:**
- Produces:
  - `export interface PeriodFilter { month: number; year: number }`
  - `getRoleEvaluationRecords(period?: PeriodFilter): Promise<EvalRecord[]>`
  - `getClientEvaluationRecords(period?: PeriodFilter): Promise<ClientEvalRecord[]>`
  - `getAvailablePeriods(): Promise<PeriodFilter[]>` — اجتماع ماه‌های موجود در `RoleEvaluation` و `ClientEvaluation`، مرتب نزولی (سال، بعد ماه)
  - `getCoverageStats(period: PeriodFilter): Promise<CoverageStats>`

- [ ] **Step 1: افزودن `PeriodFilter` و پارامتر اختیاری به دو لودر**

پارامتر `period` وقتی داده شد به `where` کوئری `findMany` اضافه می‌شود (`{ month, year }`)؛ وقتی داده نشد رفتار امروز عوض نمی‌شود. `/admin/reports` که بدون پارامتر صدا می‌زند باید دست‌نخورده کار کند.

- [ ] **Step 2: نوشتن `getAvailablePeriods()`**

دو `groupBy` روی `["year", "month"]` (یکی `roleEvaluation`، یکی `clientEvaluation`)، ادغام و یکتاسازی، مرتب‌سازی نزولی. بدون `prisma` آرایهٔ خالی برمی‌گرداند (مثل بقیهٔ توابع این فایل).

- [ ] **Step 3: ماه‌دار کردن `getCoverageStats`**

`period` را به‌جای `moment()` بگیرد. `filed` از `prisma.roleEvaluation.count({ where: { month, year } })` همان ماه. `expected` مثل امروز از ترکیب فعلی کارگروه‌ها حساب می‌شود (§۶.۴ سند: تاریخچهٔ عضویت ذخیره نمی‌شود). همان `CoverageStats` را برمی‌گرداند.

- [ ] **Step 4: تأیید**

Run: `npx tsc --noEmit` و `npm run lint`
Expected: بدون خطا؛ `/admin/reports` هنوز کامپایل می‌شود.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin-analytics.ts
git commit -m "feat(analytics): let record loaders and coverage take a period"
```

---

### Task 2: میانگین مشتری و نمرهٔ نهایی روی هر فرد

**Files:**
- Modify: `src/lib/admin-analytics.ts` (`PersonAggregate`, `aggregateByPerson`)

**Interfaces:**
- Consumes: `EvalRecord`, `ClientEvalRecord` از تسک ۱
- Produces:
  - `PersonAggregate` با سه فیلد تازه: `clientCount: number`، `clientAverage: number | null`، `finalScore: number`
  - `aggregateByPerson(records: EvalRecord[], clientRecords?: ClientEvalRecord[]): PersonAggregate[]`

- [ ] **Step 1: افزودن فیلدها و پارامتر دوم**

`clientRecords` اختیاری است تا مصرف‌کنندهٔ فعلی نشکند؛ نبودش یعنی `clientAverage: null`.

- [ ] **Step 2: محاسبه**

کلید پیوند همان `${targetId}:${targetRole}` است. سطرهای `skipped` نادیده گرفته می‌شوند. `clientCount === 0` → `clientAverage = null`.
`finalScore = clientAverage === null ? peerAverage : (peerAverage + clientAverage) / 2`

- [ ] **Step 3: ترتیب خروجی**

آرایه بر اساس `finalScore` نزولی مرتب برگردد (امروز بر اساس میانگین مرتب است؛ مصرف‌کننده‌ها به ترتیب تکیه می‌کنند).

- [ ] **Step 4: تأیید**

Run: `npx tsc --noEmit`
Expected: بدون خطا. دستی چک کنید: فردی با `clientCount: 0` نباید `finalScore`ش از `peerAverage` فاصله بگیرد.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin-analytics.ts
git commit -m "feat(analytics): blend client scores into each person's final score"
```

---

### Task 3: انتخابگر ماه و سیم‌کشی صفحه

**Files:**
- Create: `src/components/admin/dashboard/period-picker.tsx`
- Modify: `src/app/(dashboard)/admin/dashboard/page.tsx`

**Interfaces:**
- Consumes: `getAvailablePeriods`, `PeriodFilter` (تسک ۱)، `getOpenPeriod` از `@/lib/evaluation-period`
- Produces: `<PeriodPicker periods={PeriodItem[]} selected={PeriodItem} />` (نام کامپوننت عمداً با اینترفیس `PeriodFilter` در لایهٔ تحلیل فرق دارد تا تداخل نام نشود) که `PeriodItem = { month: number; year: number }`

- [ ] **Step 1: ساخت `period-picker.tsx`**

`"use client"`. `Select` از `@/components/ui/select` با `value={`${year}-${month}`}`؛ `onValueChange` با `useRouter().push(\`/admin/dashboard?month=…&year=…\`)`. برچسب هر گزینه: `${PERSIAN_MONTHS[month - 1]} ${faYear(year)}`. الگوی موجود در `src/components/admin/evaluation-period-form.tsx` را دنبال کنید.

- [ ] **Step 2: حل ماه در صفحه**

`page.tsx` امضای `({ searchParams }: { searchParams: { month?: string; year?: string } })` بگیرد. یک تابع محلی ماه را حل کند: عدد معتبر (`۱..۱۲` و `۱۴۰۰..۱۵۰۰`) → همان؛ وگرنه `getOpenPeriod()`. فهرست ماه‌ها = `getAvailablePeriods()` به‌علاوهٔ ماه باز اگر در فهرست نیست، دوباره مرتب نزولی.

- [ ] **Step 3: دادن ماه به لودرها و تجمیع‌ها**

`records` و `clientRecords` با `period` خوانده می‌شوند و به `aggregateByPerson(records, clientRecords)`، `aggregateByRole`، `aggregateByWorkgroup` و `stats` می‌روند. `getCoverageStats(period)`.
**برای تب روند**: یک جفت رکورد فیلترنشده هم خوانده می‌شود (`allRecords`) و فقط `aggregateByPeriod(allRecords)` و `aggregateByRole(allRecords)` به `PerformanceInsights`/`PerformanceTrends` داده می‌شود؛ `currentMonth`/`currentYear` همان ماه انتخاب‌شده.

- [ ] **Step 4: گذاشتن انتخابگر در سربرگ**

`<PageHeader … actions={<PeriodPicker … />} />`.

- [ ] **Step 5: تأیید در برنامه**

Run: `npm run dev`، بعد `/admin/dashboard`، `?month=99`، `?year=abc` و یک ماه بدون داده.
Expected: پیش‌فرض ماه باز؛ پارامتر نامعتبر بی‌خطا به ماه باز برمی‌گردد؛ ماه خالی `EmptyState` می‌دهد نه NaN؛ تب روند همچنان همهٔ ماه‌ها را دارد.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/dashboard/period-picker.tsx "src/app/(dashboard)/admin/dashboard/page.tsx"
git commit -m "feat(dashboard): scope the analytics dashboard to one month"
```

---

### Task 4: ستون‌های تازهٔ جدول رتبه‌بندی

**Files:**
- Modify: `src/components/admin/dashboard/team-leaderboard.tsx`

**Interfaces:**
- Consumes: `PersonAggregate` با `clientAverage`/`clientCount`/`finalScore` (تسک ۲)

- [ ] **Step 1: دو ستون تازه**

سرستون‌ها بعد از «میانگین همکاران»: «میانگین مشتری» و «نمرهٔ نهایی».
سلول مشتری: `clientAverage === null` → همان `<span className="text-xs text-foreground-subtle">—</span>` که ستون خودارزیابی استفاده می‌کند؛ وگرنه `<ScoreBadge score={clientAverage} size="sm" />`.
سلول نمرهٔ نهایی: `<ScoreBadge score={person.finalScore} size="sm" />`.

- [ ] **Step 2: ترتیب و رتبه**

`ranked` بر اساس `finalScore` نزولی مرتب شود (`peerCount > 0` را نگه دارید)، و `RankBadge` از همین ترتیب بیاید.

- [ ] **Step 3: متن زیر عنوان کارت**

`CardDescription` بگوید رتبه ترکیب نظر همکاران و مشتری در ماه انتخاب‌شده است.

- [ ] **Step 4: تأیید در برنامه**

Expected: ردیف پرهام قدسی/دستیار استراتژیست میانگین مشتری‌اش میانگین نمرهٔ کلینیک گیتا و والا بازیار همان ماه است؛ ردیف‌های تدوینگر و تصویربردار «—» دارند و نمرهٔ نهایی‌شان با میانگین همکارانشان یکی است.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/dashboard/team-leaderboard.tsx
git commit -m "feat(leaderboard): add the client average and final score columns"
```

---

### Task 5: تب هشدارها زیر فیلتر ماه

**Files:**
- Modify: `src/components/admin/dashboard/performance-alerts.tsx`
- Modify: `src/app/(dashboard)/admin/dashboard/page.tsx` (ساخت `unevaluated` و رکوردهای ماه قبل)

**Interfaces:**
- Consumes: `PersonAggregate`, `EvalRecord`
- Produces: `PerformanceAlerts` با یک prop تازه: `previousRecords: EvalRecord[]`

- [ ] **Step 1: ماه‌دار کردن «بدون ارزیابی»**

در `page.tsx`، `evaluatedKeys` از رکوردهای **ماه انتخاب‌شده** ساخته شود. متن کارت در کامپوننت به «در این ماه ارزیابی نشده‌اند» تغییر کند.

- [ ] **Step 2: رکوردهای ماه قبل**

در `page.tsx` ماه قبلِ ماه انتخاب‌شده حساب شود (فروردین → اسفند سال قبل) و رکوردهایش با `getRoleEvaluationRecords(previousPeriod)` خوانده و به `previousRecords` داده شود.

- [ ] **Step 3: بازنویسی محاسبهٔ «افت عملکرد»**

به‌جای «دو دورهٔ آخرِ آرایهٔ records»، میانگین همکارانِ هر فرد در `records` (ماه انتخاب‌شده) با میانگینش در `previousRecords` مقایسه شود؛ افت `>= DECLINE_DELTA` یعنی هشدار. خودارزیابی‌ها (`isSelf`) مثل امروز کنار گذاشته می‌شوند. کسی که در یکی از دو ماه داده ندارد، هشدار نمی‌سازد.

- [ ] **Step 4: تأیید در برنامه**

Expected: ماهی که ماه قبلش داده دارد، کارت افت عملکرد را پر می‌کند؛ فروردین با اسفند سال قبل مقایسه می‌شود؛ کارت «بدون ارزیابی» در ماه باز و خالی، فهرست روستر فعال را می‌دهد.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/dashboard/performance-alerts.tsx "src/app/(dashboard)/admin/dashboard/page.tsx"
git commit -m "feat(alerts): scope alerts to the selected month"
```

---

### Task 6: برچسب‌های صادقانهٔ کاشی‌ها

**Files:**
- Modify: `src/components/admin/dashboard/overview-stats-redesigned.tsx`
- Modify: `src/components/admin/dashboard/recent-activity.tsx`

**Interfaces:**
- Consumes: `OverviewStatsData`
- Produces: `OverviewStatsData` با یک فیلد تازه: `isOpenPeriod: boolean`

- [ ] **Step 1: علامت تقریبی روی کاشی درصد تکمیل**

`page.tsx` مقدار `isOpenPeriod` را از مقایسهٔ ماه انتخاب‌شده با `getOpenPeriod()` پر کند. وقتی `false` است، کاشی زیرنویس «تقریبی — بر اساس ترکیب فعلی تیم» بگیرد.

- [ ] **Step 2: روشن‌کردن عنوان «اعضای جدید»**

این کارت از فیلتر ماه پیروی نمی‌کند (§۶.۴ سند)؛ عنوان/زیرنویسش باید بگوید آخرین کاربران ساخته‌شده است، مستقل از ماه.

- [ ] **Step 3: عنوان بقیهٔ کاشی‌ها**

هرجا متن می‌گوید «این ماه» و حالا ماه انتخاب‌شده را نشان می‌دهد، نام همان ماه را بنویسد (`PERSIAN_MONTHS` + `faYear`).

- [ ] **Step 4: تأیید نهایی در برنامه**

Run: `npx tsc --noEmit`، `npm run lint`، و در برنامه: عوض‌کردن ماه و مقایسهٔ اعداد جدول با همان ماه در `/admin/reports`.
Expected: همهٔ اعداد صفحه با ماه عوض می‌شوند جز تب روند و کارت اعضای جدید.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/dashboard/overview-stats-redesigned.tsx src/components/admin/dashboard/recent-activity.tsx "src/app/(dashboard)/admin/dashboard/page.tsx"
git commit -m "feat(dashboard): say which month each tile is about"
```
