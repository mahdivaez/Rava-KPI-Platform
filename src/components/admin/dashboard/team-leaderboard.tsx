"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, TrendingUp, Medal, Award, Crown } from "lucide-react"

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

  const getMedalIcon = (rank: number) => {
    if (rank === 0) return <Crown className="w-5 h-5 text-yellow-500" />
    if (rank === 1) return <Medal className="w-5 h-5 text-slate-400" />
    if (rank === 2) return <Medal className="w-5 h-5 text-amber-700" />
    return <span className="text-sm font-bold text-slate-500">#{rank + 1}</span>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Top Strategists */}
      <Card className="border-2 border-teal-200 bg-white shadow-lg">
        <CardHeader className="border-b border-teal-200 bg-gradient-to-r from-teal-50 to-white">
          <CardTitle className="text-teal-900 text-xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-teal-600" />
            برترین استراتژیست‌ها
          </CardTitle>
          <CardDescription className="text-teal-600">رتبه‌بندی بر اساس میانگین امتیاز</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {topStrategists.map((item: any, index: number) => (
              <div 
                key={item.user.id}
                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all hover:shadow-md ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300' :
                  index === 1 ? 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-300' :
                  index === 2 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300' :
                  'bg-white border-teal-200'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-8">
                    {getMedalIcon(index)}
                  </div>
                  <Avatar className="w-10 h-10 border-2 border-teal-200">
                    <AvatarImage src={item.user.image} />
                    <AvatarFallback className="bg-teal-100 text-teal-700 font-bold">
                      {getInitials(`${item.user.firstName} ${item.user.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {item.user.firstName} {item.user.lastName}
                    </p>
                    <p className="text-xs text-slate-600">{item.count} ارزیابی</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-teal-900">{item.average.toFixed(2)}</p>
                  <p className="text-xs text-slate-600">از 10</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Writers */}
      <Card className="border-2 border-purple-200 bg-white shadow-lg">
        <CardHeader className="border-b border-purple-200 bg-gradient-to-r from-purple-50 to-white">
          <CardTitle className="text-purple-900 text-xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-purple-600" />
            برترین نویسندگان
          </CardTitle>
          <CardDescription className="text-purple-600">رتبه‌بندی بر اساس میانگین امتیاز</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {topWriters.map((item: any, index: number) => (
              <div 
                key={item.user.id}
                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all hover:shadow-md ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300' :
                  index === 1 ? 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-300' :
                  index === 2 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300' :
                  'bg-white border-purple-200'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-8">
                    {getMedalIcon(index)}
                  </div>
                  <Avatar className="w-10 h-10 border-2 border-purple-200">
                    <AvatarImage src={item.user.image} />
                    <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">
                      {getInitials(`${item.user.firstName} ${item.user.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {item.user.firstName} {item.user.lastName}
                    </p>
                    <p className="text-xs text-slate-600">{item.count} ارزیابی</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-900">{item.average.toFixed(2)}</p>
                  <p className="text-xs text-slate-600">از 10</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Most Improved */}
      <Card className="border-2 border-amber-200 bg-white shadow-lg">
        <CardHeader className="border-b border-amber-200 bg-gradient-to-r from-amber-50 to-white">
          <CardTitle className="text-amber-900 text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-600" />
            بیشترین پیشرفت
          </CardTitle>
          <CardDescription className="text-amber-600">کاربران با بیشترین رشد</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700 mb-2">استراتژیست‌ها:</p>
            {mostImprovedStrategists.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-white rounded-xl border-2 border-green-200">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 border-2 border-green-300">
                    <AvatarImage src={item.user.image} />
                    <AvatarFallback className="bg-green-100 text-green-700 text-xs font-bold">
                      {getInitials(`${item.user.firstName} ${item.user.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      {item.user.firstName} {item.user.lastName}
                    </p>
                    <p className="text-xs text-slate-600">
                      {item.oldScore.toFixed(1)} → {item.newScore.toFixed(1)}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-300">
                  +{item.improvement.toFixed(2)}
                </Badge>
              </div>
            ))}
            
            <p className="text-sm font-semibold text-slate-700 mt-4 mb-2">نویسندگان:</p>
            {mostImprovedWriters.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-white rounded-xl border-2 border-green-200">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 border-2 border-green-300">
                    <AvatarImage src={item.user.image} />
                    <AvatarFallback className="bg-green-100 text-green-700 text-xs font-bold">
                      {getInitials(`${item.user.firstName} ${item.user.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      {item.user.firstName} {item.user.lastName}
                    </p>
                    <p className="text-xs text-slate-600">
                      {item.oldScore.toFixed(1)} → {item.newScore.toFixed(1)}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-300">
                  +{item.improvement.toFixed(2)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Workgroups */}
      <Card className="border-2 border-rose-200 bg-white shadow-lg">
        <CardHeader className="border-b border-rose-200 bg-gradient-to-r from-rose-50 to-white">
          <CardTitle className="text-rose-900 text-xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-rose-600" />
            برترین کارگروه‌ها
          </CardTitle>
          <CardDescription className="text-rose-600">رتبه‌بندی بر اساس عملکرد تیمی</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {workgroupScores.map((item: any, index: number) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300' :
                  index === 1 ? 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-300' :
                  index === 2 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300' :
                  'bg-white border-rose-200'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-8">
                    {getMedalIcon(index)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-600">
                      {item.memberCount} عضو • {item.evaluationCount} ارزیابی
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-rose-900">{item.average.toFixed(2)}</p>
                  <p className="text-xs text-slate-600">میانگین</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
