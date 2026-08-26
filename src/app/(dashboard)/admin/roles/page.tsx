import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RolesTable } from "@/components/admin/roles-table"
import { UserCog, Network } from "lucide-react"
import {
  EVALUATION_MATRIX,
  TEAM_ROLES,
  getRoleBadgeClass,
  getRoleLabel,
} from "@/lib/roles"

export default async function RolesPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect("/dashboard")

  const users = await prisma.user.findMany({
    include: {
      workgroupMemberships: {
        include: { workgroup: true },
      },
    },
    orderBy: { firstName: "asc" },
  })

  const workgroups = await prisma.workgroup.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  })

  // Distinct users per team role.
  const roleCounts = Object.fromEntries(
    TEAM_ROLES.map((role) => [
      role,
      new Set(
        users
          .filter((u) => u.workgroupMemberships.some((m) => m.role === role))
          .map((u) => u.id)
      ).size,
    ])
  ) as Record<(typeof TEAM_ROLES)[number], number>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-nude-900">ویرایش نقش‌های کاربران</h1>
        <p className="text-nude-600 mt-1">مدیریت دسترسی‌ها و نقش‌های کاربران سیستم</p>
      </div>

      {/* System-level roles */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        <Card className="card-nude border-nude-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-nude-700">کل کاربران</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-nude-900">{users.length}</div>
          </CardContent>
        </Card>
        <Card className="card-nude border-nude-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-nude-700">مدیران</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {users.filter((u) => u.isAdmin).length}
            </div>
          </CardContent>
        </Card>
        <Card className="card-nude border-nude-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-nude-700">معاونین فنی</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-nude-900">
              {users.filter((u) => u.isTechnicalDeputy).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team roles */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {TEAM_ROLES.map((role) => (
          <Card key={role} className="card-nude border-nude-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-nude-700">
                {getRoleLabel(role)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-nude-900">{roleCounts[role]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Roles Table */}
      <Card className="border-nude-200">
        <CardHeader>
          <CardTitle className="text-nude-900 flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            مدیریت نقش‌ها
          </CardTitle>
          <CardDescription>
            ویرایش دسترسی‌های کاربران و تخصیص نقش‌های کارگروهی
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RolesTable users={users} workgroups={workgroups} />
        </CardContent>
      </Card>

      {/* Evaluation permission matrix */}
      <Card className="border-nude-200">
        <CardHeader>
          <CardTitle className="text-nude-900 flex items-center gap-2">
            <Network className="w-5 h-5" />
            ماتریس دسترسی ارزیابی
          </CardTitle>
          <CardDescription>
            هر نقش اجازه ارزیابی کدام نقش‌ها را دارد
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {TEAM_ROLES.map((role) => (
            <div
              key={role}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 border-b border-nude-100 pb-3 last:border-0 last:pb-0"
            >
              <div className="sm:w-44 flex-shrink-0">
                <Badge className={`text-xs ${getRoleBadgeClass(role)}`}>
                  {getRoleLabel(role)}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {EVALUATION_MATRIX[role].map((target) => (
                  <Badge
                    key={target}
                    variant="outline"
                    className="text-xs border-nude-300 text-nude-700"
                  >
                    {getRoleLabel(target)}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
