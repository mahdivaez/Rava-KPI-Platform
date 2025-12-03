"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Save, X, Edit2 } from "lucide-react"
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
      <Button
        onClick={() => setIsEditing(true)}
        variant="outline"
        className="w-full border-nude-300 hover:bg-nude-100 h-10"
      >
        <Edit2 className="w-4 h-4 ml-2" />
        ویرایش اطلاعات
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-nude-700">نام</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="نام"
            required
            className="border-nude-300 focus:border-nude-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-nude-700">نام خانوادگی</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="نام خانوادگی"
            required
            className="border-nude-300 focus:border-nude-500"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-nude-700">ایمیل</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="email@example.com"
          required
          className="border-nude-300 focus:border-nude-500"
          dir="ltr"
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-nude-500 hover:bg-nude-600 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              در حال ذخیره...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 ml-2" />
              ذخیره تغییرات
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
  )
}
