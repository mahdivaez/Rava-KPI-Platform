"use client"

import { useState } from "react"
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
import { toast } from "sonner"
import { Plus } from "lucide-react"

export function CreateStrategistEvaluationDialog({ strategists }: { strategists: User[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      strategistId: formData.get("strategistId"),
      month: parseInt(formData.get("month") as string),
      year: parseInt(formData.get("year") as string),
      ideation: parseInt(formData.get("ideation") as string),
      avgViews: parseInt(formData.get("avgViews") as string),
      qualityControl: parseInt(formData.get("qualityControl") as string),
      teamRelations: parseInt(formData.get("teamRelations") as string),
      clientRelations: parseInt(formData.get("clientRelations") as string),
      responsiveness: parseInt(formData.get("responsiveness") as string),
      clientSatisfaction: parseInt(formData.get("clientSatisfaction") as string),
      strengths: formData.get("strengths") || undefined,
      improvements: formData.get("improvements") || undefined,
      suggestions: formData.get("suggestions") || undefined,
      evaluatorNotes: formData.get("evaluatorNotes") || undefined,
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
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          ارزیابی جدید
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ثبت ارزیابی استراتژیست</DialogTitle>
          <DialogDescription>
            فرم ارزیابی ماهانه استراتژیست را تکمیل کنید (امتیاز 1 تا 10)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strategistId">استراتژیست</Label>
              <Select name="strategistId" required>
                <SelectTrigger>
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
              <Label htmlFor="ideation">ایده‌پردازی (1-10)</Label>
              <Input id="ideation" name="ideation" type="number" min="1" max="10" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avgViews">میانگین بازدید (1-10)</Label>
              <Input id="avgViews" name="avgViews" type="number" min="1" max="10" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualityControl">کنترل کیفیت (1-10)</Label>
              <Input
                id="qualityControl"
                name="qualityControl"
                type="number"
                min="1"
                max="10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamRelations">روابط تیمی (1-10)</Label>
              <Input
                id="teamRelations"
                name="teamRelations"
                type="number"
                min="1"
                max="10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientRelations">روابط با مشتری (1-10)</Label>
              <Input
                id="clientRelations"
                name="clientRelations"
                type="number"
                min="1"
                max="10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsiveness">پاسخگویی (1-10)</Label>
              <Input
                id="responsiveness"
                name="responsiveness"
                type="number"
                min="1"
                max="10"
                required
              />
            </div>
            <div className="space-y-2 col-span-2">
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

