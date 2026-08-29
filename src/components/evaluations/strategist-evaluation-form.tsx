"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User } from "@prisma/client"
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
import { PageHeader } from "@/components/ui/page-header"
import { Progress } from "@/components/ui/progress"
import { ScoreScale } from "@/components/ui/score"
import { getScoreBand } from "@/lib/design-tokens"
import { toast } from "sonner"
import {
  CalendarDays,
  Calculator,
  Check,
  Image as ImageIcon,
  Save,
  Search,
  TrendingUp,
  Upload,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePersianDate } from "@/hooks/use-persian-date"
import moment from 'moment-jalaali'
import { ImageModal } from "@/components/ui/image-modal"

// Evaluation metrics
const STRATEGIST_METRICS = [
  {
    key: 'ideation',
    title: 'ایده پردازی و هدایت خلاق',
    description: 'ایده‌های تازه، خلاقیت در مفاهیم، جهت دهی به محتوا و تبلیغ‌ها',
    maxScore: 5
  },
  {
    key: 'avgViews',
    title: 'میانگین ویو پست‌ها',
    description: 'تحلیل عملکرد صفحه و ارزیابی محتوای کم ویو',
    maxScore: 5
  },
  {
    key: 'qualityControl',
    title: 'ویراستاری و نظارت کیفی',
    description: 'در صورت وجود مشکلات ویراستاری و غلط‌های نگارشی امتیاز کسر می‌شود',
    maxScore: 5
  },
  {
    key: 'teamRelations',
    title: 'روابط تیمی',
    description: 'همکاری، هماهنگی و همراهی مؤثر با اعضای تیم',
    maxScore: 5
  },
  {
    key: 'clientRelations',
    title: 'روابط با مشتری',
    description: 'تعامل حرفه‌ای، درک نیاز مشتری و انعطاف در مواجهه با بازخوردها',
    maxScore: 5
  },
  {
    key: 'responsiveness',
    title: 'نظم و پاسخگویی',
    description: 'تحویل به موقع وظایف، مدیریت زمان و هماهنگی بین تیم',
    maxScore: 5
  },
  {
    key: 'clientSatisfaction',
    title: 'رضایت مشتری',
    description: 'ارزیابی بر اساس فیدبک مستقیم یا غیرمستقیم مشتری',
    maxScore: 5
  }
]

export function StrategistEvaluationForm({ strategists }: { strategists: User[] }) {
  const { currentYear: currentPersianYear, effectiveCurrentMonth } = usePersianDate()

  const [loading, setLoading] = useState(false)
  const [selectedYear, setSelectedYear] = useState(currentPersianYear)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [strategistSearch, setStrategistSearch] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [localImagePreview, setLocalImagePreview] = useState<string>("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [modalImageSrc, setModalImageSrc] = useState<string>("")
  const router = useRouter()

  // Persian month names
  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن'
  ]

  // Available months - always show current month regardless of year
  const getAvailableMonths = (selectedYear: number) => {
    // Always show the current Persian month
    return [{
      name: persianMonths[effectiveCurrentMonth - 1],
      value: effectiveCurrentMonth
    }]
  }

  // Get available months for the selected year
  const availableMonths = getAvailableMonths(selectedYear)

  // Filter strategists based on search
  const filteredStrategists = strategists.filter((strategist) =>
    `${strategist.firstName} ${strategist.lastName}`.toLowerCase().includes(strategistSearch.toLowerCase())
  )

  // Calculate total and average
  const totalScore = Object.values(scores).reduce((sum, score) => sum + (score || 0), 0)
  const maxTotalScore = STRATEGIST_METRICS.length * 5
  const averageScore = STRATEGIST_METRICS.length > 0 
    ? (totalScore / STRATEGIST_METRICS.length).toFixed(2) 
    : '0.00'

  // Score percentage for progress
  const scorePercentage = maxTotalScore > 0 ? (totalScore / maxTotalScore) * 100 : 0

  // Update score
  const handleScoreChange = (key: string, value: string | number) => {
    const numValue = typeof value === 'string' ? (parseInt(value) || 0) : value
    if (numValue >= 1 && numValue <= 5) {
      setScores(prev => ({ ...prev, [key]: numValue }))
    } else if (value === '') {
      const newScores = { ...scores }
      delete newScores[key]
      setScores(newScores)
    }
  }

  // Update note
  const handleNoteChange = (key: string, value: string) => {
    setNotes(prev => ({ ...prev, [key]: value }))
  }

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً فایل تصویری انتخاب کنید')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم تصویر نباید بیشتر از ۵ مگابایت باشد')
      return
    }

    // Create local preview immediately
    const previewUrl = URL.createObjectURL(file)
    setImageFile(file)
    setLocalImagePreview(previewUrl)
    setUploadingImage(true)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', 'evaluation-images') // Use fixed key for evaluation images

      // Upload to server
      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setImageUrl(result.imageUrl)
        // Keep local preview visible until form submission
        toast.success('تصویر با موفقیت آپلود شد')
      } else {
        const error = await response.json()
        toast.error(error.error || 'خطا در آپلود تصویر')
        // Clean up local preview only on error
        setLocalImagePreview("")
        setImageFile(null)
      }
    } catch (error) {
      toast.error('خطا در آپلود تصویر')
      // Clean up local preview only on error
      setLocalImagePreview("")
      setImageFile(null)
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImageUrl("")
    if (localImagePreview) {
      URL.revokeObjectURL(localImagePreview)
      setLocalImagePreview("")
    }
  }

  const handleImageClick = (imageSrc: string) => {
    console.log('Image clicked:', imageSrc) // Debug log
    setModalImageSrc(imageSrc)
    setImageModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    // Validate all scores
    const missingScores = STRATEGIST_METRICS.filter(m => !scores[m.key])
    if (missingScores.length > 0) {
      toast.error(`لطفاً امتیاز ${missingScores[0].title} را وارد کنید`)
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    // Convert 1-5 to 1-10 for database
    const data = {
      strategistId: formData.get("strategistId"),
      month: parseInt(formData.get("month") as string),
      year: parseInt(formData.get("year") as string),
      ideation: (scores.ideation || 0) * 2,
      avgViews: (scores.avgViews || 0) * 2,
      qualityControl: (scores.qualityControl || 0) * 2,
      teamRelations: (scores.teamRelations || 0) * 2,
      clientRelations: (scores.clientRelations || 0) * 2,
      responsiveness: (scores.responsiveness || 0) * 2,
      clientSatisfaction: (scores.clientSatisfaction || 0) * 2,
      strengths: formData.get("strengths") || undefined,
      improvements: formData.get("improvements") || undefined,
      suggestions: formData.get("suggestions") || undefined,
      evaluatorNotes: Object.entries(notes).map(([key, note]) => {
        const metric = STRATEGIST_METRICS.find(m => m.key === key)
        return note ? `${metric?.title}: ${note}` : ''
      }).filter(Boolean).join('\n\n') || undefined,
      imageUrl: imageUrl || undefined,
      status: "COMPLETED",
    }

    try {
      const res = await fetch("/api/evaluations/strategist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast.success("ارزیابی با موفقیت ثبت شد")
        router.push('/evaluations/strategist')
        router.refresh()
      } else {
        const result = await res.json()
        toast.error(result.error || "خطا در ثبت ارزیابی")
      }
    } catch (error) {
      toast.error("خطای سرور")
    } finally {
      setLoading(false)
    }
  }

  const completedMetrics = STRATEGIST_METRICS.filter((m) => scores[m.key]).length
  // Metrics are scored 1–5 here but stored doubled, so bands read on the 1–10 scale.
  const averageBand = getScoreBand(parseFloat(averageScore) * 2)
  const previewImage =
    localImagePreview ||
    (imageUrl ? (imageUrl.startsWith("/uploads") ? imageUrl : `/${imageUrl}`) : "")

  const NOTES = [
    {
      id: "strengths",
      label: "نقاط قوت",
      dot: "bg-success",
      placeholder: "نقاط قوت استراتژیست را به تفصیل شرح دهید…",
    },
    {
      id: "improvements",
      label: "نقاط قابل بهبود",
      dot: "bg-warning",
      placeholder: "نقاط قابل بهبود را با پیشنهادات مشخص ذکر کنید…",
    },
    {
      id: "suggestions",
      label: "پیشنهادات",
      dot: "bg-primary",
      placeholder: "پیشنهادات خود برای بهبود عملکرد را بنویسید…",
    },
  ] as const

  return (
    <div className="space-y-6">
      <PageHeader
        title="ارزیابی عملکرد استراتژیست‌ها"
        description="فرم ارزیابی ماهانه عملکرد و شاخص‌های کلیدی — امتیاز ۱ تا ۵"
        icon={<TrendingUp />}
        breadcrumbs={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "ارزیابی استراتژیست‌ها", href: "/evaluations/strategist" },
          { label: "ارزیابی جدید" },
        ]}
        actions={
          <>
            <Button type="button" variant="outline" asChild>
              <Link href="/evaluations/strategist">
                <X aria-hidden />
                انصراف
              </Link>
            </Button>
            <Button type="submit" form="strategist-evaluation-form" loading={loading}>
              <Save aria-hidden />
              ثبت ارزیابی
            </Button>
          </>
        }
      />

      <form id="strategist-evaluation-form" onSubmit={handleSubmit} className="space-y-5">
        {/* ---------------------------------------------------------------
            Who and when
            --------------------------------------------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle>مشخصات ارزیابی</CardTitle>
            <CardDescription>
              استراتژیست و دوره‌ای که ارزیابی می‌کنید
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="strategistId">
                  نام استراتژیست <RequiredMark />
                </Label>
                <Select name="strategistId" required>
                  <SelectTrigger id="strategistId">
                    <SelectValue placeholder="استراتژیست را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStrategists.map((strategist) => (
                      <SelectItem key={strategist.id} value={strategist.id}>
                        {strategist.firstName} {strategist.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {strategists.length > 5 && (
                  <div className="relative">
                    <Search
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-foreground-subtle"
                    />
                    <Input
                      aria-label="جستجوی استراتژیست"
                      placeholder="جستجوی استراتژیست…"
                      value={strategistSearch}
                      onChange={(e) => setStrategistSearch(e.target.value)}
                      className="h-9 ps-9 text-sm sm:h-9"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="month">
                  ماه <RequiredMark />
                </Label>
                <Select
                  name="month"
                  defaultValue={effectiveCurrentMonth.toString()}
                  required
                >
                  <SelectTrigger id="month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">سال</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={currentPersianYear}
                  readOnly
                  // Read-only rather than disabled: the value must still submit.
                  className="bg-surface-sunken font-medium"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>بازهٔ زمانی</Label>
                <div className="flex h-11 items-center gap-2 rounded-lg border border-border bg-surface-sunken px-3.5 text-sm font-medium text-foreground-secondary sm:h-10">
                  <CalendarDays className="size-4 shrink-0 text-foreground-subtle" aria-hidden />
                  ماهانه
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ---------------------------------------------------------------
            Metrics
            --------------------------------------------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle>شاخص‌های ارزیابی</CardTitle>
            <CardDescription>همه شاخص‌ها الزامی هستند — امتیاز ۱ تا ۵</CardDescription>
            <CardAction>
              <span
                data-numeric
                className="rounded-full bg-surface-sunken px-3 py-1 text-xs font-semibold text-foreground-secondary"
              >
                {completedMetrics.toLocaleString("fa-IR")} از{" "}
                {STRATEGIST_METRICS.length.toLocaleString("fa-IR")} تکمیل‌شده
              </span>
            </CardAction>
          </CardHeader>

          <CardContent className="space-y-4">
            {STRATEGIST_METRICS.map((metric, index) => (
              <fieldset
                key={metric.key}
                className="rounded-xl border border-border bg-surface-sunken p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
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
                    </div>
                  </legend>

                  <div className="min-w-0 flex-1 space-y-3">
                    <ScoreScale
                      name={`score-${metric.key}`}
                      label={metric.title}
                      value={scores[metric.key]}
                      onChange={(value) => handleScoreChange(metric.key, value)}
                      min={1}
                      max={5}
                      bandMultiplier={2}
                    />
                    <Input
                      type="text"
                      aria-label={`یادداشت ارزیاب برای ${metric.title}`}
                      value={notes[metric.key] || ""}
                      onChange={(e) => handleNoteChange(metric.key, e.target.value)}
                      placeholder="یادداشت (اختیاری)"
                    />
                  </div>
                </div>
              </fieldset>
            ))}
          </CardContent>
        </Card>

        {/* ---------------------------------------------------------------
            Running total
            --------------------------------------------------------------- */}
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
              <Progress value={scorePercentage} className="mt-3" aria-label="درصد امتیاز کل" />
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
                  <TrendingUp className="size-[18px]" />
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
                <span className="text-sm text-foreground-subtle">از ۵</span>
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

        {/* ---------------------------------------------------------------
            Narrative
            --------------------------------------------------------------- */}
        <Card>
          <CardHeader>
            <CardTitle>توضیحات تکمیلی</CardTitle>
            <CardDescription>
              اختیاری، ولی بیشترین کمک را به فرد مقابل می‌کند
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {NOTES.map((item) => (
              <div key={item.id} className="space-y-2">
                <Label htmlFor={item.id}>
                  <span aria-hidden className={`size-2 shrink-0 rounded-full ${item.dot}`} />
                  {item.label}
                </Label>
                <Textarea
                  id={item.id}
                  name={item.id}
                  rows={3}
                  placeholder={item.placeholder}
                />
              </div>
            ))}

            <div className="space-y-2">
              <Label htmlFor="image-upload">
                <ImageIcon className="size-4 text-foreground-subtle" aria-hidden />
                تصویر ارزیابی (اختیاری)
              </Label>

              <div className="rounded-xl border border-dashed border-border-strong bg-surface-sunken p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="sr-only"
                  id="image-upload"
                  disabled={uploadingImage}
                />

                <div className="flex flex-wrap items-center gap-3">
                  <label
                    htmlFor="image-upload"
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
                        {localImagePreview ? "تصویر انتخاب شد" : "تصویر آپلود شد"}
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
                    onClick={() => handleImageClick(previewImage)}
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

        {/* ---------------------------------------------------------------
            Submit
            --------------------------------------------------------------- */}
        <Card>
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground-muted">
              امتیاز همه شاخص‌ها الزامی است؛ توضیحات تکمیلی اختیاری هستند.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" asChild>
                <Link href="/evaluations/strategist">
                  <X aria-hidden />
                  انصراف
                </Link>
              </Button>
              <Button type="submit" loading={loading}>
                <Save aria-hidden />
                ثبت ارزیابی
              </Button>
            </div>
          </CardContent>
        </Card>
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
