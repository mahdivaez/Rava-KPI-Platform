"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label, RequiredMark } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/ui/page-header"
import { Progress } from "@/components/ui/progress"
import { RoleBadge } from "@/components/ui/role-badge"
import { ScoreScale } from "@/components/ui/score"
import { getScoreBand } from "@/lib/design-tokens"
import { toast } from "sonner"
import {
  CalendarDays,
  Calculator,
  Check,
  ClipboardCheck,
  Image as ImageIcon,
  Info,
  ListChecks,
  Save,
  Search,
  Upload,
  X,
} from "lucide-react"
import { usePersianDate } from "@/hooks/use-persian-date"
import { ImageModal } from "@/components/ui/image-modal"
import {
  SCORE_MAX,
  SCORE_MIN,
  getRoleDefinition,
  getRoleLabel,
  type TeamRole,
} from "@/lib/roles"

export interface EvaluableMember {
  id: string
  firstName: string
  lastName: string
  role: TeamRole
  /** True when this entry is the current user evaluating themselves. */
  isSelf: boolean
}

export interface EvaluableWorkgroup {
  id: string
  name: string
  /** Roles the current user holds in this workgroup. */
  myRoles: TeamRole[]
  /** Roles the current user may evaluate in this workgroup. */
  evaluableRoles: TeamRole[]
  /** Members the current user may evaluate (self already excluded). */
  members: EvaluableMember[]
}

const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
]

export function RoleEvaluationForm({
  workgroups,
}: {
  workgroups: EvaluableWorkgroup[]
}) {
  const {
    currentDate,
    currentYear: currentPersianYear,
    effectiveCurrentMonth,
  } = usePersianDate()
  const router = useRouter()

  // usePersianDate resolves in an effect; until then the year is Gregorian.
  const dateReady = currentDate !== ""

  const [loading, setLoading] = useState(false)
  const [workgroupId, setWorkgroupId] = useState("")
  const [targetRole, setTargetRole] = useState<TeamRole | "">("")
  const [targetId, setTargetId] = useState("")
  const [memberSearch, setMemberSearch] = useState("")
  const [scores, setScores] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const [imageUrl, setImageUrl] = useState("")
  const [localImagePreview, setLocalImagePreview] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [modalImageSrc, setModalImageSrc] = useState("")

  const workgroup = workgroups.find((w) => w.id === workgroupId)
  const availableRoles = workgroup?.evaluableRoles ?? []
  const definition = targetRole ? getRoleDefinition(targetRole) : null
  const metrics = definition?.metrics ?? []

  const members = useMemo(() => {
    if (!workgroup || !targetRole) return []
    return workgroup.members.filter((m) => m.role === targetRole)
  }, [workgroup, targetRole])

  const filteredMembers = members
    .filter(
      (m) =>
        m.id === targetId ||
        `${m.firstName} ${m.lastName}`
          .toLowerCase()
          .includes(memberSearch.toLowerCase())
    )
    // Self-evaluation first, so it is easy to find.
    .sort((a, b) => Number(b.isSelf) - Number(a.isSelf))

  const selectedMember = members.find((m) => m.id === targetId)
  const isSelfEvaluation = !!selectedMember?.isSelf

  const totalScore = metrics.reduce((sum, m) => sum + (scores[m.key] || 0), 0)
  const maxTotalScore = metrics.length * SCORE_MAX
  const averageScore = metrics.length ? (totalScore / metrics.length).toFixed(2) : "0.00"
  const scorePercentage = maxTotalScore ? (totalScore / maxTotalScore) * 100 : 0

  function handleWorkgroupChange(value: string) {
    setWorkgroupId(value)
    setTargetRole("")
    setTargetId("")
    setScores({})
    setNotes({})
  }

  function handleRoleChange(value: string) {
    setTargetRole(value as TeamRole)
    setTargetId("")
    setMemberSearch("")
    // Metric keys differ per role, so previous scores no longer apply.
    setScores({})
    setNotes({})
  }

  function handleScoreChange(key: string, value: string | number) {
    if (value === "") {
      setScores((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      return
    }

    const numValue = typeof value === "string" ? parseInt(value, 10) : value
    if (Number.isNaN(numValue)) return
    if (numValue < SCORE_MIN || numValue > SCORE_MAX) return
    setScores((prev) => ({ ...prev, [key]: numValue }))
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("لطفاً فایل تصویری انتخاب کنید")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم تصویر نباید بیشتر از ۵ مگابایت باشد")
      return
    }

    setLocalImagePreview(URL.createObjectURL(file))
    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", "evaluation-images")

      const response = await fetch("/api/profile/upload-image", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setImageUrl(result.imageUrl)
        toast.success("تصویر با موفقیت آپلود شد")
      } else {
        const error = await response.json()
        toast.error(error.error || "خطا در آپلود تصویر")
        setLocalImagePreview("")
      }
    } catch {
      toast.error("خطا در آپلود تصویر")
      setLocalImagePreview("")
    } finally {
      setUploadingImage(false)
    }
  }

  function removeImage() {
    setImageUrl("")
    if (localImagePreview) {
      URL.revokeObjectURL(localImagePreview)
      setLocalImagePreview("")
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!workgroupId || !targetRole || !targetId) {
      toast.error("لطفاً کارگروه، نقش و فرد مورد ارزیابی را انتخاب کنید")
      return
    }

    if (!dateReady) {
      toast.error("تاریخ هنوز بارگذاری نشده است، لحظه‌ای صبر کنید")
      return
    }

    const missing = metrics.find((m) => !scores[m.key])
    if (missing) {
      toast.error(`لطفاً امتیاز «${missing.title}» را وارد کنید`)
      return
    }

    setLoading(true)

    const cleanNotes = Object.fromEntries(
      Object.entries(notes).filter(([, value]) => value.trim().length > 0)
    )

    try {
      const res = await fetch("/api/evaluations/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workgroupId,
          targetId,
          targetRole,
          month: effectiveCurrentMonth,
          year: currentPersianYear,
          scores,
          metricNotes: Object.keys(cleanNotes).length ? cleanNotes : undefined,
          strengths: answers.strengths || undefined,
          improvements: answers.improvements || undefined,
          example: answers.example || undefined,
          suggestions: answers.suggestions || undefined,
          imageUrl: imageUrl || undefined,
        }),
      })

      if (res.ok) {
        toast.success("ارزیابی با موفقیت ثبت شد")
        router.push("/evaluations/team")
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

  if (workgroups.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<ClipboardCheck />}
              title="ارزیابی در دسترس نیست"
              description="شما در هیچ کارگروهی نقشی ندارید که اجازه ارزیابی بدهد. برای تخصیص نقش با مدیر سیستم هماهنگ کنید."
              action={
                <Button variant="outline" asChild>
                  <Link href="/dashboard">بازگشت به داشبورد</Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  const openQuestions = definition
    ? ([
        {
          key: "strengths",
          label: "نقطه قوت",
          dot: "bg-success",
          question: definition.questions.strengths,
        },
        {
          key: "improvements",
          label: "نقطه قابل بهبود",
          dot: "bg-warning",
          question: definition.questions.improvements,
        },
        {
          key: "example",
          label: "یک مثال واقعی",
          dot: "bg-info",
          question: definition.questions.example,
        },
        {
          key: "suggestions",
          label: "پیشنهاد",
          dot: "bg-primary",
          question: definition.questions.suggestions,
        },
      ] as const)
    : []

  const completedMetrics = metrics.filter((m) => scores[m.key]).length
  const averageBand = getScoreBand(parseFloat(averageScore))
  const previewImage =
    localImagePreview || (imageUrl.startsWith("/uploads") ? imageUrl : imageUrl ? `/${imageUrl}` : "")

  const title = !definition
    ? "ارزیابی عملکرد تیم"
    : isSelfEvaluation
      ? `خودارزیابی — ${definition.label}`
      : `ارزیابی ${definition.label}`

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={`فرم ارزیابی ماهانه بر اساس نقش — امتیاز ${SCORE_MIN.toLocaleString("fa-IR")} تا ${SCORE_MAX.toLocaleString("fa-IR")}`}
        icon={<ClipboardCheck />}
        breadcrumbs={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "ارزیابی تیم", href: "/evaluations/team" },
          { label: "ارزیابی جدید" },
        ]}
        actions={
          <>
            <Button type="button" variant="outline" asChild>
              <Link href="/evaluations/team">
                <X aria-hidden />
                انصراف
              </Link>
            </Button>
            <Button
              type="submit"
              form="role-evaluation-form"
              loading={loading}
              disabled={!definition || !dateReady}
            >
              <Save aria-hidden />
              ثبت ارزیابی
            </Button>
          </>
        }
      />

      <form id="role-evaluation-form" onSubmit={handleSubmit} className="space-y-5">
        {/* ---------------------------------------------------------------
            Step 1 — who and when
            --------------------------------------------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle>مشخصات ارزیابی</CardTitle>
            <CardDescription>
              کارگروه، نقش و فردی که می‌خواهید ارزیابی کنید را انتخاب کنید
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="rf-workgroup">
                  کارگروه <RequiredMark />
                </Label>
                <Select value={workgroupId} onValueChange={handleWorkgroupChange} required>
                  <SelectTrigger id="rf-workgroup">
                    <SelectValue placeholder="انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {workgroups.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rf-role">
                  نقش مورد ارزیابی <RequiredMark />
                </Label>
                <Select
                  value={targetRole}
                  onValueChange={handleRoleChange}
                  disabled={!workgroupId}
                  required
                >
                  <SelectTrigger id="rf-role">
                    <SelectValue
                      placeholder={workgroupId ? "انتخاب کنید" : "ابتدا کارگروه"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {getRoleLabel(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rf-person">
                  فرد مورد ارزیابی <RequiredMark />
                </Label>
                <Select
                  value={targetId}
                  onValueChange={setTargetId}
                  disabled={!targetRole || members.length === 0}
                  required
                >
                  <SelectTrigger id="rf-person">
                    <SelectValue
                      placeholder={
                        !targetRole
                          ? "ابتدا نقش را انتخاب کنید"
                          : members.length === 0
                            ? "عضوی با این نقش وجود ندارد"
                            : "انتخاب کنید"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.firstName} {m.lastName}
                        {m.isSelf ? " (خودم)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {targetRole && members.length > 5 && (
                  <div className="relative">
                    <Search
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-foreground-subtle"
                    />
                    <Input
                      aria-label="جستجوی نام عضو"
                      placeholder="جستجوی نام…"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="h-9 ps-9 text-sm sm:h-9"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>دوره ارزیابی</Label>
                {/* Read-only: the period is always the current Persian month. */}
                <div className="flex h-11 items-center gap-2 rounded-lg border border-border bg-surface-sunken px-3.5 text-sm font-medium text-foreground-secondary sm:h-10">
                  <CalendarDays className="size-4 shrink-0 text-foreground-subtle" aria-hidden />
                  {dateReady ? (
                    <span>
                      {PERSIAN_MONTHS[effectiveCurrentMonth - 1]}{" "}
                      {currentPersianYear.toLocaleString("fa-IR", { useGrouping: false })}
                    </span>
                  ) : (
                    <span className="text-foreground-subtle">در حال بارگذاری…</span>
                  )}
                </div>
              </div>
            </div>

            {selectedMember && definition && (
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface-sunken px-4 py-3">
                <span className="text-sm text-foreground-muted">در حال ارزیابی:</span>
                <span className="text-sm font-semibold text-foreground">
                  {isSelfEvaluation
                    ? "خودتان"
                    : `${selectedMember.firstName} ${selectedMember.lastName}`}
                </span>
                <RoleBadge role={definition.role} size="sm" />
                {isSelfEvaluation && <Badge variant="info" size="sm">خودارزیابی</Badge>}
              </div>
            )}
          </CardContent>
        </Card>

        {!definition && (
          <Card elevation="flat" className="border-dashed">
            <CardContent className="p-0">
              <EmptyState
                icon={<ListChecks />}
                title="شاخص‌های ارزیابی هنوز مشخص نشده‌اند"
                description="برای دیدن شاخص‌ها، ابتدا کارگروه و نقش مورد ارزیابی را انتخاب کنید."
                size="sm"
              />
            </CardContent>
          </Card>
        )}

        {definition && (
          <>
            {/* ---------------------------------------------------------
                Step 2 — the metrics
                --------------------------------------------------------- */}
            <Card>
              <CardHeader>
                <CardTitle>شاخص‌های ارزیابی</CardTitle>
                <CardDescription>
                  همه شاخص‌ها الزامی هستند — امتیاز{" "}
                  {SCORE_MIN.toLocaleString("fa-IR")} تا{" "}
                  {SCORE_MAX.toLocaleString("fa-IR")}
                </CardDescription>
                <CardAction>
                  <span
                    data-numeric
                    className="rounded-full bg-surface-sunken px-3 py-1 text-xs font-semibold text-foreground-secondary"
                  >
                    {completedMetrics.toLocaleString("fa-IR")} از{" "}
                    {metrics.length.toLocaleString("fa-IR")} تکمیل‌شده
                  </span>
                </CardAction>
              </CardHeader>

              <CardContent className="space-y-4">
                {metrics.map((metric, index) => (
                  <fieldset
                    key={metric.key}
                    className="rounded-xl border border-border bg-surface-sunken p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
                      {/* Question */}
                      <legend className="contents">
                        <div className="min-w-0 lg:w-[38%]">
                          <p className="flex items-start gap-2 font-semibold text-foreground">
                            <span
                              data-numeric
                              aria-hidden
                              className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-surface text-2xs font-bold text-foreground-muted"
                            >
                              {(index + 1).toLocaleString("fa-IR")}
                            </span>
                            {metric.title}
                          </p>
                          <p className="mt-1.5 text-sm leading-relaxed text-foreground-muted">
                            {metric.description}
                          </p>
                          {metric.hint && (
                            <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-foreground-subtle">
                              <Info className="mt-0.5 size-3 shrink-0" aria-hidden />
                              {metric.hint}
                            </p>
                          )}
                        </div>
                      </legend>

                      {/* Answer */}
                      <div className="min-w-0 flex-1 space-y-3">
                        <ScoreScale
                          name={`score-${metric.key}`}
                          label={metric.title}
                          value={scores[metric.key]}
                          onChange={(value) => handleScoreChange(metric.key, value)}
                        />
                        <Input
                          type="text"
                          aria-label={`یادداشت ارزیاب برای ${metric.title}`}
                          value={notes[metric.key] ?? ""}
                          onChange={(e) =>
                            setNotes((prev) => ({ ...prev, [metric.key]: e.target.value }))
                          }
                          placeholder="یادداشت (اختیاری)"
                        />
                      </div>
                    </div>
                  </fieldset>
                ))}
              </CardContent>
            </Card>

            {/* ---------------------------------------------------------
                Running total
                --------------------------------------------------------- */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-foreground-muted">امتیاز کل</p>
                    <span
                      aria-hidden
                      className="grid size-9 place-items-center rounded-lg bg-muted text-foreground-secondary"
                    >
                      <Calculator className="size-[18px]" />
                    </span>
                  </div>
                  <p className="mt-3 flex items-baseline gap-2">
                    <span
                      data-numeric
                      className="font-display text-4xl font-bold leading-none text-foreground"
                    >
                      {totalScore.toLocaleString("fa-IR")}
                    </span>
                    <span className="text-sm text-foreground-subtle">
                      از {maxTotalScore.toLocaleString("fa-IR")}
                    </span>
                  </p>
                  <Progress
                    value={scorePercentage}
                    className="mt-3"
                    aria-label="درصد امتیاز کل"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-foreground-muted">میانگین نهایی</p>
                    <span
                      aria-hidden
                      className="grid size-9 place-items-center rounded-lg bg-muted text-foreground-secondary"
                    >
                      <ClipboardCheck className="size-[18px]" />
                    </span>
                  </div>
                  <p className="mt-3 flex items-baseline gap-2">
                    <span
                      data-numeric
                      className={`font-display text-4xl font-bold leading-none ${averageBand.text}`}
                    >
                      {parseFloat(averageScore).toLocaleString("fa-IR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-sm text-foreground-subtle">
                      از {SCORE_MAX.toLocaleString("fa-IR")}
                    </span>
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <Progress
                      value={scorePercentage}
                      className="flex-1"
                      aria-label="درصد میانگین"
                      indicatorClassName={averageBand.fill}
                    />
                    <span className={`shrink-0 text-xs font-semibold ${averageBand.text}`}>
                      {totalScore > 0 ? averageBand.label : "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ---------------------------------------------------------
                Step 3 — open questions
                --------------------------------------------------------- */}
            <Card>
              <CardHeader>
                <CardTitle>سؤالات تشریحی</CardTitle>
                <CardDescription>
                  اختیاری، ولی بیشترین کمک را به فرد مقابل می‌کند
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {openQuestions.map((item) => (
                  <div key={item.key} className="space-y-2">
                    <Label htmlFor={item.key}>
                      <span
                        aria-hidden
                        className={`size-2 shrink-0 rounded-full ${item.dot}`}
                      />
                      {item.label}
                    </Label>
                    <p className="text-sm leading-relaxed text-foreground-muted">
                      {item.question}
                    </p>
                    <Textarea
                      id={item.key}
                      rows={3}
                      value={answers[item.key] ?? ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [item.key]: e.target.value }))
                      }
                      placeholder="پاسخ شما…"
                    />
                  </div>
                ))}

                {/* Optional attachment */}
                <div className="space-y-2">
                  <Label htmlFor="image-upload-role">
                    <ImageIcon className="size-4 text-foreground-subtle" aria-hidden />
                    تصویر ارزیابی (اختیاری)
                  </Label>

                  <div className="rounded-xl border border-dashed border-border-strong bg-surface-sunken p-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                      id="image-upload-role"
                      disabled={uploadingImage}
                    />

                    <div className="flex flex-wrap items-center gap-3">
                      <label
                        htmlFor="image-upload-role"
                        className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground-secondary shadow-xs transition-colors duration-fast hover:bg-surface-hover ${
                          uploadingImage ? "pointer-events-none opacity-50" : ""
                        }`}
                      >
                        <Upload className="size-4" aria-hidden />
                        {uploadingImage ? "در حال آپلود…" : "انتخاب تصویر"}
                      </label>

                      {previewImage && (
                        <span className="flex items-center gap-2 text-sm">
                          <span className="flex items-center gap-1.5 font-medium text-success">
                            <Check className="size-4" aria-hidden />
                            {imageUrl ? "تصویر آپلود شد" : "تصویر انتخاب شد"}
                          </span>
                          <button
                            type="button"
                            onClick={removeImage}
                            className="rounded font-medium text-danger transition-colors hover:underline"
                          >
                            حذف
                          </button>
                        </span>
                      )}
                    </div>

                    {previewImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setModalImageSrc(previewImage)
                          setImageModalOpen(true)
                        }}
                        className="mt-3 block overflow-hidden rounded-lg border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        <img
                          src={previewImage}
                          alt="پیش‌نمایش تصویر ارزیابی"
                          className="h-32 w-auto object-cover transition-opacity duration-base hover:opacity-85"
                        />
                      </button>
                    )}

                    <p className="mt-3 text-xs text-foreground-subtle">
                      فرمت‌های مجاز: JPG، PNG، GIF · حداکثر حجم: ۵ مگابایت
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ---------------------------------------------------------
                Submit
                --------------------------------------------------------- */}
            <Card>
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-foreground-muted">
                  امتیاز همه شاخص‌ها الزامی است؛ سؤالات تشریحی اختیاری هستند.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/evaluations/team">
                      <X aria-hidden />
                      انصراف
                    </Link>
                  </Button>
                  <Button type="submit" loading={loading} disabled={!dateReady}>
                    <Save aria-hidden />
                    ثبت ارزیابی
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </form>

      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageSrc={modalImageSrc}
        imageAlt="تصویر ارزیابی"
      />
    </div>
  )
}
