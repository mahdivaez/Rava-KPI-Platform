import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "flex flex-col rounded-xl border bg-card text-card-foreground",
  {
    variants: {
      elevation: {
        flat: "border-border shadow-none",
        raised: "border-border shadow-sm",
        floating: "border-border shadow-md",
      },
      interactive: {
        true: [
          "transition-[border-color,box-shadow,transform] duration-base ease-out",
          "hover:border-border-strong hover:shadow-md",
          "focus-within:border-border-strong",
        ].join(" "),
        false: "",
      },
    },
    defaultVariants: {
      elevation: "raised",
      interactive: false,
    },
  }
)

function Card({
  className,
  elevation,
  interactive,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ elevation, interactive }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        // Title + description stack by default; when a CardAction is present
        // the header becomes two columns and the action spans both rows.
        "grid auto-rows-min items-start gap-1 px-5 pt-5 pb-4 sm:px-6 sm:pt-6",
        "has-[[data-slot=card-action]]:grid-cols-[1fr_auto]",
        className
      )}
      {...props}
    />
  )
}

/** Wraps the title + description so a CardAction can sit opposite them. */
function CardHeaderText({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header-text"
      className={cn("min-w-0 space-y-1", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-base font-semibold leading-snug text-foreground", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm leading-relaxed text-foreground-muted", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 flex shrink-0 items-center gap-2 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5 pb-5 sm:px-6 sm:pb-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-3 border-t border-border-subtle px-5 py-4 sm:px-6",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardHeaderText,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
