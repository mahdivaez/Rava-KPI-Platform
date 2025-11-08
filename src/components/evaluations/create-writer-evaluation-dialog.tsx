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

type WorkgroupWithMembers = Workgroup & {
  members: (WorkgroupMember & { user: User })[]
}

export function CreateWriterEvaluationDialog({
  workgroups,
}: {
  workgroups: WorkgroupWithMembers[]
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedWorkgroup, setSelectedWorkgroup] = useState("")
  const router = useRouter()

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  const writers = selectedWorkgroup
    ? workgroups.find((w) => w.id === selectedWorkgroup)?.members.map((m) => m.user) || []
    : []

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      writerId: formData.get("writerId"),
      workgroupId: formData.get("workgroupId"),
      month: parseInt(formData.get("month") as string),
      year: parseInt(formData.get("year") as string),
      responsibility: parseInt(formData.get("responsibility") as string),
      strategistSatisfaction: parseInt(formData.get("strategistSatisfaction") as string),
      meetingEngagement: parseInt(formData.get("meetingEngagement") as string),
      scenarioPerformance: parseInt(formData.get("scenarioPerformance") as string),
      clientSatisfaction: parseInt(formData.get("clientSatisfaction") as string),
      brandAlignment: parseInt(formData.get("brandAlignment") as string),
      strengths: formData.get("strengths") || undefined,
      improvements: formData.get("improvements") || undefined,
      suggestions: formData.get("suggestions") || undefined,
      evaluatorNotes: formData.get("evaluatorNotes") || undefined,
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
        setOpen(false)
        setSelectedWorkgroup("")
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
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          ارزیابی جدید
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ثبت ارزیابی نویسنده</DialogTitle>
          <DialogDescription>
            فرم ارزیابی ماهانه نویسنده را تکمیل کنید (امتیاز 1 تا 10)
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
              <Label htmlFor="writerId">نویسنده</Label>
              <Select name="writerId" required disabled={!selectedWorkgroup}>
                <SelectTrigger>
                  <SelectValue placeholder="ابتدا کارگروه را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {writers.map((writer) => (
                    <SelectItem key={writer.id} value={writer.id}>
                      {writer.firstName} {writer.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">ماه</Label>
              <Input
                id="month"
                name="month"
                type="number"
                min="1"
                max="12"
                defaultValue={currentMonth}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">سال</Label>
              <Input
                id="year"
                name="year"
                type="number"
                min="2020"
                max="2100"
                defaultValue={currentYear}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsibility">مسئولیت‌پذیری (1-10)</Label>
              <Input
                id="responsibility"
                name="responsibility"
                type="number"
                min="1"
                max="10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="strategistSatisfaction">رضایت استراتژیست (1-10)</Label>
              <Input
                id="strategistSatisfaction"
                name="strategistSatisfaction"
                type="number"
                min="1"
                max="10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meetingEngagement">مشارکت در جلسات (1-10)</Label>
              <Input
                id="meetingEngagement"
                name="meetingEngagement"
                type="number"
                min="1"
                max="10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scenarioPerformance">عملکرد سناریو (1-10)</Label>
              <Input
                id="scenarioPerformance"
                name="scenarioPerformance"
                type="number"
                min="1"
                max="10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientSatisfaction">رضایت مشتری (1-10)</Label>
              <Input
                id="clientSatisfaction"
                name="clientSatisfaction"
                type="number"
                min="1"
                max="10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandAlignment">هماهنگی با برند (1-10)</Label>
              <Input
                id="brandAlignment"
                name="brandAlignment"
                type="number"
                min="1"
                max="10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="strengths">نقاط قوت</Label>
            <Textarea id="strengths" name="strengths" rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="improvements">نقاط قابل بهبود</Label>
            <Textarea id="improvements" name="improvements" rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggestions">پیشنهادات</Label>
            <Textarea id="suggestions" name="suggestions" rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evaluatorNotes">یادداشت ارزیاب (خصوصی)</Label>
            <Textarea id="evaluatorNotes" name="evaluatorNotes" rows={2} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "در حال ثبت..." : "ثبت ارزیابی"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

