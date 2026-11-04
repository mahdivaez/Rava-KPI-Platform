"use client"

import {
  CheckCircle2,
  Clock,
  Star,
  TrendingDown,
  TriangleAlert,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
import { faNumber, faYear } from "@/lib/design-tokens"
import { PERSIAN_MONTHS, type EvalRecord, type PersonAggregate } from "@/lib/admin-analytics"

/** Below this peer average, a person is surfaced for attention. */
const LOW_SCORE = 5
/** At or above this peer average, a person is surfaced as a standout. */
const HIGH_SCORE = 8.5
/** A drop of at least this much between the two latest periods is a decline. */
const DECLINE_DELTA = 1

interface UnevaluatedPerson {
  id: string
  name: string
  role: string
  workgroupName: string
}

/**
 * Who needs attention, across every role.
 *
 * The previous version walked the two legacy tables and labelled everyone it
 * found either استراتژیست or نویسنده, so a designer or editor could never
 * appear in an alert no matter how their scores moved.
 */
export function PerformanceAlerts({
  people,
  records,
  previousRecords,
  period,
  previousPeriod,
  unevaluated,
}: {
  people: PersonAggregate[]
  /** Peer evaluations filed in the month the dashboard is showing. */
  records: EvalRecord[]
  /** The month before it — the only thing a decline can be measured against. */
  previousRecords: EvalRecord[]
  period: { month: number; year: number }
  previousPeriod: { month: number; year: number }
  unevaluated: UnevaluatedPerson[]
}) {
  const labelOf = (p: { month: number; year: number }) =>
    `${PERSIAN_MONTHS[p.month - 1]} ${faYear(p.year)}`
  const rated = people.filter((p) => p.peerCount > 0)

  const lowScorers = rated
    .filter((p) => p.peerAverage < LOW_SCORE)
    .sort((a, b) => a.peerAverage - b.peerAverage)

  const topScorers = rated
    .filter((p) => p.peerAverage >= HIGH_SCORE)
    .slice(0, 8)

  // Decline is the selected month against the one before it, peer scores only,
  // so a single harsh self-evaluation cannot raise an alarm. Someone missing
  // from either month has nothing to compare and raises nothing.
  const peerAverageIn = (rows: EvalRecord[], person: PersonAggregate) => {
    const theirs = rows.filter(
      (r) => r.targetId === person.id && r.targetRole === person.role && !r.isSelf
    )
    if (!theirs.length) return null
    return theirs.reduce((sum, r) => sum + r.average, 0) / theirs.length
  }

  const declining = rated
    .map((person) => {
      const previous = peerAverageIn(previousRecords, person)
      const latest = peerAverageIn(records, person)
      if (previous === null || latest === null) return null
      if (previous - latest < DECLINE_DELTA) return null

      return { person, previous, latest }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.previous - b.latest - (a.previous - a.latest))

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <AlertCard
        icon={<TrendingDown />}
        title="افت عملکرد"
        description={`کاهش حداقل ${faNumber(DECLINE_DELTA)} نمره نسبت به ${labelOf(previousPeriod)}`}
        count={declining.length}
        tone="danger"
        emptyTitle="افت قابل توجهی ثبت نشده"
        emptyDescription={`هیچ‌کس نسبت به ${labelOf(previousPeriod)} افت معناداری نداشته است.`}
      >
        {declining.map(({ person, previous, latest }) => (
          <li
            key={`${person.id}-${person.role}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-sunken p-3"
          >
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-medium text-foreground">
                {person.name}
                <RoleBadge role={person.role} size="sm" showDot={false} />
              </p>
              <p className="mt-0.5 text-xs text-foreground-subtle">
                {labelOf(previousPeriod)}: {faNumber(previous, 1)} ←{" "}
                {labelOf(period)}:{" "}
                {faNumber(latest, 1)}
              </p>
            </div>
            <Badge variant="danger" size="sm">
              <TrendingDown aria-hidden />
              {faNumber(previous - latest, 1)} نمره افت
            </Badge>
          </li>
        ))}
      </AlertCard>

      <AlertCard
        icon={<TriangleAlert />}
        title="امتیاز پایین"
        description={`میانگین همکاران زیر ${faNumber(LOW_SCORE)} از ۱۰`}
        count={lowScorers.length}
        tone="warning"
        emptyTitle="کسی زیر حد هشدار نیست"
        emptyDescription={`میانگین همه افراد ارزیابی‌شده ${faNumber(LOW_SCORE)} یا بالاتر است.`}
      >
        {lowScorers.map((person) => (
          <li
            key={`${person.id}-${person.role}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-sunken p-3"
          >
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-medium text-foreground">
                {person.name}
                <RoleBadge role={person.role} size="sm" showDot={false} />
              </p>
              <p className="mt-0.5 text-xs text-foreground-subtle">
                {faNumber(person.peerCount)} ارزیابی · {person.workgroupNames.join("، ")}
              </p>
            </div>
            <ScoreBadge score={person.peerAverage} size="sm" showLabel />
          </li>
        ))}
      </AlertCard>

      <AlertCard
        icon={<Clock />}
        title="بدون ارزیابی در این ماه"
        description="اعضای فعالی که در ماه انتخاب‌شده هیچ ارزیابی‌ای دریافت نکرده‌اند"
        count={unevaluated.length}
        tone="neutral"
        emptyTitle="همه ارزیابی شده‌اند"
        emptyDescription="هر عضو فعال کارگروه‌ها در این ماه حداقل یک ارزیابی دارد."
      >
        {unevaluated.map((person) => (
          <li
            key={`${person.id}-${person.role}-${person.workgroupName}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-sunken p-3"
          >
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-medium text-foreground">
                {person.name}
                <RoleBadge role={person.role} size="sm" showDot={false} />
              </p>
              <p className="mt-0.5 text-xs text-foreground-subtle">
                {person.workgroupName}
              </p>
            </div>
            <Badge variant="neutral" size="sm">
              در این ماه ارزیابی نشده
            </Badge>
          </li>
        ))}
      </AlertCard>

      <AlertCard
        icon={<Star />}
        title="عملکرد برجسته"
        description={`میانگین همکاران ${faNumber(HIGH_SCORE, 1)} یا بالاتر`}
        count={topScorers.length}
        tone="success"
        emptyTitle="هنوز کسی به این حد نرسیده"
        emptyDescription={`به‌محض اینکه میانگین کسی به ${faNumber(HIGH_SCORE, 1)} برسد، اینجا دیده می‌شود.`}
      >
        {topScorers.map((person) => (
          <li
            key={`${person.id}-${person.role}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-sunken p-3"
          >
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-medium text-foreground">
                {person.name}
                <RoleBadge role={person.role} size="sm" showDot={false} />
              </p>
              <p className="mt-0.5 text-xs text-foreground-subtle">
                {faNumber(person.peerCount)} ارزیابی
              </p>
            </div>
            <ScoreBadge score={person.peerAverage} size="sm" showLabel />
          </li>
        ))}
      </AlertCard>
    </div>
  )
}

function AlertCard({
  icon,
  title,
  description,
  count,
  tone,
  emptyTitle,
  emptyDescription,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  count: number
  tone: "danger" | "warning" | "success" | "neutral"
  emptyTitle: string
  emptyDescription: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 [&>svg]:size-5 [&>svg]:text-foreground-subtle">
          {icon}
          {title}
          <Badge variant={tone} size="sm">
            {faNumber(count)}
          </Badge>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {count === 0 ? (
          <EmptyState
            icon={<CheckCircle2 />}
            title={emptyTitle}
            description={emptyDescription}
            size="sm"
          />
        ) : (
          <ul className="space-y-2.5">{children}</ul>
        )}
      </CardContent>
    </Card>
  )
}

export type { UnevaluatedPerson }
