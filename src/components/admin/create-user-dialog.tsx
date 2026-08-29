"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { CheckboxField } from "@/components/ui/checkbox-field"
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
          <Plus className="size-4" />
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
              placeholder="حداقل ۶ کاراکتر"
            />
          </div>
          <fieldset className="space-y-1 rounded-xl border border-border bg-surface-sunken p-3">
            <legend className="sr-only">سطح دسترسی</legend>
            <CheckboxField
              id="isAdmin"
              label="مدیر سیستم"
              hint="دسترسی کامل به همه بخش‌ها"
            />
            <CheckboxField
              id="isTechnicalDeputy"
              label="معاون فنی"
              hint="ثبت ارزیابی استراتژیست‌ها"
            />
          </fieldset>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button type="submit" loading={loading}>
              ایجاد کاربر
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
