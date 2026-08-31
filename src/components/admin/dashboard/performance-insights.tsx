"use client"

import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { RoleBadge } from "@/components/ui/role-badge"
import { ScoreBadge } from "@/components/ui/score"
import { faNumber } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"
import { PERSIAN_MONTHS, type PeriodAggregate, type RoleAggregate } from "@/lib/admin-analytics"

type Trajectory = "improving" | "declining" | "stable"

/**
 * Month-over-month movement, per role.
 *
 * The previous version compared only استراتژیست and نویسنده, and rolled the
 * month over at 11 — the Persian year has 12, so every اسفند comparison read
 * the wrong month.
 */
export function PerformanceInsights({
  periods,
  roleAggregates,
  currentMonth,
  currentYear,
}: {
  periods: PeriodAggregate[]
  roleAggregates: RoleAggregate[]
  currentMonth: number
  currentYear: number
}) {
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear

  const current = periods.find(
    (p) => p.month === currentMonth && p.year === currentYear
  )
  const previous = periods.find(
    (p) => p.month === previousMonth && p.year === previousYear
  )

  const rolesWithData = roleAggregates.filter((r) => r.count > 0)

  if (rolesWithData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>روند ماهانه</CardTitle>
          <CardDescription>مقایسه این ماه با ماه قبل، به تفکیک نقش</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <EmptyState
            icon={<TrendingUp />}
            title="هنوز داده‌ای برای مقایسه نیست"
            description="پس از ثبت ارزیابی در دو ماه متوالی، رشد یا افت هر نقش اینجا نمایش داده می‌شود."
            size="sm"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>روند ماهانه به تفکیک نقش</CardTitle>
        <CardDescription>
          {PERSIAN_MONTHS[currentMonth - 1]} {faNumber(currentYear)} در مقایسه با{" "}
          {PERSIAN_MONTHS[previousMonth - 1]} {faNumber(previousYear)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryTile
            label="میانگین این ماه"
            value={current ? faNumber(current.average, 2) : "—"}
            hint={
              current
                ? `${faNumber(current.count)} ارزیابی`
                : "ارزیابی‌ای ثبت نشده"
            }
          />
          <SummaryTile
            label="میانگین ماه قبل"
            value={previous ? faNumber(previous.average, 2) : "—"}
            hint={
              previous
                ? `${faNumber(previous.count)} ارزیابی`
                : "ارزیابی‌ای ثبت نشده"
            }
          />
        </div>

        <ul className="divide-y divide-border-subtle rounded-xl border border-border">
          {rolesWithData.map((role) => {
            const now = current?.byRole[role.role]
            const before = previous?.byRole[role.role]
            const growth =
              typeof now === "number" && typeof before === "number" && before > 0
                ? ((now - before) / before) * 100
                : null

            const trajectory: Trajectory =
              growth === null
                ? "stable"
                : growth > 2
                  ? "improving"
                  : growth < -2
                    ? "declining"
                    : "stable"

            return (
              <li
                key={role.role}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <RoleBadge role={role.role} size="sm" />
                  <span className="text-xs text-foreground-subtle">
                    {faNumber(role.count)} ارزیابی
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {typeof now === "number" ? (
                    <ScoreBadge score={now} size="sm" />
                  ) : (
                    <span className="text-xs text-foreground-subtle">
                      این ماه ثبت نشده
                    </span>
                  )}
                  <GrowthChip growth={growth} trajectory={trajectory} />
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

function SummaryTile({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-sunken p-4">
      <p className="text-sm text-foreground-muted">{label}</p>
      <p
        data-numeric
        className="mt-1.5 font-display text-3xl font-bold leading-none text-foreground"
      >
        {value}
      </p>
      <p className="mt-1.5 text-xs text-foreground-subtle">{hint}</p>
    </div>
  )
}

/** The direction is stated in words as well as colour and arrow. */
function GrowthChip({
  growth,
  trajectory,
}: {
  growth: number | null
  trajectory: Trajectory
}) {
  if (growth === null) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground-muted">
        <Minus className="size-3" aria-hidden />
        بدون مقایسه
      </span>
    )
  }

  const tone =
    trajectory === "improving"
      ? "bg-success-subtle text-success"
      : trajectory === "declining"
        ? "bg-danger-subtle text-danger"
        : "bg-warning-subtle text-warning"

  const Icon =
    trajectory === "improving"
      ? ArrowUpRight
      : trajectory === "declining"
        ? ArrowDownRight
        : Minus

  const label =
    trajectory === "improving"
      ? "بهبود"
      : trajectory === "declining"
        ? "افت"
        : "ثابت"

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone
      )}
    >
      <Icon className="size-3" aria-hidden />
      {label}
      <span data-numeric className="font-normal opacity-80">
        {faNumber(Math.abs(growth), 1)}٪
      </span>
    </span>
  )
}

export type { Trajectory }
