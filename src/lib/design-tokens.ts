/**
 * Rava Design System — typed access to the tokens declared in globals.css.
 *
 * Anything that needs a colour in JavaScript (Recharts, inline SVG, canvas)
 * reads it from here, so the light/dark themes still swap in one place.
 * Nothing in this file duplicates a value; it only names one.
 */

import type { TeamRole } from "@/lib/roles"

/** `rgb(var(--token))` — resolves against the current theme at paint time. */
export const cssVar = (name: string, alpha?: number) =>
  alpha === undefined ? `rgb(var(--${name}))` : `rgb(var(--${name}) / ${alpha})`

/* ==========================================================================
   Data visualisation
   ========================================================================== */

/**
 * The categorical palette, in FIXED slot order. Slots are assigned by entity
 * identity and never cycled: a ninth series folds into "other" or gets its
 * own facet rather than reusing slot 1.
 */
export const CHART_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8] as const
export type ChartSlot = (typeof CHART_SLOTS)[number]

export const chartColor = (slot: ChartSlot, alpha?: number) =>
  cssVar(`chart-${slot}`, alpha)

export const CHART_CHROME = {
  grid: cssVar("chart-grid"),
  axis: cssVar("chart-axis"),
  label: cssVar("chart-label"),
  surface: cssVar("surface"),
  border: cssVar("border"),
} as const

/** Shared Recharts axis/tick styling. Recessive: data outranks chrome. */
export const AXIS_STYLE = {
  stroke: CHART_CHROME.axis,
  fontSize: 12,
  fill: CHART_CHROME.label,
} as const

/* ==========================================================================
   Team-role identity
   Each role owns one categorical slot, so a role wears the same hue in a
   badge, a legend and a chart series.
   ========================================================================== */

export const ROLE_SLOT: Record<TeamRole, ChartSlot> = {
  STRATEGIST: 1,
  STRATEGIST_ASSISTANT: 2,
  WRITER: 3,
  DESIGNER: 4,
  EDITOR: 5,
  VIDEOGRAPHER: 6,
  SOCIAL_ADMIN: 7,
  ONSITE_ADMIN: 8,
}

export const roleColor = (role: TeamRole, alpha?: number) =>
  cssVar(`role-${ROLE_SLOT[role]}`, alpha)

/** Text-safe step for the role hue (≥ 4.6:1 in both themes). */
export const roleInk = (role: TeamRole) => cssVar(`role-${ROLE_SLOT[role]}-ink`)

/**
 * Tailwind classes for a role chip. The label carries the identity and the
 * dot reinforces it — colour never carries meaning on its own.
 */
export const ROLE_CHIP_CLASS: Record<TeamRole, string> = {
  STRATEGIST: "bg-role-1/10 text-role-1-ink",
  STRATEGIST_ASSISTANT: "bg-role-2/10 text-role-2-ink",
  WRITER: "bg-role-3/10 text-role-3-ink",
  DESIGNER: "bg-role-4/10 text-role-4-ink",
  EDITOR: "bg-role-5/10 text-role-5-ink",
  VIDEOGRAPHER: "bg-role-6/10 text-role-6-ink",
  SOCIAL_ADMIN: "bg-role-7/10 text-role-7-ink",
  ONSITE_ADMIN: "bg-role-8/10 text-role-8-ink",
}

export const ROLE_DOT_CLASS: Record<TeamRole, string> = {
  STRATEGIST: "bg-role-1",
  STRATEGIST_ASSISTANT: "bg-role-2",
  WRITER: "bg-role-3",
  DESIGNER: "bg-role-4",
  EDITOR: "bg-role-5",
  VIDEOGRAPHER: "bg-role-6",
  SOCIAL_ADMIN: "bg-role-7",
  ONSITE_ADMIN: "bg-role-8",
}

/* ==========================================================================
   KPI score bands
   An ordinal quality scale over the 1–10 metric range. Every use pairs the
   colour with the band's Persian label, so the band is never colour-alone.
   ========================================================================== */

export type ScoreBand = "critical" | "weak" | "fair" | "strong"

export interface ScoreBandSpec {
  band: ScoreBand
  /** Persian label shown beside the colour. */
  label: string
  /** Inclusive lower bound on the 1–10 scale. */
  min: number
  /** Text + icon colour. */
  text: string
  /** Tinted chip background. */
  chip: string
  /** Solid fill for bars, meters and dots. */
  fill: string
  /** CSS colour for charts and inline SVG. */
  color: string
}

/** Ordered high → low so `find` returns the first matching band. */
export const SCORE_BANDS: ScoreBandSpec[] = [
  {
    band: "strong",
    label: "عالی",
    min: 8,
    text: "text-score-strong",
    chip: "bg-success-subtle text-success",
    fill: "bg-score-strong",
    color: cssVar("score-strong"),
  },
  {
    band: "fair",
    label: "قابل قبول",
    min: 6,
    text: "text-score-fair",
    chip: "bg-info-subtle text-info",
    fill: "bg-score-fair",
    color: cssVar("score-fair"),
  },
  {
    band: "weak",
    label: "نیازمند بهبود",
    min: 4,
    text: "text-score-weak",
    chip: "bg-warning-subtle text-warning",
    fill: "bg-score-weak",
    color: cssVar("score-weak"),
  },
  {
    band: "critical",
    label: "بحرانی",
    min: 0,
    text: "text-score-critical",
    chip: "bg-danger-subtle text-danger",
    fill: "bg-score-critical",
    color: cssVar("score-critical"),
  },
]

/** The band a 1–10 score falls into. Values outside the range clamp. */
export function getScoreBand(score: number): ScoreBandSpec {
  const value = Number.isFinite(score) ? score : 0
  return SCORE_BANDS.find((b) => value >= b.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1]
}

/* ==========================================================================
   Numerals
   ========================================================================== */

/**
 * Format a number with Persian digits and a thousands separator.
 * Charts and table columns keep Latin digits so tabular alignment holds;
 * headline figures use this.
 */
export const faNumber = (value: number, fractionDigits = 0) =>
  new Intl.NumberFormat("fa-IR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number.isFinite(value) ? value : 0)

/** Percentage with a Persian sign, e.g. «۱۲٪». */
export const faPercent = (value: number, fractionDigits = 0) =>
  `${faNumber(value, fractionDigits)}٪`

/**
 * A Persian year, e.g. «۱۴۰۵».
 * A year is a label, not a quantity, so it keeps no thousands separator —
 * `faNumber` would render «۱٬۴۰۵».
 */
export const faYear = (value: number) =>
  new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(
    Number.isFinite(value) ? value : 0
  )
