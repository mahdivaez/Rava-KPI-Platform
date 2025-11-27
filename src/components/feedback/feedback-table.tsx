"use client"

import { WriterFeedback, Workgroup } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatPersianDate } from "@/lib/utils"

type FeedbackWithRelations = WriterFeedback & {
  workgroup: Workgroup
}

export function FeedbackTable({
  feedbacks,
}: {
  feedbacks: FeedbackWithRelations[]
}) {
  if (feedbacks.length === 0) {
    return (
      <p className="text-slate-500 text-center py-8">
        هنوز بازخوردی ارسال نشده است
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>کارگروه</TableHead>
          <TableHead>دوره</TableHead>
          <TableHead className="text-center">میانگین امتیاز</TableHead>
          <TableHead>تاریخ ارسال</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {feedbacks.map((feedback) => {
          const avgScore = Math.round(
            (feedback.communication +
              feedback.supportLevel +
              feedback.clarityOfTasks +
              feedback.feedbackQuality) / 4
          )

          return (
            <TableRow key={feedback.id}>
              <TableCell className="font-medium">
                {feedback.workgroup.name}
              </TableCell>
              <TableCell>
                {feedback.month}/{feedback.year}
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <Badge
                    variant={avgScore >= 7 ? "default" : avgScore >= 5 ? "secondary" : "destructive"}
                  >
                    {avgScore}/10
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-slate-600">
                {formatPersianDate(feedback.createdAt)}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

