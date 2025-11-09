"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Badge } from "@/components/ui/badge"

interface EvaluationDistributionProps {
  strategistEvaluations: any[]
  writerEvaluations: any[]
}

export function EvaluationDistribution({ strategistEvaluations, writerEvaluations }: EvaluationDistributionProps) {
  // Calculate detailed metrics for strategist evaluations
  const strategistMetrics = {
    ideation: 0,
    avgViews: 0,
    qualityControl: 0,
    teamRelations: 0,
    clientRelations: 0,
    responsiveness: 0,
    clientSatisfaction: 0,
  }

  strategistEvaluations.forEach(evaluation => {
    strategistMetrics.ideation += evaluation.ideation
    strategistMetrics.avgViews += evaluation.avgViews
    strategistMetrics.qualityControl += evaluation.qualityControl
    strategistMetrics.teamRelations += evaluation.teamRelations
    strategistMetrics.clientRelations += evaluation.clientRelations
    strategistMetrics.responsiveness += evaluation.responsiveness
    strategistMetrics.clientSatisfaction += evaluation.clientSatisfaction
  })

  const count = strategistEvaluations.length || 1
  const strategistData = [
    { metric: 'ایده‌پردازی', score: (strategistMetrics.ideation / count).toFixed(2) },
    { metric: 'میانگین بازدید', score: (strategistMetrics.avgViews / count).toFixed(2) },
    { metric: 'کنترل کیفیت', score: (strategistMetrics.qualityControl / count).toFixed(2) },
    { metric: 'روابط تیمی', score: (strategistMetrics.teamRelations / count).toFixed(2) },
    { metric: 'روابط با مشتری', score: (strategistMetrics.clientRelations / count).toFixed(2) },
    { metric: 'پاسخگویی', score: (strategistMetrics.responsiveness / count).toFixed(2) },
    { metric: 'رضایت مشتری', score: (strategistMetrics.clientSatisfaction / count).toFixed(2) },
  ]

  // Calculate detailed metrics for writer evaluations
  const writerMetrics = {
    responsibility: 0,
    strategistSatisfaction: 0,
    meetingEngagement: 0,
    scenarioPerformance: 0,
    clientSatisfaction: 0,
    brandAlignment: 0,
  }

  writerEvaluations.forEach(evaluation => {
    writerMetrics.responsibility += evaluation.responsibility
    writerMetrics.strategistSatisfaction += evaluation.strategistSatisfaction
    writerMetrics.meetingEngagement += evaluation.meetingEngagement
    writerMetrics.scenarioPerformance += evaluation.scenarioPerformance
    writerMetrics.clientSatisfaction += evaluation.clientSatisfaction
    writerMetrics.brandAlignment += evaluation.brandAlignment
  })

  const writerCount = writerEvaluations.length || 1
  const writerData = [
    { metric: 'مسئولیت‌پذیری', score: (writerMetrics.responsibility / writerCount).toFixed(2) },
    { metric: 'رضایت استراتژیست', score: (writerMetrics.strategistSatisfaction / writerCount).toFixed(2) },
    { metric: 'مشارکت در جلسات', score: (writerMetrics.meetingEngagement / writerCount).toFixed(2) },
    { metric: 'عملکرد سناریو', score: (writerMetrics.scenarioPerformance / writerCount).toFixed(2) },
    { metric: 'رضایت مشتری', score: (writerMetrics.clientSatisfaction / writerCount).toFixed(2) },
    { metric: 'هماهنگی با برند', score: (writerMetrics.brandAlignment / writerCount).toFixed(2) },
  ]

  // Status distribution
  const completedStrategist = strategistEvaluations.filter(evaluation => evaluation.status === 'COMPLETED').length
  const pendingStrategist = strategistEvaluations.filter(evaluation => evaluation.status === 'PENDING').length
  const completedWriter = writerEvaluations.filter(evaluation => evaluation.status === 'COMPLETED').length
  const pendingWriter = writerEvaluations.filter(evaluation => evaluation.status === 'PENDING').length

  return (
    <>
      {/* Strategist Metrics Chart */}
      <Card>
        <CardHeader>
          <CardTitle>📊 تحلیل معیارهای استراتژیست‌ها</CardTitle>
          <CardDescription>میانگین امتیاز هر معیار (از 10)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={strategistData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="category" dataKey="metric" angle={-45} textAnchor="end" height={100} />
              <YAxis type="number" domain={[0, 10]} />
              <Tooltip />
              <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">وضعیت ارزیابی‌ها</p>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  تکمیل شده: {completedStrategist}
                </Badge>
                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                  در انتظار: {pendingStrategist}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Writer Metrics Chart */}
      <Card>
        <CardHeader>
          <CardTitle>📝 تحلیل معیارهای نویسندگان</CardTitle>
          <CardDescription>میانگین امتیاز هر معیار (از 10)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={writerData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="category" dataKey="metric" angle={-45} textAnchor="end" height={100} />
              <YAxis type="number" domain={[0, 10]} />
              <Tooltip />
              <Bar dataKey="score" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">وضعیت ارزیابی‌ها</p>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  تکمیل شده: {completedWriter}
                </Badge>
                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                  در انتظار: {pendingWriter}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

