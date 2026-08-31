"use client"

import { useMemo, useState } from "react"
import { ClipboardList, MinusCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { RoleBadge } from "@/components/ui/role-badge"
import { ScoreBadge, ScoreMeter } from "@/components/ui/score"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { faNumber } from "@/lib/design-tokens"
import { getClientRoleKpi } from "@/lib/client-kpis"
import type { TeamRole } from "@/lib/roles"

const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
]

export interface ClientEvaluationRow {
  id: string
  month: number
  year: number
  skipped: boolean
  averageScore: number
  totalScore: number
  scores: Record<string, number>
  answers: Record<string, string>
  targetName: string
  targetRole: TeamRole
  clientName: string
  brandName: string
  workgroupName: string
}

/**
 * What clients said, grouped as filed.
 *
 * Skipped entries are shown rather than hidden: «تعامل کافی نداشتم» from a
 * client is itself a signal about how visible that person is to the brand.
 */
export function ClientEvaluationsReport({
  evaluations,
}: {
  evaluations: ClientEvaluationRow[]
}) {
  const [period, setPeriod] = useState("all")
  const [workgroup, setWorkgroup] = useState("all")

  const periods = useMemo(() => {
    const seen = new Map<string, string>()
    for (const e of evaluations) {
      const key = `${e.year}-${e.month}`
      if (!seen.has(key)) {
        seen.set(key, `${PERSIAN_MONTHS[e.month - 1]} ${faNumber(e.year)}`)
      }
    }
    return Array.from(seen, ([value, label]) => ({ value, label }))
  }, [evaluations])

  const workgroups = useMemo(
    () => Array.from(new Set(evaluations.map((e) => e.workgroupName))),
    [evaluations]
  )

  const filtered = evaluations.filter((e) => {
    if (period !== "all" && `${e.year}-${e.month}` !== period) return false
    if (workgroup !== "all" && e.workgroupName !== workgroup) return false
    return true
  })

  if (evaluations.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList />}
        title="هنوز ارزیابی‌ای از مشتریان ثبت نشده است"
        description="پس از اینکه مشتری‌ها فرم ماهانه خود را تکمیل کنند، پاسخ‌هایشان اینجا نمایش داده می‌شود."
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-xl">
        <div className="space-y-1.5">
          <label
            htmlFor="ce-period"
            className="text-xs font-medium text-foreground-muted"
          >
            دوره
          </label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger id="ce-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه دوره‌ها</SelectItem>
              {periods.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="ce-workgroup"
            className="text-xs font-medium text-foreground-muted"
          >
            کارگروه
          </label>
          <Select value={workgroup} onValueChange={setWorkgroup}>
            <SelectTrigger id="ce-workgroup">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه کارگروه‌ها</SelectItem>
              {workgroups.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-foreground-muted">
        {faNumber(filtered.length)} ارزیابی
      </p>

      <div className="space-y-4">
        {filtered.map((evaluation) => {
          const kpi = getClientRoleKpi(evaluation.targetRole)
          const answers = Object.entries(evaluation.answers)

          return (
            <Card key={evaluation.id} elevation="flat">
              <CardContent className="space-y-4 pt-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                      {evaluation.targetName}
                      <RoleBadge role={evaluation.targetRole} size="sm" />
                    </p>
                    <p className="mt-1 text-xs text-foreground-muted">
                      از طرف {evaluation.clientName} ({evaluation.brandName}) —{" "}
                      {evaluation.workgroupName} ·{" "}
                      {PERSIAN_MONTHS[evaluation.month - 1]}{" "}
                      {faNumber(evaluation.year)}
                    </p>
                  </div>

                  {evaluation.skipped ? (
                    <Badge variant="neutral" size="sm">
                      <MinusCircle aria-hidden />
                      تعامل کافی نداشته
                    </Badge>
                  ) : (
                    <ScoreBadge score={evaluation.averageScore} showLabel />
                  )}
                </div>

                {!evaluation.skipped && kpi && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {kpi.metrics.map((metric) => (
                      <ScoreMeter
                        key={metric.key}
                        label={metric.title}
                        score={evaluation.scores[metric.key] ?? 0}
                        size="sm"
                      />
                    ))}
                  </div>
                )}

                {answers.length > 0 && kpi && (
                  <div className="space-y-3 border-t border-border pt-4">
                    {answers.map(([key, value]) => {
                      const question = kpi.questions.find((q) => q.key === key)
                      return (
                        <div key={key}>
                          <p className="text-xs font-medium text-foreground-muted">
                            {question?.question ?? key}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-foreground-secondary">
                            {value}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
