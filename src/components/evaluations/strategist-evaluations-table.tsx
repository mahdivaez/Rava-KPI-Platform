"use client"

import { StrategistEvaluation, User } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type EvaluationWithRelations = StrategistEvaluation & {
  strategist: User
  evaluator: User
}

export function StrategistEvaluationsTable({
  evaluations,
}: {
  evaluations: EvaluationWithRelations[]
}) {
  if (evaluations.length === 0) {
    return (
      <p className="text-slate-500 text-center py-8">
        هنوز ارزیابی ثبت نشده است
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>استراتژیست</TableHead>
          <TableHead>دوره</TableHead>
          <TableHead>ارزیاب</TableHead>
          <TableHead>میانگین امتیاز</TableHead>
          <TableHead>وضعیت</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {evaluations.map((evaluation) => {
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
            <TableRow key={evaluation.id}>
              <TableCell className="font-medium">
                {evaluation.strategist.firstName} {evaluation.strategist.lastName}
              </TableCell>
              <TableCell>
                {evaluation.month}/{evaluation.year}
              </TableCell>
              <TableCell className="text-slate-600">
                {evaluation.evaluator.firstName} {evaluation.evaluator.lastName}
              </TableCell>
              <TableCell>
                <Badge
                  variant={avgScore >= 7 ? "default" : avgScore >= 5 ? "secondary" : "destructive"}
                >
                  {avgScore}/10
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={evaluation.status === "COMPLETED" ? "default" : "secondary"}
                  className={evaluation.status === "COMPLETED" ? "bg-green-500" : ""}
                >
                  {evaluation.status === "COMPLETED" ? "تکمیل شده" : "در انتظار"}
                </Badge>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

