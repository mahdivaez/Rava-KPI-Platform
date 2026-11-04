"use client"

import { useRouter } from "next/navigation"
import { CalendarRange } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { faYear } from "@/lib/design-tokens"

/**
 * A local copy, as every other client component in this project keeps: the
 * server module that owns these names also constructs the Prisma client, and
 * that graph has no business in a browser bundle.
 */
const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
] as const

export interface PeriodItem {
  month: number
  year: number
}

export const periodValue = (period: PeriodItem) =>
  `${period.year}-${period.month}`

export const periodLabel = (period: PeriodItem) =>
  `${PERSIAN_MONTHS[period.month - 1]} ${faYear(period.year)}`

/**
 * The month the whole dashboard is about.
 *
 * The selection lives in the URL rather than in state, so a refresh or a
 * shared link lands on the same month, and the server page can read it before
 * it queries anything.
 */
export function PeriodPicker({
  periods,
  selected,
}: {
  periods: PeriodItem[]
  selected: PeriodItem
}) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2">
      <CalendarRange className="size-4 text-foreground-subtle" aria-hidden />
      <Select
        value={periodValue(selected)}
        onValueChange={(value) => {
          const [year, month] = value.split("-")
          router.push(`/admin/dashboard?month=${month}&year=${year}`)
        }}
      >
        <SelectTrigger className="w-44" aria-label="ماه داشبورد">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {periods.map((period) => (
            <SelectItem key={periodValue(period)} value={periodValue(period)}>
              {periodLabel(period)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
