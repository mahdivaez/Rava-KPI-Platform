"use client"

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"
import { Activity, Building2, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
  ChartTooltip,
  GRID_PROPS,
} from "@/components/ui/chart"
import { EmptyState } from "@/components/ui/empty-state"
import { RoleBadge } from "@/components/ui/role-badge"
import { ScoreBadge } from "@/components/ui/score"
import { chartColor, faNumber } from "@/lib/design-tokens"
import type { TeamRole } from "@/lib/roles"
import type { WorkgroupAggregate } from "@/lib/admin-analytics"

export interface WorkgroupMemberSummary {
  workgroupId: string
  userId: string
  name: string
  role: TeamRole
}

export interface WorkgroupSummary {
  id: string
  name: string
  isActive: boolean
}

/**
 * Per-workgroup composition and scores.
 *
 * Roles come from the real membership rows; the old version mapped every
 * member to either استراتژیست or نویسنده with a ternary, so a گرافیست in a
 * workgroup was displayed as a نویسنده.
 */
export function WorkgroupAnalytics({
  aggregates,
  workgroups,
  members,
}: {
  aggregates: WorkgroupAggregate[]
  workgroups: WorkgroupSummary[]
  members: WorkgroupMemberSummary[]
}) {
  const byId = new Map(workgroups.map((w) => [w.id, w]))

  const rows = aggregates.map((aggregate) => ({
    ...aggregate,
    isActive: byId.get(aggregate.id)?.isActive ?? true,
    members: members.filter((m) => m.workgroupId === aggregate.id),
  }))

  const chartRows = rows
    .filter((r) => r.count > 0)
    .map((r) => ({ name: r.name, score: Number(r.average.toFixed(2)) }))

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <EmptyState
            icon={<Building2 />}
            title="کارگروهی وجود ندارد"
            description="پس از ساخت کارگروه و افزودن اعضا، تحلیل هر کارگروه اینجا نمایش داده می‌شود."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>مقایسه کارگروه‌ها</CardTitle>
          <CardDescription>میانگین امتیاز داخلی هر کارگروه، از ۱۰</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartFrame
            height={Math.max(220, chartRows.length * 42)}
            isEmpty={chartRows.length === 0}
            emptyMessage="هنوز ارزیابی‌ای برای هیچ کارگروهی ثبت نشده است"
            summary={`میانگین امتیاز ${faNumber(chartRows.length)} کارگروه.`}
          >
            <BarChart
              data={chartRows}
              layout="vertical"
              margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
            >
              <CartesianGrid {...GRID_PROPS} horizontal={false} vertical />
              <XAxis type="number" domain={[0, 10]} reversed {...AXIS_PROPS} />
              <YAxis
                type="category"
                dataKey="name"
                orientation="right"
                width={150}
                {...AXIS_PROPS}
              />
              <Tooltip
                cursor={{ fill: "rgb(var(--surface-hover))" }}
                content={<ChartTooltip unit="از ۱۰" />}
              />
              <Bar
                dataKey="score"
                name="میانگین"
                fill={chartColor(2)}
                radius={4}
                maxBarSize={22}
              />
            </BarChart>
          </ChartFrame>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {rows.map((row) => (
          <Card key={row.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2">
                {row.name}
                {!row.isActive && (
                  <Badge variant="neutral" size="sm">
                    غیرفعال
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5" aria-hidden />
                  {faNumber(row.members.length)} عضو
                </span>
                <span className="inline-flex items-center gap-1">
                  <Activity className="size-3.5" aria-hidden />
                  {faNumber(row.count)} ارزیابی
                </span>
                {row.clientCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="size-3.5" aria-hidden />
                    {faNumber(row.clientCount)} نظر مشتری
                  </span>
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface-sunken px-4 py-3">
                <span className="text-sm text-foreground-muted">میانگین داخلی</span>
                {row.count > 0 ? (
                  <ScoreBadge score={row.average} showLabel />
                ) : (
                  <span className="text-xs text-foreground-subtle">
                    هنوز ارزیابی نشده
                  </span>
                )}
              </div>

              {row.clientCount > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface-sunken px-4 py-3">
                  <span className="text-sm text-foreground-muted">
                    میانگین نظر مشتری
                  </span>
                  <ScoreBadge score={row.clientAverage} showLabel />
                </div>
              )}

              {row.roleBreakdown.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-foreground-muted">
                    میانگین به تفکیک نقش
                  </p>
                  <ul className="space-y-1.5">
                    {row.roleBreakdown
                      .slice()
                      .sort((a, b) => b.average - a.average)
                      .map((role) => (
                        <li
                          key={role.role}
                          className="flex items-center justify-between gap-2"
                        >
                          <RoleBadge role={role.role} size="sm" />
                          <span className="text-xs text-foreground-subtle">
                            {faNumber(role.count)} ارزیابی
                          </span>
                          <ScoreBadge score={role.average} size="sm" />
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {row.members.length > 0 && (
                <div className="border-t border-border-subtle pt-3">
                  <p className="mb-2 text-xs font-medium text-foreground-muted">
                    اعضا
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {row.members.map((member) => (
                      <li
                        key={`${member.userId}-${member.role}`}
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1"
                      >
                        <span className="text-xs text-foreground">
                          {member.name}
                        </span>
                        <RoleBadge role={member.role} size="sm" showDot={false} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
