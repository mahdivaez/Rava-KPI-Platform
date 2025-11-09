"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ClipboardCheck, Clock, Calendar, User } from "lucide-react"
import { format } from "date-fns"
import { faIR } from 'date-fns/locale'

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
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          تکمیل شده
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
        در انتظار
      </Badge>
    )
  }

  const formatDate = (date: Date) => {
    try {
      return format(new Date(date), 'yyyy/MM/dd HH:mm', { locale: faIR })
    } catch {
      return 'نامشخص'
    }
  }

  const calculateAverage = (evaluation: any) => {
    const avg = (evaluation.ideation + evaluation.avgViews + evaluation.qualityControl + evaluation.teamRelations + 
                evaluation.clientRelations + evaluation.responsiveness + evaluation.clientSatisfaction) / 7
    return avg.toFixed(2)
  }

  const getScoreColor = (score: string) => {
    const num = parseFloat(score)
    if (num >= 8) return "bg-green-100 text-green-800"
    if (num >= 6) return "bg-blue-100 text-blue-800"
    if (num >= 4) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recent Evaluations */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>⚡ ارزیابی‌های اخیر</CardTitle>
          <CardDescription>آخرین ارزیابی‌های ثبت شده استراتژیست‌ها</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentEvaluations.length > 0 ? recentEvaluations.map((evaluation) => (
              <div 
                key={evaluation.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {getInitials(evaluation.strategist.firstName, evaluation.strategist.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {evaluation.strategist.firstName} {evaluation.strategist.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {evaluation.month}/{evaluation.year}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        ارزیاب: {evaluation.evaluator.firstName} {evaluation.evaluator.lastName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(evaluation.status)}
                  <Badge className={`${getScoreColor(calculateAverage(evaluation))} font-bold`}>
                    {calculateAverage(evaluation)}/10
                  </Badge>
                </div>
              </div>
            )) : (
              <p className="text-center text-slate-500 py-8">
                هنوز ارزیابی ثبت نشده است
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>📅 تایم‌لاین فعالیت‌ها</CardTitle>
          <CardDescription>خلاصه فعالیت‌های اخیر سیستم</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Recent evaluation activities */}
            {recentEvaluations.slice(0, 5).map((evaluation, index) => (
              <div key={`eval-${evaluation.id}`} className="flex gap-4">
                <div className="relative">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                    <ClipboardCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  {index < recentEvaluations.slice(0, 5).length - 1 && (
                    <div className="absolute top-10 left-5 w-0.5 h-8 bg-slate-200" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <p className="text-sm font-medium">
                    ارزیابی جدید استراتژیست
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {evaluation.strategist.firstName} {evaluation.strategist.lastName} توسط {evaluation.evaluator.firstName} {evaluation.evaluator.lastName} ارزیابی شد
                  </p>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(evaluation.createdAt)}
                  </p>
                </div>
              </div>
            ))}

            {/* Recent user activities */}
            {recentUsers.slice(0, 3).map((user, index) => (
              <div key={`user-${user.id}`} className="flex gap-4">
                <div className="relative">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  {index < recentUsers.slice(0, 3).length - 1 && (
                    <div className="absolute top-10 left-5 w-0.5 h-8 bg-slate-200" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <p className="text-sm font-medium">
                    کاربر جدید
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {user.firstName} {user.lastName} به سیستم اضافه شد
                  </p>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            ))}

            {recentEvaluations.length === 0 && recentUsers.length === 0 && (
              <p className="text-center text-slate-500 py-8">
                هیچ فعالیت اخیری یافت نشد
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

