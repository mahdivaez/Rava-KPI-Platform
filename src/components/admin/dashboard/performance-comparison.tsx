"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MonthlyData {
  month: string
  strategistAvg: number
  writerAvg: number
  feedbackCount: number
  evaluationCount: number
}

interface PerformanceComparisonProps {
  monthlyData: MonthlyData[]
}

export function PerformanceComparison({ monthlyData }: PerformanceComparisonProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const [metric, setMetric] = useState<'scores' | 'counts'>('scores')

  // Calculate trends
  const latestMonth = monthlyData[monthlyData.length - 1]
  const previousMonth = monthlyData[monthlyData.length - 2]

  const strategistTrend = latestMonth && previousMonth 
    ? ((latestMonth.strategistAvg - previousMonth.strategistAvg) / previousMonth.strategistAvg) * 100
    : 0

  const writerTrend = latestMonth && previousMonth
    ? ((latestMonth.writerAvg - previousMonth.writerAvg) / previousMonth.writerAvg) * 100
    : 0

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-success" />
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-destructive" />
    return null
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-success"
    if (trend < 0) return "text-destructive"
    return "text-nude-600"
  }

  return (
    <Card className="border-nude-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-nude-900">مقایسه عملکرد ماهانه</CardTitle>
            <CardDescription>روند تغییرات عملکرد در طول زمان</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={metric} onValueChange={(v) => setMetric(v as any)}>
              <SelectTrigger className="w-[150px] bg-nude-50 border-nude-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scores">میانگین امتیازات</SelectItem>
                <SelectItem value="counts">تعداد ارزیابی‌ها</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chartType} onValueChange={(v) => setChartType(v as any)}>
              <SelectTrigger className="w-[120px] bg-nude-50 border-nude-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">خطی</SelectItem>
                <SelectItem value="bar">میله‌ای</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Trend Indicators */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-nude-50 rounded-xl border border-nude-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-nude-600">عملکرد استراتژیست‌ها</span>
              {getTrendIcon(strategistTrend)}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-nude-900">
                {latestMonth?.strategistAvg.toFixed(2) || '-'}
              </span>
              <span className={`text-sm font-medium ${getTrendColor(strategistTrend)}`}>
                {strategistTrend > 0 && '+'}{strategistTrend.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="p-4 bg-nude-50 rounded-xl border border-nude-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-nude-600">عملکرد نویسندگان</span>
              {getTrendIcon(writerTrend)}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-nude-900">
                {latestMonth?.writerAvg.toFixed(2) || '-'}
              </span>
              <span className={`text-sm font-medium ${getTrendColor(writerTrend)}`}>
                {writerTrend > 0 && '+'}{writerTrend.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e1d8" />
                <XAxis dataKey="month" stroke="#6b5d54" />
                <YAxis stroke="#6b5d54" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e8e1d8',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                {metric === 'scores' ? (
                  <>
                    <Line 
                      type="monotone" 
                      dataKey="strategistAvg" 
                      stroke="#9b8b7e" 
                      strokeWidth={2}
                      name="استراتژیست‌ها"
                      dot={{ fill: '#9b8b7e', r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="writerAvg" 
                      stroke="#7cb89f" 
                      strokeWidth={2}
                      name="نویسندگان"
                      dot={{ fill: '#7cb89f', r: 4 }}
                    />
                  </>
                ) : (
                  <>
                    <Line 
                      type="monotone" 
                      dataKey="evaluationCount" 
                      stroke="#9b8b7e" 
                      strokeWidth={2}
                      name="تعداد ارزیابی‌ها"
                      dot={{ fill: '#9b8b7e', r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="feedbackCount" 
                      stroke="#8ba3b5" 
                      strokeWidth={2}
                      name="تعداد بازخوردها"
                      dot={{ fill: '#8ba3b5', r: 4 }}
                    />
                  </>
                )}
              </LineChart>
            ) : (
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e1d8" />
                <XAxis dataKey="month" stroke="#6b5d54" />
                <YAxis stroke="#6b5d54" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e8e1d8',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                {metric === 'scores' ? (
                  <>
                    <Bar dataKey="strategistAvg" fill="#9b8b7e" name="استراتژیست‌ها" />
                    <Bar dataKey="writerAvg" fill="#7cb89f" name="نویسندگان" />
                  </>
                ) : (
                  <>
                    <Bar dataKey="evaluationCount" fill="#9b8b7e" name="تعداد ارزیابی‌ها" />
                    <Bar dataKey="feedbackCount" fill="#8ba3b5" name="تعداد بازخوردها" />
                  </>
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

