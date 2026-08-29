import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  [
    "relative grid w-full items-start gap-x-3 gap-y-1 rounded-xl border px-4 py-3.5 text-sm",
    "grid-cols-[0_1fr] [&:has(>svg)]:grid-cols-[1rem_1fr]",
    "[&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-current",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "border-border bg-surface-sunken text-foreground",
        info: "border-info/25 bg-info-subtle text-info",
        success: "border-success/25 bg-success-subtle text-success",
        warning: "border-warning/25 bg-warning-subtle text-warning",
        destructive: "border-danger/25 bg-danger-subtle text-danger",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 font-semibold leading-snug", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 text-sm leading-relaxed opacity-90 [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
