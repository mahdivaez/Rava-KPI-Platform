import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateGoalDialog } from "@/components/admin/create-goal-dialog"
import { GoalsTable } from "@/components/admin/goals-table"
import { Target, Users, Building2, TrendingUp } from "lucide-react"

export default async function GoalsPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect('/dashboard')

  // Fetch all goals with relations
  const goals = await prisma.goal.findMany({
    include: {
      user: true,
      workgroup: true,
      assigner: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Fetch all users and workgroups for the create dialog
  const users = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { firstName: 'asc' },
  })

  const workgroups = await prisma.workgroup.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  // Stats
  const stats = {
    total: goals.length,
    individual: goals.filter(g => g.type === 'INDIVIDUAL_BLOGGER' || g.type === 'INDIVIDUAL_BUSINESS').length,
    team: goals.filter(g => g.type === 'TEAM').length,
    company: goals.filter(g => g.type === 'COMPANY').length,
    completed: goals.filter(g => g.status === 'COMPLETED').length,
    inProgress: goals.filter(g => g.status === 'IN_PROGRESS').length,
  }

  // Filter goals by type
  const bloggerGoals = goals.filter(g => g.type === 'INDIVIDUAL_BLOGGER')
  const businessGoals = goals.filter(g => g.type === 'INDIVIDUAL_BUSINESS')
  const teamGoals = goals.filter(g => g.type === 'TEAM')
  const companyGoals = goals.filter(g => g.type === 'COMPANY')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-nude-900">مدیریت اهداف</h1>
          <p className="text-nude-600 mt-1">تعیین و پیگیری اهداف کاربران و تیم‌ها</p>
        </div>
        <CreateGoalDialog users={users} workgroups={workgroups} adminId={session.user.id} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-nude border-nude-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nude-700">کل اهداف</CardTitle>
            <Target className="h-4 w-4 text-nude-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-nude-900">{stats.total}</div>
            <p className="text-xs text-nude-500 mt-1">تعداد کل اهداف ثبت شده</p>
          </CardContent>
        </Card>

        <Card className="card-nude border-nude-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nude-700">اهداف فردی</CardTitle>
            <Users className="h-4 w-4 text-nude-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-nude-900">{stats.individual}</div>
            <p className="text-xs text-nude-500 mt-1">بلاگر و بیزینس</p>
          </CardContent>
        </Card>

        <Card className="card-nude border-nude-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nude-700">اهداف تیمی</CardTitle>
            <Building2 className="h-4 w-4 text-nude-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-nude-900">{stats.team}</div>
            <p className="text-xs text-nude-500 mt-1">اهداف کارگروه‌ها</p>
          </CardContent>
        </Card>

        <Card className="card-nude border-nude-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nude-700">در حال انجام</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.inProgress}</div>
            <p className="text-xs text-nude-500 mt-1">از {stats.total} هدف</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals Tables by Type */}
      <Tabs defaultValue="blogger" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-nude-100">
          <TabsTrigger value="blogger" className="data-[state=active]:bg-white">
            اهداف بلاگر ({bloggerGoals.length})
          </TabsTrigger>
          <TabsTrigger value="business" className="data-[state=active]:bg-white">
            اهداف بیزینس ({businessGoals.length})
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-white">
            اهداف تیمی ({teamGoals.length})
          </TabsTrigger>
          <TabsTrigger value="company" className="data-[state=active]:bg-white">
            اهداف شرکت ({companyGoals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blogger">
          <Card className="border-nude-200">
            <CardHeader>
              <CardTitle className="text-nude-900">اهداف بلاگرها</CardTitle>
              <CardDescription>اهداف فردی برای بلاگرها</CardDescription>
            </CardHeader>
            <CardContent>
              <GoalsTable goals={bloggerGoals} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card className="border-nude-200">
            <CardHeader>
              <CardTitle className="text-nude-900">اهداف بیزینس</CardTitle>
              <CardDescription>اهداف فردی برای بیزینس‌ها</CardDescription>
            </CardHeader>
            <CardContent>
              <GoalsTable goals={businessGoals} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card className="border-nude-200">
            <CardHeader>
              <CardTitle className="text-nude-900">اهداف تیمی</CardTitle>
              <CardDescription>اهداف کارگروه‌ها و تیم‌ها</CardDescription>
            </CardHeader>
            <CardContent>
              <GoalsTable goals={teamGoals} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card className="border-nude-200">
            <CardHeader>
              <CardTitle className="text-nude-900">اهداف شرکت</CardTitle>
              <CardDescription>اهداف کلی شرکت</CardDescription>
            </CardHeader>
            <CardContent>
              <GoalsTable goals={companyGoals} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

