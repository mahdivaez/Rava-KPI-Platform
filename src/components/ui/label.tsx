"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex select-none items-center gap-1.5 text-sm font-medium leading-snug text-foreground-secondary",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        className
      )}
      {...props}
    />
  )
}

/** Marks a required field. Screen readers get the word, not just the glyph. */
function RequiredMark() {
  return (
    <span className="text-danger" aria-hidden>
      *<span className="sr-only">الزامی</span>
    </span>
  )
}

export { Label, RequiredMark }
