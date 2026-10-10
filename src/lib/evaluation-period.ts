import moment from "moment-jalaali"

import { prisma } from "@/lib/prisma"

export const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
] as const

export interface EvaluationPeriod {
  month: number
  year: number
}

export interface OpenPeriod extends EvaluationPeriod {
  /** True when an admin pinned this month; false when it follows the calendar. */
  manual: boolean
}

const SETTING_KEY = "evaluationPeriod"

/** The current Persian calendar month. */
export function calendarPeriod(): EvaluationPeriod {
  const now = moment()
  return { month: now.jMonth() + 1, year: now.jYear() }
}

export function isValidPeriod(value: unknown): value is EvaluationPeriod {
  if (!value || typeof value !== "object") return false
  const { month, year } = value as Record<string, unknown>
  return (
    Number.isInteger(month) &&
    Number.isInteger(year) &&
    (month as number) >= 1 &&
    (month as number) <= 12 &&
    (year as number) >= 1400 &&
    (year as number) <= 1500
  )
}

/**
 * The one month the team and clients may file KPIs for. An admin can pin it
 * (e.g. reopen last month for late entries); otherwise it is the calendar month.
 */
export async function getOpenPeriod(): Promise<OpenPeriod> {
  if (prisma) {
    try {
      const row = await prisma.appSetting.findUnique({
        where: { key: SETTING_KEY },
      })
      if (row && isValidPeriod(row.value)) {
        return { month: row.value.month, year: row.value.year, manual: true }
      }
    } catch (error) {
      // A missing table (migration not applied yet) must not take the forms down.
      console.error("Could not read evaluation period setting:", error)
    }
  }
  return { ...calendarPeriod(), manual: false }
}

/** Pin the open month, or pass null to follow the calendar again. */
export async function setOpenPeriod(period: EvaluationPeriod | null) {
  if (!prisma) throw new Error("Database not available")
  if (period === null) {
    await prisma.appSetting.deleteMany({ where: { key: SETTING_KEY } })
    return
  }
  const value = { month: period.month, year: period.year }
  await prisma.appSetting.upsert({
    where: { key: SETTING_KEY },
    create: { key: SETTING_KEY, value },
    update: { value },
  })
}

export function isSamePeriod(
  a: { month?: number; year?: number },
  b: EvaluationPeriod
) {
  return a.month === b.month && a.year === b.year
}

export function formatPeriod({ month, year }: EvaluationPeriod) {
  return `${PERSIAN_MONTHS[month - 1]} ${year.toLocaleString("fa-IR", { useGrouping: false })}`
}

/** The error every submit endpoint returns for a month that is not open. */
export function closedPeriodMessage(open: EvaluationPeriod) {
  return `ثبت ارزیابی فقط برای ${formatPeriod(open)} باز است. صفحه را تازه کنید.`
}
