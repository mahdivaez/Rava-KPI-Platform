import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  ArrowLeft,
  BarChart3,
  ClipboardCheck,
  Database,
  FolderKanban,
  Mail,
  MessageSquareText,
  PieChart,
  ShieldCheck,
  TrendingUp,
  UserRound,
  UserRoundCog,
  Users,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { EmptyState } from "@/components/ui/empty-state"
import { RoleBadge } from "@/components/ui/role-badge"
import { StatCard, StatGrid } from "@/components/ui/stat-card"
import { isTeamRole, type TeamRole } from "@/lib/roles"
import { faNumber } from "@/lib/design-tokens"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const firstName = session.user.name?.split(" ")[0] ?? ""

  // Check if database is available
  if (!prisma) {
    return (
      <div className="space-y-6">
        <WelcomeBanner name={firstName} />
        <Alert variant="warning">
          <Database aria-hidden />
          <AlertTitle>دیتابیس در دسترس نیست</AlertTitle>
          <AlertDescription>
            این یک محیط توسعه است و از کاربران تست استفاده می‌شود. پس از اتصال
            دیتابیس، اطلاعات شما در این صفحه نمایش داده می‌شود.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Database is available, use it
  const prismaClient = prisma as any

  // Get user data
  const currentUser = await prismaClient.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  })

  // Get unread messages
  const unreadMessages = await prismaClient.message.count({
    where: {
      receiverId: session.user.id,
      isRead: false,
    },
  })

  const memberships = await prismaClient.workgroupMember.findMany({
    where: { userId: session.user.id },
    include: { workgroup: true },
  })

  // One entry per workgroup, carrying every role the user holds there.
  const myWorkgroups = Array.from(
    memberships
      .reduce((map: Map<string, any>, m: any) => {
        const existing = map.get(m.workgroupId)
        if (existing) existing.roles.push(m.role)
        else map.set(m.workgroupId, { ...m.workgroup, roles: [m.role] })
        return map
      }, new Map<string, any>())
      .values()
  ) as Array<{
    id: string
    name: string
    description: string | null
    isActive: boolean
    roles: string[]
  }>

  // Every distinct workgroup role this user holds, for badges and quick actions.
  const myTeamRoles: TeamRole[] = Array.from(
    new Set<TeamRole>(memberships.map((m: any) => m.role).filter(isTeamRole))
  )

  // Get stats for admin
  let adminStats = null
  if (session.user.isAdmin) {
    adminStats = {
      totalUsers: await prismaClient.user.count(),
      totalMessages: await prismaClient.message.count(),
    }
  }

  const getInitials = (name: string) =>
    name?.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase() ||
    "؟"

  const canEvaluateTeam = myTeamRoles.length > 0 || session.user.isAdmin
  const canEvaluateStrategists =
    session.user.isTechnicalDeputy || session.user.isAdmin

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------------------
          Identity — who you are and what you can do here
          --------------------------------------------------------------- */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <Avatar className="size-16 shrink-0 ring-2 ring-border sm:size-[72px]">
            <AvatarImage src={currentUser?.image || undefined} alt="" />
            <AvatarFallback className="text-lg">
              {getInitials(session.user.name || "")}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="space-y-1">
              <p className="text-sm text-foreground-muted">خوش آمدید</p>
              <h1 className="truncate text-2xl font-bold text-foreground sm:text-3xl">
                {session.user.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {session.user.isAdmin && (
                <Badge variant="info">
                  <ShieldCheck aria-hidden />
                  مدیر سیستم
                </Badge>
              )}
              {session.user.isTechnicalDeputy && (
                <Badge variant="secondary">معاون فنی</Badge>
              )}
              {myTeamRoles.map((role) => (
                <RoleBadge key={role} role={role} />
              ))}
              {!session.user.isAdmin &&
                !session.user.isTechnicalDeputy &&
                myTeamRoles.length === 0 && (
                  <Badge variant="neutral">بدون نقش کارگروهی</Badge>
                )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Headline figures
          --------------------------------------------------------------- */}
      <StatGrid className="xl:grid-cols-3">
        <StatCard
          label="پیام‌های خوانده‌نشده"
          value={faNumber(unreadMessages)}
          hint={
            unreadMessages > 0
              ? "برای مشاهده گفتگوها کلیک کنید"
              : "همه پیام‌ها خوانده شده‌اند"
          }
          icon={<MessageSquareText />}
          tone={unreadMessages > 0 ? "info" : "neutral"}
          href="/messages"
        />
        <StatCard
          label="کارگروه‌های من"
          value={faNumber(myWorkgroups.length)}
          hint={
            myWorkgroups.length > 0
              ? `${faNumber(myWorkgroups.filter((w) => w.isActive).length)} کارگروه فعال`
              : "هنوز عضو کارگروهی نیستید"
          }
          icon={<FolderKanban />}
          tone="primary"
        />
        <StatCard
          label="نقش‌های من"
          value={faNumber(myTeamRoles.length)}
          hint={
            myTeamRoles.length > 0
              ? "بر اساس این نقش‌ها ارزیابی می‌کنید"
              : "نقش‌ها را مدیر سیستم تعیین می‌کند"
          }
          icon={<UserRoundCog />}
          tone="neutral"
        />
      </StatGrid>

      {/* ---------------------------------------------------------------
          Admin console
          --------------------------------------------------------------- */}
      {session.user.isAdmin && adminStats && (
        <Card>
          <CardHeader>
            <CardTitle>پنل مدیریت</CardTitle>
            <CardDescription>دسترسی سریع به امکانات مدیریتی سامانه</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <MiniStat
                icon={<Users />}
                value={faNumber(adminStats.totalUsers)}
                label="کاربر ثبت‌شده"
              />
              <MiniStat
                icon={<Mail />}
                value={faNumber(adminStats.totalMessages)}
                label="پیام ردوبدل‌شده"
              />
              <MiniStat
                icon={<FolderKanban />}
                value={faNumber(myWorkgroups.length)}
                label="کارگروه شما"
                className="col-span-2 sm:col-span-1"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <QuickAction
                href="/admin/dashboard"
                icon={<PieChart />}
                title="داشبورد تحلیلی"
                description="آمار، روند عملکرد و رتبه‌بندی تیم"
              />
              <QuickAction
                href="/admin/reports"
                icon={<BarChart3 />}
                title="گزارش‌های کامل"
                description="همه ارزیابی‌ها با جزئیات"
              />
              <QuickAction
                href="/admin/users"
                icon={<Users />}
                title="کاربران"
                description="افزودن، ویرایش و فعال‌سازی حساب‌ها"
              />
              <QuickAction
                href="/admin/roles"
                icon={<UserRoundCog />}
                title="نقش‌ها و دسترسی‌ها"
                description="تخصیص نقش و ماتریس ارزیابی"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------------------------------------------------------------
          Everything this account can do
          --------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>امکانات من</CardTitle>
          <CardDescription>
            بر اساس نقش‌هایی که در سامانه دارید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {canEvaluateTeam && (
              <QuickAction
                href="/evaluations/team"
                icon={<ClipboardCheck />}
                title="ارزیابی همکاران"
                description="ارزیابی ماهانه اعضای تیم بر اساس نقش"
                emphasis
              />
            )}

            {canEvaluateStrategists && (
              <QuickAction
                href="/evaluations/strategist"
                icon={<TrendingUp />}
                title="ارزیابی استراتژیست‌ها"
                description="ثبت ارزیابی ماهانه معاون فنی"
              />
            )}

            <QuickAction
              href="/messages"
              icon={<MessageSquareText />}
              title="پیام‌ها"
              description={
                unreadMessages > 0
                  ? `${faNumber(unreadMessages)} پیام خوانده‌نشده`
                  : "گفتگو با همکاران"
              }
              badge={unreadMessages > 0 ? faNumber(unreadMessages) : undefined}
            />

            <QuickAction
              href="/profile"
              icon={<UserRound />}
              title="پروفایل من"
              description="ویرایش اطلاعات و تغییر رمز عبور"
            />
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------
          Workgroups
          --------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>کارگروه‌های من</CardTitle>
          <CardDescription>نقش‌های شما در هر کارگروه</CardDescription>
        </CardHeader>
        <CardContent>
          {myWorkgroups.length === 0 ? (
            <EmptyState
              icon={<FolderKanban />}
              title="هنوز عضو هیچ کارگروهی نیستید"
              description="عضویت در کارگروه‌ها توسط مدیر سیستم انجام می‌شود. پس از افزوده‌شدن، کارگروه‌ها اینجا نمایش داده می‌شوند."
              size="sm"
            />
          ) : (
            <ul className="stagger grid gap-3 lg:grid-cols-2">
              {myWorkgroups.map((group) => (
                <li
                  key={group.id}
                  className="rounded-xl border border-border bg-surface-sunken p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 flex-1 truncate font-semibold text-foreground">
                      {group.name}
                    </p>
                    <Badge
                      variant={group.isActive ? "success" : "neutral"}
                      size="sm"
                      dot={group.isActive ? "bg-success" : "bg-foreground-subtle"}
                    >
                      {group.isActive ? "فعال" : "غیرفعال"}
                    </Badge>
                  </div>

                  {group.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-foreground-muted">
                      {group.description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {group.roles.map((role) => (
                      <RoleBadge key={role} role={role} size="sm" />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ==========================================================================
   Local pieces
   ========================================================================== */

function WelcomeBanner({ name }: { name: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
        خوش آمدید، {name}
      </h1>
    </div>
  )
}

function MiniStat({
  icon,
  value,
  label,
  className,
}: {
  icon: React.ReactNode
  value: string
  label: string
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface-sunken p-4 ${className ?? ""}`}
    >
      <span
        aria-hidden
        className="mb-2.5 grid size-9 place-items-center rounded-lg bg-surface text-foreground-muted [&>svg]:size-[18px]"
      >
        {icon}
      </span>
      <p data-numeric className="font-display text-2xl font-bold text-foreground">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-foreground-muted">{label}</p>
    </div>
  )
}

function QuickAction({
  href,
  icon,
  title,
  description,
  emphasis = false,
  badge,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  /** The one action this screen most wants you to take. */
  emphasis?: boolean
  badge?: string
}) {
  return (
    <Link
      href={href}
      className={[
        "group relative flex items-start gap-3.5 rounded-xl border p-4",
        "transition-[border-color,background-color,box-shadow] duration-base ease-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        emphasis
          ? "border-primary/30 bg-primary-subtle hover:border-primary/50"
          : "border-border bg-surface-sunken hover:border-border-strong hover:bg-surface-hover",
      ].join(" ")}
    >
      <span
        aria-hidden
        className={[
          "grid size-10 shrink-0 place-items-center rounded-lg [&>svg]:size-5",
          emphasis
            ? "bg-primary text-primary-foreground"
            : "bg-surface text-foreground-muted",
        ].join(" ")}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-semibold text-foreground">{title}</span>
          {badge && (
            <span
              data-numeric
              className="rounded-full bg-danger px-1.5 text-2xs font-bold text-danger-foreground"
            >
              {badge}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-sm leading-relaxed text-foreground-muted">
          {description}
        </span>
      </span>

      <ArrowLeft
        aria-hidden
        className="mt-2.5 size-4 shrink-0 text-foreground-subtle transition-transform duration-base ease-out group-hover:-translate-x-1"
      />
    </Link>
  )
}
