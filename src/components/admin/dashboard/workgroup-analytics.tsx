"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users, TrendingUp, Activity } from "lucide-react"

interface WorkgroupAnalyticsProps {
  workgroups: any[]
}

export function WorkgroupAnalytics({ workgroups }: WorkgroupAnalyticsProps) {
  // Calculate analytics for each workgroup
  const workgroupData = workgroups.map(wg => {
    const strategistCount = wg.members.filter((m: any) => m.role === 'STRATEGIST').length
    const writerCount = wg.members.filter((m: any) => m.role === 'WRITER').length
    const totalMembers = wg.members.length
    
    // Calculate average evaluation scores
    let avgScore = 0
    if (wg.writerEvaluations.length > 0) {
      const totalScore = wg.writerEvaluations.reduce((sum: number, evaluation: any) => {
        const score = (evaluation.responsibility + evaluation.strategistSatisfaction + evaluation.meetingEngagement + 
                      evaluation.scenarioPerformance + evaluation.clientSatisfaction + evaluation.brandAlignment) / 6
        return sum + score
      }, 0)
      avgScore = totalScore / wg.writerEvaluations.length
    }
    
    return {
      id: wg.id,
      name: wg.name,
      isActive: wg.isActive,
      strategistCount,
      writerCount,
      totalMembers,
      evaluationsCount: wg.writerEvaluations.length,
      feedbacksCount: wg.writerFeedbacks.length,
      avgScore: avgScore,
    }
  })

  // Sort by average score
  const sortedWorkgroups = [...workgroupData].sort((a, b) => b.avgScore - a.avgScore)
  
  // Data for chart (top 10 workgroups)
  const chartData = sortedWorkgroups.slice(0, 10).map(wg => ({
    name: wg.name.length > 15 ? wg.name.substring(0, 15) + '...' : wg.name,
    'میانگین امتیاز': parseFloat(wg.avgScore.toFixed(2)),
    'تعداد اعضا': wg.totalMembers,
  }))

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-800"
    if (score >= 6) return "bg-blue-100 text-blue-800"
    if (score >= 4) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="grid gap-6">
      {/* Workgroup Performance Chart */}
      <Card className="col-span-full border-2 border-nude-200 shadow-lg bg-white">
        <CardHeader className="border-b border-nude-200 bg-gradient-to-r from-nude-50 to-white">
          <CardTitle className="text-nude-900 text-xl font-bold">📊 عملکرد کارگروه‌ها</CardTitle>
          <CardDescription className="text-nude-600">مقایسه میانگین امتیازات و تعداد اعضا</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
              <YAxis yAxisId="left" orientation="left" stroke="#a78b71" />
              <YAxis yAxisId="right" orientation="right" stroke="#8d7a68" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="میانگین امتیاز" fill="#a78b71" radius={[8, 8, 0, 0]} />
              <Bar yAxisId="right" dataKey="تعداد اعضا" fill="#8d7a68" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Workgroup Details Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedWorkgroups.map((wg, index) => (
          <Card key={wg.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {index < 3 && <span>{['🥇', '🥈', '🥉'][index]}</span>}
                    {wg.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {wg.isActive ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">فعال</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-100 text-slate-600">غیرفعال</Badge>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="h-4 w-4" />
                  <span>اعضا</span>
                </div>
                <span className="font-semibold">{wg.totalMembers}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">استراتژیست‌ها</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {wg.strategistCount}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">نویسندگان</span>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {wg.writerCount}
                </Badge>
              </div>

              <div className="pt-3 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">ارزیابی‌ها</span>
                  <span className="font-medium">{wg.evaluationsCount}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">بازخوردها</span>
                  <span className="font-medium">{wg.feedbacksCount}</span>
                </div>
              </div>

              {wg.avgScore > 0 && (
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">میانگین امتیاز</span>
                    <Badge className={`${getScoreColor(wg.avgScore)} font-bold`}>
                      {wg.avgScore.toFixed(2)}/10
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {workgroupData.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-slate-500">
              هنوز کارگروهی ایجاد نشده است
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

