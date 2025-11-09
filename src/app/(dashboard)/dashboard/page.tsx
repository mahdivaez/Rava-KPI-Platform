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
  Target,
  ListTodo,
  MessageSquareText,
  Trophy,
  User,
  PieChart,
  Goal,
  UserRoundCog,
  BarChart3,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  Mail
} from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  // Get user data
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totalPoints: true, image: true },
  })

  // Get user's goals
  const myGoals = await prisma.goal.count({
    where: { userId: session.user.id, isActive: true },
  })

  // Get user's tasks
  const myTasks = await prisma.task.count({
    where: { 
      assignedTo: session.user.id,
      status: { not: 'COMPLETED' },
    },
  })

  // Get unread messages
  const unreadMessages = await prisma.message.count({
    where: {
      receiverId: session.user.id,
      isRead: false,
    },
  })

  // Check roles
  const isStrategist = await prisma.workgroupMember.findFirst({
    where: { userId: session.user.id, role: 'STRATEGIST' },
  })

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
  let adminStats = null
  if (session.user.isAdmin) {
    adminStats = {
      totalUsers: await prisma.user.count(),
      totalGoals: await prisma.goal.count({ where: { isActive: true } }),
      totalTasks: await prisma.task.count(),
      totalMessages: await prisma.message.count(),
    }
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header with Profile */}
      <div className="bg-gradient-to-br from-nude-50 to-white border border-nude-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-4 border-nude-200">
              <AvatarImage src={currentUser?.image || undefined} />
              <AvatarFallback className="bg-nude-200 text-nude-700 text-xl font-bold">
                {getInitials(session.user.name || '')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-nude-900 mb-1">
                خوش آمدید، {session.user.firstName} 👋
              </h1>
              <p className="text-nude-600 flex items-center gap-2">
                {session.user.isAdmin && <Badge className="badge-error">مدیر سیستم</Badge>}
                {session.user.isTechnicalDeputy && <Badge className="badge-neutral">معاون فنی</Badge>}
                {isStrategist && <Badge className="bg-info/10 text-info border border-info/30">استراتژیست</Badge>}
                {writerGroups.length > 0 && <Badge className="badge-success">نویسنده</Badge>}
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-nude-900">{currentUser?.totalPoints || 0}</p>
              <p className="text-xs text-nude-600">امتیاز</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/goals">
          <Card className="card-nude card-hover border-nude-200 cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nude-600 mb-1">اهداف من</p>
                  <p className="text-3xl font-bold text-nude-900">{myGoals}</p>
                </div>
                <Target className="w-10 h-10 text-nude-500" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tasks">
          <Card className="card-nude card-hover border-nude-200 cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nude-600 mb-1">وظایف فعال</p>
                  <p className="text-3xl font-bold text-warning">{myTasks}</p>
                </div>
                <ListTodo className="w-10 h-10 text-warning" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/messages">
          <Card className="card-nude card-hover border-nude-200 cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nude-600 mb-1">پیام‌های جدید</p>
                  <p className="text-3xl font-bold text-info">{unreadMessages}</p>
                </div>
                <MessageSquareText className="w-10 h-10 text-info" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/leaderboard">
          <Card className="card-nude card-hover border-nude-200 cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nude-600 mb-1">امتیاز من</p>
                  <p className="text-3xl font-bold text-success">{currentUser?.totalPoints || 0}</p>
                </div>
                <Trophy className="w-10 h-10 text-success" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Admin Quick Access */}
      {session.user.isAdmin && adminStats && (
        <Card className="border-nude-200 bg-gradient-to-br from-nude-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-nude-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-nude-500" />
                  پنل مدیریت
                </CardTitle>
                <CardDescription>دسترسی سریع به امکانات مدیریتی</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4 mb-4">
              <div className="p-4 bg-white rounded-xl border border-nude-200">
                <Users className="w-8 h-8 text-nude-500 mb-2" />
                <p className="text-2xl font-bold text-nude-900">{adminStats.totalUsers}</p>
                <p className="text-sm text-nude-600">کاربران</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-nude-200">
                <Goal className="w-8 h-8 text-nude-500 mb-2" />
                <p className="text-2xl font-bold text-nude-900">{adminStats.totalGoals}</p>
                <p className="text-sm text-nude-600">اهداف فعال</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-nude-200">
                <ListTodo className="w-8 h-8 text-nude-500 mb-2" />
                <p className="text-2xl font-bold text-nude-900">{adminStats.totalTasks}</p>
                <p className="text-sm text-nude-600">وظایف</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-nude-200">
                <Mail className="w-8 h-8 text-nude-500 mb-2" />
                <p className="text-2xl font-bold text-nude-900">{adminStats.totalMessages}</p>
                <p className="text-sm text-nude-600">پیام‌ها</p>
              </div>
            </div>
            
            <div className="grid gap-3 md:grid-cols-3">
              <Link href="/admin/dashboard" className="p-4 bg-white rounded-xl border border-nude-200 hover:bg-nude-50 hover:border-nude-300 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <PieChart className="w-6 h-6 text-nude-500" />
                  <ArrowRight className="w-4 h-4 text-nude-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-semibold text-nude-900">داشبورد تحلیلی</p>
                <p className="text-xs text-nude-600 mt-1">آمار و نمودارها</p>
              </Link>

              <Link href="/admin/goals" className="p-4 bg-white rounded-xl border border-nude-200 hover:bg-nude-50 hover:border-nude-300 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <Goal className="w-6 h-6 text-nude-500" />
                  <ArrowRight className="w-4 h-4 text-nude-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-semibold text-nude-900">مدیریت اهداف</p>
                <p className="text-xs text-nude-600 mt-1">تعیین و پیگیری اهداف</p>
              </Link>

              <Link href="/admin/roles" className="p-4 bg-white rounded-xl border border-nude-200 hover:bg-nude-50 hover:border-nude-300 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <UserRoundCog className="w-6 h-6 text-nude-500" />
                  <ArrowRight className="w-4 h-4 text-nude-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-semibold text-nude-900">ویرایش نقش‌ها</p>
                <p className="text-xs text-nude-600 mt-1">مدیریت دسترسی‌ها</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Features - Universal Section */}
      <Card className="border-nude-200">
        <CardHeader>
          <CardTitle className="text-nude-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-nude-500" />
            امکانات من
          </CardTitle>
          <CardDescription>دسترسی سریع به ویژگی‌های شما</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {/* Profile */}
            <Link href="/profile" className="p-4 bg-nude-50 rounded-xl border border-nude-200 hover:bg-nude-100 hover:border-nude-300 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <User className="w-6 h-6 text-nude-500" />
                <ArrowRight className="w-4 h-4 text-nude-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="font-semibold text-nude-900">پروفایل</p>
              <p className="text-xs text-nude-600 mt-1">مشاهده و ویرایش</p>
            </Link>

            {/* Goals */}
            <Link href="/goals" className="p-4 bg-nude-50 rounded-xl border border-nude-200 hover:bg-nude-100 hover:border-nude-300 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-6 h-6 text-nude-500" />
                <ArrowRight className="w-4 h-4 text-nude-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="font-semibold text-nude-900">اهداف من</p>
              <p className="text-xs text-nude-600 mt-1">{myGoals} هدف فعال</p>
            </Link>

            {/* Tasks */}
            <Link href="/tasks" className="p-4 bg-nude-50 rounded-xl border border-nude-200 hover:bg-nude-100 hover:border-nude-300 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <ListTodo className="w-6 h-6 text-warning" />
                <ArrowRight className="w-4 h-4 text-nude-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="font-semibold text-nude-900">وظایف</p>
              <p className="text-xs text-nude-600 mt-1">{myTasks} وظیفه در انتظار</p>
            </Link>

            {/* Messages */}
            <Link href="/messages" className="p-4 bg-nude-50 rounded-xl border border-nude-200 hover:bg-nude-100 hover:border-nude-300 transition-all group relative">
              <div className="flex items-center justify-between mb-2">
                <MessageSquareText className="w-6 h-6 text-info" />
                <ArrowRight className="w-4 h-4 text-nude-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="font-semibold text-nude-900">پیام‌ها</p>
              <p className="text-xs text-nude-600 mt-1">
                {unreadMessages > 0 ? `${unreadMessages} پیام جدید` : 'پیام‌های من'}
              </p>
              {unreadMessages > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {unreadMessages}
                </div>
              )}
            </Link>

            {/* Leaderboard */}
            <Link href="/leaderboard" className="p-4 bg-nude-50 rounded-xl border border-nude-200 hover:bg-nude-100 hover:border-nude-300 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-6 h-6 text-success" />
                <ArrowRight className="w-4 h-4 text-nude-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="font-semibold text-nude-900">رتبه‌بندی</p>
              <p className="text-xs text-nude-600 mt-1">{currentUser?.totalPoints || 0} امتیاز</p>
            </Link>

            {/* Evaluations */}
            <Link href="/evaluations/strategist" className="p-4 bg-nude-50 rounded-xl border border-nude-200 hover:bg-nude-100 hover:border-nude-300 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-6 h-6 text-nude-500" />
                <ArrowRight className="w-4 h-4 text-nude-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="font-semibold text-nude-900">ارزیابی استراتژیست</p>
              <p className="text-xs text-nude-600 mt-1">ثبت ارزیابی</p>
            </Link>

            <Link href="/evaluations/writer" className="p-4 bg-nude-50 rounded-xl border border-nude-200 hover:bg-nude-100 hover:border-nude-300 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-6 h-6 text-nude-500" />
                <ArrowRight className="w-4 h-4 text-nude-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="font-semibold text-nude-900">ارزیابی نویسنده</p>
              <p className="text-xs text-nude-600 mt-1">ثبت ارزیابی</p>
            </Link>

            {/* Feedback for Strategists */}
            {isStrategist && (
              <Link href="/feedback/send" className="p-4 bg-nude-50 rounded-xl border border-nude-200 hover:bg-nude-100 hover:border-nude-300 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <MessageSquareText className="w-6 h-6 text-nude-500" />
                  <ArrowRight className="w-4 h-4 text-nude-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-semibold text-nude-900">ارسال بازخورد</p>
                <p className="text-xs text-nude-600 mt-1">به نویسندگان</p>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* My Workgroups */}
      {(strategistGroups.length > 0 || writerGroups.length > 0) && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Strategist Workgroups */}
          {strategistGroups.length > 0 && (
            <Card className="border-nude-200">
              <CardHeader>
                <CardTitle className="text-nude-900 flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-info" />
                  کارگروه‌های استراتژیست
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {strategistGroups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-3 bg-nude-50 rounded-xl border border-nude-200">
                      <div>
                        <p className="font-semibold text-nude-900">{group.name}</p>
                        {group.description && (
                          <p className="text-sm text-nude-600 mt-1">{group.description}</p>
                        )}
                      </div>
                      <Badge className={group.isActive ? "badge-success" : "badge-neutral"}>
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
              <CardHeader>
                <CardTitle className="text-nude-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-success" />
                  کارگروه‌های نویسنده
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {writerGroups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-3 bg-nude-50 rounded-xl border border-nude-200">
                      <div>
                        <p className="font-semibold text-nude-900">{group.name}</p>
                        {group.description && (
                          <p className="text-sm text-nude-600 mt-1">{group.description}</p>
                        )}
                      </div>
                      <Badge className={group.isActive ? "badge-success" : "badge-neutral"}>
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
