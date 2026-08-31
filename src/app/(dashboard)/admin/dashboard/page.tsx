import { redirect } from "next/navigation"
import {
  Activity,
  LayoutGrid,
  PieChart,
  TrendingUp,
  TriangleAlert,
  Trophy,
  Users,
} from "lucide-react"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/ui/page-header"
import { OverviewStats } from "@/components/admin/dashboard/overview-stats-redesigned"
import { PerformanceTrends } from "@/components/admin/dashboard/performance-trends"
import { WorkgroupAnalytics } from "@/components/admin/dashboard/workgroup-analytics"
import { TopPerformers } from "@/components/admin/dashboard/top-performers"
import { RecentActivity } from "@/components/admin/dashboard/recent-activity"
import { EvaluationDistribution } from "@/components/admin/dashboard/evaluation-distribution"
import { PerformanceInsights } from "@/components/admin/dashboard/performance-insights"
import { TeamLeaderboard } from "@/components/admin/dashboard/team-leaderboard"
import {
  PerformanceAlerts,
  type UnevaluatedPerson,
} from "@/components/admin/dashboard/performance-alerts"
import {
  aggregateByPeriod,
  aggregateByPerson,
  aggregateByRole,
  aggregateByWorkgroup,
  getClientEvaluationRecords,
  getCoverageStats,
  getRoleEvaluationRecords,
  overallAverage,
} from "@/lib/admin-analytics"
import { isTeamRole, type TeamRole } from "@/lib/roles"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect("/dashboard")

  const [
    records,
    clientRecords,
    coverage,
    totalUsers,
    activeUsers,
    totalWorkgroups,
    activeWorkgroups,
    workgroupRows,
    recentUsers,
  ] = await Promise.all([
    getRoleEvaluationRecords(),
    getClientEvaluationRecords(),
    getCoverageStats(),
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.workgroup.count(),
    prisma.workgroup.count({ where: { isActive: true } }),
    prisma.workgroup.findMany({
      include: { members: { include: { user: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ])

  const people = aggregateByPerson(records)
  const roleAggregates = aggregateByRole(records)
  const periods = aggregateByPeriod(records)

  const workgroupSummaries = workgroupRows.map((w) => ({
    id: w.id,
    name: w.name,
    isActive: w.isActive,
  }))

  const members = workgroupRows.flatMap((w) =>
    w.members
      .filter((m) => isTeamRole(m.role))
      .map((m) => ({
        workgroupId: w.id,
        userId: m.userId,
        name: `${m.user.firstName} ${m.user.lastName}`,
        role: m.role as TeamRole,
      }))
  )

  const workgroupAggregates = aggregateByWorkgroup(
    records,
    clientRecords,
    workgroupRows.map((w) => ({
      id: w.id,
      name: w.name,
      memberCount: w.members.length,
    }))
  )

  // Active members who hold a role somewhere but have never been evaluated in
  // it — the honest denominator for "who is missing from the reports".
  const evaluatedKeys = new Set(records.map((r) => `${r.targetId}:${r.targetRole}`))
  const unevaluated: UnevaluatedPerson[] = workgroupRows.flatMap((w) =>
    w.members
      .filter((m) => isTeamRole(m.role) && m.user.isActive)
      .filter((m) => !evaluatedKeys.has(`${m.userId}:${m.role}`))
      .map((m) => ({
        id: m.userId,
        name: `${m.user.firstName} ${m.user.lastName}`,
        role: m.role,
        workgroupName: w.name,
      }))
  )

  const scoredClient = clientRecords.filter((r) => !r.skipped)

  const stats = {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    totalWorkgroups,
    activeWorkgroups,
    totalEvaluations: records.length,
    peopleEvaluated: new Set(records.map((r) => r.targetId)).size,
    selfEvaluations: records.filter((r) => r.isSelf).length,
    overallAverage: overallAverage(records),
    clientEvaluations: clientRecords.length,
    clientAverage: scoredClient.length
      ? scoredClient.reduce((sum, r) => sum + r.average, 0) / scoredClient.length
      : 0,
    clientSkipped: clientRecords.length - scoredClient.length,
    month: coverage.month,
    year: coverage.year,
    expectedThisMonth: coverage.expected,
    filedThisMonth: coverage.filed,
    completionRate: coverage.completionRate,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="داشبورد تحلیلی"
        description="تحلیل عملکرد همه نقش‌ها، کارگروه‌ها و نظر مشتریان"
        icon={<PieChart />}
        breadcrumbs={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "داشبورد تحلیلی" },
        ]}
      />

      <OverviewStats stats={stats} roleAggregates={roleAggregates} />

      <Tabs defaultValue="overview" className="w-full">
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
            <EvaluationDistribution roleAggregates={roleAggregates} />
            <TopPerformers people={people} />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-5">
          <PerformanceInsights
            periods={periods}
            roleAggregates={roleAggregates}
            currentMonth={coverage.month}
            currentYear={coverage.year}
          />
          <PerformanceTrends
            periods={periods}
            roleAggregates={roleAggregates}
            records={records}
          />
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-5">
          <TeamLeaderboard
            people={people}
            roleAggregates={roleAggregates}
            workgroups={workgroupAggregates}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-5">
          <PerformanceAlerts
            people={people}
            records={records}
            unevaluated={unevaluated}
          />
        </TabsContent>

        <TabsContent value="workgroups" className="space-y-5">
          <WorkgroupAnalytics
            aggregates={workgroupAggregates}
            workgroups={workgroupSummaries}
            members={members}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-5">
          <RecentActivity
            recentEvaluations={records.slice(0, 10)}
            recentClientEvaluations={clientRecords.slice(0, 8)}
            recentUsers={recentUsers}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
