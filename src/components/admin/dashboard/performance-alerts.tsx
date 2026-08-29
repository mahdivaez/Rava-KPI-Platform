"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertTriangle, Star, TrendingDown, TrendingUp, Clock } from "lucide-react"

interface PerformanceAlertsProps {
  strategistEvaluations: any[]
  writerEvaluations: any[]
  users: any[]
}

export function PerformanceAlerts({ strategistEvaluations, writerEvaluations, users }: PerformanceAlertsProps) {
  const now = new Date()
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate())
  const sixtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60)

  // Helper to calculate average score
  const calculateStrategistAvg = (evaluation: any) => {
    return (evaluation.ideation + evaluation.avgViews + evaluation.qualityControl + 
            evaluation.teamRelations + evaluation.clientRelations + evaluation.responsiveness + 
            evaluation.clientSatisfaction) / 7
  }

  const calculateWriterAvg = (evaluation: any) => {
    return (evaluation.responsibility + evaluation.strategistSatisfaction + 
            evaluation.meetingEngagement + evaluation.scenarioPerformance + 
            evaluation.clientSatisfaction + evaluation.brandAlignment) / 6
  }

  // 1. Users with DECLINING performance (3+ months drop)
  const getDecliningUsers = () => {
    const declining: any[] = []
    
    // Check strategists
    const strategistByUser = strategistEvaluations.reduce((acc: any, e: any) => {
      if (!acc[e.strategistId]) acc[e.strategistId] = []
      acc[e.strategistId].push({ date: new Date(e.createdAt), score: calculateStrategistAvg(e), user: e.strategist })
      return acc
    }, {})

    Object.entries(strategistByUser).forEach(([userId, evals]: any) => {
      const sorted = evals.sort((a: any, b: any) => a.date.getTime() - b.date.getTime())
      if (sorted.length < 2) return
      
      const recentThreeMonths = sorted.filter((e: any) => e.date >= threeMonthsAgo)
      if (recentThreeMonths.length < 2) return
      
      const firstScore = recentThreeMonths[0].score
      const lastScore = recentThreeMonths[recentThreeMonths.length - 1].score
      const drop = firstScore - lastScore
      
      if (drop >= 1) {
        declining.push({
          user: evals[0].user,
          role: 'استراتژیست',
          oldScore: firstScore,
          newScore: lastScore,
          drop
        })
      }
    })

    // Check writers
    const writerByUser = writerEvaluations.reduce((acc: any, e: any) => {
      if (!acc[e.writerId]) acc[e.writerId] = []
      acc[e.writerId].push({ date: new Date(e.createdAt), score: calculateWriterAvg(e), user: e.writer })
      return acc
    }, {})

    Object.entries(writerByUser).forEach(([userId, evals]: any) => {
      const sorted = evals.sort((a: any, b: any) => a.date.getTime() - b.date.getTime())
      if (sorted.length < 2) return
      
      const recentThreeMonths = sorted.filter((e: any) => e.date >= threeMonthsAgo)
      if (recentThreeMonths.length < 2) return
      
      const firstScore = recentThreeMonths[0].score
      const lastScore = recentThreeMonths[recentThreeMonths.length - 1].score
      const drop = firstScore - lastScore
      
      if (drop >= 1) {
        declining.push({
          user: evals[0].user,
          role: 'نویسنده',
          oldScore: firstScore,
          newScore: lastScore,
          drop
        })
      }
    })

    return declining.sort((a, b) => b.drop - a.drop)
  }

  // 2. Outstanding achievers (90%+ scores = 9+ out of 10)
  const getOutstandingAchievers = () => {
    const outstanding: any[] = []

    strategistEvaluations.forEach(e => {
      const avg = calculateStrategistAvg(e)
      if (avg >= 9) {
        outstanding.push({
          user: e.strategist,
          role: 'استراتژیست',
          score: avg,
          month: e.month,
          year: e.year
        })
      }
    })

    writerEvaluations.forEach(e => {
      const avg = calculateWriterAvg(e)
      if (avg >= 9) {
        outstanding.push({
          user: e.writer,
          role: 'نویسنده',
          score: avg,
          month: e.month,
          year: e.year
        })
      }
    })

    // Group by user and get their best score
    const byUser = outstanding.reduce((acc: any, item) => {
      const userId = item.user.id
      if (!acc[userId] || acc[userId].score < item.score) {
        acc[userId] = item
      }
      return acc
    }, {})

    return Object.values(byUser).sort((a: any, b: any) => b.score - a.score).slice(0, 10)
  }

  // 3. Low performers needing support (<5 average)
  const getLowPerformers = () => {
    const lowPerformers: any[] = []

    // Strategists
    const strategistByUser = strategistEvaluations.reduce((acc: any, e: any) => {
      if (!acc[e.strategistId]) acc[e.strategistId] = []
      acc[e.strategistId].push({ score: calculateStrategistAvg(e), user: e.strategist })
      return acc
    }, {})

    Object.values(strategistByUser).forEach((evals: any) => {
      const avgScore = evals.reduce((sum: number, e: any) => sum + e.score, 0) / evals.length
      if (avgScore < 5) {
        lowPerformers.push({
          user: evals[0].user,
          role: 'استراتژیست',
          avgScore,
          evalCount: evals.length
        })
      }
    })

    // Writers
    const writerByUser = writerEvaluations.reduce((acc: any, e: any) => {
      if (!acc[e.writerId]) acc[e.writerId] = []
      acc[e.writerId].push({ score: calculateWriterAvg(e), user: e.writer })
      return acc
    }, {})

    Object.values(writerByUser).forEach((evals: any) => {
      const avgScore = evals.reduce((sum: number, e: any) => sum + e.score, 0) / evals.length
      if (avgScore < 5) {
        lowPerformers.push({
          user: evals[0].user,
          role: 'نویسنده',
          avgScore,
          evalCount: evals.length
        })
      }
    })

    return lowPerformers.sort((a, b) => a.avgScore - b.avgScore)
  }

  // 4. Rapid improvers (+2 points in 2 months)
  const getRapidImprovers = () => {
    const rapidImprovers: any[] = []

    // Strategists
    const strategistByUser = strategistEvaluations.reduce((acc: any, e: any) => {
      if (!acc[e.strategistId]) acc[e.strategistId] = []
      acc[e.strategistId].push({ date: new Date(e.createdAt), score: calculateStrategistAvg(e), user: e.strategist })
      return acc
    }, {})

    Object.values(strategistByUser).forEach((evals: any) => {
      const sorted = evals.sort((a: any, b: any) => a.date.getTime() - b.date.getTime())
      const recentTwoMonths = sorted.filter((e: any) => e.date >= twoMonthsAgo)
      
      if (recentTwoMonths.length >= 2) {
        const firstScore = recentTwoMonths[0].score
        const lastScore = recentTwoMonths[recentTwoMonths.length - 1].score
        const improvement = lastScore - firstScore
        
        if (improvement >= 2) {
          rapidImprovers.push({
            user: evals[0].user,
            role: 'استراتژیست',
            oldScore: firstScore,
            newScore: lastScore,
            improvement
          })
        }
      }
    })

    // Writers
    const writerByUser = writerEvaluations.reduce((acc: any, e: any) => {
      if (!acc[e.writerId]) acc[e.writerId] = []
      acc[e.writerId].push({ date: new Date(e.createdAt), score: calculateWriterAvg(e), user: e.writer })
      return acc
    }, {})

    Object.values(writerByUser).forEach((evals: any) => {
      const sorted = evals.sort((a: any, b: any) => a.date.getTime() - b.date.getTime())
      const recentTwoMonths = sorted.filter((e: any) => e.date >= twoMonthsAgo)
      
      if (recentTwoMonths.length >= 2) {
        const firstScore = recentTwoMonths[0].score
        const lastScore = recentTwoMonths[recentTwoMonths.length - 1].score
        const improvement = lastScore - firstScore
        
        if (improvement >= 2) {
          rapidImprovers.push({
            user: evals[0].user,
            role: 'نویسنده',
            oldScore: firstScore,
            newScore: lastScore,
            improvement
          })
        }
      }
    })

    return rapidImprovers.sort((a, b) => b.improvement - a.improvement)
  }

  // 5. Inactive users (no evaluation in 60 days)
  const getInactiveUsers = () => {
    const activeUserIds = new Set([
      ...strategistEvaluations
        .filter(e => new Date(e.createdAt) >= sixtyDaysAgo)
        .map(e => e.strategistId),
      ...writerEvaluations
        .filter(e => new Date(e.createdAt) >= sixtyDaysAgo)
        .map(e => e.writerId)
    ])

    return users
      .filter(u => (u.role === 'STRATEGIST' || u.role === 'WRITER') && !activeUserIds.has(u.id))
      .map(u => {
        // Find last evaluation
        const lastStrategistEval = strategistEvaluations
          .filter(e => e.strategistId === u.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        
        const lastWriterEval = writerEvaluations
          .filter(e => e.writerId === u.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        
        const lastEval = lastStrategistEval || lastWriterEval
        const daysSinceEval = lastEval 
          ? Math.floor((now.getTime() - new Date(lastEval.createdAt).getTime()) / (1000 * 60 * 60 * 24))
          : 999

        return {
          user: u,
          role: u.role === 'STRATEGIST' ? 'استراتژیست' : 'نویسنده',
          daysSinceEval
        }
      })
      .filter(item => item.daysSinceEval >= 60)
      .sort((a, b) => b.daysSinceEval - a.daysSinceEval)
  }

  const decliningUsers = getDecliningUsers()
  const outstandingAchievers = getOutstandingAchievers()
  const lowPerformers = getLowPerformers()
  const rapidImprovers = getRapidImprovers()
  const inactiveUsers = getInactiveUsers()

  const getInitials = (name: string) => {
    if (!name) return '??'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-8 h-8 text-warning" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">هشدارها و بینش‌های عملکردی</h2>
          <p className="text-foreground-muted">تشخیص خودکار الگوهای عملکردی مهم</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Declining Performance */}
        <Card>
          <CardHeader className="border-b border-danger/25 bg-surface">
            <CardTitle className="text-foreground text-lg font-bold flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-danger" />
              افت عملکرد (3 ماه اخیر)
            </CardTitle>
            <CardDescription className="text-danger">
              کاربران با کاهش عملکرد نیازمند پشتیبانی
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {decliningUsers.length === 0 ? (
              <p className="text-center text-foreground-subtle py-8">هیچ کاهش عملکردی شناسایی نشد</p>
            ) : (
              <div className="space-y-2">
                {decliningUsers.slice(0, 5).map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-danger-subtle rounded-lg border border-danger/25">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 ring-1 ring-border">
                        <AvatarImage src={item.user.image} />
                        <AvatarFallback className="bg-danger-subtle text-danger text-xs font-bold">
                          {getInitials(`${item.user.firstName} ${item.user.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {item.user.firstName} {item.user.lastName}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {item.role} • {item.oldScore.toFixed(1)} → {item.newScore.toFixed(1)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="font-bold">
                      -{item.drop.toFixed(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Outstanding Achievers */}
        <Card className="border border-border bg-surface shadow-lg">
          <CardHeader className="border-b border-border-subtle">
            <CardTitle className="text-foreground text-lg font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-warning" />
              ستارگان عملکرد (90%+)
            </CardTitle>
            <CardDescription className="text-warning">
              دارندگان بالاترین امتیازات
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {outstandingAchievers.length === 0 ? (
              <p className="text-center text-foreground-subtle py-8">هنوز کسی به 9+ نرسیده</p>
            ) : (
              <div className="space-y-2">
                {outstandingAchievers.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-warning-subtle rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 border border-border">
                        <AvatarImage src={item.user.image} />
                        <AvatarFallback className="bg-warning-subtle text-warning text-xs font-bold">
                          {getInitials(`${item.user.firstName} ${item.user.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {item.user.firstName} {item.user.lastName}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {item.role} • {item.month}/{item.year}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-foreground-subtle fill-yellow-500" />
                      <span className="text-lg font-bold text-foreground">{item.score.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Performers */}
        <Card className="border border-border bg-surface shadow-lg">
          <CardHeader className="border-b border-border-subtle">
            <CardTitle className="text-foreground text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              نیازمند پشتیبانی (&lt;5)
            </CardTitle>
            <CardDescription className="text-warning">
              کاربران با میانگین پایین
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {lowPerformers.length === 0 ? (
              <p className="text-center text-foreground-subtle py-8">همه کاربران عملکرد مناسب دارند</p>
            ) : (
              <div className="space-y-2">
                {lowPerformers.slice(0, 5).map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-warning-subtle rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 border border-border">
                        <AvatarImage src={item.user.image} />
                        <AvatarFallback className="bg-warning-subtle text-warning text-xs font-bold">
                          {getInitials(`${item.user.firstName} ${item.user.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {item.user.firstName} {item.user.lastName}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {item.role} • {item.evalCount} ارزیابی
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-warning-subtle text-warning border-border-strong font-bold">
                      {item.avgScore.toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rapid Improvers */}
        <Card>
          <CardHeader className="border-b border-success/25 bg-surface">
            <CardTitle className="text-foreground text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              رشد سریع (+2 در 2 ماه)
            </CardTitle>
            <CardDescription className="text-success">
              کاربران با بهبود چشمگیر
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {rapidImprovers.length === 0 ? (
              <p className="text-center text-foreground-subtle py-8">هنوز رشد سریعی مشاهده نشده</p>
            ) : (
              <div className="space-y-2">
                {rapidImprovers.slice(0, 5).map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-success-subtle rounded-lg border border-success/25">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 ring-1 ring-border">
                        <AvatarImage src={item.user.image} />
                        <AvatarFallback className="bg-success-subtle text-success text-xs font-bold">
                          {getInitials(`${item.user.firstName} ${item.user.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {item.user.firstName} {item.user.lastName}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {item.role} • {item.oldScore.toFixed(1)} → {item.newScore.toFixed(1)}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-success-subtle text-success border-success/30 font-bold">
                      +{item.improvement.toFixed(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inactive Users - Full Width */}
      <Card className="border border-border bg-surface shadow-lg">
        <CardHeader className="border-b border-border-subtle">
          <CardTitle className="text-foreground text-lg font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-foreground-muted" />
            کاربران غیرفعال (60+ روز بدون ارزیابی)
          </CardTitle>
          <CardDescription className="text-foreground-muted">
            نیازمند پیگیری و بررسی
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {inactiveUsers.length === 0 ? (
            <p className="text-center text-foreground-subtle py-8">همه کاربران فعال هستند</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {inactiveUsers.slice(0, 6).map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-surface-sunken rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 border border-border">
                      <AvatarImage src={item.user.image} />
                      <AvatarFallback className="bg-surface-sunken text-foreground-secondary text-xs font-bold">
                        {getInitials(`${item.user.firstName} ${item.user.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {item.user.firstName} {item.user.lastName}
                      </p>
                      <p className="text-xs text-foreground-muted">{item.role}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-surface-sunken text-foreground-secondary border-border-strong">
                    {item.daysSinceEval > 365 ? '1+ سال' : `${item.daysSinceEval} روز`}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

