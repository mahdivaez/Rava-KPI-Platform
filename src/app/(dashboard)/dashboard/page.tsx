import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const memberships = await prisma.workgroupMember.findMany({
    where: { userId: session.user.id },
    include: { workgroup: true },
  })

  const strategistGroups = memberships
    .filter(m => m.role === 'STRATEGIST')
    .map(m => m.workgroup)

  const writerGroups = memberships
    .filter(m => m.role === 'WRITER')
    .map(m => m.workgroup)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          خوش آمدید، {session.user.name}
        </h1>
        <p className="text-slate-600 mt-1">
          داشبورد اصلی سیستم مدیریت KPI
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {session.user.isAdmin && (
          <Badge className="bg-blue-500">مدیر سیستم</Badge>
        )}
        {session.user.isTechnicalDeputy && (
          <Badge className="bg-purple-500">معاون فنی</Badge>
        )}
        {strategistGroups.length > 0 && (
          <Badge variant="outline">
            استراتژیست ({strategistGroups.length} کارگروه)
          </Badge>
        )}
        {writerGroups.length > 0 && (
          <Badge variant="outline">
            نویسنده ({writerGroups.length} کارگروه)
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {strategistGroups.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">کارگروه‌های استراتژیست</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {strategistGroups.map(wg => (
                  <div
                    key={wg.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                  >
                    <span className="font-medium">{wg.name}</span>
                    <Badge variant="secondary">استراتژیست</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {writerGroups.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">کارگروه‌های نویسنده</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {writerGroups.map(wg => (
                  <div
                    key={wg.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                  >
                    <span className="font-medium">{wg.name}</span>
                    <Badge variant="secondary">نویسنده</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

