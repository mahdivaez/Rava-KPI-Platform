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
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Search, MessageSquare, ChevronRight, Save, X } from "lucide-react"
import Link from "next/link"
import { usePersianDate } from "@/hooks/use-persian-date"
import { ImageModal } from "@/components/ui/image-modal"

type WorkgroupWithMembers = Workgroup & {
  members: (WorkgroupMember & { user: User })[]
}

// Convert Persian numerals to Western numerals
function convertPersianToWesternNumerals(str: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const westernDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  return str.replace(/[۰-۹]/g, (match) => westernDigits[persianDigits.indexOf(match)]);
}

export function FeedbackForm({
  workgroups,
}: {
  workgroups: WorkgroupWithMembers[]
}) {
  const { currentYear: currentPersianYear, effectiveCurrentMonth } = usePersianDate()

  const [loading, setLoading] = useState(false)
  const [selectedWorkgroup, setSelectedWorkgroup] = useState("")
  const [strategistSearch, setStrategistSearch] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [localImagePreview, setLocalImagePreview] = useState<string>("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [modalImageSrc, setModalImageSrc] = useState<string>("")
  const router = useRouter()

  // Rating states
  const [communication, setCommunication] = useState(0)
  const [supportLevel, setSupportLevel] = useState(0)
  const [clarityOfTasks, setClarityOfTasks] = useState(0)
  const [feedbackQuality, setFeedbackQuality] = useState(0)

  // Rating circles component
  const RatingCircles = ({ name, value, onChange }: { name: string; value: number; onChange: (value: number) => void }) => {
    return (
      <div className="flex gap-1 justify-center">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
              num <= value
                ? 'bg-nude-500 border-nude-500 text-white'
                : 'bg-white border-nude-300 hover:border-nude-400'
            }`}
            title={`امتیاز ${num}`}
          >
            {num}
          </button>
        ))}
      </div>
    )
  }

  // Persian month names
  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن'
  ]

  // Available months based on selected year (only current month and year allowed)
  const getAvailableMonths = (selectedYear: number) => {
    if (selectedYear === currentPersianYear) {
      return [{
        name: persianMonths[effectiveCurrentMonth - 1],
        value: effectiveCurrentMonth
      }]
    }
    return []
  }

  const availableMonths = getAvailableMonths(currentPersianYear)

  const strategists = selectedWorkgroup
    ? workgroups.find((w) => w.id === selectedWorkgroup)?.members
        .filter((m) => m.role === "STRATEGIST")
        .map((m) => m.user)
        .filter((user) =>
          `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(strategistSearch.toLowerCase())
        ) || []
    : []

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
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
      formData.append('userId', 'feedback-images') // Use fixed key for feedback images

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
    setModalImageSrc(imageSrc)
    setImageModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const workgroupId = formData.get("workgroupId") as string | null
    const strategistId = formData.get("strategistId") as string | null
    const month = Number(formData.get("month"))
    const year = Number(formData.get("year"))

    if (!workgroupId) {
      toast.error("انتخاب کارگروه الزامی است")
      setLoading(false)
      return
    }

    if (!strategistId) {
      toast.error("انتخاب استراتژیست الزامی است")
      setLoading(false)
      return
    }

    if (!month || Number.isNaN(month)) {
      toast.error("ماه معتبر نیست")
      setLoading(false)
      return
    }

    if (!year || Number.isNaN(year)) {
      toast.error("سال معتبر نیست")
      setLoading(false)
      return
    }

    const metrics = {
      communication,
      supportLevel,
      clarityOfTasks,
      feedbackQuality,
    }

    // Validate all ratings are selected
    for (const [key, value] of Object.entries(metrics)) {
      const label = {
        communication: "ارتباطات",
        supportLevel: "سطح پشتیبانی",
        clarityOfTasks: "وضوح وظایف",
        feedbackQuality: "کیفیت بازخورد",
      }[key]
      if (value < 1 || value > 10) {
        toast.error(`امتیاز ${label} باید بین ۱ تا ۱۰ باشد`)
        setLoading(false)
        return
      }
    }

    const data = {
      strategistId,
      workgroupId,
      month,
      year,
      communication: metrics.communication,
      supportLevel: metrics.supportLevel,
      clarityOfTasks: metrics.clarityOfTasks,
      feedbackQuality: metrics.feedbackQuality,
      positivePoints: formData.get("positivePoints") || undefined,
      improvements: formData.get("improvements") || undefined,
      suggestions: formData.get("suggestions") || undefined,
      imageUrl: imageUrl || undefined,
    }

    try {
      const res = await fetch("/api/feedback/writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast.success("بازخورد با موفقیت ارسال شد")
        setSelectedWorkgroup("")
        setStrategistSearch("")
        setImageUrl("")
        setImageFile(null)
        setCommunication(0)
        setSupportLevel(0)
        setClarityOfTasks(0)
        setFeedbackQuality(0)
        router.refresh()
      } else {
        const result = await res.json()
        toast.error(result.error || "خطا در ارسال بازخورد")
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
        <span className="text-nude-900 font-semibold truncate">ارسال بازخورد</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <Card className="border-2 border-nude-200 shadow-xl bg-white">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            {/* Mobile-first header layout */}
            <div className="flex flex-col space-y-4 mb-6 sm:mb-6 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-nude-500 to-nude-600 flex items-center justify-center shadow-lg shadow-nude-500/30">
                  <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-nude-900 leading-tight">ارسال بازخورد به استراتژیست</h1>
                  <p className="text-nude-600 text-xs sm:text-sm lg:text-base mt-1">فرم بازخورد ماهانه عملکرد و شاخص‌های کلیدی</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Link href="/dashboard" className="order-2 sm:order-1">
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
                  {loading ? "در حال ارسال..." : "ارسال بازخورد"}
                </Button>
              </div>
            </div>

            {/* Metadata Section - Mobile-first responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 bg-gradient-to-br from-nude-50 to-nude-100/50 rounded-xl border border-nude-200">
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

              {/* Strategist Selection */}
              <div className="space-y-2">
                <Label htmlFor="strategistId" className="text-nude-900 font-bold text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nude-500"></span>
                  نام استراتژیست:
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-nude-400" />
                  <Input
                    placeholder="جستجو در استراتژیست‌ها..."
                    value={strategistSearch}
                    onChange={(e) => setStrategistSearch(e.target.value)}
                    className="pl-8 sm:pl-9 h-8 sm:h-9 border-nude-300 focus:border-nude-500 text-xs sm:text-sm"
                    disabled={!selectedWorkgroup}
                  />
                </div>
                <Select name="strategistId" required disabled={!selectedWorkgroup || strategists.length === 0}>
                  <SelectTrigger className="h-10 sm:h-12 border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder={
                      !selectedWorkgroup
                        ? "ابتدا کارگروه را انتخاب کنید"
                        : strategists.length === 0
                          ? "استراتژیستی یافت نشد"
                          : "انتخاب کنید"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {strategists.map((strategist) => (
                      <SelectItem key={strategist.id} value={strategist.id}>
                        {strategist.firstName} {strategist.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            </div>
          </CardContent>
        </Card>

        {/* Score Section */}
        <Card className="border-2 border-nude-200 shadow-xl overflow-hidden bg-white">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-l from-nude-500 to-nude-600">
                  <th className="text-right p-3 lg:p-5 text-white font-bold border-l border-nude-400 text-sm lg:text-base w-[30%]">
                    شاخص ارزیابی
                  </th>
                  <th className="text-right p-3 lg:p-5 text-white font-bold text-sm lg:text-base w-[70%]">
                    امتیاز از 1 تا 10
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'communication', title: 'ارتباطات' },
                  { key: 'supportLevel', title: 'سطح پشتیبانی' },
                  { key: 'clarityOfTasks', title: 'وضوح وظایف' },
                  { key: 'feedbackQuality', title: 'کیفیت بازخورد' }
                ].map((metric, index) => (
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
                    <td className="p-3 lg:p-5 border-t border-nude-200">
                      <div className="flex flex-col items-center gap-2">
                        <RatingCircles
                          name={metric.key}
                          value={
                            metric.key === 'communication' ? communication :
                            metric.key === 'supportLevel' ? supportLevel :
                            metric.key === 'clarityOfTasks' ? clarityOfTasks :
                            feedbackQuality
                          }
                          onChange={
                            metric.key === 'communication' ? setCommunication :
                            metric.key === 'supportLevel' ? setSupportLevel :
                            metric.key === 'clarityOfTasks' ? setClarityOfTasks :
                            setFeedbackQuality
                          }
                        />
                        <input
                          type="hidden"
                          name={metric.key}
                          value={
                            metric.key === 'communication' ? communication :
                            metric.key === 'supportLevel' ? supportLevel :
                            metric.key === 'clarityOfTasks' ? clarityOfTasks :
                            feedbackQuality
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden p-4 space-y-4">
            {[
              { key: 'communication', title: 'ارتباطات' },
              { key: 'supportLevel', title: 'سطح پشتیبانی' },
              { key: 'clarityOfTasks', title: 'وضوح وظایف' },
              { key: 'feedbackQuality', title: 'کیفیت بازخورد' }
            ].map((metric, index) => (
              <Card key={metric.key} className="border border-nude-200">
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-nude-900 text-sm leading-tight">{metric.title}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label className="text-nude-900 font-bold text-xs mb-2 block">
                        امتیاز از 1 تا 10:
                      </Label>
                      <div className="flex flex-col items-center gap-2">
                        <RatingCircles
                          name={metric.key}
                          value={
                            metric.key === 'communication' ? communication :
                            metric.key === 'supportLevel' ? supportLevel :
                            metric.key === 'clarityOfTasks' ? clarityOfTasks :
                            feedbackQuality
                          }
                          onChange={
                            metric.key === 'communication' ? setCommunication :
                            metric.key === 'supportLevel' ? setSupportLevel :
                            metric.key === 'clarityOfTasks' ? setClarityOfTasks :
                            setFeedbackQuality
                          }
                        />
                        <input
                          type="hidden"
                          name={metric.key}
                          value={
                            metric.key === 'communication' ? communication :
                            metric.key === 'supportLevel' ? supportLevel :
                            metric.key === 'clarityOfTasks' ? clarityOfTasks :
                            feedbackQuality
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Card>

        {/* Additional Notes */}
        <Card className="border-2 border-nude-200 shadow-xl bg-white">
          <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-nude-900 mb-4">توضیحات تکمیلی</h3>
            
            <div className="space-y-3">
              <Label htmlFor="positivePoints" className="text-nude-900 font-bold text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                نقاط مثبت:
              </Label>
              <Textarea
                id="positivePoints"
                name="positivePoints"
                rows={3}
                className="border-2 border-nude-300 focus:border-green-500 focus:ring-green-500 resize-none text-sm sm:text-base"
                placeholder="موارد مثبت و قوت‌های استراتژیست را ذکر کنید..."
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
                placeholder="مواردی که قابل بهبود هستند را ذکر کنید..."
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
                placeholder="پیشنهادات و راهکارهای بهبود..."
              />
            </div>

            <div className="space-y-3">
              <Label className="text-nude-900 font-bold text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                تصویر بازخورد (اختیاری):
              </Label>
              <div className="border-2 border-nude-300 rounded-lg p-4 bg-nude-50/50">
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload-feedback"
                    disabled={uploadingImage}
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label
                      htmlFor="image-upload-feedback"
                      className={`cursor-pointer inline-flex items-center justify-center px-4 py-2 border-2 border-nude-300 rounded-md shadow-sm text-sm font-medium text-nude-700 bg-white hover:bg-nude-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nude-500 transition-colors ${
                        uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploadingImage ? 'در حال آپلود...' : 'انتخاب تصویر'}
                    </label>
                    {imageUrl && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600 font-medium">تصویر آپلود شد</span>
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
                        alt="تصویر بازخورد"
                        className="max-w-full h-32 object-cover rounded-lg border-2 border-nude-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleImageClick(localImagePreview || (imageUrl.startsWith('/uploads') ? imageUrl : `/${imageUrl}`))}
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
                <Link href="/dashboard" className="order-2 sm:order-1">
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
                  {loading ? "در حال ارسال..." : "ارسال بازخورد"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageSrc={modalImageSrc}
        imageAlt="تصویر بازخورد"
      />
    </div>
  )
}