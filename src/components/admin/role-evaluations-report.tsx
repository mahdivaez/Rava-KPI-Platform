"use client"

import { useMemo, useState } from "react"
import { ClipboardList, ImageIcon, Search, UserCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { RoleBadge } from "@/components/ui/role-badge"
import { ScoreBadge, ScoreMeter } from "@/components/ui/score"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageWithModal } from "@/components/ui/image-with-modal"
import { faNumber } from "@/lib/design-tokens"
import { getRoleLabel, type TeamRole } from "@/lib/roles"
import { PERSIAN_MONTHS, type EvalRecord } from "@/lib/admin-analytics"

/**
 * Every role evaluation, with the filters an admin actually needs.
 *
 * Role, workgroup and period are driven by the data rather than a fixed list,
 * so a newly added role appears here the first time someone is evaluated in it.
 */
export function RoleEvaluationsReport({
  evaluations,
}: {
  evaluations: EvalRecord[]
}) {
  const [role, setRole] = useState<string>("all")
  const [workgroup, setWorkgroup] = useState("all")
  const [period, setPeriod] = useState("all")
  const [search, setSearch] = useState("")

  const roles = useMemo(
    () => Array.from(new Set(evaluations.map((e) => e.targetRole))),
    [evaluations]
  )

  const workgroups = useMemo(
    () => Array.from(new Set(evaluations.map((e) => e.workgroupName))),
    [evaluations]
  )

  const periods = useMemo(() => {
    const seen = new Map<string, string>()
    for (const e of evaluations) {
      const key = `${e.year}-${e.month}`
      if (!seen.has(key)) {
        seen.set(key, `${PERSIAN_MONTHS[e.month - 1]} ${faNumber(e.year)}`)
      }
    }
    return Array.from(seen, ([value, label]) => ({ value, label }))
  }, [evaluations])

  const filtered = evaluations.filter((e) => {
    if (role !== "all" && e.targetRole !== role) return false
    if (workgroup !== "all" && e.workgroupName !== workgroup) return false
    if (period !== "all" && `${e.year}-${e.month}` !== period) return false
    if (search.trim()) {
      const needle = search.trim().toLowerCase()
      const haystack = `${e.targetName} ${e.evaluatorName}`.toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    return true
  })

  if (evaluations.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList />}
        title="هنوز ارزیابی نقشی ثبت نشده است"
        description="به‌محض اینکه اعضای تیم فرم ارزیابی ماهانه را پر کنند، همه ارزیابی‌ها با جزئیات کامل اینجا نمایش داده می‌شوند."
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FilterField label="نقش" id="re-role">
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="re-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه نقش‌ها</SelectItem>
              {roles.map((r) => (
                <SelectItem key={r} value={r}>
                  {getRoleLabel(r)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="کارگروه" id="re-workgroup">
          <Select value={workgroup} onValueChange={setWorkgroup}>
            <SelectTrigger id="re-workgroup">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه کارگروه‌ها</SelectItem>
              {workgroups.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="دوره" id="re-period">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger id="re-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه دوره‌ها</SelectItem>
              {periods.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="جستجوی نام" id="re-search">
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-foreground-subtle"
            />
            <Input
              id="re-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ارزیابی‌شونده یا ارزیاب…"
              className="ps-9"
            />
          </div>
        </FilterField>
      </div>

      <p className="text-sm text-foreground-muted">
        {faNumber(filtered.length)} ارزیابی از {faNumber(evaluations.length)}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search />}
          title="نتیجه‌ای پیدا نشد"
          description="فیلترها را تغییر دهید تا ارزیابی‌های بیشتری ببینید."
          size="sm"
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((evaluation) => (
            <EvaluationCard key={evaluation.id} evaluation={evaluation} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterField({
  label,
  id,
  children,
}: {
  label: string
  id: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-foreground-muted">
        {label}
      </label>
      {children}
    </div>
  )
}

function EvaluationCard({ evaluation }: { evaluation: EvalRecord }) {
  const answers = (
    [
      { label: "نقطه قوت", value: evaluation.strengths },
      { label: "نقطه قابل بهبود", value: evaluation.improvements },
      { label: "یک مثال واقعی", value: evaluation.example },
      { label: "پیشنهاد", value: evaluation.suggestions },
    ] as const
  ).filter((item) => item.value && item.value.trim())

  const previewImage = evaluation.imageUrl
    ? evaluation.imageUrl.startsWith("/") || evaluation.imageUrl.startsWith("http")
      ? evaluation.imageUrl
      : `/${evaluation.imageUrl}`
    : null

  return (
    <Card elevation="flat">
      <CardContent className="space-y-4 pt-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
              {evaluation.targetName}
              <RoleBadge role={evaluation.targetRole} size="sm" />
              {evaluation.isSelf && (
                <Badge variant="info" size="sm">
                  <UserCheck aria-hidden />
                  خودارزیابی
                </Badge>
              )}
            </p>
            <p className="mt-1 text-xs text-foreground-muted">
              {evaluation.isSelf
                ? "ثبت‌شده توسط خودش"
                : `ارزیاب: ${evaluation.evaluatorName}`}
              {evaluation.evaluatorRole && !evaluation.isSelf
                ? ` (${getRoleLabel(evaluation.evaluatorRole)})`
                : ""}{" "}
              — {evaluation.workgroupName} ·{" "}
              {PERSIAN_MONTHS[evaluation.month - 1]} {faNumber(evaluation.year)}
            </p>
          </div>

          <ScoreBadge score={evaluation.average} showLabel />
        </div>

        {evaluation.metrics.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {evaluation.metrics.map((metric) => (
              <div key={metric.key}>
                <ScoreMeter label={metric.title} score={metric.score} size="sm" />
                {evaluation.metricNotes[metric.key] && (
                  <p className="mt-1 text-xs leading-relaxed text-foreground-subtle">
                    {evaluation.metricNotes[metric.key]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {answers.length > 0 && (
          <div className="space-y-3 border-t border-border pt-4">
            {answers.map((item) => (
              <div key={item.label}>
                <p className="text-xs font-medium text-foreground-muted">
                  {item.label}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground-secondary">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {previewImage && (
          <div className="border-t border-border pt-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-foreground-muted">
              <ImageIcon className="size-3.5" aria-hidden />
              تصویر پیوست
            </p>
            <ImageWithModal
              src={previewImage}
              alt={`تصویر پیوست ارزیابی ${evaluation.targetName}`}
              className="max-h-48 w-auto rounded-lg border border-border"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
