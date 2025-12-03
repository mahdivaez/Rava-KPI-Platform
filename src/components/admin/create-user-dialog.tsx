"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { toast } from "sonner"
import { Plus } from "lucide-react"

export function CreateUserDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get("email"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      password: formData.get("password"),
      isAdmin: formData.get("isAdmin") === "on",
      isTechnicalDeputy: formData.get("isTechnicalDeputy") === "on",
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast.success("کاربر با موفقیت ایجاد شد")
        setOpen(false)
        router.refresh()
      } else {
        toast.error("خطا در ایجاد کاربر")
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
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 ml-2" />
          <span className="text-xs sm:text-sm">کاربر جدید</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-md mx-2 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">ایجاد کاربر جدید</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            اطلاعات کاربر جدید را وارد کنید
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">نام</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">نام خانوادگی</Label>
              <Input id="lastName" name="lastName" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">رمز عبور</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="حداقل 6 کاراکتر"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isAdmin" name="isAdmin" className="h-4 w-4" />
              <Label htmlFor="isAdmin" className="cursor-pointer">مدیر سیستم</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isTechnicalDeputy"
                name="isTechnicalDeputy"
                className="h-4 w-4"
              />
              <Label htmlFor="isTechnicalDeputy" className="cursor-pointer">
                معاون فنی
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "در حال ایجاد..." : "ایجاد کاربر"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

