import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, CheckCircle2, Clock } from "lucide-react"

export default async function UserGoalsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  // Fetch user's personal goals
  const personalGoals = await prisma.goal.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    include: {
      assigner: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Fetch team goals (from user's workgroups)
  const userWorkgroups = await prisma.workgroupMember.findMany({
    where: { userId: session.user.id },
    select: { workgroupId: true },
  })

  const teamGoals = await prisma.goal.findMany({
    where: {
      workgroupId: { in: userWorkgroups.map(w => w.workgroupId) },
      isActive: true,
    },
    include: {
      workgroup: true,
      assigner: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Company goals
  const companyGoals = await prisma.goal.findMany({
    where: {
      type: 'COMPANY',
      isActive: true,
    },
    include: {
      assigner: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Stats
  const allGoals = [...personalGoals, ...teamGoals]
  const stats = {
    total: allGoals.length,
    completed: allGoals.filter(g => g.status === 'COMPLETED').length,
    inProgress: allGoals.filter(g => g.status === 'IN_PROGRESS').length,
    notStarted: allGoals.filter(g => g.status === 'NOT_STARTED').length,
  }

  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="badge-success"><CheckCircle2 className="w-3 h-3 ml-1" />تکمیل شده</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-info/10 text-info border border-info/30"><Clock className="w-3 h-3 ml-1" />در حال انجام</Badge>
      case "OVERDUE":
        return <Badge className="badge-error">عقب افتاده</Badge>
      default:
        return <Badge className="badge-neutral">شروع نشده</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-nude-900">اهداف من</h1>
        <p className="text-nude-600 mt-1">مشاهده و پیگیری اهداف فردی و تیمی</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-nude border-nude-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nude-700">کل اهداف</CardTitle>
            <Target className="h-4 w-4 text-nude-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-nude-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="card-nude border-nude-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nude-700">تکمیل شده</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card className="card-nude border-nude-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nude-700">در حال انجام</CardTitle>
            <TrendingUp className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card className="card-nude border-nude-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nude-700">شروع نشده</CardTitle>
            <Clock className="h-4 w-4 text-nude-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-nude-900">{stats.notStarted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Personal Goals */}
      {personalGoals.length > 0 && (
        <Card className="border-nude-200">
          <CardHeader>
            <CardTitle className="text-nude-900 flex items-center gap-2">
              <Target className="w-5 h-5" />
              اهداف فردی
            </CardTitle>
            <CardDescription>اهداف اختصاص داده شده به شما</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {personalGoals.map((goal) => {
              const progress = getProgress(goal.currentValue, goal.targetValue)
              const daysLeft = Math.ceil((new Date(goal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

              return (
                <div key={goal.id} className="p-4 bg-nude-50 rounded-xl border border-nude-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-nude-900 text-lg">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-sm text-nude-600 mt-1">{goal.description}</p>
                      )}
                    </div>
                    {getStatusBadge(goal.status)}
                  </div>

                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-nude-700">
                          {goal.currentValue} از {goal.targetValue} {goal.unit}
                        </span>
                        <span className="font-semibold text-nude-900">{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-nude-600">
                        مهلت: {new Date(goal.endDate).toLocaleDateString('fa-IR')}
                        {daysLeft > 0 && ` (${daysLeft} روز مانده)`}
                      </span>
                      <span className="text-nude-600">
                        تعیین شده توسط: {goal.assigner.firstName} {goal.assigner.lastName}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Team Goals */}
      {teamGoals.length > 0 && (
        <Card className="border-nude-200">
          <CardHeader>
            <CardTitle className="text-nude-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              اهداف تیمی
            </CardTitle>
            <CardDescription>اهداف کارگروه‌های شما</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamGoals.map((goal) => {
              const progress = getProgress(goal.currentValue, goal.targetValue)

              return (
                <div key={goal.id} className="p-4 bg-nude-50 rounded-xl border border-nude-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-nude-900 text-lg">{goal.title}</h3>
                        <Badge variant="outline" className="text-xs">{goal.workgroup?.name}</Badge>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-nude-600">{goal.description}</p>
                      )}
                    </div>
                    {getStatusBadge(goal.status)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-nude-700">
                        {goal.currentValue} از {goal.targetValue} {goal.unit}
                      </span>
                      <span className="font-semibold text-nude-900">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Company Goals */}
      {companyGoals.length > 0 && (
        <Card className="border-nude-200">
          <CardHeader>
            <CardTitle className="text-nude-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              اهداف شرکت
            </CardTitle>
            <CardDescription>اهداف کلی سازمان</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {companyGoals.map((goal) => {
              const progress = getProgress(goal.currentValue, goal.targetValue)

              return (
                <div key={goal.id} className="p-4 bg-gradient-to-br from-nude-50 to-white rounded-xl border border-nude-300">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-nude-900 text-lg">{goal.title}</h3>
                    {getStatusBadge(goal.status)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-nude-700">
                        {goal.currentValue.toFixed(0)} / {goal.targetValue} {goal.unit}
                      </span>
                      <span className="font-semibold text-nude-900">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {personalGoals.length === 0 && teamGoals.length === 0 && companyGoals.length === 0 && (
        <Card className="border-nude-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-16 h-16 text-nude-400 mb-4" />
            <h3 className="text-xl font-bold text-nude-900 mb-2">هیچ هدفی ثبت نشده</h3>
            <p className="text-nude-600 text-center max-w-md">
              در حال حاضر هیچ هدفی برای شما تعریف نشده است. با مدیر خود تماس بگیرید.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

