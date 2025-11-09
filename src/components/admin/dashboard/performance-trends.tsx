"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface PerformanceTrendsProps {
  strategistEvaluations: any[]
  writerEvaluations: any[]
  feedbacks: any[]
}

export function PerformanceTrends({ strategistEvaluations, writerEvaluations, feedbacks }: PerformanceTrendsProps) {
  // Process data for monthly trends
  const monthlyData = new Map()
  
  // Process strategist evaluations
  strategistEvaluations.forEach(evaluation => {
    const key = `${evaluation.year}-${String(evaluation.month).padStart(2, '0')}`
    if (!monthlyData.has(key)) {
      monthlyData.set(key, {
        month: `${evaluation.month}/${evaluation.year}`,
        strategistCount: 0,
        strategistAvg: 0,
        strategistTotal: 0,
        writerCount: 0,
        writerAvg: 0,
        writerTotal: 0,
        feedbackCount: 0,
        feedbackAvg: 0,
        feedbackTotal: 0,
      })
    }
    
    const data = monthlyData.get(key)
    const avg = (evaluation.ideation + evaluation.avgViews + evaluation.qualityControl + evaluation.teamRelations + 
                evaluation.clientRelations + evaluation.responsiveness + evaluation.clientSatisfaction) / 7
    data.strategistCount++
    data.strategistTotal += avg
    data.strategistAvg = data.strategistTotal / data.strategistCount
  })

  // Process writer evaluations
  writerEvaluations.forEach(evaluation => {
    const key = `${evaluation.year}-${String(evaluation.month).padStart(2, '0')}`
    if (!monthlyData.has(key)) {
      monthlyData.set(key, {
        month: `${evaluation.month}/${evaluation.year}`,
        strategistCount: 0,
        strategistAvg: 0,
        strategistTotal: 0,
        writerCount: 0,
        writerAvg: 0,
        writerTotal: 0,
        feedbackCount: 0,
        feedbackAvg: 0,
        feedbackTotal: 0,
      })
    }
    
    const data = monthlyData.get(key)
    const avg = (evaluation.responsibility + evaluation.strategistSatisfaction + evaluation.meetingEngagement + 
                evaluation.scenarioPerformance + evaluation.clientSatisfaction + evaluation.brandAlignment) / 6
    data.writerCount++
    data.writerTotal += avg
    data.writerAvg = data.writerTotal / data.writerCount
  })

  // Process feedbacks
  feedbacks.forEach(feedback => {
    const key = `${feedback.year}-${String(feedback.month).padStart(2, '0')}`
    if (!monthlyData.has(key)) {
      monthlyData.set(key, {
        month: `${feedback.month}/${feedback.year}`,
        strategistCount: 0,
        strategistAvg: 0,
        strategistTotal: 0,
        writerCount: 0,
        writerAvg: 0,
        writerTotal: 0,
        feedbackCount: 0,
        feedbackAvg: 0,
        feedbackTotal: 0,
      })
    }
    
    const data = monthlyData.get(key)
    const avg = (feedback.communication + feedback.supportLevel + 
                feedback.clarityOfTasks + feedback.feedbackQuality) / 4
    data.feedbackCount++
    data.feedbackTotal += avg
    data.feedbackAvg = data.feedbackTotal / data.feedbackCount
  })

  const trendsData = Array.from(monthlyData.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(item => ({
      month: item.month,
      استراتژیست‌ها: parseFloat(item.strategistAvg.toFixed(2)),
      نویسندگان: parseFloat(item.writerAvg.toFixed(2)),
      بازخوردها: parseFloat(item.feedbackAvg.toFixed(2)),
    }))

  // Calculate score distribution for strategists
  const strategistScoreRanges = {
    'عالی (8-10)': 0,
    'خوب (6-8)': 0,
    'متوسط (4-6)': 0,
    'ضعیف (1-4)': 0,
  }

  strategistEvaluations.forEach(evaluation => {
    const avg = (evaluation.ideation + evaluation.avgViews + evaluation.qualityControl + evaluation.teamRelations + 
                evaluation.clientRelations + evaluation.responsiveness + evaluation.clientSatisfaction) / 7
    if (avg >= 8) strategistScoreRanges['عالی (8-10)']++
    else if (avg >= 6) strategistScoreRanges['خوب (6-8)']++
    else if (avg >= 4) strategistScoreRanges['متوسط (4-6)']++
    else strategistScoreRanges['ضعیف (1-4)']++
  })

  const strategistDistribution = Object.entries(strategistScoreRanges).map(([name, value]) => ({
    name,
    value,
  }))

  // Calculate score distribution for writers
  const writerScoreRanges = {
    'عالی (8-10)': 0,
    'خوب (6-8)': 0,
    'متوسط (4-6)': 0,
    'ضعیف (1-4)': 0,
  }

  writerEvaluations.forEach(evaluation => {
    const avg = (evaluation.responsibility + evaluation.strategistSatisfaction + evaluation.meetingEngagement + 
                evaluation.scenarioPerformance + evaluation.clientSatisfaction + evaluation.brandAlignment) / 6
    if (avg >= 8) writerScoreRanges['عالی (8-10)']++
    else if (avg >= 6) writerScoreRanges['خوب (6-8)']++
    else if (avg >= 4) writerScoreRanges['متوسط (4-6)']++
    else writerScoreRanges['ضعیف (1-4)']++
  })

  const writerDistribution = Object.entries(writerScoreRanges).map(([name, value]) => ({
    name,
    value,
  }))

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Performance Trends Line Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>📈 روند عملکرد ماهانه</CardTitle>
          <CardDescription>مقایسه میانگین امتیازات در طول زمان</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={trendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="استراتژیست‌ها" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
              <Line 
                type="monotone" 
                dataKey="نویسندگان" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6' }}
              />
              <Line 
                type="monotone" 
                dataKey="بازخوردها" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Strategist Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 توزیع امتیازات استراتژیست‌ها</CardTitle>
          <CardDescription>تعداد افراد در هر دسته امتیاز</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={strategistDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {strategistDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {strategistDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-xs">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Writer Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>📝 توزیع امتیازات نویسندگان</CardTitle>
          <CardDescription>تعداد افراد در هر دسته امتیاز</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={writerDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {writerDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {writerDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-xs">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

