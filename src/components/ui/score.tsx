import * as React from "react"

import { cn } from "@/lib/utils"
import { getScoreBand, SCORE_BANDS } from "@/lib/design-tokens"
import { SCORE_MAX, SCORE_MIN } from "@/lib/roles"

/* ==========================================================================
   Score badge
   ========================================================================== */

interface ScoreBadgeProps {
  score: number
  max?: number
  size?: "sm" | "default" | "lg"
  /** Appends the band's Persian word, so the colour is never the only signal. */
  showLabel?: boolean
  className?: string
}

export function ScoreBadge({
  score,
  max = SCORE_MAX,
  size = "default",
  showLabel = false,
  className,
}: ScoreBadgeProps) {
  const band = getScoreBand(score)

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-lg font-semibold tabular",
        band.chip,
        size === "sm" && "px-1.5 py-0.5 text-2xs",
        size === "default" && "px-2 py-0.5 text-xs",
        size === "lg" && "px-2.5 py-1 text-sm",
        className
      )}
      title={`${band.label} — ${score} از ${max}`}
    >
      {/* «از» rather than a slash: in RTL a "9.1 / 10" run reorders and reads
          back to front. The Persian word keeps the pair in the right order. */}
      <span data-numeric>
        {score.toLocaleString("fa-IR", { maximumFractionDigits: 1 })}
      </span>
      <span className="font-normal opacity-60">از</span>
      <span data-numeric className="opacity-70">
        {max.toLocaleString("fa-IR")}
      </span>
      {showLabel && <span className="font-normal">· {band.label}</span>}
    </span>
  )
}

/* ==========================================================================
   Score meter
   ========================================================================== */

interface ScoreMeterProps {
  score: number
  max?: number
  label?: string
  /** Renders the numeric value beside the label. */
  showValue?: boolean
  size?: "sm" | "default"
  className?: string
}

/**
 * A horizontal meter for one KPI.
 *
 * Uses `width` rather than a transform: RTL flips the inline axis, and a
 * percentage translate would run the fill the wrong way.
 */
export function ScoreMeter({
  score,
  max = SCORE_MAX,
  label,
  showValue = true,
  size = "default",
  className,
}: ScoreMeterProps) {
  const band = getScoreBand(score)
  const pct = Math.min(100, Math.max(0, (score / max) * 100))

  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && (
            <span className="truncate text-sm text-foreground-secondary">{label}</span>
          )}
          {showValue && (
            <span
              data-numeric
              className={cn("shrink-0 text-sm font-semibold", band.text)}
            >
              {score.toLocaleString("fa-IR", { maximumFractionDigits: 1 })}
              <span className="font-normal text-foreground-subtle">
                {" "}
                از {max.toLocaleString("fa-IR")}
              </span>
            </span>
          )}
        </div>
      )}
      <div
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ? `${label}: ${band.label}` : band.label}
        className={cn(
          "w-full overflow-hidden rounded-full bg-surface-sunken",
          size === "sm" ? "h-1.5" : "h-2"
        )}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-slow ease-out", band.fill)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/* ==========================================================================
   Legend
   ========================================================================== */

/** Explains the four score bands wherever they first appear on a screen. */
export function ScoreBandLegend({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)}>
      {[...SCORE_BANDS].reverse().map((band) => (
        <li
          key={band.band}
          className="flex items-center gap-1.5 text-xs text-foreground-muted"
        >
          <span
            aria-hidden
            className={cn("size-2 rounded-full ring-1 ring-inset ring-black/10", band.fill)}
          />
          {band.label}
        </li>
      ))}
    </ul>
  )
}

/* ==========================================================================
   Score scale
   ========================================================================== */

interface ScoreScaleProps {
  value?: number
  onChange: (value: number) => void
  min?: number
  max?: number
  name: string
  /** Accessible group label, e.g. the metric's title. */
  label: string
  disabled?: boolean
  className?: string
  /**
   * Factor that maps a step onto the canonical 1–10 band scale.
   * A 1–5 metric passes 2, so «5» still reads as «عالی».
   */
  bandMultiplier?: number
}

/**
 * A 1–10 picker rendered as a radio group.
 *
 * Chosen over a number field because every value is one tap away, the whole
 * range is visible, and the selected step immediately shows which performance
 * band it lands in. Two rows of five on phones keeps every target above 44px;
 * one row of ten once there is width for it.
 */
export function ScoreScale({
  value,
  onChange,
  min = SCORE_MIN,
  max = SCORE_MAX,
  name,
  label,
  disabled,
  className,
  bandMultiplier = 1,
}: ScoreScaleProps) {
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  const band = value ? getScoreBand(value * bandMultiplier) : null

  return (
    <div className={cn("space-y-2", className)}>
      <div
        role="radiogroup"
        aria-label={`${label} — امتیاز ${min} تا ${max}`}
        className="grid grid-cols-5 gap-1.5 sm:grid-cols-10"
      >
        {steps.map((step) => {
          const selected = value === step
          const stepBand = getScoreBand(step * bandMultiplier)
          return (
            <button
              key={step}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${step}`}
              disabled={disabled}
              onClick={() => onChange(step)}
              className={cn(
                "h-11 rounded-lg border text-sm font-semibold tabular",
                "transition-[background-color,border-color,color,transform] duration-fast ease-out",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                "active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50",
                selected
                  ? cn("border-transparent text-white", stepBand.fill)
                  : "border-border bg-surface text-foreground-muted hover:border-border-strong hover:bg-surface-hover hover:text-foreground"
              )}
            >
              {step.toLocaleString("fa-IR")}
            </button>
          )
        })}
      </div>

      {/* The chosen band is stated in words, not carried by colour alone. */}
      <p className="min-h-5 text-xs">
        {band ? (
          <span className={cn("font-medium", band.text)}>{band.label}</span>
        ) : (
          <span className="text-foreground-subtle">امتیاز را انتخاب کنید</span>
        )}
      </p>

      {/* Keeps the value in the form payload and in the a11y tree. */}
      <input type="hidden" name={name} value={value ?? ""} />
    </div>
  )
}
