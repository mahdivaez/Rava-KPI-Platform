"use client"

import { useState } from "react"
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
import { useRouter } from "next/navigation"
import { Plus, Loader2 } from "lucide-react"

interface CreateTaskDialogProps {
  writers: Array<{ id: string; firstName: string; lastName: string }>
  workgroups: Array<{ id: string; name: string }>
  strategistId: string
}

export function CreateTaskDialog({ writers, workgroups, strategistId }: CreateTaskDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      priority: formData.get("priority") as string,
      dueDate: formData.get("dueDate") as string || null,
      assignedTo: formData.get("assignedTo") as string,
      workgroupId: formData.get("workgroupId") as string || null,
      createdBy: strategistId,
    }

    try {
      const response = await fetch("/api/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error()

      toast.success("موفق", {
        description: "وظیفه با موفقیت ایجاد شد",
      })
      
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("خطا", {
        description: "خطا در ایجاد وظیفه",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-nude-500 hover:bg-nude-600 text-white">
          <Plus className="w-4 h-4 ml-2" />
          وظیفه جدید
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-card border-nude-200">
        <DialogHeader>
          <DialogTitle className="text-nude-900">ایجاد وظیفه جدید</DialogTitle>
          <DialogDescription>تخصیص وظیفه به نویسنده</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">عنوان وظیفه</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="مثال: نوشتن مقاله درباره..."
              className="bg-nude-50 border-nude-200"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">توضیحات</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="جزئیات وظیفه..."
              className="bg-nude-50 border-nude-200"
              rows={3}
            />
          </div>

          {/* Writer Selection */}
          <div className="space-y-2">
            <Label htmlFor="assignedTo">نویسنده</Label>
            <Select name="assignedTo" required>
              <SelectTrigger className="bg-nude-50 border-nude-200">
                <SelectValue placeholder="انتخاب نویسنده" />
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

          {/* Workgroup (optional) */}
          <div className="space-y-2">
            <Label htmlFor="workgroupId">کارگروه (اختیاری)</Label>
            <Select name="workgroupId">
              <SelectTrigger className="bg-nude-50 border-nude-200">
                <SelectValue placeholder="بدون کارگروه" />
              </SelectTrigger>
              <SelectContent>
                {workgroups.map((wg) => (
                  <SelectItem key={wg.id} value={wg.id}>
                    {wg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">اولویت</Label>
              <Select name="priority" defaultValue="MEDIUM">
                <SelectTrigger className="bg-nude-50 border-nude-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">کم</SelectItem>
                  <SelectItem value="MEDIUM">متوسط</SelectItem>
                  <SelectItem value="HIGH">بالا</SelectItem>
                  <SelectItem value="URGENT">فوری</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">مهلت</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                className="bg-nude-50 border-nude-200"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-nude-500 hover:bg-nude-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  در حال ایجاد...
                </>
              ) : (
                "ایجاد وظیفه"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

