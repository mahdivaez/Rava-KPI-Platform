"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

  const getMedalEmoji = (index: number) => {
    if (index === 0) return "🥇"
    if (index === 1) return "🥈"
    if (index === 2) return "🥉"
    return `${index + 1}.`
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "badge-success"
    if (score >= 6) return "bg-info/10 text-info border border-info/30"
    if (score >= 4) return "badge-warning"
    return "badge-error"
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <>
      {/* Top Strategists */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            🏆 برترین استراتژیست‌ها
          </CardTitle>
          <CardDescription>افراد با بالاترین میانگین امتیاز</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topStrategists.length > 0 ? topStrategists.map((strategist, index) => (
              <div 
                key={strategist.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl w-8 text-center">{getMedalEmoji(index)}</span>
                  <Avatar>
                    <AvatarFallback className="bg-nude-200 text-nude-700">
                      {getInitials(strategist.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{strategist.name}</p>
                    <p className="text-xs text-slate-500">
                      {strategist.count} ارزیابی
                    </p>
                  </div>
                </div>
                <Badge className={`${getScoreColor(strategist.avg)} font-bold`}>
                  {strategist.avg.toFixed(2)}/10
                </Badge>
              </div>
            )) : (
              <p className="text-center text-slate-500 py-8">
                هنوز ارزیابی ثبت نشده است
              </p>
            )}
          </div>
          
          {topStrategists.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">میانگین کلی:</span>
                <span className="font-bold text-nude-700">
                  {(topStrategists.reduce((sum, s) => sum + s.avg, 0) / topStrategists.length).toFixed(2)}/10
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Writers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-500" />
            ⭐ برترین نویسندگان
          </CardTitle>
          <CardDescription>افراد با بالاترین میانگین امتیاز</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topWriters.length > 0 ? topWriters.map((writer, index) => (
              <div 
                key={writer.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl w-8 text-center">{getMedalEmoji(index)}</span>
                  <Avatar>
                    <AvatarFallback className="bg-nude-200 text-nude-700">
                      {getInitials(writer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{writer.name}</p>
                    <p className="text-xs text-slate-500">
                      {writer.count} ارزیابی
                    </p>
                  </div>
                </div>
                <Badge className={`${getScoreColor(writer.avg)} font-bold`}>
                  {writer.avg.toFixed(2)}/10
                </Badge>
              </div>
            )) : (
              <p className="text-center text-slate-500 py-8">
                هنوز ارزیابی ثبت نشده است
              </p>
            )}
          </div>
          
          {topWriters.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">میانگین کلی:</span>
                <span className="font-bold text-nude-700">
                  {(topWriters.reduce((sum, w) => sum + w.avg, 0) / topWriters.length).toFixed(2)}/10
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

