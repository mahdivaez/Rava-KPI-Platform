import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { CheckCircle2, ClipboardCheck, ClipboardList, Plus, UserPlus } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/ui/page-header"
import { Progress } from "@/components/ui/progress"
import { RoleBadge } from "@/components/ui/role-badge"
import { StatCard, StatGrid } from "@/components/ui/stat-card"
import { RoleEvaluationsTable } from "@/components/evaluations/role-evaluations-table"
import { getEvaluableWorkgroups } from "@/lib/team-evaluations"
import { faNumber, faPercent } from "@/lib/design-tokens"
import moment from "moment-jalaali"

const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
]

export default async function TeamEvaluationsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (!prisma) redirect("/dashboard")

  const workgroups = await getEvaluableWorkgroups(
    session.user.id,
    session.user.isAdmin
  )

  const evaluations = await prisma.roleEvaluation.findMany({
    where: { evaluatorId: session.user.id },
    include: { target: true, evaluator: true, workgroup: true },
    orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
  })

  const now = moment()
  const currentMonth = now.jMonth() + 1
  const currentYear = now.jYear()

  const doneThisMonth = new Set(
    evaluations
      .filter((e) => e.month === currentMonth && e.year === currentYear)
      .map((e) => `${e.workgroupId}:${e.targetId}:${e.targetRole}`)
  )

  const pending = workgroups.flatMap((workgroup) =>
    workgroup.members
      .filter((m) => !doneThisMonth.has(`${workgroup.id}:${m.id}:${m.role}`))
      .map((m) => ({ ...m, workgroupName: workgroup.name }))
  )

  const totalTargets = workgroups.reduce((sum, w) => sum + w.members.length, 0)
  const completedCount = totalTargets - pending.length
  const completionPct = totalTargets > 0 ? (completedCount / totalTargets) * 100 : 0

  const periodLabel = `${PERSIAN_MONTHS[currentMonth - 1]} ${faNumber(currentYear)}`

  return (
    <div className="space-y-6">
      <PageHeader
        title="ارزیابی تیم"
        description={`ارزیابی ماهانه اعضای تیم و خودارزیابی بر اساس نقش — ${periodLabel}`}
        icon={<ClipboardCheck />}
        breadcrumbs={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "ارزیابی تیم" },
        ]}
        actions={
          workgroups.length > 0 ? (
            <Button asChild>
              <Link href="/evaluations/team/new">
                <Plus aria-hidden />
                ارزیابی جدید
              </Link>
            </Button>
          ) : null
        }
      />

      {workgroups.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<UserPlus />}
              title="کسی برای ارزیابی به شما تخصیص داده نشده است"
              description="نقش‌های کارگروهی و ماتریس دسترسی ارزیابی توسط مدیر سیستم تعیین می‌شوند. پس از تخصیص نقش، اعضای قابل ارزیابی اینجا فهرست می‌شوند."
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Progress this month */}
          <StatGrid className="xl:grid-cols-3">
            <StatCard
              label="افراد قابل ارزیابی"
              value={faNumber(totalTargets)}
              hint={`در ${faNumber(workgroups.length)} کارگروه`}
              icon={<ClipboardList />}
              tone="neutral"
            />
            <StatCard
              label="ثبت‌شده در این ماه"
              value={faNumber(completedCount)}
              hint={periodLabel}
              icon={<CheckCircle2 />}
              tone={completedCount === totalTargets ? "success" : "neutral"}
            />
            <StatCard
              label="باقی‌مانده"
              value={faNumber(pending.length)}
              hint={
                pending.length === 0
                  ? "همه ارزیابی‌های این ماه انجام شده"
                  : "هنوز ثبت نشده‌اند"
              }
              icon={<ClipboardCheck />}
              tone={pending.length > 0 ? "warning" : "success"}
            />
          </StatGrid>

          {/* Pending checklist */}
          <Card>
            <CardHeader>
              <CardTitle>در انتظار ارزیابی شما</CardTitle>
              <CardDescription>
                افرادی که هنوز برای {PERSIAN_MONTHS[currentMonth - 1]} ارزیابی
                نکرده‌اید
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Progress reads as a number and a bar, not colour alone. */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-foreground-secondary">پیشرفت این ماه</span>
                  <span data-numeric className="font-semibold text-foreground">
                    {faNumber(completedCount)} از {faNumber(totalTargets)}
                    <span className="ms-2 font-normal text-foreground-muted">
                      ({faPercent(completionPct)})
                    </span>
                  </span>
                </div>
                <Progress
                  value={completionPct}
                  aria-label="پیشرفت ارزیابی‌های این ماه"
                  indicatorClassName={
                    completionPct === 100 ? "bg-success" : "bg-primary"
                  }
                />
              </div>

              {pending.length === 0 ? (
                <div className="flex items-center gap-2 rounded-xl bg-success-subtle px-4 py-3 text-success">
                  <CheckCircle2 className="size-5 shrink-0" aria-hidden />
                  <span className="text-sm font-medium">
                    ارزیابی همه اعضا برای این ماه تکمیل شده است
                  </span>
                </div>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {pending.map((person) => (
                    <li
                      key={`${person.workgroupName}-${person.id}-${person.role}`}
                      className="flex items-center gap-2 rounded-lg border border-border bg-surface-sunken px-3 py-2"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {person.isSelf
                          ? "خودارزیابی"
                          : `${person.firstName} ${person.lastName}`}
                      </span>
                      <RoleBadge role={person.role} size="sm" />
                      <span className="text-xs text-foreground-subtle">
                        {person.workgroupName}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Submitted evaluations */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>ارزیابی‌های ثبت‌شده توسط شما</CardTitle>
          <CardDescription>
            تعداد کل: {faNumber(evaluations.length)} ارزیابی
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0 sm:px-0">
          <RoleEvaluationsTable evaluations={evaluations} />
        </CardContent>
      </Card>
    </div>
  )
}
