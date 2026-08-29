"use client"

import * as React from "react"

import { SidebarContent } from "@/components/dashboard/sidebar"
import { NavbarContent } from "@/components/dashboard/navbar"
import { handleSignOut } from "@/app/actions/auth"

const COLLAPSE_KEY = "rava:sidebar-collapsed"

interface DashboardLayoutClientProps {
  session: any
  memberships: any[]
  avatarUrl?: string | null
  children: React.ReactNode
}

export default function DashboardLayoutClient({
  session,
  memberships,
  avatarUrl,
  children,
}: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState(false)

  // Read the saved rail state after mount — the server cannot know it, and
  // reading it during render would mismatch on hydration.
  React.useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1")
    } catch {
      /* private mode or blocked storage — the default is fine. */
    }
  }, [])

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0")
      } catch {
        /* not persisting is acceptable; the session still works. */
      }
      return next
    })
  }, [])

  const closeSidebar = React.useCallback(() => setSidebarOpen(false), [])

  return (
    <div className="flex min-h-dvh bg-background">
      <SidebarContent
        session={session}
        memberships={memberships}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <NavbarContent
          session={session}
          avatarUrl={avatarUrl}
          onMenuClick={() => setSidebarOpen(true)}
          signOutAction={handleSignOut}
        />

        {/* Skip target: keyboard users land here after a route change. */}
        <main
          id="main"
          tabIndex={-1}
          className="flex-1 scroll-gutter px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8"
        >
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
