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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">مدیریت کارگروه‌ها</h1>
          <p className="text-slate-600 mt-1">
            مشاهده و مدیریت کارگروه‌ها و اعضا
          </p>
        </div>
        <CreateWorkgroupDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>لیست کارگروه‌ها</CardTitle>
          <CardDescription>
            تعداد کل: {workgroups.length} کارگروه
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkgroupsTable workgroups={workgroups} users={users} />
        </CardContent>
      </Card>
    </div>
  )
}
