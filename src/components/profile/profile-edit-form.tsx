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
        <div className="mx-auto w-16 h-16 bg-nude-50 rounded-full flex items-center justify-center mb-4">
          <Edit2 className="w-8 h-8 text-nude-600" />
        </div>
        <h3 className="text-lg font-semibold text-nude-900 mb-2">آماده برای ویرایش</h3>
        <p className="text-nude-600 mb-6">برای تغییر اطلاعات شخصی خود، روی دکمه زیر کلیک کنید</p>
        <Button
          onClick={() => setIsEditing(true)}
          className="bg-nude-600 hover:bg-nude-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Edit2 className="w-4 h-4 ml-2" />
          ویرایش اطلاعات
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="text-center p-6 bg-gradient-to-r from-nude-50 to-nude-100 rounded-xl border border-nude-200">
        <div className="w-12 h-12 bg-nude-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Edit2 className="w-6 h-6 text-nude-600" />
        </div>
        <h3 className="text-lg font-semibold text-nude-900 mb-1">ویرایش اطلاعات</h3>
        <p className="text-sm text-nude-600">اطلاعات جدید را وارد کنید و ذخیره کنید</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-semibold text-nude-700 flex items-center gap-2">
              <User className="w-4 h-4 text-nude-600" />
              نام
            </Label>
            <div className="relative">
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="نام خود را وارد کنید"
                required
                className="h-12 border-nude-300 focus:border-nude-500 focus:ring-nude-200 rounded-xl transition-all duration-200 text-lg"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-semibold text-nude-700 flex items-center gap-2">
              <User className="w-4 h-4 text-nude-600" />
              نام خانوادگی
            </Label>
            <div className="relative">
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="نام خانوادگی خود را وارد کنید"
                required
                className="h-12 border-nude-300 focus:border-nude-500 focus:ring-nude-200 rounded-xl transition-all duration-200 text-lg"
              />
            </div>
          </div>
        </div>
        
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-nude-700 flex items-center gap-2">
            <Mail className="w-4 h-4 text-nude-600" />
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
              className="h-12 border-nude-300 focus:border-nude-500 focus:ring-nude-200 rounded-xl transition-all duration-200 text-lg"
              dir="ltr"
            />
          </div>
          <p className="text-xs text-nude-500 mt-1">ایمیل شما برای ورود به سیستم استفاده می‌شود</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 h-12 bg-gradient-to-r from-nude-600 to-nude-700 hover:from-nude-700 hover:to-nude-800 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                در حال ذخیره...
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
            className="h-12 px-8 border-nude-300 hover:bg-nude-50 text-nude-700 font-medium rounded-xl transition-all duration-200"
          >
            <X className="w-5 h-5 ml-2" />
            انصراف
          </Button>
        </div>
      </form>
    </div>
  )
}
