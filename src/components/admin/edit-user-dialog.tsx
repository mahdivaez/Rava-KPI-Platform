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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function EditUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      id: user.id,
      email: formData.get("email"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      password: formData.get("password") || undefined,
      isAdmin: formData.get("isAdmin") === "on",
      isTechnicalDeputy: formData.get("isTechnicalDeputy") === "on",
      isActive: formData.get("isActive") === "on",
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast.success("کاربر با موفقیت ویرایش شد")
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error("خطا در ویرایش کاربر")
      }
    } catch (error) {
      toast.error("خطای سرور")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md mx-2 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">ویرایش کاربر</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            اطلاعات کاربر را ویرایش کنید
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input id="email" name="email" type="email" defaultValue={user.email} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">نام</Label>
              <Input id="firstName" name="firstName" defaultValue={user.firstName} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">نام خانوادگی</Label>
              <Input id="lastName" name="lastName" defaultValue={user.lastName} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">رمز عبور جدید (اختیاری)</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="برای تغییر وارد کنید"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAdmin"
                name="isAdmin"
                defaultChecked={user.isAdmin}
                className="h-4 w-4"
              />
              <Label htmlFor="isAdmin" className="cursor-pointer">مدیر سیستم</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isTechnicalDeputy"
                name="isTechnicalDeputy"
                defaultChecked={user.isTechnicalDeputy}
                className="h-4 w-4"
              />
              <Label htmlFor="isTechnicalDeputy" className="cursor-pointer">
                معاون فنی
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                defaultChecked={user.isActive}
                className="h-4 w-4"
              />
              <Label htmlFor="isActive" className="cursor-pointer">فعال</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              انصراف
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "در حال ویرایش..." : "ذخیره تغییرات"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

