"use client"

import { Award, CheckCircle2, Clock, FileText, Target, TrendingUp, Users } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StatCard, StatGrid } from "@/components/ui/stat-card"
import { getScoreBand, faNumber, faPercent } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"

interface OverviewStatsProps {
  stats: {
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
    totalWorkgroups: number
    activeWorkgroups: number
    inactiveWorkgroups: number
    totalStrategists: number
    totalWriters: number
    totalEvaluations: number
    completedEvaluations: number
    pendingEvaluations: number
    totalFeedbacks: number
    avgStrategistScore: string
    avgWriterScore: string
    avgFeedbackScore: string
    completionRate: string
  }
}

export function OverviewStats({ stats }: OverviewStatsProps) {
  const completionPercentage = parseFloat(stats.completionRate)
  const completion = Number.isFinite(completionPercentage) ? completionPercentage : 0

  return (
    <div className="space-y-5">
      {/* Headline figures */}
      <StatGrid>
        <StatCard
          label="کل کاربران"
          value={faNumber(stats.totalUsers)}
          hint={`${faNumber(stats.activeUsers)} فعال · ${faNumber(stats.inactiveUsers)} غیرفعال`}
          icon={<Users />}
          tone="primary"
        />

        <StatCard
          label="ارزیابی‌ها"
          value={faNumber(stats.totalEvaluations)}
          hint={`${faNumber(stats.completedEvaluations)} تکمیل‌شده · ${faNumber(stats.pendingEvaluations)} در انتظار`}
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
            <p className="text-sm font-medium text-foreground-muted">نرخ تکمیل</p>
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
            {faPercent(completion, 1)}
          </p>
          <Progress
            value={completion}
            className="mt-3"
            aria-label="نرخ تکمیل ارزیابی‌ها"
            indicatorClassName={completion >= 80 ? "bg-success" : "bg-primary"}
          />
          <p className="mt-2 flex items-center gap-3 text-xs text-foreground-subtle">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="size-3 text-success" aria-hidden />
              {faNumber(stats.completedEvaluations)} تکمیل‌شده
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3 text-warning" aria-hidden />
              {faNumber(stats.pendingEvaluations)} در انتظار
            </span>
          </p>
        </Card>
      </StatGrid>

      {/* Average scores */}
      <div className="grid gap-4 md:grid-cols-3">
        <ScoreSummary
          label="میانگین استراتژیست‌ها"
          score={stats.avgStrategistScore}
          icon={<TrendingUp />}
          footLabel="استراتژیست فعال"
          footValue={stats.totalStrategists}
        />
        <ScoreSummary
          label="میانگین نویسندگان"
          score={stats.avgWriterScore}
          icon={<FileText />}
          footLabel="نویسنده فعال"
          footValue={stats.totalWriters}
        />
        <ScoreSummary
          label="میانگین بازخوردها"
          score={stats.avgFeedbackScore}
          icon={<Award />}
          footLabel="بازخورد ثبت‌شده"
          footValue={stats.totalFeedbacks}
        />
      </div>
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
}: {
  label: string
  score: string
  icon: React.ReactNode
  footLabel: string
  footValue: number
}) {
  const numeric = parseFloat(score)
  const value = Number.isFinite(numeric) ? numeric : 0
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
