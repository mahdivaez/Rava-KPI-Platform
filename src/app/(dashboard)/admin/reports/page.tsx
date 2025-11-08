import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StrategistEvaluationsReport } from "@/components/admin/strategist-evaluations-report"
import { WriterEvaluationsReport } from "@/components/admin/writer-evaluations-report"
import { FeedbackReport } from "@/components/admin/feedback-report"

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

  // Get all strategist evaluations with full details
  const strategistEvaluations = await prisma.strategistEvaluation.findMany({
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
      { createdAt: 'desc' },
    ],
    include: {
      strategist: true,
      evaluator: true,
    },
  })

  // Get all writer evaluations with full details
  const writerEvaluations = await prisma.writerEvaluation.findMany({
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
      { createdAt: 'desc' },
    ],
    include: {
      writer: true,
      strategist: true,
      workgroup: true,
    },
  })

  // Get all writer feedbacks
  const writerFeedbacks = await prisma.writerFeedback.findMany({
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
      { createdAt: 'desc' },
    ],
    include: {
      writer: true,
      workgroup: true,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">گزارشات کامل سیستم</h1>
        <p className="text-slate-600 mt-1">
          مشاهده تمام ارزیابی‌ها و بازخوردها با جزئیات کامل
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

      {/* Detailed Reports Tabs */}
      <Tabs defaultValue="strategist" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="strategist">
            ارزیابی استراتژیست‌ها ({strategistEvaluations.length})
          </TabsTrigger>
          <TabsTrigger value="writer">
            ارزیابی نویسنده‌ها ({writerEvaluations.length})
          </TabsTrigger>
          <TabsTrigger value="feedback">
            بازخوردها ({writerFeedbacks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategist">
          <StrategistEvaluationsReport evaluations={strategistEvaluations} />
        </TabsContent>

        <TabsContent value="writer">
          <WriterEvaluationsReport evaluations={writerEvaluations} />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackReport feedbacks={writerFeedbacks} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
