"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Lock, Save, X, KeyRound, Shield, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface PasswordChangeFormProps {
  userId: string
}

export function PasswordChangeForm({ userId }: PasswordChangeFormProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate password match
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("خطا", {
        description: "رمز عبور جدید و تکرار آن مطابقت ندارند"
      })
      return
    }

    // Validate password length
    if (formData.newPassword.length < 6) {
      toast.error("خطا", {
        description: "رمز عبور باید حداقل ۶ کاراکتر باشد"
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'خطا در تغییر رمز عبور')
      }

      toast.success("موفق", {
        description: data.message || "رمز عبور با موفقیت تغییر کرد"
      })
      
      setIsEditing(false)
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      router.refresh()
    } catch (error) {
      toast.error("خطا", {
        description: error instanceof Error ? error.message : "خطا در تغییر رمز عبور"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-surface-sunken rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-foreground-muted" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">امنیت حساب</h3>
        <p className="text-foreground-muted mb-6">برای افزایش امنیت حساب خود، رمز عبور را تغییر دهید</p>
        <Button
          onClick={() => setIsEditing(true)}
          
        >
          <KeyRound className="size-4" />
          تغییر رمز عبور
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <div className="p-4 bg-warning-subtle border border-border rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">نکات امنیتی</h4>
            <ul className="text-xs text-warning space-y-1">
              <li>• از رمز عبور قوی با ترکیب حروف، اعداد و علائم استفاده کنید</li>
              <li>• رمز عبور خود را با کسی به اشتراک نگذارید</li>
              <li>• رمز عبور را به طور منظم تغییر دهید</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form Header */}
      <div className="text-center p-6 bg-surface-sunken rounded-xl border border-border">
        <div className="w-12 h-12 bg-surface-sunken rounded-full flex items-center justify-center mx-auto mb-3">
          <KeyRound className="w-6 h-6 text-foreground-muted" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">تغییر رمز عبور</h3>
        <p className="text-sm text-foreground-muted">رمز عبور جدید را با دقت وارد کنید</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div className="space-y-2">
          <Label htmlFor="currentPassword" className="text-sm font-semibold text-foreground-secondary flex items-center gap-2">
            <Lock className="w-4 h-4 text-foreground-muted" />
            رمز عبور فعلی
          </Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              placeholder="رمز عبور فعلی خود را وارد کنید"
              required
              className="pe-12"
            />
            <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground-subtle" />
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-semibold text-foreground-secondary flex items-center gap-2">
            <Shield className="w-4 h-4 text-foreground-muted" />
            رمز عبور جدید
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="رمز عبور جدید (حداقل ۶ کاراکتر)"
              required
              minLength={6}
              className="pe-12"
            />
            <Shield className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground-subtle" />
          </div>
          {formData.newPassword && (
            <div className="text-xs">
              {formData.newPassword.length < 6 ? (
                <span className="text-danger">رمز عبور باید حداقل ۶ کاراکتر باشد</span>
              ) : formData.newPassword.length < 8 ? (
                <span className="text-warning">رمز عبور متوسط</span>
              ) : (
                <span className="text-success">رمز عبور قوی</span>
              )}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground-secondary flex items-center gap-2">
            <Lock className="w-4 h-4 text-foreground-muted" />
            تکرار رمز عبور جدید
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="تکرار رمز عبور جدید را وارد کنید"
              required
              className={`pe-12 ${
                formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                  ? 'border-danger focus:border-danger focus:ring-danger/20'
                  : 'border-border-strong focus:border-primary'
              }`}
            />
            <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground-subtle" />
          </div>
          {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
            <span className="text-xs text-danger">رمز عبور جدید و تکرار آن مطابقت ندارند</span>
          )}
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
                در حال تغییر...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 ml-2" />
                تغییر رمز عبور
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
