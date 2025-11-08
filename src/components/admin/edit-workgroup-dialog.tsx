"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Workgroup } from "@prisma/client"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function EditWorkgroupDialog({
  workgroup,
  open,
  onOpenChange,
}: {
  workgroup: Workgroup
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
      id: workgroup.id,
      name: formData.get("name"),
      description: formData.get("description"),
      isActive: formData.get("isActive") === "on",
    }

    try {
      const res = await fetch("/api/admin/workgroups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast.success("کارگروه با موفقیت ویرایش شد")
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error("خطا در ویرایش کارگروه")
      }
    } catch (error) {
      toast.error("خطای سرور")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ویرایش کارگروه</DialogTitle>
          <DialogDescription>
            اطلاعات کارگروه را ویرایش کنید
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">نام کارگروه</Label>
            <Input id="name" name="name" defaultValue={workgroup.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">توضیحات</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={workgroup.description || ""}
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              defaultChecked={workgroup.isActive}
              className="h-4 w-4"
            />
            <Label htmlFor="isActive" className="cursor-pointer">فعال</Label>
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

