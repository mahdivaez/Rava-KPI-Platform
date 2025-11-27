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
  const currentPersian = moment()
  const currentPersianMonth = currentPersian.jMonth() + 1
  const currentPersianYear = currentPersian.jYear()
  const effectiveCurrentMonth = Math.min(currentPersianMonth, 11)

  const [loading, setLoading] = useState(false)
  const [selectedWorkgroup, setSelectedWorkgroup] = useState("")
  const [selectedYear, setSelectedYear] = useState(currentPersianYear)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [writerSearch, setWriterSearch] = useState("")
  const router = useRouter()

  // Persian month names
  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن'
  ]

  // Available months based on selected year
  const getAvailableMonths = (selectedYear: number) => {
    if (selectedYear < currentPersianYear) {
      return persianMonths.map((name, i) => ({ name, value: i + 1 }))
    } else if (selectedYear === currentPersianYear) {
      return persianMonths.slice(0, effectiveCurrentMonth).map((name, i) => ({ name, value: i + 1 }))
    }
    return []
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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-nude-600">
        <Link href="/dashboard" className="hover:text-nude-900 transition-colors">
          داشبورد
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/evaluations/writer" className="hover:text-nude-900 transition-colors">
          ارزیابی نویسنده‌ها
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-nude-900 font-semibold">ارزیابی جدید</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Page Header */}
        <Card className="border-2 border-nude-200 shadow-xl bg-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-nude-500 to-nude-600 flex items-center justify-center shadow-lg shadow-nude-500/30">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-nude-900">ارزیابی عملکرد تیم نویسندگان</h1>
                  <p className="text-nude-600 text-base mt-1">فرم ارزیابی ماهانه عملکرد و شاخص‌های کلیدی</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/evaluations/writer">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="border-2 border-nude-300 hover:bg-nude-100 text-nude-700 font-semibold px-6"
                  >
                    <X className="w-4 h-4 ml-2" />
                    انصراف
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-l from-nude-500 to-nude-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-8 shadow-lg shadow-nude-500/30"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {loading ? "در حال ثبت..." : "ثبت ارزیابی"}
                </Button>
              </div>
            </div>

            {/* Metadata Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 p-6 bg-gradient-to-br from-nude-50 to-nude-100/50 rounded-xl border border-nude-200">
              <div className="space-y-2">
                <Label htmlFor="workgroupId" className="text-nude-900 font-bold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nude-500"></span>
                  کارگروه:
                </Label>
                <Select
                  name="workgroupId"
                  value={selectedWorkgroup}
                  onValueChange={setSelectedWorkgroup}
                  required
                >
                  <SelectTrigger className="h-12 border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 bg-white">
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

              <div className="space-y-2">
                <Label htmlFor="writerId" className="text-nude-900 font-bold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nude-500"></span>
                  نام نویسنده:
                </Label>
                <div className="relative">
                  <select
                    name="writerId"
                    required
                    disabled={!selectedWorkgroup}
                    className="w-full h-12 border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 bg-white rounded-md px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-nude-400" />
                        <Input
                          placeholder="جستجوی نویسنده..."
                          value={writerSearch}
                          onChange={(e) => setWriterSearch(e.target.value)}
                          className="pl-9 h-9 border-nude-300 focus:border-nude-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="month" className="text-nude-900 font-bold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nude-500"></span>
                  ماه:
                </Label>
                <Select name="month" defaultValue={effectiveCurrentMonth.toString()} required>
                  <SelectTrigger className="h-12 border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 bg-white">
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
                <Label htmlFor="year" className="text-nude-900 font-bold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nude-500"></span>
                  سال:
                </Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  min="1400"
                  max="1410"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value) || currentPersianYear)}
                  className="h-12 border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 bg-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-nude-900 font-bold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nude-500"></span>
                  بازهٔ زمانی ارزیابی:
                </Label>
                <div className="h-12 flex items-center px-4 bg-nude-100 border-2 border-nude-200 rounded-lg text-sm text-nude-700 font-bold">
                  ماهانه
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evaluation Table */}
        <Card className="border-2 border-nude-200 shadow-xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-l from-nude-500 to-nude-600">
                  <th className="text-right p-5 text-white font-bold border-l border-nude-400 text-base w-[22%]">
                    شاخص ارزیابی
                  </th>
                  <th className="text-right p-5 text-white font-bold border-l border-nude-400 text-base w-[38%]">
                    توضیح
                  </th>
                  <th className="text-center p-5 text-white font-bold border-l border-nude-400 text-base w-[15%]">
                    امتیاز از 1 تا 5
                  </th>
                  <th className="text-right p-5 text-white font-bold text-base w-[25%]">
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
                    <td className="p-5 border-l border-t border-nude-200">
                      <span className="font-bold text-nude-900 text-base leading-relaxed block">
                        {metric.title}
                      </span>
                    </td>
                    <td className="p-5 border-l border-t border-nude-200">
                      <span className="text-nude-700 text-sm leading-relaxed block">
                        {metric.description}
                      </span>
                    </td>
                    <td className="p-5 border-l border-t border-nude-200">
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={scores[metric.key] || ''}
                        onChange={(e) => handleScoreChange(metric.key, e.target.value)}
                        className="w-24 mx-auto text-center font-bold text-xl h-14 border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500"
                        placeholder="1-5"
                        required
                      />
                    </td>
                    <td className="p-5 border-t border-nude-200">
                      <Input
                        type="text"
                        value={notes[metric.key] || ''}
                        onChange={(e) => handleNoteChange(metric.key, e.target.value)}
                        className="w-full border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 text-sm h-12"
                        placeholder="یادداشت (اختیاری)"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Score Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-2 border-nude-300 bg-gradient-to-br from-white to-nude-50 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-nude-700 font-bold text-base mb-2">امتیاز کل نویسنده:</p>
                  <p className="text-5xl font-bold text-nude-900 mb-2">
                    {totalScore}
                  </p>
                  <p className="text-nude-600 font-semibold">از {maxTotalScore} امتیاز</p>
                  <div className="mt-4 w-full bg-nude-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-nude-500 to-nude-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${scorePercentage}%` }}
                    ></div>
                  </div>
                </div>
                <Calculator className="w-16 h-16 text-nude-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-nude-300 bg-gradient-to-br from-white to-green-50 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-nude-700 font-bold text-base mb-2">میانگین نهایی:</p>
                  <p className="text-5xl font-bold text-nude-900 mb-2">
                    {averageScore}
                  </p>
                  <p className="text-nude-600 font-semibold">از 5 امتیاز</p>
                  <div className="mt-4 w-full bg-green-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-nude-500 to-nude-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${scorePercentage}%` }}
                    ></div>
                  </div>
                </div>
                <FileText className="w-16 h-16 text-nude-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Notes */}
        <Card className="border-2 border-nude-200 shadow-xl bg-white">
          <CardContent className="p-8 space-y-6">
            <h3 className="text-xl font-bold text-nude-900 mb-4">توضیحات تکمیلی</h3>
            
            <div className="space-y-3">
              <Label htmlFor="strengths" className="text-nude-900 font-bold text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                نقاط قوت:
              </Label>
              <Textarea 
                id="strengths" 
                name="strengths" 
                rows={4}
                className="border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 resize-none text-base"
                placeholder="نقاط قوت نویسنده را به تفصیل شرح دهید..."
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="improvements" className="text-nude-900 font-bold text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                نقاط قابل بهبود:
              </Label>
              <Textarea 
                id="improvements" 
                name="improvements" 
                rows={4}
                className="border-2 border-nude-300 focus:border-orange-500 focus:ring-orange-500 resize-none text-base"
                placeholder="نقاط قابل بهبود را با پیشنهادات مشخص ذکر کنید..."
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="suggestions" className="text-nude-900 font-bold text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                پیشنهادات:
              </Label>
              <Textarea 
                id="suggestions" 
                name="suggestions" 
                rows={4}
                className="border-2 border-nude-300 focus:border-blue-500 focus:ring-blue-500 resize-none text-base"
                placeholder="پیشنهادات خود برای بهبود عملکرد را بنویسید..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Bottom Actions */}
        <Card className="border-2 border-nude-200 shadow-xl bg-gradient-to-r from-nude-50 to-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <p className="text-nude-700 text-sm">
                همه فیلدهای ستاره‌دار (*) الزامی هستند
              </p>
              <div className="flex gap-4">
                <Link href="/evaluations/writer">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="border-2 border-nude-300 hover:bg-nude-100 text-nude-700 font-semibold px-8 h-12"
                  >
                    <X className="w-5 h-5 ml-2" />
                    انصراف
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-l from-nude-500 to-nude-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-10 h-12 shadow-lg shadow-nude-500/30"
                >
                  <Save className="w-5 h-5 ml-2" />
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
