import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { WorkgroupsTable } from "@/components/admin/workgroups-table"
import { CreateWorkgroupDialog } from "@/components/admin/create-workgroup-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function WorkgroupsPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect('/dashboard')

  const workgroups = await prisma.workgroup.findMany({
    include: {
      members: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const users = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { firstName: 'asc' },
  })

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">مدیریت کارگروه‌ها</h1>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 mt-1">
            مشاهده و مدیریت کارگروه‌ها و اعضا
          </p>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          <CreateWorkgroupDialog />
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg lg:text-xl">لیست کارگروه‌ها</CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">
            تعداد کل: {workgroups.length} کارگروه
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <WorkgroupsTable workgroups={workgroups} users={users} />
        </CardContent>
      </Card>
    </div>
  )
}
