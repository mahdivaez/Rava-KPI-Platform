import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StrategistEvaluationsReport } from "@/components/admin/strategist-evaluations-report"
import { WriterEvaluationsReport } from "@/components/admin/writer-evaluations-report"
import { FeedbackReport } from "@/components/admin/feedback-report"

export default async function ReportsPage() {
  const session = await getSession()
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

  const strategistIds = Array.from(
    new Set(writerFeedbacks.map((f) => f.strategistId).filter(Boolean))
  )

  const strategists = strategistIds.length
    ? await prisma.user.findMany({
        where: { id: { in: strategistIds } },
      })
    : []

  const strategistById = new Map(strategists.map((s) => [s.id, s]))

  const writerFeedbacksWithStrategist = writerFeedbacks.map((f) => ({
    ...f,
    strategist: strategistById.get(f.strategistId) || null,
  }))

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">گزارشات کامل سیستم</h1>
        <p className="text-xs sm:text-sm lg:text-base text-slate-600 mt-1">
          مشاهده تمام ارزیابی‌ها و بازخوردها با جزئیات کامل
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-semibold">کاربران</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-3 sm:p-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-slate-600 mt-1">
              {stats.activeUsers} فعال
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-semibold">کارگروه‌ها</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-3 sm:p-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.totalWorkgroups}</div>
            <p className="text-xs text-slate-600 mt-1">
              {stats.activeWorkgroups} فعال
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-2 sm:col-span-1 shadow-sm">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-semibold leading-tight">ارزیابی های معاون فنی</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-3 sm:p-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.strategistEvaluations}</div>
            <p className="text-xs text-slate-600 mt-1">تعداد کل</p>
          </CardContent>
        </Card>

        <Card className="col-span-2 sm:col-span-1 shadow-sm">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-semibold leading-tight">ارزیابی های استراتژیست</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-3 sm:p-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.writerEvaluations}</div>
            <p className="text-xs text-slate-600 mt-1">تعداد کل</p>
          </CardContent>
        </Card>

        <Card className="col-span-2 sm:col-span-1 shadow-sm">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-semibold leading-tight">ارزیابی های نویسنده</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-3 sm:p-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.writerFeedbacks}</div>
            <p className="text-xs text-slate-600 mt-1">تعداد کل</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports Tabs */}
      <Tabs defaultValue="strategist" className="w-full">
        <div className="w-full overflow-x-auto pb-2 -mx-3 sm:mx-0 px-3 sm:px-0">
          <TabsList className="inline-flex w-full min-w-max lg:grid lg:grid-cols-3 h-auto bg-white border-2 border-slate-200 p-1 sm:p-1.5 lg:p-2 rounded-lg sm:rounded-xl shadow-sm">
            <TabsTrigger 
              value="strategist" 
              className="py-2 px-2 sm:py-2.5 sm:px-3 lg:py-3 lg:px-4 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md sm:rounded-lg font-semibold transition-all text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
            >
              ارزیابی‌های معاون فنی ({strategistEvaluations.length})
            </TabsTrigger>
            <TabsTrigger 
              value="writer"
              className="py-2 px-2 sm:py-2.5 sm:px-3 lg:py-3 lg:px-4 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md sm:rounded-lg font-semibold transition-all text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
            >
              ارزیابی های استراتژیست ({writerEvaluations.length})
            </TabsTrigger>
            <TabsTrigger 
              value="feedback"
              className="py-2 px-2 sm:py-2.5 sm:px-3 lg:py-3 lg:px-4 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md sm:rounded-lg font-semibold transition-all text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
            >
              ارزیابی های نویسنده ({writerFeedbacks.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="strategist" className="mt-4 sm:mt-6">
          <StrategistEvaluationsReport evaluations={strategistEvaluations} />
        </TabsContent>

        <TabsContent value="writer" className="mt-4 sm:mt-6">
          <WriterEvaluationsReport evaluations={writerEvaluations} />
        </TabsContent>

        <TabsContent value="feedback" className="mt-4 sm:mt-6">
          <FeedbackReport feedbacks={writerFeedbacksWithStrategist} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
