"use client"

import { WriterEvaluation, User, Workgroup } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { formatPersianDateTime } from "@/lib/utils"
import Link from "next/link"
import { ImageWithModal } from "@/components/ui/image-with-modal"

type EvaluationWithRelations = WriterEvaluation & {
  writer: User
  strategist: User
  workgroup: Workgroup
  imageUrl?: string | null
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
          <p className="text-center text-foreground-subtle">
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
    <>
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
              className="cursor-pointer hover:bg-surface-hover transition-colors p-4 sm:p-6"
              onClick={() => toggleExpand(evaluation.id)}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg truncate">
                    {evaluation.writer.firstName} {evaluation.writer.lastName}
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-foreground-muted">
                    <span className="truncate">کارگروه: {evaluation.workgroup.name}</span>
                    <span>دوره: {evaluation.month}/{evaluation.year}</span>
                    <span className="truncate">استراتژیست: {evaluation.strategist.firstName} {evaluation.strategist.lastName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <Badge
                    variant={avgScore >= 7 ? "default" : avgScore >= 5 ? "secondary" : "destructive"}
                    className="text-xs sm:text-base px-2 sm:px-3 py-1"
                  >
                    میانگین: {avgScore} از ۱۰
                  </Badge>
                  <Badge
                    variant={evaluation.status === "COMPLETED" ? "default" : "secondary"}
                    className="bg-success text-xs sm:text-sm px-2 sm:px-3"
                  >
                    {evaluation.status === "COMPLETED" ? "تکمیل شده" : "در انتظار"}
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-foreground-subtle flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-foreground-subtle flex-shrink-0" />
                  )}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="border-t pt-4 sm:pt-6 p-4 sm:p-6">
                <div className="grid gap-4 sm:gap-6">
                  {/* Scores Grid */}
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-foreground mb-3">امتیازات جزئی</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                      <ScoreItem label="مسئولیت‌پذیری" score={evaluation.responsibility} />
                      <ScoreItem label="رضایت استراتژیست" score={evaluation.strategistSatisfaction} />
                      <ScoreItem label="مشارکت در جلسات" score={evaluation.meetingEngagement} />
                      <ScoreItem label="عملکرد سناریو" score={evaluation.scenarioPerformance} />
                      <ScoreItem label="رضایت مشتری" score={evaluation.clientSatisfaction} />
                      <ScoreItem label="هماهنگی با برند" score={evaluation.brandAlignment} />
                    </div>
                  </div>

                  {/* Textual Feedback */}
                  <div className="space-y-3 sm:space-y-4">
                    {evaluation.strengths && (
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base text-success mb-2">💪 نقاط قوت</h4>
                        <p className="text-xs sm:text-sm text-foreground-secondary bg-success-subtle p-2 sm:p-3 rounded-lg">
                          {evaluation.strengths}
                        </p>
                      </div>
                    )}

                    {evaluation.improvements && (
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base text-warning mb-2">نقاط قابل بهبود</h4>
                        <p className="text-xs sm:text-sm text-foreground-secondary bg-warning-subtle p-2 sm:p-3 rounded-lg">
                          {evaluation.improvements}
                        </p>
                      </div>
                    )}

                    {evaluation.suggestions && (
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base text-info mb-2">پیشنهادات</h4>
                        <p className="text-xs sm:text-sm text-foreground-secondary bg-info-subtle p-2 sm:p-3 rounded-lg">
                          {evaluation.suggestions}
                        </p>
                      </div>
                    )}

                    {evaluation.evaluatorNotes && (
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base text-primary mb-2">یادداشت استراتژیست (خصوصی)</h4>
                        <p className="text-xs sm:text-sm text-foreground-secondary bg-primary-subtle p-2 sm:p-3 rounded-lg">
                          {evaluation.evaluatorNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Image Display */}
                  {evaluation.imageUrl && (
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base text-primary mb-2">📷 تصویر ارزیابی</h4>
                      <ImageWithModal
                        src={evaluation.imageUrl}
                        alt="تصویر ارزیابی"
                        className="max-w-full h-auto rounded-lg border border-border shadow-md"
                        style={{
                          maxHeight: '400px',
                          objectFit: 'contain',
                          borderColor: 'rgb(var(--success))', // Green border to indicate clickable
                          boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)'
                        }}
                      />
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-xs text-foreground-subtle pt-3 sm:pt-4 border-t">
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
    </>
  )
}

function ScoreItem({ label, score }: { label: string; score: number }) {
  const getColor = (score: number) => {
    if (score >= 8) return "text-success bg-success-subtle"
    if (score >= 6) return "text-info bg-info-subtle"
    if (score >= 4) return "text-warning bg-warning-subtle"
    return "text-danger bg-danger-subtle"
  }

  return (
    <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg border">
      <span className="text-xs sm:text-sm text-foreground-muted truncate">{label}</span>
      <span className={`font-bold text-base sm:text-lg px-2 py-1 rounded flex-shrink-0 ${getColor(score)}`}>
        {score}
      </span>
    </div>
  )
}
