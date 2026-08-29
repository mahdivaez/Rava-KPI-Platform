"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PanelRightClose, PanelRightOpen, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { BrandLockup } from "@/components/dashboard/brand"
import {
  buildNavigation,
  isActivePath,
  type NavItem,
} from "@/components/dashboard/nav-config"

interface SidebarProps {
  session: any
  memberships: any[]
  /** Mobile drawer state. On desktop the rail is always mounted. */
  isOpen?: boolean
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapsed?: () => void
}

export function SidebarContent({
  session,
  memberships,
  isOpen,
  onClose,
  collapsed = false,
  onToggleCollapsed,
}: SidebarProps) {
  const pathname = usePathname() ?? ""

  const sections = React.useMemo(
    () =>
      buildNavigation({
        isAdmin: Boolean(session?.user?.isAdmin),
        isTechnicalDeputy: Boolean(session?.user?.isTechnicalDeputy),
        isTeamMember: memberships.length > 0,
      }),
    [session?.user?.isAdmin, session?.user?.isTechnicalDeputy, memberships.length]
  )

  // Dismiss the mobile drawer once navigation actually happens — not on mount,
  // which would fight a deliberate open.
  const previousPath = React.useRef(pathname)
  React.useEffect(() => {
    if (previousPath.current !== pathname) {
      previousPath.current = pathname
      onClose?.()
    }
  }, [pathname, onClose])

  // Escape closes the drawer, per the escape-routes rule.
  React.useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  return (
    <>
      {/* Scrim: strong enough to isolate the drawer, and dismisses on tap. */}
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-drawer bg-overlay/50 backdrop-blur-sm transition-opacity duration-base ease-out lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        aria-label="ناوبری اصلی"
        className={cn(
          // Anchored to the reading-start edge: the right in RTL, the left in
          // LTR. The closed transform has to be spelled out per direction —
          // translate percentages are physical, not logical.
          "fixed inset-y-0 start-0 z-drawer flex translate-x-0 flex-col",
          "border-e border-sidebar-border bg-sidebar",
          "transition-[transform,width] duration-slow ease-out",
          "lg:static lg:z-base",
          collapsed ? "w-[76px]" : "w-[272px]",
          // Scoped to `max-lg` on purpose: the rtl/ltr variants outrank the
          // breakpoint ones, so an unscoped `rtl:translate-x-full` would keep
          // the desktop rail pushed off-screen.
          !isOpen && "max-lg:rtl:translate-x-full max-lg:ltr:-translate-x-full"
        )}
      >
        {/* Brand */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border",
            collapsed ? "justify-center px-3" : "justify-between ps-5 pe-3"
          )}
        >
          <Link
            href="/dashboard"
            className="min-w-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <BrandLockup compact={collapsed} />
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={onClose}
              aria-label="بستن منو"
              className="grid size-9 shrink-0 place-items-center rounded-lg text-foreground-muted transition-colors duration-fast hover:bg-surface-hover hover:text-foreground lg:hidden"
            >
              <X className="size-5" aria-hidden />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {sections.map((section, i) => (
            <div key={section.title ?? `section-${i}`} className="space-y-1">
              {section.title && !collapsed && (
                <p className="section-label px-3 pb-1.5">{section.title}</p>
              )}
              {section.title && collapsed && (
                <div className="mx-auto mb-2 h-px w-8 bg-sidebar-border" aria-hidden />
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      item={item}
                      active={isActivePath(pathname, item.href)}
                      collapsed={collapsed}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Collapse control — desktop only; the drawer has its own close. */}
        <div className="hidden shrink-0 border-t border-sidebar-border p-3 lg:block">
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "باز کردن منو" : "جمع کردن منو"}
            title={collapsed ? "باز کردن منو" : "جمع کردن منو"}
            className={cn(
              "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium",
              "text-foreground-muted transition-colors duration-fast ease-out",
              "hover:bg-surface-hover hover:text-foreground",
              collapsed && "justify-center px-0"
            )}
          >
            {collapsed ? (
              <PanelRightOpen className="size-[18px] shrink-0" aria-hidden />
            ) : (
              <PanelRightClose className="size-[18px] shrink-0" aria-hidden />
            )}
            {!collapsed && <span>جمع کردن منو</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
}) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex h-11 items-center gap-3 rounded-lg text-sm font-medium",
        "transition-colors duration-fast ease-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        collapsed ? "justify-center px-0" : "px-3",
        active
          ? "bg-sidebar-active text-sidebar-active-foreground"
          : "text-sidebar-foreground hover:bg-surface-hover hover:text-foreground"
      )}
    >
      {/* Current location is marked by a bar as well as by colour. The bar
          sits on the rail's outer edge, clear of the divider on the inner one. */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-2 start-0 w-[3px] rounded-full bg-primary transition-opacity duration-fast",
          active ? "opacity-100" : "opacity-0"
        )}
      />
      <Icon
        className={cn(
          "size-[18px] shrink-0 transition-colors duration-fast",
          active ? "text-primary" : "text-foreground-subtle group-hover:text-foreground-secondary"
        )}
        aria-hidden
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  )
}
