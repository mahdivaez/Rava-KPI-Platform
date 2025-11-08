"use client"

import { WriterEvaluation, User, Workgroup } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

type EvaluationWithRelations = WriterEvaluation & {
  writer: User
  strategist: User
  workgroup: Workgroup
}

export function WriterEvaluationsReport({
  evaluations,
}: {
  evaluations: EvaluationWithRelations[]
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (evaluations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-slate-500">
            هنوز ارزیابی نویسنده‌ای ثبت نشده است
          </p>
        </CardContent>
      </Card>
    )
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="space-y-4">
      {evaluations.map((evaluation) => {
        const isExpanded = expandedId === evaluation.id
        const avgScore = Math.round(
          (evaluation.responsibility +
            evaluation.strategistSatisfaction +
            evaluation.meetingEngagement +
            evaluation.scenarioPerformance +
            evaluation.clientSatisfaction +
            evaluation.brandAlignment) / 6
        )

        return (
          <Card key={evaluation.id} className="overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => toggleExpand(evaluation.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {evaluation.writer.firstName} {evaluation.writer.lastName}
                  </CardTitle>
                  <div className="flex gap-4 mt-2 text-sm text-slate-600">
                    <span>کارگروه: {evaluation.workgroup.name}</span>
                    <span>دوره: {evaluation.month}/{evaluation.year}</span>
                    <span>استراتژیست: {evaluation.strategist.firstName} {evaluation.strategist.lastName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={avgScore >= 7 ? "default" : avgScore >= 5 ? "secondary" : "destructive"}
                    className="text-base px-3 py-1"
                  >
                    میانگین: {avgScore}/10
                  </Badge>
                  <Badge
                    variant={evaluation.status === "COMPLETED" ? "default" : "secondary"}
                    className="bg-green-500"
                  >
                    {evaluation.status === "COMPLETED" ? "تکمیل شده" : "در انتظار"}
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-500" />
                  )}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="border-t pt-6">
                <div className="grid gap-6">
                  {/* Scores Grid */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">امتیازات جزئی</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <ScoreItem label="مسئولیت‌پذیری" score={evaluation.responsibility} />
                      <ScoreItem label="رضایت استراتژیست" score={evaluation.strategistSatisfaction} />
                      <ScoreItem label="مشارکت در جلسات" score={evaluation.meetingEngagement} />
                      <ScoreItem label="عملکرد سناریو" score={evaluation.scenarioPerformance} />
                      <ScoreItem label="رضایت مشتری" score={evaluation.clientSatisfaction} />
                      <ScoreItem label="هماهنگی با برند" score={evaluation.brandAlignment} />
                    </div>
                  </div>

                  {/* Textual Feedback */}
                  <div className="space-y-4">
                    {evaluation.strengths && (
                      <div>
                        <h4 className="font-semibold text-green-700 mb-2">💪 نقاط قوت</h4>
                        <p className="text-slate-700 bg-green-50 p-3 rounded-lg">
                          {evaluation.strengths}
                        </p>
                      </div>
                    )}

                    {evaluation.improvements && (
                      <div>
                        <h4 className="font-semibold text-orange-700 mb-2">📈 نقاط قابل بهبود</h4>
                        <p className="text-slate-700 bg-orange-50 p-3 rounded-lg">
                          {evaluation.improvements}
                        </p>
                      </div>
                    )}

                    {evaluation.suggestions && (
                      <div>
                        <h4 className="font-semibold text-blue-700 mb-2">💡 پیشنهادات</h4>
                        <p className="text-slate-700 bg-blue-50 p-3 rounded-lg">
                          {evaluation.suggestions}
                        </p>
                      </div>
                    )}

                    {evaluation.evaluatorNotes && (
                      <div>
                        <h4 className="font-semibold text-purple-700 mb-2">🔒 یادداشت استراتژیست (خصوصی)</h4>
                        <p className="text-slate-700 bg-purple-50 p-3 rounded-lg">
                          {evaluation.evaluatorNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-slate-500 pt-4 border-t">
                    <div className="flex gap-6">
                      <span>تاریخ ایجاد: {new Date(evaluation.createdAt).toLocaleDateString('fa-IR')}</span>
                      <span>آخرین بروزرسانی: {new Date(evaluation.updatedAt).toLocaleDateString('fa-IR')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}

function ScoreItem({ label, score }: { label: string; score: number }) {
  const getColor = (score: number) => {
    if (score >= 8) return "text-green-700 bg-green-100"
    if (score >= 6) return "text-blue-700 bg-blue-100"
    if (score >= 4) return "text-orange-700 bg-orange-100"
    return "text-red-700 bg-red-100"
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`font-bold text-lg px-2 py-1 rounded ${getColor(score)}`}>
        {score}
      </span>
    </div>
  )
}

