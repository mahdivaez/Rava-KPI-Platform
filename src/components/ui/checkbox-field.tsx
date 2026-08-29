import * as React from "react"

import { cn } from "@/lib/utils"

interface CheckboxFieldProps
  extends Omit<React.ComponentProps<"input">, "type" | "id" | "name"> {
  id: string
  name?: string
  label: string
  /** One line explaining what turning this on actually does. */
  hint?: string
}

/**
 * A labelled checkbox row.
 *
 * The whole row is the label, so the hit area is the full width rather than
 * the 16px box, and the hint stays visible instead of hiding in a tooltip.
 * The native control keeps free keyboard and form behaviour.
 */
export function CheckboxField({
  id,
  name,
  label,
  hint,
  className,
  ...props
}: CheckboxFieldProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg p-2 min-h-11",
        "transition-colors duration-fast ease-out hover:bg-surface-hover",
        "has-[:disabled]:pointer-events-none has-[:disabled]:opacity-50",
        className
      )}
    >
      <input
        type="checkbox"
        id={id}
        name={name ?? id}
        className="mt-1 size-4 shrink-0 accent-[rgb(var(--primary))]"
        {...props}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {hint && (
          <span className="block text-xs leading-relaxed text-foreground-muted">
            {hint}
          </span>
        )}
      </span>
    </label>
  )
}
