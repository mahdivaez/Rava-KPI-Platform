import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  FolderKanban, 
  TrendingUp, 
  Award,
  Sparkles,
  Target
} from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const memberships = await prisma.workgroupMember.findMany({
    where: { userId: session.user.id },
    include: { workgroup: true },
  })

  const strategistGroups = memberships
    .filter(m => m.role === 'STRATEGIST')
    .map(m => m.workgroup)

  const writerGroups = memberships
    .filter(m => m.role === 'WRITER')
    .map(m => m.workgroup)

  // Get stats for admin
  let stats = null
  if (session.user.isAdmin) {
    stats = {
      totalUsers: await prisma.user.count(),
      totalWorkgroups: await prisma.workgroup.count(),
      totalEvaluations: await prisma.strategistEvaluation.count() + await prisma.writerEvaluation.count(),
      totalFeedbacks: await prisma.writerFeedback.count(),
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-3xl"></div>
        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl shadow-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                خوش آمدید، {session.user.name}
              </h1>
              <p className="text-purple-100 text-lg">
                داشبورد اصلی سیستم مدیریت KPI
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20">
                <Award className="w-12 h-12" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Badges */}
      <div className="flex gap-3 flex-wrap">
        {session.user.isAdmin && (
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 text-sm shadow-lg shadow-blue-500/30 border-0">
            <Users className="w-4 h-4 ml-1" />
            مدیر سیستم
          </Badge>
        )}
        {session.user.isTechnicalDeputy && (
          <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 text-sm shadow-lg shadow-purple-500/30 border-0">
            <Target className="w-4 h-4 ml-1" />
            معاون فنی
          </Badge>
        )}
        {strategistGroups.length > 0 && (
          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 text-sm shadow-lg shadow-emerald-500/30 border-0">
            <TrendingUp className="w-4 h-4 ml-1" />
            استراتژیست ({strategistGroups.length} کارگروه)
          </Badge>
        )}
        {writerGroups.length > 0 && (
          <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 text-sm shadow-lg shadow-amber-500/30 border-0">
            <FolderKanban className="w-4 h-4 ml-1" />
            نویسنده ({writerGroups.length} کارگروه)
          </Badge>
        )}
      </div>

      {/* Admin Stats */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="کاربران"
            value={stats.totalUsers}
            gradient="from-blue-500 to-cyan-500"
            icon={<Users className="w-6 h-6" />}
          />
          <StatsCard
            title="کارگروه‌ها"
            value={stats.totalWorkgroups}
            gradient="from-purple-500 to-pink-500"
            icon={<FolderKanban className="w-6 h-6" />}
          />
          <StatsCard
            title="ارزیابی‌ها"
            value={stats.totalEvaluations}
            gradient="from-emerald-500 to-teal-500"
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <StatsCard
            title="بازخوردها"
            value={stats.totalFeedbacks}
            gradient="from-amber-500 to-orange-500"
            icon={<Award className="w-6 h-6" />}
          />
        </div>
      )}

      {/* Workgroups */}
      <div className="grid gap-6 md:grid-cols-2">
        {strategistGroups.length > 0 && (
          <Card className="border-0 shadow-xl shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 card-hover">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                  <TrendingUp className="w-5 h-5" />
                </div>
                کارگروه‌های استراتژیست
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {strategistGroups.map(wg => (
                  <div
                    key={wg.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 border border-purple-100 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                      <span className="font-medium text-slate-900 group-hover:text-purple-700 transition-colors">{wg.name}</span>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">استراتژیست</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {writerGroups.length > 0 && (
          <Card className="border-0 shadow-xl shadow-amber-500/10 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 card-hover">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                  <FolderKanban className="w-5 h-5" />
                </div>
                کارگروه‌های نویسنده
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {writerGroups.map(wg => (
                  <div
                    key={wg.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all duration-300 border border-amber-100 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
                      <span className="font-medium text-slate-900 group-hover:text-amber-700 transition-colors">{wg.name}</span>
                    </div>
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">نویسنده</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function StatsCard({ 
  title, 
  value, 
  gradient, 
  icon 
}: { 
  title: string
  value: number
  gradient: string
  icon: React.ReactNode
}) {
  return (
    <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 card-hover overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent">
              {value}
            </h3>
          </div>
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
