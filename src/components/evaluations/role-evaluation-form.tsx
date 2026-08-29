"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Calculator, ClipboardCheck, ChevronRight, Save, X, Search } from "lucide-react"
import { usePersianDate } from "@/hooks/use-persian-date"
import { ImageModal } from "@/components/ui/image-modal"
import { ScoreSelector } from "@/components/ui/score-selector"
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
      <div className="max-w-3xl mx-auto px-4">
        <Card className="border-2 border-nude-200 shadow-xl bg-white">
          <CardContent className="p-8 text-center space-y-3">
            <h1 className="text-xl font-bold text-nude-900">ارزیابی در دسترس نیست</h1>
            <p className="text-nude-600 text-sm">
              شما در هیچ کارگروهی نقشی ندارید که اجازه ارزیابی بدهد. لطفاً با مدیر سیستم
              هماهنگ کنید.
            </p>
            <Link href="/dashboard">
              <Button variant="outline" className="border-2 border-nude-300">
                بازگشت به داشبورد
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const openQuestions = definition
    ? ([
        { key: "strengths", label: "نقطه قوت", dot: "bg-green-500", question: definition.questions.strengths },
        { key: "improvements", label: "نقطه قابل بهبود", dot: "bg-orange-500", question: definition.questions.improvements },
        { key: "example", label: "یک مثال واقعی", dot: "bg-blue-500", question: definition.questions.example },
        { key: "suggestions", label: "پیشنهاد", dot: "bg-purple-500", question: definition.questions.suggestions },
      ] as const)
    : []

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6">
      {/* Breadcrumb */}
      <div className="mb-4 sm:mb-6 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-nude-600">
        <Link href="/dashboard" className="hover:text-nude-900 transition-colors truncate">
          داشبورد
        </Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
        <Link href="/evaluations/team" className="hover:text-nude-900 transition-colors truncate">
          ارزیابی تیم
        </Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
        <span className="text-nude-900 font-semibold truncate">ارزیابی جدید</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Header + metadata */}
        <Card className="border-2 border-nude-200 shadow-xl bg-white">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col space-y-4 mb-6 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-nude-500 to-nude-600 flex items-center justify-center shadow-lg shadow-nude-500/30">
                  <ClipboardCheck className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-nude-900 leading-tight">
                    {!definition
                      ? "ارزیابی عملکرد تیم"
                      : isSelfEvaluation
                      ? `خودارزیابی — ${definition.label}`
                      : `ارزیابی ${definition.label}`}
                  </h1>
                  <p className="text-nude-600 text-xs sm:text-sm lg:text-base mt-1">
                    فرم ارزیابی ماهانه بر اساس نقش — امتیاز {SCORE_MIN} تا {SCORE_MAX}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Link href="/evaluations/team" className="order-2 sm:order-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-2 border-nude-300 hover:bg-nude-100 text-nude-700 font-semibold px-4 sm:px-6 w-full sm:w-auto text-sm"
                  >
                    <X className="w-4 h-4 ml-2" />
                    انصراف
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading || !definition || !dateReady}
                  className="bg-gradient-to-l from-nude-500 to-nude-600 hover:from-nude-600 hover:to-nude-700 text-white font-semibold px-6 sm:px-8 w-full sm:w-auto shadow-lg shadow-nude-500/30 text-sm"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {loading ? "در حال ثبت..." : "ثبت ارزیابی"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 p-4 sm:p-6 bg-gradient-to-br from-nude-50 to-nude-100/50 rounded-xl border border-nude-200">
              {/* Workgroup */}
              <div className="space-y-2">
                <Label className="text-nude-900 font-bold text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nude-500" />
                  کارگروه:
                </Label>
                <Select value={workgroupId} onValueChange={handleWorkgroupChange} required>
                  <SelectTrigger className="h-10 sm:h-12 border-2 border-nude-300 bg-white">
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

              {/* Target role */}
              <div className="space-y-2">
                <Label className="text-nude-900 font-bold text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nude-500" />
                  نقش مورد ارزیابی:
                </Label>
                <Select
                  value={targetRole}
                  onValueChange={handleRoleChange}
                  disabled={!workgroupId}
                  required
                >
                  <SelectTrigger className="h-10 sm:h-12 border-2 border-nude-300 bg-white">
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

              {/* Person */}
              <div className="space-y-2">
                <Label className="text-nude-900 font-bold text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nude-500" />
                  فرد مورد ارزیابی:
                </Label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  required
                  disabled={!targetRole}
                  className="w-full h-10 sm:h-12 border-2 border-nude-300 bg-white rounded-md px-3 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ appearance: "none" }}
                >
                  <option value="">
                    {!targetRole
                      ? "ابتدا نقش را انتخاب کنید"
                      : members.length === 0
                      ? "عضوی با این نقش وجود ندارد"
                      : "انتخاب کنید"}
                  </option>
                  {filteredMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName}
                      {m.isSelf ? " (خودم)" : ""}
                    </option>
                  ))}
                </select>
                {targetRole && members.length > 5 && (
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-nude-400" />
                    <Input
                      placeholder="جستجوی نام..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="pl-8 sm:pl-9 h-8 sm:h-9 border-nude-300 text-xs sm:text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Month */}
              <div className="space-y-2">
                <Label className="text-nude-900 font-bold text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nude-500" />
                  ماه:
                </Label>
                <div className="h-10 sm:h-12 flex items-center px-3 sm:px-4 bg-nude-100 border-2 border-nude-200 rounded-lg text-xs sm:text-sm text-nude-700 font-bold">
                  {dateReady ? PERSIAN_MONTHS[effectiveCurrentMonth - 1] : "..."}
                </div>
              </div>

              {/* Year */}
              <div className="space-y-2">
                <Label className="text-nude-900 font-bold text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nude-500" />
                  سال:
                </Label>
                <div className="h-10 sm:h-12 flex items-center px-3 sm:px-4 bg-nude-100 border-2 border-nude-200 rounded-lg text-xs sm:text-sm text-nude-700 font-bold">
                  {dateReady ? currentPersianYear : "..."}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {!definition && (
          <Card className="border-2 border-dashed border-nude-300 bg-nude-50/50">
            <CardContent className="p-8 text-center text-nude-600 text-sm">
              برای دیدن شاخص‌های ارزیابی، ابتدا کارگروه و نقش مورد ارزیابی را انتخاب کنید.
            </CardContent>
          </Card>
        )}

        {definition && (
          <>
            {/* Metrics */}
            <Card className="border-2 border-nude-200 shadow-xl overflow-hidden bg-white">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-l from-nude-500 to-nude-600">
                      <th className="text-right p-3 lg:p-5 text-white font-bold border-l border-nude-400 text-sm lg:text-base w-[22%]">
                        شاخص ارزیابی
                      </th>
                      <th className="text-right p-3 lg:p-5 text-white font-bold border-l border-nude-400 text-sm lg:text-base w-[38%]">
                        توضیح
                      </th>
                      <th className="text-center p-3 lg:p-5 text-white font-bold border-l border-nude-400 text-sm lg:text-base w-[15%]">
                        امتیاز از {SCORE_MIN} تا {SCORE_MAX}
                      </th>
                      <th className="text-right p-3 lg:p-5 text-white font-bold text-sm lg:text-base w-[25%]">
                        یادداشت ارزیاب
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((metric, index) => (
                      <tr
                        key={metric.key}
                        className={`${
                          index % 2 === 0 ? "bg-nude-50/50" : "bg-white"
                        } hover:bg-nude-100/50 transition-all duration-200`}
                      >
                        <td className="p-3 lg:p-5 border-l border-t border-nude-200">
                          <span className="font-bold text-nude-900 text-sm lg:text-base leading-relaxed block">
                            {index + 1}. {metric.title}
                          </span>
                        </td>
                        <td className="p-3 lg:p-5 border-l border-t border-nude-200">
                          <span className="text-nude-700 text-xs lg:text-sm leading-relaxed block">
                            {metric.description}
                          </span>
                          {metric.hint && (
                            <span className="mt-1 text-[11px] lg:text-xs text-nude-500 block">
                              {metric.hint}
                            </span>
                          )}
                        </td>
                        <td className="p-3 lg:p-5 border-l border-t border-nude-200">
                          <Input
                            type="number"
                            min={SCORE_MIN}
                            max={SCORE_MAX}
                            value={scores[metric.key] ?? ""}
                            onChange={(e) => handleScoreChange(metric.key, e.target.value)}
                            className="w-20 lg:w-24 mx-auto text-center font-bold text-lg lg:text-xl h-12 lg:h-14 border-2 border-nude-300"
                            placeholder={`${SCORE_MIN}-${SCORE_MAX}`}
                            required
                          />
                        </td>
                        <td className="p-3 lg:p-5 border-t border-nude-200">
                          <Input
                            type="text"
                            value={notes[metric.key] ?? ""}
                            onChange={(e) =>
                              setNotes((prev) => ({ ...prev, [metric.key]: e.target.value }))
                            }
                            className="w-full border-2 border-nude-300 text-xs lg:text-sm h-10 lg:h-12"
                            placeholder="یادداشت (اختیاری)"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden p-4 space-y-4">
                {metrics.map((metric, index) => (
                  <Card key={metric.key} className="border border-nude-200">
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-bold text-nude-900 text-sm leading-tight">
                          {index + 1}. {metric.title}
                        </h3>
                        <p className="text-nude-700 text-xs leading-relaxed">
                          {metric.description}
                        </p>
                        {metric.hint && (
                          <p className="text-nude-500 text-[11px] leading-relaxed">
                            {metric.hint}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-nude-900 font-bold text-xs mb-2 block">
                          امتیاز از {SCORE_MIN} تا {SCORE_MAX}:
                        </Label>
                        <ScoreSelector
                          value={scores[metric.key]}
                          onChange={(value) => handleScoreChange(metric.key, value)}
                          min={SCORE_MIN}
                          max={SCORE_MAX}
                        />
                      </div>

                      <div>
                        <Label className="text-nude-900 font-bold text-xs mb-2 block">
                          یادداشت ارزیاب:
                        </Label>
                        <Input
                          type="text"
                          value={notes[metric.key] ?? ""}
                          onChange={(e) =>
                            setNotes((prev) => ({ ...prev, [metric.key]: e.target.value }))
                          }
                          className="w-full border-2 border-nude-300 text-sm h-12"
                          placeholder="یادداشت (اختیاری)"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="border-2 border-nude-300 bg-gradient-to-br from-white to-nude-50 shadow-lg">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-nude-700 font-bold text-sm sm:text-base mb-2">امتیاز کل:</p>
                      <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-nude-900 mb-2">
                        {totalScore}
                      </p>
                      <p className="text-nude-600 font-semibold text-xs sm:text-sm">
                        از {maxTotalScore} امتیاز
                      </p>
                      <div className="mt-3 sm:mt-4 w-full bg-nude-200 rounded-full h-2 sm:h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-nude-500 to-nude-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${scorePercentage}%` }}
                        />
                      </div>
                    </div>
                    <Calculator className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-nude-500 ml-3 sm:ml-4 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-nude-300 bg-gradient-to-br from-white to-nude-50 shadow-lg">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-nude-700 font-bold text-sm sm:text-base mb-2">میانگین نهایی:</p>
                      <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-nude-900 mb-2">
                        {averageScore}
                      </p>
                      <p className="text-nude-600 font-semibold text-xs sm:text-sm">
                        از {SCORE_MAX} امتیاز
                      </p>
                      <div className="mt-3 sm:mt-4 w-full bg-nude-200 rounded-full h-2 sm:h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-nude-500 to-nude-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${scorePercentage}%` }}
                        />
                      </div>
                    </div>
                    <ClipboardCheck className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-nude-500 ml-3 sm:ml-4 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Open questions */}
            <Card className="border-2 border-nude-200 shadow-xl bg-white">
              <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-bold text-nude-900">سؤالات تشریحی</h3>

                {openQuestions.map((item) => (
                  <div key={item.key} className="space-y-2">
                    <Label
                      htmlFor={item.key}
                      className="text-nude-900 font-bold text-sm sm:text-base flex items-center gap-2"
                    >
                      <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                      {item.label}:
                    </Label>
                    <p className="text-nude-600 text-xs sm:text-sm leading-relaxed">
                      {item.question}
                    </p>
                    <Textarea
                      id={item.key}
                      rows={3}
                      value={answers[item.key] ?? ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [item.key]: e.target.value }))
                      }
                      className="border-2 border-nude-300 resize-none text-sm sm:text-base"
                      placeholder="پاسخ شما..."
                    />
                  </div>
                ))}

                {/* Optional image */}
                <div className="space-y-3">
                  <Label className="text-nude-900 font-bold text-sm sm:text-base flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-nude-500" />
                    تصویر ارزیابی (اختیاری):
                  </Label>
                  <div className="border-2 border-nude-300 rounded-lg p-4 bg-nude-50/50 space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload-role"
                      disabled={uploadingImage}
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <label
                        htmlFor="image-upload-role"
                        className={`cursor-pointer inline-flex items-center justify-center px-4 py-2 border-2 border-nude-300 rounded-md shadow-sm text-sm font-medium text-nude-700 bg-white hover:bg-nude-100 transition-colors ${
                          uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {uploadingImage ? "در حال آپلود..." : "انتخاب تصویر"}
                      </label>
                      {(imageUrl || localImagePreview) && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-green-600 font-medium">
                            {imageUrl ? "تصویر آپلود شد" : "تصویر انتخاب شد"}
                          </span>
                          <button
                            type="button"
                            onClick={removeImage}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            حذف
                          </button>
                        </div>
                      )}
                    </div>
                    {(imageUrl || localImagePreview) && (
                      <img
                        src={
                          localImagePreview ||
                          (imageUrl.startsWith("/uploads") ? imageUrl : `/${imageUrl}`)
                        }
                        alt="تصویر ارزیابی"
                        className="max-w-full h-32 object-cover rounded-lg border-2 border-nude-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setModalImageSrc(
                            localImagePreview ||
                              (imageUrl.startsWith("/uploads") ? imageUrl : `/${imageUrl}`)
                          )
                          setImageModalOpen(true)
                        }}
                      />
                    )}
                    <p className="text-xs text-nude-600">
                      فرمت‌های مجاز: JPG, PNG, GIF | حداکثر حجم: ۵ مگابایت
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom actions */}
            <Card className="border-2 border-nude-200 shadow-xl bg-gradient-to-r from-nude-50 to-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                  <p className="text-nude-700 text-xs sm:text-sm order-2 sm:order-1">
                    امتیاز همه شاخص‌ها الزامی است؛ سؤالات تشریحی اختیاری هستند.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 order-1 sm:order-2">
                    <Link href="/evaluations/team" className="order-2 sm:order-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-2 border-nude-300 hover:bg-nude-100 text-nude-700 font-semibold px-6 sm:px-8 w-full sm:w-auto h-10 sm:h-12 text-sm"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                        انصراف
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={loading || !dateReady}
                      className="bg-gradient-to-l from-nude-500 to-nude-600 hover:from-nude-600 hover:to-nude-700 text-white font-semibold px-6 sm:px-10 h-10 sm:h-12 shadow-lg shadow-nude-500/30 w-full sm:w-auto text-sm"
                    >
                      <Save className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                      {loading ? "در حال ثبت..." : "ثبت ارزیابی"}
                    </Button>
                  </div>
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
