import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { WorkgroupsTable } from "@/components/admin/workgroups-table"
import { CreateWorkgroupDialog } from "@/components/admin/create-workgroup-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { FolderKanban } from "lucide-react"

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
      <PageHeader
        title="مدیریت کارگروه‌ها"
        description="کارگروه‌ها، اعضا و نقش‌های هر عضو"
        icon={<FolderKanban />}
        breadcrumbs={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "کارگروه‌ها" },
        ]}
        actions={<CreateWorkgroupDialog />}
      />

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>لیست کارگروه‌ها</CardTitle>
          <CardDescription>
            تعداد کل: {workgroups.length.toLocaleString("fa-IR")} کارگروه
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0 sm:px-0">
          <WorkgroupsTable workgroups={workgroups} users={users} />
        </CardContent>
      </Card>
    </div>
  )
}
