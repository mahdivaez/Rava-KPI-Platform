"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { ScoreBadge } from "@/components/ui/score"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ClipboardCheck, Clock, Calendar, User } from "lucide-react"
import { formatPersianDateTime } from "@/lib/utils"

interface RecentActivityProps {
  recentEvaluations: any[]
  recentUsers: any[]
}

export function RecentActivity({ recentEvaluations, recentUsers }: RecentActivityProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const getStatusBadge = (status: string) => {
    if (status === 'COMPLETED') {
      return (
        <Badge variant="outline" className="bg-surface-sunken text-foreground-secondary border-success/30">
          تکمیل شده
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-warning-subtle text-warning border-border-strong">
        در انتظار
      </Badge>
    )
  }

  const formatDate = (date: Date) => {
    return formatPersianDateTime(date)
  }

  const calculateAverage = (evaluation: any) => {
    const avg = (evaluation.ideation + evaluation.avgViews + evaluation.qualityControl + evaluation.teamRelations + 
                evaluation.clientRelations + evaluation.responsiveness + evaluation.clientSatisfaction) / 7
    return avg.toFixed(2)
  }

  const getScoreColor = (score: string) => {
    const num = parseFloat(score)
    if (num >= 8) return "bg-surface-sunken text-foreground"
    if (num >= 6) return "bg-surface-sunken text-foreground"
    if (num >= 4) return "bg-warning-subtle text-foreground"
    return "bg-danger-subtle text-danger"
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recent Evaluations */}
      <Card className="md:col-span-2">
        <CardHeader className="border-b border-border-subtle">
          <CardTitle className="text-lg">ارزیابی‌های اخیر</CardTitle>
          <CardDescription className="text-foreground-muted">آخرین ارزیابی‌های ثبت شده استراتژیست‌ها</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentEvaluations.length > 0 ? recentEvaluations.map((evaluation) => (
              <div 
                key={evaluation.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-sunken p-4 transition-colors duration-fast hover:bg-surface-hover"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-surface-sunken text-foreground-secondary">
                      {getInitials(evaluation.strategist.firstName, evaluation.strategist.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {evaluation.strategist.firstName} {evaluation.strategist.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="size-3" />
                        {evaluation.month}/{evaluation.year}
                      </Badge>
                      <span className="text-xs text-foreground-subtle">
                        ارزیاب: {evaluation.evaluator.firstName} {evaluation.evaluator.lastName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(evaluation.status)}
                  <ScoreBadge score={parseFloat(calculateAverage(evaluation))} />
                </div>
              </div>
            )) : (
              <EmptyState
                icon={<ClipboardCheck />}
                title="هنوز ارزیابی ثبت نشده است"
                description="آخرین ارزیابی‌های ثبت‌شده در این بخش فهرست می‌شوند."
                size="sm"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card className="md:col-span-2">
        <CardHeader className="border-b border-border-subtle">
          <CardTitle>تایم‌لاین فعالیت‌ها</CardTitle>
          <CardDescription className="text-foreground-muted">خلاصه فعالیت‌های اخیر سیستم</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Recent evaluation activities */}
            {recentEvaluations.slice(0, 5).map((evaluation, index) => (
              <div key={`eval-${evaluation.id}`} className="flex gap-4">
                <div className="relative">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-sunken">
                    <ClipboardCheck className="h-5 w-5 text-foreground-muted" />
                  </div>
                  {index < recentEvaluations.slice(0, 5).length - 1 && (
                    <div className="absolute top-10 left-5 w-0.5 h-8 bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <p className="text-sm font-medium">
                    ارزیابی جدید استراتژیست
                  </p>
                  <p className="text-sm text-foreground-muted mt-1">
                    {evaluation.strategist.firstName} {evaluation.strategist.lastName} توسط {evaluation.evaluator.firstName} {evaluation.evaluator.lastName} ارزیابی شد
                  </p>
                  <p className="text-xs text-foreground-subtle mt-2 flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDate(evaluation.createdAt)}
                  </p>
                </div>
              </div>
            ))}

            {/* Recent user activities */}
            {recentUsers.slice(0, 3).map((user, index) => (
              <div key={`user-${user.id}`} className="flex gap-4">
                <div className="relative">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-sunken">
                    <User className="h-5 w-5 text-foreground-muted" />
                  </div>
                  {index < recentUsers.slice(0, 3).length - 1 && (
                    <div className="absolute top-10 left-5 w-0.5 h-8 bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <p className="text-sm font-medium">
                    کاربر جدید
                  </p>
                  <p className="text-sm text-foreground-muted mt-1">
                    {user.firstName} {user.lastName} به سیستم اضافه شد
                  </p>
                  <p className="text-xs text-foreground-subtle mt-2 flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            ))}

            {recentEvaluations.length === 0 && recentUsers.length === 0 && (
              <p className="text-center text-foreground-subtle py-8">
                هیچ فعالیت اخیری یافت نشد
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

