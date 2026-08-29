"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

/**
 * The thumb travels toward the reading end, so in RTL "on" sits on the left.
 * Tailwind does not mirror translate utilities, hence the explicit rtl: pair.
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
      "border-2 border-transparent p-0 transition-colors duration-base ease-out",
      "bg-border-strong data-[state=checked]:bg-primary",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        // The knob stays white in both themes so it reads against the filled track.
        "pointer-events-none block size-5 rounded-full bg-white shadow-sm ring-0",
        "transition-transform duration-base ease-spring",
        "translate-x-0 data-[state=checked]:translate-x-5",
        "rtl:data-[state=checked]:-translate-x-5"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
