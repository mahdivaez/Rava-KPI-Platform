'use client'

import { useState } from "react"
import { SidebarContent } from "@/components/dashboard/sidebar"
import { NavbarContent } from "@/components/dashboard/navbar"
import { handleSignOut } from "@/app/actions/auth"

interface DashboardLayoutClientProps {
  session: any
  memberships: any[]
  children: React.ReactNode
}

export default function DashboardLayoutClient({
  session,
  memberships,
  children,
}: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarContent session={session} memberships={memberships} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        <NavbarContent session={session} onMenuClick={() => setSidebarOpen(true)} signOutAction={handleSignOut} />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}


