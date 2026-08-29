import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/ui/page-header"
import {
  Activity,
  LayoutGrid,
  PieChart,
  TrendingUp,
  TriangleAlert,
  Trophy,
  Users,
} from "lucide-react"
import { OverviewStats } from "@/components/admin/dashboard/overview-stats-redesigned"
import { PerformanceTrends } from "@/components/admin/dashboard/performance-trends"
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
  // We get all users and the alerts component will filter based on evaluations
  const allUsers = await prisma.user.findMany({
    where: {
      isActive: true
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
    <div className="space-y-6">
      <PageHeader
        title="داشبورد تحلیلی"
        description="تحلیل کامل عملکرد، آمار و گزارشات سامانه"
        icon={<PieChart />}
        breadcrumbs={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "داشبورد تحلیلی" },
        ]}
      />

      {/* Main Overview Stats */}
      <OverviewStats stats={stats} />

      {/* Tabs for different analytics sections */}
      <Tabs defaultValue="overview" className="w-full">
        {/* The list scrolls on its own so the page never scrolls sideways. */}
        <TabsList className="w-full justify-start lg:w-fit">
          <TabsTrigger value="overview">
            <LayoutGrid aria-hidden />
            نمای کلی
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp aria-hidden />
            روند عملکرد
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Trophy aria-hidden />
            رتبه‌بندی
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <TriangleAlert aria-hidden />
            هشدارها
          </TabsTrigger>
          <TabsTrigger value="workgroups">
            <Users aria-hidden />
            کارگروه‌ها
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity aria-hidden />
            فعالیت‌ها
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
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

        <TabsContent value="performance" className="space-y-5">
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

        <TabsContent value="leaderboard" className="space-y-5">
          <TeamLeaderboard
            strategistEvaluations={strategistEvaluations}
            writerEvaluations={writerEvaluations}
            workgroups={workgroups}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-5">
          <PerformanceAlerts
            strategistEvaluations={strategistEvaluations}
            writerEvaluations={writerEvaluations}
            users={allUsers}
          />
        </TabsContent>

        <TabsContent value="workgroups" className="space-y-5">
          <WorkgroupAnalytics workgroups={workgroups} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-5">
          <RecentActivity
            recentEvaluations={recentEvaluations}
            recentUsers={recentUsers}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
