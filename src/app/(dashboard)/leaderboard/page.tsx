import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Award, TrendingUp, Star } from "lucide-react"

export default async function LeaderboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  // Fetch top users by points (all time)
  const topUsersAllTime = await prisma.user.findMany({
    where: {
      isActive: true,
      totalPoints: { gt: 0 },
    },
    orderBy: { totalPoints: 'desc' },
    take: 20,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      image: true,
      totalPoints: true,
      email: true,
    },
  })

  // Fetch top users this month
  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const monthlyPoints = await prisma.pointTransaction.groupBy({
    by: ['userId'],
    where: {
      createdAt: { gte: thisMonth },
    },
    _sum: {
      points: true,
    },
    orderBy: {
      _sum: {
        points: 'desc',
      },
    },
    take: 20,
  })

  // Fetch user details for monthly leaderboard
  const monthlyUserIds = monthlyPoints.map(p => p.userId)
  const monthlyUsers = await prisma.user.findMany({
    where: { id: { in: monthlyUserIds } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      image: true,
      email: true,
    },
  })

  const topUsersThisMonth = monthlyPoints.map(p => {
    const user = monthlyUsers.find(u => u.id === p.userId)
    return {
      ...user!,
      totalPoints: p._sum.points || 0,
    }
  })

  // Get current user's rank
  const currentUserRank = topUsersAllTime.findIndex(u => u.id === session.user.id) + 1
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totalPoints: true },
  })

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />
    return <span className="text-nude-600 font-bold">{rank}</span>
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-nude-900">جدول رتبه‌بندی</h1>
        <p className="text-nude-600 mt-1">برترین کاربران بر اساس امتیاز</p>
      </div>

      {/* Current User Stats */}
      <Card className="border-nude-200 bg-gradient-to-br from-nude-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-nude-600 mb-1">امتیاز شما</p>
                <p className="text-3xl font-bold text-nude-900">{currentUser?.totalPoints || 0}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-nude-600 mb-1">رتبه شما</p>
              <p className="text-3xl font-bold text-nude-900">
                {currentUserRank > 0 ? `#${currentUserRank}` : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="all-time" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-nude-100">
          <TabsTrigger value="all-time" className="data-[state=active]:bg-white">
            <Trophy className="w-4 h-4 ml-2" />
            کل زمان‌ها
          </TabsTrigger>
          <TabsTrigger value="monthly" className="data-[state=active]:bg-white">
            <TrendingUp className="w-4 h-4 ml-2" />
            این ماه
          </TabsTrigger>
        </TabsList>

        {/* All Time Leaderboard */}
        <TabsContent value="all-time">
          <Card className="border-nude-200">
            <CardHeader>
              <CardTitle className="text-nude-900">برترین کاربران</CardTitle>
              <CardDescription>رتبه‌بندی بر اساس کل امتیازات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topUsersAllTime.map((user, index) => {
                  const rank = index + 1
                  const isCurrentUser = user.id === session.user.id

                  return (
                    <div
                      key={user.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        rank <= 3
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                          : isCurrentUser
                          ? 'bg-primary/5 border-primary/30'
                          : 'bg-nude-50 border-nude-200'
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-12 flex items-center justify-center">
                        {getMedalIcon(rank)}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-12 w-12 border-2 border-nude-200">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback className="bg-nude-200 text-nude-700 font-bold">
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1">
                        <p className="font-semibold text-nude-900">
                          {user.firstName} {user.lastName}
                          {isCurrentUser && (
                            <Badge className="badge-neutral mr-2 text-xs">شما</Badge>
                          )}
                        </p>
                        <p className="text-sm text-nude-600">{user.email}</p>
                      </div>

                      {/* Points */}
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          <span className="text-2xl font-bold text-nude-900">{user.totalPoints}</span>
                        </div>
                        <p className="text-xs text-nude-600">امتیاز</p>
                      </div>
                    </div>
                  )
                })}

                {topUsersAllTime.length === 0 && (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-nude-400 mx-auto mb-4" />
                    <p className="text-nude-600">هنوز کاربری امتیازی کسب نکرده است</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Leaderboard */}
        <TabsContent value="monthly">
          <Card className="border-nude-200">
            <CardHeader>
              <CardTitle className="text-nude-900">برترین‌های ماه</CardTitle>
              <CardDescription>رتبه‌بندی بر اساس امتیازات این ماه</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topUsersThisMonth.map((user, index) => {
                  const rank = index + 1
                  const isCurrentUser = user.id === session.user.id

                  return (
                    <div
                      key={user.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border ${
                        rank <= 3
                          ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'
                          : isCurrentUser
                          ? 'bg-primary/5 border-primary/30'
                          : 'bg-nude-50 border-nude-200'
                      }`}
                    >
                      <div className="w-12 flex items-center justify-center">
                        {getMedalIcon(rank)}
                      </div>

                      <Avatar className="h-12 w-12 border-2 border-nude-200">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback className="bg-nude-200 text-nude-700 font-bold">
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <p className="font-semibold text-nude-900">
                          {user.firstName} {user.lastName}
                          {isCurrentUser && (
                            <Badge className="badge-neutral mr-2 text-xs">شما</Badge>
                          )}
                        </p>
                        <p className="text-sm text-nude-600">{user.email}</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-5 h-5 text-success" />
                          <span className="text-2xl font-bold text-success">+{user.totalPoints}</span>
                        </div>
                        <p className="text-xs text-nude-600">این ماه</p>
                      </div>
                    </div>
                  )
                })}

                {topUsersThisMonth.length === 0 && (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-nude-400 mx-auto mb-4" />
                    <p className="text-nude-600">این ماه هنوز امتیازی ثبت نشده است</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

