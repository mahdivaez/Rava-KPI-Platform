import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Text input.
 *
 * `text-base` on mobile is deliberate: anything smaller makes iOS Safari zoom
 * the viewport on focus. Desktop steps down to 14px.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-input bg-surface px-3.5 text-base sm:h-10 sm:text-sm",
        "text-foreground placeholder:text-foreground-subtle",
        "shadow-xs transition-[border-color,box-shadow] duration-fast ease-out",
        "hover:border-border-strong",
        "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-danger aria-invalid:ring-danger/20",
        "file:me-3 file:inline-flex file:h-7 file:cursor-pointer file:rounded-md file:border-0 file:bg-secondary file:px-3 file:text-xs file:font-medium file:text-secondary-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Input }
