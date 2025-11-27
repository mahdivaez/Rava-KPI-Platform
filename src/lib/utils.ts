import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import moment from "moment-jalaali"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date in Persian/Shamsi calendar
 * @param date - The date to format
 * @param formatString - The format string (default: 'jYYYY/jMM/jDD')
 * @returns Formatted Persian date string
 */
export function formatPersianDate(date: Date | string, formatString: string = 'jYYYY/jMM/jDD'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return moment(dateObj).format(formatString)
  } catch {
    return 'نامشخص'
  }
}

/**
 * Format a date with time in Persian/Shamsi calendar
 * @param date - The date to format
 * @param formatString - The format string (default: 'jYYYY/jMM/jDD HH:mm')
 * @returns Formatted Persian date and time string
 */
export function formatPersianDateTime(date: Date | string, formatString: string = 'jYYYY/jMM/jDD HH:mm'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return moment(dateObj).format(formatString)
  } catch {
    return 'نامشخص'
  }
}

/**
 * Format a date with weekday in Persian/Shamsi calendar
 * @param date - The date to format
 * @param formatString - The format string (default: 'dddd jYYYY/jMM/jDD')
 * @returns Formatted Persian date with weekday string
 */
export function formatPersianDateWithWeekday(date: Date | string, formatString: string = 'dddd jYYYY/jMM/jDD'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return moment(dateObj).format(formatString)
  } catch {
    return 'نامشخص'
  }
}
