"use client"

import Link from "next/link"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggleCompact } from "@/components/theme/theme-toggle"

/**
 * Chrome for the client portal.
 *
 * Deliberately thinner than the internal dashboard: a client has exactly one
 * job here, so there is no sidebar, no navigation tree and no counters —
 * just who they are signed in as and a way out.
 */
export function ClientShell({
  contactName,
  brandName,
  signOutAction,
  children,
}: {
  contactName: string
  brandName: string
  signOutAction: () => Promise<void>
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-sticky border-b border-border bg-surface/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Link href="/client" className="flex min-w-0 items-center gap-3">
            <span className="font-display text-lg font-black leading-none tracking-tight text-foreground">
              Rava
            </span>
            <span
              aria-hidden
              className="h-5 w-px shrink-0 bg-border"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold leading-tight text-foreground">
                {brandName}
              </span>
              <span className="block truncate text-xs leading-tight text-foreground-muted">
                {contactName}
              </span>
            </span>
          </Link>

          <div className="ms-auto flex items-center gap-1">
            <ThemeToggleCompact />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                void signOutAction()
              }}
            >
              <LogOut aria-hidden />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>

      <footer className="border-t border-border py-6">
        <p className="mx-auto max-w-5xl px-4 text-center text-xs text-foreground-subtle sm:px-6">
          سامانه مدیریت عملکرد راوا
        </p>
      </footer>
    </div>
  )
}
