import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import {
  Users,
  FolderKanban,
  TrendingUp,
  MessageSquareText,
  User,
  PieChart,
  UserRoundCog,
  BarChart3,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  Mail,
  ClipboardCheck
} from "lucide-react"
import { getRoleBadgeClass, getRoleLabel, isTeamRole, type TeamRole } from "@/lib/roles"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  // Check if database is available
  if (!prisma) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-gradient-to-br from-nude-50 to-white border border-nude-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-nude-900 mb-4">
            خوش آمدید، {session.user.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-nude-600">
            دیتابیس در دسترس نیست. این یک محیط توسعه است و از کاربران تست استفاده می‌شود.
          </p>
        </div>
      </div>
    )
  }

  // Database is available, use it
  const prismaClient = prisma as any

  // Get user data
  const currentUser = await prismaClient.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  })


  // Get unread messages
  const unreadMessages = await prismaClient.message.count({
    where: {
      receiverId: session.user.id,
      isRead: false,
    },
  })

  // Check roles
  const isStrategist = await prismaClient.workgroupMember.findFirst({
    where: { userId: session.user.id, role: 'STRATEGIST' },
  })

  const memberships = await prismaClient.workgroupMember.findMany({
    where: { userId: session.user.id },
    include: { workgroup: true },
  })

  const strategistGroups = memberships
    .filter(m => m.role === 'STRATEGIST')
    .map(m => m.workgroup)

  const writerGroups = memberships
    .filter(m => m.role === 'WRITER')
    .map(m => m.workgroup)

  // Every distinct workgroup role this user holds, for badges and quick actions.
  const myTeamRoles: TeamRole[] = Array.from(
    new Set<TeamRole>(
      memberships.map((m: any) => m.role).filter(isTeamRole)
    )
  )

  // Get stats for admin
  let adminStats = null
  if (session.user.isAdmin) {
    adminStats = {
      totalUsers: await prismaClient.user.count(),
      totalMessages: await prismaClient.message.count(),
    }
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Header with Profile */}
      <div className="bg-gradient-to-br from-nude-50 to-white border border-nude-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 border-2 sm:border-4 border-nude-200">
              <AvatarImage src={currentUser?.image || undefined} />
              <AvatarFallback className="bg-nude-200 text-nude-700 text-base sm:text-lg lg:text-xl font-bold">
                {getInitials(session.user.name || '')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-nude-900 mb-1">
                خوش آمدید، {session.user.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-nude-600 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {session.user.isAdmin && <Badge className="badge-error text-xs">مدیر سیستم</Badge>}
                {session.user.isTechnicalDeputy && <Badge className="badge-neutral text-xs">معاون فنی</Badge>}
                {myTeamRoles.map(role => (
                  <Badge key={role} className={`text-xs ${getRoleBadgeClass(role)}`}>
                    {getRoleLabel(role)}
                  </Badge>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Quick Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Link href="/messages">
          <Card className="card-nude card-hover border-nude-200 cursor-pointer">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-nude-600 mb-1">پیام‌های جدید</p>
                  <p className="text-2xl sm:text-3xl font-bold text-info">{unreadMessages}</p>
                </div>
                <MessageSquareText className="w-8 h-8 sm:w-10 sm:h-10 text-info" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/profile" className="col-span-2 lg:col-span-1">
          <Card className="card-nude card-hover border-nude-200 cursor-pointer">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-nude-600 mb-1">پروفایل من</p>
                  <p className="text-2xl sm:text-3xl font-bold text-nude-500"><User className="w-7 h-7 sm:w-8 sm:h-8" /></p>
                </div>
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-nude-500" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Admin Quick Access */}
      {session.user.isAdmin && adminStats && (
        <Card className="border-nude-200 bg-gradient-to-br from-nude-50 to-white">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-nude-900 flex items-center gap-2 text-base sm:text-lg">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-nude-500" />
                  پنل مدیریت
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">دسترسی سریع به امکانات مدیریتی</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 mb-3 sm:mb-4">
              <div className="p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-nude-200">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-nude-500 mb-2" />
                <p className="text-xl sm:text-2xl font-bold text-nude-900">{adminStats.totalUsers}</p>
                <p className="text-xs sm:text-sm text-nude-600">کاربران</p>
              </div>
              <div className="p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-nude-200">
                <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-nude-500 mb-2" />
                <p className="text-xl sm:text-2xl font-bold text-nude-900">{adminStats.totalMessages}</p>
                <p className="text-xs sm:text-sm text-nude-600">پیام‌ها</p>
              </div>
              <div className="p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-nude-200">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-nude-500 mb-2" />
                <p className="text-xl sm:text-2xl font-bold text-nude-900">گزارشات</p>
                <p className="text-xs sm:text-sm text-nude-600">آمار کامل</p>
              </div>
            </div>
            
            <div className="grid gap-3 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
              <Link href="/admin/dashboard" className="p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-nude-200 hover:bg-nude-50 hover:border-nude-300 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-nude-500" />
                  <ArrowRight className="w-4 h-4 text-nude-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-semibold text-sm sm:text-base text-nude-900">داشبورد تحلیلی</p>
                <p className="text-xs text-nude-600 mt-1">آمار و نمودارها</p>
              </Link>

              <Link href="/admin/roles" className="p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-nude-200 hover:bg-nude-50 hover:border-nude-300 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <UserRoundCog className="w-5 h-5 sm:w-6 sm:h-6 text-nude-500" />
                  <ArrowRight className="w-4 h-4 text-nude-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-semibold text-sm sm:text-base text-nude-900">ویرایش نقش‌ها</p>
                <p className="text-xs text-nude-600 mt-1">مدیریت دسترسی‌ها</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Features - Universal Section */}
      <Card className="border-nude-200">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-nude-900 flex items-center gap-2 text-base sm:text-lg">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-nude-500" />
            امکانات من
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">دسترسی سریع به ویژگی‌های شما</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {/* Profile */}
            <Link href="/profile" className="p-3 sm:p-4 bg-nude-50 rounded-lg sm:rounded-xl border border-nude-200 hover:bg-nude-100 hover:border-nude-300 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-nude-500" />
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-nude-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="font-semibold text-sm sm:text-base text-nude-900">پروفایل</p>
              <p className="text-xs text-nude-600 mt-1">مشاهده و ویرایش</p>
            </Link>


            {/* Messages */}
            <Link href="/messages" className="p-3 sm:p-4 bg-nude-50 rounded-lg sm:rounded-xl border border-nude-200 hover:bg-nude-100 hover:border-nude-300 transition-all group relative">
              <div className="flex items-center justify-between mb-2">
                <MessageSquareText className="w-5 h-5 sm:w-6 sm:h-6 text-info" />
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-nude-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="font-semibold text-sm sm:text-base text-nude-900">پیام‌ها</p>
              <p className="text-xs text-nude-600 mt-1">
                {unreadMessages > 0 ? `${unreadMessages} پیام جدید` : 'پیام‌های من'}
              </p>
              {unreadMessages > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-destructive rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {unreadMessages}
                </div>
              )}
            </Link>

            {/* Evaluations - Only for Deputy/Admin */}
            {(session.user.isTechnicalDeputy || session.user.isAdmin) && (
              <Link href="/evaluations/strategist" className="p-3 sm:p-4 bg-nude-50 rounded-lg sm:rounded-xl border border-nude-200 hover:bg-nude-100 hover:border-nude-300 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-nude-500" />
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-nude-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-semibold text-sm sm:text-base text-nude-900">ارزیابی استراتژیست</p>
                <p className="text-xs text-nude-600 mt-1">ثبت ارزیابی</p>
              </Link>
            )}

            {/* Role-based team evaluation - anyone holding a workgroup role */}
            {(myTeamRoles.length > 0 || session.user.isAdmin) && (
              <Link href="/evaluations/team" className="p-3 sm:p-4 bg-nude-50 rounded-lg sm:rounded-xl border border-nude-200 hover:bg-nude-100 hover:border-nude-300 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-nude-500" />
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-nude-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-semibold text-sm sm:text-base text-nude-900">ارزیابی تیم</p>
                <p className="text-xs text-nude-600 mt-1">ارزیابی همکاران بر اساس نقش</p>
              </Link>
            )}

            {/* Writer Evaluation - Only for Strategists/Admin */}
            {(isStrategist || session.user.isAdmin) && (
              <Link href="/evaluations/writer" className="p-3 sm:p-4 bg-nude-50 rounded-lg sm:rounded-xl border border-nude-200 hover:bg-nude-100 hover:border-nude-300 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-nude-500" />
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-nude-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-semibold text-sm sm:text-base text-nude-900">ارزیابی نویسنده</p>
                <p className="text-xs text-nude-600 mt-1">ثبت ارزیابی</p>
              </Link>
            )}

            {/* Feedback for Strategists */}
            {isStrategist && (
              <Link href="/feedback/send" className="p-3 sm:p-4 bg-nude-50 rounded-lg sm:rounded-xl border border-nude-200 hover:bg-nude-100 hover:border-nude-300 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <MessageSquareText className="w-5 h-5 sm:w-6 sm:h-6 text-nude-500" />
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-nude-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-semibold text-sm sm:text-base text-nude-900">ارسال بازخورد</p>
                <p className="text-xs text-nude-600 mt-1">به استراتژیست‌ها</p>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* My Workgroups */}
      {(strategistGroups.length > 0 || writerGroups.length > 0) && (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Strategist Workgroups */}
          {strategistGroups.length > 0 && (
            <Card className="border-nude-200">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-nude-900 flex items-center gap-2 text-base sm:text-lg">
                  <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5 text-info" />
                  کارگروه‌های استراتژیست
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-2 sm:space-y-3">
                  {strategistGroups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-3 bg-nude-50 rounded-lg sm:rounded-xl border border-nude-200">
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="font-semibold text-sm sm:text-base text-nude-900 truncate">{group.name}</p>
                        {group.description && (
                          <p className="text-xs sm:text-sm text-nude-600 mt-1 line-clamp-2">{group.description}</p>
                        )}
                      </div>
                      <Badge className={`${group.isActive ? "badge-success" : "badge-neutral"} text-xs whitespace-nowrap`}>
                        {group.isActive ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Writer Workgroups */}
          {writerGroups.length > 0 && (
            <Card className="border-nude-200">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-nude-900 flex items-center gap-2 text-base sm:text-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                  کارگروه‌های نویسنده
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-2 sm:space-y-3">
                  {writerGroups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-3 bg-nude-50 rounded-lg sm:rounded-xl border border-nude-200">
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="font-semibold text-sm sm:text-base text-nude-900 truncate">{group.name}</p>
                        {group.description && (
                          <p className="text-xs sm:text-sm text-nude-600 mt-1 line-clamp-2">{group.description}</p>
                        )}
                      </div>
                      <Badge className={`${group.isActive ? "badge-success" : "badge-neutral"} text-xs whitespace-nowrap`}>
                        {group.isActive ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
