"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react"
import moment from 'moment-jalaali'

interface PerformanceInsightsProps {
  strategistEvaluations: any[]
  writerEvaluations: any[]
}

export function PerformanceInsights({ strategistEvaluations, writerEvaluations }: PerformanceInsightsProps) {
  // Get current month and previous month data
  const currentPersian = moment()
  const currentMonth = currentPersian.jMonth() + 1
  const currentYear = currentPersian.jYear()
  const previousMonth = currentMonth === 1 ? 11 : currentMonth - 1 // since we have 11 months, max 11
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear

  // Filter evaluations by month
  const currentMonthStrategist = strategistEvaluations.filter(
    e => e.month === currentMonth && e.year === currentYear
  )
  const previousMonthStrategist = strategistEvaluations.filter(
    e => e.month === previousMonth && e.year === previousYear
  )

  const currentMonthWriter = writerEvaluations.filter(
    e => e.month === currentMonth && e.year === currentYear
  )
  const previousMonthWriter = writerEvaluations.filter(
    e => e.month === previousMonth && e.year === previousYear
  )

  // Calculate averages
  const calculateAvgStrategist = (evals: any[]) => {
    if (evals.length === 0) return 0
    return evals.reduce((sum, e) => {
      const avg = (e.ideation + e.avgViews + e.qualityControl + e.teamRelations + 
                  e.clientRelations + e.responsiveness + e.clientSatisfaction) / 7
      return sum + avg
    }, 0) / evals.length
  }

  const calculateAvgWriter = (evals: any[]) => {
    if (evals.length === 0) return 0
    return evals.reduce((sum, e) => {
      const avg = (e.responsibility + e.strategistSatisfaction + e.meetingEngagement + 
                  e.scenarioPerformance + e.clientSatisfaction + e.brandAlignment) / 6
      return sum + avg
    }, 0) / evals.length
  }

  const currentStrategistAvg = calculateAvgStrategist(currentMonthStrategist)
  const previousStrategistAvg = calculateAvgStrategist(previousMonthStrategist)
  const strategistGrowth = previousStrategistAvg > 0 
    ? ((currentStrategistAvg - previousStrategistAvg) / previousStrategistAvg * 100).toFixed(1)
    : '0.0'

  const currentWriterAvg = calculateAvgWriter(currentMonthWriter)
  const previousWriterAvg = calculateAvgWriter(previousMonthWriter)
  const writerGrowth = previousWriterAvg > 0 
    ? ((currentWriterAvg - previousWriterAvg) / previousWriterAvg * 100).toFixed(1)
    : '0.0'

  // Performance trajectory (last 3 months)
  const getLastThreeMonths = () => {
    const months = []
    for (let i = 2; i >= 0; i--) {
      let month = currentMonth - i
      let year = currentYear
      while (month <= 0) {
        month += 11 // since we have 11 months
        year -= 1
      }
      months.push({ month, year })
    }
    return months
  }

  const lastThreeMonths = getLastThreeMonths()
  const strategistTrend = lastThreeMonths.map(({ month, year }) => {
    const evals = strategistEvaluations.filter(e => e.month === month && e.year === year)
    return calculateAvgStrategist(evals)
  })

  const writerTrend = lastThreeMonths.map(({ month, year }) => {
    const evals = writerEvaluations.filter(e => e.month === month && e.year === year)
    return calculateAvgWriter(evals)
  })

  const getTrajectory = (trend: number[]) => {
    const validScores = trend.filter(s => s > 0)
    if (validScores.length < 2) return 'stable'
    const first = validScores[0]
    const last = validScores[validScores.length - 1]
    if (last > first + 0.5) return 'improving'
    if (last < first - 0.5) return 'declining'
    return 'stable'
  }

  const strategistTrajectory = getTrajectory(strategistTrend)
  const writerTrajectory = getTrajectory(writerTrend)

  const TrajectoryIcon = ({ trajectory }: { trajectory: string }) => {
    if (trajectory === 'improving') return <TrendingUp className="w-5 h-5 text-success" />
    if (trajectory === 'declining') return <TrendingDown className="w-5 h-5 text-danger" />
    return <Minus className="w-5 h-5 text-warning" />
  }

  const TrajectoryBadge = ({ trajectory }: { trajectory: string }) => {
    if (trajectory === 'improving') {
      return (
        <span className="px-3 py-1 rounded-full bg-success-subtle text-success text-sm font-semibold flex items-center gap-1">
          <ArrowUpRight className="size-4" />
          در حال بهبود
        </span>
      )
    }
    if (trajectory === 'declining') {
      return (
        <span className="px-3 py-1 rounded-full bg-danger-subtle text-danger text-sm font-semibold flex items-center gap-1">
          <ArrowDownRight className="size-4" />
          نیاز به توجه
        </span>
      )
    }
    return (
      <span className="px-3 py-1 rounded-full bg-warning-subtle text-warning text-sm font-semibold flex items-center gap-1">
        <Minus className="size-4" />
        ثابت
      </span>
    )
  }

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
      {/* Strategist Performance */}
      <Card className="">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-foreground text-lg sm:text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            عملکرد استراتژیست‌ها
          </CardTitle>
          <CardDescription className="text-primary text-xs sm:text-sm">تحلیل روند و رشد ماهانه</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          {/* Current vs Previous Month */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-surface rounded-xl border border-border">
            <div className="text-center sm:text-start">
              <p className="text-xs sm:text-sm text-foreground-muted mb-1">میانگین این ماه</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{currentStrategistAvg.toFixed(2)}</p>
            </div>
            <div className="text-center">
              {parseFloat(strategistGrowth) > 0 ? (
                <div className="flex flex-col items-center gap-1">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
                  <span className="text-xl sm:text-2xl font-bold text-success">+{strategistGrowth}%</span>
                  <span className="text-xs text-foreground-muted">رشد</span>
                </div>
              ) : parseFloat(strategistGrowth) < 0 ? (
                <div className="flex flex-col items-center gap-1">
                  <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-danger" />
                  <span className="text-xl sm:text-2xl font-bold text-danger">{strategistGrowth}%</span>
                  <span className="text-xs text-foreground-muted">کاهش</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Minus className="w-6 h-6 sm:w-8 sm:h-8 text-warning" />
                  <span className="text-xl sm:text-2xl font-bold text-warning">{strategistGrowth}%</span>
                  <span className="text-xs text-foreground-muted">ثابت</span>
                </div>
              )}
            </div>
            <div className="text-center sm:text-start">
              <p className="text-xs sm:text-sm text-foreground-muted mb-1">میانگین ماه قبل</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground-secondary">{previousStrategistAvg.toFixed(2)}</p>
            </div>
          </div>

          {/* Performance Trajectory */}
          <div className="p-4 bg-surface rounded-xl border border-border">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground-secondary">روند عملکرد (3 ماه اخیر)</p>
              <TrajectoryIcon trajectory={strategistTrajectory} />
            </div>
            <TrajectoryBadge trajectory={strategistTrajectory} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-primary-subtle rounded-lg border border-border">
              <p className="text-xs text-primary mb-1">ارزیابی‌های این ماه</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">{currentMonthStrategist.length}</p>
            </div>
            <div className="p-2 sm:p-3 bg-primary-subtle rounded-lg border border-border">
              <p className="text-xs text-primary mb-1">ارزیابی‌های ماه قبل</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">{previousMonthStrategist.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Writer Performance */}
      <Card className="">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-foreground text-base sm:text-lg lg:text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            عملکرد نویسندگان
          </CardTitle>
          <CardDescription className="text-primary text-xs sm:text-sm">تحلیل روند و رشد ماهانه</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          {/* Current vs Previous Month */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-surface rounded-xl border border-border">
            <div className="text-center sm:text-start">
              <p className="text-xs sm:text-sm text-foreground-muted mb-1">میانگین این ماه</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{currentWriterAvg.toFixed(2)}</p>
            </div>
            <div className="text-center">
              {parseFloat(writerGrowth) > 0 ? (
                <div className="flex flex-col items-center gap-1">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
                  <span className="text-xl sm:text-2xl font-bold text-success">+{writerGrowth}%</span>
                  <span className="text-xs text-foreground-muted">رشد</span>
                </div>
              ) : parseFloat(writerGrowth) < 0 ? (
                <div className="flex flex-col items-center gap-1">
                  <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-danger" />
                  <span className="text-xl sm:text-2xl font-bold text-danger">{writerGrowth}%</span>
                  <span className="text-xs text-foreground-muted">کاهش</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Minus className="w-6 h-6 sm:w-8 sm:h-8 text-warning" />
                  <span className="text-xl sm:text-2xl font-bold text-warning">{writerGrowth}%</span>
                  <span className="text-xs text-foreground-muted">ثابت</span>
                </div>
              )}
            </div>
            <div className="text-center sm:text-start">
              <p className="text-xs sm:text-sm text-foreground-muted mb-1">میانگین ماه قبل</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground-secondary">{previousWriterAvg.toFixed(2)}</p>
            </div>
          </div>

          {/* Performance Trajectory */}
          <div className="p-4 bg-surface rounded-xl border border-border">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground-secondary">روند عملکرد (3 ماه اخیر)</p>
              <TrajectoryIcon trajectory={writerTrajectory} />
            </div>
            <TrajectoryBadge trajectory={writerTrajectory} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-primary-subtle rounded-lg border border-border">
              <p className="text-xs text-primary mb-1">ارزیابی‌های این ماه</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">{currentMonthWriter.length}</p>
            </div>
            <div className="p-2 sm:p-3 bg-primary-subtle rounded-lg border border-border">
              <p className="text-xs text-primary mb-1">ارزیابی‌های ماه قبل</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">{previousMonthWriter.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

