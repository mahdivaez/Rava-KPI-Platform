"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, Award, FileText, CheckCircle2, Clock, Target } from "lucide-react"

interface OverviewStatsProps {
  stats: {
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
    totalWorkgroups: number
    activeWorkgroups: number
    inactiveWorkgroups: number
    totalStrategists: number
    totalWriters: number
    totalEvaluations: number
    completedEvaluations: number
    pendingEvaluations: number
    totalFeedbacks: number
    avgStrategistScore: string
    avgWriterScore: string
    avgFeedbackScore: string
    completionRate: string
  }
}

export function OverviewStats({ stats }: OverviewStatsProps) {
  const completionPercentage = parseFloat(stats.completionRate)
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top KPI Cards - Colorful & Bold */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-teal-600 mb-1">کل کاربران</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-teal-900">{stats.totalUsers}</p>
                <p className="text-xs text-teal-600 mt-2">
                  {stats.activeUsers} فعال • {stats.inactiveUsers} غیرفعال
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg flex-shrink-0 ml-2">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evaluations */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-purple-600 mb-1">ارزیابی‌ها</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-900">{stats.totalEvaluations}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-purple-600">{stats.completedEvaluations}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-orange-600" />
                    <span className="text-xs text-purple-600">{stats.pendingEvaluations}</span>
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0 ml-2">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workgroups */}
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-amber-600 mb-1">کارگروه‌ها</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-900">{stats.totalWorkgroups}</p>
                <p className="text-xs text-amber-600 mt-2">
                  {stats.activeWorkgroups} فعال
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg flex-shrink-0 ml-2">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-white shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-rose-600 mb-1">نرخ تکمیل</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-rose-900">{stats.completionRate}%</p>
                <div className="mt-2 w-full bg-rose-200 rounded-full h-1.5 sm:h-2">
                  <div 
                    className="bg-gradient-to-r from-rose-500 to-rose-600 h-1.5 sm:h-2 rounded-full transition-all"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg flex-shrink-0 ml-2">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Scores - Large Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Strategist Score */}
        <Card className="border-2 border-teal-200 bg-white shadow-xl">
          <CardContent className="p-6 sm:p-7 lg:p-8">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 mx-auto rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg mb-3 sm:mb-4">
                <TrendingUp className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-teal-600 mb-2">میانگین استراتژیست‌ها</p>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-teal-900 mb-2">{stats.avgStrategistScore}</p>
              <p className="text-xs text-slate-600">از 10 امتیاز</p>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-teal-100">
                <p className="text-xl sm:text-2xl font-bold text-teal-700">{stats.totalStrategists}</p>
                <p className="text-xs text-slate-600">استراتژیست فعال</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Writer Score */}
        <Card className="border-2 border-purple-200 bg-white shadow-xl">
          <CardContent className="p-6 sm:p-7 lg:p-8">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg mb-3 sm:mb-4">
                <FileText className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-purple-600 mb-2">میانگین نویسندگان</p>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-900 mb-2">{stats.avgWriterScore}</p>
              <p className="text-xs text-slate-600">از 10 امتیاز</p>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-purple-100">
                <p className="text-xl sm:text-2xl font-bold text-purple-700">{stats.totalWriters}</p>
                <p className="text-xs text-slate-600">نویسنده فعال</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Score */}
        <Card className="border-2 border-amber-200 bg-white shadow-xl md:col-span-2 lg:col-span-1">
          <CardContent className="p-6 sm:p-7 lg:p-8">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg mb-3 sm:mb-4">
                <Award className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-amber-600 mb-2">میانگین بازخوردها</p>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-900 mb-2">{stats.avgFeedbackScore}</p>
              <p className="text-xs text-slate-600">از 10 امتیاز</p>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-amber-100">
                <p className="text-xl sm:text-2xl font-bold text-amber-700">{stats.totalFeedbacks}</p>
                <p className="text-xs text-slate-600">بازخورد ثبت شده</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
