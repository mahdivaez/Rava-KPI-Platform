import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { UsersTable } from "@/components/admin/users-table"
import { CreateUserDialog } from "@/components/admin/create-user-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function UsersPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect('/dashboard')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">مدیریت کاربران</h1>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 mt-1">
            مشاهده و مدیریت کاربران سیستم
          </p>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          <CreateUserDialog />
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg lg:text-xl">لیست کاربران</CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">
            تعداد کل: {users.length} کاربر
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <UsersTable users={users} />
        </CardContent>
      </Card>
    </div>
  )
}
