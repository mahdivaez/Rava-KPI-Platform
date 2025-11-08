import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function ReportsPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect('/dashboard')

  const stats = {
    totalUsers: await prisma.user.count(),
    activeUsers: await prisma.user.count({ where: { isActive: true } }),
    totalWorkgroups: await prisma.workgroup.count(),
    activeWorkgroups: await prisma.workgroup.count({ where: { isActive: true } }),
    strategistEvaluations: await prisma.strategistEvaluation.count(),
    writerEvaluations: await prisma.writerEvaluation.count(),
    writerFeedbacks: await prisma.writerFeedback.count(),
  }

  const recentStrategistEvaluations = await prisma.strategistEvaluation.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      strategist: true,
      evaluator: true,
    },
  })

  const recentWriterEvaluations = await prisma.writerEvaluation.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      writer: true,
      strategist: true,
      workgroup: true,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">گزارشات سیستم</h1>
        <p className="text-slate-600 mt-1">
          آمار و گزارشات کلی سیستم KPI
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">کاربران</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-slate-600 mt-1">
              {stats.activeUsers} فعال
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">کارگروه‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkgroups}</div>
            <p className="text-xs text-slate-600 mt-1">
              {stats.activeWorkgroups} فعال
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ارزیابی استراتژیست‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.strategistEvaluations}</div>
            <p className="text-xs text-slate-600 mt-1">تعداد کل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ارزیابی نویسنده‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.writerEvaluations}</div>
            <p className="text-xs text-slate-600 mt-1">
              + {stats.writerFeedbacks} بازخورد
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Evaluations */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>آخرین ارزیابی‌های استراتژیست</CardTitle>
            <CardDescription>
              {recentStrategistEvaluations.length} ارزیابی اخیر
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentStrategistEvaluations.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  هنوز ارزیابی ثبت نشده است
                </p>
              ) : (
                recentStrategistEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {evaluation.strategist.firstName} {evaluation.strategist.lastName}
                      </p>
                      <p className="text-sm text-slate-600">
                        {evaluation.month}/{evaluation.year}
                      </p>
                    </div>
                    <Badge variant={evaluation.status === "COMPLETED" ? "default" : "secondary"}>
                      {evaluation.status === "COMPLETED" ? "تکمیل شده" : "در انتظار"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>آخرین ارزیابی‌های نویسنده</CardTitle>
            <CardDescription>
              {recentWriterEvaluations.length} ارزیابی اخیر
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentWriterEvaluations.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  هنوز ارزیابی ثبت نشده است
                </p>
              ) : (
                recentWriterEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {evaluation.writer.firstName} {evaluation.writer.lastName}
                      </p>
                      <p className="text-sm text-slate-600">
                        {evaluation.workgroup.name} - {evaluation.month}/{evaluation.year}
                      </p>
                    </div>
                    <Badge variant={evaluation.status === "COMPLETED" ? "default" : "secondary"}>
                      {evaluation.status === "COMPLETED" ? "تکمیل شده" : "در انتظار"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

