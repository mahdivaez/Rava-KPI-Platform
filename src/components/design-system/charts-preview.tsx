"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

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
import { chartColor } from "@/lib/design-tokens"

const TREND = [
  { month: "مرداد", strategist: 7.2, writer: 6.8, designer: 7.9 },
  { month: "شهریور", strategist: 7.6, writer: 7.1, designer: 8.1 },
  { month: "مهر", strategist: 7.4, writer: 7.6, designer: 8.4 },
  { month: "آبان", strategist: 8.1, writer: 8.0, designer: 8.2 },
  { month: "آذر", strategist: 8.4, writer: 8.3, designer: 8.6 },
]

const DISTRIBUTION = [
  { band: "۱–۳", count: 4 },
  { band: "۴–۵", count: 11 },
  { band: "۶–۷", count: 32 },
  { band: "۸–۱۰", count: 58 },
]

/** RTL: the category axis runs right-to-left, so the scale is reversed. */
const RTL_X = { reversed: true } as const

export function DesignSystemCharts() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>روند میانگین امتیاز</CardTitle>
          <CardDescription>پنج ماه اخیر، به تفکیک نقش</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ChartLegend
            items={[
              { label: "استراتژیست", color: chartColor(1) },
              { label: "نویسنده", color: chartColor(3) },
              { label: "گرافیست", color: chartColor(4) },
            ]}
          />
          <ChartFrame
            height={260}
            summary="روند میانگین امتیاز سه نقش در پنج ماه اخیر، همگی صعودی."
          >
            <LineChart data={TREND} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="month" {...AXIS_PROPS} {...RTL_X} />
              <YAxis domain={[0, 10]} {...AXIS_PROPS} orientation="right" />
              <Tooltip
                cursor={{ stroke: "rgb(var(--border-strong))", strokeWidth: 1 }}
                content={<ChartTooltip unit="از ۱۰" />}
              />
              <Line
                type="monotone"
                dataKey="strategist"
                name="استراتژیست"
                stroke={chartColor(1)}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="writer"
                name="نویسنده"
                stroke={chartColor(3)}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="designer"
                name="گرافیست"
                stroke={chartColor(4)}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartFrame>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>توزیع امتیازها</CardTitle>
          <CardDescription>تعداد ارزیابی در هر باند عملکرد</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Single series: the title names it, so no legend box is needed. */}
          <ChartFrame
            height={296}
            summary="بیشتر ارزیابی‌ها در باند ۸ تا ۱۰ قرار دارند."
          >
            <BarChart
              data={DISTRIBUTION}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="band" {...AXIS_PROPS} {...RTL_X} />
              <YAxis {...AXIS_PROPS} orientation="right" />
              <Tooltip
                cursor={{ fill: "rgb(var(--surface-hover))" }}
                content={<ChartTooltip unit="ارزیابی" />}
              />
              <Bar
                dataKey="count"
                name="تعداد"
                fill={chartColor(1)}
                radius={[4, 4, 0, 0]}
                maxBarSize={56}
              />
            </BarChart>
          </ChartFrame>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>حجم ارزیابی‌ها</CardTitle>
          <CardDescription>مجموع ارزیابی‌های ثبت‌شده در هر ماه</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartFrame height={220} summary="حجم ارزیابی‌ها ماه‌به‌ماه در حال رشد است.">
            <AreaChart data={TREND} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="ds-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor(1)} stopOpacity={0.24} />
                  <stop offset="100%" stopColor={chartColor(1)} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="month" {...AXIS_PROPS} {...RTL_X} />
              <YAxis domain={[0, 10]} {...AXIS_PROPS} orientation="right" />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="strategist"
                name="میانگین"
                stroke={chartColor(1)}
                strokeWidth={2}
                fill="url(#ds-area)"
              />
            </AreaChart>
          </ChartFrame>
        </CardContent>
      </Card>
    </div>
  )
}
