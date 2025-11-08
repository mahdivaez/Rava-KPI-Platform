import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  ClipboardCheck, 
  MessageSquare,
  BarChart3
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
    <aside className="w-64 bg-white border-l border-slate-200 flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-slate-900">سیستم KPI</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <NavLink href="/dashboard" icon={<LayoutDashboard size={20} />}>
          داشبورد
        </NavLink>

        {session.user.isAdmin && (
          <>
            <div className="pt-4 pb-2 px-2 text-xs font-semibold text-slate-500">
              مدیریت
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
            <div className="pt-4 pb-2 px-2 text-xs font-semibold text-slate-500">
              معاون فنی
            </div>
            <NavLink href="/evaluations/strategist" icon={<ClipboardCheck size={20} />}>
              ارزیابی استراتژیست‌ها
            </NavLink>
          </>
        )}

        {isStrategist && (
          <>
            <div className="pt-4 pb-2 px-2 text-xs font-semibold text-slate-500">
              استراتژیست
            </div>
            <NavLink href="/evaluations/writer" icon={<ClipboardCheck size={20} />}>
              ارزیابی نویسنده‌ها
            </NavLink>
          </>
        )}

        {isWriter && (
          <>
            <div className="pt-4 pb-2 px-2 text-xs font-semibold text-slate-500">
              نویسنده
            </div>
            <NavLink href="/feedback/send" icon={<MessageSquare size={20} />}>
              ارسال بازخورد
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  )
}

function NavLink({ href, icon, children }: any) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
    >
      {icon}
      <span className="text-sm font-medium">{children}</span>
    </Link>
  )
}

