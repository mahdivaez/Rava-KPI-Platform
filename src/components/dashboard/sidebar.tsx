'use client'

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ClipboardCheck,
  MessageSquare,
  BarChart3,
  Target,
  PieChart,
  TrendingUp,
  X
} from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

interface SidebarProps {
  session: any
  memberships: any[]
  isOpen?: boolean
  onClose?: () => void
}

export function SidebarContent({ session, memberships, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  
  const isStrategist = memberships.some(m => m.role === 'STRATEGIST')
  const isWriter = memberships.some(m => m.role === 'WRITER')

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (onClose) {
      onClose()
    }
  }, [pathname])

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-50
        w-72 bg-white flex flex-col shadow-sm border-l border-nude-200
        transform transition-transform duration-300 ease-in-out
        lg:transform-none
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-nude-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-nude-500 to-nude-600 flex items-center justify-center shadow-md shadow-nude-500/20">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-nude-900">سیستم KPI</h1>
              <p className="text-xs text-nude-500">مدیریت عملکرد</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-nude-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-nude-600" />
          </button>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
        <NavLink href="/dashboard" icon={<LayoutDashboard size={20} />} pathname={pathname}>
          داشبورد
        </NavLink>

        {session.user.isAdmin && (
          <>
            <div className="pt-4 sm:pt-6 pb-2 px-2">
              <div className="text-xs font-semibold text-nude-500 uppercase tracking-wider">
                مدیریت
              </div>
            </div>
            <NavLink href="/admin/dashboard" icon={<PieChart size={20} />} pathname={pathname}>
              داشبورد تحلیلی
            </NavLink>
            <NavLink href="/admin/users" icon={<Users size={20} />} pathname={pathname}>
              کاربران
            </NavLink>
            <NavLink href="/admin/workgroups" icon={<FolderKanban size={20} />} pathname={pathname}>
              کارگروه‌ها
            </NavLink>
            <NavLink href="/admin/reports" icon={<BarChart3 size={20} />} pathname={pathname}>
              گزارشات
            </NavLink>
          </>
        )}

        {session.user.isTechnicalDeputy && (
          <>
            <div className="pt-4 sm:pt-6 pb-2 px-2">
              <div className="text-xs font-semibold text-nude-500 uppercase tracking-wider">
                معاون فنی
              </div>
            </div>
            <NavLink href="/evaluations/strategist" icon={<ClipboardCheck size={20} />} pathname={pathname}>
          ارزیابی‌های معاون فنی         </NavLink>
          </>
        )}

        {isStrategist && (
          <>
            <div className="pt-4 sm:pt-6 pb-2 px-2">
              <div className="text-xs font-semibold text-nude-500 uppercase tracking-wider">
                استراتژیست
              </div>
            </div>
            <NavLink href="/evaluations/writer" icon={<ClipboardCheck size={20} />} pathname={pathname}>
              ارزیابی نویسنده‌ها
            </NavLink>
          </>
        )}

        {isWriter && (
          <>
            <div className="pt-4 sm:pt-6 pb-2 px-2">
              <div className="text-xs font-semibold text-nude-500 uppercase tracking-wider">
                نویسنده
              </div>
            </div>
            <NavLink href="/feedback/send" icon={<MessageSquare size={20} />} pathname={pathname}>
              ارسال بازخورد
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-nude-200">
        <div className="text-xs text-center text-nude-500">
          <p className="font-medium">نسخه 1.0.0</p>
          <p className="mt-1">© 2024 تمام حقوق محفوظ است</p>
        </div>
      </div>
    </aside>
    </>
  )
}

function NavLink({ href, icon, children, pathname }: any) {
  const active = pathname === href || pathname?.startsWith(href + '/')
  
  return (
    <Link
      href={href}
      className={`
        group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm
        transition-all duration-200 relative
        ${active 
          ? 'bg-nude-100 text-nude-900 shadow-sm' 
          : 'text-nude-600 hover:text-nude-900 hover:bg-nude-50'
        }
      `}
    >
      <div className={`
        transition-all duration-200
        ${active ? 'text-nude-700' : 'text-nude-400 group-hover:text-nude-600'}
      `}>
        {icon}
      </div>
      <span className="text-sm">{children}</span>
      {active && (
        <div className="absolute right-0 w-1 h-8 bg-nude-500 rounded-r-full"></div>
      )}
    </Link>
  )
}

// Server Component Wrapper
export async function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const session = await auth()
  if (!session) return null

  const memberships = await prisma.workgroupMember.findMany({
    where: { userId: session.user.id },
  })

  return <SidebarContent session={session} memberships={memberships} isOpen={isOpen} onClose={onClose} />
}
