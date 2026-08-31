"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Send,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckboxField } from "@/components/ui/checkbox-field"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RoleBadge } from "@/components/ui/role-badge"
import { ScoreScale } from "@/components/ui/score"
import { Textarea } from "@/components/ui/textarea"
import { faNumber, faPercent } from "@/lib/design-tokens"
import {
  SCORE_MAX,
  SCORE_MIN,
  SKIP_HINT,
  SKIP_LABEL,
  getClientRoleKpi,
} from "@/lib/client-kpis"
import type { TeamRole } from "@/lib/roles"

export interface ClientFormTarget {
  key: string
  userId: string
  firstName: string
  lastName: string
  role: TeamRole
}

interface EntryState {
  skipped: boolean
  scores: Record<string, number>
  answers: Record<string, string>
}

const emptyEntry = (): EntryState => ({ skipped: false, scores: {}, answers: {} })

/**
 * The client's monthly form: one section per person, all submitted together.
 *
 * A single submit is deliberate — the client answers once a month, and a
 * per-person save would turn one sitting into a dozen round trips. Sections
 * already filed for this period never reach this component.
 */
export function ClientEvaluationForm({
  targets,
  periodLabel,
  month,
  year,
}: {
  targets: ClientFormTarget[]
  periodLabel: string
  month: number
  year: number
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [entries, setEntries] = useState<Record<string, EntryState>>(() =>
    Object.fromEntries(targets.map((t) => [t.key, emptyEntry()]))
  )

  function entryOf(key: string) {
    return entries[key] ?? emptyEntry()
  }

  function updateEntry(key: string, patch: Partial<EntryState>) {
    setEntries((prev) => ({ ...prev, [key]: { ...entryOf(key), ...patch } }))
  }

  function setScore(key: string, metricKey: string, value: number) {
    const entry = entryOf(key)
    updateEntry(key, { scores: { ...entry.scores, [metricKey]: value } })
  }

  function setAnswer(key: string, questionKey: string, value: string) {
    const entry = entryOf(key)
    updateEntry(key, { answers: { ...entry.answers, [questionKey]: value } })
  }

  function toggleSkip(key: string, skipped: boolean) {
    // Clearing the scores keeps the payload honest: a skipped person carries
    // no half-filled ratings into the database.
    updateEntry(key, skipped ? { skipped, scores: {} } : { skipped })
  }

  /** A section counts as done when it is skipped or fully scored. */
  const completion = useMemo(() => {
    let done = 0
    for (const target of targets) {
      const entry = entryOf(target.key)
      if (entry.skipped) {
        done += 1
        continue
      }
      const kpi = getClientRoleKpi(target.role)
      if (kpi && kpi.metrics.every((m) => entry.scores[m.key])) done += 1
    }
    return { done, total: targets.length }
  }, [entries, targets]) // eslint-disable-line react-hooks/exhaustive-deps

  const completionPct = completion.total
    ? (completion.done / completion.total) * 100
    : 0

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    for (const target of targets) {
      const entry = entryOf(target.key)
      if (entry.skipped) continue

      const kpi = getClientRoleKpi(target.role)
      const missing = kpi?.metrics.find((m) => !entry.scores[m.key])
      if (missing) {
        toast.error(
          `امتیاز «${missing.title}» برای ${target.firstName} ${target.lastName} وارد نشده است`
        )
        document
          .getElementById(`section-${target.key}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
        return
      }
    }

    setLoading(true)

    try {
      const res = await fetch("/api/client/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          year,
          entries: targets.map((target) => {
            const entry = entryOf(target.key)
            return {
              targetId: target.userId,
              targetRole: target.role,
              skipped: entry.skipped,
              scores: entry.skipped ? {} : entry.scores,
              answers: entry.answers,
            }
          }),
        }),
      })

      if (res.ok) {
        toast.success("ارزیابی شما ثبت شد", {
          description: "ممنون از وقتی که گذاشتید.",
        })
        router.push("/client")
        router.refresh()
      } else {
        const result = await res.json()
        toast.error(result.error || "خطا در ثبت ارزیابی")
      }
    } catch {
      toast.error("خطای سرور")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Where the client is, and how much is left. */}
      <div className="sticky top-16 z-raised -mx-4 border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-medium text-foreground">
                ارزیابی {periodLabel}
              </span>
              <span data-numeric className="shrink-0 text-foreground-muted">
                {faNumber(completion.done)} از {faNumber(completion.total)} (
                {faPercent(completionPct)})
              </span>
            </div>
            <Progress
              value={completionPct}
              className="mt-2"
              aria-label="پیشرفت تکمیل فرم"
              indicatorClassName={completionPct === 100 ? "bg-success" : "bg-primary"}
            />
          </div>
        </div>
      </div>

      {targets.map((target, index) => {
        const kpi = getClientRoleKpi(target.role)
        if (!kpi) return null

        const entry = entryOf(target.key)
        const fullName = `${target.firstName} ${target.lastName}`

        return (
          <Card key={target.key} id={`section-${target.key}`} className="scroll-mt-32">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2.5">
                <span
                  data-numeric
                  aria-hidden
                  className="grid size-6 shrink-0 place-items-center rounded-md bg-surface-sunken text-xs font-bold text-foreground-muted"
                >
                  {faNumber(index + 1)}
                </span>
                {fullName}
                <RoleBadge role={target.role} size="sm" />
              </CardTitle>
              <CardDescription>
                امتیاز {faNumber(SCORE_MIN)} تا {faNumber(SCORE_MAX)} — اگر در این
                ماه تعامل کافی نداشته‌اید، گزینه زیر را انتخاب کنید.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="rounded-xl border border-border bg-surface-sunken p-1.5">
                <CheckboxField
                  id={`skip-${target.key}`}
                  label={SKIP_LABEL}
                  hint={SKIP_HINT}
                  checked={entry.skipped}
                  onChange={(e) => toggleSkip(target.key, e.target.checked)}
                />
              </div>

              {entry.skipped ? (
                <p className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm text-foreground-secondary">
                  <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                  برای {fullName} امتیازی ثبت نمی‌شود.
                </p>
              ) : (
                <>
                  {/* The four rated questions. */}
                  <div className="space-y-4">
                    {kpi.metrics.map((metric, metricIndex) => (
                      <fieldset
                        key={metric.key}
                        className="rounded-xl border border-border bg-surface-sunken p-4 sm:p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
                          <legend className="contents">
                            <div className="min-w-0 lg:w-[40%]">
                              <p className="flex items-start gap-2 font-semibold text-foreground">
                                <span
                                  data-numeric
                                  aria-hidden
                                  className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-surface text-2xs font-bold text-foreground-muted"
                                >
                                  {faNumber(metricIndex + 1)}
                                </span>
                                {metric.title}
                              </p>
                              <p className="mt-1.5 text-sm leading-relaxed text-foreground-muted">
                                {metric.question}
                              </p>
                            </div>
                          </legend>

                          <div className="min-w-0 flex-1">
                            <ScoreScale
                              name={`${target.key}-${metric.key}`}
                              label={`${metric.title} — ${fullName}`}
                              value={entry.scores[metric.key]}
                              onChange={(value) =>
                                setScore(target.key, metric.key, value)
                              }
                            />
                          </div>
                        </div>
                      </fieldset>
                    ))}
                  </div>

                  {/* Open questions. */}
                  <div className="space-y-4 border-t border-border pt-5">
                    <p className="text-sm font-semibold text-foreground">
                      نظر تشریحی{" "}
                      <span className="font-normal text-foreground-subtle">
                        (اختیاری)
                      </span>
                    </p>
                    {kpi.questions.map((question) => (
                      <div key={question.key} className="space-y-2">
                        <Label htmlFor={`${target.key}-${question.key}`}>
                          {question.question}
                        </Label>
                        <Textarea
                          id={`${target.key}-${question.key}`}
                          rows={3}
                          value={entry.answers[question.key] ?? ""}
                          onChange={(e) =>
                            setAnswer(target.key, question.key, e.target.value)
                          }
                          placeholder="اگر نکته‌ای هست بنویسید…"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )
      })}

      <Card>
        <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground-muted">
            پس از ثبت، امکان ویرایش وجود ندارد. برای اصلاح با تیم راوا تماس
            بگیرید.
          </p>
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/client">
                <ArrowRight aria-hidden />
                بازگشت
              </Link>
            </Button>
            <Button type="submit" loading={loading}>
              <Send aria-hidden />
              ثبت نهایی ارزیابی
            </Button>
          </div>
        </CardContent>
      </Card>

      {targets.length === 0 && (
        <Card>
          <CardContent className="flex items-center gap-2 py-8 text-sm text-foreground-muted">
            <ClipboardCheck className="size-4 shrink-0" aria-hidden />
            چیزی برای ارزیابی باقی نمانده است.
          </CardContent>
        </Card>
      )}
    </form>
  )
}
