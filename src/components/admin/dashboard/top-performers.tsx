"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { RankBadge } from "@/components/ui/rank"
import { ScoreBadge } from "@/components/ui/score"
import { Award, TrendingUp, Star } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TopPerformersProps {
  strategistEvaluations: any[]
  writerEvaluations: any[]
}

export function TopPerformers({ strategistEvaluations, writerEvaluations }: TopPerformersProps) {
  // Calculate average scores for strategists
  const strategistScores = new Map()
  
  strategistEvaluations.forEach(evaluation => {
    const userId = evaluation.strategistId
    const userName = `${evaluation.strategist.firstName} ${evaluation.strategist.lastName}`
    const avg = (evaluation.ideation + evaluation.avgViews + evaluation.qualityControl + evaluation.teamRelations + 
                evaluation.clientRelations + evaluation.responsiveness + evaluation.clientSatisfaction) / 7
    
    if (!strategistScores.has(userId)) {
      strategistScores.set(userId, {
        id: userId,
        name: userName,
        total: 0,
        count: 0,
        avg: 0,
      })
    }
    
    const data = strategistScores.get(userId)
    data.total += avg
    data.count++
    data.avg = data.total / data.count
  })

  const topStrategists = Array.from(strategistScores.values())
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5)

  // Calculate average scores for writers
  const writerScores = new Map()
  
  writerEvaluations.forEach(evaluation => {
    const userId = evaluation.writerId
    const userName = `${evaluation.writer.firstName} ${evaluation.writer.lastName}`
    const avg = (evaluation.responsibility + evaluation.strategistSatisfaction + evaluation.meetingEngagement + 
                evaluation.scenarioPerformance + evaluation.clientSatisfaction + evaluation.brandAlignment) / 6
    
    if (!writerScores.has(userId)) {
      writerScores.set(userId, {
        id: userId,
        name: userName,
        total: 0,
        count: 0,
        avg: 0,
      })
    }
    
    const data = writerScores.get(userId)
    data.total += avg
    data.count++
    data.avg = data.total / data.count
  })

  const topWriters = Array.from(writerScores.values())
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <>
      {/* Top Strategists */}
      <Card className="">
        <CardHeader className="border-b border-border-subtle">
          <CardTitle className="flex items-center gap-2">
            <Award className="size-5 text-foreground-subtle" aria-hidden />
            برترین استراتژیست‌ها
          </CardTitle>
          <CardDescription className="text-foreground-muted">افراد با بالاترین میانگین امتیاز</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topStrategists.length > 0 ? topStrategists.map((strategist, index) => (
              <div 
                key={strategist.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-sunken p-3 transition-colors duration-fast hover:bg-surface-hover"
              >
                <div className="flex items-center gap-3">
                  <RankBadge rank={index + 1} />
                  <Avatar>
                    <AvatarFallback className="bg-muted text-foreground-secondary">
                      {getInitials(strategist.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{strategist.name}</p>
                    <p className="text-xs text-foreground-subtle">
                      {strategist.count.toLocaleString("fa-IR")} ارزیابی
                    </p>
                  </div>
                </div>
                <ScoreBadge score={strategist.avg} />
              </div>
            )) : (
              <p className="text-center text-foreground-subtle py-8">
                هنوز ارزیابی ثبت نشده است
              </p>
            )}
          </div>
          
          {topStrategists.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-muted">میانگین کلی:</span>
                <span className="font-bold text-foreground-secondary">
                  {(topStrategists.reduce((sum, s) => sum + s.avg, 0) / topStrategists.length).toLocaleString("fa-IR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} از ۱۰
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Writers */}
      <Card className="">
        <CardHeader className="border-b border-border-subtle">
          <CardTitle className="flex items-center gap-2">
            <Star className="size-5 text-foreground-subtle" aria-hidden />
            برترین نویسندگان
          </CardTitle>
          <CardDescription className="text-foreground-muted">افراد با بالاترین میانگین امتیاز</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topWriters.length > 0 ? topWriters.map((writer, index) => (
              <div 
                key={writer.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-sunken p-3 transition-colors duration-fast hover:bg-surface-hover"
              >
                <div className="flex items-center gap-3">
                  <RankBadge rank={index + 1} />
                  <Avatar>
                    <AvatarFallback className="bg-muted text-foreground-secondary">
                      {getInitials(writer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{writer.name}</p>
                    <p className="text-xs text-foreground-subtle">
                      {writer.count.toLocaleString("fa-IR")} ارزیابی
                    </p>
                  </div>
                </div>
                <ScoreBadge score={writer.avg} />
              </div>
            )) : (
              <p className="text-center text-foreground-subtle py-8">
                هنوز ارزیابی ثبت نشده است
              </p>
            )}
          </div>
          
          {topWriters.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-muted">میانگین کلی:</span>
                <span className="font-bold text-foreground-secondary">
                  {(topWriters.reduce((sum, w) => sum + w.avg, 0) / topWriters.length).toLocaleString("fa-IR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} از ۱۰
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

