"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"

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
  ChartTooltip,
  GRID_PROPS,
} from "@/components/ui/chart"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScoreBadge } from "@/components/ui/score"
import { ROLE_SLOT, chartColor, faNumber } from "@/lib/design-tokens"
import { ClipboardList } from "lucide-react"
import type { RoleAggregate } from "@/lib/admin-analytics"

/**
 * Metric averages for one role at a time.
 *
 * A role picker rather than one card per role: the eight roles have different
 * metrics, so stacking eight charts would push everything below the fold and
 * invite comparisons between axes that do not mean the same thing.
 */
export function EvaluationDistribution({
  roleAggregates,
}: {
  roleAggregates: RoleAggregate[]
}) {
  const withData = roleAggregates.filter((r) => r.count > 0)
  const [role, setRole] = useState(withData[0]?.role ?? "")

  const selected = withData.find((r) => r.role === role) ?? withData[0]

  if (!selected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>تحلیل شاخص‌ها</CardTitle>
          <CardDescription>میانگین امتیاز هر شاخص، از ۱۰</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <EmptyState
            icon={<ClipboardList />}
            title="هنوز ارزیابی‌ای ثبت نشده است"
            description="پس از ثبت اولین ارزیابی، میانگین هر شاخص اینجا نمایش داده می‌شود."
            size="sm"
          />
        </CardContent>
      </Card>
    )
  }

  const rows = selected.metrics.map((m) => ({
    metric: m.title,
    score: Number(m.average.toFixed(2)),
  }))
  const isEmpty = rows.every((r) => !r.score)

  return (
    <Card>
      <CardHeader>
        <CardTitle>تحلیل شاخص‌های {selected.label}</CardTitle>
        <CardDescription>
          میانگین هر شاخص از {faNumber(selected.count)} ارزیابی برای{" "}
          {faNumber(selected.peopleCount)} نفر
        </CardDescription>
        <CardAction>
          <Select value={selected.role} onValueChange={setRole}>
            <SelectTrigger aria-label="انتخاب نقش" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {withData.map((r) => (
                <SelectItem key={r.role} value={r.role}>
                  {r.label} ({faNumber(r.count)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Horizontal bars: the metric names are long Persian phrases and are
            unreadable rotated under a vertical axis. */}
        <ChartFrame
          height={300}
          isEmpty={isEmpty}
          emptyMessage="هنوز ارزیابی‌ای ثبت نشده است"
          summary={`میانگین ${faNumber(rows.length)} شاخص برای ${selected.label}.`}
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
              width={140}
              {...AXIS_PROPS}
            />
            <Tooltip
              cursor={{ fill: "rgb(var(--surface-hover))" }}
              content={<ChartTooltip unit="از ۱۰" />}
            />
            <Bar
              dataKey="score"
              name="میانگین"
              fill={chartColor(ROLE_SLOT[selected.role])}
              radius={4}
              maxBarSize={22}
            />
          </BarChart>
        </ChartFrame>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-4">
          <span className="text-sm text-foreground-muted">
            میانگین کل این نقش
          </span>
          <ScoreBadge score={selected.average} showLabel />
        </div>
      </CardContent>
    </Card>
  )
}
