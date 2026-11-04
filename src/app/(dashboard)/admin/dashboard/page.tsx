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
import { PeriodPicker, type PeriodItem } from "@/components/admin/dashboard/period-picker"
import {
  aggregateByPeriod,
  aggregateByPerson,
  aggregateByRole,
  aggregateByWorkgroup,
  getAvailablePeriods,
  getClientEvaluationRecords,
  getCoverageStats,
  getRoleEvaluationRecords,
  overallAverage,
} from "@/lib/admin-analytics"
import { isTeamRole, type TeamRole } from "@/lib/roles"
import { getOpenPeriod } from "@/lib/evaluation-period"

export const dynamic = "force-dynamic"

/**
 * The month the page is about: whatever the URL asks for, as long as it is a
 * real Persian period. Anything else — a missing, malformed or out-of-range
 * parameter — falls back to the open KPI month rather than erroring.
 */
function resolvePeriod(
  searchParams: { month?: string; year?: string },
  openPeriod: PeriodItem
): PeriodItem {
  const month = Number(searchParams.month)
  const year = Number(searchParams.year)

  const valid =
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12 &&
    Number.isInteger(year) &&
    year >= 1400 &&
    year <= 1500

  return valid ? { month, year } : openPeriod
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string }
}) {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect("/dashboard")

  const openPeriod = await getOpenPeriod()
  const period = resolvePeriod(searchParams, openPeriod)
  // Farvardin's predecessor is Esfand of the year before.
  const previousPeriod: PeriodItem =
    period.month === 1
      ? { month: 12, year: period.year - 1 }
      : { month: period.month - 1, year: period.year }

  // The open month belongs in the picker even before anyone files for it.
  const availablePeriods = await getAvailablePeriods()
  const periodOptions: PeriodItem[] = [
    ...availablePeriods,
    ...[openPeriod, period].filter(
      (candidate) =>
        !availablePeriods.some(
          (p) => p.month === candidate.month && p.year === candidate.year
        )
    ),
  ]
    .filter(
      (candidate, i, all) =>
        all.findIndex(
          (other) =>
            other.month === candidate.month && other.year === candidate.year
        ) === i
    )
    .sort((a, b) => (a.year !== b.year ? b.year - a.year : b.month - a.month))

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
    allRecords,
    previousRecords,
  ] = await Promise.all([
    getRoleEvaluationRecords(period),
    getClientEvaluationRecords(period),
    getCoverageStats(period),
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.workgroup.count(),
    prisma.workgroup.count({ where: { isActive: true } }),
    prisma.workgroup.findMany({
      include: { members: { include: { user: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    // The trend tab compares months, so it is the one view that never narrows.
    getRoleEvaluationRecords(),
    getRoleEvaluationRecords(previousPeriod),
  ])

  const people = aggregateByPerson(records, clientRecords)
  const roleAggregates = aggregateByRole(records)
  const periods = aggregateByPeriod(allRecords)
  const allRoleAggregates = aggregateByRole(allRecords)

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

  // Active members who hold a role somewhere and were not evaluated in it this
  // month — the follow-up list for the month on screen.
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
    isOpenPeriod:
      period.month === openPeriod.month && period.year === openPeriod.year,
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
        actions={<PeriodPicker periods={periodOptions} selected={period} />}
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
            roleAggregates={allRoleAggregates}
            currentMonth={period.month}
            currentYear={period.year}
          />
          <PerformanceTrends
            periods={periods}
            roleAggregates={allRoleAggregates}
            records={allRecords}
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
            previousRecords={previousRecords}
            period={period}
            previousPeriod={previousPeriod}
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
