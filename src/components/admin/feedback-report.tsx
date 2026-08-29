"use client"

import { WriterFeedback, User, Workgroup } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { formatPersianDateTime } from "@/lib/utils"
import Link from "next/link"
import { ImageWithModal } from "@/components/ui/image-with-modal"

type FeedbackWithRelations = WriterFeedback & {
  writer: User
  strategist?: User | null
  workgroup: Workgroup
  imageUrl?: string | null
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
          <p className="text-center text-foreground-subtle">
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
    <>
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
              className="cursor-pointer hover:bg-surface-hover transition-colors p-4 sm:p-6"
              onClick={() => toggleExpand(feedback.id)}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg truncate">
                    بازخورد از: {feedback.writer.firstName} {feedback.writer.lastName}
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-foreground-muted">
                    <span className="truncate">کارگروه: {feedback.workgroup.name}</span>
                    <span>دوره: {feedback.month}/{feedback.year}</span>
                    <span className="text-warning truncate">
                      درباره استراتژیست:{" "}
                      {feedback.strategist
                        ? `${feedback.strategist.firstName} ${feedback.strategist.lastName}`
                        : "نامشخص"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <Badge
                    variant={avgScore >= 7 ? "default" : avgScore >= 5 ? "secondary" : "destructive"}
                    className="text-xs sm:text-base px-2 sm:px-3 py-1"
                  >
                    میانگین: {avgScore} از ۱۰
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                      <ScoreItem label="ارتباطات" score={feedback.communication} />
                      <ScoreItem label="سطح پشتیبانی" score={feedback.supportLevel} />
                      <ScoreItem label="وضوح وظایف" score={feedback.clarityOfTasks} />
                      <ScoreItem label="کیفیت بازخورد" score={feedback.feedbackQuality} />
                    </div>
                  </div>

                  {/* Textual Feedback */}
                  <div className="space-y-3 sm:space-y-4">
                    {feedback.positivePoints && (
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base text-success mb-2">نقاط مثبت</h4>
                        <p className="text-xs sm:text-sm text-foreground-secondary bg-success-subtle p-2 sm:p-3 rounded-lg">
                          {feedback.positivePoints}
                        </p>
                      </div>
                    )}

                    {feedback.improvements && (
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base text-warning mb-2">نقاط قابل بهبود</h4>
                        <p className="text-xs sm:text-sm text-foreground-secondary bg-warning-subtle p-2 sm:p-3 rounded-lg">
                          {feedback.improvements}
                        </p>
                      </div>
                    )}

                    {feedback.suggestions && (
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base text-info mb-2">پیشنهادات</h4>
                        <p className="text-xs sm:text-sm text-foreground-secondary bg-info-subtle p-2 sm:p-3 rounded-lg">
                          {feedback.suggestions}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Image Display with Modal */}
                  {feedback.imageUrl && (
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base text-primary mb-2">📷 تصویر بازخورد</h4>
                      <ImageWithModal
                        src={feedback.imageUrl}
                        alt="تصویر بازخورد"
                        className="max-w-full h-auto rounded-lg border border-border shadow-md"
                        style={{
                          maxHeight: '400px',
                          objectFit: 'contain',
                          borderColor: 'rgb(var(--success))', // Green border to indicate clickable
                          boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)'
                        }}
                      />
                      {/* Additional download link */}
                      <div className="mt-2">
                        <Link
                          href={feedback.imageUrl.startsWith("http") ? feedback.imageUrl : `/${feedback.imageUrl}`}
                          target="_blank"
                          className="text-xs text-primary hover:text-foreground underline"
                        >
                          باز کردن تصویر در تب جدید
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-xs text-foreground-subtle pt-3 sm:pt-4 border-t">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                      <span>تاریخ ارسال: {formatPersianDateTime(feedback.createdAt)}</span>
                      <span>آخرین بروزرسانی: {formatPersianDateTime(feedback.updatedAt)}</span>
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
