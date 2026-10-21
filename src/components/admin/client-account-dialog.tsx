"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
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
  brandLabelOf,
  renderGreetingTemplate,
} from "@/lib/client-greeting"
import { faNumber } from "@/lib/design-tokens"

/** One brand already on the account. */
export interface ClientBrandFormValues {
  id: string
  brandName: string
  workgroupId: string
  workgroupName: string
  /** Verdicts filed under this brand — removing it takes them along. */
  evaluationCount: number
}

export interface ClientAccountFormValues {
  id: string
  email: string
  contactName: string
  greetingName: string | null
  isActive: boolean
  welcomeTitle: string | null
  welcomeMessage: string | null
  brands: ClientBrandFormValues[]
}

export interface WorkgroupOption {
  id: string
  name: string
}

/** A brand row being edited; `id` is absent until it has been saved once. */
interface BrandDraft {
  /** Local, stable across re-renders — new rows have no database id yet. */
  rowKey: string
  id?: string
  brandName: string
  workgroupId: string
  evaluationCount: number
}

let draftCounter = 0
function newDraft(): BrandDraft {
  draftCounter += 1
  return {
    rowKey: `new-${draftCounter}`,
    brandName: "",
    workgroupId: "",
    evaluationCount: 0,
  }
}

/**
 * Create or edit a client account.
 *
 * Everything the client portal says to this client — except the Rava wordmark —
 * is set here: the brands they own, the contact line beneath them, the name the
 * greeting uses, and the two greeting sentences themselves. The preview renders
 * the header and the greeting exactly as the client will see them, so nobody
 * has to sign in as the client to check their own wording.
 *
 * One person may own several brands. They get one email and one password; each
 * brand adds its own card to their dashboard and its own section to the form.
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
  const [greetingName, setGreetingName] = useState(client?.greetingName ?? "")
  const [welcomeTitle, setWelcomeTitle] = useState(client?.welcomeTitle ?? "")
  const [welcomeMessage, setWelcomeMessage] = useState(client?.welcomeMessage ?? "")
  const [brands, setBrands] = useState<BrandDraft[]>(() =>
    client?.brands.length
      ? client.brands.map((brand) => ({
          rowKey: brand.id,
          id: brand.id,
          brandName: brand.brandName,
          workgroupId: brand.workgroupId,
          evaluationCount: brand.evaluationCount,
        }))
      : [newDraft()]
  )

  function updateBrand(rowKey: string, patch: Partial<BrandDraft>) {
    setBrands((prev) =>
      prev.map((brand) => (brand.rowKey === rowKey ? { ...brand, ...patch } : brand))
    )
  }

  function removeBrand(brand: BrandDraft) {
    // Deleting a brand deletes its history with it; say so before it happens.
    if (brand.evaluationCount > 0) {
      const warning = `حذف «${brand.brandName}» ${faNumber(
        brand.evaluationCount
      )} ارزیابی ثبت‌شده این برند را هم پاک می‌کند. ادامه می‌دهید؟`
      if (!confirm(warning)) return
    }
    setBrands((prev) => prev.filter((b) => b.rowKey !== brand.rowKey))
  }

  // Placeholders stand in for empty fields so the preview never collapses.
  const brandNames = brands.map((brand) => brand.brandName.trim()).filter(Boolean)
  const previewSource = {
    contactName: contactName.trim() || "نام مخاطب",
    brandNames: brandNames.length ? brandNames : ["نام برند"],
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

  /** Workgroups still free to pick, plus whatever this row already holds. */
  function availableWorkgroups(rowKey: string) {
    const taken = new Set(
      brands.filter((b) => b.rowKey !== rowKey).map((b) => b.workgroupId)
    )
    return workgroups.filter((w) => !taken.has(w.id))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (brands.length === 0) {
      toast.error("حداقل یک برند لازم است")
      return
    }
    for (const brand of brands) {
      if (!brand.brandName.trim()) {
        toast.error("نام هر برند را بنویسید")
        return
      }
      if (!brand.workgroupId) {
        toast.error(`کارگروه «${brand.brandName.trim()}» را انتخاب کنید`)
        return
      }
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
      greetingName,
      brands: brands.map((brand) => ({
        ...(brand.id ? { id: brand.id } : {}),
        brandName: brand.brandName.trim(),
        workgroupId: brand.workgroupId,
      })),
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
            مشتری با این حساب وارد /client/login می‌شود و اعضای کارگروه هر برند
            خود را ارزیابی می‌کند. هر متنی که در داشبورد او دیده می‌شود، از
            همین‌جا تعیین می‌شود.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* The names, each with its own home in the portal. */}
          <div className="space-y-4 rounded-xl border border-border bg-surface-sunken p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                نام‌هایی که مشتری می‌بیند
              </p>
              <p className="mt-1 text-xs leading-relaxed text-foreground-muted">
                هرکدام را همان‌طور که باید خوانده شود بنویسید — نام برند بالای
                صفحه می‌آید، نام مخاطب ریز زیر آن، و نام خودمانی فقط در جمله
                خوش‌آمد.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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

              <div className="space-y-2">
                <Label htmlFor="ca-greetingName">نام در خوش‌آمدگویی</Label>
                <Input
                  id="ca-greetingName"
                  value={greetingName}
                  onChange={(e) => setGreetingName(e.target.value)}
                  placeholder="بیتا"
                />
                <p className="text-xs text-foreground-muted">
                  جایی که «جان» صمیمی‌ترش می‌کند. خالی بگذارید تا همان نام مخاطب
                  استفاده شود.
                </p>
              </div>
            </div>
          </div>

          {/* The brands this one login covers. */}
          <div className="space-y-4 rounded-xl border border-border bg-surface-sunken p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                برندهای این حساب
              </p>
              <p className="mt-1 text-xs leading-relaxed text-foreground-muted">
                یک نفر می‌تواند چند برند داشته باشد؛ با همین یک ایمیل و رمز،
                ارزیابی همه را در یک نشست ثبت می‌کند. هر برند به یک کارگروه وصل
                می‌شود و هر کارگروه فقط یک بار.
              </p>
            </div>

            <div className="space-y-3">
              {brands.map((brand, index) => (
                <div
                  key={brand.rowKey}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 sm:flex-row sm:items-start"
                >
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`ca-brandName-${brand.rowKey}`}>
                      نام برند <RequiredMark />
                    </Label>
                    <Input
                      id={`ca-brandName-${brand.rowKey}`}
                      value={brand.brandName}
                      onChange={(e) =>
                        updateBrand(brand.rowKey, { brandName: e.target.value })
                      }
                      placeholder={index === 0 ? "کلینیک گیتا" : "برند دوم"}
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`ca-workgroup-${brand.rowKey}`}>
                      کارگروه <RequiredMark />
                    </Label>
                    <Select
                      value={brand.workgroupId}
                      onValueChange={(value) =>
                        updateBrand(brand.rowKey, { workgroupId: value })
                      }
                    >
                      <SelectTrigger id={`ca-workgroup-${brand.rowKey}`}>
                        <SelectValue placeholder="انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableWorkgroups(brand.rowKey).map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {brand.evaluationCount > 0 && (
                      <p data-numeric className="text-xs text-foreground-muted">
                        {faNumber(brand.evaluationCount)} ارزیابی ثبت‌شده
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="self-end sm:mt-7"
                    aria-label={`حذف برند ${brand.brandName || index + 1}`}
                    disabled={brands.length === 1}
                    onClick={() => removeBrand(brand)}
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={brands.length >= workgroups.length}
              onClick={() => setBrands((prev) => [...prev, newDraft()])}
            >
              <Plus aria-hidden />
              افزودن برند
            </Button>
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
                    {brandLabelOf(previewSource)}
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
