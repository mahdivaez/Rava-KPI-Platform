"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Plus, Calculator, TrendingUp } from "lucide-react"

// Evaluation metrics with descriptions
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

export function CreateStrategistEvaluationDialog({ strategists }: { strategists: User[] }) {
  const [open, setOpen] = useState(false)
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

  // Update score
  const handleScoreChange = (key: string, value: string) => {
    const numValue = parseInt(value) || 0
    if (numValue >= 1 && numValue <= 5) {
      setScores(prev => ({ ...prev, [key]: numValue }))
    }
  }

  // Update note
  const handleNoteChange = (key: string, value: string) => {
    setNotes(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    // Validate all scores are filled
    const missingScores = STRATEGIST_METRICS.filter(m => !scores[m.key])
    if (missingScores.length > 0) {
      toast.error(`لطفاً امتیاز ${missingScores[0].title} را وارد کنید`)
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    // Convert 1-5 scores to 1-10 for database (multiply by 2)
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
        setOpen(false)
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-nude-600 hover:bg-nude-700 text-white">
          <Plus className="h-4 w-4 ml-2" />
          ارزیابی جدید
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-nude-50 to-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Section */}
          <div className="bg-white border-2 border-nude-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-nude-500 to-nude-600 flex items-center justify-center shadow-md">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-nude-900">ارزیابی عملکرد استراتژیست‌ها</h2>
                <p className="text-nude-600 text-sm mt-0.5">فرم ارزیابی ماهانه عملکرد</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="strategistId" className="text-nude-700 font-semibold text-sm">
                  نام استراتژیست:
                </Label>
                <Select name="strategistId" required>
                  <SelectTrigger className="border-nude-300 focus:border-nude-500 focus:ring-nude-500">
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
                <Label htmlFor="month" className="text-nude-700 font-semibold text-sm">
                  ماه:
                </Label>
                <Select name="month" defaultValue={currentMonth.toString()} required>
                  <SelectTrigger className="border-nude-300 focus:border-nude-500 focus:ring-nude-500">
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
                <Label htmlFor="year" className="text-nude-700 font-semibold text-sm">
                  سال:
                </Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  min="2020"
                  max="2100"
                  defaultValue={currentYear}
                  className="border-nude-300 focus:border-nude-500 focus:ring-nude-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-nude-700 font-semibold text-sm">
                  بازهٔ زمانی ارزیابی:
                </Label>
                <div className="h-10 flex items-center px-3 bg-nude-100 border border-nude-300 rounded-lg text-sm text-nude-700 font-medium">
                  ماهانه
                </div>
              </div>
            </div>
          </div>

          {/* Evaluation Table */}
          <Card className="border-2 border-nude-200 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-l from-blue-500 to-blue-600">
                    <th className="text-right p-4 text-white font-bold border-l border-blue-400 w-[20%]">
                      شاخص ارزیابی
                    </th>
                    <th className="text-right p-4 text-white font-bold border-l border-blue-400 w-[35%]">
                      توضیح
                    </th>
                    <th className="text-center p-4 text-white font-bold border-l border-blue-400 w-[15%]">
                      امتیاز از 1 تا 5
                    </th>
                    <th className="text-right p-4 text-white font-bold w-[30%]">
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
                      } hover:bg-nude-100/50 transition-colors`}
                    >
                      <td className="p-4 border-l border-t border-nude-200">
                        <span className="font-bold text-nude-900 text-sm leading-relaxed">
                          {metric.title}
                        </span>
                      </td>
                      <td className="p-4 border-l border-t border-nude-200">
                        <span className="text-nude-700 text-sm leading-relaxed">
                          {metric.description}
                        </span>
                      </td>
                      <td className="p-4 border-l border-t border-nude-200">
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={scores[metric.key] || ''}
                          onChange={(e) => handleScoreChange(metric.key, e.target.value)}
                          className="w-20 mx-auto text-center font-bold text-lg border-2 border-nude-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="1-5"
                          required
                        />
                      </td>
                      <td className="p-4 border-t border-nude-200">
                        <Input
                          type="text"
                          value={notes[metric.key] || ''}
                          onChange={(e) => handleNoteChange(metric.key, e.target.value)}
                          className="w-full border-nude-300 focus:border-nude-500 focus:ring-nude-500 text-sm"
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
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-2 border-nude-300 bg-gradient-to-br from-nude-100 to-white shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-nude-700 font-semibold text-sm mb-1">امتیاز کل استراتژیست:</p>
                    <p className="text-3xl font-bold text-nude-900">
                      {totalScore} <span className="text-lg text-nude-600">از {maxTotalScore} امتیاز</span>
                    </p>
                  </div>
                  <Calculator className="w-12 h-12 text-nude-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-700 font-semibold text-sm mb-1">میانگین نهایی:</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {averageScore} <span className="text-lg text-blue-600">از 5 امتیاز</span>
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Notes */}
          <Card className="border-2 border-nude-200 shadow-md">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="strengths" className="text-nude-900 font-bold text-sm">
                  نقاط قوت:
                </Label>
                <Textarea 
                  id="strengths" 
                  name="strengths" 
                  rows={3}
                  className="border-nude-300 focus:border-nude-500 focus:ring-nude-500 resize-none"
                  placeholder="نقاط قوت استراتژیست را شرح دهید..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="improvements" className="text-nude-900 font-bold text-sm">
                  نقاط قابل بهبود:
                </Label>
                <Textarea 
                  id="improvements" 
                  name="improvements" 
                  rows={3}
                  className="border-nude-300 focus:border-nude-500 focus:ring-nude-500 resize-none"
                  placeholder="نقاط قابل بهبود را ذکر کنید..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="suggestions" className="text-nude-900 font-bold text-sm">
                  پیشنهادات:
                </Label>
                <Textarea 
                  id="suggestions" 
                  name="suggestions" 
                  rows={3}
                  className="border-nude-300 focus:border-nude-500 focus:ring-nude-500 resize-none"
                  placeholder="پیشنهادات خود را بنویسید..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-2 border-nude-300 hover:bg-nude-100 text-nude-700 font-semibold px-8"
            >
              انصراف
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 shadow-md"
            >
              {loading ? "در حال ثبت..." : "ثبت ارزیابی"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

