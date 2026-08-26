"use client"

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
import { SCORE_MAX, getRoleBadgeClass, getRoleLabel } from "@/lib/roles"

const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
]

export interface RoleEvaluationRow {
  id: string
  month: number
  year: number
  targetRole: string
  averageScore: number
  totalScore: number
  target: { firstName: string; lastName: string }
  evaluator: { firstName: string; lastName: string }
  workgroup: { name: string }
}

function scoreBadgeClass(average: number) {
  if (average >= 8) return "bg-success/10 text-success border border-success/30"
  if (average >= 6) return "bg-info/10 text-info border border-info/30"
  if (average >= 4) return "bg-amber-100 text-amber-700 border border-amber-300"
  return "bg-destructive/10 text-destructive border border-destructive/30"
}

function monthLabel(month: number) {
  return PERSIAN_MONTHS[month - 1] ?? month
}

export function RoleEvaluationsTable({
  evaluations,
  /** Show the evaluator instead of the evaluated person. */
  showEvaluator = false,
}: {
  evaluations: RoleEvaluationRow[]
  showEvaluator?: boolean
}) {
  if (evaluations.length === 0) {
    return (
      <p className="text-nude-500 text-center py-8 text-sm">
        هنوز ارزیابی ثبت نشده است
      </p>
    )
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">
                {showEvaluator ? "ارزیاب" : "فرد ارزیابی‌شده"}
              </TableHead>
              <TableHead className="text-right">نقش</TableHead>
              <TableHead className="text-right">کارگروه</TableHead>
              <TableHead className="text-right">دوره</TableHead>
              <TableHead className="text-center">میانگین</TableHead>
              <TableHead className="text-center">امتیاز کل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.map((evaluation) => {
              const person = showEvaluator ? evaluation.evaluator : evaluation.target
              return (
                <TableRow key={evaluation.id}>
                  <TableCell className="font-medium text-sm">
                    {person.firstName} {person.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getRoleBadgeClass(evaluation.targetRole)}`}>
                      {getRoleLabel(evaluation.targetRole)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-nude-600 text-sm">
                    {evaluation.workgroup.name}
                  </TableCell>
                  <TableCell className="text-sm">
                    {monthLabel(evaluation.month)} {evaluation.year}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={`text-xs ${scoreBadgeClass(evaluation.averageScore)}`}>
                      {evaluation.averageScore.toFixed(2)}/{SCORE_MAX}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm text-nude-700 font-semibold">
                    {evaluation.totalScore}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3 p-4">
        {evaluations.map((evaluation) => {
          const person = showEvaluator ? evaluation.evaluator : evaluation.target
          return (
            <Card key={evaluation.id} className="border border-nude-200">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-nude-900 text-sm truncate">
                      {person.firstName} {person.lastName}
                    </p>
                    <p className="text-nude-500 text-xs mt-0.5">{evaluation.workgroup.name}</p>
                  </div>
                  <Badge className={`text-xs flex-shrink-0 ${scoreBadgeClass(evaluation.averageScore)}`}>
                    {evaluation.averageScore.toFixed(2)}/{SCORE_MAX}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`text-xs ${getRoleBadgeClass(evaluation.targetRole)}`}>
                    {getRoleLabel(evaluation.targetRole)}
                  </Badge>
                  <span className="text-xs text-nude-600">
                    {monthLabel(evaluation.month)} {evaluation.year}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}
