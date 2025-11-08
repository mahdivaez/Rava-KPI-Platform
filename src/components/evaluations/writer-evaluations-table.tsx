"use client"

import { WriterEvaluation, User, Workgroup } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type EvaluationWithRelations = WriterEvaluation & {
  writer: User
  strategist: User
  workgroup: Workgroup
}

export function WriterEvaluationsTable({
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
          <TableHead>نویسنده</TableHead>
          <TableHead>کارگروه</TableHead>
          <TableHead>دوره</TableHead>
          <TableHead>استراتژیست</TableHead>
          <TableHead>میانگین امتیاز</TableHead>
          <TableHead>وضعیت</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {evaluations.map((evaluation) => {
          const avgScore = Math.round(
            (evaluation.responsibility +
              evaluation.strategistSatisfaction +
              evaluation.meetingEngagement +
              evaluation.scenarioPerformance +
              evaluation.clientSatisfaction +
              evaluation.brandAlignment) / 6
          )

          return (
            <TableRow key={evaluation.id}>
              <TableCell className="font-medium">
                {evaluation.writer.firstName} {evaluation.writer.lastName}
              </TableCell>
              <TableCell className="text-slate-600">
                {evaluation.workgroup.name}
              </TableCell>
              <TableCell>
                {evaluation.month}/{evaluation.year}
              </TableCell>
              <TableCell className="text-slate-600">
                {evaluation.strategist.firstName} {evaluation.strategist.lastName}
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

