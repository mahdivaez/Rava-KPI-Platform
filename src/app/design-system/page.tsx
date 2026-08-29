import type { Metadata } from "next"
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  FolderKanban,
  Info,
  MessageSquareText,
  Search,
  Users,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RoleBadge } from "@/components/ui/role-badge"
import { ScoreBadge, ScoreBandLegend, ScoreMeter } from "@/components/ui/score"
import { StatCard, StatGrid } from "@/components/ui/stat-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { BrandLockup } from "@/components/dashboard/brand"
import { DesignSystemCharts } from "@/components/design-system/charts-preview"
import { TEAM_ROLES } from "@/lib/roles"
import { faNumber } from "@/lib/design-tokens"

export const metadata: Metadata = {
  title: "سیستم طراحی",
  description: "مرجع زنده توکن‌ها و کامپوننت‌های سامانه راوا",
}

/* ==========================================================================
   Page
   ========================================================================== */

export default function DesignSystemPage() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-sticky border-b border-border bg-navbar/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <BrandLockup />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-foreground-muted sm:block">
              سیستم طراحی نسخه ۲٫۰
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-14 px-5 py-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">سیستم طراحی راوا</h1>
          <p className="max-w-2xl text-foreground-muted">
            مرجع زنده توکن‌ها، تایپوگرافی و کامپوننت‌های سامانه. هر آنچه در این
            صفحه می‌بینید همان کدی است که در محصول اجرا می‌شود — نه یک ماکت.
          </p>
        </div>

        <Colors />
        <Typography />
        <Elevation />
        <Buttons />
        <BadgesSection />
        <Forms />
        <Feedback />
        <Scores />
        <Roles />
        <StatsSection />
        <TableSection />
        <TabsSection />
        <ChartsSection />
      </main>
    </div>
  )
}

/* ==========================================================================
   Sections
   ========================================================================== */

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-5">
      <div className="space-y-1 border-b border-border pb-3">
        <h2 className="text-xl font-bold">{title}</h2>
        {description && (
          <p className="text-sm text-foreground-muted">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

function Swatch({
  name,
  className,
  note,
}: {
  name: string
  className: string
  note?: string
}) {
  return (
    <div className="space-y-1.5">
      <div className={`h-14 rounded-lg border border-border ${className}`} />
      <p className="text-xs font-medium text-foreground-secondary">{name}</p>
      {note && <p className="text-2xs text-foreground-subtle">{note}</p>}
    </div>
  )
}

function Colors() {
  return (
    <Section
      title="رنگ"
      description="سه لایه: پایه (رمپ‌ها) ← معنایی (نقش‌ها) ← کامپوننت. کامپوننت‌ها فقط لایه معنایی را می‌خوانند."
    >
      <div className="space-y-6">
        <div>
          <p className="section-label mb-3">خنثی گرم — Sand</p>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-12">
            {SAND_STEPS.map(([step, cls]) => (
              <Swatch key={step} name={step} className={cls} />
            ))}
          </div>
        </div>

        <div>
          <p className="section-label mb-3">سطوح و متن</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            <Swatch name="background" className="bg-background" />
            <Swatch name="surface" className="bg-surface" />
            <Swatch name="surface-sunken" className="bg-surface-sunken" />
            <Swatch name="border" className="bg-border" />
            <Swatch name="foreground" className="bg-foreground" />
            <Swatch name="foreground-muted" className="bg-foreground-muted" />
          </div>
        </div>

        <div>
          <p className="section-label mb-3">برند و وضعیت</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Swatch name="primary" className="bg-primary" note="۶٫۳:۱ روی سفید" />
            <Swatch name="success" className="bg-success" note="۵٫۰:۱" />
            <Swatch name="warning" className="bg-warning" note="۵٫۰:۱" />
            <Swatch name="danger" className="bg-danger" note="۴٫۸:۱" />
            <Swatch name="info" className="bg-info" note="۵٫۲:۱" />
          </div>
        </div>

        <div>
          <p className="section-label mb-3">
            پالت داده — هشت اسلات با ترتیب ثابت
          </p>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {CHART_SWATCHES.map(([name, cls]) => (
              <Swatch key={name} name={name} className={cls} />
            ))}
          </div>
          <p className="mt-3 text-xs text-foreground-subtle">
            اعتبارسنجی‌شده برای کوررنگی: کمترین اختلاف جفت‌های مجاور ΔE ۹٫۱ در
            روشن و ۸٫۴ در تیره. اسلات‌ها هرگز چرخه‌ای تکرار نمی‌شوند.
          </p>
        </div>
      </div>
    </Section>
  )
}

function Typography() {
  return (
    <Section
      title="تایپوگرافی"
      description="وزیرمتن برای متن و رابط کاربری؛ استعداد برای تیترها و اعداد شاخص. هر دو متغیر (Variable) و خودمیزبان."
    >
      <Card>
        <CardContent className="space-y-5 pt-6">
          {TYPE_SCALE.map((row) => (
            <div key={row.label} className="flex flex-wrap items-baseline gap-4">
              <p className={`${row.cls} min-w-0 flex-1`}>
                عملکرد تیم محتوا در این ماه بهبود چشمگیری داشته است
              </p>
              <span className="shrink-0 text-2xs text-foreground-subtle">
                {row.label}
              </span>
            </div>
          ))}

          <div className="border-t border-border-subtle pt-5">
            <p className="section-label mb-2">اعداد جدولی</p>
            <p data-numeric className="font-display text-3xl font-bold">
              ۱۲٬۴۸۰ · ۸٫۷۵ · ۹۳٪
            </p>
            <p className="mt-1 text-xs text-foreground-subtle">
              همه ستون‌های عددی از ارقام هم‌عرض استفاده می‌کنند تا هنگام تغییر
              مقدار، چیدمان نلرزد.
            </p>
          </div>
        </CardContent>
      </Card>
    </Section>
  )
}

function Elevation() {
  return (
    <Section
      title="ارتفاع و شعاع"
      description="سایه‌ها ته‌رنگ گرم دارند و هرگز مشکی خالص نیستند."
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {SHADOWS.map(([name, cls]) => (
          <div
            key={name}
            className={`grid h-24 place-items-center rounded-xl border border-border bg-card text-sm text-foreground-muted ${cls}`}
          >
            {name}
          </div>
        ))}
      </div>
    </Section>
  )
}

function Buttons() {
  return (
    <Section title="دکمه‌ها" description="هر صفحه فقط یک اقدام اصلی دارد.">
      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button>اقدام اصلی</Button>
            <Button variant="secondary">ثانویه</Button>
            <Button variant="outline">خطی</Button>
            <Button variant="subtle">ملایم</Button>
            <Button variant="ghost">شبح</Button>
            <Button variant="destructive">حذف</Button>
            <Button variant="link">پیوند</Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">کوچک</Button>
            <Button>معمولی</Button>
            <Button size="lg">بزرگ</Button>
            <Button size="icon" aria-label="جستجو">
              <Search aria-hidden />
            </Button>
            <Button loading>در حال ثبت</Button>
            <Button disabled>غیرفعال</Button>
          </div>
        </CardContent>
      </Card>
    </Section>
  )
}

function BadgesSection() {
  return (
    <Section
      title="نشان‌ها"
      description="رنگ هرگز تنها حامل معنا نیست؛ همیشه در کنار متن یا آیکون."
    >
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2.5 pt-6">
          <Badge>پیش‌فرض</Badge>
          <Badge variant="neutral">خنثی</Badge>
          <Badge variant="secondary">ثانویه</Badge>
          <Badge variant="outline">خطی</Badge>
          <Badge variant="success" dot="bg-success">
            فعال
          </Badge>
          <Badge variant="warning">
            <AlertTriangle aria-hidden />
            نیازمند بررسی
          </Badge>
          <Badge variant="danger">غیرفعال</Badge>
          <Badge variant="info">
            <Info aria-hidden />
            اطلاع
          </Badge>
        </CardContent>
      </Card>
    </Section>
  )
}

function Forms() {
  return (
    <Section
      title="فرم‌ها"
      description="برچسب همیشه دیده می‌شود؛ متن راهنما زیر فیلد می‌ماند و ناپدید نمی‌شود."
    >
      <Card>
        <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ds-name">نام و نام خانوادگی</Label>
            <Input id="ds-name" placeholder="مثلاً مهدی وحیدی" />
            <p className="text-xs text-foreground-subtle">
              همان‌طور که در گزارش‌ها نمایش داده می‌شود.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ds-email">ایمیل</Label>
            <Input
              id="ds-email"
              type="email"
              inputMode="email"
              defaultValue="not-an-email"
              aria-invalid
              aria-describedby="ds-email-error"
            />
            <p id="ds-email-error" role="alert" className="text-xs text-danger">
              قالب ایمیل معتبر نیست — مثال: name@company.com
            </p>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ds-note">توضیحات</Label>
            <Textarea id="ds-note" placeholder="نقاط قوت این ماه را بنویسید…" />
          </div>
        </CardContent>
      </Card>
    </Section>
  )
}

function Feedback() {
  return (
    <Section
      title="بازخورد و حالت خالی"
      description="هر پیام خطا علت و راه‌حل را با هم می‌گوید."
    >
      <div className="space-y-4">
        <Alert variant="info">
          <Info aria-hidden />
          <AlertTitle>دوره ارزیابی آبان باز است</AlertTitle>
          <AlertDescription>
            تا پایان ماه فرصت دارید ارزیابی همکاران خود را ثبت کنید.
          </AlertDescription>
        </Alert>

        <Alert variant="success">
          <CheckCircle2 aria-hidden />
          <AlertTitle>ارزیابی با موفقیت ثبت شد</AlertTitle>
        </Alert>

        <Alert variant="destructive">
          <AlertTriangle aria-hidden />
          <AlertTitle>ثبت ارزیابی انجام نشد</AlertTitle>
          <AlertDescription>
            امتیاز «کیفیت محتوا» وارد نشده است. پس از تکمیل، دوباره تلاش کنید.
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<FolderKanban />}
              title="هنوز عضو هیچ کارگروهی نیستید"
              description="عضویت در کارگروه‌ها توسط مدیر سیستم انجام می‌شود."
              action={<Button variant="outline">راهنمای شروع</Button>}
            />
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}

function Scores() {
  return (
    <Section
      title="امتیازها"
      description="مقیاس ۱ تا ۱۰ در چهار باند. باند همیشه با واژه فارسی همراه است، نه فقط رنگ."
    >
      <Card>
        <CardHeader>
          <CardTitle>باندهای عملکرد</CardTitle>
          <CardAction>
            <ScoreBandLegend />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2.5">
            <ScoreBadge score={9.2} showLabel />
            <ScoreBadge score={6.8} showLabel />
            <ScoreBadge score={4.5} showLabel />
            <ScoreBadge score={2.1} showLabel />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ScoreMeter score={9.1} label="کیفیت محتوا" />
            <ScoreMeter score={7.4} label="درک بریف" />
            <ScoreMeter score={5.2} label="تعهد به زمان‌بندی" />
            <ScoreMeter score={3.0} label="میزان اصلاحات" />
          </div>

          <div className="space-y-2">
            <p className="section-label">نوار پیشرفت</p>
            <Progress value={72} aria-label="پیشرفت" />
          </div>
        </CardContent>
      </Card>
    </Section>
  )
}

function Roles() {
  return (
    <Section
      title="نقش‌های تیم"
      description="هر نقش یک اسلات ثابت از پالت داده دارد؛ همان رنگ در نشان، راهنما و نمودار تکرار می‌شود."
    >
      <Card>
        <CardContent className="flex flex-wrap gap-2.5 pt-6">
          {TEAM_ROLES.map((role) => (
            <RoleBadge key={role} role={role} />
          ))}
        </CardContent>
      </Card>
    </Section>
  )
}

function StatsSection() {
  return (
    <Section
      title="کاشی‌های شاخص"
      description="وقتی داده فقط یک عدد سرخط است، کاشی سریع‌تر از هر نموداری خوانده می‌شود."
    >
      <StatGrid>
        <StatCard
          label="کل کاربران"
          value={faNumber(48)}
          hint="۴۵ کاربر فعال"
          icon={<Users />}
          tone="primary"
          delta={{ value: 8.3, label: "نسبت به ماه قبل" }}
        />
        <StatCard
          label="ارزیابی‌های ثبت‌شده"
          value={faNumber(312)}
          hint="آبان ۱۴۰۴"
          icon={<ClipboardCheck />}
          tone="success"
          delta={{ value: 12.5 }}
        />
        <StatCard
          label="میانگین امتیاز تیم"
          value="۷٫۸"
          hint="از ۱۰"
          icon={<BarChart3 />}
          tone="info"
          delta={{ value: -3.2 }}
        />
        <StatCard
          label="پیام‌های خوانده‌نشده"
          value={faNumber(6)}
          hint="برای مشاهده کلیک کنید"
          icon={<MessageSquareText />}
          tone="warning"
          delta={{ value: 0 }}
        />
      </StatGrid>
    </Section>
  )
}

const SAMPLE_ROWS = [
  { name: "سارا احمدی", role: "WRITER", group: "کارگروه برند", score: 9.2 },
  { name: "رضا کریمی", role: "DESIGNER", group: "کارگروه برند", score: 7.1 },
  { name: "نیلوفر مرادی", role: "EDITOR", group: "کارگروه رسانه", score: 5.4 },
  { name: "امیر حسینی", role: "SOCIAL_ADMIN", group: "کارگروه رسانه", score: 3.6 },
]

function TableSection() {
  return (
    <Section
      title="جدول داده"
      description="ترازبندی با کلیدهای منطقی start/end انجام می‌شود تا در راست‌به‌چپ و چپ‌به‌راست یکسان بماند."
    >
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام</TableHead>
              <TableHead>نقش</TableHead>
              <TableHead>کارگروه</TableHead>
              <TableHead className="text-center">میانگین</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SAMPLE_ROWS.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>
                  <RoleBadge role={row.role} size="sm" />
                </TableCell>
                <TableCell className="text-foreground-muted">{row.group}</TableCell>
                <TableCell className="text-center">
                  <ScoreBadge score={row.score} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Section>
  )
}

function TabsSection() {
  return (
    <Section title="تب‌ها" description="دو گونه: قرصی برای پنل‌ها، زیرخط‌دار برای بخش‌های صفحه.">
      <div className="space-y-6">
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">نمای کلی</TabsTrigger>
            <TabsTrigger value="b">روند عملکرد</TabsTrigger>
            <TabsTrigger value="c">رتبه‌بندی</TabsTrigger>
          </TabsList>
          <TabsContent value="a">
            <Card>
              <CardContent className="pt-6 text-sm text-foreground-muted">
                محتوای «نمای کلی»
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="b">
            <Card>
              <CardContent className="pt-6 text-sm text-foreground-muted">
                محتوای «روند عملکرد»
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="c">
            <Card>
              <CardContent className="pt-6 text-sm text-foreground-muted">
                محتوای «رتبه‌بندی»
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Tabs defaultValue="x">
          <TabsList variant="underline">
            <TabsTrigger variant="underline" value="x">
              اطلاعات شخصی
            </TabsTrigger>
            <TabsTrigger variant="underline" value="y">
              امنیت
            </TabsTrigger>
          </TabsList>
          <TabsContent value="x">
            <p className="pt-2 text-sm text-foreground-muted">محتوای «اطلاعات شخصی»</p>
          </TabsContent>
          <TabsContent value="y">
            <p className="pt-2 text-sm text-foreground-muted">محتوای «امنیت»</p>
          </TabsContent>
        </Tabs>
      </div>
    </Section>
  )
}

function ChartsSection() {
  return (
    <Section
      title="نمودارها"
      description="راهنما همیشه حاضر است، خطوط شبکه کم‌رنگ‌اند و داده بر تزئین اولویت دارد."
    >
      <DesignSystemCharts />
    </Section>
  )
}

/* ==========================================================================
   Literal token tables

   Tailwind scans source text for class names, so every utility shown in this
   page is written out in full rather than composed at runtime.
   ========================================================================== */

const SAND_STEPS: Array<[string, string]> = [
  ["50", "bg-sand-50"],
  ["100", "bg-sand-100"],
  ["200", "bg-sand-200"],
  ["300", "bg-sand-300"],
  ["400", "bg-sand-400"],
  ["500", "bg-sand-500"],
  ["600", "bg-sand-600"],
  ["700", "bg-sand-700"],
  ["800", "bg-sand-800"],
  ["900", "bg-sand-900"],
]

const CHART_SWATCHES: Array<[string, string]> = [
  ["chart-1", "bg-chart-1"],
  ["chart-2", "bg-chart-2"],
  ["chart-3", "bg-chart-3"],
  ["chart-4", "bg-chart-4"],
  ["chart-5", "bg-chart-5"],
  ["chart-6", "bg-chart-6"],
  ["chart-7", "bg-chart-7"],
  ["chart-8", "bg-chart-8"],
]

const SHADOWS: Array<[string, string]> = [
  ["shadow-xs", "shadow-xs"],
  ["shadow-sm", "shadow-sm"],
  ["shadow-md", "shadow-md"],
  ["shadow-lg", "shadow-lg"],
  ["shadow-xl", "shadow-xl"],
]

const TYPE_SCALE = [
  { cls: "font-display text-4xl font-bold", label: "۳۶px / تیتر صفحه" },
  { cls: "font-display text-2xl font-bold", label: "۲۴px / تیتر بخش" },
  { cls: "text-lg font-semibold", label: "۱۸px / تیتر کارت" },
  { cls: "text-base", label: "۱۶px / متن اصلی — ارتفاع خط ۱٫۷۵" },
  { cls: "text-sm text-foreground-muted", label: "۱۴px / متن فرعی" },
  { cls: "text-xs text-foreground-subtle", label: "۱۲px / برچسب" },
]
