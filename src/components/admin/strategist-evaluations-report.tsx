"use client"

import { StrategistEvaluation, User } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { formatPersianDateTime } from "@/lib/utils"

type EvaluationWithRelations = StrategistEvaluation & {
  strategist: User
  evaluator: User
}

export function StrategistEvaluationsReport({
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
            هنوز ارزیابی استراتژیستی ثبت نشده است
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
          (evaluation.ideation +
            evaluation.avgViews +
            evaluation.qualityControl +
            evaluation.teamRelations +
            evaluation.clientRelations +
            evaluation.responsiveness +
            evaluation.clientSatisfaction) / 7
        )

        return (
          <Card key={evaluation.id} className="overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-slate-50 transition-colors p-4 sm:p-6"
              onClick={() => toggleExpand(evaluation.id)}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg truncate">
                    {evaluation.strategist.firstName} {evaluation.strategist.lastName}
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-slate-600">
                    <span>دوره: {evaluation.month}/{evaluation.year}</span>
                    <span className="truncate">ارزیاب: {evaluation.evaluator.firstName} {evaluation.evaluator.lastName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <Badge
                    variant={avgScore >= 7 ? "default" : avgScore >= 5 ? "secondary" : "destructive"}
                    className="text-xs sm:text-base px-2 sm:px-3 py-1"
                  >
                    میانگین: {avgScore}/10
                  </Badge>
                  <Badge
                    variant={evaluation.status === "COMPLETED" ? "default" : "secondary"}
                    className="bg-green-500 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    {evaluation.status === "COMPLETED" ? "تکمیل شده" : "در انتظار"}
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 flex-shrink-0" />
                  )}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="border-t pt-4 sm:pt-6 p-4 sm:p-6">
                <div className="grid gap-4 sm:gap-6">
                  {/* Scores Grid */}
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-slate-900 mb-3">امتیازات جزئی</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                      <ScoreItem label="ایده‌پردازی" score={evaluation.ideation} />
                      <ScoreItem label="میانگین بازدید" score={evaluation.avgViews} />
                      <ScoreItem label="کنترل کیفیت" score={evaluation.qualityControl} />
                      <ScoreItem label="روابط تیمی" score={evaluation.teamRelations} />
                      <ScoreItem label="روابط با مشتری" score={evaluation.clientRelations} />
                      <ScoreItem label="پاسخگویی" score={evaluation.responsiveness} />
                      <ScoreItem label="رضایت مشتری" score={evaluation.clientSatisfaction} />
                    </div>
                  </div>

                  {/* Textual Feedback */}
                  <div className="space-y-3 sm:space-y-4">
                    {evaluation.strengths && (
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base text-green-700 mb-2">💪 نقاط قوت</h4>
                        <p className="text-xs sm:text-sm text-slate-700 bg-green-50 p-2 sm:p-3 rounded-lg">
                          {evaluation.strengths}
                        </p>
                      </div>
                    )}

                    {evaluation.improvements && (
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base text-orange-700 mb-2">📈 نقاط قابل بهبود</h4>
                        <p className="text-xs sm:text-sm text-slate-700 bg-orange-50 p-2 sm:p-3 rounded-lg">
                          {evaluation.improvements}
                        </p>
                      </div>
                    )}

                    {evaluation.suggestions && (
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base text-blue-700 mb-2">💡 پیشنهادات</h4>
                        <p className="text-xs sm:text-sm text-slate-700 bg-blue-50 p-2 sm:p-3 rounded-lg">
                          {evaluation.suggestions}
                        </p>
                      </div>
                    )}

                    {evaluation.evaluatorNotes && (
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base text-purple-700 mb-2">🔒 یادداشت ارزیاب (خصوصی)</h4>
                        <p className="text-xs sm:text-sm text-slate-700 bg-purple-50 p-2 sm:p-3 rounded-lg">
                          {evaluation.evaluatorNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-slate-500 pt-3 sm:pt-4 border-t">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                      <span>تاریخ ایجاد: {formatPersianDateTime(evaluation.createdAt)}</span>
                      <span>آخرین بروزرسانی: {formatPersianDateTime(evaluation.updatedAt)}</span>
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
    <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg border">
      <span className="text-xs sm:text-sm text-slate-600 truncate">{label}</span>
      <span className={`font-bold text-base sm:text-lg px-2 py-1 rounded flex-shrink-0 ${getColor(score)}`}>
        {score}
      </span>
    </div>
  )
}

