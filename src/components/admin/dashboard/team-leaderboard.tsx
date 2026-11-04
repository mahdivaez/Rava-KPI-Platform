"use client"

import { Award, Building2, Trophy, Users } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { RankBadge } from "@/components/ui/rank"
import { RoleBadge } from "@/components/ui/role-badge"
import { ScoreBadge, ScoreMeter } from "@/components/ui/score"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { faNumber } from "@/lib/design-tokens"
import type {
  PersonAggregate,
  RoleAggregate,
  WorkgroupAggregate,
} from "@/lib/admin-analytics"

/**
 * Rankings across every role — overall, per role, and per workgroup.
 *
 * The order is the final score: half the peer average, half the client
 * average, for the month the dashboard is showing. Both halves stay on the
 * row, so a rank can always be traced back to what produced it.
 *
 * Self-evaluations stay out of all of it: they say something useful about a
 * person, but not something that belongs in a league table.
 */
export function TeamLeaderboard({
  people,
  roleAggregates,
  workgroups,
}: {
  people: PersonAggregate[]
  roleAggregates: RoleAggregate[]
  workgroups: WorkgroupAggregate[]
}) {
  // Someone only a client scored has half a final score; ranking them beside
  // a full one would flatter or punish them for the missing half.
  const ranked = people
    .filter((p) => p.peerCount > 0)
    .slice()
    .sort((a, b) => b.finalScore - a.finalScore || b.peerAverage - a.peerAverage)
  const rolesWithData = roleAggregates.filter((r) => r.count > 0)
  const groupsWithData = workgroups.filter((w) => w.count > 0)

  const initialsOf = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5 text-foreground-subtle" aria-hidden />
            جدول رتبه‌بندی کل
          </CardTitle>
          <CardDescription>
            رتبه از نمرهٔ نهایی می‌آید: نیمی ارزیابی همکاران، نیمی نظر مشتری
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0 sm:px-0">
          {ranked.length === 0 ? (
            <EmptyState
              icon={<Trophy />}
              title="برای این ماه رتبه‌بندی ممکن نیست"
              description="تا وقتی برای ماه انتخاب‌شده ارزیابی همکاران ثبت نشود، جدولی ساخته نمی‌شود."
              size="sm"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رتبه</TableHead>
                    <TableHead>نام</TableHead>
                    <TableHead>نقش</TableHead>
                    <TableHead>کارگروه</TableHead>
                    <TableHead>تعداد</TableHead>
                    <TableHead>خودارزیابی</TableHead>
                    <TableHead>میانگین همکاران</TableHead>
                    <TableHead>میانگین مشتری</TableHead>
                    <TableHead>نمرهٔ نهایی</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranked.map((person, index) => (
                    <TableRow key={`${person.id}-${person.role}`}>
                      <TableCell>
                        <RankBadge rank={index + 1} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-muted text-xs text-foreground-secondary">
                              {initialsOf(person.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">
                            {person.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={person.role} size="sm" />
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-foreground-muted">
                          {person.workgroupNames.join("، ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span data-numeric className="text-sm text-foreground-secondary">
                          {faNumber(person.peerCount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {person.selfAverage === null ? (
                          <span className="text-xs text-foreground-subtle">—</span>
                        ) : (
                          <span data-numeric className="text-sm text-foreground-secondary">
                            {faNumber(person.selfAverage, 1)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ScoreBadge score={person.peerAverage} size="sm" />
                      </TableCell>
                      <TableCell>
                        {person.clientAverage === null ? (
                          <span className="text-xs text-foreground-subtle">—</span>
                        ) : (
                          <ScoreBadge score={person.clientAverage} size="sm" />
                        )}
                      </TableCell>
                      <TableCell>
                        <ScoreBadge score={person.finalScore} size="sm" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="size-5 text-foreground-subtle" aria-hidden />
              میانگین هر نقش
            </CardTitle>
            <CardDescription>
              مقایسه عملکرد نقش‌ها با یکدیگر
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rolesWithData.length === 0 ? (
              <EmptyState
                icon={<Users />}
                title="داده‌ای موجود نیست"
                size="sm"
              />
            ) : (
              <ul className="space-y-4">
                {rolesWithData
                  .slice()
                  .sort((a, b) => b.average - a.average)
                  .map((role) => (
                    <li key={role.role}>
                      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                        <RoleBadge role={role.role} size="sm" />
                        <span className="text-xs text-foreground-subtle">
                          {faNumber(role.count)} ارزیابی ·{" "}
                          {faNumber(role.peopleCount)} نفر
                        </span>
                      </div>
                      <ScoreMeter score={role.average} size="sm" showValue />
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-foreground-subtle" aria-hidden />
              میانگین هر کارگروه
            </CardTitle>
            <CardDescription>
              میانگین داخلی تیم و، در صورت وجود، نظر مشتری
            </CardDescription>
          </CardHeader>
          <CardContent>
            {groupsWithData.length === 0 ? (
              <EmptyState
                icon={<Building2 />}
                title="داده‌ای موجود نیست"
                size="sm"
              />
            ) : (
              <ul className="space-y-4">
                {groupsWithData.map((group) => (
                  <li key={group.id}>
                    <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {group.name}
                      </span>
                      <span className="text-xs text-foreground-subtle">
                        {faNumber(group.count)} ارزیابی
                        {group.clientCount > 0 && (
                          <> · مشتری {faNumber(group.clientAverage, 1)}</>
                        )}
                      </span>
                    </div>
                    <ScoreMeter score={group.average} size="sm" showValue />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
