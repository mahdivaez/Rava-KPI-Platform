"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Upload, Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProfileImageUploadProps {
  currentImage: string | null | undefined
  userId: string
}

export function ProfileImageUpload({ currentImage, userId }: ProfileImageUploadProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("خطا", {
        description: "فایل انتخابی باید یک تصویر باشد"
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("خطا", {
        description: "حجم فایل باید کمتر از 5 مگابایت باشد"
      })
      return
    }

    setIsUploading(true)

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string

        const response = await fetch('/api/profile/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, userId }),
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        toast.success("موفق", {
          description: "تصویر پروفایل با موفقیت آپلود شد"
        })
        
        router.refresh()
      }

      reader.readAsDataURL(file)
    } catch (error) {
      toast.error("خطا", {
        description: "خطا در آپلود تصویر"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!currentImage) return

    setIsDeleting(true)
    try {
      const response = await fetch('/api/profile/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      toast.success("موفق", {
        description: "تصویر پروفایل حذف شد"
      })
      
      router.refresh()
    } catch (error) {
      toast.error("خطا", {
        description: "خطا در حذف تصویر"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor="profile-upload">
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading || isDeleting}
          className="hidden"
        />
        <Button
          type="button"
          onClick={() => document.getElementById('profile-upload')?.click()}
          disabled={isUploading || isDeleting}
          className="w-full bg-nude-500 hover:bg-nude-600 text-white"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              در حال آپلود...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 ml-2" />
              آپلود تصویر
            </>
          )}
        </Button>
      </label>

      {currentImage && (
        <Button
          type="button"
          variant="outline"
          onClick={handleDelete}
          disabled={isUploading || isDeleting}
          className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          {isDeleting ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              در حال حذف...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4 ml-2" />
              حذف تصویر
            </>
          )}
        </Button>
      )}

      <p className="text-xs text-nude-600 text-center">
        حداکثر 5 مگابایت - JPG, PNG, GIF
      </p>
    </div>
  )
}

