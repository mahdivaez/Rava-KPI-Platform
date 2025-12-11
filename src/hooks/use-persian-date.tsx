"use client"

import { useState, useEffect } from "react"

interface PersianDateState {
  currentDate: string
  currentMonth: number
  currentYear: number
  effectiveCurrentMonth: number
}

export function usePersianDate(): PersianDateState {
  const [dateState, setDateState] = useState<PersianDateState>({
    currentDate: '',
    currentMonth: 1,
    currentYear: new Date().getFullYear(),
    effectiveCurrentMonth: 1
  })

  useEffect(() => {
    try {
      // Dynamically import moment-jalaali to avoid SSR issues
      import('moment-jalaali').then((momentModule) => {
        const moment = momentModule.default
        
        const currentPersian = moment()
        const currentPersianMonth = currentPersian.jMonth() + 1
        const currentPersianYear = currentPersian.jYear()
        const effectiveCurrentMonth = currentPersianMonth

        setDateState({
          currentDate: currentPersian.format('jYYYY/jMM/jDD'),
          currentMonth: currentPersianMonth,
          currentYear: currentPersianYear,
          effectiveCurrentMonth
        })
      }).catch(() => {
        // Fallback to regular date
        const now = new Date()
        setDateState({
          currentDate: now.toLocaleDateString('fa-IR'),
          currentMonth: now.getMonth() + 1,
          currentYear: now.getFullYear(),
          effectiveCurrentMonth: now.getMonth() + 1
        })
      })
    } catch {
      // Final fallback
      const now = new Date()
      setDateState({
        currentDate: now.toLocaleDateString('fa-IR'),
        currentMonth: now.getMonth() + 1,
        currentYear: now.getFullYear(),
        effectiveCurrentMonth: now.getMonth() + 1
      })
    }
  }, [])

  return dateState
}