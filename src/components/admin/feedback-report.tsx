"use client"

import { WriterFeedback, User, Workgroup } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

type FeedbackWithRelations = WriterFeedback & {
  writer: User
  workgroup: Workgroup
}

export function FeedbackReport({
  feedbacks,
}: {
  feedbacks: FeedbackWithRelations[]
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (feedbacks.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-slate-500">
            هنوز بازخوردی ثبت نشده است
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
      {feedbacks.map((feedback) => {
        const isExpanded = expandedId === feedback.id
        const avgScore = Math.round(
          (feedback.communication +
            feedback.supportLevel +
            feedback.clarityOfTasks +
            feedback.feedbackQuality) / 4
        )

        return (
          <Card key={feedback.id} className="overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => toggleExpand(feedback.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    بازخورد از: {feedback.writer.firstName} {feedback.writer.lastName}
                  </CardTitle>
                  <div className="flex gap-4 mt-2 text-sm text-slate-600">
                    <span>کارگروه: {feedback.workgroup.name}</span>
                    <span>دوره: {feedback.month}/{feedback.year}</span>
                    <span className="text-orange-600">درباره استراتژیست (ID: {feedback.strategistId.slice(0, 8)}...)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={avgScore >= 7 ? "default" : avgScore >= 5 ? "secondary" : "destructive"}
                    className="text-base px-3 py-1"
                  >
                    میانگین: {avgScore}/10
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <ScoreItem label="ارتباطات" score={feedback.communication} />
                      <ScoreItem label="سطح پشتیبانی" score={feedback.supportLevel} />
                      <ScoreItem label="وضوح وظایف" score={feedback.clarityOfTasks} />
                      <ScoreItem label="کیفیت بازخورد" score={feedback.feedbackQuality} />
                    </div>
                  </div>

                  {/* Textual Feedback */}
                  <div className="space-y-4">
                    {feedback.positivePoints && (
                      <div>
                        <h4 className="font-semibold text-green-700 mb-2">✨ نقاط مثبت</h4>
                        <p className="text-slate-700 bg-green-50 p-3 rounded-lg">
                          {feedback.positivePoints}
                        </p>
                      </div>
                    )}

                    {feedback.improvements && (
                      <div>
                        <h4 className="font-semibold text-orange-700 mb-2">📈 نقاط قابل بهبود</h4>
                        <p className="text-slate-700 bg-orange-50 p-3 rounded-lg">
                          {feedback.improvements}
                        </p>
                      </div>
                    )}

                    {feedback.suggestions && (
                      <div>
                        <h4 className="font-semibold text-blue-700 mb-2">💡 پیشنهادات</h4>
                        <p className="text-slate-700 bg-blue-50 p-3 rounded-lg">
                          {feedback.suggestions}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-slate-500 pt-4 border-t">
                    <div className="flex gap-6">
                      <span>تاریخ ارسال: {new Date(feedback.createdAt).toLocaleDateString('fa-IR')}</span>
                      <span>آخرین بروزرسانی: {new Date(feedback.updatedAt).toLocaleDateString('fa-IR')}</span>
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

