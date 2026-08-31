"use client"

import { useState } from "react"
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
  CardAction,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ROLE_SLOT, SCORE_BANDS, chartColor, faNumber } from "@/lib/design-tokens"
import { getRoleLabel, type TeamRole } from "@/lib/roles"
import type { EvalRecord, PeriodAggregate, RoleAggregate } from "@/lib/admin-analytics"

/** At most this many series on the trend chart before it turns into spaghetti. */
const MAX_SERIES = 5

/**
 * Monthly trend and score distribution across every role.
 *
 * The trend plots the roles with the most data (capped, so the chart stays
 * readable) plus an overall line; the distribution is filterable by role
 * rather than fixed to two of them.
 */
export function PerformanceTrends({
  periods,
  roleAggregates,
  records,
}: {
  periods: PeriodAggregate[]
  roleAggregates: RoleAggregate[]
  records: EvalRecord[]
}) {
  const [distributionRole, setDistributionRole] = useState("all")

  const rolesWithData = roleAggregates.filter((r) => r.count > 0)

  const series = rolesWithData
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_SERIES)

  const trendData = periods.map((period) => {
    const row: Record<string, string | number> = {
      month: period.label,
      "میانگین کل": Number(period.average.toFixed(2)),
    }
    for (const role of series) {
      const value = period.byRole[role.role]
      // Recharts leaves a gap for null rather than dropping to zero, which
      // would read as "everyone scored 0 that month".
      row[role.label] = typeof value === "number" ? Number(value.toFixed(2)) : (null as never)
    }
    return row
  })

  const hasTrend = trendData.length > 0

  const distributionRecords =
    distributionRole === "all"
      ? records
      : records.filter((r) => r.targetRole === distributionRole)

  const bands = [
    { name: "عالی (۸ تا ۱۰)", min: 8 },
    { name: "خوب (۶ تا ۸)", min: 6 },
    { name: "متوسط (۴ تا ۶)", min: 4 },
    { name: "ضعیف (زیر ۴)", min: 0 },
  ]

  const distribution = bands.map((band, index) => {
    const upper = index === 0 ? Infinity : bands[index - 1].min
    return {
      name: band.name,
      value: distributionRecords.filter(
        (r) => r.average >= band.min && r.average < upper
      ).length,
    }
  })

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>روند عملکرد ماهانه</CardTitle>
          <CardDescription>
            میانگین امتیاز در طول زمان — پرکارترین{" "}
            {faNumber(series.length)} نقش به‌همراه میانگین کل
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasTrend && (
            <ChartLegend
              items={[
                { label: "میانگین کل", color: chartColor(8) },
                ...series.map((role) => ({
                  label: role.label,
                  color: chartColor(ROLE_SLOT[role.role]),
                })),
              ]}
            />
          )}
          <ChartFrame
            height={320}
            isEmpty={!hasTrend}
            emptyIcon={<LineChartIcon />}
            emptyMessage="هنوز ارزیابی‌ای برای رسم روند ثبت نشده است"
            summary="روند میانگین امتیاز هر نقش به تفکیک ماه."
          >
            <LineChart
              data={trendData}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid {...GRID_PROPS} />
              {/* RTL: the time axis runs right-to-left. */}
              <XAxis dataKey="month" reversed {...AXIS_PROPS} />
              <YAxis domain={[0, 10]} orientation="right" {...AXIS_PROPS} />
              <Tooltip
                cursor={{ stroke: "rgb(var(--border-strong))", strokeWidth: 1 }}
                content={<ChartTooltip unit="از ۱۰" />}
              />
              <Line
                type="monotone"
                dataKey="میانگین کل"
                stroke={chartColor(8)}
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
              {series.map((role) => (
                <Line
                  key={role.role}
                  type="monotone"
                  dataKey={role.label}
                  stroke={chartColor(ROLE_SLOT[role.role])}
                  strokeWidth={1.75}
                  dot={{ r: 2.5, strokeWidth: 2 }}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ChartFrame>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>توزیع امتیازات</CardTitle>
          <CardDescription>تعداد ارزیابی در هر باند عملکرد</CardDescription>
          <CardAction>
            <Select value={distributionRole} onValueChange={setDistributionRole}>
              <SelectTrigger aria-label="فیلتر نقش" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه نقش‌ها</SelectItem>
                {rolesWithData.map((role) => (
                  <SelectItem key={role.role} value={role.role}>
                    {getRoleLabel(role.role as TeamRole)} ({faNumber(role.count)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent>
          <DistributionChart data={distribution} />
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Score bands are an ordinal scale, so bars on a shared baseline rather than a
 * pie: length compares far more easily than angle, and the bars carry the same
 * band colours used everywhere else.
 */
function DistributionChart({
  data,
}: {
  data: Array<{ name: string; value: number }>
}) {
  const BAND_FILL = [
    SCORE_BANDS[0].color,
    SCORE_BANDS[1].color,
    SCORE_BANDS[2].color,
    SCORE_BANDS[3].color,
  ]

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <ChartFrame
      height={280}
      isEmpty={total === 0}
      emptyMessage="هنوز ارزیابی‌ای ثبت نشده است"
      summary={`توزیع ${faNumber(total)} ارزیابی در چهار باند عملکرد.`}
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
          width={120}
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
  )
}
