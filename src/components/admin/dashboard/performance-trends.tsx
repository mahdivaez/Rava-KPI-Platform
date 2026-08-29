"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { LineChart as LineChartIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AXIS_PROPS,
  ChartFrame,
  ChartLegend,
  ChartTooltip,
  GRID_PROPS,
} from "@/components/ui/chart"
import { chartColor, SCORE_BANDS } from "@/lib/design-tokens"

interface PerformanceTrendsProps {
  strategistEvaluations: any[]
  writerEvaluations: any[]
  feedbacks: any[]
}

export function PerformanceTrends({ strategistEvaluations, writerEvaluations, feedbacks }: PerformanceTrendsProps) {
  // Process data for monthly trends
  const monthlyData = new Map()

  // Process strategist evaluations
  strategistEvaluations.forEach(evaluation => {
    const key = `${evaluation.year}-${String(evaluation.month).padStart(2, '0')}`
    if (!monthlyData.has(key)) {
      monthlyData.set(key, {
        month: `${evaluation.month}/${evaluation.year}`,
        strategistCount: 0,
        strategistAvg: 0,
        strategistTotal: 0,
        writerCount: 0,
        writerAvg: 0,
        writerTotal: 0,
        feedbackCount: 0,
        feedbackAvg: 0,
        feedbackTotal: 0,
      })
    }

    const data = monthlyData.get(key)
    const avg = (evaluation.ideation + evaluation.avgViews + evaluation.qualityControl + evaluation.teamRelations +
                evaluation.clientRelations + evaluation.responsiveness + evaluation.clientSatisfaction) / 7
    data.strategistCount++
    data.strategistTotal += avg
    data.strategistAvg = data.strategistTotal / data.strategistCount
  })

  // Process writer evaluations
  writerEvaluations.forEach(evaluation => {
    const key = `${evaluation.year}-${String(evaluation.month).padStart(2, '0')}`
    if (!monthlyData.has(key)) {
      monthlyData.set(key, {
        month: `${evaluation.month}/${evaluation.year}`,
        strategistCount: 0,
        strategistAvg: 0,
        strategistTotal: 0,
        writerCount: 0,
        writerAvg: 0,
        writerTotal: 0,
        feedbackCount: 0,
        feedbackAvg: 0,
        feedbackTotal: 0,
      })
    }

    const data = monthlyData.get(key)
    const avg = (evaluation.responsibility + evaluation.strategistSatisfaction + evaluation.meetingEngagement +
                evaluation.scenarioPerformance + evaluation.clientSatisfaction + evaluation.brandAlignment) / 6
    data.writerCount++
    data.writerTotal += avg
    data.writerAvg = data.writerTotal / data.writerCount
  })

  // Process feedbacks
  feedbacks.forEach(feedback => {
    const key = `${feedback.year}-${String(feedback.month).padStart(2, '0')}`
    if (!monthlyData.has(key)) {
      monthlyData.set(key, {
        month: `${feedback.month}/${feedback.year}`,
        strategistCount: 0,
        strategistAvg: 0,
        strategistTotal: 0,
        writerCount: 0,
        writerAvg: 0,
        writerTotal: 0,
        feedbackCount: 0,
        feedbackAvg: 0,
        feedbackTotal: 0,
      })
    }

    const data = monthlyData.get(key)
    const avg = (feedback.communication + feedback.supportLevel +
                feedback.clarityOfTasks + feedback.feedbackQuality) / 4
    data.feedbackCount++
    data.feedbackTotal += avg
    data.feedbackAvg = data.feedbackTotal / data.feedbackCount
  })

  const trendsData = Array.from(monthlyData.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(item => ({
      month: item.month,
      استراتژیست‌ها: parseFloat(item.strategistAvg.toFixed(2)),
      نویسندگان: parseFloat(item.writerAvg.toFixed(2)),
      بازخوردها: parseFloat(item.feedbackAvg.toFixed(2)),
    }))

  // Calculate score distribution for strategists
  const strategistScoreRanges = {
    'عالی (8-10)': 0,
    'خوب (6-8)': 0,
    'متوسط (4-6)': 0,
    'ضعیف (1-4)': 0,
  }

  strategistEvaluations.forEach(evaluation => {
    const avg = (evaluation.ideation + evaluation.avgViews + evaluation.qualityControl + evaluation.teamRelations +
                evaluation.clientRelations + evaluation.responsiveness + evaluation.clientSatisfaction) / 7
    if (avg >= 8) strategistScoreRanges['عالی (8-10)']++
    else if (avg >= 6) strategistScoreRanges['خوب (6-8)']++
    else if (avg >= 4) strategistScoreRanges['متوسط (4-6)']++
    else strategistScoreRanges['ضعیف (1-4)']++
  })

  const strategistDistribution = Object.entries(strategistScoreRanges).map(([name, value]) => ({
    name,
    value,
  }))

  // Calculate score distribution for writers
  const writerScoreRanges = {
    'عالی (8-10)': 0,
    'خوب (6-8)': 0,
    'متوسط (4-6)': 0,
    'ضعیف (1-4)': 0,
  }

  writerEvaluations.forEach(evaluation => {
    const avg = (evaluation.responsibility + evaluation.strategistSatisfaction + evaluation.meetingEngagement +
                evaluation.scenarioPerformance + evaluation.clientSatisfaction + evaluation.brandAlignment) / 6
    if (avg >= 8) writerScoreRanges['عالی (8-10)']++
    else if (avg >= 6) writerScoreRanges['خوب (6-8)']++
    else if (avg >= 4) writerScoreRanges['متوسط (4-6)']++
    else writerScoreRanges['ضعیف (1-4)']++
  })

  const writerDistribution = Object.entries(writerScoreRanges).map(([name, value]) => ({
    name,
    value,
  }))

  const hasTrend = trendsData.length > 0

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Performance trend — three series, so a legend is always present. */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>روند عملکرد ماهانه</CardTitle>
          <CardDescription>مقایسه میانگین امتیازات در طول زمان</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasTrend && (
            <ChartLegend
              items={[
                { label: "استراتژیست‌ها", color: chartColor(1) },
                { label: "نویسندگان", color: chartColor(7) },
                { label: "بازخوردها", color: chartColor(4) },
              ]}
            />
          )}
          <ChartFrame
            height={320}
            isEmpty={!hasTrend}
            emptyIcon={<LineChartIcon />}
            emptyMessage="هنوز ارزیابی‌ای برای رسم روند ثبت نشده است"
            summary="روند میانگین امتیاز استراتژیست‌ها، نویسندگان و بازخوردها به تفکیک ماه."
          >
            <LineChart data={trendsData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid {...GRID_PROPS} />
              {/* RTL: the time axis runs right-to-left, so the scale is reversed. */}
              <XAxis dataKey="month" reversed {...AXIS_PROPS} />
              <YAxis domain={[0, 10]} orientation="right" {...AXIS_PROPS} />
              <Tooltip
                cursor={{ stroke: "rgb(var(--border-strong))", strokeWidth: 1 }}
                content={<ChartTooltip unit="از ۱۰" />}
              />
              <Line
                type="monotone"
                dataKey="استراتژیست‌ها"
                stroke={chartColor(1)}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="نویسندگان"
                stroke={chartColor(7)}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="بازخوردها"
                stroke={chartColor(4)}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartFrame>
        </CardContent>
      </Card>

      <DistributionCard
        title="توزیع امتیازات استراتژیست‌ها"
        description="تعداد ارزیابی در هر باند عملکرد"
        data={strategistDistribution}
      />

      <DistributionCard
        title="توزیع امتیازات نویسندگان"
        description="تعداد ارزیابی در هر باند عملکرد"
        data={writerDistribution}
      />
    </div>
  )
}

/**
 * Score bands are an ordinal scale, so they get bars on a shared baseline
 * rather than a pie: length is far easier to compare than angle, and the
 * bars inherit the same band colours used everywhere else in the product.
 */
function DistributionCard({
  title,
  description,
  data,
}: {
  title: string
  description: string
  data: Array<{ name: string; value: number }>
}) {
  // Ordered high → low, matching the band order the rest of the UI uses.
  const BAND_FILL = [
    SCORE_BANDS[0].color, // عالی
    SCORE_BANDS[1].color, // خوب
    SCORE_BANDS[2].color, // متوسط
    SCORE_BANDS[3].color, // ضعیف
  ]

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartFrame
          height={280}
          isEmpty={total === 0}
          emptyMessage="هنوز ارزیابی‌ای ثبت نشده است"
          summary={`توزیع ${total} ارزیابی در چهار باند عملکرد.`}
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
          >
            <CartesianGrid {...GRID_PROPS} horizontal={false} vertical />
            <XAxis type="number" allowDecimals={false} reversed {...AXIS_PROPS} />
            <YAxis
              type="category"
              dataKey="name"
              orientation="right"
              width={110}
              {...AXIS_PROPS}
            />
            <Tooltip
              cursor={{ fill: "rgb(var(--surface-hover))" }}
              content={<ChartTooltip unit="ارزیابی" />}
            />
            <Bar dataKey="value" name="تعداد" radius={4} maxBarSize={28}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={BAND_FILL[index % BAND_FILL.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartFrame>
      </CardContent>
    </Card>
  )
}
