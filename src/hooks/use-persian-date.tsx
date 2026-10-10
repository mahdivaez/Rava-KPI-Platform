"use client"

import { useState, useEffect } from "react"

interface PersianDateState {
  currentDate: string
  /** The month open for KPI entry (admin-pinned, or the calendar month). */
  currentMonth: number
  currentYear: number
  effectiveCurrentMonth: number
}

/**
 * The evaluation period the forms file under. It comes from the server so an
 * admin can reopen an earlier month; the calendar month is only a fallback.
 * `currentDate` stays empty until the period has resolved.
 */
export function usePersianDate(): PersianDateState {
  const [dateState, setDateState] = useState<PersianDateState>({
    currentDate: "",
    currentMonth: 1,
    currentYear: new Date().getFullYear(),
    effectiveCurrentMonth: 1,
  })

  useEffect(() => {
    let cancelled = false

    async function resolve() {
      const moment = (await import("moment-jalaali")).default
      const today = moment()
      let month = today.jMonth() + 1
      let year = today.jYear()

      try {
        const res = await fetch("/api/evaluation-period", { cache: "no-store" })
        if (res.ok) {
          const period = await res.json()
          if (Number.isInteger(period?.month) && Number.isInteger(period?.year)) {
            month = period.month
            year = period.year
          }
        }
      } catch {
        // Offline or API error: fall back to the calendar month.
      }

      if (!cancelled) {
        setDateState({
          currentDate: today.format("jYYYY/jMM/jDD"),
          currentMonth: month,
          currentYear: year,
          effectiveCurrentMonth: month,
        })
      }
    }

    resolve().catch(() => {
      if (cancelled) return
      const now = new Date()
      setDateState({
        currentDate: now.toLocaleDateString("fa-IR"),
        currentMonth: now.getMonth() + 1,
        currentYear: now.getFullYear(),
        effectiveCurrentMonth: now.getMonth() + 1,
      })
    })

    return () => {
      cancelled = true
    }
  }, [])

  return dateState
}
