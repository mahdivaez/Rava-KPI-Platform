import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * A leaderboard position.
 *
 * The numeral carries the rank; the top three are additionally tinted. Medal
 * emoji are avoided — they render differently on every platform and cannot be
 * themed or sized from tokens.
 */
export function RankBadge({
  rank,
  className,
}: {
  /** One-based position. */
  rank: number
  className?: string
}) {
  const podium = rank <= 3

  return (
    <span
      data-numeric
      aria-label={`رتبه ${rank}`}
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold",
        podium
          ? "bg-primary text-primary-foreground"
          : "bg-surface-sunken text-foreground-muted",
        rank === 2 && "bg-primary/70",
        rank === 3 && "bg-primary/45",
        className
      )}
    >
      {rank.toLocaleString("fa-IR")}
    </span>
  )
}
