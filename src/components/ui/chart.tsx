"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"

import { cn } from "@/lib/utils"
import { CHART_CHROME } from "@/lib/design-tokens"
import { EmptyState } from "@/components/ui/empty-state"

/* ==========================================================================
   Container
   ========================================================================== */

interface ChartFrameProps {
  /** Falls back to an explanatory empty state when there is nothing to plot. */
  isEmpty?: boolean
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  height?: number
  className?: string
  children: React.ReactElement
  /** Read out to screen readers in place of the SVG. State the takeaway. */
  summary?: string
}

/**
 * Wraps a Recharts tree.
 *
 * Reserves its height up front so the page never reflows when the chart
 * mounts, and swaps in a real empty state rather than rendering a bare axis
 * frame with no data in it.
 */
export function ChartFrame({
  isEmpty,
  emptyMessage = "هنوز داده‌ای برای نمایش ثبت نشده است",
  emptyIcon,
  height = 280,
  className,
  summary,
  children,
}: ChartFrameProps) {
  if (isEmpty) {
    return (
      <div style={{ height }} className={cn("grid place-items-center", className)}>
        <EmptyState icon={emptyIcon} title={emptyMessage} size="sm" />
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      {summary && <p className="sr-only">{summary}</p>}
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

/* ==========================================================================
   Shared Recharts props
   ========================================================================== */

/** Hairline grid, horizontal only — vertical rules compete with the data. */
export const GRID_PROPS = {
  stroke: CHART_CHROME.grid,
  strokeDasharray: "3 3",
  vertical: false,
} as const

/** Persian digits on numeric ticks; category labels pass through untouched. */
const faTick = (value: unknown) =>
  typeof value === "number"
    ? value.toLocaleString("fa-IR", { maximumFractionDigits: 1 })
    : String(value ?? "")

export const AXIS_PROPS = {
  stroke: "transparent",
  tick: { fill: CHART_CHROME.label, fontSize: 12 },
  tickLine: false,
  axisLine: false,
  tickFormatter: faTick,
} as const

/* ==========================================================================
   Tooltip
   ========================================================================== */

export interface TooltipEntry {
  name?: string | number
  value?: number | string
  color?: string
  dataKey?: string | number
  payload?: Record<string, unknown>
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string | number
  /** Formats each value; defaults to Persian digits. */
  formatter?: (value: number | string, entry: TooltipEntry) => React.ReactNode
  labelFormatter?: (label: string | number) => React.ReactNode
  /** Appended after every value, e.g. «امتیاز». */
  unit?: string
}

const faValue = (v: number | string) =>
  typeof v === "number"
    ? v.toLocaleString("fa-IR", { maximumFractionDigits: 2 })
    : v

/** The one tooltip used by every chart in the product. */
export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  unit,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div
      className={cn(
        "min-w-[9rem] rounded-xl border border-border bg-popover p-3 shadow-lg",
        "text-xs text-popover-foreground"
      )}
    >
      {label !== undefined && (
        <p className="mb-2 border-b border-border-subtle pb-1.5 font-semibold text-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <ul className="space-y-1.5">
        {payload.map((entry, i) => (
          <li
            key={`${entry.dataKey ?? entry.name ?? i}`}
            className="flex items-center justify-between gap-4"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full ring-1 ring-inset ring-black/10"
                style={{ background: entry.color }}
              />
              <span className="truncate text-foreground-muted">{entry.name}</span>
            </span>
            <span data-numeric className="shrink-0 font-semibold text-foreground">
              {formatter
                ? formatter(entry.value ?? 0, entry)
                : faValue(entry.value ?? 0)}
              {unit && <span className="ms-1 font-normal text-foreground-subtle">{unit}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ==========================================================================
   Legend
   ========================================================================== */

export interface LegendItem {
  label: string
  /** A CSS colour — usually `chartColor(slot)`. */
  color: string
}

/**
 * Always present when a chart carries two or more series: identity must never
 * rest on colour alone. Rendered as HTML rather than Recharts' own legend so
 * it wraps, stays keyboard-reachable and matches the rest of the UI.
 */
export function ChartLegend({
  items,
  className,
}: {
  items: LegendItem[]
  className?: string
}) {
  if (items.length === 0) return null

  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)}>
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center gap-1.5 text-xs text-foreground-muted"
        >
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-[3px] ring-1 ring-inset ring-black/10"
            style={{ background: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
