"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"
import {
  AXIS_PROPS,
  ChartFrame,
  ChartTooltip,
  GRID_PROPS,
} from "@/components/ui/chart"
import { chartColor } from "@/lib/design-tokens"
import { Badge } from "@/components/ui/badge"

interface EvaluationDistributionProps {
  strategistEvaluations: any[]
  writerEvaluations: any[]
}

export function EvaluationDistribution({ strategistEvaluations, writerEvaluations }: EvaluationDistributionProps) {
  // Calculate detailed metrics for strategist evaluations
  const strategistMetrics = {
    ideation: 0,
    avgViews: 0,
    qualityControl: 0,
    teamRelations: 0,
    clientRelations: 0,
    responsiveness: 0,
    clientSatisfaction: 0,
  }

  strategistEvaluations.forEach(evaluation => {
    strategistMetrics.ideation += evaluation.ideation
    strategistMetrics.avgViews += evaluation.avgViews
    strategistMetrics.qualityControl += evaluation.qualityControl
    strategistMetrics.teamRelations += evaluation.teamRelations
    strategistMetrics.clientRelations += evaluation.clientRelations
    strategistMetrics.responsiveness += evaluation.responsiveness
    strategistMetrics.clientSatisfaction += evaluation.clientSatisfaction
  })

  const count = strategistEvaluations.length || 1
  const strategistData = [
    { metric: 'ایده‌پردازی', score: (strategistMetrics.ideation / count).toFixed(2) },
    { metric: 'میانگین بازدید', score: (strategistMetrics.avgViews / count).toFixed(2) },
    { metric: 'کنترل کیفیت', score: (strategistMetrics.qualityControl / count).toFixed(2) },
    { metric: 'روابط تیمی', score: (strategistMetrics.teamRelations / count).toFixed(2) },
    { metric: 'روابط با مشتری', score: (strategistMetrics.clientRelations / count).toFixed(2) },
    { metric: 'پاسخگویی', score: (strategistMetrics.responsiveness / count).toFixed(2) },
    { metric: 'رضایت مشتری', score: (strategistMetrics.clientSatisfaction / count).toFixed(2) },
  ]

  // Calculate detailed metrics for writer evaluations
  const writerMetrics = {
    responsibility: 0,
    strategistSatisfaction: 0,
    meetingEngagement: 0,
    scenarioPerformance: 0,
    clientSatisfaction: 0,
    brandAlignment: 0,
  }

  writerEvaluations.forEach(evaluation => {
    writerMetrics.responsibility += evaluation.responsibility
    writerMetrics.strategistSatisfaction += evaluation.strategistSatisfaction
    writerMetrics.meetingEngagement += evaluation.meetingEngagement
    writerMetrics.scenarioPerformance += evaluation.scenarioPerformance
    writerMetrics.clientSatisfaction += evaluation.clientSatisfaction
    writerMetrics.brandAlignment += evaluation.brandAlignment
  })

  const writerCount = writerEvaluations.length || 1
  const writerData = [
    { metric: 'مسئولیت‌پذیری', score: (writerMetrics.responsibility / writerCount).toFixed(2) },
    { metric: 'رضایت استراتژیست', score: (writerMetrics.strategistSatisfaction / writerCount).toFixed(2) },
    { metric: 'مشارکت در جلسات', score: (writerMetrics.meetingEngagement / writerCount).toFixed(2) },
    { metric: 'عملکرد سناریو', score: (writerMetrics.scenarioPerformance / writerCount).toFixed(2) },
    { metric: 'رضایت مشتری', score: (writerMetrics.clientSatisfaction / writerCount).toFixed(2) },
    { metric: 'هماهنگی با برند', score: (writerMetrics.brandAlignment / writerCount).toFixed(2) },
  ]

  // Status distribution
  const completedStrategist = strategistEvaluations.filter(evaluation => evaluation.status === 'COMPLETED').length
  const pendingStrategist = strategistEvaluations.filter(evaluation => evaluation.status === 'PENDING').length
  const completedWriter = writerEvaluations.filter(evaluation => evaluation.status === 'COMPLETED').length
  const pendingWriter = writerEvaluations.filter(evaluation => evaluation.status === 'PENDING').length

  return (
    <>
      <MetricsCard
        title="تحلیل معیارهای استراتژیست‌ها"
        data={strategistData}
        slot={1}
        completed={completedStrategist}
        pending={pendingStrategist}
      />
      <MetricsCard
        title="تحلیل معیارهای نویسندگان"
        data={writerData}
        slot={3}
        completed={completedWriter}
        pending={pendingWriter}
      />
    </>
  )
}

/**
 * One card per role: the average of each metric, as horizontal bars.
 *
 * Horizontal because the metric names are long Persian phrases — rotating
 * them under a vertical axis makes them unreadable on a phone.
 */
function MetricsCard({
  title,
  data,
  slot,
  completed,
  pending,
}: {
  title: string
  data: Array<{ metric: string; score: string }>
  slot: 1 | 3
  completed: number
  pending: number
}) {
  const rows = data.map((d) => ({ metric: d.metric, score: parseFloat(d.score) }))
  const isEmpty = rows.every((r) => !r.score)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>میانگین امتیاز هر معیار، از ۱۰</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Single series: the title names it, so no legend box is needed. */}
        <ChartFrame
          height={300}
          isEmpty={isEmpty}
          emptyMessage="هنوز ارزیابی‌ای ثبت نشده است"
          summary={`میانگین ${rows.length} معیار برای این نقش.`}
        >
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
          >
            <CartesianGrid {...GRID_PROPS} horizontal={false} vertical />
            <XAxis type="number" domain={[0, 10]} reversed {...AXIS_PROPS} />
            <YAxis
              type="category"
              dataKey="metric"
              orientation="right"
              width={130}
              {...AXIS_PROPS}
            />
            <Tooltip
              cursor={{ fill: "rgb(var(--surface-hover))" }}
              content={<ChartTooltip unit="از ۱۰" />}
            />
            <Bar
              dataKey="score"
              name="میانگین"
              fill={chartColor(slot)}
              radius={4}
              maxBarSize={22}
            />
          </BarChart>
        </ChartFrame>

        <div className="flex flex-wrap items-center gap-2 border-t border-border-subtle pt-4">
          <span className="text-sm text-foreground-muted">وضعیت ارزیابی‌ها:</span>
          <Badge variant="success" dot="bg-success">
            {completed.toLocaleString("fa-IR")} تکمیل‌شده
          </Badge>
          <Badge variant="warning" dot="bg-warning">
            {pending.toLocaleString("fa-IR")} در انتظار
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
