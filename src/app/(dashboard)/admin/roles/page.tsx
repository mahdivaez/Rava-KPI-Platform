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
import { PageHeader } from "@/components/ui/page-header"
import { RoleBadge } from "@/components/ui/role-badge"
import { StatCard, StatGrid } from "@/components/ui/stat-card"
import { ShieldCheck, UserCog, Users } from "lucide-react"
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
      <PageHeader
        title="نقش‌ها و دسترسی‌ها"
        description="تخصیص نقش‌های کارگروهی و مدیریت سطوح دسترسی کاربران"
        icon={<UserCog />}
        breadcrumbs={[
          { label: "داشبورد", href: "/dashboard" },
          { label: "نقش‌ها و دسترسی‌ها" },
        ]}
      />

      {/* System-level access */}
      <StatGrid className="xl:grid-cols-3">
        <StatCard
          label="کل کاربران"
          value={users.length.toLocaleString("fa-IR")}
          icon={<Users />}
          tone="primary"
        />
        <StatCard
          label="مدیران سیستم"
          value={users.filter((u) => u.isAdmin).length.toLocaleString("fa-IR")}
          hint="دسترسی کامل به همه بخش‌ها"
          icon={<ShieldCheck />}
          tone="info"
        />
        <StatCard
          label="معاونین فنی"
          value={users
            .filter((u) => u.isTechnicalDeputy)
            .length.toLocaleString("fa-IR")}
          hint="ارزیابی استراتژیست‌ها"
          icon={<UserCog />}
          tone="neutral"
        />
      </StatGrid>

      {/* Team roles */}
      <Card>
        <CardHeader>
          <CardTitle>پراکندگی نقش‌های تیمی</CardTitle>
          <CardDescription>
            تعداد افراد یکتا در هر نقش، در همه کارگروه‌ها
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TEAM_ROLES.map((role) => (
              <li
                key={role}
                className="rounded-xl border border-border bg-surface-sunken p-4"
              >
                <RoleBadge role={role} size="sm" />
                <p
                  data-numeric
                  className="mt-2.5 font-display text-2xl font-bold text-foreground"
                >
                  {roleCounts[role].toLocaleString("fa-IR")}
                </p>
                <p className="text-xs text-foreground-muted">نفر</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Roles table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>مدیریت نقش‌ها</CardTitle>
          <CardDescription>
            ویرایش دسترسی‌های کاربران و تخصیص نقش‌های کارگروهی
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0 sm:px-0">
          <RolesTable users={users} workgroups={workgroups} />
        </CardContent>
      </Card>

      {/* Evaluation permission matrix */}
      <Card>
        <CardHeader>
          <CardTitle>ماتریس دسترسی ارزیابی</CardTitle>
          <CardDescription>هر نقش اجازه ارزیابی کدام نقش‌ها را دارد</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border-subtle">
            {TEAM_ROLES.map((role) => (
              <li
                key={role}
                className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-5"
              >
                <div className="sm:w-44 sm:shrink-0">
                  <RoleBadge role={role} size="sm" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {EVALUATION_MATRIX[role].map((target) => (
                    <Badge key={target} variant="outline" size="sm">
                      {getRoleLabel(target)}
                    </Badge>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
