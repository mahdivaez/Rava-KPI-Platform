"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Workgroup, WorkgroupMember, User } from "@prisma/client"
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
import { Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Calculator, FileText, ChevronRight, Save, X } from "lucide-react"
import Link from "next/link"
import { usePersianDate } from "@/hooks/use-persian-date"
import moment from 'moment-jalaali'

type WorkgroupWithMembers = Workgroup & {
  members: (WorkgroupMember & { user: User })[]
}

// Writer evaluation metrics
const WRITER_METRICS = [
  {
    key: 'responsibility',
    title: 'نظم و مسئولیت‌پذیری',
    description: 'تحویل به موقع، رعایت ددلاین، پیگیری اجرای پروژه‌ها',
    maxScore: 5
  },
  {
    key: 'strategistSatisfaction',
    title: 'رضایت استراتژیست',
    description: 'میزان هماهنگی با مسیر استراتژی پیش در اجرای ایده‌ها و سناریوها',
    maxScore: 5
  },
  {
    key: 'meetingEngagement',
    title: 'تعامل در جلسات',
    description: 'میزان مشارکت، ارائهٔ ایده و ارتباط مؤثر در جلسات تیمی',
    maxScore: 5
  },
  {
    key: 'scenarioPerformance',
    title: 'عملکرد سناریو در ویو',
    description: 'بررسی ویو رینگهایی که نویسنده سناریوی آن‌ها را نوشته',
    maxScore: 5
  },
  {
    key: 'clientSatisfaction',
    title: 'رضایت مشتری/ بلاگر',
    description: 'بازخورد مستقیم یا غیرمستقیم بلاگر یا مشتری',
    maxScore: 5
  },
  {
    key: 'brandAlignment',
    title: 'تطابق با لحن برند یا شخص',
    description: 'توانایی در برانزیابی درست هویت برند در متن و دیالوگ‌ها',
    maxScore: 5
  }
]

export function WriterEvaluationForm({
  workgroups,
}: {
  workgroups: WorkgroupWithMembers[]
}) {
  const { currentYear: currentPersianYear, effectiveCurrentMonth } = usePersianDate()

  const [loading, setLoading] = useState(false)
  const [selectedWorkgroup, setSelectedWorkgroup] = useState("")
  const [selectedYear, setSelectedYear] = useState(currentPersianYear)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [writerSearch, setWriterSearch] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [localImagePreview, setLocalImagePreview] = useState<string>("")
  const [uploadingImage, setUploadingImage] = useState(false)
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

  const writers = selectedWorkgroup
    ? workgroups.find((w) => w.id === selectedWorkgroup)?.members.map((m) => m.user) || []
    : []

  // Filter writers based on search
  const filteredWriters = writers.filter((writer) =>
    `${writer.firstName} ${writer.lastName}`.toLowerCase().includes(writerSearch.toLowerCase())
  )

  // Get available months for the selected year
  const availableMonths = getAvailableMonths(selectedYear)

  // Calculate total and average
  const totalScore = Object.values(scores).reduce((sum, score) => sum + (score || 0), 0)
  const maxTotalScore = WRITER_METRICS.length * 5
  const averageScore = WRITER_METRICS.length > 0 
    ? (totalScore / WRITER_METRICS.length).toFixed(2) 
    : '0.00'

  // Score percentage
  const scorePercentage = maxTotalScore > 0 ? (totalScore / maxTotalScore) * 100 : 0

  const handleScoreChange = (key: string, value: string) => {
    const numValue = parseInt(value) || 0
    if (numValue >= 1 && numValue <= 5) {
      setScores(prev => ({ ...prev, [key]: numValue }))
    } else if (value === '') {
      const newScores = { ...scores }
      delete newScores[key]
      setScores(newScores)
    }
  }

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    const missingScores = WRITER_METRICS.filter(m => !scores[m.key])
    if (missingScores.length > 0) {
      toast.error(`لطفاً امتیاز ${missingScores[0].title} را وارد کنید`)
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    const data = {
      writerId: formData.get("writerId"),
      workgroupId: formData.get("workgroupId"),
      month: parseInt(formData.get("month") as string),
      year: parseInt(formData.get("year") as string),
      responsibility: (scores.responsibility || 0) * 2,
      strategistSatisfaction: (scores.strategistSatisfaction || 0) * 2,
      meetingEngagement: (scores.meetingEngagement || 0) * 2,
      scenarioPerformance: (scores.scenarioPerformance || 0) * 2,
      clientSatisfaction: (scores.clientSatisfaction || 0) * 2,
      brandAlignment: (scores.brandAlignment || 0) * 2,
      strengths: formData.get("strengths") || undefined,
      improvements: formData.get("improvements") || undefined,
      suggestions: formData.get("suggestions") || undefined,
      evaluatorNotes: Object.entries(notes).map(([key, note]) => {
        const metric = WRITER_METRICS.find(m => m.key === key)
        return note ? `${metric?.title}: ${note}` : ''
      }).filter(Boolean).join('\n\n') || undefined,
      imageUrl: imageUrl || undefined,
      status: "COMPLETED",
    }

    try {
      const res = await fetch("/api/evaluations/writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast.success("ارزیابی با موفقیت ثبت شد")
        router.push('/evaluations/writer')
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

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6">
      {/* Breadcrumb */}
      <div className="mb-4 sm:mb-6 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-nude-600">
        <Link href="/dashboard" className="hover:text-nude-900 transition-colors truncate">
          داشبورد
        </Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
        <Link href="/evaluations/writer" className="hover:text-nude-900 transition-colors truncate">
          ارزیابی نویسنده‌ها
        </Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
        <span className="text-nude-900 font-semibold truncate">ارزیابی جدید</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <Card className="border-2 border-nude-200 shadow-xl bg-white">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            {/* Mobile-first header layout */}
            <div className="flex flex-col space-y-4 mb-6 sm:mb-6 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-nude-500 to-nude-600 flex items-center justify-center shadow-lg shadow-nude-500/30">
                  <FileText className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-nude-900 leading-tight">ارزیابی عملکرد تیم نویسندگان</h1>
                  <p className="text-nude-600 text-xs sm:text-sm lg:text-base mt-1">فرم ارزیابی ماهانه عملکرد و شاخص‌های کلیدی</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Link href="/evaluations/writer" className="order-2 sm:order-1">
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
                  disabled={loading}
                  className="bg-gradient-to-l from-nude-500 to-nude-600 hover:from-nude-600 hover:to-nude-700 text-white font-semibold px-6 sm:px-8 w-full sm:w-auto shadow-lg shadow-nude-500/30 text-sm"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {loading ? "در حال ثبت..." : "ثبت ارزیابی"}
                </Button>
              </div>
            </div>

            {/* Metadata Section - Mobile-first responsive grid for 5 items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 bg-gradient-to-br from-nude-50 to-nude-100/50 rounded-xl border border-nude-200">
              {/* Workgroup Selection */}
              <div className="space-y-2">
                <Label htmlFor="workgroupId" className="text-nude-900 font-bold text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nude-500"></span>
                  کارگروه:
                </Label>
                <Select
                  name="workgroupId"
                  value={selectedWorkgroup}
                  onValueChange={setSelectedWorkgroup}
                  required
                >
                  <SelectTrigger className="h-10 sm:h-12 border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 bg-white">
                    <SelectValue placeholder="انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {workgroups.map((workgroup) => (
                      <SelectItem key={workgroup.id} value={workgroup.id}>
                        {workgroup.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Writer Selection */}
              <div className="space-y-2">
                <Label htmlFor="writerId" className="text-nude-900 font-bold text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nude-500"></span>
                  نام نویسنده:
                </Label>
                <div className="relative">
                  <select
                    name="writerId"
                    required
                    disabled={!selectedWorkgroup}
                    className="w-full h-10 sm:h-12 border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 bg-white rounded-md px-3 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ appearance: 'none' }}
                  >
                    <option value="">
                      {selectedWorkgroup ? "نویسنده را انتخاب کنید" : "ابتدا کارگروه را انتخاب کنید"}
                    </option>
                    {filteredWriters.map((writer) => (
                      <option key={writer.id} value={writer.id}>
                        {writer.firstName} {writer.lastName}
                      </option>
                    ))}
                  </select>
                  {selectedWorkgroup && writers.length > 5 && (
                    <div className="mt-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-nude-400" />
                        <Input
                          placeholder="جستجوی نویسنده..."
                          value={writerSearch}
                          onChange={(e) => setWriterSearch(e.target.value)}
                          className="pl-8 sm:pl-9 h-8 sm:h-9 border-nude-300 focus:border-nude-500 text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Month Selection */}
              <div className="space-y-2">
                <Label htmlFor="month" className="text-nude-900 font-bold text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nude-500"></span>
                  ماه:
                </Label>
                <Select name="month" defaultValue={effectiveCurrentMonth.toString()} required>
                  <SelectTrigger className="h-10 sm:h-12 border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 bg-nude-50">
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

              {/* Year Input */}
              <div className="space-y-2">
                <Label htmlFor="year" className="text-nude-900 font-bold text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nude-500"></span>
                  سال:
                </Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={currentPersianYear}
                  readOnly
                  className="h-10 sm:h-12 border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 bg-nude-50 text-nude-700 font-bold text-xs sm:text-sm"
                  required
                />
              </div>

              {/* Evaluation Period */}
              <div className="space-y-2">
                <Label className="text-nude-900 font-bold text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nude-500"></span>
                  بازهٔ زمانی ارزیابی:
                </Label>
                <div className="h-10 sm:h-12 flex items-center px-3 sm:px-4 bg-nude-100 border-2 border-nude-200 rounded-lg text-xs sm:text-sm text-nude-700 font-bold">
                  ماهانه
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evaluation Table */}
        <Card className="border-2 border-nude-200 shadow-xl overflow-hidden bg-white">
          {/* Desktop Table View */}
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
                    امتیاز از 1 تا 5
                  </th>
                  <th className="text-right p-3 lg:p-5 text-white font-bold text-sm lg:text-base w-[25%]">
                    یادداشت ارزیاب
                  </th>
                </tr>
              </thead>
              <tbody>
                {WRITER_METRICS.map((metric, index) => (
                  <tr 
                    key={metric.key}
                    className={`${
                      index % 2 === 0 ? 'bg-nude-50/50' : 'bg-white'
                    } hover:bg-nude-100/50 transition-all duration-200`}
                  >
                    <td className="p-3 lg:p-5 border-l border-t border-nude-200">
                      <span className="font-bold text-nude-900 text-sm lg:text-base leading-relaxed block">
                        {metric.title}
                      </span>
                    </td>
                    <td className="p-3 lg:p-5 border-l border-t border-nude-200">
                      <span className="text-nude-700 text-xs lg:text-sm leading-relaxed block">
                        {metric.description}
                      </span>
                    </td>
                    <td className="p-3 lg:p-5 border-l border-t border-nude-200">
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={scores[metric.key] || ''}
                        onChange={(e) => handleScoreChange(metric.key, e.target.value)}
                        className="w-20 lg:w-24 mx-auto text-center font-bold text-lg lg:text-xl h-12 lg:h-14 border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500"
                        placeholder="1-5"
                        required
                      />
                    </td>
                    <td className="p-3 lg:p-5 border-t border-nude-200">
                      <Input
                        type="text"
                        value={notes[metric.key] || ''}
                        onChange={(e) => handleNoteChange(metric.key, e.target.value)}
                        className="w-full border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 text-xs lg:text-sm h-10 lg:h-12"
                        placeholder="یادداشت (اختیاری)"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden p-4 space-y-4">
            {WRITER_METRICS.map((metric, index) => (
              <Card key={metric.key} className="border border-nude-200">
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-nude-900 text-sm leading-tight">{metric.title}</h3>
                    <p className="text-nude-700 text-xs leading-relaxed">{metric.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label className="text-nude-900 font-bold text-xs mb-2 block">
                        امتیاز از 1 تا 5:
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={scores[metric.key] || ''}
                        onChange={(e) => handleScoreChange(metric.key, e.target.value)}
                        className="w-20 text-center font-bold text-lg h-12 border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500"
                        placeholder="1-5"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label className="text-nude-900 font-bold text-xs mb-2 block">
                        یادداشت ارزیاب:
                      </Label>
                      <Input
                        type="text"
                        value={notes[metric.key] || ''}
                        onChange={(e) => handleNoteChange(metric.key, e.target.value)}
                        className="w-full border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 text-sm h-12"
                        placeholder="یادداشت (اختیاری)"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Card>

        {/* Score Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="border-2 border-nude-300 bg-gradient-to-br from-white to-nude-50 shadow-lg">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-nude-700 font-bold text-sm sm:text-base mb-2">امتیاز کل نویسنده:</p>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-nude-900 mb-2">
                    {totalScore}
                  </p>
                  <p className="text-nude-600 font-semibold text-xs sm:text-sm">از {maxTotalScore} امتیاز</p>
                  <div className="mt-3 sm:mt-4 w-full bg-nude-200 rounded-full h-2 sm:h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-nude-500 to-nude-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${scorePercentage}%` }}
                    ></div>
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
                  <p className="text-nude-600 font-semibold text-xs sm:text-sm">از 5 امتیاز</p>
                  <div className="mt-3 sm:mt-4 w-full bg-nude-200 rounded-full h-2 sm:h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-nude-500 to-nude-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${scorePercentage}%` }}
                    ></div>
                  </div>
                </div>
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-nude-500 ml-3 sm:ml-4 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Notes */}
        <Card className="border-2 border-nude-200 shadow-xl bg-white">
          <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-nude-900 mb-4">توضیحات تکمیلی</h3>
            
            <div className="space-y-3">
              <Label htmlFor="strengths" className="text-nude-900 font-bold text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                نقاط قوت:
              </Label>
              <Textarea 
                id="strengths" 
                name="strengths" 
                rows={3}
                className="border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 resize-none text-sm sm:text-base"
                placeholder="نقاط قوت نویسنده را به تفصیل شرح دهید..."
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="improvements" className="text-nude-900 font-bold text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                نقاط قابل بهبود:
              </Label>
              <Textarea 
                id="improvements" 
                name="improvements" 
                rows={3}
                className="border-2 border-nude-300 focus:border-orange-500 focus:ring-orange-500 resize-none text-sm sm:text-base"
                placeholder="نقاط قابل بهبود را با پیشنهادات مشخص ذکر کنید..."
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="suggestions" className="text-nude-900 font-bold text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                پیشنهادات:
              </Label>
              <Textarea 
                id="suggestions" 
                name="suggestions" 
                rows={3}
                className="border-2 border-nude-300 focus:border-blue-500 focus:ring-blue-500 resize-none text-sm sm:text-base"
                placeholder="پیشنهادات خود برای بهبود عملکرد را بنویسید..."
              />
            </div>

            <div className="space-y-3">
              <Label className="text-nude-900 font-bold text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                تصویر ارزیابی (اختیاری):
              </Label>
              <div className="border-2 border-nude-300 rounded-lg p-4 bg-nude-50/50">
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload-writer"
                    disabled={uploadingImage}
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label
                      htmlFor="image-upload-writer"
                      className={`cursor-pointer inline-flex items-center justify-center px-4 py-2 border-2 border-nude-300 rounded-md shadow-sm text-sm font-medium text-nude-700 bg-white hover:bg-nude-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nude-500 transition-colors ${
                        uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploadingImage ? 'در حال آپلود...' : 'انتخاب تصویر'}
                    </label>
                    {(imageUrl || localImagePreview) && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600 font-medium">
                          {localImagePreview ? 'تصویر انتخاب شد' : 'تصویر آپلود شد'}
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
                    <div className="mt-3">
                      <img
                        src={localImagePreview || (imageUrl.startsWith('/uploads') ? imageUrl : `/${imageUrl}`)}
                        alt="تصویر ارزیابی"
                        className="max-w-full h-32 object-cover rounded-lg border-2 border-nude-200"
                        onError={(e) => {
                          console.error('Image failed to load:', localImagePreview || imageUrl)
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <p className="text-xs text-nude-600">
                    فرمت‌های مجاز: JPG, PNG, GIF | حداکثر حجم: ۵ مگابایت
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Actions */}
        <Card className="border-2 border-nude-200 shadow-xl bg-gradient-to-r from-nude-50 to-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <p className="text-nude-700 text-xs sm:text-sm order-2 sm:order-1">
                همه فیلدهای ستاره‌دار (*) الزامی هستند
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 order-1 sm:order-2">
                <Link href="/evaluations/writer" className="order-2 sm:order-1">
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
                  disabled={loading}
                  className="bg-gradient-to-l from-nude-500 to-nude-600 hover:from-nude-600 hover:to-nude-700 text-white font-semibold px-6 sm:px-10 h-10 sm:h-12 shadow-lg shadow-nude-500/30 w-full sm:w-auto text-sm"
                >
                  <Save className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  {loading ? "در حال ثبت..." : "ثبت ارزیابی"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
