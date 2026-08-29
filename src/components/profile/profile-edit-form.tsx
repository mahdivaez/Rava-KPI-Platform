"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Save, X, Edit2, User, Mail } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProfileEditFormProps {
  userId: string
  firstName: string
  lastName: string
  email: string
}

export function ProfileEditForm({ userId, firstName, lastName, email }: ProfileEditFormProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName,
    lastName,
    email,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'خطا در بروزرسانی پروفایل')
      }

      toast.success("موفق", {
        description: "اطلاعات پروفایل با موفقیت بروزرسانی شد"
      })
      
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      toast.error("خطا", {
        description: error instanceof Error ? error.message : "خطا در بروزرسانی پروفایل"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ firstName, lastName, email })
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-surface-sunken rounded-full flex items-center justify-center mb-4">
          <Edit2 className="w-8 h-8 text-foreground-muted" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">آماده برای ویرایش</h3>
        <p className="text-foreground-muted mb-6">برای تغییر اطلاعات شخصی خود، روی دکمه زیر کلیک کنید</p>
        <Button
          onClick={() => setIsEditing(true)}
          
        >
          <Edit2 className="size-4" />
          ویرایش اطلاعات
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="text-center p-6 bg-surface-sunken rounded-xl border border-border">
        <div className="w-12 h-12 bg-surface-sunken rounded-full flex items-center justify-center mx-auto mb-3">
          <Edit2 className="w-6 h-6 text-foreground-muted" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">ویرایش اطلاعات</h3>
        <p className="text-sm text-foreground-muted">اطلاعات جدید را وارد کنید و ذخیره کنید</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-semibold text-foreground-secondary flex items-center gap-2">
              <User className="w-4 h-4 text-foreground-muted" />
              نام
            </Label>
            <div className="relative">
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="نام خود را وارد کنید"
                required
                
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-semibold text-foreground-secondary flex items-center gap-2">
              <User className="w-4 h-4 text-foreground-muted" />
              نام خانوادگی
            </Label>
            <div className="relative">
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="نام خانوادگی خود را وارد کنید"
                required
                
              />
            </div>
          </div>
        </div>
        
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-foreground-secondary flex items-center gap-2">
            <Mail className="w-4 h-4 text-foreground-muted" />
            ایمیل
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              required
              
              dir="ltr"
            />
          </div>
          <p className="text-xs text-foreground-subtle mt-1">ایمیل شما برای ورود به سیستم استفاده می‌شود</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                در حال ذخیره…
              </>
            ) : (
              <>
                <Save className="w-5 h-5 ml-2" />
                ذخیره تغییرات
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="h-12 px-8 border-border-strong hover:bg-surface-hover text-foreground-secondary font-medium rounded-xl transition-all duration-200"
          >
            <X className="w-5 h-5 ml-2" />
            انصراف
          </Button>
        </div>
      </form>
    </div>
  )
}
