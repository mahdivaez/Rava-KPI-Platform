import * as React from "react"

import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  /** Say what to do next, not just that there is nothing here. */
  description?: string
  action?: React.ReactNode
  className?: string
  size?: "sm" | "default"
}

/**
 * The empty state. Always explains the situation and offers a way forward —
 * a blank panel leaves people guessing whether it is empty or broken.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  size = "default",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        size === "sm" ? "gap-2.5 px-4 py-8" : "gap-3 px-6 py-14",
        className
      )}
    >
      {icon && (
        <span
          aria-hidden
          className={cn(
            "grid place-items-center rounded-2xl bg-surface-sunken text-foreground-subtle",
            size === "sm" ? "size-11 [&>svg]:size-5" : "size-14 [&>svg]:size-6"
          )}
        >
          {icon}
        </span>
      )}
      <div className="space-y-1">
        <p
          className={cn(
            "font-semibold text-foreground",
            size === "sm" ? "text-sm" : "text-base"
          )}
        >
          {title}
        </p>
        {description && (
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-foreground-muted">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1.5">{action}</div>}
    </div>
  )
}
