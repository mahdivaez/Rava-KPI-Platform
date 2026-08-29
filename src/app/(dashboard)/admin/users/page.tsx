import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { UsersTable } from "@/components/admin/users-table"
import { CreateUserDialog } from "@/components/admin/create-user-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Users } from "lucide-react"

export default async function UsersPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect('/dashboard')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="مدیریت کاربران"
        description="مشاهده، افزودن و ویرایش حساب‌های کاربری سامانه"
        icon={<Users />}
        breadcrumbs={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "کاربران" },
        ]}
        actions={<CreateUserDialog />}
      />

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>لیست کاربران</CardTitle>
          <CardDescription>
            تعداد کل: {users.length.toLocaleString("fa-IR")} کاربر
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0 sm:px-0">
          <UsersTable users={users} />
        </CardContent>
      </Card>
    </div>
  )
}
