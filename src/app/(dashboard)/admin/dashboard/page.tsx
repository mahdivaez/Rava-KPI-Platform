import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewStats } from "@/components/admin/dashboard/overview-stats-redesigned"
import { PerformanceTrends } from "@/components/admin/dashboard/performance-trends"
import { UserActivity } from "@/components/admin/dashboard/user-activity"
import { WorkgroupAnalytics } from "@/components/admin/dashboard/workgroup-analytics"
import { TopPerformers } from "@/components/admin/dashboard/top-performers"
import { RecentActivity } from "@/components/admin/dashboard/recent-activity"
import { EvaluationDistribution } from "@/components/admin/dashboard/evaluation-distribution"
import { PerformanceInsights } from "@/components/admin/dashboard/performance-insights"
import { TeamLeaderboard } from "@/components/admin/dashboard/team-leaderboard"
import { PerformanceAlerts } from "@/components/admin/dashboard/performance-alerts"

export default async function AdminDashboardPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect('/dashboard')

  // Get comprehensive statistics
  const [
    totalUsers,
    activeUsers,
    totalWorkgroups,
    activeWorkgroups,
    strategistMembers,
    writerMembers,
    strategistEvaluations,
    writerEvaluations,
    writerFeedbacks,
    recentUsers,
    recentEvaluations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.workgroup.count(),
    prisma.workgroup.count({ where: { isActive: true } }),
    prisma.workgroupMember.findMany({ 
      where: { role: 'STRATEGIST' },
      distinct: ['userId'],
      select: { userId: true }
    }),
    prisma.workgroupMember.findMany({ 
      where: { role: 'WRITER' },
      distinct: ['userId'],
      select: { userId: true }
    }),
    prisma.strategistEvaluation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        strategist: true,
        evaluator: true,
      },
    }),
    prisma.writerEvaluation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        writer: true,
        strategist: true,
        workgroup: true,
      },
    }),
    prisma.writerFeedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        writer: true,
        workgroup: true,
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.strategistEvaluation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        strategist: true,
        evaluator: true,
      },
    }),
  ])

  // Count unique strategists and writers
  const totalStrategists = strategistMembers.length
  const totalWriters = writerMembers.length

  // Calculate detailed statistics
  const completedStrategistEvals = strategistEvaluations.filter(e => e.status === 'COMPLETED').length
  const pendingStrategistEvals = strategistEvaluations.filter(e => e.status === 'PENDING').length
  const completedWriterEvals = writerEvaluations.filter(e => e.status === 'COMPLETED').length
  const pendingWriterEvals = writerEvaluations.filter(e => e.status === 'PENDING').length

  // Calculate average scores
  const avgStrategistScore = strategistEvaluations.length > 0
    ? strategistEvaluations.reduce((sum, e) => {
        const avg = (e.ideation + e.avgViews + e.qualityControl + e.teamRelations + 
                    e.clientRelations + e.responsiveness + e.clientSatisfaction) / 7
        return sum + avg
      }, 0) / strategistEvaluations.length
    : 0

  const avgWriterScore = writerEvaluations.length > 0
    ? writerEvaluations.reduce((sum, e) => {
        const avg = (e.responsibility + e.strategistSatisfaction + e.meetingEngagement + 
                    e.scenarioPerformance + e.clientSatisfaction + e.brandAlignment) / 6
        return sum + avg
      }, 0) / writerEvaluations.length
    : 0

  const avgFeedbackScore = writerFeedbacks.length > 0
    ? writerFeedbacks.reduce((sum, f) => {
        const avg = (f.communication + f.supportLevel + f.clarityOfTasks + f.feedbackQuality) / 4
        return sum + avg
      }, 0) / writerFeedbacks.length
    : 0

  // Get workgroup performance data
  const workgroups = await prisma.workgroup.findMany({
    include: {
      members: {
        include: { user: true }
      },
      writerEvaluations: true,
      writerFeedbacks: true,
    },
  })

  // Get all users for alerts component
  const allUsers = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'STRATEGIST' },
        { role: 'WRITER' }
      ]
    }
  })

  const stats = {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    totalWorkgroups,
    activeWorkgroups,
    inactiveWorkgroups: totalWorkgroups - activeWorkgroups,
    totalStrategists,
    totalWriters,
    totalEvaluations: strategistEvaluations.length + writerEvaluations.length,
    completedEvaluations: completedStrategistEvals + completedWriterEvals,
    pendingEvaluations: pendingStrategistEvals + pendingWriterEvals,
    totalFeedbacks: writerFeedbacks.length,
    avgStrategistScore: avgStrategistScore.toFixed(2),
    avgWriterScore: avgWriterScore.toFixed(2),
    avgFeedbackScore: avgFeedbackScore.toFixed(2),
    completionRate: ((completedStrategistEvals + completedWriterEvals) / 
                    (strategistEvaluations.length + writerEvaluations.length) * 100).toFixed(1),
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-nude-50 via-white to-nude-100 min-h-screen">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-nude-500 to-nude-600 flex items-center justify-center shadow-lg shadow-nude-500/20">
          <span className="text-3xl">📊</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-nude-900">داشبورد جامع مدیریت</h1>
          <p className="text-nude-600 mt-1 text-lg">
            تحلیل کامل عملکرد، آمار و گزارشات سیستم
          </p>
        </div>
      </div>

      {/* Main Overview Stats */}
      <OverviewStats stats={stats} />

      {/* Tabs for different analytics sections */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto bg-white border-2 border-nude-200 p-2 rounded-xl shadow-sm">
          <TabsTrigger value="overview" className="py-4 px-6 data-[state=active]:bg-nude-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-semibold transition-all">
            📈 نمای کلی
          </TabsTrigger>
          <TabsTrigger value="performance" className="py-4 px-6 data-[state=active]:bg-nude-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-semibold transition-all">
            🎯 روند عملکرد
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="py-4 px-6 data-[state=active]:bg-nude-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-semibold transition-all">
            🏆 رتبه‌بندی
          </TabsTrigger>
          <TabsTrigger value="alerts" className="py-4 px-6 data-[state=active]:bg-nude-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-semibold transition-all">
            ⚠️ هشدارها
          </TabsTrigger>
          <TabsTrigger value="workgroups" className="py-4 px-6 data-[state=active]:bg-nude-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-semibold transition-all">
            👥 کارگروه‌ها
          </TabsTrigger>
          <TabsTrigger value="activity" className="py-4 px-6 data-[state=active]:bg-nude-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-semibold transition-all">
            ⚡ فعالیت‌ها
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <EvaluationDistribution 
              strategistEvaluations={strategistEvaluations}
              writerEvaluations={writerEvaluations}
            />
            <TopPerformers 
              strategistEvaluations={strategistEvaluations}
              writerEvaluations={writerEvaluations}
            />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6 mt-6">
          {/* Performance Insights - Month over Month Growth */}
          <PerformanceInsights 
            strategistEvaluations={strategistEvaluations}
            writerEvaluations={writerEvaluations}
          />
          
          {/* Performance Trends Charts */}
          <PerformanceTrends 
            strategistEvaluations={strategistEvaluations}
            writerEvaluations={writerEvaluations}
            feedbacks={writerFeedbacks}
          />
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6 mt-6">
          <TeamLeaderboard 
            strategistEvaluations={strategistEvaluations}
            writerEvaluations={writerEvaluations}
            workgroups={workgroups}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6 mt-6">
          <PerformanceAlerts 
            strategistEvaluations={strategistEvaluations}
            writerEvaluations={writerEvaluations}
            users={allUsers}
          />
        </TabsContent>

        <TabsContent value="workgroups" className="space-y-6 mt-6">
          <WorkgroupAnalytics workgroups={workgroups} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6 mt-6">
          <RecentActivity 
            recentEvaluations={recentEvaluations}
            recentUsers={recentUsers}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

