import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 whitespace-nowrap",
    "rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-5",
    "transition-colors duration-fast ease-out",
    "[&>svg]:pointer-events-none [&>svg]:size-3",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border bg-transparent text-foreground-secondary",
        neutral: "border-transparent bg-muted text-foreground-secondary",
        // Status variants always appear beside an icon or a word, so the
        // colour is reinforcement rather than the only signal.
        success: "border-transparent bg-success-subtle text-success",
        warning: "border-transparent bg-warning-subtle text-warning",
        danger: "border-transparent bg-danger-subtle text-danger",
        /** Alias of `danger`, kept for shadcn call-site compatibility. */
        destructive: "border-transparent bg-danger-subtle text-danger",
        info: "border-transparent bg-info-subtle text-info",
      },
      size: {
        sm: "px-2 py-0 text-2xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
    },
  }
)

interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
  /** Renders a leading colour dot. Pass a background utility, e.g. `bg-role-3`. */
  dot?: string
}

function Badge({
  className,
  variant,
  size,
  asChild = false,
  dot,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          aria-hidden
          className={cn(
            "size-1.5 shrink-0 rounded-full ring-1 ring-inset ring-black/10",
            dot
          )}
        />
      )}
      {children}
    </Comp>
  )
}

export { Badge, badgeVariants }
export type { BadgeProps }
