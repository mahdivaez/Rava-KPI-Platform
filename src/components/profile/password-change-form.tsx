"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Lock, Save, X, KeyRound } from "lucide-react"
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
        description: "رمز عبور باید حداقل 6 کاراکتر باشد"
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
      <Button
        onClick={() => setIsEditing(true)}
        variant="outline"
        className="w-full border-nude-300 hover:bg-nude-100 h-10"
      >
        <KeyRound className="w-4 h-4 ml-2" />
        تغییر رمز عبور
      </Button>
    )
  }

  return (
    <Card className="border-nude-200">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg text-nude-900">تغییر رمز عبور</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          رمز عبور فعلی را وارد کنید و رمز جدید را مشخص کنید
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-nude-700">
              رمز عبور فعلی
            </Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              placeholder="رمز عبور فعلی"
              required
              className="border-nude-300 focus:border-nude-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-nude-700">
              رمز عبور جدید
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="رمز عبور جدید (حداقل 6 کاراکتر)"
              required
              minLength={6}
              className="border-nude-300 focus:border-nude-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-nude-700">
              تکرار رمز عبور جدید
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="تکرار رمز عبور جدید"
              required
              className="border-nude-300 focus:border-nude-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-nude-500 hover:bg-nude-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  در حال تغییر...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 ml-2" />
                  تغییر رمز عبور
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="border-nude-300 hover:bg-nude-100"
            >
              <X className="w-4 h-4 ml-2" />
              انصراف
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
