"use client"

import { StrategistEvaluation, User } from "@prisma/client"
import { CheckCircle2, ClipboardList, Clock } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { ScoreBadge } from "@/components/ui/score"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
]

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
      <EmptyState
        icon={<ClipboardList />}
        title="هنوز ارزیابی ثبت نشده است"
        description="پس از ثبت اولین ارزیابی، سابقه آن در این جدول نمایش داده می‌شود."
      />
    )
  }

  // The seven metrics are stored on a 1–10 scale.
  const averageOf = (evaluation: EvaluationWithRelations) =>
    (evaluation.ideation +
      evaluation.avgViews +
      evaluation.qualityControl +
      evaluation.teamRelations +
      evaluation.clientRelations +
      evaluation.responsiveness +
      evaluation.clientSatisfaction) /
    7

  const initials = (first: string, last: string) =>
    `${first?.[0] ?? ""}${last?.[0] ?? ""}` || "؟"

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>استراتژیست</TableHead>
              <TableHead>دوره</TableHead>
              <TableHead>ارزیاب</TableHead>
              <TableHead className="text-center">میانگین امتیاز</TableHead>
              <TableHead className="text-center">وضعیت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.map((evaluation) => (
              <TableRow key={evaluation.id}>
                <TableCell>
                  <span className="flex items-center gap-2.5">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-2xs">
                        {initials(
                          evaluation.strategist.firstName,
                          evaluation.strategist.lastName
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">
                      {evaluation.strategist.firstName} {evaluation.strategist.lastName}
                    </span>
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-foreground-secondary">
                  {PERSIAN_MONTHS[evaluation.month - 1] ?? evaluation.month}{" "}
                  {evaluation.year.toLocaleString("fa-IR", { useGrouping: false })}
                </TableCell>
                <TableCell className="text-foreground-muted">
                  {evaluation.evaluator.firstName} {evaluation.evaluator.lastName}
                </TableCell>
                <TableCell className="text-center">
                  <ScoreBadge score={averageOf(evaluation)} />
                </TableCell>
                <TableCell className="text-center">
                  <StatusBadge status={evaluation.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <ul className="space-y-3 p-4 md:hidden">
        {evaluations.map((evaluation) => (
          <li
            key={evaluation.id}
            className="rounded-xl border border-border bg-surface-sunken p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {evaluation.strategist.firstName} {evaluation.strategist.lastName}
                </p>
                <p className="mt-0.5 text-xs text-foreground-muted">
                  ارزیاب: {evaluation.evaluator.firstName}{" "}
                  {evaluation.evaluator.lastName}
                </p>
              </div>
              <ScoreBadge score={averageOf(evaluation)} className="shrink-0" />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={evaluation.status} />
              <span className="text-xs text-foreground-muted">
                {PERSIAN_MONTHS[evaluation.month - 1] ?? evaluation.month}{" "}
                {evaluation.year.toLocaleString("fa-IR", { useGrouping: false })}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

function StatusBadge({ status }: { status: string }) {
  return status === "COMPLETED" ? (
    <Badge variant="success">
      <CheckCircle2 aria-hidden />
      تکمیل شده
    </Badge>
  ) : (
    <Badge variant="warning">
      <Clock aria-hidden />
      در انتظار
    </Badge>
  )
}
