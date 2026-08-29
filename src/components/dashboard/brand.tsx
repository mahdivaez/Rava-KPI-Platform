import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * The product mark: four bars of increasing height inside a rounded tile —
 * a KPI trend, drawn rather than decorated. Reads at 24px.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label="راوا"
      className={cn("size-8", className)}
    >
      <rect width="32" height="32" rx="9" fill="rgb(var(--primary))" />
      <g fill="rgb(var(--primary-foreground))">
        <rect x="7" y="18" width="3.5" height="7" rx="1.75" opacity="0.55" />
        <rect x="12.5" y="14" width="3.5" height="11" rx="1.75" opacity="0.75" />
        <rect x="18" y="10" width="3.5" height="15" rx="1.75" opacity="0.9" />
        <rect x="23.5" y="6" width="3.5" height="19" rx="1.75" />
      </g>
    </svg>
  )
}

export function BrandLockup({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <BrandMark className="size-9 shrink-0" />
      {!compact && (
        <span className="min-w-0">
          <span className="block font-display text-base font-bold leading-tight text-foreground">
            راوا
          </span>
          <span className="block truncate text-xs leading-tight text-foreground-muted">
            سامانه مدیریت عملکرد
          </span>
        </span>
      )}
    </span>
  )
}
