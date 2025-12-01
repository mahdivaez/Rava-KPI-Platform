"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Workgroup, WorkgroupMember, User } from "@prisma/client"
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
import { toast } from "sonner"
import { Plus } from "lucide-react"
import moment from 'moment-jalaali'

type WorkgroupWithMembers = Workgroup & {
  members: (WorkgroupMember & { user: User })[]
}

export function CreateFeedbackDialog({
  workgroups,
}: {
  workgroups: WorkgroupWithMembers[]
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedWorkgroup, setSelectedWorkgroup] = useState("")
  const router = useRouter()

  const currentPersian = moment()
  const currentPersianMonth = currentPersian.jMonth() + 1
  const currentPersianYear = currentPersian.jYear()
  const effectiveCurrentMonth = Math.min(currentPersianMonth, 11)

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
    ? workgroups.find((w) => w.id === selectedWorkgroup)?.members.map((m) => m.user) || []
    : []

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      strategistId: formData.get("strategistId"),
      workgroupId: formData.get("workgroupId"),
      month: parseInt(formData.get("month") as string),
      year: parseInt(formData.get("year") as string),
      communication: parseInt(formData.get("communication") as string),
      supportLevel: parseInt(formData.get("supportLevel") as string),
      clarityOfTasks: parseInt(formData.get("clarityOfTasks") as string),
      feedbackQuality: parseInt(formData.get("feedbackQuality") as string),
      positivePoints: formData.get("positivePoints") || undefined,
      improvements: formData.get("improvements") || undefined,
      suggestions: formData.get("suggestions") || undefined,
    }

    try {
      const res = await fetch("/api/feedback/writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast.success("بازخورد با موفقیت ارسال شد")
        setOpen(false)
        setSelectedWorkgroup("")
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          بازخورد جدید
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ارسال بازخورد به استراتژیست</DialogTitle>
          <DialogDescription>
            فرم بازخورد ماهانه را تکمیل کنید (امتیاز 1 تا 10)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workgroupId">کارگروه</Label>
              <Select
                name="workgroupId"
                value={selectedWorkgroup}
                onValueChange={setSelectedWorkgroup}
                required
              >
                <SelectTrigger>
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
              <Label htmlFor="strategistId">استراتژیست</Label>
              <Select name="strategistId" required disabled={!selectedWorkgroup}>
                <SelectTrigger>
                  <SelectValue placeholder="ابتدا کارگروه را انتخاب کنید" />
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">ماه</Label>
              <Select name="month" defaultValue={effectiveCurrentMonth.toString()} required>
                <SelectTrigger className="border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 bg-nude-50">
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
                className="border-2 border-nude-300 focus:border-nude-500 focus:ring-nude-500 bg-nude-50 text-nude-700 font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="communication">ارتباطات (1-10)</Label>
              <Input
                id="communication"
                name="communication"
                type="number"
                min="1"
                max="10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportLevel">سطح پشتیبانی (1-10)</Label>
              <Input
                id="supportLevel"
                name="supportLevel"
                type="number"
                min="1"
                max="10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clarityOfTasks">وضوح وظایف (1-10)</Label>
              <Input
                id="clarityOfTasks"
                name="clarityOfTasks"
                type="number"
                min="1"
                max="10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedbackQuality">کیفیت بازخورد (1-10)</Label>
              <Input
                id="feedbackQuality"
                name="feedbackQuality"
                type="number"
                min="1"
                max="10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="positivePoints">نقاط مثبت</Label>
            <Textarea id="positivePoints" name="positivePoints" rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="improvements">نقاط قابل بهبود</Label>
            <Textarea id="improvements" name="improvements" rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggestions">پیشنهادات</Label>
            <Textarea id="suggestions" name="suggestions" rows={3} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "در حال ارسال..." : "ارسال بازخورد"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

