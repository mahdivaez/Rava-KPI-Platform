import * as React from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { cn } from "@/lib/utils"

export interface Crumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  /** Shown above the title. Three-plus levels deep, this is what orients people. */
  breadcrumbs?: Crumb[]
  /** Primary and secondary actions. At most one should look primary. */
  actions?: React.ReactNode
  /** Optional leading icon; decorative, so it is hidden from assistive tech. */
  icon?: React.ReactNode
  className?: string
}

/**
 * The single page-title treatment. Every screen uses it, so the heading level,
 * spacing and action placement are identical everywhere.
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  icon,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="مسیر صفحه">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-foreground-muted">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1
              return (
                <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
                  {i > 0 && (
                    <ChevronLeft
                      className="size-3.5 text-foreground-subtle"
                      aria-hidden
                    />
                  )}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="rounded transition-colors duration-fast hover:text-foreground"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(isLast && "font-medium text-foreground-secondary")}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3.5">
          {icon && (
            <span
              aria-hidden
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-subtle text-primary-subtle-foreground [&>svg]:size-5"
            >
              {icon}
            </span>
          )}
          <div className="min-w-0 space-y-1">
            <h1 className="truncate text-2xl font-bold text-foreground sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="text-sm leading-relaxed text-foreground-muted">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </header>
  )
}
