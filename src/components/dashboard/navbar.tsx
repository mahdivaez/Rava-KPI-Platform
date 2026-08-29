"use client"

import * as React from "react"
import Link from "next/link"
import { LogOut, Menu, MessageSquareText, UserRound } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ThemeToggleCompact } from "@/components/theme/theme-toggle"
import { formatPersianDateWithWeekday } from "@/lib/utils"

interface NavbarContentProps {
  session: any
  avatarUrl?: string | null
  onMenuClick?: () => void
  signOutAction: () => Promise<void>
}

function initialsOf(name?: string | null) {
  if (!name) return "؟"
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0])
    .join("")
}

/** The account's highest-privilege label, for the header and the menu. */
function roleLabel(user: any) {
  if (user?.isAdmin) return "مدیر سیستم"
  if (user?.isTechnicalDeputy) return "معاون فنی"
  return "عضو تیم"
}

export function NavbarContent({
  session,
  avatarUrl,
  onMenuClick,
  signOutAction,
}: NavbarContentProps) {
  const user = session?.user ?? {}
  const initials = initialsOf(user.name)

  // Rendered client-side only: the server and the browser can disagree on the
  // current day across a midnight boundary, which would trip hydration.
  const [today, setToday] = React.useState<string | null>(null)
  React.useEffect(() => {
    setToday(formatPersianDateWithWeekday(new Date()))
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-sticky flex h-16 shrink-0 items-center justify-between gap-3",
        "border-b border-border bg-navbar/85 px-4 backdrop-blur-xl sm:px-6"
      )}
    >
      {/* Start side */}
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="باز کردن منو"
          className="lg:hidden"
        >
          <Menu className="size-5" aria-hidden />
        </Button>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {user.name}
          </p>
          <p className="truncate text-xs text-foreground-muted" suppressHydrationWarning>
            {today ?? " "}
          </p>
        </div>
      </div>

      {/* End side */}
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="hidden sm:inline-flex"
        >
          <Link href="/messages" aria-label="پیام‌ها" title="پیام‌ها">
            <MessageSquareText className="size-[18px]" aria-hidden />
          </Link>
        </Button>

        <ThemeToggleCompact />

        <div className="mx-1 h-6 w-px bg-border" aria-hidden />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex h-11 items-center gap-2 rounded-xl px-1.5 transition-colors duration-fast ease-out",
                "hover:bg-surface-hover",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              )}
              aria-label="منوی حساب کاربری"
            >
              <Avatar className="size-9 ring-1 ring-border">
                <AvatarImage src={avatarUrl || undefined} alt="" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" sideOffset={8} className="w-64">
            <DropdownMenuLabel className="normal-case">
              <div className="flex items-center gap-3 px-1 py-1.5">
                <Avatar className="size-10 ring-1 ring-border">
                  <AvatarImage src={avatarUrl || undefined} alt="" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs font-normal text-foreground-muted">
                    {user.email}
                  </p>
                </div>
              </div>
              <Badge
                variant={user.isAdmin ? "info" : "neutral"}
                size="sm"
                className="mx-1 mt-1"
              >
                {roleLabel(user)}
              </Badge>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserRound aria-hidden />
                پروفایل من
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/messages">
                <MessageSquareText aria-hidden />
                پیام‌ها
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                void signOutAction()
              }}
            >
              <LogOut aria-hidden />
              خروج از حساب
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
