import * as React from "react"

import { cn } from "@/lib/utils"
import { getRoleLabel, isTeamRole } from "@/lib/roles"
import { ROLE_CHIP_CLASS, ROLE_DOT_CLASS } from "@/lib/design-tokens"

interface RoleBadgeProps extends React.ComponentProps<"span"> {
  role: string
  size?: "sm" | "default"
  /** Hide the colour dot when the chip already sits in a colour-coded row. */
  showDot?: boolean
}

/**
 * A team-role chip.
 *
 * The Persian label carries the identity; the dot repeats it in colour so the
 * same role is recognisable at a glance in a table, a legend and a chart.
 * Colour never carries the meaning on its own.
 */
export function RoleBadge({
  role,
  size = "default",
  showDot = true,
  className,
  ...props
}: RoleBadgeProps) {
  const known = isTeamRole(role)

  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-semibold",
        size === "sm" ? "px-2 py-0.5 text-2xs" : "px-2.5 py-1 text-xs",
        known
          ? ROLE_CHIP_CLASS[role]
          : "bg-muted text-foreground-secondary",
        className
      )}
      {...props}
    >
      {showDot && (
        <span
          aria-hidden
          className={cn(
            "size-1.5 shrink-0 rounded-full ring-1 ring-inset ring-black/10",
            known ? ROLE_DOT_CLASS[role] : "bg-foreground-subtle"
          )}
        />
      )}
      {getRoleLabel(role)}
    </span>
  )
}
