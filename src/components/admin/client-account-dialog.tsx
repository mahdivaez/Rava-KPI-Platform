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
import { Textarea } from "@/components/ui/textarea"
import {
  DEFAULT_WELCOME_MESSAGE,
  DEFAULT_WELCOME_TITLE,
  GREETING_TOKENS,
  renderGreetingTemplate,
} from "@/lib/client-greeting"

export interface ClientAccountFormValues {
  id: string
  email: string
  contactName: string
  brandName: string
  greetingName: string | null
  workgroupId: string
  isActive: boolean
  welcomeTitle: string | null
  welcomeMessage: string | null
}

export interface WorkgroupOption {
  id: string
  name: string
}

/**
 * Create or edit a client account.
 *
 * Everything the client portal says to this client — except the Rava wordmark —
 * is set here: the brand headline, the contact line beneath it, the name the
 * greeting uses, and the two greeting sentences themselves. The preview renders
 * the header and the greeting exactly as the client will see them, so nobody
 * has to sign in as the client to check their own wording.
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
  const [greetingName, setGreetingName] = useState(client?.greetingName ?? "")
  const [workgroupId, setWorkgroupId] = useState(client?.workgroupId ?? "")
  const [welcomeTitle, setWelcomeTitle] = useState(client?.welcomeTitle ?? "")
  const [welcomeMessage, setWelcomeMessage] = useState(client?.welcomeMessage ?? "")

  // Placeholders stand in for empty fields so the preview never collapses.
  const previewSource = {
    contactName: contactName.trim() || "نام مخاطب",
    brandName: brandName.trim() || "نام برند",
    greetingName: greetingName.trim(),
  }
  const previewTitle = renderGreetingTemplate(
    welcomeTitle.trim() || DEFAULT_WELCOME_TITLE,
    previewSource
  )
  const previewMessage = renderGreetingTemplate(
    welcomeMessage.trim() || DEFAULT_WELCOME_MESSAGE,
    previewSource
  )

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
      greetingName,
      workgroupId,
      isActive: formData.get("isActive") === "on",
      welcomeTitle,
      welcomeMessage,
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
            انتخاب‌شده را ارزیابی می‌کند. هر متنی که در داشبورد او دیده می‌شود،
            از همین‌جا تعیین می‌شود.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* The three names, each with its own home in the portal. */}
          <div className="space-y-4 rounded-xl border border-border bg-surface-sunken p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                نام‌هایی که مشتری می‌بیند
              </p>
              <p className="mt-1 text-xs leading-relaxed text-foreground-muted">
                سه جای مختلف، سه نام مجزا — هرکدام را همان‌طور که باید خوانده
                شود بنویسید.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ca-brandName">
                  نام برند <RequiredMark />
                </Label>
                <Input
                  id="ca-brandName"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="کلینیک گیتا"
                  required
                />
                <p className="text-xs text-foreground-muted">
                  خط اول بالای صفحه، کنار لوگو
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ca-contactName">
                  نام مخاطب <RequiredMark />
                </Label>
                <Input
                  id="ca-contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="دکتر بیتا مجیدزاده"
                  required
                />
                <p className="text-xs text-foreground-muted">
                  خط ریز زیر نام برند
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="ca-greetingName">نام در خوش‌آمدگویی</Label>
                <Input
                  id="ca-greetingName"
                  value={greetingName}
                  onChange={(e) => setGreetingName(e.target.value)}
                  placeholder="بیتا"
                />
                <p className="text-xs text-foreground-muted">
                  فقط برای جمله خوش‌آمد، جایی که «جان» صمیمی‌ترش می‌کند. خالی
                  بگذارید تا همان نام مخاطب استفاده شود.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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

          {/* The customisable greeting. */}
          <div className="space-y-4 rounded-xl border border-border bg-surface-sunken p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                متن داشبورد مشتری
              </p>
              <p className="mt-1 text-xs leading-relaxed text-foreground-muted">
                هرچه بنویسید همان را می‌بیند. خالی بگذارید تا متن پیش‌فرض نمایش
                داده شود. این نشانه‌ها جایگزین می‌شوند:
              </p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground-muted">
                {GREETING_TOKENS.map(({ token, label }) => (
                  <li key={token}>
                    <code dir="ltr" className="text-foreground-secondary">
                      {token}
                    </code>{" "}
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ca-welcomeTitle">عنوان خوش‌آمدگویی</Label>
              <Input
                id="ca-welcomeTitle"
                value={welcomeTitle}
                onChange={(e) => setWelcomeTitle(e.target.value)}
                placeholder={DEFAULT_WELCOME_TITLE}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ca-welcomeMessage">متن توضیح</Label>
              <Textarea
                id="ca-welcomeMessage"
                rows={3}
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder={DEFAULT_WELCOME_MESSAGE}
              />
            </div>

            {/* The portal header and hero, as the client will read them. */}
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              <p className="border-b border-border px-4 py-2 text-2xs font-semibold uppercase tracking-wide text-foreground-subtle">
                پیش‌نمایش
              </p>

              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <span className="font-display text-lg font-black leading-none tracking-tight text-foreground">
                  Rava
                </span>
                <span aria-hidden className="h-5 w-px shrink-0 bg-border" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold leading-tight text-foreground">
                    {previewSource.brandName}
                  </span>
                  <span className="block truncate text-xs leading-tight text-foreground-muted">
                    {previewSource.contactName}
                  </span>
                </span>
              </div>

              <div className="px-4 py-4">
                <p className="font-display text-xl font-bold leading-tight text-foreground">
                  {previewTitle}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground-secondary">
                  {previewMessage}
                </p>
              </div>
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
