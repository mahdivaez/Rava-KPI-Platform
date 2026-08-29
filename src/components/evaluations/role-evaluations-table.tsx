"use client"

import { ClipboardList } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { EmptyState } from "@/components/ui/empty-state"
import { RoleBadge } from "@/components/ui/role-badge"
import { ScoreBadge } from "@/components/ui/score"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SCORE_MAX } from "@/lib/roles"
import { faNumber } from "@/lib/design-tokens"

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

function monthLabel(month: number) {
  return PERSIAN_MONTHS[month - 1] ?? month
}

function initials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}` || "؟"
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
      <EmptyState
        icon={<ClipboardList />}
        title="هنوز ارزیابی ثبت نشده است"
        description="پس از ثبت اولین ارزیابی، سابقه آن در این جدول نمایش داده می‌شود."
      />
    )
  }

  const personColumn = showEvaluator ? "ارزیاب" : "فرد ارزیابی‌شده"

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{personColumn}</TableHead>
              <TableHead>نقش</TableHead>
              <TableHead>کارگروه</TableHead>
              <TableHead>دوره</TableHead>
              <TableHead className="text-center">میانگین</TableHead>
              <TableHead className="text-center">امتیاز کل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.map((evaluation) => {
              const person = showEvaluator ? evaluation.evaluator : evaluation.target
              return (
                <TableRow key={evaluation.id}>
                  <TableCell>
                    <span className="flex items-center gap-2.5">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-2xs">
                          {initials(person.firstName, person.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">
                        {person.firstName} {person.lastName}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={evaluation.targetRole} size="sm" />
                  </TableCell>
                  <TableCell className="text-foreground-muted">
                    {evaluation.workgroup.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-foreground-secondary">
                    {monthLabel(evaluation.month)} {faNumber(evaluation.year)}
                  </TableCell>
                  <TableCell className="text-center">
                    <ScoreBadge score={evaluation.averageScore} />
                  </TableCell>
                  <TableCell
                    data-numeric
                    className="text-center font-semibold text-foreground-secondary"
                  >
                    {faNumber(evaluation.totalScore)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <ul className="space-y-3 p-4 md:hidden">
        {evaluations.map((evaluation) => {
          const person = showEvaluator ? evaluation.evaluator : evaluation.target
          return (
            <li
              key={evaluation.id}
              className="rounded-xl border border-border bg-surface-sunken p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {person.firstName} {person.lastName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-foreground-muted">
                    {evaluation.workgroup.name}
                  </p>
                </div>
                <ScoreBadge score={evaluation.averageScore} className="shrink-0" />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <RoleBadge role={evaluation.targetRole} size="sm" />
                <span className="text-xs text-foreground-muted">
                  {monthLabel(evaluation.month)} {faNumber(evaluation.year)}
                </span>
                <span className="text-xs text-foreground-subtle">
                  امتیاز کل: {faNumber(evaluation.totalScore)} از{" "}
                  {faNumber(SCORE_MAX * 6)}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
