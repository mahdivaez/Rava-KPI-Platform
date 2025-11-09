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
  CheckSquare,
  TrendingUp
} from "lucide-react"

export async function Sidebar() {
  const session = await auth()
  if (!session) return null

  const memberships = await prisma.workgroupMember.findMany({
    where: { userId: session.user.id },
  })

  const isStrategist = memberships.some(m => m.role === 'STRATEGIST')
  const isWriter = memberships.some(m => m.role === 'WRITER')

  return (
    <aside className="w-72 bg-white flex flex-col shadow-sm border-l border-nude-200">
      {/* Header */}
      <div className="p-6 border-b border-nude-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-nude-500 to-nude-600 flex items-center justify-center shadow-md shadow-nude-500/20">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-nude-900">سیستم KPI</h1>
            <p className="text-xs text-nude-500">مدیریت عملکرد</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <NavLink href="/dashboard" icon={<LayoutDashboard size={20} />} active>
          داشبورد
        </NavLink>

        {session.user.isAdmin && (
          <>
            <div className="pt-6 pb-2 px-2">
              <div className="text-xs font-semibold text-nude-500 uppercase tracking-wider">
                مدیریت
              </div>
            </div>
            <NavLink href="/admin/dashboard" icon={<PieChart size={20} />}>
              داشبورد تحلیلی
            </NavLink>
            <NavLink href="/admin/users" icon={<Users size={20} />}>
              کاربران
            </NavLink>
            <NavLink href="/admin/workgroups" icon={<FolderKanban size={20} />}>
              کارگروه‌ها
            </NavLink>
            <NavLink href="/admin/reports" icon={<BarChart3 size={20} />}>
              گزارشات
            </NavLink>
          </>
        )}

        {session.user.isTechnicalDeputy && (
          <>
            <div className="pt-6 pb-2 px-2">
              <div className="text-xs font-semibold text-nude-500 uppercase tracking-wider">
                معاون فنی
              </div>
            </div>
            <NavLink href="/evaluations/strategist" icon={<ClipboardCheck size={20} />}>
              ارزیابی استراتژیست‌ها
            </NavLink>
          </>
        )}

        {isStrategist && (
          <>
            <div className="pt-6 pb-2 px-2">
              <div className="text-xs font-semibold text-nude-500 uppercase tracking-wider">
                استراتژیست
              </div>
            </div>
            <NavLink href="/evaluations/writer" icon={<ClipboardCheck size={20} />}>
              ارزیابی نویسنده‌ها
            </NavLink>
            <NavLink href="/tasks" icon={<CheckSquare size={20} />}>
              وظایف تیم
            </NavLink>
          </>
        )}

        {isWriter && (
          <>
            <div className="pt-6 pb-2 px-2">
              <div className="text-xs font-semibold text-nude-500 uppercase tracking-wider">
                نویسنده
              </div>
            </div>
            <NavLink href="/my-tasks" icon={<CheckSquare size={20} />}>
              وظایف من
            </NavLink>
            <NavLink href="/feedback/send" icon={<MessageSquare size={20} />}>
              ارسال بازخورد
            </NavLink>
            <NavLink href="/my-performance" icon={<TrendingUp size={20} />}>
              عملکرد من
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-nude-200">
        <div className="text-xs text-center text-nude-500">
          <p className="font-medium">نسخه 1.0.0</p>
          <p className="mt-1">© 2024 تمام حقوق محفوظ است</p>
        </div>
      </div>
    </aside>
  )
}

function NavLink({ href, icon, children, active = false }: any) {
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
      <span>{children}</span>
      {active && (
        <div className="absolute right-0 w-1 h-8 bg-nude-500 rounded-r-full"></div>
      )}
    </Link>
  )
}
