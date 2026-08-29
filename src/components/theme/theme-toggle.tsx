"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

const OPTIONS = [
  { value: "light", label: "روشن", icon: Sun },
  { value: "dark", label: "تیره", icon: Moon },
  { value: "system", label: "سیستم", icon: Monitor },
] as const

/**
 * Three-state theme switch: light / dark / follow-system.
 *
 * Renders a neutral placeholder until mounted — the server has no way to know
 * the resolved theme, and painting the wrong icon first would flash.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  return (
    <div
      role="radiogroup"
      aria-label="حالت نمایش"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border bg-surface-sunken p-0.5",
        className
      )}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = mounted && theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "grid size-8 place-items-center rounded-full transition-colors duration-fast ease-out",
              "text-foreground-subtle hover:text-foreground",
              active && "bg-surface text-primary shadow-xs"
            )}
          >
            <Icon className="size-4" aria-hidden />
          </button>
        )
      })}
    </div>
  )
}

/** Compact single-button variant for tight headers. */
export function ThemeToggleCompact({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "روشن کردن پوسته" : "تیره کردن پوسته"}
      title={isDark ? "حالت روشن" : "حالت تیره"}
      className={cn(
        "grid size-10 place-items-center rounded-xl text-foreground-muted",
        "transition-colors duration-fast ease-out hover:bg-surface-hover hover:text-foreground",
        className
      )}
    >
      {isDark ? (
        <Sun className="size-[18px]" aria-hidden />
      ) : (
        <Moon className="size-[18px]" aria-hidden />
      )}
    </button>
  )
}
