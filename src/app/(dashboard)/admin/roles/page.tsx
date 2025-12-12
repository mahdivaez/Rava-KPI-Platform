import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RolesTable } from "@/components/admin/roles-table"
import { UserCog } from "lucide-react"

export default async function RolesPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect('/dashboard')

  const users = await prisma.user.findMany({
    include: {
      workgroupMemberships: {
        include: {
          workgroup: true,
        },
      },
    },
    orderBy: { firstName: 'asc' },
  })

  const workgroups = await prisma.workgroup.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  // Stats
  const stats = {
    totalUsers: users.length,
    admins: users.filter(u => u.isAdmin).length,
    technicalDeputies: users.filter(u => u.isTechnicalDeputy).length,
    strategists: new Set(
      users.flatMap(u =>
        u.workgroupMemberships
          .filter(m => m.role === 'STRATEGIST')
          .map(m => u.id)
      )
    ).size,
    writers: new Set(
      users.flatMap(u =>
        u.workgroupMemberships
          .filter(m => m.role === 'WRITER')
          .map(m => u.id)
      )
    ).size,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-nude-900">ویرایش نقش‌های کاربران</h1>
        <p className="text-nude-600 mt-1">مدیریت دسترسی‌ها و نقش‌های کاربران سیستم</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="card-nude border-nude-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nude-700">کل کاربران</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-nude-900">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="card-nude border-nude-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nude-700">مدیران</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.admins}</div>
          </CardContent>
        </Card>

        <Card className="card-nude border-nude-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nude-700">معاونین فنی</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-nude-900">{stats.technicalDeputies}</div>
          </CardContent>
        </Card>

        <Card className="card-nude border-nude-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nude-700">استراتژیست‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{stats.strategists}</div>
          </CardContent>
        </Card>

        <Card className="card-nude border-nude-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-nude-700">نویسندگان</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.writers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Roles Table */}
      <Card className="border-nude-200">
        <CardHeader>
          <CardTitle className="text-nude-900 flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            مدیریت نقش‌ها
          </CardTitle>
          <CardDescription>ویرایش دسترسی‌های کاربران و تخصیص نقش‌های کارگروهی</CardDescription>
        </CardHeader>
        <CardContent>
          <RolesTable users={users} workgroups={workgroups} />
        </CardContent>
      </Card>
    </div>
  )
}

