import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap",
    "rounded-lg font-medium select-none",
    // One motion rhythm for the whole product.
    "transition-[background-color,border-color,color,box-shadow,transform] duration-fast ease-out",
    // Pressed feedback that never moves neighbouring layout.
    "active:scale-[0.98]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    // Reduces the 300ms tap delay on touch devices.
    "touch-manipulation",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-surface-hover",
        outline:
          "border border-border bg-surface text-foreground shadow-xs hover:border-border-strong hover:bg-surface-hover",
        subtle:
          "bg-primary-subtle text-primary-subtle-foreground hover:bg-primary/15",
        ghost: "text-foreground-secondary hover:bg-surface-hover hover:text-foreground",
        destructive:
          "bg-danger text-danger-foreground shadow-xs hover:bg-danger/90 focus-visible:outline-danger",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // 40px: comfortably above the 44px target once padding is counted,
        // and the mobile variants below go taller still.
        default: "h-10 px-4 text-sm",
        sm: "h-8 gap-1.5 rounded-md px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "size-10",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Shows a spinner and blocks interaction while an action is in flight. */
  loading?: boolean
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  // `asChild` forwards to a single element, so the spinner is only injected
  // when this component owns the markup.
  if (asChild) {
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Comp>
    )
  }

  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
