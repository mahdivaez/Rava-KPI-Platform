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

interface CreateGoalDialogProps {
  users: Array<{ id: string; firstName: string; lastName: string }>
  workgroups: Array<{ id: string; name: string }>
  adminId: string
}

export function CreateGoalDialog({ users, workgroups, adminId }: CreateGoalDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [goalType, setGoalType] = useState<string>("INDIVIDUAL_BLOGGER")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: goalType,
      targetValue: parseFloat(formData.get("targetValue") as string),
      unit: formData.get("unit") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      userId: formData.get("userId") as string || null,
      workgroupId: formData.get("workgroupId") as string || null,
      assignedBy: adminId,
    }

    try {
      const response = await fetch("/api/admin/goals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to create goal")

      toast.success("موفق", {
        description: "هدف با موفقیت ایجاد شد",
      })
      
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("خطا", {
        description: "خطا در ایجاد هدف",
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
          هدف جدید
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-nude-200">
        <DialogHeader>
          <DialogTitle className="text-nude-900">ایجاد هدف جدید</DialogTitle>
          <DialogDescription>تعیین هدف برای کاربران، تیم‌ها یا شرکت</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Goal Type */}
          <div className="space-y-2">
            <Label htmlFor="type">نوع هدف</Label>
            <Select value={goalType} onValueChange={setGoalType}>
              <SelectTrigger className="bg-nude-50 border-nude-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INDIVIDUAL_BLOGGER">فردی - بلاگر</SelectItem>
                <SelectItem value="INDIVIDUAL_BUSINESS">فردی - بیزینس</SelectItem>
                <SelectItem value="TEAM">تیمی</SelectItem>
                <SelectItem value="COMPANY">شرکت</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">عنوان هدف</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="مثال: افزایش بازدید ماهانه"
              className="bg-nude-50 border-nude-200"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">توضیحات</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="جزئیات بیشتر درباره این هدف..."
              className="bg-nude-50 border-nude-200"
              rows={3}
            />
          </div>

          {/* Target & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetValue">مقدار هدف</Label>
              <Input
                id="targetValue"
                name="targetValue"
                type="number"
                step="0.01"
                required
                placeholder="1000"
                className="bg-nude-50 border-nude-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">واحد</Label>
              <Input
                id="unit"
                name="unit"
                required
                placeholder="بازدید، پست، تومان"
                className="bg-nude-50 border-nude-200"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">تاریخ شروع</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                className="bg-nude-50 border-nude-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">تاریخ پایان</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                required
                className="bg-nude-50 border-nude-200"
              />
            </div>
          </div>

          {/* User Selection (for individual goals) */}
          {(goalType === "INDIVIDUAL_BLOGGER" || goalType === "INDIVIDUAL_BUSINESS") && (
            <div className="space-y-2">
              <Label htmlFor="userId">انتخاب کاربر</Label>
              <Select name="userId" required>
                <SelectTrigger className="bg-nude-50 border-nude-200">
                  <SelectValue placeholder="یک کاربر انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Workgroup Selection (for team goals) */}
          {goalType === "TEAM" && (
            <div className="space-y-2">
              <Label htmlFor="workgroupId">انتخاب کارگروه</Label>
              <Select name="workgroupId" required>
                <SelectTrigger className="bg-nude-50 border-nude-200">
                  <SelectValue placeholder="یک کارگروه انتخاب کنید" />
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
          )}

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
                "ایجاد هدف"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

