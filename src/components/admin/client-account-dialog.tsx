"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { CheckboxField } from "@/components/ui/checkbox-field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label, RequiredMark } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface ClientAccountFormValues {
  id: string
  email: string
  contactName: string
  brandName: string
  workgroupId: string
  isActive: boolean
}

export interface WorkgroupOption {
  id: string
  name: string
}

/**
 * Create or edit a client account.
 *
 * The greeting fields are the point of this dialog: the admin writes the exact
 * sentence the client will read, and the preview underneath renders it with the
 * tokens already substituted, so nobody has to log in as the client to check.
 */
export function ClientAccountDialog({
  mode,
  client,
  workgroups,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit"
  client?: ClientAccountFormValues
  workgroups: WorkgroupOption[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [contactName, setContactName] = useState(client?.contactName ?? "")
  const [brandName, setBrandName] = useState(client?.brandName ?? "")
  const [workgroupId, setWorkgroupId] = useState(client?.workgroupId ?? "")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!workgroupId) {
      toast.error("لطفاً کارگروه را انتخاب کنید")
      return
    }

    const formData = new FormData(e.currentTarget)
    const password = String(formData.get("password") ?? "")

    if (mode === "create" && password.length < 6) {
      toast.error("رمز عبور باید حداقل ۶ کاراکتر باشد")
      return
    }
    if (mode === "edit" && password && password.length < 6) {
      toast.error("رمز عبور باید حداقل ۶ کاراکتر باشد")
      return
    }

    setLoading(true)

    const payload: Record<string, unknown> = {
      email: String(formData.get("email") ?? "").trim(),
      contactName: contactName.trim(),
      brandName: brandName.trim(),
      workgroupId,
      isActive: formData.get("isActive") === "on",
    }

    if (mode === "edit") payload.id = client?.id
    if (password) payload.password = password

    try {
      const res = await fetch("/api/admin/clients", {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(
          mode === "create" ? "حساب مشتری ساخته شد" : "حساب مشتری ویرایش شد"
        )
        onOpenChange(false)
        router.refresh()
      } else {
        const result = await res.json()
        toast.error(result.error || "خطا در ذخیره حساب مشتری")
      }
    } catch {
      toast.error("خطای سرور")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "حساب مشتری جدید" : "ویرایش حساب مشتری"}
          </DialogTitle>
          <DialogDescription>
            مشتری با این حساب وارد /client/login می‌شود و فقط اعضای کارگروه
            انتخاب‌شده را ارزیابی می‌کند. نام مخاطب، همان نامی است که در
            داشبورد به او خوش‌آمد گفته می‌شود.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ca-contactName">
                نام مخاطب <RequiredMark />
              </Label>
              <Input
                id="ca-contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="مهدی"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ca-brandName">
                نام برند <RequiredMark />
              </Label>
              <Input
                id="ca-brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="نام شرکت یا برند"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ca-email">
                ایمیل ورود <RequiredMark />
              </Label>
              <Input
                id="ca-email"
                name="email"
                type="email"
                dir="ltr"
                className="text-start"
                defaultValue={client?.email ?? ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ca-password">
                رمز عبور {mode === "create" && <RequiredMark />}
              </Label>
              <Input
                id="ca-password"
                name="password"
                type="text"
                dir="ltr"
                className="text-start"
                autoComplete="new-password"
                placeholder={
                  mode === "edit" ? "برای تغییر ندادن، خالی بگذارید" : "حداقل ۶ کاراکتر"
                }
                required={mode === "create"}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ca-workgroup">
                کارگروه <RequiredMark />
              </Label>
              <Select value={workgroupId} onValueChange={setWorkgroupId}>
                <SelectTrigger id="ca-workgroup">
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {workgroups.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <CheckboxField
            id="isActive"
            label="حساب فعال"
            hint="حساب‌های غیرفعال نمی‌توانند وارد شوند"
            defaultChecked={client?.isActive ?? true}
            className="border border-border bg-surface-sunken"
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              انصراف
            </Button>
            <Button type="submit" loading={loading}>
              {mode === "create" ? "ساخت حساب" : "ذخیره تغییرات"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
