"use client"

import {
  Award,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Target,
  Users,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RoleBadge } from "@/components/ui/role-badge"
import { ScoreMeter } from "@/components/ui/score"
import { StatCard, StatGrid } from "@/components/ui/stat-card"
import { getScoreBand, faNumber, faPercent } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"
import { PERSIAN_MONTHS, type RoleAggregate } from "@/lib/admin-analytics"

export interface OverviewStatsData {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  totalWorkgroups: number
  activeWorkgroups: number
  totalEvaluations: number
  peopleEvaluated: number
  selfEvaluations: number
  overallAverage: number
  clientEvaluations: number
  clientAverage: number
  clientSkipped: number
  /** Coverage for the current Persian month. */
  month: number
  year: number
  expectedThisMonth: number
  filedThisMonth: number
  completionRate: number
}

/**
 * The headline figures.
 *
 * The completion rate is now expected-versus-filed for the current month,
 * derived from the permission matrix. It used to divide the two legacy tables
 * by each other, which produced NaN the moment those tables were empty.
 */
export function OverviewStats({
  stats,
  roleAggregates,
}: {
  stats: OverviewStatsData
  roleAggregates: RoleAggregate[]
}) {
  const completion = Number.isFinite(stats.completionRate)
    ? stats.completionRate
    : 0
  const rolesWithData = roleAggregates.filter((r) => r.count > 0)
  const periodLabel = `${PERSIAN_MONTHS[stats.month - 1]} ${faNumber(stats.year)}`

  return (
    <div className="space-y-5">
      <StatGrid>
        <StatCard
          label="کل کاربران"
          value={faNumber(stats.totalUsers)}
          hint={`${faNumber(stats.activeUsers)} فعال · ${faNumber(stats.inactiveUsers)} غیرفعال`}
          icon={<Users />}
          tone="primary"
        />

        <StatCard
          label="ارزیابی‌های تیمی"
          value={faNumber(stats.totalEvaluations)}
          hint={`${faNumber(stats.peopleEvaluated)} نفر · ${faNumber(stats.selfEvaluations)} خودارزیابی`}
          icon={<Award />}
          tone="info"
        />

        <StatCard
          label="کارگروه‌ها"
          value={faNumber(stats.totalWorkgroups)}
          hint={`${faNumber(stats.activeWorkgroups)} کارگروه فعال`}
          icon={<Target />}
          tone="neutral"
        />

        {/* Completion carries a bar as well as a number. */}
        <Card className="p-5" elevation="raised">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-foreground-muted">
              نرخ تکمیل {periodLabel}
            </p>
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-success-subtle text-success"
            >
              <FileText className="size-[18px]" />
            </span>
          </div>
          <p
            data-numeric
            className="mt-3 font-display text-3xl font-bold leading-none text-foreground"
          >
            {stats.expectedThisMonth > 0 ? faPercent(completion, 1) : "—"}
          </p>
          <Progress
            value={completion}
            className="mt-3"
            aria-label="نرخ تکمیل ارزیابی‌های این ماه"
            indicatorClassName={completion >= 80 ? "bg-success" : "bg-primary"}
          />
          <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-foreground-subtle">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="size-3 text-success" aria-hidden />
              {faNumber(stats.filedThisMonth)} ثبت‌شده
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3 text-warning" aria-hidden />
              {faNumber(Math.max(0, stats.expectedThisMonth - stats.filedThisMonth))}{" "}
              باقی‌مانده
            </span>
          </p>
        </Card>
      </StatGrid>

      <div className="grid gap-4 md:grid-cols-2">
        <ScoreSummary
          label="میانگین کل تیم"
          score={stats.overallAverage}
          icon={<Award />}
          footLabel="ارزیابی ثبت‌شده"
          footValue={stats.totalEvaluations}
          hasData={stats.totalEvaluations > 0}
        />
        <ScoreSummary
          label="میانگین نظر مشتریان"
          score={stats.clientAverage}
          icon={<Building2 />}
          footLabel="نظر ثبت‌شده"
          footValue={stats.clientEvaluations}
          hasData={stats.clientEvaluations - stats.clientSkipped > 0}
          note={
            stats.clientSkipped > 0
              ? `${faNumber(stats.clientSkipped)} مورد «تعامل کافی نداشتم» در میانگین حساب نشده`
              : undefined
          }
        />
      </div>

      {/* Every role that has data, so no role can silently go missing. */}
      {rolesWithData.length > 0 && (
        <Card>
          <CardContent className="pt-5">
            <p className="mb-4 text-sm font-medium text-foreground-muted">
              میانگین به تفکیک نقش
            </p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {rolesWithData
                .slice()
                .sort((a, b) => b.average - a.average)
                .map((role) => (
                  <li key={role.role}>
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                      <RoleBadge role={role.role} size="sm" />
                      <span className="text-xs text-foreground-subtle">
                        {faNumber(role.count)} ارزیابی · {faNumber(role.peopleCount)} نفر
                      </span>
                    </div>
                    <ScoreMeter score={role.average} size="sm" showValue />
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * A headline average with its performance band.
 * The band's Persian word sits beside the colour, never behind it.
 */
function ScoreSummary({
  label,
  score,
  icon,
  footLabel,
  footValue,
  hasData,
  note,
}: {
  label: string
  score: number
  icon: React.ReactNode
  footLabel: string
  footValue: number
  hasData: boolean
  note?: string
}) {
  const value = Number.isFinite(score) ? score : 0
  const band = getScoreBand(value)

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-foreground-muted">{label}</p>
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground-secondary [&>svg]:size-[18px]"
          >
            {icon}
          </span>
        </div>

        {hasData ? (
          <>
            <div className="mt-3 flex items-baseline gap-2">
              <span
                data-numeric
                className={cn("font-display text-4xl font-bold leading-none", band.text)}
              >
                {faNumber(value, 2)}
              </span>
              <span className="text-sm text-foreground-subtle">از ۱۰</span>
            </div>

            <span
              className={cn(
                "mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                band.chip
              )}
            >
              <span aria-hidden className={cn("size-1.5 rounded-full", band.fill)} />
              {band.label}
            </span>
          </>
        ) : (
          // An empty dataset is stated, not rendered as a critical zero.
          <p className="mt-3 text-sm text-foreground-subtle">
            هنوز داده‌ای برای محاسبه میانگین ثبت نشده است
          </p>
        )}

        {note && (
          <p className="mt-3 text-xs leading-relaxed text-foreground-subtle">
            {note}
          </p>
        )}

        <div className="mt-4 flex items-baseline justify-between border-t border-border-subtle pt-3">
          <span className="text-xs text-foreground-muted">{footLabel}</span>
          <span data-numeric className="text-lg font-bold text-foreground">
            {faNumber(footValue)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
