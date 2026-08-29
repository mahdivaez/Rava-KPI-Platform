"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"
import {
  AXIS_PROPS,
  ChartFrame,
  ChartTooltip,
  GRID_PROPS,
} from "@/components/ui/chart"
import { ScoreBadge } from "@/components/ui/score"
import { chartColor } from "@/lib/design-tokens"
import { Users, TrendingUp, Activity } from "lucide-react"

interface WorkgroupAnalyticsProps {
  workgroups: any[]
}

export function WorkgroupAnalytics({ workgroups }: WorkgroupAnalyticsProps) {
  // Calculate analytics for each workgroup
  const workgroupData = workgroups.map(wg => {
    const strategistCount = wg.members.filter((m: any) => m.role === 'STRATEGIST').length
    const writerCount = wg.members.filter((m: any) => m.role === 'WRITER').length
    const totalMembers = wg.members.length

    // Get member names with roles
    const members = wg.members.map((m: any) => ({
      name: `${m.user.firstName} ${m.user.lastName}`,
      role: m.role === 'STRATEGIST' ? 'استراتژیست' : 'نویسنده'
    }))

    // Calculate average evaluation scores
    let avgScore = 0
    if (wg.writerEvaluations.length > 0) {
      const totalScore = wg.writerEvaluations.reduce((sum: number, evaluation: any) => {
        const score = (evaluation.responsibility + evaluation.strategistSatisfaction + evaluation.meetingEngagement +
                      evaluation.scenarioPerformance + evaluation.clientSatisfaction + evaluation.brandAlignment) / 6
        return sum + score
      }, 0)
      avgScore = totalScore / wg.writerEvaluations.length
    }

    return {
      id: wg.id,
      name: wg.name,
      isActive: wg.isActive,
      strategistCount,
      writerCount,
      totalMembers,
      members,
      evaluationsCount: wg.writerEvaluations.length,
      feedbacksCount: wg.writerFeedbacks.length,
      avgScore: avgScore,
    }
  })

  // Sort by average score
  const sortedWorkgroups = [...workgroupData].sort((a, b) => b.avgScore - a.avgScore)
  
  // Data for chart (top 10 workgroups)
  const chartData = sortedWorkgroups.slice(0, 10).map(wg => ({
    name: wg.name.length > 15 ? wg.name.substring(0, 15) + '...' : wg.name,
    'میانگین امتیاز': parseFloat(wg.avgScore.toFixed(2)),
    'تعداد اعضا': wg.totalMembers,
  }))


  return (
    <div className="grid gap-6">
      {/* Two measures on different scales get two charts, never two y-axes:
          a dual-axis plot invites false correlations between them. */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>میانگین امتیاز کارگروه‌ها</CardTitle>
            <CardDescription>میانگین ارزیابی‌های هر کارگروه، از ۱۰</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartFrame
              height={Math.max(220, chartData.length * 44)}
              isEmpty={chartData.length === 0}
              emptyMessage="هنوز کارگروهی برای مقایسه وجود ندارد"
              summary="مقایسه میانگین امتیاز میان کارگروه‌ها."
            >
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
              >
                <CartesianGrid {...GRID_PROPS} horizontal={false} vertical />
                <XAxis type="number" domain={[0, 10]} reversed {...AXIS_PROPS} />
                <YAxis
                  type="category"
                  dataKey="name"
                  orientation="right"
                  width={130}
                  {...AXIS_PROPS}
                />
                <Tooltip
                  cursor={{ fill: "rgb(var(--surface-hover))" }}
                  content={<ChartTooltip unit="از ۱۰" />}
                />
                <Bar dataKey="میانگین امتیاز" fill={chartColor(1)} radius={4} maxBarSize={22} />
              </BarChart>
            </ChartFrame>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>اندازه کارگروه‌ها</CardTitle>
            <CardDescription>تعداد اعضای هر کارگروه</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartFrame
              height={Math.max(220, chartData.length * 44)}
              isEmpty={chartData.length === 0}
              emptyMessage="هنوز کارگروهی ایجاد نشده است"
              summary="تعداد اعضای هر کارگروه."
            >
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
              >
                <CartesianGrid {...GRID_PROPS} horizontal={false} vertical />
                <XAxis type="number" allowDecimals={false} reversed {...AXIS_PROPS} />
                <YAxis
                  type="category"
                  dataKey="name"
                  orientation="right"
                  width={130}
                  {...AXIS_PROPS}
                />
                <Tooltip
                  cursor={{ fill: "rgb(var(--surface-hover))" }}
                  content={<ChartTooltip unit="نفر" />}
                />
                <Bar dataKey="تعداد اعضا" fill={chartColor(7)} radius={4} maxBarSize={22} />
              </BarChart>
            </ChartFrame>
          </CardContent>
        </Card>
      </div>

      {/* Workgroup Details Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedWorkgroups.map((wg, index) => (
          <Card key={wg.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="border-b border-border-subtle">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {index < 3 && (
                      <span
                        data-numeric
                        aria-label={`رتبه ${index + 1}`}
                        className="grid size-6 shrink-0 place-items-center rounded-md bg-primary-subtle text-2xs font-bold text-primary-subtle-foreground"
                      >
                        {(index + 1).toLocaleString("fa-IR")}
                      </span>
                    )}
                    {wg.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {wg.isActive ? (
                      <Badge variant="outline" className="bg-surface-sunken text-foreground-secondary">فعال</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-surface-sunken text-foreground-muted">غیرفعال</Badge>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-foreground-muted">
                  <Users className="size-4" />
                  <span>اعضا</span>
                </div>
                <span className="font-semibold">{wg.totalMembers}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-muted">استراتژیست‌ها</span>
                <Badge variant="outline" className="bg-surface-sunken text-foreground-secondary">
                  {wg.strategistCount}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-muted">نویسندگان</span>
                <Badge variant="outline" className="bg-surface-sunken text-foreground-secondary">
                  {wg.writerCount}
                </Badge>
              </div>

              {/* Members List */}
              {wg.members.length > 0 && (
                <div className="pt-3 border-t">
                  <div className="text-sm font-medium text-foreground-secondary mb-2">اعضا:</div>
                  <div className="space-y-1">
                    {wg.members.map((member: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-foreground-muted">{member.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">ارزیابی‌ها</span>
                  <span className="font-medium">{wg.evaluationsCount}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">بازخوردها</span>
                  <span className="font-medium">{wg.feedbacksCount}</span>
                </div>
              </div>

              {wg.avgScore > 0 && (
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground-secondary">میانگین امتیاز</span>
                    <ScoreBadge score={wg.avgScore} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {workgroupData.length === 0 && (
        <Card className="">
          <CardContent className="py-12">
            <p className="text-center text-foreground-subtle">
              هنوز کارگروهی ایجاد نشده است
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

