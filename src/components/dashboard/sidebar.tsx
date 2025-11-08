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
  Sparkles
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
    <aside className="w-72 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col shadow-2xl border-l border-purple-500/20">
      {/* Header */}
      <div className="p-6 border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">سیستم KPI</h1>
            <p className="text-xs text-purple-300">مدیریت عملکرد</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavLink href="/dashboard" icon={<LayoutDashboard size={20} />} active>
          داشبورد
        </NavLink>

        {session.user.isAdmin && (
          <>
            <div className="pt-6 pb-2 px-3">
              <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                <div className="h-px flex-1 bg-purple-500/30"></div>
                <span>مدیریت</span>
                <div className="h-px flex-1 bg-purple-500/30"></div>
              </div>
            </div>
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
            <div className="pt-6 pb-2 px-3">
              <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                <div className="h-px flex-1 bg-purple-500/30"></div>
                <span>معاون فنی</span>
                <div className="h-px flex-1 bg-purple-500/30"></div>
              </div>
            </div>
            <NavLink href="/evaluations/strategist" icon={<ClipboardCheck size={20} />}>
              ارزیابی استراتژیست‌ها
            </NavLink>
          </>
        )}

        {isStrategist && (
          <>
            <div className="pt-6 pb-2 px-3">
              <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                <div className="h-px flex-1 bg-purple-500/30"></div>
                <span>استراتژیست</span>
                <div className="h-px flex-1 bg-purple-500/30"></div>
              </div>
            </div>
            <NavLink href="/evaluations/writer" icon={<ClipboardCheck size={20} />}>
              ارزیابی نویسنده‌ها
            </NavLink>
          </>
        )}

        {isWriter && (
          <>
            <div className="pt-6 pb-2 px-3">
              <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                <div className="h-px flex-1 bg-purple-500/30"></div>
                <span>نویسنده</span>
                <div className="h-px flex-1 bg-purple-500/30"></div>
              </div>
            </div>
            <NavLink href="/feedback/send" icon={<MessageSquare size={20} />}>
              ارسال بازخورد
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-purple-500/20">
        <div className="text-xs text-center text-purple-300">
          <p>نسخه 1.0.0</p>
          <p className="mt-1">ساخته شده با ❤️</p>
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
        group flex items-center gap-3 px-4 py-3 rounded-xl font-medium
        transition-all duration-300 relative overflow-hidden
        ${active 
          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white shadow-lg shadow-purple-500/20' 
          : 'text-purple-200 hover:text-white hover:bg-white/5'
        }
      `}
    >
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-pulse"></div>
      )}
      <div className={`
        relative z-10 transition-transform duration-300 group-hover:scale-110
        ${active ? 'text-purple-300' : ''}
      `}>
        {icon}
      </div>
      <span className="relative z-10 text-sm">{children}</span>
      {active && (
        <div className="absolute left-2 w-1 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
      )}
    </Link>
  )
}
