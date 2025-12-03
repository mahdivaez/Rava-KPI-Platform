"use client"

import { StrategistEvaluation, User } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">استراتژیست</TableHead>
              <TableHead className="text-right">دوره</TableHead>
              <TableHead className="text-right">ارزیاب</TableHead>
              <TableHead className="text-center">میانگین امتیاز</TableHead>
              <TableHead className="text-center">وضعیت</TableHead>
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
                  <TableCell className="font-medium text-sm">
                    {evaluation.strategist.firstName} {evaluation.strategist.lastName}
                  </TableCell>
                  <TableCell className="text-sm">
                    {evaluation.month}/{evaluation.year}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {evaluation.evaluator.firstName} {evaluation.evaluator.lastName}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={avgScore >= 7 ? "default" : avgScore >= 5 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {avgScore}/10
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={evaluation.status === "COMPLETED" ? "default" : "secondary"}
                      className={evaluation.status === "COMPLETED" ? "bg-green-500 text-xs" : "text-xs"}
                    >
                      {evaluation.status === "COMPLETED" ? "تکمیل شده" : "در انتظار"}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
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
            <Card key={evaluation.id} className="border border-slate-200">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-slate-900">
                      {evaluation.strategist.firstName} {evaluation.strategist.lastName}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      ارزیاب: {evaluation.evaluator.firstName} {evaluation.evaluator.lastName}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      دوره: {evaluation.month}/{evaluation.year}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge
                      variant={avgScore >= 7 ? "default" : avgScore >= 5 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {avgScore}/10
                    </Badge>
                    <Badge
                      variant={evaluation.status === "COMPLETED" ? "default" : "secondary"}
                      className={`text-xs ${
                        evaluation.status === "COMPLETED" ? "bg-green-500" : ""
                      }`}
                    >
                      {evaluation.status === "COMPLETED" ? "تکمیل شده" : "در انتظار"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}

