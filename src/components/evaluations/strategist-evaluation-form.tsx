"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User } from "@prisma/client"
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
import { Calculator, TrendingUp, ChevronRight, Save, X } from "lucide-react"
import Link from "next/link"

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
  const [loading, setLoading] = useState(false)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const router = useRouter()

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  // Calculate total and average
  const totalScore = Object.values(scores).reduce((sum, score) => sum + (score || 0), 0)
  const maxTotalScore = STRATEGIST_METRICS.length * 5
  const averageScore = STRATEGIST_METRICS.length > 0 
    ? (totalScore / STRATEGIST_METRICS.length).toFixed(2) 
    : '0.00'

  // Score percentage for progress
  const scorePercentage = maxTotalScore > 0 ? (totalScore / maxTotalScore) * 100 : 0

  // Update score
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

  // Update note
  const handleNoteChange = (key: string, value: string) => {
    setNotes(prev => ({ ...prev, [key]: value }))
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

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-nude-600">
        <Link href="/dashboard" className="hover:text-nude-900 transition-colors">
          داشبورد
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/evaluations/strategist" className="hover:text-nude-900 transition-colors">
          ارزیابی استراتژیست‌ها
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
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-nude-900">ارزیابی عملکرد استراتژیست‌ها</h1>
                  <p className="text-nude-600 text-base mt-1">فرم ارزیابی ماهانه عملکرد و شاخص‌های کلیدی</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/evaluations/strategist">
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
                  className="bg-gradient-to-l from-nude-500 to-nude-600 hover:from-nude-600 hover:to-nude-700 text-white font-semibold px-8 shadow-lg shadow-nude-500/30"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {loading ? "در حال ثبت..." : "ثبت ارزیابی"}
                </Button>
              </div>
            </div>

            {/* Metadata Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gradient-to-br from-nude-50 to-nude-100/50 rounded-xl border border-nude-200">
              <div className="space-y-2">
                <Label htmlFor="strategistId" className="text-nude-900 font-bold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nude-500"></span>
                  نام استراتژیست:
                </Label>
                <Select name="strategistId" required>
                  <SelectTrigger className="h-12 border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 bg-white">
                    <SelectValue placeholder="انتخاب کنید" />
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

              <div className="space-y-2">
                <Label htmlFor="month" className="text-nude-900 font-bold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nude-500"></span>
                  ماه:
                </Label>
                <Select name="month" defaultValue={currentMonth.toString()} required>
                  <SelectTrigger className="h-12 border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(12)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
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
                  min="2020"
                  max="2100"
                  defaultValue={currentYear}
                  className="h-12 border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 bg-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-nude-900 font-bold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nude-500"></span>
                  بازهٔ زمانی ارزیابی:
                </Label>
                <div className="h-12 flex items-center px-4 bg-nude-100 border-2 border-nude-300 rounded-lg text-sm text-nude-700 font-bold">
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
                {STRATEGIST_METRICS.map((metric, index) => (
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
                  <p className="text-nude-700 font-bold text-base mb-2">امتیاز کل استراتژیست:</p>
                  <p className="text-5xl font-bold text-nude-900 mb-2">
                    {totalScore}
                  </p>
                  <p className="text-nude-600 font-semibold">از {maxTotalScore} امتیاز</p>
                  {/* Progress bar */}
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

          <Card className="border-2 border-nude-300 bg-gradient-to-br from-white to-nude-50 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <p className="text-nude-700 font-bold text-base mb-2">میانگین نهایی:</p>
                  <p className="text-5xl font-bold text-nude-900 mb-2">
                    {averageScore}
                  </p>
                  <p className="text-nude-600 font-semibold">از 5 امتیاز</p>
                  {/* Progress bar */}
                  <div className="mt-4 w-full bg-nude-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-nude-500 to-nude-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${scorePercentage}%` }}
                    ></div>
                  </div>
                </div>
                <TrendingUp className="w-16 h-16 text-nude-500 ml-4" />
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
                className="border-2 border-nude-300 focus:border-green-500 focus:ring-green-500 resize-none text-base"
                placeholder="نقاط قوت استراتژیست را به تفصیل شرح دهید..."
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
                <span className="w-2 h-2 rounded-full bg-nude-500"></span>
                پیشنهادات:
              </Label>
              <Textarea 
                id="suggestions" 
                name="suggestions" 
                rows={4}
                className="border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 resize-none text-base"
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
                <Link href="/evaluations/strategist">
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
                  className="bg-gradient-to-l from-nude-500 to-nude-600 hover:from-nude-600 hover:to-nude-700 text-white font-semibold px-10 h-12 shadow-lg shadow-nude-500/30"
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

