"use client"

import { Building2, ClipboardCheck, MinusCircle, UserPlus } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { RoleBadge } from "@/components/ui/role-badge"
import { ScoreBadge } from "@/components/ui/score"
import { faNumber } from "@/lib/design-tokens"
import { formatPersianDateTime } from "@/lib/utils"
import { PERSIAN_MONTHS, type ClientEvalRecord, type EvalRecord } from "@/lib/admin-analytics"

interface RecentUser {
  id: string
  firstName: string
  lastName: string
  email: string
  createdAt: Date
  isActive: boolean
}

/** The newest activity of every kind, not just one legacy table's rows. */
export function RecentActivity({
  recentEvaluations,
  recentClientEvaluations,
  recentUsers,
}: {
  recentEvaluations: EvalRecord[]
  recentClientEvaluations: ClientEvalRecord[]
  recentUsers: RecentUser[]
}) {
  const initialsOf = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("") || "؟"

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>ارزیابی‌های اخیر تیم</CardTitle>
          <CardDescription>
            آخرین ارزیابی‌های ثبت‌شده در همه نقش‌ها
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvaluations.length === 0 ? (
            <EmptyState
              icon={<ClipboardCheck />}
              title="هنوز ارزیابی‌ای ثبت نشده است"
              size="sm"
            />
          ) : (
            <ul className="space-y-2.5">
              {recentEvaluations.map((evaluation) => (
                <li
                  key={evaluation.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-sunken p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-muted text-xs text-foreground-secondary">
                        {initialsOf(evaluation.targetName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-medium text-foreground">
                        {evaluation.targetName}
                        <RoleBadge
                          role={evaluation.targetRole}
                          size="sm"
                          showDot={false}
                        />
                        {evaluation.isSelf && (
                          <Badge variant="info" size="sm">
                            خودارزیابی
                          </Badge>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-foreground-subtle">
                        {evaluation.isSelf
                          ? "خودارزیابی"
                          : `ارزیاب: ${evaluation.evaluatorName}`}{" "}
                        · {evaluation.workgroupName} ·{" "}
                        {PERSIAN_MONTHS[evaluation.month - 1]}{" "}
                        {faNumber(evaluation.year)}
                      </p>
                    </div>
                  </div>
                  <ScoreBadge score={evaluation.average} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ارزیابی‌های اخیر مشتریان</CardTitle>
          <CardDescription>آخرین نظرات ثبت‌شده از سمت برندها</CardDescription>
        </CardHeader>
        <CardContent>
          {recentClientEvaluations.length === 0 ? (
            <EmptyState
              icon={<Building2 />}
              title="هنوز نظری از مشتریان ثبت نشده است"
              size="sm"
            />
          ) : (
            <ul className="space-y-2.5">
              {recentClientEvaluations.map((evaluation) => (
                <li
                  key={evaluation.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-sunken p-3"
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-medium text-foreground">
                      {evaluation.targetName}
                      <RoleBadge
                        role={evaluation.targetRole}
                        size="sm"
                        showDot={false}
                      />
                    </p>
                    <p className="mt-0.5 text-xs text-foreground-subtle">
                      {evaluation.brandName} ·{" "}
                      {PERSIAN_MONTHS[evaluation.month - 1]}{" "}
                      {faNumber(evaluation.year)}
                    </p>
                  </div>
                  {evaluation.skipped ? (
                    <Badge variant="neutral" size="sm">
                      <MinusCircle aria-hidden />
                      بدون تعامل
                    </Badge>
                  ) : (
                    <ScoreBadge score={evaluation.average} size="sm" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>کاربران جدید</CardTitle>
          <CardDescription>آخرین حساب‌های ساخته‌شده</CardDescription>
        </CardHeader>
        <CardContent>
          {recentUsers.length === 0 ? (
            <EmptyState icon={<UserPlus />} title="کاربری ثبت نشده است" size="sm" />
          ) : (
            <ul className="space-y-2.5">
              {recentUsers.map((user) => (
                <li
                  key={user.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-sunken p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-muted text-xs text-foreground-secondary">
                        {`${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                      <p
                        dir="ltr"
                        className="truncate text-start text-xs text-foreground-subtle"
                      >
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant={user.isActive ? "success" : "neutral"} size="sm">
                      {user.isActive ? "فعال" : "غیرفعال"}
                    </Badge>
                    <span className="text-2xs text-foreground-subtle">
                      {formatPersianDateTime(user.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export type { RecentUser }
