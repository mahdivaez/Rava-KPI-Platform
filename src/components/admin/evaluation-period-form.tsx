"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarCheck2, CalendarClock } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
]

interface Period {
  month: number
  year: number
}

const label = ({ month, year }: Period) =>
  `${PERSIAN_MONTHS[month - 1]} ${year.toLocaleString("fa-IR", { useGrouping: false })}`

export function EvaluationPeriodForm({
  initial,
  calendar,
}: {
  initial: Period & { manual: boolean }
  calendar: Period
}) {
  const router = useRouter()
  const [current, setCurrent] = useState(initial)
  const [mode, setMode] = useState<"auto" | "manual">(initial.manual ? "manual" : "auto")
  const [month, setMonth] = useState(initial.month)
  const [year, setYear] = useState(initial.year)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (mode === "manual" && (!Number.isInteger(year) || year < 1400 || year > 1500)) {
      toast.error("سال را درست وارد کنید (مثلاً ۱۴۰۵)")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/evaluation-period", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "auto" ? { mode } : { mode, month, year }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "خطا در ذخیره")
        return
      }
      setCurrent(data)
      toast.success(`دوره ارزیابی روی ${label(data)} تنظیم شد`)
      router.refresh()
    } catch {
      toast.error("خطا در ارتباط با سرور")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>ماه باز فعلی</CardTitle>
          <CardDescription>فقط برای این ماه می‌شود ارزیابی ثبت کرد</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-display text-3xl font-bold text-foreground">{label(current)}</p>
          <p className="mt-2 text-sm text-foreground-muted">
            {current.manual
              ? "به‌صورت دستی تنظیم شده است"
              : "خودکار — همان ماه جاری تقویم"}
          </p>
          <p className="mt-4 text-xs text-foreground-subtle">
            ماه جاری تقویم: {label(calendar)}
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>تغییر دوره</CardTitle>
          <CardDescription>
            ارزیابی‌های ماه‌های دیگر بسته می‌شوند. ارزیابی‌هایی که قبلاً ثبت شده‌اند دست نمی‌خورند.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div role="radiogroup" aria-label="حالت دوره" className="grid gap-3 sm:grid-cols-2">
            {([
              { value: "auto", title: "خودکار", hint: "همیشه ماه جاری تقویم باز است", Icon: CalendarCheck2 },
              { value: "manual", title: "دستی", hint: "یک ماه مشخص را باز کنید", Icon: CalendarClock },
            ] as const).map(({ value, title, hint, Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={mode === value}
                onClick={() => setMode(value)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4 text-start transition-colors",
                  mode === value
                    ? "border-primary bg-primary-subtle"
                    : "border-border bg-surface hover:bg-surface-hover"
                )}
              >
                <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <span>
                  <span className="block font-medium text-foreground">{title}</span>
                  <span className="block text-sm text-foreground-muted">{hint}</span>
                </span>
              </button>
            ))}
          </div>

          {mode === "manual" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>ماه</Label>
                <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERSIAN_MONTHS.map((name, i) => (
                      <SelectItem key={name} value={String(i + 1)}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="period-year">سال</Label>
                <Input
                  id="period-year"
                  type="number"
                  inputMode="numeric"
                  min={1400}
                  max={1500}
                  value={Number.isNaN(year) ? "" : year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10))}
                />
              </div>
            </div>
          )}

          <Button onClick={save} loading={saving}>
            ذخیره
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
