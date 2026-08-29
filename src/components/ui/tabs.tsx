"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

const tabsListVariants = cva("", {
  variants: {
    variant: {
      /** Pill group on a sunken track — for switching a panel's content. */
      solid:
        "inline-flex h-11 w-fit max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-border bg-surface-sunken p-1",
      /** Underlined row — for page-level sections. */
      underline:
        "inline-flex w-full max-w-full items-center gap-1 overflow-x-auto border-b border-border",
    },
  },
  defaultVariants: { variant: "solid" },
})

const tabsTriggerVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium",
    "transition-[background-color,color,box-shadow,border-color] duration-fast ease-out",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        solid: [
          "h-9 rounded-lg px-4 text-sm text-foreground-muted",
          "hover:text-foreground",
          "data-[state=active]:bg-surface data-[state=active]:text-foreground data-[state=active]:shadow-xs",
        ].join(" "),
        underline: [
          "-mb-px h-11 border-b-2 border-transparent px-4 text-sm text-foreground-muted",
          "hover:border-border-strong hover:text-foreground",
          "data-[state=active]:border-primary data-[state=active]:text-primary",
        ].join(" "),
      },
    },
    defaultVariants: { variant: "solid" },
  }
)

function TabsList({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant ?? "solid"}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> &
  VariantProps<typeof tabsTriggerVariants>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 outline-none data-[state=active]:animate-in-fade",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
