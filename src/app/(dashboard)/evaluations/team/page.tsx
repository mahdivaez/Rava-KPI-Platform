import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ClipboardList, Plus } from "lucide-react"
import { RoleEvaluationsTable } from "@/components/evaluations/role-evaluations-table"
import { getEvaluableWorkgroups } from "@/lib/team-evaluations"
import { getRoleBadgeClass, getRoleLabel } from "@/lib/roles"
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-nude-900">ارزیابی تیم</h1>
          <p className="text-sm sm:text-base text-nude-600 mt-1">
            ارزیابی ماهانه اعضای تیم و خودارزیابی بر اساس نقش —{" "}
            {PERSIAN_MONTHS[currentMonth - 1]} {currentYear}
          </p>
        </div>
        {workgroups.length > 0 && (
          <Link href="/evaluations/team/new" className="flex-shrink-0">
            <Button className="bg-nude-600 hover:bg-nude-700 text-white w-full sm:w-auto text-sm sm:text-base">
              <Plus className="h-4 w-4 ml-2" />
              ارزیابی جدید
            </Button>
          </Link>
        )}
      </div>

      {workgroups.length === 0 ? (
        <Card className="border-nude-200">
          <CardContent className="p-8 text-center space-y-2">
            <p className="text-nude-900 font-semibold">
              در حال حاضر کسی برای ارزیابی به شما تخصیص داده نشده است
            </p>
            <p className="text-nude-600 text-sm">
              نقش‌های کارگروهی توسط مدیر سیستم تعیین می‌شوند.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Progress this month */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
            <Card className="card-nude border-nude-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-nude-700">
                  افراد قابل ارزیابی
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-nude-900">{totalTargets}</div>
              </CardContent>
            </Card>
            <Card className="card-nude border-nude-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-nude-700">
                  ثبت‌شده در این ماه
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{completedCount}</div>
              </CardContent>
            </Card>
            <Card className="card-nude border-nude-200 col-span-2 lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-nude-700">باقی‌مانده</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-nude-900">{pending.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Pending checklist */}
          <Card className="border-nude-200">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-nude-600" />
                در انتظار ارزیابی شما
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                افرادی که هنوز برای {PERSIAN_MONTHS[currentMonth - 1]} ارزیابی نکرده‌اید
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              {pending.length === 0 ? (
                <div className="flex items-center gap-2 text-success py-4">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    ارزیابی همه اعضا برای این ماه تکمیل شده است
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {pending.map((person) => (
                    <div
                      key={`${person.workgroupName}-${person.id}-${person.role}`}
                      className="flex items-center gap-2 border border-nude-200 rounded-lg px-3 py-2 bg-nude-50/60"
                    >
                      <span className="text-sm font-medium text-nude-900">
                        {person.isSelf
                          ? "خودارزیابی"
                          : `${person.firstName} ${person.lastName}`}
                      </span>
                      <Badge className={`text-xs ${getRoleBadgeClass(person.role)}`}>
                        {getRoleLabel(person.role)}
                      </Badge>
                      <span className="text-xs text-nude-500">{person.workgroupName}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Submitted evaluations */}
      <Card className="overflow-hidden border-nude-200">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">ارزیابی‌های ثبت‌شده توسط شما</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            تعداد کل: {evaluations.length} ارزیابی
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <RoleEvaluationsTable evaluations={evaluations} />
        </CardContent>
      </Card>
    </div>
  )
}
