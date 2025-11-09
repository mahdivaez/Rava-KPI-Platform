import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { TasksList } from "@/components/tasks/tasks-list"
import { ListTodo, CheckCircle2, Clock, AlertCircle } from "lucide-react"

export default async function TasksPage() {
  const session = await auth()
  if (!session) redirect('/login')

  // Check if user is strategist to show create button
  const isStrategist = await prisma.workgroupMember.findFirst({
    where: {
      userId: session.user.id,
      role: 'STRATEGIST',
    },
  })

  // Fetch tasks based on role
  let myTasks = []
  let createdTasks = []
  let writers = []
  let workgroups = []

  if (isStrategist) {
    // Strategist: see created tasks
    createdTasks = await prisma.task.findMany({
      where: { createdBy: session.user.id },
      include: {
        writer: true,
        workgroup: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get writers in strategist's workgroups
    const strategistWorkgroups = await prisma.workgroupMember.findMany({
      where: {
        userId: session.user.id,
        role: 'STRATEGIST',
      },
      include: {
        workgroup: {
          include: {
            members: {
              where: { role: 'WRITER' },
              include: { user: true },
            },
          },
        },
      },
    })

    writers = strategistWorkgroups.flatMap(wg =>
      wg.workgroup.members.map(m => m.user)
    )
    workgroups = strategistWorkgroups.map(wg => wg.workgroup)
  }

  // Writer: see assigned tasks
  myTasks = await prisma.task.findMany({
    where: { assignedTo: session.user.id },
    include: {
      creator: true,
      workgroup: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Stats
  const stats = {
    total: myTasks.length,
    pending: myTasks.filter(t => t.status === 'PENDING').length,
    inProgress: myTasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: myTasks.filter(t => t.status === 'COMPLETED').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-nude-900">وظایف</h1>
          <p className="text-nude-600 mt-1">
            {isStrategist ? 'مدیریت وظایف نویسندگان' : 'وظایف محول شده به شما'}
          </p>
        </div>
        {isStrategist && (
          <CreateTaskDialog
            writers={writers}
            workgroups={workgroups}
            strategistId={session.user.id}
          />
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-nude border-nude-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nude-700">کل وظایف</CardTitle>
            <ListTodo className="h-4 w-4 text-nude-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-nude-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="card-nude border-nude-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nude-700">در انتظار</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="card-nude border-nude-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nude-700">در حال انجام</CardTitle>
            <AlertCircle className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{stats.inProgress}</div>
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
      </div>

      {/* Tasks Tabs */}
      <Tabs defaultValue="my-tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-nude-100">
          <TabsTrigger value="my-tasks" className="data-[state=active]:bg-white">
            وظایف من ({myTasks.length})
          </TabsTrigger>
          {isStrategist && (
            <TabsTrigger value="created" className="data-[state=active]:bg-white">
              وظایف ایجاد شده ({createdTasks.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="my-tasks">
          <Card className="border-nude-200">
            <CardHeader>
              <CardTitle className="text-nude-900">وظایف محول شده</CardTitle>
              <CardDescription>لیست وظایف اختصاص داده شده به شما</CardDescription>
            </CardHeader>
            <CardContent>
              <TasksList tasks={myTasks} isCreator={false} />
            </CardContent>
          </Card>
        </TabsContent>

        {isStrategist && (
          <TabsContent value="created">
            <Card className="border-nude-200">
              <CardHeader>
                <CardTitle className="text-nude-900">وظایف ایجاد شده</CardTitle>
                <CardDescription>وظایفی که شما برای نویسندگان ایجاد کرده‌اید</CardDescription>
              </CardHeader>
              <CardContent>
                <TasksList tasks={createdTasks} isCreator={true} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

