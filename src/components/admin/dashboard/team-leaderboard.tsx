"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RankBadge } from "@/components/ui/rank"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Award, TrendingUp, Trophy } from "lucide-react"

interface TeamLeaderboardProps {
  strategistEvaluations: any[]
  writerEvaluations: any[]
  workgroups: any[]
}

export function TeamLeaderboard({ strategistEvaluations, writerEvaluations, workgroups }: TeamLeaderboardProps) {
  // Calculate strategist rankings
  const strategistScores = strategistEvaluations.reduce((acc: any, evaluation: any) => {
    const userId = evaluation.strategistId
    if (!acc[userId]) {
      acc[userId] = {
        user: evaluation.strategist,
        scores: [],
        count: 0
      }
    }
    const avg = (evaluation.ideation + evaluation.avgViews + evaluation.qualityControl + 
                 evaluation.teamRelations + evaluation.clientRelations + evaluation.responsiveness + 
                 evaluation.clientSatisfaction) / 7
    acc[userId].scores.push(avg)
    acc[userId].count++
    return acc
  }, {})

  const topStrategists = Object.values(strategistScores)
    .map((item: any) => ({
      ...item,
      average: item.scores.reduce((sum: number, score: number) => sum + score, 0) / item.scores.length
    }))
    .sort((a: any, b: any) => b.average - a.average)
    .slice(0, 10)

  // Calculate writer rankings
  const writerScores = writerEvaluations.reduce((acc: any, evaluation: any) => {
    const userId = evaluation.writerId
    if (!acc[userId]) {
      acc[userId] = {
        user: evaluation.writer,
        scores: [],
        count: 0
      }
    }
    const avg = (evaluation.responsibility + evaluation.strategistSatisfaction + 
                 evaluation.meetingEngagement + evaluation.scenarioPerformance + 
                 evaluation.clientSatisfaction + evaluation.brandAlignment) / 6
    acc[userId].scores.push(avg)
    acc[userId].count++
    return acc
  }, {})

  const topWriters = Object.values(writerScores)
    .map((item: any) => ({
      ...item,
      average: item.scores.reduce((sum: number, score: number) => sum + score, 0) / item.scores.length
    }))
    .sort((a: any, b: any) => b.average - a.average)
    .slice(0, 10)

  // Calculate most improved users
  const getMostImproved = (evaluations: any[], type: 'strategist' | 'writer') => {
    const userKey = type === 'strategist' ? 'strategistId' : 'writerId'
    const userObj = type === 'strategist' ? 'strategist' : 'writer'
    
    const improvements = evaluations.reduce((acc: any, evaluation: any) => {
      const userId = evaluation[userKey]
      if (!acc[userId]) {
        acc[userId] = {
          user: evaluation[userObj],
          scores: []
        }
      }
      const avg = type === 'strategist'
        ? (evaluation.ideation + evaluation.avgViews + evaluation.qualityControl + 
           evaluation.teamRelations + evaluation.clientRelations + evaluation.responsiveness + 
           evaluation.clientSatisfaction) / 7
        : (evaluation.responsibility + evaluation.strategistSatisfaction + 
           evaluation.meetingEngagement + evaluation.scenarioPerformance + 
           evaluation.clientSatisfaction + evaluation.brandAlignment) / 6
      
      acc[userId].scores.push({ date: new Date(evaluation.createdAt), score: avg })
      return acc
    }, {})

    return Object.values(improvements)
      .map((item: any) => {
        const sorted = item.scores.sort((a: any, b: any) => a.date.getTime() - b.date.getTime())
        if (sorted.length < 2) return null
        const first = sorted[0].score
        const last = sorted[sorted.length - 1].score
        const improvement = last - first
        return {
          user: item.user,
          improvement,
          oldScore: first,
          newScore: last
        }
      })
      .filter((item: any) => item !== null && item.improvement > 0)
      .sort((a: any, b: any) => b.improvement - a.improvement)
      .slice(0, 5)
  }

  const mostImprovedStrategists = getMostImproved(strategistEvaluations, 'strategist')
  const mostImprovedWriters = getMostImproved(writerEvaluations, 'writer')

  // Calculate top workgroups
  const workgroupScores = workgroups.map(wg => {
    const writerEvals = wg.writerEvaluations || []
    if (writerEvals.length === 0) return null
    
    const avgScore = writerEvals.reduce((sum: number, e: any) => {
      const avg = (e.responsibility + e.strategistSatisfaction + e.meetingEngagement + 
                   e.scenarioPerformance + e.clientSatisfaction + e.brandAlignment) / 6
      return sum + avg
    }, 0) / writerEvals.length

    return {
      name: wg.name,
      average: avgScore,
      memberCount: wg.members?.length || 0,
      evaluationCount: writerEvals.length
    }
  }).filter(Boolean).sort((a: any, b: any) => b.average - a.average).slice(0, 5)

  const getInitials = (name: string) => {
    if (!name) return '??'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }


  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Top Strategists */}
      <Card className="border border-border bg-surface shadow-lg">
        <CardHeader className="border-b border-border bg-surface">
          <CardTitle className="text-foreground text-xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            برترین استراتژیست‌ها
          </CardTitle>
          <CardDescription className="text-primary">رتبه‌بندی بر اساس میانگین امتیاز</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {topStrategists.map((item: any, index: number) => (
              <div 
                key={item.user.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-md ${
                  index === 0 ? 'bg-primary-subtle border-border-strong' :
                  index === 1 ? 'bg-surface-sunken border-border-strong' :
                  index === 2 ? 'bg-warning-subtle border-border-strong' :
                  'bg-surface border-border'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <RankBadge rank={index + 1} />
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage src={item.user.image} />
                    <AvatarFallback className="bg-primary-subtle text-primary font-bold">
                      {getInitials(`${item.user.firstName} ${item.user.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {item.user.firstName} {item.user.lastName}
                    </p>
                    <p className="text-xs text-foreground-muted">{item.count} ارزیابی</p>
                  </div>
                </div>
                <div className="text-start">
                  <p className="text-2xl font-bold text-foreground">{item.average.toFixed(2)}</p>
                  <p className="text-xs text-foreground-muted">از ۱۰</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Writers */}
      <Card className="border border-border bg-surface shadow-lg">
        <CardHeader className="border-b border-border bg-surface">
          <CardTitle className="text-foreground text-xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            برترین نویسندگان
          </CardTitle>
          <CardDescription className="text-primary">رتبه‌بندی بر اساس میانگین امتیاز</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {topWriters.map((item: any, index: number) => (
              <div 
                key={item.user.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-md ${
                  index === 0 ? 'bg-primary-subtle border-border-strong' :
                  index === 1 ? 'bg-surface-sunken border-border-strong' :
                  index === 2 ? 'bg-warning-subtle border-border-strong' :
                  'bg-surface border-border'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <RankBadge rank={index + 1} />
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage src={item.user.image} />
                    <AvatarFallback className="bg-primary-subtle text-primary font-bold">
                      {getInitials(`${item.user.firstName} ${item.user.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {item.user.firstName} {item.user.lastName}
                    </p>
                    <p className="text-xs text-foreground-muted">{item.count} ارزیابی</p>
                  </div>
                </div>
                <div className="text-start">
                  <p className="text-2xl font-bold text-foreground">{item.average.toFixed(2)}</p>
                  <p className="text-xs text-foreground-muted">از ۱۰</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Most Improved */}
      <Card className="border border-border bg-surface shadow-lg">
        <CardHeader className="border-b border-border bg-surface">
          <CardTitle className="text-foreground text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-warning" />
            بیشترین پیشرفت
          </CardTitle>
          <CardDescription className="text-warning">کاربران با بیشترین رشد</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground-secondary mb-2">استراتژیست‌ها:</p>
            {mostImprovedStrategists.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-3 rounded-xl border border-success/25 bg-success-subtle p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8 ring-1 ring-border">
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
                      {item.oldScore.toFixed(1)} → {item.newScore.toFixed(1)}
                    </p>
                  </div>
                </div>
                <Badge className="bg-success-subtle text-success border-success/30">
                  +{item.improvement.toFixed(2)}
                </Badge>
              </div>
            ))}
            
            <p className="text-sm font-semibold text-foreground-secondary mt-4 mb-2">نویسندگان:</p>
            {mostImprovedWriters.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-3 rounded-xl border border-success/25 bg-success-subtle p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8 ring-1 ring-border">
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
                      {item.oldScore.toFixed(1)} → {item.newScore.toFixed(1)}
                    </p>
                  </div>
                </div>
                <Badge className="bg-success-subtle text-success border-success/30">
                  +{item.improvement.toFixed(2)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Workgroups */}
      <Card className="border border-border bg-surface shadow-lg">
        <CardHeader className="border-b border-border bg-surface">
          <CardTitle className="text-foreground text-xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-danger" />
            برترین کارگروه‌ها
          </CardTitle>
          <CardDescription className="text-danger">رتبه‌بندی بر اساس عملکرد تیمی</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {workgroupScores.map((item: any, index: number) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md ${
                  index === 0 ? 'bg-primary-subtle border-border-strong' :
                  index === 1 ? 'bg-surface-sunken border-border-strong' :
                  index === 2 ? 'bg-warning-subtle border-border-strong' :
                  'bg-surface border-border'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <RankBadge rank={index + 1} />
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{item.name}</p>
                    <p className="text-xs text-foreground-muted">
                      {item.memberCount} عضو • {item.evaluationCount} ارزیابی
                    </p>
                  </div>
                </div>
                <div className="text-start">
                  <p className="text-2xl font-bold text-foreground">{item.average.toFixed(2)}</p>
                  <p className="text-xs text-foreground-muted">میانگین</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
