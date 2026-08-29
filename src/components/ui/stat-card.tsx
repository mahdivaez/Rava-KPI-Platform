import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Minus, TrendingDown, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info"

const TONE_ICON: Record<Tone, string> = {
  neutral: "bg-muted text-foreground-secondary",
  primary: "bg-primary-subtle text-primary-subtle-foreground",
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-danger-subtle text-danger",
  info: "bg-info-subtle text-info",
}

export interface StatCardProps {
  label: string
  /** The headline figure. Pre-formatted, so the caller controls the locale. */
  value: React.ReactNode
  /** Small text under the value — a denominator, a period, a qualifier. */
  hint?: string
  icon?: React.ReactNode
  tone?: Tone
  /** Signed percentage change. Direction is stated in words as well as colour. */
  delta?: { value: number; label?: string }
  /** Makes the whole tile a link. */
  href?: string
  className?: string
}

/**
 * A stat tile: one number, its label, and at most one qualifier.
 *
 * This is the "not a chart" answer — when the data's job is a single headline
 * figure, a tile reads faster than any plot.
 */
export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "neutral",
  delta,
  href,
  className,
}: StatCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-foreground-muted">{label}</p>
        {icon && (
          <span
            aria-hidden
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-lg [&>svg]:size-[18px]",
              TONE_ICON[tone]
            )}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span
          data-numeric
          className="font-display text-3xl font-bold leading-none text-foreground"
        >
          {value}
        </span>
        {delta && <DeltaPill {...delta} />}
      </div>

      {hint && <p className="mt-2 text-xs text-foreground-subtle">{hint}</p>}
    </>
  )

  const base = cn(
    "group relative rounded-xl border border-border bg-card p-5 shadow-xs",
    className
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "block transition-[border-color,box-shadow] duration-base ease-out",
          "hover:border-border-strong hover:shadow-md",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        )}
      >
        {body}
        <ArrowLeft
          aria-hidden
          className="absolute bottom-5 start-5 size-4 text-foreground-subtle opacity-0 transition-all duration-base ease-out group-hover:opacity-100 rtl:-translate-x-1 rtl:group-hover:translate-x-0"
        />
      </Link>
    )
  }

  return <div className={base}>{body}</div>
}

/**
 * Direction is carried by an arrow, a sign and a word — never by colour alone.
 */
function DeltaPill({ value, label }: { value: number; label?: string }) {
  const flat = Math.abs(value) < 0.05
  const up = value > 0

  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown
  const tone = flat
    ? "bg-muted text-foreground-muted"
    : up
      ? "bg-success-subtle text-success"
      : "bg-danger-subtle text-danger"
  const word = flat ? "بدون تغییر" : up ? "افزایش" : "کاهش"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        tone
      )}
    >
      <Icon className="size-3" aria-hidden />
      <span data-numeric>
        {flat ? "۰" : `${Math.abs(value).toLocaleString("fa-IR", { maximumFractionDigits: 1 })}`}٪
      </span>
      <span className="sr-only">{word}</span>
      {label && <span className="font-normal opacity-80">{label}</span>}
    </span>
  )
}

/** Responsive tile row. Dashboard density: 4 across on wide screens. */
export function StatGrid({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
        className
      )}
      {...props}
    />
  )
}
