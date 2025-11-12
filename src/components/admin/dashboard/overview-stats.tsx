"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  UserCheck, 
  Briefcase, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  MessageSquare,
  Award,
  Target
} from "lucide-react"

interface OverviewStatsProps {
  stats: {
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
    totalWorkgroups: number
    activeWorkgroups: number
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
  const getScoreColor = (score: string) => {
    const num = parseFloat(score)
    if (num >= 8) return "text-nude-600 bg-nude-50"
    if (num >= 6) return "text-nude-600 bg-nude-50"
    if (num >= 4) return "text-orange-600 bg-orange-50"
    return "text-red-600 bg-red-50"
  }

  const getRateColor = (rate: string) => {
    const num = parseFloat(rate)
    if (num >= 80) return "text-nude-600"
    if (num >= 60) return "text-nude-600"
    if (num >= 40) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Users Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">کاربران سیستم</CardTitle>
          <Users className="h-4 w-4 text-slate-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalUsers}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="bg-nude-50 text-nude-700 border-green-200">
              <UserCheck className="h-3 w-3 mr-1" />
              {stats.activeUsers} فعال
            </Badge>
            <Badge variant="outline" className="bg-slate-50 text-slate-600">
              {stats.inactiveUsers} غیرفعال
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {stats.totalStrategists} استراتژیست، {stats.totalWriters} نویسنده
          </p>
        </CardContent>
      </Card>

      {/* Workgroups Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">کارگروه‌ها</CardTitle>
          <Briefcase className="h-4 w-4 text-slate-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalWorkgroups}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="bg-nude-50 text-nude-700 border-green-200">
              {stats.activeWorkgroups} فعال
            </Badge>
            <Badge variant="outline" className="bg-slate-50 text-slate-600">
              {stats.inactiveWorkgroups} غیرفعال
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            میانگین {(stats.totalUsers / stats.totalWorkgroups).toFixed(1)} نفر در هر گروه
          </p>
        </CardContent>
      </Card>

      {/* Evaluations Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ارزیابی‌ها</CardTitle>
          <ClipboardList className="h-4 w-4 text-slate-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalEvaluations}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="bg-nude-50 text-nude-700 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {stats.completedEvaluations}
            </Badge>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              <Clock className="h-3 w-3 mr-1" />
              {stats.pendingEvaluations}
            </Badge>
          </div>
          <p className={`text-xs mt-2 font-medium ${getRateColor(stats.completionRate)}`}>
            نرخ تکمیل: {stats.completionRate}%
          </p>
        </CardContent>
      </Card>

      {/* Feedbacks Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">بازخوردها</CardTitle>
          <MessageSquare className="h-4 w-4 text-slate-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalFeedbacks}</div>
          <div className={`mt-2 px-2 py-1 rounded-md inline-block ${getScoreColor(stats.avgFeedbackScore)}`}>
            <span className="text-sm font-medium">
              میانگین: {stats.avgFeedbackScore}/10
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            نظرات نویسندگان درباره استراتژیست‌ها
          </p>
        </CardContent>
      </Card>

      {/* Average Scores Row */}
      <Card className="hover:shadow-lg transition-shadow md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">میانگین امتیاز استراتژیست‌ها</CardTitle>
          <Award className="h-4 w-4 text-nude-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.avgStrategistScore}</div>
              <p className="text-xs text-slate-500 mt-1">از 10</p>
            </div>
            <div className={`px-4 py-2 rounded-lg ${getScoreColor(stats.avgStrategistScore)}`}>
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">ایده‌پردازی، کیفیت، روابط و پاسخگویی</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">میانگین امتیاز نویسندگان</CardTitle>
          <Target className="h-4 w-4 text-nude-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.avgWriterScore}</div>
              <p className="text-xs text-slate-500 mt-1">از 10</p>
            </div>
            <div className={`px-4 py-2 rounded-lg ${getScoreColor(stats.avgWriterScore)}`}>
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">مسئولیت‌پذیری، مشارکت، عملکرد و هماهنگی</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

