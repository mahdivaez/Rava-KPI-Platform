import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, ClipboardCheck, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Progress } from "@/components/ui/progress"
import { RoleBadge } from "@/components/ui/role-badge"
import { faNumber, faPercent, faYear } from "@/lib/design-tokens"
import { resolveClientGreeting } from "@/lib/client-greeting"
import { requireClient } from "@/lib/client-session"
import {
  currentPersianPeriod,
  getClientEvaluationTargets,
  getSubmittedTargetKeys,
} from "@/lib/client-evaluations"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "بخش ارزیابی",
}

const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
]

export default async function ClientDashboardPage() {
  const client = await requireClient()
  const greeting = resolveClientGreeting(client)
  const { month, year } = currentPersianPeriod()

  const [targets, submitted] = await Promise.all([
    getClientEvaluationTargets(client.workgroupId),
    getSubmittedTargetKeys(client.id, month, year),
  ])

  const doneCount = targets.filter((t) => submitted.has(t.key)).length
  const remaining = targets.length - doneCount
  const completionPct = targets.length ? (doneCount / targets.length) * 100 : 0
  const periodLabel = `${PERSIAN_MONTHS[month - 1]} ${faYear(year)}`

  return (
    <div className="space-y-6">
      {/* The greeting an admin authored for this specific client. */}
      <section className="rounded-2xl border border-border bg-surface-sunken px-6 py-8 sm:px-8 sm:py-10">
        <p className="text-sm font-medium text-foreground-muted">{periodLabel}</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
          {greeting.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground-secondary sm:text-base">
          {greeting.message}
        </p>
      </section>

      {targets.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<Users />}
              title="هنوز کسی برای ارزیابی تعریف نشده است"
              description="اعضای تیمی که روی برند شما کار می‌کنند توسط مدیریت راوا تعیین می‌شوند. به‌محض تعریف، فرم ارزیابی اینجا فعال می‌شود."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>ارزیابی {periodLabel}</CardTitle>
            <CardDescription>
              {remaining === 0
                ? "ارزیابی این ماه را کامل کرده‌اید."
                : `${faNumber(remaining)} نفر از تیم هنوز منتظر نظر شما هستند.`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-foreground-secondary">پیشرفت این ماه</span>
                <span data-numeric className="font-semibold text-foreground">
                  {faNumber(doneCount)} از {faNumber(targets.length)}
                  <span className="ms-2 font-normal text-foreground-muted">
                    ({faPercent(completionPct)})
                  </span>
                </span>
              </div>
              <Progress
                value={completionPct}
                aria-label="پیشرفت ارزیابی این ماه"
                indicatorClassName={completionPct === 100 ? "bg-success" : "bg-primary"}
              />
            </div>

            <ul className="grid gap-2 sm:grid-cols-2">
              {targets.map((target) => {
                const done = submitted.has(target.key)
                return (
                  <li
                    key={target.key}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3.5 py-3"
                  >
                    {done ? (
                      <CheckCircle2
                        className="size-4 shrink-0 text-success"
                        aria-hidden
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="size-4 shrink-0 rounded-full border-2 border-dashed border-border-strong"
                      />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                      {target.firstName} {target.lastName}
                    </span>
                    <RoleBadge role={target.role} size="sm" showDot={false} />
                    <span className="sr-only">
                      {done ? "ثبت شده" : "ثبت نشده"}
                    </span>
                  </li>
                )
              })}
            </ul>

            {remaining === 0 ? (
              <div className="flex items-center gap-2 rounded-xl bg-success-subtle px-4 py-3 text-success">
                <CheckCircle2 className="size-5 shrink-0" aria-hidden />
                <span className="text-sm font-medium">
                  ممنون از وقتی که گذاشتید — ارزیابی {periodLabel} کامل شد.
                </span>
              </div>
            ) : (
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/client/evaluate">
                  <ClipboardCheck aria-hidden />
                  {doneCount === 0 ? "شروع ارزیابی" : "ادامه ارزیابی"}
                  <ArrowLeft aria-hidden />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
